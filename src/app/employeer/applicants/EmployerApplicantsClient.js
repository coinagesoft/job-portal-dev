"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useToast } from "@/components/Toast";

const applicantStatusTabs = [
  { label: "All", count: 12, isActive: true },
  { label: "Applied", count: 5, isActive: false },
  { label: "Viewed", count: 2, isActive: false },
  { label: "Shortlisted", count: 3, isActive: false },
  { label: "Schedule Interview", count: 1, isActive: false },
  { label: "On hold", count: 1, isActive: false },
  { label: "Rejected", count: 1, isActive: false },
];

const screeningFilters = [
  { label: "Experience 3+ years", isActive: true, toneClass: "is-success" },
  { label: "Relocation ready", isActive: false, toneClass: "is-info" },
  { label: "Notice period <= 30 days", isActive: false, toneClass: "is-brand" },
  { label: "Mandatory answers complete", isActive: false, toneClass: "is-warning" },
];

const applicants = [
  {
    id: "app-ramesh-k-sharma",
    name: "Ramesh K. Sharma",
    meta: "Welder | 8 yrs | Mumbai | Applied 4 Apr 2026",
    matchScore: "AI Match 92%",
    endClientName: "Bharat Offshore Ltd.",
    profileTags: [
      { label: "6G Certified", toneClass: "is-brand" },
      { label: "Relocation: Yes", toneClass: "is-info" },
      { label: "Notice: 20 days", toneClass: "is-success" },
    ],
    certificates: ["Welding Cert (6G)", "Safety Certificate", "Medical Fitness"],
    screeningAnswers: [
      { label: "Experience 3+ years", value: "Yes", toneClass: "is-success" },
      { label: "Relocation", value: "Yes", toneClass: "is-info" },
      { label: "Mandatory questions", value: "Completed", toneClass: "is-brand" },
    ],
    status: "Applied",
    statusClass: "is-applied",
    isShortlisted: false,
    companyAddress: "406, Maritime House, Ballard Estate, Mumbai – 400 001",
  },
  {
    id: "app-vijay-patil",
    name: "Vijay Patil",
    meta: "Welder | 6 yrs | Pune | Applied 3 Apr 2026",
    matchScore: "AI Match 85%",
    endClientName: "Gulf Steel Works LLC",
    profileTags: [
      { label: "MIG Specialist", toneClass: "is-brand" },
      { label: "Relocation: No", toneClass: "is-muted" },
      { label: "Notice: 45 days", toneClass: "is-warning" },
    ],
    certificates: ["ITI Certificate", "MIG Welding License"],
    screeningAnswers: [
      { label: "Experience 3+ years", value: "Yes", toneClass: "is-success" },
      { label: "Relocation", value: "No", toneClass: "is-muted" },
      { label: "Mandatory questions", value: "Completed", toneClass: "is-brand" },
    ],
    status: "Viewed",
    statusClass: "is-viewed",
    isShortlisted: false,
    companyAddress: "Plot 12, Industrial Area, Pune – 411 014",
  },
  {
    id: "app-amit-desai",
    name: "Amit Desai",
    meta: "Welder | 10 yrs | Navi Mumbai | Applied 2 Apr 2026",
    matchScore: "AI Match 96%",
    endClientName: "Larsen & Toubro Energy",
    profileTags: [
      { label: "Pipe Fabrication", toneClass: "is-brand" },
      { label: "Relocation: Yes", toneClass: "is-info" },
      { label: "Notice: 15 days", toneClass: "is-success" },
    ],
    certificates: ["AWS D1.1 Certified", "CSWIP 3.1", "Medical Fit", "Safety Induction"],
    screeningAnswers: [
      { label: "Experience 3+ years", value: "Yes", toneClass: "is-success" },
      { label: "Relocation", value: "Yes", toneClass: "is-info" },
      { label: "Mandatory questions", value: "Completed", toneClass: "is-brand" },
    ],
    status: "Shortlisted",
    statusClass: "is-shortlisted",
    isShortlisted: true,
    companyAddress: "MIDC Industrial Estate, Navi Mumbai – 400 705",
  },
];

const STATUS_OPTIONS = ["Applied", "Shortlisted", "Schedule Interview", "On hold", "Rejected"];

const actionClassMap = {
  Accept: "btn btn-default btn-sm mr-10 mb-10",
  Select: "btn btn-default btn-sm mr-10 mb-10",
  Hold: "btn btn-grey-small btn-sm mr-10 mb-10",
  Reject: "btn btn-grey-small btn-sm mr-10 mb-10",
};

