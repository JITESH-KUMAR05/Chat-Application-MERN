import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // needed for httpOnly cookies
});

export const registerUser = (data) =>
  API.post("/user-api/register", data);

export const loginUser = (data) =>
  API.post("/user-api/login", data);

export const getMessages = (id) =>
  API.get(`/message-api/messages/${id}`);

export const sendMessage = (data) =>
  API.post("/message-api/send", data);

export const getAllUsers = () => API.get("/user-api/users");
