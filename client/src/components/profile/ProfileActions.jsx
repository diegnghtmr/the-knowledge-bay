import React from 'react';
import PropTypes from 'prop-types';

const ProfileActions = ({ onEditProfile }) => {
  return (
    <div className="flex justify-center md:justify-end mb-8">
      <button
        onClick={onEditProfile}
        className="flex items-center px-6 py-3 bg-[var(--coastal-sea)] text-white rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Editar Perfil
      </button>
    </div>
  );
};

ProfileActions.propTypes = {
  onEditProfile: PropTypes.func.isRequired
};

export default ProfileActions; 