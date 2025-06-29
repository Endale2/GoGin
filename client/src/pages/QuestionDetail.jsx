import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiLoader, FiArrowLeft } from "react-icons/fi";
import { AiOutlineComment, AiOutlineHeart, AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { FaUserCircle, FaReply } from "react-icons/fa";
import axiosInstance from "../utils/axios";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState("");
  const [newReply, setNewReply] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  const fetchQuestionAndAnswers = async () => {
    try {
      const [questionRes, answersRes] = await Promise.all([
        axiosInstance.get(`/questions/${id}`),
        axiosInstance.get(`/questions/${id}/answers`)
      ]);
      setQuestion(questionRes.data);
      setAnswers(answersRes.data || []);
    } catch (err) {
      console.error("Error fetching question details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      const response = await axiosInstance.post(`/questions/${id}/answers`, {
        content: newAnswer,
        question_id: id
      });
      
      // Add the new answer to the beginning of the list
      const newAnswerWithUser = {
        ...response.data,
        user: {
          id: response.data.user_id,
          name: "You", // This will be updated when we refetch
          email: ""
        }
      };
      
      setAnswers(prev => [newAnswerWithUser, ...prev]);
      setNewAnswer("");
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
  };

  const handleSubmitReply = async (answerId, e) => {
    e.preventDefault();
    const replyContent = newReply[answerId];
    if (!replyContent?.trim()) return;

    try {
      const response = await axiosInstance.post(`/answers/${answerId}/replies`, {
        content: replyContent
      });
      
      // Update the answers state to include the new reply
      setAnswers(prev => prev.map(answer => {
        if (answer.id === answerId) {
          return {
            ...answer,
            replies: [...(answer.replies || []), response.data]
          };
        }
        return answer;
      }));
      
      setNewReply(prev => ({ ...prev, [answerId]: "" }));
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  };

  const handleLike = async (answerId) => {
    try {
      await axiosInstance.post(`/answers/${answerId}/like`);
      // Update the like count in the UI
      setAnswers(prev => prev.map(answer => {
        if (answer.id === answerId) {
          return { ...answer, likes: (answer.likes || 0) + 1 };
        }
        return answer;
      }));
    } catch (err) {
      console.error("Failed to like answer:", err);
    }
  };

  const handleDislike = async (answerId) => {
    try {
      await axiosInstance.post(`/answers/${answerId}/dislike`);
      // Update the dislike count in the UI
      setAnswers(prev => prev.map(answer => {
        if (answer.id === answerId) {
          return { ...answer, dislikes: (answer.dislikes || 0) + 1 };
        }
        return answer;
      }));
    } catch (err) {
      console.error("Failed to dislike answer:", err);
    }
  };

  const ReplyTree = ({ replies, depth = 0 }) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div className={`ml-${Math.min(depth * 4, 16)} space-y-3`}>
        {replies.map((reply) => (
          <div key={reply.id} className="border-l-2 border-gray-200 pl-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-2">
                {reply.user?.profile_image ? (
                  <img
                    src={`http://localhost:8080/${reply.user.profile_image}`}
                    alt="User Profile"
                    className="w-6 h-6 rounded-full object-cover mr-2"
                  />
                ) : (
                  <FaUserCircle className="w-6 h-6 text-gray-400 mr-2" />
                )}
                <span className="font-medium text-sm text-gray-700">
                  {reply.user?.name || "Anonymous"}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(reply.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <button
                  onClick={() => handleLike(reply.id)}
                  className="flex items-center hover:text-blue-600"
                >
                  <AiOutlineLike className="mr-1" />
                  {reply.likes || 0}
                </button>
                <button
                  onClick={() => handleDislike(reply.id)}
                  className="flex items-center hover:text-red-600"
                >
                  <AiOutlineDislike className="mr-1" />
                  {reply.dislikes || 0}
                </button>
                <button
                  onClick={() => setReplyingTo(reply.id)}
                  className="flex items-center hover:text-green-600"
                >
                  <FaReply className="mr-1" />
                  Reply
                </button>
              </div>
              
              {replyingTo === reply.id && (
                <form
                  onSubmit={(e) => handleSubmitReply(reply.id, e)}
                  className="mt-3"
                >
                  <textarea
                    value={newReply[reply.id] || ""}
                    onChange={(e) => setNewReply(prev => ({ ...prev, [reply.id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="w-full p-2 border rounded text-sm"
                    rows="2"
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              
              {reply.replies && reply.replies.length > 0 && (
                <ReplyTree replies={reply.replies} depth={depth + 1} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Question not found</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Questions
        </button>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            {question.user?.profile_image ? (
              <img
                src={`http://localhost:8080/${question.user.profile_image}`}
                alt="User Profile"
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
            ) : (
              <FaUserCircle className="w-12 h-12 text-gray-400 mr-3" />
            )}
            <div>
              <p className="font-medium text-gray-800">
                {question.user?.name || "Anonymous"}
              </p>
              {question.created_at && (
                <p className="text-sm text-gray-500">
                  {new Date(question.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-800 mb-3">
              {question.content}
            </h1>
            {question.course && (
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {question.course.title}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-6 text-gray-600 text-sm">
            <span className="flex items-center">
              <AiOutlineComment className="mr-1" />
              {answers.length} answers
            </span>
            <span className="flex items-center">
              <AiOutlineHeart className="mr-1" />
              {question.likes || 0} likes
            </span>
          </div>
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Answer</h2>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer..."
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
            <button
              type="submit"
              className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Answer
            </button>
          </form>
        </div>

        {/* Answers */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
          
          {answers.map((answer) => (
            <div key={answer.id} className="bg-white rounded-lg shadow-sm p-6">
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
                  <p className="font-medium text-gray-800">
                    {answer.user?.name || "Anonymous"}
                  </p>
                  {answer.created_at && (
                    <p className="text-sm text-gray-500">
                      {new Date(answer.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{answer.content}</p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <button
                  onClick={() => handleLike(answer.id)}
                  className="flex items-center hover:text-blue-600"
                >
                  <AiOutlineLike className="mr-1" />
                  {answer.likes || 0}
                </button>
                <button
                  onClick={() => handleDislike(answer.id)}
                  className="flex items-center hover:text-red-600"
                >
                  <AiOutlineDislike className="mr-1" />
                  {answer.dislikes || 0}
                </button>
                <button
                  onClick={() => setReplyingTo(answer.id)}
                  className="flex items-center hover:text-green-600"
                >
                  <FaReply className="mr-1" />
                  Reply
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === answer.id && (
                <form
                  onSubmit={(e) => handleSubmitReply(answer.id, e)}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
                >
                  <textarea
                    value={newReply[answer.id] || ""}
                    onChange={(e) => setNewReply(prev => ({ ...prev, [answer.id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <div className="flex space-x-2 mt-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reply Tree */}
              <ReplyTree replies={answer.replies || []} />
            </div>
          ))}

          {answers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No answers yet. Be the first to answer!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
