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
      "/api/employer/candidate/unlock",
      { candidateId },
      { headers },
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
      "/api/employer/candidate/download-cv",
      { candidateId },
      { headers },
    );
    return data;
  },
};

export default candidateProfileService;
