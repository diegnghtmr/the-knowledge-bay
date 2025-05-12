import React from 'react';
import PropTypes from 'prop-types';
import ImprovedModalBase from './ImprovedModalBase';
import ListItem from './ListItem';
import { UsersIcon } from '@heroicons/react/24/solid';

const FollowersModal = ({ followers, onClose }) => {
  const handleViewFollower = (followerId) => {
    // Aquí iría la lógica para navegar al perfil del seguidor
    console.log(`Ver perfil del seguidor con ID: ${followerId}`);
    // En implementación real: history.push(`/profile/${followerId}`);
  };

  return (
    <ImprovedModalBase 
      title="Seguidores" 
      onClose={onClose}
      customIcon={UsersIcon}
    >
      <div className="space-y-1">
        {followers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tienes seguidores aún.</p>
        ) : (
          followers.map(follower => (
            <ListItem
              key={follower.id}
              firstName={follower.firstName}
              lastName={follower.lastName}
              onView={() => handleViewFollower(follower.id)}
            />
          ))
        )}
      </div>
    </ImprovedModalBase>
  );
};

FollowersModal.propTypes = {
  followers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired
};

export default FollowersModal; 