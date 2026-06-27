"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { getJobStats } from "@/services/recruiter/recruiterJobListService";
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
 */
function buildProfileTags(applicant) {
  const tags = [];

  if (applicant.primaryTrade) {
    tags.push({ label: applicant.primaryTrade, toneClass: "is-brand" });
  }

  if (applicant.isUnlocked) {
    tags.push({ label: "Profile Unlocked", toneClass: "is-info" });
  } else if (applicant.cvDownloaded) {
    tags.push({ label: "CV Downloaded", toneClass: "is-info" });
  } else if (applicant.isShortlisted) {
    tags.push({ label: "Shortlisted", toneClass: "is-info" });
  }

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
      background: "rgba(18,35,89,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}
  >
    <div
      style={{
        background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "540px",
        boxShadow: "0 24px 60px rgba(18,35,89,0.28)", maxHeight: "90vh", overflow: "auto",
      }}
    >
      <div
        style={{
          padding: "18px 24px 14px", borderBottom: "1px solid #f0f1f5",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <h5 style={{ margin: 0, color: "#122359", fontSize: "15px", fontWeight: 800 }}>{title}</h5>
        <button onClick={onClose}
          style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#66789c", lineHeight: 1 }}>
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

  // Job filter coming from the Job List page (?jobId=...&jobTitle=...)
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") || "";
  const jobTitleFromUrl = searchParams.get("jobTitle") || "";

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
        getApplicants({ jobId: jobId || undefined, status: status || undefined, search: search || undefined, pageNumber: page, pageSize: PAGE_SIZE }),
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
  }, [jobId]);

  useEffect(() => { loadData(activeStatus, searchText, pageNumber); }, [activeStatus, pageNumber, jobId]);

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
            <div className="ea-credit-banner">
              <span className="ea-credit-icon"><i className="fi fi-rr-credit-card" /></span>
              <span className="ea-credit-text">
                <strong>{credits !== null ? credits : "—"}</strong> CV download credit
                {credits === 1 ? "" : "s"} remaining
                <span className="ea-credit-sub"> · 1 credit per CV download</span>
              </span>
              <Link href="/employeer/buy-credits" className="ea-btn ea-btn-ghost ea-btn-xs">
                <i className="fi fi-rr-plus" /> Buy credits
              </Link>
            </div>

            {/* ── Page header ── */}
            <div className="ea-header">
              <div>
                <h3>Applicants</h3>
                <span className="ea-sub">
                  {totalRecords} applicant{totalRecords !== 1 ? "s" : ""}
                  {jobId ? " for this job" : " across all jobs"}
                </span>
              </div>
              <Link className="ea-btn ea-btn-ghost" href="/employeer/job-list">
                <i className="fi fi-rr-arrow-left" /> Back to job list
              </Link>
            </div>

            {/* ── Job filter banner (when arriving from Job List) ── */}
            {jobId && (
              <div className="ea-jobfilter">
                <span className="ea-jobfilter-icon"><i className="fi fi-rr-filter" /></span>
                <span className="ea-jobfilter-text">
                  Showing applicants for <strong>{jobTitleFromUrl || "selected job"}</strong>
                </span>
                <Link href="/employeer/applicants" className="ea-btn ea-btn-ghost ea-btn-xs">
                  <i className="fi fi-rr-cross-small" /> View all applicants
                </Link>
              </div>
            )}

            {/* ── Status tabs ── */}
            <div className="ea-card ea-tabs" role="tablist" aria-label="Filter by status">
              {statusTabs.map((tab) => (
                <button
                  key={tab.label}
                  role="tab"
                  aria-selected={activeStatus === tab.value}
                  className={`ea-tab ${activeStatus === tab.value ? "is-active" : ""}`}
                  type="button"
                  onClick={() => { setActiveStatus(tab.value); setPageNumber(1); }}
                >
                  <span>{tab.label}</span>
                  <span className="ea-count">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* ── Search + quick filters toolbar ── */}
            <div className="ea-card ea-toolbar">
              <form onSubmit={handleSearch} className="ea-toolbar-row">
                <div className="ea-search">
                  <i className="fi fi-rr-search" />
                  <input
                    placeholder="Search by name, trade, or city…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    aria-label="Search applicants"
                  />
                </div>
                <button className="ea-btn ea-btn-primary" type="submit">
                  <i className="fi fi-rr-search" /> Search
                </button>
                <button
                  className="ea-btn ea-btn-ghost"
                  type="button"
                  onClick={() => { setSearchText(""); setActiveStatus(""); setPageNumber(1); loadData("", "", 1); showToast("Filters reset.", "info"); }}
                >
                  <i className="fi fi-rr-refresh" /> Reset
                </button>
              </form>

              <div className="ea-chips">
                <span className="ea-chips-label">Quick filters</span>
                {screeningFilters.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    className={`ea-chip ${filter.isActive ? "is-active" : ""}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div className="text-center mt-40 mb-40">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading…</span>
                </div>
              </div>
            )}

            {/* ── Empty state ── */}
            {!loading && applicantList.length === 0 && (
              <div className="ea-card ea-empty">
                <span className="ea-empty-icon"><i className="fi fi-rr-inbox" /></span>
                <h6>No applicants found</h6>
                <p>{jobId ? "No one has applied to this job yet, or none match your filters." : "Try clearing your filters or search."}</p>
              </div>
            )}

            {/* ── Applicant cards ── */}
            {!loading && applicantList.length > 0 && (
              <div className="box-list-jobs display-list">
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
                                  <Link className="name-job" href={`/employeer/candidate-profile/${applicant.candidateId}`}>
                                    {applicant.candidateName}
                                  </Link>

                                  <span className="location-small">
                                    {[
                                      applicant.primaryTrade,
                                      applicant.experienceYears ? `${applicant.experienceYears} yrs` : null,
                                      applicant.currentCity,
                                      applicant.appliedAt ? `Applied ${formatDate(applicant.appliedAt)}` : null,
                                    ].filter(Boolean).join(" · ")}
                                  </span>

                                  <div className="ea-jobline">
                                    <i className="fi fi-rr-briefcase" />
                                    <span>{applicant.jobTitle}</span>
                                  </div>

                                  {/* ── Badge row ── */}
                                  <div className="employer-applicants-tag-row mt-10">
                                    {applicant.experienceYears >= 3 && (
                                      <span className="employer-applicants-tag is-success"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <i className="fi fi-rr-star" style={{ fontSize: "10px" }}></i>
                                        {applicant.experienceYears}+ yrs
                                      </span>
                                    )}
                                    {profileTags.map((tag) => (
                                      <span key={tag.label} className={`employer-applicants-tag ${tag.toneClass}`}>
                                        {tag.label}
                                      </span>
                                    ))}
                                  </div>

                                  {/* ── Location pills ── */}
                                  {(applicant.currentCity || applicant.currentState) && (
                                    <div className="ea-location-row">
                                      <span className="ea-location-label">Location</span>
                                      {applicant.currentCity && (
                                        <span className="certificate-pill">{applicant.currentCity}</span>
                                      )}
                                      {applicant.currentState && (
                                        <span className="certificate-pill">{applicant.currentState}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* ── Right: status + actions ── */}
                            <div className="col-lg-4 col-md-12 col-sm-12 ea-right-col">
                              <span className={`employer-applicants-status ${statusInfo.statusClass}`}>
                                {statusInfo.label}
                              </span>

                              <div className="ea-actions">
                                <button className="btn btn-default btn-sm" type="button"
                                  onClick={() => {
                                    setStatusPopup(applicant);
                                    setSelectedStatus(applicant.applicationStatus);
                                    setInterviewDate(""); setRejectReason("");
                                  }}>
                                  <i className="fi fi-rr-refresh" /> Change status
                                </button>

                                <button className="btn btn-border btn-sm" type="button"
                                  onClick={() => handleDownloadCV(applicant)}>
                                  <i className="fi fi-rr-download" /> Download CV
                                </button>

                                <button className="btn btn-border btn-sm" type="button"
                                  onClick={() => handleViewDetail(applicant.applicationId)}
                                  disabled={detailLoading}>
                                  <i className="fi fi-rr-eye" /> {detailLoading ? "Loading…" : "View details"}
                                </button>

                                <button className="btn btn-border btn-sm" type="button"
                                  onClick={() => handleOpenNotes(applicant)}>
                                  <i className="fi fi-rr-comment-alt" /> Notes
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
              <div className="ea-pagination">
                <button className="ea-btn ea-btn-ghost ea-btn-sm" disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => p - 1)}>
                  <i className="fi fi-rr-angle-left" /> Prev
                </button>
                <span className="ea-page-info">Page {pageNumber} of {totalPages}</span>
                <button className="ea-btn ea-btn-ghost ea-btn-sm" disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}>
                  Next <i className="fi fi-rr-angle-right" />
                </button>
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

          {detailPopup.cvs?.length > 0 && (
            <div>
              <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>CV</p>
              {detailPopup.cvs.map((cv) => (
                <a key={cv.cvId} href={`${BASE_URL}${cv.cvFileUrl}`} target="_blank" rel="noopener noreferrer"
                  className="btn btn-border btn-sm mr-10">
                  <i className="fi fi-rr-download" style={{ marginRight: 5 }} /> Download CV
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

      {/* ══ Scoped styles — match Jobbox theme (navy #122359 / gold #ffa300) ══ */}
      <style jsx>{`
        /* Credit banner */
        .ea-credit-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          margin-bottom: 20px;
          background: #fffaf0;
          border: 1px solid #ffe2a8;
          border-radius: 14px;
        }
        .ea-credit-icon {
          width: 34px; height: 34px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 10px; background: #fff1d6; color: #ff9900; font-size: 15px;
        }
        .ea-credit-text { font-size: 13px; color: #6b4e12; }
        .ea-credit-text strong { color: #122359; font-size: 14px; }
        .ea-credit-sub { color: #9a8350; }

        /* Header */
        .ea-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; margin-bottom: 18px;
        }
        .ea-header :global(h3) { color: #122359; font-weight: 800; margin: 0 0 4px; }
        .ea-sub { color: #66789c; font-size: 14px; }

        /* Job filter banner */
        .ea-jobfilter {
          display: flex; align-items: center; flex-wrap: wrap; gap: 12px;
          padding: 12px 18px; margin-bottom: 18px;
          background: #eef4ff; border: 1px solid #cdddff; border-radius: 14px;
        }
        .ea-jobfilter-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 9px; background: #dde9ff; color: #2a55e5; font-size: 14px;
        }
        .ea-jobfilter-text { font-weight: 600; color: #122359; font-size: 14px; }
        .ea-jobfilter-text strong { color: #2a55e5; }
        .ea-jobfilter :global(.ea-btn) { margin-left: auto; }

        /* Shared card shell — matches verification/company cards */
        .ea-card {
          background: #ffffff;
          border: 1px solid rgba(18, 35, 89, 0.07);
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(18, 35, 89, 0.04);
        }

        /* Status tabs */
        .ea-tabs {
          display: flex; gap: 8px; padding: 10px;
          margin-bottom: 18px; overflow-x: auto;
        }
        .ea-tabs::-webkit-scrollbar { height: 6px; }
        .ea-tabs::-webkit-scrollbar-thumb { background: #e6e9f2; border-radius: 999px; }
        .ea-tab {
          flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(18, 35, 89, 0.10); background: #fff; color: #122359;
          border-radius: 999px; padding: 9px 16px; font-weight: 700; font-size: 13px;
          cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
        }
        .ea-tab:hover {
          transform: translateY(-2px); border-color: #ff9900;
          box-shadow: 0 8px 18px rgba(255, 163, 0, 0.12);
        }
        .ea-tab:focus-visible { outline: 2px solid #ffa300; outline-offset: 2px; }
        .ea-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 22px; height: 20px; padding: 0 6px; border-radius: 999px;
          background: #f1f4fb; color: #66789c; font-size: 11px; font-weight: 800;
          transition: all 0.25s ease;
        }
        .ea-tab.is-active {
          background: #122359; border-color: #122359; color: #fff;
          box-shadow: 0 8px 20px rgba(18, 35, 89, 0.18);
        }
        .ea-tab.is-active .ea-count { background: #ffa300; color: #122359; }

        /* Toolbar */
        .ea-toolbar { padding: 18px 20px; margin-bottom: 22px; }
        .ea-toolbar-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .ea-search { position: relative; flex: 1 1 320px; }
        .ea-search :global(i) {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #9aa7c2; font-size: 14px; pointer-events: none;
        }
        .ea-search input {
          width: 100%; height: 44px; border: 1px solid rgba(18, 35, 89, 0.14);
          border-radius: 12px; padding: 0 14px 0 38px; font-size: 14px;
          color: #122359; background: #fff; transition: all 0.2s ease;
        }
        .ea-search input::placeholder { color: #9aa7c2; }
        .ea-search input:focus {
          outline: none; border-color: #ffa300;
          box-shadow: 0 0 0 3px rgba(255, 163, 0, 0.15);
        }

        /* Quick-filter chips */
        .ea-chips {
          display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
          margin-top: 16px; padding-top: 16px;
          border-top: 1px dashed rgba(18, 35, 89, 0.10);
        }
        .ea-chips-label {
          font-size: 12px; font-weight: 700; color: #66789c;
          text-transform: uppercase; letter-spacing: 0.4px; margin-right: 4px;
        }
        .ea-chip {
          border: 1px solid rgba(18, 35, 89, 0.12); background: #fff; color: #4f5e64;
          border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease;
        }
        .ea-chip:hover { border-color: #ffc151; color: #122359; transform: translateY(-1px); }
        .ea-chip.is-active { background: #fff7ea; border-color: #ffc151; color: #ff9900; }

        /* Buttons (toolbar / header / pagination) */
        .ea-btn {
          height: 44px; border-radius: 12px; padding: 0 18px;
          font-weight: 700; font-size: 14px; display: inline-flex;
          align-items: center; gap: 7px; cursor: pointer;
          transition: all 0.25s ease; border: 1px solid transparent;
          text-decoration: none; white-space: nowrap;
        }
        .ea-btn:focus-visible { outline: 2px solid #ffa300; outline-offset: 2px; }
        .ea-btn-xs { height: 34px; padding: 0 12px; font-size: 12px; border-radius: 10px; }
        .ea-btn-sm { height: 40px; padding: 0 16px; font-size: 13px; }
        .ea-btn-primary { background: #ffa300; color: #122359; border-color: #ffa300; }
        .ea-btn-primary:hover {
          background: #ff9900; transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(255, 163, 0, 0.28);
        }
        .ea-btn-ghost { background: #fff; color: #122359; border-color: rgba(18, 35, 89, 0.14); }
        .ea-btn-ghost:hover { border-color: #ffa300; color: #ff9900; transform: translateY(-2px); }
        .ea-btn[disabled] { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Card: job line + location + action column */
        .ea-jobline {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 6px; font-size: 12px; color: #4f5e64; font-weight: 600;
        }
        .ea-jobline :global(i) { color: #ff9900; font-size: 12px; }
        .ea-location-row { margin-top: 10px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
        .ea-location-label {
          font-size: 11px; font-weight: 700; color: #9aa7c2;
          text-transform: uppercase; letter-spacing: 0.4px; margin-right: 6px;
        }
        .ea-right-col {
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 12px; margin-top: 4px;
        }
        .ea-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 220px; }
        .ea-actions :global(.btn) {
          width: 100%; justify-content: center; border-radius: 12px !important;
          font-weight: 700; display: inline-flex; align-items: center; gap: 6px;
        }
        @media (max-width: 991px) {
          .ea-right-col { align-items: stretch; margin-top: 16px; }
          .ea-actions { max-width: none; }
        }

        /* Empty state */
        .ea-empty { padding: 48px 24px; text-align: center; }
        .ea-empty-icon {
          width: 64px; height: 64px; margin: 0 auto 14px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 18px; background: #f1f4fb; color: #9aa7c2; font-size: 26px;
        }
        .ea-empty :global(h6) { color: #122359; font-weight: 800; margin: 0 0 6px; }
        .ea-empty :global(p) { color: #66789c; font-size: 14px; margin: 0; }

        /* Pagination */
        .ea-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 14px; margin-top: 24px;
        }
        .ea-page-info { font-size: 13px; font-weight: 700; color: #66789c; }
      `}</style>
    </main>
  );
};

export default EmployerApplicantsClient;