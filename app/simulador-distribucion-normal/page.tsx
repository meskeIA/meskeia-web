'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorDistribucionNormal.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type SimulatorMode = 'probabilidad' | 'regla68' | 'problema';
type ProbabilityType = 'menor' | 'mayor' | 'entre';

interface ProblemaTipo {
  id: string;
  nombre: string;
  contexto: string;
  variable: string;
  unidad: string;
  mu: number;
  sigma: number;
  pregunta: string;
  tipoProb: ProbabilityType;
  a: number;
  b?: number;
}

// ============================================
// PROBLEMAS TIPO PREDEFINIDOS
// ============================================
const PROBLEMAS_TIPO: ProblemaTipo[] = [
  {
    id: 'alturas',
    nombre: 'Alturas de adultos',
    contexto: 'En España, la altura de los hombres adultos sigue una N(176, 7) cm.',
    variable: 'Altura',
    unidad: 'cm',
    mu: 176,
    sigma: 7,
    pregunta: '¿Qué % de hombres miden más de 185 cm?',
    tipoProb: 'mayor',
    a: 185,
  },
  {
    id: 'notas',
    nombre: 'Calificaciones de un examen',
    contexto: 'Las notas de un examen siguen una N(6.5, 1.5).',
    variable: 'Nota',
    unidad: 'puntos',
    mu: 6.5,
    sigma: 1.5,
    pregunta: '¿Qué % de alumnos obtuvo entre 5 y 8?',
    tipoProb: 'entre',
    a: 5,
    b: 8,
  },
  {
    id: 'tornillos',
    nombre: 'Control de calidad',
    contexto: 'El diámetro de unos tornillos sigue una N(10, 0.2) mm. Se rechazan los menores de 9.7 mm.',
    variable: 'Diámetro',
    unidad: 'mm',
    mu: 10,
    sigma: 0.2,
    pregunta: '¿Qué % de tornillos se rechazan?',
    tipoProb: 'menor',
    a: 9.7,
  },
  {
    id: 'ci',
    nombre: 'Coeficiente intelectual',
    contexto: 'El CI poblacional sigue una N(100, 15).',
    variable: 'CI',
    unidad: 'puntos',
    mu: 100,
    sigma: 15,
    pregunta: '¿Qué % tiene CI superior a 130 (superdotación)?',
    tipoProb: 'mayor',
    a: 130,
  },
  {
    id: 'embarazo',
    nombre: 'Duración del embarazo',
    contexto: 'La duración del embarazo en humanos sigue una N(280, 12) días.',
    variable: 'Duración',
    unidad: 'días',
    mu: 280,
    sigma: 12,
    pregunta: '¿Qué % de embarazos duran entre 270 y 290 días?',
    tipoProb: 'entre',
    a: 270,
    b: 290,
  },
  {
    id: 'bombilla',
    nombre: 'Vida de bombillas LED',
    contexto: 'La vida útil de un modelo de bombilla LED sigue una N(15000, 2000) horas.',
    variable: 'Vida útil',
    unidad: 'horas',
    mu: 15000,
    sigma: 2000,
    pregunta: '¿Qué % dura más de 18000 horas?',
    tipoProb: 'mayor',
    a: 18000,
  },
];

// ============================================
// FUNCIONES MATEMÁTICAS
// ============================================

/**
 * Función de densidad de probabilidad (PDF) de una N(μ, σ)
 */
function pdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

/**
 * Función error (erf) — aproximación de Abramowitz & Stegun (precisión 1.5e-7)
 */
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

/**
 * Función de distribución acumulada (CDF) de una N(μ, σ)
 * P(X ≤ x)
 */
function cdf(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
}

/**
 * Formatea un número con coma decimal española
 */
function fmt(n: number, decimales = 2): string {
  return n.toFixed(decimales).replace('.', ',');
}

/**
 * Formatea probabilidad como porcentaje
 */
