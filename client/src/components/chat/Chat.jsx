import { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { currentUser } = useContext(AuthContext);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await equest.get('/chats');
        setChats(res.data);
      } catch (err) {
        console.log(err);
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
         const token = localStorage.getItem("token");
        const res = await apiRequest.get(`/chats/${selectedChat.id}/messages`,
       {
      headers: {
        Authorization: `Bearer ${token}`, // Send as Bearer token
      },
    }
        );
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (message) => {
      if (selectedChat && message.chatId === selectedChat.id) {
        setMessages(prev => [...prev, message]);
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
    });

    socket.on('user-typing', (data) => {
      if (selectedChat && data.userId !== currentUser?.id) {
        setTypingUsers(prev => new Set(prev).add(data.username));
      }
    });

    socket.on('user-stop-typing', (data) => {
      if (selectedChat && data.userId !== currentUser?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [socket, selectedChat, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem("token");
      const res = await apiRequest.post('/chats/send', {
        chatId: selectedChat.id,
        content: newMessage,
        receiverId: selectedChat.otherUser.id,
      },{
      headers: {
        Authorization: `Bearer ${token}`, // Send as Bearer token
      },
    });

      // Add message to local state
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      scrollToBottom();

      // Emit socket event with sender name
      if (socket) {
        socket.emit('send-message', {
          chatId: selectedChat.id,
          content: newMessage,
          senderId: currentUser.id,
          senderName: currentUser.username,
          receiverId: selectedChat.otherUser.id,
        });
      }

      // Update chat list
      setChats(prev => 
        prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, latestMessage: res.data }
            : chat
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
    setTypingUsers(new Set());
    
    // Join chat room
    if (socket) {
      socket.emit('join-chat', chat.id);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedChat) {
      socket.emit('typing', {
        chatId: selectedChat.id,
        username: currentUser.username,
      });
    }
  };

  const handleStopTyping = () => {
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

  if (!currentUser) {
    return <div className="chat">Please log in to access chat.</div>;
  }

  return (
    <div className="chat">
      <div className="chatContainer">
        <div className="chatList">
          <h2>Conversations</h2>
          {chats.length === 0 ? (
            <p>No conversations yet. Start chatting with other users!</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chatItem ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat)}
              >
                <img
                  src={chat.otherUser?.avatar || '/noavatar.jpg'}
                  alt=""
                  className="avatar"
                />
                <div className="chatInfo">
                  <h3>{chat.otherUser?.username}</h3>
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
                <img
                  src={selectedChat.otherUser?.avatar || '/noavatar.jpg'}
                  alt=""
                  className="avatar"
                />
                <h3>{selectedChat.otherUser?.username}</h3>
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
                        {Array.from(typingUsers).join(', ')} is typing...
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
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="noChat">
              <h3>Select a conversation to start chatting</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
