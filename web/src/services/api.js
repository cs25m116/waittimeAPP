import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(process.env.REACT_APP_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  refreshToken: () => api.post("/auth/refresh-token"),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  updatePassword: (data) => api.put("/users/password", data),

  // Admin APIs
  getAllUsers: (page = 1, limit = 10) =>
    api.get(`/users?page=${page}&limit=${limit}`),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

// Office APIs
export const officeAPI = {
  getOffices: (params) => api.get("/offices", { params }),
  getOfficeById: (id) => api.get(`/offices/${id}`),
  getOfficeStats: (id, params) => api.get(`/offices/${id}/stats`, { params }),
  createOffice: (data) => api.post("/offices", data),
  updateOffice: (id, data) => api.put(`/offices/${id}`, data),
};

// Waiting APIs
export const waitingAPI = {
  startWaiting: (data) => api.post("/waiting/start", data),
  endWaiting: (data) => api.post("/waiting/end", data),
  getHistory: (params) => api.get("/waiting/history", { params }),
  getActiveSession: () => api.get("/waiting/active"),
};

export default api;
