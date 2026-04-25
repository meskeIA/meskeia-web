'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './CalculoVisual.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y datos
// ─────────────────────────────────────────────

type FuncionKey = 'cuadratica' | 'senoidal' | 'cubica';
type Seccion = 'limite' | 'derivada' | 'integral';

const FUNCIONES: Record<FuncionKey, {
  label: string;
  fn: (x: number) => number;
  derFn: (x: number) => number;
  antiFn: (x: number) => number;
  derLabel: string;
}> = {
  cuadratica: {
    label: 'f(x) = x²',
    fn: (x) => x * x,
    derFn: (x) => 2 * x,
    antiFn: (x) => (x ** 3) / 3,
    derLabel: "f'(x) = 2x",
  },
  senoidal: {
    label: 'f(x) = sin(x)',
    fn: Math.sin,
    derFn: Math.cos,
    antiFn: (x) => -Math.cos(x),
    derLabel: "f'(x) = cos(x)",
  },
  cubica: {
    label: 'f(x) = x³ − x',
    fn: (x) => x ** 3 - x,
    derFn: (x) => 3 * x ** 2 - 1,
    antiFn: (x) => x ** 4 / 4 - x ** 2 / 2,
    derLabel: "f'(x) = 3x² − 1",
  },
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function CalculoVisualPage() {
  const [seccion, setSeccion] = useState<Seccion>('derivada');
  const [funcionKey, setFuncionKey] = useState<FuncionKey>('cuadratica');
  const [xPunto, setXPunto] = useState(1.0);
  const [limA, setLimA] = useState(-2.0);
  const [limB, setLimB] = useState(2.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    const X_MIN = -5, X_MAX = 5, Y_MIN = -3.5, Y_MAX = 3.5;
    const cx = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * W;
    const cy = (y: number) => H - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * H;

    const { fn, derFn } = FUNCIONES[funcionKey];

    // 1. Clear + background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, W, H);

    // 2. Grid (cada 1 unidad)
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1;
    for (let gx = Math.ceil(X_MIN); gx <= X_MAX; gx++) {
      ctx.beginPath(); ctx.moveTo(cx(gx), 0); ctx.lineTo(cx(gx), H); ctx.stroke();
    }
    for (let gy = Math.ceil(Y_MIN); gy <= Y_MAX; gy++) {
      ctx.beginPath(); ctx.moveTo(0, cy(gy)); ctx.lineTo(W, cy(gy)); ctx.stroke();
    }

    // 3. Ejes
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy(0)); ctx.lineTo(W, cy(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx(0), 0); ctx.lineTo(cx(0), H); ctx.stroke();

    // Etiquetas de ejes
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    for (let gx = -4; gx <= 4; gx += 2) {
      if (gx === 0) continue;
      ctx.fillText(String(gx), cx(gx), cy(0) + 14);
    }

    // 4. Curva de la función (azul meskeIA)
    ctx.beginPath();
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 2.5;
    let first = true;
    for (let px = 0; px <= W; px++) {
      const x = X_MIN + (px / W) * (X_MAX - X_MIN);
      const y = fn(x);
      if (y < Y_MIN - 2 || y > Y_MAX + 2) { first = true; continue; }
      if (first) { ctx.moveTo(px, cy(y)); first = false; }
      else ctx.lineTo(px, cy(y));
    }
    ctx.stroke();

    // 5. Elementos específicos por sección
    if (seccion === 'derivada') {
      const x0 = xPunto;
      const y0 = fn(x0);
      const m = derFn(x0);

      // Tangente (naranja punteada)
      ctx.beginPath();
      ctx.strokeStyle = '#E67E22';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([7, 5]);
      ctx.moveTo(cx(X_MIN), cy(m * (X_MIN - x0) + y0));
      ctx.lineTo(cx(X_MAX), cy(m * (X_MAX - x0) + y0));
      ctx.stroke();
      ctx.setLineDash([]);

      // Punto naranja sobre la curva
      ctx.beginPath();
      ctx.arc(cx(x0), cy(y0), 6, 0, Math.PI * 2);
      ctx.fillStyle = '#E67E22';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (seccion === 'integral') {
      const N = 80;
      const dx = (limB - limA) / N;
      ctx.fillStyle = 'rgba(72, 169, 166, 0.35)';
      for (let i = 0; i < N; i++) {
        const x = limA + i * dx;
        const y = fn(x);
        const rx = cx(x);
        const rw = cx(x + dx) - rx;
        const ry0 = cy(0);
        const ry = cy(y);
        ctx.fillRect(rx, Math.min(ry, ry0), rw, Math.abs(ry - ry0));
      }
      // Líneas de límites
      ctx.strokeStyle = '#48A9A6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath(); ctx.moveTo(cx(limA), 0); ctx.lineTo(cx(limA), H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx(limB), 0); ctx.lineTo(cx(limB), H); ctx.stroke();
      ctx.setLineDash([]);
    }

    if (seccion === 'limite') {
      const a = xPunto;
      const eps = 0.5;
      const xL = a - eps, xR = a + eps;

      // Línea vertical punteada
      ctx.strokeStyle = 'rgba(100,100,100,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx(a), 0); ctx.lineTo(cx(a), H); ctx.stroke();
      ctx.setLineDash([]);

      // Punto izquierdo (morado)
      ctx.beginPath();
      ctx.arc(cx(xL), cy(fn(xL)), 6, 0, Math.PI * 2);
      ctx.fillStyle = '#8E44AD';
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

      // Punto derecho (verde)
      ctx.beginPath();
      ctx.arc(cx(xR), cy(fn(xR)), 6, 0, Math.PI * 2);
      ctx.fillStyle = '#27AE60';
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }
  }, [seccion, funcionKey, xPunto, limA, limB]);

  const { fn, derFn, antiFn, derLabel } = FUNCIONES[funcionKey];
  const valorDerivada = derFn(xPunto).toFixed(3);
  const valorIntegral = (antiFn(limB) - antiFn(limA)).toFixed(4);
  const valorLimite = fn(xPunto).toFixed(3);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1>Cálculo Visual</h1>
        <p>Límites, derivadas e integrales — los conceptos que animan la ciencia moderna</p>
      </header>
      <LegalNotice />

      {/* Selector de sección */}
      <div className={styles.seccionTabs}>
        {(['limite', 'derivada', 'integral'] as Seccion[]).map(s => (
          <button
            key={s}
            className={`${styles.tab} ${seccion === s ? styles.tabActivo : ''}`}
            onClick={() => setSeccion(s)}
            aria-pressed={seccion === s}
          >
            {s === 'limite' ? '→ Límites' : s === 'derivada' ? '∂ Derivadas' : '∫ Integrales'}
          </button>
        ))}
      </div>

      {/* Selector de función */}
      <div className={styles.funcionSelector}>
        <span className={styles.selectorLabel}>Función:</span>
        {(Object.keys(FUNCIONES) as FuncionKey[]).map(k => (
          <button
            key={k}
            className={`${styles.btnFuncion} ${funcionKey === k ? styles.btnFuncionActivo : ''}`}
            onClick={() => setFuncionKey(k)}
          >
            {FUNCIONES[k].label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className={styles.canvas}
          aria-label={`Gráfico de ${FUNCIONES[funcionKey].label} — sección ${seccion}`}
        />
      </div>

      {/* Controles y resultados según sección */}
      {seccion === 'derivada' && (
        <div className={styles.controles}>
          <label className={styles.sliderLabel}>
            Punto x₀: <strong>{xPunto.toFixed(1)}</strong>
            <input
              type="range"
              min={-4}
              max={4}
              step={0.1}
              value={xPunto}
              onChange={e => setXPunto(Number(e.target.value))}
              className={styles.slider}
            />
          </label>
          <div className={styles.resultado}>
            <span className={styles.formula}>{derLabel}</span>
            <span className={styles.valor}>
              f&apos;({xPunto.toFixed(1)}) = <strong>{valorDerivada}</strong>
            </span>
            <span className={styles.descripcionCorta}>
              Pendiente de la tangente en x = {xPunto.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {seccion === 'integral' && (
        <div className={styles.controles}>
          <label className={styles.sliderLabel}>
            Límite a: <strong>{limA.toFixed(1)}</strong>
            <input
              type="range"
              min={-4}
              max={limB - 0.5}
              step={0.1}
              value={limA}
              onChange={e => setLimA(Number(e.target.value))}
              className={styles.slider}
            />
          </label>
          <label className={styles.sliderLabel}>
            Límite b: <strong>{limB.toFixed(1)}</strong>
            <input
              type="range"
              min={limA + 0.5}
              max={4}
              step={0.1}
              value={limB}
              onChange={e => setLimB(Number(e.target.value))}
              className={styles.slider}
            />
          </label>
          <div className={styles.resultado}>
            <span className={styles.valor}>
              ∫[{limA.toFixed(1)},{limB.toFixed(1)}] f(x)dx = <strong>{valorIntegral}</strong>
            </span>
            <span className={styles.descripcionCorta}>
              Área bajo la curva entre {limA.toFixed(1)} y {limB.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {seccion === 'limite' && (
        <div className={styles.controles}>
          <label className={styles.sliderLabel}>
            Punto de aproximación a: <strong>{xPunto.toFixed(1)}</strong>
            <input
              type="range"
              min={-4}
              max={4}
              step={0.1}
              value={xPunto}
              onChange={e => setXPunto(Number(e.target.value))}
              className={styles.slider}
            />
          </label>
          <div className={styles.resultado}>
            <div className={styles.limiteRow}>
              <span className={styles.puntoIzq}>
                ■ f({(xPunto - 0.5).toFixed(1)}) = {fn(xPunto - 0.5).toFixed(3)}
              </span>
              <span className={styles.limiteFinal}>
                lim(x→{xPunto.toFixed(1)}) = <strong>{valorLimite}</strong>
              </span>
              <span className={styles.puntoDer}>
                ■ f({(xPunto + 0.5).toFixed(1)}) = {fn(xPunto + 0.5).toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Explicación conceptual de la sección activa */}
      <div className={styles.explicacionSection}>
        {seccion === 'derivada' && (
          <>
            <h3>¿Qué es una derivada?</h3>
            <p>
              La derivada mide la <strong>tasa de cambio instantánea</strong> de una función.
              Geométricamente, es la pendiente de la recta tangente a la curva en un punto.
            </p>
            <p>Fórmula: f&apos;(x₀) = lim(h→0) [f(x₀+h) − f(x₀)] / h</p>
            <div className={styles.ejemplosGrid}>
              <div className={styles.ejemploCard}>
                <strong>Velocidad</strong><br />
                Derivada de la posición respecto al tiempo
              </div>
              <div className={styles.ejemploCard}>
                <strong>Marginal</strong><br />
                En economía: coste marginal = derivada del coste total
              </div>
              <div className={styles.ejemploCard}>
                <strong>Temperatura</strong><br />
                Tasa de cambio de temperatura en un punto del espacio
              </div>
            </div>
          </>
        )}
        {seccion === 'integral' && (
          <>
            <h3>¿Qué es una integral?</h3>
            <p>
              La integral definida calcula el <strong>área bajo la curva</strong> entre dos puntos.
              Es la suma de infinitas franjas infinitamente delgadas.
            </p>
            <p>
              Los rectángulos de Riemann (visibles en el gráfico) son una aproximación:
              cuantos más rectángulos, más precisa.
            </p>
            <div className={styles.ejemplosGrid}>
              <div className={styles.ejemploCard}>
                <strong>Distancia</strong><br />
                Integral de la velocidad respecto al tiempo
              </div>
              <div className={styles.ejemploCard}>
                <strong>Dosis</strong><br />
                Área bajo la curva plasmática de un fármaco (AUC)
              </div>
              <div className={styles.ejemploCard}>
                <strong>Energía</strong><br />
                Integral de la potencia respecto al tiempo
              </div>
            </div>
          </>
        )}
        {seccion === 'limite' && (
          <>
            <h3>¿Qué es un límite?</h3>
            <p>
              El límite describe el valor al que <strong>tiende</strong> una función cuando x
              se aproxima a un punto — aunque quizá no lo alcance.
            </p>
            <p>
              Los puntos morado y verde del gráfico se aproximan desde la izquierda y la derecha.
              Si convergen al mismo valor, el límite existe.
            </p>
            <div className={styles.ejemplosGrid}>
              <div className={styles.ejemploCard}>
                <strong>Velocidad instantánea</strong><br />
                Límite de la velocidad media cuando Δt → 0
              </div>
              <div className={styles.ejemploCard}>
                <strong>Asíntotas</strong><br />
                Qué pasa cuando x tiende a infinito
              </div>
              <div className={styles.ejemploCard}>
                <strong>Continuidad</strong><br />
                Una función es continua si el límite = el valor
              </div>
            </div>
          </>
        )}
      </div>

      {/* Insight box */}
      <div className={styles.insightBox}>
        <strong>El Teorema Fundamental del Cálculo:</strong> Newton y Leibniz descubrieron
        independientemente (1665-1675) que derivadas e integrales son{' '}
        <em>operaciones inversas</em>. Esta relación inesperada unificó dos problemas
        aparentemente distintos y revolucionó la física, la ingeniería y toda la ciencia moderna.
      </div>

      <EducationalSection
        title="Historia del Cálculo"
        subtitle="Newton, Leibniz y la mayor disputa científica del siglo XVII"
        defaultOpen={false}
      >
        <p>
          El cálculo fue desarrollado simultáneamente por Isaac Newton (1665, inspirado en una
          plaga de peste que le obligó a quedarse en casa) y Gottfried Leibniz (1675). La disputa
          sobre la prioridad del descubrimiento duró décadas y envenenó las relaciones entre
          matemáticos ingleses y continentales.
        </p>
        <p>
          <strong>Legado:</strong> La notación de Leibniz (dy/dx, ∫) es la que usamos hoy. Las
          leyes del movimiento de Newton usaban su versión del cálculo (notación con puntos).
          Ambos tenían razón — lo descubrieron por separado.
        </p>
        <p>
          Hoy el cálculo es la base de: la mecánica clásica (F = ma es una ecuación diferencial),
          la relatividad general, la mecánica cuántica, la economía matemática, el machine learning
          (backpropagation = cadena de derivadas), y el diseño de cualquier estructura física.
        </p>
        <div className={styles.warningBox}>
          <strong>Nota:</strong> Las funciones mostradas son ejemplos pedagógicos. Las integrales
          se calculan usando la fórmula exacta de la antiderivada (Teorema Fundamental), no por
          aproximación numérica.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-calculo-visual')} />
      <ShareCard appName="visualizador-calculo-visual" />
      <Footer appName="visualizador-calculo-visual" />
    </div>
  );
}
