'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { detailedJob, similarJobs } from '../data.js';

const CompanySidebar = ({ job = detailedJob }) => {
  const [isShortlisted, setIsShortlisted] = useState(false);

  const formatHourlyPrice = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.includes('$') ? text : `$${text}`;
  };

  return (
    <>
      {/* ── Company Card ─────────────────────────────────── */}
      <div className="sidebar-border employer-cv-surface-card">
        <div className="sidebar-heading">
          <div className="avatar-sidebar">
            <figure>
              <img alt="jobBox" src={job.avatar} />
            </figure>
            <div className="sidebar-info">
              <span className="sidebar-company">{job.companyFull}</span>
              <span className="card-location">
                <i className="fa-solid fa-location-dot mr-5" style={{ color: 'var(--color-brand-1)' }}></i>
                {job.location}
              </span>
              <a className="link-underline mt-15" href="#">
                <i className="fa-solid fa-briefcase mr-5"></i>
                {job.openJobs} Open Jobs
              </a>
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
            {similarJobs.map((job) => (
              <li key={job.id}>
                <div className="card-list-4 hover-up">
                  <div className="image">
                    <Link href={job.jobId ? `/job-details?jobId=${job.jobId}` : '/job-details'}>
                      <img src={job.img} alt="jobBox" />
                    </Link>
                  </div>
                  <div className="info-text">
                    <h5 className="font-md font-bold color-brand-1">
                      <Link href={job.jobId ? `/job-details?jobId=${job.jobId}` : '/job-details'}>{job.title}</Link>
                    </h5>
                    <div className="mt-0">
                      <span className="card-briefcase">
                        <i className="fa-solid fa-briefcase mr-3" style={{ fontSize: '10px' }}></i>
                        {job.type}
                      </span>
                      <span className="card-time">
                        <i className="fa-regular fa-clock mr-3" style={{ fontSize: '10px' }}></i>
                        {job.time.split(' ')[0]} <span>{job.time.split(' ')[1]} ago</span>
                      </span>
                    </div>
                    <div className="mt-5">
                      <div className="row">
                        <div className="col-6">
                          <h6 className="card-price">
                            <i className="fa-solid fa-indian-rupee-sign mr-2" style={{ fontSize: '11px' }}></i>
                            {formatHourlyPrice(job.price)}<span>/Hour</span>
                          </h6>
                        </div>
                        <div className="col-6 text-end">
                          <span className="card-briefcase">
                            <i className="fa-solid fa-location-dot mr-3" style={{ fontSize: '10px' }}></i>
                            {job.location}
                          </span>
                        </div>
                      </div>
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
