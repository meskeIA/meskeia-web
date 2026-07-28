'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeneradorLaberintos.module.css';
import impresion from '@/styles/impresion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────────────────────

type Trazado = 'pasillos' | 'ramificado';

/** Paredes de cada casilla: arriba, derecha, abajo, izquierda */
interface Casilla {
  paredes: [boolean, boolean, boolean, boolean];
  visitada: boolean;
}

interface Laberinto {
  celdas: Casilla[][];
  filas: number;
  columnas: number;
  camino: { fila: number; col: number }[];
  callejones: number;
  semilla: number;
}

const ETIQUETAS_TRAZADO: Record<Trazado, { nombre: string; detalle: string }> = {
  pasillos: {
    nombre: 'Pasillos largos',
    detalle: 'Corredores serpenteantes, pocas bifurcaciones',
  },
  ramificado: {
    nombre: 'Muy ramificado',
    detalle: 'Muchos desvíos cortos y callejones sin salida',
  },
};

/** Desplazamientos en el orden arriba, derecha, abajo, izquierda */
const VECINOS: ReadonlyArray<readonly [number, number, number, number]> = [
  [-1, 0, 0, 2], // arriba: abre pared 0 propia y 2 del vecino
  [0, 1, 1, 3], // derecha
  [1, 0, 2, 0], // abajo
  [0, -1, 3, 1], // izquierda
];

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Generador con semilla: el mismo número produce siempre el mismo laberinto */
function crearAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function crearRejilla(filas: number, columnas: number): Casilla[][] {
  return Array.from({ length: filas }, () =>
    Array.from({ length: columnas }, () => ({
      paredes: [true, true, true, true] as [boolean, boolean, boolean, boolean],
      visitada: false,
    })),
  );
}

/** Recorrido en profundidad: derriba paredes avanzando lo máximo posible antes de retroceder */
function excavarEnProfundidad(celdas: Casilla[][], aleatorio: () => number): void {
  const filas = celdas.length;
  const columnas = celdas[0].length;
  const pila: { fila: number; col: number }[] = [{ fila: 0, col: 0 }];
  celdas[0][0].visitada = true;

  while (pila.length > 0) {
    const actual = pila[pila.length - 1];
    const disponibles = VECINOS.map((v, i) => ({ v, i })).filter(({ v }) => {
      const f = actual.fila + v[0];
      const c = actual.col + v[1];
      return f >= 0 && f < filas && c >= 0 && c < columnas && !celdas[f][c].visitada;
    });

    if (disponibles.length === 0) {
      pila.pop();
      continue;
    }

    const elegido = disponibles[Math.floor(aleatorio() * disponibles.length)].v;
    const f = actual.fila + elegido[0];
    const c = actual.col + elegido[1];

    celdas[actual.fila][actual.col].paredes[elegido[2]] = false;
    celdas[f][c].paredes[elegido[3]] = false;
    celdas[f][c].visitada = true;
    pila.push({ fila: f, col: c });
  }
}

/** Crecimiento tipo Prim: expande la frontera al azar y genera muchos desvíos cortos */
function excavarPorFrontera(celdas: Casilla[][], aleatorio: () => number): void {
  const filas = celdas.length;
  const columnas = celdas[0].length;
  celdas[0][0].visitada = true;

  const frontera: { fila: number; col: number; desde: { fila: number; col: number }; dir: number }[] = [];

  const anadirFrontera = (fila: number, col: number) => {
    VECINOS.forEach((v, i) => {
      const f = fila + v[0];
      const c = col + v[1];
      if (f >= 0 && f < filas && c >= 0 && c < columnas && !celdas[f][c].visitada) {
        frontera.push({ fila: f, col: c, desde: { fila, col }, dir: i });
      }
    });
  };

  anadirFrontera(0, 0);

  while (frontera.length > 0) {
    const indice = Math.floor(aleatorio() * frontera.length);
    const paso = frontera.splice(indice, 1)[0];

    if (celdas[paso.fila][paso.col].visitada) continue;

    const v = VECINOS[paso.dir];
    celdas[paso.desde.fila][paso.desde.col].paredes[v[2]] = false;
    celdas[paso.fila][paso.col].paredes[v[3]] = false;
    celdas[paso.fila][paso.col].visitada = true;

    anadirFrontera(paso.fila, paso.col);
  }
}

