// Datos y funciones para el grafo de afinidad

// Datos iniciales de nodos
export const initialNodes = [
  { id: '1', label: 'Ana', group: 0 },
  { id: '2', label: 'Luis', group: 1 },
  { id: '3', label: 'Marta', group: 2 },
  { id: '4', label: 'Diego', group: 3 },
  { id: '5', label: 'Sofía', group: 1 },
  { id: '6', label: 'Juan', group: 0 }
];

// Datos iniciales de enlaces
export const initialLinks = [
  { source: '1', target: '2' },
  { source: '1', target: '3' },
  { source: '2', target: '4' },
  { source: '3', target: '4' },
  { source: '4', target: '5' },
  { source: '5', target: '6' }
];

// Combinación de nodos y enlaces
export const graphData = {
  nodes: initialNodes,
  links: initialLinks
};

// Paleta de colores para el grafo
export const palette = [
  '#800000', // Granate
  '#4682B4', // Azul acero
  '#8e44ad', // Púrpura oscuro
  '#16a085'  // Verde azulado oscuro
];

// Función para seleccionar color según el grupo
export const colorScale = (g) => palette[g % palette.length];

// Función para encontrar vecinos de un nodo (BFS)
export const findNeighbors = (nodeId, links) => {
  if (!nodeId) return new Set();
  const set = new Set();
  links.forEach((l) => {
    const [src, tgt] = [l.source.id || l.source, l.target.id || l.target];
    if (src === nodeId) set.add(tgt);
    if (tgt === nodeId) set.add(src);
  });
  return set;
};

// Algoritmo BFS para encontrar el camino más corto
export const findShortestPath = (start, end, links) => {
  if (!start || !end) return [];
  const q = [[start]];
  const visited = new Set([start]);
  
  while (q.length) {
    const currentPath = q.shift();
    const node = currentPath.at(-1);
    
    if (node === end) return currentPath;
    
    links.forEach((l) => {
      const [src, tgt] = [l.source.id || l.source, l.target.id || l.target];
      
      if (src === node && !visited.has(tgt)) {
        visited.add(tgt);
        q.push([...currentPath, tgt]);
      }
      
      if (tgt === node && !visited.has(src)) {
        visited.add(src);
        q.push([...currentPath, src]);
      }
    });
  }
  
  return [];
};

// Función para obtener el ancho interno de un elemento menos el padding
export const getInnerWidth = (el) => {
  if (!el) return 0;
  const style = window.getComputedStyle(el);
  const pad = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  return Math.max(el.clientWidth - pad, 0);
}; 