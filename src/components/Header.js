"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { logout } from "@/store/authSlice";

import {
  CANDIDATE_HEADER_SECTIONS,
  EMPLOYER_HEADER_TABS,
  PUBLIC_ROUTE_EXCEPTIONS,
  ROLE_DEFAULT_ROUTE,
} from "@/constants/panelConfig";


import styles from "./Header.module.css";

const normalizePath = (value = "") => {
  const cleanValue = value
    .split("?")[0]
    .split("#")[0];

  const normalized =
    cleanValue.replace(/\/+$/, "");

  return normalized || "/";
};

const isPathActive = (
  pathname,
  href
) => {
  if (!pathname || !href) return false;

  const currentPath =
    normalizePath(pathname);

  const targetPath =
    normalizePath(href);

  return (
    currentPath === targetPath ||
    currentPath.startsWith(
      `${targetPath}/`
    )
  );
};

const isExactPathActive = (
  pathname,
  href
) => {
  if (!pathname || !href)
    return false;

  return (
    normalizePath(pathname) ===
    normalizePath(href)
  );
};

// Pages meant to stand completely on their own — e.g. an invite link opened
// by someone who isn't (or shouldn't appear as) the account currently logged
// in on this browser. The global site header/nav is skipped entirely here.
// Shared with AuthRouteGuard so the two never drift out of sync.
const isStandaloneRoute = (pathname) => {
  const current = normalizePath(pathname);
  return PUBLIC_ROUTE_EXCEPTIONS.some(
    (route) => current === route || current.startsWith(`${route}/`)
  );
};

