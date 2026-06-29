import api from "@/services/api";
import {jwtDecode} from "jwt-decode";

const getEmployerId = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token not found");
  }

  const decoded = jwtDecode(token);

  return decoded.EmployerId;
};

export const searchCandidates = async (searchParams) => {
  const employerId = getEmployerId();

  const response = await api.get("/api/recruiter/cv-search", {
    params: {
      employerId,
      ...searchParams,
    },
  });
return response.data;

  
};

export const getCvSearchDashboard = async () => {
  const employerId = getEmployerId();

  const response = await api.get("/api/recruiter/cv-search/dashboard", {
    params: { employerId },
  });

  return response.data;
};

export const getCandidatePreview = async (candidateId) => {
  const employerId = getEmployerId();

  const response = await api.get(
    `/api/recruiter/cv-search/${candidateId}/preview`,
    {
      params: { employerId },
    }
  );

  return response.data;
};

export const getFilterOptions = async () => {
  const response = await api.get(
    "/api/recruiter/cv-search/filter-options"
  );

  return response.data;
};

export const getUnlockedCandidates = async () => {
  const employerId = getEmployerId();

  const response = await api.get(
    "/api/recruiter/cv-search/unlocked",
    {
      params: { employerId },
    }
  );

  return response.data;
};