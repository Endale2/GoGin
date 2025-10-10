import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../authContext';
import { useNavigate } from 'react-router-dom';

const CreateQuestionModal = ({ isOpen, onClose, courses = [], universities = [], departments = [] }) => {
  const { api } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    content: '',
    courseId: '',
    title: '',
    universityId: '',
    departmentId: '',
    type: 'question'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.courseId) return;

    // Must be authenticated to post
    if (!user) {
      // Redirect to login
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const questionData = {
        content: form.content,
        course_id: form.courseId,
        type: form.type
      };

      if (form.title) questionData.title = form.title;
      if (form.universityId) questionData.university_id = form.universityId;
      if (form.departmentId) questionData.department_id = form.departmentId;

  await api.createQuestion(questionData);
      
      // Reset form
      setForm({
        content: '',
        courseId: '',
        title: '',
        universityId: '',
        departmentId: '',
        type: 'question'
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create question:', error);
      // Try to show server message if available
      if (error?.response?.data) {
        alert('Failed to post: ' + (error.response.data.error || JSON.stringify(error.response.data)));
      } else {
        alert('Failed to post: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 w-full sm:w-96 p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Ask a Question
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          
          <textarea
            rows={4}
            required
            placeholder="What's on your mind?"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          
          <select
            required
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={form.universityId}
            onChange={(e) => setForm({ ...form, universityId: e.target.value })}
            className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Select university (optional)</option>
            {universities.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.name}
              </option>
            ))}
          </select>

          <select
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">Select department (optional)</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.content.trim() || !form.courseId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionModal; 