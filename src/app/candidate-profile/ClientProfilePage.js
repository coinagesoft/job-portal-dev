"use client";
import { getCandidateId } from "@/utils/authHelper";
import { getProfileCompletion } from "@/services/candidate/profileCompletionService";
import { State } from "country-state-city";

import { useRouter } from "next/navigation";

import {
  getAvailability,
  updateAvailability,
} from "@/services/candidate/availabilityService";

import {
  getSkills,
  createSkill,
  updateSkill as updateCandidateSkill,
  deleteSkill,
} from "@/services/candidate/skillsService";

import {
  getWorkExperience,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
} from "@/services/candidate/workExperienceService";

import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from "@/services/candidate/educationService";

import {
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "@/services/candidate/languagesService";

import {
  uploadResume,
  deleteResume,
  getDocuments,
} from "@/services/candidate/candidateResume.js";

import {
  uploadEducationCertificate,
  deleteEducationCertificate,
  getEducationCertificates,
} from "@/services/candidate/candidateEducationCert.js";

import {
  uploadPassport,
  deletePassport,
} from "@/services/candidate/candidatePassport";

import api from "@/services/api";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { mockProfile } from "./components/data.js";
import MyDocuments from "./components/MyDocuments";
import { useToast } from "@/components/Toast";

// ─── Theme tokens (matches site globals.css) ────────────────────────────────
const T = {
  navy: "#122359",
  orange: "#ffa300",
  orangeLight: "#ffc151",
  text: "#4f5e64",
  muted: "#66789c",
  border: "#e8ecf0",
  bg: "#f5f7fa",
  white: "#fff",
  success: "#3b6d11",
  successBg: "#eaf3de",
  error: "#a32d2d",
  errorBg: "#fcebeb",
};

// ─── Steps definition ────────────────────────────────────────────────────────
const STEPS = [
  { id: "personal", label: "Personal", iconClass: "fi-rr-user" },
  { id: "documents", label: "Documents", iconClass: "fi-rr-document" },
  { id: "work", label: "Experience", iconClass: "fi-rr-briefcase" },
  { id: "education", label: "Education", iconClass: "fi-rr-graduation-cap" },
  { id: "skills", label: "Skills", iconClass: "fi-rr-settings" },
  { id: "languages", label: "Languages", iconClass: "fi-rr-globe" },
];

const TOTAL = STEPS.length;
const PROFILE_PHOTO_PREVIEW_KEY = "candidate-profile-photo-preview";
const DEFAULT_PROFILE_PHOTO =
  "/assets/imgs/page/candidates/candidate-profile.png";

const COUNTRY_MAP = {
  "+91": "IN",
  "+1": "US",
  "+44": "GB",
  "+971": "AE",
};

const getStoredProfilePhotoPreview = () => {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem(PROFILE_PHOTO_PREVIEW_KEY) || "";
};

const storeProfilePhotoPreview = (previewUrl) => {
  if (typeof window === "undefined" || !previewUrl) return;

  window.localStorage.setItem(PROFILE_PHOTO_PREVIEW_KEY, previewUrl);
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 18 }}>
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 700,
        color: T.navy,
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
      {required && <span style={{ color: T.error, marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && (
      <p
        style={{
          fontSize: 11,
          color: T.muted,
          marginTop: 4,
          margin: "4px 0 0",
        }}
      >
        {hint}
      </p>
    )}
  </div>
);

const Inp = ({ style = {}, ...props }) => (
  <input
    {...props}
    style={{
      width: "100%",
      height: 48,
      padding: "0 14px",
      borderRadius: 8,
      border: `1.5px solid ${T.border}`,
      fontSize: 14,
      color: T.navy,
      background: T.white,
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color .15s",
      ...style,
    }}
    onFocus={(e) => (e.target.style.borderColor = T.orangeLight)}
    onBlur={(e) => (e.target.style.borderColor = T.border)}
  />
);

const Sel = ({ children, style = {}, ...props }) => (
  <select
    {...props}
    style={{
      width: "100%",
      height: 48,
      padding: "0 14px",
      borderRadius: 8,
      border: `1.5px solid ${T.border}`,
      fontSize: 14,
      color: T.navy,
      background: T.white,
      outline: "none",
      boxSizing: "border-box",
      appearance: "none",
      WebkitAppearance: "none",
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23122359' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 14px center",
      ...style,
    }}
  >
    {children}
  </select>
);

const Textarea = ({ style = {}, ...props }) => (
  <textarea
    {...props}
    style={{
      width: "100%",
      padding: "12px 14px",
      borderRadius: 8,
      border: `1.5px solid ${T.border}`,
      fontSize: 14,
      color: T.navy,
      background: T.white,
      outline: "none",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: 90,
      lineHeight: 1.6,
      transition: "border-color .15s",
      ...style,
    }}
    onFocus={(e) => (e.target.style.borderColor = T.orangeLight)}
    onBlur={(e) => (e.target.style.borderColor = T.border)}
  />
);

const Btn = ({
  children,
  variant = "primary",
  onClick,
  disabled,
  style = {},
  type = "button",
}) => {
  const variants = {
    primary: { background: T.orange, color: T.white, border: "none" },
    outline: {
      background: T.white,
      color: T.navy,
      border: `1.5px solid ${T.border}`,
    },
    ghost: {
      background: T.bg,
      color: T.navy,
      border: `1.5px solid ${T.border}`,
    },
    danger: {
      background: T.errorBg,
      color: T.error,
      border: `1px solid ${T.error}`,
    },
    success: {
      background: T.successBg,
      color: T.success,
      border: `1px solid ${T.success}`,
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        padding: "10px 22px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all .15s",
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const Tag = ({ label, onRemove }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 10px",
      background: "#e8f0fe",
      color: T.navy,
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      margin: "3px",
    }}
  >
    {label}
    {onRemove && (
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.muted,
          fontSize: 14,
          padding: 0,
          lineHeight: 1,
        }}
      >
        <i className="fi-rr-cross-small" aria-hidden="true" />
      </button>
    )}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      marginBottom: 16,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Step Progress Bar ────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      marginBottom: 32,
      overflowX: "auto",
      paddingBottom: 4,
    }}
  >
    {STEPS.map((step, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <React.Fragment key={step.id}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              minWidth: 64,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: done ? 16 : 14,
                fontWeight: 700,
                flexShrink: 0,
                transition: "all .2s",
                background: done ? T.success : active ? T.orange : T.bg,
                color: done || active ? T.white : T.muted,
                border: active
                  ? `3px solid ${T.orangeLight}`
                  : `2px solid ${done ? T.success : T.border}`,
                boxSizing: "border-box",
                boxShadow: active ? `0 0 0 4px rgba(255,163,0,0.15)` : "none",
              }}
            >
              <i
                className={done ? "fi-rr-check" : step.iconClass}
                aria-hidden="true"
                style={{
                  fontSize: done ? 13 : 14,
                  lineHeight: 1,
                  display: "inline-flex",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? T.orange : done ? T.success : T.muted,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>
          </div>
          {i < TOTAL - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                margin: "19px 4px 0",
                background: done ? T.success : T.border,
                transition: "background .3s",
                minWidth: 16,
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── STEP 1 — Personal Information ───────────────────────────────────────────
const StepPersonal = ({ data, onChange, onPhotoUpload, errors = {} }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarSrc = avatarPreview || data.avatar || DEFAULT_PROFILE_PHOTO;

  const handleAvatar = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const previewUrl = reader.result;

      setAvatarPreview(previewUrl);
      storeProfilePhotoPreview(previewUrl);
      onChange("avatar", previewUrl);

      console.log("Selected file:", file);

      await onPhotoUpload(file, previewUrl);
    };

    reader.readAsDataURL(file);
  };

  const states = State.getStatesOfCountry(data.country || "IN");
  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>
        Personal Information
      </h4>
      <p
        style={{ color: T.muted, fontSize: 14, marginBottom: 28, marginTop: 0 }}
      >
        Let employers know who you are
      </p>

      {/* Avatar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 28,
          padding: "16px 20px",
          background: T.bg,
          borderRadius: 12,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            overflow: "hidden",
            border: `3px solid ${T.orangeLight}`,
            flexShrink: 0,
          }}
        >
          <img
            src={avatarSrc}
            alt="Profile"
            onError={(e) => {
              e.currentTarget.src =
                getStoredProfilePhotoPreview() || DEFAULT_PROFILE_PHOTO;
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontWeight: 600,
              fontSize: 14,
              color: T.navy,
            }}
          >
            Profile Photo
          </p>
          <input
            type="file"
            id="avatar-upload"
            onChange={handleAvatar}
            accept="image/jpeg,image/png,image/jpg"
            style={{ display: "none" }}
          />
          <label
            htmlFor="avatar-upload"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: T.orange,
              color: T.white,
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <i
              className="fi-rr-camera"
              aria-hidden="true"
              style={{ lineHeight: 1 }}
            />
            Upload Photo
          </label>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 20px",
        }}
      >
        <Field label="First Name" required>
          <Inp
            value={data.firstName || ""}
            onChange={(e) =>
              onChange("firstName", e.target.value.replace(/^\s+/, ""))
            }
            placeholder="Ramesh"
          />

          {errors.firstName && (
            <p
              style={{
                color: "red",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {errors.firstName}
            </p>
          )}
        </Field>
        <Field label="Last Name" required>
          <Inp
            value={data.lastName || ""}
            onChange={(e) =>
              onChange("lastName", e.target.value.replace(/^\s+/, ""))
            }
            placeholder="Sharma"
            required
          />
          {errors.lastName && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.lastName}
            </p>
          )}
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 20px",
        }}
      >
        <Field label="Mobile Number" required>
          <Inp
            value={data.mobile || ""}
            onChange={(e) => onChange("mobile", e.target.value)}
            placeholder="+91 98765 43210"
            required
          />
          {errors.mobile && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.mobile}
            </p>
          )}
        </Field>
        <Field label="Email Address" required>
          <Inp
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="ramesh@email.com"
            required
          />
          {errors.email && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.email}
            </p>
          )}
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 20px",
        }}
      >
        <Field label="Date of Birth" required>
          <Inp
            type="date"
            value={data.dob || ""}
            onChange={(e) => onChange("dob", e.target.value)}
            required
          />
        </Field>
        <Field label="Gender" required>
          <Sel
            value={data.gender || ""}
            onChange={(e) => onChange("gender", e.target.value)}
            required
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </Sel>
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0 20px",
        }}
      >
        <Field label="City" required>
          <Inp
            value={data.city || ""}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Pune"
            required
          />
        </Field>
        <Field label="State" required>
          <Sel
            value={data.state || ""}
            onChange={(e) => onChange("state", e.target.value)}
            required
          >
            <option value="">Select state</option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.name}>
                {state.name}
              </option>
            ))}
          </Sel>
        </Field>
        <Field label="PIN Code" required>
          <Inp
            value={data.pin || ""}
            onChange={(e) => onChange("pin", e.target.value)}
            placeholder="411001"
            maxLength={6}
            required
          />
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 20px",
        }}
      >
        <Field label="Nationality" required>
          <Inp
            value={data.nationality || ""}
            onChange={(e) => onChange("nationality", e.target.value)}
            placeholder="Indian"
            required
          />
        </Field>
        <Field label="Trade / Job Title" required>
          <Inp
            value={data.trade || ""}
            onChange={(e) => onChange("trade", e.target.value)}
            placeholder="Senior Electrician"
            required
          />
        </Field>
      </div>

      <Field
        label="Professional Summary"
        hint="2–4 lines about your experience and specialisation"
        required
      >
        <Textarea
          value={data.summary || ""}
          onChange={(e) => onChange("summary", e.target.value)}
          rows={4}
          placeholder="Describe your key skills and years of experience..."
        />
      </Field>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 20px",
        }}
      >
        <Field label="Expected Salary (₹/month)" required>
          <Inp
            type="number"
            value={data.salaryExpectation || ""}
            onChange={(e) =>
              onChange("salaryExpectation", Number(e.target.value))
            }
            placeholder="45000"
            required
          />
        </Field>
        <Field label="Years of Experience" required>
          <Inp
            type="number"
            value={data.yearsOfExperience || ""}
            onChange={(e) =>
              onChange("yearsOfExperience", Number(e.target.value))
            }
            placeholder="8"
            min={0}
            max={50}
            required
          />
        </Field>
      </div>

      <div
        style={{
          padding: "14px 18px",
          background: T.bg,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <input
          type="checkbox"
          id="available"
          checked={!!data.availableForWork}
          onChange={(e) => onChange("availableForWork", e.target.checked)}
          style={{
            width: 18,
            height: 18,
            cursor: "pointer",
            accentColor: T.orange,
          }}
        />
        <label
          htmlFor="available"
          style={{
            fontSize: 14,
            color: T.navy,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          I am currently available for work
        </label>
      </div>
    </div>
  );
};

// ─── STEP 3 — Work Experience ─────────────────────────────────────────────────
const StepWork = ({ data, onUpdate, onAdd, onRemove }) => {
  const [showForm, setShowForm] = useState(false);

  const [newEntry, setNewEntry] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    noticePeriod: "",
    isOffshore: false,
    description: "",
  });
  const showToast = useToast();

  const handleSave = async () => {
    if (!newEntry.title || !newEntry.company) {
      showToast("Role and company name are required.", "error");
      return;
    }
    if (!newEntry.startDate) {
      showToast("Start date is required.", "error");
      return;
    }
    if (!newEntry.current && !newEntry.endDate) {
      showToast(
        "End date is required unless this is your current job.",
        "error",
      );
      return;
    }
    const saved = await onAdd(newEntry);
    if (!saved) return;

    setNewEntry({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isOffshore: false,
      current: false,
      description: "",
    });
    setShowForm(false);
  };

  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>
        Work Experience
      </h4>
      <p
        style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}
      >
        Add your employment history — most recent first
      </p>

      {data.workHistory.map((entry) => (
        <Card key={entry.id}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <Field label="Job Title" required>
                  <Inp
                    value={entry.title}
                    onChange={(e) =>
                      onUpdate(entry.id, "title", e.target.value)
                    }
                  />
                </Field>
                <Field label="Company Name" required>
                  <Inp
                    value={entry.company}
                    onChange={(e) =>
                      onUpdate(entry.id, "company", e.target.value)
                    }
                  />
                </Field>
              </div>
              <Field label="Location">
                <Inp
                  value={entry.location}
                  onChange={(e) =>
                    onUpdate(entry.id, "location", e.target.value)
                  }
                  placeholder="City, State"
                />
              </Field>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <Field label="Start Date">
                  <Inp
                    type="date"
                    value={entry.startDate}
                    onChange={(e) =>
                      onUpdate(entry.id, "startDate", e.target.value)
                    }
                  />
                </Field>

                <Field label="End Date">
                  <Inp
                    type="date"
                    value={entry.endDate || ""}
                    min={entry.startDate || ""}
                    onChange={(e) =>
                      onUpdate(entry.id, "endDate", e.target.value)
                    }
                    disabled={entry.current}
                  />
                </Field>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: T.text,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!entry.current}
                    onChange={(e) =>
                      onUpdate(entry.id, "current", e.target.checked)
                    }
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: T.orange,
                    }}
                  />
                  Currently working here
                </label>
              </div>

              {entry.current && (
                <Field label="Notice Period" required>
                  <Inp
                    value={entry.noticePeriod || ""}
                    onChange={(e) =>
                      onUpdate(entry.id, "noticePeriod", e.target.value)
                    }
                    placeholder="e.g. Immediate, 15 Days, 30 Days"
                  />
                </Field>
              )}
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: T.text,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!entry.isOffshore}
                    onChange={(e) =>
                      onUpdate(entry.id, "isOffshore", e.target.checked)
                    }
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: T.orange,
                    }}
                  />
                  Offshore Experience
                </label>
              </div>

              <Field label="Description">
                <Textarea
                  value={entry.description}
                  onChange={(e) =>
                    onUpdate(entry.id, "description", e.target.value)
                  }
                  rows={3}
                />
              </Field>
            </div>
            <button
              onClick={() => onRemove(entry.id)}
              style={{
                background: T.errorBg,
                border: "none",
                borderRadius: 7,
                padding: "6px 10px",
                cursor: "pointer",
                color: T.error,
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="fi-rr-cross-small" aria-hidden="true" />
              Remove
            </button>
          </div>
        </Card>
      ))}

      {showForm && (
        <Card
          style={{
            background: "#fffbf0",
            border: `1.5px dashed ${T.orangeLight}`,
          }}
        >
          <h6 style={{ margin: "0 0 16px", color: T.navy }}>New Work Entry</h6>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 16px",
            }}
          >
            <Field label="Job Title" required>
              <Inp
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Company Name" required>
              <Inp
                value={newEntry.company}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, company: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Location">
            <Inp
              value={newEntry.location}
              onChange={(e) =>
                setNewEntry((p) => ({ ...p, location: e.target.value }))
              }
              placeholder="City, State"
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 16px",
            }}
          >
            <Field label="Start Date">
              <Inp
                type="date"
                value={newEntry.startDate}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </Field>
            <Field label="End Date">
              <Inp
                type="date"
                value={newEntry.endDate}
                min={newEntry.startDate || ""}
                onChange={(e) =>
                  setNewEntry((p) => ({
                    ...p,
                    endDate: e.target.value,
                  }))
                }
                disabled={newEntry.current}
              />
            </Field>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: T.text,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={!!newEntry.current}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, current: e.target.checked }))
                }
                style={{ width: 16, height: 16, accentColor: T.orange }}
              />
              Currently working here
            </label>
          </div>
          {newEntry.current && (
            <Field label="Notice Period" required>
              <Inp
                value={newEntry.noticePeriod || ""}
                onChange={(e) =>
                  setNewEntry((p) => ({
                    ...p,
                    noticePeriod: e.target.value,
                  }))
                }
                placeholder="e.g. Immediate, 15 Days, 30 Days"
              />
            </Field>
          )}

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: T.text,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={!!newEntry.isOffshore}
                onChange={(e) =>
                  setNewEntry((p) => ({
                    ...p,
                    isOffshore: e.target.checked,
                  }))
                }
                style={{
                  width: 16,
                  height: 16,
                  accentColor: T.orange,
                }}
              />
              Offshore Experience
            </label>
          </div>

          {/* <Field label="Description">
    <Textarea
      value={newEntry.description}
      onChange={e =>
        setNewEntry(p => ({
          ...p,
          description: e.target.value
        }))
      }
      rows={3}
    />
  </Field> */}

          <Field label="Description">
            <Textarea
              value={newEntry.description}
              onChange={(e) =>
                setNewEntry((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
            />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn onClick={handleSave}>Save Entry</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            padding: "14px",
            border: `2px dashed ${T.border}`,
            background: "transparent",
            borderRadius: 10,
            cursor: "pointer",
            color: T.orange,
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = T.orange;
            e.target.style.background = "#fffbf0";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = T.border;
            e.target.style.background = "transparent";
          }}
        >
          <i className="fi-rr-add" aria-hidden="true" />
          Add Work Experience
        </button>
      )}
    </div>
  );
};

