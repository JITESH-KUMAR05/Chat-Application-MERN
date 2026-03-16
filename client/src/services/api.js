import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true
});

export const registerUser = (data) =>
  API.post("/user-api/register", data);

export const loginUser = (data) =>
  API.post("/user-api/login", data);

export const getMessages = (id) =>
  API.get(`/message-api/messages/${id}`);

export const sendMessage = (data) =>
  API.post("/message-api/send", data);