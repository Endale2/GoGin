import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useRealTime } from '../components/RealTimeInteraction';
import PostList from '../components/Chat/PostList';
import PostForm from '../components/Chat/PostForm';
import TagBar from '../components/Chat/TagBar';
import OnlineUsers from '../components/OnlineUsers';
import RealTimeInteraction from '../components/RealTimeInteraction';
import { FiPlus, FiTrendingUp, FiClock, FiThumbsUp, FiUsers } from 'react-icons/fi';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { posts, loading, error, sortBy, setSortBy } = useChat();
  const { isConnected, voteUpdates, newComments, newReplies } = useRealTime();
  const [showPostForm, setShowPostForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();

  const sortOptions = [
    { value: 'new', label: 'New', icon: FiClock },
    { value: 'hot', label: 'Hot', icon: FiTrendingUp },
    { value: 'top', label: 'Top', icon: FiThumbsUp },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to ChatHub
            </h1>
            <p className="text-gray-600 mb-8">
              Join the conversation! Share your thoughts, ask questions, and connect with others.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RealTimeInteraction>
      <div className="max-w-7xl mx-auto">
        {/* Header with Real-time Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-600">
                What's on your mind today?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Real-time Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              {/* Toggle Sidebar */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiUsers className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-6">
          {/* Main Content */}
          <div className={`${showSidebar ? 'flex-1' : 'w-full'} max-w-4xl`}>
            {/* Sort Options */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        sortBy === option.value
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Tag Bar */}
            <TagBar />
            {/* Create Post Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowPostForm(true)}
                className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600">Create a new post</p>
                    <p className="text-sm text-gray-500">Share your thoughts with the community</p>
                  </div>
                </div>
              </button>
            </div>
            {/* Post Form Modal */}
            {showPostForm && (
              <PostForm
                onClose={() => setShowPostForm(false)}
                onSuccess={() => setShowPostForm(false)}
              />
            )}
            {/* Posts List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Be the first to start a conversation!</p>
                <button
                  onClick={() => setShowPostForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Post
                </button>
              </div>
            ) : (
              <PostList posts={posts} />
            )}
          </div>
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-8">
                <OnlineUsers />
              </div>
            </div>
          )}
        </div>
      </div>
    </RealTimeInteraction>
  );
};

export default Home; 