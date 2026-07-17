"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  validateInvite,
  acceptInvite,
} from "@/services/recruiter/recruiterSubUserService";

const NAVY = "#122359";
const GOLD = "#ffa300";

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--color-border-secondary, #ffc151)",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: 10,
          background: "rgba(255,163,0,0.12)",
          color: GOLD,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
        }}
      >
        <i className={icon} aria-hidden="true" />
      </span>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            color: "var(--color-text-tertiary)",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvite() {
  const router = useRouter();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [token, setToken] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("token");

    if (!inviteToken) {
      setMessage("Invalid invitation link.");
      setLoading(false);
      return;
    }

    loadInvite(inviteToken);
  }, []);

  const loadInvite = async (inviteToken) => {
    try {
      const data = await validateInvite(inviteToken);

      setToken(inviteToken);
      setInvite(data);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Invalid or expired invitation link."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      setSubmitting(true);

      const data = await acceptInvite({
        token,
      });

      setSuccess(true);

      setMessage(data.message || "Invitation accepted successfully.");

      setTimeout(() => {
        router.push(`/Login?email=${encodeURIComponent(invite.email)}`);
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to accept invitation.");
    } finally {
      setSubmitting(false);
    }
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
      <style jsx>{`
        @keyframes acceptInviteSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

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

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
        <div
          className="auth-shadow-card"
          style={{
            background: "#ffffff",
            border: "none",
            borderRadius: 24,
            padding: "38px 34px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <img
              src="/assets/imgs/template/logo.svg"
              alt="JobBox"
              style={{ height: 34, marginBottom: 18 }}
            />

            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              {success
                ? "Invitation Accepted"
                : invite
                  ? "Accept Invitation"
                  : "Team Invitation"}
            </h1>

            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              {success
                ? "Redirecting you to sign in…"
                : invite
                  ? "Review the details below and join your team's recruiter account."
                  : "Loading your invitation…"}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "3px solid var(--color-border-secondary, #ffc151)",
                  borderTopColor: GOLD,
                  animation: "acceptInviteSpin 0.7s linear infinite",
                }}
              />
            </div>
          )}

          {/* Message banner */}
          {!loading && message && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 14px",
                borderRadius: 10,
                background: success ? "#EAF3DE" : "#FCEBEB",
                border: `1px solid ${success ? "#BFE0A0" : "#F7C1C1"}`,
                color: success ? "#3B6D11" : "#A32D2D",
                fontSize: 13,
                lineHeight: 1.5,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <i
                className={success ? "fi-rr-check" : "fi-rr-info"}
                aria-hidden="true"
                style={{ marginTop: 2 }}
              />
              <span>{message}</span>
            </div>
          )}

          {/* Invite details */}
          {!loading && invite && (
            <>
              <div style={{ marginBottom: 20 }}>
                <InfoRow icon="fi-rr-building" label="Company" value={invite.companyName} />
                <InfoRow icon="fi-rr-user" label="Name" value={invite.subUserName} />
                <InfoRow icon="fi-rr-envelope" label="Email" value={invite.email} />
                <InfoRow icon="fi-rr-shield-check" label="Role" value={invite.role} />
                {invite.expiresAt && (
                  <InfoRow
                    icon="fi-rr-clock"
                    label="Invitation Expires"
                    value={new Date(invite.expiresAt).toLocaleString()}
                  />
                )}
              </div>

              {!success && (
                <div
                  style={{
                    marginBottom: 24,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,163,0,0.08)",
                    border: "1px solid rgba(255,163,0,0.25)",
                    color: "var(--color-text-secondary)",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  By clicking <strong style={{ color: NAVY }}>Accept Invitation</strong>,
                  your recruiter account will be activated for{" "}
                  <strong style={{ color: NAVY }}>{invite.companyName}</strong>. Afterward,
                  sign in with your registered email or mobile number and verify with an OTP.
                </div>
              )}
            </>
          )}

          {/* Accept form */}
          {!loading && invite && !success && (
            <form onSubmit={handleAcceptInvite}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 10,
                  border: "none",
                  background: submitting ? "#f2b34d" : GOLD,
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.background = "#e68f00";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.background = GOLD;
                    e.target.style.transform = "translateY(0px)";
                  }
                }}
              >
                {submitting && (
                  <span
                    aria-hidden="true"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid currentColor",
                      borderTopColor: "transparent",
                      display: "inline-block",
                      animation: "acceptInviteSpin 0.7s linear infinite",
                    }}
                  />
                )}
                {submitting ? "Accepting…" : "Accept Invitation"}
              </button>
            </form>
          )}

          {/* Success */}
          {!loading && success && (
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <button
                type="button"
                onClick={() =>
                  router.push(`/Login?email=${encodeURIComponent(invite.email)}`)
                }
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 10,
                  border: "none",
                  background: GOLD,
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
                  e.target.style.background = GOLD;
                  e.target.style.transform = "translateY(0px)";
                }}
              >
                Continue to Login
              </button>
            </div>
          )}

          {/* Invalid/expired link, nothing else to show */}
          {!loading && !invite && !success && (
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <button
                type="button"
                onClick={() => router.push("/Login")}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 10,
                  border: `1px solid ${GOLD}`,
                  background: "#ffffff",
                  color: GOLD,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = GOLD;
                  e.target.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#ffffff";
                  e.target.style.color = GOLD;
                }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}