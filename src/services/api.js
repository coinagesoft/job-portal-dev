import axios from "axios";

const api = axios.create({
  baseURL: "https://job-portal-web-phi.vercel.app/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;