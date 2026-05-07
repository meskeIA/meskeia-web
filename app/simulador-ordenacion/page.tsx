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
import styles from './SimuladorOrdenacion.module.css';

type Algoritmo =
  | 'bubble'
  | 'selection'
  | 'insertion'
  | 'merge'
  | 'quick'
  | 'heap'
  | 'counting';

type EstadoBarra = 'normal' | 'comparando' | 'moviendo' | 'ordenada';

interface PasoOrden {
  array: number[];
  activos: number[];
  estados: EstadoBarra[];
  descripcion: string;
  comparaciones: number;
  intercambios: number;
}

interface InfoAlgoritmo {
  id: Algoritmo;
  nombre: string;
  complejidad: string;
}

const ALGORITMOS: InfoAlgoritmo[] = [
  { id: 'bubble', nombre: 'Bubble Sort', complejidad: 'O(n²)' },
  { id: 'selection', nombre: 'Selection Sort', complejidad: 'O(n²)' },
  { id: 'insertion', nombre: 'Insertion Sort', complejidad: 'O(n²)' },
  { id: 'merge', nombre: 'Merge Sort', complejidad: 'O(n log n)' },
  { id: 'quick', nombre: 'Quick Sort', complejidad: 'O(n log n) ~ O(n²)' },
  { id: 'heap', nombre: 'Heap Sort', complejidad: 'O(n log n)' },
  { id: 'counting', nombre: 'Counting Sort', complejidad: 'O(n + k)' },
];

const ALGORITMOS_COMPARATIVA: Algoritmo[] = ['bubble', 'insertion', 'merge', 'quick'];

// ----- Helpers de estado -----
function estadosBase(n: number): EstadoBarra[] {
  return new Array<EstadoBarra>(n).fill('normal');
}

function snapshot(
  array: number[],
  activos: number[],
  modo: 'comparando' | 'moviendo',
  ordenadas: number[],
  descripcion: string,
  comparaciones: number,
  intercambios: number,
): PasoOrden {
  const estados = estadosBase(array.length);
  for (const i of ordenadas) estados[i] = 'ordenada';
  for (const i of activos) estados[i] = modo;
  return {
    array: [...array],
    activos: [...activos],
    estados,
    descripcion,
    comparaciones,
    intercambios,
  };
}

function pasoFinal(array: number[], comparaciones: number, intercambios: number): PasoOrden {
  return {
    array: [...array],
    activos: [],
    estados: new Array<EstadoBarra>(array.length).fill('ordenada'),
    descripcion: 'Array completamente ordenado',
    comparaciones,
    intercambios,
  };
}

// ----- Algoritmos -----
function bubbleSort(arr: number[]): PasoOrden[] {
  const a = [...arr];
  const n = a.length;
  const pasos: PasoOrden[] = [];
  let comp = 0;
  let intc = 0;
  const ordenadas: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    let intercambioEnPasada = false;
    for (let j = 0; j < n - i - 1; j++) {
      comp++;
      pasos.push(
        snapshot(
          a,
          [j, j + 1],
          'comparando',
          ordenadas,
          `Comparar A[${j}]=${a[j]} con A[${j + 1}]=${a[j + 1]}`,
          comp,
          intc,
        ),
      );
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        intc++;
        intercambioEnPasada = true;
        pasos.push(
          snapshot(
            a,
            [j, j + 1],
            'moviendo',
            ordenadas,
            `Intercambiar A[${j}] y A[${j + 1}]`,
            comp,
            intc,
          ),
        );
      }
    }
    ordenadas.unshift(n - i - 1);
    if (!intercambioEnPasada) {
      for (let k = 0; k <= n - i - 2; k++) ordenadas.push(k);
      break;
    }
  }
  if (!ordenadas.includes(0)) ordenadas.push(0);
  pasos.push(pasoFinal(a, comp, intc));
  return pasos;
}

function selectionSort(arr: number[]): PasoOrden[] {
  const a = [...arr];
  const n = a.length;
  const pasos: PasoOrden[] = [];
  let comp = 0;
  let intc = 0;
  const ordenadas: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comp++;
      pasos.push(
        snapshot(
          a,
          [minIdx, j],
          'comparando',
          ordenadas,
          `Buscar mínimo: comparar A[${minIdx}]=${a[minIdx]} con A[${j}]=${a[j]}`,
          comp,
          intc,
        ),
      );
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      intc++;
      pasos.push(
        snapshot(
          a,
          [i, minIdx],
          'moviendo',
          ordenadas,
          `Mover mínimo a la posición ${i}`,
          comp,
          intc,
        ),
      );
    }
    ordenadas.push(i);
  }
  ordenadas.push(n - 1);
  pasos.push(pasoFinal(a, comp, intc));
  return pasos;
}

