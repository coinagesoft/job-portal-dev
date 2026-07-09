'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { getAllJobs } from '@/services/candidate/allJobsService';

const CompanySidebar = ({ job = {} }) => {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  const humanize = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'string') return value;
    return value.replace(/_/g, ' ');
  };

  const isConfidential =
    job.companyVisibility === "HideName";

  const formatHourlyPrice = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.includes('$') ? text : `$${text}`;
  };
  useEffect(() => {
    const loadSimilarJobs = async () => {
      try {
        const response = await getAllJobs();

        const jobs = response.data || [];

        const filteredJobs = jobs
          .filter((item) => item.jobId !== job.jobId)
          .slice(0, 5);

        setSimilarJobs(filteredJobs);
      } catch (error) {
        console.error(
          "Failed to load similar jobs",
          error
        );
      }
    };

    loadSimilarJobs();
  }, [job.jobId]);
  return (
    <>
      {/* ── Company Card ─────────────────────────────────── */}
      <div className="sidebar-border employer-cv-surface-card">
        <div className="sidebar-heading">
          <div className="avatar-sidebar">
            <figure>
              <img
                alt="jobBox"
                src={
                  isConfidential
                    ? "/assets/imgs/page/job-single/industry.svg"
                    : job.companyLogoUrl || "/assets/imgs/page/homepage1/img1.png"
                }
                  style={{
    width: "54px",
    height: "54px",
    objectFit: "cover",
    // borderRadius: "8px",
    // border: "1px solid rgba(18, 35, 89, 0.08)",
  }}
              />
            </figure>
            <div className="sidebar-info">
              {job.companyFull && (
                <span className="sidebar-company">
                  {isConfidential
                    ? "Confidential Company"
                    : job.companyFull || job.companyName}
                </span>
              )}
              {job.location && (
                <span className="card-location">
                  {/* <i className="fa-solid fa-location-dot mr-5" style={{ color: 'var(--color-brand-1)' }}></i> */}
                  {job.location}
                </span>
              )}
              {job.openJobs != null && (
                <a className="link-underline mt-15" href="#">
                  <i className="fa-solid fa-briefcase mr-5"></i>
                  {job.openJobs} Open Jobs
                </a>
              )}
            </div>
          </div>
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
                    <div className="mt-5">
                      <h6 className="card-price mb-0">
                        {item.salaryRange || 'Confidential'}
                      </h6>
                    </div>
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