"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/Toast";
import styles from "./applicants.module.css";
import {
  getApplicantsDashboard,
  getApplicants,
  getApplicantDetail,
  moveToReview,
  shortlistApplicant,
  rejectApplicant,
  hireApplicant,
  getScreeningAnswers,
  addNote,
  getNotes,
} from "@/services/recruiter/recruiterApplicantsService";
import { getWallet } from "@/services/recruiter/recruiterCreditWalletService";
import candidateProfileService from "@/services/recruiter/Candidateprofileservice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const screeningFilters = [
  { label: "Experience 3+ years" },
  { label: "Relocation ready" },
  { label: "Notice period <= 30 days" },
  { label: "Mandatory answers complete" },
];

/* Status badge colors — mirrors the job-list status-pill treatment */
const STATUS_BADGE = {
  Applied:     { label: "Applied",     bg: "#EAF4FF", color: "#1D4ED8" },
  InReview:    { label: "In Review",   bg: "#FEF3C7", color: "#92400E" },
  Shortlisted: { label: "Shortlisted", bg: "#DCFCE7", color: "#166534" },
  Interview:   { label: "Interview",   bg: "#EDE9FE", color: "#6D28D9" },
  Hired:       { label: "Hired",       bg: "#CCFBF1", color: "#0F766E" },
  Rejected:    { label: "Rejected",    bg: "#FEE2E2", color: "#B91C1C" },
  Withdrawn:   { label: "Withdrawn",   bg: "#E5E7EB", color: "#374151" },
};