/** Camino más corto entre entrada y salida; al ser un árbol, es el único camino posible */
function buscarCamino(celdas: Casilla[][]): { fila: number; col: number }[] {
  const filas = celdas.length;
  const columnas = celdas[0].length;
  const previo = new Map<string, string | null>();
  const cola: { fila: number; col: number }[] = [{ fila: 0, col: 0 }];
  previo.set('0-0', null);

  while (cola.length > 0) {
    const actual = cola.shift()!;
    if (actual.fila === filas - 1 && actual.col === columnas - 1) break;

    VECINOS.forEach((v, i) => {
      if (celdas[actual.fila][actual.col].paredes[i]) return;
      const f = actual.fila + v[0];
      const c = actual.col + v[1];
      if (f < 0 || f >= filas || c < 0 || c >= columnas) return;
      const clave = `${f}-${c}`;
      if (previo.has(clave)) return;
      previo.set(clave, `${actual.fila}-${actual.col}`);
      cola.push({ fila: f, col: c });
    });
  }

  const camino: { fila: number; col: number }[] = [];
  let clave: string | null | undefined = `${filas - 1}-${columnas - 1}`;
  while (clave) {
    const [f, c] = clave.split('-').map(Number);
    camino.unshift({ fila: f, col: c });
    clave = previo.get(clave) ?? null;
  }
  return camino;
}

/** Casillas con tres paredes: callejones sin salida, el indicador real de dificultad */
function contarCallejones(celdas: Casilla[][]): number {
  let total = 0;
  celdas.forEach((fila) =>
    fila.forEach((casilla) => {
      if (casilla.paredes.filter(Boolean).length === 3) total += 1;
    }),
  );
  return total;
}

