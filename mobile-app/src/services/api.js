import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Change this to your computer's IP for physical device testing
const API_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
};

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  updatePassword: (data) => api.put("/users/password", data),
};

// Office APIs
export const officeAPI = {
  getOffices: (params) => api.get("/offices", { params }),
  getOfficeById: (id) => api.get(`/offices/${id}`),
  getOfficeStats: (id, params) => api.get(`/offices/${id}/stats`, { params }),
};

// Waiting APIs
export const waitingAPI = {
  startWaiting: (data) => api.post("/waiting/start", data),
  endWaiting: (data) => api.post("/waiting/end", data),
  getHistory: (params) => api.get("/waiting/history", { params }),
  getActiveSession: () => api.get("/waiting/active"),
};

export default api;
