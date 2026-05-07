'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import styles from './SimuladorPendulo.module.css';

type Modelo = 'pequeno' | 'numerico';

interface PenduloEstado {
  // Parámetros
  L: number; // longitud (m)
  m: number; // masa (kg)
  theta0Deg: number; // ángulo inicial en grados
  g: number; // gravedad (m/s^2)
  damping: number; // coeficiente de amortiguación
}

interface PendulumState {
  theta: number; // rad
  omega: number; // rad/s
}

interface DerivadosFisicos {
  T: number; // periodo (s)
  f: number; // frecuencia (Hz)
  omega0: number; // frecuencia angular (rad/s)
  correccionGrandes: number; // factor 1 + theta^2/16
  Tcorregido: number;
}

const PRESETS_GRAVEDAD: Array<{ id: string; nombre: string; g: number }> = [
  { id: 'tierra', nombre: 'Tierra (9,81)', g: 9.81 },
  { id: 'luna', nombre: 'Luna (1,62)', g: 1.62 },
  { id: 'marte', nombre: 'Marte (3,71)', g: 3.71 },
  { id: 'jupiter', nombre: 'Júpiter (24,79)', g: 24.79 },
];

const HISTORIAL_MAX = 240; // ~ 4 segundos a 60fps

function calcularDerivados(L: number, g: number, theta0Rad: number): DerivadosFisicos {
  const omega0 = Math.sqrt(g / Math.max(L, 0.0001));
  const T = (2 * Math.PI) / omega0;
  const f = 1 / T;
  const correccion = 1 + (theta0Rad * theta0Rad) / 16;
  return {
    T,
    f,
    omega0,
    correccionGrandes: correccion,
    Tcorregido: T * correccion,
  };
}

function pasoEulerNumerico(
  state: PendulumState,
  L: number,
  g: number,
  damping: number,
  dt: number,
): PendulumState {
  // Ecuación: d²θ/dt² + (γ/m·L²)·dθ/dt + (g/L)·sin(θ) = 0
  // Aproximamos γ/m·L² simplemente como `damping` (coef. efectivo).
  const alpha = -(g / Math.max(L, 0.0001)) * Math.sin(state.theta) - damping * state.omega;
  const newOmega = state.omega + alpha * dt;
  const newTheta = state.theta + newOmega * dt;
  return { theta: newTheta, omega: newOmega };
}

function thetaPequenosAngulos(
  theta0Rad: number,
  omega0: number,
  damping: number,
  t: number,
): { theta: number; omega: number } {
  // Solución cerrada con amortiguamiento exponencial: θ(t)=θ0·e^(-γt/2)·cos(ω·t)
  const env = Math.exp((-damping * t) / 2);
  const theta = theta0Rad * env * Math.cos(omega0 * t);
  const omega =
    theta0Rad * env * (-omega0 * Math.sin(omega0 * t) - (damping / 2) * Math.cos(omega0 * t));
  return { theta, omega };
}

