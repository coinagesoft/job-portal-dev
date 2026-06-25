'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
// import CandidateProfileInnerNav from '../components/CandidateProfileInnerNav';
import { useToast } from '@/components/Toast';
// import { mockApplicationStatuses } from '../components/data';
import { getMyApplications } from "@/services/candidate/myApplicationsService";

const FILTERS = ['All', 'Applied', 'In Review', 'Shortlisted', 'Interview', 'Rejected'];
const ACK_STORAGE_KEY = 'candidate_application_message_acknowledged';

const STATUS_CLASS_MAP = {
  Applied: 'applied',
  'In Review': 'in-review',
  Shortlisted: 'shortlisted',
  Interview: 'interview',
  Rejected: 'rejected'
};

const BLUE_BADGE_STYLE = {
  backgroundColor: '#e8f0fe',
  color: '#1a56c4',
  border: '1px solid #c7dcff'
};

const BLUE_PILL_STYLE = {
  backgroundColor: '#e8f0fe',
  color: '#1a56c4',
  border: '1px solid #c7dcff'
};

const JOB_LIST_TAG_WRAP_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: 8,
  marginTop: 24,
  marginBottom: 14
};

const JOB_LIST_CARD_STYLE = {
  border: '1px solid rgba(18, 35, 89, 0.08)',
  borderRadius: '24px',
  overflow: 'hidden',
  transition: 'all 0.35s ease',
  background: '#ffffff',
  boxShadow: '0 4px 14px rgba(18,35,89,0.04)'
};

const JOB_LIST_TAG_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 12px',
  borderRadius: 999,
  background: '#EAF4FF',
  border: '1px solid #B9DCFF',
  color: '#1D4ED8',
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
  transition: 'all 0.25s ease',
  cursor: 'pointer'
};

const handleTagHoverEnter = (event) => {
  event.currentTarget.style.background = '#1D4ED8';
  event.currentTarget.style.color = '#ffffff';
  event.currentTarget.style.transform = 'translateY(-1px)';
};

const handleTagHoverLeave = (event) => {
  event.currentTarget.style.background = '#EAF4FF';
  event.currentTarget.style.color = '#1D4ED8';
  event.currentTarget.style.transform = 'translateY(0px)';
};

const handleCardHoverEnter = (event) => {
  event.currentTarget.style.transform = 'translateY(-8px)';
  event.currentTarget.style.border = '1px solid rgba(255, 153, 0, 0.22)';
  event.currentTarget.style.boxShadow = '0 20px 40px rgba(255,153,0,0.12)';
};

const handleCardHoverLeave = (event) => {
  event.currentTarget.style.transform = 'translateY(0px)';
  event.currentTarget.style.border = '1px solid rgba(18, 35, 89, 0.08)';
  event.currentTarget.style.boxShadow = '0 4px 14px rgba(18,35,89,0.04)';
};

const SAVED_JOB_ACTION_BUTTON_STYLE = {
  color: '#ffffff',
  background: '#ff9900',
  border: '1px solid #ff9900',
  transition: 'all 0.25s ease'
};

const handleSavedJobButtonHoverEnter = (event) => {
  event.currentTarget.style.background = '#e68f00';
  event.currentTarget.style.border = '1px solid #e68f00';
  event.currentTarget.style.transform = 'translateY(-1px)';
  event.currentTarget.style.boxShadow = '0 8px 18px rgba(255,153,0,0.22)';
};

const handleSavedJobButtonHoverLeave = (event) => {
  event.currentTarget.style.background = '#ff9900';
  event.currentTarget.style.border = '1px solid #ff9900';
  event.currentTarget.style.transform = 'translateY(0px)';
  event.currentTarget.style.boxShadow = 'none';
};

const getJobDetailsHref = (jobId) =>
  jobId ? `/job-details?jobId=${jobId}` : '/job-details';

