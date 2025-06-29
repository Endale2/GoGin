import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    if (!user || !token) return;

    try {
      const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (user && token) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  };

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleMessage = (message) => {
    console.log('Received WebSocket message:', message);
    switch (message.type) {
      case 'vote':
        // Handle vote updates
        handleVoteUpdate(message.data);
        break;
      case 'comment':
        // Handle new comments
        handleNewComment(message.data);
        break;
      case 'reply':
        // Handle new replies
        handleNewReply(message.data);
        break;
      case 'user_joined':
        // Handle user joined
        handleUserJoined(message);
        break;
      case 'user_left':
        // Handle user left
        handleUserLeft(message);
        break;
      case 'online_users':
        // Handle initial online users list
        handleOnlineUsers(message.data);
        break;
      case 'typing':
        // Handle typing indicator
        handleTyping(message);
        break;
      case 'stop_typing':
        // Handle stop typing
        handleStopTyping(message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const handleVoteUpdate = (data) => {
    // Emit custom event for vote updates
    window.dispatchEvent(new CustomEvent('voteUpdate', { detail: data }));
  };

  const handleNewComment = (data) => {
    // Emit custom event for new comments
    window.dispatchEvent(new CustomEvent('newComment', { detail: data }));
  };

  const handleNewReply = (data) => {
    // Emit custom event for new replies
    window.dispatchEvent(new CustomEvent('newReply', { detail: data }));
  };

  const handleUserJoined = (message) => {
    console.log('User joined:', message);
    setOnlineUsers(prev => {
      const userExists = prev.find(u => u.id === message.user_id);
      if (!userExists) {
        const newUsers = [...prev, { id: message.user_id, username: message.username }];
        console.log('Updated online users:', newUsers);
        return newUsers;
      }
      return prev;
    });
  };

  const handleUserLeft = (message) => {
    console.log('User left:', message);
    setOnlineUsers(prev => {
      const newUsers = prev.filter(u => u.id !== message.user_id);
      console.log('Updated online users after user left:', newUsers);
      return newUsers;
    });
  };

  const handleOnlineUsers = (data) => {
    console.log('Received online users:', data);
    setOnlineUsers(data);
  };

  const handleTyping = (message) => {
    setTypingUsers(prev => ({
      ...prev,
      [message.user_id]: message.username
    }));
  };

  const handleStopTyping = (message) => {
    setTypingUsers(prev => {
      const newTypingUsers = { ...prev };
      delete newTypingUsers[message.user_id];
      return newTypingUsers;
    });
  };

  const sendTyping = (postId) => {
    sendMessage({
      type: 'typing',
      data: { post_id: postId }
    });
  };

  const sendStopTyping = (postId) => {
    sendMessage({
      type: 'stop_typing',
      data: { post_id: postId }
    });
  };

  // Connect when user logs in
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token]);

  const value = {
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTyping,
    sendStopTyping,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 