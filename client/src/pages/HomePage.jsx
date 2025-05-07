import React, { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineQuestionCircle } from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";
import axiosInstance from "../utils/axios";
import QuestionCard from "../components/QuestionCard";

const HomePage = () => {
  const [data, setData] = useState({ questions: [], courses: [] });
  const [form, setForm] = useState({ content: "", courseId: "" });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("question");

  useEffect(() => {
    (async () => {
      try {
        const [questionsRes, coursesRes] = await Promise.all([
          axiosInstance.get("/questions/"),
          axiosInstance.get("/courses/"),
        ]);
        setData({
          questions: questionsRes.data,
          courses: coursesRes.data,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.courseId) return;
    try {
      const { data: newQ } = await axiosInstance.post("/questions/", form);
      setData((prev) => ({
        ...prev,
        questions: [newQ, ...prev.questions],
      }));
      setForm({ content: "", courseId: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200">
      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("question")}
          className={`flex items-center space-x-1 px-4 py-2 rounded-full transition ${
            activeTab === "question"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <AiOutlineQuestionCircle size={18} />
          <span>Questions</span>
        </button>
        <button
          onClick={() => setActiveTab("vent")}
          className={`flex items-center space-x-1 px-4 py-2 rounded-full transition ${
            activeTab === "vent"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <FaCommentDots size={16} />
          <span>Vent</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "question" ? (
        loading ? (
          <div className="text-center py-12 text-gray-500">
            <FiLoader className="animate-spin mx-auto mb-2" size={24} />
            Loading...
          </div>
        ) : data.questions.length ? (
          <div className="space-y-4">
            {data.questions.map((q) => (
              <div
                key={q.id}
                className="transition-shadow hover:shadow-md rounded-lg"
              >
                <QuestionCard question={q} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">No questions yet.</p>
        )
      ) : (
        <p className="text-center text-gray-500 py-12">
          Vent section is coming soon!
        </p>
      )}

      {/* FAB */}
      {activeTab === "question" && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none"
          aria-label="New Question"
        >
          <AiOutlinePlus size={24} />
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) =>
            e.target === e.currentTarget && setIsModalOpen(false)
          }
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80 sm:w-96">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Ask a Question
            </h2>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <textarea
                rows={3}
                required
                placeholder="Type your question..."
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <select
                required
                value={form.courseId}
                onChange={(e) =>
                  setForm({ ...form, courseId: e.target.value })
                }
                className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Select a course</option>
                {data.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
