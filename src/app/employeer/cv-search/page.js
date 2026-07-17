"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import {
  searchCandidates,
  getCvSearchDashboard,
  getFilterOptions,
} from "@/services/recruiter/recruiterCvSearchService";
import candidateProfileService from "@/services/recruiter/Candidateprofileservice";
import { getRecruiterJobs } from "@/services/recruiter/recruiterJobListService";
// import { getProfileCompletion } from "@/services/candidate/profileCompletionService"; 
// ↑ adjust the path to wherever you place/export the function above

const getQueryValue = (value, fallback = "") => {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
};

const parseInteger = (value) => {
  const parsed = Number.parseInt(getQueryValue(value, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const isChecked = (value) => {
  const checkedValue = String(getQueryValue(value, "")).toLowerCase();
  return (
    checkedValue === "1" ||
    checkedValue === "true" ||
    checkedValue === "on" ||
    checkedValue === "yes"
  );
};

const normalizeText = (value) =>  
  String(value || "")
    .toLowerCase()
    .trim();

const tokenizeSearch = (value) =>
  normalizeText(value)
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

const formatLocation = (candidate) =>
  `${candidate.currentCity}, ${candidate.currentState}`;

// Dedupes locations case-insensitively, keeping the first-seen casing as the
// display label — so "Pune" and "pune" collapse into a single option instead
// of showing up as two separate entries.
const getUniqueLocations = (optionsFromApi, candidates) => {
  const raw =
    optionsFromApi ??
    candidates.map((c) => c.currentCity).filter(Boolean);

  const seen = new Map(); // lowercased key -> display label

  raw.forEach((loc) => {
    const key = loc.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.set(key, loc.trim());
    }
  });

  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
};

const formatExperience = (candidate) => `${candidate.experienceYears} yrs exp`;

const availabilityLabel = (availability) =>
  availability === "available" ? "Available now" : "Not available";

const availabilityBadgeClass = (availability) =>
  availability === "available"
    ? "badge bg-success mr-5"
    : "badge bg-warning text-dark mr-5";

const availabilityTooltip = (availability) =>
  availability === "available"
    ? "Candidate is available to start immediately"
    : "Candidate is not available immediately";

const certificationTooltip = (type) =>
  type === "ITI"
    ? "ITI certified candidate"
    : type === "Passport"
      ? "Passport valid for travel"
      : type === "Offshore"
        ? "Candidate has offshore experience"
        : type;

const buildActiveFilterTags = (filters, tokenCount) => {
  const tags = [];

  if (filters.keyword) tags.push(`Keyword: "${filters.keyword}"`);
  if (tokenCount > 0) tags.push(`Keyword terms: ${tokenCount}`);
  if (filters.trade !== ANY_TRADE) tags.push(`Trade: ${filters.trade}`);
  if (filters.location) tags.push(`Location: ${filters.location}`);
  if (filters.availability !== ANY_AVAILABILITY)
    tags.push(`Availability: ${availabilityLabel(filters.availability)}`);
  if (filters.minExp !== null) tags.push(`Min exp: ${filters.minExp} yrs`);
  if (filters.maxExp !== null) tags.push(`Max exp: ${filters.maxExp} yrs`);
  if (filters.itiOnly) tags.push("ITI certified only");
  if (filters.passportOnly) tags.push("Passport valid");
  if (filters.offshoreOnly) tags.push("Offshore experience");
  if (filters.unlockedOnly) tags.push("Unlocked profiles only");

  return tags;
};

const CANDIDATE_ACTION_BUTTON_STYLE = {
  minWidth: "170px",
  height: "40px",
  padding: "0 14px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  borderRadius:"8px"
};

const EXPERIENCE_RANGES = [
  { label: "0 - 1 years", min: 0, max: 1 },
  { label: "1 - 2 years", min: 1, max: 2 },
  { label: "2 - 3 years", min: 2, max: 3 },
  { label: "3 - 5 years", min: 3, max: 5 },
  { label: "5 - 7 years", min: 5, max: 7 },
  { label: "7 - 10 years", min: 7, max: 10 },
  { label: "10 - 15 years", min: 10, max: 15 },
  { label: "15 - 20 years", min: 15, max: 20 },
  { label: "20+ years", min: 20, max: "" },
];

const createProfileHighlightTags = (candidate) => {
  const tags = [];

  // Top match
  if ((candidate.aiMatchScore ?? candidate.keywordMatchPercentage) >= 85) {
    tags.push({
      label: "Top Match",
      tone: "standout",
    });
  }

  // Available
  if (candidate.availabilityStatus?.toLowerCase() === "available") {
    tags.push({
      label: "Ready to Join",
      tone: "ready",
    });
  }

  // ITI
  if (candidate.isItiCertified) {
    tags.push({
      label: "ITI Certified",
      tone: "verified",
    });
  }

  // Passport
  if (candidate.isPassportValid) {
    tags.push({
      label: "Passport Valid",
      tone: "verified",
    });
  }

  // KYC
  if (candidate.isKycVerified) {
    tags.push({
      label: "KYC Verified",
      tone: "verified",
    });
  }

  // Experience
  if (candidate.experienceYears >= 10) {
    tags.push({
      label: "10+ Years",
      tone: "expertise",
    });
  }

  // Unlocked
  if (candidate.isUnlocked) {
    tags.push({
      label: "Unlocked",
      tone: "standout",
    });
  }

  // Skills
  (candidate.skills ?? []).slice(0, 2).forEach((skill) => {
    tags.push({
      label: skill,
      tone: "neutral",
    });
  });

  // Remove duplicates
  const dedupe = new Set();

  return tags
    .filter((tag) => {
      if (dedupe.has(tag.label)) {
        return false;
      }

      dedupe.add(tag.label);
      return true;
    })
    .slice(0, 6);
};

const EmployerCvSearchPage = () => {
  const [cvCandidates, setCvCandidates] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "",
    tradeCategory: "",
    minExperience: "",
    maxExperience: "",
    experienceRange: "",
    location: "",
    availabilityStatus: "",
    itiCertifiedOnly: false,
    passportValidOnly: false,
    unlockedProfilesOnly: false,
    sortBy: "KeywordMatch",
    pageNumber: 1,
    pageSize: 10,
    jobId: "",
  });

  const totalPages = Math.max(1, Math.ceil(totalCandidates / (filters.pageSize || 10)));

  const resetFilters = async () => {
    const defaultFilters = {
      keyword: "",
      tradeCategory: "",
      minExperience: "",
      maxExperience: "",
      location: "",
      availabilityStatus: "",
      itiCertifiedOnly: false,
      passportValidOnly: false,
      unlockedProfilesOnly: false,
      sortBy: "KeywordMatch",
      pageNumber: 1,
      pageSize: 10,
      jobId: "",
    };

    setFilters(defaultFilters);

    try {
      const response = await searchCandidates(defaultFilters);

      setCvCandidates(response.candidates);
      setTotalCandidates(response.totalCandidates);
    } catch (error) {
      console.error(error);
    }
  };
  const handleDownloadCv = async (candidateId, candidateName = "Candidate") => {
    try {
      // 1. Record/validate the download (unlock + credit) — camelCase response.
      const result = await candidateProfileService.downloadCv(candidateId);

      if (!result?.success) {
        alert(result?.message || "Unable to download CV");
        return;
      }

      // 2. Stream the watermarked PDF (company name + date), built in memory.
      const dl = await candidateProfileService.downloadWatermarkedCv(
        candidateId,
        candidateName,
      );

      if (!dl?.success) {
        alert(dl?.message || "Unable to download the watermarked CV.");
      }
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        "Unable to download CV",
      );
    }
  };
  const loadCandidates = async (overrideFilters) => {
    try {
      setLoading(true);

      const response = await searchCandidates(overrideFilters ?? filters);

      setCvCandidates(response.candidates);
      setTotalCandidates(response.totalCandidates);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* Run a brand-new search (filters changed) — always reset to page 1
     so the results the employer sees always start from the top. */
  const handleSearch = () => {
    const next = { ...filters, pageNumber: 1 };
    setFilters(next);
    loadCandidates(next);
  };

  /* Jump to a specific page of the current search, keeping filters as-is. */
  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === filters.pageNumber) return;
    const next = { ...filters, pageNumber: page };
    setFilters(next);
    loadCandidates(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadJobs = async () => {
    try {
      const response = await getRecruiterJobs({ pageSize: 100 });
      setJobs(response?.jobs ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  // Selecting a job switches the list into AI-ranked mode: the search is
  // re-run with the jobId so every candidate comes back with an AI match
  // score (aiMatchScore) and the job title it was scored against.
  const handleJobChange = async (jobId) => {
    const next = { ...filters, jobId, pageNumber: 1, sortBy: jobId ? "AiMatch" : "KeywordMatch" };
    setFilters(next);

    try {
      setLoading(true);
      const response = await searchCandidates(next);
      setCvCandidates(response.candidates);
      setTotalCandidates(response.totalCandidates);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const response = await getFilterOptions();
      setFilterOptions(response);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await getCvSearchDashboard();
      setDashboard(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCandidates();
    loadDashboard();
    loadFilterOptions();
    loadJobs();
  }, []);

  useEffect(() => {
    if (
      filters.minExperience !== "" &&
      filters.maxExperience !== "" &&
      Number(filters.minExperience) > Number(filters.maxExperience)
    ) {
      setFilters((prev) => ({
        ...prev,
        minExperience: prev.maxExperience,
        maxExperience: prev.minExperience,
      }));
    }
  }, [filters.minExperience, filters.maxExperience]);

  const updateFilterAndSearch = (partial) => {
    const next = { ...filters, ...partial, pageNumber: 1 };
    setFilters(next);
    loadCandidates(next);
  };
  const [completionMap, setCompletionMap] = useState({});

// Fetch profile-completion % for every candidate currently on screen.
useEffect(() => {
  if (!cvCandidates.length) return;
  let cancelled = false;

  (async () => {
    const entries = await Promise.all(
      cvCandidates.map(async (c) => {
        try {
          // const res = await getProfileCompletion(c.candidateId);
          console.log(`[CV Search] Profile completion for candidate ${c.fullName} (${c.candidateId}):`, res?.data);
          return [c.candidateId, res?.data?.data?.overallPct ?? null];
        } catch (error) {
          console.error(`[CV Search] Failed to fetch profile completion for ${c.fullName} (${c.candidateId}):`, error.response?.status, error.message);
          return [c.candidateId, null];
        }
      })
    );
    if (!cancelled) {
      setCompletionMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    }
  })();

  return () => {
    cancelled = true;
  };
}, [cvCandidates]);

  // const handleReset = () => {
  //   const defaultFilters = {
  //     keyword: "",
  //     tradeCategory: "",
  //     minExperience: "",
  //     maxExperience: "",
  //     location: "",
  //     availabilityStatus: "",
  //     itiCertifiedOnly: false,
  //     passportValidOnly: false,
  //     offshoreOnly: false,
  //     unlockedProfilesOnly: false,
  //     sortBy: "KeywordMatch",
  //     pageNumber: 1,
  //     pageSize: 10,
  //     jobId: "",
  //   };

  //   setFilters(defaultFilters);
  //   loadCandidates(defaultFilters);
  // };

  return (
    <main className="main">
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-single banner-single-bg">
            <div className="block-banner text-center">
              <h3>
                <span className="color-brand-2">{totalCandidates}</span>{" "}
                Candidates in CV Search
              </h3>
              <div className="font-sm color-text-paragraph-2 mt-10">
                Search by keyword, trade, experience, location, and verification
                tags.
              </div>

<div className="form-find text-start mt-40" style={{ width: "100%" }}>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSearch();
    }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      width: "100%",
      flexWrap: "nowrap", 
    }}
  >
    {/* Trade */}
    <div style={{ flex: "1 1 100px", minWidth: "100px" }}>
      <select
        className="form-input select-active input-industry dashboard-select-arrow"
        value={filters.tradeCategory}
        onChange={(e) =>
          updateFilterAndSearch({ tradeCategory: e.target.value })
        }
        style={{
          width: "100%",
          height: "50px",
          borderRadius: "8px",
        }}
      >
        <option value="">Any Trade</option>
        {(filterOptions?.tradeCategories ?? []).map((tradeOption) => (
          <option key={tradeOption} value={tradeOption}>
            {tradeOption}
          </option>
        ))}
      </select>
    </div>

    {/* AI Match */}
    <div style={{ flex: "1.2 1 120px", minWidth: "120px" }}>
      <select
        className="form-input select-active input-industry dashboard-select-arrow"
        value={filters.jobId}
        onChange={(e) => handleJobChange(e.target.value)}
        style={{
          width: "100%",
          height: "50px",
          borderRadius: "8px",
        }}
      >
        <option value="">AI Match: Select Job</option>
        {jobs.map((job) => (
          <option key={job.jobId} value={job.jobId}>
            {job.jobTitle}
          </option>
        ))}
      </select>
    </div>

    {/* Keyword */}
    <div style={{ flex: "2 1 120px", minWidth: "120px" }}>
     <input
  className="form-input input-keysearch dashboard-search-text"
  type="text"
  value={filters.keyword}
  onChange={(e) =>
    setFilters({
      ...filters,
      keyword: e.target.value,
    })
  }
  placeholder="Trade, Skill, Name, Location"
  list="cv-keyword-suggestions"
  style={{
    width: "100%",
    height: "50px",
    borderRadius: "8px",
    paddingLeft: "45px", // Increase this
  }}
/>

      <datalist id="cv-keyword-suggestions">
        <option value="welder" />
        <option value="electrician" />
        <option value="driver" />
        <option value="iti certified" />
        <option value="passport valid" />
        <option value="mumbai" />
        <option value="pipeline" />
      </datalist>
    </div>

    {/* Availability */}
    <div style={{ flex: "1 1 120px", minWidth: "120px" }}>
      <select
        className="form-input select-active dashboard-select-arrow"
        value={filters.availabilityStatus}
        onChange={(e) =>
          updateFilterAndSearch({
            availabilityStatus: e.target.value,
          })
        }
        style={{
          width: "100%",
          height: "50px",
          borderRadius: "8px",
        }}
      >
        <option value="">Any Availability</option>
        <option value="Available">Available Now</option>
        <option value="Unavailable">Not Available</option>
      </select>
    </div>

    {/* Search */}
    <button
      className="btn btn-default btn-find font-sm"
      type="submit"
      style={{
        height: "50px",
        minWidth: "120px",
        padding: "0 24px",
        borderRadius: "8px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      Search
    </button>

    {/* Reset */}
    <button
      type="button"
      onClick={resetFilters}
      className="btn"
      style={{
        height: "50px",
        minWidth: "90px",
        padding: "0 20px",
        borderRadius: "8px",
        // border: "1px solid #d9d9d9",
        background: "#fff",
        color: "#6b7280",
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      Reset
    </button>
  </form>
</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-box mt-30 mb-50">
        <div className="container">
          <div className="row flex-row-reverse">
            <div className="col-lg-9 col-md-12 col-sm-12 col-12 float-right">
              <div className="content-page">
                <div className="box-filters-job">
                  <div className="row">
                    <div className="col-xl-7 col-lg-7">
                      <span className="text-small text-showing">
                        <strong>{totalCandidates}</strong> candidates found
                      </span>
                      <p className="font-xs color-text-paragraph-2 mt-5 mb-0">
                        AI match scores each candidate against the selected
                        job using skills, trade, experience, and location.
                      </p>
                    </div>
                    {/* <div className="col-xl-5 col-lg-5 text-lg-end mt-sm-15">
                      <div className="display-flex2">
                        <div className="box-border mr-10">
                          <span className="text-sortby">Credits:</span>
                          <strong className="color-brand-1">
                            {dashboard?.availableCredits}
                          </strong>
                        </div>
                        <span className="btn btn-grey-small mr-5">A = 1cr</span>
                        <span className="btn btn-grey-small mr-5">B = 2cr</span>
                        <span className="btn btn-grey-small">C = 3cr</span>
                      </div>
                    </div> */}
                  </div>

                  {/* {activeFilterTags.length > 0 ? (
                    <div className="mt-15">
                      {activeFilterTags.map((tag) => (
                        <span
                          key={tag}
                          className="badge bg-light text-dark mr-5 mb-5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null} */}
                </div>

                <div className="row display-list">
                  {cvCandidates.length === 0 ? (
                    <div className="col-xl-12 col-12">
                      <div className="card-grid-2 hover-up">
                        <div className="card-block-info pt-20">
                          <h5 className="mb-10">
                            No candidates matched your filters.
                          </h5>
                          <p className="font-sm color-text-paragraph mb-0">
                            Try broadening keywords, removing one filter, or
                            resetting to view all candidates.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {cvCandidates.map((candidate) => {
                    const profileHighlightTags =
                      createProfileHighlightTags(candidate);

                    return (
                      <div
                        className="col-xl-12 col-12"
                        key={candidate.candidateId}
                      >
                        <div
                          className={`card-grid-2 hover-up cv-search-candidate-card ${candidate.isUnlocked ? "is-unlocked" : ""
                            }`}
                        >
                          <div className="row">
                            <div className="col-lg-7 col-md-7 col-sm-12">
                              <div className="card-grid-2-image-left">
                                <div className="image-box">
                                  <img
                                    src={
                                      candidate.profilePhotoUrl ||
                                      "/assets/imgs/page/candidates/candidate-profile.png"
                                    }
                                    style={{ width: '85px', height: '85px', borderRadius: "8px" }}
                                    alt={candidate.fullName}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src =
                                        "/assets/imgs/page/candidates/candidate-profile.png";
                                    }}
                                  />
                                </div>

                                <div className="right-info">
                                  <Link
                                    className="name-job"
                                    href={`/employeer/candidate-profile/${candidate.candidateId}`}
                                  >
                                    {candidate.fullName}
                                  </Link>

                                  <div>
                                    {formatExperience(candidate) &&
                                      formatExperience(candidate) !== "null" &&
                                      formatExperience(candidate) !== "undefined" && (
                                        <span className="card-briefcase">
                                          {formatExperience(candidate)}
                                        </span>
                                      )}

                                    {formatLocation(candidate) &&
                                      formatLocation(candidate) !== "null, null" &&
                                      formatLocation(candidate) !== "null," &&
                                      formatLocation(candidate) !== "undefined" && (
                                        <span className="card-location">
                                          <span>{formatLocation(candidate)}</span>
                                        </span>
                                      )}
                                  </div>

                                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "6px" }}>
                                    {candidate.availabilityStatus?.toLowerCase() === "available" && (
                                      <span className="available-now-text" style={{ margin: 0 }}>
                                        Available now
                                      </span>
                                    )}

                                    {completionMap[candidate.candidateId] != null && (
                                      <span
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px",
                                          padding: "3px 10px",
                                          borderRadius: "999px",
                                          background: "#fff7ea",
                                          border: "1px solid rgba(255,163,0,0.25)",
                                          color: "#ff9900",
                                          fontSize: "11px",
                                          fontWeight: 700,
                                        }}
                                      >
                                        <i className="fi-rr-stats" style={{ fontSize: "11px" }} />
                                        {completionMap[candidate.candidateId]}% Profile Complete
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-lg-5 text-start text-md-end pr-60 col-md-5 col-sm-12">
                              <div className="cv-search-profile-tags">
                                {profileHighlightTags.map((tag) => (
                                  <span
                                    key={`${candidate.candidateId}-${tag.label}`}
                                    className={`cv-search-highlight-tag cv-search-highlight-tag-${tag.tone}`}
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="card-block-info">
                            <h4>
                              <Link
                                href={`/employeer/candidate-profile/${candidate.candidateId}`}
                              >
                                {candidate.role || candidate.primaryTrade || "—"}
                              </Link>
                            </h4>

                            {/* <div className="mt-5">
                              <span className="card-briefcase">
                                {formatExperience(candidate)}
                              </span>

                              <span className="card-time">
                                <span>{formatLocation(candidate)}</span>
                              </span>
                            </div> */}

                            <div className="cv-search-skill-tags mt-10 mb-10">
                              {candidate.skills?.map((skill) => (
                                <span
                                  key={`${candidate.candidateId}-${skill}`}
                                  className="cv-search-skill-tag cv-search-skill-tag-secondary"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>

                            <div className="card-2-bottom mt-20">
                              <div className="row align-items-center">
                                <div className="col-lg-7 col-7">
                                  <span className="card-text-price">
                                    {candidate.aiMatchedJobTitle ? (
                                      <>
                                        AI matched: {candidate.aiMatchScore}%{" "}
                                        <span className="font-xs color-text-mutted">
                                          vs {candidate.aiMatchedJobTitle}
                                        </span>
                                      </>
                                    ) : (
                                      "Select a job for AI match"
                                    )}
                                  </span>
                                  {/* 
                                  <span className="font-xs color-text-mutted ml-10">
                                    Band {candidate.band} -{" "}
                                    {candidate.unlockCredits} cr
                                  </span> */}
                                </div>

                                <div className="col-lg-5 col-5 text-end">
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "flex-end",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    {candidate.canDownloadCv && (
                                      <button
                                        className="btn btn-border"
                                        type="button"
                                        style={CANDIDATE_ACTION_BUTTON_STYLE}
                                        onClick={() =>
                                          handleDownloadCv(
                                            candidate.candidateId,
                                            candidate.fullName,
                                          )
                                        }
                                      >
                                        Download CV
                                      </button>
                                    )}

                                    {candidate.isUnlocked ? (
                                      <Link
                                        className="btn btn-apply-now cv-search-unlock-btn"
                                        href={`/employeer/candidate-profile/${candidate.candidateId}`}
                                        style={CANDIDATE_ACTION_BUTTON_STYLE}
                                      >
                                        View Profile
                                      </Link>
                                    ) : (
                                      <Link
                                        className="btn btn-apply-now"
                                        href={`/employeer/candidate-profile/${candidate.candidateId}`}
                                        style={CANDIDATE_ACTION_BUTTON_STYLE}
                                      >
                                        Unlock ({candidate.unlockCredits} Credits)
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalCandidates > 0 && totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 30,
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-border btn-sm"
                      disabled={filters.pageNumber <= 1 || loading}
                      onClick={() => goToPage(filters.pageNumber - 1)}
                    >
                      ‹ Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Always show first, last, current, and neighbours;
                        // collapse the rest so the bar stays readable even
                        // with many pages.
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - filters.pageNumber) <= 1
                        );
                      })
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          acc.push("ellipsis-" + page);
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((page) =>
                        typeof page === "string" ? (
                          <span
                            key={page}
                            style={{ padding: "0 4px", color: "#94a3b8" }}
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            className={`btn btn-sm ${page === filters.pageNumber
                              ? "btn-default"
                              : "btn-border"
                              }`}
                            disabled={loading}
                            onClick={() => goToPage(page)}
                            style={{ minWidth: 40 }}
                          >
                            {page}
                          </button>
                        ),
                      )}

                    <button
                      type="button"
                      className="btn btn-border btn-sm"
                      disabled={filters.pageNumber >= totalPages || loading}
                      onClick={() => goToPage(filters.pageNumber + 1)}
                    >
                      Next ›
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-3 col-md-12 col-sm-12 col-12">
              <div className="sidebar-shadow none-shadow mb-30">
                <div className="sidebar-filters">
                  <form>
                    <div className="filter-block head-border mb-30">
                      <h5>
                        Search Filters{" "}
                        <button
                          type="button"
                          className="btn   mb-8"
                          onClick={resetFilters}
                        >
                          Reset
                        </button>
                      </h5>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Keyword</label>
                        <input
                          className="form-control form-icons"
                          type="text"
                          name="q"
                          value={filters.keyword}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              keyword: e.target.value,
                            })
                          }
                          placeholder="Trade, skill, name, location"
                          list="cv-keyword-suggestions"
                        />
                        <p className="font-xs color-text-paragraph-2 mt-5 mb-0">
                          Matches against role, skills, certifications, and
                          location
                        </p>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Trade category</label>
                        <select
                          className="form-control form-icons select-active"
                          value={filters.tradeCategory}
                          onChange={(e) => updateFilterAndSearch({ tradeCategory: e.target.value })}
                        >
                          <option value="">Any trade</option>
                          {(filterOptions?.tradeCategories ?? []).map((tradeOption) => (
                            <option key={tradeOption} value={tradeOption}>
                              {tradeOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Experience</label>
                        <select
                          className="form-control"
                          value={filters.experienceRange}
                          onChange={(e) => {
                            const selected = EXPERIENCE_RANGES.find((r) => r.label === e.target.value);
                            updateFilterAndSearch({
                              experienceRange: e.target.value,
                              minExperience: selected ? selected.min : "",
                              maxExperience: selected ? selected.max : "",
                            });
                          }}
                        >
                          <option value="">Any experience</option>
                          {EXPERIENCE_RANGES.map((r) => (
                            <option key={r.label} value={r.label}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Location</label>
                        <select
  className="form-control form-icons select-active"
  value={filters.location}
  onChange={(e) => updateFilterAndSearch({ location: e.target.value })}
>
  <option value="">Any location</option>
  {getUniqueLocations(filterOptions?.locations, cvCandidates).map((loc) => (
    <option key={loc} value={loc}>
      {loc}
    </option>
  ))}
</select>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Availability</label>
                        <select
                          className="form-control form-icons select-active"
                          value={filters.availabilityStatus}
                          onChange={(e) => updateFilterAndSearch({ availabilityStatus: e.target.value })}
                        >
                          <option value="">Any</option>
                          <option value="Available">Available now</option>
                          <option value="Unavailable">Not available</option>
                        </select>
                      </div>
                    </div>
                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Certifications & Status</label>
                        <ul className="list-checkbox">
                          <li>
                            <label className="cb-container">
                              <input
                                type="checkbox"
                                name="iti"
                                checked={filters.itiCertifiedOnly}
                                onChange={(e) => updateFilterAndSearch({ itiCertifiedOnly: e.target.checked })}
                              />
                              <span className="text-small">ITI certified only</span>
                              <span className="checkmark"></span>
                            </label>
                          </li>
                          <li>
                            <label className="cb-container">
                              <input
                                type="checkbox"
                                name="passport"
                                checked={filters.passportValidOnly}
                                onChange={(e) => updateFilterAndSearch({ passportValidOnly: e.target.checked })}
                              />
                              <span className="text-small">Valid passport</span>
                              <span className="checkmark"></span>
                            </label>
                          </li>
                          <li>
                            <label className="cb-container">
                              <input
                                type="checkbox"
                                name="offshore"
                                checked={filters.offshoreOnly}
                                onChange={(e) => updateFilterAndSearch({ offshoreOnly: e.target.checked })}
                              />
                              <span className="text-small">Offshore experience</span>
                              <span className="checkmark"></span>
                            </label>
                          </li>
                          <li>
                            <label className="cb-container">
                              <input
                                type="checkbox"
                                name="unlocked"
                                checked={filters.unlockedProfilesOnly}
                                onChange={(e) => updateFilterAndSearch({ unlockedProfilesOnly: e.target.checked })}
                              />
                              <span className="text-small">Unlocked profiles only</span>
                              <span className="checkmark"></span>
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="filter-block mb-30">
                      <div className="form-group">
                        <label className="mb-5">Sort by</label>
                        <select
                          className="form-control form-icons select-active"
                          name="sort"
                          value={filters.sortBy}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              sortBy: e.target.value,
                            })
                          }
                        >
                          <option value="KeywordMatch">
                            AI match score
                          </option>

                          <option value="Newest">Newest profile update</option>

                          <option value="Experience">
                            Experience high to low
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <button
                        className="btn btn-default w-100 mb-10"
                        type="button"
                        onClick={handleSearch}
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        className="btn btn-border w-100"
                        onClick={resetFilters}
                      >
                        Clear filters
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .sidebar-filters .form-control,
        .sidebar-filters .form-input,
        .sidebar-filters select,
        .sidebar-filters input,
        .form-find .form-input,
        .form-find select,
        .form-find input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .sidebar-filters .form-control:focus,
        .sidebar-filters .form-input:focus,
        .sidebar-filters select:focus,
        .sidebar-filters input:focus,
        .form-find .form-input:focus,
        .form-find select:focus,
        .form-find input:focus {
          border-color: #ffa300 !important;
          box-shadow: 0 0 0 3px rgba(255, 163, 0, 0.15) !important;
          outline: none !important;
        }

        .sidebar-filters .cb-container input:checked ~ .checkmark {
          background-color: #ffa300 !important;
          border-color: #ffa300 !important;
        }
      `}</style>
    </main>

    
  );
  
};

export default EmployerCvSearchPage;