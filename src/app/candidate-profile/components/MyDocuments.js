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

export default function MyDocuments() {
  const [cv, setCv] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cvBusy, setCvBusy] = useState(false);
  const [docBusy, setDocBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

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