import { useEffect, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { getThreadRepliesApi } from "../services/messageFeaturesApi";

/* ======================================================
   MESSAGE ACTIONS
   - Arrow is always visible (not hidden behind group-hover)
   - For own messages: Edit + Thread Reply + Emoji
   - For other messages: Thread Reply + Emoji
====================================================== */

export function MessageActions({ isOwnMessage, onEdit, message, onReact }) {
  const [showMenu, setShowMenu] = useState(false);

  const setReplyingToMessage = useMessageStore(
    (state) => state.setReplyingToMessage
  );

  const emojis = ["👍", "❤️", "😂", "😮", "😢"];

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (!e.target.closest("[data-msg-actions]")) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  return (
    <div className="relative flex items-center" data-msg-actions>

      {/* ARROW BUTTON — always visible, no group-hover hiding */}
      <button
        onClick={() => setShowMenu((v) => !v)}
        className="
          bg-slate-700 hover:bg-slate-600
          text-white
          w-7 h-7
          rounded-full
          flex items-center justify-center
          text-sm
          transition-colors
          flex-shrink-0
        "
        title="Message actions"
      >
        ➜
      </button>

      {/* DROPDOWN MENU */}
      {showMenu && (
        <div
          className={`
            absolute top-9 z-[100]
            bg-slate-900 border border-slate-700
            rounded-xl shadow-2xl
            p-3 min-w-[180px]
            ${isOwnMessage ? "right-0" : "left-0"}
          `}
        >

          {/* EMOJI ROW */}
          <div className="flex gap-2 border-b border-slate-700 pb-2 mb-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setShowMenu(false);
                }}
                className="hover:scale-125 transition text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* EDIT — only for own messages */}
          {isOwnMessage && (
            <button
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
              className="block w-full text-left text-white text-sm hover:text-blue-400 mb-2 py-1"
            >
              ✏️ Edit Message
            </button>
          )}

          {/* THREAD REPLY — for everyone */}
          <button
            onClick={() => {
              setReplyingToMessage(message);
              setShowMenu(false);
            }}
            className="block w-full text-left text-white text-sm hover:text-green-400 py-1"
          >
            💬 Thread Reply
          </button>

        </div>
      )}
    </div>
  );
}


/* ======================================================
   THREAD REPLIES — shows existing replies under a message
   Displays the parent context (image/text) + reply content
====================================================== */

export function ThreadReplies({ parentMessage, parentMessageId }) {
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    fetchReplies();
  }, [parentMessageId]);

  const fetchReplies = async () => {
    try {
      const res = await getThreadRepliesApi(parentMessageId);
      setReplies(res.data.payload || []);
    } catch (err) {
      console.log(err);
    }
  };

  if (replies.length === 0) return null;

  return (
    <div className="mt-2 border-l-2 border-slate-600 pl-3 flex flex-col gap-2">

      {/* PARENT PREVIEW — what message is being replied to */}
      {parentMessage && (
        <div className="bg-black/40 rounded-lg p-2 mb-1 opacity-80">
          <p className="text-[10px] text-slate-400 mb-1">
            ↩ Replying to {parentMessage.sender?.firstName || "User"}
          </p>

          {/* Show image thumbnail if parent was an image */}
          {parentMessage.fileType?.startsWith("image") && (
            <img
              src={parentMessage.fileUrl}
              alt="original"
              className="h-12 w-16 object-cover rounded-md"
            />
          )}

          {/* Show text snippet if parent was text */}
          {parentMessage.content && (
            <p className="text-xs text-slate-300 truncate">
              {parentMessage.content}
            </p>
          )}

          {/* Show file name for other files */}
          {parentMessage.fileUrl &&
            !parentMessage.fileType?.startsWith("image") && (
              <p className="text-xs text-slate-300 truncate">
                📎 {parentMessage.fileName}
              </p>
            )}
        </div>
      )}

      {/* REPLY BUBBLES */}
      {replies.map((reply) => (
        <div key={reply._id} className="bg-black/30 p-2 rounded-lg">
          <p className="text-[10px] text-blue-400 mb-0.5 font-semibold">
            {reply.sender?.firstName} {reply.sender?.lastName || ""}
          </p>

          {/* Reply image */}
          {reply.fileType?.startsWith("image") && (
            <img
              src={reply.fileUrl}
              alt="reply img"
              className="rounded-lg max-h-32 mb-1 object-cover"
            />
          )}

          <p className="text-sm text-white">{reply.content}</p>

          <p className="text-[10px] text-slate-500 mt-1">
            {new Date(reply.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {reply.isEdited && " · edited"}
          </p>
        </div>
      ))}
    </div>
  );
}


/* ======================================================
   MESSAGE REACTIONS
====================================================== */

export function MessageReactions({ reactions }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {reactions.map((reaction, index) => (
        <div
          key={index}
          className="
            bg-black/40 px-2 py-0.5 rounded-full
            text-xs flex items-center gap-1
            border border-slate-700/50
          "
        >
          <span>{reaction.emoji}</span>
          <span className="text-slate-300">{reaction.users?.length || 1}</span>
        </div>
      ))}
    </div>
  );
}
