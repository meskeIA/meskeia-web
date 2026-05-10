'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorTestHipotesis.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type TipoTest = 'bilateral' | 'derecho' | 'izquierdo';
type Alpha = 0.01 | 0.05 | 0.10;

// ============================================
// FUNCIONES MATEMÁTICAS
// ============================================

// erf para CDF normal
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

function cdfNormal(x: number, mu: number, sigma: number): number {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
}

function pdfNormal(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const z = (x - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

// Inversa de la normal estándar (Beasley-Springer-Moro)
function invNormal(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

function fmt(n: number, decimales = 4): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

// Calcula valores críticos según el tipo de test
function valoresCriticos(tipo: TipoTest, alpha: number): { lo: number | null; hi: number | null } {
  if (tipo === 'bilateral') {
    const z = invNormal(1 - alpha / 2);
    return { lo: -z, hi: z };
  }
  if (tipo === 'derecho') {
    return { lo: null, hi: invNormal(1 - alpha) };
  }
  // izquierdo
  return { lo: invNormal(alpha), hi: null };
}

// Calcula el p-valor a partir del z observado y el tipo de test
function pValor(zObs: number, tipo: TipoTest): number {
  if (tipo === 'bilateral') {
    return 2 * (1 - cdfNormal(Math.abs(zObs), 0, 1));
  }
  if (tipo === 'derecho') {
    return 1 - cdfNormal(zObs, 0, 1);
  }
  return cdfNormal(zObs, 0, 1);
}

// ============================================
// CONSTANTES UI
// ============================================
const N_VALORES = [5, 10, 30, 50, 100, 500];
const ALPHAS: Alpha[] = [0.01, 0.05, 0.10];

const TIPOS_TEST: { id: TipoTest; nombre: string; icono: string; hipotesis: string }[] = [
  { id: 'bilateral', nombre: 'Bilateral', icono: '↔', hipotesis: 'H₁: μ ≠ μ₀' },
  { id: 'derecho', nombre: 'Unilateral derecho', icono: '→', hipotesis: 'H₁: μ > μ₀' },
  { id: 'izquierdo', nombre: 'Unilateral izquierdo', icono: '←', hipotesis: 'H₁: μ < μ₀' },
];

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorTestHipotesisPage() {
  const [tipo, setTipo] = useState<TipoTest>('bilateral');
  const [mu0, setMu0] = useState(50);
  const [mu1, setMu1] = useState(53);
  const [sigma, setSigma] = useState(10);
  const [n, setN] = useState(30);
  const [alpha, setAlpha] = useState<Alpha>(0.05);
  const [xBar, setXBar] = useState(53.5);
  const [mostrarH1, setMostrarH1] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Error estándar (común a H₀ y H₁)
  const ee = useMemo(() => sigma / Math.sqrt(n), [sigma, n]);

  // Z observado
  const zObs = useMemo(() => (xBar - mu0) / ee, [xBar, mu0, ee]);

  // Valores críticos en escala z
  const criticosZ = useMemo(() => valoresCriticos(tipo, alpha), [tipo, alpha]);

  // Valores críticos en escala original (X̄)
  const criticosX = useMemo(() => ({
    lo: criticosZ.lo !== null ? mu0 + criticosZ.lo * ee : null,
    hi: criticosZ.hi !== null ? mu0 + criticosZ.hi * ee : null,
  }), [criticosZ, mu0, ee]);

  // p-valor
  const p = useMemo(() => pValor(zObs, tipo), [zObs, tipo]);

  // Decisión
  const rechazaH0 = p < alpha;

  // β y potencia (cuando mu1 != mu0)
  const beta = useMemo(() => {
    // β = P(no rechazar H0 | H1 verdadera) = P(X̄ NO está en zona de rechazo bajo H1)
    // En escala original, X̄ ~ N(mu1, ee) bajo H1
    if (tipo === 'bilateral' && criticosX.lo !== null && criticosX.hi !== null) {
      // P(criticosX.lo < X̄ < criticosX.hi | mu1)
      return cdfNormal(criticosX.hi, mu1, ee) - cdfNormal(criticosX.lo, mu1, ee);
    }
    if (tipo === 'derecho' && criticosX.hi !== null) {
      // β = P(X̄ < criticosX.hi | mu1)
      return cdfNormal(criticosX.hi, mu1, ee);
    }
    if (tipo === 'izquierdo' && criticosX.lo !== null) {
      // β = P(X̄ > criticosX.lo | mu1)
      return 1 - cdfNormal(criticosX.lo, mu1, ee);
    }
    return 0;
  }, [tipo, criticosX, mu1, ee]);

  const potencia = 1 - beta;

  // ============================================
  // DIBUJO
  // ============================================
  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 30, right: 24, bottom: 36, left: 24 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorH0 = '#2E86AB';
    const colorH0Fill = 'rgba(46, 134, 171, 0.12)';
    const colorH1 = '#E07A1F';
    const colorH1Fill = 'rgba(224, 122, 31, 0.12)';
    const colorRechazo = 'rgba(168, 46, 104, 0.45)';
    const colorBeta = 'rgba(224, 122, 31, 0.32)';
    const colorPVal = 'rgba(46, 134, 171, 0.40)';
    const colorObs = '#7C3AED';

    ctx.clearRect(0, 0, W, H);

    // Rango: cubrir ambas distribuciones
    const muMin = Math.min(mu0, mu1);
    const muMax = Math.max(mu0, mu1);
    const halfWidth = Math.max(4 * ee, (muMax - muMin) / 2 + 4 * ee);
    const xMin = (muMin + muMax) / 2 - halfWidth;
    const xMax = (muMin + muMax) / 2 + halfWidth;
    const xToPx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;

    // yMax: pico de la PDF
    const yMaxLocal = pdfNormal(mu0, mu0, ee);
    const yMax = yMaxLocal * 1.15;
    const yToPx = (y: number) => pad.top + plotH - (y / yMax) * plotH;

    // Eje X
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Marcas eje X
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    const ticks = 6;
    for (let i = 0; i <= ticks; i++) {
      const xv = xMin + (xMax - xMin) * (i / ticks);
      ctx.fillText(fmt(xv, 1), xToPx(xv), pad.top + plotH + 16);
    }

    // === RELLENO H0 (azul claro completo) ===
    ctx.fillStyle = colorH0Fill;
    ctx.beginPath();
    ctx.moveTo(xToPx(xMin), pad.top + plotH);
    const Ncurve = 300;
    for (let i = 0; i <= Ncurve; i++) {
      const xv = xMin + (xMax - xMin) * (i / Ncurve);
      ctx.lineTo(xToPx(xv), yToPx(pdfNormal(xv, mu0, ee)));
    }
    ctx.lineTo(xToPx(xMax), pad.top + plotH);
    ctx.closePath();
    ctx.fill();

    // === RELLENO H1 (naranja claro completo) si activo ===
    if (mostrarH1) {
      ctx.fillStyle = colorH1Fill;
      ctx.beginPath();
      ctx.moveTo(xToPx(xMin), pad.top + plotH);
      for (let i = 0; i <= Ncurve; i++) {
        const xv = xMin + (xMax - xMin) * (i / Ncurve);
        ctx.lineTo(xToPx(xv), yToPx(pdfNormal(xv, mu1, ee)));
      }
      ctx.lineTo(xToPx(xMax), pad.top + plotH);
      ctx.closePath();
      ctx.fill();
    }

    // === ZONAS DE RECHAZO (α, rojo) ===
    const dibujarZonaRechazo = (x0: number, x1: number, baseMu: number, baseSigma: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(xToPx(x0), pad.top + plotH);
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const xv = x0 + (x1 - x0) * (i / N);
        ctx.lineTo(xToPx(xv), yToPx(pdfNormal(xv, baseMu, baseSigma)));
      }
      ctx.lineTo(xToPx(x1), pad.top + plotH);
      ctx.closePath();
      ctx.fill();
    };

    if (tipo === 'bilateral' && criticosX.lo !== null && criticosX.hi !== null) {
      dibujarZonaRechazo(xMin, criticosX.lo, mu0, ee, colorRechazo);
      dibujarZonaRechazo(criticosX.hi, xMax, mu0, ee, colorRechazo);
    } else if (tipo === 'derecho' && criticosX.hi !== null) {
      dibujarZonaRechazo(criticosX.hi, xMax, mu0, ee, colorRechazo);
    } else if (tipo === 'izquierdo' && criticosX.lo !== null) {
      dibujarZonaRechazo(xMin, criticosX.lo, mu0, ee, colorRechazo);
    }

    // === ZONA β (bajo H1, en zona de NO rechazo) ===
    if (mostrarH1) {
      if (tipo === 'bilateral' && criticosX.lo !== null && criticosX.hi !== null) {
        dibujarZonaRechazo(criticosX.lo, criticosX.hi, mu1, ee, colorBeta);
      } else if (tipo === 'derecho' && criticosX.hi !== null) {
        dibujarZonaRechazo(xMin, criticosX.hi, mu1, ee, colorBeta);
      } else if (tipo === 'izquierdo' && criticosX.lo !== null) {
        dibujarZonaRechazo(criticosX.lo, xMax, mu1, ee, colorBeta);
      }
    }

    // === SOMBRA p-VALOR ===
    if (tipo === 'bilateral') {
      const offset = Math.abs(xBar - mu0);
      dibujarZonaRechazo(xMin, mu0 - offset, mu0, ee, colorPVal);
      dibujarZonaRechazo(mu0 + offset, xMax, mu0, ee, colorPVal);
    } else if (tipo === 'derecho') {
      dibujarZonaRechazo(xBar, xMax, mu0, ee, colorPVal);
    } else {
      dibujarZonaRechazo(xMin, xBar, mu0, ee, colorPVal);
    }

    // === CURVA H0 (azul) ===
    ctx.strokeStyle = colorH0;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= Ncurve; i++) {
      const xv = xMin + (xMax - xMin) * (i / Ncurve);
      const px = xToPx(xv);
      const py = yToPx(pdfNormal(xv, mu0, ee));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // === CURVA H1 (naranja, discontinua) ===
    if (mostrarH1) {
      ctx.strokeStyle = colorH1;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let i = 0; i <= Ncurve; i++) {
        const xv = xMin + (xMax - xMin) * (i / Ncurve);
        const px = xToPx(xv);
        const py = yToPx(pdfNormal(xv, mu1, ee));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // === LÍNEAS VERTICALES μ₀ y μ₁ ===
    ctx.strokeStyle = colorH0;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(xToPx(mu0), pad.top);
    ctx.lineTo(xToPx(mu0), pad.top + plotH);
    ctx.stroke();

    if (mostrarH1) {
      ctx.strokeStyle = colorH1;
      ctx.beginPath();
      ctx.moveTo(xToPx(mu1), pad.top);
      ctx.lineTo(xToPx(mu1), pad.top + plotH);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // === ETIQUETAS μ ===
    ctx.fillStyle = colorH0;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`μ₀ = ${fmt(mu0, 1)}`, xToPx(mu0), pad.top - 12);

    if (mostrarH1) {
      ctx.fillStyle = colorH1;
      ctx.fillText(`μ₁ = ${fmt(mu1, 1)}`, xToPx(mu1), pad.top - 2);
    }

    // === LÍNEAS CRÍTICAS ===
    ctx.strokeStyle = '#A82E68';
    ctx.lineWidth = 2;
    if (criticosX.lo !== null) {
      ctx.beginPath();
      ctx.moveTo(xToPx(criticosX.lo), pad.top);
      ctx.lineTo(xToPx(criticosX.lo), pad.top + plotH);
      ctx.stroke();
    }
    if (criticosX.hi !== null) {
      ctx.beginPath();
      ctx.moveTo(xToPx(criticosX.hi), pad.top);
      ctx.lineTo(xToPx(criticosX.hi), pad.top + plotH);
      ctx.stroke();
    }

    // === LÍNEA OBSERVADO X̄ ===
    ctx.strokeStyle = colorObs;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(xToPx(xBar), pad.top);
    ctx.lineTo(xToPx(xBar), pad.top + plotH);
    ctx.stroke();

    ctx.fillStyle = colorObs;
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`X̄ = ${fmt(xBar, 1)}`, xToPx(xBar), pad.top + plotH + 30);

    // === LEYENDA INTERIOR (etiquetas H0/H1) ===
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = colorH0;
    ctx.fillText('H₀: distribución de X̄ si μ = μ₀', pad.left + 8, pad.top + 14);
    if (mostrarH1) {
      ctx.fillStyle = colorH1;
      ctx.fillText('H₁: distribución de X̄ si μ = μ₁', pad.left + 8, pad.top + 28);
    }
  }, [tipo, mu0, mu1, ee, criticosX, xBar, mostrarH1]);

  useEffect(() => { dibujar(); }, [dibujar]);
  useEffect(() => {
    const handleResize = () => dibujar();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujar]);
  useEffect(() => {
    const observer = new MutationObserver(dibujar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [dibujar]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎯 Simulador de Test de Hipótesis</h1>
        <p className={styles.subtitle}>
          Visualiza al mismo tiempo <strong>α, β, p-valor y potencia</strong> con dos distribuciones
          superpuestas (H₀ y H₁) y regiones de rechazo interactivas. Comprende los errores tipo I y II.
        </p>
      </header>

      <LegalNotice />

      {/* TIPO DE TEST */}
      <div className={styles.testTypeSelector}>
        {TIPOS_TEST.map(t => (
          <button
            key={t.id}
            className={`${styles.testBtn} ${tipo === t.id ? styles.testBtnActive : ''}`}
            onClick={() => setTipo(t.id)}
            aria-pressed={tipo === t.id}
          >
            <span className={styles.testIcon}>{t.icono}</span>
            <span className={styles.testName}>{t.nombre}</span>
            <span className={styles.testHipotesis}>{t.hipotesis}</span>
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        <p className={styles.descriptionCard}>
          Test sobre la media: <strong>H₀: μ = {fmt(mu0, 1)}</strong> vs{' '}
          <strong>{tipo === 'bilateral' ? `H₁: μ ≠ ${fmt(mu0, 1)}` : tipo === 'derecho' ? `H₁: μ > ${fmt(mu0, 1)}` : `H₁: μ < ${fmt(mu0, 1)}`}</strong>.
          Decide a nivel <strong>α = {alpha}</strong>. Mueve X̄ observado y mira cómo cambia el p-valor; mueve μ₁
          (la media verdadera asumida bajo H₁) y mira cómo cambian β y la potencia.
        </p>

        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Media bajo H₀ (μ₀ = <strong>{fmt(mu0, 1)}</strong>)
              </label>
              <input
                type="range"
                min={20}
                max={80}
                step={0.5}
                value={mu0}
                onChange={e => setMu0(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Media bajo H0"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Media verdadera bajo H₁ (μ₁ = <strong>{fmt(mu1, 1)}</strong>)
              </label>
              <input
                type="range"
                min={20}
                max={80}
                step={0.5}
                value={mu1}
                onChange={e => setMu1(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Media verdadera bajo H1"
              />
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Desviación poblacional (σ = <strong>{fmt(sigma, 1)}</strong>)
              </label>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={sigma}
                onChange={e => setSigma(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Desviación poblacional"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Tamaño muestral (n = <strong>{n}</strong>)
              </label>
              <div className={styles.discreteSteps} role="group" aria-label="Tamaño muestral">
                {N_VALORES.map(v => (
                  <button
                    key={v}
                    className={`${styles.stepBtn} ${n === v ? styles.stepBtnActive : ''}`}
                    onClick={() => setN(v)}
                    aria-pressed={n === v}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Nivel de significación (α = <strong>{alpha}</strong>)
              </label>
              <div className={styles.discreteSteps} role="group" aria-label="Nivel alfa">
                {ALPHAS.map(v => (
                  <button
                    key={v}
                    className={`${styles.stepBtn} ${alpha === v ? styles.stepBtnActive : ''}`}
                    onClick={() => setAlpha(v)}
                    aria-pressed={alpha === v}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Media observada (X̄ = <strong>{fmt(xBar, 2)}</strong>)
              </label>
              <input
                type="range"
                min={Math.min(mu0, mu1) - 5 * ee}
                max={Math.max(mu0, mu1) + 5 * ee}
                step={(10 * ee) / 200}
                value={xBar}
                onChange={e => setXBar(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Media observada"
              />
            </div>
          </div>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={mostrarH1}
              onChange={e => setMostrarH1(e.target.checked)}
            />
            <span>Mostrar curva H₁, β y potencia (1 − β)</span>
          </label>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Visualización de las distribuciones bajo H0 y H1" />
          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#2E86AB' }} />
              H₀
            </span>
            {mostrarH1 && (
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#E07A1F' }} />
                H₁
              </span>
            )}
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'rgba(168, 46, 104, 0.45)' }} />
              Región rechazo (α)
            </span>
            {mostrarH1 && (
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'rgba(224, 122, 31, 0.32)' }} />
                Región β
              </span>
            )}
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'rgba(46, 134, 171, 0.40)' }} />
              p-valor
            </span>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel}>
          <div className={rechazaH0 ? styles.resultCardOk : styles.resultCardBad}>
            <span className={styles.resultLabel}>p-valor</span>
            <span className={styles.resultValueLarge} style={{ color: rechazaH0 ? '#48A9A6' : '#A82E68' }}>
              {fmt(p, 5)}
            </span>
            <span className={styles.decisionBadge} style={{
              background: rechazaH0 ? 'rgba(72, 169, 166, 0.18)' : 'rgba(168, 46, 104, 0.18)',
              color: rechazaH0 ? '#48A9A6' : '#A82E68'
            }}>
              {rechazaH0 ? '✅ Rechazar H₀' : '❌ NO rechazar H₀'}
            </span>
            <span className={styles.resultRange}>
              {rechazaH0
                ? `p < α (${alpha}): hay evidencia estadística contra H₀`
                : `p ≥ α (${alpha}): no hay suficiente evidencia para rechazar H₀`}
            </span>
          </div>

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>z observado</span>
            <span className={styles.resultValue}>{fmt(zObs, 3)}</span>
            <span className={styles.resultRange}>(X̄ − μ₀) / (σ/√n)</span>
          </div>

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Error estándar (σ/√n)</span>
            <span className={styles.resultValue}>{fmt(ee, 3)}</span>
            <span className={styles.resultRange}>desviación de X̄</span>
          </div>

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>α (riesgo tipo I)</span>
            <span className={styles.resultValue}>{(alpha * 100).toFixed(1)} %</span>
            <span className={styles.resultRange}>P(rechazar H₀ | H₀ cierta)</span>
          </div>

          {mostrarH1 && (
            <>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>β (riesgo tipo II)</span>
                <span className={styles.resultValue}>{fmt(beta * 100, 2)} %</span>
                <span className={styles.resultRange}>P(no rechazar | H₁ cierta)</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Potencia (1 − β)</span>
                <span className={styles.resultValue} style={{ color: potencia > 0.8 ? '#48A9A6' : '#E07A1F' }}>
                  {fmt(potencia * 100, 2)} %
                </span>
                <span className={styles.resultRange}>P(rechazar | H₁ cierta)</span>
              </div>
            </>
          )}

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>z* críticos</span>
            <span className={styles.resultValue}>
              {tipo === 'bilateral'
                ? `±${fmt(criticosZ.hi ?? 0, 3)}`
                : tipo === 'derecho'
                  ? fmt(criticosZ.hi ?? 0, 3)
                  : fmt(criticosZ.lo ?? 0, 3)}
            </span>
            <span className={styles.resultRange}>
              {tipo === 'bilateral' ? 'a/2 a cada cola' : tipo === 'derecho' ? 'cola derecha' : 'cola izquierda'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende qué es un test de hipótesis"
        subtitle="α, β, p-valor y potencia: lo que confunde a casi todo el mundo"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es un contraste o test de hipótesis?</h3>
          <p>
            Un <strong>test de hipótesis</strong> es un procedimiento para decidir entre dos afirmaciones
            opuestas sobre un parámetro poblacional, usando datos muestrales. Se plantean dos hipótesis
            mutuamente excluyentes:
          </p>
          <ul className={styles.bulletList}>
            <li><strong>H₀ (hipótesis nula)</strong>: la afirmación que se da por cierta por defecto, normalmente que &quot;no hay efecto&quot; o &quot;μ es igual a un valor μ₀&quot;.</li>
            <li><strong>H₁ (hipótesis alternativa)</strong>: la afirmación contraria, lo que se quiere demostrar. Puede ser <em>bilateral</em> (μ ≠ μ₀), <em>unilateral derecha</em> (μ &gt; μ₀) o <em>unilateral izquierda</em> (μ &lt; μ₀).</li>
          </ul>
          <p>
            La regla de decisión se basa en el <strong>estadístico z observado</strong> y el
            <strong> p-valor</strong>:
          </p>
          <div className={styles.formulaBox}>
            z<sub>obs</sub> = (X̄ − μ₀) / (σ/√n) &nbsp; · &nbsp; Si p &lt; α: rechazar H₀
          </div>
          <p>
            Hay <strong>dos errores posibles</strong>: rechazar H₀ siendo cierta (<em>tipo I</em>, prob = α)
            o no rechazarla siendo falsa (<em>tipo II</em>, prob = β). El simulador los pinta encima de
            las dos curvas para que veas el trade-off al cambiar α, n o μ₁.
          </p>
        </section>

        {/* TABLA */}
        <section>
          <h3>Los 4 escenarios posibles en un test de hipótesis</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Realidad ↓ / Decisión →</th>
                  <th>NO rechazar H₀</th>
                  <th>Rechazar H₀</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>H₀ es cierta</strong></td>
                  <td>✅ Decisión correcta (1 − α)</td>
                  <td>❌ <strong>Error tipo I</strong> (α). Rechazar H₀ siendo cierta.</td>
                </tr>
                <tr>
                  <td><strong>H₀ es falsa (H₁ cierta)</strong></td>
                  <td>❌ <strong>Error tipo II</strong> (β). No rechazar H₀ siendo falsa.</td>
                  <td>✅ Decisión correcta (1 − β = potencia)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>α</strong> y <strong>β</strong> están en tensión: bajar α (ser más exigente para
            rechazar) sube β (menos potencia). La única forma de bajar ambos es <em>aumentar n</em>: más
            datos = mejor capacidad de distinguir realidades.
          </p>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios donde se usa contraste de hipótesis</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>💊</span>
              <strong>Ensayos clínicos</strong>
              <p>H₀: el fármaco no es mejor que el placebo. H₁: sí lo es. Si el p-valor es muy bajo, se rechaza H₀ y se concluye que el fármaco tiene efecto. La FDA exige potencia ≥ 80 %.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🏭</span>
              <strong>Control de calidad</strong>
              <p>H₀: el peso medio del lote es 500 g (especificación). Si rechazas H₀, paras la línea. α bajo (1 %) reduce falsas alarmas, pero exige n grande para no perder defectos reales.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🧪</span>
              <strong>Investigación científica</strong>
              <p>H₀: no hay diferencia entre dos métodos. Rechazar H₀ con p &lt; 0,05 ha sido el estándar durante décadas. Hoy hay debate sobre si esa cifra es demasiado laxa.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📈</span>
              <strong>A/B testing en producto digital</strong>
              <p>H₀: la nueva versión del botón no aumenta clics. Si el test muestra p &lt; 0,05 con un efecto razonable, se despliega la nueva versión. La potencia depende del tráfico (n).</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre test de hipótesis</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿El p-valor es la probabilidad de que H₀ sea cierta?</h4>
              <p><strong>NO.</strong> Es uno de los errores más extendidos, incluso entre profesionales. El p-valor es la <em>probabilidad de obtener un resultado tan o más extremo que el observado, asumiendo que H₀ es cierta</em>. NO es la probabilidad de que H₀ sea cierta dados los datos (eso sería un razonamiento bayesiano y requiere prior).</p>
              <p className={styles.faqTip}>💡 Mejor traducción: &quot;si H₀ fuera cierta, ¿cómo de raro sería ver lo que vimos?&quot;. Si es muy raro (p pequeño), es una señal de que H₀ podría ser falsa.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿&quot;No rechazar H₀&quot; significa &quot;aceptar H₀&quot;?</h4>
              <p><strong>NO.</strong> No rechazar H₀ solo significa &quot;no hay suficiente evidencia para rechazarla con esta muestra&quot;. Podría ser cierta, podría ser falsa pero con un efecto pequeño (β alto = baja potencia), podría faltar n. Nunca se &quot;acepta&quot; H₀.</p>
              <p className={styles.faqTip}>💡 La traducción correcta es: &quot;los datos no son incompatibles con H₀&quot;. No es lo mismo que confirmarla.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo aumento la potencia (1 − β) de mi test?</h4>
              <p>Cuatro palancas: <strong>(1)</strong> aumentar n (la palanca más segura), <strong>(2)</strong> reducir σ (mejor diseño experimental), <strong>(3)</strong> aceptar mayor α (5 % en vez de 1 %), <strong>(4)</strong> esperar a que el efecto real sea grande (μ₁ − μ₀ alto). En el simulador, mueve μ₁ alejándolo de μ₀ y verás la potencia subir.</p>
              <p className={styles.faqTip}>💡 Estándar de la industria: potencia ≥ 80 % antes de hacer el test. Por debajo, el test puede fracasar incluso aunque H₁ sea cierta.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo uso bilateral y cuándo unilateral?</h4>
              <p><strong>Bilateral</strong> cuando solo te importa si μ es distinto de μ₀, sin saber si por encima o por debajo. <strong>Unilateral</strong> cuando tienes una hipótesis direccional clara (un fármaco solo puede mejorar, no empeorar; un proceso solo puede degradarse).</p>
              <p className={styles.faqTip}>💡 Los unilaterales tienen mayor potencia para una desviación dada, pero NO los uses post-hoc al ver los datos: eso infla α y es mala práctica.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué relación hay entre p-valor e intervalo de confianza?</h4>
              <p>Son <strong>dos caras de la misma moneda</strong>. Un test bilateral con α = 5 % rechaza H₀: μ = μ₀ ⟺ el IC al 95 % NO contiene μ₀. Pero el IC da más información: el rango plausible de μ, no solo si rechazas o no.</p>
              <p className={styles.faqTip}>💡 La American Statistical Association recomienda reportar IC y tamaño de efecto, no solo p-valores.</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo realizar un test de hipótesis paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Plantea H₀ y H₁ ANTES de mirar los datos</strong>
                <p>H₀ debe ser específica (μ = μ₀). H₁ define la dirección (≠, &gt; o &lt;). Decidir tras ver los datos infla α y es mala práctica (p-hacking).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Fija α (nivel de significación) ANTES</strong>
                <p>5 % es el estándar histórico, 1 % para ámbitos críticos (medicina), 10 % para exploratorio. Cambiarlo tras ver los datos invalida la inferencia.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Calcula el estadístico z observado</strong>
                <p>z<sub>obs</sub> = (X̄ − μ₀) / (σ/√n). Si σ es desconocido (caso real), sustitúyelo por s y usa la distribución t con n − 1 grados de libertad.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula el p-valor</strong>
                <p>Para bilateral: 2·P(Z &gt; |z<sub>obs</sub>|). Para unilateral derecho: P(Z &gt; z<sub>obs</sub>). Para unilateral izquierdo: P(Z &lt; z<sub>obs</sub>). Lo da cualquier tabla Z o software.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Decide e interpreta en contexto</strong>
                <p>Si p &lt; α: rechazas H₀ (&quot;hay evidencia estadística de que μ ≠ μ₀&quot;). Si p ≥ α: no rechazas. Reporta también el tamaño de efecto y el IC, no solo el p-valor.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 buenas prácticas con tests de hipótesis</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <strong>Calcula la potencia ANTES del estudio</strong>
              <p>El cálculo de tamaño muestral asume una potencia objetivo (≥ 80 %). Si lanzas un test con n insuficiente, las conclusiones serán cuestionables, gane o pierda.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Reporta el tamaño de efecto, no solo el p-valor</strong>
              <p>Un p &lt; 0,001 con n = 1.000.000 puede ocultar un efecto irrelevante en la práctica. El tamaño de efecto (d de Cohen, diferencia bruta, IC) cuenta la historia real.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🚫</span>
              <strong>NO hagas múltiples tests sin corregir α</strong>
              <p>Si haces 20 tests independientes a α = 5 %, esperarás 1 falso positivo de media. Aplica corrección Bonferroni (α/k) o métodos FDR para controlar la tasa de error global.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
              <strong>Pre-registra hipótesis y diseño</strong>
              <p>El pre-registro de H₀, H₁, α y n antes de tomar datos es la mejor protección contra p-hacking, HARKing y otros sesgos. Especialmente en investigación científica formal.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes con tests de hipótesis</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir p-valor con probabilidad de H₀</strong> — p NO es P(H₀ | datos). Es P(datos tan extremos | H₀). Confundirlos lleva a interpretar mal cualquier resultado estadístico.</li>
            <li><strong>Decir &quot;significativo = importante&quot;</strong> — Significancia estadística mide si el efecto es distinto de 0; importancia práctica mide si el efecto es grande. Con n enorme, casi cualquier diferencia será significativa, sea relevante o no.</li>
            <li><strong>P-hacking</strong> — Probar varios tests, modelos o subgrupos hasta encontrar p &lt; 0,05 y reportar solo ese. Invalida las garantías de α y produce literatura científica irreproducible.</li>
            <li><strong>HARKing (Hypothesizing After Results are Known)</strong> — Cambiar la hipótesis tras ver los datos para que parezca que la habíamos predicho. Mata la inferencia: lo que se planteó como H₁ debe haberse planteado ANTES de mirar.</li>
            <li><strong>No reportar β ni la potencia</strong> — Un &quot;no significativo&quot; con potencia del 20 % no dice nada: probablemente faltó muestra. Reportar potencia es tan importante como el p-valor para interpretar resultados negativos.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-test-hipotesis')} />
      <ShareCard appName="simulador-test-hipotesis" />
      <Footer appName="simulador-test-hipotesis" />
    </div>
  );
}
