import api from "../api";

/** Returns the country-derived gateway and admin pricing region for this visitor. */
export const getVisitorPaymentRegion = async () => {
  const { data } = await api.get("/api/visitor/payment-region");
  return data?.data;
};
