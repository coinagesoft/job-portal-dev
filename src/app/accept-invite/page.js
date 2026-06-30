"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { acceptInvite } from "@/services/recruiter/recruiterSubUserService";

const T = {
  navy: "#122359",
  orange: "#ffa300",
  muted: "#66789c",
  border: "#e8ecf0",
  success: "#3b6d11",
  successBg: "#eaf3de",
  error: "#a32d2d",
  errorBg: "#fcebeb",
  white: "#fff",
};

const AcceptInviteContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // "loading" | "success" | "error"
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const ranRef = useRef(false);

  // The login URL, pre-filled with the invited email when we have it.
  const loginHref = email
    ? `/Login?identifier=${encodeURIComponent(email)}`
    : "/Login";

  useEffect(() => {
    // Guard against double-invocation in React strict mode so we don't
    // call accept-invite twice (the second call returns "already accepted").
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      if (!token) {
        setStatus("error");
        setMessage("This invite link is missing its token. Please use the link from your email.");
        return;
      }

      try {
        const data = await acceptInvite(token);
        if (data?.success) {
          setStatus("success");
          setMessage(data.message || "Invite accepted. You can now log in.");
          if (data.email) {
            setEmail(data.email);
            // Take them straight to the login page with the email pre-filled.
            setTimeout(() => {
              router.push(`/Login?identifier=${encodeURIComponent(data.email)}`);
            }, 2000);
          }
        } else {
          setStatus("error");
          setMessage(data?.message || "Could not accept this invitation.");
        }
      } catch (error) {
        const res = error?.response;
        // 409 = already accepted, 410 = expired, 400 = invalid
        if (res?.status === 409) {
          setStatus("success");
          setMessage(
            res.data?.message ||
              "This invitation was already accepted. You can log in.",
          );
          if (res.data?.email) setEmail(res.data.email);
        } else {
          setStatus("error");
          setMessage(
            res?.data?.message ||
              "This invitation link is invalid or has expired. Please ask your admin to resend it.",
          );
        }
      }
    };

    run();
  }, [token]);

  return (
    <main className="main">
      <section style={{ padding: "80px 0", background: "#f5f7fa", minHeight: "70vh" }}>
        <div className="container">
          <div
            style={{
              maxWidth: 520,
              margin: "0 auto",
              background: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: "44px 36px",
              textAlign: "center",
              boxShadow: "0 6px 24px rgba(18,35,89,0.06)",
            }}
          >
            {status === "loading" && (
              <>
                <div style={{ fontSize: 40, marginBottom: 14 }}>
                  <i className="fi fi-rr-spinner" aria-hidden="true" />
                </div>
                <h3 style={{ color: T.navy, margin: "0 0 8px" }}>
                  Accepting your invitation…
                </h3>
                <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>
                  Please wait a moment.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    background: T.successBg,
                    border: `3px solid ${T.success}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                    color: T.success,
                    margin: "0 auto 18px",
                  }}
                >
                  <i className="fi fi-rr-check" aria-hidden="true" />
                </div>
                <h3 style={{ color: T.navy, margin: "0 0 8px" }}>
                  Invitation Accepted!
                </h3>
                <p style={{ color: T.muted, fontSize: 14, margin: "0 0 26px" }}>
                  {message} Log in with the email this invite was sent to — we’ll
                  send you a one-time password (OTP) to sign in.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(loginHref)}
                  className="btn btn-default"
                  style={{
                    background: T.orange,
                    color: T.white,
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 28px",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Continue to Login
                  <i
                    className="fi fi-rr-arrow-small-right"
                    aria-hidden="true"
                    style={{ marginLeft: 8 }}
                  />
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    background: T.errorBg,
                    border: `3px solid ${T.error}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                    color: T.error,
                    margin: "0 auto 18px",
                  }}
                >
                  <i className="fi fi-rr-cross" aria-hidden="true" />
                </div>
                <h3 style={{ color: T.navy, margin: "0 0 8px" }}>
                  Invitation Problem
                </h3>
                <p style={{ color: T.muted, fontSize: 14, margin: "0 0 26px" }}>
                  {message}
                </p>
                <button
                  type="button"
                  onClick={() => router.push(loginHref)}
                  className="btn btn-border"
                  style={{
                    borderRadius: 10,
                    padding: "12px 28px",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

const AcceptInvitePage = () => (
  <Suspense fallback={null}>
    <AcceptInviteContent />
  </Suspense>
);

export default AcceptInvitePage;