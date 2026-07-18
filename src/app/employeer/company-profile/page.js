"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useEffect } from "react";
import companyProfileService from "@/services/recruiter/companyProfileService";
import {
  getRecruiterJobs,
  pauseJob,
  resumeJob,
} from "@/services/recruiter/recruiterJobListService";
import {
  getSubUsers,
  deactivateSubUser,
  reactivateSubUser,
  resendInvite,
} from "@/services/recruiter/recruiterSubUserService";
import styles from "./company-profile.module.css";

// Same option set used in the employer registration wizard (src/app/register/page.js)
// kept in sync here so the profile page always mirrors what a recruiter saw at sign-up.
const INDUSTRIES = [
  "Construction & Infrastructure",
  "Marine & Shipping",
  "Oil & Gas",
  "Manufacturing",
  "Logistics & Transportation",
  "Warehousing & Supply Chain",
  "Hospitality & Facilities",
  "Ports & Terminals",
  "Mining",
  "Aviation",
  "Renewable Energy",
  "Engineering Services",
  "Healthcare",
  "IT & Technology",
  "Retail",
  "Other",
];

const BUSINESS_TYPES = [
  "Private Limited",
  "Public Limited",
  "Limited Liability Partnership (LLP)",
  "Partnership",
  "Sole Proprietorship",
  "One Person Company (OPC)",
  "Section 8 Company (Non-Profit)",
  "Trust",
  "Society",
  "Cooperative Society",
  "Public Sector Undertaking (PSU)",
  "Government Entity",
  "Branch Office",
  "Liaison Office",
  "Joint Venture",
  "Other",
];

// ── Helpers for formatting live job & team-member data ──────────
const getTimeAgo = (dateString) => {
  if (!dateString) return "Recently";
  const now = new Date();
  const postedDate = new Date(dateString);
  const diffInMs = now - postedDate;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
};

const formatSalary = (job) => {
  const currency = job.salaryCurrency || "INR";
  const min = job.salaryMin;
  const max = job.salaryMax;

  if (!min && !max) return "Not disclosed";
  if (min && max && min !== max) {
    return `${currency} ${min.toLocaleString("en-IN")} - ${max.toLocaleString("en-IN")}/mo`;
  }
  return `${currency} ${(max || min).toLocaleString("en-IN")}/mo`;
};

const mapJobToCard = (job) => ({
  id: job.jobId,
  jobId: job.jobId,
  title: job.jobTitle,
  location: job.location || "—",
  type: job.employmentType || job.jobType || "—",
  salary: formatSalary(job),
  applicants: job.appliedCount ?? 0,
  posted: getTimeAgo(job.publishedAt || job.createdAt),
  status: job.jobStatus,
  tags: [job.tradeCategory, job.role, job.employmentMode, job.locationType].filter(
    (t) => !!t && t !== "string",
  ),
});

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
};

const mapSubUserToPerson = (u) => ({
  subUserId: u.subUserId,
  name: u.subUserName,
  role: u.role,
  email: u.subUserEmail,
  status: u.status,
  initials: getInitials(u.subUserName),
});

const Field = ({ label, children }) => (
  <div className={styles.field}>
    <label className={styles.label}>
      {label}
    </label>

    {children}
  </div>
);

const Inp = (props) => (
  <input
    {...props}
    className={styles.control}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={styles.textarea}
  />
);

