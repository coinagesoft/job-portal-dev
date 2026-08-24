"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { updateCandidateLocation } from "@/services/candidate/locationService";

// How often to re-check/re-sync the candidate's location while the site
// is open in a tab. Browser geolocation only runs in the foreground — it
// can't update while the tab is closed or the device is asleep, so this
// is "auto-updates whenever the candidate has the site open," not true
// background tracking (that would require a native mobile app with a
// background-location permission).
const LOCATION_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Renders nothing — mounted once at the app root. As soon as a logged-in
// candidate is detected it prompts for geolocation permission; once
// granted, it keeps syncing the position to the backend on an interval
// for as long as the tab stays open.
export default function CandidateLocationSync() {
  const user = useSelector((state) => state.auth?.user);
  const initialized = useSelector((state) => state.auth?.initialized);
  const intervalRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!initialized || user?.role !== "candidate") {
      return;
    }

    if (typeof window === "undefined" || !navigator.geolocation) {
      return;
    }

    // Guard against double-starting (e.g. React strict-mode double effect,
    // or the user object updating for an unrelated reason).
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const syncLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateCandidateLocation({
            latitude,
            longitude,
            permissionGranted: true,
          }).catch((err) => {
            console.error("Failed to sync candidate location", err);
          });
        },
        (err) => {
          // Most common case: candidate denied permission, or it's
          // unavailable. Nothing to sync — just stop trying until the
          // next scheduled attempt (permission could be granted later
          // from the browser's own site-settings UI).
          console.warn("Geolocation unavailable:", err?.message);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    };

    // First sync right away (this is what triggers the browser's
    // permission prompt the very first time).
    syncLocation();

    // Then keep syncing periodically for as long as the tab is open.
    intervalRef.current = setInterval(syncLocation, LOCATION_SYNC_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      startedRef.current = false;
    };
  }, [initialized, user?.role]);

  return null;
}
