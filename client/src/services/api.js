import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me")
};

export const usersApi = {
  list: () => api.get("/users")
};

export const conversationsApi = {
  list: () => api.get("/conversations"),
  getOrCreateWithUser: (userId) => api.post(`/conversations/with/${userId}`),
  listMessages: (conversationId, page = 1, limit = 20) =>
    api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit }
    })
};

export const messagesApi = {
  edit: (messageId, payload) => api.patch(`/messages/${messageId}`, payload),
  remove: (messageId) => api.delete(`/messages/${messageId}`)
};

export const uploadsApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }
};
