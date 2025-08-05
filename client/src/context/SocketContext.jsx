import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { useNotificationStore } from '../lib/notificationStore';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { addNotification, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (currentUser) {
      // Get the token from cookies
      const getToken = () => {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => 
          cookie.trim().startsWith('token=')
        );
        return tokenCookie ? tokenCookie.split('=')[1] : null;
      };

      const token = getToken();
      
      if (token) {
        const newSocket = io('http://localhost:8800', {
          auth: {
            token: token,
          },
        });

        newSocket.on('connect', () => {
          console.log('Connected to Socket.IO server');
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        // Listen for new message notifications
        newSocket.on('new-message-notification', (data) => {
          addNotification({
            id: Date.now(),
            type: 'message',
            title: 'New Message',
            message: `${data.senderName} sent you a message`,
            senderId: data.senderId,
            chatId: data.chatId,
            read: false,
            timestamp: new Date(),
          });
        });

        // Listen for saved post notifications
        newSocket.on('post-saved-notification', (data) => {
          addNotification({
            id: Date.now(),
            type: 'saved_post',
            title: 'Post Saved',
            message: `${data.userName} saved your post "${data.postTitle}"`,
            postId: data.postId,
            userId: data.userId,
            read: false,
            timestamp: new Date(),
          });
        });

        // Listen for notification count updates
        newSocket.on('notification-count', (count) => {
          setUnreadCount(count);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [currentUser, addNotification, setUnreadCount]);

  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 