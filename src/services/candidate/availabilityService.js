import api from "../api";

export const getAvailability = (candidateId) =>
  api.get("/api/candidate/profile/availability", {
    params: { candidateId },
  });

export const updateAvailability = (
  candidateId,
  payload
) =>
  api.put(
    "/api/candidate/profile/availability",
    payload,
    {
      params: { candidateId },
    }
  );