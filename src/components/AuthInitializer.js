"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import jwtDecode from "jwt-decode";
import {
  setUser,
  setInitialized
} from "@/store/authSlice";
import { getMyPermissions } from "@/services/recruiter/recruiterSubUserService";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
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
        const userId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        const employerId = decoded.EmployerId;

        if (roleClaim === "Candidate" && userId) {
          localStorage.setItem("candidateId", userId);
        }

        if (employerId) {
          localStorage.setItem("employerId", employerId);
        }

        const user = {
          userId,
          employerId,
          role: roleClaim === "Recruiter" ? "employer" : "candidate",
        };

        // Permissions can change server-side (owner edits a sub-user's
        // access, deactivates them, etc.) without the JWT changing, so
        // fetch the caller's CURRENT flags on every load instead of
        // trusting anything baked into the token or a stale login response.
        if (roleClaim === "Recruiter" && employerId) {
          try {
            const permissions = await getMyPermissions();
            user.isSubUser = permissions?.isSubUser ?? false;
            user.subUserRole = permissions?.role ?? null;
            user.canSearchCandidates = permissions?.canSearchCandidates ?? true;
            user.canUnlockProfiles = permissions?.canUnlockProfiles ?? true;
            user.canPostJobs = permissions?.canPostJobs ?? true;
            user.canManageApplications = permissions?.canManageApplications ?? true;
          } catch (permErr) {
            console.error("Failed to load permissions", permErr);
            // Fail closed for a sub-user context we can't verify — but we
            // can't yet tell owner vs sub-user, so don't block the owner's
            // own dashboard over a transient network error. Downstream
            // route guards still protect the restricted pages themselves.
            user.isSubUser = false;
            user.subUserRole = null;
            user.canSearchCandidates = true;
            user.canUnlockProfiles = true;
            user.canPostJobs = true;
            user.canManageApplications = true;
          }
        }

        dispatch(setUser({ user, token }));
        dispatch(setInitialized());
      } catch (err) {
        console.error("JWT ERROR", err);

        localStorage.removeItem("token");
        dispatch(setInitialized());
      }
    };

    init();
  }, [dispatch]);

  return null;
}