import api from "../api";

export const getPreferences = () =>
  api.get("/api/candidate/settings/preferences");

export const updatePreferences = (
  payload
) =>
  api.put(
    "/api/candidate/settings/preferences",
    payload
  );