"use client";

import { useSelector } from "react-redux";
import { useToast } from "@/components/Toast";

/**
 * Wraps a whole page's content and makes it strictly view-only for a
 * recruiter sub-user: they can see everything (scroll, read, follow links
 * like the embedded Google Maps), but any attempt to interact with a form
 * control (typing, clicking a button, toggling a select, uploading a file)
 * is blocked and shows a "contact your account owner" message instead.
 *
 * This is a UI convenience layer only — the actual security boundary is
 * enforced server-side (the relevant API endpoints reject writes from a
 * sub-user regardless of what the UI allows), so this never needs to be
 * "tamper-proof" on its own.
 *
 * Usage: wrap the JSX a page's component returns, e.g.
 *   return (
 *     <SubUserViewOnlyGuard>
 *       <main>...</main>
 *     </SubUserViewOnlyGuard>
 *   );
 */
export default function SubUserViewOnlyGuard({ children, message }) {
  const isSubUser = useSelector(
    (state) => state.auth?.user?.isSubUser === true,
  );
  const showToast = useToast();

  if (!isSubUser) {
    return children;
  }

  const warn = () => {
    showToast(
      message ||
        "You don't have permission to edit this. Only your account owner (HR manager) can make changes here.",
      "error",
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        className="subuser-viewonly-banner"
        style={{
          background: "#FFF5E8",
          border: "1px solid #FFD48A",
          color: "#8a5a00",
          borderRadius: 8,
          padding: "10px 20px",
          marginTop: 16,
          marginRight: 24,
          marginBottom: 0,
          fontSize: 13,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8,
          position: "relative",
          zIndex: 90,
        }}
      >
        <i className="fi-rr-lock" aria-hidden="true" />
        View-only access — only your account owner can make changes on this
        page.
      </div>

      {/* The inner layer is inert (pointer-events: none), so every click
          "falls through" to this wrapper instead, which shows the warning.
          Links/inputs remain fully visible and readable, just not
          interactive. */}
      <div
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
          warn();
        }}
        style={{ pointerEvents: "auto" }}
      >
        <div style={{ pointerEvents: "none", userSelect: "none" }}>
          {children}
        </div>
      </div>
    </div>
  );
}