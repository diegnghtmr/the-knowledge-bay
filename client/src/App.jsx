import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Landing from "./pages/Landing.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
