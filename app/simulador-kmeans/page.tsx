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
import styles from './SimuladorKmeans.module.css';

type MetodoInit = 'aleatorio' | 'kmeans++';
type DatasetPreset = 'separados' | 'solapados' | 'alargado' | 'tamanos';
type ModoEdicion = 'anadir' | 'arrastrar';

interface Punto {
  id: string;
  x: number;
  y: number;
  cluster: number;
}

interface Centroide {
  x: number;
  y: number;
  trayectoria: { x: number; y: number }[];
}

type TipoPaso = 'init' | 'asignacion' | 'recalculo' | 'convergencia';

interface PasoKmeans {
  centroides: Centroide[];
  asignaciones: number[];
  inertia: number;
  tipo: TipoPaso;
  descripcion: string;
}

interface ResultadoElbow {
  k: number;
  inertia: number;
}

const COLORES_CLUSTER: string[] = [
  '#2E86AB', // azul meskeIA
  '#C73E1D', // rojo
  '#48A9A6', // teal
  '#F18F01', // naranja
  '#6A4C93', // púrpura
  '#1B998B', // verde esmeralda
  '#E63946', // coral
  '#7F5539', // marrón
];

const ANCHO_LIENZO = 600;
const ALTO_LIENZO = 400;
const MARGEN_LIENZO = 30;

let contadorIds = 0;
function nuevoId(): string {
  contadorIds += 1;
  return `p${contadorIds}`;
}

