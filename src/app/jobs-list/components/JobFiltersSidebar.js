'use client';
import React, { useState, useEffect, useMemo } from "react";
import { filterCategories } from "./filterData";
import { getJobFilterOptions } from "@/services/candidate/jobFilterService";

const normalizeString = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
};


const formatLabel = (value) => {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


const getOptionCount = (categoryType, optionLabel, jobsList) => {
  if (!Array.isArray(jobsList)) return 0;
  const normLabel = normalizeString(optionLabel);
  return jobsList.filter(job => {
    switch (categoryType) {
      case "cities": {
        const jobCity = normalizeString(job.jobLocation || job.city);
        return jobCity.includes(normLabel);
      }
      case "states": {
        const jobState = normalizeString(job.jobLocation || job.state);
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
  const [filterOptions, setFilterOptions] = useState({});
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await getJobFilterOptions();
        if (response.data.success) {
          const data = response.data;
          const mapped = {
            tradeCategories: data.tradeCategories.map(item => ({ label: item, count: null })),
            roles: data.roles.map(item => ({ label: item, count: null })),
            cities: data.cities.map(item => ({ label: item, count: null })),
            states: data.states.map(item => ({ label: item, count: null })),
            locationTypes: data.locationTypes.map(item => ({ label: item, count: null })),
            employmentTypes: data.employmentTypes.map(item => ({ label: item, count: null })),
            educationLevels: data.educationLevels.map(item => ({ label: item, count: null })),
            departments: data.departments.map(item => ({ label: item, count: null })),
            skills: data.skills.map(item => ({ label: item, count: null })),
            employmentModes: (data.employmentModes || []).map(item => ({ label: item, count: null })),
          };
          setFilterOptions(mapped);
          setOpenCategory(filterCategories[0]?.type ?? null);
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    };
    loadFilters();
  }, []);

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
      result[type] = opts.map(opt => ({
        ...opt,
        count: getOptionCount(type, opt.label, jobs)
      }));
    });
    return result;
  }, [filterOptions, jobs]);

  const filterBadgeStyle = {
    background: '#fff4e6',
    color: '#e68a00',
    border: '1px solid #ffe3c2',
    // padding:"10px "
  };

  return (
    <div className="sidebar-shadow none-shadow mb-30" style={{ '--primary-navy': '#122359' }}>
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
              style={{
                borderBottom: '1px solid var(--border-light, #eef0f5)',
                paddingBottom: isOpen ? 16 : 12,
              }}
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
                <div className="form-group">
                  <ul className="list-checkbox" style={{ maxHeight: 220, overflowY: 'auto' }}>
                    {options.map((option) => (
                      <li key={`${category.type}-${option.label}`}>
                        <label className="cb-container">
                          <input
                            type="checkbox"
                            checked={safeIncludes(filters[category.type], option.label)}
                            onChange={() => handleCheckbox(category.type, option.label)}
                          />
                          <span className="text-small">
                            {formatLabel(option.label)}
                          </span>
                          <span className="checkmark"></span>
                        </label>
                        {option.count !== null && option.count !== undefined ? (
                          <span className="number-item" style={filterBadgeStyle}>{option.count}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
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