import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  // Función para ajustar automáticamente la altura del textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Resetear altura
      const scrollHeight = textarea.scrollHeight;
      // Establecer una altura máxima para evitar que el área de texto sea demasiado grande
      textarea.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [message]);
  
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  // Manejar envío al presionar Enter (sin Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit(e);
    }
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
            ref={textareaRef}
            type="text"
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full p-2 px-4 rounded-full text-sm focus:outline-none"
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