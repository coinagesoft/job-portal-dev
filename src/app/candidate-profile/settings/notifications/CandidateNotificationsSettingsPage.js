"use client";


import { useToast } from "@/components/Toast";
import SettingsPageShell from "../components/SettingsPageShell";

import { useEffect, useMemo, useState } from "react";

import {
  getNotifications,
  updateNotifications,
  resetNotifications,
} from "@/services/settingCandidate/notificationService";

const NOTIFICATION_ITEMS = [
  {
    id: "jobMatches",
    label: "Job matches",
    description: "New jobs based on your trade, location, and profile preferences."
  },
  {
    id: "applicationUpdates",
    label: "Application updates",
    description: "Status changes such as shortlisted, interview, or rejected."
  },
  {
    id: "messages",
    label: "Recruiter messages",
    description: "Direct messages and follow-up requests from employers."
  },
  {
    id: "documentAlerts",
    label: "Document reminders",
    description: "Expiry and missing-document reminders for your profile."
  },
  {
    id: "marketing",
    label: "Offers and announcements",
    description: "Product updates, tips, and special plan offers."
  }
];

const DEFAULT_SETTINGS = {
  jobMatches: true,
  applicationUpdates: true,
  messages: true,
  documentAlerts: true,
  marketing: false
};

const CandidateNotificationsSettingsPage = () => {
  const showToast = useToast();
 const [settings, setSettings] = useState(DEFAULT_SETTINGS);
 const [savingId, setSavingId] = useState(null);

useEffect(() => {
  loadNotifications();
}, []);

const loadNotifications = async () => {
  try {
   const response = await getNotifications();

console.log("GET Notifications Response:", response.data);

    if (response?.data?.success) {
      const data = response.data.data;

      setSettings({
        jobMatches: data.jobMatches,
        applicationUpdates:
          data.applicationUpdates,
        messages:
          data.recruiterMessages,
        documentAlerts:
          data.documentReminders,
        marketing:
          data.offersAnnouncements,
      });
    }
  } catch (error) {
    console.error(
      "Notification Load Error",
      error
    );
    showToast(
      error.response?.data?.message ||
        "Failed to load notification preferences.",
      "error",
    );
  }
};

  const activeCount = useMemo(
    () => Object.values(settings).filter(Boolean).length,
    [settings]
  );

  // Each toggle saves immediately (matching the employer notifications
  // page's behavior) instead of silently only updating local state until
  // some later "Save" click — the toggle IS the save action. Optimistic
  // update with rollback on failure so the switch never lies about what
  // actually got persisted.
  const toggleSetting = async (id) => {
    const next = { ...settings, [id]: !settings[id] };
    setSettings(next);
    setSavingId(id);

    const payload = {
      jobMatches: next.jobMatches,
      applicationUpdates: next.applicationUpdates,
      recruiterMessages: next.messages,
      documentReminders: next.documentAlerts,
      offersAnnouncements: next.marketing,
    };

    try {
      const response = await updateNotifications(payload);

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message || "Failed to save preference.",
        );
      }

      showToast("Preference updated.", "success");
    } catch (error) {
      console.error(error);
      setSettings(settings); // revert on failure
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to save preference.",
        "error",
      );
    } finally {
      setSavingId(null);
    }
  };

 const handleReset = async () => {
  try {
    const response =
      await resetNotifications();

    if (response?.data?.success) {
      await loadNotifications();

      showToast(
        "Notification settings reset.",
        "info"
      );
    }
  } catch (error) {
    console.error(error);

    showToast(
      error.response?.data?.message || "Reset failed",
      "error"
    );
  }
};

  return (
    <SettingsPageShell
      title="Notifications"
      description="Choose which alerts you want to receive for your candidate account."
    >
      <div className="candidate-settings-card mb-20">
        <div className="d-flex align-items-center justify-content-between mb-10">
          <h5 className="mb-0">Notification Preferences</h5>
          <span className="font-xs color-text-paragraph-2">
            {activeCount} of {NOTIFICATION_ITEMS.length} enabled
          </span>
        </div>

        <div>
          {NOTIFICATION_ITEMS.map((item) => (
            <div
              key={item.id}
              className="d-flex align-items-center justify-content-between py-12 px-10 mb-10 candidate-notification-point"
              style={{ gap: "12px" }}
            >
              <div>
                <p className="font-sm mb-2" style={{ color: "#122359", fontWeight: 700 }}>
                  {item.label}
                </p>
                <p className="font-xs mb-0 color-text-paragraph-2">{item.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSetting(item.id)}
                disabled={savingId === item.id}
                aria-label={`Toggle ${item.label}`}
                style={{
                  width: "42px",
                  height: "24px",
                  borderRadius: "999px",
                  border: "none",
                  background: settings[item.id] ? "#ffa300" : "#ffc151",
                  position: "relative",
                  flexShrink: 0,
                  opacity: savingId === item.id ? 0.6 : 1,
                  cursor: savingId === item.id ? "not-allowed" : "pointer",
                }}
              >
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#fff",
                    position: "absolute",
                    top: "3px",
                    left: settings[item.id] ? "21px" : "3px",
                    transition: "left 0.2s ease"
                  }}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="candidate-settings-actions mt-20">
          <button
  type="button"
  className="btn btn-border btn-small"
  onClick={handleReset}
>
  Reset Notifications
</button>
        </div>
      </div>
    </SettingsPageShell>
  );
};

export default CandidateNotificationsSettingsPage;