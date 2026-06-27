import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

// GET
export const getLanguages = () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/languages?candidateId=${candidateId}`
  );
};

// CREATE
export const createLanguage = (payload) => {
  const candidateId = getCandidateId();

  return api.post(
    `/api/candidate/profile/languages?candidateId=${candidateId}`,
    payload
  );
};

// UPDATE
export const updateLanguage = (languageId, payload) => {
  const candidateId = getCandidateId();

  return api.put(
    `/api/candidate/profile/languages/${languageId}?candidateId=${candidateId}`,
    payload
  );
};

// DELETE
export const deleteLanguage = (languageId) => {
  const candidateId = getCandidateId();

  return api.delete(
    `/api/candidate/profile/languages/${languageId}?candidateId=${candidateId}`
  );
};