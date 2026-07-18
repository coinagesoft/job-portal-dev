"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import jwtDecode from "jwt-decode";
import {
  setUser,
  setInitialized
} from "@/store/authSlice";
import { getMyPermissions } from "@/services/recruiter/recruiterSubUserService";

// How often to re-check the caller's current role/permissions while the
// app is open. This is what lets a permission downgrade (e.g. the account
// owner changing a sub-user from HR Manager to Viewer) actually take effect
// for a session that's already open on a restricted page, instead of only
// being caught the next time the whole app reloads.
const PERMISSION_POLL_INTERVAL_MS = 20_000;

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(setInitialized());
        return;
      }

      try {
        const decoded = jwtDecode(token);

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

    loadAuth();

    // Re-check permissions periodically while the tab is open, and
    // immediately whenever the user switches back to it — covers both the
    // "left it open overnight" and "owner changed my role while I was on
    // another tab" cases without waiting for a manual page refresh.
    const intervalId = setInterval(loadAuth, PERMISSION_POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAuth();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [dispatch]);

  return null;
}