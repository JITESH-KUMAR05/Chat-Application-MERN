import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true // needed for httpOnly cookies
});

export const registerUser = (data) =>
  api.post("/user-api/register", data);

export const loginUser = (data) =>
  api.post("/user-api/login", data);

export const getMessages = (id) =>
  api.get(`/message-api/messages/${id}`);

export const sendMessage = (data) =>
  api.post("/message-api/send", data);

export const getAllUsers = () => api.get("/user-api/user");

export const getSidebarUsers = () => api.get("/message-api/sidebar-users");

export const getMyChannels = () => api.get("/channel-api/my-channels");

export const createChannel = (data) => api.post("/channel-api/create", data);

export const getChannelMessages = (id) => api.get(`/message-api/channel-messages/${id}`);

export default api