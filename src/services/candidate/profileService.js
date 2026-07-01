// services/candidate/personalInfoService.js

import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getPersonalInfo = () => {
  return api.get("/api/candidate/profile/personal-info");
};

export const createPersonalInfo = (payload) => {
  return api.post(
    "/api/candidate/profile/personal-info",
    payload
  );
};

export const updatePersonalInfo = (payload) => {
  const candidateId = getCandidateId();

  return api.put(
    `/api/candidate/profile/personal-info?candidateId=${candidateId}`,
    payload
  );
};

export const uploadProfilePhoto = (file) => {
  const candidateId = getCandidateId();

  const formData = new FormData();

  formData.append("photo", file);

  return api.post(
    `/api/candidate/profile/profile-photo?candidateId=${candidateId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};