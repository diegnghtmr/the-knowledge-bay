import React from 'react';
import ContentTable from '../content-publication/ContentTable';

/**
 * Dashboard de gestión de contenidos
 */
const ContentDashboard = () => {
  return (
    <div className="w-full space-y-8">
      {/* Título y descripción */}
      <div className="mb-6">
        <h2 className="font-righteous text-2xl text-[var(--deep-sea)] mb-2">Biblioteca de Contenidos</h2>
        <p className="text-[var(--open-sea)]/80">Gestiona, organiza y accede a todos los materiales educativos</p>
      </div>

      {/* Tabla de contenidos */}
      <ContentTable />
    </div>
  );
};

export default ContentDashboard; 