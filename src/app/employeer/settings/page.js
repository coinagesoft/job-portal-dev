"use client";

import { useToast } from "@/components/Toast";
import { useEffect, useState } from "react";
import TimezoneSelect from "react-timezone-select";
import {
  getAccountSettings,
  updateAccountSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getPreferences,
  updatePreferences,
  getSessions,
  revokeSession,
} from "@/services/recruiter/employerSettingsService";
const LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Odia",
  "Arabic",
  "French",
  "German",
];

const SETTINGS_TABS = [
  { key: "account", label: "Account Details", icon: "fi-rr-user" },
  { key: "language", label: "Language", icon: "fi-rr-globe" },
  { key: "security", label: "Security", icon: "fi-rr-lock" },
  { key: "preferences", label: "Preferences", icon: "fi-rr-settings" },
  { key: "danger", label: "Delete Account", icon: "fi-rr-trash" },
];

const NOTIFICATION_PREFS = [
  {
    key: "newApplicantAlerts",
    label: "New applicant alerts",
    desc: "Get notified when candidates apply to your jobs.",
    enabled: true,
  },
  {
    key: "creditBillingAlerts",
    label: "Credit & billing alerts",
    desc: "Receive alerts before your credit pack expires and on billing.",
    enabled: true,
  },
  {
    key: "jobStatusUpdates",
    label: "Job status updates",
    desc: "Track when jobs go active, paused or closed.",
    enabled: true,
  },
  {
    label: "Invoice notifications",
    desc: "Billing and payment confirmations straight to your inbox.",
    enabled: true,
  },
  {
    key: "systemMessages",
    label: "Platform updates",
    desc: "New features, improvements and portal announcements.",
    enabled: false,
  },
  {
    label: "Marketing emails",
    desc: "Promotional offers and hiring tips from our team.",
    enabled: false,
  },
];

