import api from "@/services/api";

export const getAllJobs = () => {
  return api.get("/api/candidate/public/All_Jobs");
};