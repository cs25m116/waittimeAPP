import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // If user is admin, fetch additional stats
      if (user?.role === "admin") {
        const usersResponse = await userAPI.getAllUsers(1, 5);
        setStats({
          totalUsers: usersResponse.data.total,
          recentActivities: usersResponse.data.users.slice(0, 5),
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          This is your dashboard. Here you can manage your account and view your
          activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Profile</h3>
              <p className="text-gray-500">Role: {user?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Email</h3>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Member Since
              </h3>
              <p className="text-gray-500">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Section - Only visible to admins */}
      {user?.role === "admin" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Admin Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalUsers}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Recent Users
              </h3>
              <ul className="space-y-2">
                {stats.recentActivities.map((activity) => (
                  <li key={activity._id} className="text-gray-600">
                    {activity.name} - Joined{" "}
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/profile")}
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-colors text-center"
          >
            <span className="block font-semibold text-gray-700">
              View Profile
            </span>
            <span className="text-sm text-gray-500">Manage your account</span>
          </button>

          <button
            onClick={() => (window.location.href = "/profile")}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 transition-colors text-center"
          >
            <span className="block font-semibold text-gray-700">
              Update Password
            </span>
            <span className="text-sm text-gray-500">Change your password</span>
          </button>

          {user?.role === "admin" && (
            <button
              onClick={() => (window.location.href = "/admin")}
              className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 transition-colors text-center"
            >
              <span className="block font-semibold text-gray-700">
                Admin Panel
              </span>
              <span className="text-sm text-gray-500">Manage users</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
