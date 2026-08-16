'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useRef, memo } from 'react';
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
import styles from './SimuladorAutomatasCelulares.module.css';

// ============== TIPOS Y CONSTANTES ==============

type Modo = 'vida' | 'cuevas';

const COLS = 50;
const ROWS = 35;
const TOTAL = COLS * ROWS;

// Regla de suavizado para cuevas: una celda es roca si tiene >= UMBRAL vecinas roca.
const UMBRAL_CUEVA = 5;
const PASOS_SUAVIZADO_CUEVA = 5;

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

function rejillaVacia(): Uint8Array {
  return new Uint8Array(TOTAL);
}

// Cuenta vecinas vivas (vecindad de Moore, 8 vecinos). El exterior se trata como muerto.
function contarVecinas(grid: Uint8Array, idx: number): number {
  const c = columna(idx);
  const f = fila(idx);
  let total = 0;
  for (let df = -1; df <= 1; df++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dc === 0 && df === 0) continue;
      const nc = c + dc;
      const nf = f + df;
      if (nc < 0 || nc >= COLS || nf < 0 || nf >= ROWS) continue;
      total += grid[indiceDe(nc, nf)];
    }
  }
  return total;
}

// Una generación del Juego de la Vida de Conway (B3/S23), borde exterior = muerto.
function generacionVida(grid: Uint8Array): Uint8Array {
  const siguiente = rejillaVacia();
  for (let idx = 0; idx < TOTAL; idx++) {
    const vecinas = contarVecinas(grid, idx);
    if (grid[idx] === 1) {
      siguiente[idx] = vecinas === 2 || vecinas === 3 ? 1 : 0;
    } else {
      siguiente[idx] = vecinas === 3 ? 1 : 0;
    }
  }
  return siguiente;
}

// Un paso de suavizado de cuevas: roca si >= UMBRAL vecinas roca.
// El borde de la rejilla se considera roca (cuenta como vecina) para cerrar la cueva.
function pasoSuavizadoCueva(grid: Uint8Array): Uint8Array {
  const siguiente = rejillaVacia();
  for (let idx = 0; idx < TOTAL; idx++) {
    const c = columna(idx);
    const f = fila(idx);
    let roca = 0;
    for (let df = -1; df <= 1; df++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dc === 0 && df === 0) continue;
        const nc = c + dc;
        const nf = f + df;
        // Fuera de la rejilla cuenta como roca (paredes cerradas)
        if (nc < 0 || nc >= COLS || nf < 0 || nf >= ROWS) {
          roca++;
          continue;
        }
        roca += grid[indiceDe(nc, nf)];
      }
    }
    siguiente[idx] = roca >= UMBRAL_CUEVA ? 1 : 0;
  }
  return siguiente;
}

function contarVivas(grid: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < TOTAL; i++) n += grid[i];
  return n;
}

// ============== SEMBRADO ==============

function sembrarAleatorio(densidad: number): Uint8Array {
  const grid = rejillaVacia();
  for (let i = 0; i < TOTAL; i++) {
    grid[i] = Math.random() < densidad ? 1 : 0;
  }
  return grid;
}

function generarCueva(densidad: number): Uint8Array {
  let grid = sembrarAleatorio(densidad);
  for (let i = 0; i < PASOS_SUAVIZADO_CUEVA; i++) {
    grid = pasoSuavizadoCueva(grid);
  }
  return grid;
}

// ============== PATRONES CLÁSICOS ==============

// Cada patrón es una lista de coordenadas [columna, fila] relativas (vivas).
type Patron = ReadonlyArray<readonly [number, number]>;

const BLOQUE: Patron = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
];

const PLANEADOR: Patron = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
];

const OSCILADOR: Patron = [
  [0, 0],
  [1, 0],
  [2, 0],
];

