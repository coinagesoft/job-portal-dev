// app/linkedin/mobile-callback/page.jsx
//
// Dedicated LinkedIn redirect target for the MOBILE APP ONLY.
// Do NOT reuse /linkedin/register or /linkedin/callback for this —
// those pages consume the one-time authorization code themselves
// (calling verifyWithLinkedIn / linkedInLogin), which would leave
// nothing for the mobile app's own backend exchange to use.
//
// This page does exactly one thing: forward code/state to the app via
// its custom URL scheme, unopened. The mobile app then exchanges the
// code itself via _CandidateAuthApi.verifyLinkedIn.
"use client";

import { useEffect } from "react";

const APP_SCHEME = "in.coinage.jobportal";

export default function LinkedInMobileCallback() {
  useEffect(() => {
    const params = window.location.search; // ?code=...&state=... (or ?error=...)
    window.location.replace(`${APP_SCHEME}://linkedin/callback${params}`);
  }, []);

  return <div>Redirecting back to the JobBox app…</div>;
}
