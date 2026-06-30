'use client';
import React, { useState, useEffect } from 'react';
import { getAllJobs  } from '@/services/candidate/allJobsService';
import { searchJobs } from '@/services/candidate/searchJobsService';
import JobCardList from './JobCardList';
import { mockJobs } from './data';
import ApplyJobModal from '@/app/Homepage/components/ApplyJobModal';
import Pagination from './Pagination';
import { getJobDetails } from "@/services/candidate/jobDetailsService";
import { getMyApplications } from "@/services/candidate/myApplicationsService";
import { getCandidateId } from "@/utils/authHelper";

const toSafeArray = (value) => (Array.isArray(value) ? value : []);

const parseRelativeAgeInDays = (value) => {
  const text = String(value || '').toLowerCase();
  const match = text.match(/(\d+)\s*(min|mins|minute|minutes|hour|hours|day|days|week|weeks|month|months)/);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];

  if (unit.startsWith('min')) return amount / (24 * 60);
  if (unit.startsWith('hour')) return amount / 24;
  if (unit.startsWith('day')) return amount;
  if (unit.startsWith('week')) return amount * 7;
  if (unit.startsWith('month')) return amount * 30;

  return Number.MAX_SAFE_INTEGER;
};

const extractSalaryLpa = (salaryRange) => {
  const text = String(salaryRange || '');
  const values = text.match(/\d+/g)?.map((value) => Number.parseInt(value, 10)) || [];
  if (values.length === 0) return { min: 0, max: 0 };
  if (text.includes('+')) return { min: values[0], max: 1000 };
  if (values.length === 1) return { min: values[0], max: values[0] };
  return { min: values[0], max: values[1] };
};

const JobList = ({ filters = {} }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPerPage, setShowPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('Newest Post');
  const [viewMode, setViewMode] = useState('list');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, showPerPage]);

  const showingFrom = totalFilteredCount === 0 ? 0 : (currentPage - 1) * showPerPage + 1;
  const showingTo = totalFilteredCount === 0 ? 0 : Math.min(currentPage * showPerPage, totalFilteredCount);
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / showPerPage));

  // Load the candidate's already-applied job ids so the card can show "Applied".
  const loadAppliedJobs = async () => {
    try {
      const res = await getMyApplications();
      const ids = (res?.data?.applications || [])
        .map((a) => a.jobId)
        .filter(Boolean);
      setAppliedJobIds(new Set(ids));
    } catch (error) {
      // not logged in / no applications — leave the set empty
      console.log("applied jobs load skipped", error?.message || error);
    }
  };

  useEffect(() => {
    loadAppliedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openApplyModal = async (job) => {
    try {
      const response = await getJobDetails(
        job.jobId
      );

      console.log(
        "JOB DETAILS RESPONSE",
        response.data
      );

      setActiveJob(response.data);
      setShowApplyModal(true);
    } catch (error) {
      console.error(
        "Failed to load job details",
        error
      );
    }
  };


  const loadJobs = async () => {
    try {
      setLoading(true);

      const first = (v) => (Array.isArray(v) ? v[0] : v) || "";

      // Salary range labels like "45K - 60K" / "80K+" → min/max rupees
      const salaryLabel = first(filters.salary);
      const salaryNums = String(salaryLabel).match(/\d+/g)?.map((n) => Number(n) * 1000) || [];
      const salaryMin = salaryNums[0];
      const salaryMax = salaryNums[1];

      // Experience labels like "1-3 Years" / "Fresher (0-1 yr)" / "10+ Years"
      const expLabel = first(filters.experience);
      const expNums = String(expLabel).match(/\d+/g)?.map(Number) || [];
      const expMin = expNums[0];
      const expMax = expNums[1];

      const sortMap = {
        "Newest Post": "newest",
        "Oldest Post": "oldest",
        "Rating Post": "newest",
      };

      const params = {
        Keyword: filters.keyword || "",
        Location: filters.locationSingle || first(filters.cities),
        TradeCategory: first(filters.tradeCategories) || first(filters.industries),
        Role: first(filters.roles) || first(filters.role),
        EmploymentType: first(filters.employmentTypes),
        LocationType: first(filters.locationTypes),
        EducationLevel: first(filters.educationLevels),
        SalaryMin: salaryMin,
        SalaryMax: salaryMax,
        ExperienceYearsMin: expMin,
        ExperienceYearsMax: expMax,
        Page: currentPage,
        PageSize: showPerPage,
        Sort: sortMap[sortBy] || "newest",
        // when logged in, backend returns a per-candidate AI match score
        candidateId: getCandidateId() || undefined,
      };

      const response = await searchJobs(params);
      const data = response.data || {};
      const jobsList = (data.jobs || []).map((job) => ({
        ...job,
        // JobCardList reads salaryDisplay; the list API returns salaryRange.
        salaryDisplay: job.salaryDisplay || job.salaryRange,
      }));

      setFilteredJobs(jobsList);
      setTotalFilteredCount(data.totalCount ?? jobsList.length);
    } catch (error) {
      console.error("Failed to load jobs", error);
      setFilteredJobs([]);
      setTotalFilteredCount(0);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadJobs();
  }, [filters, currentPage, showPerPage, sortBy]);

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
                    <li><a className="dropdown-item active" href="#" onClick={(e) => { e.preventDefault(); setSortBy('Newest Post'); }}>Newest Post</a></li>
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy('Oldest Post'); }}>Oldest Post</a></li>
                    <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy('Rating Post'); }}>Rating Post</a></li>
                  </ul>
                </div>
              </div>

              <div className="box-view-type">
                <a
                  className={`view-type ${viewMode === 'list' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setViewMode('list');
                  }}
                >
                  <img src="/assets/imgs/template/icons/icon-list.svg" alt="List" />
                </a>
                <a
                  className={`view-type ${viewMode === 'grid' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setViewMode('grid');
                  }}
                >
                  <img src="/assets/imgs/template/icons/icon-grid-hover.svg" alt="Grid" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

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