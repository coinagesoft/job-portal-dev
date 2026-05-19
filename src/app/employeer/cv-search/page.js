import Link from "next/link";

const EMPLOYER_CREDITS = 3;
const ANY_TRADE = "any";
const ANY_AVAILABILITY = "any";

const cvCandidates = [
  {
    id: "CAND-001",
    name: "Ramesh Kumar Sharma",
    trade: "Welder",
    yearsExp: 8,
    locationCity: "Mumbai",
    locationState: "MH",
    availability: "available",
    primarySkill: "6G Arc Welding",
    secondarySkills: [
      "MIG Welding",
      "Pipeline Fabrication",
      "Blueprint Reading",
    ],
    certifications: ["ITI Certified", "KYC Verified"],
    itiCertified: true,
    passportValid: true,
    offshoreExperience: true,
    baseScore: 86,
    profileUpdatedAt: "2026-04-18",
    isUnlocked: false,
  },
  {
    id: "CAND-002",
    name: "Priya Singh",
    trade: "Electrician",
    yearsExp: 5,
    locationCity: "Pune",
    locationState: "MH",
    availability: "available",
    primarySkill: "Industrial Wiring",
    secondarySkills: ["Panel Troubleshooting", "PLC Basics", "Cable Routing"],
    certifications: ["ITI Certified"],
    itiCertified: true,
    passportValid: false,
    offshoreExperience: false,
    baseScore: 82,
    profileUpdatedAt: "2026-04-20",
    isUnlocked: false,
  },
  {
    id: "CAND-003",
    name: "Mohammed Asif",
    trade: "Marine Engineer",
    yearsExp: 14,
    locationCity: "Chennai",
    locationState: "TN",
    availability: "unavailable",
    primarySkill: "Engine Room Maintenance",
    secondarySkills: [
      "Dry Dock Support",
      "Ship Electrical",
      "Safety Compliance",
    ],
    certifications: ["Passport Valid", "STCW"],
    itiCertified: false,
    passportValid: true,
    offshoreExperience: true,
    baseScore: 84,
    profileUpdatedAt: "2026-04-12",
    isUnlocked: false,
  },
  {
    id: "CAND-004",
    name: "Suresh Deshmukh",
    trade: "Driver",
    yearsExp: 3,
    locationCity: "Nagpur",
    locationState: "MH",
    availability: "available",
    primarySkill: "Heavy Vehicle Driving",
    secondarySkills: ["Route Planning", "Logbook Maintenance", "Fleet Safety"],
    certifications: ["LMV + HMV License", "Background Verified"],
    itiCertified: false,
    passportValid: false,
    offshoreExperience: false,
    baseScore: 74,
    profileUpdatedAt: "2026-04-21",
    isUnlocked: true,
    unlockedDaysLeft: 42,
  },
  {
    id: "CAND-005",
    name: "Amit Patnaik",
    trade: "Plumber",
    yearsExp: 9,
    locationCity: "Bhubaneswar",
    locationState: "OD",
    availability: "available",
    primarySkill: "Commercial Plumbing",
    secondarySkills: ["Blueprint Reading", "HVAC Pipeline", "Welding Support"],
    certifications: ["Safety Card", "KYC Verified"],
    itiCertified: false,
    passportValid: true,
    offshoreExperience: false,
    baseScore: 78,
    profileUpdatedAt: "2026-04-15",
    isUnlocked: false,
  },
  {
    id: "CAND-006",
    name: "Naveen Kumar",
    trade: "Mason",
    yearsExp: 11,
    locationCity: "Hyderabad",
    locationState: "TS",
    availability: "available",
    primarySkill: "Industrial Blockwork",
    secondarySkills: ["Concrete Finishing", "Scaffolding", "Blueprint Reading"],
    certifications: ["ITI Certified", "Safety Card"],
    itiCertified: true,
    passportValid: false,
    offshoreExperience: false,
    baseScore: 80,
    profileUpdatedAt: "2026-04-17",
    isUnlocked: false,
  },
  {
    id: "CAND-007",
    name: "Harish Menon",
    trade: "Cook",
    yearsExp: 7,
    locationCity: "Kochi",
    locationState: "KL",
    availability: "unavailable",
    primarySkill: "Bulk Meal Production",
    secondarySkills: ["Menu Planning", "Food Costing", "Hygiene Compliance"],
    certifications: ["Food Safety Level 2", "Passport Valid"],
    itiCertified: false,
    passportValid: true,
    offshoreExperience: true,
    baseScore: 79,
    profileUpdatedAt: "2026-04-11",
    isUnlocked: false,
  },
  {
    id: "CAND-008",
    name: "Sneha Verma",
    trade: "Electrician",
    yearsExp: 6,
    locationCity: "Noida",
    locationState: "UP",
    availability: "available",
    primarySkill: "Control Panel Assembly",
    secondarySkills: [
      "SCADA Support",
      "Maintenance Planning",
      "Cable Fault Testing",
    ],
    certifications: ["ITI Certified", "KYC Verified", "Safety Card"],
    itiCertified: true,
    passportValid: true,
    offshoreExperience: false,
    baseScore: 88,
    profileUpdatedAt: "2026-04-22",
    isUnlocked: false,
  },
];