// ─── STEP 4 — Education ───────────────────────────────────────────────────────
const StepEducation = ({ data, onUpdate, onAdd, onRemove }) => {
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    institution: "",
    meta: "",
  });
  const showToast = useToast();

  const handleSave = () => {
    if (!newEntry.title) {
      showToast("Qualification title is required.", "error");
      return;
    }
    onAdd(newEntry);
    setNewEntry({ title: "", institution: "", meta: "" });
    setShowForm(false);
  };

  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>
        Education & Qualifications
      </h4>
      <p
        style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}
      >
        List your degrees, certificates, and training courses
      </p>

      {data.education.map((entry) => (
        <Card key={entry.id}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 16px",
                }}
              >
                <Field label="Qualification / Degree" required>
                  <Inp
                    value={entry.title}
                    onChange={(e) =>
                      onUpdate(entry.id, "title", e.target.value)
                    }
                  />
                </Field>
                <Field label="Institute / Board">
                  <Inp
                    value={entry.institution}
                    onChange={(e) =>
                      onUpdate(entry.id, "institution", e.target.value)
                    }
                  />
                </Field>
              </div>
              <Field
                label="Year / Details"
                hint="E.g. Passed: 2014 | Cert No: ITI/2014"
              >
                <Inp
                  value={entry.meta}
                  onChange={(e) => onUpdate(entry.id, "meta", e.target.value)}
                  placeholder="Passed: 2014"
                />
              </Field>
              {entry.verified && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    color: T.success,
                    fontWeight: 600,
                  }}
                >
                  <i className="fi-rr-check" aria-hidden="true" />
                  AI Verified
                </span>
              )}
            </div>
            <button
              onClick={() => onRemove(entry.id)}
              style={{
                background: T.errorBg,
                border: "none",
                borderRadius: 7,
                padding: "6px 10px",
                cursor: "pointer",
                color: T.error,
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                height: "fit-content",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="fi-rr-cross-small" aria-hidden="true" />
            </button>
          </div>
        </Card>
      ))}

      {showForm && (
        <Card
          style={{
            background: "#fffbf0",
            border: `1.5px dashed ${T.orangeLight}`,
          }}
        >
          <h6 style={{ margin: "0 0 16px", color: T.navy }}>
            New Qualification
          </h6>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 16px",
            }}
          >
            <Field label="Qualification / Degree" required>
              <Inp
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Institute / Board">
              <Inp
                value={newEntry.institution}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, institution: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Year / Details">
            <Inp
              value={newEntry.meta}
              onChange={(e) =>
                setNewEntry((p) => ({ ...p, meta: e.target.value }))
              }
              placeholder="Passed: 2014"
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={handleSave}>Save</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            padding: "14px",
            border: `2px dashed ${T.border}`,
            background: "transparent",
            borderRadius: 10,
            cursor: "pointer",
            color: T.orange,
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = T.orange;
            e.target.style.background = "#fffbf0";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = T.border;
            e.target.style.background = "transparent";
          }}
        >
          <i className="fi-rr-add" aria-hidden="true" />
          Add Qualification
        </button>
      )}
    </div>
  );
};

