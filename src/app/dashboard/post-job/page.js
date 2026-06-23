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
  getJobResume,
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
function Step3({ go, jobForm, setJobForm, onSubmit }) {
  return (
    <StepCard
      stepNum={3}
      title="Skills & JD"
      subtitle="Skills and description"
      onBack={() => go(2)}
      onContinue={onSubmit}
    >
      <Field label="Key Skills *">
        <input
          className={styles.control}
          placeholder="Animation, Editing"
          value={jobForm.KeySkills.join(", ")}
          onChange={(e) =>
            setJobForm((prev) => ({
              ...prev,
              KeySkills: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }))
          }
        />
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

      <Field label="Additional Job Description">
        <textarea
          className={styles.textarea}
          rows={5}
          value={jobForm.AdditionalJobDescription}
          onChange={(e) =>
            setJobForm((prev) => ({
              ...prev,
              AdditionalJobDescription: e.target.value,
            }))
          }
        />
      </Field>

      <Field label="Licence / Documents Required">
        <input
          className={styles.control}
          placeholder="ITI Certificate"
          value={jobForm.LicenceDocsRequired}
          onChange={(e) =>
            setJobForm((prev) => ({
              ...prev,
              LicenceDocsRequired: e.target.value,
            }))
          }
        />
      </Field>

      <Field label="Language Required">
        <input
          className={styles.control}
          placeholder="English,Hindi"
          value={jobForm.LanguageRequired}
          onChange={(e) =>
            setJobForm((prev) => ({
              ...prev,
              LanguageRequired: e.target.value,
            }))
          }
        />
      </Field>
    </StepCard>
  );
}

