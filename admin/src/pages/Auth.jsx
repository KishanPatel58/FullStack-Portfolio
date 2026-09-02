import React, { useState, useEffect, useRef, useCallback } from "react";
import { UseAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";

// ============================================================
// CHANGE THESE API ENDPOINTS TO MATCH YOUR BACKEND ROUTES
// ============================================================
const API = {
  login: "/api/auth/login",

  verifyEmail: "/api/auth/verifyemail",

  resendEmailOtp: "/api/auth/resendotp",

  forgotPassword: "/api/auth/forgotpasswordotp",

  verifyForgotOtp: "/api/auth/verifyforgotpasswordotp",

  resendForgotOtp: "/api/auth/resendforgotpasswordotp",

  resetPassword: "/api/auth/setnewpassword",

  logout: "/api/auth/logout",

  getAdmin: "/api/auth/getadmin",
};
const VALID_FORM_TYPES = [
  "login",
  "verifyotp",
  "forgotpassword",
  "verifyforgototp",
  "resetpassword",
];

const RESEND_SECONDS = 20;
const OTP_LENGTH = 6;

const Auth = () => {
  const { setAdmin, saveAdmin } = UseAdmin();
  const navigate = useNavigate();

  // ---------- Persistent form type ----------
  const [formType, setFormType] = useState(() => {
    const stored = localStorage.getItem("authFormType");
    if (stored && VALID_FORM_TYPES.includes(stored)) return stored;
    return "login";
  });

  // ---------- Persistent email ----------
  const [authEmail, setAuthEmail] = useState(
    () => localStorage.getItem("authEmail") || ""
  );

  // ---------- Fields ----------
  const [email, setEmail] = useState(
    () => localStorage.getItem("authEmail") || ""
  );
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);

  // ---------- UI ----------
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  // ---------- Helpers ----------
  const changeForm = (type) => {
    if (!VALID_FORM_TYPES.includes(type)) type = "login";
    setFormType(type);
    localStorage.setItem("authFormType", type);
    setError("");
    setSuccess("");
  };

  const updateAuthEmail = (value) => {
    setAuthEmail(value);
    localStorage.setItem("authEmail", value);
  };

  const clearAuthEmail = () => {
    setAuthEmail("");
    localStorage.removeItem("authEmail");
  };

  const clearOtp = () => setOtp(Array(OTP_LENGTH).fill(""));
  const getOtpString = () => otp.join("");

  const startCountdown = useCallback(() => {
    const expiresAt = Date.now() + RESEND_SECONDS * 1000;
    localStorage.setItem("authResendExpiresAt", String(expiresAt));
    setCountdown(RESEND_SECONDS);
  }, []);

  const clearCountdownStorage = () => {
    localStorage.removeItem("authResendExpiresAt");
    setCountdown(0);
  };

  // Validate formType on mount
  useEffect(() => {
    const stored = localStorage.getItem("authFormType");
    if (!stored || !VALID_FORM_TYPES.includes(stored)) {
      changeForm("login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown survives refresh
  useEffect(() => {
    const isOtpForm =
      formType === "verifyotp" || formType === "verifyforgototp";
    if (!isOtpForm) return;

    const tick = () => {
      const raw = localStorage.getItem("authResendExpiresAt");
      if (!raw) {
        setCountdown(0);
        return;
      }
      const remaining = Math.max(
        0,
        Math.ceil((Number(raw) - Date.now()) / 1000)
      );
      setCountdown(remaining);
      if (remaining <= 0) {
        localStorage.removeItem("authResendExpiresAt");
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [formType]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ---------- OTP input logic ----------
  const handleOtpChange = (index, value) => {
    const digits = value.replace(/\D/g, "");

    // Cleared
    if (!digits) {
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      return;
    }

    const next = [...otp];

    // User typed/pasted multiple digits into one box
    if (digits.length > 1) {
      for (let i = 0; i < digits.length && index + i < OTP_LENGTH; i++) {
        next[index + i] = digits[i];
      }
      setOtp(next);
      const focusTo = Math.min(index + digits.length, OTP_LENGTH - 1);
      requestAnimationFrame(() => {
        otpRefs.current[focusTo]?.focus();
        otpRefs.current[focusTo]?.select?.();
      });
      return;
    }

    // Single digit
    next[index] = digits;
    setOtp(next);

    if (index < OTP_LENGTH - 1) {
      requestAnimationFrame(() => {
        otpRefs.current[index + 1]?.focus();
        otpRefs.current[index + 1]?.select?.();
      });
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...otp];

      if (next[index]) {
        // Clear current box
        next[index] = "";
        setOtp(next);
        return;
      }

      // Move to previous box and clear it
      if (index > 0) {
        next[index - 1] = "";
        setOtp(next);
        requestAnimationFrame(() => {
          otpRefs.current[index - 1]?.focus();
        });
      }
      return;
    }

    // Optional: arrow navigation
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);

    const focusTo = Math.min(pasted.length, OTP_LENGTH - 1);
    requestAnimationFrame(() => {
      otpRefs.current[focusTo]?.focus();
    });
  };


  // ============================================================
  // API HANDLERS
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      // loginAdmin → { email, password }
      const { data } = await api.post(
        API.login,
        {
          email: email.trim().toLowerCase(),
          password,
        },
        { withCredentials: true }
      );

      if (!data?.success) {
        setError(data?.message || "Login failed. Please check your credentials.");
        return;
      }

      updateAuthEmail(email.trim().toLowerCase());
      setPassword("");
      clearOtp();
      startCountdown();
      changeForm("verifyotp");
      setSuccess(data?.message || "OTP sent to your email. Please verify to continue.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = getOtpString();
    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // verifyEmail → { otp, email }
      const { data } = await api.post(
        API.verifyEmail,
        {
          otp: code,
          email: authEmail,
        },
        { withCredentials: true }
      );

      if (!data?.success) {
        setError(data?.message || "Invalid or expired OTP.");
        return;
      }

      // Cookie token is set by backend.
      // Optionally load admin profile into context:
      try {
        const me = await api.get(API.getAdmin, { withCredentials: true });
        if (me?.data?.admin) setAdmin?.(me.data.admin);
      } catch {
        // ignore if getAdmin route differs; cookie session still works
      }

      try {
        const me = await api.get(API.getAdmin, { withCredentials: true });

        if (me?.data?.success && me?.data?.admin) {
          // Prefer saveAdmin from context (state + localStorage)
          if (typeof saveAdmin === "function") {
            saveAdmin(me.data.admin);
          } else {
            setAdmin(me.data.admin);
            localStorage.setItem("admin", JSON.stringify(me.data.admin));
          }
        }
      } catch {
        // verification succeeded but profile fetch failed —
        // still allow navigation; ProtectedRoute / context can re-fetch
      }

      clearOtp();
      clearCountdownStorage();
      changeForm("login");
      clearAuthEmail();
      setEmail("");
      setSuccess(data?.message || "Email verified successfully.");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resendLoading) return;

    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      // resendEmailOtp → { email }
      const { data } = await api.post(
        API.resendEmailOtp,
        { email: authEmail },
        { withCredentials: true }
      );

      if (!data?.success) {
        setError(data?.message || "Failed to resend OTP.");
        return;
      }

      clearOtp();
      startCountdown();
      setSuccess(data?.message || "A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // sendForgotPasswordOtp → { email }
      const { data } = await api.post(
        API.forgotPassword,
        { email: email.trim().toLowerCase() },
        { withCredentials: true }
      );

      // If backend still doesn't return JSON, this may fail — fix controller return first
      if (data && data.success === false) {
        setError(data?.message || "Failed to send reset code.");
        return;
      }

      updateAuthEmail(email.trim().toLowerCase());
      clearOtp();
      startCountdown();
      changeForm("verifyforgototp");
      setSuccess(data?.message || "Reset code sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = getOtpString();
    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // verifyForgotPasswordOtp → { email, otp }
      const { data } = await api.post(
        API.verifyForgotOtp,
        {
          email: authEmail,
          otp: code,
        },
        { withCredentials: true }
      );

      if (!data?.success) {
        setError(data?.message || "Invalid or expired reset code.");
        return;
      }

      clearOtp();
      clearCountdownStorage();
      changeForm("resetpassword");
      setSuccess(
        data?.message || "OTP verified successfully. You can now reset your password."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotPasswordOtp = async () => {
    if (countdown > 0 || resendLoading) return;

    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      // resendForgotPasswordOtp → { email }
      const { data } = await api.post(
        API.resendForgotOtp,
        { email: authEmail },
        { withCredentials: true }
      );

      if (!data?.success) {
        setError(data?.message || "Failed to resend reset code.");
        return;
      }

      clearOtp();
      startCountdown();
      setSuccess(
        data?.message || "A new password reset OTP has been sent to your email."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend reset code.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    // matches setNewPassword controller (min 8)
    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      // setNewPassword → { email, password, confirmPassword }
      const { data } = await api.put(
        API.resetPassword,
        {
          email: authEmail,
          password: newPassword,
          confirmPassword,
        },
        { withCredentials: true }
      );

      if (!data?.success) {
        setError(data?.message || "Failed to reset password.");
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
      clearOtp();
      clearCountdownStorage();
      clearAuthEmail();
      setEmail("");
      changeForm("login");
      setSuccess(
        data?.message ||
        "Password updated successfully. Please login with your new password."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Shared classNames (your original design) ----------
  const inputClassName = `
    border border-gray-300
    bg-white/40
    outline-4 outline-transparent
    focus:outline-[#9ca3af]
    focus:border-transparent
    text-gray-700
    p-[6px_20px]
    placeholder:text-gray-500
    rounded-lg
    text-lg
    w-full
    backdrop-blur-sm
    transition-all duration-300
  `;

  const primaryBtnClassName = `
    h-auto
    text-white
    text-xl
    bg-[#4b5563]
    hover:bg-[#374151]
    flex items-center
    justify-center
    gap-2
    p-[5px_10px]
    rounded-lg
    disabled:bg-gray-400
    w-1/2
    transition-all
    duration-200
  `;

  const secondaryBtnClassName = `
    h-auto
    text-white
    text-xl
    bg-[#6b7280]
    hover:bg-[#4b5563]
    flex items-center
    justify-center
    gap-2
    p-[5px_10px]
    rounded-lg
    disabled:bg-gray-400
    w-1/2
    transition-all
    duration-200
  `;

  const fullWidthPrimaryBtn = primaryBtnClassName.replace("w-1/2", "w-full");
  const fullWidthSecondaryBtn = secondaryBtnClassName.replace("w-1/2", "w-full");

  // ---------- Shared UI bits in your style ----------
  const MessageBanner = () => (
    <>
      {error && (
        <p className="w-full text-sm text-red-600 bg-red-50/80 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="w-full text-sm text-green-700 bg-green-50/80 border border-green-200 rounded-lg px-3 py-2">
          {success}
        </p>
      )}
    </>
  );

  const OtpInputs = () => (
    <div
      className="w-full flex items-center justify-between gap-1 sm:gap-2"
      onPaste={handleOtpPaste}
    >
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (otpRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(index, e)}
          className="
            w-10 h-11 sm:w-12 sm:h-12
            text-center text-lg font-semibold text-gray-700
            border border-gray-300 bg-white/40
            outline-4 outline-transparent
            focus:outline-[#9ca3af] focus:border-transparent
            rounded-lg backdrop-blur-sm
            transition-all duration-300
          "
        />
      ))}
    </div>
  );

  const ResendBlock = ({ onResend }) => (
    <div className="w-full text-center text-sm text-gray-600">
      {countdown > 0 ? (
        <p>
          Resend OTP in{" "}
          <span className="font-semibold text-[#4b5563]">
            {formatTime(countdown)}
          </span>
        </p>
      ) : (
        <button
          type="button"
          onClick={onResend}
          disabled={resendLoading}
          className="font-semibold text-[#4b5563] hover:text-[#374151] underline disabled:opacity-50"
        >
          {resendLoading ? "Sending..." : "Resend OTP"}
        </button>
      )}
    </div>
  );

  // ---------- Forms ----------
  const renderLogin = () => (
    <>
      <h1 className="text-[#4b5563] text-[10vw] font-semibold sm:text-7xl sm:mb-4">
        Login
      </h1>

      <MessageBanner />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Your Email"
        className={inputClassName}
        required
        autoComplete="email"
      />

      <div className="w-full relative flex items-center">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          placeholder="Your Password"
          className={inputClassName}
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-1/2 -translate-y-1/2 right-[8px] text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={() => {
            setEmail(authEmail || email);
            changeForm("forgotpassword");
          }}
          className="text-sm text-[#4b5563] hover:text-[#374151] underline"
        >
          Forgot Password?
        </button>
      </div>

      <div className="w-full flex justify-start items-start gap-2">
        <button
          disabled={loading}
          type="submit"
          className={primaryBtnClassName}
        >
          {loading && (
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
          )}
          {loading ? (
            <span>
              Submitting<span className="animate-pulse">...</span>
            </span>
          ) : (
            "Login"
          )}
        </button>

        <button
          onClick={() => {
            setEmail("");
            setPassword("");
            setError("");
            setSuccess("");
          }}
          disabled={loading}
          type="button"
          className={secondaryBtnClassName}
        >
          Reset
        </button>
      </div>
    </>
  );

  const renderVerifyOtp = () => (
    <>
      <h1 className="text-[#4b5563] text-[8vw] font-semibold sm:text-5xl sm:mb-2 text-center">
        Verify Your Email
      </h1>
      <p className="w-full text-center text-gray-600 text-sm sm:text-base">
        OTP sent to <span className="font-semibold">{authEmail}</span>
      </p>

      <MessageBanner />
      <OtpInputs />
      <ResendBlock onResend={handleResendOtp} />

      <button type="submit" disabled={loading} className={fullWidthPrimaryBtn}>
        {loading && (
          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
        )}
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          clearOtp();
          changeForm("login");
        }}
        className={fullWidthSecondaryBtn}
      >
        Back to Login
      </button>
    </>
  );

  const renderForgotPassword = () => (
    <>
      <h1 className="text-[#4b5563] text-[8vw] font-semibold sm:text-5xl sm:mb-2 text-center">
        Forgot Password
      </h1>
      <p className="w-full text-center text-gray-600 text-sm sm:text-base">
        Enter your email to receive a reset code
      </p>

      <MessageBanner />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Your Email"
        className={inputClassName}
        required
        autoComplete="email"
      />

      <button type="submit" disabled={loading} className={fullWidthPrimaryBtn}>
        {loading && (
          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
        )}
        {loading ? "Sending..." : "Send OTP"}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => changeForm("login")}
        className={fullWidthSecondaryBtn}
      >
        Back to Login
      </button>
    </>
  );

  const renderVerifyForgotOtp = () => (
    <>
      <h1 className="text-[#4b5563] text-[8vw] font-semibold sm:text-5xl sm:mb-2 text-center">
        Verify Reset Code
      </h1>
      <p className="w-full text-center text-gray-600 text-sm sm:text-base">
        Code sent to <span className="font-semibold">{authEmail}</span>
      </p>

      <MessageBanner />
      <OtpInputs />
      <ResendBlock onResend={handleResendForgotPasswordOtp} />

      <button type="submit" disabled={loading} className={fullWidthPrimaryBtn}>
        {loading && (
          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
        )}
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          clearOtp();
          changeForm("forgotpassword");
        }}
        className={fullWidthSecondaryBtn}
      >
        Back
      </button>
    </>
  );

  const renderResetPassword = () => (
    <>
      <h1 className="text-[#4b5563] text-[8vw] font-semibold sm:text-5xl sm:mb-2 text-center">
        Reset Password
      </h1>
      <p className="w-full text-center text-gray-600 text-sm sm:text-base">
        Set a new password for <span className="font-semibold">{authEmail}</span>
      </p>

      <MessageBanner />

      <div className="w-full relative flex items-center">
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type={showNewPassword ? "text" : "password"}
          placeholder="New Password"
          className={inputClassName}
          required
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute top-1/2 -translate-y-1/2 right-[8px] text-gray-500 hover:text-gray-700"
        >
          {showNewPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <div className="w-full relative flex items-center">
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          className={inputClassName}
          required
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute top-1/2 -translate-y-1/2 right-[8px] text-gray-500 hover:text-gray-700"
        >
          {showConfirmPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>

      <button type="submit" disabled={loading} className={fullWidthPrimaryBtn}>
        {loading && (
          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
        )}
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </>
  );

  const onSubmitByFormType = {
    login: handleLogin,
    verifyotp: handleVerifyOtp,
    forgotpassword: handleForgotPassword,
    verifyforgototp: handleVerifyForgotPasswordOtp,
    resetpassword: handleResetPassword,
  };

  return (
    <div
      className='w-full min-h-screen flex items-center justify-center
      bg-[url("/login-bg-mobile.png")] bg-cover bg-center
      sm:bg-[url("/login-bg.png")]
      sm:justify-start sm:px-[2.5vw]
      md:px-[5vw]'
    >
      <form
        onSubmit={onSubmitByFormType[formType] || handleLogin}
        className="h-full w-[90%] flex items-center justify-center flex-col gap-4 relative
        sm:w-[50vh] md:w-[60vh]"
      >
        {formType === "login" && renderLogin()}
        {formType === "verifyotp" && renderVerifyOtp()}
        {formType === "forgotpassword" && renderForgotPassword()}
        {formType === "verifyforgototp" && renderVerifyForgotOtp()}
        {formType === "resetpassword" && renderResetPassword()}
      </form>
    </div>
  );
};

export default Auth;