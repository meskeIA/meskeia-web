'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorPathfinding.module.css';

// ============== TIPOS Y CONSTANTES ==============

type Algoritmo = 'bfs' | 'dijkstra' | 'astar';
type Herramienta = 'muro' | 'costoso' | 'borrar' | 'inicio' | 'meta';
// Tipo de casilla: 0 = libre, 1 = muro (intransitable), 2 = terreno costoso (barro)
type Casilla = 0 | 1 | 2;
type EstadoCelda =
  | 'inicio'
  | 'meta'
  | 'camino'
  | 'actual'
  | 'visitada'
  | 'frontera'
  | 'libre'
  | 'muro'
  | 'costoso';

const COLS = 21;
const ROWS = 13;
const TOTAL = COLS * ROWS;
const COSTE_TERRENO_COSTOSO = 5; // moverse por barro cuesta x5

// Cada paso de la animación describe qué casilla se "cierra" (nuevaActual) y qué
// casillas entran a la frontera (nuevasFrontera). El estado visual acumulado se
// reconstruye plegando los pasos 0..pasoActual (ver estadoCeldas).
interface Paso {
  nuevaActual: number | null;
  nuevasFrontera: number[];
  caminoFinal?: number[];
  descripcion: string;
}

interface Resultado {
  pasos: Paso[];
  caminoEncontrado: number[];
  costeTotal: number;
  longitudCamino: number; // nº de pasos (casillas - 1)
  celdasExploradas: number;
  encontrado: boolean;
  complejidad: string;
}

// ============== UTILIDADES DE REJILLA ==============

function fila(idx: number): number {
  return Math.floor(idx / COLS);
}
function columna(idx: number): number {
  return idx % COLS;
}
function indiceDe(c: number, f: number): number {
  return f * COLS + c;
}

function costeTerreno(casilla: Casilla): number {
  return casilla === 2 ? COSTE_TERRENO_COSTOSO : 1;
}

interface Vecino {
  idx: number;
  coste: number; // coste de entrar (ponderado, con diagonal x√2)
  pasos: number; // coste en nº de movimientos (1 siempre) para BFS
}

// Vecinos transitables. Con diagonales, se evita "cortar esquinas" entre dos muros.
function obtenerVecinos(idx: number, grid: Casilla[], diagonales: boolean): Vecino[] {
  const c = columna(idx);
  const f = fila(idx);
  const ortogonales: Array<[number, number]> = [
    [c, f - 1],
    [c, f + 1],
    [c - 1, f],
    [c + 1, f],
  ];
  const diagonal: Array<[number, number]> = [
    [c - 1, f - 1],
    [c + 1, f - 1],
    [c - 1, f + 1],
    [c + 1, f + 1],
  ];
  const vecinos: Vecino[] = [];

  for (const [nc, nf] of ortogonales) {
    if (nc < 0 || nc >= COLS || nf < 0 || nf >= ROWS) continue;
    const nidx = indiceDe(nc, nf);
    if (grid[nidx] === 1) continue;
    vecinos.push({ idx: nidx, coste: costeTerreno(grid[nidx]), pasos: 1 });
  }

  if (diagonales) {
    for (const [nc, nf] of diagonal) {
      if (nc < 0 || nc >= COLS || nf < 0 || nf >= ROWS) continue;
      const nidx = indiceDe(nc, nf);
      if (grid[nidx] === 1) continue;
      // Evitar atravesar la esquina de un muro: ambas casillas ortogonales adyacentes
      // deben ser transitables.
      const ladoH = grid[indiceDe(nc, f)];
      const ladoV = grid[indiceDe(c, nf)];
      if (ladoH === 1 || ladoV === 1) continue;
      vecinos.push({ idx: nidx, coste: costeTerreno(grid[nidx]) * Math.SQRT2, pasos: 1 });
    }
  }

  return vecinos;
}

// Heurística admisible: Manhattan (4 dir) u octil (8 dir). El coste mínimo de paso es 1.
function heuristica(idx: number, meta: number, diagonales: boolean): number {
  const dx = Math.abs(columna(idx) - columna(meta));
  const dy = Math.abs(fila(idx) - fila(meta));
  if (diagonales) {
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  }
  return dx + dy;
}

// ============== ALGORITMO PARAMÉTRICO ==============

