import React from 'react';
import FormField from './FormField';

/**
 * Campo de texto para formularios
 */
const TextField = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  showError,
  inputRef,
  type = 'text',
  className = ''
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      showError={showError}
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
      />
    </FormField>
  );
};

export default TextField; 