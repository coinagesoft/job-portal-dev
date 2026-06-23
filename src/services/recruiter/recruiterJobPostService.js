import api from "@/services/api";

export const saveJobDetails = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await api.patch(
    "/api/recruiter/jobs/step1-job-details",
    formData
  );

  return response.data;
};
export const getJobResume = async (jobId) => {
  const response = await api.get(
    `/api/recruiter/jobs/${jobId}/resume`
  );

  return response.data;
};

export const saveCompensation = async (jobId, payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step2-compensation`,
    formData
  );

  return response.data;
};

export const saveSkills = async (jobId, payload) => {
  const formData = new FormData();

  payload.KeySkills?.forEach((skill) => {
    formData.append("KeySkills", skill);
  });

  formData.append(
    "AdditionalJobDescription",
    payload.AdditionalJobDescription || ""
  );

  formData.append(
    "LicenceDocsRequired",
    payload.LicenceDocsRequired || ""
  );

  formData.append(
    "LanguageRequired",
    payload.LanguageRequired || ""
  );

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step3-skills`,
    formData
  );

  return response.data;
};

export const saveEligibility = async (
  jobId,
  payload
) => {
  const formData = new FormData();

  Object.entries(payload).forEach(
    ([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        formData.append(key, value);
      }
    }
  );

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step4-eligibility`,
    formData
  );

  return response.data;
};
export const saveLocation = async (jobId, payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step5-location`,
    formData
  );

  return response.data;
};

export const saveQuestions = async (jobId, payload) => {
  const formData = new FormData();

  payload.questions.forEach((q) => {
    formData.append("questionText", q.questionText);
    formData.append("answerType", q.answerType);
    formData.append("isMandatory", String(q.isMandatory));
  });

  console.log("STEP6 PAYLOAD");

  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  const response = await api.patch(
    `/api/recruiter/jobs/${jobId}/step6-questions`,
    formData
  );

  return response.data;
};

export const publishJob = async (
  payload
) => {
  const formData = new FormData();

  formData.append(
    "JobId",
    payload.JobId
  );

  formData.append(
    "ApplicationDeadline",
    payload.ApplicationDeadline
  );

  formData.append(
    "CompanyVisibility",
    payload.CompanyVisibility
  );

  formData.append(
    "JobType",
    payload.JobType
  );

  formData.append(
    "PublishNow",
    payload.PublishNow
  );

  payload.PublishingTags?.forEach(
    (tag) => {
      formData.append(
        "PublishingTags",
        tag
      );
    }
  );

  const response = await api.patch(
    "/api/recruiter/jobs/step7-publish",
    formData
  );

  return response.data;
};

export const saveDraft = async (jobId) => {
  const response = await api.put(
    `/api/recruiter/jobs/${jobId}/save-draft`
  );

  return response.data;
};