import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que gestiona las clases del body según la ruta actual
 * Agrega la clase body-overflow-hidden en rutas específicas como landing, login y register
 * Y restaura a body-overflow-auto en otras rutas como chat o profile
 */
const BodyClassManager = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Rutas que deberían tener overflow: hidden
    const noScrollRoutes = ['/landing', '/login', '/register'];
    
    // Verificar si la ruta actual está en la lista de rutas sin scroll
    const shouldHideOverflow = noScrollRoutes.includes(location.pathname);
    
    // Limpiar ambas clases primero
    document.body.classList.remove('body-overflow-hidden', 'body-overflow-auto');
    
    // Aplicar la clase adecuada
    if (shouldHideOverflow) {
      document.body.classList.add('body-overflow-hidden');
    } else {
      document.body.classList.add('body-overflow-auto');
    }
    
    // Limpieza al desmontar
    return () => {
      document.body.classList.remove('body-overflow-hidden', 'body-overflow-auto');
    };
  }, [location.pathname]);
  
  // Este componente no renderiza nada
  return null;
};

export default BodyClassManager;