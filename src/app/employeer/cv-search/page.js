"use client";
import { resolveFileUrl } from "@/utils/fileUrl";
import Link from "next/link";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  searchCandidates,
  getCvSearchDashboard,
  getFilterOptions,
} from "@/services/recruiter/recruiterCvSearchService";
import candidateProfileService from "@/services/recruiter/Candidateprofileservice";
import { getRecruiterJobs } from "@/services/recruiter/recruiterJobListService";
import { getProfileCompletion } from "@/services/candidate/profileCompletionService"; 
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

const isCandidateAvailable = (c) => {
  if (!c) return false;
  const status = String(c.availabilityStatus || c.availability || "").toLowerCase().trim();
  if (
    status === "available" ||
    status === "available now" ||
    status === "availablenow" ||
    status === "open_to_opportunities" ||
    status === "opentoopportunities" ||
    status === "open to opportunities"
  ) {
    return true;
  }
  if (
    status === "not available" ||
    status === "notavailable" ||
    status === "not_available" ||
    status === "unavailable" ||
    status === "not_looking"
  ) {
    return false;
  }
  if (c.isAvailableForWork !== undefined && c.isAvailableForWork !== null) {
    return Boolean(c.isAvailableForWork);
  }
  if (c.availableForWork !== undefined && c.availableForWork !== null) {
    return Boolean(c.availableForWork);
  }
  if (c.isAvailable !== undefined && c.isAvailable !== null) {
    return Boolean(c.isAvailable);
  }
  return status === "true" || status === "1" || status === "yes";
};

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
  borderRadius:"8px",
  fontSize:"14px",
  fontWeight:"600"
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

/* ───────────────────────── Search UI building blocks ───────────────────────── */


/* ── Natural-language query parser (frontend only) ─────────────────────────
   "experienced plumber in pune" ->
     { keywords: ["plumber"], location: "Pune", minExperience: 3 }
   Pulls out a location ("in/at/near/from <place>"), an experience level
   ("experienced", "5 years", "fresher") and availability, and leaves the
   remaining words as keyword chips. */
const NL_STOPWORDS = new Set([
  "a","an","the","with","and","for","of","who","is","are","need","needed",
  "looking","want","wanted","require","required","hire","find","show","me",
  "candidate","candidates","worker","workers","person","people","profile",
  "profiles","cv","cvs","experience","experienced","years","year","yrs","yr",
  "senior","expert","skilled","fresher","freshers","entry","level","available",
  "immediately","now","good","best","top",
]);
const NL_LOCATION_RE = /\b(?:in|at|near|nearby|around|from|based in)\s+([a-z][a-z .'-]*?)(?=\s+(?:with|having|and|who|for|of)\b|$)/i;

const toTitleCase = (text) =>
  text.replace(/\b([a-z])/g, (m) => m.toUpperCase());

const parseNaturalQuery = (raw, knownLocations = []) => {
  const text = String(raw || "").trim();
  const result = { keywords: [], location: "", experience: null, availability: "" };
  if (!text) return result;

  let rest = ` ${text.toLowerCase()} `;

  // Location
  const locMatch = rest.trim().match(NL_LOCATION_RE);
  if (locMatch) {
    const place = locMatch[1].trim();
    const known = knownLocations.find(
      (l) => l.trim().toLowerCase() === place,
    );
    result.location = known ?? toTitleCase(place);
    rest = rest.replace(locMatch[0], " ");
  }

  // Experience
  const yearsMatch = rest.match(/(\d+)\s*\+?\s*(?:years?|yrs?)\b(?:\s*(?:of)?\s*exp\w*)?/);
  if (yearsMatch) {
    result.experience = { min: Number(yearsMatch[1]), max: "" };
    rest = rest.replace(yearsMatch[0], " ");
  } else if (/\b(fresher|freshers|entry level|entry-level|beginner)\b/.test(rest)) {
    result.experience = { min: 0, max: 1 };
  } else if (/\b(experienced|senior|expert|skilled)\b/.test(rest)) {
    result.experience = { min: 3, max: "" };
  }

  // Availability
  if (/\bavailable\b/.test(rest)) result.availability = "Available";

  // Remaining words -> keywords
  const words = rest
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !NL_STOPWORDS.has(w) && !/^(in|at|near|from)$/.test(w));
  if (words.length) result.keywords.push(words.join(" "));

  return result;
};

const experienceLabel = (exp) =>
  exp.max === "" ? `${exp.min}+ years` : `${exp.min} - ${exp.max} years`;

const MAX_KEYWORDS = 10;

const KEYWORD_SUGGESTIONS = [
  "welder",
  "electrician",
  "driver",
  "pipeline",
  "iti certified",
  "passport valid",
  "mumbai",
];

const SORT_OPTIONS = [
  { value: "KeywordMatch", label: "Best match" },
  { value: "Newest", label: "Newest profiles" },
  { value: "Experience", label: "Most experienced" },
];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "Any availability" },
  { value: "Available", label: "Available now" },
  { value: "Not Available", label: "Not available" },
];

