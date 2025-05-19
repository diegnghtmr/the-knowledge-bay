import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

const InterestSelector = ({ 
  selectedInterests, 
  onInterestsChange, 
  label = 'Tema Principal',
  availableInterests = [] 
}) => {
  const [filteredInterests, setFilteredInterests] = useState([]);
  const [searchInterest, setSearchInterest] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Lista predefinida de intereses disponibles si no se proporciona
  const defaultInterests = useMemo(() => [
    'Programación', 
    'Inteligencia Artificial', 
    'Diseño Web', 
    'Literatura', 
    'Fotografía',
    'Ciencia',
    'Arte',
    'Música',
    'Cine',
    'Viajes',
    'Gastronomía',
    'Deportes',
    'Historia',
    'Tecnología',
    'Matemáticas',
    'Física',
    'Química',
    'Biología',
    'Medicina',
    'Psicología',
    'Educación',
    'Medio Ambiente',
    'Astronomía',
    'Política',
    'Economía',
    'JavaScript',
    'React',
    'Python',
    'Java',
    'Android',
    'iOS',
    'Machine Learning',
    'Data Science'
  ].sort(), []);

  // Memorizar la lista de intereses para evitar recreaciones en cada renderizado
  const interestsList = useMemo(() => 
    availableInterests.length > 0 ? availableInterests : defaultInterests,
    [availableInterests, defaultInterests]
  );

  // Memorizar el tema seleccionado actual
  const selectedTopic = useMemo(() => 
    selectedInterests.length > 0 ? selectedInterests[0] : '',
    [selectedInterests]
  );

  // Efecto para cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Efecto para filtrar intereses disponibles
  useEffect(() => {
    // Crear función de filtrado para evitar dependencias innecesarias
    const filterInterests = () => {
      const filtered = interestsList.filter(
        interest => interest !== selectedTopic && 
        (searchInterest.trim() === '' || interest.toLowerCase().includes(searchInterest.toLowerCase()))
      );
      setFilteredInterests(filtered);
    };
    
    filterInterests();
  }, [searchInterest, selectedTopic, interestsList]);
  
  const selectInterest = (interest) => {
    if (interest && interest !== selectedTopic) {
      // Reemplazar cualquier selección anterior con el nuevo tema
      onInterestsChange([interest]); // Array con un solo elemento
      setSearchInterest('');
      // Cerrar el dropdown después de seleccionar
      setShowDropdown(false);
    }
  };
  
  const clearSelection = () => {
    onInterestsChange([]);
    // Abrir el dropdown para permitir una nueva selección
    setShowDropdown(true);
    // Enfocar el input
    setTimeout(() => {
      const inputElement = dropdownRef.current?.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setSearchInterest('');
    }
  };
  
  // Manejar entrada en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchInterest(e.target.value);
    // Asegurarse de que el dropdown esté abierto cuando escribimos
    setShowDropdown(true);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {/* Mostrar el tema seleccionado */}
      {selectedTopic ? (
        <div className="flex items-center mb-2">
          <div className="flex-1 px-3 py-2 bg-[var(--coastal-sea)] text-white rounded-l-md">
            {selectedTopic}
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600 focus:outline-none"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic mb-2">
          Selecciona un tema principal para tu contenido
        </div>
      )}
      
      {/* Solo mostrar el selector si no hay tema seleccionado o si el dropdown está abierto */}
      {(!selectedTopic || showDropdown) && (
        <div className="relative" ref={dropdownRef}>
          <div className="flex">
            <input
              type="text"
              value={searchInterest}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar tema principal"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]"
            />
            <button
              type="button"
              onClick={toggleDropdown}
              className="px-3 py-2 bg-[var(--coastal-sea)] text-white rounded-r-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredInterests.length > 0 ? (
                filteredInterests.map((interest, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectInterest(interest)}
                  >
                    {interest}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">
                  {searchInterest.trim() 
                    ? `No se encontraron temas que coincidan con "${searchInterest}"`
                    : "No hay más temas disponibles"}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

InterestSelector.propTypes = {
  selectedInterests: PropTypes.arrayOf(PropTypes.string).isRequired,
  onInterestsChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  availableInterests: PropTypes.arrayOf(PropTypes.string)
};

export default InterestSelector; 