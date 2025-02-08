import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { AiOutlineComment, AiOutlineHeart } from "react-icons/ai";
import { FaArrowLeft } from "react-icons/fa";

// Helper to generate an avatar URL (using a placeholder service)
const getAvatarUrl = (userId) => {
  return userId ? `https://i.pravatar.cc/50?u=${userId}` : "https://i.pravatar.cc/50?u=default";
};

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State variables
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({}); // tracks expanded state per answer id
  const [answerContent, setAnswerContent] = useState("");

  // Fetch question and answers with enriched replies and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch question and its answers concurrently
        const [questionRes, answersRes] = await Promise.all([
          axiosInstance.get(`/questions/${id}`),
          axiosInstance.get(`/answers/question/${id}`)
        ]);

        // Enrich each answer with its replies and fetch user data for each reply
        const enrichedAnswers = await Promise.all(
          answersRes.data.map(async (answer) => {
            // Fetch replies for this answer (using answer.id as projected by your aggregation)
            const replyRes = await axiosInstance.get(`/replies/answer/${answer.id}`);
            const repliesData = replyRes.data || [];

            // Enrich each reply with user data if not already present
            const enrichedReplies = await Promise.all(
              repliesData.map(async (reply) => {
                if (!reply.user && reply.user_id) {
                  try {
                    const userRes = await axiosInstance.get(`/users/${reply.user_id}`);
                    reply.user = userRes.data;
                  } catch (err) {
                    console.error("Error fetching user for reply", reply.user_id, err);
                    reply.user = { id: reply.user_id, name: "Unknown User" };
                  }
                }
                return reply;
              })
            );
            return { ...answer, replies: enrichedReplies };
          })
        );

        setQuestion(questionRes.data);
        setAnswers(enrichedAnswers);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle posting a new answer
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    try {
      const { data: newAnswer } = await axiosInstance.post("/answers/", {
        content: answerContent,
        question_id: id
      });
      // Enrich newAnswer with user data if not present
      if (!newAnswer.user && newAnswer.user_id) {
        try {
          const userRes = await axiosInstance.get(`/users/${newAnswer.user_id}`);
          newAnswer.user = userRes.data;
        } catch (err) {
          console.error("Error fetching user for new answer", newAnswer.user_id, err);
          newAnswer.user = { id: newAnswer.user_id, name: "Unknown User" };
        }
      }
      // Prepend the new answer
      setAnswers([newAnswer, ...answers]);
      setAnswerContent("");
    } catch (err) {
      console.error("Failed to post answer:", err);
      setError("Could not post answer. Try again.");
    }
  };

  // Handle posting a new reply for a given answer
  const handleReplySubmit = async (e, answerId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      const { data: newReply } = await axiosInstance.post("/replies/", {
        content: replyContent,
        answer_id: answerId
      });
      // Enrich new reply with user data if not present
      if (!newReply.user && newReply.user_id) {
        try {
          const userRes = await axiosInstance.get(`/users/${newReply.user_id}`);
          newReply.user = userRes.data;
        } catch (err) {
          console.error("Error fetching user for new reply", newReply.user_id, err);
          newReply.user = { id: newReply.user_id, name: "Unknown User" };
        }
      }
      // Update the corresponding answer's replies in state
      setAnswers((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer.id === answerId
            ? { ...answer, replies: [...(answer.replies || []), newReply] }
            : answer
        )
      );
      setReplyContent("");
      setSelectedAnswer(null);
    } catch (err) {
      console.error("Failed to post reply:", err);
      setError("Could not post reply. Try again.");
    }
  };

  if (loading) return <div className="text-center py-6">Loading...</div>;
  if (error) return <div className="text-center py-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-blue-600">
        <FaArrowLeft className="mr-2" /> Back
      </button>

      {/* Question Section */}
      {question && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-start">
          <img 
            src={getAvatarUrl(question.user?.id || question.user_id)} 
            alt="avatar" 
            className="w-12 h-12 rounded-full mr-4" 
          />
          <div>
            <h2 className="text-2xl font-semibold">{question.content}</h2>
            <p className="text-sm text-gray-500 mt-1">By {question.user?.name || "Unknown User"}</p>
          </div>
        </div>
      )}

      {/* Answer Count & Answer Form */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Answers ({answers.length})</h3>
        </div>
        <form onSubmit={handleAnswerSubmit} className="mb-6">
          <textarea
            className="w-full p-3 border rounded-md dark:bg-gray-900"
            rows="4"
            placeholder="Write your answer..."
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Post Answer
          </button>
        </form>
      </div>

      {/* Answers List */}
      {answers?.length > 0 ? (
        answers.map((answer) => (
          <div key={answer.id} className="bg-white dark:bg-gray-800 p-6 mt-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <img 
                  src={getAvatarUrl(answer.user?.id || answer.user_id)} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-full mr-4" 
                />
                <div>
                  <p className="text-lg">{answer.content}</p>
                  <p className="text-sm text-gray-500 mt-1">By {answer.user?.name || "Unknown User"}</p>
                </div>
              </div>
              <div className="flex flex-col items-end text-gray-600">
                <span className="flex items-center mb-1">
                  <AiOutlineHeart className="mr-1" /> {answer.likes || 0}
                </span>
                <span
                  className="flex items-center cursor-pointer"
                  onClick={() =>
                    setSelectedAnswer(answer.id === selectedAnswer ? null : answer.id)
                  }
                >
                  <AiOutlineComment className="mr-1" /> {answer.replies?.length || 0} Replies
                </span>
              </div>
            </div>

            {/* Reply Form for selected answer */}
            {selectedAnswer === answer.id && (
              <form onSubmit={(e) => handleReplySubmit(e, answer.id)} className="mt-4">
                <textarea
                  className="w-full p-3 border rounded-md dark:bg-gray-900"
                  rows="3"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  required
                ></textarea>
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Post Reply
                </button>
              </form>
            )}

            {/* Replies List with Dropdown for More Replies */}
            {answer.replies?.length > 0 && (
              <div className="mt-6 ml-6 border-l-2 border-gray-300 pl-4">
                {(expandedReplies[answer.id]
                  ? answer.replies
                  : answer.replies.slice(0, 2)
                ).map((reply) => (
                  <div
                    key={reply.id || reply._id}
                    className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-start">
                      <img 
                        src={getAvatarUrl(reply.user?.id || reply.user_id)} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full mr-3" 
                      />
                      <div>
                        <p className="text-base">{reply.content}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          By {reply.user?.name || "Unknown User"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {answer.replies.length > 2 && (
                  <button
                    onClick={() =>
                      setExpandedReplies((prev) => ({
                        ...prev,
                        [answer.id]: !prev[answer.id]
                      }))
                    }
                    className="mt-2 text-blue-600 text-sm focus:outline-none"
                  >
                    {expandedReplies[answer.id]
                      ? "Show less replies"
                      : `Show ${answer.replies.length - 2} more replies`}
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 mt-4">No answers yet.</p>
      )}
    </div>
  );
};

export default QuestionDetail;
