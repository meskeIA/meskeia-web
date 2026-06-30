'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
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
import styles from './SimuladorMasResorte.module.css';

// ─── Constantes de renderizado ───────────────────────────────────────────────
const CANVAS_W = 260;
const CANVAS_H = 420;
const GRAFICA_W = 500;
const GRAFICA_H = 160;
const HISTORIAL_MAX = 300;

// ─── Helpers físicos ─────────────────────────────────────────────────────────

function calcOmega0(k: number, m: number): number {
  return Math.sqrt(k / Math.max(m, 0.001));
}

function calcPosicion(A: number, omega0: number, gamma: number, m: number, t: number): number {
  // x(t) = A · cos(ω₀·t) · e^(−γ·t / (2·m))
  return A * Math.cos(omega0 * t) * Math.exp((-gamma * t) / (2 * Math.max(m, 0.001)));
}

function calcVelocidad(A: number, omega0: number, gamma: number, m: number, t: number): number {
  // v(t) = dx/dt  (derivada analítica)
  const mSafe = Math.max(m, 0.001);
  const decay = Math.exp((-gamma * t) / (2 * mSafe));
  const cosWt = Math.cos(omega0 * t);
  const sinWt = Math.sin(omega0 * t);
  return A * decay * (-omega0 * sinWt - (gamma / (2 * mSafe)) * cosWt);
}

// ─── Dibujo del resorte ──────────────────────────────────────────────────────

function dibujarResorte(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dientes = 12,
  amplitudDiente = 12,
) {
  const totalLen = Math.abs(y2 - y1);
  const segLen = totalLen / (dientes * 2 + 2);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  // tramo inicial recto
  ctx.lineTo(x1, y1 + segLen);
  for (let i = 0; i < dientes; i++) {
    const yBase = y1 + segLen + i * 2 * segLen;
    ctx.lineTo(x1 + amplitudDiente, yBase + segLen * 0.5);
    ctx.lineTo(x1 - amplitudDiente, yBase + segLen * 1.5);
  }
  // tramo final recto
  ctx.lineTo(x1, y2 - segLen);
  ctx.lineTo(x1, y2);
  ctx.stroke();
}

// ─── Tipos de state ──────────────────────────────────────────────────────────

