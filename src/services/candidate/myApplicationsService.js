import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getMyApplications = () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/jobs/GetAppliedJobs?candidateId=${candidateId}`
  );
};