"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/Toast";
import SettingsPageShell from "../components/SettingsPageShell";

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

  const activeCount = useMemo(
    () => Object.values(settings).filter(Boolean).length,
    [settings]
  );

  const toggleSetting = (id) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    showToast("Notification settings reset.", "info");
  };

  const handleSave = () => {
    showToast("Notification settings saved.", "success");
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
              className="d-flex align-items-center justify-content-between py-12 px-10 mb-10"
              style={{ border: "1px solid #e3e8f5", borderRadius: "10px", gap: "12px" }}
            >
              <div>
                <p className="font-sm mb-2" style={{ color: "#05264e", fontWeight: 700 }}>
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
                  background: settings[item.id] ? "#3C65F5" : "#d6ddea",
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
          <button type="button" className="btn btn-default btn-small" onClick={handleReset}>
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
