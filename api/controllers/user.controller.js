import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { sendSavedPostNotification } from "../app.js";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users!" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user!" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update users!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const savePost = async (req, res) => {
  const tokenUserId = req.userId;
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required!" });
  }

  try {
    // Check if the post exists and get post details
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    // Check if the user has already saved this post
    const existingSave = await prisma.savedPost.findFirst({
      where: {
        userId: tokenUserId,
        postId: postId,
      },
    });

    if (existingSave) {
      // If already saved, remove the save (toggle functionality)
      await prisma.savedPost.delete({
        where: { id: existingSave.id },
      });
      res.status(200).json({ message: "Post unsaved successfully", saved: false });
    } else {
      // If not saved, add the save
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId: postId,
        },
      });

      // Get the user who saved the post
      const savingUser = await prisma.user.findUnique({
        where: { id: tokenUserId },
        select: {
          id: true,
          username: true,
        },
      });

      // Send notification to post owner (if it's not their own post)
      if (post.user.id !== tokenUserId) {
        sendSavedPostNotification(
          post.user.id,
          {
            id: savingUser.id,
            username: savingUser.username,
            postId: postId,
          },
          post.title
        );
      }

      res.status(200).json({ message: "Post saved successfully", saved: true });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save post!" });
  }
};

export const profilePosts = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    // Get posts created by the user
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    console.log("User posts count:", userPosts.length);

    // Get saved posts by the user
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: {
          include: {
            postDetail: true,
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    console.log("Saved posts count:", savedPosts.length);
    console.log("Saved posts data:", savedPosts);

    // Extract the actual posts from saved posts
    const savedPostData = savedPosts.map(savedPost => savedPost.post);

    console.log("Extracted saved posts count:", savedPostData.length);

    res.status(200).json({
      userPosts,
      savedPosts: savedPostData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};

export const testSavedPosts = async (req, res) => {
  try {
    // Get all saved posts to see if any exist
    const allSavedPosts = await prisma.savedPost.findMany({
      include: {
        post: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    console.log("All saved posts:", allSavedPosts);

    res.status(200).json({
      message: "Test completed",
      totalSavedPosts: allSavedPosts.length,
      savedPosts: allSavedPosts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to test saved posts!" });
  }
};