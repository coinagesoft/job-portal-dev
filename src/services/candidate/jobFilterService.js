// services/candidate/jobFilterService.js

// services/candidate/jobFilterService.js

import api from "../api";

export const getJobFilterOptions = () => {
  return api.get("/api/candidate/jobs/filter-options");
};