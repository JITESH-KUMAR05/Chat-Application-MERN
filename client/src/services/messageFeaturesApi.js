import api from "./api";

/* ======================================================
   EDIT MESSAGE
====================================================== */

export const editMessageApi = (
  messageId,
  data
) => {
  return api.put(
    `/message-feature-api/edit/${messageId}`,
    data
  );
};

/* ======================================================
   SEND THREAD REPLY
====================================================== */

export const sendThreadReplyApi = (
  parentMessageId,
  data
) => {
  return api.post(
    `/message-feature-api/thread-reply/${parentMessageId}`,
    data
  );
};

/* ======================================================
   GET THREAD REPLIES
====================================================== */

export const getThreadRepliesApi = (
  parentMessageId
) => {
  return api.get(
    `/message-feature-api/thread-replies/${parentMessageId}`
  );
};