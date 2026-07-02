'use client';
import React, { useState } from 'react';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';

const JobDetailHero = ({ job = {}, isApplied = false, onApplied }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

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
            <div className="mt-0 mb-15">
              {job.type && <span className="card-briefcase">{job.type.replace(/_/g, ' ')}</span>}
              {job.time && <span className="card-time">{job.time}</span>}
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