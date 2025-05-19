import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Removed BrowserRouter as it's in index.jsx
import { useAuth } from "./context/AuthContext"; // Import useAuth

import Landing from "./pages/Landing.jsx";
import ProfilePage from "./pages/profile/ProfilePage";
import UserProfileViewPage from "./pages/profile/UserProfileViewPage";
import ChatPage from "./pages/chat/ChatPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import ContentDashboardPage from "./pages/ContentDashboardPage";
import AffinityGraphPage from "./pages/AffinityGraphPage";
import HelpRequestPage from "./pages/HelpRequestPage";
import PublishContentPage from "./pages/PublishContentPage";
import BodyClassManager from "./components/layout/BodyClassManager";
import Home from "./pages/Home";

import Terms from "./pages/Terms.jsx";

// Componente personalizado para rutas protegidas por rol
const RoleRoute = ({ element, allowedRoles }) => {
  const { userRole, isAuthenticated } = useAuth();
  
  // Convertir roles a minúsculas para la comparación
  const userRoleLowerCase = userRole ? userRole.toLowerCase() : '';
  const allowedRolesLowerCase = allowedRoles.map(role => role.toLowerCase());
  
  // Depuración de rutas protegidas
  console.log("RoleRoute - Checking access:", {
    userRole,
    userRoleLowerCase,
    allowedRoles,
    allowedRolesLowerCase,
    isAllowed: allowedRolesLowerCase.includes(userRoleLowerCase),
    isAuthenticated
  });
  
  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    console.log("RoleRoute - User not authenticated, redirecting to landing");
    return <Navigate to="/landing" replace />;
  }
  
  // Verificar si el rol del usuario está permitido para esta ruta
  if (allowedRolesLowerCase.includes(userRoleLowerCase)) {
    console.log("RoleRoute - Access granted");
    return element;
  } else {
    // Redirigir a la página principal si el usuario no tiene acceso
    console.log("RoleRoute - Access denied, redirecting to home");
    return <Navigate to="/" replace />;
  }
};

function App() {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <>
      {/* Componente que gestiona las clases del body según la ruta */}
      <BodyClassManager />

      <Routes>
        {isAuthenticated ? (
          <>
            {/* Rutas para todos los usuarios autenticados */}
            <Route path="/" element={<Home />} />
            {/* Redireccionar /dashboard a la página principal */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user/:userId" element={<UserProfileViewPage />} />
            <Route path="/chat" element={<ChatPage />} />
            
            {/* Rutas protegidas por rol - Solo Moderador */}
            <Route 
              path="/users-dashboard" 
              element={
                <RoleRoute 
                  element={<UserDashboardPage />} 
                  allowedRoles={['moderator']} 
                />
              } 
            />
            
            {/* Rutas protegidas por rol - Solo Moderador */}
            <Route 
              path="/content-dashboard" 
              element={
                <RoleRoute 
                  element={<ContentDashboardPage />} 
                  allowedRoles={['moderator']} 
                />
              } 
            />
            
            {/* Rutas protegidas por rol - Solo Moderador */}
            <Route 
              path="/affinity-graph" 
              element={
                <RoleRoute 
                  element={<AffinityGraphPage />} 
                  allowedRoles={['moderator']} 
                />
              } 
            />
            
            {/* Rutas para estudiantes y moderadores */}
            <Route path="/help-request" element={<HelpRequestPage />} />
            <Route path="/publish-content" element={<PublishContentPage />} />
            
            {/* Redirigir cualquier otra ruta a la página principal */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* If not authenticated, show public routes */}
            <Route path="/register" element={<Landing />} />
            <Route path="/login" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/terms" element={<Terms />}/>
            {/* Default redirect for root path when not authenticated */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            {/* Redirect any other unknown path to landing */}
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;