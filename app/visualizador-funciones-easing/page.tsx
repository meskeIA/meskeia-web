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
import styles from './VisualizadorFuncionesEasing.module.css';

// ============== TIPOS Y CONSTANTES ==============

type ClaveEasing =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeOutBounce';

type Familia = 'linear' | 'quad' | 'cubic' | 'sine' | 'expo' | 'back' | 'elastic' | 'bounce';

interface DefinicionEasing {
  clave: ClaveEasing;
  etiqueta: string;
  familia: Familia;
  fn: (t: number) => number;
}

// Dimensiones del lienzo SVG (cuadrado unidad con margen)
const SVG_SIZE = 360;
const MARGEN = 30;
const AREA = SVG_SIZE - MARGEN * 2; // lado útil del cuadrado unidad
const MUESTRAS = 100; // nº de muestras para dibujar la curva

// ============== CATÁLOGO DE FUNCIONES DE EASING (estilo Robert Penner) ==============
// Todas reciben t ∈ [0, 1] y devuelven el valor interpolado. Las familias back y
// elastic pueden salirse de [0, 1] a propósito (anticipación / overshoot).

const c1 = 1.70158; // constante de overshoot para back
const c2 = c1 * 1.525; // back in-out
const c3 = c1 + 1; // back in/out
const c4 = (2 * Math.PI) / 3; // elastic in/out
const n1 = 7.5625; // bounce
const d1 = 2.75; // bounce

function easeOutBounce(t: number): number {
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    t -= 1.5 / d1;
    return n1 * t * t + 0.75;
  } else if (t < 2.5 / d1) {
    t -= 2.25 / d1;
    return n1 * t * t + 0.9375;
  } else {
    t -= 2.625 / d1;
    return n1 * t * t + 0.984375;
  }
}

const EASINGS: DefinicionEasing[] = [
  { clave: 'linear', etiqueta: 'linear', familia: 'linear', fn: (t) => t },

  { clave: 'easeInQuad', etiqueta: 'easeIn', familia: 'quad', fn: (t) => t * t },
  { clave: 'easeOutQuad', etiqueta: 'easeOut', familia: 'quad', fn: (t) => 1 - (1 - t) * (1 - t) },
  {
    clave: 'easeInOutQuad',
    etiqueta: 'easeInOut',
    familia: 'quad',
    fn: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  },

  { clave: 'easeInCubic', etiqueta: 'easeIn', familia: 'cubic', fn: (t) => t * t * t },
  { clave: 'easeOutCubic', etiqueta: 'easeOut', familia: 'cubic', fn: (t) => 1 - Math.pow(1 - t, 3) },
  {
    clave: 'easeInOutCubic',
    etiqueta: 'easeInOut',
    familia: 'cubic',
    fn: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  },

  { clave: 'easeInSine', etiqueta: 'easeIn', familia: 'sine', fn: (t) => 1 - Math.cos((t * Math.PI) / 2) },
  { clave: 'easeOutSine', etiqueta: 'easeOut', familia: 'sine', fn: (t) => Math.sin((t * Math.PI) / 2) },
  {
    clave: 'easeInOutSine',
    etiqueta: 'easeInOut',
    familia: 'sine',
    fn: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  },

  {
    clave: 'easeInExpo',
    etiqueta: 'easeIn',
    familia: 'expo',
    fn: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  },
  {
    clave: 'easeOutExpo',
    etiqueta: 'easeOut',
    familia: 'expo',
    fn: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  },

  {
    clave: 'easeInBack',
    etiqueta: 'easeIn',
    familia: 'back',
    fn: (t) => c3 * t * t * t - c1 * t * t,
  },
  {
    clave: 'easeOutBack',
    etiqueta: 'easeOut',
    familia: 'back',
    fn: (t) => 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2),
  },

  {
    clave: 'easeInElastic',
    etiqueta: 'easeIn',
    familia: 'elastic',
    fn: (t) =>
      t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4),
  },
  {
    clave: 'easeOutElastic',
    etiqueta: 'easeOut',
    familia: 'elastic',
    fn: (t) =>
      t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1,
  },

  { clave: 'easeOutBounce', etiqueta: 'easeOut', familia: 'bounce', fn: easeOutBounce },
];

