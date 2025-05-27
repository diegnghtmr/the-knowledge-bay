import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HelpRequestForm from "../components/help/HelpRequestForm";
import NavigationBar from "../components/layout/NavigationBar";
import { useAuth } from "../context/AuthContext";
import { helpRequestApi } from "../services/helpRequestApi";

/**
 * Página del formulario de solicitud de ayuda
 */
const HelpRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar guardar solicitud
  const handleSave = async (formData) => {
    setIsSubmitting(true);

    try {
      const helpRequestData = {
        topics: formData.topics,
        information: formData.information,
        urgency: formData.urgency,
      };

      console.log("Enviando datos de solicitud:", helpRequestData);

      const response = await helpRequestApi.createHelpRequest(helpRequestData);

      console.log("Respuesta del servidor:", response);

      if (response.success) {
        alert("Solicitud de ayuda creada exitosamente");
        navigate("/");
      } else {
        alert(response.message || "Error al crear la solicitud de ayuda");
      }
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      alert("Error al crear la solicitud de ayuda: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cancelar
  const handleCancel = () => {
    console.log("Operación cancelada");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <NavigationBar title="Solicitud de Ayuda" />
      <main className="container mx-auto max-w-3xl py-8 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--deep-sea)] mb-6 text-center">
            Solicita Asistencia Académica
          </h1>
          <HelpRequestForm
            onSave={handleSave}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
};

export default HelpRequestPage;
