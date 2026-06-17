// services/candidate/educationService.js

import api from "../api";

export const getEducation = (candidateId) =>
  api.get("/api/candidate/profile/education", {
    params: { candidateId },
  });

export const createEducation = (
  candidateId,
  payload
) =>
  api.post(
    "/api/candidate/profile/education",
    payload,
    {
      params: { candidateId },
    }
  );

export const updateEducation = (
  educationId,
  candidateId,
  payload
) =>
  api.put(
    `/api/candidate/profile/education/${educationId}`,
    payload,
    {
      params: {
        candidateId,
      },
    }
  );

export const deleteEducation = (
  educationId,
  candidateId
) =>
  api.delete(
    `/api/candidate/profile/education/${educationId}`,
    {
      params: {
        candidateId,
      },
    }
  );