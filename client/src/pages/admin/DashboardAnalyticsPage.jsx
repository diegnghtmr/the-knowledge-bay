import React from "react";
import DashboardAnalytics from "../../components/admin/DashboardAnalytics";
import NavigationBar from "../../components/layout/NavigationBar";

/**
 * Página de análisis del dashboard de administrador
 */
const DashboardAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-cream-custom">
      <NavigationBar title="Panel Analítico" />
      
      <main className="container mx-auto max-w-7xl py-6">
        <DashboardAnalytics />
      </main>
    </div>
  );
};

export default DashboardAnalyticsPage; 