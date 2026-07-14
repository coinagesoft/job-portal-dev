'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getAllJobs } from '@/services/candidate/allJobsService';
import JobCardList from './JobCardList';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';
import Pagination from './Pagination';
import { getJobDetails } from "@/services/candidate/jobDetailsService";
import { getMyApplications } from "@/services/candidate/myApplicationsService";

const normalizeString = (str) => {
  if (!str) return "";
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
};

const JobList = ({ filters = {} }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allJobs, setAllJobs] = useState([]);       // full unfiltered dataset, fetched once
  const [loading, setLoading] = useState(true);
  const [showPerPage, setShowPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('Best Match');
  const [viewMode, setViewMode] = useState('list');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());

  const requestIdRef = useRef(0);

  // ---- Fetch the full job list ONCE (not on every filter/page/sort change) ----
  useEffect(() => {
    const thisRequestId = ++requestIdRef.current;
    const load = async () => {
      try {
        setLoading(true);
        const response = await getAllJobs();
        const jobs = response.data || [];
        if (thisRequestId !== requestIdRef.current) return; // stale response guard
        const processed = jobs.map((job) => ({
          ...job,
          salaryDisplay: job.salaryDisplay || job.salaryRange,
        }));
        setAllJobs(processed);
      } catch (error) {
        if (thisRequestId !== requestIdRef.current) return;
        console.error("Failed to load jobs", error);
        setAllJobs([]);
      } finally {
        if (thisRequestId === requestIdRef.current) setLoading(false);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, showPerPage]);

  const loadAppliedJobs = async () => {
    try {
      const res = await getMyApplications();
      const ids = (res?.data?.applications || [])
        .map((a) => a.jobId)
        .filter(Boolean);
      setAppliedJobIds(new Set(ids));
    } catch (error) {
      console.log("applied jobs load skipped", error?.message || error);
    }
  };

  useEffect(() => {
    loadAppliedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openApplyModal = async (job) => {
    try {
      const response = await getJobDetails(job.jobId);
      setActiveJob(response.data);
      setShowApplyModal(true);
    } catch (error) {
      console.error("Failed to load job details", error);
    }
  };

  // ---------------- Client-side filtering (single source of truth: industryType) ----------------

  const matchesKeyword = (job) => {
    const keyword = (filters.keyword || "").trim();
    if (!keyword) return true;
    const nk = normalizeString(keyword);
    const haystack = normalizeString(
      [job.jobTitle, job.tradeCategory, job.industryType, job.companyName, job.description].join(" ")
    );
    return haystack.includes(nk);
  };

  const matchesLocationSingle = (job) => {
    const loc = (filters.locationSingle || "").trim();
    if (!loc) return true;
    const jobLoc = normalizeString(job.jobLocation || job.city);
    return jobLoc.includes(normalizeString(loc));
  };

  const matchesCity = (job) => {
    const selected = filters.cities || [];
    if (selected.length === 0) return true;
    const jobCity = normalizeString(job.jobLocation || job.city);
    return selected.some(city => jobCity.includes(normalizeString(city)));
  };

  const matchesState = (job) => {
    const selected = filters.states || [];
    if (selected.length === 0) return true;
    const jobState = normalizeString(job.jobLocation || job.state);
    return selected.some(state => jobState.includes(normalizeString(state)));
  };

  // This is the field that BrowseByCategory.jsx groups/counts by.
  // Matching on it here (instead of tradeCategory) is what makes the
  // homepage count and the filtered list agree.
  const matchesIndustry = (job) => {
    const selected = [
      ...(filters.industries || []),
      ...(filters.tradeCategories || []), // kept for backward compatibility
    ];
    if (selected.length === 0) return true;
    const jobIndustry = normalizeString(job.industryType || job.tradeCategory);
    return selected.some(cat => jobIndustry === normalizeString(cat));
  };

  const matchesRole = (job) => {
    const selected = [...(filters.roles || []), ...(filters.role || [])];
    if (selected.length === 0) return true;
    const jobRole = normalizeString(job.jobTitle || job.role);
    return selected.some(role => jobRole.includes(normalizeString(role)));
  };

  const matchesEducation = (job) => {
    const selected = filters.educationLevels || [];
    if (selected.length === 0) return true;
    const jobEdu = normalizeString(job.educationRequired);
    return selected.some(edu => jobEdu === normalizeString(edu));
  };

  const matchesEmploymentType = (job) => {
    const selected = filters.employmentTypes || [];
    if (selected.length === 0) return true;
    const jobEmpType = normalizeString(job.employmentType);
    return selected.some(type => jobEmpType === normalizeString(type));
  };

  const matchesLocationType = (job) => {
    const selected = filters.locationTypes || [];
    if (selected.length === 0) return true;
    const jobLocType = normalizeString(job.locationType);
    return selected.some(type => jobLocType === normalizeString(type));
  };

  const matchesEmploymentMode = (job) => {
    const selected = filters.employmentModes || [];
    if (selected.length === 0) return true;
    const jobEmpMode = normalizeString(job.employmentMode);
    return selected.some(mode => jobEmpMode === normalizeString(mode));
  };

  const matchesDepartment = (job) => {
    const selected = filters.departments || [];
    if (selected.length === 0) return true;
    const jobDept = normalizeString(job.department);
    return selected.some(dept => jobDept === normalizeString(dept));
  };

  const matchesSkills = (job) => {
    const selected = filters.skills || [];
    if (selected.length === 0) return true;
    if (!Array.isArray(job.skills)) return false;
    return selected.some(skill =>
      job.skills.some(jobSkill => normalizeString(jobSkill) === normalizeString(skill))
    );
  };

  const parseSalaryFilter = (label) => {
    const nums = String(label).match(/\d+/g)?.map(n => Number(n) * 1000) || [];
    const min = nums[0] || 0;
    const max = label.includes("+") ? Infinity : (nums[1] || min);
    return { min, max };
  };

  const parseJobSalary = (salaryRange) => {
    const nums = String(salaryRange || "").replace(/,/g, "").match(/\d+/g)?.map(Number) || [];
    const min = nums[0] || 0;
    const max = nums[1] || min;
    return { min, max };
  };

  const salaryOverlap = (jobSal, filterSal) => jobSal.min <= filterSal.max && jobSal.max >= filterSal.min;

  const matchesSalary = (job) => {
    const selected = filters.salary || [];
    if (selected.length === 0) return true;
    const jobSal = parseJobSalary(job.salaryRange);
    return selected.some(label => salaryOverlap(jobSal, parseSalaryFilter(label)));
  };

  const parseExperienceFilter = (label) => {
    const nums = String(label).match(/\d+/g)?.map(Number) || [];
    if (label.toLowerCase().includes("fresher")) return { min: 0, max: 1 };
    const min = nums[0] || 0;
    const max = label.includes("+") ? Infinity : (nums[1] || min);
    return { min, max };
  };

  const parseJobExperience = (experienceDisplay) => {
    const text = String(experienceDisplay || "").toLowerCase();
    const nums = text.match(/\d+/g)?.map(Number) || [];
    if (text.includes("fresher")) return { min: 0, max: 1 };
    if (nums.length === 0) return { min: 0, max: Infinity };
    const min = nums[0];
    const max = nums[1] || min;
    return { min, max };
  };

  const experienceOverlap = (jobExp, filterExp) => jobExp.min <= filterExp.max && jobExp.max >= filterExp.min;

  const matchesExperience = (job) => {
    const selected = filters.experience || [];
    if (selected.length === 0) return true;
    const jobExp = parseJobExperience(job.experienceDisplay);
    return selected.some(label => experienceOverlap(jobExp, parseExperienceFilter(label)));
  };

  const getJobTime = (job) => (job.postedOn ? new Date(job.postedOn).getTime() : 0);
  const getJobMatch = (job) => Number(job.aiMatchPercentage) || 0;

  // All filtering + sorting happens here, in memory, against the single
  // `allJobs` array fetched once above — no API round-trip per filter change.
  const sortedFilteredJobs = useMemo(() => {
    const filtered = allJobs.filter(job =>
      matchesKeyword(job) &&
      matchesLocationSingle(job) &&
      matchesCity(job) &&
      matchesState(job) &&
      matchesIndustry(job) &&
      matchesRole(job) &&
      matchesEducation(job) &&
      matchesEmploymentType(job) &&
      matchesLocationType(job) &&
      matchesEmploymentMode(job) &&
      matchesDepartment(job) &&
      matchesSkills(job) &&
      matchesSalary(job) &&
      matchesExperience(job)
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === 'Newest Post') return getJobTime(b) - getJobTime(a);
      if (sortBy === 'Oldest Post') return getJobTime(a) - getJobTime(b);
      if (sortBy === 'Best Match') {
        const diff = getJobMatch(b) - getJobMatch(a);
        if (diff !== 0) return diff;
        return getJobTime(b) - getJobTime(a);
      }
      return 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allJobs, filters, sortBy]);

  const totalFilteredCount = sortedFilteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / showPerPage));
  const showingFrom = totalFilteredCount === 0 ? 0 : (currentPage - 1) * showPerPage + 1;
  const showingTo = totalFilteredCount === 0 ? 0 : Math.min(currentPage * showPerPage, totalFilteredCount);
  const filteredJobs = sortedFilteredJobs.slice((currentPage - 1) * showPerPage, currentPage * showPerPage);

  return (
    <div className="content-page">
      <div className="box-filters-job">
        <div className="row">
          <div className="col-xl-6 col-lg-5">
            <span className="text-small text-showing">
              Showing <strong>{showingFrom}-{showingTo} </strong>of <strong>{totalFilteredCount} </strong>jobs
            </span>
          </div>
          <div className="col-xl-6 col-lg-7 text-lg-end mt-sm-15">
            <div className="display-flex2">
              <div className="box-border mr-10">
                <span className="text-sortby">Show:</span>
                <div className="dropdown dropdown-sort">
                  <button className="btn dropdown-toggle" data-bs-toggle="dropdown">
                    <span>{showPerPage}</span><i className="fi-rr-angle-small-down"></i>
                  </button>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setShowPerPage(10); }}>10</a></li>
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setShowPerPage(12); }}>12</a></li>
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setShowPerPage(20); }}>20</a></li>
                  </ul>
                </div>
              </div>

              <div className="box-border">
                <span className="text-sortby">Sort by:</span>
                <div className="dropdown dropdown-sort">
                  <button className="btn dropdown-toggle" data-bs-toggle="dropdown">
                    <span>{sortBy}</span><i className="fi-rr-angle-small-down"></i>
                  </button>
                  <ul className="dropdown-menu">
                    <li><a className={`dropdown-item${sortBy === 'Best Match' ? ' active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setSortBy('Best Match'); }}>Best Match</a></li>
                    <li><a className={`dropdown-item${sortBy === 'Newest Post' ? ' active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setSortBy('Newest Post'); }}>Newest Post</a></li>
                    <li><a className={`dropdown-item${sortBy === 'Oldest Post' ? ' active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setSortBy('Oldest Post'); }}>Oldest Post</a></li>
                  </ul>
                </div>
              </div>

              <div className="box-view-type">
                <a
                  className={`view-type ${viewMode === 'list' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setViewMode('list'); }}
                >
                  <img src="/assets/imgs/template/icons/icon-list.svg" alt="List" />
                </a>
                <a
                  className={`view-type ${viewMode === 'grid' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setViewMode('grid'); }}
                >
                  <img src="/assets/imgs/template/icons/icon-grid-hover.svg" alt="Grid" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px', width: '100%' }}>
          <img
            src="/assets/imgs/template/loading.gif"
            alt="Loading..."
            style={{ maxWidth: '120px', filter: 'hue-rotate(195deg)' }}
          />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center" style={{ padding: '60px 0', width: '100%' }}>
          <img src="/assets/imgs/template/icons/empty.svg" alt="No jobs" style={{ maxWidth: '120px', marginBottom: '20px', opacity: 0.6 }} onError={(e) => { e.target.style.display = 'none'; }} />
          <h4 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>No Jobs Found</h4>
          <p style={{ color: 'var(--text-muted, #7c8493)', fontSize: '15px' }}>Try adjusting your filters or search terms to find matching roles.</p>
        </div>
      ) : (
        <div className={`row display-${viewMode}`}>
          {filteredJobs.map((job) => (
            <div
              key={job.jobId}
              className={viewMode === 'grid' ? 'col-xl-4 col-lg-6 col-md-6 col-sm-12 col-12' : 'col-xl-12 col-12'}
            >
              <JobCardList
                job={job}
                viewMode={viewMode}
                onApplyNow={openApplyModal}
                isApplied={appliedJobIds.has(job.jobId)}
              />
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 ? (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      ) : null}
      <ApplyJobModal
        showModal={showApplyModal}
        setShowModal={(v) => { setShowApplyModal(v); if (!v) loadAppliedJobs(); }}
        job={activeJob}
      />
    </div>
  );
};

export default JobList;