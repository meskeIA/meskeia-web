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
import {
  escalarAlLienzo,
  lienzoADatos,
  marcoDatos,
  parsearDatosTabulares,
  MAX_PUNTOS_IMPORTADOS,
  type PuntoDato,
  type Rango,
} from './parseo-datos';

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

/** Lo que se cuenta a quien acaba de importar su tabla: qué se ha leído y con qué escala */
interface ResumenImportado {
  n: number;
  nombres: { x: string; y: string };
  rangoX: { min: number; max: number };
  rangoY: { min: number; max: number };
  filasIgnoradas: number;
  recortadoA: number | null;
  aviso: string | null;
}

/**
 * En qué unidades viven los puntos del lienzo.
 *  - 'lienzo': presets, generadores y clics sobre un lienzo vacío. Los datos son sintéticos,
 *    sin unidades propias: se miden en píxeles del lienzo (iguales en los dos ejes).
 *  - 'datos': una tabla importada. Cada columna se normaliza min-max y se dibuja en el
 *    cuadrado de MARCO_DATOS; los centroides se devuelven a las unidades de las columnas.
 */
type Espacio =
  | { tipo: 'lienzo' }
  | { tipo: 'datos'; nombres: { x: string; y: string }; rangoX: Rango; rangoY: Rango };

/** Rectángulo del lienzo donde puede caer un centroide sorteado */
interface Zona {
  x0: number;
  y0: number;
  ancho: number;
  alto: number;
}

/** Ejemplo de la caja de texto: edad e ingresos anuales, dos magnitudes muy dispares */
const EJEMPLO_DATOS = `edad;ingresos
24;18500
27;21000
31;24500
44;52000
47;58000
51;61500
38;33000
41;35500`;

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

/** Cuadrado de 340 px donde se dibujan los datos importados (x de 130 a 470, y de 30 a 370) */
const MARCO_DATOS = marcoDatos(ANCHO_LIENZO, ALTO_LIENZO, MARGEN_LIENZO);

const ZONA_LIENZO: Zona = {
  x0: MARGEN_LIENZO,
  y0: MARGEN_LIENZO,
  ancho: ANCHO_LIENZO - 2 * MARGEN_LIENZO,
  alto: ALTO_LIENZO - 2 * MARGEN_LIENZO,
};
const ZONA_DATOS: Zona = {
  x0: MARCO_DATOS.x0,
  y0: MARCO_DATOS.y0,
  ancho: MARCO_DATOS.lado,
  alto: MARCO_DATOS.lado,
};

const zonaDe = (espacio: Espacio): Zona => (espacio.tipo === 'datos' ? ZONA_DATOS : ZONA_LIENZO);

/**
 * Tamaños en pantalla de lo que se dibuja en el lienzo (hallazgo 2452, 29/09/2026).
 * El SVG tiene un viewBox fijo de 600 × 400 y en un móvil de 390 px se encogía a escala 0,41:
 * puntos de 4,1 px y centroides de 7,3. Los tamaños se calculan con la escala REAL del lienzo
 * (ResizeObserver) y nunca bajan de estos mínimos; en escritorio no cambian.
 */
const RADIO_PUNTO = 5;
const RADIO_PUNTO_MIN_PX = 4;
const LADO_CENTROIDE = 18;
const LADO_CENTROIDE_MIN_PX = 16;
/** Radio de captura, en pantalla, para coger un punto con el dedo: gana el más cercano. */
const CAPTURA_PUNTO_PX = 22;
/** Un puntero que se desplaza más que esto entre pulsar y soltar no es un clic, es un gesto. */
const UMBRAL_GESTO_PX = 8;

/** Los datos importados pueden ser enteros o decimales: no forzar 2 decimales a una edad */
function formatoValor(valor: number): string {
  return Number.isInteger(valor) ? formatNumber(valor, 0) : formatNumber(valor, 2);
}

/**
 * Un valor en las unidades de una columna, con los decimales que pide su amplitud: unas dos
 * cifras significativas por debajo de la amplitud (8 → 1,33 · 27 años → 38,3 · 43.000 € →
 * 45.833). Con amplitud 0 el valor es el de la columna tal cual.
 */
function formatoEnUnidades(valor: number, rango: Rango): string {
  const amplitud = rango.max - rango.min;
  if (amplitud === 0) return formatoValor(valor);
  const decimales = Math.max(0, Math.min(6, 2 - Math.floor(Math.log10(amplitud))));
  return formatNumber(valor, decimales);
}

