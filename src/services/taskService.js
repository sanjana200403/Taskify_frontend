import { api } from "./api.js";

const unwrap = (response) => response.data;

export const taskService = {
  async list(params = {}) {
    return unwrap(await api.get("/tasks", { params }));
  },
  async create(payload) {
    return unwrap(await api.post("/tasks", payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/tasks/${id}`, payload));
  },
  async remove(id) {
    return unwrap(await api.delete(`/tasks/${id}`));
  },
  async search(q, params = {}) {
    return unwrap(await api.get("/tasks/search", { params: { q, ...params } }));
  },
  async weeklySummary(timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
    return unwrap(await api.get("/tasks/weekly-summary", { params: { timezone } }));
  },
  async analytics(range = "week", timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
    return unwrap(await api.get("/tasks/analytics", { params: { range, timezone } }));
  },
};
