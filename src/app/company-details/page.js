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

const iconMap = {
  industry: "/assets/imgs/page/job-single/industry.svg",
  jobLevel: "/assets/imgs/page/job-single/job-level.svg",
  jobType: "/assets/imgs/page/job-single/job-type.svg",
  updated: "/assets/imgs/page/job-single/updated.svg",
  location: "/assets/imgs/page/job-single/location.svg",
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
  const overviewGroups = [
    {
      title: "Company Overview",
      items: [
        {
          icon: "industry",
          label: "Business Type",
          value: humanize(companyInfo.businessType),
        },
        {
          icon: "jobLevel",
          label: "Employees",
          value: companyInfo.totalEmployees
            ? `${companyInfo.totalEmployees} Employees`
            : null,
        },
        {
          icon: "updated",
          label: "Established",
          value: companyInfo.yearEstablished,
        },
        {
          icon: "industry",
          label: "Industry",
          value: companyInfo.industry,
        },
        {
          icon: "jobType",
          label: "Open Jobs",
          value: companyInfo.openJobsCount,
        },
        {
          icon: "location",
          label: "Location",
          value: `${companyInfo.city}, ${companyInfo.state}`,
        },
      ],
    },
  ].map((group) => ({
    ...group,
    items: group.items.filter((item) => item.value),
  }));
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
                  {/* {companyInfo.fullLocation && (
                    <span className="card-location font-regular ml-20">
                      {companyInfo.fullLocation}
                    </span>
                  )} */}
                </h5>
                {(companyInfo.city || companyInfo.state) && (
                  <span className="card-location">
                    {[companyInfo.city, companyInfo.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {/* {companyInfo.companyDescription && (
                  <p className="mt-5 font-md color-text-paragraph-2 mb-15">
                    {companyInfo.companyDescription}
                  </p>
                )} */}
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

          {/* {hasAboutContent && (
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
          )} */}
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
                          <h4>About {companyInfo.companyName}</h4>
                          <p>{companyInfo.companyDescription}</p>
                        </>
                      )}

                      <div className="row mt-3">
                        {companyInfo.companyHighlights.map((item, index) => (
                          <div className="col-lg-6 mb-3" key={index}>
                            <div
                              style={{
                                padding: "14px 16px",
                                borderRadius: "12px",
                                border: "1px solid rgba(18,35,89,.08)",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                              }}
                            >
                              <img
                                src={iconMap.industry}
                                alt=""
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  flexShrink: 0,
                                }}
                              />

                              <span>{item}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {(companyInfo.businessType ||
                        companyInfo.totalEmployees ||
                        companyInfo.reviewCount != null ||
                        companyInfo.isVerified ||
                        companyInfo.gstRegistered ||
                        companyInfo.hasPoeLicence ||
                        companyInfo.hasRpslLicence) && (
                          <>
                            {overviewGroups.map((group, groupIndex) => (
                              <div
                                key={group.title}
                                style={{
                                  marginTop: groupIndex === 0 ? "30px" : "25px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "14px",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "4px",
                                      height: "16px",
                                      background: "#ffa300",
                                      borderRadius: "3px",
                                    }}
                                  />

                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: 700,
                                      color: "#122359",
                                      textTransform: "uppercase",
                                      letterSpacing: ".5px",
                                    }}
                                  >
                                    {group.title}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
                                    gap: "14px",
                                  }}
                                >
                                  {group.items.map((item) => (
                                    <div
                                      key={item.label}
                                      style={{
                                        padding: "14px 16px",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(18,35,89,.08)",
                                        background: "#fff",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                        }}
                                      >
                                        <img
                                          src={iconMap[item.icon]}
                                          style={{
                                            width: "16px",
                                            height: "16px",
                                          }}
                                        />

                                        <span
                                          style={{
                                            fontSize: "12px",
                                            color: "#6b7280",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {item.label}
                                        </span>
                                      </div>

                                      <strong
                                        style={{
                                          color: "#122359",
                                          fontSize: "15px",
                                        }}
                                      >
                                        {item.value}
                                      </strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
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
                        <div className="sidebar-text-info" style={{
                          borderBottom: "none",
                        }}>
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

                {(companyInfo.phone || companyInfo.email) && (
                  <div className="sidebar-list-job">
                    <ul>
                      {companyInfo.phone && (
                        <li>
                          <div className="sidebar-icon-item">
                            <i className="fi-rr-phone-call"></i>
                          </div>

                          <div className="sidebar-text-info">
                            <span className="text-description">Phone</span>

                            <strong className="small-heading">
                              <a
                                href={`tel:${companyInfo.phone}`}
                                style={{
                                  color: "inherit",
                                  textDecoration: "none",
                                  fontWeight: "inherit",
                                }}
                              >
                                {companyInfo.phone}
                              </a>
                            </strong>
                          </div>
                        </li>
                      )}

                      {companyInfo.email && (
                        <li>
                          <div className="sidebar-icon-item">
                            <i className="fi-rr-envelope"></i>
                          </div>

                          <div className="sidebar-text-info">
                            <span className="text-description">Email</span>

                            <strong className="small-heading">
                              <a
                                href={`mailto:${companyInfo.email}`}
                                style={{
                                  color: "inherit",
                                  textDecoration: "none",
                                  fontWeight: "inherit",
                                }}
                              >
                                {companyInfo.email}
                              </a>
                            </strong>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
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