import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const generateAndSetAccessToken = (res, id) => {
  const accessToken = jwt.sign(
    {
      admin: {
        _id: id.toString(),
      },
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  res.cookie("token", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  return accessToken;
};

/**
 * Try to restore session from:
 * 1) expired access token (decode admin id) + DB refreshToken
 * 2) OR refreshToken cookie (if access cookie is gone)
 *
 * Returns { admin } on success, or { error, clearCookies } on failure.
 */
const tryRefreshSession = async (req, res) => {
  const accessToken = req.cookies?.token;
  const refreshTokenCookie = req.cookies?.refreshToken;

  let adminId = null;

  // A) From expired / existing access token
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
      adminId = decoded?.admin?._id || null;
    } catch {
      // ignore — may still use refresh cookie
    }
  }

  // B) From refresh token cookie if no adminId yet
  if (!adminId && refreshTokenCookie) {
    try {
      const decodedRefresh = jwt.verify(
        refreshTokenCookie,
        process.env.JWT_SECRET
      );
      adminId = decodedRefresh?.admin?._id || null;
    } catch {
      return {
        error: "Invalid or expired refresh token. Please login again.",
        clearCookies: true,
      };
    }
  }

  if (!adminId) {
    return {
      error: "Authentication token is required.",
      clearCookies: false,
    };
  }

  const admin = await Admin.findById(adminId).select(
    "+refreshToken +refreshTokenExpiresIn"
  );

  if (!admin) {
    return {
      error: "Admin not found.",
      clearCookies: true,
    };
  }

  if (!admin.refreshToken) {
    return {
      error: "Session has expired. Please login again.",
      clearCookies: true,
    };
  }

  if (
    !admin.refreshTokenExpiresIn ||
    admin.refreshTokenExpiresIn < new Date()
  ) {
    admin.refreshToken = undefined;
    admin.refreshTokenExpiresIn = undefined;
    await admin.save();

    return {
      error: "Session has expired. Please login again.",
      clearCookies: true,
    };
  }

  // Prefer DB refresh token as source of truth
  let decodedRefreshToken;
  try {
    decodedRefreshToken = jwt.verify(admin.refreshToken, process.env.JWT_SECRET);
  } catch {
    return {
      error: "Invalid or expired refresh token. Please login again.",
      clearCookies: true,
    };
  }

  if (decodedRefreshToken?.admin?._id?.toString() !== admin._id.toString()) {
    return {
      error: "Invalid refresh token.",
      clearCookies: true,
    };
  }

  // If client sent refresh cookie, it should match DB (when present)
  if (refreshTokenCookie && refreshTokenCookie !== admin.refreshToken) {
    return {
      error: "Invalid refresh token.",
      clearCookies: true,
    };
  }

  generateAndSetAccessToken(res, admin._id);

  // Keep refresh cookie in sync (optional but recommended)
  res.cookie("refreshToken", admin.refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return {
    admin: { _id: admin._id },
  };
};

const clearAuthCookies = (res) => {
  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

// ============================================================
// STRICT AUTH — protected admin routes
// ============================================================
export const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.token;

    // 1) Valid access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.admin = decoded.admin;
        return next();
      } catch (error) {
        if (error.name !== "TokenExpiredError") {
          clearAuthCookies(res);
          return res.status(401).json({
            success: false,
            message: "Invalid authentication token.",
          });
        }
        // expired → fall through to refresh
      }
    }

    // 2) Missing or expired access token → try refresh
    const result = await tryRefreshSession(req, res);

    if (result.error) {
      if (result.clearCookies) {
        clearAuthCookies(res);
      }
      return res.status(401).json({
        success: false,
        message: result.error,
      });
    }

    req.admin = result.admin;
    return next();
  } catch (error) {
    console.error("Authentication Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// ============================================================
// OPTIONAL AUTH — getadmin / public session check
// ============================================================
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.token;

    // 1) Valid access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.admin = decoded.admin;
        return next();
      } catch (error) {
        if (error.name !== "TokenExpiredError") {
          req.admin = null;
          return next();
        }
        // expired → try refresh
      }
    }

    // 2) Missing or expired → soft refresh (no hard 401)
    const result = await tryRefreshSession(req, res);

    if (result.error) {
      req.admin = null;
      return next();
    }

    req.admin = result.admin;
    return next();
  } catch {
    req.admin = null;
    return next();
  }
};