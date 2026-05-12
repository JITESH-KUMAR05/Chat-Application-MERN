import { useEffect } from "react";
import socket from "../services/socket";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatArea from "../components/ChatArea";
import { Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";

export default function ChatLayout() {
  const currentUser = useAuthStore((state) => state.user);
  const receiveMessage = useMessageStore((state) => state.receiveMessage);

  useEffect(() => {
    if (currentUser) {
      // Tell backend who we are so we join our private room
      socket.emit("setup", currentUser);
      
      // Global listener for incoming real-time messages
      const handleMessageReceived = (newMessage) => {
        // Handle this in zustand so any component can handle it
        receiveMessage(newMessage);
      };

      socket.on("message Received", handleMessageReceived);

      // Cleanup
      return () => {
        socket.off("message Received", handleMessageReceived);
      };
    }
  }, [currentUser]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        
        <Outlet />
        
      </div>
    </div>
  );
}