function Step4({ go, jobForm, setJobForm, onSubmit }) {
  return (
    <StepCard
      stepNum={4}
      title="Eligibility"
      subtitle="Candidate eligibility"
      onBack={() => go(3)}
      onContinue={onSubmit}
    >
      <div className={styles.grid2}>
        <Field label="Vacancies" required>
          <input
            type="number"
            className={styles.control}
            value={jobForm.Vacancies}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                Vacancies: e.target.value,
              }))
            }
          />
        </Field>

        <Field label="Education Required" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.EducationRequired}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                EducationRequired: e.target.value,
              }))
            }
          >
            <option value="Any">Any</option>
            <option value="ITI / Diploma">ITI / Diploma</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
        </Field>

        <Field label="Minimum Age">
          <input
            type="number"
            className={styles.control}
            value={jobForm.AgeMin}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                AgeMin: e.target.value,
              }))
            }
          />
        </Field>

        <Field label="Maximum Age">
          <input
            type="number"
            className={styles.control}
            value={jobForm.AgeMax}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                AgeMax: e.target.value,
              }))
            }
          />
        </Field>

        <Field label="Gender Preferred">
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.GenderPreferred}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                GenderPreferred: e.target.value,
              }))
            }
          >
            <option value="Any">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </Field>

        <Field label="Disability Eligible">
          <div style={{ paddingTop: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={jobForm.DisabilityEligible}
                onChange={(e) =>
                  setJobForm((prev) => ({
                    ...prev,
                    DisabilityEligible: e.target.checked,
                  }))
                }
              />
              Yes
            </label>
          </div>
        </Field>

        <Field label="Passport Required">
          <div style={{ paddingTop: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={jobForm.PassportRequired}
                onChange={(e) =>
                  setJobForm((prev) => ({
                    ...prev,
                    PassportRequired: e.target.checked,
                  }))
                }
              />
              Yes
            </label>
          </div>
        </Field>

        {jobForm.PassportRequired && (
          <Field label="Passport Validity (Months)">
            <input
              type="number"
              className={styles.control}
              value={jobForm.PassportValidityMonths}
              onChange={(e) =>
                setJobForm((prev) => ({
                  ...prev,
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

function Step5({ go, jobForm, setJobForm, onSubmit }) {
  return (
    <StepCard
      stepNum={5}
      title="Location"
      subtitle="Job location details"
      onBack={() => go(4)}
      onContinue={onSubmit}
    >
      <div className={styles.grid2}>
        <Field label="Location Type" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.LocationType}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                LocationType: e.target.value,
              }))
            }
          >
            <option value="Onshore">Onshore</option>
            <option value="Offshore">Offshore</option>
          </select>
        </Field>

        <Field label="Country" required>
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.Country}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                Country: e.target.value,
              }))
            }
          >
            <option value="India">India</option>
            <option value="UAE">UAE</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Qatar">Qatar</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Singapore">Singapore</option>
          </select>
        </Field>

        {jobForm.LocationType === "Onshore" && (
          <>
            <Field label="City" required>
              <input
                className={styles.control}
                value={jobForm.OnshoreCity}
                onChange={(e) =>
                  setJobForm((prev) => ({
                    ...prev,
                    OnshoreCity: e.target.value,
                  }))
                }
              />
            </Field>

            <Field label="State" required>
              <input
                className={styles.control}
                value={jobForm.OnshoreState}
                onChange={(e) =>
                  setJobForm((prev) => ({
                    ...prev,
                    OnshoreState: e.target.value,
                  }))
                }
              />
            </Field>
          </>
        )}

        {jobForm.LocationType === "Offshore" && (
          <>
            <Field label="Vessel Name" required>
              <input
                className={styles.control}
                value={jobForm.OffshoreVesselName}
                onChange={(e) =>
                  setJobForm((prev) => ({
                    ...prev,
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
                  setJobForm((prev) => ({
                    ...prev,
                    OffshoreRegion: e.target.value,
                  }))
                }
              >
                <option value="">Select Region</option>
                <option value="Arabian Gulf">Arabian Gulf</option>
                <option value="North Sea">North Sea</option>
                <option value="South China Sea">South China Sea</option>
                <option value="Indian Ocean">Indian Ocean</option>
              </select>
            </Field>
          </>
        )}
      </div>
    </StepCard>
  );
}
function Step6({ go, jobForm, setJobForm, onSubmit }) {
  const addQuestion = () => {
    setJobForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          answerType: "string",
          isMandatory: false,
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setJobForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index, field, value) => {
    setJobForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q,
      ),
    }));
  };

  return (
    <StepCard
      stepNum={6}
      title="Questions"
      subtitle="Screening questions"
      onBack={() => go(5)} 
      onContinue={onSubmit}
    >
      {jobForm.questions.map((question, index) => (
        <div
          key={index}
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <Field label={`Question ${index + 1}`}>
            <input
              className={styles.control}
              value={question.questionText}
              onChange={(e) =>
                updateQuestion(index, "questionText", e.target.value)
              }
              placeholder="Enter question"
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
            <label>
              <input
                type="checkbox"
                checked={question.isMandatory}
                onChange={(e) =>
                  updateQuestion(index, "isMandatory", e.target.checked)
                }
              />
              Required
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

function Step7({ go, jobForm, setJobForm, onSubmit }) {
  const availableTags = [
    "Urgent Hiring",
    "Featured",
    "Blue Collar",
    "Offshore",
    "Onshore",
    "Skilled Worker",
  ];

  const toggleTag = (tag) => {
    setJobForm((prev) => ({
      ...prev,
      PublishingTags: prev.PublishingTags.includes(tag)
        ? prev.PublishingTags.filter((t) => t !== tag)
        : [...prev.PublishingTags, tag],
    }));
  };

  return (
    <StepCard
      stepNum={7}
      title="Publishing"
      subtitle="Publish your job"
      onBack={() => go(6)}
      onContinue={onSubmit}
    >
      <div className={styles.grid2}>
        <Field label="Application Deadline" required>
          <input
            type="date"
            className={styles.control}
            value={jobForm.ApplicationDeadline}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                ApplicationDeadline: e.target.value,
              }))
            }
          />
        </Field>

        <Field label="Company Visibility">
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.CompanyVisibility}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                CompanyVisibility: e.target.value,
              }))
            }
          >
            <option value="Show_Name">Show Company Name</option>
            <option value="Hide_Name">Hide Company Name</option>
          </select>
        </Field>

        <Field label="Publish Type">
          <select
            className={`${styles.control} ${styles.selectControl}`}
            value={jobForm.PublishJobType}
            onChange={(e) =>
              setJobForm((prev) => ({
                ...prev,
                PublishJobType: e.target.value,
              }))
            }
          >
            <option value="Normal">Normal</option>
            <option value="Featured">Featured</option>
            <option value="Premium">Premium</option>
          </select>
        </Field>

        <Field label="Publish Now">
          <div style={{ paddingTop: "12px" }}>
            <label>
              <input
                type="checkbox"
                checked={jobForm.PublishNow}
                onChange={(e) =>
                  setJobForm((prev) => ({
                    ...prev,
                    PublishNow: e.target.checked,
                  }))
                }
              />
              Publish Immediately
            </label>
          </div>
        </Field>
      </div>

      <Field label="Publishing Tags">
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
  const [activeStep, setActiveStep] = useState(1);

  const [jobId, setJobId] = useState(null);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadDraft();
  }, []);
  const updateDraft = (response) => {
    localStorage.setItem(
      "jobDraft",
      JSON.stringify({
        jobId: response.jobId,
        currentStep: response.stepStatus.lastCompletedStep + 1,
        lastCompletedStep: response.stepStatus.lastCompletedStep,

        jobForm,
      }),
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

    Vacancies: "1",
    EducationRequired: "Any",
    AgeMin: "",
    AgeMax: "",
    GenderPreferred: "Any",
    DisabilityEligible: false,
    PassportRequired: false,
    PassportValidityMonths: "",

    LocationType: "Onshore",
    OnshoreCity: "",
    OnshoreState: "",
    OffshoreVesselName: "",
    OffshoreRegion: "",
    Country: "India",

    // Step 6
    questions: [
      {
        questionText: "",
        answerType: "string",
        isMandatory: false,
      },
    ],

    // Step 7
    ApplicationDeadline: "",
    CompanyVisibility: "Show_Name",
    PublishJobType: "Normal",
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
  const handleStep3 = async () => {
    try {
      const response = await saveSkills(jobId, {
        KeySkills: jobForm.KeySkills,
        AdditionalJobDescription: jobForm.AdditionalJobDescription,
        LicenceDocsRequired: jobForm.LicenceDocsRequired,
        LanguageRequired: jobForm.LanguageRequired,
      });

      updateDraft(response);

      go(4);
    } catch (error) {
      console.error(error);
    }
  };
  const handleStep4 = async () => {
    try {
      const response = await saveEligibility(jobId, {
        Vacancies: Number(jobForm.Vacancies),

        EducationRequired: jobForm.EducationRequired,

        AgeMin: jobForm.AgeMin ? Number(jobForm.AgeMin) : null,

        AgeMax: jobForm.AgeMax ? Number(jobForm.AgeMax) : null,

        GenderPreferred: jobForm.GenderPreferred || "Any",

        DisabilityEligible: jobForm.DisabilityEligible,

        PassportRequired: jobForm.PassportRequired,

        PassportValidityMonths: jobForm.PassportValidityMonths
          ? Number(jobForm.PassportValidityMonths)
          : null,
      });

      updateDraft(response);

      go(5);
    } catch (error) {
      console.log("STEP4 REQUEST", {
        Vacancies: Number(jobForm.Vacancies),
        EducationRequired: jobForm.EducationRequired,
        AgeMin: jobForm.AgeMin ? Number(jobForm.AgeMin) : null,
        AgeMax: jobForm.AgeMax ? Number(jobForm.AgeMax) : null,
        GenderPreferred: jobForm.GenderPreferred,
        DisabilityEligible: jobForm.DisabilityEligible,
        PassportRequired: jobForm.PassportRequired,
        PassportValidityMonths: jobForm.PassportValidityMonths
          ? Number(jobForm.PassportValidityMonths)
          : null,
      });

      console.log("STEP4 ERROR RESPONSE", error.response?.data);

      console.error(error);
    }
  };
  const handleStep5 = async () => {
    try {
      const response = await saveLocation(jobId, {
        LocationType: jobForm.LocationType,

        OnshoreCity: jobForm.OnshoreCity,

        OnshoreState: jobForm.OnshoreState,

        OffshoreVesselName: jobForm.OffshoreVesselName,

        OffshoreRegion: jobForm.OffshoreRegion,

        Country: jobForm.Country,
      });

      updateDraft(response);

      go(6);
    } catch (error) {
      console.log("STEP5 ERROR", error.response?.data);

      console.error(error);
    }
  };
  const handleStep6 = async () => {
    try {
      console.log("QUESTIONS", jobForm.questions);

      const response = await saveQuestions(jobId, {
        questions: jobForm.questions,
      });

      console.log("STEP6 SUCCESS", response);

      updateDraft(response);

      go(7);
    } catch (error) {
      console.log("STEP6 ERROR RESPONSE", error.response?.data);

      console.log("STEP6 ERROR STATUS", error.response?.status);

      console.error(error);
    }
  };
  const handleStep7 = async () => {
    try {
      const response = await publishJob({
        JobId: jobId,
        ApplicationDeadline: jobForm.ApplicationDeadline,

        CompanyVisibility: jobForm.CompanyVisibility,

        JobType: jobForm.PublishJobType,

        PublishingTags: jobForm.PublishingTags,

        PublishNow: jobForm.PublishNow,
      });

      console.log("JOB PUBLISHED", response);

      localStorage.removeItem("jobDraft");

      alert("Job Published Successfully!");
    } catch (error) {
      console.log("STEP7 ERROR", error.response?.data);

      console.error(error);
    }
  };
  const go = (n) => {
    setActiveStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

 const ActiveStep =
  STEP_VIEWS[activeStep - 1] || Step7;
  const loadDraft = async () => {
    try {
      const draft = localStorage.getItem("jobDraft");

      if (!draft) return;

      const parsed = JSON.parse(draft);

      if (!parsed?.jobId) return;

      setJobId(parsed.jobId);

      const response = await getJobResume(parsed.jobId);

      console.log("Resume API:", response);

      const nextStep =
        response.stepStatus.lastCompletedStep >= 7
          ? 7
          : response.stepStatus.lastCompletedStep + 1;

      setActiveStep(nextStep);

      setJobForm((prev) => ({
        ...prev,

        // Step 1
        JobTitle: response.step1Data?.jobTitle || "",
        TradeCategory: response.step1Data?.tradeCategory || "",
        Role: response.step1Data?.role || "",
        ExperienceRequiredYears:
          response.step1Data?.experienceRequiredYears || 0,
        JobType: response.step1Data?.jobType || "Normal_Job",
        EmploymentType: response.step1Data?.employmentType || "Permanent",
        JobDescription: response.step1Data?.jobDescription || "",

        // Step 2
        SalaryMin: response.step2Data?.salaryMin?.toString() || "",
        SalaryMax: response.step2Data?.salaryMax?.toString() || "",
        SalaryCurrency: response.step2Data?.salaryCurrency || "INR",
        SalaryDisplayOption:
          response.step2Data?.salaryDisplayOption || "Show_Range",

        KeySkills: response.step3Data?.keySkills || [],

        AdditionalJobDescription:
          response.step3Data?.additionalJobDescription || "",

        LicenceDocsRequired: response.step3Data?.licenceDocsRequired || "",

        LanguageRequired: response.step3Data?.languageRequired || "",

        Vacancies: response.step4Data?.vacancies || 1,

        EducationRequired: response.step4Data?.educationRequired || "Any",

        AgeMin: response.step4Data?.ageMin ?? "",

        AgeMax: response.step4Data?.ageMax ?? "",

        GenderPreferred: response.step4Data?.genderPreferred || "Any",

        DisabilityEligible: response.step4Data?.disabilityEligible ?? false,

        PassportRequired: response.step4Data?.passportRequired ?? false,

        PassportValidityMonths:
          response.step4Data?.passportValidityMonths ?? "",

        // Step 5
        LocationType: response.step5Data?.locationType || "Onshore",

        OnshoreCity: response.step5Data?.onshoreCity || "",

        OnshoreState: response.step5Data?.onshoreState || "",

        OffshoreVesselName: response.step5Data?.offshoreVesselName || "",

        OffshoreRegion: response.step5Data?.offshoreRegion || "",

        Country: response.step5Data?.country || "India",

        questions: response.step6Data?.questions || [
          {
            questionText: "",
            answerType: "string",
            isMandatory: false,
          },
        ],
        
      }));
    } catch (error) {
      console.error("Failed to load draft", error);
    }
  };
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
                        : activeStep === 3
                          ? handleStep3
                          : activeStep === 4
                            ? handleStep4
                            : activeStep === 5
                              ? handleStep5
                              : activeStep === 6
                                ? handleStep6
                                : activeStep === 7
                                  ? handleStep7
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
