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
import StudyGroupPage from "./pages/StudyGroupPage";
import BodyClassManager from "./components/layout/BodyClassManager";

import Terms from "./pages/Terms.jsx";
// Placeholder for authenticated content
const AuthenticatedApp = () => {
  const { userRole, logout } = useAuth();
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Welcome, {userRole}!</h2>
      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={logout}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Logout
        </button>
        <a
          href="/chat"
          className="bg-coastal-sea text-deep-sea px-5 py-2 rounded hover:bg-open-sea transition-colors"
        >
          Ir al Chat
        </a>
        <a
          href="/profile"
          className="bg-coastal-sea text-deep-sea px-5 py-2 rounded hover:bg-open-sea transition-colors"
        >
          Mi Perfil
        </a>
        <a
          href="/user/123"
          className="bg-coastal-sea text-deep-sea px-5 py-2 rounded hover:bg-open-sea transition-colors"
        >
          Perfil de Ejemplo
        </a>
        <a
          href="/users-dashboard"
          className="bg-coastal-sea text-deep-sea px-5 py-2 rounded hover:bg-open-sea transition-colors"
        >
          Gestión de Usuarios
        </a>
        <a
          href="/content-dashboard"
          className="bg-coastal-sea text-deep-sea px-5 py-2 rounded hover:bg-open-sea transition-colors"
        >
          Gestión de Contenidos
        </a>
        <a
          href="/affinity-graph"
          className="bg-coastal-sea text-deep-sea px-5 py-2 rounded hover:bg-open-sea transition-colors"
        >
          Grafo de Afinidad
        </a>
        <a
          href="/help-request"
          className="bg-coastal-sea text-deep-sea px-5 py-2 rounded hover:bg-open-sea transition-colors"
        >
          Solicitud de Ayuda
        </a>
        <a
          href="/study-groups"
          className="bg-coastal-sea text-deep-sea px-5 py-2 rounded hover:bg-open-sea transition-colors"
        >
          Grupos de Estudio
        </a>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Componente que gestiona las clases del body según la ruta */}
      <BodyClassManager />

      <Routes>
        {isAuthenticated ? (
          <>
            {/* If authenticated, show the main app view */}
            <Route path="/" element={<AuthenticatedApp />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/user/:userId" element={<UserProfileViewPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/users-dashboard" element={<UserDashboardPage />} />
            <Route path="/content-dashboard" element={<ContentDashboardPage />} />
            <Route path="/affinity-graph" element={<AffinityGraphPage />} />
            <Route path="/help-request" element={<HelpRequestPage />} />
            <Route path="/study-groups" element={<StudyGroupPage />} />
            {/* Redirect any other path to the main authenticated view */}
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