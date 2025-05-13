import React from 'react';

const MessageBubble = ({ message, isCurrentUser }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex w-full mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`px-3 py-2 max-w-[70%] rounded-2xl`}
        style={{ 
          backgroundColor: isCurrentUser ? 'white' : 'var(--coastal-sea)',
          color: isCurrentUser ? 'var(--deep-sea)' : 'white',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'inherit' }}>{message.text}</p>
        <div className="flex justify-end mt-1">
          <span className="text-xs" style={{ color: isCurrentUser ? 'var(--open-sea)' : 'rgba(255,255,255,0.8)' }}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 