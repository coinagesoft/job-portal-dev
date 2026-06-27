import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getProfileCompletion = () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/completion?candidateId=${candidateId}`
  );
};