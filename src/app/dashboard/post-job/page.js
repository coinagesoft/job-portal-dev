"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./post-job.module.css";

import {
  saveJobDetails,
  saveCompensation,
  saveSkills,
  saveEligibility,
  saveLocation,
  saveQuestions,
  publishJob,
  saveDraft,
  getJobResume,
  generateJobDescription,
  getInlineSuggestion,
} from "@/services/recruiter/recruiterJobPostService";

/* ─── static data ─────────────────────────────────────────────────────────── */
const roleCategories = [
  "Welding",
  "Fabrication",
  "Electrician",
  "Plumber",
  "Machine Operator",
  "Marine Crew",
  "Warehouse",
  "Other",
];
const jobPostTypes = [
  { label: "Normal Job", value: "Normal_Job" },
  { label: "Hot Vacancy", value: "Hot_Vacancy" },
  { label: "Classified", value: "Classified" },
];
const employmentTypeOptions = [
  { label: "Full Time", value: "Full_Time" },
  { label: "Part Time", value: "Part_Time" },
  { label: "Contract", value: "Contract" },
  { label: "Freelance", value: "Freelance" },
  { label: "Internship / Trainee", value: "Internship" },
  { label: "Apprenticeship", value: "Apprenticeship" },
  { label: "Permanent", value: "Permanent" },
  { label: "Temporary", value: "Temporary" },
];
const employmentModeOptions = [
  { label: "Onsite", value: "Onsite" },
  { label: "Remote", value: "Remote" },
  { label: "Hybrid", value: "Hybrid" },
];
const suggestedSkills = [
  "Java",
  "JavaScript",
  "Spring Boot",
  "Welding Inspection",
  "Safety Compliance",
  "AutoCAD",
];
const suggestedBenefits = [
  "Health Insurance",
  "Provident Fund",
  "Paid Leave",
  "Accommodation",
  "Food Allowance",
  "Transport",
];

