'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorCineticaArrhenius.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// CONSTANTES
// ============================================
const R = 8.314; // J/(mol·K)

// ============================================
// REACCIONES PREDEFINIDAS
// Valores típicos de Ea (kJ/mol) y A (1/s o 1/(M·s)) reales
// ============================================
interface Reaccion {
  id: string;
  nombre: string;
  icono: string;
  ea: number;       // kJ/mol
  a: number;        // factor pre-exponencial (en escala logarítmica: ln A o A directo)
  unidadA: string;  // texto descriptivo de unidades
  notasClave: string;
}

const REACCIONES: Reaccion[] = [
  {
    id: 'h2o2',
    nombre: 'Descomposición H₂O₂',
    icono: '💧',
    ea: 75,
    a: 1.4e10,
    unidadA: 's⁻¹',
    notasClave: '2 H₂O₂ → 2 H₂O + O₂. Reacción de 1.er orden. La catalasa baja Ea de 75 a 23 kJ/mol.',
  },
  {
    id: 'sacarosa',
    nombre: 'Hidrólisis sacarosa',
    icono: '🍬',
    ea: 108,
    a: 6.0e15,
    unidadA: 's⁻¹',
    notasClave: 'C₁₂H₂₂O₁₁ + H₂O → glucosa + fructosa. Acelerada por ácidos o sacarasa (enzima).',
  },
  {
    id: 'hi',
    nombre: 'Formación de HI',
    icono: '🧪',
    ea: 167,
    a: 1.6e11,
    unidadA: 'L/(mol·s)',
    notasClave: 'H₂ + I₂ → 2 HI. Reacción de 2.º orden, clásica en cinética. Estudiada desde 1894.',
  },
  {
    id: 'proteinas',
    nombre: 'Desnaturalización proteínas',
    icono: '🥚',
    ea: 250,
    a: 1.0e35,
    unidadA: 's⁻¹',
    notasClave: 'Ea muy alta: por eso es necesaria una T elevada (cocción) para que ocurra rápido.',
  },
  {
    id: 'isomerizacion',
    nombre: 'Isomerización ciclopropano',
    icono: '⚛️',
    ea: 272,
    a: 1.0e15,
    unidadA: 's⁻¹',
    notasClave: 'C₃H₆ (ciclo) → C₃H₆ (propeno). Ea altísima: prácticamente no ocurre por debajo de 700 K.',
  },
];

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 3): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

// Notación científica española
function fmtCientifico(n: number, decimales = 2): string {
  if (!isFinite(n)) return '∞';
  if (n === 0) return '0';
  if (Math.abs(n) >= 0.001 && Math.abs(n) < 10000) {
    return fmt(n, decimales);
  }
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mantisa = n / Math.pow(10, exp);
  return `${fmt(mantisa, decimales)} × 10^${exp}`;
}

// Constante de velocidad k(T) según Arrhenius
function kArrhenius(eaKJ: number, A: number, T: number): number {
  const eaJ = eaKJ * 1000;
  return A * Math.exp(-eaJ / (R * T));
}

// Distribución de Maxwell-Boltzmann de energías cinéticas (3D)
// f(E) dE = (2/√π) · (1/(kT))^(3/2) · √E · exp(-E/(kT)) dE
// Aquí trabajamos por mol: usar RT en J/mol
function pdfMaxwellBoltzmann(eJoulesPorMol: number, T: number): number {
  const RT = R * T;
  if (eJoulesPorMol < 0) return 0;
  return (2 / Math.sqrt(Math.PI)) * Math.pow(1 / RT, 1.5) * Math.sqrt(eJoulesPorMol) * Math.exp(-eJoulesPorMol / RT);
}

