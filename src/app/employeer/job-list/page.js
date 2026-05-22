"use client";

import Link from "next/link";
import { useToast } from "@/components/Toast";

const jobStatusTabs = [
  { label: "Active", count: 4, isActive: true },
  { label: "Paused", count: 1, isActive: false },
  { label: "Closed", count: 8, isActive: false },
  { label: "Archived", count: 12, isActive: false },
];

const postingTypeTabs = [
  { label: "Normal", count: 6, isActive: false },
  { label: "Classified", count: 1, isActive: false },
];

const employerJobs = [
  {
    id: "job-welder-6g-mumbai",
    title: "Welder 6G - Mumbai",
    meta: "Onshore | INR 30K-45K | Deadline: 15 May 2026",
    postType: "Hot Vacancy",
    postTypeClass: "badge bg-danger",
    visibility: "Visibility: 15 days",
    priorityText: "Priority rank: Top results + Featured Jobs section",
    monetization: "Premium fee: INR 2,999 + GST",
    applicants: 12,
    lastApplicant: "Ramesh K. Sharma - Applied 2h ago",
    topMatches: ["6G Certified", "Pipeline welding", "Immediate joiner"],
    status: "Active",
    statusClass: "badge bg-success",
    actions: [
      {
        label: "Applicants",
        href: "/employeer/applicants",
        isApplicants: true,
      },
      { label: "Edit", href: "/dashboard/post-job" },
      { label: "Pause" },
    ],
  },
  {
    id: "job-marine-engineer-gulf",
    title: "Marine Engineer - Gulf Region",
    meta: "Offshore | USD 3,000-4,500 | Deadline: 30 Apr 2026",
    postType: "Classified",
    postTypeClass: "badge bg-warning text-dark",
    visibility: "Visibility: Standard listing",
    priorityText: "Classified listing with lower promotion cost",
    monetization: "Posting fee: INR 999 + GST",
    applicants: 7,
    lastApplicant: "Suresh Menon - Applied 5h ago",
    topMatches: ["Passport valid", "Offshore exp", "Engine room support"],
    status: "Active",
    statusClass: "badge bg-success",
    actions: [
      {
        label: "Applicants",
        href: "/employeer/applicants",
        isApplicants: true,
      },
      { label: "Edit", href: "/dashboard/post-job" },
      { label: "Pause" },
    ],
  },
  {
    id: "job-cook-galley-hand",
    title: "Cook / Galley Hand",
    meta: "Offshore | AED 2,500-3,200 | Deadline: 20 Apr 2026",
    postType: "Normal Job",
    postTypeClass: "badge bg-secondary",
    visibility: "Visibility: Standard listing",
    priorityText: "Normal ranking in results",
    monetization: "Posting fee: Included in plan",
    applicants: 0,
    lastApplicant: "No recent applicants",
    topMatches: ["Hospitality exp", "Food safety", "Rotation shift ready"],
    status: "Paused",
    statusClass: "badge bg-warning text-dark",
    actions: [
      { label: "Resume" },
      { label: "Edit", href: "/dashboard/post-job" },
    ],
  },
  {
    id: "job-rig-electrician-offshore",
    title: "Rig Electrician - Offshore Platform",
    meta: "Offshore | INR 55K-75K | Deadline: 25 May 2026",
    postType: "Hot Vacancy",
    postTypeClass: "badge bg-danger",
    visibility: "Visibility: 15 days",
    priorityText: "Priority rank: Top results + Featured Jobs section",
    monetization: "Premium fee: INR 2,999 + GST",
    applicants: 19,
    lastApplicant: "Arjun Verma - Applied 30 mins ago",
    topMatches: ["Offshore certified", "STCW", "Relocation ready"],
    status: "Active",
    statusClass: "badge bg-success",
    actions: [
      {
        label: "Applicants",
        href: "/employeer/applicants",
        isApplicants: true,
      },
      { label: "Edit", href: "/dashboard/post-job" },
      { label: "Pause" },
    ],
  },
  {
    id: "job-fitter-shipyard",
    title: "Fitter / Fabricator - Shipyard",
    meta: "Onshore | INR 22K-32K | Deadline: 10 May 2026",
    postType: "Normal Job",
    postTypeClass: "badge bg-secondary",
    visibility: "Visibility: Standard listing",
    priorityText: "Normal ranking in results",
    monetization: "Posting fee: Included in plan",
    applicants: 5,
    lastApplicant: "Deepak Patel - Applied 1 day ago",
    topMatches: ["Shipyard exp", "Blueprint reading", "Onshore ready"],
    status: "Active",
    statusClass: "badge bg-success",
    actions: [
      {
        label: "Applicants",
        href: "/employeer/applicants",
        isApplicants: true,
      },
      { label: "Edit", href: "/dashboard/post-job" },
      { label: "Pause" },
    ],
  },
];

const compactBtnStyle = {
  padding: "5px 10px",
  lineHeight: "16px",
};

const EmployerJobListPage = () => {
  const showToast = useToast();

  const handleTabClick = (label) => {
    showToast(`Filtering jobs: ${label}`, "info");
  };

  const handleActionClick = (label, jobTitle) => {
    if (label === "Pause")
      showToast(`Job "${jobTitle}" has been paused.`, "warning");
    else if (label === "Resume")
      showToast(`Job "${jobTitle}" has been resumed.`, "success");
    else showToast(`${label} — ${jobTitle}`, "info");
  };

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">
            <div className="box-filters-job">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h3 className="mb-5">Jobs</h3>
                  <span className="font-sm color-text-paragraph-2">
                    Track active, paused, and premium-priority job listings
                  </span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <Link
                    className="btn btn-default hover-up"
                    href="/dashboard/post-job"
                    onClick={() =>
                      showToast("Opening post a job form...", "info")
                    }
                  >
                    + Post a job
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-20 mb-20">
              {jobStatusTabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`btn btn-sm ${tab.isActive ? "btn-default" : "btn-border"} mr-10 mb-10`}
                  type="button"
                  style={compactBtnStyle}
                  onClick={() => handleTabClick(tab.label)}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="mt-5 mb-20">
              {postingTypeTabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`btn btn-sm ${tab.isActive ? "btn-default" : "btn-border"} mr-10 mb-10`}
                  type="button"
                  style={compactBtnStyle}
                  onClick={() => handleTabClick(tab.label)}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="box-list-jobs display-list">
              {employerJobs.map((job) => (
                <div className="col-xl-12 col-12" key={job.id}>
                  <div
                    className="card-grid-2 hover-up"
                    style={{
                      border: "1px solid rgba(18, 35, 89, 0.08)",
                      borderRadius: "24px",
                      overflow: "hidden",
                      transition:
                        "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
                      background: "#ffffff",
                      boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                      marginBottom: "24px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";

                      e.currentTarget.style.border =
                        "1px solid rgba(255, 153, 0, 0.18)";

                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(255,153,0,0.14)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";

                      e.currentTarget.style.border =
                        "1px solid rgba(18, 35, 89, 0.08)";

                      e.currentTarget.style.boxShadow =
                        "0 4px 14px rgba(18,35,89,0.04)";
                    }}
                  >
                    <div className="card-block-info pt-20">
                      <div className="row align-items-center">
                        {/* Left */}
                        <div className="col-lg-7 col-md-12 col-sm-12">
                          <h4>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();

                                showToast(`Viewing: ${job.title}`, "info");
                              }}
                            >
                              {job.title}
                            </a>
                          </h4>

                          <p className="font-sm color-text-paragraph mt-10">
                            {job.meta}
                          </p>

                          {/* TOP TAG */}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                              marginTop: 18,
                              marginBottom: 10,
                            }}
                          >
                            {[
                              job.postType !== "Hot Vacancy"
                                ? job.postType
                                : null,
                            ]
                              .filter(Boolean)
                              .map((tag, index) => (
                                <span
                                  key={index}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "6px 14px",
                                    borderRadius: 999,
                                    background: "#EAF4FF",
                                    border: "1px solid #B9DCFF",
                                    color: "#1D4ED8",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    lineHeight: 1,
                                    transition: "all 0.25s ease",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "#1D4ED8";

                                    e.currentTarget.style.color = "#ffffff";

                                    e.currentTarget.style.transform =
                                      "translateY(-1px)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      "#EAF4FF";

                                    e.currentTarget.style.color = "#1D4ED8";

                                    e.currentTarget.style.transform =
                                      "translateY(0px)";
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>

                          <p className="font-xs color-text-paragraph-2 mt-10 mb-5">
                            {job.visibility}
                          </p>

                          <p className="font-xs color-text-paragraph-2 mb-0">
                            {job.priorityText}
                          </p>

                          <p className="font-xs color-text-paragraph-2 mb-0">
                            {job.monetization}
                          </p>

                          <p className="font-xs color-text-paragraph-2 mt-10 mb-5">
                            Last applicant activity: {job.lastApplicant}
                          </p>

                          {/* SKILL TAGS */}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                              marginTop: 14,
                            }}
                          >
                            {job.topMatches.map((tag) => (
                              <span
                                key={`${job.id}-${tag}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "6px 12px",
                                  borderRadius: 999,
                                  background: "#F4F7FF",
                                  border: "1px solid rgba(29,78,216,0.10)",
                                  color: "#1D4ED8",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  lineHeight: 1,
                                  transition: "all 0.25s ease",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#1D4ED8";

                                  e.currentTarget.style.color = "#ffffff";

                                  e.currentTarget.style.transform =
                                    "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "#F4F7FF";

                                  e.currentTarget.style.color = "#1D4ED8";

                                  e.currentTarget.style.transform =
                                    "translateY(0px)";
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div className="col-lg-5 col-md-12 col-sm-12 text-lg-end mt-md-15 mt-sm-15">
                          <div className="card-2-bottom mt-20 mt-lg-0">
                            <span className="btn btn-grey-small mr-5 mb-5">
                              {job.status}
                            </span>

                            <div className="mt-10">
                              {job.actions.map((action) =>
                                action.href ? (
                                  <Link
                                    key={`${job.id}-${action.label}`}
                                    className="btn btn-sm mr-5 mb-5"
                                    href={action.href}
                                    style={
                                      action.label === "Applicants"
                                        ? {
                                            background: "#FFA300",
                                            border: "1px solid #FFA300",
                                            color: "#ffffff",
                                            transition: "all 0.3s ease",
                                          }
                                        : undefined
                                    }
                                    onMouseEnter={(e) => {
                                      if (action.label === "Applicants") {
                                        e.currentTarget.style.background =
                                          "#e69500";

                                        e.currentTarget.style.border =
                                          "1px solid #e69500";

                                        e.currentTarget.style.transform =
                                          "translateY(-2px)";

                                        e.currentTarget.style.boxShadow =
                                          "0 10px 24px rgba(255,163,0,0.28)";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (action.label === "Applicants") {
                                        e.currentTarget.style.background =
                                          "#FFA300";

                                        e.currentTarget.style.border =
                                          "1px solid #FFA300";

                                        e.currentTarget.style.transform =
                                          "translateY(0px)";

                                        e.currentTarget.style.boxShadow =
                                          "none";
                                      }
                                    }}
                                    onClick={() =>
                                      showToast(
                                        `${action.label} — ${job.title}`,
                                        "info",
                                      )
                                    }
                                  >
                                    {action.label}

                                    {action.isApplicants &&
                                      job.applicants > 0 && (
                                        <span
                                          style={{
                                            marginLeft: 6,
                                            color: "#ffffff",
                                            fontSize: 10,
                                            fontWeight: 700,
                                          }}
                                        >
                                          -{job.applicants}
                                        </span>
                                      )}
                                  </Link>
                                ) : (
                                  <button
                                    key={`${job.id}-${action.label}`}
                                    className="btn btn-outline-theme btn-sm mr-5 mb-5"
                                    type="button"
                                    onClick={() =>
                                      handleActionClick(action.label, job.title)
                                    }
                                  >
                                    {action.label}
                                  </button>
                                ),
                              )}
                            </div>
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
