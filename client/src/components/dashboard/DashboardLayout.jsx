import React from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../layout/NavigationBar';

const DashboardLayout = ({ 
  title, 
  description, 
  children, 
  navLinks = [] 
}) => {
  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <NavigationBar title={title} />
      
      <div className="container mx-auto py-6 px-4">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--deep-sea)]">
            {title}
          </h1>
          {description && (
            <p className="text-[var(--open-sea)] mt-2">
              {description}
            </p>
          )}
        </header>

        {/* Barra de navegación secundaria para dashboards */}
        {navLinks.length > 0 && (
          <nav className="mb-6 bg-white shadow-sm rounded-lg overflow-x-auto">
            <div className="flex p-2 space-x-2">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className={`px-4 py-2 rounded-md whitespace-nowrap font-medium transition-colors
                    ${link.isActive 
                      ? 'bg-[var(--coastal-sea)] text-white' 
                      : 'text-[var(--deep-sea)] hover:bg-gray-100'
                    }`}
                >
                  {link.icon && <span className="mr-2">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Contenido principal */}
        <main className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </main>

        {/* Botón para volver a la página principal */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center text-[var(--coastal-sea)] hover:underline"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 17l-5-5m0 0l5-5m-5 5h12" 
              />
            </svg>
            Volver a Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 