"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { mockProfile } from "@/app/candidate-profile/components/data";

import { applyJob } from "@/services/candidate/applyJobService";
import { useToast } from "@/components/Toast";

import { getProfileSummary } from "@/services/candidate/profileSummaryService";
import { getCandidateId } from "@/utils/authHelper";


const getDefaultQuestions = (job) => {
  const roleTitle = String(job?.jobTitle || "this role");
  return [
    {
      id: "availability",
      label: "Are you available to join within 15 days?",
      type: "radio",
      options: ["Yes", "No"],
      required: true
    },
    {
      id: "experience",
      label: `How many years of relevant experience do you have for ${roleTitle}?`,
      type: "text",
      placeholder: "e.g. 5 years in similar role",
      required: true
    },
    {
      id: "relocation",
      label: "Are you open to relocation if project requires?",
      type: "radio",
      options: ["Yes", "No"],
      required: true
    }
  ];
};

const ApplyJobModal = ({ showModal = false, setShowModal, job }) => {
  const [answers, setAnswers] = useState({});
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");

  const showToast = useToast();

  const candidateId = getCandidateId();

  const [profile, setProfile] = useState(null);

  const candidateName =
    profile?.fullName || "";

  const employerQuestions = useMemo(() => {
    if (
      Array.isArray(job?.screeningQuestions) &&
      job.screeningQuestions.length > 0
    ) {
      return job.screeningQuestions.map(
        (question, index) => ({
          id: `question-${index}`,
          label: question.questionText,
          type:
            question.answerType?.toLowerCase() === "yesno"
              ? "radio"
              : "text",
          required: question.isMandatory,
          options: ["Yes", "No"],
        })
      );
    }

    return getDefaultQuestions(job);
  }, [job]);


  useEffect(() => {
    const loadProfile = async () => {
      if (!candidateId) {
        setProfile(null);
        return;
      }

      try {
        const response =
          await getProfileSummary(candidateId);

        setProfile(response.data.data);
      } catch (error) {
        console.error(
          "Failed to load profile",
          error
        );
      }
    };

    loadProfile();
  }, [candidateId]);

  useEffect(() => {
    if (!showModal || typeof document === "undefined") return undefined;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  const closeModal = () => {
    setAnswers({});
    setConsent(false);
    setSubmitted(false);
    setCurrentStep(1);
    setError("");
    if (typeof setShowModal === "function") {
      setShowModal(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (error) setError("");
  };

  const validateBeforeSubmit = () => {
    for (const question of employerQuestions) {
      if (!question.required) continue;
      const answer = String(answers[question.id] || "").trim();
      if (!answer) {
        setCurrentStep(1);
        setError("Please answer all required employer screening questions.");
        return false;
      }
    }

    if (!consent) {
      setCurrentStep(2);
      setError("Please confirm that the shown CV preview can be shared with the employer.");
      return false;
    }

    setError("");
    return true;
  };

  const goToCvPreview = () => {
    for (const question of employerQuestions) {
      if (!question.required) continue;
      const answer = String(answers[question.id] || "").trim();
      if (!answer) {
        setError("Please answer all required employer screening questions.");
        return;
      }
    }
    setError("");
    setCurrentStep(2);
  };

  const submitApplication = async () => {
   console.log("Candidate ID:", candidateId);
console.log("Job ID:", job.jobId);

    if (!validateBeforeSubmit()) return;
    console.log("JOB DATA:", job);



    try {
      if (!candidateId) {
        showToast(
          "Please log in as a candidate to apply.",
          "error"
        );
        return;
      }

      const payload = {
        passportGatePassed: true,
        ageConfirmed: true,

        motivationMessage: "",

        screeningAnswers: employerQuestions.map(
          (question) => ({
            questionText: question.label,
            answer: answers[question.id] || "",
          })
        ),

        languageConfirmations: [],

        certificateConfirmations: [],
      };
          console.log("Payload:", payload);


      console.log(
        "SCREENING ANSWERS:",
        employerQuestions.map((question) => ({
          questionText: question.label,
          answer: answers[question.id] || "",
        }))


      );
      console.log("JOB INSIDE MODAL", job);
      console.log(
        "EMPLOYER QUESTIONS INSIDE MODAL",
        job?.employerQuestions
      );
      console.log("Apply Payload", payload);
      console.log(JSON.stringify(payload, null, 2));

      const response = await applyJob(
        job.jobId,
        payload
      );

      if (response?.data?.success) {
        setSubmitted(true);

        showToast(
          response.data.message ||
          "Application submitted successfully",
          "success"
        );
      }
    } catch (error) {
  console.log("FULL ERROR:", error);
  console.log("ERROR RESPONSE:", error.response);
  console.log("ERROR DATA:", error.response?.data);
  console.log("STATUS:", error.response?.status);

  showToast(
    error.response?.data?.message ||
    "Failed to apply",
    "error"
  );
}
  };
  if (!showModal) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={closeModal}
        style={{ zIndex: 1040 }}
        aria-hidden="true"
      />
      <div
        className="modal fade show d-block apply-job-fullscreen-modal"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog apply-job-modal-dialog">
          <div className="modal-content apply-job-form apply-job-modal-shell">
            <div className="modal-body pl-30 pr-30 pt-30 pb-30">
              <div className="apply-job-modal-header">
                <div>
                  <p className="font-sm text-brand-2 mb-5">Job Application</p>
                  <h5 className="mb-0 color-brand-1">{job?.jobTitle || "Apply to job"}</h5>
                </div>
                <button
                  className="apply-job-modal-close"
                  type="button"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  x
                </button>
              </div>

              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
                  <h4 className="mb-10 color-brand-1">Application Submitted</h4>
                  <p className="font-sm color-text-paragraph-2 mb-20">
                    Your responses and CV preview were submitted successfully to the employer.
                  </p>
                  <button type="button" className="btn btn-default" onClick={closeModal}>
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="apply-job-stepper">
                    <span className={`apply-job-step ${currentStep === 1 ? "is-active" : "is-done"}`}>1. Questions</span>
                    <span className="apply-job-step-divider"></span>
                    <span className={`apply-job-step ${currentStep === 2 ? "is-active" : ""}`}>2. CV Review & Apply</span>
                  </div>

                  {currentStep === 1 ? (
                    <div className="apply-job-step-page">
                      <div className="apply-job-step-content">
                        <p className="font-sm color-text-paragraph-2 mb-20">
                          Answer quick employer screening questions first.
                        </p>

                        <div className="mb-20">
                          <h6 className="mb-10">Candidate details</h6>
                          <div className="row">
                            <div className="col-md-6 mb-10">
                              <input className="form-control" value={candidateName} readOnly />
                            </div>
                            <div className="col-md-6 mb-10">
                              <input className="form-control" value={profile?.mobileNumber || ""} readOnly />
                            </div>
                            <div className="col-md-12 mb-10">
                              <input className="form-control" value={profile?.email || ""} readOnly />
                            </div>
                          </div>
                        </div>

                        <div className="mb-15">
                          <h6 className="mb-10">Employer screening questions</h6>
                          {employerQuestions.map((question) => (
                            <div key={question.id} className="mb-15 apply-job-question-block">
                              <label className="font-sm fw-600 color-text-mutted mb-8 d-block">
                                {question.label}
                                {question.required ? " *" : ""}
                              </label>

                              {question.type === "radio" ? (
                                <div className="apply-job-question-options">
                                  {(question.options || []).map((option) => (
                                    <label key={`${question.id}-${option}`} style={{ display: "flex", gap: "6px" }}>
                                      <input
                                        type="radio"
                                        name={question.id}
                                        value={option}
                                        checked={answers[question.id] === option}
                                        onChange={(event) => handleAnswer(question.id, event.target.value)}
                                      />
                                      <span className="font-sm">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <textarea
                                  className="form-control"
                                  rows={2}
                                  placeholder={question.placeholder || "Type your response"}
                                  value={answers[question.id] || ""}
                                  onChange={(event) => handleAnswer(question.id, event.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        {error ? <p className="font-xs mb-10" style={{ color: "#a32d2d" }}>{error}</p> : null}
                      </div>

                      <div className="apply-job-footer-actions">
                        <Link className="btn btn-border hover-up" href="/candidate-profile#cv" onClick={closeModal}>
                          Update CV
                        </Link>
                        <button type="button" className="btn btn-default hover-up" onClick={goToCvPreview}>
                          Next: Review CV
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="apply-job-step-page">
                      <div className="apply-job-step-content">
                        <p className="font-sm color-text-paragraph-2 mb-10">
                          Review the CV snapshot that will be shared with the employer.
                        </p>

                        <div className="apply-job-preview-panel">
                          <h6 className="mb-10">CV Preview Sent to Employer</h6>
                          <p className="font-xs color-text-paragraph-2 mb-10">
                            This profile snapshot is submitted along with your answers.
                          </p>

                          <div className="mb-10">
                            <strong>{candidateName}</strong>
                            <p className="font-xs mb-0">
                              {mockProfile.trade} - {mockProfile.yearsOfExperience} years - {mockProfile.city}, {mockProfile.state}
                            </p>
                          </div>

                          <div className="mb-10">
                            <p className="font-xs fw-600 mb-5">Summary</p>
                            <p className="font-xs mb-0">{mockProfile.summary}</p>
                          </div>

                          <div className="mb-10">
                            <p className="font-xs fw-600 mb-5">Work Experience</p>
                            {mockProfile.workHistory.slice(0, 2).map((entry) => (
                              <div key={entry.id} style={{ marginBottom: "8px" }}>
                                <p className="font-xs mb-0">
                                  <strong>{entry.title}</strong> - {entry.company}
                                </p>
                                <small>{entry.startDate || ""} to {entry.current ? "Present" : entry.endDate || ""}</small>
                              </div>
                            ))}
                          </div>

                          <div className="mb-0">
                            <p className="font-xs fw-600 mb-5">Core Skills</p>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {mockProfile.selectedSkills.slice(0, 8).map((skill) => (
                                <span key={skill} className="badge bg-light text-dark">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="login_footer form-group d-flex justify-content-between mt-10 mb-0">
                          <label className="cb-container">
                            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                            <span className="text-small">I confirm this CV preview is ready to be shared with employer</span>
                            <span className="checkmark"></span>
                          </label>
                        </div>

                        {error ? <p className="font-xs mb-0" style={{ color: "#a32d2d" }}>{error}</p> : null}
                      </div>

                      <div className="apply-job-footer-actions">
                        <button type="button" className="btn btn-border hover-up" onClick={() => setCurrentStep(1)}>
                          Back to Questions
                        </button>
                        <button type="button" className="btn btn-default hover-up" onClick={submitApplication}>
                          Apply Job
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyJobModal;
