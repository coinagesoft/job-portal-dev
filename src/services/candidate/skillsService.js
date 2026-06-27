import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

// GET Skills
export const getSkills = () => {
  const candidateId = getCandidateId();
  console.log("Candidate ID:", candidateId);

  return api.get(
    `/api/candidate/profile/skills?candidateId=${candidateId}`
  );
};

// CREATE Skill
export const createSkill = (payload) => {
  const candidateId = getCandidateId();

  return api.post(
    `/api/candidate/profile/skills?candidateId=${candidateId}`,
    payload
  );
};

// UPDATE Skill
export const updateSkill = (skillId, payload) => {
  const candidateId = getCandidateId();

  return api.put(
    `/api/candidate/profile/skills/${skillId}?candidateId=${candidateId}`,
    payload
  );
};

// DELETE Skill
export const deleteSkill = (skillId) => {
  const candidateId = getCandidateId();

  return api.delete(
    `/api/candidate/profile/skills/${skillId}?candidateId=${candidateId}`
  );
};