const JOB_STEPS = [
  { id: "job-details", step: "01", title: "Job Details" },
  { id: "compensation", step: "02", title: "Compensation" },
  { id: "skills-jd", step: "03", title: "Skills & JD" },
  { id: "eligibility", step: "04", title: "Eligibility" },
  { id: "location", step: "05", title: "Location" },
  { id: "screening-questions", step: "06", title: "Questions" },
  { id: "publishing", step: "07", title: "Publishing" },
];

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function Field({ label, required, hint, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

/** Split a comma-separated string into a trimmed array, ignoring blanks */
const splitComma = (str) =>
  (str ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Join an array back to a comma-separated display string */
const joinComma = (arr) => (arr ?? []).join(", ");

/* ─── Top progress bar ────────────────────────────────────────────────────── */
function StepProgressBar({ activeStep }) {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.stepWrapper}>
        {JOB_STEPS.map((s, i) => {
          const n = i + 1;
          const done = n < activeStep;
          const active = n === activeStep;
          return (
            <React.Fragment key={s.id}>
              <div className={styles.stepItem}>
                <div
                  className={[
                    styles.stepCircle,
                    done ? styles.stepCompleted : "",
                    active ? styles.stepActive : "",
                  ].join(" ")}
                >
                  {done ? "✓" : s.step}
                </div>
                <span
                  className={[
                    styles.stepLabel,
                    active ? styles.stepLabelActive : "",
                  ].join(" ")}
                >
                  {s.title}
                </span>
              </div>
              {i < JOB_STEPS.length - 1 && (
                <div
                  className={[
                    styles.stepLine,
                    done ? styles.stepLineActive : "",
                  ].join(" ")}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step card wrapper ───────────────────────────────────────────────────── */
function StepCard({ stepNum, title, subtitle, children, onBack, onContinue, isLast }) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionBody}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionStep}>
            {String(stepNum).padStart(2, "0")}
          </span>
          <div>
            <h5 className={styles.sectionTitle}>{title}</h5>
            {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>{children}</div>

        <div className={styles.stepActions}>
          {stepNum > 1 && (
            <button
              type="button"
              className={`btn btn-border ${styles.backBtn}`}
              onClick={onBack}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className={`btn btn-default ${styles.continueBtn}`}
            onClick={onContinue}
          >
            {isLast ? "Save & Publish" : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 1 – Job Details ────────────────────────────────────────────────── */
function Step1({ go, jobForm, setJobForm, onSubmit, handleGenerateJD, loadingAI, jdSuggestions, ghostSuggestion, handleJDTab }) {
  return (
    <StepCard
      stepNum={1}
      title="Job Details"
      subtitle="Core role information"
      onContinue={onSubmit}
      isFirst
    >
      {/* Job Title */}
      <Field label="Job Title" required>
        <input
          className={styles.control}
          value={jobForm.JobTitle}
          onChange={(e) => setJobForm((p) => ({ ...p, JobTitle: e.target.value }))}
          placeholder="e.g. Senior Welder"
        />
      </Field>

      <div className={styles.grid2}>
        {/* Trade Category */}
        <Field label="Trade / Role Category" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.TradeCategory}
            onChange={(e) => setJobForm((p) => ({ ...p, TradeCategory: e.target.value }))}
          >
            {roleCategories.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>

        {/* Role (optional free-text specialisation) */}
        <Field label="Role / Specialisation">
          <input
            className={styles.control}
            value={jobForm.Role}
            onChange={(e) => setJobForm((p) => ({ ...p, Role: e.target.value }))}
            placeholder="e.g. Pipe Welder"
          />
        </Field>

        {/* Experience Min */}
        <Field label="Experience Min (yrs)">
          <input
            type="number"
            min={0}
            className={styles.control}
            value={jobForm.ExperienceMinYears}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, ExperienceMinYears: e.target.value }))
            }
          />
        </Field>

        {/* Experience Max */}
        <Field label="Experience Max (yrs)">
          <input
            type="number"
            min={0}
            className={styles.control}
            value={jobForm.ExperienceMaxYears}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, ExperienceMaxYears: e.target.value }))
            }
          />
        </Field>

        {/* Job Type */}
        <Field label="Job Type" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.JobType}
            onChange={(e) => setJobForm((p) => ({ ...p, JobType: e.target.value }))}
          >
            {jobPostTypes.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Employment Type */}
        <Field label="Employment Type" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.EmploymentType}
            onChange={(e) => setJobForm((p) => ({ ...p, EmploymentType: e.target.value }))}
          >
            {employmentTypeOptions.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Employment Mode */}
        <Field label="Employment Mode" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.EmploymentMode}
            onChange={(e) => setJobForm((p) => ({ ...p, EmploymentMode: e.target.value }))}
          >
            {employmentModeOptions.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Department */}
        <Field label="Department">
          <input
            className={styles.control}
            value={jobForm.Department}
            onChange={(e) => setJobForm((p) => ({ ...p, Department: e.target.value }))}
            placeholder="e.g. Operations"
          />
        </Field>

        {/* Duty Hours Per Day */}
        <Field label="Duty Hours Per Day" hint="Max 24">
          <input
            type="number"
            min={1}
            max={24}
            className={styles.control}
            value={jobForm.DutyHoursPerDay}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, DutyHoursPerDay: e.target.value }))
            }
          />
        </Field>

        {/* Paid Overtime */}
        <Field label="Paid Overtime">
          <div style={{ paddingTop: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={jobForm.PaidOvertime}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, PaidOvertime: e.target.checked }))
                }
              />
              Yes – overtime is compensated
            </label>
          </div>
        </Field>
      </div>

      {/* Key Responsibilities */}
      <Field
        label="Key Responsibilities"
        hint="Enter each responsibility on a new line"
      >
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder={"• Operate welding equipment\n• Follow safety protocols"}
          value={jobForm.KeyResponsibilities.join("\n")}
          onChange={(e) =>
            setJobForm((p) => ({
              ...p,
              KeyResponsibilities: e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            }))
          }
        />
      </Field>

      {/* Job Description */}
      <Field label="Job Description" required>
        <button
          type="button"
          className="btn btn-sm btn-default mb-10"
          onClick={handleGenerateJD}
        >
          {loadingAI ? "Generating…" : "✨ Generate with AI"}
        </button>

        <textarea
          className={styles.textarea}
          rows={6}
          value={jobForm.JobDescription}
          onChange={(e) =>
            setJobForm((p) => ({ ...p, JobDescription: e.target.value }))
          }
          onKeyDown={handleJDTab}
        />

        {ghostSuggestion && (
          <div className={styles.inlineSuggestion}>
            <span className={styles.tabHint}>Press TAB ↹</span>
            <span className={styles.suggestionText}>{ghostSuggestion}</span>
          </div>
        )}

        {jdSuggestions.length > 0 && (
          <div className={styles.aiSuggestions}>
            {jdSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles.aiSuggestion}
                onClick={() =>
                  setJobForm((p) => ({
                    ...p,
                    JobDescription: p.JobDescription + " " + suggestion,
                  }))
                }
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </Field>
    </StepCard>
  );
}

/* ─── STEP 2 – Compensation ───────────────────────────────────────────────── */
function Step2({ go, jobForm, setJobForm, onSubmit }) {
  return (
    <StepCard
      stepNum={2}
      title="Compensation"
      subtitle="Salary information"
      onBack={() => go(1)}
      onContinue={onSubmit}
    >
      <div className={styles.grid2}>
        <Field label="Min Salary" required>
          <input
            type="number"
            min={0}
            className={styles.control}
            value={jobForm.SalaryMin}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, SalaryMin: e.target.value }))
            }
          />
        </Field>

        <Field label="Max Salary" required>
          <input
            type="number"
            min={0}
            className={styles.control}
            value={jobForm.SalaryMax}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, SalaryMax: e.target.value }))
            }
          />
        </Field>

        <Field label="Currency" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.SalaryCurrency}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, SalaryCurrency: e.target.value }))
            }
          >
            <option value="INR">INR – Indian Rupee</option>
            <option value="USD">USD – US Dollar</option>
            <option value="AED">AED – UAE Dirham</option>
            <option value="SAR">SAR – Saudi Riyal</option>
            <option value="QAR">QAR – Qatari Riyal</option>
            <option value="SGD">SGD – Singapore Dollar</option>
          </select>
        </Field>

        <Field label="Salary Display Option" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.SalaryDisplayOption}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, SalaryDisplayOption: e.target.value }))
            }
          >
            <option value="Show_Range">Show Range</option>
            <option value="Hide_Salary">Hide Salary</option>
            <option value="Show_Min">Show Minimum Only</option>
            <option value="Show_Max">Show Maximum Only</option>
          </select>
        </Field>
      </div>
    </StepCard>
  );
}

