// services/candidate/workExperienceService.js

import api from "../api";
import { getCandidateId } from "@/utils/authHelper";



export const getWorkExperience = () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/work-experience?candidateId=${candidateId}`
  );
};

export const createWorkExperience = (payload) => {
  const candidateId = getCandidateId();

  return api.post(
    `/api/candidate/profile/work-experience?candidateId=${candidateId}`,
    payload
  );
};

export const updateWorkExperience = (workId, payload) => {
  const candidateId = getCandidateId();

  return api.put(
    `/api/candidate/profile/work-experience/${workId}?candidateId=${candidateId}`,
    payload
  );
};

export const deleteWorkExperience = (workId) => {
  const candidateId = getCandidateId();

  return api.delete(
    `/api/candidate/profile/work-experience/${workId}?candidateId=${candidateId}`
  );
};