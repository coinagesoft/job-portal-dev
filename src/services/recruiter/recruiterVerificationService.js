import api from "@/services/api";
import jwtDecode from "jwt-decode";

const getEmployerId = () => {
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  return decoded.EmployerId;
};

export const getVerification = async () => {
  const employerId = getEmployerId();

  // No query param here ever changes, so without an explicit cache-buster
  // some browsers/CDNs can serve a stale cached response for this exact
  // URL — which is exactly what "upload succeeds but the document doesn't
  // show up in the list" looks like from thuser's side, even though the
  // upload itself worked fine.
  const { data } = await api.get(
    `/api/recruiter/verification/${employerId}`,
    {
      params: { _: Date.now() },
      headers: { "Cache-Control": "no-cache" },
    }
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