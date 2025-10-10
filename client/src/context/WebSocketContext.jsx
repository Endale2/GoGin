import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from '../authContext';

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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [lastClose, setLastClose] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const getWsBase = () => {
    // Prefer explicit env var VITE_WS_URL (e.g. ws://localhost:8080/ws)
    const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_URL) || null;
    if (envUrl) return envUrl;

    const loc = window.location;
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = loc.hostname || 'localhost';
    // default backend port
    const port = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_PORT) || '8080';
    return `${protocol}//${host}:${port}/ws`;
  };

  const connect = () => {
    if (!user || !token) {
      console.log('WebSocket connect skipped, missing user or token', { user, token });
      return;
    }

    try {
      // Build URL at connect time so token is fresh
      const base = getWsBase();
      const separator = base.includes('?') ? '&' : '?';
      const url = `${base}${separator}token=${encodeURIComponent(token)}`;

      // Close previous socket if any
      if (wsRef.current) {
        try { wsRef.current.close(); } catch (e) { /* ignore */ }
        wsRef.current = null;
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to', url);
        setIsConnected(true);
        // reset reconnect attempts
        reconnectAttemptsRef.current = 0;
        setReconnectAttempts(0);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const raw = event.data.toString();
          const parts = raw.split('\n').map(p => p.trim()).filter(Boolean);
          for (const part of parts) {
            let parsed;
            try {
              parsed = JSON.parse(part);
            } catch (e) {
              console.error('Error parsing part of WebSocket message:', e, part);
              continue;
            }

            if (Array.isArray(parsed)) {
              for (const msg of parsed) handleMessage(msg);
            } else {
              handleMessage(parsed);
            }
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };

      ws.onclose = (evt) => {
        console.log('WebSocket disconnected', evt && evt.code ? `code=${evt.code}` : '');
        setIsConnected(false);
        setLastClose({ code: evt?.code, reason: evt?.reason });

        // Schedule reconnect with exponential backoff
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectAttemptsRef.current = Math.min((reconnectAttemptsRef.current || 0) + 1, 10);
        setReconnectAttempts(reconnectAttemptsRef.current);
        const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttemptsRef.current - 1));
        reconnectTimeoutRef.current = setTimeout(() => {
          if (user && token) connect();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setLastError(error?.toString ? error.toString() : String(error));
        // some environments don't trigger onclose after error; ensure socket is closed to trigger reconnect logic
        try { ws.close(); } catch (e) { /* ignore */ }
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
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket not open, cannot send message');
      }
    } catch (err) {
      console.error('Error sending WebSocket message:', err);
      setLastError(err?.toString ? err.toString() : String(err));
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
    connect,
    disconnect,
    reconnectAttempts,
    lastError,
    lastClose,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 