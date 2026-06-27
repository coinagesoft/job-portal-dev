// src/services/candidate/documentService.js

import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getDocuments = async () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/documents?candidateId=${candidateId}`
  );
};