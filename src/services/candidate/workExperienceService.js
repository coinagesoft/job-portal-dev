// services/workExperienceService.js

import api from "../api";

export const getWorkExperience = (candidateId) =>
  api.get("/api/candidate/profile/work-experience", {
    params: { candidateId },
  });

export const createWorkExperience = (candidateId, payload) =>
  api.post(
    "/api/candidate/profile/work-experience",
    payload,
    {
      params: { candidateId },
    }
  );

export const updateWorkExperience = (
  workId,
  candidateId,
  payload
) =>
  api.put(
    `/api/candidate/profile/work-experience/${workId}`,
    payload,
    {
      params: {
        candidateId,
      },
    }
  );

export const deleteWorkExperience = (
  workId,
  candidateId
) =>
  api.delete(
    `/api/candidate/profile/work-experience/${workId}`,
    {
      params: {
        candidateId,
      },
    }
  );