import React from "react";
import InterestManagement from "../../components/admin/InterestManagement";
import NavigationBar from "../../components/layout/NavigationBar";

/**
 * Página de gestión de intereses para administradores
 */
const InterestManagementPage = () => {
  return (
    <div className="min-h-screen bg-cream-custom">
      <NavigationBar title="Gestión de Intereses" />
      
      <main className="container mx-auto max-w-7xl py-6">
        <InterestManagement />
      </main>
    </div>
  );
};

export default InterestManagementPage; 