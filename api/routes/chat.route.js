import express from "express";
import { getChats, getChatMessages, createChat, sendMessage } from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getChats);
router.get("/:chatId/messages", verifyToken, getChatMessages);
router.post("/create", verifyToken, createChat);
router.post("/send", verifyToken, sendMessage);

export default router; 