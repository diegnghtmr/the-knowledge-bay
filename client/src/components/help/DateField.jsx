import React from 'react';
import FormField from './FormField';

/**
 * Campo de fecha para formularios
 */
const DateField = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  showError,
  inputRef,
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
        type="date"
        className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
          error && showError 
            ? 'border-red-500 ring-red-200' 
            : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
        } ${className}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </FormField>
  );
};

export default DateField; 