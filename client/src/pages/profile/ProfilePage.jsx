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
import { getProfile, updateProfile, getFollowers, getFollowing } from '../../services/profileApi';
import { helpRequestApi } from '../../services/helpRequestApi';
import { contentApi } from '../../services/contentApi';
import { getAllGroups } from '../../services/studyGroupApi';

const ProfilePage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para datos de modales
  const [userRequests, setUserRequests] = useState([]);
  const [userContent, setUserContent] = useState([]);
  const [userFollowers, setUserFollowers] = useState([]);
  const [userFollowing, setUserFollowing] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Datos mock para modales no implementados
  const [userGroups, setUserGroups] = useState([]);

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
            interests: [],
            following: 0,
            followers: 0,
            groups: 0,
            contentCount: 0,
            helpRequestCount: 0,
            isFollowing: false // Default for own profile
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
          interests: [],
          following: 0,
          followers: 0,
          groups: 0,
          contentCount: 0,
          helpRequestCount: 0,
          isFollowing: false // Default for own profile
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

  const openModal = async (modalName) => {
    setActiveModal(modalName);
    
    if (modalName === 'requests') {
      await loadUserRequests();
    } else if (modalName === 'content') {
      await loadUserContent();
    } else if (modalName === 'groups') {
      await loadUserGroups();
    } else if (modalName === 'followers') {
      await loadUserFollowers();
    } else if (modalName === 'following') {
      await loadUserFollowing();
    }
  };
  
  const closeModal = () => setActiveModal(null);
  
  const loadUserRequests = async () => {
    setModalLoading(true);
    try {
      const requests = await helpRequestApi.getUserHelpRequests();
      // Obtener solicitudes marcadas como completadas localmente
      const completedRequests = JSON.parse(localStorage.getItem('completedRequests') || '[]');
      
      // Transformar los datos para el modal
      const transformedRequests = requests.map(req => ({
        id: req.requestId,
        title: req.information.substring(0, 50) + (req.information.length > 50 ? '...' : ''),
        isCompleted: req.isCompleted || completedRequests.includes(req.requestId),
        urgency: req.urgency,
        topics: req.topics,
        requestDate: req.requestDate
      }));
      setUserRequests(transformedRequests);
    } catch (error) {
      console.error('Error loading user requests:', error);
      setUserRequests([]);
    } finally {
      setModalLoading(false);
    }
  };

  const loadUserContent = async () => {
    setModalLoading(true);
    try {
      const content = await contentApi.getUserContent();
      // Transformar los datos para el modal
      const transformedContent = content.map(item => ({
        id: item.contentId,
        title: item.title,
        contentType: item.contentType,
        date: item.date,
        likeCount: item.likeCount
      }));
      setUserContent(transformedContent);
    } catch (error) {
      console.error('Error loading user content:', error);
      setUserContent([]);
    } finally {
      setModalLoading(false);
    }
  };

  const loadUserGroups = async () => {
    setModalLoading(true);
    try {
      const groups = await getAllGroups();
      // Assuming the API returns groups in a format compatible with GroupsModal
      // or we transform them here if needed.
      // For now, we'll assume they are directly usable.
      setUserGroups(groups);
    } catch (error) {
      console.error('Error loading user groups:', error);
      setUserGroups([]);
    } finally {
      setModalLoading(false);
    }
  };
  
  const loadUserFollowers = async () => {
    setModalLoading(true);
    try {
      const response = await getFollowers();
      if (response.success) {
        setUserFollowers(response.data);
      } else {
        console.error('Error loading followers:', response.message);
        setUserFollowers([]);
      }
    } catch (error) {
      console.error('Error loading followers:', error);
      setUserFollowers([]);
    } finally {
      setModalLoading(false);
    }
  };
  
  const loadUserFollowing = async () => {
    setModalLoading(true);
    try {
      const response = await getFollowing();
      if (response.success) {
        setUserFollowing(response.data);
      } else {
        console.error('Error loading following:', response.message);
        setUserFollowing([]);
      }
    } catch (error) {
      console.error('Error loading following:', error);
      setUserFollowing([]);
    } finally {
      setModalLoading(false);
    }
  };
  
  const markRequestAsCompleted = async (requestId) => {
    try {
      await helpRequestApi.markAsCompleted(requestId);
      
      // Guardar en localStorage para persistencia local
      const completedRequests = JSON.parse(localStorage.getItem('completedRequests') || '[]');
      if (!completedRequests.includes(requestId)) {
        completedRequests.push(requestId);
        localStorage.setItem('completedRequests', JSON.stringify(completedRequests));
      }
      
      // Actualizar la lista local
      setUserRequests(userRequests.map(req => 
        req.id === requestId ? { ...req, isCompleted: true } : req
      ));
      
      // También recargar el perfil para actualizar las estadísticas
      const response = await getProfile();
      if (response.success) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Error marking request as completed:', error);
      alert('Error al marcar la solicitud como completada');
    }
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
            content: userData.contentCount || 0, 
            requests: userData.helpRequestCount || 0 
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
        {activeModal === 'followers' && <FollowersModal followers={userFollowers} onClose={closeModal} />}
        {activeModal === 'following' && <FollowingModal following={userFollowing} onClose={closeModal} />}
        {activeModal === 'groups' && <GroupsModal groups={userGroups} onClose={closeModal} loading={modalLoading} />}
        {activeModal === 'content' && <ContentModal content={userContent} onClose={closeModal} loading={modalLoading} />}
        {activeModal === 'requests' && (
          <div>
            {modalLoading ? (
              <div className="text-center p-8">Cargando solicitudes...</div>
            ) : (
              <RequestsModal
                requests={userRequests}
                onClose={closeModal}
                onMarkAsCompleted={markRequestAsCompleted}
                canManageRequests={true}
              />
            )}
          </div>
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
