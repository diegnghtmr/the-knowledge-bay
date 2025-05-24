import React, { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

/**
 * Componente para administrar los intereses disponibles en la plataforma
 */
export default function InterestManagement() {
  const [interests, setInterests] = useState([
    { id: 1, name: "Inteligencia Artificial" },
    { id: 2, name: "Filosofía" },
  ]);
  const [newInterest, setNewInterest] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // ────────────────────────────────────────────────────────────────
  // CRUD helpers
  // ────────────────────────────────────────────────────────────────
  const addInterest = () => {
    if (!newInterest.trim()) return;
    setInterests((prev) => [
      ...prev,
      { id: Date.now(), name: newInterest.trim() },
    ]);
    setNewInterest("");
  };

  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditingValue(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const confirmEdit = () => {
    if (!editingValue.trim()) return;
    setInterests((prev) =>
      prev.map((int) =>
        int.id === editingId ? { ...int, name: editingValue.trim() } : int
      )
    );
    cancelEdit();
  };

  const removeInterest = (id) => {
    setInterests((prev) => prev.filter((int) => int.id !== id));
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
              className="inline-flex items-center gap-1 rounded-md bg-[var(--coastal-sea)] px-4 py-2 text-sm font-workSans-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/60"
            >
              Add
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
                  <tr key={int.id} className="border-t border-[var(--coastal-sea)]/10 hover:bg-[var(--sand)]/30">
                    <td className="py-2 pr-4 text-[var(--deep-sea)]">{int.id}</td>
                    <td className="py-2 pr-4 text-[var(--deep-sea)]">
                      {editingId === int.id ? (
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
                      {editingId === int.id ? (
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
                            onClick={() => startEdit(int.id, int.name)}
                            className="text-[var(--coastal-sea)] hover:text-[var(--coastal-sea)]/80 focus:outline-none"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => removeInterest(int.id)}
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
          <button className="rounded-md bg-[var(--coastal-sea)] px-6 py-3 text-sm font-workSans-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/60">
            Load Data
          </button>
        </div>
      </div>
    </div>
  );
} 