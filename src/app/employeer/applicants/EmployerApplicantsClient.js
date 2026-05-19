"use client";

import Link from "next/link";
import { useToast } from "@/components/Toast";

const applicantStatusTabs = [
  { label: "All", count: 12, isActive: true },
  { label: "Applied", count: 5, isActive: false },
  { label: "Viewed", count: 2, isActive: false },
  { label: "Shortlisted", count: 3, isActive: false },
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
    matchScore: "Keyword Match 92%",
    profileTags: [
      { label: "6G Certified", toneClass: "is-brand" },
      { label: "Relocation: Yes", toneClass: "is-info" },
      { label: "Notice: 20 days", toneClass: "is-success" },
    ],
    screeningAnswers: [
      { label: "Experience 3+ years", value: "Yes", toneClass: "is-success" },
      { label: "Relocation", value: "Yes", toneClass: "is-info" },
      { label: "Mandatory questions", value: "Completed", toneClass: "is-brand" },
    ],
    status: "Applied",
    statusClass: "is-applied",
    actions: ["Accept", "Hold", "Reject"],
  },
  {
    id: "app-vijay-patil",
    name: "Vijay Patil",
    meta: "Welder | 6 yrs | Pune | Applied 3 Apr 2026",
    matchScore: "Keyword Match 85%",
    profileTags: [
      { label: "MIG Specialist", toneClass: "is-brand" },
      { label: "Relocation: No", toneClass: "is-muted" },
      { label: "Notice: 45 days", toneClass: "is-warning" },
    ],
    screeningAnswers: [
      { label: "Experience 3+ years", value: "Yes", toneClass: "is-success" },
      { label: "Relocation", value: "No", toneClass: "is-muted" },
      { label: "Mandatory questions", value: "Completed", toneClass: "is-brand" },
    ],
    status: "Viewed",
    statusClass: "is-viewed",
    actions: ["Accept", "Hold", "Reject"],
  },
  {
    id: "app-amit-desai",
    name: "Amit Desai",
    meta: "Welder | 10 yrs | Navi Mumbai | Applied 2 Apr 2026",
    matchScore: "Keyword Match 96%",
    profileTags: [
      { label: "Pipe Fabrication", toneClass: "is-brand" },
      { label: "Relocation: Yes", toneClass: "is-info" },
      { label: "Notice: 15 days", toneClass: "is-success" },
    ],
    screeningAnswers: [
      { label: "Experience 3+ years", value: "Yes", toneClass: "is-success" },
      { label: "Relocation", value: "Yes", toneClass: "is-info" },
      { label: "Mandatory questions", value: "Completed", toneClass: "is-brand" },
    ],
    status: "Shortlisted",
    statusClass: "is-shortlisted",
    actions: ["Select", "Reject"],
  },
];

const actionClassMap = {
  Accept: "btn btn-default btn-sm mr-10 mb-10",
  Select: "btn btn-default btn-sm mr-10 mb-10",
  Hold: "btn btn-grey-small btn-sm mr-10 mb-10",
  Reject: "btn btn-grey-small btn-sm mr-10 mb-10",
};

