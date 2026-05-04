import Link from "next/link";

const companyInfo = {
  name: "Horizon Marine Services",
  tagline: "Trusted offshore and domestic workforce partner",
  location: "Mumbai, India",
  logo: "/assets/imgs/page/company/company.png",
  banner: "/assets/imgs/page/company/img.png",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120703.02652159374!2d72.8776559!3d19.0760907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63f3f9f8f79%3A0x3f6453f9b6f5e231!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1712832000000!5m2!1sen!2sin",
  address: "406, Maritime House, Ballard Estate, Mumbai, Maharashtra 400001",
  phone: "+91 22 4567 8900",
  email: "hiring@horizonmarine.in",
  field: "Marine Recruitment",
  salaryBand: "35,000 - 75,000",
  memberSince: "Jul 2012",
  lastJobPosted: "2 days ago",
};

const aboutParagraphs = [
  "Horizon Marine Services helps skilled workers and employers connect for offshore, shipyard, and domestic infrastructure projects across India and GCC routes.",
  "Our hiring teams specialize in trade roles such as welders, marine electricians, fitters, riggers, and support crew. Every profile goes through document and eligibility checks before shortlist."
];

const keyHighlights = [
  "Dedicated recruitment desk for offshore and vessel-based projects",
  "Document-first screening with identity and compliance checks",
  "Fast interview coordination with employer hiring teams",
  "Role matching based on trade skills, location, and notice period",
  "Support for large-volume and urgent deployment hiring drives"
];

const recruitmentContent = [
  "Current recruitment campaigns cover shipyard welding, marine electrical maintenance, fabrication support, and galley operations.",
  "Candidates can review active jobs, compare salary ranges, and apply directly through the job details page."
];

const peopleContent = [
  "The Horizon hiring team includes account managers, technical recruiters, and onboarding coordinators who support candidates throughout screening and interview stages.",
  "For employer partnerships and high-volume hiring, our operations team provides dedicated process coordination."
];

const latestJobs = [
  {
    id: "job-horizon-welder",
    company: "Horizon Marine Services",
    location: "Mumbai, India",
    logo: "/assets/imgs/brands/brand-6.png",
    title: "Senior Welder - Offshore",
    type: "Full time",
    posted: "2 days ago",
    summary:
      "Offshore fabrication and vessel repair role requiring 6G certification and strong TIG/MIG handling experience.",
    salary: "45,000",
    tags: ["6G", "Offshore"]
  },
  {
    id: "job-horizon-electrician",
    company: "Horizon Marine Services",
    location: "Chennai, India",
    logo: "/assets/imgs/brands/brand-7.png",
    title: "Marine Electrician",
    type: "Contract",
    posted: "4 days ago",
    summary:
      "Maintenance of electrical systems, panel troubleshooting, and marine safety compliance support for vessel units.",
    salary: "52,000",
    tags: ["Electrical", "Marine"]
  },
  {
    id: "job-horizon-galley",
    company: "Horizon Marine Services",
    location: "Kochi, India",
    logo: "/assets/imgs/brands/brand-8.png",
    title: "Galley Cook",
    type: "Full time",
    posted: "6 days ago",
    summary:
      "Onboard galley operations role focused on hygiene standards, meal prep, and offshore crew support.",
    salary: "38,000",
    tags: ["Hospitality", "Crew"]
  }
];

export const metadata = {
  title: "Company Details - Job Portal",
  description: "Candidate-facing company details page."
};

