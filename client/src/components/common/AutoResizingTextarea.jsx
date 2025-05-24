import React, { useEffect, useRef } from 'react';
import FormField from '../help/FormField';

/**
 * Campo de área de texto que se auto-redimensiona según el contenido
 * Compatible con el sistema de formularios existente
 */
const AutoResizingTextarea = ({
  id,
  name,
  label,
  icon,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  showError,
  inputRef,
  minHeight = "100px",
  maxHeight = "300px",
  required = false,
  className = ''
}) => {
  const textareaRef = useRef(null);
  
  // Función para auto-redimensionar
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to calculate new height
      textarea.style.height = minHeight;
      
      // Set to scroll height but respect max height
      const scrollHeight = textarea.scrollHeight;
      const maxHeightValue = parseInt(maxHeight);
      const newHeight = Math.min(scrollHeight, maxHeightValue);
      
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Auto-resize cuando cambia el valor
  useEffect(() => {
    autoResize();
  }, [value]);

  // Auto-resize inicial
  useEffect(() => {
    autoResize();
  }, []);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    // Pequeño delay para asegurar que el valor se haya actualizado
    setTimeout(autoResize, 0);
  };

  // Determinar si usar FormField o renderizar directamente
  if (label || icon) {
    return (
      <FormField
        label={label}
        icon={icon}
        error={error}
        showError={showError}
        required={required}
        className={className}
      >
        <textarea
          ref={(node) => {
            textareaRef.current = node;
            if (inputRef) {
              if (typeof inputRef === 'function') {
                inputRef(node);
              } else {
                inputRef.current = node;
              }
            }
          }}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full border rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 ${
            error && showError 
              ? 'border-red-500 ring-red-200' 
              : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
          }`}
          style={{
            minHeight: minHeight,
            maxHeight: maxHeight,
          }}
        />
      </FormField>
    );
  }

  // Modo standalone (sin FormField)
  return (
    <textarea
      ref={(node) => {
        textareaRef.current = node;
        if (inputRef) {
          if (typeof inputRef === 'function') {
            inputRef(node);
          } else {
            inputRef.current = node;
          }
        }
      }}
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full border rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50 ${className}`}
      style={{
        minHeight: minHeight,
        maxHeight: maxHeight,
      }}
    />
  );
};

export default AutoResizingTextarea; 