import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { AiOutlineComment, AiOutlineHeart } from "react-icons/ai";

const QuestionDetail = () => {
  const { id } = useParams();
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
        setAnswers(answersRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionDetails();
  }, [id]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    try {
      const { data: newAnswer } = await axiosInstance.post("/answers/", {
        content: answerContent,
        question_id: id,
      });

      // Add new answer to the list dynamically
      setAnswers((prevAnswers) => [newAnswer, ...prevAnswers]);
      setAnswerContent("");
    } catch (error) {
      console.error("Failed to post answer:", error);
      setError("Could not post answer. Try again.");
    }
  };

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200">
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
        <form onSubmit={handleAnswerSubmit}>
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

      {/* Answers List */}
      <div className="mt-6 space-y-4">
        {answers.length > 0 ? (
          answers.map((answer) => (
            <div key={answer._id || answer.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm">{answer.content}</p>
              <p className="text-xs text-gray-500">By {answer.user?.name || "Unknown User"}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No answers yet.</p>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
