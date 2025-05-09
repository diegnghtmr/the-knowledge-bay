import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, BookOpen, HelpCircle, Users, Calendar } from 'lucide-react';
import iconLogo from '../assets/img/iconLogo.webp';
import InterestTag from '../components/common/InterestTag';
import Modal from '../components/common/Modal.jsx';
import UserListItem from '../components/profile/UserListItem.jsx';
import RequestListItem from '../components/profile/RequestListItem.jsx';
import EditProfileForm from '../components/profile/EditProfileForm.jsx';

// Mock Data
const mockFollowersData = [
  { id: 1, name: 'Gandalf The Grey' },
  { id: 2, name: 'Frodo Baggins' },
  { id: 3, name: 'Samwise Gamgee' },
];

const mockFollowingData = [
  { id: 4, name: 'Aragorn Elessar' },
  { id: 5, name: 'Legolas Greenleaf' },
];

const mockRequestsData = [
  { id: 1, name: 'Bilbo Baggins', details: 'Wants to join your adventure' },
  { id: 2, name: 'Aragorn Elessar', details: 'Needs help with a quest' },
  { id: 3, name: 'Gimli son of Glóin', details: 'Offers his axe' },
];

const mockGroupsData = [
  { id: 'g1', name: 'Grupo de Estudio de React' },
  { id: 'g2', name: 'Amantes de la IA' },
  { id: 'g3', name: 'Desarrollo Web Full-Stack' },
];

const mockContentsData = [
  { id: 'c1', name: 'Introducción a Tailwind CSS' },
  { id: 'c2', name: 'Guía Avanzada de Java' },
  { id: 'c3', name: 'Microservicios con Spring Boot' },
];