function generarLaberinto(filas: number, columnas: number, trazado: Trazado, semilla: number): Laberinto {
  const aleatorio = crearAleatorio(semilla);
  const celdas = crearRejilla(filas, columnas);

  if (trazado === 'pasillos') {
    excavarEnProfundidad(celdas, aleatorio);
  } else {
    excavarPorFrontera(celdas, aleatorio);
  }

  // Apertura de entrada (arriba a la izquierda) y salida (abajo a la derecha)
  celdas[0][0].paredes[0] = false;
  celdas[filas - 1][columnas - 1].paredes[2] = false;

  return {
    celdas,
    filas,
    columnas,
    camino: buscarCamino(celdas),
    callejones: contarCallejones(celdas),
    semilla,
  };
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

const LADO = 10; // unidades SVG por casilla

export default function GeneradorLaberintosPage() {
  const [titulo, setTitulo] = useState('Laberinto');
  const [columnas, setColumnas] = useState(15);
  const [filas, setFilas] = useState(15);
  const [trazado, setTrazado] = useState<Trazado>('pasillos');
  const [semillaManual, setSemillaManual] = useState('');
  const [laberinto, setLaberinto] = useState<Laberinto | null>(null);
  const [mostrarSolucion, setMostrarSolucion] = useState(false);

  const generar = useCallback(() => {
    const base = Number(semillaManual.replace(/\D/g, ''));
    const semilla = base > 0 ? base : Math.floor(Math.random() * 900000) + 100000;
    setLaberinto(generarLaberinto(filas, columnas, trazado, semilla));
    setMostrarSolucion(false);
  }, [filas, columnas, trazado, semillaManual]);

  /** Segmentos de pared en coordenadas SVG */
  const paredes: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (laberinto) {
    laberinto.celdas.forEach((fila, f) => {
      fila.forEach((casilla, c) => {
        const x = c * LADO;
        const y = f * LADO;
        if (casilla.paredes[0]) paredes.push({ x1: x, y1: y, x2: x + LADO, y2: y });
        if (casilla.paredes[1]) paredes.push({ x1: x + LADO, y1: y, x2: x + LADO, y2: y + LADO });
        if (casilla.paredes[2]) paredes.push({ x1: x, y1: y + LADO, x2: x + LADO, y2: y + LADO });
        if (casilla.paredes[3]) paredes.push({ x1: x, y1: y, x2: x, y2: y + LADO });
      });
    });
  }

  const puntosCamino = laberinto
    ? laberinto.camino.map((p) => `${p.col * LADO + LADO / 2},${p.fila * LADO + LADO / 2}`).join(' ')
    : '';

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🌀</span> Generador de Laberintos
          </h1>
          <p className={styles.subtitle}>
            Laberintos con salida única garantizada, listos para imprimir y resolver a lápiz.
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">⚙️</span> Configura el laberinto
            </h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título de la hoja</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={60}
                placeholder="Laberinto"
              />
            </label>

            <div className={styles.filaCampos}>
              <label className={styles.campo}>
                <span className={styles.etiqueta}>Ancho (columnas)</span>
                <select
                  className={styles.select}
                  value={columnas}
                  onChange={(e) => setColumnas(Number(e.target.value))}
                >
                  {[8, 10, 12, 15, 20, 25, 32].map((n) => (
                    <option key={n} value={n}>
                      {n} casillas
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.campo}>
                <span className={styles.etiqueta}>Alto (filas)</span>
                <select
                  className={styles.select}
                  value={filas}
                  onChange={(e) => setFilas(Number(e.target.value))}
                >
                  {[8, 10, 12, 15, 20, 25, 32].map((n) => (
                    <option key={n} value={n}>
                      {n} casillas
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Tipo de trazado</span>
              <div className={styles.grupoBotones} role="group" aria-label="Tipo de trazado">
                {(Object.keys(ETIQUETAS_TRAZADO) as Trazado[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.btnOpcion} ${trazado === t ? styles.btnOpcionActivo : ''}`}
                    aria-pressed={trazado === t}
                    onClick={() => setTrazado(t)}
                  >
                    <strong>{ETIQUETAS_TRAZADO[t].nombre}</strong>
                    <small>{ETIQUETAS_TRAZADO[t].detalle}</small>
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nº de laberinto (opcional)</span>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={semillaManual}
                onChange={(e) => setSemillaManual(e.target.value)}
                placeholder="Al azar"
                maxLength={7}
              />
            </label>

            <button type="button" className={styles.btnPrimary} onClick={generar}>
              <span aria-hidden="true">✨</span> Generar laberinto
            </button>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">🖨️</span> Dificultad e impresión
            </h2>

            {!laberinto ? (
              <p className={styles.vacio}>
                Elige el tamaño y el trazado y pulsa <strong>Generar</strong>. El laberinto aparecerá
                debajo con su medida de dificultad.
              </p>
            ) : (
              <>
                <div className={styles.metricas}>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{formatNumber(laberinto.camino.length, 0)}</span>
                    <span className={styles.metricaEtiqueta}>casillas del camino correcto</span>
                  </div>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{formatNumber(laberinto.callejones, 0)}</span>
                    <span className={styles.metricaEtiqueta}>callejones sin salida</span>
                  </div>
                  <div className={styles.metrica}>
                    <span className={styles.metricaValor}>{laberinto.semilla}</span>
                    <span className={styles.metricaEtiqueta}>nº de laberinto</span>
                  </div>
                </div>

                <p className={styles.pista}>
                  Los callejones sin salida son el mejor indicador de dificultad: un laberinto con muchos
                  obliga a decidir a cada paso, mientras que uno con pocos se recorre casi de un tirón.
                </p>

                <div className={styles.acciones}>
                  <button
                    type="button"
                    className={styles.btnSecundario}
                    aria-pressed={mostrarSolucion}
                    onClick={() => setMostrarSolucion(!mostrarSolucion)}
                  >
                    <span aria-hidden="true">{mostrarSolucion ? '🙈' : '💡'}</span>{' '}
                    {mostrarSolucion ? 'Ocultar solución' : 'Ver solución'}
                  </button>

                  <button type="button" className={styles.btnSecundario} onClick={() => window.print()}>
                    <span aria-hidden="true">🖨️</span> Imprimir esta vista
                  </button>

                  <button type="button" className={styles.btnSecundario} onClick={generar}>
                    <span aria-hidden="true">🔄</span> Otro distinto
                  </button>
                </div>

                <p className={styles.pista}>
                  El dibujo es vectorial, así que se imprime nítido a cualquier tamaño. En el diálogo de
                  impresión puedes elegir «Guardar como PDF».
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área imprimible */}
      {laberinto && (
        <div className={`${styles.printArea} ${impresion.hoja}`}>
          <h2 className={styles.tituloHoja}>{titulo || 'Laberinto'}</h2>

          <div className={styles.lienzo}>
            <svg
              viewBox={`-1 -1 ${laberinto.columnas * LADO + 2} ${laberinto.filas * LADO + 2}`}
              className={styles.svg}
              role="img"
              aria-label={`Laberinto de ${laberinto.columnas} por ${laberinto.filas} casillas. Entrada arriba a la izquierda, salida abajo a la derecha. El camino correcto mide ${laberinto.camino.length} casillas.`}
            >
              {mostrarSolucion && (
                <polyline
                  points={puntosCamino}
                  className={styles.camino}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {paredes.map((p, i) => (
                <line
                  key={i}
                  x1={p.x1}
                  y1={p.y1}
                  x2={p.x2}
                  y2={p.y2}
                  className={styles.pared}
                  strokeLinecap="square"
                />
              ))}
            </svg>
          </div>

          <div className={styles.leyenda}>
            <span>
              <span aria-hidden="true">⬇️</span> Entrada: arriba a la izquierda
            </span>
            <span>
              <span aria-hidden="true">🏁</span> Salida: abajo a la derecha
            </span>
          </div>

          <p className={styles.pieHoja}>
            Laberinto n.º {laberinto.semilla} · {laberinto.columnas}×{laberinto.filas} ·{' '}
            {ETIQUETAS_TRAZADO[trazado].nombre} · meskeia.com
          </p>
        </div>
      )}

      <div className={impresion.noImprimir}>
        <EducationalSection
          icon="📚"
          title="Cómo se construye un laberinto y cómo se resuelve"
          subtitle="La regla matemática que garantiza la salida, y los métodos que siempre funcionan"
        >
          <section className={styles.guideSection}>
            <h2>Por qué siempre hay salida</h2>
            <p>
              Un laberinto bien construido no es un dibujo caprichoso: es un <strong>árbol</strong>. Se
              parte de una cuadrícula donde todas las casillas están amuralladas y se van derribando
              paredes con una única condición, que nunca se conecte una casilla ya alcanzable. El
              resultado conecta todas las casillas sin formar ningún bucle, y esa propiedad tiene una
              consecuencia directa: entre dos casillas cualesquiera existe un camino, y solo uno.
            </p>
            <p>
              De ahí que no haga falta comprobar después si el laberinto tiene solución. La tiene por
              construcción, y además es única: no existen dos rutas correctas distintas ni atajos
              alternativos. Los laberintos con bucles son otra familia distinta, más difícil de resolver
              con método pero también más frustrante en papel.
            </p>

            <h2>Los dos trazados y en qué se notan</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Pasillos largos</th>
                    <th>Muy ramificado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Cómo crece</strong>
                    </td>
                    <td>Avanza en profundidad hasta agotar el camino y retrocede</td>
                    <td>Se expande desde toda la frontera a la vez, en cualquier dirección</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Aspecto</strong>
                    </td>
                    <td>Corredores largos y sinuosos</td>
                    <td>Tramos cortos con desvíos constantes</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Callejones sin salida</strong>
                    </td>
                    <td>Pocos, pero muy profundos</td>
                    <td>Muchos y breves</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Sensación al resolver</strong>
                    </td>
                    <td>Avanzas mucho antes de descubrir el error</td>
                    <td>Decides continuamente, pero rectificas rápido</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Recomendado para</strong>
                    </td>
                    <td>Quien empieza: el error tarda en llegar</td>
                    <td>Quien busca un reto y trabaja con lápiz y goma</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Métodos que siempre funcionan</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🖐️
                  </span>
                  <h3>La mano en la pared</h3>
                </div>
                <p>
                  Apoyar siempre la mano derecha (o siempre la izquierda) en la pared y no despegarla
                  garantiza llegar a la salida en un laberinto sin bucles. Es lento porque recorre todos
                  los callejones, pero nunca falla y no requiere memoria.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    ↩️
                  </span>
                  <h3>Desde la salida hacia atrás</h3>
                </div>
                <p>
                  Resolver en sentido inverso suele ser más rápido: cerca de la meta hay menos
                  bifurcaciones que cerca de la entrada, porque el camino correcto ya ha descartado casi
                  todas las ramas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    ✏️
                  </span>
                  <h3>Tachar los callejones</h3>
                </div>
                <p>
                  Es la técnica de quien va con lápiz: en lugar de buscar el camino bueno, se rellenan
                  los callejones sin salida. Lo que queda sin tachar es la ruta correcta, y el método
                  progresa aunque uno se despiste.
                </p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Un laberinto más grande es más difícil?
                </h4>
                <p>
                  No necesariamente. El tamaño alarga el tiempo, pero la dificultad real la marcan las
                  decisiones: cuántas bifurcaciones hay y cuánto tarda uno en descubrir que se equivocó.
                  Por eso esta app muestra la longitud del camino y el número de callejones sin salida,
                  que son las dos cifras que de verdad predicen si se atascará quien lo resuelva.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Puedo imprimir varios laberintos distintos de golpe?
                </h4>
                <p>
                  Cada generación produce una hoja. Para preparar un cuadernillo conviene generar,
                  imprimir o guardar como PDF, y repetir. Anotando los números de laberinto se puede
                  reconstruir después la colección exacta, incluida la solución de cada uno.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Dónde están la entrada y la salida?
                </h4>
                <p>
                  La entrada está siempre en la esquina superior izquierda, con la pared de arriba
                  abierta, y la salida en la esquina inferior derecha, con la pared de abajo abierta. Es
                  la convención más habitual en pasatiempos impresos y evita tener que señalarlas con
                  flechas que ensucian el dibujo.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿La solución se puede imprimir aparte?
                </h4>
                <p>
                  Sí. Se imprime siempre lo que hay en pantalla, así que basta imprimir primero con la
                  solución oculta y después activarla e imprimir de nuevo. Muchos usan la segunda hoja
                  como plantilla de corrección cuando reparten el mismo laberinto a un grupo.
                </p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores al preparar laberintos impresos</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Elegir 32×32 para quien empieza:</strong> las casillas quedan diminutas en A4 y
                  el trazo del lápiz tapa las paredes; por debajo de los ocho años, 10×10 es suficiente.
                </li>
                <li>
                  <strong>Confundir tamaño con dificultad:</strong> un laberinto grande de pasillos largos
                  puede resolverse antes que uno pequeño y muy ramificado.
                </li>
                <li>
                  <strong>No anotar el número de laberinto:</strong> sin él es imposible reimprimir la
                  misma hoja, y la solución que guardaste dejará de corresponder al ejercicio.
                </li>
                <li>
                  <strong>Imprimir con la solución visible:</strong> conviene mirar el botón antes de
                  enviar a la impresora, porque se imprime exactamente lo que se ve.
                </li>
                <li>
                  <strong>Usar rectángulos muy alargados:</strong> un 32×8 se recorre casi en línea recta;
                  las proporciones cuadradas reparten mejor las bifurcaciones.
                </li>
                <li>
                  <strong>Fotografiar la pantalla en vez de imprimir:</strong> se pierde la nitidez del
                  dibujo vectorial y las paredes finas se emborronan al ampliar.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-laberintos')} />

        <ShareCard appName="generador-laberintos" />

        <Footer appName="generador-laberintos" />
      </div>
    </div>
  );
}
