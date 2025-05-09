import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ModalBase = ({ title, onClose, children }) => {
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

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4) !important' }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
      >
        {/* Cabecera del modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-[var(--sand)]">
          <h2 className="text-xl font-semibold text-[var(--deep-sea)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

ModalBase.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default ModalBase; 