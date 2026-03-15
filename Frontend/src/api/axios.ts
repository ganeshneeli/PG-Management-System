import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api/v1`)
  : (import.meta.env.MODE === 'development' ? "http://localhost:5001/api/v1" : "/api/v1");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30s for robustness
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
