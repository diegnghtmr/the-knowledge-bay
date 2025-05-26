import React from 'react';
import FormField from './FormField';

/**
 * Campo de selección (select) para formularios
 */
const SelectField = ({
  label,
  icon,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder,
  error,
  showError,
  inputRef,
  required = false,
  className = ''
}) => {
  return (
    <FormField
      label={label}
      icon={icon}
      error={error}
      showError={showError}
      required={required}
    >
      <select
        ref={inputRef}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
          error && showError 
            ? 'border-red-500 ring-red-200' 
            : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
        } ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
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