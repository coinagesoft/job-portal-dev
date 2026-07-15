"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import candidateProfileService from "@/services/recruiter/Candidateprofileservice.js";
import { useToast } from "@/components/Toast";

/* Format a DateOnly ("2015-06-01") or ISO date to "Jun 2015" */
const fmtMonthYear = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtSalary = (n) =>
  n == null ? null : `₹${Number(n).toLocaleString("en-IN")}`;

// A "low credits" failure can come back a few different ways depending on
// the endpoint (message text, an explicit code, or a 402). Treat any of
// those as the same "credit issue" toast rather than a generic error.
const isCreditIssue = (err, result) => {
  const code = err?.response?.data?.code || result?.code;
  const status = err?.response?.status;
  const text = (
    err?.response?.data?.message ||
    err?.response?.data?.Message ||
    result?.message ||
    ""
  ).toLowerCase();

  return (
    code === "INSUFFICIENT_CREDITS" ||
    status === 402 ||
    text.includes("credit")
  );
};

const EmployerCandidateProfilePage = () => {
  const { candidateId } = useParams();
  const showToast = useToast();

  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // ---------------------------------------------
  // Load profile + wallet (+ contact if unlocked)
  // ---------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, walletRes] = await Promise.all([
        candidateProfileService.getFullProfile(candidateId),
        candidateProfileService.getWallet().catch(() => null),
      ]);

      setProfile(profileRes);
      setWallet(walletRes);

      const unlocked =
        profileRes?.unlockStatus?.isUnlocked ?? profileRes?.overview?.isUnlocked;

      if (unlocked) {
        const details = await candidateProfileService
          .getCandidateDetails(candidateId)
          .catch(() => null);
        setCandidateDetails(details);
      } else {
        setCandidateDetails(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
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
      if (result?.success) {
        const successText =
          result.message ||
          `Profile unlocked. ${result.creditsDeducted ?? 0} credit(s) used.`;
        setActionMessage({ type: "success", text: successText });
        showToast(successText, "success");
        await loadData();
      } else if (isCreditIssue(null, result)) {
        const text =
          result?.message ||
          "Not enough credits to unlock this profile. Please top up your wallet.";
        setActionMessage({ type: "error", text });
        showToast(text, "error");
      } else {
        const text = result?.message || "Unlock failed.";
        setActionMessage({ type: "error", text });
        showToast(text, "error");
      }
    } catch (err) {
      if (isCreditIssue(err, null)) {
        const text =
          err.response?.data?.message ||
          "Not enough credits to unlock this profile. Please top up your wallet.";
        setActionMessage({ type: "error", text });
        showToast(text, "error");
      } else {
        const text =
          err.response?.data?.message ||
          err.response?.data?.Message ||
          "Unlock failed.";
        setActionMessage({ type: "error", text });
        showToast(text, "error");
      }
    } finally {
      setUnlocking(false);
    }
  };

  // ---------------------------------------------
  // Download CV
  // ---------------------------------------------
  const handleDownloadCv = async () => {
    setDownloading(true);
    setActionMessage(null);
    try {
      const result = await candidateProfileService.downloadCv(candidateId);

      if (!result?.success) {
        const text = isCreditIssue(null, result)
          ? result?.message ||
            "Not enough credits to download this CV. Please top up your wallet."
          : result?.message || "Unable to download CV.";
        setActionMessage({ type: "error", text });
        showToast(text, "error");
        return;
      }

      // Deliver the actual file as a watermarked PDF (company name + date),
      // generated in memory on the server and streamed straight to the browser.
      const candidateName = profile?.overview?.fullName || "Candidate";
      const dl = await candidateProfileService.downloadWatermarkedCv(
        candidateId,
        candidateName,
      );

      if (!dl?.success) {
        const text = isCreditIssue(null, dl)
          ? dl?.message ||
            "Not enough credits to download this CV. Please top up your wallet."
          : dl?.message || "Unable to download the watermarked CV.";
        setActionMessage({ type: "error", text });
        showToast(text, "error");
        return;
      }

      const successText =
        result.message ||
        `CV downloaded. ${result.creditsDeducted ?? 0} credit(s) used.`;
      setActionMessage({ type: "success", text: successText });
      showToast(successText, "success");

      await loadData();
    } catch (err) {
      const text = isCreditIssue(err, null)
        ? err.response?.data?.message ||
          "Not enough credits to download this CV. Please top up your wallet."
        : err.response?.data?.message ||
          err.response?.data?.Message ||
          err.message ||
          "Unable to download CV.";
      setActionMessage({ type: "error", text });
      showToast(text, "error");
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
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="mt-15 color-text-paragraph-2">Loading candidate profile…</p>
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

  // ---------------------------------------------
  // Safe destructure (all camelCase from API)
  // ---------------------------------------------
  const overview = profile.overview || {};
  const summary = profile.summary || {};
  const skills = profile.skills || [];
  const languages = profile.languages || [];
  const educations = profile.educations || [];
  const workHistories = profile.workHistories || [];
  const cv = profile.cv || null;
  const unlockStatus = profile.unlockStatus || {};

  const isUnlocked = unlockStatus.isUnlocked ?? overview.isUnlocked ?? false;
  const cvAvailable = !!cv?.cvAvailable;

  return (
    <main className="main">
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-image-single">
            {/* <img
              src="/assets/imgs/page/blue-collar/welding.jpg"
              alt="candidate banner"
            /> */}
          </div>

          <div className="box-company-profile">
            <div className="image-compay">
              <img
                src={
                  overview.profilePhotoUrl ||
                  "/assets/imgs/page/candidates/candidate-profile.png"
                }
                style={{width:'85px',height:'85px'}}
                className="mt-3"
                alt="candidate profile"
              />
            </div>

            <div className="row mt-10">
              <div className="col-lg-8 col-md-12">
                <h5 className="f-18">
                  {overview.fullName}
                  <span className="card-location font-regular ml-20">
                    {overview.currentCity}
                    {overview.currentState ? `, ${overview.currentState}` : ""}
                  </span>
                </h5>

                <p className="mt-0 font-md color-text-paragraph-2 mb-15">
                  {overview.role || overview.primaryTrade}
                  {overview.totalExperienceYears != null
                    ? ` · ${overview.totalExperienceYears} years experience`
                    : ""}
                </p>

                <div className="candidate-tags-wrap mt-10 mb-15">
                  {summary.itiCertified && (
                    <span className="candidate-profile-tag">ITI Certified</span>
                  )}
                  {overview.availabilityStatus && (
                    <span className="candidate-profile-tag">
                      {overview.availabilityStatus}
                    </span>
                  )}
                  {overview.aiMatchScore != null && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        background: "#fff7ea",
                        border: "1px solid rgba(255,163,0,0.25)",
                        color: "#ff9900",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      <i className="fi-rr-badge-check" />
                      {overview.aiMatchScore}% AI Match
                    </span>
                  )}
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
                        ? "Unlocking…"
                        : "Unlock Profile"}
                  </button>

                  <button
                    className="btn btn-outline-custom btn-lg"
                    type="button"
                    disabled={!isUnlocked || !cvAvailable || downloading}
                    onClick={handleDownloadCv}
                  >
                    {downloading ? "Downloading…" : "Download CV"}
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
                  Skills
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
                        ? "This profile is unlocked. Contact details, CV, and full work records are available."
                        : "This profile is currently locked for employer view. Contact details, complete CV, and full work records are hidden until unlock."}
                    </p>

                    {!isUnlocked && (
                      <div className="alert alert-warning mt-20 mb-20" role="alert">
                        <strong>Profile locked.</strong> Unlock is irreversible.
                        Credits are deducted after confirmation.
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
                            <span className="visibility-badge success">Visible</span>
                          </div>

                          <div className="visibility-card-body">
                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-user"></i>
                              </div>
                              <div>
                                <span className="visibility-label">Candidate Name</span>
                                <h6 className="visibility-value">{overview.fullName}</h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-briefcase"></i>
                              </div>
                              <div>
                                <span className="visibility-label">Current Role</span>
                                <h6 className="visibility-value">
                                  {overview.role || overview.primaryTrade || "Not specified"}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-time-fast"></i>
                              </div>
                              <div>
                                <span className="visibility-label">Experience</span>
                                <h6 className="visibility-value">
                                  {overview.totalExperienceYears ?? 0} Years Experience
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-marker"></i>
                              </div>
                              <div>
                                <span className="visibility-label">Current Location</span>
                                <h6 className="visibility-value">
                                  {overview.currentCity}
                                  {overview.currentState
                                    ? `, ${overview.currentState}`
                                    : ""}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-id-badge"></i>
                              </div>
                              <div>
                                <span className="visibility-label">Availability Status</span>
                                <h6 className="visibility-value text-success">
                                  {overview.availabilityStatus || "Not specified"}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-credit-card"></i>
                              </div>
                              <div>
                                <span className="visibility-label">Notice Period</span>
                                <h6 className="visibility-value">
                                  {overview.noticePeriod || "Not specified"}
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
                                <span className="visibility-label">Expected Salary</span>
                                <h6 className="visibility-value">
                                  {isUnlocked
                                    ? fmtSalary(summary.preferredSalary) ||
                                      "Not specified"
                                    : "Hidden"}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-document"></i>
                              </div>
                              <div>
                                <span className="visibility-label">Resume Download</span>
                                <h6 className="visibility-value">
                                  {!cvAvailable
                                    ? "Not generated yet"
                                    : cv?.canDownloadCv
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
                                <span className="visibility-label">Disability Status</span>
                                <h6 className="visibility-value">
                                  {isUnlocked
                                    ? summary.disabilityStatus
                                      ? summary.disabilityNote || "Declared"
                                      : "None declared"
                                    : "Protected"}
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-credit-card"></i>
                              </div>
                              <div>
                                <span className="visibility-label">Unlock Access</span>
                                <h6 className="visibility-value">
                                  {isUnlocked
                                    ? `Expires ${fmtDate(unlockStatus.expiryDate) || "—"}`
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
                                  ? "Unlocking…"
                                  : "Unlock Full Candidate Profile"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {summary.about && (
                      <div
                        className="employer-cv-surface-card"
                        style={{
                          borderRadius: "18px",
                          padding: "26px",
                          marginTop: "30px",
                          border: "1px solid rgba(18,35,89,0.06)",
                          boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                        }}
                      >
                        <div>
                          <h5
                            style={{
                              color: "#122359",
                              fontWeight: 700,
                              marginBottom: "10px",
                            }}
                          >
                            About
                          </h5>
                          <p className="font-sm color-text-paragraph mb-0">
                            {summary.about}
                          </p>
                        </div>
                      </div>
                    )}

                    {summary.itiCertified && (
                      <div
                        className="employer-cv-surface-card"
                        style={{
                          borderRadius: "18px",
                          padding: "26px",
                          marginTop: "20px",
                          border: "1px solid rgba(18,35,89,0.06)",
                          boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                        }}
                      >
                        <h5
                          style={{
                            color: "#122359",
                            fontWeight: 700,
                            marginBottom: "16px",
                          }}
                        >
                          ITI Details
                        </h5>
                        <div className="row">
                          {summary.itiTrade && (
                            <div className="col-md-4 col-sm-12 mb-15">
                              <span
                                className="d-block font-xs color-text-mutted"
                                style={{
                                  textTransform: "uppercase",
                                  letterSpacing: "0.03em",
                                  fontWeight: 700,
                                }}
                              >
                                Trade
                              </span>
                              <strong style={{ color: "#122359" }}>
                                {summary.itiTrade}
                              </strong>
                            </div>
                          )}
                          {summary.itiCollege && (
                            <div className="col-md-4 col-sm-12 mb-15">
                              <span
                                className="d-block font-xs color-text-mutted"
                                style={{
                                  textTransform: "uppercase",
                                  letterSpacing: "0.03em",
                                  fontWeight: 700,
                                }}
                              >
                                College
                              </span>
                              <strong style={{ color: "#122359" }}>
                                {summary.itiCollege}
                              </strong>
                            </div>
                          )}
                          {summary.itiMarks && (
                            <div className="col-md-4 col-sm-12 mb-15">
                              <span
                                className="d-block font-xs color-text-mutted"
                                style={{
                                  textTransform: "uppercase",
                                  letterSpacing: "0.03em",
                                  fontWeight: 700,
                                }}
                              >
                                Marks
                              </span>
                              <strong style={{ color: "#122359" }}>
                                {summary.itiMarks}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===================== skills TAB ===================== */}
                  <div
                    className="tab-pane fade"
                    id="tab-skills"
                    role="tabpanel"
                    aria-labelledby="tab-skills"
                  >
                    <h4 style={{ color: "#122359", fontWeight: 700 }}>
                      Core Skills
                    </h4>
                    <p className="color-text-paragraph-2 mb-20">
                      Skills shown here are visible in pre-unlock mode to support
                      shortlisting decisions before spending credits.
                    </p>

                    {skills.length === 0 ? (
                      <p className="color-text-paragraph-2">No skills listed.</p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        {skills.map((skill, idx) => (
                          <span
                            key={`${skill.skillName}-${idx}`}
                            title={
                              skill.skillRole
                                ? `${skill.skillRole} · ${skill.yearsOfExperience ?? 0} yrs`
                                : `${skill.yearsOfExperience ?? 0} yrs`
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "8px 16px",
                              borderRadius: "999px",
                              background: "#fff7ea",
                              border: "1px solid rgba(255,163,0,0.18)",
                              color: "#ff9900",
                              fontSize: "13px",
                              fontWeight: 700,
                            }}
                          >
                            {skill.skillName}
                            {skill.skillRole && (
                              <span
                                style={{
                                  color: "#122359",
                                  fontWeight: 700,
                                  fontSize: "11px",
                                  padding: "2px 8px",
                                  borderRadius: "999px",
                                  background: "#EAF4FF",
                                }}
                              >
                                {skill.skillRole}
                              </span>
                            )}
                            {skill.yearsOfExperience != null && (
                              <span style={{ color: "#c97e00", fontWeight: 600 }}>
                                {skill.yearsOfExperience}
                                {" "}
                                yrs
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {languages.length > 0 && (
                      <div
                        className="employer-cv-surface-card"
                        style={{
                          borderRadius: "18px",
                          padding: "24px",
                          marginTop: "30px",
                          border: "1px solid rgba(18,35,89,0.06)",
                          boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                        }}
                      >
                        <h5
                          style={{
                            color: "#122359",
                            fontWeight: 700,
                            marginBottom: "16px",
                          }}
                        >
                          Languages
                        </h5>
                        <div className="row">
                          {languages.map((lang, idx) => (
                            <div
                              className="col-md-6 col-sm-12 mb-15"
                              key={`${lang.language}-${idx}`}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "12px 16px",
                                  borderRadius: "12px",
                                  background: "#f8f9fc",
                                }}
                              >
                                <strong style={{ color: "#122359" }}>
                                  {lang.language}
                                </strong>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  {[
                                    ["Read", lang.canRead],
                                    ["Write", lang.canWrite],
                                    ["Speak", lang.canSpeak],
                                  ].map(([label, ok]) => (
                                    <span
                                      key={label}
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        padding: "3px 9px",
                                        borderRadius: "999px",
                                        color: ok ? "#166534" : "#9ca3af",
                                        background: ok ? "#e7f9ed" : "#f1f2f5",
                                      }}
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {educations.length > 0 && (
                      <div
                        className="employer-cv-surface-card"
                        style={{
                          borderRadius: "18px",
                          padding: "24px",
                          marginTop: "20px",
                          border: "1px solid rgba(18,35,89,0.06)",
                          boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                        }}
                      >
                        <h5
                          style={{
                            color: "#122359",
                            fontWeight: 700,
                            marginBottom: "16px",
                          }}
                        >
                          Education
                        </h5>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          {educations.map((edu) => (
                            <div
                              key={edu.educationId}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "10px",
                                padding: "14px 16px",
                                borderRadius: "12px",
                                background: "#f8f9fc",
                              }}
                            >
                              <div>
                                <strong style={{ color: "#122359" }}>
                                  {edu.educationLevel}
                                </strong>
                                <div className="font-sm color-text-paragraph-2">
                                  {edu.instituteName}
                                  {edu.passoutYear ? ` · ${edu.passoutYear}` : ""}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                {edu.isAiVerified && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      color: "#166534",
                                      background: "#e7f9ed",
                                    }}
                                  >
                                    AI Verified
                                  </span>
                                )}
                                {edu.certificateUrl && (
                                  <a
                                    href={edu.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-sm"
                                    style={{ color: "#ff9900", fontWeight: 700 }}
                                  >
                                    View Certificate
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===================== WORK EXPERIENCE TAB ===================== */}
                  <div
                    className="tab-pane fade"
                    id="tab-work-experience"
                    role="tabpanel"
                    aria-labelledby="tab-work-experience"
                  >
                    <h4 style={{ color: "#122359", fontWeight: 700 }}>
                      Work Experience Snapshot
                    </h4>
                    <p className="color-text-paragraph-2 mb-20">
                      Current snapshot includes role, company, and timeline.
                    </p>

                    {workHistories.length === 0 ? (
                      <p className="color-text-paragraph-2">
                        No work history listed.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0",
                        }}
                      >
                        {workHistories.map((item, idx) => (
                          <div
                            key={item.workId}
                            style={{
                              display: "flex",
                              gap: "16px",
                              paddingBottom:
                                idx === workHistories.length - 1 ? "0" : "22px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "50%",
                                  background: item.isCurrent
                                    ? "#ffa300"
                                    : "#d8dde8",
                                  marginTop: "6px",
                                  flexShrink: 0,
                                }}
                              />
                              {idx !== workHistories.length - 1 && (
                                <div
                                  style={{
                                    width: "2px",
                                    flex: 1,
                                    background: "rgba(18,35,89,0.1)",
                                    marginTop: "4px",
                                  }}
                                />
                              )}
                            </div>

                            <div
                              className="employer-cv-surface-card"
                              style={{
                                flex: 1,
                                borderRadius: "16px",
                                padding: "18px 22px",
                                border: "1px solid rgba(18,35,89,0.06)",
                                boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  flexWrap: "wrap",
                                  gap: "10px",
                                }}
                              >
                                <div>
                                  <strong
                                    style={{ color: "#122359", fontSize: "16px" }}
                                  >
                                    {item.jobTitle}
                                  </strong>
                                  <div className="font-sm color-text-paragraph-2">
                                    {item.companyName}
                                    {item.workLocation
                                      ? ` · ${item.workLocation}`
                                      : ""}
                                  </div>
                                </div>

                                {item.isCurrent && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      padding: "4px 12px",
                                      borderRadius: "999px",
                                      color: "#166534",
                                      background: "#e7f9ed",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    Current
                                  </span>
                                )}
                              </div>

                              <div
                                className="font-xs color-text-mutted mt-10"
                                style={{ fontWeight: 600 }}
                              >
                                {fmtMonthYear(item.startDate)} —{" "}
                                {item.isCurrent
                                  ? "Present"
                                  : fmtMonthYear(item.endDate)}
                                {item.isOffshore ? " · Offshore" : " · Onshore"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="box-related-job content-page">
                <h3 className="mb-30">Work History</h3>
                <div className="box-list-jobs display-list">
                  {workHistories.length === 0 && (
                    <p className="color-text-paragraph-2">No work history listed.</p>
                  )}
                  {workHistories.map((item) => (
                    <div className="col-xl-12 col-12" key={`work-card-${item.workId}`}>
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
                                  {item.companyName}
                                </a>
                                <span className="location-small">
                                  {item.workLocation}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 text-start text-md-end pr-60 col-md-6 col-sm-12">
                            <div className="pl-15 mb-15 mt-30">
                              <span className="btn btn-grey-small mr-5">
                                {item.isCurrent ? "Current" : "Past"}
                              </span>
                              <span className="btn btn-grey-small mr-5">
                                {fmtMonthYear(item.startDate)} -{" "}
                                {item.isCurrent ? "Present" : fmtMonthYear(item.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="card-block-info">
                          <h4>
                            <a href="#">{item.jobTitle}</a>
                          </h4>
                          {item.jobDescription && (
                            <p className="font-sm color-text-paragraph mt-10">
                              {item.jobDescription}
                            </p>
                          )}
                          <div className="card-2-bottom mt-20">
                            <div className="row">
                              <div className="col-lg-7 col-7">
                                <span className="card-text-price">
                                  Status:
                                  <span className="text-success">
                                    {" "}
                                    {item.isOffshore ? "Offshore" : "Onshore"}
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
                <h5 className="f-18">Overview</h5>
                <div className="sidebar-list-job">
                  <ul>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-briefcase"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Experience</span>
                        <strong className="small-heading">
                          {overview.totalExperienceYears ?? 0} years
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
                          {overview.role || overview.primaryTrade || "—"}
                        </strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-marker"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Current Location</span>
                        <strong className="small-heading">
                          {overview.currentCity}
                          {overview.currentState ? `, ${overview.currentState}` : ""}
                        </strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-dollar"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Credits in Wallet</span>
                        <strong className="small-heading">
                          {wallet ? wallet.availableCredits : "—"} credits
                        </strong>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="sidebar-list-job">
                  <h6 className="mb-10">Contact &amp; CV Access</h6>
                  <ul className="ul-disc">
                    <li>
                      Mobile:{" "}
                      {isUnlocked && candidateDetails
                        ? `${candidateDetails.countryCode || ""} ${candidateDetails.mobileNumber || ""}`.trim() ||
                          "Not provided"
                        : "+91 XXXXXXXXXX"}
                    </li>
                    <li>
                      Email:{" "}
                      {isUnlocked
                        ? candidateDetails?.email || "Not provided"
                        : "Hidden"}
                    </li>
                    <li>
                      CV:{" "}
                      {cvAvailable
                        ? isUnlocked
                          ? "Available for download"
                          : "Available after unlock"
                        : "Not generated yet"}
                    </li>
                    <li>
                      Unlock expiry window:{" "}
                      {unlockStatus.expiryDate
                        ? fmtDate(unlockStatus.expiryDate)
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
                      defaultValue=""
                      placeholder="Enter your email here"
                    />
                    <button
                      type="button"
                      className="btn btn-default font-heading icon-send-letter"
                    >
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