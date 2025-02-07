import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { AiOutlineComment, AiOutlineHeart } from "react-icons/ai";
import { FaArrowLeft } from "react-icons/fa";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const [questionRes, answersRes] = await Promise.all([
          axiosInstance.get(`/questions/${id}`),
          axiosInstance.get(`/answers/question/${id}`),
        ]);
        setQuestion(questionRes.data);
        setAnswers(formatAnswers(answersRes.data));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionDetails();
  }, [id]);

  const formatAnswers = (answers) => {
    const answerMap = {};
    answers.forEach((answer) => (answerMap[answer._id] = { ...answer, replies: [] }));
    
    const rootAnswers = [];
    answers.forEach((answer) => {
      if (answer.parent_id) {
        answerMap[answer.parent_id]?.replies.push(answerMap[answer._id]);
      } else {
        rootAnswers.push(answerMap[answer._id]);
      }
    });

    return rootAnswers;
  };

  const handleAnswerSubmit = async (e, parentId = null) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    try {
      const { data: newAnswer } = await axiosInstance.post("/answers/", {
        content: answerContent,
        question_id: id,
        parent_id: parentId,
      });

      setAnswers((prevAnswers) => formatAnswers([...prevAnswers, newAnswer]));
      setAnswerContent("");
    } catch (error) {
      console.error("Failed to post answer:", error);
      setError("Could not post answer. Try again.");
    }
  };

  if (loading) return <div className="text-center py-6">Loading...</div>;
  if (error) return <div className="text-center py-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-blue-600">
        <FaArrowLeft className="mr-2" /> Back
      </button>

      {/* Question Section */}
      {question ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">{question.content}</h2>
          <p className="text-sm text-gray-500">{question.user?.name || "Unknown User"}</p>
          <div className="mt-4 flex space-x-4 text-gray-600">
            <span className="flex items-center">
              <AiOutlineHeart className="mr-1" /> {Math.floor(Math.random() * 100)} Saves
            </span>
            <span className="flex items-center">
              <AiOutlineComment className="mr-1" /> {answers.length} Comments
            </span>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Question not found.</p>
      )}

      {/* Answer Form */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <form onSubmit={(e) => handleAnswerSubmit(e)}>
          <textarea
            className="w-full p-3 border rounded-md dark:bg-gray-900"
            rows="3"
            placeholder="Write an answer..."
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            required
          />
          <button
            type="submit"
            className="mt-2 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Post Answer
          </button>
        </form>
      </div>

      {/* Answers Section */}
      <div className="mt-6 space-y-4">
        {answers.length > 0 ? (
          answers.map((answer) => <AnswerTree key={answer._id} answer={answer} handleAnswerSubmit={handleAnswerSubmit} />)
        ) : (
          <p className="text-gray-500 text-center">No answers yet.</p>
        )}
      </div>
    </div>
  );
};

// Recursive Answer Tree Component
const AnswerTree = ({ answer, handleAnswerSubmit, level = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  return (
    <div className={`ml-${level * 4} bg-white dark:bg-gray-800 p-4 rounded-lg shadow mt-2`}>
      <p className="text-sm">{answer.content}</p>
      <p className="text-xs text-gray-500">By {answer.user?.name || "Unknown User"}</p>

      <button
        onClick={() => setShowReplyForm(!showReplyForm)}
        className="text-blue-600 text-xs mt-2"
      >
        Reply
      </button>

      {showReplyForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnswerSubmit(e, answer._id);
            setReplyContent("");
            setShowReplyForm(false);
          }}
          className="mt-2"
        >
          <textarea
            className="w-full p-2 border rounded-md dark:bg-gray-900 text-sm"
            rows="2"
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
          />
          <button
            type="submit"
            className="mt-1 py-1 px-3 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
          >
            Post Reply
          </button>
        </form>
      )}

      {/* Render replies recursively */}
      {answer.replies.length > 0 && (
        <div className="ml-4 mt-2 border-l-2 border-gray-300 pl-2">
          {answer.replies.map((reply) => (
            <AnswerTree key={reply._id} answer={reply} handleAnswerSubmit={handleAnswerSubmit} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;
