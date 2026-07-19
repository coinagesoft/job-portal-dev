"use client";
import React, { useState } from "react";
import { useToast } from "@/components/Toast";

const profileSkills = [
  "6G Welding",
  "TIG Welding",
  "MIG Welding",
  "Pipe Fabrication",
  "Offshore Safety",
  "Blueprint Reading",
];

const workHistory = [
  {
    company: "BlueWave Shipyard",
    location: "Mumbai, Maharashtra",
    role: "Senior Welder",
    type: "Full time",
    timeRange: "2022 - Present",
    summary:
      "Handles offshore pipe welding, pressure vessel repairs, and welding quality checks for marine projects.",
  },
  {
    company: "Harbor Steel Works",
    location: "Navi Mumbai, Maharashtra",
    role: "Welder",
    type: "Full time",
    timeRange: "2019 - 2022",
    summary:
      "Performed TIG and MIG welding for fabrication units and supported dock-side mechanical installations.",
  },
  {
    company: "Westline Fabricators",
    location: "Thane, Maharashtra",
    role: "Junior Welder",
    type: "Full time",
    timeRange: "2016 - 2019",
    summary:
      "Assisted on structural welding tasks, metal finishing, and safety-compliant workshop operations.",
  },
];

const EmployerCandidateProfilePage = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { showToast } = useToast();

  const handleUnlock = async () => {
    setUnlocking(true);
    setTimeout(() => {
      setIsUnlocked(true);
      setUnlocking(false);
      showToast("Profile unlocked. 2 credit(s) used.", "success");
    }, 600);
  };

  const handleDownloadCv = () => {
    setDownloading(true);
    setTimeout(() => {
      try {
        const blob = new Blob(
          [
            `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [ 3 0 R ] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 595 842 ] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 50 >>
stream
BT /F1 24 Tf 50 700 Td (Ramesh Kumar Sharma - Welder (6G) CV) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000202 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
301
%%EOF`
          ],
          { type: "application/pdf" }
        );
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Ramesh_Kumar_Sharma_CV.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast("CV downloaded. 0 credit(s) used.", "success");
      } catch (err) {
        console.error(err);
        showToast("Unable to download CV.", "error");
      } finally {
        setDownloading(false);
      }
    }, 1000);
  };

  const profileVisibilityRows = [
    {
      field: "display_name",
      value: "Ramesh Kumar Sharma",
      status: "Pre-unlock",
      statusClass: "badge bg-primary",
    },
    {
      field: "trade",
      value: "Welder (6G Certified)",
      status: "Visible",
      statusClass: "badge bg-success",
    },
    {
      field: "experience_years",
      value: "8",
      status: "Visible",
      statusClass: "badge bg-success",
    },
    {
      field: "current_location",
      value: "Mumbai, Maharashtra",
      status: "Visible",
      statusClass: "badge bg-success",
    },
    {
      field: "mobile_number",
      value: isUnlocked ? "+91 98765 43210" : "+91 XXXXXXXXXX",
      status: isUnlocked ? "Visible" : "Locked",
      statusClass: isUnlocked ? "badge bg-success" : "badge bg-warning text-dark",
    },
    {
      field: "email",
      value: isUnlocked ? "ramesh.sharma@gmail.com" : "rXXXXX@XXXX.com",
      status: isUnlocked ? "Visible" : "Locked",
      statusClass: isUnlocked ? "badge bg-success" : "badge bg-warning text-dark",
    },
    {
      field: "cv_download",
      value: isUnlocked ? "Available for download" : "Available after unlock",
      status: isUnlocked ? "Visible" : "Locked",
      statusClass: isUnlocked ? "badge bg-success" : "badge bg-warning text-dark",
    },
  ];

  return (
    <main className="main">
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-image-single" style={{ height: "120px", marginTop: "80px" }}>
            {/* <img
              src="/assets/imgs/page/blue-collar/welding.jpg"
              alt="candidate banner"
            /> */}
          </div>
          <div className="box-company-profile">
            <div className="image-compay">
              <img
                src="/assets/imgs/page/candidates/candidate-profile.png"
                alt="candidate profile"
              />
            </div>
            <div className="row mt-10">
              <div className="col-lg-8 col-md-12">
                <h5 className="f-18">
                  Ramesh Kumar Sharma
                  <span className="card-location font-regular ml-20">
                    Mumbai, Maharashtra
                  </span>
                </h5>
                <p className="mt-0 font-md color-text-paragraph-2 mb-15">
                  Welder (6G Certified) - 8 years experience
                </p>
                <div className="mt-10 mb-15">
                  <img
                    src="/assets/imgs/template/icons/star.svg"
                    alt="rating star"
                  />
                  <img
                    src="/assets/imgs/template/icons/star.svg"
                    alt="rating star"
                  />
                  <img
                    src="/assets/imgs/template/icons/star.svg"
                    alt="rating star"
                  />
                  <img
                    src="/assets/imgs/template/icons/star.svg"
                    alt="rating star"
                  />
                  <img
                    src="/assets/imgs/template/icons/star.svg"
                    alt="rating star"
                  />
                  <span className="font-xs color-text-mutted ml-10">
                    94% match
                  </span>
                  <img
                    className="ml-30"
                    src="/assets/imgs/page/candidates/verified.png"
                    alt="verified candidate"
                  />
                </div>
                <div className="candidate-tags-wrap">
                  {["ITI Certified", "KYC Verified", "Passport Valid"].map(
                    (tag, index) => (
                      <span key={index} className="candidate-profile-tag">
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="col-lg-4 col-md-12 text-lg-end">
                <div className="action-buttons d-flex flex-wrap gap-2 justify-content-lg-end">
                  <button
                    className="btn btn-default"
                    type="button"
                    title="Unlock this candidate's full profile"
                    style={{ whiteSpace: "nowrap" }}
                    disabled={isUnlocked || unlocking}
                    onClick={handleUnlock}
                  >
                    {isUnlocked
                      ? "Profile Unlocked"
                      : unlocking
                        ? "Unlocking…"
                        : "Unlock Profile - 2 Credits"}
                  </button>

                  <button
                    className="btn btn-border"
                    type="button"
                    title={isUnlocked ? "Download candidate CV" : "Unlock required before downloading CV"}
                    style={{ whiteSpace: "nowrap" }}
                    disabled={!isUnlocked || downloading}
                    onClick={handleDownloadCv}
                  >
                    {downloading
                      ? "Downloading…"
                      : isUnlocked
                        ? "Download CV"
                        : "Download CV - 2 Credits"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="box-nav-tabs mt-40 mb-5">
            <ul className="nav" role="tablist">
              <li>
                <a
                  className="btn btn-border aboutus-icon mr-15 mb-5 active"
                  href="#tab-short-bio"
                  data-bs-toggle="tab"
                  role="tab"
                  aria-controls="tab-short-bio"
                  aria-selected="true"
                >
                  Candidate Summary
                </a>
              </li>
              <li>
                <a
                  className="btn btn-border recruitment-icon mr-15 mb-5"
                  href="#tab-skills"
                  data-bs-toggle="tab"
                  role="tab"
                  aria-controls="tab-skills"
                  aria-selected="false"
                >
                  Skills
                </a>
              </li>
              {/* <li>
                <a
                  className="btn btn-border people-icon mb-5"
                  href="#tab-work-experience"
                  data-bs-toggle="tab"
                  role="tab"
                  aria-controls="tab-work-experience"
                  aria-selected="false"
                >
                  Working Experience
                </a>
              </li> */}
            </ul>
          </div>
          <div className="border-bottom pt-10 pb-10"></div>
        </div>
      </section>

      <section className="section-box mt-50">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12 col-sm-12 col-12">
              <div className="content-single">
                <div className="tab-content">
                  <div
                    className="tab-pane fade show active"
                    id="tab-short-bio"
                    role="tabpanel"
                    aria-labelledby="tab-short-bio"
                  >
                    <h4>Employer Candidate View</h4>
                    <p>
                      This profile is currently locked for employer view.
                      Contact details, complete CV, and full work records are
                      hidden until unlock. Unlocking costs 2 credits (Band B)
                      and grants access for 60 days.
                    </p>
                    <div
                      className="alert alert-warning mt-20 mb-20"
                      role="alert"
                    >
                      <strong>Profile locked.</strong> Unlock is irreversible.
                      Credits deducted after confirmation.
                    </div>

                    <h4>Profile Visibility</h4>

                    <p className="mb-25">
                      Recruiters can preview important candidate information
                      before unlocking the full profile. Contact details and
                      downloadable documents are protected until unlock.
                    </p>

                    <div className="row">
                      {/* =========================================
      PREVIEW ACCESS CARD
  ========================================= */}

                      <div className="col-lg-6 mb-25">
                        <div className="candidate-visibility-card visible-card">
                          <div className="visibility-card-header">
                            <div>
                              <h5 className="mb-5">Preview Access</h5>

                              <p className="mb-0 font-sm color-text-paragraph">
                                Information visible before unlock
                              </p>
                            </div>

                            <span className="visibility-badge success">
                              Visible
                            </span>
                          </div>

                          <div className="visibility-card-body">
                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-user"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Candidate Name
                                </span>

                                <h6 className="visibility-value">
                                  Ramesh Kumar Sharma
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-briefcase"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Current Role
                                </span>

                                <h6 className="visibility-value">
                                  Senior Welder (6G)
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-time-fast"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Experience
                                </span>

                                <h6 className="visibility-value">
                                  8 Years Experience
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-marker"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Current Location
                                </span>

                                <h6 className="visibility-value">
                                  Mumbai, Maharashtra
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-id-badge"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Verification Status
                                </span>

                                <h6 className="visibility-value text-success">
                                  KYC + Passport Verified
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-credit-card"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Passport Validity
                                </span>

                                <h6 className="visibility-value">
                                  Valid Till 2031
                                </h6>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* =========================================
      LOCKED ACCESS CARD
  ========================================= */}

                      <div className="col-lg-6 mb-25">
                        <div className="candidate-visibility-card locked-card">
                          <div className="visibility-card-header">
                            <div>
                              <h5 className="mb-5">Unlock Required</h5>

                              <p className="mb-0 font-sm color-text-paragraph">
                                Protected candidate information
                              </p>
                            </div>

                            <span className="visibility-badge warning">
                              Locked
                            </span>
                          </div>

                          <div className="visibility-card-body">
                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-phone-call"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Mobile Number
                                </span>

                                <h6 className="visibility-value">
                                  +91 XXXXXXXXXX
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-envelope"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Email Address
                                </span>

                                <h6 className="visibility-value">
                                  rXXXXX@XXXX.com
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-document"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Resume Download
                                </span>

                                <h6 className="visibility-value">
                                  Unlock Required
                                </h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-dollar"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Expected Salary
                                </span>

                                <h6 className="visibility-value">Hidden</h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-id-badge"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Government Documents
                                </span>

                                <h6 className="visibility-value">Protected</h6>
                              </div>
                            </div>

                            <div className="visibility-item">
                              <div className="visibility-icon">
                                <i className="fi-rr-credit-card"></i>
                              </div>

                              <div>
                                <span className="visibility-label">
                                  Unlock Access
                                </span>

                                <h6 className="visibility-value">
                                  2 Credits / 60 Days
                                </h6>
                              </div>
                            </div>
                          </div>

                          <div className="visibility-card-footer">
                            <button
                              className="btn btn-default w-100"
                              type="button"
                            >
                              Unlock Full Candidate Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="tab-pane fade"
                    id="tab-skills"
                    role="tabpanel"
                    aria-labelledby="tab-skills"
                  >
                    <h4>Core Skills</h4>
                    <p>
                      Skills shown here are visible in pre-unlock mode to
                      support shortlisting decisions before spending credits.
                    </p>
                    <div className="mt-20">
                      {profileSkills.map((skill) => (
                        <span
                          key={skill}
                          className="btn btn-grey-small mr-10 mb-10"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="tab-pane fade"
                    id="tab-work-experience"
                    role="tabpanel"
                    aria-labelledby="tab-work-experience"
                  >
                    <h4>Work Experience Snapshot</h4>
                    <p>
                      Full work details are shown after unlock. Current snapshot
                      includes role, company, and timeline.
                    </p>
                    <ul>
                      {workHistory.map((item) => (
                        <li key={`${item.company}-${item.role}`}>
                          <strong>{item.role}</strong> at {item.company} (
                          {item.timeRange}) - {item.location}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="box-related-job content-page">
                <h3 className="mb-30">Work History</h3>
                <div className="box-list-jobs display-list">
                  {workHistory.map((item) => (
                    <div
                      className="col-xl-12 col-12"
                      key={`work-card-${item.company}`}
                    >
                      <div className="card-grid-2 hover-up">
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12">
                            <div className="card-grid-2-image-left">
                              <div className="image-box">
                                <img
                                  src="/assets/imgs/brands/brand-6.png"
                                  alt="company logo"
                                />
                              </div>
                              <div className="right-info">
                                <a className="name-job" href="#">
                                  {item.company}
                                </a>
                                <span className="location-small">
                                  {item.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 text-start text-md-end pr-60 col-md-6 col-sm-12">
                            <div className="pl-15 mb-15 mt-30">
                              <span className="btn btn-grey-small mr-5">
                                {item.type}
                              </span>
                              <span className="btn btn-grey-small mr-5">
                                {item.timeRange}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="card-block-info">
                          <h4>
                            <a href="#">{item.role}</a>
                          </h4>
                          <p className="font-sm color-text-paragraph mt-10">
                            {item.summary}
                          </p>
                          <div className="card-2-bottom mt-20">
                            <div className="row">
                              <div className="col-lg-7 col-7">
                                <span className="card-text-price">
                                  Status:
                                  <span className="text-success">
                                    {" "}
                                    Visible in pre-unlock
                                  </span>
                                </span>
                              </div>
                              <div className="col-lg-5 col-5 text-end">
                                {/* <button
                                  className="btn btn-apply-now"
                                  type="button"
                                >
                                  View Full History
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

            <div className="col-lg-4 col-md-12 col-sm-12 col-12 pl-40 pl-lg-15 mt-lg-30">
              <div className="sidebar-border">
                <h5 className="f-18">Overview</h5>
                <div className="sidebar-list-job">
                  <ul>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-briefcase"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Experience</span>
                        <strong className="small-heading">8 years</strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-time-fast"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Trade</span>
                        <strong className="small-heading">
                          Welder (6G Certified)
                        </strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-marker"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">
                          Current Location
                        </span>
                        <strong className="small-heading">Mumbai, MH</strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-dollar"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">
                          Credits in Wallet
                        </span>
                        <strong className="small-heading">2 credits</strong>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="sidebar-list-job">
                  <h6 className="mb-10">Contact & CV Access</h6>
                  <ul className="ul-disc">
                    <li>Mobile: {isUnlocked ? "+91 98765 43210" : "+91 XXXXXXXXXX (locked)"}</li>
                    <li>Email: {isUnlocked ? "ramesh.sharma@gmail.com" : "rXXXXX@XXXX.com (locked)"}</li>
                    <li>CV: {isUnlocked ? "Available for download" : "Available after unlock"}</li>
                    <li>Unlock expiry window: 60 days</li>
                  </ul>
                  {/* <div className="mt-30">
                    <button
                      className="btn btn-send-message w-100"
                      type="button"
                    >
                      Unlock Profile - 2 Credits
                    </button>
                  </div>
                  <p className="font-xs color-text-paragraph-2 mt-10 mb-0">
                    Unlock is irreversible and credits are deducted instantly.
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-box mt-50 mb-20">
        <div className="container">
          <div className="box-newsletter orange-newsletter">
            <div className="row">
              <div className="col-xl-3 col-12 text-center d-none d-xl-block">
                <img
                  src="/assets/imgs/template/newsletter-left.png"
                  alt="newsletter left visual"
                />
              </div>
              <div className="col-lg-12 col-xl-6 col-12">
                <h2 className="text-md-newsletter text-center">
                  Need More Matches? Buy Credits And Unlock Faster
                </h2>
                <div className="box-form-newsletter mt-40">
                  <form className="form-newsletter">
                    <input
                      className="input-newsletter"
                      type="text"
                      value=""
                      placeholder="Enter your email here"
                      readOnly
                    />
                    <button className="btn btn-default font-heading icon-send-letter">
                      Get Updates
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-xl-3 col-12 text-center d-none d-xl-block">
                <img
                  src="/assets/imgs/template/newsletter-right.png"
                  alt="newsletter right visual"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerCandidateProfilePage;