// Sin necesidad de c2 aquí (solo back in-out, no incluido). Lo referenciamos para
// que el linter no marque variable sin usar y por si se amplía el catálogo.
void c2;

const ETIQUETA_FAMILIA: Record<Familia, string> = {
  linear: 'Lineal',
  quad: 'Quad (t²)',
  cubic: 'Cubic (t³)',
  sine: 'Sine',
  expo: 'Expo',
  back: 'Back (anticipación)',
  elastic: 'Elastic (rebote)',
  bounce: 'Bounce (botes)',
};

const ORDEN_FAMILIAS: Familia[] = ['linear', 'quad', 'cubic', 'sine', 'expo', 'back', 'elastic', 'bounce'];

// Mapa clave → definición, para buscar rápido
const POR_CLAVE: Record<ClaveEasing, DefinicionEasing> = EASINGS.reduce(
  (acc, e) => {
    acc[e.clave] = e;
    return acc;
  },
  {} as Record<ClaveEasing, DefinicionEasing>,
);

// ============== UTILIDADES DE DIBUJO ==============

// Convierte (t, valor) del cuadrado unidad a coordenadas del SVG.
// Recuerda: en SVG el eje Y crece hacia abajo, por eso se invierte el valor.
function aSvgX(t: number): number {
  return MARGEN + t * AREA;
}
function aSvgY(valor: number): number {
  return MARGEN + (1 - valor) * AREA;
}

// Muestrea la curva de una easing como cadena de puntos para <polyline>
function muestrearEasing(fn: (t: number) => number): string {
  const puntos: string[] = [];
  for (let i = 0; i <= MUESTRAS; i++) {
    const t = i / MUESTRAS;
    const v = fn(t);
    puntos.push(`${aSvgX(t).toFixed(2)},${aSvgY(v).toFixed(2)}`);
  }
  return puntos.join(' ');
}

// ============== COMPONENTE PRINCIPAL ==============

