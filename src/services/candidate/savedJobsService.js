import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const saveJob = (jobId) => {
  const candidateId = getCandidateId();
  return api.post(
    `/api/candidate/jobs/${jobId}/save?candidateId=${candidateId}`,
    null
  );
};

export const getSavedJobs = () => {
  const candidateId = getCandidateId();
  return api.get(`/api/candidate/jobs/saved?candidateId=${candidateId}`);
};