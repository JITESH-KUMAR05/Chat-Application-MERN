import { create } from "zustand";

import { getSidebarUsers, getMyChannels } from "../services/api";

export const useMessageStore = create((set, get) => ({
  messages: [],

  selectedUser: null,

  unreadCounts: {},

  sidebarUsers: [],

  channels: [],

  replyingToMessage: null,

  setReplyingToMessage: (message) => set({ replyingToMessage: message }),

  markStoreMessagesAsSeen: () =>
    set((state) => ({
      messages: state.messages.map((msg) => ({
        ...msg,
        status: "seen",
      })),
    })),
  /* ======================================================
       LOAD SIDEBAR USERS
    ====================================================== */

  loadSidebarUsers: async () => {
    try {
      const res = await getSidebarUsers();

      set({
        sidebarUsers: res.data.payload || res.data,
      });
    } catch (error) {
      console.error("Error fetching sidebar users:", error);
    }
  },

  /* ======================================================
       LOAD CHANNELS
    ====================================================== */

  loadChannels: async () => {
    try {
      const res = await getMyChannels();

      set({
        channels: res.data.payload || res.data,
      });
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  },

  /* ======================================================
       SET MESSAGES
    ====================================================== */

  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),

  /* ======================================================
       ADD MESSAGE
    ====================================================== */

  addMessage: (message) => {
    set((state) => {
      const isDuplicate = state.messages.some((msg) => msg._id === message._id);

      if (isDuplicate) {
        return state;
      }

      return {
        messages: [...state.messages, message],
      };
    });

    get().loadSidebarUsers();

    get().loadChannels();
  },

  /* ======================================================
       UPDATE MESSAGE
       (FOR EDITED MESSAGE)
    ====================================================== */

  updateMessage: (updatedMessage) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id.toString() === updatedMessage._id.toString()
          ? {
              ...msg,
              ...updatedMessage,
            }
          : msg,
      ),
    }));
  },

  /* ======================================================
       ADD THREAD REPLY
    ====================================================== */

  addThreadReply: (replyMessage) => {
    set((state) => {
      const isDuplicate = state.messages.some(
        (msg) => msg._id === replyMessage._id,
      );

      if (isDuplicate) {
        return state;
      }

      return {
        messages: [...state.messages, replyMessage],
      };
    });
  },

  /* ======================================================
       SELECTED USER
    ====================================================== */

  setSelectedUser: (user) =>
    set((state) => ({
      selectedUser: user,

      unreadCounts: user
        ? {
            ...state.unreadCounts,
            [user._id]: 0,
          }
        : state.unreadCounts,
    })),

  /* ======================================================
       UPDATE MESSAGE REACTION
    ====================================================== */

  updateMessageReaction: (updatedMessage) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id.toString() === updatedMessage._id.toString()
          ? updatedMessage
          : msg,
      ),
    }));
  },

  /* ======================================================
       RECEIVE MESSAGE
    ====================================================== */

  receiveMessage: (message) => {
    set((state) => {
      const isDuplicate = state.messages.some((msg) => msg._id === message._id);

      if (isDuplicate) {
        return state;
      }

      const activeChatId = state.selectedUser?._id;

      const isChannelChat = state.selectedUser?.isChannel;

      let isCurrentChatMatch = false;

      let notificationId = null;

      if (message.channel) {
        const channelId = message.channel?._id || message.channel;

        if (isChannelChat && activeChatId === channelId) {
          isCurrentChatMatch = true;
        } else {
          notificationId = channelId;
        }
      } else {
        const senderId = message.sender?._id || message.sender;

        if (!isChannelChat && activeChatId === senderId) {
          isCurrentChatMatch = true;
        } else {
          notificationId = senderId;
        }
      }

      if (isCurrentChatMatch) {
        return {
          messages: [...state.messages, message],
        };
      } else if (notificationId) {
        return {
          unreadCounts: {
            ...state.unreadCounts,

            [notificationId]: (state.unreadCounts[notificationId] || 0) + 1,
          },
        };
      }

      return state;
    });

    get().loadSidebarUsers();

    get().loadChannels();
  },
}));
