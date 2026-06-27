// services/candidate/educationService.js

import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getEducation = () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/education?candidateId=${candidateId}`
  );
};

export const createEducation = (payload) => {
  const candidateId = getCandidateId();

  return api.post(
    `/api/candidate/profile/education?candidateId=${candidateId}`,
    payload
  );
};

export const updateEducation = (educationId, payload) => {
  const candidateId = getCandidateId();

  return api.put(
    `/api/candidate/profile/education/${educationId}?candidateId=${candidateId}`,
    payload
  );
};

export const deleteEducation = (educationId) => {
  const candidateId = getCandidateId();

  return api.delete(
    `/api/candidate/profile/education/${educationId}?candidateId=${candidateId}`
  );
};