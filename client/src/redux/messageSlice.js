import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    messages: []
  },
  reducers: {

    // load chat history
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    // add new message
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    }

  }
});

export const { setMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;