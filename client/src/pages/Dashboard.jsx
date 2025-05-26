import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/layout/NavigationBar';
import { useAuth } from '../context/AuthContext';

// Componentes para los widgets del dashboard
const DashboardWidget = ({ title, icon, description, linkTo, color }) => {
  return (
    <Link 
      to={linkTo} 
      className={`block p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${color} text-white`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
};

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();

  useEffect(() => {
    // Obtener nombre del usuario desde el almacenamiento local o API
    const storedUser = JSON.parse(sessionStorage.getItem('user')) || {};
    const firstName = storedUser.firstName || '';
    setUserName(firstName);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Definir widgets para diferentes roles
  const moderatorWidgets = [
    {
      title: "Gestión de Usuarios",
      icon: "👥",
      description: "Explora usuarios, establece conexiones y amplía tu red académica",
      linkTo: "/users-dashboard",
      color: "bg-[var(--open-sea)]"
    },
    {
      title: "Contenido",
      icon: "📚",
      description: "Administra tus documentos, recursos académicos y materiales",
      linkTo: "/content-dashboard",
      color: "bg-[var(--deep-sea)]"
    },
    {
      title: "Grafo de Afinidad",
      icon: "🔗",
      description: "Visualiza conexiones entre usuarios y áreas de conocimiento",
      linkTo: "/affinity-graph",
      color: "bg-[var(--coastal-sea)]"
    }
  ];

  const studentWidgets = [
    {
      title: "Mi Perfil",
      icon: "👤",
      description: "Gestiona tu información personal, intereses y conexiones",
      linkTo: "/profile",
      color: "bg-[var(--coastal-sea)]"
    },
    {
      title: "Mensajes",
      icon: "💬",
      description: "Comunícate con otros usuarios y participa en conversaciones académicas",
      linkTo: "/chat",
      color: "bg-[var(--open-sea)]"
    },
    {
      title: "Solicitar Ayuda",
      icon: "🆘",
      description: "Crea una solicitud para recibir apoyo académico de otros usuarios",
      linkTo: "/help-request",
      color: "bg-[var(--deep-sea)]"
    },
    {
      title: "Publicar Contenido",
      icon: "📝",
      description: "Crea y comparte nuevo material académico con la comunidad.",
      linkTo: "/publish-content",
      color: "bg-[var(--coastal-sea)]"
    }
  ];

  // Seleccionar widgets según el rol del usuario
  console.log("Dashboard - User role for widgets selection:", userRole);
  
  // Convertir a minúsculas para la comparación
  const roleLowerCase = userRole ? userRole.toLowerCase() : 'student';
  console.log("Dashboard - Role normalized for comparison:", roleLowerCase);
  
  let selectedWidgets;
  if (roleLowerCase === 'moderator') {
    console.log("Dashboard - Using moderator widgets");
    selectedWidgets = moderatorWidgets;
  } else {
    console.log("Dashboard - Using student widgets");
    selectedWidgets = studentWidgets;
  }
  
  console.log("Dashboard - Selected widgets:", selectedWidgets.map(w => w.title));

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <NavigationBar title="Dashboard" />
      
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--deep-sea)]">
            {userName ? `¡Hola, ${userName}!` : '¡Bienvenido!'}
          </h1>
          <p className="text-[var(--open-sea)] mt-2">
            Tu centro de conocimiento y colaboración
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedWidgets.map((widget, index) => (
            <DashboardWidget 
              key={index}
              title={widget.title} 
              icon={widget.icon} 
              description={widget.description} 
              linkTo={widget.linkTo} 
              color={widget.color}
            />
          ))}
        </div>
        
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--deep-sea)] mb-4">Actividad Reciente</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-[var(--open-sea)] text-center py-4">
              No hay actividad reciente para mostrar.
            </p>
            {/* Aquí se mostrará la actividad reciente cuando se implemente */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 