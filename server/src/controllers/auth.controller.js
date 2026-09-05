import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import crypto from "crypto";
import sendMail from "../config/email.config.js";

async function checkPassword({ givenPassword, passwordInDb }) {
    return bcrypt.compare(givenPassword, passwordInDb);
}

const verificationOtpTemplate = ({ otp, name = "User" }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  font-family: Arial, Helvetica, sans-serif;
">

  <div style="
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 15px;
  ">

    <!-- Main Card -->
    <div style="
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    ">

      <!-- Header -->
      <div style="
        padding: 40px 30px;
        text-align: center;
        background: linear-gradient(135deg, #111111, #333333);
        color: #ffffff;
      ">

        <h1 style="
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        ">
          Verify Your Email
        </h1>

        <p style="
          margin: 10px 0 0;
          color: #d4d4d4;
          font-size: 15px;
        ">
          One step away from getting started
        </p>

      </div>

      <!-- Content -->
      <div style="
        padding: 40px 30px;
        text-align: center;
      ">

        <h2 style="
          color: #1f2937;
          font-size: 22px;
          margin: 0 0 15px;
        ">
          Hello, ${name}! 👋
        </h2>

        <p style="
          color: #6b7280;
          font-size: 16px;
          line-height: 1.7;
          margin: 0 auto 30px;
          max-width: 450px;
        ">
          Use the verification code below to verify your email address.
          This code will expire in <strong>15 minutes</strong>.
        </p>

        <!-- OTP -->
        <div style="
          display: inline-block;
          padding: 20px 30px;
          border-radius: 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          letter-spacing: 10px;
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 30px;
        ">
          ${otp}
        </div>

        <p style="
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        ">
          For security reasons, never share this verification code with anyone.
        </p>

      </div>

      <!-- Divider -->
      <div style="
        height: 1px;
        background: #e5e7eb;
        margin: 0 30px;
      "></div>

      <!-- Footer -->
      <div style="
        padding: 25px 30px;
        text-align: center;
      ">

        <p style="
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        ">
          If you didn't request this verification, you can safely ignore this email.
        </p>

        <p style="
          color: #b0b0b0;
          font-size: 12px;
          margin: 20px 0 0;
        ">
          © ${new Date().getFullYear()} Your Website Name. All rights reserved.
        </p>

      </div>

    </div>

  </div>

</body>
</html>
  `;
};

const forgotPasswordOtpTemplate = ({ otp, name = "User" }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  font-family: Arial, Helvetica, sans-serif;
">

  <div style="
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 15px;
  ">

    <div style="
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    ">

      <!-- Header -->
      <div style="
        padding: 40px 30px;
        text-align: center;
        background: linear-gradient(135deg, #111111, #333333);
        color: #ffffff;
      ">

        <h1 style="
          margin: 0;
          font-size: 28px;
        ">
          Reset Your Password
        </h1>

        <p style="
          margin: 10px 0 0;
          color: #d4d4d4;
          font-size: 15px;
        ">
          We received a password reset request
        </p>

      </div>

      <!-- Content -->
      <div style="
        padding: 40px 30px;
        text-align: center;
      ">

        <h2 style="
          color: #1f2937;
          font-size: 22px;
          margin: 0 0 15px;
        ">
          Hello, ${name}! 👋
        </h2>

        <p style="
          color: #6b7280;
          font-size: 16px;
          line-height: 1.7;
          margin: 0 auto 30px;
          max-width: 450px;
        ">
          Use the password reset code below to continue.
          This code will expire in <strong>15 minutes</strong>.
        </p>

        <!-- OTP -->
        <div style="
          display: inline-block;
          padding: 20px 30px;
          border-radius: 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          letter-spacing: 10px;
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 30px;
        ">
          ${otp}
        </div>

        <p style="
          color: #9ca3af;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        ">
          Never share this code with anyone. Our team will never ask you for your verification code.
        </p>

      </div>

      <div style="
        height: 1px;
        background: #e5e7eb;
        margin: 0 30px;
      "></div>

      <!-- Footer -->
      <div style="
        padding: 25px 30px;
        text-align: center;
      ">

        <p style="
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        ">
          If you didn't request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>

        <p style="
          color: #b0b0b0;
          font-size: 12px;
          margin: 20px 0 0;
        ">
          © ${new Date().getFullYear()} Your Website Name. All rights reserved.
        </p>

      </div>

    </div>

  </div>

</body>
</html>
  `;
};

function generateTokenAndSetToSession({ res, id }) {
    const adminId = id.toString();
    const jti = crypto.randomBytes(16).toString("hex");

    const accessToken = jwt.sign(
        { admin: { _id: adminId }, jti },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { admin: { _id: adminId }, jti },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );

    res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
        path: "/",
    });

    return { accessToken, refreshToken };
}

