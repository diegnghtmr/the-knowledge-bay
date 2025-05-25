import React, { useState, useEffect } from 'react';
import { FileText, User, Heart, Calendar, Trash2, Edit3, Check, X as CancelIcon } from 'lucide-react';
import Table from '../common/Table';
import TableActions from '../common/TableActions';
import { getAllContentAdmin, deleteContent, updateContentAdmin } from '../../services/adminApi';

const ContentTable = () => {
  const [content, setContent] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

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
        (item.authorUsername && item.authorUsername.toLowerCase().includes(term)) ||
        item.contentType.toLowerCase().includes(term)
      );
    }
    
    setFiltered(result);
  }, [searchTerm, content]);

  // Manejar cambios en el formulario de edición
  const handleChange = (field, value) => {
    setForm(prevForm => ({ ...prevForm, [field]: value }));
  };

  // Iniciar edición de un contenido
  const startEdit = (item) => {
    setEditingId(item.contentId);
    setForm({ ...item });
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Confirmar edición
  const confirmEdit = async () => {
    try {
      setIsLoading(true);
      const contentToUpdate = { ...form };
      // Topics, author, date, likes are not editable via this table
      delete contentToUpdate.topics;
      delete contentToUpdate.authorUsername; // Ensure authorUsername is not sent
      delete contentToUpdate.authorId;      // Ensure authorId is not sent
      delete contentToUpdate.likeCount;     // Ensure likeCount is not sent
      // Ensure date is in YYYY-MM-DD format if it exists and is a string
      if (contentToUpdate.date && typeof contentToUpdate.date === 'string' && contentToUpdate.date.includes('T')) {
        contentToUpdate.date = contentToUpdate.date.split('T')[0];
      } else if (contentToUpdate.date instanceof Date) {
        contentToUpdate.date = contentToUpdate.date.toISOString().split('T')[0];
      }

      await updateContentAdmin(editingId, contentToUpdate);
      const updatedContentList = content.map(item =>
        item.contentId === editingId ? { ...content.find(c => c.contentId === editingId), ...form } : item
      );
      setContent(updatedContentList);
      setFiltered(updatedContentList);
      setEditingId(null);
    } catch (err) {
      setError('Error al actualizar el contenido: ' + (err.message || 'Error desconocido'));
      console.error('Error updating content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar contenido
  const handleDelete = async (contentId) => {
    if (window.confirm('¿Está seguro que desea eliminar este contenido?')) {
      try {
        await deleteContent(contentId);
        const updatedContent = content.filter(item => item.contentId !== contentId);
        setContent(updatedContent);
        setFiltered(updatedContent); // Also update filtered data
      } catch (error) {
        alert('Error al eliminar el contenido');
        console.error('Error deleting content:', error);
      }
    }
  };

  // Definición de columnas para la tabla
  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'topics', label: 'Temas' },
    { key: 'author', label: 'Autor' },
    { key: 'type', label: 'Tipo' },
    { key: 'likes', label: 'Likes' },
    { key: 'date', label: 'Fecha' },
    { key: 'actions', label: 'Acciones', className: 'text-center' }
  ];

  // Renderizar celdas según la columna
  const renderCell = (row, column) => {
    const { key } = column;
    const isRowEditing = editingId === row.contentId;

    switch (key) {
      case 'title':
        return isRowEditing ? (
          <div className="space-y-1">
            <input
              value={form.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Título del contenido"
              className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            />
            <textarea
              value={form.information || ''}
              onChange={(e) => handleChange('information', e.target.value)}
              placeholder="Información adicional"
              rows={3}
              className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)] text-xs"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-[var(--coastal-sea)]">
              <FileText size={16} />
            </div>
            <div>
              <div className="font-workSans-medium text-[var(--deep-sea)]">{row.title}</div>
              <div className="text-xs text-[var(--open-sea)]/70 max-w-xs truncate" title={row.information}>
                {row.information}
              </div>
            </div>
          </div>
        );
      
      case 'topics':
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {(row.topics || []).map((topic, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-[var(--sand)]/50 px-2 py-0.5 text-xs font-medium text-[var(--deep-sea)]">
                {topic}
              </span>
            ))}
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
        return isRowEditing ? (
          <select
            value={form.contentType || ''}
            onChange={(e) => handleChange('contentType', e.target.value)}
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)] bg-white"
          >
            <option value="ARTICLE">Artículo</option>
            <option value="QUESTION">Pregunta</option>
            <option value="LINK">Enlace</option>
            <option value="VIDEO">Video</option>
            <option value="RESOURCE">Recurso</option>
          </select>
        ) : (
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
            <span>{row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}</span>
          </div>
        );
      
      case 'actions':
        return (
          <TableActions
            isEditing={isRowEditing}
            onEdit={() => startEdit(row)}
            onDelete={() => handleDelete(row.contentId)}
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
          onClick={() => { setError(null); fetchContent(); }}
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