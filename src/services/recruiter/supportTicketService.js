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

export const getTickets = async () => {
  const employerId = getEmployerId();

  return api.get(
    `/api/recruiter/support-tickets/${employerId}`
  );
};

export const getTicketSummary = async () => {
  const employerId = getEmployerId();

  return api.get(
    `/api/recruiter/support-tickets/${employerId}/summary`
  );
};

export const getThread = async (ticketId) => {
  return api.get(
    `/api/recruiter/support-tickets/thread/${ticketId}`
  );
};

export const createTicket = async (
  payload
) => {
  const employerId = getEmployerId();

  const formData = new FormData();

  formData.append(
    "TicketType",
    payload.category
  );

  formData.append(
    "Subject",
    payload.subject
  );

  formData.append(
    "Description",
    payload.description
  );

  if (payload.file) {
    formData.append(
      "Attachment",
      payload.file
    );
  }

  return api.post(
    `/api/recruiter/support-tickets/${employerId}`,
    formData
  );
};

export const replyTicket = async (
  ticketId,
  payload
) => {
  const employerId = getEmployerId();

  return api.post(
    `/api/recruiter/support-tickets/${ticketId}/reply/${employerId}`,
    {
      message: payload.message,
    }
  );
};

export const resolveTicket = async (
  ticketId
) => {
  return api.patch(
    `/api/recruiter/support-tickets/${ticketId}/resolve`
  );
};