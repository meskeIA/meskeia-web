'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorIntervalosConfianza.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type Modo = 'conceptual' | 'calculadora';
type NivelConf = 0.80 | 0.90 | 0.95 | 0.99;

interface ICSimulado {
  xBar: number;
  s: number;
  inferior: number;
  superior: number;
  contieneMu: boolean;
}

// ============================================
// FUNCIONES MATEMÁTICAS
// ============================================

// Aproximación inversa de la normal estándar (Beasley-Springer-Moro)
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

// z* para nivel de confianza
function zCritico(nivel: number): number {
  const alpha = 1 - nivel;
  return invNormal(1 - alpha / 2);
}

// Tabla de valores exactos t de Student para df = 1..30, niveles 80/90/95/99% (dos colas)
const T_TABLE: Record<number, number[]> = {
  0.80: [3.078,1.886,1.638,1.533,1.476,1.440,1.415,1.397,1.383,1.372,1.363,1.356,1.350,1.345,1.341,1.337,1.333,1.330,1.328,1.325,1.323,1.321,1.319,1.318,1.316,1.315,1.314,1.313,1.311,1.310],
  0.90: [6.314,2.920,2.353,2.132,2.015,1.943,1.895,1.860,1.833,1.812,1.796,1.782,1.771,1.761,1.753,1.746,1.740,1.734,1.729,1.725,1.721,1.717,1.714,1.711,1.708,1.706,1.703,1.701,1.699,1.697],
  0.95: [12.706,4.303,3.182,2.776,2.571,2.447,2.365,2.306,2.262,2.228,2.201,2.179,2.160,2.145,2.131,2.120,2.110,2.101,2.093,2.086,2.080,2.074,2.069,2.064,2.060,2.056,2.052,2.048,2.045,2.042],
  0.99: [63.657,9.925,5.841,4.604,4.032,3.707,3.499,3.355,3.250,3.169,3.106,3.055,3.012,2.977,2.947,2.921,2.898,2.878,2.861,2.845,2.831,2.819,2.807,2.797,2.787,2.779,2.771,2.763,2.756,2.750],
};

// t crítico: tabla exacta para df ≤ 30, Cornish-Fisher para df > 30
function tCritico(nivel: number, df: number): number {
  if (df < 1) return zCritico(nivel);
  const tabla = T_TABLE[nivel];
  if (tabla && df <= 30) return tabla[df - 1];
  const z = zCritico(nivel);
  const z3 = z * z * z;
  const z5 = z3 * z * z;
  const ajuste = (z3 + z) / (4 * df) + (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df);
  return z + ajuste;
}

