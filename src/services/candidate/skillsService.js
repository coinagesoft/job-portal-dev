import api from "../api";

// GET Skills
export const getSkills = (candidateId) =>
  api.get("/api/candidate/profile/skills", {
    params: { candidateId },
  });

// CREATE Skill
export const createSkill = (candidateId, payload) =>
  api.post(
    "/api/candidate/profile/skills",
    payload,
    {
      params: { candidateId },
    }
  );

// UPDATE Skill
export const updateSkill = (
  skillId,
  candidateId,
  payload
) =>
  api.put(
    `/api/candidate/profile/skills/${skillId}`,
    payload,
    {
      params: { candidateId },
    }
  );

// DELETE Skill
export const deleteSkill = (
  skillId,
  candidateId
) =>
  api.delete(
    `/api/candidate/profile/skills/${skillId}`,
    {
      params: { candidateId },
    }
  );