// ─── STEP 5 — Skills ─────────────────────────────────────────────────────────
const StepSkills = ({ data, onToggle, onUpdateSkill }) => {
  const [customSkill, setCustomSkill] = useState("");
  const PROFICIENCY = ["Beginner", "Intermediate", "Expert"];

  const addCustom = () => {
    if (!customSkill.trim()) return;
    onToggle(customSkill.trim());
    setCustomSkill("");
  };

  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>Skills</h4>
      <p
        style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}
      >
        Select your trade skills and set your proficiency level
      </p>

      {/* Suggested skills */}
      <Card>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: T.navy,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            margin: "0 0 14px",
          }}
        >
          Tap to select skills
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(data.suggestedSkills || []).map((skill) => {
            const selected = (data.selectedSkills || []).includes(skill);
            return (
              <button
                key={skill}
                onClick={() => onToggle(skill)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1.5px solid ${selected ? T.orange : T.border}`,
                  background: selected ? T.orange : T.white,
                  color: selected ? T.white : T.text,
                  transition: "all .15s",
                }}
              >
                {skill}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Inp
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            placeholder="Add a custom skill..."
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            style={{ flex: 1, height: 42 }}
          />
          <Btn
            onClick={addCustom}
            disabled={!customSkill.trim()}
            style={{ padding: "8px 16px" }}
          >
            + Add
          </Btn>
        </div>
      </Card>

      {/* Skill matrix */}
      {(data.skillMatrix || []).length > 0 && (
        <Card>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: T.navy,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              margin: "0 0 14px",
            }}
          >
            Set proficiency levels
          </p>
          {(data.skillMatrix || []).map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 12,
                padding: "12px 16px",
                background: T.bg,
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.navy,
                }}
              >
                {entry.name}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {PROFICIENCY.map((p) => (
                  <button
                    key={p}
                    onClick={() => onUpdateSkill(entry.id, "proficiency", p)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1.5px solid ${entry.proficiency === p ? T.orange : T.border}`,
                      background: entry.proficiency === p ? T.orange : T.white,
                      color: entry.proficiency === p ? T.white : T.muted,
                      transition: "all .12s",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Inp
                  type="number"
                  value={entry.years}
                  min={0}
                  max={40}
                  onChange={(e) =>
                    onUpdateSkill(entry.id, "years", Number(e.target.value))
                  }
                  style={{ width: 70, height: 36, textAlign: "center" }}
                />
                <span
                  style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}
                >
                  yrs
                </span>
              </div>
              <button
                onClick={() => onToggle(entry.name)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.muted,
                  fontSize: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fi-rr-cross-small" aria-hidden="true" />
              </button>
            </div>
          ))}
        </Card>
      )}

      <p style={{ fontSize: 12, color: T.muted }}>
        {(data.selectedSkills || []).length} skill
        {(data.selectedSkills || []).length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
};

