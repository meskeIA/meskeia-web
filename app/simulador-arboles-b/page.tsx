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
import styles from './SimuladorArbolesB.module.css';

// ============================================================
//  TIPOS
// ============================================================

interface NodoB {
  claves: number[];
  hijos: NodoB[]; // vacío si es hoja
  hoja: boolean;
}

interface ResultadoDivision {
  medianaPromovida: number;
  nuevoHermano: NodoB;
}

type TipoResaltado = 'nuevo' | 'encontrado' | 'eliminado';

interface NodoPosicionado {
  claves: number[];
  x: number; // centro
  y: number; // top
  ancho: number;
  alto: number;
  camino: boolean;
  refKey: number; // claves[0] del nodo (identificador único, sin duplicados)
}

interface Arista {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PresetArbol {
  id: string;
  titulo: string;
  descripcion: string;
  valores: number[];
  orden?: number;
}

// ============================================================
//  CONSTANTES DE LAYOUT
// ============================================================

const CELDA_W = 32;
const NODO_H = 36;
const NIVEL_H = 84;
const MARGEN = 24;

const PRESETS: PresetArbol[] = [
  {
    id: 'secuencial',
    titulo: 'Inserción secuencial 1-10',
    descripcion: '1…10 en orden — observa cómo las divisiones mantienen el árbol equilibrado',
    valores: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    orden: 3,
  },
  {
    id: 'division-raiz',
    titulo: 'División de la raíz',
    descripcion: '10, 20, 30, 40 (orden 3) — la raíz se llena y se divide, el árbol crece en altura',
    valores: [10, 20, 30, 40],
    orden: 3,
  },
  {
    id: 'indice-bd',
    titulo: 'Índice de base de datos',
    descripcion: 'Claves dispersas tipo IDs — árbol ancho y bajo de orden 5',
    valores: [50, 30, 70, 20, 40, 60, 80, 10, 90, 25, 55, 75],
    orden: 5,
  },
  {
    id: 'tres-niveles',
    titulo: 'Árbol de tres niveles',
    descripcion: '15 claves en orden 4 — genera una estructura con varios niveles',
    valores: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 10, 20, 30, 40, 50],
    orden: 4,
  },
];

// ============================================================
//  LÓGICA DEL ÁRBOL B
// ============================================================

function clonar(n: NodoB | null): NodoB | null {
  if (!n) return null;
  return {
    claves: [...n.claves],
    hijos: n.hijos.map((h) => clonar(h) as NodoB),
    hoja: n.hoja,
  };
}

function maxClaves(orden: number): number {
  return orden - 1;
}

function minClaves(orden: number): number {
  return Math.ceil(orden / 2) - 1;
}

function existe(nodo: NodoB | null, valor: number): boolean {
  let actual = nodo;
  while (actual) {
    let i = 0;
    while (i < actual.claves.length && valor > actual.claves[i]) i += 1;
    if (i < actual.claves.length && actual.claves[i] === valor) return true;
    if (actual.hoja) return false;
    actual = actual.hijos[i];
  }
  return false;
}

// Divide un nodo que ha desbordado (length === orden claves). La mediana sube.
function dividir(nodo: NodoB, log: string[]): ResultadoDivision {
  const mid = Math.floor(nodo.claves.length / 2);
  const medianaPromovida = nodo.claves[mid];
  const clavesDer = nodo.claves.slice(mid + 1);
  const hijosDer = nodo.hoja ? [] : nodo.hijos.slice(mid + 1);

  const nuevoHermano: NodoB = {
    claves: clavesDer,
    hijos: hijosDer,
    hoja: nodo.hoja,
  };

  nodo.claves = nodo.claves.slice(0, mid);
  nodo.hijos = nodo.hoja ? [] : nodo.hijos.slice(0, mid + 1);

  log.push(`División: la clave ${medianaPromovida} sube al nodo padre`);
  return { medianaPromovida, nuevoHermano };
}

// Inserción recursiva bottom-up. Devuelve datos de división si el nodo desborda.
function insertarRec(
  nodo: NodoB,
  valor: number,
  orden: number,
  log: string[]
): ResultadoDivision | null {
  if (nodo.hoja) {
    let i = 0;
    while (i < nodo.claves.length && valor > nodo.claves[i]) i += 1;
    nodo.claves.splice(i, 0, valor);
  } else {
    let i = 0;
    while (i < nodo.claves.length && valor > nodo.claves[i]) i += 1;
    const division = insertarRec(nodo.hijos[i], valor, orden, log);
    if (division) {
      nodo.claves.splice(i, 0, division.medianaPromovida);
      nodo.hijos.splice(i + 1, 0, division.nuevoHermano);
    }
  }
  if (nodo.claves.length > maxClaves(orden)) {
    return dividir(nodo, log);
  }
  return null;
}

