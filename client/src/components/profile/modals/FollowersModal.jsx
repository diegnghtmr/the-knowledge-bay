import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import ImprovedModalBase from './ImprovedModalBase';
import ListItem from './ListItem';
import { UsersIcon } from '@heroicons/react/24/solid';

const FollowersModal = ({ followers, onClose }) => {
  const navigate = useNavigate();

  const handleViewFollower = (followerId) => {
    // Cerrar el modal primero
    onClose();
    // Navegar al perfil del seguidor
    navigate(`/user/${followerId}`);
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