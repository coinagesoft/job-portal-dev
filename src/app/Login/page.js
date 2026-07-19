"use client";

import { useToast } from "@/components/Toast";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUser } from "@/store/authSlice";
import { sendOtp, verifyOtp } from "@/services/recruiter/authService";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/services/recruiter/authService";
import {
  CountrySelector,
  defaultCountries,
  parseCountry,
} from "react-international-phone";

import "react-international-phone/style.css";
// ── 6-box OTP input: auto-advances focus, supports backspace and paste ──
function OtpDigitsInput({ value, onChange, length = 6, disabled, autoFocus }) {
  const inputsRef = useRef([]);
  const digits = (value || "")
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  const focusInput = (idx) => inputsRef.current[idx]?.focus();

  const handleChange = (idx, raw) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    onChange(next.join("").slice(0, length));
    if (char && idx < length - 1) focusInput(idx + 1);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) focusInput(idx - 1);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      focusInput(Math.min(pasted.length, length - 1));
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }} onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="form-control"
          style={{
            width: 46,
            height: 54,
            padding: 0,
            textAlign: "center",
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 10,
          }}
        />
      ))}
    </div>
  );
}

// Proper email format check (not just "has @ and .").
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_COUNTRIES = defaultCountries.map((c) => {
  const parsed = parseCountry(c);

  const masks =
    typeof parsed.format === "string"
      ? [parsed.format]
      : parsed.format && typeof parsed.format === "object"
        ? Object.values(parsed.format)
        : [];

  const dotCounts = masks
    .map((m) =>
      typeof m === "string"
        ? (m.match(/\./g) || []).length
        : 0
    )
    .filter((n) => n > 0);

  return {
    iso2: parsed.iso2,
    name: parsed.name,
    code: `+${parsed.dialCode}`,
    dialCode: parsed.dialCode,
    minLen: dotCounts.length
      ? Math.min(...dotCounts)
      : 6,
    maxLen: dotCounts.length
      ? Math.max(...dotCounts)
      : 14,
  };
});

const getCountryMeta = (code) =>
  PHONE_COUNTRIES.find((c) => c.code === code) ||
  PHONE_COUNTRIES.find((c) => c.code === "+91") ||
  PHONE_COUNTRIES[0];
