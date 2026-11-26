import { useEffect, useRef } from 'react';
import FormField from '../help/FormField';

/**
 * Campo de área de texto que se auto-redimensiona según el contenido
 * Compatible con el sistema de formularios existente
 */
const AutoResizingTextarea = ({
  id,
  name,
  label,
  icon,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  showError,
  inputRef,
  minHeight = "100px",
  maxHeight = "300px",
  required = false,
  className = ''
}) => {
  const textareaRef = useRef(null);
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // When the format changes but the draft does not, retain the height
    // and let CSS clamp it to the new format's bounds.
    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  // Determinar si usar FormField o renderizar directamente
  if (label || icon) {
    return (
      <FormField
        label={label}
        icon={icon}
        error={error}
        showError={showError}
        required={required}
        className={className}
      >
        <textarea
          ref={(node) => {
            textareaRef.current = node;
            if (inputRef) {
              if (typeof inputRef === 'function') {
                inputRef(node);
              } else {
                inputRef.current = node;
              }
            }
          }}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full border rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 ${
            error && showError 
              ? 'border-red-500 ring-red-200' 
              : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
          }`}
          style={{
            minHeight: minHeight,
            maxHeight: maxHeight,
          }}
        />
      </FormField>
    );
  }

  // Modo standalone (sin FormField)
  return (
    <textarea
      ref={(node) => {
        textareaRef.current = node;
        if (inputRef) {
          if (typeof inputRef === 'function') {
            inputRef(node);
          } else {
            inputRef.current = node;
          }
        }
      }}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full border rounded-md p-2 resize-none overflow-hidden focus:outline-none focus:ring-2 border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50 ${className}`}
      style={{
        minHeight: minHeight,
        maxHeight: maxHeight,
      }}
    />
  );
};

export default AutoResizingTextarea; 