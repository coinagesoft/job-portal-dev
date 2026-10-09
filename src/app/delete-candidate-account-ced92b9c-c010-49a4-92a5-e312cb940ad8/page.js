"use client";

// ============================================================================
//  Public "Delete my account" page (for the Google Play Console
//  "Data deletion" / "Delete account URL" field).
//
//  Put this file at:
//    src/app/delete-candidate-account-ced92b9c-c010-49a4-92a5-e312cb940ad8/page.js
//
//  Live URL will be:
//    https://<your-domain>/delete-candidate-account-ced92b9c-c010-49a4-92a5-e312cb940ad8
//
//  No login / token is needed. Flow:
//    1. enter registered mobile number OR email  -> OTP is sent
//    2. enter the OTP                            -> account is deleted
// ============================================================================

import React, { useEffect, useRef, useState } from "react";
import api from "@/services/api";

// ── Edit these two if needed (shown to the Play Store reviewer) ──────────────
const APP_NAME = "Job Portal";
const DEVELOPER_NAME = "";

// ── Theme tokens (same as the rest of the site) ─────────────────────────────
const T = {
  navy: "#122359",
  orange: "#ffa300",
  orangeLight: "#ffc151",
  text: "#4f5e64",
  muted: "#66789c",
  border: "#e8ecf0",
  bg: "#f5f7fa",
  white: "#fff",
  success: "#3b6d11",
  successBg: "#eaf3de",
  error: "#a32d2d",
  errorBg: "#fcebeb",
};

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA / Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
];

const SEND_URL = "/api/candidate/account-deletion/send-otp";
const CONFIRM_URL = "/api/candidate/account-deletion/confirm";
const RESEND_SECONDS = 30;

// Works whether the shared axios instance returns the full response or
// already unwraps it to the body.
const bodyOf = (res) => res?.data ?? res ?? {};

const errorMessage = (err) => {
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return String(first);
  }
  if (data && typeof data === "object") {
    const first = Object.values(data).flat()[0];
    if (typeof first === "string") return first;
  }
  return err?.message || "Something went wrong. Please try again.";
};

// ── Small UI helpers ─────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  height: 48,
  padding: "0 14px",
  borderRadius: 8,
  border: `1.5px solid ${T.border}`,
  fontSize: 15,
  color: T.navy,
  background: T.white,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: T.navy,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const focusOn = (e) => (e.target.style.borderColor = T.orangeLight);
const focusOff = (e) => (e.target.style.borderColor = T.border);

const Button = ({ children, variant = "primary", disabled, ...props }) => {
  const variants = {
    primary: { background: T.orange, color: T.white, border: "none" },
    danger: { background: T.error, color: T.white, border: "none" },
    ghost: {
      background: T.white,
      color: T.navy,
      border: `1.5px solid ${T.border}`,
    },
  };
  return (
    <button
      disabled={disabled}
      {...props}
      style={{
        width: "100%",
        padding: "14px 22px",
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        lineHeight: 1,
        ...variants[variant],
      }}
    >
      {children}
    </button>
  );
};