// Dropdown-with-free-text field, same pattern used in the registration wizard's
// Business Type / Industry pickers — lets existing saved values that aren't in
// the preset list (e.g. custom text typed at registration) still display correctly.
const Combobox = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const query = value || "";
  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        className={styles.control}
        value={query}
        placeholder={placeholder || "Type or select…"}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 40,
            background: "#fff",
            border: "1px solid rgba(18,35,89,0.12)",
            borderRadius: 8,
            boxShadow: "0 12px 28px rgba(18,35,89,0.14)",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {filtered.map((opt) => (
            <div
              key={opt}
              onMouseDown={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                padding: "9px 14px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#122359",
                background: opt === query ? "#FFF4E0" : "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF4E0")}
              onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                opt === query ? "#FFF4E0" : "transparent")
              }
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// const EditFieldModal = ({ field, value, onClose, onSave }) => {
//   const [val, setVal] = useState(value ?? "");
//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 9999,
//         background: "rgba(0,0,0,0.5)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "20px",
//       }}
//     >
//       <div
//         style={{
//           background: "#fff",
//           borderRadius: "12px",
//           width: "100%",
//           maxWidth: "480px",
//           boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
//         }}
//       >
//         <div
//           style={{
//             padding: "18px 24px 14px",
//             borderBottom: "1px solid #eee",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <h5 style={{ margin: 0, color: "#122359" }}>Edit: {field}</h5>
//           <button
//             onClick={onClose}
//             style={{
//               background: "none",
//               border: "none",
//               fontSize: "22px",
//               cursor: "pointer",
//             }}
//           >
//             ×
//           </button>
//         </div>
//         <div style={{ padding: "20px 24px 24px" }}>
//           <div className="form-group">
//             <label className="font-sm color-text-mutted mb-10">{field}</label>
//             <input
//               className="form-control"
//               value={val ?? ""}
//               onChange={(e) => setVal(e.target.value)}
//             />
//           </div>
//           <div
//             style={{
//               display: "flex",
//               gap: "10px",
//               justifyContent: "flex-end",
//               marginTop: "12px",
//             }}
//           >
//             <button className="btn btn-border btn-sm" onClick={onClose}>
//               Cancel
//             </button>
//             <button
//               className="btn btn-default btn-sm"
//               onClick={() => {
//                 onSave(val);
//                 onClose();
//               }}
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// Renders one labeled section of editable rows, reused across Basic Info,
// Online Presence, Address, and Contact blocks.
// const FieldSection = ({ title, rows, company, onEdit }) => (
//   <>
//     <h4
//       className="mt-30"
//       style={{
//         color: "#122359",
//         fontWeight: 700,
//         marginBottom: "20px",
//       }}
//     >
//       {title}
//     </h4>
//     <div
//       style={{
//         background: "#ffffff",
//         borderRadius: "20px",
//         border: "1px solid rgba(18,35,89,0.06)",
//         overflow: "hidden",
//         boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
//         marginBottom: "28px",
//       }}
//     >
//       {rows.map((row, index) => (
//         <div
//           key={row.key}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: "18px",
//             padding: "18px 22px",
//             borderBottom:
//               index !== rows.length - 1
//                 ? "1px solid rgba(18,35,89,0.06)"
//                 : "none",
//             transition: "all .35s ease",
//             border: "1px solid transparent",
//             position: "relative",
//             background: "#ffffff",
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = "#fffaf2";
//             e.currentTarget.style.transform = "translateY(-3px)";
//             e.currentTarget.style.borderColor = "rgba(255,153,0,0.28)";
//             e.currentTarget.style.boxShadow =
//               "0 12px 28px rgba(255,163,0,0.10)";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = "#ffffff";
//             e.currentTarget.style.transform = "translateY(0px)";
//             e.currentTarget.style.borderColor = "transparent";
//             e.currentTarget.style.boxShadow = "none";
//           }}
//         >
//           <div style={{ minWidth: "180px" }}>
//             <div
//               style={{
//                 fontSize: "12px",
//                 fontWeight: 700,
//                 textTransform: "uppercase",
//                 letterSpacing: ".5px",
//                 color: "#ff9900",
//                 marginBottom: "4px",
//               }}
//             >
//               {row.label}
//             </div>

//             <div
//               style={{
//                 color: "#122359",
//                 fontSize: "15px",
//                 fontWeight: 600,
//                 wordBreak: "break-word",
//               }}
//             >
//               {row.key === "website" ? (
//                 company.website ? (
//                   <a
//                     href={`https://${company.website.replace(/^https?:\/\//, "")}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{ color: "#122359", textDecoration: "underline" }}
//                   >
//                     {company.website}
//                   </a>
//                 ) : (
//                   "—"
//                 )
//               ) : row.key === "highlights" ? (
//                 Array.isArray(company.highlights) &&
//                 company.highlights.length > 0
//                   ? company.highlights.join(", ")
//                   : "—"
//               ) : (
//                 company[row.key] || "—"
//               )}
//             </div>
//           </div>

//           <button
//             className="btn btn-border btn-sm"
//             style={{
//               borderRadius: "10px",
//               padding: "8px 14px",
//               fontWeight: 600,
//               minWidth: "90px",
//               transition: "all .25s ease",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = "#122359";
//               e.currentTarget.style.color = "#ffffff";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = "#ffffff";
//               e.currentTarget.style.color = "#122359";
//             }}
//             onClick={() =>
//               onEdit({
//                 field: row.label,
//                 key: row.key,
//                 value:
//                   row.key === "highlights"
//                     ? (company.highlights || []).join(", ")
//                     : company[row.key] ?? "",
//               })
//             }
//           >
//             <i className="fi fi-rr-edit" style={{ marginRight: "5px" }} />
//             Edit
//           </button>
//         </div>
//       ))}
//     </div>
//   </>
// );

// Read-only section for verification / system-managed fields — no Edit button,
// since these come from GST/POE/RPSL verification flows or are system-set.
const ReadOnlySection = ({ title, rows, company }) => (
  <>
    <h4
      className="mt-30"
      style={{ color: "#122359", fontWeight: 700, marginBottom: "20px" }}
    >
      {title}
    </h4>
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "20px",
        border: "1px solid rgba(18,35,89,0.06)",
        overflow: "hidden",
        marginBottom: "28px",
      }}
    >
      {rows.map((row, index) => (
        <div
          key={row.key}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            padding: "16px 22px",
            borderBottom:
              index !== rows.length - 1
                ? "1px solid rgba(18,35,89,0.06)"
                : "none",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".5px",
              color: "#66789c",
            }}
          >
            {row.label}
          </div>
          <div style={{ color: "#122359", fontSize: "14px", fontWeight: 600 }}>
            {String(company[row.key] ?? "—")}
          </div>
        </div>
      ))}
    </div>
  </>
);

