import api from "../api";

export const sendOtp = (payload) =>
    api.post("/api/auth/send-otp", payload);

export const verifyOtp = (payload) =>
    api.post("/api/auth/verify-otp", payload);

export const googleLogin = (payload) =>
    api.post("/api/auth/google", payload);

export const linkedInLogin = (payload) =>
    api.post("/api/auth/linkedin", payload);