import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router";
import { useForm } from "react-hook-form";

import {
  sendMessage,
  getMessages,
  getChannelMessages,
  sendThreadReply,
  markMessagesAsSeenApi,
} from "../services/api";

import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";
import socket from "../services/socket";
import CallingModal from "./CallingModal";
import { createPeerConnection, closePeerConnection } from "../services/webrtc";

export default function ChatArea() {
  const { register, handleSubmit, watch, setValue, reset } = useForm();
  const loc = useLocation();

  const [showPicker, setShowPicker] = useState(false);
  const [file, setFile] = useState(null);

  const pickerRef = useRef(null);
  const chatContainerRef = useRef(null);

  const messageValue = watch("message") || "";
  const selectedUser = loc.state || null;

  const messages = useMessageStore((state) => state.messages);
  const replyingToMessage = useMessageStore((state) => state.replyingToMessage);
  const setReplyingToMessage = useMessageStore(
    (state) => state.setReplyingToMessage,
  );
  const setMessages = useMessageStore((state) => state.setMessages);
  const addMessage = useMessageStore((state) => state.addMessage);
  const markStoreMessagesAsSeen = useMessageStore(
    (state) => state.markStoreMessagesAsSeen,
  );

  const currentUser = useAuthStore((state) => state.user);

  const {
    callAccepted,
    setLocalStream,
    setRemoteStream,
    outgoingCall,
    setOutgoingCall,
    isCalling,
    setActiveCallUser,
  } = useCallStore();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  useEffect(() => {
    if (!selectedUser) return;

    const loadChatHistory = async () => {
      try {
        let res;
        if (selectedUser.isChannel) {
          res = await getChannelMessages(selectedUser._id);
        } else {
          res = await getMessages(selectedUser._id);
          if (markMessagesAsSeenApi) {
            await markMessagesAsSeenApi(selectedUser._id).catch((err) =>
              console.log("Mark seen error:", err),
            );
          }
        }
        setMessages(res.data.payload);
      } catch (err) {
        console.error("Error loading chat:", err);
      }
    };

    loadChatHistory();
  }, [selectedUser, setMessages]);

  useEffect(() => {
    socket.on("reactionUpdated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );
    });

    socket.on("messagesSeen", ({ receiverId }) => {
      if (selectedUser && selectedUser._id === receiverId) {
        if (markStoreMessagesAsSeen) markStoreMessagesAsSeen();
      }
    });

    return () => {
      socket.off("reactionUpdated");
      socket.off("messagesSeen");
    };
  }, [selectedUser, setMessages, markStoreMessagesAsSeen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessageHandler = async (data) => {
    try {
      const formData = new FormData();
      formData.append("content", data.message || "");

      if (selectedUser.isChannel) {
        formData.append("channel", selectedUser._id);
      } else {
        formData.append("receiver", selectedUser._id);
      }
      if (file) formData.append("file", file);

      let res;
      if (replyingToMessage) {
        res = await sendThreadReply(replyingToMessage._id, formData);
      } else {
        res = await sendMessage(formData);
      }

      if (res.data && res.data.payload) {
        const newMessage = res.data.payload;
        if (replyingToMessage) newMessage.parentMessage = replyingToMessage;
        addMessage(newMessage);
      }

      reset();
      setFile(null);
      setShowPicker(false);
      setReplyingToMessage(null);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target))
        setShowPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startCall = async (type = "video") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });

      setLocalStream(stream);
      setOutgoingCall({ receiver: selectedUser, type });
      setActiveCallUser(selectedUser);

      const peer = createPeerConnection(
        (event) => setRemoteStream(event.streams[0]),
        (candidate) =>
          socket.emit("ice-candidate", { candidate, to: selectedUser._id }),
      );

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call-user", {
        to: selectedUser._id,
        from: currentUser,
        offer,
        callType: type,
      });
    } catch (err) {
      console.log("Error starting call:", err);
    }
  };
  const cleanupCall = () => {
    try {
      const currentLocalStream = useCallStore.getState().localStream;
      const currentRemoteStream = useCallStore.getState().remoteStream;

      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach((track) => track.stop());
      }
      if (currentRemoteStream) {
        currentRemoteStream.getTracks().forEach((track) => track.stop());
      }

      closePeerConnection();
    } catch (err) {
      console.error("Error cleaning up tracks:", err);
    } finally {
      useCallStore.getState().setCallAccepted(false);
      useCallStore.getState().resetCall();
    }
  };

  const endCall = () => {
    
    const currentCallState = useCallStore.getState();
    
    const targetUserId = currentCallState.activeCallUser?._id || currentCallState.incomingCall?.from?._id;
    
    const currentCallId = currentCallState.callId || currentCallState.incomingCall?.callId;

    if (targetUserId) {
      socket.emit("end-call", { 
        to: targetUserId, 
        callId: currentCallId 
      });
    }
    
    cleanupCall();
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 bg-[#020617] flex items-center justify-center">
        <p className="text-slate-500">Please select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#020617] w-full">
      <div className="bg-[#1e293b] px-6 py-4 border-b border-slate-700 shrink-0 z-20 shadow-sm flex items-center justify-between">
        <div>
          {selectedUser.isChannel ? (
            <>
              <h2 className="text-xl font-semibold text-white">
                # {selectedUser.name}
              </h2>
              <p className="text-sm text-slate-400">
                {selectedUser.members?.length || 0} members
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white">
                {selectedUser.firstName} {selectedUser.lastName || ""}
              </h2>
              <p className="text-sm text-slate-400">{selectedUser.email}</p>
            </>
          )}
        </div>

        {!selectedUser.isChannel && (
          <div className="flex gap-3">
            <button
              onClick={() => startCall("audio")}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              📞 Audio
            </button>
            <button
              onClick={() => startCall("video")}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              📹 Video
            </button>
          </div>
        )}
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 min-h-0 w-full chat-scroll relative"
      >
        <div className="flex flex-col w-full">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => {
              const msgDate = new Date(msg.createdAt);
              const currentDate = msgDate.toDateString();
              const prevDate =
                index > 0
                  ? new Date(messages[index - 1].createdAt).toDateString()
                  : null;
              const showDate = currentDate !== prevDate;
              const today = new Date();
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);

              let label = currentDate;
              if (currentDate === today.toDateString()) label = "Today";
              else if (currentDate === yesterday.toDateString())
                label = "Yesterday";

              return (
                <div key={msg._id} className="mb-2 animate-fade-in-up">
                  {showDate && (
                    <div className="sticky top-2 z-10 flex justify-center my-4 opacity-90 hover:opacity-100 transition-opacity">
                      <div className="bg-[#1e293b] text-slate-300 text-[11px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-full shadow-md border border-slate-700/50 backdrop-blur-sm">
                        {label}
                      </div>
                    </div>
                  )}
                  <MessageBubble message={msg} currentUser={currentUser} />
                </div>
              );
            })
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-500 mt-20">
              No messages yet. Say hi!
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-[#334155] border-t border-slate-700 shrink-0 z-20">
        {file && (
          <div className="text-sm text-blue-400 font-medium truncate max-w-sm mb-2 px-2 animate-fade-in-up">
            📎 {file.name}
          </div>
        )}

        {replyingToMessage && (
          <div className="mb-3 bg-[#1e293b] rounded-lg p-3 border-l-4 border-blue-500 flex justify-between items-center shadow-lg mx-2 animate-fade-in-up">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-blue-400 mb-1">
                Replying to{" "}
                {replyingToMessage.sender?.name ||
                  replyingToMessage.sender?.firstName ||
                  "User"}
              </p>
              <p className="text-sm text-slate-300 truncate">
                {replyingToMessage.content || "Attachment"}
              </p>
            </div>
            <button
              onClick={() => setReplyingToMessage(null)}
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit(sendMessageHandler)}
          className="flex items-center gap-3"
        >
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="w-10 h-10 rounded-full bg-[#1e293b] text-slate-300 text-xl flex items-center justify-center hover:bg-slate-700 hover:text-white transition-colors"
            >
              😊
            </button>
            {showPicker && (
              <div className="absolute bottom-12 left-0 z-50 shadow-2xl animate-fade-in-up">
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={(emoji) =>
                    setValue("message", messageValue + emoji.emoji)
                  }
                />
              </div>
            )}
          </div>

          <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white text-lg transition-colors">
            📎
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>

          <input
            {...register("message")}
            type="text"
            autoComplete="off"
            placeholder="Type a message..."
            className="flex-1 bg-[#1e293b] text-white border border-slate-600 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold w-12 h-12 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 -ml-1"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>

      {isCalling && !callAccepted && (
        <CallingModal
          receiver={outgoingCall?.receiver}
          type={outgoingCall?.type}
          onCancel={endCall}
        />
      )}
    </div>
  );
}
