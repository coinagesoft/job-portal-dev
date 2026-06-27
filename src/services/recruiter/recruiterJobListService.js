import api from "@/services/api";
import jwtDecode from "jwt-decode";

const getEmployerId = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token not found");
  }

  const decoded = jwtDecode(token);

  return decoded.EmployerId;
};

export const getJobDashboard = async () => {
  const employerId = getEmployerId();

  const response = await api.get(
    "/api/recruiter/jobs/dashboard",
    {
      params: {
        employerId,
      },
    }
  );

  return response.data;
};

export const getRecruiterJobs = async ({
  search = "",
  status = "",
  jobType = "",
  pageNumber = 1,
  pageSize = 10,
}) => {
  const employerId = getEmployerId();

  const response = await api.get(
    "/api/recruiter/jobs",
    {
      params: {
        employerId,
        Search: search,
        Status: status,
        JobType: jobType,
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    }
  );

  return response.data;
};