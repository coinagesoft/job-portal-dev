import api from "../api";

export const saveJob = (jobId) =>
  api.post(
    `/api/candidate/jobs/${jobId}/save`,
    null
  );

  export const getSavedJobs = () =>
  api.get("/api/candidate/jobs/saved");