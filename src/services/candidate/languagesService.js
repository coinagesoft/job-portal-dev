import api from "../api";

export const getLanguages = (candidateId) =>
  api.get(
    "/api/candidate/profile/languages",
    {
      params: { candidateId },
    }
  );

export const createLanguage = (
  candidateId,
  payload
) =>
  api.post(
    "/api/candidate/profile/languages",
    payload,
    {
      params: { candidateId },
    }
  );

export const updateLanguage = (
  languageId,
  candidateId,
  payload
) =>
  api.put(
    `/api/candidate/profile/languages/${languageId}`,
    payload,
    {
      params: { candidateId },
    }
  );

export const deleteLanguage = (
  languageId,
  candidateId
) =>
  api.delete(
    `/api/candidate/profile/languages/${languageId}`,
    {
      params: { candidateId },
    }
  );