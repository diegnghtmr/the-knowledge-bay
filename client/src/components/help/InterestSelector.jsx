import React, { useState, useEffect, useRef } from 'react';
import FormField from './FormField';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid';

// Lista de intereses disponibles (hardcoded por ahora)
const AVAILABLE_INTERESTS = [
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
  'Filosofía',
  'Arquitectura',
  'Ingeniería',
  'Finanzas',
  'Marketing',
  'Emprendimiento',
  'Idiomas',
  'Sociología',
  'Antropología',
  'Derecho'
].sort();

/**
 * Selector de múltiples temas de interés
 * Permite seleccionar de una lista predefinida con búsqueda y filtrado
 */
const InterestSelector = ({
  label,
  icon,
  value = [],
  onChange,
  onBlur,
  placeholder = "Buscar tema de interés para añadir",
  error,
  showError,
  inputRef,
  className = ''
}) => {
  const [searchInterest, setSearchInterest] = useState('');
  const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
  const [filteredInterests, setFilteredInterests] = useState([]);
  
  // Ref para el dropdown de intereses
  const interestsDropdownRef = useRef(null);

  // Efecto para manejar clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (interestsDropdownRef.current && !interestsDropdownRef.current.contains(event.target)) {
        setShowInterestsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efecto para filtrar intereses disponibles
  useEffect(() => {
    const filtered = AVAILABLE_INTERESTS.filter(
      interest => !value.includes(interest) && 
      (searchInterest.trim() === '' || interest.toLowerCase().includes(searchInterest.toLowerCase()))
    );
    setFilteredInterests(filtered);
  }, [searchInterest, value]);

  // Agregar un interés a la lista
  const addInterest = (interest) => {
    if (interest && !value.includes(interest)) {
      const newInterests = [...value, interest];
      onChange({ target: { value: newInterests } });
      setSearchInterest('');
      setShowInterestsDropdown(false);
    }
  };

  // Remover un interés de la lista
  const removeInterest = (interestToRemove) => {
    const newInterests = value.filter(interest => interest !== interestToRemove);
    onChange({ target: { value: newInterests } });
  };

  // Toggle del dropdown
  const toggleInterestsDropdown = () => {
    setShowInterestsDropdown(!showInterestsDropdown);
    if (!showInterestsDropdown) {
      setSearchInterest('');
    }
  };

  // Manejar búsqueda
  const handleSearchChange = (e) => {
    setSearchInterest(e.target.value);
    setShowInterestsDropdown(true);
  };

  // Manejar blur del input de búsqueda
  const handleSearchBlur = () => {
    // Pequeño delay para permitir que el click en el dropdown funcione
    setTimeout(() => {
      if (onBlur) onBlur();
    }, 150);
  };

  return (
    <FormField
      label={label}
      icon={icon}
      error={error}
      showError={showError}
      className={className}
    >
      {/* Temas seleccionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((interest, index) => (
            <div 
              key={index}
              className="flex items-center px-3 py-1 bg-[var(--coastal-sea)]/20 text-[var(--open-sea)] rounded-full text-sm"
            >
              <span>{interest}</span>
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="ml-2 text-red-500 hover:text-red-700 focus:outline-none transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Campo de búsqueda y selector */}
      <div className="relative" ref={interestsDropdownRef}>
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={searchInterest}
            onChange={handleSearchChange}
            onFocus={() => setShowInterestsDropdown(true)}
            onBlur={handleSearchBlur}
            placeholder={placeholder}
            className={`flex-1 px-3 py-2 border rounded-l-md shadow-sm focus:outline-none focus:ring-2 ${
              error && showError 
                ? 'border-red-500 ring-red-200' 
                : 'border-[var(--coastal-sea)]/20 focus:ring-[var(--coastal-sea)]/50'
            }`}
          />
          <button
            type="button"
            onClick={toggleInterestsDropdown}
            className="px-3 py-2 bg-[var(--coastal-sea)] text-white rounded-r-md hover:bg-[var(--coastal-sea)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 transition-colors"
          >
            <ChevronDownIcon className={`h-5 w-5 transition-transform ${showInterestsDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown de intereses disponibles */}
        {showInterestsDropdown && filteredInterests.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-[var(--coastal-sea)]/20 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredInterests.map((interest, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-[var(--coastal-sea)]/10 cursor-pointer text-[var(--open-sea)] transition-colors"
                onClick={() => addInterest(interest)}
              >
                {interest}
              </div>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {showInterestsDropdown && filteredInterests.length === 0 && searchInterest.trim() !== '' && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-[var(--coastal-sea)]/20 rounded-md shadow-lg">
            <div className="px-4 py-2 text-gray-500 text-sm">
              No se encontraron temas que coincidan con "{searchInterest}"
            </div>
          </div>
        )}
      </div>

      {/* Contador de temas seleccionados */}
      {value.length > 0 && (
        <p className="text-sm text-[var(--open-sea)]/70 mt-2">
          {value.length} tema{value.length !== 1 ? 's' : ''} seleccionado{value.length !== 1 ? 's' : ''}
        </p>
      )}
    </FormField>
  );
};

export default InterestSelector; 