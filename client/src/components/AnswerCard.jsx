import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { InteractionBar } from './InteractionButtons';
import { useApp } from '../context/AppContext';
import ReplyTree from './ReplyTree';

const AnswerCard = ({ answer, questionId, onInteraction }) => {
  const { api } = useApp();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await api.likeAnswer(answer.id, questionId);
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error('Failed to like answer:', error);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();
    try {
      await api.dislikeAnswer(answer.id, questionId);
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error('Failed to dislike answer:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await api.createReply({
        content: replyContent,
        answer_id: answer.id,
        questionId: questionId
      });
      setReplyContent('');
      setShowReplyForm(false);
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-4">
      {/* User Info */}
      <div className="flex items-center mb-4">
        {answer.user?.profile_image ? (
          <img
            src={`http://localhost:8080/${answer.user.profile_image}`}
            alt="User Profile"
            className="w-10 h-10 rounded-full object-cover mr-3 ring-2 ring-blue-100 dark:ring-blue-900"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-3">
            <FaUserCircle className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {answer.user?.name || "Anonymous"}
          </p>
          {answer.created_at && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(answer.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Answer Content */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {answer.content}
        </p>
      </div>

      {/* Interaction Bar */}
      <div className="mb-4">
        <InteractionBar
          likesCount={answer.likes_count || 0}
          dislikesCount={answer.dislikes_count || 0}
          commentsCount={answer.replies?.length || 0}
          isLiked={answer.is_liked || false}
          isDisliked={answer.is_disliked || false}
          onLike={handleLike}
          onDislike={handleDislike}
          onComment={() => setShowReplyForm(!showReplyForm)}
          size="sm"
          showSave={false}
          showComments={true}
        />
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleReply} className="mb-4">
          <textarea
            rows={3}
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reply
            </button>
          </div>
        </form>
      )}

      {/* Replies */}
      {answer.replies && answer.replies.length > 0 && (
        <div className="ml-8 mt-4">
          <ReplyTree 
            replies={answer.replies} 
            answerId={answer.id} 
            questionId={questionId}
            onInteraction={onInteraction}
          />
        </div>
      )}
    </div>
  );
};

export default AnswerCard; 