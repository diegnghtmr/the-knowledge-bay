import React from 'react';
import PropTypes from 'prop-types';

const ProfileHeader = ({ firstName, lastName, username, profileImage }) => {
  const displayFirstName = firstName ? firstName : 'N/A';
  const displayLastName = lastName ? lastName : 'N/A';
  const fullName = `${displayFirstName} ${displayLastName}`;
  
  return (
    <div className="flex flex-col md:flex-row items-center mb-8 py-6 border-b border-gray-200">
      {/* Foto de perfil */}
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-8 border-2 border-[var(--coastal-sea)] bg-white p-4">
        <img 
          src={profileImage} 
          alt={`Perfil de ${fullName}`} 
          className="w-full h-full object-contain scale-90"
        />
      </div>
      
      {/* Información principal */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold font-workSans-bold text-[var(--deep-sea)] mb-2">
          {fullName}
        </h1>
        <p className="text-lg text-gray-600">
          @{username}
        </p>
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  profileImage: PropTypes.string.isRequired,
};

export default ProfileHeader; 