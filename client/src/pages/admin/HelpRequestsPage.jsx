import React from "react";
import HelpRequests from "../../components/admin/HelpRequests";
import NavigationBar from "../../components/layout/NavigationBar";

/**
 * Página de gestión de solicitudes de ayuda para administradores
 */
const HelpRequestsPage = () => {
  return (
    <div className="min-h-screen bg-cream-custom">
      <NavigationBar title="Solicitudes de Ayuda" />
      
      <main className="container mx-auto max-w-7xl py-6">
        <HelpRequests />
      </main>
    </div>
  );
};

export default HelpRequestsPage; 