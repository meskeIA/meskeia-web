'use client';
// @disclaimer: exempt

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
import styles from './VisualizadorQuadtree.module.css';

// ============== TIPOS Y CONSTANTES ==============

const ANCHO = 760;
const ALTO = 520;
const RADIO_PUNTO = 3.5;

interface Punto {
  x: number;
  y: number;
}

interface Rectangulo {
  x: number; // esquina superior izquierda
  y: number;
  w: number;
  h: number;
}

// Nodo del quadtree: cubre un rectángulo (limite) y guarda hasta `capacidad`
// puntos. Al superarla, se subdivide en 4 hijos (NO, NE, SO, SE) y NO vuelve a
// guardar puntos en sí mismo (todos pasan a los hijos).
interface NodoQuadtree {
  limite: Rectangulo;
  capacidad: number;
  puntos: Punto[];
  dividido: boolean;
  no: NodoQuadtree | null; // noroeste
  ne: NodoQuadtree | null; // noreste
  so: NodoQuadtree | null; // suroeste
  se: NodoQuadtree | null; // sureste
}

// Resultado de una consulta de rango: puntos encontrados + nodos visitados.
interface ResultadoConsulta {
  encontrados: Punto[];
  nodosVisitados: number;
}

// ============== GEOMETRÍA ==============

// ¿El punto cae dentro del rectángulo? (borde superior/izquierdo incluido)
function contiene(r: Rectangulo, p: Punto): boolean {
  return p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;
}

// ¿Se solapan dos rectángulos?
function intersecta(a: Rectangulo, b: Rectangulo): boolean {
  return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y);
}

// ============== QUADTREE ==============

function crearNodo(limite: Rectangulo, capacidad: number): NodoQuadtree {
  return {
    limite,
    capacidad,
    puntos: [],
    dividido: false,
    no: null,
    ne: null,
    so: null,
    se: null,
  };
}

// Subdivide un nodo en sus 4 cuadrantes y reparte sus puntos entre los hijos.
// Importante: tras subdividir, los puntos del nodo se reinsertan en los hijos
// (no se quedan duplicados en el padre).
function subdividir(nodo: NodoQuadtree): void {
  const { x, y, w, h } = nodo.limite;
  const mw = w / 2;
  const mh = h / 2;
  const cap = nodo.capacidad;

  nodo.no = crearNodo({ x, y, w: mw, h: mh }, cap);
  nodo.ne = crearNodo({ x: x + mw, y, w: mw, h: mh }, cap);
  nodo.so = crearNodo({ x, y: y + mh, w: mw, h: mh }, cap);
  nodo.se = crearNodo({ x: x + mw, y: y + mh, w: mw, h: mh }, cap);
  nodo.dividido = true;

  // Reinsertar los puntos acumulados en los hijos correspondientes.
  const pendientes = nodo.puntos;
  nodo.puntos = [];
  for (const p of pendientes) {
    insertarEnHijos(nodo, p);
  }
}

// Inserta un punto en el hijo que lo contiene (asume nodo ya subdividido).
function insertarEnHijos(nodo: NodoQuadtree, p: Punto): boolean {
  if (nodo.no && insertar(nodo.no, p)) return true;
  if (nodo.ne && insertar(nodo.ne, p)) return true;
  if (nodo.so && insertar(nodo.so, p)) return true;
  if (nodo.se && insertar(nodo.se, p)) return true;
  return false;
}

// Inserción recursiva. Devuelve false si el punto cae fuera del límite del nodo.
function insertar(nodo: NodoQuadtree, p: Punto): boolean {
  if (!contiene(nodo.limite, p)) return false;

  if (!nodo.dividido && nodo.puntos.length < nodo.capacidad) {
    nodo.puntos.push(p);
    return true;
  }

  if (!nodo.dividido) {
    subdividir(nodo);
  }

  return insertarEnHijos(nodo, p);
}