function insertar(raiz: NodoB | null, valor: number, orden: number, log: string[]): NodoB {
  if (!raiz) {
    return { claves: [valor], hijos: [], hoja: true };
  }
  const division = insertarRec(raiz, valor, orden, log);
  if (division) {
    log.push(`La raíz se divide: el árbol gana un nivel de altura`);
    return {
      claves: [division.medianaPromovida],
      hijos: [raiz, division.nuevoHermano],
      hoja: false,
    };
  }
  return raiz;
}

function claveMaxima(nodo: NodoB): number {
  let actual = nodo;
  while (!actual.hoja) actual = actual.hijos[actual.hijos.length - 1];
  return actual.claves[actual.claves.length - 1];
}

// Repara el hijo i del padre si ha quedado por debajo del mínimo de claves.
function repararHijo(padre: NodoB, i: number, orden: number, log: string[]): void {
  const minK = minClaves(orden);
  const hijo = padre.hijos[i];
  if (hijo.claves.length >= minK) return;

  const izq = i > 0 ? padre.hijos[i - 1] : null;
  const der = i < padre.hijos.length - 1 ? padre.hijos[i + 1] : null;

  if (izq && izq.claves.length > minK) {
    // Préstamo del hermano izquierdo (rotación a la derecha a través del padre)
    hijo.claves.unshift(padre.claves[i - 1]);
    padre.claves[i - 1] = izq.claves.pop() as number;
    if (!izq.hoja) hijo.hijos.unshift(izq.hijos.pop() as NodoB);
    log.push(`Préstamo del hermano izquierdo para reequilibrar`);
    return;
  }

  if (der && der.claves.length > minK) {
    // Préstamo del hermano derecho (rotación a la izquierda a través del padre)
    hijo.claves.push(padre.claves[i]);
    padre.claves[i] = der.claves.shift() as number;
    if (!der.hoja) hijo.hijos.push(der.hijos.shift() as NodoB);
    log.push(`Préstamo del hermano derecho para reequilibrar`);
    return;
  }

  // Fusión con un hermano (no hay de quién pedir prestado)
  if (izq) {
    izq.claves.push(padre.claves[i - 1]);
    izq.claves.push(...hijo.claves);
    izq.hijos.push(...hijo.hijos);
    padre.claves.splice(i - 1, 1);
    padre.hijos.splice(i, 1);
    log.push(`Fusión con el hermano izquierdo`);
  } else if (der) {
    hijo.claves.push(padre.claves[i]);
    hijo.claves.push(...der.claves);
    hijo.hijos.push(...der.hijos);
    padre.claves.splice(i, 1);
    padre.hijos.splice(i + 1, 1);
    log.push(`Fusión con el hermano derecho`);
  }
}

function eliminarRec(nodo: NodoB, valor: number, orden: number, log: string[]): void {
  let i = 0;
  while (i < nodo.claves.length && valor > nodo.claves[i]) i += 1;

  if (i < nodo.claves.length && nodo.claves[i] === valor) {
    if (nodo.hoja) {
      nodo.claves.splice(i, 1);
    } else {
      // Sustituir por el predecesor (máximo del subárbol izquierdo) y eliminarlo
      const predecesor = claveMaxima(nodo.hijos[i]);
      nodo.claves[i] = predecesor;
      eliminarRec(nodo.hijos[i], predecesor, orden, log);
      repararHijo(nodo, i, orden, log);
    }
  } else {
    if (nodo.hoja) return; // no está en el árbol
    eliminarRec(nodo.hijos[i], valor, orden, log);
    repararHijo(nodo, i, orden, log);
  }
}

function eliminar(raiz: NodoB | null, valor: number, orden: number, log: string[]): NodoB | null {
  if (!raiz) return null;
  eliminarRec(raiz, valor, orden, log);
  if (raiz.claves.length === 0) {
    if (raiz.hoja) return null;
    return raiz.hijos[0];
  }
  return raiz;
}

// Búsqueda: devuelve el camino de nodos visitados y si la encontró.
function buscarCamino(raiz: NodoB | null, valor: number): { camino: NodoB[]; encontrado: boolean } {
  const camino: NodoB[] = [];
  let actual = raiz;
  while (actual) {
    camino.push(actual);
    let i = 0;
    while (i < actual.claves.length && valor > actual.claves[i]) i += 1;
    if (i < actual.claves.length && actual.claves[i] === valor) {
      return { camino, encontrado: true };
    }
    if (actual.hoja) return { camino, encontrado: false };
    actual = actual.hijos[i];
  }
  return { camino, encontrado: false };
}

function inorden(nodo: NodoB | null, acc: number[]): number[] {
  if (!nodo) return acc;
  if (nodo.hoja) {
    acc.push(...nodo.claves);
    return acc;
  }
  for (let i = 0; i < nodo.claves.length; i += 1) {
    inorden(nodo.hijos[i], acc);
    acc.push(nodo.claves[i]);
  }
  inorden(nodo.hijos[nodo.hijos.length - 1], acc);
  return acc;
}

function contarClaves(nodo: NodoB | null): number {
  if (!nodo) return 0;
  return nodo.claves.length + nodo.hijos.reduce((s, h) => s + contarClaves(h), 0);
}

