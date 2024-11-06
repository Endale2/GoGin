import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axiosInstance.get('/auth/me');
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    const fetchQuestions = async () => {
      try {
        const { data } = await axiosInstance.get('http://localhost:8080/questions/');
        setQuestions(data);
      } catch (error) {
        console.error('Failed to fetch questions', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const { data } = await axiosInstance.get('http://localhost:8080/courses/');
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
      }
    };

    fetchUserData();
    fetchQuestions();
    fetchCourses();
  }, []);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const newQuestion = {
        content: newQuestionContent,
        course_id: selectedCourseId,
      };
      const { data } = await axiosInstance.post('http://localhost:8080/questions/', newQuestion);
      setQuestions([...questions, data]);
      setNewQuestionContent("");
      setSelectedCourseId("");
    } catch (error) {
      console.error("Failed to create question", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCourseNameById = (courseId) => {
    const course = courses.find((course) => course.id === courseId);
    return course ? course.title : "Unknown Course";
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {user ? (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Welcome, {user.name || 'User'}</h1>
          <p className="text-gray-600"><strong>ID:</strong> {user.id}</p>
          <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-600"><strong>Joined At:</strong> {formatDate(user.joined_at)}</p>
        </div>
      ) : (
        <p className="text-center text-gray-500">Loading user data...</p>
      )}

      <h2 className="text-xl font-semibold mb-4">Questions</h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading questions...</p>
      ) : (
        questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <div className="mb-2">
                <p className="font-semibold text-gray-800">{question.user.name || "Anonymous"}</p>
                <p className="text-gray-600"><strong>Email:</strong> {question.user.email}</p>
                <p className="text-gray-600"><strong>Department:</strong> {question.user.department || "N/A"}</p>
                <p className="text-gray-600"><strong>Joined At:</strong> {formatDate(question.user.joined_at)}</p>
              </div>
              <h3 className="text-lg font-bold text-blue-600">{question.content}</h3>
              <p className="text-gray-600"><strong>Course:</strong> {getCourseNameById(question.course_id)}</p>
              <p className="text-gray-500"><strong>Created At:</strong> {formatDate(question.created_at)}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No questions available</p>
        )
      )}

      <h2 className="text-xl font-semibold mt-8 mb-4">Create a New Question</h2>
      <form onSubmit={handleCreateQuestion} className="space-y-4">
        <textarea
          placeholder="Enter your question content here"
          value={newQuestionContent}
          onChange={(e) => setNewQuestionContent(e.target.value)}
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          required
        />
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          required
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring focus:ring-blue-300">
          Create Question
        </button>
      </form>
    </div>
  );
};

export default HomePage;
