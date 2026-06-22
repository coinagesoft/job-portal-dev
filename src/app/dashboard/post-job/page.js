"use client";

import React, { useState, useEffect } from "react";

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
const employmentTypes = [
  "Permanent",
  "Temporary",
  "Contract",
  "Freelance",
  "Internship / Trainee",
  "Apprenticeship",
  "Part-Time Employment",
  "Full-Time Employment",
];
const suggestedSkills = [
  "Java",
  "JavaScript",
  "Spring Boot",
  "Welding Inspection",
  "Safety Compliance",
  "AutoCAD",
];
const defaultSkills = [
  { name: "Java", priority: "primary" },
  { name: "Spring Boot", priority: "secondary" },
  { name: "Safety Compliance", priority: "secondary" },
];
const screeningQs = [
  {
    id: "exp-check",
    question: "Do you have 3+ years of relevant experience?",
    answerType: "Yes / No",
    required: true,
  },
  {
    id: "reloc-check",
    question: "Are you willing to relocate for this role?",
    answerType: "Yes / No",
    required: true,
  },
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

/* ─── Top progress bar (same pattern as candidate profile page) ───────────── */
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
function StepCard({
  stepNum,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  isLast,
}) {
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

/* ─── Individual step content ─────────────────────────────────────────────── */
function Step1({ go, jobForm, setJobForm, onSubmit }) {
  return (
    <StepCard
      stepNum={1}
      title="Job Details"
      subtitle="Core role information"
      onContinue={onSubmit}
      isFirst
    >
      <Field label="Job Title" required>
        <input
          className={styles.control}
          value={jobForm.JobTitle}
          onChange={(e) =>
            setJobForm((prev) => ({
              ...prev,
              JobTitle: e.target.value,
            }))
          }
        />
      </Field>
      <div className={styles.grid2}>
        <Field label="Role Category" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.TradeCategory}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                TradeCategory: e.target.value,
              }))
            }
          >
            {roleCategories.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Experience (yrs)" required>
          <input
            type="number"
            className={styles.control}
            value={jobForm.ExperienceRequiredYears}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                ExperienceRequiredYears: Number(e.target.value),
              }))
            }
          />
        </Field>
        <Field label="Job Type" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.JobType}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                JobType: e.target.value,
              }))
            }
          >
            {jobPostTypes.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Employment Type" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.EmploymentType}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                EmploymentType: e.target.value,
              }))
            }
          >
            {employmentTypes.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Job Description" required>
        <textarea
          className={styles.textarea}
          value={jobForm.JobDescription}
          onChange={(e) =>
            setJobForm((prev) => ({
              ...prev,
              JobDescription: e.target.value,
            }))
          }
        />
      </Field>
    </StepCard>
  );
}

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
            className={styles.control}
            value={jobForm.SalaryMin}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                SalaryMin: e.target.value,
              }))
            }
          />{" "}
        </Field>
        <Field label="Max Salary" required>
          <input
            className={styles.control}
            value={jobForm.SalaryMax}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                SalaryMax: e.target.value,
              }))
            }
          />
        </Field>
        <Field label="Currency" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.SalaryCurrency}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                SalaryCurrency: e.target.value,
              }))
            }
          >
            <option>INR</option>
            <option>USD</option>
          </select>
        </Field>
        <Field label="Salary Visibility" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.SalaryDisplayOption}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                SalaryDisplayOption: e.target.value,
              }))
            }
          >
            <option value="Show_Range">Show Range</option>

            <option value="Hide_Salary">Hide Salary</option>
          </select>
        </Field>
      </div>
    </StepCard>
  );
}

