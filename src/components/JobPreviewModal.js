"use client";

import React, { useEffect } from "react";

/* Turn backend enum-style values (Regular_Hiring, Full_Time) into readable text */
const humanize = (s) => {
  if (s === null || s === undefined || s === "") return "—";
  if (typeof s !== "string") return String(s);
  return s.replace(/_/g, " ");
};

const fmtMoney = (n, currency) => {
  if (n === null || n === undefined || n === "") return null;
  const num = Number(n);
  if (Number.isNaN(num)) return null;
  return `${currency || ""} ${num.toLocaleString()}`.trim();
};

function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "8px 0",
        borderBottom: "1px solid #F0F2F6",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#66789c", fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#122359", fontWeight: 600, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 12px",
        borderRadius: 999,
        background: "#EAF4FF",
        border: "1px solid #B9DCFF",
        color: "#1D4ED8",
        fontSize: 12,
        fontWeight: 600,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {children}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #EEF2F7",
        borderRadius: 16,
        padding: "18px 20px",
        marginBottom: 16,
      }}
    >
      <h6
        style={{
          margin: "0 0 10px",
          color: "#122359",
          fontWeight: 800,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {title}
      </h6>
      {children}
    </div>
  );
}

/**
 * job: the flat jobForm-shaped object (same shape produced by
 * src/utils/jobFormMapper.js and used by the Post-a-Job wizard's state).
 * loading: true while the job data for a list-page preview is being fetched.
 */
