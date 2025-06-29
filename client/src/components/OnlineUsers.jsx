import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { FaCircle } from 'react-icons/fa';

const OnlineUsers = () => {
  const { onlineUsers, isConnected } = useWebSocket();

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center space-x-2 mb-3">
          <FaCircle className="text-red-500 text-xs" />
          <h3 className="font-semibold text-gray-900">Connection Status</h3>
        </div>
        <p className="text-sm text-gray-600">You are currently offline</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center space-x-2 mb-3">
        <FaCircle className="text-green-500 text-xs animate-pulse" />
        <h3 className="font-semibold text-gray-900">Online Users</h3>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          {onlineUsers.length}
        </span>
      </div>
      
      {onlineUsers.length === 0 ? (
        <p className="text-sm text-gray-600">No other users online</p>
      ) : (
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {user.username || 'Anonymous'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnlineUsers; 