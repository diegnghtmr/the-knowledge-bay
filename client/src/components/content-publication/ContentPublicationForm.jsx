import React, { useState, useEffect } from 'react';
import useFormState from './FormState';
import TextField from '../help/TextField';
import AutoResizingTextarea from '../common/AutoResizingTextarea';
import SelectField from '../help/SelectField';
import FormButtons from '../help/FormButtons';
import InterestSelector from './InterestSelector';
import { FileUp, Video, Tags, Type, Heading1, AlertCircle, Link, MessageSquare } from 'lucide-react';

const contentTypes = [
  { value: 'ARTICLE', label: 'Artículo' },
  { value: 'QUESTION', label: 'Pregunta' },
  { value: 'LINK', label: 'Enlace' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'RESOURCE', label: 'Archivo' },
];

// Configuración dinámica para cada tipo de contenido
const getContentConfig = (contentType) => {
  const configs = {
    ARTICLE: {
      placeholder: "Escribe aquí tu artículo. Puedes usar Markdown para formatear el texto, agregar enlaces, listas, código, etc.\n\nEjemplo:\n# Título Principal\n## Subtítulo\n- Lista de elementos\n- Otro elemento\n\n```javascript\nconst ejemplo = 'código';\n```\n\n[Enlace ejemplo](https://ejemplo.com)",
      minHeight: "200px",
      maxHeight: "600px",
      showBodyField: true,
      showSpecialField: false,
      specialFieldType: null
    },
    QUESTION: {
      placeholder: "Describe tu pregunta de forma clara y detallada. Incluye:\n\n• Contexto de la situación\n• Lo que has intentado hacer\n• Qué resultado esperas\n• Cualquier error o problema específico\n\nCuanto más detallada sea tu pregunta, mejor podrán ayudarte otros usuarios.",
      minHeight: "150px",
      maxHeight: "400px",
      showBodyField: true,
      showSpecialField: false,
      specialFieldType: null
    },
    LINK: {
      placeholder: "Describe brevemente el enlace que estás compartiendo. Explica:\n\n• Qué contiene la página/sitio\n• Por qué es útil o interesante\n• Para quién está dirigido\n• Qué pueden aprender o encontrar ahí\n\nEsto ayudará a otros usuarios a entender el valor del enlace.",
      minHeight: "120px",
      maxHeight: "300px",
      showBodyField: true,
      showSpecialField: true,
      specialFieldType: 'link'
    },
    VIDEO: {
      placeholder: "Describe el contenido del video que estás compartiendo. Incluye:\n\n• Tema principal del video\n• Duración aproximada\n• Nivel (principiante, intermedio, avanzado)\n• Puntos clave que se tratan\n• Por qué lo recomiendas\n\nEsto ayudará a otros a decidir si el video les será útil.",
      minHeight: "120px",
      maxHeight: "300px",
      showBodyField: true,
      showSpecialField: true,
      specialFieldType: 'video'
    },
    RESOURCE: {
      placeholder: "Describe el archivo que estás compartiendo. Explica:\n\n• Qué contiene el archivo\n• Cómo puede ser útil\n• Para qué tipo de proyecto o situación\n• Instrucciones de uso si es necesario\n• Requisitos o dependencias\n\nUna buena descripción ayuda a que otros encuentren y usen tu recurso.",
      minHeight: "120px",
      maxHeight: "300px",
      showBodyField: true,
      showSpecialField: true,
      specialFieldType: 'file'
    }
  };
  
  return configs[contentType] || configs.ARTICLE;
};

// Límites de archivo prudentes
const FILE_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB en bytes
  allowedTypes: [
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Texto
    'text/plain',
    'text/csv',
    // Imágenes
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Código/comprimidos
    'application/zip',
    'application/x-rar-compressed',
    'application/json',
    'text/javascript',
    'text/css',
    'text/html'
  ]
};

