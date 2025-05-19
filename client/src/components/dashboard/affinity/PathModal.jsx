import React, { useRef, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceManyBody } from 'd3-force';
import { X, ChevronLeft, ChevronRight, Route } from 'lucide-react';
import { colorScale } from './GraphData';

/**
 * Componente modal que muestra la ruta paso a paso entre dos nodos
 */
const PathModal = ({
  graphData,
  path,
  stepIdx,
  setStepIdx,
  width,
  onClose,
  startNode,
  endNode
}) => {
  const graphRef = useRef();

  // Configurar las fuerzas de repulsión entre nodos
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge', forceManyBody().strength(-300));
      // Force update the graph
      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.zoomToFit(400, 100);
          graphRef.current.d3ReheatSimulation();
        }
      }, 300);
    }
  }, []);

  // Nodos resaltados hasta el paso actual
  const highlighted = useMemo(() => path.slice(0, stepIdx + 1), [path, stepIdx]);

  // Función para dibujar los nodos
  const nodeCanvasObject = (node, ctx) => {
    const r = 9 + node.label.length * 0.4;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    
    // Utiliza colores del proyecto
    let fillColor;
    if (highlighted.includes(node.id)) {
      fillColor = '#f97316'; // Color naranja para los nodos destacados
    } else if (node.id === startNode?.id || node.id === endNode?.id) {
      fillColor = '#2A9D8F'; // coastal-sea para nodos de inicio y fin
    } else {
      fillColor = colorScale(node.group);
    }
    
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    // Contorno para nodos de inicio y fin
    if (node.id === startNode?.id || node.id === endNode?.id) {
      ctx.strokeStyle = '#264653'; // open-sea
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#334155';
    ctx.fillText(node.label, node.x, node.y + r + 2);
  };

  // Función para determinar el ancho de los enlaces
  const linkWidth = (l) => {
    const sourceId = l.source.id || l.source;
    const targetId = l.target.id || l.target;
    
    for (let i = 0; i < highlighted.length - 1; i++) {
      if (
        (sourceId === highlighted[i] && targetId === highlighted[i + 1]) ||
        (targetId === highlighted[i] && sourceId === highlighted[i + 1])
      ) {
        return 4;
      }
    }
    return 1;
  };
  
  // Color de los enlaces
  const linkColor = (l) => {
    const sourceId = l.source.id || l.source;
    const targetId = l.target.id || l.target;
    
    for (let i = 0; i < highlighted.length - 1; i++) {
      if (
        (sourceId === highlighted[i] && targetId === highlighted[i + 1]) ||
        (targetId === highlighted[i] && sourceId === highlighted[i + 1])
      ) {
        return '#f97316'; // naranja para enlaces del camino
      }
    }
    return '#94a3b8'; // gris para otros enlaces
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4">
      <div
        className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl relative flex flex-col gap-5"
        style={{ maxHeight: '90vh' }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-[var(--open-sea)]/50 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center gap-2 mt-2">
          <Route className="text-[var(--coastal-sea)] w-5 h-5" />
          <h3 className="text-lg font-workSans-bold text-[var(--open-sea)]">
            Ruta: {startNode?.label} → {endNode?.label}
          </h3>
        </div>

        <div className="border border-[var(--coastal-sea)]/20 rounded-lg overflow-hidden bg-[var(--sand)]/10">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeCanvasObject={nodeCanvasObject}
            linkWidth={linkWidth}
            linkColor={linkColor}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={0.8}
            linkDirectionalArrowColor={linkColor}
            linkDistance={120}
            width={width || 500}
            height={340}
            backgroundColor="#FEFBF6"
          />
        </div>

        {/* Lista de pasos */}
        <div className="border border-[var(--coastal-sea)]/20 rounded-lg p-4 bg-[var(--sand)]/10">
          <h4 className="font-workSans-bold mb-3 text-[var(--open-sea)]">Pasos en la ruta:</h4>
          <ol className="space-y-1 overflow-y-auto max-h-32 pr-2">
            {path.map((id, idx) => {
              const node = graphData.nodes.find((n) => n.id === id);
              return (
                <li 
                  key={id} 
                  className={`flex items-center gap-2 p-1.5 rounded ${
                    idx === stepIdx ? 'bg-[var(--coastal-sea)]/10 text-[var(--coastal-sea)] font-workSans-bold' : 'text-[var(--open-sea)]/70'
                  }`}
                >
                  {idx + 1}. {node?.label}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Controles de navegación */}
        <div className="flex justify-between pt-2">
          <button
            onClick={() => setStepIdx((i) => Math.max(i - 1, 0))}
            disabled={stepIdx === 0}
            className="flex items-center gap-1 px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md disabled:opacity-40 hover:bg-[var(--sand)]/30 bg-white text-[var(--open-sea)] transition-colors"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <button
            onClick={() => setStepIdx((i) => Math.min(i + 1, path.length - 1))}
            disabled={stepIdx === path.length - 1}
            className="flex items-center gap-1 px-4 py-2 border border-[var(--coastal-sea)]/20 rounded-md disabled:opacity-40 hover:bg-[var(--sand)]/30 bg-white text-[var(--open-sea)] transition-colors"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PathModal; 