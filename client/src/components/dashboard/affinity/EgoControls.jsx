import React from 'react';
import { User, X } from 'lucide-react';

/**
 * Componente de controles para la vista ego-céntrica
 */
const EgoControls = ({ showEgo, setShowEgo, egoNode, setEgoNode, graphData }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[var(--coastal-sea)]/10 text-sm text-[var(--open-sea)]/80 select-none">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showEgo}
          onChange={(e) => {
            setShowEgo(e.target.checked);
            if (!e.target.checked) {
              setEgoNode(null);
            }
          }}
          className="accent-[var(--coastal-sea)] w-4 h-4"
        />
        <span>Mostrar conexiones de un estudiante</span>
      </label>
      
      {showEgo && (
        <>
          <div className="flex items-center gap-1 pl-2 border-l border-[var(--coastal-sea)]/10">
            <User size={16} className="text-[var(--coastal-sea)]" />
            <span>
              Seleccionado: <strong className="font-workSans-bold">
                {egoNode ? graphData.nodes.find((n) => n.id === egoNode)?.label : '—'}
              </strong>
            </span>
          </div>
          
          {egoNode && (
            <button 
              onClick={() => setEgoNode(null)} 
              className="flex items-center gap-1 text-[var(--coastal-sea)] hover:underline"
            >
              <X size={14} /> Limpiar selección
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default EgoControls; 