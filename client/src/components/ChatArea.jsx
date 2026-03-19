import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { sendMessage, getMessages, getChannelMessages } from "../services/api";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageBubble from "./MessageBubble"; // Important for showing UI
import EmojiPicker from "emoji-picker-react";

export default function ChatArea(){
    const { register, handleSubmit, watch, setValue, reset } = useForm();
    const loc = useLocation();
    const [showPicker, setShowPicker] = useState(false);
    // const messageValue = watch("emoji") || "";
    const messageValue = watch("message") || "";
    
    // We already dispatched the selected user, let's grab the active chat partner
    const selectedUser = loc.state || null;  
    
    // Grab messages from the Zustand store
    const messages = useMessageStore(state => state.messages);
    const setMessages = useMessageStore(state => state.setMessages);
    const addMessage = useMessageStore(state => state.addMessage);
    const currentUser = useAuthStore(state => state.user);

    // Fetch conversation when the exact chat changes
    useEffect(() => {
        if (!selectedUser) return;

        const loadChatHistory = async () => {
            try {
                let res;
                if (selectedUser.isChannel) {
                    res = await getChannelMessages(selectedUser._id);
                } else {
                     res = await getMessages(selectedUser._id);
                }
                
                // Based on your route: res.data.payload is the list of messages
                setMessages(res.data.payload);
            } catch (err) {
                console.error("Error loading chat:", err);
            }
        };

        loadChatHistory();
    }, [selectedUser, setMessages]);

    const sendMessageHandler = async (data) => {
        try {
            const reqBody = {
                content: data.message,
            };
            
            if (selectedUser.isChannel) {
                reqBody.channel = selectedUser._id;
            } else {
                reqBody.receiver = selectedUser._id;
            }
            
            // Your backend send route
            const res = await sendMessage(reqBody);
            
            // Push the newly sent message immediately into Zustand store
            // We assume res.data.payload holds the saved message object
            if (res.data && res.data.payload) {
                addMessage(res.data.payload);
            }

            reset(); // Clear input field
        } catch(err) {
            console.error("Error sending message:", err);
        }
    }

    if (!selectedUser) {
        return (
            <div className="flex-1 bg-slate-100 flex items-center justify-center">
                 <p className="text-gray-500">Please select a user to start chatting</p>
            </div>
        );
    }

    return(
    <div className="flex-1 flex flex-col bg-slate-50 h-full">

        {/* CHAT HEADER */}
        <div className="bg-white px-6 py-4 shadow-sm border-b border-gray-200">
            {selectedUser.isChannel ? (
                <>
                   <h2 className="text-xl font-semibold text-gray-800"># {selectedUser.name}</h2>
                   <p className="text-sm text-gray-500">{selectedUser.members?.length || 0} members</p>
                </>
            ) : (
                <>
                   <h2 className="text-xl font-semibold text-gray-800">{selectedUser.firstName} {selectedUser.lastName || ""}</h2>
                   <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </>
            )}
        </div>

        {/* MESSAGES LIST */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900 flex flex-col gap-2">
            {messages && messages.length > 0 ? (
                messages.map((msg) => (
                    <MessageBubble key={msg._id} message={msg} currentUser={currentUser} />
                ))
            ) : (
                <div className="text-center text-gray-400 mt-10">No messages yet. Say hi!</div>
            )}
        </div>

        {/* MESSAGE INPUT */}
        <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit(sendMessageHandler)} className="flex items-center gap-3">
                <div className="relative">
                    <button type="button" onClick={() => setShowPicker(!showPicker)}>
                        ➕
                    </button>

                    {showPicker && (
                        <div className="absolute bottom-12 z-50">
                            <EmojiPicker onEmojiClick={(emoji) => {
                                // setValue("emoji", messageValue + emoji.emoji);
                                setValue("message", messageValue + emoji.emoji);
                            }} />
                        </div>
                    )}
                </div>
                <input 
                    {...register("message", { required: true })} 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer">
                    Send
                </button>
            </form>
        </div>

    </div>
    )
}
