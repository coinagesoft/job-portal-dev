import api from "@/services/api";

export const getAllJobs = (params = {}) => {
  return api.get("/api/candidate/public/All_Jobs", { params });
};