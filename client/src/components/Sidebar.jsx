import React from 'react';
import { FiHome, FiInfo, FiMail } from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full bg-gray-900 text-white transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 md:w-72`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Sidebar</h2>
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white focus:outline-none"
        >
          X
        </button>
      </div>
      <ul className="p-4 space-y-4">
        <li>
          <a href="/home" className="flex items-center space-x-3 text-gray-300 hover:text-white">
            <FiHome />
            <span>Home</span>
          </a>
        </li>
        <li>
          <a href="/about" className="flex items-center space-x-3 text-gray-300 hover:text-white">
            <FiInfo />
            <span>About</span>
          </a>
        </li>
        <li>
          <a href="/contact" className="flex items-center space-x-3 text-gray-300 hover:text-white">
            <FiMail />
            <span>Contact</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
