'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './SeriesConvergencia.module.css';
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
// Tipos
// ─────────────────────────────────────────────

type TabKey = 'taylor' | 'criterios' | 'pi';

type FuncionKey = 'sin' | 'cos' | 'exp' | 'ln' | 'geom';

interface FuncionDef {
  label: string;
  formula: string;
  fn: (x: number) => number;
  taylorTerm: (n: number, x: number, x0: number) => number;
  radioConv: number; // Infinity si converge en todo R
  termLabel: (n: number) => string;
}

type SerieKey = 'harmonica2' | 'harmonica' | 'geometrica' | 'alternada' | 'nfactnnn';

interface SerieDef {
  label: string;
  termino: (n: number, r?: number) => number;
  convergencia: (r?: number) => { converge: boolean; limite?: number; criterio: string };
}

// ─────────────────────────────────────────────
// Utilidades matemáticas
// ─────────────────────────────────────────────

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function taylorSin(n: number, x: number, x0: number): number {
  // Término n-ésimo de sin alrededor de x0
  // sin^(n)(x0) / n! * (x-x0)^n
  const dx = x - x0;
  const derivSin = [Math.sin(x0), Math.cos(x0), -Math.sin(x0), -Math.cos(x0)];
  const d = derivSin[n % 4];
  return (d / factorial(n)) * Math.pow(dx, n);
}

function taylorCos(n: number, x: number, x0: number): number {
  const dx = x - x0;
  const derivCos = [Math.cos(x0), -Math.sin(x0), -Math.cos(x0), Math.sin(x0)];
  const d = derivCos[n % 4];
  return (d / factorial(n)) * Math.pow(dx, n);
}

function taylorExp(n: number, x: number, x0: number): number {
  const dx = x - x0;
  return (Math.exp(x0) / factorial(n)) * Math.pow(dx, n);
}

function taylorLn(n: number, x: number, x0: number): number {
  // ln(1+x) alrededor de x0=0: términos (-1)^(n+1) * x^n / n, n>=1
  if (n === 0) return Math.log(1 + x0);
  const dx = x - x0;
  // Derivada n de ln(1+x) en x0: (-1)^(n+1) * (n-1)! / (1+x0)^n
  const deriv = Math.pow(-1, n + 1) * factorial(n - 1) / Math.pow(1 + x0, n);
  return (deriv / factorial(n)) * Math.pow(dx, n);
}

function taylorGeom(n: number, x: number, x0: number): number {
  // 1/(1-x) alrededor de x0=0: término n = x^n
  const dx = x - x0;
  // Derivada n de 1/(1-x) en x0: n! / (1-x0)^(n+1)
  const deriv = factorial(n) / Math.pow(1 - x0, n + 1);
  return (deriv / factorial(n)) * Math.pow(dx, n);
}

const FUNCIONES: Record<FuncionKey, FuncionDef> = {
  sin: {
    label: 'sin(x)',
    formula: 'sin(x) = x − x³/3! + x⁵/5! − x⁷/7! + ···',
    fn: Math.sin,
    taylorTerm: taylorSin,
    radioConv: Infinity,
    termLabel: (n) => {
      if (n % 2 === 0) return '0';
      const k = (n - 1) / 2;
      const sign = k % 2 === 0 ? '+' : '−';
      return `${sign} x^${n}/${n}!`;
    },
  },
  cos: {
    label: 'cos(x)',
    formula: 'cos(x) = 1 − x²/2! + x⁴/4! − x⁶/6! + ···',
    fn: Math.cos,
    taylorTerm: taylorCos,
    radioConv: Infinity,
    termLabel: (n) => {
      if (n % 2 !== 0) return '0';
      const k = n / 2;
      const sign = k % 2 === 0 ? '+' : '−';
      return `${sign} x^${n}/${n}!`;
    },
  },
  exp: {
    label: 'eˣ',
    formula: 'eˣ = 1 + x + x²/2! + x³/3! + ···',
    fn: Math.exp,
    taylorTerm: taylorExp,
    radioConv: Infinity,
    termLabel: (n) => (n === 0 ? '1' : `x^${n}/${n}!`),
  },
  ln: {
    label: 'ln(1+x)',
    formula: 'ln(1+x) = x − x²/2 + x³/3 − x⁴/4 + ···  (|x|<1)',
    fn: (x) => Math.log(1 + x),
    taylorTerm: taylorLn,
    radioConv: 1,
    termLabel: (n) => {
      if (n === 0) return '0';
      const sign = n % 2 === 1 ? '+' : '−';
      return `${sign} x^${n}/${n}`;
    },
  },
  geom: {
    label: '1/(1−x)',
    formula: '1/(1−x) = 1 + x + x² + x³ + ···  (|x|<1)',
    fn: (x) => 1 / (1 - x),
    taylorTerm: taylorGeom,
    radioConv: 1,
    termLabel: (n) => `x^${n}`,
  },
};

