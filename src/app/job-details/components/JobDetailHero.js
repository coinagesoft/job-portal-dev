'use client';
import React, { useState, useEffect } from 'react';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';
import { detailedJob } from '../data.js';
import { getMyApplications } from '@/services/candidate/myApplicationsService';

const JobDetailHero = ({ job = detailedJob }) => {
  const [showModal, setShowModal] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  // Check whether the candidate has already applied to this job.
  const checkApplied = async () => {
    if (!job?.jobId) return;
    try {
      const res = await getMyApplications();
      const ids = (res?.data?.applications || []).map((a) => a.jobId);
      setIsApplied(ids.includes(job.jobId));
    } catch (error) {
      console.log('applied check skipped', error?.message || error);
    }
  };

  useEffect(() => {
    checkApplied();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.jobId]);

  return (
    <section className="section-box-2">
      <div className="container">
        <div className="banner-hero banner-image-single">
          <img src={job.bannerImg} alt="jobBox" />
        </div>
        <div className="row mt-10">
          <div className="col-lg-8 col-md-12">
            <h3>{job.jobTitle}</h3>
            <div className="mt-0 mb-15">
              <span className="card-briefcase">{job.type}</span>
              <span className="card-time">{job.time}</span>
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
        setShowModal={(v) => { setShowModal(v); if (!v) checkApplied(); }}
        job={job}
      />
    </section>
  );
};

export default JobDetailHero;