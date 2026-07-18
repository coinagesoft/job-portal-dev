"use client";

import { useEffect, useRef, useState } from "react";
import {
  uploadDocument,
  getUploadedDocuments,
  deleteDocument,
} from "@/services/candidate/documentService";
import {
  uploadResume,
  deleteResume,
  getDocuments,
  downloadGeneratedCv,
  previewGeneratedCv,
} from "@/services/candidate/candidateResume";

const NAVY = "#122359";
const GOLD = "#ffa300";

const card = {
  border: "1px solid rgba(18,35,89,0.07)",
  borderRadius: 18,
  boxShadow: "0 4px 14px rgba(18,35,89,0.04)",
  padding: 20,
  background: "#fff",
  marginBottom: 16,
};

const badge = (ok) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  fontWeight: 600,
  padding: "2px 10px",
  borderRadius: 8,
  background: ok ? "rgba(34,160,80,0.12)" : "rgba(255,163,0,0.12)",
  color: ok ? "#1f7a45" : NAVY,
  border: `1px solid ${ok ? "rgba(34,160,80,0.4)" : "rgba(255,163,0,0.5)"}`,
});

const primaryButton = (busy) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "none",
  borderRadius: 10,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 700,
  color: "#fff",
  background: busy ? "#f0b45c" : GOLD,
  cursor: busy ? "not-allowed" : "pointer",
  transition: "background .2s",
});

const outlineButton = (busy) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: `1px solid ${NAVY}`,
  borderRadius: 10,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 700,
  color: NAVY,
  background: "#fff",
  cursor: busy ? "not-allowed" : "pointer",
  opacity: busy ? 0.6 : 1,
});

const Spinner = ({ dark }) => (
  <span
    style={{
      width: 13,
      height: 13,
      borderRadius: "50%",
      border: `2px solid ${dark ? "rgba(18,35,89,0.25)" : "rgba(255,255,255,0.4)"}`,
      borderTopColor: dark ? NAVY : "#fff",
      display: "inline-block",
      animation: "myDocsSpin 0.7s linear infinite",
    }}
  />
);

// Turns a timestamp into "today", "yesterday", "3 days ago", or a plain date
// once it's more than a week old.
const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "— today";
  if (diffDays === 1) return "— yesterday";
  if (diffDays < 7) return `— ${diffDays} days ago`;
  return `— ${date.toLocaleDateString()}`;
};

