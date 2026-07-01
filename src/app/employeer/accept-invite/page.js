"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function AcceptInvite() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Invalid invitation link.");
      setLoading(false);
      return;
    }

    acceptInvite(token);
  }, []);

  const acceptInvite = async (token) => {
    try {
      const { data } = await api.post(
        `/api/recruiter/sub-users/accept-invite?token=${token}`
      );

      setMessage(data.message);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Unable to accept invitation."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h2>Accepting invitation...</h2>;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "100px auto",
        textAlign: "center",
      }}
    >
      <h2>{message}</h2>
    </div>
  );
}