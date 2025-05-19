import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const AutoResizingTextarea = ({
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  label,
  id,
  name,
  required = false,
  minHeight = '100px',
  maxHeight = '500px',
  className = ''
}) => {
  const textareaRef = useRef(null);

  // Esta función ajusta la altura del textarea basada en su contenido
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Resetear la altura para calcular correctamente
    textarea.style.height = 'auto';
    
    // Establecer la altura basada en el contenido
    const scrollHeight = textarea.scrollHeight;
    
    // Si hay un máximo, limitar la altura
    if (maxHeight) {
      const maxHeightPx = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
      const scrollHeightValue = parseFloat(scrollHeight);
      const maxHeightValue = parseFloat(maxHeightPx);
      
      if (scrollHeightValue > maxHeightValue) {
        textarea.style.height = maxHeightPx;
        textarea.style.overflowY = 'auto';
        return;
      }
    }
    
    // Si hay un mínimo, asegurar que la altura no sea menor
    if (minHeight) {
      const minHeightPx = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
      const scrollHeightValue = parseFloat(scrollHeight);
      const minHeightValue = parseFloat(minHeightPx);
      
      if (scrollHeightValue < minHeightValue) {
        textarea.style.height = minHeightPx;
        return;
      }
    }
    
    textarea.style.height = `${scrollHeight}px`;
    textarea.style.overflowY = 'hidden';
  };

  // Ajustar altura cuando cambia el valor
  useEffect(() => {
    adjustHeight();
  }, [value]);

  // Ajustar altura cuando se monta el componente
  useEffect(() => {
    adjustHeight();
  }, []);

  const handleInput = (e) => {
    onChange(e);
    adjustHeight();
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={textareaRef}
        id={id}
        name={name || id}
        value={value}
        onChange={handleInput}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] ${className}`}
        style={{
          minHeight,
          maxHeight,
          resize: 'none',
          overflowY: 'hidden'
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

AutoResizingTextarea.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  required: PropTypes.bool,
  minHeight: PropTypes.string,
  maxHeight: PropTypes.string,
  className: PropTypes.string
};

export default AutoResizingTextarea; 