const ContentPublicationForm = ({ onPublish, onCancel, initialData = {} }) => {
  const initialState = {
    title: initialData.title || '',
    contentType: initialData.contentType || 'ARTICLE',
    body: initialData.body || '',
    linkUrl: initialData.linkUrl || '',
    videoUrl: initialData.videoUrl || '',
    file: null,
  };
  
  const initialInterests = initialData.topics || [];
  
  // Manejar los temas/intereses por separado
  const [selectedInterests, setSelectedInterests] = useState(initialInterests);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setAllValues,
  } = useFormState(initialState, validateForm, onSubmit);

  function validateForm(values) {
    const errors = {};
    const config = getContentConfig(values.contentType);
    
    if (!values.title.trim()) errors.title = 'El título es obligatorio.';
    if (values.title.length > 150) errors.title = 'El título no puede exceder los 150 caracteres.';
    if (!values.contentType) errors.contentType = 'Debes seleccionar un tipo de contenido.';
    
    // Validación del cuerpo (siempre requerido)
    if (config.showBodyField && !values.body.trim()) {
      errors.body = 'La descripción del contenido es obligatoria.';
    }
    
    // Validaciones específicas por tipo
    if (config.specialFieldType === 'link' && !values.linkUrl.trim()) {
      errors.linkUrl = 'La URL del enlace es obligatoria.';
    } else if (config.specialFieldType === 'link' && !isValidHttpUrl(values.linkUrl)) {
      errors.linkUrl = 'Por favor, introduce una URL válida (http/https).';
    }
    
    if (config.specialFieldType === 'video' && !values.videoUrl.trim()) {
      errors.videoUrl = 'La URL del video es obligatoria.';
    } else if (config.specialFieldType === 'video' && !isValidHttpUrl(values.videoUrl)) {
      errors.videoUrl = 'Por favor, introduce una URL válida (http/https).';
    }
    
    if (config.specialFieldType === 'file' && !values.file) {
      errors.file = 'Debes adjuntar un archivo.';
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

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async function onSubmit() {
    console.log('Publicando contenido:', { ...values, topics: selectedInterests });
    const submissionData = {
      ...values,
      topics: selectedInterests,
    };
    onPublish(submissionData);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFieldValue('file', null);
      return;
    }

    // Validar tamaño
    if (file.size > FILE_LIMITS.maxSize) {
      alert(`El archivo es demasiado grande. Tamaño máximo permitido: ${formatFileSize(FILE_LIMITS.maxSize)}`);
      e.target.value = '';
      return;
    }

    // Validar tipo
    if (!FILE_LIMITS.allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Tipos aceptados: PDF, Word, Excel, PowerPoint, imágenes, texto, código y archivos comprimidos.');
      e.target.value = '';
      return;
    }

    setFieldValue('file', file);
  };
  
  const handleInterestsChange = (newInterests) => {
    setSelectedInterests(newInterests);
  };

  // Manejar la cancelación del formulario
  const handleCancel = () => {
    // Limpiar todos los campos del formulario de una vez
    setAllValues(initialState);
    
    // Limpiar los intereses seleccionados
    setSelectedInterests(initialInterests);
    
    // Llamar la función onCancel si fue proporcionada
    if (onCancel) {
      onCancel();
    }
  };

  // Limpiar campos específicos cuando cambia el tipo de contenido
  useEffect(() => {
    const config = getContentConfig(values.contentType);
    
    // Limpiar campos que no corresponden al tipo actual
    if (config.specialFieldType !== 'link' && values.linkUrl) {
      setFieldValue('linkUrl', '');
    }
    if (config.specialFieldType !== 'video' && values.videoUrl) {
      setFieldValue('videoUrl', '');
    }
    if (config.specialFieldType !== 'file' && values.file) {
      setFieldValue('file', null);
    }
  }, [values.contentType, setFieldValue]);

  // Obtener configuración del tipo actual
  const currentConfig = getContentConfig(values.contentType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2" noValidate>
      <TextField
        id="title"
        name="title"
        label="Título de la Publicación"
        value={values.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.title}
        placeholder="Ej: Introducción a React Hooks"
        icon={<Heading1 className="text-[var(--coastal-sea)]" size={20} />}
        required
      />

      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <Type className="text-[var(--coastal-sea)]" size={20} />
          <label className="block text-sm font-workSans-bold text-[var(--open-sea)]">
            Tipo de Contenido
            <span className="text-red-500 ml-1">*</span>
          </label>
        </div>
        <select
          id="contentType"
          name="contentType"
          value={values.contentType}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full border rounded-md p-2 bg-white focus:outline-none focus:ring-2 ${
            errors.contentType 
              ? 'border-red-500 ring-red-200' 
              : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
          }`}
          required
        >
          {contentTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.contentType && <p className="text-red-600 text-xs mt-1">{errors.contentType}</p>}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <Tags className="text-[var(--coastal-sea)]" size={20} />
          <label className="block text-sm font-workSans-bold text-[var(--open-sea)]">
            Temas / Etiquetas
            <span className="text-red-500 ml-1">*</span>
          </label>
        </div>
        <InterestSelector 
          selectedInterests={selectedInterests}
          onInterestsChange={handleInterestsChange}
        />
        {errors.topics && <p className="mt-1 text-xs text-red-600">{errors.topics}</p>}
      </div>

      {/* Campo de cuerpo de contenido - siempre aparece con placeholder dinámico */}
      {currentConfig.showBodyField && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="text-[var(--coastal-sea)]" size={20} />
            <label className="block text-sm font-workSans-bold text-[var(--open-sea)]">
              Descripción del Contenido
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          <AutoResizingTextarea
            id="body"
            name="body"
            value={values.body}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.body}
            placeholder={currentConfig.placeholder}
            minHeight={currentConfig.minHeight}
            maxHeight={currentConfig.maxHeight}
          />
          {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
        </div>
      )}

      {/* Campo específico para ENLACE */}
      {currentConfig.specialFieldType === 'link' && (
        <TextField
          id="linkUrl"
          name="linkUrl"
          label="URL del Enlace"
          value={values.linkUrl}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.linkUrl}
          placeholder="Ej: https://ejemplo.com/articulo-interesante"
          icon={<Link className="text-[var(--coastal-sea)]" size={20} />}
          required
        />
      )}

      {/* Campo específico para VIDEO */}
      {currentConfig.specialFieldType === 'video' && (
        <TextField
          id="videoUrl"
          name="videoUrl"
          label="URL del Video"
          value={values.videoUrl}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.videoUrl}
          placeholder="Ej: https://www.youtube.com/watch?v=... o https://vimeo.com/..."
          icon={<Video className="text-[var(--coastal-sea)]" size={20} />}
          required
        />
      )}

      {/* Campo específico para ARCHIVO */}
      {currentConfig.specialFieldType === 'file' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <FileUp className="text-[var(--coastal-sea)]" size={20} />
            <label htmlFor="file" className="block text-sm font-workSans-bold text-[var(--open-sea)]">
              Adjuntar Archivo
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          <div className="mt-1 flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-[var(--coastal-sea)] focus-within:border-[var(--coastal-sea)]">
            <FileUp className="text-[var(--coastal-sea)]" size={20} />
            <input
              id="file"
              name="file"
              type="file"
              onChange={handleFileChange}
              onBlur={handleBlur}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.json,.js,.css,.html"
              className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--coastal-sea)] file:text-white hover:file:bg-opacity-90"
            />
          </div>
          {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
          {values.file && (
            <div className="mt-1 text-xs text-gray-500">
              <p>Archivo seleccionado: {values.file.name}</p>
              <p>Tamaño: {formatFileSize(values.file.size)}</p>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Tamaño máximo: {formatFileSize(FILE_LIMITS.maxSize)}. 
            Tipos permitidos: PDF, Word, Excel, PowerPoint, imágenes, texto, código y archivos comprimidos.
          </p>
        </div>
      )}

      <FormButtons
        submitText="Publicar Contenido"
        cancelText="Cancelar"
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

export default ContentPublicationForm; 