// services/candidate/searchJobsService.js
// Binds GET /api/candidate/public/filter_by_keywords (public job search/filter).

import api from "../api";

export const searchJobs = (params = {}) => {
  // Drop empty values so we don't send blank query params.
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) clean[k] = v;
  });

  return api.get("/api/candidate/public/filter_by_keywords", { params: clean });
};