export default function ProfilePage() {
  const { token, isAuthenticated } = useAuth(); // Get token and authentication status
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);

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

  const handleProfileUpdateSuccess = (updatedUserData) => {
    setShowEditProfileForm(false);
    // Re-fetch data to ensure consistency
    fetchProfile();
    // Optionally, display a success message, e.g., using a toast notification library
    // For now, an alert can be used for simplicity if desired, or removed.
    // alert("Profile successfully updated on ProfilePage!");
  };

  const handleOpenModal = (type, title, data) => {
    setModalType(type);
    setModalTitle(title);
    setModalData(data);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setModalData([]);
    setModalTitle('');
  };

  useEffect(() => {
    // Ensure scrolling is enabled when the ProfilePage mounts
    document.body.classList.remove("no-scroll");

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
          <div
            className="text-center cursor-pointer hover:text-indigo-500 px-4 py-2 rounded-lg transition-colors hover:bg-white/50"
            onClick={() => handleOpenModal('followers', 'Seguidores', mockFollowersData)}
            aria-label="Ver seguidores"
          >
            <p className="text-xl font-semibold text-[var(--deep-sea)]">
              {profileData?.followersCount || mockFollowersData.length}
            </p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">Seguidores</p>
          </div>
          <div
            className="text-center cursor-pointer hover:text-indigo-500 px-4 py-2 rounded-lg transition-colors hover:bg-white/50"
            onClick={() => handleOpenModal('following', 'Siguiendo', mockFollowingData)}
            aria-label="Ver siguiendo"
          >
            <p className="text-xl font-semibold text-[var(--deep-sea)]">
              {profileData?.followingCount || mockFollowingData.length}
            </p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">Siguiendo</p>
          </div>
          <div
            className="text-center cursor-pointer hover:text-indigo-500 px-4 py-2 rounded-lg transition-colors hover:bg-white/50"
            onClick={() => handleOpenModal('groups', 'Grupos', mockGroupsData)}
            aria-label="Ver grupos de estudio"
          >
            <p className="text-xl font-semibold text-[var(--deep-sea)]">
              {mockGroupsData.length}
            </p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">Grupos</p>
          </div>
          <div
            className="text-center cursor-pointer hover:text-indigo-500 px-4 py-2 rounded-lg transition-colors hover:bg-white/50"
            onClick={() => handleOpenModal('contents', 'Contenidos Publicados', mockContentsData)}
            aria-label="Ver contenidos publicados"
          >
            <p className="text-xl font-semibold text-[var(--deep-sea)]">
              {mockContentsData.length}
            </p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">Publicaciones</p>
          </div>
          <div
            className="text-center cursor-pointer hover:text-indigo-500 px-4 py-2 rounded-lg transition-colors hover:bg-white/50"
            onClick={() => handleOpenModal('requests', 'Solicitudes de Amistad', mockRequestsData)}
            aria-label="Ver solicitudes de amistad"
          >
            <p className="text-xl font-semibold text-[var(--deep-sea)]">
              {profileData?.requestsCount || mockRequestsData.length}
            </p>
            <p className="text-sm text-[var(--open-sea)] font-semibold">Solicitudes</p>
          </div>
        </div>

        {/* Biography */}
        <div className="mx-6 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="font-workSans-bold text-[var(--deep-sea)] mb-2">Biografía</h2>
            <p className="text-[var(--open-sea)] text-sm">
              {profileData?.biography ? (
                <strong className="font-semibold">{profileData.biography}</strong>
              ) : (
                'Biografía no disponible'
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
                <p className="text-xs text-[var(--deep-sea)]"><strong>{mockContentsData.length} publicaciones</strong></p>
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="bg-[var(--coastal-sea)] p-2 rounded-lg mr-2">
                <HelpCircle className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--open-sea)]">Solicitudes de Ayuda</p>
                <p className="text-xs text-[var(--deep-sea)]"><strong>{profileData?.helpRequestsCount || 0} solicitudes</strong></p>
              </div>
            </div>

            <div className="flex items-center mb-3">
              <div className="bg-[var(--coastal-sea)] p-2 rounded-lg mr-2">
                <Users className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--open-sea)]">Grupos de Estudio</p>
                <p className="text-xs text-[var(--deep-sea)]"><strong>{mockGroupsData.length} grupos</strong></p>
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
                <p className="text-sm text-gray-500">Intereses no especificados</p>
              )}
            </div>
          </div>
        </div>

        {/* Edit profile button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowEditProfileForm(!showEditProfileForm)}
            className="bg-[var(--coastal-sea)] hover:bg-[var(--open-sea)] text-white font-workSans-bold py-2 px-8 rounded"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {showEditProfileForm && profileData && (
        <Modal
          isOpen={showEditProfileForm}
          onClose={() => setShowEditProfileForm(false)}
          title="Editar Perfil"
        >
          <EditProfileForm
            currentUserProfile={profileData}
            onProfileUpdateSuccess={handleProfileUpdateSuccess}
          />
        </Modal>
      )}

      {modalType && (
        <Modal isOpen={modalType !== null} onClose={handleCloseModal} title={modalTitle}>
          {modalData && modalData.length > 0 ? (
            <ul className="space-y-2 max-h-96 overflow-y-auto p-1">
              {modalData.map((item) => (
                <li key={item.id} className="border-b border-[var(--coastal-sea)] pb-2 last:border-b-0">
                  {modalType === 'followers' || modalType === 'following' || modalType === 'groups' || modalType === 'contents' ? (
                    <UserListItem
                      user={item} // 'item' will have 'id' and 'name' for groups and contents
                      onView={(itemId) => console.log(`View item: ${itemId}`)}
                    />
                  ) : modalType === 'requests' ? (
                    <RequestListItem
                      request={item}
                      onView={(requestId) => console.log('View request:', requestId)}
                      onAccept={(requestId) => console.log('Accept request:', requestId)}
                      onReject={(requestId) => console.log('Reject request:', requestId)}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No hay {modalType === 'followers' ? 'seguidores' : modalType === 'following' ? 'personas a las que sigues' : modalType === 'requests' ? 'solicitudes' : modalType === 'groups' ? 'grupos' : modalType === 'contents' ? 'contenidos publicados' : 'elementos'} para mostrar.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}