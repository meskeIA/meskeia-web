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
import styles from './SimuladorGrafos.module.css';

type Algoritmo = 'bfs' | 'dfs' | 'dijkstra' | 'astar';
type ModoEditor = 'add-node' | 'add-edge' | 'move' | 'delete';
type EstadoNodo =
  | 'no-visitado'
  | 'en-frontera'
  | 'actual'
  | 'visitado'
  | 'origen'
  | 'destino'
  | 'camino';

interface Nodo {
  id: string;
  x: number;
  y: number;
}

interface Arista {
  id: string;
  from: string;
  to: string;
  peso: number;
}

interface PasoGrafo {
  estados: Record<string, EstadoNodo>;
  auxiliar: string[];
  tablaDijkstra?: Record<string, { dist: number; pred: string | null }>;
  tablaAstar?: Record<string, { g: number; h: number; f: number; pred: string | null }>;
  nodoActual: string | null;
  descripcion: string;
  aristasResaltadas: string[]; // ids de aristas
}

interface Resultado {
  pasos: PasoGrafo[];
  caminoEncontrado: string[]; // lista de ids de nodos
  aristasCamino: string[]; // ids de aristas
  costeTotal: number;
  nodosVisitados: number;
  aristasExploradas: number;
  complejidad: string;
}

const COLOR_NO_VISITADO = '#94a3b8';
const COLOR_EN_FRONTERA = '#f59e0b';
const COLOR_ACTUAL = '#fb923c';
const COLOR_VISITADO = '#60a5fa';
const COLOR_ORIGEN = '#16a34a';
const COLOR_DESTINO = '#dc2626';
const COLOR_CAMINO = '#10b981';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;
const RADIO_NODO = 22;

function colorDeEstado(estado: EstadoNodo): string {
  switch (estado) {
    case 'origen':
      return COLOR_ORIGEN;
    case 'destino':
      return COLOR_DESTINO;
    case 'actual':
      return COLOR_ACTUAL;
    case 'en-frontera':
      return COLOR_EN_FRONTERA;
    case 'visitado':
      return COLOR_VISITADO;
    case 'camino':
      return COLOR_CAMINO;
    default:
      return COLOR_NO_VISITADO;
  }
}

// Genera siguiente etiqueta secuencial: A, B, ..., Z, A1, B1, ...
function siguienteEtiqueta(existentes: Set<string>): string {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let suf = 0; suf < 100; suf++) {
    for (const l of letras) {
      const cand = suf === 0 ? l : `${l}${suf}`;
      if (!existentes.has(cand)) return cand;
    }
  }
  return `N${existentes.size + 1}`;
}

function aristaId(from: string, to: string): string {
  return `${from}__${to}`;
}

function clavesAristasParaCamino(camino: string[], aristas: Arista[], dirigido: boolean): string[] {
  const ids: string[] = [];
  for (let i = 0; i < camino.length - 1; i++) {
    const a = camino[i];
    const b = camino[i + 1];
    const arista = aristas.find(
      (ar) => (ar.from === a && ar.to === b) || (!dirigido && ar.from === b && ar.to === a),
    );
    if (arista) ids.push(arista.id);
  }
  return ids;
}

// Vecinos según dirigido o no
function obtenerVecinos(
  nodoId: string,
  aristas: Arista[],
  dirigido: boolean,
): Array<{ vecino: string; peso: number; aristaId: string }> {
  const resultado: Array<{ vecino: string; peso: number; aristaId: string }> = [];
  for (const a of aristas) {
    if (a.from === nodoId) {
      resultado.push({ vecino: a.to, peso: a.peso, aristaId: a.id });
    } else if (!dirigido && a.to === nodoId) {
      resultado.push({ vecino: a.from, peso: a.peso, aristaId: a.id });
    }
  }
  return resultado;
}

// Reconstruye camino desde tabla de predecesores
function reconstruirCamino(pred: Record<string, string | null>, destino: string): string[] {
  const camino: string[] = [];
  let actual: string | null = destino;
  while (actual !== null) {
    camino.unshift(actual);
    const p: string | null = pred[actual] ?? null;
    if (p === actual) break;
    actual = p;
  }
  return camino;
}

// ============== ALGORITMOS ==============

function ejecutarBFS(
  nodos: Nodo[],
  aristas: Arista[],
  origen: string,
  destino: string,
  dirigido: boolean,
): Resultado {
  const pasos: PasoGrafo[] = [];
  const visitados = new Set<string>();
  const enCola = new Set<string>();
  const cola: string[] = [origen];
  const pred: Record<string, string | null> = { [origen]: null };
  enCola.add(origen);
  let aristasExploradas = 0;
  let encontrado = false;

  const construirEstados = (actual: string | null): Record<string, EstadoNodo> => {
    const estados: Record<string, EstadoNodo> = {};
    for (const n of nodos) {
      if (n.id === origen) estados[n.id] = 'origen';
      else if (n.id === destino) estados[n.id] = 'destino';
      else if (n.id === actual) estados[n.id] = 'actual';
      else if (visitados.has(n.id)) estados[n.id] = 'visitado';
      else if (enCola.has(n.id)) estados[n.id] = 'en-frontera';
      else estados[n.id] = 'no-visitado';
    }
    return estados;
  };

  pasos.push({
    estados: construirEstados(null),
    auxiliar: [...cola],
    nodoActual: null,
    descripcion: `Inicio: encolamos el nodo origen ${origen}.`,
    aristasResaltadas: [],
  });

  while (cola.length > 0) {
    const actual = cola.shift() as string;
    enCola.delete(actual);
    visitados.add(actual);

    pasos.push({
      estados: construirEstados(actual),
      auxiliar: [...cola],
      nodoActual: actual,
      descripcion: `Desencolamos ${actual} y lo marcamos como visitado.`,
      aristasResaltadas: [],
    });

    if (actual === destino) {
      encontrado = true;
      break;
    }

    const vecinos = obtenerVecinos(actual, aristas, dirigido);
    for (const v of vecinos) {
      aristasExploradas++;
      if (!visitados.has(v.vecino) && !enCola.has(v.vecino)) {
        pred[v.vecino] = actual;
        cola.push(v.vecino);
        enCola.add(v.vecino);
      }
    }

    pasos.push({
      estados: construirEstados(actual),
      auxiliar: [...cola],
      nodoActual: actual,
      descripcion: `Encolamos los vecinos no visitados de ${actual}: ${
        vecinos
          .filter((v) => pred[v.vecino] === actual)
          .map((v) => v.vecino)
          .join(', ') || '(ninguno nuevo)'
      }.`,
      aristasResaltadas: vecinos.filter((v) => pred[v.vecino] === actual).map((v) => v.aristaId),
    });
  }

  let camino: string[] = [];
  let aristasCamino: string[] = [];
  let costeTotal = 0;
  if (encontrado) {
    camino = reconstruirCamino(pred, destino);
    aristasCamino = clavesAristasParaCamino(camino, aristas, dirigido);
    costeTotal = camino.length - 1;
    pasos.push({
      estados: (() => {
        const e = construirEstados(null);
        for (const id of camino) {
          if (id !== origen && id !== destino) e[id] = 'camino';
        }
        return e;
      })(),
      auxiliar: [],
      nodoActual: null,
      descripcion: `Camino encontrado: ${camino.join(' → ')} (${camino.length - 1} aristas).`,
      aristasResaltadas: aristasCamino,
    });
  } else {
    pasos.push({
      estados: construirEstados(null),
      auxiliar: [],
      nodoActual: null,
      descripcion: `No existe camino de ${origen} a ${destino}.`,
      aristasResaltadas: [],
    });
  }

  return {
    pasos,
    caminoEncontrado: camino,
    aristasCamino,
    costeTotal,
    nodosVisitados: visitados.size,
    aristasExploradas,
    complejidad: 'O(V + E)',
  };
}

