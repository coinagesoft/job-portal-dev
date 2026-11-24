import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const saveJob = (jobId) => {
  const candidateId = getCandidateId();
  if (!candidateId) {
    return Promise.reject(new Error("Candidate not logged in"));
  }
  return api.post(
    `/api/candidate/jobs/${jobId}/save?candidateId=${candidateId}`,
    null
  );
};

export const getSavedJobs = () => {
  const candidateId = getCandidateId();
  if (!candidateId) {
    return Promise.resolve({ data: { savedJobs: [] } });
  }
  return api.get(`/api/candidate/jobs/saved?candidateId=${candidateId}`);
};
