'use client';
import React, { useState } from 'react';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';
import { detailedJob } from '../data.js';

const verificationBadges = [
  { key: 'gst', label: '✔ GST Verified', style: { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' } },
  { key: 'recruitmentLicense', label: '✔ Recruitment Licensed', style: { background: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' } },
  { key: 'overseas', label: '🌐 Overseas Verified', style: { background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' } },
  { key: 'backgroundCheck', label: '✔ Background Checked', style: { background: '#f3e8ff', color: '#6d28d9', border: '1px solid #c4b5fd' } },
];

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 9px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 600,
  marginRight: '6px',
  marginBottom: '6px',
};

const JobContent = () => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  const verifications = detailedJob.verifications || {};
  const hasAnyVerification = Object.values(verifications).some(Boolean);

  return (
    <div className="content-single">
      {/* Company Verification Checks */}
      {hasAnyVerification && (
        <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#122359' }}>Company Verification</span>
            {/* AI Matching Badge */}
            <span title="AI-matched for your profile" style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d',
              padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 700
            }}>
              <i className="fi fi-sr-bolt" style={{ fontSize: '11px' }}></i> AI Matched
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {verificationBadges.map(({ key, label, style }) =>
              verifications[key] ? (
                <span key={key} style={{ ...badgeStyle, ...style }}>{label}</span>
              ) : null
            )}
          </div>
        </div>
      )}

      <div dangerouslySetInnerHTML={{ __html: detailedJob.description }} />
      <div className="author-single">
        <span>{detailedJob.companyFull}</span>
      </div>
      <div className="single-apply-jobs">
        <div className="row align-items-center">
          <div className="col-md-5">
            <a className="btn btn-default mr-15" href="#" onClick={(event) => {
              event.preventDefault();
              toggleModal();
            }}>Apply now</a>
            <a className="btn btn-border" href="#">Save job</a>
          </div>
          <div className="col-md-7 text-lg-end social-share">
            <h6 className="color-text-paragraph-2 d-inline-block d-baseline mr-10">Share this</h6>
            <a className="mr-5 d-inline-block d-middle" href="#"><img alt="jobBox" src="/assets/imgs/template/icons/share-fb.svg" /></a>
            <a className="mr-5 d-inline-block d-middle" href="#"><img alt="jobBox" src="/assets/imgs/template/icons/share-tw.svg" /></a>
            <a className="mr-5 d-inline-block d-middle" href="#"><img alt="jobBox" src="/assets/imgs/template/icons/share-red.svg" /></a>
            <a className="d-inline-block d-middle" href="#"><img alt="jobBox" src="/assets/imgs/template/icons/share-whatsapp.svg" /></a>
          </div>
        </div>
      </div>
      <ApplyJobModal showModal={showModal} setShowModal={setShowModal} job={detailedJob} />
    </div>
  );
};

export default JobContent;
