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
      className="cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 transition transform hover:scale-105 hover:shadow-lg max-w-[600px] w-full mx-auto"
    >
      {/* User Info */}
      <div className="flex items-center mb-3" onClick={handleProfileClick}>
        {question.user && question.user.profile_image ? (
          <img
            src={`http://localhost:8080/${question.user.profile_image}`}
            alt="User Profile"
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
        ) : (
          <FaUserCircle className="w-12 h-12 text-gray-400 mr-3" />
        )}
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {question.user?.name || "Anonymous"}
          </p>
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-3">
        <p className="text-gray-700 dark:text-gray-300">{question.content}</p>
      </div>

      {/* Question Stats */}
      <div className="flex space-x-6 text-gray-600 dark:text-gray-400 text-sm">
        <span className="flex items-center">
          <AiOutlineComment className="mr-1" /> {question.answer_count ?? 0} Comments
        </span>
        <span className="flex items-center">
          <AiOutlineHeart className="mr-1" /> {question.likes ?? 0} Likes
        </span>
      </div>
    </div>
  );
};

export default QuestionCard;