const ApplicationStatusCard = ({ application, isAcknowledged, onAcknowledge }) => {
  const statusClass = STATUS_CLASS_MAP[application.status] || 'applied';

  return (
    <div
      className="card-grid-2 hover-up candidate-status-card"
      style={JOB_LIST_CARD_STYLE}
      onMouseEnter={handleCardHoverEnter}
      onMouseLeave={handleCardHoverLeave}
    >
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
          <div className="candidate-status-tags" style={JOB_LIST_TAG_WRAP_STYLE}>
            {application.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={JOB_LIST_TAG_STYLE}
                onMouseEnter={handleTagHoverEnter}
                onMouseLeave={handleTagHoverLeave}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card-block-info">
        <h4>
          <Link href={getJobDetailsHref(application.jobId)}>{application.title}</Link>
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
            <span className={`candidate-status-pill ${statusClass}`} style={BLUE_PILL_STYLE}>
              {application.status}
            </span>
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
              <div className="candidate-status-ack-row">
                <span className={`candidate-status-ack-badge ${isAcknowledged ? 'acknowledged' : 'pending'}`}>
                  {isAcknowledged ? 'Acknowledged' : 'Awaiting acknowledgment'}
                </span>
                {!isAcknowledged && (
                  <button
                    type="button"
                    className="candidate-status-ack-btn"
                    onClick={() => onAcknowledge(application.id, application.company)}
                  >
                    Acknowledge Message
                  </button>
                )}
              </div>
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
              <Link
                className="btn btn-apply-now"
                href={getJobDetailsHref(application.jobId)}
                style={SAVED_JOB_ACTION_BUTTON_STYLE}
                onMouseEnter={handleSavedJobButtonHoverEnter}
                onMouseLeave={handleSavedJobButtonHoverLeave}
              >
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
  const showToast = useToast();
  const candidateId = useSelector((state) => state.auth.user?.userId);
  const [activeFilter, setActiveFilter] = useState('All');
  const [acknowledgedMessages, setAcknowledgedMessages] = useState({});
  const [ackStateReady, setAckStateReady] = useState(false);
  const reminderSignatureRef = useRef('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusSummary = useMemo(() => {
    const activeCount = applications.filter((item) =>
      ['Applied', 'In Review', 'Shortlisted'].includes(item.status)
    ).length;
    const interviewCount = applications.filter((item) => item.status === 'Interview').length;
    const rejectedCount = applications.filter((item) => item.status === 'Rejected').length;

    return [
      { id: 'total', label: 'Total Applications', value: applications.length, tone: 'brand' },
      { id: 'active', label: 'Active Pipeline', value: activeCount, tone: 'active' },
      { id: 'interview', label: 'Interviews', value: interviewCount, tone: 'interview' },
      { id: 'closed', label: 'Closed', value: rejectedCount, tone: 'closed' }
    ];
  }, [applications]);
  const filteredApplications = useMemo(() => {
  if (activeFilter === "All") {
    return applications;
  }

  return applications.filter(
    (item) => item.status === activeFilter
  );
}, [activeFilter, applications]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(ACK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setAcknowledgedMessages(parsed);
        }
      }
    } catch (error) {
      // If storage parsing fails, continue with empty acknowledgment state.
    } finally {
      setAckStateReady(true);
    }
  }, []);

  useEffect(() => {
    const loadApplications = async () => {
      if (!candidateId) {
        setApplications([]);
        return;
      }

      try {
        setLoading(true);

        const response =
          await getMyApplications(candidateId);

        const jobs =
          response?.data?.applications || [];

        const mappedData = jobs.map((item) => ({
          id: item.applicationId,
          jobId: item.jobId || item.jobPostId || item.id || null,
          company: item.companyName,
          title: item.jobTitle,
          location: [item.city, item.state].filter(Boolean).join(', '),
          type: item.employmentType,
          appliedOn: item.appliedTimeAgo,
          updatedOn: item.updatedTimeAgo || item.appliedTimeAgo,
          status: item.applicationStatus,
          stage: item.applicationStage || item.applicationStatus,
          tags: item.tags || [],
          description: item.salaryDisplay,
          recruiterNote: item.recruiterNote || 'Your application is under review.',
          logo:
            item.companyLogoUrl ||
            "/assets/imgs/brands/brand-10.png",
        }));

        setApplications(mappedData);
      } catch (error) {
        console.error(
          "Failed to load applications",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [candidateId]);

  useEffect(() => {
    if (!ackStateReady || typeof window === 'undefined') return;
    window.localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(acknowledgedMessages));
  }, [ackStateReady, acknowledgedMessages]);

  const handleAcknowledge = (applicationId, companyName) => {
    setAcknowledgedMessages((prev) => {
      if (prev[applicationId]) return prev;
      return { ...prev, [applicationId]: true };
    });
    showToast(`Recruiter note acknowledged for ${companyName}.`, 'success');
  };

  useEffect(() => {
    if (!ackStateReady) return;
    const pending = filteredApplications.filter((application) => !acknowledgedMessages[application.id]);

    if (!pending.length) {
      reminderSignatureRef.current = '';
      return;
    }

    const signature = `${activeFilter}:${pending.map((item) => item.id).join(',')}`;
    if (reminderSignatureRef.current === signature) return;
    reminderSignatureRef.current = signature;

    if (pending.length === 1) {
      showToast(
        `Reminder: Please acknowledge recruiter message from ${pending[0].company}.`,
        'warning'
      );
      return;
    }

    showToast(
      `Reminder: ${pending.length} recruiter messages are waiting for acknowledgment.`,
      'warning'
    );
  }, [ackStateReady, acknowledgedMessages, activeFilter, filteredApplications, showToast]);

  const statusCounts = useMemo(() => {
    return FILTERS.reduce((acc, filterName) => {
      if (filterName === 'All') {
        acc[filterName] = applications.length;
      } else {
        acc[filterName] = applications.filter((item) => item.status === filterName).length;
      }
      return acc;
    }, {});
  }, [applications]);

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          {/* <CandidateProfileInnerNav /> */}
          <div className="candidate-inner-panel candidate-application-status-shell">
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
                  <span className="candidate-status-filter-count" style={BLUE_BADGE_STYLE}>
                    {statusCounts[filterName] || 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="row display-list">
              {filteredApplications.map((application) => (
                <div key={application.id} className="col-xl-12 col-12">
                  <ApplicationStatusCard
                    application={application}
                    isAcknowledged={Boolean(acknowledgedMessages[application.id])}
                    onAcknowledge={handleAcknowledge}
                  />
                </div>
              ))}
            </div>

            {loading && (
              <div className="candidate-status-empty">
                <h6>Loading applications...</h6>
              </div>
            )}

            {!loading && filteredApplications.length === 0 && (
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
