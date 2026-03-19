import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true // needed for httpOnly cookies
});

export default api;

export const registerUser = (data) =>
  api.post("/user-api/register", data);

export const loginUser = (data) =>
  api.post("/user-api/login", data);

export const getMessages = (id) =>
  api.get(`/message-api/messages/${id}`);

export const sendMessage = (data) =>
  api.post("/message-api/send", data);

export const getAllUsers = () => api.get("/user-api/users");

export const searchUsers = (text) =>
  api.get(`/user-api/user?search=${text}`);
