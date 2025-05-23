import React from 'react';
import TextField from './TextField';
import TextareaField from './TextareaField';
import SelectField from './SelectField';
import DateField from './DateField';
import RadioGroupField from './RadioGroupField';
import FormButtons from './FormButtons';
import useFormState from './useFormState';
import { BookOpen, AlertCircle, Calendar } from 'lucide-react'; // Removed User, CheckCircle

/**
 * Formulario de solicitud de ayuda
 * Implementación modular usando componentes individuales
 */
const HelpRequestForm = ({ onSave, onCancel }) => {
  // Valores iniciales del formulario
  const initialValues = {
    topic: '',
    info: '',
    urgency: '',
    date: '',
    // student: '', // Removed student
    // completed: false // Removed completed
  };
  
  // Campos requeridos para validación
  const requiredFields = ['topic', 'info', 'urgency', 'date']; // Removed student
  
  // Hook para manejar el estado del formulario
  const { 
    formValues, 
    errors, 
    isValid, 
    refs, 
    handleChange, 
    handleBlur, 
    shouldShowError,
    handleSubmit 
  } = useFormState(initialValues, requiredFields);

  // Opciones para el selector de urgencia
  const urgencyOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'crítica', label: 'Crítica' }
  ];
  
  // Opciones para los botones de radio de "Completado" - Removed
  // const completedOptions = [
  //   { value: 'yes', label: 'Sí', checked: true, accentClass: 'accent-[var(--coastal-sea)]' },
  //   { value: 'no', label: 'No', checked: false, accentClass: 'accent-red-600' }
  // ];

  // Manejar el envío del formulario
  const handleFormSubmit = (e) => {
    handleSubmit(e, onSave);
  };

  return (
    // Removed the outer div with border/shadow, as it's handled by the page component
    <form onSubmit={handleFormSubmit} className="space-y-6 p-2" noValidate>
      <TextField
        id="topic" // It's good practice to add id for accessibility
        label="Tema"
        icon={<BookOpen className="text-[var(--coastal-sea)]" size={20} />}
        value={formValues.topic}
        onChange={handleChange('topic')}
        onBlur={handleBlur('topic')}
        placeholder="Ej. Ayuda con tarea de Matemáticas"
        error={errors.topic}
        showError={shouldShowError('topic')}
        inputRef={refs.topic}
        // className prop removed to use default TextField styling
        required // Assuming this field is required based on original structure
      />

      <TextareaField
        id="info"
        label="Información"
        icon={<AlertCircle className="text-[var(--coastal-sea)]" size={20} />}
        value={formValues.info}
        onChange={handleChange('info')}
        onBlur={handleBlur('info')}
        placeholder="Describe brevemente el problema…"
        error={errors.info}
        showError={shouldShowError('info')}
        inputRef={refs.info}
        rows={3}
        // className prop removed
        required // Assuming this field is required
      />

      {/* Dos columnas para Urgencia y Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Increased gap to match typical form spacing */}
        <SelectField
          id="urgency"
          label="Urgencia"
          icon={<AlertCircle className="text-[var(--coastal-sea)]" size={20} />}
          value={formValues.urgency}
          onChange={handleChange('urgency')}
          onBlur={handleBlur('urgency')}
          options={urgencyOptions}
          placeholder="Seleccionar nivel…"
          error={errors.urgency}
          showError={shouldShowError('urgency')}
          inputRef={refs.urgency}
          // className prop removed
          required // Assuming this field is required
        />

        <DateField
          id="date"
          label="Fecha"
          icon={<Calendar className="text-[var(--coastal-sea)]" size={20} />}
          value={formValues.date}
          onChange={handleChange('date')}
          onBlur={handleBlur('date')}
          error={errors.date}
          showError={shouldShowError('date')}
          inputRef={refs.date}
          // className prop removed
          required // Assuming this field is required
        />
      </div>

      {/* TextField for student removed */}
      {/* RadioGroupField for completed removed */}

      {/* Línea divisoria - can be kept if desired, or removed if ContentPublicationForm doesn't have one */}
      {/* <div className="border-t border-[var(--coastal-sea)]/10 pt-4 mt-4"></div> */}

      <FormButtons
        submitText="Guardar Solicitud" // Changed from submitLabel
        cancelText="Cancelar"         // Added cancelText for consistency
        onCancel={onCancel}
        isSubmitting={!isValid} // Or use a dedicated isSubmitting state if available from useFormState
        // Removed custom classNames to use default FormButton styles
      />
    </form>
  );
};

export default HelpRequestForm; 