function generateSecureOtp(otp) {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
}

export const loginAdmin = async (req, res) => { // done
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        }).select("+password");

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const isMatch = await checkPassword({
            givenPassword: password,
            passwordInDb: admin.password,
        });

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Store hashed OTP
        admin.otp = generateSecureOtp(otp);

        // OTP expires in 15 minutes
        admin.otpExpiresIn = new Date(
            Date.now() + 15 * 60 * 1000
        );

        admin.isVerified = false;

        await admin.save();

        // TODO: Send `otp` to admin's email
        // Html Template to send email.
        const html = verificationOtpTemplate({ otp, name: admin.name })
        await Admin.findByIdAndUpdate(admin._id, {
            $set: {
                otp: generateSecureOtp(otp),
                otpExpiresIn: new Date(Date.now() + 15 * 60 * 1000),
                isVerified: false,
            },
            $unset: {
                refreshToken: 1,
                refreshTokenExpiresIn: 1,
            },
        });
        const emails = {
            email: admin.email,
            subject: "Email Verification Otp",
            text: "Use this verification code for login to your account.",
            html: html
        }
        await sendMail({
            email: emails.email,
            html: emails.html,
            text: emails.text,
            subject: emails.subject
        })
        return res.status(200).json({
            success: true,
            message: "OTP sent to your email.",
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to login.",
        });
    }
};


export const verifyEmail = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        success: false,
        message: "OTP and email are required.",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    }).select("+otp +otpExpiresIn +refreshToken +refreshTokenExpiresIn");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (!admin.otp || !admin.otpExpiresIn || admin.otpExpiresIn < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    const hashedOtp = generateSecureOtp(String(otp));
    if (admin.otp !== hashedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Create new access + refresh tokens
    const { accessToken, refreshToken } = generateTokenAndSetToSession({
      res,
      id: admin._id,
    });

    // Cookie options (must match auth middleware)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    // Access token cookie (15 minutes)
    res.cookie("token", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // Refresh token cookie (30 days) — used if access cookie is missing/expired
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const refreshTokenExpiresIn = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    // Force-save session in DB
    const updated = await Admin.findByIdAndUpdate(
      admin._id,
      {
        $set: {
          isVerified: true,
          refreshToken,
          refreshTokenExpiresIn,
        },
        $unset: {
          otp: 1,
          otpExpiresIn: 1,
        },
      },
      { new: true }
    ).select("+refreshToken +refreshTokenExpiresIn");

    if (!updated?.refreshToken) {
      return res.status(500).json({
        success: false,
        message: "Failed to create session. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Problem verifying your email.",
    });
  }
};

export const logoutAdmin = async (req, res) => {
    try {
        const accessToken = req.cookies?.token;

        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET, {
                    ignoreExpiration: true,
                });
                const adminId = decoded?.admin?._id;
                if (adminId) {
                    await Admin.findByIdAndUpdate(adminId, {
                        $unset: { refreshToken: 1, refreshTokenExpiresIn: 1 },
                        $set: { isVerified: false },
                    });
                }
            } catch {
                // ignore
            }
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successfully.",
        });
    } catch (error) {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
        return res.status(200).json({
            success: true,
            message: "Logout successfully.",
        });
    }
};

// Send Forgot Password Otp
export const sendForgotPasswordOtp = async (req, res) => { //done
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(401).json({
                success: false,
                message: "Email is Required."
            })
        }
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email."
            })
        }
        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Store hashed OTP
        admin.otp = generateSecureOtp(otp);

        // OTP expires in 15 minutes
        admin.otpExpiresIn = new Date(
            Date.now() + 15 * 60 * 1000
        );

        admin.isVerified = false;

        await admin.save();
        const html = forgotPasswordOtpTemplate({ otp, name: admin.name })
        const emails = {
            email: admin.email,
            subject: "Email Verification Otp",
            text: "Use this verification code for Reset Password.",
            html: html
        }
        // send email for verify email.
        await sendMail({
            email: emails.email,
            html: emails.html,
            text: emails.text,
            subject: emails.subject
        })
        return res.status(200).json({
            success: true,
            message: "forgot password email verification mail send."
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Problem to Send Reset Password Otp."
        })
    }
}

