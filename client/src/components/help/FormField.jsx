import React from 'react';

/**
 * Componente base para campos de formulario
 * Maneja la estructura común, etiquetas y mensajes de error
 */
const FormField = ({ 
  label, 
  error, 
  showError, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-workSans-bold text-[var(--open-sea)] mb-1">
          {label}
        </label>
      )}
      
      {children}
      
      {error && showError && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField; 