const SectionCard = ({
  title,
  subtitle,
  children,
  onUpdate,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionBody}>
        <div style={{ marginBottom: 24 }}>
          <h5 className={styles.sectionTitle}>
            {title}
          </h5>

          {subtitle && (
            <p className={styles.sectionSub}>
              {subtitle}
            </p>
          )}
        </div>

        {children}

        <div className={styles.stepActions}>
          <button
            type="button"
            className={`btn btn-default ${styles.continueBtn}`}
            onClick={onUpdate}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};
export default function EmployerCompanyProfilePage() {
  const showToast = useToast();
  const [activeTab, setActiveTab] = useState("about");
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(true);
  // const [editModal, setEditModal] = useState(null);
  const [description, setDescription] = useState("");
  const [officeSameAsAddress, setOfficeSameAsAddress] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Recruitments tab (live job postings)
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // People tab (live sub-users / team members)
  const [people, setPeople] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(true);

  useEffect(() => {
    loadCompanyProfile();
    loadJobs();
    loadPeople();
  }, []);

  // Combine the registered-address fields above into one display string,
  // used both to detect an existing match (to auto-check the box) and to
  // keep Office Address synced while "same as registered address" is on.
  const buildRegisteredAddress = () =>
    [
      company.addressLine1,
      company.addressLine2,
      company.city,
      company.state,
      company.pincode,
      company.country,
    ]
      .filter(Boolean)
      .join(", ");

  useEffect(() => {
    if (!officeSameAsAddress) return;
    const combined = buildRegisteredAddress();
    if (company.officeAddress !== combined) {
      handleInputChange("officeAddress", combined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    officeSameAsAddress,
    company.addressLine1,
    company.addressLine2,
    company.city,
    company.state,
    company.pincode,
    company.country,
  ]);

  const loadJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await getRecruiterJobs({ pageSize: 50 });
      const list = (response?.jobs || []).map(mapJobToCard);
      setJobs(list);
    } catch (error) {
      console.error(error);
      showToast("Failed to load recruitments", "error");
    } finally {
      setJobsLoading(false);
    }
  };

  const loadPeople = async () => {
    try {
      setPeopleLoading(true);
      const response = await getSubUsers();
      const list = (response?.subUsers || []).map(mapSubUserToPerson);
      setPeople(list);
    } catch (error) {
      console.error(error);
      showToast("Failed to load team members", "error");
    } finally {
      setPeopleLoading(false);
    }
  };

  const handleTogglePause = async (job) => {
    try {
      const res =
        job.status === "Paused"
          ? await resumeJob(job.jobId)
          : await pauseJob(job.jobId);

      showToast(res?.message || "Job updated", "success");
      await loadJobs();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Unable to update job",
        "error",
      );
    }
  };

  const handleRevokeAccess = async (person) => {
    try {
      let res;
      if (person.status === "Deactivated") {
        res = await reactivateSubUser(person.subUserId);
      } else if (person.status === "Pending") {
        res = await resendInvite(person.subUserId);
      } else {
        res = await deactivateSubUser(person.subUserId);
      }

      showToast(res?.message || "Team member updated", "success");
      await loadPeople();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Unable to update team member",
        "error",
      );
    }
  };

  const loadCompanyProfile = async () => {
    try {
      setLoading(true);

      const data = await companyProfileService.getCompanyProfile();

      setCompany({
        // Basic info
        name: data.legalName ?? "",
        legalName: data.legalName ?? "",
        tradeName: data.tradeName ?? "",
        displayName: data.companyDisplayName ?? "",
        companyDisplayName: data.companyDisplayName ?? "",
        companyDescription: data.companyDescription ?? "",
        industry: data.industryType ?? "",
        industryType: data.industryType ?? "",
        businessType: data.businessType ?? "",
        size: data.companySize ?? "",
        companySize: data.companySize ?? "",
        founded: data.yearEstablished ?? "",
        yearEstablished: data.yearEstablished ?? "",
        totalEmployees: data.totalEmployees ?? "",
        companyLogoUrl: data.companyLogoUrl ?? "",
        coverImageUrl: data.coverImageUrl ?? "",
        highlights: data.companyHighlights ?? [],
        timeZone: data.timeZone ?? "",

        // Online presence
        website: data.websiteUrl ?? "",
        websiteUrl: data.websiteUrl ?? "",
        linkedInUrl: data.linkedInUrl ?? "",
        instagramUrl: data.instagramUrl ?? "",
        facebookUrl: data.facebookUrl ?? "",

        // Address
        location: `${data.city ?? ""}, ${data.state ?? ""}`,
        addressLine1: data.addressLine1 ?? "",
        addressLine2: data.addressLine2 ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        pincode: data.pincode ?? "",
        country: data.country ?? "",
        officeAddress: data.officeAddress ?? "",

        // Contact
        phone: data.companyPhoneNo ?? "",
        contactPhone: data.companyPhoneNo ?? "",
        email: data.companyEmail ?? "",
        contactEmailPublic: data.companyEmail ?? "",
        contactPersonName: data.contactPersonName ?? "",
        designation: data.designation ?? "",
        operatingHours: data.operatingHours ?? "",

        // Verification & status (read-only here)
        gstRegistered: data.gstRegistered ? "Yes" : "No",
        gstNo: data.gstn ?? "",
        pan: data.pan ?? "",
        cin: data.cin ?? "",
        accountStatus: data.accountStatus ?? "",
        profileCompletionScore:
          data.profileCompletionScore != null
            ? `${data.profileCompletionScore}%`
            : "",
        trialExpiresAt: data.trialExpiresAt
          ? new Date(data.trialExpiresAt).toLocaleDateString()
          : "",
        reviewCount: data.reviewCount ?? 0,
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
    const apiField = fieldApiMap[field];

    if (!apiField) {
      throw new Error(`Field not supported: ${field}`);
    }

    const payloadValue = field === "highlights"
      ? val
      : val;

    try {
      console.log("SENDING:");
      console.log(apiField, payloadValue);

      await companyProfileService.updateCompanyProfileField(
        apiField,
        payloadValue
      );

      setCompany((prev) => ({
        ...prev,
        [field]: payloadValue,
      }));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profileUpdate"));
      }

    } catch (error) {
      console.log("FAILED FIELD:", field);
      console.log("API FIELD:", apiField);
      console.log("VALUE:", payloadValue);
      console.log("ERROR:", error.response?.data);

      throw error;
    }
  };

  const handleInputChange = (field, value) => {
    setCompany((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlurSave = (field) => {
    handleSaveField(field, company[field]);
  };

  // Uploads a logo/cover image file via multipart/form-data PATCH to the
  // company profile endpoint. The backend only returns { success, message }
  // (no updated URL), so after a successful upload we re-fetch the full
  // profile to pick up the real, persisted image URL — using a blob preview
  // or a guessed URL here would look fine until the next reload, then
  // silently revert.
  const handleFileUpload = async (fieldKey, apiField, file, setUploading) => {
    if (!file) return;

    // Show an instant local preview while the upload is in flight.
    const previewUrl = URL.createObjectURL(file);
    setCompany((prev) => ({ ...prev, [fieldKey]: previewUrl }));

    try {
      setUploading(true);

      await companyProfileService.updateCompanyProfileFile(apiField, file);

      // Re-fetch so the UI reflects the actual persisted URL from the server.
      await loadCompanyProfile();

      showToast("Image updated successfully", "success");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profileUpdate"));
      }
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message || "Failed to upload image",
        "error",
      );
      // Roll back the optimistic preview on failure by reloading the
      // last-known-good profile from the server.
      await loadCompanyProfile();
    } finally {
      setUploading(false);
    }
  };

const updateBasicInfo = async () => {
  if (descriptionOverLimit) {
    showToast(
      `Company Description is over the ${DESCRIPTION_WORD_LIMIT}-word limit (${descriptionWordCount} words). Please shorten it.`,
      "error"
    );
    return;
  }

  try {
    await Promise.all([
      handleSaveField("legalName", company.legalName),
      handleSaveField("tradeName", company.tradeName),
      handleSaveField("displayName", company.displayName),
      handleSaveField("industry", company.industry),
      handleSaveField("businessType", company.businessType),
      handleSaveField("size", company.size),
      handleSaveField("totalEmployees", company.totalEmployees),
      handleSaveField("founded", company.founded),
      handleSaveField("timeZone", company.timeZone),
      handleSaveField("highlights", company.highlights || []),
      handleSaveField("companyDescription", description),
    ]);

    showToast("Basic info updated successfully", "success");
  } catch (error) {
    console.log(error);
    console.log(error.response?.data);

    showToast(
      error?.response?.data?.message ||
      "Failed to update basic info",
      "error"
    );
  }
};

  const updateOnlinePresence = async () => {
    await Promise.all([
      handleSaveField("website", company.website),
      handleSaveField("linkedInUrl", company.linkedInUrl),
      handleSaveField("instagramUrl", company.instagramUrl),
      handleSaveField("facebookUrl", company.facebookUrl),
    ]);

    showToast("Online presence updated", "success");
  };

  const updateAddress = async () => {
    await Promise.all([
      handleSaveField("addressLine1", company.addressLine1),
      handleSaveField("addressLine2", company.addressLine2),
      handleSaveField("city", company.city),
      handleSaveField("state", company.state),
      handleSaveField("pincode", company.pincode),
      handleSaveField("country", company.country),
      handleSaveField("officeAddress", company.officeAddress),
    ]);

    showToast("Address updated", "success");
  };

  const updateContact = async () => {
    await Promise.all([
      handleSaveField("phone", company.phone),
      handleSaveField("email", company.email),
      handleSaveField("contactPersonName", company.contactPersonName),
      handleSaveField("designation", company.designation),
      handleSaveField("operatingHours", company.operatingHours),
    ]);

    showToast("Contact updated", "success");
  };
const countWords = (text) =>
  (text || "").trim().split(/\s+/).filter(Boolean).length;

const DESCRIPTION_WORD_LIMIT = 300;
const descriptionWordCount = countWords(description);
const descriptionOverLimit = descriptionWordCount > DESCRIPTION_WORD_LIMIT;
  // const basicInfoRows = [
  //   { label: "Legal Name", key: "legalName" },
  //   { label: "Trade Name", key: "tradeName" },
  //   { label: "Display Name", key: "displayName" },
  //   { label: "Industry", key: "industry" },
  //   { label: "Business Type", key: "businessType" },
  //   { label: "Company Size", key: "size" },
  //   { label: "Total Employees", key: "totalEmployees" },
  //   { label: "Founded", key: "founded" },
  //   { label: "Company Highlights", key: "highlights" },
  //   { label: "Time Zone", key: "timeZone" },
  // ];

  // const onlinePresenceRows = [
  //   { label: "Website", key: "website" },
  //   { label: "LinkedIn", key: "linkedInUrl" },
  //   { label: "Instagram", key: "instagramUrl" },
  //   { label: "Facebook", key: "facebookUrl" },
  // ];

  // const addressRows = [
  //   { label: "Address Line 1", key: "addressLine1" },
  //   { label: "Address Line 2", key: "addressLine2" },
  //   { label: "City", key: "city" },
  //   { label: "State", key: "state" },
  //   { label: "Pincode", key: "pincode" },
  //   { label: "Country", key: "country" },
  //   { label: "Office Address", key: "officeAddress" },
  // ];

  // const contactRows = [
  //   { label: "Contact Phone", key: "phone" },
  //   { label: "Contact Email", key: "email" },
  //   { label: "Contact Person", key: "contactPersonName" },
  //   { label: "Designation", key: "designation" },
  //   { label: "Operating Hours", key: "operatingHours" },
  // ];

  const verificationRows = [
    { label: "GST Registered", key: "gstRegistered" },
    { label: "GST Number", key: "gstNo" },
    { label: "PAN", key: "pan" },
    { label: "CIN", key: "cin" },
    { label: "Account Status", key: "accountStatus" },
    { label: "Profile Completion", key: "profileCompletionScore" },
    // { label: "Trial Expires", key: "trialExpiresAt" },
    // { label: "Review Count", key: "reviewCount" },
  ];

  // Maps the row `key` used in UI state to the exact field name expected by
  // UpdateCompanyProfileAsync's PATCH body (matches UpdateCompanyProfileDto).
  const fieldApiMap = {
    legalName: "LegalName",
    tradeName: "TradeName",
    displayName: "CompanyDisplayName",
    companyDescription: "CompanyDescription",
    industry: "IndustryType",
    businessType: "BusinessType",
    size: "CompanySize",
    totalEmployees: "TotalEmployees",
    founded: "YearEstablished",
    highlights: "CompanyHighlights",
    timeZone: "TimeZone",

    website: "WebsiteUrl",
    linkedInUrl: "LinkedInUrl",
    instagramUrl: "InstagramUrl",
    facebookUrl: "FacebookUrl",

    addressLine1: "AddressLine1",
    addressLine2: "AddressLine2",
    city: "City",
    state: "State",
    pincode: "Pincode",
    country: "Country",
    officeAddress: "OfficeAddress",

    phone: "CompanyPhoneNo",
    email: "CompanyEmail",
    contactPersonName: "ContactPersonName",
    designation: "Designation",
    operatingHours: "OperatingHours",
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
          <div className="banner-hero banner-image-single" style={{ position: "relative" }}>
            <img
              src={company?.coverImageUrl || "/assets/imgs/page/company/img.png"}
              alt="company banner"
              style={{
                width: "100%",
                borderRadius: "10px",
                objectFit: "cover",
                maxHeight: "320px",
              }}
            />
            <label
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                background: "rgba(18,35,89,0.85)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {uploadingCover ? "Uploading…" : "Change Cover"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) =>
                  handleFileUpload(
                    "coverImageUrl",
                    "CoverImage",
                    e.target.files?.[0],
                    setUploadingCover,
                  )
                }
              />
            </label>
          </div>

          <div className="box-company-profile" style={{
            position: "relative",
            zIndex: 5,
            marginTop: "-40px",
          }}>
            <div
              className="image-compay"
              style={{
                position: "relative",
                zIndex: 10,
                width: "110px",
              }}
            >
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
              <label
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "#ffa300",
                  color: "#fff",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
                title={uploadingLogo ? "Uploading…" : "Change Logo"}
              >
                <i className="fi fi-rr-edit" />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleFileUpload(
                      "companyLogoUrl",
                      "CompanyLogo",
                      e.target.files?.[0],
                      setUploadingLogo,
                    )
                  }
                />
              </label>
            </div>
            <div className="row mt-2">
              <div className="col-lg-8 col-md-12">
                <h5 className="f-18">
                  {company.displayName}
                  
                </h5>
                <p className=" font-md color-text-paragraph-2 mb-15">
                  {company.tagline}
                </p>
                {/* Stats row */}
                {/* <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
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
                </div> */}
              </div>
              <span className="card-location font-regular ml-20">
                    {company.location}
                  </span>
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
                  {/* <div className="form-group mb-20">
                    <label className="form-label">Company description</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={description ?? ""}
                      onChange={(e) => setDescription(e.target.value)}
                    // onBlur={handleDescriptionBlur}
                    />
                    <p className="font-xs color-text-paragraph-2 mb-0 mt-5">
                      Keep this summary concise and role-focused so candidates
                      quickly understand your hiring needs.
                    </p>
                  </div> */}


                  <SectionCard
                    // title="Basic Information"
                    // subtitle="Core company information"
                    onUpdate={updateBasicInfo}
                  >

                    <h4 style={{ color: "#122359" }}>Basic Info</h4>
                    <p >
                      Core company information and business details
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0 20px",
                      }}
                    >
                      <Field label="Legal Name">
                        <Inp
                          value={company.legalName || ""}
                          onChange={(e) =>
                            handleInputChange("legalName", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("legalName")}
                        />
                      </Field>

                      <Field label="Trade Name">
                        <Inp
                          value={company.tradeName || ""}
                          onChange={(e) =>
                            handleInputChange("tradeName", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("tradeName")}
                        />
                      </Field>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0 20px",
                      }}
                    >
                      <Field label="Display Name">
                        <Inp
                          value={company.displayName || ""}
                          onChange={(e) =>
                            handleInputChange("displayName", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("displayName")}
                        />
                      </Field>

                      <Field label="Industry">
                        <Combobox
                          value={company.industry || ""}
                          onChange={(v) => handleInputChange("industry", v)}
                          options={INDUSTRIES}
                          placeholder="Type or select industry…"
                        />
                      </Field>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0 20px",
                      }}
                    >
                      <Field label="Business Type">
                        <Combobox
                          value={company.businessType || ""}
                          onChange={(v) => handleInputChange("businessType", v)}
                          options={BUSINESS_TYPES}
                          placeholder="Type or select business type…"
                        />
                      </Field>

                      <Field label="Company Size">
                        <select
                          className={styles.control}
                          value={company.size || ""}
                          onChange={(e) =>
                            handleInputChange("size", e.target.value)
                          }
                        >
                          <option value="">--</option>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="201-500">201-500</option>
                          <option value="500+">500+</option>
                        </select>
                      </Field>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "0 20px",
                      }}
                    >
                      <Field label="Total Employees">
                        <Inp
                          type="number"
                          min="0"
                          value={company.totalEmployees ?? ""}
                          onChange={(e) =>
                            handleInputChange("totalEmployees", e.target.value)
                          }
                        />
                      </Field>

                      <Field label="Founded (Year)">
                        <Inp
                          type="number"
                          min="1800"
                          max={new Date().getFullYear()}
                          placeholder="e.g. 2015"
                          value={company.founded ?? ""}
                          onChange={(e) =>
                            handleInputChange("founded", e.target.value)
                          }
                        />
                      </Field>

                      <Field label="Time Zone">
                        <Inp
                          placeholder="e.g. Asia/Kolkata"
                          value={company.timeZone || ""}
                          onChange={(e) =>
                            handleInputChange("timeZone", e.target.value)
                          }
                        />
                      </Field>
                    </div>

                    <Field label="Company Highlights">
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#66789c",
                          marginBottom: "8px",
                          marginTop: "-4px",
                        }}
                      >
                        Enter comma-separated values (e.g. ISO Certified, Offshore Projects, 500+ Employees)
                      </p>

                      <Textarea
                        rows={3}
                        value={(company.highlights || []).join(", ")}
                        onChange={(e) =>
                          handleInputChange(
                            "highlights",
                            e.target.value.split(",").map((item) => item.trim())
                          )
                        }
                      />
                    </Field>
                   <Field label="Company Description">
  <p
    style={{
      fontSize: "12px",
      color: "#66789c",
      marginTop: "8px",
      marginBottom: 0,
    }}
  >
    Keep this summary concise and role-focused so candidates
    quickly understand your hiring needs.
  </p>
  <Textarea
    rows={10}
    value={description ?? ""}
    onChange={(e) => setDescription(e.target.value)}
    style={{
      minHeight: "240px",
      borderColor: descriptionOverLimit ? "#dc2626" : undefined,
    }}
  />
  <p
    style={{
      fontSize: "12px",
      marginTop: "6px",
      marginBottom: 0,
      fontWeight: 600,
      color: descriptionOverLimit ? "#dc2626" : "#94a3b8",
      textAlign: "right",
    }}
  >
    {descriptionWordCount} / {DESCRIPTION_WORD_LIMIT} words
    {descriptionOverLimit && " — please shorten"}
  </p>