function Step3({ go }) {
  return (
    <StepCard
      stepNum={3}
      title="Skills & JD"
      subtitle="Skills and description"
      onBack={() => go(2)}
      onContinue={() => go(4)}
    >
      <Field label="Key Skills" required>
        <input className={styles.control} defaultValue="Java, Spring Boot" />
      </Field>
      <div className={styles.chipRow}>
        {suggestedSkills.map((s) => (
          <button
            key={s}
            type="button"
            className="btn btn-border btn-sm mr-10 mb-10"
          >
            {s}
          </button>
        ))}
      </div>
      <div className={styles.skillPriorityList}>
        {defaultSkills.map((sk) => (
          <div key={sk.name} className={styles.skillPriorityItem}>
            <div>
              <strong className={styles.skillName}>{sk.name}</strong>
              <p className={styles.skillHint}>Selected Skill</p>
            </div>
            <span
              className={
                sk.priority === "primary"
                  ? styles.skillPrimaryBadge
                  : styles.skillSecondaryBadge
              }
            >
              {sk.priority}
            </span>
          </div>
        ))}
      </div>
      <Field label="Additional Job Description" required>
        <textarea className={styles.textarea} />
      </Field>
    </StepCard>
  );
}

function Step4({ go }) {
  return (
    <StepCard
      stepNum={4}
      title="Eligibility"
      subtitle="Candidate eligibility"
      onBack={() => go(3)}
      onContinue={() => go(5)}
    >
      <div className={styles.grid2}>
        <Field label="Vacancies" required>
          <input className={styles.control} defaultValue="3" />
        </Field>
        <Field label="Education" required>
          <select className={`${styles.control} ${styles.selectControl}`}>
            <option>ITI / Diploma</option>
            <option>Graduate</option>
          </select>
        </Field>
        <Field label="Min Age" required>
          <input className={styles.control} defaultValue="21" />
        </Field>
        <Field label="Max Age" required>
          <input className={styles.control} defaultValue="40" />
        </Field>
      </div>
    </StepCard>
  );
}

function Step5({ go }) {
  return (
    <StepCard
      stepNum={5}
      title="Location"
      subtitle="Job location"
      onBack={() => go(4)}
      onContinue={() => go(6)}
    >
      <div className={styles.grid2}>
        <Field label="City" required>
          <input className={styles.control} defaultValue="Mumbai" />
        </Field>
        <Field label="Country" required>
          <input className={styles.control} defaultValue="India" />
        </Field>
      </div>
    </StepCard>
  );
}

function Step6({ go }) {
  return (
    <StepCard
      stepNum={6}
      title="Questions"
      subtitle="Screening questions"
      onBack={() => go(5)}
      onContinue={() => go(7)}
    >
      <div className={styles.questionList}>
        {screeningQs.map((q, i) => (
          <div key={q.id} className={styles.questionCard}>
            <div className={styles.questionCardHead}>
              <h6 className={styles.questionCardTitle}>Question {i + 1}</h6>
              <span
                className={
                  q.required ? styles.questionRequired : styles.questionOptional
                }
              >
                {q.required ? "Mandatory" : "Optional"}
              </span>
            </div>
            <p className={styles.questionCardText}>{q.question}</p>
            <input className={styles.control} defaultValue={q.answerType} />
          </div>
        ))}
      </div>
    </StepCard>
  );
}

function Step7({ go }) {
  return (
    <StepCard
      stepNum={7}
      title="Publishing"
      subtitle="Publish your job"
      onBack={() => go(6)}
      onContinue={() => {}}
      isLast
    >
      <div className={styles.inlinePanel}>
        <div className={styles.inlinePanelHead}>
          <h6 className={styles.inlinePanelTitle}>Ready to Publish</h6>
          <span className={styles.inlinePanelBadge}>Final Step</span>
        </div>
        <p className={styles.inlinePanelText}>
          Review all details before publishing.
        </p>
        <div className={styles.tagGroup}>
          <span className={styles.pillHot}>Hot Job</span>
          <span className={styles.pillUrgent}>Urgent Hiring</span>
          <span className={styles.pillNeutral}>Premium Listing</span>
        </div>
      </div>
    </StepCard>
  );
}

