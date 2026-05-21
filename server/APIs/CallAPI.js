import express from "express";

import {
  createCall,
  getCalls,
  updateCall,
} from "../Controllers/CallController.js";

const router = express.Router();

router.post("/create", createCall);

router.get("/history", getCalls);

router.put("/:id", updateCall);

export const callRoute = router;
