import React, { useState, useEffect, useRef } from "react";
import { FiLoader, FiSearch, FiFilter, FiX } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineQuestionCircle, AiOutlineHeart, AiOutlineComment, AiOutlineLike, AiOutlineDislike } from "react-icons/ai";
import { BsBookmark } from "react-icons/bs";
import { FaCommentDots, FaUserCircle } from "react-icons/fa";
import axiosInstance from "../utils/axios";
import QuestionCard from "../components/QuestionCard";
import Tabs from "../components/Tabs";

const tabConfig = [
  { key: "question", label: "Questions", Icon: AiOutlineQuestionCircle },
  { key: "vent", label: "Vent", Icon: FaCommentDots },
];

const HomePage = () => {
  const [data, setData] = useState({ questions: [], courses: [], universities: [], departments: [] });
  const [form, setForm] = useState({ 
    content: "", 
    courseId: "", 
    title: "",
    universityId: "",
    departmentId: "",
    type: "question"
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("question");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    course: "",
    university: "",
    department: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [lastTypingTime, setLastTypingTime] = useState({});
  const typingTimeoutRef = useRef({});

  useEffect(() => {
    fetchData();
    // Set up real-time polling for new questions
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [activeTab, searchQuery, filters]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filters.course) params.append("course", filters.course);
      if (filters.university) params.append("university", filters.university);
      if (filters.department) params.append("department", filters.department);
      params.append("type", activeTab);

      const [questionsRes, coursesRes, universitiesRes, departmentsRes] = await Promise.all([
        axiosInstance.get(`/questions/?${params.toString()}`),
        axiosInstance.get("/courses/"),
        axiosInstance.get("/universities/"),
        axiosInstance.get("/departments/")
      ]);

      setData({
        questions: questionsRes.data || [],
        courses: coursesRes.data || [],
        universities: universitiesRes.data || [],
        departments: departmentsRes.data || []
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      // Set empty arrays on error to prevent null reference errors
      setData({
        questions: [],
        courses: [],
        universities: [],
        departments: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.courseId) return;
    
    try {
      const questionData = {
        content: form.content,
        course_id: form.courseId,
        type: form.type
      };

      if (form.title) questionData.title = form.title;
      if (form.universityId) questionData.university_id = form.universityId;
      if (form.departmentId) questionData.department_id = form.departmentId;

      const { data: newQ } = await axiosInstance.post("/questions/", questionData);
      
      // Add user info to the new question
      const newQuestionWithUser = {
        ...newQ,
        user: {
          id: newQ.user_id,
          name: "You",
          email: ""
        }
      };

      setData((prev) => ({ 
        ...prev,
        questions: [newQuestionWithUser, ...prev.questions] 
      }));
      
      setForm({ 
        content: "", 
        courseId: "", 
        title: "",
        universityId: "",
        departmentId: "",
        type: activeTab
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create question:", err);
    }
  };

  const handleLike = async (questionId) => {
    try {
      await axiosInstance.post(`/questions/${questionId}/like`);
      setData(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === questionId ? { ...q, likes: (q.likes || 0) + 1 } : q
        )
      }));
    } catch (err) {
      console.error("Failed to like question:", err);
    }
  };

  const handleDislike = async (questionId) => {
    try {
      await axiosInstance.post(`/questions/${questionId}/dislike`);
      setData(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === questionId ? { ...q, dislikes: (q.dislikes || 0) + 1 } : q
        )
      }));
    } catch (err) {
      console.error("Failed to dislike question:", err);
    }
  };

  const handleSave = async (questionId) => {
    try {
      await axiosInstance.post(`/questions/${questionId}/save`);
      setData(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === questionId ? { ...q, saved: true } : q
        )
      }));
    } catch (err) {
      console.error("Failed to save question:", err);
    }
  };

  const handleUnsave = async (questionId) => {
    try {
      await axiosInstance.delete(`/questions/${questionId}/save`);
      setData(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === questionId ? { ...q, saved: false } : q
        )
      }));
    } catch (err) {
      console.error("Failed to unsave question:", err);
    }
  };

  const handleTyping = () => {
    const userId = "current-user"; // In a real app, this would be the actual user ID
    setTypingUsers(prev => new Set([...prev, userId]));
    setLastTypingTime(prev => ({ ...prev, [userId]: Date.now() }));

    // Clear existing timeout
    if (typingTimeoutRef.current[userId]) {
      clearTimeout(typingTimeoutRef.current[userId]);
    }

    // Set new timeout to remove typing indicator
    typingTimeoutRef.current[userId] = setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }, 3000);
  };

  const clearFilters = () => {
    setFilters({ course: "", university: "", department: "" });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>

            {/* Clear Filters */}
            {(filters.course || filters.university || filters.department || searchQuery) && (
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <FiX className="mr-2" />
                Clear
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.course}
                onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Courses</option>
                {(data.courses || []).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <select
                value={filters.university}
                onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Universities</option>
                {(data.universities || []).map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Departments</option>
                {(data.departments || []).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <Tabs tabs={tabConfig} activeTab={activeTab} onChange={setActiveTab} />

        {/* Typing Indicators */}
        {typingUsers.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <div className="flex space-x-1 mr-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">
                {typingUsers.size} user{typingUsers.size > 1 ? 's' : ''} typing...
              </span>
            </div>
          </div>
        )}

        {activeTab === "question" ? (
          loading ? (
            <div className="text-center py-12 text-gray-500">
              <FiLoader className="animate-spin mx-auto mb-2" size={28} />
              Loading questions...
            </div>
          ) : data.questions && data.questions.length ? (
            <div className="space-y-6">
              {data.questions.map((q) => (
                <div key={q.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  {/* User Info */}
                  <div className="flex items-center mb-4">
                    {q.user?.profile_image ? (
                      <img
                        src={`http://localhost:8080/${q.user.profile_image}`}
                        alt="User Profile"
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {q.type === "vent" ? "Anonymous" : (q.user?.name || "Anonymous")}
                      </p>
                      {q.created_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(q.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="mb-4">
                    {q.title && (
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {q.title}
                      </h3>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {q.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {q.course && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {q.course.title}
                      </span>
                    )}
                    {q.university && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {q.university.name}
                      </span>
                    )}
                    {q.department && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {q.department.name}
                      </span>
                    )}
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                      q.type === "vent" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {q.type === "vent" ? "Vent" : "Question"}
                    </span>
                  </div>

                  {/* Question Stats */}
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm">
                    <div className="flex space-x-6">
                      <span className="flex items-center">
                        <AiOutlineComment className="mr-1" /> {q.answer_count ?? 0}
                      </span>
                      <button
                        onClick={() => handleLike(q.id)}
                        className="flex items-center hover:text-blue-600 transition-colors"
                      >
                        <AiOutlineLike className="mr-1" /> {q.likes || 0}
                      </button>
                      <button
                        onClick={() => handleDislike(q.id)}
                        className="flex items-center hover:text-red-600 transition-colors"
                      >
                        <AiOutlineDislike className="mr-1" /> {q.dislikes || 0}
                      </button>
                    </div>
                    <button
                      onClick={() => q.saved ? handleUnsave(q.id) : handleSave(q.id)}
                      className={`flex items-center transition-colors ${
                        q.saved ? "text-yellow-600" : "hover:text-yellow-600"
                      }`}
                    >
                      <BsBookmark className="mr-1" />
                      {q.saved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No questions available.</p>
          )
        ) : (
          <p className="text-center text-gray-500 py-12">Vent section is under construction.</p>
        )}

        {activeTab === "question" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 focus:outline-none"
            aria-label="New Question"
          >
            <AiOutlinePlus size={24} />
          </button>
        )}

        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
          >
            <div className="bg-white dark:bg-gray-800 w-full sm:w-96 p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Ask a Question
              </h2>
              <form onSubmit={handleCreateQuestion} className="space-y-4">
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
                  onChange={(e) => {
                    setForm({ ...form, content: e.target.value });
                    handleTyping();
                  }}
                  className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <select
                  required
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Select a course</option>
                  {(data.courses || []).map((c) => (
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
                  {(data.universities || []).map((uni) => (
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
                  {(data.departments || []).map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;