// ─────────────────────────────────────────────
// Series para criterios
// ─────────────────────────────────────────────

const SERIES: Record<SerieKey, SerieDef> = {
  harmonica2: {
    label: 'Σ 1/n² (converge → π²/6)',
    termino: (n) => 1 / (n * n),
    convergencia: () => ({
      converge: true,
      limite: Math.PI * Math.PI / 6,
      criterio: 'Serie p con p=2 > 1. Converge a π²/6 ≈ 1.6449 (Euler, 1734).',
    }),
  },
  harmonica: {
    label: 'Σ 1/n (diverge)',
    termino: (n) => 1 / n,
    convergencia: () => ({
      converge: false,
      criterio: 'Serie p con p=1. Diverge (serie armónica). Crece sin límite aunque muy despacio.',
    }),
  },
  geometrica: {
    label: 'Σ rⁿ (geométrica)',
    termino: (n, r = 0.5) => Math.pow(r, n),
    convergencia: (r = 0.5) => {
      const absR = Math.abs(r);
      if (absR < 1) {
        return {
          converge: true,
          limite: 1 / (1 - r),
          criterio: `|r| = ${absR.toFixed(2)} < 1. Converge a S = 1/(1−r) = ${(1 / (1 - r)).toFixed(4)}`,
        };
      }
      return {
        converge: false,
        criterio: `|r| = ${absR.toFixed(2)} ≥ 1. Diverge.`,
      };
    },
  },
  alternada: {
    label: 'Σ (−1)ⁿ/n (alternada)',
    termino: (n) => Math.pow(-1, n) / n,
    convergencia: () => ({
      converge: true,
      limite: Math.log(2),
      criterio: 'Criterio de Leibniz: términos decrecen a 0. Converge a ln(2) ≈ 0.6931.',
    }),
  },
  nfactnnn: {
    label: 'Σ n!/nⁿ (razón)',
    termino: (n) => factorial(Math.min(n, 20)) / Math.pow(n, n),
    convergencia: () => ({
      converge: true,
      limite: undefined,
      criterio: 'Criterio de la razón: L = lím |aₙ₊₁/aₙ| = 1/e ≈ 0.368 < 1. Converge.',
    }),
  },
};

// ─────────────────────────────────────────────
// Cálculo de π
// ─────────────────────────────────────────────

function calcLeibniz(N: number): number {
  let s = 0;
  for (let k = 0; k < N; k++) {
    s += Math.pow(-1, k) / (2 * k + 1);
  }
  return 4 * s;
}

function calcNilakantha(N: number): number {
  let s = 3;
  for (let k = 1; k <= N; k++) {
    const n = 2 * k;
    const term = 4 / (n * (n + 1) * (n + 2));
    s += k % 2 === 1 ? term : -term;
  }
  return s;
}

function calcWallis(N: number): number {
  let producto = 1;
  for (let k = 1; k <= N; k++) {
    producto *= (2 * k * (2 * k)) / ((2 * k - 1) * (2 * k + 1));
  }
  return 2 * producto;
}

function decimalesCorrectos(valor: number, pi: number): number {
  const diff = Math.abs(valor - pi);
  if (diff === 0) return 10;
  return Math.max(0, Math.floor(-Math.log10(diff)));
}

// ─────────────────────────────────────────────
// Helpers SVG
// ─────────────────────────────────────────────

function puntosAPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
}

// ─────────────────────────────────────────────
// Tab 1: Taylor
// ─────────────────────────────────────────────

