import { useAuthStore } from "../store/useAuthStore"

export default function MessageBubble({ message }) {

    const user = useAuthStore((state)=>state.user);

    const senderId = message.sender?._id || message.sender;

    const isOwnMessage = senderId === user?._id;


  return (
    <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} mb-2`}>
      <div 
        className={`max-w-[75%] p-3 rounded-lg ${
          isOwnMessage 
            ? "bg-blue-600 rounded-br-none" // Your messages: Blue on the right
            : "bg-slate-800 rounded-bl-none" // Others' messages: Dark gray on the left
        }`}
      >
        {/* Only show the sender's name if it's not the current user's message */}
        {!isOwnMessage && (
          <p className="text-xs text-blue-400 font-semibold mb-1">
            {message.sender?.name}
          </p>
        )}
        <p className="text-white text-sm break-words">{message.content}</p>
      </div>
    </div>
  );
}
