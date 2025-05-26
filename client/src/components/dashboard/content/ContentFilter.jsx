import React, { useState } from 'react';

// Lista predefinida de tipos de contenido
const contentTypes = ['Documento', 'Tutorial', 'Presentación', 'Guía', 'Artículo', 'Otros'];

// Lista predefinida de etiquetas populares
const popularTags = [
  'IA', 'Tecnología', 'Programación', 'Matemáticas', 'Física', 'Historia',
  'Literatura', 'Arte', 'Educación', 'Biología', 'Química', 'Ingeniería'
];

const ContentFilter = ({ filterParams, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchInputChange = (e) => {
    onFilterChange({ searchTerm: e.target.value });
  };

  const handleContentTypeChange = (type) => {
    onFilterChange({ contentType: filterParams.contentType === type ? '' : type });
  };

  const handleTagToggle = (tag) => {
    const currentTags = [...filterParams.tags];
    const index = currentTags.indexOf(tag);
    
    if (index === -1) {
      // Añadir la etiqueta si no está seleccionada
      currentTags.push(tag);
    } else {
      // Eliminar la etiqueta si ya está seleccionada
      currentTags.splice(index, 1);
    }
    
    onFilterChange({ tags: currentTags });
  };

  const handleFavoritesToggle = () => {
    onFilterChange({ showFavorites: !filterParams.showFavorites });
  };

  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      searchTerm: '',
      contentType: '',
      tags: [],
      showFavorites: false,
      sortBy: 'recent'
    });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 mb-3">
        {/* Barra de búsqueda */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por título, descripción o autor..."
            value={filterParams.searchTerm}
            onChange={handleSearchInputChange}
            className="w-full py-2 px-4 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
        
        {/* Selector de ordenamiento */}
        <div className="md:w-48">
          <select
            value={filterParams.sortBy}
            onChange={handleSortChange}
            className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]"
          >
            <option value="recent">Más recientes</option>
            <option value="popular">Más populares</option>
            <option value="views">Más vistos</option>
            <option value="title">Título (A-Z)</option>
          </select>
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
          {/* Filtro por tipo de contenido */}
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-[var(--deep-sea)]">Tipo de contenido</h3>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleContentTypeChange(type)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filterParams.contentType === type
                      ? 'bg-[var(--coastal-sea)] text-white'
                      : 'bg-white text-[var(--deep-sea)] border border-gray-300 hover:border-[var(--coastal-sea)]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Filtro por etiquetas */}
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-[var(--deep-sea)]">Etiquetas populares</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    filterParams.tags.includes(tag)
                      ? 'bg-[var(--coastal-sea)] text-white'
                      : 'bg-white text-[var(--deep-sea)] border border-gray-300 hover:border-[var(--coastal-sea)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="favorites-filter"
                type="checkbox"
                checked={filterParams.showFavorites}
                onChange={handleFavoritesToggle}
                className="h-4 w-4 text-[var(--coastal-sea)] focus:ring-[var(--coastal-sea)]"
              />
              <label htmlFor="favorites-filter" className="ml-2 text-[var(--deep-sea)]">
                Mostrar solo favoritos
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
      {(filterParams.contentType || filterParams.tags.length > 0 || filterParams.showFavorites) && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-[var(--deep-sea)]">Filtros activos:</span>
          
          {filterParams.contentType && (
            <span className="px-2 py-1 text-xs bg-[var(--coastal-sea)] text-white rounded-md flex items-center">
              Tipo: {filterParams.contentType}
              <button 
                onClick={() => handleContentTypeChange(filterParams.contentType)}
                className="ml-1 font-bold"
              >
                ×
              </button>
            </span>
          )}
          
          {filterParams.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-[var(--coastal-sea)] text-white rounded-md flex items-center">
              {tag}
              <button 
                onClick={() => handleTagToggle(tag)}
                className="ml-1 font-bold"
              >
                ×
              </button>
            </span>
          ))}
          
          {filterParams.showFavorites && (
            <span className="px-2 py-1 text-xs bg-[var(--coastal-sea)] text-white rounded-md flex items-center">
              Favoritos
              <button 
                onClick={handleFavoritesToggle}
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

export default ContentFilter; 