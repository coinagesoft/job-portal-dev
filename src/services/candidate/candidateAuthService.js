import api from "../api";

export const registerCandidate = (payload) =>
api.post("/api/candidate/auth/register", payload);

export const sendOtp = (payload) =>
api.post("/api/candidate/auth/send-otp", payload);

export const verifyOtp = (payload) =>
api.post("/api/candidate/auth/verify-otp", payload);

export const createCandidateOrder = (payload) =>
api.post("/api/candidate/auth/create-order", payload);

export const googleLogin = (payload) =>
api.post("/api/candidate/auth/google", payload);

export const linkedInLogin = (payload) =>
api.post("/api/candidate/auth/linkedin", payload);
