import React from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineComment, AiOutlineHeart } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";

const QuestionCard = ({ question }) => {
  const navigate = useNavigate();

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (question.user && question.user.id) {
      navigate(`/profile/${question.user.id}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/questions/${question.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4 transition-shadow hover:shadow-md w-full mx-auto max-w-3xl"
    >
      {/* User Info */}
      <div className="flex items-center mb-4" onClick={handleProfileClick}>
        {question.user && question.user.profile_image ? (
          <img
            src={`http://localhost:8080/${question.user.profile_image}`}
            alt="User Profile"
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        ) : (
          <FaUserCircle className="w-10 h-10 text-gray-400 mr-3" />
        )}
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">
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
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {question.content}
        </p>
      </div>

      {/* Question Stats */}
      <div className="flex space-x-6 text-gray-600 dark:text-gray-400 text-sm">
        <span className="flex items-center">
          <AiOutlineComment className="mr-1" /> {question.answer_count ?? 0}
        </span>
        <span className="flex items-center">
          <AiOutlineHeart className="mr-1" /> {question.likes ?? 0}
        </span>
      </div>
    </div>
  );
};

export default QuestionCard;
