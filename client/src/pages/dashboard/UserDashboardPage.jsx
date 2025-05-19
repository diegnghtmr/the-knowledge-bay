import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import UserSearchFilter from '../../components/dashboard/users/UserSearchFilter';
import UserList from '../../components/dashboard/users/UserList';
import UserStatsCard from '../../components/dashboard/users/UserStatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// En un futuro esto vendría de una API
const fetchUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [
          { id: 1, username: 'maria_edu', firstName: 'María', lastName: 'García', interests: ['Matemáticas', 'Física'], isFollowing: false },
          { id: 2, username: 'carlos_research', firstName: 'Carlos', lastName: 'López', interests: ['Literatura', 'Historia'], isFollowing: true },
          { id: 3, username: 'ana_science', firstName: 'Ana', lastName: 'Martínez', interests: ['Biología', 'Química'], isFollowing: false },
          { id: 4, username: 'david_tech', firstName: 'David', lastName: 'Rodríguez', interests: ['Programación', 'Inteligencia Artificial'], isFollowing: true },
          { id: 5, username: 'sofia_arts', firstName: 'Sofía', lastName: 'Fernández', interests: ['Arte', 'Diseño'], isFollowing: false },
        ]
      });
    }, 800);
  });
};

const fetchUserStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          totalUsers: 1250,
          newThisMonth: 78,
          connectedUsers: 42,
          recommendedUsers: 15
        }
      });
    }, 500);
  });
};

const UserDashboardPage = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    interests: [],
    showFollowing: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Cargar datos de usuarios
        const usersResponse = await fetchUsers();
        // Cargar estadísticas
        const statsResponse = await fetchUserStats();
        
        if (usersResponse.success && statsResponse.success) {
          setUsers(usersResponse.data);
          setFilteredUsers(usersResponse.data);
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtrar usuarios cuando cambian los parámetros de búsqueda
  useEffect(() => {
    let result = [...users];
    
    // Filtrar por término de búsqueda
    if (searchParams.searchTerm) {
      const term = searchParams.searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por intereses
    if (searchParams.interests.length > 0) {
      result = result.filter(user => 
        user.interests.some(interest => 
          searchParams.interests.includes(interest)
        )
      );
    }
    
    // Filtrar por seguidos
    if (searchParams.showFollowing) {
      result = result.filter(user => user.isFollowing);
    }
    
    setFilteredUsers(result);
  }, [searchParams, users]);

  const handleSearchChange = (newParams) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  };

  const handleToggleFollow = (userId) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isFollowing: !user.isFollowing } 
          : user
      )
    );
  };

  // Enlaces para la navegación interna
  const navLinks = [
    { label: 'Todos los usuarios', to: '/user-dashboard', isActive: location.pathname === '/user-dashboard' },
    { label: 'Recomendados', to: '/user-dashboard/recommended', isActive: location.pathname === '/user-dashboard/recommended' },
    { label: 'Conectados', to: '/user-dashboard/connected', isActive: location.pathname === '/user-dashboard/connected' }
  ];

  return (
    <DashboardLayout 
      title="Gestión de Usuarios" 
      description="Explora y conecta con otros usuarios de la plataforma"
      navLinks={navLinks}
    >
      {loading ? (
        <LoadingSpinner message="Cargando usuarios..." />
      ) : (
        <>
          {/* Panel de estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <UserStatsCard 
                title="Total de Usuarios" 
                value={stats.totalUsers}
                icon="👥"
                color="bg-[var(--coastal-sea)]"
              />
              <UserStatsCard 
                title="Nuevos este mes" 
                value={stats.newThisMonth}
                icon="✨"
                color="bg-[var(--open-sea)]"
              />
              <UserStatsCard 
                title="Usuarios conectados" 
                value={stats.connectedUsers}
                icon="🔗"
                color="bg-[var(--deep-sea)]"
              />
              <UserStatsCard 
                title="Recomendados" 
                value={stats.recommendedUsers}
                icon="🌟"
                color="bg-[var(--coastal-sea)]"
              />
            </div>
          )}
          
          {/* Buscador y filtros */}
          <UserSearchFilter 
            searchParams={searchParams}
            onSearchChange={handleSearchChange}
          />
          
          {/* Lista de usuarios */}
          <UserList 
            users={filteredUsers} 
            onToggleFollow={handleToggleFollow}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default UserDashboardPage; 