import api from "../api";

export const getProfileCompletion = (candidateId) =>
  api.get(
    "/api/candidate/profile/completion",
    {
      params: {
        candidateId,
      },
    }
  );