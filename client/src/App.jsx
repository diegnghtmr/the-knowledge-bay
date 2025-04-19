import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Removed BrowserRouter as it's in index.jsx
import { useAuth } from "./context/AuthContext"; // Import useAuth

import Login from "./components/Login";
import Register from "./components/Register";
import Landing from "./pages/Landing.jsx";
// Placeholder for authenticated content
const AuthenticatedApp = () => {
  const { userRole, logout } = useAuth();
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Welcome, {userRole}!</h2>
      <button
        onClick={logout}
        style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
      >
        Logout
      </button>
      {/* Add other authenticated routes/components here */}
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          {/* If authenticated, show the main app view */}
          <Route path="/" element={<AuthenticatedApp />} />
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
  );
}

export default App;