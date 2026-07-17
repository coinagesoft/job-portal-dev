"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllJobs } from "@/services/candidate/allJobsService";

const getCountryForJob = (location = "") => {
  const loc = location.toLowerCase();
  if (
    loc.includes("india") ||
    loc.includes("mumbai") ||
    loc.includes("pune") ||
    loc.includes("delhi") ||
    loc.includes("chennai") ||
    loc.includes("bengaluru") ||
    loc.includes("kolkata") ||
    loc.includes("lucknow") ||
    loc.includes("hyderabad") ||
    loc.includes("assam") ||
    loc.includes("guwahati") ||
    loc.includes("haryana") ||
    loc.includes("faridabad") ||
    loc.includes("chandigarh") ||
    loc.includes("noida") ||
    loc.includes("ludhiana") ||
    loc.includes("gurugram")
  ) {
    return "India";
  }
  if (loc.includes("uae") || loc.includes("dubai") || loc.includes("abu dhabi")) {
    return "UAE";
  }
  if (loc.includes("saudi") || loc.includes("riyadh") || loc.includes("jeddah")) {
    return "Saudi";
  }
  if (loc.includes("qatar") || loc.includes("doha")) {
    return "Qatar";
  }
  if (loc.includes("singapore")) {
    return "Singapore";
  }
  return null;
};

const getDisplaySalary = (salaryRange, salaryVisibility) => {
  if (!salaryRange) return "";

  switch (salaryVisibility) {
    case "Show Range":
    case "Show_Range":
      return salaryRange;

    case "Show Min Only":
      return salaryRange.includes("-")
        ? salaryRange.split("-")[0].trim()
        : salaryRange;

    case "Show Max Only":
      return salaryRange.includes("-")
        ? salaryRange.split("-")[1].trim()
        : salaryRange;

    case "Negotiable":
      return "Negotiable";

    default:
      return salaryRange;
  }
};

