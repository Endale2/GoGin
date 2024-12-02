import React from 'react';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-900 shadow-md">
      <button
        onClick={toggleSidebar}
        className="text-gray-700 dark:text-gray-300 lg:hidden"
      >
        ☰
      </button>
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        My App
      </h1>
      <div>
        <img
          src="https://via.placeholder.com/40"
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </nav>
  );
};

export default Navbar;
