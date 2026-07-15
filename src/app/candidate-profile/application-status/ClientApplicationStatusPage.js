'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
// import CandidateProfileInnerNav from '../components/CandidateProfileInnerNav';
import { useToast } from '@/components/Toast';
// import { mockApplicationStatuses } from '../components/data';
import { getMyApplications } from "@/services/candidate/myApplicationsService";
import { acknowledgeNote, withdrawApplication } from "@/services/candidate/applicationActionsService";

const FILTERS = ['All', 'Applied', 'In Review', 'Shortlisted', 'Interview', 'Rejected', 'Withdrawn'];
const ACK_STORAGE_KEY = 'candidate_application_message_acknowledged';

const STATUS_CLASS_MAP = {
  Applied: 'applied',
  'In Review': 'in-review',
  Shortlisted: 'shortlisted',
  Interview: 'interview',
  Rejected: 'rejected',
  Withdrawn: 'withdrawn',
};

const STATUS_COLOR_MAP = {
  Applied: { bg: '#eef1f8', color: '#3a4a7a', border: '#d7ddef' },
  'In Review': { bg: '#fff6e6', color: '#a86a00', border: '#ffe3ad' },
  Shortlisted: { bg: '#e9f7ef', color: '#1c7a45', border: '#c3ebd3' },
  Interview: { bg: '#e8f0fe', color: '#1a56c4', border: '#c7dcff' },
  Rejected: { bg: '#fdecec', color: '#b23b3b', border: '#f5c9c9' },
  Withdrawn: { bg: '#f1f2f5', color: '#6b7280', border: '#e2e4e9' },
};


const CARD_STYLE = {
  border: '1px solid rgba(18, 35, 89, 0.08)',
  borderRadius: '16px',
  background: '#ffffff',
  boxShadow: '0 2px 8px rgba(18,35,89,0.04)',
  transition: 'all 0.25s ease',
  padding: '20px 22px',
  marginBottom: 12
};

const handleCardHoverEnter = (event) => {
  event.currentTarget.style.border = '1px solid rgba(255, 153, 0, 0.22)';
  event.currentTarget.style.boxShadow = '0 8px 20px rgba(255,153,0,0.10)';
};

const handleCardHoverLeave = (event) => {
  event.currentTarget.style.border = '1px solid rgba(18, 35, 89, 0.08)';
  event.currentTarget.style.boxShadow = '0 2px 8px rgba(18,35,89,0.04)';
};

const TAG_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 9px',
  borderRadius: 999,
  background: '#f4f6fb',
  border: '1px solid #e3e7f1',
  color: '#4a5578',
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1.6,
  whiteSpace: 'nowrap'
};

const ACTION_BTN_STYLE = {
  fontSize: 12,
  fontWeight: 600,
  padding: '5px 12px',
  borderRadius: 8,
  border: '1px solid transparent',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};

const iconMap = {
  industry: '/assets/imgs/page/job-single/industry.svg',
  jobLevel: '/assets/imgs/page/job-single/job-level.svg',
  salary: '/assets/imgs/page/job-single/salary.svg',
  experience: '/assets/imgs/page/job-single/experience.svg',
  jobType: '/assets/imgs/page/job-single/job-type.svg',
  deadline: '/assets/imgs/page/job-single/deadline.svg',
  updated: '/assets/imgs/page/job-single/updated.svg',
  location: '/assets/imgs/page/job-single/location.svg',
};

const getJobDetailsHref = (jobId) =>
  jobId ? `/job-details?jobId=${jobId}` : '/job-details';


