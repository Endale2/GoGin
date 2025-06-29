import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

function LandingPage() {
  const navigate = useNavigate();
  useEffect(()=>{

    const checkAuthentication = async () => {
      try {
        
        await axiosInstance.get('/auth/me');
        navigate('/home'); 
      } catch (error) {
        
      }
    };
    checkAuthentication();
  }, [navigate])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Welcome to <span className="text-indigo-600">UniQ&A</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6">
          The premier student platform for Ethiopian universities. Connect with peers, ask questions, 
          and share knowledge within your academic community using your institutional email.
        </p>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">For Ethiopian Students Only</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Institutional email verification (.edu.et domain)
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Department-specific discussions and questions
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Real-time collaboration with fellow students
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Secure and verified student community
            </li>
          </ul>
        </div>
      </header>
      <div className="flex space-x-6">
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          Student Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          Join as Student
        </button>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Supported Universities: AAU, ASTU, BDU, JU, MU, and more Ethiopian institutions
        </p>
        <p className="text-xs text-gray-500">
          Use your institutional email (e.g., student@aau.edu.et) to access the platform
        </p>
      </div>
      <footer className="mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} UniQ&A - Ethiopian Student Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;
