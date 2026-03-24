import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI, userAPI } from "../services/api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem(process.env.REACT_APP_TOKEN_KEY);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY);
          setUser(null);
        } else {
          loadUser();
        }
      } catch (error) {
        localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem(process.env.REACT_APP_TOKEN_KEY);
      if (token) {
        console.log("Loading user profile...");
        const response = await userAPI.getProfile();
        console.log("Profile response:", response.data);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      localStorage.setItem(process.env.REACT_APP_TOKEN_KEY, token);
      setUser(user);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      localStorage.setItem(process.env.REACT_APP_TOKEN_KEY, token);

      // Fetch complete user profile after login
      const profileResponse = await userAPI.getProfile();
      console.log("Complete user profile:", profileResponse.data.user);
      setUser(profileResponse.data.user);

      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY);
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      setError(null);

      console.log("AuthContext - Received data:", data);

      // Format the data properly for the backend
      const formattedData = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        address: data.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      };

      console.log("AuthContext - Formatted data:", formattedData);

      const response = await userAPI.updateProfile(formattedData);
      console.log("AuthContext - API Response:", response.data);

      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("AuthContext - Full error object:", error);

      // Log the detailed error response
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          "AuthContext - Error response data:",
          error.response.data,
        );
        console.error(
          "AuthContext - Error response status:",
          error.response.status,
        );
        console.error(
          "AuthContext - Error response headers:",
          error.response.headers,
        );

        const message = error.response.data?.message || "Update failed";
        setError(message);
        return { success: false, error: message };
      } else if (error.request) {
        // The request was made but no response was received
        console.error("AuthContext - No response received:", error.request);
        setError("No response from server");
        return { success: false, error: "No response from server" };
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("AuthContext - Request setup error:", error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }
    }
  };

  const updatePassword = async (data) => {
    try {
      setError(null);
      const response = await userAPI.updatePassword(data);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || "Password update failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
