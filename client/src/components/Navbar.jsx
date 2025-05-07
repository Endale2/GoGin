import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

const Navbar = ({ toggleSidebar }) => {
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        const userData = res.data.user;
        if (userData && userData.profile_image) {
          setProfileImage(`http://localhost:8080/${userData.profile_image}`);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-900 shadow-md md:px-6">
      {/* Sidebar Toggle Button for Mobile */}
      <button
        onClick={toggleSidebar}
        className="text-gray-700 dark:text-gray-300 lg:hidden text-2xl"
      >
        ☰
      </button>

      {/* App Title */}
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 md:text-xl">
        My App
      </h1>

      {/* User Avatar and Dropdown */}
      <div className="relative">
        <img
          src={
            profileImage ||
            'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250'
          }
          alt="User Avatar"
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 cursor-pointer"
        />

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50 hidden group-hover:block">
          <ul>
            <li>
              <a
                href="/profile"
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                href="/settings"
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                Settings
              </a>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
