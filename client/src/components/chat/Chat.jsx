import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../lib/apiRequest';
import './chat.scss';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocket();
  const { currentUser } = useContext(AuthContext);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await apiRequest.get('/chats');
        setChats(res.data);
        setError('');
      } catch (err) {
        console.log(err);
        setError('Failed to load conversations');
      }
    };

    if (currentUser) {
      fetchChats();
    }
  }, [currentUser]);

  // Fetch messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      
      setLoading(true);
      try {
        const res = await apiRequest.get(`/chats/${selectedChat.id}/messages`);
        setMessages(res.data);
        scrollToBottom();
        setError('');
        
        // Mark messages as read when viewing them
        if (socket) {
          socket.emit('mark-messages-read', { chatId: selectedChat.id });
        }
      } catch (err) {
        console.log(err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat, socket]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    // Connection status
    const handleConnect = () => {
      console.log('Connected to chat server');
      setConnectionStatus('connected');
      setError('');
    };

    const handleDisconnect = () => {
      console.log('Disconnected from chat server');
      setConnectionStatus('disconnected');
      setError('Connection lost. Trying to reconnect...');
    };

    const handleConnectError = (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      setError('Failed to connect to chat server');
    };

    // Message events
    const handleReceiveMessage = (message) => {
      console.log('Received message:', message);
      
      if (selectedChat && message.chatId === selectedChat.id) {
        setMessages(prev => {
          // Avoid duplicate messages
          const exists = prev.some(msg => msg.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      }
      
      // Update chat list with new message
      setChats(prev => 
        prev.map(chat => 
          chat.id === message.chatId 
            ? { ...chat, latestMessage: message }
            : chat
        )
      );
    };

    // Typing events
    const handleUserTyping = (data) => {
      if (selectedChat && data.chatId === selectedChat.id && data.userId !== currentUser?.id) {
        setTypingUsers(prev => new Set(prev).add(data.username));
      }
    };

    const handleUserStopTyping = (data) => {
      if (selectedChat && data.chatId === selectedChat.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }
    };

    // Online status events
    const handleOnlineUsers = (users) => {
      const userMap = new Map();
      users.forEach(user => {
        userMap.set(user.userId, user.user);
      });
      setOnlineUsers(userMap);
    };

    const handleUserOnline = (data) => {
      setOnlineUsers(prev => new Map(prev).set(data.userId, data.user));
    };

    const handleUserOffline = (data) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    };

    // Notification events
    const handleNewMessageNotification = (data) => {
      // You could show a toast notification here
      console.log('New message notification:', data);
    };

    // Error handling
    const handleError = (error) => {
      console.error('Socket error:', error);
      setError(error.message || 'An error occurred');
    };

    // Attach event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);
    socket.on('online-users', handleOnlineUsers);
    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);
    socket.on('new-message-notification', handleNewMessageNotification);
    socket.on('error', handleError);

    // Check initial connection status
    if (socket.connected) {
      setConnectionStatus('connected');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
      socket.off('online-users', handleOnlineUsers);
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline', handleUserOffline);
      socket.off('new-message-notification', handleNewMessageNotification);
      socket.off('error', handleError);
    };
  }, [socket, selectedChat, currentUser]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const res = await apiRequest.post('/chats/send', {
        chatId: selectedChat.id,
        content: messageContent,
        receiverId: selectedChat.otherUser.id,
      });

      // The message will be added via socket event, no need to add here
      scrollToBottom();

      // Emit socket event for real-time delivery
      socket.emit('send-message', {
        chatId: selectedChat.id,
        content: messageContent,
        senderId: currentUser.id,
        receiverId: selectedChat.otherUser.id,
      });

      // Update chat list
      setChats(prev => 
        prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, latestMessage: res.data }
            : chat
        )
      );

      setError('');
    } catch (err) {
      console.log(err);
      setError('Failed to send message');
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleChatSelect = (chat) => {
    // Leave previous chat
    if (selectedChat && socket) {
      socket.emit('leave-chat', selectedChat.id);
    }

    setSelectedChat(chat);
    setMessages([]);
    setTypingUsers(new Set());
    setError('');
    
    // Join new chat room
    if (socket) {
      socket.emit('join-chat', chat.id);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedChat) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing event
      socket.emit('typing', {
        chatId: selectedChat.id,
        username: currentUser.username,
      });

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', {
          chatId: selectedChat.id,
        });
      }, 1000);
    }
  };

  const handleStopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (socket && selectedChat) {
      socket.emit('stop-typing', {
        chatId: selectedChat.id,
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  if (!currentUser) {
    return <div className="chat">Please log in to access chat.</div>;
  }

  return (
    <div className="chat">
      <div className="chatContainer">
        <div className="chatList">
          <div className="chatListHeader">
            <h2>Conversations</h2>
            <div className={`connectionStatus ${connectionStatus}`}>
              <span className="statusDot"></span>
              {connectionStatus === 'connected' && 'Online'}
              {connectionStatus === 'disconnected' && 'Offline'}
              {connectionStatus === 'error' && 'Error'}
            </div>
          </div>
          
          {error && <div className="error">{error}</div>}
          
          {chats.length === 0 ? (
            <p>No conversations yet. Start chatting with other users!</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chatItem ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat)}
              >
                <div className="avatarContainer">
                  <img
                    src={chat.otherUser?.avatar || '/noavatar.jpg'}
                    alt=""
                    className="avatar"
                  />
                  {isUserOnline(chat.otherUser?.id) && (
                    <div className="onlineIndicator"></div>
                  )}
                </div>
                <div className="chatInfo">
                  <div className="chatHeader">
                    <h3>{chat.otherUser?.username}</h3>
                    {isUserOnline(chat.otherUser?.id) && (
                      <span className="onlineText">Online</span>
                    )}
                  </div>
                  {chat.latestMessage && (
                    <p className="lastMessage">
                      {chat.latestMessage.content.length > 30
                        ? chat.latestMessage.content.substring(0, 30) + '...'
                        : chat.latestMessage.content}
                    </p>
                  )}
                </div>
                {chat.latestMessage && (
                  <span className="time">
                    {formatTime(chat.latestMessage.createdAt)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="chatBox">
          {selectedChat ? (
            <>
              <div className="chatHeader">
                <div className="avatarContainer">
                  <img
                    src={selectedChat.otherUser?.avatar || '/noavatar.jpg'}
                    alt=""
                    className="avatar"
                  />
                  {isUserOnline(selectedChat.otherUser?.id) && (
                    <div className="onlineIndicator"></div>
                  )}
                </div>
                <div className="userInfo">
                  <h3>{selectedChat.otherUser?.username}</h3>
                  <span className={`status ${isUserOnline(selectedChat.otherUser?.id) ? 'online' : 'offline'}`}>
                    {isUserOnline(selectedChat.otherUser?.id) ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="messages">
                {loading ? (
                  <div className="loading">Loading messages...</div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${
                          message.senderId === currentUser.id ? 'own' : ''
                        }`}
                      >
                        <div className="messageContent">
                          <p>{message.content}</p>
                          <span className="time">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {typingUsers.size > 0 && (
                      <div className="typing">
                        <div className="typingIndicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="typingText">
                          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                        </span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form className="messageInput" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onBlur={handleStopTyping}
                  disabled={connectionStatus !== 'connected'}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="noChat">
              <h3>Select a conversation to start chatting</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
