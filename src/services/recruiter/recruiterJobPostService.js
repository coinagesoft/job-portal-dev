import api from "@/services/api";

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 1 – Job Details
   PATCH /api/recruiter/jobs/step1-job-details
───────────────────────────────────────────────────────────────────────────── */
export const saveJobDetails = async (payload) => {
  const formData = new FormData();

  // scalar fields
  formData.append("JobId", payload.JobId ?? "");
  formData.append("JobTitle", payload.JobTitle ?? "");
  formData.append("TradeCategory", payload.TradeCategory ?? "");
  formData.append("Role", payload.Role ?? "");
  formData.append("JobType", payload.JobType ?? "Normal_Job");
  formData.append("EmploymentType", payload.EmploymentType ?? "Full_Time");
  formData.append("EmploymentMode", payload.EmploymentMode ?? "Onsite");
  formData.append("Department", payload.Department ?? "");
  formData.append("JobDescription", payload.JobDescription ?? "");

  if (payload.ExperienceMinYears !== null && payload.ExperienceMinYears !== undefined && payload.ExperienceMinYears !== "") {
    formData.append("ExperienceMinYears", Number(payload.ExperienceMinYears));
  }
  if (payload.ExperienceMaxYears !== null && payload.ExperienceMaxYears !== undefined && payload.ExperienceMaxYears !== "") {
    formData.append("ExperienceMaxYears", Number(payload.ExperienceMaxYears));
  }
  if (payload.DutyHoursPerDay !== null && payload.DutyHoursPerDay !== undefined && payload.DutyHoursPerDay !== "") {
    formData.append("DutyHoursPerDay", Number(payload.DutyHoursPerDay));
  }
  if (payload.PaidOvertime !== undefined && payload.PaidOvertime !== null) {
    formData.append("PaidOvertime", String(payload.PaidOvertime));
  }

  // array field
  (payload.KeyResponsibilities ?? []).forEach((r) =>
    formData.append("KeyResponsibilities", r)
  );

  const response = await api.patch(
    "/api/recruiter/jobs/step1-job-details",
    formData
  );
  return response.data;
};

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 2 – Compensation
   PATCH /api/recruiter/jobs/{jobId}/step2-compensation
───────────────────────────────────────────────────────────────────────────── */
export const saveCompensation = async (jobId, payload) => {
  const formData = new FormData();

  if (payload.SalaryMin !== null && payload.SalaryMin !== undefined && payload.SalaryMin !== "") {
    formData.append("SalaryMin", Number(payload.SalaryMin));
  }
  if (payload.SalaryMax !== null && payload.SalaryMax !== undefined && payload.SalaryMax !== "") {
    formData.append("SalaryMax", Number(payload.SalaryMax));
  }
  formData.append("SalaryCurrency", payload.SalaryCurrency ?? "INR");
  formData.append("SalaryDisplayOption", payload.SalaryDisplayOption ?? "Show_Range");

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step2-compensation`,
    formData
  );
  return response.data;
};

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 3 – Skills & JD
   PATCH /api/recruiter/jobs/{jobId}/step3-skills
───────────────────────────────────────────────────────────────────────────── */
export const saveSkills = async (jobId, payload) => {
  const formData = new FormData();

  // arrays
  (payload.KeySkills ?? []).forEach((s) => formData.append("KeySkills", s));
  (payload.KeyResponsibilities ?? []).forEach((r) =>
    formData.append("KeyResponsibilities", r)
  );
  (payload.Benefits ?? []).forEach((b) => formData.append("Benefits", b));
  (payload.Tags ?? []).forEach((t) => formData.append("Tags", t));

  // scalars
  formData.append("AdditionalJobDescription", payload.AdditionalJobDescription ?? "");
  formData.append("LicenceDocsRequired", payload.LicenceDocsRequired ?? "");
  formData.append("LanguageRequired", payload.LanguageRequired ?? "");

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step3-skills`,
    formData
  );
  return response.data;
};

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 4 – Eligibility
   PATCH /api/recruiter/jobs/{jobId}/step4-eligibility
