'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';
import { detailedJob } from '../data.js';

import { saveJob } from "@/services/candidate/savedJobsService";
import { useToast } from "@/components/Toast";

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

const JobContent = ({ job = detailedJob }) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  const showToast = useToast();
  const candidateId = useSelector((state) => state.auth.user?.userId);

  const handleSaveJob = async () => {
    try {
      const jobId = job.jobId;

      if (!jobId) {
        showToast(
          "Job id is missing. Please open this job from the jobs list.",
          "error"
        );
        return;
      }

      if (!candidateId) {
        showToast(
          "Please log in as a candidate to save jobs.",
          "error"
        );
        return;
      }

      const response = await saveJob(
        jobId,
        candidateId
      );

      if (response?.data?.success) {
        showToast(
          response.data.message || "Job saved successfully!",
          "success"
        );
        return;
      }

      showToast(
        response?.data?.message || "Unable to save job",
        "error"
      );
    } catch (error) {
  console.log("ERROR RESPONSE:", error.response);
  console.log("ERROR DATA:", error.response?.data);

  showToast(
    error.response?.data?.message ||
    error.message ||
    "Failed to save job",
    "error"
  );
}
  };

  const verifications = job.verifications || {};
  const hasAnyVerification = Object.values(verifications).some(Boolean);

  return (
    <div className="content-single">
      {/* Company Verification Checks */}
      {hasAnyVerification && (
        <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#f9fafb', borderRadius: '16px', border: '1px solid rgba(18,35,89,0.06)', boxShadow: '0 4px 14px rgba(18,35,89,0.04)' }}>
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

      <div className="job-content">

  {/* Job Description */}
  <h5>Job Description</h5>
  <p style={{ whiteSpace: "pre-line" }}>
    {job.jobDescription}
  </p>

  {/* Key Responsibilities */}
  {job.keyResponsibilities?.length > 0 && (
    <>
      <h5 className="mt-4">Key Responsibilities</h5>
      <ul>
        {job.keyResponsibilities.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </>
  )}

  {/* Professional Skills */}
  {job.professionalSkills?.length > 0 && (
    <>
      <h5 className="mt-4">Professional Skills</h5>
      <ul>
        {job.professionalSkills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </>
  )}

  {/* Perks & Benefits */}
  {job.perksAndBenefits?.length > 0 && (
    <>
      <h5 className="mt-4">Perks & Benefits</h5>
      <ul>
        {job.perksAndBenefits.map((perk, index) => (
          <li key={index}>{perk}</li>
        ))}
      </ul>
    </>
  )}

</div>
      <div className="author-single">
        <span>{job.companyName}</span>
      </div>
      <div className="single-apply-jobs">
        <div className="row align-items-center">
          <div className="col-md-5">
            <a className="btn btn-default mr-15" href="#" onClick={(event) => {
              event.preventDefault();
              toggleModal();
            }}>Apply now</a>
      
            <button
              type="button" 
              className="btn btn-border"
              onClick={handleSaveJob}
            >
              Save job
            </button>
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
      <ApplyJobModal showModal={showModal} setShowModal={setShowModal} job={job} />
    </div>
  );
};

export default JobContent;
