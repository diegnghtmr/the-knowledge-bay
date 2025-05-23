import React from "react";
import HelpRequestForm from "../components/help/HelpRequestForm";
// HelpCircle might not be needed anymore if the title is simplified like in PublishContentPage
// import { HelpCircle } from "lucide-react";
import NavigationBar from "../components/layout/NavigationBar";
import { useAuth } from "../context/AuthContext"; // Import useAuth

/**
 * Página del formulario de solicitud de ayuda
 */
const HelpRequestPage = () => {
  const { user } = useAuth(); // Get the logged-in user

  // Manejar guardar solicitud
  const handleSave = (formData) => {
    const dataToSave = {
      ...formData,
      student: user ? user.email : 'unknown_student@example.com', // Add student email
      completed: false, // Set completed to false
    };
    console.log("Datos guardados:", dataToSave);
    alert("Solicitud guardada correctamente (con datos de estudiante y estado 'no completado' por defecto)");
  };

  // Manejar cancelar
  const handleCancel = () => {
    console.log("Operación cancelada");
    alert("Operación cancelada");
  };

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <NavigationBar title="Solicitud de Ayuda" />
      <main className="container mx-auto max-w-3xl py-8 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--deep-sea)] mb-6 text-center">
            Solicita Asistencia Académica
          </h1>
          <HelpRequestForm onSave={handleSave} onCancel={handleCancel} />
        </div>
      </main>
    </div>
  );
};

export default HelpRequestPage; 