// Box-Muller para muestrear normal estándar
function muestreoNormal(): number {
  let u1 = Math.random();
  let u2 = Math.random();
  // Evitar log(0)
  if (u1 < 1e-10) u1 = 1e-10;
  if (u2 < 1e-10) u2 = 1e-10;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function generarGaussianas(k: number, n: number): Punto[] {
  const puntos: Punto[] = [];
  for (let c = 0; c < k; c++) {
    const cx = MARGEN_LIENZO + 60 + Math.random() * (ANCHO_LIENZO - 2 * MARGEN_LIENZO - 120);
    const cy = MARGEN_LIENZO + 50 + Math.random() * (ALTO_LIENZO - 2 * MARGEN_LIENZO - 100);
    for (let i = 0; i < n; i++) {
      const x = cx + muestreoNormal() * 22;
      const y = cy + muestreoNormal() * 22;
      puntos.push({
        id: nuevoId(),
        x: Math.max(MARGEN_LIENZO, Math.min(ANCHO_LIENZO - MARGEN_LIENZO, x)),
        y: Math.max(MARGEN_LIENZO, Math.min(ALTO_LIENZO - MARGEN_LIENZO, y)),
        cluster: -1,
      });
    }
  }
  return puntos;
}

function generarUniforme(n: number): Punto[] {
  const puntos: Punto[] = [];
  for (let i = 0; i < n; i++) {
    puntos.push({
      id: nuevoId(),
      x: MARGEN_LIENZO + Math.random() * (ANCHO_LIENZO - 2 * MARGEN_LIENZO),
      y: MARGEN_LIENZO + Math.random() * (ALTO_LIENZO - 2 * MARGEN_LIENZO),
      cluster: -1,
    });
  }
  return puntos;
}

function presetSeparados(): Punto[] {
  // 3 gaussianas bien separadas
  const centros = [
    { cx: 150, cy: 120 },
    { cx: 450, cy: 130 },
    { cx: 300, cy: 310 },
  ];
  const puntos: Punto[] = [];
  for (const c of centros) {
    for (let i = 0; i < 30; i++) {
      puntos.push({
        id: nuevoId(),
        x: c.cx + muestreoNormal() * 22,
        y: c.cy + muestreoNormal() * 22,
        cluster: -1,
      });
    }
  }
  return puntos;
}

function presetSolapados(): Punto[] {
  const centros = [
    { cx: 220, cy: 200 },
    { cx: 320, cy: 180 },
    { cx: 280, cy: 280 },
  ];
  const puntos: Punto[] = [];
  for (const c of centros) {
    for (let i = 0; i < 30; i++) {
      puntos.push({
        id: nuevoId(),
        x: c.cx + muestreoNormal() * 45,
        y: c.cy + muestreoNormal() * 45,
        cluster: -1,
      });
    }
  }
  return puntos;
}

function presetAlargado(): Punto[] {
  // Dos clusters alargados (no esféricos) en diagonal
  const puntos: Punto[] = [];
  for (let i = 0; i < 60; i++) {
    const t = i / 60;
    const x = 100 + t * 400 + muestreoNormal() * 12;
    const y = 100 + t * 200 + muestreoNormal() * 12;
    puntos.push({ id: nuevoId(), x, y, cluster: -1 });
  }
  for (let i = 0; i < 60; i++) {
    const t = i / 60;
    const x = 100 + t * 400 + muestreoNormal() * 12;
    const y = 320 - t * 200 + muestreoNormal() * 12;
    puntos.push({ id: nuevoId(), x, y, cluster: -1 });
  }
  return puntos;
}

function presetTamanos(): Punto[] {
  // Un cluster grande y otro pequeño cercano
  const puntos: Punto[] = [];
  // Cluster grande
  for (let i = 0; i < 80; i++) {
    puntos.push({
      id: nuevoId(),
      x: 200 + muestreoNormal() * 60,
      y: 200 + muestreoNormal() * 60,
      cluster: -1,
    });
  }
  // Cluster pequeño cercano
  for (let i = 0; i < 12; i++) {
    puntos.push({
      id: nuevoId(),
      x: 430 + muestreoNormal() * 18,
      y: 230 + muestreoNormal() * 18,
      cluster: -1,
    });
  }
  return puntos;
}

function distanciaCuad(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function inicializarAleatorio(puntos: Punto[], k: number): Centroide[] {
  if (puntos.length === 0) return [];
  // Elegir k puntos aleatorios distintos como semillas
  const indices: number[] = [];
  const usados = new Set<number>();
  while (indices.length < k && indices.length < puntos.length) {
    const idx = Math.floor(Math.random() * puntos.length);
    if (!usados.has(idx)) {
      usados.add(idx);
      indices.push(idx);
    }
  }
  // Si hay menos puntos que k, completar con coordenadas aleatorias en el lienzo
  while (indices.length < k) {
    indices.push(-1);
  }
  return indices.map((idx) => {
    if (idx === -1) {
      return {
        x: MARGEN_LIENZO + Math.random() * (ANCHO_LIENZO - 2 * MARGEN_LIENZO),
        y: MARGEN_LIENZO + Math.random() * (ALTO_LIENZO - 2 * MARGEN_LIENZO),
        trayectoria: [],
      };
    }
    return { x: puntos[idx].x, y: puntos[idx].y, trayectoria: [] };
  });
}

function inicializarKmeansPlus(puntos: Punto[], k: number): Centroide[] {
  if (puntos.length === 0) return [];
  const centroides: Centroide[] = [];
  // Primer centroide: aleatorio uniforme entre los puntos
  const primerIdx = Math.floor(Math.random() * puntos.length);
  centroides.push({ x: puntos[primerIdx].x, y: puntos[primerIdx].y, trayectoria: [] });

  while (centroides.length < k) {
    // Para cada punto, calcular distancia² al centroide más cercano
    const distancias = puntos.map((p) => {
      let dMin = Infinity;
      for (const c of centroides) {
        const d = distanciaCuad(p, c);
        if (d < dMin) dMin = d;
      }
      return dMin;
    });
    const suma = distancias.reduce((s, d) => s + d, 0);
    if (suma === 0) {
      // Todos los puntos coinciden con un centroide
      centroides.push({
        x: MARGEN_LIENZO + Math.random() * (ANCHO_LIENZO - 2 * MARGEN_LIENZO),
        y: MARGEN_LIENZO + Math.random() * (ALTO_LIENZO - 2 * MARGEN_LIENZO),
        trayectoria: [],
      });
      continue;
    }
    // Muestreo proporcional a la distancia²
    let r = Math.random() * suma;
    let elegido = 0;
    for (let i = 0; i < distancias.length; i++) {
      r -= distancias[i];
      if (r <= 0) {
        elegido = i;
        break;
      }
    }
    centroides.push({ x: puntos[elegido].x, y: puntos[elegido].y, trayectoria: [] });
  }
  return centroides;
}

function asignarPuntos(puntos: Punto[], centroides: Centroide[]): number[] {
  return puntos.map((p) => {
    let mejor = 0;
    let mejorDist = Infinity;
    for (let j = 0; j < centroides.length; j++) {
      const d = distanciaCuad(p, centroides[j]);
      if (d < mejorDist) {
        mejorDist = d;
        mejor = j;
      }
    }
    return mejor;
  });
}

function calcularInertia(puntos: Punto[], asignaciones: number[], centroides: Centroide[]): number {
  if (centroides.length === 0) return 0;
  let suma = 0;
  for (let i = 0; i < puntos.length; i++) {
    const c = centroides[asignaciones[i]];
    if (c) {
      suma += distanciaCuad(puntos[i], c);
    }
  }
  return suma;
}

function recalcularCentroides(puntos: Punto[], asignaciones: number[], centroides: Centroide[]): Centroide[] {
  return centroides.map((c, j) => {
    const cluster = puntos.filter((_, i) => asignaciones[i] === j);
    if (cluster.length === 0) {
      // Mantener centroide vacío
      return { x: c.x, y: c.y, trayectoria: [...c.trayectoria, { x: c.x, y: c.y }] };
    }
    const nx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
    const ny = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;
    return {
      x: nx,
      y: ny,
      trayectoria: [...c.trayectoria, { x: c.x, y: c.y }],
    };
  });
}

// Ejecutar k-means hasta convergencia (sin animación) — para método del codo
function kmeansCompleto(puntos: Punto[], k: number, metodoInit: MetodoInit, maxIter: number): number {
  if (puntos.length === 0 || k === 0) return 0;
  let centroides = metodoInit === 'aleatorio'
    ? inicializarAleatorio(puntos, k)
    : inicializarKmeansPlus(puntos, k);
  let asignaciones = asignarPuntos(puntos, centroides);
  for (let iter = 0; iter < maxIter; iter++) {
    const nuevos = recalcularCentroides(puntos, asignaciones, centroides);
    const movimiento = Math.max(
      ...centroides.map((c, j) => Math.hypot(c.x - nuevos[j].x, c.y - nuevos[j].y)),
    );
    centroides = nuevos;
    asignaciones = asignarPuntos(puntos, centroides);
    if (movimiento < 0.5) break;
  }
  return calcularInertia(puntos, asignaciones, centroides);
}

function metodoCodo(puntos: Punto[], metodoInit: MetodoInit, maxIter: number): ResultadoElbow[] {
  const resultados: ResultadoElbow[] = [];
  for (let k = 1; k <= 10; k++) {
    // Repetir 3 veces y quedarse con el mejor (mín inertia)
    let mejor = Infinity;
    for (let r = 0; r < 3; r++) {
      const inertia = kmeansCompleto(puntos, k, metodoInit, maxIter);
      if (inertia < mejor) mejor = inertia;
    }
    resultados.push({ k, inertia: mejor });
  }
  return resultados;
}

export default function SimuladorKmeans() {
  const [puntos, setPuntos] = useState<Punto[]>(() => presetSeparados());
  const [k, setK] = useState<number>(3);
  const [metodoInit, setMetodoInit] = useState<MetodoInit>('kmeans++');
  const [maxIter, setMaxIter] = useState<number>(20);
  const [centroides, setCentroides] = useState<Centroide[]>([]);
  const [asignaciones, setAsignaciones] = useState<number[]>([]);
  const [iteracionActual, setIteracionActual] = useState<number>(0);
  const [convergido, setConvergido] = useState<boolean>(false);
  const [inertia, setInertia] = useState<number>(0);
  const [mostrarLineas, setMostrarLineas] = useState<boolean>(false);
  const [mostrarTrayectoria, setMostrarTrayectoria] = useState<boolean>(true);
  const [modoEdicion, setModoEdicion] = useState<ModoEdicion>('anadir');
  const [kReal, setKReal] = useState<number>(3);
  const [puntosPorCluster, setPuntosPorCluster] = useState<number>(25);
  const [puntosUniforme, setPuntosUniforme] = useState<number>(100);
  const [resultadoElbow, setResultadoElbow] = useState<ResultadoElbow[] | null>(null);
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
  const [ejecutandoAuto, setEjecutandoAuto] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpieza de timers al desmontar
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current);
      }
    };
  }, []);

  // Actualizar puntos coloreados según asignaciones
  const puntosColoreados = useMemo<Punto[]>(() => {
    return puntos.map((p, i) => ({
      ...p,
      cluster: asignaciones[i] !== undefined ? asignaciones[i] : -1,
    }));
  }, [puntos, asignaciones]);

  const tamanosCluster = useMemo<number[]>(() => {
    const t: number[] = Array(k).fill(0);
    asignaciones.forEach((a) => {
      if (a >= 0 && a < k) t[a] += 1;
    });
    return t;
  }, [asignaciones, k]);

  const inicializarSimulacion = useCallback(() => {
    if (puntos.length === 0) return;
    const nuevos = metodoInit === 'aleatorio'
      ? inicializarAleatorio(puntos, k)
      : inicializarKmeansPlus(puntos, k);
    setCentroides(nuevos);
    const asig = asignarPuntos(puntos, nuevos);
    setAsignaciones(asig);
    setInertia(calcularInertia(puntos, asig, nuevos));
    setIteracionActual(0);
    setConvergido(false);
  }, [puntos, k, metodoInit]);

  const iterarUnPaso = useCallback(() => {
    if (centroides.length === 0 || convergido) return;
    const nuevosCent = recalcularCentroides(puntos, asignaciones, centroides);
    const movimiento = Math.max(
      ...centroides.map((c, j) => Math.hypot(c.x - nuevosCent[j].x, c.y - nuevosCent[j].y)),
    );
    const nuevasAsig = asignarPuntos(puntos, nuevosCent);
    setCentroides(nuevosCent);
    setAsignaciones(nuevasAsig);
    setInertia(calcularInertia(puntos, nuevasAsig, nuevosCent));
    setIteracionActual((prev) => prev + 1);
    if (movimiento < 0.5) {
      setConvergido(true);
    }
  }, [puntos, centroides, asignaciones, convergido]);

  // Ejecución automática hasta convergencia
  useEffect(() => {
    if (!ejecutandoAuto) return;
    if (convergido || iteracionActual >= maxIter) {
      setEjecutandoAuto(false);
      return;
    }
    animTimeoutRef.current = setTimeout(() => {
      iterarUnPaso();
    }, 600);
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, [ejecutandoAuto, convergido, iteracionActual, maxIter, iterarUnPaso]);

  const ejecutarHastaConvergencia = useCallback(() => {
    if (centroides.length === 0) {
      inicializarSimulacion();
    }
    setEjecutandoAuto(true);
  }, [centroides.length, inicializarSimulacion]);

  const detenerEjecucion = useCallback(() => {
    setEjecutandoAuto(false);
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
  }, []);

  const reiniciar = useCallback(() => {
    detenerEjecucion();
    setCentroides([]);
    setAsignaciones([]);
    setIteracionActual(0);
    setConvergido(false);
    setInertia(0);
    setResultadoElbow(null);
  }, [detenerEjecucion]);

  const limpiarPuntos = useCallback(() => {
    detenerEjecucion();
    setPuntos([]);
    setCentroides([]);
    setAsignaciones([]);
    setIteracionActual(0);
    setConvergido(false);
    setInertia(0);
    setResultadoElbow(null);
  }, [detenerEjecucion]);

  const cargarPreset = useCallback((preset: DatasetPreset) => {
    detenerEjecucion();
    let nuevos: Punto[] = [];
    if (preset === 'separados') nuevos = presetSeparados();
    else if (preset === 'solapados') nuevos = presetSolapados();
    else if (preset === 'alargado') nuevos = presetAlargado();
    else nuevos = presetTamanos();
    setPuntos(nuevos);
    setCentroides([]);
    setAsignaciones([]);
    setIteracionActual(0);
    setConvergido(false);
    setInertia(0);
    setResultadoElbow(null);
  }, [detenerEjecucion]);

  const generarGaussianasHandler = useCallback(() => {
    detenerEjecucion();
    const nuevos = generarGaussianas(kReal, puntosPorCluster);
    setPuntos(nuevos);
    setCentroides([]);
    setAsignaciones([]);
    setIteracionActual(0);
    setConvergido(false);
    setInertia(0);
    setResultadoElbow(null);
  }, [kReal, puntosPorCluster, detenerEjecucion]);

  const generarUniformeHandler = useCallback(() => {
    detenerEjecucion();
    const nuevos = generarUniforme(puntosUniforme);
    setPuntos(nuevos);
    setCentroides([]);
    setAsignaciones([]);
    setIteracionActual(0);
    setConvergido(false);
    setInertia(0);
    setResultadoElbow(null);
  }, [puntosUniforme, detenerEjecucion]);

  // Coordenadas SVG -> coordenadas de datos
  const coordsSvg = useCallback((evt: React.MouseEvent<SVGSVGElement> | React.PointerEvent<SVGSVGElement>): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * ANCHO_LIENZO;
    const y = ((evt.clientY - rect.top) / rect.height) * ALTO_LIENZO;
    return { x, y };
  }, []);

  const onSvgClick = useCallback((evt: React.MouseEvent<SVGSVGElement>) => {
    if (modoEdicion !== 'anadir') return;
    const c = coordsSvg(evt);
    if (!c) return;
    if (c.x < MARGEN_LIENZO || c.x > ANCHO_LIENZO - MARGEN_LIENZO) return;
    if (c.y < MARGEN_LIENZO || c.y > ALTO_LIENZO - MARGEN_LIENZO) return;
    setPuntos((prev) => [...prev, { id: nuevoId(), x: c.x, y: c.y, cluster: -1 }]);
    // Si ya había simulación, resetear
    if (centroides.length > 0) {
      setCentroides([]);
      setAsignaciones([]);
      setIteracionActual(0);
      setConvergido(false);
      setInertia(0);
    }
  }, [modoEdicion, coordsSvg, centroides.length]);

  const onPuntoPointerDown = useCallback((evt: React.PointerEvent<SVGCircleElement>, id: string) => {
    if (modoEdicion !== 'arrastrar') return;
    evt.stopPropagation();
    setArrastrandoId(id);
    (evt.currentTarget as Element).setPointerCapture?.(evt.pointerId);
  }, [modoEdicion]);

  const onSvgPointerMove = useCallback((evt: React.PointerEvent<SVGSVGElement>) => {
    if (!arrastrandoId) return;
    const c = coordsSvg(evt);
    if (!c) return;
    const nx = Math.max(MARGEN_LIENZO, Math.min(ANCHO_LIENZO - MARGEN_LIENZO, c.x));
    const ny = Math.max(MARGEN_LIENZO, Math.min(ALTO_LIENZO - MARGEN_LIENZO, c.y));
    setPuntos((prev) => prev.map((p) => (p.id === arrastrandoId ? { ...p, x: nx, y: ny } : p)));
  }, [arrastrandoId, coordsSvg]);

  const onSvgPointerUp = useCallback(() => {
    setArrastrandoId(null);
  }, []);

  const calcularElbowHandler = useCallback(() => {
    if (puntos.length < 10) return;
    const resultados = metodoCodo(puntos, metodoInit, maxIter);
    setResultadoElbow(resultados);
  }, [puntos, metodoInit, maxIter]);

  // Color cluster (-1 = sin asignar)
  const colorCluster = (idx: number): string => {
    if (idx < 0) return '#94a3b8';
    return COLORES_CLUSTER[idx % COLORES_CLUSTER.length];
  };

  // Construir path para curva del codo
  const elbowPath = useMemo<string>(() => {
    if (!resultadoElbow || resultadoElbow.length === 0) return '';
    const maxInertia = Math.max(...resultadoElbow.map((r) => r.inertia));
    if (maxInertia === 0) return '';
    const w = 380;
    const h = 200;
    const padX = 40;
    const padY = 20;
    const xStep = (w - 2 * padX) / 9;
    return resultadoElbow
      .map((r, i) => {
        const x = padX + i * xStep;
        const y = padY + (1 - r.inertia / maxInertia) * (h - 2 * padY);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [resultadoElbow]);

  // Detectar el codo (heurística: máxima distancia de cada punto a la línea k=1 → k=10)
  const codoDetectado = useMemo<number | null>(() => {
    if (!resultadoElbow || resultadoElbow.length < 3) return null;
    const a = resultadoElbow[0];
    const b = resultadoElbow[resultadoElbow.length - 1];
    const dx = b.k - a.k;
    const dy = b.inertia - a.inertia;
    const norma = Math.hypot(dx, dy);
    if (norma === 0) return null;
    let mejorIdx = 0;
    let mejorDist = -1;
    for (let i = 1; i < resultadoElbow.length - 1; i++) {
      const r = resultadoElbow[i];
      // Distancia perpendicular
      const dist = Math.abs(dy * r.k - dx * r.inertia + b.k * a.inertia - b.inertia * a.k) / norma;
      if (dist > mejorDist) {
        mejorDist = dist;
        mejorIdx = i;
      }
    }
    return resultadoElbow[mejorIdx].k;
  }, [resultadoElbow]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de K-Means Clustering</h1>
        <p className={styles.subtitle}>
          Añade puntos, elige K y observa la convergencia paso a paso. Aprendizaje no supervisado interactivo.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Datasets predefinidos */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Datasets predefinidos</h2>
          <div className={styles.presetGrid}>
            <button type="button" className={styles.ejemploBtn} onClick={() => cargarPreset('separados')}>
              <span className={styles.ejemploTitle}>3 gaussianas separadas</span>
              <span className={styles.ejemploDesc}>K=3 funciona perfectamente</span>
            </button>
            <button type="button" className={styles.ejemploBtn} onClick={() => cargarPreset('solapados')}>
              <span className={styles.ejemploTitle}>Clusters solapados</span>
              <span className={styles.ejemploDesc}>K=3 ideal pero difícil</span>
            </button>
            <button type="button" className={styles.ejemploBtn} onClick={() => cargarPreset('alargado')}>
              <span className={styles.ejemploTitle}>Forma alargada</span>
              <span className={styles.ejemploDesc}>k-means falla (didáctico)</span>
            </button>
            <button type="button" className={styles.ejemploBtn} onClick={() => cargarPreset('tamanos')}>
              <span className={styles.ejemploTitle}>Tamaños distintos</span>
              <span className={styles.ejemploDesc}>El grande absorbe al pequeño</span>
            </button>
          </div>
        </div>

        {/* Generadores */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Generar datos sintéticos</h2>

          <div className={styles.generadorGrid}>
            <div className={styles.generadorCard}>
              <strong>Gaussianas</strong>
              <div className={styles.controlGroup}>
                <label htmlFor="kReal">K real:</label>
                <input
                  id="kReal"
                  type="range"
                  min={2}
                  max={6}
                  value={kReal}
                  onChange={(e) => setKReal(Number(e.target.value))}
                />
                <span className={styles.controlValue}>{kReal}</span>
              </div>
              <div className={styles.controlGroup}>
                <label htmlFor="ppc">Puntos / cluster:</label>
                <input
                  id="ppc"
                  type="range"
                  min={10}
                  max={50}
                  value={puntosPorCluster}
                  onChange={(e) => setPuntosPorCluster(Number(e.target.value))}
                />
                <span className={styles.controlValue}>{puntosPorCluster}</span>
              </div>
              <button type="button" className={styles.actionBtn} onClick={generarGaussianasHandler}>
                Generar gaussianas
              </button>
            </div>

            <div className={styles.generadorCard}>
              <strong>Uniforme</strong>
              <div className={styles.controlGroup}>
                <label htmlFor="pu">Puntos totales:</label>
                <input
                  id="pu"
                  type="range"
                  min={50}
                  max={300}
                  step={10}
                  value={puntosUniforme}
                  onChange={(e) => setPuntosUniforme(Number(e.target.value))}
                />
                <span className={styles.controlValue}>{puntosUniforme}</span>
              </div>
              <button type="button" className={styles.actionBtn} onClick={generarUniformeHandler}>
                Generar uniforme
              </button>
            </div>

            <div className={styles.generadorCard}>
              <strong>Modo edición</strong>
              <div className={styles.metodoSelector}>
                <button
                  type="button"
                  className={`${styles.metodoBtn} ${modoEdicion === 'anadir' ? styles.metodoActive : ''}`}
                  onClick={() => setModoEdicion('anadir')}
                >
                  Añadir (clic)
                </button>
                <button
                  type="button"
                  className={`${styles.metodoBtn} ${modoEdicion === 'arrastrar' ? styles.metodoActive : ''}`}
                  onClick={() => setModoEdicion('arrastrar')}
                >
                  Arrastrar
                </button>
              </div>
              <button type="button" className={styles.actionBtn} onClick={limpiarPuntos}>
                Limpiar todo
              </button>
            </div>
          </div>
        </div>

        {/* Controles k-means */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Parámetros del algoritmo</h2>

          <div className={styles.controlsRow}>
            <div className={styles.controlBlock}>
              <label htmlFor="k">Número de clusters K:</label>
              <div className={styles.controlGroup}>
                <input
                  id="k"
                  type="range"
                  min={2}
                  max={8}
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                />
                <span className={styles.controlValue}>{k}</span>
              </div>
            </div>

            <div className={styles.controlBlock}>
              <label>Inicialización:</label>
              <div className={styles.metodoSelector}>
                <button
                  type="button"
                  className={`${styles.metodoBtn} ${metodoInit === 'aleatorio' ? styles.metodoActive : ''}`}
                  onClick={() => setMetodoInit('aleatorio')}
                >
                  Aleatorio
                </button>
                <button
                  type="button"
                  className={`${styles.metodoBtn} ${metodoInit === 'kmeans++' ? styles.metodoActive : ''}`}
                  onClick={() => setMetodoInit('kmeans++')}
                >
                  k-means++
                </button>
              </div>
            </div>

            <div className={styles.controlBlock}>
              <label htmlFor="iter">Iteraciones máx.:</label>
              <div className={styles.controlGroup}>
                <input
                  id="iter"
                  type="range"
                  min={5}
                  max={50}
                  value={maxIter}
                  onChange={(e) => setMaxIter(Number(e.target.value))}
                />
                <span className={styles.controlValue}>{maxIter}</span>
              </div>
            </div>
          </div>

          <div className={styles.tableActions}>
            <button
              type="button"
              className={styles.calcBtn}
              onClick={inicializarSimulacion}
              disabled={puntos.length < k}
            >
              Inicializar centroides
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={iterarUnPaso}
              disabled={centroides.length === 0 || convergido}
            >
              Iterar 1 paso
            </button>
            {!ejecutandoAuto ? (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={ejecutarHastaConvergencia}
                disabled={puntos.length < k || convergido}
              >
                Ejecutar hasta convergencia
              </button>
            ) : (
              <button type="button" className={styles.actionBtn} onClick={detenerEjecucion}>
                Detener ejecución
              </button>
            )}
            <button type="button" className={styles.actionBtn} onClick={reiniciar}>
              Reiniciar
            </button>
          </div>

          <div className={styles.toggleRow}>
            <label>
              <input
                type="checkbox"
                checked={mostrarLineas}
                onChange={(e) => setMostrarLineas(e.target.checked)}
              />
              Mostrar líneas a centroide
            </label>
            <label>
              <input
                type="checkbox"
                checked={mostrarTrayectoria}
                onChange={(e) => setMostrarTrayectoria(e.target.checked)}
              />
              Mostrar trayectoria centroides
            </label>
          </div>
        </div>

        {/* Lienzo SVG */}
        <div className={styles.canvasContainer}>
          <h2 className={styles.panelTitle}>
            Lienzo {modoEdicion === 'anadir' ? '(clic para añadir punto)' : '(arrastra puntos para moverlos)'}
          </h2>
          <svg
            ref={svgRef}
            className={styles.canvasSvg}
            viewBox={`0 0 ${ANCHO_LIENZO} ${ALTO_LIENZO}`}
            preserveAspectRatio="xMidYMid meet"
            onClick={onSvgClick}
            onPointerMove={onSvgPointerMove}
            onPointerUp={onSvgPointerUp}
            onPointerLeave={onSvgPointerUp}
            role="img"
            aria-label="Lienzo de puntos para clustering"
          >
            {/* Fondo */}
            <rect
              x={0}
              y={0}
              width={ANCHO_LIENZO}
              height={ALTO_LIENZO}
              className={styles.canvasFondo}
            />
            {/* Cuadrícula */}
            {Array.from({ length: 11 }).map((_, i) => (
              <line
                key={`gx-${i}`}
                x1={i * (ANCHO_LIENZO / 10)}
                y1={0}
                x2={i * (ANCHO_LIENZO / 10)}
                y2={ALTO_LIENZO}
                className={styles.canvasGrid}
              />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={`gy-${i}`}
                x1={0}
                y1={i * (ALTO_LIENZO / 6)}
                x2={ANCHO_LIENZO}
                y2={i * (ALTO_LIENZO / 6)}
                className={styles.canvasGrid}
              />
            ))}

            {/* Líneas de cada punto al centroide */}
            {mostrarLineas && centroides.length > 0 &&
              puntosColoreados.map((p, i) => {
                const c = centroides[asignaciones[i]];
                if (!c) return null;
                return (
                  <line
                    key={`l-${p.id}`}
                    x1={p.x}
                    y1={p.y}
                    x2={c.x}
                    y2={c.y}
                    stroke={colorCluster(asignaciones[i])}
                    strokeWidth={0.5}
                    opacity={0.35}
                  />
                );
              })}

            {/* Trayectoria de centroides */}
            {mostrarTrayectoria && centroides.map((c, j) => {
              if (c.trayectoria.length === 0) return null;
              const pts = [...c.trayectoria, { x: c.x, y: c.y }];
              const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
              return (
                <path
                  key={`tr-${j}`}
                  d={path}
                  className={styles.trayectoriaPath}
                  stroke={colorCluster(j)}
                  fill="none"
                />
              );
            })}

            {/* Puntos */}
            {puntosColoreados.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={5}
                className={styles.puntoCircle}
                fill={colorCluster(p.cluster)}
                onPointerDown={(e) => onPuntoPointerDown(e, p.id)}
                style={{ cursor: modoEdicion === 'arrastrar' ? 'grab' : 'crosshair' }}
              />
            ))}

            {/* Centroides (cuadrados grandes) */}
            {centroides.map((c, j) => (
              <g key={`c-${j}`}>
                <rect
                  x={c.x - 9}
                  y={c.y - 9}
                  width={18}
                  height={18}
                  className={styles.centroideMarker}
                  fill={colorCluster(j)}
                />
                <line
                  x1={c.x - 6}
                  y1={c.y}
                  x2={c.x + 6}
                  y2={c.y}
                  stroke="white"
                  strokeWidth={2}
                />
                <line
                  x1={c.x}
                  y1={c.y - 6}
                  x2={c.x}
                  y2={c.y + 6}
                  stroke="white"
                  strokeWidth={2}
                />
              </g>
            ))}
          </svg>
          <p className={styles.lienzoNota}>
            {puntos.length} {puntos.length === 1 ? 'punto' : 'puntos'} en el lienzo
          </p>
        </div>

        {/* Métricas */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Iteración</span>
            <div className={styles.metricValue}>
              {iteracionActual}
              <span className={styles.metricUnit}>/ {maxIter}</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Inertia (SSE)</span>
            <div className={styles.metricValue}>
              {centroides.length > 0 ? formatNumber(inertia, 0) : '—'}
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Estado</span>
            <div className={styles.metricValue}>
              {centroides.length === 0
                ? 'Sin iniciar'
                : convergido
                  ? '✓ Convergido'
                  : ejecutandoAuto
                    ? 'Ejecutando…'
                    : 'En progreso'}
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Puntos / clusters</span>
            <div className={styles.metricValue}>
              {puntos.length}
              <span className={styles.metricUnit}>/ K={k}</span>
            </div>
          </div>
        </div>

        {/* Tamaños de cada cluster */}
        {centroides.length > 0 && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Tamaños de cada cluster</h2>
            <div className={styles.clustersGrid}>
              {tamanosCluster.map((tam, j) => (
                <div key={j} className={styles.clusterRow}>
                  <span
                    className={styles.clusterDot}
                    style={{ background: colorCluster(j) }}
                    aria-hidden="true"
                  />
                  <strong>Cluster {j + 1}</strong>
                  <span className={styles.clusterMeta}>
                    {tam} {tam === 1 ? 'punto' : 'puntos'}
                  </span>
                  <span className={styles.clusterCoord}>
                    centroide ({formatNumber(centroides[j].x, 1)}, {formatNumber(centroides[j].y, 1)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Método del codo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Método del Codo (Elbow Method)</h2>
          <p className={styles.codoDesc}>
            Ejecuta k-means para K = 1 hasta K = 10 y muestra cómo decrece la inercia. El codo de la curva sugiere un buen valor de K.
          </p>
          <div className={styles.tableActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={calcularElbowHandler}
              disabled={puntos.length < 10}
            >
              Calcular curva del codo
            </button>
            {resultadoElbow && (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setResultadoElbow(null)}
              >
                Ocultar curva
              </button>
            )}
          </div>

          {resultadoElbow && (
            <div className={styles.elbowChart}>
              <svg viewBox="0 0 380 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Curva del método del codo">
                {/* Ejes */}
                <line x1={40} y1={20} x2={40} y2={180} stroke="var(--text-secondary)" strokeWidth={1} />
                <line x1={40} y1={180} x2={360} y2={180} stroke="var(--text-secondary)" strokeWidth={1} />
                {/* Etiquetas K */}
                {resultadoElbow.map((r, i) => {
                  const x = 40 + i * ((380 - 80) / 9);
                  return (
                    <text
                      key={`xl-${i}`}
                      x={x}
                      y={195}
                      className={styles.elbowAxisLabel}
                      textAnchor="middle"
                    >
                      {r.k}
                    </text>
                  );
                })}
                <text x={200} y={210} textAnchor="middle" className={styles.elbowAxisTitle}>
                  K (clusters)
                </text>
                <text
                  x={10}
                  y={100}
                  textAnchor="middle"
                  className={styles.elbowAxisTitle}
                  transform="rotate(-90 10 100)"
                >
                  Inertia
                </text>

                {/* Línea */}
                <path d={elbowPath} className={styles.elbowLine} />

                {/* Puntos */}
                {resultadoElbow.map((r, i) => {
                  const maxInertia = Math.max(...resultadoElbow.map((rr) => rr.inertia)) || 1;
                  const x = 40 + i * ((380 - 80) / 9);
                  const y = 20 + (1 - r.inertia / maxInertia) * (200 - 40);
                  const esCodo = codoDetectado === r.k;
                  return (
                    <circle
                      key={`ep-${i}`}
                      cx={x}
                      cy={y}
                      r={esCodo ? 7 : 4}
                      className={styles.elbowPoint}
                      fill={esCodo ? 'var(--secondary)' : 'var(--primary)'}
                    >
                      <title>K={r.k}, inertia={Math.round(r.inertia)}</title>
                    </circle>
                  );
                })}
              </svg>
              {codoDetectado && (
                <p className={styles.codoSugerido}>
                  <strong>Codo detectado en K = {codoDetectado}</strong>
                  <span className={styles.codoNota}>
                    (heurística: punto de máxima distancia a la línea k=1 → k=10)
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía de K-Means Clustering"
        subtitle="Algoritmo de aprendizaje no supervisado"
      >
        <h3>Pasos del Algoritmo K-Means</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Paso</th>
                <th>Qué hace</th>
                <th>Fórmula / criterio</th>
                <th>Coste por iteración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Inicialización</strong></td>
                <td>Elegir K centroides iniciales</td>
                <td>Aleatorio entre puntos, o k-means++ proporcional a d²</td>
                <td>O(N·K) en k-means++</td>
              </tr>
              <tr>
                <td><strong>2. Asignación</strong></td>
                <td>Cada punto se asigna al centroide más cercano</td>
                <td>argmin_j ‖xᵢ − μⱼ‖²</td>
                <td>O(N·K·d)</td>
              </tr>
              <tr>
                <td><strong>3. Recálculo</strong></td>
                <td>Cada centroide se mueve al promedio de sus puntos</td>
                <td>μⱼ = (1 / |Cⱼ|) · Σ xᵢ para xᵢ ∈ Cⱼ</td>
                <td>O(N·d)</td>
              </tr>
              <tr>
                <td><strong>4. Convergencia</strong></td>
                <td>Repetir hasta que los centroides no se muevan</td>
                <td>Cambio en centroides &lt; tolerancia (o iter máx)</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>5. Métrica</strong></td>
                <td>Inertia (suma de distancias² intra-cluster)</td>
                <td>SSE = Σⱼ Σ_(xᵢ ∈ Cⱼ) ‖xᵢ − μⱼ‖²</td>
                <td>O(N·d)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <strong>Estudiante de IA / FP Informática</strong>
            </div>
            <p className={styles.escenarioExample}>
              Estudias Machine Learning y necesitas entender por qué k-means converge, qué es la inercia y cómo afecta la inicialización al resultado final.
            </p>
            <div className={styles.escenarioTip}>
              Carga &laquo;3 gaussianas separadas&raquo;, prueba inicialización aleatoria varias veces y observa cómo a veces converge a una solución peor.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
              <strong>Segmentación de clientes (marketing)</strong>
            </div>
            <p className={styles.escenarioExample}>
              Una empresa con 100.000 clientes quiere agruparlos por comportamiento de compra (RFM: Recency, Frequency, Monetary) para campañas personalizadas.
            </p>
            <div className={styles.escenarioTip}>
              En la práctica, normalizar variables y usar el método del codo o la silueta para elegir K antes de aplicar k-means.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🖼️</span>
              <strong>Compresión de imagen (cuantización de color)</strong>
            </div>
            <p className={styles.escenarioExample}>
              Una imagen RGB tiene 16M colores. Aplicando k-means con K=16 a sus píxeles, obtienes una paleta reducida y la imagen ocupa mucho menos.
            </p>
            <div className={styles.escenarioTip}>
              Cada píxel se reasigna al centroide (color) más cercano. Es la base de los formatos GIF y de las paletas optimizadas.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧬</span>
              <strong>Análisis de expresión genética</strong>
            </div>
            <p className={styles.escenarioExample}>
              Un investigador agrupa muestras de pacientes según su perfil de expresión génica para descubrir subtipos de una enfermedad.
            </p>
            <div className={styles.escenarioTip}>
              k-means se aplica tras reducir dimensionalidad con PCA o UMAP. Para datos no esféricos, considerar DBSCAN o clustering jerárquico.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cómo elijo el número correcto de clusters K?</h4>
            <p>
              No hay respuesta única. Las técnicas más usadas son: <strong>método del codo</strong> (graficar inertia vs K y buscar el &laquo;codo&raquo;), <strong>coeficiente de silueta</strong> (mide qué tan bien encajan los puntos en su cluster), y <strong>conocimiento del dominio</strong> (si sabes que hay 5 segmentos de clientes, prueba K=5).
            </p>
            <p className={styles.faqTip}>Pulsa &laquo;Calcular curva del codo&raquo; en este simulador para ver el método aplicado a tus puntos.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué k-means++ es mejor que la inicialización aleatoria?</h4>
            <p>
              La inicialización aleatoria puede colocar dos centroides muy cerca, haciendo que k-means converja a un mínimo local malo. k-means++ elige los centroides iniciales separados entre sí (probabilidad proporcional a d² al centroide más cercano), lo que reduce el riesgo y suele dar mejor inertia final.
            </p>
            <p className={styles.faqTip}>Carga &laquo;3 gaussianas separadas&raquo;, ejecuta varias veces con cada inicialización y compara la inertia final.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿K-means siempre converge?</h4>
            <p>
              Sí, k-means siempre converge en un número finito de iteraciones porque la inertia disminuye en cada paso (o se mantiene). Pero <strong>no garantiza el óptimo global</strong>: puede quedarse atrapado en un mínimo local. Por eso se ejecuta varias veces con distintas semillas y se elige la solución de menor inertia.
            </p>
            <p className={styles.faqTip}>En scikit-learn el parámetro <code>n_init</code> controla cuántas inicializaciones distintas se prueban (por defecto 10).</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo falla k-means?</h4>
            <p>
              K-means asume clusters <strong>esféricos, de tamaños similares y de densidades parecidas</strong>. Falla con: clusters alargados o curvados (DBSCAN va mejor), clusters de tamaños muy distintos (el grande absorbe al pequeño), datos con mucho ruido u outliers (k-medoids es más robusto), y datos no escalados (variables grandes dominan).
            </p>
            <p className={styles.faqTip}>Carga el preset &laquo;Forma alargada&raquo; en este simulador para ver el fallo de forma visual.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre k-means y k-medoids (PAM)?</h4>
            <p>
              En k-means el centroide es el <strong>promedio aritmético</strong> de los puntos del cluster (no es necesariamente un punto real). En k-medoids el medoide es el <strong>punto real</strong> del cluster que minimiza la suma de distancias al resto. K-medoids es más robusto a outliers y permite distancias no euclidianas, pero es más caro computacionalmente.
            </p>
            <p className={styles.faqTip}>Si tu dataset tiene outliers fuertes, considera k-medoids o limpia los outliers antes de aplicar k-means.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es la inercia y por qué importa?</h4>
            <p>
              La inercia (también llamada SSE o WCSS) es la <strong>suma de distancias al cuadrado de cada punto a su centroide</strong>. Mide qué tan compactos son los clusters. K-means la minimiza paso a paso. A más K, menor inercia (en el extremo, K = N puntos da inercia 0). Por eso no se puede minimizar y ya: hay que equilibrar inercia con número de clusters (de ahí el método del codo).
            </p>
            <p className={styles.faqTip}>Observa cómo la inercia baja en cada iteración de este simulador hasta estabilizarse.</p>
          </div>
        </div>

        <h3>Cómo Aplicar K-Means a tus Datos — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Prepara los datos</strong>
              <p>
                Elimina filas con valores faltantes, codifica las variables categóricas (one-hot encoding) y, sobre todo, <strong>escala las variables numéricas</strong> (StandardScaler o MinMaxScaler). Si una variable tiene rango 0-1000 y otra 0-1, la primera dominará la distancia.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Reduce dimensionalidad si es necesario</strong>
              <p>
                Si tienes más de 20-30 variables, aplica PCA o UMAP antes de k-means. La maldición de la dimensionalidad hace que las distancias euclidianas pierdan significado en alta dimensión.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Elige K con método del codo o silueta</strong>
              <p>
                Ejecuta k-means para K = 2 a 10 y grafica inertia vs K. El &laquo;codo&raquo; (donde la pendiente cambia bruscamente) sugiere un buen K. Como complemento, calcula el coeficiente de silueta y elige el K con mayor silueta media.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Ejecuta k-means con varias semillas</strong>
              <p>
                Usa k-means++ y <code>n_init = 10</code> (o más) para evitar mínimos locales. Quédate con la solución de menor inertia. Establece <code>random_state</code> para reproducibilidad.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Interpreta y valida los clusters</strong>
              <p>
                Calcula las medias de cada cluster en las variables originales. Visualiza con scatterplot 2D (PCA si hay muchas variables). Pregúntate: ¿los clusters tienen sentido de negocio? Si no, replantea el preprocesamiento o el K.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
            <strong>Escala SIEMPRE las variables</strong>
            <p>StandardScaler en scikit-learn. Sin escalar, k-means da resultados sin sentido cuando las variables tienen unidades distintas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Usa k-means++ por defecto</strong>
            <p>Es el default en scikit-learn. Casi siempre da mejor inertia final que la inicialización aleatoria, con coste computacional ligero.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔁</span>
            <strong>Ejecuta múltiples veces</strong>
            <p>Sube <code>n_init</code> a 10-50 para datos importantes. Quédate con la mejor solución (menor inertia). El tiempo extra suele compensar.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <strong>Combina codo y silueta</strong>
            <p>El codo es subjetivo y a veces no es claro. La silueta da un número entre -1 y 1: cerca de 1 = bueno, cerca de 0 = puntos en frontera.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🚫</span>
            <strong>No fuerces k-means con datos no esféricos</strong>
            <p>Si tus datos son alargados, en forma de luna o anillos, prueba DBSCAN, clustering jerárquico o Gaussian Mixture Models.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧹</span>
            <strong>Trata los outliers antes</strong>
            <p>K-means es sensible a outliers (mueven los centroides). Detecta y elimina (o aísla) outliers con IsolationForest o IQR antes del clustering.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes a evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              No escalar las variables: la variable con mayor rango domina la distancia y los clusters se forman solo según ella.
            </li>
            <li>
              Asumir que más K es mejor: la inercia siempre baja con K, pero los clusters pierden interpretabilidad. El codo y la silueta evitan este error.
            </li>
            <li>
              Aplicar k-means a datos categóricos sin codificar correctamente: distancia euclidiana sobre etiquetas no tiene sentido.
            </li>
            <li>
              Confundir inercia baja con &laquo;buen clustering&raquo;: con K = N puntos la inercia es 0 pero el clustering es inútil.
            </li>
            <li>
              Ejecutar una sola vez con inicialización aleatoria: puedes caer en un mínimo local malo. Usa <code>n_init</code> &gt; 1.
            </li>
            <li>
              No interpretar los clusters: obtener clusters no es el final. Hay que calcular medias por cluster, validarlos con el negocio y darles nombre.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-kmeans')} />
      <ShareCard appName="simulador-kmeans" />
      <Footer appName="simulador-kmeans" />
    </div>
  );
}
