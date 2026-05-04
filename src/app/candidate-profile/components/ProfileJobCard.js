'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";

const ProfileJobCard = ({ job, isListView, applyToDetails = false }) => {
  const formatSalary = (value) => {
    const text = String(value || "").replace(/INR|\u20B9/gi, "").trim();
    if (!text) return "";
    return text.includes("$") ? text : `$${text}`;
  };

  const displayPrice = formatSalary(job.price);

  return (
    <div
      className={`card-grid-2 hover-up${isListView ? "" : " no-padding"}${applyToDetails ? " candidate-saved-job-card" : ""}`}
    >
      {!applyToDetails && <span className="flash"></span>}
      <div className="row">
        <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="card-grid-2-image-left">
            <div className="image-box">
              <Image 
                src={job.logo} 
                alt={job.company || "Company logo"} 
                width={52} 
                height={52}
                className="candidate-job-logo"
                style={{ width: "52px", height: "52px", objectFit: "contain" }}
              />
            </div>
            <div className="right-info">
              <Link className="name-job" href="/company-details">
                {job.company}
              </Link>
              <span className="location-small">{job.location}</span>
            </div>
          </div>
        </div>
        {!isListView && (
          <div className="col-lg-6 text-start text-md-end pr-60 col-md-6 col-sm-12">
            <div className="pl-15 mb-15 mt-30">
              {job.tags.slice(0, 2).map((tag, index) => (
                <a key={index} className="btn btn-grey-small mr-5" href="#">
                  {tag}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={`card-block-info${applyToDetails ? " candidate-saved-job-card-info" : ""}`}>
        <h4>
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
        <p className="font-sm color-text-paragraph mt-10">
          {job.description}
        </p>
        <div className={`card-2-bottom mt-20${isListView ? " mt-30" : " mt-30"}`}>
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
                <Link className="btn btn-apply-now" href="/job-details">
                  Apply now
                </Link>
              ) : (
                <div
                  className="btn btn-apply-now"
                  data-bs-toggle="modal"
                  data-bs-target="#ModalApplyJobForm"
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