───────────────────────────────────────────────────────────────────────────── */
export const saveEligibility = async (jobId, payload) => {
  const formData = new FormData();

  if (payload.Vacancies !== null && payload.Vacancies !== undefined && payload.Vacancies !== "") {
    formData.append("Vacancies", Number(payload.Vacancies));
  }
  formData.append("EducationRequired", payload.EducationRequired ?? "Any");

  if (payload.AgeMin !== null && payload.AgeMin !== undefined && payload.AgeMin !== "") {
    formData.append("AgeMin", Number(payload.AgeMin));
  }
  if (payload.AgeMax !== null && payload.AgeMax !== undefined && payload.AgeMax !== "") {
    formData.append("AgeMax", Number(payload.AgeMax));
  }

  formData.append("GenderPreferred", payload.GenderPreferred ?? "Any");
  formData.append("DisabilityEligible", String(payload.DisabilityEligible ?? false));
  formData.append("PassportRequired", String(payload.PassportRequired ?? false));

  if (
    payload.PassportRequired &&
    payload.PassportValidityMonths !== null &&
    payload.PassportValidityMonths !== undefined &&
    payload.PassportValidityMonths !== ""
  ) {
    formData.append("PassportValidityMonths", Number(payload.PassportValidityMonths));
  }

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step4-eligibility`,
    formData
  );
  return response.data;
};

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 5 – Location
   PATCH /api/recruiter/jobs/{jobId}/step5-location
───────────────────────────────────────────────────────────────────────────── */
export const saveLocation = async (jobId, payload) => {
  const formData = new FormData();

  formData.append("LocationType", payload.LocationType ?? "Onshore");
  formData.append("Country", payload.Country ?? "");
  formData.append("WorkAddressLine", payload.WorkAddressLine ?? "");

  // Onshore fields
  formData.append("OnshoreCity", payload.OnshoreCity ?? "");
  formData.append("OnshoreState", payload.OnshoreState ?? "");
  formData.append("OnshoreCountry", payload.OnshoreCountry ?? "");
  formData.append("OnshorePincode", payload.OnshorePincode ?? "");

  // Offshore fields
  formData.append("OffshoreVesselName", payload.OffshoreVesselName ?? "");
  formData.append("OffshoreRegion", payload.OffshoreRegion ?? "");
  formData.append("OffshoreCountry", payload.OffshoreCountry ?? "");

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step5-location`,
    formData
  );
  return response.data;
};

/* ─────────────────────────────────────────────────────────────────────────────
   STEP 6 – Screening Questions
   PATCH /api/recruiter/jobs/{jobId}/step6-questions
   NOTE: API expects each question as a JSON-stringified object in the array.
───────────────────────────────────────────────────────────────────────────── */
export const saveQuestions = async (jobId, payload) => {
  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step6-questions`,
    {
      questions: payload.questions,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
/* ─────────────────────────────────────────────────────────────────────────────
   STEP 7 – Publish
   PATCH /api/recruiter/jobs/step7-publish
───────────────────────────────────────────────────────────────────────────── */
export const publishJob = async (payload) => {
  const response = await api.patch(
    "/api/recruiter/jobs/step7-publish",
    {
      JobId: payload.JobId,
      ApplicationDeadline: payload.ApplicationDeadline,
      CompanyVisibility: payload.CompanyVisibility ?? "ShowName",
      JobType: payload.JobType ?? "Normal_Job",
      PublishingTags: payload.PublishingTags ?? [],
      PublishNow: payload.PublishNow ?? true,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Save Draft
   PUT /api/recruiter/jobs/{jobId}/save-draft
───────────────────────────────────────────────────────────────────────────── */
export const saveDraft = async (jobId) => {
  const response = await api.put(`/api/recruiter/jobs/${jobId}/save-draft`);
  return response.data;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Resume / Get Draft
   GET /api/recruiter/jobs/{jobId}/resume
───────────────────────────────────────────────────────────────────────────── */
export const getJobResume = async (jobId) => {
  const response = await api.get(`/api/recruiter/jobs/${jobId}/resume`);
  return response.data;
};

/* ─────────────────────────────────────────────────────────────────────────────
   AI helpers
───────────────────────────────────────────────────────────────────────────── */
export const generateJobDescription = async (payload) => {
  const response = await api.post(
    "/api/recruiter/ai/job-description/auto-generate",
    payload
  );
  return response.data;
};

export const getInlineSuggestion = async (payload) => {
  const response = await api.post(
    "/api/recruiter/ai/job-description/inline-suggest",
    payload
  );
  return response.data;
};
// GET /api/recruiter/jobs/search-roles?q=...  → role autocomplete suggestions
export const searchRoles = async (q) => {
  const response = await api.get(`/api/recruiter/jobs/search-roles`, {
    params: { q },
  });
  return response.data;
};

// POST /api/recruiter/ai/job-description/suggest-skills  → AI-suggested skills
// payload: { jobTitle, tradeCategory, department }
export const suggestSkills = async (payload) => {
  const response = await api.post(
    `/api/recruiter/ai/job-description/suggest-skills`,
    payload,
  );
  return response.data;
};