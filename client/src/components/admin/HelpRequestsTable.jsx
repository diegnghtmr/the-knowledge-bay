import React, { useState, useEffect } from 'react';
import { User, Calendar, HelpCircle, CheckCircle, Clock } from 'lucide-react';
import Table from '../common/Table';
import TableActions from '../common/TableActions';
import StatusBadge from '../common/StatusBadge';

// Datos de ejemplo (en un caso real vendrían de una API)
const initialRequests = [
  { id: 1, topics: ["Matemáticas", "Cálculo"], information: "Necesito ayuda con ecuaciones diferenciales", urgency: "Alta", studentUsername: "carlos_lopez", completed: false, requestDate: "2023-11-10" },
  { id: 2, topics: ["Literatura"], information: "Análisis de obras de Gabriel García Márquez", urgency: "Media", studentUsername: "ana_martinez", completed: true, requestDate: "2023-11-05" },
  { id: 3, topics: ["Física", "Termodinámica"], information: "Conceptos de termodinámica", urgency: "Baja", studentUsername: "roberto_sanchez", completed: false, requestDate: "2023-11-12" },
  { id: 4, topics: ["Programación", "Java"], information: "Errores en código Java", urgency: "Alta", studentUsername: "maria_gonzalez", completed: true, requestDate: "2023-11-03" },
  { id: 5, topics: ["Historia", "Revolución Industrial"], information: "Revolución Industrial", urgency: "Media", studentUsername: "juan_perez", completed: false, requestDate: "2023-11-15" }
];

