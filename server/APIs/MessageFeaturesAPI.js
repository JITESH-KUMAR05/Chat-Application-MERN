import express from "express";

import {
  editMessage,
  sendThreadReply,
  getThreadReplies,
} from "../controllers/messageFeatures.controller.js";

import { verifyToken } from "../middleware/verifyToken.js";
export const messageFeaturesRoute =
  express.Router();

/* ======================================================
   EDIT MESSAGE
====================================================== */

messageFeaturesRoute.put(
  "/edit/:messageId",
  verifyToken,
  editMessage
);

/* ======================================================
   SEND THREAD REPLY
====================================================== */

messageFeaturesRoute.post(
  "/thread-reply/:parentMessageId",
  verifyToken,
  sendThreadReply
);

/* ======================================================
   GET THREAD REPLIES
====================================================== */

messageFeaturesRoute.get(
  "/thread-replies/:parentMessageId",
  verifyToken,
  getThreadReplies
);