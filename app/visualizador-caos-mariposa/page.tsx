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
import { getRelatedApps } from '@/data/app-relations';
import styles from './CaosMariposa.module.css';

// ─────────────────────────────────────────────
// Constantes y tipos
// ─────────────────────────────────────────────

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.01;
const N_STEPS = 7000;

interface LorenzPoint {
  x: number;
  z: number;
}

function computeLorenz(x0: number, y0: number, z0: number): LorenzPoint[] {
  const points: LorenzPoint[] = [];
  let x = x0,
    y = y0,
    z = z0;
  for (let i = 0; i < N_STEPS; i++) {
    const dx = SIGMA * (y - x);
    const dy = x * (RHO - z) - y;
    const dz = x * y - BETA * z;
    x += dx * DT;
    y += dy * DT;
    z += dz * DT;
    points.push({ x, z });
  }
  return points;
}

// ─────────────────────────────────────────────
// Datos estáticos de conceptos y sistemas
// ─────────────────────────────────────────────

const CONCEPTOS = [
  {
    icono: '🦋',
    titulo: 'El Efecto Mariposa',
    texto:
      'Edward Lorenz (1972) acuñó la metáfora: "¿Puede el aleteo de una mariposa en Brasil desencadenar un tornado en Texas?" La respuesta real es: no exactamente, pero sí que pequeñas perturbaciones en sistemas caóticos se amplifican exponencialmente. Lorenz lo descubrió en 1961 cuando reinició su simulación meteorológica desde el medio, redondeando 0.506127 a 0.506. El resultado fue completamente diferente.',
  },
  {
    icono: '📐',
    titulo: 'Sensibilidad a las condiciones iniciales',
    texto:
      'La característica definitoria del caos: dos estados que difieren en ε = 0.00001 se separan siguiendo la ley d(t) ≈ ε · e^(λt), donde λ es el exponente de Lyapunov. Para el atractor de Lorenz, λ ≈ 0.9 bits/s, lo que significa que el sistema pierde un "bit" de predictibilidad cada segundo. Después de ~10 unidades de tiempo, el pronóstico es imposible.',
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
      'El atractor de Lorenz es un "atractor extraño": el sistema nunca se repite (no es periódico), nunca diverge al infinito, siempre está en ese conjunto de mariposa. Tiene dimensión fractal ≈ 2.06, entre 2D y 3D. Es la huella del caos: un objeto infinitamente complejo en un espacio finito.',
  },
];

const SISTEMAS = [
  {
    icono: '🌦️',
    titulo: 'Meteorología',
    texto:
      'Lorenz trabajaba en predicción del tiempo. Por eso no podemos predecir el clima con exactitud más allá de ~2 semanas.',
  },
  {
    icono: '❤️',
    titulo: 'Cardiología',
    texto:
      'La variabilidad del ritmo cardíaco es caótica — y eso es sano. Un corazón demasiado regular indica patología (fibrilación).',
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
      'Mandelbrot mostró que los precios tienen estructura caótica. Los modelos financieros clásicos (Black-Scholes) subestiman la frecuencia de eventos extremos.',
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
    const t1 = computeLorenz(0.1, 0, 0);
    const t2 = computeLorenz(0.1 + epsilon, 0, 0);
    let divStep = N_STEPS;
    for (let i = 0; i < N_STEPS; i++) {
      const dist = Math.abs(t1[i].x - t2[i].x) + Math.abs(t1[i].z - t2[i].z);
      if (dist > 5) {
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
          <span className={styles.leyendaItem} style={{ color: '#2E86AB' }}>
            ■ Trayectoria 1 (x₀ = 0.1)
          </span>
          <span className={styles.leyendaItem} style={{ color: '#E67E22' }}>
            ■ Trayectoria 2 (x₀ = 0.1 + ε)
          </span>
          <span className={styles.leyendaItem} style={{ color: '#E74C3C' }}>
            ● Punto de divergencia
          </span>
        </div>

        {/* Controles */}
        <div className={styles.controles}>
          <div className={styles.controlGrupo}>
            <label className={styles.controlLabel}>
              Progreso de la simulación:{' '}
              <strong>
                paso {progreso.toLocaleString('es-ES')} / {N_STEPS.toLocaleString('es-ES')}
              </strong>
            </label>
            <input
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
            <label className={styles.controlLabel}>
              Diferencia inicial (ε): <strong>{epsilon.toExponential(2)}</strong>
            </label>
            <input
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
            />
            <small className={styles.sliderHint}>← ε más pequeña &nbsp;·&nbsp; ε más grande →</small>
          </div>

          <div className={styles.estadoDiv} role="alert" aria-live="polite">
            {divergeStep < N_STEPS ? (
              <span className={styles.estadoDivergente}>
                ⚡ Las trayectorias divergen en el paso{' '}
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
            cercanas. Si λ &gt; 0, el sistema es caótico. Para el atractor de Lorenz, λ ≈ 0.9 bits
            por unidad de tiempo. Esto significa que cada unidad de tiempo se pierde casi un bit de
            información predictiva. Después de 10-15 unidades, la predicción es esencialmente
            imposible.
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
          <strong>ℹ️ Nota:</strong> El atractor de Lorenz es un modelo simplificado de convección
          atmosférica. Las trayectorias mostradas son proyecciones 2D (plano x-z) de un sistema
          tridimensional. La divergencia visualizada depende del ε y el número de pasos configurados.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-caos-mariposa')} />
      <ShareCard appName="visualizador-caos-mariposa" />
      <Footer appName="visualizador-caos-mariposa" />
    </div>
  );
}
