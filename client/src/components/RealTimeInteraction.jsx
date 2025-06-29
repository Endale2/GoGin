import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

export const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    // Return default values when context is not available
    return {
      voteUpdates: {},
      newComments: [],
      newReplies: [],
      isConnected: false
    };
  }
  return context;
};

const RealTimeInteraction = ({ children }) => {
  const { isConnected } = useWebSocket();
  const [voteUpdates, setVoteUpdates] = useState({});
  const [newComments, setNewComments] = useState([]);
  const [newReplies, setNewReplies] = useState([]);

  useEffect(() => {
    // Listen for vote updates
    const handleVoteUpdate = (event) => {
      const { post_id, comment_id, vote_type, upvotes, downvotes, score } = event.detail;
      if (post_id) {
        setVoteUpdates(prev => ({ ...prev, [post_id]: { vote_type, upvotes, downvotes, score } }));
      }
      if (comment_id) {
        setVoteUpdates(prev => ({ ...prev, [comment_id]: { vote_type, upvotes, downvotes, score } }));
      }
    };
    const handleNewComment = (event) => {
      const { comment, post_id } = event.detail;
      setNewComments(prev => [...prev, { comment, post_id }]);
    };
    const handleNewReply = (event) => {
      const { reply, comment_id } = event.detail;
      setNewReplies(prev => [...prev, { reply, comment_id }]);
    };
    window.addEventListener('voteUpdate', handleVoteUpdate);
    window.addEventListener('newComment', handleNewComment);
    window.addEventListener('newReply', handleNewReply);
    return () => {
      window.removeEventListener('voteUpdate', handleVoteUpdate);
      window.removeEventListener('newComment', handleNewComment);
      window.removeEventListener('newReply', handleNewReply);
    };
  }, []);

  // Clear updates after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setVoteUpdates({});
      setNewComments([]);
      setNewReplies([]);
    }, 5000);
    return () => clearTimeout(timer);
  }, [voteUpdates, newComments, newReplies]);

  const value = { voteUpdates, newComments, newReplies, isConnected };

  return (
    <RealTimeContext.Provider value={value}>
      {/* WebSocket Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
        <span className="text-xs text-gray-600 ml-2">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
      {children}
    </RealTimeContext.Provider>
  );
};

export default RealTimeInteraction; 