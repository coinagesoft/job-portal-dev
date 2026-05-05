"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

const COMPANY = {
  name: "Horizon Marine Services",
  displayName: "Horizon Marine",
  location: "Mumbai, Maharashtra",
  tagline: "Connecting skilled trade workers to offshore and industrial projects across India and beyond.",
  industry: "Marine & Offshore Recruitment",
  size: "51–200 employees",
  founded: "2011",
  website: "https://horizonmarine.in",
  phone: "+91 22 4567 8900",
  email: "hiring@horizonmarine.in",
  address: "406, Maritime House, Ballard Estate, Mumbai – 400 001",
  gstNo: "27AABCH1234M1ZP",
  activeJobs: 14,
  totalHired: 830,
  avgTime: "12 days",
};

const trustBadges = [
  { badge: "GST Verified", status: "Approved", color: "#0BAB7C", bg: "#d1fae5" },
  { badge: "POE Licensed", status: "Approved · Exp: 31 Dec 2026", color: "#0BAB7C", bg: "#d1fae5" },
  { badge: "RPSL Licensed", status: "Pending upload", color: "#d97706", bg: "#fef3c7" },
  { badge: "Verified Employer", status: "Active", color: "#1976D2", bg: "#dbeafe" },
];

const recruitmentCards = [
  { id: 1, title: "Welder 6G – Offshore", location: "Mumbai", type: "Full time", salary: "INR 45,000/mo", applicants: 12, posted: "2 days ago", tags: ["ITI", "6G", "Offshore"] },
  { id: 2, title: "Marine Electrician", location: "Chennai", type: "Contract", salary: "INR 52,000/mo", applicants: 8, posted: "4 days ago", tags: ["Marine", "HT/LT"] },
  { id: 3, title: "Galley Cook", location: "Kochi", type: "Full time", salary: "INR 38,000/mo", applicants: 5, posted: "6 days ago", tags: ["Vessel Crew", "STCW"] },
  { id: 4, title: "Rigger – Heavy Lift", location: "Visakhapatnam", type: "Contract", salary: "INR 58,000/mo", applicants: 9, posted: "1 day ago", tags: ["Rigging", "Heavy Lift"] },
];

const people = [
  { name: "Arjun Mehta", role: "Account Owner", email: "arjun.mehta@horizonmarine.in", initials: "AM" },
  { name: "Sneha Raut", role: "HR Manager", email: "sneha.raut@horizonmarine.in", initials: "SR" },
  { name: "Rahul Desai", role: "Recruiter", email: "rahul.desai@horizonmarine.in", initials: "RD" },
];

