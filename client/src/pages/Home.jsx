import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../components/layout/NavigationBar";
import { useAuth } from "../context/AuthContext";

const FeatureCard = ({ icon, title, description, linkTo }) => {
  return (
    <Link 
      to={linkTo}
      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="text-3xl mb-3 text-[var(--coastal-sea)]">{icon}</div>
      <h3 className="text-xl font-bold text-[var(--deep-sea)] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
};

const Home = () => {
  const [userName, setUserName] = useState('');
  const { userRole } = useAuth();
  
  useEffect(() => {
    // Intentar obtener el nombre de usuario del almacenamiento de sesión
    try {
      const user = JSON.parse(sessionStorage.getItem('user')) || {};
      if (user.firstName) {
        setUserName(user.firstName);
      }
    } catch (error) {
      console.error("Error al obtener datos de usuario:", error);
    }
  }, []);

  // Definir características para diferentes roles
  const studentFeatures = [
    {
      icon: "👤",
      title: "Gestiona tu Perfil",
      description: "Actualiza tus intereses y detalles académicos para mejorar tus conexiones.",
      linkTo: "/profile"
    },
    {
      icon: "💬",
      title: "Chatea",
      description: "Comunícate en tiempo real con otros miembros de la comunidad.",
      linkTo: "/chat"
    },
    {
      icon: "🆘",
      title: "Solicita Ayuda",
      description: "¿Necesitas apoyo en algún tema? Crea una solicitud y recibe ayuda.",
      linkTo: "/help-request"
    },
    {
      icon: "📝",
      title: "Publicar Contenido",
      description: "Comparte tus conocimientos, artículos o recursos con la comunidad.",
      linkTo: "/publish-content"
    }
  ];

  const moderatorFeatures = [
    {
      icon: "👥",
      title: "Gestión de Usuarios",
      description: "Encuentra estudiantes y académicos con intereses similares para colaborar en proyectos.",
      linkTo: "/users-dashboard"
    },
    {
      icon: "📚",
      title: "Gestión de Contenidos",
      description: "Accede a documentos, tutoriales y recursos compartidos por la comunidad.",
      linkTo: "/content-dashboard"
    },
    {
      icon: "🔗",
      title: "Grafo de Afinidad",
      description: "Descubre cómo se conectan los conocimientos a través del grafo de afinidad.",
      linkTo: "/affinity-graph"
    }
  ];

  // Seleccionar características según el rol del usuario
  console.log("Home - User role for features selection:", userRole);
  
  // Convertir a minúsculas para la comparación
  const roleLowerCase = userRole ? userRole.toLowerCase() : 'student';
  console.log("Home - Role normalized for comparison:", roleLowerCase);
  
  let selectedFeatures;
  if (roleLowerCase === 'moderator') {
    console.log("Home - Using moderator features");
    selectedFeatures = moderatorFeatures;
  } else { // Asumimos 'student' o cualquier otro rol no reconocido como estudiante por defecto
    console.log("Home - Using student features");
    selectedFeatures = studentFeatures;
  }
  
  console.log("Home - Selected features:", selectedFeatures.map(f => f.title));
  
  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <NavigationBar title="Inicio" />
      
      <div className="container mx-auto py-8 px-4">
        {/* Encabezado de bienvenida */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--deep-sea)] mb-3">
            {userName ? `¡Bienvenido de nuevo, ${userName}!` : "¡Bienvenido a The Knowledge Bay!"}
          </h1>
          <p className="text-xl text-[var(--open-sea)] max-w-3xl mx-auto">
            Tu espacio académico para conectar, compartir y descubrir conocimiento.
          </p>
        </div>
        
        {/* Características principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {selectedFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              linkTo={feature.linkTo}
            />
          ))}
        </div>
        
        {/* Acceso rápido al dashboard */}
        <div className="flex justify-center">
          <Link 
            to="/dashboard" 
            className="px-6 py-3 bg-[var(--coastal-sea)] text-white font-medium rounded-lg shadow hover:bg-opacity-90 transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>
        
        {/* Footer informativo */}
        <div className="mt-16 text-center text-[var(--open-sea)] text-sm">
          <p>The Knowledge Bay - Una red social académica.</p>
          <p className="mt-1">
            <Link to="/terms" className="underline">Términos y Condiciones</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;