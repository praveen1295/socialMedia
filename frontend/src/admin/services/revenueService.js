import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const getRevenueSharing = async () => {
  const res = await API.get(`/api/v1/revenue-sharing`);
  return res.data;
};

export const createRevenueSharing = async (data) => {
  const res = await API.post(`/api/v1/revenue-sharing`, data);
  return res.data;
};

export const updateRevenueSharing = async (data) => {
  const res = await API.put(`/api/v1/revenue-sharing`, data);
  return res.data;
};

export const getRevenueSharingHistory = async (params = {}) => {
  const res = await API.get(`/api/v1/revenue-sharing/history`, { params });
  return res.data;
};


