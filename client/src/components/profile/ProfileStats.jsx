import React from 'react';
import PropTypes from 'prop-types';

const ProfileStats = ({ stats, onStatClick }) => {
  const statItems = [
    { key: 'following', label: 'Seguidos', value: stats.following },
    { key: 'followers', label: 'Seguidores', value: stats.followers },
    { key: 'groups', label: 'Grupos', value: stats.groups },
    { key: 'content', label: 'Publicaciones', value: stats.content },
    { key: 'requests', label: 'Solicitudes', value: stats.requests }
  ];
  
  return (
    <div className="bg-[var(--sand)] rounded-lg p-4 mb-8 shadow-sm">
      <h2 className="sr-only">Estadísticas del perfil</h2>
      <div className="flex flex-wrap justify-around">
        {statItems.map(item => (
          <button
            key={item.key}
            onClick={() => onStatClick(item.key)}
            className="flex flex-col items-center p-3 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] rounded-lg"
            title={`Ver ${item.label.toLowerCase()}`}
          >
            <span className="text-2xl font-bold text-[var(--open-sea)]">{item.value}</span>
            <span className="text-sm text-gray-700">{item.label}</span>
            
            {/* Indicador visual para solicitudes pendientes */}
            {item.key === 'requests' && item.value > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0 transform translate-x-1 -translate-y-1"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

ProfileStats.propTypes = {
  stats: PropTypes.shape({
    following: PropTypes.number.isRequired,
    followers: PropTypes.number.isRequired,
    groups: PropTypes.number.isRequired,
    content: PropTypes.number.isRequired,
    requests: PropTypes.number.isRequired
  }).isRequired,
  onStatClick: PropTypes.func.isRequired
};

export default ProfileStats; 