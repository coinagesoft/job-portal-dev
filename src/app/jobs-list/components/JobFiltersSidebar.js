'use client';
import React, { useState, useEffect } from 'react';
import { filterCategories, filterOptions } from './filterData';

const JobFiltersSidebar = ({ onFilterChange }) => {
  const buildDefaultFilters = () =>
    Object.keys(filterOptions).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});

  const [filters, setFilters] = useState(buildDefaultFilters);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCheckbox = (category, value) => {
    setFilters(prev => {
      const current = prev[category] || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return {
        ...prev,
        [category]: newValues
      };
    });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFilters(buildDefaultFilters());
  };

  const safeIncludes = (values, value) => (values || []).includes(value);
  const filterBadgeStyle = {
    background: '#e8f0fe',
    color: '#1a56c4',
    border: '1px solid #c7dcff'
  };

  return (
    <div className="sidebar-shadow none-shadow mb-30" style={{ '--primary-navy': '#122359' }}>
      <div className="sidebar-filters">
        <div className="filter-block head-border mb-30" style={{ borderColor: 'var(--border-light)' }}>
          <h5 style={{ color: 'var(--text-dark)' }}>
            Advance Filter{' '}
            <a className="link-reset" href="#" style={{ color: 'var(--primary-blue)' }} onClick={handleReset}>
              Reset
            </a>
          </h5>
        </div>

        {filterCategories.map((category) => {
          const options = filterOptions[category.type] || [];
          return (
            <div key={category.type} className="filter-block mb-20">
              <h5 className="medium-heading mb-15" style={{ color: 'var(--text-dark)' }}>
                {category.label}
              </h5>
              <div className="form-group">
                <ul className="list-checkbox">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobFiltersSidebar;

