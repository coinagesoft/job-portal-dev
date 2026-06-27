import jwtDecode from "jwt-decode";
const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const getStoredValue = (key) => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(key);
};

const getDecodedToken = () => {
  const token = getStoredValue("token");

  if (!token) {
    return null;
  }

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Failed to decode JWT token", error);
    return null;
  }
};

export const getCandidateId = () => {
  if (typeof window === "undefined") return null;

  const decoded = getDecodedToken();

  console.log("Decoded JWT:", decoded);

  const role =
    decoded?.[ROLE_CLAIM] ||
    decoded?.role ||
    decoded?.userType;

  if (role && String(role).toLowerCase() === "recruiter") {
    return null;
  }

  const candidateId =
    decoded?.CandidateId ||
    decoded?.candidateId ||
    decoded?.userId ||
    decoded?.[NAME_IDENTIFIER_CLAIM] ||
    getStoredValue("candidateId") ||
    null;

  console.log("Candidate ID:", candidateId);

  return candidateId;
};

export const getEmployerId = () => {
  if (typeof window === "undefined") return null;

  const decoded = getDecodedToken();

  return (
    decoded?.EmployerId ||
    decoded?.employerId ||
    getStoredValue("employerId") ||
    null
  );
};
