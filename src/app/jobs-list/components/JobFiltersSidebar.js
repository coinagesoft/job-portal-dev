'use client';
import React, { useState, useMemo } from "react";
import { filterCategories } from "./filterData";

const normalizeString = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
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
      } else {
        result[type] = opts.map(opt => ({
          ...opt,
          count: getOptionCount(type, opt.label, jobs)
        }));
      }
    });
    return result;
  }, [filterOptions, jobs]);

  const filterBadgeStyle = {
    background: '#fff4e6',
    color: '#e68a00',
    border: '1px solid #ffe3c2',
  };

  return (
    <div className="sidebar-shadow none-shadow mb-30 job-filters-sidebar" style={{ '--primary-navy': '#122359' }}>
      {/* Force exactly one separator line per filter block, regardless of
          any border/margin the theme's own global CSS puts on the list,
          list items, or form-group wrapper. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .job-filters-sidebar .filter-block {
          border-bottom: 1px solid var(--border-light, #eef0f5) !important;
          padding-bottom: 12px !important;
          margin-bottom: 12px !important;
        }
        .job-filters-sidebar .filter-block .form-group,
        .job-filters-sidebar .filter-block .list-checkbox,
        .job-filters-sidebar .filter-block .list-checkbox li {
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .job-filters-sidebar .filter-block .list-checkbox li {
          padding: 6px 0 !important;
        }
      `}} />
      <div className="sidebar-filters">
        <div
          className="filter-block mb-30"
          style={{
            borderBottom: '1px solid var(--border-light, #e5e8f1)',
            paddingBottom: 16,
          }}
        >
          <h5
            style={{
              color: 'var(--text-dark)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 0,
            }}
          >
            <span>
              Advance Filter
              {totalSelected > 0 && (
                <span className="number-item" style={{ ...filterBadgeStyle, padding: "5px 10px", borderRadius: "25%", marginLeft: 8 }}>
                  {totalSelected}
                </span>
              )}
            </span>
            <span>
              <a
                className="link-reset"
                href="#"
                style={{
                  color: 'var(--primary-blue, #1a56c4)',
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: 'none'
                }}
                onClick={handleReset}
              >
                Reset All
              </a>
            </span>
          </h5>
        </div>

        {filterCategories.map((category) => {
          const options = optionsWithCounts[category.type] || [];
          const isOpen = openCategory === category.type;
          const selectedCount = filters[category.type]?.length || 0;

          return (
            <div
              key={category.type}
              className="filter-block mb-20"
            >
              <h5
                className="medium-heading"
                style={{
                  color: isOpen ? 'var(--primary-blue, #1a56c4)' : 'var(--text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isOpen ? 12 : 0,
                  transition: 'color 0.15s',
                }}
                onClick={() => toggleCategory(category.type)}
              >
                <span>
                  {category.label}
                  {selectedCount > 0 && (
                    <span className="number-item" style={{ ...filterBadgeStyle, marginLeft: 8, padding: "5px 10px", borderRadius: "25% " }}>
                      {selectedCount}
                    </span>
                  )}
                </span>
                <span
                  style={{
                    color: 'var(--primary-blue, #1a56c4)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    fontSize: 12,
                  }}
                >
                  ▾
                </span>
              </h5>

              {isOpen && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  {options.length === 0 ? (
                    <p className="text-small color-text-paragraph-2" style={{ margin: 0 }}>
                      No options available.
                    </p>
                  ) : (
                    <ul className="list-checkbox" style={{
                      maxHeight: 220, overflowY: "auto",
                      overflowX: "hidden",
                      margin: 0,
                    }}>
                      {options.map((option) => (
                        <li key={`${category.type}-${option.label}`}>
                          <label className="cb-container">
                            <input
                              type="checkbox"
                              checked={safeIncludes(filters[category.type], option.label)}
                              onChange={() => handleCheckbox(category.type, option.label)}
                            />
                            <span className="text-small">{option.label}</span>
                            <span className="checkmark"></span>
                          </label>
                          {option.count !== null && option.count !== undefined ? (
                            <span className="number-item" style={filterBadgeStyle}>{option.count}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobFiltersSidebar;