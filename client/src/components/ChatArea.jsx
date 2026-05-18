import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router";
import { useForm } from "react-hook-form";

import {
  sendMessage,
  getMessages,
  getChannelMessages,
} from "../services/api";

import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";

import MessageBubble from "./MessageBubble";

import EmojiPicker from "emoji-picker-react";

import socket from "../services/socket";

export default function ChatArea() {

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm();

  const loc = useLocation();

  const [showPicker, setShowPicker] = useState(false);
  const [file, setFile] = useState(null);

  const pickerRef = useRef(null);

  const messageValue = watch("message") || "";

  // Selected user/channel
  const selectedUser = loc.state || null;

  // Zustand store
  const messages = useMessageStore((state) => state.messages);

  const setMessages = useMessageStore(
    (state) => state.setMessages
  );

  const addMessage = useMessageStore(
    (state) => state.addMessage
  );

  const currentUser = useAuthStore(
    (state) => state.user
  );

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Load chat history
  useEffect(() => {

    if (!selectedUser) return;

    const loadChatHistory = async () => {

      try {

        let res;

        if (selectedUser.isChannel) {

          res = await getChannelMessages(
            selectedUser._id
          );

        } else {

          res = await getMessages(
            selectedUser._id
          );
        }

        setMessages(res.data.payload);

      } catch (err) {

        console.error(
          "Error loading chat:",
          err
        );
      }
    };

    loadChatHistory();

  }, [selectedUser, setMessages]);

  // Send message
  const sendMessageHandler = async (data) => {

    try {

      const formData = new FormData();

      formData.append(
        "content",
        data.message || ""
      );

      if (selectedUser.isChannel) {

        formData.append(
          "channel",
          selectedUser._id
        );

      } else {

        formData.append(
          "receiver",
          selectedUser._id
        );
      }

      // Append file
      if (file) {
        formData.append("file", file);
      }

      const res = await sendMessage(formData);

      // Add instantly
      if (res.data && res.data.payload) {
        addMessage(res.data.payload);
      }

      reset();

      setFile(null);

      setShowPicker(false);

    } catch (err) {

      console.error(
        "Error sending message:",
        err
      );
    }
  };

  // Socket updates
  useEffect(() => {

    socket.on(
      "reactionUpdated",
      (updatedMessage) => {

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id
              ? updatedMessage
              : msg
          )
        );
      }
    );

    return () =>
      socket.off("reactionUpdated");

  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target
        )
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  // No user selected
  if (!selectedUser) {

    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center">

        <p className="text-gray-500">
          Please select a user to start chatting
        </p>

      </div>
    );
  }

  return (

    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 w-full">

      {/* CHAT HEADER */}
      <div className="bg-white px-6 py-4 shadow-sm border-b border-gray-200 shrink-0">

        {selectedUser.isChannel ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800">
              # {selectedUser.name}
            </h2>

            <p className="text-sm text-gray-500">
              {selectedUser.members?.length || 0} members
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedUser.firstName}{" "}
              {selectedUser.lastName || ""}
            </h2>

            <p className="text-sm text-gray-500">
              {selectedUser.email}
            </p>
          </>
        )}

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto bg-slate-900 px-4 py-3 min-h-0 w-full">

        <div className="flex flex-col w-full">

          {messages && messages.length > 0 ? (

            messages.map((msg, index) => {

              const msgDate =
                new Date(msg.createdAt);

              const currentDate =
                msgDate.toDateString();

              const prevDate =
                index > 0
                  ? new Date(
                      messages[index - 1]
                        .createdAt
                    ).toDateString()
                  : null;

              const showDate =
                currentDate !== prevDate;

              // TODAY / YESTERDAY
              const today = new Date();

              const yesterday = new Date();
              yesterday.setDate(
                today.getDate() - 1
              );

              let label = currentDate;

              if (
                currentDate ===
                today.toDateString()
              ) {
                label = "Today";
              } else if (
                currentDate ===
                yesterday.toDateString()
              ) {
                label = "Yesterday";
              }

              return (

                <div
                  key={msg._id}
                  className="mb-2"
                >

                  {/* DATE LABEL */}
                  {showDate && (

                    <div className="flex justify-center my-4">

                      <div className="bg-gray-700 text-white text-xs px-4 py-1 rounded-full shadow">

                        {label}

                      </div>

                    </div>
                  )}

                  {/* MESSAGE */}
                  <MessageBubble
                    message={msg}
                    currentUser={currentUser}
                  />

                </div>
              );
            })

          ) : (

            <div className="flex flex-1 items-center justify-center text-gray-400">

              No messages yet. Say hi!

            </div>
          )}

        </div>

      </div>

      {/* MESSAGE INPUT */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">

        <form
          onSubmit={handleSubmit(
            sendMessageHandler
          )}
          className="flex items-center gap-3"
        >

          {/* EMOJI BUTTON */}
          <div
            className="relative"
            ref={pickerRef}
          >

            <button
              type="button"
              onClick={() =>
                setShowPicker(
                  !showPicker
                )
              }
              className="w-10 h-10 rounded-full bg-blue-900 text-white text-3xl flex items-center justify-center hover:bg-blue-950"
            >
              +
            </button>

            {/* EMOJI PICKER */}
            {showPicker && (

              <div className="absolute bottom-12 left-0 z-50">

                <EmojiPicker
                  onEmojiClick={(emoji) => {

                    setValue(
                      "message",
                      messageValue +
                        emoji.emoji
                    );
                  }}
                />

              </div>
            )}

          </div>

          {/* FILE BUTTON */}
          <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-blue-900 hover:bg-blue-950 text-white text-xl">

            📎

            <input
              type="file"
              className="hidden"
              onChange={
                handleFileChange
              }
            />

          </label>

          {/* FILE NAME */}
          {file && (

            <div className="text-sm text-blue-600 truncate max-w-[120px]">

              {file.name}

            </div>
          )}

          {/* INPUT */}
          <input
            {...register("message")}
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* SEND BUTTON */}
          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-950 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer"
          >
            Send
          </button>

        </form>

      </div>

    </div>
  );
}