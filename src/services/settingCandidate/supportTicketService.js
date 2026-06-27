import api from "../api";

export const createTicket = (payload) => {
  const formData = new FormData();

  formData.append("Subject", payload.subject);
  formData.append("Category", payload.category);
  formData.append("Description", payload.description);

  return api.post(
    `/api/candidate/settings/support/tickets`    ,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const getTickets = () =>
  api.get(
    `/api/candidate/settings/support/tickets`
  );

export const getTicketSummary = () =>
  api.get(
    `/api/candidate/settings/support/summary`
  );

export const getThread = (ticketId) =>
  api.get(
    `/api/candidate/settings/support/thread/${ticketId}`
  );

export const replyTicket = (
  ticketId,
  payload
) =>
  api.post(
    `/api/candidate/settings/support/tickets/${ticketId}/reply`,
    payload
  );

export const resolveTicket = (ticketId) =>
  api.patch(
    `/api/candidate/settings/support/tickets/${ticketId}/resolve`
  );
