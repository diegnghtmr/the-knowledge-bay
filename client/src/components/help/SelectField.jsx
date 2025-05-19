import React from 'react';
import FormField from './FormField';

/**
 * Campo select para formularios
 */
const SelectField = ({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Seleccionar...',
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
      <select
        ref={inputRef}
        className={`w-full border rounded-md p-2 bg-white focus:outline-none focus:ring-2 ${
          error && showError 
            ? 'border-red-500 ring-red-200' 
            : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
        } ${className}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

export default SelectField; 