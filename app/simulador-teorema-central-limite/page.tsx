'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorTeoremaCentralLimite.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type DistId = 'uniforme' | 'exponencial' | 'bernoulli_05' | 'bernoulli_09' | 'bimodal';

interface DistribucionDef {
  id: DistId;
  nombre: string;
  icono: string;
  meta: string;
  descripcion: string;
  mu: number;
  sigma: number;
  // Soporte de visualización (rango de la población)
  xMin: number;
  xMax: number;
  // Generador de una muestra individual de la población
  sample: () => number;
  // PDF/PMF teórica para dibujar la población (densidad o probabilidad)
  // Devuelve altura relativa para visualizar; para discretas se discretizan los bins
  esDiscreta: boolean;
  pdfTeorica: (x: number) => number;
}

// ============================================
// GENERADORES DE MUESTRAS
// ============================================

// Bernoulli con prob p
function sampleBernoulli(p: number): number {
  return Math.random() < p ? 1 : 0;
}

// Exponencial con tasa λ=1 (media=1, sigma=1)
function sampleExponencial(): number {
  // Inversa: -ln(U)
  const u = Math.random();
  return -Math.log(u || 1e-12);
}

// Bimodal: mezcla 0.5 N(-2,0.6) + 0.5 N(2,0.6)
function sampleBimodal(): number {
  // Box-Muller para normal estándar
  let u1 = Math.random();
  let u2 = Math.random();
  if (u1 < 1e-12) u1 = 1e-12;
  if (u2 < 1e-12) u2 = 1e-12;
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const sigma = 0.6;
  if (Math.random() < 0.5) {
    return -2 + sigma * z;
  } else {
    return 2 + sigma * z;
  }
}

// Uniforme [0, 10]
function sampleUniforme(): number {
  return Math.random() * 10;
}

// ============================================
// CATÁLOGO DE DISTRIBUCIONES
// ============================================
const DISTRIBUCIONES: Record<DistId, DistribucionDef> = {
  uniforme: {
    id: 'uniforme',
    nombre: 'Uniforme [0, 10]',
    icono: '▭',
    meta: 'μ = 5 · σ ≈ 2,89',
    descripcion: 'Cada valor entre 0 y 10 es igualmente probable. Forma plana, totalmente NO normal.',
    mu: 5,
    sigma: Math.sqrt(100 / 12), // ≈ 2.887
    xMin: -1,
    xMax: 11,
    sample: sampleUniforme,
    esDiscreta: false,
    pdfTeorica: (x) => (x >= 0 && x <= 10 ? 1 / 10 : 0),
  },
  exponencial: {
    id: 'exponencial',
    nombre: 'Exponencial λ=1',
    icono: '📉',
    meta: 'μ = 1 · σ = 1',
    descripcion: 'Tiempos de espera: muchos valores pequeños y una cola larga hacia la derecha. Muy asimétrica.',
    mu: 1,
    sigma: 1,
    xMin: 0,
    xMax: 6,
    sample: sampleExponencial,
    esDiscreta: false,
    pdfTeorica: (x) => (x >= 0 ? Math.exp(-x) : 0),
  },
  bernoulli_05: {
    id: 'bernoulli_05',
    nombre: 'Moneda justa (p=0,5)',
    icono: '🪙',
    meta: 'μ = 0,5 · σ = 0,5',
    descripcion: 'Solo dos valores posibles: 0 o 1, cada uno con probabilidad 0,5. Discreta.',
    mu: 0.5,
    sigma: 0.5,
    xMin: -0.3,
    xMax: 1.3,
    sample: () => sampleBernoulli(0.5),
    esDiscreta: true,
    pdfTeorica: (x) => {
      // Devolver "altura" para los bins centrados en 0 y 1
      if (Math.abs(x - 0) < 0.05) return 0.5;
      if (Math.abs(x - 1) < 0.05) return 0.5;
      return 0;
    },
  },
  bernoulli_09: {
    id: 'bernoulli_09',
    nombre: 'Moneda sesgada (p=0,9)',
    icono: '🎯',
    meta: 'μ = 0,9 · σ = 0,3',
    descripcion: 'Bernoulli muy asimétrica: 90% sale 1, 10% sale 0. La normal tarda más en aparecer aquí.',
    mu: 0.9,
    sigma: Math.sqrt(0.09),
    xMin: -0.3,
    xMax: 1.3,
    sample: () => sampleBernoulli(0.9),
    esDiscreta: true,
    pdfTeorica: (x) => {
      if (Math.abs(x - 0) < 0.05) return 0.1;
      if (Math.abs(x - 1) < 0.05) return 0.9;
      return 0;
    },
  },
  bimodal: {
    id: 'bimodal',
    nombre: 'Bimodal (dos picos)',
    icono: '🐫',
    meta: 'μ = 0 · σ ≈ 2,09',
    descripcion: 'Dos campanas: una en −2 y otra en +2. Histograma con doble joroba, claramente NO normal.',
    mu: 0,
    sigma: Math.sqrt(4 + 0.36), // mezcla 50/50 N(-2,0.6) y N(2,0.6) → var = 0.6² + (2)² = 4.36
    xMin: -5,
    xMax: 5,
    sample: sampleBimodal,
    esDiscreta: false,
    pdfTeorica: (x) => {
      const sigma = 0.6;
      const norm = (mu: number, s: number) => (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / s, 2));
      return 0.5 * norm(-2, sigma) + 0.5 * norm(2, sigma);
    },
  },
};

