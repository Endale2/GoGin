import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { AiOutlineComment, AiOutlineHeart } from 'react-icons/ai';
import { BsThreeDots } from 'react-icons/bs';
import axiosInstance from '../utils/axios';
import { Link } from "react-router-dom";

const HomePage = () => {
  const [data, setData] = useState({ questions: [], courses: [] });
  const [form, setForm] = useState({ content: '', courseId: '' });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [questionsRes, coursesRes] = await Promise.all([
          axiosInstance.get('/questions/'),
          axiosInstance.get('/courses/')
        ]);
        setData({ questions: questionsRes.data, courses: coursesRes.data });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.courseId) return;
    try {
      const { data: newQuestion } = await axiosInstance.post('/questions/', form);
      setData((prev) => ({ ...prev, questions: [newQuestion, ...prev.questions] }));
      setForm({ content: '', courseId: '' });
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  };

  const toggleMenu = (id) => {
    setMenuOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCourseName = (id) => {
    return data.courses.find((c) => c.id === id)?.title || 'Unknown Course';
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-200 flex flex-col">
      {/* Question Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <textarea
            placeholder="Ask something..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full p-3 border rounded-md focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-900"
            rows="3"
            required
          />
          <select
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-900"
            required
          >
            <option value="">Select a course</option>
            {data.courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Post Question
          </button>
        </form>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">
          <FiLoader size={24} className="animate-spin mx-auto mb-2" /> Loading...
        </div>
      ) : data.questions.length > 0 ? (
        <div className="space-y-6">
          

{data.questions.map((question) => (
  <div
    key={question.id}
    className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
  >
    <Link to={`/questions/${question.id}`} className="block">
      <div className="flex items-start space-x-4">
        <img
          src="https://via.placeholder.com/50"
          alt="Avatar"
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">
                {question.user.name || "Anonymous"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {question.user.email}
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(question.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-gray-800 dark:text-gray-300">
            {question.content}
          </p>
          <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-white px-3 py-1 rounded-full">
            {getCourseName(question.course_id)}
          </span>
        </div>
      </div>
    </Link>
    {/* The menu button stays outside the Link so its click events are separate */}
    <div className="flex justify-end mt-4">
      <div className="relative inline-block text-left">
        <button
          onClick={() => toggleMenu(question.id)}
          className="inline-flex justify-center w-full text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
        >
          <BsThreeDots size={20} />
        </button>
        {menuOpen[question.id] && (
          <div className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Save
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    {/* Footer showing comments and likes */}
    <div className="flex justify-between items-center mt-4 border-t pt-4">
      <div className="flex space-x-4 text-gray-600 dark:text-gray-300 text-sm">
        <span className="flex items-center">
          <AiOutlineComment className="mr-1" />{" "}
          {question.answer_count !== undefined
            ? question.answer_count
            : Math.floor(Math.random() * 100)}{" "}
          Comments
        </span>
        <span className="flex items-center">
          <AiOutlineHeart className="mr-1" />{" "}
          {Math.floor(Math.random() * 100)} likes
        </span>
      </div>
    </div>
  </div>
))}

        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-6">No questions yet.</p>
      )}
    </div>
  );
};

export default HomePage;
