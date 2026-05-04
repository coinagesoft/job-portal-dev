'use client';
import React from 'react';
import Link from 'next/link';

const JobCardList = ({ job, onApplyNow, viewMode = 'list' }) => {
  return (
    <>
      <div className="card-grid-2 hover-up">
        <span className="flash"></span>
        <div className="row">
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="card-grid-2-image-left">
              <div className="image-box">
                <img src={job.img} alt="jobBox" />
              </div>
              <div className="right-info">
                <Link className="name-job" href="/company-details">{job.company}</Link>
                <span className="location-small">{job.location}</span>
              </div>
            </div>
          </div>
          <div className="col-lg-6 text-start text-md-end pr-60 col-md-6 col-sm-12">
            <div className="pl-15 mb-15 mt-30">
              {job.tags.map((tag, index) => (
                <a key={index} className="btn btn-grey-small mr-5" href="#">{tag}</a>
              ))}
            </div>
          </div>
        </div>
      <div className="card-block-info">
          <h4><Link href="/job-details">{job.title}</Link></h4>
          <div className="mt-5">
            <span className="card-briefcase">{job.type}</span>
            <span className="card-time">
              <span>{job.time.split(' ')[0]}</span>
              <span>{job.time.split(' ')[1]} ago</span>
            </span>
          </div>
          <p className="font-sm color-text-paragraph mt-10">{job.desc}</p>
          {viewMode === 'list' && (
            <div className="mt-10">
              <span className="font-xs color-text-paragraph-2">
                Openings: <strong>{job.openings || 1}</strong> - Experience: <strong>{job.experience}</strong>
              </span>
            </div>
          )}
          <div className="card-2-bottom mt-20">
            <div className="row">
              <div className="col-lg-7 col-7">
                <span className="card-text-price">{job.price}</span>
                <span className="text-muted">/Hour</span>
              </div>
              <div className="col-lg-5 col-5 text-end">
                <button
                  type="button"
                  className="btn btn-apply-now"
                  onClick={() => onApplyNow?.(job)}
                >
                  Apply now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobCardList;


