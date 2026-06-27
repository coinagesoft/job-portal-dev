import api from "@/services/api";

export const getJobDetails = (jobId) => {
  return api.get(
    `/api/candidate/jobs/job_details/${jobId}`
  );
};