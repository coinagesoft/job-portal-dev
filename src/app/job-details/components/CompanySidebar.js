'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { detailedJob, similarJobs, mapEmbed } from '../data.js';

const CompanySidebar = () => {
  const [isShortlisted, setIsShortlisted] = useState(false);

  const formatHourlyPrice = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.includes('$') ? text : `$${text}`;
  };

  return (
    <>
      {/* ── Company Card ─────────────────────────────────── */}
      <div className="sidebar-border">
        <div className="sidebar-heading">
          <div className="avatar-sidebar">
            <figure>
              <img alt="jobBox" src={detailedJob.avatar} />
            </figure>
            <div className="sidebar-info">
              <span className="sidebar-company">{detailedJob.companyFull}</span>
              <span className="card-location">
                <i className="fa-solid fa-location-dot mr-5" style={{ color: 'var(--color-brand-1)' }}></i>
                {detailedJob.location}
              </span>
              <a className="link-underline mt-15" href="#">
                <i className="fa-solid fa-briefcase mr-5"></i>
                {detailedJob.openJobs} Open Jobs
              </a>
            </div>
          </div>
        </div>

        {/* ── Map & Address block ──────────────────────── */}
        <div className="sidebar-list-job">
          {isShortlisted ? (
            <>
              {/* Map iframe */}
              <div className="box-map" style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                <iframe
                  src={mapEmbed}
                  width="100%"
                  height="200"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Company Location"
                />
              </div>

              {/* Contact details */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: 'var(--font-xs)', color: 'var(--color-text-paragraph)' }}>
                  <i className="fa-solid fa-location-dot mt-2" style={{ color: 'var(--color-brand-1)', minWidth: '14px', marginTop: '2px' }}></i>
                  <span>{detailedJob.address}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-xs)', color: 'var(--color-text-paragraph)' }}>
                  <i className="fa-solid fa-phone" style={{ color: 'var(--color-brand-1)', minWidth: '14px' }}></i>
                  <span>{detailedJob.phone}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-xs)', color: 'var(--color-text-paragraph)' }}>
                  <i className="fa-solid fa-envelope" style={{ color: 'var(--color-brand-1)', minWidth: '14px' }}></i>
                  <span>{detailedJob.email}</span>
                </li>
                {detailedJob.endClientName && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-xs)', color: 'var(--color-text-paragraph)' }}>
                    <i className="fa-solid fa-building" style={{ color: 'var(--color-brand-1)', minWidth: '14px' }}></i>
                    <span><strong>End Client:</strong> {detailedJob.endClientName}</span>
                  </li>
                )}
              </ul>

              {/* Shortlisted confirmation banner */}
              <div style={{
                background: '#e6f4ea',
                border: '1px solid #a7d7b0',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'var(--font-xs)',
                color: '#1a7a3c',
                fontWeight: 600,
              }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '14px' }}></i>
                You are shortlisted — full address &amp; map now visible
              </div>
            </>
          ) : (
            /* Hidden state */
            <div style={{
              textAlign: 'center',
              padding: '28px 20px',
              background: '#f9fafb',
              border: '1.5px dashed #d1d5db',
              borderRadius: '10px',
            }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '50%',
                background: '#e9ecf3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: '22px', color: '#8a96b0' }}></i>
              </div>
              <p style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: '#122359', margin: '0 0 6px' }}>
                Location &amp; Address Hidden
              </p>
              <p style={{ fontSize: 'var(--font-xs)', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                Company address and map will be revealed once you are shortlisted for this role.
              </p>
              <div style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: 'var(--font-xs)',
                color: '#f59e0b',
                fontWeight: 600,
              }}>
                <i className="fa-solid fa-lock" style={{ fontSize: '12px' }}></i>
                Unlocks after shortlisting
              </div>
            </div>
          )}
        </div>

        {/* ── Demo toggle ───────────────────────────────── */}
        <div style={{ padding: '12px 0 4px' }}>
          <button
            type="button"
            className={`btn btn-sm w-100 ${isShortlisted ? 'btn-border' : 'btn-default'}`}
            style={{ fontSize: 'var(--font-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            onClick={() => setIsShortlisted((v) => !v)}
          >
            <i className={`fa-solid ${isShortlisted ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            {isShortlisted ? 'Simulate: Not Shortlisted' : 'Simulate: Shortlisted'}
          </button>
          <p className="font-xs color-text-paragraph-2 text-center mt-5 mb-0">
            Demo toggle — address reveals on shortlist
          </p>
        </div>
      </div>

      {/* ── Similar Jobs ──────────────────────────────────── */}
      <div className="sidebar-border">
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
                    <Link href="/job-details">
                      <img src={job.img} alt="jobBox" />
                    </Link>
                  </div>
                  <div className="info-text">
                    <h5 className="font-md font-bold color-brand-1">
                      <Link href="/job-details">{job.title}</Link>
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