const STATUS_OPTIONS = [
  { value: "InReview",    label: "In Review" },
  { value: "Shortlisted", label: "Shortlisted" },
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
 * Build the profile tags for a card: trade, unlock/shortlist status, experience.
 */
function buildProfileTags(applicant) {
  const tags = [];

  if (applicant.primaryTrade) tags.push(applicant.primaryTrade);

  if (applicant.isUnlocked) tags.push("Profile Unlocked");
  else if (applicant.cvDownloaded) tags.push("CV Downloaded");
  else if (applicant.isShortlisted) tags.push("Shortlisted");

  if (applicant.experienceYears > 0) tags.push(`${applicant.experienceYears} yrs exp`);

  return tags;
}

/* ─── Reusable pill tag (matches Job List page) ─────────────────────── */
const Tag = ({ label }) => {
  const handleEnter = (e) => {
    e.currentTarget.style.background = "#1D4ED8";
    e.currentTarget.style.color = "#fff";
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 6px 14px rgba(29,78,216,0.18)";
  };
  const handleLeave = (e) => {
    e.currentTarget.style.background = "#EAF4FF";
    e.currentTarget.style.color = "#1D4ED8";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  };
  return (
    <span
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 12px",
        borderRadius: 999,
        background: "#EAF4FF",
        border: "1px solid #B9DCFF",
        color: "#1D4ED8",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1,
        cursor: "default",
        transition: "all 0.25s ease",
      }}
    >
      {label}
    </span>
  );
};

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
  const [rejectReason, setRejectReason]     = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote]         = useState("");
  const [existingNotes, setExistingNotes]   = useState([]);
  const [notesLoading, setNotesLoading]     = useState(false);

  const [detailPopup, setDetailPopup] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [screeningPopup, setScreeningPopup]   = useState(null);
  const [screeningLoading, setScreeningLoading] = useState(false);

  // Kebab action menu (matches Job List page pattern)
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRefs = useRef({});
  const menuRef = useRef(null);

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

  /* ── Close kebab menu on outside click / scroll / resize ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!openMenu) return;
      const clickedButton = Object.values(menuButtonRefs.current).some(
        (btn) => btn && btn.contains(e.target)
      );
      if (clickedButton) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, []);

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
      if      (selectedStatus === "InReview")    await moveToReview(statusPopup.applicationId, statusNote.trim());
      else if (selectedStatus === "Shortlisted") await shortlistApplicant(statusPopup.applicationId, statusNote.trim());
      else if (selectedStatus === "Rejected")    await rejectApplicant(statusPopup.applicationId, rejectReason, statusNote.trim());
      else if (selectedStatus === "Hired")       await hireApplicant(statusPopup.applicationId, statusNote.trim());

      // Optional note — only sent if the employer actually typed one.
      if (statusNote.trim()) {
        try {
          await addNote(statusPopup.applicationId, statusNote.trim());
        } catch (noteErr) {
          console.error(noteErr);
          showToast("Status updated, but the note could not be saved.", "warning");
        }
      }

      showToast(`Status updated to: ${STATUS_BADGE[selectedStatus]?.label || selectedStatus}`, "success");
      setStatusPopup(null); setRejectReason(""); setStatusNote(""); setExistingNotes([]);
      loadData(activeStatus, searchText, pageNumber);
    } catch (err) {
      console.error(err);
      showToast("Failed to update status. Please try again.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* ── Download CV ── */
  const handleDownloadCV = async (applicant) => {
    if (credits !== null && credits <= 0) {
      showToast("Insufficient credits. Please buy more credits.", "error");
      return;
    }

    try {
      const result = await candidateProfileService.downloadCv(applicant.candidateId);

      if (!result?.success) {
        showToast(result?.message || "Unable to download CV.", "error");
        return;
      }

      const dl = await candidateProfileService.downloadWatermarkedCv(
        applicant.candidateId,
        applicant.candidateName,
      );

      if (!dl?.success) {
        showToast(dl?.message || "Unable to download the CV.", "error");
        return;
      }

      showToast(
        result.message ||
          `CV downloaded for ${applicant.candidateName}. ${result.creditsDeducted ?? 0} credit(s) used.`,
        "success",
      );

      try {
        const walletRes = await getWallet();
        setCredits(Math.max(0, walletRes.availableCredits ?? 0));
      } catch {
        setCredits((c) => (c === null ? c : Math.max(0, c - 1)));
      }
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Unable to download CV.",
        "error",
      );
    }
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

  /* ── Answered Questions ── */
  const handleViewScreening = async (applicant) => {
    setScreeningLoading(true);
    try {
      const res = await getScreeningAnswers(applicant.applicationId);
      setScreeningPopup({
        candidateName: applicant.candidateName,
        jobTitle: res.jobTitle || applicant.jobTitle,
        screening: res.screening || [],
      });
    } catch (err) {
      console.error(err);
      showToast("Could not load screening answers.", "error");
    } finally {
      setScreeningLoading(false);
    }
  };

  /* ── Kebab menu ── */
  const openActionMenu = (applicant) => {
    if (openMenu === applicant.applicationId) { setOpenMenu(null); return; }
    const btn = menuButtonRefs.current[applicant.applicationId];
    if (!btn) { setOpenMenu(null); return; }
    const rect = btn.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 8, left: rect.left - 190 });
    setOpenMenu(applicant.applicationId);
  };

  /* ── Search ── */
  const handleSearch = (e) => {
    e.preventDefault(); setPageNumber(1);
    loadData(activeStatus, searchText, 1);
  };

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
  const menuApplicant = applicantList.find((a) => a.applicationId === openMenu) || null;

  /* ════════════════════════════════════════════════════════ */
  if (loading && applicantList.length === 0 && !dashboard) {
    return <div className="container py-5">Loading applicants...</div>;
  }

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">

            {/* ── Header (matches Job List page) ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <div>
                <h3 style={{ color: "#122359", fontWeight: 800, marginBottom: 6 }}>
                  Applicants
                </h3>
                <span className="font-sm color-text-paragraph-2">
                  {totalRecords} applicant{totalRecords !== 1 ? "s" : ""}
                  {jobId ? " for this job" : " across all jobs"}
                </span>
              </div>
              <Link
                className="btn btn-default"
                href="/employeer/job-list"
                style={{
                  borderRadius: 12,
                  fontWeight: 700,
                  boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                }}
              >
                <i className="fi-rr-arrow-left" style={{ marginRight: 7 }} />
                Back to Job List
              </Link>
            </div>

            {/* ── Credit balance banner ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                marginBottom: 20,
                background: "#fff",
                border: "1px solid rgba(18,35,89,0.08)",
                borderRadius: 18,
              }}
            >
              <span
                style={{
                  width: 38, height: 38, flexShrink: 0,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#122359,#1e3a8a)",
                  color: "#ffa300", fontSize: 16,
                }}
              >
                <i className="fi-rr-credit-card" />
              </span>
              <span style={{ fontSize: 13, color: "#66789c" }}>
                <strong style={{ color: "#122359", fontSize: 14 }}>
                  {credits !== null ? credits : "—"}
                </strong>{" "}
                CV download credit{credits === 1 ? "" : "s"} remaining
                <span style={{ color: "#94a3b8" }}> · 1 credit per CV download</span>
              </span>
              <Link
                href="/employeer/buy-credits"
                className="btn btn-border btn-sm"
                style={{ marginLeft: "auto", borderRadius: 10, fontWeight: 700 }}
              >
                <i className="fi-rr-plus" style={{ marginRight: 5 }} /> Buy credits
              </Link>
            </div>

            {/* ── Job filter banner (when arriving from Job List) ── */}
            {jobId && (
              <div
                style={{
                  display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12,
                  padding: "14px 20px", marginBottom: 20,
                  background: "#EAF4FF", border: "1px solid #B9DCFF", borderRadius: 18,
                }}
              >
                <span
                  style={{
                    width: 34, height: 34, flexShrink: 0,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 10, background: "#dde9ff", color: "#1D4ED8", fontSize: 14,
                  }}
                >
                  <i className="fi-rr-filter" />
                </span>
                <span style={{ fontWeight: 600, color: "#122359", fontSize: 14 }}>
                  Showing applicants for <strong style={{ color: "#1D4ED8" }}>{jobTitleFromUrl || "selected job"}</strong>
                </span>
                <Link
                  href="/employeer/applicants"
                  className="btn btn-border btn-sm"
                  style={{ marginLeft: "auto", borderRadius: 10, fontWeight: 700 }}
                >
                  <i className="fi-rr-cross-small" style={{ marginRight: 5 }} /> View all applicants
                </Link>
              </div>
            )}

            {/* ── Status filter tabs (matches Job List page style) ── */}
            <div className="candidate-status-filter mb-30">
              {statusTabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`candidate-status-filter-btn${activeStatus === tab.value ? " active" : ""}`}
                  type="button"
                  onClick={() => { setActiveStatus(tab.value); setPageNumber(1); }}
                >
                  <span>{tab.label}</span>
                  <span className="candidate-status-filter-count">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* ── Search + quick filters toolbar ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(18,35,89,0.08)",
                borderRadius: 24,
                padding: "20px 24px",
                marginBottom: 24,
              }}
            >
              <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 320px" }}>
                  <i
                    className="fi-rr-search"
                    style={{
                      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                      color: "#94a3b8", fontSize: 14, pointerEvents: "none",
                    }}
                  />
                  <input
                    placeholder="Search by name, trade, or city…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    aria-label="Search applicants"
                    style={{
                      width: "100%", height: 44, border: "1px solid rgba(18,35,89,0.14)",
                      borderRadius: 12, padding: "0 14px 0 38px", fontSize: 14, color: "#122359",
                    }}
                  />
                </div>
                <button className="btn btn-default btn-sm" type="submit" style={{ borderRadius: 10, fontWeight: 700 }}>
                  <i className="fi-rr-search" style={{ marginRight: 5 }} /> Search
                </button>
                <button
                  className="btn btn-border btn-sm"
                  type="button"
                  style={{ borderRadius: 10, fontWeight: 700 }}
                  onClick={() => { setSearchText(""); setActiveStatus(""); setPageNumber(1); loadData("", "", 1); showToast("Filters reset.", "info"); }}
                >
                  <i className="fi-rr-refresh" style={{ marginRight: 5 }} /> Reset
                </button>
              </form>

              <div
                style={{
                  display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
                  marginTop: 16, paddingTop: 16, borderTop: "1px dashed rgba(18,35,89,0.10)",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: "#66789c", textTransform: "uppercase", letterSpacing: "0.4px", marginRight: 4 }}>
                  Quick filters
                </span>
                {screeningFilters.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    style={{
                      border: "1px solid rgba(18,35,89,0.12)", background: "#fff", color: "#4f5e64",
                      borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
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
              <div
                style={{
                  background: "#fff", border: "1px solid rgba(18,35,89,0.08)", borderRadius: 24,
                  padding: "48px 24px", textAlign: "center",
                }}
              >
                <span
                  style={{
                    width: 64, height: 64, margin: "0 auto 14px",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 18, background: "#f1f4fb", color: "#9aa7c2", fontSize: 26,
                  }}
                >
                  <i className="fi-rr-inbox" />
                </span>
                <h6 style={{ color: "#122359", fontWeight: 800, margin: "0 0 6px" }}>No applicants found</h6>
                <p style={{ color: "#66789c", fontSize: 14, margin: 0 }}>
                  {jobId ? "No one has applied to this job yet, or none match your filters." : "Try clearing your filters or search."}
                </p>
              </div>
            )}

            {/* ── Applicant cards (matches Job List page card style) ── */}
            {!loading && applicantList.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {applicantList.map((applicant) => {
                  const statusInfo  = STATUS_BADGE[applicant.applicationStatus] || { label: applicant.applicationStatus, bg: "#E5E7EB", color: "#374151" };
                  const profileTags = buildProfileTags(applicant);

                  return (
                    <div
                      key={applicant.applicationId}
                      className="subuser-hover-card"
                      style={{ background: "#fff", borderRadius: 24, position: "relative", zIndex: 1 }}
                    >
                      <div style={{ padding: "24px 28px" }}>
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>

                          {/* ── Left: candidate icon + info ── */}
                          <div style={{ display: "flex", gap: 18, flex: 1, minWidth: 280 }}>
                            <div
                              style={{
                                width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                                background: "linear-gradient(135deg,#122359,#1e3a8a)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#ffa300", fontSize: 22,
                              }}
                            >
                              <i className="fi-rr-user" />
                            </div>

                            <div style={{ flex: 1 }}>
                              {/* Title row */}
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
                                <Link
                                  href={`/employeer/candidate-profile/${applicant.candidateId}`}
                                  style={{ margin: 0, color: "#122359", fontWeight: 800, fontSize: 17, textDecoration: "none" }}
                                >
                                  {applicant.candidateName}
                                </Link>

                                <span
                                  style={{
                                    display: "inline-flex", alignItems: "center", padding: "4px 10px",
                                    borderRadius: 999, background: statusInfo.bg, color: statusInfo.color,
                                    fontSize: 11, fontWeight: 700,
                                  }}
                                >
                                  {statusInfo.label}
                                </span>
                              </div>

                              {/* Meta */}
                              <p style={{ margin: "0 0 12px", color: "#66789c", fontSize: 13 }}>
                                {[applicant.primaryTrade, applicant.experienceYears ? `${applicant.experienceYears} yrs experience` : null]
                                  .filter(Boolean).join(" · ")}
                              </p>

                              {/* Info row */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginBottom: 14 }}>
                                <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                                  <i className="fi-rr-briefcase" style={{ color: "#ffa300" }} />
                                  {applicant.jobTitle}
                                </span>

                                {applicant.currentCity && (
                                  <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                                    <i className="fi-rr-marker" style={{ color: "#ffa300" }} />
                                    {[applicant.currentCity, applicant.currentState].filter(Boolean).join(", ")}
                                  </span>
                                )}

                                {applicant.appliedAt && (
                                  <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                                    <i className="fi-rr-clock" style={{ color: "#ffa300" }} />
                                    Applied {formatDate(applicant.appliedAt)}
                                  </span>
                                )}
                              </div>

                              {/* Tags */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {profileTags.map((label) => <Tag key={label} label={label} />)}
                              </div>
                            </div>
                          </div>

                          {/* ── Right: kebab action menu ── */}
                          <div style={{ position: "relative" }}>
                            <button
                              ref={(el) => (menuButtonRefs.current[applicant.applicationId] = el)}
                              onClick={() => openActionMenu(applicant)}
                              style={{
                                width: 44, height: 44, borderRadius: 14,
                                border: "1px solid #E5E7EB", background: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", boxShadow: "0 4px 12px rgba(18,35,89,.08)",
                                transition: ".25s",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FFA300"; e.currentTarget.style.background = "#FFF8EC"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#fff"; }}
                            >
                              <i className="fi-rr-menu-dots-vertical" style={{ fontSize: 18, color: "#122359" }} />
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* ── Floating action menu (shared, positioned per open card) ── */}
                {openMenu && menuApplicant && (
                  <div
                    ref={menuRef}
                    style={{
                      position: "fixed",
                      top: menuPosition.top,
                      left: menuPosition.left,
                      width: 240,
                      background: "#fff",
                      borderRadius: 18,
                      border: "1px solid #EEF2F7",
                      boxShadow: "0 24px 50px rgba(18,35,89,.14)",
                      overflow: "hidden",
                      zIndex: 999999,
                    }}
                  >
                    <button
                      className={styles.dropdownItem}
                      onClick={async () => {
                        setStatusPopup(menuApplicant);
                        setSelectedStatus(menuApplicant.applicationStatus);
                        setRejectReason(""); setStatusNote("");
                        setOpenMenu(null);

                        setExistingNotes([]);
                        setNotesLoading(true);
                        try {
                          const res = await getNotes(menuApplicant.applicationId);
                          setExistingNotes(res?.notes || []);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setNotesLoading(false);
                        }
                      }}
                    >
                      <i className="fi-rr-refresh" />
                      <span>Change Status</span>
                    </button>

                    <button
                      className={styles.dropdownItem}
                      onClick={() => { handleDownloadCV(menuApplicant); setOpenMenu(null); }}
                    >
                      <i className="fi-rr-download" />
                      <span>Download CV</span>
                    </button>

                    <button
                      className={styles.dropdownItem}
                      disabled={detailLoading}
                      onClick={() => { handleViewDetail(menuApplicant.applicationId); setOpenMenu(null); }}
                    >
                      <i className="fi-rr-eye" />
                      <span>{detailLoading ? "Loading…" : "View Details"}</span>
                    </button>

                    <button
                      className={styles.dropdownItem}
                      disabled={screeningLoading}
                      onClick={() => { handleViewScreening(menuApplicant); setOpenMenu(null); }}
                    >
                      <i className="fi-rr-list-check" />
                      <span>{screeningLoading ? "Loading…" : "Answered Questions"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 24 }}>
                <button
                  className="btn btn-border btn-sm"
                  style={{ borderRadius: 10, fontWeight: 700 }}
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => p - 1)}
                >
                  <i className="fi-rr-angle-left" style={{ marginRight: 5 }} /> Prev
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#66789c" }}>
                  Page {pageNumber} of {totalPages}
                </span>
                <button
                  className="btn btn-border btn-sm"
                  style={{ borderRadius: 10, fontWeight: 700 }}
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  Next <i className="fi-rr-angle-right" style={{ marginLeft: 5 }} />
                </button>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ══ Detail / View Questions Modal ══ */}
      {detailPopup && (
        <Modal title={`Profile Details — ${detailPopup.candidateName}`} onClose={() => setDetailPopup(null)}>

          {detailPopup.about && (
            <div style={{ marginBottom: "16px", padding: "10px 12px", background: "#f9fafb", borderRadius: "8px" }}>
              <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>{detailPopup.about}</p>
            </div>
          )}

          {detailPopup.workHistories?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "#374151" }}>Work History</p>
              {detailPopup.workHistories.map((w, i) => (
                <div key={i} style={{ fontSize: "13px", marginBottom: "6px", color: "#374151", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <strong>{w.jobTitle}</strong> at {w.companyName}
                  {w.isOffshore ? <span style={{ marginLeft: 6, fontSize: 11, display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, background: "#EAF4FF", color: "#1D4ED8" }}>Offshore</span> : null}
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
                  <Tag key={i} label={`${s.skillName}${s.yearsOfExperience ? ` (${s.yearsOfExperience}y)` : ""}`} />
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
        <Modal
          title={`Change Status — ${statusPopup.candidateName}`}
          onClose={() => { setStatusPopup(null); setStatusNote(""); setExistingNotes([]); }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
              Select new status:
            </label>
            <select className="form-control" value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setRejectReason(""); }}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {selectedStatus === "Rejected" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                Rejection Reason (optional):
              </label>
              <input type="text" className="form-control" placeholder="e.g. Overqualified, Not available…"
                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
          )}

          {existingNotes.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                Previous notes:
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "160px",
                  overflowY: "auto",
                }}
              >
                {existingNotes.map((n, i) => (
                  <div
                    key={n.recruiterNoteId || i}
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #f3f4f6",
                      borderRadius: "10px",
                      padding: "10px 12px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                      {n.noteText}
                    </p>
                    {n.createdAt && (
                      <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" }}>
                        {formatDate(n.createdAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {notesLoading && (
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>
              Loading previous notes…
            </p>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
              Add a note (optional):
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Strong communication skills, follow up next week…"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="btn btn-border btn-sm" onClick={() => { setStatusPopup(null); setStatusNote(""); setExistingNotes([]); }}>Cancel</button>
            <button className="btn btn-default btn-sm" onClick={handleStatusUpdate} disabled={updatingStatus}>
              {updatingStatus ? "Updating…" : "Update Status"}
            </button>
          </div>
        </Modal>
      )}

      {/* ══ Answered Questions Modal ══ */}
      {screeningPopup && (
        <Modal
          title={`Answered Questions — ${screeningPopup.candidateName}`}
          onClose={() => setScreeningPopup(null)}
        >
          {screeningPopup.jobTitle && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: "14px", fontSize: 12, color: "#4f5e64", fontWeight: 600 }}>
              <i className="fi fi-rr-briefcase" style={{ color: "#ff9900" }} />
              <span>{screeningPopup.jobTitle}</span>
            </div>
          )}

          {screeningPopup.screening.length === 0 ? (
            <p className="font-sm color-text-paragraph-2">
              No screening questions were answered for this application.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {screeningPopup.screening.map((qa, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 14px",
                    background: "#f9fafb",
                    borderRadius: "10px",
                    border: "1px solid #f0f1f5",
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 700, color: "#122359" }}>
                    Q{i + 1}. {qa.question}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                    <span style={{ fontWeight: 600, color: "#66789c" }}>Answer: </span>
                    {qa.answer && qa.answer.trim() ? qa.answer : <em style={{ color: "#9ca3af" }}>Not answered</em>}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
            <button className="btn btn-border btn-sm" onClick={() => setScreeningPopup(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default EmployerApplicantsClient;