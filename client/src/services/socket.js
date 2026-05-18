import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

const socket = io(SOCKET_URL, {
  withCredentials: true,
});

/* ======================================================
   SOCKET HELPERS
====================================================== */

export const setupSocketListeners = (
  useMessageStore
) => {

  const {
    receiveMessage,
    updateMessageReaction,
    updateMessage,
    addThreadReply,
  } = useMessageStore.getState();

  /* NEW MESSAGE */

  socket.on(
    "message Received",
    (message) => {

      receiveMessage(message);
    }
  );

  /* REACTION UPDATE */

  socket.on(
    "reactionUpdated",
    (updatedMessage) => {

      updateMessageReaction(
        updatedMessage
      );
    }
  );

  /* MESSAGE EDITED */

  socket.on(
    "message edited",
    (updatedMessage) => {

      updateMessage(
        updatedMessage
      );
    }
  );

  /* THREAD REPLY */

  socket.on(
    "thread reply",
    (replyMessage) => {

      addThreadReply(
        replyMessage
      );
    }
  );
};

export default socket;