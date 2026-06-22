import api from "../api";

// STEP 1
export const gstCheck = (payload) =>
  api.post(
    "/api/recruiter/registration/gst-check",
    payload
  );

// STEP 2
export const saveCompanyDetails = (
  formData,
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/company-details",
    formData,
    {
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );


// STEP 3A
export const saveContactDetails = (
  payload,
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/contact-details",
    payload,
    {
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );


// MOBILE OTP

export const sendMobileOtp = (
  payload,
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/send-mobile-otp",
    payload,
    {
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );

export const verifyMobileOtp = (
  payload,
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/verify-mobile-otp",
    payload,
    {
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );

export const resendMobileOtp = (
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/resend-mobile-otp",
    {},
    {
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );


// EMAIL OTP

export const sendEmailOtp = (
  payload,
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/send-email-otp",
    payload,
    {
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );

export const verifyEmailOtp = (
  payload,
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/verify-email-otp",
    payload,
    {
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );

export const resendEmailOtp = (
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/resend-email-otp",
    {},
    {
      headers: {
        "X-Session-Id": sessionId,
      },
    }
  );


// STEP 4
export const uploadLicences = (
  formData,
  sessionId
) =>
  api.post(
    "/api/recruiter/registration/upload-licences",
    formData,
    {
      headers: {
        "X-Session-Id": sessionId,
        "Content-Type": "multipart/form-data",
      },
    }
  );


// STEP 5
export const submitRegistration = (
  payload
) =>
  api.post(
    "/api/recruiter/registration/submit-registration",
    payload
  );


// Resume
export const resumeRegistration = (
  sessionId
) =>
  api.get(
    `/api/recruiter/registration/resume/${sessionId}`
  );


// Dropdown enums
export const getEnumOptions = () =>
  api.get(
    "/api/recruiter/registration/enum-options"
  );