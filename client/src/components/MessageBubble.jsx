export default function MessageBubble({ message }) {
  return (
    <div className="mb-3">

      <div className="bg-white p-3 rounded shadow w-fit">
        <p>{message.content}</p>

        <span className="text-xs text-gray-500">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>

      </div>

    </div>
  );
}