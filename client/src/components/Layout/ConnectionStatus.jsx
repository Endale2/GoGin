import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

const ConnectionStatus = () => {
  const { isConnected, reconnectAttempts, onlineUsers, connect, disconnect, lastError } = useWebSocket();

  let status = 'disconnected';
  let color = 'bg-red-400';
  if (isConnected) {
    status = 'connected';
    color = 'bg-green-400';
  } else if (!isConnected && reconnectAttempts > 0) {
    status = `reconnecting (${reconnectAttempts})`;
    color = 'bg-yellow-400';
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${color} ring-1 ring-white`} aria-hidden="true" />
        <span className="text-sm text-gray-600">{status}</span>
      </div>

      <div className="text-sm text-gray-500">{onlineUsers?.length || 0} online</div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => { disconnect(); setTimeout(() => connect(), 300); }}
          title="Force reconnect"
          className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200"
        >
          Reconnect
        </button>
      </div>

      {lastError && (
        <div className="text-xs text-red-500" title={lastError}>
          Error
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
