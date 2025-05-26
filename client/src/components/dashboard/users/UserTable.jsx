import React, { useState, useEffect } from 'react';
import { User, Star, Mail, Calendar } from 'lucide-react';
import Table from '../../common/Table';
import TableActions from '../../common/TableActions';
import { getAllUsersAdmin, updateUserAdmin } from '../../../services/adminApi';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllUsersAdmin();
        setUsers(data);
        setFiltered(data);
      } catch (err) {
        setError('Error al cargar los usuarios');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrar usuarios cuando cambian los criterios de búsqueda
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    let result = [...users];
    
    // Filtrar por término de búsqueda
    if (term) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
    
    setFiltered(result);
  }, [searchTerm, users]);

  // Iniciar edición de un usuario
  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({ ...user });
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Confirmar edición
  const confirmEdit = async () => {
    try {
      setIsLoading(true);
      const userToUpdate = { ...form };
      // Interests and Email are not editable, so we remove them from the payload
      delete userToUpdate.interests;
      delete userToUpdate.email; // Ensure email is not sent for update
      // Ensure dateBirth is in YYYY-MM-DD format if it exists
      if (userToUpdate.dateBirth && userToUpdate.dateBirth.includes('T')) {
        userToUpdate.dateBirth = userToUpdate.dateBirth.split('T')[0];
      }
      
      await updateUserAdmin(editingId, userToUpdate);
      const updatedUsers = users.map(user => 
        user.id === editingId ? { ...users.find(u => u.id === editingId), ...form } : user
      );
      setUsers(updatedUsers);
      setFiltered(updatedUsers); // Also update filtered data
      setEditingId(null);
    } catch (err) {
      setError('Error al actualizar el usuario: ' + (err.message || 'Error desconocido'));
      console.error('Error updating user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar usuario
  const removeUser = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // Manejar cambios en el formulario de edición
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Definición de columnas para la tabla
  const columns = [
    { key: 'user', label: 'Usuario' },
    { key: 'email', label: 'Correo' },
    { key: 'birthDate', label: 'Fecha de nacimiento' },
    { key: 'interests', label: 'Intereses' },
    { key: 'actions', label: 'Acciones', className: 'text-center' }
  ];

  // Renderizar celdas según la columna
  const renderCell = (row, column, index) => {
    const { key } = column;
    const isRowEditing = editingId === row.id;

    switch (key) {
      case 'user':
        return isRowEditing ? (
          <div className="space-y-2">
            <input
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="Nombre de usuario"
              className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            />
            <div className="flex gap-2">
              <input
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Nombre"
                className="w-1/2 rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
              />
              <input
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Apellido"
                className="w-1/2 rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-[var(--coastal-sea)]">
              <User size={16} />
            </div>
            <div>
              <div className="font-workSans-medium text-[var(--deep-sea)]">{row.firstName} {row.lastName}</div>
              <div className="text-xs text-[var(--open-sea)]/70">@{row.username}</div>
            </div>
          </div>
        );
      
      case 'email':
        return isRowEditing ? (
          <input
            value={form.email}
            readOnly // Make email field read-only
            disabled // Also disable it to prevent focus/interaction
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 bg-gray-100 cursor-not-allowed focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            title="El correo electrónico no se puede editar aquí."
          />
        ) : (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-[var(--coastal-sea)]" />
            {row.email}
          </div>
        );
      
      case 'birthDate':
        return isRowEditing ? (
          <input
            type="date"
            value={form.dateBirth || form.birthDate}
            onChange={(e) => handleChange('dateBirth', e.target.value)}
            className="rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
          />
        ) : (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[var(--coastal-sea)]" />
            {row.dateBirth || row.birthDate || 'No especificado'}
          </div>
        );
      
      case 'interests':
        return isRowEditing ? (
          <input
            value={Array.isArray(form.interests) ? form.interests.join(', ') : (form.interests || '')}
            readOnly
            disabled
            className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 bg-gray-100 cursor-not-allowed focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            title="Los intereses no se pueden editar aquí."
          />
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.interests.map((interest, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-[var(--sand)]/50 px-2 py-0.5 text-xs font-medium text-[var(--deep-sea)]">
                <Star size={10} className="mr-1 text-[var(--coastal-sea)]" />
                {interest}
              </span>
            ))}
          </div>
        );
      
      case 'actions':
        return (
          <TableActions 
            isEditing={isRowEditing}
            onEdit={() => startEdit(row)}
            onDelete={() => removeUser(row.id)}
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
          placeholder="Buscar por nombre, usuario o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 px-4 rounded-md border border-[var(--coastal-sea)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent"
        />
      </div>
      
      <div className="mb-4 flex justify-end">
        {/* Contador de resultados */}
        <div className="text-sm text-[var(--open-sea)]/70">
          Mostrando {filtered.length} de {users.length} usuarios
        </div>
      </div>
      
      {/* Tabla */}
      <Table
        columns={columns}
        data={filtered}
        renderCell={renderCell}
        isLoading={isLoading}
        emptyState={{
          title: "No se encontraron usuarios",
          message: "Prueba con diferentes términos de búsqueda"
        }}
      />
    </div>
  );
};

export default UserTable; 