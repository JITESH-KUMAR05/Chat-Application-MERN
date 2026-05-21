import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { reactToMessage } from "../services/api";
import { useMessageStore } from "../store/useMessageStore";
import ReactionPopup from "./ReactionPopup";
import { MessageActions, EditMessageModal } from "./MessageFeatureComponents";
import { FaCheckDouble, FaFilePdf } from "react-icons/fa";

const RichTextRenderer = ({ text }) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const getYouTubeId = (url) => {
    const match = url.match(
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
    );
    return match && match[2].length === 11 ? match[2] : null;
  };
  const urls = text.match(urlRegex) || [];
  const ytUrl = urls.find((url) => getYouTubeId(url));
  const ytId = ytUrl ? getYouTubeId(ytUrl) : null;
  const formattedText = text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-300 underline hover:text-sky-200 transition-colors break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm break-words whitespace-pre-wrap">
        {formattedText}
      </div>
      {ytId && (
        <div className="mt-1 rounded-xl overflow-hidden shadow-md w-full max-w-[320px] bg-black border border-slate-700/50">
          <iframe
            width="100%"
            height="180"
            src={`https://www.youtube.com/embed/${ytId}`}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const user = useAuthStore((state) => state.user);
  const senderId = message.sender?._id || message.sender;
  const isOwnMessage = senderId === user?._id;
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const updateMessageReaction = useMessageStore(
    (state) => state.updateMessageReaction,
  );
  const updateMessage = useMessageStore((state) => state.updateMessage);

  const sendReaction = async (emoji) => {
    try {
      const updatedMessage = {
        ...message,
        reactions: [
          ...(message.reactions || []).filter((r) => r.userId !== user._id),
          { userId: user._id, emoji },
        ],
      };
      updateMessageReaction(updatedMessage);
      await reactToMessage(message._id, { userId: user._id, emoji });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSuccess = (updatedMessage) => {
    if (updateMessage) updateMessage(updatedMessage);
  };

  return (
    <div
      className={`group flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isOwnMessage && (
        <div className="flex items-center gap-2 relative max-w-[85%]">
          <div className="relative p-3 rounded-2xl bg-[#1e293b] text-slate-200 rounded-bl-none shadow-md border border-slate-700/50">
            <p className="text-[11px] text-blue-400 font-bold mb-1.5 uppercase tracking-wide">
              {message.sender?.firstName || message.sender?.name || "User"}
            </p>
            {message.parentMessage && (
              <div className="bg-black/30 p-2 rounded mb-2 border-l-4 border-blue-400">
                <p className="text-xs text-slate-400 font-medium">
                  Replying to{" "}
                  {message.parentMessage.sender?.name ||
                    message.parentMessage.sender?.firstName ||
                    "User"}
                </p>
                <p className="text-sm text-slate-200 truncate">
                  {message.parentMessage?.content || "Attachment"}
                </p>
              </div>
            )}
            {message?.fileType?.startsWith("image") && (
              <img
                src={message.fileUrl}
                alt="Upload"
                className="rounded-xl mb-2 max-w-full h-auto max-h-[250px] object-cover"
              />
            )}
            {message?.fileType?.includes("pdf") && (
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex gap-3 items-center bg-black/20 p-3 rounded-xl mb-2 hover:bg-black/40 transition"
              >
                <FaFilePdf className="text-red-400 text-3xl" />
                <div className="overflow-hidden">
                  <p className="text-sm text-white truncate w-32 md:w-48">
                    {message.fileName || "Document.pdf"}
                  </p>
                  <p className="text-xs text-slate-400">PDF File</p>
                </div>
              </a>
            )}
            <RichTextRenderer text={message.content} />
            <div className="flex justify-end items-center gap-1 text-[10px] text-slate-400 mt-1">
              {message.isEdited && <span>edited ·</span>}
              <span>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {message.reactions && message.reactions.length > 0 && (
              <div
                onClick={() => setShowReactionPopup(true)}
                className="absolute -bottom-3 right-2 bg-slate-700 text-white px-2 py-[2px] rounded-full text-xs flex items-center gap-1 shadow-md cursor-pointer hover:bg-slate-600"
              >
                <span>{message.reactions[0].emoji}</span>
                {message.reactions.length > 1 && (
                  <span className="font-bold">{message.reactions.length}</span>
                )}
              </div>
            )}
          </div>
          <MessageActions
            isOwnMessage={false}
            onReact={sendReaction}
            message={message}
          />
        </div>
      )}

      {isOwnMessage && (
        <div className="flex items-center gap-2 relative max-w-[85%] flex-row-reverse">
          <div className="relative p-3 rounded-2xl bg-blue-600 text-white rounded-br-none shadow-md">
            <p className="text-[11px] text-blue-200 font-bold mb-1.5 text-right uppercase tracking-wide">
              You
            </p>
            {message.parentMessage && (
              <div className="bg-black/20 p-2 rounded mb-2 border-l-4 border-blue-300">
                <p className="text-xs text-blue-100 font-medium">
                  Replying to{" "}
                  {message.parentMessage.sender?.name ||
                    message.parentMessage.sender?.firstName ||
                    "User"}
                </p>
                <p className="text-sm text-white truncate">
                  {message.parentMessage?.content || "Attachment"}
                </p>
              </div>
            )}
            {message?.fileType?.startsWith("image") && (
              <img
                src={message.fileUrl}
                alt="Upload"
                className="rounded-xl mb-2 max-w-full h-auto max-h-[250px] object-cover"
              />
            )}
            {message?.fileType?.includes("pdf") && (
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex gap-3 items-center bg-black/20 p-3 rounded-xl mb-2 hover:bg-black/30 transition"
              >
                <FaFilePdf className="text-red-200 text-3xl" />
                <div className="overflow-hidden">
                  <p className="text-sm text-white truncate w-32 md:w-48">
                    {message.fileName || "Document.pdf"}
                  </p>
                  <p className="text-xs text-blue-200">PDF File</p>
                </div>
              </a>
            )}
            <RichTextRenderer text={message.content} />
            <div className="flex justify-end items-center gap-1 text-[10px] text-blue-200 mt-1">
              {message.isEdited && <span>edited ·</span>}
              <span>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <FaCheckDouble
                className={`ml-1 text-[10px] ${message?.status === "seen" ? "text-blue-400" : "text-blue-300/60"}`}
              />
            </div>
            {message.reactions && message.reactions.length > 0 && (
              <div
                onClick={() => setShowReactionPopup(true)}
                className="absolute -bottom-3 left-2 bg-slate-700 text-white px-2 py-[2px] rounded-full text-xs flex items-center gap-1 shadow-md cursor-pointer hover:bg-slate-600 border border-slate-600"
              >
                <span>{message.reactions[0].emoji}</span>
                {message.reactions.length > 1 && (
                  <span className="font-bold">{message.reactions.length}</span>
                )}
              </div>
            )}
          </div>
          <MessageActions
            isOwnMessage={true}
            onEdit={() => setShowEditModal(true)}
            onReact={sendReaction}
            message={message}
          />
        </div>
      )}

      {showReactionPopup && (
        <ReactionPopup
          reactions={message.reactions}
          messageId={message._id}
          onClose={() => setShowReactionPopup(false)}
        />
      )}
      {showEditModal && (
        <EditMessageModal
          message={message}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
