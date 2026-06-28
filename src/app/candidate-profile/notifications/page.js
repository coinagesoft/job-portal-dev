"use client";

import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/services/candidate/notificationFeedService";
import { useToast } from "@/components/Toast";

const NAVY = "#122359";
const GOLD = "#ffa300";

export default function CandidateNotificationsPage() {
  const showToast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async (selected = filter) => {
    try {
      setLoading(true);
      const data = await getNotifications(selected);
      setNotifications(data?.notifications || data || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const onRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          (n.notificationId || n.id) === id ? { ...n, isRead: true } : n,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onReadAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast("All notifications marked as read.", "success");
    } catch (error) {
      console.error(error);
      showToast("Could not update notifications.", "error");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <h4 style={{ color: NAVY, margin: 0 }}>Notifications</h4>
          <span style={{ fontSize: 13, color: "#66789c" }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "unread"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: `1px solid ${filter === f ? NAVY : "rgba(18,35,89,0.12)"}`,
                background: filter === f ? NAVY : "#fff",
                color: filter === f ? "#fff" : NAVY,
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={onReadAll}
            disabled={unreadCount === 0}
            style={{
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: unreadCount === 0 ? "default" : "pointer",
              border: `1px solid ${GOLD}`,
              background: "#fff7ea",
              color: "#ff9900",
              opacity: unreadCount === 0 ? 0.5 : 1,
            }}
          >
            Mark all read
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#66789c", fontSize: 14 }}>Loading…</p>
      ) : notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            border: "1px solid rgba(18,35,89,0.07)",
            borderRadius: 18,
            color: "#66789c",
          }}
        >
          <i className="fi-rr-bell" style={{ fontSize: 28, color: "#9aa7c2" }} />
          <p style={{ margin: "10px 0 0", fontSize: 14 }}>No notifications.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((n) => {
            const id = n.notificationId || n.id;
            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(18,35,89,0.07)",
                  background: n.isRead ? "#fff" : "#fff7ea",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    marginTop: 6,
                    flexShrink: 0,
                    background: n.isRead ? "transparent" : GOLD,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: NAVY, fontSize: 14 }}>
                    {n.title || n.type || "Notification"}
                  </div>
                  <div style={{ fontSize: 13, color: "#4f5e64", marginTop: 2 }}>
                    {n.message || n.body}
                  </div>
                  <div style={{ fontSize: 11, color: "#9aa7c2", marginTop: 4 }}>
                    {n.timeAgo || n.createdAt}
                  </div>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => onRead(id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff9900",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}