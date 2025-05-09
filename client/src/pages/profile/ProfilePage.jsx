import React, { useState } from 'react';
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
import profileLogo from '../../assets/img/profileLogo.png';

const ProfilePage = () => {
  // Estado para controlar la visibilidad de los modales
  const [activeModal, setActiveModal] = useState(null);

  // Datos del usuario (simulados, en producción vendrían de una API)
  const [userData, setUserData] = useState({
    name: 'Nombre Apellido',
    username: 'nombreusuario',
    profileImage: profileLogo,
    stats: {
      following: 125,
      followers: 237,
      groups: 8,
      content: 42,
      requests: 5
    },
    bio: 'Entusiasta del conocimiento compartido. Me gusta aprender y enseñar sobre tecnología, ciencia y arte.',
    email: 'usuario@example.com',
    birthday: '15/03/90',
    interests: ['Programación', 'Inteligencia Artificial', 'Diseño Web', 'Literatura', 'Fotografía']
  });

  // Lista de ejemplos para los modales
  const mockFollowers = Array(userData.stats.followers).fill().map((_, i) => ({ id: i, name: `Seguidor ${i + 1}` }));
  const mockFollowing = Array(userData.stats.following).fill().map((_, i) => ({ id: i, name: `Seguido ${i + 1}` }));
  const mockGroups = Array(userData.stats.groups).fill().map((_, i) => ({ id: i, name: `Grupo ${i + 1}` }));
  const mockContent = Array(userData.stats.content).fill().map((_, i) => ({ id: i, title: `Publicación ${i + 1}` }));
  const mockRequests = Array(userData.stats.requests).fill().map((_, i) => ({ 
    id: i, 
    title: `Solicitud ${i + 1}`, 
    isCompleted: false 
  }));

  // Funciones para abrir modales
  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  // Función para cerrar cualquier modal
  const closeModal = () => {
    setActiveModal(null);
  };

  // Función para marcar solicitudes como completadas
  const markRequestAsCompleted = (requestId) => {
    // En producción, aquí iría una llamada a la API
    console.log(`Solicitud ${requestId} marcada como completada`);
  };

  // Función para guardar cambios del perfil
  const saveProfileChanges = (updatedData) => {
    // En producción, aquí iría una llamada a la API
    console.log('Datos actualizados:', updatedData);
    setUserData(updatedData);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Cabecera del perfil */}
        <ProfileHeader 
          name={userData.name}
          username={userData.username}
          profileImage={userData.profileImage}
        />

        {/* Estadísticas interactivas */}
        <ProfileStats 
          stats={userData.stats}
          onStatClick={openModal}
        />

        {/* Detalles del perfil */}
        <ProfileDetails 
          bio={userData.bio}
          email={userData.email}
          birthday={userData.birthday}
          interests={userData.interests}
        />

        {/* Acciones del perfil */}
        <ProfileActions onEditProfile={() => openModal('edit')} />

        {/* Modales */}
        {activeModal === 'followers' && (
          <FollowersModal 
            followers={mockFollowers} 
            onClose={closeModal} 
          />
        )}
        
        {activeModal === 'following' && (
          <FollowingModal 
            following={mockFollowing} 
            onClose={closeModal} 
          />
        )}
        
        {activeModal === 'groups' && (
          <GroupsModal 
            groups={mockGroups} 
            onClose={closeModal} 
          />
        )}
        
        {activeModal === 'content' && (
          <ContentModal 
            content={mockContent} 
            onClose={closeModal} 
          />
        )}
        
        {activeModal === 'requests' && (
          <RequestsModal 
            requests={mockRequests} 
            onClose={closeModal} 
            onMarkAsCompleted={markRequestAsCompleted}
          />
        )}
        
        {activeModal === 'edit' && (
          <EditProfileModal 
            userData={userData} 
            onClose={closeModal} 
            onSave={saveProfileChanges}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 