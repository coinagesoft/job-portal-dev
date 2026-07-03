'use client';
import React, { useState } from 'react';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';

const JobDetailHero = ({ job = {}, isApplied = false, onApplied }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

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
                  })}
                </span>
              )}
            </div>

            
          </div>
          <div className="col-lg-4 col-md-12 text-lg-end">
            {isApplied ? (
              <div
                className="btn btn-apply-icon btn-apply btn-apply-big"
                style={{ opacity: 0.6, cursor: 'default', pointerEvents: 'none' }}
                aria-disabled="true"
              >
                Applied
              </div>
            ) : (
              <div
                className="btn btn-apply-icon btn-apply btn-apply-big hover-up"
                onClick={toggleModal}
              >
                Apply now
              </div>
            )}
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