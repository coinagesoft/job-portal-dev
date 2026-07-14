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
  apply: '/assets/imgs/template/icons/apply.svg',
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

  const isConfidential =
  job.companyVisibility === "HideName"

  // Previously all ~20 fields were dumped into one flat 2-column flex grid.
  // When a label wrapped to two lines ("Employment Mode", "Disability
  // Friendly", etc.) it visually collided with the next row, since icon +
  // label + value all shared one inline flex row instead of being
  // self-contained. Grouping into sections, and giving each field its own
  // fixed-height card in a real CSS grid, means a long label can never
  // bump into its neighbor.
  const groups = [
    {
      title: 'Role Overview',
      items: [
        { icon: 'industry', label: 'Trade Category', value: humanize(job.tradeCategory) },
        { icon: 'industry', label: 'Department', value: humanize(job.department) },
         { icon: 'industry', label: 'Industry Type', value: humanize(job.industryType) },
        { icon: 'jobType', label: 'Employment Type', value: humanize(job.employmentType) },
        { icon: 'location', label: 'Employment Mode', value: humanize(job.employmentMode) },
         { icon: 'jobType', label: 'Job Type', value: humanize(job.jobType) },
        { icon: 'location', label: 'Location Type', value: humanize(job.locationType) },
        // { icon: 'location', label: 'Oil Field', value: humanize(job.isOilField) },
      ],
    },
    {
      title: 'Compensation & Experience',
      items: [
        { icon: 'salary', label: 'Salary', value: job.salaryRange },
        {
          icon: 'experience',
          label: 'Experience',
          value:
            job.experienceMinYears != null && job.experienceMaxYears != null
              ? job.experienceMaxYears > 0
                ? `${job.experienceMinYears}-${job.experienceMaxYears} Years`
                : `${job.experienceMinYears}+ Years`
              : null,
        },
        { icon: 'industry', label: 'Education', value: humanize(job.educationRequired) },
        {
          icon: 'experience',
          label: 'Age Range',
          value:
            job.ageMin != null && job.ageMax != null
              ? `${job.ageMin}-${job.ageMax} Years`
              : null,
        },
      ],
    },
    {
      title: 'Eligibility',
      items: [
        { icon: 'jobType', label: 'Gender Preference', value: humanize(job.genderPreferred) },
        // { icon: 'location', label: 'Languages', value: job.languagePreferred },
        // { icon: 'industry', label: 'Certificates', value: humanize(job.requiredLicencesCertificates) },
        {
          icon: 'jobType',
          label: 'Disability Friendly',
          value: job.disabilityFriendly !== undefined ? (job.disabilityFriendly ? 'Yes' : 'No') : null,
        },
        {
          icon: 'experience',
          label: 'Passport Required',
          value: job.passportRequired !== undefined ? (job.passportRequired ? 'Yes' : 'No') : null,
        },
        {
          icon: 'experience',
          label: 'International Job',
          value: job.isInternational !== undefined ? (job.isInternational ? 'Yes' : 'No') : null,
        },
      ],
    },
    {
      title: 'Hiring Logistics',
      items: [
        { icon: 'jobLevel', label: 'Openings', value: job.openingCount },
        { icon: 'jobLevel', label: 'Applications', value: job.applicationCount },
        { icon: 'deadline', label: 'Application Deadline', value: job.applicationDeadline },
        { icon: 'location', label: 'Company Location', value: job.companyLocation },
        {
          icon: 'location',
          label: 'Duty Hours',
          value: job.dutyHoursPerDay ? `${job.dutyHoursPerDay} Hours/Day` : null,
        },
        {
          icon: 'jobType',
          label: 'Paid Overtime',
          value: job.paidOvertime !== undefined ? (job.paidOvertime ? 'Yes' : 'No') : null,
        },
      ],
    },
  ]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.value !== null && item.value !== ''),
    }))
    .filter((group) => group.items.length > 0);

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

      {groups.map((group, groupIndex) => (
        <div
          key={group.title}
          style={{ marginTop: groupIndex === 0 ? 0 : '28px' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
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
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#122359',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              {group.title}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: '14px',
            }}
          >
            {group.items.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(18,35,89,0.08)',
                  background: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={iconMap[item.icon]}
                    alt=""
                    style={{ width: '16px', height: '16px', flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                <strong style={{ fontSize: '15px', color: '#122359', lineHeight: 1.4 }}>
                  {item.value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobOverview;