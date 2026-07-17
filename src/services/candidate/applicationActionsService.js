// services/candidate/applicationActionsService.js
// Candidate actions on a job application: acknowledge recruiter note + withdraw.

import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

// POST /api/candidate/applications/{applicationId}/acknowledge-note
export const acknowledgeNote = (applicationId) =>
  api.post(`/api/candidate/applications/${applicationId}/acknowledge-note`);

// DELETE /api/candidate/jobs/applications/{applicationId}
export const withdrawApplication = (applicationId) => {
  const candidateId = getCandidateId();
  return api.delete(
    `/api/candidate/jobs/applications/${applicationId}?candidateId=${candidateId}`,
  );
};  