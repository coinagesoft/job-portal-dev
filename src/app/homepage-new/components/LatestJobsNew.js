"use client";

import { useState } from "react";
import Link from "next/link";

const tabCategories = [
  { name: "India", flag: "/assets/imgs/flags/india.png" },
  { name: "UAE", flag: "/assets/imgs/flags/uae.png" },
  { name: "Saudi", flag: "/assets/imgs/flags/saudi.png" },
  { name: "Qatar", flag: "/assets/imgs/flags/qatar.png" },
  { name: "Singapore", flag: "/assets/imgs/flags/singapore.png" },
];

const formatHourlyPrice = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.includes("$") ? text : `$${text}`;
};

const jobsData = [
  // INDIA
  [
    {
      title: "Marine Electrician",
      location: "Mumbai, India",
      time: "3 mins ago",
      price: "$55K - $72K",
      type: "Full time",
      img: "/assets/imgs/page/blue-collar/ship_service.jpg",
      tags: ["Panel Wiring", "Safety"],
    },
    {
      title: "HVAC Technician",
      location: "Lucknow, India",
      time: "6 mins ago",
      price: "$40K - $52K",
      type: "Full time",
      img: "/assets/imgs/page/blue-collar/ship_captain.jpg",
      tags: ["HVAC", "Troubleshooting"],
    },
    {
      title: "Mechanical Fitter",
      location: "Chennai, India",
      time: "9 mins ago",
      price: "$45K - $58K",
      type: "Full time",
      img: "/assets/imgs/page/blue-collar/welding.jpg",
      tags: ["Alignment", "Assembly"],
    },
  ],

  // UAE
  [
    {
      title: "Site Welder (6G)",
      location: "Dubai, UAE",
      time: "12 mins ago",
      price: "$50K - $72K",
      type: "Contract",
      img: "/assets/imgs/page/blue-collar/ship_captain.jpg",
      tags: ["6G", "Fabrication"],
    },
    {
      title: "Pipe Fitter",
      location: "Abu Dhabi, UAE",
      time: "15 mins ago",
      price: "$44K - $60K",
      type: "Contract",
      img: "/assets/imgs/page/homepage2/img2.png",
      tags: ["Pipe Fit-up", "Hydro Test"],
    },
  ],

  // SAUDI
  [
    {
      title: "Heavy Vehicle Driver",
      location: "Riyadh, Saudi",
      time: "20 mins ago",
      price: "$28K - $40K",
      type: "Full time",
      img: "/assets/imgs/page/blue-collar/welding.jpg",
      tags: ["HMV", "Fleet Safety"],
    },
  ],

  // QATAR
  [
    {
      title: "Shuttering Carpenter",
      location: "Doha, Qatar",
      time: "25 mins ago",
      price: "$36K - $50K",
      type: "Full time",
      img: "/assets/imgs/page/blue-collar/ship_captain.jpg",
      tags: ["Formwork", "Layout"],
    },
  ],

  // SINGAPORE
  [
    {
      title: "Deck Crew Assistant",
      location: "Singapore",
      time: "30 mins ago",
      price: "$32K - $45K",
      type: "Contract",
      img: "/assets/imgs/page/blue-collar/welding.jpg",
      tags: ["Deck Support", "Safety Drill"],
    },
  ],
];

export default function LatestJobs() {
  const [activeTab, setActiveTab] = useState(0);

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

            <div className="list-tabs list-tabs-2 mt-30">
              <ul className="nav nav-tabs" role="tablist">
                {tabCategories.map((tab, index) => (
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
                        // alt={tab.name}
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
          </div>

          <div className="mt-50">
            <div className="tab-content" id="myTabContent-1">
              {tabCategories.map((_, index) => (
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
                    {jobsData[index]?.slice(0, 3).map((job, j) => (
                      <div
                        key={j}
                        className="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12"
                      >
                        <div className="card-grid-2 grid-bd-16 hover-up">
                          <div className="card-grid-2-image">
                            <span
                              className={`lbl-hot ${
                                job.type === "Freelancer"
                                  ? "bg-green"
                                  : ""
                              }`}
                            >
                              <span>{job.type}</span>
                            </span>

                            <div className="image-box">
                              <figure>
                                <img src={job.img} alt="jobBox" />
                              </figure>
                            </div>
                          </div>

                          <div className="card-block-info">
                            <h6>
                              <Link href="/job-details">
                                {job.title}
                              </Link>
                            </h6>

                            <div className="mt-5">
                              <span className="card-location mr-15">
                                {job.location}
                              </span>

                              <span className="card-time">
                                {job.time}
                              </span>
                            </div>

                            <div className="card-2-bottom mt-20">
                              <div className="row">
                                <div className="col-xl-7 col-md-7 mb-2">
                                  {job.tags.map((tag, t) => (
                                    <span
                                      key={t}
                                      className="badge bg-white border text-muted mr-5"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                <div className="col-xl-5 col-md-5 text-lg-end">
                                  <span className="card-text-price">
                                    {formatHourlyPrice(job.price)}
                                  </span>

                                  <span className="text-muted">
                                    /Hour
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="font-sm color-text-paragraph mt-20">
                              Looking for experienced professional with strong
                              skills in the field. Join our dynamic team today!
                            </p>
                          </div>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}