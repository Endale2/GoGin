import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { FiMenu, FiHome, FiInfo, FiMail } from 'react-icons/fi';

const Layout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        console.log('User Data:', response.data); // Check the structure of response
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error.response ? error.response.data : error.message);
      }
    };

    fetchUserData();
  }, []);

  // Function to generate the avatar based on the user's name
  const generateAvatar = (name) => {
    if (!name) return 'U';  // If no name, use 'U' for user
    const initials = name
      .split(' ')  // Split the name into parts (e.g., ["John", "Doe"])
      .map((word) => word[0])  // Get the first letter of each word
      .join('')  // Join the initials together
      .toUpperCase();  // Make the initials uppercase
    return initials;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold">My Beautiful App</h1>
          <div className="flex space-x-4 items-center">
            {/* Mobile Menu Button */}
            <button
              className="text-2xl md:hidden focus:outline-none"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
              <FiMenu />
            </button>

            {/* Navbar Links for larger screens */}
            <div className="hidden md:flex space-x-8">
              <a href="/home" className="flex items-center space-x-2 text-lg hover:text-gray-200">
                <FiHome />
                <span>Home</span>
              </a>
              <a href="/about" className="flex items-center space-x-2 text-lg hover:text-gray-200">
                <FiInfo />
                <span>About</span>
              </a>
              <a href="/contact" className="flex items-center space-x-2 text-lg hover:text-gray-200">
                <FiMail />
                <span>Contact</span>
              </a>
            </div>

            {/* Profile Section */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2 bg-white text-gray-800 px-3 py-1 rounded-full shadow-md">
                <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center rounded-full font-semibold">
                  {generateAvatar(user.name)}  {/* Displaying initials */}
                </div>
                <span className="text-lg font-medium">{user.name}</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-lg">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer (for mobile view) */}
      {isDrawerOpen && (
        <div className="bg-indigo-600 text-white shadow-lg p-4 md:hidden">
          <ul className="space-y-4">
            <li>
              <a href="/home" className="block text-lg hover:text-gray-200">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="block text-lg hover:text-gray-200">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="block text-lg hover:text-gray-200">
                Contact
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-sm bg-indigo-700 text-white">
        &copy; 2024 My App. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
