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
import { getAllJobs } from "@/services/candidate/allJobsService";
import { getCandidateId } from "@/utils/authHelper";

const JobsListPageClient = () => {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const candidateId = getCandidateId();
        const response = await getAllJobs(candidateId ? { candidateId } : {});

        console.log("ALL JOBS:", response.data);

        setJobs(response.data || []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);




  // const filtersFromQuery = useMemo(() => {
  //   const queryFilters = {};

  //   const keyword =
  //     (searchParams.get("q") || "").trim();

  //   const location =
  //     (searchParams.get("location") || "").trim();

  //   const industries = searchParams
  //     .getAll("industry")
  //     .map((item) => item.trim())
  //     .filter(Boolean);

  //   const tradeCategories = searchParams
  //     .getAll("tradeCategory")
  //     .map((item) => item.trim())
  //     .filter(Boolean);

  //   if (keyword) {
  //     queryFilters.keyword = keyword;
  //   }

  //   if (location) {
  //     queryFilters.locationSingle = location;
  //   }

  //   if (industries.length) {
  //     queryFilters.industries = industries;
  //   }

  //   if (tradeCategories.length) {
  //     queryFilters.tradeCategories = tradeCategories;
  //   }

  //   return queryFilters;
  // }, [searchParams]);

  const filtersFromQuery = useMemo(() => {
    const queryFilters = {};

    const keyword =
      (searchParams.get("q") || "").trim();

    const location =
      (searchParams.get("location") || "").trim();



    const industries = searchParams
      .getAll("industry")
      .map((item) => item.trim())
      .filter(Boolean);

    const tradeCategories = searchParams
      .getAll("tradeCategory")
      .map((item) => item.trim())
      .filter(Boolean);

    if (keyword) {
      queryFilters.keyword = keyword;
    }

    if (location) {
      queryFilters.locationSingle = location;
    }

  

    if (industries.length) {
      queryFilters.industries = industries;
    }

    if (tradeCategories.length) {
      queryFilters.tradeCategories = tradeCategories;
    }

    return queryFilters;
  }, [searchParams]);

const queryFilteredJobs = useMemo(() => {
  let result = [...jobs];

  // 1. FILTER BY EMPLOYER ID
  if (filters.employerId) {
    const employerId = String(filters.employerId)
      .trim()
      .toLowerCase();

    result = result.filter(
      (job) =>
        String(job.employerId || "")
          .trim()
          .toLowerCase() === employerId
    );
  }

  // 2. FILTER BY KEYWORD
  if (filters.keyword) {
    const keyword = filters.keyword
      .trim()
      .toLowerCase();

    result = result.filter((job) => {
      const searchableText = [
        job.jobTitle,
        job.companyName,
        job.tradeCategory,
        job.department,
        job.industryType,
        job.description,
        ...(job.skills || []),
        ...(job.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }

  // 3. FILTER BY LOCATION
  if (filters.locationSingle) {
    const location = filters.locationSingle
      .trim()
      .toLowerCase();

    result = result.filter((job) => {
      const searchableLocation = [
        job.jobLocation,
        job.companyLocation,
        job.onshoreCity,
        job.onshoreState,
        job.offshoreCountry,
        job.offshoreRegion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableLocation.includes(location);
    });
  }

  // 4. FILTER BY INDUSTRY
  if (filters.industries?.length) {
    const selectedIndustries = filters.industries.map(
      (item) => item.trim().toLowerCase()
    );

    result = result.filter((job) =>
      selectedIndustries.includes(
        String(job.industryType || "")
          .trim()
          .toLowerCase()
      )
    );
  }

  // 5. FILTER BY TRADE CATEGORY
  if (filters.tradeCategories?.length) {
    const selectedTradeCategories =
      filters.tradeCategories.map(
        (item) => item.trim().toLowerCase()
      );

    result = result.filter((job) =>
      selectedTradeCategories.includes(
        String(job.tradeCategory || "")
          .trim()
          .toLowerCase()
      )
    );
  }

  return result;
}, [jobs, filters]);

  useEffect(() => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next.keyword;
      delete next.locationSingle;
      delete next.industries;
      delete next.tradeCategories;
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

      // Preserve URL-controlled filters
      ...(prev.keyword
        ? { keyword: prev.keyword }
        : {}),

      ...(prev.locationSingle
        ? { locationSingle: prev.locationSingle }
        : {}),

      ...(prev.employerId
        ? { employerId: prev.employerId }
        : {}),
    }));
  }, []);

  const handleSheetApply = useCallback((sheetFilters) => {
    setFilters((prev) => ({
      ...(sheetFilters || {}),

      ...(prev.keyword
        ? { keyword: prev.keyword }
        : {}),

      ...(prev.locationSingle
        ? { locationSingle: prev.locationSingle }
        : {}),

      ...(prev.employerId
        ? { employerId: prev.employerId }
        : {}),
    }));
  }, []);

  const handleSheetClose = useCallback(() => {
    setShowFilterSheet(false);
  }, []);


useEffect(() => {
  console.log("URL EMPLOYER ID:", searchParams.get("employerId"));
  console.log("FILTER EMPLOYER ID:", filters.employerId);
  console.log("ALL JOBS:", jobs);

  console.log(
    "JOB EMPLOYER IDS:",
    jobs.map((job) => ({
      jobId: job.jobId,
      employerId: job.employerId,
      companyName: job.companyName,
    }))
  );

  console.log("COMPANY FILTERED JOBS:", queryFilteredJobs);
}, [searchParams,  jobs, queryFilteredJobs]);

  return (
    <>
      <Preloader />
      <HeroSearch
        jobs={queryFilteredJobs}
        keyword={searchParams.get("q") || ""}
        location={searchParams.get("location") || ""}
        industry={searchParams.get("industry") || ""}
      />
      <section className="section-box mt-30">
        <div className="container">
          <div className="row flex-row-reverse">
            <div className="col-lg-9 col-md-12 col-sm-12 col-12 float-right">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', padding: '0 15px' }}>
                {/* <FilterButton 
                  activeFilterCount={totalFilterCount}
                  onClick={() => setShowFilterSheet(true)} 
                /> */}
              </div>
              <JobList
                jobs={queryFilteredJobs}
                filters={filters}
              />
            </div>
            <div className="col-lg-3 col-md-12 col-sm-12 col-12">
              <JobFiltersSidebar   jobs={queryFilteredJobs} filters={filters} onFilterChange={handleFiltersChange} />
            </div>
          </div>
        </div>
      </section>
      <NewsSection />
      {/* <Newsletter /> */}
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

export default JobsListPageClient;