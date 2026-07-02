'use client';
import React from 'react';

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

const JobOverview = ({ job = {} }) => {
  // Backend enum values come through as PascalCase_With_Underscores
  // (e.g. "Full_Time", "Onshore"). Convert to readable text for display
  // without changing the underlying data anywhere else in the app.
  const humanize = (value) => {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map(humanize).join(", ");
    if (typeof value !== "string") return value;
    return value.replace(/_/g, " ");
  };

  const infoItems = [
    {
      icon: "industry",
      label: "Trade Category",
      value: humanize(job.tradeCategory),
    },
    {
      icon: "industry",
      label: "Department",
      value: humanize(job.department),
    },
    {
      icon: "jobType",
      label: "Employment Type",
      value: humanize(job.employmentType),
    },
    {
      icon: "location",
      label: "Employment Mode",
      value: humanize(job.employmentMode),
    },
    {
      icon: "location",
      label: "Location Type",
      value: humanize(job.locationType),
    },
    {
      icon: "salary",
      label: "Salary",
      value: job.salaryRange,
    },
    {
      icon: "experience",
      label: "Experience",
      value:
        job.experienceMinYears != null && job.experienceMaxYears != null
          ? job.experienceMaxYears > 0
            ? `${job.experienceMinYears}-${job.experienceMaxYears} Years`
            : `${job.experienceMinYears}+ Years`
          : null,
    },
    {
      icon: "industry",
      label: "Education",
      value: humanize(job.educationRequired),
    },
    {
      icon: "experience",
      label: "Age Range",
      value:
        job.ageMin != null && job.ageMax != null
          ? `${job.ageMin}-${job.ageMax} Years`
          : null,
    },
    {
      icon: "jobType",
      label: "Gender Preference",
      value: humanize(job.genderPreferred),
    },
    {
      icon: "location",
      label: "Languages",
      value: job.languagePreferred,
    },
    {
      icon: "industry",
      label: "Certificates",
      value: humanize(job.requiredLicencesCertificates),
    },
    {
      icon: "jobLevel",
      label: "Openings",
      value: job.openingCount,
    },
    {
      icon: "jobLevel",
      label: "Applications",
      value: job.applicationCount,
    },
    {
      icon: "deadline",
      label: "Application Deadline",
      value: job.applicationDeadline,
    },
    {
      icon: "location",
      label: "Company Location",
      value: job.companyLocation,
    },
    {
      icon: "location",
      label: "Duty Hours",
      value: job.dutyHoursPerDay
        ? `${job.dutyHoursPerDay} Hours/Day`
        : null,
    },
    {
      icon: "jobType",
      label: "Paid Overtime",
      value:
        job.paidOvertime !== undefined
          ? job.paidOvertime
            ? "Yes"
            : "No"
          : null,
    },
    {
      icon: "jobType",
      label: "Disability Friendly",
      value:
        job.disabilityFriendly !== undefined
          ? job.disabilityFriendly
            ? "Yes"
            : "No"
          : null,
    },
    {
      icon: "jobType",
      label: "Passport Required",
      value:
        job.passportRequired !== undefined
          ? job.passportRequired
            ? "Yes"
            : "No"
          : null,
    },
    {
      icon: "jobType",
      label: "International Job",
      value:
        job.isInternational !== undefined
          ? job.isInternational
            ? "Yes"
            : "No"
          : null,
    },
  ].filter(item => item.value !== null && item.value !== "");

  return (
    <div
      className="job-overview"
      style={{
        border: 'none',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 4px 14px rgba(18,35,89,0.06)',
        padding: '24px 30px 30px',
        marginBottom: '50px',
      }}
    >
      <h5 className="border-bottom pb-15 mb-30">
        Employment Information
      </h5>

      <div className="row">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className={`col-md-6 d-flex ${
              index % 2 ? 'mt-sm-15' : ''
            }`}
          >
            <div className="sidebar-icon-item">
              <img
                src={iconMap[item.icon]}
                alt={item.label}
              />
            </div>

            <div className="sidebar-text-info ml-10">
              <span className="text-description mb-10">
                {item.label}
              </span>

              <strong className="small-heading">
                {item.value}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobOverview;