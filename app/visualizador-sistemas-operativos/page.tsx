'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './SistemasOperativos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabId = 'procesos' | 'scheduling' | 'memoria' | 'ficheros';
type AlgoritmoScheduling = 'FIFO' | 'RR' | 'PRIORIDAD' | 'SJF';
type EstadoProceso = 'nuevo' | 'listo' | 'ejecucion' | 'bloqueado' | 'terminado';
type NodoDir = '/' | '/home' | '/etc' | '/var' | '/bin' | '/tmp';

interface ProcesoGantt {
  id: string;
  nombre: string;
  llegada: number;
  duracion: number;
  prioridad: number;
}

interface BloqueGantt {
  proceso: string;
  inicio: number;
  fin: number;
  color: string;
}

interface MetricasScheduling {
  esperaPromedio: number;
  turnaroundPromedio: number;
  throughput: number;
}

interface InfoNodo {
  permisos: string;
  tipo: string;
  propietario: string;
  grupo: string;
  tamano: string;
  inodo: number;
  hardLinks: number;
  modificado: string;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const TABS: { id: TabId; label: string; icono: string }[] = [
  { id: 'procesos', label: 'Procesos e Hilos', icono: '⚙️' },
  { id: 'scheduling', label: 'Planificación CPU', icono: '📊' },
  { id: 'memoria', label: 'Memoria Virtual', icono: '💾' },
  { id: 'ficheros', label: 'Sistema de Ficheros', icono: '📂' },
];

const PROCESOS_GANTT: ProcesoGantt[] = [
  { id: 'P1', nombre: 'P1', llegada: 0, duracion: 5, prioridad: 2 },
  { id: 'P2', nombre: 'P2', llegada: 1, duracion: 3, prioridad: 1 },
  { id: 'P3', nombre: 'P3', llegada: 2, duracion: 8, prioridad: 3 },
  { id: 'P4', nombre: 'P4', llegada: 3, duracion: 2, prioridad: 1 },
  { id: 'P5', nombre: 'P5', llegada: 4, duracion: 4, prioridad: 2 },
];

const COLORES_PROCESO: Record<string, string> = {
  P1: '#2E86AB',
  P2: '#48A9A6',
  P3: '#7FB3D3',
  P4: '#E8A838',
  P5: '#6B4FBB',
};

const INFO_NODOS: Record<NodoDir, InfoNodo> = {
  '/': {
    permisos: 'drwxr-xr-x',
    tipo: 'Directorio raíz',
    propietario: 'root',
    grupo: 'root',
    tamano: '4.096 B',
    inodo: 2,
    hardLinks: 20,
    modificado: '2025-01-15 09:23',
    descripcion: 'Punto de montaje raíz del sistema de ficheros. Todos los demás directorios parten de aquí.',
  },
  '/home': {
    permisos: 'drwxr-xr-x',
    tipo: 'Directorio usuarios',
    propietario: 'root',
    grupo: 'root',
    tamano: '4.096 B',
    inodo: 131073,
    hardLinks: 4,
    modificado: '2025-01-14 18:42',
    descripcion: 'Contiene los directorios personales de cada usuario del sistema.',
  },
  '/etc': {
    permisos: 'drwxr-xr-x',
    tipo: 'Configuración del sistema',
    propietario: 'root',
    grupo: 'root',
    tamano: '12.288 B',
    inodo: 393217,
    hardLinks: 142,
    modificado: '2025-01-15 07:11',
    descripcion: 'Archivos de configuración del sistema. fstab, passwd, hosts, sshd_config...',
  },
  '/var': {
    permisos: 'drwxr-xr-x',
    tipo: 'Datos variables',
    propietario: 'root',
    grupo: 'root',
    tamano: '4.096 B',
    inodo: 655361,
    hardLinks: 14,
    modificado: '2025-01-15 09:24',
    descripcion: 'Datos que cambian en tiempo de ejecución: logs, colas de email, bases de datos.',
  },
  '/bin': {
    permisos: 'drwxr-xr-x',
    tipo: 'Ejecutables esenciales',
    propietario: 'root',
    grupo: 'root',
    tamano: '4.096 B',
    inodo: 917505,
    hardLinks: 2,
    modificado: '2025-01-10 12:00',
    descripcion: 'Programas binarios esenciales del sistema: ls, cp, mv, bash, grep, cat...',
  },
  '/tmp': {
    permisos: 'drwxrwxrwt',
    tipo: 'Directorio temporal',
    propietario: 'root',
    grupo: 'root',
    tamano: '4.096 B',
    inodo: 1179649,
    hardLinks: 2,
    modificado: '2025-01-15 09:24',
    descripcion: 'Ficheros temporales. Se borra al reiniciar. La "t" final indica sticky bit.',
  },
};

// ─────────────────────────────────────────────
// Algoritmos de scheduling
// ─────────────────────────────────────────────

function calcularFIFO(procesos: ProcesoGantt[]): { bloques: BloqueGantt[]; metricas: MetricasScheduling } {
  const ordenados = [...procesos].sort((a, b) => a.llegada - b.llegada);
  const bloques: BloqueGantt[] = [];
  let tiempo = 0;
  const tiemposEspera: number[] = [];
  const tiemposTurnaround: number[] = [];

  for (const p of ordenados) {
    if (tiempo < p.llegada) tiempo = p.llegada;
    const espera = tiempo - p.llegada;
    tiemposEspera.push(espera);
    bloques.push({ proceso: p.nombre, inicio: tiempo, fin: tiempo + p.duracion, color: COLORES_PROCESO[p.id] });
    tiempo += p.duracion;
    tiemposTurnaround.push(tiempo - p.llegada);
  }

  const esperaPromedio = tiemposEspera.reduce((a, b) => a + b, 0) / tiemposEspera.length;
  const turnaroundPromedio = tiemposTurnaround.reduce((a, b) => a + b, 0) / tiemposTurnaround.length;
  return { bloques, metricas: { esperaPromedio, turnaroundPromedio, throughput: procesos.length / tiempo } };
}

function calcularRR(procesos: ProcesoGantt[], quantum: number): { bloques: BloqueGantt[]; metricas: MetricasScheduling } {
  const bloques: BloqueGantt[] = [];
  const restantes = procesos.map(p => ({ ...p, restante: p.duracion, llegadaReal: p.llegada }));
  const cola: typeof restantes = [];
  let tiempo = 0;
  let completados = 0;
  const tiemposEspera: number[] = new Array(procesos.length).fill(0);
  const tiemposFinalizacion: number[] = new Array(procesos.length).fill(0);

  const agregarLlegados = () => {
    for (const p of restantes) {
      if (p.llegadaReal <= tiempo && p.restante > 0 && !cola.includes(p)) {
        cola.push(p);
      }
    }
  };

  agregarLlegados();

  while (completados < procesos.length) {
    if (cola.length === 0) {
      tiempo++;
      agregarLlegados();
      continue;
    }
    const actual = cola.shift()!;
    const ejecutar = Math.min(quantum, actual.restante);
    bloques.push({ proceso: actual.nombre, inicio: tiempo, fin: tiempo + ejecutar, color: COLORES_PROCESO[actual.id] });
    tiempo += ejecutar;
    actual.restante -= ejecutar;
    agregarLlegados();
    if (actual.restante === 0) {
      completados++;
      const idx = procesos.findIndex(p => p.id === actual.id);
      tiemposFinalizacion[idx] = tiempo;
      tiemposEspera[idx] = tiempo - procesos[idx].llegada - procesos[idx].duracion;
    } else {
      cola.push(actual);
    }
  }

  const esperaPromedio = tiemposEspera.reduce((a, b) => a + b, 0) / tiemposEspera.length;
  const turnaroundPromedio = tiemposFinalizacion.map((f, i) => f - procesos[i].llegada).reduce((a, b) => a + b, 0) / procesos.length;
  return { bloques, metricas: { esperaPromedio, turnaroundPromedio, throughput: procesos.length / tiempo } };
}

function calcularSJF(procesos: ProcesoGantt[]): { bloques: BloqueGantt[]; metricas: MetricasScheduling } {
  const restantes = procesos.map(p => ({ ...p, restante: p.duracion }));
  const bloques: BloqueGantt[] = [];
  let tiempo = 0;
  let completados = 0;
  const tiemposFinalizacion: number[] = new Array(procesos.length).fill(0);

  while (completados < procesos.length) {
    const disponibles = restantes.filter(p => p.llegada <= tiempo && p.restante > 0);
    if (disponibles.length === 0) { tiempo++; continue; }
    disponibles.sort((a, b) => a.restante - b.restante);
    const actual = disponibles[0];
    bloques.push({ proceso: actual.nombre, inicio: tiempo, fin: tiempo + actual.restante, color: COLORES_PROCESO[actual.id] });
    tiempo += actual.restante;
    actual.restante = 0;
    completados++;
    const idx = procesos.findIndex(p => p.id === actual.id);
    tiemposFinalizacion[idx] = tiempo;
  }

  const tiemposEspera = procesos.map((p, i) => tiemposFinalizacion[i] - p.llegada - p.duracion);
  const esperaPromedio = tiemposEspera.reduce((a, b) => a + b, 0) / tiemposEspera.length;
  const turnaroundPromedio = procesos.map((p, i) => tiemposFinalizacion[i] - p.llegada).reduce((a, b) => a + b, 0) / procesos.length;
  return { bloques, metricas: { esperaPromedio, turnaroundPromedio, throughput: procesos.length / tiempo } };
}

function calcularPRIORIDAD(procesos: ProcesoGantt[]): { bloques: BloqueGantt[]; metricas: MetricasScheduling } {
  const restantes = procesos.map(p => ({ ...p, restante: p.duracion }));
  const bloques: BloqueGantt[] = [];
  let tiempo = 0;
  let completados = 0;
  const tiemposFinalizacion: number[] = new Array(procesos.length).fill(0);

  while (completados < procesos.length) {
    const disponibles = restantes.filter(p => p.llegada <= tiempo && p.restante > 0);
    if (disponibles.length === 0) { tiempo++; continue; }
    disponibles.sort((a, b) => a.prioridad - b.prioridad);
    const actual = disponibles[0];
    bloques.push({ proceso: actual.nombre, inicio: tiempo, fin: tiempo + actual.restante, color: COLORES_PROCESO[actual.id] });
    tiempo += actual.restante;
    actual.restante = 0;
    completados++;
    const idx = procesos.findIndex(p => p.id === actual.id);
    tiemposFinalizacion[idx] = tiempo;
  }

  const tiemposEspera = procesos.map((p, i) => tiemposFinalizacion[i] - p.llegada - p.duracion);
  const esperaPromedio = tiemposEspera.reduce((a, b) => a + b, 0) / tiemposEspera.length;
  const turnaroundPromedio = procesos.map((p, i) => tiemposFinalizacion[i] - p.llegada).reduce((a, b) => a + b, 0) / procesos.length;
  return { bloques, metricas: { esperaPromedio, turnaroundPromedio, throughput: procesos.length / tiempo } };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemasOperativos() {
  const [tabActiva, setTabActiva] = useState<TabId>('procesos');
  const [algoritmo, setAlgoritmo] = useState<AlgoritmoScheduling>('RR');
  const [quantum, setQuantum] = useState(2);
  const [estadoProceso, setEstadoProceso] = useState<EstadoProceso>('nuevo');
  const [tamRam, setTamRam] = useState(4096);
  const [nodoSeleccionado, setNodoSeleccionado] = useState<NodoDir>('/');

  // Calcular scheduling según algoritmo
  const resultadoScheduling = useCallback((): { bloques: BloqueGantt[]; metricas: MetricasScheduling } => {
    switch (algoritmo) {
      case 'FIFO': return calcularFIFO(PROCESOS_GANTT);
      case 'RR': return calcularRR(PROCESOS_GANTT, quantum);
      case 'SJF': return calcularSJF(PROCESOS_GANTT);
      case 'PRIORIDAD': return calcularPRIORIDAD(PROCESOS_GANTT);
    }
  }, [algoritmo, quantum]);

  const { bloques, metricas } = resultadoScheduling();
  const tiempoTotal = bloques.length > 0 ? bloques[bloques.length - 1].fin : 1;

  // Transiciones válidas de estados
  const transicionesEstado: Record<EstadoProceso, EstadoProceso[]> = {
    nuevo: ['listo'],
    listo: ['ejecucion'],
    ejecucion: ['listo', 'bloqueado', 'terminado'],
    bloqueado: ['listo'],
    terminado: [],
  };

  const etiquetaEstado: Record<EstadoProceso, string> = {
    nuevo: 'NUEVO',
    listo: 'LISTO',
    ejecucion: 'EN EJECUCIÓN',
    bloqueado: 'BLOQUEADO',
    terminado: 'TERMINADO',
  };

  const colorEstado: Record<EstadoProceso, string> = {
    nuevo: '#48A9A6',
    listo: '#2E86AB',
    ejecucion: '#27AE60',
    bloqueado: '#E8A838',
    terminado: '#999999',
  };

  // Page faults estimados por tamaño de RAM
  const calcularPageFaults = (ramMB: number, algoritmoMem: 'OPT' | 'LRU' | 'FIFO_MEM'): number => {
    const base = 2000;
    const factor = ramMB / 4096;
    const factoresAlgoritmo = { OPT: 0.6, LRU: 0.75, FIFO_MEM: 1.0 };
    return Math.max(10, Math.round(base * (1 - factor * 0.8) * factoresAlgoritmo[algoritmoMem]));
  };

  const nodoInfo = INFO_NODOS[nodoSeleccionado];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>🖥️ Sistemas Operativos</span>
          <h1 className={styles.heroTitle}>Visualizador de Sistemas Operativos</h1>
          <p className={styles.heroSubtitle}>
            Procesos, planificación de CPU, memoria virtual y sistema de ficheros — todo interactivo
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Secciones del visualizador">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActiva === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              <span aria-hidden="true">{tab.icono}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: PROCESOS E HILOS ── */}
        {tabActiva === 'procesos' && (
          <section id="panel-procesos" role="tabpanel" className={styles.panel}>
            <h2 className={styles.panelTitle}>Estados del Proceso</h2>
            <p className={styles.panelDesc}>
              Haz clic en los botones de transición para simular el ciclo de vida de un proceso.
            </p>

            {/* Diagrama SVG de estados */}
            <div className={styles.svgWrapper}>
              <svg viewBox="0 0 700 200" className={styles.svgDiagrama} aria-label="Diagrama de estados del proceso">
                {/* Nodos */}
                {(
                  [
                    { id: 'nuevo', x: 60, y: 100, label: 'NUEVO' },
                    { id: 'listo', x: 210, y: 50, label: 'LISTO' },
                    { id: 'ejecucion', x: 380, y: 50, label: 'EN EJECUCIÓN' },
                    { id: 'bloqueado', x: 380, y: 150, label: 'BLOQUEADO' },
                    { id: 'terminado', x: 570, y: 100, label: 'TERMINADO' },
                  ] as { id: EstadoProceso; x: number; y: number; label: string }[]
                ).map(nodo => (
                  <g key={nodo.id}>
                    <ellipse
                      cx={nodo.x}
                      cy={nodo.y}
                      rx={nodo.id === 'ejecucion' ? 72 : 55}
                      ry={22}
                      fill={estadoProceso === nodo.id ? colorEstado[nodo.id] : '#e8f4f8'}
                      stroke={colorEstado[nodo.id]}
                      strokeWidth={estadoProceso === nodo.id ? 3 : 1.5}
                    />
                    <text
                      x={nodo.x}
                      y={nodo.y + 5}
                      textAnchor="middle"
                      fontSize={nodo.id === 'ejecucion' ? 9 : 10}
                      fontWeight="600"
                      fill={estadoProceso === nodo.id ? '#fff' : '#333'}
                    >
                      {nodo.label}
                    </text>
                  </g>
                ))}

                {/* Flechas — admit */}
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#2E86AB" />
                  </marker>
                </defs>
                {/* nuevo → listo */}
                <line x1="115" y1="90" x2="155" y2="68" stroke="#2E86AB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <text x="120" y="72" fontSize="8" fill="#666">admit</text>
                {/* listo → ejecucion */}
                <line x1="265" y1="50" x2="308" y2="50" stroke="#2E86AB" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <text x="270" y="45" fontSize="8" fill="#666">dispatch</text>
                {/* ejecucion → listo */}
                <path d="M380,28 Q295,10 210,28" stroke="#E8A838" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <text x="285" y="12" fontSize="8" fill="#666">timeout</text>
                {/* ejecucion → bloqueado */}
                <line x1="380" y1="72" x2="380" y2="128" stroke="#E8A838" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <text x="386" y="105" fontSize="8" fill="#666">I/O wait</text>
                {/* bloqueado → listo */}
                <path d="M330,150 Q250,175 210,72" stroke="#48A9A6" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <text x="248" y="175" fontSize="8" fill="#666">I/O complete</text>
                {/* ejecucion → terminado */}
                <line x1="452" y1="65" x2="515" y2="88" stroke="#999" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <text x="468" y="72" fontSize="8" fill="#666">exit</text>
              </svg>
            </div>

            {/* Estado actual y controles */}
            <div className={styles.estadoControl}>
              <div className={styles.estadoActual} style={{ borderColor: colorEstado[estadoProceso] }}>
                <span className={styles.estadoLabel}>Estado actual:</span>
                <span className={styles.estadoBadge} style={{ background: colorEstado[estadoProceso] }}>
                  {etiquetaEstado[estadoProceso]}
                </span>
              </div>
              <div className={styles.transicionesBotones}>
                {transicionesEstado[estadoProceso].map(siguiente => (
                  <button
                    key={siguiente}
                    className={styles.btnTransicion}
                    onClick={() => setEstadoProceso(siguiente)}
                    style={{ borderColor: colorEstado[siguiente], color: colorEstado[siguiente] }}
                  >
                    → {etiquetaEstado[siguiente]}
                  </button>
                ))}
                {estadoProceso === 'terminado' && (
                  <button className={styles.btnReinicio} onClick={() => setEstadoProceso('nuevo')}>
                    Reiniciar proceso
                  </button>
                )}
              </div>
            </div>

            {/* Comparativa proceso vs hilo */}
            <h3 className={styles.subtitulo}>Proceso vs Hilo (Thread)</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Característica</th>
                    <th>Proceso</th>
                    <th>Hilo (Thread)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Espacio de memoria</td>
                    <td>Propio e independiente</td>
                    <td>Compartido con el proceso padre</td>
                  </tr>
                  <tr>
                    <td>Recursos (ficheros, E/S)</td>
                    <td>Propios</td>
                    <td>Compartidos entre hilos</td>
                  </tr>
                  <tr>
                    <td>Comunicación</td>
                    <td>IPC (pipes, sockets, shm)</td>
                    <td>Variables compartidas directas</td>
                  </tr>
                  <tr>
                    <td>Overhead de creación</td>
                    <td>Alto (~1 ms)</td>
                    <td>Bajo (~10 µs)</td>
                  </tr>
                  <tr>
                    <td>Fallo aislado</td>
                    <td>No afecta a otros procesos</td>
                    <td>Puede tumbar todo el proceso</td>
                  </tr>
                  <tr>
                    <td>Cambio de contexto</td>
                    <td>Costoso (PCB completo)</td>
                    <td>Ligero (solo registros de CPU)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.ejemploBox}>
              <h4>Ejemplo: Navegador web</h4>
              <p>
                Un navegador moderno (Chrome, Firefox) ejecuta <strong>1 proceso por pestaña</strong> — cada pestaña
                tiene su propio espacio de memoria aislado. Dentro de cada proceso hay múltiples hilos:
              </p>
              <ul className={styles.listaHilos}>
                <li><strong>Hilo UI</strong> — gestiona la interfaz y eventos del usuario</li>
                <li><strong>Hilo de red</strong> — descarga recursos en paralelo</li>
                <li><strong>Motor JS (V8)</strong> — ejecuta JavaScript</li>
                <li><strong>Motor de render</strong> — pinta la página en pantalla</li>
                <li><strong>Hilo de compositor</strong> — gestiona capas y animaciones CSS</li>
              </ul>
            </div>
          </section>
        )}

        {/* ── TAB: SCHEDULING ── */}
        {tabActiva === 'scheduling' && (
          <section id="panel-scheduling" role="tabpanel" className={styles.panel}>
            <h2 className={styles.panelTitle}>Planificación de CPU</h2>

            {/* Selector de algoritmo */}
            <div className={styles.controles}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Algoritmo:</label>
                <div className={styles.algoBotones}>
                  {(['FIFO', 'RR', 'SJF', 'PRIORIDAD'] as AlgoritmoScheduling[]).map(alg => (
                    <button
                      key={alg}
                      className={`${styles.algoBtn} ${algoritmo === alg ? styles.algoBtnActivo : ''}`}
                      onClick={() => setAlgoritmo(alg)}
                    >
                      {alg === 'RR' ? 'Round Robin' : alg === 'FIFO' ? 'FIFO / FCFS' : alg === 'SJF' ? 'SJF' : 'Prioridad'}
                    </button>
                  ))}
                </div>
              </div>

              {algoritmo === 'RR' && (
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel} htmlFor="quantum-slider">
                    Quantum: <strong>{quantum} ms</strong>
                  </label>
                  <input
                    id="quantum-slider"
                    type="range"
                    min={1}
                    max={5}
                    value={quantum}
                    onChange={e => setQuantum(Number(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              )}
            </div>

            {/* Tabla de procesos */}
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Proceso</th>
                    <th>Llegada (ms)</th>
                    <th>Duración (ms)</th>
                    <th>Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {PROCESOS_GANTT.map(p => (
                    <tr key={p.id}>
                      <td>
                        <span className={styles.colorDot} style={{ background: COLORES_PROCESO[p.id] }} aria-hidden="true" />
                        {p.nombre}
                      </td>
                      <td>{p.llegada}</td>
                      <td>{p.duracion}</td>
                      <td>{p.prioridad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Diagrama de Gantt */}
            <h3 className={styles.subtitulo}>Diagrama de Gantt</h3>
            <div className={styles.ganttWrapper}>
              <svg viewBox={`0 0 ${tiempoTotal * 28 + 60} 60`} className={styles.svgGantt} aria-label="Diagrama de Gantt de planificación de CPU">
                {bloques.map((bloque, i) => {
                  const x = bloque.inicio * 28 + 30;
                  const ancho = (bloque.fin - bloque.inicio) * 28;
                  return (
                    <g key={i}>
                      <rect x={x} y={10} width={ancho} height={30} fill={bloque.color} rx={3} />
                      <text x={x + ancho / 2} y={29} textAnchor="middle" fontSize={10} fill="#fff" fontWeight="600">
                        {bloque.proceso}
                      </text>
                      <text x={x} y={52} textAnchor="middle" fontSize={8} fill="#666">
                        {bloque.inicio}
                      </text>
                    </g>
                  );
                })}
                <text x={tiempoTotal * 28 + 30} y={52} textAnchor="middle" fontSize={8} fill="#666">
                  {tiempoTotal}
                </text>
              </svg>
            </div>

            {/* Métricas */}
            <div className={styles.metricasGrid}>
              <div className={styles.metricaCard}>
                <span className={styles.metricaValor}>{metricas.esperaPromedio.toFixed(1)} ms</span>
                <span className={styles.metricaLabel}>Espera promedio</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaValor}>{metricas.turnaroundPromedio.toFixed(1)} ms</span>
                <span className={styles.metricaLabel}>Turnaround promedio</span>
              </div>
              <div className={styles.metricaCard}>
                <span className={styles.metricaValor}>{(metricas.throughput * 10).toFixed(2)}</span>
                <span className={styles.metricaLabel}>Throughput (proc/10ms)</span>
              </div>
            </div>

            {/* Comparativa algoritmos */}
            <h3 className={styles.subtitulo}>Comparativa de Algoritmos</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Algoritmo</th>
                    <th>Tipo</th>
                    <th>Ventaja principal</th>
                    <th>Desventaja</th>
                    <th>Uso real</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>FIFO / FCFS</strong></td>
                    <td>No expulsivo</td>
                    <td>Simple, sin inanición</td>
                    <td>Convoy effect (procesos largos bloquean)</td>
                    <td>Impresoras, colas simples</td>
                  </tr>
                  <tr>
                    <td><strong>Round Robin</strong></td>
                    <td>Expulsivo</td>
                    <td>Equitativo, buen tiempo de respuesta</td>
                    <td>Overhead por cambios de contexto</td>
                    <td>SO de propósito general (Linux, Windows)</td>
                  </tr>
                  <tr>
                    <td><strong>SJF</strong></td>
                    <td>No expulsivo</td>
                    <td>Mínimo tiempo de espera promedio</td>
                    <td>Inanición; necesita conocer duración</td>
                    <td>Sistemas batch</td>
                  </tr>
                  <tr>
                    <td><strong>Prioridad</strong></td>
                    <td>Expulsivo / No exp.</td>
                    <td>Flexibilidad y control</td>
                    <td>Inanición de prioridad baja</td>
                    <td>Tiempo real, SO embebidos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── TAB: MEMORIA ── */}
        {tabActiva === 'memoria' && (
          <section id="panel-memoria" role="tabpanel" className={styles.panel}>
            <h2 className={styles.panelTitle}>Memoria Virtual y Paginación</h2>

            <div className={styles.controles}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel} htmlFor="ram-slider">
                  Tamaño de RAM: <strong>{tamRam >= 1024 ? `${tamRam / 1024} GB` : `${tamRam} MB`}</strong>
                </label>
                <input
                  id="ram-slider"
                  type="range"
                  min={128}
                  max={8192}
                  step={128}
                  value={tamRam}
                  onChange={e => setTamRam(Number(e.target.value))}
                  className={styles.slider}
                />
                <div className={styles.sliderLimites}>
                  <span>128 MB</span>
                  <span>8 GB</span>
                </div>
              </div>
            </div>

            {/* Mapa de memoria virtual */}
            <h3 className={styles.subtitulo}>Espacio de Direcciones Virtual (proceso 32 bits)</h3>
            <div className={styles.mapaMemoria}>
              {[
                { label: 'Kernel (reservado)', color: '#c0392b', desde: '3.0 GB', hasta: '4.0 GB', desc: 'Espacio del SO — inaccesible desde user space' },
                { label: 'Pila (Stack)', color: '#2E86AB', desde: '2.5 GB', hasta: '3.0 GB', desc: 'Variables locales, llamadas a función — crece hacia abajo' },
                { label: 'Espacio libre / Mmap', color: '#e8f4f8', desde: '1.2 GB', hasta: '2.5 GB', desc: 'Ficheros mapeados, librerías dinámicas (.so/.dll)' },
                { label: 'Heap (montón)', color: '#48A9A6', desde: '0.5 GB', hasta: '1.2 GB', desc: 'malloc/new — crece hacia arriba' },
                { label: 'Datos + BSS', color: '#7FB3D3', desde: '0.2 GB', hasta: '0.5 GB', desc: 'Variables globales e inicializadas' },
                { label: 'Código (Text)', color: '#6B4FBB', desde: '0.0 GB', hasta: '0.2 GB', desc: 'Instrucciones del programa — solo lectura' },
              ].map(seg => (
                <div key={seg.label} className={styles.segmentoMemoria} style={{ background: seg.color === '#e8f4f8' ? undefined : seg.color }}>
                  <span className={styles.segLabel} style={{ color: seg.color === '#e8f4f8' ? '#666' : '#fff' }}>
                    {seg.label}
                  </span>
                  <span className={styles.segRango} style={{ color: seg.color === '#e8f4f8' ? '#999' : 'rgba(255,255,255,0.8)' }}>
                    {seg.desde} – {seg.hasta}
                  </span>
                  <span className={styles.segDesc} style={{ color: seg.color === '#e8f4f8' ? '#666' : 'rgba(255,255,255,0.85)' }}>
                    {seg.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* Tabla de páginas simplificada */}
            <h3 className={styles.subtitulo}>Tabla de Páginas (ejemplo, página = 4 KB)</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Página virtual</th>
                    <th>Marco físico</th>
                    <th>Presente</th>
                    <th>Acceso</th>
                    <th>Modificado</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { virt: '0x0000', marco: '0x1A3F', presente: true, acceso: 'r-x', mod: false },
                    { virt: '0x1000', marco: '0x0B12', presente: true, acceso: 'rw-', mod: true },
                    { virt: '0x2000', marco: '—', presente: false, acceso: '---', mod: false },
                    { virt: '0x3000', marco: '0x2C07', presente: true, acceso: 'rw-', mod: false },
                    { virt: '0x4000', marco: '—', presente: false, acceso: '---', mod: false },
                    { virt: '0x5000', marco: '0x3D91', presente: true, acceso: 'r--', mod: false },
                  ].map(fila => (
                    <tr key={fila.virt} className={!fila.presente ? styles.filaPaginaFalta : ''}>
                      <td><code>{fila.virt}</code></td>
                      <td><code>{fila.marco}</code></td>
                      <td>{fila.presente ? '✅ Sí' : '❌ Page Fault'}</td>
                      <td><code>{fila.acceso}</code></td>
                      <td>{fila.mod ? '✏️ Sí' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Gráfica page faults vs RAM */}
            <h3 className={styles.subtitulo}>Page Faults vs Tamaño de RAM</h3>
            <div className={styles.graficaWrapper}>
              <svg viewBox="0 0 500 180" className={styles.svgGrafica} aria-label="Gráfica de page faults en función del tamaño de RAM">
                {/* Ejes */}
                <line x1="50" y1="10" x2="50" y2="150" stroke="#ccc" strokeWidth="1.5" />
                <line x1="50" y1="150" x2="480" y2="150" stroke="#ccc" strokeWidth="1.5" />
                <text x="25" y="155" fontSize="9" fill="#999">0</text>
                <text x="10" y="15" fontSize="9" fill="#999" transform="rotate(-90, 10, 80)">Page faults</text>
                <text x="250" y="168" fontSize="9" fill="#999" textAnchor="middle">Tamaño de RAM (MB)</text>

                {/* Etiquetas eje X */}
                {[128, 1024, 2048, 4096, 8192].map((ram, i) => {
                  const x = 50 + (i / 4) * 430;
                  return (
                    <text key={ram} x={x} y={162} fontSize="8" fill="#999" textAnchor="middle">
                      {ram >= 1024 ? `${ram / 1024}G` : `${ram}M`}
                    </text>
                  );
                })}

                {/* Líneas de algoritmos */}
                {(['OPT', 'LRU', 'FIFO_MEM'] as const).map((alg, algIdx) => {
                  const colores = ['#2E86AB', '#48A9A6', '#E8A838'];
                  const ramsRef = [128, 512, 1024, 2048, 4096, 8192];
                  const maxFaults = calcularPageFaults(128, 'FIFO_MEM');
                  const puntos = ramsRef.map((ram, i) => {
                    const x = 50 + (i / 5) * 430;
                    const faults = calcularPageFaults(ram, alg);
                    const y = 150 - (faults / maxFaults) * 130;
                    return `${x},${y}`;
                  });
                  return (
                    <g key={alg}>
                      <polyline points={puntos.join(' ')} fill="none" stroke={colores[algIdx]} strokeWidth="2" />
                      <text x={460} y={150 - (calcularPageFaults(8192, alg) / maxFaults) * 130} fontSize="9" fill={colores[algIdx]}>
                        {alg === 'FIFO_MEM' ? 'FIFO' : alg}
                      </text>
                    </g>
                  );
                })}

                {/* Marcador RAM actual */}
                {(() => {
                  const ramsRef = [128, 512, 1024, 2048, 4096, 8192];
                  const idx = ramsRef.findIndex(r => r >= tamRam);
                  const safeIdx = idx < 0 ? 5 : Math.max(0, idx - 1);
                  const x = 50 + (safeIdx / 5) * 430;
                  return <line x1={x} y1={10} x2={x} y2={150} stroke="#c0392b" strokeWidth="1.5" strokeDasharray="4,3" />;
                })()}
              </svg>
              <p className={styles.graficaNota}>
                Línea roja = RAM seleccionada ({tamRam >= 1024 ? `${tamRam / 1024} GB` : `${tamRam} MB`}). OPT = algoritmo óptimo (teórico).
              </p>
            </div>

            <div className={styles.warningBox}>
              <strong>¿Por qué 32 bits = máx. 4 GB de RAM?</strong>
              <p>
                Un registro de 32 bits puede direccionar 2³² = 4.294.967.296 posiciones únicas = 4 GB.
                Con 64 bits, el límite teórico es 2⁶⁴ = 16 exabytes, aunque los procesadores modernos usan
                48 bits efectivos (256 TB por proceso).
              </p>
            </div>
          </section>
        )}

        {/* ── TAB: FICHEROS ── */}
        {tabActiva === 'ficheros' && (
          <section id="panel-ficheros" role="tabpanel" className={styles.panel}>
            <h2 className={styles.panelTitle}>Sistema de Ficheros</h2>

            <div className={styles.ficheroLayout}>
              {/* Árbol de directorios */}
              <div className={styles.arbolDir}>
                <h3 className={styles.subtitulo}>Árbol de directorios (Unix)</h3>
                <ul className={styles.arbol} role="tree">
                  {(Object.keys(INFO_NODOS) as NodoDir[]).map(nodo => (
                    <li key={nodo} role="treeitem" aria-selected={nodoSeleccionado === nodo}>
                      <button
                        className={`${styles.nodoBtn} ${nodoSeleccionado === nodo ? styles.nodoBtnActivo : ''}`}
                        onClick={() => setNodoSeleccionado(nodo)}
                      >
                        <span aria-hidden="true">{nodo === '/' ? '🖥️' : nodo === '/home' ? '👤' : nodo === '/etc' ? '⚙️' : nodo === '/var' ? '📋' : nodo === '/bin' ? '⚡' : '🗑️'}</span>
                        {nodo}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inodo */}
              <div className={styles.inodoPanel}>
                <h3 className={styles.subtitulo}>Inodo de <code>{nodoSeleccionado}</code></h3>
                <div className={styles.inodoGrid}>
                  <div className={styles.inodoCampo}>
                    <span className={styles.inodoKey}>Tipo</span>
                    <span className={styles.inodoVal}>{nodoInfo.tipo}</span>
                  </div>
                  <div className={styles.inodoCampo}>
                    <span className={styles.inodoKey}>Nº inodo</span>
                    <span className={styles.inodoVal}><code>{nodoInfo.inodo}</code></span>
                  </div>
                  <div className={styles.inodoCampo}>
                    <span className={styles.inodoKey}>Permisos</span>
                    <span className={styles.inodoVal}><code className={styles.permisos}>{nodoInfo.permisos}</code></span>
                  </div>
                  <div className={styles.inodoCampo}>
                    <span className={styles.inodoKey}>Propietario</span>
                    <span className={styles.inodoVal}>{nodoInfo.propietario}:{nodoInfo.grupo}</span>
                  </div>
                  <div className={styles.inodoCampo}>
                    <span className={styles.inodoKey}>Tamaño</span>
                    <span className={styles.inodoVal}>{nodoInfo.tamano}</span>
                  </div>
                  <div className={styles.inodoCampo}>
                    <span className={styles.inodoKey}>Hard links</span>
                    <span className={styles.inodoVal}>{nodoInfo.hardLinks}</span>
                  </div>
                  <div className={styles.inodoCampo}>
                    <span className={styles.inodoKey}>Modificado</span>
                    <span className={styles.inodoVal}>{nodoInfo.modificado}</span>
                  </div>
                </div>
                <p className={styles.inodoDesc}>{nodoInfo.descripcion}</p>

                {/* Permisos visuales */}
                <div className={styles.permisosVisuales}>
                  <span className={styles.permisosLabel}>d</span>
                  {['rwx', 'r-x', 'r-x'].map((grupo, gi) => (
                    <span key={gi} className={styles.permisosGrupo}>
                      {grupo.split('').map((c, ci) => (
                        <span key={ci} className={`${styles.permisoBit} ${c !== '-' ? styles.permisoActivo : ''}`}>
                          {c !== '-' ? c : '–'}
                        </span>
                      ))}
                    </span>
                  ))}
                  <span className={styles.permisosLeyenda}>d = dir · rwx = propietario · r-x = grupo · r-x = otros</span>
                </div>
              </div>
            </div>

            {/* Journaling */}
            <h3 className={styles.subtitulo}>Journaling: Consistencia ante fallos</h3>
            <div className={styles.journalingBox}>
              <div className={styles.journalingPasos}>
                {[
                  { paso: 1, label: 'Begin', desc: 'El journal registra el inicio de la transacción', estado: 'ok' },
                  { paso: 2, label: 'Write metadata', desc: 'Se escribe el cambio de inodo en el log primero', estado: 'ok' },
                  { paso: 3, label: 'Write data', desc: 'Los datos se escriben en el bloque de disco', estado: 'ok' },
                  { paso: 4, label: 'Commit', desc: 'El journal marca la transacción como completada', estado: 'ok' },
                  { paso: 5, label: 'Checkpoint', desc: 'Los cambios se propagan al sistema de ficheros real', estado: 'ok' },
                ].map(p => (
                  <div key={p.paso} className={styles.journalingPaso}>
                    <div className={styles.journalingNumero}>{p.paso}</div>
                    <div className={styles.journalingInfo}>
                      <strong>{p.label}</strong>
                      <span>{p.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.journalingNota}>
                Si el sistema falla entre los pasos 1-3, el journal permite repetir o deshacer la transacción al
                reiniciar. Sin journaling (FAT32), un fallo de corriente puede dejar el sistema de ficheros corrupto.
              </p>
            </div>

            {/* Comparativa sistemas de ficheros */}
            <h3 className={styles.subtitulo}>Comparativa de Sistemas de Ficheros</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Sistema</th>
                    <th>Tamaño máx. fichero</th>
                    <th>Journaling</th>
                    <th>Permisos Unix</th>
                    <th>Compresión</th>
                    <th>SO principal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>FAT32</strong></td>
                    <td>4 GB − 1 byte</td>
                    <td>❌ No</td>
                    <td>❌ No</td>
                    <td>❌ No</td>
                    <td>Pendrives, SD, legacy</td>
                  </tr>
                  <tr>
                    <td><strong>NTFS</strong></td>
                    <td>16 TB (práctico)</td>
                    <td>✅ Sí</td>
                    <td>✅ ACLs</td>
                    <td>✅ Nativa</td>
                    <td>Windows</td>
                  </tr>
                  <tr>
                    <td><strong>ext4</strong></td>
                    <td>16 TB</td>
                    <td>✅ Sí</td>
                    <td>✅ rwxrwxrwx</td>
                    <td>❌ No nativa</td>
                    <td>Linux (default)</td>
                  </tr>
                  <tr>
                    <td><strong>APFS</strong></td>
                    <td>8 EB</td>
                    <td>✅ Copy-on-Write</td>
                    <td>✅ Sí</td>
                    <td>✅ Nativa</td>
                    <td>macOS, iOS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Cómo funcionan los sistemas operativos?"
        subtitle="Del hardware al proceso: la capa invisible que hace posible todo lo demás"
        icon="🖥️"
        defaultOpen={false}
      >
        {/* ── 1. TABLA COMPARATIVA: Sistemas de Ficheros ── */}
        <h3 className={styles.eduHeading}>Comparativa de sistemas de ficheros</h3>
        <p className={styles.eduIntro}>
          El sistema de ficheros determina cómo se organizan y protegen los datos en disco.
          Cada SO usa uno distinto, con capacidades muy diferentes:
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Sistema de ficheros</th>
                <th>SO principal</th>
                <th>Tamaño máx. fichero</th>
                <th>Journaling</th>
                <th>Permisos Unix</th>
                <th>Cifrado nativo</th>
                <th>Año</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>FAT32</strong></td>
                <td>Pendrives, SD, legacy</td>
                <td>4 GB − 1 byte</td>
                <td>❌ No</td>
                <td>❌ No</td>
                <td>❌ No</td>
                <td>1996</td>
              </tr>
              <tr>
                <td><strong>NTFS</strong></td>
                <td>Windows</td>
                <td>16 TB (práctico)</td>
                <td>✅ Sí</td>
                <td>✅ ACLs</td>
                <td>✅ BitLocker</td>
                <td>1993</td>
              </tr>
              <tr>
                <td><strong>ext4</strong></td>
                <td>Linux (default)</td>
                <td>16 TB</td>
                <td>✅ Sí</td>
                <td>✅ rwxrwxrwx</td>
                <td>❌ No nativa</td>
                <td>2008</td>
              </tr>
              <tr>
                <td><strong>APFS</strong></td>
                <td>macOS, iOS</td>
                <td>8 EB</td>
                <td>✅ Copy-on-Write</td>
                <td>✅ Sí</td>
                <td>✅ FileVault 2</td>
                <td>2017</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── 2. CASOS DE USO ── */}
        <h3 className={styles.eduHeading}>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
            <h4>Estudiante de informática</h4>
            <p>
              Preparas un examen de Sistemas Operativos y necesitas entender de verdad la diferencia
              entre Round Robin y FIFO, o qué ocurre paso a paso cuando hay un page fault. Los diagramas
              interactivos sustituyen horas de teoría abstracta.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">💻</span>
            <h4>Desarrollador con bugs de concurrencia</h4>
            <p>
              Tu aplicación se bloquea de forma intermitente y sospechas un deadlock o una condición de
              carrera entre hilos. El diagrama de estados de procesos te ayuda a visualizar las transiciones
              y entender cuándo un proceso queda atrapado en estado bloqueado.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🖧</span>
            <h4>Administrador de sistemas Linux</h4>
            <p>
              Optimizas un servidor y necesitas decidir entre algoritmos de scheduling, elegir el sistema
              de ficheros correcto para un volumen crítico o entender por qué el swap está saturado.
              La comparativa de page faults por tamaño de RAM es especialmente útil.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🔍</span>
            <h4>Curioso que quiere entender su ordenador</h4>
            <p>
              Siempre te has preguntado qué hace el ordenador mientras espera que cargue una app, o por
              qué abrir demasiadas pestañas del navegador se come la RAM. Este visualizador te da la
              respuesta sin que necesites saber programar.
            </p>
          </div>
        </div>

        {/* ── 3. FAQ ── */}
        <h3 className={styles.eduHeading}>Preguntas frecuentes</h3>
        <dl className={styles.faqList}>
          <div className={styles.faqItem}>
            <dt>¿Qué diferencia hay entre un proceso y un hilo (thread)?</dt>
            <dd>
              Un <strong>proceso</strong> es un programa en ejecución con su propio espacio de memoria aislado.
              Un <strong>hilo</strong> es una unidad de ejecución dentro de un proceso — comparte la memoria
              con los demás hilos del mismo proceso. Crear un hilo cuesta ~10 µs; crear un proceso, ~1 ms.
              Si un hilo falla sin control puede tumbar todo el proceso, pero si falla un proceso no afecta
              a los demás.
              <span className={styles.faqTip}>Ejemplo: Chrome ejecuta 1 proceso por pestaña y varios hilos dentro de cada uno (UI, red, JS, render).</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Por qué Round Robin es el algoritmo de scheduling más usado?</dt>
            <dd>
              Porque es el más <strong>equitativo</strong>: ningún proceso acapara la CPU indefinidamente.
              Cada proceso recibe un quantum de tiempo (típicamente 10-100 ms) y luego cede la CPU al
              siguiente. Esto garantiza tiempos de respuesta aceptables para todos los procesos y es
              especialmente adecuado para sistemas de propósito general como Linux o Windows, donde
              conviven procesos interactivos (requieren respuesta rápida) con procesos de fondo
              (toleran espera).
              <span className={styles.faqTip}>El quantum de Linux varía entre 10 ms y 200 ms según la prioridad del proceso.</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Qué es un page fault y es siempre un error?</dt>
            <dd>
              Un page fault ocurre cuando un proceso intenta acceder a una página de memoria que no está
              cargada en RAM en ese momento. <strong>No es necesariamente un error</strong>: es el mecanismo
              normal de la memoria virtual. El SO detiene el proceso, carga la página desde disco (swap),
              y reanuda la ejecución. Se convierte en problema cuando hay demasiados page faults por segundo
              (<em>thrashing</em>), lo que significa que el sistema está constantemente paginando y la
              CPU dedica más tiempo a gestionar páginas que a ejecutar código útil.
              <span className={styles.faqTip}>Un PC moderno puede tolerar miles de page faults por segundo sin notar degradación.</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Por qué 32 bits solo pueden usar 4 GB de RAM?</dt>
            <dd>
              Un registro de 32 bits puede representar 2³² = 4.294.967.296 valores distintos. Como cada
              valor representa una dirección de memoria de 1 byte, el máximo direccionable es exactamente
              4 GB. Con 64 bits, el límite teórico sube a 2⁶⁴ = 16 exabytes, aunque los procesadores
              actuales usan 48 bits efectivos (256 TB por proceso). Por eso instalar más de 4 GB de RAM
              en un sistema de 32 bits es inútil: el SO sencillamente no puede acceder a esa memoria.
              <span className={styles.faqTip}>Algunos SO de 32 bits usaban PAE para alcanzar hasta 64 GB, pero con límites por proceso de 4 GB.</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Qué es un kernel y qué diferencia hay con el espacio de usuario?</dt>
            <dd>
              El <strong>kernel</strong> es el núcleo del SO: el único software que tiene acceso directo
              al hardware (CPU, RAM, dispositivos). Se ejecuta en modo privilegiado (<em>kernel space</em>).
              El resto de programas (navegador, editor, juego) se ejecutan en <em>user space</em> con
              acceso restringido. Para acceder al hardware, hacen una <strong>llamada al sistema</strong>
              (syscall) que le pide al kernel que lo haga en su nombre. Esta separación protege la
              estabilidad: si tu app falla, el kernel sigue funcionando.
              <span className={styles.faqTip}>Linux tiene ~400 syscalls distintas. `open()`, `read()`, `write()` y `fork()` son las más frecuentes.</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Qué es un deadlock y cómo se evita?</dt>
            <dd>
              Un <strong>deadlock</strong> (interbloqueo) ocurre cuando dos o más procesos se bloquean
              mutuamente esperando recursos que el otro tiene. Las cuatro condiciones necesarias son:
              exclusión mutua, retención y espera, no expropiación y espera circular. Para evitarlo se
              usan técnicas como ordenación de recursos (siempre pedir A antes que B), timeouts en la
              adquisición de locks, o algoritmos de detección y recuperación.
              <span className={styles.faqTip}>Los deadlocks en bases de datos son comunes; los SGBD los detectan automáticamente y abortan una transacción.</span>
            </dd>
          </div>
        </dl>

        {/* ── 4. GUÍA PASO A PASO ── */}
        <h3 className={styles.eduHeading}>Del clic al píxel: qué ocurre cuando abres una aplicación</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">1</span>
            <div className={styles.stepContent}>
              <strong>El SO crea un nuevo proceso</strong>
              <p>
                El kernel llama a <code>fork()</code> + <code>exec()</code> (Unix) o <code>CreateProcess()</code>
                (Windows). Se reserva un PCB (Process Control Block) con el estado inicial del proceso:
                PID, prioridad, tabla de páginas vacía, descriptores de fichero (stdin, stdout, stderr).
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">2</span>
            <div className={styles.stepContent}>
              <strong>Carga del ejecutable en memoria virtual</strong>
              <p>
                El cargador (<em>loader</em>) mapea el fichero ejecutable en el espacio de direcciones
                virtual del proceso. Las páginas de código y datos <strong>no se cargan en RAM todavía</strong>:
                se producirán page faults bajo demanda cuando el proceso intente acceder a ellas por primera vez.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">3</span>
            <div className={styles.stepContent}>
              <strong>El planificador encola el proceso</strong>
              <p>
                El proceso pasa al estado <strong>LISTO</strong> y el scheduler lo añade a la cola de
                procesos listos. En Linux, el CFS (Completely Fair Scheduler) le asigna un tiempo de
                ejecución proporcional a su prioridad (<em>nice value</em>). Cuando le toca, la CPU
                hace un cambio de contexto y comienza la ejecución.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">4</span>
            <div className={styles.stepContent}>
              <strong>Ejecución e I/O: procesos bloqueados y reanudados</strong>
              <p>
                Cada vez que la app necesita leer un fichero, conectarse a la red o esperar entrada del
                usuario, hace una syscall y pasa a estado <strong>BLOQUEADO</strong>. La CPU queda libre
                para ejecutar otro proceso. Cuando la operación I/O termina, una interrupción del hardware
                despierta al proceso: vuelve a LISTO y espera su turno de CPU.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">5</span>
            <div className={styles.stepContent}>
              <strong>Render y presentación en pantalla</strong>
              <p>
                La app escribe píxeles en un <em>framebuffer</em> compartido con el compositor del SO
                (Compositor de Windows, Wayland/X11 en Linux, Quartz en macOS). El compositor combina
                todas las ventanas en una imagen final y la envía a la GPU, que la muestra en pantalla.
                Este proceso ocurre típicamente 60 veces por segundo (60 Hz).
              </p>
            </div>
          </li>
        </ol>

        {/* ── 5. MEJORES PRÁCTICAS ── */}
        <h3 className={styles.eduHeading}>Claves para entender los SO a fondo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔬</span>
            <h4>Estudia desde lo concreto</h4>
            <p>
              Ejecuta <code>htop</code> o el Administrador de tareas mientras abres apps y observa
              cómo cambian los procesos en tiempo real. Ver el scheduling en vivo es más útil que
              memorizar fórmulas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <h4>Prioridad al scheduling correcto</h4>
            <p>
              Para elegir algoritmo: si la latencia importa (UI, juegos) usa Round Robin con quantum
              pequeño; si el throughput importa (servidores batch) usa SJF o FIFO; si hay procesos
              críticos usa prioridades con aging para evitar inanición.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💾</span>
            <h4>El swap no es RAM extra gratuita</h4>
            <p>
              Usar swap es entre 100x y 1000x más lento que RAM. Si el sistema está constantemente
              en swap, la solución es añadir más RAM, no más swap. El swap es solo un salvavidas
              de emergencia.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔒</span>
            <h4>Los permisos Unix son sencillos pero potentes</h4>
            <p>
              Aprende a leer <code>rwxr-xr-x</code> de derecha a izquierda: otros → grupo → propietario.
              Nunca des permisos 777 en producción. El principio de mínimo privilegio es la base
              de la seguridad Unix.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧩</span>
            <h4>Entiende el kernel antes que las APIs</h4>
            <p>
              Todo framework, lenguaje o librería acaba llamando a syscalls del kernel. Saber qué
              ocurre por debajo te ayuda a diagnosticar problemas que las abstracciones de alto
              nivel ocultan: cuellos de botella de I/O, leaks de memoria, deadlocks.
            </p>
          </div>
        </div>

        {/* ── 6. WARNING BOX: errores conceptuales frecuentes ── */}
        <div className={styles.warningBoxEdu}>
          <h4>
            <span aria-hidden="true">⚠️</span>
            Conceptos erróneos frecuentes sobre sistemas operativos
          </h4>
          <ul>
            <li>
              <strong>"Más RAM siempre mejora el rendimiento"</strong> — Falso. Si tus procesos ya
              caben en RAM, añadir más no cambia nada. El cuello de botella suele ser CPU, I/O de disco
              o red, no RAM.
            </li>
            <li>
              <strong>"Un proceso que no usa CPU no consume recursos"</strong> — Falso. Un proceso
              bloqueado sigue ocupando RAM (sus páginas), descriptores de fichero y entradas en la tabla
              de procesos del kernel.
            </li>
            <li>
              <strong>"Matar un proceso siempre libera su memoria inmediatamente"</strong> — No siempre.
              En sistemas con copy-on-write y páginas compartidas, la memoria puede no liberarse hasta que
              el último proceso que la referencia termine.
            </li>
            <li>
              <strong>"El disco duro es solo un sitio para guardar ficheros"</strong> — También se usa
              como swap (extensión de RAM), para journaling del sistema de ficheros, y en bases de datos
              como almacenamiento de datos estructurados con control transaccional.
            </li>
            <li>
              <strong>"Un ordenador solo ejecuta un programa a la vez"</strong> — Técnicamente cierto
              por núcleo de CPU, pero el scheduling crea la ilusión de paralelismo conmutando entre
              procesos miles de veces por segundo. Con múltiples núcleos sí hay paralelismo real.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-sistemas-operativos')} />
      <ShareCard appName="visualizador-sistemas-operativos" />
      <Footer appName="visualizador-sistemas-operativos" />
    </div>
  );
}
