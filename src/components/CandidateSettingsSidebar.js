'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./CandidateSettingsSidebar.module.css";

const CANDIDATE_SETTINGS_LINKS = [
  { label: "Settings Overview", href: "/candidate-profile/settings" },
  { label: "Notifications", href: "/candidate-profile/settings/notifications" },
  // { label: "Payment History", href: "/candidate-profile/settings/payment-history" },
  { label: "Help & Support", href: "/candidate-profile/settings/help-support" }
];

const isPathActive = (pathname, href) => {
  if (!pathname || !href) return false;

  // Only exact match for man settings page
  if (href === "/candidate-profile/settings") {
    return pathname === href;
  }

  // Other links can use startsWith
  return pathname.startsWith(href);
};

const CandidateSettingsSidebar = () => {
  const pathname = usePathname();
  const role = useSelector((state) => state.auth.user?.role);

  const isSettingsActive = CANDIDATE_SETTINGS_LINKS.some(link => isPathActive(pathname, link.href));

  useEffect(() => {
    if (typeof document === "undefined") return;
    const shouldEnableLayoutClass = role === "candidate" && isSettingsActive;
    document.body.classList.toggle("candidate-panel-with-sidebar", shouldEnableLayoutClass);
    return () => {
      document.body.classList.remove("candidate-panel-with-sidebar");
    };
  }, [isSettingsActive, role]);

  if (role !== "candidate") return null;
  if (!isSettingsActive) return null;

  return (
    <aside className={styles.sidebarShell} aria-label="Candidate settings links">
      <div className={styles.sidebarCard}>
        <p className={styles.sidebarKicker}>Candidate Panel</p>
        <h5 className={styles.sidebarTitle}>Settings</h5>
        <p className={styles.sidebarSubTitle}>Subsections</p>
        <ul className={styles.sidebarList}>
          {CANDIDATE_SETTINGS_LINKS.map((link) => {
            const isActive = isPathActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default CandidateSettingsSidebar;
