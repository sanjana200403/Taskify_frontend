import { api, setCsrfToken } from "./api.js";

function captureSession(response) {
  setCsrfToken(response.data.data.csrfToken);
  return response.data.data.user;
}

export const authService = {
  async register(payload) {
    return captureSession(await api.post("/auth/register", payload));
  },
  async login(payload) {
    return captureSession(await api.post("/auth/login", payload));
  },
  async me() {
    return captureSession(await api.get("/auth/me"));
  },
  async logout() {
    await api.post("/auth/logout");
    setCsrfToken(null);
  },
};
