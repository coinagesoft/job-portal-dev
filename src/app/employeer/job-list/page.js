"use client";

import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import styles from "./joblist.module.css";
import JobPreviewModal from "@/components/JobPreviewModal";
import { mapResumeToForm } from "@/utils/jobFormMapper";
import companyProfileService from "@/services/recruiter/companyProfileService";
import { getEmployerId } from "@/utils/authHelper";

import {
  getJobDashboard,
  getRecruiterJobs,
  pauseJob,
  resumeJob,
  closeJob,
  archiveJob,
  deleteJob,
} from "@/services/recruiter/recruiterJobListService";
import { getJobResume } from "@/services/recruiter/recruiterJobPostService";

/* Turn backend enum-style values (Regular_Hiring, Full_Time) into readable text */
const humanize = (s) => (s ? s.replace(/_/g, " ") : s);

/* ── reusable pill tag ── */
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

// const handleDelete = async (jobId, jobTitle) => {
//   const confirmed = window.confirm(
//     `Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`
//   );

//   if (!confirmed) return;

//   try {
//     const res = await deleteJob(jobId);

//     showToast(res.message || "Job deleted successfully", "success");

//     await loadData();
//   } catch (err) {
//     showToast(err.response?.data?.message || "Unable to delete job", "error");
//   }
// };
const EmployerJobListPage = () => {
  const showToast = useToast();
  const user = useSelector((state) => state.auth.user);
  const isSubUser = user?.isSubUser === true;
  // Job management (edit/pause/resume/close/delete) mirrors the
  // backend's CanPostJobs check; the account owner always has both.
  const canManageJobs = !isSubUser || user?.canPostJobs !== false;
  const canViewApplicants = !isSubUser || user?.canManageApplications !== false;
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeType, setActiveType] = useState("All Types");
  const [openMenu, setOpenMenu] = useState(null);
  const [companyLogos, setCompanyLogos] = useState({});

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const menuButtonRefs = useRef({});
  const menuRef = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewJob, setPreviewJob] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null); // { jobId, jobTitle } | null
  const [deleting, setDeleting] = useState(false);

  const requestDelete = (jobId, jobTitle) => {
    setOpenMenu(null);
    setDeleteTarget({ jobId, jobTitle });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteJob(deleteTarget.jobId);
      showToast(res.message || "Job deleted successfully", "success");
      await Promise.all([loadData(), loadJobs(activeStatus, activeType)]);
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to delete job", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handlePreview = async (jobId) => {
    setOpenMenu(null);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewJob(null);
    try {
      const response = await getJobResume(jobId);
      setPreviewJob(mapResumeToForm(response));
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to load job preview",
        "error",
      );
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const [dashboard, setDashboard] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    const success = params.get("success");

    if (success === "job-published") {
      showToast("Job published successfully", "success");

      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  const handleClose = async (jobId) => {
    try {
      const res = await closeJob(jobId);
      showToast(res.message, "success");
      await Promise.all([loadData(), loadJobs(activeStatus, activeType)]);
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to close job", "error");
    }
  };

  const handleResume = async (jobId) => {
    try {
      const res = await resumeJob(jobId);
      showToast(res.message, "success");
      await Promise.all([loadData(), loadJobs(activeStatus, activeType)]);
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to resume job", "error");
    }
  };

  const handleArchive = async (jobId) => {
    try {
      const res = await archiveJob(jobId);
      showToast(res.message, "success");
      await Promise.all([loadData(), loadJobs(activeStatus, activeType)]);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to archive job",
        "error",
      );
    }
  };

  const JOB_STATUS_TABS = [
    {
      label: "All",
      count: dashboard?.totalJobs || 0,
    },
    {
      label: "Draft",
      count: dashboard?.draftJobs || 0,
    },
    {
      label: "Active",
      count: dashboard?.activeJobs || 0,
    },
    {
      label: "Paused",
      count: dashboard?.pausedJobs || 0,
    },
    {
      label: "Closed",
      count: dashboard?.closedJobs || 0,
    },
    {
      label: "Archived",
      count: dashboard?.archivedJobs || 0,
    },
  ];

  const POSTING_TYPE_TABS = [
    {
      label: "All Types",
      count: dashboard?.totalJobs || 0,
    },
    {
      label: "Normal",
      count: dashboard?.normalJobs || 0,
    },
    {
      label: "Classified",
      count: dashboard?.classifiedJobs || 0,
    },
    {
      label: "Hot Vacancy",
      count: dashboard?.hotVacancyJobs || 0,
    },
  ];
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [jobType, setJobType] = useState("");

  const [jobsLoading, setJobsLoading] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!openMenu) return;

      const clickedButton = Object.values(menuButtonRefs.current).some(
        (btn) => btn && btn.contains(e.target),
      );

      if (clickedButton) return;

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  useEffect(() => {
    const handleScroll = () => {
      setOpenMenu(null);
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setOpenMenu(null);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const loadJobs = async (statusLabel, typeLabel) => {
    try {
      setJobsLoading(true);
      const response = await getRecruiterJobs({
        status: statusLabel === "All" ? "" : statusLabel,
        jobType: typeLabel === "All Types" ? "" : typeLabel,
      });
      const jobsList = response.jobs || [];
      setJobs(jobsList);
      await loadCompanyLogos(jobsList);
    } catch (error) {
      console.error(error);
      showToast("Unable to load jobs", "error");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(activeStatus, activeType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus, activeType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const dashboardRes = await getJobDashboard();
      setDashboard(dashboardRes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyLogos = async (jobsList) => {
    const logos = {};
    const fallbackEmployerId = getEmployerId();

    try {
      const profile = await companyProfileService.getCompanyProfile();
      const recruiterLogo =
        profile?.companyLogoUrl || profile?.companyLogo || "";
      if (fallbackEmployerId) {
        logos[fallbackEmployerId] = recruiterLogo;
      }
    } catch (err) {
      console.error("Error loading recruiter profile logo:", err);
    }

    await Promise.all(
      jobsList.map(async (job) => {
        try {
          const empId = job.employerId || fallbackEmployerId;
          if (!empId || logos[empId] !== undefined) return;

          const res =
            await companyProfileService.getPublicCompanyDetails(empId);
          logos[empId] = (res && (res.companyLogoUrl || res.companyLogo)) || "";
        } catch (err) {
          console.error(err);
        }
      }),
    );

    setCompanyLogos(logos);
  };
  const applyFilters = async () => {
    try {
      const response = await getRecruiterJobs({
        search,
        status,
        jobType,
      });

      setJobs(response.jobs || []);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="container py-5">Loading jobs...</div>;
  }
  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">
            {/* ── Header ── */}
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
                <h3
                  style={{ color: "#122359", fontWeight: 800, marginBottom: 6 }}
                >
                  Jobs
                </h3>
                <span className="font-sm color-text-paragraph-2">
                  Track active, paused, and premium-priority job listings
                </span>
              </div>
              {canManageJobs && (
                <Link
                  className="btn btn-default"
                  href="/dashboard/post-job"
                  style={{
                    borderRadius: 12,
                    fontWeight: 700,
                    boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                  onClick={() =>
                    showToast("Opening post a job form...", "info")
                  }
                >
                  <i className="fi-rr-plus" style={{ fontSize: 13, lineHeight: 1 }} />
                  Post a Job
                </Link>
              )}
            </div>

            {/* ── Status filter tabs (matches applicants page style) ── */}
            <div className="candidate-status-filter" style={{ marginBottom: 28 }}>
              {JOB_STATUS_TABS.map((tab) => (
                <button
                  key={tab.label}
                  className={`candidate-status-filter-btn${activeStatus === tab.label ? " active" : ""}`}
                  type="button"
                  onClick={() => setActiveStatus(tab.label)}
                >
                  <span>{tab.label}</span>
                  <span className="candidate-status-filter-count">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Type sub-filter ── */}
            {/* <div className="candidate-status-filter mb-30">
            {POSTING_TYPE_TABS.map((tab) => (
  <button
    key={tab.label}
    className={`candidate-status-filter-btn${activeType === tab.label ? " active" : ""}`}
    type="button"
    onClick={() => setActiveType(tab.label)}
    style={{ fontSize: 11, padding: "6px 10px" }}
  >
    <span>{tab.label}</span>
    <span className="candidate-status-filter-count">{tab.count}</span>
  </button>
))}
            </div> */}

            {/* ── Job Cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {jobsLoading ? (
                <div
                  className="text-center"
                  style={{
                    padding: "60px 20px",
                    background: "#fff",
                    borderRadius: 24,
                    border: "1px solid rgba(18, 35, 89, 0.08)",
                  }}
                >
                  <div
                    className="spinner-border text-warning"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                  >
                    <span className="visually-hidden">Loading jobs...</span>
                  </div>
                  <p
                    style={{
                      marginTop: 16,
                      color: "#66789c",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    Loading jobs...
                  </p>
                </div>
              ) : jobs.length === 0 ? (
                <div
                  className="text-center"
                  style={{
                    padding: "50px 20px",
                    background: "#ffffff",
                    borderRadius: 24,
                    border: "1px dashed rgba(18, 35, 89, 0.16)",
                    boxShadow: "0 4px 14px rgba(18,35,89,0.02)",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      margin: "0 auto 16px",
                      borderRadius: "50%",
                      background: "#FFF8EC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      color: "#ffa300",
                    }}
                  >
                    <i className="fi-rr-briefcase" />
                  </div>
                  <h4
                    style={{
                      color: "#122359",
                      fontWeight: 800,
                      marginBottom: 8,
                    }}
                  >
                    No jobs posted yet
                  </h4>
                  <p
                    style={{
                      color: "#66789c",
                      fontSize: 14,
                      maxWidth: 400,
                      margin: "0 auto 20px",
                      lineHeight: 1.6,
                    }}
                  >
                    {activeStatus !== "All"
                      ? `No ${activeStatus.toLowerCase()} jobs found. Try changing the filter tab above.`
                      : "You haven't posted any jobs yet. Create a new job posting to start receiving applications."}
                  </p>
                  {canManageJobs && (
                    <Link
                      className="btn btn-default"
                      href="/dashboard/post-job"
                      style={{
                        borderRadius: 12,
                        fontWeight: 700,
                        boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <i
                        className="fi-rr-plus"
                        style={{ fontSize: 13, lineHeight: 1 }}
                      />
                      Post a Job
                    </Link>
                  )}
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.jobId}
                    className="subuser-hover-card"
                    onClick={() => handlePreview(job.jobId)}
                    style={{
                      background: "#fff",
                      borderRadius: 24,
                      position: "relative",
                      zIndex: 1,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        padding: "24px 28px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 24,
                          flexWrap: "wrap",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* ── Left: job icon + info ── */}
                        <div
                          style={{
                            display: "flex",
                            gap: 18,
                            flex: 1,
                            minWidth: 280,
                          }}
                        >
                          {/* Job icon */}
                          <div
                            style={{
                              width: 54,
                              height: 54,
                              borderRadius: 8,
                              flexShrink: 0,
                              overflow: "hidden",
                              border: "1px solid #E5E7EB",
                              background: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={
                                companyLogos[job.employerId || getEmployerId()] ||
                                "/assets/imgs/page/company/company.png"
                              }
                              alt="Company Logo"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/assets/imgs/page/company/company.png";
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            {/* Title row */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexWrap: "wrap",
                                marginBottom: 5,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <h5
                                  style={{
                                    margin: 0,
                                    color: "#122359",
                                    fontWeight: 800,
                                    fontSize: 17,
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handlePreview(job.jobId)}
                                  title="Click to preview this job posting"
                                >
                                  {job.jobTitle}
                                </h5>
                              </div>
                              {/* Employment type badge */}
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background: "#EAF4FF",
                                  border: "1px solid #B9DCFF",
                                  color: "#1D4ED8",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {humanize(job.employmentType) ||
                                  humanize(job.jobType)}
                              </span>
                              {/* Status badge */}
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  background:
                                    job.jobStatus === "Active"
                                      ? "#DCFCE7"
                                      : job.jobStatus === "Paused"
                                        ? "#FEF3C7"
                                        : job.jobStatus === "Closed"
                                          ? "#FEE2E2"
                                          : job.jobStatus === "Draft"
                                            ? "#EAF4FF"
                                            : "#E5E7EB",

                                  color:
                                    job.jobStatus === "Active"
                                      ? "#166534"
                                      : job.jobStatus === "Paused"
                                        ? "#92400E"
                                        : job.jobStatus === "Closed"
                                          ? "#B91C1C"
                                          : job.jobStatus === "Draft"
                                            ? "#1D4ED8"
                                            : "#374151",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {job.jobStatus}
                              </span>
                            </div>

                            {/* Meta */}
                            <p
                              style={{
                                margin: "0 0 12px",
                                color: "#66789c",
                                fontSize: 13,
                              }}
                            >
                              {job.tradeCategory}
                            </p>

                            {/* Info row */}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px 20px",
                                marginBottom: 14,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#94a3b8",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <i
                                  className="fi-rr-marker"
                                  style={{ color: "#ffa300" }}
                                />
                                {job.location}
                              </span>

                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#94a3b8",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <i
                                  className="fi-rr-users"
                                  style={{ color: "#ffa300" }}
                                />
                                Vacancies: {job.vacancies}
                              </span>

                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#94a3b8",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <i
                                  className="fi-rr-money"
                                  style={{ color: "#ffa300" }}
                                />
                                ₹{job.salaryMin?.toLocaleString()} - ₹
                                {job.salaryMax?.toLocaleString()}
                              </span>
                            </div>

                            {/* Last applicant */}
                            <div
                              style={{
                                marginBottom: 14,
                                fontSize: 12,
                                color: "#66789c",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <i
                                className="fi-rr-clock"
                                style={{ color: "#ffa300", fontSize: 11 }}
                              />
                              Application Deadline:{" "}
                              <strong style={{ color: "#122359" }}>
                                {job.applicationDeadline}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* ── Right: applicant count + actions ── */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            minWidth: 160,
                            gap: 16,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              position: "relative",
                            }}
                          >
                            <Link
                              href={`/employeer/applicants?jobId=${job.jobId}&jobTitle=${encodeURIComponent(job.jobTitle || "")}`}
                              onClick={(e) => e.stopPropagation()}
                              title="View applicants"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 44,
                                padding: "0 16px",
                                borderRadius: 14,
                                background: "#EAF4FF",
                                border: "1px solid #B9DCFF",
                                color: "#1D4ED8",
                                fontSize: 12,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                textDecoration: "none",
                                boxShadow: "0 4px 12px rgba(18,35,89,.08)",
                                transition: ".25s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#1D4ED8";
                                e.currentTarget.style.color = "#fff";
                                e.currentTarget.style.borderColor = "#1D4ED8";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#EAF4FF";
                                e.currentTarget.style.color = "#1D4ED8";
                                e.currentTarget.style.borderColor = "#B9DCFF";
                              }}
                            >
                              {job.appliedCount} Applicant
                              {job.appliedCount !== 1 ? "s" : ""}
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(job.jobId);
                              }}
                              title="Preview"
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                border: "1px solid #E5E7EB",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(18,35,89,.08)",
                                transition: ".25s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#FFA300";
                                e.currentTarget.style.background = "#FFF8EC";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#E5E7EB";
                                e.currentTarget.style.background = "#fff";
                              }}
                            >
                              <i
                                className="fi-rr-eye"
                                style={{
                                  fontSize: 18,
                                  color: "#122359",
                                }}
                              />
                            </button>
                            <button
                              ref={(el) =>
                                (menuButtonRefs.current[job.jobId] = el)
                              }
                              onClick={(e) => {
                                e.stopPropagation();

                                if (openMenu === job.jobId) {
                                  setOpenMenu(null);
                                  return;
                                }

                                const rect =
                                  menuButtonRefs.current[
                                    job.jobId
                                  ].getBoundingClientRect();

                                setMenuPosition({
                                  top: rect.bottom + 8,
                                  left: rect.left - 190,
                                });

                                setOpenMenu(job.jobId);
                              }}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                border: "1px solid #E5E7EB",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(18,35,89,.08)",
                                transition: ".25s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#FFA300";
                                e.currentTarget.style.background = "#FFF8EC";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#E5E7EB";
                                e.currentTarget.style.background = "#fff";
                              }}
                            >
                              <i
                                className="fi-rr-menu-dots-vertical"
                                style={{
                                  fontSize: 18,
                                  color: "#122359",
                                }}
                              />
                            </button>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

              {openMenu && (
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
                  {jobs
                    .filter((job) => job.jobId === openMenu)
                    .map((job) => (
                      <div key={job.jobId}>
                        {/* <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => handlePreview(job.jobId)}
                        >
                          <i className="fi-rr-eye" />
                          <span>Preview</span>
                        </button> */}

                        {canManageJobs && (
                          <Link
                            href={`/dashboard/post-job?jobId=${job.jobId}`}
                            className={styles.dropdownItem}
                          >
                            <i
                              className={
                                job.jobStatus === "Draft"
                                  ? "fi-rr-arrow-right"
                                  : "fi-rr-edit"
                              }
                            />
                            <span>
                              {job.jobStatus === "Draft"
                                ? "Continue Draft"
                                : "Edit Job"}
                            </span>
                          </Link>
                        )}

                        {canViewApplicants && (
                          <Link
                            href={`/employeer/applicants?jobId=${job.jobId}&jobTitle=${encodeURIComponent(job.jobTitle || "")}`}
                            className={styles.dropdownItem}
                          >
                            <i className="fi-rr-user" />
                            <span>Applicants</span>
                          </Link>
                        )}

                        {canManageJobs && job.jobStatus === "Active" && (
                          <>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => handlePause(job.jobId)}
                            >
                              <i className="fi-rr-pause" />
                              <span>Pause Job</span>
                            </button>

                            <button
                              className={styles.dropdownItem}
                              onClick={() => handleClose(job.jobId)}
                            >
                              <i className="fi-rr-cross-circle" />
                              <span>Close Job</span>
                            </button>
                          </>
                        )}

                        {canManageJobs && (
                          <button
                            className={styles.dropdownItem}
                            onClick={() =>
                              requestDelete(job.jobId, job.jobTitle)
                            }
                            style={{ color: "#dc2626" }}
                          >
                            <i className="fi-rr-trash" />
                            <span>Delete Job</span>
                          </button>
                        )}

                        {!canManageJobs && !canViewApplicants && (
                          <div
                            className={styles.dropdownItem}
                            style={{ color: "#94a3b8", cursor: "default" }}
                          >
                            <i className="fi-rr-lock" />
                            <span>View only — no permission</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <JobPreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewJob(null);
        }}
        job={previewJob}
        loading={previewLoading}
      />
      {deleteTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(18,35,89,0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
          }}
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(400px, 90vw)",
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #EEF2F7",
              boxShadow: "0 24px 50px rgba(18,35,89,.18)",
              padding: "28px 26px",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <i
                className="fi-rr-trash"
                style={{ fontSize: 20, color: "#dc2626" }}
              />
            </div>

            <h5 style={{ color: "#122359", fontWeight: 800, marginBottom: 8 }}>
              Delete this job?
            </h5>

            <p
              style={{
                fontSize: 13.5,
                color: "#66789c",
                lineHeight: 1.5,
                marginBottom: 24,
              }}
            >
              {`"${deleteTarget.jobTitle}"`} will be permanently removed. This
              action cannot be undone.
            </p>

            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{
                  height: 42,
                  padding: "0 18px",
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "#fff",
                  color: "#122359",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  height: 42,
                  padding: "0 18px",
                  borderRadius: 12,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EmployerJobListPage;