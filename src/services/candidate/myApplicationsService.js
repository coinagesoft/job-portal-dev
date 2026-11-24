import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getMyApplications = () => {
  const candidateId = getCandidateId();
  if (!candidateId) {
    return Promise.resolve({ data: { applications: [] } });
  }

  return api.get(
    `/api/candidate/jobs/GetAppliedJobs?candidateId=${candidateId}`
  );
};
