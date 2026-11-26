import React, { useState, useEffect } from 'react';
import { Calendar, User, ThumbsUp } from 'lucide-react';
import Table from '../common/Table';
import TableActions from '../common/TableActions';
import { getAllContentAdmin, deleteContent, updateContentAdmin } from '../../services/adminApi';

const contentId = (content) => content.contentId ?? content.id;

const ContentTable = () => {
  const [contents, setContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar contenido desde la API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllContentAdmin();
        setContents(data);
      } catch (err) {
        setError('Error al cargar los contenidos');
        console.error('Error fetching content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const term = searchTerm.toLowerCase();
  const filtered = term ? contents.filter((content) => (
    [content.title, content.information, content.authorUsername]
      .some((value) => typeof value === 'string' && value.toLowerCase().includes(term))
  )) : contents;

  const startEdit = (content) => {
    if (isSaving) return;
    setEditingId(contentId(content));
    setEditError(null);
    setForm({ title: content.title ?? '', information: content.information ?? '' });
  };

  const cancelEdit = () => {
    if (isSaving) return;
    setEditError(null);
    setEditingId(null);
  };

  const confirmEdit = async () => {
    if (isSaving || editingId == null) return;
    setIsSaving(true);
    setEditError(null);
    try {
      await updateContentAdmin(editingId, form);
      setContents((previous) => previous.map((content) => (
        contentId(content) === editingId ? { ...content, ...form } : content
      )));
      setEditingId(null);
    } catch (error) {
      setEditError(error.message || 'Error al actualizar el contenido.');
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar contenido
  const removeContent = async (id) => {
    if (!isSaving && window.confirm('¿Está seguro que desea eliminar este contenido?')) {
      try {
        await deleteContent(id);
        setContents((previous) => previous.filter((content) => contentId(content) !== id));
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
  const renderCell = (row, column) => {
    const { key } = column;
    const isRowEditing = editingId !== null && editingId === contentId(row);

    switch (key) {
      case 'title':
        return isRowEditing ? (
          <div className="space-y-2">
            <input
              value={form.title}
              readOnly={isSaving}
              aria-label="Título"
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            />
            <input
              value={form.information}
              readOnly={isSaving}
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
            value={row.authorUsername ?? ''}
            readOnly
            aria-label="Autor"
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
            value={row.likeCount ?? row.likes ?? 0}
            readOnly
            aria-label="Likes"
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
            value={row.date ?? ''}
            readOnly
            aria-label="Fecha"
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
            onDelete={() => removeContent(contentId(row))}
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
      
      {editError && <div role="alert" className="mb-4 text-red-600"><p>{editError}</p></div>}
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