// Nave ligera (LWSS)
const NAVE_LWSS: Patron = [
  [1, 0],
  [4, 0],
  [0, 1],
  [0, 2],
  [4, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
];

// Cañón de planeadores de Gosper
const CANON_GOSPER: Patron = [
  [0, 4],
  [0, 5],
  [1, 4],
  [1, 5],
  [10, 4],
  [10, 5],
  [10, 6],
  [11, 3],
  [11, 7],
  [12, 2],
  [12, 8],
  [13, 2],
  [13, 8],
  [14, 5],
  [15, 3],
  [15, 7],
  [16, 4],
  [16, 5],
  [16, 6],
  [17, 5],
  [20, 2],
  [20, 3],
  [20, 4],
  [21, 2],
  [21, 3],
  [21, 4],
  [22, 1],
  [22, 5],
  [24, 0],
  [24, 1],
  [24, 5],
  [24, 6],
  [34, 2],
  [34, 3],
  [35, 2],
  [35, 3],
];

// Coloca un patrón centrado (o con un margen dado) sobre una rejilla vacía.
function colocarPatron(patron: Patron, offsetC?: number, offsetF?: number): Uint8Array {
  const grid = rejillaVacia();
  let maxC = 0;
  let maxF = 0;
  for (const [c, f] of patron) {
    if (c > maxC) maxC = c;
    if (f > maxF) maxF = f;
  }
  const baseC = offsetC ?? Math.floor((COLS - maxC) / 2);
  const baseF = offsetF ?? Math.floor((ROWS - maxF) / 2);
  for (const [c, f] of patron) {
    const nc = baseC + c;
    const nf = baseF + f;
    if (nc >= 0 && nc < COLS && nf >= 0 && nf < ROWS) {
      grid[indiceDe(nc, nf)] = 1;
    }
  }
  return grid;
}

// ============== CELDA (memoizada) ==============

interface CeldaProps {
  idx: number;
  viva: boolean;
  modo: Modo;
  onPointerDown: (idx: number) => void;
  onPointerEnter: (idx: number) => void;
  onActivar: (idx: number) => void;
}

const Celda = memo(function Celda({
  idx,
  viva,
  modo,
  onPointerDown,
  onPointerEnter,
  onActivar,
}: CeldaProps) {
  const claseViva = modo === 'cuevas' ? styles.cRoca : styles.cViva;
  const etiqueta =
    modo === 'cuevas'
      ? viva
        ? 'roca'
        : 'hueco'
      : viva
        ? 'viva'
        : 'muerta';
  return (
    <button
      type="button"
      className={`${styles.celda} ${viva ? claseViva : styles.cMuerta}`}
      onPointerDown={() => onPointerDown(idx)}
      onPointerEnter={() => onPointerEnter(idx)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivar(idx);
        }
      }}
      aria-label={`Célula ${columna(idx)}, ${fila(idx)}: ${etiqueta}`}
    />
  );
});

// ============== COMPONENTE PRINCIPAL ==============

