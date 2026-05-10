'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorDerivadaPendiente.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type FunctionId =
  | 'cuadratica'
  | 'cubica'
  | 'parabola_desplazada'
  | 'seno'
  | 'coseno'
  | 'exponencial'
  | 'logaritmo'
  | 'inversa';

interface FunctionDef {
  id: FunctionId;
  nombre: string;
  expr: string;
  derivada: string;
  f: (x: number) => number;
  fp: (x: number) => number;
  dominio: (x: number) => boolean;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  defaultX: number;
  notasClave: string;
}

// ============================================
// CATÁLOGO DE FUNCIONES (con derivadas analíticas)
// ============================================
const FUNCIONES: Record<FunctionId, FunctionDef> = {
  cuadratica: {
    id: 'cuadratica',
    nombre: 'f(x) = x²',
    expr: 'f(x) = x²',
    derivada: "f'(x) = 2x",
    f: (x) => x * x,
    fp: (x) => 2 * x,
    dominio: () => true,
    xMin: -4, xMax: 4, yMin: -2, yMax: 16,
    defaultX: 1.5,
    notasClave: 'Mínimo en x = 0. La derivada es lineal y pasa por el origen.',
  },
  cubica: {
    id: 'cubica',
    nombre: 'f(x) = x³',
    expr: 'f(x) = x³',
    derivada: "f'(x) = 3x²",
    f: (x) => x * x * x,
    fp: (x) => 3 * x * x,
    dominio: () => true,
    xMin: -3, xMax: 3, yMin: -10, yMax: 10,
    defaultX: 1,
    notasClave: 'Punto de inflexión en x = 0. La derivada nunca es negativa.',
  },
  parabola_desplazada: {
    id: 'parabola_desplazada',
    nombre: 'f(x) = x² − 2x + 1',
    expr: 'f(x) = x² − 2x + 1',
    derivada: "f'(x) = 2x − 2",
    f: (x) => x * x - 2 * x + 1,
    fp: (x) => 2 * x - 2,
    dominio: () => true,
    xMin: -3, xMax: 5, yMin: -2, yMax: 16,
    defaultX: 2,
    notasClave: 'Mínimo en x = 1 (donde 2x − 2 = 0). Forma vértice: (x−1)².',
  },
  seno: {
    id: 'seno',
    nombre: 'f(x) = sen(x)',
    expr: 'f(x) = sen(x)',
    derivada: "f'(x) = cos(x)",
    f: Math.sin,
    fp: Math.cos,
    dominio: () => true,
    xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -1.5, yMax: 1.5,
    defaultX: Math.PI / 4,
    notasClave: 'Máximos en π/2, 5π/2... donde cos(x) = 0. Crece donde cos(x) > 0.',
  },
  coseno: {
    id: 'coseno',
    nombre: 'f(x) = cos(x)',
    expr: 'f(x) = cos(x)',
    derivada: "f'(x) = −sen(x)",
    f: Math.cos,
    fp: (x) => -Math.sin(x),
    dominio: () => true,
    xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -1.5, yMax: 1.5,
    defaultX: Math.PI / 3,
    notasClave: 'Máximo en x = 0. La derivada es −sen(x), una onda invertida.',
  },
  exponencial: {
    id: 'exponencial',
    nombre: 'f(x) = eˣ',
    expr: 'f(x) = eˣ',
    derivada: "f'(x) = eˣ",
    f: Math.exp,
    fp: Math.exp,
    dominio: () => true,
    xMin: -3, xMax: 3, yMin: -1, yMax: 20,
    defaultX: 1,
    notasClave: 'Único caso donde f y f\' son idénticas. Pendiente siempre positiva.',
  },
  logaritmo: {
    id: 'logaritmo',
    nombre: 'f(x) = ln(x)',
    expr: 'f(x) = ln(x)',
    derivada: "f'(x) = 1/x",
    f: Math.log,
    fp: (x) => 1 / x,
    dominio: (x) => x > 0,
    xMin: 0.1, xMax: 6, yMin: -3, yMax: 2,
    defaultX: 2,
    notasClave: 'Solo definida para x > 0. La pendiente disminuye según crece x.',
  },
  inversa: {
    id: 'inversa',
    nombre: 'f(x) = 1/x',
    expr: 'f(x) = 1/x',
    derivada: "f'(x) = −1/x²",
    f: (x) => 1 / x,
    fp: (x) => -1 / (x * x),
    dominio: (x) => Math.abs(x) > 0.05,
    xMin: -4, xMax: 4, yMin: -5, yMax: 5,
    defaultX: 1,
    notasClave: 'Discontinua en x = 0 (asíntota vertical). Pendiente siempre negativa.',
  },
};

