import React from 'react';
import UserTable from './users/UserTable';

/**
 * Dashboard de gestión de usuarios
 */
const UserDashboard = () => {
  return (
    <div className="w-full space-y-8">
      {/* Título y descripción */}
      <div className="mb-6">
        <h2 className="font-righteous text-2xl text-[var(--deep-sea)] mb-2">Panel de Control</h2>
        <p className="text-[var(--open-sea)]/80">Administra usuarios, consulta estadísticas y gestiona permisos</p>
      </div>

      {/* Tabla de usuarios */}
      <UserTable />
    </div>
  );
};

export default UserDashboard; 