function alturaArbol(nodo: NodoB | null): number {
  if (!nodo) return 0;
  if (nodo.hoja) return 1;
  return 1 + alturaArbol(nodo.hijos[0]);
}

// Layout: posiciona cada nodo. Hojas en columnas secuenciales; internos centrados sobre sus hijos.
function calcularLayout(
  raiz: NodoB | null,
  orden: number,
  caminoSet: Set<number>
): { nodos: NodoPosicionado[]; aristas: Arista[]; ancho: number; alto: number } {
  if (!raiz) {
    return { nodos: [], aristas: [], ancho: 200, alto: 120 };
  }

  const nodos: NodoPosicionado[] = [];
  const aristas: Arista[] = [];
  const slot = maxClaves(orden) * CELDA_W + 40;
  let cursorHoja = 0;

  function asignar(nodo: NodoB, profundidad: number): number {
    const y = profundidad * NIVEL_H + MARGEN;
    let centro: number;

    if (nodo.hoja) {
      centro = cursorHoja * slot + slot / 2 + MARGEN;
      cursorHoja += 1;
    } else {
      const centrosHijos = nodo.hijos.map((h) => asignar(h, profundidad + 1));
      centro = (centrosHijos[0] + centrosHijos[centrosHijos.length - 1]) / 2;
      // aristas a cada hijo
      centrosHijos.forEach((cx) => {
        aristas.push({
          x1: centro,
          y1: y + NODO_H,
          x2: cx,
          y2: (profundidad + 1) * NIVEL_H + MARGEN,
        });
      });
    }

    const ancho = Math.max(nodo.claves.length, 1) * CELDA_W;
    nodos.push({
      claves: [...nodo.claves],
      x: centro,
      y,
      ancho,
      alto: NODO_H,
      camino: caminoSet.has(nodo.claves[0]),
      refKey: nodo.claves[0],
    });
    return centro;
  }

  asignar(raiz, 0);

  const ancho = Math.max(200, cursorHoja * slot + MARGEN * 2);
  const alto = alturaArbol(raiz) * NIVEL_H + MARGEN;
  return { nodos, aristas, ancho, alto };
}

// ============================================================
//  COMPONENTE
// ============================================================