function insertionSort(arr: number[]): PasoOrden[] {
  const a = [...arr];
  const n = a.length;
  const pasos: PasoOrden[] = [];
  let comp = 0;
  let intc = 0;
  for (let i = 1; i < n; i++) {
    const valor = a[i];
    let j = i - 1;
    pasos.push(
      snapshot(
        a,
        [i],
        'comparando',
        [],
        `Tomar A[${i}]=${valor} para insertarlo en el subarray ordenado`,
        comp,
        intc,
      ),
    );
    while (j >= 0) {
      comp++;
      pasos.push(
        snapshot(
          a,
          [j, j + 1],
          'comparando',
          [],
          `Comparar A[${j}]=${a[j]} con valor=${valor}`,
          comp,
          intc,
        ),
      );
      if (a[j] > valor) {
        a[j + 1] = a[j];
        intc++;
        pasos.push(
          snapshot(
            a,
            [j, j + 1],
            'moviendo',
            [],
            `Desplazar A[${j}]=${a[j]} a la derecha`,
            comp,
            intc,
          ),
        );
        j--;
      } else {
        break;
      }
    }
    a[j + 1] = valor;
    if (j + 1 !== i) {
      intc++;
      pasos.push(
        snapshot(
          a,
          [j + 1],
          'moviendo',
          [],
          `Insertar valor=${valor} en la posición ${j + 1}`,
          comp,
          intc,
        ),
      );
    }
  }
  pasos.push(pasoFinal(a, comp, intc));
  return pasos;
}

function mergeSort(arr: number[]): PasoOrden[] {
  const a = [...arr];
  const pasos: PasoOrden[] = [];
  const contador = { comp: 0, intc: 0 };

  function merge(inicio: number, medio: number, fin: number): void {
    const izq = a.slice(inicio, medio + 1);
    const der = a.slice(medio + 1, fin + 1);
    let i = 0;
    let j = 0;
    let k = inicio;
    while (i < izq.length && j < der.length) {
      contador.comp++;
      pasos.push(
        snapshot(
          a,
          [inicio + i, medio + 1 + j],
          'comparando',
          [],
          `Mezclar: comparar ${izq[i]} (izq) con ${der[j]} (der)`,
          contador.comp,
          contador.intc,
        ),
      );
      if (izq[i] <= der[j]) {
        a[k] = izq[i];
        i++;
      } else {
        a[k] = der[j];
        j++;
      }
      contador.intc++;
      pasos.push(
        snapshot(
          a,
          [k],
          'moviendo',
          [],
          `Colocar ${a[k]} en la posición ${k}`,
          contador.comp,
          contador.intc,
        ),
      );
      k++;
    }
    while (i < izq.length) {
      a[k] = izq[i];
      contador.intc++;
      pasos.push(
        snapshot(
          a,
          [k],
          'moviendo',
          [],
          `Copiar resto de izquierda: ${a[k]} en posición ${k}`,
          contador.comp,
          contador.intc,
        ),
      );
      i++;
      k++;
    }
    while (j < der.length) {
      a[k] = der[j];
      contador.intc++;
      pasos.push(
        snapshot(
          a,
          [k],
          'moviendo',
          [],
          `Copiar resto de derecha: ${a[k]} en posición ${k}`,
          contador.comp,
          contador.intc,
        ),
      );
      j++;
      k++;
    }
  }

  function ms(inicio: number, fin: number): void {
    if (inicio >= fin) return;
    const medio = Math.floor((inicio + fin) / 2);
    pasos.push(
      snapshot(
        a,
        Array.from({ length: fin - inicio + 1 }, (_, idx) => inicio + idx),
        'comparando',
        [],
        `Dividir subarray [${inicio}..${fin}] en dos mitades`,
        contador.comp,
        contador.intc,
      ),
    );
    ms(inicio, medio);
    ms(medio + 1, fin);
    merge(inicio, medio, fin);
  }

  ms(0, a.length - 1);
  pasos.push(pasoFinal(a, contador.comp, contador.intc));
  return pasos;
}

function quickSort(arr: number[]): PasoOrden[] {
  const a = [...arr];
  const pasos: PasoOrden[] = [];
  const contador = { comp: 0, intc: 0 };

  function partition(inicio: number, fin: number): number {
    const pivote = a[fin];
    pasos.push(
      snapshot(
        a,
        [fin],
        'comparando',
        [],
        `Pivote elegido: A[${fin}]=${pivote}`,
        contador.comp,
        contador.intc,
      ),
    );
    let i = inicio - 1;
    for (let j = inicio; j < fin; j++) {
      contador.comp++;
      pasos.push(
        snapshot(
          a,
          [j, fin],
          'comparando',
          [],
          `Comparar A[${j}]=${a[j]} con pivote=${pivote}`,
          contador.comp,
          contador.intc,
        ),
      );
      if (a[j] < pivote) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          contador.intc++;
          pasos.push(
            snapshot(
              a,
              [i, j],
              'moviendo',
              [],
              `Intercambiar A[${i}] y A[${j}]`,
              contador.comp,
              contador.intc,
            ),
          );
        }
      }
    }
    if (i + 1 !== fin) {
      [a[i + 1], a[fin]] = [a[fin], a[i + 1]];
      contador.intc++;
      pasos.push(
        snapshot(
          a,
          [i + 1, fin],
          'moviendo',
          [],
          `Colocar pivote en su posición final: índice ${i + 1}`,
          contador.comp,
          contador.intc,
        ),
      );
    }
    return i + 1;
  }

  function qs(inicio: number, fin: number): void {
    if (inicio < fin) {
      const p = partition(inicio, fin);
      qs(inicio, p - 1);
      qs(p + 1, fin);
    }
  }

  qs(0, a.length - 1);
  pasos.push(pasoFinal(a, contador.comp, contador.intc));
  return pasos;
}

