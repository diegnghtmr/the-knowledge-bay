import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { 
  getAllInterests, 
  createInterest, 
  updateInterest, 
  deleteInterest, 
  loadSampleInterests 
} from "../../services/adminApi";

/**
 * Componente para administrar los intereses disponibles en la plataforma
 */
export default function InterestManagement() {
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar intereses al montar el componente
  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);
      const data = await getAllInterests();
      setInterests(data);
      setError("");
    } catch (error) {
      setError("Error al cargar los intereses");
      console.error("Error loading interests:", error);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // CRUD helpers
  // ────────────────────────────────────────────────────────────────
  const addInterest = async () => {
    if (!newInterest.trim()) return;
    
    try {
      setLoading(true);
      await createInterest({ name: newInterest.trim() });
      setNewInterest("");
      await loadInterests(); // Recargar la lista
      setError("");
    } catch (error) {
      setError("Error al crear el interés");
      console.error("Error creating interest:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditingValue(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const confirmEdit = async () => {
    if (!editingValue.trim()) return;
    
    try {
      setLoading(true);
      await updateInterest(editingId, { name: editingValue.trim() });
      await loadInterests(); // Recargar la lista
      cancelEdit();
      setError("");
    } catch (error) {
      setError("Error al actualizar el interés");
      console.error("Error updating interest:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeInterest = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este interés?")) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteInterest(id);
      await loadInterests(); // Recargar la lista
      setError("");
    } catch (error) {
      setError("Error al eliminar el interés");
      console.error("Error deleting interest:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadData = async () => {
    try {
      setLoading(true);
      await loadSampleInterests();
      await loadInterests(); // Recargar la lista
      setError("");
    } catch (error) {
      setError("Error al cargar los datos de muestra");
      console.error("Error loading sample data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-custom p-8 font-workSans">
      <h1 className="mb-2 text-2xl font-righteous text-[var(--deep-sea)]">Interest Management</h1>
      <p className="mb-6 text-sm text-[var(--open-sea)]/80">
        Manage the interests available on the platform
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 p-3">
          <p className="text-sm text-blue-600">Cargando...</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form + Table */}
        <div className="rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-6 shadow-sm">
          {/* Add form */}
          <div className="mb-5 flex gap-3">
            <input
              type="text"
              placeholder="Ej. IA"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="flex-1 rounded-md border border-[var(--coastal-sea)]/30 bg-white px-3 py-2 text-sm placeholder-[var(--open-sea)]/50 focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
            />
            <button
              onClick={addInterest}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--coastal-sea)] px-4 py-2 text-sm font-workSans-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2 pr-4 font-workSans-medium text-[var(--open-sea)]">Id</th>
                  <th className="py-2 pr-4 font-workSans-medium text-[var(--open-sea)]">Name</th>
                  <th className="py-2 font-workSans-medium text-[var(--open-sea)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interests.map((int) => (
                  <tr key={int.idInterest || int.id} className="border-t border-[var(--coastal-sea)]/10 hover:bg-[var(--sand)]/30">
                    <td className="py-2 pr-4 text-[var(--deep-sea)]">{int.idInterest || int.id}</td>
                    <td className="py-2 pr-4 text-[var(--deep-sea)]">
                      {editingId === (int.idInterest || int.id) ? (
                        <input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-full rounded-md border border-[var(--coastal-sea)]/30 px-2 py-1 text-sm focus:border-[var(--coastal-sea)] focus:outline-none focus:ring-1 focus:ring-[var(--coastal-sea)]"
                        />
                      ) : (
                        int.name
                      )}
                    </td>
                    <td className="flex items-center gap-3 py-2 text-[var(--deep-sea)]">
                      {editingId === (int.idInterest || int.id) ? (
                        <>
                          <button
                            onClick={confirmEdit}
                            className="text-[var(--coastal-sea)] hover:text-[var(--coastal-sea)]/80 focus:outline-none"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-[var(--open-sea)]/50 hover:text-[var(--open-sea)]/70 focus:outline-none"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(int.idInterest || int.id, int.name)}
                            className="text-[var(--coastal-sea)] hover:text-[var(--coastal-sea)]/80 focus:outline-none"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => removeInterest(int.idInterest || int.id)}
                            className="text-red-600 hover:text-red-700 focus:outline-none"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Load Data Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--coastal-sea)]/30 bg-white p-6 shadow-sm">
          <h2 className="mb-8 text-lg font-workSans-semibold text-[var(--deep-sea)]">Load Data</h2>
          <button 
            onClick={handleLoadData}
            disabled={loading}
            className="rounded-md bg-[var(--coastal-sea)] px-6 py-3 text-sm font-workSans-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load Data"}
          </button>
        </div>
      </div>
    </div>
  );
} 