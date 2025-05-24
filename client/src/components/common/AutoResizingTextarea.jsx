import React, { useEffect, useRef } from 'react';
import FormField from '../help/FormField';

/**
 * Campo de área de texto que se auto-redimensiona según el contenido
 * Compatible con el sistema de formularios existente
 */
const AutoResizingTextarea = ({
  label,
  icon,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  showError,
  inputRef,
  id,
  name,
  required = false,
  minHeight = '80px',
  maxHeight = '400px',
  className = ''
}) => {
  const textareaRef = useRef(null);
  
  // Usar la ref proporcionada o la interna
  const finalRef = inputRef || textareaRef;

  // Función para ajustar la altura del textarea basada en su contenido
  const adjustHeight = () => {
    const textarea = finalRef.current;
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

  // Manejar input con auto-resize
  const handleInput = (e) => {
    if (onChange) onChange(e);
    // Pequeño delay para asegurar que el DOM se actualice antes de ajustar
    setTimeout(adjustHeight, 0);
  };

  // Versión compatible con FormField (para help request)
  if (label && icon !== undefined) {
    return (
      <FormField
        label={label}
        icon={icon}
        error={error}
        showError={showError}
        className={className}
      >
        <textarea
          ref={finalRef}
          id={id}
          name={name || id}
          value={value}
          onChange={handleInput}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
            error && showError 
              ? 'border-red-500 ring-red-200' 
              : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
          }`}
          style={{
            minHeight,
            maxHeight,
            resize: 'none',
            overflowY: 'hidden'
          }}
        />
      </FormField>
    );
  }

  // Versión standalone (para content publication)
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={finalRef}
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

export default AutoResizingTextarea; 