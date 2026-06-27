// profileSummaryService.js

import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getProfileSummary = () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/summary?candidateId=${candidateId}`
  );
};