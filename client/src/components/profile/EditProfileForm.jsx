import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Calendar, X, Plus } from 'lucide-react';
import { updateUserProfile } from '../../services/userApi'; // getUserProfile removed

export default function EditProfileForm({ currentUserProfile, onProfileUpdateSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    biography: '',
    birthdate: '',
    email: '', // Will be populated from fetched data
    password: '',
    confirmPassword: ''
    // interests field removed, selectedInterests is the source of truth
  });

  const [isLoading, setIsLoading] = useState(true); // Changed to true, will be set by new useEffect
  const [error, setError] = useState(null);
  const [initialProfileData, setInitialProfileData] = useState(null);
  const [initialSelectedInterests, setInitialSelectedInterests] = useState([]);

  // Ref para el textarea
  const textareaRef = useRef(null);

  // Estados para intereses
  const [customInterests, setCustomInterests] = useState([
    'Matemáticas', 'Historia', 'Literatura', 'Ciencias',
    'Arte', 'Música', 'Tecnología', 'Deportes', 'Cocina',
    'Viajes', 'Fotografía', 'Cine', 'Medicina', 'Economía'
  ]);
  const [selectedInterests, setSelectedInterests] = useState([]); // Initialized as empty
  const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  // Estados para DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Initialize state from currentUserProfile prop
  useEffect(() => {
    if (currentUserProfile) {
      const initialPassword = currentUserProfile.currentPassword_DO_NOT_USE_IN_PROD || '';
      setFormData({
        username: currentUserProfile.username || '',
        firstName: currentUserProfile.firstName || '',
        lastName: currentUserProfile.lastName || '',
        biography: currentUserProfile.biography || '',
        birthdate: currentUserProfile.birthdate || '',
        email: currentUserProfile.email || '',
        password: initialPassword, // Pre-fill password
        confirmPassword: initialPassword, // Pre-fill confirm password
      });
      setSelectedInterests(currentUserProfile.interests || []);
      
      // Set initial data for comparison
      setInitialProfileData({
        ...currentUserProfile, // Spread all fields from currentUserProfile
        password: initialPassword // Explicitly set password here for initial data
      });
      setInitialSelectedInterests(currentUserProfile.interests || []);

      if (currentUserProfile.birthdate) {
        const parts = currentUserProfile.birthdate.split('/');
        if (parts.length === 3) {
          // Month is 0-indexed in JavaScript Date constructor
          const date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          if (!isNaN(date.getTime())) { // Check if date is valid
            setSelectedDate(date);
          } else {
            console.warn("Received birthdate is invalid:", currentUserProfile.birthdate);
            setSelectedDate(null); // Reset if invalid
            setFormData(prev => ({ ...prev, birthdate: '' })); // Clear invalid birthdate from form
          }
        } else {
          console.warn("Received birthdate format is incorrect:", currentUserProfile.birthdate);
          setSelectedDate(null); // Reset if format is wrong
          setFormData(prev => ({ ...prev, birthdate: '' })); // Clear invalid birthdate from form
        }
      } else {
        setSelectedDate(null);
      }
      setIsLoading(false); // Data is now from prop, so set loading to false
      setError(null); // Clear any previous errors
    } else {
      // Handle case where currentUserProfile is not yet available or becomes null
      // You might want to set a loading state or show a message
      setIsLoading(true); // Or false, depending on desired behavior if prop is initially null
    }
  }, [currentUserProfile]); // Re-run if currentUserProfile changes

  // Función para ajustar la altura del textarea automáticamente
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Ajustar la altura cuando cambia el contenido
  useEffect(() => {
    adjustTextareaHeight();
  }, [formData.biography]);

  // Funciones para manejar intereses
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addInterest = (interest) => {
    if (selectedInterests.length < 15 && !selectedInterests.includes(interest)) {
      setSelectedInterests([...selectedInterests, interest]);
    }
    setShowInterestsDropdown(false);
  };

  const removeInterest = (interest) => {
    setSelectedInterests(selectedInterests.filter(i => i !== interest));
  };

  const addNewCustomInterest = () => {
    if (newInterest && !customInterests.includes(newInterest)) {
      setCustomInterests([...customInterests, newInterest]);
      addInterest(newInterest);
      setNewInterest('');
    }
  };

  // Funciones para el DatePicker
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setFormData({
      ...formData,
      birthdate: formatDate(newDate)
    });
    setShowDatePicker(false);
  };

  // Renderizar el calendario
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Ajustar el primer día para que la semana comience en lunes (0 = lunes, 6 = domingo)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];

    // Días del mes anterior
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`prev-${i}`} className="text-gray-300 p-2"></div>);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDateSelect(day)}
          className={`p-2 text-center cursor-pointer hover:bg-sand ${
                      isSelected ? 'bg-coastal-sea text-white hover:bg-open-sea' : ''
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const handleSubmit = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const buildPayload = () => {
      const payload = {};
      if (!initialProfileData) return payload; // Should not happen if data loaded

      if (formData.username !== initialProfileData.username) {
        payload.username = formData.username;
      }
      if (formData.firstName !== initialProfileData.firstName) {
        payload.firstName = formData.firstName;
      }
      if (formData.lastName !== initialProfileData.lastName) {
        payload.lastName = formData.lastName;
      }
      if (formData.biography !== initialProfileData.biography) {
        payload.biography = formData.biography;
      }
      // Ensure birthdate comparison is robust, e.g., if one is null/empty and other is not
      const currentBirthdate = formData.birthdate || "";
      const initialBirthdate = initialProfileData.birthdate || "";
      if (currentBirthdate !== initialBirthdate) {
        payload.birthdate = formData.birthdate; // Send current value, even if it's to clear it
      }

      const interestsChanged = selectedInterests.length !== initialSelectedInterests.length ||
                             !selectedInterests.every(interest => initialSelectedInterests.includes(interest)) ||
                             !initialSelectedInterests.every(interest => selectedInterests.includes(interest));
      if (interestsChanged) {
        payload.interests = selectedInterests;
      }

      // Password logic: send only if non-empty, changed from initial, and confirmed
      // The confirmation (password === confirmPassword) is handled at the start of handleSubmit.
      const initialPwd = initialProfileData?.password || '';
      if (formData.password && formData.password !== initialPwd) {
        payload.password = formData.password;
      }
      return payload;
    };

    const dataToUpdate = buildPayload();

    // Check if only password is in payload and it's empty, or if payload is empty
    const noChangesExceptPotentiallyEmptyPassword = Object.keys(dataToUpdate).length === 0 ||
        (Object.keys(dataToUpdate).length === 1 && dataToUpdate.hasOwnProperty('password') && !dataToUpdate.password);


    if (Object.keys(dataToUpdate).length === 0) {
        alert("No changes to save.");
        setIsLoading(false);
        return;
    }
    // If only password field is present but empty, it means no actual password change was intended.
    if (Object.keys(dataToUpdate).length === 1 && dataToUpdate.hasOwnProperty('password') && !dataToUpdate.password) {
        alert("No changes to save.");
        setIsLoading(false);
        return;
    }


    try {
      const response = await updateUserProfile(dataToUpdate);
      alert(response.message || "Profile updated successfully!");
      if (onProfileUpdateSuccess) {
        // Assuming response.user contains the full updated profile
        // If not, and only changed fields are returned, ProfilePage's refetch is essential
        onProfileUpdateSuccess(response.user || { ...initialProfileData, ...dataToUpdate });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update profile.";
      setError(errorMessage);
      alert(`Error updating profile: ${errorMessage}`);
      console.error("Update profile error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Display loading state if isLoading is true (now primarily for prop loading)
  if (isLoading) {
    return <div className="p-6 text-center">Loading profile data...</div>;
  }

  // Display error if an error occurred (now primarily for prop loading issues if any, or submission)
  // This specific check for !formData.email might be less relevant if error is for submission
  if (error && !isLoading) { // Simplified condition, error state will be managed by new useEffect or handleSubmit
     return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg"> {/* Adjusted for modal display */}
      {/* Display submission error, if any, separate from initial load error */}
      {error && <div className="p-2 text-center text-red-500 bg-red-100 rounded-md">Error: {error}</div>}
      {/* Usuario */}
      <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tu nombre de usuario"
              className="mt-1 block w-full pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300"
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Tu(s) nombre(s)"
              className="mt-1 block w-full pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300"
            />
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Tu(s) apellido(s)"
              className="mt-1 block w-full pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300"
            />
          </div>

          {/* Biografía con textarea dinámico */}
          <div className="space-y-2">
            <label htmlFor="biography" className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Biografía
            </label>
            <textarea
              ref={textareaRef}
              id="biography"
              name="biography"
              value={formData.biography}
              onChange={handleChange}
              placeholder="Cuéntanos un poco sobre ti..."
              rows={1}
              className="mt-1 block w-full pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300 resize-none overflow-hidden min-h-[42px]"
            />
          </div>

          {/* Fecha de nacimiento mejorada con DatePicker */}
          <div className="space-y-2">
            <label htmlFor="birthdate" className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Fecha de Nacimiento
            </label>
            <div className="relative">
              <input
                type="text"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                placeholder="DD/MM/AAAA"
                readOnly
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="mt-1 block w-full pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300 cursor-pointer"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer mt-1"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="h-5 w-5 text-coastal-sea" />
              </div>

              {/* DatePicker Component */}
              {showDatePicker && (
                <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-64">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                    </button>
                    <div className="font-medium">
                      {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </div>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                    </button>
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                      <div key={index} className="text-center font-medium text-gray-500">{day}</div>
                    ))}
                  </div>

                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>

                  {/* Botones de acción */}
                  <div className="mt-2 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDatePicker(false);
                        setSelectedDate(null);
                        setFormData({...formData, birthdate: ''});
                      }}
                      className="px-3 py-1 text-sm text-deep-sea hover:bg-sand rounded"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="px-3 py-1 text-sm bg-coastal-sea text-white rounded hover:bg-open-sea"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Tu correo electrónico"
              disabled
              className="mt-1 block w-full pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300 opacity-75 cursor-not-allowed"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nueva contraseña"
              className="mt-1 block w-full pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300"
            />
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu nueva contraseña"
              className="mt-1 block w-full pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300"
            />
          </div>

          {/* Intereses */}
          <div className="space-y-2">
            <label className="block text-sm font-workSans-bold text-[var(--deep-sea)] mb-1">
              Selecciona tus intereses (mínimo 3)
            </label>
            <div className="relative">
              <div
                onClick={() => setShowInterestsDropdown(!showInterestsDropdown)}
                className="mt-1 block w-full pl-11 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300 cursor-pointer flex justify-between items-center"
              >
                <span>Seleccionar intereses</span>
                {showInterestsDropdown ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>

              {/* Lista de intereses seleccionados */}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedInterests.map((interest, index) => (
                  <div key={index} className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full flex items-center text-sm">
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-deep-sea hover:text-open-sea"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Dropdown para seleccionar intereses */}
              {showInterestsDropdown && (
                <div className="absolute z-40 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  <div className="p-2 flex">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Añadir interés (ej: Música)"
                      className="flex-grow mt-1 pl-8 pr-4 py-3 border border-[var(--sand)] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:border-[var(--coastal-sea)] bg-white transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={addNewCustomInterest}
                      className="ml-2 p-1 bg-coastal-sea text-white rounded-lg hover:bg-open-sea"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <ul className="py-1">
                    {customInterests.map((interest, index) => (
                      <li
                        key={index}
                        onClick={() => addInterest(interest)}
                        className="px-4 py-2 hover:bg-sand cursor-pointer text-deep-sea"
                      >
                        {interest}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Botón Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="
              relative w-full flex justify-center py-3 px-6 z-30
              bg-[var(--coastal-sea)] hover:bg-[var(--sand)] text-white hover:text-[var(--deep-sea)]
              font-workSans-bold rounded-2xl shadow-lg
              transition-all duration-300 transform hover:scale-[1.02]
              disabled:opacity-50 disabled:cursor-not-allowed
              mt-6
            "
          >
            {isLoading ? 'Saving...' : 'Guardar cambios'}
          </button>
    </div>
  );
}