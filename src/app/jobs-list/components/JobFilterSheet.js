'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { filterCategories, filterOptions } from './filterData';

const JobFilterSheet = ({ onApply, onClose, initialFilters = {} }) => {
  const [options, setOptions] = useState({});
  const [active, setActive] = useState('workMode');
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Deep copy options
    const copied = {};
    Object.entries(filterOptions).forEach(([type, opts]) => {
      copied[type] = opts.map(o => ({ ...o, selected: initialFilters[type]?.includes(o.label) || false }));
    });
    setOptions(copied);
  }, [initialFilters]);

  useEffect(() => {
    if (options[active]) return;
    const fallbackType = filterCategories[0]?.type;
    if (fallbackType) setActive(fallbackType);
  }, [active, options]);

  const activeOptions = options[active] || [];
  const filteredOptions = active === 'location' && search.trim()
    ? activeOptions.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : activeOptions;

  const selectedCountFor = useCallback((type) => (options[type] || []).filter(o => o.selected).length, [options]);

  const totalSelected = Object.values(options).reduce((sum, opts) => sum + opts.filter(o => o.selected).length, 0);

  const toggleOption = useCallback((label) => {
    setOptions(prev => ({
      ...prev,
      [active]: prev[active].map(o => o.label === label ? { ...o, selected: !o.selected } : o)
    }));
  }, [active]);

  const clearAll = () => {
    setOptions(prev => {
      const cleared = { ...prev };
      Object.keys(cleared).forEach(key => {
        cleared[key] = cleared[key].map(o => ({ ...o, selected: false }));
      });
      return cleared;
    });
  };

  const applyFilters = () => {
    const result = {};
    Object.keys(filterOptions).forEach((type) => {
      const currentOptions = options[type] || [];
      result[type] = currentOptions.filter(o => o.selected).map(o => o.label);
    });
    onApply(result);
    onClose();
  };

  useEffect(() => {
    setShow(true);
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!show) return null;

  return (
    <>
      <div 
        className="job-filter-backdrop" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          animation: 'fadeIn 200ms'
        }}
        onClick={handleBackdropClick}
      />
      <div className="job-filter-sheet">
        {/* Handle */}
        <div style={{ padding: '10px 0 4px', textAlign: 'center' }}>
          <div style={{
            width: '36px',
            height: '4px',
            background: 'var(--border-light)',
            borderRadius: '2px',
            margin: '0 auto'
          }} />
        </div>

        {/* Header */}
        <div style={{ 
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <h2 style={{
            fontSize: 'var(--font-lg)',
            fontWeight: '700',
            color: 'var(--text-dark)',
            margin: 0,
            letterSpacing: '-0.3px',
            flex: 1
          }}>
            Filter results
          </h2>
          {totalSelected > 0 && (
            <button 
              onClick={clearAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '20px',
                background: 'rgba(58, 123, 213, 0.1)',
                border: 'none',
                fontSize: 'var(--font-xs)',
                fontWeight: '600',
                color: 'var(--primary-blue)',
                cursor: 'pointer'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              Clear all ({totalSelected})
            </button>
          )}
        </div>

        {/* Body: Sidebar + Content */}
        <div style={{ display: 'flex', height: 'calc(100% - 120px)', overflow: 'hidden' }}>
          {/* Sidebar */}
          <div className="job-filter-sidebar" style={{ flexShrink: 0 }}>
            {filterCategories.map(cat => {
              const selCount = selectedCountFor(cat.type);
              const isActive = cat.type === active;
              return (
                <div 
                  key={cat.type}
                  className={`job-filter-tab ${isActive ? 'active' : ''}`}
                  style={{
                    padding: '15px 14px',
                    borderBottom: '0.5px solid var(--border-light)',
                    backgroundColor: isActive ? 'white' : 'var(--bg-light)',
                    borderLeft: isActive ? '3px solid var(--primary-navy)' : '3px solid transparent',
                    fontSize: 'var(--font-sm)',
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? 'var(--text-dark)' : 'var(--text-mid)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 160ms'
                  }}
                  onClick={() => {
                    setActive(cat.type);
                    if (cat.type === 'location') setSearch('');
                  }}
                >
                  <span style={{ flex: 1 }}>{cat.label}</span>
                  {selCount > 0 && (
                    <span style={{
                      padding: '2px 5px',
                      background: 'var(--primary-navy)',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: 'var(--font-xxs)',
                      fontWeight: '700'
                    }}>
                      {selCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ width: '1px', background: 'var(--border-light)' }} />

          {/* Options Panel */}
          <div style={{ flex: 1, padding: '12px 14px', overflow: 'auto' }}>
            {active === 'location' && (
              <div style={{ marginBottom: '6px' }}>
                <input
                  type="text"
                  placeholder="Search location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '2px',
                    fontSize: 'var(--font-base)',
                    background: 'white'
                  }}
                />
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: 'var(--font-sm)', padding: '40px 0' }}>
                No results found
              </div>
            ) : (
              filteredOptions.map((option, i) => (
                <div 
                  key={option.label}
                  className="job-filter-option"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    marginBottom: i < filteredOptions.length - 1 ? '4px' : 0,
                    cursor: 'pointer',
                    borderRadius: '2px'
                  }}
                  onClick={() => toggleOption(option.label)}
                >
                  <div 
                    className={`job-filter-checkbox ${option.selected ? 'checked' : ''}`}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '2px',
                      border: `1.5px solid ${option.selected ? 'var(--primary-navy)' : 'var(--border-light)'}`,
                      backgroundColor: option.selected ? 'var(--primary-navy)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-base)',
                      color: option.selected ? 'white' : 'transparent'
                    }}
                  >
                    {option.selected && String.fromCharCode(10003)}
                  </div>
                  <span style={{
                    flex: 1,
                    fontSize: 'var(--font-base)',
                    fontWeight: option.selected ? 600 : 400,
                    color: option.selected ? 'var(--text-dark)' : 'var(--text-mid)'
                  }}>
                    {option.label}
                  </span>
                  {option.count !== null && (
                    <span style={{
                      fontSize: 'var(--font-sm)',
                      color: 'var(--text-light)',
                      fontWeight: 400
                    }}>
                      {option.count}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '14px 16px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          gap: '12px'
        }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              height: '50px',
              border: `1px solid var(--primary-navy)`,
              background: 'transparent',
              color: 'var(--primary-navy)',
              borderRadius: '2px',
              fontSize: 'var(--font-base)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={applyFilters}
            style={{
              flex: 2,
              height: '50px',
              background: 'var(--primary-navy)',
              color: 'white',
              borderRadius: '2px',
              fontSize: 'var(--font-base)',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            {totalSelected > 0 ? `Apply filters (${totalSelected})` : 'Apply filters'}
          </button>
        </div>
      </div>
    </>
  );
};

// Static show method
JobFilterSheet.show = (filters, onApply) => {
  // Use portal/modal context or parent to render
  console.warn('Use in parent with useState for modal visibility');
  return null;
};

export default JobFilterSheet;