export default function SimuladorAutomatasCelularesPage() {
  const [modo, setModo] = useState<Modo>('vida');
  const [grid, setGrid] = useState<Uint8Array>(() => colocarPatron(PLANEADOR, 2, 2));
  const [generacion, setGeneracion] = useState<number>(0);
  const [reproduciendo, setReproduciendo] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(120); // ms por generación
  const [densidad, setDensidad] = useState<number>(45); // % de células vivas al sembrar
  const pintando = useRef<boolean>(false);
  const pintarValor = useRef<0 | 1>(1); // valor a pintar durante el arrastre
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vivas = contarVivas(grid);

  const reset = useCallback(() => {
    setReproduciendo(false);
    if (animTimer.current) {
      clearTimeout(animTimer.current);
      animTimer.current = null;
    }
  }, []);

  // Avanza una generación según el modo activo.
  const avanzarPaso = useCallback(() => {
    setGrid((prev) => (modo === 'cuevas' ? pasoSuavizadoCueva(prev) : generacionVida(prev)));
    setGeneracion((g) => g + 1);
  }, [modo]);

  // Bucle de animación con setTimeout (cancelado en cleanup).
  useEffect(() => {
    if (!reproduciendo) return;
    animTimer.current = setTimeout(() => {
      avanzarPaso();
    }, velocidad);
    return () => {
      if (animTimer.current) clearTimeout(animTimer.current);
    };
  }, [reproduciendo, generacion, velocidad, avanzarPaso]);

  // Detiene la reproducción automáticamente si el modo vida se queda sin células vivas.
  useEffect(() => {
    if (reproduciendo && modo === 'vida' && vivas === 0) {
      setReproduciendo(false);
    }
  }, [reproduciendo, modo, vivas]);

  const cambiarModo = useCallback(
    (nuevo: Modo) => {
      if (nuevo === modo) return;
      setModo(nuevo);
      reset();
      setGeneracion(0);
      if (nuevo === 'cuevas') {
        setGrid(generarCueva(densidad / 100));
      } else {
        setGrid(colocarPatron(PLANEADOR, 2, 2));
      }
    },
    [modo, reset, densidad],
  );

  const cargarPatron = useCallback(
    (patron: Patron, offsetC?: number, offsetF?: number) => {
      reset();
      setGeneracion(0);
      setGrid(colocarPatron(patron, offsetC, offsetF));
    },
    [reset],
  );

  const limpiar = useCallback(() => {
    reset();
    setGeneracion(0);
    setGrid(rejillaVacia());
  }, [reset]);

  const aleatorio = useCallback(() => {
    reset();
    setGeneracion(0);
    setGrid(sembrarAleatorio(densidad / 100));
  }, [reset, densidad]);

  const nuevaCueva = useCallback(() => {
    reset();
    setGeneracion(0);
    setGrid(generarCueva(densidad / 100));
  }, [reset, densidad]);

  // Pintado de células
  const pintarCelda = useCallback((idx: number, valor: 0 | 1) => {
    setGrid((prev) => {
      if (prev[idx] === valor) return prev;
      const copia = new Uint8Array(prev);
      copia[idx] = valor;
      return copia;
    });
  }, []);

  const handlePointerDown = useCallback(
    (idx: number) => {
      pintando.current = true;
      const nuevoValor: 0 | 1 = grid[idx] === 1 ? 0 : 1;
      pintarValor.current = nuevoValor;
      pintarCelda(idx, nuevoValor);
    },
    [grid, pintarCelda],
  );

  const handlePointerEnter = useCallback(
    (idx: number) => {
      if (!pintando.current) return;
      pintarCelda(idx, pintarValor.current);
    },
    [pintarCelda],
  );

  // Activación por teclado: alterna la célula.
  const activarCelda = useCallback(
    (idx: number) => {
      pintarCelda(idx, grid[idx] === 1 ? 0 : 1);
    },
    [grid, pintarCelda],
  );

  useEffect(() => {
    const soltar = () => {
      pintando.current = false;
    };
    window.addEventListener('pointerup', soltar);
    return () => window.removeEventListener('pointerup', soltar);
  }, []);

  // Lista de índices para renderizar (estable: 0..TOTAL-1)
  const indices = useRef<number[]>(Array.from({ length: TOTAL }, (_, i) => i));

  const reproduccionPausada = !reproduciendo;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Juego de la Vida y Autómatas Celulares</h1>
        <p className={styles.subtitle}>
          El Juego de la Vida de Conway y la generación de cuevas procedurales: reglas locales
          simples que producen comportamiento emergente
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* 1. Modo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Elige el modo</h2>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'vida' ? styles.modoActive : ''}`}
              onClick={() => cambiarModo('vida')}
              aria-pressed={modo === 'vida'}
            >
              <span className={styles.modoNombre}>
                <span aria-hidden="true">🧬</span> Juego de la Vida
              </span>
              <span className={styles.modoDesc}>Reglas de Conway B3/S23 · vida emergente</span>
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'cuevas' ? styles.modoActive : ''}`}
              onClick={() => cambiarModo('cuevas')}
              aria-pressed={modo === 'cuevas'}
            >
              <span className={styles.modoNombre}>
                <span aria-hidden="true">🪨</span> Generación de cuevas
              </span>
              <span className={styles.modoDesc}>Suavizado por mayoría · procgen de mazmorras</span>
            </button>
          </div>
          <div className={styles.hint}>
            {modo === 'vida' ? (
              <>
                <strong>Juego de la Vida:</strong> una célula viva sobrevive con 2 o 3 vecinas; una
                muerta nace con exactamente 3 vecinas. En cualquier otro caso, muere. El exterior de
                la rejilla se considera siempre muerto.
              </>
            ) : (
              <>
                <strong>Generación de cuevas:</strong> cada celda se vuelve roca si tiene{' '}
                {UMBRAL_CUEVA} o más vecinas roca, y hueco si tiene menos. Aplicado sobre ruido
                aleatorio, hace emerger cavernas conectadas. El borde cuenta como roca para cerrar la
                cueva.
              </>
            )}
          </div>
        </div>

        {/* 2. Patrones / sembrado */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {modo === 'vida' ? '2. Carga un patrón clásico' : '2. Siembra una cueva'}
          </h2>
          {modo === 'vida' ? (
            <div className={styles.presetGrid}>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => cargarPatron(PLANEADOR, 2, 2)}
              >
                <span className={styles.presetTitle}>Planeador (glider)</span>
                <span className={styles.presetDesc}>Nave de 5 células que se desliza en diagonal</span>
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => cargarPatron(OSCILADOR)}
              >
                <span className={styles.presetTitle}>Oscilador (blinker)</span>
                <span className={styles.presetDesc}>Parpadea entre vertical y horizontal</span>
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => cargarPatron(NAVE_LWSS)}
              >
                <span className={styles.presetTitle}>Nave ligera (LWSS)</span>
                <span className={styles.presetDesc}>Spaceship que avanza en horizontal</span>
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => cargarPatron(BLOQUE)}
              >
                <span className={styles.presetTitle}>Bloque</span>
                <span className={styles.presetDesc}>Naturaleza muerta: estable, no cambia</span>
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => cargarPatron(CANON_GOSPER, 4, 2)}
              >
                <span className={styles.presetTitle}>Cañón de planeadores</span>
                <span className={styles.presetDesc}>Gosper: dispara planeadores sin parar</span>
              </button>
              <button type="button" className={styles.presetBtn} onClick={aleatorio}>
                <span className={styles.presetTitle}>Aleatorio</span>
                <span className={styles.presetDesc}>Siembra al azar según la densidad</span>
              </button>
            </div>
          ) : (
            <>
              <div className={styles.densidadControl}>
                <label htmlFor="densidad-slider">Densidad inicial:</label>
                <input
                  id="densidad-slider"
                  type="range"
                  min={20}
                  max={70}
                  step={1}
                  value={densidad}
                  onChange={(e) => setDensidad(parseInt(e.target.value, 10))}
                />
                <span className={styles.densidadValue}>{densidad}%</span>
              </div>
              <div className={styles.actionRow}>
                <button type="button" className={styles.calcBtn} onClick={nuevaCueva}>
                  <span aria-hidden="true">🪨</span> Generar cueva
                </button>
              </div>
              <div className={styles.hint}>
                Cada generación suaviza un poco más la cueva. «Generar cueva» siembra ruido aleatorio
                y aplica {PASOS_SUAVIZADO_CUEVA} pasos de golpe. Después puedes seguir con ▶ o ⏭ para
                ver cómo se estabiliza.
              </div>
            </>
          )}
        </div>

        {/* 3. Rejilla editable */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>3. Edita la rejilla</h2>
          <div className={styles.hint}>
            <strong>Haz clic o arrastra</strong> sobre la rejilla para{' '}
            {modo === 'cuevas' ? 'pintar roca o vaciar huecos' : 'dar vida o quitarla a las células'}.
            El primer clic decide si pintas o borras.
          </div>

          <div
            className={styles.gridWrapper}
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            role="grid"
            aria-label={
              modo === 'cuevas'
                ? 'Rejilla de generación de cuevas, edita roca y huecos'
                : 'Rejilla del Juego de la Vida, edita células vivas y muertas'
            }
          >
            {indices.current.map((idx) => (
              <Celda
                key={idx}
                idx={idx}
                viva={grid[idx] === 1}
                modo={modo}
                onPointerDown={handlePointerDown}
                onPointerEnter={handlePointerEnter}
                onActivar={activarCelda}
              />
            ))}
          </div>

          {/* Leyenda */}
          <div className={styles.leyenda}>
            <span className={styles.leyendaItem}>
              <span
                className={`${styles.leyendaColor} ${modo === 'cuevas' ? styles.cRoca : styles.cViva}`}
                aria-hidden="true"
              />{' '}
              {modo === 'cuevas' ? 'Roca (pared)' : 'Célula viva'}
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.cMuerta}`} aria-hidden="true" />{' '}
              {modo === 'cuevas' ? 'Hueco (caverna)' : 'Célula muerta'}
            </span>
          </div>
        </div>

        {/* 4. Controles de reproducción */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>4. Reproduce las generaciones</h2>

          <div className={styles.controlBar}>
            <div className={styles.velocidadControl}>
              <label htmlFor="vel-slider">Velocidad:</label>
              <input
                id="vel-slider"
                type="range"
                min={20}
                max={500}
                step={10}
                value={velocidad}
                onChange={(e) => setVelocidad(parseInt(e.target.value, 10))}
              />
              <span className={styles.velocidadValue}>{velocidad} ms</span>
            </div>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={() => setReproduciendo(true)}
              disabled={reproduciendo || (modo === 'vida' && vivas === 0)}
              aria-pressed={reproduciendo}
            >
              <span aria-hidden="true">▶</span> Reproducir
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.secondaryBtn}`}
              onClick={() => setReproduciendo(false)}
              disabled={!reproduciendo}
              aria-pressed={reproduccionPausada}
            >
              <span aria-hidden="true">⏸</span> Pausar
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.secondaryBtn}`}
              onClick={() => {
                setReproduciendo(false);
                avanzarPaso();
              }}
              disabled={modo === 'vida' && vivas === 0}
            >
              <span aria-hidden="true">⏭</span> Paso
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.dangerBtn}`}
              onClick={limpiar}
            >
              <span aria-hidden="true">↺</span> Limpiar
            </button>
          </div>

          <div className={styles.metricsGrid} role="status" aria-live="polite" aria-atomic="true">
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Generación</span>
              <span className={styles.metricValue}>{formatNumber(generacion, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>
                {modo === 'cuevas' ? 'Células roca' : 'Células vivas'}
              </span>
              <span className={styles.metricValue}>{formatNumber(vivas, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Tamaño de la rejilla</span>
              <span className={styles.metricValue} style={{ fontSize: '1.1rem' }}>
                {COLS} × {ROWS}
              </span>
              <span className={styles.metricNote}>{formatNumber(TOTAL, 0)} células</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Regla activa</span>
              <span className={styles.metricValue} style={{ fontSize: '1.1rem' }}>
                {modo === 'vida' ? 'B3 / S23' : `≥ ${UMBRAL_CUEVA} roca`}
              </span>
            </div>
          </div>

          {modo === 'vida' && vivas === 0 && (
            <div className={styles.hint} role="status">
              <strong>Rejilla vacía:</strong> todas las células han muerto. Carga un patrón, pulsa
              «Aleatorio» o dibuja células para empezar de nuevo.
            </div>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía del Juego de la Vida y los Autómatas Celulares"
        subtitle="Reglas locales, comportamiento emergente y generación procedimental de cuevas"
      >
        <h3>Tipos de patrones en el Juego de la Vida</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo de patrón</th>
                <th>¿Cómo se comporta?</th>
                <th>Ejemplo</th>
                <th>Periodo</th>
                <th>Para qué sirve</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Naturaleza muerta</strong>
                </td>
                <td>No cambia nunca, es totalmente estable</td>
                <td>Bloque, colmena, barco</td>
                <td>1 (fijo)</td>
                <td>Memoria estable, &laquo;piezas&raquo; de circuitos</td>
              </tr>
              <tr>
                <td>
                  <strong>Oscilador</strong>
                </td>
                <td>Repite su forma cada cierto número de generaciones</td>
                <td>Blinker, sapo, pulsar</td>
                <td>2 o más</td>
                <td>Relojes y señales periódicas</td>
              </tr>
              <tr>
                <td>
                  <strong>Nave (spaceship)</strong>
                </td>
                <td>Vuelve a su forma desplazada: se mueve por la rejilla</td>
                <td>Planeador, LWSS</td>
                <td>4 (planeador)</td>
                <td>Transmitir información de un punto a otro</td>
              </tr>
              <tr>
                <td>
                  <strong>Cañón (gun)</strong>
                </td>
                <td>Oscila y, en cada ciclo, expulsa una nave</td>
                <td>Cañón de Gosper</td>
                <td>30 (Gosper)</td>
                <td>Generar un flujo infinito de naves</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usan los autómatas celulares</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🗺️
              </span>
              <strong>Generación procedimental de cuevas y mazmorras</strong>
            </div>
            <p className={styles.escenarioExample}>
              Muchos juegos crean cavernas naturales sembrando una rejilla al azar y suavizándola con
              un autómata celular. Con pocos parámetros se obtienen mapas distintos cada partida.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Cambia la densidad inicial: por debajo de ~40% salen cavernas amplias; por encima,
              túneles estrechos.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🔬
              </span>
              <strong>Simulación de sistemas complejos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Los autómatas celulares modelan la propagación de incendios, el flujo de tráfico, el
              crecimiento de cristales o patrones de pigmentación animal: muchas celdas siguiendo la
              misma regla local.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> El interés es ver cómo el comportamiento global surge sin un &laquo;director&raquo; que lo
              coordine.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🎨
              </span>
              <strong>Arte generativo</strong>
            </div>
            <p className={styles.escenarioExample}>
              Artistas y diseñadores usan autómatas celulares para crear texturas, animaciones y
              patrones que evolucionan solos, a medio camino entre el azar y la regla.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Pequeños cambios en la regla o el estado inicial producen resultados visuales muy
              distintos.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🌊
              </span>
              <strong>Modelos de propagación</strong>
            </div>
            <p className={styles.escenarioExample}>
              Epidemias, rumores o la difusión de una sustancia se estudian con celdas que cambian de
              estado según sus vecinas: un marco sencillo para entender cómo «contagia» un fenómeno.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Son modelos simplificados: útiles para intuir dinámicas, no para predicciones
              precisas.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Quién inventó el Juego de la Vida y cuándo?</h4>
            <p>
              Lo ideó el matemático británico John Conway en 1970. Se popularizó ese mismo año en la
              columna de juegos matemáticos de Martin Gardner en <em>Scientific American</em>, y desde
              entonces es el autómata celular más conocido. Conway buscaba unas reglas mínimas que
              produjeran un comportamiento rico e impredecible.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> No hace falta entender matemáticas avanzadas: las reglas caben en dos frases y aun así
              generan complejidad infinita.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué significan las reglas B3/S23?</h4>
            <p>
              Es la notación estándar de los autómatas tipo Vida. «B3» (Birth) indica que una célula
              muerta <strong>nace</strong> si tiene exactamente 3 vecinas vivas. «S23» (Survive)
              indica que una célula viva <strong>sobrevive</strong> si tiene 2 o 3 vecinas. Cualquier
              otra cantidad de vecinas hace que la célula muera o siga muerta.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Cambiando esos números se obtienen otros autómatas, como HighLife (B36/S23), que tiene
              un patrón que se autorreplica.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es la vecindad de Moore?</h4>
            <p>
              Es el conjunto de las 8 celdas que rodean a una dada: las 4 ortogonales (arriba, abajo,
              izquierda, derecha) más las 4 diagonales. El Juego de la Vida y la regla de cuevas usan
              esta vecindad. La alternativa es la vecindad de Von Neumann, que solo cuenta las 4
              ortogonales.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Con vecindad de Moore, el número máximo de vecinas vivas es 8, lo que define el rango
              de las reglas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué este simulador trata el borde como muerto en el modo Vida?</h4>
            <p>
              Es una de las dos convenciones habituales para los límites finitos. Aquí, las celdas
              fuera de la rejilla cuentan como muertas, así que los patrones que chocan contra el borde
              se distorsionan. La alternativa es un mundo toroidal, donde el lado derecho se conecta
              con el izquierdo y el de arriba con el de abajo, como si la rejilla fuera una rosquilla.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Para que un planeador no se rompa al llegar al borde, colócalo lejos de los límites o
              usa una rejilla grande.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la regla de cuevas usa umbrales distintos a los de Conway?</h4>
            <p>
              Conway (B3/S23) está afinada para que la población sea inestable y dinámica. La regla de
              cuevas, en cambio, refuerza la mayoría: si una celda tiene 5 o más vecinas roca se
              vuelve roca, y si no, hueco. Eso hace que las zonas densas crezcan y las dispersas se
              vacíen, condensando el ruido aleatorio en cavernas compactas en pocos pasos.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Es una regla &laquo;de suavizado&raquo;: tras unas pocas iteraciones el resultado se estabiliza
              y deja de cambiar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Es verdad que el Juego de la Vida puede «calcular»?</h4>
            <p>
              Sí. Está demostrado que es <strong>Turing-completo</strong>: combinando planeadores,
              cañones y otros patrones se pueden construir puertas lógicas, memoria e incluso un
              ordenador completo dentro de la propia rejilla. En teoría, puede ejecutar cualquier
              algoritmo, aunque hacerlo a mano sería extraordinariamente laborioso.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> La gente ha llegado a construir un &laquo;Juego de la Vida dentro del Juego de la Vida&raquo; y
              hasta relojes digitales funcionales.
            </p>
          </div>
        </div>

        <h3>Cómo se calcula una generación</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Copia el estado actual</strong>
              <p>
                Todas las células se actualizan a la vez. Por eso se trabaja sobre una copia: si fueras
                modificando la rejilla original, las celdas ya cambiadas falsearían el cálculo de sus
                vecinas.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Cuenta las vecinas vivas de cada célula</strong>
              <p>
                Para cada celda, mira sus 8 vecinas (vecindad de Moore) y cuenta cuántas están vivas.
                Las celdas fuera de la rejilla cuentan como muertas (o como roca, en el modo cuevas).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Aplica la regla</strong>
              <p>
                En Vida: viva con 2 o 3 vecinas sobrevive; muerta con 3 nace; el resto muere. En
                cuevas: roca si tiene 5 o más vecinas roca, hueco si tiene menos.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Escribe el resultado en la copia</strong>
              <p>
                Cada nuevo estado se guarda en la rejilla copia, sin tocar la original hasta haber
                calculado todas las celdas.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Reemplaza y repite</strong>
              <p>
                La copia pasa a ser el estado actual y se incrementa el contador de generación. Repite
                el proceso para avanzar otra generación.
              </p>
            </div>
          </div>
        </div>

        <h3>Consejos para experimentar e implementarlo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Actualiza con doble búfer</strong>
            <p>
              Calcula la siguiente generación en una segunda rejilla y luego intercámbialas. Modificar
              la rejilla en el sitio rompe la regla de simultaneidad.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Empieza con un planeador</strong>
            <p>
              Carga el planeador y ponlo en marcha: es la forma más rápida de ver una nave que se
              desplaza y entender el concepto de patrón móvil.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Ajusta la densidad de las cuevas</strong>
            <p>
              La densidad inicial cambia por completo el resultado: explora valores entre el 40% y el
              50% para cavernas con buen aspecto.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Decide qué pasa en los bordes</strong>
            <p>
              Antes de programar, elige entre borde muerto, borde fijo o mundo toroidal. Cada opción
              cambia cómo se comportan los patrones cerca del límite.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Usa arrays planos</strong>
            <p>
              Una rejilla es más rápida como array de una dimensión con índice fila × ancho + columna
              que como matriz de matrices, sobre todo en mapas grandes.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Conecta las cuevas resultantes</strong>
            <p>
              El suavizado puede dejar cavernas aisladas. En un juego real conviene detectar regiones y
              unir las que queden separadas para que el mapa sea jugable.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">
              ⚠
            </span>
            <strong>Errores frecuentes al programar un autómata celular</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              Modificar la rejilla mientras la recorres → las células ya cambiadas falsean el recuento
              de sus vecinas.
            </li>
            <li>
              Olvidar tratar los bordes → desbordamiento de índice o vecinas «fantasma» fuera de la
              rejilla.
            </li>
            <li>
              Confundir B3/S23 con otra regla → si una célula viva con 1 vecina sobrevive, deja de ser
              el Juego de la Vida.
            </li>
            <li>
              Recrear la rejilla entera en cada frame del render en lugar de actualizar solo lo que
              cambia → caída de rendimiento en mapas grandes.
            </li>
            <li>
              Esperar que el Juego de la Vida sea «un juego» con jugador: no lo es, solo eliges el
              estado inicial.
            </li>
            <li>
              En cuevas, no controlar la densidad inicial → mapas todo roca o todo hueco, sin cavernas
              útiles.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-automatas-celulares')} />
      <ShareCard appName="simulador-automatas-celulares" />
      <Footer appName="simulador-automatas-celulares" />
    </div>
  );
}
