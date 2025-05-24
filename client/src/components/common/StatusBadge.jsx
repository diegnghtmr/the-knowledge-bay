import React from 'react';

/**
 * Componente para mostrar badges de estado en las tablas
 * @param {Object} props - Propiedades del componente
 * @param {String} props.text - Texto a mostrar en el badge
 * @param {String} props.variant - Variante de color: 'success', 'warning', 'danger', 'info', 'default'
 * @param {ReactNode} props.icon - Icono opcional para mostrar junto al texto
 * @param {String} props.className - Clases adicionales para el badge
 */
const StatusBadge = ({ text, variant = 'default', icon, className = '' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'primary':
        return 'bg-[var(--coastal-sea)]/10 text-[var(--coastal-sea)] border border-[var(--coastal-sea)]/20';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getVariantClasses()} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </span>
  );
};

export default StatusBadge; 