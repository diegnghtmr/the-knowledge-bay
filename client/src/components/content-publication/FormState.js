import { useCallback, useRef, useState } from 'react';

/**
 * Hook personalizado para manejar estados de formulario
 * Esta versión está adaptada específicamente para ContentPublicationForm
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} validateForm - Función para validación de campos
 * @param {Function} onSubmit - Función que se ejecuta al enviar el formulario
 */
const useFormState = (initialValues, validateForm, onSubmitFn) => {
  // Estados
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pending = useRef(false);

  // Validar el formulario
  const validate = () => {
    if (validateForm) {
      const formErrors = validateForm(values);
      setErrors(formErrors);
      return Object.keys(formErrors).length === 0;
    }
    return true;
  };

  // Manejar cambios en campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Establecer un valor de campo específico (útil para archivos)
  const setFieldValue = useCallback((name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  }, []);

  // Establecer todos los valores del formulario (útil para reset)
  const setAllValues = (newValues) => {
    setValues(newValues);
    // También limpiar errores y touched al resetear
    setErrors({});
    setTouched({});
  };

  // Manejar pérdida de foco
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    // Validar al perder el foco
    validate();
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending.current) return;
    setTouched(
      Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    if (!validate() || !onSubmitFn) return;

    pending.current = true;
    setIsSubmitting(true);
    try {
      await onSubmitFn(values);
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setAllValues,
  };
};

export default useFormState; 