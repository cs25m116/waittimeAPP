import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Industry Project
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>
                <Link to="/waiting" className="hover:text-blue-200">
                  Waiting
                </Link>
                <Link to="/profile" className="hover:text-blue-200">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-blue-200">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Welcome, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link to="/register" className="hover:text-blue-200">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
