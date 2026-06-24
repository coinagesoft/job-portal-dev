"use client";

import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useEffect, useState } from "react";

import {
  getJobDashboard,
  getRecruiterJobs,
} from "@/services/recruiter/recruiterJobListService";

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

const EmployerJobListPage = () => {
  const showToast = useToast();
  const [activeStatus, setActiveStatus] = useState("Active");
  const [activeType, setActiveType] = useState("All Types");
  const [dashboard, setDashboard] = useState(null);
 useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  const success = params.get("success");

  if (success === "job-published") {
    showToast("Job published successfully", "success");

    window.history.replaceState(
      {},
      "",
      window.location.pathname
    );
  }
}, []);
 
  const JOB_STATUS_TABS = [
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
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);

      const [dashboardRes, jobsRes] = await Promise.all([
        getJobDashboard(),
        getRecruiterJobs({}),
      ]);

      setDashboard(dashboardRes);

      setJobs(jobsRes.jobs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
              <Link
                className="btn btn-default"
                href="/dashboard/post-job"
                style={{
                  borderRadius: 12,
                  fontWeight: 700,
                  boxShadow: "0 8px 20px rgba(255,163,0,0.18)",
                }}
                onClick={() => showToast("Opening post a job form...", "info")}
              >
                <i className="fi-rr-plus" style={{ marginRight: 7 }} />
                Post a Job
              </Link>
            </div>

            {/* ── Status filter tabs (matches applicants page style) ── */}
            <div className="candidate-status-filter mb-10">
              {JOB_STATUS_TABS.map((tab) => (
                <button
                  key={tab.label}
                  className={`candidate-status-filter-btn${activeStatus === tab.label ? " active" : ""}`}
                  type="button"
                  onClick={async () => {
                    setActiveStatus(tab.label);

                    const response = await getRecruiterJobs({
                      status: tab.label,
                      jobType: activeType === "All Types" ? "" : activeType,
                    });

                    setJobs(response.jobs || []);
                  }}
                >
                  <span>{tab.label}</span>
                  <span className="candidate-status-filter-count">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Type sub-filter ── */}
            <div className="candidate-status-filter mb-30">
              {POSTING_TYPE_TABS.map((tab) => (
                <button
                  key={tab.label}
                  className={`candidate-status-filter-btn${activeType === tab.label ? " active" : ""}`}
                  type="button"
                  onClick={async () => {
                    setActiveType(tab.label);

                    const response = await getRecruiterJobs({
                      status: activeStatus === "All" ? "" : activeStatus,
                      jobType: tab.label === "All Types" ? "" : tab.label,
                    });

                    setJobs(response.jobs || []);
                  }}
                  style={{ fontSize: 11, padding: "6px 10px" }}
                >
                  <span>{tab.label}</span>
                  <span className="candidate-status-filter-count">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Job Cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="subuser-hover-card"
                  style={{
                    background: "#ffffff",
                    borderRadius: 24,
                    boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                    padding: 0,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "24px 28px" }}>
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
                            borderRadius: 16,
                            flexShrink: 0,
                            background:
                              "linear-gradient(135deg,#122359,#1e3a8a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffa300",
                            fontSize: 22,
                          }}
                        >
                          <i className="fi-rr-briefcase" />
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
                            <h5
                              style={{
                                margin: 0,
                                color: "#122359",
                                fontWeight: 800,
                                fontSize: 17,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                showToast(`Viewing: ${job.jobTitle}`, "info")
                              }
                            >
                              {job.jobTitle}
                            </h5>
                            {/* Post type badge */}
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
                              {job.jobType}
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
                                    : "#FEF3C7",

                                color:
                                  job.jobStatus === "Active"
                                    ? "#166534"
                                    : "#92400E",
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

                          {/* Skill tags */}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            <Tag label={job.tradeCategory} />
                            <Tag label={job.jobType} />
                            <Tag label={job.jobStatus} />
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
                        {/* Applicant count pill */}
                        <div
                          style={{
                            background:
                              job.appliedCount > 0 ? "#EAF4FF" : "#f8fafc",
                            border: `1px solid ${
                              job.appliedCount > 0
                                ? "#B9DCFF"
                                : "rgba(18,35,89,0.08)"
                            }`,
                            borderRadius: 14,
                            padding: "10px 16px",
                            textAlign: "center",
                            minWidth: 110,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 26,
                              fontWeight: 800,
                              color:
                                job.appliedCount > 0 ? "#1D4ED8" : "#94a3b8",
                              lineHeight: 1,
                            }}
                          >
                            {job.appliedCount}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#66789c",
                              marginTop: 3,
                              fontWeight: 600,
                            }}
                          >
                            Applicant{job.appliedCount !== 1 ? "s" : ""}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            width: "100%",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              width: "100%",
                            }}
                          >
                            <Link
                              href={`/dashboard/post-job?jobId=${job.jobId}`}
                              className="btn btn-default btn-sm"
                              style={{
                                borderRadius: 10,
                                fontWeight: 700,
                                textAlign: "center",
                              }}
                            >
                              <i
                                className="fi-rr-edit"
                                style={{ marginRight: 5 }}
                              />
                              Edit
                            </Link>

                            <Link
                              href={`/employeer/job-applicants/${job.jobId}`}
                              className="btn btn-border btn-sm"
                              style={{
                                borderRadius: 10,
                                fontWeight: 700,
                                textAlign: "center",
                              }}
                            >
                              <i
                                className="fi-rr-users"
                                style={{ marginRight: 5 }}
                              />
                              Applicants
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerJobListPage;
