import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Removed BrowserRouter as it's in index.jsx
import { useAuth } from "./context/AuthContext"; // Import useAuth

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Landing from "./pages/landing/Landing.jsx";
import ProfilePage from "./pages/profile/ProfilePage";
import ChatPage from "./pages/chat/ChatPage";
import BodyClassManager from "./components/layout/BodyClassManager";

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
            <Route path="/chat" element={<ChatPage />} />
            {/* Redirect any other path to the main authenticated view */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* If not authenticated, show public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/landing" element={<Landing />} />
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