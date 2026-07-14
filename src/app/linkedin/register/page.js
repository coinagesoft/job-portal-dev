"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { verifyWithLinkedIn } from "@/services/candidate/registrationService";

export default function LinkedInRegisterCallback() {
  const router = useRouter();
  const showToast = useToast();

  useEffect(() => {
    const run = async () => {
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        router.replace("/register?type=candidate");
        return;
      }

      try {
        const response = await verifyWithLinkedIn({
          linkedInCode: code,
          redirectUri: `${window.location.origin}/linkedin/register`,
        });

        if (response.data.success) {
          sessionStorage.setItem(
            "linkedinVerifiedState",
            JSON.stringify({
              accessToken: response.data.accessToken,
              email: response.data.email,
              fullName: response.data.fullName,
            })
          );
          router.replace("/register?type=candidate");
        } else {
          showToast(response.data.message, "error");
          router.replace("/register?type=candidate");
        }
      } catch (err) {
        showToast(err?.response?.data?.message || "LinkedIn verification failed", "error");
        router.replace("/register?type=candidate");
      }
    };

    run();
  }, [router, showToast]);

  return <div>Verifying LinkedIn account...</div>;
}