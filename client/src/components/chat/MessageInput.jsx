import { useState } from 'react';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    if (message.trim() && !disabled && await onSendMessage(message)) setMessage('');
  };
  
  const hasText = message.trim().length > 0;
  
  return (
    <div className="p-3" style={{ backgroundColor: 'var(--coastal-sea)' }}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div 
          className="w-full transition-all duration-300 ease-in-out"
          style={{ 
            paddingRight: hasText ? '50px' : '0'
          }}
        >
          <input
            type="text"
            aria-label="Escribe un mensaje"
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={event => setMessage(event.target.value)}
            disabled={disabled}
            className="w-full min-h-9 p-2 px-4 rounded-full text-sm focus:outline-none"
            style={{ 
              borderColor: 'transparent', 
              color: 'var(--deep-sea)',
              backgroundColor: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              opacity: disabled ? 0.7 : 1
            }}
          />
        </div>
        
        <button 
          type="submit"
          aria-label="Enviar mensaje"
          className="absolute right-0 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out"
          disabled={!hasText || disabled}
          style={{ 
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            opacity: hasText && !disabled ? '1' : '0',
            transform: hasText && !disabled ? 'translateX(0) scale(1)' : 'translateX(10px) scale(0.8)',
            pointerEvents: hasText && !disabled ? 'auto' : 'none'
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
              color: 'var(--coastal-sea)'
            }}
          >
            <path 
              d="M22 2L11 13" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M22 2L15 22L11 13L2 9L22 2Z" 
              fill="currentColor" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput; 