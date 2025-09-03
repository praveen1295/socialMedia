// src/services/adminPostService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // To send cookies
});

// Get posts for approval
export const getPostsForApproval = async ({
  page = 1,
  limit = 10,
  status = "pending",
} = {}) => {
  try {
    const res = await API.get(
      `/api/v1/admin-posts/approval?page=${page}&limit=${limit}&status=${status}`
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch posts for approval", err);
    return { success: false, message: "Error fetching posts for approval" };
  }
};

// Approve a post
export const approvePost = async (postId) => {
  try {
    const res = await API.post(`/api/v1/admin-posts/${postId}/approve`);
    return res.data;
  } catch (err) {
    console.error("Failed to approve post", err);
    return { success: false, message: "Error approving post" };
  }
};

// Reject a post
export const rejectPost = async (postId, reason) => {
  try {
    const res = await API.post(`/api/v1/admin-posts/${postId}/reject`, {
      reason,
    });
    return res.data;
  } catch (err) {
    console.error("Failed to reject post", err);
    return { success: false, message: "Error rejecting post" };
  }
};

// Get post details
export const getPostDetails = async (postId) => {
  try {
    const res = await API.get(`/api/v1/admin-posts/${postId}`);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch post details", err);
    return { success: false, message: "Error fetching post details" };
  }
};

// Get all admin posts
export const getAllAdminPosts = async ({
  page = 1,
  limit = 10,
  status = "all",
} = {}) => {
  try {
    const res = await API.get(
      `/api/v1/admin-posts/all?page=${page}&limit=${limit}&status=${status}`
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch admin posts", err);
    return { success: false, message: "Error fetching admin posts" };
  }
};

// Update post (admin)
export const updateAdminPost = async (postId, updateData) => {
  try {
    const res = await API.patch(`/api/v1/admin-posts/${postId}`, updateData);
    return res.data;
  } catch (err) {
    console.error("Failed to update post", err);
    return { success: false, message: "Error updating post" };
  }
};