export default function SimuladorArbolesB() {
  const [orden, setOrden] = useState<number>(3);
  const [raiz, setRaiz] = useState<NodoB | null>(null);
  const [valorInsertar, setValorInsertar] = useState<string>('');
  const [valorEliminar, setValorEliminar] = useState<string>('');
  const [valorBuscar, setValorBuscar] = useState<string>('');
  const [valoresMultiples, setValoresMultiples] = useState<string>('');
  const [logOps, setLogOps] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState<string>('');
  const [caminoSet, setCaminoSet] = useState<Set<number>>(new Set());
  const [resaltado, setResaltado] = useState<{ clave: number; tipo: TipoResaltado } | null>(null);
  const [velocidad, setVelocidad] = useState<number>(600);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, []);

  const limpiarTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const handleInsertar = useCallback(
    (valor: number) => {
      if (!Number.isFinite(valor) || valor < 1 || valor > 999) {
        setMensaje('Introduce un número entero entre 1 y 999.');
        return;
      }
      const entero = Math.trunc(valor);
      const arbol = clonar(raiz);
      if (existe(arbol, entero)) {
        setMensaje(`La clave ${entero} ya está en el árbol (no se permiten duplicados).`);
        return;
      }
      const log: string[] = [];
      const nuevaRaiz = insertar(arbol, entero, orden, log);
      setRaiz(nuevaRaiz);
      setLogOps((prev) => [...prev, `Insertar ${entero}`, ...log]);
      setCaminoSet(new Set());
      setResaltado({ clave: entero, tipo: 'nuevo' });
      setMensaje(
        log.length > 0
          ? `Insertada la clave ${entero}. Se produjeron ${log.length} operación(es) de división.`
          : `Insertada la clave ${entero} sin divisiones.`
      );
      const t = setTimeout(() => setResaltado(null), velocidad * 3);
      timeoutsRef.current.push(t);
    },
    [raiz, orden, velocidad]
  );

  const handleEliminar = useCallback(
    (valor: number) => {
      if (!Number.isFinite(valor)) {
        setMensaje('Valor inválido.');
        return;
      }
      const entero = Math.trunc(valor);
      const arbol = clonar(raiz);
      if (!existe(arbol, entero)) {
        setMensaje(`La clave ${entero} no está en el árbol.`);
        return;
      }
      const log: string[] = [];
      const nuevaRaiz = eliminar(arbol, entero, orden, log);
      setRaiz(nuevaRaiz);
      setLogOps((prev) => [...prev, `Eliminar ${entero}`, ...log]);
      setCaminoSet(new Set());
      setResaltado(null);
      setMensaje(
        log.length > 0
          ? `Eliminada la clave ${entero}. Se aplicaron ${log.length} reequilibrio(s) (préstamo/fusión).`
          : `Eliminada la clave ${entero} sin reequilibrios.`
      );
    },
    [raiz, orden]
  );

  const handleBuscar = useCallback(
    (valor: number) => {
      if (!Number.isFinite(valor)) {
        setMensaje('Valor inválido.');
        return;
      }
      const entero = Math.trunc(valor);
      if (!raiz) {
        setMensaje('El árbol está vacío.');
        return;
      }
      const { camino, encontrado } = buscarCamino(raiz, entero);
      limpiarTimeouts();
      setResaltado(null);
      // animar el camino nodo a nodo
      camino.forEach((nodo, idx) => {
        const t = setTimeout(() => {
          setCaminoSet(new Set(camino.slice(0, idx + 1).map((n) => n.claves[0])));
        }, idx * velocidad);
        timeoutsRef.current.push(t);
      });
      const tFinal = setTimeout(() => {
        if (encontrado) {
          setResaltado({ clave: entero, tipo: 'encontrado' });
          setMensaje(
            `Encontrada la clave ${entero} tras visitar ${camino.length} nodo(s). La búsqueda solo baja un nivel por nodo.`
          );
        } else {
          setMensaje(
            `La clave ${entero} no está en el árbol. Se visitaron ${camino.length} nodo(s) hasta una hoja.`
          );
        }
      }, camino.length * velocidad);
      timeoutsRef.current.push(tFinal);
      const tLimpiar = setTimeout(
        () => {
          setCaminoSet(new Set());
          setResaltado(null);
        },
        camino.length * velocidad + 2800
      );
      timeoutsRef.current.push(tLimpiar);
    },
    [raiz, velocidad, limpiarTimeouts]
  );

  const construirDesde = useCallback(
    (valores: number[], ordenObjetivo: number): { arbol: NodoB | null; log: string[]; insertados: number } => {
      let arbol: NodoB | null = null;
      const log: string[] = [];
      let insertados = 0;
      for (const v of valores) {
        const entero = Math.trunc(v);
        if (entero < 1 || entero > 999) continue;
        if (existe(arbol, entero)) continue;
        arbol = insertar(arbol, entero, ordenObjetivo, log);
        insertados += 1;
      }
      return { arbol, log, insertados };
    },
    []
  );

  const handleInsertarVarios = useCallback(() => {
    const numeros = valoresMultiples
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));
    if (numeros.length === 0) {
      setMensaje('No se encontraron números válidos en el texto.');
      return;
    }
    const arbolPrev = clonar(raiz);
    let arbol = arbolPrev;
    const log: string[] = [];
    let insertados = 0;
    for (const n of numeros) {
      const entero = Math.trunc(n);
      if (entero < 1 || entero > 999) continue;
      if (existe(arbol, entero)) continue;
      arbol = insertar(arbol, entero, orden, log);
      insertados += 1;
    }
    setRaiz(arbol);
    setLogOps((prev) => [...prev, `Insertar varios (${insertados})`, ...log]);
    setCaminoSet(new Set());
    setResaltado(null);
    setMensaje(`Insertadas ${insertados} de ${numeros.length} claves. Divisiones: ${log.length}.`);
    setValoresMultiples('');
  }, [valoresMultiples, raiz, orden]);

  const handleAleatorios = useCallback(() => {
    const arbolPrev = clonar(raiz);
    let arbol = arbolPrev;
    const log: string[] = [];
    const generados = new Set<number>();
    let intentos = 0;
    while (generados.size < 8 && intentos < 200) {
      const v = Math.floor(Math.random() * 99) + 1;
      if (!existe(arbol, v) && !generados.has(v)) {
        generados.add(v);
        arbol = insertar(arbol, v, orden, log);
      }
      intentos += 1;
    }
    setRaiz(arbol);
    setLogOps((prev) => [...prev, `Aleatorios (${generados.size})`, ...log]);
    setCaminoSet(new Set());
    setResaltado(null);
    setMensaje(`Insertadas ${generados.size} claves aleatorias. Divisiones: ${log.length}.`);
  }, [raiz, orden]);

  const handlePreset = useCallback(
    (preset: PresetArbol) => {
      limpiarTimeouts();
      const ordenObjetivo = preset.orden ?? orden;
      const { arbol, log, insertados } = construirDesde(preset.valores, ordenObjetivo);
      setOrden(ordenObjetivo);
      setRaiz(arbol);
      setLogOps([`Ejemplo: ${preset.titulo}`, ...log]);
      setCaminoSet(new Set());
      setResaltado(null);
      setMensaje(
        `Cargado el ejemplo "${preset.titulo}" en orden ${ordenObjetivo}. Claves: ${insertados}. Divisiones: ${log.length}.`
      );
    },
    [orden, construirDesde, limpiarTimeouts]
  );

  const handleLimpiar = useCallback(() => {
    limpiarTimeouts();
    setRaiz(null);
    setLogOps([]);
    setCaminoSet(new Set());
    setResaltado(null);
    setMensaje('Árbol vaciado.');
  }, [limpiarTimeouts]);

  const handleCambiarOrden = useCallback(
    (nuevoOrden: number) => {
      if (nuevoOrden === orden) return;
      limpiarTimeouts();
      if (raiz) {
        const valores = inorden(raiz, []);
        const { arbol, log } = construirDesde(valores, nuevoOrden);
        setRaiz(arbol);
        setLogOps([`Reconstruido en orden ${nuevoOrden}`, ...log]);
        setMensaje(
          `Cambiado a orden ${nuevoOrden}. Árbol reconstruido con ${valores.length} claves y ${log.length} división(es).`
        );
      } else {
        setMensaje(`Cambiado a orden ${nuevoOrden}.`);
      }
      setOrden(nuevoOrden);
      setCaminoSet(new Set());
      setResaltado(null);
    },
    [orden, raiz, construirDesde, limpiarTimeouts]
  );

  const layout = useMemo(() => calcularLayout(raiz, orden, caminoSet), [raiz, orden, caminoSet]);
  const recorrido = useMemo(() => inorden(raiz, []), [raiz]);
  const numClaves = useMemo(() => contarClaves(raiz), [raiz]);
  const altura = useMemo(() => alturaArbol(raiz), [raiz]);

  const ordenesDisponibles = [
    { valor: 3, nombre: 'Orden 3', desc: '1-2 claves por nodo (árbol 2-3)' },
    { valor: 4, nombre: 'Orden 4', desc: '1-3 claves por nodo (2-3-4)' },
    { valor: 5, nombre: 'Orden 5', desc: '2-4 claves por nodo' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Árbol B (B-Tree)</h1>
        <p className={styles.subtitle}>
          Inserta, busca y elimina claves y observa la división de nodos, el préstamo entre
          hermanos y la fusión. Es la estructura que usan las bases de datos para indexar millones
          de registros con la variante B+.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de orden */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Orden del árbol</h2>
          <div className={styles.ordenSelector}>
            {ordenesDisponibles.map((o) => (
              <button
                key={o.valor}
                type="button"
                onClick={() => handleCambiarOrden(o.valor)}
                className={`${styles.ordenBtn} ${orden === o.valor ? styles.ordenActive : ''}`}
                aria-pressed={orden === o.valor}
              >
                <span className={styles.ordenNombre}>{o.nombre}</span>
                <span className={styles.ordenDesc}>{o.desc}</span>
              </button>
            ))}
          </div>
          <p className={styles.ordenNota}>
            En este árbol de orden {orden}: cada nodo tiene como máximo{' '}
            <strong>{maxClaves(orden)}</strong> claves y como mínimo{' '}
            <strong>{minClaves(orden)}</strong> (salvo la raíz). Cambiar el orden reconstruye el
            árbol con las mismas claves.
          </p>
        </section>

        {/* Operaciones */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Operaciones</h2>
          <div className={styles.opControls}>
            <div className={styles.opGroup}>
              <label htmlFor="ins-input">Insertar clave</label>
              <div className={styles.opRow}>
                <input
                  id="ins-input"
                  type="number"
                  value={valorInsertar}
                  onChange={(e) => setValorInsertar(e.target.value)}
                  placeholder="Ej: 42"
                  className={styles.opInput}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className={styles.opBtn}
                  onClick={() => {
                    const v = Number(valorInsertar);
                    if (!Number.isNaN(v)) {
                      handleInsertar(v);
                      setValorInsertar('');
                    }
                  }}
                >
                  Insertar
                </button>
              </div>
            </div>

            <div className={styles.opGroup}>
              <label htmlFor="del-input">Eliminar clave</label>
              <div className={styles.opRow}>
                <input
                  id="del-input"
                  type="number"
                  value={valorEliminar}
                  onChange={(e) => setValorEliminar(e.target.value)}
                  placeholder="Ej: 42"
                  className={styles.opInput}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className={`${styles.opBtn} ${styles.opBtnDanger}`}
                  onClick={() => {
                    const v = Number(valorEliminar);
                    if (!Number.isNaN(v)) {
                      handleEliminar(v);
                      setValorEliminar('');
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className={styles.opGroup}>
              <label htmlFor="search-input">Buscar clave</label>
              <div className={styles.opRow}>
                <input
                  id="search-input"
                  type="number"
                  value={valorBuscar}
                  onChange={(e) => setValorBuscar(e.target.value)}
                  placeholder="Ej: 42"
                  className={styles.opInput}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className={`${styles.opBtn} ${styles.opBtnSecondary}`}
                  onClick={() => {
                    const v = Number(valorBuscar);
                    if (!Number.isNaN(v)) handleBuscar(v);
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className={styles.opGroup} style={{ marginBottom: '1rem' }}>
            <label htmlFor="multi-input">Insertar varias (separadas por comas o espacios)</label>
            <textarea
              id="multi-input"
              value={valoresMultiples}
              onChange={(e) => setValoresMultiples(e.target.value)}
              placeholder="Ej: 50, 30, 70, 20, 40, 60, 80"
              className={styles.opTextarea}
            />
            <div className={styles.opRow} style={{ marginTop: '0.5rem' }}>
              <button type="button" className={styles.opBtn} onClick={handleInsertarVarios}>
                Insertar varias
              </button>
              <button
                type="button"
                className={`${styles.opBtn} ${styles.opBtnSecondary}`}
                onClick={handleAleatorios}
              >
                Aleatorias (8)
              </button>
              <button
                type="button"
                className={`${styles.opBtn} ${styles.opBtnDanger}`}
                onClick={handleLimpiar}
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </section>

        {/* Presets */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Ejemplos preconfigurados</h2>
          <div className={styles.presetGrid}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.presetBtn}
                onClick={() => handlePreset(p)}
              >
                <span className={styles.presetTitle}>{p.titulo}</span>
                <span className={styles.presetDesc}>{p.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Velocidad */}
        <div className={styles.speedControl}>
          <label htmlFor="vel-input">Velocidad de la búsqueda:</label>
          <input
            id="vel-input"
            type="range"
            min="200"
            max="1500"
            step="100"
            value={velocidad}
            onChange={(e) => setVelocidad(Number(e.target.value))}
          />
          <span className={styles.speedValue}>{formatNumber(velocidad, 0)} ms</span>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={styles.statusMessage} role="status" aria-live="polite">
            <strong>Última operación:</strong> {mensaje}
          </div>
        )}

        {/* Visualización */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Visualización del árbol</h2>
          <div className={styles.arbolContainer}>
            {raiz === null ? (
              <span className={styles.arbolEmpty}>
                El árbol está vacío. Inserta claves o carga un ejemplo para comenzar.
              </span>
            ) : (
              <svg
                className={styles.arbolSvg}
                viewBox={`0 0 ${layout.ancho} ${layout.alto}`}
                width={layout.ancho}
                height={layout.alto}
                role="img"
                aria-label="Visualización gráfica del árbol B"
              >
                {layout.aristas.map((a, idx) => (
                  <line
                    key={`arista-${idx}-${a.x2}-${a.y2}`}
                    x1={a.x1}
                    y1={a.y1}
                    x2={a.x2}
                    y2={a.y2}
                    className={styles.aristaLinea}
                  />
                ))}
                {layout.nodos.map((n) => {
                  const left = n.x - n.ancho / 2;
                  return (
                    <g key={`nodo-${n.refKey}`}>
                      <rect
                        x={left}
                        y={n.y}
                        width={n.ancho}
                        height={n.alto}
                        rx={6}
                        className={n.camino ? styles.nodoRectCamino : styles.nodoRect}
                      />
                      {n.claves.map((c, j) => {
                        let claseCelda = styles.cellLabel;
                        if (resaltado && resaltado.clave === c) {
                          if (resaltado.tipo === 'nuevo') claseCelda = `${styles.cellLabel} ${styles.cellNuevo}`;
                          else if (resaltado.tipo === 'encontrado')
                            claseCelda = `${styles.cellLabel} ${styles.cellEncontrado}`;
                        }
                        return (
                          <g key={`celda-${n.refKey}-${c}`}>
                            {j > 0 && (
                              <line
                                x1={left + j * CELDA_W}
                                y1={n.y}
                                x2={left + j * CELDA_W}
                                y2={n.y + n.alto}
                                className={styles.cellSep}
                              />
                            )}
                            <text
                              x={left + j * CELDA_W + CELDA_W / 2}
                              y={n.y + n.alto / 2}
                              className={claseCelda}
                            >
                              {c}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          <div className={styles.infoLayout}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Número de claves</span>
              <span className={styles.infoValue}>{formatNumber(numClaves, 0)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Altura (niveles)</span>
              <span className={styles.infoValue}>{formatNumber(altura, 0)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Claves máx / mín por nodo</span>
              <span className={styles.infoValue}>
                {maxClaves(orden)} / {minClaves(orden)}
              </span>
            </div>
          </div>

          <div className={styles.inordenPanel}>
            <h3 className={styles.panelTitle} style={{ fontSize: '0.95rem' }}>
              Recorrido inorden (claves ordenadas)
            </h3>
            <div className={styles.inordenLista}>
              {recorrido.length === 0 ? '—' : recorrido.join('  ·  ')}
            </div>
          </div>
        </section>

        {/* Log de operaciones */}
        <div className={styles.opLog}>
          <div className={styles.opLogTitle}>Historial de operaciones ({logOps.length})</div>
          {logOps.length === 0 ? (
            <div className={styles.opLogEmpty}>
              Aún no hay operaciones. Prueba el ejemplo &ldquo;División de la raíz&rdquo; para ver
              cómo crece el árbol.
            </div>
          ) : (
            <ul className={styles.opLogList}>
              {logOps.slice(-18).map((r, idx) => (
                <li key={`log-${idx}-${r}`}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía del Árbol B y B+"
        subtitle="Inserción con división, borrado con fusión e índices de bases de datos"
      >
        <h3>Árbol binario (BST/AVL) vs Árbol B vs Árbol B+</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>BST / AVL</th>
                <th>Árbol B</th>
                <th>Árbol B+</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hijos por nodo</td>
                <td>Máximo 2</td>
                <td>Hasta m (orden)</td>
                <td>Hasta m (orden)</td>
              </tr>
              <tr>
                <td>Claves por nodo</td>
                <td>1</td>
                <td>Hasta m-1</td>
                <td>Hasta m-1</td>
              </tr>
              <tr>
                <td>Dónde están los datos</td>
                <td>En todos los nodos</td>
                <td>En todos los nodos</td>
                <td>Solo en las hojas</td>
              </tr>
              <tr>
                <td>Altura típica (1M elementos)</td>
                <td>~20 niveles</td>
                <td>3-4 niveles</td>
                <td>3-4 niveles</td>
              </tr>
              <tr>
                <td>Recorrido por rangos</td>
                <td>Inorden (recursivo)</td>
                <td>Inorden (recursivo)</td>
                <td>Hojas enlazadas (muy eficiente)</td>
              </tr>
              <tr>
                <td>Pensado para</td>
                <td>Datos en memoria RAM</td>
                <td>Datos en disco</td>
                <td>Índices de bases de datos</td>
              </tr>
              <tr>
                <td>Dónde se usa</td>
                <td>std::map, TreeMap</td>
                <td>Sistemas de archivos</td>
                <td>PostgreSQL, MySQL, Oracle</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗃️</span>
              <strong>Índices de bases de datos</strong>
            </div>
            <div className={styles.escenarioExample}>
              Cuando creas un índice sobre una columna (CREATE INDEX), el motor construye un árbol B+
              sobre sus valores. Por eso una consulta WHERE id = 12345 sobre millones de filas
              responde en milisegundos en lugar de recorrer toda la tabla.
            </div>
            <div className={styles.escenarioTip}>
              Tip: PostgreSQL, MySQL (InnoDB) y Oracle usan árboles B+ como índice por defecto.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">💾</span>
              <strong>Sistemas de archivos</strong>
            </div>
            <div className={styles.escenarioExample}>
              NTFS (Windows), HFS+ (macOS), ext4, Btrfs y XFS guardan los metadatos de directorios en
              árboles B o B+. Permiten localizar un archivo entre millones sin leer todo el disco.
            </div>
            <div className={styles.escenarioTip}>
              Tip: el nodo de un árbol B se dimensiona para coincidir con una página de disco (4 KB).
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔑</span>
              <strong>Almacenes clave-valor</strong>
            </div>
            <div className={styles.escenarioExample}>
              Bases de datos embebidas como SQLite o motores como LMDB usan árboles B/B+ para guardar
              pares clave-valor ordenados de forma persistente y con búsquedas por rango.
            </div>
            <div className={styles.escenarioTip}>
              Tip: si necesitas consultas por rango, un árbol B+ gana a una tabla hash, que no mantiene orden.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
              <strong>Consultas por rango y ordenación</strong>
            </div>
            <div className={styles.escenarioExample}>
              "Todos los pedidos entre dos fechas" o un ORDER BY se resuelven recorriendo las hojas
              enlazadas de un árbol B+, sin tener que reordenar los datos en cada consulta.
            </div>
            <div className={styles.escenarioTip}>
              Tip: esa lista enlazada de hojas es la diferencia clave entre B y B+.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué es el orden de un árbol B?</h4>
            <p>
              El orden m es el número máximo de hijos de un nodo. Un nodo guarda hasta m-1 claves y,
              salvo la raíz, al menos ceil(m/2)-1. En este simulador puedes elegir orden 3, 4 o 5 y
              ver cómo afecta a la anchura y la altura del árbol.
            </p>
            <p className={styles.faqTip}>
              En bases de datos reales el orden es de cientos, para que cada nodo llene una página de disco.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué todas las hojas están al mismo nivel?</h4>
            <p>
              Porque el árbol B nunca crece "hacia abajo" de forma desigual: solo gana altura cuando
              la raíz se divide, y esa división añade un nivel a todo el árbol a la vez. Así se
              garantiza que cualquier búsqueda recorre el mismo número de nodos.
            </p>
            <p className={styles.faqTip}>
              Carga el ejemplo &ldquo;Inserción secuencial 1-10&rdquo; y observa que el árbol se mantiene equilibrado.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre dividir, prestar y fusionar?</h4>
            <p>
              La división (split) ocurre al insertar cuando un nodo se pasa del máximo: la mediana
              sube al padre. Al borrar puede pasar lo contrario: si un nodo baja del mínimo, primero
              intenta pedir prestada una clave a un hermano (préstamo); si el hermano tampoco va
              sobrado, los dos nodos se fusionan en uno.
            </p>
            <p className={styles.faqTip}>
              Inserta hasta provocar divisiones y luego borra para ver préstamos y fusiones en el historial.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué no usar un árbol AVL en una base de datos?</h4>
            <p>
              Un AVL es binario: con un millón de claves tiene unos 20 niveles, y cada nivel podría
              ser una lectura de disco. Un árbol B agrupa cientos de claves por nodo, así que el mismo
              millón cabe en 3 o 4 niveles. Menos niveles equivale a muchísimos menos accesos a disco.
            </p>
            <p className={styles.faqTip}>
              La regla: en RAM importa el número de comparaciones; en disco importa el número de accesos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo se usa B+ en lugar de B?</h4>
            <p>
              Casi siempre que hay un índice de base de datos. En el árbol B+ los datos viven solo en
              las hojas, que además están enlazadas como una lista; esto hace que las consultas por
              rango y los recorridos ordenados sean muy rápidos. El árbol B clásico es más sencillo y
              didáctico, y es el que simula esta herramienta.
            </p>
            <p className={styles.faqTip}>
              Este simulador implementa el árbol B clásico; la tabla de arriba resume las diferencias con B+.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿El recorrido inorden devuelve las claves ordenadas?</h4>
            <p>
              Sí. Al igual que en un árbol binario de búsqueda, recorrer un árbol B en inorden
              (alternando hijos y claves de izquierda a derecha) produce todas las claves en orden
              creciente. Es lo que ves en el panel &ldquo;Recorrido inorden&rdquo;.
            </p>
            <p className={styles.faqTip}>
              Por eso un índice sirve también para acelerar un ORDER BY, no solo las búsquedas exactas.
            </p>
          </div>
        </div>

        <h3>Cómo Insertar a Mano en un Árbol B — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Baja hasta la hoja correcta</strong>
              <p>
                Desde la raíz, compara la clave nueva con las del nodo y elige el hijo entre dos
                claves consecutivas. Repite hasta llegar a una hoja: toda inserción empieza en una hoja.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Inserta la clave en orden dentro de la hoja</strong>
              <p>
                Coloca la clave en su posición ordenada dentro del nodo hoja. Si el nodo sigue dentro
                del máximo (m-1 claves), has terminado.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Si el nodo se desborda, divídelo</strong>
              <p>
                Cuando el nodo supera m-1 claves, identifica la clave central (mediana). Reparte el
                resto en dos nodos: las menores a la izquierda y las mayores a la derecha.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Sube la mediana al padre</strong>
              <p>
                La clave central asciende al nodo padre como separador entre los dos nodos nuevos. Si
                el padre también se desborda, repite la división hacia arriba.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Si se divide la raíz, el árbol crece</strong>
              <p>
                Cuando la división llega a la raíz, se crea una raíz nueva con la mediana y dos hijos.
                Es el único momento en que el árbol B aumenta su altura, y lo hace de forma equilibrada.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Compara el mismo input en distintos órdenes</strong>
            <p>
              Carga un ejemplo y cambia el orden de 3 a 5: verás que el árbol se vuelve más ancho y
              más bajo. Es la intuición clave de por qué en disco se usan órdenes altos.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💽</span>
            <strong>Piensa en nodos como páginas de disco</strong>
            <p>
              Cada nodo se diseña para llenar una página (4 KB). Por eso interesa meter muchas claves
              por nodo: una lectura de disco trae cientos de claves de golpe.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Provoca divisiones y luego borra</strong>
            <p>
              Inserta claves hasta que se divida la raíz y después elimina algunas: observarás
              préstamos entre hermanos y fusiones en el historial de operaciones.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <strong>Recuerda el mínimo de claves</strong>
            <p>
              Salvo la raíz, ningún nodo puede bajar de ceil(m/2)-1 claves. Esa cota inferior es lo
              que mantiene el árbol "lleno" y evita que degenere.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <strong>Para rangos, piensa en B+</strong>
            <p>
              Si tu consulta es "entre X e Y" o un ORDER BY, el árbol B+ con hojas enlazadas es la
              opción correcta. El árbol B clásico es mejor para entender el mecanismo base.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧮</span>
            <strong>Estima la altura con logaritmos</strong>
            <p>
              La altura de un árbol B es del orden de log base m de n. Subir el orden m reduce la
              altura mucho más rápido que en un árbol binario.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al implementar un árbol B</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Olvidar repartir también los hijos (no solo las claves) al dividir un nodo interno.</li>
            <li>Promover la mediana equivocada cuando el número de claves es par: define el criterio y sé consistente.</li>
            <li>No reequilibrar tras un borrado: dejar nodos por debajo del mínimo rompe las garantías del árbol.</li>
            <li>Intentar prestar de un hermano que ya está en el mínimo, en vez de fusionar.</li>
            <li>Confundir el árbol B con el B+: en B+ los datos solo están en las hojas.</li>
            <li>Permitir claves duplicadas sin una política clara, lo que genera índices inconsistentes.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-arboles-b')} />
      <ShareCard appName="simulador-arboles-b" />
      <Footer appName="simulador-arboles-b" />
    </div>
  );
}
