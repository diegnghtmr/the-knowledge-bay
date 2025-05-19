import React from "react";
import { Link } from "react-router-dom";
import HelpRequestForm from "../components/help/HelpRequestForm";
import { HelpCircle } from "lucide-react";

/**
 * Página del formulario de solicitud de ayuda
 */
const HelpRequestPage = () => {
  // Manejar guardar solicitud
  const handleSave = (formData) => {
    console.log("Datos guardados:", formData);
    alert("Solicitud guardada correctamente");
  };

  // Manejar cancelar
  const handleCancel = () => {
    console.log("Operación cancelada");
    alert("Operación cancelada");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-custom">
      <header className="bg-[var(--open-sea)] text-white p-4 shadow-md">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between">
          <h1 className="font-righteous text-xl mb-3 md:mb-0">The Knowledge Bay - Solicitud de Ayuda</h1>
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/users-dashboard"
              className="bg-[var(--coastal-sea)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Gestión de Usuarios
            </Link>
            <Link 
              to="/content-dashboard"
              className="bg-[var(--coastal-sea)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Gestión de Contenidos
            </Link>
            <Link 
              to="/affinity-graph"
              className="bg-[var(--coastal-sea)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Grafo de Afinidad
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

      <main className="container mx-auto max-w-7xl py-6 overflow-x-hidden">
        <div className="w-full mb-6">
          <div className="flex items-center gap-3">
            <HelpCircle className="text-[var(--coastal-sea)] w-8 h-8" />
            <h2 className="font-righteous text-2xl text-[var(--deep-sea)]">Solicitud de Ayuda</h2>
          </div>
          <p className="text-[var(--open-sea)]/80 mt-2">Completa el formulario para solicitar asistencia académica</p>
        </div>
        
        <HelpRequestForm onSave={handleSave} onCancel={handleCancel} />
      </main>
    </div>
  );
};

export default HelpRequestPage; 