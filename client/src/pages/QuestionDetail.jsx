import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiLoader, FiArrowLeft, FiSend } from "react-icons/fi";
import { AiOutlineLike, AiOutlineDislike, AiOutlineComment } from "react-icons/ai";
import { BsBookmark } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import axiosInstance from "../utils/axios";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [lastTypingTime, setLastTypingTime] = useState({});
  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchQuestionAndAnswers();
    // Set up real-time polling
    const interval = setInterval(fetchQuestionAndAnswers, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [answers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchQuestionAndAnswers = async () => {
    try {
      const [questionRes, answersRes] = await Promise.all([
        axiosInstance.get(`/questions/${id}`),
        axiosInstance.get(`/questions/${id}/answers`)
      ]);
      setQuestion(questionRes.data);
      setAnswers(answersRes.data);
    } catch (err) {
      console.error("Error fetching question details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    try {
      const { data: newAnswer } = await axiosInstance.post("/answers/", {
        question_id: id,
        content: answerContent
      });

      // Add user info to the new answer
      const newAnswerWithUser = {
        ...newAnswer,
        user: {
          id: newAnswer.user_id,
          name: "You",
          email: ""
        },
        replies: []
      };

      setAnswers(prev => [...prev, newAnswerWithUser]);
      setAnswerContent("");
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    try {
      const { data: newReply } = await axiosInstance.post("/replies/", {
        answer_id: replyingTo.answerId,
        content: replyContent,
        parent_reply_id: replyingTo.parentReplyId || null
      });

      // Add user info to the new reply
      const newReplyWithUser = {
        ...newReply,
        user: {
          id: newReply.user_id,
          name: "You",
          email: ""
        }
      };

      // Update the answers state to include the new reply
      setAnswers(prev => prev.map(answer => {
        if (answer.id === replyingTo.answerId) {
          return {
            ...answer,
            replies: [...(answer.replies || []), newReplyWithUser]
          };
        }
        return answer;
      }));

      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  };

  const handleLikeAnswer = async (answerId) => {
    try {
      await axiosInstance.post(`/answers/${answerId}/like`);
      setAnswers(prev => prev.map(answer => 
        answer.id === answerId ? { ...answer, likes: (answer.likes || 0) + 1 } : answer
      ));
    } catch (err) {
      console.error("Failed to like answer:", err);
    }
  };

  const handleDislikeAnswer = async (answerId) => {
    try {
      await axiosInstance.post(`/answers/${answerId}/dislike`);
      setAnswers(prev => prev.map(answer => 
        answer.id === answerId ? { ...answer, dislikes: (answer.dislikes || 0) + 1 } : answer
      ));
    } catch (err) {
      console.error("Failed to dislike answer:", err);
    }
  };

  const handleLikeReply = async (replyId) => {
    try {
      await axiosInstance.post(`/replies/${replyId}/like`);
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        replies: (answer.replies || []).map(reply => 
          reply.id === replyId ? { ...reply, likes: (reply.likes || 0) + 1 } : reply
        )
      })));
    } catch (err) {
      console.error("Failed to like reply:", err);
    }
  };

  const handleDislikeReply = async (replyId) => {
    try {
      await axiosInstance.post(`/replies/${replyId}/dislike`);
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        replies: (answer.replies || []).map(reply => 
          reply.id === replyId ? { ...reply, dislikes: (reply.dislikes || 0) + 1 } : reply
        )
      })));
    } catch (err) {
      console.error("Failed to dislike reply:", err);
    }
  };

  const handleTyping = () => {
    const userId = "current-user"; // In a real app, this would be the actual user ID
    setTypingUsers(prev => new Set([...prev, userId]));
    setLastTypingTime(prev => ({ ...prev, [userId]: Date.now() }));

    // Clear existing timeout
    if (typingTimeoutRef.current[userId]) {
      clearTimeout(typingTimeoutRef.current[userId]);
    }

    // Set new timeout to remove typing indicator
    typingTimeoutRef.current[userId] = setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }, 3000);
  };

  const renderReply = (reply, depth = 0, answerId) => (
    <div key={reply.id} className={`ml-${Math.min(depth * 4, 16)} border-l-2 border-gray-200 dark:border-gray-700 pl-4 mb-4`}>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center mb-2">
          {reply.user?.profile_image ? (
            <img
              src={`http://localhost:8080/${reply.user.profile_image}`}
              alt="User Profile"
              className="w-8 h-8 rounded-full object-cover mr-2"
            />
          ) : (
            <FaUserCircle className="w-8 h-8 text-gray-400 mr-2" />
          )}
          <div>
            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
              {question?.type === "vent" ? "Anonymous" : (reply.user?.name || "Anonymous")}
            </p>
            {reply.created_at && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(reply.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{reply.content}</p>
        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <button
            onClick={() => handleLikeReply(reply.id)}
            className="flex items-center hover:text-blue-600 transition-colors"
          >
            <AiOutlineLike className="mr-1" /> {reply.likes || 0}
          </button>
          <button
            onClick={() => handleDislikeReply(reply.id)}
            className="flex items-center hover:text-red-600 transition-colors"
          >
            <AiOutlineDislike className="mr-1" /> {reply.dislikes || 0}
          </button>
          <button
            onClick={() => setReplyingTo({ answerId, parentReplyId: reply.id })}
            className="flex items-center hover:text-green-600 transition-colors"
          >
            <AiOutlineComment className="mr-1" /> Reply
          </button>
        </div>
        {replyingTo?.parentReplyId === reply.id && (
          <form onSubmit={handleSubmitReply} className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => {
                setReplyContent(e.target.value);
                handleTyping();
              }}
              placeholder="Write a reply..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={2}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Reply
              </button>
            </div>
          </form>
        )}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-3">
            {reply.replies.map(childReply => renderReply(childReply, depth + 1, answerId))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600 dark:text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Question not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Questions
        </button>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            {question.user?.profile_image ? (
              <img
                src={`http://localhost:8080/${question.user.profile_image}`}
                alt="User Profile"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
            ) : (
              <FaUserCircle className="w-12 h-12 text-gray-400 mr-4" />
            )}
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {question.type === "vent" ? "Anonymous" : (question.user?.name || "Anonymous")}
              </p>
              {question.created_at && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(question.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {question.title && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {question.title}
            </h1>
          )}

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {question.content}
          </p>

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

          {/* Question Stats */}
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm">
            <div className="flex space-x-6">
              <span className="flex items-center">
                <AiOutlineComment className="mr-1" /> {answers.length} answers
              </span>
              <span className="flex items-center">
                <AiOutlineLike className="mr-1" /> {question.likes || 0}
              </span>
              <span className="flex items-center">
                <AiOutlineDislike className="mr-1" /> {question.dislikes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Typing Indicators */}
        {typingUsers.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <div className="flex space-x-1 mr-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">
                {typingUsers.size} user{typingUsers.size > 1 ? 's' : ''} typing...
              </span>
            </div>
          </div>
        )}

        {/* Answer Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Write an Answer
          </h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={answerContent}
              onChange={(e) => {
                setAnswerContent(e.target.value);
                handleTyping();
              }}
              placeholder="Share your thoughts..."
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={4}
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSend className="mr-2" />
                Post Answer
              </button>
            </div>
          </form>
        </div>

        {/* Answers */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h3>
          
          {answers.map((answer) => (
            <div key={answer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                {answer.user?.profile_image ? (
                  <img
                    src={`http://localhost:8080/${answer.user.profile_image}`}
                    alt="User Profile"
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                ) : (
                  <FaUserCircle className="w-10 h-10 text-gray-400 mr-3" />
                )}
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {question?.type === "vent" ? "Anonymous" : (answer.user?.name || "Anonymous")}
                  </p>
                  {answer.created_at && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(answer.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {answer.content}
              </p>

              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm mb-4">
                <div className="flex space-x-6">
                  <button
                    onClick={() => handleLikeAnswer(answer.id)}
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <AiOutlineLike className="mr-1" /> {answer.likes || 0}
                  </button>
                  <button
                    onClick={() => handleDislikeAnswer(answer.id)}
                    className="flex items-center hover:text-red-600 transition-colors"
                  >
                    <AiOutlineDislike className="mr-1" /> {answer.dislikes || 0}
                  </button>
                </div>
                <button
                  onClick={() => setReplyingTo({ answerId: answer.id })}
                  className="flex items-center hover:text-green-600 transition-colors"
                >
                  <AiOutlineComment className="mr-1" /> Reply
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo?.answerId === answer.id && !replyingTo?.parentReplyId && (
                <form onSubmit={handleSubmitReply} className="mt-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => {
                      setReplyContent(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Write a reply..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Reply
                    </button>
                  </div>
                </form>
              )}

              {/* Replies */}
              {answer.replies && answer.replies.length > 0 && (
                <div className="mt-4">
                  {answer.replies.map(reply => renderReply(reply, 0, answer.id))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default QuestionDetail;
