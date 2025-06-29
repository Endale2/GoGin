import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import AnswerCard from "../components/AnswerCard";
import { InteractionBar } from "../components/InteractionButtons";
import axiosInstance from "../utils/axios";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useApp();
  
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch question and answers
  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        const [questionRes, answersRes] = await Promise.all([
          axiosInstance.get(`/questions/${id}`),
          axiosInstance.get(`/questions/${id}/answers`)
        ]);
        
        setQuestion(questionRes.data);
        setAnswers(answersRes.data || []);
      } catch (err) {
        console.error("Error fetching question data:", err);
        setError("Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [id]);

  // Set up real-time polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [questionRes, answersRes] = await Promise.all([
          axiosInstance.get(`/questions/${id}`),
          axiosInstance.get(`/questions/${id}/answers`)
        ]);
        
        setQuestion(questionRes.data);
        setAnswers(answersRes.data || []);
      } catch (err) {
        console.error("Error polling question data:", err);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await api.likeQuestion(id);
      setQuestion(prev => ({ ...prev, ...response }));
    } catch (error) {
      console.error("Failed to like question:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await api.dislikeQuestion(id);
      setQuestion(prev => ({ ...prev, ...response }));
    } catch (error) {
      console.error("Failed to dislike question:", error);
    }
  };

  const handleSave = async () => {
    try {
      let response;
      if (question.is_saved) {
        response = await api.unsaveQuestion(id);
      } else {
        response = await api.saveQuestion(id);
      }
      setQuestion(prev => ({ ...prev, ...response }));
    } catch (error) {
      console.error("Failed to save question:", error);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    setSubmitting(true);
    try {
      await api.createAnswer({
        content: answerContent,
        question_id: id
      });
      setAnswerContent("");
      
      // Refresh answers
      const answersRes = await axiosInstance.get(`/questions/${id}/answers`);
      setAnswers(answersRes.data || []);
    } catch (error) {
      console.error("Failed to create answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInteraction = async () => {
    // Refresh data after interaction
    try {
      const [questionRes, answersRes] = await Promise.all([
        axiosInstance.get(`/questions/${id}`),
        axiosInstance.get(`/questions/${id}/answers`)
      ]);
      
      setQuestion(questionRes.data);
      setAnswers(answersRes.data || []);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Question not found"}
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Questions
        </button>

        {/* Question */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 mb-8">
          {/* User Info */}
          <div className="flex items-center mb-6">
            {question.user?.profile_image ? (
              <img
                src={`http://localhost:8080/${question.user.profile_image}`}
                alt="User Profile"
                className="w-14 h-14 rounded-full object-cover mr-4 ring-2 ring-blue-100 dark:ring-blue-900"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-4">
                <FaUserCircle className="w-10 h-10 text-white" />
              </div>
            )}
            <div>
              <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                {question.user?.name || "Anonymous"}
              </p>
              {question.created_at && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(question.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="mb-6">
            {question.title && (
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                {question.title}
              </h1>
            )}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {question.content}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {question.course && (
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {question.course.title}
              </span>
            )}
            {question.university && (
              <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                {question.university.name}
              </span>
            )}
            {question.department && (
              <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                {question.department.name}
              </span>
            )}
            <span className={`inline-block text-sm px-3 py-1 rounded-full ${
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
            commentsCount={answers.length}
            isLiked={question.is_liked || false}
            isDisliked={question.is_disliked || false}
            isSaved={question.is_saved || false}
            onLike={handleLike}
            onDislike={handleDislike}
            onSave={handleSave}
            onComment={() => document.getElementById('answer-form')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            showSave={true}
            showComments={true}
          />
        </div>

        {/* Answer Form */}
        <div id="answer-form" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Write an Answer
          </h2>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              rows={4}
              placeholder="Share your thoughts..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting || !answerContent.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? "Posting..." : "Post Answer"}
              </button>
            </div>
          </form>
        </div>

        {/* Answers */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
          
          {answers.length > 0 ? (
            answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                questionId={id}
                onInteraction={handleInteraction}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No answers yet. Be the first to respond!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
