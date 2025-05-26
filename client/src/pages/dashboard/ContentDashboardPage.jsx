import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ContentFilter from '../../components/dashboard/content/ContentFilter';
import ContentList from '../../components/dashboard/content/ContentList';
import ContentStatsCard from '../../components/dashboard/content/ContentStatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Función simulada para obtener contenido
const fetchContent = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [
          { 
            id: 1, 
            title: 'Introducción a la Inteligencia Artificial', 
            description: 'Una guía completa para principiantes sobre los fundamentos de la IA.',
            type: 'Documento',
            tags: ['IA', 'Tecnología', 'Guía'],
            author: 'María García',
            likes: 45,
            views: 230,
            createdAt: '2023-04-15T10:30:00Z',
            isFavorite: true
          },
          { 
            id: 2, 
            title: 'Análisis de datos con Python', 
            description: 'Aprende a utilizar las principales bibliotecas para análisis de datos.',
            type: 'Tutorial',
            tags: ['Python', 'Análisis de Datos', 'Programación'],
            author: 'Carlos López',
            likes: 32,
            views: 178,
            createdAt: '2023-05-22T14:15:00Z',
            isFavorite: false
          },
          { 
            id: 3, 
            title: 'Historia del arte contemporáneo', 
            description: 'Un recorrido por las principales corrientes artísticas desde el siglo XX.',
            type: 'Presentación',
            tags: ['Arte', 'Historia', 'Cultura'],
            author: 'Sofía Fernández',
            likes: 28,
            views: 143,
            createdAt: '2023-06-10T09:45:00Z',
            isFavorite: true
          },
          { 
            id: 4, 
            title: 'Ecuaciones diferenciales aplicadas', 
            description: 'Resolución de problemas prácticos mediante ecuaciones diferenciales.',
            type: 'Documento',
            tags: ['Matemáticas', 'Física', 'Ingeniería'],
            author: 'David Rodríguez',
            likes: 19,
            views: 95,
            createdAt: '2023-07-05T16:20:00Z',
            isFavorite: false
          },
          { 
            id: 5, 
            title: 'Técnicas de estudio efectivas', 
            description: 'Metodologías probadas para mejorar la retención y comprensión.',
            type: 'Guía',
            tags: ['Educación', 'Productividad', 'Aprendizaje'],
            author: 'Ana Martínez',
            likes: 67,
            views: 312,
            createdAt: '2023-03-18T11:10:00Z',
            isFavorite: false
          }
        ]
      });
    }, 1000);
  });
};

// Función simulada para obtener estadísticas de contenido
const fetchContentStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          totalContent: 257,
          myContent: 12,
          favorites: 24,
          trending: 8
        }
      });
    }, 800);
  });
};

const ContentDashboardPage = () => {
  const location = useLocation();
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({
    searchTerm: '',
    contentType: '',
    tags: [],
    showFavorites: false,
    sortBy: 'recent'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const contentResponse = await fetchContent();
        const statsResponse = await fetchContentStats();
        
        if (contentResponse.success && statsResponse.success) {
          setContent(contentResponse.data);
          setFilteredContent(contentResponse.data);
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

  // Filtrar contenido cuando cambian los parámetros
  useEffect(() => {
    let result = [...content];
    
    // Filtrar por término de búsqueda
    if (filterParams.searchTerm) {
      const term = filterParams.searchTerm.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.author.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por tipo de contenido
    if (filterParams.contentType) {
      result = result.filter(item => item.type === filterParams.contentType);
    }
    
    // Filtrar por etiquetas
    if (filterParams.tags.length > 0) {
      result = result.filter(item => 
        item.tags.some(tag => filterParams.tags.includes(tag))
      );
    }
    
    // Filtrar por favoritos
    if (filterParams.showFavorites) {
      result = result.filter(item => item.isFavorite);
    }
    
    // Ordenar el contenido
    switch (filterParams.sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    setFilteredContent(result);
  }, [filterParams, content]);

  const handleFilterChange = (newParams) => {
    setFilterParams(prev => ({ ...prev, ...newParams }));
  };

  const handleToggleFavorite = (contentId) => {
    setContent(prev => 
      prev.map(item => 
        item.id === contentId 
          ? { ...item, isFavorite: !item.isFavorite } 
          : item
      )
    );
  };

  // Enlaces para la navegación interna
  const navLinks = [
    { label: 'Todo el contenido', to: '/content-dashboard', isActive: location.pathname === '/content-dashboard' },
    { label: 'Mi contenido', to: '/content-dashboard/my-content', isActive: location.pathname === '/content-dashboard/my-content' },
    { label: 'Favoritos', to: '/content-dashboard/favorites', isActive: location.pathname === '/content-dashboard/favorites' },
    { label: 'Tendencias', to: '/content-dashboard/trending', isActive: location.pathname === '/content-dashboard/trending' }
  ];

  return (
    <DashboardLayout 
      title="Gestión de Contenido" 
      description="Explora, organiza y comparte recursos académicos"
      navLinks={navLinks}
    >
      {loading ? (
        <LoadingSpinner message="Cargando contenido..." />
      ) : (
        <>
          {/* Panel de estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <ContentStatsCard 
                title="Total de Contenido" 
                value={stats.totalContent}
                icon="📚"
                color="bg-[var(--coastal-sea)]"
              />
              <ContentStatsCard 
                title="Mi Contenido" 
                value={stats.myContent}
                icon="📝"
                color="bg-[var(--open-sea)]"
              />
              <ContentStatsCard 
                title="Favoritos" 
                value={stats.favorites}
                icon="⭐"
                color="bg-[var(--deep-sea)]"
              />
              <ContentStatsCard 
                title="Tendencia" 
                value={stats.trending}
                icon="🔥"
                color="bg-[var(--coastal-sea)]"
              />
            </div>
          )}
          
          {/* Filtros de contenido */}
          <ContentFilter 
            filterParams={filterParams}
            onFilterChange={handleFilterChange}
          />
          
          {/* Lista de contenido */}
          <ContentList 
            content={filteredContent} 
            onToggleFavorite={handleToggleFavorite}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default ContentDashboardPage; 