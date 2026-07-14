import api from "@/services/api";

export const getSubUsers = async () => {
  const { data } = await api.get(
    "/api/recruiter/sub-users"
  );

  return data;
};

export const inviteSubUser = async (payload) => {
  const { data } = await api.post(
    "/api/recruiter/sub-users/invite",
    payload
  );

  return data;
};

export const updateSubUser = async (
  subUserId,
  payload
) => {
  const { data } = await api.put(
    `/api/recruiter/sub-users/${subUserId}`,
    payload
  );

  return data;
};

export const deactivateSubUser = async (
  subUserId
) => {
  const { data } = await api.put(
    `/api/recruiter/sub-users/${subUserId}/deactivate`
  );

  return data;
};

export const reactivateSubUser = async (
  subUserId
) => {
  const { data } = await api.put(
    `/api/recruiter/sub-users/${subUserId}/reactivate`
  );

  return data;
};

export const resendInvite = async (
  subUserId
) => {
  const { data } = await api.post(
    `/api/recruiter/sub-users/${subUserId}/resend-invite`
  );

  return data;
};

export const deleteSubUser = async (
  subUserId
) => {
  const { data } = await api.delete(
    `/api/recruiter/sub-users/${subUserId}`
  );

  return data;
};

export const getRolePermissions = async (
  role
) => {
  const { data } = await api.get(
    `/api/recruiter/sub-users/role-permissions/${role}`
  );

  return data;
};
// // POST /api/recruiter/sub-users/accept-invite?token={token}
// export const acceptInvite = async (token) => {
//   const { data } = await api.post(
//     `/api/recruiter/sub-users/accept-invite?token=${encodeURIComponent(token)}`
//   );

//   return data;
// };

// POST /api/recruiter/sub-users/accept-invite?token={token}
export const acceptInvite = async (payload) => {
  const { data } = await api.post(
    "/api/recruiter/sub-users/accept-invite",
    payload
  );

  return data;
};

export const validateInvite = async (token) => {
  const { data } = await api.get(
    `/api/recruiter/sub-users/validate-invite/${token}`
  );

  return data;
};