import api from "../api";

// POST /api/candidate/settings/support/tickets/{candidateId}   (multipart/form-data)
export const createTicket = (candidateId, payload) => {
  const formData = new FormData();
  formData.append("Subject", payload.subject);
  formData.append("Category", payload.category);
  formData.append("Description", payload.description);

  return api.post(
    `/api/candidate/settings/support/tickets/${candidateId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
};

// GET /api/candidate/settings/support/tickets/{candidateId}
export const getTickets = (candidateId) =>
  api.get(`/api/candidate/settings/support/tickets/${candidateId}`);

// GET /api/candidate/settings/support/{candidateId}/summary
export const getTicketSummary = (candidateId) =>
  api.get(`/api/candidate/settings/support/${candidateId}/summary`);

// GET /api/candidate/settings/support/thread/{ticketId}?candidateId={candidateId}
export const getThread = (ticketId, candidateId) =>
  api.get(`/api/candidate/settings/support/thread/${ticketId}`, {
    params: { candidateId },
  });

// POST /api/candidate/settings/support/tickets/{ticketId}/reply/{candidateId}
export const replyTicket = (ticketId, candidateId, payload) =>
  api.post(
    `/api/candidate/settings/support/tickets/${ticketId}/reply/${candidateId}`,
    payload,
  );

// PATCH /api/candidate/settings/support/tickets/{ticketId}/resolve
export const resolveTicket = (ticketId) =>
  api.patch(`/api/candidate/settings/support/tickets/${ticketId}/resolve`);