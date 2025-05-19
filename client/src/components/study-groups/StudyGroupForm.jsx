import React from 'react';
import { Users, BookOpen, Calendar } from 'lucide-react';
import TextField from '../help/TextField';
import DateField from '../help/DateField';
import FormButtons from '../help/FormButtons';
import useFormState from '../help/useFormState';
import TextareaField from '../help/TextareaField';
import SelectField from '../help/SelectField';

/**
 * Formulario de Grupos de Estudio
 * Implementación modular usando componentes reutilizables
 */
const StudyGroupForm = ({ onSave, onCancel }) => {
  // Valores iniciales del formulario
  const initialValues = {
    name: '',
    topic: '',
    description: '',
    location: '',
    modality: '',
    date: ''
  };
  
  // Campos requeridos para validación
  const requiredFields = ['name', 'topic', 'date', 'modality'];
  
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

  // Opciones para el selector de modalidad
  const modalityOptions = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hibrido', label: 'Híbrido' }
  ];

  // Manejar el envío del formulario
  const handleFormSubmit = (e) => {
    handleSubmit(e, onSave);
  };

  return (
    <div className="w-full border border-[var(--coastal-sea)]/30 rounded-lg p-6 bg-white shadow-sm">
      <form onSubmit={handleFormSubmit} className="space-y-5 max-w-3xl mx-auto">
        {/* Nombre */}
        <div className="form-group">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-[var(--coastal-sea)] w-5 h-5" />
            <label className="block font-workSans-bold text-[var(--open-sea)]">Nombre del Grupo</label>
          </div>
          <TextField
            value={formValues.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            placeholder="Ej. Cálculo Avanzado"
            error={errors.name}
            showError={shouldShowError('name')}
            inputRef={refs.name}
            className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
          />
        </div>

        {/* Tema */}
        <div className="form-group">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-[var(--coastal-sea)] w-5 h-5" />
            <label className="block font-workSans-bold text-[var(--open-sea)]">Tema de Estudio</label>
          </div>
          <TextField
            value={formValues.topic}
            onChange={handleChange('topic')}
            onBlur={handleBlur('topic')}
            placeholder="Tema principal del grupo..."
            error={errors.topic}
            showError={shouldShowError('topic')}
            inputRef={refs.topic}
            className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
          />
        </div>

        {/* Descripción */}
        <div className="form-group">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-[var(--coastal-sea)] w-5 h-5" />
            <label className="block font-workSans-bold text-[var(--open-sea)]">Descripción</label>
          </div>
          <TextareaField
            value={formValues.description}
            onChange={handleChange('description')}
            onBlur={handleBlur('description')}
            placeholder="Describe brevemente el propósito del grupo..."
            error={errors.description}
            showError={shouldShowError('description')}
            rows={3}
            className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent resize-vertical"
          />
        </div>
        
        {/* Dos columnas para Modalidad y Fecha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Modalidad */}
          <div className="form-group">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-[var(--coastal-sea)] w-5 h-5" />
              <label className="block font-workSans-bold text-[var(--open-sea)]">Modalidad</label>
            </div>
            <SelectField
              value={formValues.modality}
              onChange={handleChange('modality')}
              onBlur={handleBlur('modality')}
              options={modalityOptions}
              placeholder="Selecciona una modalidad"
              error={errors.modality}
              showError={shouldShowError('modality')}
              className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent bg-white"
            />
          </div>

          {/* Fecha */}
          <div className="form-group">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-[var(--coastal-sea)] w-5 h-5" />
              <label className="block font-workSans-bold text-[var(--open-sea)]">Fecha de Inicio</label>
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

        {/* Ubicación (opcional para presencial/híbrido) */}
        <div className="form-group">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-[var(--coastal-sea)] w-5 h-5" />
            <label className="block font-workSans-bold text-[var(--open-sea)]">
              Ubicación <span className="text-sm font-normal opacity-75">(opcional)</span>
            </label>
          </div>
          <TextField
            value={formValues.location}
            onChange={handleChange('location')}
            onBlur={handleBlur('location')}
            placeholder="Ubicación física o enlace de reunión..."
            error={errors.location}
            showError={shouldShowError('location')}
            className="w-full px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
          />
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-[var(--coastal-sea)]/10 pt-4 mt-4"></div>

        {/* Botones */}
        <FormButtons
          submitDisabled={!isValid}
          onSubmit={handleFormSubmit}
          onCancel={onCancel}
          submitLabel="Crear Grupo"
          submitClassName="bg-[var(--coastal-sea)] hover:bg-opacity-90 disabled:bg-opacity-50 text-white font-workSans-bold py-3 px-5 rounded-md transition active:scale-[0.98] text-base"
          cancelClassName="bg-white border border-[var(--coastal-sea)]/20 hover:bg-[var(--sand)]/20 text-[var(--open-sea)] font-workSans py-3 px-5 rounded-md transition active:scale-[0.98] text-base"
        />
      </form>
    </div>
  );
};

export default StudyGroupForm; 