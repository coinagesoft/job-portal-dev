'use client';
import React from 'react';
import Link from 'next/link';
import { detailedJob, similarJobs, mapEmbed } from '../data.js';

const CompanySidebar = () => {
  const formatHourlyPrice = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.includes('$') ? text : `$${text}`;
  };

  return (
    <>
      <div className="sidebar-border">
        <div className="sidebar-heading">
          <div className="avatar-sidebar">
            <figure>
              <img alt="jobBox" src={detailedJob.avatar} />
            </figure>
            <div className="sidebar-info">
              <span className="sidebar-company">{detailedJob.companyFull}</span>
              <span className="card-location">{detailedJob.location}</span>
              <a className="link-underline mt-15" href="#">02 Open Jobs</a>
            </div>
          </div>
        </div>
        <div className="sidebar-list-job">
          <div className="box-map">
            <iframe
              src={mapEmbed}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <ul className="ul-disc">
            <li>{detailedJob.address}</li>
            <li>Phone: {detailedJob.phone}</li>
            <li>Email: {detailedJob.email}</li>
          </ul>
        </div>
      </div>
      <div className="sidebar-border">
        <h6 className="f-18">Similar jobs</h6>
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
                      <span className="card-briefcase">{job.type}</span>
                      <span className="card-time">
                        {job.time.split(' ')[0]} <span>{job.time.split(' ')[1]} ago</span>
                      </span>
                    </div>
                    <div className="mt-5">
                      <div className="row">
                        <div className="col-6">
                          <h6 className="card-price">
                            {formatHourlyPrice(job.price)}<span>/Hour</span>
                          </h6>
                        </div>
                        <div className="col-6 text-end">
                          <span className="card-briefcase">{job.location}</span>
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