const FUNCION_IDS: FunctionId[] = ['cuadratica', 'cubica', 'parabola_desplazada', 'seno', 'coseno', 'exponencial', 'logaritmo', 'inversa'];

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 3): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

function clasificarPendiente(fp: number): { etiqueta: string; color: string; icono: string } {
  const abs = Math.abs(fp);
  if (abs < 0.01) return { etiqueta: 'Nula (posible máx/mín)', color: '#E07A1F', icono: '⏸️' };
  if (fp > 0) {
    if (abs > 5) return { etiqueta: 'Muy positiva (crece rápido)', color: '#2E86AB', icono: '🚀' };
    return { etiqueta: 'Positiva (creciente)', color: '#48A9A6', icono: '📈' };
  }
  if (abs > 5) return { etiqueta: 'Muy negativa (decrece rápido)', color: '#A82E68', icono: '📉' };
  return { etiqueta: 'Negativa (decreciente)', color: '#A82E68', icono: '📉' };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorDerivadaPendientePage() {
  const [funcId, setFuncId] = useState<FunctionId>('cuadratica');
  const [xPunto, setXPunto] = useState(1.5);
  const [mostrarDerivada, setMostrarDerivada] = useState(false);
  const [modoSecante, setModoSecante] = useState(false);
  const [hSecante, setHSecante] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const funcion = FUNCIONES[funcId];

  // Cuando cambia la función, resetear x al default y h
  useEffect(() => {
    setXPunto(funcion.defaultX);
    setHSecante(Math.min(1, (funcion.xMax - funcion.xMin) / 6));
  }, [funcId, funcion.defaultX, funcion.xMin, funcion.xMax]);

  // Validar que xPunto esté en el dominio
  const xValido = useMemo(() => funcion.dominio(xPunto), [funcion, xPunto]);

  const yPunto = useMemo(() => xValido ? funcion.f(xPunto) : NaN, [funcion, xPunto, xValido]);
  const fpPunto = useMemo(() => xValido ? funcion.fp(xPunto) : NaN, [funcion, xPunto, xValido]);

  // Punto Q (secante)
  const xQ = useMemo(() => xPunto + hSecante, [xPunto, hSecante]);
  const yQ = useMemo(() => funcion.dominio(xQ) ? funcion.f(xQ) : NaN, [funcion, xQ]);
  const pendienteSecante = useMemo(() => {
    if (!isFinite(yPunto) || !isFinite(yQ)) return NaN;
    return (yQ - yPunto) / hSecante;
  }, [yPunto, yQ, hSecante]);

  // Ángulo de la tangente en grados
  const anguloTangente = useMemo(() => (Math.atan(fpPunto) * 180) / Math.PI, [fpPunto]);

  const clasificacion = useMemo(() => clasificarPendiente(fpPunto), [fpPunto]);

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
    const colorTangent = '#E07A1F';
    const colorSecant = '#A82E68';
    const colorPoint = '#48A9A6';
    const colorDeriv = isDark ? '#FFB347' : '#7C3AED';

    ctx.clearRect(0, 0, W, H);

    const xToPx = (x: number) => pad.left + ((x - funcion.xMin) / (funcion.xMax - funcion.xMin)) * plotW;
    const yToPx = (y: number) => pad.top + plotH - ((y - funcion.yMin) / (funcion.yMax - funcion.yMin)) * plotH;

    // === GRID ===
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

    // === EJES ===
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

    // === ETIQUETAS ===
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

    // === CURVA f(x) ===
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

    // === DERIVADA f'(x) (si toggle) ===
    if (mostrarDerivada) {
      ctx.strokeStyle = colorDeriv;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      let comenzadoD = false;
      for (let i = 0; i <= Ncurve; i++) {
        const xv = funcion.xMin + (funcion.xMax - funcion.xMin) * (i / Ncurve);
        if (!funcion.dominio(xv)) {
          comenzadoD = false;
          continue;
        }
        const yv = funcion.fp(xv);
        if (yv < funcion.yMin - 100 || yv > funcion.yMax + 100) {
          comenzadoD = false;
          continue;
        }
        const px = xToPx(xv);
        const py = yToPx(Math.max(funcion.yMin - 5, Math.min(funcion.yMax + 5, yv)));
        if (!comenzadoD) {
          ctx.moveTo(px, py);
          comenzadoD = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colorDeriv;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText("--- f'(x) derivada", pad.left + 8, pad.top + 14);
    }

    if (!xValido || !isFinite(yPunto)) return;

    // === RECTA TANGENTE ===
    if (!modoSecante) {
      ctx.strokeStyle = colorTangent;
      ctx.lineWidth = 2;
      // tangente y = yPunto + fpPunto * (x - xPunto)
      const x1 = funcion.xMin;
      const x2 = funcion.xMax;
      const y1 = yPunto + fpPunto * (x1 - xPunto);
      const y2 = yPunto + fpPunto * (x2 - xPunto);
      ctx.beginPath();
      ctx.moveTo(xToPx(x1), yToPx(y1));
      ctx.lineTo(xToPx(x2), yToPx(y2));
      ctx.stroke();
    } else if (isFinite(pendienteSecante)) {
      // === RECTA SECANTE ===
      ctx.strokeStyle = colorSecant;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      const x1 = funcion.xMin;
      const x2 = funcion.xMax;
      const y1 = yPunto + pendienteSecante * (x1 - xPunto);
      const y2 = yPunto + pendienteSecante * (x2 - xPunto);
      ctx.beginPath();
      ctx.moveTo(xToPx(x1), yToPx(y1));
      ctx.lineTo(xToPx(x2), yToPx(y2));
      ctx.stroke();
      ctx.setLineDash([]);

      // tangente fina superpuesta para comparar
      ctx.strokeStyle = colorTangent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      const yt1 = yPunto + fpPunto * (x1 - xPunto);
      const yt2 = yPunto + fpPunto * (x2 - xPunto);
      ctx.beginPath();
      ctx.moveTo(xToPx(x1), yToPx(yt1));
      ctx.lineTo(xToPx(x2), yToPx(yt2));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // === PUNTO P ===
    ctx.fillStyle = colorPoint;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(xToPx(xPunto), yToPx(yPunto), 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Etiqueta P
    ctx.fillStyle = colorText;
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('P', xToPx(xPunto) + 12, yToPx(yPunto) - 8);

    // === PUNTO Q (secante) ===
    if (modoSecante && funcion.dominio(xQ) && isFinite(yQ)) {
      ctx.fillStyle = colorSecant;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xToPx(xQ), yToPx(yQ), 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colorText;
      ctx.font = 'bold 13px system-ui';
      ctx.fillText('Q', xToPx(xQ) + 12, yToPx(yQ) - 8);
    }
  }, [funcion, xPunto, xValido, yPunto, fpPunto, modoSecante, mostrarDerivada, xQ, yQ, pendienteSecante]);

  useEffect(() => {
    dibujar();
  }, [dibujar]);

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
        <h1 className={styles.title}>📈 Simulador de Derivadas — Pendiente de la Tangente</h1>
        <p className={styles.subtitle}>
          Mueve el punto P sobre la curva y observa cómo gira la recta tangente.
          Su pendiente es exactamente <strong>f&apos;(x)</strong>: ahí vive el concepto de derivada.
        </p>
      </header>

      <LegalNotice />

      {/* === SELECTOR DE FUNCIÓN === */}
      <div className={styles.functionSelector}>
        {FUNCION_IDS.map(id => (
          <button
            key={id}
            className={`${styles.funcBtn} ${funcId === id ? styles.funcBtnActive : ''}`}
            onClick={() => setFuncId(id)}
            aria-pressed={funcId === id}
          >
            {FUNCIONES[id].nombre}
          </button>
        ))}
      </div>

      {/* === MAIN CONTENT === */}
      <div className={styles.mainContent}>
        {/* CARD DE FUNCIÓN ACTIVA */}
        <div className={styles.funcInfoCard}>
          <div className={styles.funcInfoLeft}>
            <div className={styles.funcExpr}>{funcion.expr}</div>
            <div className={styles.funcDeriv}>{funcion.derivada}</div>
          </div>
          <p className={styles.funcNotes}>{funcion.notasClave}</p>
        </div>

        {/* CONTROLES */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Posición del punto P (x = <strong>{fmt(xPunto)}</strong>)
            </label>
            <input
              type="range"
              min={funcion.xMin}
              max={funcion.xMax}
              step={(funcion.xMax - funcion.xMin) / 400}
              value={xPunto}
              onChange={e => setXPunto(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Posición del punto P en el eje X"
            />
          </div>

          <div className={styles.toggleRow}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={mostrarDerivada}
                onChange={e => setMostrarDerivada(e.target.checked)}
              />
              <span>Mostrar curva de la derivada f&apos;(x)</span>
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={modoSecante}
                onChange={e => setModoSecante(e.target.checked)}
              />
              <span>Modo secante (P→Q): visualizar el límite</span>
            </label>
          </div>

          {modoSecante && (
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Distancia entre P y Q (h = <strong>{fmt(hSecante)}</strong>)
              </label>
              <input
                type="range"
                min={0.01}
                max={(funcion.xMax - funcion.xMin) / 3}
                step={0.01}
                value={hSecante}
                onChange={e => setHSecante(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Distancia h entre P y Q"
              />
              <p className={styles.hint}>
                Reduce h hacia 0 y observa cómo la secante (rosa, discontinua) se confunde con la tangente (naranja).
                Eso es exactamente el límite que define la derivada.
              </p>
            </div>
          )}
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Gráfica de la función con la recta tangente" />
        </div>

        {/* RESULTADOS */}
        {xValido ? (
          <div className={styles.resultsPanel}>
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>x</span>
              <span className={styles.resultValue}>{fmt(xPunto)}</span>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>f(x)</span>
              <span className={styles.resultValue}>{fmt(yPunto)}</span>
            </div>
            <div className={styles.resultCardMain} style={{ borderColor: clasificacion.color }}>
              <span className={styles.resultLabel}>f&apos;(x) — pendiente de la tangente</span>
              <span className={styles.resultValueLarge} style={{ color: clasificacion.color }}>{fmt(fpPunto)}</span>
              <span className={styles.resultClassification}>{clasificacion.icono} {clasificacion.etiqueta}</span>
            </div>
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Ángulo de la tangente</span>
              <span className={styles.resultValue}>{fmt(anguloTangente, 1)}°</span>
            </div>
            {modoSecante && isFinite(pendienteSecante) && (
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Pendiente secante PQ</span>
                <span className={styles.resultValue} style={{ color: '#A82E68' }}>{fmt(pendienteSecante)}</span>
                <span className={styles.resultRange}>
                  Diferencia con f&apos;(x): {fmt(pendienteSecante - fpPunto)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.warningPanel}>
            ⚠️ El punto x = {fmt(xPunto)} está fuera del dominio de {funcion.expr}. Mueve el slider a una zona válida.
          </div>
        )}
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende qué es la derivada"
        subtitle="De la recta tangente al cálculo diferencial"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es la derivada de una función?</h3>
          <p>
            La <strong>derivada</strong> de una función f en un punto x = a, escrita f&apos;(a), es la
            <strong> pendiente de la recta tangente</strong> a la gráfica de f en ese punto. Mide la
            <em> velocidad de cambio</em> de f en x = a.
          </p>
          <ul className={styles.bulletList}>
            <li>Si <strong>f&apos;(a) &gt; 0</strong>, f es <em>creciente</em> en x = a (sube).</li>
            <li>Si <strong>f&apos;(a) &lt; 0</strong>, f es <em>decreciente</em> en x = a (baja).</li>
            <li>Si <strong>f&apos;(a) = 0</strong>, hay un <em>punto crítico</em>: posible máximo, mínimo o punto de inflexión horizontal.</li>
          </ul>
          <div className={styles.formulaBox}>
            f&apos;(a) = lim<sub>h→0</sub> [ f(a+h) − f(a) ] / h
          </div>
          <p>
            Esa expresión es la pendiente de la <strong>secante</strong> entre los puntos (a, f(a)) y (a+h, f(a+h)).
            Cuando h se acerca a 0, la secante se transforma en la tangente, y su pendiente se convierte en f&apos;(a).
            Activa el <em>modo secante</em> arriba para verlo en directo.
          </p>
        </section>

        {/* TABLA DERIVADAS */}
        <section>
          <h3>Las 8 derivadas que tienes que saber de memoria</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Función f(x)</th>
                  <th>Derivada f&apos;(x)</th>
                  <th>Recordar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>k (constante)</td>
                  <td>0</td>
                  <td>Una recta horizontal no tiene pendiente</td>
                </tr>
                <tr>
                  <td>x<sup>n</sup></td>
                  <td>n · x<sup>n−1</sup></td>
                  <td>Regla del exponente: baja n y resta uno</td>
                </tr>
                <tr>
                  <td>sen(x)</td>
                  <td>cos(x)</td>
                  <td>Sen → cos (sin signo)</td>
                </tr>
                <tr>
                  <td>cos(x)</td>
                  <td>−sen(x)</td>
                  <td>Cos → −sen (signo negativo)</td>
                </tr>
                <tr>
                  <td>e<sup>x</sup></td>
                  <td>e<sup>x</sup></td>
                  <td>Única función que es su propia derivada</td>
                </tr>
                <tr>
                  <td>ln(x)</td>
                  <td>1/x</td>
                  <td>Solo definida para x &gt; 0</td>
                </tr>
                <tr>
                  <td>1/x = x<sup>−1</sup></td>
                  <td>−1/x²</td>
                  <td>Aplicación directa de la regla del exponente</td>
                </tr>
                <tr>
                  <td>√x = x<sup>1/2</sup></td>
                  <td>1 / (2√x)</td>
                  <td>Pendiente infinita en x = 0 (tangente vertical)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 contextos donde la derivada cuenta una historia</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🚗</span>
              <strong>Posición → velocidad</strong>
              <p>Si s(t) describe la posición de un coche en el tiempo, s&apos;(t) es su velocidad instantánea. Por eso el cuentakilómetros marca derivadas en tiempo real, no medias.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📈</span>
              <strong>Coste → coste marginal</strong>
              <p>En economía, si C(q) es el coste total de producir q unidades, C&apos;(q) es el coste marginal: cuánto cuesta producir una unidad más. Decisiones clave de producción dependen de él.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🏔️</span>
              <strong>Encontrar máximos y mínimos</strong>
              <p>Para optimizar (maximizar beneficio, minimizar coste, encontrar la altura máxima de un proyectil), se busca dónde f&apos;(x) = 0 y se estudia el signo a su alrededor.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🌡️</span>
              <strong>Tasa de cambio en ciencias</strong>
              <p>Velocidad de una reacción química, ritmo de cambio de temperatura, crecimiento de una población: todas son derivadas de magnitudes respecto al tiempo.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre derivadas</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué la pendiente de la tangente y no de la curva?</h4>
              <p>Porque una curva no tiene una pendiente única: cambia en cada punto. La tangente es la mejor aproximación lineal en un punto concreto, y su pendiente captura cómo cambia la función justo ahí.</p>
              <p className={styles.faqTip}>💡 Imagina que conduces por una carretera curva: tu velocidad lateral instantánea está dictada por la inclinación de la tangente al asfalto, no por la curvatura global.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué relación hay entre derivada y límite?</h4>
              <p>La derivada <em>es</em> un límite: el límite de la pendiente de la secante cuando los dos puntos se acercan. Sin la idea de límite, la derivada no se podría definir rigurosamente. Activa el modo secante en el simulador y reduce h para verlo.</p>
              <p className={styles.faqTip}>💡 La pendiente secante (y −y₀)/(x−x₀) es la velocidad media. El límite cuando x→x₀ es la velocidad instantánea.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo no existe la derivada?</h4>
              <p>Cuando la función tiene un <strong>pico angular</strong> (como |x| en x = 0), una <strong>discontinuidad</strong> (como 1/x en x = 0) o una <strong>tangente vertical</strong> (como √x en x = 0). En esos casos no se puede dibujar una única tangente.</p>
              <p className={styles.faqTip}>💡 Una función puede ser continua pero no derivable: |x| es el ejemplo clásico. La derivabilidad es más restrictiva que la continuidad.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué dice la derivada sobre máximos y mínimos?</h4>
              <p>Si f&apos;(a) = 0 y f&apos;(x) cambia de positiva a negativa en a, hay un <strong>máximo local</strong>. Si cambia de negativa a positiva, hay un <strong>mínimo local</strong>. Si no cambia de signo, es un punto de inflexión horizontal.</p>
              <p className={styles.faqTip}>💡 El criterio de la segunda derivada: si f&apos;(a) = 0 y f&apos;&apos;(a) &gt; 0, es mínimo. Si f&apos;&apos;(a) &lt; 0, es máximo. Si f&apos;&apos;(a) = 0, no concluye.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué la derivada de eˣ es eˣ?</h4>
              <p>e (≈ 2,718) se define justamente como el número cuya función exponencial tiene pendiente 1 en x = 0. De ahí se deduce que la pendiente en cualquier x es eˣ. Es la única base con esta propiedad: por eso e es tan especial en cálculo.</p>
              <p className={styles.faqTip}>💡 Para 2ˣ, la derivada es 2ˣ · ln(2). Solo eˣ se &quot;auto-deriva&quot; sin factor extra.</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo calcular una derivada paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica la estructura de la función</strong>
                <p>¿Es una suma, un producto, un cociente, una composición? Cada estructura tiene su propia regla. Reconocerla es el 80 % del trabajo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Aplica la regla correspondiente</strong>
                <p><strong>Suma:</strong> (f+g)&apos; = f&apos; + g&apos;. <strong>Producto:</strong> (f·g)&apos; = f&apos;·g + f·g&apos;. <strong>Cociente:</strong> (f/g)&apos; = (f&apos;·g − f·g&apos;)/g². <strong>Cadena:</strong> (f∘g)&apos; = f&apos;(g(x)) · g&apos;(x).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Sustituye las derivadas elementales</strong>
                <p>Usa la tabla básica: x<sup>n</sup> → n·x<sup>n−1</sup>, sen → cos, cos → −sen, eˣ → eˣ, ln(x) → 1/x. Si tienes que componer, no olvides la regla de la cadena.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Simplifica el resultado</strong>
                <p>Saca factor común, agrupa, reduce fracciones. Una derivada bien simplificada se interpreta mejor y se evalúa más rápido en exámenes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica numéricamente</strong>
                <p>Elige un valor x₀, calcula f&apos;(x₀) con tu fórmula y compáralo con la pendiente de la secante (f(x₀+0,001)−f(x₀))/0,001. Si la diferencia es enorme, hay un error.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 buenas prácticas con derivadas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
              <strong>Aprende las reglas, no memorices casos</strong>
              <p>Si dominas regla del producto, cociente y cadena, puedes derivar cualquier combinación. Memorizar derivadas concretas solo te resuelve un examen, las reglas te resuelven todos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <strong>Comprueba el signo de la derivada</strong>
              <p>Antes de dar un resultado, mira si tiene sentido. Si la función crece y obtienes f&apos; &lt; 0, hay un error. La intuición visual es tu mejor control de calidad.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <strong>Dibuja siempre la tangente</strong>
              <p>En problemas de optimización, esboza la función y marca dónde la tangente es horizontal. Esos puntos son tus candidatos a máximos y mínimos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔁</span>
              <strong>Repite con derivadas analíticas y numéricas</strong>
              <p>Calcula la derivada con reglas y luego compárala con la aproximación numérica. Es la mejor forma de detectar errores de signo, factores olvidados o reglas mal aplicadas.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes al calcular derivadas</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Olvidar la regla de la cadena</strong> — Para sen(2x), la derivada es 2·cos(2x), no cos(2x). Al componer funciones, hay que multiplicar por la derivada del &quot;dentro&quot;. Es el error más típico de Bachillerato.</li>
            <li><strong>Confundir derivada de cos con sen</strong> — Sen → cos (positivo). Cos → −sen (NEGATIVO). El signo negativo del coseno se olvida muy a menudo y arruina el resto del cálculo.</li>
            <li><strong>Tratar el producto como suma</strong> — (f·g)&apos; ≠ f&apos;·g&apos;. La regla del producto es f&apos;·g + f·g&apos;. Saltársela es uno de los errores más persistentes.</li>
            <li><strong>Aplicar mal la regla del cociente</strong> — Es f&apos;·g − f·g&apos; (en ese orden) dividido por g². Invertir el orden del numerador cambia el signo y arruina el problema.</li>
            <li><strong>Decir &quot;f&apos;(a) = 0 implica máximo o mínimo&quot;</strong> — No siempre. f(x) = x³ tiene f&apos;(0) = 0 pero ahí no hay extremo, sino punto de inflexión horizontal. Hay que comprobar siempre el cambio de signo de f&apos; o el signo de f&apos;&apos;.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-derivada-pendiente')} />
      <ShareCard appName="simulador-derivada-pendiente" />
      <Footer appName="simulador-derivada-pendiente" />
    </div>
  );
}
