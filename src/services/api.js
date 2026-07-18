import axios from "axios";

const api = axios.create({
  baseURL:  process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("API REQUEST:");
  console.log("Base URL:", config.baseURL);
  console.log("URL:", config.url);
  console.log("FULL URL:", config.baseURL + config.url);

  return config;
});

// A 401 here means the server has actively rejected the token on this
// specific request — not just "not logged in yet". The most important case
// this covers: a sub-user whose account the owner just deactivated/deleted
// (see ActiveSubUserMiddleware on the backend) will get a 401 on their very
// next API call, even though their JWT hasn't expired. Clear their local
// session and send them to Login immediately instead of leaving them on a
// page that silently stops working.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const alreadyOnLogin = window.location.pathname.startsWith("/Login");

      localStorage.removeItem("token");
      localStorage.removeItem("candidateId");
      localStorage.removeItem("employerId");

      if (!alreadyOnLogin) {
        window.location.href = "/Login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;