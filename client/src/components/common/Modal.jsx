import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/50 backdrop-blur-sm
        transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={`
          bg-[var(--sand)] rounded-lg p-6 w-full max-w-md mx-4 sm:mx-auto
          shadow-[0_0_15px_rgba(0,0,0,0.1)]
          transform transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
          hover:shadow-[0_0_20px_rgba(0,0,0,0.15)]
          touch-pan-y
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-[var(--coastal-sea)] mb-4">
          {title && (
            <h3
              id="modal-title"
              className="text-xl font-semibold text-[var(--deep-sea)] transition-colors"
            >
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className={`
              text-[var(--open-sea)] text-2xl leading-none p-1 rounded-full
              transition-all duration-200 ease-in-out
              hover:text-[var(--coastal-sea)] hover:bg-[var(--coastal-sea)]/10
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]
            `}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-[var(--coastal-sea)] scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Modal.defaultProps = {
  title: '',
};

export default Modal;