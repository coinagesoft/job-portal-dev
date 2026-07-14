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
  generateCv,
  downloadGeneratedCv,
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
  const [generating, setGenerating] = useState(false);
  const [downloadingPortalCv, setDownloadingPortalCv] = useState(false);

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

  const onGenerateCv = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const { data } = await generateCv();
      if (data?.success) {
        setMessage({ type: "success", text: data.message || "Portal CV generated." });
        setGeneratedCv({ url: data.generatedCvUrl, updatedAt: data.generatedAt });
      } else {
        setMessage({ type: "error", text: data?.message || "Could not generate Portal CV." });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.response?.data?.message || "Could not generate Portal CV.",
      });
    } finally {
      setGenerating(false);
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
    } catch (e) {
      setMessage({ type: "error", text: e?.response?.data?.message || "Could not delete document." });
    }
  };

  return (
    <div>
      <style jsx>{`
        @keyframes myDocsSpin {
          to {
            transform: rotate(360deg);
          }
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
                and languages — always up to date, separate from the resume you uploaded above.
              </p>
              <div style={{ marginTop: 8 }}>
                {loading ? (
                  <span style={{ fontSize: 13, color: "#6b7280" }}>Loading…</span>
                ) : generatedCv?.url ? (
                  <span style={badge(true)}>
                    <i className="fi-rr-check"></i> Generated {formatRelativeTime(generatedCv.updatedAt)}
                  </span>
                ) : (
                  <span style={badge(false)}>Not generated yet</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={generating}
              onClick={onGenerateCv}
              style={primaryButton(generating)}
            >
              {generating && <Spinner />}
              {generating
                ? "Generating…"
                : generatedCv?.url
                  ? "Update Portal CV"
                  : "Generate Portal CV"}
            </button>
            {generatedCv?.url && (
              <button
                type="button"
                disabled={downloadingPortalCv}
                onClick={onDownloadPortalCv}
                style={outlineButton(downloadingPortalCv)}
              >
                {downloadingPortalCv ? <Spinner dark /> : <i className="fi-rr-download"></i>}
                {downloadingPortalCv ? "Downloading…" : "Download"}
              </button>
            )}
          </div>
        </div>

        {generatedCv?.url && (
          <div style={{ padding: "0 20px 20px" }}>
            <div
              style={{
                border: "1px solid rgba(18,35,89,0.08)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 14px",
                  background: "#F7F9FC",
                  borderBottom: "1px solid rgba(18,35,89,0.06)",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>
                  <i className="fi-rr-eye" style={{ marginRight: 6 }}></i>
                  Preview
                </span>
                <a
                  href={generatedCv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: GOLD, fontWeight: 600, textDecoration: "none" }}
                >
                  Open in new tab ↗
                </a>
              </div>
              <iframe
                src={generatedCv.url}
                title="Portal CV preview"
                style={{ width: "100%", height: 480, border: "none", display: "block" }}
              />
            </div>
          </div>
        )}
      </div>

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
        ) : docs.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>No documents uploaded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map((doc) => (
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