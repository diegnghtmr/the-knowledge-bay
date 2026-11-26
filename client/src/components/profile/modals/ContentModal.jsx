import React from 'react';
import PropTypes from 'prop-types';
import ImprovedModalBase from './ImprovedModalBase';
import ListItem from './ListItem';
import AttachmentDownload from '../../content-publication/AttachmentDownload';
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
          content.map(item => item.hasAttachment ? (
            <div key={item.id} className="flex flex-wrap gap-2 justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
              <span className="text-gray-800">{item.title}</span>
              <AttachmentDownload contentId={item.id} fileName={item.fileName} />
            </div>
          ) : (
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
      title: PropTypes.string.isRequired,
      hasAttachment: PropTypes.bool,
      fileName: PropTypes.string
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired
};

export default ContentModal; 