const formatEmploymentType = (type) => {
  if (!type) return "";

  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// ---- Custom confirmation modal (replaces window.confirm) ----
// Styled with the site's own tokens/classes (see apply-job-modal-shell,
// candidate-settings-actions .btn, and the Rejected status colors above)
// instead of one-off inline styles.
const WithdrawConfirmModal = ({ open, companyName, onConfirm, onCancel, isSubmitting }) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-confirm-title"
      className="withdraw-confirm-backdrop"
      onClick={onCancel}
    >
      <div
        className="withdraw-confirm-modal-shell"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="withdraw-confirm-icon">!</div>

        <h4 id="withdraw-confirm-title" className="withdraw-confirm-title">
          Withdraw this application?
        </h4>
        <p className="withdraw-confirm-body font-sm color-text-paragraph-2">
          {companyName
            ? `You're about to withdraw your application to ${companyName}. This can't be undone.`
            : "You're about to withdraw this application. This can't be undone."}
        </p>

        <div className="withdraw-confirm-actions">
          <button
            type="button"
            className="btn btn-default withdraw-confirm-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger withdraw-confirm-btn"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Withdrawing…' : 'Withdraw'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .withdraw-confirm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 35, 89, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .withdraw-confirm-modal-shell {
          width: 100%;
          max-width: 400px;
          background: var(--color-background-primary);
          border: 1px solid var(--border-light);
          border-radius: 16px;
          box-shadow:
            0 22px 44px rgba(18, 35, 89, 0.16),
            0 8px 18px rgba(18, 35, 89, 0.08);
          padding: 24px;
          font-family: var(--font-family-base);
        }

        .withdraw-confirm-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #fdecec;
          color: #b23b3b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-xl);
          font-weight: 700;
          margin-bottom: 14px;
        }

        .withdraw-confirm-title {
          margin: 0;
          font-size: var(--font-h6);
          color: var(--text-dark);
          line-height: var(--lh-tight);
        }

        .withdraw-confirm-body {
          margin-top: 8px;
          margin-bottom: 0;
          color: var(--text-mid);
        }

        .withdraw-confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        .withdraw-confirm-btn.btn {
          min-width: 96px;
          min-height: 46px;
          border-radius: 12px;
          font-size: var(--font-sm);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .withdraw-confirm-btn.btn-default {
          border: 1px solid rgba(18, 35, 89, 0.2);
          background: var(--color-background-primary);
          color: var(--text-dark);
        }

        .withdraw-confirm-btn.btn-default:hover:not(:disabled) {
          border-color: var(--primary-navy);
          background: var(--primary-navy);
          color: #ffffff;
          transform: translateY(-2px);
        }

        .withdraw-confirm-btn.btn-danger {
          border: 1px solid #b23b3b;
          background: linear-gradient(180deg, #d05c5c 0%, #b23b3b 100%);
          color: #ffffff;
          box-shadow: 0 10px 22px rgba(178, 59, 59, 0.22);
        }

        .withdraw-confirm-btn.btn-danger:hover:not(:disabled) {
          background: linear-gradient(180deg, #c14a4a 0%, #9e3232 100%);
          border-color: #9e3232;
          transform: translateY(-2px);
          box-shadow: 0 14px 26px rgba(178, 59, 59, 0.28);
        }

        .withdraw-confirm-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none !important;
        }
      `}</style>
    </div>
  );
};

const ApplicationStatusCard = ({ application, isAcknowledged, onAcknowledge, onWithdraw }) => {
  const [noteExpanded, setNoteExpanded] = useState(false);
  const statusClass = STATUS_CLASS_MAP[application.status] || 'applied';
  const statusColors = STATUS_COLOR_MAP[application.status] || STATUS_COLOR_MAP.Applied;
  const canWithdraw = onWithdraw && !['Rejected', 'Hired', 'Withdrawn'].includes(application.status);

  return (
    <div
      className={`hover-up candidate-status-card ${statusClass}`}
      style={CARD_STYLE}
      onMouseEnter={handleCardHoverEnter}
      onMouseLeave={handleCardHoverLeave}
    >
      {/* Top row: logo, company, title, status pill */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            overflow: 'hidden',
            flexShrink: 0,
            border: '1px solid rgba(18,35,89,0.06)'
          }}
        >
          <Image src={application.logo} alt={application.company} width={44} height={44} style={{ objectFit: 'cover' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
<div style={{ flex: 1 }}>
  <h4
    style={{
      fontSize: 17,
      margin: 0,
      lineHeight: 1.3,
      color: "#122359",
    }}
  >
    <Link
      href={getJobDetailsHref(application.jobId)}
      style={{ color: "#122359" }}
    >
      {application.title}
    </Link>
  </h4>

  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
    <img
      src={iconMap.industry}
      alt="Company"
      width={14}
      height={14}
    />
    <span style={{ fontSize: 13, color: "#4a5578", fontWeight: 500 }}>
      {application.company}
    </span>
  </div>
</div>

            <span
              style={{
                display: "inline-block",
                // marginTop: 8,
                ...TAG_STYLE,
                background: "#FFF8EA",
                color: "#B26B00",
                padding: "6px 12px",
              }}
            >
              Applied {application.appliedOn}
            </span>
            <span
              style={{
                ...TAG_STYLE,
                background: statusColors.bg,
                color: statusColors.color,
                border: `1px solid ${statusColors.border}`,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                minWidth: 90,
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {application.status}
            </span>
          </div>

          <div style={{
  display: 'flex', alignItems: 'center', gap: 12,
  marginTop: 12, flexWrap: 'wrap'
}}>
  {/* <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <img
      src={iconMap.industry}
      alt="Company"
      width={16}
      height={16}
    />
    <span>{application.company}</span>
  </div> */}

  {application.location && (
    <span style={{ fontSize: 12, color: '#8891ab' }}> {application.location}</span>
  )}
  {/* {application.type && (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <img
        src={iconMap.jobType}
        alt="Job Type"
        width={16}
        height={16}
      />
     <span>{formatEmploymentType(application.type)}</span>
    </div>
  )} */}
</div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 14,
              marginBottom: 12,
              gap: 10,
            }}
          >
            {application.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  ...TAG_STYLE,
                  background: "#EEF5FF",
                  color: "#0B5ED7",
                  border: "1px solid #CFE2FF",
                  padding: "4px 10px",
                  fontSize: 11,
                }}
              >
                {tag}
              </span>

            ))}
          </div>
          <div
            style={{
              marginTop: 12,
            }}
          >

          </div>
        </div>
      </div>


      {/* Meta line: stage, tags, dates */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {/* <span style={{ fontSize: 11.5, color: '#8891ab' }}>Stage:</span> */}
        {/* <span style={{ fontSize: 12, fontWeight: 600, color: '#122359', marginRight: 4 }}>
          {application.stage}
        </span> */}

        {/* <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#8891ab' }}>
          Applied {application.appliedOn} · Updated {application.updatedOn}
        </span> */}
      </div>

      {/* Recruiter note: conditional display, centered when empty */}
      {application.recruiterNote ? (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 14,
            background: "#F8FAFD",
            border: "1px solid #EDF2F7",
            paddingTop: 10,
            borderTop: '1px solid rgba(18,35,89,0.06)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontWeight: 700,
              color: "#122359",
              marginBottom: 8,
              fontSize: 13,
            }}>
              Recruiter note:
            </span>
            <span
              style={{
                fontSize: 12.5,
                color: '#4a5578',
                display: noteExpanded ? 'inline' : 'inline-block',
                maxWidth: noteExpanded ? 'none' : '100%',
                overflow: noteExpanded ? 'visible' : 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: noteExpanded ? 'normal' : 'nowrap',
                verticalAlign: 'bottom'
              }}
            >
              {application.recruiterNote}
            </span>
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color: "#8891ab",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>Updated {application.updatedOn}</span>
            </div>
            {application.recruiterNote.length > 60 && (
              <button
                type="button"
                onClick={() => setNoteExpanded((v) => !v)}
                style={{
                  marginLeft: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#ff9900',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: "6px 14px",
                }}
              >
                {noteExpanded ? 'Hide' : 'View'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 ,justifyContent:"center" }}>
            {canWithdraw && (
              <button
                type="button"
                style={{ ...ACTION_BTN_STYLE, background: 'transparent', color: '#b23b3b', border: '1px solid #e89999' }}
                onClick={() => onWithdraw(application.id, application.company)}
              >
                Withdraw
              </button>
            )}

            <Link
              href={getJobDetailsHref(application.jobId)}
              style={{ ...ACTION_BTN_STYLE, background: '#ff9900', color: '#fff', display: 'inline-block' }}
            >
              View Job
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: 18,
            padding: "12px 16px",
            borderRadius: 14,
            background: "#F8FAFD",
            border: "1px solid #EDF2F7",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#8891ab",
              fontWeight: 500,
            }}
          >
            Updated {application.updatedOn}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {canWithdraw && (
              <button
                type="button"
                style={{ ...ACTION_BTN_STYLE, background: 'transparent', color: '#b23b3b', border: '1px solid #e89999' }}
                onClick={() => onWithdraw(application.id, application.company)}
              >
                Withdraw
              </button>
            )}

            <Link
              href={getJobDetailsHref(application.jobId)}
              style={{ ...ACTION_BTN_STYLE, background: '#ff9900', color: '#fff', display: 'inline-block' }}
            >
              View Job
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const ClientApplicationStatusPage = () => {
  const showToast = useToast();
  const candidateId = useSelector((state) => state.auth.user?.userId);
  const [activeFilter, setActiveFilter] = useState('All');
  const [acknowledgedMessages, setAcknowledgedMessages] = useState({});
  const [ackStateReady, setAckStateReady] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Withdraw confirmation modal state (replaces window.confirm)
  const [withdrawTarget, setWithdrawTarget] = useState(null); // { applicationId, companyName } | null
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  const statusSummary = useMemo(() => {
    const activeCount = applications.filter((item) =>
      ['Applied', 'In Review', 'Shortlisted'].includes(item.status)
    ).length;
    const interviewCount = applications.filter((item) => item.status === 'Interview').length;
   const rejectedCount = applications.filter((item) =>
  ['Rejected', 'Withdrawn'].includes(item.status)
).length;

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
          await getMyApplications();

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
          recruiterNote: item.note || null,
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

  const handleAcknowledge = async (applicationId, companyName) => {
    // Optimistically mark acknowledged (also cached in localStorage), then persist.
    setAcknowledgedMessages((prev) => {
      if (prev[applicationId]) return prev;
      return { ...prev, [applicationId]: true };
    });
    try {
      await acknowledgeNote(applicationId);
      showToast(`Recruiter note acknowledged for ${companyName}.`, 'success');
    } catch (error) {
      console.error('Failed to acknowledge note', error);
      showToast('Could not save acknowledgment. Please try again.', 'error');
    }
  };

  // Step 1: clicking "Withdraw" on a card just opens the confirmation modal.
  const handleWithdrawRequest = (applicationId, companyName) => {
    setWithdrawTarget({ applicationId, companyName });
  };

  const handleWithdrawCancel = () => {
    if (withdrawSubmitting) return;
    setWithdrawTarget(null);
  };

  // Step 2: only runs once the user confirms in the modal.
  const handleWithdrawConfirm = async () => {
  if (!withdrawTarget) return;
  const { applicationId, companyName } = withdrawTarget;

  setWithdrawSubmitting(true);
  try {
    await withdrawApplication(applicationId);
    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId ? { ...a, status: 'Withdrawn' } : a
      )
    );
    showToast(`Application to ${companyName} withdrawn.`, 'success');
    setWithdrawTarget(null);
  } catch (error) {
    console.error('Failed to withdraw application', error);
    showToast(
      error?.response?.data?.message || 'Could not withdraw application.',
      'error',
    );
  } finally {
    setWithdrawSubmitting(false);
  }
};


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
                  <span className="candidate-status-filter-count" style={{ backgroundColor: '#e8f0fe', color: '#1a56c4', border: '1px solid #c7dcff' }}>
                    {statusCounts[filterName] || 0}
                  </span>
                </button>
              ))}
            </div>

            <div>
              {filteredApplications.map((application) => (
                <ApplicationStatusCard
                  key={application.id}
                  application={application}
                  isAcknowledged={Boolean(acknowledgedMessages[application.id])}
                  onAcknowledge={handleAcknowledge}
                  onWithdraw={handleWithdrawRequest}
                />
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

      <WithdrawConfirmModal
        open={Boolean(withdrawTarget)}
        companyName={withdrawTarget?.companyName}
        onConfirm={handleWithdrawConfirm}
        onCancel={handleWithdrawCancel}
        isSubmitting={withdrawSubmitting}
      />
    </main>
  );
};

export default ClientApplicationStatusPage;