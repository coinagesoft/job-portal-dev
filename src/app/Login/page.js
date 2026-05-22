"use client";

import { useToast } from "@/components/Toast";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/store/authSlice";
import {
  ROLE_DEFAULT_ROUTE,
  STATIC_ROLE_BY_MOBILE,
} from "@/constants/panelConfig";

export default function LoginPage() {
  const showToast = useToast();

  const [input, setInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const { isLoading: authLoading, user } = useSelector((state) => state.auth);

  // Detect input type
  const isEmail = input.includes("@");
  const isMobile = /^\d{10}$/.test(input.replace(/\D/g, ""));
  const normalizedMobile = input.replace(/\D/g, "").slice(-10);

  const isKnownDemoNumber = Boolean(STATIC_ROLE_BY_MOBILE[normalizedMobile]);

  useEffect(() => {
    if (!user?.role) return;

    router.replace(ROLE_DEFAULT_ROUTE[user.role] || "/Homepage");
  }, [router, user]);

  const isInputValid = isEmail
    ? input.includes("@") && input.includes(".")
    : isMobile;

  // Send OTP
  const sendOtp = () => {
    if (!isInputValid) {
      setError("Enter valid email or 10-digit mobile number.");
      return;
    }

    if (isMobile && !isKnownDemoNumber) {
      setError(
        "Only assigned demo numbers allowed: 1010101010 (Candidate), 2020202020 (Employer).",
      );
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    setGeneratedOtp(newOtp);
    setOtpSent(true);
    setError("");

    showToast(`OTP sent to ${isEmail ? "email" : "mobile"}: ${newOtp}`, "info");
  };

  // Login
  const handleSignIn = async () => {
    if (otp !== generatedOtp) {
      setError("Invalid OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await dispatch(
        loginUser({
          [isEmail ? "email" : "mobile"]: isEmail ? input : normalizedMobile,
          enteredOtp: otp,
          generatedOtp: generatedOtp,
        }),
      ).unwrap();

      showToast("Login successful! Redirecting...", "success");

      router.push(payload.redirectTo || "/Homepage");
    } catch (err) {
      setError(err || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="main"
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
          style={{
            background: "#ffffff",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: 18,
            padding: "38px 34px",
            boxShadow: "0 10px 35px rgba(0,0,0,0.05)",
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
              SkillBridge
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
              <br />
              Demo:
              <br />
              1010101010 (Candidate)
              <br />
              2020202020 (Employer)
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

              <input
                className="form-control"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError("");
                }}
                placeholder="Enter email or mobile"
                style={{
                  height: 54,
                  borderRadius: 10,
                  border: "1px solid var(--color-border-secondary)",
                  fontSize: 14,
                  padding: "0 16px",
                }}
              />

              <small
                style={{
                  display: "block",
                  marginTop: 8,
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                }}
              >
                {input && !isInputValid
                  ? isEmail
                    ? "Enter valid email"
                    : "Enter 10-digit mobile"
                  : isMobile && !isKnownDemoNumber
                    ? "Use demo numbers: 1010101010 / 2020202020"
                    : "We'll send OTP to verify"}
              </small>
            </div>

            {/* Send OTP */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <button
                type="button"
                onClick={sendOtp}
                disabled={!isInputValid || loading || otpSent}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 10,
                  border: "1px solid #ff9900",
                  background: otpSent ? "#f7f7f7" : "#ffffff",
                  color: "#ff9900",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  if (!otpSent) {
                    e.target.style.background = "#ff9900";
                    e.target.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!otpSent) {
                    e.target.style.background = "#fff";
                    e.target.style.color = "#ff9900";
                  }
                }}
              >
                {otpSent ? "OTP Sent" : "Send OTP"}
              </button>
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

                <input
                  className="form-control"
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  style={{
                    height: 54,
                    borderRadius: 10,
                    border: "1px solid var(--color-border-secondary)",
                    textAlign: "center",
                    letterSpacing: 4,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                />
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
                Don't have an account? Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
