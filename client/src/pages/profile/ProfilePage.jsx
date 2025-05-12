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
import profileLogo from '../../assets/img/profileLogo.png';
// Import profile API service
import { getProfile, updateProfile } from '../../services/profileApi';

const ProfilePage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionStorage.setItem('token', '1');
    (async () => {
      const response = await getProfile();
      if (response.success) {
        setUserData(response.data);
      } else {
        console.error('Error fetching profile:', response.message);
      }
      setLoading(false);
    })();
  }, []);
  
  if (loading) return <div>Cargando perfil...</div>;

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
  const birthday = userData.dateBirth || '';
  const interests = userData.interests || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader
          firstName={firstName}
          lastName={lastName}
          username={userData.username}
          profileImage={profileLogo}
        />

        <ProfileStats
          stats={{ following: 0, followers: 0, groups: 0, content: 0, requests: 0 }}
          onStatClick={openModal}
        />

        <ProfileDetails
          bio={bio}
          email={email}
          birthday={birthday}
          interests={interests}
        />

        <ProfileActions onEditProfile={() => openModal('edit')} />

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
