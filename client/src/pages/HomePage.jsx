import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { AiOutlineComment, AiOutlineHeart, AiOutlinePlus } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import axiosInstance from "../utils/axios";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [data, setData] = useState({ questions: [], courses: [] });
  const [form, setForm] = useState({ content: "", courseId: "" });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ State for modal visibility

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [questionsRes, coursesRes] = await Promise.all([
          axiosInstance.get("/questions/"),
          axiosInstance.get("/courses/"),
        ]);
        setData({ questions: questionsRes.data, courses: coursesRes.data });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.courseId) return;
    try {
      const { data: newQuestion } = await axiosInstance.post("/questions/", form);
      setData((prev) => ({ ...prev, questions: [newQuestion, ...prev.questions] }));
      setForm({ content: "", courseId: "" });
      setIsModalOpen(false); // ✅ Close modal on successful post
    } catch (error) {
      console.error("Failed to create question:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200 flex flex-col relative">
      {/* Questions List */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">
          <FiLoader size={24} className="animate-spin mx-auto mb-2" /> Loading...
        </div>
      ) : data.questions.length > 0 ? (
        <div className="space-y-6">
          {data.questions.map((question) => (
            <div key={question.id} className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <Link to={`/questions/${question.id}`} className="block">
                <div className="flex items-start space-x-4">
                  <img
                    src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                    alt="Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{question.user?.name || "Anonymous"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{question.user?.email}</p>
                    <p className="mt-2 text-gray-800 dark:text-gray-300">{question.content}</p>
                  </div>
                </div>
              </Link>
              <div className="flex justify-between items-center mt-4 border-t pt-4">
                <div className="flex space-x-4 text-gray-600 dark:text-gray-300 text-sm">
                  <span className="flex items-center">
                    <AiOutlineComment className="mr-1" /> {question.answer_count ?? Math.floor(Math.random() * 100)} Comments
                  </span>
                  <span className="flex items-center">
                    <AiOutlineHeart className="mr-1" /> {Math.floor(Math.random() * 100)} Likes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6">No questions yet.</p>
      )}

      {/* ✅ Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 focus:outline-none"
      >
        <AiOutlinePlus size={24} />
      </button>

      {/* ✅ Modal for Creating a Question */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)} // ✅ Close when clicking outside modal
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80 sm:w-96">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3">Ask a Question</h2>
            <form onSubmit={handleCreateQuestion} className="space-y-3">
              {/* Question Input */}
              <textarea
                placeholder="Type your question..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full p-2 border rounded-md text-gray-900 dark:text-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                rows="3"
                required
              />

              {/* Course Selection */}
              <select
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                required
              >
                <option value="" className="text-gray-400">Select a course</option>
                {data.courses.map((course) => (
                  <option key={course.id} value={course.id} className="text-gray-900 dark:text-gray-200">
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
