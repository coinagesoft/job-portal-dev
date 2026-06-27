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

export default api;