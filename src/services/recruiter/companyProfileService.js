import api from "@/services/api";
import { getEmployerId } from "@/utils/authHelper";

const companyProfileService = {
  getCompanyProfile: async () => {
    const employerId = getEmployerId();

    const { data } = await api.get(
      `/api/recruiter/company-profile/${employerId}`
    );

    return data;
  },

  updateCompanyProfileField: async (fieldName, value) => {
    const employerId = getEmployerId();

    const formData = new FormData();

    formData.append(fieldName, value ?? "");

    const { data } = await api.patch(
      `/api/recruiter/company-profile/${employerId}`,
      formData
    );

    return data;
  },
};

export default companyProfileService;