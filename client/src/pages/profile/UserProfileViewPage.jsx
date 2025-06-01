import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileDetails from '../../components/profile/ProfileDetails';
import ProfileActions from '../../components/profile/ProfileActions';
import FollowersModal from '../../components/profile/modals/FollowersModal';
import FollowingModal from '../../components/profile/modals/FollowingModal';
import GroupsModal from '../../components/profile/modals/GroupsModal';
import ContentModal from '../../components/profile/modals/ContentModal';
import RequestsModal from '../../components/profile/modals/RequestsModal';
import NavigationBar from '../../components/layout/NavigationBar';
import profileLogo from '../../assets/img/profileLogo.png';
// Import profile API services
import { getProfileByUserId, getFollowStatus, followUser, unfollowUser } from '../../services/profileApi';

const UserProfileViewPage = () => {
  const { userId } = useParams();
  const [activeModal, setActiveModal] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos mock para los modales (en una implementación real vendrían de la API)
  const mockFollowers = [];
  const mockFollowing = [];
  const mockGroups = [];
  const mockContent = [];
  const mockRequests = [];

  useEffect(() => {
    // Cargar perfil del usuario y estado de seguimiento
    (async () => {
      try {
        setLoading(true);
        // Obtener datos del perfil
        const profileResponse = await getProfileByUserId(userId);
        
        // Obtener estado de seguimiento
        const followStatusResponse = await getFollowStatus(userId);
        
        if (profileResponse.success) {
          setUserData(profileResponse.data);
          
          if (followStatusResponse.success) {
            setIsFollowing(followStatusResponse.data.isFollowing);
          }
        } else {
          console.error('Error fetching profile:', profileResponse.message);
          setError('No se pudo cargar el perfil: ' + profileResponse.message);
        }
      } catch (err) {
        console.error('Error en la carga del perfil:', err.message);
        setError('No se pudo cargar el perfil. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]); // Se volverá a ejecutar si cambia el userId

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // Si ya lo sigue, dejar de seguir
        const response = await unfollowUser(userId);
        if (response.success) {
          setIsFollowing(false);
        }
      } else {
        // Si no lo sigue, seguir
        const response = await followUser(userId);
        if (response.success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error('Error al cambiar estado de seguimiento:', error);
    }
  };
  
  // Función de marcado de solicitudes completadas (en este caso será un Mock)
  const markRequestAsCompleted = (requestId) => {
    console.log(`Solicitud ${requestId} marcada como completada`);
    // En una implementación real, esto no debería ser posible desde la vista de otro usuario
  };

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

  // Obtener datos limpios para el perfil
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const bio = userData.biography || '';
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
  
  // Fix: Use the actual field names from the API response instead of userData.stats
  const stats = {
    following: userData.following || 0,
    followers: userData.followers || 0, 
    groups: userData.groups || 0,
    content: userData.contentCount || 0,
    requests: userData.helpRequestCount || 0
  };

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar title="Perfil de Usuario" />
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader
          firstName={firstName}
          lastName={lastName}
          username={userData.username}
          profileImage={profileLogo}
        />

        <ProfileStats
          stats={stats}
          onStatClick={openModal}
        />

        <ProfileDetails
          bio={bio}
          email={email}
          birthday={birthday}
          interests={interests}
        />

        <ProfileActions 
          isOwnProfile={false}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
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
            canManageRequests={false} // El usuario visitante no puede marcar solicitudes como completadas
          />
        )}
      </div>
    </div>
  );
};

export default UserProfileViewPage;