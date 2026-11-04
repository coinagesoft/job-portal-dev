'use client';
import React, { useState, useMemo } from "react";
import { filterCategories } from "./filterData";

const normalizeString = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};

// Display-only formatting — the underlying option.label stays raw (e.g.
// "10th_pass") since that's what's compared against job fields elsewhere.
// This just controls what the user sees on screen.
const formatLabel = (value) => {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const uniqueValues = (values) =>
  Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((v) => String(v).trim())
        .filter((v) => v.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

// Parses "45,000-60,000", "45000", etc. into { min, max }. Same convention
// as JobList.jsx's parseJobSalary — raw numbers, no unit multiplication.
const parseSalaryRangeToMinMax = (salaryRange) => {
  const nums = String(salaryRange || "")
    .replace(/,/g, "")
    .match(/\d+/g)
    ?.map(Number) || [];
  if (nums.length === 0) return null;
  const min = nums[0];
  const max = nums[1] ?? nums[0];
  return { min, max };
};

// Fixed experience ranges. Labels must stay parseable by JobList's
// parseExperienceFilter ("Fresher", "1-3", "10+"), which is what actually
// filters the list.
const EXPERIENCE_BUCKETS = [
  { label: "Fresher (0-1 yr)", min: 0, max: 1 },
  { label: "1-3 Years", min: 1, max: 3 },
  { label: "3-5 Years", min: 3, max: 5 },
  { label: "5-10 Years", min: 5, max: 10 },
  { label: "10+ Years", min: 10, max: Infinity },
];

// Same parsing as JobList's parseJobExperience: "2-5 Years", "Fresher",
// "3+ years"; no number at all means "any experience".
const parseJobExperience = (experienceDisplay) => {
  const text = String(experienceDisplay || "").toLowerCase();
  const nums = text.match(/\d+/g)?.map(Number) || [];
  if (text.includes("fresher")) return { min: 0, max: 1 };
  if (nums.length === 0) return { min: 0, max: Infinity };
  const min = nums[0];
  const max = nums[1] || min;
  return { min, max };
};

// Builds N buckets spanning the actual min/max salary found in the data,
// rounded to a "nice" step so labels don't show ugly numbers. The last
// bucket is open-ended ("+"). Returns [] if there's no usable salary data.
const buildSalaryBuckets = (jobsList, bucketCount = 4) => {
  const parsed = jobsList
    .map((job) => parseSalaryRangeToMinMax(job.salaryRange || job.salaryDisplay))
    .filter(Boolean);

  if (parsed.length === 0) return [];

  const overallMin = Math.min(...parsed.map((p) => p.min));
  const overallMax = Math.max(...parsed.map((p) => p.max));

  if (!Number.isFinite(overallMin) || !Number.isFinite(overallMax) || overallMax <= overallMin) {
    return [];
  }

  const span = overallMax - overallMin;
  const rawStep = span / bucketCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const step = Math.max(magnitude, Math.round(rawStep / magnitude) * magnitude);

  const buckets = [];
  let cursor = Math.floor(overallMin / step) * step;
  for (let i = 0; i < bucketCount; i++) {
    const bucketMin = cursor;
    const isLast = i === bucketCount - 1;
    const bucketMax = isLast ? Infinity : cursor + step;
    buckets.push({
      label: isLast
        ? `₹${bucketMin.toLocaleString("en-IN")}+`
        : `₹${bucketMin.toLocaleString("en-IN")} - ₹${bucketMax.toLocaleString("en-IN")}`,
      min: bucketMin,
      max: bucketMax,
    });
    cursor += step;
  }
  return buckets;
};

const getOptionCount = (categoryType, optionLabel, jobsList) => {
  if (!Array.isArray(jobsList)) return 0;
  const normLabel = normalizeString(optionLabel);
  return jobsList.filter(job => {
    switch (categoryType) {
      case "cities": {
        const jobCity = normalizeString(job.city || job.jobLocation);
        return jobCity.includes(normLabel);
      }
      case "states": {
        const jobState = normalizeString(job.state || job.jobLocation);
        return jobState.includes(normLabel);
      }
      case "industries": {
        const jobIndustry = normalizeString(job.industryType);
        return jobIndustry === normLabel;
      }
      case "tradeCategories": {
        const jobTrade = normalizeString(job.tradeCategory);
        return jobTrade.includes(normLabel);
      }
      case "roles": {
        const jobRole = normalizeString(job.jobTitle || job.role);
        return jobRole.includes(normLabel);
      }
      case "educationLevels": {
        const jobEdu = normalizeString(job.educationRequired);
        return jobEdu === normLabel;
      }
      case "employmentTypes": {
        const jobEmpType = normalizeString(job.employmentType);
        return jobEmpType === normLabel;
      }
      case "locationTypes": {
        const jobLocType = normalizeString(job.locationType);
        return jobLocType === normLabel;
      }
      case "employmentModes": {
        const jobEmpMode = normalizeString(job.employmentMode);
        return jobEmpMode === normLabel;
      }
      case "departments": {
        const jobDept = normalizeString(job.department);
        return jobDept === normLabel;
      }
      case "skills": {
        if (!Array.isArray(job.skills)) return false;
        return job.skills.some(skill => normalizeString(skill) === normLabel);
      }
      default:
        return false;
    }
  }).length;
};

const JobFiltersSidebar = ({ jobs = [], filters = {}, onFilterChange }) => {
  const [openCategory, setOpenCategory] = useState(filterCategories[0]?.type ?? null);

  // All option lists, including salary buckets, are derived straight from
  // the jobs data (the same getAllJobs response the page already fetched)
  // instead of a separate getJobFilterOptions call.
  const filterOptions = useMemo(() => {
    const salaryBuckets = buildSalaryBuckets(jobs);

    return {
      industries: uniqueValues(jobs.map(j => j.industryType)).map(label => ({ label, count: null })),
      tradeCategories: uniqueValues(jobs.map(j => j.tradeCategory)).map(label => ({ label, count: null })),
      roles: uniqueValues(jobs.map(j => j.jobTitle || j.role)).map(label => ({ label, count: null })),
      cities: uniqueValues(jobs.map(j => j.city || j.jobLocation)).map(label => ({ label, count: null })),
      states: uniqueValues(jobs.map(j => j.state || j.jobLocation)).map(label => ({ label, count: null })),
      locationTypes: uniqueValues(jobs.map(j => j.locationType)).map(label => ({ label, count: null })),
      employmentTypes: uniqueValues(jobs.map(j => j.employmentType)).map(label => ({ label, count: null })),
      educationLevels: uniqueValues(jobs.map(j => j.educationRequired)).map(label => ({ label, count: null })),
      departments: uniqueValues(jobs.map(j => j.department)).map(label => ({ label, count: null })),
      skills: uniqueValues(jobs.flatMap(j => Array.isArray(j.skills) ? j.skills : [])).map(label => ({ label, count: null })),
      employmentModes: uniqueValues(jobs.map(j => j.employmentMode)).map(label => ({ label, count: null })),
      experience: EXPERIENCE_BUCKETS.map(b => ({ label: b.label, count: null, min: b.min, max: b.max })),
      salary: salaryBuckets.map(b => ({ label: b.label, count: null, min: b.min, max: b.max })),
    };
  }, [jobs]);

  const toggleCategory = (type) => {
    setOpenCategory(prev => (prev === type ? null : type));
  };

  const handleCheckbox = (category, value) => {
    const current = filters[category] || [];
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    onFilterChange?.({
      ...filters,
      [category]: newValues
    });
  };

  const handleReset = (e) => {
    e.preventDefault();
    const empty = Object.keys(filterOptions).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
    onFilterChange?.(empty);
  };

  const safeIncludes = (values, value) => (values || []).includes(value);

  const totalSelected = Object.entries(filters).reduce((sum, [key, val]) => {
    if (Array.isArray(val)) {
      return sum + val.length;
    }
    return sum;
  }, 0);

  const optionsWithCounts = useMemo(() => {
    const result = {};
    Object.entries(filterOptions).forEach(([type, opts]) => {
      if (type === "salary") {
        result[type] = opts.map(opt => ({
          ...opt,
          count: jobs.filter(job => {
            const jobSal = parseSalaryRangeToMinMax(job.salaryRange || job.salaryDisplay);
            if (!jobSal) return false;
            return jobSal.min <= opt.max && jobSal.max >= opt.min;
          }).length,
        }));
      } else if (type === "experience") {
        result[type] = opts.map(opt => ({
          ...opt,
          count: jobs.filter(job => {
            const jobExp = parseJobExperience(job.experienceDisplay);
            return jobExp.min <= opt.max && jobExp.max >= opt.min;
          }).length,
        }));
      } else {
        result[type] = opts.map(opt => ({
          ...opt,
          count: getOptionCount(type, opt.label, jobs)
        }));
      }
    });
    return result;
  }, [filterOptions, jobs]);

  return (
    <div className="mb-30 job-filters-sidebar">
      <style dangerouslySetInnerHTML={{ __html: `
        .job-filters-sidebar {
          --jf-navy: #122359;
          --jf-orange: #ffa300;
          --jf-text: #4f5e64;
          --jf-muted: #8a97b3;
          --jf-line: #eef0f5;
          background: #fff;
          border: 1px solid var(--jf-line);
          border-radius: 12px;
          padding: 6px 16px 8px;
          font-family: inherit;
        }
        .job-filters-sidebar .jf-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--jf-line);
        }
        .job-filters-sidebar .jf-title {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--jf-navy);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .job-filters-sidebar .jf-reset {
          font-size: 11px;
          font-weight: 600;
          color: var(--jf-orange);
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .job-filters-sidebar .jf-reset:hover { text-decoration: underline; }
        .job-filters-sidebar .jf-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 6px;
          border-radius: 9px;
          background: #fff4e6;
          color: #e68a00;
          font-size: 10px;
          font-weight: 700;
          line-height: 18px;
          text-align: center;
        }
        .job-filters-sidebar .jf-block { border-bottom: 1px solid var(--jf-line); }
        .job-filters-sidebar .jf-block:last-child { border-bottom: none; }
        .job-filters-sidebar .jf-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--jf-navy);
          transition: color 0.15s ease;
        }
        .job-filters-sidebar .jf-toggle:hover,
        .job-filters-sidebar .jf-toggle.is-open { color: var(--jf-orange); }
        .job-filters-sidebar .jf-toggle-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .job-filters-sidebar .jf-chevron {
          width: 10px;
          height: 10px;
          flex-shrink: 0;
          color: var(--jf-muted);
          transition: transform 0.2s ease;
        }
        .job-filters-sidebar .jf-toggle.is-open .jf-chevron {
          transform: rotate(180deg);
          color: var(--jf-orange);
        }
        .job-filters-sidebar .jf-options {
          list-style: none;
          margin: 0 0 8px;
          padding: 0 2px 0 0;
          max-height: 190px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: #dfe3ec transparent;
        }
        .job-filters-sidebar .jf-options::-webkit-scrollbar { width: 4px; }
        .job-filters-sidebar .jf-options::-webkit-scrollbar-thumb {
          background: #dfe3ec;
          border-radius: 4px;
        }
        .job-filters-sidebar .jf-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 5px 0;
          margin: 0;
          border: none;
        }
        .job-filters-sidebar .jf-option label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          padding: 0;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.3;
          color: var(--jf-text);
          min-width: 0;
        }
        .job-filters-sidebar .jf-option label span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .job-filters-sidebar .jf-option input[type="checkbox"] {
          width: 14px;
          height: 14px;
          margin: 0;
          flex-shrink: 0;
          cursor: pointer;
          accent-color: var(--jf-orange);
        }
        .job-filters-sidebar .jf-option:hover label { color: var(--jf-navy); }
        .job-filters-sidebar .jf-count {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--jf-muted);
          background: #f5f7fa;
          border-radius: 8px;
          padding: 1px 7px;
          flex-shrink: 0;
        }
        .job-filters-sidebar .jf-empty {
          margin: 0 0 10px;
          font-size: 11.5px;
          color: var(--jf-muted);
        }
      `}} />

      <div className="jf-head">
        <h5 className="jf-title">
          Advance Filter
          {totalSelected > 0 && <span className="jf-badge">{totalSelected}</span>}
        </h5>
        <button type="button" className="jf-reset" onClick={handleReset}>
          Reset All
        </button>
      </div>

      {filterCategories.map((category) => {
        const options = optionsWithCounts[category.type] || [];
        const isOpen = openCategory === category.type;
        const selectedCount = filters[category.type]?.length || 0;

        return (
          <div key={category.type} className="jf-block">
            <button
              type="button"
              className={`jf-toggle ${isOpen ? "is-open" : ""}`}
              onClick={() => toggleCategory(category.type)}
              aria-expanded={isOpen}
            >
              <span className="jf-toggle-label">
                {category.label}
                {selectedCount > 0 && <span className="jf-badge">{selectedCount}</span>}
              </span>
              <svg className="jf-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isOpen &&
              (options.length === 0 ? (
                <p className="jf-empty">No options available.</p>
              ) : (
                <ul className="jf-options">
                  {options.map((option) => (
                    <li key={`${category.type}-${option.label}`} className="jf-option">
                      <label>
                        <input
                          type="checkbox"
                          checked={safeIncludes(filters[category.type], option.label)}
                          onChange={() => handleCheckbox(category.type, option.label)}
                        />
                        <span>{formatLabel(option.label)}</span>
                      </label>
                      {option.count !== null && option.count !== undefined ? (
                        <span className="jf-count">{option.count}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ))}
          </div>
        );
      })}
    </div>
  );
};

export default JobFiltersSidebar;