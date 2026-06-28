'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorIntegralArea.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type FunctionId =
  | 'cuadratica'
  | 'cubica'
  | 'parabola'
  | 'seno'
  | 'coseno'
  | 'exponencial'
  | 'inversa'
  | 'gaussiana';

type Metodo = 'izquierda' | 'derecha' | 'medio' | 'trapecio';

interface FunctionDef {
  id: FunctionId;
  nombre: string;
  expr: string;
  primitiva: string | null; // null si no tiene primitiva elemental
  f: (x: number) => number;
  F: ((x: number) => number) | null; // primitiva, si existe
  dominio: (x: number) => boolean;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  aDefault: number;
  bDefault: number;
  notasClave: string;
}

// ============================================
// CATÁLOGO DE FUNCIONES
// ============================================
const FUNCIONES: Record<FunctionId, FunctionDef> = {
  cuadratica: {
    id: 'cuadratica',
    nombre: 'f(x) = x²',
    expr: 'f(x) = x²',
    primitiva: 'F(x) = x³/3',
    f: (x) => x * x,
    F: (x) => (x * x * x) / 3,
    dominio: () => true,
    xMin: -3, xMax: 3, yMin: -1, yMax: 9,
    aDefault: 0, bDefault: 2,
    notasClave: 'Función simétrica par. Integral [-a, a] = 2·a³/3.',
  },
  cubica: {
    id: 'cubica',
    nombre: 'f(x) = x³',
    expr: 'f(x) = x³',
    primitiva: 'F(x) = x⁴/4',
    f: (x) => x * x * x,
    F: (x) => (x * x * x * x) / 4,
    dominio: () => true,
    xMin: -2.5, xMax: 2.5, yMin: -8, yMax: 8,
    aDefault: -1, bDefault: 1,
    notasClave: 'Función impar: ∫₋ₐᵃ x³ dx = 0 (áreas positiva y negativa se cancelan).',
  },
  parabola: {
    id: 'parabola',
    nombre: 'f(x) = x² − 2x + 1',
    expr: 'f(x) = (x − 1)²',
    primitiva: 'F(x) = x³/3 − x² + x',
    f: (x) => (x - 1) * (x - 1),
    F: (x) => (x * x * x) / 3 - x * x + x,
    dominio: () => true,
    xMin: -1, xMax: 4, yMin: -0.5, yMax: 9,
    aDefault: 0, bDefault: 2,
    notasClave: 'Mínimo en x = 1. Siempre positiva, integral siempre ≥ 0.',
  },
  seno: {
    id: 'seno',
    nombre: 'f(x) = sen(x)',
    expr: 'f(x) = sen(x)',
    primitiva: 'F(x) = −cos(x)',
    f: Math.sin,
    F: (x) => -Math.cos(x),
    dominio: () => true,
    xMin: -Math.PI, xMax: 2 * Math.PI, yMin: -1.3, yMax: 1.3,
    aDefault: 0, bDefault: Math.PI,
    notasClave: '∫₀π sen(x) dx = 2. ∫₀²π sen(x) dx = 0 (áreas se cancelan).',
  },
  coseno: {
    id: 'coseno',
    nombre: 'f(x) = cos(x)',
    expr: 'f(x) = cos(x)',
    primitiva: 'F(x) = sen(x)',
    f: Math.cos,
    F: Math.sin,
    dominio: () => true,
    xMin: -Math.PI, xMax: 2 * Math.PI, yMin: -1.3, yMax: 1.3,
    aDefault: 0, bDefault: Math.PI / 2,
    notasClave: '∫₀^(π/2) cos(x) dx = 1. Conexión natural sen↔cos vía derivada/integral.',
  },
  exponencial: {
    id: 'exponencial',
    nombre: 'f(x) = eˣ',
    expr: 'f(x) = eˣ',
    primitiva: 'F(x) = eˣ',
    f: Math.exp,
    F: Math.exp,
    dominio: () => true,
    xMin: -2, xMax: 3, yMin: -1, yMax: 22,
    aDefault: 0, bDefault: 1,
    notasClave: 'eˣ es su propia primitiva. ∫₀¹ eˣ dx = e − 1 ≈ 1,718.',
  },
  inversa: {
    id: 'inversa',
    nombre: 'f(x) = 1/x',
    expr: 'f(x) = 1/x',
    primitiva: 'F(x) = ln|x|',
    f: (x) => 1 / x,
    F: (x) => Math.log(Math.abs(x)),
    dominio: (x) => x > 0.05,
    xMin: 0.1, xMax: 5, yMin: -0.5, yMax: 6,
    aDefault: 1, bDefault: 2,
    notasClave: 'Conexión integral-logaritmo. ∫₁ᵉ (1/x) dx = 1 (definición de e).',
  },
  gaussiana: {
    id: 'gaussiana',
    nombre: 'f(x) = e^(−x²)',
    expr: 'f(x) = e^(−x²)',
    primitiva: null, // no tiene primitiva elemental
    f: (x) => Math.exp(-x * x),
    F: null,
    dominio: () => true,
    xMin: -3, xMax: 3, yMin: -0.2, yMax: 1.2,
    aDefault: -1, bDefault: 1,
    notasClave: 'NO tiene primitiva elemental. La integral total ∫₋∞^∞ e^(−x²) dx = √π.',
  },
};

