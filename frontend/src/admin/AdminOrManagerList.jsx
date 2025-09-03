import React, { useEffect, useState } from "react";
import { getAdminOrManagers } from "./services/adminService";
import AdminNavbar from "./Navbar";
import Select from "react-select";
import { Pagination } from "antd";

const ITEMS_PER_PAGE = 10;
const AdminManagerList = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [filter, setFilter] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

  // Fetch admins/managers
  const fetchAdmins = async () => {
    const query = {
      page,
      limit: pageSize,
      role: "all",
    };
    const response = await getAdminOrManagers(query);
    if (response?.success) {
      setAdmins(response.admins);
      setFilteredAdmins(response.admins);
    }
  };

  // Handle filter by role
  const handleFilterChange = (selectedOptions) => {
    setFilter(selectedOptions || []);

    if (!selectedOptions || selectedOptions.length === 0) {
      setFilteredAdmins(admins);
    } else {
      const roles = selectedOptions.map((opt) => opt.value);
      const filtered = admins.filter((admin) => roles.includes(admin.role));
      setFilteredAdmins(filtered);
    }
    setPage(1); // reset to first page
  };

  // Pagination slice
  const paginatedAdmins = filteredAdmins.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <>
      <AdminNavbar />

      <div className="p-6 font-sans">
        {/* Header + Filters */}
        <div className="flex space-x-4 p-4 bg-white shadow-md rounded mb-6">
          <Select
            isMulti
            options={roleOptions}
            value={filter}
            onChange={handleFilterChange}
            placeholder="Filter by Role"
            className="w-1/2"
          />
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded mb-6 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">Full Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Last Login</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {paginatedAdmins.map((admin) => (
                <tr
                  key={admin._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-4">{admin.fullName}</td>
                  <td className="py-3 px-4">{admin.email}</td>
                  <td className="py-3 px-4 capitalize">{admin.role}</td>
                  <td className="py-3 px-4">
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleString()
                      : "Never"}
                  </td>
                </tr>
              ))}

              {paginatedAdmins.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center p-4 text-gray-500 italic"
                  >
                    No matching records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          current={page}
          total={filteredAdmins.length}
          pageSize={pageSize}
          showSizeChanger
          onChange={(p, size) => {
            setPage(p);
            setPageSize(size);
          }}
        />
      </div>
    </>
  );
};

export default AdminManagerList;