</Field>

                  </SectionCard>


                  <SectionCard
                    // title="Online Presence"
                    // subtitle=""
                    onUpdate={updateOnlinePresence}
                  >
                    <h4 style={{ color: "#122359" }}>Online Presence</h4>
                    <p>Website and social media links</p>

                    <Field label="Website">
                      <Inp
                        value={company.website || ""}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                      />
                    </Field>

                    <Field label="LinkedIn">
                      <Inp
                        value={company.linkedInUrl || ""}
                        onChange={(e) =>
                          handleInputChange("linkedInUrl", e.target.value)
                        }
                      />
                    </Field>

                    <Field label="Instagram">
                      <Inp
                        value={company.instagramUrl || ""}
                        onChange={(e) =>
                          handleInputChange("instagramUrl", e.target.value)
                        }
                      />
                    </Field>

                    <Field label="Facebook">
                      <Inp
                        value={company.facebookUrl || ""}
                        onChange={(e) =>
                          handleInputChange("facebookUrl", e.target.value)
                        }
                      />
                    </Field>
                  </SectionCard>

                  <SectionCard
                    // title="Address"
                    // subtitle="Office and location details"
                    onUpdate={updateAddress}
                  >
                    <h4 style={{ color: "#122359", marginBottom: "20px" }}>
                      Address
                    </h4>
                    <p className={styles.sectionSub}>
                      Registered office and business location details
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                      }}
                    >
                      <Field label="Address Line 1">
                        <Inp
                          value={company.addressLine1 || ""}
                          onChange={(e) =>
                            handleInputChange("addressLine1", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("addressLine1")}
                        />
                      </Field>

                      {/* <Field label="Address Line 2">
                        <Inp
                          value={company.addressLine2 || ""}
                          onChange={(e) =>
                            handleInputChange("addressLine2", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("addressLine2")}
                        />
                      </Field> */}

                      <Field label="City">
                        <Inp
                          value={company.city || ""}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("city")}
                        />
                      </Field>

                      <Field label="State">
                        <Inp
                          value={company.state || ""}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("state")}
                        />
                      </Field>

                      <Field label="Pincode">
                        <Inp
                          value={company.pincode || ""}
                          onChange={(e) =>
                            handleInputChange("pincode", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("pincode")}
                        />
                      </Field>

                      <Field label="Country">
                        <Inp
                          value={company.country || ""}
                          onChange={(e) =>
                            handleInputChange("country", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("country")}
                        />
                      </Field>
                    </div>

                    <Field label="Office Address">
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: officeSameAsAddress ? 0 : 10,
                          cursor: "pointer",
                          fontSize: "13px",
                          color: "#66789c",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={officeSameAsAddress}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setOfficeSameAsAddress(checked);
                            if (checked) {
                              handleInputChange(
                                "officeAddress",
                                buildRegisteredAddress()
                              );
                            }
                          }}
                          style={{ width: 16, height: 16, accentColor: "#ffa300" }}
                        />
                        Same as the address above
                      </label>
                      {!officeSameAsAddress && (
                        <Textarea
                          rows={3}
                          value={company.officeAddress || ""}
                          onChange={(e) =>
                            handleInputChange("officeAddress", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("officeAddress")}
                        />
                      )}
                    </Field>
                  </SectionCard>

                  <SectionCard
                    // title="Address"
                    // subtitle="Office and location details"
                    onUpdate={updateContact}
                  >
                    <h4 style={{ color: "#122359", marginBottom: "20px" }}>
                      Contact
                    </h4>
                    <p className={styles.sectionSub}>
                      Primary contact information and operating hours
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                      }}
                    >
                      <Field label="Contact Phone">
                        <Inp
                          value={company.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("phone")}
                        />
                      </Field>

                      <Field label="Contact Email">
                        <Inp
                          value={company.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("email")}
                        />
                      </Field>

                      <Field label="Contact Person">
                        <Inp
                          value={company.contactPersonName || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "contactPersonName",
                              e.target.value
                            )
                          }
                        // onBlur={() =>
                        //   handleBlurSave("contactPersonName")
                        // }
                        />
                      </Field>

                      <Field label="Designation">
                        <Inp
                          value={company.designation || ""}
                          onChange={(e) =>
                            handleInputChange("designation", e.target.value)
                          }
                        // onBlur={() => handleBlurSave("designation")}
                        />
                      </Field>
                    </div>

                    <Field label="Operating Hours">
                      <Inp
                        placeholder="e.g. Mon–Sat, 9:00 AM – 6:00 PM"
                        value={company.operatingHours || ""}
                        onChange={(e) =>
                          handleInputChange("operatingHours", e.target.value)
                        }
                      // onBlur={() => handleBlurSave("operatingHours")}
                      />
                    </Field>
                  </SectionCard>

                  <ReadOnlySection
                    title="Verification & Status"
                    rows={verificationRows}
                    company={company}
                  />
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

                    <Link
                      href="/dashboard/post-job"
                      className="btn btn-default btn-sm"
                      style={{
                        borderRadius: "12px",
                        fontWeight: 700,
                        padding: "10px 18px",
                        boxShadow: "0 8px 18px rgba(255,163,0,0.18)",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      <i
                        className="fi fi-rr-plus"
                        style={{ marginRight: "6px" }}
                      />
                      Post New Job
                    </Link>
                  </div>

                  {jobsLoading ? (
                    <p style={{ color: "#66789c" }}>Loading recruitments…</p>
                  ) : jobs.length === 0 ? (
                    <p style={{ color: "#66789c" }}>
                      No active job postings yet. Click “Post New Job” to
                      create one.
                    </p>
                  ) : (
                    <div className="box-list-jobs display-list">
                      {jobs.map((job) => (
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
                                    <Link
                                      href={`/employeer/applicants?jobId=${job.jobId}&jobTitle=${encodeURIComponent(job.title || "")}`}
                                    >
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
                                      {/* <i
                                        className="fi fi-rr-marker"
                                        style={{
                                          fontSize: "12px",
                                          color: "#66789c",
                                          lineHeight: 1,
                                        }}
                                      /> */}
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
                                    href={`/employeer/applicants?jobId=${job.jobId}&jobTitle=${encodeURIComponent(job.title || "")}`}
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

                                  <Link
                                    href={`/dashboard/post-job?jobId=${job.jobId}`}
                                    className="btn btn-border btn-sm"
                                    style={{
                                      borderRadius: "12px",
                                      fontWeight: 700,
                                      padding: "10px 16px",
                                    }}
                                  >
                                    Edit Job
                                  </Link>

                                  <button
                                    className="btn btn-grey-small"
                                    style={{
                                      borderRadius: "12px",
                                      fontWeight: 700,
                                      padding: "10px 16px",
                                    }}
                                    onClick={() => handleTogglePause(job)}
                                  >
                                    {job.status === "Paused" ? "Resume" : "Pause"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <Link
                      href="/employeer/sub-user"
                      className="btn btn-default btn-sm"
                    >
                      + Invite Member
                    </Link>
                  </div>

                  {peopleLoading ? (
                    <p style={{ color: "#66789c" }}>Loading team members…</p>
                  ) : people.length === 0 ? (
                    <p style={{ color: "#66789c" }}>
                      No team members yet. Click “Invite Member” to add one.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                    >
                      {people.map((p) => (
                        <div
                          key={p.subUserId}
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
                              {p.status ? ` · ${p.status}` : ""}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <Link
                              href="/employeer/sub-user"
                              className="btn btn-border btn-sm"
                            >
                              Edit
                            </Link>
                            <button
                              className="btn btn-grey-small"
                              onClick={() => handleRevokeAccess(p)}
                            >
                              {p.status === "Deactivated"
                                ? "Reactivate"
                                : p.status === "Pending"
                                  ? "Resend Invite"
                                  : "Revoke"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                        icon: "fi-rr-building",
                        label: "Company Size",
                        value: company.size,
                      },
                      {
                        icon: "fi-rr-marker",
                        label: "Location",
                        value: company.location,
                      },
                      {
                        icon: "fi-rr-briefcase",
                        label: "Business Type",
                        value: company.businessType,
                      },
                      {
                        icon: "fi-rr-calendar",
                        label: "Founded",
                        value: company.founded,
                      },
                      {
                        icon: "fi-rr-shield-check",
                        label: "Account Status",
                        value: company.accountStatus,
                      },
                    ].map((item) => (
                      <li key={item.label}>
                        <div className="sidebar-icon-item">
                          <i className={item.icon}></i>
                        </div>
                        <div className="sidebar-text-info">
                          <span className="text-description">{item.label}</span>
                          <strong className="small-heading">
                            {item.value || "—"}
                          </strong>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="sidebar-list-job">
                  <ul className="ul-disc">
                    <li>{buildRegisteredAddress() || "—"}</li>
                    <li>Phone: {company.phone}</li>
                    <li>Email: {company.email}</li>
                  </ul>
                </div>
              </div>
              {/* <div
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
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Edit field modal */}
      {/* {editModal && (
        <EditFieldModal
          field={editModal.field}
          value={editModal.value}
          onClose={() => setEditModal(null)}
          onSave={(val) => handleSaveField(editModal.key, val)}
        />
      )} */}
    </main>
  );
}