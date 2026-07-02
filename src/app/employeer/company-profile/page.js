"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useEffect } from "react";
import companyProfileService from "@/services/recruiter/companyProfileService";

const trustBadges = [
  {
    badge: "GST Verified",
    status: "Approved",
    color: "#0BAB7C",
    bg: "#d1fae5",
  },
  {
    badge: "POE Licensed",
    status: "Approved · Exp: 31 Dec 2026",
    color: "#0BAB7C",
    bg: "#d1fae5",
  },
  {
    badge: "RPSL Licensed",
    status: "Pending upload",
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    badge: "Verified Employer",
    status: "Active",
    color: "#ffa300",
    bg: "#ffffff",
  },
];

const recruitmentCards = [
  {
    id: 1,
    title: "Welder 6G – Offshore",
    location: "Mumbai",
    type: "Full time",
    salary: "INR 45,000/mo",
    applicants: 12,
    posted: "2 days ago",
    tags: ["ITI", "6G", "Offshore"],
  },
  {
    id: 2,
    title: "Marine Electrician",
    location: "Chennai",
    type: "Contract",
    salary: "INR 52,000/mo",
    applicants: 8,
    posted: "4 days ago",
    tags: ["Marine", "HT/LT"],
  },
  {
    id: 3,
    title: "Galley Cook",
    location: "Kochi",
    type: "Full time",
    salary: "INR 38,000/mo",
    applicants: 5,
    posted: "6 days ago",
    tags: ["Vessel Crew", "STCW"],
  },
  {
    id: 4,
    title: "Rigger – Heavy Lift",
    location: "Visakhapatnam",
    type: "Contract",
    salary: "INR 58,000/mo",
    applicants: 9,
    posted: "1 day ago",
    tags: ["Rigging", "Heavy Lift"],
  },
];

const people = [
  {
    name: "Arjun Mehta",
    role: "Account Owner",
    email: "arjun.mehta@horizonmarine.in",
    initials: "AM",
  },
  {
    name: "Sneha Raut",
    role: "HR Manager",
    email: "sneha.raut@horizonmarine.in",
    initials: "SR",
  },
  {
    name: "Rahul Desai",
    role: "Recruiter",
    email: "rahul.desai@horizonmarine.in",
    initials: "RD",
  },
];

