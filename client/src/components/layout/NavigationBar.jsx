import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, Users, BookOpen, Network, HelpCircle, UserPlus, ChevronRight, ChevronLeft, User, MessageCircle, FileText, BarChart2, Tag, Headphones, PieChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente de navegación reutilizable que muestra la página actual
 * y enlaces a todas las secciones de la aplicación
 */
const NavigationBar = ({ title }) => {
  const location = useLocation();
  const { logout, userRole } = useAuth();
  const navRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Debugging mejorado para seguimiento de roles
  console.log("NavigationBar - Current user role:", userRole);
  console.log("NavigationBar - Role type:", typeof userRole);
  console.log("NavigationBar - Role from sessionStorage:", sessionStorage.getItem('role'));
  
  // Definir elementos específicos para cada rol
  const studentItems = [
    { 
      path: '/profile', 
      label: 'Mi Perfil', 
      icon: <User size={18} />,
    },
    { 
      path: '/chat', 
      label: 'Chat', 
      icon: <MessageCircle size={18} />,
    },
    { 
      path: '/help-request', 
      label: 'Solicitud de Ayuda', 
      icon: <HelpCircle size={18} />,
    },
    { 
      path: '/publish-content',
      label: 'Publicar Contenido',
      icon: <FileText size={18} />,
    },
  ];
  
  const moderatorItems = [
    { 
      path: '/users-dashboard', 
      label: 'Gestión de Usuarios', 
      icon: <Users size={18} />,
    },
    { 
      path: '/content-dashboard', 
      label: 'Gestión de Contenidos', 
      icon: <BookOpen size={18} />,
    },
    { 
      path: '/affinity-graph', 
      label: 'Grafo de Afinidad', 
      icon: <Network size={18} />,
    },
    { 
      path: '/admin/analytics', 
      label: 'Panel Analítico', 
      icon: <BarChart2 size={18} />,
    },
    { 
      path: '/admin/interests', 
      label: 'Gestión de Intereses', 
      icon: <Tag size={18} />,
    },
    { 
      path: '/admin/help-requests', 
      label: 'Solicitudes de Ayuda', 
      icon: <Headphones size={18} />,
    },
    { 
      path: '/admin/stats', 
      label: 'Estadísticas', 
      icon: <PieChart size={18} />,
    },
  ];
  
  // Seleccionar los elementos según el rol
  const role = userRole || 'student';
  let navItems = [];
  
  // Convertir a minúsculas para la comparación
  const roleLowerCase = role.toLowerCase();
  console.log("NavigationBar - Role normalized for comparison:", roleLowerCase);
  
  if (roleLowerCase === 'student') {
    navItems = studentItems;
    console.log("NavigationBar - Using student items");
  } else if (roleLowerCase === 'moderator') {
    navItems = moderatorItems;
    console.log("NavigationBar - Using moderator items");
  } else {
    // Fallback a elementos de estudiante para cualquier otro rol
    navItems = studentItems;
    console.log("NavigationBar - Using fallback student items for unknown role:", role);
  }
  
  console.log("NavigationBar - Selected items:", navItems.map(item => item.label));

  // No es necesario filtrar más, ya que hemos seleccionado el conjunto correcto de elementos
  const filteredNavItems = navItems;
  
  // Detectar scroll horizontal para mostrar/ocultar indicadores de fade
  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setShowLeftFade(scrollLeft > 10);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('scroll', handleScroll);
      // Verificar inicialmente
      handleScroll();
      
      return () => {
        navElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Manejar el scroll con la rueda del ratón
  const handleWheel = (e) => {
    if (!navRef.current) return;
    
    // Prevenir el comportamiento predeterminado (scroll vertical)
    e.preventDefault();
    
    // Usar deltaY para desplazar horizontalmente
    navRef.current.scrollLeft += e.deltaY;
  };
  
  // Agregar el evento de rueda del ratón
  useEffect(() => {
    const navElement = navRef.current;
    if (navElement) {
      // Evento estándar de rueda para la mayoría de navegadores
      navElement.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        navElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);
  
  // Funciones para drag-to-scroll
  const handleMouseDown = (e) => {
    if (!navRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - navRef.current.offsetLeft);
    setScrollLeft(navRef.current.scrollLeft);
    
    // Cambiar el cursor mientras se arrastra
    document.body.style.cursor = 'grabbing';
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    // Restaurar el cursor
    document.body.style.cursor = 'default';
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || !navRef.current) return;
    
    // Prevenir selección de texto mientras se arrastra
    e.preventDefault();
    
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplicador para ajustar la velocidad
    navRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Añadir/eliminar eventos globales para mouse up/move
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      // Asegurarse de restaurar el cursor si se desmonta el componente
      document.body.style.cursor = 'default';
    };
  }, [isDragging]);
  
  const scrollNav = (direction) => {
    if (!navRef.current) return;
    
    const scrollAmount = 200; // px a desplazar
    const currentScroll = navRef.current.scrollLeft;
    navRef.current.scrollTo({
      left: direction === 'right' 
        ? currentScroll + scrollAmount 
        : currentScroll - scrollAmount,
      behavior: 'smooth'
    });
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // El redireccionamiento debería manejarse por el Context
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="bg-[var(--open-sea)] text-white p-4 shadow-md overflow-hidden">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="font-righteous text-xl mb-3 md:mb-0 whitespace-nowrap overflow-hidden text-ellipsis pr-4">
          The Knowledge Bay - {title || 'Panel Principal'}
        </h1>
        
        <div className="relative flex-1 md:max-w-3xl">
          {/* Botón de desplazamiento izquierdo */}
          <div 
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full transition-all duration-300 ease-in-out ${
              showLeftFade ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
            }`}
          >
            <button 
              onClick={() => scrollNav('left')}
              className="h-full bg-[var(--open-sea)]/90 flex items-center px-1 shadow-md rounded-r-md transition-transform duration-200 hover:scale-110"
            >
              <ChevronLeft size={20} className="text-white animate-pulse" />
            </button>
          </div>
          
          {/* Fade izquierdo */}
          <div 
            className={`absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-[var(--open-sea)] to-transparent z-[1] pointer-events-none transition-opacity duration-500 ease-in-out ${
              showLeftFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Contenedor principal con scroll */}
          <nav 
            ref={navRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 no-scrollbar select-none"
            style={{ 
              msOverflowStyle: 'none', /* IE y Edge */
              scrollbarWidth: 'none', /* Firefox */
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
          >
            {filteredNavItems.map((item, index) => (
              <Link 
                key={item.path}
                to={item.path}
                style={{ 
                  transitionDelay: `${index * 50}ms`,
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                  location.pathname === item.path 
                    ? 'bg-white text-[var(--open-sea)] font-workSans-bold shadow-md' 
                    : 'bg-[var(--coastal-sea)] text-white hover:bg-opacity-90'
                }`}
                // Evitar que se active el link mientras se está arrastrando
                onClick={(e) => isDragging && e.preventDefault()}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            
            <Link 
              to="/"
              style={{ 
                transitionDelay: `${filteredNavItems.length * 50}ms`,
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                location.pathname === '/' 
                  ? 'bg-white text-[var(--open-sea)] font-workSans-bold shadow-md' 
                  : 'bg-[var(--coastal-sea)] text-white hover:bg-opacity-90'
              }`}
              onClick={(e) => isDragging && e.preventDefault()}
            >
              <Home size={18} />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            
            <button
              style={{ 
                transitionDelay: `${(filteredNavItems.length + 1) * 50}ms`,
              }}
              onClick={(e) => {
                if (isDragging) {
                  e.preventDefault();
                  return;
                }
                handleLogout();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-all duration-300 whitespace-nowrap flex-shrink-0 transform hover:scale-105"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </nav>
          
          {/* Fade derecho */}
          <div 
            className={`absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[var(--open-sea)] to-transparent z-[1] pointer-events-none transition-opacity duration-500 ease-in-out ${
              showRightFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Botón de desplazamiento derecho */}
          <div 
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full transition-all duration-300 ease-in-out ${
              showRightFade ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
            }`}
          >
            <button 
              onClick={() => scrollNav('right')}
              className="h-full bg-[var(--open-sea)]/90 flex items-center px-1 shadow-md rounded-l-md transition-transform duration-200 hover:scale-110"
            >
              <ChevronRight size={20} className="text-white animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationBar; 