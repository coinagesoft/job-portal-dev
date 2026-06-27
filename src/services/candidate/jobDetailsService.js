import api from "@/services/api";

export const getJobDetails = (jobId) => {
  return api.get(
    `/api/candidate/public/job_details/${jobId}`
  );
};