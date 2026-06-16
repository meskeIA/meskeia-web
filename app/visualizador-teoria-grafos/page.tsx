'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef } from 'react';
import styles from './TeoriaGrafos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ======== TIPOS ========
interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

interface GraphDefinition {
  id: string;
  name: string;
  description: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
}

type NodeState = 'default' | 'visited' | 'inQueue' | 'current' | 'path' | 'source' | 'target';
type AlgorithmStep = {
  description: string;
  nodeStates: Record<string, NodeState>;
  edgeHighlights: string[];
  distances: Record<string, number>;
};

// ======== GRAFOS PREDEFINIDOS ========
const GRAPHS: GraphDefinition[] = [
  {
    id: 'konigsberg',
    name: 'Puentes de Königsberg',
    description: 'El problema que fundó la teoría de grafos (Euler, 1736). 4 masas de tierra y 7 puentes.',
    directed: false,
    nodes: [
      { id: 'A', label: 'Norte', x: 200, y: 80 },
      { id: 'B', label: 'Isla', x: 200, y: 200 },
      { id: 'C', label: 'Sur', x: 200, y: 320 },
      { id: 'D', label: 'Este', x: 340, y: 200 },
    ],
    edges: [
      { from: 'A', to: 'B', weight: 1 },
      { from: 'A', to: 'B', weight: 1 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'A', to: 'D', weight: 1 },
      { from: 'C', to: 'D', weight: 1 },
      { from: 'B', to: 'D', weight: 1 },
    ],
  },
  {
    id: 'ciudades',
    name: 'Red de Ciudades',
    description: 'Grafo ponderado con 6 ciudades españolas. Usa Dijkstra para encontrar la ruta más corta.',
    directed: false,
    nodes: [
      { id: 'MAD', label: 'Madrid', x: 200, y: 200 },
      { id: 'BCN', label: 'Barcelona', x: 360, y: 100 },
      { id: 'VAL', label: 'Valencia', x: 320, y: 260 },
      { id: 'SEV', label: 'Sevilla', x: 100, y: 320 },
      { id: 'BIL', label: 'Bilbao', x: 200, y: 80 },
      { id: 'ZGZ', label: 'Zaragoza', x: 290, y: 170 },
    ],
    edges: [
      { from: 'MAD', to: 'BCN', weight: 621 },
      { from: 'MAD', to: 'VAL', weight: 357 },
      { from: 'MAD', to: 'SEV', weight: 534 },
      { from: 'MAD', to: 'BIL', weight: 395 },
      { from: 'MAD', to: 'ZGZ', weight: 325 },
      { from: 'BCN', to: 'VAL', weight: 349 },
      { from: 'BCN', to: 'ZGZ', weight: 296 },
      { from: 'ZGZ', to: 'BIL', weight: 324 },
      { from: 'VAL', to: 'SEV', weight: 654 },
    ],
  },
  {
    id: 'k5',
    name: 'Grafo Completo K5',
    description: 'K5: cada nodo está conectado con todos los demás. 5 nodos, 10 aristas. No es planar.',
    directed: false,
    nodes: [
      { id: '1', label: '1', x: 210, y: 60 },
      { id: '2', label: '2', x: 360, y: 170 },
      { id: '3', label: '3', x: 300, y: 330 },
      { id: '4', label: '4', x: 120, y: 330 },
      { id: '5', label: '5', x: 60, y: 170 },
    ],
    edges: [
      { from: '1', to: '2', weight: 1 },
      { from: '1', to: '3', weight: 1 },
      { from: '1', to: '4', weight: 1 },
      { from: '1', to: '5', weight: 1 },
      { from: '2', to: '3', weight: 1 },
      { from: '2', to: '4', weight: 1 },
      { from: '2', to: '5', weight: 1 },
      { from: '3', to: '4', weight: 1 },
      { from: '3', to: '5', weight: 1 },
      { from: '4', to: '5', weight: 1 },
    ],
  },
  {
    id: 'arbol',
    name: 'Árbol Binario',
    description: 'Árbol: grafo conexo sin ciclos. Cada nodo padre tiene exactamente 2 hijos.',
    directed: false,
    nodes: [
      { id: 'r', label: '10', x: 210, y: 60 },
      { id: 'a', label: '5', x: 120, y: 150 },
      { id: 'b', label: '15', x: 300, y: 150 },
      { id: 'c', label: '3', x: 70, y: 250 },
      { id: 'd', label: '7', x: 170, y: 250 },
      { id: 'e', label: '12', x: 250, y: 250 },
      { id: 'f', label: '20', x: 350, y: 250 },
    ],
    edges: [
      { from: 'r', to: 'a', weight: 1 },
      { from: 'r', to: 'b', weight: 1 },
      { from: 'a', to: 'c', weight: 1 },
      { from: 'a', to: 'd', weight: 1 },
      { from: 'b', to: 'e', weight: 1 },
      { from: 'b', to: 'f', weight: 1 },
    ],
  },
];