// Resend cooldown timer for the Send/Resend OTP button.
function useResendCooldown(seconds = 30) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  const start = () => {
    setRemaining(seconds);
  };

  const reset = () => {
    setRemaining(0);
  };

  return [remaining, start, reset];
}
function CountryCodeSelect({
  value,
  onChange,
  disabled,
}) {
  const meta = getCountryMeta(value);

  const handleCodeChange = (e) => {
    let raw = e.target.value;

    // Keep only + and digits
    raw = raw.replace(/[^\d+]/g, "");

    // Always ensure it starts with +
    if (!raw.startsWith("+")) {
      raw = `+${raw.replace(/\+/g, "")}`;
    }

    // Maximum country calling code is short,
    // but allow enough room while typing.
    raw = raw.slice(0, 5);

    onChange(raw);
  };

  const handleCodeBlur = () => {
    // Check whether entered code exactly matches
    // one of the available country calling codes.
    const matchedCountry = PHONE_COUNTRIES.find(
      (country) => country.code === value
    );

    // If invalid, return to the currently resolved/default country.
    if (!matchedCountry) {
      onChange(meta.code);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 54,
        borderRadius: 10,
        border:
          "1px solid var(--color-border-secondary)",
        background: disabled
          ? "#f7f7f7"
          : "#ffffff",
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      {/* FLAG + DROPDOWN */}
      <CountrySelector
        selectedCountry={meta.iso2}
        onSelect={(country) => {
          onChange(`+${country.dialCode}`);
        }}
        disabled={disabled}
        buttonStyle={{
          border: "none",
          borderRight:
            "1px solid var(--color-border-secondary)",
          background: "transparent",
          height: 52,
          padding: "0 6px",
        }}
      />

      {/* EDITABLE COUNTRY CODE */}
      <input
        type="text"
        inputMode="tel"
        value={value}
        onChange={handleCodeChange}
        onBlur={handleCodeBlur}
        disabled={disabled}
        aria-label="Country code"
        style={{
          width: 62,
          height: 52,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 14,
          fontWeight: 600,
          textAlign: "center",
          padding: "0 4px",
          color: "var(--color-text-primary)",
        }}
      />
    </div>
  );
}
export default function LoginPage() {
  const showToast = useToast();
  const [countryCode, setCountryCode] = useState("+91");
  const [input, setInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [
  resendCooldown,
  startResendCooldown,
  resetResendCooldown,
] = useResendCooldown(30);

  const dispatch = useDispatch();
  const router = useRouter();

  // Pre-fill the email/mobile when arriving from the invite-accept flow
  // (e.g. /Login?identifier=user@email.com), so the user just requests an OTP.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("identifier") || params.get("email");
    if (prefill) setInput(prefill);
  }, []);

  const { isLoading: authLoading, user } = useSelector((state) => state.auth);

  // ─────────────────────────────────────────────
  // Detect and validate Email / Mobile
  // ─────────────────────────────────────────────

  const trimmedInput = input.trim();

  // Email detection
  const isEmail = trimmedInput.includes("@");

  // Detect whether current input looks like a phone number
  const looksLikePhone =
    trimmedInput.length > 0 &&
    /^[\d\s+()-]+$/.test(trimmedInput);

  // Remove formatting characters from mobile
  const digitsOnly = input.replace(/\D/g, "");

  // Get validation rules for selected country
  const selectedCountryMeta = getCountryMeta(countryCode);

  // Validate mobile according to selected country
  const isMobileValid =
    looksLikePhone &&
    digitsOnly.length >= selectedCountryMeta.minLen &&
    digitsOnly.length <= selectedCountryMeta.maxLen;

  // Keep isMobile for your API logic
  const isMobile = looksLikePhone && isMobileValid;

  // Validate email
  const isEmailValid =
    isEmail && EMAIL_REGEX.test(trimmedInput);

  // Final input validation
  const isInputValid = isEmail
    ? isEmailValid
    : isMobileValid;

  // Dynamic validation message
  const getValidationMessage = () => {
    if (!input.trim()) {
      return "We'll send OTP to verify";
    }

    // EMAIL
    if (isEmail) {
      return isEmailValid
        ? "We'll send OTP to verify your email"
        : "Enter a complete, valid email address";
    }

    // MOBILE
    if (looksLikePhone) {
      if (!isMobileValid) {
        const requiredLength =
          selectedCountryMeta.minLen === selectedCountryMeta.maxLen
            ? `${selectedCountryMeta.minLen}`
            : `${selectedCountryMeta.minLen}-${selectedCountryMeta.maxLen}`;

        return `Enter a valid ${requiredLength}-digit mobile number for ${selectedCountryMeta.code}`;
      }

      return `We'll send OTP to verify ${selectedCountryMeta.code} ${digitsOnly}`;
    }

    return "Enter a valid email address or mobile number";
  };

  // Handle email or mobile input
  const handleInputChange = (e) => {
    const raw = e.target.value;

    // If letters or @ are present, treat as email input.
    // Otherwise keep only mobile digits.
    const hasLetterOrAt = /[a-zA-Z@]/.test(raw);

    if (hasLetterOrAt) {
      setInput(raw);
    } else {
      const digits = raw.replace(/\D/g, "");

      // Limit according to selected country's maximum length
      setInput(
        digits.slice(0, selectedCountryMeta.maxLen)
      );
    }

    setError("");
  };

// ─────────────────────────────────────────────
// CHANGE EMAIL / MOBILE
// ─────────────────────────────────────────────
const handleChangeIdentifier = () => {
  setOtpSent(false);
  setOtp("");
  setError("");
  resetResendCooldown();
};

  // Send OTP
  const handleSendOtp = async () => {
    try {

      
      setLoading(true);
      setError("");

      const response = await sendOtp({
        identifier: isMobile ? digitsOnly : input,
        countryCode: isMobile ? countryCode : null,
        userType: "Both",
      });

      if (!response.data.success) {
        setError(response.data.message);
        return;
      }

      setOtpSent(true);
      startResendCooldown();

      showToast(
        response.data.message,
        "success"
      );
    } catch (error) {
      setError(
        error?.response?.data?.message ||
        "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };


  // Login
  const handleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await verifyOtp({
        identifier: isMobile ? digitsOnly : input,
        countryCode: isMobile ? countryCode : null,
        otpCode: otp,
        userType: "Both",
      });

      console.log("VERIFY RESPONSE", response);

      if (!response.data.success) {
        setError(response.data.message);
        return;
      }
      dispatch(
        setUser({
          user: {
            userId: response.data.userId,
            employerId: response.data.employerId,
            userName: response.data.userName,

            role: response.data.userType === "Recruiter"
              ? "employer"
              : "candidate",
            isSubUser: response.data.isSubUser ?? false,
            canSearchCandidates: response.data.canSearchCandidates ?? true,
            canUnlockProfiles: response.data.canUnlockProfiles ?? true,
            canPostJobs: response.data.canPostJobs ?? true,
            canManageApplications: response.data.canManageApplications ?? true,
          },

          token: response.data.token,
        })
      );
      console.log("response" + response)
      localStorage.setItem(
        "token",
        response.data.token
      );
      if (response.data.userType === "Candidate" && response.data.candidateId) {
        localStorage.setItem("candidateId", response.data.candidateId);
      }
      if (response.data.employerId) {
        localStorage.setItem("employerId", response.data.employerId);
      }

      showToast(
        response.data.message || "Login successful!",
        "success"
      );

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirectTo");
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (response.data.userType === "Recruiter") {
        router.push("/employeer/cv-search");
      } else {
        router.push("/candidate-profile");
      }
    }
    catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Login failed"
      );
    }
    finally {
      setLoading(false);
    }
  };


  const googleSignIn = useGoogleLogin({
    flow: "implicit",

    onSuccess: async (tokenResponse) => {

      console.log("GOOGLE SUCCESS", tokenResponse);
      console.log("BEFORE API CALL");
      try {
        const response = await googleLogin({
          accessToken: tokenResponse.access_token,
          userType: "Both",
        });
        console.log("AFTER API CALL", response);


        if (!response.data.success) {
          setError(response.data.message);
          return;
        }

        dispatch(
          setUser({
            user: {
              userId: response.data.userId,
              employerId: response.data.employerId,
              userName: response.data.userName,
              role:
                response.data.userType === "Recruiter"
                  ? "employer"
                  : "candidate",
            },
            token: response.data.token,
          })
        );

        localStorage.setItem(
          "token",
          response.data.token
        );
        if (response.data.userType === "Candidate" && response.data.candidateId) {
          localStorage.setItem("candidateId", response.data.candidateId);
        }
        if (response.data.employerId) {
          localStorage.setItem("employerId", response.data.employerId);
        }

        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirectTo");
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (response.data.userType === "Recruiter") {
          router.push("/employeer/cv-search");
        } else {
          router.push("/candidate-profile");
        }

      } catch (err) {
        setError(
          err?.response?.data?.message ||
          "Google login failed"
        );
      }
    }


  });

  const handleLinkedInLogin = () => {
    const clientId =
      process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;

    const redirectUri =
      encodeURIComponent(
        "https://job-portal-dev-phi.vercel.app/linkedin/callback"
      );

    const scope =
      encodeURIComponent(
        "openid profile email"
      );

    window.location.href =
      `https://www.linkedin.com/oauth/v2/authorization` +
      `?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}`;
  };
  
  return (
    <main
      className="main content-page"
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src="/assets/imgs/page/login-register/img-1.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 24,
          left: 28,
          width: "min(140px, 24vw)",
          opacity: 0.55,
          pointerEvents: "none",
          userSelect: "none",
          filter: "grayscale(1) brightness(0.45) contrast(1.12)",
        }}
      />
      <img
        src="/assets/imgs/page/login-register/img-4.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 26,
          right: 36,
          width: "min(130px, 23vw)",
          opacity: 0.5,
          pointerEvents: "none",
          userSelect: "none",
          filter: "grayscale(1) brightness(0.45) contrast(1.12)",
        }}
      />
      <img
        src="/assets/imgs/page/login-register/img-6.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 20,
          left: 34,
          width: "min(105px, 18vw)",
          opacity: 0.45,
          pointerEvents: "none",
          userSelect: "none",
          filter: "grayscale(1) brightness(0.45) contrast(1.12)",
        }}
      />
      <img
        src="/assets/imgs/page/login-register/img-5.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 18,
          bottom: -6,
          width: "min(150px, 26vw)",
          opacity: 0.5,
          pointerEvents: "none",
          userSelect: "none",
          filter: "grayscale(1) brightness(0.45) contrast(1.12)",
        }}
      />
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Card */}
        <div
          className="auth-shadow-card"
          style={{
            background: "#ffffff",
            border: "none",
            borderRadius: 24,
            padding: "38px 34px",
            overflow: "hidden",
            marginBottom: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "#ff9900",
                marginBottom: 10,
              }}
            >
              <img src="assets/imgs/template/logo.svg" />

            </div>

            <h1
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: 10,
                lineHeight: 1.2,
              }}
            >
              Access Your Portal
            </h1>

            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                color: "var(--color-text-secondary)",
              }}
            >
              Enter email or mobile → OTP → Sign In

            </p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Error */}
            {error && (
              <div
                style={{
                  marginBottom: 18,
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "#FCEBEB",
                  border: "1px solid #F7C1C1",
                  color: "#A32D2D",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* Input */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              >
                Email or Mobile Number
                <span style={{ color: "#E24B4A" }}> *</span>
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {looksLikePhone && (
                  <CountryCodeSelect
                    value={countryCode}
                    onChange={(newCountryCode) => {
                      setCountryCode(newCountryCode);

                      const newMeta = getCountryMeta(newCountryCode);

                      // Trim existing mobile number if the newly
                      // selected country allows fewer digits
                      if (looksLikePhone) {
                        setInput((prev) =>
                          prev
                            .replace(/\D/g, "")
                            .slice(0, newMeta.maxLen)
                        );
                      }

                      setError("");
                    }}
                    disabled={otpSent}
                  />
                )}

                {/* EMAIL / MOBILE INPUT */}
                <div
                  style={{
                    position: "relative",
                    flex: 1,
                  }}
                >
                  <i
                    className={
                      looksLikePhone
                        ? "fi-rr-phone-call"
                        : "fi-rr-envelope"
                    }
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 15,
                      color: "var(--color-text-tertiary)",
                      pointerEvents: "none",
                    }}
                  />

                  <input
                    className="form-control"
                    value={input}
                    disabled={otpSent}
                    onChange={handleInputChange}
                    placeholder={
                      looksLikePhone
                        ? "Enter mobile number"
                        : "Enter email or mobile"
                    }
                    style={{
                      width: "100%",
                      height: 54,
                      borderRadius: 10,
                      border: `1px solid ${input
                        ? isInputValid
                          ? "#3B6D11"
                          : "var(--color-border-secondary)"
                        : "var(--color-border-secondary)"
                        }`,
                      fontSize: 14,
                      padding: "0 42px",
                      background: otpSent
                        ? "#f7f7f7"
                        : "#ffffff",
                    }}
                  />
                </div>
              </div>

              <small
                style={{
                  display: "block",
                  marginTop: 8,
                  fontSize: 12,
                  color:
                    input && !isInputValid
                      ? "#E24B4A"
                      : "var(--color-text-tertiary)",
                }}
              >
                {getValidationMessage()}
              </small>
            </div>

            {/* Send OTP */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={
                  !isInputValid || loading || (otpSent && resendCooldown > 0)
                }
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 10,
                  border: "1px solid #ff9900",
                  background:
                    otpSent && resendCooldown > 0 ? "#f7f7f7" : "#ffffff",
                  color: otpSent && resendCooldown > 0 ? "#b9884d" : "#ff9900",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor:
                    otpSent && resendCooldown > 0 ? "not-allowed" : "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!(otpSent && resendCooldown > 0)) {
                    e.target.style.background = "#ff9900";
                    e.target.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(otpSent && resendCooldown > 0)) {
                    e.target.style.background = "#fff";
                    e.target.style.color = "#ff9900";
                  }
                }}
              >
                {loading && (
                  <span
                    aria-hidden="true"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid currentColor",
                      borderTopColor: "transparent",
                      display: "inline-block",
                      animation: "loginOtpSpin 0.7s linear infinite",
                    }}
                  />
                )}
                {loading
                  ? "Sending…"
                  : !otpSent
                    ? "Send OTP"
                    : resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : "Resend OTP"}
              </button>
              <style jsx>{`
                @keyframes loginOtpSpin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>

            {/* OTP */}
            {otpSent && (
              <div className="form-group" style={{ marginBottom: 22 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Enter OTP
                </label>
                <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: -2,
    marginBottom: 12,
  }}
>
  <p
    style={{
      fontSize: 12,
      color: "var(--color-text-tertiary)",
      margin: 0,
    }}
  >
    Sent to{" "}
    <strong>
      {isMobile
        ? `${countryCode} ${input}`
        : input}
    </strong>
  </p>

  <button
    type="button"
    onClick={handleChangeIdentifier}
    style={{
      border: "none",
      background: "transparent",
      padding: 0,
      fontSize: 12,
      fontWeight: 600,
      color: "#ff9900",
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    {isMobile ? "Change number" : "Change email"}
  </button>
</div>

                <OtpDigitsInput value={otp} onChange={setOtp} autoFocus />
              </div>
            )}

            {/* Login Button */}
            {otpSent && otp.length === 6 && (
              <div className="form-group" style={{ marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading || authLoading}
                  style={{
                    width: "100%",
                    height: 54,
                    borderRadius: 10,
                    border: "none",
                    background: "#ff9900",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e68f00";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#ff9900";
                    e.target.style.transform = "translateY(0px)";
                  }}
                >
                  {loading || authLoading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "28px 0",
                gap: 14,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "#ececec",
                }}
              />

              <span
                style={{
                  fontSize: 13,
                  color: "var(--color-text-tertiary)",
                  fontWeight: 600,
                }}
              >
                OR
              </span>

              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "#ececec",
                }}
              />
            </div>

            {/* Social Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Google */}
              <button
                type="button"
                onClick={() => googleSignIn()}
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 10,
                  border: "1px solid #ffc151",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#122359",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ff9900";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(255,153,0,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.color = "#122359";
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="google"
                  width={20}
                  height={20}
                />
                Continue with Google
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={handleLinkedInLogin}
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 10,
                  border: "1px solid #ffc151",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#122359",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ff9900";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(255,153,0,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.color = "#122359";
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
                  alt="linkedin"
                  width={18}
                  height={18}
                />
                Continue with LinkedIn
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: 28,
              }}
            >
              <Link
                href="/register"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#ff9900",
                  transition: "all 0.25s ease",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#122359";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#ff9900";
                  e.currentTarget.style.transform = "translateY(0px)";
                }}
              >
                Don&apos;t have an account? Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}