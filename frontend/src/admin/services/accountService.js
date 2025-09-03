import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const getAccountDashboard = async (params = {}) => {
  const res = await API.get(`/api/v1/account-dashboard`, { params });
  return res.data;
};

export const payForPost = async (postId) => {
  const res = await API.post(`/api/v1/account-dashboard/${postId}/pay`);
  return res.data;
};

export const getUserPaymentHistory = async (userId, params = {}) => {
  const res = await API.get(`/api/v1/account-dashboard/user/${userId}`, { params });
  return res.data;
};


