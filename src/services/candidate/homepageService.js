import api from "@/services/api";

export const getHomepageData = () => {
  return api.get("/api/public/homepage/data");
};
