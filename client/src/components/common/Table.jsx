import React from 'react';

/**
 * Componente de tabla reutilizable para diferentes secciones de la aplicación
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.columns - Array de objetos que definen las columnas de la tabla con las propiedades: key, label, className
 * @param {Array} props.data - Array de objetos con los datos a mostrar en la tabla
 * @param {Function} props.renderCell - Función que renderiza una celda (recibe row, column, index)
 * @param {String} props.className - Clases adicionales para la tabla
 * @param {String} props.headerClassName - Clases adicionales para el encabezado
 * @param {String} props.bodyClassName - Clases adicionales para el cuerpo
 * @param {String} props.rowClassName - Función o string para definir clases de fila (recibe row e index)
 * @param {Object} props.emptyState - Objeto con title y message para mostrar cuando no hay datos
 * @param {Boolean} props.isLoading - Indica si la tabla está cargando datos
 */
const Table = ({
  columns,
  data,
  renderCell,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  rowClassName = "",
  emptyState = {
    title: "No hay datos disponibles",
    message: "No se encontraron elementos que coincidan con los criterios de búsqueda."
  },
  isLoading = false
}) => {
  // Si está cargando, mostrar estado de carga
  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-[var(--coastal-sea)]/10">
        <table className={`min-w-full divide-y divide-[var(--coastal-sea)]/10 text-sm ${className}`}>
          <thead className={`bg-[var(--sand)]/30 ${headerClassName}`}>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={`whitespace-nowrap px-4 py-3 text-left font-workSans-semibold text-[var(--open-sea)] ${column.className || ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--coastal-sea)]/10 bg-white">
            {Array(3).fill(0).map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                {columns.map((column) => (
                  <td key={`${column.key}-${index}`} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Si no hay datos, mostrar estado vacío
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-[var(--coastal-sea)]/10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--coastal-sea)]/10 text-[var(--coastal-sea)] mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-lg font-workSans-semibold text-[var(--deep-sea)]">{emptyState.title}</h3>
        <p className="text-sm text-[var(--open-sea)]/80 mt-1">{emptyState.message}</p>
      </div>
    );
  }

  // Determinar las clases de fila
  const getRowClassName = (row, index) => {
    if (typeof rowClassName === "function") {
      return rowClassName(row, index);
    }
    return rowClassName || "hover:bg-[var(--sand)]/20 transition-colors";
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--coastal-sea)]/10">
      <table className={`min-w-full divide-y divide-[var(--coastal-sea)]/10 text-sm ${className}`}>
        <thead className={`bg-[var(--sand)]/30 ${headerClassName}`}>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={`whitespace-nowrap px-4 py-3 text-left font-workSans-semibold text-[var(--open-sea)] ${column.className || ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-[var(--coastal-sea)]/10 bg-white ${bodyClassName}`}>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className={getRowClassName(row, rowIndex)}>
              {columns.map((column) => (
                <td 
                  key={`${row.id || rowIndex}-${column.key}`} 
                  className={`px-4 py-3 ${column.cellClassName || ""}`}
                >
                  {renderCell(row, column, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 