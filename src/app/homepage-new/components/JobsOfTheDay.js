"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllJobs } from "@/services/candidate/allJobsService";

const iconMap = {
  "Construction": "fa-solid fa-helmet-safety",
  "Mechanical": "fa-solid fa-gears",
  "Oil & Gas": "fa-solid fa-oil-well",
  "Oil and Gas": "fa-solid fa-oil-well",
  "Factory": "fa-solid fa-industry",
  "Production": "fa-solid fa-industry",
  "Logistics": "fa-solid fa-truck-fast",
  "Technician": "fa-solid fa-screwdriver-wrench",
  "Maintenance": "fa-solid fa-screwdriver-wrench",
  "Electrical": "fa-solid fa-bolt",
  "Marine": "fa-solid fa-ship",
  "Other": "fa-solid fa-briefcase"
};

const getTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  const posted = new Date(dateStr);
  const now = new Date();
  const diffMs = now - posted;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) {
    return `${Math.max(1, diffMins)} mins ago`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
};

export default function JobsOfTheDay() {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState([]);
  const [jobsData, setJobsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await getAllJobs();
        const allJobs = response.data || [];

        // Group all jobs by industryType to collect all categories
        const grouped = {};
        allJobs.forEach((job) => {
          const industry = job.industryType || "Other";
          if (!grouped[industry]) {
            grouped[industry] = [];
          }
          grouped[industry].push(job);
        });

        const activeTabs = Object.keys(grouped).map((industryName) => ({
          label: industryName,
          icon: iconMap[industryName] || "fa-solid fa-briefcase",
        }));

        // Sort tabs alphabetically
        activeTabs.sort((a, b) => a.label.localeCompare(b.label));

        setTabs(activeTabs);
        setJobsData(grouped);
      } catch (error) {
        console.error("Error loading Jobs of the Day:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  return (
    <section className="section-box mt-70">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">
            Jobs of the day
          </h2>

          <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
            Skilled trade jobs posted in the last 24 hours
          </p>

          {loading ? (
            <div className="text-center mt-40">
              <p className="font-lg color-text-paragraph-2">Loading categories...</p>
            </div>
          ) : tabs.length === 0 ? (
            <div className="text-center mt-40 pb-50">
              <p className="font-lg color-text-paragraph-2">No categories found.</p>
            </div>
          ) : (
            <div className="list-tabs mt-40">
              <ul className="nav nav-tabs" role="tablist">
                {tabs.map((tab, index) => (
                  <li key={tab.label}>
                    <a
                      className={activeTab === index ? "active" : ""}
                      id={`nav-tab-job-${index + 1}`}
                      href={`#tab-job-${index + 1}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(index);
                      }}
                      role="tab"
                      aria-controls={`tab-job-${index + 1}`}
                      aria-selected={activeTab === index}
                    >
                      {/* <i className={tab.icon}></i> */}
                      <span>{tab.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {!loading && tabs.length > 0 && (
          <div className="mt-50">
            <div className="tab-content" id="myTabContent-1">
              {tabs.map((tab, index) => {
                const tabJobs = jobsData[tab.label] || [];
                const now = new Date();
                const recentTabJobs = tabJobs.filter((job) => {
                  if (!job.postedOn) return false;
                  const diffMs = now - new Date(job.postedOn);
                  return diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000;
                });

                return (
                  <div
                    key={index}
                    className={`tab-pane fade ${activeTab === index ? "show active" : ""
                      }`}
                    id={`tab-job-${index + 1}`}
                    role="tabpanel"
                    aria-labelledby={`nav-tab-job-${index + 1}`}
                  >
                    <div className="row">
                      {recentTabJobs.length === 0 ? (
                        <div className="text-center w-100 py-5">
                          <p className="font-lg color-text-paragraph-2">
                            No jobs posted under this category today.
                          </p>
                        </div>
                      ) : (
                        recentTabJobs.slice(0, 8).map((job) => {
                          const isConfidential =
                            job.companyVisibility === "HideName" ||
                            job.companyVisibility === "Hide_Name";
                          const displayCompany = isConfidential
                            ? "Confidential Company"
                            : job.companyName || "";
                          const displayLogo = isConfidential
                            ? "/assets/imgs/brands/brand-1.png"
                            : job.companyLogoUrl || "/assets/imgs/brands/brand-1.png";

                          const displaySalary =
                            job.salaryVisibility === "Negotiable"
                              ? "Negotiable"
                              : job.salaryRange
                                ? job.salaryRange.includes("$")
                                  ? job.salaryRange
                                  : `$${job.salaryRange}`
                                : "Negotiable";

                          const cardTags = (job.tags && job.tags.length > 0)
                            ? job.tags
                            : [job.tradeCategory, job.industryType].filter(Boolean);
                          const slicedTags = cardTags.slice(0, 2);

                          return (
                            <div
                              key={job.jobId}
                              className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-30"
                            >
                              <div className="card-grid-2 grid-bd-16 hover-up">
                                <div className="card-block-info pt-25 px-4 pb-4">
                                  <h6>
                                    <Link href={`/job-details?jobId=${job.jobId}`} className="color-brand-1">
                                      {job.jobTitle}
                                    </Link>
                                  </h6>

                                  <div className="mt-5">
                                    <span className="card-briefcase mr-15">
                                      {job.jobType || job.employmentType || "Full Time"}
                                    </span>

                                    <span className="card-time">{getTimeAgo(job.postedOn)}</span>
                                  </div>

                                  {/* TAGS */}
                                  <div className="mt-20 border-bottom pb-20">
                                    {slicedTags.map((tag, tagIndex) => (
                                      <Link
                                        key={tagIndex}
                                        className="btn btn-grey-small bg-14 mb-5 mr-5"
                                        href={`/jobs-list?q=${encodeURIComponent(tag)}`}
                                      >
                                        {tag}
                                      </Link>
                                    ))}
                                  </div>

                                  {/* FOOTER */}
                                  <div className="card-2-bottom company-footer">
                                    <img
                                      className="company-logo"
                                      src={displayLogo}
                                      alt="company"
                                    />

                                    <div className="company-details">

                                      <h6 className="company-name">
                                        {displayCompany}
                                      </h6>

                                      <span className="company-location">
                                        <i className="fi-rr-marker"></i>
                                        {job.jobLocation}
                                      </span>



                                    </div>

                                  </div>
                                  <div className="salary-row mt-2">
                                    <span className="salary">
                                      {displaySalary}
                                    </span>

                                    {displaySalary !== "Negotiable" && (
                                      <span className="salary-type">
                                        /Hour
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* =========================================
           TABS
        ========================================= */
.company-footer{
    display:flex;
    gap:16px;
    align-items:flex-start;
    margin-top:auto;
    padding-top:20px;
}

.company-logo{
    width:54px;
    height:54px;
    object-fit:contain;
    border-radius:12px;
    flex-shrink:0;
}

.company-details{
    display:flex;
    flex-direction:column;
    gap:8px;
    flex:1;
}

.company-name{
    margin:0;
    font-size:17px;
    font-weight:700;
    color:#122359;
}

.company-location{
    display:flex;
    align-items:center;
    gap:6px;
    font-size:13px;
    color:#8A94A6;
}

.salary-row{
    display:flex;
    align-items:baseline;
    gap:6px;
}

.salary{
    font-size:15px;
    font-weight:700;
    color:#FFA500;
}

.salary-type{
    font-size:13px;
    color:#8A94A6;
}
      `}</style>
    </section>
  );
}
