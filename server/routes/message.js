import express from "express";
import { sendMessage } from "../controllers/message.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Single file upload
router.post("/send", upload.single("file"), sendMessage);

export default router;