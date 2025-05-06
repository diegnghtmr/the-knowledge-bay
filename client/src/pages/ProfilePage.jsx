import { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext'; 
import { Mail, BookOpen, HelpCircle, Users, Calendar } from 'lucide-react';
import iconLogo from '../assets/img/iconLogo.webp'; 
import InterestTag from '../components/common/InterestTag';

const handleNavigate = (section) => {
  console.log(`Navegando a ${section}`);
  alert(`Navegando a la sección: ${section}`);
};

export default function ProfilePage() {
  const { token, isAuthenticated } = useAuth(); // Get token and authentication status
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure scrolling is enabled when the ProfilePage mounts
    document.body.classList.remove("no-scroll");

    const fetchProfile = async () => {
      if (!isAuthenticated || !token) {
        setError('User not authenticated.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true); // Set loading true before fetch
      setError(null); // Clear previous errors

      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response Data:', response.data); // <-- Add this log
        setProfileData(response.data);
      } catch (err) {
        console.error('API Fetch Error:', err); // <-- Add this log
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    // Optional cleanup: No action needed here as the default state is scroll enabled.
    return () => {
      // console.log("Cleaning up ProfilePage scroll effect");
    };
  }, [token, isAuthenticated]); // Rerun effect if token or auth status changes

  // Display loading state
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  }

  // Display error state
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">Error: {error}</div>;
  }

  // Display message if no profile data is found after loading
  if (!profileData) {
    return <div className="flex justify-center items-center min-h-screen">No profile data found.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      {/* Use --sand for the card background */}
      <div className="w-full max-w-2xl bg-[var(--sand)] rounded-lg overflow-hidden shadow-lg">
        {/* Header with project gradient, increased height */}
        <div className="h-24 bg-gradient-to-b from-[var(--open-sea)] to-[var(--coastal-sea)]"></div>

        {/* Profile icon, adjusted margin */}
        <div className="flex justify-center -mt-12"> {/* Adjusted margin to -mt-12 */}
          {/* Add border with --sand color, remove shadow, increase size */}
          <div className="rounded-full bg-white p-1 border-4 border-[var(--sand)]">
            <div className="rounded-full bg-white w-24 h-24 flex items-center justify-center overflow-hidden">
              {/* Use imported logo image, increased size */}
              <img src={iconLogo} alt="Profile Icon" className="w-16 h-16 object-contain" />
            </div>
          </div>
        </div>

        {/* Name and username */}
        <div className="text-center mt-2">
          <h1 className="text-2xl font-workSans-bold text-[var(--deep-sea)]">{`${profileData?.name || 'Nombre no especificado'} ${profileData?.lastName || 'Apellido no especificado'}`.trim()}</h1>
          <p className="text-[var(--open-sea)]">{`@${profileData?.username || 'Nombre de usuario no especificado'}`}</p>
        </div>

        {/* Stats - Interactive */}
        <div className="flex justify-center mt-4 px-4 text-center">
          <button
            className="px-4 hover:bg-white/50 rounded-lg transition-colors py-2 cursor-pointer" 
            onClick={() => handleNavigate('seguidores')}
            aria-label="Ver seguidores"
          >
            <p className="font-workSans-bold text-[var(--deep-sea)]">0</p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">seguidores</p>
          </button>
          <button
            className="px-4 hover:bg-white/50 rounded-lg transition-colors py-2 cursor-pointer" 
            onClick={() => handleNavigate('siguiendo')}
            aria-label="Ver siguiendo"
          >
            <p className="font-workSans-bold text-[var(--deep-sea)]">0</p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">siguiendo</p>
          </button>
          <button
            className="px-4 hover:bg-white/50 rounded-lg transition-colors py-2 cursor-pointer" 
            onClick={() => handleNavigate('grupos')}
            aria-label="Ver grupos"
          >
            <p className="font-workSans-bold text-[var(--deep-sea)]">0</p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">grupos</p>
          </button>
          <button
            className="px-4 hover:bg-white/50 rounded-lg transition-colors py-2 cursor-pointer" 
            onClick={() => handleNavigate('contenidos')}
            aria-label="Ver contenidos"
          >
            <p className="font-workSans-bold text-[var(--deep-sea)]">0</p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">contenidos</p>
          </button>
          <button
            className="px-4 hover:bg-white/50 rounded-lg transition-colors py-2 cursor-pointer" 
            onClick={() => handleNavigate('solicitudes')}
            aria-label="Ver solicitudes"
          >
            <p className="font-workSans-bold text-[var(--deep-sea)]">0</p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">solicitudes</p>
          </button>
        </div>

        {/* Biography */}
        <div className="mx-6 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="font-workSans-bold text-[var(--deep-sea)] mb-2">Biografía</h2>
            <p className="text-[var(--open-sea)] text-sm">
              {profileData?.biography ? (
                <strong className="font-semibold">{profileData.biography}</strong>
              ) : (
                'Biografía no especificada'
              )}
            </p>
          </div>
        </div>

        {/* Information and Interests */}
        <div className="flex flex-col md:flex-row mx-6 mt-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm w-full md:w-1/2">
            <h2 className="font-workSans-bold text-[var(--deep-sea)] mb-3">Información</h2>

            <div className="flex items-center mb-3">
              <div className="bg-[var(--coastal-sea)] p-2 rounded-lg mr-2"> 
                <Mail className="text-white w-5 h-5" /> 
              </div>
              <div>
                <p className="text-xs text-[var(--open-sea)]">Email</p>
                <p className="text-xs text-[var(--deep-sea)]"><strong>{profileData?.email || 'Email no especificado'}</strong></p>
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="bg-[var(--coastal-sea)] p-2 rounded-lg mr-2"> 
                <BookOpen className="text-white w-5 h-5" /> 
              </div>
              <div>
                <p className="text-xs text-[var(--open-sea)]">Contenidos Publicados</p>
                <p className="text-xs text-[var(--deep-sea)]"><strong>0 publicaciones</strong></p> 
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="bg-[var(--coastal-sea)] p-2 rounded-lg mr-2"> 
                <HelpCircle className="text-white w-5 h-5" /> 
              </div>
              <div>
                <p className="text-xs text-[var(--open-sea)]">Solicitudes de Ayuda</p>
                <p className="text-xs text-[var(--deep-sea)]"><strong>0 solicitudes</strong></p> 
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="bg-[var(--coastal-sea)] p-2 rounded-lg mr-2"> 
                <Users className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--open-sea)]">Grupos de Estudio</p>
                <p className="text-xs text-[var(--deep-sea)]"><strong>0 grupos</strong></p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-[var(--coastal-sea)] p-2 rounded-lg mr-2"> 
                <Calendar className="text-white w-5 h-5" /> 
              </div>
              <div>
                <p className="text-xs text-[var(--open-sea)]">Fecha de Nacimiento</p>
                <p className="text-xs text-[var(--deep-sea)]"><strong>{profileData?.birthdate || 'Fecha de nacimiento no especificada'}</strong></p>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-lg p-4 shadow-sm w-full md:w-1/2">
            <h2 className="font-workSans-bold text-[var(--deep-sea)] mb-3">Intereses</h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(profileData?.interests) && profileData.interests.length > 0 ? (
                profileData.interests.map((interest, index) => (
                  <span key={index} className="font-semibold">
                    <InterestTag name={interest?.name || interest} />
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay intereses especificados</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit profile button */}
        <div className="flex justify-center mb-6">
          <button className="bg-[var(--coastal-sea)] hover:bg-[var(--open-sea)] text-white font-workSans-bold py-2 px-8 rounded">
            Editar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}