import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { WaitingProvider } from "./context/WaitingContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import AdminRoute from "./components/auth/AdminRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/dashboard/Profile";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import WaitingDashboard from "./components/dashboard/WaitingDashboard";
import Navbar from "./components/layout/Navbar";

function App() {
  return (
    <AuthProvider>
      <WaitingProvider>
        <Router>
          <div className="App">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/waiting"
                  element={
                    <PrivateRoute>
                      <WaitingDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </WaitingProvider>
    </AuthProvider>
  );
}

export default App;
