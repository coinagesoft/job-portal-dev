import api from "../api";

export const getPersonalInfo = (candidateId) =>
  api.get(
    `/api/candidate/profile/personal-info`,
    {
      params: {
        candidateId,
      },
    }
  );

  export const updatePersonalInfo = (
  candidateId,
  payload
) =>
  api.put(
    "/api/candidate/profile/personal-info",
    payload,
    {
      params: { candidateId },
    }
  );



export const uploadProfilePhoto = (
  candidateId,
  file
) => {
  const formData = new FormData();

  formData.append("photo", file);

  return api.post(
    "/api/candidate/profile/profile-photo",
    formData,
    {
      params: {
        candidateId,
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};