const EditFieldModal = ({ field, value, onClose, onSave }) => {
  const [val, setVal] = useState(value);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h5 style={{ margin: 0, color: "#05264E" }}>Edit: {field}</h5>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>
          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">{field}</label>
            <input className="form-control" value={val} onChange={(e) => setVal(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button className="btn btn-border btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn btn-default btn-sm" onClick={() => { onSave(val); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EmployerCompanyProfilePage() {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState("about");
  const [company, setCompany] = useState(COMPANY);
  const [editModal, setEditModal] = useState(null);
  const [description, setDescription] = useState("Horizon Marine Services is a leading marine and offshore recruitment agency specialising in placing skilled trade workers — welders, electricians, riggers, and vessel crew — across Gulf, Indian Ocean, and South-East Asia projects. We hold valid POE and RPSL licences and maintain full compliance with the Ministry of External Affairs mandate for overseas worker placements.");

  const handleSaveField = (field, val) => {
    setCompany(prev => ({ ...prev, [field]: val }));
    showToast(`${field} updated successfully!`, "success");
  };

  const fieldRows = [
    { label: "Display Name", key: "displayName" },
    { label: "Industry", key: "industry" },
    { label: "Company Size", key: "size" },
    { label: "Founded", key: "founded" },
    { label: "Website", key: "website" },
    { label: "Contact Phone", key: "phone" },
    { label: "Contact Email", key: "email" },
    { label: "GST Number", key: "gstNo" },
  ];

  return (
    <main className="main">
      {/* Banner */}
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-image-single">
            <img src="/assets/imgs/page/company/img.png" alt="company banner" style={{ width: "100%", borderRadius: "10px", objectFit: "cover", maxHeight: "220px" }} />
          </div>

          <div className="box-company-profile">
            <div className="image-compay">
              <img src="/assets/imgs/page/company/company.png" alt="company logo" />
            </div>
            <div className="row mt-10">
              <div className="col-lg-8 col-md-12">
                <h5 className="f-18">
                  {company.displayName}
                  <span className="card-location font-regular ml-20">{company.location}</span>
                </h5>
                <p className="mt-5 font-md color-text-paragraph-2 mb-15">{company.tagline}</p>
                {/* Stats row */}
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {[["Active Jobs", company.activeJobs], ["Total Hired", company.totalHired], ["Avg. Time to Hire", company.avgTime]].map(([label, val]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "22px", fontWeight: "700", color: "#05264E" }}>{val}</div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* <div className="col-lg-4 col-md-12 text-lg-end">
                <button className="btn btn-call-icon btn-apply btn-apply-big" type="button" onClick={() => showToast("Company profile saved successfully!", "success")}>
                  Save Changes
                </button>
              </div> */}
            </div>
          </div>

          {/* Tab nav */}
          <div className="box-nav-tabs mt-40 mb-5">
            <ul className="nav" role="tablist">
              {[["about", "About Us"], ["recruitments", "Recruitments"], ["people", "People"]].map(([key, label]) => (
                <li key={key}>
                  <button
                    className={`btn btn-border mr-15 mb-5 ${activeTab === key ? "active" : ""}`}
                    onClick={() => setActiveTab(key)}
                    style={{ border: activeTab === key ? "2px solid #3B82F6" : undefined, color: activeTab === key ? "#3B82F6" : undefined }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-bottom pt-10 pb-10" />
        </div>
      </section>

      <section className="section-box mt-50">
        <div className="container">
          <div className="row">
            {/* Main content */}
            <div className="col-lg-8 col-md-12 col-sm-12">
              {activeTab === "about" && (
                <div className="content-single">
                  <h4>Welcome to {company.displayName}</h4>
                  <div className="form-group mb-20">
                    <label className="form-label">Company description</label>
                    <textarea className="form-control" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <p className="font-xs color-text-paragraph-2 mb-0 mt-5">Keep this summary concise and role-focused so candidates quickly understand your hiring needs.</p>
                  </div>

                  <h4 className="mt-30">Company Details</h4>
                  <div className="table-responsive mb-25">
                    <table className="table table-bordered align-middle">
                      <thead><tr><th>Field</th><th>Value</th><th>Action</th></tr></thead>
                      <tbody>
                        {fieldRows.map((row) => (
                          <tr key={row.key}>
                            <td><strong>{row.label}</strong></td>
                            <td>{company[row.key]}</td>
                            <td>
                              <button className="btn btn-border btn-sm" onClick={() => setEditModal({ field: row.label, key: row.key, value: company[row.key] })}>Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h4>Trust Badges & Compliance</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                    {trustBadges.map((b) => (
                      <div key={b.badge} style={{ padding: "16px", border: "1.5px solid #e5e7eb", borderRadius: "10px", background: b.bg }}>
                        <div style={{ fontWeight: "600", color: "#05264E", marginBottom: "4px" }}>{b.badge}</div>
                        <div style={{ fontSize: "12px", color: b.color, fontWeight: "500" }}>{b.status}</div>
                        <button className="btn btn-border btn-sm" style={{ marginTop: "10px", fontSize: "11px" }} onClick={() => showToast(`${b.badge}: ${b.status}`, b.status.includes("Pending") ? "warning" : "success")}>View details</button>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-default btn-sm" onClick={() => showToast("Company profile changes saved successfully!", "success")}>Save All Changes</button>
                </div>
              )}

              {activeTab === "recruitments" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h4 style={{ margin: 0 }}>Active Recruitments</h4>
                    <button className="btn btn-default btn-sm" onClick={() => showToast("Redirecting to post a new job…", "info")}>+ Post New Job</button>
                  </div>
                  <div className="box-list-jobs display-list">
                    {recruitmentCards.map((job) => (
                      <div className="col-xl-12 col-12" key={job.id}>
                        <div className="card-grid-2 hover-up" style={{ marginBottom: "16px" }}>
                          <div className="card-block-info">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                              <div>
                                <h4 style={{ margin: "0 0 4px" }}><Link href="/employeer/applicants">{job.title}</Link></h4>
                                <div className="mt-5">
                                  <span className="card-briefcase">{job.type}</span>
                                  <span className="card-time">{job.posted}</span>
                                  <span className="card-location" style={{ marginLeft: "10px" }}>📍 {job.location}</span>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: "700", color: "#05264E", fontSize: "16px" }}>{job.salary}</div>
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>{job.applicants} applicants</div>
                              </div>
                            </div>
                            <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {job.tags.map((tag) => (<span key={tag} className="btn btn-grey-small mr-5">{tag}</span>))}
                            </div>
                            <div className="card-2-bottom mt-15">
                              <div style={{ display: "flex", gap: "10px" }}>
                                <button className="btn btn-apply-now" onClick={() => showToast(`Viewing applicants for "${job.title}"`, "info")}>View Applicants</button>
                                <button className="btn btn-border btn-sm" onClick={() => showToast(`Editing job: "${job.title}"`, "info")}>Edit Job</button>
                                <button className="btn btn-grey-small" onClick={() => showToast(`Job "${job.title}" paused.`, "warning")}>Pause</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "people" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h4 style={{ margin: 0 }}>Team Members</h4>
                    <button className="btn btn-default btn-sm" onClick={() => showToast("Invite member — enter email to send invitation.", "info")}>+ Invite Member</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {people.map((p) => (
                      <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", border: "1px solid #e5e7eb", borderRadius: "10px", background: "#fafafa" }}>
                        <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#3B82F6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px", flexShrink: 0 }}>{p.initials}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", color: "#05264E" }}>{p.name}</div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>{p.role} · {p.email}</div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="btn btn-border btn-sm" onClick={() => showToast(`Editing profile for ${p.name}`, "info")}>Edit</button>
                          <button className="btn btn-grey-small" onClick={() => showToast(`Access revoked for ${p.name}.`, "warning")}>Revoke</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-4 col-md-12 col-sm-12 col-12 pl-40 pl-lg-15 mt-lg-30">
              <div className="sidebar-border">
                <div className="sidebar-heading">
                  <div className="avatar-sidebar">
                    <div className="sidebar-info pl-0">
                      <span className="sidebar-company">{company.displayName}</span>
                      <span className="card-location">{company.location}</span>
                    </div>
                  </div>
                </div>
                <div className="sidebar-list-job">
                  <div className="box-map">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120703.02652159374!2d72.8776559!3d19.0760907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63f3f9f8f79%3A0x3f6453f9b6f5e231!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1712832000000!5m2!1sen!2sin" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                </div>
                <div className="sidebar-list-job">
                  <ul>
                    {[
                      { icon: "fi-rr-briefcase", label: "Sector", value: company.industry },
                      { icon: "fi-rr-users", label: "Company Size", value: company.size },
                      { icon: "fi-rr-marker", label: "Location", value: company.location },
                      { icon: "fi-rr-dollar", label: "Salary Band", value: "INR 35k – INR 75k/month" },
                      { icon: "fi-rr-clock", label: "Member since", value: "Jul 2012" },
                      { icon: "fi-rr-time-fast", label: "Last job posted", value: "1 day ago" },
                    ].map((item) => (
                      <li key={item.label}>
                        <div className="sidebar-icon-item"><i className={item.icon}></i></div>
                        <div className="sidebar-text-info">
                          <span className="text-description">{item.label}</span>
                          <strong className="small-heading">{item.value}</strong>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="sidebar-list-job">
                  <ul className="ul-disc">
                    <li>{company.address}</li>
                    <li>Phone: {company.phone}</li>
                    <li>Email: {company.email}</li>
                  </ul>
                  {/* <div className="mt-30">
                    <button className="btn btn-send-message" onClick={() => showToast("Message form opened. Compose your message to the employer.", "info")}>Send Message</button>
                  </div> */}
                </div>
              </div>
              <div className="sidebar-border-bg bg-right" style={{ marginTop: "20px" }}>
                <span className="text-grey">WE ARE</span>
                <span className="text-hiring">HIRING</span>
                <p className="font-xxs color-text-paragraph mt-5">Offshore and domestic trade positions are open. View active roles in the Recruitments tab.</p>
                <div className="mt-15">
                  <button className="btn btn-paragraph-2" onClick={() => setActiveTab("recruitments")}>View Open Roles</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit field modal */}
      {editModal && (
        <EditFieldModal
          field={editModal.field}
          value={editModal.value}
          onClose={() => setEditModal(null)}
          onSave={(val) => handleSaveField(editModal.key, val)}
        />
      )}
    </main>
  );
}
