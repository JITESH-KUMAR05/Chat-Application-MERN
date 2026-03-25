import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
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
