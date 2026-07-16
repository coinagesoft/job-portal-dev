'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import JobDetailHero from './components/JobDetailHero';
import JobOverview from './components/JobOverview';
import JobContent from './components/JobContent';
import CompanySidebar from './components/CompanySidebar';
import FeaturedJobs from './components/FeaturedJobs';
import Newsletter from './components/Newsletter';
import { mapApiJobToDetailedJob } from './data';
import { getJobDetails } from '@/services/candidate/jobDetailsService';
import { getMyApplications } from '@/services/candidate/myApplicationsService';
import { getSavedJobs } from '@/services/candidate/savedJobsService';
import JobRequirements from './components/JobRequirements';

const JobDetailsContent = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Single source of truth for "has this candidate applied", shared by the
  // Apply button in the hero AND the Apply button at the bottom of the page —
  // previously each tracked this separately, so one could say "Applied" while
  // the other still showed "Apply now".
  const checkApplied = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await getMyApplications();
      const ids = (res?.data?.applications || []).map((a) => a.jobId);
      setIsApplied(ids.includes(jobId));
    } catch (error) {
      console.log('applied check skipped', error?.message || error);
    }
  }, [jobId]);

  const checkSaved = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await getSavedJobs();
      const list = res?.data?.savedJobs || [];
      const ids = list.map((j) => j.jobId).filter(Boolean);
      setIsSaved(ids.includes(jobId));
    } catch (error) {
      console.log('saved check skipped', error?.message || error);
    }
  }, [jobId]);

  useEffect(() => {
    const loadJobDetails = async () => {
      setLoading(true);
      setNotFound(false);
  
      if (!jobId) {
        setJob(null);
        setNotFound(true);
        setLoading(false);
        return;
      }
  
      try {
        const response = await getJobDetails(jobId);
        if (!response?.data) {
          setJob(null);
          setNotFound(true);
        } else {
          setJob(mapApiJobToDetailedJob(response.data));
        }
      } catch (error) {
        console.error('Failed to load job details', error);
        setJob(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
  
    loadJobDetails();
    checkApplied();
    checkSaved();
  }, [jobId, checkApplied, checkSaved]);

  if (loading) {
    return (
      <main className="main">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <p>Loading job details…</p>
        </div>
      </main>
    );
  }

  if (notFound || !job) {
    return (
      <main className="main">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h4>Job not found</h4>
          <p>This job may have been removed or the link is incorrect.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <JobDetailHero
        job={job}
        isApplied={isApplied}
        onApplied={checkApplied}
        isSaved={isSaved}
        onSavedToggle={checkSaved}
      />
      <section className="section-box mt-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12 col-sm-12 col-12">
              <JobOverview job={job} />

              <JobRequirements job={job} />

              <JobContent
  job={job}
  isApplied={isApplied}
  onApplied={checkApplied}
  isSaved={isSaved}
  onSavedToggle={checkSaved}
/>
            </div>
            <div className="col-lg-4 col-md-12 col-sm-12 col-12 pl-40 pl-lg-15 mt-lg-30">
              <CompanySidebar job={job} />
            </div>
          </div>
        </div>
      </section>
      {/* <FeaturedJobs similarJobs={job.similarJobs || []} /> */}
      {/* <Newsletter /> */}
    </main>
  );
};

const JobDetailsPage = () => (
  <Suspense fallback={null}>
    <JobDetailsContent />
  </Suspense>
);

export default JobDetailsPage;