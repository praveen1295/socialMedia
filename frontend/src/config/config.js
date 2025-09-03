// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const config = {
  API_BASE_URL,
  API_ENDPOINTS: {
    USER: {
      LOGIN: `${API_BASE_URL}/api/v1/user/login`,
      REGISTER: `${API_BASE_URL}/api/v1/user/register`,
      LOGOUT: `${API_BASE_URL}/api/v1/user/logout`,
      PROFILE_EDIT: (userId) => `${API_BASE_URL}/api/v1/user/profile/edit/${userId}`,
      SUGGESTED: `${API_BASE_URL}/api/v1/user/suggested`,
      GET_PROFILE: (userId) => `${API_BASE_URL}/api/v1/user/${userId}/profile`,
      FOLLOW_OR_UNFOLLOW: (userId) =>
        `${API_BASE_URL}/api/v1/user/followorunfollow/${userId}`,
      FOLLOWERS: (userId) => `${API_BASE_URL}/api/v1/user/${userId}/followers`,
      FOLLOWING: (userId) => `${API_BASE_URL}/api/v1/user/${userId}/following`,
    },
    POST: {
      ALL: `${API_BASE_URL}/api/v1/post/all`,
      USER_POSTS: `${API_BASE_URL}/api/v1/post/userpost/all`,
      ADD: `${API_BASE_URL}/api/v1/post/addpost`,
      DELETE: (postId) => `${API_BASE_URL}/api/v1/post/delete/${postId}`,
      LIKE: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/like`,
      DISLIKE: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/dislike`,
      COMMENT: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/comment`,
      BOOKMARK: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/bookmark`,
      VIEW: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/view`,
      VIEWS: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/views`,
      LIKES: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/likes`,
      COMMENTS: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/comment/all`,
      EDIT_COMMENT: (commentId) =>
        `${API_BASE_URL}/api/v1/post/comment/${commentId}/edit`,
      DELETE_COMMENT: (commentId) =>
        `${API_BASE_URL}/api/v1/post/comment/${commentId}/delete`,
    },
    MESSAGE: {
      SEND: (receiverId) => `${API_BASE_URL}/api/v1/message/send/${receiverId}`,
      ALL: (userId) => `${API_BASE_URL}/api/v1/message/all/${userId}`,
    },
    ADMIN: {
      LOGIN: `${API_BASE_URL}/api/v1/admin/login`,
      LOGOUT: `${API_BASE_URL}/api/v1/admin/logout`,
      PROFILE: `${API_BASE_URL}/api/v1/admin/profile`,
    },
    EMPLOYEE: {
      LOGIN: `${API_BASE_URL}/api/v1/employee/login`,
      CREATE: `${API_BASE_URL}/api/v1/employee`,
      ALL: `${API_BASE_URL}/api/v1/employee`,
      BY_ID: (id) => `${API_BASE_URL}/api/v1/employee/${id}`,
      UPDATE: (id) => `${API_BASE_URL}/api/v1/employee/${id}`,
      DELETE: (id) => `${API_BASE_URL}/api/v1/employee/${id}`,
    },
    REVENUE_SHARING: {
      CREATE: `${API_BASE_URL}/api/v1/revenue-sharing`,
      GET: `${API_BASE_URL}/api/v1/revenue-sharing`,
      UPDATE: `${API_BASE_URL}/api/v1/revenue-sharing`,
      HISTORY: `${API_BASE_URL}/api/v1/revenue-sharing/history`,
    },
    ADMIN_POSTS: {
      ALL: `${API_BASE_URL}/api/v1/admin-posts`,
      APPROVE: (id) => `${API_BASE_URL}/api/v1/admin-posts/${id}/approve`,
      REJECT: (id) => `${API_BASE_URL}/api/v1/admin-posts/${id}/reject`,
      DETAILS: (id) => `${API_BASE_URL}/api/v1/admin-posts/${id}`,
    },
    ACCOUNT_DASHBOARD: {
      ALL: `${API_BASE_URL}/api/v1/account-dashboard`,
      PAY: (id) => `${API_BASE_URL}/api/v1/account-dashboard/${id}/pay`,
      USER_HISTORY: (userId) =>
        `${API_BASE_URL}/api/v1/account-dashboard/user/${userId}`,
    },
  },
  // Media configuration
  MEDIA: {
    MAX_FILES: 10,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_CAPTION_LENGTH: 280,
    SUPPORTED_IMAGE_TYPES: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    SUPPORTED_VIDEO_TYPES: [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
    ],
    MAX_VIDEO_DURATION: 60, // 1 minute in seconds
  },
};
