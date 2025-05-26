import React from "react";
import UserDashboard from "../components/dashboard/UserDashboard";
import NavigationBar from "../components/layout/NavigationBar";

/**
 * Página de gestión de usuarios
 */
const UserDashboardPage = () => {
  return (
    <div className="min-h-screen bg-cream-custom">
      <NavigationBar title="Gestión de Usuarios" />
      
      <main className="container mx-auto max-w-7xl py-6">
        <UserDashboard />
      </main>
    </div>
  );
};

export default UserDashboardPage; 