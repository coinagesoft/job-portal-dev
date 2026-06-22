"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { linkedInLogin } from "@/services/recruiter/authService";
import { setUser } from "@/store/authSlice";

export default function LinkedInCallback() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const login = async () => {
      try {
        const code = new URLSearchParams(
          window.location.search
        ).get("code");

        console.log("LINKEDIN CODE", code);

        if (!code) {
          router.replace("/Login");
          return;
        }

        const response = await linkedInLogin({
          linkedInCode: code,
          redirectUri:
            "https://job-portal-dev-phi.vercel.app/linkedin/callback",
          userType: "Both",
        });

        const data = response.data;

        console.log("LINKEDIN RESPONSE", data);

        localStorage.setItem(
          "token",
          data.token
        );

        dispatch(
          setUser({
            user: {
              userId: data.userId,
              employerId: data.employerId,
              userName: data.userName,
              role:
                data.userType === "Recruiter"
                  ? "employer"
                  : "candidate",
            },
            token: data.token,
          })
        );

        router.replace(
          "/employeer/cv-search"
        );

     
      } catch (err) {
        console.error(
          "LINKEDIN LOGIN ERROR",
          err
        );

        router.replace("/Login");
      }
    };

    login();
  }, [router, dispatch]);

  return (
    <div>
      Signing in with LinkedIn...
    </div>
  );
}