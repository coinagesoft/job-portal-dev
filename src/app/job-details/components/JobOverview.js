'use client';
import React from 'react';
import { detailedJob } from '../data.js';

const iconMap = {
  industry: '/assets/imgs/page/job-single/industry.svg',
  jobLevel: '/assets/imgs/page/job-single/job-level.svg',
  salary: '/assets/imgs/page/job-single/salary.svg',
  experience: '/assets/imgs/page/job-single/experience.svg',
  jobType: '/assets/imgs/page/job-single/job-type.svg',
  deadline: '/assets/imgs/page/job-single/deadline.svg',
  updated: '/assets/imgs/page/job-single/updated.svg',
  location: '/assets/imgs/page/job-single/location.svg',
};

const JobOverview = ({ job = detailedJob }) => {
  const infoItems = [
    { icon: 'industry', label: 'Industry', value: job.industry },
    { icon: 'jobLevel', label: 'Job level', value: job.jobLevel },
    { icon: 'salary', label: 'Salary', value: job.salary },
    { icon: 'experience', label: 'Experience', value: job.experience },
    { icon: 'jobType', label: 'Job type', value: job.jobType },
    { icon: 'experience', label: 'Age Range', value: job.minAgeMax },
    { icon: 'location', label: 'Location Type', value: job.locationType },
    { icon: 'industry', label: 'Education', value: job.education },
    { icon: 'industry', label: 'Certifications', value: job.requiredCertification },
    { icon: 'jobType', label: 'Gender', value: job.gender },
    { icon: 'location', label: 'Languages', value: job.languagePreferred },
    { icon: 'deadline', label: 'Deadline', value: job.deadline },
    { icon: 'updated', label: 'Updated', value: job.updated },
    { icon: 'location', label: 'Location', value: job.location },
  ];

  return (
    <div className="job-overview" style={{ border: 'none', background: '#ffffff', borderRadius: '20px', boxShadow: '0 4px 14px rgba(18,35,89,0.06)', padding: '24px 30px 30px', marginBottom: '50px' }}>
      <h5 className="border-bottom pb-15 mb-30">Employment Information</h5>
      <div className="row">
        {infoItems.map((item, index) => (
          <div key={index} className={`col-md-6 d-flex ${index % 2 ? 'mt-sm-15' : ''}`}>
            <div className="sidebar-icon-item">
              <img src={iconMap[item.icon]} alt="jobBox" />
            </div>
            <div className="sidebar-text-info ml-10">
              <span className="text-description mb-10">{item.label}</span>
              <strong className="small-heading">{item.value}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobOverview;