const STEP_VIEWS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7];

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function DashboardPostJobPage() {
  const [activeStep, setActiveStep] = useState(1);

  const [jobId, setJobId] = useState(null);

  const [loading, setLoading] = useState(false);
useEffect(() => {
  const draft = localStorage.getItem("jobDraft");

  if (!draft) return;

  const parsed = JSON.parse(draft);

  setJobId(parsed.jobId);
  setActiveStep(parsed.currentStep);

  if (parsed.jobForm) {
    setJobForm(parsed.jobForm);
  }
}, []);
  const updateDraft = (response) => {
  localStorage.setItem(
    "jobDraft",
    JSON.stringify({
      jobId: response.jobId,
      currentStep: response.stepStatus.lastCompletedStep + 1,
      lastCompletedStep: response.stepStatus.lastCompletedStep,

      jobForm,
    })
  );
};
  const [jobForm, setJobForm] = useState({
    JobTitle: "",
    TradeCategory: roleCategories[0],
    Role: "",
    ExperienceRequiredYears: 0,
    JobType: "Normal_Job",
    EmploymentType: "Permanent",
    JobDescription: "",

    SalaryMin: "",
    SalaryMax: "",
    SalaryCurrency: "INR",
    SalaryDisplayOption: "Show_Range",

    KeySkills: [],
    AdditionalJobDescription: "",
    LicenceDocsRequired: "",
    LanguageRequired: "",

    Vacancies: "",
    EducationRequired: "",
    AgeMin: "",
    AgeMax: "",
    GenderPreferred: "",
    DisabilityEligible: false,
    PassportRequired: false,
    PassportValidityMonths: "",

    LocationType: "Onshore",
    OnshoreCity: "",
    OnshoreState: "",
    OffshoreVesselName: "",
    OffshoreRegion: "",
    Country: "",

    Questions: [],

    ApplicationDeadline: "",
    CompanyVisibility: "Show_Name",
    PublishingTags: [],
    PublishNow: true,
  });
  const handleStep1 = async () => {
    if (!jobForm.JobTitle.trim()) {
      alert("Job Title is required");
      return;
    }

    if (!jobForm.TradeCategory) {
      alert("Trade Category is required");
      return;
    }

    if (!jobForm.JobDescription.trim()) {
      alert("Job Description is required");
      return;
    }

    setLoading(true);

    try {
      const response = await saveJobDetails({
        JobId: jobId || "",
        JobTitle: jobForm.JobTitle,
        TradeCategory: jobForm.TradeCategory,
        Role: jobForm.Role,
        ExperienceRequiredYears: jobForm.ExperienceRequiredYears,
        JobType: jobForm.JobType,
        EmploymentType: jobForm.EmploymentType,
        JobDescription: jobForm.JobDescription,
      });

      setJobId(response.jobId);

      updateDraft(response);

      go(2);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!jobForm.SalaryMin) {
      alert("Salary Min is required");
      return;
    }

    if (!jobForm.SalaryMax) {
      alert("Salary Max is required");
      return;
    }
    setLoading(true);

    try {
      const response = await saveCompensation(jobId, {
        SalaryMin: Number(jobForm.SalaryMin),
        SalaryMax: Number(jobForm.SalaryMax),
        SalaryCurrency: jobForm.SalaryCurrency,
        SalaryDisplayOption: jobForm.SalaryDisplayOption,
      });

      updateDraft(response);

      go(3);
    } catch (error) {
      console.error("Step 2 Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const go = (n) => {
    setActiveStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ActiveStep = STEP_VIEWS[activeStep - 1];

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
                      onClick={async () => {
                        if (!jobId) return;

                        try {
                          await saveDraft(jobId);

                          alert("Draft Saved");
                        } catch (error) {
                          console.error(error);
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

            {/* Progress bar — one step at a time, same as candidate profile page */}
            <StepProgressBar activeStep={activeStep} />

            {/* Active step only */}
            <div className={styles.body}>
              <div className={styles.fullFormPanel}>
                <ActiveStep
                  go={go}
                  jobForm={jobForm}
                  setJobForm={setJobForm}
                  onSubmit={
                    activeStep === 1
                      ? handleStep1
                      : activeStep === 2
                        ? handleStep2
                        : () => {}
                  }
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
