import api from "@/services/api";

function getEmployerId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.EmployerId;
  } catch {
    return null;
  }
}

function employerHeader() {
  return { EmployerId: getEmployerId() };
}

/**
 * GET /api/recruiter/wallet
 * Returns creditBalance, allocatedCredits, availableCredits, packageName, packExpiresAt
 */
export const getWallet = async () => {
  const { data } = await api.get("/api/recruiter/wallet", {
    headers: employerHeader(),
  });
  return data;
};

/**
 * GET /api/recruiter/credit-wallet-dashboard
 * Returns remainingCredits, planName, planExpiryDate, creditsUsedThisMonth,
 *         profilesUnlocked, sharedWalletEnabled, totalSubUsers
 */
export const getCreditWalletDashboard = async () => {
  const { data } = await api.get("/api/recruiter/credit-wallet-dashboard", {
    headers: employerHeader(),
  });
  return data;
};

/**
 * GET /api/recruiter/transaction-history
 * Returns combined list of PlanPurchase + ProfileUnlock transactions
 */
export const getTransactionHistory = async () => {
  const { data } = await api.get("/api/recruiter/transaction-history", {
    headers: employerHeader(),
  });
  return data;
};

/**
 * GET /api/recruiter/purchase-history
 * Returns list of plan purchases
 */
export const getPurchaseHistory = async () => {
  const { data } = await api.get("/api/recruiter/purchase-history", {
    headers: employerHeader(),
  });
  return data;
};

/**
 * GET /api/recruiter/credit-usage-history
 * Returns list of profile-unlock credit deductions
 */
export const getCreditUsageHistory = async () => {
  const { data } = await api.get("/api/recruiter/credit-usage-history", {
    headers: employerHeader(),
  });
  return data;
};

/**
 * GET /api/recruiter/allocation-history
 * Returns credits allocated to sub-users
 */
export const getAllocationHistory = async () => {
  const { data } = await api.get("/api/recruiter/allocation-history", {
    headers: employerHeader(),
  });
  return data;
};

/**
 * GET /api/recruiter/unlocked-candidates
 * Returns list of unlocked candidate profiles
 */
export const getUnlockedCandidates = async () => {
  const { data } = await api.get("/api/recruiter/unlocked-candidates", {
    headers: employerHeader(),
  });
  return data;
};

/**
 * GET /api/recruiter/cv-download-history
 * Returns list of CV downloads
 */
export const getCvDownloadHistory = async () => {
  const { data } = await api.get("/api/recruiter/cv-download-history", {
    headers: employerHeader(),
  });
  return data;
};

/**
 * POST /api/recruiter/allocate-credits
 * Body: { subUserId, credits }
 */
export const allocateCredits = async (subUserId, credits) => {
  const { data } = await api.post(
    "/api/recruiter/allocate-credits",
    { subUserId, credits },
    { headers: employerHeader() }
  );
  return data;
};

/**
 * POST /api/recruiter/credit-plans/create-order
 */
export const createCreditPlanOrder = async (planId) => {
  const { data } = await api.post(
    "/api/recruiter/plans/create-order",
    {
      planId,
    },
    {
      headers: employerHeader(),
    }
  );

  return data;
};

/**
 * POST /api/recruiter/credit-plans/verify-payment
 */
export const verifyCreditPlanPayment = async ({
  transactionId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const { data } = await api.post(
    "/api/recruiter/plans/verify-payment",
    {
      transactionId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    },
    {
      headers: employerHeader(),
    }
  );

  return data;
};

export const getCreditPlans = async () => {
  const { data } = await api.get("/api/recruiter/plans", {
    headers: employerHeader(),
  });

  return data;
};
