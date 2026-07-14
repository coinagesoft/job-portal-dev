'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';

import { saveJob } from "@/services/candidate/savedJobsService";
import { useToast } from "@/components/Toast";
import { getCompanyDetails } from "@/services/candidate/companyService";

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

// Job descriptions often come as one plain-text blob with inline section
// labels like "Key Responsibilities:", "Requirements:", "What We Offer:"
// and "•" bullet lines. Rendered as a single <p>, those labels look
// identical to normal sentences. This splits the text into headings,
// bullet lists, and paragraphs so the structure the recruiter already
// wrote is actually visible.
const renderJobDescription = (text) => {
  if (!text) return null;

  const headingPattern = /^[A-Za-z][A-Za-z0-9 &/'-]{2,45}:$/;
  const bulletPattern = /^[•\-*]\s*(.*)$/;

  const lines = text.split(/\r?\n/);
  const blocks = [];
  let currentList = [];

  const flushList = (key) => {
    if (currentList.length === 0) return;
    blocks.push(
      <ul key={`list-${key}`} style={{ paddingLeft: '20px', marginBottom: '14px' }}>
        {currentList.map((item, i) => (
          <li key={i} style={{ marginBottom: '6px', lineHeight: 1.6 }}>
            {item}
          </li>
        ))}
      </ul>
    );
    currentList = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushList(index);
      return;
    }

    const bulletMatch = line.match(bulletPattern);
    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
      return;
    }

    flushList(index);

    if (headingPattern.test(line)) {
      blocks.push(
        <h6
          key={`heading-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: blocks.length === 0 ? 0 : '18px',
            marginBottom: '8px',
            color: '#122359',
            fontWeight: 700,
            fontSize: '15px',
          }}
        >
          <span
            style={{
              width: '4px',
              height: '16px',
              borderRadius: '2px',
              background: '#ffa300',
              display: 'inline-block',
              flexShrink: 0,
            }}
          ></span>
          {line}
        </h6>
      );
    } else {
      blocks.push(
        <p key={`p-${index}`} style={{ marginBottom: '10px', lineHeight: 1.7 }}>
          {line}
        </p>
      );
    }
  });

  flushList('end');

  return blocks;
};

const JobContent = ({ job = {}, isApplied = false, onApplied }) => {
  const [showModal, setShowModal] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
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

  useEffect(() => {
    const fetchCompany = async () => {
      if (!job?.employerId) return;

      try {
        const data = await getCompanyDetails(job.employerId);
        setCompanyDetails(data);
      } catch (error) {
        console.error("Failed to load company details", error);
      }
    };

    fetchCompany();
  }, [job?.employerId]);

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
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(18,35,89,0.08)',
            borderRadius: '16px',
            padding: '22px 24px',
            marginBottom: '24px',
            boxShadow: '0 4px 14px rgba(18,35,89,0.04)',
          }}
        >
          <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: '#FFF3E0',
                color: '#ff9900',
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-file-lines"></i>
            </span>
            Job Description
          </h5>
          <div style={{ marginTop: '12px' }}>
            {renderJobDescription(job.jobDescription)}
          </div>
        </div>

        {/* Key Responsibilities */}
        {/* {job.keyResponsibilities?.length > 0 && (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(18,35,89,0.08)',
        borderRadius: '16px',
        padding: '22px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 14px rgba(18,35,89,0.04)',
      }}
    >
      <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: '#EAF2FF',
            color: '#1D4ED8',
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-list-check"></i>
        </span>
        Key Responsibilities
      </h5>
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {job.keyResponsibilities.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#1D4ED8',
                color: '#ffffff',
                fontSize: '10px',
                flexShrink: 0,
                marginTop: '3px',
              }}
            >
              <i className="fa-solid fa-check"></i>
            </span>
            <span style={{ lineHeight: 1.6 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )} */}

        {/* Professional Skills */}
        {job.professionalSkills?.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(18,35,89,0.08)',
              borderRadius: '16px',
              padding: '22px 24px',
              marginBottom: '24px',
              boxShadow: '0 4px 14px rgba(18,35,89,0.04)',
            }}
          >
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#F0FBF3',
                  color: '#178A4C',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-star"></i>
              </span>
              Professional Skills
            </h5>
            <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {job.professionalSkills.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '7px 14px',
                    borderRadius: 999,
                    background: '#F0FBF3',
                    border: '1px solid #B7E8C2',
                    color: '#178A4C',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Perks & Benefits */}
        {job.perksAndBenefits?.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(18,35,89,0.08)',
              borderRadius: '16px',
              padding: '22px 24px',
              marginBottom: '24px',
              boxShadow: '0 4px 14px rgba(18,35,89,0.04)',
            }}
          >
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#FEF3E2',
                  color: '#B15C00',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-gift"></i>
              </span>
              Perks &amp; Benefits
            </h5>
            <div className="row" style={{ marginTop: '14px' }}>
              {job.perksAndBenefits.map((perk, index) => (
                <div key={index} className="col-md-6" style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <i
                      className="fa-solid fa-circle-check"
                      style={{ color: '#B15C00', marginTop: '4px', flexShrink: 0 }}
                    ></i>
                    <span style={{ lineHeight: 1.6 }}>{perk}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <div className="author-single">
        <span>{job.companyName}</span>
      </div>
      <div className="single-apply-jobs">
        <div className="row align-items-center">
          <div className="col-md-5">
            {isApplied ? (
              <span
                className="btn btn-default mr-15"
                style={{ opacity: 0.6, cursor: 'default', pointerEvents: 'none' }}
                aria-disabled="true"
              >
                Applied
              </span>
            ) : (
              <a className="btn btn-default mr-15" href="#" onClick={(event) => {
                event.preventDefault();
                toggleModal();
              }}>Apply now</a>
            )}

            <button
              type="button"
              className="btn btn-border"
              onClick={handleSaveJob}
            >
              Save job
            </button>
          </div>
          <div className="col-md-7 text-lg-end social-share">
            <h6 className="color-text-paragraph-2 d-inline-block d-baseline mr-10">
              Follow us
            </h6>

            <a
              href={companyDetails?.facebookUrl || "#"}
              target={companyDetails?.facebookUrl ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="mr-5 d-inline-block d-middle"
              style={{
                opacity: companyDetails?.facebookUrl ? 1 : 0.6,
                pointerEvents: companyDetails?.facebookUrl ? "auto" : "none",
              }}
            >
              <img alt="Facebook" src="/assets/imgs/template/icons/share-fb.svg" />
            </a>

            <a
              href={companyDetails?.linkedInUrl || "#"}
              target={companyDetails?.linkedInUrl ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="mr-5 d-inline-block d-middle"
              style={{
                opacity: companyDetails?.linkedInUrl ? 1 : 0.6,
                pointerEvents: companyDetails?.linkedInUrl ? "auto" : "none",
              }}
            >
              <img alt="LinkedIn" src="/assets/imgs/template/icons/share-tw.svg" />
            </a>

            <a
              href={companyDetails?.instagramUrl || "#"}
              target={companyDetails?.instagramUrl ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="mr-5 d-inline-block d-middle"
              style={{
                opacity: companyDetails?.instagramUrl ? 1 : 0.6,
                pointerEvents: companyDetails?.instagramUrl ? "auto" : "none",
              }}
            >
              <img alt="Instagram" src="/assets/imgs/template/icons/share-red.svg" />
            </a>

            <a
              href={companyDetails?.websiteUrl || "#"}
              target={companyDetails?.websiteUrl ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="d-inline-block d-middle"
              style={{
                opacity: companyDetails?.websiteUrl ? 1 : 0.6,
                pointerEvents: companyDetails?.websiteUrl ? "auto" : "none",
              }}
            >
              <img alt="Website" src="/assets/imgs/template/icons/share-whatsapp.svg" />
            </a>
          </div>
        </div>
      </div>
      <ApplyJobModal
        showModal={showModal}
        setShowModal={(v) => { setShowModal(v); if (!v) onApplied?.(); }}
        job={job}
      />
    </div>
  );
};

export default JobContent;