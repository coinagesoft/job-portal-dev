// src/services/candidate/documentService.js

import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

// All candidate documents (resume + education + passport + aadhaar, old tables)
export const getDocuments = async () => {
  const candidateId = getCandidateId();
  return api.get(`/api/candidate/profile/documents?candidateId=${candidateId}`);
};

// Unified upload: one endpoint for any document. The type is auto-detected by
// the OCR parser; the file is only stored if the parsed name matches the
// candidate's profile name.
export const uploadDocument = async (file) => {
  const candidateId = getCandidateId();

  const formData = new FormData();
  formData.append("Document", file);

  return api.post(
    `/api/candidate/profile/documents?candidateId=${candidateId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
};

// List the stored, OCR-verified documents (the new candidate_documents table).
export const getUploadedDocuments = async () => {
  const candidateId = getCandidateId();
  return api.get(
    `/api/candidate/profile/documents/uploaded?candidateId=${candidateId}`,
  );
};

// Delete a stored document by id.
export const deleteDocument = async (documentId) => {
  const candidateId = getCandidateId();
  return api.delete(
    `/api/candidate/profile/documents/${documentId}?candidateId=${candidateId}`,
  );
};