const Header = () => {
  const pathname = usePathname();

  const router = useRouter();

  const dispatch = useDispatch();

  const user = useSelector(
    (state) => state.auth.user
  );

  const role = user?.role;

  const [registerOpen, setRegisterOpen] =
    useState(false);

  const registerRef = useRef(null);

  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const fetchProfile = async () => {
    if (!role) return;
    try {
      if (role === "candidate") {
        const { getPersonalInfo } = await import("@/services/candidate/profileService");
        const res = await getPersonalInfo();
        if (res?.data?.success && res?.data?.data) {
          setProfileName(res.data.data.fullName || "");
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
          const photoUrl = res.data.data.profilePhotoUrl || "";
          if (photoUrl) {
            const absoluteUrl = photoUrl.startsWith("http") ? photoUrl : `${baseUrl}${photoUrl}`;
            const separator = absoluteUrl.includes("?") ? "&" : "?";
            setProfileImage(`${absoluteUrl}${separator}t=${Date.now()}`);
          } else {
            setProfileImage("");
          }
        }
      } else if (role === "employer") {
        const { default: companyProfileService } = await import("@/services/recruiter/companyProfileService");
        const data = await companyProfileService.getCompanyProfile();
        if (data) {
          setProfileName(data.legalName || data.companyDisplayName || data.tradeName || "");
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
          const logoUrl = data.companyLogoUrl || "";
          if (logoUrl) {
            const absoluteUrl = logoUrl.startsWith("http") ? logoUrl : `${baseUrl}${logoUrl}`;
            const separator = absoluteUrl.includes("?") ? "&" : "?";
            setProfileImage(`${absoluteUrl}${separator}t=${Date.now()}`);
          } else {
            setProfileImage("");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile in Header:", err);
    }
  };

  useEffect(() => {
    if (!role) {
      setProfileName("");
      setProfileImage("");
      return;
    }
    fetchProfile();

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdate", handleProfileUpdate);
    };
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (
      e
    ) => {
      if (
        registerRef.current &&
        !registerRef.current.contains(
          e.target
        )
      ) {
        setRegisterOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const activeEmployerTabKey =
    useMemo(() => {
      if (!pathname)
        return EMPLOYER_HEADER_TABS[0]
          .key;

      const activeTab =
        EMPLOYER_HEADER_TABS.find(
          (tab) =>
            tab.links.some((link) =>
              isPathActive(
                pathname,
                link.href
              )
            )
        );

      return (
        activeTab?.key ||
        EMPLOYER_HEADER_TABS[0].key
      );
    }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");

    dispatch(logout());

    router.replace("/Login");
  };

  const renderProfileActions = ({
    profileLinks,
    roleLabel,
  }) => (
    <div
      className={`block-signin ${styles.headerActionGroup}`}
    >
      {/* NOTIFICATION */}
      <div className="dropdown d-inline-block">
        <a
          className="btn btn-notify"
          id="dropdownNotify"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          data-bs-display="static"
          aria-label="Notifications"
          style={{
            width: "48px",
            height: "48px",

            borderRadius: "50%",

            border:
              "1px solid rgba(255, 163, 0, 0.18)",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            background: "#ffffff",

            boxShadow:
              "0 4px 14px rgba(18,35,89,0.05)",

            transition:
              "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "#ffa300";

            e.currentTarget.style.border =
              "1px solid #ffa300";

            e.currentTarget.style.transform =
              "translateY(-2px)";

            e.currentTarget.style.boxShadow =
              "0 12px 24px rgba(255,163,0,0.22)";

            const icon =
              e.currentTarget.querySelector(
                "i"
              );

            if (icon) {
              icon.style.color =
                "#ffffff";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "#ffffff";

            e.currentTarget.style.border =
              "1px solid rgba(255, 163, 0, 0.18)";

            e.currentTarget.style.transform =
              "translateY(0px)";

            e.currentTarget.style.boxShadow =
              "0 4px 14px rgba(18,35,89,0.05)";

            const icon =
              e.currentTarget.querySelector(
                "i"
              );

            if (icon) {
              icon.style.color =
                "#122359";
            }
          }}
        >
          <i
            className="fi-rr-bell"
            aria-hidden="true"
            style={{
              fontSize: "18px",
              color: "#122359",
              transition:
                "all 0.3s ease",
            }}
          ></i>
        </a>

        <ul
          className="dropdown-menu dropdown-menu-light dropdown-menu-end"
          aria-labelledby="dropdownNotify"
        >
          <li>
            <a
              className="dropdown-item active"
              href="#"
            >
              10 notifications
            </a>
          </li>

          <li>
            <a
              className="dropdown-item"
              href="#"
            >
              12 messages
            </a>
          </li>

          <li>
            <a
              className="dropdown-item"
              href="#"
            >
              20 replies
            </a>
          </li>
        </ul>
      </div>

      {/* PROFILE */}
      <div
        className={`member-login dropdown ${styles.profileBlock}`}
      >
        <button
          className={
            styles.profileToggle
          }
          id="dropdownProfile"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          data-bs-display="static"
        >
          <img
            alt="Profile"
            src={profileImage || (role === "employer" ? "/assets/imgs/page/company/company.png" : "/assets2/imgs/page/dashboard/profile.png")}
            style={{ objectFit: 'cover' }}
          />

          <div className="info-member">
            <strong className="color-brand-1 " style={{ fontSize: "12px" }}>
              {profileName || "Account Owner"}
            </strong>

            {/* <span className="font-xs color-text-paragraph-2 icon-down">
              {roleLabel}
            </span> */}
          </div>
        </button>

        <ul
          className="dropdown-menu dropdown-menu-light dropdown-menu-end"
          aria-labelledby="dropdownProfile"
        >
          {profileLinks.map((link) => (
            <li key={link.href + link.label}>
              <button
                className={`dropdown-item ${isExactPathActive(pathname, link.href)
                    ? "active"
                    : ""
                  }`}
                onClick={() => {
                  console.log("GOING TO:", link.href);
                  router.push(link.href);
                }}
              >
                {link.label}
              </button>
            </li>
          ))}

          <li>
            <button
              className="dropdown-item"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderCandidateMenu = () =>
    CANDIDATE_HEADER_SECTIONS.map(
      (item) => (
        <li
          key={
            item.href + item.label
          }
        >
          <Link
            className={
              isExactPathActive(
                pathname,
                item.href
              )
                ? "active"
                : ""
            }
            href={item.href}
          >
            {item.label}
          </Link>
        </li>
      )
    );

  const renderEmployerTabs = () =>
    EMPLOYER_HEADER_TABS.map(
      (tab) => (
        <li key={tab.key}>
          <Link
            className={`${activeEmployerTabKey ===
                tab.key
                ? "active"
                : ""
              } ${styles.employerTabLink
              }`}
            href={
              tab.links[0].href
            }
          >
            {tab.label}
          </Link>
        </li>
      )
    );

  const renderPublicMenu = () => (
    <>
      <li>
        <Link
          className={
            isExactPathActive(
              pathname,
              "/"
            )
              ? "active"
              : ""
          }
          href="/"
        >
          Home
        </Link>
      </li>

      <li>
        <Link
          className={
            isExactPathActive(
              pathname,
              "/jobs-list"
            )
              ? "active"
              : ""
          }
          href="/jobs-list"
        >
          Find a Job
        </Link>
      </li>
    </>
  );

  if (isStandaloneRoute(pathname)) {
    return null;
  }

  return (
    <header className="header sticky-bar">
      <div className="container">
        <div className="main-header">
          <div className="header-left">
            <div className="header-logo">
              <Link
                className="d-flex"
                href={
                  role
                    ? ROLE_DEFAULT_ROUTE[
                    role
                    ]
                    : "/"
                }
              >
                <img
                  alt="jobBox"
                  src="/assets/imgs/template/jobhub-logo.svg"
                />
              </Link>
            </div>
          </div>

          <div className="header-nav">
            <nav className="nav-main-menu">
              <ul
                className={`main-menu ${styles.roleMenu}`}
              >
                {!role &&
                  renderPublicMenu()}

                {role ===
                  "candidate" &&
                  renderCandidateMenu()}

                {role ===
                  "employer" &&
                  renderEmployerTabs()}
              </ul>
            </nav>

            <div className="burger-icon burger-icon-white">
              <span className="burger-icon-top"></span>

              <span className="burger-icon-mid"></span>

              <span className="burger-icon-bottom"></span>
            </div>
          </div>

          <div className="header-right">
            {!role ? (
              <div className="block-signin">
                {/* REGISTER */}
                <div
                  className={
                    styles.registerDropdownWrap
                  }
                  ref={registerRef}
                >
                  <button
                    className={`text-link-bd-btom hover-up ${styles.registerTrigger}`}
                    onMouseEnter={() =>
                      setRegisterOpen(
                        true
                      )
                    }
                    onClick={() =>
                      setRegisterOpen(
                        (v) => !v
                      )
                    }
                    type="button"
                    style={{ textDecoration: "none" }}
                  >
                    Register
                  </button>

                  {registerOpen && (
                    <div
                      className={
                        styles.registerDropdown
                      }
                      onMouseLeave={() =>
                        setRegisterOpen(
                          false
                        )
                      }
                    >
                      <Link
                        href="/register?type=candidate"
                        className={
                          styles.registerDropdownItem
                        }
                        onClick={() =>
                          setRegisterOpen(
                            false
                          )
                        }
                      >
                        <span
                          className={
                            styles.registerDropdownIcon
                          }
                        >
                          <i className="fi-rr-user"></i>
                        </span>

                        <span>
                          <strong>
                            Candidate
                          </strong>

                          <small>
                            Find jobs &
                            build
                            profile
                          </small>
                        </span>
                      </Link>

                      <Link
                        href="/register?type=employer"
                        className={
                          styles.registerDropdownItem
                        }
                        onClick={() =>
                          setRegisterOpen(
                            false
                          )
                        }
                      >
                        <span
                          className={
                            styles.registerDropdownIcon
                          }
                        >
                          <i className="fi-rr-briefcase"></i>
                        </span>

                        <span>
                          <strong>
                            Employer
                          </strong>

                          <small>
                            Post jobs &
                            hire talent
                          </small>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  className="btn btn-default btn-shadow ml-40 hover-up"
                  href="/Login"
                >
                  Sign in
                </Link>
              </div>
            ) : role ===
              "employer" ? (
              renderProfileActions({
                roleLabel:
                  "Employer Panel",

                profileLinks: [
                  {
                    label:
                      "Company Profile",
                    href:
                      "/employeer/company-profile",
                  },

                  {
                    label:
                      "Sub-Users",
                    href:
                      "/employeer/sub-user",
                  },

                  {
                    label:
                      "Help & Support",
                    href:
                      "/employeer/help-support",
                  },

                  {
                    label:
                      "Settings",
                    href:
                      "/employeer/settings",
                  },
                ],
              })
            ) : (
              renderProfileActions({
                roleLabel:
                  "Candidate Panel",

                profileLinks: [
                  {
                    label:
                      "My Profile",
                    href:
                      "/candidate-profile",
                  },

                  {
                    label:
                      "Saved Jobs",
                    href:
                      "/candidate-profile/saved-jobs",
                  },

                  {
                    label:
                      "My Applications",
                    href:
                      "/candidate-profile/application-status",
                  },

                  {
                    label:
                      "Help & Support",
                    href:
                      "/candidate-profile/settings/help-support",
                  },

                  {
                    label:
                      "Settings",
                    href:
                      "/candidate-profile/settings",
                  },
                ],
              })
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;