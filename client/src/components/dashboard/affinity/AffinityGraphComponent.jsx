import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import MainGraph from './MainGraph';
import PathFinder from './PathFinder';
import PathModal from './PathModal';
import EgoControls from './EgoControls';
import { findNeighbors, findShortestPath, getInnerWidth } from './GraphData';
import { getAffinityGraphData, findShortestPath as findShortestPathAPI } from '../../../services/adminApi';
import { Network } from 'lucide-react';

/**
 * Componente principal de la visualización del grafo de afinidad
 */
const AffinityGraphComponent = () => {
  // Estado del grafo
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEgo, setShowEgo] = useState(false);
  const [egoNode, setEgoNode] = useState(null);
  const [student1, setStudent1] = useState('');
  const [student2, setStudent2] = useState('');
  const [path, setPath] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  // Estado para el ancho responsivo
  const [mainWidth, setMainWidth] = useState(700);
  const [modalWidth, setModalWidth] = useState(600);

  // Referencias a los contenedores
  const mainWrapperRef = useRef();
  const modalWrapperRef = useRef();

  // Cargar datos del grafo al montar el componente
  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      const data = await getAffinityGraphData();
      setGraphData(data);
      setError("");
    } catch (error) {
      setError("Error al cargar el grafo de afinidad");
      console.error("Error loading graph data:", error);
      // Usar datos de fallback en caso de error
      setGraphData({
        nodes: [
          { id: '1', label: 'Ana', group: 0 },
          { id: '2', label: 'Luis', group: 1 },
          { id: '3', label: 'Marta', group: 2 },
          { id: '4', label: 'Diego', group: 3 },
          { id: '5', label: 'Sofía', group: 1 },
          { id: '6', label: 'Juan', group: 0 }
        ],
        links: [
          { source: '1', target: '2' },
          { source: '1', target: '3' },
          { source: '2', target: '4' },
          { source: '3', target: '4' },
          { source: '4', target: '5' },
          { source: '5', target: '6' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular vecinos para vista ego-céntrica
  const egoNeighbors = useMemo(() => {
    return findNeighbors(egoNode, graphData.links);
  }, [egoNode, graphData.links]);

  // Observar cambios de tamaño para el grafo principal
  useLayoutEffect(() => {
    if (!mainWrapperRef.current) return;
    const handle = () => setMainWidth(getInnerWidth(mainWrapperRef.current));
    handle();
    const ro = new ResizeObserver(handle);
    ro.observe(mainWrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // Observar cambios de tamaño para el modal
  useLayoutEffect(() => {
    if (!modalWrapperRef.current || !modalOpen) return;
    const handle = () => setModalWidth(getInnerWidth(modalWrapperRef.current));
    handle();
    const ro = new ResizeObserver(handle);
    ro.observe(modalWrapperRef.current);
    return () => ro.disconnect();
  }, [modalOpen]);

  // Encontrar nodos de inicio y fin para el modal
  const startNode = useMemo(() => 
    graphData.nodes.find(n => n.id === student1),
    [student1, graphData.nodes]
  );
  
  const endNode = useMemo(() => 
    graphData.nodes.find(n => n.id === student2),
    [student2, graphData.nodes]
  );

  // Manejadores de eventos
  const handleNodeClick = (node) => {
    if (showEgo) setEgoNode(node.id);
  };

  const handleFindRoute = async () => {
    try {
      setLoading(true);
      const response = await findShortestPathAPI(student1, student2);
      if (response.pathFound) {
        setPath(response.path);
        setStepIdx(0);
        setModalOpen(true);
        setShowEgo(false);
        setEgoNode(null);
        setError("");
      } else {
        setError(response.message || "No se encontró una ruta entre los estudiantes");
        // Fallback to local search
        const route = findShortestPath(student1, student2, graphData.links);
        setPath(route);
        setStepIdx(0);
        setModalOpen(true);
        setShowEgo(false);
        setEgoNode(null);
      }
    } catch (error) {
      console.error("Error finding path:", error);
      // Fallback to local search
      const route = findShortestPath(student1, student2, graphData.links);
      setPath(route);
      setStepIdx(0);
      setModalOpen(true);
      setShowEgo(false);
      setEgoNode(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setStepIdx(0);
  };

  return (
    <div className="w-full space-y-8">
      {/* Título y descripción */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Network className="text-[var(--coastal-sea)] w-8 h-8" />
          <h2 className="font-righteous text-2xl text-[var(--deep-sea)]">Visualizador de Grafo de Afinidad</h2>
        </div>
        <p className="text-[var(--open-sea)]/80 mt-2">Explora las conexiones entre estudiantes y encuentra rutas entre ellos</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 p-3">
          <p className="text-sm text-blue-600">Cargando datos del grafo...</p>
        </div>
      )}
      
      {/* Grafo principal */}
      <section
        ref={mainWrapperRef}
        className="w-full border border-[var(--coastal-sea)]/30 rounded-lg p-6 bg-white shadow-sm"
      >
        <div className="mb-4">
          <h2 className="font-workSans-bold text-lg text-[var(--open-sea)]">Relaciones entre estudiantes</h2>
          <p className="text-sm text-[var(--open-sea)]/70">Haz clic en un nodo cuando esté activada la vista de conexiones para ver sus relaciones</p>
        </div>
        
        <div className="border border-[var(--coastal-sea)]/10 rounded-lg overflow-hidden bg-[var(--sand)]/5">
          <MainGraph 
            graphData={graphData}
            width={mainWidth}
            showEgo={showEgo}
            egoNode={egoNode}
            egoNeighbors={egoNeighbors}
            onNodeClick={handleNodeClick}
          />
        </div>
        
        {/* Controles de vista ego-céntrica */}
        <EgoControls 
          showEgo={showEgo}
          setShowEgo={setShowEgo}
          egoNode={egoNode}
          setEgoNode={setEgoNode}
          graphData={graphData}
        />
      </section>

      {/* Buscador de ruta */}
      <PathFinder 
        nodes={graphData.nodes}
        student1={student1}
        student2={student2}
        setStudent1={setStudent1}
        setStudent2={setStudent2}
        onFindRoute={handleFindRoute}
      />

      {/* Modal con ruta paso a paso */}
      {modalOpen && (
        <div ref={modalWrapperRef} className="w-full max-w-2xl">
          <PathModal 
            graphData={graphData}
            path={path}
            stepIdx={stepIdx}
            setStepIdx={setStepIdx}
            width={modalWidth}
            onClose={handleCloseModal}
            startNode={startNode}
            endNode={endNode}
          />
        </div>
      )}
    </div>
  );
};

export default AffinityGraphComponent; 