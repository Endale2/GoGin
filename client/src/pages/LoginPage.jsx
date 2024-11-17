import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Try to verify if the user is already authenticated
        await axiosInstance.get('/auth/me');
        navigate('/home'); // Redirect if authenticated
      } catch (error) {
        // User is not authenticated, allow access to the login page
      }
    };
    checkAuthentication();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Attempt login and redirect on success
      await axiosInstance.post('/auth/login', { email, password });
      navigate('/home');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error('Login failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          Don't have an account?{' '}
          <a
            href="/register"
            className="text-indigo-600 hover:underline"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
