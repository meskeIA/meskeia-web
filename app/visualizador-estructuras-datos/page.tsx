'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './VisualizadorEstructurasDatos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type StructureType = 'array' | 'stack' | 'queue' | 'linkedList' | 'bst';
type AnimationState = 'idle' | 'highlighting' | 'inserting' | 'removing' | 'searching';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id: string;
}

interface LinkedNode {
  value: number;
  id: string;
}

// Generar ID único
const generateId = () => Math.random().toString(36).substring(2, 9);

// Componente principal
export default function VisualizadorEstructurasDatosPage() {
  const [structure, setStructure] = useState<StructureType>('array');
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [message, setMessage] = useState('');
  const [animState, setAnimState] = useState<AnimationState>('idle');
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Estados para cada estructura
  const [arrayData, setArrayData] = useState<number[]>([5, 12, 3, 8, 15, 1, 9]);
  const [stackData, setStackData] = useState<number[]>([10, 25, 7]);
  const [queueData, setQueueData] = useState<number[]>([4, 18, 6, 22]);
  const [linkedList, setLinkedList] = useState<LinkedNode[]>([
    { value: 15, id: generateId() },
    { value: 8, id: generateId() },
    { value: 23, id: generateId() },
  ]);
  const [bst, setBst] = useState<TreeNode | null>(() => {
    // Árbol inicial: 10 como raíz
    const root: TreeNode = { value: 10, left: null, right: null, id: generateId() };
    root.left = { value: 5, left: null, right: null, id: generateId() };
    root.right = { value: 15, left: null, right: null, id: generateId() };
    root.left.left = { value: 3, left: null, right: null, id: generateId() };
    root.left.right = { value: 7, left: null, right: null, id: generateId() };
    root.right.right = { value: 20, left: null, right: null, id: generateId() };
    return root;
  });

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const animate = useCallback((index: number | null, state: AnimationState, duration = 500) => {
    setHighlightIndex(index);
    setAnimState(state);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setAnimState('idle');
        setHighlightIndex(null);
        resolve();
      }, duration);
    });
  }, []);

  const animateById = useCallback((id: string | null, state: AnimationState, duration = 500) => {
    setHighlightId(id);
    setAnimState(state);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setAnimState('idle');
        setHighlightId(null);
        resolve();
      }, duration);
    });
  }, []);

  // ========== ARRAY ==========
  const handleArrayPush = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return showMessage('Introduce un número válido');
    await animate(arrayData.length, 'inserting');
    setArrayData([...arrayData, val]);
    setInputValue('');
    showMessage(`Añadido ${val} al final del array`);
  };

  const handleArrayPop = async () => {
    if (arrayData.length === 0) return showMessage('El array está vacío');
    await animate(arrayData.length - 1, 'removing');
    const removed = arrayData[arrayData.length - 1];
    setArrayData(arrayData.slice(0, -1));
    showMessage(`Eliminado ${removed} del final`);
  };

  const handleArraySearch = async () => {
    const val = parseInt(searchValue);
    if (isNaN(val)) return showMessage('Introduce un número para buscar');
    for (let i = 0; i < arrayData.length; i++) {
      await animate(i, 'searching', 300);
      if (arrayData[i] === val) {
        await animate(i, 'highlighting', 1000);
        return showMessage(`Encontrado ${val} en índice ${i}`);
      }
    }
    showMessage(`${val} no encontrado en el array`);
  };

  // ========== STACK (Pila) ==========
  const handleStackPush = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return showMessage('Introduce un número válido');
    setStackData([val, ...stackData]);
    await animate(0, 'inserting');
    setInputValue('');
    showMessage(`Push: ${val} añadido al tope de la pila`);
  };

  const handleStackPop = async () => {
    if (stackData.length === 0) return showMessage('La pila está vacía');
    await animate(0, 'removing');
    const removed = stackData[0];
    setStackData(stackData.slice(1));
    showMessage(`Pop: ${removed} eliminado del tope`);
  };

  const handleStackPeek = async () => {
    if (stackData.length === 0) return showMessage('La pila está vacía');
    await animate(0, 'highlighting', 1000);
    showMessage(`Peek: El tope es ${stackData[0]}`);
  };

  // ========== QUEUE (Cola) ==========
  const handleQueueEnqueue = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return showMessage('Introduce un número válido');
    setQueueData([...queueData, val]);
    await animate(queueData.length, 'inserting');
    setInputValue('');
    showMessage(`Enqueue: ${val} añadido al final de la cola`);
  };

  const handleQueueDequeue = async () => {
    if (queueData.length === 0) return showMessage('La cola está vacía');
    await animate(0, 'removing');
    const removed = queueData[0];
    setQueueData(queueData.slice(1));
    showMessage(`Dequeue: ${removed} eliminado del frente`);
  };

  const handleQueueFront = async () => {
    if (queueData.length === 0) return showMessage('La cola está vacía');
    await animate(0, 'highlighting', 1000);
    showMessage(`Front: El primero es ${queueData[0]}`);
  };

  // ========== LINKED LIST ==========
  const handleLinkedInsertHead = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return showMessage('Introduce un número válido');
    const newNode = { value: val, id: generateId() };
    setLinkedList([newNode, ...linkedList]);
    await animateById(newNode.id, 'inserting');
    setInputValue('');
    showMessage(`Insertado ${val} al inicio de la lista`);
  };

  const handleLinkedInsertTail = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return showMessage('Introduce un número válido');
    const newNode = { value: val, id: generateId() };
    setLinkedList([...linkedList, newNode]);
    await animateById(newNode.id, 'inserting');
    setInputValue('');
    showMessage(`Insertado ${val} al final de la lista`);
  };

  const handleLinkedRemoveHead = async () => {
    if (linkedList.length === 0) return showMessage('La lista está vacía');
    await animateById(linkedList[0].id, 'removing');
    const removed = linkedList[0].value;
    setLinkedList(linkedList.slice(1));
    showMessage(`Eliminado ${removed} del inicio`);
  };

  // ========== BST (Árbol Binario de Búsqueda) ==========
  const insertBST = (node: TreeNode | null, value: number): TreeNode => {
    if (!node) return { value, left: null, right: null, id: generateId() };
    if (value < node.value) {
      return { ...node, left: insertBST(node.left, value) };
    } else if (value > node.value) {
      return { ...node, right: insertBST(node.right, value) };
    }
    return node; // Duplicado, no insertar
  };

  const handleBstInsert = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return showMessage('Introduce un número válido');
    setBst(insertBST(bst, val));
    setInputValue('');
    showMessage(`Insertado ${val} en el árbol BST`);
  };

  const searchBST = async (node: TreeNode | null, value: number): Promise<boolean> => {
    if (!node) return false;
    await animateById(node.id, 'searching', 400);
    if (value === node.value) {
      await animateById(node.id, 'highlighting', 1000);
      return true;
    }
    if (value < node.value) return searchBST(node.left, value);
    return searchBST(node.right, value);
  };

  const handleBstSearch = async () => {
    const val = parseInt(searchValue);
    if (isNaN(val)) return showMessage('Introduce un número para buscar');
    const found = await searchBST(bst, val);
    showMessage(found ? `Encontrado ${val} en el árbol` : `${val} no está en el árbol`);
  };

  // Renderizar árbol BST
  const renderTree = (node: TreeNode | null, level = 0): React.ReactNode => {
    if (!node) return null;
    const isHighlighted = highlightId === node.id;
    return (
      <div className={styles.treeNode} key={node.id}>
        <div
          className={`${styles.nodeValue} ${isHighlighted ? styles[animState] : ''}`}
        >
          {node.value}
        </div>
        {(node.left || node.right) && (
          <div className={styles.treeChildren}>
            <div className={styles.treeBranch}>
              {node.left && <div className={styles.treeEdge} />}
              {renderTree(node.left, level + 1)}
            </div>
            <div className={styles.treeBranch}>
              {node.right && <div className={styles.treeEdge} />}
              {renderTree(node.right, level + 1)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar estructura según tipo
  const renderStructure = () => {
    switch (structure) {
      case 'array':
        return (
          <div className={styles.arrayContainer}>
            <div className={styles.structureLabel}>Array (índices 0 a {arrayData.length - 1})</div>
            <div className={styles.arrayVisual}>
              {arrayData.map((val, i) => (
                <div
                  key={i}
                  className={`${styles.arrayCell} ${highlightIndex === i ? styles[animState] : ''}`}
                >
                  <span className={styles.cellIndex}>{i}</span>
                  <span className={styles.cellValue}>{val}</span>
                </div>
              ))}
              {arrayData.length === 0 && <span className={styles.empty}>Vacío</span>}
            </div>
          </div>
        );

      case 'stack':
        return (
          <div className={styles.stackContainer}>
            <div className={styles.structureLabel}>Stack (Pila) - LIFO</div>
            <div className={styles.stackVisual}>
              <div className={styles.stackTop}>← TOP</div>
              {stackData.map((val, i) => (
                <div
                  key={i}
                  className={`${styles.stackCell} ${highlightIndex === i ? styles[animState] : ''}`}
                >
                  {val}
                </div>
              ))}
              {stackData.length === 0 && <span className={styles.empty}>Vacía</span>}
            </div>
          </div>
        );

      case 'queue':
        return (
          <div className={styles.queueContainer}>
            <div className={styles.structureLabel}>Queue (Cola) - FIFO</div>
            <div className={styles.queueVisual}>
              <span className={styles.queueLabel}>FRONT →</span>
              {queueData.map((val, i) => (
                <div
                  key={i}
                  className={`${styles.queueCell} ${highlightIndex === i ? styles[animState] : ''}`}
                >
                  {val}
                </div>
              ))}
              <span className={styles.queueLabel}>← REAR</span>
              {queueData.length === 0 && <span className={styles.empty}>Vacía</span>}
            </div>
          </div>
        );

      case 'linkedList':
        return (
          <div className={styles.linkedContainer}>
            <div className={styles.structureLabel}>Lista Enlazada Simple</div>
            <div className={styles.linkedVisual}>
              <span className={styles.linkedLabel}>HEAD →</span>
              {linkedList.map((node, i) => (
                <div key={node.id} className={styles.linkedNodeWrapper}>
                  <div
                    className={`${styles.linkedNode} ${highlightId === node.id ? styles[animState] : ''}`}
                  >
                    <span className={styles.nodeData}>{node.value}</span>
                    <span className={styles.nodePointer}>→</span>
                  </div>
                </div>
              ))}
              <span className={styles.linkedNull}>NULL</span>
              {linkedList.length === 0 && <span className={styles.empty}>Vacía</span>}
            </div>
          </div>
        );

      case 'bst':
        return (
          <div className={styles.bstContainer}>
            <div className={styles.structureLabel}>Árbol Binario de Búsqueda (BST)</div>
            <div className={styles.bstVisual}>
              {bst ? renderTree(bst) : <span className={styles.empty}>Vacío</span>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Renderizar controles según estructura
  const renderControls = () => {
    switch (structure) {
      case 'array':
        return (
          <>
            <div className={styles.controlRow}>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Valor"
                className={styles.input}
              />
              <button onClick={handleArrayPush} className={styles.btnPrimary}>
                Push (añadir)
              </button>
              <button onClick={handleArrayPop} className={styles.btnSecondary}>
                Pop (eliminar)
              </button>
            </div>
            <div className={styles.controlRow}>
              <input
                type="number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar"
                className={styles.input}
              />
              <button onClick={handleArraySearch} className={styles.btnSearch}>
                Buscar
              </button>
            </div>
          </>
        );

      case 'stack':
        return (
          <>
            <div className={styles.controlRow}>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Valor"
                className={styles.input}
              />
              <button onClick={handleStackPush} className={styles.btnPrimary}>
                Push
              </button>
              <button onClick={handleStackPop} className={styles.btnSecondary}>
                Pop
              </button>
              <button onClick={handleStackPeek} className={styles.btnSearch}>
                Peek
              </button>
            </div>
          </>
        );

      case 'queue':
        return (
          <>
            <div className={styles.controlRow}>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Valor"
                className={styles.input}
              />
              <button onClick={handleQueueEnqueue} className={styles.btnPrimary}>
                Enqueue
              </button>
              <button onClick={handleQueueDequeue} className={styles.btnSecondary}>
                Dequeue
              </button>
              <button onClick={handleQueueFront} className={styles.btnSearch}>
                Front
              </button>
            </div>
          </>
        );

      case 'linkedList':
        return (
          <>
            <div className={styles.controlRow}>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Valor"
                className={styles.input}
              />
              <button onClick={handleLinkedInsertHead} className={styles.btnPrimary}>
                Insertar Inicio
              </button>
              <button onClick={handleLinkedInsertTail} className={styles.btnPrimary}>
                Insertar Final
              </button>
              <button onClick={handleLinkedRemoveHead} className={styles.btnSecondary}>
                Eliminar Inicio
              </button>
            </div>
          </>
        );

      case 'bst':
        return (
          <>
            <div className={styles.controlRow}>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Valor"
                className={styles.input}
              />
              <button onClick={handleBstInsert} className={styles.btnPrimary}>
                Insertar
              </button>
            </div>
            <div className={styles.controlRow}>
              <input
                type="number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar"
                className={styles.input}
              />
              <button onClick={handleBstSearch} className={styles.btnSearch}>
                Buscar
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const structures: { type: StructureType; label: string; icon: string }[] = [
    { type: 'array', label: 'Array', icon: '📊' },
    { type: 'stack', label: 'Pila (Stack)', icon: '📚' },
    { type: 'queue', label: 'Cola (Queue)', icon: '🚶' },
    { type: 'linkedList', label: 'Lista Enlazada', icon: '🔗' },
    { type: 'bst', label: 'Árbol BST', icon: '🌳' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📦</span>
        <h1 className={styles.title}>Visualizador de Estructuras de Datos</h1>
        <p className={styles.subtitle}>
          Explora arrays, pilas, colas, listas enlazadas y árboles binarios con animaciones interactivas
        </p>
      </header>

      <LegalNotice />

      {/* Selector de estructura */}
      <section className={styles.selectorSection}>
        <div className={styles.structureSelector}>
          {structures.map((s) => (
            <button
              key={s.type}
              className={`${styles.structureBtn} ${structure === s.type ? styles.structureBtnActive : ''}`}
              onClick={() => setStructure(s.type)}
            >
              <span className={styles.structureIcon}>{s.icon}</span>
              <span className={styles.structureName}>{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Visualización */}
      <section className={styles.visualSection}>
        {renderStructure()}
      </section>

      {/* Controles */}
      <section className={styles.controlsSection}>
        <h2 className={styles.sectionTitle}>Operaciones</h2>
        {renderControls()}
        {message && <div className={styles.message}>{message}</div>}
      </section>

      {/* Información de complejidad */}
      <section className={styles.complexitySection}>
        <h2 className={styles.sectionTitle}>Complejidad Temporal</h2>
        <div className={styles.complexityTable}>
          <table>
            <thead>
              <tr>
                <th>Estructura</th>
                <th>Acceso</th>
                <th>Búsqueda</th>
                <th>Inserción</th>
                <th>Eliminación</th>
              </tr>
            </thead>
            <tbody>
              <tr className={structure === 'array' ? styles.activeRow : ''}>
                <td>Array</td>
                <td>O(1)</td>
                <td>O(n)</td>
                <td>O(n)</td>
                <td>O(n)</td>
              </tr>
              <tr className={structure === 'stack' ? styles.activeRow : ''}>
                <td>Stack</td>
                <td>O(n)</td>
                <td>O(n)</td>
                <td>O(1)</td>
                <td>O(1)</td>
              </tr>
              <tr className={structure === 'queue' ? styles.activeRow : ''}>
                <td>Queue</td>
                <td>O(n)</td>
                <td>O(n)</td>
                <td>O(1)</td>
                <td>O(1)</td>
              </tr>
              <tr className={structure === 'linkedList' ? styles.activeRow : ''}>
                <td>Lista Enlazada</td>
                <td>O(n)</td>
                <td>O(n)</td>
                <td>O(1)*</td>
                <td>O(1)*</td>
              </tr>
              <tr className={structure === 'bst' ? styles.activeRow : ''}>
                <td>BST</td>
                <td>O(log n)</td>
                <td>O(log n)</td>
                <td>O(log n)</td>
                <td>O(log n)</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.tableNote}>
            * O(1) si se tiene referencia al nodo. BST: casos promedio, puede degradar a O(n) si no está balanceado.
          </p>
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre Estructuras de Datos?"
        subtitle="Conceptos fundamentales para programadores"
        icon="📚"
      >
        {/* Sección 1: Tabla Comparativa */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Tabla Comparativa de Estructuras de Datos</h3>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>Estructura</th>
                  <th>Acceso</th>
                  <th>Búsqueda</th>
                  <th>Inserción</th>
                  <th>Eliminación</th>
                  <th>Memoria</th>
                  <th>Uso típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Array</strong></td>
                  <td>O(1)</td>
                  <td>O(n)</td>
                  <td>O(n)</td>
                  <td>O(n)</td>
                  <td>O(n) continua</td>
                  <td>Acceso por índice, cache-friendly</td>
                </tr>
                <tr>
                  <td><strong>Lista Enlazada</strong></td>
                  <td>O(n)</td>
                  <td>O(n)</td>
                  <td>O(1)*</td>
                  <td>O(1)*</td>
                  <td>O(n) + punteros</td>
                  <td>Inserciones/eliminaciones frecuentes</td>
                </tr>
                <tr>
                  <td><strong>Pila (Stack)</strong></td>
                  <td>O(n)</td>
                  <td>O(n)</td>
                  <td>O(1)</td>
                  <td>O(1)</td>
                  <td>O(n)</td>
                  <td>Deshacer, recursión, expresiones</td>
                </tr>
                <tr>
                  <td><strong>Cola (Queue)</strong></td>
                  <td>O(n)</td>
                  <td>O(n)</td>
                  <td>O(1)</td>
                  <td>O(1)</td>
                  <td>O(n)</td>
                  <td>BFS, procesamiento en orden</td>
                </tr>
                <tr>
                  <td><strong>Árbol BST</strong></td>
                  <td>O(log n)</td>
                  <td>O(log n)</td>
                  <td>O(log n)</td>
                  <td>O(log n)</td>
                  <td>O(n)</td>
                  <td>Búsqueda ordenada, rangos</td>
                </tr>
                <tr>
                  <td><strong>Hash Table</strong></td>
                  <td>O(1) amort.</td>
                  <td>O(1) amort.</td>
                  <td>O(1) amort.</td>
                  <td>O(1) amort.</td>
                  <td>O(n) dispersa</td>
                  <td>Diccionarios, cachés, índices</td>
                </tr>
                <tr>
                  <td><strong>Grafo</strong></td>
                  <td>O(1)</td>
                  <td>O(V+E)</td>
                  <td>O(1)</td>
                  <td>O(V+E)</td>
                  <td>O(V+E)</td>
                  <td>Redes, rutas, relaciones</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.eduTableNote}>* O(1) si se tiene referencia directa al nodo. BST casos promedio; puede degradar a O(n) sin balanceo.</p>
        </section>

        {/* Sección 2: Escenarios reales */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Escenarios Reales</h3>
          <div className={styles.scenarioGrid}>
            <div className={styles.scenarioCard}>
              <div className={styles.scenarioHeader}>
                <span className={styles.scenarioIcon}>🌐</span>
                <h4>Navegador web</h4>
              </div>
              <p>El historial usa una Pila (Stack): cada página visitada se apila, el botón atrás hace pop. Las pestañas abiertas usan una lista doblemente enlazada.</p>
              <div className={styles.scenarioTip}>
                <strong>Tip:</strong> Stack para historial, Queue para operaciones pendientes (descarga de imágenes).
              </div>
            </div>

            <div className={styles.scenarioCard}>
              <div className={styles.scenarioHeader}>
                <span className={styles.scenarioIcon}>🔍</span>
                <h4>Motor de búsqueda</h4>
              </div>
              <p>Google usa tablas hash invertidas: palabra → lista de URLs. Con 50.000M páginas, la búsqueda es O(1) en lugar de O(n).</p>
              <div className={styles.scenarioTip}>
                <strong>Tip:</strong> Hash Table cuando necesitas búsqueda O(1) y tienes una clave única.
              </div>
            </div>

            <div className={styles.scenarioCard}>
              <div className={styles.scenarioHeader}>
                <span className={styles.scenarioIcon}>🎮</span>
                <h4>Pathfinding en videojuegos</h4>
              </div>
              <p>A* usa una Cola de Prioridad (heap). En un mapa 1000×1000 con obstáculos, encuentra el camino óptimo en &lt;10ms.</p>
              <div className={styles.scenarioTip}>
                <strong>Tip:</strong> Cola de prioridad para problemas donde siempre procesas el elemento más prioritario.
              </div>
            </div>

            <div className={styles.scenarioCard}>
              <div className={styles.scenarioHeader}>
                <span className={styles.scenarioIcon}>🗺️</span>
                <h4>GPS y redes sociales</h4>
              </div>
              <p>Dijkstra sobre un grafo de 300M nodos (red de carreteras de Europa) encuentra la ruta óptima. LinkedIn representa conexiones como grafo no dirigido ponderado.</p>
              <div className={styles.scenarioTip}>
                <strong>Tip:</strong> Grafo para relaciones complejas muchos-a-muchos con pesos.
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>¿Cuándo usar Array vs Lista Enlazada?</h4>
              <p className={styles.faqAnswer}>Array cuando: acceso por índice frecuente (cache-friendly), tamaño conocido, pocas inserciones en medio. Lista cuando: inserciones/eliminaciones frecuentes en cualquier posición, tamaño desconocido. En la práctica, los arrays casi siempre ganan por localidad de caché.</p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>¿Por qué los Hash Tables tienen O(1) amortizado, no garantizado?</h4>
              <p className={styles.faqAnswer}>Con mala función hash, muchas claves colisionan en el mismo bucket → lista enlazada → O(n) en peor caso. Solución: rehashing cuando el factor de carga supera 0,75.</p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>¿Qué es un árbol balanceado y por qué importa?</h4>
              <p className={styles.faqAnswer}>Un BST degenerado (insertar 1,2,3,4,5 en orden) se convierte en lista enlazada: O(n) búsqueda. AVL y Red-Black Trees garantizan O(log n) mediante rotaciones automáticas.</p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>¿Diferencia entre Stack y Queue?</h4>
              <p className={styles.faqAnswer}>Stack: LIFO (Last In, First Out) — como una pila de platos. Queue: FIFO (First In, First Out) — como una cola del supermercado. Stack para llamadas de función, deshacer. Queue para procesamiento en orden, BFS.</p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>¿Cuándo usar un Heap vs un BST?</h4>
              <p className={styles.faqAnswer}>Heap: cuando solo necesitas el máximo/mínimo rápidamente (O(1) peek, O(log n) insert/delete). BST: cuando necesitas búsqueda por valor arbitrario O(log n). Priority Queue implementa Heap.</p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>¿Qué es la complejidad espacial y por qué importa?</h4>
              <p className={styles.faqAnswer}>El espacio de memoria que usa la estructura. Lista enlazada necesita O(n) nodos + punteros (overhead ×2 vs array). En sistemas embebidos o con millones de objetos, este overhead puede ser crítico.</p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>¿BFS vs DFS en grafos?</h4>
              <p className={styles.faqAnswer}>BFS (Cola): encuentra el camino más corto en grafos no ponderados. Usa O(n) memoria (guarda nivel completo). DFS (Stack/Recursión): explora profundidad, usa menos memoria O(h) donde h es la altura. DFS para detectar ciclos, componentes conexos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>¿Qué es una tabla hash perfecta?</h4>
              <p className={styles.faqAnswer}>Una función hash sin colisiones para un conjunto conocido de claves. Posible cuando las claves son fijas (ej: palabras clave de un lenguaje de programación). gperf genera tablas hash perfectas mínimas.</p>
            </div>
          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Guía Paso a Paso: Cómo Elegir una Estructura</h3>
          <div className={styles.stepsList}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>¿Cómo accedes a los datos?</h4>
                <p>Por índice → Array. Por clave → Hash Table. Secuencialmente → Lista. Jerárquicamente → Árbol.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>¿Qué operación es más frecuente?</h4>
                <p>Búsqueda O(1) → Hash Table. Búsqueda ordenada → BST. Inserción/eliminación → Lista. Min/max → Heap.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>¿Los datos tienen relaciones?</h4>
                <p>Jerárquicas (padre-hijo) → Árbol. Muchos-a-muchos → Grafo. Secuenciales → Array/Lista.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>¿Cuánta memoria tienes?</h4>
                <p>Limitada → Array (sin overhead de punteros). Sin límite → Lista, Árbol.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>¿Necesitas orden?</h4>
                <p>Sí, total → BST o Array ordenado. Sí, parcial (min/max) → Heap. No → Hash Table.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>¿Los datos cambian mucho?</h4>
                <p>Inserciones frecuentes en medio → Lista. Pocas inserciones, muchas lecturas → Array. Dinámico con búsqueda → BST balanceado.</p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Usa la librería del lenguaje</h4>
                <p>Python: list (array dinámico), dict (hash table), heapq (heap). Java: ArrayList, HashMap, TreeMap. C++: vector, unordered_map, priority_queue.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section className={styles.eduSection}>
          <h3 className={styles.eduSectionTitle}>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧠</span>
              <h4>Localidad de caché</h4>
              <p>Arrays son 5-10x más rápidos que listas enlazadas para iteración secuencial por localidad de caché. Prefiere arrays salvo que las inserciones en medio sean críticas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h4>Factor de carga</h4>
              <p>Mantén el factor de carga de Hash Tables entre 0,6-0,75. Sobre 0,8, las colisiones degradan el rendimiento a O(n).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌳</span>
              <h4>Árboles siempre balanceados</h4>
              <p>Nunca implementes BST sin balanceo en producción. Usa TreeMap (Java), SortedDict (Python sortedcontainers) o equivalente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔗</span>
              <h4>Listas doblemente enlazadas</h4>
              <p>Para eliminación O(1) cuando tienes el nodo (LRU Cache usa HashMap + Lista doblemente enlazada). Sola, la lista enlazada rara vez es óptima.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💡</span>
              <h4>Estructura compuesta</h4>
              <p>Los problemas reales usan combinaciones: HashMap&lt;String, BST&gt; para búsqueda de rango por clave, o Array of Linked Lists para hash table con chaining.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <h4>Mide con tus datos reales</h4>
              <p>La complejidad teórica asume distribución uniforme. Mide con tus datos reales: un HashMap puede ser más lento que un Array pequeño por el overhead de hashing.</p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box */}
        <section className={styles.eduSection}>
          <div className={styles.warningBox}>
            <h3 className={styles.warningTitle}>⚠️ Errores comunes con estructuras de datos</h3>
            <ul className={styles.warningList}>
              <li><strong>ArrayList con inserción frecuente en medio:</strong> O(n) por desplazamiento. Con 1M elementos y 1000 inserciones/s, usa LinkedList o deque.</li>
              <li><strong>HashMap sin hashCode() correcto:</strong> En Java/Python, si dos objetos iguales tienen distinto hashCode, tendrás duplicados y comportamiento indefinido.</li>
              <li><strong>BST sin balanceo con datos ordenados:</strong> Insertar 1..N en BST sin balancear → lista enlazada → O(n) búsqueda.</li>
              <li><strong>Stack overflow por DFS recursivo:</strong> En grafos con 100K+ nodos, la recursión puede exceder el stack. Convierte a DFS iterativo con stack explícito.</li>
              <li><strong>Hash Table con claves mutables:</strong> En Python, usar listas como claves de dict lanza TypeError. Los objetos mutables no pueden ser claves hash.</li>
              <li><strong>Ignorar el overhead de memoria:</strong> Lista enlazada con 1M nodos int: 8 bytes dato + 8 bytes puntero siguiente = 2x más memoria que array.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estructuras-datos')} />
      <ShareCard appName="visualizador-estructuras-datos" />
      <Footer appName="visualizador-estructuras-datos" />
    </div>
  );
}
