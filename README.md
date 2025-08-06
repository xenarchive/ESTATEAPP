
# 🏠 Estate Application - Full Stack Real Estate Platform

A modern, full-stack real estate application built with React, Node.js, and MongoDB. Features real-time chat, dynamic notifications, and a comprehensive property management system.

## 🚀 Features

### Core Functionality
- **Property Listings**: Browse and search for properties with advanced filtering
- **User Authentication**: Secure JWT-based authentication system
- **Real-time Chat**: Socket.IO powered messaging between users
- **Dynamic Notifications**: Real-time notification system for messages and saved posts
- **Property Management**: Create, edit, and manage property listings
- **User Profiles**: Comprehensive user profile management
- **Responsive Design**: Mobile-first responsive design

### Technical Features
- **Real-time Communication**: WebSocket integration for live chat
- **State Management**: Zustand for client-side state management
- **Database Integration**: MongoDB with Prisma ORM
- **API Security**: JWT token authentication and authorization
- **File Upload**: Cloudinary integration for image management
- **Search & Filter**: Advanced property search and filtering capabilities

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Socket.IO Client** - Real-time communication
- **Zustand** - Lightweight state management
- **SCSS** - Advanced CSS preprocessing
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **Prisma** - Modern database ORM
- **MongoDB** - NoSQL database
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server with auto-restart

## 📁 Project Structure

```
ESTATEAPP/
├── api/                    # Backend server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication middleware
│   ├── routes/            # API routes
│   ├── lib/               # Database configuration
│   ├── prisma/            # Database schema
│   └── app.js             # Main server file
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── lib/           # Utility functions
│   │   ├── routes/        # Page components
│   │   └── main.jsx       # Application entry point
│   └── public/            # Static assets
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ESTATEAPP
   ```

2. **Install backend dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the `api` directory:
   ```env
   DATABASE_URL="mongodb://localhost:27017/estate"
   CLIENT_URL="http://localhost:5173"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

5. **Database Setup**
   ```bash
   cd api
   npx prisma generate
   npx prisma db push
   ```

6. **Start Development Servers**

   **Backend (Terminal 1):**
   ```bash
   cd api
   npm start
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8800

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout

### Properties
- `GET /api/posts` - Get all properties
- `POST /api/posts` - Create new property
- `GET /api/posts/:id` - Get specific property
- `PUT /api/posts/:id` - Update property
- `DELETE /api/posts/:id` - Delete property

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/save-post` - Save/unsave property

### Chat
- `GET /api/chats` - Get user chats
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/create` - Create new chat
- `POST /api/chats/send` - Send message

## 🗄️ Database Schema

### Core Models
- **User**: User accounts and profiles
- **Post**: Property listings
- **Chat**: Chat conversations
- **Message**: Individual chat messages
- **SavedPost**: User saved properties
- **Notification**: User notifications

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Request data validation
- **Error Handling**: Comprehensive error management

## 📱 Real-time Features

### Socket.IO Events
- **Connection**: User authentication and room joining
- **send-message**: Real-time message sending
- **receive-message**: Message reception
- **typing**: Typing indicators
- **new-message-notification**: Message notifications
- **post-saved-notification**: Property save notifications

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean and intuitive interface
- **Smooth Animations**: CSS transitions and animations
- **Loading States**: User feedback during operations
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Deploy to cloud platform (Heroku, Vercel, etc.)
4. Set up production domain

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.IO for real-time capabilities
- Prisma team for the excellent ORM
- MongoDB for the flexible database solution

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: [your-email@example.com]
- Documentation: [link-to-docs]

---

**Built with ❤️ using modern web technologies**
>>>>>>> dd5a93a2 (final)
