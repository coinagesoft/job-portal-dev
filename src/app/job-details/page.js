'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import JobDetailHero from './components/JobDetailHero';
import JobOverview from './components/JobOverview';
import JobContent from './components/JobContent';
import CompanySidebar from './components/CompanySidebar';
import FeaturedJobs from './components/FeaturedJobs';
import Newsletter from './components/Newsletter';
import { detailedJob, mapApiJobToDetailedJob } from './data';
import { getJobDetails } from '@/services/candidate/jobDetailsService';

const JobDetailsPage = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [job, setJob] = useState(detailedJob);

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!jobId) {
        setJob(detailedJob);
        return;
      }

      try {
        const response = await getJobDetails(jobId);
        setJob(mapApiJobToDetailedJob(response?.data || {}));
      } catch (error) {
        console.error('Failed to load job details', error);
        setJob(detailedJob);
      }
    };

    loadJobDetails();
  }, [jobId]);

  return (
    <main className="main">
      <JobDetailHero job={job} />
      <section className="section-box mt-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12 col-sm-12 col-12">
              <JobOverview job={job} />
              <JobContent job={job} />
            </div>
            <div className="col-lg-4 col-md-12 col-sm-12 col-12 pl-40 pl-lg-15 mt-lg-30">
              <CompanySidebar job={job} />
            </div>
          </div>
        </div>
      </section>
      <FeaturedJobs />
      <Newsletter />
    </main>
  );
};

export default JobDetailsPage;
