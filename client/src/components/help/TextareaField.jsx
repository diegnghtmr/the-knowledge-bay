import React from 'react';
import FormField from './FormField';

/**
 * Campo de área de texto para formularios
 */
const TextareaField = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  showError,
  inputRef,
  rows = 3,
  className = ''
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      showError={showError}
    >
      <textarea
        ref={inputRef}
        rows={rows}
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

export default TextareaField; 