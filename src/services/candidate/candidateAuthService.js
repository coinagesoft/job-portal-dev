import api from "../api";

export const registerCandidate = (payload) =>
api.post("/api/candidate/auth/register", payload);

export const sendOtp = (payload) =>
api.post("/api/candidate/auth/send-otp", payload);

export const verifyOtp = (payload) =>
api.post("/api/candidate/auth/verify-otp", payload);

export const createCandidateOrder = (payload) =>
api.post("/api/candidate/auth/create-order", payload);

// ── PayPal (visitors outside India) ─────────────────────────────
// The gateway is decided by the server from the visitor's IP:
// GET /api/visitor/payment-region -> "Razorpay" (India) or "PayPal".

// Body: { otpToken?, accessToken?, couponCode? }
// otpToken for mobile/email registration, accessToken for Google/LinkedIn.
// Price, currency and plan are resolved server-side.
export const createCandidatePayPalOrder = (payload) =>
  api.post("/api/candidate/auth/paypal/create-order", payload);

// Body: { payPalOrderId, otpToken?, accessToken? }
// Captures the approved order. Then register with payPalOrderId.
export const captureCandidatePayPal = (payload) =>
  api.post("/api/candidate/auth/paypal/capture", payload);

export const validateCandidateCoupon = (payload) =>
  api.post("/api/candidate/auth/validate-coupon", payload);

export const googleLogin = (payload) =>
api.post("/api/candidate/auth/google", payload);

export const linkedInLogin = (payload) =>
api.post("/api/candidate/auth/linkedin", payload);

export const getCandidatePlan = (region) =>
api.get(`/api/plans/candidate?region=${region}`);