import React, { useState, useEffect } from 'react';
import { Calendar, User, ThumbsUp } from 'lucide-react';
import Table from '../common/Table';
import TableActions from '../common/TableActions';
import { getAllContentAdmin, deleteContent } from '../../services/adminApi';

const ContentTable = () => {
  const [contents, setContents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar contenido desde la API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllContentAdmin();
        setContents(data);
        setFiltered(data);
      } catch (err) {
        setError('Error al cargar los contenidos');
        console.error('Error fetching content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Filtrar contenidos cuando cambian los criterios de búsqueda
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let result = [...contents];
    
    // Filtrar por término de búsqueda
    if (term) {
      result = result.filter(content => 
        content.title.toLowerCase().includes(term) ||
        content.information.toLowerCase().includes(term) ||
        content.authorUsername.toLowerCase().includes(term)
      );
    }
    
    setFiltered(result);
  }, [searchTerm, contents]);

  // Iniciar edición de un contenido
  const startEdit = (content) => {
    setEditingId(content.contentId || content.id);
    setForm({ ...content });
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Confirmar edición
  const confirmEdit = () => {
    const updatedContents = contents.map(content => 
      (content.contentId || content.id) === editingId ? { ...form } : content
    );
    setContents(updatedContents);
    setEditingId(null);
  };

  // Eliminar contenido
  const removeContent = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este contenido?')) {
      try {
        await deleteContent(id);
        setContents(contents.filter(content => content.contentId !== id));
      } catch (error) {
        alert('Error al eliminar el contenido');
        console.error('Error deleting content:', error);
      }
    }
  };

  // Manejar cambios en el formulario de edición
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Definición de columnas para la tabla
  const columns = [
    { key: 'title', label: 'Título', className: 'max-w-xs' },
    { key: 'author', label: 'Autor' },
    { key: 'likes', label: 'Likes' },
    { key: 'date', label: 'Fecha' },
    { key: 'actions', label: 'Acciones', className: 'text-center' }
  ];

  // Renderizar celdas según la columna
  const renderCell = (row, column, index) => {
    const { key } = column;
    const isRowEditing = editingId === (row.contentId || row.id);

    switch (key) {
      case 'title':
        return isRowEditing ? (
          <div className="space-y-2">
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            />
            <input
              value={form.information}
              onChange={(e) => handleChange('information', e.target.value)}
              placeholder="Información"
              className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            />
          </div>
        ) : (
          <div>
            <div className="font-workSans-medium text-[var(--deep-sea)]">{row.title}</div>
            <div className="text-xs text-[var(--open-sea)]/70 truncate" title={row.information}>
              {row.information}
            </div>
          </div>
        );
      
      case 'author':
        return isRowEditing ? (
          <input
            value={form.authorUsername}
            onChange={(e) => handleChange('authorUsername', e.target.value)}
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          />
        ) : (
          <div className="flex items-center gap-2">
            <User size={14} className="text-[var(--coastal-sea)]" />
            @{row.authorUsername}
          </div>
        );
      
      case 'likes':
        return isRowEditing ? (
          <input
            type="number"
            min="0"
            value={form.likes}
            onChange={(e) => handleChange('likes', parseInt(e.target.value))}
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          />
        ) : (
          <div className="flex items-center gap-2">
            <ThumbsUp size={14} className="text-[var(--coastal-sea)]" />
            <span>{row.likeCount || row.likes || 0}</span>
          </div>
        );
      
      case 'date':
        return isRowEditing ? (
          <input
            type="date"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          />
        ) : (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Calendar size={14} className="text-[var(--coastal-sea)]" />
            {row.date ? new Date(row.date).toLocaleDateString() : 'Sin fecha'}
          </div>
        );
      
      case 'actions':
        return (
          <TableActions 
            isEditing={isRowEditing}
            onEdit={() => startEdit(row)}
            onDelete={() => removeContent(row.contentId || row.id)}
            onConfirm={confirmEdit}
            onCancel={cancelEdit}
          />
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
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por título, información o autor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 px-4 rounded-md border border-[var(--coastal-sea)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
        />
      </div>
      
      <div className="mb-4 flex justify-end">
        <div className="text-sm text-[var(--open-sea)]/70">
          Mostrando {filtered.length} de {contents.length} contenidos
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