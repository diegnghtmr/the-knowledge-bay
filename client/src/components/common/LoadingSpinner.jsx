import React from 'react';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 border-4 border-[var(--coastal-sea)] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[var(--open-sea)]">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 