const HelpRequestsTable = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [filtered, setFiltered] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
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

  // Filtrar solicitudes cuando cambian los criterios de búsqueda
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let result = [...requests];
    
    // Filtrar por término de búsqueda
    if (term) {
      result = result.filter(req => 
        req.topics.some(topic => topic.toLowerCase().includes(term)) ||
        req.information.toLowerCase().includes(term) ||
        req.studentUsername.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado (completado/pendiente)
    if (!showCompleted) {
      result = result.filter(req => !req.completed);
    }
    
    setFiltered(result);
  }, [searchTerm, showCompleted, requests]);

  // Iniciar edición de una solicitud
  const startEdit = (req) => {
    setEditingId(req.id);
    setForm({ ...req });
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Confirmar edición
  const confirmEdit = () => {
    const updatedRequests = requests.map(req => 
      req.id === editingId ? { ...form } : req
    );
    setRequests(updatedRequests);
    setEditingId(null);
  };

  // Eliminar solicitud
  const removeRequest = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta solicitud?')) {
      setRequests(requests.filter(req => req.id !== id));
    }
  };

  // Manejar cambios en el formulario de edición
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Obtener badge de urgencia según el valor
  const getUrgencyVariant = (urgency) => {
    switch (urgency) {
      case 'Alta': return 'danger';
      case 'Media': return 'warning';
      case 'Baja': return 'info';
      default: return 'default';
    }
  };

  // Definición de columnas para la tabla
  const columns = [
    { key: 'topics', label: 'Temas' },
    { key: 'information', label: 'Información', className: 'max-w-xs' },
    { key: 'urgency', label: 'Urgencia' },
    { key: 'student', label: 'Estudiante' },
    { key: 'completed', label: 'Estado' },
    { key: 'requestDate', label: 'Fecha' },
    { key: 'actions', label: 'Acciones', className: 'text-center' }
  ];

  // Renderizar celdas según la columna
  const renderCell = (row, column, index) => {
    const { key } = column;
    const isRowEditing = editingId === row.id;

    switch (key) {
      case 'topics':
        return isRowEditing ? (
          <input
            value={Array.isArray(form.topics) ? form.topics.join(', ') : form.topics}
            onChange={(e) => handleChange('topics', e.target.value.split(', '))}
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          />
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.topics.map((topic, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-[var(--sand)]/50 px-2 py-0.5 text-xs font-medium text-[var(--deep-sea)]">
                {topic}
              </span>
            ))}
          </div>
        );
      
      case 'information':
        return isRowEditing ? (
          <input
            value={form.information}
            onChange={(e) => handleChange('information', e.target.value)}
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          />
        ) : (
          <div className="truncate" title={row.information}>
            {row.information}
          </div>
        );
      
      case 'urgency':
        return isRowEditing ? (
          <select
            value={form.urgency}
            onChange={(e) => handleChange('urgency', e.target.value)}
            className="rounded-md border border-[var(--coastal-sea)]/30 bg-white px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          >
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>
        ) : (
          <StatusBadge 
            text={row.urgency} 
            variant={getUrgencyVariant(row.urgency)} 
          />
        );
      
      case 'student':
        return isRowEditing ? (
          <input
            value={form.studentUsername}
            onChange={(e) => handleChange('studentUsername', e.target.value)}
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          />
        ) : (
          <div className="flex items-center gap-2">
            <User size={14} className="text-[var(--coastal-sea)]" />
            @{row.studentUsername}
          </div>
        );
      
      case 'completed':
        return isRowEditing ? (
          <select
            value={form.completed ? "Sí" : "No"}
            onChange={(e) => handleChange('completed', e.target.value === "Sí")}
            className="rounded-md border border-[var(--coastal-sea)]/30 bg-white px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          >
            <option>No</option>
            <option>Sí</option>
          </select>
        ) : (
          <StatusBadge 
            text={row.completed ? "Completado" : "Pendiente"}
            variant={row.completed ? "success" : "warning"}
            icon={row.completed ? <CheckCircle size={12} /> : <Clock size={12} />}
          />
        );
      
      case 'requestDate':
        return isRowEditing ? (
          <input
            type="date"
            value={form.requestDate}
            onChange={(e) => handleChange('requestDate', e.target.value)}
            className="rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          />
        ) : (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Calendar size={14} className="text-[var(--coastal-sea)]" />
            {row.requestDate}
          </div>
        );
      
      case 'actions':
        return (
          <TableActions 
            isEditing={isRowEditing}
            onEdit={() => startEdit(row)}
            onDelete={() => removeRequest(row.id)}
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
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Buscador */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por temas, información o estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 rounded-md border border-[var(--coastal-sea)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
          />
        </div>
        
        {/* Filtro de completados */}
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--coastal-sea)]/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--coastal-sea)]"></div>
            <span className="ms-3 text-sm font-medium text-[var(--deep-sea)]">Mostrar completados</span>
          </label>
        </div>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--sand)]/30 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-[var(--coastal-sea)]">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="text-sm text-[var(--open-sea)]/80">Total solicitudes</p>
            <p className="text-xl font-workSans-semibold text-[var(--deep-sea)]">{requests.length}</p>
          </div>
        </div>
        
        <div className="bg-[var(--sand)]/30 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-green-600">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-sm text-[var(--open-sea)]/80">Completadas</p>
            <p className="text-xl font-workSans-semibold text-[var(--deep-sea)]">
              {requests.filter(r => r.completed).length}
            </p>
          </div>
        </div>
        
        <div className="bg-[var(--sand)]/30 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-yellow-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-sm text-[var(--open-sea)]/80">Pendientes</p>
            <p className="text-xl font-workSans-semibold text-[var(--deep-sea)]">
              {requests.filter(r => !r.completed).length}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabla */}
      <Table
        columns={columns}
        data={filtered}
        renderCell={renderCell}
        isLoading={isLoading}
        emptyState={{
          title: "No se encontraron solicitudes",
          message: "Prueba con diferentes términos de búsqueda o filtros"
        }}
        rowClassName={(row) => row.completed ? 'hover:bg-[var(--sand)]/20 transition-colors bg-green-50/30' : 'hover:bg-[var(--sand)]/20 transition-colors'}
      />
    </div>
  );
};

export default HelpRequestsTable; 