function TaylorTab() {
  const [funcion, setFuncion] = useState<FuncionKey>('sin');
  const [nTerminos, setNTerminos] = useState(3);
  const [x0, setX0] = useState(0);

  const def = FUNCIONES[funcion];
  const radioConv = def.radioConv;

  // Rango de visualización limitado por radio de convergencia
  const xMin = radioConv === Infinity ? -2 * Math.PI : -radioConv + x0;
  const xMax = radioConv === Infinity ? 2 * Math.PI : radioConv + x0;

  const SVG_W = 400;
  const SVG_H = 280;
  const PAD = 32;

  // Puntos de la función real
  const muestras = 200;
  const xStep = (xMax - xMin) / muestras;

  const puntosReales: Array<{ x: number; y: number }> = [];
  const puntosTaylor: Array<{ x: number; y: number }> = [];
  const valoresY: number[] = [];

  for (let i = 0; i <= muestras; i++) {
    const xVal = xMin + i * xStep;
    const yReal = def.fn(xVal);
    if (isFinite(yReal) && Math.abs(yReal) < 20) valoresY.push(yReal);

    // Taylor parcial
    let yTaylor = 0;
    for (let k = 0; k < nTerminos; k++) {
      const t = def.taylorTerm(k, xVal, x0);
      if (isFinite(t)) yTaylor += t;
    }
    if (isFinite(yTaylor) && Math.abs(yTaylor) < 20) valoresY.push(yTaylor);
  }

  const yMin = Math.max(-8, Math.min(...valoresY));
  const yMax = Math.min(8, Math.max(...valoresY));
  const yRange = yMax - yMin || 2;

  function toSVG(xVal: number, yVal: number): { x: number; y: number } {
    return {
      x: PAD + ((xVal - xMin) / (xMax - xMin)) * (SVG_W - 2 * PAD),
      y: PAD + ((yMax - yVal) / yRange) * (SVG_H - 2 * PAD),
    };
  }

  for (let i = 0; i <= muestras; i++) {
    const xVal = xMin + i * xStep;
    const yReal = def.fn(xVal);
    if (isFinite(yReal) && Math.abs(yReal) < 20) {
      puntosReales.push(toSVG(xVal, yReal));
    } else {
      puntosReales.push({ x: NaN, y: NaN });
    }

    let yTaylor = 0;
    for (let k = 0; k < nTerminos; k++) {
      const t = def.taylorTerm(k, xVal, x0);
      if (isFinite(t)) yTaylor += t;
    }
    if (isFinite(yTaylor) && Math.abs(yTaylor) < 20) {
      puntosTaylor.push(toSVG(xVal, yTaylor));
    } else {
      puntosTaylor.push({ x: NaN, y: NaN });
    }
  }

  // Filtrar segmentos continuos (sin NaN)
  function segmentos(pts: Array<{ x: number; y: number }>): string {
    const paths: string[] = [];
    let seg: Array<{ x: number; y: number }> = [];
    for (const p of pts) {
      if (isNaN(p.x) || isNaN(p.y)) {
        if (seg.length > 1) paths.push(puntosAPath(seg));
        seg = [];
      } else {
        seg.push(p);
      }
    }
    if (seg.length > 1) paths.push(puntosAPath(seg));
    return paths.join(' ');
  }

  // Ejes
  const origenSVG = toSVG(0, 0);
  const xAxisY = Math.max(PAD, Math.min(SVG_H - PAD, origenSVG.y));
  const yAxisX = Math.max(PAD, Math.min(SVG_W - PAD, origenSVG.x));

  // Error en x=1 (si está en rango)
  const xEval = Math.max(xMin + 0.01, Math.min(xMax - 0.01, 1));
  const yReal1 = def.fn(xEval);
  let yTaylor1 = 0;
  for (let k = 0; k < nTerminos; k++) {
    const t = def.taylorTerm(k, xEval, x0);
    if (isFinite(t)) yTaylor1 += t;
  }
  const error = Math.abs(yReal1 - yTaylor1);
  const errorPct = Math.min(100, Math.log10(1 + error * 1000) / 3 * 100);

  // Términos numéricos en x=xEval
  const terminos: Array<{ n: number; valor: number; label: string }> = [];
  for (let k = 0; k < Math.min(nTerminos, 10); k++) {
    const t = def.taylorTerm(k, xEval, x0);
    terminos.push({ n: k, valor: t, label: def.termLabel(k) });
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.controles}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Función:</label>
          <div className={styles.chipGroup}>
            {(Object.keys(FUNCIONES) as FuncionKey[]).map((k) => (
              <button
                key={k}
                className={`${styles.chip} ${funcion === k ? styles.chipActive : ''}`}
                onClick={() => setFuncion(k)}
              >
                {FUNCIONES[k].label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.controlRow}>
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Número de términos N = <strong>{nTerminos}</strong>
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={nTerminos}
              onChange={(e) => setNTerminos(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Punto de expansión x₀ = <strong>{x0.toFixed(1)}</strong>
            </label>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.1}
              value={x0}
              onChange={(e) => setX0(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>
      </div>

      <div className={styles.formulaBox}>
        <span className={styles.formulaText}>{def.formula}</span>
      </div>

      <div className={styles.svgWrapper}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className={styles.grafica}>
          {/* Ejes */}
          <line x1={PAD} y1={xAxisY} x2={SVG_W - PAD} y2={xAxisY} stroke="var(--text-muted)" strokeWidth="1" />
          <line x1={yAxisX} y1={PAD} x2={yAxisX} y2={SVG_H - PAD} stroke="var(--text-muted)" strokeWidth="1" />
          {/* Función real */}
          <path d={segmentos(puntosReales)} fill="none" stroke="#48A9A6" strokeWidth="2.5" />
          {/* Aproximación Taylor */}
          <path d={segmentos(puntosTaylor)} fill="none" stroke="#2E86AB" strokeWidth="2" strokeDasharray="6 3" />
          {/* Leyenda */}
          <line x1={PAD + 4} y1={SVG_H - 10} x2={PAD + 22} y2={SVG_H - 10} stroke="#48A9A6" strokeWidth="2.5" />
          <text x={PAD + 26} y={SVG_H - 6} fontSize="10" fill="var(--text-secondary)">f(x) real</text>
          <line x1={PAD + 80} y1={SVG_H - 10} x2={PAD + 98} y2={SVG_H - 10} stroke="#2E86AB" strokeWidth="2" strokeDasharray="4 2" />
          <text x={PAD + 102} y={SVG_H - 6} fontSize="10" fill="var(--text-secondary)">Taylor N={nTerminos}</text>
        </svg>
      </div>

      <div className={styles.errorSection}>
        <div className={styles.errorHeader}>
          <span>Error residual |f({xEval.toFixed(1)}) − T_{nTerminos}({xEval.toFixed(1)})| = </span>
          <strong className={styles.errorVal}>{error < 1e-10 ? '≈ 0' : error.toExponential(3)}</strong>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${errorPct}%` }} />
        </div>
      </div>

      <div className={styles.terminosSection}>
        <h3 className={styles.terminosTitulo}>Primeros {nTerminos} términos evaluados en x = {xEval.toFixed(1)}</h3>
        <div className={styles.terminosGrid}>
          {terminos.map((t) => (
            <div key={t.n} className={styles.terminoCard}>
              <div className={styles.terminoN}>n={t.n}</div>
              <div className={styles.terminoLabel}>{t.label}</div>
              <div className={styles.terminoValor}>{isFinite(t.valor) ? t.valor.toFixed(5) : 'indefinido'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Criterios de Convergencia
// ─────────────────────────────────────────────

function CriteriosTab() {
  const [serie, setSerie] = useState<SerieKey>('harmonica2');
  const [rGeom, setRGeom] = useState(0.5);

  const def = SERIES[serie];
  const conv = def.convergencia(serie === 'geometrica' ? rGeom : undefined);

  const SVG_W = 400;
  const SVG_H = 220;
  const PAD = 36;
  const N_MAX = 50;

  // Calcular sumas parciales
  const sumasParciales = useMemo(() => {
    const sumas: number[] = [];
    let acum = 0;
    for (let n = 1; n <= N_MAX; n++) {
      const t = def.termino(n, serie === 'geometrica' ? rGeom : undefined);
      acum += t;
      sumas.push(acum);
    }
    return sumas;
  }, [serie, rGeom, def]);

  const yVals = sumasParciales.filter(isFinite);
  const yMin = Math.min(...yVals);
  const yMax = Math.max(...yVals);
  const yRange = yMax - yMin || 1;
  const yPad = yRange * 0.1;

  function toSVG(n: number, y: number): { x: number; y: number } {
    return {
      x: PAD + ((n - 1) / (N_MAX - 1)) * (SVG_W - 2 * PAD),
      y: PAD + ((yMax + yPad - y) / (yRange + 2 * yPad)) * (SVG_H - 2 * PAD),
    };
  }

  const puntos = sumasParciales.map((s, i) => isFinite(s) ? toSVG(i + 1, Math.max(yMin - yPad, Math.min(yMax + yPad, s))) : { x: NaN, y: NaN });

  function segmentos(pts: Array<{ x: number; y: number }>): string {
    const paths: string[] = [];
    let seg: Array<{ x: number; y: number }> = [];
    for (const p of pts) {
      if (isNaN(p.x)) { if (seg.length > 1) paths.push(puntosAPath(seg)); seg = []; }
      else seg.push(p);
    }
    if (seg.length > 1) paths.push(puntosAPath(seg));
    return paths.join(' ');
  }

  // Línea del límite
  const limiteY = conv.converge && conv.limite !== undefined ? toSVG(1, conv.limite).y : null;

  // Razón entre términos consecutivos (para visualizar)
  const razones: number[] = [];
  for (let n = 2; n <= Math.min(15, N_MAX); n++) {
    const an = def.termino(n, serie === 'geometrica' ? rGeom : undefined);
    const an1 = def.termino(n - 1, serie === 'geometrica' ? rGeom : undefined);
    if (Math.abs(an1) > 1e-15) razones.push(Math.abs(an / an1));
  }
  const razónLimite = razones.length > 0 ? razones[razones.length - 1] : undefined;

  return (
    <div className={styles.tabContent}>
      <div className={styles.controles}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Serie:</label>
          <div className={styles.chipGroup}>
            {(Object.keys(SERIES) as SerieKey[]).map((k) => (
              <button
                key={k}
                className={`${styles.chip} ${serie === k ? styles.chipActive : ''}`}
                onClick={() => setSerie(k)}
              >
                {SERIES[k].label}
              </button>
            ))}
          </div>
        </div>
        {serie === 'geometrica' && (
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Razón r = <strong>{rGeom.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min={-0.99}
              max={0.99}
              step={0.01}
              value={rGeom}
              onChange={(e) => setRGeom(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        )}
      </div>

      <div className={styles.svgWrapper}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className={styles.grafica}>
          {/* Ejes */}
          <line x1={PAD} y1={SVG_H - PAD} x2={SVG_W - PAD} y2={SVG_H - PAD} stroke="var(--text-muted)" strokeWidth="1" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={SVG_H - PAD} stroke="var(--text-muted)" strokeWidth="1" />
          {/* Línea del límite */}
          {limiteY !== null && (
            <line x1={PAD} y1={limiteY} x2={SVG_W - PAD} y2={limiteY} stroke="#E84A5F" strokeWidth="1.5" strokeDasharray="4 3" />
          )}
          {/* Sumas parciales */}
          <path d={segmentos(puntos)} fill="none" stroke="#2E86AB" strokeWidth="2" />
          {/* Puntos */}
          {puntos.filter((_, i) => i % 5 === 0).map((p, i) => (
            !isNaN(p.x) && <circle key={i} cx={p.x} cy={p.y} r="3" fill="#48A9A6" />
          ))}
          {/* Etiqueta eje x */}
          <text x={SVG_W - PAD} y={SVG_H - PAD + 14} fontSize="10" fill="var(--text-muted)" textAnchor="middle">N={N_MAX}</text>
          <text x={PAD} y={SVG_H - PAD + 14} fontSize="10" fill="var(--text-muted)" textAnchor="middle">1</text>
        </svg>
      </div>

      <div className={`${styles.convCard} ${conv.converge ? styles.convConverge : styles.convDiverge}`}>
        <div className={styles.convBadge}>{conv.converge ? '✓ Converge' : '✗ Diverge'}</div>
        {conv.converge && conv.limite !== undefined && (
          <div className={styles.convLimite}>Límite: {conv.limite.toFixed(6)}</div>
        )}
        <p className={styles.convCriterio}>{conv.criterio}</p>
        {razónLimite !== undefined && (
          <p className={styles.convRazon}>
            Criterio de la razón: |aₙ₊₁/aₙ| → <strong>{razónLimite.toFixed(4)}</strong>
            {razónLimite < 1 ? ' < 1 → converge' : razónLimite > 1 ? ' > 1 → diverge' : ' = 1 → indeterminado'}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Calculando π
// ─────────────────────────────────────────────

const PI_REAL = Math.PI;

// Términos necesarios para k decimales correctos
function terminosParaDecimals(calcFn: (n: number) => number, k: number, maxN: number): number {
  for (let n = 1; n <= maxN; n++) {
    const val = calcFn(n);
    const dec = decimalesCorrectos(val, PI_REAL);
    if (dec >= k) return n;
  }
  return maxN;
}

function PiTab() {
  const [nTerminos, setNTerminos] = useState(10);

  const leibniz = calcLeibniz(nTerminos);
  const nilakantha = calcNilakantha(nTerminos);
  const wallis = calcWallis(nTerminos);

  const decLeibniz = decimalesCorrectos(leibniz, PI_REAL);
  const decNilakantha = decimalesCorrectos(nilakantha, PI_REAL);
  const decWallis = decimalesCorrectos(wallis, PI_REAL);

  const maxN = 1000;

  const tablaDecimales = useMemo(() => {
    return [1, 2, 3, 4, 5].map((k) => ({
      k,
      leibniz: terminosParaDecimals(calcLeibniz, k, maxN),
      nilakantha: terminosParaDecimals(calcNilakantha, k, maxN),
      wallis: terminosParaDecimals(calcWallis, k, maxN),
    }));
  }, []);

  function barraPI(val: number, real: number): number {
    // % de acercamiento visual (no lineal)
    const diff = Math.abs(val - real);
    return Math.max(0, Math.min(100, 100 - Math.log10(1 + diff * 1e5) * 20));
  }

  const series = [
    {
      nombre: 'Leibniz',
      formula: 'π/4 = 1 − 1/3 + 1/5 − 1/7 + ···',
      valor: leibniz,
      dec: decLeibniz,
      color: '#2E86AB',
    },
    {
      nombre: 'Nilakantha',
      formula: 'π = 3 + 4/(2·3·4) − 4/(4·5·6) + ···',
      valor: nilakantha,
      dec: decNilakantha,
      color: '#48A9A6',
    },
    {
      nombre: 'Wallis',
      formula: 'π/2 = (2·2·4·4·6·6···)/(1·3·3·5·5·7···)',
      valor: wallis,
      dec: decWallis,
      color: '#E84A5F',
    },
  ];

  return (
    <div className={styles.tabContent}>
      <div className={styles.controles}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>
            Número de términos N = <strong>{nTerminos}</strong>
          </label>
          <input
            type="range"
            min={1}
            max={1000}
            value={nTerminos}
            onChange={(e) => setNTerminos(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.piReal}>π real = {PI_REAL.toFixed(10)}</div>
        </div>
      </div>

      <div className={styles.piSeries}>
        {series.map((s) => (
          <div key={s.nombre} className={styles.piCard}>
            <div className={styles.piCardHeader}>
              <span className={styles.piNombre}>{s.nombre}</span>
              <span className={styles.piDec}>{s.dec} decimal{s.dec !== 1 ? 'es' : ''} exacto{s.dec !== 1 ? 's' : ''}</span>
            </div>
            <div className={styles.piFormula}>{s.formula}</div>
            <div className={styles.piValor}>{s.valor.toFixed(10)}</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${barraPI(s.valor, PI_REAL)}%`, backgroundColor: s.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tablaSection}>
        <h3 className={styles.tablaTitulo}>Términos necesarios para k decimales correctos</h3>
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Decimales</th>
                <th>Leibniz</th>
                <th>Nilakantha</th>
                <th>Wallis</th>
              </tr>
            </thead>
            <tbody>
              {tablaDecimales.map((row) => (
                <tr key={row.k}>
                  <td><strong>{row.k}</strong></td>
                  <td>{row.leibniz >= maxN ? '&gt;1000' : row.leibniz}</td>
                  <td>{row.nilakantha >= maxN ? '&gt;1000' : row.nilakantha}</td>
                  <td>{row.wallis >= maxN ? '&gt;1000' : row.wallis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SeriesConvergenciaPage() {
  const [tab, setTab] = useState<TabKey>('taylor');

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'taylor', label: 'Series de Taylor' },
    { key: 'criterios', label: 'Criterios de Convergencia' },
    { key: 'pi', label: 'Calculando π' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">♾️</div>
        <h1>Visualizador de Series y Convergencia</h1>
        <p>
          Series de Taylor animadas, criterios de convergencia y cálculo de π con tres series clásicas.
          Entiende la suma infinita de forma visual e interactiva.
        </p>
      </header>

      <LegalNotice />

      <section className={styles.herramienta} aria-label="Visualizador interactivo de series">
        <div className={styles.tabs} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'taylor' && <TaylorTab />}
        {tab === 'criterios' && <CriteriosTab />}
        {tab === 'pi' && <PiTab />}
      </section>

      <EducationalSection title="¿Qué son las series y la convergencia?" subtitle="Series de Taylor, criterios de convergencia y el fascinante cálculo de π">
        <h3>Serie vs. sucesión</h3>
        <p>
          Una <strong>sucesión</strong> es una lista de números: a₁, a₂, a₃, … Una <strong>serie</strong> es
          su suma acumulada: S = a₁ + a₂ + a₃ + ··· La pregunta clave es si esta suma tiene un valor finito
          (converge) o crece sin límite (diverge).
        </p>

        <h3>Series de Taylor: aproximar con polinomios</h3>
        <p>
          La idea de Taylor es que cualquier función &ldquo;suave&rdquo; puede aproximarse alrededor de un punto
          x₀ mediante un polinomio de grado cada vez mayor. Con solo 3 términos, sin(x) ≈ x − x³/6 ya es
          una aproximación excelente cerca del origen. Con 7 u 8 términos, la diferencia es imperceptible
          en casi todo el eje real.
        </p>

        <h3>Convergencia y divergencia</h3>
        <p>
          No todas las series convergen. La serie armónica Σ 1/n diverge, aunque sus términos tienden a cero.
          La serie p con p=2 converge al sorprendente valor π²/6 (resultado de Euler). Los criterios clásicos
          (razón, raíz, comparación, Leibniz) permiten decidir la convergencia sin calcular el límite exacto.
        </p>

        <h3>Radio de convergencia</h3>
        <p>
          Las series de potencias como ln(1+x) o 1/(1−x) solo convergen para |x| &lt; 1. Fuera de ese
          radio, la suma diverge. Las series de sin, cos y eˣ convergen en todo ℝ (radio infinito).
        </p>

        {/* Sección 1 — Tabla Comparativa de criterios */}
        <h3>Tabla comparativa: criterios de convergencia</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Criterio</th>
                <th>Condición</th>
                <th>Veredicto</th>
                <th>Aplicación típica</th>
                <th>Limitación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>De la razón</strong></td>
                <td>L = lim|aₙ₊₁/aₙ|; L&lt;1→conv, L&gt;1→div, L=1→?</td>
                <td>Definitivo si L≠1</td>
                <td>Series con factorial o exponencial</td>
                <td>No decide si L=1</td>
              </tr>
              <tr>
                <td><strong>De la raíz</strong></td>
                <td>L = lim|aₙ|^(1/n); igual que razón</td>
                <td>Definitivo si L≠1</td>
                <td>Series con exponentes complicados</td>
                <td>No decide si L=1</td>
              </tr>
              <tr>
                <td><strong>Integral</strong></td>
                <td>∫₁^∞ f(x)dx converge ↔ Σaₙ converge</td>
                <td>Preciso</td>
                <td>Series de tipo 1/nᵖ (p-series)</td>
                <td>Solo para f decreciente y positiva</td>
              </tr>
              <tr>
                <td><strong>De Leibniz</strong></td>
                <td>Alternada + decreciente → converge</td>
                <td>Convergencia asegurada</td>
                <td>Series alternadas (-1)ⁿ/n</td>
                <td>Solo para series alternadas</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>¿Quién usa series de convergencia y para qué?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🖥️</span>
              <h3>Informático / Compresión</h3>
            </div>
            <p>Los códigos de Huffman minimizan la longitud media y usan la entropía (serie logarítmica). JPEG usa series de cosenos (DCT) para comprimir imágenes eliminando frecuencias imperceptibles.</p>
            <p className={styles.escenarioTip}>Sin series de Taylor no existirían los procesadores modernos de señal digital.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
              <h3>Físico Teórico</h3>
            </div>
            <p>Las series de perturbación en mecánica cuántica son series de potencias en la constante de acoplamiento. Permiten calcular energías y probabilidades con la precisión deseada.</p>
            <p className={styles.escenarioTip}>La electrodinámica cuántica es la teoría más precisa jamás comprobada gracias a estas series.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧮</span>
              <h3>Matemático Computacional</h3>
            </div>
            <p>Las series de Taylor permiten calcular sin(x), cos(x), eˣ con la precisión deseada sin usar hardware especializado. Los microprocesadores usan estas aproximaciones polinomiales internamente.</p>
            <p className={styles.escenarioTip}>Tu calculadora evalúa sin(x) usando los primeros 7-10 términos de su serie de Taylor.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
              <h3>Geodesta / Cartógrafo</h3>
            </div>
            <p>El cálculo de la forma de la Tierra usa series de Legendre para aproximar la función del geoide. Los sistemas GPS dependen de estas series para correcciones gravitacionales precisas.</p>
            <p className={styles.escenarioTip}>El sistema GPS tiene error de ~3 m en parte porque trunca las series de corrección.</p>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre series</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre sucesión y serie?</h4>
            <p>Una sucesión es una lista ordenada de números (a₁, a₂, a₃, …). Una serie es la suma de todos esos números: S = a₁ + a₂ + a₃ + ··· La sucesión describe los términos; la serie describe su acumulación. Una sucesión puede tener términos que tienden a 0 pero su serie puede divergir (ejemplo clásico: la serie armónica).</p>
            <p className={styles.faqTip}>Regla mnemotécnica: sucesión = lista, serie = suma acumulada.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué las series de Taylor &ldquo;funcionan&rdquo; para aproximar funciones?</h4>
            <p>Porque la serie de Taylor es la única forma de representar una función analítica mediante un polinomio que coincide con la función y TODAS sus derivadas en un punto dado. Si una función es infinitamente diferenciable y el resto de Lagrange tiende a 0, la serie converge exactamente a la función dentro del radio de convergencia.</p>
            <p className={styles.faqTip}>Las funciones elementales (sin, cos, eˣ, ln) son todas analíticas, lo que garantiza su convergencia.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuál es el radio de convergencia y cómo se calcula?</h4>
            <p>El radio de convergencia R es la distancia máxima desde el punto de expansión x₀ hasta la que la serie converge. Se calcula con la fórmula de Cauchy-Hadamard: R = 1/lim(|aₙ₊₁/aₙ|) o equivalentemente R = 1/lim(|aₙ|^(1/n)). Si R = ∞, la serie converge para todo x (caso de eˣ, sin, cos). Si R = 0, solo converge en x₀.</p>
            <p className={styles.faqTip}>Para ln(1+x): R = 1. Para eˣ: R = ∞. Para 1/(1-x): R = 1.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la serie armónica Σ1/n diverge si sus términos tienden a 0?</h4>
            <p>Que los términos tiendan a 0 es condición necesaria pero no suficiente para la convergencia. La prueba clásica de Oresme (siglo XIV) agrupa los términos: 1/2 ≥ 1/2; 1/3 + 1/4 ≥ 1/2; 1/5+…+1/8 ≥ 1/2; así indefinidamente. La suma crece al menos como (1/2)·log₂(N), que diverge aunque muy lentamente.</p>
            <p className={styles.faqTip}>Para sumar más de 10¹⁵ de la serie armónica se necesitarían ~10¹⁰ años a una suma por nanosegundo.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuántos términos de la serie de Leibniz necesito para tener 5 decimales de π?</h4>
            <p>La serie de Leibniz π/4 = 1 − 1/3 + 1/5 − ··· converge muy lentamente. Para k decimales exactos se necesitan aproximadamente 10ᵏ términos. Para 5 decimales: ~100.000 términos. La serie de Nilakantha converge mucho más rápido: solo necesita ~10 términos para 5 decimales correctos.</p>
            <p className={styles.faqTip}>La tabla interactiva de arriba muestra exactamente cuántos términos necesita cada serie.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es la identidad de Euler e^(iπ)+1=0 y cómo surge de las series?</h4>
            <p>Sustituyendo x = iπ en la serie de Taylor de eˣ = Σxⁿ/n!, los términos pares (con i²ⁿ = (-1)ⁿ) forman exactamente la serie de cos(π) = -1, y los impares (con i^(2n+1)) forman i·sin(π) = 0. Así e^(iπ) = cos(π) + i·sin(π) = -1 + 0i, y sumando 1 da el resultado. La identidad no es magia; es una consecuencia directa de la convergencia de estas tres series.</p>
            <p className={styles.faqTip}>Fórmula de Euler general: e^(iθ) = cos(θ) + i·sin(θ), válida para cualquier θ real.</p>
          </div>
        </div>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo aproximar una función con series de Taylor (5 pasos)</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Elige la función y el punto de expansión</h4>
              <p>Selecciona f(x) y el punto x₀ (usualmente x₀ = 0 para la serie de Maclaurin). El punto x₀ debe estar en el dominio de f y de todas sus derivadas. Cuanto más cerca de x₀ esté x, mejor será la aproximación con pocos términos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Calcula las derivadas sucesivas en x₀</h4>
              <p>Calcula f(x₀), f&apos;(x₀), f&apos;&apos;(x₀), f&apos;&apos;&apos;(x₀)… Para sin(x) en x₀=0: sin(0)=0, cos(0)=1, -sin(0)=0, -cos(0)=-1 → patrón periódico de periodo 4. Para eˣ: todas las derivadas en 0 valen 1.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Aplica la fórmula de Taylor</h4>
              <p>Tₙ(x) = Σₖ₌₀ⁿ [f⁽ᵏ⁾(x₀)/k!] · (x−x₀)ᵏ. Cada término divide la k-ésima derivada en x₀ entre k! y la multiplica por (x−x₀)ᵏ. El visualizador de arriba calcula esto automáticamente término a término.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Estima el error con el resto de Lagrange</h4>
              <p>El error cometido con N términos satisface |Rₙ(x)| ≤ M · |x−x₀|^(N+1) / (N+1)!, donde M es el máximo de |f^(N+1)| entre x₀ y x. Si necesitas 4 decimales exactos, busca N tal que esta cota sea menor que 5·10⁻⁵.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Verifica el radio de convergencia</h4>
              <p>La aproximación solo es válida para |x−x₀| &lt; R. Usa el criterio de la razón: R = lim(|aₙ/aₙ₊₁|). Si x está fuera de ese radio, la serie diverge y la aproximación es inútil por muchos términos que tomes. Para eˣ, sin, cos: R = ∞ (convergen siempre).</p>
            </div>
          </div>
        </div>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Mejores prácticas al trabajar con series</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <h4>Memoriza las 3 series fundamentales</h4>
            <p>eˣ = Σxⁿ/n!, sin(x) = Σ(-1)ⁿx^(2n+1)/(2n+1)!, cos(x) = Σ(-1)ⁿx^(2n)/(2n)!. El resto se deriva de estas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <h4>Criterio de la razón primero</h4>
            <p>Es el más versátil para series con factorial o potencias. Si da L≠1, el problema está resuelto en segundos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <h4>Si L=1, cambia de criterio</h4>
            <p>Cuando el criterio de la razón da L=1 (indeciso), prueba con el criterio integral o con Leibniz si la serie es alternada.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <h4>Radio de convergencia = 1/L</h4>
            <p>R = 1/lim(|aₙ₊₁/aₙ|) indica hasta dónde converge la serie de potencias. Fundamental para series de Taylor con R finito.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <h4>Nilakantha supera a Leibniz para π</h4>
            <p>La serie de Nilakantha converge ~10 veces más rápido para el mismo número de términos. En aplicaciones reales, siempre prefiere series de convergencia rápida.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box v2.0 */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes con Series e Infinitos</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ &ldquo;Si los términos tienden a 0, la serie converge&rdquo;:</strong> ¡Falso! La serie armónica Σ1/n diverge aunque 1/n → 0. Es una condición necesaria pero no suficiente.</li>
            <li><strong>❌ Usar la serie fuera de su radio de convergencia:</strong> La serie de Taylor de ln(1+x) solo converge para |x| ≤ 1. Usarla para x=2 da resultados incorrectos.</li>
            <li><strong>❌ Confundir el resto con el error absoluto:</strong> El resto de la serie de Taylor es el error exacto. El criterio de Leibniz solo da una cota superior del error.</li>
            <li><strong>❌ Intercambiar suma y límite sin verificar:</strong> Para series uniformemente convergentes es válido; para otras, puede cambiar el resultado.</li>
            <li><strong>❌ Pensar que &ldquo;converge&rdquo; significa &ldquo;converge rápido&rdquo;:</strong> La serie de Leibniz para π converge, pero necesita 10⁵ términos para 5 decimales correctos. La de Nilakantha es mucho más eficiente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-series-convergencia')} />
      <ShareCard appName="visualizador-series-convergencia" />
      <Footer appName="visualizador-series-convergencia" />
    </div>
  );
}
