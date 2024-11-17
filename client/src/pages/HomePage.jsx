import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="p-4 max-w-2xl mx-auto">
      {/* Tab Bar */}
      <div className="flex border-b mb-4">
        <button
          className={`flex-1 p-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Questions
        </button>
        <button
          className={`flex-1 p-2 ${activeTab === 'my-questions' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('my-questions')}
        >
          My Questions
        </button>
      </div>

      {/* Question Creation Form */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6 flex space-x-3">
        <img
          src="https://via.placeholder.com/50"
          alt="User Avatar"
          className="w-12 h-12 rounded-full"
        />
        <form onSubmit={handleCreateQuestion} className="flex-1">
          <textarea
            placeholder="What's on your mind? Ask your question..."
            value={newQuestionContent}
            onChange={(e) => setNewQuestionContent(e.target.value)}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mb-2"
            required
          />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 mb-2"
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

      {/* Questions List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading questions...</p>
      ) : questions.length > 0 ? (
        questions.map((question) => (
          <div key={question.id} className="mb-4 p-4 bg-white rounded-lg shadow-lg flex space-x-4">
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
              <p className="text-base text-gray-800 mt-2 mb-2">{question.content}</p>
              <div className="flex space-x-2 mt-2">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                  {getCourseNameById(question.course_id)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No questions available</p>
      )}
    </div>
  );
};

export default HomePage;
