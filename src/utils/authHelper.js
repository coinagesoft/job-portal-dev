import { jwtDecode } from "jwt-decode";

export const getCandidateId = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token not found");
  }

  const decoded = jwtDecode(token);

  return decoded.CandidateId;
};

export const getEmployerId = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token not found");
  }

  const decoded = jwtDecode(token);

  return decoded.EmployerId;
};