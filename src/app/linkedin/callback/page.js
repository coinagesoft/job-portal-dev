"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { linkedInLogin } from "@/services/recruiter/authService";
import { setUser } from "@/store/authSlice";

export default function LinkedInCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const login = async () => {
      try {
        const code = params.get("code");

        if (!code) return;

        const response =
          await linkedInLogin({
            linkedInCode: code,
            redirectUri:
              "http://localhost:3000/linkedin/callback",
            userType: "Recruiter",
          });

        const data = response.data;

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
          data.redirectTo
        );
      }
      catch (err) {
        console.error(err);

        router.replace(
          "/Login"
        );
      }
    };

    login();
  }, [params, router, dispatch]);

  return (
    <div>
      Signing in with LinkedIn...
    </div>
  );
}