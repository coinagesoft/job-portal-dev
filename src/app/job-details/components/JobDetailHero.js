'use client';
import React, { useState } from 'react';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';
import { useSelector } from "react-redux";
import { saveJob } from "@/services/candidate/savedJobsService";
import { useToast } from "@/components/Toast";
import { useRouter } from 'next/navigation';

const JobDetailHero = ({
  job = {},
  isApplied = false,
  onApplied,
  isSaved = false,
  onSavedToggle,
}) => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const toggleModal = () => setShowModal(!showModal);
  const showToast = useToast();
  const candidateId = useSelector((state) => state.auth.user?.userId);

  const handleApplyClick = () => {
    if (!candidateId) {
      router.push(`/Login?redirectTo=/job-details?jobId=${job.jobId}`);
      return;
    }
    toggleModal();
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postedDate = new Date(dateString);

    const diffInMs = now - postedDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    return `${diffInDays} days ago`;
  };

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

      const response = await saveJob(jobId);

      if (response?.data?.success) {
        onSavedToggle?.();
        showToast(
          response.data.message || (isSaved ? "Job unsaved successfully!" : "Job saved successfully!"),
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

  return (
    <section className="section-box-2">
      <div className="container">
        {job.bannerImg ? (
          <div className="banner-hero banner-image-single">
            <img src={job.bannerImg} alt="jobBox" />
          </div>
        ) : (
          <div className="banner-hero banner-image-single">
            <img src="/assets/imgs/page/job-single/thumb.png" alt="jobBox" />
          </div>
        )}
        <div className="row mt-10">
          <div className="col-lg-8 col-md-12">
            <h3>{job.jobTitle}</h3>

            <div
              style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                marginTop: '8px',
                marginBottom: '15px',
                color: '#66789C',
                fontSize: '12px',
              }}
            >
              {job.jobLocation && (
                <span>
                  <i className="fi-rr-marker mr-5"></i>
                  {job.jobLocation}
                </span>
              )}

              {job.postedOn && (
                <span>
                  <i className="fi-rr-clock mr-5"></i>
                  Posted {getTimeAgo(job.postedOn)}
                </span>
              )}

              {job.applicationDeadline && (
                <span>
                  <i className="fi-rr-calendar mr-5"></i>
                  Apply before{' '}
                  {new Date(job.applicationDeadline).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </span>
              )}
            </div>

          </div>
          <div className="col-lg-4 col-md-12 text-lg-end">
            {isApplied ? (
              <div
                className="btn btn-apply-icon btn-apply btn-apply-big"
                style={{
                  opacity: 0.6,
                  cursor: "default",
                  pointerEvents: "none",
                }}
              >
                Applied
              </div>
            ) : (
              <div
                className="btn btn-apply-icon btn-apply btn-apply-big hover-up"
                onClick={handleApplyClick}
              >
                Apply now
              </div>
            )}

            <button
              type="button"
              className="btn btn-border ml-10"
              style={
                isSaved
                  ? {
                      backgroundColor: "#FFF3E0",
                      borderColor: "#ffa300",
                      color: "#B15C00",
                      fontWeight: "600",
                    }
                  : {}
              }
              onClick={handleSaveJob}
            >
              {isSaved ? "Unsave" : "Save Job"}
            </button>
          </div>
        </div>
        <div className="border-bottom pt-10 pb-10"></div>
      </div>
      <ApplyJobModal
        showModal={showModal}
        setShowModal={(v) => { setShowModal(v); if (!v) onApplied?.(); }}
        job={job}
      />
    </section>
  );
};

export default JobDetailHero;