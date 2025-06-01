import React from "react";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center my-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--coastal-sea)]"></div>
    <p className="ml-3 text-gray-500">Cargando más contenido...</p>
  </div>
);

export default LoadingSpinner; 