function fmtProb(p: number): string {
  return (p * 100).toFixed(2).replace('.', ',') + ' %';
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorDistribucionNormalPage() {
  const [mode, setMode] = useState<SimulatorMode>('probabilidad');
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [tipoProb, setTipoProb] = useState<ProbabilityType>('entre');
  const [a, setA] = useState(-1);
  const [b, setB] = useState(1);
  const [compararEstandar, setCompararEstandar] = useState(false);
  const [problemaActivo, setProblemaActivo] = useState<string>('alturas');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================
  // RANGO DE VISUALIZACIÓN
  // ============================================
  const rango = useMemo(() => {
    const halfWidth = sigma * 4.5;
    return { xMin: mu - halfWidth, xMax: mu + halfWidth };
  }, [mu, sigma]);

  // ============================================
  // PROBABILIDAD CALCULADA
  // ============================================
  const probabilidad = useMemo(() => {
    if (tipoProb === 'menor') return cdf(a, mu, sigma);
    if (tipoProb === 'mayor') return 1 - cdf(a, mu, sigma);
    if (tipoProb === 'entre') {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      return cdf(hi, mu, sigma) - cdf(lo, mu, sigma);
    }
    return 0;
  }, [tipoProb, a, b, mu, sigma]);

  // ============================================
  // PUNTUACIONES Z
  // ============================================
  const zA = useMemo(() => (a - mu) / sigma, [a, mu, sigma]);
  const zB = useMemo(() => (b - mu) / sigma, [b, mu, sigma]);

  // ============================================
  // CARGAR PROBLEMA TIPO
  // ============================================
  const cargarProblema = useCallback((problema: ProblemaTipo) => {
    setMu(problema.mu);
    setSigma(problema.sigma);
    setTipoProb(problema.tipoProb);
    setA(problema.a);
    if (problema.b !== undefined) setB(problema.b);
    setProblemaActivo(problema.id);
    setCompararEstandar(false);
  }, []);

  // ============================================
  // DIBUJO DEL CANVAS
  // ============================================
  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolución para Retina/HiDPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 20 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Detectar dark mode
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorCurve = '#2E86AB';
    const colorShade = 'rgba(46, 134, 171, 0.35)';
    const colorMu = '#48A9A6';
    const colorSigma = isDark ? '#7FB3D3' : '#5a9bc4';
    const colorEstandar = isDark ? '#FFB347' : '#E07A1F';

    ctx.clearRect(0, 0, W, H);

    // Calcular yMax: la curva más alta a dibujar
    const pdfMaxLocal = pdf(mu, mu, sigma);
    let yMaxLocal = pdfMaxLocal;
    if (compararEstandar) {
      yMaxLocal = Math.max(yMaxLocal, pdf(0, 0, 1));
    }
    const yMax = yMaxLocal * 1.1;

    // Función para mapear coordenadas
    const xToPx = (x: number) => pad.left + ((x - rango.xMin) / (rango.xMax - rango.xMin)) * plotW;
    const yToPx = (y: number) => pad.top + plotH - (y / yMax) * plotH;

    // === EJE X ===
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Marcas en μ y μ ± kσ
    ctx.fillStyle = colorText;
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    for (let k = -3; k <= 3; k++) {
      const xVal = mu + k * sigma;
      if (xVal < rango.xMin || xVal > rango.xMax) continue;
      const px = xToPx(xVal);
      ctx.beginPath();
      ctx.moveTo(px, pad.top + plotH);
      ctx.lineTo(px, pad.top + plotH + 4);
      ctx.stroke();
      const label = k === 0 ? 'μ' : (k > 0 ? `μ+${k}σ` : `μ${k}σ`);
      ctx.fillText(label, px, pad.top + plotH + 18);
      ctx.fillText(fmt(xVal, sigma < 1 ? 2 : 1), px, pad.top + plotH + 32);
    }

    // === ÁREA SOMBREADA (probabilidad) ===
    if (mode !== 'regla68') {
      ctx.fillStyle = colorShade;
      ctx.beginPath();
      let x0: number, x1: number;

      if (tipoProb === 'menor') {
        x0 = rango.xMin;
        x1 = a;
      } else if (tipoProb === 'mayor') {
        x0 = a;
        x1 = rango.xMax;
      } else {
        x0 = Math.min(a, b);
        x1 = Math.max(a, b);
      }

      x0 = Math.max(x0, rango.xMin);
      x1 = Math.min(x1, rango.xMax);

      ctx.moveTo(xToPx(x0), pad.top + plotH);
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const xv = x0 + (x1 - x0) * (i / N);
        ctx.lineTo(xToPx(xv), yToPx(pdf(xv, mu, sigma)));
      }
      ctx.lineTo(xToPx(x1), pad.top + plotH);
      ctx.closePath();
      ctx.fill();
    } else {
      // Modo regla 68-95-99.7: 3 zonas concéntricas
      const zonas = [
        { k: 3, color: 'rgba(46, 134, 171, 0.15)' },
        { k: 2, color: 'rgba(46, 134, 171, 0.30)' },
        { k: 1, color: 'rgba(46, 134, 171, 0.50)' },
      ];
      for (const z of zonas) {
        ctx.fillStyle = z.color;
        ctx.beginPath();
        const x0 = mu - z.k * sigma;
        const x1 = mu + z.k * sigma;
        ctx.moveTo(xToPx(x0), pad.top + plotH);
        const N = 200;
        for (let i = 0; i <= N; i++) {
          const xv = x0 + (x1 - x0) * (i / N);
          ctx.lineTo(xToPx(xv), yToPx(pdf(xv, mu, sigma)));
        }
        ctx.lineTo(xToPx(x1), pad.top + plotH);
        ctx.closePath();
        ctx.fill();
      }
    }

    // === CURVA DE GAUSS ===
    ctx.strokeStyle = colorCurve;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const Ncurve = 400;
    for (let i = 0; i <= Ncurve; i++) {
      const xv = rango.xMin + (rango.xMax - rango.xMin) * (i / Ncurve);
      const px = xToPx(xv);
      const py = yToPx(pdf(xv, mu, sigma));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // === CURVA ESTÁNDAR (si toggle activo) ===
    if (compararEstandar && mode !== 'regla68') {
      ctx.strokeStyle = colorEstandar;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i <= Ncurve; i++) {
        const xv = rango.xMin + (rango.xMax - rango.xMin) * (i / Ncurve);
        const px = xToPx(xv);
        const py = yToPx(pdf(xv, 0, 1));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colorEstandar;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('N(0,1) referencia', pad.left + 8, pad.top + 14);
    }

    // === LÍNEA VERTICAL EN μ ===
    ctx.strokeStyle = colorMu;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(xToPx(mu), pad.top);
    ctx.lineTo(xToPx(mu), pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // === LÍNEAS EN ±σ ===
    if (mode === 'regla68') {
      ctx.strokeStyle = colorSigma;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (let k = 1; k <= 3; k++) {
        for (const sign of [-1, 1]) {
          const xv = mu + sign * k * sigma;
          if (xv < rango.xMin || xv > rango.xMax) continue;
          ctx.beginPath();
          ctx.moveTo(xToPx(xv), pad.top);
          ctx.lineTo(xToPx(xv), pad.top + plotH);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    // === LÍNEAS EN a (y b si aplica) ===
    if (mode !== 'regla68') {
      ctx.strokeStyle = '#E07A1F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xToPx(a), pad.top);
      ctx.lineTo(xToPx(a), pad.top + plotH);
      ctx.stroke();

      ctx.fillStyle = '#E07A1F';
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('a', xToPx(a), pad.top - 4);

      if (tipoProb === 'entre') {
        ctx.beginPath();
        ctx.moveTo(xToPx(b), pad.top);
        ctx.lineTo(xToPx(b), pad.top + plotH);
        ctx.stroke();
        ctx.fillText('b', xToPx(b), pad.top - 4);
      }
    }
  }, [mu, sigma, a, b, tipoProb, mode, compararEstandar, rango]);

  useEffect(() => {
    dibujar();
  }, [dibujar]);

  useEffect(() => {
    const handleResize = () => dibujar();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujar]);

  // Re-dibujar cuando cambia el tema
  useEffect(() => {
    const observer = new MutationObserver(dibujar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [dibujar]);

  // ============================================
  // VARIABLES DERIVADAS PARA MOSTRAR
  // ============================================
  const problemaActual = PROBLEMAS_TIPO.find(p => p.id === problemaActivo);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📊</span> Simulador de Distribución Normal</h1>
        <p className={styles.subtitle}>
          Mueve la media (μ) y la desviación típica (σ) para ver la curva de Gauss en tiempo real.
          Calcula probabilidades, puntuaciones Z y la regla 68-95-99.7.
        </p>
      </header>

      <LegalNotice />

      {/* === SELECTOR DE MODO === */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeBtn} ${mode === 'probabilidad' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('probabilidad')}
          aria-pressed={mode === 'probabilidad'}
        >
          <span className={styles.modeIcon} aria-hidden="true">📐</span>
          <span className={styles.modeName}>Probabilidad</span>
          <span className={styles.modeDesc}>Calcula P(X&lt;a), P(X&gt;a) o P(a&lt;X&lt;b)</span>
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'regla68' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('regla68')}
          aria-pressed={mode === 'regla68'}
        >
          <span className={styles.modeIcon} aria-hidden="true">📏</span>
          <span className={styles.modeName}>Regla 68-95-99.7</span>
          <span className={styles.modeDesc}>Visualiza las zonas ±σ, ±2σ, ±3σ</span>
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'problema' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('problema')}
          aria-pressed={mode === 'problema'}
        >
          <span className={styles.modeIcon} aria-hidden="true">📝</span>
          <span className={styles.modeName}>Problemas tipo</span>
          <span className={styles.modeDesc}>Ejercicios reales resueltos</span>
        </button>
      </div>

      {/* === CONTENIDO PRINCIPAL === */}
      <div className={styles.mainContent}>
        {mode === 'problema' && problemaActual && (
          <div className={styles.problemaPanel}>
            <div className={styles.problemaSelector}>
              {PROBLEMAS_TIPO.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.problemaBtn} ${problemaActivo === p.id ? styles.problemaBtnActive : ''}`}
                  onClick={() => cargarProblema(p)}
                  aria-pressed={problemaActivo === p.id}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
            <div className={styles.problemaCard}>
              <p className={styles.problemaContexto}>{problemaActual.contexto}</p>
              <p className={styles.problemaPregunta}><strong>Pregunta:</strong> {problemaActual.pregunta}</p>
            </div>
          </div>
        )}

        {/* SLIDERS μ y σ */}
        <div className={styles.controlsGrid}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Media (μ): <strong>{fmt(mu, mode === 'problema' ? (sigma < 1 ? 2 : 1) : 2)}</strong>
            </label>
            <input
              type="range"
              min={mode === 'problema' && problemaActual ? problemaActual.mu - problemaActual.sigma * 5 : -5}
              max={mode === 'problema' && problemaActual ? problemaActual.mu + problemaActual.sigma * 5 : 5}
              step={sigma < 1 ? 0.05 : sigma < 5 ? 0.1 : 1}
              value={mu}
              onChange={e => setMu(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Media μ"
            />
          </div>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Desviación típica (σ): <strong>{fmt(sigma, sigma < 1 ? 3 : 2)}</strong>
            </label>
            <input
              type="range"
              min={mode === 'problema' && problemaActual ? problemaActual.sigma * 0.2 : 0.1}
              max={mode === 'problema' && problemaActual ? problemaActual.sigma * 3 : 3}
              step={sigma < 1 ? 0.01 : 0.05}
              value={sigma}
              onChange={e => setSigma(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Desviación típica σ"
            />
          </div>
        </div>

        {/* CONTROLES DE PROBABILIDAD */}
        {mode !== 'regla68' && (
          <div className={styles.probControls}>
            <div className={styles.tipoProbButtons}>
              <button
                type="button"
                className={`${styles.tipoBtn} ${tipoProb === 'menor' ? styles.tipoBtnActive : ''}`}
                onClick={() => setTipoProb('menor')}
                aria-pressed={tipoProb === 'menor'}
              >
                P(X &lt; a)
              </button>
              <button
                type="button"
                className={`${styles.tipoBtn} ${tipoProb === 'mayor' ? styles.tipoBtnActive : ''}`}
                onClick={() => setTipoProb('mayor')}
                aria-pressed={tipoProb === 'mayor'}
              >
                P(X &gt; a)
              </button>
              <button
                type="button"
                className={`${styles.tipoBtn} ${tipoProb === 'entre' ? styles.tipoBtnActive : ''}`}
                onClick={() => setTipoProb('entre')}
                aria-pressed={tipoProb === 'entre'}
              >
                P(a &lt; X &lt; b)
              </button>
            </div>
            <div className={styles.abControls}>
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  a: <strong>{fmt(a, sigma < 1 ? 3 : 2)}</strong>
                </label>
                <input
                  type="range"
                  min={rango.xMin}
                  max={rango.xMax}
                  step={(rango.xMax - rango.xMin) / 200}
                  value={a}
                  onChange={e => setA(parseFloat(e.target.value))}
                  className={styles.slider}
                  aria-label="Valor a"
                />
              </div>
              {tipoProb === 'entre' && (
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    b: <strong>{fmt(b, sigma < 1 ? 3 : 2)}</strong>
                  </label>
                  <input
                    type="range"
                    min={rango.xMin}
                    max={rango.xMax}
                    step={(rango.xMax - rango.xMin) / 200}
                    value={b}
                    onChange={e => setB(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Valor b"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOGGLE COMPARAR ESTÁNDAR */}
        {mode !== 'regla68' && (
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={compararEstandar}
              onChange={e => setCompararEstandar(e.target.checked)}
            />
            <span>Comparar con N(0,1) — distribución normal estándar</span>
          </label>
        )}

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Gráfica de la distribución normal" />
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
          {mode === 'regla68' ? (
            <>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>P(μ−σ &lt; X &lt; μ+σ)</span>
                <span className={styles.resultValue}>≈ 68,27 %</span>
                <span className={styles.resultRange}>[{fmt(mu - sigma, sigma < 1 ? 3 : 2)}, {fmt(mu + sigma, sigma < 1 ? 3 : 2)}]</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>P(μ−2σ &lt; X &lt; μ+2σ)</span>
                <span className={styles.resultValue}>≈ 95,45 %</span>
                <span className={styles.resultRange}>[{fmt(mu - 2 * sigma, sigma < 1 ? 3 : 2)}, {fmt(mu + 2 * sigma, sigma < 1 ? 3 : 2)}]</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>P(μ−3σ &lt; X &lt; μ+3σ)</span>
                <span className={styles.resultValue}>≈ 99,73 %</span>
                <span className={styles.resultRange}>[{fmt(mu - 3 * sigma, sigma < 1 ? 3 : 2)}, {fmt(mu + 3 * sigma, sigma < 1 ? 3 : 2)}]</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.resultCardMain}>
                <span className={styles.resultLabel}>
                  {tipoProb === 'menor' && `P(X < ${fmt(a, sigma < 1 ? 3 : 2)})`}
                  {tipoProb === 'mayor' && `P(X > ${fmt(a, sigma < 1 ? 3 : 2)})`}
                  {tipoProb === 'entre' && `P(${fmt(Math.min(a, b), sigma < 1 ? 3 : 2)} < X < ${fmt(Math.max(a, b), sigma < 1 ? 3 : 2)})`}
                </span>
                <span className={styles.resultValueLarge}>{fmtProb(probabilidad)}</span>
                <span className={styles.resultDecimal}>= {fmt(probabilidad, 4)}</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Z(a) — tipificación</span>
                <span className={styles.resultValue}>{fmt(zA, 3)}</span>
                <span className={styles.resultRange}>= ({fmt(a, sigma < 1 ? 3 : 2)} − {fmt(mu, sigma < 1 ? 2 : 1)}) / {fmt(sigma, sigma < 1 ? 3 : 2)}</span>
              </div>
              {tipoProb === 'entre' && (
                <div className={styles.resultCard}>
                  <span className={styles.resultLabel}>Z(b) — tipificación</span>
                  <span className={styles.resultValue}>{fmt(zB, 3)}</span>
                  <span className={styles.resultRange}>= ({fmt(b, sigma < 1 ? 3 : 2)} − {fmt(mu, sigma < 1 ? 2 : 1)}) / {fmt(sigma, sigma < 1 ? 3 : 2)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="Aprende sobre la Distribución Normal"
        subtitle="De qué hablamos cuando hablamos de la curva de Gauss"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es la distribución normal?</h3>
          <p>
            La <strong>distribución normal</strong>, también llamada <em>campana de Gauss</em>, es el modelo de
            probabilidad continuo más importante de toda la estadística. Describe innumerables fenómenos
            naturales, sociales y técnicos cuyos valores se concentran simétricamente en torno a una media.
          </p>
          <p>
            Una variable aleatoria X sigue una distribución normal de media <strong>μ</strong> y desviación
            típica <strong>σ</strong>, escrito <code>X ~ N(μ, σ)</code>, cuando su función de densidad es:
          </p>
          <div className={styles.formulaBox}>
            f(x) = (1 / σ√(2π)) · e<sup>−½((x−μ)/σ)²</sup>
          </div>
          <p>
            μ controla <strong>dónde está el centro</strong> de la campana; σ controla <strong>cómo de
            ancha</strong> es. El área total bajo la curva es siempre 1 (probabilidad total).
          </p>
        </section>

        {/* TABLA COMPARATIVA */}
        <section>
          <h3>Comparativa de distribuciones normales habituales</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Caso</th>
                  <th>μ</th>
                  <th>σ</th>
                  <th>Rango ±2σ (95%)</th>
                  <th>Para qué se usa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Normal estándar</strong></td>
                  <td>0</td>
                  <td>1</td>
                  <td>[−2, 2]</td>
                  <td>Tablas Z, valor crítico</td>
                </tr>
                <tr>
                  <td>Altura hombre adulto (ES)</td>
                  <td>176 cm</td>
                  <td>7 cm</td>
                  <td>[162, 190]</td>
                  <td>Antropometría, talla ropa</td>
                </tr>
                <tr>
                  <td>Coeficiente intelectual</td>
                  <td>100</td>
                  <td>15</td>
                  <td>[70, 130]</td>
                  <td>Diagnóstico cognitivo</td>
                </tr>
                <tr>
                  <td>Notas examen estandarizado</td>
                  <td>500</td>
                  <td>100</td>
                  <td>[300, 700]</td>
                  <td>Examen de admisión universitaria, SAT</td>
                </tr>
                <tr>
                  <td>Error de medida (laboratorio)</td>
                  <td>0</td>
                  <td>0,01</td>
                  <td>[−0.02, 0.02]</td>
                  <td>Calibración, control calidad</td>
                </tr>
                <tr>
                  <td>Duración embarazo</td>
                  <td>280 días</td>
                  <td>12 días</td>
                  <td>[256, 304]</td>
                  <td>Obstetricia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios típicos donde aparece la normal</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📏</span>
              <strong>Mediciones biológicas</strong>
              <p>Altura, peso, longitud de extremidades, presión arterial. La acumulación de muchos pequeños factores genéticos y ambientales produce de forma natural una distribución acampanada.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎯</span>
              <strong>Errores de medida</strong>
              <p>En cualquier instrumento real, los errores aleatorios se distribuyen normalmente alrededor del valor verdadero. Es la base de la teoría de errores en física experimental.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏭</span>
              <strong>Control de calidad</strong>
              <p>Las dimensiones de piezas fabricadas en serie (tornillos, botellas, chips) siguen una normal centrada en el valor diseño. Las desviaciones &gt; 3σ se consideran defectuosas (Six Sigma).</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📈</span>
              <strong>Test estandarizados</strong>
              <p>Notas de selectividad o EBAU, exámenes de admisión universitaria en preparatoria y secundaria, SAT, GMAT, CI: se diseñan para que sigan una normal con media y σ fijas, lo que permite comparar candidatos de distintas convocatorias.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre la distribución normal</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué es tan importante la distribución normal?</h4>
              <p>Por el <strong>Teorema Central del Límite</strong>: la suma o promedio de muchas variables aleatorias independientes tiende a seguir una normal, sea cual sea su distribución original. Esto explica por qué aparece en tantos contextos.</p>
              <p className={styles.faqTip}>💡 Lanza 30 dados de 6 caras y suma los resultados: la distribución de la suma es prácticamente normal, aunque cada dado individual sea uniforme.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es la regla 68-95-99.7?</h4>
              <p>En cualquier distribución normal, el <strong>68%</strong> de los valores está entre μ±σ, el <strong>95%</strong> entre μ±2σ, y el <strong>99,7%</strong> entre μ±3σ. Es un referente mental muy útil para hacer estimaciones rápidas sin tablas.</p>
              <p className={styles.faqTip}>💡 Si las alturas siguen N(176, 7), el 95 % de los hombres mide entre 162 y 190 cm. Solo 0,15 % mide más de 197 cm.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es tipificar o calcular Z?</h4>
              <p>Tipificar es transformar X en Z = (X−μ)/σ, convirtiendo cualquier N(μ, σ) en una N(0,1). Permite usar una <strong>única tabla</strong> (la Z) para resolver cualquier problema, en lugar de una tabla por cada μ y σ.</p>
              <p className={styles.faqTip}>💡 Z=2 significa &quot;el valor está 2 desviaciones típicas por encima de la media&quot;. Es independiente de las unidades originales.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿La normal puede valer para variables discretas?</h4>
              <p>Sí, como aproximación. Cuando una binomial B(n, p) tiene n grande y p ni muy próximo a 0 ni a 1 (regla práctica: np &gt; 5 y n(1−p) &gt; 5), se aproxima por N(np, √(np(1−p))). Es la base de muchos problemas de Bachillerato.</p>
              <p className={styles.faqTip}>💡 Aplicar &quot;corrección por continuidad&quot;: P(X = k) ≈ P(k−0,5 &lt; Y &lt; k+0,5) donde Y es la normal aproximante.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué relación hay entre la normal y los intervalos de confianza?</h4>
              <p>Los intervalos de confianza para la media usan la normal porque, por el TCL, la media muestral X̄ se distribuye como N(μ, σ/√n). Un intervalo al 95 % es X̄ ± 1,96 · σ/√n, donde 1,96 es el valor Z que deja 2,5 % a cada cola.</p>
              <p className={styles.faqTip}>💡 Cuanto mayor es n, más estrecho es el intervalo (la √n en el denominador). Para reducir el error a la mitad hay que cuadruplicar la muestra.</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo resolver un problema de distribución normal paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica la variable y sus parámetros</strong>
                <p>Lee el enunciado y reconoce qué variable se distribuye normalmente. Anota explícitamente <code>X ~ N(μ, σ)</code>. Cuidado: a veces dan la <em>varianza</em> (σ²) en lugar de la desviación típica.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Traduce la pregunta a una probabilidad</strong>
                <p>&quot;Probabilidad de que mida más de 185 cm&quot; → P(X &gt; 185). &quot;Porcentaje de aprobados&quot; → P(X ≥ 5). &quot;Valor superado solo por el 10%&quot; → buscar a tal que P(X &gt; a) = 0,10.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Tipifica para usar la tabla Z</strong>
                <p>Calcula Z = (X − μ) / σ para los límites del problema. Recuerda: Z &gt; 0 si X está por encima de la media, Z &lt; 0 si está por debajo. Las tablas habituales dan P(Z ≤ z) para z ≥ 0.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Aplica las propiedades de simetría</strong>
                <p>P(Z &gt; z) = 1 − P(Z ≤ z). P(Z &lt; −z) = P(Z &gt; z) = 1 − P(Z ≤ z). P(a &lt; Z &lt; b) = P(Z ≤ b) − P(Z ≤ a). Estas tres son suficientes para todos los casos.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Interpreta el resultado en el contexto</strong>
                <p>No basta con dar &quot;0,1587&quot;: di &quot;el 15,87 % de los hombres mide más de 185 cm&quot;. Si en una muestra de 1000, eso son aproximadamente 159 personas. La cifra debe contar una historia.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 buenas prácticas al trabajar con la distribución normal</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <strong>Dibuja siempre la curva</strong>
              <p>Antes de hacer cuentas, esboza la campana, marca μ y la zona pedida. Te ahorra errores de signo y de &quot;mayor/menor que&quot;. Este simulador te lo dibuja automáticamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Usa la regla 68-95-99.7 como sanity check</strong>
              <p>Si el resultado dice que P(μ &lt; X &lt; μ+σ) = 0,12, te has equivocado: debe ser ≈ 0,34 (la mitad del 68 %). Es el control de errores más rápido en exámenes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <strong>Tipifica siempre antes de buscar en tablas</strong>
              <p>No existen tablas para cada N(μ, σ): la Z es universal. Tipifica primero, luego busca el valor en la tabla N(0,1) y solo al final interpreta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Verifica que los datos parecen normales</strong>
              <p>Antes de aplicar el modelo, comprueba con un histograma o un test (Shapiro-Wilk, Kolmogorov-Smirnov) que tus datos efectivamente se acercan a una normal. No todo lo continuo es normal.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores conceptuales frecuentes con la distribución normal</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir varianza con desviación típica</strong> — Si dicen N(0, 4) sin más contexto, en notación española suele ser σ = 4. Pero algunas fuentes (sobre todo anglosajonas) usan N(0, σ²) = N(0, 16). Lee con cuidado.</li>
            <li><strong>Suponer que &quot;continua&quot; implica &quot;normal&quot;</strong> — La uniforme, la exponencial y la t de Student también son continuas. Solo las simétricas y acampanadas se ajustan a normal. Prueba con un histograma antes.</li>
            <li><strong>Aplicar la normal a datos extremos</strong> — Tiempos de espera, ingresos, terremotos, viralidad: tienen colas pesadas y se modelan mejor con exponencial, lognormal o Pareto. Forzar la normal subestima los eventos raros.</li>
            <li><strong>Olvidar la corrección por continuidad</strong> — Al aproximar una binomial discreta por una normal continua, P(X = 5) en realidad es P(4,5 &lt; Y &lt; 5,5). Saltarse este paso da errores del 5-10 % en problemas pequeños.</li>
            <li><strong>Confundir P(Z &lt; z) con P(Z &gt; z)</strong> — Las tablas habituales dan acumulado por la izquierda. Si la pregunta es por la derecha, hay que restar de 1. Es el error más común en EBAU y se evita dibujando la campana antes.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-distribucion-normal')} />
      <ShareCard appName="simulador-distribucion-normal" />
      <Footer appName="simulador-distribucion-normal" />
    </div>
  );
}