const DIST_IDS: DistId[] = ['uniforme', 'exponencial', 'bernoulli_05', 'bernoulli_09', 'bimodal'];

// Tamaños muestrales y números de muestras disponibles
const N_VALORES = [1, 2, 5, 10, 30, 100];
const NUM_MUESTRAS_VALORES = [100, 500, 1000, 5000];

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 3): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

function generarMuestras(dist: DistribucionDef, n: number, numMuestras: number): number[] {
  const medias: number[] = [];
  for (let i = 0; i < numMuestras; i++) {
    let suma = 0;
    for (let j = 0; j < n; j++) {
      suma += dist.sample();
    }
    medias.push(suma / n);
  }
  return medias;
}

function calcularEstadisticos(datos: number[]): { media: number; sigma: number; skew: number; kurt: number } {
  if (datos.length === 0) return { media: 0, sigma: 0, skew: 0, kurt: 0 };
  const n = datos.length;
  const media = datos.reduce((a, b) => a + b, 0) / n;
  let sum2 = 0, sum3 = 0, sum4 = 0;
  for (const x of datos) {
    const d = x - media;
    const d2 = d * d;
    sum2 += d2;
    sum3 += d2 * d;
    sum4 += d2 * d2;
  }
  const varianza = sum2 / n;
  const sigma = Math.sqrt(varianza);
  const skew = sigma > 0 ? (sum3 / n) / Math.pow(sigma, 3) : 0;
  const kurt = sigma > 0 ? (sum4 / n) / Math.pow(sigma, 4) : 0;
  return { media, sigma, skew, kurt };
}

