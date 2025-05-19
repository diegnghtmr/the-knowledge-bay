import React from "react";
import UserDashboard from "../components/dashboard/UserDashboard";
import { Link } from "react-router-dom";

/**
 * Página de gestión de usuarios
 */
const UserDashboardPage = () => {
  return (
    <div className="min-h-screen bg-cream-custom">
      <header className="bg-[var(--open-sea)] text-white p-4 shadow-md">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between">
          <h1 className="font-righteous text-xl mb-3 md:mb-0">The Knowledge Bay - Gestión de Usuarios</h1>
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/content-dashboard"
              className="bg-[var(--coastal-sea)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Ver Contenidos
            </Link>
            <Link 
              to="/affinity-graph"
              className="bg-[var(--coastal-sea)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Ver Grafo de Afinidad
            </Link>
            <Link 
              to="/help-request"
              className="bg-[var(--coastal-sea)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Solicitud de Ayuda
            </Link>
            <Link 
              to="/study-groups"
              className="bg-[var(--coastal-sea)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Grupos de Estudio
            </Link>
            <Link 
              to="/"
              className="bg-white text-[var(--open-sea)] px-4 py-2 rounded-md hover:bg-[var(--sand)] transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-7xl py-6">
        <UserDashboard />
      </main>
    </div>
  );
};

export default UserDashboardPage; 