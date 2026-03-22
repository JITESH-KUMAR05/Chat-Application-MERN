import { create } from 'zustand';
import { getSidebarUsers, getMyChannels } from '../services/api';

export const useMessageStore = create((set, get) => ({
  messages: [],
  selectedUser: null,
  unreadCounts: {},
  sidebarUsers: [],
  channels: [],

  loadSidebarUsers: async () => {
    try {
      const res = await getSidebarUsers();
      set({ sidebarUsers: res.data.payload || res.data });
    } catch (error) {
      console.error("Error fetching sidebar users:", error);
    }
  },

  loadChannels: async () => {
    try {
      const res = await getMyChannels();
      set({ channels: res.data.payload || res.data });
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  },

  // setMessages: (messages) => set({ messages }),
  setMessages: (messages) =>
  set((state) => ({
    messages:
      typeof messages === "function"
        ? messages(state.messages)
        : messages,
  })),
  
  addMessage: (message) => {
    set((state) => {
      // Prevent duplicate keys by checking if message _id already exists
      const isDuplicate = state.messages.some(msg => msg._id === message._id);
      if (isDuplicate) return state;

      return { messages: [...state.messages, message] };
    });
    // Refresh sidebar to bump user up or add new user
    get().loadSidebarUsers();
    get().loadChannels();
  },

  setSelectedUser: (user) => set((state) => ({
    selectedUser: user,
    unreadCounts: user ? { ...state.unreadCounts, [user._id]: 0 } : state.unreadCounts
  })),
  
  updateMessageReaction: (updatedMessage) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id.toString() === updatedMessage._id.toString() ? updatedMessage : msg
      ),
    }));
  },

  receiveMessage: (message) => {
    set((state) => {
      // Prevent duplicate messages on the receiving end (especially if you were the sender)
      const isDuplicate = state.messages.some(msg => msg._id === message._id);
      if (isDuplicate) return state;

      const activeChatId = state.selectedUser?._id;
      const isChannelChat = state.selectedUser?.isChannel;

      let isCurrentChatMatch = false;
      let notificationId = null;

      // 1. Determine if this message belongs to the currently open chat
      if (message.channel) {
        // It's a channel message
        const channelId = message.channel?._id || message.channel;
        if (isChannelChat && activeChatId === channelId) {
            isCurrentChatMatch = true;
        } else {
            notificationId = channelId;
        }
      } else {
        // It's a direct message
        const senderId = message.sender?._id || message.sender;
        // Don't show notifications for messages WE sent (that we receive back via socket broadcast in group context)
        // Wait, DMs from us normally don't trigger receiveMessage for us, but just in case.
        if (!isChannelChat && activeChatId === senderId) {
            isCurrentChatMatch = true;
        } else {
            notificationId = senderId;
        }
      }

      if (isCurrentChatMatch) {
        // Show the message immediately on screen!
        return { 
          messages: [...state.messages, message] 
        };
      } else if (notificationId) {
        // Increment the unread badge for the correct channel or user
        return {
          unreadCounts: {
            ...state.unreadCounts,
            [notificationId]: (state.unreadCounts[notificationId] || 0) + 1
          }
        };
      }
      return state;
    });

    get().loadSidebarUsers();
    get().loadChannels();
    
  }
}));
