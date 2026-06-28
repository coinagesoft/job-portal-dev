import api from "@/services/api";

/**
 * Reads employer identity needed for [FromHeader] params on the backend.
 * Adjust this if you store these values differently (e.g. JWT decode, context/redux).
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

    console.log("CandidateId:", candidateId);
    console.log("EmployerId:", EmployerId);
    const { data } = await api.get(
      `/api/recruiter/candidates/${candidateId}/full-profile`,
      { params: { employerId: EmployerId } },
    );
    return data;
  },
/**
 * GET /api/recruiter/candidate/{candidateId}
 * Returns contact information after unlock
 */
getCandidateDetails: async (candidateId) => {
  const { EmployerId } = getEmployerHeaders();

  const { data } = await api.get(
    `/api/recruiter/candidate/${candidateId}`,
    {
      headers: {
        EmployerId,
      },
    }
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
   * GET /api/employer/wallet  (header: EmployerId)
   */
  getWallet: async () => {
    const { EmployerId } = getEmployerHeaders();

    const { data } = await api.get("/api/recruiter/wallet", {
      headers: {
        EmployerId,
      },
    });

    return data;
  },

  /**
   * POST /api/employer/candidate/unlock
   * headers: EmployerId, UserId, IsSubUser
   * body: { candidateId }
   */
unlockCandidate: async (candidateId) => {
  const headers = getEmployerHeaders();

  const { data } = await api.post(
    "/api/recruiter/candidate/unlock",
    { candidateId },
    { headers }
  );

  return data;
},
getCandidateDetails: async (candidateId) => {
  const { EmployerId } = getEmployerHeaders();

  const { data } = await api.get(
    `/api/recruiter/candidate/${candidateId}`,
    {
      headers: {
        EmployerId,
      },
    }
  );

  return data;
},

  /**
   * POST /api/employer/candidate/download-cv
   * headers: EmployerId, UserId, IsSubUser
   * body: { candidateId }
   */
  downloadCv: async (candidateId) => {
    const headers = getEmployerHeaders();
    const { data } = await api.post(
      "/api/recruiter/candidate/download-cv",
      { candidateId },
      { headers },
    );
    return data;
  },

  /**
   * GET /api/recruiter/candidate/{candidateId}/cv/download  (header: EmployerId)
   * Streams a watermarked PDF (company name + date). Only works when the
   * profile is unlocked. Triggers a browser download; nothing is stored server-side.
   * Returns { success, message } — on failure the server sends JSON instead of a PDF.
   */
  downloadWatermarkedCv: async (candidateId, candidateName = "Candidate") => {
    const { EmployerId } = getEmployerHeaders();

    try {
      const response = await api.get(
        `/api/recruiter/candidate/${candidateId}/cv/download`,
        {
          headers: { EmployerId },
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