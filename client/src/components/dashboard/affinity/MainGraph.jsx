import React, { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceManyBody } from 'd3-force';
import { colorScale, palette } from './GraphData';

/**
 * Componente que renderiza el grafo principal con soporte para vista ego-céntrica
 */
const MainGraph = ({ 
  graphData, 
  width, 
  showEgo, 
  egoNode, 
  egoNeighbors, 
  onNodeClick 
}) => {
  const graphRef = useRef();

  // Configurar las fuerzas de repulsión entre nodos
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge', forceManyBody().strength(-250));
      
      // Centrar el grafo inicialmente
      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.zoomToFit(400);
          graphRef.current.d3ReheatSimulation();
        }
      }, 300);
    }
  }, []);

  // Función para dibujar los nodos
  const nodeCanvasObject = (node, ctx) => {
    // Radio proporcional al nombre del nodo
    const r = 12 + node.label.length * 0.5;
    
    // Dibujamos un círculo para el nodo
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);

    // Color según vista ego o según el grupo
    let fill = colorScale(node.group);
    if (showEgo && egoNode) {
      if (node.id === egoNode) {
        fill = '#f97316'; // naranja para el nodo ego
      } else if (egoNeighbors.has(node.id)) {
        fill = colorScale(node.group);
      } else {
        fill = '#cbd5e1'; // gris claro para nodos no relacionados
      }
    }
    ctx.fillStyle = fill;
    ctx.fill();
    
    // Añadir contorno para mejor visibilidad
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Etiqueta del nodo con fondo para mejor legibilidad
    const label = node.label;
    const fontSize = 13;
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    // Calculamos el ancho del texto para el fondo
    const textWidth = ctx.measureText(label).width;
    const bgPadding = 4;
    
    // Dibujamos un fondo para el texto
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      node.x - textWidth/2 - bgPadding,
      node.y + r + 2,
      textWidth + bgPadding*2,
      fontSize + bgPadding
    );
    
    // Dibujamos el texto
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#334155';
    ctx.fillText(label, node.x, node.y + r + 4);
  };

  // Función para determinar el ancho de los enlaces
  const linkWidth = (l) => {
    if (!showEgo || !egoNode) return 2; // Ligeramente más anchos por defecto
    const [src, tgt] = [l.source.id || l.source, l.target.id || l.target];
    return src === egoNode || tgt === egoNode ? 3 : 0.5;
  };

  // Función para determinar el color de los enlaces
  const linkColor = (l) => {
    if (!showEgo || !egoNode) return '#94a3b8';
    const [src, tgt] = [l.source.id || l.source, l.target.id || l.target];
    return src === egoNode || tgt === egoNode ? '#0ea5e9' : '#cbd5e1';
  };

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      nodeCanvasObject={nodeCanvasObject}
      linkWidth={linkWidth}
      linkColor={linkColor}
      linkDirectionalArrowLength={6}
      linkDirectionalArrowColor={linkColor}
      linkDistance={150}
      width={width}
      height={400}
      onNodeClick={onNodeClick}
      style={{ display: 'block' }}
      backgroundColor="#ffffff"
      nodeRelSize={6}
      cooldownTime={2000}
    />
  );
};

export default MainGraph; 