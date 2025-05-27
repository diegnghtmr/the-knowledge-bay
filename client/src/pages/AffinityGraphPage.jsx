import React from "react";
import AffinityGraphComponent from "../components/dashboard/affinity/AffinityGraphComponent";
import NavigationBar from "../components/layout/NavigationBar";

/**
 * Página del visualizador de grafo de afinidad
 */
const AffinityGraphPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream-custom">
      <NavigationBar title="Grafo de Afinidad" />

      <main className="container mx-auto max-w-7xl py-6 overflow-x-hidden">
        <AffinityGraphComponent />
      </main>
    </div>
  );
};

export default AffinityGraphPage;
