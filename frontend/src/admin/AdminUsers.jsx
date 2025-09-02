import React, { useEffect, useState } from "react";
import { getAllUsers, toggleUserStatus } from "./adminService";
import AdminNavbar from "./Navbar";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const response = await getAllUsers();
    if (response?.success) {
      setUsers(response.users);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const response = await toggleUserStatus(userId, !currentStatus);
    if (response?.success) {
      // Refresh users after toggle
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <AdminNavbar />

      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">User Management</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Full Name</th>
              <th className="p-2">Username</th>
              <th className="p-2">Email</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-2">{user.fullName}</td>
                <td className="p-2">{user.username}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <span
                    className={
                      user.isActive ? "text-green-600" : "text-red-500"
                    }
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                    className={`px-4 py-1 rounded text-white ${
                      user.isActive ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminUserList;