export default function MyDocuments() {
  const [cv, setCv] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cvBusy, setCvBusy] = useState(false);
  const [docBusy, setDocBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  const [generatedCv, setGeneratedCv] = useState(null); // { url, updatedAt }
  const [downloadingPortalCv, setDownloadingPortalCv] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState(null);

  const cvInput = useRef(null);
  const docInput = useRef(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [docsRes, uploadedRes] = await Promise.all([
        getDocuments().catch(() => null),
        getUploadedDocuments().catch(() => null),
      ]);
      setCv(docsRes?.data?.data?.resume ?? null);
      setDocs(uploadedRes?.data?.documents ?? []);
      setGeneratedCv(docsRes?.data?.data?.generatedCv ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onOpenPreview = async () => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const result = await previewGeneratedCv();
      if (result?.success) {
        setPreviewUrl(result.url);
      } else {
        setPreviewError(result?.message || "Could not load preview.");
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const onClosePreview = () => {
    setPreviewOpen(false);
    setPreviewError(null);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const onDownloadPortalCv = async () => {
    setDownloadingPortalCv(true);
    setMessage(null);
    try {
      const result = await downloadGeneratedCv(cv?.parsedName || "Candidate");
      if (!result?.success) {
        setMessage({ type: "error", text: result?.message || "Could not download Portal CV." });
      }
    } finally {
      setDownloadingPortalCv(false);
    }
  };

  const onCvUpload = async (file) => {
    if (!file) return;
    setCvBusy(true);
    setMessage(null);
    try {
      const { data } = await uploadResume(file);
      if (data?.success) {
        setMessage({ type: "success", text: data.message || "CV uploaded and verified." });
        await loadAll();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("profileUpdate"));
        }
      } else {
        setMessage({ type: "error", text: data?.message || "CV upload failed." });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.response?.data?.message || "CV upload failed.",
      });
    } finally {
      setCvBusy(false);
      if (cvInput.current) cvInput.current.value = "";
    }
  };

  const onCvDelete = async () => {
    setCvBusy(true);
    setMessage(null);
    try {
      await deleteResume();
      setMessage({ type: "success", text: "CV removed." });
      await loadAll();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profileUpdate"));
      }
    } catch (e) {
      setMessage({ type: "error", text: e?.response?.data?.message || "Could not remove CV." });
    } finally {
      setCvBusy(false);
    }
  };

  const onDocUpload = async (file) => {
    if (!file) return;
    setDocBusy(true);
    setMessage(null);
    try {
      const { data } = await uploadDocument(file);
      if (data?.success) {
        setMessage({
          type: "success",
          text: `${data.documentType || "Document"} uploaded and verified.`,
        });
        await loadAll();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("profileUpdate"));
        }
      } else {
        setMessage({ type: "error", text: data?.message || "Document was rejected." });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.response?.data?.message || "Document was rejected.",
      });
    } finally {
      setDocBusy(false);
      if (docInput.current) docInput.current.value = "";
    }
  };

  const onDocDelete = async (documentId) => {
    setMessage(null);
    try {
      await deleteDocument(documentId);
      await loadAll();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profileUpdate"));
      }
    } catch (e) {
      setMessage({ type: "error", text: e?.response?.data?.message || "Could not delete document." });
    }
  };

  // The resume already has its own dedicated "CV / Resume" card above —
  // don't show it a second time in the ID & Certificates list.
  const otherDocs = docs.filter(
    (doc) => (doc.documentType || "").toLowerCase() !== "resume"
  );

  return (
    <div>
      <style jsx>{`
        @keyframes myDocsSpin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes cvOverlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes cvPanelPopIn {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(14px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .portalCvBtn {
          transition: background-color 0.18s ease, border-color 0.18s ease,
            color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }
        .portalCvBtn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .portalCvBtn--outline:hover:not(:disabled) {
          background: rgba(18, 35, 89, 0.06);
          border-color: ${NAVY};
          box-shadow: 0 4px 10px rgba(18, 35, 89, 0.08);
        }
        .portalCvBtn--primary:hover:not(:disabled) {
          background: #e69200;
          box-shadow: 0 6px 14px rgba(255, 163, 0, 0.28);
        }
        .cvPreviewOverlay {
          animation: cvOverlayFadeIn 0.2s ease both;
        }
        .cvPreviewPanel {
          animation: cvPanelPopIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .cvPreviewClose {
          transition: background-color 0.15s ease, transform 0.15s ease;
        }
        .cvPreviewClose:hover {
          background: rgba(18, 35, 89, 0.08);
          transform: rotate(90deg);
        }
      `}</style>
      <h4 style={{ color: NAVY, marginTop: 0, marginBottom: 6 }}>My Documents</h4>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        A document is accepted only when the name on it matches your profile name.
      </p>

      {message && (
        <div
          style={{
            ...card,
            padding: "10px 14px",
            background: message.type === "success" ? "rgba(34,160,80,0.08)" : "rgba(163,45,45,0.08)",
            color: message.type === "success" ? "#1f7a45" : "#a32d2d",
            fontSize: 14,
          }}
        >
          {message.text}
        </div>
      )}

      {/* CV / Resume */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h6 style={{ color: GOLD, margin: 0 }}>CV / Resume</h6>
            <div style={{ marginTop: 6 }}>
              {loading ? (
                <span style={{ fontSize: 13, color: "#6b7280" }}>Loading…</span>
              ) : cv?.cvFileUrl ? (
                <span style={badge(true)}>
                  <i className="fi-rr-check"></i> Uploaded
                  {cv.parsedName ? ` — ${cv.parsedName}` : ""}
                </span>
              ) : (
                <span style={badge(false)}>Not uploaded</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {cv?.cvFileUrl && (
              <a className="btn btn-border btn-sm" href={cv.cvFileUrl} target="_blank" rel="noopener noreferrer">
                View
              </a>
            )}
            <button
              type="button"
              className="btn btn-default btn-sm"
              disabled={cvBusy}
              onClick={() => cvInput.current?.click()}
            >
              {cvBusy ? "Uploading…" : cv?.cvFileUrl ? "Replace" : "Upload CV"}
            </button>
            {cv?.cvFileUrl && (
              <button type="button" className="btn btn-border btn-sm" disabled={cvBusy} onClick={onCvDelete}>
                Remove
              </button>
            )}
            <input
              ref={cvInput}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => onCvUpload(e.target.files?.[0])}
            />
          </div>
        </div>
      </div>

      {/* Portal-Generated CV */}
      <div style={{ ...card, overflow: "hidden", padding: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            padding: 20,
            background: "linear-gradient(135deg, rgba(18,35,89,0.04), rgba(255,163,0,0.05))",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,163,0,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className="fi-rr-document" style={{ fontSize: 16, color: GOLD }}></i>
            </span>
            <div>
              <h6 style={{ color: NAVY, margin: 0, fontWeight: 700 }}>Portal CV</h6>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0", maxWidth: 440 }}>
                Built from your current profile — work experience, education, skills,
                and languages — kept up to date automatically whenever you update your
                profile, separate from the resume you uploaded above.
              </p>
              <div style={{ marginTop: 8 }}>
                {loading ? (
                  <span style={{ fontSize: 13, color: "#6b7280" }}>Loading…</span>
                ) : generatedCv?.url ? (
                  <span style={badge(true)}>
                    <i className="fi-rr-check"></i> Generated {formatRelativeTime(generatedCv.updatedAt)}
                  </span>
                ) : (
                  <span style={badge(false)}>Not generated yet — add some profile details first</span>
                )}
              </div>
            </div>
          </div>

          {generatedCv?.url && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={onOpenPreview}
                style={outlineButton(false)}
                className="portalCvBtn portalCvBtn--outline"
                aria-label="Preview Portal CV"
              >
                <i className="fi-rr-eye"></i>
                Preview
              </button>
              <button
                type="button"
                disabled={downloadingPortalCv}
                onClick={onDownloadPortalCv}
                style={primaryButton(downloadingPortalCv)}
                className="portalCvBtn portalCvBtn--primary"
              >
                {downloadingPortalCv ? <Spinner /> : <i className="fi-rr-download"></i>}
                {downloadingPortalCv ? "Downloading…" : "Download"}
              </button>
            </div>
          )}
        </div>
      </div>

      {previewOpen && (
        <div
          onClick={onClosePreview}
          className="cvPreviewOverlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(18,35,89,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cvPreviewPanel"
            style={{
              background: "#fff",
              borderRadius: 14,
              width: "min(760px, 100%)",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(18,35,89,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(18,35,89,0.08)",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
                <i className="fi-rr-eye" style={{ marginRight: 8 }}></i>
                Portal CV preview
              </span>
              <button
                type="button"
                onClick={onClosePreview}
                aria-label="Close preview"
                className="cvPreviewClose"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 18,
                  color: NAVY,
                  cursor: "pointer",
                  lineHeight: 1,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fi-rr-cross"></i>
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 420, position: "relative", background: "#F7F9FC" }}>
              {previewLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 420 }}>
                  <Spinner dark />
                </div>
              ) : previewError ? (
                <div style={{ padding: 24, fontSize: 13, color: "#b91c1c" }}>{previewError}</div>
              ) : previewUrl ? (
                <embed
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  type="application/pdf"
                  style={{ width: "100%", height: "78vh", border: "none", display: "block" }}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Other documents (Aadhaar, Passport, PAN, certificates…) */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h6 style={{ color: NAVY, margin: 0 }}>ID & Certificates</h6>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
              Upload any document — the type is detected automatically.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-default btn-sm"
            disabled={docBusy}
            onClick={() => docInput.current?.click()}
          >
            {docBusy ? "Uploading…" : "Upload document"}
          </button>
          <input
            ref={docInput}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: "none" }}
            onChange={(e) => onDocUpload(e.target.files?.[0])}
          />
        </div>

        {loading ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>Loading…</p>
        ) : otherDocs.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>No documents uploaded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {otherDocs.map((doc) => (
              <div
                key={doc.documentId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgba(18,35,89,0.07)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong style={{ color: NAVY }}>{doc.documentType}</strong>
                  {doc.parsedName ? (
                    <span style={{ fontSize: 13, color: "#6b7280" }}> — {doc.parsedName}</span>
                  ) : null}
                  <div style={{ marginTop: 4 }}>
                    <span style={badge(doc.verificationStatus === "Verified")}>
                      <i className="fi-rr-check"></i> {doc.verificationStatus}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {doc.fileUrl && (
                    <a className="btn btn-border btn-sm" href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-border btn-sm"
                    onClick={() => onDocDelete(doc.documentId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}