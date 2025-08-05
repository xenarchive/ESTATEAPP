import express from "express";
import {verifyToken} from '../middleware/verifyToken.js'
import {optionalAuth} from '../middleware/optionalAuth.js'
import { addPost, deletePost, getPost, getPosts, updatePost, createSampleData } from "../controllers/post.controller.js";

const router = express.Router()

router.get("/", getPosts)
router.get("/:id", optionalAuth, getPost)
router.post("/",verifyToken, addPost)
router.post("/createSample", verifyToken, createSampleData)
router.put("/:id",verifyToken, updatePost)
router.delete("/:id",verifyToken, deletePost)
export default router;