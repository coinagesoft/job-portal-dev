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

/**
 * GET /api/recruiter/applicants/dashboard
 * Returns totalApplicants, applied, inReview, shortlisted, interview, hired, rejected, withdrawn
 */
export const getApplicantsDashboard = async () => {
  const { data } = await api.get("/api/recruiter/applicants/dashboard", {
    params: { employerId: getEmployerId() },
  });
  return data;
};

/**
 * GET /api/recruiter/applicants
 * Params: JobId, Status, Search, PageNumber, PageSize
 * Returns { totalRecords, pageNumber, pageSize, applicants[] }
 */
export const getApplicants = async ({ jobId, status, search, pageNumber = 1, pageSize = 10 } = {}) => {
  const { data } = await api.get("/api/recruiter/applicants", {
    params: {
      employerId: getEmployerId(),
      JobId: jobId || undefined,
      Status: status || undefined,
      Search: search || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  return data;
};

/**
 * GET /api/recruiter/applicants/{applicationId}
 * Returns full applicant detail with educations, workHistories, skills, cvs
 */
export const getApplicantDetail = async (applicationId) => {
  const { data } = await api.get(`/api/recruiter/applicants/${applicationId}`, {
    params: { employerId: getEmployerId() },
  });
  return data;
};

/**
 * GET /api/recruiter/jobs/{jobId}/applicants
 * Returns { jobId, jobTitle, totalApplicants, applicants[] }
 */
export const getApplicantsByJob = async (jobId) => {
  const { data } = await api.get(`/api/recruiter/jobs/${jobId}/applicants`, {
    params: { employerId: getEmployerId() },
  });
  return data;
};

/**
 * PATCH /api/recruiter/applicants/{applicationId}/review
 */
export const moveToReview = async (applicationId) => {
  const { data } = await api.patch(
    `/api/recruiter/applicants/${applicationId}/review`,
    null,
    { params: { employerId: getEmployerId() } }
  );
  return data;
};

/**
 * PATCH /api/recruiter/applicants/{applicationId}/shortlist
 */
export const shortlistApplicant = async (applicationId) => {
  const { data } = await api.patch(
    `/api/recruiter/applicants/${applicationId}/shortlist`,
    null,
    { params: { employerId: getEmployerId() } }
  );
  return data;
};

/**
 * PATCH /api/recruiter/applicants/{applicationId}/interview
 * Body: { interviewDate }
 */
export const scheduleInterview = async (applicationId, interviewDate) => {
  const { data } = await api.patch(
    `/api/recruiter/applicants/${applicationId}/interview`,
    { interviewDate },
    { params: { employerId: getEmployerId() } }
  );
  return data;
};

/**
 * PATCH /api/recruiter/applicants/{applicationId}/reject
 * Body: { reason }
 */
export const rejectApplicant = async (applicationId, reason = "") => {
  const { data } = await api.patch(
    `/api/recruiter/applicants/${applicationId}/reject`,
    { reason },
    { params: { employerId: getEmployerId() } }
  );
  return data;
};

/**
 * PATCH /api/recruiter/applicants/{applicationId}/hire
 */
export const hireApplicant = async (applicationId) => {
  const { data } = await api.patch(
    `/api/recruiter/applicants/${applicationId}/hire`,
    null,
    { params: { employerId: getEmployerId() } }
  );
  return data;
};

/**
 * POST /api/recruiter/applicants/{applicationId}/notes
 * Body: { noteText }
 */
export const addNote = async (applicationId, noteText) => {
  const { data } = await api.post(
    `/api/recruiter/applicants/${applicationId}/notes`,
    { noteText },
    { params: { employerId: getEmployerId() } }
  );
  return data;
};

/**
 * GET /api/recruiter/applicants/{applicationId}/notes
 */
export const getNotes = async (applicationId) => {
  const { data } = await api.get(
    `/api/recruiter/applicants/${applicationId}/notes`,
    { params: { employerId: getEmployerId() } }
  );
  return data;
};

/**
 * GET /api/recruiter/screening-questions/applications/{applicationId}
 * Returns { success, message, applicationId, jobId, jobTitle, candidateId,
 *           candidateName, screening: [{ question, answer }] }
 */
export const getScreeningAnswers = async (applicationId) => {
  const { data } = await api.get(
    `/api/recruiter/screening-questions/applications/${applicationId}`
  );
  return data;
};