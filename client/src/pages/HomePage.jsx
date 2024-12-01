import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi'; // Loader Icon
import { AiOutlineQuestionCircle } from 'react-icons/ai'; // Icon for questions
import axiosInstance from '../utils/axios';

const HomePage = () => {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCourseNameById = (courseId) => {
    const course = courses.find((course) => course.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Tab Bar */}
      <div className="flex justify-between items-center mb-6 border-b-2 pb-2">
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
            activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          <AiOutlineQuestionCircle size={18} />
          <span>All Questions</span>
        </button>
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
            activeTab === 'my-questions' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('my-questions')}
        >
          <AiOutlineQuestionCircle size={18} />
          <span>My Questions</span>
        </button>
      </div>

      {/* Question Creation Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex space-x-4 items-center">
          <img
            src="https://via.placeholder.com/50"
            alt="User Avatar"
            className="w-12 h-12 rounded-full"
          />
          <form onSubmit={handleCreateQuestion} className="flex-1">
            <textarea
              placeholder="Ask a question or share your thoughts..."
              value={newQuestionContent}
              onChange={(e) => setNewQuestionContent(e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mb-2"
              required
            />
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mb-4"
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
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring focus:ring-blue-300"
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
        questions.map((question) => (
          <div key={question.id} className="mb-4 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-start space-x-4">
              <img
                src="https://via.placeholder.com/50"
                alt="User Avatar"
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{question.user.name || 'Anonymous'}</p>
                    <p className="text-gray-500 text-xs">{question.user.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(question.created_at)}</span>
                </div>
                <p className="text-base text-gray-800 mt-3 mb-3">{question.content}</p>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                  {getCourseNameById(question.course_id)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No questions available yet. Be the first to ask!</p>
      )}
    </div>
  );
};

export default HomePage;
