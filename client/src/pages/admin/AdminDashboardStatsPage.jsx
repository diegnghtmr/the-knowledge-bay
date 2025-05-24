import React from "react";
import AdminDashboardStats from "../../components/admin/AdminDashboardStats";
import NavigationBar from "../../components/layout/NavigationBar";

/**
 * Página de estadísticas del dashboard de administrador
 */
const AdminDashboardStatsPage = () => {
  return (
    <div className="min-h-screen bg-cream-custom">
      <NavigationBar title="Estadísticas" />
      
      <main className="container mx-auto max-w-7xl py-6">
        <AdminDashboardStats />
      </main>
    </div>
  );
};

export default AdminDashboardStatsPage; 