// ======== ALGORITMO DIJKSTRA ========
function runDijkstra(
  graph: GraphDefinition,
  sourceId: string,
  targetId: string
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const unvisited = new Set<string>();

  graph.nodes.forEach((n) => {
    dist[n.id] = n.id === sourceId ? 0 : Infinity;
    prev[n.id] = null;
    unvisited.add(n.id);
  });

  const buildAdjacency = () => {
    const adj: Record<string, { to: string; weight: number }[]> = {};
    graph.nodes.forEach((n) => { adj[n.id] = []; });
    graph.edges.forEach((e) => {
      adj[e.from].push({ to: e.to, weight: e.weight });
      if (!graph.directed) {
        adj[e.to].push({ to: e.from, weight: e.weight });
      }
    });
    return adj;
  };

  const adj = buildAdjacency();

  const getNodeStates = (current: string, path: string[]): Record<string, NodeState> => {
    const states: Record<string, NodeState> = {};
    graph.nodes.forEach((n) => {
      if (n.id === sourceId) states[n.id] = 'source';
      else if (n.id === targetId) states[n.id] = 'target';
      else if (n.id === current) states[n.id] = 'current';
      else if (path.includes(n.id)) states[n.id] = 'path';
      else if (visited.has(n.id)) states[n.id] = 'visited';
      else if (!unvisited.has(n.id)) states[n.id] = 'inQueue';
      else states[n.id] = 'default';
    });
    return states;
  };

  steps.push({
    description: `Inicio: distancia desde ${sourceId} = 0. Todos los demás = ∞`,
    nodeStates: getNodeStates('', []),
    edgeHighlights: [],
    distances: { ...dist },
  });

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minDist = Infinity;
    unvisited.forEach((id) => {
      if (dist[id] < minDist) {
        minDist = dist[id];
        current = id;
      }
    });

    if (current === null || dist[current] === Infinity) break;

    unvisited.delete(current);
    visited.add(current);

    const reconstructPath = (node: string): string[] => {
      const path: string[] = [];
      let cur: string | null = node;
      while (cur) {
        path.unshift(cur);
        cur = prev[cur];
      }
      return path;
    };

    if (current === targetId) {
      const path = reconstructPath(targetId);
      steps.push({
        description: `¡Destino ${targetId} alcanzado! Distancia mínima: ${dist[targetId]}`,
        nodeStates: (() => {
          const states: Record<string, NodeState> = {};
          graph.nodes.forEach((n) => {
            if (n.id === sourceId) states[n.id] = 'source';
            else if (n.id === targetId) states[n.id] = 'target';
            else if (path.includes(n.id)) states[n.id] = 'path';
            else if (visited.has(n.id)) states[n.id] = 'visited';
            else states[n.id] = 'default';
          });
          return states;
        })(),
        edgeHighlights: path.slice(0, -1).map((n, i) => `${n}-${path[i + 1]}`),
        distances: { ...dist },
      });
      break;
    }

    const neighbors = adj[current] || [];
    neighbors.forEach(({ to, weight }) => {
      if (visited.has(to)) return;
      const alt = dist[current!] + weight;
      if (alt < dist[to]) {
        dist[to] = alt;
        prev[to] = current;
        steps.push({
          description: `Visitando ${current}: actualizo distancia a ${to} → ${alt}`,
          nodeStates: getNodeStates(current!, reconstructPath(targetId)),
          edgeHighlights: [`${current}-${to}`],
          distances: { ...dist },
        });
      }
    });

    if (neighbors.filter(({ to }) => !visited.has(to)).length === 0) {
      steps.push({
        description: `Nodo ${current} procesado. Distancia: ${dist[current]}`,
        nodeStates: getNodeStates(current, []),
        edgeHighlights: [],
        distances: { ...dist },
      });
    }
  }

  return steps;
}

// ======== PROPIEDADES DEL GRAFO ========
interface GraphProperties {
  isConnected: boolean;
  hasEulerPath: boolean;
  hasEulerCircuit: boolean;
  isTree: boolean;
  degrees: Record<string, number>;
  nodeCount: number;
  edgeCount: number;
}

