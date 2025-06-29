import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { InteractionBar } from "./InteractionButtons";
import { useApp } from "../context/AppContext";

const QuestionCard = ({ question, onInteraction }) => {
  const navigate = useNavigate();
  const { api } = useApp();

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await api.likeQuestion(question.id);
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error("Failed to like question:", error);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();
    try {
      await api.dislikeQuestion(question.id);
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error("Failed to dislike question:", error);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      if (question.is_saved) {
        await api.unsaveQuestion(question.id);
      } else {
        await api.saveQuestion(question.id);
      }
      if (onInteraction) onInteraction();
    } catch (error) {
      console.error("Failed to save question:", error);
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    navigate(`/question/${question.id}`);
  };

  const handleCardClick = () => {
    navigate(`/question/${question.id}`);
  };

  return (
    <div
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* User Info */}
      <div className="flex items-center mb-4">
        {question.user?.profile_image ? (
          <img
            src={`http://localhost:8080/${question.user.profile_image}`}
            alt="User Profile"
            className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-blue-100 dark:ring-blue-900"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-4">
            <FaUserCircle className="w-8 h-8 text-white" />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {question.user?.name || "Anonymous"}
          </p>
          {question.created_at && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(question.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-4">
        {question.title && (
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {question.title}
          </h3>
        )}
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {question.content}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {question.course && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {question.course.title}
          </span>
        )}
        {question.university && (
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {question.university.name}
          </span>
        )}
        {question.department && (
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {question.department.name}
          </span>
        )}
        <span className={`inline-block text-xs px-2 py-1 rounded-full ${
          question.type === "vent" 
            ? "bg-red-100 text-red-800" 
            : "bg-gray-100 text-gray-800"
        }`}>
          {question.type === "vent" ? "Vent" : "Question"}
        </span>
      </div>

      {/* Interaction Bar */}
      <InteractionBar
        likesCount={question.likes_count || 0}
        dislikesCount={question.dislikes_count || 0}
        commentsCount={question.answer_count || 0}
        isLiked={question.is_liked || false}
        isDisliked={question.is_disliked || false}
        isSaved={question.is_saved || false}
        onLike={handleLike}
        onDislike={handleDislike}
        onSave={handleSave}
        onComment={handleComment}
        size="sm"
        showSave={true}
        showComments={true}
      />
    </div>
  );
};

export default QuestionCard;
