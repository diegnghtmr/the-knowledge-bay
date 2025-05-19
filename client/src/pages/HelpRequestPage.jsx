import React from "react";
import HelpRequestForm from "../components/help/HelpRequestForm";
import { HelpCircle } from "lucide-react";
import NavigationBar from "../components/layout/NavigationBar";

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
      <NavigationBar title="Solicitud de Ayuda" />

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