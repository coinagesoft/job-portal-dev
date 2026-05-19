"use client";

import React, { useCallback, useMemo, useState } from "react";
import { mockProfile } from "./components/data.js";
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

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}{required && <span style={{ color: T.error, marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: T.muted, marginTop: 4, margin: "4px 0 0" }}>{hint}</p>}
  </div>
);

const Inp = ({ style = {}, ...props }) => (
  <input
    {...props}
    style={{
      width: "100%", height: 48, padding: "0 14px", borderRadius: 8,
      border: `1.5px solid ${T.border}`, fontSize: 14, color: T.navy,
      background: T.white, outline: "none", boxSizing: "border-box",
      transition: "border-color .15s",
      ...style,
    }}
    onFocus={e => (e.target.style.borderColor = T.orangeLight)}
    onBlur={e => (e.target.style.borderColor = T.border)}
  />
);

const Sel = ({ children, style = {}, ...props }) => (
  <select
    {...props}
    style={{
      width: "100%", height: 48, padding: "0 14px", borderRadius: 8,
      border: `1.5px solid ${T.border}`, fontSize: 14, color: T.navy,
      background: T.white, outline: "none", boxSizing: "border-box",
      appearance: "none", WebkitAppearance: "none",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23122359' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
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
      width: "100%", padding: "12px 14px", borderRadius: 8,
      border: `1.5px solid ${T.border}`, fontSize: 14, color: T.navy,
      background: T.white, outline: "none", boxSizing: "border-box",
      resize: "vertical", minHeight: 90, lineHeight: 1.6,
      transition: "border-color .15s",
      ...style,
    }}
    onFocus={e => (e.target.style.borderColor = T.orangeLight)}
    onBlur={e => (e.target.style.borderColor = T.border)}
  />
);

