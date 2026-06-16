"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import {
  setUser,
  setInitialized
} from "@/store/authSlice";
export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

   if (!token) {
  dispatch(setInitialized());
  return;
}

    try {
console.log("AUTH INITIALIZER RUNNING");
  console.log("TOKEN", token);

  const decoded = jwtDecode(token);

  console.log("DECODED", decoded);

      const roleClaim =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      dispatch(
        setUser({
          user: {
            userId:
              decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ],

            employerId: decoded.EmployerId,

            role:
              roleClaim === "Recruiter"
                ? "employer"
                : "candidate",
          },

          token,
        })
      );
      dispatch(setInitialized());
    }catch (err) {
  console.error("JWT ERROR", err);

  localStorage.removeItem("token");
  dispatch(setInitialized());
    
}
  }, [dispatch]);

  return null;
}