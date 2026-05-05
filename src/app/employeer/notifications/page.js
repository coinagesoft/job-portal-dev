"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

const allNotifications = [
  {
    id: "n1",
    title: "New Applicant",
    message: "Ramesh K. Sharma applied for Welder 6G - Mumbai",
    time: "2 hours ago",
    read: false,
    type: "applicant",
  },
  {
    id: "n2",
    title: "New Applicant",
    message: "Priya Singh applied for Marine Engineer - Gulf Region",
    time: "5 hours ago",
    read: false,
    type: "applicant",
  },
  {
    id: "n3",
    title: "Credit Alert",
    message: "Your credit pack expires in 14 days.",
    time: "1 day ago",
    read: false,
    type: "credit",
  },
];

const typeColors = {
  applicant: "#185FA5",
  credit: "#BA7517",
};

const EmployerNotificationsPage = () => {
  const showToast = useToast();

  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState("all");

  // ✅ NEW STATE FOR TOGGLES
  const [preferences, setPreferences] = useState([
    { label: "New applicants", enabled: true },
    { label: "Credit & billing alerts", enabled: true },
    { label: "Job status updates", enabled: true },
    { label: "System messages", enabled: false },
  ]);

  // ✅ TOGGLE FUNCTION
  const togglePreference = (index) => {
    setPreferences((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      )
    );

    showToast("Preference updated", "info");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read.", "success");
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

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
                  <span>
                    {unreadCount} unread
                  </span>
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
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${filter === "unread" ? "btn-default" : "btn-border"}`}
                onClick={() => setFilter("unread")}
              >
                Unread
              </button>
            </div>

            {/* LIST */}
            {filtered.map((notif) => (
              <div
                key={notif.id}
                className="card-grid-2 mb-10"
                style={{
                  background: notif.read ? "#fff" : "#eef6ff",
                  cursor: "pointer",
                }}
                onClick={() => markRead(notif.id)}
              >
                <div className="card-block-info p-20">
                  <p><strong>{notif.title}</strong></p>
                  <p>{notif.message}</p>
                  <small>{notif.time}</small>
                </div>
              </div>
            ))}

            {/* ✅ FIXED TOGGLE SECTION */}
            <div className="card-grid-2 mt-20">
              <div className="card-block-info p-20">
                <h5>Notification Preferences</h5>

                <div className="row">
                  {preferences.map((pref, index) => (
                    <div className="col-lg-6 mb-10" key={pref.label}>
                      <div
                        onClick={() => togglePreference(index)}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: "8px",
                          padding: "10px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <span>{pref.label}</span>

                        {/* SWITCH */}
                        <div
                          style={{
                            width: "40px",
                            height: "22px",
                            borderRadius: "20px",
                            background: pref.enabled ? "#3C65F5" : "#ddd",
                            position: "relative",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <div
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              background: "#fff",
                              position: "absolute",
                              top: "2px",
                              left: pref.enabled ? "20px" : "2px",
                              transition: "all 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerNotificationsPage;