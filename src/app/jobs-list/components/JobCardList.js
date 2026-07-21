"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllJobs } from "@/services/candidate/allJobsService";


const COMPANY_RELATED_TAGS = new Set([
  "Verified Employer",
  "Licensed Contractor",
  "IMO Certified",
  "ISO Approved",
  "Urgent Hiring",
  "Passport Required",
]);

const COMPANY_BADGE_BY_POSTED_BY = {
  Company: "Verified Employer",
  Recruiter: "Recruiter Managed",
  Consultant: "Consultant Managed",
};

const toSafeTags = (value) =>
  Array.isArray(value) ? value.filter((tag) => Boolean(tag)) : [];

const getJobDetailsHref = (jobId) =>
  jobId ? `/job-details?jobId=${jobId}` : "/job-details";

const JobCardList = ({ job, onApplyNow, viewMode = "list", isApplied = false }) => {
  const router = useRouter();
  const tags = toSafeTags(job.skills);
  const companyTagsFromData = toSafeTags(job.companyTags);
  const jobTagsFromData = toSafeTags(job.jobTags);
  const derivedCompanyBadge = COMPANY_BADGE_BY_POSTED_BY[job.postedBy];
  const isConfidential = job.companyVisibility === "HideName";

  console.log(job.companyVisibility);
  console.log(job);
  const companyTags =
    companyTagsFromData.length > 0
      ? companyTagsFromData
      : [
        ...tags.filter((tag) => COMPANY_RELATED_TAGS.has(tag)),
        ...(derivedCompanyBadge && !tags.includes(derivedCompanyBadge)
          ? [derivedCompanyBadge]
          : []),
      ].slice(0, 4);

  const jobTags =
    jobTagsFromData.length > 0
      ? jobTagsFromData
      : tags.filter((tag) => !COMPANY_RELATED_TAGS.has(tag));
// console.log("job =", job);
// console.log("companyVisibility =", job.companyVisibility);
// console.log("isConfidential =", job.companyVisibility === "HideName");

const getDisplaySalary = (salaryRange, salaryVisibility) => {
  if (!salaryRange) return "";

  switch (salaryVisibility) {
    case "Show Range":
    case "Show_Range":
      return salaryRange;

    case "Show Min Only":
      return salaryRange.includes("-")
        ? salaryRange.split("-")[0].trim()
        : salaryRange;

    case "Show Max Only":
      return salaryRange.includes("-")
        ? salaryRange.split("-")[1].trim()
        : salaryRange;

    case "Negotiable":
      return "Negotiable";

    default:
      return salaryRange;
  }
};
const formatTimeAgo = (timeAgo) => {
  if (!timeAgo) return "Recently Posted";

  return timeAgo
    .replace(" day(s)", timeAgo.startsWith("1 ") ? " day" : " days")
    .replace(" hour(s)", timeAgo.startsWith("1 ") ? " hour" : " hours")
    .replace(" minute(s)", timeAgo.startsWith("1 ") ? " minute" : " minutes");
};
  return (
    <>
      <div
        className="card-grid-2 hover-up"
        onClick={() => router.push(getJobDetailsHref(job.jobId))}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(getJobDetailsHref(job.jobId));
          }
        }}
        style={{
          border: "1px solid rgba(18, 35, 89, 0.08)",
          borderRadius: "24px",
          overflow: "hidden",
          transition: "all 0.35s ease",
          background: "#ffffff",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
          ...(viewMode === "grid"
            ? { height: "100%", display: "flex", flexDirection: "column", width: "100%" }
            : {}),
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform =
            "translateY(-8px)";

          e.currentTarget.style.border =
            "1px solid rgba(255, 153, 0, 0.22)";

          e.currentTarget.style.boxShadow =
            "0 20px 40px rgba(255,153,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform =
            "translateY(0px)";

          e.currentTarget.style.border =
            "1px solid rgba(18, 35, 89, 0.08)";

          e.currentTarget.style.boxShadow =
            "0 4px 14px rgba(18,35,89,0.04)";
        }}
      >
        <div className="row">
          <div className={viewMode === "grid" ? "col-12" : "col-lg-6 col-md-6 col-sm-12"}>
            <div className="card-grid-2-image-left">
              <div className="image-box">
                <img
                  style={{
                    width: "54px",
                    height: "54px",
                    objectFit: "contain",
                    background: "#fff",
                    borderRadius: "8px",
                    padding: "4px",
                  }}
                  src={
                    isConfidential
                      ? "/assets/imgs/page/job-single/industry.svg"
                      : job.companyLogoUrl || "/assets/imgs/brands/brand-10.png"
                  }
                  alt="jobBox"
                />
              </div>
              <div className="right-info" style={{ minWidth: 0, flex: 1 }}>
                {isConfidential ? (
                  <span
                    className="name-job"
                    style={{
                      cursor: "default",
                      pointerEvents: "none",
                      textDecoration: "none",
                      color: "inherit",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                      maxWidth: "100%",
                    }}
                    title="Confidential Company"
                  >
                    Confidential Company
                  </span>
                ) : (
                  <Link
                    className="name-job"
                    href={`/company-details?employerId=${job.employerId}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                      maxWidth: "100%",
                    }}
                    title={job.companyName}
                  >
                    {job.companyName}
                  </Link>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "3px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#98A2B3",
                      ...(viewMode === "grid"
                        ? {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "130px",
                          }
                        : {}),
                    }}
                    title={job.jobLocation}
                  >
                    <i
                      className="fi-rr-marker"
                      style={{
                        fontSize: "11px",
                        color: "#98A2B3",
                        flexShrink: 0,
                      }}
                    ></i>

                    <span
                      style={
                        viewMode === "grid"
                          ? {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }
                          : undefined
                      }
                    >
                      {job.jobLocation}
                    </span>
                  </span>

                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#98A2B3",
                      fontWeight: 500,
                    }}
                  >
                    <i
                      className="fi-rr-clock"
                      style={{
                        fontSize: "11px",
                      }}
                    ></i>

                    {formatTimeAgo(job.timeAgo)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={viewMode === "grid" ? "col-12 text-start pl-25 pr-25 mt-10" : "col-lg-6 text-start text-md-end pr-60 col-md-6 col-sm-12"}>
            {companyTags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: viewMode === "grid" ? "flex-start" : "flex-end",
                  gap: 8,
                  marginTop: viewMode === "grid" ? 4 : 24,
                  marginBottom: 14,
                }}
              >
                {companyTags.map((tag, index) => (
                  <span
                    key={`company-tag-${job.jobId}-${index}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "#EAF4FF",
                      border: "1px solid #B9DCFF",
                      color: "#1D4ED8",
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1,
                      transition: "all 0.25s ease",
                      cursor: "pointer",
                      maxWidth: viewMode === "grid" ? "160px" : "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={tag}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#1D4ED8";
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#EAF4FF";
                      e.currentTarget.style.color = "#1D4ED8";
                      e.currentTarget.style.transform = "translateY(0px)";
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className="card-block-info"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 6,
            }}
          >
            {/* JOB TITLE */}
            <h4
              style={{
                margin: 0,
                lineHeight: 1.3,
                ...(viewMode === "grid"
                  ? {
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }
                  : {}),
              }}
              title={job.jobTitle}
            >
              <Link
                href={getJobDetailsHref(job.jobId)}
                onClick={(e) => e.stopPropagation()}
                style={
                  viewMode === "grid"
                    ? {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        maxWidth: "100%",
                      }
                    : undefined
                }
              >
                {job.jobTitle}
              </Link>
            </h4>

            {/* AI MATCH (only when a real per-candidate score exists) */}
            {(job.aiMatchPercentage ?? job.matchPercentage ?? job.aiMatch ?? job.aiMatchScore) != null && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, #fff4df 0%, #ffe7ba 100%)",
                  border:
                    "1px solid rgba(255, 163, 0, 0.22)",
                  color: "#ff9900",
                  fontSize: 12,
                  fontWeight: 700,
                  width: "fit-content",
                  boxShadow:
                    "0 6px 16px rgba(255,153,0,0.08)",
                }}
              >
                <i
                  className="fa-solid fa-wand-magic-sparkles"
                  style={{
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                ></i>

                AI Match: {job.aiMatchPercentage ?? job.matchPercentage ?? job.aiMatch ?? job.aiMatchScore}%
              </div>
            )}
          </div>
          <div className="mt-5" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {job.tradeCategory && (
              <span
                className="card-briefcase"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#F1F5FF",
                  color: "#3B4CCA",
                  fontSize: 12,
                  fontWeight: 600,
                  maxWidth: viewMode === "grid" ? "180px" : "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={
                  job.tradeCategory?.toLowerCase() === "other" || job.tradeCategory?.toLowerCase() === "othere"
                    ? (job.role || job.department || "Other / Specialisation")
                    : (job.role ? `${job.tradeCategory} • ${job.role}` : job.tradeCategory)
                }
              >
                {job.tradeCategory?.toLowerCase() === "other" || job.tradeCategory?.toLowerCase() === "othere"
                  ? (job.role || job.department || "Other / Specialisation")
                  : (job.role ? `${job.tradeCategory} • ${job.role}` : job.tradeCategory)}
              </span>
            )}

            {job.employmentMode && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#FFF3E0",
                  color: "#B15C00",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {job.employmentMode}
              </span>
            )}

            {job.employmentType && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#F0FBF3",
                  color: "#178A4C",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {job.employmentType.replace(/_/g, " ")}
              </span>
            )}

            {job.department && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#F5F0FF",
                  color: "#6B21A8",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {job.department}
              </span>
            )}


          </div>
          <p
            className="font-sm color-text-paragraph mt-10"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: viewMode === "grid" ? 2 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: viewMode === "grid" ? "42px" : "auto",
              marginBottom: "10px",
            }}
          >
            {job.description}
          </p>

          <div className="mt-5 mb-10" style={{ fontSize: "12px", color: "#64748B" }}>
            <span>Openings: <strong style={{ color: "#1E293B" }}>{job.vacancies || 1}</strong></span>
            {job.experienceDisplay && (
              <>
                <span style={{ margin: "0 8px" }}>•</span>
                <span>Experience: <strong style={{ color: "#1E293B" }}>{job.experienceDisplay}</strong></span>
              </>
            )}
          </div>

          {viewMode === "list" && jobTags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 6,
                marginBottom: 12,
              }}
            >
              {jobTags.map((tag, index) => (
                <span
                  key={`job-tag-${job.jobId}-${index}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "#F3FFF5",
                    border: "1px solid #B7E8C2",
                    color: "#15803D",
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="card-2-bottom mt-20"
            style={{ marginTop: "auto" }}
          >
            <div className="row">
              <div className="col-lg-7 col-7">
              <span className="card-text-price">
  {getDisplaySalary(job.salaryRange, job.salaryVisibility)}
</span>
              </div>
              <div className="col-lg-5 col-5 text-end">
                {isApplied ? (
                  <button
                    type="button"
                    className="btn btn-apply-now"
                    disabled
                    style={{
                      color: "#ffffff",
                      opacity: 0.6,
                      cursor: "default",
                      pointerEvents: "none",
                    }}
                    aria-disabled="true"
                  >
                    Applied
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-apply-now"
                    style={{ color: "#ffffff" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyNow?.(job);
                    }}
                  >
                    Apply now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobCardList;