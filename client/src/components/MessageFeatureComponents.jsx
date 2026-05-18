import { useEffect, useState } from "react";

import {
  editMessageApi,
  getThreadRepliesApi,
} from "../services/messageFeaturesApi";

/* ======================================================
   MESSAGE ACTIONS
====================================================== */

export function MessageActions({
  isOwnMessage,
  onEdit,
  onReply,
  onReact,
}) {

  const [showMenu, setShowMenu] =
    useState(false);

  const emojis = [
    "👍",
    "❤️",
    "😂",
    "😮",
    "😢",
  ];

  return (

    <div className="relative flex items-center">

      {/* ARROW BUTTON */}

      <button
        onClick={() =>
          setShowMenu(!showMenu)
        }
        className="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-gray-800"
      >
        ➜
      </button>

      {/* MENU */}

      {showMenu && (

        <div className="absolute top-8 z-50 bg-slate-900 border border-gray-700 rounded-lg shadow-lg p-2 min-w-[160px]">

          {/* EMOJIS */}

          <div className="flex gap-2 border-b border-gray-700 pb-2 mb-2">

            {emojis.map((emoji) => (

              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setShowMenu(false);
                }}
                className="hover:scale-125 transition"
              >
                {emoji}
              </button>
            ))}

          </div>

          {/* EDIT */}

          {isOwnMessage && (

            <button
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
              className="block w-full text-left text-white text-sm hover:text-blue-400 mb-2"
            >
              ✏️ Edit Message
            </button>
          )}

          {/* THREAD REPLY */}

          <button
            onClick={() => {
              onReply();
              setShowMenu(false);
            }}
            className="block w-full text-left text-white text-sm hover:text-green-400"
          >
            💬 Thread Reply
          </button>

        </div>
      )}
    </div>
  );
}

/* ======================================================
   THREAD REPLIES
====================================================== */

export function ThreadReplies({
  parentMessageId,
}) {

  const [replies, setReplies] =
    useState([]);

  useEffect(() => {

    fetchReplies();

  }, [parentMessageId]);

  const fetchReplies = async () => {

    try {

      const res =
        await getThreadRepliesApi(
          parentMessageId
        );

      setReplies(
        res.data.payload || []
      );

    } catch (err) {

      console.log(err);
    }
  };

  return (

    <div className="ml-4 mt-2 flex flex-col gap-2">

      {replies.map((reply) => (

        <div
          key={reply._id}
          className="bg-black/30 p-2 rounded-lg"
        >

          <p className="text-xs text-blue-400">

            {reply.sender?.firstName}

          </p>

          <p className="text-sm text-white">

            {reply.content}

          </p>

          {reply.isEdited && (

            <p className="text-[10px] text-gray-400 mt-1">

              edited ·{" "}

              {new Date(
                reply.editedAt
              ).toLocaleTimeString()}

            </p>
          )}

        </div>
      ))}

    </div>
  );
}

/* ======================================================
   EDIT MESSAGE MODAL
====================================================== */

export function EditMessageModal({
  message,
  onClose,
  onSuccess,
}) {

  const [content, setContent] =
    useState(message.content);

  const handleSave = async () => {

    try {

      const res =
        await editMessageApi(
          message._id,
          { content }
        );

      onSuccess(res.data.payload);

      onClose();

    } catch (err) {

      console.log(err);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-slate-900 p-5 rounded-xl w-[400px]">

        <h2 className="text-white text-lg mb-4">

          Edit Message

        </h2>

        <textarea
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          className="w-full p-3 rounded-lg bg-slate-800 text-white"
          rows={4}
        />

        <div className="flex justify-end gap-3 mt-4">

          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded-lg text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 px-4 py-2 rounded-lg text-white"
          >
            Save
          </button>

        </div>

      </div>
    </div>
  );
}