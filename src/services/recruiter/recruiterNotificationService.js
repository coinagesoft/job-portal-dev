import api from "@/services/api";

function getEmployerId() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return payload.EmployerId;
  } catch {
    return null;
  }
}

export const getNotifications = async (
  filter = "all"
) => {
  const employerId = getEmployerId();

  const { data } = await api.get(
    `/api/recruiter/notification/notifications/${employerId}`,
    {
      params: { filter },
    }
  );

  return data;
};

export const markAsRead = async (
  notificationId
) => {
  const { data } = await api.patch(
    `/api/recruiter/notification/notifications/${notificationId}/read`
  );

  return data;
};

export const markAllAsRead =
  async () => {
    const employerId = getEmployerId();

    const { data } = await api.patch(
      `/api/recruiter/notification/notifications/${employerId}/read-all`
    );

    return data;
  };

export const getSettings =
  async () => {
    const employerId = getEmployerId();

    const { data } = await api.get(
      `/api/recruiter/notification/notification-settings/${employerId}`
    );

    return data;
  };

export const updateSettings =
  async (payload) => {
    const employerId = getEmployerId();

    const { data } = await api.patch(
      `/api/recruiter/notification/notification-settings/${employerId}`,
      payload
    );

    return data;
  };