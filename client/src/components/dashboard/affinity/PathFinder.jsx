import React from 'react';
import { ArrowRight, Route } from 'lucide-react';

/**
 * Componente para buscar la ruta más corta entre dos nodos
 */
const PathFinder = ({ 
  nodes, 
  student1, 
  student2, 
  setStudent1, 
  setStudent2,
  onFindRoute 
}) => {
  return (
    <section className="w-full border border-[var(--coastal-sea)]/30 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Route className="text-[var(--coastal-sea)] w-6 h-6" />
        <h2 className="text-lg font-workSans-bold text-[var(--open-sea)]">Camino más corto entre estudiantes</h2>
      </div>
      <p className="text-sm text-[var(--open-sea)]/70 mb-4">Selecciona dos estudiantes para encontrar la ruta más corta que los conecta</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {/* Estudiante 1 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-workSans-bold text-[var(--open-sea)]">Estudiante 1</label>
          <select
            value={student1}
            onChange={(e) => setStudent1(e.target.value)}
            className="border border-[var(--coastal-sea)]/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent bg-white"
          >
            <option value="" disabled>Selecciona…</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </div>
        
        {/* Estudiante 2 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-workSans-bold text-[var(--open-sea)]">Estudiante 2</label>
          <select
            value={student2}
            onChange={(e) => setStudent2(e.target.value)}
            className="border border-[var(--coastal-sea)]/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-sea)]/50 focus:border-transparent bg-white"
          >
            <option value="" disabled>Selecciona…</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onFindRoute}
        disabled={!student1 || !student2 || student1 === student2}
        className="mt-5 flex items-center justify-center gap-2 bg-[var(--coastal-sea)] hover:bg-opacity-90 disabled:bg-opacity-50 text-white font-workSans-bold py-3 px-5 rounded-md transition active:scale-98 text-base"
      >
        Encontrar Ruta <ArrowRight size={20} />
      </button>
    </section>
  );
};

export default PathFinder; 