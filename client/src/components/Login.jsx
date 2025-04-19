import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context
  const [formData, setFormData] = useState({
    email: '', // Changed from username to email
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    console.log('Login handleSubmit triggered');
    e.preventDefault();
    setError('');
    setIsLoading(true); // Set loading true

    try {
      // Use the login function from context
      const response = await login(formData);

      if (response.success) {
        // Navigate on successful login (context handles storage)
        // The App component will handle rendering based on isAuthenticated
        // navigate('/dashboard'); // Or navigate('/') - Let App handle redirection logic based on auth state
        // No explicit navigation needed here if App.jsx handles it based on context change
      } else {
        // Set error message from context response
        setError(response.message || 'Error en el inicio de sesión');
      }
    } catch (err) {
      // Catch unexpected errors during the context call itself
      console.error("Login component error:", err);
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false); // Set loading false
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-worksans_bold text-center text-gray-800 mb-8">Iniciar Sesión</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email" // Changed type to email
              id="email"   // Changed id to email
              name="email" // Changed name to email
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;