const Btn = ({ children, variant = "primary", onClick, disabled, style = {}, type = "button" }) => {
  const variants = {
    primary: { background: T.orange, color: T.white, border: "none" },
    outline: { background: T.white, color: T.navy, border: `1.5px solid ${T.border}` },
    ghost:   { background: T.bg,    color: T.navy, border: `1.5px solid ${T.border}` },
    danger:  { background: T.errorBg, color: T.error, border: `1px solid ${T.error}` },
    success: { background: T.successBg, color: T.success, border: `1px solid ${T.success}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: "10px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
        transition: "all .15s", lineHeight: 1, whiteSpace: "nowrap",
        ...variants[variant], ...style,
      }}
    >
      {children}
    </button>
  );
};

const Tag = ({ label, onRemove }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px",
    background: "#e8f0fe", color: T.navy, borderRadius: 20, fontSize: 12,
    fontWeight: 600, margin: "3px",
  }}>
    {label}
    {onRemove && (
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 14, padding: 0, lineHeight: 1 }}>
        <i className="fi-rr-cross-small" aria-hidden="true" />
      </button>
    )}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.white, border: `1px solid ${T.border}`, borderRadius: 12,
    padding: "20px 24px", marginBottom: 16, ...style,
  }}>
    {children}
  </div>
);

// ─── Step Progress Bar ────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 32, overflowX: "auto", paddingBottom: 4 }}>
    {STEPS.map((step, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <React.Fragment key={step.id}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 64 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: done ? 16 : 14,
              fontWeight: 700, flexShrink: 0, transition: "all .2s",
              background: done ? T.success : active ? T.orange : T.bg,
              color: (done || active) ? T.white : T.muted,
              border: active ? `3px solid ${T.orangeLight}` : `2px solid ${done ? T.success : T.border}`,
              boxSizing: "border-box",
              boxShadow: active ? `0 0 0 4px rgba(255,163,0,0.15)` : "none",
            }}>
              <i
                className={done ? "fi-rr-check" : step.iconClass}
                aria-hidden="true"
                style={{ fontSize: done ? 13 : 14, lineHeight: 1, display: "inline-flex" }}
              />
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? T.orange : done ? T.success : T.muted, textAlign: "center", whiteSpace: "nowrap" }}>
              {step.label}
            </span>
          </div>
          {i < TOTAL - 1 && (
            <div style={{ flex: 1, height: 2, margin: "19px 4px 0", background: done ? T.success : T.border, transition: "background .3s", minWidth: 16 }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── STEP 1 — Personal Information ───────────────────────────────────────────
const StepPersonal = ({ data, onChange }) => {
  const [avatarPreview, setAvatarPreview] = useState(data.avatar || "/assets/imgs/page/candidates/candidate-profile.png");

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>Personal Information</h4>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 28, marginTop: 0 }}>Let employers know who you are</p>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, padding: "16px 20px", background: T.bg, borderRadius: 12 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: `3px solid ${T.orangeLight}`, flexShrink: 0 }}>
          <img src={avatarPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div>
          <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: 14, color: T.navy }}>Profile Photo</p>
          <input type="file" id="avatar-upload" onChange={handleAvatar} accept="image/jpeg,image/png,image/jpg" style={{ display: "none" }} />
          <label htmlFor="avatar-upload" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: T.orange, color: T.white, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <i className="fi-rr-camera" aria-hidden="true" style={{ lineHeight: 1 }} />
            Upload Photo
          </label>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="First Name" required>
          <Inp value={data.firstName || ""} onChange={e => onChange("firstName", e.target.value)} placeholder="Ramesh" />
        </Field>
        <Field label="Last Name" required>
          <Inp value={data.lastName || ""} onChange={e => onChange("lastName", e.target.value)} placeholder="Sharma" />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Mobile Number" required>
          <Inp value={data.mobile || ""} onChange={e => onChange("mobile", e.target.value)} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email Address">
          <Inp type="email" value={data.email || ""} onChange={e => onChange("email", e.target.value)} placeholder="ramesh@email.com" />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Date of Birth">
          <Inp type="date" value={data.dob || ""} onChange={e => onChange("dob", e.target.value)} />
        </Field>
        <Field label="Gender">
          <Sel value={data.gender || ""} onChange={e => onChange("gender", e.target.value)}>
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </Sel>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
        <Field label="City" required>
          <Inp value={data.city || ""} onChange={e => onChange("city", e.target.value)} placeholder="Pune" />
        </Field>
        <Field label="State">
          <Sel value={data.state || ""} onChange={e => onChange("state", e.target.value)}>
            <option value="">Select state</option>
            {["Andhra Pradesh","Bihar","Delhi","Gujarat","Haryana","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"].map(s => <option key={s}>{s}</option>)}
          </Sel>
        </Field>
        <Field label="PIN Code">
          <Inp value={data.pin || ""} onChange={e => onChange("pin", e.target.value)} placeholder="411001" maxLength={6} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Nationality">
          <Inp value={data.nationality || ""} onChange={e => onChange("nationality", e.target.value)} placeholder="Indian" />
        </Field>
        <Field label="Trade / Job Title" required>
          <Inp value={data.trade || ""} onChange={e => onChange("trade", e.target.value)} placeholder="Senior Electrician" />
        </Field>
      </div>

      <Field label="Professional Summary" hint="2–4 lines about your experience and specialisation">
        <Textarea value={data.summary || ""} onChange={e => onChange("summary", e.target.value)} rows={4} placeholder="Describe your key skills and years of experience..." />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Expected Salary (₹/month)">
          <Inp type="number" value={data.salaryExpectation || ""} onChange={e => onChange("salaryExpectation", Number(e.target.value))} placeholder="45000" />
        </Field>
        <Field label="Years of Experience">
          <Inp type="number" value={data.yearsOfExperience || ""} onChange={e => onChange("yearsOfExperience", Number(e.target.value))} placeholder="8" min={0} max={50} />
        </Field>
      </div>

      <div style={{ padding: "14px 18px", background: T.bg, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
        <input type="checkbox" id="available" checked={!!data.availableForWork} onChange={e => onChange("availableForWork", e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: T.orange }} />
        <label htmlFor="available" style={{ fontSize: 14, color: T.navy, fontWeight: 500, cursor: "pointer" }}>
          I am currently available for work
        </label>
      </div>
    </div>
  );
};

// ─── STEP 3 — Work Experience ─────────────────────────────────────────────────
const StepWork = ({ data, onUpdate, onAdd, onRemove }) => {
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
  const showToast = useToast();

  const handleSave = () => {
    if (!newEntry.title || !newEntry.company) {
      showToast("Role and company name are required.", "error");
      return;
    }
    onAdd(newEntry);
    setNewEntry({ title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
    setShowForm(false);
  };

  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>Work Experience</h4>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>Add your employment history — most recent first</p>

      {data.workHistory.map((entry) => (
        <Card key={entry.id}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="Job Title" required>
                  <Inp value={entry.title} onChange={e => onUpdate(entry.id, "title", e.target.value)} />
                </Field>
                <Field label="Company Name" required>
                  <Inp value={entry.company} onChange={e => onUpdate(entry.id, "company", e.target.value)} />
                </Field>
              </div>
              <Field label="Location">
                <Inp value={entry.location} onChange={e => onUpdate(entry.id, "location", e.target.value)} placeholder="City, State" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="Start Date">
                  <Inp type="date" value={entry.startDate} onChange={e => onUpdate(entry.id, "startDate", e.target.value)} />
                </Field>
                <Field label="End Date">
                  <Inp type="date" value={entry.current ? "" : entry.endDate} onChange={e => onUpdate(entry.id, "endDate", e.target.value)} disabled={entry.current} />
                </Field>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!entry.current} onChange={e => onUpdate(entry.id, "current", e.target.checked)} style={{ width: 16, height: 16, accentColor: T.orange }} />
                  Currently working here
                </label>
              </div>
              <Field label="Description">
                <Textarea value={entry.description} onChange={e => onUpdate(entry.id, "description", e.target.value)} rows={3} />
              </Field>
            </div>
            <button onClick={() => onRemove(entry.id)} style={{ background: T.errorBg, border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", color: T.error, fontSize: 13, fontWeight: 600, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <i className="fi-rr-cross-small" aria-hidden="true" />
              Remove
            </button>
          </div>
        </Card>
      ))}

      {showForm && (
        <Card style={{ background: "#fffbf0", border: `1.5px dashed ${T.orangeLight}` }}>
          <h6 style={{ margin: "0 0 16px", color: T.navy }}>New Work Entry</h6>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Job Title" required><Inp value={newEntry.title} onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))} /></Field>
            <Field label="Company Name" required><Inp value={newEntry.company} onChange={e => setNewEntry(p => ({ ...p, company: e.target.value }))} /></Field>
          </div>
          <Field label="Location"><Inp value={newEntry.location} onChange={e => setNewEntry(p => ({ ...p, location: e.target.value }))} placeholder="City, State" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Start Date"><Inp type="date" value={newEntry.startDate} onChange={e => setNewEntry(p => ({ ...p, startDate: e.target.value }))} /></Field>
            <Field label="End Date"><Inp type="date" value={newEntry.endDate} onChange={e => setNewEntry(p => ({ ...p, endDate: e.target.value }))} disabled={newEntry.current} /></Field>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.text, cursor: "pointer" }}>
              <input type="checkbox" checked={!!newEntry.current} onChange={e => setNewEntry(p => ({ ...p, current: e.target.checked }))} style={{ width: 16, height: 16, accentColor: T.orange }} />
              Currently working here
            </label>
          </div>
          <Field label="Description"><Textarea value={newEntry.description} onChange={e => setNewEntry(p => ({ ...p, description: e.target.value }))} rows={3} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn onClick={handleSave}>Save Entry</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: "14px", border: `2px dashed ${T.border}`, background: "transparent", borderRadius: 10, cursor: "pointer", color: T.orange, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .15s" }}
          onMouseEnter={e => { e.target.style.borderColor = T.orange; e.target.style.background = "#fffbf0"; }}
          onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.background = "transparent"; }}
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
  const [newEntry, setNewEntry] = useState({ title: "", institution: "", meta: "" });
  const showToast = useToast();

  const handleSave = () => {
    if (!newEntry.title) { showToast("Qualification title is required.", "error"); return; }
    onAdd(newEntry);
    setNewEntry({ title: "", institution: "", meta: "" });
    setShowForm(false);
  };

  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>Education & Qualifications</h4>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>List your degrees, certificates, and training courses</p>

      {data.education.map((entry) => (
        <Card key={entry.id}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="Qualification / Degree" required>
                  <Inp value={entry.title} onChange={e => onUpdate(entry.id, "title", e.target.value)} />
                </Field>
                <Field label="Institute / Board">
                  <Inp value={entry.institution} onChange={e => onUpdate(entry.id, "institution", e.target.value)} />
                </Field>
              </div>
              <Field label="Year / Details" hint="E.g. Passed: 2014 | Cert No: ITI/2014">
                <Inp value={entry.meta} onChange={e => onUpdate(entry.id, "meta", e.target.value)} placeholder="Passed: 2014" />
              </Field>
              {entry.verified && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: T.success, fontWeight: 600 }}>
                  <i className="fi-rr-check" aria-hidden="true" />
                  AI Verified
                </span>
              )}
            </div>
            <button onClick={() => onRemove(entry.id)} style={{ background: T.errorBg, border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", color: T.error, fontSize: 13, fontWeight: 600, flexShrink: 0, height: "fit-content", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fi-rr-cross-small" aria-hidden="true" />
            </button>
          </div>
        </Card>
      ))}

      {showForm && (
        <Card style={{ background: "#fffbf0", border: `1.5px dashed ${T.orangeLight}` }}>
          <h6 style={{ margin: "0 0 16px", color: T.navy }}>New Qualification</h6>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Qualification / Degree" required><Inp value={newEntry.title} onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))} /></Field>
            <Field label="Institute / Board"><Inp value={newEntry.institution} onChange={e => setNewEntry(p => ({ ...p, institution: e.target.value }))} /></Field>
          </div>
          <Field label="Year / Details"><Inp value={newEntry.meta} onChange={e => setNewEntry(p => ({ ...p, meta: e.target.value }))} placeholder="Passed: 2014" /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={handleSave}>Save</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: "14px", border: `2px dashed ${T.border}`, background: "transparent", borderRadius: 10, cursor: "pointer", color: T.orange, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .15s" }}
          onMouseEnter={e => { e.target.style.borderColor = T.orange; e.target.style.background = "#fffbf0"; }}
          onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.background = "transparent"; }}
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
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>Select your trade skills and set your proficiency level</p>

      {/* Suggested skills */}
      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.navy, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 14px" }}>Tap to select skills</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(data.suggestedSkills || []).map((skill) => {
            const selected = (data.selectedSkills || []).includes(skill);
            return (
              <button key={skill} onClick={() => onToggle(skill)} style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: "pointer", border: `1.5px solid ${selected ? T.orange : T.border}`,
                background: selected ? T.orange : T.white,
                color: selected ? T.white : T.text, transition: "all .15s",
              }}>
                {skill}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Inp value={customSkill} onChange={e => setCustomSkill(e.target.value)} placeholder="Add a custom skill..." onKeyDown={e => e.key === "Enter" && addCustom()} style={{ flex: 1, height: 42 }} />
          <Btn onClick={addCustom} style={{ padding: "8px 16px" }}>+ Add</Btn>
        </div>
      </Card>

      {/* Skill matrix */}
      {(data.skillMatrix || []).length > 0 && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.navy, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 14px" }}>Set proficiency levels</p>
          {(data.skillMatrix || []).map((entry) => (
            <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, padding: "12px 16px", background: T.bg, borderRadius: 8 }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: T.navy }}>{entry.name}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {PROFICIENCY.map(p => (
                  <button key={p} onClick={() => onUpdateSkill(entry.id, "proficiency", p)} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", border: `1.5px solid ${entry.proficiency === p ? T.orange : T.border}`,
                    background: entry.proficiency === p ? T.orange : T.white,
                    color: entry.proficiency === p ? T.white : T.muted, transition: "all .12s",
                  }}>{p}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Inp type="number" value={entry.years} min={0} max={40} onChange={e => onUpdateSkill(entry.id, "years", Number(e.target.value))} style={{ width: 70, height: 36, textAlign: "center" }} />
                <span style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>yrs</span>
              </div>
              <button onClick={() => onToggle(entry.name)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 18, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fi-rr-cross-small" aria-hidden="true" />
              </button>
            </div>
          ))}
        </Card>
      )}

      <p style={{ fontSize: 12, color: T.muted }}>
        {(data.selectedSkills || []).length} skill{(data.selectedSkills || []).length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
};

// ─── STEP 2 — Documents ───────────────────────────────────────────────────────
const DocUploadBox = ({ doc, docKey, onUpload, onClear }) => {
  const statusColors = {
    verified: { bg: "#e8f0fe", color: "#1a56c4", border: "#c7dcff", label: "Verified", iconClass: "fi-rr-check" },
    uploaded: { bg: "#e8f0fe", color: "#1a56c4", border: "#c7dcff", label: "Uploaded", iconClass: "fi-rr-check" },
    missing: { bg: "#e8f0fe", color: "#1a56c4", border: "#c7dcff", label: "Required", iconClass: "fi-rr-exclamation" },
    optional: { bg: "#e8f0fe", color: "#1a56c4", border: "#c7dcff", label: "Optional", iconClass: null },
  };
  const s = statusColors[doc.status] || statusColors.optional;

  return (
    <Card style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{doc.label}</span>
            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}`, display: "inline-flex", alignItems: "center", gap: 5 }}>
              {s.iconClass && <i className={s.iconClass} aria-hidden="true" style={{ fontSize: 10, lineHeight: 1 }} />}
              {s.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: T.muted, margin: "0 0 8px" }}>{doc.description}</p>
          {doc.metaLines && doc.metaLines.map((m, i) => (
            <p key={i} style={{ fontSize: 11, color: T.muted, margin: "2px 0" }}>{m}</p>
          ))}
          {(doc.file || doc.frontFile) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, padding: "8px 12px", background: T.bg, borderRadius: 7 }}>
              <span style={{ fontSize: 13, color: T.navy, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <i className="fi-rr-clip" aria-hidden="true" />
                {(doc.file || doc.frontFile).name}
              </span>
              <span style={{ fontSize: 11, color: T.muted }}>{(doc.file || doc.frontFile).size}</span>
              {doc.status !== "verified" && (
                <button onClick={() => onClear(docKey)} style={{ marginLeft: "auto", background: "none", border: "none", color: T.error, cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <i className="fi-rr-cross-small" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
        {doc.status !== "verified" && doc.type !== "readonly" && (
          <div>
            <input type="file" id={`upload-${docKey}`} onChange={e => e.target.files[0] && onUpload(docKey, e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: "none" }} />
            <label htmlFor={`upload-${docKey}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: T.navy, whiteSpace: "nowrap" }}>
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
    <p style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>Upload your certificates and ID proof for faster hiring</p>
    {Object.entries(data.documents).map(([key, doc]) => (
      <DocUploadBox key={key} doc={doc} docKey={key} onUpload={onUpload} onClear={onClear} />
    ))}
  </div>
);

// ─── STEP 6 — Languages ───────────────────────────────────────────────────────
const LANG_OPTIONS = ["Hindi", "English", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Gujarati", "Punjabi", "Urdu", "Arabic", "Nepali"];
const PROF_LEVELS = ["Beginner", "Conversational", "Professional", "Native"];

const StepLanguages = ({ data, onAdd, onRemove, onUpdate }) => {
  const [newLang, setNewLang] = useState("");
  const [newProf, setNewProf] = useState("Conversational");

  const handleAdd = () => {
    if (!newLang) return;
    onAdd({ name: newLang, proficiency: newProf, reading: true, writing: true, speaking: true });
    setNewLang("");
  };

  return (
    <div>
      <h4 style={{ color: T.navy, marginBottom: 6, marginTop: 0 }}>Language Preferences</h4>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>Languages you can communicate in</p>

      {(data.languages || []).map((lang) => (
        <Card key={lang.name}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: T.navy, minWidth: 90 }}>{lang.name}</span>
            <Sel value={lang.proficiency} onChange={e => onUpdate(lang.name, "proficiency", e.target.value)} style={{ flex: 1, height: 40 }}>
              {PROF_LEVELS.map(p => <option key={p}>{p}</option>)}
            </Sel>
            <div style={{ display: "flex", gap: 12 }}>
              {["reading", "writing", "speaking"].map(skill => (
                <label key={skill} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 11, color: T.muted, cursor: "pointer", textTransform: "capitalize" }}>
                  <input type="checkbox" checked={!!lang[skill]} onChange={e => onUpdate(lang.name, skill, e.target.checked)} style={{ width: 16, height: 16, accentColor: T.orange }} />
                  {skill}
                </label>
              ))}
            </div>
            <button onClick={() => onRemove(lang.name)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 18, padding: "0 4px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fi-rr-cross-small" aria-hidden="true" />
            </button>
          </div>
        </Card>
      ))}

      <Card style={{ background: "#fffbf0", border: `1.5px dashed ${T.orangeLight}` }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.navy, margin: "0 0 12px", textTransform: "uppercase" }}>Add Language</p>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Sel value={newLang} onChange={e => setNewLang(e.target.value)} style={{ height: 44 }}>
              <option value="">Select language</option>
              {LANG_OPTIONS.filter(l => !(data.languages || []).find(x => x.name === l)).map(l => <option key={l}>{l}</option>)}
            </Sel>
          </div>
          <div style={{ flex: 1 }}>
            <Sel value={newProf} onChange={e => setNewProf(e.target.value)} style={{ height: 44 }}>
              {PROF_LEVELS.map(p => <option key={p}>{p}</option>)}
            </Sel>
          </div>
          <Btn onClick={handleAdd} disabled={!newLang} style={{ height: 44, padding: "0 20px", gap: 6 }}>
            <i className="fi-rr-add" aria-hidden="true" />
            Add
          </Btn>
        </div>
      </Card>
    </div>
  );
};

// ─── Completion Summary (final step done) ────────────────────────────────────
const CompletionSummary = ({ percent, onEdit }) => (
  <div style={{ textAlign: "center", padding: "40px 20px" }}>
    <div style={{ width: 96, height: 96, borderRadius: "50%", background: T.successBg, border: `3px solid ${T.success}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 20px" }}>
      <i className="fi-rr-check" aria-hidden="true" style={{ lineHeight: 1 }} />
    </div>
    <h3 style={{ color: T.navy, margin: "0 0 8px" }}>Profile Complete!</h3>
    <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>Your profile is {percent}% complete. Employers can now find you.</p>
    <div style={{ background: T.bg, borderRadius: 12, padding: "16px 24px", display: "inline-block", marginBottom: 28 }}>
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>Profile Strength</div>
      <div style={{ height: 8, background: T.border, borderRadius: 4, width: 220, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percent}%`, background: T.orange, borderRadius: 4, transition: "width .5s" }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.orange, marginTop: 6 }}>{percent}%</div>
    </div>
    <div>
      <Btn onClick={onEdit} variant="outline" style={{ marginRight: 12 }}>Edit Profile</Btn>
      <Btn style={{ color: T.white }}>
        <span style={{ color: T.white }}>Browse Jobs</span>
        <i className="fi-rr-arrow-small-right" aria-hidden="true" style={{ color: T.white }} />
      </Btn>
    </div>
  </div>
);

// ─── Profile Sidebar (progress overview) ─────────────────────────────────────
const ProfileMini = ({ data, percent, currentStep, onJump }) => (
  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", position: "sticky", top: 90 }}>
    {/* Header banner */}
    <div style={{ background: `linear-gradient(135deg, ${T.navy} 0%, #1e3a8a 100%)`, padding: "24px 20px", textAlign: "center" }}>
      <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", border: `3px solid ${T.orange}`, margin: "0 auto 12px", background: T.bg }}>
        <img src={data.avatar || "/assets/imgs/page/candidates/candidate-profile.png"} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>{data.firstName} {data.lastName}</div>
      <div style={{ color: T.orangeLight, fontSize: 12, marginTop: 4 }}>{data.trade}</div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Profile Strength</div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${percent}%`, background: T.orange, borderRadius: 3, transition: "width .5s" }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.orange, marginTop: 4 }}>{percent}%</div>
      </div>
    </div>

    {/* Steps list */}
    <div style={{ padding: "12px 0" }}>
      {STEPS.map((step, i) => {
        const n = i + 1;
        const done = n < currentStep;
        const active = n === currentStep;
        return (
          <button key={step.id} onClick={() => onJump(n)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
            background: active ? "#fff8ec" : "transparent", border: "none",
            borderLeft: active ? `3px solid ${T.orange}` : "3px solid transparent",
            cursor: "pointer", textAlign: "left", transition: "all .15s",
          }}>
            <span style={{ fontSize: 12, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: done ? T.success : active ? T.orange : T.bg, color: (done || active) ? T.white : T.muted, fontWeight: 700 }}>
              <i
                className={done ? "fi-rr-check" : step.iconClass}
                aria-hidden="true"
                style={{ fontSize: 11, lineHeight: 1, display: "inline-flex" }}
              />
            </span>
            <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? T.orange : done ? T.navy : T.muted }}>
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CandidateProfilePage = () => {
  const showToast = useToast();
  const [profileData, setProfileData] = useState(mockProfile);
  const [currentStep, setCurrentStep] = useState(1);
  const [done, setDone] = useState(false);

  const completionPercent = useMemo(() => {
    const checks = [
      Boolean(profileData.firstName && profileData.lastName),
      Boolean(profileData.mobile),
      Boolean(profileData.trade),
      Boolean(profileData.city && profileData.state),
      profileData.workHistory.length > 0,
      profileData.education.length > 0,
      (profileData.selectedSkills || []).length >= 3,
      Boolean(profileData.documents?.nationalId?.frontFile || profileData.documents?.nationalId?.file),
      (profileData.languages || []).length > 0,
      Boolean(profileData.salaryExpectation),
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [profileData]);

  const updateField = useCallback((field, value) => setProfileData(p => ({ ...p, [field]: value })), []);

  // Work handlers
  const updateWork = useCallback((id, field, value) => setProfileData(p => ({ ...p, workHistory: p.workHistory.map(e => e.id === id ? { ...e, [field]: value } : e) })), []);
  const addWork = useCallback((entry) => setProfileData(p => ({ ...p, workHistory: [...p.workHistory, { ...entry, id: createId("work") }] })), []);
  const removeWork = useCallback((id) => { setProfileData(p => ({ ...p, workHistory: p.workHistory.filter(e => e.id !== id) })); showToast("Work entry removed.", "info"); }, [showToast]);

  // Education handlers
  const updateEdu = useCallback((id, field, value) => setProfileData(p => ({ ...p, education: p.education.map(e => e.id === id ? { ...e, [field]: value } : e) })), []);
  const addEdu = useCallback((entry) => { setProfileData(p => ({ ...p, education: [...p.education, { ...entry, id: createId("edu"), verified: false }] })); showToast("Qualification added.", "success"); }, [showToast]);
  const removeEdu = useCallback((id) => { setProfileData(p => ({ ...p, education: p.education.filter(e => e.id !== id) })); showToast("Education entry removed.", "info"); }, [showToast]);

  // Skills
  const toggleSkill = useCallback((skill) => setProfileData(p => {
    const selected = (p.selectedSkills || []).includes(skill);
    const nextSkills = selected ? p.selectedSkills.filter(s => s !== skill) : [...(p.selectedSkills || []), skill];
    const nextMatrix = selected ? (p.skillMatrix || []).filter(e => e.name !== skill) : (p.skillMatrix || []).some(e => e.name === skill) ? p.skillMatrix : [...(p.skillMatrix || []), { id: createId("skill"), name: skill, proficiency: "Beginner", years: 1 }];
    return { ...p, selectedSkills: nextSkills, skillMatrix: nextMatrix };
  }), []);
  const updateSkill = useCallback((id, field, value) => setProfileData(p => ({ ...p, skillMatrix: p.skillMatrix.map(e => e.id === id ? { ...e, [field]: value } : e) })), []);

  // Documents
  const uploadDoc = useCallback((docKey, file, fieldKey = "file") => {
    const fileData = { name: file.name, size: formatFileSize(file.size) };
    setProfileData(p => {
      const doc = p.documents[docKey];
      if (!doc) return p;
      const next = { ...doc, [fieldKey]: fileData };
      if (docKey === "nationalId") next.status = "verified"; else if (docKey !== "itiCertificate") next.status = "uploaded";
      return { ...p, documents: { ...p.documents, [docKey]: next } };
    });
    showToast(`${file.name} uploaded.`, "success");
  }, [showToast]);
  const clearDoc = useCallback((docKey) => {
    setProfileData(p => {
      const doc = p.documents[docKey];
      if (!doc) return p;
      const next = { ...doc, file: null, frontFile: null, status: "optional" };
      return { ...p, documents: { ...p.documents, [docKey]: next } };
    });
    showToast("File removed.", "info");
  }, [showToast]);

  // Languages
  const addLang = useCallback((lang) => { setProfileData(p => ({ ...p, languages: [...(p.languages || []), lang] })); showToast(`${lang.name} added.`, "success"); }, [showToast]);
  const removeLang = useCallback((name) => { setProfileData(p => ({ ...p, languages: (p.languages || []).filter(l => l.name !== name) })); showToast("Language removed.", "info"); }, [showToast]);
  const updateLang = useCallback((name, field, value) => setProfileData(p => ({ ...p, languages: (p.languages || []).map(l => l.name === name ? { ...l, [field]: value } : l) })), []);

  const handleSaveStep = () => {
    const names = ["Personal Information", "Documents", "Work Experience", "Education", "Skills", "Languages"];
    showToast(`${names[currentStep - 1]} saved!`, "success");
    if (currentStep < TOTAL) {
      setCurrentStep(s => s + 1);
    } else {
      setDone(true);
    }
  };

  const stepContent = () => {
    switch (currentStep) {
      case 1: return <StepPersonal data={profileData} onChange={updateField} />;
      case 2: return <StepDocuments data={profileData} onUpload={uploadDoc} onClear={clearDoc} />;
      case 3: return <StepWork data={profileData} onUpdate={updateWork} onAdd={addWork} onRemove={removeWork} />;
      case 4: return <StepEducation data={profileData} onUpdate={updateEdu} onAdd={addEdu} onRemove={removeEdu} />;
      case 5: return <StepSkills data={profileData} onToggle={toggleSkill} onUpdateSkill={updateSkill} />;
      case 6: return <StepLanguages data={profileData} onAdd={addLang} onRemove={removeLang} onUpdate={updateLang} />;
      default: return null;
    }
  };

  return (
    <main className="main">
      <section style={{ padding: "40px 0 60px" }}>
        <div className="container">
          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ color: T.navy, margin: "0 0 6px", fontSize: 26, fontWeight: 800 }}>My Profile</h2>
            <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>Complete your profile to get discovered by top employers</p>
          </div>

          <div className="row">
            {/* Left sidebar */}
            <div className="col-lg-3 col-md-4 d-none d-md-block">
              <ProfileMini data={profileData} percent={completionPercent} currentStep={currentStep} onJump={done ? null : (n) => setCurrentStep(n)} />
            </div>

            {/* Main form area */}
            <div className="col-lg-9 col-md-8 col-sm-12">
              <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(18,35,89,0.06)" }}>
                {/* Top stepper */}
                <div style={{ padding: "28px 32px 0", borderBottom: `1px solid ${T.border}` }}>
                  <StepBar current={done ? TOTAL + 1 : currentStep} />
                </div>

                {/* Content area */}
                <div style={{ padding: "32px 32px 24px" }}>
                  {done ? (
                    <CompletionSummary percent={completionPercent} onEdit={() => { setDone(false); setCurrentStep(1); }} />
                  ) : (
                    stepContent()
                  )}
                </div>

                {/* Footer nav */}
                {!done && (
                  <div style={{ padding: "16px 32px 24px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Btn variant="outline" onClick={() => setCurrentStep(s => Math.max(1, s - 1))} disabled={currentStep === 1}>
                      <i className="fi-rr-arrow-small-left" aria-hidden="true" />
                      Back
                    </Btn>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {STEPS.map((_, i) => (
                        <div key={i} style={{ width: i + 1 === currentStep ? 20 : 7, height: 7, borderRadius: 4, background: i + 1 < currentStep ? T.success : i + 1 === currentStep ? T.orange : T.border, transition: "all .2s" }} />
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
                          <i className="fi-rr-arrow-small-right" aria-hidden="true" />
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
