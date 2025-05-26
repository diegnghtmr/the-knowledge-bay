import React from 'react';
import FormField from './FormField';

/**
 * Campo de texto para formularios
 */
const TextField = ({
  label,
  icon, // Added icon prop
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  showError,
  inputRef,
  type = 'text',
  required = false,
  className = '',
  ...restProps // Capturar todas las demás props (id, name, required, etc.)
}) => {
  return (
    <FormField
      label={label}
      icon={icon} // Pass icon prop to FormField
      error={error}
      showError={showError}
      required={required}
    >
      <input
        ref={inputRef}
        type={type}
        className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
          error && showError 
            ? 'border-red-500 ring-red-200' 
            : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
        } ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...restProps} // Pasar todas las props adicionales al input
      />
    </FormField>
  );
};

export default TextField; 