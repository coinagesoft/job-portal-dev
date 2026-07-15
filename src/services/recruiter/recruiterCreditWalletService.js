import api from "@/services/api";

// EmployerId no longer needs to be sent as a header — the backend now
// resolves it straight from the signed JWT (which the shared axios
// instance already attaches as Authorization: Bearer <token> on every
// request). This works correctly for both the account owner and any
// of their sub-users, unlike the old header-based approach.

/**
 * GET /api/recruiter/wallet
 * Returns creditBalance, allocatedCredits, availableCredits, packageName, packExpiresAt
 */
export const getWallet = async () => {
  const { data } = await api.get("/api/recruiter/wallet");
  return data;
};

/**
 * GET /api/recruiter/credit-wallet-dashboard
 * Returns remainingCredits, planName, planExpiryDate, creditsUsedThisMonth,
 *         profilesUnlocked, sharedWalletEnabled, totalSubUsers
 */
export const getCreditWalletDashboard = async () => {
  const { data } = await api.get("/api/recruiter/credit-wallet-dashboard");
  return data;
};

/**
 * GET /api/recruiter/transaction-history
 * Returns combined list of PlanPurchase + ProfileUnlock transactions
 */
export const getTransactionHistory = async () => {
  const { data } = await api.get("/api/recruiter/transaction-history");
  return data;
};

/**
 * GET /api/recruiter/purchase-history
 * Returns list of plan purchases
 */
export const getPurchaseHistory = async () => {
  const { data } = await api.get("/api/recruiter/purchase-history");
  return data;
};

/**
 * GET /api/recruiter/credit-usage-history
 * Returns list of profile-unlock credit deductions
 */
export const getCreditUsageHistory = async () => {
  const { data } = await api.get("/api/recruiter/credit-usage-history");
  return data;
};

/**
 * GET /api/recruiter/allocation-history
 * Returns credits allocated to sub-users
 */
export const getAllocationHistory = async () => {
  const { data } = await api.get("/api/recruiter/allocation-history");
  return data;
};

/**
 * GET /api/recruiter/unlocked-candidates
 * Returns list of unlocked candidate profiles
 */
export const getUnlockedCandidates = async () => {
  const { data } = await api.get("/api/recruiter/unlocked-candidates");
  return data;
};

/**
 * GET /api/recruiter/cv-download-history
 * Returns list of CV downloads
 */
export const getCvDownloadHistory = async () => {
  const { data } = await api.get("/api/recruiter/cv-download-history");
  return data;
};

/**
 * POST /api/recruiter/allocate-credits
 * Body: { subUserId, credits }
 */
export const allocateCredits = async (subUserId, credits) => {
  const { data } = await api.post("/api/recruiter/allocate-credits", {
    subUserId,
    credits,
  });
  return data;
};

/**
 * POST /api/recruiter/plans/create-order
 */
export const createCreditPlanOrder = async (planId) => {
  const { data } = await api.post("/api/recruiter/plans/create-order", {
    planId,
  });

  return data;
};

/**
 * POST /api/recruiter/plans/verify-payment
 */
export const verifyCreditPlanPayment = async ({
  transactionId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const { data } = await api.post("/api/recruiter/plans/verify-payment", {
    transactionId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  return data;
};

export const getCreditPlans = async () => {
  const { data } = await api.get("/api/recruiter/plans");

  return data;
};