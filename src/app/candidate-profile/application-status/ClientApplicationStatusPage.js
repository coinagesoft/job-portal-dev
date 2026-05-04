'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// import CandidateProfileInnerNav from '../components/CandidateProfileInnerNav';
import { mockApplicationStatuses } from '../components/data';

const FILTERS = ['All', 'Applied', 'In Review', 'Shortlisted', 'Interview', 'Rejected'];

const STATUS_CLASS_MAP = {
  Applied: 'applied',
  'In Review': 'in-review',
  Shortlisted: 'shortlisted',
  Interview: 'interview',
  Rejected: 'rejected'
};

const ApplicationStatusCard = ({ application }) => {
  const statusClass = STATUS_CLASS_MAP[application.status] || 'applied';

  return (
    <div className="card-grid-2 hover-up candidate-status-card">
      <div className="row">
        <div className="col-lg-7 col-md-7 col-sm-12">
          <div className="card-grid-2-image-left">
            <div className="image-box">
              <Image src={application.logo} alt={application.company} width={60} height={60} />
            </div>
            <div className="right-info">
              <Link className="name-job" href="/company-details">
                {application.company}
              </Link>
              <span className="location-small">{application.location}</span>
            </div>
          </div>
        </div>
        <div className="col-lg-5 col-md-5 col-sm-12 text-start text-md-end">
          <div className="candidate-status-tags">
            {application.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="btn btn-grey-small mr-5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card-block-info">
        <h4>
          <Link href="/job-details">{application.title}</Link>
        </h4>
        <div className="mt-5">
          <span className="card-briefcase">{application.type}</span>
          <span className="card-time">
            <span>Applied: {application.appliedOn}</span>
          </span>
        </div>
        <p className="font-sm color-text-paragraph mt-10">{application.description}</p>

        <div className="candidate-status-meta mt-20">
          <div className="candidate-status-headline">
            <div>
              <span className="candidate-status-label">Current Stage</span>
              <h6 className="candidate-status-stage">{application.stage}</h6>
            </div>
            <span className={`candidate-status-pill ${statusClass}`}>{application.status}</span>
          </div>
          <div className="candidate-status-row">
            <span className="candidate-status-date">Applied: {application.appliedOn}</span>
            <span className="candidate-status-date">Updated: {application.updatedOn}</span>
          </div>

          <div className="candidate-status-insight">
            <div className="candidate-status-note">
              <div className="candidate-status-note-head">
                <span className="candidate-status-note-label">Recruiter Note</span>
                <span className="candidate-status-note-date">Updated {application.updatedOn}</span>
              </div>
              <p className="candidate-status-note-text">{application.recruiterNote}</p>
            </div>
          </div>
        </div>

        <div className="card-2-bottom mt-20">
          <div className="row">
            <div className="col-lg-7 col-7">
              {/* <span className="card-text-price">{application.price}</span>
              <span className="text-muted">{application.priceUnit}</span> */}
            </div>
            <div className="col-lg-5 col-5 text-end">
              <Link className="btn btn-apply-now" href="/job-details">
                View Job
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientApplicationStatusPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const statusSummary = useMemo(() => {
    const activeCount = mockApplicationStatuses.filter((item) =>
      ['Applied', 'In Review', 'Shortlisted'].includes(item.status)
    ).length;
    const interviewCount = mockApplicationStatuses.filter((item) => item.status === 'Interview').length;
    const rejectedCount = mockApplicationStatuses.filter((item) => item.status === 'Rejected').length;

    return [
      { id: 'total', label: 'Total Applications', value: mockApplicationStatuses.length, tone: 'brand' },
      { id: 'active', label: 'Active Pipeline', value: activeCount, tone: 'active' },
      { id: 'interview', label: 'Interviews', value: interviewCount, tone: 'interview' },
      { id: 'closed', label: 'Closed', value: rejectedCount, tone: 'closed' }
    ];
  }, []);

  const filteredApplications = useMemo(() => {
    if (activeFilter === 'All') return mockApplicationStatuses;
    return mockApplicationStatuses.filter((item) => item.status === activeFilter);
  }, [activeFilter]);

  const statusCounts = useMemo(() => {
    return FILTERS.reduce((acc, filterName) => {
      if (filterName === 'All') {
        acc[filterName] = mockApplicationStatuses.length;
      } else {
        acc[filterName] = mockApplicationStatuses.filter((item) => item.status === filterName).length;
      }
      return acc;
    }, {});
  }, []);

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          {/* <CandidateProfileInnerNav /> */}
          <div className="candidate-inner-panel">
            <h3 className="mt-0 color-brand-1 mb-20">My Application Status</h3>
            <p className="font-md color-text-paragraph-2 mb-30">
              Track every application stage from submission to interview and final decision.
            </p>

            <div className="candidate-status-overview mb-25">
              {statusSummary.map((item) => (
                <div key={item.id} className={`candidate-status-overview-card ${item.tone}`}>
                  <span className="candidate-status-overview-label">{item.label}</span>
                  <strong className="candidate-status-overview-value">{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="candidate-status-filter mb-30">
              {FILTERS.map((filterName) => (
                <button
                  key={filterName}
                  type="button"
                  className={`candidate-status-filter-btn ${activeFilter === filterName ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filterName)}
                >
                  <span>{filterName}</span>
                  <span className="candidate-status-filter-count">{statusCounts[filterName] || 0}</span>
                </button>
              ))}
            </div>

            <div className="row display-list">
              {filteredApplications.map((application) => (
                <div key={application.id} className="col-xl-12 col-12">
                  <ApplicationStatusCard application={application} />
                </div>
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="candidate-status-empty">
                <h6>No applications found for this status</h6>
                <p className="font-sm color-text-paragraph-2">Try another filter to view your applications.</p>
              </div>
            )}

            <div className="paginations">
              <ul className="pager">
                <li><a className="pager-prev" href="#"></a></li>
                <li><a className="pager-number active" href="#">1</a></li>
                <li><a className="pager-number" href="#">2</a></li>
                <li><a className="pager-number" href="#">3</a></li>
                <li><a className="pager-next" href="#"></a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ClientApplicationStatusPage;
