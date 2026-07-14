// services/candidate/jobFilterService.js
import api from "../api";

export const getJobFilterOptions = () => {
  return api.get("/api/candidate/jobs/filter-options");
};

export const searchJobsByFilters = (params) => {
  // strip out empty/undefined so we don't send blank query strings
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  return api.get("/api/candidate/public/filter_by_keywords", { params: cleanParams });
};