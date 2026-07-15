import api from "@/services/api";

// EmployerId no longer needs to be sent as a header — the backend now
// resolves it straight from the signed JWT (already attached by the
// shared axios instance as Authorization: Bearer <token>).

export const getInvoices = async (
  fromDate,
  toDate
) => {
  const { data } = await api.get(
    "/api/recruiter/invoices",
    {
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

/**
 * GET /api/recruiter/invoices/{invoiceId}/download
 * Streams a freshly-generated, GST-compliant invoice PDF and triggers a
 * browser download. Nothing is stored server-side — it's regenerated on
 * every request from the invoice + payment transaction records.
 * Returns { success, message } — on failure the server sends JSON, not a PDF.
 */
export const downloadInvoicePdf = async (
  invoiceId,
  invoiceNumber = "invoice"
) => {
  try {
    const response = await api.get(
      `/api/recruiter/invoices/${invoiceId}/download`,
      {
        responseType: "blob",
      },
    );

    const contentType = response.headers?.["content-type"] || "";
    if (contentType.includes("application/json")) {
      const text = await response.data.text();
      const parsed = JSON.parse(text);
      return { success: false, message: parsed.message || "Unable to download invoice." };
    }

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceNumber.replace(/[^a-z0-9-]+/gi, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    let message = "Unable to download invoice.";
    try {
      const text = await error?.response?.data?.text?.();
      if (text) message = JSON.parse(text).message || message;
    } catch (_) {}
    return { success: false, message };
  }
};