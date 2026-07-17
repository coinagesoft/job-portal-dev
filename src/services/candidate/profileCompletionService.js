import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

// Accepts an explicit candidateId (recruiter viewing someone else's profile).
// Falls back to the logged-in candidate's own ID when none is passed, so
// existing candidate-side usage of this function keeps working unchanged.
export const getProfileCompletion = (candidateId) => {
  const id = candidateId || getCandidateId();
  return api.get(`/api/candidate/profile/completion?candidateId=${id}`);
};