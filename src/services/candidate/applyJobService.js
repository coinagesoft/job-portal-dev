import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const applyJob = (jobId, payload) => {
  const candidateId = getCandidateId();

  return api.post(
    `/api/candidate/jobs/${jobId}/apply?candidateId=${candidateId}`,
    payload
  );
};