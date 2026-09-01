import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

const generateAndSetAccessToken = (res, id) => {
  const accessToken = jwt.sign(
    {
      admin: {
        _id: id,
      },
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  return accessToken;
};

export const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    let decodedAccessToken;

    try {
      // Normal verification
      decodedAccessToken = jwt.verify(
        accessToken,
        process.env.JWT_SECRET
      );

      req.admin = decodedAccessToken.admin;

      return next();

    } catch (error) {
      // Token has expired
      if (error.name !== "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token.",
        });
      }
    }

    // ==========================================
    // ACCESS TOKEN EXPIRED
    // ==========================================

    /*
      IMPORTANT:

      jwt.decode() only reads the token.
      It does NOT verify the signature.

      So first verify the signature while ignoring
      expiration, then use the decoded payload.
    */

    decodedAccessToken = jwt.verify(
      accessToken,
      process.env.JWT_SECRET,
      {
        ignoreExpiration: true,
      }
    );

    const adminId = decodedAccessToken?.admin?._id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // ==========================================
    // FIND ADMIN AND GET REFRESH TOKEN
    // ==========================================

    const admin = await Admin.findById(adminId).select(
      "+refreshToken +refreshTokenExpiresIn"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found.",
      });
    }

    // Check refresh token exists in database
    if (!admin.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Session has expired. Please login again.",
      });
    }

    // Check database refresh token expiry
    if (
      !admin.refreshTokenExpiresIn ||
      admin.refreshTokenExpiresIn < new Date()
    ) {
      admin.refreshToken = undefined;
      admin.refreshTokenExpiresIn = undefined;

      await admin.save();

      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return res.status(401).json({
        success: false,
        message: "Session has expired. Please login again.",
      });
    }

    // ==========================================
    // VERIFY REFRESH TOKEN
    // ==========================================

    let decodedRefreshToken;

    try {
      decodedRefreshToken = jwt.verify(
        admin.refreshToken,
        process.env.JWT_SECRET
      );

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please login again.",
      });
    }

    // ==========================================
    // SECURITY CHECK
    // ==========================================

    if (
      decodedRefreshToken?.admin?._id?.toString() !==
      admin._id.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    // ==========================================
    // GENERATE NEW ACCESS TOKEN
    // ==========================================

    const newAccessToken = generateAndSetAccessToken(
      res,
      admin._id
    );

    // Make admin available to next middleware/controller
    req.admin = {
      _id: admin._id,
    };

    // Optional if you want it later
    req.accessToken = newAccessToken;

    return next();

  } catch (error) {
    console.error("Authentication Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// Use ONLY for session check like getadmin
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.token;

    if (!accessToken) {
      req.admin = null;
      return next(); // no 401
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.admin = decoded.admin;
      return next();
    } catch (error) {
      // expired → try refresh (same idea as your main middleware), or soft-fail
      if (error.name !== "TokenExpiredError") {
        req.admin = null;
        return next();
      }
    }

    // ---- access token expired: try refresh (simplified) ----
    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
    } catch {
      req.admin = null;
      return next();
    }

    const adminId = decodedAccessToken?.admin?._id;
    if (!adminId) {
      req.admin = null;
      return next();
    }

    const admin = await Admin.findById(adminId).select(
      "+refreshToken +refreshTokenExpiresIn"
    );

    if (
      !admin?.refreshToken ||
      !admin.refreshTokenExpiresIn ||
      admin.refreshTokenExpiresIn < new Date()
    ) {
      req.admin = null;
      return next();
    }

    try {
      const decodedRefresh = jwt.verify(admin.refreshToken, process.env.JWT_SECRET);
      if (decodedRefresh?.admin?._id?.toString() !== admin._id.toString()) {
        req.admin = null;
        return next();
      }
    } catch {
      req.admin = null;
      return next();
    }

    generateAndSetAccessToken(res, admin._id);
    req.admin = { _id: admin._id };
    return next();
  } catch {
    req.admin = null;
    return next();
  }
};