import React, { useRef, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceManyBody, forceCollide } from 'd3-force';
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
      // Mayor fuerza de repulsión para mejor separación
      graphRef.current.d3Force('charge', forceManyBody().strength(-1200));
      
      // Añadir fuerza de colisión para evitar solapamientos
      graphRef.current.d3Force('collision', forceCollide().radius(80));
      
      // Centrar el grafo inicialmente
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
    // Radio proporcional al nombre del nodo
    const r = 12 + node.label.length * 0.5;
    
    // Dibujamos un círculo para el nodo
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    
    // Determinar el color del nodo
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
    } else {
      // Añadir contorno para mejor visibilidad
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Etiqueta del nodo con fondo para mejor legibilidad
    const label = node.label;
    const fontSize = 14;
    ctx.font = `bold ${fontSize}px 'Segoe UI', Roboto, sans-serif`;
    
    // Calculamos el ancho del texto para el fondo
    const textWidth = ctx.measureText(label).width;
    const bgPadding = 6;
    const bgHeight = fontSize + bgPadding * 1.5;
    const bgY = node.y + r + 4;
    const bgX = node.x - textWidth/2 - bgPadding;
    const cornerRadius = 4;
    
    // Añadir sombra sutil
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    // Dibujamos un fondo redondeado para el texto
    ctx.beginPath();
    ctx.moveTo(bgX + cornerRadius, bgY);
    ctx.lineTo(bgX + textWidth + bgPadding * 2 - cornerRadius, bgY);
    ctx.quadraticCurveTo(bgX + textWidth + bgPadding * 2, bgY, bgX + textWidth + bgPadding * 2, bgY + cornerRadius);
    ctx.lineTo(bgX + textWidth + bgPadding * 2, bgY + bgHeight - cornerRadius);
    ctx.quadraticCurveTo(bgX + textWidth + bgPadding * 2, bgY + bgHeight, bgX + textWidth + bgPadding * 2 - cornerRadius, bgY + bgHeight);
    ctx.lineTo(bgX + cornerRadius, bgY + bgHeight);
    ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - cornerRadius);
    ctx.lineTo(bgX, bgY + cornerRadius);
    ctx.quadraticCurveTo(bgX, bgY, bgX + cornerRadius, bgY);
    ctx.closePath();
    
    // Color de fondo según el color del nodo pero más claro
    // Crear una versión más clara del color de fondo
    ctx.fillStyle = `${fillColor}15`; // 15 es la opacidad en hexadecimal (aprox. 10%)
    ctx.fill();
    
    // Borde sutil que coincide con el color del nodo
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Limpiar sombra para el texto
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Dibujamos el texto con mejor contraste
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Usar un color que contraste bien con el fondo
    ctx.fillStyle = '#1e293b'; // Slate-900, color oscuro para buen contraste
    ctx.fillText(label, node.x, bgY + bgHeight/2);
    
    // Si este es un nodo en el camino, añadir un indicador de posición
    if (highlighted.includes(node.id)) {
      const stepNumber = highlighted.indexOf(node.id) + 1;
      const indicatorSize = 14;
      ctx.fillStyle = '#f97316'; // Naranja para el indicador
      ctx.beginPath();
      ctx.arc(bgX - indicatorSize/2, bgY + bgHeight/2, indicatorSize/2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Número del paso
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize-2}px 'Segoe UI', Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stepNumber.toString(), bgX - indicatorSize/2, bgY + bgHeight/2);
    }
  };

  // Función personalizada para dibujar enlaces
  const linkCanvasObject = (link, ctx, globalScale) => {
    // Extraer posiciones de origen y destino
    const start = link.source;
    const end = link.target;
    
    const sourceX = start.x || 0;
    const sourceY = start.y || 0;
    const targetX = end.x || 0;
    const targetY = end.y || 0;
    
    // Determinar si este enlace es parte del camino
    const sourceId = link.source.id || link.source;
    const targetId = link.target.id || link.target;
    
    let isHighlighted = false;
    for (let i = 0; i < highlighted.length - 1; i++) {
      if (
        (sourceId === highlighted[i] && targetId === highlighted[i + 1]) ||
        (targetId === highlighted[i] && sourceId === highlighted[i + 1])
      ) {
        isHighlighted = true;
        break;
      }
    }
    
    // Definir ancho de línea según si está destacado
    let lineWidth = isHighlighted ? 4 : 2;
    
    // Calcular color de la línea
    let strokeColor = isHighlighted ? '#f97316' : '#94a3b8';
    
    // Calcular punto medio para efecto de curva
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    
    // Calcular distancia para determinar la profundidad de la curva
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calcular vector perpendicular normalizado
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    // Desplazamiento de la curva - sutil pero visible
    const curveOffset = Math.min(distance * 0.15, 15);
    
    // Calcular punto de control para la curva
    const controlX = midX + perpX * curveOffset;
    const controlY = midY + perpY * curveOffset;
    
    // Dibujar línea curva
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.quadraticCurveTo(controlX, controlY, targetX, targetY);
    
    // Establecer estilo de línea
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    
    // Crear degradado sutil en la línea
    const gradient = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
    gradient.addColorStop(0, strokeColor);
    gradient.addColorStop(0.5, `${strokeColor}CC`); // Semi-transparente en el medio
    gradient.addColorStop(1, strokeColor);
    ctx.strokeStyle = gradient;
    
    // Dibujar la línea
    ctx.stroke();
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
            linkCanvasObject={linkCanvasObject}
            linkCurvature={0.1}
            linkDistance={180}
            width={width || 500}
            height={340}
            backgroundColor="#FEFBF6"
            nodeRelSize={6}
            cooldownTime={2000}
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
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--coastal-sea)]/20 text-xs font-bold">
                    {idx + 1}
                  </span> {node?.label}
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