function computeProperties(graph: GraphDefinition): GraphProperties {
  const degree: Record<string, number> = {};
  graph.nodes.forEach((n) => { degree[n.id] = 0; });
  graph.edges.forEach((e) => {
    degree[e.from] = (degree[e.from] || 0) + 1;
    if (!graph.directed) {
      degree[e.to] = (degree[e.to] || 0) + 1;
    }
  });

  // Conectividad BFS
  const adj: Record<string, string[]> = {};
  graph.nodes.forEach((n) => { adj[n.id] = []; });
  graph.edges.forEach((e) => {
    adj[e.from].push(e.to);
    if (!graph.directed) adj[e.to].push(e.from);
  });

  const visited = new Set<string>();
  const queue = [graph.nodes[0]?.id];
  if (queue[0]) visited.add(queue[0]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    (adj[cur] || []).forEach((nb) => {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    });
  }
  const isConnected = visited.size === graph.nodes.length;

  const oddDegreeCount = Object.values(degree).filter((d) => d % 2 !== 0).length;
  const hasEulerCircuit = isConnected && oddDegreeCount === 0;
  const hasEulerPath = isConnected && (oddDegreeCount === 0 || oddDegreeCount === 2);

  // Un árbol tiene exactamente n-1 aristas y es conexo
  const uniqueEdges = new Set(graph.edges.map((e) => [e.from, e.to].sort().join('-'))).size;
  const isTree = isConnected && uniqueEdges === graph.nodes.length - 1;

  return {
    isConnected,
    hasEulerPath,
    hasEulerCircuit,
    isTree,
    degrees: degree,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
  };
}

