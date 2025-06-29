import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.toLowerCase().endsWith('.edu.et')) {
      newErrors.email = 'Please use your institutional email address (.edu.et)';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Attempt login and redirect on success
      const response = await axiosInstance.post('/auth/login', {
        email: formData.email.toLowerCase(),
        password: formData.password
      });
      
      console.log('Login successful:', response.data);
      navigate('/home');
    } catch (error) {
      console.error('Login failed', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Student Login</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Sign in with your institutional email address
        </p>
        
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="yourname@university.edu.et"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Use your institutional email ending with .edu.et
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
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
