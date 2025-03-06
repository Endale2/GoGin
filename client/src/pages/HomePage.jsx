import React, { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import axiosInstance from "../utils/axios";
import QuestionCard from "../components/QuestionCard"; 
const HomePage = () => {
  const [data, setData] = useState({ questions: [], courses: [] });
  const [form, setForm] = useState({ content: "", courseId: "" });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch questions and courses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, coursesRes] = await Promise.all([
          axiosInstance.get("/questions/"),
          axiosInstance.get("/courses/"),
        ]);
        setData({
          questions: questionsRes.data,
          courses: coursesRes.data,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create a new question
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.courseId) return;
    try {
      const { data: newQuestion } = await axiosInstance.post("/questions/", form);
      setData((prev) => ({ ...prev, questions: [newQuestion, ...prev.questions] }));
      setForm({ content: "", courseId: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create question:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200 relative">
      <h1 className="text-3xl font-bold mb-6 text-center">Home</h1>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">
          <FiLoader size={24} className="animate-spin mx-auto mb-2" /> Loading...
        </div>
      ) : data.questions.length > 0 ? (
        <div className="space-y-6">
          {data.questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6">No questions yet.</p>
      )}

      {/* Floating Action Button to open modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-105 focus:outline-none"
      >
        <AiOutlinePlus size={24} />
      </button>

      {/* Modal for Creating a New Question */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80 sm:w-96">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">
              Ask a Question
            </h2>
            <form onSubmit={handleCreateQuestion} className="space-y-3">
              {/* Question Textarea */}
              <textarea
                placeholder="Type your question..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full p-2 border rounded-md text-gray-900 dark:text-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                rows="3"
                required
              />
              {/* Course Selector */}
              <select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                required
              >
                <option value="" className="text-gray-400">
                  Select a course
                </option>
                {data.courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                    className="text-gray-900 dark:text-gray-200"
                  >
                    {course.title}
                  </option>
                ))}
              </select>
              {/* Modal Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
