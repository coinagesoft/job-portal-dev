"use client";

import { useEffect, useState } from "react";

import {
  getNotifications,
  markAllAsRead as markAllReadApi,
  getSettings,
  updateSettings,
} from "@/services/recruiter/recruiterNotificationService";
import { useToast } from "@/components/Toast";

const EmployerNotificationsPage = () => {
  const showToast = useToast();

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const [preferences, setPreferences] = useState({
    newApplicantAlerts: true,
    creditBillingAlerts: true,
    jobStatusUpdates: true,
    systemMessages: true,
  });
  const loadNotifications = async (selectedFilter = filter) => {
    try {
      setLoading(true);

      const response = await getNotifications(selectedFilter);

      setNotifications(response.notifications || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ TOGGLE FUNCTION
  const togglePreference = async (key) => {
    try {
      const updated = {
        ...preferences,
        [key]: !preferences[key],
      };

      setPreferences(updated);

      await updateSettings(updated);

      showToast("Preference updated", "success");
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllReadApi();

      await loadNotifications();

      showToast("All notifications marked as read", "success");
    } catch (error) {
      console.error(error);
    }
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };
  const loadSettings = async () => {
    try {
      const response = await getSettings();

      setPreferences(response);
    } catch (error) {
      console.error(error);
    }
  };
  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);
  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">
            {/* HEADER */}
            <div className="box-filters-job mb-30">
              <div className="row align-items-center">
                <div className="col-xl-8">
                  <h3>Notifications</h3>
                  <span>{unreadCount} unread</span>
                </div>
                <div className="col-xl-4 text-end">
                  <button
                    className="btn btn-border btn-sm"
                    onClick={markAllRead}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            </div>

            {/* FILTER */}
            <div className="mb-20">
              <button
                className={`btn btn-sm mr-10 ${filter === "all" ? "btn-default" : "btn-border"}`}
                onClick={() => {
                  setFilter("all");
                  loadNotifications("all");
                }}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${filter === "unread" ? "btn-default" : "btn-border"}`}
                onClick={() => {
                  setFilter("unread");
                  loadNotifications("unread");
                }}
              >
                Unread
              </button>
            </div>

            {/* LIST */}
            {filtered.map((notif) => (
              <div
                key={notif.notificationId}
                className="notification-hover-card mb-15"
                style={{
                  background: "#ffffff",
                  borderRadius: "22px",
                  border: notif.isRead
                    ? "1px solid rgba(18,35,89,0.08)"
                    : "1px solid rgba(255,153,0,0.22)",
                  boxShadow: notif.isRead
                    ? "0 4px 14px rgba(18,35,89,0.04)"
                    : "0 10px 24px rgba(255,153,0,0.08)",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "all .35s ease",
                  position: "relative",
                }}
                onClick={() => markRead(notif.notificationId)}
              >
                <div
                  className="card-block-info"
                  style={{
                    padding: "22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#122359",
                        fontWeight: 700,
                        fontSize: "15px",
                      }}
                    >
                      {notif.title}
                    </p>

                    {!notif.isRead && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px 12px",
                          borderRadius: "999px",
                          background: "#EAF4FF",
                          border: "1px solid #B9DCFF",
                          color: "#1D4ED8",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      color: "#66789c",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      marginBottom: "12px",
                    }}
                  >
                    {notif.message}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#94a3b8",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    <i className="fi fi-rr-time-quarter-to" />
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            {/* ✅ FIXED TOGGLE SECTION */}
            {/* Notification Preferences */}
            <div
              className="subuser-hover-card mt-20"
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(18,35,89,0.08)",
                boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                padding: "28px",
                transition: "all .35s ease",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-20 flex-wrap gap-10">
                <div>
                  <h5
                    style={{
                      marginBottom: "4px",
                      color: "#122359",
                      fontWeight: 800,
                    }}
                  >
                    Notification Preferences
                  </h5>

                  <p
                    style={{
                      marginBottom: 0,
                      color: "#66789c",
                      fontSize: "13px",
                    }}
                  >
                    Control which employer alerts you want to receive.
                  </p>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "#EAF4FF",
                    border: "1px solid #B9DCFF",
                    color: "#1D4ED8",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {Object.values(preferences).filter(Boolean).length} enabled
                </span>
              </div>

              <div>
                {[
                  {
                    key: "newApplicantAlerts",
                    label: "New applicants",
                  },
                  {
                    key: "creditBillingAlerts",
                    label: "Credit & billing alerts",
                  },
                  {
                    key: "jobStatusUpdates",
                    label: "Job status updates",
                  },
                  {
                    key: "systemMessages",
                    label: "System messages",
                  },
                ].map((pref) => (
                  <div
                    key={pref.label}
                    className="candidate-notification-point"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "14px",
                      padding: "16px 18px",
                      borderRadius: "18px",
                      border: "1px solid rgba(18,35,89,0.06)",
                      marginBottom: "12px",
                      background: "#ffffff",
                      transition: "all .3s ease",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#122359",
                          fontWeight: 700,
                          marginBottom: "4px",
                          fontSize: "14px",
                        }}
                      >
                        {pref.label}
                      </div>

                      <div
                        style={{
                          color: "#66789c",
                          fontSize: "12px",
                          lineHeight: 1.6,
                        }}
                      >
                        Receive alerts related to {pref.label.toLowerCase()}.
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => togglePreference(pref.key)}
                      aria-label={`Toggle ${pref.label}`}
                      style={{
                        width: "46px",
                        height: "26px",
                        borderRadius: "999px",
                        border: "none",
                        background: preferences[pref.key]
                          ? "#ffa300"
                          : "#dbe4f0",
                        position: "relative",
                        transition: "all .25s ease",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#fff",
                          position: "absolute",
                          top: "3px",
                          left: preferences[pref.key] ? "23px" : "3px",
                          transition: "all .25s ease",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerNotificationsPage;
