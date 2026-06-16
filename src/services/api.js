import axios from "axios";

const api = axios.create({
  baseURL: "http://103.224.246.190:5010",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;