// ─── STEP 2 — Documents ───────────────────────────────────────────────────────
const DocUploadBox = ({ doc, docKey, onUpload, onClear }) => {
  const statusColors = {
    verified: {
      bg: "#e8f0fe",
      color: "#1a56c4",
      border: "#c7dcff",
      label: "Verified",
      iconClass: "fi-rr-check",
    },
    uploaded: {
      bg: "#e8f0fe",
      color: "#1a56c4",
      border: "#c7dcff",
      label: "Uploaded",
      iconClass: "fi-rr-check",
    },
    missing: {
      bg: "#e8f0fe",
      color: "#1a56c4",
      border: "#c7dcff",
      label: "Required",
      iconClass: "fi-rr-exclamation",
    },
    optional: {
      bg: "#e8f0fe",
      color: "#1a56c4",
      border: "#c7dcff",
      label: "Optional",
      iconClass: null,
    },
  };
  const s = statusColors[doc.status] || statusColors.optional;

  return (
    <Card style={{ padding: "16px 20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>
              {doc.label}
            </span>
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {s.iconClass && (
                <i
                  className={s.iconClass}
                  aria-hidden="true"
                  style={{ fontSize: 10, lineHeight: 1 }}
                />
              )}
              {s.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: T.muted, margin: "0 0 8px" }}>
            {doc.description}
          </p>
          {doc.metaLines &&
            doc.metaLines.map((m, i) => (
              <p
                key={i}
                style={{ fontSize: 11, color: T.muted, margin: "2px 0" }}
              >
                {m}
              </p>
            ))}
          {(doc.file || doc.frontFile) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
                padding: "8px 12px",
                background: T.bg,
                borderRadius: 7,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: T.navy,
                  fontWeight: 500,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="fi-rr-clip" aria-hidden="true" />
                {(doc.file || doc.frontFile).name}
              </span>
              <span style={{ fontSize: 11, color: T.muted }}>
                {(doc.file || doc.frontFile).size}
              </span>
              {doc.status !== "verified" && (
                <button
                  onClick={() => onClear(docKey)}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: T.error,
                    cursor: "pointer",
                    fontSize: 13,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <i className="fi-rr-cross-small" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
        {doc.status !== "verified" && doc.type !== "readonly" && (
          <div>
            <input
              type="file"
              id={`upload-${docKey}`}
              onChange={(e) =>
                e.target.files[0] && onUpload(docKey, e.target.files[0])
              }
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ display: "none" }}
            />
            <label
              htmlFor={`upload-${docKey}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: T.bg,
                border: `1.5px solid ${T.border}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                color: T.navy,
                whiteSpace: "nowrap",
              }}
            >
              <i className="fi-rr-upload" aria-hidden="true" />
              Upload
            </label>
          </div>
        )}
      </div>
    </Card>
  );
};

const StepDocuments = ({ data, onUpload, onClear }) => (
  <div>
    <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>Documents</h4>
    <p style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>
      Upload your certificates and ID proof for faster hiring
    </p>
    {Object.entries(data.documents).map(([key, doc]) => (
      <DocUploadBox
        key={key}
        doc={doc}
        docKey={key}
        onUpload={onUpload}
        onClear={onClear}
      />
    ))}
  </div>
);

// ─── STEP 6 — Languages ───────────────────────────────────────────────────────
const LANG_OPTIONS = [
  "Hindi",
  "English",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Arabic",
  "Nepali",
];
const PROF_LEVELS = ["Beginner", "Conversational", "Professional", "Native"];

const StepLanguages = ({ data, onAdd, onRemove, onUpdate }) => {
  const [newLang, setNewLang] = useState("");
  const [newProf, setNewProf] = useState("Conversational");

  const handleAdd = () => {
    if (!newLang) return;
    onAdd({
      name: newLang,
      proficiency: newProf,
      reading: true,
      writing: true,
      speaking: true,
    });
    setNewLang("");
  };

  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>
        Language Preferences
      </h4>
      <p
        style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}
      >
        Languages you can communicate in
      </p>

      {(data.languages || []).map((lang) => (
        <Card key={lang.name}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: T.navy,
                minWidth: 90,
              }}
            >
              {lang.name}
            </span>
            <Sel
              value={lang.proficiency}
              onChange={(e) =>
                onUpdate(lang.name, "proficiency", e.target.value)
              }
              style={{ flex: 1, height: 40 }}
            >
              {PROF_LEVELS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Sel>
            <div style={{ display: "flex", gap: 12 }}>
              {["reading", "writing", "speaking"].map((skill) => (
                <label
                  key={skill}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    color: T.muted,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!lang[skill]}
                    onChange={(e) =>
                      onUpdate(lang.name, skill, e.target.checked)
                    }
                    style={{ width: 16, height: 16, accentColor: T.orange }}
                  />
                  {skill}
                </label>
              ))}
            </div>
            <button
              onClick={() => onRemove(lang.name)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.muted,
                fontSize: 18,
                padding: "0 4px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="fi-rr-cross-small" aria-hidden="true" />
            </button>
          </div>
        </Card>
      ))}

      <Card
        style={{
          background: "#fffbf0",
          border: `1.5px dashed ${T.orangeLight}`,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: T.navy,
            margin: "0 0 12px",
            textTransform: "uppercase",
          }}
        >
          Add Language
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Sel
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              style={{ height: 44 }}
            >
              <option value="">Select language</option>
              {LANG_OPTIONS.filter(
                (l) => !(data.languages || []).find((x) => x.name === l),
              ).map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Sel>
          </div>
          <div style={{ flex: 1 }}>
            <Sel
              value={newProf}
              onChange={(e) => setNewProf(e.target.value)}
              style={{ height: 44 }}
            >
              {PROF_LEVELS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Sel>
          </div>
          <Btn
            onClick={handleAdd}
            disabled={!newLang}
            style={{ height: 44, padding: "0 20px", gap: 6 }}
          >
            <i className="fi-rr-add" aria-hidden="true" />
            Add
          </Btn>
        </div>
      </Card>
    </div>
  );
};

