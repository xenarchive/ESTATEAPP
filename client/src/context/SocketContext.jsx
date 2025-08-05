import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      // Get the token from cookies
      const getToken = () => {
        const cookies = document.cookie.split(';');
        const accessToken = cookies.find(cookie => 
          cookie.trim().startsWith('accessToken=')
        );
        return accessToken ? accessToken.split('=')[1] : null;
      };

      const token = getToken();
      
      if (token) {
        console.log('Connecting to Socket.IO server...');
        
        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:8800', {
          auth: {
            token: token,
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });

        newSocket.on('connect', () => {
          console.log('Connected to Socket.IO server');
          setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('Disconnected from Socket.IO server:', reason);
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
          console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
          setIsConnected(true);
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
          console.log('Attempting to reconnect...', attemptNumber);
        });

        newSocket.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
        });

        newSocket.on('reconnect_failed', () => {
          console.error('Failed to reconnect to Socket.IO server');
          setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
          console.log('Cleaning up socket connection...');
          newSocket.removeAllListeners();
          newSocket.close();
          setSocket(null);
          setIsConnected(false);
        };
      }
    } else {
      // User logged out, clean up socket
      if (socket) {
        console.log('User logged out, closing socket connection...');
        socket.removeAllListeners();
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [currentUser]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 