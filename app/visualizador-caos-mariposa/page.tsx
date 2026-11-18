'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import styles from './CaosMariposa.module.css';

// ─────────────────────────────────────────────
// Constantes y tipos
// ─────────────────────────────────────────────

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.01;
const N_STEPS = 7000;
/** Cada paso de 0,01 se integra con RK4 en 10 subpasos de 0,001 (convergido: 0,0005 y 0,00025 dan lo mismo). */
const SUBPASOS = 10;
/** Transitorio desde (0,1, 0, 0) hasta caer en el atractor: 1.000 pasos (t = 10). */
const PASOS_TRANSITORIO = 1000;
/** Separación |Δx| + |Δz| a partir de la cual se dice que las trayectorias han divergido. */
const UMBRAL_DIVERGENCIA = 5;

type Estado = [number, number, number];

interface LorenzPoint {
  x: number;
  z: number;
}

function derivada([x, y, z]: Estado): Estado {
  return [SIGMA * (y - x), x * (RHO - z) - y, x * y - BETA * z];
}

function pasoRk4(p: Estado, h: number): Estado {
  const k1 = derivada(p);
  const k2 = derivada([p[0] + (k1[0] * h) / 2, p[1] + (k1[1] * h) / 2, p[2] + (k1[2] * h) / 2]);
  const k3 = derivada([p[0] + (k2[0] * h) / 2, p[1] + (k2[1] * h) / 2, p[2] + (k2[2] * h) / 2]);
  const k4 = derivada([p[0] + k3[0] * h, p[1] + k3[1] * h, p[2] + k3[2] * h]);
  return [
    p[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    p[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    p[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
  ];
}

/** Un paso de DT = 0,01 en SUBPASOS de RK4. */
function avanzar(p: Estado): Estado {
  let q = p;
  for (let s = 0; s < SUBPASOS; s++) q = pasoRk4(q, DT / SUBPASOS);
  return q;
}

/**
 * Punto de partida de las dos trayectorias: un punto YA en el atractor. Hallazgo 5136
 * (18/11/2026): salían de (0,1, 0, 0), junto al origen, que es un equilibrio inestable; en la
 * salida desde él la separación crecía como ε·e^(11,8t) y, con ε ≥ 0,0126, cruzaba el umbral en
 * los pasos 20-54 aunque luego volvieran a juntarse, y el punto anunciado quedaba bajo el lienzo.
 */
let puntoAtractorCache: Estado | null = null;
function puntoDelAtractor(): Estado {
  if (puntoAtractorCache) return puntoAtractorCache;
  let p: Estado = [0.1, 0, 0];
  for (let i = 0; i < PASOS_TRANSITORIO; i++) p = avanzar(p);
  puntoAtractorCache = p;
  return p;
}

/**
 * Hallazgo 5137 (18/11/2026): integraba con Euler explícito y dt = 0,01, que no reproduce el
 * sistema de Lorenz (exponente de Lyapunov 1,04 frente a 0,906, z hasta 50 y el paso de divergencia
 * de la discretización). Ahora RK4 con dt = 0,001.
 */
function computeLorenz(inicio: Estado): LorenzPoint[] {
  const points: LorenzPoint[] = [];
  let p = inicio;
  for (let i = 0; i < N_STEPS; i++) {
    p = avanzar(p);
    points.push({ x: p[0], z: p[2] });
  }
  return points;
}

const SUPERINDICE: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
};

/** ε en notación científica española: «1,00 × 10⁻²» (cabo C0499 y hallazgo 5143: salía «1.00e-2»). */
function formatearEpsilon(eps: number): string {
  const exponente = Math.floor(Math.log10(eps) + 1e-9);
  const mantisa = eps / Math.pow(10, exponente);
  const mantisaTexto = mantisa.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const expTexto = String(exponente).split('').map((c) => SUPERINDICE[c] ?? c).join('');
  return `${mantisaTexto} × 10${expTexto}`;
}

// ─────────────────────────────────────────────
// Datos estáticos de conceptos y sistemas
// ─────────────────────────────────────────────

const CONCEPTOS = [
  {
    icono: '🦋',
    titulo: 'El Efecto Mariposa',
    texto:
      'Edward Lorenz (1972) acuñó la metáfora: "¿Puede el aleteo de una mariposa en Brasil desencadenar un tornado en Texas?" La respuesta real es: no exactamente, pero sí que pequeñas perturbaciones en sistemas caóticos se amplifican exponencialmente. Lorenz lo descubrió en 1961 cuando reinició su simulación meteorológica desde el medio, redondeando 0,506127 a 0,506. El resultado fue completamente diferente.',
  },
  {
    icono: '📐',
    titulo: 'Sensibilidad a las condiciones iniciales',
    texto:
      'La característica definitoria del caos: dos estados que difieren en ε = 0,00001 se separan siguiendo la ley d(t) ≈ ε · e^(λt), donde λ es el exponente de Lyapunov. Para el atractor de Lorenz, λ ≈ 0,906 por unidad de tiempo (adimensional): el error se duplica cada 0,77 unidades, unos 1,31 bits de predictibilidad perdidos por unidad. Después de ~10 unidades de tiempo, el pronóstico es imposible.',
  },
  {
    icono: '🌀',
    titulo: 'Determinismo sin predicción',
    texto:
      'El caos es completamente determinista: conocida la condición inicial exacta, el futuro está determinado. El problema es "exacta". En la práctica, cualquier medición tiene error. Y ese error, por pequeño que sea, hace que la predicción a largo plazo sea imposible. El universo es determinista y sin embargo impredecible.',
  },
  {
    icono: '🔀',
    titulo: 'Atractores extraños',
    texto:
      'El atractor de Lorenz es un "atractor extraño": el sistema nunca se repite (no es periódico), nunca diverge al infinito, siempre está en ese conjunto de mariposa. Tiene dimensión fractal ≈ 2,06, entre 2D y 3D. Es la huella del caos: un objeto infinitamente complejo en un espacio finito.',
  },
];

const SISTEMAS = [
  {
    icono: '🌦️',
    titulo: 'Meteorología',
    texto:
      'Lorenz trabajaba en predicción del tiempo. Por eso el pronóstico del tiempo pierde fiabilidad más allá de unas dos semanas (el clima, que es un promedio a largo plazo, se estudia de otra forma).',
  },
  {
    icono: '❤️',
    titulo: 'Cardiología',
    texto:
      'La variabilidad del ritmo cardíaco tiene una dinámica compleja, que algunos estudios describen como caótica. Algunas arritmias, como la fibrilación, son en cambio ritmos irregulares y desorganizados.',
  },
  {
    icono: '🌊',
    titulo: 'Turbulencia',
    texto:
      'El flujo de fluidos en régimen turbulento es caótico. Resolver la turbulencia completamente es uno de los Problemas del Milenio.',
  },
  {
    icono: '📈',
    titulo: 'Mercados financieros',
    texto:
      'Mandelbrot describió colas pesadas y escalado fractal en los precios; que sean caos determinista no está establecido. Los modelos financieros clásicos (Black-Scholes) subestiman la frecuencia de eventos extremos.',
  },
  {
    icono: '🌙',
    titulo: 'Mecánica celestial',
    texto:
      'El problema de los 3 cuerpos no tiene solución analítica general y es caótico. La Vía Láctea es un sistema caótico.',
  },
  {
    icono: '🧬',
    titulo: 'Dinámica de poblaciones',
    texto:
      'La ecuación logística x(n+1) = r·x(n)·(1−x(n)) pasa de estable a oscilante a caótica al aumentar r. La primera bifurcación a r≈3.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function CaosMariposaPage() {
  const [epsilon, setEpsilon] = useState(0.01);
  const [progreso, setProgreso] = useState(N_STEPS);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Valor del slider logarítmico (0-30) → epsilon = 10^(-val/10)
  // epsilon=0.01 → val=20; epsilon=0.001 → val=30; epsilon=1 → val=0
  const sliderVal = Math.round(-Math.log10(epsilon) * 10);

  const { tray1, tray2, divergeStep } = useMemo(() => {
    const p0 = puntoDelAtractor();
    const t1 = computeLorenz(p0);
    const t2 = computeLorenz([p0[0] + epsilon, p0[1], p0[2]]);
    let divStep = N_STEPS;
    for (let i = 0; i < N_STEPS; i++) {
      const dist = Math.abs(t1[i].x - t2[i].x) + Math.abs(t1[i].z - t2[i].z);
      if (dist > UMBRAL_DIVERGENCIA) {
        divStep = i;
        break;
      }
    }
    return { tray1: t1, tray2: t2, divergeStep: divStep };
  }, [epsilon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    // Fondo oscuro tipo espacio
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    const cx = (x: number) => ((x + 22) / 44) * W;
    const cy = (z: number) => H - ((z - 2) / 46) * H;

    const stepsToShow = Math.min(progreso, N_STEPS);

    // Trayectoria 1 — azul meskeIA (#2E86AB)
    ctx.beginPath();
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < stepsToShow; i++) {
      const { x, z } = tray1[i];
      if (i === 0) ctx.moveTo(cx(x), cy(z));
      else ctx.lineTo(cx(x), cy(z));
    }
    ctx.stroke();

    // Trayectoria 2 — naranja (#E67E22)
    ctx.beginPath();
    ctx.strokeStyle = '#E67E22';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < stepsToShow; i++) {
      const { x, z } = tray2[i];
      if (i === 0) ctx.moveTo(cx(x), cy(z));
      else ctx.lineTo(cx(x), cy(z));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Punto actual en cada trayectoria
    if (stepsToShow > 0) {
      const p1 = tray1[stepsToShow - 1];
      ctx.beginPath();
      ctx.arc(cx(p1.x), cy(p1.z), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#7FB3D3';
      ctx.fill();

      const p2 = tray2[stepsToShow - 1];
      ctx.beginPath();
      ctx.arc(cx(p2.x), cy(p2.z), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#F39C12';
      ctx.fill();
    }

    // Marcador de punto de divergencia
    if (divergeStep < stepsToShow && divergeStep < N_STEPS) {
      const d1 = tray1[divergeStep];
      ctx.beginPath();
      ctx.arc(cx(d1.x), cy(d1.z), 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#E74C3C';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [tray1, tray2, progreso, divergeStep]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Caos y Efecto Mariposa</h1>
        <p>El atractor de Lorenz y la sensibilidad a condiciones iniciales</p>
      </header>

      <LegalNotice />

      {/* ── Canvas del atractor ── */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>El Atractor de Lorenz</h2>
        <p className={styles.seccionDesc}>
          Dos trayectorias que parten de condiciones casi idénticas. Mueve los controles para ver cómo
          divergen.
        </p>

        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={700}
            height={350}
            className={styles.canvas}
            aria-label="Visualización del atractor de Lorenz con dos trayectorias divergentes"
          />
        </div>

        {/* Leyenda */}
        <div className={styles.leyenda}>
          <span className={styles.leyendaItem} style={{ color: 'var(--primary-texto)' }}>
            ■ Trayectoria 1 (punto de partida en el atractor)
          </span>
          {/* Hallazgo 5140: el naranja y el rojo en línea daban 2,73:1 y 3,66:1 en claro */}
          <span className={`${styles.leyendaItem} ${styles.leyendaTrayectoria2}`}>
            ■ Trayectoria 2 (el mismo punto, con x + ε)
          </span>
          <span className={`${styles.leyendaItem} ${styles.leyendaDivergencia}`}>
            ● Punto de divergencia
          </span>
        </div>

        {/* Controles */}
        <div className={styles.controles}>
          <div className={styles.controlGrupo}>
            <label htmlFor="progreso-simulacion" className={styles.controlLabel}>
              Progreso de la simulación:{' '}
              <strong>
                paso {progreso.toLocaleString('es-ES')} / {N_STEPS.toLocaleString('es-ES')}
              </strong>
            </label>
            <input
              id="progreso-simulacion"
              type="range"
              min={100}
              max={N_STEPS}
              step={100}
              value={progreso}
              onChange={(e) => setProgreso(Number(e.target.value))}
              className={styles.slider}
              aria-label="Progreso de la simulación"
            />
          </div>

          <div className={styles.controlGrupo}>
            <label htmlFor="diferencia-inicial" className={styles.controlLabel}>
              Diferencia inicial (ε): <strong>{formatearEpsilon(epsilon)}</strong>
            </label>
            <input
              id="diferencia-inicial"
              type="range"
              min={0}
              max={30}
              step={1}
              value={sliderVal}
              onChange={(e) => {
                const logVal = Number(e.target.value);
                setEpsilon(Math.pow(10, -logVal / 10));
              }}
              className={styles.slider}
              aria-label="Diferencia inicial epsilon"
              aria-valuetext={`ε = ${formatearEpsilon(epsilon)}`}
            />
            {/* Hallazgo 5138: ε = 10^(−valor/10), así que la izquierda es la ε más GRANDE */}
            <small className={styles.sliderHint}>← ε más grande &nbsp;·&nbsp; ε más pequeña →</small>
          </div>

          <div className={styles.estadoDiv} role="alert" aria-live="polite">
            {divergeStep < N_STEPS ? (
              <span className={styles.estadoDivergente}>
                <span aria-hidden="true">⚡</span> Las trayectorias divergen en el paso{' '}
                {divergeStep.toLocaleString('es-ES')}
              </span>
            ) : (
              <span className={styles.estadoJuntas}>
                ✓ Las trayectorias aún no han divergido notablemente
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── 4 conceptos clave ── */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Conceptos clave</h2>
        <div className={styles.conceptosGrid}>
          {CONCEPTOS.map((c) => (
            <div key={c.titulo} className={styles.conceptoCard}>
              <div className={styles.conceptoIcono} aria-hidden="true">
                {c.icono}
              </div>
              <h3 className={styles.conceptoTitulo}>{c.titulo}</h3>
              <p className={styles.conceptoTexto}>{c.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Insight box ── */}
      <div className={styles.insightBox}>
        <p>
          <strong>El descubrimiento de Lorenz en 1961</strong> demolió el sueño laplaciano: la idea
          de que con suficiente información podríamos predecir cualquier evento futuro. La naturaleza
          es determinista pero inherentemente impredecible a largo plazo. El caos no es aleatoriedad
          — es complejidad nacida de la simplicidad.
        </p>
      </div>

      {/* ── 6 sistemas caóticos ── */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Sistemas caóticos en el mundo real</h2>
        <div className={styles.sistemasGrid}>
          {SISTEMAS.map((s) => (
            <div key={s.titulo} className={styles.sistemaCard}>
              <span className={styles.sistemaIcono} aria-hidden="true">
                {s.icono}
              </span>
              <strong className={styles.sistemaTitulo}>{s.titulo}</strong>
              <p className={styles.sistemaTexto}>{s.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="El caos y sus aplicaciones"
        subtitle="De Poincaré a Lorenz — cómo el caos pasó de curiosidad a ciencia fundamental"
        defaultOpen={false}
      >
        <div className={styles.educativoContenido}>
          <h3>Historia del caos</h3>
          <p>
            Henri Poincaré fue el primero en vislumbrar el caos en 1890, estudiando el problema de
            los tres cuerpos. Demostró que no existía una solución analítica general. Pero no fue
            hasta 1961 cuando Edward Lorenz, meteorólogo del MIT, descubrió el fenómeno de forma
            accidental al reiniciar una simulación meteorológica con datos redondeados.
          </p>
          <p>
            En 1971, David Ruelle y Floris Takens introdujeron el concepto de atractor extraño. En
            1975, Li y Yorke acuñaron matemáticamente el término «caos». En los 80, Benoit Mandelbrot
            conectó el caos con la geometría fractal. Hoy el caos es una disciplina consolidada con
            aplicaciones en ingeniería, biología, economía y criptografía.
          </p>
          <h3>El exponente de Lyapunov</h3>
          <p>
            El exponente de Lyapunov (λ) cuantifica la velocidad de separación de trayectorias
            cercanas. Si λ &gt; 0, el sistema es caótico. Para el atractor de Lorenz, λ ≈ 0,906 por
            unidad de tiempo (en base e): el error se duplica cada ln 2 / 0,906 ≈ 0,77 unidades, es
            decir, se pierden unos 1,31 bits de información predictiva por unidad de tiempo (el tiempo
            del sistema de Lorenz es adimensional, no son segundos). Después de 10-15 unidades, la
            predicción es esencialmente imposible.
          </p>
          <h3>Caos vs. aleatoriedad</h3>
          <p>
            Un sistema caótico es completamente determinista: la misma entrada inicial produce
            siempre la misma salida. La aparente aleatoriedad surge de la imposibilidad práctica de
            conocer el estado inicial con precisión infinita. Un generador de números aleatorios
            caótico produce secuencias que superan tests estadísticos de aleatoriedad, aunque estén
            determinadas por su semilla.
          </p>
        </div>

        <div className={styles.warningBox}>
          <strong><span aria-hidden="true">ℹ️</span> Nota:</strong> El atractor de Lorenz es un modelo simplificado de convección
          atmosférica. Las trayectorias mostradas son proyecciones 2D (plano x-z) de un sistema
          tridimensional. La divergencia visualizada depende del ε y el número de pasos configurados.
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="visualizador-caos-mariposa" />
      <Footer appName="visualizador-caos-mariposa" />
    </div>
  );
}
