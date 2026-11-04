import axios from "axios";

let csrfToken = null;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

export function setCsrfToken(token) {
  csrfToken = token || null;
}

api.interceptors.request.use((config) => {
  if (csrfToken && !["get", "head", "options"].includes(config.method?.toLowerCase())) {
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.includes("/auth/login") && !url.includes("/auth/register")) {
      window.dispatchEvent(new CustomEvent("todo:session-expired"));
    }
    const normalized = new Error(error.response?.data?.message || "Something went wrong. Please try again.");
    normalized.status = error.response?.status;
    normalized.errors = error.response?.data?.errors || [];
    return Promise.reject(normalized);
  },
);
