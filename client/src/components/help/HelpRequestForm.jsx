import React from 'react';
import SelectField from './SelectField';
import InterestSelector from './InterestSelector';
import AutoResizingTextarea from '../common/AutoResizingTextarea';
import FormButtons from './FormButtons';
import useFormState from './useFormState';
import { BookOpen, AlertCircle } from 'lucide-react';

/**
 * Formulario de solicitud de ayuda
 * Implementación modular usando componentes individuales
 */
const HelpRequestForm = ({ onSave, onCancel }) => {
  // Valores iniciales del formulario
  const initialValues = {
    topics: [], // Array de temas de interés seleccionados
    information: '', // Descripción del problema
    urgency: '' // Nivel de urgencia
    // Removidos: date, student, completed (se manejan en el backend)
  };
  
  // Campos requeridos para validación
  const requiredFields = ['topics', 'information', 'urgency'];
  
  // Hook para manejar el estado del formulario
  const { 
    formValues, 
    errors, 
    isValid, 
    refs, 
    handleChange, 
    handleBlur, 
    shouldShowError,
    handleSubmit,
    setFormValues 
  } = useFormState(initialValues, requiredFields);

  // Opciones para el selector de urgencia (alineadas con el backend)
  const urgencyOptions = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'CRITICAL', label: 'Crítica' }
  ];

  // Manejar el envío del formulario
  const handleFormSubmit = (e) => {
    handleSubmit(e, onSave);
  };

  // Manejar la cancelación del formulario
  const handleCancel = () => {
    // Restaurar todos los campos a sus valores iniciales
    setFormValues(initialValues);
    
    // Llamar la función onCancel si fue proporcionada
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 p-2" noValidate>
      
      {/* Selector de temas de interés */}
      <InterestSelector
        id="topics"
        label="Temas de Interés"
        icon={<BookOpen className="text-[var(--coastal-sea)]" size={20} />}
        value={formValues.topics}
        onChange={handleChange('topics')}
        onBlur={handleBlur('topics')}
        placeholder="Buscar temas de interés relacionados con tu solicitud..."
        error={errors.topics}
        showError={shouldShowError('topics')}
        inputRef={refs.topics}
        required={true}
      />

      {/* Campo de información (descripción del problema) - Auto-resizing */}
      <AutoResizingTextarea
        id="information"
        label="Información"
        icon={<AlertCircle className="text-[var(--coastal-sea)]" size={20} />}
        value={formValues.information}
        onChange={handleChange('information')}
        onBlur={handleBlur('information')}
        placeholder="Describe brevemente el problema o la ayuda que necesitas..."
        error={errors.information}
        showError={shouldShowError('information')}
        inputRef={refs.information}
        minHeight="100px"
        maxHeight="300px"
        required={true}
      />

      {/* Campo de urgencia */}
      <SelectField
        id="urgency"
        label="Nivel de Urgencia"
        icon={<AlertCircle className="text-[var(--coastal-sea)]" size={20} />}
        value={formValues.urgency}
        onChange={handleChange('urgency')}
        onBlur={handleBlur('urgency')}
        options={urgencyOptions}
        placeholder="Seleccionar nivel de urgencia..."
        error={errors.urgency}
        showError={shouldShowError('urgency')}
        inputRef={refs.urgency}
        required={true}
      />

      {/* Botones del formulario */}
      <FormButtons
        submitText="Crear Solicitud de Ayuda"
        cancelText="Cancelar"
        onCancel={handleCancel}
        isSubmitting={!isValid}
      />
    </form>
  );
};

export default HelpRequestForm; 