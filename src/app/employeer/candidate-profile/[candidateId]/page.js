"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import candidateProfileService from "@/services/recruiter/Candidateprofileservice.js";

const EmployerCandidateProfilePage = () => {
  const { candidateId } = useParams();

  const [profile, setProfile] = useState(null); // RecruiterCandidateProfileResponseDto
  const [wallet, setWallet] = useState(null); // WalletsummaryDto
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateContact, setCandidateContact] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // ---------------------------------------------
  // Load profile + wallet
  // ---------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, walletRes] = await Promise.all([
        candidateProfileService.getFullProfile(candidateId),
        candidateProfileService.getWallet(),
      ]);

      setProfile(profileRes);

      setWallet(walletRes);

      /*
If profile is already unlocked,
load contact information.
*/

      if (profileRes.overview?.isUnlocked) {
        const details =
          await candidateProfileService.getCandidateDetails(candidateId);

        setCandidateDetails(details);
      }
    } catch (err) {
      setError(
        err.response?.data?.Message ||
          err.message ||
          "Failed to load candidate profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------------------------------------
  // Unlock candidate
  // ---------------------------------------------
  const handleUnlock = async () => {
    setUnlocking(true);
    setActionMessage(null);
    try {
      const result = await candidateProfileService.unlockCandidate(candidateId);
      if (result.Success) {
        setActionMessage({ type: "success", text: result.Message });
        await loadData();

        const details =
          await candidateProfileService.getCandidateDetails(candidateId);

        setCandidateDetails(details);
      } else {
        setActionMessage({ type: "error", text: result.Message });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.Message || "Unlock failed.",
      });
    } finally {
      setUnlocking(false);
    }
  };

  // ---------------------------------------------
  // Download cv
  // ---------------------------------------------
  const handleDownloadcv = async () => {
    setDownloading(true);
    setActionMessage(null);
    try {
      const result = await candidateProfileService.downloadcv(candidateId);
      if (result.Success) {
        setActionMessage({ type: "success", text: result.Message });
        if (result.cvUrl) {
          window.open(result.cvUrl, "_blank", "noopener,noreferrer");
        }
        await loadData(); // refresh wallet balance
      } else {
        setActionMessage({ type: "error", text: result.Message });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.Message || "cv download failed.",
      });
    } finally {
      setDownloading(false);
    }
  };

  // ---------------------------------------------
  // Loading / error states
  // ---------------------------------------------
  if (loading) {
    return (
      <main className="main">
        <div className="container mt-50 mb-50 text-center">
          <p>Loading candidate profile...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="main">
        <div className="container mt-50 mb-50 text-center">
          <p className="text-danger">{error || "Candidate not found."}</p>
        </div>
      </main>
    );
  }

  const {
    overview,
    summary,
    skills,
    languages,
    educations,
    workHistories,
    cv,
    unlockStatus,
  } = profile;

  const isUnlocked = unlockStatus.IsUnlocked;

  return (
    <main className="main">
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-image-single">
            <img
              src="/assets/imgs/page/blue-collar/welding.jpg"
              alt="candidate banner"
            />
          </div>

          <div className="box-company-profile">
            <div className="image-compay">
              <img
                src={
                  overview.ProfilePhotoUrl ||
                  "/assets/imgs/page/candidates/candidate-profile.png"
                }
                alt="candidate profile"
              />
            </div>

            <div className="row mt-10">
              <div className="col-lg-8 col-md-12">
                <h5 className="f-18">
                  {overview.FullName}
                  <span className="card-location font-regular ml-20">
                    {overview.CurrentCity}
                    {overview.CurrentState ? `, ${overview.CurrentState}` : ""}
                  </span>
                </h5>

                <p className="mt-0 font-md color-text-paragraph-2 mb-15">
                  {overview.PrimaryTrade} - {overview.TotalExperienceYears}{" "}
                  years experience
                </p>

                <div className="mt-10 mb-15">
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      src="/assets/imgs/template/icons/star.svg"
                      alt="rating star"
                    />
                  ))}
                  {overview.AiMatchScore != null && (
                    <span className="font-xs color-text-mutted ml-10">
                      {overview.AiMatchScore}% match
                    </span>
                  )}
                  <img
                    className="ml-30"
                    src="/assets/imgs/page/candidates/verified.png"
                    alt="verified candidate"
                  />
                </div>

                <div className="candidate-tags-wrap">
                  {summary.ItiCertified && (
                    <span className="candidate-profile-tag">ITI Certified</span>
                  )}
                  <span className="candidate-profile-tag">KYC Verified</span>
                </div>
              </div>

              <div className="col-lg-4 col-md-12 text-lg-end">
                <div className="action-buttons d-flex flex-wrap gap-2 justify-content-lg-end">
                  <button
                    className="btn btn-primary-custom btn-lg"
                    type="button"
                    title="Unlock this candidate's full profile"
                    style={{ whiteSpace: "nowrap" }}
                    disabled={isUnlocked || unlocking}
                    onClick={handleUnlock}
                  >
                    {isUnlocked
                      ? "Profile Unlocked"
                      : unlocking
                        ? "Unlocking..."
                        : "Unlock Profile"}
                  </button>

                  <button
                    className="btn btn-outline-custom btn-lg"
                    type="button"
                    title={
                      isUnlocked
                        ? "Download candidate cv"
                        : "Unlock required before downloading cv"
                    }
                    style={{ whiteSpace: "nowrap" }}
                    disabled={!isUnlocked || !cv?.cvAvailable || downloading}
                    onClick={handleDownloadcv}
                  >
                    {downloading ? "Downloading..." : "Download cv"}
                  </button>
                </div>

                {actionMessage && (
                  <p
                    className={`mt-10 font-sm ${
                      actionMessage.type === "success"
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {actionMessage.text}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="box-nav-tabs mt-40 mb-5">
            <ul className="nav" role="tablist">
              <li>
                <a
                  className="btn btn-border aboutus-icon mr-15 mb-5 active"
                  href="#tab-short-bio"
                  data-bs-toggle="tab"
                  role="tab"
                  aria-controls="tab-short-bio"
                  aria-selected="true"
                >
                  Candidate summary
                </a>
              </li>
              <li>
                <a
                  className="btn btn-border recruitment-icon mr-15 mb-5"
                  href="#tab-skills"
                  data-bs-toggle="tab"
                  role="tab"
                  aria-controls="tab-skills"
                  aria-selected="false"
                >
                  skills
                </a>
              </li>
              <li>
                <a
                  className="btn btn-border people-icon mb-5"
                  href="#tab-work-experience"
                  data-bs-toggle="tab"
                  role="tab"
                  aria-controls="tab-work-experience"
                  aria-selected="false"
                >
                  Working Experience
                </a>
              </li>
            </ul>
          </div>
          <div className="border-bottom pt-10 pb-10"></div>
        </div>
      </section>

      <section className="section-box mt-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12 col-sm-12 col-12">
              <div className="content-single">
                <div className="tab-content">
                  {/* ===================== summary TAB ===================== */}
                  <div
                    className="tab-pane fade show active"
                    id="tab-short-bio"
                    role="tabpanel"
                    aria-labelledby="tab-short-bio"
                  >
                    <h4>Employer Candidate View</h4>
                    <p>
                      {isUnlocked
                        ? "This profile is unlocked. Contact details, cv, and full work records are available."
                        : "This profile is currently locked for employer view. Contact details, complete cv, and full work records are hidden until unlock."}
                    </p>

                    {!isUnlocked && (
                      <div
                        className="alert alert-warning mt-20 mb-20"
                        role="alert"
                      >
                        <strong>Profile locked.</strong> Unlock is irreversible.
                        Credits deducted after confirmation.
                      </div>
                    )}

                    <h4>Profile Visibility</h4>
                    <p className="mb-25">
                      Recruiters can preview important candidate information
                      before unlocking the full profile. Contact details and
                      downloadable documents are protected until unlock.
                    </p>

                    <div className="row">
                      {/* PREVIEW ACCESS CARD */}
                      <div className="col-lg-6 mb-25">
                        <div className="candidate-visibility-card visible-card">
                          <div className="visibility-card-header">
                            <div>
                              <h5 className="mb-5">Preview Access</h5>
                              <p className="mb-0 font-sm color-text-paragraph">
                                Information visible before unlock
                              </p>
                            </div>
                            <span className="visibility-badge success">
                              Visible
                            </span>
                          </div>

                          <div className="visibility-card-body">
                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-user"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Candidate Name
                                </span>
                                <h6 className="visibility-value">
                                  {overview.FullName}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-briefcase"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Current Role
                                </span>
                                <h6 className="visibility-value">
                                  {overview.PrimaryTrade}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-time-fast"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Experience
                                </span>
                                <h6 className="visibility-value">
                                  {overview.TotalExperienceYears} Years
                                  Experience
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-marker"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Current Location
                                </span>
                                <h6 className="visibility-value">
                                  {overview.CurrentCity}
                                  {overview.CurrentState
                                    ? `, ${overview.CurrentState}`
                                    : ""}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-id-badge"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Availability Status
                                </span>
                                <h6 className="visibility-value text-success">
                                  {overview.AvailabilityStatus}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-credit-card"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Notice Period
                                </span>
                                <h6 className="visibility-value">
                                  {overview.NoticePeriod || "Not specified"}
                                </h6>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LOCKED / UNLOCKED ACCESS CARD */}
                      <div className="col-lg-6 mb-25">
                        <div
                          className={`candidate-visibility-card ${
                            isUnlocked ? "visible-card" : "locked-card"
                          }`}
                        >
                          <div className="visibility-card-header">
                            <div>
                              <h5 className="mb-5">
                                {isUnlocked ? "Unlocked" : "Unlock Required"}
                              </h5>
                              <p className="mb-0 font-sm color-text-paragraph">
                                Protected candidate information
                              </p>
                            </div>
                            <span
                              className={`visibility-badge ${
                                isUnlocked ? "success" : "warning"
                              }`}
                            >
                              {isUnlocked ? "Visible" : "Locked"}
                            </span>
                          </div>

                          <div className="visibility-card-body">
                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-dollar"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Expected Salary
                                </span>
                                <h6 className="visibility-value">
                                  {isUnlocked
                                    ? (summary.PreferredSalary ??
                                      "Not specified")
                                    : "Hidden"}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-document"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Resume Download
                                </span>
                                <h6 className="visibility-value">
                                  {cv?.CanDownloadcv
                                    ? "Available"
                                    : "Unlock Required"}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-id-badge"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Disability Status
                                </span>
                                <h6 className="visibility-value">
                                  {isUnlocked
                                    ? summary.DisabilityStatus ||
                                      "None declared"
                                    : "Protected"}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-credit-card"></i>
                              </div>
                              <div>
                                <span className="visibility-label">
                                  Unlock Access
                                </span>
                                <h6 className="visibility-value">
                                  {isUnlocked
                                    ? `Expires ${unlockStatus.ExpiryDate ?? "—"}`
                                    : "Unlock to view"}
                                </h6>
                              </div>
                            </div>
                          </div>

                          {!isUnlocked && (
                            <div className="visibility-card-footer">
                              <button
                                className="btn btn-default w-100"
                                type="button"
                                onClick={handleUnlock}
                                disabled={unlocking}
                              >
                                {unlocking
                                  ? "Unlocking..."
                                  : "Unlock Full Candidate Profile"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {summary.About && (
                      <>
                        <h4 className="mt-30">About</h4>
                        <p>{summary.About}</p>
                      </>
                    )}

                    {summary.Professionalsummary && (
                      <>
                        <h4 className="mt-20">Professional summary</h4>
                        <p>{summary.Professionalsummary}</p>
                      </>
                    )}

                    {summary.ItiCertified && (
                      <>
                        <h4 className="mt-20">ITI Details</h4>
                        <ul>
                          <li>Trade: {summary.ItiTrade}</li>
                          <li>College: {summary.ItiCollege}</li>
                          <li>Marks: {summary.ItiMarks}</li>
                        </ul>
                      </>
                    )}
                  </div>

                  {/* ===================== skills TAB ===================== */}
                  <div
                    className="tab-pane fade"
                    id="tab-skills"
                    role="tabpanel"
                    aria-labelledby="tab-skills"
                  >
                    <h4>Core skills</h4>
                    <p>
                      skills shown here are visible in pre-unlock mode to
                      support shortlisting decisions before spending credits.
                    </p>
                    <div className="mt-20">
                      {skills.length === 0 && <p>No skills listed.</p>}
                      {skills.map((skill) => (
                        <span
                          key={skill.SkillName}
                          className="btn btn-grey-small mr-10 mb-10"
                          title={
                            skill.SkillRole
                              ? `${skill.SkillRole} - ${skill.YearsOfExperience ?? 0} yrs`
                              : `${skill.YearsOfExperience ?? 0} yrs`
                          }
                        >
                          {skill.SkillName}
                          {skill.YearsOfExperience != null
                            ? ` (${skill.YearsOfExperience} yrs)`
                            : ""}
                        </span>
                      ))}
                    </div>

                    {languages.length > 0 && (
                      <>
                        <h4 className="mt-30">languages</h4>
                        <ul>
                          {languages.map((lang) => (
                            <li key={lang.Language}>
                              <strong>{lang.Language}</strong> — Read:{" "}
                              {lang.CanRead ? "Yes" : "No"}, Write:{" "}
                              {lang.CanWrite ? "Yes" : "No"}, Speak:{" "}
                              {lang.CanSpeak ? "Yes" : "No"}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {educations.length > 0 && (
                      <>
                        <h4 className="mt-30">Education</h4>
                        <ul>
                          {educations.map((edu) => (
                            <li key={edu.EducationId}>
                              <strong>{edu.EducationLevel}</strong> -{" "}
                              {edu.InstituteName} ({edu.PassoutYear})
                              {edu.IsAiVerified && (
                                <span className="badge bg-success ml-10">
                                  AI Verified
                                </span>
                              )}
                              {edu.CertificateUrl && (
                                <a
                                  href={edu.CertificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-10"
                                >
                                  View Certificate
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  {/* ===================== WORK EXPERIENCE TAB ===================== */}
                  <div
                    className="tab-pane fade"
                    id="tab-work-experience"
                    role="tabpanel"
                    aria-labelledby="tab-work-experience"
                  >
                    <h4>Work Experience Snapshot</h4>
                    <p>
                      Full work details are shown after unlock. Current snapshot
                      includes role, company, and timeline.
                    </p>
                    <ul>
                      {workHistories.length === 0 && (
                        <li>No work history listed.</li>
                      )}
                      {workHistories.map((item) => (
                        <li key={item.WorkId}>
                          <strong>{item.JobTitle}</strong> at {item.CompanyName}{" "}
                          ({item.StartDate} -{" "}
                          {item.IsCurrent ? "Present" : item.EndDate}) -{" "}
                          {item.WorkLocation}
                          {item.IsOffshore ? " (Offshore)" : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="box-related-job content-page">
                <h3 className="mb-30">Work History</h3>
                <div className="box-list-jobs display-list">
                  {workHistories.map((item) => (
                    <div
                      className="col-xl-12 col-12"
                      key={`work-card-${item.WorkId}`}
                    >
                      <div className="card-grid-2 hover-up">
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12">
                            <div className="card-grid-2-image-left">
                              <div className="image-box">
                                <img
                                  src="/assets/imgs/brands/brand-6.png"
                                  alt="company logo"
                                />
                              </div>
                              <div className="right-info">
                                <a className="name-job" href="#">
                                  {item.CompanyName}
                                </a>
                                <span className="location-small">
                                  {item.WorkLocation}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 text-start text-md-end pr-60 col-md-6 col-sm-12">
                            <div className="pl-15 mb-15 mt-30">
                              <span className="btn btn-grey-small mr-5">
                                {item.IsCurrent ? "Current" : "Past"}
                              </span>
                              <span className="btn btn-grey-small mr-5">
                                {item.StartDate} -{" "}
                                {item.IsCurrent ? "Present" : item.EndDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="card-block-info">
                          <h4>
                            <a href="#">{item.JobTitle}</a>
                          </h4>
                          <p className="font-sm color-text-paragraph mt-10">
                            {item.JobDescription}
                          </p>
                          <div className="card-2-bottom mt-20">
                            <div className="row">
                              <div className="col-lg-7 col-7">
                                <span className="card-text-price">
                                  Status:
                                  <span className="text-success">
                                    {" "}
                                    {item.IsOffshore ? "Offshore" : "Onshore"}
                                  </span>
                                </span>
                              </div>
                              <div className="col-lg-5 col-5 text-end"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===================== SIDEBAR ===================== */}
            <div className="col-lg-4 col-md-12 col-sm-12 col-12 pl-40 pl-lg-15 mt-lg-30">
              <div className="sidebar-border">
                <h5 className="f-18">overview</h5>
                <div className="sidebar-list-job">
                  <ul>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-briefcase"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Experience</span>
                        <strong className="small-heading">
                          {overview.TotalExperienceYears} years
                        </strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-time-fast"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Trade</span>
                        <strong className="small-heading">
                          {overview.PrimaryTrade}
                        </strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-marker"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">
                          Current Location
                        </span>
                        <strong className="small-heading">
                          {overview.CurrentCity}
                          {overview.CurrentState
                            ? `, ${overview.CurrentState}`
                            : ""}
                        </strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-dollar"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">
                          Credits in Wallet
                        </span>
                        <strong className="small-heading">
                          {wallet ? wallet.AvailableCredits : "—"} credits
                        </strong>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="sidebar-list-job">
                  <h6 className="mb-10">Contact & cv Access</h6>
                  <ul className="ul-disc">
                    <li>
                      Mobile :
                      {isUnlocked
                        ? `${candidateDetails?.countryCode}
 ${candidateDetails?.mobileNumber}`
                        : "+91 XXXXXXXXXX"}
                    </li>
                    <li>
                      Email :{isUnlocked ? candidateDetails?.email : "Hidden"}
                    </li>
                    <li>
                      cv:{" "}
                      {cv?.cvAvailable
                        ? isUnlocked
                          ? "Available for download"
                          : "Available after unlock"
                        : "Not generated yet"}
                    </li>
                    <li>
                      Unlock expiry window:{" "}
                      {unlockStatus.ExpiryDate
                        ? unlockStatus.ExpiryDate
                        : "Not unlocked"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-box mt-50 mb-20">
        <div className="container">
          <div className="box-newsletter orange-newsletter">
            <div className="row">
              <div className="col-xl-3 col-12 text-center d-none d-xl-block">
                <img
                  src="/assets/imgs/template/newsletter-left.png"
                  alt="newsletter left visual"
                />
              </div>
              <div className="col-lg-12 col-xl-6 col-12">
                <h2 className="text-md-newsletter text-center">
                  Need More Matches? Buy Credits And Unlock Faster
                </h2>
                <div className="box-form-newsletter mt-40">
                  <form className="form-newsletter">
                    <input
                      className="input-newsletter"
                      type="text"
                      value=""
                      placeholder="Enter your email here"
                      readOnly
                    />
                    <button className="btn btn-default font-heading icon-send-letter">
                      Get Updates
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-xl-3 col-12 text-center d-none d-xl-block">
                <img
                  src="/assets/imgs/template/newsletter-right.png"
                  alt="newsletter right visual"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerCandidateProfilePage;