const EditFieldModal = ({ field, value, onClose, onSave }) => {
  const [val, setVal] = useState(value ?? "");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "18px 24px 14px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h5 style={{ margin: 0, color: "#122359" }}>Edit: {field}</h5>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>
          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">{field}</label>
            <input
              className="form-control"
              value={val ?? ""}
              onChange={(e) => setVal(e.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              marginTop: "12px",
            }}
          >
            <button className="btn btn-border btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-default btn-sm"
              onClick={() => {
                onSave(val);
                onClose();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EmployerCompanyProfilePage() {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState("about");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [description, setDescription] = useState("");
  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
    try {
      setLoading(true);

      const data = await companyProfileService.getCompanyProfile();

      setCompany({
        name: data.legalName ?? "",
        displayName: data.companyDisplayName ?? "",
        location: `${data.city ?? ""}, ${data.state ?? ""}`,
        industry: data.industryType ?? "",
        size: data.companySize ?? "",
        founded: data.yearEstablished ?? "",
        companyLogoUrl: data.companyLogoUrl ?? "",
        website: data.websiteUrl ?? "",
        phone: data.contactPhone ?? "",
        email: data.contactEmailPublic ?? "",
        gstNo: data.gstn ?? "",
        tradeName: data.tradeName ?? "",
        addressLine1: data.addressLine1 ?? "",
        addressLine2: data.addressLine2 ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        pincode: data.pincode ?? "",
        country: data.country ?? "",
        contactPersonName: data.contactPersonName ?? "",
        designation: data.designation ?? "",
        operatingHours: data.operatingHours ?? "",
      });

      setDescription(data.companyDescription || "");
    } catch (error) {
      console.error(error);
      showToast("Failed to load company profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionBlur = async () => {
    try {
      if (description === company.companyDescription) {
        return;
      }

      await companyProfileService.updateCompanyProfileField(
        "CompanyDescription",
        description,
      );

      setCompany((prev) => ({
        ...prev,
        companyDescription: description,
      }));

      showToast("Company description updated successfully", "success");
    } catch (error) {
      console.error(error);

      showToast(
        error?.response?.data?.message ||
          "Failed to update company description",
        "error",
      );
    }
  };

  const handleSaveField = async (field, val) => {
    try {
      const apiField = fieldApiMap[field];

      if (!apiField) {
        showToast("Field not supported", "warning");
        return;
      }

      await companyProfileService.updateCompanyProfileField(apiField, val);

      setCompany((prev) => ({
        ...prev,
        [field]: val,
      }));

      showToast("Updated successfully", "success");
    } catch (error) {
      console.error(error);

      showToast(
        error?.response?.data?.message || "Failed to update profile",
        "error",
      );
    }
  };

  const fieldRows = [
  { label: "Display Name", key: "displayName", editable: true },
  { label: "Industry", key: "industry", editable: false },
  { label: "Company Size", key: "size", editable: true },
  { label: "Founded", key: "founded", editable: true },
  { label: "Website", key: "website", editable: true },
  { label: "Contact Phone", key: "phone", editable: true },
  { label: "Contact Email", key: "email", editable: true },
  { label: "GST Number", key: "gstNo", editable: false },
];

  const fieldApiMap = {
    displayName: "CompanyDisplayName",
    website: "WebsiteUrl",
    size: "CompanySize",
    founded: "YearEstablished",
    phone: "ContactPhone",
    email: "ContactEmailPublic",
    companyDescription: "CompanyDescription",
  };
  if (loading) {
    return (
      <div className="container py-5 text-center">
        Loading company profile...
      </div>
    );
  }
  return (
    <main className="main">
      {/* Banner */}
      <section className="section-box-2">
        <div className="container">
          <div className="banner-hero banner-image-single">
            <img
              src="/assets/imgs/page/company/img.png"
              alt="company banner"
              style={{
                width: "100%",
                borderRadius: "10px",
                objectFit: "cover",
                maxHeight: "220px",
              }}
            />
          </div>

          <div className="box-company-profile">
            <div className="image-compay">
              <img
                src={
                  company?.companyLogoUrl ||
                  "/assets/imgs/page/company/company.png"
                }
                alt={company?.displayName}
                style={{
                  width: "110px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "5px",
                  border: "1px solid #eee",
                  marginbottom: "20px",
                }}
              />
            </div>
            <div className="row mt-10">
              <div className="col-lg-8 col-md-12">
                <h5 className="f-18">
                  {company.displayName}
                  <span className="card-location font-regular ml-20">
                    {company.location}
                  </span>
                </h5>
                <p className="mt-5 font-md color-text-paragraph-2 mb-15">
                  {company.tagline}
                </p>
                {/* Stats row */}
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {[
                    ["Active Jobs", company.activeJobs],
                    ["Total Hired", company.totalHired],
                    ["Avg. Time to Hire", company.avgTime],
                  ].map(([label, val]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: "700",
                          color: "#122359",
                        }}
                      >
                        {val}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {label}
                      </div>
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
              {[
                ["about", "About Us"],
                ["recruitments", "Recruitments"],
                ["people", "People"],
              ].map(([key, label]) => (
                <li key={key}>
                  <button
                    className={`btn btn-border mr-15 mb-5 ${activeTab === key ? "active" : ""}`}
                    onClick={() => setActiveTab(key)}
                    style={{
                      border:
                        activeTab === key ? "2px solid #ffa300" : undefined,
                      color: activeTab === key ? "#ffa300" : undefined,
                    }}
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
                    <textarea
                      className="form-control"
                      rows="5"
                      value={description ?? ""}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={handleDescriptionBlur}
                    />
                    <p className="font-xs color-text-paragraph-2 mb-0 mt-5">
                      Keep this summary concise and role-focused so candidates
                      quickly understand your hiring needs.
                    </p>
                  </div>

                  <h4
                    className="mt-30"
                    style={{
                      color: "#122359",
                      fontWeight: 700,
                      marginBottom: "20px",
                    }}
                  >
                    Company Details
                  </h4>

                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1px solid rgba(18,35,89,0.06)",
                      overflow: "hidden",
                      boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                      marginBottom: "28px",
                    }}
                  >
                    {fieldRows.map((row, index) => (
                      <div
                        key={row.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "18px",
                          padding: "18px 22px",
                          borderBottom:
                            index !== fieldRows.length - 1
                              ? "1px solid rgba(18,35,89,0.06)"
                              : "none",
                          transition: "all .35s ease",
                          border: "1px solid transparent",
                          position: "relative",
                          background: "#ffffff",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fffaf2";

                          e.currentTarget.style.transform = "translateY(-3px)";

                          e.currentTarget.style.borderColor =
                            "rgba(255,153,0,0.28)";

                          e.currentTarget.style.boxShadow =
                            "0 12px 28px rgba(255,163,0,0.10)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#ffffff";

                          e.currentTarget.style.transform = "translateY(0px)";

                          e.currentTarget.style.borderColor = "transparent";

                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div
                          style={{
                            minWidth: "180px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: ".5px",
                              color: "#ff9900",
                              marginBottom: "4px",
                            }}
                          >
                            {row.label}
                          </div>

                          <div
                            style={{
                              color: "#122359",
                              fontSize: "15px",
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {row.key === "website" ? (
                              <a
                                href={`https://${company.website?.replace(/^https?:\/\//, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#122359",
                                  textDecoration: "underline",
                                }}
                              >
                                {company.website}
                              </a>
                            ) : (
                              company[row.key]
                            )}
                          </div>
                        </div>

                        <button
                          className="btn btn-border btn-sm"
                          style={{
                            borderRadius: "10px",
                            padding: "8px 14px",
                            fontWeight: 600,
                            minWidth: "90px",
                            transition: "all .25s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#122359";
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#ffffff";
                            e.currentTarget.style.color = "#122359";
                          }}
                          onClick={() =>
                            setEditModal({
                              field: row.label,
                              key: row.key,
                              value: company[row.key] ?? "",
                            })
                          }
                        >
                          <i
                            className="fi fi-rr-edit"
                            style={{ marginRight: "5px" }}
                          />
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* <h4>Trust Badges & Compliance</h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "14px",
                      marginBottom: "24px",
                    }}
                  >
                    {trustBadges.map((b) => (
                      <div
                        key={b.badge}
                        style={{
                          padding: "16px",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "10px",
                          background: b.bg,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#122359",
                            marginBottom: "4px",
                          }}
                        >
                          {b.badge}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: b.color,
                            fontWeight: "500",
                          }}
                        >
                          {b.status}
                        </div>
                        <button
                          className="btn btn-border btn-sm"
                          style={{ marginTop: "10px", fontSize: "11px" }}
                          onClick={() =>
                            showToast(
                              `${b.badge}: ${b.status}`,
                              b.status.includes("Pending")
                                ? "warning"
                                : "success",
                            )
                          }
                        >
                          View details
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-default btn-sm"
                    onClick={() =>
                      showToast(
                        "Company profile changes saved successfully!",
                        "success",
                      )
                    }
                  >
                    Save All Changes
                  </button> */}
                </div>
              )}

              {activeTab === "recruitments" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "24px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        color: "#122359",
                        fontWeight: 800,
                      }}
                    >
                      Active Recruitments
                    </h4>

                    <button
                      className="btn btn-default btn-sm"
                      style={{
                        borderRadius: "12px",
                        fontWeight: 700,
                        padding: "10px 18px",
                        boxShadow: "0 8px 18px rgba(255,163,0,0.18)",
                      }}
                      onClick={() =>
                        showToast("Redirecting to post a new job…", "info")
                      }
                    >
                      <i
                        className="fi fi-rr-plus"
                        style={{ marginRight: "6px" }}
                      />
                      Post New Job
                    </button>
                  </div>

                  <div className="box-list-jobs display-list">
                    {recruitmentCards.map((job) => (
                      <div className="col-xl-12 col-12" key={job.id}>
                        <div
                          className="card-grid-2 hover-up cv-search-candidate-card"
                          style={{
                            marginBottom: "20px",
                          }}
                        >
                          <div
                            className="card-block-info"
                            style={{
                              padding: "26px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                gap: "14px",
                              }}
                            >
                              <div>
                                <h4
                                  style={{
                                    margin: "0 0 8px",
                                    fontSize: "22px",
                                    fontWeight: 700,
                                    color: "#122359",
                                    transition: "all .25s ease",
                                  }}
                                >
                                  <Link href="/employeer/applicants">
                                    {job.title}
                                  </Link>
                                </h4>

                                <div
                                  className="mt-5"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span className="card-briefcase">
                                    {job.type}
                                  </span>

                                  <span className="card-time">
                                    {job.posted}
                                  </span>

                                  <span
                                    className="card-location"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      marginLeft: 0,
                                    }}
                                  >
                                    <i
                                      className="fi fi-rr-marker"
                                      style={{
                                        fontSize: "12px",
                                        color: "#66789c",
                                        lineHeight: 1,
                                      }}
                                    />
                                    {job.location}
                                  </span>
                                </div>
                              </div>

                              <div
                                style={{
                                  textAlign: "right",
                                  minWidth: "150px",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 800,
                                    color: "#122359",
                                    fontSize: "20px",
                                    marginBottom: "5px",
                                  }}
                                >
                                  {job.salary}
                                </div>

                                <div
                                  style={{
                                    fontSize: "13px",
                                    color: "#66789c",
                                    fontWeight: 600,
                                  }}
                                >
                                  {job.applicants} applicants
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: "16px",
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              {job.tags.map((tag) => (
                                <span
                                  key={tag}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "7px 14px",
                                    borderRadius: "999px",
                                    background: "#fff7ea",
                                    border: "1px solid rgba(255,163,0,0.18)",
                                    color: "#ff9900",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    transition: "all .25s ease",
                                    boxShadow:
                                      "0 4px 10px rgba(255,163,0,0.08)",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.background =
                                      "#ffa300";
                                    e.currentTarget.style.color = "#ffffff";
                                    e.currentTarget.style.boxShadow =
                                      "0 10px 18px rgba(255,163,0,0.22)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0px)";
                                    e.currentTarget.style.background =
                                      "#fff7ea";
                                    e.currentTarget.style.color = "#ff9900";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 10px rgba(255,163,0,0.08)";
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div
                              className="card-2-bottom mt-20"
                              style={{
                                paddingTop: "20px",
                                borderTop: "1px solid rgba(18,35,89,0.06)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <Link
                                  href="/employeer/applicants"
                                  className="btn btn-default"
                                  style={{
                                    background: "#ffa300",
                                    borderColor: "#ffa300",
                                    color: "#ffffff",
                                    borderRadius: "12px",
                                    padding: "10px 18px",
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    transition: "all .25s ease",
                                    boxShadow:
                                      "0 8px 20px rgba(255,163,0,0.22)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 14px 28px rgba(255,163,0,0.32)";
                                    e.currentTarget.style.background =
                                      "#ff9900";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 8px 20px rgba(255,163,0,0.22)";
                                    e.currentTarget.style.background =
                                      "#ffa300";
                                  }}
                                >
                                  <i className="fi fi-rr-users" />
                                  View Applicants
                                </Link>

                                <button
                                  className="btn btn-border btn-sm"
                                  style={{
                                    borderRadius: "12px",
                                    fontWeight: 700,
                                    padding: "10px 16px",
                                  }}
                                  onClick={() =>
                                    showToast(
                                      `Editing job: "${job.title}"`,
                                      "info",
                                    )
                                  }
                                >
                                  Edit Job
                                </button>

                                <button
                                  className="btn btn-grey-small"
                                  style={{
                                    borderRadius: "12px",
                                    fontWeight: 700,
                                    padding: "10px 16px",
                                  }}
                                  onClick={() =>
                                    showToast(
                                      `Job "${job.title}" paused.`,
                                      "warning",
                                    )
                                  }
                                >
                                  Pause
                                </button>
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h4 style={{ margin: 0 }}>Team Members</h4>
                    <button
                      className="btn btn-default btn-sm"
                      onClick={() =>
                        showToast(
                          "Invite member — enter email to send invitation.",
                          "info",
                        )
                      }
                    >
                      + Invite Member
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {people.map((p) => (
                      <div
                        key={p.name}
                        className="employer-cv-surface-card"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "16px 20px",
                          borderRadius: "16px",
                        }}
                      >
                        <div
                          style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "50%",
                            background: "#ffa300",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "15px",
                            flexShrink: 0,
                          }}
                        >
                          {p.initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", color: "#122359" }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            {p.role} · {p.email}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-border btn-sm"
                            onClick={() =>
                              showToast(`Editing profile for ${p.name}`, "info")
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-grey-small"
                            onClick={() =>
                              showToast(
                                `Access revoked for ${p.name}.`,
                                "warning",
                              )
                            }
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-4 col-md-12 col-sm-12 col-12 pl-40 pl-lg-15 mt-lg-30">
              <div className="sidebar-border employer-cv-surface-card">
                <div className="sidebar-heading">
                  <div className="avatar-sidebar">
                    <div className="sidebar-info pl-0">
                      <span className="sidebar-company">
                        {company.displayName}
                      </span>
                      <span className="card-location">{company.location}</span>
                    </div>
                  </div>
                </div>
                <div className="sidebar-list-job">
                  <div className="box-map">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120703.02652159374!2d72.8776559!3d19.0760907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63f3f9f8f79%3A0x3f6453f9b6f5e231!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1712832000000!5m2!1sen!2sin"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
                <div className="sidebar-list-job">
                  <ul>
                    {[
                      {
                        icon: "fi-rr-briefcase",
                        label: "Sector",
                        value: company.industry,
                      },
                      {
                        icon: "fi-rr-users",
                        label: "Company Size",
                        value: company.size,
                      },
                      {
                        icon: "fi-rr-marker",
                        label: "Location",
                        value: company.location,
                      },
                      {
                        icon: "fi-rr-dollar",
                        label: "Salary Band",
                        value: "INR 35k – INR 75k/month",
                      },
                      {
                        icon: "fi-rr-clock",
                        label: "Member since",
                        value: "Jul 2012",
                      },
                      {
                        icon: "fi-rr-time-fast",
                        label: "Last job posted",
                        value: "1 day ago",
                      },
                    ].map((item) => (
                      <li key={item.label}>
                        <div className="sidebar-icon-item">
                          <i className={item.icon}></i>
                        </div>
                        <div className="sidebar-text-info">
                          <span className="text-description">{item.label}</span>
                          <strong className="small-heading">
                            {item.value}
                          </strong>
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
              <div
                className="sidebar-border-bg bg-right"
                style={{ marginTop: "20px" }}
              >
                <span className="text-grey">WE ARE</span>
                <span className="text-hiring">HIRING</span>
                <p className="font-xxs color-text-paragraph mt-5">
                  Offshore and domestic trade positions are open. View active
                  roles in the Recruitments tab.
                </p>
                <div className="mt-15">
                  <button
                    className="btn btn-paragraph-2"
                    onClick={() => setActiveTab("recruitments")}
                  >
                    View Open Roles
                  </button>
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