const EmployerApplicantsClient = () => {
  const showToast = useToast();

  return (
    <main className="main employer-applicants-page">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">
            <div className="box-filters-job">
              <div className="row align-items-center">
                <div className="col-xl-8 col-lg-8">
                  <h3 className="mb-5">Applicants</h3>
                  <span className="font-sm color-text-paragraph-2">Welder 6G - Mumbai</span>
                </div>
                <div className="col-xl-4 col-lg-4 text-lg-end mt-sm-15">
                  <Link className="btn btn-border btn-sm mr-10 mb-10" href="/employeer/job-list">
                    Back to Job list
                  </Link>
                  <Link className="btn btn-default btn-sm mr-10 mb-10" href="/dashboard/post-job">
                    Edit Job
                  </Link>
                  <span className="badge bg-primary">12 Applicants</span>
                </div>
              </div>
            </div>

            <div className="candidate-status-filter mt-20 mb-20">
              {applicantStatusTabs.map((tab) => (
                <button
                  key={tab.label}
                  className={`candidate-status-filter-btn ${tab.isActive ? "active" : ""}`}
                  type="button"
                >
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
                  <button className="btn btn-border btn-sm mr-10 mb-10" type="button" onClick={() => showToast("Filters reset.", "info")}> 
                    Reset
                  </button>
                  <button className="btn btn-default btn-sm mb-10" type="button" onClick={() => showToast("Filters applied — showing matching candidates.", "success")}> 
                    Apply Filters
                  </button>
                </div>
              </div>

              <div className="row form-contact mt-15">
                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Candidate or skill</label>
                    <input className="form-control" type="text" placeholder="Search by name, skill, or location" />
                  </div>
                </div>
                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Experience</label>
                    <select className="form-control" defaultValue="">
                      <option value="" disabled>
                        Select range
                      </option>
                      <option>0 - 2 years</option>
                      <option>3 - 5 years</option>
                      <option>6 - 10 years</option>
                      <option>10+ years</option>
                    </select>
                  </div>
                </div>
                <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12">
                  <div className="form-group">
                    <label className="font-sm color-text-mutted mb-10">Notice period</label>
                    <select className="form-control" defaultValue="">
                      <option value="" disabled>
                        Select notice period
                      </option>
                      <option>Immediate</option>
                      <option>15 days</option>
                      <option>30 days</option>
                      <option>45+ days</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="employer-applicants-filter-tags">
                {screeningFilters.map((filter) => (
                  <button
                    key={filter.label}
                    className={`employer-applicants-tag ${filter.toneClass} ${filter.isActive ? "is-active" : ""}`}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="box-list-jobs display-list">
              {applicants.map((applicant) => (
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
                              <Link className="name-job" href="/employeer/candidate-profile">
                                {applicant.name}
                              </Link>
                              <span className="location-small">{applicant.meta}</span>
                              <div className="employer-applicants-tag-row mt-10">
                                <span className="employer-applicants-tag is-success">{applicant.matchScore}</span>
                                {applicant.profileTags.map((tag) => (
                                  <span key={`${applicant.id}-${tag.label}`} className={`employer-applicants-tag ${tag.toneClass}`}>
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-4 col-md-12 col-sm-12 text-lg-end mt-md-15 mt-sm-15">
                          <span className={`employer-applicants-status ${applicant.statusClass}`}>{applicant.status}</span>
                          <div className="mt-10">
                            <button className="btn btn-border btn-sm" type="button" onClick={() => showToast(`Downloading CV for ${applicant.name}...`, "info")}> 
                              Download CV
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="card-2-bottom mt-20">
                        <div className="row align-items-center">
                          <div className="col-lg-8 col-md-12 col-sm-12">
                            <span className="font-xs color-text-paragraph-2 d-block mb-10">Screening Answers</span>
                            <div className="employer-applicants-tag-row">
                              {applicant.screeningAnswers.map((answer) => (
                                <span
                                  key={`${applicant.id}-${answer.label}`}
                                  className={`employer-applicants-tag ${answer.toneClass}`}>
                                  {answer.label}: {answer.value}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-12 col-sm-12 text-lg-end mt-md-15 mt-sm-15 employer-applicants-actions">
                            {applicant.actions.map((action) => (
                              <button
                                key={`${applicant.id}-${action}`}
                                className={actionClassMap[action]}
                                type="button"
                                onClick={() => {
                                  if (action === "Accept") showToast(`${applicant.name} has been accepted and shortlisted.`, "success");
                                  else if (action === "Reject") showToast(`${applicant.name} has been rejected.`, "error");
                                  else if (action === "Hold") showToast(`${applicant.name} placed on hold.`, "warning");
                                  else showToast(`${action} — ${applicant.name}`, "info");
                                }}
                              >
                                {action}
                              </button>
                            ))}
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
    </main>
  );
};

export default EmployerApplicantsClient;
