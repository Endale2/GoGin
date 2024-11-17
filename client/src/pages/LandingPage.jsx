
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
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Join your university community and connect with peers for department-specific questions, answers, and discussions.
        </p>
      </header>
      <div className="flex space-x-6">
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          Register
        </button>
      </div>
      <footer className="mt-12 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} UniQ&A. All rights reserved.
      </footer>
    </div>
  );
}

export default LandingPage;
