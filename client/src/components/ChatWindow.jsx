import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages }) {
  return (
    <div className="flex-1 bg-[#f9fafb] p-4 overflow-y-auto">

      {messages.map((msg) => (
        <MessageBubble key={msg._id} message={msg} />
      ))}

    </div>
  );
}