// ─── Completion Summary (final step done) ────────────────────────────────────
const CompletionSummary = ({ percent, onEdit, router }) => (
  <div style={{ textAlign: "center", padding: "40px 20px" }}>
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: T.successBg,
        border: `3px solid ${T.success}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        margin: "0 auto 20px",
      }}
    >
      <i className="fi-rr-check" aria-hidden="true" style={{ lineHeight: 1 }} />
    </div>
    <h3 style={{ color: T.navy, margin: "0 0 8px" }}>Profile Complete!</h3>
    <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
      Your profile is {percent}% complete. Employers can now find you.
    </p>
    <div
      style={{
        background: T.bg,
        borderRadius: 12,
        padding: "16px 24px",
        display: "inline-block",
        marginBottom: 28,
      }}
    >
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>
        Profile Strength
      </div>
      <div
        style={{
          height: 8,
          background: T.border,
          borderRadius: 4,
          width: 220,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: T.orange,
            borderRadius: 4,
            transition: "width .5s",
          }}
        />
      </div>
      <div
        style={{ fontSize: 13, fontWeight: 700, color: T.orange, marginTop: 6 }}
      >
        {percent}%
      </div>
    </div>
    <div>
      <Btn onClick={onEdit} variant="outline" style={{ marginRight: 12 }}>
        Edit Profile
      </Btn>
      <Btn style={{ color: T.white }} onClick={() => router.push("/jobs-list")}>
        <span style={{ color: T.white }}>Browse Jobs</span>
        <i
          className="fi-rr-arrow-small-right"
          aria-hidden="true"
          style={{ color: T.white }}
        />
      </Btn>
    </div>
  </div>
);

// ─── Profile Sidebar (progress overview) ─────────────────────────────────────
const ProfileMini = ({ data, percent, currentStep, onJump }) => (
  <div
    style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      overflow: "hidden",
      position: "sticky",
      top: 90,
    }}
  >
    {/* Header banner */}
    <div
      style={{
        background: `linear-gradient(135deg, ${T.navy} 0%, #1e3a8a 100%)`,
        padding: "24px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${T.orange}`,
          margin: "0 auto 12px",
          background: T.bg,
        }}
      >
        <img
          src={data.avatar || DEFAULT_PROFILE_PHOTO}
          alt="Profile"
          onError={(e) => {
            e.currentTarget.src =
              getStoredProfilePhotoPreview() || DEFAULT_PROFILE_PHOTO;
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>
        {data.firstName} {data.lastName}
      </div>
      <div style={{ color: T.orangeLight, fontSize: 12, marginTop: 4 }}>
        {data.trade}
      </div>
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 6,
          }}
        >
          Profile Strength
        </div>
        <div
          style={{
            height: 5,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              background: T.orange,
              borderRadius: 3,
              transition: "width .5s",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.orange,
            marginTop: 4,
          }}
        >
          {percent}%
        </div>
      </div>
    </div>

    {/* Steps list */}
    <div style={{ padding: "12px 0" }}>
      {STEPS.map((step, i) => {
        const n = i + 1;
        const done = n < currentStep;
        const active = n === currentStep;
        const canJump = typeof onJump === "function";
        return (
          <button
            key={step.id}
            onClick={() => canJump && onJump(n)}
            disabled={!canJump}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              background: active ? "#fff8ec" : "transparent",
              border: "none",
              borderLeft: active
                ? `3px solid ${T.orange}`
                : "3px solid transparent",
              cursor: canJump ? "pointer" : "default",
              textAlign: "left",
              transition: "all .15s",
            }}
          >
            <span
              style={{
                fontSize: 12,
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: done ? T.success : active ? T.orange : T.bg,
                color: done || active ? T.white : T.muted,
                fontWeight: 700,
              }}
            >
              <i
                className={done ? "fi-rr-check" : step.iconClass}
                aria-hidden="true"
                style={{ fontSize: 11, lineHeight: 1, display: "inline-flex" }}
              />
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? T.orange : done ? T.navy : T.muted,
              }}
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const buildProfilePhotoUrl = (photoUrl) => {
  if (!photoUrl) return DEFAULT_PROFILE_PHOTO;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const absoluteUrl = photoUrl.startsWith("http")
    ? photoUrl
    : `${baseUrl}${photoUrl}`;
  const separator = absoluteUrl.includes("?") ? "&" : "?";

  return `${absoluteUrl}${separator}t=${Date.now()}`;
};
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CandidateProfilePage = () => {
  const candidateId = useMemo(() => {
    try {
      return getCandidateId();
    } catch {
      return null;
    }
  }, []);

  const showToast = useToast();
  const router = useRouter();
  const [itiInfo, setItiInfo] = useState(null);
  const [errors, setErrors] = useState({});

  const validatePersonalInfo = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = "Enter first name";
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = "Enter last name";
    }

    if (!profileData.mobile.trim()) {
      newErrors.mobile = "Enter mobile number";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Enter email address";
    }

    if (!profileData.trade.trim()) {
      newErrors.trade = "Enter trade/job title";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const [profileData, setProfileData] = useState(() => ({
    ...mockProfile,
    avatar: getStoredProfilePhotoPreview() || mockProfile.avatar,
    salaryExpectation: "",
    isITI: false,
    passportNumber: "",
    passportExpiry: "",
    id: "",
    firstName: "",
    lastName: "",
    fullName: "",
    mobile: "",
    email: "",
    trade: "",
    yearsOfExperience: "",
    nationality: "",
    dob: "",
    gender: "",
    city: "",
    state: "",
    pin: "",
    address: "",
    role: "",
    category: "",
    country: "IN",
    hasDisability: false,
    disabilityNote: "",
    preferredWorkLocation: "",
    jobType: "",
    summary: "",
    availableForWork: false,
    completionHint: "",
    sidebarBadges: [],
    workHistory: [],
    education: [],
    selectedSkills: [],
    skillMatrix: [],
    languages: [],
  }));
  const [currentStep, setCurrentStep] = useState(1);
  const [done, setDone] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [initialPersonalInfo, setInitialPersonalInfo] = useState(null);
  const [initialWorkHistory, setInitialWorkHistory] = useState([]);

  const loadAvailability = useCallback(async () => {
    if (!candidateId) return;

    try {
      const response = await getAvailability();

      if (response.data.success) {
        setProfileData((prev) => ({
          ...prev,
          availableForWork:
            response.data.data.availabilityStatus === "Open_To_Opportunities",
        }));
      }
    } catch (error) {
      console.error("Failed to load availability", error);
    }
  }, [candidateId]);
  //load ITI info from API
  const loadITIInfo = useCallback(async () => {
    if (!candidateId) return;

    try {
      const response = await api.get(
        `/api/candidate/profile/iti-info?candidateId=${candidateId}`,
      );

      if (response.data.success) {
        setItiInfo(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [candidateId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadITIInfo();
  }, [loadITIInfo]);

  useEffect(() => {
    if (!itiInfo) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,

        itiCertificate: {
          label: "ITI Certificate",
          status: itiInfo.itiCertified ? "verified" : "missing",

          type: "readonly",

          description: itiInfo.itiTrade || "ITI Trade",

          metaLines: [
            `Primary Trade: ${itiInfo.primaryTrade}`,
            `Marks: ${itiInfo.itiMarks}`,
            `College: ${itiInfo.itiCollege}`,
          ],

          file: null,
        },
      },
    }));
  }, [itiInfo]);

  const loadProfileCompletion = useCallback(async () => {
    if (!candidateId) return;

    try {
      const response = await getProfileCompletion();

      if (response.data.success) {
        setProfileCompletion(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load profile completion", error);
    }
  }, [candidateId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfileCompletion();
  }, [loadProfileCompletion]);

  //Loading profile data from API
  const loadPersonalInfo = useCallback(async () => {
    if (!candidateId) return;

    try {
      const response = await api.get(
        `/api/candidate/profile/personal-info?candidateId=${candidateId}`,
      );

      console.log("PROFILE DATA", response.data);

      if (response.data.success) {
        const profile = response.data.data;
        const country = COUNTRY_MAP[profile.countryCode] || "IN";
        console.log("profilePhotoUrl =", profile.profilePhotoUrl);
        const names = profile.fullName ? profile.fullName.split(" ") : [];
        const personalInfoData = {
          firstName: names[0] || "",
          lastName: names.slice(1).join(" ") || "",
          mobile: profile.mobileNumber || "",
          trade: profile.trade || profile.jobTitle || "",
          nationality: profile.nationality || "",
          dob: profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "",
          gender: profile.gender || "",
          email: profile.email || "",
          city: profile.currentCity || "",
          state: profile.currentState || "",
          pin: profile.pincode || "",
          summary: profile.professionalSummary || "",
          yearsOfExperience: profile.totalExperienceYears || 0,
          salaryExpectation:
            profile.expectedSalary || profile.salaryExpectation || "",
        };

        setInitialPersonalInfo(personalInfoData);

        setProfileData((prev) => ({
          ...prev,
          country,

          firstName: names[0] || "",
          lastName: names.slice(1).join(" ") || "",

          mobile: profile.mobileNumber || "",
          email: profile.email || "",

          dob: profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "",

          gender: profile.gender || "",

          city: profile.currentCity || "",
          state: profile.currentState || "",
          pin: profile.pincode || "",

          summary: profile.professionalSummary || "",

          yearsOfExperience: profile.totalExperienceYears || 0,
          trade: profile.trade || profile.jobTitle || "",
          nationality: profile.nationality || "",
          salaryExpectation:
            profile.expectedSalary || profile.salaryExpectation || "",

          avatar:
            getStoredProfilePhotoPreview() ||
            (profile.profilePhotoUrl
              ? buildProfilePhotoUrl(profile.profilePhotoUrl)
              : prev.avatar || DEFAULT_PROFILE_PHOTO),
        }));
        console.log(
          "Final Avatar URL:",
          profile.profilePhotoUrl
            ? buildProfilePhotoUrl(profile.profilePhotoUrl)
            : "default-image",
        );
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  }, [candidateId]);

  useEffect(() => {
    console.log("API URL =", process.env.NEXT_PUBLIC_API_URL);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPersonalInfo();
    loadAvailability();
  }, [loadPersonalInfo, loadAvailability]);

  //Update profile data to API
  const savePersonalInfo = async () => {
    console.log("Candidate ID:", candidateId);
    if (!candidateId) {
      showToast("Please log in again to save your profile.", "error");
      return false;
    }
    const validatePersonalInfo = () => {
      const newErrors = {};

      if (!profileData.firstName.trim()) {
        newErrors.firstName = "Enter first name";
      }

      if (!profileData.lastName.trim()) {
        newErrors.lastName = "Enter last name";
      }

      if (!profileData.mobile.trim()) {
        newErrors.mobile = "Enter mobile number";
      }

      if (!profileData.email.trim()) {
        newErrors.email = "Enter email address";
      }

      if (!profileData.trade.trim()) {
        newErrors.trade = "Enter trade/job title";
      }

      console.log("Validation Errors:", newErrors);

      setErrors(newErrors);

      return Object.keys(newErrors).length === 0;
    };
    const currentPersonalInfo = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      mobile: profileData.mobile,
      trade: profileData.trade,
      nationality: profileData.nationality,
      dob: profileData.dob,
      gender: profileData.gender,
      email: profileData.email,
      city: profileData.city,
      state: profileData.state,
      pin: profileData.pin,
      summary: profileData.summary,
      yearsOfExperience: profileData.yearsOfExperience,
      salaryExpectation: profileData.salaryExpectation,
    };

    const personalChanged =
      JSON.stringify(currentPersonalInfo) !==
      JSON.stringify(initialPersonalInfo);

    try {
      let savedMessage = "Profile saved successfully";
      console.log("Current:", currentPersonalInfo);
      console.log("Initial:", initialPersonalInfo);
      console.log("Changed:", personalChanged);

      if (!personalChanged) {
        await updateAvailability({
          availabilityStatus: profileData.availableForWork
            ? "Open_To_Opportunities"
            : "Not_Looking",
        });

        showToast(savedMessage, "success");
        return true;
      }

      const payload = {
        fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
        mobileNumber: profileData.mobile || "",
        trade: profileData.trade || "",
        jobTitle: profileData.trade || "",
        nationality: profileData.nationality || "",
        dateOfBirth: profileData.dob || null,
        gender: profileData.gender || "",
        email: profileData.email || "",
        currentCity: profileData.city || "",
        currentState: profileData.state || "",
        pincode: profileData.pin || "",
        professionalSummary: profileData.summary || "",
        expectedSalary: Number(profileData.salaryExpectation) || 0,
        salaryExpectation: Number(profileData.salaryExpectation) || 0,
        about: profileData.about || "",
        noticePeriod: profileData.noticePeriod || "",
        totalExperienceYears: Number(profileData.yearsOfExperience) || 0,
        newsletterOptIn: profileData.newsletterOptIn || false,
      };

      const response = await api.put(
        `/api/candidate/profile/personal-info?candidateId=${candidateId}`,
        payload,
      );

      if (response.data.success) {
        await updateAvailability({
          availabilityStatus: profileData.availableForWork
            ? "Open_To_Opportunities"
            : "Not_Looking",
        });

        savedMessage = response.data.message || savedMessage;

        setInitialPersonalInfo(currentPersonalInfo);

        showToast(savedMessage, "success");

        console.log("Profile Completion:", response.data.profileCompletionPct);

        return true; // <-- ADD THIS
      }

      return false; // <-- ADD THIS
    } catch (error) {
      console.log("STATUS:", error.response?.status);
      console.log("ERROR DATA:", error.response?.data);
      console.log("PAYLOAD:", payload);

      console.error("Failed to update profile", error);

      return false;
    }
  };

  // Upload profile photo to API
  const uploadProfile = async (file, previewUrl) => {
    try {
      const formData = new FormData();

      formData.append("photo", file);

      const response = await api.post(
        `/api/candidate/profile/profile-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("PHOTO UPLOADED", response.data);

      const uploadedPhotoUrl =
        response.data?.data?.profilePhotoUrl ||
        response.data?.profilePhotoUrl ||
        response.data?.data?.photoUrl ||
        response.data?.photoUrl;

      if (uploadedPhotoUrl) {
        const uploadedAvatar = buildProfilePhotoUrl(uploadedPhotoUrl);

        setProfileData((prev) => ({
          ...prev,
          avatar: getStoredProfilePhotoPreview() || uploadedAvatar,
        }));
      } else if (previewUrl) {
        storeProfilePhotoPreview(previewUrl);

        setProfileData((prev) => ({
          ...prev,
          avatar: previewUrl,
        }));
      }

      showToast("Profile photo uploaded successfully", "success");
    } catch (error) {
      console.error("UPLOAD ERROR", error);

      console.log("Response Data:", error.response?.data);
      console.log("Status:", error.response?.status);

      showToast("Photo upload failed", "error");
    }
  };

  // Load work experience from API
  const loadWorkExperience = useCallback(async () => {
    if (!candidateId) return;

    try {
      const response = await getWorkExperience();

      if (response.data.success) {
        const workData = response.data.data.map((item) => ({
          id: item.workId,
          title: item.jobTitle,
          company: item.companyName,
          location: item.workLocation,
          startDate: item.startDate ? item.startDate.split("T")[0] : "",
          endDate: item.endDate ? item.endDate.split("T")[0] : "",
          current: item.isCurrent,
          description: item.jobDescription || "",
          isOffshore: item.isOffshore || false,
        }));

        setInitialWorkHistory(workData);

        setProfileData((prev) => ({
          ...prev,
          workHistory: workData,
        }));
      }
    } catch (error) {
      console.error("Failed to load work experience", error);
    }
  }, [candidateId]);

  // Work

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkExperience();
  }, [loadWorkExperience]);

  const completionPercent = useMemo(() => {
    const checks = [
      Boolean(profileData.firstName && profileData.lastName),
      Boolean(profileData.mobile),
      Boolean(profileData.trade),
      Boolean(profileData.city && profileData.state),
      profileData.workHistory.length > 0,
      profileData.education.length > 0,
      (profileData.selectedSkills || []).length >= 3,
      Boolean(
        profileData.documents?.nationalId?.frontFile ||
        profileData.documents?.nationalId?.file,
      ),
      (profileData.languages || []).length > 0,
      Boolean(profileData.salaryExpectation),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profileData]);

  const updateField = useCallback(
    (field, value) => setProfileData((p) => ({ ...p, [field]: value })),
    [],
  );

  // Work handlers
  // Update existing work experience
  const updateWork = (id, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      workHistory: prev.workHistory.map((work) =>
        work.id === id
          ? {
              ...work,
              [field]: value,
            }
          : work,
      ),
    }));
  };

  const saveWork = async (work) => {
    const originalWork = initialWorkHistory.find((w) => w.id === work.id);

    if (originalWork && JSON.stringify(originalWork) === JSON.stringify(work)) {
      return true;
    }
    if (!validateWorkPayload(work)) {
      return false;
    }

    if (!work?.id || String(work.id).startsWith("work-")) {
      showToast(
        "Please add this work experience again so it can be saved to the server.",
        "error",
      );

      return false;
    }

    try {
      await updateWorkExperience(work.id, buildWorkPayload(work));

      showToast("Work experience updated", "success");

      await loadWorkExperience();
      return true;
    } catch (error) {
      console.log(
        "Failed to update work experience",
        error.response?.data || error.message,
      );
      showToast("Failed to update work experience", "error");
      return false;
    }
  };

  // Add new work experience

  const addWork = async (entry) => {
    if (!validateWorkPayload(entry)) {
      return false;
    }

    try {
      const payload = buildWorkPayload(entry);

      await createWorkExperience(payload);

      await loadWorkExperience();

      showToast("Work experience added", "success");
      return true;
    } catch (error) {
      console.log(
        "Failed to add work experience",
        error.response?.data || error.message,
      );
      showToast("Failed to add work experience", "error");
      return false;
    }
  };

  // Remove work experience
  const removeWork = async (workId) => {
    try {
      await deleteWorkExperience(workId);

      await loadWorkExperience();

      showToast("Work experience removed", "success");
      return true;
    } catch (error) {
      console.log(
        "Failed to remove work experience",
        error.response?.data || error.message,
      );
      showToast("Failed to remove work experience", "error");
      return false;
    }
  };

  const buildWorkPayload = (work) => ({
    jobTitle: work.title || "",
    companyName: work.company || "",
    workLocation: work.location || "",
    startDate: work.startDate || null,
    endDate: work.current ? null : work.endDate || null,
    isCurrent: !!work.current,
    jobDescription: work.description || "",
    noticePeriod: work.noticePeriod || "",
    isOffshore: work.isOffshore || false,
  });

  const validateWorkPayload = (work) => {
    if (!work.title || !work.company) {
      showToast("Role and company name are required.", "error");
      return false;
    }

    if (!work.startDate) {
      showToast("Start date is required.", "error");
      return false;
    }

    if (!work.current && !work.endDate) {
      showToast(
        "End date is required unless this is your current job.",
        "error",
      );
      return false;
    }
    if (
      work.startDate &&
      work.endDate &&
      new Date(work.endDate) < new Date(work.startDate)
    ) {
      showToast("End Date cannot be earlier than Start Date.", "error");
      return false;
    }

    return true;
  };

  // Load education from API
  const loadEducation = useCallback(async () => {
    if (!candidateId) return;

    try {
      const response = await getEducation(candidateId);

      if (response.data.success) {
        setProfileData((prev) => ({
          ...prev,
          education: response.data.data.map((item) => ({
            id: item.educationId,
            title: item.qualificationDegree,
            institution: item.instituteName,
            meta: item.yearDetails || "",
            certificateNumber: item.certificateNumber || "",
            verified: item.isAiVerified,
          })),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, [candidateId]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEducation();
  }, [loadEducation]);

  // Education handlers

  // Update existing education entry
  const updateEdu = (id, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id
          ? {
              ...edu,
              [field]: value,
            }
          : edu,
      ),
    }));
  };
  const saveEducation = async (education) => {
    try {
      await updateEducation(
        education.id,

        {
          qualificationDegree: education.title,
          instituteName: education.institution,
          yearDetails: education.meta,
          isAiVerified: education.verified || false,
          passoutYear: Number(education.passoutYear) || 0,
          certificateNumber: education.certificateNumber || "",
        },
      );

      showToast("Education updated", "success");

      await loadEducation();
    } catch (error) {
      console.log(error.response?.data);
      console.error(error);
    }
  };

  // Add new education entry
  const addEdu = async (entry) => {
    const payload = {
      qualificationDegree: entry.title,
      instituteName: entry.institution,
      yearDetails: entry.meta,
      isAiVerified: false,
      passoutYear: 0,
      certificateNumber: "",
    };
    try {
      await createEducation({
        qualificationDegree: entry.title,
        instituteName: entry.institution,
        yearDetails: entry.meta,
        isAiVerified: false,
        passoutYear: 0,
        certificateNumber: "",
      });

      await loadEducation();

      showToast("Education added", "success");
    } catch (error) {
      console.log(error.response?.data);
      console.error(error);
    }
  };

  // Remove education entry
  const removeEdu = async (educationId) => {
    try {
      await deleteEducation(educationId);

      await loadEducation();

      showToast("Education removed", "success");
    } catch (error) {
      console.log(error.response?.data);
      console.error(error);
    }
  };

  const loadSkills = useCallback(async () => {
    if (!candidateId) return;

    try {
      const response = await getSkills(candidateId);

      if (response.data.success) {
        const skills = response.data.data.skills || [];

        setProfileData((prev) => ({
          ...prev,

          selectedSkills: skills.map((s) => s.skillName),

          skillMatrix: skills.map((s) => ({
            id: s.skillId,
            name: s.skillName,
            proficiency: s.proficiencyLevel || "Beginner",
            years: s.yearsOfExperience || 0,
          })),
        }));
      }
    } catch (error) {
      console.error("Failed to load skills", error);
    }
  }, [candidateId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSkills();
  }, [loadSkills]);

  //Add new skill to API
  const addSkill = async (skillName) => {
    try {
      await createSkill({
        skillName,
        proficiencyLevel: "Beginner",
        yearsOfExperience: 1,
      });

      await loadSkills();

      showToast("Skill added", "success");

      return true;
    } catch (error) {
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);

      showToast("Failed to add skill", "error");

      return false;
    }
  };
  //Update existing skill in API
  const saveSkill = async (skill) => {
    try {
      await updateCandidateSkill(skill.id, candidateId, {
        skillName: skill.name,
        proficiencyLevel: skill.proficiency || "Beginner",
        yearsOfExperience: Number(skill.years) || 0,
      });

      showToast("Skill updated", "success");
      return true;
    } catch (error) {
      console.log(error.response?.data);

      showToast("Failed to update skill", "error");
      return false;
    }
  };

  //Remove skill from API
  const removeSkill = async (skillId) => {
    try {
      await deleteSkill(skillId, candidateId);

      await loadSkills();

      showToast("Skill removed", "success");
      return true;
    } catch (error) {
      console.log(error.response?.data);

      showToast("Failed to remove skill", "error");
      return false;
    }
  };

  const loadLanguages = useCallback(async () => {
    if (!candidateId) return;

    try {
      const response = await getLanguages(candidateId);

      if (response.data.success) {
        const languages = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data?.languages || [];

        setProfileData((prev) => ({
          ...prev,
          languages: languages.map((item) => ({
            id:
              item.languageId ||
              item.candidateLanguageId ||
              item.id ||
              item.skillId,
            name: item.languageName,
            proficiency: item.proficiencyLevel || "Conversational",
            reading: !!item.canRead,
            writing: !!item.canWrite,
            speaking: !!item.canSpeak,
          })),
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setProfileData((prev) => ({
          ...prev,
          languages: [],
        }));
        return;
      }

      console.error("Failed to load languages", error);
    }
  }, [candidateId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLanguages();
  }, [loadLanguages]);

  // Add new language to API
  const addLanguage = async (lang) => {
    try {
      await createLanguage(candidateId, {
        languageName: lang.name,
        proficiencyLevel: lang.proficiency,
        canRead: lang.reading,
        canWrite: lang.writing,
        canSpeak: lang.speaking,
      });

      await loadLanguages();

      showToast("Language added", "success");
      return true;
    } catch (error) {
      const errorData = error.response?.data;
      console.log(errorData);

      if (error.response?.status === 409) {
        await loadLanguages();
        showToast(errorData?.message || "Language already added", "info");
        return true;
      }

      showToast("Failed to add language", "error");
      return false;
    }
  };

  const saveLanguage = async (lang) => {
    if (!lang.id || String(lang.id).startsWith("language-")) {
      return addLanguage(lang);
    }

    try {
      await updateLanguage(lang.id, candidateId, {
        languageName: lang.name,
        proficiencyLevel: lang.proficiency,
        canRead: lang.reading,
        canWrite: lang.writing,
        canSpeak: lang.speaking,
      });

      await loadLanguages();

      showToast("Language updated", "success");
      return true;
    } catch (error) {
      console.log(error.response?.data);
      showToast("Failed to update language", "error");
      return false;
    }
  };

  // Remove language from API
  const removeLanguage = async (languageId) => {
    try {
      await deleteLanguage(languageId, candidateId);

      await loadLanguages();

      showToast("Language removed", "success");
      return true;
    } catch (error) {
      console.log(error.response?.data);
      showToast("Failed to remove language", "error");
      return false;
    }
  };
  // Skills
  const toggleSkill = async (skill) => {
    const existing = (profileData.skillMatrix || []).find(
      (entry) => entry.name === skill,
    );

    if (existing) {
      if (existing.id && !String(existing.id).startsWith("skill-")) {
        await removeSkill(existing.id);
        return;
      }

      setProfileData((p) => ({
        ...p,
        selectedSkills: (p.selectedSkills || []).filter((s) => s !== skill),
        skillMatrix: (p.skillMatrix || []).filter((e) => e.name !== skill),
      }));
      return;
    }

    await addSkill(skill);
  };
  const updateSkillState = useCallback((id, field, value) => {
    setProfileData((p) => ({
      ...p,
      skillMatrix: p.skillMatrix.map((e) =>
        e.id === id
          ? {
              ...e,
              [field]: value,
              isModified: true, // mark changed
            }
          : e,
      ),
    }));
  }, []);

  // Documents
  const uploadDoc = useCallback(
    (docKey, file, fieldKey = "file") => {
      const fileData = { name: file.name, size: formatFileSize(file.size) };
      setProfileData((p) => {
        const doc = p.documents[docKey];
        if (!doc) return p;
        const next = { ...doc, [fieldKey]: fileData };
        if (docKey === "nationalId") next.status = "verified";
        else if (docKey !== "itiCertificate") next.status = "uploaded";
        return { ...p, documents: { ...p.documents, [docKey]: next } };
      });
      showToast(`${file.name} uploaded.`, "success");
    },
    [showToast],
  );
  const clearDoc = useCallback(
    (docKey) => {
      setProfileData((p) => {
        const doc = p.documents[docKey];
        if (!doc) return p;
        const next = {
          ...doc,
          file: null,
          frontFile: null,
          status: "optional",
        };
        return { ...p, documents: { ...p.documents, [docKey]: next } };
      });
      showToast("File removed.", "info");
    },
    [showToast],
  );

  // Languages
  const addLang = async (lang) => {
    await addLanguage(lang);
  };
  const removeLang = async (name) => {
    const existing = (profileData.languages || []).find((l) => l.name === name);

    if (existing?.id && !String(existing.id).startsWith("language-")) {
      await removeLanguage(existing.id);
      return;
    }

    setProfileData((p) => ({
      ...p,
      languages: (p.languages || []).filter((l) => l.name !== name),
    }));
    showToast("Language removed.", "info");
  };
  const updateLang = useCallback(
    (name, field, value) =>
      setProfileData((p) => ({
        ...p,
        languages: (p.languages || []).map((l) =>
          l.name === name ? { ...l, [field]: value } : l,
        ),
      })),
    [],
  );

  const handleSaveStep = async () => {
    console.log("Current Step:", currentStep);
    if (currentStep === 1) {
      const saved = await savePersonalInfo();
      console.log("savePersonalInfo returned:", saved);

      if (!saved) {
        console.log("NOT MOVING TO NEXT STEP");
        return;
      }
    }

    if (currentStep === 3) {
      const serverWorkEntries = profileData.workHistory.filter(
        (work) => work.id && !String(work.id).startsWith("work-"),
      );

      const results = await Promise.all(
        serverWorkEntries.map((work) => saveWork(work)),
      );

      if (results.some((saved) => !saved)) return;
    }

    if (currentStep === 5) {
      const results = await Promise.all(
        (profileData.skillMatrix || [])
          .filter((skill) => skill.isModified)
          .map((skill) => {
            if (!skill.id || String(skill.id).startsWith("skill-")) {
              return addSkill(skill.name);
            }

            return saveSkill(skill);
          }),
      );

      if (results.some((saved) => !saved)) return;
    }

    if (currentStep === 6) {
      const results = await Promise.all(
        (profileData.languages || []).map((language) => saveLanguage(language)),
      );

      if (results.some((saved) => !saved)) return;
    }

    const names = [
      "Personal Information",
      "Documents",
      "Work Experience",
      "Education",
      "Skills",
      "Languages",
    ];

    showToast(`${names[currentStep - 1]} saved!`, "success");

    if (currentStep < TOTAL) {
      setCurrentStep((s) => s + 1);
    } else {
      setDone(true);
    }
  };

  const stepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepPersonal
            data={profileData}
            onChange={updateField}
            onPhotoUpload={uploadProfile}
            errors={errors}
          />
        );
      case 2:
        return <MyDocuments />;
      case 3:
        return (
          <StepWork
            data={profileData}
            onUpdate={updateWork}
            onAdd={addWork}
            onRemove={removeWork}
          />
        );
      case 4:
        return (
          <StepEducation
            data={profileData}
            onUpdate={updateEdu}
            onAdd={addEdu}
            onRemove={removeEdu}
          />
        );
      case 5:
        return (
          <StepSkills
            data={profileData}
            onToggle={toggleSkill}
            onUpdateSkill={updateSkillState}
          />
        );
      case 6:
        return (
          <StepLanguages
            data={profileData}
            onAdd={addLang}
            onRemove={removeLang}
            onUpdate={updateLang}
          />
        );
      default:
        return null;
    }
  };

  //Documents
  const loadDocuments = useCallback(async () => {
    try {
      const response = await getDocuments();

      console.log("DOCUMENTS:", response.data);

      if (response.data.success) {
        const docs = response.data.data;

        setProfileData((prev) => ({
          ...prev,
          documents: {
            ...prev.documents,

            // Resume
            resume: {
              ...prev.documents.resume,
              status: docs.resume ? "uploaded" : "missing",

              file: docs.resume
                ? {
                    id: docs.resume.cvId,
                    name: docs.resume.cvFileUrl.split("/").pop(),
                    url: docs.resume.cvFileUrl,
                  }
                : null,

              metaLines: docs.resume
                ? [
                    `Status: ${docs.resume.verificationStatus}`,
                    `Uploaded: ${new Date(
                      docs.resume.uploadedAt,
                    ).toLocaleDateString()}`,
                  ]
                : [],
            },

            // Education Certificates
            educationCertificate: {
              ...prev.documents.educationCertificate,

              status:
                docs.educationCertificates?.length > 0 ? "uploaded" : "missing",

              file:
                docs.educationCertificates?.length > 0
                  ? {
                      id: docs.educationCertificates[0].educationId,

                      name: docs.educationCertificates[0].educationLevel,
                    }
                  : null,

              metaLines:
                docs.educationCertificates?.map(
                  (item) => `${item.educationLevel} - ${item.instituteName}`,
                ) || [],
            },

            // Passport
            passport: {
              ...prev.documents.passport,

              status: docs.passport ? "uploaded" : "optional",

              file: docs.passport
                ? {
                    id: docs.passport.passportId,
                    name: docs.passport.passportNumber,
                  }
                : null,
            },

            // Aadhaar
            aadhaar: {
              ...prev.documents.aadhaar,

              status: docs.aadhaar ? "uploaded" : "optional",

              file: docs.aadhaar
                ? {
                    id: docs.aadhaar.aadhaarId,
                    name: docs.aadhaar.aadhaarNumber,
                  }
                : null,
            },
          },
        }));
      }
    } catch (error) {
      console.error("Failed to load documents", error);
    }
  }, []);

  const handleDocumentUpload = async (docKey, file) => {
    try {
      if (docKey === "resume") {
        await uploadResume(file);
        await loadDocuments();
        return;
      }
      gti;
      if (docKey === "educationCertificate") {
        const education = profile.education[0];

        await uploadEducationCertificate(
          {
            title: education.title,
            institution: education.institution,
            passoutYear: 2024,
            marksPercentage: "75%",
            certificateNumber: "",
          },
          file,
        );

        await loadDocuments();

        showToast("Education certificate uploaded", "success");

        return;
      }
    } catch (error) {
      console.error(error);
      showToast("Upload failed", "error");
    }
  };

  const handleDocumentClear = async (docKey) => {
    try {
      if (docKey === "resume") {
        await deleteResume();

        await loadDocuments();

        showToast("Resume deleted successfully", "success");
        return;
      }
    } catch (error) {
      console.error(error);

      showToast("Resume delete failed", "error");
    }
  };

  return (
    <main className="main">
      <section style={{ padding: "40px 0 60px" }}>
        <div className="container">
          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                color: T.navy,
                margin: "0 0 6px",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              My Profile
            </h2>
            <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>
              Complete your profile to get discovered by top employers
            </p>
          </div>

          <div className="row">
            {/* Left sidebar */}
            <div className="col-lg-3 col-md-4 d-none d-md-block">
              <ProfileMini
                data={profileData}
                percent={profileCompletion?.overallPct || 0}
                currentStep={currentStep}
                onJump={done ? null : (n) => setCurrentStep(n)}
              />
            </div>

            {/* Main form area */}
            <div className="col-lg-9 col-md-8 col-sm-12">
              <div
                style={{
                  background: T.white,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 2px 16px rgba(18,35,89,0.06)",
                }}
              >
                {/* Top stepper */}
                <div
                  style={{
                    padding: "28px 32px 0",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <StepBar current={done ? TOTAL + 1 : currentStep} />
                </div>

                {/* Content area */}
                <div style={{ padding: "32px 32px 24px" }}>
                  {done ? (
                    <CompletionSummary
                      percent={
                        profileCompletion?.overallPct ?? completionPercent
                      }
                      onEdit={() => {
                        setDone(false);
                        setCurrentStep(1);
                      }}
                      router={router}
                    />
                  ) : (
                    stepContent()
                  )}
                </div>

                {/* Footer nav */}
                {!done && (
                  <div
                    style={{
                      padding: "16px 32px 24px",
                      borderTop: `1px solid ${T.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Btn
                      variant="outline"
                      onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                      disabled={currentStep === 1}
                    >
                      <i
                        className="fi-rr-arrow-small-left"
                        aria-hidden="true"
                      />
                      Back
                    </Btn>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {STEPS.map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: i + 1 === currentStep ? 20 : 7,
                            height: 7,
                            borderRadius: 4,
                            background:
                              i + 1 < currentStep
                                ? T.success
                                : i + 1 === currentStep
                                  ? T.orange
                                  : T.border,
                            transition: "all .2s",
                          }}
                        />
                      ))}
                    </div>
                    <Btn onClick={handleSaveStep}>
                      {currentStep === TOTAL ? (
                        <>
                          <span>Save & Complete</span>
                          <i className="fi-rr-check" aria-hidden="true" />
                        </>
                      ) : (
                        <>
                          <span>Save & Continue</span>
                          <i
                            className="fi-rr-arrow-small-right"
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </Btn>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CandidateProfilePage;
