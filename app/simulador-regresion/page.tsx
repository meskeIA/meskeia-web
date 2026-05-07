'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import styles from './SimuladorRegresion.module.css';

// ============================================
// Tipos
// ============================================

type TipoRegresion = 'lineal' | 'polinomica' | 'logistica';
type MetodoEntrenamiento = 'ols' | 'gradiente';

interface Punto {
  x: number;
  y: number;
  clase?: 0 | 1;
}

interface ModeloLineal {
  tipo: 'lineal';
  coeficientes: number[]; // [intercept, slope] o más para polinómica
  grado: number;
  perdidas: number[];
  iteracionesUsadas: number;
  perdidaFinal: number;
}

interface ModeloLogistico {
  tipo: 'logistica';
  coeficientes: number[]; // [b, a] (intercept y slope sobre x)
  perdidas: number[];
  iteracionesUsadas: number;
  perdidaFinal: number;
}

type Modelo = ModeloLineal | ModeloLogistico | null;

interface MetricasRegresion {
  r2: number;
  mse: number;
  rmse: number;
  mae: number;
  n: number;
}

interface MetricasClasificacion {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  n: number;
}

// ============================================
// Constantes
// ============================================

const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const PADDING = 40;
const PLOT_WIDTH = SVG_WIDTH - 2 * PADDING;
const PLOT_HEIGHT = SVG_HEIGHT - 2 * PADDING;

// Rango lógico del plano (coordenadas matemáticas)
const X_MIN = 0;
const X_MAX = 10;
const Y_MIN_LINEAL = 0;
const Y_MAX_LINEAL = 25;

// ============================================
// Utilidades de transformación
// ============================================

function logicalToScreenX(x: number): number {
  return PADDING + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_WIDTH;
}

function logicalToScreenY(y: number, yMin: number, yMax: number): number {
  return PADDING + (1 - (y - yMin) / (yMax - yMin)) * PLOT_HEIGHT;
}

function screenToLogicalX(sx: number): number {
  return X_MIN + ((sx - PADDING) / PLOT_WIDTH) * (X_MAX - X_MIN);
}

function screenToLogicalY(sy: number, yMin: number, yMax: number): number {
  return yMin + (1 - (sy - PADDING) / PLOT_HEIGHT) * (yMax - yMin);
}

// ============================================
// Algoritmos de regresión
// ============================================

/** Resuelve sistema lineal Ax = b con eliminación gaussiana con pivoteo parcial. */
function resolverSistema(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M: number[][] = A.map((fila, i) => [...fila, b[i]]);

  for (let i = 0; i < n; i++) {
    // Pivoteo parcial
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    }
    [M[i], M[maxRow]] = [M[maxRow], M[i]];

    // Verificar singularidad
    if (Math.abs(M[i][i]) < 1e-12) {
      // Sistema singular o casi singular
      return new Array(n).fill(0);
    }

    // Eliminar columna
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  // Sustitución hacia atrás
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let suma = M[i][n];
    for (let j = i + 1; j < n; j++) {
      suma -= M[i][j] * x[j];
    }
    x[i] = suma / M[i][i];
  }
  return x;
}

/** OLS polinómico: ajusta y = c0 + c1·x + c2·x² + ... + cgrado·x^grado */
function olsPolinomico(puntos: Punto[], grado: number): number[] {
  const n = puntos.length;
  const m = grado + 1;
  if (n < m) return new Array<number>(m).fill(0);

  // Matriz X^T X y vector X^T y
  const XtX: number[][] = [];
  const Xty: number[] = [];
  for (let i = 0; i < m; i++) {
    XtX.push(new Array<number>(m).fill(0));
    Xty.push(0);
  }

  for (const p of puntos) {
    // Calcular potencias de x
    const potencias = new Array<number>(m).fill(0);
    potencias[0] = 1;
    for (let k = 1; k < m; k++) {
      potencias[k] = potencias[k - 1] * p.x;
    }
    // Acumular X^T X
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        XtX[i][j] += potencias[i] * potencias[j];
      }
      Xty[i] += potencias[i] * p.y;
    }
  }

  return resolverSistema(XtX, Xty);
}

/** Predicción polinómica: y = sum(c_k · x^k) */
function predecirPolinomico(coefs: number[], x: number): number {
  let y = 0;
  let xk = 1;
  for (let k = 0; k < coefs.length; k++) {
    y += coefs[k] * xk;
    xk *= x;
  }
  return y;
}

/** Sigmoide con clipping para estabilidad numérica */
function sigmoide(z: number): number {
  if (z > 30) return 1 - 1e-12;
  if (z < -30) return 1e-12;
  return 1 / (1 + Math.exp(-z));
}

/** Descenso de gradiente para regresión lineal: y = a·x + b */
function gradienteLineal(
  puntos: Punto[],
  lr: number,
  iters: number
): { coefs: number[]; perdidas: number[] } {
  let a = 0;
  let b = 0;
  const perdidas: number[] = [];
  const n = puntos.length;
  if (n === 0) return { coefs: [0, 0], perdidas: [] };

  for (let it = 0; it < iters; it++) {
    let gA = 0;
    let gB = 0;
    let perdida = 0;
    for (const p of puntos) {
      const yPred = a * p.x + b;
      const error = yPred - p.y;
      gA += error * p.x;
      gB += error;
      perdida += error * error;
    }
    a -= (lr * gA) / n;
    b -= (lr * gB) / n;
    perdidas.push(perdida / n);
  }
  return { coefs: [b, a], perdidas }; // [intercept, slope] consistente con polinómica
}

