import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ImprovedModalBase from './ImprovedModalBase';
import { ClipboardDocumentListIcon, CheckIcon } from '@heroicons/react/24/solid';

const RequestsModal = ({ requests: initialRequests, onClose, onMarkAsCompleted, canManageRequests }) => {
  // Manejar estado local para actualizar UI sin necesidad de refrescar desde el padre
  const [requests, setRequests] = useState(initialRequests);

  const handleViewRequest = (requestId) => {
    // Aquí iría la lógica para navegar a la solicitud
    console.log(`Ver solicitud con ID: ${requestId}`);
    // En implementación real: history.push(`/requests/${requestId}`);
  };

  const handleMarkAsCompleted = (requestId) => {
    // Solo permitir marcar como completado si se tiene permiso
    if (!canManageRequests) return;
    
    // Actualizar estado local inmediatamente para mejor UX
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, isCompleted: true } : req
    ));
    
    // Guardar en localStorage para persistencia local
    const completedRequests = JSON.parse(localStorage.getItem('completedRequests') || '[]');
    if (!completedRequests.includes(requestId)) {
      completedRequests.push(requestId);
      localStorage.setItem('completedRequests', JSON.stringify(completedRequests));
    }
    
    // Notificar al componente padre
    onMarkAsCompleted(requestId);
  };

  return (
    <ImprovedModalBase 
      title="Solicitudes" 
      onClose={onClose} 
      customIcon={ClipboardDocumentListIcon}
    >
      <div className="space-y-2">
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay solicitudes pendientes.</p>
        ) : (
          requests.map(request => (
            <div 
              key={request.id} 
              className={`flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                request.isCompleted ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {canManageRequests && (
                  <button
                    onClick={() => !request.isCompleted && handleMarkAsCompleted(request.id)}
                    disabled={request.isCompleted}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      request.isCompleted
                        ? 'border-green-500 bg-green-500 text-white cursor-default'
                        : 'border-gray-400 hover:border-[var(--coastal-sea)] cursor-pointer'
                    }`}
                    title={request.isCompleted ? "Completada" : "Marcar como completada"}
                  >
                    {request.isCompleted && (
                      <CheckIcon className="h-3 w-3" />
                    )}
                  </button>
                )}
                <span className={`text-gray-800 ${request.isCompleted ? 'line-through' : ''}`}>
                  {request.title}
                </span>
              </div>
              
              <button
                onClick={() => handleViewRequest(request.id)}
                className="px-3 py-1 text-sm text-white bg-[var(--coastal-sea)] rounded hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)] focus:ring-opacity-50"
              >
                Ver
              </button>
            </div>
          ))
        )}
      </div>
    </ImprovedModalBase>
  );
};

RequestsModal.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      isCompleted: PropTypes.bool.isRequired
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onMarkAsCompleted: PropTypes.func.isRequired,
  canManageRequests: PropTypes.bool.isRequired
};

RequestsModal.defaultProps = {
  canManageRequests: false
};

export default RequestsModal; 