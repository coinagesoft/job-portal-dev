import api from "@/services/api";
import { getCandidateId } from "@/utils/authHelper";

export const uploadPassport = async (
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
    `/api/candidate/profile/documents/passport?candidateId=${candidateId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deletePassport = async () => {
  const candidateId = getCandidateId();

  return api.delete(
    `/api/candidate/profile/documents/passport?candidateId=${candidateId}`
  );
};