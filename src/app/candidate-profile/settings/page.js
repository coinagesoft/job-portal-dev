"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

const LANGUAGES = [
  "English", "Hindi", "Marathi", "Bengali", "Tamil", "Telugu",
  "Kannada", "Malayalam", "Gujarati", "Punjabi", "Urdu", "Odia",
  "Arabic", "French", "German",
];

const SETTINGS_SHORTCUTS = [
  {
    title: "Notifications",
    description: "Control email, SMS, and in-app alerts for your candidate account.",
    href: "/candidate-profile/settings/notifications",
  },
  {
    title: "Help & Support",
    description: "Find quick answers, raise support tickets, and contact the team.",
    href: "/candidate-profile/settings/help-support",
  },
];

const SECURITY_ITEMS = [
  { label: "Two-factor authentication", value: "Enabled" },
  { label: "Last password update", value: "07 Apr 2026" },
  { label: "Recent login", value: "Today at 10:42 AM" },
];

const CandidateSettingsPage = () => {
  const showToast = useToast();
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
  const [visibility, setVisibility] = useState("Recruiters from applied jobs only");
  const [comms, setComms] = useState("Email + In-app notifications");

  const handleSave = () => {
    setSaved(true);
    showToast("Settings saved successfully!", "success");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="candidate-inner-panel">
            <h3 className="mt-0 color-brand-1 mb-20">Settings</h3>
            <p className="font-md color-text-paragraph-2 mb-30">
              Manage your account preferences, security, and candidate communication options.
            </p>

            <div className="candidate-settings-shortcuts mb-30">
              {SETTINGS_SHORTCUTS.map((item) => (
                <Link key={item.href} href={item.href} className="candidate-settings-shortcut hover-up">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <span className="candidate-settings-shortcut-link">Open section</span>
                </Link>
              ))}
            </div>

            <div className="row">
              <div className="col-xl-7 col-lg-7 col-md-12">
                <div className="candidate-settings-card mb-20">
                  <h5 className="mb-20">Profile Preferences</h5>
                  <div className="candidate-settings-form-grid">

                    {/* Language Preference */}
                    <div className="input-style-1">
                      <label className="font-sm color-text-mutted mb-10">Preferred Language</label>
                      <select
                        className="form-control form-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-style-1">
                      <label className="font-sm color-text-mutted mb-10">Time Zone</label>
                      <select
                        className="form-control form-select"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      >
                        <option value="Asia/Kolkata (IST)">Asia / Kolkata (IST)</option>
                        <option value="Asia/Dubai (GST)">Asia / Dubai (GST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York (EST)">America / New York (EST)</option>
                        <option value="Europe/London (GMT)">Europe / London (GMT)</option>
                      </select>
                    </div>

                    <div className="input-style-1">
                      <label className="font-sm color-text-mutted mb-10">Default Resume Visibility</label>
                      <select
                        className="form-control form-select"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                      >
                        <option>Recruiters from applied jobs only</option>
                        <option>All verified recruiters</option>
                        <option>Private (hidden from all)</option>
                      </select>
                    </div>

                    <div className="input-style-1">
                      <label className="font-sm color-text-mutted mb-10">Communication Preference</label>
                      <select
                        className="form-control form-select"
                        value={comms}
                        onChange={(e) => setComms(e.target.value)}
                      >
                        <option>Email + In-app notifications</option>
                        <option>Email only</option>
                        <option>In-app only</option>
                        <option>SMS + Email</option>
                      </select>
                    </div>
                  </div>

                  <div className="candidate-settings-actions">
                    <button
                      type="button"
                      className="btn btn-default btn-small"
                      onClick={() => {
                        setLanguage("English");
                        setTimezone("Asia/Kolkata (IST)");
                        setVisibility("Recruiters from applied jobs only");
                        setComms("Email + In-app notifications");
                      }}
                    >
                      Discard
                    </button>
                    <button type="button" className="btn btn-brand-1 btn-small" onClick={handleSave}>
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-xl-5 col-lg-5 col-md-12">
                <div className="candidate-settings-card mb-20">
                  <h6 className="mb-15">Security Snapshot</h6>
                  <ul className="candidate-settings-simple-list">
                    {SECURITY_ITEMS.map((item) => (
                      <li key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </li>
                    ))}
                  </ul>
                  <Link className="candidate-settings-inline-link" href="/candidate-profile/settings/help-support">
                    Need help with account security?
                  </Link>
                </div>

                <div className="candidate-settings-card">
                  <h6 className="mb-15">Account Status</h6>
                  <div className="candidate-settings-inline-stat">
                    <span>Plan</span>
                    <strong>Candidate Plus</strong>
                  </div>
                  <div className="candidate-settings-inline-stat">
                    <span>Language</span>
                    <strong>{language}</strong>
                  </div>
                  <div className="candidate-settings-inline-stat">
                    <span>Time Zone</span>
                    <strong>{timezone}</strong>
                  </div>
                  <div className="candidate-settings-inline-stat">
                    <span>Profile Visibility</span>
                    <strong>{visibility}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CandidateSettingsPage;
