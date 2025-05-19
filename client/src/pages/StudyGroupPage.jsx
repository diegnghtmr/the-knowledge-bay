import React from "react";
import StudyGroupForm from "../components/study-groups/StudyGroupForm";
import { Users } from "lucide-react";
import NavigationBar from "../components/layout/NavigationBar";

/**
 * Página del formulario de grupos de estudio
 */
const StudyGroupPage = () => {
  // Manejar guardar grupo
  const handleSave = (formData) => {
    console.log("Datos guardados:", formData);
    alert("Grupo guardado correctamente");
  };

  // Manejar cancelar
  const handleCancel = () => {
    console.log("Operación cancelada");
    alert("Operación cancelada");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-custom">
      <NavigationBar title="Grupos de Estudio" />

      <main className="container mx-auto max-w-7xl py-6 overflow-x-hidden">
        <div className="w-full mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-[var(--coastal-sea)] w-8 h-8" />
            <h2 className="font-righteous text-2xl text-[var(--deep-sea)]">Grupos de Estudio</h2>
          </div>
          <p className="text-[var(--open-sea)]/80 mt-2">Crea un grupo de estudio para colaborar con otros estudiantes</p>
        </div>

        <StudyGroupForm onSave={handleSave} onCancel={handleCancel} />
      </main>
    </div>
  );
};

export default StudyGroupPage; 