// Verify Forgot Password Otp
export const verifyForgotPasswordOtp = async (req, res) => { //done
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required.",
            });
        }

        // Find admin
        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        }).select("+otp +otpExpiresIn +isForgotPasswordOtpVerified");

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Check whether OTP exists
        if (!admin.otp || !admin.otpExpiresIn) {
            return res.status(400).json({
                success: false,
                message: "OTP is invalid or has expired.",
            });
        }

        // Check OTP expiration
        if (admin.otpExpiresIn < new Date()) {
            // Remove expired OTP
            admin.otp = undefined;
            admin.otpExpiresIn = undefined;

            await admin.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired.",
            });
        }

        // Hash OTP entered by user
        const hashedOtp = generateSecureOtp(otp.toString());

        // Compare OTP
        if (admin.otp !== hashedOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        // OTP successfully verified

        // Remove OTP so it cannot be reused
        admin.otp = undefined;
        admin.otpExpiresIn = undefined;

        // Allow password reset
        admin.isForgotPasswordOtpVerified = true;

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now reset your password.",
        });

    } catch (error) {
        console.error(
            "Forgot Password OTP Verification Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Problem verifying forgot password OTP.",
        });
    }
};

// Set new Password
export const setNewPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        // Validate input
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All Fields are required.",
            });
        }

        // Check passwords
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match.",
            });
        }

        // Optional: password length validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters.",
            });
        }

        // Find admin and explicitly select required fields
        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        }).select(
            "+password +isForgotPasswordOtpVerified"
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Check whether forgot-password OTP was verified
        if (!admin.isForgotPasswordOtpVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify the forgot password OTP first.",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password
        admin.password = hashedPassword;

        // Remove reset permission
        // Important: prevents reusing the previous OTP verification
        admin.isForgotPasswordOtpVerified = false;

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully. Please login with your new password.",
        });

    } catch (error) {
        console.error("Set New Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Problem updating password.",
        });
    }
};

// Get Admin.
export const getAdmin = async (req, res) => {
    try {
        if (!req.admin) {
            return res.json({
                success: false,
                admin: null,
                message: "Not authenticated",
            });
        }
        const adminId = req.admin._id || req.admin.id;
        const admin = await Admin.findById(adminId)
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Cannot get Admin Data."
            })
        }
        return res.status(200).json({
            success: true,
            message: "Admin Fetched Successfully",
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                about: admin.about
            }
        })
    } catch (error) {
        console.error(`Failed to Fetch Admin Data: ${error}`);
        return res.status(400).json({
            success: false,
            message: "Failed to Fetch Admin Details..."
        })
    }
}

// Resend Login / Email Verification OTP
export const resendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Generate a new 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Store hashed OTP
        admin.otp = generateSecureOtp(otp);

        // OTP expires in 15 minutes
        admin.otpExpiresIn = new Date(Date.now() + 15 * 60 * 1000);

        // Keep verification pending until OTP is verified
        admin.isVerified = false;

        await admin.save();

        const html = verificationOtpTemplate({
            otp,
            name: admin.name,
        });

        await sendMail({
            email: admin.email,
            subject: "Email Verification OTP",
            text: "Use this verification code to complete your login.",
            html,
        });

        return res.status(200).json({
            success: true,
            message: "A new OTP has been sent to your email.",
        });
    } catch (error) {
        console.error("Resend Email OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to resend verification OTP.",
        });
    }
};

// Resend Forgot Password OTP
export const resendForgotPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const admin = await Admin.findOne({
            email: email.toLowerCase(),
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Generate a new 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Store hashed OTP
        admin.otp = generateSecureOtp(otp);

        // OTP expires in 15 minutes
        admin.otpExpiresIn = new Date(Date.now() + 15 * 60 * 1000);

        // Reset forgot-password verification flag until new OTP is verified
        admin.isForgotPasswordOtpVerified = false;

        await admin.save();

        const html = forgotPasswordOtpTemplate({
            otp,
            name: admin.name,
        });

        await sendMail({
            email: admin.email,
            subject: "Password Reset OTP",
            text: "Use this verification code to reset your password.",
            html,
        });

        return res.status(200).json({
            success: true,
            message: "A new password reset OTP has been sent to your email.",
        });
    } catch (error) {
        console.error("Resend Forgot Password OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to resend password reset OTP.",
        });
    }
};