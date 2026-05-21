import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

// ==========================================
// USER & AUTHENTICATION
// ==========================================
export const registerUser = (data) => api.post("/user-api/register", data);
export const loginUser = (data) => api.post("/user-api/login", data);
export const getAllUsers = () => api.get("/user-api/user");
export const getSidebarUsers = () => api.get("/message-api/sidebar-users");

// ==========================================
// DIRECT MESSAGES
// ==========================================
export const getMessages = (id) => api.get(`/message-api/messages/${id}`);

export const sendMessage = (data) =>
  api.post("/message-api/send", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// ==========================================
// CHANNELS
// ==========================================
export const getMyChannels = () => api.get("/channel-api/my-channels");
export const createChannel = (data) => api.post("/channel-api/create", data);
export const getChannelMessages = (id) => api.get(`/message-api/channel-messages/${id}`);

// ==========================================
// MESSAGE FEATURES (REACTIONS, THREADS, READ RECEIPTS)
// ==========================================
export const reactToMessage = (messageId, data) =>
  api.post(`/message-api/messages/${messageId}/react`, data);

export const markMessagesAsSeenApi = (senderId) =>
  api.post("/message-feature-api/mark-seen", { senderId });

export const getThreadReplies = (parentMessageId) =>
  api.get(`/message-feature-api/thread-replies/${parentMessageId}`);

export const sendThreadReply = (parentMessageId, data) =>
  api.post(`/message-feature-api/thread-reply/${parentMessageId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
// ================= ANALYTICS / AI SUMMARY =================
export const getAnalyticsSummary = (userId) =>
  api.get(`/analytics/summary/${userId}`);

export const getAnalyticsStats = () =>
  api.get('/analytics/stats');
export default api;