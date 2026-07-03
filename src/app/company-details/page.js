"use client";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getCompanyDetails } from "@/services/candidate/companyService";
import { getJobDetails } from "@/services/candidate/jobDetailsService";
import JobCardList from "@/app/jobs-list/components/JobCardList";
import ApplyJobModal from "@/app/Homepage/components/ApplyJobModal";

const humanize = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") return value;
  return value.replace(/_/g, " ");
};

function CompanyDetailsContent() {
  const searchParams = useSearchParams();
  const employerId = searchParams.get("employerId");

  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeJob, setActiveJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    setNotFound(false);

    try {
      const data = await getCompanyDetails(employerId);

      if (!data || data.success === false) {
        setCompanyInfo(null);
        setNotFound(true);
      } else {
        setCompanyInfo(data);
      }
    } catch (error) {
      console.error("Failed to load company details", error);
      setCompanyInfo(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employerId) {
      fetchCompanyDetails();
    } else {
      setLoading(false);
      setNotFound(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerId]);

  const openApplyModal = async (job) => {
    try {
      const response = await getJobDetails(job.jobId);
      setActiveJob(response.data);
      setShowApplyModal(true);
    } catch (error) {
      console.error("Failed to load job details", error);
    }
  };

  if (loading) {
    return (
      <main className="main">
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
          <p>Loading company details…</p>
        </div>
      </main>
    );
  }

  if (notFound || !companyInfo) {
    return (
      <main className="main">
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
          <h4>Company not found</h4>
          <p>This employer profile may have been removed or the link is incorrect.</p>
        </div>
      </main>
    );
  }

  const jobs = companyInfo.jobs || [];

  const hasAboutContent = Boolean(
    companyInfo.companyDescription ||
      (companyInfo.companyHighlights || []).length > 0 ||
      companyInfo.businessType ||
      companyInfo.totalEmployees ||
      companyInfo.reviewCount != null ||
      companyInfo.isVerified ||
      companyInfo.gstRegistered ||
      companyInfo.hasPoeLicence ||
      companyInfo.hasRpslLicence
  );

  return (
    <main className="main">
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-image-single">
            <img
              src={companyInfo.coverImageUrl || "/assets/imgs/page/company/img.png"}
              alt={`${companyInfo.companyName} banner`}
            />
          </div>

          <div className="box-company-profile">
            {companyInfo.companyLogoUrl && (
              <div className="image-compay">
                <img
                  src={companyInfo.companyLogoUrl}
                  alt={companyInfo.companyName}
                  style={{
                    width: "85px",
                    height: "85px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
            <div className="row mt-10">
              <div className="col-lg-8 col-md-12">
                <h5 className="f-18">
                  {companyInfo.companyName}
                  {companyInfo.fullLocation && (
                    <span className="card-location font-regular ml-20">
                      {companyInfo.fullLocation}
                    </span>
                  )}
                </h5>
                {companyInfo.companyDescription && (
                  <p className="mt-5 font-md color-text-paragraph-2 mb-15">
                    {companyInfo.companyDescription}
                  </p>
                )}
              </div>
              <div className="col-lg-4 col-md-12 text-lg-end">
                <Link
                  className="btn btn-apply btn-apply-big"
                  href="/jobs-list"
                  style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}
                >
                  <i className="fa-solid fa-briefcase"></i>
                  View Open Jobs
                </Link>
              </div>
            </div>
          </div>

          {hasAboutContent && (
            <div className="box-nav-tabs mt-40 mb-5">
              <ul className="nav" role="tablist">
                <li>
                  <a
                    className="btn btn-border aboutus-icon mr-15 mb-5 active"
                    href="#tab-about"
                    data-bs-toggle="tab"
                    role="tab"
                    aria-controls="tab-about"
                    aria-selected="true"
                  >
                    About us
                  </a>
                </li>
              </ul>
            </div>
          )}
          <div className="border-bottom pt-10 pb-10"></div>
        </div>
      </section>

      <section className="section-box mt-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12 col-sm-12 col-12">
              {hasAboutContent && (
                <div className="content-single">
                  <div className="tab-content">
                    <div
                      className="tab-pane fade show active"
                      id="tab-about"
                      role="tabpanel"
                      aria-labelledby="tab-about"
                    >
                      {companyInfo.companyDescription && (
                        <>
                          <h4>Welcome to {companyInfo.companyName}</h4>
                          <p>{companyInfo.companyDescription}</p>
                        </>
                      )}

                      {(companyInfo.companyHighlights || []).length > 0 && (
                        <>
                          <h4 className="mt-4">Why Candidates Choose Us</h4>
                          <ul>
                            {companyInfo.companyHighlights.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {(companyInfo.businessType ||
                        companyInfo.totalEmployees ||
                        companyInfo.reviewCount != null ||
                        companyInfo.isVerified ||
                        companyInfo.gstRegistered ||
                        companyInfo.hasPoeLicence ||
                        companyInfo.hasRpslLicence) && (
                        <>
                          <h4 className="mt-4">Company Snapshot</h4>
                          <div className="row">
                            {companyInfo.businessType && (
                              <div className="col-md-6 mb-15">
                                <span className="color-text-paragraph-2 d-block">Business Type</span>
                                <strong>{humanize(companyInfo.businessType)}</strong>
                              </div>
                            )}

                            {companyInfo.totalEmployees > 0 && (
                              <div className="col-md-6 mb-15">
                                <span className="color-text-paragraph-2 d-block">Team Size</span>
                                <strong>{companyInfo.totalEmployees} employees</strong>
                              </div>
                            )}

                            {companyInfo.reviewCount != null && (
                              <div className="col-md-6 mb-15">
                                <span className="color-text-paragraph-2 d-block">Reviews</span>
                                <strong>
                                  {companyInfo.reviewCount > 0
                                    ? `${companyInfo.reviewCount} review${companyInfo.reviewCount === 1 ? "" : "s"}`
                                    : "No reviews yet"}
                                </strong>
                              </div>
                            )}

                            {companyInfo.isVerified && (
                              <div className="col-md-6 mb-15">
                                <span className="color-text-paragraph-2 d-block">Verification</span>
                                <strong style={{ color: "#178A4C" }}>
                                  <i className="fa-solid fa-circle-check mr-5"></i>
                                  Verified Employer
                                </strong>
                              </div>
                            )}

                            {companyInfo.gstRegistered && (
                              <div className="col-md-6 mb-15">
                                <span className="color-text-paragraph-2 d-block">GST</span>
                                <strong>Registered</strong>
                              </div>
                            )}

                            {companyInfo.hasPoeLicence && (
                              <div className="col-md-6 mb-15">
                                <span className="color-text-paragraph-2 d-block">POE Licence</span>
                                <strong>On File</strong>
                              </div>
                            )}

                            {companyInfo.hasRpslLicence && (
                              <div className="col-md-6 mb-15">
                                <span className="color-text-paragraph-2 d-block">RPSL Licence</span>
                                <strong>On File</strong>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="box-related-job content-page">
                <h5 className="mb-30">
                  Open Jobs{jobs.length > 0 ? ` (${jobs.length})` : ""}
                </h5>

                {jobs.length === 0 ? (
                  <p className="color-text-paragraph-2">
                    This company has no active job postings right now.
                  </p>
                ) : (
                  <div className="box-list-jobs display-list">
                    {jobs.map((job) => (
                      <JobCardList
                        key={job.jobId}
                        job={job}
                        viewMode="list"
                        onApplyNow={openApplyModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-4 col-md-12 col-sm-12 col-12 pl-40 pl-lg-15 mt-lg-30">
              <div className="sidebar-border employer-cv-surface-card">
                <div className="sidebar-heading">
                  <div className="avatar-sidebar">
                    <div className="sidebar-info pl-0">
                      <span className="sidebar-company">{companyInfo.companyName}</span>
                      {(companyInfo.city || companyInfo.state) && (
                        <span className="card-location">
                          {[companyInfo.city, companyInfo.state].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {companyInfo.mapEmbedUrl && (
                  <div className="sidebar-list-job">
                    <div className="box-map">
                      <iframe
                        src={companyInfo.mapEmbedUrl}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}

                <div className="sidebar-list-job">
                  <ul>
                    {companyInfo.industry && (
                      <li>
                        <div className="sidebar-icon-item">
                          <i className="fi-rr-briefcase"></i>
                        </div>
                        <div className="sidebar-text-info">
                          <span className="text-description">Company field</span>
                          <strong className="small-heading">
                            {humanize(companyInfo.industry)}
                          </strong>
                        </div>
                      </li>
                    )}

                    {companyInfo.addressLine1 && (
                      <li>
                        <div className="sidebar-icon-item">
                          <i className="fi-rr-marker"></i>
                        </div>
                        <div className="sidebar-text-info">
                          <span className="text-description">Location</span>
                          <strong className="small-heading">{companyInfo.addressLine1}</strong>
                        </div>
                      </li>
                    )}

                    {companyInfo.yearEstablished && (
                      <li>
                        <div className="sidebar-icon-item">
                          <i className="fi-rr-clock"></i>
                        </div>
                        <div className="sidebar-text-info">
                          <span className="text-description">Year Established</span>
                          <strong className="small-heading">{companyInfo.yearEstablished}</strong>
                        </div>
                      </li>
                    )}

                    {companyInfo.companySize && (
                      <li>
                        <div className="sidebar-icon-item">
                          <i className="fi-rr-time-fast"></i>
                        </div>
                        <div className="sidebar-text-info">
                          <span className="text-description">Company Size</span>
                          <strong className="small-heading">
                            {humanize(companyInfo.companySize)}
                          </strong>
                        </div>
                      </li>
                    )}

                    {companyInfo.openJobsCount != null && (
                      <li>
                        <div className="sidebar-icon-item">
                          <i className="fi-rr-briefcase"></i>
                        </div>
                        <div className="sidebar-text-info">
                          <span className="text-description">Open Jobs</span>
                          <strong className="small-heading">{companyInfo.openJobsCount}</strong>
                        </div>
                      </li>
                    )}

                    {companyInfo.websiteUrl && (
                      <li>
                        <div className="sidebar-icon-item">
                          <i className="fi-rr-globe"></i>
                        </div>
                        <div className="sidebar-text-info">
                          <span className="text-description" style={{ whiteSpace: "nowrap" }}>
                            Company Website
                          </span>
                          <strong className="small-heading">
                            <a
                              href={
                                companyInfo.websiteUrl.startsWith("http")
                                  ? companyInfo.websiteUrl
                                  : `https://${companyInfo.websiteUrl}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "inherit", textDecoration: "none", fontWeight: "inherit" }}
                            >
                              {companyInfo.websiteUrl}
                            </a>
                          </strong>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                {(companyInfo.addressLine1 || companyInfo.phone || companyInfo.email) && (
                  <div className="sidebar-list-job">
                    <ul className="ul-disc">
                      {companyInfo.addressLine1 && <li>{companyInfo.addressLine1}</li>}
                      {companyInfo.phone && <li>Phone: {companyInfo.phone}</li>}
                      {companyInfo.email && <li>Email: {companyInfo.email}</li>}
                    </ul>
                  </div>
                )}
              </div>

              <div className="sidebar-border-bg bg-right">
                <span className="text-grey">WE ARE</span>
                <span className="text-hiring">HIRING</span>
                <p className="font-xxs color-text-paragraph mt-5">
                  {jobs.length > 0
                    ? `${jobs.length} active job${jobs.length === 1 ? "" : "s"} open right now. Explore and apply directly.`
                    : "Explore active jobs across the platform and apply directly."}
                </p>
                <div className="mt-15">
                  <Link className="btn btn-paragraph-2" href="/jobs-list">
                    Know More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ApplyJobModal
        showModal={showApplyModal}
        setShowModal={setShowApplyModal}
        job={activeJob}
      />
    </main>
  );
}

export default function CompanyDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyDetailsContent />
    </Suspense>
  );
}