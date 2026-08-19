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
export const getDocumentTypes = () =>
  api.get("/api/recruiter/registration/document-types");

export const uploadDocuments = (documents, sessionId) => {
  const formData = new FormData();

  formData.append("SessionId", sessionId);

  let uploadIndex = 0;

  documents.forEach((doc) => {
    // Skip already uploaded documents
    if (!(doc.file instanceof File)) {
      return;
    }

    if (doc.documentTypeId) {
      formData.append(
        `Documents[${uploadIndex}].DocumentTypeId`,
        doc.documentTypeId
      );
    }

    if (doc.documentName) {
      formData.append(
        `Documents[${uploadIndex}].DocumentName`,
        doc.documentName
      );
    }

    if (doc.category) {
      formData.append(
        `Documents[${uploadIndex}].Category`,
        doc.category
      );
    }

    formData.append(
      `Documents[${uploadIndex}].File`,
      doc.file
    );

    uploadIndex++;
  });

  // Nothing new to upload
  if (uploadIndex === 0) {
    return Promise.resolve({
      data: {
        success: true,
        message: "No new documents to upload."
      }
    });
  }

  return api.post(
    "/api/recruiter/registration/upload-documents",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


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

export const getRecruiterPlan = (region) =>
  api.get(`/api/plans/recruiter?region=${region}`);

// Creates the Razorpay order for the Employer Registration fee, resolved
// server-side from the active, admin-managed Recruiter MembershipPlan
// (never trust a client-supplied amount). Returns { orderId, amount,
// amountPaise, currency, razorpayKeyId, planId, planName }. planId must be
// echoed back on submitRegistration so the amount can be re-verified there.
export const createMembershipOrder = (payload) =>
  api.post(
    "/api/recruiter/registration/create-plan-order",
    payload
  );