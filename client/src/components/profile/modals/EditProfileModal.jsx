import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ImprovedModalBase from './ImprovedModalBase';
import { PencilSquareIcon } from '@heroicons/react/24/solid';

const EditProfileModal = ({ userData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: userData.name,
    username: userData.username,
    bio: userData.bio,
    email: userData.email,
    birthday: userData.birthday,
    interests: userData.interests
  });
  
  // Estado para controlar la altura del textarea
  const [bioHeight, setBioHeight] = useState('auto');
  
  // Lista predefinida de intereses disponibles
  const availableInterests = [
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
    'Economía'
  ].sort();

  // Estado para controlar intereses filtrados en el dropdown
  const [filteredInterests, setFilteredInterests] = useState([]);
  const [searchInterest, setSearchInterest] = useState('');
  const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
  
  // Ref para el dropdown de intereses
  const interestsDropdownRef = useRef(null);
  
  // Función para formatear la fecha de DD/MM/AAAA a YYYY-MM-DD para el input date
  const formatDateForInput = (dateString) => {
    // Si la fecha ya está en formato YYYY-MM-DD, la devolvemos
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Si está en formato DD/MM/AA o DD/MM/AAAA
    const parts = dateString.split('/');
    if (parts.length === 3) {
      let year = parts[2];
      // Si el año tiene 2 dígitos, asumimos que es 20XX
      if (year.length === 2) {
        year = `20${year}`;
      }
      return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    
    // Si no podemos parsear, devolvemos fecha vacía
    return '';
  };
  
  // Función para formatear la fecha de YYYY-MM-DD a DD/MM/AA para mostrar
  const formatDateForDisplay = (dateString) => {
    // Si la fecha está en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };
  
  // Estado para controlar la fecha en el formato del input date
  const [birthdayDate, setBirthdayDate] = useState(formatDateForInput(userData.birthday));
  
  // Efecto para ajustar la altura del textarea automáticamente
  useEffect(() => {
    const adjustHeight = () => {
      const bioTextArea = document.getElementById('bio');
      if (bioTextArea) {
        // Establecer altura mínima
        bioTextArea.style.height = 'auto';
        // Establecer altura basada en el contenido
        const scrollHeight = bioTextArea.scrollHeight;
        bioTextArea.style.height = `${scrollHeight}px`;
        setBioHeight(`${scrollHeight}px`);
      }
    };
    
    adjustHeight();
  }, [formData.bio]);
  
  // Efecto para manejar clics fuera del dropdown de intereses
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
    // Si el campo de búsqueda está vacío, mostramos todos los intereses disponibles
    // que no estén ya seleccionados
    const filtered = availableInterests.filter(
      interest => !formData.interests.includes(interest) && 
      (searchInterest.trim() === '' || interest.toLowerCase().includes(searchInterest.toLowerCase()))
    );
    setFilteredInterests(filtered);
  }, [searchInterest, formData.interests]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBirthdayChange = (e) => {
    const inputDate = e.target.value; // Formato YYYY-MM-DD
    setBirthdayDate(inputDate);
    
    // Actualizar formData con el formato de visualización DD/MM/AA
    const displayDate = formatDateForDisplay(inputDate);
    setFormData(prev => ({
      ...prev,
      birthday: displayDate
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const addInterest = (interest) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setSearchInterest('');
    }
  };
  
  const removeInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interestToRemove)
    }));
  };
  
  const toggleInterestsDropdown = () => {
    setShowInterestsDropdown(!showInterestsDropdown);
    // Si estamos abriendo el dropdown, aseguramos que no haya filtro aplicado
    if (!showInterestsDropdown) {
      setSearchInterest('');
    }
  };

  return (
    <ImprovedModalBase 
      title="Editar Perfil" 
      onClose={onClose}
      customIcon={PencilSquareIcon}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]"
            required
          />
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Usuario
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">@</span>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Biografía
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            style={{ 
              height: bioHeight, 
              resize: 'none', // Deshabilitar redimensionamiento manual
              overflowY: 'hidden' // Ocultar scrollbar vertical
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <p className="font-bold text-[var(--deep-sea)] mb-2">
            {formData.email}
          </p>
          <p className="text-xs text-gray-500">
            El correo electrónico no se puede modificar desde este formulario.
          </p>
        </div>
        
        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
            Fecha de Nacimiento
          </label>
          <p className="font-bold text-[var(--deep-sea)] mb-2">
            {formData.birthday}
          </p>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={birthdayDate}
            onChange={handleBirthdayChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intereses
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.interests.map((interest, index) => (
              <div 
                key={index}
                className="px-3 py-1 bg-[var(--coastal-sea)] bg-opacity-20 text-[var(--open-sea)] rounded-full text-sm flex items-center"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="relative" ref={interestsDropdownRef}>
            <div className="flex">
              <input
                type="text"
                value={searchInterest}
                onChange={(e) => {
                  setSearchInterest(e.target.value);
                  setShowInterestsDropdown(true);
                }}
                onFocus={() => setShowInterestsDropdown(true)}
                placeholder="Buscar interés para añadir"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)]"
              />
              <button
                type="button"
                onClick={toggleInterestsDropdown}
                className="px-3 py-2 bg-[var(--coastal-sea)] text-white rounded-r-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {showInterestsDropdown && filteredInterests.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredInterests.map((interest, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addInterest(interest)}
                  >
                    {interest}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--coastal-sea)] text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </ImprovedModalBase>
  );
};

EditProfileModal.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    bio: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    birthday: PropTypes.string.isRequired,
    interests: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default EditProfileModal; 