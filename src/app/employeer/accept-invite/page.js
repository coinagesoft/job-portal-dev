"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  validateInvite,
  acceptInvite,
} from "@/services/recruiter/recruiterSubUserService";

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
        err.response?.data?.message ||
          "Invalid or expired invitation link."
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

      setMessage(
        data.message ||
          "Invitation accepted successfully."
      );

      setTimeout(() => {
        router.push(
          `/login`
        );
      }, 2000);

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Unable to accept invitation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Loading invitation...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div
        className="card shadow mx-auto"
        style={{ maxWidth: 550 }}
      >
        <div className="card-body p-4">

          <h3 className="text-center mb-4">
            Accept Invitation
          </h3>

          {message && (
            <div
              className={`alert ${
                success
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {message}
            </div>
          )}

          {invite && (
            <>
              <div className="mb-2">
                <strong>Company:</strong>{" "}
                {invite.companyName}
              </div>

              <div className="mb-2">
                <strong>Name:</strong>{" "}
                {invite.subUserName}
              </div>

              <div className="mb-2">
                <strong>Email:</strong>{" "}
                {invite.email}
              </div>

              <div className="mb-2">
                <strong>Role:</strong>{" "}
                {invite.role}
              </div>

              {invite.expiresAt && (
                <div className="mb-4">
                  <strong>Invitation Expires:</strong>{" "}
                  {new Date(
                    invite.expiresAt
                  ).toLocaleString()}
                </div>
              )}

              <div className="alert alert-info mt-4">
                By clicking <strong>Accept Invitation</strong>,
                your recruiter account will be activated for{" "}
                <strong>{invite.companyName}</strong>.
                <br />
                <br />
                After activation, you can sign in using your
                registered email/mobile and verify yourself
                with an OTP.
              </div>
            </>
          )}

          {invite && !success && (
            <form onSubmit={handleAcceptInvite}>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={submitting}
              >
                {submitting
                  ? "Accepting..."
                  : "Accept Invitation"}
              </button>

            </form>
          )}

          {success && (
            <div className="text-center mt-4">

              <button
                className="btn btn-success"
                onClick={() =>
                  router.push(
                    `/login?email=${encodeURIComponent(
                      invite.email
                    )}`
                  )
                }
              >
                Continue to Login
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}