function ejecutarBusqueda(
  grid: Casilla[],
  inicio: number,
  meta: number,
  diagonales: boolean,
  algoritmo: Algoritmo,
): Resultado {
  const pasos: Paso[] = [];
  const g: number[] = new Array(TOTAL).fill(Infinity); // coste real acumulado
  const came: number[] = new Array(TOTAL).fill(-1);
  const cerrado = new Set<number>();
  const enAbierto = new Set<number>();
  const abierto: number[] = [inicio];
  enAbierto.add(inicio);
  g[inicio] = 0;

  pasos.push({
    nuevaActual: null,
    nuevasFrontera: [inicio],
    descripcion: 'Inicio: añadimos la casilla de partida a la frontera (conjunto abierto).',
  });

  const clave = (idx: number): number => {
    if (algoritmo === 'astar') return g[idx] + heuristica(idx, meta, diagonales);
    if (algoritmo === 'dijkstra') return g[idx];
    return g[idx]; // BFS usa orden FIFO, no esta clave
  };

  let encontrado = false;

  while (abierto.length > 0) {
    // Selección del siguiente nodo: FIFO en BFS, menor clave en Dijkstra/A*
    let actual: number;
    if (algoritmo === 'bfs') {
      actual = abierto.shift() as number;
    } else {
      let mejorPos = 0;
      let mejorClave = clave(abierto[0]);
      for (let i = 1; i < abierto.length; i++) {
        const k = clave(abierto[i]);
        if (k < mejorClave) {
          mejorClave = k;
          mejorPos = i;
        }
      }
      actual = abierto[mejorPos];
      abierto.splice(mejorPos, 1);
    }
    enAbierto.delete(actual);
    if (cerrado.has(actual)) continue;
    cerrado.add(actual);

    if (actual === meta) {
      pasos.push({
        nuevaActual: actual,
        nuevasFrontera: [],
        descripcion: `¡Llegamos a la meta! Reconstruimos el camino siguiendo los predecesores.`,
      });
      encontrado = true;
      break;
    }

    const vecinos = obtenerVecinos(actual, grid, diagonales);
    const expandidos: number[] = [];
    for (const v of vecinos) {
      if (cerrado.has(v.idx)) continue;
      if (algoritmo === 'bfs') {
        // BFS: cuenta movimientos, ignora el coste del terreno
        if (!enAbierto.has(v.idx)) {
          g[v.idx] = g[actual] + v.pasos;
          came[v.idx] = actual;
          abierto.push(v.idx);
          enAbierto.add(v.idx);
          expandidos.push(v.idx);
        }
      } else {
        // Dijkstra / A*: relajación por coste ponderado
        const tentativa = g[actual] + v.coste;
        if (tentativa < g[v.idx]) {
          g[v.idx] = tentativa;
          came[v.idx] = actual;
          if (!enAbierto.has(v.idx)) {
            abierto.push(v.idx);
            enAbierto.add(v.idx);
          }
          expandidos.push(v.idx);
        }
      }
    }

    const cf = columna(actual);
    const ff = fila(actual);
    pasos.push({
      nuevaActual: actual,
      nuevasFrontera: expandidos,
      descripcion:
        expandidos.length > 0
          ? `Visitamos (${cf}, ${ff}) y añadimos ${expandidos.length} casilla(s) a la frontera.`
          : `Visitamos (${cf}, ${ff}); no hay vecinos nuevos que explorar.`,
    });
  }

  // Reconstrucción del camino
  let camino: number[] = [];
  let costeTotal = 0;
  if (encontrado) {
    let cur = meta;
    while (cur !== -1) {
      camino.unshift(cur);
      cur = came[cur];
    }
    costeTotal = algoritmo === 'bfs' ? g[meta] : Math.round(g[meta] * 100) / 100;
    pasos.push({
      nuevaActual: null,
      nuevasFrontera: [],
      caminoFinal: camino,
      descripcion: `Camino encontrado: ${camino.length} casillas, ${camino.length - 1} pasos.`,
    });
  } else {
    pasos.push({
      nuevaActual: null,
      nuevasFrontera: [],
      descripcion: 'No existe ningún camino: los muros aíslan la meta del punto de partida.',
    });
  }

  return {
    pasos,
    caminoEncontrado: camino,
    costeTotal,
    longitudCamino: encontrado ? camino.length - 1 : 0,
    celdasExploradas: cerrado.size,
    encontrado,
    complejidad: algoritmo === 'bfs' ? 'O(V + E)' : 'O((V + E) log V)',
  };
}

// ============== PRESETS ==============

function gridVacio(): Casilla[] {
  return new Array(TOTAL).fill(0) as Casilla[];
}

function presetVacio(): { grid: Casilla[]; inicio: number; meta: number } {
  return {
    grid: gridVacio(),
    inicio: indiceDe(2, Math.floor(ROWS / 2)),
    meta: indiceDe(COLS - 3, Math.floor(ROWS / 2)),
  };
}

function presetMuro(): { grid: Casilla[]; inicio: number; meta: number } {
  const grid = gridVacio();
  // Muro vertical con un hueco abajo, obliga a rodear
  const colMuro = Math.floor(COLS / 2);
  for (let f = 0; f < ROWS - 2; f++) {
    grid[indiceDe(colMuro, f)] = 1;
  }
  return {
    grid,
    inicio: indiceDe(2, 2),
    meta: indiceDe(COLS - 3, 2),
  };
}

function presetBarro(): { grid: Casilla[]; inicio: number; meta: number } {
  const grid = gridVacio();
  // Franja de terreno costoso en el centro: aquí se ve BFS vs Dijkstra/A*
  const desde = Math.floor(COLS / 2) - 2;
  const hasta = Math.floor(COLS / 2) + 2;
  for (let f = 0; f < ROWS; f++) {
    for (let c = desde; c <= hasta; c++) {
      grid[indiceDe(c, f)] = 2;
    }
  }
  return {
    grid,
    inicio: indiceDe(2, Math.floor(ROWS / 2)),
    meta: indiceDe(COLS - 3, Math.floor(ROWS / 2)),
  };
}

function presetLaberinto(): { grid: Casilla[]; inicio: number; meta: number } {
  const grid = gridVacio();
  // Habitaciones con pasillos: tres muros verticales con huecos alternos
  const cols = [5, 10, 15];
  cols.forEach((colMuro, i) => {
    const hueco = i % 2 === 0 ? ROWS - 3 : 2;
    for (let f = 1; f < ROWS - 1; f++) {
      if (f === hueco || f === hueco + 1) continue;
      grid[indiceDe(colMuro, f)] = 1;
    }
  });
  // Algo de barro en una habitación
  for (let f = 3; f <= 6; f++) {
    for (let c = 11; c <= 14; c++) {
      grid[indiceDe(c, f)] = 2;
    }
  }
  return {
    grid,
    inicio: indiceDe(2, Math.floor(ROWS / 2)),
    meta: indiceDe(COLS - 2, Math.floor(ROWS / 2)),
  };
}

// ============== CELDA (memoizada) ==============

interface CeldaProps {
  idx: number;
  estado: EstadoCelda;
  herramienta: Herramienta;
  onPointerDown: (idx: number) => void;
  onPointerEnter: (idx: number) => void;
  onActivar: (idx: number) => void;
}

const claseEstado: Record<EstadoCelda, string> = {
  inicio: styles.cInicio,
  meta: styles.cMeta,
  camino: styles.cCamino,
  actual: styles.cActual,
  visitada: styles.cVisitada,
  frontera: styles.cFrontera,
  libre: styles.cLibre,
  muro: styles.cMuro,
  costoso: styles.cCostoso,
};

const etiquetaEstado: Record<EstadoCelda, string> = {
  inicio: 'inicio',
  meta: 'meta',
  camino: 'parte del camino',
  actual: 'casilla actual',
  visitada: 'visitada',
  frontera: 'en la frontera',
  libre: 'libre',
  muro: 'muro',
  costoso: 'terreno costoso',
};

const Celda = memo(function Celda({
  idx,
  estado,
  onPointerDown,
  onPointerEnter,
  onActivar,
}: CeldaProps) {
  return (
    <button
      type="button"
      className={`${styles.celda} ${claseEstado[estado]}`}
      onPointerDown={() => onPointerDown(idx)}
      onPointerEnter={() => onPointerEnter(idx)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivar(idx);
        }
      }}
      aria-label={`Casilla ${columna(idx)}, ${fila(idx)}: ${etiquetaEstado[estado]}`}
    />
  );
});

// ============== COMPONENTE PRINCIPAL ==============

