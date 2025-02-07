import React from 'react';

const Navbar = ({ toggleSidebar }) => {
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
          src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
          alt="User Avatar"
          className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700"
        />
      </div>
    </nav>
  );
};

export default Navbar;