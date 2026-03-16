import { useState } from "react";
import { sendMessage } from "../services/api";

export default function MessageInput({ receiver }) {

  const [text,setText] = useState("");

  const handleSend = async () => {
    if(!text) return;

    await sendMessage({
      content:text,
      receiver
    });

    setText("");
  };

  return (
    <div className="flex p-4 border-t">

      <input
        value={text}
        onChange={(e)=>setText(e.target.value)}
        className="flex-1 border p-2 rounded"
        placeholder="Type message..."
      />

      <button
        onClick={handleSend}
        className="ml-2 bg-blue-500 text-white px-4 rounded"
      >
        Send
      </button>

    </div>
  );
}