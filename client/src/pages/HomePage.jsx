import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { AiOutlineQuestionCircle, AiOutlineComment, AiOutlineHeart } from 'react-icons/ai';
import { BsThreeDots } from 'react-icons/bs';
import axiosInstance from '../utils/axios';

const HomePage = () => {
  const [data, setData] = useState({ questions: [], courses: [] });
  const [form, setForm] = useState({ content: '', courseId: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
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
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        {['all', 'my-questions'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <AiOutlineQuestionCircle size={18} className="mr-2" />
            {tab === 'all' ? 'All Questions' : 'My Questions'}
          </button>
        ))}
      </div>

      {/* Question Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <textarea
            placeholder="Ask something..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full p-3 border rounded-md focus:ring focus:ring-blue-200"
            rows="3"
            required
          />
          <select
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            className="w-full p-2 border rounded-md"
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
        <div className="grid gap-6">
          {data.questions.map((question) => (
            <div key={question.id} className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-start space-x-4">
                <img src="https://via.placeholder.com/50" alt="Avatar" className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{question.user.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">{question.user.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(question.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2 text-gray-800">{question.content}</p>
                  <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                    {getCourseName(question.course_id)}
                  </span>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-4 text-gray-600">
                      <span className="flex items-center"><AiOutlineComment className="mr-1" /> {Math.floor(Math.random() * 100)} Comments</span>
                      <span className="flex items-center"><AiOutlineHeart className="mr-1" /> {Math.floor(Math.random() * 100)} Saves</span>
                    </div>
                    <div className="relative">
                      <BsThreeDots
                        className="cursor-pointer"
                        onClick={() => toggleMenu(question.id)}
                      />
                      {menuOpen[question.id] && (
                        <div className="absolute right-0 bg-white shadow-lg rounded-md p-2">
                          <button className="block px-4 py-2 hover:bg-gray-100">Save</button>
                          <button className="block px-4 py-2 hover:bg-gray-100">Report</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-6">No questions yet.</p>
      )}
    </div>
  );
};

export default HomePage;