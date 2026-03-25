import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom"; // Standardized to react-router-dom
import { sendMessage,getMessages } from "../services/api";

// IMPORTANT: Make sure you import the socket instance you created in Step 2!
// Adjust this path based on where you put your socket variable.
import { socket } from "../services/socket"; 


export default function ChatArea() {
  const loc = useLocation();
  
  // Added 'reset' to clear the input box after hitting send
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  // 1. State to hold all the real-time messages
  const [messages, setMessages] = useState([]);

  // 2. The Real-Time Socket Listener
  useEffect(() => {
    
    // --- 1. FETCH CHAT HISTORY ---
    const fetchHistory = async () => {
      try {
        // Call the backend route you just showed me!
        const res = await getMessages(loc.state._id);
        
        // Since your backend sends { message: "...", payload: messages }
        setMessages(res.data.payload); 
        
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    
    // Run the fetch function immediately
    fetchHistory();

    // --- 2. LISTEN FOR REAL-TIME MESSAGES ---
    const handleNewMessage = (newMessage) => {
      // Add the new message to the bottom of the list
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("message Received", handleNewMessage);

    // Cleanup when you click a different user or leave the page
    return () => {
      socket.off("message Received", handleNewMessage);
    };
    
  }, [loc.state._id])

  const submit = async (obj) => {
    try {
      let data = {
        content: obj.content,
        receiver: loc.state._id,
      };
      
      // Send to your backend API
      await sendMessage(data);
      
      // Clear the text box so the user can type the next message
      reset(); 
      
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      
      {/* HEADER */}
      <div className="border-b pb-4 mb-4">
        <p className="text-xl font-semibold">Chat with {loc.state?.name}</p>
        <p className="text-sm text-gray-500">{loc.state?.email}</p>
      </div>

      {/* MESSAGES DISPLAY AREA */}
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white rounded shadow-inner border border-gray-200">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No messages yet. Say hi!</p>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className="mb-2 px-4 py-2 bg-blue-100 rounded-lg w-fit max-w-[70%]"
            >
              {msg.content}
            </div>
          ))
        )}
      </div>

      {/* MESSAGE INPUT FORM */}
      <form onSubmit={handleSubmit(submit)} className="flex gap-2">
        <input
          {...register("content", { required: true })}
          type="text"
          autoComplete="off"
          placeholder="Enter your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
      
    </div>
  );
}