/** Descenso de gradiente logístico: P(y=1) = σ(a·x + b) */
function gradienteLogistico(
  puntos: Punto[],
  lr: number,
  iters: number
): { coefs: number[]; perdidas: number[] } {
  let a = 0;
  let b = 0;
  const perdidas: number[] = [];
  const n = puntos.length;
  if (n === 0) return { coefs: [0, 0], perdidas: [] };

  for (let it = 0; it < iters; it++) {
    let gA = 0;
    let gB = 0;
    let perdida = 0;
    for (const p of puntos) {
      const clase = p.clase ?? 0;
      const z = a * p.x + b;
      const pred = sigmoide(z);
      const error = pred - clase;
      gA += error * p.x;
      gB += error;
      // log-loss
      perdida += -(clase * Math.log(pred) + (1 - clase) * Math.log(1 - pred));
    }
    a -= (lr * gA) / n;
    b -= (lr * gB) / n;
    perdidas.push(perdida / n);
  }
  return { coefs: [b, a], perdidas };
}

// ============================================
// Métricas
// ============================================

function calcularMetricasRegresion(
  puntos: Punto[],
  predict: (x: number) => number
): MetricasRegresion {
  const n = puntos.length;
  if (n === 0) return { r2: 0, mse: 0, rmse: 0, mae: 0, n: 0 };

  const meanY = puntos.reduce((s, p) => s + p.y, 0) / n;
  let ssRes = 0;
  let ssTot = 0;
  let mae = 0;

  for (const p of puntos) {
    const yPred = predict(p.x);
    const error = p.y - yPred;
    ssRes += error * error;
    ssTot += (p.y - meanY) ** 2;
    mae += Math.abs(error);
  }

  const mse = ssRes / n;
  const r2 = ssTot > 1e-12 ? 1 - ssRes / ssTot : 0;
  return { r2, mse, rmse: Math.sqrt(mse), mae: mae / n, n };
}

function calcularMetricasClasificacion(
  puntos: Punto[],
  predictProb: (x: number) => number
): MetricasClasificacion {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  const n = puntos.length;

  for (const p of puntos) {
    const real = p.clase ?? 0;
    const pred = predictProb(p.x) >= 0.5 ? 1 : 0;
    if (real === 1 && pred === 1) tp++;
    else if (real === 0 && pred === 1) fp++;
    else if (real === 0 && pred === 0) tn++;
    else fn++;
  }

  const accuracy = n > 0 ? (tp + tn) / n : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return { accuracy, precision, recall, f1, tp, fp, tn, fn, n };
}

// ============================================
// Datasets predefinidos
// ============================================

function generarRandom(rangoMin: number, rangoMax: number): number {
  return rangoMin + Math.random() * (rangoMax - rangoMin);
}

function generarRuidoNormal(sigma: number): number {
  // Box-Muller
  const u1 = Math.max(Math.random(), 1e-12);
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma;
}

interface Preset {
  titulo: string;
  descripcion: string;
  tipo: TipoRegresion;
  generar: () => Punto[];
}

const PRESETS: Preset[] = [
  {
    titulo: 'Lineal con ruido',
    descripcion: 'y = 2x + 5 + ruido normal',
    tipo: 'lineal',
    generar: () => {
      const puntos: Punto[] = [];
      for (let i = 0; i < 25; i++) {
        const x = generarRandom(0.5, 9.5);
        const y = 2 * x + 5 + generarRuidoNormal(1.2);
        puntos.push({ x, y });
      }
      return puntos;
    },
  },
  {
    titulo: 'Cuadrático',
    descripcion: 'y = (x-5)² + ruido — prueba el grado',
    tipo: 'polinomica',
    generar: () => {
      const puntos: Punto[] = [];
      for (let i = 0; i < 30; i++) {
        const x = generarRandom(0.3, 9.7);
        const y = (x - 5) ** 2 + generarRuidoNormal(0.8);
        puntos.push({ x, y });
      }
      return puntos;
    },
  },
  {
    titulo: 'Clases separables',
    descripcion: 'Logística: 2 clases bien separadas',
    tipo: 'logistica',
    generar: () => {
      const puntos: Punto[] = [];
      for (let i = 0; i < 18; i++) {
        const x = generarRandom(0.5, 4);
        puntos.push({ x, y: generarRandom(2, 23), clase: 0 });
      }
      for (let i = 0; i < 18; i++) {
        const x = generarRandom(6, 9.5);
        puntos.push({ x, y: generarRandom(2, 23), clase: 1 });
      }
      return puntos;
    },
  },
  {
    titulo: 'Clases con solape',
    descripcion: 'Logística: clases parcialmente mezcladas',
    tipo: 'logistica',
    generar: () => {
      const puntos: Punto[] = [];
      for (let i = 0; i < 22; i++) {
        const x = generarRandom(1, 6);
        puntos.push({ x, y: generarRandom(2, 23), clase: 0 });
      }
      for (let i = 0; i < 22; i++) {
        const x = generarRandom(4, 9);
        puntos.push({ x, y: generarRandom(2, 23), clase: 1 });
      }
      return puntos;
    },
  },
];

// ============================================
// Componente principal
// ============================================

