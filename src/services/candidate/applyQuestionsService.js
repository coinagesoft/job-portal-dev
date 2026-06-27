// services/candidate/applyQuestionsService.js

import api from "@/services/api";

export const getApplyQuestions = (jobId) => {
  return api.get(`/api/candidate/jobs/${jobId}/questions_apply_jobs`);
};