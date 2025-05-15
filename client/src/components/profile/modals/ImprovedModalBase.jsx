import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { BookOpenIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ImprovedModalBase = ({ title, onClose, children, customIcon }) => {
  const modalRef = useRef(null);

  // Cerrar el modal al hacer clic fuera o presionar ESC
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Si se proporciona un ícono personalizado, usarlo; de lo contrario, usar el ícono de libro predeterminado
  const IconComponent = customIcon || BookOpenIcon;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div 
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          maxWidth: '28rem',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}
      >
        {/* Cabecera del modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'var(--sand)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconComponent 
              style={{ 
                width: '30px', 
                height: '30px', 
                marginRight: '10px', 
                color: '#2A9D8F' 
              }}
            />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--deep-sea)'
            }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#6b7280',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0
            }}
            aria-label="Cerrar"
          >
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          </button>
        </div>
        
        {/* Contenido del modal */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

ImprovedModalBase.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  customIcon: PropTypes.elementType
};

export default ImprovedModalBase; 