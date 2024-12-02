import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { AiOutlineQuestionCircle, AiOutlineComment, AiOutlineHeart } from 'react-icons/ai';
import { BsThreeDots } from 'react-icons/bs'; // Three dots icon
import axiosInstance from '../utils/axios';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [menuOpen, setMenuOpen] = useState({}); // Track open menus

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionsAndCourses = async () => {
      try {
        const [questionsResponse, coursesResponse] = await Promise.all([
          axiosInstance.get('/questions/'),
          axiosInstance.get('/courses/'),
        ]);
        setQuestions(questionsResponse.data);
        setCourses(coursesResponse.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndCourses();
  }, []);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const newQuestion = {
        content: newQuestionContent,
        course_id: selectedCourseId,
      };
      const { data } = await axiosInstance.post('/questions/', newQuestion);
      setQuestions([data, ...questions]);
      setNewQuestionContent('');
      setSelectedCourseId('');
    } catch (error) {
      console.error('Failed to create question', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 3 * 86400) return `${Math.floor(diff / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const toggleMenu = (id) => {
    setMenuOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCourseNameById = (courseId) => {
    const course = courses.find((course) => course.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Tab Bar */}
      <div className="flex justify-between items-center mb-6 border-b-2 pb-2 border-gray-300 dark:border-gray-700">
        {['all', 'my-questions'].map((tab) => (
          <button
            key={tab}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <AiOutlineQuestionCircle size={18} />
            <span>{tab === 'all' ? 'All Questions' : 'My Questions'}</span>
          </button>
        ))}
      </div>

      {/* Question Creation Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <div className="flex space-x-4 items-center">
          <img
            src="https://via.placeholder.com/50"
            alt="User Avatar"
            className="w-12 h-12 rounded-full"
          />
          <form onSubmit={handleCreateQuestion} className="flex-1 space-y-4">
            <textarea
              placeholder="Ask a question or share your thoughts..."
              value={newQuestionContent}
              onChange={(e) => setNewQuestionContent(e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              required
            />
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md hover:bg-blue-700 focus:ring focus:ring-blue-300"
            >
              Post Question
            </button>
          </form>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">
          <FiLoader size={24} className="animate-spin mx-auto mb-2" />
          Loading questions...
        </div>
      ) : questions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {questions.map((question) => (
            <div key={question.id} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="flex items-start space-x-4">
                <img
                  src="https://via.placeholder.com/50"
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {question.user.name || 'Anonymous'}
                      </p>
                      <p className="text-gray-500 text-xs">{question.user.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(question.created_at)}</span>
                  </div>
                  <p className="text-base text-gray-800 dark:text-gray-300 mt-3 mb-3">
                    {question.content}
                  </p>
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold dark:bg-blue-900 dark:text-blue-300">
                    {getCourseNameById(question.course_id)}
                  </span>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-4 items-center">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <AiOutlineComment className="mr-1" />
                        {Math.floor(Math.random() * 100)} Comments
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <AiOutlineHeart className="mr-1" />
                        {Math.floor(Math.random() * 100)} Saves
                      </div>
                    </div>
                    <div className="relative">
                      <BsThreeDots
                        className="cursor-pointer text-gray-600 dark:text-gray-400"
                        onClick={() => toggleMenu(question.id)}
                      />
                      {menuOpen[question.id] && (
                        <div className="absolute right-0 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 z-10">
                          <button className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Save
                          </button>
                          <button className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Report
                          </button>
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
        <p className="text-center text-gray-600 dark:text-gray-400 py-6">No questions yet.</p>
      )}
    </div>
  );
};

export default HomePage;