export default function VisualizadorFuncionesEasingPage() {
  const [claveActiva, setClaveActiva] = useState<ClaveEasing>('easeOutCubic');
  const [duracion, setDuracion] = useState<number>(1200); // ms
  const [reproduciendo, setReproduciendo] = useState<boolean>(false);
  const [t, setT] = useState<number>(0); // progreso lineal 0→1

  const animRef = useRef<number | null>(null);
  const inicioRef = useRef<number | null>(null);

  const definicion = POR_CLAVE[claveActiva];
  const easingFn = definicion.fn;

  // Al arrancar, respeta prefers-reduced-motion: no auto-reproducir.
  // (reproduciendo arranca en false, así que ya queda en pausa por defecto.)

  // Animación: avanza t de 0 a 1 en `duracion` ms y vuelve a empezar (bucle)
  useEffect(() => {
    if (!reproduciendo) {
      inicioRef.current = null;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      return;
    }
    const tick = (ahora: number) => {
      if (inicioRef.current === null) inicioRef.current = ahora;
      const transcurrido = ahora - inicioRef.current;
      let progreso = transcurrido / duracion;
      if (progreso >= 1) {
        progreso = progreso % 1;
        inicioRef.current = ahora - progreso * duracion;
      }
      setT(progreso);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [reproduciendo, duracion]);

  const reproducir = useCallback(() => {
    inicioRef.current = null;
    setReproduciendo(true);
  }, []);

  const pausar = useCallback(() => {
    setReproduciendo(false);
  }, []);

  const reiniciar = useCallback(() => {
    setReproduciendo(false);
    inicioRef.current = null;
    setT(0);
  }, []);

  const seleccionar = useCallback((clave: ClaveEasing) => {
    setClaveActiva(clave);
  }, []);

  // Valor de la easing en el t actual (puede salirse de [0,1] en back/elastic)
  const valorActual = easingFn(t);

  // Polilínea de la curva activa y de la diagonal linear de referencia
  const polilineaCurva = useMemo(() => muestrearEasing(easingFn), [easingFn]);
  const polilineaLinear = useMemo(() => muestrearEasing((x) => x), []);

  // Posición del marcador sobre la curva (en coords SVG)
  const marcadorX = aSvgX(t);
  const marcadorY = aSvgY(valorActual);

  // Posición de la caja de la demo (0 = izquierda, 1 = derecha), usando la easing.
  // El valor puede pasarse de [0,1] en back/elastic; lo dejamos así para ver el overshoot.
  const posicionCajaPct = valorActual * 100;

  // Agrupar easings por familia para el selector
  const familias = useMemo(() => {
    return ORDEN_FAMILIAS.map((fam) => ({
      familia: fam,
      items: EASINGS.filter((e) => e.familia === fam),
    }));
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Visualizador de Funciones de Easing</h1>
        <p className={styles.subtitle}>
          La interpolación que da vida a las animaciones: compara linear, ease in/out, back, elastic
          y bounce con su curva y una demo animada. Para videojuegos, interfaces y motion graphics.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* 1. Selector de función */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Elige la función de easing</h2>
          <p className={styles.hint}>
            Agrupadas por <strong>familia</strong>. Cada familia tiene variantes <em>easeIn</em>{' '}
            (arranque lento), <em>easeOut</em> (frenado suave) y <em>easeInOut</em> (ambas).
          </p>
          <div className={styles.familias}>
            {familias.map(({ familia, items }) => (
              <div key={familia} className={styles.familiaGrupo}>
                <span className={styles.familiaLabel}>{ETIQUETA_FAMILIA[familia]}</span>
                <div className={styles.familiaBotones}>
                  {items.map((e) => (
                    <button
                      key={e.clave}
                      type="button"
                      className={`${styles.easingBtn} ${claveActiva === e.clave ? styles.easingActive : ''}`}
                      onClick={() => seleccionar(e.clave)}
                      aria-pressed={claveActiva === e.clave}
                    >
                      {e.etiqueta}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.seleccionActual} role="status" aria-live="polite">
            Función activa: <strong>{claveActiva}</strong>
          </div>
        </div>

        {/* 2. Gráfica + demo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Curva y animación</h2>
          <div className={styles.visualGrid}>
            {/* Gráfica de la curva */}
            <div className={styles.graficaCol}>
              <div className={styles.svgWrapper}>
                <svg
                  className={styles.lienzo}
                  viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                  role="img"
                  aria-label={`Gráfica de la función de easing ${claveActiva}: el eje horizontal es el tiempo t de 0 a 1 y el vertical el valor interpolado`}
                >
                  {/* Cuadrado unidad */}
                  <rect
                    x={MARGEN}
                    y={MARGEN}
                    width={AREA}
                    height={AREA}
                    className={styles.marco}
                    fill="none"
                  />
                  {/* Ejes etiquetados */}
                  <text x={MARGEN} y={SVG_SIZE - MARGEN + 18} className={styles.ejeTexto}>
                    t=0
                  </text>
                  <text
                    x={SVG_SIZE - MARGEN}
                    y={SVG_SIZE - MARGEN + 18}
                    className={styles.ejeTexto}
                    textAnchor="end"
                  >
                    t=1
                  </text>
                  <text x={MARGEN - 8} y={SVG_SIZE - MARGEN} className={styles.ejeTexto} textAnchor="end">
                    0
                  </text>
                  <text x={MARGEN - 8} y={MARGEN + 4} className={styles.ejeTexto} textAnchor="end">
                    1
                  </text>

                  {/* Diagonal linear de referencia */}
                  <polyline points={polilineaLinear} className={styles.curvaLinear} fill="none" />

                  {/* Curva de la easing activa */}
                  <polyline points={polilineaCurva} className={styles.curva} fill="none" />

                  {/* Línea vertical en el t actual */}
                  <line
                    x1={marcadorX}
                    y1={MARGEN}
                    x2={marcadorX}
                    y2={SVG_SIZE - MARGEN}
                    className={styles.guiaT}
                  />

                  {/* Marcador sobre la curva */}
                  <circle cx={marcadorX} cy={marcadorY} r={6} className={styles.marcador} />
                </svg>
              </div>
              <div className={styles.leyenda}>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.lCurva}`} aria-hidden="true" /> Curva
                  activa
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.lLinear}`} aria-hidden="true" />{' '}
                  Linear (referencia)
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.lMarcador}`} aria-hidden="true" />{' '}
                  Marcador en t
                </span>
              </div>
            </div>

            {/* Demo animada */}
            <div className={styles.demoCol}>
              <span className={styles.demoLabel}>Demo: caja desplazándose con la easing</span>
              <div className={styles.pista} aria-hidden="true">
                <div
                  className={styles.caja}
                  style={{ left: `calc(${posicionCajaPct}% - var(--tam-caja, 0px))` }}
                />
              </div>
              <p className={styles.demoNota}>
                La caja avanza de izquierda a derecha siguiendo la curva elegida. Con{' '}
                <strong>back</strong> y <strong>elastic</strong> verás que se pasa del borde
                (overshoot) o retrocede antes de arrancar.
              </p>

              {/* Valores en vivo */}
              <div className={styles.valoresVivo} role="status" aria-live="off">
                <div className={styles.valorCard}>
                  <span className={styles.valorLabel}>Tiempo t</span>
                  <span className={styles.valorNum}>{formatNumber(t, 3)}</span>
                </div>
                <div className={styles.valorCard}>
                  <span className={styles.valorLabel}>easing(t)</span>
                  <span className={styles.valorNum}>{formatNumber(valorActual, 3)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de animación */}
          <div className={styles.controlBar}>
            <div className={styles.duracionControl}>
              <label htmlFor="dur-slider">Duración:</label>
              <input
                id="dur-slider"
                type="range"
                min={300}
                max={4000}
                step={100}
                value={duracion}
                onChange={(e) => setDuracion(parseInt(e.target.value, 10))}
              />
              <span className={styles.duracionValue}>{formatNumber(duracion, 0)} ms</span>
            </div>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={reproducir}
              disabled={reproduciendo}
            >
              <span aria-hidden="true">▶</span> Reproducir
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.secondaryBtn}`}
              onClick={pausar}
              disabled={!reproduciendo}
            >
              <span aria-hidden="true">⏸</span> Pausar
            </button>
            <button
              type="button"
              className={`${styles.controlBtn} ${styles.secondaryBtn}`}
              onClick={reiniciar}
            >
              <span aria-hidden="true">↺</span> Reiniciar
            </button>
          </div>

          {/* Slider manual de t (cuando está en pausa) */}
          <div className={styles.tControl}>
            <label htmlFor="t-slider">
              Mover t a mano: <strong className={styles.tValor}>{formatNumber(t, 3)}</strong>
            </label>
            <input
              id="t-slider"
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={t}
              onChange={(e) => {
                setReproduciendo(false);
                setT(parseFloat(e.target.value));
              }}
            />
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía de Funciones de Easing"
        subtitle="Interpolación, curvas de animación y dónde se usan en UI, videojuegos y motion"
      >
        <h3>Las familias de easing de un vistazo</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Familia</th>
                <th>Forma de la curva</th>
                <th>Sensación</th>
                <th>¿Se sale de 0–1?</th>
                <th>Uso típico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Linear</strong></td>
                <td>Recta diagonal</td>
                <td>Mecánica, constante</td>
                <td>No</td>
                <td>Cintas, barras de progreso, rotaciones continuas</td>
              </tr>
              <tr>
                <td><strong>Quad / Cubic</strong></td>
                <td>Parábola suave (t² / t³)</td>
                <td>Acelera o frena de forma natural</td>
                <td>No</td>
                <td>El caballo de batalla de las transiciones de UI</td>
              </tr>
              <tr>
                <td><strong>Sine</strong></td>
                <td>Cuarto de onda senoidal</td>
                <td>Muy suave y discreta</td>
                <td>No</td>
                <td>Movimientos sutiles, fundidos delicados</td>
              </tr>
              <tr>
                <td><strong>Expo</strong></td>
                <td>Casi plana y luego disparada</td>
                <td>Muy marcada, dramática</td>
                <td>No</td>
                <td>Entradas/salidas con fuerza, énfasis</td>
              </tr>
              <tr>
                <td><strong>Back</strong></td>
                <td>Retrocede antes / se pasa al final</td>
                <td>Anticipación y empuje</td>
                <td>Sí (un poco)</td>
                <td>Botones, tarjetas que aparecen con carácter</td>
              </tr>
              <tr>
                <td><strong>Elastic</strong></td>
                <td>Oscila como un muelle</td>
                <td>Rebote vivo, juguetón</td>
                <td>Sí (bastante)</td>
                <td>Acentos lúdicos, notificaciones llamativas</td>
              </tr>
              <tr>
                <td><strong>Bounce</strong></td>
                <td>Varios botes decrecientes</td>
                <td>Como una pelota que cae</td>
                <td>No</td>
                <td>Caídas, aterrizajes, efectos divertidos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usan las funciones de easing</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🖱️</span>
              <strong>Animación de interfaces (UI)</strong>
            </div>
            <p className={styles.escenarioExample}>
              Menús que se despliegan, modales que aparecen, botones que reaccionan. La transición CSS{' '}
              <code>transition: transform 0.3s ease-out</code> es exactamente una función de easing. El{' '}
              <em>easeOut</em> es el más usado porque imita cómo se detiene algo real.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Para microinteracciones de 150–300 ms casi cualquier ease out queda bien; lo importante
              es que no sea linear.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>«Juice» en videojuegos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Un objeto que aparece con un pequeño rebote (back/elastic), una moneda recogida que da un
              salto, un menú que entra con carácter. Ese pulido que hace que un juego «se sienta bien» se
              construye en gran parte con easing.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Combinar escala + posición con easings distintas multiplica la sensación de vida.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎥</span>
              <strong>Cámaras y movimientos de cámara</strong>
            </div>
            <p className={styles.escenarioExample}>
              Una cámara que se acerca a un objetivo o sigue al personaje no debe arrancar ni frenar de
              golpe. Una easing in-out suaviza el inicio y el final del movimiento y evita el mareo del
              corte brusco.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Para recorridos por una trayectoria curva, el easing controla el ritmo y la Bézier, la
              forma del camino.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎬</span>
              <strong>Motion graphics y vídeo</strong>
            </div>
            <p className={styles.escenarioExample}>
              En After Effects, Figma o Lottie las propiedades animadas (posición, opacidad, escala)
              llevan curvas de easing en sus fotogramas clave. El editor de curvas es, de hecho, un
              editor de Bézier cúbica.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> La regla «ease todo» de los animadores: casi nada se mueve a velocidad constante en la
              naturaleza.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cómo aplico una función de easing a una animación?</h4>
            <p>
              Calculas el progreso lineal <code>t</code> dividiendo el tiempo transcurrido entre la
              duración total, lo pasas por la easing y lo usas para interpolar:{' '}
              <code>valor = inicio + (fin − inicio) × easing(t)</code>. Así, en lugar de mover el valor
              a ritmo constante, sigues la curva: arranca o frena según la función elegida.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> La misma fórmula sirve para posición, escala, opacidad o color (interpolando cada canal).
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué casi nunca conviene usar «linear»?</h4>
            <p>
              Una animación lineal mantiene la misma velocidad de principio a fin, algo que en el mundo
              real casi no ocurre: las cosas aceleran y frenan. Por eso el movimiento lineal se percibe
              robótico. Se reserva para casos donde la constancia es deseable: barras de progreso,
              rotaciones continuas o cintas.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Compara en la gráfica cualquier curva con la diagonal: cuanto más se aleja de la recta,
              más cambia el ritmo.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué relación hay con cubic-bezier() de CSS?</h4>
            <p>
              La función <code>cubic-bezier(x1, y1, x2, y2)</code> de CSS define una curva de easing con
              una Bézier cúbica donde los ejes son tiempo y progreso. Las funciones de Penner (quad,
              cubic, sine…) son fórmulas equivalentes a esas curvas. Las palabras clave <code>ease</code>,{' '}
              <code>ease-in</code> o <code>ease-out</code> de CSS son, por dentro, cubic-bezier concretas.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> back y elastic no se pueden expresar con un solo cubic-bezier porque se salen del rango;
              en CSS se logran con keyframes o con la nueva función <code>linear()</code>.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo uso easeIn, easeOut o easeInOut?</h4>
            <p>
              <strong>easeOut</strong> para que algo aparezca o se detenga (lo más habitual en
              interfaces). <strong>easeIn</strong> para que algo desaparezca o salga de pantalla.{' '}
              <strong>easeInOut</strong> para mover un elemento de un punto a otro, porque suaviza tanto
              el arranque como el frenado.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Regla rápida: lo que entra, easeOut; lo que sale, easeIn; lo que va de A a B, easeInOut.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el overshoot y por qué back y elastic se salen de 0–1?</h4>
            <p>
              El overshoot es cuando el valor se pasa del destino y vuelve, como un muelle. Las familias
              back y elastic lo hacen a propósito (y back también retrocede al inicio: anticipación) para
              dar sensación de energía. Por eso devuelven valores menores que 0 o mayores que 1 en parte
              del recorrido.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> No las apliques a propiedades que no admiten salirse de su rango, como una opacidad
              (0–1) o un tamaño que no puede ser negativo.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Estas funciones sirven en cualquier lenguaje o motor?</h4>
            <p>
              Sí. Son fórmulas matemáticas puras que reciben <code>t</code> y devuelven un valor, así que
              se implementan igual en JavaScript, C#, C++, Python o GDScript. Motores como Unity, Godot o
              Unreal traen sus propios editores de curvas, pero entender las funciones por dentro te
              permite replicarlas y combinarlas a mano.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> El catálogo «estándar» (easeInQuad, easeOutCubic…) viene de las ecuaciones que popularizó
              Robert Penner y se reutiliza en casi todas las librerías de animación.
            </p>
          </div>
        </div>

        <h3>Cómo aplicar una easing a tu animación paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Define inicio, fin y duración</strong>
              <p>
                Decide el valor de partida (por ejemplo x = 0), el valor final (x = 500) y cuánto debe
                durar la animación en milisegundos (por ejemplo 1200 ms).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Calcula el progreso lineal t</strong>
              <p>
                En cada fotograma, mide el tiempo transcurrido y divídelo entre la duración:{' '}
                <code>t = transcurrido / duración</code>. Recórtalo a [0, 1] para que no se pase.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Pasa t por la función de easing</strong>
              <p>
                Obtén el valor curvado: <code>p = easing(t)</code>. Aquí es donde eliges si la animación
                acelera, frena o rebota.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Interpola el valor real</strong>
              <p>
                Aplica <code>valor = inicio + (fin − inicio) × p</code>. Asigna ese valor a la propiedad
                (posición, escala, opacidad…) y dibuja el fotograma.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Repite hasta t = 1</strong>
              <p>
                Sigue en cada fotograma hasta que t llegue a 1. Ahí la animación termina con el valor en
                el destino exacto.
              </p>
            </div>
          </div>
        </div>

        <h3>Buenas prácticas al animar con easing</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>easeOut por defecto</strong>
            <p>
              Para casi todo lo que aparece o se detiene, un easeOut (quad o cubic) es la opción segura y
              natural. Empieza por ahí antes de buscar curvas más exóticas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Reserva back y elastic</strong>
            <p>
              Son sabrosas pero cansan si se abusa. Úsalas como acento puntual (una confirmación, un icono
              destacado), no en cada transición.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Ajusta duración a la distancia</strong>
            <p>
              Un recorrido corto necesita menos tiempo que uno largo. Duraciones de 150–400 ms funcionan
              para microinteracciones; reserva más tiempo para movimientos grandes.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Respeta prefers-reduced-motion</strong>
            <p>
              Hay personas a las que el movimiento les molesta. Detecta esa preferencia del sistema y
              reduce o desactiva las animaciones cuando esté activa.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Cuida la propiedad animada</strong>
            <p>
              Animar transform y opacity es barato; animar width, top o left fuerza recálculos de
              maquetación. Prefiere transform para que vaya fluido.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Combina varias easings</strong>
            <p>
              Aplicar curvas distintas a posición, escala y opacidad a la vez crea movimientos mucho más
              ricos que usar la misma para todo.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes con funciones de easing</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Usar linear para todo: el movimiento se percibe mecánico y sin vida.</li>
            <li>Aplicar back o elastic a opacidad o tamaño: el overshoot saca el valor de su rango válido.</li>
            <li>Olvidar recortar t a [0, 1]: la animación se pasa del destino o «explota» con expo/elastic.</li>
            <li>Abusar de rebotes y muelles: cansan y restan claridad en lugar de aportarla.</li>
            <li>Animar width/top/left en vez de transform: caídas de rendimiento por recálculo de layout.</li>
            <li>No respetar prefers-reduced-motion: animaciones intensas que marean a parte del público.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-funciones-easing')} />
      <ShareCard appName="visualizador-funciones-easing" />
      <Footer appName="visualizador-funciones-easing" />
    </div>
  );
}
