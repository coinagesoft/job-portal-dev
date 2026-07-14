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

/**
 * POST /api/candidate/profile/documents/generated-cv
 * Builds/refreshes the "Portal CV" — a PDF generated from the candidate's
 * CURRENT profile data (personal info, work history, education, skills,
 * languages) using the portal's default template. Separate from the
 * originally uploaded resume; call again any time profile data changes.
 */
export const generateCv = async () => {
  const candidateId = getCandidateId();

  return api.post(
    `/api/candidate/profile/documents/generated-cv?candidateId=${candidateId}`
  );
};

/**
 * GET /api/candidate/profile/documents/generated-cv/download
 * Downloads the candidate's own Portal CV, watermarked the same way an
 * employer's download is (their own name instead of a company name).
 * Streams a PDF blob — or JSON with an error message if none exists yet.
 */
export const downloadGeneratedCv = async (candidateName = "Candidate") => {
  const candidateId = getCandidateId();

  try {
    const response = await api.get(
      `/api/candidate/profile/documents/generated-cv/download?candidateId=${candidateId}`,
      { responseType: "blob" },
    );

    const contentType = response.headers?.["content-type"] || "";
    if (contentType.includes("application/json")) {
      const text = await response.data.text();
      const parsed = JSON.parse(text);
      return { success: false, message: parsed.message || "Unable to download Portal CV." };
    }

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${candidateName.replace(/[^a-z0-9]+/gi, "_")}_Portal_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    let message = "Unable to download Portal CV.";
    try {
      const text = await error?.response?.data?.text?.();
      if (text) message = JSON.parse(text).message || message;
    } catch (_) {}
    return { success: false, message };
  }
};