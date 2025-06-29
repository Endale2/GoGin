// src/components/Tabs.js
import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex justify-center space-x-4 mb-6">
      {tabs.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center space-x-1 px-4 py-2 rounded-full transition ${
            activeTab === key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {Icon && <Icon size={18} />}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
