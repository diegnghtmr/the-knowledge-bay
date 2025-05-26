import React from "react";
import ContentDashboard from "../components/dashboard/ContentDashboard";
import NavigationBar from "../components/layout/NavigationBar";

/**
 * Página de gestión de contenidos
 */
const ContentDashboardPage = () => {
  return (
    <div className="min-h-screen bg-cream-custom">
      <NavigationBar title="Gestión de Contenidos" />
      
      <main className="container mx-auto max-w-7xl py-6">
        <ContentDashboard />
      </main>
    </div>
  );
};

export default ContentDashboardPage; 