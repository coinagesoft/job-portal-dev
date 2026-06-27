// services/candidate/personalInfoService.js

import api from "../api";

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
  return api.put(
    "/api/candidate/profile/personal-info",
    payload
  );
};

export const uploadProfilePhoto = (file) => {
  const formData = new FormData();

  formData.append("photo", file);

  return api.post(
    "/api/candidate/profile/profile-photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};