/* ─── STEP 3 – Skills & JD ────────────────────────────────────────────────── */
function Step3({ go, jobForm, setJobForm, onSubmit, additionalJdSuggestions }) {
  return (
    <StepCard
      stepNum={3}
      title="Skills & JD"
      subtitle="Skills, benefits and extended description"
      onBack={() => go(2)}
      onContinue={onSubmit}
    >
      {/* Key Skills */}
      <Field label="Key Skills" required hint="Comma-separated list">
        <input
          className={styles.control}
          placeholder="e.g. Welding, AutoCAD, Safety Compliance"
          value={joinComma(jobForm.KeySkills)}
          onChange={(e) =>
            setJobForm((p) => ({ ...p, KeySkills: splitComma(e.target.value) }))
          }
        />
      </Field>

      <div className={styles.chipRow}>
        {suggestedSkills.map((s) => (
          <button
            key={s}
            type="button"
            className={`btn btn-border btn-sm mr-10 mb-10 ${
              jobForm.KeySkills.includes(s) ? "btn-brand-1" : ""
            }`}
            onClick={() =>
              setJobForm((p) => ({
                ...p,
                KeySkills: p.KeySkills.includes(s)
                  ? p.KeySkills.filter((k) => k !== s)
                  : [...p.KeySkills, s],
              }))
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Key Responsibilities (step-3 copy — separate from step-1) */}
      <Field
        label="Key Responsibilities"
        hint="One per line"
      >
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder={"• Perform quality checks\n• Coordinate with team leads"}
          value={jobForm.Step3KeyResponsibilities.join("\n")}
          onChange={(e) =>
            setJobForm((p) => ({
              ...p,
              Step3KeyResponsibilities: e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            }))
          }
        />
      </Field>

      {/* Additional Job Description */}
      <Field label="Additional Job Description">
        <textarea
          className={styles.textarea}
          rows={5}
          value={jobForm.AdditionalJobDescription}
          onChange={(e) =>
            setJobForm((p) => ({
              ...p,
              AdditionalJobDescription: e.target.value,
            }))
          }
        />
        {additionalJdSuggestions.length > 0 && (
          <div className={styles.aiSuggestions}>
            {additionalJdSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles.aiSuggestion}
                onClick={() =>
                  setJobForm((p) => ({
                    ...p,
                    AdditionalJobDescription:
                      p.AdditionalJobDescription + " " + suggestion,
                  }))
                }
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </Field>

      {/* Licence / Docs Required */}
      <Field label="Licence / Documents Required">
        <input
          className={styles.control}
          placeholder="e.g. ITI Certificate, CSWIP 3.1"
          value={jobForm.LicenceDocsRequired}
          onChange={(e) =>
            setJobForm((p) => ({ ...p, LicenceDocsRequired: e.target.value }))
          }
        />
      </Field>

      {/* Language Required */}
      <Field label="Language Required">
        <input
          className={styles.control}
          placeholder="e.g. English, Hindi"
          value={jobForm.LanguageRequired}
          onChange={(e) =>
            setJobForm((p) => ({ ...p, LanguageRequired: e.target.value }))
          }
        />
      </Field>

      {/* Benefits */}
      <Field label="Benefits" hint="Comma-separated, or click suggestions below">
        <input
          className={styles.control}
          placeholder="e.g. Health Insurance, Provident Fund"
          value={joinComma(jobForm.Benefits)}
          onChange={(e) =>
            setJobForm((p) => ({ ...p, Benefits: splitComma(e.target.value) }))
          }
        />
      </Field>

      <div className={styles.chipRow}>
        {suggestedBenefits.map((b) => (
          <button
            key={b}
            type="button"
            className={`btn btn-border btn-sm mr-10 mb-10 ${
              jobForm.Benefits.includes(b) ? "btn-brand-1" : ""
            }`}
            onClick={() =>
              setJobForm((p) => ({
                ...p,
                Benefits: p.Benefits.includes(b)
                  ? p.Benefits.filter((x) => x !== b)
                  : [...p.Benefits, b],
              }))
            }
          >
            {b}
          </button>
        ))}
      </div>

      {/* Tags */}
      <Field label="Job Tags" hint="Comma-separated search tags">
        <input
          className={styles.control}
          placeholder="e.g. blue-collar, urgent, offshore"
          value={joinComma(jobForm.Tags)}
          onChange={(e) =>
            setJobForm((p) => ({ ...p, Tags: splitComma(e.target.value) }))
          }
        />
      </Field>
    </StepCard>
  );
}

/* ─── STEP 4 – Eligibility ────────────────────────────────────────────────── */
function Step4({ go, jobForm, setJobForm, onSubmit }) {
  return (
    <StepCard
      stepNum={4}
      title="Eligibility"
      subtitle="Candidate eligibility criteria"
      onBack={() => go(3)}
      onContinue={onSubmit}
    >
      <div className={styles.grid2}>
        <Field label="Number of Vacancies" required>
          <input
            type="number"
            min={1}
            className={styles.control}
            value={jobForm.Vacancies}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, Vacancies: e.target.value }))
            }
          />
        </Field>

        <Field label="Education Required" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.EducationRequired}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, EducationRequired: e.target.value }))
            }
          >
            <option value="Any">Any</option>
            <option value="Below_10th">Below 10th</option>
            <option value="10th_Pass">10th Pass</option>
            <option value="12th_Pass">12th Pass</option>
            <option value="ITI_Diploma">ITI / Diploma</option>
            <option value="Graduate">Graduate</option>
            <option value="Post_Graduate">Post Graduate</option>
          </select>
        </Field>

        <Field label="Minimum Age">
          <input
            type="number"
            min={18}
            max={99}
            className={styles.control}
            value={jobForm.AgeMin}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, AgeMin: e.target.value }))
            }
          />
        </Field>

        <Field label="Maximum Age">
          <input
            type="number"
            min={18}
            max={99}
            className={styles.control}
            value={jobForm.AgeMax}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, AgeMax: e.target.value }))
            }
          />
        </Field>

        <Field label="Gender Preferred">
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.GenderPreferred}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, GenderPreferred: e.target.value }))
            }
          >
            <option value="Any">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </Field>

        <Field label="Disability Eligible">
          <div style={{ paddingTop: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={jobForm.DisabilityEligible}
                onChange={(e) =>
                  setJobForm((p) => ({
                    ...p,
                    DisabilityEligible: e.target.checked,
                  }))
                }
              />
              Open to persons with disabilities
            </label>
          </div>
        </Field>

        <Field label="Passport Required">
          <div style={{ paddingTop: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={jobForm.PassportRequired}
                onChange={(e) =>
                  setJobForm((p) => ({
                    ...p,
                    PassportRequired: e.target.checked,
                    PassportValidityMonths: e.target.checked
                      ? p.PassportValidityMonths
                      : "",
                  }))
                }
              />
              Passport is required
            </label>
          </div>
        </Field>

        {jobForm.PassportRequired && (
          <Field
            label="Passport Validity Required (Months)"
            hint="Minimum remaining validity"
          >
            <input
              type="number"
              min={1}
              max={120}
              className={styles.control}
              value={jobForm.PassportValidityMonths}
              onChange={(e) =>
                setJobForm((p) => ({
                  ...p,
                  PassportValidityMonths: e.target.value,
                }))
              }
            />
          </Field>
        )}
      </div>
    </StepCard>
  );
}

/* ─── STEP 5 – Location ───────────────────────────────────────────────────── */
function Step5({ go, jobForm, setJobForm, onSubmit }) {
  const isOnshore = jobForm.LocationType === "Onshore";

  return (
    <StepCard
      stepNum={5}
      title="Location"
      subtitle="Job location details"
      onBack={() => go(4)}
      onContinue={onSubmit}
    >
      <div className={styles.grid2}>
        {/* Location Type */}
        <Field label="Location Type" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.LocationType}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, LocationType: e.target.value }))
            }
          >
            <option value="Onshore">Onshore</option>
            <option value="Offshore">Offshore</option>
          </select>
        </Field>

        {/* General Country */}
        <Field label="Country" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.Country}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, Country: e.target.value }))
            }
          >
            <option value="India">India</option>
            <option value="UAE">UAE</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Qatar">Qatar</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Bahrain">Bahrain</option>
            <option value="Oman">Oman</option>
            <option value="Singapore">Singapore</option>
            <option value="Malaysia">Malaysia</option>
          </select>
        </Field>

        {/* Work Address Line (both types) */}
        <Field label="Work Address / Site" style={{ gridColumn: "1/-1" }}>
          <input
            className={styles.control}
            placeholder="e.g. Plot 12, Industrial Area, Phase 2"
            value={jobForm.WorkAddressLine}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, WorkAddressLine: e.target.value }))
            }
          />
        </Field>

        {/* ── ONSHORE fields ── */}
        {isOnshore && (
          <>
            <Field label="City" required>
              <input
                className={styles.control}
                value={jobForm.OnshoreCity}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, OnshoreCity: e.target.value }))
                }
              />
            </Field>

            <Field label="State / Province" required>
              <input
                className={styles.control}
                value={jobForm.OnshoreState}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, OnshoreState: e.target.value }))
                }
              />
            </Field>

            <Field label="Onshore Country">
              <input
                className={styles.control}
                placeholder="e.g. India"
                value={jobForm.OnshoreCountry}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, OnshoreCountry: e.target.value }))
                }
              />
            </Field>

            <Field label="Pin / Zip Code">
              <input
                className={styles.control}
                value={jobForm.OnshorePincode}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, OnshorePincode: e.target.value }))
                }
              />
            </Field>
          </>
        )}

        {/* ── OFFSHORE fields ── */}
        {!isOnshore && (
          <>
            <Field label="Vessel / Platform Name" required>
              <input
                className={styles.control}
                value={jobForm.OffshoreVesselName}
                onChange={(e) =>
                  setJobForm((p) => ({
                    ...p,
                    OffshoreVesselName: e.target.value,
                  }))
                }
              />
            </Field>

            <Field label="Offshore Region" required>
              <select
                className={`${styles.control} ${styles.selectControl}`}
                value={jobForm.OffshoreRegion}
                onChange={(e) =>
                  setJobForm((p) => ({
                    ...p,
                    OffshoreRegion: e.target.value,
                  }))
                }
              >
                <option value="">Select Region</option>
                <option value="Arabian Gulf">Arabian Gulf</option>
                <option value="North Sea">North Sea</option>
                <option value="South China Sea">South China Sea</option>
                <option value="Indian Ocean">Indian Ocean</option>
                <option value="Gulf of Mexico">Gulf of Mexico</option>
                <option value="West Africa">West Africa</option>
              </select>
            </Field>

            <Field label="Offshore Country">
              <input
                className={styles.control}
                placeholder="e.g. UAE"
                value={jobForm.OffshoreCountry}
                onChange={(e) =>
                  setJobForm((p) => ({
                    ...p,
                    OffshoreCountry: e.target.value,
                  }))
                }
              />
            </Field>
          </>
        )}
      </div>
    </StepCard>
  );
}

