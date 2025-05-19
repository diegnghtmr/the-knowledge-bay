import React, { useState } from 'react';
import useFormState from './FormState';
import TextField from '../help/TextField';
import AutoResizingTextarea from './AutoResizingTextarea';
import SelectField from '../help/SelectField';
import FormButtons from '../help/FormButtons';
import InterestSelector from './InterestSelector';
import { FileUp, Video, Tags, Type, Heading1 } from 'lucide-react';

const contentTypes = [
  { value: 'article', label: 'Artículo (Markdown/HTML)' },
  { value: 'video', label: 'Video (Enlace externo)' },
  { value: 'resource', label: 'Recurso (Archivo adjunto)' },
  { value: 'question', label: 'Pregunta' },
];

const ContentPublicationForm = ({ onPublish, onCancel, initialData = {} }) => {
  const initialState = {
    title: initialData.title || '',
    contentType: initialData.contentType || 'article',
    body: initialData.body || '',
    file: null,
    videoUrl: initialData.videoUrl || '',
  };
  
  // Manejar los temas/intereses por separado
  const [selectedInterests, setSelectedInterests] = useState(initialData.topics || []);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormState(initialState, validateForm, onSubmit);

  function validateForm(values) {
    const errors = {};
    if (!values.title.trim()) errors.title = 'El título es obligatorio.';
    if (values.title.length > 150) errors.title = 'El título no puede exceder los 150 caracteres.';
    if (!values.contentType) errors.contentType = 'Debes seleccionar un tipo de contenido.';
    if (!values.body.trim() && values.contentType !== 'video' && values.contentType !== 'resource') {
      errors.body = 'El cuerpo del contenido es obligatorio para este tipo.';
    }
    if (values.contentType === 'video' && !values.videoUrl.trim()) {
      errors.videoUrl = 'La URL del video es obligatoria.';
    } else if (values.contentType === 'video' && !isValidHttpUrl(values.videoUrl)) {
      errors.videoUrl = 'Por favor, introduce una URL válida (http/https).';
    }
    if (values.contentType === 'resource' && !values.file) {
      errors.file = 'Debes adjuntar un archivo para el tipo Recurso.';
    }
    if (selectedInterests.length === 0) {
      errors.topics = 'Selecciona al menos un tema para tu publicación.';
    }
    return errors;
  }

  function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  async function onSubmit() {
    // Aquí se simula el envío, luego se conectará al backend
    console.log('Publicando contenido:', { ...values, topics: selectedInterests });
    // Incluir los intereses seleccionados en los datos a enviar
    const submissionData = {
      ...values,
      topics: selectedInterests,
    };
    onPublish(submissionData);
  }

  const handleFileChange = (e) => {
    setFieldValue('file', e.target.files[0]);
  };
  
  const handleInterestsChange = (newInterests) => {
    setSelectedInterests(newInterests);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2" noValidate>
      <TextField
        id="title"
        label="Título de la Publicación"
        value={values.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.title}
        placeholder="Ej: Introducción a React Hooks"
        icon={<Heading1 className="text-[var(--coastal-sea)]" size={20} />}
        required
      />

      <SelectField
        id="contentType"
        label="Tipo de Contenido"
        value={values.contentType}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.contentType}
        options={contentTypes}
        icon={<Type className="text-[var(--coastal-sea)]" size={20} />}
        required
      />

      <InterestSelector 
        selectedInterests={selectedInterests}
        onInterestsChange={handleInterestsChange}
        label="Temas / Etiquetas"
      />
      {errors.topics && <p className="mt-1 text-xs text-red-600">{errors.topics}</p>}

      {values.contentType !== 'video' && values.contentType !== 'resource' && (
        <AutoResizingTextarea
          id="body"
          name="body"
          label="Cuerpo del Contenido"
          value={values.body}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.body}
          placeholder="Escribe aquí tu contenido. Puedes usar Markdown o pegar HTML..."
          minHeight="150px"
          maxHeight="600px"
          required={values.contentType !== 'video' && values.contentType !== 'resource'}
        />
      )}
      
      {values.contentType === 'video' && (
        <TextField
          id="videoUrl"
          label="URL del Video"
          value={values.videoUrl}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.videoUrl}
          placeholder="Ej: https://www.youtube.com/watch?v=..."
          icon={<Video className="text-[var(--coastal-sea)]" size={20} />}
          required
        />
      )}

      {values.contentType === 'resource' && (
        <div className="space-y-1">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Adjuntar Archivo
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="mt-1 flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-[var(--coastal-sea)] focus-within:border-[var(--coastal-sea)]">
            <FileUp className="text-[var(--coastal-sea)]" size={20} />
            <input
              id="file"
              name="file"
              type="file"
              onChange={handleFileChange}
              onBlur={handleBlur}
              className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--coastal-sea)] file:text-white hover:file:bg-opacity-90"
            />
          </div>
          {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
          {values.file && <p className="mt-1 text-xs text-gray-500">Archivo seleccionado: {values.file.name}</p>}
        </div>
      )}

      <FormButtons
        submitText="Publicar Contenido"
        cancelText="Cancelar"
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

export default ContentPublicationForm; 