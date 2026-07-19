"use client";


import { useToast } from "@/components/Toast";
import { getCandidateId } from "@/utils/authHelper";
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
  const candidateId = getCandidateId();
 const [settings, setSettings] = useState(DEFAULT_SETTINGS);

useEffect(() => {
  loadNotifications();
}, []);

const loadNotifications = async () => {
  try {
   const response = await getNotifications(candidateId);

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
  }
};

  const activeCount = useMemo(
    () => Object.values(settings).filter(Boolean).length,
    [settings]
  );

  const toggleSetting = (id) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

 const handleReset = async () => {
  try {
    const response =
      await resetNotifications(
        candidateId
      );

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
      "Reset failed",
      "error"
    );
  }
};

  const handleSave = async () => {
  try {
    const payload = {
      jobMatches: settings.jobMatches,
      applicationUpdates:
        settings.applicationUpdates,
      recruiterMessages:
        settings.messages,
      documentReminders:
        settings.documentAlerts,
      offersAnnouncements:
        settings.marketing,
    };

    const response =
      await updateNotifications(
        candidateId,
        payload
      );

    if (response?.data?.success) {
      showToast(
        "Notification settings saved.",
        "success"
      );
    }
  } catch (error) {
    console.error(error);

    showToast(
      "Failed to save notifications",
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
                aria-label={`Toggle ${item.label}`}
                style={{
                  width: "42px",
                  height: "24px",
                  borderRadius: "999px",
                  border: "none",
                  background: settings[item.id] ? "#ffa300" : "#ffc151",
                  position: "relative",
                  flexShrink: 0
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
          <button type="button" className="btn btn-brand-1 btn-small" onClick={handleSave}>
            Save Notifications
          </button>
        </div>
      </div>
    </SettingsPageShell>
  );
};

export default CandidateNotificationsSettingsPage;