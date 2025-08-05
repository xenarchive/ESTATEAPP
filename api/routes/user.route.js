import express from "express";
import { deleteUser, getUser, getUsers, updateUser, savePost, profilePosts, testSavedPosts } from "../controllers/user.controller.js";
import {verifyToken} from "../middleware/verifyToken.js"
const router = express.Router()

router.get("/", getUsers);
router.post("/savePost", verifyToken, savePost);
router.get("/profilePosts", verifyToken, profilePosts);
router.get("/testSavedPosts", testSavedPosts);
router.get("/:id", verifyToken, getUser);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;