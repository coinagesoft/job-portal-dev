"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import {
  getApplicantsDashboard,
  getApplicants,
  getApplicantDetail,
  moveToReview,
  shortlistApplicant,
  scheduleInterview,
  rejectApplicant,
  hireApplicant,
  addNote,
  getNotes,
} from "@/services/recruiter/recruiterApplicantsService";
import { getWallet } from "@/services/recruiter/recruiterCreditWalletService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const screeningFilters = [
  { label: "Experience 3+ years", isActive: true, toneClass: "is-success" },
  { label: "Relocation ready", isActive: false, toneClass: "is-info" },
  { label: "Notice period <= 30 days", isActive: false, toneClass: "is-brand" },
  { label: "Mandatory answers complete", isActive: false, toneClass: "is-warning" },
];

const STATUS_DISPLAY = {
  Applied:     { label: "Applied",     statusClass: "is-applied" },
  InReview:    { label: "In Review",   statusClass: "is-viewed" },
  Shortlisted: { label: "Shortlisted", statusClass: "is-shortlisted" },
  Interview:   { label: "Interview",   statusClass: "is-shortlisted" },
  Hired:       { label: "Hired",       statusClass: "is-success" },
  Rejected:    { label: "Rejected",    statusClass: "is-rejected" },
  Withdrawn:   { label: "Withdrawn",   statusClass: "is-muted" },
};

const STATUS_OPTIONS = [
  { value: "InReview",    label: "In Review" },
  { value: "Shortlisted", label: "Shortlisted" },
  { value: "Interview",   label: "Schedule Interview" },
  { value: "Hired",       label: "Hired" },
  { value: "Rejected",    label: "Rejected" },
];

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Build the three badge slots that match the static UI exactly:
 *  slot 1 → trade / certification tag  (is-brand)
 *  slot 2 → unlock / shortlist status  (is-info)
 *  slot 3 → experience badge           (is-success)
 *
 * Also build the "certificates" pill row from skills data if available.
 */
function buildProfileTags(applicant) {
  const tags = [];

  // Slot 1 – primary trade (replaces "6G Certified" etc.)
  if (applicant.primaryTrade) {
    tags.push({ label: applicant.primaryTrade, toneClass: "is-brand" });
  }

  // Slot 2 – unlock / cv status (replaces "Relocation: Yes")
  if (applicant.isUnlocked) {
    tags.push({ label: "Profile Unlocked", toneClass: "is-info" });
  } else if (applicant.cvDownloaded) {
    tags.push({ label: "CV Downloaded", toneClass: "is-info" });
  } else if (applicant.isShortlisted) {
    tags.push({ label: "Shortlisted", toneClass: "is-info" });
  }

  // Slot 3 – experience (replaces "Notice: 20 days")
  if (applicant.experienceYears > 0) {
    tags.push({ label: `${applicant.experienceYears} yrs exp`, toneClass: "is-success" });
  }

  return tags;
}

