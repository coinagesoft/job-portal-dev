"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
// import { mockProfile } from "@/app/candidate-profile/components/data";

import { applyJob } from "@/services/candidate/applyJobService";
import { getApplyQuestions } from "@/services/candidate/applyQuestionsService";
import { useToast } from "@/components/Toast";

import { getProfileSummary } from "@/services/candidate/profileSummaryService";
import { getCandidateId } from "@/utils/authHelper";
import { getSkills } from "@/services/candidate/skillsService";
import { getWorkExperience } from "@/services/candidate/workExperienceService";


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
  const [skills, setSkills] = useState([]);
  const [workHistory, setWorkHistory] = useState([]);
  // Apply requirements + screening questions fetched from the API.
  const [applyDetails, setApplyDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  // Candidate confirmations for required languages / certificates / passport.
  const [confirmations, setConfirmations] = useState({
    languages: {},
    certificates: {},
    passport: false,
  });

  const showToast = useToast();

  const candidateId = getCandidateId();

  const [profile, setProfile] = useState(null);

  const candidateName =
    profile?.fullName || "";

  const employerQuestions = useMemo(() => {
    // Prefer screening questions from the apply-questions API; fall back to
    // whatever was passed on the job prop. The API returns plain strings.
    const source =
      (Array.isArray(applyDetails?.screeningQuestions) &&
        applyDetails.screeningQuestions.length > 0 &&
        applyDetails.screeningQuestions) ||
      (Array.isArray(job?.screeningQuestions) && job.screeningQuestions) ||
      [];

    return source.map((question, index) => {
      const text =
        typeof question === "string"
          ? question
          : question.questionText || question.label || "";
      const required =
        typeof question === "string" ? true : question.isMandatory ?? true;

      return {
        id: `question-${index}`,
        label: text,
        type: "text",
        required,
      };
    });
  }, [applyDetails, job]);

  // Required language / certificate / passport gates from the API.
  const requiredLanguages = applyDetails?.languagesRequired ?? [];
  const requiredCertificates = applyDetails?.certificatesRequired ?? [];
  const passportRequired = applyDetails?.passportRequired ?? false;

  // Fetch screening questions + requirements when the modal opens.
  useEffect(() => {
    if (!showModal || !job?.jobId) return;

    const loadApplyDetails = async () => {
      try {
        setLoadingDetails(true);
        const response = await getApplyQuestions(job.jobId);
        setApplyDetails(response.data);
      } catch (err) {
        console.error("Failed to load apply questions", err);
        setApplyDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadApplyDetails();
  }, [showModal, job?.jobId]);


  useEffect(() => {
    const loadProfile = async () => {
      if (!candidateId) {
        setProfile(null);
        return;
      }

      try {
        const response =
          await getProfileSummary();

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
    const loadSkills = async () => {
      try {
        const response = await getSkills();

        // console.log("SKILLS:", response.data);


        setSkills(response.data.data.skills || []);
      } catch (error) {
        console.error(
          "Failed to load skills:",
          error
        );
      }
    };

    if (candidateId) {
      loadSkills();
    }
  }, [candidateId]);

  useEffect(() => {
    const loadWorkExperience = async () => {
      try {
        const response = await getWorkExperience();

        console.log("WORK EXPERIENCE:", response.data);

        setWorkHistory(response.data.data || []);
      } catch (error) {
        console.error(
          "Failed to load work experience:",
          error
        );
      }
    };

    if (candidateId) {
      loadWorkExperience();
    }
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
    setConfirmations({ languages: {}, certificates: {}, passport: false });
    if (typeof setShowModal === "function") {
      setShowModal(false);
    }
  };

  const toggleLanguage = (name, checked) => {
    setConfirmations((prev) => ({
      ...prev,
      languages: { ...prev.languages, [name]: checked },
    }));
    if (error) setError("");
  };

  const toggleCertificate = (name, checked) => {
    setConfirmations((prev) => ({
      ...prev,
      certificates: { ...prev.certificates, [name]: checked },
    }));
    if (error) setError("");
  };

  const togglePassport = (checked) => {
    setConfirmations((prev) => ({ ...prev, passport: checked }));
    if (error) setError("");
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (error) setError("");
  };

  const checkRequiredGates = () => {
    for (const question of employerQuestions) {
      if (!question.required) continue;
      const answer = String(answers[question.id] || "").trim();
      if (!answer) {
        setError("Please answer all required employer screening questions.");
        return false;
      }
    }

    if (passportRequired && !confirmations.passport) {
      setError("This job requires a valid passport. Please confirm you have one.");
      return false;
    }

    for (const lang of requiredLanguages) {
      if (!confirmations.languages[lang]) {
        setError(`Please confirm you can communicate in ${lang}.`);
        return false;
      }
    }

    for (const cert of requiredCertificates) {
      if (!confirmations.certificates[cert]) {
        setError(`Please confirm you hold the required certificate: ${cert}.`);
        return false;
      }
    }

    setError("");
    return true;
  };

  const validateBeforeSubmit = () => {
    if (!checkRequiredGates()) {
      setCurrentStep(1);
      return false;
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
    if (!checkRequiredGates()) return;
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
        passportGatePassed: passportRequired ? confirmations.passport : true,
        ageConfirmed: true,

        motivationMessage: answers.motivation || "",

        screeningAnswers: employerQuestions.map((question) => ({
          questionText: question.label,
          answer: answers[question.id] || "",
        })),

        languageConfirmations: requiredLanguages.map((name) => ({
          name,
          confirmed: !!confirmations.languages[name],
        })),

        certificateConfirmations: requiredCertificates.map((name) => ({
          name,
          confirmed: !!confirmations.certificates[name],
        })),
      };
      console.log("Apply Payload", JSON.stringify(payload, null, 2));

      const response = await applyJob(job.jobId, payload);

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
                          {loadingDetails ? (
                            <p className="font-sm color-text-paragraph-2">
                              Loading questions…
                            </p>
                          ) : employerQuestions.length === 0 ? (
                            <p className="font-sm color-text-paragraph-2">
                              This employer has no screening questions. You can proceed.
                            </p>
                          ) : (
                            employerQuestions.map((question) => (
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
                            ))
                          )}
                        </div>

                        {(passportRequired ||
                          requiredLanguages.length > 0 ||
                          requiredCertificates.length > 0) && (
                          <div className="mb-15">
                            <h6 className="mb-10">Requirements to confirm</h6>

                            {passportRequired && (
                              <label className="mb-8" style={{ display: "flex", gap: "8px" }}>
                                <input
                                  type="checkbox"
                                  checked={confirmations.passport}
                                  onChange={(e) => togglePassport(e.target.checked)}
                                />
                                <span className="font-sm">
                                  I have a valid passport (required for this job) *
                                </span>
                              </label>
                            )}

                            {requiredLanguages.map((lang) => (
                              <label key={`lang-${lang}`} className="mb-8" style={{ display: "flex", gap: "8px" }}>
                                <input
                                  type="checkbox"
                                  checked={!!confirmations.languages[lang]}
                                  onChange={(e) => toggleLanguage(lang, e.target.checked)}
                                />
                                <span className="font-sm">I can communicate in {lang} *</span>
                              </label>
                            ))}

                            {requiredCertificates.map((cert) => (
                              <label key={`cert-${cert}`} className="mb-8" style={{ display: "flex", gap: "8px" }}>
                                <input
                                  type="checkbox"
                                  checked={!!confirmations.certificates[cert]}
                                  onChange={(e) => toggleCertificate(cert, e.target.checked)}
                                />
                                <span className="font-sm">I hold the {cert} certificate *</span>
                              </label>
                            ))}
                          </div>
                        )}

                        <div className="mb-15">
                          <h6 className="mb-10">Why are you a good fit? (optional)</h6>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="A short message to the employer"
                            value={answers.motivation || ""}
                            onChange={(event) => handleAnswer("motivation", event.target.value)}
                          />
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
                              {profile?.professionalSummary || "No role added"} -{" "}
                              {profile?.totalExperienceYears || 0} years -{" "}
                              {profile?.currentCity}, {profile?.currentState}
                            </p>
                          </div>

                          <div className="mb-10">
                            <p className="font-xs fw-600 mb-5">Summary</p>

                            <p className="font-xs mb-0">
                              {profile?.about ||
                                profile?.professionalSummary ||
                                "No professional summary available"}
                            </p>
                          </div>

                          <div className="mb-10">
                            <p className="font-xs fw-600 mb-5">Work Experience</p>
                            {workHistory.slice(0, 2).map((entry) => (
                              <div
                                key={entry.workExperienceId}
                                style={{ marginBottom: "8px" }}
                              >
                                <p className="font-xs mb-0">
                                  <strong>{entry.jobTitle}</strong>
                                  {" - "}
                                  {entry.companyName}
                                </p>

                                <small>
                                  {entry.startDate}
                                  {" to "}
                                  {entry.currentlyWorking
                                    ? "Present"
                                    : entry.endDate}
                                </small>
                              </div>
                            ))}
                          </div>

                          <div className="mb-0">
                            <p className="font-xs fw-600 mb-5">Core Skills</p>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {/* console.log("SKILLS:", response.data); */}
                              {skills.slice(0, 8).map((skill) => (
                                <span
                                  key={skill.skillId}
                                  className="badge bg-light text-dark"
                                >
                                  {skill.skillName}
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