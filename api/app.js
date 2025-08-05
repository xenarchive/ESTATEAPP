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

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Join user's personal room
  socket.join(socket.userId);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });

  socket.on('send-message', (data) => {
    // Broadcast message to all users in the chat
    socket.to(data.chatId).emit('receive-message', {
      ...data,
      timestamp: new Date(),
    });
    console.log(`Message sent in chat ${data.chatId} by user ${socket.userId}`);
  });

  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user-typing', {
      userId: socket.userId,
      username: data.username,
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.chatId).emit('user-stop-typing', {
      userId: socket.userId,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

server.listen(8800, () => {
  console.log("Server is running!");
});