const CREDENTIAL_TOGGLES = [
  { key: "itiCertifiedOnly", label: "ITI certified" },
  { key: "passportValidOnly", label: "Valid passport" },
  { key: "kycVerifiedOnly", label: "KYC verified" },
  { key: "unlockedProfilesOnly", label: "Unlocked profiles" },
];

// "welder, Pune ,iti certified" -> ["welder", "Pune", "iti certified"]
const splitKeywords = (value) =>
  String(value || "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

// Adds the comma-separated terms in `raw` to `current`, skipping duplicates
// (case-insensitive) and respecting the keyword limit.
const mergeKeywords = (current, raw) => {
  const seen = new Set(current.map((term) => term.toLowerCase()));
  const next = [...current];

  splitKeywords(raw).forEach((term) => {
    const key = term.toLowerCase();
    if (!seen.has(key) && next.length < MAX_KEYWORDS) {
      seen.add(key);
      next.push(term);
    }
  });

  return next;
};

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const IconBriefcase = () => (
  <svg {...iconProps}>
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M3 13h18" />
  </svg>
);

const IconSpark = () => (
  <svg {...iconProps}>
    <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
    <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
  </svg>
);

const IconSearch = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4-4" />
  </svg>
);

const IconChevron = () => (
  <svg {...iconProps} width={16} height={16} strokeWidth={2}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const IconCheck = () => (
  <svg {...iconProps} width={16} height={16} strokeWidth={2.2}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const IconClose = () => (
  <svg {...iconProps} width={12} height={12} strokeWidth={2.4}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/* Themed replacement for the native <select>. Keyboard accessible:
   Arrow keys / Home / End to move, Enter or Space to pick, Esc to close. */
const FilterSelect = ({
  value,
  onChange,
  options,
  ariaLabel,
  icon = null,
  variant = "field", // "bar" (borderless, inside the hero bar) | "field" (bordered)
  align = "left",
}) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selectedIndex = options.findIndex(
    (option) => String(option.value) === String(value ?? ""),
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : options[0];
  const isPlaceholder = !selected || selected.value === "";

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) {
      listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
    }
  }, [active, open]);

  const openMenu = () => {
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (option) => {
    setOpen(false);
    if (option && String(option.value) !== String(value ?? "")) {
      onChange(option.value);
    }
  };

  const handleKeyDown = (event) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(options[active]);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
    }
  };

  return (
    <div
      ref={rootRef}
      className={`cvs-select cvs-select--${variant}${open ? " is-open" : ""}${
        isPlaceholder ? " is-placeholder" : ""
      }`}
    >
      <button
        type="button"
        className="cvs-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        {icon ? <span className="cvs-select-icon">{icon}</span> : null}
        <span className="cvs-select-label">{selected?.label ?? ""}</span>
        <span className="cvs-select-chevron">
          <IconChevron />
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          className={`cvs-menu${align === "right" ? " cvs-menu--right" : ""}`}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.length === 0 ? (
            <li className="cvs-option cvs-option-muted">No options</li>
          ) : (
            options.map((option, index) => {
              const isSelected = index === selectedIndex;
              return (
                <li
                  key={`${option.value}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`cvs-option${index === active ? " is-active" : ""}${
                    isSelected ? " is-selected" : ""
                  }${option.value === "" ? " cvs-option-muted" : ""}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <span className="cvs-check">
                      <IconCheck />
                    </span>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

/* Multi-keyword input: each term becomes a removable chip.
   Enter or comma adds a term; Backspace on an empty box removes the last
   one; Enter on an empty box runs the search. */
const KeywordInput = ({
  terms,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  onSubmit,
  suggestions,
}) => {
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const query = draft.trim().toLowerCase();
  const taken = new Set(terms.map((term) => term.toLowerCase()));
  const visible = focused
    ? suggestions
        .filter(
          (item) =>
            !taken.has(item.toLowerCase()) &&
            (!query || item.toLowerCase().includes(query)),
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setFocused(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => setActive(-1), [draft]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" && visible.length) {
      event.preventDefault();
      setActive((i) => (i + 1) % visible.length);
    } else if (event.key === "ArrowUp" && visible.length) {
      event.preventDefault();
      setActive((i) => (i <= 0 ? visible.length - 1 : i - 1));
    } else if (event.key === "Escape") {
      setFocused(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && visible[active]) onAdd(visible[active]);
      else if (draft.trim()) onAdd(draft);
      else onSubmit();
    } else if (event.key === "," && draft.trim()) {
      event.preventDefault();
      onAdd(draft);
    } else if (event.key === "Backspace" && !draft && terms.length) {
      onRemove(terms.length - 1);
    }
  };

  const handlePaste = (event) => {
    const text = event.clipboardData.getData("text");
    if (/[,\n]/.test(text)) {
      event.preventDefault();
      onAdd(text.replace(/\n/g, ","));
    }
  };

  const handleChange = (event) => {
    const next = event.target.value;
    setFocused(true);
    if (next.includes(",")) onAdd(next);
    else onDraftChange(next);
  };

  const placeholder = terms.length
    ? terms.length >= MAX_KEYWORDS
      ? "Keyword limit reached"
      : "Add another keyword"
    : "Trade, skill, name or location";

  return (
    <div className="cvs-keyword" ref={rootRef}>
      <div
        className="cvs-keyword-field"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="cvs-keyword-icon">
          <IconSearch />
        </span>

        {terms.map((term, index) => (
          <span className="cvs-chip" key={term.toLowerCase()}>
            {term}
            <button
              type="button"
              aria-label={`Remove ${term}`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(index);
              }}
            >
              <IconClose />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          className="cvs-keyword-input"
          type="text"
          role="combobox"
          aria-label="Search keywords"
          aria-expanded={visible.length > 0}
          autoComplete="off"
          value={draft}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
        />
      </div>

      {visible.length > 0 && (
        <ul className="cvs-suggest" role="listbox" aria-label="Suggestions">
          {visible.map((item, index) => (
            <li
              key={item}
              role="option"
              aria-selected={index === active}
              className={index === active ? "is-active" : ""}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => {
                onAdd(item);
                inputRef.current?.focus();
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EmployerCvSearchPage = () => {
  const [cvCandidates, setCvCandidates] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFirstMount = useRef(true);
  const [jobs, setJobs] = useState([]);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [skillPool, setSkillPool] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "", // comma-separated terms, e.g. "welder,pune"
    keywordMatch: "any", // "any" | "all"
    tradeCategory: "",
    minExperience: "",
    maxExperience: "",
    experienceRange: "",
    location: "",
    availabilityStatus: "",
    itiCertifiedOnly: false,
    kycVerifiedOnly: false,
    skill: "",
    passportValidOnly: false,
    unlockedProfilesOnly: false,
    sortBy: "KeywordMatch",
    pageNumber: 1,
    pageSize: 10,
    jobId: "",
  });

  const totalPages = Math.max(1, Math.ceil(totalCandidates / (filters.pageSize || 10)));

  const resetFilters = () => {
    const defaultFilters = {
      keyword: "",
      keywordMatch: "any",
      tradeCategory: "",
      minExperience: "",
      maxExperience: "",
      experienceRange: "",
      location: "",
      availabilityStatus: "",
      itiCertifiedOnly: false,
      kycVerifiedOnly: false,
      skill: "",
    kycVerifiedOnly: false,
    skill: "",
      passportValidOnly: false,
      unlockedProfilesOnly: false,
      sortBy: "KeywordMatch",
      pageNumber: 1,
      pageSize: 10,
      jobId: "",
    };

    setKeywordDraft("");
    setFilters(defaultFilters);
    loadCandidates(defaultFilters);
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

      const activeFilters = overrideFilters ?? filters;
      const response = await searchCandidates(activeFilters);

      let candidateList = response?.candidates ?? [];
      let totalCount = response?.totalCandidates ?? candidateList.length;

      if (activeFilters.availabilityStatus) {
        const val = String(activeFilters.availabilityStatus).toLowerCase().trim();
        const wantAvailable =
          val === "available" ||
          val === "available now" ||
          val === "opentoopportunities" ||
          val === "open_to_opportunities";

        candidateList = candidateList.filter((c) => isCandidateAvailable(c) === wantAvailable);
        totalCount = candidateList.length;
      }

      // Remember every skill seen so the Skill filter keeps its options
      // even after the list has been narrowed down.
      setSkillPool((prev) => {
        const seen = new Map(prev.map((x) => [x.toLowerCase(), x]));
        candidateList.forEach((c) =>
          (c.skills ?? []).forEach((sk) => {
            const k = String(sk || "").trim();
            if (k && !seen.has(k.toLowerCase())) seen.set(k.toLowerCase(), k);
          }),
        );
        return [...seen.values()].sort((a, b) => a.localeCompare(b));
      });

      // Frontend-only filters
      if (activeFilters.skill) {
        const want = activeFilters.skill.toLowerCase();
        candidateList = candidateList.filter((c) =>
          (c.skills ?? []).some((sk) => String(sk).toLowerCase() === want),
        );
        totalCount = candidateList.length;
      }
      if (activeFilters.kycVerifiedOnly) {
        candidateList = candidateList.filter((c) => c.isKycVerified);
        totalCount = candidateList.length;
      }

      setCvCandidates(candidateList);
      setTotalCandidates(totalCount);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Turns typed text (e.g. "experienced plumber in pune") into updated
  // filters: location / experience / availability go to their filters,
  // everything else becomes keyword chips.
  const buildFiltersFromInput = (base, raw) => {
    const known = getUniqueLocations(filterOptions?.locations, cvCandidates);
    const next = { ...base, pageNumber: 1 };
    let keywords = splitKeywords(base.keyword);

    splitKeywords(raw.includes(",") ? raw : raw.replace(/,/g, "")).forEach((part) => {
      const parsed = parseNaturalQuery(part, known);
      keywords = mergeKeywords(keywords, parsed.keywords.join(","));
      if (parsed.location) next.location = parsed.location;
      if (parsed.availability) next.availabilityStatus = parsed.availability;
      if (parsed.experience) {
        next.experienceRange = experienceLabel(parsed.experience);
        next.minExperience = parsed.experience.min;
        next.maxExperience = parsed.experience.max;
      }
    });

    next.keyword = keywords.join(",");
    return next;
  };

  /* Run a brand-new search (filters changed) — always reset to page 1
     so the results the employer sees always start from the top. */
  const handleSearch = () => {
    // Anything typed but not yet turned into a chip is included too.
    const next = buildFiltersFromInput(filters, keywordDraft);
    setKeywordDraft("");
    setFilters(next);
    loadCandidates(next);
  };

  /* Jump to a specific page of the current search, keeping filters as-is. */
  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === filters.pageNumber) return;
    const next = { ...filters, pageNumber: page };
    setFilters(next);
    loadCandidates(next);
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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
    loadCandidates(next);
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

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filters.pageNumber, loading]);

  const updateFilterAndSearch = (partial) => {
    const next = { ...filters, ...partial, pageNumber: 1 };
    setFilters(next);
    loadCandidates(next);
  };

  const keywordTerms = splitKeywords(filters.keyword);

  const addKeywords = (raw) => {
    const next = buildFiltersFromInput(filters, raw);
    setKeywordDraft("");
    if (JSON.stringify(next) !== JSON.stringify({ ...filters, pageNumber: 1 })) {
      setFilters(next);
      loadCandidates(next);
    }
  };

  const removeKeyword = (index) => {
    updateFilterAndSearch({
      keyword: keywordTerms.filter((_, i) => i !== index).join(","),
    });
  };

  const keywordSuggestions = useMemo(() => {
    const pool = [
      ...KEYWORD_SUGGESTIONS,
      ...(filterOptions?.tradeCategories ?? []),
      ...(filterOptions?.locations ?? []),
    ].filter((item) => typeof item === "string" && item.trim());
    const seen = new Set();
    return pool.filter((item) => {
      const key = item.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filterOptions]);

  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.tradeCategory ||
      filters.jobId ||
      filters.experienceRange ||
      filters.location ||
      filters.availabilityStatus ||
      filters.skill ||
      filters.kycVerifiedOnly ||
      filters.itiCertifiedOnly ||
      filters.passportValidOnly ||
      filters.unlockedProfilesOnly,
  );

  const tradeOptions = [
    { value: "", label: "Any trade" },
    ...(filterOptions?.tradeCategories ?? []).map((t) => ({ value: t, label: t })),
  ];

  const jobOptions = [
    { value: "", label: "AI match: select job" },
    ...jobs.map((job) => ({ value: job.jobId, label: job.jobTitle })),
  ];

  const experienceOptions = [
    { value: "", label: "Any experience" },
    ...EXPERIENCE_RANGES.map((r) => ({ value: r.label, label: r.label })),
    ...(filters.experienceRange &&
    !EXPERIENCE_RANGES.some((r) => r.label === filters.experienceRange)
      ? [{ value: filters.experienceRange, label: filters.experienceRange }]
      : []),
  ];

  const skillOptions = [
    { value: "", label: "Any skill" },
    ...[...skillPool, ...(filters.skill && !skillPool.includes(filters.skill) ? [filters.skill] : [])].map((sk) => ({
      value: sk,
      label: sk,
    })),
  ];

  const locationOptions = [
    { value: "", label: "Any location" },
    ...getUniqueLocations(filterOptions?.locations, cvCandidates).map((loc) => ({
      value: loc,
      label: loc,
    })),
  ];

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
                  className="cvs-bar"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                >
                  <div className="cvs-bar-cell cvs-bar-trade">
                    <FilterSelect
                      variant="bar"
                      ariaLabel="Trade"
                      icon={<IconBriefcase />}
                      value={filters.tradeCategory}
                      options={tradeOptions}
                      onChange={(value) =>
                        updateFilterAndSearch({ tradeCategory: value })
                      }
                    />
                  </div>

                  <div className="cvs-bar-cell cvs-bar-ai">
                    <FilterSelect
                      variant="bar"
                      ariaLabel="AI match job"
                      icon={<IconSpark />}
                      value={filters.jobId}
                      options={jobOptions}
                      onChange={handleJobChange}
                    />
                  </div>

                  <div className="cvs-bar-cell cvs-bar-keyword">
                    <KeywordInput
                      terms={keywordTerms}
                      draft={keywordDraft}
                      onDraftChange={setKeywordDraft}
                      onAdd={addKeywords}
                      onRemove={removeKeyword}
                      onSubmit={handleSearch}
                      suggestions={keywordSuggestions}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-default cvs-search-btn"
                  >
                    Search
                  </button>

                  <button
                    type="button"
                    className="cvs-reset-btn"
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                </form>

                {keywordTerms.length >= 2 ? (
                <div className="cvs-hint">
                    <>
                      <span>Show candidates matching</span>
                      <span
                        className="cvs-seg"
                        role="group"
                        aria-label="Keyword match mode"
                      >
                        <button
                          type="button"
                          aria-pressed={filters.keywordMatch !== "all"}
                          onClick={() =>
                            updateFilterAndSearch({ keywordMatch: "any" })
                          }
                        >
                          any
                        </button>
                        <button
                          type="button"
                          aria-pressed={filters.keywordMatch === "all"}
                          onClick={() =>
                            updateFilterAndSearch({ keywordMatch: "all" })
                          }
                        >
                          all
                        </button>
                      </span>
                      <span>of these keywords</span>
                    </>
                </div>
                ) : null}
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
                    <div className="col-xl-5 col-lg-5 text-lg-end mt-sm-15">
                      <div className="cvs-sort">
                        <FilterSelect
                          variant="field"
                          align="right"
                          ariaLabel="Sort candidates"
                          value={filters.sortBy}
                          options={SORT_OPTIONS}
                          onChange={(value) =>
                            updateFilterAndSearch({ sortBy: value })
                          }
                        />
                      </div>
                    </div>

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
                                      resolveFileUrl(candidate.profilePhotoUrl) ||
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
                                    {isCandidateAvailable(candidate) ? (
                                      <span className="available-now-text" style={{ margin: 0 }}>
                                        Available now
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          padding: "3px 10px",
                                          borderRadius: "999px",
                                          background: "#FFFBEB",
                                          border: "1px solid rgba(245,158,11,0.3)",
                                          color: "#D97706",
                                          fontSize: "11px",
                                          fontWeight: 600,
                                          margin: 0,
                                        }}
                                      >
                                        Not available
                                        {candidate.availableIn
                                          ? ` · Available in ${candidate.availableIn}`
                                          : ""}
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
                                        {candidate.unlockCredits > 0
                                          ? `Unlock (${candidate.unlockCredits} Credits)`
                                          : "Unlock"}
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
              <aside className="cvs-side" aria-label="Filters">
                <div className="cvs-side-head">
                  <h5>Filters</h5>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      className="cvs-link-btn"
                      onClick={resetFilters}
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>

                <div className="cvs-field">
                  <span className="cvs-field-label">Trade</span>
                  <FilterSelect
                    ariaLabel="Trade filter"
                    value={filters.tradeCategory}
                    options={tradeOptions}
                    onChange={(value) =>
                      updateFilterAndSearch({ tradeCategory: value })
                    }
                  />
                </div>

                <div className="cvs-field">
                  <span className="cvs-field-label">Skill</span>
                  <FilterSelect
                    ariaLabel="Skill"
                    value={filters.skill}
                    options={skillOptions}
                    onChange={(value) => updateFilterAndSearch({ skill: value })}
                  />
                </div>

                <div className="cvs-field">
                  <span className="cvs-field-label">Experience</span>
                  <FilterSelect
                    ariaLabel="Experience"
                    value={filters.experienceRange}
                    options={experienceOptions}
                    onChange={(value) => {
                      const range = EXPERIENCE_RANGES.find((r) => r.label === value);
                      updateFilterAndSearch({
                        experienceRange: value,
                        minExperience: range ? range.min : "",
                        maxExperience: range ? range.max : "",
                      });
                    }}
                  />
                </div>

                <div className="cvs-field">
                  <span className="cvs-field-label">Location</span>
                  <FilterSelect
                    ariaLabel="Location"
                    value={filters.location}
                    options={locationOptions}
                    onChange={(value) => updateFilterAndSearch({ location: value })}
                  />
                </div>

                <div className="cvs-field">
                  <span className="cvs-field-label">Availability</span>
                  <FilterSelect
                    ariaLabel="Availability"
                    value={filters.availabilityStatus}
                    options={AVAILABILITY_OPTIONS}
                    onChange={(value) =>
                      updateFilterAndSearch({ availabilityStatus: value })
                    }
                  />
                </div>

                <div className="cvs-field">
                  <span className="cvs-field-label">Credentials</span>
                  <div className="cvs-toggles">
                    {CREDENTIAL_TOGGLES.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        className="cvs-toggle"
                        aria-pressed={Boolean(filters[key])}
                        onClick={() => updateFilterAndSearch({ [key]: !filters[key] })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        /* ── Hero search bar ───────────────────────────── */
        .cvs-bar {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .cvs-bar-cell {
          position: relative;
          display: flex;
          align-items: center;
        }
        .cvs-bar-trade { flex: 0 0 172px; }
        .cvs-bar-ai { flex: 0 0 224px; }
        .cvs-bar-keyword { flex: 1 1 auto; min-width: 0; }
        .cvs-bar-trade::after,
        .cvs-bar-ai::after {
          content: "";
          position: absolute;
          right: 0;
          top: 50%;
          height: 22px;
          width: 1px;
          background: #ffd98a;
          transform: translateY(-50%);
        }
        .cvs-bar .cvs-search-btn {
          flex-shrink: 0;
          height: 50px;
          min-width: 116px;
          margin-left: 8px;
          padding: 0 24px;
          border-radius: 10px;
          white-space: nowrap;
        }
        .cvs-reset-btn {
          flex-shrink: 0;
          height: 50px;
          padding: 0 16px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #6b7683;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.15s ease;
        }
        .cvs-reset-btn:hover { color: #122359; }

        .cvs-hint {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          min-height: 28px;
          padding: 8px 14px 2px;
          font-size: 12.5px;
          color: #6b7683;
        }
        .cvs-seg {
          display: inline-flex;
          padding: 2px;
          border-radius: 999px;
          background: #f3f4f8;
        }
        .cvs-seg button {
          border: 0;
          background: transparent;
          padding: 2px 12px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 600;
          color: #6b7683;
          cursor: pointer;
        }
        .cvs-seg button[aria-pressed="true"] {
          background: #ffe9b8;
          color: #122359;
        }

        /* ── Themed dropdown ───────────────────────────── */
        .cvs-select { position: relative; width: 100%; }
        .cvs-select-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          text-align: left;
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          color: #122359;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .cvs-select--bar .cvs-select-trigger {
          height: 50px;
          padding: 0 14px;
          border-radius: 10px;
        }
        .cvs-select--bar .cvs-select-trigger:hover,
        .cvs-select--bar.is-open .cvs-select-trigger { background: #fff8ea; }
        .cvs-select--field .cvs-select-trigger {
          height: 44px;
          padding: 0 12px;
          border-radius: 10px;
          border-color: #e6e9f0;
          background: #fff;
        }
        .cvs-select--field .cvs-select-trigger:hover { border-color: #ffc151; }
        .cvs-select.is-open .cvs-select-trigger,
        .cvs-select-trigger:focus-visible {
          border-color: #ffa300;
          box-shadow: 0 0 0 3px rgba(255, 163, 0, 0.15);
          outline: none;
        }
        .cvs-select-icon { display: inline-flex; color: #ffa300; flex-shrink: 0; }
        .cvs-select-label {
          flex: 1 1 auto;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cvs-select.is-placeholder .cvs-select-label { color: #6b7683; }
        .cvs-select-chevron {
          display: inline-flex;
          color: #94a3b8;
          flex-shrink: 0;
          transition: transform 0.18s ease;
        }
        .cvs-select.is-open .cvs-select-chevron { transform: rotate(180deg); }

        .cvs-menu,
        .cvs-suggest {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 60;
          margin: 0;
          padding: 6px;
          list-style: none;
          background: #fff;
          border: 1px solid #f1e6cc;
          border-radius: 12px;
          box-shadow: 0 18px 40px rgba(18, 35, 89, 0.14);
          animation: cvs-pop 0.14s ease-out;
        }
        .cvs-menu {
          min-width: 100%;
          width: max-content;
          max-width: 320px;
          max-height: 272px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #ffd98a transparent;
        }
        .cvs-menu--right { left: auto; right: 0; }
        .cvs-suggest { right: 0; }
        @keyframes cvs-pop {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: none; }
        }
        .cvs-option,
        .cvs-suggest li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.35;
          color: #122359;
          cursor: pointer;
        }
        .cvs-option.is-active,
        .cvs-suggest li.is-active { background: #fff6e0; }
        .cvs-option.is-selected { font-weight: 600; }
        .cvs-option-muted { color: #6b7683; }
        .cvs-option.is-selected .cvs-check { display: inline-flex; color: #ffa300; }

        /* ── Keyword chips ─────────────────────────────── */
        .cvs-keyword { position: relative; width: 100%; }
        .cvs-keyword-field {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          min-height: 50px;
          padding: 7px 12px;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: text;
          transition: background 0.15s ease, border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .cvs-keyword-field:hover { background: #fff8ea; }
        .cvs-keyword-field:focus-within {
          background: #fff;
          border-color: #ffa300;
          box-shadow: 0 0 0 3px rgba(255, 163, 0, 0.15);
        }
        .cvs-keyword-icon { display: inline-flex; color: #94a3b8; }
        .cvs-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 28px;
          padding: 0 5px 0 11px;
          border-radius: 999px;
          background: #fff3d6;
          border: 1px solid #ffe0a3;
          color: #122359;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .cvs-chip button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #7a5a14;
          cursor: pointer;
        }
        .cvs-chip button:hover { background: #ffe0a3; color: #122359; }
        .cvs-chip button:focus-visible {
          outline: 2px solid #ffa300;
          outline-offset: 1px;
        }
        .form-find .cvs-keyword-input {
          flex: 1 1 140px;
          width: auto;
          min-width: 140px;
          height: 30px;
          padding: 0 !important;
          border: 0 !important;
          outline: none !important;
          box-shadow: none !important;
          background: transparent !important;
          font-size: 14px;
          color: #122359;
        }
        .form-find .cvs-keyword-input:focus {
          border: 0 !important;
          box-shadow: none !important;
        }
        .cvs-keyword-input::placeholder { color: #6b7683; opacity: 1; }

        /* ── Sidebar ───────────────────────────────────── */
        .cvs-side { padding: 2px 0 0; }
        .cvs-side-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          margin-bottom: 20px;
          border-bottom: 1px solid #ffe3a8;
        }
        .cvs-side-head h5 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #122359;
        }
        .cvs-link-btn {
          padding: 0;
          border: 0;
          background: none;
          font-size: 13px;
          font-weight: 600;
          color: #6b7683;
          cursor: pointer;
        }
        .cvs-link-btn:hover { color: #122359; text-decoration: underline; }
        .cvs-field { margin-bottom: 18px; }
        .cvs-field-label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #4f5e64;
        }
        .cvs-toggles { display: flex; flex-wrap: wrap; gap: 8px; }
        .cvs-toggle {
          height: 34px;
          padding: 0 14px;
          border: 1px solid #e6e9f0;
          border-radius: 999px;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #4f5e64;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .cvs-toggle:hover { border-color: #ffc151; }
        .cvs-toggle[aria-pressed="true"] {
          background: #fff0cc;
          border-color: #ffa300;
          color: #122359;
        }
        .cvs-toggle:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 163, 0, 0.2);
        }

        /* ── Results header sort ───────────────────────── */
        .cvs-sort { display: inline-block; width: 100%; max-width: 200px; text-align: left; }
        .cvs-sort .cvs-select--field .cvs-select-trigger { height: 40px; }

        @media (max-width: 991px) {
          .cvs-bar { flex-wrap: wrap; gap: 8px; }
          .cvs-bar-trade,
          .cvs-bar-ai { flex: 1 1 calc(50% - 4px); }
          .cvs-bar-trade::after,
          .cvs-bar-ai::after { display: none; }
          .cvs-bar-trade .cvs-select-trigger,
          .cvs-bar-ai .cvs-select-trigger,
          .cvs-bar-keyword .cvs-keyword-field { border-color: #e6e9f0; }
          .cvs-bar-keyword { order: 3; flex: 1 1 100%; }
          .cvs-bar .cvs-search-btn { order: 4; flex: 1 1 auto; margin-left: 0; }
          .cvs-reset-btn { order: 5; }
          .cvs-sort { max-width: none; }
        }
        @media (max-width: 575px) {
          .cvs-bar-trade,
          .cvs-bar-ai { flex-basis: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cvs-menu, .cvs-suggest { animation: none; }
          .cvs-select-chevron { transition: none; }
        }
      `}</style>

    </main>
  );
};

export default EmployerCvSearchPage;