'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import styles from './VisualizadorCurvasBezier.module.css';

// ============== TIPOS Y CONSTANTES ==============

type Modo = 'cuadratica' | 'cubica';

interface Punto {
  x: number;
  y: number;
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const RADIO_PUNTO = 9;
const SEGMENTOS = 100; // muestreo de la curva
const PASO_TECLADO = 8; // px por pulsación de flecha

// Posiciones iniciales de los puntos de control
function puntosIniciales(modo: Modo): Punto[] {
  if (modo === 'cuadratica') {
    return [
      { x: 80, y: 320 },
      { x: 300, y: 60 },
      { x: 520, y: 320 },
    ];
  }
  return [
    { x: 70, y: 320 },
    { x: 200, y: 70 },
    { x: 400, y: 70 },
    { x: 530, y: 320 },
  ];
}

// ============== MATEMÁTICA DE BÉZIER ==============

// Interpolación lineal (lerp) entre dos puntos
function lerp(a: Punto, b: Punto, t: number): Punto {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Algoritmo de De Casteljau: devuelve todos los niveles de interpolación.
// El primer nivel son los puntos de control; el último, un único punto: el de la curva.
function deCasteljau(puntos: Punto[], t: number): Punto[][] {
  const niveles: Punto[][] = [puntos];
  let actual = puntos;
  while (actual.length > 1) {
    const siguiente: Punto[] = [];
    for (let i = 0; i < actual.length - 1; i++) {
      siguiente.push(lerp(actual[i], actual[i + 1], t));
    }
    niveles.push(siguiente);
    actual = siguiente;
  }
  return niveles;
}

// Punto de la curva en t (último nivel de De Casteljau)
function puntoEnCurva(puntos: Punto[], t: number): Punto {
  const niveles = deCasteljau(puntos, t);
  return niveles[niveles.length - 1][0];
}

// Muestreo de la curva como cadena de puntos para <polyline>
function muestrearCurva(puntos: Punto[], segmentos: number): Punto[] {
  const muestras: Punto[] = [];
  for (let i = 0; i <= segmentos; i++) {
    muestras.push(puntoEnCurva(puntos, i / segmentos));
  }
  return muestras;
}

// Longitud aproximada sumando las muestras (en px del viewBox)
function longitudAproximada(muestras: Punto[]): number {
  let total = 0;
  for (let i = 1; i < muestras.length; i++) {
    const dx = muestras[i].x - muestras[i - 1].x;
    const dy = muestras[i].y - muestras[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

// Colores de los niveles de construcción de De Casteljau
const COLORES_NIVEL = ['#94a3b8', '#f59e0b', '#48a9a6', '#7c3aed', '#e11d48'];

// Etiqueta de cada punto de control: P0, P1, ...
function etiquetaPunto(i: number): string {
  return `P${i}`;
}

// ============== COMPONENTE PRINCIPAL ==============

export default function VisualizadorCurvasBezierPage() {
  const [modo, setModo] = useState<Modo>('cubica');
  const [puntos, setPuntos] = useState<Punto[]>(() => puntosIniciales('cubica'));
  const [t, setT] = useState<number>(0.4);
  const [mostrarCasteljau, setMostrarCasteljau] = useState<boolean>(true);
  const [animando, setAnimando] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const arrastrando = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const ultimoTiempo = useRef<number | null>(null);

  // Cambiar entre cuadrática y cúbica reinicia los puntos
  const cambiarModo = useCallback((nuevo: Modo) => {
    setModo(nuevo);
    setPuntos(puntosIniciales(nuevo));
  }, []);

  const reiniciarPuntos = useCallback(() => {
    setPuntos(puntosIniciales(modo));
  }, [modo]);

  // Convertir coordenadas de pantalla a coordenadas del viewBox del SVG
  const obtenerCoordsSvg = useCallback(
    (evt: React.PointerEvent<SVGSVGElement>): Punto | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const transformado = pt.matrixTransform(ctm.inverse());
      return { x: transformado.x, y: transformado.y };
    },
    [],
  );

  // Limita un punto al área del viewBox dejando un margen del radio
  const limitar = useCallback((p: Punto): Punto => {
    return {
      x: Math.max(RADIO_PUNTO, Math.min(SVG_WIDTH - RADIO_PUNTO, p.x)),
      y: Math.max(RADIO_PUNTO, Math.min(SVG_HEIGHT - RADIO_PUNTO, p.y)),
    };
  }, []);

  const handlePuntoPointerDown = useCallback((indice: number, evt: React.PointerEvent) => {
    evt.stopPropagation();
    arrastrando.current = indice;
  }, []);

  const handleSvgPointerMove = useCallback(
    (evt: React.PointerEvent<SVGSVGElement>) => {
      if (arrastrando.current === null) return;
      const coords = obtenerCoordsSvg(evt);
      if (!coords) return;
      const indice = arrastrando.current;
      setPuntos((prev) => prev.map((p, i) => (i === indice ? limitar(coords) : p)));
    },
    [obtenerCoordsSvg, limitar],
  );

  const handleSvgPointerUp = useCallback(() => {
    arrastrando.current = null;
  }, []);

  // Movimiento por teclado de un punto enfocado
  const handlePuntoKeyDown = useCallback(
    (indice: number, evt: React.KeyboardEvent<SVGGElement>) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evt.key)) return;
      evt.preventDefault();
      const paso = evt.shiftKey ? PASO_TECLADO * 3 : PASO_TECLADO;
      const deltas: Record<string, [number, number]> = {
        ArrowUp: [0, -paso],
        ArrowDown: [0, paso],
        ArrowLeft: [-paso, 0],
        ArrowRight: [paso, 0],
      };
      const [dx, dy] = deltas[evt.key];
      setPuntos((prev) =>
        prev.map((p, i) => (i === indice ? limitar({ x: p.x + dx, y: p.y + dy }) : p)),
      );
    },
    [limitar],
  );

  // Animación de t (0 → 1) con requestAnimationFrame, ~2,5 s por recorrido
  useEffect(() => {
    if (!animando) {
      ultimoTiempo.current = null;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      return;
    }
    const tick = (ahora: number) => {
      if (ultimoTiempo.current === null) ultimoTiempo.current = ahora;
      const delta = (ahora - ultimoTiempo.current) / 1000;
      ultimoTiempo.current = ahora;
      setT((prev) => {
        const siguiente = prev + delta / 2.5;
        return siguiente >= 1 ? 0 : siguiente;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [animando]);

  // Cálculos derivados
  const muestras = useMemo(() => muestrearCurva(puntos, SEGMENTOS), [puntos]);
  const polylineCurva = useMemo(
    () => muestras.map((p) => `${p.x},${p.y}`).join(' '),
    [muestras],
  );
  const poligonoControl = useMemo(() => puntos.map((p) => `${p.x},${p.y}`).join(' '), [puntos]);
  const niveles = useMemo(() => deCasteljau(puntos, t), [puntos, t]);
  const puntoT = niveles[niveles.length - 1][0];
  const longitud = useMemo(() => longitudAproximada(muestras), [muestras]);
  // Niveles intermedios para De Casteljau (sin el de los puntos de control ni el punto final)
  const nivelesIntermedios = niveles.slice(1, niveles.length - 1);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Visualizador de Curvas de Bézier</h1>
        <p className={styles.subtitle}>
          Mueve los puntos de control y observa cómo nace la curva. Con el algoritmo de De Casteljau
          animado: la matemática detrás de las fuentes, el easing y los gráficos vectoriales.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* 1. Modo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Tipo de curva</h2>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'cuadratica' ? styles.modoActive : ''}`}
              onClick={() => cambiarModo('cuadratica')}
              aria-pressed={modo === 'cuadratica'}
            >
              <span className={styles.modoNombre}>Cuadrática</span>
              <span className={styles.modoDesc}>3 puntos de control · un arco</span>
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'cubica' ? styles.modoActive : ''}`}
              onClick={() => cambiarModo('cubica')}
              aria-pressed={modo === 'cubica'}
            >
              <span className={styles.modoNombre}>Cúbica</span>
              <span className={styles.modoDesc}>4 puntos de control · forma de S</span>
            </button>
          </div>
        </div>

        {/* 2. Lienzo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Arrastra los puntos de control</h2>
          <div className={styles.hint}>
            Arrastra cualquier punto <strong>P0–P{puntos.length - 1}</strong> con el ratón o el dedo.
            También puedes seleccionarlo con el tabulador y moverlo con las <strong>flechas</strong>{' '}
            (Mayús + flecha para pasos más grandes).
          </div>

          <div className={styles.svgWrapper}>
            <svg
              ref={svgRef}
              className={styles.lienzo}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              role="img"
              aria-label={`Curva de Bézier ${modo} con ${puntos.length} puntos de control`}
              onPointerMove={handleSvgPointerMove}
              onPointerUp={handleSvgPointerUp}
              onPointerLeave={handleSvgPointerUp}
            >
              {/* Polígono de control (líneas discontinuas) */}
              <polyline
                points={poligonoControl}
                className={styles.poligonoControl}
                fill="none"
              />

              {/* Curva de Bézier */}
              <polyline points={polylineCurva} className={styles.curva} fill="none" />

              {/* Construcción de De Casteljau */}
              {mostrarCasteljau &&
                nivelesIntermedios.map((nivel, n) => {
                  const color = COLORES_NIVEL[(n + 1) % COLORES_NIVEL.length];
                  const puntosNivel = nivel.map((p) => `${p.x},${p.y}`).join(' ');
                  return (
                    <g key={`nivel-${n}`}>
                      <polyline
                        points={puntosNivel}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        strokeDasharray="2 3"
                        opacity={0.85}
                      />
                      {nivel.map((p, i) => (
                        <circle
                          key={`nivel-${n}-${i}`}
                          cx={p.x}
                          cy={p.y}
                          r={4}
                          fill={color}
                        />
                      ))}
                    </g>
                  );
                })}

              {/* Punto en t sobre la curva */}
              <circle cx={puntoT.x} cy={puntoT.y} r={6} className={styles.puntoT} />

              {/* Puntos de control arrastrables */}
              {puntos.map((p, i) => (
                <g
                  key={`ctrl-${i}`}
                  className={styles.grupoPunto}
                  tabIndex={0}
                  role="button"
                  aria-label={`Punto de control ${etiquetaPunto(i)} en x ${Math.round(
                    p.x,
                  )}, y ${Math.round(
                    p.y,
                  )}. Arrastra o usa las flechas para moverlo dentro del lienzo.`}
                  onPointerDown={(e) => handlePuntoPointerDown(i, e)}
                  onKeyDown={(e) => handlePuntoKeyDown(i, e)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={RADIO_PUNTO}
                    className={`${styles.puntoControl} ${
                      i === 0 || i === puntos.length - 1 ? styles.puntoExtremo : styles.puntoMedio
                    }`}
                  />
                  <text
                    x={p.x}
                    y={p.y - RADIO_PUNTO - 5}
                    className={styles.etiquetaPunto}
                    textAnchor="middle"
                  >
                    {etiquetaPunto(i)}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Leyenda */}
          <div className={styles.leyenda}>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.lCurva}`} aria-hidden="true" /> Curva
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.lPoligono}`} aria-hidden="true" />{' '}
              Polígono de control
            </span>
            <span className={styles.leyendaItem}>
              <span className={`${styles.leyendaColor} ${styles.lPuntoT}`} aria-hidden="true" /> Punto
              en t
            </span>
            {mostrarCasteljau && (
              <span className={styles.leyendaItem}>
                <span className={`${styles.leyendaColor} ${styles.lCasteljau}`} aria-hidden="true" />{' '}
                Construcción de De Casteljau
              </span>
            )}
          </div>
        </div>

        {/* 3. Controles de t */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>3. Parámetro t y construcción</h2>

          <div className={styles.tControl}>
            <label htmlFor="t-slider">
              t = <strong className={styles.tValor}>{formatNumber(t, 3)}</strong>
            </label>
            <input
              id="t-slider"
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={t}
              onChange={(e) => {
                setAnimando(false);
                setT(parseFloat(e.target.value));
              }}
            />
          </div>

          <label className={styles.toggleControl}>
            <input
              type="checkbox"
              checked={mostrarCasteljau}
              onChange={(e) => setMostrarCasteljau(e.target.checked)}
            />
            Mostrar construcción de De Casteljau
          </label>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={() => setAnimando((prev) => !prev)}
              aria-pressed={animando}
            >
              <span aria-hidden="true">{animando ? '⏸' : '▶'}</span>{' '}
              {animando ? 'Pausar' : 'Animar t'}
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.secondaryBtn}`}
              onClick={reiniciarPuntos}
            >
              <span aria-hidden="true">↺</span> Reiniciar puntos
            </button>
          </div>

          {/* Métricas */}
          <div className={styles.metricsGrid} role="status" aria-live="polite" aria-atomic="true">
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Punto en t</span>
              <span className={styles.metricValue}>
                ({formatNumber(puntoT.x, 0)}, {formatNumber(puntoT.y, 0)})
              </span>
              <span className={styles.metricNote}>Coordenadas sobre la curva para la t actual</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Longitud aproximada</span>
              <span className={styles.metricValue}>
                {formatNumber(longitud, 0)}
                <span className={styles.metricUnit}>px</span>
              </span>
              <span className={styles.metricNote}>Suma de {SEGMENTOS} segmentos rectos</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Grado de la curva</span>
              <span className={styles.metricValue}>{puntos.length - 1}</span>
              <span className={styles.metricNote}>
                {puntos.length} puntos de control → grado {puntos.length - 1}
              </span>
            </div>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía de Curvas de Bézier"
        subtitle="De Casteljau, polígono de control y dónde se usan en gráficos y videojuegos"
      >
        <h3>Lineal, cuadrática y cúbica</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Puntos de control</th>
                <th>Grado</th>
                <th>Forma posible</th>
                <th>Dónde se usa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Lineal</strong></td>
                <td>2</td>
                <td>1</td>
                <td>Segmento recto</td>
                <td>Interpolación simple (lerp), tramos rectos</td>
              </tr>
              <tr>
                <td><strong>Cuadrática</strong></td>
                <td>3</td>
                <td>2</td>
                <td>Un solo arco</td>
                <td>Fuentes TrueType, curvas ligeras</td>
              </tr>
              <tr>
                <td><strong>Cúbica</strong></td>
                <td>4</td>
                <td>3</td>
                <td>Forma de S (dos curvaturas)</td>
                <td>SVG, PostScript, Illustrator, easing CSS</td>
              </tr>
              <tr>
                <td><strong>Spline / B-spline</strong></td>
                <td>Varios tramos unidos</td>
                <td>Variable</td>
                <td>Curvas largas y suaves</td>
                <td>Trazados complejos, trayectorias de cámara</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usan las curvas de Bézier</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔤</span>
              <strong>Fuentes tipográficas</strong>
            </div>
            <p className={styles.escenarioExample}>
              El contorno de cada letra se describe con curvas de Bézier. Las fuentes TrueType usan
              cuadráticas y las PostScript/OpenType CFF usan cúbicas. Por eso una letra escala a
              cualquier tamaño sin perder nitidez.
            </p>
            <p className={styles.escenarioTip}>
              💡 Una «o» o una «s» son varias Béziers encadenadas formando un trazado cerrado.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
              <strong>Curvas de animación (easing)</strong>
            </div>
            <p className={styles.escenarioExample}>
              La función <code>cubic-bezier()</code> de CSS y los editores de curvas de motores como
              Unity o Godot son Béziers cúbicas que describen cómo cambia un valor con el tiempo:
              arranque suave, frenado, rebote, etc.
            </p>
            <p className={styles.escenarioTip}>
              💡 Aquí los ejes no son x e y del espacio, sino tiempo y progreso de la animación.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">✒️</span>
              <strong>Dibujo vectorial</strong>
            </div>
            <p className={styles.escenarioExample}>
              La herramienta «pluma» de Illustrator, Inkscape o Figma crea nodos con manejadores: cada
              manejador es un punto de control de una Bézier cúbica. El formato SVG guarda esas curvas
              con el comando <code>C</code>.
            </p>
            <p className={styles.escenarioTip}>
              💡 Tirar de un manejador es, literalmente, mover un punto de control como en este
              visualizador.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>Trayectorias y cámaras</strong>
            </div>
            <p className={styles.escenarioExample}>
              En videojuegos las Béziers definen el recorrido suave de una cámara cinemática, la
              trayectoria curva de un proyectil o el camino que sigue un objeto entre dos puntos sin
              giros bruscos.
            </p>
            <p className={styles.escenarioTip}>
              💡 Para recorrer la curva a velocidad constante hace falta reparametrizar por longitud
              de arco: t no avanza igual de rápido en todos los tramos.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué la curva no pasa por los puntos de control intermedios?</h4>
            <p>
              Una curva de Bézier solo toca el primer y el último punto. Los intermedios actúan como
              «imanes» que tiran de la curva marcando su dirección y curvatura, pero la curva queda
              siempre dentro de la envolvente convexa de los puntos, sin llegar a tocarlos. Esa es
              precisamente la propiedad que la hace fácil de controlar.
            </p>
            <p className={styles.faqTip}>
              💡 Si necesitas que la curva sí pase por unos puntos dados, lo que buscas es una
              interpolación tipo spline (por ejemplo Catmull-Rom), no una Bézier directa.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué representa el parámetro t?</h4>
            <p>
              t va de 0 a 1 y recorre la curva: en t = 0 estás en el punto inicial y en t = 1 en el
              final. No es proporcional a la distancia recorrida, sino a los pasos de interpolación, así
              que el punto se mueve más rápido en unos tramos que en otros. Mueve el deslizador o pulsa
              «Animar t» para verlo.
            </p>
            <p className={styles.faqTip}>
              💡 Por eso, para animar a velocidad constante, hay que corregir t en función de la
              longitud de arco.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo funciona la construcción de De Casteljau?</h4>
            <p>
              Para un t dado, interpolas (haces un punto intermedio ponderado por t) entre cada par de
              puntos consecutivos. Eso te da un nivel con un punto menos. Repites el proceso sobre ese
              nuevo nivel hasta quedarte con un único punto: ese es el punto de la curva. Activa la
              casilla para ver los niveles dibujados con colores distintos.
            </p>
            <p className={styles.faqTip}>
              💡 Es el mismo resultado que la fórmula con polinomios de Bernstein, pero más estable
              numéricamente y mucho más visual.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuál es la fórmula de la curva?</h4>
            <p>
              Para la cuadrática: B(t) = (1−t)²·P0 + 2(1−t)t·P1 + t²·P2. Para la cúbica: B(t) =
              (1−t)³·P0 + 3(1−t)²t·P1 + 3(1−t)t²·P2 + t³·P3. Los coeficientes son los polinomios de
              Bernstein y, para cualquier t, siempre suman 1, lo que garantiza que la curva quede dentro
              del polígono de control.
            </p>
            <p className={styles.faqTip}>
              💡 Esa fórmula y el algoritmo de De Casteljau dan exactamente el mismo punto.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo usar cuadrática y cuándo cúbica?</h4>
            <p>
              La cuadrática es más ligera de calcular y basta cuando solo necesitas un arco; por eso la
              usan las fuentes TrueType. La cúbica, con su forma de S, da mucha más libertad y es el
              estándar en diseño vectorial y animación. Si una sola curva no llega, se encadenan varias
              formando un spline.
            </p>
            <p className={styles.faqTip}>
              💡 Para que la unión de dos Béziers sea suave, los manejadores a cada lado del nodo deben
              estar alineados (continuidad de la tangente).
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿De dónde vienen las curvas de Bézier?</h4>
            <p>
              Pierre Bézier las popularizó en Renault en los años 60 para diseñar carrocerías con
              ordenador. Paul de Casteljau había desarrollado el método geométrico equivalente algo
              antes en Citroën, pero su trabajo se publicó más tarde. De ahí que la curva lleve un
              nombre y el algoritmo de evaluación, el otro.
            </p>
            <p className={styles.faqTip}>
              💡 Ambos resolvían el mismo problema industrial: describir formas suaves de forma precisa
              y repetible.
            </p>
          </div>
        </div>

        <h3>El algoritmo de De Casteljau paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Parte de los puntos de control</strong>
              <p>
                Empieza con la lista de puntos de control (P0, P1, …) y elige un valor de t entre 0 y 1
                para el que quieres conocer el punto de la curva.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Interpola cada par consecutivo</strong>
              <p>
                Entre cada dos puntos seguidos calcula el punto intermedio ponderado por t (lerp). Con n
                puntos obtienes n−1 puntos nuevos: el primer nivel de la construcción.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Repite sobre el nuevo nivel</strong>
              <p>
                Aplica la misma interpolación a los puntos recién obtenidos. Cada pasada reduce en uno el
                número de puntos y te acerca a la curva.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Llega a un único punto</strong>
              <p>
                Cuando solo queda un punto, ese es el punto de la curva para ese t. Es el círculo que se
                desplaza al mover el deslizador.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Recorre todos los t para dibujar la curva</strong>
              <p>
                Repitiendo el proceso para muchos valores de t (aquí, {SEGMENTOS}) y uniendo los puntos
                resultantes obtienes la curva completa.
              </p>
            </div>
          </div>
        </div>

        <h3>Consejos para trabajar con curvas de Bézier</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Pocos puntos, más control</strong>
            <p>
              Resuelve cada tramo con la curva de menor grado posible. Es más fácil de ajustar que una
              única curva de grado alto que oscila de forma imprevisible.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Encadena con tangentes alineadas</strong>
            <p>
              Para que la unión entre dos Béziers no tenga esquinas, alinea los manejadores a ambos lados
              del nodo común.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Usa De Casteljau para subdividir</strong>
            <p>
              El mismo algoritmo permite partir una curva en dos en cualquier t conservando su forma:
              muy útil para recortar o aumentar el detalle.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Reparametriza por longitud para animar</strong>
            <p>
              Si quieres velocidad constante a lo largo de la curva, no animes t linealmente: corrígelo
              con una tabla de longitud de arco.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>La curva vive en la envolvente convexa</strong>
            <p>
              Como la curva nunca sale del polígono de control, puedes usar ese polígono para detectar
              colisiones de forma rápida y aproximada.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Cuadrática para fuentes, cúbica para diseño</strong>
            <p>
              Elige el tipo según el destino: TrueType pide cuadráticas; SVG, PostScript y editores
              gráficos trabajan con cúbicas.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes con curvas de Bézier</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Esperar que la curva pase por los puntos de control intermedios: solo toca el primero y el último.</li>
            <li>Confundir t con la distancia recorrida: avanzar t a ritmo fijo no da velocidad constante.</li>
            <li>Subir el grado de una sola curva en vez de encadenar tramos: aparecen oscilaciones difíciles de controlar.</li>
            <li>Unir dos Béziers sin alinear las tangentes: queda una esquina visible en el nodo.</li>
            <li>Mezclar cuadráticas y cúbicas sin convertirlas al exportar a un formato que solo admite uno de los dos.</li>
            <li>Olvidar que la curva queda dentro de la envolvente convexa al estimar su tamaño o sus límites.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-curvas-bezier')} />
      <ShareCard appName="visualizador-curvas-bezier" />
      <Footer appName="visualizador-curvas-bezier" />
    </div>
  );
}