/**
 * La inercia en las unidades del espacio en que se agrupa: px² del lienzo para los datos
 * sintéticos, y unidades normalizadas (cada eje de 0 a 1) para una tabla importada. Es lo que
 * el algoritmo minimiza; en las unidades de las columnas no tendría sentido sumar años² y
 * euros² (hallazgo 2450).
 */
function inerciaEnEspacio(inerciaPx: number, espacio: Espacio): number {
  return espacio.tipo === 'datos' ? inerciaPx / (MARCO_DATOS.lado * MARCO_DATOS.lado) : inerciaPx;
}

function formatoInercia(inerciaPx: number, espacio: Espacio): string {
  const v = inerciaEnEspacio(inerciaPx, espacio);
  if (espacio.tipo === 'lienzo') return formatNumber(v, 0);
  if (v === 0) return '0';
  return formatNumber(v, v < 10 ? 4 : 2);
}

/** Coordenadas de un centroide: en las unidades de las columnas, o en px del lienzo con Y hacia arriba */
function coordenadasCentroide(c: { x: number; y: number }, espacio: Espacio): string {
  if (espacio.tipo === 'datos') {
    const d = lienzoADatos(c, MARCO_DATOS, espacio.rangoX, espacio.rangoY);
    return `(${formatoEnUnidades(d.x, espacio.rangoX)}; ${formatoEnUnidades(d.y, espacio.rangoY)})`;
  }
  return `(${formatNumber(c.x, 1)}; ${formatNumber(ALTO_LIENZO - c.y, 1)})`;
}

let contadorIds = 0;
function nuevoId(): string {
  contadorIds += 1;
  return `p${contadorIds}`;
}

/**
 * Generador pseudoaleatorio con semilla (mulberry32): solo operaciones enteras de 32 bits,
 * que dan lo mismo en el Node del prerender y en el navegador.
 */