const Alert = ({ kind = "error", children }) => (
  <div
    role={kind === "error" ? "alert" : "status"}
    style={{
      padding: "12px 14px",
      borderRadius: 8,
      fontSize: 14,
      marginBottom: 16,
      background: kind === "error" ? T.errorBg : T.successBg,
      color: kind === "error" ? T.error : T.success,
      border: `1px solid ${kind === "error" ? T.error : T.success}`,
    }}
  >
    {children}
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DeleteCandidateAccountPage() {
  const [step, setStep] = useState(1); // 1 = enter mobile/email, 2 = enter OTP, 3 = done
  const [mode, setMode] = useState("mobile"); // "mobile" | "email"
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [maskedTo, setMaskedTo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    document.title = `Delete your account – ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  const identifier = mode === "mobile" ? mobile.replace(/\D/g, "") : email.trim();

  const identifierError = () => {
    if (mode === "mobile") {
      if (identifier.length < 7 || identifier.length > 12)
        return "Please enter a valid mobile number (digits only).";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const sendOtp = async () => {
    setError("");
    setInfo("");

    const bad = identifierError();
    if (bad) {
      setError(bad);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(SEND_URL, {
        identifier,
        countryCode: mode === "mobile" ? countryCode : null,
      });
      const body = bodyOf(res);

      if (body.success === false) {
        setError(body.message || "Unable to send OTP.");
        return;
      }

      setMaskedTo(body.maskedIdentifier || identifier);
      setInfo(
        mode === "mobile"
          ? "If an account exists for this mobile number, an OTP has been sent by SMS."
          : "If an account exists for this email, an OTP has been sent to it."
      );
      setOtp("");
      setCooldown(RESEND_SECONDS);
      setStep(2);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setError("");

    if (!/^\d{4,10}$/.test(otp.trim())) {
      setError("Please enter the OTP you received.");
      return;
    }
    if (!agree) {
      setError("Please tick the box to confirm you want to delete your account.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(CONFIRM_URL, {
        identifier,
        countryCode: mode === "mobile" ? countryCode : null,
        otpCode: otp.trim(),
      });
      const body = bodyOf(res);

      if (body.success === false) {
        setError(body.message || "Unable to delete the account.");
        return;
      }

      setStep(3);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || loading) return;
    await sendOtp();
  };

  const changeDetails = () => {
    setStep(1);
    setOtp("");
    setError("");
    setInfo("");
    setAgree(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        padding: "32px 16px 56px",
        fontFamily: "inherit",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: T.orange,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            {APP_NAME} · {DEVELOPER_NAME}
          </div>
          <h1 style={{ color: T.navy, fontSize: 26, margin: "0 0 8px" }}>
            Delete your account
          </h1>
          <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>
            Candidate accounts of the {APP_NAME} app. Verify your mobile number
            or email with an OTP and your account will be deleted.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "24px 22px",
            marginBottom: 20,
          }}
        >
          {step === 3 ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: T.successBg,
                  color: T.success,
                  fontSize: 28,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                ✓
              </div>
              <h2 style={{ color: T.navy, fontSize: 20, margin: "0 0 8px" }}>
                Your account has been deleted
              </h2>
              <p style={{ color: T.text, fontSize: 14, margin: 0 }}>
                Your personal data has been removed as described below. You can
                close this page.
              </p>
            </div>
          ) : (
            <>
              {error && <Alert kind="error">{error}</Alert>}
              {info && step === 2 && <Alert kind="success">{info}</Alert>}

              {step === 1 && (
                <>
                  <p style={{ color: T.navy, fontWeight: 700, margin: "0 0 14px" }}>
                    Step 1 of 2 · Enter the mobile number or email of your account
                  </p>

                  {/* Mobile / Email toggle */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                    {["mobile", "email"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMode(m);
                          setError("");
                        }}
                        style={{
                          flex: 1,
                          padding: "10px 0",
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: `1.5px solid ${mode === m ? T.orange : T.border}`,
                          background: mode === m ? T.orange : T.white,
                          color: mode === m ? T.white : T.muted,
                        }}
                      >
                        {m === "mobile" ? "Mobile number" : "Email"}
                      </button>
                    ))}
                  </div>

                  {mode === "mobile" ? (
                    <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 150, flexShrink: 0 }}>
                        <label style={labelStyle} htmlFor="cc">
                          Country
                        </label>
                        <select
                          id="cc"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          style={inputStyle}
                          onFocus={focusOn}
                          onBlur={focusOff}
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <label style={labelStyle} htmlFor="mobile">
                          Mobile number
                        </label>
                        <input
                          id="mobile"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="Registered mobile number"
                          maxLength={15}
                          style={inputStyle}
                          onFocus={focusOn}
                          onBlur={focusOff}
                          onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle} htmlFor="email">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Registered email address"
                        style={inputStyle}
                        onFocus={focusOn}
                        onBlur={focusOff}
                        onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                      />
                    </div>
                  )}

                  <Button onClick={sendOtp} disabled={loading}>
                    {loading ? "Sending OTP…" : "Send OTP"}
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <p style={{ color: T.navy, fontWeight: 700, margin: "0 0 4px" }}>
                    Step 2 of 2 · Verify OTP
                  </p>
                  <p style={{ color: T.muted, fontSize: 13, margin: "0 0 16px" }}>
                    OTP sent to <strong>{maskedTo}</strong>.{" "}
                    <button
                      type="button"
                      onClick={changeDetails}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: T.orange,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Change
                    </button>
                  </p>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle} htmlFor="otp">
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="6-digit OTP"
                      style={{
                        ...inputStyle,
                        letterSpacing: "0.3em",
                        fontSize: 18,
                        textAlign: "center",
                      }}
                      onFocus={focusOn}
                      onBlur={focusOff}
                    />
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 13,
                      color: T.text,
                      cursor: "pointer",
                      marginBottom: 18,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      style={{
                        width: 18,
                        height: 18,
                        marginTop: 1,
                        accentColor: T.error,
                        flexShrink: 0,
                      }}
                    />
                    I understand that deleting my account is permanent and
                    cannot be undone.
                  </label>

                  <Button
                    variant="danger"
                    onClick={confirmDelete}
                    disabled={loading || !otp}
                  >
                    {loading ? "Deleting…" : "Verify OTP & delete my account"}
                  </Button>

                  <div style={{ height: 10 }} />

                  <Button
                    variant="ghost"
                    onClick={resend}
                    disabled={cooldown > 0 || loading}
                  >
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* What happens — required by Google Play */}
        <div
          style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "20px 22px",
            fontSize: 13,
            color: T.text,
            lineHeight: 1.6,
          }}
        >
          <h2 style={{ color: T.navy, fontSize: 16, margin: "0 0 10px" }}>
            What happens when you delete your account
          </h2>

          <p style={{ margin: "0 0 6px", fontWeight: 700, color: T.navy }}>
            Deleted immediately
          </p>
          <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
            <li>Your name, photo, date of birth, gender and location details</li>
            <li>Your profile summary and preferences</li>
            <li>Uploaded CVs, generated CVs and documents</li>
            <li>Education, work experience and skills</li>
            <li>Saved jobs, notifications and push-notification tokens</li>
            <li>Your login access — you will no longer be able to sign in</li>
          </ul>

          <p style={{ margin: "0 0 6px", fontWeight: 700, color: T.navy }}>
            Kept (as required by law / for our records)
          </p>
          <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
            <li>
              Payment and invoice records, retained for tax and accounting
              requirements
            </li>
            <li>
              Job-application records that employers already received. They no
              longer show your personal details — your name appears as
              &ldquo;Deleted User&rdquo;
            </li>
          </ul>

          <p style={{ margin: 0 }}>
            Need help? Contact {DEVELOPER_NAME} support from the {APP_NAME} app
            or website.
          </p>
        </div>
      </div>
    </div>
  );
}