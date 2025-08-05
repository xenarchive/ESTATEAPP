import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
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
  }, [currentUser]);

  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 