// PDF de N(mu, sigma) para superponer
function pdfNormal(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const z = (x - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorTeoremaCentralLimitePage() {
  const [distId, setDistId] = useState<DistId>('exponencial');
  const [n, setN] = useState(30);
  const [numMuestras, setNumMuestras] = useState(1000);
  const [superponerNormal, setSuperponerNormal] = useState(true);
  const [medias, setMedias] = useState<number[]>([]);
  const [animando, setAnimando] = useState(false);

  const canvasPobRef = useRef<HTMLCanvasElement>(null);
  const canvasMedRef = useRef<HTMLCanvasElement>(null);
  const animacionRef = useRef<number | null>(null);

  const dist = DISTRIBUCIONES[distId];

  // Resetear medias al cambiar parámetros
  useEffect(() => {
    setMedias([]);
    if (animacionRef.current !== null) {
      cancelAnimationFrame(animacionRef.current);
      animacionRef.current = null;
      setAnimando(false);
    }
  }, [distId, n, numMuestras]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (animacionRef.current !== null) {
        cancelAnimationFrame(animacionRef.current);
      }
    };
  }, []);

  const lanzar = useCallback(() => {
    if (animando) return;
    setMedias([]);
    setAnimando(true);

    const FRAMES = 40;
    const chunkSize = Math.max(1, Math.floor(numMuestras / FRAMES));
    let acumulado: number[] = [];
    let frame = 0;

    const tick = () => {
      const restante = numMuestras - acumulado.length;
      const cuanto = Math.min(chunkSize, restante);
      const lote = generarMuestras(dist, n, cuanto);
      acumulado = acumulado.concat(lote);
      setMedias([...acumulado]);
      frame++;

      if (acumulado.length < numMuestras) {
        animacionRef.current = requestAnimationFrame(tick);
      } else {
        animacionRef.current = null;
        setAnimando(false);
      }
    };

    animacionRef.current = requestAnimationFrame(tick);
  }, [dist, n, numMuestras, animando]);

  const reset = useCallback(() => {
    if (animacionRef.current !== null) {
      cancelAnimationFrame(animacionRef.current);
      animacionRef.current = null;
    }
    setMedias([]);
    setAnimando(false);
  }, []);

  const estadisticos = useMemo(() => calcularEstadisticos(medias), [medias]);
  const sigmaTeorico = useMemo(() => dist.sigma / Math.sqrt(n), [dist.sigma, n]);

  // ============================================
  // DIBUJO POBLACIÓN
  // ============================================
  const dibujarPoblacion = useCallback(() => {
    const canvas = canvasPobRef.current;
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
    const pad = { top: 8, right: 12, bottom: 22, left: 12 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorCurve = '#48A9A6';
    const colorFill = 'rgba(72, 169, 166, 0.25)';
    const colorMu = '#E07A1F';

    ctx.clearRect(0, 0, W, H);

    const xToPx = (x: number) => pad.left + ((x - dist.xMin) / (dist.xMax - dist.xMin)) * plotW;

    // Calcular yMax muestreando la PDF
    let yMaxLocal = 0;
    const Ns = 200;
    for (let i = 0; i <= Ns; i++) {
      const xv = dist.xMin + (dist.xMax - dist.xMin) * (i / Ns);
      yMaxLocal = Math.max(yMaxLocal, dist.pdfTeorica(xv));
    }
    if (yMaxLocal === 0) yMaxLocal = 1;
    const yMax = yMaxLocal * 1.15;
    const yToPx = (y: number) => pad.top + plotH - (y / yMax) * plotH;

    // Eje X
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Marcas
    ctx.fillStyle = colorText;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const xv = dist.xMin + (dist.xMax - dist.xMin) * (i / ticks);
      ctx.fillText(fmt(xv, 1), xToPx(xv), pad.top + plotH + 14);
    }

    if (dist.esDiscreta) {
      // Barras para discreta (bins centrados en 0 y 1)
      const valores = [0, 1];
      for (const v of valores) {
        const altura = dist.pdfTeorica(v);
        if (altura > 0) {
          const barW = 30;
          const px = xToPx(v);
          ctx.fillStyle = colorFill;
          ctx.strokeStyle = colorCurve;
          ctx.lineWidth = 2;
          ctx.fillRect(px - barW / 2, yToPx(altura), barW, plotH - (yToPx(altura) - pad.top));
          ctx.strokeRect(px - barW / 2, yToPx(altura), barW, plotH - (yToPx(altura) - pad.top));

          ctx.fillStyle = colorText;
          ctx.font = '11px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(fmt(altura, 2), px, yToPx(altura) - 4);
        }
      }
    } else {
      // Curva continua
      ctx.fillStyle = colorFill;
      ctx.beginPath();
      ctx.moveTo(xToPx(dist.xMin), pad.top + plotH);
      for (let i = 0; i <= Ns; i++) {
        const xv = dist.xMin + (dist.xMax - dist.xMin) * (i / Ns);
        ctx.lineTo(xToPx(xv), yToPx(dist.pdfTeorica(xv)));
      }
      ctx.lineTo(xToPx(dist.xMax), pad.top + plotH);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = colorCurve;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= Ns; i++) {
        const xv = dist.xMin + (dist.xMax - dist.xMin) * (i / Ns);
        const px = xToPx(xv);
        const py = yToPx(dist.pdfTeorica(xv));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Línea vertical en μ
    ctx.strokeStyle = colorMu;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(xToPx(dist.mu), pad.top);
    ctx.lineTo(xToPx(dist.mu), pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colorMu;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`μ = ${fmt(dist.mu, 2)}`, xToPx(dist.mu) + 4, pad.top + 12);
  }, [dist]);

  // ============================================
  // DIBUJO HISTOGRAMA DE MEDIAS
  // ============================================
  const dibujarMedias = useCallback(() => {
    const canvas = canvasMedRef.current;
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
    const pad = { top: 16, right: 16, bottom: 32, left: 40 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorBar = '#2E86AB';
    const colorBarBorder = isDark ? '#1F5F7E' : '#1F5F7E';
    const colorNormal = '#E07A1F';
    const colorMu = '#48A9A6';

    ctx.clearRect(0, 0, W, H);

    // Rango del eje X: dependerá de mu y σ/√n
    // Centrar en mu, ancho 4*σ/√n a cada lado, salvo n=1 que usa todo el rango original
    const halfWidth = n === 1 ? (dist.xMax - dist.xMin) / 2 : Math.max(4 * sigmaTeorico, 0.2);
    const xMin = dist.mu - halfWidth;
    const xMax = dist.mu + halfWidth;

    // Construir histograma
    const NUM_BINS = 40;
    const binWidth = (xMax - xMin) / NUM_BINS;
    const counts = new Array(NUM_BINS).fill(0);
    let totalEnRango = 0;
    for (const m of medias) {
      if (m < xMin || m > xMax) continue;
      const idx = Math.min(NUM_BINS - 1, Math.max(0, Math.floor((m - xMin) / binWidth)));
      counts[idx]++;
      totalEnRango++;
    }

    // Convertir a densidad: count / (totalTotal * binWidth) para que área = fracción dentro del rango ≈ 1
    const totalAll = medias.length || 1;
    const densidad = counts.map((c) => c / (totalAll * binWidth));

    // y máximo: la densidad máxima del histograma o de la normal teórica
    let yMaxLocal = Math.max(...densidad, 0.01);
    if (superponerNormal && sigmaTeorico > 0) {
      const pdfPico = pdfNormal(dist.mu, dist.mu, sigmaTeorico);
      yMaxLocal = Math.max(yMaxLocal, pdfPico);
    }
    const yMax = yMaxLocal * 1.15;

    const xToPx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const yToPx = (y: number) => pad.top + plotH - (y / yMax) * plotH;

    // Eje X
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Eje Y
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.stroke();

    // Marcas eje X
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    const ticksX = 6;
    for (let i = 0; i <= ticksX; i++) {
      const xv = xMin + (xMax - xMin) * (i / ticksX);
      ctx.fillText(fmt(xv, 2), xToPx(xv), pad.top + plotH + 16);
    }

    // Histograma
    for (let i = 0; i < NUM_BINS; i++) {
      const x0 = xMin + i * binWidth;
      const x1 = x0 + binWidth;
      const altura = densidad[i];
      if (altura <= 0) continue;
      const px0 = xToPx(x0);
      const px1 = xToPx(x1);
      const py = yToPx(altura);
      ctx.fillStyle = colorBar;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(px0 + 1, py, px1 - px0 - 1, pad.top + plotH - py);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colorBarBorder;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(px0 + 1, py, px1 - px0 - 1, pad.top + plotH - py);
    }

    // Curva normal teórica superpuesta
    if (superponerNormal && sigmaTeorico > 0) {
      ctx.strokeStyle = colorNormal;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const Ncurve = 250;
      for (let i = 0; i <= Ncurve; i++) {
        const xv = xMin + (xMax - xMin) * (i / Ncurve);
        const py = yToPx(pdfNormal(xv, dist.mu, sigmaTeorico));
        const px = xToPx(xv);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Etiqueta
      ctx.fillStyle = colorNormal;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`N(${fmt(dist.mu, 2)}, ${fmt(sigmaTeorico, 3)}) teórica`, pad.left + 8, pad.top + 14);
    }

    // Línea vertical en μ poblacional
    ctx.strokeStyle = colorMu;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(xToPx(dist.mu), pad.top);
    ctx.lineTo(xToPx(dist.mu), pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mensaje si vacío
    if (medias.length === 0) {
      ctx.fillStyle = colorText;
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.7;
      ctx.fillText('▶ Pulsa "Lanzar simulación" para ver las medias muestrales', W / 2, H / 2);
      ctx.globalAlpha = 1;
    }

    // Excluidos del rango
    const fueraDeRango = medias.length - totalEnRango;
    if (fueraDeRango > 0) {
      ctx.fillStyle = colorText;
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`(${fueraDeRango} medias fuera del rango visible)`, W - pad.right, pad.top + 12);
    }
  }, [medias, dist, n, sigmaTeorico, superponerNormal]);

  useEffect(() => { dibujarPoblacion(); }, [dibujarPoblacion]);
  useEffect(() => { dibujarMedias(); }, [dibujarMedias]);

  useEffect(() => {
    const handleResize = () => {
      dibujarPoblacion();
      dibujarMedias();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujarPoblacion, dibujarMedias]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      dibujarPoblacion();
      dibujarMedias();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [dibujarPoblacion, dibujarMedias]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎲 Simulador del Teorema Central del Límite</h1>
        <p className={styles.subtitle}>
          Lanza muestras de distribuciones muy distintas y mira cómo, al promediar,
          <strong> emerge siempre la curva normal</strong>. Es la magia que sostiene buena parte de la estadística.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR DE DISTRIBUCIÓN */}
      <div className={styles.distSelector}>
        {DIST_IDS.map(id => {
          const d = DISTRIBUCIONES[id];
          return (
            <button
              key={id}
              className={`${styles.distBtn} ${distId === id ? styles.distBtnActive : ''}`}
              onClick={() => setDistId(id)}
              aria-pressed={distId === id}
            >
              <span className={styles.distIcon}>{d.icono}</span>
              <span className={styles.distName}>{d.nombre}</span>
              <span className={styles.distMeta}>{d.meta}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        <p className={styles.descriptionCard}>{dist.descripcion}</p>

        {/* CONTROLES */}
        <div className={styles.controls}>
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
                Número de muestras (<strong>{numMuestras}</strong>)
              </label>
              <div className={styles.discreteSteps} role="group" aria-label="Número de muestras">
                {NUM_MUESTRAS_VALORES.map(v => (
                  <button
                    key={v}
                    className={`${styles.stepBtn} ${numMuestras === v ? styles.stepBtnActive : ''}`}
                    onClick={() => setNumMuestras(v)}
                    aria-pressed={numMuestras === v}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={superponerNormal}
              onChange={e => setSuperponerNormal(e.target.checked)}
            />
            <span>Superponer N(μ, σ/√n) teórica para comparar</span>
          </label>

          <div className={styles.actions}>
            <button className={styles.runBtn} onClick={lanzar} disabled={animando}>
              {animando ? '⏳ Generando muestras...' : '▶ Lanzar simulación'}
            </button>
            <button className={styles.resetBtn} onClick={reset}>
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* CANVAS POBLACIÓN */}
        <div className={styles.canvasWrapper}>
          <div className={styles.canvasLabel}>📐 Distribución poblacional teórica</div>
          <canvas ref={canvasPobRef} className={styles.canvasPoblacion} aria-label="Distribución poblacional teórica" />
        </div>

        {/* CANVAS HISTOGRAMA MEDIAS */}
        <div className={styles.canvasWrapper}>
          <div className={styles.canvasLabel}>📊 Distribución de la media muestral X̄</div>
          <canvas ref={canvasMedRef} className={styles.canvasMedias} aria-label="Histograma de las medias muestrales" />
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel}>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Muestras generadas</span>
            <span className={styles.resultValue}>{medias.length}</span>
            <span className={styles.resultRange}>de {numMuestras} previstas</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Media empírica X̄</span>
            <span className={styles.resultValue}>{medias.length ? fmt(estadisticos.media, 4) : '—'}</span>
            <span className={styles.resultRange}>μ teórica = {fmt(dist.mu, 3)}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>σ empírica</span>
            <span className={styles.resultValue}>{medias.length ? fmt(estadisticos.sigma, 4) : '—'}</span>
            <span className={styles.resultRange}>σ/√n teórica = {fmt(sigmaTeorico, 4)}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Asimetría (skew)</span>
            <span className={styles.resultValue}>{medias.length ? fmt(estadisticos.skew, 3) : '—'}</span>
            <span className={styles.resultRange}>Normal: 0</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Curtosis</span>
            <span className={styles.resultValue}>{medias.length ? fmt(estadisticos.kurt, 3) : '—'}</span>
            <span className={styles.resultRange}>Normal: 3</span>
          </div>
        </div>

        {medias.length >= numMuestras && numMuestras > 0 && (
          <div className={styles.statusBar}>
            ✅ Simulación completa con n = {n}. Cuanto mayor es n, más se parecen los estadísticos a los teóricos.
          </div>
        )}
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende el Teorema Central del Límite"
        subtitle="Por qué la curva normal aparece en todas partes"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué dice el Teorema Central del Límite?</h3>
          <p>
            El <strong>Teorema Central del Límite</strong> (TCL) afirma algo casi mágico: si tomas muestras
            independientes de una población —da igual su forma original— y promedias cada muestra,
            la <em>distribución de esas medias muestrales</em> tiende a una normal a medida que el tamaño
            muestral n crece. Es la razón última de por qué la campana de Gauss aparece en tantísimos contextos.
          </p>
          <div className={styles.formulaBox}>
            X̄<sub>n</sub> ⟶<sub>d</sub> N(μ, σ/√n) cuando n → ∞
          </div>
          <ul className={styles.bulletList}>
            <li>La <strong>media</strong> de la distribución de X̄ es siempre μ (la media poblacional).</li>
            <li>La <strong>desviación</strong> de X̄ es σ/√n: cuanto mayor es la muestra, menor es la dispersión.</li>
            <li>La <strong>forma</strong> de X̄ se hace cada vez más normal, sea cual sea la población original.</li>
          </ul>
          <p>
            En este simulador puedes verificarlo en directo: prueba la <em>exponencial</em> (muy asimétrica)
            con n = 1 y verás la cola larga típica; sube a n = 30 y la distribución de medias se vuelve
            indistinguible de una normal centrada en 1.
          </p>
        </section>

        {/* TABLA */}
        <section>
          <h3>El TCL en la vida real: 6 ejemplos cotidianos</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Contexto</th>
                  <th>Variable individual</th>
                  <th>Variable agregada (normal por TCL)</th>
                  <th>Aplicación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Encuestas electorales</td>
                  <td>Voto de una persona (0/1)</td>
                  <td>% de voto sobre n = 1000 personas</td>
                  <td>Margen de error ≈ ±3 %</td>
                </tr>
                <tr>
                  <td>Control de calidad</td>
                  <td>Diámetro de un tornillo</td>
                  <td>Media de 30 tornillos por lote</td>
                  <td>Cartas de control Six Sigma</td>
                </tr>
                <tr>
                  <td>Investigación clínica</td>
                  <td>Respuesta de un paciente</td>
                  <td>Media de mejora en n pacientes</td>
                  <td>Comparar tratamiento vs placebo</td>
                </tr>
                <tr>
                  <td>Finanzas</td>
                  <td>Rentabilidad diaria de una acción</td>
                  <td>Rentabilidad media anual</td>
                  <td>VaR y modelos de riesgo</td>
                </tr>
                <tr>
                  <td>Medición física</td>
                  <td>Una lectura individual ruidosa</td>
                  <td>Media de 100 lecturas</td>
                  <td>Reducir error de medida</td>
                </tr>
                <tr>
                  <td>Educación</td>
                  <td>Nota de un alumno en EBAU</td>
                  <td>Nota media por centro</td>
                  <td>Rankings y comparaciones</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios donde el TCL es la base de todo</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📊</span>
              <strong>Encuestas y muestreo</strong>
              <p>El margen de error de las encuestas (&quot;±3 %, 95 % de confianza&quot;) sale directamente del TCL: sin él, no podríamos inferir nada sobre la población a partir de unos cientos de personas.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🏭</span>
              <strong>Control estadístico de procesos</strong>
              <p>Las cartas X̄-R del control de calidad asumen que la media de los lotes es normal. Sin el TCL, no podrías detectar desviaciones del proceso con muestras pequeñas.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🧪</span>
              <strong>Intervalos de confianza para μ</strong>
              <p>X̄ ± 1,96·σ/√n es el intervalo al 95 %. La forma normal de X̄ (gracias al TCL) hace que ese 1,96 sea válido aunque la población no sea normal, si n es razonablemente grande.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🎲</span>
              <strong>Simulación Monte Carlo</strong>
              <p>Para estimar magnitudes complicadas (precio de una opción financiera, integrales sin solución analítica), simulamos N veces y promediamos. El TCL nos dice cuán precisa es esa estimación.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre el TCL</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué tamaño muestral n hace falta?</h4>
              <p>La regla práctica es <strong>n ≥ 30</strong>. Pero depende de cuán asimétrica sea la población original: si es casi simétrica, con n = 5 ya basta; si es muy sesgada (Bernoulli con p = 0,99 o exponencial), puede hacer falta n = 100 o más.</p>
              <p className={styles.faqTip}>💡 En el simulador, prueba la Bernoulli (p=0,9) con n = 5 (asimétrico) y luego con n = 100 (casi normal). Verás la diferencia.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿El TCL convierte una variable en normal?</h4>
              <p>NO. El TCL no toca la distribución original: una exponencial sigue siendo exponencial. Lo que se vuelve normal es la <strong>distribución de las medias muestrales</strong> X̄, calculadas sobre muchas muestras.</p>
              <p className={styles.faqTip}>💡 En el simulador, mira los dos paneles: arriba la población (que no cambia), abajo la distribución de medias (que sí evoluciona con n).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Y si la población no tiene varianza finita?</h4>
              <p>Entonces el TCL clásico <strong>NO se cumple</strong>. La distribución de Cauchy es el ejemplo: por mucho que aumentes n, la media muestral sigue distribución Cauchy, no normal. Por suerte, casi todas las variables &quot;reales&quot; tienen varianza finita.</p>
              <p className={styles.faqTip}>💡 Eventos extremos (terremotos, virales, ingresos top 1 %) tienen colas tan pesadas que el TCL puede tardar mucho en aplicarse o no hacerlo.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Diferencia entre TCL y Ley de los Grandes Números?</h4>
              <p>La <strong>LGN</strong> dice que X̄ converge a μ (la media muestral se acerca a la poblacional). El <strong>TCL</strong> es más fino: dice <em>cómo</em> se acerca, con qué forma de distribución y a qué velocidad (σ/√n). Sin el TCL no podríamos calcular intervalos de confianza ni p-valores.</p>
              <p className={styles.faqTip}>💡 LGN responde &quot;¿a dónde va X̄?&quot;. TCL responde &quot;¿cómo se distribuye X̄ alrededor de ahí?&quot;.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Vale para sumas además de medias?</h4>
              <p>Sí. Si la media converge a N(μ, σ/√n), la suma converge a N(n·μ, σ·√n). De hecho, fue así como se demostró históricamente. La regla general: cualquier <strong>combinación lineal de muchas variables independientes</strong> tiende a la normal.</p>
              <p className={styles.faqTip}>💡 Por eso la distribución binomial B(n, p) se aproxima por una N(np, √(np(1−p))) cuando n es grande: una binomial es la suma de n Bernoulli.</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo aplicar el TCL paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica la variable individual y sus parámetros</strong>
                <p>¿Qué medimos en cada observación? ¿Cuál es su media μ y su desviación σ poblacionales (o estimadas)? Anótalo: el TCL trabaja sobre estos dos números.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Decide el tamaño muestral n</strong>
                <p>Si la población es casi simétrica, n ≥ 30 sobra. Si es muy asimétrica (exponencial, lognormal, ingresos), apunta a n ≥ 100. Si es Bernoulli con p extremo, comprueba np y n(1−p) ambos &gt; 10.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Calcula la desviación de X̄: σ/√n</strong>
                <p>Esta es la <em>desviación típica del estimador</em>, también llamada <strong>error estándar de la media</strong>. Es el número que te dice cuán precisa es tu estimación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Construye el intervalo de confianza</strong>
                <p>Al 95 %: X̄ ± 1,96 · σ/√n. Al 99 %: X̄ ± 2,576 · σ/√n. Si σ es desconocida y n es pequeño (n &lt; 30), usa la t de Student en lugar de la normal.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Interpreta en el contexto del problema</strong>
                <p>&quot;Estamos un 95 % seguros de que la nota media de la promoción está entre 6,2 y 6,8&quot;. No es una probabilidad sobre μ —que es fija—, sino sobre el procedimiento.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 buenas prácticas con el TCL</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <strong>Mira siempre la asimetría antes</strong>
              <p>Si tu población tiene skew muy alto (datos económicos, tiempos de espera), no apliques el TCL con n = 30 sin más. Aumenta n o usa métodos robustos (bootstrap, mediana).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <strong>Recuerda: dividir por √n, no por n</strong>
              <p>Para reducir el error a la mitad necesitas <em>cuadruplicar</em> la muestra. Esta es la ley de los retornos decrecientes en muestreo: el coste por unidad de precisión es cada vez mayor.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔬</span>
              <strong>Si σ es desconocida, usa la t de Student</strong>
              <p>Cuando estimas σ con la muestra (s) y n &lt; 30, los cuantiles de la normal se quedan cortos. La t corrige esa incertidumbre extra. A partir de n = 30, t ≈ z y da igual cuál uses.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Simula antes de calcular</strong>
              <p>Antes de aplicar fórmulas, lanza una simulación Monte Carlo como esta. Si el TCL no se nota con tu n y tu población, las fórmulas tampoco te darán intervalos válidos.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes con el TCL</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir distribución poblacional con muestral</strong> — La población NO se vuelve normal. Lo que se vuelve normal es la distribución de las medias X̄ a través de muchas muestras. Son dos objetos distintos.</li>
            <li><strong>Creer que n = 30 es mágico</strong> — Es solo una regla práctica. Con poblaciones casi simétricas n = 5 ya basta; con muy asimétricas hace falta n = 100 o más. Mira siempre el skew de tu población.</li>
            <li><strong>Aplicar TCL a poblaciones con varianza infinita</strong> — La distribución de Cauchy y otras con colas pesadas violan las hipótesis del TCL. Ningún tamaño muestral te va a salvar: la media muestral nunca se distribuirá normalmente.</li>
            <li><strong>Olvidar dividir por √n</strong> — La σ de X̄ NO es σ, es σ/√n. Confundir las dos es el error que infla los intervalos de confianza por un factor enorme y arruina cualquier inferencia.</li>
            <li><strong>Aplicar TCL a la varianza muestral</strong> — El TCL clásico es para medias. La varianza muestral sigue una χ² escalada, NO una normal. Para inferir sobre σ se usan otros teoremas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-teorema-central-limite')} />
      <ShareCard appName="simulador-teorema-central-limite" />
      <Footer appName="simulador-teorema-central-limite" />
    </div>
  );
}
