import React from 'react';
import { Save, X } from 'lucide-react';

/**
 * Componente para botones de acciones del formulario
 */
const FormButtons = ({
  onSubmit,
  onCancel,
  submitDisabled,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  className = '',
  submitClassName = '',
  cancelClassName = ''
}) => {
  return (
    <div className={`flex justify-end gap-4 pt-2 ${className}`}>
      <button
        type="button"
        onClick={onCancel}
        className={`flex items-center justify-center gap-2 ${cancelClassName || 'px-6 py-2 rounded-md font-workSans bg-[var(--sand)] hover:bg-[var(--sand)]/80 text-[var(--open-sea)] transition active:scale-[0.98]'}`}
      >
        <X size={18} />
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={submitDisabled}
        onClick={onSubmit}
        className={`flex items-center justify-center gap-2 ${submitClassName || 'px-6 py-2 rounded-md font-workSans-bold text-white bg-[var(--coastal-sea)] hover:bg-[var(--open-sea)] disabled:bg-[var(--coastal-sea)]/50 transition active:scale-[0.98]'}`}
      >
        <Save size={18} />
        {submitLabel}
      </button>
    </div>
  );
};

export default FormButtons; 