// Construye el árbol completo desde una lista de puntos.
function construirQuadtree(puntos: Punto[], capacidad: number): NodoQuadtree {
  const raiz = crearNodo({ x: 0, y: 0, w: ANCHO, h: ALTO }, capacidad);
  for (const p of puntos) {
    insertar(raiz, p);
  }
  return raiz;
}

// Consulta de rango: puntos dentro de `rango`, contando los nodos visitados.
function consultarRango(nodo: NodoQuadtree, rango: Rectangulo): ResultadoConsulta {
  const encontrados: Punto[] = [];
  let nodosVisitados = 0;

  const recorrer = (n: NodoQuadtree): void => {
    nodosVisitados++;
    // Si el nodo no se solapa con el rango, se descarta entero (poda).
    if (!intersecta(n.limite, rango)) return;

    for (const p of n.puntos) {
      if (contiene(rango, p)) encontrados.push(p);
    }
    if (n.dividido) {
      if (n.no) recorrer(n.no);
      if (n.ne) recorrer(n.ne);
      if (n.so) recorrer(n.so);
      if (n.se) recorrer(n.se);
    }
  };

  recorrer(nodo);
  return { encontrados, nodosVisitados };
}

// Métricas del árbol: nº de nodos y profundidad máxima.
function metricasArbol(nodo: NodoQuadtree): { nodos: number; profundidad: number } {
  let nodos = 0;
  let profundidad = 0;

  const recorrer = (n: NodoQuadtree, nivel: number): void => {
    nodos++;
    if (nivel > profundidad) profundidad = nivel;
    if (n.dividido) {
      if (n.no) recorrer(n.no, nivel + 1);
      if (n.ne) recorrer(n.ne, nivel + 1);
      if (n.so) recorrer(n.so, nivel + 1);
      if (n.se) recorrer(n.se, nivel + 1);
    }
  };

  recorrer(nodo, 0);
  return { nodos, profundidad };
}

// ============== DIBUJO ==============

// Lee un color de la paleta meskeIA desde las variables CSS.
function leerColor(nombre: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  return valor || fallback;
}

// Dibuja recursivamente las líneas de subdivisión de cada nodo.
function dibujarNodo(ctx: CanvasRenderingContext2D, nodo: NodoQuadtree, colorLinea: string): void {
  ctx.strokeStyle = colorLinea;
  ctx.lineWidth = 1;
  ctx.strokeRect(nodo.limite.x, nodo.limite.y, nodo.limite.w, nodo.limite.h);
  if (nodo.dividido) {
    if (nodo.no) dibujarNodo(ctx, nodo.no, colorLinea);
    if (nodo.ne) dibujarNodo(ctx, nodo.ne, colorLinea);
    if (nodo.so) dibujarNodo(ctx, nodo.so, colorLinea);
    if (nodo.se) dibujarNodo(ctx, nodo.se, colorLinea);
  }
}

// ============== COMPONENTE PRINCIPAL ==============

