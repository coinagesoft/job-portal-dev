import api from "../api";

export const getItiInfo = () =>
  api.get("/api/candidate/profile/iti-info");

export const updateItiInfo = (payload) =>
  api.put(
    "/api/candidate/profile/iti-info",
    payload
  );