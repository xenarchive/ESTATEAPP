import express from 'express';
import cors from "cors"
import cookieParser from 'cookie-parser'
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import postRoute from "./routes/post.route.js";
import authRoute from "./routes/auth.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js"
import chatRoute from "./routes/chat.route.js"
import prisma from "./lib/prisma.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.use(cors({origin: process.env.CLIENT_URL, credentials: true}))     
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute)
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);

// Store online users
const onlineUsers = new Map();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, avatar: true }
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = decoded.id;
    socket.user = user;
    next();
  } catch (err) {
    console.error('Socket authentication error:', err);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.user.username, socket.userId);
  
  // Add user to online users
  onlineUsers.set(socket.userId, {
    socketId: socket.id,
    user: socket.user,
    lastSeen: new Date()
  });

  // Broadcast user online status
  socket.broadcast.emit('user-online', {
    userId: socket.userId,
    user: socket.user
  });

  // Join user's personal room
  socket.join(socket.userId);

  // Send online users list to the connected user
  socket.emit('online-users', Array.from(onlineUsers.values()).map(u => ({
    userId: u.user.id,
    user: u.user
  })));

  socket.on('join-chat', async (chatId) => {
    try {
      // Verify user is participant in this chat
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          participants: {
            some: {
              userId: socket.userId,
            },
          },
        },
      });

      if (chat) {
        socket.join(chatId);
        console.log(`User ${socket.user.username} joined chat ${chatId}`);
        
        // Notify other participants that user joined
        socket.to(chatId).emit('user-joined-chat', {
          userId: socket.userId,
          user: socket.user,
          chatId
        });
      } else {
        socket.emit('error', { message: 'Unauthorized to join this chat' });
      }
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.user.username} left chat ${chatId}`);
    
    // Notify other participants that user left
    socket.to(chatId).emit('user-left-chat', {
      userId: socket.userId,
      user: socket.user,
      chatId
    });
  });

  socket.on('send-message', async (data) => {
    try {
      const { chatId, content, receiverId } = data;

      // Verify user is participant in this chat
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          participants: {
            some: {
              userId: socket.userId,
            },
          },
        },
      });

      if (!chat) {
        socket.emit('error', { message: 'Unauthorized to send message to this chat' });
        return;
      }

      // Create message in database
      const message = await prisma.message.create({
        data: {
          content,
          senderId: socket.userId,
          receiverId,
          chatId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Update chat's updatedAt timestamp
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      // Broadcast message to all users in the chat (including sender for confirmation)
      io.to(chatId).emit('receive-message', {
        ...message,
        timestamp: message.createdAt,
      });

      // Send notification to receiver if they're online but not in the chat room
      const receiverOnline = onlineUsers.get(receiverId);
      if (receiverOnline && !io.sockets.adapter.rooms.get(chatId)?.has(receiverOnline.socketId)) {
        io.to(receiverId).emit('new-message-notification', {
          chatId,
          message,
          sender: socket.user
        });
      }

      console.log(`Message sent in chat ${chatId} by user ${socket.user.username}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicators with improved handling
  let typingTimeout;
  socket.on('typing', (data) => {
    const { chatId } = data;
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Broadcast typing status
    socket.to(chatId).emit('user-typing', {
      userId: socket.userId,
      username: socket.user.username,
      chatId
    });

    // Auto-stop typing after 3 seconds
    typingTimeout = setTimeout(() => {
      socket.to(chatId).emit('user-stop-typing', {
        userId: socket.userId,
        chatId
      });
    }, 3000);
  });

  socket.on('stop-typing', (data) => {
    const { chatId } = data;
    
    // Clear timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    socket.to(chatId).emit('user-stop-typing', {
      userId: socket.userId,
      chatId
    });
  });

  // Handle message read status
  socket.on('mark-messages-read', async (data) => {
    try {
      const { chatId } = data;
      
      // Here you could implement read receipts by updating a readAt field
      // For now, just broadcast that messages were read
      socket.to(chatId).emit('messages-read', {
        userId: socket.userId,
        chatId,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username, socket.userId);
    
    // Remove user from online users
    onlineUsers.delete(socket.userId);
    
    // Broadcast user offline status
    socket.broadcast.emit('user-offline', {
      userId: socket.userId,
      user: socket.user,
      lastSeen: new Date()
    });

    // Clear typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error for user', socket.user.username, ':', error);
  });
});

// Error handling for Socket.IO
io.engine.on("connection_error", (err) => {
  console.log('Socket.IO connection error:', err.req);
  console.log('Error code:', err.code);
  console.log('Error message:', err.message);
  console.log('Error context:', err.context);
});

server.listen(8800, () => {
  console.log("Server is running on port 8800!");
  console.log("Socket.IO server is ready for connections");
});