const CompanyDetailsPage = () => {
  return (
    <main className="main">
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-image-single">
            <img src={companyInfo.banner} alt={`${companyInfo.name} banner`} />
          </div>
          <div className="box-company-profile">
            <div className="image-compay">
              <img src={companyInfo.logo} alt={companyInfo.name} />
            </div>
            <div className="row mt-10">
              <div className="col-lg-8 col-md-12">
                <h5 className="f-18">
                  {companyInfo.name}
                  <span className="card-location font-regular ml-20">{companyInfo.location}</span>
                </h5>
                <p className="mt-5 font-md color-text-paragraph-2 mb-15">{companyInfo.tagline}</p>
              </div>
              <div className="col-lg-4 col-md-12 text-lg-end">
                <Link className="btn btn-call-icon btn-apply btn-apply-big" href="/jobs-list">
                  View Open Jobs
                </Link>
              </div>
            </div>
          </div>

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
              <li>
                <a
                  className="btn btn-border recruitment-icon mr-15 mb-5"
                  href="#tab-recruitments"
                  data-bs-toggle="tab"
                  role="tab"
                  aria-controls="tab-recruitments"
                  aria-selected="false"
                >
                  Recruitments
                </a>
              </li>
              <li>
                <a
                  className="btn btn-border people-icon mb-5"
                  href="#tab-people"
                  data-bs-toggle="tab"
                  role="tab"
                  aria-controls="tab-people"
                  aria-selected="false"
                >
                  People
                </a>
              </li>
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
                  <div className="tab-pane fade show active" id="tab-about" role="tabpanel" aria-labelledby="tab-about">
                    <h4>Welcome to {companyInfo.name}</h4>
                    {aboutParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}

                    <h4>Why Candidates Choose Us</h4>
                    <ul>
                      {keyHighlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="tab-pane fade" id="tab-recruitments" role="tabpanel" aria-labelledby="tab-recruitments">
                    <h4>Recruitments</h4>
                    {recruitmentContent.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="tab-pane fade" id="tab-people" role="tabpanel" aria-labelledby="tab-people">
                    <h4>People</h4>
                    {peopleContent.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="box-related-job content-page">
                <h5 className="mb-30">Latest Jobs</h5>
                <div className="box-list-jobs display-list">
                  {latestJobs.map((job) => (
                    <div className="col-xl-12 col-12" key={job.id}>
                      <div className="card-grid-2 hover-up">
                        <span className="flash"></span>
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12">
                            <div className="card-grid-2-image-left">
                              <div className="image-box">
                                <img src={job.logo} alt={job.company} />
                              </div>
                              <div className="right-info">
                                <a className="name-job" href="#">
                                  {job.company}
                                </a>
                                <span className="location-small">{job.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 text-start text-md-end pr-60 col-md-6 col-sm-12">
                            <div className="pl-15 mb-15 mt-30">
                              {job.tags.map((tag) => (
                                <a key={`${job.id}-${tag}`} className="btn btn-grey-small mr-5" href="#">
                                  {tag}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="card-block-info">
                          <h4>
                            <Link href="/job-details">{job.title}</Link>
                          </h4>
                          <div className="mt-5">
                            <span className="card-briefcase">{job.type}</span>
                            <span className="card-time">{job.posted}</span>
                          </div>
                          <p className="font-sm color-text-paragraph mt-10">{job.summary}</p>
                          <div className="card-2-bottom mt-20">
                            <div className="row">
                              <div className="col-lg-7 col-7">
                                <span className="card-text-price">{job.salary}</span>
                                <span className="text-muted">/month</span>
                              </div>
                              <div className="col-lg-5 col-5 text-end">
                                <Link className="btn btn-apply-now" href="/job-details">
                                  Apply now
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

            <div className="col-lg-4 col-md-12 col-sm-12 col-12 pl-40 pl-lg-15 mt-lg-30">
              <div className="sidebar-border">
                <div className="sidebar-heading">
                  <div className="avatar-sidebar">
                    <div className="sidebar-info pl-0">
                      <span className="sidebar-company">{companyInfo.name}</span>
                      <span className="card-location">{companyInfo.location}</span>
                    </div>
                  </div>
                </div>
                <div className="sidebar-list-job">
                  <div className="box-map">
                    <iframe
                      src={companyInfo.mapEmbed}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
                <div className="sidebar-list-job">
                  <ul>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-briefcase"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Company field</span>
                        <strong className="small-heading">{companyInfo.field}</strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-marker"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Location</span>
                        <strong className="small-heading">{companyInfo.location} Remote Friendly</strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-dollar"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Salary</span>
                        <strong className="small-heading">{companyInfo.salaryBand}</strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-clock"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Member since</span>
                        <strong className="small-heading">{companyInfo.memberSince}</strong>
                      </div>
                    </li>
                    <li>
                      <div className="sidebar-icon-item">
                        <i className="fi-rr-time-fast"></i>
                      </div>
                      <div className="sidebar-text-info">
                        <span className="text-description">Last Jobs Posted</span>
                        <strong className="small-heading">{companyInfo.lastJobPosted}</strong>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="sidebar-list-job">
                  <ul className="ul-disc">
                    <li>{companyInfo.address}</li>
                    <li>Phone: {companyInfo.phone}</li>
                    <li>Email: {companyInfo.email}</li>
                  </ul>
                </div>
              </div>

              <div className="sidebar-border-bg bg-right">
                <span className="text-grey">WE ARE</span>
                <span className="text-hiring">HIRING</span>
                <p className="font-xxs color-text-paragraph mt-5">
                  Offshore and domestic trade roles are open now. Explore active jobs and apply directly.
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

      <section className="section-box mt-50 mb-20">
        <div className="container">
          <div className="box-newsletter">
            <div className="row">
              <div className="col-xl-3 col-12 text-center d-none d-xl-block">
                <img src="/assets/imgs/template/newsletter-left.png" alt="newsletter left visual" />
              </div>
              <div className="col-lg-12 col-xl-6 col-12">
                <h2 className="text-md-newsletter text-center">
                  New Things Will Always
                  <br />
                  Update Regularly
                </h2>
                <div className="box-form-newsletter mt-40">
                  <form className="form-newsletter">
                    <input className="input-newsletter" type="text" value="" placeholder="Enter your email here" readOnly />
                    <button className="btn btn-default font-heading icon-send-letter">Subscribe</button>
                  </form>
                </div>
              </div>
              <div className="col-xl-3 col-12 text-center d-none d-xl-block">
                <img src="/assets/imgs/template/newsletter-right.png" alt="newsletter right visual" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CompanyDetailsPage;
