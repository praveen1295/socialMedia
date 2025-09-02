import React, { useEffect, useState } from "react";
import { getAdminOrManagers } from "./adminService";
import AdminNavbar from "./Navbar";

const AdminManagerList = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchAdmins = async () => {
    const response = await getAdminOrManagers();
    if (response?.success) {
      setAdmins(response.admins);
      setFilteredAdmins(response.admins);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    if (value === "all") {
      setFilteredAdmins(admins);
    } else {
      const filtered = admins.filter((admin) => admin.role === value);
      setFilteredAdmins(filtered);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <>
      <AdminNavbar />

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Admin / Manager List</h2>
          <select
            value={filter}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Full Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin) => (
              <tr key={admin._id} className="border-t">
                <td className="p-2">{admin.fullName}</td>
                <td className="p-2">{admin.email}</td>
                <td className="p-2 capitalize">{admin.role}</td>
                <td className="p-2">
                  {admin.lastLogin
                    ? new Date(admin.lastLogin).toLocaleString()
                    : "Never"}
                </td>
              </tr>
            ))}

            {filteredAdmins.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No matching records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminManagerList;