function ejecutarDFS(
  nodos: Nodo[],
  aristas: Arista[],
  origen: string,
  destino: string,
  dirigido: boolean,
): Resultado {
  const pasos: PasoGrafo[] = [];
  const visitados = new Set<string>();
  const enPila = new Set<string>();
  const pila: string[] = [origen];
  const pred: Record<string, string | null> = { [origen]: null };
  enPila.add(origen);
  let aristasExploradas = 0;
  let encontrado = false;

  const construirEstados = (actual: string | null): Record<string, EstadoNodo> => {
    const estados: Record<string, EstadoNodo> = {};
    for (const n of nodos) {
      if (n.id === origen) estados[n.id] = 'origen';
      else if (n.id === destino) estados[n.id] = 'destino';
      else if (n.id === actual) estados[n.id] = 'actual';
      else if (visitados.has(n.id)) estados[n.id] = 'visitado';
      else if (enPila.has(n.id)) estados[n.id] = 'en-frontera';
      else estados[n.id] = 'no-visitado';
    }
    return estados;
  };

  pasos.push({
    estados: construirEstados(null),
    auxiliar: [...pila],
    nodoActual: null,
    descripcion: `Inicio: apilamos el nodo origen ${origen}.`,
    aristasResaltadas: [],
  });

  while (pila.length > 0) {
    const actual = pila.pop() as string;
    enPila.delete(actual);
    if (visitados.has(actual)) continue;
    visitados.add(actual);

    pasos.push({
      estados: construirEstados(actual),
      auxiliar: [...pila],
      nodoActual: actual,
      descripcion: `Desapilamos ${actual} y lo visitamos.`,
      aristasResaltadas: [],
    });

    if (actual === destino) {
      encontrado = true;
      break;
    }

    const vecinos = obtenerVecinos(actual, aristas, dirigido);
    const nuevos: string[] = [];
    for (const v of vecinos) {
      aristasExploradas++;
      if (!visitados.has(v.vecino) && !enPila.has(v.vecino)) {
        pred[v.vecino] = actual;
        pila.push(v.vecino);
        enPila.add(v.vecino);
        nuevos.push(v.vecino);
      }
    }

    pasos.push({
      estados: construirEstados(actual),
      auxiliar: [...pila],
      nodoActual: actual,
      descripcion: `Apilamos los vecinos no visitados de ${actual}: ${
        nuevos.join(', ') || '(ninguno nuevo)'
      }.`,
      aristasResaltadas: vecinos.filter((v) => nuevos.includes(v.vecino)).map((v) => v.aristaId),
    });
  }

  let camino: string[] = [];
  let aristasCamino: string[] = [];
  let costeTotal = 0;
  if (encontrado) {
    camino = reconstruirCamino(pred, destino);
    aristasCamino = clavesAristasParaCamino(camino, aristas, dirigido);
    costeTotal = camino.length - 1;
    pasos.push({
      estados: (() => {
        const e = construirEstados(null);
        for (const id of camino) {
          if (id !== origen && id !== destino) e[id] = 'camino';
        }
        return e;
      })(),
      auxiliar: [],
      nodoActual: null,
      descripcion: `Camino encontrado (no necesariamente óptimo): ${camino.join(' → ')}.`,
      aristasResaltadas: aristasCamino,
    });
  } else {
    pasos.push({
      estados: construirEstados(null),
      auxiliar: [],
      nodoActual: null,
      descripcion: `No existe camino de ${origen} a ${destino}.`,
      aristasResaltadas: [],
    });
  }

  return {
    pasos,
    caminoEncontrado: camino,
    aristasCamino,
    costeTotal,
    nodosVisitados: visitados.size,
    aristasExploradas,
    complejidad: 'O(V + E)',
  };
}

function ejecutarDijkstra(
  nodos: Nodo[],
  aristas: Arista[],
  origen: string,
  destino: string,
  dirigido: boolean,
): Resultado {
  const pasos: PasoGrafo[] = [];
  const dist: Record<string, number> = {};
  const pred: Record<string, string | null> = {};
  const visitados = new Set<string>();
  const aristasResaltadasAcum = new Set<string>();
  let aristasExploradas = 0;

  for (const n of nodos) {
    dist[n.id] = n.id === origen ? 0 : Infinity;
    pred[n.id] = null;
  }

  const construirEstados = (actual: string | null): Record<string, EstadoNodo> => {
    const estados: Record<string, EstadoNodo> = {};
    for (const n of nodos) {
      if (n.id === origen) estados[n.id] = 'origen';
      else if (n.id === destino) estados[n.id] = 'destino';
      else if (n.id === actual) estados[n.id] = 'actual';
      else if (visitados.has(n.id)) estados[n.id] = 'visitado';
      else if (Number.isFinite(dist[n.id])) estados[n.id] = 'en-frontera';
      else estados[n.id] = 'no-visitado';
    }
    return estados;
  };

  const tablaDeDist = (): Record<string, { dist: number; pred: string | null }> => {
    const t: Record<string, { dist: number; pred: string | null }> = {};
    for (const n of nodos) t[n.id] = { dist: dist[n.id], pred: pred[n.id] };
    return t;
  };

  pasos.push({
    estados: construirEstados(null),
    auxiliar: [origen],
    tablaDijkstra: tablaDeDist(),
    nodoActual: null,
    descripcion: `Inicio: dist[${origen}] = 0, resto = ∞.`,
    aristasResaltadas: [],
  });

  let encontrado = false;

  while (true) {
    // Extraer nodo no visitado con menor dist
    let actual: string | null = null;
    let mejorDist = Infinity;
    for (const n of nodos) {
      if (!visitados.has(n.id) && dist[n.id] < mejorDist) {
        mejorDist = dist[n.id];
        actual = n.id;
      }
    }
    if (actual === null || mejorDist === Infinity) break;
    visitados.add(actual);

    pasos.push({
      estados: construirEstados(actual),
      auxiliar: nodos
        .filter((n) => !visitados.has(n.id) && Number.isFinite(dist[n.id]))
        .sort((a, b) => dist[a.id] - dist[b.id])
        .map((n) => `${n.id}(${dist[n.id]})`),
      tablaDijkstra: tablaDeDist(),
      nodoActual: actual,
      descripcion: `Extraemos ${actual} con dist = ${dist[actual]} (mínima en la cola).`,
      aristasResaltadas: Array.from(aristasResaltadasAcum),
    });

    if (actual === destino) {
      encontrado = true;
      break;
    }

    const vecinos = obtenerVecinos(actual, aristas, dirigido);
    const relajados: string[] = [];
    for (const v of vecinos) {
      aristasExploradas++;
      if (visitados.has(v.vecino)) continue;
      const nuevo = dist[actual] + v.peso;
      if (nuevo < dist[v.vecino]) {
        dist[v.vecino] = nuevo;
        pred[v.vecino] = actual;
        aristasResaltadasAcum.add(v.aristaId);
        relajados.push(`${v.vecino}=${nuevo}`);
      }
    }

    pasos.push({
      estados: construirEstados(actual),
      auxiliar: nodos
        .filter((n) => !visitados.has(n.id) && Number.isFinite(dist[n.id]))
        .sort((a, b) => dist[a.id] - dist[b.id])
        .map((n) => `${n.id}(${dist[n.id]})`),
      tablaDijkstra: tablaDeDist(),
      nodoActual: actual,
      descripcion: `Relajamos aristas de ${actual}: ${relajados.join(', ') || '(sin mejoras)'}.`,
      aristasResaltadas: Array.from(aristasResaltadasAcum),
    });
  }

  let camino: string[] = [];
  let aristasCamino: string[] = [];
  let costeTotal = 0;
  if (encontrado) {
    camino = reconstruirCamino(pred, destino);
    aristasCamino = clavesAristasParaCamino(camino, aristas, dirigido);
    costeTotal = dist[destino];
    pasos.push({
      estados: (() => {
        const e = construirEstados(null);
        for (const id of camino) {
          if (id !== origen && id !== destino) e[id] = 'camino';
        }
        return e;
      })(),
      auxiliar: [],
      tablaDijkstra: tablaDeDist(),
      nodoActual: null,
      descripcion: `Camino más corto: ${camino.join(' → ')} con coste ${costeTotal}.`,
      aristasResaltadas: aristasCamino,
    });
  } else {
    pasos.push({
      estados: construirEstados(null),
      auxiliar: [],
      tablaDijkstra: tablaDeDist(),
      nodoActual: null,
      descripcion: `No existe camino de ${origen} a ${destino}.`,
      aristasResaltadas: [],
    });
  }

  return {
    pasos,
    caminoEncontrado: camino,
    aristasCamino,
    costeTotal,
    nodosVisitados: visitados.size,
    aristasExploradas,
    complejidad: 'O((V + E) log V)',
  };
}

