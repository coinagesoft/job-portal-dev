import api from "@/services/api";
import { getCandidateId } from "@/utils/authHelper";

export const uploadResume = async (file) => {
  const candidateId = getCandidateId();

  const formData = new FormData();
  formData.append("resume", file);

  return api.post(
    `/api/candidate/profile/documents/resume?candidateId=${candidateId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteResume = async () => {
  const candidateId = getCandidateId();

  return api.delete(
    `/api/candidate/profile/documents/resume?candidateId=${candidateId}`
  );
};

export const getDocuments = async () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/documents?candidateId=${candidateId}`
  );
};