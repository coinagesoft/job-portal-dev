"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { mockProfile } from "@/app/candidate-profile/components/data";

const getDefaultQuestions = (job) => {
  const roleTitle = String(job?.title || "this role");
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
  const [error, setError] = useState("");

  const candidateName =
    mockProfile.fullName || `${mockProfile.firstName || ""} ${mockProfile.lastName || ""}`.trim();

  const employerQuestions = useMemo(() => {
    if (Array.isArray(job?.employerQuestions) && job.employerQuestions.length > 0) {
      return job.employerQuestions;
    }
    return getDefaultQuestions(job);
  }, [job]);

  const closeModal = () => {
    setAnswers({});
    setConsent(false);
    setSubmitted(false);
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
    if (!consent) {
      setError("Please confirm that the shown CV preview can be shared with the employer.");
      return false;
    }

    for (const question of employerQuestions) {
      if (!question.required) continue;
      const answer = String(answers[question.id] || "").trim();
      if (!answer) {
        setError("Please answer all required employer screening questions.");
        return false;
      }
    }

    setError("");
    return true;
  };

  const submitApplication = () => {
    if (!validateBeforeSubmit()) return;
    setSubmitted(true);
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
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content apply-job-form apply-job-modal-shell">
            <div className="modal-body pl-30 pr-30 pt-30 pb-30">
              <div className="apply-job-modal-header">
                <div>
                  <p className="font-sm text-brand-2 mb-5">Job Application</p>
                  <h5 className="mb-0 color-brand-1">{job?.title || "Apply to job"}</h5>
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
                <div className="row">
                  <div className="col-lg-7 col-md-12">
                    <p className="font-sm color-text-paragraph-2 mb-20">
                      Employer screening questions for this role are listed below.
                    </p>

                    <div className="mb-20">
                      <h6 className="mb-10">Candidate details</h6>
                      <div className="row">
                        <div className="col-md-6 mb-10">
                          <input className="form-control" value={candidateName} readOnly />
                        </div>
                        <div className="col-md-6 mb-10">
                          <input className="form-control" value={mockProfile.mobile || ""} readOnly />
                        </div>
                        <div className="col-md-12 mb-10">
                          <input className="form-control" value={mockProfile.email || ""} readOnly />
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
                              rows={3}
                              placeholder={question.placeholder || "Type your response"}
                              value={answers[question.id] || ""}
                              onChange={(event) => handleAnswer(question.id, event.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="login_footer form-group d-flex justify-content-between">
                      <label className="cb-container">
                        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                        <span className="text-small">I confirm this CV preview is ready to be shared with employer</span>
                        <span className="checkmark"></span>
                      </label>
                    </div>

                    {error ? <p className="font-xs mb-10" style={{ color: "#a32d2d" }}>{error}</p> : null}

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button type="button" className="btn btn-default hover-up" onClick={submitApplication}>
                        Apply Job
                      </button>
                      <Link className="btn btn-border hover-up" href="/candidate-profile#cv" onClick={closeModal}>
                        Update CV
                      </Link>
                    </div>
                  </div>

                  <div className="col-lg-5 col-md-12">
                    <div className="apply-job-preview-panel">
                      <h6 className="mb-10">CV Preview Sent to Employer</h6>
                      <p className="font-xs color-text-paragraph-2 mb-10">
                        This is the profile snapshot the employer receives with your responses.
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
                        {mockProfile.workHistory.map((entry) => (
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
                          {mockProfile.selectedSkills.map((skill) => (
                            <span key={skill} className="badge bg-light text-dark">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyJobModal;
