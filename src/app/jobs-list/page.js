'use client';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Preloader from '../Homepage/components/Preloader';
import HeroSearch from './components/HeroSearch';
import JobList from './components/JobList';
import JobFiltersSidebar from './components/JobFiltersSidebar';
import NewsSection from './components/NewsSection';
import Newsletter from './components/Newsletter';
import FilterButton from './components/FilterButton';
import JobFilterSheet from './components/JobFilterSheet';
import { useSearchParams } from 'next/navigation';


const JobsListPage = () => {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const filtersFromQuery = useMemo(() => {
    const queryFilters = {};
    const keyword = (searchParams.get('q') || '').trim();
    const location = (searchParams.get('location') || '').trim();
    const industries = searchParams.getAll('industry').map((item) => item.trim()).filter(Boolean);

    if (keyword) queryFilters.keyword = keyword;
    if (location) queryFilters.locationSingle = location;
    if (industries.length) {
      queryFilters.industries = industries;
      queryFilters.industry = industries;
    }

    return queryFilters;
  }, [searchParams]);

  useEffect(() => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next.keyword;
      delete next.locationSingle;
      delete next.industry;
      delete next.industries;
      return { ...next, ...filtersFromQuery };
    });
  }, [filtersFromQuery]);

  const totalFilterCount = Object.values(filters).reduce((sum, cat) => {
    if (Array.isArray(cat)) return sum + cat.length;
    if (typeof cat === 'string' && cat.trim()) return sum + 1;
    return sum;
  }, 0);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...(newFilters || {}),
      ...(prev.keyword ? { keyword: prev.keyword } : {}),
      ...(prev.locationSingle ? { locationSingle: prev.locationSingle } : {})
    }));
  }, []);

  const handleSheetApply = useCallback((sheetFilters) => {
    setFilters((prev) => ({
      ...(sheetFilters || {}),
      ...(prev.keyword ? { keyword: prev.keyword } : {}),
      ...(prev.locationSingle ? { locationSingle: prev.locationSingle } : {})
    }));
  }, []);

  const handleSheetClose = useCallback(() => {
    setShowFilterSheet(false);
  }, []);

  return (
    <>
      <Preloader />
      {/* <Header /> */}
      <HeroSearch />
      <section className="section-box mt-30">
        <div className="container">
          <div className="row flex-row-reverse">
            <div className="col-lg-9 col-md-12 col-sm-12 col-12 float-right">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', padding: '0 15px' }}>
                <FilterButton 
                  activeFilterCount={totalFilterCount}
                  onClick={() => setShowFilterSheet(true)} 
                />
              </div>
              <JobList filters={filters} />
            </div>
            <div className="col-lg-3 col-md-12 col-sm-12 col-12">
              <JobFiltersSidebar onFilterChange={handleFiltersChange} />
            </div>
          </div>
        </div>
      </section>
      <NewsSection />
      <Newsletter />
      {showFilterSheet && (
        <JobFilterSheet 
          initialFilters={filters}
          onApply={handleSheetApply}
          onClose={handleSheetClose}
        />
      )}
    </>
  );
};

export default JobsListPage;
