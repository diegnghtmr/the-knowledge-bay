import React, { useState, useEffect } from 'react';
import { User, Calendar, HelpCircle, CheckCircle, Clock, Trash2, AlertTriangle, Edit3, Check, X as CancelIcon } from 'lucide-react';
import Table from '../common/Table';
import TableActions from '../common/TableActions';
import StatusBadge from '../common/StatusBadge';
import { getAllHelpRequestsAdmin, deleteHelpRequest, updateHelpRequestAdmin } from '../../services/adminApi';

const HelpRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllHelpRequestsAdmin();
      setRequests(data);
      setFiltered(data);
    } catch (err) {
      setError('Error al cargar las solicitudes de ayuda');
      console.error('Error fetching help requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let result = [...requests];
    
    if (term) {
      result = result.filter(req => 
        (req.topics && req.topics.some(topic => topic.toLowerCase().includes(term))) ||
        (req.information && req.information.toLowerCase().includes(term)) ||
        (req.studentUsername && req.studentUsername.toLowerCase().includes(term))
      );
    }
    
    if (!showCompleted) {
      result = result.filter(req => !req.isCompleted);
    }
    
    setFiltered(result);
  }, [searchTerm, showCompleted, requests]);

  const startEdit = (req) => {
    setEditingId(req.requestId);
    setForm({ 
      ...req,
      urgency: req.urgency ? req.urgency.toUpperCase() : '' 
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const confirmEdit = async () => {
    try {
      setIsLoading(true);
      const requestToUpdate = { ...form };
      delete requestToUpdate.topics;
      delete requestToUpdate.studentUsername;
      delete requestToUpdate.studentId;
      delete requestToUpdate.requestDate;
      if (requestToUpdate.requestDate && typeof requestToUpdate.requestDate === 'string' && requestToUpdate.requestDate.includes('T')) {
        requestToUpdate.requestDate = requestToUpdate.requestDate.split('T')[0];
      } else if (requestToUpdate.requestDate instanceof Date) {
        requestToUpdate.requestDate = requestToUpdate.requestDate.toISOString().split('T')[0];
      }

      await updateHelpRequestAdmin(editingId, requestToUpdate);
      const updatedRequests = requests.map(req =>
        req.requestId === editingId ? { ...requests.find(r => r.requestId === editingId), ...form } : req
      );
      setRequests(updatedRequests);
      setEditingId(null);
    } catch (err) {
      setError('Error al actualizar la solicitud: ' + (err.message || 'Error desconocido'));
      console.error('Error updating help request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeRequest = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta solicitud?')) {
      try {
        await deleteHelpRequest(id);
        setRequests(prevRequests => prevRequests.filter(req => req.requestId !== id));
      } catch (err) {
        alert('Error al eliminar la solicitud de ayuda');
        console.error('Error deleting help request:', err);
      }
    }
  };

  const handleChange = (field, value) => {
    setForm(prevForm => ({ ...prevForm, [field]: value }));
  };

  const getUrgencyVariant = (urgency) => {
    if (!urgency) return 'default';
    switch (urgency.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const columns = [
    { key: 'topics', label: 'Temas' },
    { key: 'information', label: 'Información', className: 'max-w-xs' },
    { key: 'urgency', label: 'Urgencia' },
    { key: 'student', label: 'Estudiante' },
    { key: 'isCompleted', label: 'Estado' },
    { key: 'requestDate', label: 'Fecha' },
    { key: 'actions', label: 'Acciones', className: 'text-center' }
  ];

  const renderCell = (row, column) => {
    const { key } = column;
    const isRowEditing = editingId === row.requestId;

    switch (key) {
      case 'topics':
        return (
          <div className="flex flex-wrap gap-1">
            {(row.topics || []).map((topic, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-[var(--sand)]/50 px-2 py-0.5 text-xs font-medium text-[var(--deep-sea)]">
                {topic}
              </span>
            ))}
          </div>
        );
      
      case 'information':
        return isRowEditing ? (
          <textarea
            value={form.information || ''}
            onChange={(e) => handleChange('information', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)] text-xs"
          />
        ) : (
          <div className="whitespace-normal break-words" title={row.information}>
            {row.information}
          </div>
        );
      
      case 'urgency':
        return isRowEditing ? (
          <select
            value={form.urgency || ''}
            onChange={(e) => handleChange('urgency', e.target.value)}
            className="rounded-md border border-[var(--coastal-sea)]/30 bg-white px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          >
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>
        ) : (
          <StatusBadge 
            text={row.urgency} 
            variant={getUrgencyVariant(row.urgency)} 
          />
        );
      
      case 'student':
        return (
          <div className="flex items-center gap-2">
            <User size={14} className="text-[var(--coastal-sea)]" />
            @{row.studentUsername}
          </div>
        );
      
      case 'isCompleted':
        return isRowEditing ? (
          <select
            value={form.isCompleted ? 'true' : 'false'}
            onChange={(e) => handleChange('isCompleted', e.target.value === 'true')}
            className="rounded-md border border-[var(--coastal-sea)]/30 bg-white px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          >
            <option value="false">Pendiente</option>
            <option value="true">Completado</option>
          </select>
        ) : (
          <StatusBadge 
            text={row.isCompleted ? "Completado" : "Pendiente"}
            variant={row.isCompleted ? "success" : "warning"}
            icon={row.isCompleted ? <CheckCircle size={12} /> : <Clock size={12} />}
          />
        );
      
      case 'requestDate':
        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Calendar size={14} className="text-[var(--coastal-sea)]" />
            {row.requestDate ? new Date(row.requestDate).toLocaleDateString() : 'N/A'}
          </div>
        );
      
      case 'actions':
        return (
          <TableActions 
            isEditing={isRowEditing}
            onEdit={() => startEdit(row)}
            onDelete={() => removeRequest(row.requestId)}
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
          onClick={() => { setError(null); fetchRequests(); }}
          className="px-4 py-2 bg-[var(--coastal-sea)] text-white rounded-md hover:bg-opacity-90"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow border border-[var(--coastal-sea)]/10">
        <input
          type="text"
          placeholder="Buscar por tema, info o estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto flex-grow rounded-md border border-[var(--coastal-sea)]/30 px-3 py-2 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
        />
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="showCompletedToggle"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[var(--coastal-sea)] focus:ring-[var(--coastal-sea)]"
          />
          <label htmlFor="showCompletedToggle" className="text-sm text-[var(--deep-sea)]">
            Mostrar completadas
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border border-[var(--coastal-sea)]/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-[var(--coastal-sea)]">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="text-sm text-[var(--open-sea)]/80">Total solicitudes</p>
            <p className="text-xl font-workSans-semibold text-[var(--deep-sea)]">{requests.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow border border-[var(--coastal-sea)]/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-sm text-[var(--open-sea)]/80">Completadas</p>
            <p className="text-xl font-workSans-semibold text-[var(--deep-sea)]">
              {requests.filter(r => r.isCompleted).length}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow border border-[var(--coastal-sea)]/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-sm text-[var(--open-sea)]/80">Pendientes</p>
            <p className="text-xl font-workSans-semibold text-[var(--deep-sea)]">
              {requests.filter(r => !r.isCompleted).length}
            </p>
          </div>
        </div>
      </div>
      
      <Table
        columns={columns}
        data={filtered}
        renderCell={renderCell}
        isLoading={isLoading}
        emptyState={{
          title: "No se encontraron solicitudes",
          message: "Prueba con diferentes términos de búsqueda o filtros"
        }}
        rowClassName={(row) => row.isCompleted ? 'hover:bg-green-50/50 bg-green-50/30' : 'hover:bg-[var(--sand)]/20'}
      />
    </div>
  );
};

export default HelpRequestsTable; 