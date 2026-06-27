"use client";

import { useEffect, useRef, useState } from "react";
import {
  getVerification,
  uploadDocument,
} from "@/services/recruiter/recruiterVerificationService";

/* ── Icon mapping (backend does not send icons) ───────────────────────────── */
const BADGE_ICONS = {
  "GST Verified": "fi fi-rr-check",
  "PAN Verified": "fi fi-rr-id-badge",
  "POE Licensed": "fi fi-rr-shield-check",
  "RPSL Licensed": "fi fi-rr-diploma",
};

/* Document types that can actually be uploaded (matches backend enum) */
const UPLOADABLE_TYPES = [
  { value: "POE", label: "POE Licence" },
  { value: "RPSL", label: "RPSL Licence" },
  { value: "BUSINESS_REGISTRATION", label: "Business Registration" },
];

/* Statuses the backend treats as "positive/done" */
const POSITIVE_STATUSES = ["Approved", "Uploaded", "Available", "Verified"];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const isPositive = (status) => POSITIVE_STATUSES.includes(status);

const badgeColors = (status) => {
  if (status === "Approved")
    return { bg: "#ecfdf3", color: "#0BAB7C" };
  if (status === "Pending")
    return { bg: "#fff7ea", color: "#ff9900" };
  return { bg: "#f4f5f7", color: "#66789c" };
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const prettyDocName = (type) => {
  switch (type) {
    case "GST":
      return "GST Certificate";
    case "PAN":
      return "PAN Card";
    case "POE":
      return "POE Licence";
    case "RPSL":
      return "RPSL Licence";
    case "BUSINESS_REGISTRATION":
      return "Business Registration";
    default:
      return type;
  }
};

const EmployerVerificationPage = () => {
  const [badges, setBadges] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploadType, setUploadType] = useState("POE");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef(null);

  /* ── Load dashboard ─────────────────────────────────────────────────────── */
  const loadVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVerification();
      setBadges(data?.badges ?? []);
      setDocuments(data?.documents ?? []);
    } catch (err) {
      console.error("getVerification error:", err);
      setError("Could not load verification details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
  }, []);

  /* ── Upload flow ────────────────────────────────────────────────────────── */
  const handleBrowseClick = () => {
    setUploadMsg(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side guard (max 5 MB, pdf/jpg/png)
    const maxBytes = 5 * 1024 * 1024;
    const okTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (file.size > maxBytes) {
      setUploadMsg({ type: "error", text: "File exceeds 5 MB limit." });
      e.target.value = "";
      return;
    }
    if (!okTypes.includes(file.type)) {
      setUploadMsg({ type: "error", text: "Only PDF, JPG, or PNG allowed." });
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setUploadMsg(null);
      await uploadDocument(uploadType, file);
      setUploadMsg({ type: "success", text: "Document uploaded successfully." });
      await loadVerification();
    } catch (err) {
      console.error("uploadDocument error:", err);
      setUploadMsg({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleView = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="main">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="content-page">
            {/* Header */}
            <div className="mb-30">
              <h3
                style={{ color: "#122359", fontWeight: 800, marginBottom: "6px" }}
              >
                Verification &amp; Badges
              </h3>
              <span className="font-sm color-text-paragraph-2">
                Build trust with candidates — verified employers get more
                applicants.
              </span>
            </div>

            {/* Error banner */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  marginBottom: "24px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Trust Badges */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(18,35,89,0.06)",
                boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                padding: "28px",
                marginBottom: "30px",
              }}
            >
              <h5
                style={{ color: "#122359", fontWeight: 800, marginBottom: "24px" }}
              >
                Trust Badges
              </h5>

              {loading ? (
                <p style={{ color: "#66789c", margin: 0 }}>Loading badges…</p>
              ) : badges.length === 0 ? (
                <p style={{ color: "#66789c", margin: 0 }}>
                  No badges available yet.
                </p>
              ) : (
                <div className="row">
                  {badges.map((item) => {
                    const colors = badgeColors(item.status);
                    return (
                      <div
                        className="col-lg-4 col-md-6 col-12 mb-20"
                        key={item.badgeName}
                      >
                        <div
                          style={{
                            borderRadius: "22px",
                            padding: "22px",
                            border: "1px solid rgba(18,35,89,0.08)",
                            background: "#ffffff",
                            transition: "all .35s ease",
                            boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                            height: "100%",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-8px)";
                            e.currentTarget.style.borderColor =
                              "rgba(255,153,0,0.32)";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 1px rgba(255,153,0,0.18), 0 20px 40px rgba(255,153,0,0.12)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0px)";
                            e.currentTarget.style.borderColor =
                              "rgba(18,35,89,0.08)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 14px rgba(18,35,89,0.04)";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "14px",
                              marginBottom: "16px",
                            }}
                          >
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "16px",
                                background: "#fff7ea",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ff9900",
                                fontSize: "20px",
                                flexShrink: 0,
                              }}
                            >
                              <i
                                className={
                                  BADGE_ICONS[item.badgeName] ||
                                  "fi fi-rr-badge"
                                }
                              />
                            </div>

                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#122359",
                                  marginBottom: "8px",
                                  fontSize: "16px",
                                }}
                              >
                                {item.badgeName}
                              </div>

                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "6px 12px",
                                  borderRadius: "999px",
                                  background: colors.bg,
                                  color: colors.color,
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <p
                            style={{
                              margin: 0,
                              color: "#66789c",
                              fontSize: "13px",
                              lineHeight: 1.7,
                            }}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Uploaded Documents */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(18,35,89,0.06)",
                boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                padding: "28px",
                marginBottom: "30px",
              }}
            >
              <h5
                style={{
                  margin: "0 0 24px",
                  color: "#122359",
                  fontWeight: 800,
                }}
              >
                Uploaded Documents
              </h5>

              {loading ? (
                <p style={{ color: "#66789c", margin: 0 }}>Loading documents…</p>
              ) : documents.length === 0 ? (
                <p style={{ color: "#66789c", margin: 0 }}>
                  No documents found.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {documents.map((doc) => {
                    const positive = isPositive(doc.status);
                    return (
                      <div
                        key={doc.documentType}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "14px",
                          padding: "18px 22px",
                          borderRadius: "18px",
                          border: "1px solid rgba(18,35,89,0.08)",
                          background: "#ffffff",
                          transition: "all .35s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.borderColor =
                            "rgba(255,153,0,0.32)";
                          e.currentTarget.style.boxShadow =
                            "0 12px 28px rgba(255,163,0,0.10)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0px)";
                          e.currentTarget.style.borderColor =
                            "rgba(18,35,89,0.08)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#122359",
                              marginBottom: "4px",
                            }}
                          >
                            {prettyDocName(doc.documentType)}
                          </div>
                          <div style={{ fontSize: "13px", color: "#66789c" }}>
                            {doc.uploadedAt
                              ? `Updated: ${formatDate(doc.uploadedAt)}`
                              : "Not uploaded yet"}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 12px",
                              borderRadius: "999px",
                              background: positive ? "#ecfdf3" : "#fff7ea",
                              color: positive ? "#0BAB7C" : "#ff9900",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {doc.status}
                          </span>

                          <button
                            className="btn btn-border btn-sm"
                            style={{
                              borderRadius: "10px",
                              fontWeight: 700,
                              opacity: doc.fileUrl ? 1 : 0.5,
                              cursor: doc.fileUrl ? "pointer" : "not-allowed",
                            }}
                            type="button"
                            disabled={!doc.fileUrl}
                            onClick={() => handleView(doc)}
                          >
                            <i
                              className="fi fi-rr-eye"
                              style={{ marginRight: "5px" }}
                            />
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                border: "1px solid rgba(18,35,89,0.06)",
                boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
                padding: "28px",
              }}
            >
              <h5
                style={{ color: "#122359", fontWeight: 800, marginBottom: "22px" }}
              >
                Upload New Document
              </h5>

              {/* Document type selector */}
              <div style={{ marginBottom: "18px", maxWidth: "320px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#122359",
                    marginBottom: "8px",
                  }}
                >
                  Document type
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="form-control"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid rgba(18,35,89,0.15)",
                    padding: "10px 14px",
                    fontWeight: 600,
                    color: "#122359",
                  }}
                >
                  {UPLOADABLE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={handleFileSelected}
              />

              <div
                style={{
                  border: "2px dashed rgba(255,163,0,0.35)",
                  borderRadius: "24px",
                  padding: "50px 30px",
                  textAlign: "center",
                  background: "#fffdf9",
                  cursor: uploading ? "wait" : "pointer",
                  transition: "all .35s ease",
                }}
                onClick={uploading ? undefined : handleBrowseClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ffa300";
                  e.currentTarget.style.background = "#fff7ea";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,163,0,0.35)";
                  e.currentTarget.style.background = "#fffdf9";
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "22px",
                    background: "#fff7ea",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    color: "#ff9900",
                    fontSize: "28px",
                  }}
                >
                  <i className="fi fi-rr-cloud-upload" />
                </div>

                <p
                  style={{
                    fontSize: "15px",
                    color: "#122359",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {uploading ? "Uploading…" : "Click to select a document"}
                </p>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#66789c",
                    marginBottom: "20px",
                  }}
                >
                  Accepted: PDF, JPG, PNG — Max 5 MB
                </p>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    background: "#fff7ea",
                    border: "1px solid rgba(255,163,0,0.28)",
                    color: "#8a5a00",
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "18px",
                  }}
                >
                  <i className="fi fi-rr-lock" />
                  Documents uploaded here are private and are not shared with
                  candidates.
                </div>

                <div>
                  <button
                    className="btn btn-border btn-sm"
                    style={{
                      borderRadius: "12px",
                      padding: "10px 18px",
                      fontWeight: 700,
                    }}
                    type="button"
                    disabled={uploading}
                  >
                    {uploading ? "Please wait…" : "Browse Files"}
                  </button>
                </div>
              </div>

              {/* Upload status message */}
              {uploadMsg && (
                <p
                  style={{
                    marginTop: "16px",
                    marginBottom: 0,
                    fontWeight: 600,
                    fontSize: "14px",
                    color:
                      uploadMsg.type === "success" ? "#0BAB7C" : "#b91c1c",
                  }}
                >
                  {uploadMsg.text}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmployerVerificationPage;