import api from "../api";

export const getCompanyDetails = async (employerId) => {
  const response = await api.get(
    `/api/candidate/public/GetCompany/details/${employerId}`
  );

  console.log(response);

  return response.data;
};