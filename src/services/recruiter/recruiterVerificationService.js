import api from "@/services/api";
import {jwtDecode} from "jwt-decode";

const getEmployerId = () => {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  return decoded.EmployerId;
};

export const getVerification = async () => {
  const employerId = getEmployerId();

  const { data } = await api.get(
    `/api/recruiter/verification/${employerId}`
  );

  return data;
};

export const uploadDocument = async (
  documentType,
  file
) => {
  const employerId = getEmployerId();

  const formData = new FormData();

  formData.append("DocumentType", documentType);
  formData.append("File", file);

  const { data } = await api.post(
    `/api/recruiter/verification/${employerId}/document`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

export const getDocument = async (documentType) => {
  const employerId = getEmployerId();

  const { data } = await api.get(
    `/api/recruiter/verification/${employerId}/document/${documentType}`
  );

  return data;
};