export default function SimuladorPathfindingPage() {
  const [grid, setGrid] = useState<Casilla[]>(() => presetBarro().grid);
  const [inicio, setInicio] = useState<number>(() => presetBarro().inicio);
  const [meta, setMeta] = useState<number>(() => presetBarro().meta);
  const [herramienta, setHerramienta] = useState<Herramienta>('muro');
  const [diagonales, setDiagonales] = useState<boolean>(false);
  const [algoritmo, setAlgoritmo] = useState<Algoritmo>('astar');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [pasoActual, setPasoActual] = useState<number>(0);
  const [animando, setAnimando] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(40); // ms por paso
  const pintando = useRef<boolean>(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setResultado(null);
    setPasoActual(0);
    setAnimando(false);
    if (animTimer.current) {
      clearTimeout(animTimer.current);
      animTimer.current = null;
    }
  }, []);

  const cargarPreset = useCallback(
    (p: { grid: Casilla[]; inicio: number; meta: number }) => {
      setGrid(p.grid);
      setInicio(p.inicio);
      setMeta(p.meta);
      reset();
    },
    [reset],
  );

  // Aplica la herramienta activa sobre una casilla
  const aplicarHerramienta = useCallback(
    (idx: number) => {
      if (idx === inicio && herramienta !== 'inicio') return;
      if (idx === meta && herramienta !== 'meta') return;

      if (herramienta === 'inicio') {
        if (idx === meta) return;
        setGrid((prev) => {
          if (prev[idx] === 1) {
            const copia = prev.slice() as Casilla[];
            copia[idx] = 0;
            return copia;
          }
          return prev;
        });
        setInicio(idx);
        reset();
        return;
      }
      if (herramienta === 'meta') {
        if (idx === inicio) return;
        setGrid((prev) => {
          if (prev[idx] === 1) {
            const copia = prev.slice() as Casilla[];
            copia[idx] = 0;
            return copia;
          }
          return prev;
        });
        setMeta(idx);
        reset();
        return;
      }

      const nuevoValor: Casilla = herramienta === 'muro' ? 1 : herramienta === 'costoso' ? 2 : 0;
      setGrid((prev) => {
        if (prev[idx] === nuevoValor) return prev;
        const copia = prev.slice() as Casilla[];
        copia[idx] = nuevoValor;
        return copia;
      });
      reset();
    },
    [herramienta, inicio, meta, reset],
  );

  const handlePointerDown = useCallback(
    (idx: number) => {
      pintando.current = true;
      aplicarHerramienta(idx);
    },
    [aplicarHerramienta],
  );

  const handlePointerEnter = useCallback(
    (idx: number) => {
      if (!pintando.current) return;
      // En arrastre solo se pintan muros / costoso / borrar (no inicio/meta)
      if (herramienta === 'inicio' || herramienta === 'meta') return;
      aplicarHerramienta(idx);
    },
    [aplicarHerramienta, herramienta],
  );

  useEffect(() => {
    const soltar = () => {
      pintando.current = false;
    };
    window.addEventListener('pointerup', soltar);
    return () => window.removeEventListener('pointerup', soltar);
  }, []);

  const limpiarMuros = useCallback(() => {
    setGrid(gridVacio());
    reset();
  }, [reset]);

  const ejecutar = useCallback(() => {
    if (inicio === meta) return;
    const res = ejecutarBusqueda(grid, inicio, meta, diagonales, algoritmo);
    setResultado(res);
    setPasoActual(0);
    setAnimando(true);
  }, [grid, inicio, meta, diagonales, algoritmo]);

  // Animación
  useEffect(() => {
    if (!animando || !resultado) return;
    if (pasoActual >= resultado.pasos.length - 1) {
      setAnimando(false);
      return;
    }
    animTimer.current = setTimeout(() => {
      setPasoActual((prev) => Math.min(prev + 1, resultado.pasos.length - 1));
    }, velocidad);
    return () => {
      if (animTimer.current) clearTimeout(animTimer.current);
    };
  }, [animando, pasoActual, velocidad, resultado]);

  // Estado visual de cada casilla en el paso actual (plegando los pasos 0..pasoActual)
  const estadoCeldas = useMemo<EstadoCelda[]>(() => {
    const base: EstadoCelda[] = grid.map((k) => (k === 1 ? 'muro' : k === 2 ? 'costoso' : 'libre'));

    if (resultado) {
      const visitadas = new Set<number>();
      const frontera = new Set<number>();
      for (let i = 0; i <= pasoActual && i < resultado.pasos.length; i++) {
        const p = resultado.pasos[i];
        if (p.nuevaActual !== null) {
          visitadas.add(p.nuevaActual);
          frontera.delete(p.nuevaActual);
        }
        for (const f of p.nuevasFrontera) {
          if (!visitadas.has(f)) frontera.add(f);
        }
      }
      visitadas.forEach((idx) => {
        base[idx] = 'visitada';
      });
      frontera.forEach((idx) => {
        base[idx] = 'frontera';
      });
      const actual = resultado.pasos[pasoActual]?.nuevaActual;
      if (actual !== null && actual !== undefined) base[actual] = 'actual';
      // Camino final si ya hemos llegado al último paso
      const pasoMostrado = resultado.pasos[pasoActual];
      if (pasoMostrado?.caminoFinal) {
        for (const idx of pasoMostrado.caminoFinal) base[idx] = 'camino';
      }
    }

    base[inicio] = 'inicio';
    base[meta] = 'meta';
    return base;
  }, [grid, resultado, pasoActual, inicio, meta]);

  const pasoMostrar = resultado ? resultado.pasos[pasoActual] : null;
  const animacionTerminada = resultado !== null && pasoActual >= resultado.pasos.length - 1;
  const puedeEjecutar = inicio !== meta;

  const nombreAlgoritmo: Record<Algoritmo, string> = {
    bfs: 'BFS',
    dijkstra: 'Dijkstra',
    astar: 'A*',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Pathfinding A*</h1>
        <p className={styles.subtitle}>
          Cómo los enemigos de un videojuego encuentran el camino: A*, Dijkstra y BFS paso a paso
          sobre una rejilla
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* 1. Algoritmo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Elige el algoritmo</h2>
          <div className={styles.algoritmoSelector}>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'astar' ? styles.algoritmoActive : ''}`}
              aria-pressed={algoritmo === 'astar'}
              onClick={() => {
                setAlgoritmo('astar');
                reset();
              }}
            >
              <span className={styles.algoritmoNombre}>A*</span>
              <span className={styles.algoritmoDesc}>Coste + heurística · el de los juegos</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'dijkstra' ? styles.algoritmoActive : ''}`}
              aria-pressed={algoritmo === 'dijkstra'}
              onClick={() => {
                setAlgoritmo('dijkstra');
                reset();
              }}
            >
              <span className={styles.algoritmoNombre}>Dijkstra</span>
              <span className={styles.algoritmoDesc}>Ruta más barata · explora todo</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'bfs' ? styles.algoritmoActive : ''}`}
              aria-pressed={algoritmo === 'bfs'}
              onClick={() => {
                setAlgoritmo('bfs');
                reset();
              }}
            >
              <span className={styles.algoritmoNombre}>BFS</span>
              <span className={styles.algoritmoDesc}>Menos casillas · ignora el coste</span>
            </button>
          </div>
        </div>

        {/* 2. Presets */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Carga un mapa de ejemplo</h2>
          <div className={styles.presetGrid}>
            <button type="button" className={styles.presetBtn} onClick={() => cargarPreset(presetBarro())}>
              <span className={styles.presetTitle}>Barro central</span>
              <span className={styles.presetDesc}>Terreno costoso: aquí se ve BFS vs A*</span>
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => cargarPreset(presetMuro())}>
              <span className={styles.presetTitle}>Muro con hueco</span>
              <span className={styles.presetDesc}>Obliga a rodear el obstáculo</span>
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => cargarPreset(presetLaberinto())}>
              <span className={styles.presetTitle}>Habitaciones</span>
              <span className={styles.presetDesc}>Pasillos + barro en una sala</span>
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => cargarPreset(presetVacio())}>
              <span className={styles.presetTitle}>Vacío</span>
              <span className={styles.presetDesc}>Sin obstáculos, expansión pura</span>
            </button>
          </div>
        </div>

        {/* 3. Editor */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>3. Dibuja el mapa</h2>
          <div className={styles.toolbar}>
            <button
              type="button"
              className={`${styles.toolBtn} ${herramienta === 'muro' ? styles.toolActive : ''}`}
              onClick={() => setHerramienta('muro')}
              aria-pressed={herramienta === 'muro'}
            >
              <span aria-hidden="true">🧱</span> Muro
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${herramienta === 'costoso' ? styles.toolActive : ''}`}
              onClick={() => setHerramienta('costoso')}
              aria-pressed={herramienta === 'costoso'}
            >
              <span aria-hidden="true">🟤</span> Terreno costoso (×{COSTE_TERRENO_COSTOSO})
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${herramienta === 'borrar' ? styles.toolActive : ''}`}
              onClick={() => setHerramienta('borrar')}
              aria-pressed={herramienta === 'borrar'}
            >
              <span aria-hidden="true">🧽</span> Borrar
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${herramienta === 'inicio' ? styles.toolActive : ''}`}
              onClick={() => setHerramienta('inicio')}
              aria-pressed={herramienta === 'inicio'}
            >
              <span aria-hidden="true">🟢</span> Inicio
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${herramienta === 'meta' ? styles.toolActive : ''}`}
              onClick={() => setHerramienta('meta')}
              aria-pressed={herramienta === 'meta'}
            >
              <span aria-hidden="true">🔴</span> Meta
            </button>

            <label className={styles.toggleControl}>
              <input
                type="checkbox"
                checked={diagonales}
                onChange={(e) => {
                  setDiagonales(e.target.checked);
                  reset();
                }}
              />
              Diagonales (8 direcciones)
            </label>
          </div>

          <div className={styles.hint}>
            Selecciona una herramienta y <strong>haz clic o arrastra</strong> sobre la rejilla. El
            terreno costoso simula barro o agua: cuesta {COSTE_TERRENO_COSTOSO} veces más atravesarlo.
          </div>

          <div
            className={styles.gridWrapper}
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            role="grid"
            aria-label="Rejilla de búsqueda de caminos"
          >
            {estadoCeldas.map((estado, idx) => (
              <Celda
                key={idx}
                idx={idx}
                estado={estado}
                herramienta={herramienta}
                onPointerDown={handlePointerDown}
                onPointerEnter={handlePointerEnter}
                onActivar={aplicarHerramienta}
              />
            ))}
          </div>

          {/* Leyenda */}
          <div className={styles.leyenda}>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.cInicio}`} aria-hidden="true" /> Inicio
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.cMeta}`} aria-hidden="true" /> Meta
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.cMuro}`} aria-hidden="true" /> Muro
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.cCostoso}`} aria-hidden="true" /> Costoso
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.cFrontera}`} aria-hidden="true" /> Frontera
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.cVisitada}`} aria-hidden="true" /> Visitada
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.cCamino}`} aria-hidden="true" /> Camino
            </span>
          </div>

          <div className={styles.actionRow}>
            <button type="button" className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={limpiarMuros}>
              Vaciar rejilla
            </button>
          </div>
        </div>

        {/* 4. Ejecución */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>4. Ejecuta y observa la búsqueda</h2>
          <button type="button" className={styles.calcBtn} onClick={ejecutar} disabled={!puedeEjecutar}>
            {!puedeEjecutar
              ? 'El inicio y la meta no pueden coincidir'
              : `Buscar camino con ${nombreAlgoritmo[algoritmo]}`}
          </button>

          {resultado && (
            <>
              <div className={styles.controlBar} style={{ marginTop: '1rem' }}>
                <div className={styles.velocidadControl}>
                  <label htmlFor="vel-slider">Velocidad:</label>
                  <input
                    id="vel-slider"
                    type="range"
                    min={5}
                    max={200}
                    step={5}
                    value={velocidad}
                    onChange={(e) => setVelocidad(parseInt(e.target.value, 10))}
                  />
                  <span className={styles.velocidadValue}>{velocidad} ms</span>
                </div>
                <button
                  type="button"
                  className={styles.controlBtn}
                  onClick={() => setAnimando(true)}
                  disabled={animando || animacionTerminada}
                >
                  <span aria-hidden="true">▶</span> Reproducir
                </button>
                <button
                  type="button"
                  className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                  onClick={() => setAnimando(false)}
                  disabled={!animando}
                >
                  <span aria-hidden="true">⏸</span> Pausar
                </button>
                <button
                  type="button"
                  className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                  onClick={() => {
                    setAnimando(false);
                    setPasoActual((prev) => Math.min(prev + 1, resultado.pasos.length - 1));
                  }}
                  disabled={animacionTerminada}
                >
                  <span aria-hidden="true">⏭</span> Paso
                </button>
                <button
                  type="button"
                  className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                  onClick={() => {
                    setAnimando(false);
                    setPasoActual(0);
                  }}
                >
                  <span aria-hidden="true">↺</span> Reiniciar
                </button>
              </div>

              {pasoMostrar && (
                <div className={styles.descripcionPaso} role="status" aria-live="polite" aria-atomic="true">
                  <strong>
                    Paso {pasoActual + 1} / {resultado.pasos.length}:
                  </strong>{' '}
                  {pasoMostrar.descripcion}
                </div>
              )}

              <div className={styles.metricsGrid} role="status" aria-live="polite" aria-atomic="true">
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Casillas exploradas</span>
                  <span className={styles.metricValue}>{formatNumber(resultado.celdasExploradas, 0)}</span>
                  <span className={styles.metricNote}>
                    Cuantas menos, más eficiente fue la búsqueda
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Longitud del camino</span>
                  <span className={styles.metricValue}>
                    {resultado.encontrado ? formatNumber(resultado.longitudCamino, 0) : '—'}
                    {resultado.encontrado && <span className={styles.metricUnit}>pasos</span>}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>
                    {algoritmo === 'bfs' ? 'Coste (nº de pasos)' : 'Coste del camino'}
                  </span>
                  <span className={styles.metricValue}>
                    {resultado.encontrado ? formatNumber(resultado.costeTotal, algoritmo === 'bfs' ? 0 : 2) : '—'}
                  </span>
                  {algoritmo === 'bfs' && resultado.encontrado && (
                    <span className={styles.metricNote}>BFS ignora el coste del terreno</span>
                  )}
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Complejidad</span>
                  <span className={styles.metricValue} style={{ fontSize: '1.05rem' }}>
                    {resultado.complejidad}
                  </span>
                </div>
              </div>

              {!resultado.encontrado && (
                <div className={styles.hint} role="status">
                  <strong>Sin solución:</strong> los muros separan por completo el inicio de la meta.
                  Borra algún muro y vuelve a ejecutar.
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía de Búsqueda de Caminos (Pathfinding)"
        subtitle="A*, Dijkstra y BFS — cómo deciden los videojuegos por dónde ir"
      >
        <h3>Comparativa de los tres algoritmos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Algoritmo</th>
                <th>¿Tiene en cuenta el coste del terreno?</th>
                <th>¿Camino óptimo?</th>
                <th>Casillas que explora</th>
                <th>Cuándo usarlo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>BFS</strong></td>
                <td>No, solo cuenta casillas</td>
                <td>Sí en nº de pasos, no en coste</td>
                <td>Muchas (en oleadas)</td>
                <td>Casillas alcanzables en N pasos (juegos por turnos)</td>
              </tr>
              <tr>
                <td><strong>Dijkstra</strong></td>
                <td>Sí</td>
                <td>Sí, la ruta más barata</td>
                <td>Muchas (en todas direcciones)</td>
                <td>Sin meta fija o sin heurística clara</td>
              </tr>
              <tr>
                <td><strong>A*</strong></td>
                <td>Sí</td>
                <td>Sí, si la heurística es admisible</td>
                <td>Pocas (dirigidas a la meta)</td>
                <td>Pathfinding con destino conocido: el estándar en videojuegos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usa en los videojuegos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👾</span>
              <strong>Enemigos que te persiguen</strong>
            </div>
            <p className={styles.escenarioExample}>
              En un RPG o un shooter, cada enemigo calcula con A* la ruta hasta tu posición esquivando
              muros. Cuando te mueves, recalcula. Es el uso más común del pathfinding.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Recalcular cada frame es caro: muchos juegos lo hacen cada pocos frames o solo si el
              objetivo se ha movido bastante.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏰</span>
              <strong>Estrategia en tiempo real (RTS)</strong>
            </div>
            <p className={styles.escenarioExample}>
              Al ordenar a una unidad ir a un punto, el motor traza la ruta con A* sobre la rejilla del
              mapa, prefiriendo caminos y evitando bosques o agua (terreno costoso).
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Con muchas unidades se combina A* con &laquo;flow fields&raquo; para no calcular una ruta por unidad.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎲</span>
              <strong>Juegos por turnos</strong>
            </div>
            <p className={styles.escenarioExample}>
              En un táctico por casillas, BFS resalta hasta dónde puede llegar un personaje con sus
              puntos de movimiento, y A* traza la ruta concreta al confirmar el destino.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> BFS es ideal aquí porque «N pasos» es exactamente lo que limita el movimiento.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗺️</span>
              <strong>Malla de navegación (navmesh)</strong>
            </div>
            <p className={styles.escenarioExample}>
              Los juegos 3D no usan una rejilla cuadrada, sino polígonos transitables (navmesh). El
              algoritmo es el mismo A*, pero los nodos son zonas en lugar de casillas.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Unity y Unreal traen sistemas de navmesh + A* listos para usar.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué A* explora menos casillas que Dijkstra si encuentran el mismo camino?</h4>
            <p>
              Dijkstra no sabe dónde está la meta: expande en todas direcciones según el coste
              acumulado. A* suma una heurística que estima lo que falta hasta la meta, así que da
              prioridad a las casillas que van «hacia allí». Encuentra la misma ruta óptima, pero
              descartando antes las zonas que se alejan del destino.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Si pones la heurística a cero, A* se convierte exactamente en Dijkstra. Pruébalo
              mentalmente: sin pista de dónde está la meta, toca explorar a ciegas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo se nota la diferencia entre BFS y los otros?</h4>
            <p>
              Cuando hay terreno con distinto coste. BFS solo cuenta casillas, así que cruzará una zona
              de barro si tiene menos casillas, aunque sea lentísima. Dijkstra y A* sí suman el coste y
              prefieren rodear el barro si eso sale más barato. Carga el preset «Barro central» y
              compara las rutas.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> En un mapa sin terrenos costosos y sin diagonales, BFS, Dijkstra y A* dan caminos de la
              misma longitud; solo cambia cuánto exploran.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué heurística debo usar?</h4>
            <p>
              En una rejilla con movimiento en 4 direcciones se usa la distancia Manhattan (|dx| +
              |dy|). Si permites diagonales, se usa la distancia octil, que tiene en cuenta que el paso
              diagonal cuesta 1,41. La clave es que la heurística sea <strong>admisible</strong>: que
              nunca estime de más. Si lo hace, A* garantiza el camino óptimo.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Si la heurística sobreestima, A* va más rápido pero puede devolver una ruta que no es
              la más corta. A veces se acepta ese cambio a propósito.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué no se puede atravesar la esquina entre dos muros en diagonal?</h4>
            <p>
              Cuando activas las diagonales, el simulador impide moverse en diagonal si las dos casillas
              ortogonales de esa esquina son muros: físicamente el personaje no «cabría» por el hueco.
              Es lo que esperan los jugadores y evita que los enemigos parezcan atravesar paredes.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Algunos juegos sí permiten cortar esquinas para rutas más fluidas; es una decisión de
              diseño.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Es A* siempre la mejor opción?</h4>
            <p>
              Para ir de un punto a otro con una meta conocida, normalmente sí. Pero si necesitas las
              distancias desde un origen a <em>todos</em> los puntos, Dijkstra es más adecuado. Y con
              miles de agentes moviéndose a la vez se usan técnicas como flow fields o jump point search
              (una optimización de A* para rejillas uniformes).
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> No existe «el mejor algoritmo» absoluto: depende de si hay meta fija, pesos, cuántos
              agentes y cómo es el mapa.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué lenguaje o motor necesito para programar esto?</h4>
            <p>
              El algoritmo es independiente del lenguaje: se implementa igual en Python, C#, C++ o
              JavaScript. Motores como Unity (C#), Unreal (C++/Blueprints) o Godot (GDScript) ya incluyen
              pathfinding integrado, pero entender A* por dentro te permite ajustarlo y depurarlo cuando
              el comportamiento no es el esperado.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Implementar A* a mano una vez es un ejercicio clásico y muy recomendable antes de usar
              el del motor.
            </p>
          </div>
        </div>

        <h3>Cómo funciona A* paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Mete el inicio en la frontera</strong>
              <p>
                La «frontera» (conjunto abierto) guarda las casillas pendientes de explorar. Empieza solo
                con la casilla de partida, con coste acumulado g = 0.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Saca la casilla más prometedora</strong>
              <p>
                De la frontera, elige la de menor f = g + h, donde g es el coste real recorrido y h la
                estimación hasta la meta. La marcas como visitada (conjunto cerrado).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>¿Es la meta?</strong>
              <p>
                Si la casilla que sacas es la meta, has terminado: reconstruye el camino siguiendo los
                predecesores hacia atrás. Si no, continúa.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Examina los vecinos</strong>
              <p>
                Para cada casilla vecina transitable, calcula el coste de llegar por aquí. Si es mejor que
                el que tenía, actualiza su g, guarda de qué casilla viene y métela en la frontera.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Repite hasta acabar</strong>
              <p>
                Vuelve al paso 2 hasta llegar a la meta o vaciar la frontera. Si se vacía sin llegar, no
                existe camino posible.
              </p>
            </div>
          </div>
        </div>

        <h3>Buenas prácticas al implementarlo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Usa una cola de prioridad</strong>
            <p>
              Para sacar siempre la casilla de menor f sin recorrer toda la frontera, usa un heap
              (montículo). Marca la diferencia en mapas grandes.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Heurística admisible</strong>
            <p>
              Para garantizar el camino óptimo, h nunca debe sobreestimar el coste real. Manhattan u
              octil son seguras en rejillas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Guarda predecesores, no caminos</strong>
            <p>
              No almacenes la ruta completa en cada casilla. Guarda solo «de quién vengo» y reconstruye al
              final siguiendo la cadena hacia atrás.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>No recalcules cada frame</strong>
            <p>
              Recalcular la ruta de cada enemigo en cada fotograma hunde el rendimiento. Hazlo cada cierto
              tiempo o cuando el objetivo se mueva lo suficiente.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Limita las esquinas en diagonal</strong>
            <p>
              Si permites diagonales, impide cortar esquinas entre dos muros para que los personajes no
              parezcan atravesar paredes.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Reutiliza el mapa de costes</strong>
            <p>
              Si muchos agentes van al mismo destino, calcula un mapa de costes una sola vez (flow field)
              en lugar de un A* por agente.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes al programar pathfinding</strong>
          </div>
          <ul className={styles.warningList}>
            <li>No marcar las casillas como visitadas → el algoritmo se queda en bucle o repite trabajo.</li>
            <li>Usar una heurística que sobreestima cuando se quería el camino óptimo → rutas no óptimas.</li>
            <li>Olvidar el coste del terreno y preguntarse por qué los enemigos cruzan el agua.</li>
            <li>Permitir cortar esquinas entre muros en diagonal → personajes que «atraviesan» paredes.</li>
            <li>Recalcular la ruta de todos los agentes cada frame → caída drástica de FPS.</li>
            <li>No comprobar que existe camino → excepción al intentar reconstruir una ruta inexistente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-pathfinding')} />
      <ShareCard appName="simulador-pathfinding" />
      <Footer appName="simulador-pathfinding" />
    </div>
  );
}
