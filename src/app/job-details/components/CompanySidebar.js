'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { getAllJobs } from '@/services/candidate/allJobsService';

const CompanySidebar = ({ job = {} }) => {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  const [companyId, setCompanyId] = useState(null);
  const [employerId, setEmployerId] = useState(job.employerId || null);

  const isConfidential =
    job.companyVisibility === "HideName" ||
    String(job.companyName || "").toLowerCase().includes("confidential") ||
    String(job.companyFull || "").toLowerCase().includes("confidential") ||
    String(job.company || "").toLowerCase().includes("confidential");

  const companyDisplayName = isConfidential
    ? "Confidential Company"
    : (job.companyName || job.companyFull || job.company || "");

  const canNavigate = !isConfidential && Boolean(employerId);

  const humanize = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'string') return value;
    return value.replace(/_/g, ' ');
  };

  const formatHourlyPrice = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.includes('$') ? text : `$${text}`;
  };

  useEffect(() => {
    if (job.employerId) {
      setEmployerId(job.employerId);
    }
  }, [job.employerId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getAllJobs();
        const jobs = response.data || [];

        // Find the current job
        const currentJob = jobs.find(
          (item) => item.jobId === job.jobId
        );

        if (currentJob) {
          setCompanyId(currentJob.companyId);
          if (!job.employerId) {
            setEmployerId(currentJob.employerId || null);
          }
        }

        // Similar jobs
        const filteredJobs = jobs
          .filter((item) => item.jobId !== job.jobId)
          .slice(0, 5);

        setSimilarJobs(filteredJobs);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [job.jobId]);

  return (
    <>
      {/* ── Company Card ─────────────────────────────────── */}
      <div className="sidebar-border employer-cv-surface-card">
        <div className="sidebar-heading">
          {canNavigate ? (
            <Link
              href={`/company-details?employerId=${employerId}`}
              className="avatar-sidebar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              <figure style={{ flexShrink: 0, margin: 0 }}>
                <img
                  alt="jobBox"
                  src={
                    job.companyLogoUrl || "/assets/imgs/page/homepage1/img1.png"
                  }
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </figure>
              <div className="sidebar-info" style={{ minWidth: 0, flex: 1, paddingLeft: 0 }}>
                {companyDisplayName && (
                  <span
                    className="sidebar-company"
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                    title={companyDisplayName}
                  >
                    {companyDisplayName}
                  </span>
                )}
                {job.location && (
                  <span
                    className="card-location"
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    {job.location}
                  </span>
                )}
                {job.openJobs != null && (
                  <span className="link-underline mt-15">
                    <i className="fa-solid fa-briefcase mr-5"></i>
                    {job.openJobs} Open Jobs
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div
              className="avatar-sidebar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'default',
              }}
            >
              <figure style={{ flexShrink: 0, margin: 0 }}>
                <img
                  alt="jobBox"
                  src={
                    isConfidential
                      ? "/assets/imgs/page/job-single/industry.svg"
                      : job.companyLogoUrl || "/assets/imgs/page/homepage1/img1.png"
                  }
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: isConfidential ? "contain" : "cover",
                    borderRadius: "8px",
                  }}
                />
              </figure>
              <div className="sidebar-info" style={{ minWidth: 0, flex: 1, paddingLeft: 0 }}>
                {companyDisplayName && (
                  <span
                    className="sidebar-company"
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                    title={companyDisplayName}
                  >
                    {companyDisplayName}
                  </span>
                )}
                {job.location && (
                  <span
                    className="card-location"
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    {job.location}
                  </span>
                )}
                {job.openJobs != null && (
                  <span className="link-underline mt-15">
                    <i className="fa-solid fa-briefcase mr-5"></i>
                    {job.openJobs} Open Jobs
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Similar Jobs ──────────────────────────────────── */}
      <div className="sidebar-border employer-cv-surface-card">
        <h6 className="f-18" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-clone" style={{ color: 'var(--color-brand-1)', fontSize: '15px' }}></i>
          Similar Jobs
        </h6>
        <div className="sidebar-list-job">
          <ul>
            {similarJobs.map((item) => (
              <li key={item.jobId}>
                <div
                  className="card-list-4 hover-up"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div
                    className="image"
                    style={{
                      flex: '0 0 auto',
                      width: '48px',
                      height: '48px',
                    }}
                  >
                    <Link href={`/job-details?jobId=${item.jobId}`}>
                      <img
                        src={
                          item.companyLogoUrl ||
                          "/assets/imgs/page/homepage1/img1.png"
                        }
                        alt="jobBox"
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid rgba(18, 35, 89, 0.08)',
                        }}
                      />
                    </Link>
                  </div>

                  <div className="info-text" style={{ flex: '1 1 auto', minWidth: 0 }}>
                    {/* Job Title + Time Ago */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <h5
                        className="font-md font-bold color-brand-1"
                        style={{
                          marginBottom: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        <Link href={`/job-details?jobId=${item.jobId}`}>
                          {item.jobTitle}
                        </Link>
                      </h5>

                      <span
                        className="card-time"
                        style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {item.timeAgo || 'Recently'}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="mt-5">
                      <span className="card-briefcase">
                        {item.companyLocation}
                      </span>
                    </div>

                    {/* Salary */}
                    {!(item.salaryVisibility === "Hide Salary" || item.salaryVisibility === "Hide_Salary" || item.salaryDisplayOption === "Hide Salary" || item.salaryDisplayOption === "Hide_Salary") && (
                      <div className="mt-5">
                        <h6 className="card-price mb-0">
                          {item.salaryRange || 'Confidential'}
                        </h6>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CompanySidebar;