export default function JobPreviewModal({ open, onClose, job, loading }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const locationSummary = (() => {
    if (!job) return "—";
    if (job.LocationType === "Offshore") {
      return [job.OffshoreVesselName, job.OffshoreRegion, job.OffshoreCountry]
        .filter(Boolean)
        .join(", ") || "—";
    }
    return [job.OnshoreCity, job.OnshoreState, job.OnshoreCountry || job.Country]
      .filter(Boolean)
      .join(", ") || "—";
  })();

  const salaryLine = job
    ? [fmtMoney(job.SalaryMin, job.SalaryCurrency), fmtMoney(job.SalaryMax, job.SalaryCurrency)]
        .filter(Boolean)
        .join(" – ") || "Not specified"
    : "Not specified";

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(18,35,89,0.45)",
        zIndex: 100000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "#F7F9FC",
          borderRadius: 20,
          width: "100%",
          maxWidth: 760,
          boxShadow: "0 30px 70px rgba(18,35,89,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#122359,#1e3a8a)",
            padding: "22px 26px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <span
              style={{
                color: "#ffa300",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Job Preview
            </span>
            <h4 style={{ color: "#fff", margin: "4px 0 0", fontWeight: 800 }}>
              {loading ? "Loading…" : job?.JobTitle || "Untitled Job"}
            </h4>
            {!loading && job && (
              <p style={{ color: "#c9d4ee", margin: "4px 0 0", fontSize: 13 }}>
                {job.TradeCategory?.toLowerCase() === "other" || job.TradeCategory?.toLowerCase() === "othere"
                  ? (job.Role || "Other / Specialisation")
                  : `${humanize(job.TradeCategory)}${job.Role ? ` • ${job.Role}` : ""}`}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: 10,
              border: "none",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, maxHeight: "75vh", overflowY: "auto" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#66789c", fontWeight: 600 }}>
              Fetching job details…
            </div>
          )}

          {!loading && job && (
            <>
              {/* Quick badges */}
              <div style={{ marginBottom: 16 }}>
                <Pill>{humanize(job.JobType)}</Pill>
                <Pill>{humanize(job.EmploymentType)}</Pill>
                <Pill>{humanize(job.EmploymentMode)}</Pill>
                {job.IndustryType && <Pill>{humanize(job.IndustryType)}</Pill>}
                {job.IsOilField && <Pill>Oil Field</Pill>}
              </div>

              <Section title="Job Details">
                <Row label="Job Title" value={job.JobTitle} />
                <Row label="Trade / Role Category" value={humanize(job.TradeCategory)} />
                <Row label="Role / Specialisation" value={job.Role} />
                <Row label="Industry Type" value={humanize(job.IndustryType)} />
                <Row label="Department" value={job.Department} />
                <Row
                  label="Experience"
                  value={
                    job.ExperienceMinYears || job.ExperienceMaxYears
                      ? `${job.ExperienceMinYears || 0} – ${job.ExperienceMaxYears || 0} yrs`
                      : null
                  }
                />
                <Row
                  label="Duty Hours / Day"
                  value={job.DutyHoursPerDay ? `${job.DutyHoursPerDay} hrs` : null}
                />
                <Row label="Paid Overtime" value={job.PaidOvertime ? "Yes" : "No"} />

                {job.KeyResponsibilities?.filter(Boolean).length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: "#66789c", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      Key Responsibilities
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: "#122359", fontSize: 13 }}>
                      {job.KeyResponsibilities.filter(Boolean).map((r, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.JobDescription && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: "#66789c", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      Job Description
                    </div>
                    <p style={{ margin: 0, color: "#122359", fontSize: 13, whiteSpace: "pre-wrap" }}>
                      {job.JobDescription}
                    </p>
                  </div>
                )}
              </Section>

              <Section title="Compensation">
                <Row label="Salary Range" value={salaryLine} />
                <Row label="Display Option" value={humanize(job.SalaryDisplayOption)} />
              </Section>

              <Section title="Skills & JD">
                {job.KeySkills?.filter(Boolean).length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {job.KeySkills.filter(Boolean).map((s, i) => (
                      <Pill key={i}>{s}</Pill>
                    ))}
                  </div>
                )}
                <Row label="Licence / Docs Required" value={job.LicenceDocsRequired} />
                <Row label="Language Required" value={job.LanguageRequired} />
                {job.Benefits?.filter(Boolean).length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ color: "#66789c", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      Benefits
                    </div>
                    {job.Benefits.filter(Boolean).map((b, i) => (
                      <Pill key={i}>{b}</Pill>
                    ))}
                  </div>
                )}
                {job.AdditionalJobDescription && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: "#66789c", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      Additional Job Description
                    </div>
                    <p style={{ margin: 0, color: "#122359", fontSize: 13, whiteSpace: "pre-wrap" }}>
                      {job.AdditionalJobDescription}
                    </p>
                  </div>
                )}
              </Section>

              <Section title="Eligibility">
                <Row label="Vacancies" value={job.Vacancies} />
                <Row label="Education Required" value={humanize(job.EducationRequired)} />
                <Row
                  label="Age Range"
                  value={job.AgeMin || job.AgeMax ? `${job.AgeMin || "—"} – ${job.AgeMax || "—"}` : null}
                />
                <Row label="Gender Preferred" value={humanize(job.GenderPreferred)} />
                <Row label="Disability Eligible" value={job.DisabilityEligible ? "Yes" : "No"} />
                <Row label="Passport Required" value={job.PassportRequired ? "Yes" : "No"} />
                {job.PassportRequired && (
                  <Row label="Passport Validity" value={job.PassportValidityMonths ? `${job.PassportValidityMonths} months` : null} />
                )}
              </Section>

              <Section title="Location">
                <Row label="Location Type" value={humanize(job.LocationType)} />
                <Row label="Address" value={job.WorkAddressLine} />
                <Row label="Location" value={locationSummary} />
                <Row label="Pincode" value={job.OnshorePincode} />
              </Section>

              {job.questions?.filter((q) => q?.questionText?.trim()).length > 0 && (
                <Section title="Screening Questions">
                  <ol style={{ margin: 0, paddingLeft: 18, color: "#122359", fontSize: 13 }}>
                    {job.questions
                      .filter((q) => q?.questionText?.trim())
                      .map((q, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>
                          {q.questionText}
                        </li>
                      ))}
                  </ol>
                </Section>
              )}

              <Section title="Publishing">
                <Row label="Application Deadline" value={job.ApplicationDeadline} />
                <Row label="Company Visibility" value={humanize(job.CompanyVisibility)} />
                <Row label="Publish Immediately" value={job.PublishNow ? "Yes" : "No"} />
                {job.PublishingTags?.filter(Boolean).length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {job.PublishingTags.filter(Boolean).map((t, i) => (
                      <Pill key={i}>{t}</Pill>
                    ))}
                  </div>
                )}
              </Section>
            </>
          )}

          {!loading && !job && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#66789c" }}>
              No job data available to preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}