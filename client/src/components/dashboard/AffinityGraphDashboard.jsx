import React, { useState, useEffect, useMemo } from "react";
import { Search, Download, Settings, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/**
 * Dashboard de visualización del grafo de afinidad
 * Carga dinámica de ForceGraph2D (evitando SSR)
 */
const AffinityGraphDashboard = () => {
  // Estado para cargar el grafo dinámicamente en cliente
  const [ForceGraph2D, setForceGraph2D] = useState(null);
  
  // Cargar el componente ForceGraph2D dinámicamente
  useEffect(() => {
    import("react-force-graph-2d").then(module => {
      setForceGraph2D(() => module.default);
    }).catch(err => {
      console.error("Error al cargar el grafo:", err);
    });
  }, []);

  // Datos de ejemplo para el grafo
  const graphData = useMemo(() => ({
    nodes: [
      { id: "user1", name: "Juan", group: 1 },
      { id: "user2", name: "Ana", group: 1 },
      { id: "user3", name: "Carlos", group: 2 },
      { id: "user4", name: "María", group: 2 },
      { id: "user5", name: "Pedro", group: 3 },
      { id: "content1", name: "Matemáticas", group: 4 },
      { id: "content2", name: "Física", group: 4 },
      { id: "content3", name: "Programación", group: 5 },
    ],
    links: [
      { source: "user1", target: "content1", value: 5 },
      { source: "user1", target: "content2", value: 3 },
      { source: "user2", target: "content1", value: 4 },
      { source: "user2", target: "content3", value: 5 },
      { source: "user3", target: "content2", value: 2 },
      { source: "user3", target: "content3", value: 3 },
      { source: "user4", target: "content3", value: 5 },
      { source: "user5", target: "content1", value: 1 },
      { source: "user1", target: "user2", value: 4 },
      { source: "user2", target: "user3", value: 2 },
      { source: "user3", target: "user4", value: 4 },
      { source: "user4", target: "user5", value: 1 },
    ]
  }), []);

  // Estados para configuración del grafo
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedView, setSelectedView] = useState("Todos");

  // Opciones para filtrar la vista
  const viewOptions = ["Todos", "Estudiantes", "Contenidos", "Conexiones Fuertes"];

  // Función para exportar datos
  const handleExport = () => {
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'grafo-afinidad.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para resetear la vista
  const handleReset = () => {
    setZoomLevel(1);
    setSelectedView("Todos");
    setSearchQuery("");
  };

  // Personalización del nodo
  const nodeCanvasObject = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12/globalScale;
    ctx.font = `${fontSize}px sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const backgroundPadding = 2;
    
    // Colores basados en el grupo
    const colors = {
      1: '#264653', // open-sea
      2: '#2A9D8F', // coastal-sea
      3: '#F2F3D9', // sand
      4: '#E9C46A', // otro color
      5: '#F4A261', // otro color
    };
    
    ctx.fillStyle = colors[node.group] || '#666666';
    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Texto en negro o blanco según el color de fondo para mejor contraste
    ctx.fillStyle = [1, 2, 4, 5].includes(node.group) ? 'white' : 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, node.x, node.y + 10);
    
    // Resaltado si coincide con la búsqueda
    if (searchQuery && label.toLowerCase().includes(searchQuery.toLowerCase())) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2/globalScale;
      ctx.stroke();
    }
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="search-graph" className="block text-sm font-workSans-bold mb-1">
            Buscar en el grafo:
          </label>
          <div className="relative">
            <input
              id="search-graph"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coastal-sea pl-9"
              placeholder="Nombre de usuario o contenido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <div>
          <label htmlFor="view-select" className="block text-sm font-workSans-bold mb-1">
            Vista:
          </label>
          <select
            id="view-select"
            className="h-10 border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-coastal-sea"
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
          >
            {viewOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="p-2 border border-gray-300 rounded-md hover:bg-sand"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
            title="Acercar"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            className="p-2 border border-gray-300 rounded-md hover:bg-sand"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
            title="Alejar"
          >
            <ZoomOut size={20} />
          </button>
          <button 
            className="p-2 border border-gray-300 rounded-md hover:bg-sand"
            onClick={handleReset}
            title="Reiniciar vista"
          >
            <RotateCcw size={20} />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-1 px-3 py-2 bg-coastal-sea text-white rounded-md hover:bg-coastal-sea/90"
            onClick={handleExport}
          >
            <Download size={18} /> Exportar
          </button>
          <button 
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-sand"
          >
            <Settings size={18} /> Configuración
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        {ForceGraph2D ? (
          <ForceGraph2D
            graphData={graphData}
            nodeCanvasObject={nodeCanvasObject}
            linkWidth={link => link.value * 0.5}
            linkColor={() => "#999999"}
            backgroundColor="#ffffff"
            cooldownTime={3000}
            nodeRelSize={6}
            zoom={zoomLevel}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Cargando grafo...
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <div>Nodos: {graphData.nodes.length} | Enlaces: {graphData.links.length}</div>
        <div>
          Leyenda: 
          <span className="ml-2 inline-block w-3 h-3 rounded-full bg-open-sea"></span> Estudiantes
          <span className="ml-2 inline-block w-3 h-3 rounded-full bg-coastal-sea"></span> Profesores
          <span className="ml-2 inline-block w-3 h-3 rounded-full bg-sand border border-gray-400"></span> Administradores
          <span className="ml-2 inline-block w-3 h-3 rounded-full" style={{backgroundColor: '#E9C46A'}}></span> Contenidos
        </div>
      </div>
    </div>
  );
};

export default AffinityGraphDashboard; 