import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { reactToMessage } from "../services/api";
import { useMessageStore } from "../store/useMessageStore";
import ReactionPopup from "./ReactionPopup";

import {
  MessageActions,
  EditMessageModal,
} from "./MessageFeatureComponents";

export default function MessageBubble({ message }) {

  const user = useAuthStore((state) => state.user);

  const senderId =
    message.sender?._id || message.sender;

  const receiverId =
    message.receiver?._id || message.receiver;

  const isOwnMessage =
    senderId === user?._id;

  const [
    showReactionPopup,
    setShowReactionPopup,
  ] = useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const updateMessageReaction =
    useMessageStore(
      (state) =>
        state.updateMessageReaction
    );

  const updateMessage =
    useMessageStore(
      (state) => state.updateMessage
    );

  // SEND REACTION

  const sendReaction = async (
    emoji
  ) => {

    try {

      const updatedMessage = {

        ...message,

        reactions: [
          ...(message.reactions || []).filter(
            (r) =>
              r.userId !== user._id
          ),

          {
            userId: user._id,
            emoji,
          },
        ],
      };

      updateMessageReaction(
        updatedMessage
      );

      await reactToMessage(
        message._id,
        {
          userId: user._id,
          emoji,
        }
      );

    } catch (err) {

      console.error(
        "Reaction error:",
        err
      );
    }
  };

  // EDIT SUCCESS

  const handleEditSuccess = (
    updatedMessage
  ) => {

    if (updateMessage) {

      updateMessage(updatedMessage);
    }
  };

  // THREAD REPLY

  const handleReply = () => {

    const replyText =
      prompt(
        "Enter thread reply"
      );

    if (!replyText) return;

    fetch(
      `http://localhost:4000/message-feature-api/thread-reply/${message._id}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials:
          "include",

        body: JSON.stringify({

          content:
            replyText,

          ...(message.channel

            ? {
                channel:
                  message.channel,
              }

            : {
                receiver:
                  isOwnMessage
                    ? receiverId
                    : senderId,
              }),
        }),
      }
    );
  };

  return (

    <div
      className={`flex w-full ${
        isOwnMessage
          ? "justify-end"
          : "justify-start"
      } mb-3`}
    >

      {/* OTHER PERSON MESSAGE */}

      {!isOwnMessage && (

        <div className="flex items-center gap-2">

          {/* MESSAGE */}

          <div
            className="relative max-w-[75%] p-3 rounded-lg bg-slate-800 rounded-bl-none"
          >

            <p className="text-xs text-blue-400 font-semibold mb-1">

              {message.sender?.name}

            </p>

            {/* REPLY REFERENCE */}

            {message.parentMessage && (

              <div className="bg-black/20 p-2 rounded mb-2 border-l-4 border-blue-400">

                <p className="text-xs text-gray-300">

                  Replying to:

                </p>

                <p className="text-sm text-white truncate">

                  {message.parentMessage?.content}

                </p>

              </div>
            )}

            {/* MESSAGE TEXT */}

            <p className="text-white text-sm break-words">

              {message.content}

            </p>

          </div>

          {/* ACTIONS */}

          <MessageActions
            isOwnMessage={false}
            onReply={handleReply}
            onReact={sendReaction}
          />

        </div>
      )}

      {/* MY MESSAGE */}

      {isOwnMessage && (

        <div className="flex items-center gap-2">

          {/* ACTIONS */}

          <MessageActions
            isOwnMessage={true}
            onEdit={() =>
              setShowEditModal(true)
            }
            onReply={handleReply}
            onReact={sendReaction}
          />

          {/* MESSAGE */}

          <div
            className="relative max-w-[75%] p-3 rounded-lg bg-blue-600 rounded-br-none"
          >

            {/* REPLY REFERENCE */}

            {message.parentMessage && (

              <div className="bg-black/20 p-2 rounded mb-2 border-l-4 border-blue-400">

                <p className="text-xs text-gray-300">

                  Replying to:

                </p>

                <p className="text-sm text-white truncate">

                  {message.parentMessage?.content}

                </p>

              </div>
            )}

            {/* MESSAGE TEXT */}

            <p className="text-white text-sm break-words">

              {message.content}

            </p>

            {/* EDITED */}

            {message.isEdited && (

              <p className="text-[10px] text-gray-300 mt-1">

                edited ·{" "}

                {new Date(
                  message.editedAt
                ).toLocaleTimeString()}

              </p>
            )}

            {/* REACTION DISPLAY */}

            {message.reactions &&
              message.reactions.length > 0 && (

                <div
                  onClick={() =>
                    setShowReactionPopup(
                      true
                    )
                  }
                  className="absolute -bottom-3 right-2 bg-gray-700 text-white px-2 py-[2px] rounded-full text-xs flex items-center gap-1 shadow cursor-pointer"
                >

                  <span>

                    {
                      message.reactions[0]
                        .emoji
                    }

                  </span>

                  <span>

                    {
                      message.reactions
                        .length
                    }

                  </span>

                </div>
              )}

          </div>

        </div>
      )}

      {/* REACTION POPUP */}

      {showReactionPopup && (

        <ReactionPopup
          reactions={
            message.reactions
          }
          messageId={
            message._id
          }
          onClose={() =>
            setShowReactionPopup(
              false
            )
          }
        />
      )}

      {/* EDIT MODAL */}

      {showEditModal && (

        <EditMessageModal
          message={message}
          onClose={() =>
            setShowEditModal(false)
          }
          onSuccess={
            handleEditSuccess
          }
        />
      )}

    </div>
  );
}