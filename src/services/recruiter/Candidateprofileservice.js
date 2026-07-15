import api from "@/services/api";

/**
 * Reads employer identity needed for [FromQuery] params on endpoints that
 * still expect it that way (full-profile, unlock-status) — those live on a
 * different controller that wasn't part of this pass.
 */
function getEmployerHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      EmployerId: null,
      UserId: null,
      IsSubUser: false,
    };
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      EmployerId: payload.EmployerId,
      UserId:
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      IsSubUser: false,
    };
  } catch (error) {
    console.error("JWT decode failed", error);

    return {
      EmployerId: null,
      UserId: null,
      IsSubUser: false,
    };
  }
}

const candidateProfileService = {
  /**
   * GET /api/recruiter/candidates/{candidateId}/full-profile?employerId=...
   * Returns Overview, Summary, Skills, Languages, Educations, WorkHistories, Cv, UnlockStatus
   */
  getFullProfile: async (candidateId) => {
    const { EmployerId } = getEmployerHeaders();

    const { data } = await api.get(
      `/api/recruiter/candidates/${candidateId}/full-profile`,
      { params: { employerId: EmployerId } },
    );
    return data;
  },

  /**
   * GET /api/recruiter/candidate/{candidateId}
   * Returns contact information after unlock. EmployerId now comes from
   * the JWT — no header needed.
   */
  getCandidateDetails: async (candidateId) => {
    const { data } = await api.get(
      `/api/recruiter/candidate/${candidateId}`,
    );

    return data;
  },

  /**
   * GET /api/recruiter/candidates/{candidateId}/unlock-status?employerId=...
   */
  getUnlockStatus: async (candidateId) => {
    const { EmployerId } = getEmployerHeaders();
    const { data } = await api.get(
      `/api/recruiter/candidates/${candidateId}/unlock-status`,
      { params: { employerId: EmployerId } },
    );
    return data;
  },

  /**
   * GET /api/recruiter/wallet
   * EmployerId now comes from the JWT — no header needed.
   */
  getWallet: async () => {
    const { data } = await api.get("/api/recruiter/wallet");

    return data;
  },

  /**
   * POST /api/recruiter/candidate/unlock
   * body: { candidateId }
   * EmployerId/UserId/IsSubUser now all come from the JWT — no headers needed.
   */
  unlockCandidate: async (candidateId) => {
    const { data } = await api.post(
      "/api/recruiter/candidate/unlock",
      { candidateId },
    );

    return data;
  },

  /**
   * POST /api/recruiter/candidate/download-cv
   * body: { candidateId }
   * EmployerId/UserId/IsSubUser now all come from the JWT — no headers needed.
   */
  downloadCv: async (candidateId) => {
    const { data } = await api.post(
      "/api/recruiter/candidate/download-cv",
      { candidateId },
    );
    return data;
  },

  /**
   * GET /api/recruiter/candidate/{candidateId}/cv/download
   * Streams a watermarked PDF (company name + date). Only works when the
   * profile is unlocked. Triggers a browser download; nothing is stored
   * server-side. EmployerId now comes from the JWT — no header needed.
   * Returns { success, message } — on failure the server sends JSON instead of a PDF.
   */
  downloadWatermarkedCv: async (candidateId, candidateName = "Candidate") => {
    try {
      const response = await api.get(
        `/api/recruiter/candidate/${candidateId}/cv/download`,
        {
          responseType: "blob",
        },
      );

      // If the profile is locked / no CV, the server returns JSON, not a PDF.
      const contentType = response.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const parsed = JSON.parse(text);
        return { success: false, message: parsed.message || "Unable to download CV." };
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${candidateName.replace(/[^a-z0-9]+/gi, "_")}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      // axios with responseType blob wraps error bodies as blobs too
      let message = "Unable to download CV.";
      try {
        const text = await error?.response?.data?.text?.();
        if (text) message = JSON.parse(text).message || message;
      } catch (_) {}
      return { success: false, message };
    }
  },
};

export default candidateProfileService;