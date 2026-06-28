// services/candidate/notificationFeedService.js
// Candidate in-app notification feed (distinct from notification settings).

import api from "@/services/api";
import { getCandidateId } from "@/utils/authHelper";

export const getNotifications = async (filter = "all") => {
  const candidateId = getCandidateId();
  const { data } = await api.get(
    `/api/candidate/notification/notifications/${candidateId}`,
    { params: { filter } },
  );
  return data;
};

export const markAsRead = async (notificationId) => {
  const { data } = await api.patch(
    `/api/candidate/notification/notifications/${notificationId}/read`,
  );
  return data;
};

export const markAllAsRead = async () => {
  const candidateId = getCandidateId();
  const { data } = await api.patch(
    `/api/candidate/notification/notifications/${candidateId}/read-all`,
  );
  return data;
};