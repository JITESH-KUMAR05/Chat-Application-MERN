import { useEffect } from "react";
import { useMessageStore } from "../store/useMessageStore";
import MessageBubble from "./MessageBubble";
import { socket } from "../services/socket";

export default function ChatWindow() {
  const messages = useMessageStore((state) => state.messages);
  // const messages = useMessageStore((state) => state.messages);
  // const setMessages = useMessageStore((state) => state.setMessages);
  const updateMessageReaction = useMessageStore(
    (state) => state.updateMessageReaction
  );

  useEffect(() => {
    socket.on("reactionUpdated", (updatedMessage) => {
      console.log("reaction received", updatedMessage); // debug
      updateMessageReaction(updatedMessage);
    });

    return () => socket.off("reactionUpdated");
  }, [updateMessageReaction]);

  return (
    <div className="flex-1 bg-slate-900 p-4 overflow-y-scroll">
      {messages.map((msg) => (
        <MessageBubble key={msg._id} message={msg} />
      ))}
    </div>
  );
}