function distanciaEuclidea(a: Nodo, b: Nodo): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Coste mínimo por píxel del grafo: el menor cociente peso/longitud de sus aristas.
 *
 * A* solo garantiza el camino óptimo si su heurística es ADMISIBLE, es decir, si nunca
 * sobreestima lo que falta. Hasta el 26/08/2026 esta app usaba h(n) = distancia en píxeles
 * dividida entre diez, y los pesos los pone el usuario con un deslizador de 1 a 99 sin
 * ninguna relación con la geometría del dibujo: en el preset «Grafo denso», los 8 nodos
 * caben en un círculo de 180 px, así que h valía entre 14 y 36 cuando el camino óptimo
 * COMPLETO costaba 10. La heurística sobreestimaba por un factor de tres y A* degeneraba en
 * búsqueda voraz, devolviendo coste 11 donde su propio Dijkstra —en la misma pantalla—
 * devolvía 10. Que la culpa era de la heurística y no del grafo se demostraba arrastrando un
 * nodo sin tocar un solo peso: A* cambiaba de respuesta.
 *
 * Calibrar con `k` lo arregla sin renunciar a informar la búsqueda: si ninguna arista cuesta
 * menos de k por píxel, entonces ningún camino de n al destino puede costar menos de k veces
 * la distancia en línea recta, que es la definición de heurística admisible.
 */
function costeMinimoPorPixel(nodos: Nodo[], aristas: Arista[]): number {
  const nodoMap: Record<string, Nodo> = {};
  for (const n of nodos) nodoMap[n.id] = n;

  let k = Infinity;
  for (const a of aristas) {
    const desde = nodoMap[a.from];
    const hasta = nodoMap[a.to];
    if (!desde || !hasta) continue;
    const longitud = distanciaEuclidea(desde, hasta);
    // Dos nodos superpuestos darían k = 0: la heurística se vuelve trivial pero sigue
    // siendo admisible, que es lo único que se le exige.
    if (longitud <= 0) return 0;
    k = Math.min(k, a.peso / longitud);
  }
  return Number.isFinite(k) ? k : 0;
}

function ejecutarAStar(
  nodos: Nodo[],
  aristas: Arista[],
  origen: string,
  destino: string,
  dirigido: boolean,
): Resultado {
  const pasos: PasoGrafo[] = [];
  const nodoMap: Record<string, Nodo> = {};
  for (const n of nodos) nodoMap[n.id] = n;
  const dest = nodoMap[destino];

  const g: Record<string, number> = {};
  const h: Record<string, number> = {};
  const f: Record<string, number> = {};
  const pred: Record<string, string | null> = {};

  // Heurística calibrada con el propio grafo, para que sea ADMISIBLE y A* devuelva el
  // camino óptimo. Se redondea hacia abajo a dos decimales: redondear al alza podría
  // hacerla sobreestimar por unas centésimas y romper justo la propiedad que se busca.
  const k = costeMinimoPorPixel(nodos, aristas);
  for (const n of nodos) {
    g[n.id] = n.id === origen ? 0 : Infinity;
    h[n.id] = Math.floor(k * distanciaEuclidea(n, dest) * 100) / 100;
    f[n.id] = n.id === origen ? h[n.id] : Infinity;
    pred[n.id] = null;
  }

  const cerrado = new Set<string>();
  const abierto = new Set<string>([origen]);
  const aristasResaltadasAcum = new Set<string>();
  let aristasExploradas = 0;

  const construirEstados = (actual: string | null): Record<string, EstadoNodo> => {
    const estados: Record<string, EstadoNodo> = {};
    for (const n of nodos) {
      if (n.id === origen) estados[n.id] = 'origen';
      else if (n.id === destino) estados[n.id] = 'destino';
      else if (n.id === actual) estados[n.id] = 'actual';
      else if (cerrado.has(n.id)) estados[n.id] = 'visitado';
      else if (abierto.has(n.id)) estados[n.id] = 'en-frontera';
      else estados[n.id] = 'no-visitado';
    }
    return estados;
  };

  const tablaA = (): Record<string, { g: number; h: number; f: number; pred: string | null }> => {
    const t: Record<string, { g: number; h: number; f: number; pred: string | null }> = {};
    for (const n of nodos) t[n.id] = { g: g[n.id], h: h[n.id], f: f[n.id], pred: pred[n.id] };
    return t;
  };

  pasos.push({
    estados: construirEstados(null),
    auxiliar: [`${origen}(f=${f[origen]})`],
    tablaAstar: tablaA(),
    nodoActual: null,
    descripcion: `Inicio: g[${origen}] = 0, h[${origen}] = ${h[origen]}, f = ${f[origen]}.`,
    aristasResaltadas: [],
  });

  let encontrado = false;
  while (abierto.size > 0) {
    let actual: string | null = null;
    let mejorF = Infinity;
    for (const id of abierto) {
      if (f[id] < mejorF) {
        mejorF = f[id];
        actual = id;
      }
    }
    if (actual === null) break;
    abierto.delete(actual);
    cerrado.add(actual);

    pasos.push({
      estados: construirEstados(actual),
      auxiliar: Array.from(abierto)
        .sort((a, b) => f[a] - f[b])
        .map((id) => `${id}(f=${f[id]})`),
      tablaAstar: tablaA(),
      nodoActual: actual,
      descripcion: `Extraemos ${actual} con f = ${mejorF} (menor en abierto).`,
      aristasResaltadas: Array.from(aristasResaltadasAcum),
    });

    if (actual === destino) {
      encontrado = true;
      break;
    }

    const vecinos = obtenerVecinos(actual, aristas, dirigido);
    const mejoras: string[] = [];
    for (const v of vecinos) {
      aristasExploradas++;
      if (cerrado.has(v.vecino)) continue;
      const tentativaG = g[actual] + v.peso;
      if (tentativaG < g[v.vecino]) {
        g[v.vecino] = tentativaG;
        f[v.vecino] = tentativaG + h[v.vecino];
        pred[v.vecino] = actual;
        abierto.add(v.vecino);
        aristasResaltadasAcum.add(v.aristaId);
        mejoras.push(`${v.vecino}(g=${tentativaG}, f=${f[v.vecino]})`);
      }
    }

    pasos.push({
      estados: construirEstados(actual),
      auxiliar: Array.from(abierto)
        .sort((a, b) => f[a] - f[b])
        .map((id) => `${id}(f=${f[id]})`),
      tablaAstar: tablaA(),
      nodoActual: actual,
      descripcion: `Expandimos vecinos: ${mejoras.join(', ') || '(sin mejoras)'}.`,
      aristasResaltadas: Array.from(aristasResaltadasAcum),
    });
  }

  let camino: string[] = [];
  let aristasCamino: string[] = [];
  let costeTotal = 0;
  if (encontrado) {
    camino = reconstruirCamino(pred, destino);
    aristasCamino = clavesAristasParaCamino(camino, aristas, dirigido);
    costeTotal = g[destino];
    pasos.push({
      estados: (() => {
        const e = construirEstados(null);
        for (const id of camino) {
          if (id !== origen && id !== destino) e[id] = 'camino';
        }
        return e;
      })(),
      auxiliar: [],
      tablaAstar: tablaA(),
      nodoActual: null,
      descripcion: `Camino A* encontrado: ${camino.join(' → ')} con coste ${costeTotal}.`,
      aristasResaltadas: aristasCamino,
    });
  } else {
    pasos.push({
      estados: construirEstados(null),
      auxiliar: [],
      tablaAstar: tablaA(),
      nodoActual: null,
      descripcion: `No existe camino de ${origen} a ${destino}.`,
      aristasResaltadas: [],
    });
  }

  return {
    pasos,
    caminoEncontrado: camino,
    aristasCamino,
    costeTotal,
    nodosVisitados: cerrado.size,
    aristasExploradas,
    complejidad: 'O((V + E) log V)',
  };
}

// ============== PRESETS ==============

interface Preset {
  nodos: Nodo[];
  aristas: Arista[];
  dirigido: boolean;
  origen: string;
  destino: string;
}

function presetGrid5x5(): Preset {
  const nodos: Nodo[] = [];
  const aristas: Arista[] = [];
  const cols = 5;
  const rows = 5;
  const margenX = 80;
  const margenY = 60;
  const dx = (SVG_WIDTH - 2 * margenX) / (cols - 1);
  const dy = (SVG_HEIGHT - 2 * margenY) / (rows - 1);
  const ids: string[][] = [];
  let etiquetaIdx = 0;
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXY';
  for (let r = 0; r < rows; r++) {
    const fila: string[] = [];
    for (let c = 0; c < cols; c++) {
      const id = letras[etiquetaIdx++];
      nodos.push({ id, x: margenX + c * dx, y: margenY + r * dy });
      fila.push(id);
    }
    ids.push(fila);
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1) {
        aristas.push({
          id: aristaId(ids[r][c], ids[r][c + 1]),
          from: ids[r][c],
          to: ids[r][c + 1],
          peso: 1,
        });
      }
      if (r < rows - 1) {
        aristas.push({
          id: aristaId(ids[r][c], ids[r + 1][c]),
          from: ids[r][c],
          to: ids[r + 1][c],
          peso: 1,
        });
      }
    }
  }
  return { nodos, aristas, dirigido: false, origen: 'A', destino: 'Y' };
}

