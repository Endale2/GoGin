import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { LikeDislikeButtons } from './InteractionButtons';
import { useApp } from '../context/AppContext';

const ReplyTree = ({ replies, answerId, questionId, onInteraction, depth = 0 }) => {
  const { api } = useApp();
  const [showReplyForm, setShowReplyForm] = useState({});
  const [replyContent, setReplyContent] = useState({});

  const handleLike = async (replyId, e) => {
    e.stopPropagation();
    try {
      await api.likeReply(replyId, answerId, questionId);
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  const handleDislike = async (replyId, e) => {
    e.stopPropagation();
    try {
      await api.dislikeReply(replyId, answerId, questionId);
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error('Failed to dislike reply:', error);
    }
  };

  const handleReply = async (parentReplyId, e) => {
    e.preventDefault();
    const content = replyContent[parentReplyId];
    if (!content?.trim()) return;

    try {
      await api.createReply({
        content: content,
        answer_id: answerId,
        parent_reply_id: parentReplyId,
        questionId: questionId
      });
      setReplyContent(prev => ({ ...prev, [parentReplyId]: '' }));
      setShowReplyForm(prev => ({ ...prev, [parentReplyId]: false }));
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  const toggleReplyForm = (replyId) => {
    setShowReplyForm(prev => ({ ...prev, [replyId]: !prev[replyId] }));
  };

  const maxDepth = 3; // Limit nesting depth to prevent UI issues

  return (
    <div className="space-y-3">
      {replies.map((reply) => (
        <div key={reply.id} className="relative">
          {/* Reply Content */}
          <div className="bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
            {/* User Info */}
            <div className="flex items-center mb-3">
              {reply.user?.profile_image ? (
                <img
                  src={`http://localhost:8080/${reply.user.profile_image}`}
                  alt="User Profile"
                  className="w-8 h-8 rounded-full object-cover mr-2 ring-1 ring-blue-100 dark:ring-blue-900"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mr-2">
                  <FaUserCircle className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                  {reply.user?.name || "Anonymous"}
                </p>
                {reply.created_at && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(reply.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Reply Text */}
            <div className="mb-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {reply.content}
              </p>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center justify-between">
              <LikeDislikeButtons
                likesCount={reply.likes_count || 0}
                dislikesCount={reply.dislikes_count || 0}
                isLiked={reply.is_liked || false}
                isDisliked={reply.is_disliked || false}
                onLike={(e) => handleLike(reply.id, e)}
                onDislike={(e) => handleDislike(reply.id, e)}
                size="sm"
                showCounts={true}
              />
              
              {depth < maxDepth && (
                <button
                  onClick={() => toggleReplyForm(reply.id)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Reply
                </button>
              )}
            </div>

            {/* Reply Form */}
            {showReplyForm[reply.id] && depth < maxDepth && (
              <form onSubmit={(e) => handleReply(reply.id, e)} className="mt-3">
                <textarea
                  rows={2}
                  placeholder="Write a reply..."
                  value={replyContent[reply.id] || ''}
                  onChange={(e) => setReplyContent(prev => ({ 
                    ...prev, 
                    [reply.id]: e.target.value 
                  }))}
                  className="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => toggleReplyForm(reply.id)}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent[reply.id]?.trim()}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Nested Replies */}
          {reply.replies && reply.replies.length > 0 && depth < maxDepth && (
            <div className="ml-6 mt-3 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
              <ReplyTree
                replies={reply.replies}
                answerId={answerId}
                questionId={questionId}
                onInteraction={onInteraction}
                depth={depth + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReplyTree; 