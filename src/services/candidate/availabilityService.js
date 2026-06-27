import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getAvailability = () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/availability?candidateId=${candidateId}`
  );
};

export const updateAvailability = (payload) => {
  const candidateId = getCandidateId();

  return api.put(
    `/api/candidate/profile/availability?candidateId=${candidateId}`,
    payload
  );
};