const FUNCION_IDS: FunctionId[] = ['cuadratica', 'cubica', 'parabola', 'seno', 'coseno', 'exponencial', 'inversa', 'gaussiana'];

const N_VALORES = [1, 2, 5, 10, 20, 50, 100, 500];

const METODOS: { id: Metodo; nombre: string; icono: string; desc: string }[] = [
  { id: 'izquierda', nombre: 'Izquierda', icono: '◧', desc: 'Altura en el extremo izquierdo' },
  { id: 'derecha', nombre: 'Derecha', icono: '◨', desc: 'Altura en el extremo derecho' },
  { id: 'medio', nombre: 'Punto medio', icono: '◫', desc: 'Altura en el centro de cada subintervalo' },
  { id: 'trapecio', nombre: 'Trapecio', icono: '◮', desc: 'Promedio izquierda + derecha' },
];

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 4): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

function fmtSigned(n: number, decimales = 4): string {
  if (!isFinite(n)) return '∞';
  const s = Math.abs(n).toFixed(decimales).replace('.', ',');
  return n < 0 ? `−${s}` : s;
}

// ============================================
// SUMAS DE RIEMANN
// ============================================
interface RectInfo {
  x0: number;
  x1: number;
  altura: number; // altura del rectángulo (puede ser negativa)
}

