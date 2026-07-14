import api from "../api";

// GOOGLE REGISTRATION
export const registerWithGoogle = (payload) =>
  api.post(
    "/api/candidate/registration/google",
    payload
  );


// LINKEDIN REGISTRATION
export const registerWithLinkedIn = (payload) =>
  api.post(
    "/api/candidate/registration/linkedin",
    payload
  );

  export const verifyWithGoogle = (payload) =>
  api.post("/api/candidate/registration/google/verify", payload);

export const verifyWithLinkedIn = (payload) =>
  api.post("/api/candidate/registration/linkedin/verify", payload);