export default function LatestJobs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [dynamicTabs, setDynamicTabs] = useState([]);
  const [jobsData, setJobsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getAllJobs();
        const allJobs = response.data || [];

        // Sort by postedOn date (latest first)
        const sortedJobs = [...allJobs].sort(
          (a, b) => new Date(b.postedOn) - new Date(a.postedOn)
        );

        // Group by country and extract unique active countries from data
        const flagMap = {
          India: "https://flagcdn.com/w40/in.png",
          UAE: "https://flagcdn.com/w40/ae.png",
          Saudi: "https://flagcdn.com/w40/sa.png",
          Qatar: "https://flagcdn.com/w40/qa.png",
          Singapore: "https://flagcdn.com/w40/sg.png",
        };

        const activeCountriesSet = new Set();
        const grouped = {};

        sortedJobs.forEach((job) => {
          const country = getCountryForJob(job.jobLocation);
          if (country) {
            activeCountriesSet.add(country);
            if (!grouped[country]) {
              grouped[country] = [];
            }
            grouped[country].push(job);
          }
        });

        const activeCountries = Array.from(activeCountriesSet);
        const tabs = activeCountries.map((countryName) => ({
          name: countryName,
          flag: flagMap[countryName] || "https://flagcdn.com/w40/un.png",
        }));

        setDynamicTabs(tabs);
        setJobsData(grouped);
      } catch (error) {
        console.error("Failed to fetch latest jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleTabClick = (index, e) => {
    e.preventDefault();
    setActiveTab(index);
  };

  return (
    <section className="section-box mt-50">
      <div className="section-box wow animate__animated animate__fadeIn">
        <div className="container">
          <div className="text-start">
            <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">
              Latest Jobs Post
            </h2>

            <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
              Explore the different types of available jobs to apply
              <br className="d-none d-lg-block" />
              discover which is right for you.
            </p>

            {dynamicTabs.length > 0 && (
              <div className="list-tabs list-tabs-2 mt-30">
                <ul className="nav nav-tabs" role="tablist">
                  {dynamicTabs.map((tab, index) => (
                    <li key={index}>
                      <a
                        className={activeTab === index ? "active" : ""}
                        id={`nav-tab-job-${index + 1}`}
                        href={`#tab-job-${index + 1}`}
                        onClick={(e) => handleTabClick(index, e)}
                        role="tab"
                        aria-controls={`tab-job-${index + 1}`}
                        aria-selected={activeTab === index}
                      >
                        <img
                          src={tab.flag}
                          alt={tab.name}
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginRight: "8px",
                          }}
                        />
                        {tab.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-50">
            <div className="tab-content" id="myTabContent-1">
              {loading ? (
                <div className="text-center py-5">
                  <p className="font-lg color-text-paragraph-2">Loading latest jobs...</p>
                </div>
              ) : dynamicTabs.length === 0 ? (
                <div className="text-center py-5">
                  <p className="font-lg color-text-paragraph-2">No jobs currently posted.</p>
                </div>
              ) : (
                dynamicTabs.map((tab, index) => (
                  <div
                    key={index}
                    className={`tab-pane fade ${
                      activeTab === index ? "show active" : ""
                    }`}
                    id={`tab-job-${index + 1}`}
                    role="tabpanel"
                    aria-labelledby={`nav-tab-job-${index + 1}`}
                  >
                    <div className="row">
                      {jobsData[tab.name] && jobsData[tab.name].length > 0 ? (
                        jobsData[tab.name].slice(0, 3).map((job, j) => {
                          const imgUrl = "/assets/imgs/page/homepage2/img2.png";
                          const displayTags = (job.skills || []).slice(0, 2);
                          const employmentTypeDisplay = job.employmentType
                            ? job.employmentType.replace(/_/g, " ")
                            : "Full time";

                          return (
                            <div
                              key={j}
                              className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12 d-flex align-items-stretch"
                            >
                              <div
                                className="card-grid-2 grid-bd-16 hover-up w-100"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  height: "90%",
                                  cursor: "pointer",
                                }}
                                onClick={() => router.push(`/job-details?jobId=${job.jobId}`)}
                              >
                                <div className="card-grid-2-image">
                                  <span className={`lbl-hot ${employmentTypeDisplay.toLowerCase() === "freelancer" ? "bg-green" : ""}`}>
                                    <span>{employmentTypeDisplay}</span>
                                  </span>

                                  <div className="image-box">
                                    <figure>
                                      <img src={imgUrl} alt="jobBox" />
                                    </figure>
                                  </div>
                                </div>

                                <div className="card-block-info" style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                  <h6>
                                    <Link
                                      href={`/job-details?jobId=${job.jobId}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {job.jobTitle}
                                    </Link>
                                  </h6>

                                  <div className="mt-5" style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                                    <span className="card-location mr-15">
                                      {job.jobLocation}
                                    </span>

                                    <span className="card-time">
                                      {job.timeAgo || "Recently Posted"}
                                    </span>

                                    {getDisplaySalary(job.salaryRange, job.salaryVisibility) && (
                                      <span className="card-text-price font-sm" style={{ color: "#ffa300", fontWeight: "700", marginLeft: "15px" }}>
                                        {getDisplaySalary(job.salaryRange, job.salaryVisibility)}
                                        <span className="text-muted font-xs" style={{ fontWeight: "400", marginLeft: "4px" }}>/Hour</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="card-2-bottom mt-15">
                                    <div className="row">
                                      <div className="col-12" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        {displayTags.map((tag, t) => (
                                          <span
                                            key={t}
                                            className="badge bg-white border text-muted"
                                            style={{ margin: 0 }}
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <p className="font-sm color-text-paragraph mt-20" style={{ flexGrow: 1 }}>
                                    {job.description ? (
                                      job.description.length > 120
                                        ? `${job.description.slice(0, 120)}...`
                                        : job.description
                                    ) : (
                                      "Looking for experienced professional with strong skills in the field. Join our dynamic team today!"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-5 col-12">
                          <p className="font-lg color-text-paragraph-2">
                            No jobs currently posted for {tab.name}.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
