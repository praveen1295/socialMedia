import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const createEmployee = async (data) => {
  const res = await API.post(`/api/v1/employee`, data);
  return res.data;
};

export const getEmployees = async (params = {}) => {
  const res = await API.get(`/api/v1/employee`, { params });
  return res.data;
};

export const updateEmployee = async (id, data) => {
  const res = await API.put(`/api/v1/employee/${id}`, data);
  return res.data;
};

export const deleteEmployee = async (id) => {
  const res = await API.delete(`/api/v1/employee/${id}`);
  return res.data;
};


