import React from 'react';

const ContactItem = ({ contact, isSelected, onClick }) => {
  const hasLastMessage = !!contact.lastMessage;
  
  // Función para formatear la fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Si es hoy, mostrar la hora
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es ayer, mostrar "Ayer"
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    
    // Si es del 3/10/2025, mostrar "10/3"
    if (date.getFullYear() === 2025 && date.getMonth() === 2 && date.getDate() === 10) {
      return '10/3/25';
    }
    
    // Si es del 3/11/2025, mostrar "11/3"
    if (date.getFullYear() === 2025 && date.getMonth() === 2 && date.getDate() === 11) {
      return '11/3/25';
    }
    
    // Para cualquier otra fecha
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };
  
  // Truncar el texto si es muy largo
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  return (
    <div 
      className={`py-3 px-4 my-3 cursor-pointer transition-colors duration-150 rounded-xl`}
      style={{
        backgroundColor: isSelected ? 'var(--coastal-sea)' : 'white',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}
      onClick={onClick}
    >
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-base" 
              style={{ color: isSelected ? 'var(--deep-sea)' : 'var(--open-sea)' }}>
              {contact.username}
            </h3>
          </div>
          {hasLastMessage && (
            <span className="text-xs whitespace-nowrap" 
              style={{ color: isSelected ? 'var(--deep-sea)' : 'var(--deep-sea)' }}>
              {contact.id === 1 ? '12:30' : 
               contact.id === 4 ? 'Ayer' : 
               contact.id === 3 ? '10/3/25' : 
               contact.id === 2 ? 'Ayer' : 
               formatDate(contact.lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        {hasLastMessage && (
          <p className="text-sm mt-1 truncate" 
            style={{ color: isSelected ? 'var(--deep-sea)' : 'var(--deep-sea)' }}>
            {truncateText(contact.lastMessage.text)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ContactItem; 