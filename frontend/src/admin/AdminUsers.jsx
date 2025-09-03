import React, { useEffect, useState } from "react";
import { getAllUsers, toggleUserStatus } from "./services/adminService";
import AdminNavbar from "./Navbar";
import Select from "react-select";
import { Pagination } from "antd";
import { CheckIcon, PencilIcon as EditIcon } from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 10;

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [update, setUpdate] = useState({});
  const [editableUserId, setEditableUserId] = useState(-1);

  const fetchUsers = async () => {
    const response = await getAllUsers(page, pageSize);
    if (response?.success) {
      setUsers(response.users);
      setTotalUsers(response.totalUsers);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const response = await toggleUserStatus(userId, currentStatus);
    if (response?.success) {
      fetchUsers();
    }
  };

  const handleSave = (user) => {
    handleToggleStatus(user._id, update.isActive ?? user.isActive);
    setEditableUserId(-1);
  };

  const handleEdit = (user) => {
    setEditableUserId(user._id);
    setUpdate({ isActive: user.isActive });
  };

  const chooseColor = (status) => {
    switch (status) {
      case true:
        return "bg-green-200 text-green-600";
      case false:
        return "bg-red-200 text-red-600";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

  const handleStatusChange = (selectedOptions) => {
    setSelectedStatus(selectedOptions || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    selectedStatus.length > 0
      ? selectedStatus.some((s) => s.value === user.isActive)
      : true
  );

  return (
    <>
      <AdminNavbar />

      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">User Management</h2>

        {/* Filters */}
        <div className="flex space-x-4 p-4 bg-white shadow-md rounded my-6">
          <Select
            isMulti
            options={statusOptions}
            value={selectedStatus}
            onChange={handleStatusChange}
            placeholder="Filter by Status"
            className="w-1/2"
          />
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">Full Name</th>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {filteredUsers
                .slice((page - 1) * pageSize, page * pageSize)
                .map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-4">{user.fullName}</td>
                    <td className="py-3 px-4">{user.username}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {editableUserId === user._id ? (
                        <select
                          value={update.isActive}
                          onChange={(e) =>
                            setUpdate({
                              ...update,
                              isActive: e.target.value === "true",
                            })
                          }
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <span
                          className={`${chooseColor(
                            user.isActive
                          )} py-1 px-3 rounded-full text-xs`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editableUserId === user._id ? (
                        <button
                          onClick={() => handleSave(user)}
                          className="text-blue-500"
                        >
                          <CheckIcon className="w-6 h-6" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-500"
                        >
                          <EditIcon className="w-6 h-6" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          showSizeChanger
          onShowSizeChange={(current, size) => setPageSize(size)}
          current={page}
          total={totalUsers}
          pageSize={pageSize}
          onChange={(p) => setPage(p)}
        />
      </div>
    </>
  );
};

export default AdminUserList;