interface ValoresFisicos {
  omega0: number;
  T: number;
  f: number;
  x: number;
  v: number;
  a: number;
  Ek: number;
  Ep: number;
  Et: number;
  Emax: number;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SimuladorMasResortePage() {
  // Parámetros físicos controlables
  const [masa, setMasa] = useState(1.0);
  const [constK, setConstK] = useState(20);
  const [amplitud, setAmplitud] = useState(0.3);
  const [gamma, setGamma] = useState(0);

  // Estado de animación (en refs para no re-renderizar cada frame)
  const tiempoRef = useRef<number>(0);
  const prevTimestampRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const historicoRef = useRef<number[]>([]);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graficaRef = useRef<HTMLCanvasElement>(null);

  // Pausa / reproducción
  const [running, setRunning] = useState(true);
  const runningRef = useRef(true);

  // Valores visibles (actualizados desde el RAF para mostrar en UI)
  const [valores, setValores] = useState<ValoresFisicos>({
    omega0: calcOmega0(20, 1.0),
    T: (2 * Math.PI) / calcOmega0(20, 1.0),
    f: calcOmega0(20, 1.0) / (2 * Math.PI),
    x: 0.3,
    v: 0,
    a: -(20 / 1.0) * 0.3,
    Ek: 0,
    Ep: 0.5 * 20 * 0.3 * 0.3,
    Et: 0.5 * 20 * 0.3 * 0.3,
    Emax: 0.5 * 20 * 0.3 * 0.3,
  });

  // Sincronizar runningRef con el state
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // ── Función de animación ────────────────────────────────────────────────────
  const animar = useCallback(
    (timestamp: number) => {
      if (!runningRef.current) return;

      // Calcular dt real (cap a 50 ms para evitar saltos de pestaña)
      if (prevTimestampRef.current === null) {
        prevTimestampRef.current = timestamp;
      }
      const dt = Math.min((timestamp - prevTimestampRef.current) / 1000, 0.05);
      prevTimestampRef.current = timestamp;
      tiempoRef.current += dt;

      const t = tiempoRef.current;
      const omega0 = calcOmega0(constK, masa);
      const T = (2 * Math.PI) / omega0;
      const f = 1 / T;

      const x = calcPosicion(amplitud, omega0, gamma, masa, t);
      const v = calcVelocidad(amplitud, omega0, gamma, masa, t);
      const a = (-constK * x - gamma * v) / Math.max(masa, 0.001);

      const Ek = 0.5 * masa * v * v;
      const Ep = 0.5 * constK * x * x;
      const Et = Ek + Ep;
      const Emax = 0.5 * constK * amplitud * amplitud;

      // Actualizar historial
      historicoRef.current.push(x);
      if (historicoRef.current.length > HISTORIAL_MAX) {
        historicoRef.current = historicoRef.current.slice(-HISTORIAL_MAX);
      }

      // ── Dibujar animación (canvas izquierdo) ──────────────────────────────
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

          const cx = CANVAS_W / 2;
          // Techo / anclaje
          const techoY = 20;
          ctx.fillStyle = '#6b7280';
          ctx.fillRect(cx - 40, techoY - 10, 80, 10);
          ctx.fillStyle = '#374151';
          ctx.fillRect(cx - 2, techoY, 4, 15);

          // Posición de equilibrio (px desde el techo)
          const escala = 150; // px por metro (el rango de amplitud es ~0–1 m)
          const equilibrioY = techoY + 25 + 120; // longitud natural del resorte en reposo
          const bloqueY = equilibrioY + x * escala;

          // Línea de equilibrio
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = '#9ca3af';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx - 60, equilibrioY);
          ctx.lineTo(cx + 60, equilibrioY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Resorte (entre anclaje y tope superior del bloque)
          const bloqueH = 50;
          const resorteDesde = techoY + 25;
          const resorteHasta = bloqueY - bloqueH / 2;
          ctx.strokeStyle = '#6b7280';
          ctx.lineWidth = 2;
          dibujarResorte(ctx, cx, resorteDesde, cx, resorteHasta, 11, 11);

          // Bloque masa
          const bw = 50;
          ctx.fillStyle = '#2E86AB';
          ctx.strokeStyle = '#1a5278';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cx - bw / 2, bloqueY - bloqueH / 2, bw, bloqueH, 5);
          ctx.fill();
          ctx.stroke();

          // Etiqueta m dentro del bloque
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('m', cx, bloqueY);

          // Flecha x desde equilibrio al bloque
          if (Math.abs(x) > 0.01) {
            const flechaX = cx + bw / 2 + 14;
            ctx.strokeStyle = '#E07A1F';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(flechaX, equilibrioY);
            ctx.lineTo(flechaX, bloqueY);
            ctx.stroke();
            // punta de flecha
            const dir = x > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(flechaX, bloqueY);
            ctx.lineTo(flechaX - 5, bloqueY - dir * 8);
            ctx.lineTo(flechaX + 5, bloqueY - dir * 8);
            ctx.closePath();
            ctx.fillStyle = '#E07A1F';
            ctx.fill();
            // etiqueta x
            ctx.fillStyle = '#E07A1F';
            ctx.font = 'bold 12px system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`x=${formatNumber(x, 2)}m`, flechaX + 8, (equilibrioY + bloqueY) / 2);
          }
        }
      }

