import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import profileLogo from '../../../assets/img/profileLogo.png';
import { followUser, unfollowUser } from '../../../services/userApi';

const UserCard = ({ user, onToggleFollow }) => {
  const { id, username, firstName, lastName, interests, isFollowing } = user;
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <img 
          src={profileLogo} 
          alt={`${firstName} ${lastName}`} 
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div className="flex-1">
          <Link 
            to={`/profile/view/${id}`} 
            className="text-lg font-medium text-[var(--deep-sea)] hover:text-[var(--coastal-sea)]"
          >
            {firstName} {lastName}
          </Link>
          <p className="text-sm text-gray-500">@{username}</p>
        </div>
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              if (isFollowing) {
                await unfollowUser(id);
              } else {
                await followUser(id);
              }
              onToggleFollow(id);
            } catch (error) {
              console.error('Error toggling follow:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className={`px-4 py-1.5 rounded-md text-sm font-medium ${
            isFollowing 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-[var(--coastal-sea)] text-white hover:bg-opacity-90'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Cargando...' : (isFollowing ? 'Siguiendo' : 'Seguir')}
        </button>
      </div>
      
      {interests.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs text-gray-500 mb-1">Intereses:</h4>
          <div className="flex flex-wrap gap-1">
            {interests.map(interest => (
              <span 
                key={interest} 
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <Link 
          to={`/profile/view/${id}`}
          className="text-sm text-[var(--coastal-sea)] hover:underline"
        >
          Ver perfil completo
        </Link>
      </div>
    </div>
  );
};

const UserList = ({ users, onToggleFollow }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-[var(--open-sea)]">No se encontraron usuarios que coincidan con los criterios de búsqueda.</p>
        <p className="text-sm text-gray-500 mt-2">Intenta con otros filtros o términos de búsqueda.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onToggleFollow={onToggleFollow} 
        />
      ))}
    </div>
  );
};

export default UserList; 