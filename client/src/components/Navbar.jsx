import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

const Navbar = ({ toggleSidebar }) => {
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        const userData = res.data.user;
        if (userData?.profile_image) {
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
      await axiosInstance.post('/auth/logout', {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-gray-900 shadow-sm">
      {/* Mobile: hamburger */}
      <button
        onClick={toggleSidebar}
        className="text-gray-600 dark:text-gray-300 lg:hidden text-2xl"
        aria-label="Toggle Menu"
      >
        ☰
      </button>

      {/* Brand / Title */}
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        My App
      </h1>

      {/* Spacer to push avatar to right */}
      <div className="flex-1"></div>

      {/* Avatar + Dropdown */}
      <div className="relative group">
        <img
          src={
            profileImage ||
            'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250'
          }
          alt="User Avatar"
          className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
        />

        {/* Dropdown */}
        <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <ul className="py-1">
            <li>
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Settings
              </a>
            </li>
            <li><hr className="border-gray-200 dark:border-gray-700 my-1" /></li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 dark:text-red-400"
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
