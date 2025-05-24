import React from 'react';
import { Eye, Pencil, Trash2, Check, X } from 'lucide-react';

/**
 * Componente para mostrar acciones comunes en las tablas
 * @param {Object} props - Propiedades del componente
 * @param {Boolean} props.isEditing - Indica si está en modo edición
 * @param {Function} props.onView - Función para ver detalles
 * @param {Function} props.onEdit - Función para iniciar edición
 * @param {Function} props.onDelete - Función para eliminar
 * @param {Function} props.onConfirm - Función para confirmar edición
 * @param {Function} props.onCancel - Función para cancelar edición
 * @param {Array} props.customActions - Array de acciones personalizadas: {icon, onClick, title, className}
 */
const TableActions = ({
  isEditing = false,
  onView,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  customActions = []
}) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-3 justify-center">
        {onConfirm && (
          <button
            onClick={onConfirm}
            className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none"
            title="Guardar"
          >
            <Check size={14} />
          </button>
        )}
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
            title="Cancelar"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 justify-center">
      {onView && (
        <button
          onClick={onView}
          className="text-[var(--open-sea)]/60 hover:text-[var(--coastal-sea)] transition-colors"
          title="Ver detalles"
        >
          <Eye size={18} />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-[var(--open-sea)]/60 hover:text-[var(--coastal-sea)] transition-colors"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-[var(--open-sea)]/60 hover:text-red-500 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      )}
      {customActions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={action.className || "text-[var(--open-sea)]/60 hover:text-[var(--coastal-sea)] transition-colors"}
          title={action.title || "Acción"}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};

export default TableActions; 