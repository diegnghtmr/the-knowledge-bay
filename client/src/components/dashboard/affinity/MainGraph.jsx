import React, { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceManyBody, forceCollide } from 'd3-force';
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
      // Aumentar la fuerza de repulsión para mayor separación
      graphRef.current.d3Force('charge', forceManyBody().strength(-500));
      
      // Añadir una fuerza de repulsión adicional para evitar solapamientos
      graphRef.current.d3Force('collision', forceCollide().radius(60));
      
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
    
    // Color de fondo según el grupo pero más claro
    const nodeColor = colorScale(node.group);
    // Crear una versión más clara del color de fondo
    ctx.fillStyle = `${nodeColor}15`; // 15 es la opacidad en hexadecimal (aprox. 10%)
    ctx.fill();
    
    // Borde sutil que coincide con el color del nodo
    ctx.strokeStyle = nodeColor;
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
    
    // Si este es el nodo seleccionado en modo ego, añadir un indicador
    if (showEgo && node.id === egoNode) {
      const indicatorSize = 6;
      ctx.fillStyle = '#f97316'; // Color naranja para el indicador
      ctx.beginPath();
      ctx.arc(bgX + textWidth + bgPadding * 2 - indicatorSize, bgY + indicatorSize, indicatorSize/2, 0, 2 * Math.PI);
      ctx.fill();
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
    
    // Definir ancho de línea según modo
    let lineWidth = 2.5;
    if (showEgo && egoNode) {
      const [src, tgt] = [link.source.id || link.source, link.target.id || link.target];
      lineWidth = (src === egoNode || tgt === egoNode) ? 3.5 : 1.5;
    }
    
    // Calcular color de la línea
    let strokeColor = '#64748b'; // Color base sobrio
    if (showEgo && egoNode) {
      const [src, tgt] = [link.source.id || link.source, link.target.id || link.target];
      strokeColor = (src === egoNode || tgt === egoNode) ? '#1e40af' : '#cbd5e1';
    }
    
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
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      nodeCanvasObject={nodeCanvasObject}
      linkCanvasObject={linkCanvasObject}
      linkCurvature={0.1}
      linkDistance={100}
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