const tradeOptions = Array.from(
  new Set(cvCandidates.map((candidate) => candidate.trade)),
).sort();

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
  `${candidate.locationCity}, ${candidate.locationState}`;
const formatExperience = (candidate) => `${candidate.yearsExp} yrs exp`;

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

const buildCandidateSearchText = (candidate) =>
  normalizeText(
    [
      candidate.id,
      candidate.name,
      candidate.trade,
      candidate.primarySkill,
      candidate.secondarySkills.join(" "),
      candidate.certifications.join(" "),
      formatLocation(candidate),
    ].join(" "),
  );

const getMatchedKeywords = (candidate, queryTokens) => {
  if (!queryTokens.length) return [];

  const searchText = buildCandidateSearchText(candidate);
  const seen = new Set();
  const matches = [];

  for (const token of queryTokens) {
    if (seen.has(token)) continue;
    if (searchText.includes(token)) {
      seen.add(token);
      matches.push(token);
    }
  }

  return matches;
};

const getBandPricing = (score) => {
  if (score >= 90) return { band: "Band A", credits: 1 };
  if (score >= 80) return { band: "Band B", credits: 2 };
  return { band: "Band C", credits: 3 };
};

const scoreCandidate = (candidate, queryTokens) => {
  const matchedKeywords = getMatchedKeywords(candidate, queryTokens);

  if (!queryTokens.length) {
    return {
      matchedKeywords,
      matchScore: candidate.baseScore,
    };
  }

  const coverage = matchedKeywords.length / queryTokens.length;
  const weightedScore = Math.round(
    candidate.baseScore * 0.72 +
      coverage * 28 +
      (candidate.itiCertified ? 1 : 0),
  );

  return {
    matchedKeywords,
    matchScore: Math.max(58, Math.min(99, weightedScore)),
  };
};

const sortCandidates = (candidates, sortBy) => {
  const sorted = [...candidates];

  if (sortBy === "newest") {
    sorted.sort(
      (a, b) => new Date(b.profileUpdatedAt) - new Date(a.profileUpdatedAt),
    );
    return sorted;
  }

  if (sortBy === "experience") {
    sorted.sort((a, b) => b.yearsExp - a.yearsExp);
    return sorted;
  }

  sorted.sort((a, b) => b.matchScore - a.matchScore);
  return sorted;
};

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
};

export const metadata = {
  title: "Employer CV Search - Job Portal",
  description: "Search and unlock candidate profiles.",
};