export default function SimuladorRegresionPage() {
  const [tipo, setTipo] = useState<TipoRegresion>('lineal');
  const [metodo, setMetodo] = useState<MetodoEntrenamiento>('ols');
  const [grado, setGrado] = useState<number>(1);
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [iteraciones, setIteraciones] = useState<number>(200);
  const [tamanoDataset, setTamanoDataset] = useState<number>(30);
  const [claseActual, setClaseActual] = useState<0 | 1>(0);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [modelo, setModelo] = useState<Modelo>(null);
  const [iteracionAnimacion, setIteracionAnimacion] = useState<number>(-1);
  const [animandoCoefs, setAnimandoCoefs] = useState<number[][] | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Determinar rango Y según tipo
  const yMin = Y_MIN_LINEAL;
  const yMax = Y_MAX_LINEAL;

  // ============================================
  // Acciones del canvas
  // ============================================

  const onCanvasClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = SVG_WIDTH / rect.width;
      const scaleY = SVG_HEIGHT / rect.height;
      const sx = (event.clientX - rect.left) * scaleX;
      const sy = (event.clientY - rect.top) * scaleY;

      // Solo añadir si está dentro del área de plot
      if (sx < PADDING || sx > SVG_WIDTH - PADDING) return;
      if (sy < PADDING || sy > SVG_HEIGHT - PADDING) return;

      const x = screenToLogicalX(sx);
      const y = screenToLogicalY(sy, yMin, yMax);

      const nuevo: Punto =
        tipo === 'logistica' ? { x, y, clase: claseActual } : { x, y };
      setPuntos((prev) => [...prev, nuevo]);
      setModelo(null);
      setIteracionAnimacion(-1);
      setAnimandoCoefs(null);
    },
    [tipo, claseActual, yMin, yMax]
  );

  const limpiar = useCallback(() => {
    setPuntos([]);
    setModelo(null);
    setIteracionAnimacion(-1);
    setAnimandoCoefs(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const generarDatasetAleatorio = useCallback(() => {
    const puntosNuevos: Punto[] = [];
    if (tipo === 'logistica') {
      const mitad = Math.floor(tamanoDataset / 2);
      for (let i = 0; i < mitad; i++) {
        puntosNuevos.push({
          x: generarRandom(0.5, 4.5),
          y: generarRandom(2, 23),
          clase: 0,
        });
      }
      for (let i = 0; i < tamanoDataset - mitad; i++) {
        puntosNuevos.push({
          x: generarRandom(5.5, 9.5),
          y: generarRandom(2, 23),
          clase: 1,
        });
      }
    } else {
      // Lineal o polinómica con ruido
      for (let i = 0; i < tamanoDataset; i++) {
        const x = generarRandom(0.5, 9.5);
        const y = 2 * x + 5 + generarRuidoNormal(1.5);
        puntosNuevos.push({ x, y });
      }
    }
    setPuntos(puntosNuevos);
    setModelo(null);
    setIteracionAnimacion(-1);
    setAnimandoCoefs(null);
  }, [tipo, tamanoDataset]);

  const aplicarPreset = useCallback((preset: Preset) => {
    setTipo(preset.tipo);
    if (preset.tipo === 'polinomica') setGrado(2);
    setPuntos(preset.generar());
    setModelo(null);
    setIteracionAnimacion(-1);
    setAnimandoCoefs(null);
  }, []);

  // ============================================
  // Entrenamiento
  // ============================================

  const entrenar = useCallback(() => {
    if (puntos.length < 2) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIteracionAnimacion(-1);
    setAnimandoCoefs(null);

    if (tipo === 'logistica') {
      // Siempre gradiente
      const { coefs, perdidas } = gradienteLogistico(
        puntos,
        learningRate,
        iteraciones
      );
      setModelo({
        tipo: 'logistica',
        coeficientes: coefs,
        perdidas,
        iteracionesUsadas: iteraciones,
        perdidaFinal: perdidas[perdidas.length - 1] ?? 0,
      });
      // Animar paso a paso
      animarLogistico();
    } else if (tipo === 'lineal') {
      if (metodo === 'ols') {
        const coefs = olsPolinomico(puntos, 1);
        setModelo({
          tipo: 'lineal',
          coeficientes: coefs,
          grado: 1,
          perdidas: [],
          iteracionesUsadas: 0,
          perdidaFinal: 0,
        });
      } else {
        const { coefs, perdidas } = gradienteLineal(
          puntos,
          learningRate,
          iteraciones
        );
        setModelo({
          tipo: 'lineal',
          coeficientes: coefs,
          grado: 1,
          perdidas,
          iteracionesUsadas: iteraciones,
          perdidaFinal: perdidas[perdidas.length - 1] ?? 0,
        });
        animarLineal();
      }
    } else {
      // Polinómica - siempre OLS (gradiente para polinómica de grado >1 es delicado)
      const coefs = olsPolinomico(puntos, grado);
      setModelo({
        tipo: 'lineal',
        coeficientes: coefs,
        grado,
        perdidas: [],
        iteracionesUsadas: 0,
        perdidaFinal: 0,
      });
    }

    function animarLineal() {
      // Recalcular paso a paso para la animación
      let a = 0;
      let b = 0;
      const historial: number[][] = [];
      for (let it = 0; it < iteraciones; it++) {
        let gA = 0;
        let gB = 0;
        for (const p of puntos) {
          const yPred = a * p.x + b;
          const error = yPred - p.y;
          gA += error * p.x;
          gB += error;
        }
        a -= (learningRate * gA) / puntos.length;
        b -= (learningRate * gB) / puntos.length;
        historial.push([b, a]);
      }
      setAnimandoCoefs(historial);
      iniciarAnimacion(historial.length);
    }

    function animarLogistico() {
      let a = 0;
      let b = 0;
      const historial: number[][] = [];
      for (let it = 0; it < iteraciones; it++) {
        let gA = 0;
        let gB = 0;
        for (const p of puntos) {
          const clase = p.clase ?? 0;
          const z = a * p.x + b;
          const pred = sigmoide(z);
          const error = pred - clase;
          gA += error * p.x;
          gB += error;
        }
        a -= (learningRate * gA) / puntos.length;
        b -= (learningRate * gB) / puntos.length;
        historial.push([b, a]);
      }
      setAnimandoCoefs(historial);
      iniciarAnimacion(historial.length);
    }

    function iniciarAnimacion(total: number) {
      setIteracionAnimacion(0);
      const FRAMES_TOTAL = 60;
      const step = Math.max(1, Math.floor(total / FRAMES_TOTAL));
      let i = 0;
      intervalRef.current = setInterval(() => {
        i += step;
        if (i >= total - 1) {
          setIteracionAnimacion(total - 1);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          setIteracionAnimacion(i);
        }
      }, 33);
    }
  }, [puntos, tipo, metodo, grado, learningRate, iteraciones]);

  // ============================================
  // Función de predicción según modelo activo
  // ============================================

  const coefsActivos: number[] | null = useMemo(() => {
    if (!modelo) return null;
    if (
      animandoCoefs &&
      iteracionAnimacion >= 0 &&
      iteracionAnimacion < animandoCoefs.length
    ) {
      return animandoCoefs[iteracionAnimacion];
    }
    return modelo.coeficientes;
  }, [modelo, animandoCoefs, iteracionAnimacion]);

  const predict = useCallback(
    (x: number): number => {
      if (!modelo || !coefsActivos) return 0;
      if (modelo.tipo === 'lineal') {
        return predecirPolinomico(coefsActivos, x);
      }
      // Logística devuelve probabilidad
      const [b, a] = coefsActivos;
      return sigmoide(a * x + b);
    },
    [modelo, coefsActivos]
  );

  // ============================================
  // Métricas calculadas
  // ============================================

  const metricasRegresion = useMemo<MetricasRegresion | null>(() => {
    if (!modelo || modelo.tipo !== 'lineal' || puntos.length === 0) return null;
    return calcularMetricasRegresion(puntos, predict);
  }, [modelo, puntos, predict]);

  const metricasClasificacion = useMemo<MetricasClasificacion | null>(() => {
    if (!modelo || modelo.tipo !== 'logistica' || puntos.length === 0) return null;
    return calcularMetricasClasificacion(puntos, predict);
  }, [modelo, puntos, predict]);

  // ============================================
  // Renderizado SVG
  // ============================================

  // Path de la curva ajustada
  const curvePath = useMemo(() => {
    if (!modelo || !coefsActivos) return '';
    const STEPS = 100;
    let d = '';
    for (let i = 0; i <= STEPS; i++) {
      const x = X_MIN + (i / STEPS) * (X_MAX - X_MIN);
      let y: number;
      if (modelo.tipo === 'lineal') {
        y = predecirPolinomico(coefsActivos, x);
      } else {
        // Logística: dibujar la sigmoide en escala vertical del plot
        const prob = sigmoide(coefsActivos[1] * x + coefsActivos[0]);
        y = yMin + prob * (yMax - yMin);
      }
      // Clamp al rango visible
      const yClamped = Math.max(yMin - 5, Math.min(yMax + 5, y));
      const sx = logicalToScreenX(x);
      const sy = logicalToScreenY(yClamped, yMin, yMax);
      d += i === 0 ? `M ${sx.toFixed(2)} ${sy.toFixed(2)}` : ` L ${sx.toFixed(2)} ${sy.toFixed(2)}`;
    }
    return d;
  }, [modelo, coefsActivos, yMin, yMax]);

  // Frontera de decisión logística (línea vertical donde P=0.5)
  const fronteraX = useMemo(() => {
    if (!modelo || modelo.tipo !== 'logistica' || !coefsActivos) return null;
    const [b, a] = coefsActivos;
    if (Math.abs(a) < 1e-9) return null;
    // P=0.5 cuando a·x + b = 0 → x = -b/a
    const x = -b / a;
    if (x < X_MIN || x > X_MAX) return null;
    return logicalToScreenX(x);
  }, [modelo, coefsActivos]);

  // Mini gráfica de pérdida
  const lossPath = useMemo(() => {
    if (!modelo || modelo.perdidas.length === 0) return '';
    const W = 600;
    const H = 160;
    const PAD = 30;
    const perdidas = modelo.perdidas;
    const maxL = Math.max(...perdidas);
    const minL = Math.min(...perdidas);
    const rangoL = maxL - minL || 1;
    let d = '';
    for (let i = 0; i < perdidas.length; i++) {
      const sx = PAD + (i / (perdidas.length - 1)) * (W - 2 * PAD);
      const sy = PAD + (1 - (perdidas[i] - minL) / rangoL) * (H - 2 * PAD);
      d += i === 0 ? `M ${sx.toFixed(2)} ${sy.toFixed(2)}` : ` L ${sx.toFixed(2)} ${sy.toFixed(2)}`;
    }
    return d;
  }, [modelo]);

  // Líneas de grilla
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i <= 10; i++) {
      const sx = logicalToScreenX(X_MIN + (i / 10) * (X_MAX - X_MIN));
      lines.push({ x1: sx, y1: PADDING, x2: sx, y2: SVG_HEIGHT - PADDING });
    }
    for (let i = 0; i <= 5; i++) {
      const sy = logicalToScreenY(yMin + (i / 5) * (yMax - yMin), yMin, yMax);
      lines.push({ x1: PADDING, y1: sy, x2: SVG_WIDTH - PADDING, y2: sy });
    }
    return lines;
  }, [yMin, yMax]);

  // Etiquetas de ejes
  const xLabels = useMemo(() => {
    const labels: { x: number; text: string }[] = [];
    for (let i = 0; i <= 10; i += 2) {
      const v = X_MIN + (i / 10) * (X_MAX - X_MIN);
      labels.push({ x: logicalToScreenX(v), text: v.toFixed(0) });
    }
    return labels;
  }, []);

  const yLabels = useMemo(() => {
    const labels: { y: number; text: string }[] = [];
    for (let i = 0; i <= 5; i++) {
      const v = yMin + (i / 5) * (yMax - yMin);
      labels.push({ y: logicalToScreenY(v, yMin, yMax), text: v.toFixed(0) });
    }
    return labels;
  }, [yMin, yMax]);

  // Render coeficientes legibles
  const coefStr = useMemo(() => {
    if (!modelo) return '';
    if (modelo.tipo === 'logistica') {
      const [b, a] = modelo.coeficientes;
      return `P(y=1) = σ(${formatNumber(a, 3)} · x ${b >= 0 ? '+' : '−'} ${formatNumber(Math.abs(b), 3)})`;
    }
    // Lineal o polinómica
    const c = modelo.coeficientes;
    const partes: string[] = [];
    for (let k = 0; k < c.length; k++) {
      const valor = c[k];
      const abs = Math.abs(valor);
      const signo = k === 0 ? (valor < 0 ? '−' : '') : valor < 0 ? ' − ' : ' + ';
      const term =
        k === 0
          ? `${signo}${formatNumber(abs, 3)}`
          : k === 1
            ? `${signo}${formatNumber(abs, 3)}·x`
            : `${signo}${formatNumber(abs, 3)}·x^${k}`;
      partes.push(term);
    }
    return `y = ${partes.join('')}`;
  }, [modelo]);

  // ============================================
  // Render
  // ============================================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Regresión Lineal y Logística</h1>
        <p className={styles.subtitle}>
          Añade puntos al plano y observa cómo el modelo se ajusta en tiempo real.
          Compara OLS analítico con descenso de gradiente animado.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de tipo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Elige el tipo de modelo</h2>
          <div className={styles.tipoSelector}>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipo === 'lineal' ? styles.tipoActive : ''}`}
              onClick={() => {
                setTipo('lineal');
                setModelo(null);
              }}
            >
              <span className={styles.tipoNombre}>Lineal</span>
              <span className={styles.tipoDesc}>y = a·x + b</span>
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipo === 'polinomica' ? styles.tipoActive : ''}`}
              onClick={() => {
                setTipo('polinomica');
                setModelo(null);
              }}
            >
              <span className={styles.tipoNombre}>Polinómica</span>
              <span className={styles.tipoDesc}>grado 1-5</span>
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipo === 'logistica' ? styles.tipoActive : ''}`}
              onClick={() => {
                setTipo('logistica');
                setModelo(null);
              }}
            >
              <span className={styles.tipoNombre}>Logística</span>
              <span className={styles.tipoDesc}>clasificación binaria</span>
            </button>
          </div>

          {/* Slider grado polinómica */}
          {tipo === 'polinomica' && (
            <div className={styles.sliderControl}>
              <label htmlFor="grado">Grado del polinomio:</label>
              <input
                id="grado"
                type="range"
                min={1}
                max={5}
                step={1}
                value={grado}
                onChange={(e) => {
                  setGrado(Number(e.target.value));
                  setModelo(null);
                }}
              />
              <span className={styles.sliderValue}>{grado}</span>
            </div>
          )}

          {/* Método (no aplica a logística que siempre es gradiente, ni a polinómica que siempre OLS) */}
          {tipo === 'lineal' && (
            <div className={styles.metodoToggle}>
              <button
                type="button"
                className={`${styles.metodoBtn} ${metodo === 'ols' ? styles.metodoActive : ''}`}
                onClick={() => setMetodo('ols')}
              >
                OLS analítico
              </button>
              <button
                type="button"
                className={`${styles.metodoBtn} ${metodo === 'gradiente' ? styles.metodoActive : ''}`}
                onClick={() => setMetodo('gradiente')}
              >
                Descenso de gradiente
              </button>
            </div>
          )}

          {/* Hyperparámetros del gradiente */}
          {((tipo === 'lineal' && metodo === 'gradiente') || tipo === 'logistica') && (
            <>
              <div className={styles.sliderControl}>
                <label htmlFor="lr">Tasa de aprendizaje:</label>
                <input
                  id="lr"
                  type="range"
                  min={0.001}
                  max={0.5}
                  step={0.001}
                  value={learningRate}
                  onChange={(e) => setLearningRate(Number(e.target.value))}
                />
                <span className={styles.sliderValue}>{formatNumber(learningRate, 3)}</span>
              </div>
              <div className={styles.sliderControl}>
                <label htmlFor="iters">Iteraciones:</label>
                <input
                  id="iters"
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={iteraciones}
                  onChange={(e) => setIteraciones(Number(e.target.value))}
                />
                <span className={styles.sliderValue}>{iteraciones}</span>
              </div>
            </>
          )}
        </div>

        {/* Datos */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Añade datos</h2>

          {tipo === 'logistica' && (
            <div className={styles.claseSelector}>
              <span>Próximo clic será de clase:</span>
              <button
                type="button"
                className={`${styles.claseBtn} ${claseActual === 0 ? styles.claseActive0 : ''}`}
                onClick={() => setClaseActual(0)}
              >
                Clase 0 (azul)
              </button>
              <button
                type="button"
                className={`${styles.claseBtn} ${claseActual === 1 ? styles.claseActive1 : ''}`}
                onClick={() => setClaseActual(1)}
              >
                Clase 1 (rojo)
              </button>
            </div>
          )}

          <div className={styles.sliderControl}>
            <label htmlFor="tam">Tamaño dataset aleatorio:</label>
            <input
              id="tam"
              type="range"
              min={10}
              max={100}
              step={1}
              value={tamanoDataset}
              onChange={(e) => setTamanoDataset(Number(e.target.value))}
            />
            <span className={styles.sliderValue}>{tamanoDataset}</span>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={generarDatasetAleatorio}
            >
              Generar dataset aleatorio
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.dangerBtn}`}
              onClick={limpiar}
            >
              Limpiar
            </button>
          </div>

          <h3 className={styles.panelTitle} style={{ marginTop: '1rem' }}>
            Datasets de ejemplo
          </h3>
          <div className={styles.presetsGrid}>
            {PRESETS.map((preset) => (
              <button
                key={preset.titulo}
                type="button"
                className={styles.presetBtn}
                onClick={() => aplicarPreset(preset)}
              >
                <span className={styles.presetTitle}>{preset.titulo}</span>
                <span className={styles.presetDesc}>{preset.descripcion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            3. Lienzo {puntos.length > 0 ? `(${puntos.length} puntos)` : ''}
          </h2>

          <div className={styles.canvasContainer}>
            <svg
              className={styles.canvasSvg}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              onClick={onCanvasClick}
              role="img"
              aria-label="Plano cartesiano para añadir puntos"
            >
              {/* Grilla */}
              {gridLines.map((l, i) => (
                <line
                  key={`grid-${i}`}
                  className={styles.canvasGrid}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                />
              ))}

              {/* Ejes */}
              <line
                className={styles.canvasAxis}
                x1={PADDING}
                y1={SVG_HEIGHT - PADDING}
                x2={SVG_WIDTH - PADDING}
                y2={SVG_HEIGHT - PADDING}
              />
              <line
                className={styles.canvasAxis}
                x1={PADDING}
                y1={PADDING}
                x2={PADDING}
                y2={SVG_HEIGHT - PADDING}
              />

              {/* Etiquetas X */}
              {xLabels.map((l, i) => (
                <text
                  key={`xl-${i}`}
                  className={styles.canvasAxisLabel}
                  x={l.x}
                  y={SVG_HEIGHT - PADDING + 18}
                  textAnchor="middle"
                >
                  {l.text}
                </text>
              ))}

              {/* Etiquetas Y */}
              {yLabels.map((l, i) => (
                <text
                  key={`yl-${i}`}
                  className={styles.canvasAxisLabel}
                  x={PADDING - 8}
                  y={l.y + 4}
                  textAnchor="end"
                >
                  {l.text}
                </text>
              ))}

              {/* Curva ajustada */}
              {curvePath && (
                <path className={styles.curva} d={curvePath} />
              )}

              {/* Frontera de decisión logística */}
              {fronteraX !== null && (
                <line
                  className={styles.fronteraDecision}
                  x1={fronteraX}
                  y1={PADDING}
                  x2={fronteraX}
                  y2={SVG_HEIGHT - PADDING}
                />
              )}

              {/* Puntos */}
              {puntos.map((p, i) => {
                const sx = logicalToScreenX(p.x);
                const syClamped = Math.max(yMin, Math.min(yMax, p.y));
                const sy = logicalToScreenY(syClamped, yMin, yMax);
                const esClase1 = (p.clase ?? 0) === 1;
                return (
                  <circle
                    key={`pt-${i}`}
                    className={
                      tipo === 'logistica' && esClase1
                        ? styles.puntoClase1
                        : styles.puntoClase0
                    }
                    cx={sx}
                    cy={sy}
                    r={5}
                  />
                );
              })}
            </svg>
            <p className={styles.canvasHint}>
              Haz clic en el lienzo para añadir un punto
              {tipo === 'logistica'
                ? ` de clase ${claseActual} (${claseActual === 0 ? 'azul' : 'rojo'})`
                : ''}
              . Mínimo 2 puntos para entrenar.
            </p>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={entrenar}
              disabled={puntos.length < 2}
            >
              {modelo ? 'Reentrenar modelo' : 'Entrenar modelo'}
            </button>
            {modelo && (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => {
                  setModelo(null);
                  setIteracionAnimacion(-1);
                  setAnimandoCoefs(null);
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                }}
              >
                Resetear modelo
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        {modelo && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>4. Resultados</h2>

            <div className={styles.coefBox}>
              <span className={styles.coefLabel}>Modelo ajustado:</span>
              <span className={styles.coefValue}>{coefStr}</span>
            </div>

            {/* Métricas regresión */}
            {metricasRegresion && (
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>R² (coef. determinación)</span>
                  <span className={styles.metricValue}>
                    {formatNumber(metricasRegresion.r2, 4)}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>MSE</span>
                  <span className={styles.metricValue}>
                    {formatNumber(metricasRegresion.mse, 3)}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>RMSE</span>
                  <span className={styles.metricValue}>
                    {formatNumber(metricasRegresion.rmse, 3)}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>MAE</span>
                  <span className={styles.metricValue}>
                    {formatNumber(metricasRegresion.mae, 3)}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Puntos</span>
                  <span className={styles.metricValue}>{metricasRegresion.n}</span>
                </div>
                {modelo.perdidas.length > 0 && (
                  <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Iteraciones</span>
                    <span className={styles.metricValue}>{modelo.iteracionesUsadas}</span>
                  </div>
                )}
              </div>
            )}

            {/* Métricas clasificación */}
            {metricasClasificacion && (
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Accuracy</span>
                  <span className={styles.metricValue}>
                    {formatNumber(metricasClasificacion.accuracy * 100, 2)}
                    <span className={styles.metricUnit}>%</span>
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Precision</span>
                  <span className={styles.metricValue}>
                    {formatNumber(metricasClasificacion.precision * 100, 2)}
                    <span className={styles.metricUnit}>%</span>
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Recall</span>
                  <span className={styles.metricValue}>
                    {formatNumber(metricasClasificacion.recall * 100, 2)}
                    <span className={styles.metricUnit}>%</span>
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>F1-score</span>
                  <span className={styles.metricValue}>
                    {formatNumber(metricasClasificacion.f1, 3)}
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Verdaderos positivos</span>
                  <span className={styles.metricValue}>{metricasClasificacion.tp}</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Falsos positivos</span>
                  <span className={styles.metricValue}>{metricasClasificacion.fp}</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Iteraciones</span>
                  <span className={styles.metricValue}>{modelo.iteracionesUsadas}</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Pérdida final</span>
                  <span className={styles.metricValue}>
                    {formatNumber(modelo.perdidaFinal, 4)}
                  </span>
                </div>
              </div>
            )}

            {/* Mini chart de pérdida */}
            {modelo.perdidas.length > 0 && (
              <div className={styles.lossChart}>
                <h3 className={styles.lossChartTitle}>
                  Curva de pérdida durante el entrenamiento
                </h3>
                <svg
                  className={styles.lossSvg}
                  viewBox="0 0 600 160"
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label="Evolución de la pérdida por iteración"
                >
                  <line
                    className={styles.canvasAxis}
                    x1={30}
                    y1={130}
                    x2={570}
                    y2={130}
                  />
                  <line
                    className={styles.canvasAxis}
                    x1={30}
                    y1={30}
                    x2={30}
                    y2={130}
                  />
                  <text
                    className={styles.canvasAxisLabel}
                    x={300}
                    y={155}
                    textAnchor="middle"
                  >
                    Iteración
                  </text>
                  <text
                    className={styles.canvasAxisLabel}
                    x={10}
                    y={80}
                    textAnchor="middle"
                    transform="rotate(-90 10 80)"
                  >
                    Pérdida
                  </text>
                  <path className={styles.lossLine} d={lossPath} />
                </svg>
              </div>
            )}
          </div>
        )}
      </main>

      <EducationalSection
        title="Guía de Regresión"
        subtitle="Lineal, polinómica y logística"
      >
        <h3>Comparativa de Modelos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Fórmula</th>
                <th>Métrica clave</th>
                <th>Cuándo usarlo</th>
                <th>Supuesto principal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lineal simple</td>
                <td>y = a·x + b</td>
                <td>R², MSE</td>
                <td>Relación recta entre variables continuas</td>
                <td>Errores normales, varianza constante</td>
              </tr>
              <tr>
                <td>Lineal múltiple</td>
                <td>y = w·x + b (vectorial)</td>
                <td>R², MSE ajustado</td>
                <td>Varias variables explicativas</td>
                <td>No multicolinealidad fuerte</td>
              </tr>
              <tr>
                <td>Polinómica</td>
                <td>y = c0 + c1·x + ... + cn·x^n</td>
                <td>R², MSE en validación</td>
                <td>Curva no lineal continua</td>
                <td>Riesgo de sobreajuste con grado alto</td>
              </tr>
              <tr>
                <td>Logística</td>
                <td>P(y=1) = σ(w·x + b)</td>
                <td>Accuracy, precision, recall, AUC</td>
                <td>Clasificación binaria</td>
                <td>Linealidad de log-odds</td>
              </tr>
              <tr>
                <td>Ridge / Lasso</td>
                <td>Lineal + penalización L1/L2</td>
                <td>R² en validación cruzada</td>
                <td>Muchas variables o multicolinealidad</td>
                <td>Hiperparámetro λ por validación</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎓</span>
              <strong>Estudiante de IA / ML</strong>
            </div>
            <p className={styles.escenarioExample}>
              Aprendes los fundamentos de aprendizaje supervisado: añade puntos,
              cambia entre OLS y gradiente, y observa cómo varían los coeficientes.
              Es la práctica básica antes de pasar a redes neuronales.
            </p>
            <p className={styles.escenarioTip}>
              Empieza con el dataset &laquo;Lineal con ruido&raquo; y compara métodos.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📈</span>
              <strong>Predictor de precios</strong>
            </div>
            <p className={styles.escenarioExample}>
              Una regresión lineal estima precio en función de variables
              (m², habitaciones, antigüedad). Aquí ves la versión 1D para
              entender la idea antes de usar varias variables.
            </p>
            <p className={styles.escenarioTip}>
              Un R² alto no garantiza utilidad: revisa siempre los residuos.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🔬</span>
              <strong>Clasificación binaria</strong>
            </div>
            <p className={styles.escenarioExample}>
              Aprobado / suspenso, spam / no spam, enfermo / sano. La regresión
              logística da una probabilidad y dibuja una frontera de decisión.
              Punto de partida obligatorio en cualquier curso de ML.
            </p>
            <p className={styles.escenarioTip}>
              Prueba el preset &laquo;Clases con solape&raquo; para ver fronteras imperfectas.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🧑‍🏫</span>
              <strong>Profesor de Estadística</strong>
            </div>
            <p className={styles.escenarioExample}>
              Muestra en clase qué pasa al subir el grado del polinomio: con
              grado 1 hay sesgo, con grado 5 hay sobreajuste. Demostración visual
              del compromiso sesgo-varianza.
            </p>
            <p className={styles.escenarioTip}>
              El aumento de R² al subir el grado es un caso clásico de overfitting.
            </p>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuál es la diferencia entre regresión y clasificación?</h4>
            <p>
              La regresión predice un valor numérico continuo (precio, temperatura,
              salario). La clasificación predice una categoría discreta
              (spam / no spam). La regresión logística predice
              <strong> probabilidad</strong> y luego se umbraliza para clasificar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué significa R² y qué es un buen valor?</h4>
            <p>
              R² es la proporción de varianza explicada por el modelo. R² = 1
              significa ajuste perfecto, R² = 0 que el modelo no explica nada
              (como predecir siempre la media). Valores típicos:
            </p>
            <p className={styles.faqTip}>
              Ciencias físicas: &gt;0,9 esperable. Ciencias sociales: 0,3-0,6 ya es útil.
              R² negativo indica que el modelo es peor que predecir la media.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo usar gradiente y cuándo OLS?</h4>
            <p>
              <strong>OLS analítico</strong> (mínimos cuadrados ordinarios) tiene
              solución cerrada en regresión lineal: rápida y exacta.
              <strong> Gradiente</strong> es necesario cuando:
            </p>
            <p className={styles.faqTip}>
              Datasets enormes que no caben en memoria, modelos no lineales como
              logística o redes neuronales, o cuando quieres regularización
              compleja. En lineal pequeño, OLS siempre es mejor.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué se sobreajusta con grado alto?</h4>
            <p>
              Un polinomio de grado n con n+1 puntos pasa por todos los puntos
              (interpolación exacta) pero su comportamiento entre puntos es
              caótico. R² en entrenamiento es perfecto, pero la predicción en
              datos nuevos es horrible.
            </p>
            <p className={styles.faqTip}>
              Solución: validación cruzada, regularización (Ridge / Lasso) o
              elegir el grado más bajo que dé un ajuste razonable.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es la función sigmoide y por qué se usa en logística?</h4>
            <p>
              La sigmoide σ(z) = 1/(1+e^-z) transforma cualquier número real en
              un valor entre 0 y 1, ideal para representar probabilidades.
              Pasa por (0; 0,5), tiene forma de S y derivada simple
              σ&apos;(z) = σ(z)·(1−σ(z)).
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿OLS funciona en regresión logística?</h4>
            <p>
              No. La logística no tiene solución cerrada porque la función de
              pérdida (log-loss) no es cuadrática. Se usa siempre descenso de
              gradiente o métodos iterativos como Newton-Raphson (IRLS).
              Por eso este simulador fija gradiente cuando eliges Logística.
            </p>
          </div>
        </div>

        <h3>Cómo Ajustar un Modelo — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Explora los datos</strong>
              <p>
                Antes de elegir el modelo, mira si la nube de puntos parece
                lineal, curva o forma 2 grupos separados. Eso te dice si necesitas
                lineal, polinómica o logística.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Elige el modelo más simple posible</strong>
              <p>
                Empieza por lineal. Solo sube a polinómica o logística cuando
                veas que el residuo tiene un patrón claro (no aleatorio) o que
                hay grupos que clasificar.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Entrena y mira las métricas</strong>
              <p>
                R² para regresión, accuracy y F1 para clasificación. Pero no te
                quedes solo con un número: visualiza la curva ajustada para detectar
                problemas que las métricas ocultan.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Diagnóstica residuos</strong>
              <p>
                Si los residuos tienen patrón (forma de U, embudo...), el modelo
                es incorrecto. Residuos aleatorios alrededor de cero indican
                ajuste razonable.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Valida con datos no vistos</strong>
              <p>
                Un modelo que funciona en entrenamiento pero falla en datos
                nuevos está sobreajustado. Divide siempre en train / test
                o usa validación cruzada.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📊</span>
            <strong>Visualiza siempre antes de modelar</strong>
            <p>
              Un scatter plot en 5 segundos te ahorra horas. Detectarás outliers,
              relaciones no lineales y agrupamientos imposibles de ver con métricas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⚖️</span>
            <strong>Normaliza las variables</strong>
            <p>
              Si una variable va de 0 a 1 y otra de 0 a 1.000.000, el gradiente
              se vuelve inestable. Estandariza (media 0, desviación 1) antes
              de entrenar con gradiente.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <strong>Elige bien la tasa de aprendizaje</strong>
            <p>
              Demasiado alta → diverge (la pérdida explota). Demasiado baja →
              tarda eras en converger. Empieza con 0,01 o 0,05 y ajusta según
              veas la curva de pérdida.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🛡️</span>
            <strong>Usa regularización con muchas variables</strong>
            <p>
              Ridge (L2) y Lasso (L1) penalizan coeficientes grandes y previenen
              sobreajuste. Lasso también selecciona variables (las pone a cero).
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔁</span>
            <strong>Validación cruzada, no test único</strong>
            <p>
              k-fold CV (típico k=5 o k=10) da una estimación robusta del error
              real. Un único split puede engañarte por azar.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🧪</span>
            <strong>Compara baselines</strong>
            <p>
              Antes de presumir de modelo, compara con el más simple posible:
              predecir la media (regresión) o la clase mayoritaria (clasificación).
              Si no superas ese baseline, algo va mal.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes a evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              Subir el grado del polinomio hasta que R² = 1 — eso es overfitting
              puro, no un buen modelo.
            </li>
            <li>
              Usar accuracy con clases desbalanceadas: si el 95% son negativos,
              predecir todo negativo da 95% accuracy y es inútil. Mira F1, AUC o
              matriz de confusión.
            </li>
            <li>
              Confundir correlación con causalidad: una regresión que ajusta bien
              no demuestra que x cause y, solo que están relacionadas en estos datos.
            </li>
            <li>
              Olvidar comprobar los residuos: un R² alto puede ocultar un patrón
              sistemático en los errores.
            </li>
            <li>
              Entrenar con datos sin escalar y luego no entender por qué el
              gradiente diverge u oscila salvajemente.
            </li>
            <li>
              Probar el modelo en los mismos datos de entrenamiento: el rendimiento
              real solo se mide en datos nunca vistos.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-regresion')} />
      <ShareCard appName="simulador-regresion" />
      <Footer appName="simulador-regresion" />
    </div>
  );
}
