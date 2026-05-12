import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

const socket = io(SOCKET_URL, {
  withCredentials: true
});
// Add this right below your socket initialization
socket.on("connect", () => {
  console.log("🟢 FRONTEND: Successfully connected to Socket server! My ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 FRONTEND: Socket Connection Error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.warn("🟡 FRONTEND: Socket Disconnected:", reason);
});

export default socket;