// ======== COMPONENTE SVG DEL GRAFO ========
function GraphSVG({
  graph,
  nodeStates,
  edgeHighlights,
  onNodeClick,
  selectedSource,
  selectedTarget,
}: {
  graph: GraphDefinition;
  nodeStates: Record<string, NodeState>;
  edgeHighlights: string[];
  onNodeClick: (id: string) => void;
  selectedSource: string;
  selectedTarget: string;
}) {
  const getNodeColor = (id: string): string => {
    const state = nodeStates[id] || 'default';
    switch (state) {
      case 'source': return '#2E86AB';
      case 'target': return '#E63946';
      case 'current': return '#F4A261';
      case 'visited': return '#48A9A6';
      case 'inQueue': return '#A8DADC';
      case 'path': return '#F4A261';
      default: return '#FFFFFF';
    }
  };

  const getNodeStroke = (id: string): string => {
    if (id === selectedSource) return '#2E86AB';
    if (id === selectedTarget) return '#E63946';
    return '#2E86AB';
  };

  // Deduplicate edges for Königsberg (same from-to pair drawn with offset)
  const edgePairs: Record<string, number> = {};
  const edgesWithIndex = graph.edges.map((edge) => {
    const key = [edge.from, edge.to].sort().join('-');
    edgePairs[key] = (edgePairs[key] || 0) + 1;
    return { ...edge, pairIndex: edgePairs[key] - 1, pairKey: key };
  });
  const pairCounts: Record<string, number> = {};
  edgesWithIndex.forEach((e) => {
    pairCounts[e.pairKey] = Math.max(pairCounts[e.pairKey] || 0, e.pairIndex + 1);
  });

  return (
    <svg
      viewBox="0 0 420 400"
      className={styles.graphSvg}
      aria-label={`Grafo: ${graph.name}`}
    >
      {/* Aristas */}
      {edgesWithIndex.map((edge, i) => {
        const fromNode = graph.nodes.find((n) => n.id === edge.from);
        const toNode = graph.nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        const total = pairCounts[edge.pairKey];
        const offset = total > 1 ? (edge.pairIndex - (total - 1) / 2) * 18 : 0;

        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ox = len > 0 ? (-dy / len) * offset : 0;
        const oy = len > 0 ? (dx / len) * offset : 0;

        const mx = (fromNode.x + toNode.x) / 2 + ox;
        const my = (fromNode.y + toNode.y) / 2 + oy;

        const edgeKey1 = `${edge.from}-${edge.to}`;
        const edgeKey2 = `${edge.to}-${edge.from}`;
        const isHighlighted = edgeHighlights.includes(edgeKey1) || edgeHighlights.includes(edgeKey2);

        const pathD = offset !== 0
          ? `M ${fromNode.x} ${fromNode.y} Q ${mx} ${my} ${toNode.x} ${toNode.y}`
          : `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;

        return (
          <g key={`edge-${i}`}>
            <path
              d={pathD}
              stroke={isHighlighted ? '#F4A261' : '#2E86AB'}
              strokeWidth={isHighlighted ? 3 : 1.5}
              fill="none"
              opacity={isHighlighted ? 1 : 0.4}
              className={isHighlighted ? styles.edgeHighlighted : ''}
            />
            {graph.id === 'ciudades' && (
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
                className={styles.edgeLabel}
              >
                {edge.weight}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodos */}
      {graph.nodes.map((node) => (
        <g
          key={node.id}
          onClick={() => onNodeClick(node.id)}
          className={styles.graphNode}
          role="button"
          aria-label={`Nodo ${node.label}`}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r={24}
            fill={getNodeColor(node.id)}
            stroke={getNodeStroke(node.id)}
            strokeWidth={2.5}
          />
          <text
            x={node.x}
            y={node.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={graph.id === 'ciudades' ? '8' : '12'}
            fontWeight="600"
            fill={nodeStates[node.id] === 'default' ? '#1A1A1A' : '#FFFFFF'}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ======== COMPONENTE PRINCIPAL ========
export default function VisualizadorTeoriaGrafosPage() {
  const [selectedGraphId, setSelectedGraphId] = useState<string>('ciudades');
  const [selectedSource, setSelectedSource] = useState<string>('MAD');
  const [selectedTarget, setSelectedTarget] = useState<string>('BCN');
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>({});
  const [edgeHighlights, setEdgeHighlights] = useState<string[]>([]);
  const [dijkstraSteps, setDijkstraSteps] = useState<AlgorithmStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepMode, setStepMode] = useState<'auto' | 'manual'>('manual');
  const [selectingNode, setSelectingNode] = useState<'source' | 'target' | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const graph = GRAPHS.find((g) => g.id === selectedGraphId) || GRAPHS[0];
  const properties = computeProperties(graph);

  const handleGraphChange = (id: string) => {
    setSelectedGraphId(id);
    setNodeStates({});
    setEdgeHighlights([]);
    setDijkstraSteps([]);
    setCurrentStep(-1);
    setIsRunning(false);
    setDistances({});
    if (animRef.current) clearTimeout(animRef.current);
    // Resetear nodos seleccionados según el nuevo grafo
    const newGraph = GRAPHS.find((g) => g.id === id);
    if (newGraph && newGraph.nodes.length >= 2) {
      setSelectedSource(newGraph.nodes[0].id);
      setSelectedTarget(newGraph.nodes[newGraph.nodes.length - 1].id);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (selectingNode === 'source') {
      setSelectedSource(nodeId);
      setSelectingNode(null);
    } else if (selectingNode === 'target') {
      setSelectedTarget(nodeId);
      setSelectingNode(null);
    }
  };

  const startDijkstra = useCallback(() => {
    if (selectedSource === selectedTarget) return;
    const steps = runDijkstra(graph, selectedSource, selectedTarget);
    setDijkstraSteps(steps);
    setCurrentStep(0);
    setNodeStates(steps[0]?.nodeStates || {});
    setEdgeHighlights(steps[0]?.edgeHighlights || []);
    setDistances(steps[0]?.distances || {});
    setIsRunning(true);
  }, [graph, selectedSource, selectedTarget]);

  const goToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= dijkstraSteps.length) return;
    setCurrentStep(stepIndex);
    setNodeStates(dijkstraSteps[stepIndex].nodeStates);
    setEdgeHighlights(dijkstraSteps[stepIndex].edgeHighlights);
    setDistances(dijkstraSteps[stepIndex].distances);
  };

  const runAuto = useCallback(() => {
    if (dijkstraSteps.length === 0) {
      const steps = runDijkstra(graph, selectedSource, selectedTarget);
      setDijkstraSteps(steps);
      let i = 0;
      const tick = () => {
        if (i >= steps.length) { setIsRunning(false); return; }
        setCurrentStep(i);
        setNodeStates(steps[i].nodeStates);
        setEdgeHighlights(steps[i].edgeHighlights);
        setDistances(steps[i].distances);
        i++;
        animRef.current = setTimeout(tick, 900);
      };
      tick();
    } else {
      let i = currentStep + 1;
      const tick = () => {
        if (i >= dijkstraSteps.length) { setIsRunning(false); return; }
        setCurrentStep(i);
        setNodeStates(dijkstraSteps[i].nodeStates);
        setEdgeHighlights(dijkstraSteps[i].edgeHighlights);
        setDistances(dijkstraSteps[i].distances);
        i++;
        animRef.current = setTimeout(tick, 900);
      };
      tick();
    }
  }, [graph, selectedSource, selectedTarget, dijkstraSteps, currentStep]);

  const resetDijkstra = () => {
    setDijkstraSteps([]);
    setCurrentStep(-1);
    setNodeStates({});
    setEdgeHighlights([]);
    setDistances({});
    setIsRunning(false);
    if (animRef.current) clearTimeout(animRef.current);
  };

  const formatDist = (d: number) => d === Infinity ? '∞' : d.toString();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🔗</span>
        <h1 className={styles.title}>Visualizador de Teoría de Grafos</h1>
        <p className={styles.subtitle}>
          Explora grafos famosos, ejecuta el algoritmo de Dijkstra paso a paso y descubre propiedades como caminos de Euler y Hamilton
        </p>
      </header>

      <LegalNotice />

      {/* Selector de grafo */}
      <section className={styles.graphSelectorSection}>
        <h2 className={styles.sectionTitle}>Elige un Grafo</h2>
        <div className={styles.graphSelectorGrid}>
          {GRAPHS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`${styles.graphBtn} ${selectedGraphId === g.id ? styles.graphBtnActive : ''}`}
              onClick={() => handleGraphChange(g.id)}
              aria-pressed={selectedGraphId === g.id}
            >
              <span className={styles.graphBtnName}>{g.name}</span>
              <span className={styles.graphBtnDesc}>{g.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Panel principal */}
      <section className={styles.mainPanel}>
        {/* Visualización SVG */}
        <div className={styles.svgPanel}>
          <GraphSVG
            graph={graph}
            nodeStates={nodeStates}
            edgeHighlights={edgeHighlights}
            onNodeClick={handleNodeClick}
            selectedSource={selectedSource}
            selectedTarget={selectedTarget}
          />
          {selectingNode && (
            <div className={styles.selectHint} role="alert" aria-live="polite">
              Haz clic en un nodo para seleccionarlo como {selectingNode === 'source' ? 'origen' : 'destino'}
            </div>
          )}
        </div>

        {/* Propiedades del grafo */}
        <div className={styles.propertiesPanel}>
          <h2 className={styles.panelTitle}>Propiedades del Grafo</h2>
          <div className={styles.propGrid}>
            <div className={styles.propItem}>
              <span className={styles.propLabel}>Nodos (V)</span>
              <span className={styles.propValue}>{properties.nodeCount}</span>
            </div>
            <div className={styles.propItem}>
              <span className={styles.propLabel}>Aristas (E)</span>
              <span className={styles.propValue}>{properties.edgeCount}</span>
            </div>
            <div className={`${styles.propItem} ${properties.isConnected ? styles.propYes : styles.propNo}`}>
              <span className={styles.propLabel}>Conexo</span>
              <span className={styles.propValue}>{properties.isConnected ? 'Sí' : 'No'}</span>
            </div>
            <div className={`${styles.propItem} ${properties.isTree ? styles.propYes : styles.propNo}`}>
              <span className={styles.propLabel}>Es árbol</span>
              <span className={styles.propValue}>{properties.isTree ? 'Sí' : 'No'}</span>
            </div>
            <div className={`${styles.propItem} ${properties.hasEulerCircuit ? styles.propYes : styles.propNo}`}>
              <span className={styles.propLabel}>Circuito Euler</span>
              <span className={styles.propValue}>{properties.hasEulerCircuit ? 'Sí' : 'No'}</span>
            </div>
            <div className={`${styles.propItem} ${properties.hasEulerPath ? styles.propYes : styles.propNo}`}>
              <span className={styles.propLabel}>Camino Euler</span>
              <span className={styles.propValue}>{properties.hasEulerPath ? 'Sí' : 'No'}</span>
            </div>
          </div>

          <h3 className={styles.degreesTitle}>Grado de cada nodo</h3>
          <div className={styles.degreeList}>
            {graph.nodes.map((node) => (
              <div key={node.id} className={styles.degreeItem}>
                <span className={styles.degreeNode}>{node.label}</span>
                <span className={styles.degreeBadge}>{properties.degrees[node.id] ?? 0}</span>
              </div>
            ))}
          </div>

          {graph.id === 'konigsberg' && (
            <div className={styles.konigNote}>
              <strong>Por qué es imposible:</strong> Todos los nodos tienen grado impar. Un camino de Euler requiere exactamente 0 o 2 nodos de grado impar.
            </div>
          )}
        </div>
      </section>

      {/* Algoritmo Dijkstra */}
      <section className={styles.dijkstraSection}>
        <h2 className={styles.sectionTitle}>Algoritmo de Dijkstra</h2>
        <p className={styles.dijkstraIntro}>
          Encuentra el camino más corto entre dos nodos. Haz clic en los botones para seleccionar origen y destino, luego ejecuta el algoritmo.
        </p>

        <div className={styles.dijkstraControls}>
          <div className={styles.nodeSelectRow}>
            <button
              type="button"
              className={`${styles.selectNodeBtn} ${selectingNode === 'source' ? styles.selectNodeBtnActive : ''}`}
              onClick={() => setSelectingNode(selectingNode === 'source' ? null : 'source')}
              aria-pressed={selectingNode === 'source'}
            >
              Origen: <strong>{graph.nodes.find((n) => n.id === selectedSource)?.label || selectedSource}</strong>
            </button>
            <span className={styles.arrow} aria-hidden="true">→</span>
            <button
              type="button"
              className={`${styles.selectNodeBtn} ${selectingNode === 'target' ? styles.selectNodeBtnActive : ''}`}
              onClick={() => setSelectingNode(selectingNode === 'target' ? null : 'target')}
              style={{ borderColor: '#E63946' }}
              aria-pressed={selectingNode === 'target'}
            >
              Destino: <strong>{graph.nodes.find((n) => n.id === selectedTarget)?.label || selectedTarget}</strong>
            </button>
          </div>

          <div className={styles.modeRow}>
            <button
              type="button"
              className={`${styles.modeBtn} ${stepMode === 'manual' ? styles.modeBtnActive : ''}`}
              onClick={() => setStepMode('manual')}
              aria-pressed={stepMode === 'manual'}
            >
              Paso a paso
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${stepMode === 'auto' ? styles.modeBtnActive : ''}`}
              onClick={() => setStepMode('auto')}
              aria-pressed={stepMode === 'auto'}
            >
              Automático
            </button>
          </div>

          <div className={styles.actionRow}>
            {stepMode === 'manual' ? (
              <>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={dijkstraSteps.length === 0 ? startDijkstra : () => goToStep(currentStep - 1)}
                  disabled={dijkstraSteps.length > 0 && currentStep <= 0}
                >
                  {dijkstraSteps.length === 0 ? 'Iniciar' : '← Anterior'}
                </button>
                {dijkstraSteps.length > 0 && (
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => goToStep(currentStep + 1)}
                    disabled={currentStep >= dijkstraSteps.length - 1}
                  >
                    Siguiente →
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={runAuto}
                disabled={isRunning}
              >
                {isRunning ? 'Ejecutando...' : 'Ejecutar animación'}
              </button>
            )}
            <button type="button" className={styles.btnSecondary} onClick={resetDijkstra}>
              Reiniciar
            </button>
          </div>
        </div>

        {/* Step description */}
        {dijkstraSteps.length > 0 && currentStep >= 0 && (
          <div className={styles.stepDisplay} role="alert" aria-live="polite">
            <div className={styles.stepCounter}>
              Paso {currentStep + 1} de {dijkstraSteps.length}
            </div>
            <div className={styles.stepDescription}>
              {dijkstraSteps[currentStep]?.description}
            </div>
          </div>
        )}

        {/* Tabla de distancias */}
        {Object.keys(distances).length > 0 && (
          <div className={styles.distancesPanel}>
            <h3 className={styles.distancesTitle}>Distancias desde {graph.nodes.find((n) => n.id === selectedSource)?.label}</h3>
            <div className={styles.distancesGrid}>
              {graph.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`${styles.distanceItem} ${node.id === selectedTarget ? styles.distanceTarget : ''}`}
                >
                  <span className={styles.distanceNode}>{node.label}</span>
                  <span className={styles.distanceValue}>{formatDist(distances[node.id])}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Leyenda */}
      <section className={styles.legendSection}>
        <h2 className={styles.sectionTitle}>Leyenda de colores</h2>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#2E86AB' }} />
            <span>Nodo origen</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#E63946' }} />
            <span>Nodo destino</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#F4A261' }} />
            <span>Nodo actual / camino mínimo</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#48A9A6' }} />
            <span>Nodo visitado</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#A8DADC' }} />
            <span>En cola de exploración</span>
          </div>
        </div>
      </section>

      {/* Aplicaciones reales */}
      <section className={styles.appsSection}>
        <h2 className={styles.sectionTitle}>Aplicaciones Reales de Grafos</h2>
        <div className={styles.appsGrid}>
          <div className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">🗺️</span>
            <h3>GPS y Rutas</h3>
            <p>Google Maps usa Dijkstra y A* sobre un grafo de millones de intersecciones para calcular rutas óptimas en milisegundos.</p>
          </div>
          <div className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">🌐</span>
            <h3>Enrutamiento en Internet</h3>
            <p>El protocolo BGP que conecta todos los routers de internet es un algoritmo de camino mínimo en un grafo global.</p>
          </div>
          <div className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">👥</span>
            <h3>Redes Sociales</h3>
            <p>Facebook y LinkedIn modelan conexiones como grafos. Los "grados de separación" son distancias BFS en ese grafo.</p>
          </div>
          <div className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">🧬</span>
            <h3>Biología: Redes Metabólicas</h3>
            <p>Las reacciones químicas del metabolismo celular forman un grafo. Los algoritmos de grafos identifican rutas metabólicas clave.</p>
          </div>
          <div className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">🚇</span>
            <h3>Mapas de Metro</h3>
            <p>Cada estación es un nodo, cada conexión una arista. El planificador de viajes en metro es Dijkstra con pesos de tiempo.</p>
          </div>
          <div className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">⚗️</span>
            <h3>Química: Grafos Moleculares</h3>
            <p>Las moléculas se representan como grafos donde los átomos son nodos y los enlaces covalentes son aristas.</p>
          </div>
        </div>
      </section>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="¿Quieres aprender más sobre Teoría de Grafos?"
        subtitle="Desde los Puentes de Königsberg hasta los algoritmos modernos"
        icon="📚"
      >
        {/* Sección 1: ¿Qué es un grafo? */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>¿Qué es un Grafo?</h3>
          <p className={styles.eduParagraph}>
            Un grafo G = (V, E) es una estructura matemática compuesta por un conjunto de <strong>vértices</strong> (o nodos) V y un conjunto de <strong>aristas</strong> (o arcos) E que los conectan. Es la estructura perfecta para modelar relaciones entre entidades.
          </p>
          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>Grafo no dirigido</h4>
              <p>Las aristas no tienen dirección: si existe una arista entre A y B, puedes ir de A a B y de B a A. Ejemplo: red de amistades en Facebook.</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grafo dirigido (dígrafo)</h4>
              <p>Las aristas tienen dirección (flechas). Ejemplo: Twitter (seguir no es recíproco), páginas web (hiperenlaces).</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grafo ponderado</h4>
              <p>Cada arista tiene un peso numérico (distancia, coste, tiempo). Esencial para algoritmos de camino mínimo como Dijkstra.</p>
            </div>
            <div className={styles.conceptCard}>
              <h4>Grafo bipartito</h4>
              <p>Nodos divididos en dos grupos donde las aristas solo conectan grupos distintos. Ejemplo: usuarios y productos (plataformas de recomendación).</p>
            </div>
          </div>
        </section>

        {/* Sección 2: Königsberg */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Los 7 Puentes de Königsberg: El Origen de Todo</h3>
          <p className={styles.eduParagraph}>
            En 1736, Leonhard Euler resolvió el problema de si era posible cruzar los 7 puentes de Königsberg (actual Kaliningrado) pasando exactamente una vez por cada uno. Su solución negativa fundó la teoría de grafos.
          </p>
          <p className={styles.eduParagraph}>
            Euler modeló las masas de tierra como nodos y los puentes como aristas. Demostró que un <strong>camino de Euler</strong> (recorrer todas las aristas exactamente una vez) solo existe si hay exactamente 0 o 2 nodos con grado impar. Como los 4 nodos de Königsberg tienen grado impar, es imposible.
          </p>
          <div className={styles.eulerRule}>
            <strong>Teorema de Euler:</strong>
            <ul className={styles.eulerList}>
              <li><strong>Circuito de Euler</strong> (regresa al origen): todos los nodos tienen grado par</li>
              <li><strong>Camino de Euler</strong> (sin volver al origen): exactamente 2 nodos tienen grado impar</li>
              <li><strong>Imposible</strong>: más de 2 nodos con grado impar (como Königsberg)</li>
            </ul>
          </div>
        </section>

        {/* Sección 3: Euler vs Hamilton */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Euler vs Hamilton: Dos Problemas Distintos</h3>
          <div className={styles.compareGrid}>
            <div className={styles.compareCard}>
              <h4 className={styles.compareTitle} style={{ color: '#2E86AB' }}>Camino de Euler</h4>
              <p>Visita <strong>todas las aristas</strong> exactamente una vez. Los nodos pueden repetirse.</p>
              <p className={styles.compareComplexity}><strong>Complejidad:</strong> O(E) — resoluble en tiempo polinomial</p>
              <p><strong>Condición:</strong> 0 o 2 nodos con grado impar</p>
              <p className={styles.compareExample}><strong>Ejemplo real:</strong> Cartero que recorre todas las calles de un barrio</p>
            </div>
            <div className={styles.compareCard}>
              <h4 className={styles.compareTitle} style={{ color: '#E63946' }}>Camino de Hamilton</h4>
              <p>Visita <strong>todos los nodos</strong> exactamente una vez. Las aristas pueden no usarse.</p>
              <p className={styles.compareComplexity}><strong>Complejidad:</strong> NP-completo — no hay algoritmo eficiente conocido</p>
              <p><strong>Condición:</strong> No existe condición simple equivalente a la de Euler</p>
              <p className={styles.compareExample}><strong>Ejemplo real:</strong> Problema del viajante de comercio (TSP)</p>
            </div>
          </div>
          <p className={styles.eduParagraph} style={{ marginTop: '1rem' }}>
            Esta asimetría es fascinante: dos problemas que parecen similares tienen complejidades computacionales radicalmente distintas. Euler se puede resolver en tiempo lineal; Hamilton es NP-completo (posiblemente imposible de resolver eficientemente para grafos grandes).
          </p>
        </section>

        {/* Sección 4: Dijkstra explicado */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Algoritmo de Dijkstra Explicado</h3>
          <p className={styles.eduParagraph}>
            Edsger Dijkstra publicó su algoritmo en 1959. Resuelve el problema del camino mínimo desde un nodo fuente a todos los demás nodos en un grafo con pesos no negativos.
          </p>
          <div className={styles.stepsList}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Inicialización</h4>
                <p>Distancia del nodo origen = 0. Distancia de todos los demás = ∞. Crear conjunto de nodos no visitados.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Seleccionar el mínimo</h4>
                <p>Del conjunto de nodos no visitados, elegir el que tenga distancia mínima conocida.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Relajar vecinos</h4>
                <p>Para cada vecino del nodo actual: si distancia_actual + peso_arista &lt; distancia_vecino, actualizar distancia_vecino.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Marcar como visitado</h4>
                <p>El nodo procesado nunca volverá a actualizarse (su distancia mínima ya es definitiva).</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Repetir hasta el destino</h4>
                <p>Cuando el destino es el nodo seleccionado en el paso 2, el algoritmo termina.</p>
              </div>
            </div>
          </div>
          <div className={styles.complexityBox}>
            <strong>Complejidad:</strong>
            <ul className={styles.complexityList}>
              <li>Con lista de adyacencia + cola de prioridad: <strong>O((V + E) log V)</strong></li>
              <li>Con matriz de adyacencia: O(V²) — mejor para grafos densos</li>
              <li>V = número de vértices, E = número de aristas</li>
            </ul>
          </div>
        </section>

        {/* Sección 5: Tipos importantes de grafos */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Tipos Importantes de Grafos</h3>
          <div className={styles.typesGrid}>
            <div className={styles.typeCard}>
              <h4>Grafo conexo</h4>
              <p>Existe un camino entre cualquier par de nodos. Si eliminamos un nodo y el grafo queda disconexo, ese nodo es un <em>punto de articulación</em>.</p>
            </div>
            <div className={styles.typeCard}>
              <h4>Árbol</h4>
              <p>Grafo conexo sin ciclos. Siempre tiene exactamente n-1 aristas para n nodos. Ejemplo: estructura de directorios del sistema operativo.</p>
            </div>
            <div className={styles.typeCard}>
              <h4>Grafo completo Kₙ</h4>
              <p>Cada nodo conectado con todos los demás. Tiene n(n-1)/2 aristas. K5 y K3,3 no son planares (no se pueden dibujar sin cruzar aristas).</p>
            </div>
            <div className={styles.typeCard}>
              <h4>Grafo planar</h4>
              <p>Se puede dibujar en un plano sin que las aristas se crucen. Fórmula de Euler: V - E + F = 2 (vértices, aristas, caras). Los mapas geográficos son planares.</p>
            </div>
            <div className={styles.typeCard}>
              <h4>Grafo bipartito</h4>
              <p>Nodos en dos grupos; aristas solo entre grupos. Un grafo es bipartito si y solo si no tiene ciclos impares. Usado en matching y recomendaciones.</p>
            </div>
            <div className={styles.typeCard}>
              <h4>DAG (Grafo Acíclico Dirigido)</h4>
              <p>Grafo dirigido sin ciclos. La base de git commits, dependencias de paquetes npm, pipelines de datos y blockchain.</p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning box */}
        <section className={styles.eduSection}>
          <div className={styles.warningBox}>
            <h3 className={styles.warningTitle}>Dato curioso: El problema que lo inició todo</h3>
            <p>Los 7 Puentes de Königsberg (1736) son el problema que fundó toda la teoría de grafos. Euler demostró que era imposible cruzarlos todos exactamente una vez — no por ensayo y error, sino con una demostración matemática elegante basada en los grados de los nodos. Hoy esa ciudad se llama Kaliningrado y solo quedan 5 de los 7 puentes originales... pero el legado matemático persiste en cada GPS, red social y motor de búsqueda del planeta.</p>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-teoria-grafos')} />
      <ShareCard appName="visualizador-teoria-grafos" />
      <Footer appName="visualizador-teoria-grafos" />
    </div>
  );
}
