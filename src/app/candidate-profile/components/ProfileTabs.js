"use client";

import React, { useMemo, useState } from "react";
import { useToast } from "@/components/Toast";

const LANGUAGE_OPTIONS = [
  "Hindi", "English", "Marathi", "Tamil", "Telugu", "Kannada",
  "Malayalam", "Bengali", "Gujarati", "Punjabi", "Urdu", "Odia",
  "Arabic", "Nepali", "Assamese"
];
const PROFICIENCY_LEVELS = ["Beginner", "Conversational", "Professional", "Native"];

const getStatusDetails = (status) => {
  switch (status) {
    case "verified": return { label: "Verified", className: "is-success" };
    case "missing": return { label: "Not uploaded", className: "is-warning" };
    case "uploaded": return { label: "Uploaded", className: "is-info" };
    default: return { label: "Optional", className: "is-muted" };
  }
};

const getSkillBadgeClass = (proficiency) => {
  if (proficiency === "Expert") return "is-teal";
  if (proficiency === "Intermediate") return "is-brand";
  return "is-muted";
};

const sanitizeId = (value) => value.replace(/[^a-zA-Z0-9_-]/g, "");

// Generic Edit Modal
const EditModal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
  }}>
    <div style={{
      background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "520px",
      maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
    }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h5 style={{ margin: 0, color: "#05264E" }}>{title}</h5>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#666" }}>Ã—</button>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>{children}</div>
    </div>
  </div>
);

