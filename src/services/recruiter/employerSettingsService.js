import api from "@/services/api";

function getEmployerId() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.EmployerId;
  } catch {
    return null;
  }
}



/* ---------------- GET ACCOUNT ---------------- */

export const getAccountSettings = async () => {
  const employerId = getEmployerId();

  const response = await api.get(
    `/api/recruiter/settings/account/${employerId}`
  );

  return response.data;
};

/* ---------------- UPDATE ACCOUNT ---------------- */

export const updateAccountSettings = async (data) => {
  const employerId = getEmployerId();
  const formData = new FormData();

  formData.append("ContactPersonName", data.contactPersonName);
  formData.append("Designation", data.designation);
  formData.append("TimeZone", data.timeZone);
  formData.append("Email", data.email);
  formData.append("MobileNumber", data.mobileNumber);
  formData.append("CountryCode", data.countryCode);

  const response = await api.patch(
    `/api/recruiter/settings/account/${employerId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};