import api from "@/services/api";
import { getCandidateId } from "@/utils/authHelper";

export const uploadAadhaar = async (
  frontFile,
  backFile = null
) => {
  const candidateId = getCandidateId();

  const formData = new FormData();

  formData.append("ConsentGiven", true);
  formData.append("FrontImage", frontFile);

  if (backFile) {
    formData.append("BackImage", backFile);
  }

  return api.post(
    `/api/candidate/profile/documents/aadhaar?candidateId=${candidateId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteAadhaar = async () => {
  const candidateId = getCandidateId();

  return api.delete(
    `/api/candidate/profile/documents/aadhaar?candidateId=${candidateId}`
  );
};