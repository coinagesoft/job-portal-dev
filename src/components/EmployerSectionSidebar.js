"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  EMPLOYER_HEADER_TABS,
  ROUTE_PERMISSION_RULES,
  HR_MANAGER_ROLE,
} from "@/constants/panelConfig";
import styles from "./EmployerSectionSidebar.module.css";

const isPathActive = (pathname, href) => {
  if (!pathname || !href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
};

// Same rule matching AuthRouteGuard uses to decide whether a sub-user gets
// redirected off a page — reused here so a restricted page's link never
// even shows up in the sidebar for a sub-user who can't open it anyway
// (e.g. Buy Credits / Invoices, which are owner-only billing pages).
const isLinkVisibleToUser = (href, user) => {
  const isSubUser = user?.isSubUser === true;
  if (!isSubUser) return true;

  const rule = ROUTE_PERMISSION_RULES.find(
    (r) => href === r.prefix || href.startsWith(`${r.prefix}/`)
  );
  if (!rule) return true;

  if (rule.ownerOnly) return false;
  if (rule.hrManagerViewOnly) return user?.subUserRole === HR_MANAGER_ROLE;
  if (rule.permission) return user?.[rule.permission] !== false;

  return true;
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
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;
  const isCvSearchOrShortlistRoute =
    isPathActive(pathname, "/employeer/cv-search") ||
    isPathActive(pathname, "/employeer/cvsearch") ||
    isPathActive(pathname, "/employeer/candidate-profile");

  const activeTab = EMPLOYER_HEADER_TABS.find((tab) =>
    tab.links.some((link) => isPathActive(pathname, link.href))
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const shouldEnableLayoutClass =
      role === "employer" && Boolean(activeTab) && !isCvSearchOrShortlistRoute;
    document.body.classList.toggle("employer-panel-with-sidebar", shouldEnableLayoutClass);
    return () => {
      document.body.classList.remove("employer-panel-with-sidebar");
    };
  }, [activeTab, isCvSearchOrShortlistRoute, role]);

  if (role !== "employer") return null;
  if (!activeTab) return null;
  if (isCvSearchOrShortlistRoute) return null;

  const tabIcons = TAB_ICONS[activeTab.key] || {};

  const visibleLinks = activeTab.links.filter((link) =>
    isLinkVisibleToUser(link.href, user)
  );

  return (
    <aside className={styles.sidebarShell} aria-label="Employer section links">
      <div className={styles.sidebarCard}>
        <p className={styles.sidebarKicker}>Employer Panel</p>
        <h5 className={styles.sidebarTitle}>{activeTab.label}</h5>
        <p className={styles.sidebarSubTitle}>Subsections</p>
        <ul className={styles.sidebarList}>
          {visibleLinks.map((link) => {
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