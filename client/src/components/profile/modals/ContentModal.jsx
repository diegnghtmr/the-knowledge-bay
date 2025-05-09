import React from 'react';
import PropTypes from 'prop-types';
import ImprovedModalBase from './ImprovedModalBase';
import ListItem from './ListItem';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

const ContentModal = ({ content, onClose }) => {
  const handleViewContent = (contentId) => {
    // Aquí iría la lógica para navegar al contenido
    console.log(`Ver publicación con ID: ${contentId}`);
    // En implementación real: history.push(`/content/${contentId}`);
  };

  return (
    <ImprovedModalBase 
      title="Publicaciones" 
      onClose={onClose}
      customIcon={DocumentTextIcon}
    >
      <div className="space-y-1">
        {content.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No has creado contenido aún.</p>
        ) : (
          content.map(item => (
            <ListItem
              key={item.id}
              name={item.title}
              onView={() => handleViewContent(item.id)}
            />
          ))
        )}
      </div>
    </ImprovedModalBase>
  );
};

ContentModal.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired
};

export default ContentModal; 