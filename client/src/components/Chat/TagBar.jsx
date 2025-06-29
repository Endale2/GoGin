import React from 'react';
import { FiTag } from 'react-icons/fi';

const TagBar = () => {
  // This is a placeholder - in a real app, you'd get popular tags from the API
  const popularTags = ['technology', 'programming', 'discussion', 'help', 'news', 'funny'];

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <FiTag className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Popular tags:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <button
            key={tag}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagBar; 