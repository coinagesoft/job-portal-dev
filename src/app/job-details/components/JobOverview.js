'use client';
import React from 'react';

// All field icons come from Font Awesome (fa-solid) — the icon family
// already confirmed working elsewhere in this project (fa-globe,
// fa-briefcase, fa-circle-check on the company details page). Previously
// this mixed <img> SVG assets with <i> Font Awesome icons across fields,
// which looked inconsistent since the two render with different stroke
// weights and visual styles. Using one icon family throughout keeps every
// field visually consistent while still giving each its own distinct icon.
function FieldIcon({ icon }) {
  return (
    <i
      className={icon}
      style={{
        width: '16px',
        fontSize: '16px',
        textAlign: 'center',
        color: '#ffa300',
        flexShrink: 0,
      }}
    ></i>
  );
}

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
        { icon: 'fa-solid fa-industry', label: 'Trade Category', value: humanize(job.tradeCategory) },
        { icon: 'fa-solid fa-sitemap', label: 'Department', value: humanize(job.department) },
        { icon: 'fa-solid fa-layer-group', label: 'Industry Type', value: humanize(job.industryType) },
        { icon: 'fa-solid fa-briefcase', label: 'Employment Type', value: humanize(job.employmentType) },
        { icon: 'fa-solid fa-toggle-on', label: 'Employment Mode', value: humanize(job.employmentMode) },
        { icon: 'fa-solid fa-clipboard-list', label: 'Job Type', value: humanize(job.jobType) },
        { icon: 'fa-solid fa-location-dot', label: 'Location Type', value: humanize(job.locationType) },
        // { icon: 'location', label: 'Oil Field', value: humanize(job.isOilField) },
      ],
    },
    {
      title: 'Compensation & Experience',
      items: [
        { icon: 'fa-solid fa-sack-dollar', label: 'Salary', value: job.salaryRange },
        {
          icon: 'fa-solid fa-user-clock',
          label: 'Experience',
          value:
            job.experienceMinYears != null && job.experienceMaxYears != null
              ? job.experienceMaxYears > 0
                ? `${job.experienceMinYears}-${job.experienceMaxYears} Years`
                : `${job.experienceMinYears}+ Years`
              : null,
        },
        { icon: 'fa-solid fa-graduation-cap', label: 'Education', value: humanize(job.educationRequired) },
        {
          icon: 'fa-solid fa-hourglass-half',
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
        { icon: 'fa-solid fa-venus-mars', label: 'Gender Preference', value: humanize(job.genderPreferred) },
        // { icon: 'location', label: 'Languages', value: job.languagePreferred },
        // { icon: 'industry', label: 'Certificates', value: humanize(job.requiredLicencesCertificates) },
        {
          icon: 'fa-solid fa-wheelchair',
          label: 'Disability Friendly',
          value: job.disabilityFriendly !== undefined ? (job.disabilityFriendly ? 'Yes' : 'No') : null,
        },
        {
          icon: 'fa-solid fa-passport',
          label: 'Passport Required',
          value: job.passportRequired !== undefined ? (job.passportRequired ? 'Yes' : 'No') : null,
        },
        {
          icon: 'fa-solid fa-globe',
          label: 'International Job',
          value: job.isInternational !== undefined ? (job.isInternational ? 'Yes' : 'No') : null,
        },
      ],
    },
    {
      title: 'Hiring Logistics',
      items: [
        { icon: 'fa-solid fa-door-open', label: 'Openings', value: job.openingCount },
        { icon: 'fa-solid fa-inbox', label: 'Applications', value: job.applicationCount },
        { icon: 'fa-solid fa-calendar-days', label: 'Application Deadline', value: job.applicationDeadline },
        { icon: 'fa-solid fa-building', label: 'Company Location', value: job.companyLocation },
        {
          icon: 'fa-solid fa-clock',
          label: 'Duty Hours',
          value: job.dutyHoursPerDay ? `${job.dutyHoursPerDay} Hours/Day` : null,
        },
        {
          icon: 'fa-solid fa-money-bill-wave',
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
      className="job-overview employer-cv-surface-card no-static-border"
      style={{
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
                  <FieldIcon icon={item.icon} />
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
                <strong style={{ fontSize: '16px', fontWeight: 600, color: '#122359', lineHeight: 1.4 }}>
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