function heapSort(arr: number[]): PasoOrden[] {
  const a = [...arr];
  const n = a.length;
  const pasos: PasoOrden[] = [];
  let comp = 0;
  let intc = 0;
  const ordenadas: number[] = [];

  function heapify(tam: number, raiz: number): void {
    let mayor = raiz;
    const izq = 2 * raiz + 1;
    const der = 2 * raiz + 2;
    if (izq < tam) {
      comp++;
      pasos.push(
        snapshot(
          a,
          [mayor, izq],
          'comparando',
          ordenadas,
          `Heapify: comparar A[${mayor}]=${a[mayor]} con hijo izq A[${izq}]=${a[izq]}`,
          comp,
          intc,
        ),
      );
      if (a[izq] > a[mayor]) mayor = izq;
    }
    if (der < tam) {
      comp++;
      pasos.push(
        snapshot(
          a,
          [mayor, der],
          'comparando',
          ordenadas,
          `Heapify: comparar A[${mayor}]=${a[mayor]} con hijo der A[${der}]=${a[der]}`,
          comp,
          intc,
        ),
      );
      if (a[der] > a[mayor]) mayor = der;
    }
    if (mayor !== raiz) {
      [a[raiz], a[mayor]] = [a[mayor], a[raiz]];
      intc++;
      pasos.push(
        snapshot(
          a,
          [raiz, mayor],
          'moviendo',
          ordenadas,
          `Intercambiar A[${raiz}] y A[${mayor}] para mantener el heap`,
          comp,
          intc,
        ),
      );
      heapify(tam, mayor);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    intc++;
    pasos.push(
      snapshot(
        a,
        [0, i],
        'moviendo',
        ordenadas,
        `Extraer máximo: mover A[0]=${a[i]} al final (posición ${i})`,
        comp,
        intc,
      ),
    );
    ordenadas.push(i);
    heapify(i, 0);
  }
  ordenadas.push(0);
  pasos.push(pasoFinal(a, comp, intc));
  return pasos;
}

function countingSort(arr: number[]): PasoOrden[] {
  const a = [...arr];
  const n = a.length;
  const pasos: PasoOrden[] = [];
  let comp = 0;
  let intc = 0;

  if (n === 0) {
    pasos.push(pasoFinal(a, comp, intc));
    return pasos;
  }

  const min = Math.min(...a);
  const max = Math.max(...a);
  const rango = max - min + 1;
  const conteo = new Array<number>(rango).fill(0);

  for (let i = 0; i < n; i++) {
    comp++;
    conteo[a[i] - min]++;
    pasos.push(
      snapshot(
        a,
        [i],
        'comparando',
        [],
        `Contar: A[${i}]=${a[i]} → conteo[${a[i] - min}] = ${conteo[a[i] - min]}`,
        comp,
        intc,
      ),
    );
  }

  let idx = 0;
  for (let v = 0; v < rango; v++) {
    while (conteo[v] > 0) {
      a[idx] = v + min;
      intc++;
      pasos.push(
        snapshot(
          a,
          [idx],
          'moviendo',
          [],
          `Reconstruir: colocar ${v + min} en la posición ${idx}`,
          comp,
          intc,
        ),
      );
      idx++;
      conteo[v]--;
    }
  }

  pasos.push(pasoFinal(a, comp, intc));
  return pasos;
}

function ejecutarAlgoritmo(alg: Algoritmo, arr: number[]): PasoOrden[] {
  switch (alg) {
    case 'bubble':
      return bubbleSort(arr);
    case 'selection':
      return selectionSort(arr);
    case 'insertion':
      return insertionSort(arr);
    case 'merge':
      return mergeSort(arr);
    case 'quick':
      return quickSort(arr);
    case 'heap':
      return heapSort(arr);
    case 'counting':
      return countingSort(arr);
  }
}

// ----- Helpers de presets -----
function generarAleatorio(n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(Math.floor(Math.random() * 99) + 1);
  }
  return out;
}

function generarCasiOrdenado(n: number): number[] {
  const out = Array.from({ length: n }, (_, i) => (i + 1) * 5);
  const swaps = Math.max(1, Math.floor(n * 0.1));
  for (let s = 0; s < swaps; s++) {
    const i = Math.floor(Math.random() * n);
    const j = Math.floor(Math.random() * n);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function generarInverso(n: number): number[] {
  return Array.from({ length: n }, (_, i) => (n - i) * 5);
}

function generarConDuplicados(n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(Math.floor(Math.random() * 8) * 10 + 10);
  }
  return out;
}

// ----- Componente principal -----
export default function SimuladorOrdenacion() {
  const [arrayTexto, setArrayTexto] = useState<string>('64, 34, 25, 12, 22, 11, 90, 50, 30, 18');
  const [algoritmo, setAlgoritmo] = useState<Algoritmo>('bubble');
  const [comparativa, setComparativa] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(400);
  const [reproduciendo, setReproduciendo] = useState<boolean>(false);
  const [pasos, setPasos] = useState<PasoOrden[]>([]);
  const [indicePaso, setIndicePaso] = useState<number>(0);
  const [pasosComparativa, setPasosComparativa] = useState<Record<Algoritmo, PasoOrden[]>>({
    bubble: [],
    selection: [],
    insertion: [],
    merge: [],
    quick: [],
    heap: [],
    counting: [],
  });
  const [progresoComparativa, setProgresoComparativa] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { arrayValido, errorArray } = useMemo(() => {
    const partes = arrayTexto
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (partes.length < 2) {
      return { arrayValido: null as number[] | null, errorArray: 'Introduce al menos 2 números separados por comas' };
    }
    if (partes.length > 30) {
      return { arrayValido: null as number[] | null, errorArray: 'Máximo 30 elementos para una visualización clara' };
    }
    const nums: number[] = [];
    for (const p of partes) {
      const n = Number(p.replace(',', '.'));
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        return { arrayValido: null as number[] | null, errorArray: `"${p}" no es un entero válido` };
      }
      nums.push(n);
    }
    return { arrayValido: nums, errorArray: '' };
  }, [arrayTexto]);

  const detenerReproduccion = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setReproduciendo(false);
  }, []);

  const generarPasos = useCallback(() => {
    detenerReproduccion();
    if (!arrayValido) return;
    if (comparativa) {
      const dict: Record<Algoritmo, PasoOrden[]> = {
        bubble: [],
        selection: [],
        insertion: [],
        merge: [],
        quick: [],
        heap: [],
        counting: [],
      };
      for (const alg of ALGORITMOS_COMPARATIVA) {
        dict[alg] = ejecutarAlgoritmo(alg, arrayValido);
      }
      setPasosComparativa(dict);
      setProgresoComparativa(0);
    } else {
      const ps = ejecutarAlgoritmo(algoritmo, arrayValido);
      setPasos(ps);
      setIndicePaso(0);
    }
  }, [arrayValido, algoritmo, comparativa, detenerReproduccion]);

  // Generar pasos automáticamente al cambiar algoritmo, modo o array
  useEffect(() => {
    generarPasos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algoritmo, comparativa, arrayTexto]);

  const iniciarReproduccion = useCallback(() => {
    if (comparativa) {
      const max = Math.max(
        ...ALGORITMOS_COMPARATIVA.map((alg) => pasosComparativa[alg].length),
        1,
      );
      if (progresoComparativa >= max - 1) setProgresoComparativa(0);
      setReproduciendo(true);
      intervalRef.current = setInterval(() => {
        setProgresoComparativa((p) => {
          if (p >= max - 1) {
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            setReproduciendo(false);
            return max - 1;
          }
          return p + 1;
        });
      }, velocidad);
      return;
    }
    if (pasos.length === 0) return;
    if (indicePaso >= pasos.length - 1) setIndicePaso(0);
    setReproduciendo(true);
    intervalRef.current = setInterval(() => {
      setIndicePaso((i) => {
        if (i >= pasos.length - 1) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setReproduciendo(false);
          return pasos.length - 1;
        }
        return i + 1;
      });
    }, velocidad);
  }, [comparativa, pasos, indicePaso, pasosComparativa, progresoComparativa, velocidad]);

  const pasoSiguiente = useCallback(() => {
    detenerReproduccion();
    if (comparativa) {
      const max = Math.max(
        ...ALGORITMOS_COMPARATIVA.map((alg) => pasosComparativa[alg].length),
        1,
      );
      setProgresoComparativa((p) => Math.min(p + 1, max - 1));
    } else {
      setIndicePaso((i) => Math.min(i + 1, pasos.length - 1));
    }
  }, [comparativa, pasos.length, pasosComparativa, detenerReproduccion]);

  const reiniciar = useCallback(() => {
    detenerReproduccion();
    setIndicePaso(0);
    setProgresoComparativa(0);
  }, [detenerReproduccion]);

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  const aplicarPreset = (tipo: 'aleatorio10' | 'aleatorio20' | 'casi' | 'inverso' | 'duplicados') => {
    let nuevo: number[] = [];
    if (tipo === 'aleatorio10') nuevo = generarAleatorio(10);
    else if (tipo === 'aleatorio20') nuevo = generarAleatorio(20);
    else if (tipo === 'casi') nuevo = generarCasiOrdenado(12);
    else if (tipo === 'inverso') nuevo = generarInverso(12);
    else nuevo = generarConDuplicados(12);
    setArrayTexto(nuevo.join(', '));
  };

  const pasoActual: PasoOrden | null = useMemo(() => {
    if (comparativa) return null;
    if (pasos.length === 0) return null;
    return pasos[Math.min(indicePaso, pasos.length - 1)];
  }, [comparativa, pasos, indicePaso]);

  const algoritmoInfo = ALGORITMOS.find((a) => a.id === algoritmo) ?? ALGORITMOS[0];
  const totalPasos = pasos.length;
  const progresoPct =
    totalPasos > 1 ? Math.round(((indicePaso + 1) / totalPasos) * 100) : 0;

  const renderBarras = (paso: PasoOrden | null, alto: number = 280, conLabel: boolean = true) => {
    if (!paso) return null;
    const arr = paso.array;
    const n = arr.length;
    if (n === 0) return null;
    const maxVal = Math.max(...arr.map((v) => Math.abs(v)), 1);
    const minVal = Math.min(...arr, 0);
    const offset = minVal < 0 ? Math.abs(minVal) : 0;
    const escalaTotal = maxVal + offset || 1;
    const padding = 10;
    const ancho = 100;
    const anchoBarra = (ancho - padding) / n;
    const altoLabel = conLabel ? 18 : 0;
    const altoBarras = alto - altoLabel - 4;

    return (
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        preserveAspectRatio="none"
        className={conLabel ? styles.barsSvg : styles.miniBars}
        aria-label="Visualización de barras del array"
      >
        {arr.map((v, i) => {
          const altoBarra = ((Math.abs(v) + offset) / escalaTotal) * altoBarras;
          const x = padding / 2 + i * anchoBarra;
          const y = altoBarras - altoBarra;
          const estado = paso.estados[i] || 'normal';
          const claseEstado =
            estado === 'comparando'
              ? styles.barComparando
              : estado === 'moviendo'
                ? styles.barMoviendo
                : estado === 'ordenada'
                  ? styles.barOrdenada
                  : styles.barNormal;
          return (
            <g key={i}>
              <rect
                className={`${styles.bar} ${claseEstado}`}
                x={x + 0.5}
                y={y}
                width={Math.max(anchoBarra - 1, 0.5)}
                height={Math.max(altoBarra, 0.5)}
                rx="0.4"
              />
              {conLabel && n <= 20 && (
                <text
                  className={styles.barLabel}
                  x={x + anchoBarra / 2}
                  y={alto - 4}
                  fontSize="3"
                >
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Algoritmos de Ordenación</h1>
        <p className={styles.subtitle}>
          Bubble, Quick, Merge, Heap... paso a paso con tu propio array
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de algoritmo */}
        <div className={styles.algoritmoSelector} role="tablist" aria-label="Selector de algoritmo">
          {ALGORITMOS.map((alg) => (
            <button
              key={alg.id}
              type="button"
              role="tab"
              aria-selected={algoritmo === alg.id}
              className={`${styles.algoritmoBtn} ${algoritmo === alg.id && !comparativa ? styles.algoritmoActive : ''}`}
              onClick={() => {
                setComparativa(false);
                setAlgoritmo(alg.id);
              }}
              disabled={comparativa}
            >
              {alg.nombre}
            </button>
          ))}
        </div>

        {/* Toggle comparativa */}
        <div className={styles.compareToggleRow}>
          <button
            type="button"
            className={`${styles.compareToggle} ${comparativa ? styles.compareToggleActive : ''}`}
            onClick={() => setComparativa((c) => !c)}
            aria-pressed={comparativa}
          >
            {comparativa ? '✓ ' : ''}Comparar 4 algoritmos a la vez
          </button>
        </div>

        {/* Input del array */}
        <div className={styles.inputBlock}>
          <label htmlFor="arrayInput">Array (números enteros separados por comas, 2-30 elementos)</label>
          <textarea
            id="arrayInput"
            className={styles.arrayInput}
            value={arrayTexto}
            onChange={(e) => setArrayTexto(e.target.value)}
            rows={2}
            spellCheck={false}
            aria-describedby="arrayError"
          />
          {errorArray && (
            <div id="arrayError" className={styles.arrayError} role="alert">
              {errorArray}
            </div>
          )}
          <div className={styles.presetGrid}>
            <button type="button" className={styles.presetBtn} onClick={() => aplicarPreset('aleatorio10')}>
              Aleatorio (10)
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => aplicarPreset('aleatorio20')}>
              Aleatorio (20)
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => aplicarPreset('casi')}>
              Casi ordenado
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => aplicarPreset('inverso')}>
              Inverso
            </button>
            <button type="button" className={styles.presetBtn} onClick={() => aplicarPreset('duplicados')}>
              Con duplicados
            </button>
          </div>
        </div>

        {/* Velocidad */}
        <div className={styles.speedRow}>
          <label htmlFor="speed" className={styles.speedLabel}>
            Velocidad por paso
          </label>
          <input
            id="speed"
            type="range"
            min={50}
            max={2000}
            step={50}
            value={velocidad}
            onChange={(e) => setVelocidad(Number(e.target.value))}
            className={styles.speedSlider}
          />
          <span className={styles.speedValue}>{velocidad} ms</span>
        </div>

        {/* Controles */}
        <div className={styles.controlBar}>
          <button
            type="button"
            className={styles.playBtn}
            onClick={reproduciendo ? detenerReproduccion : iniciarReproduccion}
            disabled={!arrayValido}
          >
            {reproduciendo ? '⏸ Pausar' : '▶ Iniciar'}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={pasoSiguiente}
            disabled={!arrayValido || reproduciendo}
          >
            Paso siguiente →
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={reiniciar}
            disabled={!arrayValido}
          >
            ↻ Reiniciar
          </button>
        </div>

        {/* Visualización */}
        {!comparativa && pasoActual && (
          <>
            <div className={styles.barsContainer}>{renderBarras(pasoActual, 280, true)}</div>

            <div className={styles.operacionLabel} role="status" aria-live="polite">
              {pasoActual.descripcion}
            </div>

            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Comparaciones</div>
                <div className={styles.metricValue}>{formatNumber(pasoActual.comparaciones, 0)}</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Intercambios</div>
                <div className={styles.metricValue}>{formatNumber(pasoActual.intercambios, 0)}</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Paso</div>
                <div className={styles.metricValue}>
                  {formatNumber(indicePaso + 1, 0)} / {formatNumber(totalPasos, 0)}
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Progreso</div>
                <div className={styles.metricValue}>{progresoPct}%</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Complejidad</div>
                <div>
                  <span className={styles.complejidadBadge}>{algoritmoInfo.complejidad}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Comparativa */}
        {comparativa && (
          <div className={styles.compareGrid}>
            {ALGORITMOS_COMPARATIVA.map((alg) => {
              const ps = pasosComparativa[alg];
              if (ps.length === 0) return null;
              const idx = Math.min(progresoComparativa, ps.length - 1);
              const paso = ps[idx];
              const info = ALGORITMOS.find((a) => a.id === alg);
              return (
                <div key={alg} className={styles.compareCard}>
                  <h3 className={styles.compareTitle}>{info?.nombre ?? alg}</h3>
                  {renderBarras(paso, 110, false)}
                  <div className={styles.compareStats}>
                    <span>
                      Comp: <strong>{formatNumber(paso.comparaciones, 0)}</strong>
                    </span>
                    <span>
                      Mov: <strong>{formatNumber(paso.intercambios, 0)}</strong>
                    </span>
                    <span>
                      Paso: <strong>{formatNumber(idx + 1, 0)}/{formatNumber(ps.length, 0)}</strong>
                    </span>
                    <span>
                      <span className={styles.complejidadBadge}>{info?.complejidad}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <EducationalSection
        title="Guía de Algoritmos de Ordenación"
        subtitle="Complejidad, estabilidad y casos de uso"
      >
        <p className={styles.introParagraph}>
          La ordenación es uno de los problemas más estudiados en informática. No existe un algoritmo
          universalmente mejor: la mejor opción depende del tamaño del array, si está parcialmente ordenado,
          si hay duplicados, si la memoria es limitada y si necesitas estabilidad. Este simulador te
          ayuda a entender por qué un mismo array puede requerir 45 comparaciones con Bubble Sort y solo
          18 con Merge Sort.
        </p>

        <h3>Comparativa de los 7 Algoritmos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Algoritmo</th>
                <th>Mejor</th>
                <th>Promedio</th>
                <th>Peor</th>
                <th>Espacio</th>
                <th>Estable</th>
                <th>Cuándo usar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Bubble Sort</strong></td>
                <td>O(n)</td>
                <td>O(n²)</td>
                <td>O(n²)</td>
                <td>O(1)</td>
                <td>Sí</td>
                <td>Solo enseñanza, datos pequeños</td>
              </tr>
              <tr>
                <td><strong>Selection Sort</strong></td>
                <td>O(n²)</td>
                <td>O(n²)</td>
                <td>O(n²)</td>
                <td>O(1)</td>
                <td>No</td>
                <td>Cuando minimizar movimientos importa</td>
              </tr>
              <tr>
                <td><strong>Insertion Sort</strong></td>
                <td>O(n)</td>
                <td>O(n²)</td>
                <td>O(n²)</td>
                <td>O(1)</td>
                <td>Sí</td>
                <td>Arrays pequeños o casi ordenados</td>
              </tr>
              <tr>
                <td><strong>Merge Sort</strong></td>
                <td>O(n log n)</td>
                <td>O(n log n)</td>
                <td>O(n log n)</td>
                <td>O(n)</td>
                <td>Sí</td>
                <td>Necesitas estabilidad y peor caso garantizado</td>
              </tr>
              <tr>
                <td><strong>Quick Sort</strong></td>
                <td>O(n log n)</td>
                <td>O(n log n)</td>
                <td>O(n²)</td>
                <td>O(log n)</td>
                <td>No</td>
                <td>Datos generales en memoria, rápido en promedio</td>
              </tr>
              <tr>
                <td><strong>Heap Sort</strong></td>
                <td>O(n log n)</td>
                <td>O(n log n)</td>
                <td>O(n log n)</td>
                <td>O(1)</td>
                <td>No</td>
                <td>Memoria limitada y peor caso garantizado</td>
              </tr>
              <tr>
                <td><strong>Counting Sort</strong></td>
                <td>O(n + k)</td>
                <td>O(n + k)</td>
                <td>O(n + k)</td>
                <td>O(k)</td>
                <td>Sí</td>
                <td>Enteros con rango k pequeño</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📚</span>
              <strong>Ordenar libros por título</strong>
            </div>
            <p className={styles.escenarioExample}>
              Una biblioteca con 50.000 libros recibe un pedido de reordenación alfabética. Si los datos
              ya estaban casi ordenados (los libros nuevos van al final), Insertion Sort termina en O(n).
              Si están totalmente revueltos, Merge Sort es la opción profesional: O(n log n) garantizado y
              estable (útil para mantener el orden secundario por autor).
            </p>
            <div className={styles.escenarioTip}>
              Recomendado: Insertion Sort si está casi ordenado, Merge Sort en caso general.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎮</span>
              <strong>Ranking en videojuego</strong>
            </div>
            <p className={styles.escenarioExample}>
              Mostrar el top 10 de jugadores de los últimos 5 minutos entre 100.000 partidas activas. Si
              solo te interesa el top-K, Heap Sort permite extraer los K mayores en O(n + k log n),
              evitando ordenar todo el conjunto.
            </p>
            <div className={styles.escenarioTip}>
              Recomendado: Heap (priority queue) cuando solo necesitas top-K, no orden completo.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏥</span>
              <strong>Histograma de edades</strong>
            </div>
            <p className={styles.escenarioExample}>
              Ordenar 10 millones de edades de pacientes (rango 0-120). Como el rango k es pequeño respecto
              a n, Counting Sort es ideal: O(n + k) lineal. Quick Sort necesitaría ~230 millones de
              operaciones; Counting Sort apenas 10 millones más 120.
            </p>
            <div className={styles.escenarioTip}>
              Recomendado: Counting Sort cuando los valores son enteros con rango acotado.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>💾</span>
              <strong>Sistema embebido sin RAM extra</strong>
            </div>
            <p className={styles.escenarioExample}>
              En un microcontrolador con 8 KB de RAM, no puedes permitirte el array auxiliar de Merge Sort.
              Heap Sort ordena en sitio (O(1) extra) y garantiza O(n log n) incluso en el peor caso —algo
              que Quick Sort no asegura sin pivote aleatorio.
            </p>
            <div className={styles.escenarioTip}>
              Recomendado: Heap Sort cuando la memoria es crítica y necesitas garantía de rendimiento.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay realmente entre O(n²) y O(n log n)?</h4>
            <p>
              Para n = 1.000: O(n²) son 1 millón de operaciones, O(n log n) son ~10.000. Para n = 1.000.000:
              O(n²) es 1 billón (~30 minutos), O(n log n) son ~20 millones (~1 segundo). La diferencia
              crece exponencialmente con el tamaño.
            </p>
            <p className={styles.faqTip}>
              Por eso Bubble es útil para enseñar pero nadie lo usa en producción con miles de elementos.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Qué significa que un algoritmo sea estable?</h4>
            <p>
              Un algoritmo es estable si elementos con la misma clave conservan su orden relativo original.
              Si tienes una lista ordenada por nombre y la reordenas por edad con un algoritmo estable, los
              de la misma edad seguirán por orden alfabético.
            </p>
            <p className={styles.faqTip}>
              Estables: Bubble, Insertion, Merge, Counting. No estables: Selection, Quick, Heap.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Cuándo Quick Sort es peor que Bubble?</h4>
            <p>
              Cuando el pivote elegido es siempre el peor (mín o máx), Quick degenera a O(n²) y con n
              pequeño puede ser más lento que Insertion. Por eso las implementaciones reales usan pivote
              aleatorio o mediana de tres.
            </p>
            <p className={styles.faqTip}>
              Prueba el preset "Inverso" con Quick Sort para ver el peor caso clásico.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Por qué Merge Sort necesita memoria extra?</h4>
            <p>
              Para fusionar dos mitades ordenadas necesita un array auxiliar del mismo tamaño que el
              original. Esto suma O(n) de espacio. Heap Sort y Quick Sort lo hacen en sitio (O(1) y O(log n)
              respectivamente).
            </p>
            <p className={styles.faqTip}>
              En entornos con memoria limitada (sistemas embebidos), Heap Sort suele ser preferible.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Counting Sort es realmente lineal?</h4>
            <p>
              Sí, pero con una trampa: depende del rango k de valores. Si k = 100 y n = 1.000.000, es
              brutalmente rápido. Si k = 10.000.000.000 y n = 100, es absurdamente lento. La complejidad
              real es O(n + k), no solo O(n).
            </p>
            <p className={styles.faqTip}>
              Útil para edades, notas, días del mes... no para precios o IDs grandes.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Qué algoritmo usan Python, Java o JavaScript internamente?</h4>
            <p>
              Python y Java usan <code>Timsort</code>, un híbrido de Merge e Insertion optimizado para
              datos del mundo real (que suelen tener subsecuencias ordenadas). V8 de Chrome también
              cambió a Timsort en 2018. C++ usa Introsort (Quick + Heap + Insertion según el caso).
            </p>
            <p className={styles.faqTip}>
              En la práctica nunca implementarás un sort básico: usarás <code>arr.sort()</code> y confiarás
              en el optimizado por la librería estándar.
            </p>
          </div>
        </div>

        <h3>Cómo Elegir el Algoritmo Adecuado — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Estima el tamaño del array (n)</strong>
              <p>
                Si n &lt; 50, casi cualquier algoritmo es aceptable. Si n &gt; 10.000, descarta los O(n²)
                automáticamente.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>¿Está casi ordenado?</strong>
              <p>
                Si los datos llegan ya parcialmente ordenados (logs por fecha, datos incrementales),
                Insertion Sort es O(n) y supera a Merge en estos casos.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>¿Necesitas estabilidad?</strong>
              <p>
                Si vas a ordenar por múltiples claves en sucesión (primero por nombre, luego por edad),
                necesitas un algoritmo estable: Merge, Insertion o Counting.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>¿Tienes memoria limitada?</strong>
              <p>
                Si no puedes permitirte O(n) de espacio extra (sistemas embebidos), descarta Merge. Heap
                ordena en sitio garantizando O(n log n).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>¿Son enteros con rango pequeño?</strong>
              <p>
                Si los valores son enteros y el rango k es comparable a n (edades, notas, días), Counting
                Sort es lineal y supera a cualquier comparativo.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <strong>Usa el sort de la librería</strong>
            <p>
              En código real usa <code>Array.sort()</code>, <code>Collections.sort()</code> o
              <code>std::sort()</code>. Están optimizadas y son híbridas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📏</span>
            <strong>Mide antes de optimizar</strong>
            <p>
              Para arrays pequeños (n &lt; 50), las diferencias son irrelevantes. No optimices algo que
              no es cuello de botella.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎲</span>
            <strong>Quick Sort: aleatoriza el pivote</strong>
            <p>
              Si implementas Quick Sort, usa un pivote aleatorio o mediana de tres. Evita el peor caso
              cuadrático en arrays casi ordenados.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🧊</span>
            <strong>Estabilidad importa más de lo que crees</strong>
            <p>
              Si ordenas tablas multi-criterio, la estabilidad es clave. Merge Sort &gt; Quick Sort para
              ordenar por varias columnas en sucesión.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📦</span>
            <strong>Para datasets enormes: External Sort</strong>
            <p>
              Si el array no cabe en memoria (terabytes), ningún algoritmo en sitio funciona. Necesitas
              external merge sort con archivos temporales en disco.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔬</span>
            <strong>Conoce los presets clásicos</strong>
            <p>
              Probar tu algoritmo con array inverso, casi ordenado y con duplicados revela
              comportamientos que un array aleatorio oculta.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes al elegir o implementar un algoritmo de ordenación</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              Implementar Bubble Sort en producción porque «se entiende mejor»: con n = 100.000 puede
              tardar minutos, cuando Quick Sort tarda milisegundos.
            </li>
            <li>
              Usar Quick Sort sin aleatorización del pivote: en datos ya ordenados degenera a O(n²) y
              puede provocar stack overflow por recursión profunda.
            </li>
            <li>
              Asumir que un sort de librería es estable: <code>Array.sort()</code> en JavaScript es
              estable desde 2019 (V8), pero <code>Arrays.sort()</code> de int[] en Java NO lo es.
            </li>
            <li>
              Aplicar Counting Sort con rango k enorme: ordenar IDs de 1 a 10.000 millones consume más
              memoria que el universo. Solo sirve si k es comparable a n.
            </li>
            <li>
              Reinventar la rueda: salvo en entrevistas o ejercicios académicos, escribir tu propio sort
              en producción es casi siempre una mala idea.
            </li>
            <li>
              Confundir estabilidad con orden: un sort puede ordenar correctamente y NO ser estable. Solo
              importa cuando hay claves duplicadas y el orden secundario es relevante.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-ordenacion')} />

      <ShareCard appName="simulador-ordenacion" />

      <Footer appName="simulador-ordenacion" />
    </div>
  );
}
