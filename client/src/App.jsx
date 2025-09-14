// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './authContext';
import { ChatProvider } from './context/ChatContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';

// Keep a simple PostDetail placeholder until a full page is implemented
const PostDetail = ({ children }) => (
  <div className="py-8">
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">Post detail is not available in this build.</div>
  </div>
);
import './index.css';

function App() {
  return (
    <AuthProvider>
        <WebSocketProvider>
          <AppProvider>
            <ChatProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </main>
            </div>
          </Router>
          </ChatProvider>
        </AppProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
