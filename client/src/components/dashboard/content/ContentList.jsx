import React from 'react';
import { Link } from 'react-router-dom';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const ContentCard = ({ content, onToggleFavorite }) => {
  const { id, title, description, type, tags, author, likes, views, createdAt, isFavorite } = content;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="mb-2 flex justify-between items-start">
        <div>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2">
            {type}
          </span>
          <h3 className="text-xl font-medium text-[var(--deep-sea)]">{title}</h3>
        </div>
        <button
          onClick={() => onToggleFavorite(id)}
          className="text-2xl focus:outline-none"
          aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>
      
      <p className="text-gray-600 mb-3 line-clamp-2">{description}</p>
      
      {tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>👤 {author}</span>
          <span>👍 {likes}</span>
          <span>👁️ {views}</span>
        </div>
        <span>{formatDate(createdAt)}</span>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Link 
          to={`/content/${id}`}
          className="text-sm text-[var(--coastal-sea)] hover:underline"
        >
          Ver documento completo
        </Link>
      </div>
    </div>
  );
};

const ContentList = ({ content, onToggleFavorite }) => {
  if (content.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-[var(--open-sea)]">No se encontró contenido que coincida con los criterios de búsqueda.</p>
        <p className="text-sm text-gray-500 mt-2">Intenta con otros filtros o términos de búsqueda.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {content.map(item => (
        <ContentCard 
          key={item.id} 
          content={item} 
          onToggleFavorite={onToggleFavorite} 
        />
      ))}
    </div>
  );
};

export default ContentList; 