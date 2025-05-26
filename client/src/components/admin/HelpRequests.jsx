import React from 'react';
import HelpRequestsTable from './HelpRequestsTable';

/**
 * Componente de gestión de solicitudes de ayuda para administradores
 */
const HelpRequests = () => {
  return (
    <div className="w-full space-y-8">
      {/* Título y descripción */}
      <div className="mb-6">
        <h2 className="font-righteous text-2xl text-[var(--deep-sea)] mb-2">Solicitudes de Ayuda</h2>
        <p className="text-[var(--open-sea)]/80">Gestiona y responde a las solicitudes de ayuda de los estudiantes</p>
      </div>

      {/* Tabla de solicitudes */}
      <HelpRequestsTable />
    </div>
  );
};

export default HelpRequests; 