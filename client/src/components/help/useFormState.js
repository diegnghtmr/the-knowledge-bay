import { useState, useRef } from 'react';

/**
 * Hook personalizado para manejar estados de formulario
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Array} requiredFields - Lista de campos obligatorios
 * @param {Function} validateForm - Función opcional para validación adicional
 */
const useFormState = (initialValues, requiredFields = [], validateForm = null) => {
  // Estado del formulario
  const [formValues, setFormValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  // Referencias para los campos (para focus)
  const refs = {};
  requiredFields.forEach(field => {
    refs[field] = useRef(null);
  });

  // Validación básica - campos obligatorios
  const errors = {};
  requiredFields.forEach(field => {
    const value = formValues[field];
    
    // Para arrays (como topics), verificar si está vacío
    if (Array.isArray(value)) {
      if (value.length === 0) {
        errors[field] = 'Debe agregar al menos un elemento';
      }
    } else {
      // Para otros tipos de campos
      if (value === undefined || value === null || value === '') {
        errors[field] = 'Obligatorio';
      }
    }
  });

  // Validación adicional personalizable
  if (validateForm) {
    const customErrors = validateForm(formValues);
    Object.assign(errors, customErrors);
  }

  const isValid = Object.keys(errors).length === 0;

  // Manejar cambios en los campos
  const handleChange = field => e => {
    const value = e.target.type === 'checkbox' 
      ? e.target.checked 
      : e.target.value;
    
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  // Manejar cuando un campo pierde el foco
  const handleBlur = field => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Determinar si se debe mostrar un error
  const shouldShowError = field => {
    return (touched[field] || submitted) && errors[field];
  };

  // Manejar envío del formulario
  const handleSubmit = (e, onSubmit) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (isValid) {
      onSubmit?.(formValues);
    } else {
      // Foco al primer campo con error
      const firstErrorField = requiredFields.find(field => errors[field]);
      if (firstErrorField && refs[firstErrorField].current) {
        refs[firstErrorField].current.focus();
      }
    }
  };

  return {
    formValues,
    setFormValues,
    touched,
    submitted,
    errors,
    isValid,
    refs,
    handleChange,
    handleBlur,
    shouldShowError,
    handleSubmit
  };
};

export default useFormState; 