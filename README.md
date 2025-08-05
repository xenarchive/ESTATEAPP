# Real-Time Chat Application

A fully functional real-time chat application built with React, Node.js, Socket.IO, and Prisma. Features include real-time messaging, typing indicators, online status, and a modern responsive UI.

## Features

✅ **Real-time Messaging** - Instant message delivery with Socket.IO
✅ **User Authentication** - Secure JWT-based authentication
✅ **Online Status Indicators** - See who's online/offline
✅ **Typing Indicators** - See when someone is typing
✅ **Message History** - Persistent message storage with Prisma
✅ **Responsive Design** - Works on desktop and mobile
✅ **Connection Status** - Visual connection status indicators
✅ **Error Handling** - Comprehensive error handling and reconnection
✅ **Modern UI** - Clean, modern interface with animations

## Tech Stack

- **Frontend**: React, Socket.IO Client, SCSS
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT tokens
- **Real-time**: Socket.IO for WebSocket connections

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd real-time-chat-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create `.env` file in the `api` directory:
   ```env
   DATABASE_URL="your-mongodb-connection-string"
   JWT_KEY="your-secret-jwt-key"
   CLIENT_URL="http://localhost:5173"
   ```

   Create `.env` file in the `client` directory:
   ```env
   REACT_APP_API_URL="http://localhost:8800"
   ```

4. **Set up the database**
   ```bash
   cd api
   npx prisma generate
   npx prisma db push
   cd ..
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the API server (port 8800) and the React client (port 5173).

### Alternative: Start servers separately

**Start the API server:**
```bash
npm run server
```

**Start the React client:**
```bash
npm run client
```

## Usage

1. **Register/Login**: Create an account or log in with existing credentials
2. **Start Chatting**: Click on a user to start a conversation
3. **Real-time Features**: 
   - Messages appear instantly
   - See typing indicators when someone is typing
   - Online/offline status is shown next to usernames
   - Connection status is displayed in the chat list header

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Chat
- `GET /api/chats` - Get user's conversations
- `GET /api/chats/:chatId/messages` - Get messages for a chat
- `POST /api/chats/create` - Create a new chat
- `POST /api/chats/send` - Send a message

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

## Socket.IO Events

### Client → Server
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `send-message` - Send a message
- `typing` - User started typing
- `stop-typing` - User stopped typing
- `mark-messages-read` - Mark messages as read

### Server → Client
- `receive-message` - New message received
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing
- `user-online` - User came online
- `user-offline` - User went offline
- `online-users` - List of online users
- `new-message-notification` - New message notification
- `error` - Error occurred

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Chat**: Chat conversations between users
- **ChatParticipant**: Many-to-many relationship between users and chats
- **Message**: Individual messages in chats

## Project Structure

```
├── api/                    # Backend API
│   ├── controllers/        # Route controllers
│   ├── lib/               # Utilities (Prisma client)
│   ├── middleware/        # Auth middleware
│   ├── prisma/           # Database schema
│   ├── routes/           # API routes
│   └── app.js            # Main server file
├── client/               # React frontend
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # React components
│       ├── context/      # React context (Auth, Socket)
│       ├── lib/          # API utilities
│       └── routes/       # Page components
└── package.json          # Root package.json with scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **Socket connection fails**
   - Check if the API server is running on port 8800
   - Verify JWT token is valid
   - Check CORS settings

2. **Messages not appearing in real-time**
   - Ensure Socket.IO connection is established
   - Check browser console for errors
   - Verify user is properly authenticated

3. **Database connection issues**
   - Check MongoDB connection string
   - Ensure database is running
   - Run `npx prisma generate` after schema changes

### Debug Mode

Enable debug logs by setting environment variables:

```bash
DEBUG=socket.io* npm run server
```

## Performance Considerations

- Messages are paginated to avoid loading too many at once
- Socket connections are properly cleaned up on disconnect
- Typing indicators are debounced to reduce server load
- Online status is efficiently managed with Maps for O(1) lookups

## Security Features

- JWT token authentication for Socket.IO connections
- Input validation and sanitization
- CORS protection
- Rate limiting (recommended for production)
- SQL injection protection via Prisma

---

**Happy Chatting! 🚀**