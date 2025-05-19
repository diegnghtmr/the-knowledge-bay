import React from 'react';
import FormField from './FormField';

/**
 * Campo de grupo de radio buttons para formularios
 */
const RadioGroupField = ({
  label,
  name,
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <FormField 
      label={label}
    >
      <div className={`flex items-center gap-6 pl-1 ${className}`}>
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer text-[var(--open-sea)]">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.checked}
              onChange={onChange}
              className={option.accentClass || "accent-[var(--coastal-sea)]"}
            />
            {option.label}
          </label>
        ))}
      </div>
    </FormField>
  );
};

export default RadioGroupField; 