function presetArbolBinario(): Preset {
  const nodos: Nodo[] = [];
  const aristas: Arista[] = [];
  const niveles = 3;
  const margenY = 70;
  const dy = (SVG_HEIGHT - 2 * margenY) / niveles;
  const letras = 'ABCDEFGHIJKLMNO';
  let idx = 0;
  for (let nivel = 0; nivel <= niveles; nivel++) {
    const cantidad = Math.pow(2, nivel);
    const dx = SVG_WIDTH / (cantidad + 1);
    for (let i = 0; i < cantidad; i++) {
      nodos.push({
        id: letras[idx++],
        x: dx * (i + 1),
        y: margenY + nivel * dy,
      });
    }
  }
  // conectar padre→hijos
  let padreIdx = 0;
  for (let nivel = 0; nivel < niveles; nivel++) {
    const cantidadPadres = Math.pow(2, nivel);
    for (let i = 0; i < cantidadPadres; i++) {
      const padre = nodos[padreIdx];
      const izq = nodos[2 * padreIdx + 1];
      const der = nodos[2 * padreIdx + 2];
      if (izq) aristas.push({ id: aristaId(padre.id, izq.id), from: padre.id, to: izq.id, peso: 1 });
      if (der) aristas.push({ id: aristaId(padre.id, der.id), from: padre.id, to: der.id, peso: 1 });
      padreIdx++;
    }
  }
  return { nodos, aristas, dirigido: false, origen: 'A', destino: 'O' };
}

function presetGrafoDenso(): Preset {
  const ids = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cx = SVG_WIDTH / 2;
  const cy = SVG_HEIGHT / 2;
  const radio = 180;
  const nodos: Nodo[] = ids.map((id, i) => {
    const ang = (i * 2 * Math.PI) / ids.length - Math.PI / 2;
    return { id, x: cx + radio * Math.cos(ang), y: cy + radio * Math.sin(ang) };
  });
  const conexiones: Array<[string, string, number]> = [
    ['A', 'B', 4], ['A', 'C', 2], ['A', 'D', 7],
    ['B', 'C', 1], ['B', 'E', 5], ['C', 'D', 3],
    ['C', 'F', 6], ['D', 'G', 4], ['E', 'F', 2],
    ['E', 'H', 8], ['F', 'G', 1], ['F', 'H', 3],
    ['G', 'H', 5], ['A', 'E', 9], ['B', 'F', 4],
  ];
  const aristas: Arista[] = conexiones.map(([from, to, peso]) => ({
    id: aristaId(from, to),
    from,
    to,
    peso,
  }));
  return { nodos, aristas, dirigido: false, origen: 'A', destino: 'H' };
}

function presetLaberinto(): Preset {
  const cols = 4;
  const rows = 3;
  const margenX = 120;
  const margenY = 100;
  const dx = (SVG_WIDTH - 2 * margenX) / (cols - 1);
  const dy = (SVG_HEIGHT - 2 * margenY) / (rows - 1);
  const letras = 'ABCDEFGHIJKL';
  const ids: string[][] = [];
  const nodos: Nodo[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const fila: string[] = [];
    for (let c = 0; c < cols; c++) {
      const id = letras[idx++];
      nodos.push({ id, x: margenX + c * dx, y: margenY + r * dy });
      fila.push(id);
    }
    ids.push(fila);
  }
  // Aristas laberínticas (algunas eliminadas a propósito)
  const conexiones: Array<[string, string, number]> = [
    ['A', 'B', 1], ['B', 'C', 1], ['C', 'D', 1],
    ['A', 'E', 1], ['C', 'G', 1], ['D', 'H', 1],
    ['E', 'F', 1], ['G', 'H', 1],
    ['F', 'J', 1], ['G', 'K', 1], ['H', 'L', 1],
    ['I', 'J', 1], ['J', 'K', 1],
    ['E', 'I', 1],
  ];
  const aristas: Arista[] = conexiones.map(([from, to, peso]) => ({
    id: aristaId(from, to),
    from,
    to,
    peso,
  }));
  return { nodos, aristas, dirigido: false, origen: 'A', destino: 'L' };
}

// ============== COMPONENTE ==============