/* ── Shared card shell ── */
const Card = ({ children, style = {} }) => (
  <div
    className="subuser-hover-card"
    style={{
      background: "#ffffff",
      borderRadius: "24px",
      boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
      padding: "28px",
      marginBottom: "24px",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Section icon header ── */
const SectionHeader = ({ icon, title, subtitle, danger = false }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 16,
        flexShrink: 0,
        background: danger
          ? "linear-gradient(135deg,#a32d2d,#c0392b)"
          : "linear-gradient(135deg,#122359,#1e3a8a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <i
        className={icon}
        style={{ color: danger ? "#fff" : "#ffa300", fontSize: 18 }}
      />
    </div>
    <div>
      <h5
        style={{
          margin: 0,
          color: danger ? "#a32d2d" : "#122359",
          fontWeight: 800,
        }}
      >
        {title}
      </h5>
      <p style={{ margin: 0, color: "#66789c", fontSize: 13 }}>{subtitle}</p>
    </div>
  </div>
);

/* ── Orange toggle (matches notifications page) ── */
const Toggle = ({ enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    style={{
      width: 46,
      height: 26,
      borderRadius: 999,
      border: "none",
      background: enabled ? "#ffa300" : "#dbe4f0",
      position: "relative",
      transition: "all .25s ease",
      flexShrink: 0,
      cursor: "pointer",
    }}
  >
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#fff",
        position: "absolute",
        top: 3,
        left: enabled ? 23 : 3,
        transition: "all .25s ease",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
      }}
    />
  </button>
);

const EmployerSettingsPage = () => {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [saved, setSaved] = useState(false);
  const [account, setAccount] = useState({
    contactPersonName: "",
    designation: "",
    email: "",
    mobileNumber: "",
    countryCode: "+91",
    timeZone: "",
  });

  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState("English");
  const [secondaryLanguage, setSecondaryLanguage] = useState("");
  const [langSaved, setLangSaved] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState(NOTIFICATION_PREFS);
  const [sessions, setSessions] = useState([]);

  const handleSave = async () => {
    try {
      setLoading(true);

      await updateAccountSettings(account);
      await fetchAccount();

      setSaved(true);

      showToast("Account updated successfully", "success");

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.log(error);

      showToast("Failed to update account", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLangSave = async () => {
    try {
      await updatePreferences({
        primaryLanguage: language,
        secondaryLanguage: secondaryLanguage,
      });
      setLangSaved(true);
      showToast("Language preference saved.", "success");
      setTimeout(() => setLangSaved(false), 2500);
    } catch (error) {
      console.log(error);
      showToast("Failed to save preferences.", "error");
    }
  };

  const toggleNotif = async (index) => {
    const next = notifPrefs.map((item, i) =>
      i === index ? { ...item, enabled: !item.enabled } : item,
    );
    setNotifPrefs(next);

    // Persist only the backend-backed toggles.
    const payload = {
      newApplicantAlerts: false,
      creditBillingAlerts: false,
      jobStatusUpdates: false,
      systemMessages: false,
    };
    next.forEach((p) => {
      if (p.key) payload[p.key] = p.enabled;
    });

    try {
      await updateNotificationSettings(payload);
      showToast("Preference updated", "info");
    } catch (error) {
      console.log(error);
      setNotifPrefs(notifPrefs); // revert on failure
      showToast("Could not save preference.", "error");
    }
  };

  const loadNotifPrefs = async () => {
    try {
      const data = await getNotificationSettings();
      setNotifPrefs((prev) =>
        prev.map((p) =>
          p.key && data?.[p.key] !== undefined
            ? { ...p, enabled: !!data[p.key] }
            : p,
        ),
      );
    } catch (error) {
      console.log("notif settings load skipped", error);
    }
  };

  const loadPreferences = async () => {
    try {
      const data = await getPreferences();
      if (data?.primaryLanguage) setLanguage(data.primaryLanguage);
      if (data?.secondaryLanguage) setSecondaryLanguage(data.secondaryLanguage);
    } catch (error) {
      console.log("preferences load skipped", error);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      const list = data?.sessions || [];
      setSessions(
        list.map((s) => ({
          sessionId: s.sessionId,
          device:
            [s.browser, s.operatingSystem].filter(Boolean).join(" on ") ||
            s.deviceName ||
            "Unknown device",
          location: s.location || s.ipAddress || "",
          time: s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleString() : "",
          icon: /mobile|iphone|android/i.test(
            `${s.deviceName} ${s.operatingSystem}`,
          )
            ? "fi-rr-mobile"
            : "fi-rr-computer",
          current: s.isCurrentSession,
        })),
      );
    } catch (error) {
      console.log("sessions load skipped", error);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      showToast("Session revoked.", "success");
    } catch (error) {
      console.log(error);
      showToast("Could not revoke session.", "error");
    }
  };
  const fetchAccount = async () => {
    try {
      setLoading(true);

      const response = await getAccountSettings();

      setAccount(response);
    } catch (error) {
      console.log(error);

      showToast("Failed to fetch account details", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAccount();
    loadNotifPrefs();
    loadPreferences();
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">
            {/* ── Page Header ── */}
            <div className="box-filters-job mb-25">
              <div className="row align-items-center">
                <div className="col-12">
                  <h3
                    style={{
                      color: "#122359",
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    Settings
                  </h3>
                  <span className="font-sm color-text-paragraph-2">
                    Manage your account preferences, language, security, and
                    notifications.
                  </span>
                </div>
              </div>
            </div>

            {/* ── Top Tab Navigation ── */}
            <div className="box-nav-tabs mb-5">
              <ul
                className="nav"
                role="tablist"
                style={{ flexWrap: "wrap", gap: 6 }}
              >
                {SETTINGS_TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const isDanger = tab.key === "danger";
                  return (
                    <li key={tab.key}>
                      <button
                        className={`btn btn-border mr-5 mb-5${isActive ? " active" : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                          border:
                            isDanger && isActive
                              ? "2px solid #e02020"
                              : isActive
                                ? "2px solid #ffa300"
                                : isDanger
                                  ? "1px solid #f3c3c3"
                                  : undefined,
                          color:
                            isDanger && isActive
                              ? "#e02020"
                              : isActive
                                ? "#ffa300"
                                : isDanger
                                  ? "#c0392b"
                                  : undefined,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 13,
                          padding: "8px 16px",
                        }}
                      >
                        <i
                          className={tab.icon}
                          style={{
                            fontSize: 13,
                            color:
                              isDanger && isActive
                                ? "#e02020"
                                : isActive
                                  ? "#ffa300"
                                  : isDanger
                                    ? "#c0392b"
                                    : "#9ca3af",
                          }}
                        />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-bottom pt-5 pb-5 mb-30" />

            {/* ════════════════════════════════
                ACCOUNT DETAILS
            ════════════════════════════════ */}
            {activeTab === "account" && (
              <Card>
                <SectionHeader
                  icon="fi-rr-user"
                  title="Account Details"
                  subtitle="Update your contact and timezone information"
                />
                <div className="row">
                  {}
                  <div className="col-lg-6 col-12 mb-15">
                    <label>Contact Name</label>

                    <input
                      className="form-control"
                      type="text"
                      value={account.contactPersonName}
                      onChange={(e) =>
                        setAccount({
                          ...account,
                          contactPersonName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-lg-6 col-12 mb-15">
                    <label>Designation</label>

                    <input
                      className="form-control"
                      type="text"
                      value={account.designation}
                      onChange={(e) =>
                        setAccount({
                          ...account,
                          designation: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-lg-6 col-12 mb-15">
                    <label>Email</label>

                    <input
                      className="form-control"
                      type="email"
                      value={account.email}
                      disabled
                      style={{
                        background: "#F8FAFC",
                        cursor: "not-allowed",
                        color: "#64748B",
                      }}
                    />
                  </div>
                  <div className="col-lg-6 col-12 mb-15">
                    <label>Country Code</label>

                    <input
                      className="form-control"
                      value={account.countryCode}
                      disabled
                      style={{
                        background: "#F8FAFC",
                        cursor: "not-allowed",
                        color: "#64748B",
                      }}
                    />
                  </div>
                  <div className="col-lg-6 col-12 mb-15">
                    <label>Mobile Number</label>

                    <input
                      className="form-control"
                      type="tel"
                      value={account.mobileNumber}
                      disabled
                      style={{
                        background: "#F8FAFC",
                        cursor: "not-allowed",
                        color: "#64748B",
                      }}
                    />

                    <p style={{ color: "#94A3B8" }}>
                      Mobile number can only be changed by contacting support.
                    </p>
                  </div>

                  <div className="col-lg-6 col-12 mb-15">
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#66789c",
                      }}
                    >
                      Time Zone
                    </label>
                   <TimezoneSelect
  value={account.timeZone}
  onChange={(tz) =>
    setAccount({
      ...account,
      timeZone: tz.value,
    })
  }
  styles={{
    control: (base) => ({
      ...base,
      minHeight: "44px",
      borderRadius: "12px",
      borderColor: "rgba(18,35,89,0.12)",
      boxShadow: "none",
      fontSize: "13px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }}
/>
                  </div>
                </div>
                <div
                  style={{
                    borderTop: "1px solid rgba(18,35,89,0.06)",
                    marginTop: 8,
                    paddingTop: 20,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <button
                    className="btn btn-default"
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      borderRadius: 12,
                      fontWeight: 700,
                      boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                    }}
                  >
                    {loading ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
                  </button>
                  <button
                    className="btn btn-border"
                    type="button"
                    disabled={loading}
                    onClick={fetchAccount}
                  >
                    Cancel
                  </button>
                </div>
              </Card>
            )}

            {/* ════════════════════════════════
                LANGUAGE
            ════════════════════════════════ */}
            {activeTab === "language" && (
              <Card>
                <SectionHeader
                  icon="fi-rr-globe"
                  title="Language Preference"
                  subtitle="Set your preferred language for the portal interface and email communications"
                />
                <div className="row">
                  <div className="col-lg-6 col-12 mb-20">
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#66789c",
                      }}
                    >
                      Primary Language <span style={{ color: "#e03" }}>*</span>
                    </label>
                    <select
                      className="form-control form-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{
                        height: 44,
                        fontSize: 13,
                        borderRadius: 12,
                        border: "1px solid rgba(18,35,89,0.12)",
                      }}
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 11,
                        color: "#94a3b8",
                      }}
                    >
                      Used for portal interface and system notifications.
                    </p>
                  </div>
                  <div className="col-lg-6 col-12 mb-20">
                    <label
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#66789c",
                      }}
                    >
                      Secondary Language{" "}
                      <span style={{ fontSize: 11, fontWeight: 400 }}>
                        (Optional)
                      </span>
                    </label>
                    <select
                      className="form-control form-select"
                      value={secondaryLanguage}
                      onChange={(e) => setSecondaryLanguage(e.target.value)}
                      style={{
                        height: 44,
                        fontSize: 13,
                        borderRadius: 12,
                        border: "1px solid rgba(18,35,89,0.12)",
                      }}
                    >
                      <option value="">-- None --</option>
                      {LANGUAGES.filter((l) => l !== language).map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 11,
                        color: "#94a3b8",
                      }}
                    >
                      Shown as alternate in candidate-facing job listings.
                    </p>
                  </div>
                </div>

                {/* Current setting preview */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: 16,
                    marginBottom: 24,
                    background: "#fff7ea",
                    border: "1px solid rgba(255,163,0,0.18)",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontWeight: 700,
                      color: "#122359",
                      fontSize: 13,
                    }}
                  >
                    Current Language Setting
                  </p>
                  <p style={{ margin: 0, color: "#66789c", fontSize: 13 }}>
                    Portal language:{" "}
                    <strong style={{ color: "#122359" }}>{language}</strong>
                    {secondaryLanguage && (
                      <>
                        {" "}
                        &nbsp;·&nbsp; Secondary:{" "}
                        <strong style={{ color: "#122359" }}>
                          {secondaryLanguage}
                        </strong>
                      </>
                    )}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: "1px solid rgba(18,35,89,0.06)",
                    paddingTop: 20,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <button
                    className="btn btn-default"
                    type="button"
                    onClick={handleLangSave}
                    style={{
                      borderRadius: 12,
                      fontWeight: 700,
                      boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                    }}
                  >
                    {langSaved ? "✓ Saved" : "Save Language"}
                  </button>
                  <button
                    className="btn btn-border"
                    type="button"
                    onClick={() => {
                      setLanguage("English");
                      setSecondaryLanguage("");
                    }}
                    style={{ borderRadius: 12, fontWeight: 700 }}
                  >
                    Reset to Default
                  </button>
                </div>
              </Card>
            )}

            {/* ════════════════════════════════
                SECURITY  (styled like sub-user page)
            ════════════════════════════════ */}
            {activeTab === "security" && (
              <>
                {/* OTP banner */}
                <Card>
                  <SectionHeader
                    icon="fi-rr-lock"
                    title="Security"
                    subtitle="Manage authentication and active sessions"
                  />

                  {/* OTP info row */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: 16,
                      marginBottom: 24,
                      background: "#fff7ea",
                      border: "1px solid rgba(255,163,0,0.18)",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontWeight: 700,
                        color: "#122359",
                        fontSize: 14,
                      }}
                    >
                      OTP-based Login Active
                    </p>
                    <p style={{ margin: 0, color: "#66789c", fontSize: 13 }}>
                      Your account uses mobile OTP for authentication. No
                      password is required.
                    </p>
                  </div>

                  {/* 2FA */}
                  <h6
                    style={{
                      color: "#122359",
                      fontWeight: 800,
                      marginBottom: 14,
                    }}
                  >
                    Two-Factor Authentication
                  </h6>
                  <div
                    className="candidate-notification-point"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      padding: "16px 18px",
                      borderRadius: 18,
                      border: "1px solid rgba(18,35,89,0.06)",
                      marginBottom: 24,
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: "#fff7ea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ff9900",
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        <i className="fi-rr-mobile" />
                      </div>
                      <div>
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontWeight: 700,
                            color: "#122359",
                            fontSize: 14,
                          }}
                        >
                          Mobile OTP
                        </p>
                        <p
                          style={{ margin: 0, color: "#66789c", fontSize: 13 }}
                        >
                          OTP sent to +91 98765 43210 on every login
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 14px",
                        borderRadius: 999,
                        background: "#ecfdf3",
                        color: "#0BAB7C",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Enabled
                    </span>
                  </div>
                </Card>

                {/* Active Sessions — card-per-session like sub-user cards */}
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div>
                      <h5
                        style={{
                          color: "#122359",
                          fontWeight: 800,
                          marginBottom: 4,
                        }}
                      >
                        Active Sessions
                      </h5>
                      <p style={{ margin: 0, color: "#66789c", fontSize: 13 }}>
                        Devices currently signed in to your account.
                      </p>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: "#EAF4FF",
                        border: "1px solid #B9DCFF",
                        color: "#1D4ED8",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {sessions.length} active
                    </span>
                  </div>

                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className="subuser-hover-card"
                      style={{
                        background: "#ffffff",
                        borderRadius: 22,
                        boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                        padding: 22,
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 20,
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          flex: 1,
                          minWidth: 220,
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 16,
                            flexShrink: 0,
                            background: "#fff7ea",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ff9900",
                            fontSize: 20,
                          }}
                        >
                          <i className={session.icon} />
                        </div>
                        <div>
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontWeight: 700,
                              color: "#122359",
                              fontSize: 14,
                            }}
                          >
                            {session.device}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              color: "#66789c",
                              fontSize: 13,
                            }}
                          >
                            {session.location} &nbsp;·&nbsp; {session.time}
                          </p>
                        </div>
                      </div>
                      {session.current ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "6px 14px",
                            borderRadius: 999,
                            background: "#ecfdf3",
                            color: "#0BAB7C",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Current Session
                        </span>
                      ) : (
                        <button
                          className="btn btn-border btn-sm"
                          type="button"
                          onClick={() => handleRevokeSession(session.sessionId)}
                          style={{
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          <i
                            className="fi-rr-cross-circle"
                            style={{ marginRight: 5 }}
                          />
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ════════════════════════════════
                PREFERENCES  (styled like notifications page)
            ════════════════════════════════ */}
            {activeTab === "preferences" && (
              <>
                {/* Email Notification Preferences */}
                <div
                  className="subuser-hover-card"
                  style={{
                    background: "#ffffff",
                    borderRadius: 24,
                    boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                    padding: 28,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div>
                      <h5
                        style={{
                          margin: "0 0 4px",
                          color: "#122359",
                          fontWeight: 800,
                        }}
                      >
                        Email Notifications
                      </h5>
                      <p style={{ margin: 0, color: "#66789c", fontSize: 13 }}>
                        Control which employer alerts you want to receive.
                      </p>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: "#EAF4FF",
                        border: "1px solid #B9DCFF",
                        color: "#1D4ED8",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {notifPrefs.filter((p) => p.enabled).length} enabled
                    </span>
                  </div>

                  {notifPrefs.map((pref, i) => (
                    <div
                      key={pref.label}
                      className="candidate-notification-point"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 14,
                        padding: "16px 18px",
                        borderRadius: 18,
                        border: "1px solid rgba(18,35,89,0.06)",
                        marginBottom: 12,
                        background: "#ffffff",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#122359",
                            fontWeight: 700,
                            marginBottom: 4,
                            fontSize: 14,
                          }}
                        >
                          {pref.label}
                        </div>
                        <div
                          style={{
                            color: "#66789c",
                            fontSize: 12,
                            lineHeight: 1.6,
                          }}
                        >
                          {pref.desc}
                        </div>
                      </div>
                      <Toggle
                        enabled={pref.enabled}
                        onToggle={() => toggleNotif(i)}
                      />
                    </div>
                  ))}
                </div>

                {/* Display Preferences */}
                <div
                  className="subuser-hover-card"
                  style={{
                    background: "#ffffff",
                    borderRadius: 24,
                    boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                    padding: 28,
                    marginBottom: 24,
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 20px",
                      color: "#122359",
                      fontWeight: 800,
                    }}
                  >
                    Display
                  </h5>
                  <div className="row">
                    <div className="col-lg-6 col-12 mb-15">
                      <label
                        style={{
                          display: "block",
                          marginBottom: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#66789c",
                        }}
                      >
                        Items per page
                      </label>
                      <select
                        className="form-control form-select"
                        defaultValue="10"
                        style={{
                          height: 44,
                          fontSize: 13,
                          borderRadius: 12,
                          border: "1px solid rgba(18,35,89,0.12)",
                        }}
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                    <div className="col-lg-6 col-12 mb-15">
                      <label
                        style={{
                          display: "block",
                          marginBottom: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#66789c",
                        }}
                      >
                        Date Format
                      </label>
                      <select
                        className="form-control form-select"
                        defaultValue="dd-mmm-yyyy"
                        style={{
                          height: 44,
                          fontSize: 13,
                          borderRadius: 12,
                          border: "1px solid rgba(18,35,89,0.12)",
                        }}
                      >
                        <option value="dd-mmm-yyyy">DD MMM YYYY</option>
                        <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                        <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      </select>
                    </div>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid rgba(18,35,89,0.06)",
                      paddingTop: 20,
                      marginTop: 8,
                    }}
                  >
                    <button
                      className="btn btn-default"
                      type="button"
                      onClick={handleSave}
                      style={{
                        borderRadius: 12,
                        fontWeight: 700,
                        boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                      }}
                    >
                      {saved ? "✓ Saved" : "Save Preferences"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ════════════════════════════════
                DELETE ACCOUNT  (danger zone)
            ════════════════════════════════ */}
            {activeTab === "danger" && (
              <>
                {/* Warning card — same as subuser info card */}
                <div
                  className="subuser-hover-card"
                  style={{
                    background: "#fff8f8",
                    borderRadius: 24,
                    boxShadow: "0 4px 14px rgba(160,0,0,0.04)",
                    padding: "22px 28px",
                    marginBottom: 24,
                    border: "1px solid rgba(224,32,32,0.14) !important",
                  }}
                >
                  <SectionHeader
                    icon="fi-rr-trash"
                    title="Delete Account"
                    subtitle="These actions are permanent and cannot be undone. Please proceed with caution."
                    danger
                  />
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: 14,
                      background: "#fff5f5",
                      border: "1px solid rgba(224,32,32,0.16)",
                      color: "#c0392b",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <i className="fi-rr-info" style={{ marginRight: 7 }} />
                    Deleted accounts cannot be recovered. All jobs, applicants,
                    and billing data will be permanently removed.
                  </div>
                </div>

                {/* Action cards — styled like subuser user cards */}
                {[
                  {
                    icon: "fi-rr-pause",
                    iconBg: "#fff7ea",
                    iconColor: "#ff9900",
                    title: "Deactivate Account",
                    desc: "Temporarily disable your account. Your jobs and data will be hidden but not deleted. You can reactivate at any time by contacting support.",
                    tag: "Reversible",
                    tagBg: "#ecfdf3",
                    tagColor: "#0BAB7C",
                    btnLabel: "Deactivate Account",
                    btnClass: "btn-border",
                  },
                  {
                    icon: "fi-rr-trash",
                    iconBg: "#fff5f5",
                    iconColor: "#e02020",
                    title: "Delete All Jobs",
                    desc: "Permanently delete all posted jobs and their applicant data. This action cannot be undone.",
                    tag: "Irreversible",
                    tagBg: "#fff0f0",
                    tagColor: "#e02020",
                    btnLabel: "Delete All Jobs",
                    btnClass: "btn-border",
                  },
                  {
                    icon: "fi-rr-user-delete",
                    iconBg: "#fff0f0",
                    iconColor: "#c0392b",
                    title: "Delete Account",
                    desc: "Permanently delete your employer account, all jobs, applicants, and billing history. This cannot be reversed.",
                    tag: "Permanent",
                    tagBg: "#fff0f0",
                    tagColor: "#c0392b",
                    btnLabel: "Delete Account",
                    btnClass: "btn-danger",
                  },
                ].map((action) => (
                  <div
                    key={action.title}
                    className="subuser-hover-card"
                    style={{
                      background: "#ffffff",
                      borderRadius: 22,
                      boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                      padding: 24,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 20,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Left */}
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          flex: 1,
                          minWidth: 260,
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 16,
                            flexShrink: 0,
                            background: action.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: action.iconColor,
                            fontSize: 20,
                          }}
                        >
                          <i className={action.icon} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flexWrap: "wrap",
                              marginBottom: 6,
                            }}
                          >
                            <h5
                              style={{
                                margin: 0,
                                color: "#122359",
                                fontWeight: 700,
                              }}
                            >
                              {action.title}
                            </h5>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 10px",
                                borderRadius: 999,
                                background: action.tagBg,
                                color: action.tagColor,
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {action.tag}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              color: "#66789c",
                              fontSize: 13,
                              lineHeight: 1.7,
                            }}
                          >
                            {action.desc}
                          </p>
                        </div>
                      </div>
                      {/* Button */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          paddingTop: 4,
                        }}
                      >
                        <button
                          className={`btn ${action.btnClass} btn-sm`}
                          type="button"
                          style={{
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {action.btnLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerSettingsPage;
