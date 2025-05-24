import React, { useState, useEffect } from 'react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileDetails from '../../components/profile/ProfileDetails';
import ProfileActions from '../../components/profile/ProfileActions';
import FollowersModal from '../../components/profile/modals/FollowersModal';
import FollowingModal from '../../components/profile/modals/FollowingModal';
import GroupsModal from '../../components/profile/modals/GroupsModal';
import ContentModal from '../../components/profile/modals/ContentModal';
import RequestsModal from '../../components/profile/modals/RequestsModal';
import EditProfileModal from '../../components/profile/modals/EditProfileModal';
import NavigationBar from '../../components/layout/NavigationBar';
import profileLogo from '../../assets/img/profileLogo.png';
// Import profile API service
import { getProfile, updateProfile } from '../../services/profileApi';

const ProfilePage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos mock para los modales
  const mockFollowers = [];
  const mockFollowing = [];
  const mockGroups = [];
  const mockContent = [];
  const mockRequests = [];

  useEffect(() => {
    // Usamos el token que ya está en sessionStorage (del login)
    (async () => {
      try {
        const response = await getProfile();
        if (response.success) {
          setUserData(response.data);
        } else {
          console.error('Error fetching profile:', response.message);
          setError('No se pudo cargar el perfil: ' + response.message);
          // Establecer datos de usuario predeterminados para evitar errores
          setUserData({
            firstName: '',
            lastName: '',
            username: 'usuario',
            biography: '',
            email: '',
            dateBirth: '',
            interests: []
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err.message);
        setError('No se pudo cargar el perfil: ' + err.message);
        // Establecer datos de usuario predeterminados para evitar errores
        setUserData({
          firstName: '',
          lastName: '',
          username: 'usuario',
          biography: '',
          email: '',
          dateBirth: '',
          interests: []
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  if (loading) return <div>Cargando perfil...</div>;
  
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error al cargar el perfil</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-600">
            Por favor, verifica tu conexión a internet y que el servidor esté funcionando correctamente.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[var(--coastal-sea)] text-white rounded-md"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  // Si userData es null, no debería llegar aquí debido al manejo de errores,
  // pero por si acaso, agregamos una verificación adicional
  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error inesperado</h2>
          <p className="text-gray-700">No se pudieron cargar los datos del perfil.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[var(--coastal-sea)] text-white rounded-md"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const markRequestAsCompleted = (requestId) => {
    console.log(`Solicitud ${requestId} marcada como completada`);
  };
  const saveProfileChanges = async (updatedData) => {
    const response = await updateProfile(updatedData);
    if (response.success) {
      setUserData(response.data);
      closeModal();
    } else {
      console.error('Error updating profile:', response.message);
    }
  };

  // Obtener datos limpios para el perfil
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  
  // Comprobar si la biografía es el placeholder por defecto
  const bio = userData.biography === '[Tu biografía aquí]' ? '' : (userData.biography || '');
  
  const email = userData.email || '';
  
  // Convertir el formato de fecha ISO a formato legible (DD/MM/YYYY)
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    try {
      // Si es un objeto Date en formato ISO
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) {
        // Si no es una fecha válida, devolver la cadena original
        return isoDate;
      }
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      // Si hay algún error, devolver la cadena original
      return isoDate;
    }
  };
  
  const birthday = formatDate(userData.dateBirth);
  const interests = userData.interests || [];

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar title="Mi Perfil" />
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader
          firstName={firstName}
          lastName={lastName}
          username={userData.username}
          profileImage={profileLogo}
        />

        <ProfileStats
          stats={{ 
            following: userData.following || 0, 
            followers: userData.followers || 0, 
            groups: userData.groups || 0, 
            content: userData.content || 0, 
            requests: userData.requests || 0 
          }}
          onStatClick={openModal}
        />

        <ProfileDetails
          bio={bio}
          email={email}
          birthday={birthday}
          interests={interests}
        />

        <ProfileActions 
          isOwnProfile={true}
          onEditProfile={() => openModal('edit')}
        />

        {/* Modales */}
        {activeModal === 'followers' && <FollowersModal followers={mockFollowers} onClose={closeModal} />}
        {activeModal === 'following' && <FollowingModal following={mockFollowing} onClose={closeModal} />}
        {activeModal === 'groups' && <GroupsModal groups={mockGroups} onClose={closeModal} />}
        {activeModal === 'content' && <ContentModal content={mockContent} onClose={closeModal} />}
        {activeModal === 'requests' && (
          <RequestsModal
            requests={mockRequests}
            onClose={closeModal}
            onMarkAsCompleted={markRequestAsCompleted}
            canManageRequests={true}
          />
        )}
        {activeModal === 'edit' && (
          <EditProfileModal
            userData={{
              firstName,
              lastName,
              username: userData.username,
              bio,
              email,
              birthday,
              interests
            }}
            onClose={closeModal}
            onSave={saveProfileChanges}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