// Fracción de moléculas con E ≥ Ea (calculada vía la fórmula simplificada exp(-Ea/RT))
// (Aproximación cuando Ea >> RT, lo habitual en química)
function fraccionReactiva(eaKJ: number, T: number): number {
  return Math.exp(-(eaKJ * 1000) / (R * T));
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorCineticaArrheniusPage() {
  const [reaccionId, setReaccionId] = useState<string>('h2o2');
  const [ea, setEa] = useState(75); // kJ/mol
  const [logA, setLogA] = useState(10); // log10(A)
  const [T1, setT1] = useState(298); // K
  const [T2, setT2] = useState(338); // K (T1 + 40)
  const [comparar, setComparar] = useState(true);
  const [mostrarArrhenius, setMostrarArrhenius] = useState(true);

  const canvasMainRef = useRef<HTMLCanvasElement>(null);
  const canvasArrheniusRef = useRef<HTMLCanvasElement>(null);

  const reaccionActual = REACCIONES.find(r => r.id === reaccionId);

  // Cargar reacción seleccionada
  const cargarReaccion = useCallback((r: Reaccion) => {
    setReaccionId(r.id);
    setEa(r.ea);
    setLogA(Math.log10(r.a));
  }, []);

  // ============================================
  // CÁLCULOS
  // ============================================
  const A = useMemo(() => Math.pow(10, logA), [logA]);
  const k1 = useMemo(() => kArrhenius(ea, A, T1), [ea, A, T1]);
  const k2 = useMemo(() => kArrhenius(ea, A, T2), [ea, A, T2]);
  const f1 = useMemo(() => fraccionReactiva(ea, T1), [ea, T1]);
  const f2 = useMemo(() => fraccionReactiva(ea, T2), [ea, T2]);
  const factorAceleracion = useMemo(() => k2 / k1, [k1, k2]);
  const t12_1 = useMemo(() => Math.log(2) / k1, [k1]); // s
  const t12_2 = useMemo(() => Math.log(2) / k2, [k2]);

  // ============================================
  // DIBUJO MAXWELL-BOLTZMANN
  // ============================================
  const dibujarMB = useCallback(() => {
    const canvas = canvasMainRef.current;
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
    const pad = { top: 24, right: 24, bottom: 36, left: 50 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorGrid = isDark ? '#333' : '#EEE';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorT1 = '#2E86AB';
    const colorT1Fill = 'rgba(46, 134, 171, 0.15)';
    const colorT2 = '#E07A1F';
    const colorT2Fill = 'rgba(224, 122, 31, 0.15)';
    const colorEa = '#A82E68';
    const colorReactivasT1 = 'rgba(46, 134, 171, 0.55)';
    const colorReactivasT2 = 'rgba(224, 122, 31, 0.55)';

    ctx.clearRect(0, 0, W, H);

    // Rango: hasta 4-5 veces el pico de la T más alta
    const Tmax = comparar ? Math.max(T1, T2) : T1;
    const eMaxPlot = Math.max(ea * 1000 * 1.6, 5 * R * Tmax);
    const yPicoT1 = pdfMaxwellBoltzmann(R * T1 / 2, T1);
    const yPicoT2 = comparar ? pdfMaxwellBoltzmann(R * T2 / 2, T2) : 0;
    const yMax = Math.max(yPicoT1, yPicoT2) * 1.15;

    const xToPx = (e: number) => pad.left + (e / eMaxPlot) * plotW;
    const yToPx = (y: number) => pad.top + plotH - (y / yMax) * plotH;

    // Grid
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    const stepKJ = eMaxPlot / 1000 / 4;
    for (let i = 0; i <= 4; i++) {
      const ev = i * eMaxPlot / 4;
      ctx.beginPath();
      ctx.moveTo(xToPx(ev), pad.top);
      ctx.lineTo(xToPx(ev), pad.top + plotH);
      ctx.stroke();
    }

    // Eje X
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Etiquetas eje X (kJ/mol)
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const eKJ = (i * stepKJ).toFixed(0);
      ctx.fillText(`${eKJ}`, xToPx(i * eMaxPlot / 4), pad.top + plotH + 16);
    }
    ctx.fillText('Energía cinética molecular (kJ/mol)', pad.left + plotW / 2, pad.top + plotH + 30);

    // Eje Y label
    ctx.save();
    ctx.translate(pad.left - 35, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Fracción de moléculas', 0, 0);
    ctx.restore();

    // Función para dibujar zona reactiva (a la derecha de Ea) bajo curva
    const dibujarZonaReactiva = (T: number, color: string) => {
      const eaJ = ea * 1000;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(xToPx(eaJ), pad.top + plotH);
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const ev = eaJ + (eMaxPlot - eaJ) * (i / N);
        ctx.lineTo(xToPx(ev), yToPx(pdfMaxwellBoltzmann(ev, T)));
      }
      ctx.lineTo(xToPx(eMaxPlot), pad.top + plotH);
      ctx.closePath();
      ctx.fill();
    };

    // Función para dibujar relleno completo bajo curva
    const dibujarRelleno = (T: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(xToPx(0), pad.top + plotH);
      const N = 300;
      for (let i = 0; i <= N; i++) {
        const ev = (eMaxPlot * i) / N;
        ctx.lineTo(xToPx(ev), yToPx(pdfMaxwellBoltzmann(ev, T)));
      }
      ctx.lineTo(xToPx(eMaxPlot), pad.top + plotH);
      ctx.closePath();
      ctx.fill();
    };

    // Curva
    const dibujarCurva = (T: number, color: string, dash = false) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      if (dash) ctx.setLineDash([6, 4]);
      ctx.beginPath();
      const N = 300;
      for (let i = 0; i <= N; i++) {
        const ev = (eMaxPlot * i) / N;
        const px = xToPx(ev);
        const py = yToPx(pdfMaxwellBoltzmann(ev, T));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Pintar T1 primero (relleno general + curva)
    dibujarRelleno(T1, colorT1Fill);
    if (comparar && T2 !== T1) {
      dibujarRelleno(T2, colorT2Fill);
    }

    // Pintar zonas reactivas (área a la derecha de Ea)
    dibujarZonaReactiva(T1, colorReactivasT1);
    if (comparar && T2 !== T1) {
      dibujarZonaReactiva(T2, colorReactivasT2);
    }

    // Pintar curvas
    dibujarCurva(T1, colorT1);
    if (comparar && T2 !== T1) {
      dibujarCurva(T2, colorT2, true);
    }

    // Línea vertical Ea
    ctx.strokeStyle = colorEa;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xToPx(ea * 1000), pad.top);
    ctx.lineTo(xToPx(ea * 1000), pad.top + plotH);
    ctx.stroke();

    ctx.fillStyle = colorEa;
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Ea = ${ea} kJ/mol`, xToPx(ea * 1000), pad.top + 12);

    // Etiqueta T1, T2
    ctx.fillStyle = colorT1;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`T₁ = ${T1} K`, pad.left + 8, pad.top + 14);
    if (comparar && T2 !== T1) {
      ctx.fillStyle = colorT2;
      ctx.fillText(`T₂ = ${T2} K`, pad.left + 8, pad.top + 28);
    }
  }, [T1, T2, ea, comparar]);

  // ============================================
  // DIBUJO RECTA DE ARRHENIUS (ln k vs 1/T)
  // ============================================
  const dibujarArrhenius = useCallback(() => {
    const canvas = canvasArrheniusRef.current;
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
    const pad = { top: 24, right: 24, bottom: 36, left: 60 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorGrid = isDark ? '#333' : '#EEE';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorLine = '#2E86AB';
    const colorPunto1 = '#2E86AB';
    const colorPunto2 = '#E07A1F';

    ctx.clearRect(0, 0, W, H);

    // Rango T: 250 K a 1000 K (1/T: 0.001 a 0.004)
    const T_low = 250;
    const T_high = Math.max(T1, T2, 800);
    const invT_max = 1 / T_low;
    const invT_min = 1 / T_high;
    const lnK_at = (T: number) => Math.log(kArrhenius(ea, A, T));
    const lnK_low = lnK_at(T_low);
    const lnK_high = lnK_at(T_high);
    const lnKmin = Math.min(lnK_low, lnK_high) - 1;
    const lnKmax = Math.max(lnK_low, lnK_high) + 1;

    const xToPx = (invT: number) => pad.left + ((invT - invT_min) / (invT_max - invT_min)) * plotW;
    const yToPx = (lnK: number) => pad.top + plotH - ((lnK - lnKmin) / (lnKmax - lnKmin)) * plotH;

    // Grid + etiquetas eje X
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const invT = invT_min + (invT_max - invT_min) * (i / xTicks);
      ctx.beginPath();
      ctx.moveTo(xToPx(invT), pad.top);
      ctx.lineTo(xToPx(invT), pad.top + plotH);
      ctx.stroke();
      ctx.fillText(`${(invT * 1000).toFixed(2)}`, xToPx(invT), pad.top + plotH + 16);
    }
    ctx.fillText('1/T (10⁻³ K⁻¹)', pad.left + plotW / 2, pad.top + plotH + 30);

    // Eje Y label
    ctx.save();
    ctx.translate(pad.left - 45, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('ln k', 0, 0);
    ctx.restore();

    // Marcas Y
    ctx.textAlign = 'right';
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const lnK = lnKmin + (lnKmax - lnKmin) * (i / yTicks);
      ctx.fillText(fmt(lnK, 1), pad.left - 4, yToPx(lnK) + 4);
    }

    // Eje X
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Recta de Arrhenius: ln k = ln A − Ea/(RT) → recta en (1/T, ln k) con pendiente −Ea/R
    ctx.strokeStyle = colorLine;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const invT = invT_min + (invT_max - invT_min) * (i / N);
      const T = 1 / invT;
      const lnK = Math.log(kArrhenius(ea, A, T));
      const px = xToPx(invT);
      const py = yToPx(lnK);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Puntos T1 y T2
    const drawPunto = (T: number, color: string, label: string) => {
      const invT = 1 / T;
      const lnK = Math.log(kArrhenius(ea, A, T));
      ctx.fillStyle = color;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xToPx(invT), yToPx(lnK), 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(label, xToPx(invT) + 10, yToPx(lnK) + 4);
    };
    drawPunto(T1, colorPunto1, `T₁ = ${T1} K`);
    if (comparar && T2 !== T1) drawPunto(T2, colorPunto2, `T₂ = ${T2} K`);

    // Pendiente etiqueta
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`pendiente = −Ea/R = ${fmt(-(ea * 1000) / R, 0)} K`, pad.left + plotW - 8, pad.top + 16);
  }, [ea, A, T1, T2, comparar]);

  useEffect(() => { dibujarMB(); }, [dibujarMB]);
  useEffect(() => { if (mostrarArrhenius) dibujarArrhenius(); }, [dibujarArrhenius, mostrarArrhenius]);
  useEffect(() => {
    const handleResize = () => {
      dibujarMB();
      if (mostrarArrhenius) dibujarArrhenius();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujarMB, dibujarArrhenius, mostrarArrhenius]);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      dibujarMB();
      if (mostrarArrhenius) dibujarArrhenius();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [dibujarMB, dibujarArrhenius, mostrarArrhenius]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">⚗️</span> Simulador de Cinética: Ecuación de Arrhenius</h1>
        <p className={styles.subtitle}>
          Sube la temperatura y observa cómo crece exponencialmente la <strong>cola reactiva</strong> de la
          distribución de Maxwell-Boltzmann. La constante k se dispara con T.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR DE REACCIÓN */}
      <div className={styles.reactionSelector}>
        {REACCIONES.map(r => (
          <button
            key={r.id}
            type="button"
            className={`${styles.reactionBtn} ${reaccionId === r.id ? styles.reactionBtnActive : ''}`}
            onClick={() => cargarReaccion(r)}
            aria-pressed={reaccionId === r.id}
          >
            <span className={styles.reactionIcon} aria-hidden="true">{r.icono}</span>
            <span>{r.nombre}</span>
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        <p className={styles.descriptionCard}>
          {reaccionActual && <><strong>{reaccionActual.nombre}</strong>: {reaccionActual.notasClave}</>}
        </p>

        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Energía de activación (Ea = <strong>{fmt(ea, 0)} kJ/mol</strong>)
              </label>
              <input
                type="range"
                min={20}
                max={300}
                step={1}
                value={ea}
                onChange={e => setEa(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Energía de activación"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Factor pre-exponencial (A = <strong>10^{fmt(logA, 1)} {reaccionActual?.unidadA ?? ''}</strong>)
              </label>
              <input
                type="range"
                min={5}
                max={20}
                step={0.1}
                value={logA}
                onChange={e => setLogA(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Factor pre-exponencial logA"
              />
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Temperatura T₁ = <strong>{T1} K</strong> ({fmt(T1 - 273.15, 1)} °C)
              </label>
              <input
                type="range"
                min={250}
                max={1000}
                step={1}
                value={T1}
                onChange={e => setT1(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Temperatura T1"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Temperatura T₂ = <strong>{T2} K</strong> ({fmt(T2 - 273.15, 1)} °C)
              </label>
              <input
                type="range"
                min={250}
                max={1000}
                step={1}
                value={T2}
                onChange={e => setT2(parseFloat(e.target.value))}
                className={`${styles.slider} ${styles.sliderT2}`}
                aria-label="Temperatura T2"
                disabled={!comparar}
              />
            </div>
          </div>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={comparar}
              onChange={e => setComparar(e.target.checked)}
            />
            <span>Comparar dos temperaturas (T₁ vs T₂)</span>
          </label>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={mostrarArrhenius}
              onChange={e => setMostrarArrhenius(e.target.checked)}
            />
            <span>Mostrar recta de Arrhenius (ln k vs 1/T)</span>
          </label>
        </div>

        {/* CANVAS MB */}
        <div className={styles.canvasWrapper}>
          <div className={styles.canvasLabel}><span aria-hidden="true">📊</span> Distribución de Maxwell-Boltzmann (energías moleculares)</div>
          <canvas ref={canvasMainRef} className={styles.canvasMain} aria-label="Distribución de Maxwell-Boltzmann a temperatura T" />
          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#2E86AB' }} />
              Curva T₁
            </span>
            {comparar && T2 !== T1 && (
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#E07A1F' }} />
                Curva T₂
              </span>
            )}
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#A82E68' }} />
              Energía de activación Ea
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'rgba(46, 134, 171, 0.55)' }} />
              Moléculas reactivas (E ≥ Ea)
            </span>
          </div>
        </div>

        {/* CANVAS ARRHENIUS */}
        {mostrarArrhenius && (
          <div className={styles.canvasWrapper}>
            <div className={styles.canvasLabel}><span aria-hidden="true">📐</span> Recta de Arrhenius: ln k = ln A − Ea/(RT)</div>
            <canvas ref={canvasArrheniusRef} className={styles.canvasArrhenius} aria-label="Recta de Arrhenius ln k vs 1/T" />
          </div>
        )}

        {/* RESULTADOS */}
        <div className={styles.resultsPanel}>
          {comparar && T2 !== T1 && (
            <div className={styles.resultCardMain}>
              <span className={styles.resultLabel}>Factor de aceleración k(T₂)/k(T₁)</span>
              <span className={styles.resultValueLarge}>×{fmtCientifico(factorAceleracion, 2)}</span>
              <span className={styles.resultRange}>
                {factorAceleracion > 1
                  ? `Subir de ${T1} K a ${T2} K acelera ${fmt(factorAceleracion, 1)} veces la reacción`
                  : `Bajar de ${T1} K a ${T2} K ralentiza ${fmt(1 / factorAceleracion, 1)} veces la reacción`}
              </span>
            </div>
          )}

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>k a T₁ = {T1} K</span>
            <span className={styles.resultValue}>{fmtCientifico(k1, 3)}</span>
            <span className={styles.resultRange}>{reaccionActual?.unidadA ?? ''}</span>
          </div>
          {comparar && T2 !== T1 && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>k a T₂ = {T2} K</span>
              <span className={styles.resultValue} style={{ color: '#E07A1F' }}>{fmtCientifico(k2, 3)}</span>
              <span className={styles.resultRange}>{reaccionActual?.unidadA ?? ''}</span>
            </div>
          )}

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Fracción reactiva a T₁</span>
            <span className={styles.resultValue}>{fmtCientifico(f1, 3)}</span>
            <span className={styles.resultRange}>exp(−Ea/RT₁)</span>
          </div>
          {comparar && T2 !== T1 && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Fracción reactiva a T₂</span>
              <span className={styles.resultValue} style={{ color: '#E07A1F' }}>{fmtCientifico(f2, 3)}</span>
              <span className={styles.resultRange}>exp(−Ea/RT₂)</span>
            </div>
          )}

          {isFinite(t12_1) && t12_1 > 0 && k1 > 0 && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>t½ a T₁ (1.er orden)</span>
              <span className={styles.resultValue}>{fmtCientifico(t12_1, 2)} s</span>
              <span className={styles.resultRange}>= ln(2)/k₁</span>
            </div>
          )}
          {comparar && T2 !== T1 && isFinite(t12_2) && t12_2 > 0 && k2 > 0 && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>t½ a T₂ (1.er orden)</span>
              <span className={styles.resultValue} style={{ color: '#E07A1F' }}>{fmtCientifico(t12_2, 2)} s</span>
              <span className={styles.resultRange}>= ln(2)/k₂</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende cinética química con Arrhenius"
        subtitle="Por qué subir 10 °C duplica las velocidades y por qué los catalizadores son magia"
      >
        <section>
          <h3>¿Qué es la ecuación de Arrhenius?</h3>
          <p>
            La <strong>ecuación de Arrhenius</strong> (Svante Arrhenius, 1889) describe cómo la constante
            de velocidad k de una reacción química depende de la temperatura T. Es una de las ecuaciones
            más universales de toda la química:
          </p>
          <div className={styles.formulaBox}>
            k(T) = A · exp(−Ea / RT)
          </div>
          <ul className={styles.bulletList}>
            <li><strong>Ea (energía de activación)</strong>: barrera energética que las moléculas deben superar para reaccionar (J/mol o kJ/mol).</li>
            <li><strong>A (factor pre-exponencial)</strong>: relacionado con la frecuencia de colisiones y la orientación correcta. Se mide en s⁻¹ o L/(mol·s).</li>
            <li><strong>R</strong>: constante de los gases (8,314 J·mol⁻¹·K⁻¹).</li>
            <li><strong>T</strong>: temperatura absoluta (K). NUNCA en Celsius en esta fórmula.</li>
          </ul>
          <p>
            La distribución de <strong>Maxwell-Boltzmann</strong> describe cómo se reparten las energías
            cinéticas entre las moléculas a una temperatura dada. Solo las moléculas con E ≥ Ea pueden
            reaccionar al chocar; subir T mueve la distribución hacia energías más altas y aumenta
            exponencialmente la fracción reactiva.
          </p>
          <p>
            <strong>Tomando logaritmos</strong>: ln k = ln A − Ea/(RT). En un gráfico de ln k frente a
            1/T sale una <em>recta</em> de pendiente −Ea/R. Es la forma habitual de medir Ea
            experimentalmente: linealizar y ajustar.
          </p>
        </section>

        <section>
          <h3>Energías de activación típicas y consecuencias prácticas</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo de proceso</th>
                  <th>Ea (kJ/mol)</th>
                  <th>Velocidad relativa</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Reacción enzimática catalizada</td>
                  <td>20-50</td>
                  <td>Muy rápida</td>
                  <td>Catalasa con H₂O₂ (Ea ≈ 23)</td>
                </tr>
                <tr>
                  <td>Reacción ácida en disolución</td>
                  <td>40-80</td>
                  <td>Rápida</td>
                  <td>Hidrólisis ácida sacarosa (Ea ≈ 108)</td>
                </tr>
                <tr>
                  <td>Reacción típica en fase gas</td>
                  <td>80-150</td>
                  <td>Media (necesita ↑T)</td>
                  <td>Formación HI (Ea ≈ 167)</td>
                </tr>
                <tr>
                  <td>Reacción con ruptura covalente fuerte</td>
                  <td>150-300</td>
                  <td>Muy lenta a T ambiente</td>
                  <td>Isomerización ciclopropano (Ea ≈ 272)</td>
                </tr>
                <tr>
                  <td>Reacción nuclear (no química)</td>
                  <td>10⁶ y más</td>
                  <td>Solo a T extremas (estrellas)</td>
                  <td>Fusión H + H en el Sol</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>4 escenarios donde Arrhenius lo explica todo</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🍳</span>
              <strong>Cocinar y conservar alimentos</strong>
              <p>La nevera ralentiza el deterioro porque baja T (≈ 4 °C vs 22 °C: factor de aceleración ÷5 aprox). El horno acelera la cocción porque sube T 200 °C: la fracción reactiva crece millones de veces.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🧬</span>
              <strong>Enzimas y vida</strong>
              <p>Las enzimas son catalizadores biológicos: bajan Ea sin alterarse. Sin ellas, la digestión humana tardaría décadas. Por eso una pérdida enzimática (cianuro, fluoroacetato) puede ser letal.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚗</span>
              <strong>Catalizadores en automóviles</strong>
              <p>El platino en el escape oxida CO y NOₓ a CO₂ y N₂ a la T de los gases (200-700 °C). Sin catalizador la reacción sería demasiado lenta. Bajan Ea de ~120 a ~80 kJ/mol.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">💊</span>
              <strong>Caducidad de medicamentos</strong>
              <p>La descomposición sigue Arrhenius. Tests acelerados a 40 °C extrapolan la vida útil a 25 °C usando esta ecuación. Por eso los fármacos se conservan en frío: t½ se multiplica por mucho.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre cinética química</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Es cierto que +10 °C duplica la velocidad?</h4>
              <p>Es una <strong>regla heurística</strong>, no una ley exacta. Funciona bien para Ea ≈ 50-80 kJ/mol cerca de T ambiente. Para Ea muy bajas (≤ 20) la aceleración es menor; para Ea muy altas (≥ 200), subir 10 °C puede acelerar 5-10 veces o más.</p>
              <p className={styles.faqTip}>💡 En el simulador, fija T₁ = 298 K y T₂ = 308 K, y prueba distintas Ea: verás qué tanto se acerca al &quot;factor 2&quot;.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué hace exactamente un catalizador?</h4>
              <p>Un <strong>catalizador baja Ea</strong> ofreciendo un mecanismo alternativo. NO cambia ΔH (la termodinámica) ni la composición de productos. Solo acelera tanto la reacción directa como la inversa por igual: el equilibrio se alcanza antes, pero es el mismo.</p>
              <p className={styles.faqTip}>💡 En el simulador, baja Ea de 75 a 23 kJ/mol (efecto de la catalasa sobre H₂O₂) y verás que k crece millones de veces.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué la temperatura sube en muchas reacciones?</h4>
              <p>Si la reacción es <strong>exotérmica</strong> (ΔH &lt; 0), libera energía. Esa energía calienta el sistema, lo que aumenta T y por Arrhenius acelera aún más la reacción. Es un bucle de retroalimentación que puede acabar en explosión si no se controla.</p>
              <p className={styles.faqTip}>💡 Por eso los reactores químicos industriales tienen sistemas de refrigeración elaborados: para mantener T constante y la reacción bajo control.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es un orden de reacción y cómo afecta?</h4>
              <p>El <strong>orden</strong> es el exponente de cada concentración en la ley de velocidad: v = k·[A]ᵐ·[B]ⁿ. Arrhenius solo modela k (parte que depende de T). El orden viene del mecanismo y se determina experimentalmente. Para reacciones de 1.er orden, t½ = ln(2)/k es independiente de la concentración inicial.</p>
              <p className={styles.faqTip}>💡 Reacciones radiactivas son SIEMPRE de 1.er orden: t½ es constante. Por eso el carbono-14 sirve para datar fósiles.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo se mide Ea experimentalmente?</h4>
              <p>Midiendo k a varias temperaturas y representando ln k frente a 1/T. Sale una <strong>recta de pendiente −Ea/R</strong>. Multiplicando la pendiente por −R obtienes Ea directamente. Es uno de los experimentos clásicos de laboratorio universitario.</p>
              <p className={styles.faqTip}>💡 En el simulador, activa el toggle &quot;recta de Arrhenius&quot; y mueve T₁/T₂. Verás que ambos puntos siempre caen sobre la misma recta de pendiente fija.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Cómo resolver un problema de Arrhenius paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica los datos: Ea, A, T (siempre en kelvin)</strong>
                <p>Si te dan T en Celsius, convierte: T(K) = T(°C) + 273,15. Si te dan Ea en cal/mol, conviértelo a J/mol (×4,184). NUNCA mezcles unidades en la exponencial.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Aplica k = A · exp(−Ea/(RT))</strong>
                <p>R = 8,314 J/(mol·K). Si Ea está en kJ/mol, multiplícalo por 1000 antes. La exponencial debe quedar como un número adimensional negativo (típicamente entre −5 y −50).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Si comparas dos T: ln(k₂/k₁) = −Ea/R · (1/T₂ − 1/T₁)</strong>
                <p>Esta forma de la ecuación es muy útil porque elimina el factor A (a menudo desconocido). Es la fórmula EBAU típica para calcular Ea a partir de dos pares (T, k).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Para vida media (1.er orden): t½ = ln(2)/k</strong>
                <p>Si la reacción es de 1.er orden, el tiempo en que se consume la mitad del reactivo NO depende de la concentración inicial. t½ se acorta exponencialmente al subir T.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con orden de magnitud</strong>
                <p>k a T ambiente para reacciones &quot;razonables&quot; suele estar entre 10⁻⁶ y 1 s⁻¹. Si te sale 10⁻²⁰ es demasiado lenta; si te sale 10⁵ es demasiado rápida. Vuelve a los datos.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3>4 buenas prácticas con cinética química</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Trabaja siempre en kelvin</strong>
              <p>La ecuación de Arrhenius requiere T absoluta. Mezclar Celsius con kelvin es el error #1 de cinética. Convierte SIEMPRE antes: K = °C + 273,15.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <strong>Linealiza con ln k vs 1/T</strong>
              <p>Si tienes datos experimentales, NO ajustes la exponencial directamente. Tomas logaritmos y haces regresión lineal: pendiente = −Ea/R, intercepto = ln A. Más fiable y más sencillo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <strong>Recuerda que A NO depende solo de la frecuencia de choques</strong>
              <p>A incorpora también el &quot;factor estérico&quot; (orientación correcta). Para reacciones complejas A es mucho menor que la frecuencia simple de choques. Eso explica que A varíe entre 10⁵ y 10²⁰.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Combina Arrhenius con leyes de velocidad</strong>
              <p>k(T) te da la constante; la ley de velocidad v = k·[A]ᵐ·[B]ⁿ te da cuánto reactivo se consume por unidad de tiempo. Necesitas ambas para predecir un perfil de reacción real.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes con la ecuación de Arrhenius</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Usar Celsius en vez de Kelvin</strong> — La exponencial requiere T absoluta. Una T de 25 °C en kelvin es 298 K. Si pones 25 directamente, el resultado será absurdo.</li>
            <li><strong>Mezclar unidades de Ea con R</strong> — Si Ea está en kJ/mol, R debe estar en kJ/(mol·K) (= 0,008314), o conviertes Ea a J. La R en J/(mol·K) y Ea en kJ/mol da números 1000× más pequeños de lo que deberían.</li>
            <li><strong>Pensar que el catalizador desplaza el equilibrio</strong> — NO. Acelera tanto la directa como la inversa por igual. Solo cambia la velocidad a la que se alcanza el equilibrio, NO el equilibrio en sí.</li>
            <li><strong>Aplicar la regla &quot;+10 °C duplica&quot; para cualquier Ea</strong> — La regla solo es razonable para Ea ≈ 50-80 kJ/mol cerca de T ambiente. Para Ea altas el factor es mayor; para Ea bajas, menor.</li>
            <li><strong>Confundir orden de reacción con coeficientes estequiométricos</strong> — Para A + B → C, la ley puede ser v = k·[A]²·[B]⁰·⁵, no necesariamente v = k·[A]·[B]. El orden se determina experimentalmente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-cinetica-arrhenius')} />
      <ShareCard appName="simulador-cinetica-arrhenius" />
      <Footer appName="simulador-cinetica-arrhenius" />
    </div>
  );
}