      // ── Dibujar gráfica x(t) ─────────────────────────────────────────────
      const graficaCanvas = graficaRef.current;
      if (graficaCanvas) {
        const ctx2 = graficaCanvas.getContext('2d');
        if (ctx2) {
          ctx2.clearRect(0, 0, GRAFICA_W, GRAFICA_H);

          // Fondo
          ctx2.fillStyle = '#f8fafc';
          ctx2.fillRect(0, 0, GRAFICA_W, GRAFICA_H);

          const historial = historicoRef.current;
          const margenV = 14;
          const midY = GRAFICA_H / 2;
          const maxAbs = Math.max(amplitud, 0.01);
          const escalaY = (GRAFICA_H / 2 - margenV) / maxAbs;

          // Eje x=0
          ctx2.strokeStyle = '#9ca3af';
          ctx2.lineWidth = 1;
          ctx2.setLineDash([4, 3]);
          ctx2.beginPath();
          ctx2.moveTo(0, midY);
          ctx2.lineTo(GRAFICA_W, midY);
          ctx2.stroke();
          ctx2.setLineDash([]);

          // Traza x(t)
          if (historial.length >= 2) {
            const stepX = GRAFICA_W / (HISTORIAL_MAX - 1);
            ctx2.strokeStyle = '#2E86AB';
            ctx2.lineWidth = 2;
            ctx2.beginPath();
            historial.forEach((val, idx) => {
              const px = idx * stepX;
              const py = midY - val * escalaY;
              if (idx === 0) ctx2.moveTo(px, py);
              else ctx2.lineTo(px, py);
            });
            ctx2.stroke();
          }

          // Etiquetas eje
          ctx2.fillStyle = '#9ca3af';
          ctx2.font = '11px system-ui, sans-serif';
          ctx2.textAlign = 'left';
          ctx2.textBaseline = 'top';
          ctx2.fillText(`+${formatNumber(amplitud, 2)}m`, 4, margenV - 2);
          ctx2.textBaseline = 'bottom';
          ctx2.fillText(`−${formatNumber(amplitud, 2)}m`, 4, GRAFICA_H - margenV + 2);
          ctx2.textAlign = 'right';
          ctx2.textBaseline = 'middle';
          ctx2.fillText('x(t)', GRAFICA_W - 4, midY);
        }
      }

      // Actualizar valores en UI (cada frame)
      setValores({ omega0, T, f, x, v, a, Ek, Ep, Et, Emax: Math.max(Emax, 0.0001) });

