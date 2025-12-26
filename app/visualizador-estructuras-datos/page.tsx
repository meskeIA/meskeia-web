'use client';

import { useState, useCallback } from 'react';
import styles from './VisualizadorEstructurasDatos.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
        <section className={styles.infoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>📊 Array (Arreglo)</h3>
              <p>
                Colección ordenada de elementos del mismo tipo almacenados en
                posiciones contiguas de memoria. Acceso directo por índice en O(1).
              </p>
              <code>arr[0] = 5; // Acceso directo</code>
            </div>

            <div className={styles.infoCard}>
              <h3>📚 Stack (Pila)</h3>
              <p>
                Estructura LIFO (Last In, First Out). El último elemento en
                entrar es el primero en salir. Piensa en una pila de platos.
              </p>
              <code>push(x), pop(), peek()</code>
            </div>

            <div className={styles.infoCard}>
              <h3>🚶 Queue (Cola)</h3>
              <p>
                Estructura FIFO (First In, First Out). El primer elemento en
                entrar es el primero en salir. Como una cola de personas.
              </p>
              <code>enqueue(x), dequeue(), front()</code>
            </div>

            <div className={styles.infoCard}>
              <h3>🔗 Lista Enlazada</h3>
              <p>
                Secuencia de nodos donde cada nodo contiene datos y un puntero
                al siguiente. Inserción/eliminación eficiente en cualquier punto.
              </p>
              <code>node.next = newNode;</code>
            </div>

            <div className={styles.infoCard}>
              <h3>🌳 Árbol BST</h3>
              <p>
                Árbol binario donde los valores menores van a la izquierda y
                los mayores a la derecha. Búsqueda eficiente en O(log n).
              </p>
              <code>if (x &lt; node) goLeft();</code>
            </div>

            <div className={styles.infoCard}>
              <h3>⚡ ¿Cuál usar?</h3>
              <p>
                <strong>Array:</strong> Acceso por índice frecuente<br />
                <strong>Stack:</strong> Deshacer, recursión<br />
                <strong>Queue:</strong> Tareas en orden, BFS<br />
                <strong>Lista:</strong> Inserciones/eliminaciones frecuentes<br />
                <strong>BST:</strong> Búsqueda ordenada rápida
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estructuras-datos')} />
      <Footer appName="visualizador-estructuras-datos" />
    </div>
  );
}
