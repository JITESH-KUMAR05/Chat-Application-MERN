import { useState } from "react";

import { useMessageStore } from "../store/useMessageStore";

export default function MessageActions({
  isOwnMessage,
  onEdit,
  message, 
}) {
  const [showActions, setShowActions] = useState(false);

  const setReplyingToMessage = useMessageStore(
    (state) => state.setReplyingToMessage,
  );

  return (
    <div
      className="absolute top-0 right-0 -mt-4 mr-2" 
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showActions && (
        <div className="bg-slate-700 text-white rounded-lg shadow-lg p-2 flex gap-3 text-xs border border-slate-600">
          {isOwnMessage && (
            <button
              onClick={onEdit}
              className="hover:text-blue-400 transition-colors font-semibold"
            >
              Edit
            </button>
          )}

          <button
            onMouseDown={(e) => {
              e.preventDefault();
              console.log("SUCCESS! Message sent to store:", message);
              setReplyingToMessage(message);
            }}
            className="hover:text-green-400 transition-colors font-semibold"
          >
            Reply
          </button>
        </div>
      )}
    </div>
  );
}