export default function SimuladorPenduloPage() {
  // Parámetros principales
  const [L, setL] = useState(1.0);
  const [m, setM] = useState(1.0);
  const [theta0Deg, setTheta0Deg] = useState(20);
  const [g, setG] = useState(9.81);
  const [damping, setDamping] = useState(0.05);
  const [modelo, setModelo] = useState<Modelo>('numerico');

  // Comparativa
  const [comparativaActiva, setComparativaActiva] = useState(false);
  const [L2, setL2] = useState(1.5);

  // Animación
  const [running, setRunning] = useState(true);
  const [tiempo, setTiempo] = useState(0);
  const [estado1, setEstado1] = useState<PendulumState>({
    theta: (theta0Deg * Math.PI) / 180,
    omega: 0,
  });
  const [estado2, setEstado2] = useState<PendulumState>({
    theta: (theta0Deg * Math.PI) / 180,
    omega: 0,
  });
  const [historial1, setHistorial1] = useState<number[]>([]);
  const [historial2, setHistorial2] = useState<number[]>([]);

  const lastFrameRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const theta0Rad = useMemo(() => (theta0Deg * Math.PI) / 180, [theta0Deg]);

  const derivados1 = useMemo(() => calcularDerivados(L, g, theta0Rad), [L, g, theta0Rad]);
  const derivados2 = useMemo(() => calcularDerivados(L2, g, theta0Rad), [L2, g, theta0Rad]);

  // Reiniciar el sistema (se llama explícitamente al cambiar parámetros)
  const reiniciar = useCallback(() => {
    setTiempo(0);
    setEstado1({ theta: theta0Rad, omega: 0 });
    setEstado2({ theta: theta0Rad, omega: 0 });
    setHistorial1([]);
    setHistorial2([]);
    lastFrameRef.current = 0;
  }, [theta0Rad]);

  // Auto-reiniciar al modificar parámetros físicos
  useEffect(() => {
    reiniciar();
  }, [L, L2, g, theta0Rad, modelo, damping, reiniciar]);

  // Bucle de animación
  useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = (now: number) => {
      if (lastFrameRef.current === 0) {
        lastFrameRef.current = now;
      }
      const dtMs = now - lastFrameRef.current;
      lastFrameRef.current = now;
      // dt en segundos, limitado para evitar saltos cuando la pestaña pierde foco
      const dt = Math.min(dtMs / 1000, 0.05);

      setTiempo((t) => t + dt);

      if (modelo === 'numerico') {
        setEstado1((prev) => pasoEulerNumerico(prev, L, g, damping, dt));
        setEstado2((prev) => pasoEulerNumerico(prev, L2, g, damping, dt));
      } else {
        // Solución cerrada de pequeños ángulos
        setTiempo((t) => {
          const tNuevo = t; // ya está actualizado arriba
          const sol1 = thetaPequenosAngulos(theta0Rad, derivados1.omega0, damping, tNuevo);
          const sol2 = thetaPequenosAngulos(theta0Rad, derivados2.omega0, damping, tNuevo);
          setEstado1({ theta: sol1.theta, omega: sol1.omega });
          setEstado2({ theta: sol2.theta, omega: sol2.omega });
          return tNuevo;
        });
      }

      // Historial para mini-chart (cada frame, recortado)
      setHistorial1((prev) => {
        const nuevo = [...prev, 0];
        // El valor real se actualiza en el siguiente set basado en estado1.theta
        return nuevo.length > HISTORIAL_MAX ? nuevo.slice(-HISTORIAL_MAX) : nuevo;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [running, modelo, L, L2, g, damping, theta0Rad, derivados1.omega0, derivados2.omega0]);

  // Mantener el historial sincronizado con estado1/estado2 (se actualiza tras cada paso)
  useEffect(() => {
    setHistorial1((prev) => {
      const nuevo = [...prev, estado1.theta];
      return nuevo.length > HISTORIAL_MAX ? nuevo.slice(-HISTORIAL_MAX) : nuevo;
    });
  }, [estado1.theta]);

  useEffect(() => {
    setHistorial2((prev) => {
      const nuevo = [...prev, estado2.theta];
      return nuevo.length > HISTORIAL_MAX ? nuevo.slice(-HISTORIAL_MAX) : nuevo;
    });
  }, [estado2.theta]);

  // Cálculos físicos derivados del estado actual
  const energias1 = useMemo(() => {
    const v = L * estado1.omega; // velocidad tangencial
    const Ec = 0.5 * m * v * v;
    const altura = L * (1 - Math.cos(estado1.theta));
    const Ep = m * g * altura;
    const E0 = m * g * (L * (1 - Math.cos(theta0Rad)));
    return { Ec, Ep, Et: Ec + Ep, E0: Math.max(E0, 0.0001) };
  }, [L, m, g, estado1.theta, estado1.omega, theta0Rad]);

  const showCorreccion = Math.abs(theta0Deg) > 15;
  const correccionPct = (derivados1.correccionGrandes - 1) * 100;

  // Selección de preset gravedad
  const presetActual = PRESETS_GRAVEDAD.find((p) => Math.abs(p.g - g) < 0.001)?.id ?? 'custom';

  // SVG geometría
  const svgWidth = 360;
  const svgHeight = 320;
  const pivotX = svgWidth / 2;
  const pivotY = 40;
  const escala = 100; // px por metro
  const Lmax = Math.max(L, comparativaActiva ? L2 : L, 3);
  const escalaAdaptada = Math.min(escala, (svgHeight - pivotY - 30) / Math.max(Lmax, 0.5));

  function renderPendulum(
    state: PendulumState,
    longitud: number,
    masaRel: number,
    color: string,
  ) {
    const Lpx = longitud * escalaAdaptada;
    const bobX = pivotX + Lpx * Math.sin(state.theta);
    const bobY = pivotY + Lpx * Math.cos(state.theta);
    const radioBola = Math.max(8, Math.min(28, 8 + masaRel * 4));
    return (
      <>
        {/* Soporte */}
        <line x1={pivotX - 30} y1={pivotY} x2={pivotX + 30} y2={pivotY} stroke="#9ca3af" strokeWidth={4} />
        <circle cx={pivotX} cy={pivotY} r={4} fill="#6b7280" />
        {/* Cuerda */}
        <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} stroke="#374151" strokeWidth={2} />
        {/* Bola */}
        <circle cx={bobX} cy={bobY} r={radioBola} fill={color} stroke="#1e293b" strokeWidth={1.5} />
        {/* Línea vertical de referencia */}
        <line
          x1={pivotX}
          y1={pivotY}
          x2={pivotX}
          y2={pivotY + Lpx}
          stroke="#cbd5e1"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
      </>
    );
  }

  // Mini chart
  const chartW = 360;
  const chartH = 130;
  function renderChart(historial: number[], color: string) {
    if (historial.length < 2) {
      return (
        <text x={chartW / 2} y={chartH / 2} textAnchor="middle" fill="#9ca3af" fontSize="12">
          Esperando datos…
        </text>
      );
    }
    const maxAbs = Math.max(theta0Rad, 0.1);
    const stepX = chartW / Math.max(historial.length - 1, 1);
    const points = historial
      .map((th, i) => {
        const x = i * stepX;
        const y = chartH / 2 - (th / maxAbs) * (chartH / 2 - 8);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    return (
      <>
        <line x1={0} y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="#cbd5e1" strokeWidth={1} />
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
      </>
    );
  }

  const energiaPctEc = Math.min(100, (energias1.Ec / energias1.E0) * 100);
  const energiaPctEp = Math.min(100, (energias1.Ep / energias1.E0) * 100);
  const energiaPctEt = Math.min(100, (energias1.Et / energias1.E0) * 100);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Péndulo Simple y MAS</h1>
        <p>
          Ajusta longitud, masa, ángulo y gravedad. Observa la oscilación, el período y la
          energía en tiempo real.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* Selector de modelo */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tabBtn} ${modelo === 'numerico' ? styles.tabActive : ''}`}
            onClick={() => setModelo('numerico')}
          >
            Modelo numérico (cualquier ángulo)
          </button>
          <button
            className={`${styles.tabBtn} ${modelo === 'pequeno' ? styles.tabActive : ''}`}
            onClick={() => setModelo('pequeno')}
          >
            Aproximación pequeños ángulos
          </button>
        </div>

        {/* Controls + Pendulum */}
        <div className={styles.controlsPanel}>
          {/* Panel de controles */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Parámetros del péndulo</h2>
            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="long">
                  Longitud L
                  <span className={styles.valueBadge}>{formatNumber(L, 2)} m</span>
                </label>
                <input
                  id="long"
                  type="range"
                  min={0.1}
                  max={5}
                  step={0.05}
                  value={L}
                  onChange={(e) => setL(parseFloat(e.target.value))}
                />
                <span className={styles.unitLabel}>De 0,10 a 5,00 metros</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="masa">
                  Masa m
                  <span className={styles.valueBadge}>{formatNumber(m, 2)} kg</span>
                </label>
                <input
                  id="masa"
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={m}
                  onChange={(e) => setM(parseFloat(e.target.value))}
                />
                <span className={styles.unitLabel}>
                  La masa NO afecta al período (sí a la energía)
                </span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="ang">
                  Ángulo inicial θ₀
                  <span className={styles.valueBadge}>{formatNumber(theta0Deg, 0)}°</span>
                </label>
                <input
                  id="ang"
                  type="range"
                  min={0}
                  max={90}
                  step={1}
                  value={theta0Deg}
                  onChange={(e) => setTheta0Deg(parseFloat(e.target.value))}
                />
                <span className={styles.unitLabel}>
                  De 0° a 90° (recomendado &lt; 15° para aproximación)
                </span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="grav">
                  Gravedad g
                  <span className={styles.valueBadge}>{formatNumber(g, 2)} m/s²</span>
                </label>
                <input
                  id="grav"
                  type="number"
                  min={0.1}
                  max={50}
                  step={0.01}
                  value={g}
                  onChange={(e) => setG(parseFloat(e.target.value) || 9.81)}
                />
                <div className={styles.gravityPresets}>
                  {PRESETS_GRAVEDAD.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`${styles.gravityBtn} ${
                        presetActual === p.id ? styles.gravityActive : ''
                      }`}
                      onClick={() => setG(p.g)}
                    >
                      {p.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="damp">
                  Amortiguación γ
                  <span className={styles.valueBadge}>{formatNumber(damping, 3)}</span>
                </label>
                <input
                  id="damp"
                  type="range"
                  min={0}
                  max={0.5}
                  step={0.005}
                  value={damping}
                  onChange={(e) => setDamping(parseFloat(e.target.value))}
                />
                <span className={styles.unitLabel}>0 = sin fricción · 0,5 = muy amortiguado</span>
              </div>
            </div>

            <div className={styles.actionBar}>
              <button
                className={running ? styles.calcBtnSecondary : styles.calcBtn}
                onClick={() => setRunning((r) => !r)}
              >
                {running ? '⏸ Pausar' : '▶ Iniciar'}
              </button>
              <button className={styles.calcBtnGhost} onClick={reiniciar}>
                ↺ Reiniciar
              </button>
            </div>

            <div className={styles.toggleRow}>
              <input
                type="checkbox"
                id="comp"
                checked={comparativaActiva}
                onChange={(e) => setComparativaActiva(e.target.checked)}
              />
              <label htmlFor="comp">Comparar con segundo péndulo (distinta longitud)</label>
            </div>
            {comparativaActiva && (
              <div className={styles.inputGroup}>
                <label htmlFor="long2">
                  Longitud L₂
                  <span className={styles.valueBadge}>{formatNumber(L2, 2)} m</span>
                </label>
                <input
                  id="long2"
                  type="range"
                  min={0.1}
                  max={5}
                  step={0.05}
                  value={L2}
                  onChange={(e) => setL2(parseFloat(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* Panel de animación + resultados */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Animación</h2>
            {comparativaActiva ? (
              <div className={styles.pendulumStageDual}>
                <div className={styles.pendulumStage}>
                  <p className={styles.pendulumLabel}>
                    Péndulo 1 — L = {formatNumber(L, 2)} m
                  </p>
                  <svg
                    className={styles.pendulumSvg}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    role="img"
                    aria-label="Animación del péndulo 1"
                  >
                    {renderPendulum(estado1, L, m, '#2E86AB')}
                  </svg>
                </div>
                <div className={styles.pendulumStage}>
                  <p className={styles.pendulumLabel}>
                    Péndulo 2 — L = {formatNumber(L2, 2)} m
                  </p>
                  <svg
                    className={styles.pendulumSvg}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    role="img"
                    aria-label="Animación del péndulo 2"
                  >
                    {renderPendulum(estado2, L2, m, '#48A9A6')}
                  </svg>
                </div>
              </div>
            ) : (
              <div className={styles.pendulumStage}>
                <svg
                  className={styles.pendulumSvg}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  role="img"
                  aria-label="Animación del péndulo"
                >
                  {renderPendulum(estado1, L, m, '#2E86AB')}
                </svg>
              </div>
            )}

            <div className={styles.formulaBox}>
              <p className={styles.formulaTex}>T = 2π · √(L / g)</p>
              <p className={styles.formulaCaption}>
                Período en la aproximación de pequeños ángulos
              </p>
            </div>

            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Resultados — Péndulo 1</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Período T</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(derivados1.T, 3)} s
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Frecuencia f</span>
                <span className={styles.resultValue}>{formatNumber(derivados1.f, 3)} Hz</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Frecuencia angular ω</span>
                <span className={styles.resultValue}>
                  {formatNumber(derivados1.omega0, 3)} rad/s
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Tiempo transcurrido</span>
                <span className={styles.resultValue}>{formatNumber(tiempo, 2)} s</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>θ actual</span>
                <span className={styles.resultValue}>
                  {formatNumber((estado1.theta * 180) / Math.PI, 1)}°
                </span>
              </div>
            </div>

            {showCorreccion && (
              <div className={styles.warningInline}>
                ⚠️ θ₀ = {formatNumber(theta0Deg, 0)}° está fuera de la aproximación de pequeños
                ángulos. El periodo real difiere por un factor 1 + θ²/16, es decir un{' '}
                <strong>+{formatNumber(correccionPct, 2)}%</strong>. Período corregido aproximado:{' '}
                <strong>{formatNumber(derivados1.Tcorregido, 3)} s</strong>.
              </div>
            )}

            {comparativaActiva && (
              <div className={styles.resultBlock} style={{ marginTop: '0.75rem' }}>
                <h3 className={styles.resultTitle}>Resultados — Péndulo 2</h3>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Período T₂</span>
                  <span className={styles.resultValueAccent}>
                    {formatNumber(derivados2.T, 3)} s
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Diferencia T₂ - T₁</span>
                  <span className={styles.resultValue}>
                    {formatNumber(derivados2.T - derivados1.T, 3)} s
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Razón T₂ / T₁</span>
                  <span className={styles.resultValue}>
                    {formatNumber(derivados2.T / derivados1.T, 3)}
                  </span>
                </div>
              </div>
            )}

            {/* Energía */}
            <div className={styles.energyBox}>
              <h3 className={styles.miniChartTitle}>Energía mecánica (péndulo 1)</h3>
              <div className={styles.energyRow}>
                <span className={styles.energyLabel}>Cinética</span>
                <div className={styles.energyBarTrack}>
                  <div
                    className={`${styles.energyBar} ${styles.energyKinetic}`}
                    style={{ width: `${energiaPctEc}%` }}
                  />
                </div>
                <span className={styles.energyValue}>{formatNumber(energias1.Ec, 3)} J</span>
              </div>
              <div className={styles.energyRow}>
                <span className={styles.energyLabel}>Potencial</span>
                <div className={styles.energyBarTrack}>
                  <div
                    className={`${styles.energyBar} ${styles.energyPotential}`}
                    style={{ width: `${energiaPctEp}%` }}
                  />
                </div>
                <span className={styles.energyValue}>{formatNumber(energias1.Ep, 3)} J</span>
              </div>
              <div className={styles.energyRow}>
                <span className={styles.energyLabel}>Total</span>
                <div className={styles.energyBarTrack}>
                  <div
                    className={`${styles.energyBar} ${styles.energyTotal}`}
                    style={{ width: `${energiaPctEt}%` }}
                  />
                </div>
                <span className={styles.energyValue}>{formatNumber(energias1.Et, 3)} J</span>
              </div>
            </div>

            {/* Mini chart θ(t) */}
            <h3 className={styles.miniChartTitle} style={{ marginTop: '1rem' }}>
              θ(t) — posición angular en el tiempo
            </h3>
            <svg
              className={styles.miniChart}
              viewBox={`0 0 ${chartW} ${chartH}`}
              role="img"
              aria-label="Gráfico de posición angular en el tiempo"
            >
              {renderChart(historial1, '#2E86AB')}
              {comparativaActiva && renderChart(historial2, '#48A9A6')}
            </svg>
          </div>
        </div>

        {/* Educational Section */}
        <EducationalSection
          title="Guía del Péndulo Simple"
          subtitle="Movimiento armónico simple y oscilaciones"
          icon="🪐"
        >
          <h3 className={styles.eduSubtitle}>Fórmulas del MAS y Péndulo Simple</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Magnitud</th>
                  <th>Fórmula</th>
                  <th>Significado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Período T</td>
                  <td>T = 2π · √(L / g)</td>
                  <td>Tiempo de una oscilación completa. No depende de la masa ni del ángulo (en pequeños ángulos).</td>
                </tr>
                <tr>
                  <td>Frecuencia f</td>
                  <td>f = 1 / T</td>
                  <td>Número de oscilaciones por segundo (Hz).</td>
                </tr>
                <tr>
                  <td>Frecuencia angular ω</td>
                  <td>ω = √(g / L) = 2π·f</td>
                  <td>Velocidad angular del MAS, en rad/s.</td>
                </tr>
                <tr>
                  <td>Posición angular</td>
                  <td>θ(t) = θ₀ · cos(ω·t)</td>
                  <td>Solución armónica para pequeños ángulos sin amortiguar.</td>
                </tr>
                <tr>
                  <td>Energía cinética</td>
                  <td>E_c = ½ · m · v² = ½ · m · L² · (dθ/dt)²</td>
                  <td>Máxima al pasar por la vertical (θ = 0).</td>
                </tr>
                <tr>
                  <td>Energía potencial</td>
                  <td>E_p = m · g · L · (1 − cos θ)</td>
                  <td>Máxima en los extremos del recorrido.</td>
                </tr>
                <tr>
                  <td>Ecuación de movimiento</td>
                  <td>d²θ/dt² + (g/L)·sin θ = 0</td>
                  <td>No lineal. Para |θ| pequeño, sin θ ≈ θ y se simplifica al MAS.</td>
                </tr>
                <tr>
                  <td>Corrección grandes ángulos</td>
                  <td>T_real ≈ T · (1 + θ₀²/16)</td>
                  <td>Aproximación de segundo orden cuando θ₀ &gt; 15°.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de física de secundaria</h4>
              <p>
                Visualiza por qué la masa no aparece en T, comprueba que duplicar L no duplica el
                período (factor √2) y experimenta con la gravedad lunar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Universitario de ingeniería</h4>
              <p>
                Compara la solución cerrada del MAS con la integración numérica del péndulo no
                lineal. Observa la deriva del período en grandes ángulos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Aficionado a la relojería</h4>
              <p>
                Calcula la longitud necesaria para un péndulo de segundos (T = 2 s en la Tierra ≈
                99,4 cm). Ajusta la amortiguación para entender el escape mecánico.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesor de secundaria</h4>
              <p>
                Lanza la simulación en clase, varía un solo parámetro a la vez y pide a los
                alumnos predecir el efecto sobre T y la energía.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué la masa NO afecta al período?</strong>
              <p>
                La aceleración angular d²θ/dt² = −(g/L)·sin θ no contiene la masa: la inercia
                rotacional (mL²) se cancela con el peso (mg) en el par.
              </p>
              <p className={styles.faqTip}>
                💡 Por eso un péndulo de 1 kg y otro de 100 g con la misma L oscilan al mismo ritmo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la aproximación de pequeños ángulos?</strong>
              <p>
                Para |θ| pequeño se cumple sin θ ≈ θ (en radianes). La ecuación se vuelve lineal
                y obtenemos un MAS puro con T = 2π√(L/g).
              </p>
              <p className={styles.faqTip}>
                💡 El error es &lt; 1% para θ₀ &lt; 15° y crece rápido a partir de 30°.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa con la amortiguación?</strong>
              <p>
                La fricción introduce un término −γ·dθ/dt que disipa energía. La amplitud cae
                exponencialmente: θ₀(t) = θ₀·e^(−γt/2). El período cambia muy poco salvo en
                amortiguación crítica.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo se mide g con un péndulo?</strong>
              <p>
                Despejando de T = 2π√(L/g) → g = 4π²·L/T². Midiendo L con regla y T con cronómetro
                (mejor 20 oscilaciones para reducir error humano), se obtiene g con 3 cifras.
              </p>
              <p className={styles.faqTip}>💡 Es uno de los experimentos clásicos de bachillerato.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre péndulo simple y físico?</strong>
              <p>
                El péndulo simple idealiza la masa concentrada en un punto y la cuerda sin masa.
                El péndulo físico (varilla, regla, cuerpo extendido) usa T = 2π√(I / m·g·d), donde
                I es el momento de inercia y d la distancia al pivote.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿En la Luna oscilaría más rápido o más lento?</strong>
              <p>
                Más lento. Como g_Luna ≈ 1,62 m/s² ≈ g_Tierra/6, el período se multiplica por √6
                ≈ 2,45. Un péndulo de 1 m que en la Tierra hace T = 2,01 s, en la Luna hace T ≈
                4,93 s.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo Resolver un Problema de Péndulo — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identificar el sistema</strong>
                <p>
                  ¿Es un péndulo simple (masa puntual + cuerda) o un péndulo físico? ¿Hay
                  rozamiento o se asume ideal? ¿Qué valor de g aplica?
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcular ω y T</strong>
                <p>
                  Aplica ω = √(g/L) y T = 2π/ω. Si θ₀ &gt; 15°, añade la corrección 1 + θ₀²/16
                  para mayor precisión.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Escribir la ecuación θ(t)</strong>
                <p>
                  En MAS sin amortiguar: θ(t) = θ₀·cos(ω·t + φ). El desfase φ depende de las
                  condiciones iniciales: si parte del reposo en θ₀, entonces φ = 0.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Aplicar las condiciones iniciales</strong>
                <p>
                  Suelen ser θ(0) = θ₀ y dθ/dt(0) = 0 (soltado desde el reposo). Sustituye para
                  determinar amplitud y fase.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Calcular energía y velocidad</strong>
                <p>
                  Energía total E = m·g·L·(1 − cos θ₀). En el punto más bajo toda es cinética: v
                  = √(2·g·L·(1 − cos θ₀)).
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Trabaja siempre en radianes</strong>
                <p>Las fórmulas del MAS exigen radianes. Convierte: rad = grados · π / 180.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱</span>
              <div>
                <strong>Mide varios períodos</strong>
                <p>Para reducir error: cronometra 10–20 oscilaciones y divide entre el número.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Evita ángulos grandes</strong>
                <p>Por encima de 15° el MAS deja de ser una buena aproximación.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌍</span>
              <div>
                <strong>g varía con la latitud</strong>
                <p>En el ecuador g ≈ 9,78 m/s²; en los polos ≈ 9,83 m/s². Usa el valor local.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <div>
                <strong>Verifica conservación de energía</strong>
                <p>Sin fricción, E_c + E_p debe ser constante. Es una buena prueba de tu modelo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <div>
                <strong>Cambia un parámetro a la vez</strong>
                <p>Para entender el efecto de L o g, mantén el resto fijo. Es la base del método científico.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores Frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>Confundir frecuencia f (Hz) con frecuencia angular ω (rad/s): ω = 2π·f.</li>
              <li>Usar grados en sin θ o en la fórmula de T sin convertir a radianes.</li>
              <li>
                Asumir que T = 2π√(L/g) vale para cualquier ángulo — solo es válido para θ₀ pequeño.
              </li>
              <li>
                Ignorar el rozamiento o la resistencia del aire al medir g experimentalmente.
              </li>
              <li>Confundir la masa m y la longitud L como si afectaran ambas a T (solo L lo hace).</li>
              <li>
                Modelar un péndulo físico (regla, varilla) como simple: el momento de inercia importa.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-pendulo')} />
        <ShareCard appName="simulador-pendulo" />
      </main>

      <Footer appName="simulador-pendulo" />
    </div>
  );
}
