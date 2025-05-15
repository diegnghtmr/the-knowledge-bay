import React from 'react';
import PropTypes from 'prop-types';

const ProfileActions = ({ isOwnProfile, isFollowing, onEditProfile, onFollowToggle }) => {
  return (
    <div className="flex justify-center md:justify-end mb-8">
      {isOwnProfile ? (
        <button
          onClick={onEditProfile}
          className="flex items-center px-6 py-3 bg-[var(--coastal-sea)] text-white rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Editar Perfil
        </button>
      ) : (
        <button
          onClick={onFollowToggle}
          className={`flex items-center px-6 py-3 ${isFollowing ? 'bg-gray-200 text-gray-700' : 'bg-[var(--coastal-sea)] text-white'} rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50 shadow-sm`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            {isFollowing ? (
              <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2h4a1 1 0 100-2h-4z" />
            ) : (
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            )}
          </svg>
          {isFollowing ? 'Dejar de Seguir' : 'Seguir'}
        </button>
      )}
    </div>
  );
};

ProfileActions.propTypes = {
  isOwnProfile: PropTypes.bool.isRequired,
  isFollowing: PropTypes.bool,
  onEditProfile: PropTypes.func,
  onFollowToggle: PropTypes.func
};

ProfileActions.defaultProps = {
  isOwnProfile: true,
  isFollowing: false
};

export default ProfileActions;