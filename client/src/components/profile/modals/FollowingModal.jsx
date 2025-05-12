import React from 'react';
import PropTypes from 'prop-types';
import ImprovedModalBase from './ImprovedModalBase';
import ListItem from './ListItem';
import { UserGroupIcon } from '@heroicons/react/24/solid';

const FollowingModal = ({ following, onClose }) => {
  const handleViewFollowing = (followingId) => {
    // Aquí iría la lógica para navegar al perfil del usuario seguido
    console.log(`Ver perfil del usuario seguido con ID: ${followingId}`);
    // En implementación real: history.push(`/profile/${followingId}`);
  };

  return (
    <ImprovedModalBase 
      title="Seguidos" 
      onClose={onClose}
      customIcon={UserGroupIcon}
    >
      <div className="space-y-1">
        {following.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sigues a ningún usuario aún.</p>
        ) : (
          following.map(followedUser => (
            <ListItem
              key={followedUser.id}
              firstName={followedUser.firstName}
              lastName={followedUser.lastName}
              onView={() => handleViewFollowing(followedUser.id)}
            />
          ))
        )}
      </div>
    </ImprovedModalBase>
  );
};

FollowingModal.propTypes = {
  following: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired
};

export default FollowingModal; 