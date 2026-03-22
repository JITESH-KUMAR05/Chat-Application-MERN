import { useAuthStore } from "../store/useAuthStore"
import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { reactToMessage } from "../services/api";
import { useMessageStore } from "../store/useMessageStore";

export default function MessageBubble({ message }) {

    const user = useAuthStore((state)=>state.user);

    const senderId = message.sender?._id || message.sender;

    const isOwnMessage = senderId === user?._id;
    const [showReactions, setShowReactions] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    // Quick emojis
    const quickEmojis = ["👍", "❤️", "😂", "😮", "😢"];
    // Send reaction to backend
    const updateMessageReaction = useMessageStore(
      (state) => state.updateMessageReaction
    );

    const sendReaction = async (emoji) => {
      try {
        // 🔥 1. Optimistically update UI FIRST
        const updatedMessage = {
          ...message,
          reactions: [
            ...(message.reactions || []).filter(
              (r) => r.userId !== user._id
            ),
            { userId: user._id, emoji }
          ]
        };
        console.log("Updated reaction", updatedMessage);
        updateMessageReaction(updatedMessage);
        // 🔥 2. Then call backend
        await reactToMessage(message._id, {
          userId: user._id,
          emoji,
        });
        setShowReactions(false);
        setShowPicker(false);
      } catch (err) {
        console.error("Reaction error:", err);
      }
    };

      // Count reactions
      const reactionCounts = {};
      message.reactions?.forEach((r) => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    } );
    


  return (
    <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} mb-2 relative`} onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => {
        setShowReactions(false);
        setShowPicker(false);
      } }>
      <div 
        className={`relative max-w-[75%] p-3 rounded-lg ${
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

        {/* QUICK EMOJI BAR */}
        {showReactions && (
          <div className={`absolute -top-7 bg-white rounded-full px-2 py-1 flex gap-2 shadow-lg ${
            isOwnMessage ? "right-0" : "left-0"
          }`}>
            {quickEmojis.map((e, i) => (
              <span
                key={i}
                className="cursor-pointer hover:scale-125 transition"
                onClick={() => sendReaction(e)}
              >
                {e}
              </span>
            ))}

            {/* PLUS BUTTON */}
            <span
              className="cursor-pointer"
              onClick={() => setShowPicker(!showPicker)}
            >
              ➕
            </span>
          </div>
        )}

        {/* EMOJI PICKER */}
        {showPicker && (
          <div className={`absolute bottom-12 right-0 z-50 ${
            isOwnMessage ? "right-0" : "left-0"
          }`}>
            <EmojiPicker
              onEmojiClick={(emoji) => sendReaction(emoji.emoji)}
            />
          </div>
        )}

        {/* REACTIONS DISPLAY */}
        {message.reactions && message.reactions.length > 0 && (() => {
          const totalCount = message.reactions.length;
          const firstEmoji = message.reactions[0].emoji;

          return (
            <div className="absolute -bottom-3 right-2 bg-gray-700 text-white px-2 py-[2px] rounded-full text-xs flex items-center gap-1 shadow">
              <span>{firstEmoji}</span>
              <span>{totalCount}</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
