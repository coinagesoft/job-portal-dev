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

   if (Array.isArray(value)) {
  value.forEach((item) => {
    formData.append(fieldName, item.trim());
  });
} else {
  formData.append(fieldName, value ?? "");
}

    const { data } = await api.patch(
      `/api/recruiter/company-profile/${employerId}`,
      formData
    );

    return data;
  },

  // Uploads a single file field (e.g. "CompanyLogo" or "CoverImage") to the
  // company profile PATCH endpoint. The field name must match
  // UpdateCompanyProfileDto exactly (IFormFile-bound via [FromForm]).
  updateCompanyProfileFile: async (fieldName, file) => {
    const employerId = getEmployerId();

    const formData = new FormData();
    formData.append(fieldName, file);

    const { data } = await api.patch(
      `/api/recruiter/company-profile/${employerId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return data;
  },
};

export default companyProfileService;