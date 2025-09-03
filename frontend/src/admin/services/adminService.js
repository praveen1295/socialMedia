import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Adjust baseURL as per your setup
const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // To send cookies
});

export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const res = await API.get(
      `/api/v1/admin/getAllUsers?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch users", err);
    return null;
  }
};

export const toggleUserStatus = async (userId, isActive) => {
  try {
    const res = await API.patch(`/api/v1/admin/toggleUserStatus/${userId}`, {
      isActive,
    });

    return res.data;
  } catch (err) {
    console.error("Failed to update user status", err);
    return null;
  }
};

export const getAdminOrManagers = async ({
  page = 1,
  limit = 10,
  role = "",
}) => {
  try {
    const res = await API.get("api/v1/admin/getAdminOrManagers", {
      params: { page, limit, role },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch admins/managers", err);
    return null;
  }
};
