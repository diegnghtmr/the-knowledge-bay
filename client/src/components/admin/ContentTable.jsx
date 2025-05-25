import React, { useState, useEffect } from 'react';
import { FileText, User, Heart, Calendar, Trash2 } from 'lucide-react';
import Table from '../common/Table';
import { getAllContentAdmin, deleteContent } from '../../services/adminApi';

const ContentTable = () => {
  const [content, setContent] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar contenido desde la API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllContentAdmin();
        setContent(data);
        setFiltered(data);
      } catch (err) {
        setError('Error al cargar el contenido');
        console.error('Error fetching content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Filtrar contenido cuando cambian los criterios de búsqueda
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let result = [...content];
    
    if (term) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.authorUsername.toLowerCase().includes(term) ||
        item.contentType.toLowerCase().includes(term)
      );
    }
    
    setFiltered(result);
  }, [searchTerm, content]);

  // Eliminar contenido
  const handleDelete = async (contentId) => {
    if (window.confirm('¿Está seguro que desea eliminar este contenido?')) {
      try {
        await deleteContent(contentId);
        setContent(content.filter(item => item.contentId !== contentId));
      } catch (error) {
        alert('Error al eliminar el contenido');
        console.error('Error deleting content:', error);
      }
    }
  };

  // Definición de columnas para la tabla
  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'author', label: 'Autor' },
    { key: 'type', label: 'Tipo' },
    { key: 'likes', label: 'Likes' },
    { key: 'date', label: 'Fecha' },
    { key: 'actions', label: 'Acciones', className: 'text-center' }
  ];

  // Renderizar celdas según la columna
  const renderCell = (row, column) => {
    const { key } = column;

    switch (key) {
      case 'title':
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-[var(--coastal-sea)]">
              <FileText size={16} />
            </div>
            <div>
              <div className="font-workSans-medium text-[var(--deep-sea)]">{row.title}</div>
              <div className="text-xs text-[var(--open-sea)]/70 max-w-xs truncate">
                {row.information}
              </div>
            </div>
          </div>
        );
      
      case 'author':
        return (
          <div className="flex items-center gap-2">
            <User size={14} className="text-[var(--coastal-sea)]" />
            <span>{row.authorUsername}</span>
          </div>
        );
      
      case 'type':
        return (
          <span className="inline-flex items-center rounded-full bg-[var(--sand)]/50 px-2 py-0.5 text-xs font-medium text-[var(--deep-sea)]">
            {row.contentType}
          </span>
        );
      
      case 'likes':
        return (
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-[var(--coastal-sea)]" />
            <span>{row.likeCount}</span>
          </div>
        );
      
      case 'date':
        return (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[var(--coastal-sea)]" />
            <span>{new Date(row.date).toLocaleDateString()}</span>
          </div>
        );
      
      case 'actions':
        return (
          <button
            onClick={() => handleDelete(row.contentId)}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            title="Eliminar contenido"
          >
            <Trash2 size={16} />
          </button>
        );
      
      default:
        return row[key];
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-[var(--coastal-sea)] text-white rounded-md hover:bg-opacity-90"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-workSans-semibold text-[var(--deep-sea)] mb-4">
          Gestión de Contenidos
        </h2>
        
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por título, autor o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 px-4 rounded-md border border-[var(--coastal-sea)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
        />
      </div>
      
      <div className="mb-4 flex justify-end">
        {/* Contador de resultados */}
        <div className="text-sm text-[var(--open-sea)]/70">
          Mostrando {filtered.length} de {content.length} contenidos
        </div>
      </div>
      
      {/* Tabla */}
      <Table
        columns={columns}
        data={filtered}
        renderCell={renderCell}
        isLoading={isLoading}
        emptyState={{
          title: "No se encontraron contenidos",
          message: "Prueba con diferentes términos de búsqueda"
        }}
      />
    </div>
  );
};

export default ContentTable;