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

      {/* User Avatar */}
      <div>
        <img
          src={
            profileImage ||
            'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250'
          }
          alt="User Avatar"
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700"
        />
      </div>
    </nav>
  );
};

export default Navbar;
