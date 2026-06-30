"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";

export default function AcceptInvite() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid invitation link.");
      setLoading(false);
      return;
    }

    acceptInvite();
  }, []);

  const acceptInvite = async () => {
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