export default function SimuladorGrafosPage() {
  const [nodos, setNodos] = useState<Nodo[]>([]);
  const [aristas, setAristas] = useState<Arista[]>([]);
  const [dirigido, setDirigido] = useState<boolean>(false);
  const [modo, setModo] = useState<ModoEditor>('add-node');
  const [pesoActual, setPesoActual] = useState<number>(1);
  const [seleccionAristaFrom, setSeleccionAristaFrom] = useState<string | null>(null);
  const [origen, setOrigen] = useState<string | null>(null);
  const [destino, setDestino] = useState<string | null>(null);
  const [seleccionMarcado, setSeleccionMarcado] = useState<'origen' | 'destino' | null>(null);
  const [algoritmo, setAlgoritmo] = useState<Algoritmo>('bfs');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [pasoActual, setPasoActual] = useState<number>(0);
  const [animando, setAnimando] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(700);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const arrastrandoNodo = useRef<string | null>(null);

  // Iniciar con preset por defecto
  useEffect(() => {
    cargarPreset(presetGrid5x5());
  }, []);

  const cargarPreset = useCallback((p: Preset) => {
    setNodos(p.nodos);
    setAristas(p.aristas);
    setDirigido(p.dirigido);
    setOrigen(p.origen);
    setDestino(p.destino);
    setResultado(null);
    setPasoActual(0);
    setAnimando(false);
    setSeleccionAristaFrom(null);
    setSeleccionMarcado(null);
    if (animTimer.current) {
      clearTimeout(animTimer.current);
      animTimer.current = null;
    }
  }, []);

  const limpiarGrafo = useCallback(() => {
    setNodos([]);
    setAristas([]);
    setOrigen(null);
    setDestino(null);
    setResultado(null);
    setPasoActual(0);
    setAnimando(false);
    setSeleccionAristaFrom(null);
    setSeleccionMarcado(null);
  }, []);

  // Convertir coordenadas pantalla → SVG
  const obtenerCoordsSvg = useCallback((evt: React.PointerEvent<SVGSVGElement>): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const inv = ctm.inverse();
    const transformed = pt.matrixTransform(inv);
    return { x: transformed.x, y: transformed.y };
  }, []);

  const handleSvgClick = useCallback(
    (evt: React.PointerEvent<SVGSVGElement>) => {
      if (modo !== 'add-node') return;
      // Solo añadir si el target es el SVG (no un nodo)
      const target = evt.target as Element;
      if (target.tagName !== 'svg' && target.tagName !== 'rect') return;
      const coords = obtenerCoordsSvg(evt);
      if (!coords) return;
      setNodos((prev) => {
        const existentes = new Set(prev.map((n) => n.id));
        const nuevoId = siguienteEtiqueta(existentes);
        return [...prev, { id: nuevoId, x: coords.x, y: coords.y }];
      });
      setResultado(null);
    },
    [modo, obtenerCoordsSvg],
  );

  const handleNodoClick = useCallback(
    (nodoId: string, evt: React.SyntheticEvent) => {
      evt.stopPropagation();
      if (seleccionMarcado === 'origen') {
        setOrigen(nodoId);
        if (destino === nodoId) setDestino(null);
        setSeleccionMarcado(null);
        setResultado(null);
        return;
      }
      if (seleccionMarcado === 'destino') {
        setDestino(nodoId);
        if (origen === nodoId) setOrigen(null);
        setSeleccionMarcado(null);
        setResultado(null);
        return;
      }
      if (modo === 'delete') {
        setNodos((prev) => prev.filter((n) => n.id !== nodoId));
        setAristas((prev) => prev.filter((a) => a.from !== nodoId && a.to !== nodoId));
        if (origen === nodoId) setOrigen(null);
        if (destino === nodoId) setDestino(null);
        setResultado(null);
        return;
      }
      if (modo === 'add-edge') {
        if (seleccionAristaFrom === null) {
          setSeleccionAristaFrom(nodoId);
        } else if (seleccionAristaFrom === nodoId) {
          setSeleccionAristaFrom(null);
        } else {
          const from = seleccionAristaFrom;
          const to = nodoId;
          // No duplicar
          const existe = aristas.find((a) =>
            (a.from === from && a.to === to) || (!dirigido && a.from === to && a.to === from),
          );
          if (!existe) {
            setAristas((prev) => [
              ...prev,
              { id: aristaId(from, to), from, to, peso: pesoActual },
            ]);
            setResultado(null);
          }
          setSeleccionAristaFrom(null);
        }
      }
    },
    [modo, seleccionAristaFrom, aristas, pesoActual, dirigido, origen, destino, seleccionMarcado],
  );

  const handleNodoPointerDown = useCallback(
    (nodoId: string, evt: React.PointerEvent) => {
      if (modo !== 'move') return;
      evt.stopPropagation();
      arrastrandoNodo.current = nodoId;
    },
    [modo],
  );

  // Accesibilidad por teclado: Intro/Espacio ejecuta la acción del modo actual;
  // en modo "mover", las flechas desplazan el nodo enfocado.
  const handleNodoKeyDown = useCallback(
    (nodoId: string, evt: React.KeyboardEvent<SVGGElement>) => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        handleNodoClick(nodoId, evt);
        return;
      }
      if (modo === 'move' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evt.key)) {
        evt.preventDefault();
        const paso = evt.shiftKey ? 30 : 10;
        const deltas: Record<string, [number, number]> = {
          ArrowUp: [0, -paso],
          ArrowDown: [0, paso],
          ArrowLeft: [-paso, 0],
          ArrowRight: [paso, 0],
        };
        const [dx, dy] = deltas[evt.key];
        setNodos((prev) =>
          prev.map((n) =>
            n.id === nodoId
              ? {
                  ...n,
                  x: Math.max(RADIO_NODO, Math.min(SVG_WIDTH - RADIO_NODO, n.x + dx)),
                  y: Math.max(RADIO_NODO, Math.min(SVG_HEIGHT - RADIO_NODO, n.y + dy)),
                }
              : n,
          ),
        );
        setResultado(null);
      }
    },
    [modo, handleNodoClick],
  );

  const handleSvgPointerMove = useCallback(
    (evt: React.PointerEvent<SVGSVGElement>) => {
      if (!arrastrandoNodo.current) return;
      const coords = obtenerCoordsSvg(evt);
      if (!coords) return;
      const id = arrastrandoNodo.current;
      setNodos((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                x: Math.max(RADIO_NODO, Math.min(SVG_WIDTH - RADIO_NODO, coords.x)),
                y: Math.max(RADIO_NODO, Math.min(SVG_HEIGHT - RADIO_NODO, coords.y)),
              }
            : n,
        ),
      );
    },
    [obtenerCoordsSvg],
  );

  const handleSvgPointerUp = useCallback(() => {
    if (arrastrandoNodo.current) {
      arrastrandoNodo.current = null;
      // Recalcular heurísticas si A* estaba activo
      setResultado(null);
    }
  }, []);

  const handleAristaClick = useCallback(
    (id: string) => {
      if (modo === 'delete') {
        setAristas((prev) => prev.filter((a) => a.id !== id));
        setResultado(null);
      }
    },
    [modo],
  );

  const ejecutar = useCallback(() => {
    if (!origen || !destino) return;
    if (!nodos.find((n) => n.id === origen) || !nodos.find((n) => n.id === destino)) return;
    let res: Resultado;
    if (algoritmo === 'bfs') res = ejecutarBFS(nodos, aristas, origen, destino, dirigido);
    else if (algoritmo === 'dfs') res = ejecutarDFS(nodos, aristas, origen, destino, dirigido);
    else if (algoritmo === 'dijkstra')
      res = ejecutarDijkstra(nodos, aristas, origen, destino, dirigido);
    else res = ejecutarAStar(nodos, aristas, origen, destino, dirigido);
    setResultado(res);
    setPasoActual(0);
    setAnimando(true);
  }, [algoritmo, nodos, aristas, origen, destino, dirigido]);

  // Animación
  useEffect(() => {
    if (!animando || !resultado) return;
    if (pasoActual >= resultado.pasos.length - 1) {
      setAnimando(false);
      return;
    }
    animTimer.current = setTimeout(() => {
      setPasoActual((prev) => Math.min(prev + 1, resultado.pasos.length - 1));
    }, velocidad);
    return () => {
      if (animTimer.current) clearTimeout(animTimer.current);
    };
  }, [animando, pasoActual, velocidad, resultado]);

  const pasoMostrar = resultado ? resultado.pasos[pasoActual] : null;

  // Estado de cada nodo según el paso actual o estado base
  const estadoVisualNodo = useCallback(
    (nodo: Nodo): EstadoNodo => {
      if (pasoMostrar) {
        return pasoMostrar.estados[nodo.id] ?? 'no-visitado';
      }
      if (nodo.id === origen) return 'origen';
      if (nodo.id === destino) return 'destino';
      return 'no-visitado';
    },
    [pasoMostrar, origen, destino],
  );

  const aristasEnCamino = useMemo(() => {
    if (!resultado) return new Set<string>();
    return new Set(resultado.aristasCamino);
  }, [resultado]);

  const aristasResaltadasPaso = useMemo(() => {
    if (!pasoMostrar) return new Set<string>();
    return new Set(pasoMostrar.aristasResaltadas);
  }, [pasoMostrar]);

  // Descripción accesible de un nodo: estado actual + acción disponible con Intro
  const nodoAriaLabel = useCallback(
    (nodo: Nodo): string => {
      const estado = estadoVisualNodo(nodo);
      const estadoTexto: Record<EstadoNodo, string> = {
        'no-visitado': '',
        'en-frontera': 'en la frontera',
        actual: 'nodo actual del algoritmo',
        visitado: 'visitado',
        origen: 'origen',
        destino: 'destino',
        camino: 'parte del camino encontrado',
      };
      const partes = [`Nodo ${nodo.id}`];
      if (estadoTexto[estado]) partes.push(estadoTexto[estado]);

      if (seleccionMarcado === 'origen') partes.push('Pulsa Intro para marcarlo como origen');
      else if (seleccionMarcado === 'destino') partes.push('Pulsa Intro para marcarlo como destino');
      else if (modo === 'delete') partes.push('Pulsa Intro para eliminar este nodo');
      else if (modo === 'add-edge') {
        if (seleccionAristaFrom === nodo.id) partes.push('Pulsa Intro para cancelar la nueva arista');
        else if (seleccionAristaFrom) partes.push(`Pulsa Intro para crear una arista desde ${seleccionAristaFrom}`);
        else partes.push('Pulsa Intro para empezar una arista desde este nodo');
      } else if (modo === 'move') {
        partes.push('Usa las flechas para mover el nodo');
      }

      return partes.join('. ');
    },
    [estadoVisualNodo, seleccionMarcado, modo, seleccionAristaFrom],
  );

  // Render auxiliar
  const renderAuxiliar = (): React.ReactElement => {
    if (!resultado || !pasoMostrar) {
      return (
        <div className={styles.auxList}>
          <span className={styles.auxEmpty}>Pulsa &laquo;Ejecutar algoritmo&raquo; para ver la estructura.</span>
        </div>
      );
    }

    if (algoritmo === 'bfs') {
      return (
        <div>
          <p className={styles.auxiliarSubtitle}>Cola FIFO (primero en entrar, primero en salir)</p>
          <div className={styles.auxList}>
            {pasoMostrar.auxiliar.length === 0 ? (
              <span className={styles.auxEmpty}>(vacía)</span>
            ) : (
              pasoMostrar.auxiliar.map((id, i) => (
                <span key={`${id}-${i}`} className={styles.auxItem}>
                  {id}
                </span>
              ))
            )}
          </div>
        </div>
      );
    }

    if (algoritmo === 'dfs') {
      return (
        <div>
          <p className={styles.auxiliarSubtitle}>Pila LIFO (último en entrar, primero en salir). Cima abajo.</p>
          <div className={`${styles.auxList} ${styles.auxListVertical}`}>
            {pasoMostrar.auxiliar.length === 0 ? (
              <span className={styles.auxEmpty}>(vacía)</span>
            ) : (
              pasoMostrar.auxiliar.map((id, i) => (
                <span key={`${id}-${i}`} className={styles.auxItem}>
                  {id}
                </span>
              ))
            )}
          </div>
        </div>
      );
    }

    if (algoritmo === 'dijkstra' && pasoMostrar.tablaDijkstra) {
      const tabla = pasoMostrar.tablaDijkstra;
      const ids = nodos.map((n) => n.id);
      return (
        <div>
          <p className={styles.auxiliarSubtitle}>Tabla de distancias provisionales y predecesores</p>
          <table className={styles.tablaDijkstra}>
            <thead>
              <tr>
                <th>Nodo</th>
                <th>Dist</th>
                <th>Pred</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{tabla[id].dist === Infinity ? '∞' : tabla[id].dist}</td>
                  <td>{tabla[id].pred ?? '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.auxiliarSubtitle} style={{ marginTop: '0.75rem' }}>Cola de prioridad (heap):</p>
          <div className={styles.auxList}>
            {pasoMostrar.auxiliar.length === 0 ? (
              <span className={styles.auxEmpty}>(vacía)</span>
            ) : (
              pasoMostrar.auxiliar.map((s, i) => (
                <span key={`${s}-${i}`} className={styles.auxItem}>
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
      );
    }

    if (algoritmo === 'astar' && pasoMostrar.tablaAstar) {
      const tabla = pasoMostrar.tablaAstar;
      const ids = nodos.map((n) => n.id);
      return (
        <div>
          <p className={styles.auxiliarSubtitle}>Tabla A* (g = coste real, h = heurística, f = g+h)</p>
          <table className={styles.tablaDijkstra}>
            <thead>
              <tr>
                <th>Nodo</th>
                <th>g</th>
                <th>h</th>
                <th>f</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{tabla[id].g === Infinity ? '∞' : tabla[id].g}</td>
                  <td>{tabla[id].h}</td>
                  <td>{tabla[id].f === Infinity ? '∞' : tabla[id].f}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.auxiliarSubtitle} style={{ marginTop: '0.75rem' }}>Conjunto abierto (heap por f):</p>
          <div className={styles.auxList}>
            {pasoMostrar.auxiliar.length === 0 ? (
              <span className={styles.auxEmpty}>(vacío)</span>
            ) : (
              pasoMostrar.auxiliar.map((s, i) => (
                <span key={`${s}-${i}`} className={styles.auxItem}>
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
      );
    }

    return <div className={styles.auxList} />;
  };

  const tituloAuxiliar =
    algoritmo === 'bfs'
      ? 'Cola (BFS)'
      : algoritmo === 'dfs'
        ? 'Pila (DFS)'
        : algoritmo === 'dijkstra'
          ? 'Heap + Tabla (Dijkstra)'
          : 'Tabla A* + Abierto';

  const puedeEjecutar =
    origen !== null &&
    destino !== null &&
    origen !== destino &&
    nodos.some((n) => n.id === origen) &&
    nodos.some((n) => n.id === destino);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Grafos</h1>
        <p className={styles.subtitle}>BFS, DFS, Dijkstra y A* — paso a paso con estructura auxiliar viva</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de algoritmo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Elige el algoritmo</h2>
          <div className={styles.algoritmoSelector}>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'bfs' ? styles.algoritmoActive : ''}`}
              aria-pressed={algoritmo === 'bfs'}
              onClick={() => {
                setAlgoritmo('bfs');
                setResultado(null);
              }}
            >
              <span className={styles.algoritmoNombre}>BFS</span>
              <span className={styles.algoritmoDesc}>Anchura · cola FIFO</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'dfs' ? styles.algoritmoActive : ''}`}
              aria-pressed={algoritmo === 'dfs'}
              onClick={() => {
                setAlgoritmo('dfs');
                setResultado(null);
              }}
            >
              <span className={styles.algoritmoNombre}>DFS</span>
              <span className={styles.algoritmoDesc}>Profundidad · pila LIFO</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'dijkstra' ? styles.algoritmoActive : ''}`}
              aria-pressed={algoritmo === 'dijkstra'}
              onClick={() => {
                setAlgoritmo('dijkstra');
                setResultado(null);
              }}
            >
              <span className={styles.algoritmoNombre}>Dijkstra</span>
              <span className={styles.algoritmoDesc}>Camino más corto</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'astar' ? styles.algoritmoActive : ''}`}
              aria-pressed={algoritmo === 'astar'}
              onClick={() => {
                setAlgoritmo('astar');
                setResultado(null);
              }}
            >
              <span className={styles.algoritmoNombre}>A*</span>
              <span className={styles.algoritmoDesc}>Dijkstra + heurística</span>
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Carga un grafo de ejemplo o construye el tuyo</h2>
          <div className={styles.presetGrid}>
            <button type="button" className={styles.presetBtn} onClick={() => cargarPreset(presetGrid5x5())}>
              <span className={styles.presetTitle}>Cuadrícula 5×5</span>
              <span className={styles.presetDesc}>25 nodos en rejilla, aristas a 4 vecinos</span>
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => cargarPreset(presetArbolBinario())}>
              <span className={styles.presetTitle}>Árbol binario</span>
              <span className={styles.presetDesc}>Raíz + 3 niveles (15 nodos)</span>
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => cargarPreset(presetGrafoDenso())}>
              <span className={styles.presetTitle}>Grafo denso</span>
              <span className={styles.presetDesc}>8 nodos, 15 aristas con peso</span>
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => cargarPreset(presetLaberinto())}>
              <span className={styles.presetTitle}>Laberinto</span>
              <span className={styles.presetDesc}>12 nodos con paredes</span>
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>3. Edita el grafo</h2>

          <div className={styles.toolbar}>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'add-node' ? styles.toolActive : ''}`}
              aria-pressed={modo === 'add-node'}
              onClick={() => {
                setModo('add-node');
                setSeleccionAristaFrom(null);
              }}
            >
              + Añadir nodo
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'add-edge' ? styles.toolActive : ''}`}
              aria-pressed={modo === 'add-edge'}
              onClick={() => {
                setModo('add-edge');
                setSeleccionAristaFrom(null);
              }}
            >
              ↔ Añadir arista
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'move' ? styles.toolActive : ''}`}
              aria-pressed={modo === 'move'}
              onClick={() => {
                setModo('move');
                setSeleccionAristaFrom(null);
              }}
            >
              ✥ Mover
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'delete' ? styles.toolActive : ''}`}
              aria-pressed={modo === 'delete'}
              onClick={() => {
                setModo('delete');
                setSeleccionAristaFrom(null);
              }}
            >
              <span aria-hidden="true">🗑</span> Eliminar
            </button>

            <label className={styles.toggleControl}>
              <input
                type="checkbox"
                checked={dirigido}
                onChange={(e) => {
                  setDirigido(e.target.checked);
                  setResultado(null);
                }}
              />
              Dirigido
            </label>
          </div>

          {modo === 'add-edge' && (
            <div className={styles.pesoControl}>
              <label htmlFor="peso-slider">Peso de la nueva arista:</label>
              <input
                id="peso-slider"
                type="range"
                min={1}
                max={99}
                value={pesoActual}
                onChange={(e) => setPesoActual(parseInt(e.target.value, 10))}
              />
              <span className={styles.pesoValue}>{pesoActual}</span>
            </div>
          )}

          <div className={styles.hint}>
            {modo === 'add-node' && <>Modo añadir nodo: haz clic en el lienzo para crear un nodo nuevo.</>}
            {modo === 'add-edge' && (
              <>
                Modo añadir arista: clic en el primer nodo, luego en el segundo. {seleccionAristaFrom && <strong> (Origen seleccionado: {seleccionAristaFrom})</strong>}
              </>
            )}
            {modo === 'move' && <>Modo mover: arrastra cualquier nodo para reposicionarlo.</>}
            {modo === 'delete' && <>Modo eliminar: clic en un nodo o arista para borrarlo.</>}
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={`${styles.actionBtn} ${seleccionMarcado === 'origen' ? styles.toolActive : ''}`}
              aria-pressed={seleccionMarcado === 'origen'}
              onClick={() => setSeleccionMarcado(seleccionMarcado === 'origen' ? null : 'origen')}
            >
              <span aria-hidden="true">📍</span> Marcar origen {origen && <>({origen})</>}
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${seleccionMarcado === 'destino' ? styles.toolActive : ''}`}
              aria-pressed={seleccionMarcado === 'destino'}
              onClick={() => setSeleccionMarcado(seleccionMarcado === 'destino' ? null : 'destino')}
            >
              <span aria-hidden="true">🎯</span> Marcar destino {destino && <>({destino})</>}
            </button>
            <button type="button" className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={limpiarGrafo}>
              Limpiar grafo
            </button>
          </div>

          {seleccionMarcado && (
            <div className={styles.hint}>
              <strong>Selecciona un nodo</strong> en el lienzo para marcarlo como {seleccionMarcado}.
            </div>
          )}

          {/* Layout editor + auxiliar */}
          <div className={styles.editorLayout}>
            <div className={styles.editorContainer}>
              <svg
                ref={svgRef}
                className={styles.editorSvg}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                onPointerDown={handleSvgClick}
                onPointerMove={handleSvgPointerMove}
                onPointerUp={handleSvgPointerUp}
                onPointerLeave={handleSvgPointerUp}
              >
                {/* Definiciones para flechas dirigidas */}
                <defs>
                  <marker
                    id="flecha"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR_NO_VISITADO} />
                  </marker>
                  <marker
                    id="flechaCamino"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR_CAMINO} />
                  </marker>
                </defs>

                {/* Aristas */}
                {aristas.map((a) => {
                  const nodoFrom = nodos.find((n) => n.id === a.from);
                  const nodoTo = nodos.find((n) => n.id === a.to);
                  if (!nodoFrom || !nodoTo) return null;
                  const enCamino = aristasEnCamino.has(a.id);
                  const resaltada = aristasResaltadasPaso.has(a.id);
                  let claseArista = styles.aristaLinea;
                  if (enCamino) claseArista = styles.aristaCamino;
                  else if (resaltada) claseArista = styles.aristaResaltada;
                  // Acortar línea para que no entre en el círculo
                  const dx = nodoTo.x - nodoFrom.x;
                  const dy = nodoTo.y - nodoFrom.y;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const ux = dx / len;
                  const uy = dy / len;
                  const x1 = nodoFrom.x + ux * RADIO_NODO;
                  const y1 = nodoFrom.y + uy * RADIO_NODO;
                  const x2 = nodoTo.x - ux * RADIO_NODO;
                  const y2 = nodoTo.y - uy * RADIO_NODO;
                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;
                  return (
                    <g key={a.id} onClick={() => handleAristaClick(a.id)} style={{ cursor: modo === 'delete' ? 'pointer' : 'default' }}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className={claseArista}
                        markerEnd={dirigido ? (enCamino ? 'url(#flechaCamino)' : 'url(#flecha)') : undefined}
                      />
                      <text x={mx} y={my} className={styles.aristaPeso} dy="-4">
                        {a.peso}
                      </text>
                    </g>
                  );
                })}

                {/* Nodos */}
                {nodos.map((n) => {
                  const estado = estadoVisualNodo(n);
                  const color = colorDeEstado(estado);
                  return (
                    <g
                      key={n.id}
                      onPointerDown={(e) => handleNodoPointerDown(n.id, e)}
                      onClick={(e) => handleNodoClick(n.id, e)}
                      onKeyDown={(e) => handleNodoKeyDown(n.id, e)}
                      style={{ cursor: modo === 'move' ? 'grab' : 'pointer' }}
                      tabIndex={0}
                      role="button"
                      aria-label={nodoAriaLabel(n)}
                      className={styles.nodoGrupo}
                    >
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={RADIO_NODO}
                        fill={color}
                        stroke={seleccionAristaFrom === n.id ? '#fbbf24' : '#1f2937'}
                        strokeWidth={seleccionAristaFrom === n.id ? 4 : 2}
                        className={styles.nodoCircle}
                      />
                      <text x={n.x} y={n.y} className={styles.nodoLabel} fill="white">
                        {n.id}
                      </text>
                    </g>
                  );
                })}

                {nodos.length === 0 && (
                  <text
                    x={SVG_WIDTH / 2}
                    y={SVG_HEIGHT / 2}
                    textAnchor="middle"
                    fill={COLOR_NO_VISITADO}
                    fontSize="16"
                    style={{ pointerEvents: 'none' }}
                  >
                    Lienzo vacío. Carga un preset o añade nodos.
                  </text>
                )}
              </svg>
            </div>

            <aside className={styles.auxiliarPanel}>
              <h3 className={styles.auxiliarTitle}>{tituloAuxiliar}</h3>
              {renderAuxiliar()}
              {pasoMostrar && (
                <div className={styles.descripcionPaso} role="status" aria-live="polite" aria-atomic="true">
                  <strong>Paso {pasoActual + 1} / {resultado!.pasos.length}:</strong> {pasoMostrar.descripcion}
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Controles ejecución */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>4. Ejecuta y observa la animación</h2>
          <button
            type="button"
            className={styles.calcBtn}
            onClick={ejecutar}
            disabled={!puedeEjecutar}
          >
            {!puedeEjecutar
              ? 'Marca origen y destino para continuar'
              : `Ejecutar ${algoritmo.toUpperCase()} de ${origen} a ${destino}`}
          </button>

          {resultado && (
            <>
              <div className={styles.controlBar} style={{ marginTop: '1rem' }}>
                <div className={styles.velocidadControl}>
                  <label htmlFor="vel-slider">Velocidad:</label>
                  <input
                    id="vel-slider"
                    type="range"
                    min={100}
                    max={2000}
                    step={100}
                    value={velocidad}
                    onChange={(e) => setVelocidad(parseInt(e.target.value, 10))}
                  />
                  <span className={styles.velocidadValue}>{velocidad} ms</span>
                </div>
                <button
                  type="button"
                  className={styles.controlBtn}
                  onClick={() => setAnimando(true)}
                  disabled={animando || pasoActual >= resultado.pasos.length - 1}
                >
                  <span aria-hidden="true">▶</span> Iniciar
                </button>
                <button
                  type="button"
                  className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                  onClick={() => setAnimando(false)}
                  disabled={!animando}
                >
                  <span aria-hidden="true">⏸</span> Pausar
                </button>
                <button
                  type="button"
                  className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                  onClick={() => {
                    setAnimando(false);
                    setPasoActual((prev) => Math.min(prev + 1, resultado.pasos.length - 1));
                  }}
                  disabled={pasoActual >= resultado.pasos.length - 1}
                >
                  <span aria-hidden="true">⏭</span> Paso
                </button>
                <button
                  type="button"
                  className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                  onClick={() => {
                    setAnimando(false);
                    setPasoActual(0);
                  }}
                >
                  ↺ Reiniciar
                </button>
              </div>

              <div className={styles.metricsGrid} role="status" aria-live="polite" aria-atomic="true">
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Nodos visitados</span>
                  <span className={styles.metricValue}>{formatNumber(resultado.nodosVisitados, 0)}</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Aristas exploradas</span>
                  <span className={styles.metricValue}>{formatNumber(resultado.aristasExploradas, 0)}</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Longitud del camino</span>
                  <span className={styles.metricValue}>
                    {resultado.caminoEncontrado.length === 0
                      ? '—'
                      : `${formatNumber(resultado.caminoEncontrado.length - 1, 0)}`}
                    <span className={styles.metricUnit}>aristas</span>
                  </span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>
                    {algoritmo === 'bfs' || algoritmo === 'dfs' ? 'Coste total (nº de saltos)' : 'Coste total'}
                  </span>
                  <span className={styles.metricValue}>
                    {resultado.caminoEncontrado.length === 0 ? '—' : formatNumber(resultado.costeTotal, 0)}
                  </span>
                  {(algoritmo === 'bfs' || algoritmo === 'dfs') && resultado.caminoEncontrado.length > 0 && (
                    <span className={styles.metricNote}>BFS y DFS no tienen en cuenta el peso de las aristas</span>
                  )}
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Complejidad</span>
                  <span className={styles.metricValue} style={{ fontSize: '1.05rem' }}>
                    {resultado.complejidad}
                  </span>
                </div>
              </div>

              {resultado.caminoEncontrado.length > 0 && (
                <div className={styles.resultBlock} role="status" aria-live="polite" aria-atomic="true">
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Camino encontrado:</span>
                    <span className={`${styles.resultValue} ${styles.resultValueAccent}`}>
                      {resultado.caminoEncontrado.join(' → ')}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía de Algoritmos de Grafos"
        subtitle="BFS, DFS, Dijkstra y A* — comparativa y casos de uso"
      >
        <h3>Comparativa de algoritmos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Algoritmo</th>
                <th>Estructura auxiliar</th>
                <th>Aristas con peso</th>
                <th>Camino óptimo</th>
                <th>Complejidad</th>
                <th>Cuándo usar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>BFS</strong></td>
                <td>Cola FIFO</td>
                <td>No (ignora peso)</td>
                <td>Sí, en aristas</td>
                <td>O(V + E)</td>
                <td>Camino más corto en aristas (sin peso)</td>
              </tr>
              <tr>
                <td><strong>DFS</strong></td>
                <td>Pila LIFO</td>
                <td>No (ignora peso)</td>
                <td>No</td>
                <td>O(V + E)</td>
                <td>Detectar ciclos, ordenación topológica, exploración</td>
              </tr>
              <tr>
                <td><strong>Dijkstra</strong></td>
                <td>Cola de prioridad (heap)</td>
                <td>Sí (no negativos)</td>
                <td>Sí, en peso</td>
                <td>O((V+E) log V)</td>
                <td>Camino más corto en grafos con peso (mapas, redes)</td>
              </tr>
              <tr>
                <td><strong>A*</strong></td>
                <td>Heap por f = g + h</td>
                <td>Sí (no negativos)</td>
                <td>Sí, si h es admisible</td>
                <td>O((V+E) log V)</td>
                <td>Pathfinding con destino conocido (videojuegos, GPS)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de uso reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗺</span>
              <strong>Mapas y navegación</strong>
            </div>
            <p className={styles.escenarioExample}>
              Google Maps, Waze y aplicaciones similares usan variantes de Dijkstra y A* sobre grafos donde nodos son intersecciones y aristas son tramos de carretera con peso = tiempo o distancia.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> A* gana a Dijkstra cuando se conoce el destino, gracias a la heurística geográfica.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>Videojuegos y NPCs</strong>
            </div>
            <p className={styles.escenarioExample}>
              El pathfinding de personajes no jugables (NPCs) en juegos de estrategia, RPG o shooters se resuelve con A* sobre grids o navmesh, con heurística manhattan o euclídea.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> BFS también se usa en juegos por turnos para casillas alcanzables en N pasos.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌐</span>
              <strong>Redes y enrutamiento</strong>
            </div>
            <p className={styles.escenarioExample}>
              Protocolos como OSPF (Open Shortest Path First) usan Dijkstra para construir tablas de enrutamiento. Los routers calculan el mejor camino al destino en tiempo real.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> BGP es un caso especial: usa políticas, no solo coste mínimo.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👥</span>
              <strong>Redes sociales y recomendaciones</strong>
            </div>
            <p className={styles.escenarioExample}>
              &laquo;Personas que quizás conozcas&raquo; en LinkedIn o Facebook se calcula con BFS limitado a 2-3 niveles de profundidad sobre el grafo de amistad.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> BFS mantiene el orden por distancia social: primero amigos, luego amigos-de-amigos.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuál es la diferencia entre BFS y DFS?</h4>
            <p>
              BFS explora &laquo;por niveles&raquo;: visita primero todos los vecinos directos, luego los vecinos de los vecinos, y así sucesivamente. Usa una cola FIFO. DFS explora &laquo;a fondo&raquo;: sigue un camino hasta agotarlo y vuelve hacia atrás (backtracking) cuando no puede avanzar. Usa una pila LIFO (o recursión).
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> BFS encuentra el camino más corto en número de aristas. DFS no garantiza camino óptimo, pero usa menos memoria en grafos profundos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué Dijkstra no admite pesos negativos?</h4>
            <p>
              Dijkstra asume que una vez que extraes un nodo del heap (con la menor distancia), esa distancia es definitiva: no puede mejorar. Con pesos negativos, una arista posterior podría reducir la distancia, invalidando esa decisión.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Si tu grafo tiene aristas con peso negativo, usa Bellman-Ford (O(V·E)) o Floyd-Warshall (todos los pares).
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué heurística debo usar en A*?</h4>
            <p>
              Una heurística h(n) estima el coste desde n hasta el destino. Debe ser <strong>admisible</strong> (nunca sobreestimar el coste real) para garantizar la optimalidad. Heurísticas comunes: distancia euclídea (rejillas con movimiento libre), distancia Manhattan (rejillas 4-direcciones), distancia Chebyshev (rejillas 8-direcciones).
            </p>
            <p>
              <strong>Cómo la calcula este simulador.</strong> Aquí los pesos los pones tú con un
              deslizador y no tienen ninguna relación con las distancias del dibujo, así que la
              distancia en píxeles a secas NO sería admisible: podría estimar 30 donde el camino
              entero cuesta 10, y entonces A* dejaría de garantizar el óptimo. Por eso h se calibra
              con el propio grafo — h(n) = k · distancia(n, destino), donde k es el menor cociente
              peso/longitud de todas sus aristas. Si ninguna arista cuesta menos de k por píxel,
              ningún camino puede costar menos de k veces la línea recta, y la heurística queda
              garantizada por debajo del coste real.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Si h = 0, A* degenera a Dijkstra. Si h sobreestima, encuentra camino rápido pero no óptimo.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo es A* más rápido que Dijkstra?</h4>
            <p>
              Cuando hay un destino concreto y se puede calcular una buena heurística. A* dirige la búsqueda hacia el destino, evitando explorar zonas alejadas. En grafos sin geometría (sin coordenadas), no hay heurística natural y Dijkstra suele ser más sencillo.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Si necesitas el camino más corto desde un origen a <em>todos</em> los nodos, usa Dijkstra (no A*).
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Diferencia entre grafo dirigido y no dirigido?</h4>
            <p>
              En un grafo <strong>dirigido</strong>, cada arista tiene sentido: A→B no implica B→A. Se usa para modelar relaciones asimétricas: calles de una sola dirección, dependencias, &laquo;sigue a&raquo; en redes sociales. En un grafo <strong>no dirigido</strong>, las aristas son simétricas: A↔B significa que se puede ir en ambos sentidos.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Internamente, un grafo no dirigido se puede ver como dirigido con dos aristas opuestas por cada conexión.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se implementa el heap (cola de prioridad)?</h4>
            <p>
              Un heap binario es un árbol donde cada padre es menor (min-heap) o mayor (max-heap) que sus hijos. Insertar y extraer-mínimo son O(log n). En la mayoría de lenguajes hay implementaciones nativas: <code>heapq</code> en Python, <code>PriorityQueue</code> en Java, o librerías en JavaScript.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Para grafos pequeños, una lista ordenada (O(n) por extracción) basta. Para grafos grandes, el heap marca diferencia.
            </p>
          </div>
        </div>

        <h3>Cómo trazar el algoritmo a mano — paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Dibuja el grafo y la estructura inicial</strong>
              <p>
                Dibuja los nodos y aristas. Para BFS prepara una cola; para DFS una pila; para Dijkstra una tabla de distancias (origen=0, resto=∞) y una cola de prioridad; para A* añade columnas g, h, f.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Inserta el origen en la estructura</strong>
              <p>
                Añade el nodo origen a la cola/pila/heap. Marca su distancia (0 en BFS niveles; 0 en Dijkstra; g=0, f=h en A*).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Extrae y procesa el nodo prioritario</strong>
              <p>
                Saca el siguiente nodo: el primero en BFS, el último en DFS, el de menor distancia en Dijkstra, el de menor f en A*. Márcalo como visitado.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Explora los vecinos y actualiza</strong>
              <p>
                Para cada vecino no visitado, añádelo a la estructura. En Dijkstra/A*, comprueba si llegar por este camino mejora su distancia: si sí, actualiza dist[vecino] y guarda predecesor.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Repite hasta llegar al destino o vaciar la estructura</strong>
              <p>
                Si la estructura queda vacía sin haber visitado el destino, no existe camino. Si llegas al destino, reconstruye el camino siguiendo los predecesores hacia atrás.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Elige la representación correcta</strong>
            <p>
              Lista de adyacencia para grafos dispersos (la mayoría). Matriz de adyacencia solo si V es pequeño y necesitas consultas O(1) por par (i,j).
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Usa estructuras adecuadas</strong>
            <p>
              Cola FIFO para BFS, pila o recursión para DFS, heap binario para Dijkstra/A*. Una mala elección multiplica la complejidad.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Marca visitados al extraer, no al insertar</strong>
            <p>
              En Dijkstra, un nodo puede entrar al heap varias veces con diferentes distancias. Solo se considera definitivo al extraerse.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Heurística admisible en A*</strong>
            <p>
              h(n) nunca debe sobreestimar el coste real. Distancia euclídea es admisible si los pesos son distancias geométricas; Manhattan lo es en grids 4-direcciones.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Detecta caminos imposibles</strong>
            <p>
              Si la estructura auxiliar queda vacía sin haber alcanzado el destino, no existe camino. Devuelve un valor especial (null, -1, ∞).
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Reconstruye el camino con predecesores</strong>
            <p>
              No guardes caminos completos en cada nodo (gasto de memoria). Guarda solo &laquo;de quién vine&raquo; y reconstruye al final siguiendo la cadena hacia atrás.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes al implementar grafos</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Olvidar marcar nodos como visitados → el algoritmo entra en bucle infinito en grafos con ciclos.</li>
            <li>Usar Dijkstra con pesos negativos → resultados incorrectos. Usa Bellman-Ford en su lugar.</li>
            <li>Confundir grafo dirigido con no dirigido al guardar la lista de adyacencia (olvidar añadir la arista inversa).</li>
            <li>Usar lista en lugar de heap en Dijkstra para grafos grandes → complejidad sube de O((V+E) log V) a O(V²).</li>
            <li>Heurística A* no admisible (sobreestima) → encuentra camino, pero no necesariamente el óptimo.</li>
            <li>No comprobar si origen y destino existen antes de ejecutar → excepción nula al reconstruir el camino.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-grafos')} />
      <ShareCard appName="simulador-grafos" />
      <Footer appName="simulador-grafos" />
    </div>
  );
}