function crearAzarSembrado(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Semilla del dataset de partida (hallazgo 2449, 29/09/2026). Hasta entonces el
 * «3 gaussianas separadas» inicial se sorteaba con Math.random en el prerender y otra vez al
 * hidratar; React 19 no corrige atributos que no coinciden, así que se veían los 90 puntos del
 * servidor y el algoritmo agrupaba los 90 del cliente, invisibles: con K=5, entre 20 y 32
 * puntos salían con el color de otro centroide. Con semilla, los dos lados sortean lo mismo.
 */
const SEMILLA_INICIAL = 20260929;

/**
 * Coordenada redondeada a la centésima de píxel. Box-Muller usa Math.log y Math.cos, y el V8
 * de Node y el de Chromium no dan siempre el mismo último bit en ellas (medido el 23/09/2026
 * en simulador-campo-electrico): con la misma semilla, un punto podría diferir en la 15.ª
 * cifra. Una centésima de píxel no se ve.
 */
const redondearSvg = (v: number): number => Math.round(v * 100) / 100;

// Box-Muller para muestrear normal estándar
function muestreoNormal(azar: () => number = Math.random): number {
  let u1 = azar();
  let u2 = azar();
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

function presetSeparados(azar: () => number = Math.random): Punto[] {
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
        x: redondearSvg(c.cx + muestreoNormal(azar) * 22),
        y: redondearSvg(c.cy + muestreoNormal(azar) * 22),
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

function inicializarAleatorio(puntos: Punto[], k: number, zona: Zona): Centroide[] {
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
  // Si hay menos puntos que k, completar con coordenadas aleatorias en la zona de los datos
  while (indices.length < k) {
    indices.push(-1);
  }
  return indices.map((idx) => {
    if (idx === -1) {
      return {
        x: zona.x0 + Math.random() * zona.ancho,
        y: zona.y0 + Math.random() * zona.alto,
        trayectoria: [],
      };
    }
    return { x: puntos[idx].x, y: puntos[idx].y, trayectoria: [] };
  });
}

function inicializarKmeansPlus(puntos: Punto[], k: number, zona: Zona): Centroide[] {
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
        x: zona.x0 + Math.random() * zona.ancho,
        y: zona.y0 + Math.random() * zona.alto,
        trayectoria: [],
      });
      continue;
    }
    // Muestreo proporcional a la distancia². Un punto con d² = 0 (ya es centroide) tiene
    // probabilidad 0 y se salta: sin eso, con Math.random() = 0 se repetía el punto 0.
    let r = Math.random() * suma;
    let elegido = -1;
    for (let i = 0; i < distancias.length; i++) {
      if (distancias[i] === 0) continue;
      elegido = i;
      r -= distancias[i];
      if (r <= 0) break;
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
function kmeansCompleto(puntos: Punto[], k: number, metodoInit: MetodoInit, maxIter: number, zona: Zona): number {
  if (puntos.length === 0 || k === 0) return 0;
  let centroides = metodoInit === 'aleatorio'
    ? inicializarAleatorio(puntos, k, zona)
    : inicializarKmeansPlus(puntos, k, zona);
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

function metodoCodo(puntos: Punto[], metodoInit: MetodoInit, maxIter: number, zona: Zona): ResultadoElbow[] {
  const resultados: ResultadoElbow[] = [];
  for (let k = 1; k <= 10; k++) {
    // Repetir 3 veces y quedarse con el mejor (mín inercia)
    let mejor = Infinity;
    for (let r = 0; r < 3; r++) {
      const inertia = kmeansCompleto(puntos, k, metodoInit, maxIter, zona);
      if (inertia < mejor) mejor = inertia;
    }
    resultados.push({ k, inertia: mejor });
  }
  return resultados;
}

export default function SimuladorKmeans() {
  // Sorteado con semilla: el prerender y la hidratación dibujan los mismos 90 puntos (hallazgo 2449)
  const [puntos, setPuntos] = useState<Punto[]>(() => presetSeparados(crearAzarSembrado(SEMILLA_INICIAL)));
  const [espacio, setEspacio] = useState<Espacio>({ tipo: 'lienzo' });
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
  const [textoDatos, setTextoDatos] = useState<string>('');
  const [errorImportacion, setErrorImportacion] = useState<string | null>(null);
  const [resumenImportado, setResumenImportado] = useState<ResumenImportado | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Punto agarrado en modo «Arrastrar» y desfase entre el dedo y su centro (unidades del viewBox)
  const arrastreRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  // Dónde se pulsó (px de pantalla), para no tomar por clic un gesto de arrastre
  const inicioPuntero = useRef<{ x: number; y: number } | null>(null);
  // Píxeles de pantalla por unidad del viewBox; 1 hasta que el lienzo se mide en el cliente
  const [pxPorUnidad, setPxPorUnidad] = useState<number>(1);

  // Limpieza de timers al desmontar
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current);
      }
    };
  }, []);

  // Escala real del lienzo: se vuelve a medir al girar el móvil o cambiar el ancho
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const medir = () => {
      // La matriz de pantalla da la escala del contenido, sin el borde de 1 px del <svg>
      const escala = svg.getScreenCTM()?.a ?? svg.getBoundingClientRect().width / ANCHO_LIENZO;
      if (escala > 0) setPxPorUnidad(escala);
    };
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(medir);
    observador.observe(svg);
    return () => observador.disconnect();
  }, []);

  /*
   * El lienzo deja desplazar la página con el dedo (touch-action: manipulation). Solo el
   * arrastre de un punto necesita quedarse el gesto, y eso no se puede declarar con
   * touch-action en los círculos: Chromium lo ignora en los hijos de un <svg> (medido el
   * 28/09/2026 en simulador-grafos). Se cancela aquí el desplazamiento, y solo mientras hay un
   * punto agarrado. React registra sus escuchas táctiles como pasivas: esta tiene que ser nativa.
   */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const retenerGesto = (evt: TouchEvent) => {
      if (arrastreRef.current !== null && evt.cancelable) evt.preventDefault();
    };
    svg.addEventListener('touchmove', retenerGesto, { passive: false });
    return () => svg.removeEventListener('touchmove', retenerGesto);
  }, []);

  // Tamaños en unidades del viewBox que garantizan los mínimos en pantalla (hallazgo 2452)
  const dim = useMemo(() => {
    const escala = pxPorUnidad > 0 ? pxPorUnidad : 1;
    return {
      radio: Math.max(RADIO_PUNTO, RADIO_PUNTO_MIN_PX / escala),
      lado: Math.max(LADO_CENTROIDE, LADO_CENTROIDE_MIN_PX / escala),
      captura: CAPTURA_PUNTO_PX / escala,
    };
  }, [pxPorUnidad]);

  // Actualizar puntos coloreados según asignaciones
  const puntosColoreados = useMemo<Punto[]>(() => {
    return puntos.map((p, i) => ({
      ...p,
      cluster: asignaciones[i] !== undefined ? asignaciones[i] : -1,
    }));
  }, [puntos, asignaciones]);

  /**
   * Cada cluster con su centroide y su número de puntos, derivado de los CENTROIDES que hay
   * en pantalla y NO del deslizador `k`.
   *
   * Van juntos en un mismo array a propósito. Mientras fueron dos listas de longitud distinta
   * —`Array(k)` para los tamaños frente al estado `centroides`, fijado al inicializar— subir el
   * deslizador sin volver a inicializar dejaba índices sin centroide detrás, y el panel de
   * abajo caía al leer `centroides[j].x`. Tres visitantes se quedaron sin la herramienta entre
   * el 10 y el 15/09/2026; bastaba con mover K una posición a la derecha.
   */
  const clusters = useMemo<{ centroide: Centroide; tam: number }[]>(() => {
    const t: number[] = Array(centroides.length).fill(0);
    asignaciones.forEach((a) => {
      if (a >= 0 && a < centroides.length) t[a] += 1;
    });
    return centroides.map((centroide, j) => ({ centroide, tam: t[j] }));
  }, [asignaciones, centroides]);

  // El deslizador se ha movido después de agrupar: lo que se ve en pantalla es de otro K
  const kDesincronizado = centroides.length > 0 && centroides.length !== k;

  const inicializarSimulacion = useCallback(() => {
    if (puntos.length === 0) return;
    const zona = zonaDe(espacio);
    const nuevos = metodoInit === 'aleatorio'
      ? inicializarAleatorio(puntos, k, zona)
      : inicializarKmeansPlus(puntos, k, zona);
    setCentroides(nuevos);
    const asig = asignarPuntos(puntos, nuevos);
    setAsignaciones(asig);
    setInertia(calcularInertia(puntos, asig, nuevos));
    setIteracionActual(0);
    setConvergido(false);
  }, [puntos, k, metodoInit, espacio]);

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
    setEspacio({ tipo: 'lienzo' });
    setResumenImportado(null);
    setCentroides([]);
    setAsignaciones([]);
    setIteracionActual(0);
    setConvergido(false);
    setInertia(0);
    setResultadoElbow(null);
  }, [detenerEjecucion]);

  // ===== Importar datos propios =====
  const colocarPuntos = useCallback((valores: PuntoDato[], nombres: { x: string; y: string }) => {
    const { escalados, rangoX, rangoY } = escalarAlLienzo(
      valores,
      ANCHO_LIENZO,
      ALTO_LIENZO,
      MARGEN_LIENZO,
    );
    setPuntos(escalados.map((p) => ({ id: nuevoId(), x: p.x, y: p.y, cluster: -1 })));
    setEspacio({ tipo: 'datos', nombres, rangoX, rangoY });
    setCentroides([]);
    setAsignaciones([]);
    setIteracionActual(0);
    setConvergido(false);
    setInertia(0);
    setResultadoElbow(null);
    return { rangoX, rangoY, n: escalados.length };
  }, []);

  const importarTexto = useCallback((texto: string) => {
    const resultado = parsearDatosTabulares(texto);
    if (!resultado.ok) {
      setErrorImportacion(resultado.error);
      setResumenImportado(null);
      return;
    }
    detenerEjecucion();
    const { puntos: valores, nombres, filasIgnoradas, recortadoA, aviso } = resultado.datos;
    const { rangoX, rangoY, n } = colocarPuntos(valores, nombres);
    setErrorImportacion(null);
    setResumenImportado({ n, nombres, rangoX, rangoY, filasIgnoradas, recortadoA, aviso });
  }, [colocarPuntos, detenerEjecucion]);

  const cargarFichero = useCallback((evento: React.ChangeEvent<HTMLInputElement>) => {
    const fichero = evento.target.files?.[0];
    evento.target.value = '';   // permite volver a elegir el mismo archivo
    if (!fichero) return;
    const lector = new FileReader();
    lector.onload = () => {
      const contenido = typeof lector.result === 'string' ? lector.result : '';
      setTextoDatos(contenido);
      importarTexto(contenido);
    };
    lector.onerror = () => {
      setErrorImportacion('No se ha podido leer el archivo. Prueba a abrirlo y pegar su contenido.');
      setResumenImportado(null);
    };
    lector.readAsText(fichero);
  }, [importarTexto]);

  const cargarPreset = useCallback((preset: DatasetPreset) => {
    detenerEjecucion();
    let nuevos: Punto[] = [];
    if (preset === 'separados') nuevos = presetSeparados();
    else if (preset === 'solapados') nuevos = presetSolapados();
    else if (preset === 'alargado') nuevos = presetAlargado();
    else nuevos = presetTamanos();
    setPuntos(nuevos);
    setEspacio({ tipo: 'lienzo' });
    setResumenImportado(null);
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
    setEspacio({ tipo: 'lienzo' });
    setResumenImportado(null);
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
    setEspacio({ tipo: 'lienzo' });
    setResumenImportado(null);
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

  /**
   * Clic (o toque) en el lienzo, modo «Añadir». Un deslizamiento del dedo para bajar por la
   * página no llega como clic (el navegador lo cancela); con ratón, un arrastre sí, y por eso
   * se descarta todo gesto que se haya movido más del umbral. Un punto añadido tras importar
   * se lee con la misma escala que la tabla.
   */
  const onSvgClick = useCallback((evt: React.MouseEvent<SVGSVGElement>) => {
    const inicio = inicioPuntero.current;
    inicioPuntero.current = null;
    if (modoEdicion !== 'anadir') return;
    if (inicio && Math.hypot(evt.clientX - inicio.x, evt.clientY - inicio.y) > UMBRAL_GESTO_PX) return;
    const c = coordsSvg(evt);
    if (!c) return;
    if (c.x < MARGEN_LIENZO || c.x > ANCHO_LIENZO - MARGEN_LIENZO) return;
    if (c.y < MARGEN_LIENZO || c.y > ALTO_LIENZO - MARGEN_LIENZO) return;
    setPuntos((prev) => [...prev, { id: nuevoId(), x: c.x, y: c.y, cluster: -1 }]);
    setResumenImportado(null);
    // Si ya había simulación, resetear
    if (centroides.length > 0) {
      setCentroides([]);
      setAsignaciones([]);
      setIteracionActual(0);
      setConvergido(false);
      setInertia(0);
    }
  }, [modoEdicion, coordsSvg, centroides.length]);

  /**
   * Pulsar en el lienzo. En modo «Arrastrar» coge el punto MÁS CERCANO al dedo dentro de un
   * radio de captura en px de pantalla (hallazgo 2452): hasta el 29/09/2026 había que acertar
   * en el propio círculo, de 4,1 px en un móvil, y un toque a 6 px de su centro no cogía nada.
   * Una diana gruesa por punto no valdría en una nube densa, donde se la llevaría el vecino
   * dibujado encima: gana siempre el más cercano.
   */
  const onSvgPointerDown = useCallback((evt: React.PointerEvent<SVGSVGElement>) => {
    inicioPuntero.current = { x: evt.clientX, y: evt.clientY };
    if (modoEdicion !== 'arrastrar') return;
    const c = coordsSvg(evt);
    if (!c) return;
    let mejor: Punto | null = null;
    let mejorDistancia = dim.captura;
    for (const p of puntos) {
      const d = Math.hypot(p.x - c.x, p.y - c.y);
      if (d <= mejorDistancia) {
        mejorDistancia = d;
        mejor = p;
      }
    }
    if (!mejor) return;
    arrastreRef.current = { id: mejor.id, dx: mejor.x - c.x, dy: mejor.y - c.y };
    setArrastrandoId(mejor.id);
    evt.currentTarget.setPointerCapture?.(evt.pointerId);
  }, [modoEdicion, coordsSvg, dim.captura, puntos]);

  const onSvgPointerMove = useCallback((evt: React.PointerEvent<SVGSVGElement>) => {
    const arrastre = arrastreRef.current;
    if (!arrastre) return;
    const c = coordsSvg(evt);
    if (!c) return;
    const nx = Math.max(MARGEN_LIENZO, Math.min(ANCHO_LIENZO - MARGEN_LIENZO, c.x + arrastre.dx));
    const ny = Math.max(MARGEN_LIENZO, Math.min(ALTO_LIENZO - MARGEN_LIENZO, c.y + arrastre.dy));
    setPuntos((prev) => prev.map((p) => (p.id === arrastre.id ? { ...p, x: nx, y: ny } : p)));
  }, [coordsSvg]);

  const onSvgPointerUp = useCallback(() => {
    arrastreRef.current = null;
    setArrastrandoId(null);
  }, []);

  const calcularElbowHandler = useCallback(() => {
    if (puntos.length < 10) return;
    const resultados = metodoCodo(puntos, metodoInit, maxIter, zonaDe(espacio));
    setResultadoElbow(resultados);
  }, [puntos, metodoInit, maxIter, espacio]);

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
                  aria-pressed={modoEdicion === 'anadir'}
                  className={`${styles.metodoBtn} ${modoEdicion === 'anadir' ? styles.metodoActive : ''}`}
                  onClick={() => setModoEdicion('anadir')}
                >
                  Añadir (clic)
                </button>
                <button
                  type="button"
                  aria-pressed={modoEdicion === 'arrastrar'}
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

        {/* Datos propios */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Tus propios datos</h2>
          <p className={styles.datosAyuda}>
            Pega dos columnas de números —o carga un archivo— y el simulador agrupa tus datos en
            lugar de los de ejemplo. Sirve el tabulador de una hoja de cálculo, el punto y coma, el
            espacio o la coma, y los decimales pueden ir con coma (12,5) o con punto (12.5); si
            separas las columnas con comas, los decimales tienen que ir con punto. Si la primera
            fila es una cabecera, se usa para nombrar los ejes. Todo el proceso ocurre en tu
            navegador: los datos no se envían a ningún servidor.
          </p>

          <label className={styles.datosLabel} htmlFor="datosPropios">
            Dos columnas: la primera es el eje X y la segunda el eje Y
          </label>
          <textarea
            id="datosPropios"
            className={styles.datosTextarea}
            rows={7}
            spellCheck={false}
            value={textoDatos}
            onChange={(e) => setTextoDatos(e.target.value)}
            placeholder={'edad;ingresos\n24;18500\n27;21000\n44;52000'}
          />

          <div className={styles.datosAcciones}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => importarTexto(textoDatos)}
            >
              Agrupar mis datos
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => {
                setTextoDatos(EJEMPLO_DATOS);
                importarTexto(EJEMPLO_DATOS);
              }}
            >
              Rellenar con un ejemplo
            </button>
            <span className={styles.datosFichero}>
              <label htmlFor="ficheroDatos">Cargar archivo (CSV o texto):</label>
              <input
                id="ficheroDatos"
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/plain"
                onChange={cargarFichero}
              />
            </span>
          </div>

          {errorImportacion && (
            <p className={styles.datosError} role="alert">
              <span aria-hidden="true">⚠️</span> {errorImportacion}
            </p>
          )}

          {resumenImportado && (
            <div className={styles.datosResumen} role="status" aria-live="polite">
              <strong>{formatNumber(resumenImportado.n, 0)} puntos importados.</strong>{' '}
              Eje X: {resumenImportado.nombres.x} (de {formatoValor(resumenImportado.rangoX.min)} a{' '}
              {formatoValor(resumenImportado.rangoX.max)}) · Eje Y: {resumenImportado.nombres.y} (de{' '}
              {formatoValor(resumenImportado.rangoY.min)} a {formatoValor(resumenImportado.rangoY.max)}).
              {resumenImportado.filasIgnoradas === 1 && (
                <> Se ha descartado 1 fila que no contenía dos números.</>
              )}
              {resumenImportado.filasIgnoradas > 1 && (
                <> Se han descartado {formatNumber(resumenImportado.filasIgnoradas, 0)} filas que no
                  contenían dos números.</>
              )}
              {resumenImportado.recortadoA !== null && (
                <> Solo se han conservado los primeros{' '}
                  {formatNumber(resumenImportado.recortadoA, 0)} puntos.</>
              )}
              {resumenImportado.aviso && (
                <> <strong>Revisa la lectura:</strong> {resumenImportado.aviso}</>
              )}
            </div>
          )}

          <p className={styles.datosNota}>
            Antes de agrupar, cada columna se <strong>normaliza</strong> de 0 (su mínimo) a 1 (su
            máximo), y las dos se dibujan con la misma escala, en un cuadrado: sin ese paso, la
            variable con los números más grandes (un salario frente a una edad) dominaría la
            distancia euclídea y el agrupamiento la obedecería casi solo a ella. Así las dos pesan
            igual, da lo mismo cuál pegues primero, y el centroide más cercano que ves es el que
            usa el algoritmo. Los centroides se dan después en las unidades de tus columnas, y la
            inercia, en las unidades normalizadas. Dos avisos: un número con exactamente tres cifras tras un punto se lee como millar español
            (<code>1.234</code> es mil doscientos treinta y cuatro; escribe <code>1,234</code> si
            querías decimales), y el máximo son{' '}
            {formatNumber(MAX_PUNTOS_IMPORTADOS, 0)} puntos.
          </p>
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
                  aria-pressed={metodoInit === 'aleatorio'}
                  className={`${styles.metodoBtn} ${metodoInit === 'aleatorio' ? styles.metodoActive : ''}`}
                  onClick={() => setMetodoInit('aleatorio')}
                >
                  Aleatorio
                </button>
                <button
                  type="button"
                  aria-pressed={metodoInit === 'kmeans++'}
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

          {kDesincronizado && (
            <p className={styles.avisoDesincronizado} role="status">
              <span aria-hidden="true">🔄</span> Has cambiado K a {k}, pero lo que se ve en
              pantalla sigue agrupado en {centroides.length}{' '}
              {centroides.length === 1 ? 'cluster' : 'clusters'}. Pulsa «Inicializar centroides»
              para agrupar de nuevo con K={k}.
            </p>
          )}

          <div className={styles.tableActions}>
            <button
              type="button"
              className={styles.calcBtn}
              onClick={inicializarSimulacion}
              disabled={puntos.length < k}
              title={puntos.length < k ? `Con K = ${k} hacen falta al menos ${k} puntos` : undefined}
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
                title={puntos.length < k ? `Con K = ${k} hacen falta al menos ${k} puntos` : undefined}
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
            onPointerDown={onSvgPointerDown}
            onPointerMove={onSvgPointerMove}
            onPointerUp={onSvgPointerUp}
            onPointerCancel={onSvgPointerUp}
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
                r={dim.radio}
                className={styles.puntoCircle}
                fill={colorCluster(p.cluster)}
                style={{
                  cursor: modoEdicion === 'arrastrar'
                    ? (arrastrandoId === p.id ? 'grabbing' : 'grab')
                    : 'crosshair',
                }}
              />
            ))}

            {/* Centroides (cuadrados grandes) */}
            {centroides.map((c, j) => {
              const medio = dim.lado / 2;
              const brazo = dim.lado / 3;
              return (
                <g key={`c-${j}`} pointerEvents="none">
                  <rect
                    x={c.x - medio}
                    y={c.y - medio}
                    width={dim.lado}
                    height={dim.lado}
                    className={styles.centroideMarker}
                    fill={colorCluster(j)}
                  />
                  <line
                    x1={c.x - brazo}
                    y1={c.y}
                    x2={c.x + brazo}
                    y2={c.y}
                    stroke="white"
                    strokeWidth={2}
                  />
                  <line
                    x1={c.x}
                    y1={c.y - brazo}
                    x2={c.x}
                    y2={c.y + brazo}
                    stroke="white"
                    strokeWidth={2}
                  />
                </g>
              );
            })}
          </svg>
          {/*
            Hallazgo 2453: con menos puntos que K los botones se apagaban sin decir por qué. El
            aviso va aquí, DEBAJO del lienzo, y no en el panel de parámetros: allí aparecía y
            desaparecía mientras se añadían puntos y movía el lienzo bajo el dedo.
          */}
          <p className={styles.lienzoNota} role="status">
            {puntos.length} {puntos.length === 1 ? 'punto' : 'puntos'} en el lienzo
            {puntos.length < k && (
              <>
                {' '}· <strong>Con K = {k} hacen falta al menos {k} puntos</strong> para agrupar:
                añade más con un clic en el lienzo o baja K.
              </>
            )}
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
            <span className={styles.metricLabel}>Inercia (SSE)</span>
            <div className={styles.metricValue}>
              {centroides.length > 0 ? formatoInercia(inertia, espacio) : '—'}
              {centroides.length > 0 && espacio.tipo === 'lienzo' && (
                <span className={styles.metricUnit}>px²</span>
              )}
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Estado</span>
            <div className={styles.metricValue}>
              {/* «En progreso» no valía para una ejecución parada en el tope sin converger */}
              {centroides.length === 0
                ? 'Sin iniciar'
                : convergido
                  ? '✓ Convergido'
                  : ejecutandoAuto
                    ? 'Ejecutando…'
                    : iteracionActual >= maxIter
                      ? 'Tope sin converger'
                      : 'En progreso'}
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Puntos / clusters</span>
            <div className={styles.metricValue}>
              {puntos.length}
              {/* Los clusters que hay son los dibujados, no los que pida el deslizador */}
              <span className={styles.metricUnit}>
                / K={centroides.length > 0 ? centroides.length : k}
              </span>
            </div>
          </div>
        </div>

        {/* Tamaños de cada cluster */}
        {centroides.length > 0 && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Tamaños de cada cluster</h2>
            <p className={styles.codoDesc}>
              {espacio.tipo === 'datos' ? (
                <>
                  Centroides en las unidades de tus columnas: (X = {espacio.nombres.x}; Y ={' '}
                  {espacio.nombres.y}). La inercia va en unidades normalizadas, con cada columna
                  de 0 (su mínimo) a 1 (su máximo), que es donde agrupa el algoritmo.
                </>
              ) : (
                <>
                  Centroides en píxeles del lienzo, con el origen abajo a la izquierda (x; y).
                  Los datos sintéticos no tienen otras unidades.
                </>
              )}
            </p>
            <div className={styles.clustersGrid}>
              {clusters.map(({ centroide, tam }, j) => (
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
                    centroide {coordenadasCentroide(centroide, espacio)}
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
            {puntos.length < 10 && (
              <p className={styles.codoDesc} role="status">
                La curva prueba hasta K = 10 y necesita al menos 10 puntos; ahora hay{' '}
                {puntos.length}.
              </p>
            )}
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
                  Inercia
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
                      <title>K={r.k}, inercia={formatoInercia(r.inertia, espacio)}</title>
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
                <td>Inercia (suma de distancias² intra-cluster)</td>
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
              Cada píxel se reasigna al centroide (color) más cercano. Es una de las técnicas para construir paletas reducidas, como la de 256 colores como máximo que admite el formato GIF; el formato no fija el método, y también se usan <em>median cut</em> u octree.
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
              No hay respuesta única. Las técnicas más usadas son: <strong>método del codo</strong> (graficar la inercia frente a K y buscar el &laquo;codo&raquo;), <strong>coeficiente de silueta</strong> (mide qué tan bien encajan los puntos en su cluster), y <strong>conocimiento del dominio</strong> (si sabes que hay 5 segmentos de clientes, prueba K=5).
            </p>
            <p className={styles.faqTip}>Pulsa &laquo;Calcular curva del codo&raquo; en este simulador para ver el método aplicado a tus puntos.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué k-means++ es mejor que la inicialización aleatoria?</h4>
            <p>
              La inicialización aleatoria puede colocar dos centroides muy cerca, haciendo que k-means converja a un mínimo local malo. k-means++ elige los centroides iniciales separados entre sí (probabilidad proporcional a d² al centroide más cercano), lo que reduce el riesgo y suele dar mejor inercia final.
            </p>
            <p className={styles.faqTip}>Carga &laquo;3 gaussianas separadas&raquo;, ejecuta varias veces con cada inicialización y compara la inercia final.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿K-means siempre converge?</h4>
            <p>
              Sí, k-means siempre converge en un número finito de iteraciones porque la inercia disminuye en cada paso (o se mantiene). Pero <strong>no garantiza el óptimo global</strong>: puede quedarse atrapado en un mínimo local. Por eso se ejecuta varias veces con distintas semillas y se elige la solución de menor inercia.
            </p>
            <p className={styles.faqTip}>En scikit-learn el parámetro <code>n_init</code> controla cuántas inicializaciones distintas se prueban. Desde la versión 1.4 vale <code>&apos;auto&apos;</code> por defecto: una sola ejecución con <code>init=&apos;k-means++&apos;</code> (la inicialización por defecto) y 10 con <code>init=&apos;random&apos;</code>. Para quedarte con la mejor de varias con k-means++, súbelo a mano.</p>
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
                Ejecuta k-means para K = 2 a 10 y grafica la inercia frente a K. El &laquo;codo&raquo; (donde la pendiente cambia bruscamente) sugiere un buen K. Como complemento, calcula el coeficiente de silueta y elige el K con mayor silueta media.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Ejecuta k-means con varias semillas</strong>
              <p>
                Usa k-means++ y <code>n_init = 10</code> (o más) para evitar mínimos locales. Quédate con la solución de menor inercia. Establece <code>random_state</code> para reproducibilidad.
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
            <p>Es el default en scikit-learn. Casi siempre da mejor inercia final que la inicialización aleatoria, con coste computacional ligero.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔁</span>
            <strong>Ejecuta múltiples veces</strong>
            <p>Sube <code>n_init</code> a 10-50 para datos importantes. Quédate con la mejor solución (menor inercia). El tiempo extra suele compensar.</p>
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
