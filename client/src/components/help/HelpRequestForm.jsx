import React from 'react';
import TextField from './TextField';
import TextareaField from './TextareaField';
import SelectField from './SelectField';
import DateField from './DateField';
import RadioGroupField from './RadioGroupField';
import FormButtons from './FormButtons';
import useFormState from './useFormState';
import { BookOpen, AlertCircle, Calendar, User, CheckCircle } from 'lucide-react';

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
    student: '',
    completed: false
  };
  
  // Campos requeridos para validación
  const requiredFields = ['topic', 'info', 'urgency', 'date', 'student'];
  
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
  
  // Opciones para los botones de radio de "Completado"
  const completedOptions = [
    { value: 'yes', label: 'Sí', checked: true, accentClass: 'accent-[var(--coastal-sea)]' },
    { value: 'no', label: 'No', checked: false, accentClass: 'accent-red-600' }
  ];

  // Manejar el envío del formulario
  const handleFormSubmit = (e) => {
    handleSubmit(e, onSave);
  };

  return (
    <div className="w-full border border-[var(--coastal-sea)]/30 rounded-lg p-6 bg-white shadow-sm">
      <form onSubmit={handleFormSubmit} className="space-y-5 max-w-3xl mx-auto">
        {/* Tema */}
        <div className="form-group">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-[var(--coastal-sea)] w-5 h-5" />
            <label className="block font-workSans-bold text-[var(--open-sea)]">Tema</label>
          </div>
          <TextField
            value={formValues.topic}
            onChange={handleChange('topic')}
            onBlur={handleBlur('topic')}
            placeholder="Ej. Ayuda con tarea de Matemáticas"
            error={errors.topic}
            showError={shouldShowError('topic')}
            inputRef={refs.topic}
            className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
          />
        </div>

        {/* Información */}
        <div className="form-group">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-[var(--coastal-sea)] w-5 h-5" />
            <label className="block font-workSans-bold text-[var(--open-sea)]">Información</label>
          </div>
          <TextareaField
            value={formValues.info}
            onChange={handleChange('info')}
            onBlur={handleBlur('info')}
            placeholder="Describe brevemente el problema…"
            error={errors.info}
            showError={shouldShowError('info')}
            inputRef={refs.info}
            rows={3}
            className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent resize-vertical"
          />
        </div>

        {/* Dos columnas para Urgencia y Fecha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Urgencia */}
          <div className="form-group">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-[var(--coastal-sea)] w-5 h-5" />
              <label className="block font-workSans-bold text-[var(--open-sea)]">Urgencia</label>
            </div>
            <SelectField
              value={formValues.urgency}
              onChange={handleChange('urgency')}
              onBlur={handleBlur('urgency')}
              options={urgencyOptions}
              placeholder="Seleccionar nivel…"
              error={errors.urgency}
              showError={shouldShowError('urgency')}
              inputRef={refs.urgency}
              className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent bg-white"
            />
          </div>

          {/* Fecha */}
          <div className="form-group">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-[var(--coastal-sea)] w-5 h-5" />
              <label className="block font-workSans-bold text-[var(--open-sea)]">Fecha</label>
            </div>
            <DateField
              value={formValues.date}
              onChange={handleChange('date')}
              onBlur={handleBlur('date')}
              error={errors.date}
              showError={shouldShowError('date')}
              inputRef={refs.date}
              className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
            />
          </div>
        </div>

        {/* Estudiante */}
        <div className="form-group">
          <div className="flex items-center gap-2 mb-2">
            <User className="text-[var(--coastal-sea)] w-5 h-5" />
            <label className="block font-workSans-bold text-[var(--open-sea)]">Estudiante</label>
          </div>
          <TextField
            value={formValues.student}
            onChange={handleChange('student')}
            onBlur={handleBlur('student')}
            placeholder="Nombre del estudiante…"
            error={errors.student}
            showError={shouldShowError('student')}
            inputRef={refs.student}
            className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
          />
        </div>

        {/* Completado */}
        <div className="form-group">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-[var(--coastal-sea)] w-5 h-5" />
            <label className="block font-workSans-bold text-[var(--open-sea)]">Completado</label>
          </div>
          <RadioGroupField
            name="completed"
            options={completedOptions}
            value={formValues.completed}
            onChange={handleChange('completed')}
            className="flex gap-4"
          />
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-[var(--coastal-sea)]/10 pt-4 mt-4"></div>

        {/* Botones */}
        <FormButtons
          submitDisabled={!isValid}
          onSubmit={handleFormSubmit}
          onCancel={onCancel}
          submitLabel="Guardar Solicitud"
          submitClassName="bg-[var(--coastal-sea)] hover:bg-opacity-90 disabled:bg-opacity-50 text-white font-workSans-bold py-3 px-5 rounded-md transition active:scale-[0.98] text-base"
          cancelClassName="bg-white border border-[var(--coastal-sea)]/20 hover:bg-[var(--sand)]/20 text-[var(--open-sea)] font-workSans py-3 px-5 rounded-md transition active:scale-[0.98] text-base"
        />
      </form>
    </div>
  );
};

export default HelpRequestForm; 