function calcularRiemann(
  f: (x: number) => number,
  dominio: (x: number) => boolean,
  a: number,
  b: number,
  n: number,
  metodo: Metodo
): { suma: number; rectangulos: RectInfo[]; valido: boolean } {
  if (a === b || n <= 0) return { suma: 0, rectangulos: [], valido: true };

  const xLo = Math.min(a, b);
  const xHi = Math.max(a, b);
  const dx = (xHi - xLo) / n;
  const rectangulos: RectInfo[] = [];
  let suma = 0;
  let valido = true;

  for (let i = 0; i < n; i++) {
    const x0 = xLo + i * dx;
    const x1 = x0 + dx;
    let altura: number;

    if (metodo === 'izquierda') {
      if (!dominio(x0)) { valido = false; continue; }
      altura = f(x0);
    } else if (metodo === 'derecha') {
      if (!dominio(x1)) { valido = false; continue; }
      altura = f(x1);
    } else if (metodo === 'medio') {
      const xm = (x0 + x1) / 2;
      if (!dominio(xm)) { valido = false; continue; }
      altura = f(xm);
    } else {
      // trapecio
      if (!dominio(x0) || !dominio(x1)) { valido = false; continue; }
      altura = (f(x0) + f(x1)) / 2;
    }

    if (!isFinite(altura)) { valido = false; continue; }

    rectangulos.push({ x0, x1, altura });
    suma += altura * dx;
  }

  // Si los límites estaban invertidos (a > b), la integral cambia de signo
  if (a > b) suma = -suma;

  return { suma, rectangulos, valido };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorIntegralAreaPage() {
  const [funcId, setFuncId] = useState<FunctionId>('cuadratica');
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const [n, setN] = useState(10);
  const [metodo, setMetodo] = useState<Metodo>('medio');
  const [mostrarExacto, setMostrarExacto] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const funcion = FUNCIONES[funcId];

  // Reset al cambiar función
  useEffect(() => {
    setA(funcion.aDefault);
    setB(funcion.bDefault);
  }, [funcId, funcion.aDefault, funcion.bDefault]);

  // Cálculo de la suma de Riemann
  const { suma, rectangulos, valido } = useMemo(
    () => calcularRiemann(funcion.f, funcion.dominio, a, b, n, metodo),
    [funcion, a, b, n, metodo]
  );

  // Valor exacto (si hay primitiva)
  const valorExacto = useMemo(() => {
    if (!funcion.F) return null;
    if (!funcion.dominio(a) || !funcion.dominio(b)) return null;
    return funcion.F(b) - funcion.F(a);
  }, [funcion, a, b]);

  const errorAbs = useMemo(() => {
    if (valorExacto === null) return null;
    return Math.abs(suma - valorExacto);
  }, [suma, valorExacto]);

  const errorRel = useMemo(() => {
    if (valorExacto === null || Math.abs(valorExacto) < 1e-12) return null;
    return Math.abs(errorAbs! / valorExacto) * 100;
  }, [errorAbs, valorExacto]);

  const dx = useMemo(() => (Math.abs(b - a)) / n, [a, b, n]);

  // ============================================
  // DIBUJO DEL CANVAS
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
    const pad = { top: 20, right: 20, bottom: 30, left: 40 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorGrid = isDark ? '#333' : '#EEE';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorCurve = '#2E86AB';
    const colorRectPos = 'rgba(72, 169, 166, 0.45)';
    const colorRectPosBorder = '#48A9A6';
    const colorRectNeg = 'rgba(168, 46, 104, 0.45)';
    const colorRectNegBorder = '#A82E68';
    const colorLimits = '#E07A1F';

    ctx.clearRect(0, 0, W, H);

    const xToPx = (x: number) => pad.left + ((x - funcion.xMin) / (funcion.xMax - funcion.xMin)) * plotW;
    const yToPx = (y: number) => pad.top + plotH - ((y - funcion.yMin) / (funcion.yMax - funcion.yMin)) * plotH;

    // Grid
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    const xStep = (funcion.xMax - funcion.xMin) / 8;
    const yStep = (funcion.yMax - funcion.yMin) / 6;
    for (let i = 0; i <= 8; i++) {
      const x = funcion.xMin + i * xStep;
      ctx.beginPath();
      ctx.moveTo(xToPx(x), pad.top);
      ctx.lineTo(xToPx(x), pad.top + plotH);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const y = funcion.yMin + i * yStep;
      ctx.beginPath();
      ctx.moveTo(pad.left, yToPx(y));
      ctx.lineTo(pad.left + plotW, yToPx(y));
      ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1.5;
    if (funcion.yMin <= 0 && funcion.yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(pad.left, yToPx(0));
      ctx.lineTo(pad.left + plotW, yToPx(0));
      ctx.stroke();
    }
    if (funcion.xMin <= 0 && funcion.xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(xToPx(0), pad.top);
      ctx.lineTo(xToPx(0), pad.top + plotH);
      ctx.stroke();
    }

    // Etiquetas
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 8; i++) {
      const x = funcion.xMin + i * xStep;
      if (Math.abs(x) < 1e-10) continue;
      ctx.fillText(fmt(x, x % 1 === 0 ? 0 : 1), xToPx(x), pad.top + plotH + 14);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 6; i++) {
      const y = funcion.yMin + i * yStep;
      if (Math.abs(y) < 1e-10) continue;
      ctx.fillText(fmt(y, y % 1 === 0 ? 0 : 1), pad.left - 4, yToPx(y) + 4);
    }

    // RECTÁNGULOS (debajo de la curva)
    const yZero = yToPx(0);
    for (const r of rectangulos) {
      const px0 = xToPx(r.x0);
      const px1 = xToPx(r.x1);
      const py = yToPx(r.altura);
      const positivo = r.altura >= 0;
      ctx.fillStyle = positivo ? colorRectPos : colorRectNeg;
      ctx.strokeStyle = positivo ? colorRectPosBorder : colorRectNegBorder;
      ctx.lineWidth = n <= 50 ? 1 : 0.4;
      const left = Math.min(px0, px1) + 0.5;
      const width = Math.abs(px1 - px0) - 1;
      const top = Math.min(py, yZero);
      const height = Math.abs(py - yZero);
      ctx.fillRect(left, top, Math.max(0.5, width), height);
      if (n <= 50) {
        ctx.strokeRect(left, top, Math.max(0.5, width), height);
      }
    }

    // CURVA f(x)
    ctx.strokeStyle = colorCurve;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let comenzado = false;
    const Ncurve = 400;
    for (let i = 0; i <= Ncurve; i++) {
      const xv = funcion.xMin + (funcion.xMax - funcion.xMin) * (i / Ncurve);
      if (!funcion.dominio(xv)) {
        comenzado = false;
        continue;
      }
      const yv = funcion.f(xv);
      if (yv < funcion.yMin - 100 || yv > funcion.yMax + 100) {
        comenzado = false;
        continue;
      }
      const px = xToPx(xv);
      const py = yToPx(Math.max(funcion.yMin - 5, Math.min(funcion.yMax + 5, yv)));
      if (!comenzado) {
        ctx.moveTo(px, py);
        comenzado = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // LÍNEAS VERTICALES en a y b
    ctx.strokeStyle = colorLimits;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xToPx(a), pad.top);
    ctx.lineTo(xToPx(a), pad.top + plotH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xToPx(b), pad.top);
    ctx.lineTo(xToPx(b), pad.top + plotH);
    ctx.stroke();

    ctx.fillStyle = colorLimits;
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('a', xToPx(a), pad.top - 4);
    ctx.fillText('b', xToPx(b), pad.top - 4);

    // Etiqueta Δx
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Δx = ${fmt(dx, 4)} · n = ${n} · ${METODOS.find(m => m.id === metodo)!.nombre}`, pad.left + 8, pad.top + 14);
  }, [funcion, rectangulos, a, b, n, metodo, dx]);

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
        <h1 className={styles.title}><span aria-hidden="true">📐</span> Simulador de Integrales: Área bajo la Curva</h1>
        <p className={styles.subtitle}>
          Aproxima la integral definida con sumas de Riemann. Ajusta n, los límites a y b, y compara
          <strong> 4 métodos</strong> con el valor exacto. Ahí vive el concepto de integral como límite de áreas.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR DE FUNCIÓN */}
      <div className={styles.functionSelector}>
        {FUNCION_IDS.map(id => (
          <button
            type="button"
            key={id}
            className={`${styles.funcBtn} ${funcId === id ? styles.funcBtnActive : ''}`}
            onClick={() => setFuncId(id)}
            aria-pressed={funcId === id}
          >
            {FUNCIONES[id].nombre}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        {/* CARD DE FUNCIÓN */}
        <div className={styles.funcInfoCard}>
          <div className={styles.funcInfoLeft}>
            <div className={styles.funcExpr}>{funcion.expr}</div>
            <div className={styles.funcPrimitiva}>{funcion.primitiva ?? 'Sin primitiva elemental'}</div>
          </div>
          <p className={styles.funcNotes}>{funcion.notasClave}</p>
        </div>

        {/* MÉTODO */}
        <div className={styles.methodSelector} role="group" aria-label="Método de aproximación">
          {METODOS.map(m => (
            <button
              type="button"
              key={m.id}
              className={`${styles.methodBtn} ${metodo === m.id ? styles.methodBtnActive : ''}`}
              onClick={() => setMetodo(m.id)}
              aria-pressed={metodo === m.id}
            >
              <span className={styles.methodIcon} aria-hidden="true">{m.icono}</span>
              <span className={styles.methodName}>{m.nombre}</span>
              <span className={styles.methodDesc}>{m.desc}</span>
            </button>
          ))}
        </div>

        {/* CONTROLES */}
        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Límite inferior (a = <strong>{fmt(a, 3)}</strong>)
              </label>
              <input
                type="range"
                min={funcion.xMin}
                max={funcion.xMax}
                step={(funcion.xMax - funcion.xMin) / 200}
                value={a}
                onChange={e => setA(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Límite inferior a"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Límite superior (b = <strong>{fmt(b, 3)}</strong>)
              </label>
              <input
                type="range"
                min={funcion.xMin}
                max={funcion.xMax}
                step={(funcion.xMax - funcion.xMin) / 200}
                value={b}
                onChange={e => setB(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Límite superior b"
              />
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Número de rectángulos (n = <strong>{n}</strong>)
            </label>
            <div className={styles.discreteSteps} role="group" aria-label="Número de rectángulos">
              {N_VALORES.map(v => (
                <button
                  type="button"
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

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={mostrarExacto}
              onChange={e => setMostrarExacto(e.target.checked)}
            />
            <span>Mostrar valor exacto y error de la aproximación</span>
          </label>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Gráfica con sumas de Riemann" />
        </div>

        {/* AVISOS */}
        {!valido && (
          <div className={styles.warningPanel} role="alert">
            ⚠️ Algunos rectángulos están fuera del dominio de {funcion.expr}. La aproximación se ha calculado solo sobre los válidos.
          </div>
        )}
        {!funcion.F && mostrarExacto && (
          <div className={styles.warningPanel} role="alert">
            ℹ️ {funcion.expr} no tiene primitiva elemental. El valor exacto de la integral solo se puede calcular numéricamente.
          </div>
        )}

        {/* RESULTADOS */}
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
          <div className={styles.resultCardMain}>
            <span className={styles.resultLabel}>
              ∫<sub>{fmt(Math.min(a, b), 2)}</sub><sup>{fmt(Math.max(a, b), 2)}</sup> {funcion.expr.replace('f(x) = ', '')} dx
            </span>
            <span className={styles.resultValueLarge}>{fmtSigned(suma, 5)}</span>
            <span className={styles.resultRange}>
              Aproximación con {n} rectángulos · método {METODOS.find(m => m.id === metodo)!.nombre.toLowerCase()}
            </span>
          </div>

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Δx (anchura)</span>
            <span className={styles.resultValue}>{fmt(dx, 5)}</span>
            <span className={styles.resultRange}>(b − a) / n</span>
          </div>

          {mostrarExacto && valorExacto !== null && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Valor exacto</span>
              <span className={styles.resultValue}>{fmtSigned(valorExacto, 5)}</span>
              <span className={styles.resultRange}>F(b) − F(a)</span>
            </div>
          )}

          {mostrarExacto && errorAbs !== null && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Error absoluto</span>
              <span className={styles.resultValue}>{fmt(errorAbs, 6)}</span>
              <span className={styles.resultRange}>|aprox − exacto|</span>
            </div>
          )}

          {mostrarExacto && errorRel !== null && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Error relativo</span>
              <span className={styles.resultValue}>{fmt(errorRel, 4)} %</span>
              <span className={styles.resultRange}>|error| / |exacto|</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="Aprende qué es una integral definida"
        subtitle="De las sumas de Riemann al teorema fundamental del cálculo"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es la integral definida de una función?</h3>
          <p>
            La <strong>integral definida</strong> de f en [a, b], escrita ∫<sub>a</sub><sup>b</sup> f(x) dx,
            es el <strong>área con signo</strong> entre la curva y el eje X en ese tramo. Cuando f &gt; 0, se
            suma; cuando f &lt; 0, se resta. Su definición rigurosa es un <em>límite de sumas de áreas de
            rectángulos</em> cada vez más finos:
          </p>
          <div className={styles.formulaBox}>
            ∫<sub>a</sub><sup>b</sup> f(x) dx = lim<sub>n→∞</sub> Σ<sub>i=1</sub><sup>n</sup> f(x<sub>i</sub>*) · Δx, &nbsp; Δx = (b − a)/n
          </div>
          <p>
            Activa el simulador con n = 5 y luego salta a n = 100: verás cómo los rectángulos se
            adaptan a la curva y la suma se acerca al valor exacto. Ese es exactamente el límite que
            define la integral.
          </p>
          <ul className={styles.bulletList}>
            <li>Si f(x) ≥ 0 en [a, b], la integral coincide con el <strong>área bajo la curva</strong>.</li>
            <li>Si f(x) cambia de signo, las áreas bajo el eje X <strong>se restan</strong>.</li>
            <li>Si a &gt; b, la integral cambia de signo: ∫<sub>b</sub><sup>a</sup> f(x) dx = −∫<sub>a</sub><sup>b</sup> f(x) dx.</li>
          </ul>
        </section>

        {/* TABLA */}
        <section>
          <h3>Las 7 integrales que tienes que saber de memoria</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Función f(x)</th>
                  <th>Primitiva F(x)</th>
                  <th>Validez</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>k (constante)</td>
                  <td>k · x + C</td>
                  <td>Todo ℝ</td>
                </tr>
                <tr>
                  <td>x<sup>n</sup>, n ≠ −1</td>
                  <td>x<sup>n+1</sup>/(n+1) + C</td>
                  <td>Todo ℝ (salvo n &lt; 0 en x = 0)</td>
                </tr>
                <tr>
                  <td>1/x</td>
                  <td>ln|x| + C</td>
                  <td>x ≠ 0</td>
                </tr>
                <tr>
                  <td>e<sup>x</sup></td>
                  <td>e<sup>x</sup> + C</td>
                  <td>Todo ℝ</td>
                </tr>
                <tr>
                  <td>sen(x)</td>
                  <td>−cos(x) + C</td>
                  <td>Todo ℝ</td>
                </tr>
                <tr>
                  <td>cos(x)</td>
                  <td>sen(x) + C</td>
                  <td>Todo ℝ</td>
                </tr>
                <tr>
                  <td>1/(1 + x²)</td>
                  <td>arctan(x) + C</td>
                  <td>Todo ℝ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 contextos donde la integral tiene sentido físico</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚗</span>
              <strong>Velocidad → distancia</strong>
              <p>Si v(t) es la velocidad de un coche, ∫<sub>0</sub><sup>T</sup> v(t) dt es la distancia recorrida en [0, T]. Por eso un cuentakilómetros integra continuamente la velocidad.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">⚙️</span>
              <strong>Fuerza → trabajo</strong>
              <p>El trabajo realizado por una fuerza variable es W = ∫ F(x) dx. La integral es la única forma de sumar correctamente cuando la fuerza cambia con la posición (resortes, gravedad, etc.).</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📊</span>
              <strong>Densidad de probabilidad</strong>
              <p>Para una variable continua, P(a &lt; X &lt; b) = ∫<sub>a</sub><sup>b</sup> f(x) dx donde f es la PDF. El área bajo la curva normal entre dos límites es la probabilidad de ese tramo.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📈</span>
              <strong>Valor medio de una función</strong>
              <p>El valor medio de f en [a, b] es (1/(b−a)) · ∫<sub>a</sub><sup>b</sup> f(x) dx. Por ejemplo, la temperatura media de un día se obtiene integrando T(t) y dividiendo por 24 horas.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre integrales</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Diferencia entre integral indefinida y definida?</h4>
              <p>La <strong>indefinida</strong> ∫ f(x) dx es una <em>familia de funciones</em> F(x) + C cuya derivada es f. La <strong>definida</strong> ∫<sub>a</sub><sup>b</sup> f(x) dx es un <em>número</em> que representa el área con signo entre x = a y x = b.</p>
              <p className={styles.faqTip}>💡 Conexión: definida = F(b) − F(a) (el +C se cancela al restar). Es el teorema fundamental del cálculo.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué &quot;punto medio&quot; y &quot;trapecio&quot; son mejores que izquierda y derecha?</h4>
              <p>Izquierda y derecha tienen un <strong>error proporcional a Δx</strong> (orden 1). Punto medio y trapecio tienen error <strong>proporcional a Δx²</strong> (orden 2): para reducir el error a la cuarta parte solo necesitas duplicar n. Por eso convergen mucho más rápido.</p>
              <p className={styles.faqTip}>💡 En el simulador: con n = 10 prueba los 4 métodos en x²: izquierda y derecha dan errores grandes, punto medio y trapecio dan errores 10× menores.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué hago si f no tiene primitiva elemental?</h4>
              <p>Hay funciones (e<sup>−x²</sup>, sen(x²)/x, sen(x)/x, e<sup>x</sup>/x...) cuyas integrales NO se pueden expresar con funciones elementales. En esos casos hay que <strong>aproximar numéricamente</strong> con métodos como los del simulador, o con métodos más sofisticados (Simpson, Gauss-Legendre).</p>
              <p className={styles.faqTip}>💡 Es el caso de la gaussiana e<sup>−x²</sup>. Probablemente la integral más importante de toda la estadística no tiene primitiva elemental.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si f es negativa en parte del intervalo?</h4>
              <p>La integral suma áreas bajo el eje X con <strong>signo negativo</strong>. Por eso ∫<sub>0</sub><sup>2π</sup> sen(x) dx = 0: el área positiva del primer semiperiodo se cancela exactamente con la negativa del segundo. Para calcular el <em>área geométrica total</em> debes integrar |f(x)| o partir el dominio.</p>
              <p className={styles.faqTip}>💡 En el simulador, prueba la cúbica con a = −1 y b = 1: la integral da 0, pero el área geométrica es 0,5.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuál es la relación entre derivada e integral?</h4>
              <p>El <strong>Teorema Fundamental del Cálculo</strong>: si F(x) = ∫<sub>a</sub><sup>x</sup> f(t) dt, entonces F&apos;(x) = f(x). Es decir, derivar e integrar son operaciones <em>inversas</em>. Por eso, para calcular una integral definida, basta encontrar una primitiva y restar: F(b) − F(a).</p>
              <p className={styles.faqTip}>💡 Esta es la razón por la que la tabla de integrales es prácticamente la tabla de derivadas leída al revés.</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo calcular una integral definida paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica f(x), a y b</strong>
                <p>Lee con cuidado: ¿integras de 0 a 1? ¿de −π a π? ¿la función está en términos de x o de otra variable? El cambio de variable es una de las técnicas básicas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Busca una primitiva F(x)</strong>
                <p>Usa la tabla básica, suma, producto por constante, partes (∫u dv = uv − ∫v du), sustitución (cambio de variable). Si f es polinomio o trigonométrica básica, será inmediato.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplica la regla de Barrow: F(b) − F(a)</strong>
                <p>Es el corazón del Teorema Fundamental del Cálculo. Sustituye los dos límites y resta. El + C de la primitiva indefinida se cancela: por eso no hace falta arrastrarlo en una integral definida.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Interpreta el signo</strong>
                <p>Si la integral es positiva, el área neta está por encima del eje X. Si es negativa, está mayoritariamente por debajo. Si es 0, las áreas positiva y negativa se cancelan (función impar en intervalo simétrico).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica numéricamente con Riemann</strong>
                <p>Especialmente en exámenes: aproxima con n = 10 rectángulos por punto medio. Si tu resultado analítico difiere mucho del numérico, hay un error. Es la forma más rápida de detectar fallos de signo o de cálculo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 buenas prácticas con integrales definidas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <strong>Dibuja antes de integrar</strong>
              <p>Esboza la función y marca a y b. Si f cambia de signo en el tramo, hazte una idea de dónde se cancelan áreas. Te ahorra errores de signo y te permite validar el resultado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔪</span>
              <strong>Separa el dominio si f cambia de signo</strong>
              <p>Si quieres el <em>área geométrica</em> y no la integral con signo, divide [a, b] en los tramos donde f es positiva y donde es negativa, integra cada uno y suma valores absolutos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <strong>Usa Simpson para integración numérica</strong>
              <p>El método de Simpson combina punto medio y trapecio: error de orden 4 (Δx⁴). Con solo n = 10 ya da resultados con 6-7 dígitos de precisión. Es el siguiente paso tras los métodos del simulador.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Verifica con n grande</strong>
              <p>Si tienes dudas sobre una integral analítica, ejecuta la suma de Riemann con n = 500 (punto medio) y compara. Coincidencia hasta 4 decimales = tu primitiva probablemente está bien.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes al calcular integrales</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir indefinida con definida</strong> — La indefinida da una función + C; la definida da un número. En la definida NO se escribe el +C: se cancela al restar F(b) − F(a).</li>
            <li><strong>Ignorar el signo de las áreas</strong> — ∫<sub>0</sub><sup>2π</sup> sen(x) dx = 0, no = 4. Si quieres el área geométrica entre la curva y el eje, hay que integrar |f(x)| o separar el dominio.</li>
            <li><strong>Olvidar la regla de la cadena en sustituciones</strong> — Al hacer u = g(x), hay que sustituir también dx = du/g&apos;(x). Olvidarlo es uno de los errores más persistentes.</li>
            <li><strong>Confundir signo de cos al integrar sen</strong> — ∫ sen(x) dx = <strong>−</strong>cos(x), no cos(x). Es justo el opuesto de la derivada (que sí es cos). Saltarse el menos arruina la cuenta entera.</li>
            <li><strong>Aplicar primitiva sin comprobar el dominio</strong> — ∫<sub>−1</sub><sup>1</sup> (1/x) dx NO es ln|1| − ln|−1| = 0: la función no está definida en x = 0, así que la integral diverge. Siempre comprobar continuidad antes de aplicar Barrow.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-integral-area')} />
      <ShareCard appName="simulador-integral-area" />
      <Footer appName="simulador-integral-area" />
    </div>
  );
}
