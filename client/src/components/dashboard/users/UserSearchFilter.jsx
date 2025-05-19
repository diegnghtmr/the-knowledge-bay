import React, { useState } from 'react';

// Lista de intereses predefinidos
const predefinedInterests = [
  'Matemáticas', 'Física', 'Química', 'Biología', 'Literatura', 
  'Historia', 'Programación', 'Inteligencia Artificial', 'Arte', 'Diseño'
];

const UserSearchFilter = ({ searchParams, onSearchChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchInputChange = (e) => {
    onSearchChange({ searchTerm: e.target.value });
  };

  const handleInterestToggle = (interest) => {
    const currentInterests = [...searchParams.interests];
    const index = currentInterests.indexOf(interest);
    
    if (index === -1) {
      // Añadir el interés si no está seleccionado
      currentInterests.push(interest);
    } else {
      // Eliminar el interés si ya está seleccionado
      currentInterests.splice(index, 1);
    }
    
    onSearchChange({ interests: currentInterests });
  };

  const handleFollowingToggle = () => {
    onSearchChange({ showFollowing: !searchParams.showFollowing });
  };

  const clearFilters = () => {
    onSearchChange({
      searchTerm: '',
      interests: [],
      showFollowing: false
    });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 mb-3">
        {/* Barra de búsqueda */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar usuarios por nombre o usuario..."
            value={searchParams.searchTerm}
            onChange={handleSearchInputChange}
            className="w-full py-2 px-4 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
        
        {/* Botón para mostrar/ocultar filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 text-[var(--coastal-sea)] border border-[var(--coastal-sea)] rounded-md hover:bg-[var(--coastal-sea)] hover:text-white transition-colors"
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>
      
      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 animate-fadeIn">
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-[var(--deep-sea)]">Filtrar por intereses</h3>
            <div className="flex flex-wrap gap-2">
              {predefinedInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    searchParams.interests.includes(interest)
                      ? 'bg-[var(--coastal-sea)] text-white'
                      : 'bg-white text-[var(--deep-sea)] border border-gray-300 hover:border-[var(--coastal-sea)]'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="following-filter"
                type="checkbox"
                checked={searchParams.showFollowing}
                onChange={handleFollowingToggle}
                className="h-4 w-4 text-[var(--coastal-sea)] focus:ring-[var(--coastal-sea)]"
              />
              <label htmlFor="following-filter" className="ml-2 text-[var(--deep-sea)]">
                Mostrar solo usuarios que sigo
              </label>
            </div>
            
            <button
              onClick={clearFilters}
              className="text-[var(--open-sea)] hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
      
      {/* Indicador de filtros activos */}
      {(searchParams.interests.length > 0 || searchParams.showFollowing) && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-[var(--deep-sea)]">Filtros activos:</span>
          
          {searchParams.interests.map(interest => (
            <span key={interest} className="px-2 py-1 text-xs bg-[var(--coastal-sea)] text-white rounded-md flex items-center">
              {interest}
              <button 
                onClick={() => handleInterestToggle(interest)}
                className="ml-1 font-bold"
              >
                ×
              </button>
            </span>
          ))}
          
          {searchParams.showFollowing && (
            <span className="px-2 py-1 text-xs bg-[var(--coastal-sea)] text-white rounded-md flex items-center">
              Siguiendo
              <button 
                onClick={handleFollowingToggle}
                className="ml-1 font-bold"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchFilter; 