export default function VisualizadorQuadtreePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arrastrandoRango = useRef<boolean>(false);
  const inicioRango = useRef<Punto | null>(null);

  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [capacidad, setCapacidad] = useState<number>(4);
  const [modo, setModo] = useState<'anadir' | 'consultar'>('anadir');
  const [rangoConsulta, setRangoConsulta] = useState<Rectangulo | null>(null);

  // El árbol se reconstruye cuando cambian los puntos o la capacidad.
  const arbol = useMemo(() => construirQuadtree(puntos, capacidad), [puntos, capacidad]);

  const { nodos, profundidad } = useMemo(() => metricasArbol(arbol), [arbol]);

  // Resultado de la consulta de rango activa.
  const consulta = useMemo<ResultadoConsulta | null>(() => {
    if (!rangoConsulta || rangoConsulta.w < 1 || rangoConsulta.h < 1) return null;
    return consultarRango(arbol, rangoConsulta);
  }, [arbol, rangoConsulta]);

  // Convierte coordenadas de puntero a coordenadas internas del lienzo.
  const coordenadasLienzo = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Punto => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * ANCHO;
    const y = ((e.clientY - rect.top) / rect.height) * ALTO;
    return {
      x: Math.max(0, Math.min(ANCHO - 0.001, x)),
      y: Math.max(0, Math.min(ALTO - 0.001, y)),
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const p = coordenadasLienzo(e);
      if (modo === 'anadir') {
        setRangoConsulta(null);
        setPuntos((prev) => [...prev, p]);
      } else {
        // Inicio del rectángulo de consulta.
        arrastrandoRango.current = true;
        inicioRango.current = p;
        setRangoConsulta({ x: p.x, y: p.y, w: 0, h: 0 });
      }
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // setPointerCapture puede fallar en algunos navegadores; no es crítico.
      }
    },
    [coordenadasLienzo, modo],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const p = coordenadasLienzo(e);
      if (modo === 'anadir') {
        // Arrastre con el botón pulsado = pintar puntos.
        if (e.buttons === 1) {
          setPuntos((prev) => [...prev, p]);
        }
      } else if (arrastrandoRango.current && inicioRango.current) {
        const ini = inicioRango.current;
        setRangoConsulta({
          x: Math.min(ini.x, p.x),
          y: Math.min(ini.y, p.y),
          w: Math.abs(p.x - ini.x),
          h: Math.abs(p.y - ini.y),
        });
      }
    },
    [coordenadasLienzo, modo],
  );

  const handlePointerUp = useCallback(() => {
    arrastrandoRango.current = false;
    inicioRango.current = null;
  }, []);

  const anadirAleatorios = useCallback((n: number) => {
    setRangoConsulta(null);
    setPuntos((prev) => {
      const nuevos: Punto[] = [];
      for (let i = 0; i < n; i++) {
        nuevos.push({
          x: Math.random() * (ANCHO - 1),
          y: Math.random() * (ALTO - 1),
        });
      }
      return [...prev, ...nuevos];
    });
  }, []);

  const limpiar = useCallback(() => {
    setPuntos([]);
    setRangoConsulta(null);
  }, []);

  // Redibuja el lienzo cada vez que cambia algo relevante.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dark =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark';

    const colorFondo = dark ? '#1f2937' : '#f5f9fc';
    const colorLinea = dark ? leerColor('--accent', '#7FB3D3') : leerColor('--primary', '#2E86AB');
    const colorPunto = dark ? '#cbd5e1' : '#334155';
    const colorPuntoSel = leerColor('--secondary', '#48A9A6');
    const colorRango = '#dc2626';

    ctx.clearRect(0, 0, ANCHO, ALTO);
    ctx.fillStyle = colorFondo;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    // Líneas de subdivisión del árbol.
    ctx.globalAlpha = 0.55;
    dibujarNodo(ctx, arbol, colorLinea);
    ctx.globalAlpha = 1;

    // Conjunto de puntos seleccionados por la consulta (para resaltarlos).
    const seleccionados = new Set<Punto>();
    if (consulta) {
      for (const p of consulta.encontrados) seleccionados.add(p);
    }

    // Puntos.
    for (const p of puntos) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, seleccionados.has(p) ? RADIO_PUNTO + 1.5 : RADIO_PUNTO, 0, Math.PI * 2);
      ctx.fillStyle = seleccionados.has(p) ? colorPuntoSel : colorPunto;
      ctx.fill();
    }

    // Rectángulo de consulta de rango.
    if (rangoConsulta && rangoConsulta.w > 0 && rangoConsulta.h > 0) {
      ctx.strokeStyle = colorRango;
      ctx.lineWidth = 2;
      ctx.strokeRect(rangoConsulta.x, rangoConsulta.y, rangoConsulta.w, rangoConsulta.h);
      ctx.fillStyle = 'rgba(220, 38, 38, 0.08)';
      ctx.fillRect(rangoConsulta.x, rangoConsulta.y, rangoConsulta.w, rangoConsulta.h);
    }
  }, [arbol, puntos, rangoConsulta, consulta]);

  const ahorro =
    consulta && puntos.length > 0
      ? Math.max(0, Math.round((1 - consulta.nodosVisitados / puntos.length) * 100))
      : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Visualizador de Quadtree</h1>
        <p className={styles.subtitle}>
          Partición espacial paso a paso: cómo un quadtree divide el espacio en cuadrantes para
          acelerar las colisiones y las consultas de rango en videojuegos
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* 1. Modo de interacción */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Elige qué hacer con el ratón</h2>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'anadir' ? styles.modoActive : ''}`}
              onClick={() => setModo('anadir')}
              aria-pressed={modo === 'anadir'}
            >
              <span className={styles.modoNombre}>
                <span aria-hidden="true">✏️</span> Añadir puntos
              </span>
              <span className={styles.modoDesc}>Clic o arrastre sobre el lienzo</span>
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'consultar' ? styles.modoActive : ''}`}
              onClick={() => setModo('consultar')}
              aria-pressed={modo === 'consultar'}
            >
              <span className={styles.modoNombre}>
                <span aria-hidden="true">🔍</span> Consultar rango
              </span>
              <span className={styles.modoDesc}>Arrastra un rectángulo de selección</span>
            </button>
          </div>
        </div>

        {/* 2. Lienzo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. El quadtree</h2>
          <div className={styles.hint}>
            {modo === 'anadir' ? (
              <>
                <strong>Haz clic o arrastra</strong> sobre el lienzo para añadir puntos. Cuando un
                nodo supera la capacidad, se subdivide en 4 cuadrantes (NO, NE, SO, SE) y reparte sus
                puntos.
              </>
            ) : (
              <>
                <strong>Arrastra un rectángulo</strong> sobre el lienzo. Se resaltan los puntos que
                caen dentro y se cuenta cuántos nodos visita el quadtree frente a comprobar todos los
                puntos por fuerza bruta.
              </>
            )}
          </div>

          <div className={styles.canvasWrapper}>
            <canvas
              ref={canvasRef}
              width={ANCHO}
              height={ALTO}
              className={styles.canvas}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              aria-label={
                'Lienzo interactivo del quadtree. ' +
                (modo === 'anadir'
                  ? 'Modo añadir: haz clic o arrastra para colocar puntos; el árbol subdivide el espacio automáticamente.'
                  : 'Modo consulta: arrastra un rectángulo para seleccionar puntos de una región.') +
                ` Actualmente hay ${puntos.length} puntos, ${nodos} nodos y profundidad máxima ${profundidad}.`
              }
            />
          </div>

          {/* Leyenda */}
          <div className={styles.leyenda}>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.lPunto}`} aria-hidden="true" /> Punto
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.lSeleccionado}`} aria-hidden="true" />{' '}
              Dentro del rango
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.lLinea}`} aria-hidden="true" />{' '}
              Subdivisión
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.lRango}`} aria-hidden="true" /> Rango
              de consulta
            </span>
          </div>
        </div>

        {/* 3. Controles */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>3. Ajusta y experimenta</h2>

          <div className={styles.sliderControl}>
            <label htmlFor="capacidad-slider">
              Capacidad por nodo:{' '}
              <span className={styles.sliderValue}>{capacidad}</span> punto(s) antes de subdividir
            </label>
            <input
              id="capacidad-slider"
              type="range"
              min={1}
              max={8}
              step={1}
              value={capacidad}
              onChange={(e) => setCapacidad(parseInt(e.target.value, 10))}
            />
            <p className={styles.sliderNota}>
              Capacidad baja → árbol más profundo y más nodos. Capacidad alta → menos subdivisión.
            </p>
          </div>

          <div className={styles.actionRow}>
            <button type="button" className={styles.actionBtn} onClick={() => anadirAleatorios(50)}>
              <span aria-hidden="true">🎲</span> Añadir 50 puntos aleatorios
            </button>
            <button type="button" className={styles.actionBtn} onClick={() => anadirAleatorios(200)}>
              <span aria-hidden="true">🎲</span> Añadir 200 puntos
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.dangerBtn}`}
              onClick={limpiar}
            >
              <span aria-hidden="true">🧹</span> Limpiar
            </button>
          </div>
        </div>

        {/* 4. Métricas */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>4. Estado del árbol</h2>
          <div className={styles.metricsGrid} role="status" aria-live="polite" aria-atomic="true">
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Puntos</span>
              <span className={styles.metricValue}>{formatNumber(puntos.length, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Nodos del árbol</span>
              <span className={styles.metricValue}>{formatNumber(nodos, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Profundidad máxima</span>
              <span className={styles.metricValue}>{formatNumber(profundidad, 0)}</span>
            </div>
          </div>

          {consulta ? (
            <div className={styles.consultaPanel} role="status" aria-live="polite" aria-atomic="true">
              <h3 className={styles.consultaTitulo}>
                <span aria-hidden="true">🔍</span> Resultado de la consulta de rango
              </h3>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Puntos dentro</span>
                  <span className={styles.metricValue}>{formatNumber(consulta.encontrados.length, 0)}</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Nodos visitados (quadtree)</span>
                  <span className={styles.metricValue}>{formatNumber(consulta.nodosVisitados, 0)}</span>
                  <span className={styles.metricNote}>Solo las ramas que tocan el rango</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Comprobaciones por fuerza bruta</span>
                  <span className={styles.metricValue}>{formatNumber(puntos.length, 0)}</span>
                  <span className={styles.metricNote}>Habría que mirar todos los puntos</span>
                </div>
                {ahorro !== null && (
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Ahorro aproximado</span>
                    <span className={styles.metricValue}>{formatNumber(ahorro, 0)}%</span>
                    <span className={styles.metricNote}>Menos trabajo que la fuerza bruta</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.hint} role="status">
              Cambia al modo <strong>Consultar rango</strong> y arrastra un rectángulo sobre el lienzo
              para comparar el quadtree con la fuerza bruta.
            </div>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía del Quadtree (Partición Espacial)"
        subtitle="Cómo dividir el espacio en cuadrantes acelera las colisiones y las consultas espaciales"
      >
        <h3>Quadtree frente a otras formas de buscar en el espacio</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Enfoque</th>
                <th>Coste de consultar colisiones</th>
                <th>Se adapta a puntos agrupados</th>
                <th>Cuándo conviene</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fuerza bruta</strong></td>
                <td>O(n²): cada objeto contra todos</td>
                <td>No</td>
                <td>Muy pocos objetos o pruebas rápidas</td>
              </tr>
              <tr>
                <td><strong>Rejilla uniforme</strong></td>
                <td>Rápida si los objetos están repartidos</td>
                <td>Mal: celdas vacías o saturadas si se agrupan</td>
                <td>Objetos de tamaño parecido y bien distribuidos</td>
              </tr>
              <tr>
                <td><strong>Quadtree</strong></td>
                <td>≈ O(n log n) en la mayoría de casos</td>
                <td>Sí: subdivide solo donde hay densidad</td>
                <td>Escenas 2D con zonas más pobladas que otras</td>
              </tr>
              <tr>
                <td><strong>Árbol k-d</strong></td>
                <td>≈ O(log n) por consulta</td>
                <td>Sí, divide por mediana en cada eje</td>
                <td>Conjuntos estáticos y vecino más cercano</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usa la partición espacial</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>Colisiones en videojuegos (broad-phase)</strong>
            </div>
            <p className={styles.escenarioExample}>
              En un juego con cientos de balas, enemigos y obstáculos, comparar todos contra todos es
              inviable. El quadtree agrupa por zonas y solo compara objetos que comparten cuadrante:
              es el primer filtro rápido antes de la comprobación precisa.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Si los objetos se mueven cada fotograma, el árbol se reconstruye o se actualiza en
              cada frame.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗺️</span>
              <strong>Consultas espaciales en mapas y SIG</strong>
            </div>
            <p className={styles.escenarioExample}>
              «¿Qué tiendas hay en esta zona del mapa?» o «¿qué marcadores caben en la vista actual?»
              son consultas de rango. Un quadtree descarta de golpe las regiones que no se solapan con
              el área visible.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Es la misma idea que usan los mapas web para mostrar solo los puntos del recuadro
              visible.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🖼️</span>
              <strong>Compresión de imágenes</strong>
            </div>
            <p className={styles.escenarioExample}>
              Un quadtree puede dividir una imagen en cuadrantes y dejar de subdividir donde el color
              es uniforme. Las zonas lisas quedan como un solo nodo grande y solo se detalla donde hay
              bordes, ahorrando datos.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Aquí el criterio para subdividir no es la cantidad de puntos, sino la variación de
              color.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌌</span>
              <strong>Simulación de N cuerpos (Barnes-Hut)</strong>
            </div>
            <p className={styles.escenarioExample}>
              Para simular la gravedad entre miles de estrellas, el algoritmo de Barnes-Hut usa un
              quadtree (u octree en 3D) para tratar grupos lejanos de cuerpos como una sola masa,
              bajando el coste de O(n²) a O(n log n).
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Es uno de los usos más elegantes del quadtree fuera de los videojuegos.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué un quadtree es más rápido que comparar todos los puntos?</h4>
            <p>
              Porque agrupa los puntos por zonas del espacio. En una consulta de rango, si un nodo no
              se solapa con la región buscada, se descarta entero junto con todos sus descendientes,
              sin mirar ni uno de sus puntos. Así solo se examinan las ramas que tocan la zona, en
              lugar de recorrer la lista completa.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> En esta app puedes ver «nodos visitados» frente a «comprobaciones por fuerza bruta»:
              cuantos más puntos haya, mayor es la diferencia.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿En cuántas partes divide cada nodo?</h4>
            <p>
              Un quadtree divide siempre cada región en exactamente cuatro cuadrantes iguales:
              noroeste, noreste, suroeste y sureste. De ahí el «quad» del nombre. Su equivalente en
              tres dimensiones es el octree, que divide cada caja en ocho octantes.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Un quadtree sirve para juegos y mapas 2D; un octree, para mundos y físicas 3D.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué capacidad por nodo debo usar?</h4>
            <p>
              Depende de cuántos puntos manejes y de cómo estén repartidos. Una capacidad muy baja
              genera un árbol muy profundo con muchos nodos casi vacíos; una muy alta apenas
              subdivide y pierde la ventaja. Valores entre 4 y 8 suelen ir bien. Prueba el slider de
              esta app y observa cómo cambian los nodos y la profundidad.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> No existe un valor universal: ajústalo midiendo el rendimiento con tus propios datos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa con los objetos que se mueven?</h4>
            <p>
              Cuando los objetos cambian de posición, el árbol deja de reflejar la realidad. Lo más
              sencillo es reconstruirlo entero cada fotograma; con muchos objetos es preferible
              actualizar solo los que han cambiado de cuadrante. Esa es una de las decisiones de
              diseño más importantes al usar quadtrees en un juego.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Reconstruir todo cada frame es válido si el número de objetos no es enorme.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Y los objetos que ocupan más de un cuadrante?</h4>
            <p>
              Un punto cae siempre en un único cuadrante, pero una caja o un círculo grande puede
              cruzar la frontera entre varios. Hay dos enfoques: guardar el objeto en el nodo padre
              que lo contiene por completo, o insertarlo en todos los hijos que toca (con cuidado de
              no contarlo dos veces). Esta app trabaja con puntos para centrarse en la idea base.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> En motores reales se suele usar el rectángulo envolvente del objeto, no un punto.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo NO conviene un quadtree?</h4>
            <p>
              Si tienes muy pocos objetos, la fuerza bruta es más simple y rápida. Si los objetos
              están repartidos de forma uniforme y son de tamaño parecido, una rejilla fija suele
              rendir mejor y es más fácil de actualizar. El quadtree brilla cuando hay zonas mucho más
              pobladas que otras, porque subdivide solo donde hace falta.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Mide siempre: la estructura «teóricamente mejor» no siempre gana en tu caso concreto.
            </p>
          </div>
        </div>

        <h3>Cómo se inserta un punto y cuándo subdivide</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>¿El punto cae dentro del nodo?</strong>
              <p>
                Se comprueba si el punto está dentro del rectángulo que cubre el nodo. Si no lo está,
                ese nodo lo rechaza y la inserción continúa por otra rama.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>¿Queda hueco en el nodo?</strong>
              <p>
                Si el nodo aún no se ha dividido y le caben más puntos (no llega a su capacidad), el
                punto se guarda ahí y termina la inserción.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Subdividir al llenarse</strong>
              <p>
                Si el nodo está lleno y todavía no tiene hijos, se subdivide en cuatro cuadrantes (NO,
                NE, SO, SE) y reparte entre ellos los puntos que ya tenía.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Bajar al cuadrante correcto</strong>
              <p>
                El nuevo punto se inserta en el hijo que lo contiene. Es una llamada recursiva: en ese
                hijo se repite todo el proceso desde el paso 1.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Repetir hasta encontrar sitio</strong>
              <p>
                La recursión continúa hacia abajo hasta que un nodo con hueco acepta el punto. Si hay
                muchos puntos muy juntos, el árbol crece en profundidad solo en esa zona.
              </p>
            </div>
          </div>
        </div>

        <h3>Buenas prácticas al implementarlo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Reinserta al subdividir</strong>
            <p>
              Cuando un nodo se divide, mueve sus puntos a los hijos. Si los dejas también en el
              padre, los contarás dos veces y las consultas devolverán duplicados.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Define bien el borde</strong>
            <p>
              Decide un criterio claro de pertenencia (por ejemplo, borde izquierdo y superior
              incluidos, derecho e inferior excluidos) y úsalo igual en todos los cuadrantes para que
              ningún punto se pierda ni se duplique.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Acota la profundidad</strong>
            <p>
              Pon un límite máximo de niveles. Si muchos puntos coinciden casi en la misma posición,
              un árbol sin tope intentaría subdividir sin fin y se quedaría colgado.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Poda en las consultas</strong>
            <p>
              En una consulta de rango, descarta de inmediato cualquier nodo cuyo rectángulo no se
              solape con la región buscada. Ahí está casi toda la ganancia de velocidad.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Elige la capacidad midiendo</strong>
            <p>
              No fijes la capacidad por intuición. Prueba varios valores con tus datos reales y quédate
              con el que dé mejor rendimiento; suele estar entre 4 y 8.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Piensa en los objetos en movimiento</strong>
            <p>
              Si tu escena cambia cada fotograma, decide pronto si reconstruyes el árbol entero o lo
              actualizas de forma incremental. Es lo que más afecta al rendimiento real.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes al programar un quadtree</strong>
          </div>
          <ul className={styles.warningList}>
            <li>No reinsertar los puntos del nodo en los hijos al subdividir → puntos duplicados o perdidos.</li>
            <li>Criterio de borde ambiguo → un punto justo en la línea entre cuadrantes cae en dos hijos o en ninguno.</li>
            <li>Elegir mal la capacidad → demasiado baja crea miles de nodos casi vacíos; demasiado alta no aprovecha la partición.</li>
            <li>No acotar la profundidad → con puntos casi coincidentes el árbol subdivide sin fin y se cuelga.</li>
            <li>Olvidar la poda en las consultas → recorrer todo el árbol anula la ventaja frente a la fuerza bruta.</li>
            <li>No actualizar el árbol con objetos que se mueven → las colisiones se calculan sobre posiciones antiguas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-quadtree')} />
      <ShareCard appName="visualizador-quadtree" />
      <Footer appName="visualizador-quadtree" />
    </div>
  );
}
