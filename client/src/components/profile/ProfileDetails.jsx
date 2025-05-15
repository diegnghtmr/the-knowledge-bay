import React from 'react';
import PropTypes from 'prop-types';

const ProfileDetails = ({ bio, email, birthday, interests }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
      <h2 className="text-xl font-workSans-bold text-[var(--open-sea)] mb-4">Información del Perfil</h2>
      
      {/* Biografía */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--coastal-sea)] mb-2">Biografía</h3>
        <p className="text-gray-700">
          {bio || <span className="text-gray-500">N/A</span>}
        </p>
      </div>
      
      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Correo Electrónico</h3>
          <p className="font-bold text-[var(--deep-sea)]">{email || <span className="text-gray-500 font-normal">N/A</span>}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Fecha de Nacimiento</h3>
          <p className="font-bold text-[var(--deep-sea)]">
            {birthday || <span className="text-gray-500 font-normal">N/A</span>}
          </p>
        </div>
      </div>
      
      {/* Intereses */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--coastal-sea)] mb-2">Intereses</h3>
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-[var(--coastal-sea)] bg-opacity-20 text-[var(--open-sea)] rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">N/A</p>
        )}
      </div>
    </div>
  );
};

ProfileDetails.propTypes = {
  bio: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  birthday: PropTypes.string.isRequired,
  interests: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ProfileDetails; 