import api from "@/services/api";
import jwtDecode from "jwt-decode";

const getEmployerId = () => {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  return decoded.EmployerId;
};

export const getVerification = async () => {
  const employerId = getEmployerId();

  const { data } = await api.get(
    `/api/recruiter/verification/${employerId}`,
    {
      params: { _: Date.now() },
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return data;
};

export const getDocumentTypes = async () => {
  const { data } = await api.get(
    `/api/recruiter/verification/document-types`
  );

  return data;
};


export const uploadDocument = async (
    documentTypeId,
    customDocumentName,
    file
) => {
    const employerId = getEmployerId();

    const formData = new FormData();

    if (documentTypeId !== "OTHER") {
        formData.append("DocumentTypeId", documentTypeId);
    } else {
        formData.append("CustomDocumentName", customDocumentName);
    }

    formData.append("File", file);

    return api.post(
        `/api/recruiter/verification/${employerId}/document`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
};