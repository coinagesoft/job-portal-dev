"use client";
import React from "react";
import Link from "next/link";

const JobCardList = ({ job, onApplyNow, viewMode = "list" }) => {
  const formatHourlyPrice = (value) => {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.includes("$") ? text : `$${text}`;
  };

  return (
    <>
      <div
  className="card-grid-2 hover-up"
  style={{
    border: "1px solid rgba(18, 35, 89, 0.08)",
    borderRadius: "24px",
    overflow: "hidden",
    transition: "all 0.35s ease",
    background: "#ffffff",
    boxShadow:
      "0 4px 14px rgba(18,35,89,0.04)",
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
        {/* <span className="flash"></span> */}
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="card-grid-2-image-left">
              <div className="image-box">
                <img src={job.img} alt="jobBox" />
              </div>
              <div className="right-info">
                <Link className="name-job" href="/company-details">
                  {job.company}
                </Link>
                <span className="location-small">{job.location}</span>
              </div>
            </div>
          </div>
          <div className="col-lg-6 text-start text-md-end pr-60 col-md-6 col-sm-12">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 24,
                marginBottom: 14,
              }}
            >
              {job.tags.map((tag, index) => (
                <span
                  key={index}
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
                  }}
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
          </div>
        </div>
        <div className="card-block-info">
          
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
    }}
  >
    <Link href="/job-details">
      {job.title}
    </Link>
  </h4>

  {/* AI MATCH */}
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

    AI Match: {job.aiMatch || 85}%
  </div>
</div>
          <div className="mt-5">
            <span className="card-briefcase">{job.type}</span>
            <span className="card-time">
              <span>{job.time.split(" ")[0]}</span>
              <span>{job.time.split(" ")[1]} ago</span>
            </span>
          </div>
          <p className="font-sm color-text-paragraph mt-10">{job.desc}</p>
          {viewMode === "list" && (
            <div className="mt-10">
              <span className="font-xs color-text-paragraph-2">
                Openings: <strong>{job.openings || 1}</strong> - Experience:{" "}
                <strong>{job.experience}</strong>
              </span>
            </div>
          )}
          <div className="card-2-bottom mt-20">
            <div className="row">
              <div className="col-lg-7 col-7">
                <span className="card-text-price">
                  {formatHourlyPrice(job.price)}
                </span>
                <span className="text-muted">/Hour</span>
              </div>
              <div className="col-lg-5 col-5 text-end">
                <button
                  type="button"
                  className="btn btn-apply-now"
                  style={{ color: "#ffffff" }}
                  onClick={() => onApplyNow?.(job)}
                >
                  Apply now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobCardList;