/* ─── STEP 6 – Screening Questions ───────────────────────────────────────── */
function Step6({ go, jobForm, setJobForm, onSubmit }) {
  const addQuestion = () => {
    setJobForm((p) => ({
      ...p,
      questions: [
        ...p.questions,
        { questionText: "", answerType: "string", isMandatory: false },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setJobForm((p) => ({
      ...p,
      questions: p.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index, field, value) => {
    setJobForm((p) => ({
      ...p,
      questions: p.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  return (
    <StepCard
      stepNum={6}
      title="Questions"
      subtitle="Screening questions for applicants"
      onBack={() => go(5)}
      onContinue={onSubmit}
    >
      {jobForm.questions.map((question, index) => (
        <div
          key={index}
          style={{
            marginBottom: 20,
            padding: 15,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <Field label={`Question ${index + 1}`}>
            <input
              className={styles.control}
              value={question.questionText}
              onChange={(e) =>
                updateQuestion(index, "questionText", e.target.value)
              }
              placeholder="e.g. Do you have a valid CSWIP 3.1 certificate?"
            />
          </Field>

          <Field label="Answer Type">
            <select
              className={`${styles.control} ${styles.selectControl}`}
              value={question.answerType}
              onChange={(e) =>
                updateQuestion(index, "answerType", e.target.value)
              }
            >
              <option value="string">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Yes / No</option>
            </select>
          </Field>

          <Field label="Mandatory">
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={question.isMandatory}
                onChange={(e) =>
                  updateQuestion(index, "isMandatory", e.target.checked)
                }
              />
              Required answer
            </label>
          </Field>

          {jobForm.questions.length > 1 && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => removeQuestion(index)}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button type="button" className="btn btn-border" onClick={addQuestion}>
        + Add Question
      </button>
    </StepCard>
  );
}

/* ─── STEP 7 – Publishing ─────────────────────────────────────────────────── */
function Step7({ go, jobForm, setJobForm, onSubmit }) {
  const availableTags = [
    "Urgent Hiring",
    "Featured",
    "Blue Collar",
    "Offshore",
    "Onshore",
    "Skilled Worker",
    "Walk-in",
    "Immediate Joiner",
  ];

  const toggleTag = (tag) => {
    setJobForm((p) => ({
      ...p,
      PublishingTags: p.PublishingTags.includes(tag)
        ? p.PublishingTags.filter((t) => t !== tag)
        : [...p.PublishingTags, tag],
    }));
  };

  return (
    <StepCard
      stepNum={7}
      title="Publishing"
      subtitle="Set visibility and publish your job"
      onBack={() => go(6)}
      onContinue={onSubmit}
      isLast
    >
      <div className={styles.grid2}>
        {/* Application Deadline */}
        <Field label="Application Deadline" required>
          <input
            type="date"
            className={styles.control}
            value={jobForm.ApplicationDeadline}
            onChange={(e) =>
              setJobForm((p) => ({
                ...p,
                ApplicationDeadline: e.target.value,
              }))
            }
          />
        </Field>

        {/* Company Visibility */}
        <Field label="Company Visibility">
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.CompanyVisibility}
            onChange={(e) =>
              setJobForm((p) => ({
                ...p,
                CompanyVisibility: e.target.value,
              }))
            }
          >
            <option value="ShowName">Show Company Name</option>
            <option value="HideName">Hide Company Name</option>
          </select>
        </Field>

        {/* Job Type (for publishing context — maps to API JobType) */}
        <Field label="Job Post Type">
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.JobType}
            onChange={(e) =>
              setJobForm((p) => ({ ...p, JobType: e.target.value }))
            }
          >
            {jobPostTypes.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Publish Now */}
        <Field label="Publish Now">
          <div style={{ paddingTop: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={jobForm.PublishNow}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, PublishNow: e.target.checked }))
                }
              />
              Publish immediately after saving
            </label>
          </div>
        </Field>
      </div>

      {/* Publishing Tags */}
      <Field label="Publishing Tags" hint="Select all that apply">
        <div className={styles.chipRow}>
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`btn btn-sm ${
                jobForm.PublishingTags.includes(tag)
                  ? "btn-brand-1"
                  : "btn-border"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </Field>
    </StepCard>
  );
}

const STEP_VIEWS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7];

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function DashboardPostJobPage() {
  const router = useRouter();
  const [editJobId, setEditJobId] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [jdSuggestions, setJdSuggestions] = useState([]);
  const [additionalJdSuggestions, setAdditionalJdSuggestions] = useState([]);
  const [ghostSuggestion, setGhostSuggestion] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ── initial state – every API field present ── */
  const [jobForm, setJobForm] = useState({
    // Step 1
    JobTitle: "",
    TradeCategory: roleCategories[0],
    Role: "",
    ExperienceMinYears: "",
    ExperienceMaxYears: "",
    JobType: "Normal_Job",
    EmploymentType: "Full_Time",
    EmploymentMode: "Onsite",
    Department: "",
    DutyHoursPerDay: "",
    PaidOvertime: false,
    KeyResponsibilities: [],   // step-1 copy (also sent in step-1 payload)
    JobDescription: "",

    // Step 2
    SalaryMin: "",
    SalaryMax: "",
    SalaryCurrency: "INR",
    SalaryDisplayOption: "Show_Range",

    // Step 3
    KeySkills: [],
    Step3KeyResponsibilities: [],  // step-3 separate field
    AdditionalJobDescription: "",
    LicenceDocsRequired: "",
    LanguageRequired: "",
    Benefits: [],
    Tags: [],

    // Step 4
    Vacancies: "1",
    EducationRequired: "Any",
    AgeMin: "",
    AgeMax: "",
    GenderPreferred: "Any",
    DisabilityEligible: false,
    PassportRequired: false,
    PassportValidityMonths: "",

    // Step 5
    LocationType: "Onshore",
    Country: "India",
    WorkAddressLine: "",
    OnshoreCity: "",
    OnshoreState: "",
    OnshoreCountry: "",
    OnshorePincode: "",
    OffshoreVesselName: "",
    OffshoreRegion: "",
    OffshoreCountry: "",

    // Step 6
    questions: [{ questionText: "", answerType: "string", isMandatory: false }],

    // Step 7
    ApplicationDeadline: "",
    CompanyVisibility: "ShowName",
    PublishingTags: [],
    PublishNow: true,
  });

  /* ── read ?jobId from URL on mount ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setEditJobId(params.get("jobId"));
  }, []);

  /* ── load draft or edit job on mount ── */
  useEffect(() => {
    if (editJobId) {
      loadJobForEdit(editJobId);
    } else {
      loadDraft();
    }
  }, [editJobId]);

  /* ── inline AI suggestions ── */
  useEffect(() => {
    const timer = setTimeout(() => fetchInlineSuggestions(jobForm.JobDescription, "job"), 1200);
    return () => clearTimeout(timer);
  }, [jobForm.JobDescription]);

  useEffect(() => {
    const timer = setTimeout(() => fetchInlineSuggestions(jobForm.AdditionalJobDescription, "additional"), 1200);
    return () => clearTimeout(timer);
  }, [jobForm.AdditionalJobDescription]);

  /* ── helpers ── */
  const go = (n) => {
    setActiveStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateDraft = (response) => {
    localStorage.setItem(
      "jobDraft",
      JSON.stringify({
        jobId: response.jobId,
        currentStep: response.stepStatus.lastCompletedStep + 1,
        lastCompletedStep: response.stepStatus.lastCompletedStep,
      })
    );
  };

  /* ── map resume API response → jobForm ── */
  const mapResumeToForm = (response) => ({
    // Step 1
    JobTitle: response.step1Data?.jobTitle ?? "",
    TradeCategory: response.step1Data?.tradeCategory ?? roleCategories[0],
    Role: response.step1Data?.role ?? "",
    ExperienceMinYears: response.step1Data?.experienceMinYears ?? "",
    ExperienceMaxYears: response.step1Data?.experienceMaxYears ?? "",
    JobType: response.step1Data?.jobType ?? "Normal_Job",
    EmploymentType: response.step1Data?.employmentType ?? "Full_Time",
    EmploymentMode: response.step1Data?.employmentMode ?? "Onsite",
    Department: response.step1Data?.department ?? "",
    DutyHoursPerDay: response.step1Data?.dutyHoursPerDay ?? "",
    PaidOvertime: response.step1Data?.paidOvertime ?? false,
    KeyResponsibilities: response.step1Data?.keyResponsibilities ?? [],
    JobDescription: response.step1Data?.jobDescription ?? "",

    // Step 2
    SalaryMin: response.step2Data?.salaryMin?.toString() ?? "",
    SalaryMax: response.step2Data?.salaryMax?.toString() ?? "",
    SalaryCurrency: response.step2Data?.salaryCurrency ?? "INR",
    SalaryDisplayOption: response.step2Data?.salaryDisplayOption ?? "Show_Range",

    // Step 3
    KeySkills: response.step3Data?.keySkills ?? [],
    Step3KeyResponsibilities: response.step3Data?.keyResponsibilities ?? [],
    AdditionalJobDescription: response.step3Data?.additionalJobDescription ?? "",
    LicenceDocsRequired: response.step3Data?.licenceDocsRequired ?? "",
    LanguageRequired: response.step3Data?.languageRequired ?? "",
    Benefits: response.step3Data?.benefits ?? [],
    Tags: response.step3Data?.tags ?? [],

    // Step 4
    Vacancies: response.step4Data?.vacancies ?? 1,
    EducationRequired: response.step4Data?.educationRequired ?? "Any",
    AgeMin: response.step4Data?.ageMin ?? "",
    AgeMax: response.step4Data?.ageMax ?? "",
    GenderPreferred: response.step4Data?.genderPreferred ?? "Any",
    DisabilityEligible: response.step4Data?.disabilityEligible ?? false,
    PassportRequired: response.step4Data?.passportRequired ?? false,
    PassportValidityMonths: response.step4Data?.passportValidityMonths ?? "",

    // Step 5
    LocationType: response.step5Data?.locationType ?? "Onshore",
    Country: response.step5Data?.country ?? "India",
    WorkAddressLine: response.step5Data?.workAddressLine ?? "",
    OnshoreCity: response.step5Data?.onshoreCity ?? "",
    OnshoreState: response.step5Data?.onshoreState ?? "",
    OnshoreCountry: response.step5Data?.onshoreCountry ?? "",
    OnshorePincode: response.step5Data?.onshorePincode ?? "",
    OffshoreVesselName: response.step5Data?.offshoreVesselName ?? "",
    OffshoreRegion: response.step5Data?.offshoreRegion ?? "",
    OffshoreCountry: response.step5Data?.offshoreCountry ?? "",

    // Step 6
    questions: response.step6Data?.questions?.length
      ? response.step6Data.questions
      : [{ questionText: "", answerType: "string", isMandatory: false }],

    // Step 7 – publishing data isn't returned in resume, keep defaults
    ApplicationDeadline: "",
    CompanyVisibility: "ShowName",
    PublishingTags: [],
    PublishNow: true,
  });

  const loadJobForEdit = async (id) => {
    try {
      const response = await getJobResume(id);
      setJobId(id);
      setJobForm((prev) => ({ ...prev, ...mapResumeToForm(response) }));
      const nextStep =
        response.stepStatus?.lastCompletedStep >= 7
          ? 7
          : (response.stepStatus?.lastCompletedStep ?? 0) + 1;
      setActiveStep(nextStep);
    } catch (error) {
      console.error("loadJobForEdit:", error);
    }
  };

  const loadDraft = async () => {
    try {
      const draft = localStorage.getItem("jobDraft");
      if (!draft) return;
      const parsed = JSON.parse(draft);
      if (!parsed?.jobId) return;
      setJobId(parsed.jobId);
      const response = await getJobResume(parsed.jobId);
      setJobForm((prev) => ({ ...prev, ...mapResumeToForm(response) }));
      const nextStep =
        response.stepStatus.lastCompletedStep >= 7
          ? 7
          : response.stepStatus.lastCompletedStep + 1;
      setActiveStep(nextStep);
    } catch (error) {
      console.error("loadDraft:", error);
    }
  };

  /* ── AI JD generation ── */
  const handleGenerateJD = async () => {
    try {
      setLoadingAI(true);
      const response = await generateJobDescription({
        jobTitle: jobForm.JobTitle,
        role: jobForm.Role,
        tradeCategory: jobForm.TradeCategory,
        experienceMinYears: jobForm.ExperienceMinYears,
        experienceMaxYears: jobForm.ExperienceMaxYears,
        jobType: jobForm.JobType,
        employmentType: jobForm.EmploymentType,
      });
      setJobForm((p) => ({
        ...p,
        JobDescription: response.generatedDescription,
        KeySkills: response.suggestedSkills ?? [],
      }));
    } catch (error) {
      console.error("generateJD:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const fetchInlineSuggestions = async (currentText, target = "job") => {
    if (!currentText || currentText.length < 20) return;
    const shouldSuggest =
      currentText.endsWith(" ") ||
      currentText.endsWith(".") ||
      currentText.endsWith(",");
    if (!shouldSuggest) return;
    try {
      const response = await getInlineSuggestion({
        jobTitle: jobForm.JobTitle,
        role: jobForm.Role,
        tradeCategory: jobForm.TradeCategory,
        experienceMinYears: jobForm.ExperienceMinYears,
        jobType: jobForm.JobType,
        currentText,
      });
      if (target === "job") {
        const suggestions = response.suggestions ?? [];
        setJdSuggestions(suggestions);
        setGhostSuggestion(suggestions[0] ?? "");
      } else {
        setAdditionalJdSuggestions(response.suggestions ?? []);
      }
    } catch (error) {
      console.error("inlineSuggestion:", error);
    }
  };

  const handleJDTab = (e) => {
    if (e.key === "Tab" && ghostSuggestion) {
      e.preventDefault();
      setJobForm((p) => ({
        ...p,
        JobDescription: p.JobDescription.trimEnd() + " " + ghostSuggestion,
      }));
      setGhostSuggestion("");
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     STEP SUBMIT HANDLERS
  ══════════════════════════════════════════════════════════════════════════ */

  const handleStep1 = async () => {
    if (!jobForm.JobTitle.trim()) return alert("Job Title is required");
    if (!jobForm.TradeCategory) return alert("Trade Category is required");
    if (!jobForm.JobDescription.trim()) return alert("Job Description is required");
    if (!jobForm.EmploymentType) return alert("Employment Type is required");
    if (!jobForm.EmploymentMode) return alert("Employment Mode is required");

    setLoading(true);
    try {
      const response = await saveJobDetails({
        JobId: jobId ?? "",
        JobTitle: jobForm.JobTitle,
        TradeCategory: jobForm.TradeCategory,
        Role: jobForm.Role,
        ExperienceMinYears: jobForm.ExperienceMinYears,
        ExperienceMaxYears: jobForm.ExperienceMaxYears,
        JobType: jobForm.JobType,
        EmploymentType: jobForm.EmploymentType,
        EmploymentMode: jobForm.EmploymentMode,
        Department: jobForm.Department,
        DutyHoursPerDay: jobForm.DutyHoursPerDay,
        PaidOvertime: jobForm.PaidOvertime,
        KeyResponsibilities: jobForm.KeyResponsibilities,
        JobDescription: jobForm.JobDescription,
      });
      setJobId(response.jobId);
      updateDraft(response);
      go(2);
    } catch (error) {
      console.error("Step 1:", error?.response?.data ?? error);
      alert("Failed to save job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!jobForm.SalaryMin) return alert("Minimum Salary is required");
    if (!jobForm.SalaryMax) return alert("Maximum Salary is required");

    setLoading(true);
    try {
      const response = await saveCompensation(jobId, {
        SalaryMin: jobForm.SalaryMin,
        SalaryMax: jobForm.SalaryMax,
        SalaryCurrency: jobForm.SalaryCurrency,
        SalaryDisplayOption: jobForm.SalaryDisplayOption,
      });
      updateDraft(response);
      go(3);
    } catch (error) {
      console.error("Step 2:", error?.response?.data ?? error);
      alert("Failed to save compensation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    setLoading(true);
    try {
      const response = await saveSkills(jobId, {
        KeySkills: jobForm.KeySkills,
        KeyResponsibilities: jobForm.Step3KeyResponsibilities,
        AdditionalJobDescription: jobForm.AdditionalJobDescription,
        LicenceDocsRequired: jobForm.LicenceDocsRequired,
        LanguageRequired: jobForm.LanguageRequired,
        Benefits: jobForm.Benefits,
        Tags: jobForm.Tags,
      });
      updateDraft(response);
      go(4);
    } catch (error) {
      console.error("Step 3:", error?.response?.data ?? error);
      alert("Failed to save skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep4 = async () => {
    if (!jobForm.Vacancies) return alert("Number of Vacancies is required");

    setLoading(true);
    try {
      const response = await saveEligibility(jobId, {
        Vacancies: jobForm.Vacancies,
        EducationRequired: jobForm.EducationRequired,
        AgeMin: jobForm.AgeMin,
        AgeMax: jobForm.AgeMax,
        GenderPreferred: jobForm.GenderPreferred,
        DisabilityEligible: jobForm.DisabilityEligible,
        PassportRequired: jobForm.PassportRequired,
        PassportValidityMonths: jobForm.PassportValidityMonths,
      });
      updateDraft(response);
      go(5);
    } catch (error) {
      console.error("Step 4:", error?.response?.data ?? error);
      alert("Failed to save eligibility. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep5 = async () => {
    if (!jobForm.LocationType) return alert("Location Type is required");

    setLoading(true);
    try {
      const response = await saveLocation(jobId, {
        LocationType: jobForm.LocationType,
        Country: jobForm.Country,
        WorkAddressLine: jobForm.WorkAddressLine,
        OnshoreCity: jobForm.OnshoreCity,
        OnshoreState: jobForm.OnshoreState,
        OnshoreCountry: jobForm.OnshoreCountry,
        OnshorePincode: jobForm.OnshorePincode,
        OffshoreVesselName: jobForm.OffshoreVesselName,
        OffshoreRegion: jobForm.OffshoreRegion,
        OffshoreCountry: jobForm.OffshoreCountry,
      });
      updateDraft(response);
      go(6);
    } catch (error) {
      console.error("Step 5:", error?.response?.data ?? error);
      alert("Failed to save location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep6 = async () => {
    setLoading(true);
    try {
      const response = await saveQuestions(jobId, {
        questions: jobForm.questions,
      });
      updateDraft(response);
      go(7);
    } catch (error) {
      console.error("Step 6:", error?.response?.data ?? error);
      alert("Failed to save questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep7 = async () => {
    if (!jobForm.ApplicationDeadline)
      return alert("Application Deadline is required");

    setLoading(true);
    try {
      await publishJob({
        JobId: jobId,
        ApplicationDeadline: jobForm.ApplicationDeadline,
        CompanyVisibility: jobForm.CompanyVisibility,
        JobType: jobForm.JobType,
        PublishingTags: jobForm.PublishingTags,
        PublishNow: jobForm.PublishNow,
      });
      localStorage.removeItem("jobDraft");
      router.push("/employeer/job-list?success=job-published");
    } catch (error) {
      console.error("Step 7:", error?.response?.data ?? error);
      alert("Failed to publish job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepHandlers = [
    handleStep1,
    handleStep2,
    handleStep3,
    handleStep4,
    handleStep5,
    handleStep6,
    handleStep7,
  ];

  const ActiveStep = STEP_VIEWS[activeStep - 1] ?? Step7;

  /* ── render ── */
  return (
    <main className="main">
      <section className={`section-box mt-50 mb-50 ${styles.pageSection}`}>
        <div className={`container ${styles.layout}`}>
          <div className={styles.content}>
            {/* Header */}
            <div className="box-filters-job">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h3 className="mb-5">Post a Job</h3>
                  <span className="font-sm color-text-paragraph-2">
                    Create normal, hot vacancy, and classified posts in the same
                    employer workflow.
                  </span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <div className={styles.headerActions}>
                    <button
                      className={`btn btn-default btn-sm ${styles.btnSoft}`}
                      disabled={!jobId || loading}
                      onClick={async () => {
                        if (!jobId) return;
                        try {
                          await saveDraft(jobId);
                          alert("Draft saved!");
                        } catch (error) {
                          console.error(error);
                          alert("Could not save draft.");
                        }
                      }}
                    >
                      Save Draft
                    </button>
                    <button className="btn btn-default btn-sm">Preview</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <StepProgressBar activeStep={activeStep} />

            {/* Active step */}
            <div className={styles.body}>
              <div className={styles.fullFormPanel}>
                {loading && (
                  <div style={{ textAlign: "center", padding: "10px 0", fontWeight: 600, color: "#555" }}>
                    Saving…
                  </div>
                )}

                <ActiveStep
                  go={go}
                  jobForm={jobForm}
                  setJobForm={setJobForm}
                  onSubmit={stepHandlers[activeStep - 1] ?? (() => {})}
                  handleGenerateJD={handleGenerateJD}
                  loadingAI={loadingAI}
                  jdSuggestions={jdSuggestions}
                  additionalJdSuggestions={additionalJdSuggestions}
                  ghostSuggestion={ghostSuggestion}
                  handleJDTab={handleJDTab}
                />

                <div className={styles.bottomLink}>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}