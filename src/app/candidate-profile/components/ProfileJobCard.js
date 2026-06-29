'use client';
import React from "react";
// import Image from "next/image";
import Link from "next/link";

const JOB_LIST_CARD_STYLE = {
  border: "1px solid rgba(18, 35, 89, 0.08)",
  borderRadius: "24px",
  overflow: "hidden",
  transition: "all 0.35s ease",
  background: "#ffffff",
  boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
  minHeight: "350px", // Add this
  display: "flex",
  flexDirection: "column",
};

const JOB_LIST_TAG_WRAP_STYLE = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 24,
  marginBottom: 14
};

const JOB_LIST_TAG_STYLE = {
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
  whiteSpace: "nowrap",
  lineHeight: 1,
  transition: "all 0.25s ease",
  cursor: "pointer"
};

const SAVED_JOB_ACTION_BUTTON_STYLE = {
  color: "#ffffff",
  background: "#ff9900",
  border: "1px solid #ff9900",
  transition: "all 0.25s ease"
};

const handleCardHoverEnter = (event) => {
  event.currentTarget.style.transform = "translateY(-8px)";
  event.currentTarget.style.border = "1px solid rgba(255, 153, 0, 0.22)";
  event.currentTarget.style.boxShadow = "0 20px 40px rgba(255,153,0,0.12)";
};

const handleCardHoverLeave = (event) => {
  event.currentTarget.style.transform = "translateY(0px)";
  event.currentTarget.style.border = "1px solid rgba(18, 35, 89, 0.08)";
  event.currentTarget.style.boxShadow = "0 4px 14px rgba(18,35,89,0.04)";
};

const handleTagHoverEnter = (event) => {
  event.currentTarget.style.background = "#1D4ED8";
  event.currentTarget.style.color = "#ffffff";
  event.currentTarget.style.transform = "translateY(-1px)";
};

const handleTagHoverLeave = (event) => {
  event.currentTarget.style.background = "#EAF4FF";
  event.currentTarget.style.color = "#1D4ED8";
  event.currentTarget.style.transform = "translateY(0px)";
};

const handleSavedJobButtonHoverEnter = (event) => {
  event.currentTarget.style.background = "#e68f00";
  event.currentTarget.style.border = "1px solid #e68f00";
  event.currentTarget.style.transform = "translateY(-1px)";
  event.currentTarget.style.boxShadow = "0 8px 18px rgba(255,153,0,0.22)";
};

const handleSavedJobButtonHoverLeave = (event) => {
  event.currentTarget.style.background = "#ff9900";
  event.currentTarget.style.border = "1px solid #ff9900";
  event.currentTarget.style.transform = "translateY(0px)";
  event.currentTarget.style.boxShadow = "none";
};

const ProfileJobCard = ({ job, isListView, applyToDetails = false }) => {
  const formatSalary = (value) => {
    if (!value) return "";

    if (
      value.toLowerCase() === "confidential"
    ) {
      return "Confidential";
    }

    const text = String(value)
      .replace(/INR|\u20B9/gi, "")
      .trim();

    return text.includes("$")
      ? text
      : `₹${text}`;
  };

  const displayPrice = formatSalary(job.price);
  const visibleTags = applyToDetails
    ? (job.tags || []).slice(0, 2)
    : (job.tags || []);

  return (
    <div
      className={`card-grid-2 hover-up${isListView ? "" : " no-padding"}${applyToDetails ? " candidate-saved-job-card" : ""}`}
      style={applyToDetails ? JOB_LIST_CARD_STYLE : undefined}
      onMouseEnter={applyToDetails ? handleCardHoverEnter : undefined}
      onMouseLeave={applyToDetails ? handleCardHoverLeave : undefined}
    >
      {!applyToDetails && <span className="flash"></span>}
      <div className="row">
        <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="card-grid-2-image-left">
            {/* <div className="image-box"> */}
            <div style={{ marginRight: "12px" }}>

              <img
                src={job.logo}
                alt={job.company || "Company logo"}
                width={52}
                height={52}
                className="candidate-job-logo"
                style={{
                  width: "52px",
                  height: "52px",
                  objectFit: "contain"
                }}
              />
            </div>
            <div className="right-info">
              <Link className="name-job" href="/company-details" title={`View ${job.company} details`} data-bs-toggle="tooltip">
                {job.company}
              </Link>
              <span
                className="location-small"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "180px",
                  display: "block",
                }}
              >
                {job.location}
              </span>
            </div>
          </div>
        </div>
        {!isListView && (
          <div
            className={`col-lg-6 text-start text-md-end col-md-6 col-sm-12 ${applyToDetails ? "candidate-saved-job-tags-col" : "pr-60"
              }`}
          >
            <div
              style={applyToDetails ? JOB_LIST_TAG_WRAP_STYLE : undefined}
              className={applyToDetails ? "candidate-saved-job-tags-wrap" : "pl-15 mb-15 mt-30"}
            >
              {visibleTags.map((tag, index) => (
                <span
                  key={index}
                  className={applyToDetails ? undefined : "btn btn-grey-small mr-5"}
                  style={applyToDetails ? JOB_LIST_TAG_STYLE : undefined}
                  title={tag}
                  data-bs-toggle="tooltip"
                  onMouseEnter={applyToDetails ? handleTagHoverEnter : undefined}
                  onMouseLeave={applyToDetails ? handleTagHoverLeave : undefined}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div
        className={`card-block-info${applyToDetails ? " candidate-saved-job-card-info" : ""
          }`}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h4 className={applyToDetails ? "candidate-saved-job-title" : undefined}>
          <Link href="/job-details">{job.title}</Link>
        </h4>
        <div className="mt-5">
          <span className="card-briefcase">{job.type}</span>
          {applyToDetails ? (
            <span className="card-time">
              <span>Experience:</span>
              <span>{job.experience || "0-1 years"}</span>
            </span>
          ) : (
            <span className="card-time">
              <span>{job.time.split(" ")[0]}</span>
              <span>{job.time.split(" ")[1]}</span>
            </span>
          )}
        </div>
        <p
          className="font-sm color-text-paragraph mt-10"
          style={{
            minHeight: "60px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {job.description}
        </p>
        <div
          className={`card-2-bottom mt-20${isListView ? " mt-30" : " mt-30"
            }`}
          style={{ marginTop: "auto" }}
        >
          <div className="row">
            <div className="col-lg-7 col-7">
              {applyToDetails && displayPrice ? (
                <>
                  <span className="card-text-price">{displayPrice}</span>
                  <span className="text-muted">{job.priceUnit || "/month"}</span>
                </>
              ) : null}
            </div>
            <div className="col-lg-5 col-5 text-end">
              {applyToDetails ? (
                <Link
                  className="btn btn-apply-now"
                  style={SAVED_JOB_ACTION_BUTTON_STYLE}
                  href="/job-details"
                  title="View job details"
                  data-bs-toggle="tooltip"
                  onMouseEnter={handleSavedJobButtonHoverEnter}
                  onMouseLeave={handleSavedJobButtonHoverLeave}
                >
                  View Job
                </Link>
              ) : (
                <div
                  className="btn btn-apply-now"
                  data-bs-toggle="modal"
                  data-bs-target="#ModalApplyJobForm"
                  title="Apply to this job"
                >
                  Apply now
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileJobCard;
  