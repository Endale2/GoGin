import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus, AiOutlineQuestionCircle } from "react-icons/ai";
import { FaCommentDots } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import { useAuth } from "../authContext";
import QuestionCard from "../components/QuestionCard";
import SearchAndFilters from "../components/SearchAndFilters";
import CreateQuestionModal from "../components/CreateQuestionModal";
import Tabs from "../components/Tabs";
import axiosInstance from "../utils/axios";

const tabConfig = [
  { key: "question", label: "Questions", Icon: AiOutlineQuestionCircle },
  { key: "vent", label: "Vent", Icon: FaCommentDots },
];

const HomePage = () => {
  const { 
    questions, 
    loading, 
    error, 
    filters, 
    api, 
    clearError 
  } = useApp();
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("question");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState({ courses: [], universities: [], departments: [] });

  // Detailed debug logs
  console.log("=== HOMEPAGE DATA FLOW DEBUG ===");
  console.log("1. Auth State:", { user: !!user, authLoading });
  console.log("2. App Context State:", { 
    loading, 
    error, 
    questionsCount: questions?.length || 0,
    filters,
    activeTab 
  });
  console.log("3. Filter Data:", {
    coursesCount: data.courses?.length || 0,
    universitiesCount: data.universities?.length || 0,
    departmentsCount: data.departments?.length || 0
  });
  console.log("4. Questions Data:", questions);
  console.log("=== END DEBUG ===");

  // TEMPORARILY DISABLED: Redirect to login if not authenticated and auth check is complete
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     console.log("User not authenticated, redirecting to login");
  //     navigate('/login');
  //   }
  // }, [user, authLoading, navigate]);

  // Fetch filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      console.log("Fetching filter data...");
      try {
        const [coursesRes, universitiesRes, departmentsRes] = await Promise.all([
          axiosInstance.get("/courses/"),
          axiosInstance.get("/universities/"),
          axiosInstance.get("/departments/")
        ]);

        const filterData = {
          courses: coursesRes.data || [],
          universities: universitiesRes.data || [],
          departments: departmentsRes.data || []
        };

        console.log("Filter data received:", {
          courses: filterData.courses.length,
          universities: filterData.universities.length,
          departments: filterData.departments.length
        });

        setData(filterData);
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };

    fetchFilterData();
  }, []);

  // Fetch questions when filters or tab changes, but only if user is authenticated
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) {
        console.log("User not authenticated, skipping question fetch");
        return;
      }
      
      console.log("Fetching questions with filters:", { ...filters, type: activeTab });
      const currentFilters = { ...filters, type: activeTab };
      await api.fetchQuestions(currentFilters);
    };

    fetchQuestions();
  }, [filters, activeTab, api, user]);

  // Set up real-time polling only if user is authenticated
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time polling...");
    const interval = setInterval(async () => {
      const currentFilters = { ...filters, type: activeTab };
      await api.fetchQuestions(currentFilters);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [filters, activeTab, api, user]);

  const handleTabChange = (tab) => {
    console.log("Tab changed to:", tab);
    setActiveTab(tab);
  };

  const handleSearch = async (query) => {
    if (!user) return;
    
    console.log("Search triggered with query:", query);
    const searchFilters = { ...filters, search: query, type: activeTab };
    await api.fetchQuestions(searchFilters);
  };

  const handleFiltersChange = async (newFilters) => {
    if (!user) return;
    
    console.log("Filters changed:", newFilters);
    const updatedFilters = { ...newFilters, type: activeTab };
    await api.fetchQuestions(updatedFilters);
  };

  const handleInteraction = async () => {
    if (!user) return;
    
    console.log("Interaction triggered, refreshing questions...");
    // Refresh questions after interaction
    const currentFilters = { ...filters, type: activeTab };
    await api.fetchQuestions(currentFilters);
  };

  // Show loading while checking authentication
  if (authLoading) {
    console.log("Auth loading, showing loading screen");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    console.log("User not authenticated, showing login prompt");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Welcome to Student Community
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access questions, ask new ones, and interact with the community.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              Register
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Test user: chala@aau.edu.et / password
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={clearError}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Debug render state
  console.log("Rendering HomePage with:", {
    loading,
    questionsCount: questions?.length || 0,
    willShowQuestions: questions && questions.length > 0,
    willShowNoQuestions: !loading && (!questions || questions.length === 0)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Student Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ask questions, share knowledge, and connect with fellow students
          </p>
          {/* TEMPORARY: Show auth status */}
          <p className="text-sm text-gray-500 mt-2">
            Auth Status: {user ? 'Authenticated' : 'Not Authenticated'} | 
            Questions: {questions?.length || 0}
          </p>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabConfig} activeTab={activeTab} onChange={handleTabChange} />

        {/* Search and Filters */}
        <SearchAndFilters
          courses={data.courses}
          universities={data.universities}
          departments={data.departments}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
        />

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
          </div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-6">
            {console.log("Rendering", questions.length, "question cards")}
            {questions.map((question, index) => {
              console.log(`Rendering QuestionCard ${index}:`, question);
              return (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onInteraction={handleInteraction}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <AiOutlineQuestionCircle className="mx-auto text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No questions found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                {activeTab === "question" 
                  ? "Be the first to ask a question!" 
                  : "Be the first to share a vent!"}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                <AiOutlinePlus className="inline mr-2" />
                {activeTab === "question" ? "Ask Question" : "Share Vent"}
              </button>
            </div>
          </div>
        )}

        {/* Create Question Button - Always show for debugging */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 focus:outline-none"
          aria-label="New Question"
        >
          <AiOutlinePlus size={24} />
        </button>

        {/* Create Question Modal */}
        <CreateQuestionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          courses={data.courses}
          universities={data.universities}
          departments={data.departments}
        />
      </div>
    </div>
  );
};

export default HomePage;