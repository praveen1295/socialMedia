// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const config = {
    API_BASE_URL,
    API_ENDPOINTS: {
        USER: {
            LOGIN: `${API_BASE_URL}/api/v1/user/login`,
            REGISTER: `${API_BASE_URL}/api/v1/user/register`,
            LOGOUT: `${API_BASE_URL}/api/v1/user/logout`,
            PROFILE_EDIT: `${API_BASE_URL}/api/v1/user/profile/edit`,
            SUGGESTED: `${API_BASE_URL}/api/v1/user/suggested`,
            GET_PROFILE: (userId) => `${API_BASE_URL}/api/v1/user/${userId}/profile`,
        },
        POST: {
            ALL: `${API_BASE_URL}/api/v1/post/all`,
            ADD: `${API_BASE_URL}/api/v1/post/addpost`,
            DELETE: (postId) => `${API_BASE_URL}/api/v1/post/delete/${postId}`,
            LIKE: (postId, action) => `${API_BASE_URL}/api/v1/post/${postId}/${action}`,
            COMMENT: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/comment`,
            BOOKMARK: (postId) => `${API_BASE_URL}/api/v1/post/${postId}/bookmark`,
        },
        MESSAGE: {
            SEND: (receiverId) => `${API_BASE_URL}/api/v1/message/send/${receiverId}`,
            ALL: (userId) => `${API_BASE_URL}/api/v1/message/all/${userId}`,
        }
    },
    // Media configuration
    MEDIA: {
        MAX_FILES: 10,
        MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
        MAX_CAPTION_LENGTH: 280,
        SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'],
        MAX_VIDEO_DURATION: 60 // 1 minute in seconds
    }
};
