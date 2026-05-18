import { useState } from "react";

export default function MessageActions({
  isOwnMessage,
  onEdit,
  onReply,
}) {

  const [showActions, setShowActions] =
    useState(false);

  return (
    <div
      className="absolute top-0 right-0"
      onMouseEnter={() =>
        setShowActions(true)
      }
      onMouseLeave={() =>
        setShowActions(false)
      }
    >
      {showActions && (
        <div className="bg-slate-700 text-white rounded-lg shadow-lg p-2 flex gap-3 text-xs">

          {isOwnMessage && (
            <button
              onClick={onEdit}
              className="hover:text-blue-400"
            >
              Edit
            </button>
          )}

          <button
            onClick={onReply}
            className="hover:text-green-400"
          >
            Reply
          </button>

        </div>
      )}
    </div>
  );
}