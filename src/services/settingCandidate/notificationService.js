import api from "../api";

export const getNotifications = () =>
  api.get("/api/candidate/settings/notifications");

export const updateNotifications = (
  payload
) =>
  api.put(
    "/api/candidate/settings/notifications",
    payload
  );

export const resetNotifications = () =>
  api.put(
    "/api/candidate/settings/notifications/reset",
    {}
  );