      rafRef.current = requestAnimationFrame(animar);
    },
    [masa, constK, amplitud, gamma],
  );

  // ── Iniciar / detener RAF ────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      prevTimestampRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(animar);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [running, animar]);

  // ── Reiniciar simulación ────────────────────────────────────────────────────
  const reiniciar = useCallback(() => {
    tiempoRef.current = 0;
    prevTimestampRef.current = null;
    historicoRef.current = [];
    // Si estaba en pausa, forzar un frame inicial
    if (!runningRef.current) {
      const omega0 = calcOmega0(constK, masa);
      const x0 = amplitud;
      const Emax = 0.5 * constK * amplitud * amplitud;
      setValores({
        omega0,
        T: (2 * Math.PI) / omega0,
        f: omega0 / (2 * Math.PI),
        x: x0,
        v: 0,
        a: (-constK * x0) / Math.max(masa, 0.001),
        Ek: 0,
        Ep: Emax,
        Et: Emax,
        Emax,
      });
    }
  }, [constK, masa, amplitud]);

  // Reiniciar cuando cambian los parámetros
  useEffect(() => {
    reiniciar();
  }, [masa, constK, amplitud, gamma, reiniciar]);

  // Porcentajes de energía para las barras
  const pctEk = Math.min(100, (valores.Ek / valores.Emax) * 100);
  const pctEp = Math.min(100, (valores.Ep / valores.Emax) * 100);
  const pctEt = Math.min(100, (valores.Et / valores.Emax) * 100);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🌀</span> Simulador Masa-Resorte</h1>
        <p className={styles.subtitle}>
          Movimiento Armónico Simple con amortiguamiento viscoso — observa x(t), energías y período en tiempo real
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ── Sliders de parámetros ─────────────────────────────────────── */}
        <div className={styles.slidersGrid}>
          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="slider-masa">
              Masa m
              <span className={styles.sliderValue}>{formatNumber(masa, 1)} kg</span>
            </label>
            <input
              id="slider-masa"
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={masa}
              className={styles.slider}
              onChange={(e) => setMasa(parseFloat(e.target.value))}
              aria-label={`Masa: ${formatNumber(masa, 1)} kg`}
            />
            <span className={styles.sliderHint}>0,1 – 5 kg</span>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="slider-k">
              Constante k
              <span className={styles.sliderValue}>{formatNumber(constK, 0)} N/m</span>
            </label>
            <input
              id="slider-k"
              type="range"
              min={1}
              max={100}
              step={1}
              value={constK}
              className={styles.slider}
              onChange={(e) => setConstK(parseFloat(e.target.value))}
              aria-label={`Constante del resorte: ${formatNumber(constK, 0)} N/m`}
            />
            <span className={styles.sliderHint}>1 – 100 N/m</span>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="slider-A">
              Amplitud A
              <span className={styles.sliderValue}>{formatNumber(amplitud, 2)} m</span>
            </label>
            <input
              id="slider-A"
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={amplitud}
              className={styles.slider}
              onChange={(e) => setAmplitud(parseFloat(e.target.value))}
              aria-label={`Amplitud: ${formatNumber(amplitud, 2)} m`}
            />
            <span className={styles.sliderHint}>0,05 – 1 m</span>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="slider-gamma">
              Amortiguamiento γ
              <span className={styles.sliderValue}>{formatNumber(gamma, 1)}</span>
            </label>
            <input
              id="slider-gamma"
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={gamma}
              className={styles.slider}
              onChange={(e) => setGamma(parseFloat(e.target.value))}
              aria-label={`Amortiguamiento: ${formatNumber(gamma, 1)}`}
            />
            <span className={styles.sliderHint}>0 = sin fricción · 2 = muy amortiguado</span>
          </div>
        </div>

        {/* ── Fórmulas rápidas ─────────────────────────────────────────── */}
        <div className={styles.formulaBox}>
          <code>ω₀ = √(k/m)</code> &nbsp;·&nbsp;
          <code>T = 2π/ω₀</code> &nbsp;·&nbsp;
          <code>x(t) = A·cos(ω₀t)·e^(−γt/2m)</code> &nbsp;·&nbsp;
          <code>E_total = ½·k·A²</code>
        </div>

        {/* ── Animación + gráfica ──────────────────────────────────────── */}
        <div className={styles.simLayout}>
          {/* Canvas animación del resorte */}
          <div className={styles.canvasWrapper}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className={styles.canvas}
              role="img"
              aria-label="Animación del sistema masa-resorte"
            />
          </div>

          {/* Gráfica x(t) */}
          <div className={styles.graficaWrapper}>
            <p className={styles.graficaTitle}>Gráfica x(t) — posición en el tiempo</p>
            <canvas
              ref={graficaRef}
              width={GRAFICA_W}
              height={GRAFICA_H}
              className={styles.graficaCanvas}
              role="img"
              aria-label="Gráfica de posición en función del tiempo"
            />
          </div>
        </div>

        {/* ── Barras de energía ────────────────────────────────────────── */}
        <div className={styles.energyBars} role="region" aria-label="Energías del sistema">
          <p className={styles.energyBarsTitle}>Energías del sistema</p>

          <div className={styles.energyBar}>
            <span className={styles.energyLabel}>Cinética E_k</span>
            <div className={styles.energyTrack}>
              <div
                className={`${styles.energyFill} ${styles.energyFillKin}`}
                style={{ width: `${pctEk}%` }}
              />
            </div>
            <span className={styles.energyNum}>{formatNumber(valores.Ek, 3)} J</span>
          </div>

          <div className={styles.energyBar}>
            <span className={styles.energyLabel}>Potencial E_p</span>
            <div className={styles.energyTrack}>
              <div
                className={`${styles.energyFill} ${styles.energyFillPot}`}
                style={{ width: `${pctEp}%` }}
              />
            </div>
            <span className={styles.energyNum}>{formatNumber(valores.Ep, 3)} J</span>
          </div>

          <div className={styles.energyBar}>
            <span className={styles.energyLabel}>Total E</span>
            <div className={styles.energyTrack}>
              <div
                className={`${styles.energyFill} ${styles.energyFillTot}`}
                style={{ width: `${pctEt}%` }}
              />
            </div>
            <span className={styles.energyNum}>{formatNumber(valores.Et, 3)} J</span>
          </div>
        </div>

        {/* ── Panel de valores numéricos ───────────────────────────────── */}
        <div className={styles.valuesGrid} role="region" aria-label="Valores físicos actuales">
          <div className={styles.valueCard}>
            <span className={styles.valueName}>ω₀</span>
            <span className={styles.valueNum}>{formatNumber(valores.omega0, 3)} rad/s</span>
          </div>
          <div className={styles.valueCard}>
            <span className={styles.valueName}>Período T</span>
            <span className={styles.valueNum}>{formatNumber(valores.T, 3)} s</span>
          </div>
          <div className={styles.valueCard}>
            <span className={styles.valueName}>Frecuencia f</span>
            <span className={styles.valueNum}>{formatNumber(valores.f, 3)} Hz</span>
          </div>
          <div className={styles.valueCard}>
            <span className={styles.valueName}>Posición x</span>
            <span className={styles.valueNum}>{formatNumber(valores.x, 3)} m</span>
          </div>
          <div className={styles.valueCard}>
            <span className={styles.valueName}>Velocidad v</span>
            <span className={styles.valueNum}>{formatNumber(valores.v, 3)} m/s</span>
          </div>
          <div className={styles.valueCard}>
            <span className={styles.valueName}>Aceleración a</span>
            <span className={styles.valueNum}>{formatNumber(valores.a, 3)} m/s²</span>
          </div>
        </div>

        {/* ── Botones de control ───────────────────────────────────────── */}
        <div className={styles.controlButtons}>
          <button
            type="button"
            className={styles.btnPause}
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? 'Pausar simulación' : 'Reanudar simulación'}
            aria-pressed={!running}
          >
            {running ? <><span aria-hidden="true">⏸</span> Pausar</> : <><span aria-hidden="true">▶</span> Reanudar</>}
          </button>
          <button
            type="button"
            className={styles.btnReset}
            onClick={reiniciar}
            aria-label="Reiniciar simulación"
          >
            <span aria-hidden="true">↺</span> Reiniciar
          </button>
        </div>

        {/* ── Sección educativa v2.0 ───────────────────────────────────── */}
        <EducationalSection
          title="Aprende sobre el MAS"
          subtitle="El resorte como modelo oscilatorio fundamental de la física"
          icon="🌀"
        >
          {/* Intro */}
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1rem' }}>
            El <strong>movimiento armónico simple (MAS)</strong> es el prototipo de toda oscilación en física.
            El sistema masa-resorte cumple exactamente la ley de Hooke (<em>F = −k·x</em>) y su ecuación de movimiento
            admite solución analítica exacta. Desde la mecánica cuántica (potencial cuadrático) hasta la ingeniería
            estructural, este modelo aparece como aproximación de primer orden de cualquier sistema cercano al equilibrio.
          </p>

          {/* Tabla comparativa — 6 sistemas oscilatorios */}
          <h3 className={styles.eduSubtitle}>Sistemas oscilatorios: comparativa</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Sistema</th>
                  <th>ω₀ característico</th>
                  <th>Variable oscilante</th>
                  <th>Analogía con k/m</th>
                  <th>Aplicación real</th>
                  <th>Amortiguado natural</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Masa-resorte</td>
                  <td>√(k/m)</td>
                  <td>Posición x</td>
                  <td>—</td>
                  <td>Suspensión de vehículos</td>
                  <td>Fricción, amortiguadores</td>
                </tr>
                <tr>
                  <td>Péndulo simple</td>
                  <td>√(g/L)</td>
                  <td>Ángulo θ</td>
                  <td>g/L ↔ k/m</td>
                  <td>Relojes de péndulo</td>
                  <td>Resistencia del aire</td>
                </tr>
                <tr>
                  <td>Circuito LC</td>
                  <td>1/√(LC)</td>
                  <td>Carga q</td>
                  <td>1/LC ↔ k/m</td>
                  <td>Sintonizadores de radio</td>
                  <td>Resistencia R</td>
                </tr>
                <tr>
                  <td>Onda sonora</td>
                  <td>k_s/m_mol (cristal)</td>
                  <td>Desplazamiento de moléculas</td>
                  <td>Rigidez/masa efectiva</td>
                  <td>Instrumentos musicales</td>
                  <td>Viscosidad del medio</td>
                </tr>
                <tr>
                  <td>Molécula diatómica</td>
                  <td>√(k_bond/μ)</td>
                  <td>Distancia de enlace</td>
                  <td>k_bond/μ (masa reducida)</td>
                  <td>Espectroscopía IR</td>
                  <td>Emisión de fotones</td>
                </tr>
                <tr>
                  <td>Cristal (red Bravais)</td>
                  <td>√(K/m_atom)</td>
                  <td>Desplazamiento del átomo</td>
                  <td>Constante de red K/m</td>
                  <td>Conductividad térmica</td>
                  <td>Anharmonicidad</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Escenarios reales */}
          <h3 className={styles.eduSubtitle}>Escenarios reales del MAS</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚗</span>
              <h4>Suspensión de un automóvil</h4>
              <p>
                Cada rueda actúa como un sistema masa-resorte con amortiguador. El ingeniero ajusta k
                y γ para que el período de rebote sea cómodo (~1 s) y el sistema esté subamortiguado
                (vuelve al equilibrio sin oscilar en exceso).
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📡</span>
              <h4>Sismógrafo</h4>
              <p>
                La masa inercial queda estática mientras el armazón se mueve con el suelo. El
                resorte convierte ese desplazamiento relativo en una señal medible. La frecuencia
                propia ω₀ determina qué frecuencias sísmicas registra mejor.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏢</span>
              <h4>Amortiguador de masa sintonizada (TMD)</h4>
              <p>
                Los rascacielos modernos incorporan una masa gigante (hasta 800 t) suspendida con
                resortes. Su k y m se ajustan para que ω₀ coincida con la frecuencia de resonancia
                del edificio, cancelando las oscilaciones por viento o seísmos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">⌚</span>
              <h4>Cristal de cuarzo en relojes</h4>
              <p>
                El cuarzo piezoeléctrico vibra como un MAS de cuarzo sólido con ω₀ = 2π × 32 768 Hz.
                Su constante k es altísima y su amortiguamiento mínimo, lo que le da una frecuencia
                estabilísima: error de 1 s por mes.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué T no depende de la amplitud A (sin amortiguamiento)?</strong>
              <p>
                La ecuación de movimiento <em>ẍ = −(k/m)·x</em> es lineal: si doblas x, la fuerza
                también se dobla. El resultado es que la relación ω₀ = √(k/m) no contiene A.
                Geométricamente, la partícula recorre el doble de distancia pero con el doble de
                fuerza media → mismo período.
              </p>
              <p className={styles.faqTip}>
                💡 Esta propiedad (isocronismo) es lo que hace al MAS útil en relojería. El péndulo la cumple solo para ángulos pequeños.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el amortiguamiento crítico?</strong>
              <p>
                Con γ_c = 2·√(k·m), el sistema regresa al equilibrio en el menor tiempo posible
                sin oscilar. Si γ {"<"} γ_c: subamortiguado (oscila con amplitud decreciente).
                Si γ {">"} γ_c: sobreamortiguado (vuelve lentamente sin oscilar).
              </p>
              <p className={styles.faqTip}>
                💡 Las puertas con muelle hidráulico están diseñadas cerca del crítico para cerrar suave pero rápido.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre masa-resorte y péndulo?</strong>
              <p>
                Ambos son MAS aproximado. El resorte es exacto (para cualquier amplitud, siempre que
                k sea constante). El péndulo solo es MAS para ángulos pequeños (sin θ ≈ θ). La
                diferencia técnica: ω₀(resorte) = √(k/m), ω₀(péndulo) = √(g/L).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo medir k experimentalmente?</strong>
              <p>
                <strong>Método estático:</strong> colgar masa conocida m y medir el alargamiento Δx.
                Por la ley de Hooke: k = m·g / Δx.
                <strong> Método dinámico:</strong> medir el período T con cronómetro (mejor 10
                oscilaciones), entonces k = (2π/T)² · m.
              </p>
              <p className={styles.faqTip}>
                💡 El método dinámico es más preciso porque promedia muchos ciclos y elimina el error humano de reacción.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa cuando γ {">"} 2·√(k·m)?</strong>
              <p>
                El sistema entra en régimen sobreamortiguado. Las dos raíces de la ecuación
                característica son reales y negativas: la solución es suma de dos exponenciales
                decrecientes, sin oscilación alguna. La masa vuelve al equilibrio monótonamente,
                aunque más despacio que en el caso crítico.
              </p>
            </div>
          </div>

          {/* Pasos de resolución */}
          <h3 className={styles.eduSubtitle}>Cómo resolver un problema de MAS — paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identificar el sistema y sus parámetros</strong>
                <p>
                  ¿Cuál es la masa m y la constante k del resorte? ¿Hay amortiguamiento γ? ¿Cuáles
                  son las condiciones iniciales x(0) y v(0)?
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcular ω₀, T y f</strong>
                <p>
                  Aplica ω₀ = √(k/m), T = 2π/ω₀ y f = 1/T. Estas magnitudes no dependen de la
                  amplitud (isocronismo del MAS).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Determinar la amplitud y la fase</strong>
                <p>
                  Si x(0) = A y v(0) = 0: x(t) = A·cos(ω₀·t). En general:
                  A = √(x₀² + (v₀/ω₀)²) y tan φ = −v₀/(ω₀·x₀).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Escribir la solución completa</strong>
                <p>
                  Sin amortiguamiento: x(t) = A·cos(ω₀·t + φ).
                  Con amortiguamiento: x(t) = A·e^(−γt/2m)·cos(ω_d·t + φ)
                  donde ω_d = √(ω₀² − (γ/2m)²).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Calcular energía y verificar conservación</strong>
                <p>
                  E_total = ½·k·A² = ½·m·v² + ½·k·x² en cada instante (sin fricción). Si hay
                  amortiguamiento, E_total decrece con e^(−γt/m).
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <h3 className={styles.eduSubtitle}>Consejos para el examen</h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1rem' }}>
            Útiles para preparar física en Bachillerato y selectividad (EBAU/EVAU) en España, o en
            preparatoria, secundaria, educación media y el examen de admisión universitaria en Latinoamérica.
          </p>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <div>
                <strong>Identifica el MAS por su fuerza</strong>
                <p>Si la fuerza neta es proporcional al desplazamiento y apunta al equilibrio (F = −k·x), es MAS.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Unidades de k</strong>
                <p>k se mide en N/m = kg/s². Verifica dimensiones: [ω₀] = √(kg/s² / kg) = 1/s = rad/s.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📈</span>
              <div>
                <strong>T desde el gráfico x(t)</strong>
                <p>Mide la distancia entre dos máximos consecutivos (o entre dos cruces de cero en el mismo sentido).</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <div>
                <strong>Velocidad máxima en el equilibrio</strong>
                <p>v_max = ω₀·A ocurre en x = 0 (toda la energía es cinética). En los extremos v = 0 y E es toda potencial.</p>
              </div>
            </div>
          </div>

          {/* Warning box — errores frecuentes */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes en el MAS
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir ω₀ con f:</strong> ω₀ es en rad/s y f en Hz.
                La relación es ω₀ = 2π·f, no ω₀ = f.
              </li>
              <li>
                <strong>Olvidar que T no depende de A:</strong> doblar la amplitud no cambia el período —
                cambia la energía (E ∝ A²) pero no T.
              </li>
              <li>
                <strong>Usar γ en vez de ω_amortiguado:</strong> con amortiguamiento, la frecuencia de
                oscilación es ω_d = √(ω₀² − (γ/2m)²), no ω₀.
              </li>
              <li>
                <strong>Confundir E_k y E_p en los extremos:</strong> en x = ±A (extremos), toda la energía
                es potencial (E_k = 0). En x = 0 (equilibrio), toda es cinética (E_p = 0).
              </li>
              <li>
                <strong>Usar la fórmula de ω₀ del péndulo en un resorte:</strong>
                ω₀(péndulo) = √(g/L) ≠ √(k/m). Son sistemas distintos, aunque ambos son MAS.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-mas-resorte')} />
        <ShareCard appName="simulador-mas-resorte" />
      </main>

      <Footer appName="simulador-mas-resorte" />
    </div>
  );
}
