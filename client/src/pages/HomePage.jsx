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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {user ? (
        <div>
          <h1>Welcome, {user.name || 'User'}</h1>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Joined At:</strong> {formatDate(user.joined_at)}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      <h2>Questions</h2>
      {loading ? (
        <p>Loading questions...</p>
      ) : (
        questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} style={{
              border: '1px solid #ddd',
              borderRadius: '5px',
              padding: '15px',
              margin: '10px 0',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}>
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontWeight: 'bold', color: '#333' }}>{question.user.name || "Anonymous"}</p>
                <p><strong>Email:</strong> {question.user.email}</p>
                <p><strong>Department:</strong> {question.user.department || "N/A"}</p>
                <p><strong>Joined At:</strong> {formatDate(question.user.joined_at)}</p>
              </div>
              <h3>{question.content}</h3>
              <p><strong>Course:</strong> {getCourseNameById(question.course_id)}</p>
              <p><strong>Created At:</strong> {formatDate(question.created_at)}</p>
            </div>
          ))
        ) : (
          <p>No questions available</p>
        )
      )}

      <h2>Create a New Question</h2>
      <form onSubmit={handleCreateQuestion}>
        <textarea
          placeholder="Enter your question content here"
          value={newQuestionContent}
          onChange={(e) => setNewQuestionContent(e.target.value)}
          rows="4"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          required
        />
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          required
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Create Question
        </button>
      </form>
    </div>
  );
};

export default HomePage;
