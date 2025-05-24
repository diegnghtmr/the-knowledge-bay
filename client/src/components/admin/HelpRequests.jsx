import React, { useState, useMemo } from "react";
import { Pencil, Trash2, Check, X, Search, Filter, HelpCircle, Calendar, AlertTriangle, CheckCircle, Clock, User } from "lucide-react";

/**
 * Componente para administrar solicitudes de ayuda
 */
export default function HelpRequests() {
  // ────────────────────────────────────────────────────────────────
  // Mock data
  // ────────────────────────────────────────────────────────────────
  const [requests, setRequests] = useState([
    {
      id: 1,
      topic: "Álgebra Lineal",
      information: "Necesita repaso de matrices",
      urgency: "Alta",
      student: "Juan Pérez",
      completed: false,
      requestDate: "2025-09-10",
    },
    {
      id: 2,
      topic: "IA",
      information: "No entiende redes neuronales",
      urgency: "Media",
      student: "Luisa Gómez",
      completed: false,
      requestDate: "2025-09-11",
    },
  ]);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [filter, setFilter] = useState("all");

  // ────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    let results = requests.filter(
      (r) =>
        r.topic.toLowerCase().includes(term) ||
        r.student.toLowerCase().includes(term) ||
        r.information.toLowerCase().includes(term)
    );
    
    // Aplicar filtro de estado
    if (filter === "completed") {
      results = results.filter(r => r.completed);
    } else if (filter === "pending") {
      results = results.filter(r => !r.completed);
    }
    
    return results;
  }, [search, requests, filter]);

  const startEdit = (req) => {
    setEditingId(req.id);
    setForm({ ...req });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const confirmEdit = () => {
    setRequests((prev) =>
      prev.map((r) => (r.id === editingId ? { ...form } : r))
    );
    cancelEdit();
  };

  const removeRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  // Update form values
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Obtener el badge de urgencia con el color adecuado
  const getUrgencyBadge = (urgency) => {
    const classes = {
      Alta: "bg-red-100 text-red-800 border-red-200",
      Media: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Baja: "bg-green-100 text-green-800 border-green-200",
    };
    const icons = {
      Alta: <AlertTriangle size={12} className="mr-1" />,
      Media: <Clock size={12} className="mr-1" />,
      Baja: <CheckCircle size={12} className="mr-1" />,
    };
    
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${classes[urgency]}`}>
        {icons[urgency]}
        {urgency}
      </span>
    );
  };

  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-custom p-8 font-workSans">
      <div className="mb-6">
        <h1 className="text-2xl font-righteous text-[var(--deep-sea)]">Solicitudes de Ayuda</h1>
        <p className="text-sm text-[var(--open-sea)]/80 mt-1">
          Gestiona las solicitudes de ayuda de los estudiantes
        </p>
      </div>
      
      <div className="rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-6 shadow-sm">
        {/* Barra de filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-[var(--open-sea)]/60" />
            </div>
            <input
              type="text"
              placeholder="Buscar por tema, estudiante o información..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--coastal-sea)]/30 bg-white text-sm placeholder-[var(--open-sea)]/50 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-[var(--open-sea)]/60" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-3 py-2 rounded-md border border-[var(--coastal-sea)]/30 bg-white text-sm focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
              >
                <option value="all">Todos</option>
                <option value="completed">Completados</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
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
            <div className="w-10 h-10 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-[var(--coastal-sea)]">
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
            <div className="w-10 h-10 rounded-full bg-[var(--coastal-sea)]/10 flex items-center justify-center text-[var(--coastal-sea)]">
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

        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--coastal-sea)]/10 text-[var(--coastal-sea)] mb-4">
              <HelpCircle size={32} />
            </div>
            <h3 className="text-lg font-workSans-semibold text-[var(--deep-sea)]">No se encontraron solicitudes</h3>
            <p className="text-sm text-[var(--open-sea)]/80 mt-1">Prueba con diferentes términos de búsqueda o filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--coastal-sea)]/10">
            <table className="min-w-full divide-y divide-[var(--coastal-sea)]/10 text-sm">
              <thead className="bg-[var(--sand)]/30">
                <tr>
                  {[
                    "ID",
                    "Tema",
                    "Información",
                    "Urgencia",
                    "Estudiante",
                    "Estado",
                    "Fecha",
                    "Acciones",
                  ].map((col) => (
                    <th key={col} className="whitespace-nowrap px-4 py-3 text-left font-workSans-semibold text-[var(--open-sea)]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--coastal-sea)]/10 bg-white">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--sand)]/20 transition-colors">
                    {/* Id */}
                    <td className="px-4 py-3 text-[var(--deep-sea)] font-workSans-medium">#{req.id}</td>

                    {/* Topic */}
                    <td className="px-4 py-3 text-[var(--deep-sea)]">
                      {editingId === req.id ? (
                        <input
                          value={form.topic}
                          onChange={(e) => handleChange("topic", e.target.value)}
                          className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[var(--coastal-sea)]"></span>
                          {req.topic}
                        </div>
                      )}
                    </td>

                    {/* Information */}
                    <td className="px-4 py-3 text-[var(--deep-sea)] max-w-[18rem]">
                      {editingId === req.id ? (
                        <input
                          value={form.information}
                          onChange={(e) => handleChange("information", e.target.value)}
                          className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
                        />
                      ) : (
                        <div className="truncate" title={req.information}>
                          {req.information}
                        </div>
                      )}
                    </td>

                    {/* Urgency */}
                    <td className="px-4 py-3 text-[var(--deep-sea)]">
                      {editingId === req.id ? (
                        <select
                          value={form.urgency}
                          onChange={(e) => handleChange("urgency", e.target.value)}
                          className="rounded-md border border-[var(--coastal-sea)]/30 bg-white px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
                        >
                          <option>Alta</option>
                          <option>Media</option>
                          <option>Baja</option>
                        </select>
                      ) : (
                        getUrgencyBadge(req.urgency)
                      )}
                    </td>

                    {/* Student */}
                    <td className="px-4 py-3 text-[var(--deep-sea)]">
                      {editingId === req.id ? (
                        <input
                          value={form.student}
                          onChange={(e) => handleChange("student", e.target.value)}
                          className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[var(--coastal-sea)]" />
                          {req.student}
                        </div>
                      )}
                    </td>

                    {/* Completed */}
                    <td className="px-4 py-3 text-[var(--deep-sea)]">
                      {editingId === req.id ? (
                        <select
                          value={form.completed ? "Sí" : "No"}
                          onChange={(e) => handleChange("completed", e.target.value === "Sí")}
                          className="rounded-md border border-[var(--coastal-sea)]/30 bg-white px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
                        >
                          <option>No</option>
                          <option>Sí</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          req.completed
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}>
                          {req.completed ? "Completado" : "Pendiente"}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-[var(--deep-sea)] whitespace-nowrap">
                      {editingId === req.id ? (
                        <input
                          type="date"
                          value={form.requestDate}
                          onChange={(e) => handleChange("requestDate", e.target.value)}
                          className="rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[var(--coastal-sea)]" />
                          {req.requestDate}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 flex items-center gap-3 text-[var(--deep-sea)]">
                      {editingId === req.id ? (
                        <>
                          <button
                            onClick={confirmEdit}
                            className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none"
                            title="Guardar"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
                            title="Cancelar"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(req)}
                            className="p-1.5 rounded-full bg-[var(--sand)]/50 text-[var(--coastal-sea)] hover:bg-[var(--sand)] transition-colors focus:outline-none"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => removeRequest(req.id)}
                            className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors focus:outline-none"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Paginación (estática para el ejemplo) */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-[var(--open-sea)]/70">
            Mostrando {filtered.length} de {requests.length} solicitudes
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md border border-[var(--coastal-sea)]/30 bg-[var(--sand)]/30 text-[var(--deep-sea)]">
              1
            </button>
            <button className="px-3 py-1 rounded-md text-[var(--deep-sea)] hover:bg-[var(--sand)]/30">
              2
            </button>
            <button className="px-3 py-1 rounded-md text-[var(--deep-sea)] hover:bg-[var(--sand)]/30">
              3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 