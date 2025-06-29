import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { LikeDislikeButtons } from './InteractionButtons';
import { commentsAPI } from '../api/comments';

const RealTimeComment = ({ comment, postId, onCommentUpdate }) => {
  const { sendTyping, sendStopTyping, typingUsers } = useWebSocket();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const typingTimeoutRef = useRef(null);

  // Handle typing indicator
  const handleTyping = () => {
    sendTyping(postId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping(postId);
    }, 3000);
  };

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const newReply = await commentsAPI.createComment(postId, {
        content: replyContent,
        parent_id: comment._id
      });
      
      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
      setIsReplying(false);
      sendStopTyping(postId);
      
      if (onCommentUpdate) {
        onCommentUpdate();
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle vote
  const handleVote = async (voteType) => {
    try {
      await commentsAPI.voteComment(comment._id, voteType);
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
      {/* Comment Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {comment.author?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {comment.author?.email || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Comment Content */}
      <div className="mb-3">
        <p className="text-gray-800">{comment.content}</p>
      </div>

      {/* Comment Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <LikeDislikeButtons
            id={comment._id}
            likesCount={comment.upvotes || 0}
            dislikesCount={comment.downvotes || 0}
            onLike={() => handleVote('upvote')}
            onDislike={() => handleVote('downvote')}
            size="sm"
          />
          
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Reply
          </button>
          
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {showReplies ? 'Hide' : 'Show'} {replies.length} replies
            </button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-4">
          <textarea
            value={replyContent}
            onChange={(e) => {
              setReplyContent(e.target.value);
              handleTyping();
            }}
            onBlur={() => sendStopTyping(postId)}
            placeholder="Write a reply..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-gray-500">
              {Object.keys(typingUsers).length > 0 && (
                <span>{Object.values(typingUsers).join(', ')} is typing...</span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                  sendStopTyping(postId);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-4 ml-8 space-y-3">
          {replies.map((reply) => (
            <RealTimeComment
              key={reply._id}
              comment={reply}
              postId={postId}
              onCommentUpdate={onCommentUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RealTimeComment; 