import { useState } from "react";
import API from "../services/api";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({
  senderId,
  receiverId,
  refreshMessages,
}) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Add emoji to text
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // Send message function
  const handleSend = async () => {
    // Prevent empty message
    if (!text && !file) return;

    try {
      setLoading(true);

      // Create form data
      const formData = new FormData();

      formData.append("senderId", senderId);
      formData.append("receiverId", receiverId);
      formData.append("content", text);

      // Append selected file
      if (file) {
        formData.append("file", file);
      }

      // API call
      await API.post("/message-api/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Clear fields
      setText("");
      setFile(null);

      // Refresh messages
      refreshMessages();

      // Close emoji picker
      setShowEmojiPicker(false);

    } catch (error) {
      console.log("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative border-t bg-white p-3">
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-3 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <div className="flex items-center gap-3">

        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-2xl text-purple-600 hover:text-purple-800"
        >
          <FiSmile />
        </button>

        {/* File Upload Button */}
<label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300">
  <FiPaperclip className="text-black text-xl" />

  <input
    type="file"
    className="hidden"
    onChange={handleFileChange}
  />
</label>

        {/* Selected File Name */}
        {file && (
          <div className="text-sm text-blue-600 truncate max-w-[120px]">
            {file.name}
          </div>
        )}

        {/* Message Input */}
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 outline-none"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;