const ProfileTabs = ({
  profileData,
  completionPercent,
  documentSummary,
  registerSectionRef,
  updateProfileField,
  updateWorkEntry,
  addWorkEntry,
  removeWorkEntry,
  updateEducationEntry,
  updateSkillEntry,
  addEducationEntry,
  removeEducationEntry,
  toggleSkill,
  handleDocumentUpload,
  clearDocumentUpload,
  addCustomDocument,
  uploadCustomDocument,
  clearCustomDocument,
  saveSection,
  showWorkModal,
  newWorkEntry,
  openWorkModal,
  closeWorkModal,
  updateNewWorkField,
  saveWorkEntry,
  addLanguage,
  removeLanguage,
  updateLanguage,
}) => {
  const showToast = useToast();
  const [dragZone, setDragZone] = useState("");
  const [editWorkModal, setEditWorkModal] = useState(null); // work entry being edited
  const [editEduModal, setEditEduModal] = useState(null);
  const [editSkillModal, setEditSkillModal] = useState(null);
  const [newLangName, setNewLangName] = useState("");
  const [newLangLevel, setNewLangLevel] = useState("Conversational");

  const profileName = profileData.fullName || `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim();
  const maskedMobile = profileData.mobile
    ? profileData.mobile.replace(/[0-9](?=[0-9]{4})/g, "X")
    : "Contact hidden";
  const profileEmail = profileData.email || "email hidden";
  const location = [profileData.city, profileData.state].filter(Boolean).join(", ");
  const nowLabel = useMemo(() => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), []);
  const openDatePicker = (event) => {
    if (typeof event?.target?.showPicker === "function") {
      event.target.showPicker();
    }
  };

  const renderSingleUploadZone = (docKey, documentData, isCustom = false, customDocId = "") => {
    const zoneKey = isCustom ? `custom-${customDocId}` : docKey;
    const inputId = sanitizeId(`upload-${zoneKey}`);
    const hasFile = Boolean(documentData.file);
    const onUpload = (file) => {
      if (!file) return;
      if (isCustom) uploadCustomDocument(customDocId, file);
      else handleDocumentUpload(docKey, file);
    };
    const onClear = () => {
      if (isCustom) clearCustomDocument(customDocId);
      else clearDocumentUpload(docKey);
    };
    return (
      <div
        className={`candidate-profile-v2-upload-zone ${hasFile ? "is-uploaded" : ""} ${dragZone === zoneKey ? "is-dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragZone(zoneKey); }}
        onDragLeave={(e) => { e.preventDefault(); setDragZone(""); }}
        onDrop={(e) => { e.preventDefault(); setDragZone(""); onUpload(e.dataTransfer.files?.[0]); }}
      >
        <input id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="candidate-profile-v2-hidden-input" onChange={(e) => onUpload(e.target.files?.[0])} />
        <label htmlFor={inputId} className="candidate-profile-v2-upload-trigger">
          <span className="candidate-profile-v2-upload-title">{hasFile ? "File selected" : `Upload ${documentData.label}`}</span>
          <span className="candidate-profile-v2-upload-sub">{hasFile ? `${documentData.file.name} | ${documentData.file.size}` : "Drag and drop or click to browse"}</span>
          <span className="candidate-profile-v2-upload-chip-wrap">
            <span className="candidate-profile-v2-upload-chip">PDF</span>
            <span className="candidate-profile-v2-upload-chip">DOC</span>
            <span className="candidate-profile-v2-upload-chip">JPG</span>
            <span className="candidate-profile-v2-upload-chip">Max 5 MB</span>
          </span>
        </label>
        {hasFile && (
          <div className="candidate-profile-v2-upload-file-row">
            <span>{documentData.file.name}</span>
            <span>{documentData.file.size}</span>
            <button type="button" className="candidate-profile-v2-clear-file" onClick={onClear}>Remove</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="candidate-profile-v2-main-col">
      {/* â”€â”€ PERSONAL â”€â”€ */}
      <section id="personal" ref={(n) => registerSectionRef("personal", n)} className="candidate-profile-v2-section-card">
        <div className="candidate-profile-v2-card-header">
          <div className="candidate-profile-v2-title-wrap">
            <h5 className="candidate-profile-v2-card-title">Step 1: Personal Information &amp; Profile Photo</h5>
          </div>
          <div className="candidate-profile-v2-actions">
            <button type="button" className="btn btn-border btn-sm" onClick={() => showToast("Changes discarded.", "info")}>Cancel</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => saveSection("personal")}>Save changes</button>
          </div>
        </div>
        <div className="candidate-profile-v2-card-body">
          <p className="ai-note-inline">Smart AI prefill note: basic fields can be auto-filled after your documents are scanned in Step 2. Please verify and save.</p>
          <div className="candidate-profile-v2-photo-row">
            <div className="candidate-profile-v2-photo-mark">
              <span>{profileName.slice(0, 1).toUpperCase()}</span>
            </div>
            <div>
              <p className="candidate-profile-v2-photo-label">Profile photo</p>
              <p className="candidate-profile-v2-photo-sub">JPG or PNG, max 2 MB</p>
              <div className="candidate-profile-v2-actions">
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        showToast("File too large â€” please upload a JPG or PNG under 2 MB.", "error");
                        return;
                      }
                      showToast(`Photo "${file.name}" uploaded successfully.`, "success");
                    }
                    e.target.value = "";
                  }}
                />
                <label htmlFor="profile-photo-upload" className="btn btn-border btn-sm" style={{ cursor: "pointer", marginBottom: 0 }}>
                  Upload photo
                </label>
                <button type="button" className="btn btn-grey-small" onClick={() => showToast("Profile photo removed.", "info")}>Remove</button>
              </div>
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">First name *</label>
              <input className="form-control" value={profileData.firstName} onChange={(e) => updateProfileField("firstName", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Last name *</label>
              <input className="form-control" value={profileData.lastName} onChange={(e) => updateProfileField("lastName", e.target.value)} />
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Mobile number *</label>
              <input className="form-control" value={profileData.mobile} onChange={(e) => updateProfileField("mobile", e.target.value)} />
              <small className="candidate-profile-v2-field-hint">Verified via OTP</small>
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Email address</label>
              <input className="form-control" type="email" value={profileData.email} onChange={(e) => updateProfileField("email", e.target.value)} />
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid three-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Trade / Occupation *</label>
              <input className="form-control" value={profileData.trade} onChange={(e) => updateProfileField("trade", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Years of experience *</label>
              <input className="form-control" type="number" min="0" value={profileData.yearsOfExperience} onChange={(e) => updateProfileField("yearsOfExperience", Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Nationality *</label>
              <input className="form-control" value={profileData.nationality} onChange={(e) => updateProfileField("nationality", e.target.value)} />
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Salary Expectation (per month)</label>
              <input className="form-control" type="number" min="0" value={profileData.salaryExpectation || ""} onChange={(e) => updateProfileField("salaryExpectation", Number(e.target.value))} />
              <small className="candidate-profile-v2-field-hint">Employers filter by salary range</small>
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">ITI Certified</label>
              <select
                className="form-control"
                value={profileData.isITI ? "yes" : "no"}
                onChange={(e) => updateProfileField("isITI", e.target.value === "yes")}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Passport Number</label>
              <input className="form-control" value={profileData.passportNumber || ""} onChange={(e) => updateProfileField("passportNumber", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Passport Expiry</label>
              <input className="form-control" type="date" value={profileData.passportExpiry || ""} onChange={(e) => updateProfileField("passportExpiry", e.target.value)} />
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Date of birth *</label>
              <input className="form-control" type="date" value={profileData.dob} onChange={(e) => updateProfileField("dob", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Gender</label>
              <select className="form-control" value={profileData.gender} onChange={(e) => updateProfileField("gender", e.target.value)}>
                <option>Male</option><option>Female</option><option>Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid three-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">City *</label>
              <input className="form-control" value={profileData.city} onChange={(e) => updateProfileField("city", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">State *</label>
              <input className="form-control" value={profileData.state} onChange={(e) => updateProfileField("state", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">PIN code</label>
              <input className="form-control" value={profileData.pin} onChange={(e) => updateProfileField("pin", e.target.value)} />
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Full Address</label>
              <textarea className="form-control candidate-profile-v2-textarea" rows="2" value={profileData.address || ""} onChange={(e) => updateProfileField("address", e.target.value)} placeholder="House no., Street, Landmark, etc." />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Role / Position *</label>
              <input className="form-control" value={profileData.role || ""} onChange={(e) => updateProfileField("role", e.target.value)} placeholder="e.g. Senior Electrician" />
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Category</label>
              <input className="form-control" value={profileData.category || ""} onChange={(e) => updateProfileField("category", e.target.value)} placeholder="e.g. Skilled Trade, Maritime" />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Disability Status</label>
              <select className="form-control" value={profileData.hasDisability ? "yes" : "no"} onChange={(e) => updateProfileField("hasDisability", e.target.value === "yes")}>
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Preferred Work Location</label>
              <select className="form-control" value={profileData.preferredWorkLocation || ""} onChange={(e) => updateProfileField("preferredWorkLocation", e.target.value)}>
                <option value="">Select preference</option>
                <option value="domestic">Domestic only</option>
                <option value="international">International</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Preferred Job Type</label>
              <select className="form-control" value={profileData.jobType || ""} onChange={(e) => updateProfileField("jobType", e.target.value)}>
                <option value="">Select type</option>
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="contract">Contract / Project</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Summary / About</label>
            <textarea className="form-control candidate-profile-v2-textarea" value={profileData.summary} onChange={(e) => updateProfileField("summary", e.target.value)} />
            <small className="candidate-profile-v2-field-hint">Shown to employers on your profile</small>
          </div>
        </div>
        <div className="candidate-profile-v2-card-footer">
          <span>Last updated: {nowLabel}</span>
          <button type="button" className="btn btn-default btn-sm" onClick={() => saveSection("personal")}>Save changes</button>
        </div>
      </section>

      {/* â”€â”€ DOCUMENTS â”€â”€ */}
      <section id="documents" ref={(n) => registerSectionRef("documents", n)} className="candidate-profile-v2-section-card">
        <div className="candidate-profile-v2-card-header">
          <div className="candidate-profile-v2-title-wrap">
            <h5 className="candidate-profile-v2-card-title">Step 2: Upload Documents</h5>
            <span className="candidate-profile-v2-badge is-success">{documentSummary.verified} verified</span>
            <span className="candidate-profile-v2-badge is-warning">{documentSummary.pending} pending</span>
          </div>
          <div className="candidate-profile-v2-actions">
            <button type="button" className="btn btn-border btn-sm" onClick={addCustomDocument}>Add document</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => saveSection("documents")}>Save changes</button>
          </div>
        </div>
        <div className="candidate-profile-v2-card-body">
          <p className="ai-note-inline">Your CV and documents are being scanned by Smart AI. Parsing and verification may take some time. Once completed, profile fields below are prefilled for your final review.</p>

          {/* CV Upload â€” prominent card at top */}
          <div style={{ marginBottom: "20px" }}>
            <article className="candidate-profile-v2-doc-card" style={{ border: "2px solid #3B82F6", background: "#f0f6ff" }}>
              <div className="candidate-profile-v2-doc-head">
                <h6 style={{ color: "#1976D2" }}>ðŸ“„ CV / Resume</h6>
                <span className={`candidate-profile-v2-badge ${getStatusDetails(profileData.documents.cv?.status || "optional").className}`}>
                  {getStatusDetails(profileData.documents.cv?.status || "optional").label}
                </span>
              </div>
              <div className="candidate-profile-v2-doc-body">
                <p className="candidate-profile-v2-doc-main">Upload your latest CV or resume. This is the primary document employers review.</p>
                <p className="candidate-profile-v2-doc-meta">Accepted: PDF, DOC, DOCX Â· Max size: 5 MB</p>
                {profileData.documents.cv ? renderSingleUploadZone("cv", profileData.documents.cv) : null}
              </div>
              <div className="candidate-profile-v2-doc-foot">Your CV is shown to verified employers only</div>
            </article>
          </div>

          <div className="candidate-profile-v2-doc-grid">
            <article className="candidate-profile-v2-doc-card">
              <div className="candidate-profile-v2-doc-head">
                <h6>{profileData.documents.nationalId.label}</h6>
                <span className={`candidate-profile-v2-badge ${getStatusDetails(profileData.documents.nationalId.status).className}`}>
                  {getStatusDetails(profileData.documents.nationalId.status).label}
                </span>
              </div>
              <div className="candidate-profile-v2-doc-body">
                <p className="candidate-profile-v2-doc-main">{profileData.documents.nationalId.description}</p>
                {profileData.documents.nationalId.metaLines.map((line) => (<p key={line} className="candidate-profile-v2-doc-meta">{line}</p>))}
                <div className="candidate-profile-v2-mini-upload-grid">
                  {["frontFile", "backFile"].map((fieldKey) => {
                    const currentFile = profileData.documents.nationalId[fieldKey];
                    const label = fieldKey === "frontFile" ? "Front side" : "Back side";
                    const inputId = sanitizeId(`national-id-${fieldKey}`);
                    return (
                      <div key={fieldKey} className={`candidate-profile-v2-mini-upload ${currentFile ? "uploaded" : ""}`}>
                        <input id={inputId} type="file" className="candidate-profile-v2-hidden-input" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocumentUpload("nationalId", e.target.files?.[0], fieldKey)} />
                        <label htmlFor={inputId} className="candidate-profile-v2-mini-upload-trigger">
                          <strong>{label}</strong>
                          <small>{currentFile ? `${currentFile.name} | ${currentFile.size}` : fieldKey === "frontFile" ? "Required" : "Optional"}</small>
                        </label>
                        {currentFile && (<button type="button" className="candidate-profile-v2-clear-file" onClick={() => clearDocumentUpload("nationalId", fieldKey)}>Remove</button>)}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="candidate-profile-v2-doc-foot">{profileData.documents.nationalId.footerNote}</div>
            </article>

            {["passport", "itiCertificate", "experienceLetter", "medicalFitness"].map((docKey) => {
              const documentData = profileData.documents[docKey];
              const statusDetails = getStatusDetails(documentData.status);
              return (
                <article key={docKey} className="candidate-profile-v2-doc-card">
                  <div className="candidate-profile-v2-doc-head">
                    <h6>{documentData.label}</h6>
                    <span className={`candidate-profile-v2-badge ${statusDetails.className}`}>{statusDetails.label}</span>
                  </div>
                  <div className="candidate-profile-v2-doc-body">
                    <p className="candidate-profile-v2-doc-main">{documentData.description}</p>
                    {documentData.metaLines.map((line) => (<p key={line} className="candidate-profile-v2-doc-meta">{line}</p>))}
                    {documentData.type === "readonly" ? (
                      <div className="candidate-profile-v2-upload-zone is-uploaded is-readonly">
                        <p className="candidate-profile-v2-upload-title">Certificate uploaded</p>
                        <p className="candidate-profile-v2-upload-sub">{documentData.file?.name} | {documentData.file?.size}</p>
                      </div>
                    ) : renderSingleUploadZone(docKey, documentData)}
                  </div>
                  <div className="candidate-profile-v2-doc-foot">{documentData.footerNote}</div>
                </article>
              );
            })}

            {profileData.customDocuments.map((documentData) => {
              const statusDetails = getStatusDetails(documentData.status);
              return (
                <article key={documentData.id} className="candidate-profile-v2-doc-card">
                  <div className="candidate-profile-v2-doc-head">
                    <h6>{documentData.label}</h6>
                    <span className={`candidate-profile-v2-badge ${statusDetails.className}`}>{statusDetails.label}</span>
                  </div>
                  <div className="candidate-profile-v2-doc-body">
                    <p className="candidate-profile-v2-doc-main">{documentData.description}</p>
                    {documentData.metaLines.map((line) => (<p key={line} className="candidate-profile-v2-doc-meta">{line}</p>))}
                    {renderSingleUploadZone("", documentData, true, documentData.id)}
                  </div>
                  <div className="candidate-profile-v2-doc-foot">{documentData.footerNote}</div>
                </article>
              );
            })}
          </div>
          <div className="candidate-profile-v2-privacy-note">Your identity number is not stored in plain text. Verified document data is only shared with authorized employers.</div>
        </div>
      </section>

      {/* â”€â”€ WORK HISTORY â”€â”€ */}
      <section id="work" ref={(n) => registerSectionRef("work", n)} className="candidate-profile-v2-section-card">
        <div className="candidate-profile-v2-card-header">
          <div className="candidate-profile-v2-title-wrap">
            <h5 className="candidate-profile-v2-card-title">Step 3: Work History</h5>
            <span className="candidate-profile-v2-badge is-brand">{profileData.workHistory.length} entries</span>
          </div>
          <div className="candidate-profile-v2-actions">
            <button type="button" className="btn btn-border btn-sm" onClick={openWorkModal}>Add experience</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => saveSection("work")}>Save changes</button>
          </div>
        </div>
        <div className="candidate-profile-v2-card-body">
          <p className="ai-note-inline">Smart AI suggestion: work history can be prefilled from uploaded CV and documents. Review entries before saving.</p>
          {profileData.workHistory.map((entry) => (
            <div key={entry.id} className="candidate-profile-v2-entry-card">
              <div className="candidate-profile-v2-entry-dot" />
              <div className="candidate-profile-v2-entry-content">
                <div className="candidate-profile-v2-form-grid two-col">
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Role title</label>
                    <input className="form-control" value={entry.title} onChange={(e) => updateWorkEntry(entry.id, "title", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Company</label>
                    <input className="form-control" value={entry.company} onChange={(e) => updateWorkEntry(entry.id, "company", e.target.value)} />
                  </div>
                </div>
                <div className="candidate-profile-v2-form-grid two-col">
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Start Date</label>
                    <input
                      className="form-control"
                      type="date"
                      value={entry.startDate || ""}
                      onChange={(e) => updateWorkEntry(entry.id, "startDate", e.target.value)}
                      onFocus={openDatePicker}
                      onClick={openDatePicker}
                    />
                  </div>
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">End Date</label>
                    <input
                      className="form-control"
                      type="date"
                      value={entry.endDate || ""}
                      onChange={(e) => updateWorkEntry(entry.id, "endDate", e.target.value)}
                      onFocus={openDatePicker}
                      onClick={openDatePicker}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="font-sm color-text-mutted mb-10">Location</label>
                  <input className="form-control" value={entry.location} onChange={(e) => updateWorkEntry(entry.id, "location", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="font-sm color-text-mutted mb-10">Description</label>
                  <textarea className="form-control candidate-profile-v2-textarea-sm" value={entry.description} onChange={(e) => updateWorkEntry(entry.id, "description", e.target.value)} />
                </div>
                <label className="candidate-profile-v2-checkbox-item">
                  <input type="checkbox" checked={entry.current} onChange={(e) => updateWorkEntry(entry.id, "current", e.target.checked)} />
                  <span>Current role</span>
                </label>
              </div>
              <div className="candidate-profile-v2-entry-actions">
                <button type="button" className="btn btn-border btn-sm" onClick={() => { setEditWorkModal(entry); showToast("Editing work entry â€” update fields below.", "info"); }}>Edit</button>
                <button type="button" className="btn btn-grey-small candidate-profile-v2-btn-delete" onClick={() => removeWorkEntry(entry.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ EDUCATION â”€â”€ */}
      <section id="education" ref={(n) => registerSectionRef("education", n)} className="candidate-profile-v2-section-card">
        <div className="candidate-profile-v2-card-header">
          <div className="candidate-profile-v2-title-wrap">
            <h5 className="candidate-profile-v2-card-title">Step 4: Education</h5>
            <span className="candidate-profile-v2-badge is-brand">{profileData.education.length} entries</span>
          </div>
          <div className="candidate-profile-v2-actions">
            <button type="button" className="btn btn-border btn-sm" onClick={addEducationEntry}>Add education</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => saveSection("education")}>Save changes</button>
          </div>
        </div>
        <div className="candidate-profile-v2-card-body">
          <p className="ai-note-inline">Smart AI OCR note: education details are auto-extracted when possible. Edit any low-confidence values.</p>
          {profileData.education.map((entry) => (
            <div key={entry.id} className="candidate-profile-v2-entry-card">
              <div className="candidate-profile-v2-entry-dot is-green" />
              <div className="candidate-profile-v2-entry-content">
                <div className="candidate-profile-v2-form-grid two-col">
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Qualification</label>
                    <input className="form-control" value={entry.title} onChange={(e) => updateEducationEntry(entry.id, "title", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Institution</label>
                    <input className="form-control" value={entry.institution} onChange={(e) => updateEducationEntry(entry.id, "institution", e.target.value)} />
                  </div>
                </div>
                <div className="candidate-profile-v2-form-grid two-col">
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Meta details</label>
                    <input className="form-control" value={entry.meta} onChange={(e) => updateEducationEntry(entry.id, "meta", e.target.value)} />
                  </div>
                  <div className="candidate-profile-v2-checkbox-row">
                    <label className="candidate-profile-v2-checkbox-item">
                      <input type="checkbox" checked={entry.verified} onChange={(e) => updateEducationEntry(entry.id, "verified", e.target.checked)} />
                      <span>AI Verified</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="candidate-profile-v2-entry-actions">
                <button type="button" className="btn btn-border btn-sm" onClick={() => { setEditEduModal(entry); showToast("Editing education entry â€” update fields below.", "info"); }}>Edit</button>
                <button type="button" className="btn btn-grey-small candidate-profile-v2-btn-delete" onClick={() => removeEducationEntry(entry.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ SKILLS â”€â”€ */}
      <section id="skills" ref={(n) => registerSectionRef("skills", n)} className="candidate-profile-v2-section-card">
        <div className="candidate-profile-v2-card-header">
          <div className="candidate-profile-v2-title-wrap">
            <h5 className="candidate-profile-v2-card-title">Step 5: Skills</h5>
            <span className="candidate-profile-v2-badge is-brand">{profileData.selectedSkills.length} selected</span>
          </div>
          <div className="candidate-profile-v2-actions">
            <button type="button" className="btn btn-border btn-sm" onClick={() => showToast("Click on any skill tag below to add or remove it.", "info")}>Add skill</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => saveSection("skills")}>Save changes</button>
          </div>
        </div>
        <div className="candidate-profile-v2-card-body">
          <p className="ai-note-inline">Smart AI recommendation note: suggested skills are generated from your parsed CV profile.</p>
          <div className="candidate-profile-v2-subheader">
            <h6>Suggested for {profileData.trade}</h6>
            <small>Click to toggle</small>
          </div>
          <div className="candidate-profile-v2-tags">
            {profileData.suggestedSkills.map((skill) => {
              const isSelected = profileData.selectedSkills.includes(skill);
              return (
                <button key={skill} type="button" className={`candidate-profile-v2-tag ${isSelected ? "selected" : ""}`} onClick={() => toggleSkill(skill)}>
                  {skill}{isSelected && <span className="candidate-profile-v2-tag-close">x</span>}
                </button>
              );
            })}
          </div>
          <div className="candidate-profile-v2-divider" />
          <div className="candidate-profile-v2-subheader"><h6>Your skills with proficiency</h6></div>
          <div className="candidate-profile-v2-table-wrap">
            <table className="candidate-profile-v2-table">
              <thead><tr><th>Skill</th><th>Proficiency</th><th>Years</th><th /></tr></thead>
              <tbody>
                {profileData.skillMatrix.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td><span className={`candidate-profile-v2-badge ${getSkillBadgeClass(item.proficiency)}`}>{item.proficiency}</span></td>
                    <td>{item.years}</td>
                    <td>
                      <button type="button" className="btn btn-border btn-sm" onClick={() => { setEditSkillModal({ ...item }); showToast(`Editing skill: ${item.name}`, "info"); }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* â”€â”€ LANGUAGES â”€â”€ */}
      <section id="languages" ref={(n) => registerSectionRef("languages", n)} className="candidate-profile-v2-section-card">
        <div className="candidate-profile-v2-card-header">
          <div className="candidate-profile-v2-title-wrap">
            <h5 className="candidate-profile-v2-card-title">Step 6: Language Preferences</h5>
            <span className="candidate-profile-v2-badge is-brand">{(profileData.languages || []).length} added</span>
          </div>
          <button type="button" className="btn btn-default btn-sm" onClick={() => saveSection("languages")}>Save changes</button>
        </div>
        <div className="candidate-profile-v2-card-body">
          <p className="ai-note-inline">Add languages you can communicate in. This helps match you with employers and job sites in different regions.</p>

          {/* Add new language row */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap" }}>
            <div className="form-group" style={{ flex: "1 1 160px", margin: 0 }}>
              <label className="font-sm color-text-mutted mb-10">Language</label>
              <select className="form-control" value={newLangName} onChange={(e) => setNewLangName(e.target.value)}>
                <option value="">Select language</option>
                {LANGUAGE_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: "1 1 160px", margin: 0 }}>
              <label className="font-sm color-text-mutted mb-10">Proficiency</label>
              <select className="form-control" value={newLangLevel} onChange={(e) => setNewLangLevel(e.target.value)}>
                {PROFICIENCY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button type="button" className="btn btn-default btn-sm" style={{ marginBottom: "1px" }} onClick={() => {
              if (!newLangName) { showToast("Please select a language first.", "warning"); return; }
              addLanguage({ name: newLangName, proficiency: newLangLevel, reading: true, writing: true, speaking: true });
              setNewLangName(""); setNewLangLevel("Conversational");
            }}>+ Add</button>
          </div>

          {(profileData.languages || []).length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af", border: "1.5px dashed #e5e7eb", borderRadius: "10px" }}>
              No languages added yet. Add at least one language to improve your profile visibility.
            </div>
          ) : (
            <div className="candidate-profile-v2-table-wrap">
              <table className="candidate-profile-v2-table">
                <thead>
                  <tr><th>Language</th><th>Proficiency</th><th>Read</th><th>Write</th><th>Speak</th><th /></tr>
                </thead>
                <tbody>
                  {(profileData.languages || []).map((lang) => (
                    <tr key={lang.name}>
                      <td><strong>{lang.name}</strong></td>
                      <td>
                        <select
                          className="form-control"
                          value={lang.proficiency}
                          onChange={(e) => updateLanguage(lang.name, "proficiency", e.target.value)}
                          style={{ width: "auto", minWidth: "130px", padding: "4px 8px", fontSize: "13px" }}
                        >
                          {PROFICIENCY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input type="checkbox" checked={lang.reading} onChange={(e) => updateLanguage(lang.name, "reading", e.target.checked)} />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input type="checkbox" checked={lang.writing} onChange={(e) => updateLanguage(lang.name, "writing", e.target.checked)} />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input type="checkbox" checked={lang.speaking} onChange={(e) => updateLanguage(lang.name, "speaking", e.target.checked)} />
                      </td>
                      <td>
                        <button type="button" className="btn btn-grey-small candidate-profile-v2-btn-delete" onClick={() => removeLanguage(lang.name)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="candidate-profile-v2-card-footer">
          <span>Languages help employers assess job-site communication requirements</span>
        </div>
      </section>

      {/* â”€â”€ CV PREVIEW â”€â”€ */}
      <section id="cv" ref={(n) => registerSectionRef("cv", n)} className="candidate-profile-v2-section-card">
        <div className="candidate-profile-v2-card-header">
          <div className="candidate-profile-v2-title-wrap">
            <h5 className="candidate-profile-v2-card-title">Step 7: CV Preview</h5>
          </div>
          <div className="candidate-profile-v2-actions">
            <button type="button" className="btn btn-border btn-sm" onClick={() => showToast("PDF download initiated â€” your CV will be ready shortly.", "info")}>Download PDF</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => showToast("CV link copied to clipboard!", "success")}>Share CV link</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => saveSection("cv")}>Save changes</button>
          </div>
        </div>
        <div className="candidate-profile-v2-card-body">
          <p className="ai-note-inline">Smart AI note: this CV view is generated from parsed and verified profile data.</p>
          <div className="candidate-profile-v2-cv-note">Contact details are masked. Employers can view full contact after profile unlock.</div>

          {/* Enlarged CV Preview */}
          <div className="candidate-profile-v2-cv-box" style={{ minHeight: "700px", fontSize: "15px" }}>
            <div className="candidate-profile-v2-cv-head" style={{ padding: "32px 32px 24px", borderBottom: "3px solid #3B82F6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "12px" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#3B82F6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", flexShrink: 0 }}>
                  {profileName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#05264E", fontSize: "26px" }}>{profileName}</h3>
                  <p style={{ margin: "4px 0 0", color: "#3B82F6", fontWeight: "600", fontSize: "16px" }}>{profileData.trade} Â· {profileData.yearsOfExperience} years experience</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "13px", color: "#6b7280" }}>
                <span>ðŸ“ {location}</span>
                <span>ðŸ“ž {maskedMobile}</span>
                <span>âœ‰ {profileEmail}</span>
                {profileData.nationality && <span>ðŸŒ {profileData.nationality}</span>}
              </div>
              {(profileData.languages || []).length > 0 && (
                <div style={{ marginTop: "10px", fontSize: "13px", color: "#6b7280" }}>
                  ðŸ—£ Languages: {(profileData.languages || []).map(l => `${l.name} (${l.proficiency})`).join(" Â· ")}
                </div>
              )}
            </div>

            <div className="candidate-profile-v2-cv-grid" style={{ padding: "28px 32px", gap: "32px" }}>
              <div>
                <h5 style={{ color: "#05264E", borderBottom: "2px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>Work Experience</h5>
                {profileData.workHistory.map((entry) => (
                  <div key={entry.id} className="candidate-profile-v2-cv-item" style={{ marginBottom: "18px", paddingLeft: "12px", borderLeft: "3px solid #3B82F6" }}>
                    <strong style={{ fontSize: "15px" }}>{entry.title}</strong>
                    <div style={{ color: "#3B82F6", fontSize: "13px", margin: "2px 0" }}>{entry.company}</div>
                    <p style={{ color: "#6b7280", fontSize: "12px", margin: "2px 0" }}>
                      {(entry.startDate || entry.endDate) ? `${entry.startDate || "-"} to ${entry.current ? "Present" : entry.endDate || "-"}` : entry.period} | {entry.location}
                    </p>
                    {entry.description ? <small style={{ color: "#374151", lineHeight: "1.6" }}>{entry.description}</small> : null}
                  </div>
                ))}

                <h5 style={{ color: "#05264E", borderBottom: "2px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px", marginTop: "24px" }}>Summary</h5>
                <p style={{ color: "#374151", lineHeight: "1.7", fontSize: "14px" }}>{profileData.summary}</p>
              </div>

              <div>
                <h5 style={{ color: "#05264E", borderBottom: "2px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>Skills</h5>
                <div className="candidate-profile-v2-cv-skills" style={{ marginBottom: "24px" }}>
                  {profileData.selectedSkills.map((skill) => (
                    <span key={skill} className="candidate-profile-v2-badge is-brand" style={{ marginBottom: "6px", fontSize: "12px" }}>{skill}</span>
                  ))}
                </div>

                <h5 style={{ color: "#05264E", borderBottom: "2px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>Education</h5>
                {profileData.education.map((entry) => (
                  <div key={entry.id} className="candidate-profile-v2-cv-item" style={{ marginBottom: "14px", paddingLeft: "12px", borderLeft: "3px solid #10b981" }}>
                    <strong style={{ fontSize: "14px" }}>{entry.title}</strong>
                    <p style={{ color: "#6b7280", fontSize: "12px", margin: "2px 0" }}>{entry.institution}</p>
                    <small style={{ color: "#9ca3af" }}>{entry.meta}</small>
                    {entry.verified && <span style={{ marginLeft: "8px", fontSize: "10px", background: "#d1fae5", color: "#065f46", padding: "1px 6px", borderRadius: "10px" }}>âœ“ Verified</span>}
                  </div>
                ))}

                {(profileData.languages || []).length > 0 && (
                  <>
                    <h5 style={{ color: "#05264E", borderBottom: "2px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px", marginTop: "24px" }}>Languages</h5>
                    {(profileData.languages || []).map((lang) => (
                      <div key={lang.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                        <span>{lang.name}</span>
                        <span style={{ color: "#6b7280" }}>{lang.proficiency}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="candidate-profile-v2-cv-complete">Profile completion score: <strong>{completionPercent}%</strong></div>
        </div>
      </section>

      {/* â”€â”€ ADD WORK MODAL â”€â”€ */}
      {showWorkModal && (
        <EditModal title="Add Work Experience" onClose={closeWorkModal}>
          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Role title *</label>
              <input className="form-control" value={newWorkEntry.title || ""} onChange={(e) => updateNewWorkField("title", e.target.value)} placeholder="e.g. Senior Electrician" />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Company *</label>
              <input className="form-control" value={newWorkEntry.company || ""} onChange={(e) => updateNewWorkField("company", e.target.value)} placeholder="e.g. ABC Engineering Pvt Ltd" />
            </div>
          </div>
          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Start Date</label>
              <input
                className="form-control"
                type="date"
                value={newWorkEntry.startDate || ""}
                onChange={(e) => updateNewWorkField("startDate", e.target.value)}
                onFocus={openDatePicker}
                onClick={openDatePicker}
              />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">End Date</label>
              <input
                className="form-control"
                type="date"
                value={newWorkEntry.endDate || ""}
                onChange={(e) => updateNewWorkField("endDate", e.target.value)}
                onFocus={openDatePicker}
                onClick={openDatePicker}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Location</label>
            <input className="form-control" value={newWorkEntry.location || ""} onChange={(e) => updateNewWorkField("location", e.target.value)} placeholder="City, State" />
          </div>
          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Description</label>
            <textarea className="form-control" rows="3" value={newWorkEntry.description || ""} onChange={(e) => updateNewWorkField("description", e.target.value)} placeholder="Describe your responsibilities and achievements" />
          </div>
          <label className="candidate-profile-v2-checkbox-item" style={{ marginBottom: "20px" }}>
            <input type="checkbox" checked={newWorkEntry.current || false} onChange={(e) => updateNewWorkField("current", e.target.checked)} />
            <span>This is my current role</span>
          </label>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-border btn-sm" onClick={closeWorkModal}>Cancel</button>
            <button type="button" className="btn btn-default btn-sm" onClick={saveWorkEntry}>Save Experience</button>
          </div>
        </EditModal>
      )}

      {/* â”€â”€ EDIT WORK MODAL â”€â”€ */}
      {editWorkModal && (
        <EditModal title="Edit Work Experience" onClose={() => setEditWorkModal(null)}>
          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Role title</label>
              <input className="form-control" value={editWorkModal.title} onChange={(e) => setEditWorkModal(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Company</label>
              <input className="form-control" value={editWorkModal.company} onChange={(e) => setEditWorkModal(p => ({ ...p, company: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Location</label>
            <input className="form-control" value={editWorkModal.location} onChange={(e) => setEditWorkModal(p => ({ ...p, location: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Description</label>
            <textarea className="form-control" rows="3" value={editWorkModal.description} onChange={(e) => setEditWorkModal(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-border btn-sm" onClick={() => setEditWorkModal(null)}>Cancel</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => {
              updateWorkEntry(editWorkModal.id, "title", editWorkModal.title);
              updateWorkEntry(editWorkModal.id, "company", editWorkModal.company);
              updateWorkEntry(editWorkModal.id, "location", editWorkModal.location);
              updateWorkEntry(editWorkModal.id, "description", editWorkModal.description);
              setEditWorkModal(null);
              showToast("Work experience updated successfully!", "success");
            }}>Save Changes</button>
          </div>
        </EditModal>
      )}

      {/* â”€â”€ EDIT EDUCATION MODAL â”€â”€ */}
      {editEduModal && (
        <EditModal title="Edit Education" onClose={() => setEditEduModal(null)}>
          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Qualification</label>
              <input className="form-control" value={editEduModal.title} onChange={(e) => setEditEduModal(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Institution</label>
              <input className="form-control" value={editEduModal.institution} onChange={(e) => setEditEduModal(p => ({ ...p, institution: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Meta details (Year, Certificate No., etc.)</label>
            <input className="form-control" value={editEduModal.meta} onChange={(e) => setEditEduModal(p => ({ ...p, meta: e.target.value }))} />
          </div>
          <label className="candidate-profile-v2-checkbox-item" style={{ marginBottom: "20px" }}>
            <input type="checkbox" checked={editEduModal.verified} onChange={(e) => setEditEduModal(p => ({ ...p, verified: e.target.checked }))} />
            <span>AI Verified</span>
          </label>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-border btn-sm" onClick={() => setEditEduModal(null)}>Cancel</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => {
              updateEducationEntry(editEduModal.id, "title", editEduModal.title);
              updateEducationEntry(editEduModal.id, "institution", editEduModal.institution);
              updateEducationEntry(editEduModal.id, "meta", editEduModal.meta);
              updateEducationEntry(editEduModal.id, "verified", editEduModal.verified);
              setEditEduModal(null);
              showToast("Education entry updated successfully!", "success");
            }}>Save Changes</button>
          </div>
        </EditModal>
      )}

      {/* â”€â”€ EDIT SKILL MODAL â”€â”€ */}
      {editSkillModal && (
        <EditModal title={`Edit Skill: ${editSkillModal.name}`} onClose={() => setEditSkillModal(null)}>
          <div className="candidate-profile-v2-form-grid two-col">
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Proficiency</label>
              <select className="form-control" value={editSkillModal.proficiency} onChange={(e) => setEditSkillModal(p => ({ ...p, proficiency: e.target.value }))}>
                <option>Beginner</option><option>Intermediate</option><option>Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label className="font-sm color-text-mutted mb-10">Years of experience</label>
              <input className="form-control" type="number" min="0" max="50" value={editSkillModal.years} onChange={(e) => setEditSkillModal(p => ({ ...p, years: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" className="btn btn-border btn-sm" onClick={() => setEditSkillModal(null)}>Cancel</button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => {
              updateSkillEntry(editSkillModal.id, "proficiency", editSkillModal.proficiency);
              updateSkillEntry(editSkillModal.id, "years", editSkillModal.years);
              setEditSkillModal(null);
              showToast(`Skill "${editSkillModal.name}" updated successfully!`, "success");
            }}>Save Changes</button>
          </div>
        </EditModal>
      )}
    </div>
  );
};

export default ProfileTabs;

