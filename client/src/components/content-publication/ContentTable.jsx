import React, { useState, useEffect } from 'react';
import { Calendar, User, ThumbsUp } from 'lucide-react';
import Table from '../common/Table';
import TableActions from '../common/TableActions';

// Datos de ejemplo (en un caso real vendrían de una API)
const initialContents = [
  { id: 1, title: "Matemáticas Avanzadas", information: "Material de estudio para cálculo multivariable y ecuaciones diferenciales", authorUsername: "juan_perez", date: "2023-11-20", likes: 28 },
  { id: 2, title: "Álgebra Lineal", information: "Guía completa de álgebra lineal con ejemplos prácticos", authorUsername: "ana_lopez", date: "2023-10-15", likes: 19 },
  { id: 3, title: "Programación en Python", information: "Introducción a la programación con Python para principiantes", authorUsername: "carlos_gomez", date: "2023-09-05", likes: 52 },
  { id: 4, title: "Comprensión Lectora", information: "Técnicas para mejorar la comprensión de textos académicos", authorUsername: "maria_rodriguez", date: "2023-11-10", likes: 15 },
  { id: 5, title: "Química Orgánica", information: "Fundamentos de química orgánica y reacciones químicas", authorUsername: "roberto_sanchez", date: "2023-08-20", likes: 38 }
];

const ContentTable = () => {
  const [contents, setContents] = useState(initialContents);
  const [filtered, setFiltered] = useState(initialContents);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Simulación de carga inicial
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
    setEditingId(content.id);
    setForm({ ...content });
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Confirmar edición
  const confirmEdit = () => {
    const updatedContents = contents.map(content => 
      content.id === editingId ? { ...form } : content
    );
    setContents(updatedContents);
    setEditingId(null);
  };

  // Eliminar contenido
  const removeContent = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este contenido?')) {
      setContents(contents.filter(content => content.id !== id));
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
    const isRowEditing = editingId === row.id;

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
            <span>{row.likes}</span>
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
            {row.date}
          </div>
        );
      
      case 'actions':
        return (
          <TableActions 
            isEditing={isRowEditing}
            onEdit={() => startEdit(row)}
            onDelete={() => removeContent(row.id)}
            onConfirm={confirmEdit}
            onCancel={cancelEdit}
          />
        );
      
      default:
        return row[key];
    }
  };
  
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