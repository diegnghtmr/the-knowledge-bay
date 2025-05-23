import React from 'react';

/**
 * Componente base para campos de formulario
 * Maneja la estructura común, etiquetas y mensajes de error
 */
const FormField = ({
  label,
  icon, // Added icon prop
  error,
  showError,
  children,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <div className="flex items-center gap-2 mb-1"> {/* Wrapper for icon and label */}
          {icon && <span className="flex-shrink-0">{icon}</span>} {/* Render icon if provided */}
          <label className="block text-sm font-workSans-bold text-[var(--open-sea)]">
            {label}
          </label>
        </div>
      )}

      {children}

      {error && showError && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField; 