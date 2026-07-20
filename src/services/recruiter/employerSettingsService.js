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
// NOTE: Email and Mobile Number are intentionally NOT sent here anymore —
// changing either now requires the OTP flow below (request-otp then
// verify-otp). This endpoint only ever touches ContactPersonName,
// Designation and TimeZone.

export const updateAccountSettings = async (data) => {
  const employerId = getEmployerId();
  const formData = new FormData();

  formData.append("ContactPersonName", data.contactPersonName);
  formData.append("Designation", data.designation);
  formData.append("TimeZone", data.timeZone);

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

/* ---------------- EMAIL CHANGE (OTP-gated) ---------------- */

export const requestEmailChangeOtp = async (newEmail) => {
  const employerId = getEmployerId();
  const response = await api.post(
    `/api/recruiter/settings/account/${employerId}/email/request-otp`,
    { newEmail },
  );
  return response.data;
};

export const verifyEmailChangeOtp = async (newEmail, otpCode) => {
  const employerId = getEmployerId();
  const response = await api.post(
    `/api/recruiter/settings/account/${employerId}/email/verify-otp`,
    { newEmail, otpCode },
  );
  return response.data;
};

/* ---------------- MOBILE CHANGE (OTP-gated) ---------------- */

export const requestMobileChangeOtp = async (newMobileNumber, newCountryCode) => {
  const employerId = getEmployerId();
  const response = await api.post(
    `/api/recruiter/settings/account/${employerId}/mobile/request-otp`,
    { newMobileNumber, newCountryCode },
  );
  return response.data;
};

export const verifyMobileChangeOtp = async (
  newMobileNumber,
  newCountryCode,
  otpCode,
) => {
  const employerId = getEmployerId();
  const response = await api.post(
    `/api/recruiter/settings/account/${employerId}/mobile/verify-otp`,
    { newMobileNumber, newCountryCode, otpCode },
  );
  return response.data;
};
/* ---------------- NOTIFICATION SETTINGS ---------------- */

export const getNotificationSettings = async () => {
  const employerId = getEmployerId();
  const response = await api.get(
    `/api/recruiter/settings/notifications/${employerId}`,
  );
  return response.data;
};

export const updateNotificationSettings = async (payload) => {
  const employerId = getEmployerId();
  const fd = new FormData();
  fd.append("NewApplicantAlerts", payload.newApplicantAlerts);
  fd.append("CreditBillingAlerts", payload.creditBillingAlerts);
  fd.append("JobStatusUpdates", payload.jobStatusUpdates);
  fd.append("SystemMessages", payload.systemMessages);
  const response = await api.patch(
    `/api/recruiter/settings/notifications/${employerId}`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

/* ---------------- PREFERENCES ---------------- */

export const getPreferences = async () => {
  const employerId = getEmployerId();
  const response = await api.get(
    `/api/recruiter/settings/preferences/${employerId}`,
  );
  return response.data;
};

export const updatePreferences = async (payload) => {
  const employerId = getEmployerId();
  const fd = new FormData();
  if (payload.primaryLanguage != null) fd.append("PrimaryLanguage", payload.primaryLanguage);
  if (payload.secondaryLanguage != null) fd.append("SecondaryLanguage", payload.secondaryLanguage);
  if (payload.itemsPerPage != null) fd.append("ItemsPerPage", payload.itemsPerPage);
  if (payload.dateFormat != null) fd.append("DateFormat", payload.dateFormat);
  if (payload.marketingEmailsEnabled != null) fd.append("MarketingEmailsEnabled", payload.marketingEmailsEnabled);
  if (payload.platformUpdatesEnabled != null) fd.append("PlatformUpdatesEnabled", payload.platformUpdatesEnabled);
  const response = await api.patch(
    `/api/recruiter/settings/preferences/${employerId}`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

/* ---------------- SESSIONS ---------------- */

export const getSessions = async () => {
  const employerId = getEmployerId();
  const response = await api.get(
    `/api/recruiter/settings/sessions/${employerId}`,
  );
  return response.data;
};

export const revokeSession = async (sessionId) => {
  const response = await api.patch(
    `/api/recruiter/settings/sessions/revoke/${sessionId}`,
  );
  return response.data;
};

/* ---------------- DANGER ZONE ---------------- */

export const deactivateAccount = async () => {
  const employerId = getEmployerId();
  const response = await api.patch(
    `/api/recruiter/settings/deactivate/${employerId}`,
  );
  return response.data;
};

export const deleteAllJobs = async () => {
  const employerId = getEmployerId();
  const response = await api.delete(
    `/api/recruiter/settings/jobs/${employerId}`,
  );
  return response.data;
};

export const deleteAccountPermanently = async () => {
  const employerId = getEmployerId();
  const response = await api.delete(
    `/api/recruiter/settings/account/${employerId}`,
  );
  return response.data;
};