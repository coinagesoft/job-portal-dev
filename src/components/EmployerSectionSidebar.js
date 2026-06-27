
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { EMPLOYER_HEADER_TABS } from "@/constants/panelConfig";
import styles from "./EmployerSectionSidebar.module.css";

const isPathActive = (pathname, href) => {
  if (!pathname || !href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
};

const TAB_ICONS = {
  dashboard: {
    "CV Search": "fi-rr-search",
    Shortlisted: "fi-rr-star",
  },
  jobs: {
    "Job List": "fi-rr-briefcase",
    "Post a Job": "fi-rr-plus",
    Applicants: "fi-rr-users",
  },
  "credits-wallets": {
    "Credit Wallet": "fi-rr-wallet",
    "Buy Credits": "fi-rr-shopping-cart",
    Invoices: "fi-rr-document",
  },
  account: {
    "Company Profile": "fi-rr-building",
    "Verification & Badges": "fi-rr-shield-check",
    "Sub-Users": "fi-rr-user-add",
    Notifications: "fi-rr-bell",
    "Help & Support": "fi-rr-comment-alt",
    Settings: "fi-rr-settings",
  },
};

const EmployerSectionSidebar = () => {
  const pathname = usePathname();
  const role = useSelector((state) => state.auth.user?.role);
  const isCvSearchRoute = isPathActive(pathname, "/employeer/cv-search") || isPathActive(pathname, "/employeer/cvsearch");

  const activeTab = EMPLOYER_HEADER_TABS.find((tab) =>
    tab.links.some((link) => isPathActive(pathname, link.href))
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const shouldEnableLayoutClass = role === "employer" && Boolean(activeTab) && !isCvSearchRoute;
    document.body.classList.toggle("employer-panel-with-sidebar", shouldEnableLayoutClass);
    return () => {
      document.body.classList.remove("employer-panel-with-sidebar");
    };
  }, [activeTab, isCvSearchRoute, role]);

  if (role !== "employer") return null;
  if (!activeTab) return null;
  if (isCvSearchRoute) return null;

  const tabIcons = TAB_ICONS[activeTab.key] || {};

  return (
    <aside className={styles.sidebarShell} aria-label="Employer section links">
      <div className={styles.sidebarCard}>
        <p className={styles.sidebarKicker}>Employer Panel</p>
        <h5 className={styles.sidebarTitle}>{activeTab.label}</h5>
        <p className={styles.sidebarSubTitle}>Subsections</p>
        <ul className={styles.sidebarList}>
          {activeTab.links.map((link) => {
            const isActive = isPathActive(pathname, link.href);
            const icon = tabIcons[link.label];
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
                >
                  {icon && (
                    <i
                      className={icon}
                      style={{ marginRight: "8px", fontSize: "13px", opacity: 0.75 }}
                    />
                  )}
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

export default EmployerSectionSidebar;