const EmployerCvSearchPage = async ({ searchParams }) => {
  const params = (await searchParams) || {};

  const filters = {
    keyword: String(getQueryValue(params.q, "")).trim(),
    trade: getQueryValue(params.trade, ANY_TRADE),
    location: String(getQueryValue(params.location, "")).trim(),
    availability: getQueryValue(params.availability, ANY_AVAILABILITY),
    minExp: parseInteger(params.minExp),
    maxExp: parseInteger(params.maxExp),
    itiOnly: isChecked(params.iti),
    passportOnly: isChecked(params.passport),
    offshoreOnly: isChecked(params.offshore),
    unlockedOnly: isChecked(params.unlocked),
    sort: getQueryValue(params.sort, "match"),
  };

  if (
    filters.minExp !== null &&
    filters.maxExp !== null &&
    Number.isFinite(filters.minExp) &&
    Number.isFinite(filters.maxExp) &&
    filters.minExp > filters.maxExp
  ) {
    const minValue = filters.minExp;
    filters.minExp = filters.maxExp;
    filters.maxExp = minValue;
  }

  const queryTokens = tokenizeSearch(filters.keyword);

  const candidatesWithScore = cvCandidates.map((candidate) => {
    const scoring = scoreCandidate(candidate, queryTokens);
    const pricing = getBandPricing(scoring.matchScore);
    const canUnlock =
      candidate.isUnlocked || EMPLOYER_CREDITS >= pricing.credits;

    return {
      ...candidate,
      ...scoring,
      ...pricing,
      canUnlock,
      unlockText: candidate.isUnlocked
        ? `Unlocked - ${candidate.unlockedDaysLeft || 30}d left`
        : canUnlock
          ? `Unlock profile (${pricing.credits} cr)`
          : `Need ${pricing.credits} credits`,
    };
  });

  const filteredCandidates = sortCandidates(
    candidatesWithScore.filter((candidate) => {
      if (filters.trade !== ANY_TRADE && candidate.trade !== filters.trade)
        return false;

      if (
        filters.availability !== ANY_AVAILABILITY &&
        candidate.availability !== filters.availability
      )
        return false;

      if (filters.location) {
        const locationText = normalizeText(
          `${candidate.locationCity} ${candidate.locationState}`,
        );
        if (!locationText.includes(normalizeText(filters.location)))
          return false;
      }

      if (filters.minExp !== null && candidate.yearsExp < filters.minExp)
        return false;
      if (filters.maxExp !== null && candidate.yearsExp > filters.maxExp)
        return false;
      if (filters.itiOnly && !candidate.itiCertified) return false;
      if (filters.passportOnly && !candidate.passportValid) return false;
      if (filters.offshoreOnly && !candidate.offshoreExperience) return false;
      if (filters.unlockedOnly && !candidate.isUnlocked) return false;

      if (queryTokens.length > 0 && candidate.matchedKeywords.length === 0)
        return false;

      return true;
    }),
    filters.sort,
  );

  const activeFilterTags = buildActiveFilterTags(filters, queryTokens.length);

  return (
    <main className="main">
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-single banner-single-bg">
            <div className="block-banner text-center">
              <h3>
                <span className="color-brand-2">{cvCandidates.length}</span>{" "}
                Candidates in CV Search
              </h3>
              <div className="font-sm color-text-paragraph-2 mt-10">
                Search by keyword, trade, experience, location, and verification
                tags.
              </div>

              <div className="form-find text-start mt-40">
                <form method="get">
                  <div className="box-industry">
                    <select
                      className="form-input mr-10 select-active input-industry"
                      name="trade"
                      defaultValue={filters.trade}
                    >
                      <option value={ANY_TRADE}>Any trade</option>
                      {tradeOptions.map((tradeOption) => (
                        <option key={tradeOption} value={tradeOption}>
                          {tradeOption}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    className="form-input input-keysearch mr-10"
                    type="text"
                    name="q"
                    defaultValue={filters.keyword}
                    placeholder="Trade, skill, name, location"
                    list="cv-keyword-suggestions"
                  />

                  <datalist id="cv-keyword-suggestions">
                    <option value="welder" />
                    <option value="electrician" />
                    <option value="driver" />
                    <option value="iti certified" />
                    <option value="passport valid" />
                    <option value="offshore" />
                    <option value="mumbai" />
                    <option value="pipeline" />
                  </datalist>

                  <select
                    className="form-input mr-10 select-active"
                    name="availability"
                    defaultValue={filters.availability}
                  >
                    <option value={ANY_AVAILABILITY}>Any availability</option>
                    <option value="available">Available now</option>
                    <option value="unavailable">Not available</option>
                  </select>

                  {filters.location ? (
                    <input
                      type="hidden"
                      name="location"
                      value={filters.location}
                    />
                  ) : null}
                  {filters.minExp !== null ? (
                    <input type="hidden" name="minExp" value={filters.minExp} />
                  ) : null}
                  {filters.maxExp !== null ? (
                    <input type="hidden" name="maxExp" value={filters.maxExp} />
                  ) : null}
                  {filters.itiOnly ? (
                    <input type="hidden" name="iti" value="1" />
                  ) : null}
                  {filters.passportOnly ? (
                    <input type="hidden" name="passport" value="1" />
                  ) : null}
                  {filters.offshoreOnly ? (
                    <input type="hidden" name="offshore" value="1" />
                  ) : null}
                  {filters.unlockedOnly ? (
                    <input type="hidden" name="unlocked" value="1" />
                  ) : null}
                  <input type="hidden" name="sort" value={filters.sort} />

                  <button
                    className="btn btn-default btn-find font-sm"
                    type="submit"
                  >
                    Search
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
                        <strong>{filteredCandidates.length}</strong> of{" "}
                        {cvCandidates.length} candidates found
                      </span>
                      <p className="font-xs color-text-paragraph-2 mt-5 mb-0">
                        Keyword match uses role, skills, certifications, and
                        location relevance.
                      </p>
                    </div>
                    <div className="col-xl-5 col-lg-5 text-lg-end mt-sm-15">
                      <div className="display-flex2">
                        <div className="box-border mr-10">
                          <span className="text-sortby">Credits:</span>
                          <strong className="color-brand-1">
                            {EMPLOYER_CREDITS}
                          </strong>
                        </div>
                        <span className="btn btn-grey-small mr-5">A = 1cr</span>
                        <span className="btn btn-grey-small mr-5">B = 2cr</span>
                        <span className="btn btn-grey-small">C = 3cr</span>
                      </div>
                    </div>
                  </div>

                  {activeFilterTags.length > 0 ? (
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
                  ) : null}
                </div>

                <div className="row display-list">
                  {filteredCandidates.length === 0 ? (
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

                  {filteredCandidates.map((candidate) => (
                    <div className="col-xl-12 col-12" key={candidate.id}>
                      <div
                        className="card-grid-2 hover-up"
                        style={
                          candidate.isUnlocked
                            ? { borderColor: "#ffc151", background: "#ffffff" }
                            : undefined
                        }
                      >
                        <div className="row">
                          <div className="col-lg-7 col-md-7 col-sm-12">
                            <div className="card-grid-2-image-left">
                              <div className="image-box">
                                <img
                                  src="/assets/imgs/page/candidates/candidate-profile.png"
                                  alt={candidate.name}
                                />
                              </div>
                              <div className="right-info">
                                <Link
                                  className="name-job"
                                  href="/employeer/candidate-profile"
                                >
                                  {candidate.name} - {candidate.trade}
                                </Link>

                                <span className="location-small d-block">
                                  {formatExperience(candidate)} -{" "}
                                  {formatLocation(candidate)}
                                </span>

                                {candidate.availability === "available" && (
                                  <span className="available-now-text">
                                    Available now
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-5 text-start text-md-end pr-60 col-md-5 col-sm-12">
                            <div className="pl-15 mb-15 mt-30">
                              {[
                               
                                candidate.itiCertified && "ITI",
                                candidate.passportValid && "Passport",
                                candidate.offshoreExperience && "Offshore",
                              ]
                                .filter(Boolean)
                                .map((tag, index) => (
                                  <span
                                    key={index}
                                    className="btn btn-grey-small mr-5"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                            {/* {candidate.availability === "available" ? (
                              <p
                                className="font-sm fw-600 color-brand-1 mt-5"
                                title="Candidate is ready to join immediately"
                              >
                                Available now
                              </p>
                            ) : null} */}
                          </div>
                        </div>

                        <div className="card-block-info">
                          <h4>
                            <Link href="/employeer/candidate-profile">
                              {candidate.trade} Candidate Profile
                            </Link>
                          </h4>

                          <div className="mt-5">
                            <span className="card-briefcase">
                              {formatExperience(candidate)}
                            </span>
                            <span className="card-time">
                              <span>{formatLocation(candidate)}</span>
                            </span>
                          </div>

                          <p className="font-sm color-text-paragraph mt-10 mb-5">
                            <i className="fi-rr-star mr-5" />
                            Primary skill: {candidate.primarySkill}
                          </p>
                          <p className="font-xs color-text-paragraph-2 mb-10">
                            <i className="fi-rs-star mr-5" />
                            Secondary skills:{" "}
                            {candidate.secondarySkills.join(", ")}
                          </p>

                          {candidate.matchedKeywords.length > 0 ? (
                            <div className="mb-10">
                              {candidate.matchedKeywords.map((keyword) => (
                                <span
                                  key={`${candidate.id}-${keyword}`}
                                  className="badge bg-light text-dark mr-5 mb-5"
                                >
                                  <i className="fi-rr-search mr-5" />
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          <div className="card-2-bottom mt-20">
                            <div className="row align-items-center">
                              <div className="col-lg-7 col-7">
                                <span className="card-text-price">
                                  Keyword match: {candidate.matchScore}%
                                </span>
                                <span className="font-xs color-text-mutted ml-10">
                                  {candidate.band} - {candidate.credits} cr
                                </span>
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
                                  <button
                                    className="btn btn-border"
                                    type="button"
                                    style={CANDIDATE_ACTION_BUTTON_STYLE}
                                  >
                                    Download CV
                                  </button>
                                  {candidate.canUnlock ? (
                                    <Link
                                      className="btn btn-apply-now"
                                      href="/employeer/candidate-profile"
                                      style={{
                                        ...CANDIDATE_ACTION_BUTTON_STYLE,
                                        color: "#ffffff",
                                      }}
                                    >
                                      {candidate.unlockText}
                                    </Link>
                                  ) : (
                                    <button
                                      className="btn btn-grey-small"
                                      type="button"
                                      style={CANDIDATE_ACTION_BUTTON_STYLE}
                                    >
                                      {candidate.unlockText}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-12 col-sm-12 col-12">
              <div className="sidebar-shadow none-shadow mb-30">
                <div className="sidebar-filters">
                  <form method="get">
                    <div className="filter-block head-border mb-30">
                      <h5>
                        Search Filters{" "}
                        <Link
                          className="link-reset"
                          href="/employeer/cv-search"
                        >
                          Reset
                        </Link>
                      </h5>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Keyword</label>
                        <input
                          className="form-control form-icons"
                          type="text"
                          name="q"
                          defaultValue={filters.keyword}
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
                          name="trade"
                          defaultValue={filters.trade}
                        >
                          <option value={ANY_TRADE}>Any trade</option>
                          {tradeOptions.map((tradeOption) => (
                            <option key={tradeOption} value={tradeOption}>
                              {tradeOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <label className="mb-5">Experience (years)</label>
                      <div className="row">
                        <div className="col-6 pr-5">
                          <input
                            className="form-control"
                            type="number"
                            name="minExp"
                            min="0"
                            max="40"
                            defaultValue={filters.minExp ?? ""}
                            placeholder="Min"
                          />
                        </div>
                        <div className="col-6 pl-5">
                          <input
                            className="form-control"
                            type="number"
                            name="maxExp"
                            min="0"
                            max="40"
                            defaultValue={filters.maxExp ?? ""}
                            placeholder="Max"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Location</label>
                        <input
                          className="form-control form-icons"
                          type="text"
                          name="location"
                          defaultValue={filters.location}
                          placeholder="City or state"
                        />
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <label className="mb-5">Availability</label>
                        <select
                          className="form-control form-icons select-active"
                          name="availability"
                          defaultValue={filters.availability}
                        >
                          <option value={ANY_AVAILABILITY}>Any</option>
                          <option value="available">Available now</option>
                          <option value="unavailable">Not available</option>
                        </select>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <div className="form-group">
                        <ul className="list-checkbox">
                          <li>
                            <label className="cb-container">
                              <input
                                type="checkbox"
                                name="iti"
                                value="1"
                                defaultChecked={filters.itiOnly}
                              />
                              <span className="text-small">
                                ITI certified only
                              </span>
                              <span className="checkmark"></span>
                            </label>
                          </li>
                          <li>
                            <label className="cb-container">
                              <input
                                type="checkbox"
                                name="passport"
                                value="1"
                                defaultChecked={filters.passportOnly}
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
                                value="1"
                                defaultChecked={filters.offshoreOnly}
                              />
                              <span className="text-small">
                                Offshore experience
                              </span>
                              <span className="checkmark"></span>
                            </label>
                          </li>
                          <li>
                            <label className="cb-container">
                              <input
                                type="checkbox"
                                name="unlocked"
                                value="1"
                                defaultChecked={filters.unlockedOnly}
                              />
                              <span className="text-small">
                                Unlocked profiles only
                              </span>
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
                          defaultValue={filters.sort}
                        >
                          <option value="match">Keyword match score</option>
                          <option value="newest">Newest profile update</option>
                          <option value="experience">
                            Experience high to low
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="filter-block mb-20">
                      <button
                        className="btn btn-default w-100 mb-10"
                        type="submit"
                      >
                        Search
                      </button>
                      <Link
                        className="btn btn-border w-100"
                        href="/employeer/cv-search"
                      >
                        Clear filters
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerCvSearchPage;
