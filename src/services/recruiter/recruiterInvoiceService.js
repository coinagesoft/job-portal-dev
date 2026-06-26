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

export const getInvoices = async (
  fromDate,
  toDate
) => {
  const employerId = getEmployerId();

  const { data } = await api.get(
    "/api/recruiter/invoices",
    {
      headers: {
        EmployerId: employerId,
      },
      params: {
        fromDate,
        toDate,
      },
    }
  );

  return data;
};

export const getInvoiceDetails = async (
  invoiceId
) => {
  const { data } = await api.get(
    `/api/recruiter/invoices/${invoiceId}`
  );

  return data;
};