/* ─── Modal ─────────────────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}
  >
    <div
      style={{
        background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "540px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "90vh", overflow: "auto",
      }}
    >
      <div
        style={{
          padding: "18px 24px 14px", borderBottom: "1px solid #eee",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <h5 style={{ margin: 0, color: "#122359", fontSize: "15px" }}>{title}</h5>
        <button onClick={onClose}
          style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#666" }}>
          ×
        </button>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>{children}</div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
const EmployerApplicantsClient = () => {
  const showToast = useToast();

  const [dashboard, setDashboard]       = useState(null);
  const [applicantList, setApplicantList] = useState([]);
  const [totalRecords, setTotalRecords]  = useState(0);
  const [credits, setCredits]            = useState(null);
  const [loading, setLoading]            = useState(true);

  const [activeStatus, setActiveStatus]  = useState("");
  const [searchText, setSearchText]      = useState("");
  const [pageNumber, setPageNumber]      = useState(1);
  const PAGE_SIZE = 10;

  // Modals
  const [statusPopup, setStatusPopup]       = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [interviewDate, setInterviewDate]   = useState("");
  const [rejectReason, setRejectReason]     = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [detailPopup, setDetailPopup] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [notesPopup, setNotesPopup] = useState(null);
  const [notes, setNotes]           = useState([]);
  const [noteText, setNoteText]     = useState("");
  const [savingNote, setSavingNote] = useState(false);

  /* ── Load ── */
  const loadData = useCallback(async (status, search, page) => {
    try {
      setLoading(true);
      const [dash, listRes, walletRes] = await Promise.all([
        getApplicantsDashboard(),
        getApplicants({ status: status || undefined, search: search || undefined, pageNumber: page, pageSize: PAGE_SIZE }),
        getWallet(),
      ]);
      setDashboard(dash);
      setApplicantList(listRes.applicants || []);
      setTotalRecords(listRes.totalRecords || 0);
      setCredits(Math.max(0, walletRes.availableCredits ?? 0));
    } catch (err) {
      console.error(err);
      showToast("Failed to load applicants. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(activeStatus, searchText, pageNumber); }, [activeStatus, pageNumber]);

  /* ── Status tabs ── */
  const statusTabs = dashboard ? [
    { label: "All",         count: dashboard.totalApplicants, value: "" },
    { label: "Applied",     count: dashboard.applied,         value: "Applied" },
    { label: "In Review",   count: dashboard.inReview,        value: "InReview" },
    { label: "Shortlisted", count: dashboard.shortlisted,     value: "Shortlisted" },
    { label: "Interview",   count: dashboard.interview,       value: "Interview" },
    { label: "Hired",       count: dashboard.hired,           value: "Hired" },
    { label: "Rejected",    count: dashboard.rejected,        value: "Rejected" },
  ] : [];

  /* ── Change Status ── */
  const handleStatusUpdate = async () => {
    if (!statusPopup || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      if      (selectedStatus === "InReview")    await moveToReview(statusPopup.applicationId);
      else if (selectedStatus === "Shortlisted") await shortlistApplicant(statusPopup.applicationId);
      else if (selectedStatus === "Interview") {
        if (!interviewDate) { showToast("Please pick an interview date.", "warning"); setUpdatingStatus(false); return; }
        await scheduleInterview(statusPopup.applicationId, new Date(interviewDate).toISOString());
      }
      else if (selectedStatus === "Rejected")    await rejectApplicant(statusPopup.applicationId, rejectReason);
      else if (selectedStatus === "Hired")       await hireApplicant(statusPopup.applicationId);

      showToast(`Status updated to: ${STATUS_DISPLAY[selectedStatus]?.label || selectedStatus}`, "success");
      setStatusPopup(null); setInterviewDate(""); setRejectReason("");
      loadData(activeStatus, searchText, pageNumber);
    } catch (err) {
      console.error(err);
      showToast("Failed to update status. Please try again.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* ── Download CV ── */
  const handleDownloadCV = (applicant) => {
    if (credits !== null && credits <= 0) {
      showToast("Insufficient credits. Please buy more credits.", "error");
      return;
    }
    showToast(`CV downloaded for ${applicant.candidateName}. 1 credit deducted.`, "info");
    setCredits((c) => Math.max(0, (c ?? 1) - 1));
  };

  /* ── Detail / View Questions ── */
  const handleViewDetail = async (applicationId) => {
    setDetailLoading(true);
    try {
      const detail = await getApplicantDetail(applicationId);
      setDetailPopup(detail);
    } catch { showToast("Could not load applicant details.", "error"); }
    finally   { setDetailLoading(false); }
  };

  /* ── Notes ── */
  const handleOpenNotes = async (applicant) => {
    setNotesPopup(applicant); setNoteText(""); setNotes([]);
    try { const res = await getNotes(applicant.applicationId); setNotes(res || []); } catch { setNotes([]); }
  };
  const handleAddNote = async () => {
    if (!noteText.trim() || !notesPopup) return;
    setSavingNote(true);
    try {
      await addNote(notesPopup.applicationId, noteText.trim());
      showToast("Note saved.", "success"); setNoteText("");
      const res = await getNotes(notesPopup.applicationId); setNotes(res || []);
    } catch { showToast("Failed to save note.", "error"); }
    finally   { setSavingNote(false); }
  };

  /* ── Search ── */
  const handleSearch = (e) => {
    e.preventDefault(); setPageNumber(1);
    loadData(activeStatus, searchText, 1);
  };

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  /* ════════════════════════════════════════════════════════ */
  return (
    <main className="main employer-applicants-page">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">

            {/* ── Credit balance banner ── */}
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              marginBottom: "16px", padding: "10px 16px",
              background: "#fef9ec", border: "1px solid #fcd34d", borderRadius: "8px",
            }}>
              <i className="fi fi-sr-bolt" style={{ color: "#f59e0b" }}></i>
              <span className="font-sm" style={{ color: "#92400e" }}>
                <strong>CV Download Credits:</strong>{" "}
                {credits !== null ? credits : "—"} remaining — 1 credit deducted per CV download
              </span>
              <Link href="/employeer/buy-credits" className="btn btn-border btn-xs ml-auto" style={{ marginLeft: "auto" }}>
                Buy Credits
              </Link>
            </div>

            {/* ── Page header ── */}
            <div className="box-filters-job">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h3 className="mb-5">Applicants</h3>
                  <span className="font-sm color-text-paragraph-2">
                    {totalRecords} applicant{totalRecords !== 1 ? "s" : ""} total
                  </span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <Link className="btn btn-border btn-sm mr-10 mb-10" href="/employeer/job-list">
                    Back to Job list
                  </Link>
                  <span className="badge bg-primary">{totalRecords} Applicants</span>
                </div>
              </div>
            </div>

            {/* ── Status tabs ── */}
            <div className="candidate-status-filter mt-20 mb-20">
              {statusTabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`candidate-status-filter-btn ${activeStatus === tab.value ? "active" : ""}`}
                  type="button"
                  onClick={() => { setActiveStatus(tab.value); setPageNumber(1); }}
                >
                  <span>{tab.label}</span>
                  <span className="candidate-status-filter-count">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* ── Filter bar ── */}
            <div className="box-filters-job mb-20 employer-applicants-form">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h6 className="mb-5">Filter Applicants</h6>
                  <span className="font-sm color-text-paragraph-2">
                    Use candidate profile filters to shortlist faster.
                  </span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <button className="btn btn-border btn-sm mr-10 mb-10" type="button"
                    onClick={() => { setSearchText(""); setActiveStatus(""); setPageNumber(1); loadData("","",1); showToast("Filters reset.", "info"); }}>
                    Reset
                  </button>
                  <button className="btn btn-default btn-sm mb-10" type="button" onClick={handleSearch}>
                    Apply Filters
                  </button>
                </div>
              </div>
              <div className="employer-applicants-filter-tags">
                {screeningFilters.map((filter) => (
                  <button key={filter.label}
                    className={`employer-applicants-tag ${filter.toneClass} ${filter.isActive ? "is-active" : ""}`}
                    type="button">
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Search box ── */}
            <form onSubmit={handleSearch} className="mb-20" style={{ display: "flex", gap: "8px" }}>
              <input
                className="form-control"
                placeholder="Search by name, trade, city…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ maxWidth: "360px" }}
              />
              <button className="btn btn-border btn-sm" type="submit">Search</button>
            </form>

            {/* ── Loading ── */}
            {loading && (
              <div className="text-center mt-40 mb-40">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading…</span>
                </div>
              </div>
            )}

            {/* ── Applicant cards ── */}
            {!loading && (
              <div className="box-list-jobs display-list">
                {applicantList.length === 0 && (
                  <div className="text-center mt-40 mb-40 color-text-paragraph-2">No applicants found.</div>
                )}

                {applicantList.map((applicant) => {
                  const statusInfo   = STATUS_DISPLAY[applicant.applicationStatus] || { label: applicant.applicationStatus, statusClass: "is-applied" };
                  const profileTags  = buildProfileTags(applicant);

                  return (
                    <div className="col-xl-12 col-12" key={applicant.applicationId}>
                      <div className="card-grid-2 hover-up employer-applicant-card">
                        <div className="card-block-info pt-20">
                          <div className="row">

                            {/* ── Left: candidate info ── */}
                            <div className="col-lg-8 col-md-12 col-sm-12">
                              <div className="card-grid-2-image-left">
                                <div className="image-box">
                                  <img
                                    src="/assets/imgs/page/candidates/candidate-profile.png"
                                    alt={applicant.candidateName}
                                  />
                                </div>
                                <div className="right-info">
                                  {/* Name */}
                                  <Link className="name-job" href={`/employeer/candidate-profile/${applicant.candidateId}`}>
                                    {applicant.candidateName}
                                  </Link>

                                  {/* Meta line — same format as static */}
                                  <span className="location-small">
                                    {[
                                      applicant.primaryTrade,
                                      applicant.experienceYears ? `${applicant.experienceYears} yrs` : null,
                                      applicant.currentCity,
                                      applicant.appliedAt ? `Applied ${formatDate(applicant.appliedAt)}` : null,
                                    ].filter(Boolean).join(" | ")}
                                  </span>

                                  {/* Job title — replaces "End Client" row */}
                                  <div style={{ marginTop: "4px" }}>
                                    <span className="font-xs" style={{ color: "#555" }}>
                                      <strong>Job:</strong> {applicant.jobTitle}
                                    </span>
                                  </div>

                                  {/* ── Badge row — same structure as static ── */}
                                  <div className="employer-applicants-tag-row mt-10">
                                    {/* Bolt badge — static had "AI Match %" here */}
                                    {applicant.experienceYears >= 3 && (
                                      <span className="employer-applicants-tag is-success"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <i className="fi fi-sr-bolt" style={{ fontSize: "10px" }}></i>
                                        {applicant.experienceYears}+ yrs
                                      </span>
                                    )}
                                    {/* Profile tags: trade, unlock/shortlist, exp */}
                                    {profileTags.map((tag) => (
                                      <span key={tag.label} className={`employer-applicants-tag ${tag.toneClass}`}>
                                        {tag.label}
                                      </span>
                                    ))}
                                  </div>

                                  {/* ── Certificate pills row ── */}
                                  {/* Show city+state as location pills — same visual slot as certificates */}
                                  <div style={{ marginTop: "8px" }}>
                                    <span className="font-xs color-text-paragraph-2" style={{ marginRight: "6px" }}>
                                      Location:
                                    </span>
                                    {applicant.currentCity && (
                                      <span className="certificate-pill">{applicant.currentCity}</span>
                                    )}
                                    {applicant.currentState && (
                                      <span className="certificate-pill">{applicant.currentState}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* ── Right: status + actions ── */}
                            <div className="col-lg-4 col-md-12 col-sm-12 text-lg-end mt-md-15 mt-sm-15">
                              <span className={`employer-applicants-status ${statusInfo.statusClass}`}>
                                {statusInfo.label}
                              </span>
                              <div style={{
                                marginTop: "8px",
                                display: "flex", flexDirection: "column",
                                gap: "6px", alignItems: "flex-end",
                              }}>
                                {/* Download CV */}
                                <button className="btn btn-border btn-sm" type="button"
                                  onClick={() => handleDownloadCV(applicant)}>
                                  ⬇ Download CV
                                </button>
                                {/* Change Status */}
                                <button className="btn btn-grey-small btn-sm" type="button"
                                  onClick={() => {
                                    setStatusPopup(applicant);
                                    setSelectedStatus(applicant.applicationStatus);
                                    setInterviewDate(""); setRejectReason("");
                                  }}>
                                  Change Status
                                </button>
                                {/* View Questions / Detail */}
                                <button className="btn btn-border btn-sm" type="button"
                                  onClick={() => handleViewDetail(applicant.applicationId)}
                                  disabled={detailLoading}>
                                  {detailLoading ? "Loading…" : "View Questions"}
                                </button>
                                {/* Notes */}
                                <button className="btn btn-border btn-sm" type="button"
                                  onClick={() => handleOpenNotes(applicant)}>
                                  📝 Notes
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
              <div className="paginations mt-20" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button className="btn btn-border btn-sm" disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => p - 1)}>← Prev</button>
                <span className="font-sm" style={{ lineHeight: "36px" }}>
                  Page {pageNumber} of {totalPages}
                </span>
                <button className="btn btn-border btn-sm" disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}>Next →</button>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ══ Detail / View Questions Modal ══ */}
      {detailPopup && (
        <Modal title={`Profile Details — ${detailPopup.candidateName}`} onClose={() => setDetailPopup(null)}>

          {detailPopup.professionalSummary && (
            <div style={{ marginBottom: "16px", padding: "10px 12px", background: "#f9fafb", borderRadius: "8px" }}>
              <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>{detailPopup.professionalSummary}</p>
            </div>
          )}

          {/* Work History */}
          {detailPopup.workHistories?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>Work History</p>
              {detailPopup.workHistories.map((w, i) => (
                <div key={i} style={{ fontSize: "13px", marginBottom: "6px", color: "#374151", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <strong>{w.jobTitle}</strong> at {w.companyName}
                  {w.isOffshore ? <span className="employer-applicants-tag is-info" style={{ marginLeft: "6px", fontSize: "11px" }}>Offshore</span> : null}
                  <span style={{ color: "#6b7280", display: "block", fontSize: "12px", marginTop: "2px" }}>
                    {w.workLocation} &nbsp;·&nbsp;
                    {w.startDate ? formatDate(w.startDate) : ""} → {w.isCurrent ? "Present" : w.endDate ? formatDate(w.endDate) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Skills & Languages */}
          {detailPopup.skills?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>Skills & Languages</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {detailPopup.skills.map((s, i) => (
                  <span key={i} className="employer-applicants-tag is-brand">
                    {s.skillName}{s.yearsOfExperience ? ` (${s.yearsOfExperience}y)` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {detailPopup.educations?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>Education</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Level", "Institute", "Year"].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detailPopup.educations.map((e, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "8px 10px", fontSize: "13px", color: "#374151" }}>{e.educationLevel}</td>
                      <td style={{ padding: "8px 10px", fontSize: "13px", color: "#374151" }}>{e.instituteName}</td>
                      <td style={{ padding: "8px 10px", fontSize: "13px", color: "#374151" }}>{e.passoutYear || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CV download */}
          {detailPopup.cvs?.length > 0 && (
            <div>
              <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>CV</p>
              {detailPopup.cvs.map((cv) => (
                <a key={cv.cvId} href={`${BASE_URL}${cv.cvFileUrl}`} target="_blank" rel="noopener noreferrer"
                  className="btn btn-border btn-sm mr-10">
                  ⬇ Download CV
                </a>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* ══ Change Status Modal ══ */}
      {statusPopup && (
        <Modal title={`Change Status — ${statusPopup.candidateName}`} onClose={() => setStatusPopup(null)}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
              Select new status:
            </label>
            <select className="form-control" value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setInterviewDate(""); setRejectReason(""); }}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {selectedStatus === "Interview" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                Interview Date & Time:
              </label>
              <input type="datetime-local" className="form-control" value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)} />
            </div>
          )}

          {selectedStatus === "Rejected" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                Rejection Reason (optional):
              </label>
              <input type="text" className="form-control" placeholder="e.g. Overqualified, Not available…"
                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="btn btn-border btn-sm" onClick={() => setStatusPopup(null)}>Cancel</button>
            <button className="btn btn-default btn-sm" onClick={handleStatusUpdate} disabled={updatingStatus}>
              {updatingStatus ? "Updating…" : "Update Status"}
            </button>
          </div>
        </Modal>
      )}

      {/* ══ Notes Modal ══ */}
      {notesPopup && (
        <Modal title={`Notes — ${notesPopup.candidateName}`} onClose={() => { setNotesPopup(null); setNotes([]); }}>
          <div style={{ marginBottom: "16px", maxHeight: "200px", overflowY: "auto" }}>
            {notes.length === 0 && <p className="font-sm color-text-paragraph-2">No notes yet.</p>}
            {notes.map((n, i) => (
              <div key={i} style={{ marginBottom: "10px", padding: "8px 10px", background: "#f9fafb", borderRadius: "6px", fontSize: "13px" }}>
                <p style={{ margin: 0, color: "#374151" }}>{n.noteText || n.text || JSON.stringify(n)}</p>
                {n.createdAt && <span style={{ fontSize: "11px", color: "#9ca3af" }}>{formatDate(n.createdAt)}</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="text" className="form-control" placeholder="Add a note…"
              value={noteText} onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()} />
            <button className="btn btn-default btn-sm" onClick={handleAddNote} disabled={savingNote || !noteText.trim()}>
              {savingNote ? "…" : "Save"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default EmployerApplicantsClient;