// Box-Muller para muestrear N(0, 1)
function muestraNormal(): number {
  let u1 = Math.random();
  const u2 = Math.random();
  if (u1 < 1e-12) u1 = 1e-12;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Genera n muestras de N(mu, sigma)
function generarMuestra(n: number, mu: number, sigma: number): number[] {
  const muestra: number[] = [];
  for (let i = 0; i < n; i++) {
    muestra.push(mu + sigma * muestraNormal());
  }
  return muestra;
}

function media(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function desvTipica(xs: number[], mu?: number): number {
  const m = mu ?? media(xs);
  const sumSq = xs.reduce((acc, x) => acc + (x - m) * (x - m), 0);
  return Math.sqrt(sumSq / (xs.length - 1));
}

function fmt(n: number, decimales = 3): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

// ============================================
// CONSTANTES UI
// ============================================
const N_VALORES = [5, 10, 30, 50, 100, 500];
const NIVELES: NivelConf[] = [0.80, 0.90, 0.95, 0.99];
const NUM_INTERVALOS_SIMULADOS = 100;

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorIntervalosConfianzaPage() {
  const [modo, setModo] = useState<Modo>('conceptual');

  // Modo conceptual
  const [muPob, setMuPob] = useState(50);
  const [sigmaPob, setSigmaPob] = useState(10);
  const [n, setN] = useState(30);
  const [nivel, setNivel] = useState<NivelConf>(0.95);
  const [usarT, setUsarT] = useState(false);
  const [intervalos, setIntervalos] = useState<ICSimulado[]>([]);
  const [generaciones, setGeneraciones] = useState(0);

  // Modo calculadora
  const [xBarCalc, setXBarCalc] = useState(75.5);
  const [sCalc, setSCalc] = useState(8);
  const [nCalc, setNCalc] = useState(30);
  const [nivelCalc, setNivelCalc] = useState<NivelConf>(0.95);
  const [usarTCalc, setUsarTCalc] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================
  // GENERAR INTERVALOS (modo conceptual)
  // ============================================
  const generarIntervalos = useCallback(() => {
    const nuevos: ICSimulado[] = [];
    const critico = usarT ? tCritico(nivel, n - 1) : zCritico(nivel);
    for (let i = 0; i < NUM_INTERVALOS_SIMULADOS; i++) {
      const muestra = generarMuestra(n, muPob, sigmaPob);
      const xBar = media(muestra);
      const s = desvTipica(muestra, xBar);
      // Para z usamos sigma poblacional; para t usamos s muestral
      const sigmaUsado = usarT ? s : sigmaPob;
      const margen = critico * sigmaUsado / Math.sqrt(n);
      const inferior = xBar - margen;
      const superior = xBar + margen;
      nuevos.push({
        xBar,
        s,
        inferior,
        superior,
        contieneMu: muPob >= inferior && muPob <= superior,
      });
    }
    setIntervalos(nuevos);
    setGeneraciones(g => g + 1);
  }, [muPob, sigmaPob, n, nivel, usarT]);

  // Generar al cambiar parámetros (modo conceptual) o al inicio
  useEffect(() => {
    if (modo === 'conceptual') {
      generarIntervalos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, muPob, sigmaPob, n, nivel, usarT]);

  // Estadísticos modo conceptual
  const conteoOk = useMemo(() => intervalos.filter(i => i.contieneMu).length, [intervalos]);
  const cobertura = useMemo(() => intervalos.length > 0 ? conteoOk / intervalos.length : 0, [intervalos, conteoOk]);

  // ============================================
  // CÁLCULO MODO CALCULADORA
  // ============================================
  const calcResultado = useMemo(() => {
    if (nCalc < 2) return null;
    const critico = usarTCalc ? tCritico(nivelCalc, nCalc - 1) : zCritico(nivelCalc);
    const errorEstandar = sCalc / Math.sqrt(nCalc);
    const margen = critico * errorEstandar;
    return {
      critico,
      errorEstandar,
      margen,
      inferior: xBarCalc - margen,
      superior: xBarCalc + margen,
    };
  }, [xBarCalc, sCalc, nCalc, nivelCalc, usarTCalc]);

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

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorOk = '#48A9A6';
    const colorBad = '#A82E68';
    const colorMu = '#E07A1F';
    const colorPrimary = '#2E86AB';

    ctx.clearRect(0, 0, W, H);

    if (modo === 'conceptual' && intervalos.length > 0) {
      const pad = { top: 32, right: 16, bottom: 32, left: 16 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;

      // Rango X centrado en mu
      const halfWidth = (sigmaPob / Math.sqrt(n)) * 5; // ~5 errores estándar
      const xMin = muPob - halfWidth;
      const xMax = muPob + halfWidth;
      const xToPx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;

      // Eje X
      ctx.strokeStyle = colorAxis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, pad.top + plotH / 2);
      ctx.lineTo(pad.left + plotW, pad.top + plotH / 2);
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

      // Línea vertical en mu poblacional
      ctx.strokeStyle = colorMu;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xToPx(muPob), pad.top);
      ctx.lineTo(xToPx(muPob), pad.top + plotH);
      ctx.stroke();

      ctx.fillStyle = colorMu;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`μ = ${fmt(muPob, 1)}`, xToPx(muPob), pad.top - 8);

      // Dibujar 100 intervalos como segmentos horizontales
      const N = intervalos.length;
      const intervaloAlturaPx = plotH / N;

      for (let i = 0; i < N; i++) {
        const ic = intervalos[i];
        const y = pad.top + i * intervaloAlturaPx + intervaloAlturaPx / 2;
        const x1 = xToPx(Math.max(xMin, ic.inferior));
        const x2 = xToPx(Math.min(xMax, ic.superior));

        ctx.strokeStyle = ic.contieneMu ? colorOk : colorBad;
        ctx.lineWidth = ic.contieneMu ? 1.5 : 2;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Punto central X̄
        ctx.fillStyle = ic.contieneMu ? colorOk : colorBad;
        const xBarPx = xToPx(ic.xBar);
        if (xBarPx >= pad.left && xBarPx <= pad.left + plotW) {
          ctx.beginPath();
          ctx.arc(xBarPx, y, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Etiqueta superior
      ctx.fillStyle = colorText;
      ctx.font = '12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(
        `${conteoOk} de ${N} intervalos contienen μ (${fmt(cobertura * 100, 1)} %)`,
        pad.left + 8,
        pad.top - 12
      );

    } else if (modo === 'calculadora' && calcResultado) {
      // Dibujar la distribución muestral N(X̄, s/√n) y sombrear el IC
      const pad = { top: 28, right: 24, bottom: 36, left: 24 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;

      const errorEst = calcResultado.errorEstandar;
      const halfWidth = errorEst * 4.5;
      const xMin = xBarCalc - halfWidth;
      const xMax = xBarCalc + halfWidth;
      const xToPx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;

      // PDF de N(xBarCalc, errorEst)
      const pdf = (x: number) => {
        const z = (x - xBarCalc) / errorEst;
        return (1 / (errorEst * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      };
      const yMax = pdf(xBarCalc) * 1.1;
      const yToPx = (y: number) => pad.top + plotH - (y / yMax) * plotH;

      // Eje X
      ctx.strokeStyle = colorAxis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, pad.top + plotH);
      ctx.lineTo(pad.left + plotW, pad.top + plotH);
      ctx.stroke();

      // Sombreado IC
      ctx.fillStyle = 'rgba(46, 134, 171, 0.30)';
      ctx.beginPath();
      const x0 = Math.max(xMin, calcResultado.inferior);
      const x1 = Math.min(xMax, calcResultado.superior);
      ctx.moveTo(xToPx(x0), pad.top + plotH);
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const xv = x0 + (x1 - x0) * (i / N);
        ctx.lineTo(xToPx(xv), yToPx(pdf(xv)));
      }
      ctx.lineTo(xToPx(x1), pad.top + plotH);
      ctx.closePath();
      ctx.fill();

      // Curva
      ctx.strokeStyle = colorPrimary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const Ncurve = 300;
      for (let i = 0; i <= Ncurve; i++) {
        const xv = xMin + (xMax - xMin) * (i / Ncurve);
        const px = xToPx(xv);
        const py = yToPx(pdf(xv));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Línea vertical X̄
      ctx.strokeStyle = colorPrimary;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(xToPx(xBarCalc), pad.top);
      ctx.lineTo(xToPx(xBarCalc), pad.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colorPrimary;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`X̄ = ${fmt(xBarCalc, 2)}`, xToPx(xBarCalc), pad.top - 6);

      // Líneas verticales en límites IC
      ctx.strokeStyle = colorOk;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xToPx(calcResultado.inferior), pad.top);
      ctx.lineTo(xToPx(calcResultado.inferior), pad.top + plotH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(xToPx(calcResultado.superior), pad.top);
      ctx.lineTo(xToPx(calcResultado.superior), pad.top + plotH);
      ctx.stroke();

      // Etiquetas IC
      ctx.fillStyle = colorOk;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(fmt(calcResultado.inferior, 2), xToPx(calcResultado.inferior), pad.top + plotH + 16);
      ctx.fillText(fmt(calcResultado.superior, 2), xToPx(calcResultado.superior), pad.top + plotH + 16);

      // Etiqueta confianza
      ctx.fillStyle = colorText;
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`IC ${(nivelCalc * 100).toFixed(0)} %`, xToPx(xBarCalc), yToPx(pdf(xBarCalc) * 0.5));
    }
  }, [modo, intervalos, muPob, sigmaPob, n, conteoOk, cobertura, calcResultado, xBarCalc, nivelCalc]);

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
        <h1 className={styles.title}>📏 Simulador de Intervalos de Confianza</h1>
        <p className={styles.subtitle}>
          Genera <strong>100 intervalos</strong> a partir de muestras independientes y comprueba que ~95
          contienen μ. Aprende qué significa de verdad un IC al 95 %.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR DE MODO */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeBtn} ${modo === 'conceptual' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('conceptual')}
          aria-pressed={modo === 'conceptual'}
        >
          <span className={styles.modeIcon}>🎯</span>
          <span className={styles.modeName}>Modo conceptual</span>
          <span className={styles.modeDesc}>100 IC simulados — entiende qué significa &quot;95 % de confianza&quot;</span>
        </button>
        <button
          className={`${styles.modeBtn} ${modo === 'calculadora' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('calculadora')}
          aria-pressed={modo === 'calculadora'}
        >
          <span className={styles.modeIcon}>🧮</span>
          <span className={styles.modeName}>Modo calculadora</span>
          <span className={styles.modeDesc}>Calcula el IC para tu X̄, s y n concretos</span>
        </button>
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        {modo === 'conceptual' ? (
          <>
            <p className={styles.descriptionCard}>
              Generas <strong>{NUM_INTERVALOS_SIMULADOS} muestras</strong> independientes de una población
              N(μ, σ). Cada muestra produce un intervalo de confianza. En verde los que contienen μ, en rosa
              los que NO. A nivel <strong>{(nivel * 100).toFixed(0)} %</strong> de confianza, deberían contenerlo
              aproximadamente {(nivel * 100).toFixed(0)} de cada 100. <em>Esa es la definición frecuentista.</em>
            </p>

            <div className={styles.controls}>
              <div className={styles.controlsGrid}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Media poblacional (μ = <strong>{fmt(muPob, 1)}</strong>)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.5}
                    value={muPob}
                    onChange={e => setMuPob(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Media poblacional μ"
                  />
                </div>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Desviación poblacional (σ = <strong>{fmt(sigmaPob, 1)}</strong>)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={0.5}
                    value={sigmaPob}
                    onChange={e => setSigmaPob(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Desviación poblacional σ"
                  />
                </div>
              </div>

              <div className={styles.controlsGrid}>
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
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Nivel de confianza (<strong>{(nivel * 100).toFixed(0)} %</strong>)
                  </label>
                  <div className={styles.discreteSteps} role="group" aria-label="Nivel de confianza">
                    {NIVELES.map(v => (
                      <button
                        key={v}
                        className={`${styles.stepBtn} ${nivel === v ? styles.stepBtnActive : ''}`}
                        onClick={() => setNivel(v)}
                        aria-pressed={nivel === v}
                      >
                        {(v * 100).toFixed(0)} %
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={usarT}
                  onChange={e => setUsarT(e.target.checked)}
                />
                <span>Usar t de Student (asumir que σ es desconocido y estimar con s)</span>
              </label>

              <div className={styles.actions}>
                <button className={styles.runBtn} onClick={generarIntervalos}>
                  🔄 Generar 100 nuevos intervalos
                </button>
              </div>
            </div>

            {/* CANVAS */}
            <div className={styles.canvasWrapper}>
              <canvas ref={canvasRef} role="img" className={styles.canvas} aria-label="Visualización de 100 intervalos de confianza" />
              <div className={styles.legendRow}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#48A9A6' }} />
                  Contiene μ
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#A82E68' }} />
                  No contiene μ
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#E07A1F' }} />
                  Línea: μ verdadera
                </span>
              </div>
            </div>

            {/* RESULTADOS */}
            <div className={styles.resultsPanel} role="status" aria-live="polite">
              <div className={styles.resultCardMain}>
                <span className={styles.resultLabel}>Cobertura empírica</span>
                <span className={styles.resultValueLarge}>{fmt(cobertura * 100, 1)} %</span>
                <span className={styles.resultRange}>
                  {conteoOk} de {NUM_INTERVALOS_SIMULADOS} contienen μ · esperado: {(nivel * 100).toFixed(0)} %
                </span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Generaciones</span>
                <span className={styles.resultValue}>{generaciones}</span>
                <span className={styles.resultRange}>conjuntos de 100 IC</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Error estándar (σ/√n)</span>
                <span className={styles.resultValue}>{fmt(sigmaPob / Math.sqrt(n), 3)}</span>
                <span className={styles.resultRange}>desviación de X̄</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Crítico {usarT ? 't' : 'z'}*</span>
                <span className={styles.resultValue}>
                  {fmt(usarT ? tCritico(nivel, n - 1) : zCritico(nivel), 3)}
                </span>
                <span className={styles.resultRange}>
                  {usarT ? `t con ${n - 1} g.l.` : 'z normal'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className={styles.descriptionCard}>
              Introduce los estadísticos de tu muestra (X̄, desviación s, tamaño n) y obtén el intervalo de
              confianza para μ. Si σ es desconocida (caso habitual), usa <strong>t de Student</strong>; si la
              conoces de antemano, usa <strong>z</strong>.
            </p>

            <div className={styles.controls}>
              <div className={styles.controlsGrid}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Media muestral (X̄ = <strong>{fmt(xBarCalc, 2)}</strong>)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={xBarCalc}
                    step={0.1}
                    onChange={e => setXBarCalc(parseFloat(e.target.value) || 0)}
                    className={styles.numberInput}
                    aria-label="Media muestral X̄"
                  />
                </div>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Desviación muestral (s = <strong>{fmt(sCalc, 2)}</strong>)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={sCalc}
                    step={0.1}
                    min={0}
                    onChange={e => setSCalc(Math.max(0, parseFloat(e.target.value) || 0))}
                    className={styles.numberInput}
                    aria-label="Desviación muestral s"
                  />
                </div>
              </div>

              <div className={styles.controlsGrid}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Tamaño muestral (n = <strong>{nCalc}</strong>)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={nCalc}
                    step={1}
                    min={2}
                    onChange={e => setNCalc(Math.max(2, parseInt(e.target.value) || 2))}
                    className={styles.numberInput}
                    aria-label="Tamaño muestral n"
                  />
                </div>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    Nivel de confianza (<strong>{(nivelCalc * 100).toFixed(0)} %</strong>)
                  </label>
                  <div className={styles.discreteSteps} role="group" aria-label="Nivel de confianza">
                    {NIVELES.map(v => (
                      <button
                        key={v}
                        className={`${styles.stepBtn} ${nivelCalc === v ? styles.stepBtnActive : ''}`}
                        onClick={() => setNivelCalc(v)}
                        aria-pressed={nivelCalc === v}
                      >
                        {(v * 100).toFixed(0)} %
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={usarTCalc}
                  onChange={e => setUsarTCalc(e.target.checked)}
                />
                <span>Usar t de Student (recomendado si has estimado σ con la muestra)</span>
              </label>
            </div>

            {/* CANVAS */}
            <div className={styles.canvasWrapper}>
              <canvas ref={canvasRef} role="img" className={styles.canvas} aria-label="Visualización del intervalo de confianza" />
            </div>

            {/* RESULTADOS */}
            {calcResultado && (
              <div className={styles.resultsPanel} role="status" aria-live="polite">
                <div className={styles.resultCardMain}>
                  <span className={styles.resultLabel}>IC al {(nivelCalc * 100).toFixed(0)} % para μ</span>
                  <span className={styles.resultValueLarge}>
                    [{fmt(calcResultado.inferior, 3)} ; {fmt(calcResultado.superior, 3)}]
                  </span>
                  <span className={styles.resultRange}>X̄ ± {fmt(calcResultado.margen, 3)}</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultLabel}>{usarTCalc ? 't*' : 'z*'} crítico</span>
                  <span className={styles.resultValue}>{fmt(calcResultado.critico, 3)}</span>
                  <span className={styles.resultRange}>{usarTCalc ? `t con ${nCalc - 1} g.l.` : 'normal'}</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultLabel}>Error estándar</span>
                  <span className={styles.resultValue}>{fmt(calcResultado.errorEstandar, 4)}</span>
                  <span className={styles.resultRange}>s/√n</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultLabel}>Margen de error</span>
                  <span className={styles.resultValue}>±{fmt(calcResultado.margen, 3)}</span>
                  <span className={styles.resultRange}>crítico × s/√n</span>
                </div>
                <div className={styles.resultCard}>
                  <span className={styles.resultLabel}>Anchura del IC</span>
                  <span className={styles.resultValue}>{fmt(calcResultado.superior - calcResultado.inferior, 3)}</span>
                  <span className={styles.resultRange}>2 × margen</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="Aprende qué es un intervalo de confianza"
        subtitle="Por qué &quot;95 % de confianza&quot; NO es lo que la mayoría de la gente cree"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es un intervalo de confianza para μ?</h3>
          <p>
            Un <strong>intervalo de confianza</strong> (IC) es un rango calculado a partir de una muestra que,
            con cierta confianza prefijada (95 % típicamente), <em>contendría la verdadera media poblacional μ
            si repitiéramos el muestreo muchas veces</em>. La fórmula básica para μ con σ conocido es:
          </p>
          <div className={styles.formulaBox}>
            IC<sub>1−α</sub> = X̄ ± z<sub>α/2</sub> · σ / √n
          </div>
          <p>
            Si σ es desconocido (lo más habitual en la práctica), se sustituye por la desviación muestral s y
            se usa la <strong>distribución t de Student</strong> con n − 1 grados de libertad:
          </p>
          <div className={styles.formulaBox}>
            IC<sub>1−α</sub> = X̄ ± t<sub>α/2, n−1</sub> · s / √n
          </div>
          <ul className={styles.bulletList}>
            <li><strong>X̄</strong>: media muestral (lo que has medido).</li>
            <li><strong>s/√n</strong>: error estándar de la media. Cuanto mayor n, más precisión.</li>
            <li><strong>z* o t*</strong>: valor crítico que depende del nivel de confianza.</li>
            <li><strong>Margen de error</strong> = crítico · error estándar.</li>
          </ul>
        </section>

        {/* TABLA */}
        <section>
          <h3>Valores críticos z* habituales y cómo afectan al IC</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Nivel de confianza</th>
                  <th>α (riesgo)</th>
                  <th>z*</th>
                  <th>Margen para σ/√n = 1</th>
                  <th>Cuándo usarlo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>80 %</td>
                  <td>0,20</td>
                  <td>1,282</td>
                  <td>±1,28</td>
                  <td>Estimaciones rápidas exploratorias</td>
                </tr>
                <tr>
                  <td>90 %</td>
                  <td>0,10</td>
                  <td>1,645</td>
                  <td>±1,64</td>
                  <td>Investigación social, marketing</td>
                </tr>
                <tr>
                  <td><strong>95 %</strong></td>
                  <td>0,05</td>
                  <td>1,960</td>
                  <td>±1,96</td>
                  <td><strong>Estándar científico (default)</strong></td>
                </tr>
                <tr>
                  <td>99 %</td>
                  <td>0,01</td>
                  <td>2,576</td>
                  <td>±2,58</td>
                  <td>Medicina, ingeniería, control de calidad</td>
                </tr>
                <tr>
                  <td>99,9 %</td>
                  <td>0,001</td>
                  <td>3,291</td>
                  <td>±3,29</td>
                  <td>Física de partículas, ensayos pivotales</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios donde usar IC es clave</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📊</span>
              <strong>Encuestas y sondeos</strong>
              <p>El típico &quot;42 % ± 3 % al 95 % de confianza&quot; es exactamente un IC para una proporción. Sin él, no sabrías si una diferencia entre dos partidos es real o ruido muestral.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>💊</span>
              <strong>Ensayos clínicos</strong>
              <p>El efecto de un fármaco se reporta como IC: &quot;reducción media del 14 % [IC95 %: 9 %, 19 %]&quot;. Si el IC incluye 0, el efecto no es significativo. Si no, hay evidencia de efecto.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🏭</span>
              <strong>Control de calidad industrial</strong>
              <p>Para certificar que el peso medio de un producto está dentro de tolerancia, se calcula un IC para la media de lotes. Si supera el límite, se detiene producción.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📈</span>
              <strong>Estimaciones financieras</strong>
              <p>La rentabilidad media histórica de un fondo se reporta con IC: &quot;7,3 % anual [IC95 %: 4,1 %, 10,5 %]&quot;. Los rangos amplios indican alta volatilidad y poca seguridad sobre el valor verdadero.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre intervalos de confianza</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿&quot;95 % de confianza&quot; significa que μ está dentro del IC con probabilidad 95 %?</h4>
              <p><strong>NO</strong>. Esa interpretación es incorrecta y muy común. Una vez calculado, μ está o no está en el IC: probabilidad 1 o 0. La confianza del 95 % se refiere al <em>procedimiento</em>: si repitieras el muestreo muchas veces, ~95 % de los IC contendrían μ.</p>
              <p className={styles.faqTip}>💡 En el simulador, modo conceptual, lo ves directamente: 100 IC, ~95 contienen μ. Esa es la interpretación correcta.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo uso z y cuándo t?</h4>
              <p>Usa <strong>z (normal)</strong> cuando σ poblacional es conocido (caso raro) o cuando n es muy grande (n ≥ 30) y σ es estimada con s. Usa <strong>t (Student)</strong> cuando σ es desconocida y n es pequeño (n &lt; 30): la t es más ancha que la z y compensa la incertidumbre extra de estimar σ.</p>
              <p className={styles.faqTip}>💡 A partir de n ≈ 30, t y z dan resultados casi idénticos. Por defecto, en la práctica, usa siempre t cuando estimes σ con la muestra.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo reduzco la anchura de mi IC?</h4>
              <p>Tres palancas: <strong>(1)</strong> aumentar n (la anchura es proporcional a 1/√n: cuadruplicar n reduce a la mitad la anchura). <strong>(2)</strong> reducir σ (si puedes controlar mejor las mediciones, mejor). <strong>(3)</strong> aceptar menor confianza (95 % → 80 % reduce la anchura, pero a cambio de más riesgo).</p>
              <p className={styles.faqTip}>💡 La opción (1) es la más segura y honesta. Las otras pueden manipularse para hacer parecer significativo lo que no lo es.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si la población NO es normal?</h4>
              <p>Por el <strong>Teorema Central del Límite</strong>, la distribución de X̄ se aproxima a una normal cuando n es grande, sea cual sea la población original. Por eso los IC funcionan razonablemente bien con n ≥ 30 incluso para poblaciones asimétricas.</p>
              <p className={styles.faqTip}>💡 Para n pequeño con población muy asimétrica, considera transformaciones (log) o métodos no paramétricos (bootstrap, percentiles).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿IC y test de hipótesis están relacionados?</h4>
              <p>Sí, son <strong>dos caras de la misma moneda</strong>. Si el IC al 95 % para μ NO contiene un valor μ₀, entonces rechazas H₀: μ = μ₀ al nivel α = 5 % (test bilateral). El IC te da MÁS información: no solo si rechazas, sino el rango de valores plausibles.</p>
              <p className={styles.faqTip}>💡 Por eso muchos estadísticos prefieren reportar IC en vez de p-valores: comunica más y se interpreta peor.</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo construir un intervalo de confianza paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Calcula la media muestral X̄ y la desviación s</strong>
                <p>Suma los valores y divide por n para X̄. Para s, usa la fórmula con n − 1 en el denominador (varianza muestral, no poblacional).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Decide el nivel de confianza</strong>
                <p>95 % es el estándar en la mayoría de contextos. Para medicina/ingeniería crítica, 99 %. Para exploración rápida, 90 % puede valer. Justifica la elección antes de ver los datos.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Encuentra el valor crítico (z* o t*)</strong>
                <p>Si σ es conocido: z* (1,96 para 95 %). Si σ es desconocido (caso habitual): t* con n − 1 grados de libertad. Para n ≥ 30 dan prácticamente lo mismo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula el margen de error: crítico · s/√n</strong>
                <p>El error estándar s/√n es la &quot;desviación de X̄&quot;. Multiplicado por el crítico, da cuánto debes sumar y restar a X̄ para obtener el intervalo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Construye el IC e interpreta</strong>
                <p>IC = [X̄ − margen ; X̄ + margen]. Interpreta así: &quot;si repitiéramos el muestreo muchas veces, el 95 % de los intervalos construidos con este procedimiento contendrían la media verdadera μ&quot;. NO digas &quot;hay 95 % de probabilidad de que μ esté aquí&quot;: μ es fija, no probabilística.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 buenas prácticas con intervalos de confianza</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <strong>Reporta SIEMPRE el IC junto al estimador</strong>
              <p>Una media sin su IC es información incompleta: no se puede juzgar la incertidumbre. &quot;15 ± 3 al 95 % CI&quot; vale infinitamente más que &quot;15&quot;.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Elige n antes, no después</strong>
              <p>Decide el tamaño muestral en el diseño del estudio, basándote en la precisión que necesitas. Subir n después de ver los datos para &quot;empujar la significancia&quot; es mala práctica (p-hacking).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <strong>Usa siempre t cuando estimes σ con la muestra</strong>
              <p>Aunque para n grande t ≈ z, usar t por defecto es más conservador y matemáticamente correcto. No supone esfuerzo extra y evita errores en n pequeño.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Verifica los supuestos antes</strong>
              <p>Los IC para μ asumen muestreo aleatorio simple (independencia). Si tu muestra es por conveniencia o tiene clusters, el IC nominal será optimista. Considera bootstrap o IC robustos.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes con intervalos de confianza</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Decir &quot;μ tiene 95 % de probabilidad de estar en el IC&quot;</strong> — Es el error universal. μ es fijo (aunque desconocido); el IC es lo aleatorio. La confianza es del procedimiento, no del intervalo concreto.</li>
            <li><strong>Confundir s con σ</strong> — s es la desviación de la muestra (estimador), σ es la poblacional (parámetro). En la fórmula del IC va s/√n cuando estimas σ con la muestra; va σ/√n solo si σ es realmente conocida (raro fuera de simulaciones).</li>
            <li><strong>Usar z en muestras pequeñas con σ desconocido</strong> — Para n &lt; 30, usar z subestima la anchura del IC (te da intervalos demasiado optimistas). Usa t y será correcto.</li>
            <li><strong>Comparar dos medias mirando si los IC se solapan</strong> — Aunque dos IC se solapen un poco, las medias pueden ser significativamente distintas. Para comparar, calcula el IC de la <em>diferencia</em> de medias, no comparas IC individuales.</li>
            <li><strong>Aumentar n hasta que el IC excluya un valor concreto</strong> — Es p-hacking en versión IC. Si decides n basándote en lo que ves, las garantías nominales del 95 % dejan de ser válidas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-intervalos-confianza')} />
      <ShareCard appName="simulador-intervalos-confianza" />
      <Footer appName="simulador-intervalos-confianza" />
    </div>
  );
}
