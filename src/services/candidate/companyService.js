import api from "../api";

export const getCompanyDetails = async (employerId) => {
  const response = await api.get(
    `/api/candidate/jobs/company_details/${employerId}`
  );

  console.log(response);

  return response.data;
};