/* ─── Popup Modal ────────────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
  }}>
    <div style={{ background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "540px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "90vh", overflow: "auto" }}>
      <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h5 style={{ margin: 0, color: "#122359", fontSize: "15px" }}>{title}</h5>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#666" }}>×</button>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>{children}</div>
    </div>
  </div>
);

const EmployerApplicantsClient = () => {
  const showToast = useToast();
  const [applicantList, setApplicantList] = useState(applicants);
  const [credits, setCredits] = useState(20); // demo credit balance
  const [questionPopup, setQuestionPopup] = useState(null); // applicant id
  const [statusPopup, setStatusPopup] = useState(null);   // applicant id
  const [selectedStatus, setSelectedStatus] = useState("");
  const [mapPopup, setMapPopup] = useState(null); // applicant

  const updateStatus = (id, newStatus) => {
    setApplicantList(prev =>
      prev.map(a => a.id === id
        ? { ...a, status: newStatus, isShortlisted: newStatus === "Shortlisted" || newStatus === "Schedule Interview" }
        : a
      )
    );
    showToast(`Status updated to: ${newStatus}`, "success");
    setStatusPopup(null);
  };

  const handleDownloadCV = (applicant) => {
    if (credits <= 0) {
      showToast("Insufficient credits. Please buy more credits.", "error");
      return;
    }
    setCredits(c => c - 1);
    showToast(`CV downloaded for ${applicant.name}. 1 credit deducted. Balance: ${credits - 1}`, "info");
  };

  const activeQuestionApplicant = applicantList.find(a => a.id === questionPopup);
  const activeStatusApplicant = applicantList.find(a => a.id === statusPopup);

  return (
    <main className="main employer-applicants-page">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">

            {/* Credit balance banner */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", padding: "10px 16px", background: "#fef9ec", border: "1px solid #fcd34d", borderRadius: "8px" }}>
              <i className="fi fi-sr-bolt" style={{ color: "#f59e0b" }}></i>
              <span className="font-sm" style={{ color: "#92400e" }}>
                <strong>CV Download Credits:</strong> {credits} remaining — 1 credit deducted per CV download
              </span>
              <Link href="/employeer/buy-credits" className="btn btn-border btn-xs ml-auto" style={{ marginLeft: "auto" }}>Buy Credits</Link>
            </div>

            <div className="box-filters-job">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h3 className="mb-5">Applicants</h3>
                  <span className="font-sm color-text-paragraph-2">Welder 6G - Mumbai</span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <Link className="btn btn-border btn-sm mr-10 mb-10" href="/employeer/job-list">Back to Job list</Link>
                  <Link className="btn btn-default btn-sm mr-10 mb-10" href="/dashboard/post-job">Edit Job</Link>
                  <span className="badge bg-primary">12 Applicants</span>
                </div>
              </div>
            </div>

            <div className="candidate-status-filter mt-20 mb-20">
              {applicantStatusTabs.map((tab) => (
                <button key={tab.label} className={`candidate-status-filter-btn ${tab.isActive ? "active" : ""}`} type="button">
                  <span>{tab.label}</span>
                  <span className="candidate-status-filter-count">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="box-filters-job mb-20 employer-applicants-form">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h6 className="mb-5">Filter Applicants</h6>
                  <span className="font-sm color-text-paragraph-2">Use candidate profile filters to shortlist faster.</span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <button className="btn btn-border btn-sm mr-10 mb-10" type="button" onClick={() => showToast("Filters reset.", "info")}>Reset</button>
                  <button className="btn btn-default btn-sm mb-10" type="button" onClick={() => showToast("Filters applied.", "success")}>Apply Filters</button>
                </div>
              </div>
              <div className="employer-applicants-filter-tags">
                {screeningFilters.map((filter) => (
                  <button key={filter.label} className={`employer-applicants-tag ${filter.toneClass} ${filter.isActive ? "is-active" : ""}`} type="button">{filter.label}</button>
                ))}
              </div>
            </div>

            <div className="box-list-jobs display-list">
              {applicantList.map((applicant) => (
                <div className="col-xl-12 col-12" key={applicant.id}>
                  <div className="card-grid-2 hover-up">
                    <div className="card-block-info pt-20">
                      <div className="row">
                        <div className="col-lg-8 col-md-12 col-sm-12">
                          <div className="card-grid-2-image-left">
                            <div className="image-box">
                              <img src="/assets/imgs/page/candidates/candidate-profile.png" alt={applicant.name} />
                            </div>
                            <div className="right-info">
                              <Link className="name-job" href="/employeer/candidate-profile">{applicant.name}</Link>
                              <span className="location-small">{applicant.meta}</span>

                              {/* End Client Name (visible always) */}
                              <div style={{ marginTop: "4px" }}>
                                <span className="font-xs" style={{ color: "#555" }}>
                                  <strong>End Client:</strong> {applicant.endClientName}
                                </span>
                              </div>

                              <div className="employer-applicants-tag-row mt-10">
                                <span className="employer-applicants-tag is-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                  <i className="fi fi-sr-bolt" style={{ fontSize: "10px" }}></i> {applicant.matchScore}
                                </span>
                                {applicant.profileTags.map((tag) => (
                                  <span key={`${applicant.id}-${tag.label}`} className={`employer-applicants-tag ${tag.toneClass}`}>{tag.label}</span>
                                ))}
                              </div>

                              {/* Certificates */}
                              <div style={{ marginTop: "8px" }}>
                                <span className="font-xs color-text-paragraph-2" style={{ marginRight: "6px" }}>Certificates:</span>
                                {applicant.certificates.map((cert) => (
                                  <span key={cert} style={{ display: "inline-block", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "2px 8px", fontSize: "11px", marginRight: "5px", marginBottom: "4px" }}>{cert}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-4 col-md-12 col-sm-12 text-lg-end mt-md-15 mt-sm-15">
                          <span className={`employer-applicants-status ${applicant.statusClass}`}>{applicant.status}</span>
                          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                            {/* Download CV — deducts credit */}
                            <button className="btn btn-border btn-sm" type="button" onClick={() => handleDownloadCV(applicant)}>
                              ⬇ Download CV
                            </button>
                            {/* Change Status popup */}
                            <button className="btn btn-grey-small btn-sm" type="button" onClick={() => { setStatusPopup(applicant.id); setSelectedStatus(applicant.status); }}>
                              Change Status
                            </button>
                            {/* View Screening Answers popup */}
                            <button className="btn btn-border btn-sm" type="button" onClick={() => setQuestionPopup(applicant.id)}>
                              View Questions
                            </button>
                            {/* Map — only show address if shortlisted */}
                            {/* <button className="btn btn-border btn-sm" type="button"
                              onClick={() => {
                                if (!applicant.isShortlisted) {
                                  showToast("Company address is revealed only after candidate is shortlisted.", "warning");
                                } else {
                                  setMapPopup(applicant);
                                }
                              }}>
                              📍 View Location
                            </button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Screening Questions Popup */}
      {questionPopup && activeQuestionApplicant && (
        <Modal title={`Screening Answers — ${activeQuestionApplicant.name}`} onClose={() => setQuestionPopup(null)}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Question</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Answer</th>
              </tr>
            </thead>
            <tbody>
              {activeQuestionApplicant.screeningAnswers.map((a, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 12px", fontSize: "13px", color: "#374151" }}>{a.label}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className={`employer-applicants-tag ${a.toneClass}`}>{a.value}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {/* Change Status Popup */}
      {statusPopup && activeStatusApplicant && (
        <Modal title={`Change Status — ${activeStatusApplicant.name}`} onClose={() => setStatusPopup(null)}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>Select new status:</label>
            <select
              className="form-control"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="btn btn-border btn-sm" onClick={() => setStatusPopup(null)}>Cancel</button>
            <button className="btn btn-default btn-sm" onClick={() => updateStatus(activeStatusApplicant.id, selectedStatus)}>Update Status</button>
          </div>
        </Modal>
      )}

      {/* Map / Address Popup (only for shortlisted) */}
      {mapPopup && (
        <Modal title={`Company Location — ${mapPopup.name}`} onClose={() => setMapPopup(null)}>
          <div style={{ marginBottom: "12px" }}>
            <p className="font-sm" style={{ marginBottom: "6px" }}>
              <strong>End Client:</strong> {mapPopup.endClientName}
            </p>
            <p className="font-sm" style={{ marginBottom: "16px" }}>
              <strong>Address:</strong> {mapPopup.companyAddress}
            </p>
            {/* Map embed placeholder */}
            <div style={{
              width: "100%", height: "240px", borderRadius: "10px", overflow: "hidden",
              border: "1px solid #e5e7eb", background: "#f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: "8px", color: "#6b7280"
            }}>
              <span style={{ fontSize: "32px" }}>🗺️</span>
              <span className="font-sm">Map integration — address revealed post shortlisting</span>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(mapPopup.companyAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-border btn-sm"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default EmployerApplicantsClient;
