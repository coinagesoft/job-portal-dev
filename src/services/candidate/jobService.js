import api from "../api";

export const getSavedJobs = () =>
  api.get("/api/candidate/jobs/saved");