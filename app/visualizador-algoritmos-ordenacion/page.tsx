'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AlgoritmosOrdenacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Algoritmo = 'burbuja' | 'insercion' | 'seleccion' | 'quicksort' | 'mergesort';
type Tab = 'visualizador' | 'como-funciona' | 'big-o' | 'cuando-usar';

interface PasoVisualizacion {
  array: number[];
  comparando: [number, number] | null;
  intercambiando: [number, number] | null;
  ordenados: number[];
  descripcion: string;
}

// ─── Generadores de pasos ─────────────────────────────────────────────────────

function generarPasosBurbuja(arr: number[]): PasoVisualizacion[] {
  const pasos: PasoVisualizacion[] = [];
  const a = [...arr];
  const ordenados: number[] = [];

  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      pasos.push({
        array: [...a],
        comparando: [j, j + 1],
        intercambiando: null,
        ordenados: [...ordenados],
        descripcion: `Comparando a[${j}]=${a[j]} con a[${j + 1}]=${a[j + 1]}`,
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        pasos.push({
          array: [...a],
          comparando: null,
          intercambiando: [j, j + 1],
          ordenados: [...ordenados],
          descripcion: `Intercambiando: el mayor sube a la derecha`,
        });
      }
    }
    ordenados.push(a.length - 1 - i);
  }
  ordenados.push(0);
  pasos.push({
    array: [...a],
    comparando: null,
    intercambiando: null,
    ordenados: [...ordenados],
    descripcion: '¡Array ordenado!',
  });
  return pasos;
}

function generarPasosInsercion(arr: number[]): PasoVisualizacion[] {
  const pasos: PasoVisualizacion[] = [];
  const a = [...arr];
  const ordenados: number[] = [0];

  for (let i = 1; i < a.length; i++) {
    let j = i;
    pasos.push({
      array: [...a],
      comparando: [j, j - 1],
      intercambiando: null,
      ordenados: [...ordenados],
      descripcion: `Insertando a[${i}]=${a[i]} en la posición correcta`,
    });
    while (j > 0 && a[j] < a[j - 1]) {
      [a[j], a[j - 1]] = [a[j - 1], a[j]];
      pasos.push({
        array: [...a],
        comparando: null,
        intercambiando: [j, j - 1],
        ordenados: [...ordenados],
        descripcion: `Moviendo ${a[j - 1]} a la izquierda`,
      });
      j--;
    }
    ordenados.push(i);
  }
  pasos.push({
    array: [...a],
    comparando: null,
    intercambiando: null,
    ordenados: a.map((_, i) => i),
    descripcion: '¡Array ordenado!',
  });
  return pasos;
}

function generarPasosSeleccion(arr: number[]): PasoVisualizacion[] {
  const pasos: PasoVisualizacion[] = [];
  const a = [...arr];
  const ordenados: number[] = [];

  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      pasos.push({
        array: [...a],
        comparando: [minIdx, j],
        intercambiando: null,
        ordenados: [...ordenados],
        descripcion: `Buscando mínimo: comparando a[${minIdx}]=${a[minIdx]} con a[${j}]=${a[j]}`,
      });
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      pasos.push({
        array: [...a],
        comparando: null,
        intercambiando: [i, minIdx],
        ordenados: [...ordenados],
        descripcion: `Mínimo encontrado: colocando ${a[i]} en posición ${i}`,
      });
    }
    ordenados.push(i);
  }
  ordenados.push(a.length - 1);
  pasos.push({
    array: [...a],
    comparando: null,
    intercambiando: null,
    ordenados: [...ordenados],
    descripcion: '¡Array ordenado!',
  });
  return pasos;
}

function generarPasosQuicksort(arr: number[]): PasoVisualizacion[] {
  const pasos: PasoVisualizacion[] = [];
  const a = [...arr];
  const ordenados: number[] = [];

  function partition(low: number, high: number): number {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      pasos.push({
        array: [...a],
        comparando: [j, high],
        intercambiando: null,
        ordenados: [...ordenados],
        descripcion: `Pivote=${pivot}: comparando a[${j}]=${a[j]} con pivote`,
      });
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          pasos.push({
            array: [...a],
            comparando: null,
            intercambiando: [i, j],
            ordenados: [...ordenados],
            descripcion: `Intercambiando a[${i}]=${a[j]} y a[${j}]=${a[i]}`,
          });
        }
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    pasos.push({
      array: [...a],
      comparando: null,
      intercambiando: [i + 1, high],
      ordenados: [...ordenados],
      descripcion: `Pivote ${pivot} en posición final ${i + 1}`,
    });
    ordenados.push(i + 1);
    return i + 1;
  }

  function quicksort(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      quicksort(low, pi - 1);
      quicksort(pi + 1, high);
    } else if (low === high) {
      ordenados.push(low);
    }
  }

  quicksort(0, a.length - 1);
  pasos.push({
    array: [...a],
    comparando: null,
    intercambiando: null,
    ordenados: a.map((_, i) => i),
    descripcion: '¡Array ordenado!',
  });
  return pasos;
}

function generarPasosMergesort(arr: number[]): PasoVisualizacion[] {
  const pasos: PasoVisualizacion[] = [];
  const a = [...arr];
  const ordenados: number[] = [];

  function merge(left: number, mid: number, right: number): void {
    const izq = a.slice(left, mid + 1);
    const der = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < izq.length && j < der.length) {
      pasos.push({
        array: [...a],
        comparando: [left + i, mid + 1 + j],
        intercambiando: null,
        ordenados: [...ordenados],
        descripcion: `Mergeando: comparando ${izq[i]} (izq) con ${der[j]} (der)`,
      });
      if (izq[i] <= der[j]) {
        a[k] = izq[i];
        i++;
      } else {
        a[k] = der[j];
        j++;
      }
      pasos.push({
        array: [...a],
        comparando: null,
        intercambiando: [k, k],
        ordenados: [...ordenados],
        descripcion: `Colocando ${a[k]} en posición ${k}`,
      });
      k++;
    }
    while (i < izq.length) {
      a[k] = izq[i];
      pasos.push({
        array: [...a],
        comparando: null,
        intercambiando: [k, k],
        ordenados: [...ordenados],
        descripcion: `Copiando restante ${a[k]} en posición ${k}`,
      });
      i++;
      k++;
    }
    while (j < der.length) {
      a[k] = der[j];
      pasos.push({
        array: [...a],
        comparando: null,
        intercambiando: [k, k],
        ordenados: [...ordenados],
        descripcion: `Copiando restante ${a[k]} en posición ${k}`,
      });
      j++;
      k++;
    }
    for (let x = left; x <= right; x++) {
      ordenados.push(x);
    }
  }

  function mergesort(left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergesort(left, mid);
      mergesort(mid + 1, right);
      merge(left, mid, right);
    }
  }

  mergesort(0, a.length - 1);
  pasos.push({
    array: [...a],
    comparando: null,
    intercambiando: null,
    ordenados: a.map((_, i) => i),
    descripcion: '¡Array ordenado!',
  });
  return pasos;
}

function generarPasos(algoritmo: Algoritmo, arr: number[]): PasoVisualizacion[] {
  switch (algoritmo) {
    case 'burbuja': return generarPasosBurbuja(arr);
    case 'insercion': return generarPasosInsercion(arr);
    case 'seleccion': return generarPasosSeleccion(arr);
    case 'quicksort': return generarPasosQuicksort(arr);
    case 'mergesort': return generarPasosMergesort(arr);
  }
}

// ─── Componente de barras ─────────────────────────────────────────────────────

function VisualizadorBarras({ paso }: { paso: PasoVisualizacion }) {
  const max = Math.max(...paso.array);
  return (
    <div
      className={styles.barrasContainer}
      role="img"
      aria-label="Visualización del algoritmo de ordenación"
    >
      {paso.array.map((val, idx) => {
        let colorClass = styles.barraNormal;
        if (paso.comparando && (paso.comparando[0] === idx || paso.comparando[1] === idx)) {
          colorClass = styles.barraComparando;
        }
        if (paso.intercambiando && (paso.intercambiando[0] === idx || paso.intercambiando[1] === idx)) {
          colorClass = styles.barraIntercambiando;
        }
        if (paso.ordenados.includes(idx)) {
          colorClass = styles.barraOrdenada;
        }
        return (
          <div key={idx} className={`${styles.barra} ${colorClass}`} style={{ height: `${(val / max) * 100}%` }}>
            <span className={styles.barraValor}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Array aleatorio ──────────────────────────────────────────────────────────

function generarArrayAleatorio(n: number = 9): number[] {
  const values = new Set<number>();
  while (values.size < n) {
    values.add(Math.floor(Math.random() * 95) + 5);
  }
  return Array.from(values);
}

// ─── Datos de los algoritmos ──────────────────────────────────────────────────

const INFO_ALGORITMOS: Record<Algoritmo, { nombre: string; emoji: string; descripcion: string; mejor: string; medio: string; peor: string; memoria: string; estable: boolean; uso: string }> = {
  burbuja: {
    nombre: 'Burbuja (Bubble Sort)',
    emoji: '🫧',
    descripcion: 'Compara pares adyacentes y los intercambia si están en orden incorrecto. Repite hasta que no hay intercambios. Muy intuitivo pero muy lento en listas grandes.',
    mejor: 'O(n)',
    medio: 'O(n²)',
    peor: 'O(n²)',
    memoria: 'O(1)',
    estable: true,
    uso: 'Solo para enseñar conceptos; nunca en producción real.',
  },
  insercion: {
    nombre: 'Inserción (Insertion Sort)',
    emoji: '🃏',
    descripcion: 'Toma elementos de izquierda a derecha e inserta cada uno en la posición correcta del subarray ya ordenado. Como ordenar una mano de cartas de póker.',
    mejor: 'O(n)',
    medio: 'O(n²)',
    peor: 'O(n²)',
    memoria: 'O(1)',
    estable: true,
    uso: 'Listas pequeñas (<50 elementos) o casi ordenadas (es O(n) en ese caso).',
  },
  seleccion: {
    nombre: 'Selección (Selection Sort)',
    emoji: '🎯',
    descripcion: 'Busca el mínimo en el subarray no ordenado y lo coloca al principio. Siempre hace n²/2 comparaciones aunque la lista esté ordenada.',
    mejor: 'O(n²)',
    medio: 'O(n²)',
    peor: 'O(n²)',
    memoria: 'O(1)',
    estable: false,
    uso: 'Cuando los intercambios son costosos (memoria con escrituras lentas).',
  },
  quicksort: {
    nombre: 'Quicksort',
    emoji: '⚡',
    descripcion: 'Elige un pivote, separa menores a la izquierda y mayores a la derecha (partición), y ordena recursivamente cada mitad. Muy rápido en práctica por su localidad de caché.',
    mejor: 'O(n log n)',
    medio: 'O(n log n)',
    peor: 'O(n²)*',
    memoria: 'O(log n)',
    estable: false,
    uso: 'La gran mayoría de situaciones. Es el algoritmo base de Array.sort() en muchos lenguajes.',
  },
  mergesort: {
    nombre: 'Mergesort',
    emoji: '🔀',
    descripcion: 'Divide el array por la mitad recursivamente hasta tener arrays de 1 elemento, luego los fusiona ordenadamente. Garantía O(n log n) incluso en el peor caso.',
    mejor: 'O(n log n)',
    medio: 'O(n log n)',
    peor: 'O(n log n)',
    memoria: 'O(n)',
    estable: true,
    uso: 'Cuando se necesita estabilidad garantizada o trabajar con datos en disco.',
  },
};

const ALGORITMOS: Algoritmo[] = ['burbuja', 'insercion', 'seleccion', 'quicksort', 'mergesort'];

// ─── Página principal ─────────────────────────────────────────────────────────

export default function VisualizadorAlgoritmosOrdenacionPage() {
  const [tabActiva, setTabActiva] = useState<Tab>('visualizador');
  const [algoritmo, setAlgoritmo] = useState<Algoritmo>('burbuja');
  const [arrayBase, setArrayBase] = useState<number[]>([64, 34, 25, 12, 22, 11, 90]);
  const [pasos, setPasos] = useState<PasoVisualizacion[]>(() => generarPasos('burbuja', [64, 34, 25, 12, 22, 11, 90]));
  const [pasoActual, setPasoActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Slider Big O
  const [nSlider, setNSlider] = useState(100);

  // Calcular estadísticas del paso actual
  const paso = pasos[pasoActual];
  const comparaciones = pasos.slice(0, pasoActual + 1).filter(p => p.comparando !== null).length;
  const intercambios = pasos.slice(0, pasoActual + 1).filter(p => p.intercambiando !== null).length;

  // Cambiar algoritmo
  const cambiarAlgoritmo = useCallback((algo: Algoritmo) => {
    setReproduciendo(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAlgoritmo(algo);
    const nuevosPasos = generarPasos(algo, arrayBase);
    setPasos(nuevosPasos);
    setPasoActual(0);
  }, [arrayBase]);

  // Nuevo array aleatorio
  const nuevoArray = useCallback(() => {
    setReproduciendo(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const arr = generarArrayAleatorio(8);
    setArrayBase(arr);
    const nuevosPasos = generarPasos(algoritmo, arr);
    setPasos(nuevosPasos);
    setPasoActual(0);
  }, [algoritmo]);

  // Paso anterior / siguiente
  const pasoAnterior = useCallback(() => {
    setPasoActual(p => Math.max(0, p - 1));
  }, []);

  const pasoSiguiente = useCallback(() => {
    setPasoActual(p => Math.min(pasos.length - 1, p + 1));
  }, [pasos.length]);

  // Reproducir / pausar
  const toggleReproducir = useCallback(() => {
    setReproduciendo(prev => !prev);
  }, []);

  useEffect(() => {
    if (reproduciendo) {
      intervalRef.current = setInterval(() => {
        setPasoActual(p => {
          if (p >= pasos.length - 1) {
            setReproduciendo(false);
            return p;
          }
          return p + 1;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reproduciendo, pasos.length]);

  // Big O comparativo
  const n = nSlider;
  const n2 = n * n;
  const nlogn = Math.round(n * Math.log2(n));
  const ratio = n2 > 0 ? Math.round(n2 / nlogn) : 0;

  const relatedApps = getRelatedApps('visualizador-algoritmos-ordenacion');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Algoritmos de Ordenación</h1>
        <p>Visualiza paso a paso cómo Burbuja, Quicksort, Mergesort y más ordenan una lista — y por qué unos son 100× más rápidos</p>
      </header>

      <LegalNotice />

      {/* Tabs */}
      <nav className={styles.tabs} role="tablist" aria-label="Secciones del visualizador">
        {[
          { id: 'visualizador', label: 'Visualizador' },
          { id: 'como-funciona', label: 'Cómo funciona' },
          { id: 'big-o', label: 'Complejidad Big O' },
          { id: 'cuando-usar', label: 'Cuándo usar cada uno' },
        ].map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tabActiva === id}
            className={tabActiva === id ? `${styles.tab} ${styles.tabActivo}` : styles.tab}
            onClick={() => setTabActiva(id as Tab)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className={styles.content} role="tabpanel">
        {/* ── Tab 1: Visualizador ── */}
        {tabActiva === 'visualizador' && (
          <section className={styles.seccion}>
            {/* Selector de algoritmo */}
            <div className={styles.algoritmoSelector} role="group" aria-label="Seleccionar algoritmo">
              {ALGORITMOS.map(algo => (
                <button
                  key={algo}
                  className={algoritmo === algo ? `${styles.algoBtn} ${styles.algoBtnActivo}` : styles.algoBtn}
                  onClick={() => cambiarAlgoritmo(algo)}
                  aria-pressed={algoritmo === algo}
                >
                  {INFO_ALGORITMOS[algo].emoji} {INFO_ALGORITMOS[algo].nombre.split(' (')[0]}
                </button>
              ))}
            </div>

            {/* Botón nuevo array */}
            <div className={styles.controles}>
              <button className={styles.btnSecundario} onClick={nuevoArray}>
                🔀 Nuevo array aleatorio
              </button>
            </div>

            {/* Visualizador */}
            <VisualizadorBarras paso={paso} />

            {/* Leyenda */}
            <div className={styles.leyenda} aria-label="Leyenda de colores">
              <span><span className={`${styles.dot} ${styles.dotNormal}`}></span> Sin tocar</span>
              <span><span className={`${styles.dot} ${styles.dotComparando}`}></span> Comparando</span>
              <span><span className={`${styles.dot} ${styles.dotIntercambiando}`}></span> Intercambiando</span>
              <span><span className={`${styles.dot} ${styles.dotOrdenada}`}></span> Ordenado</span>
            </div>

            {/* Descripción del paso */}
            <div className={styles.descripcionPaso} role="status" aria-live="polite">
              {paso.descripcion}
            </div>

            {/* Controles de pasos */}
            <div className={styles.controlesNavegacion}>
              <button
                className={styles.btnPaso}
                onClick={pasoAnterior}
                disabled={pasoActual === 0}
                aria-label="Paso anterior"
              >
                ◀ Anterior
              </button>
              <button
                className={styles.btnPlay}
                onClick={toggleReproducir}
                aria-label={reproduciendo ? 'Pausar reproducción' : 'Reproducir automáticamente'}
              >
                {reproduciendo ? '⏸ Pausar' : '▶ Reproducir'}
              </button>
              <button
                className={styles.btnPaso}
                onClick={pasoSiguiente}
                disabled={pasoActual === pasos.length - 1}
                aria-label="Paso siguiente"
              >
                Siguiente ▶
              </button>
            </div>

            {/* Contadores */}
            <div className={styles.contadorPasos}>
              <span>Paso <strong>{pasoActual + 1}</strong> de <strong>{pasos.length}</strong></span>
              <span>Comparaciones: <strong>{comparaciones}</strong></span>
              <span>Intercambios: <strong>{intercambios}</strong></span>
            </div>
          </section>
        )}

        {/* ── Tab 2: Cómo funciona ── */}
        {tabActiva === 'como-funciona' && (
          <section className={styles.seccion}>
            <h2>Cómo funciona cada algoritmo</h2>
            <div className={styles.tarjetasGrid}>
              {ALGORITMOS.map(algo => {
                const info = INFO_ALGORITMOS[algo];
                return (
                  <div key={algo} className={styles.algoritmoCard}>
                    <div className={styles.cardEmoji} aria-hidden="true">{info.emoji}</div>
                    <h3>{info.nombre}</h3>
                    <p>{info.descripcion}</p>
                    <div className={styles.cardMeta}>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.metaLabel}>Mejor caso:</span>
                        <span className={styles.bigOCell}>{info.mejor}</span>
                      </div>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.metaLabel}>Caso medio:</span>
                        <span className={styles.bigOCell}>{info.medio}</span>
                      </div>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.metaLabel}>Peor caso:</span>
                        <span className={styles.bigOCell}>{info.peor}</span>
                      </div>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.metaLabel}>Memoria:</span>
                        <span className={styles.bigOCell}>{info.memoria}</span>
                      </div>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.metaLabel}>Estable:</span>
                        <span>{info.estable ? '✅ Sí' : '❌ No'}</span>
                      </div>
                    </div>
                    <div className={styles.cardUso}>
                      <strong>Cuándo usar:</strong> {info.uso}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Tab 3: Big O ── */}
        {tabActiva === 'big-o' && (
          <section className={styles.seccion}>
            <h2>Complejidad Big O</h2>

            {/* Tabla comparativa */}
            <div className={styles.tablaWrapper}>
              <table className={styles.complejidadTable}>
                <thead>
                  <tr>
                    <th>Algoritmo</th>
                    <th>Mejor caso</th>
                    <th>Caso medio</th>
                    <th>Peor caso</th>
                    <th>Memoria</th>
                    <th>Estable</th>
                  </tr>
                </thead>
                <tbody>
                  {ALGORITMOS.map(algo => {
                    const info = INFO_ALGORITMOS[algo];
                    return (
                      <tr key={algo}>
                        <td><strong>{info.emoji} {info.nombre.split(' (')[0]}</strong></td>
                        <td className={styles.bigOCell}>{info.mejor}</td>
                        <td className={styles.bigOCell}>{info.medio}</td>
                        <td className={styles.bigOCell}>{info.peor}</td>
                        <td className={styles.bigOCell}>{info.memoria}</td>
                        <td>{info.estable ? '✅' : '❌'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.notaTabla}>
              * Quicksort peor caso O(n²) ocurre solo si el pivote es siempre el mínimo o máximo (lista ordenada con pivote malo). Se evita con pivote aleatorio o median-of-three.
            </div>

            {/* Visualización intuitiva del crecimiento */}
            <div className={styles.crecimientoSection}>
              <h3>¿Cuánto crecen las operaciones?</h3>
              <div className={styles.crecimientoGrid}>
                {[
                  { n: 10, n2: 100, nlogn: 33 },
                  { n: 100, n2: 10000, nlogn: 664 },
                  { n: 1000, n2: 1000000, nlogn: 9966 },
                  { n: 1000000, n2: null, nlogn: 19931568 },
                ].map(({ n: nVal, n2: n2Val, nlogn: nlognVal }) => (
                  <div key={nVal} className={styles.crecimientoCard}>
                    <div className={styles.nValor}>n = {nVal.toLocaleString('es-ES')}</div>
                    <div className={styles.opRow}>
                      <span className={styles.opLabel}>O(n²):</span>
                      <span className={styles.opValorLento}>{n2Val !== null ? n2Val.toLocaleString('es-ES') : '10¹²'}</span>
                    </div>
                    <div className={styles.opRow}>
                      <span className={styles.opLabel}>O(n log n):</span>
                      <span className={styles.opValorRapido}>{nlognVal.toLocaleString('es-ES')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider comparativo */}
            <div className={styles.sliderSection}>
              <h3>Comparativa de velocidad</h3>
              <label htmlFor="sliderN" className={styles.sliderLabel}>
                Para <strong>n = {n.toLocaleString('es-ES')}</strong> elementos:
              </label>
              <input
                id="sliderN"
                type="range"
                min={10}
                max={10000}
                value={n}
                onChange={e => setNSlider(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Número de elementos para comparar"
              />
              <div className={styles.ratioDisplay}>
                <div className={styles.ratioFila}>
                  <span>O(n²) = {n2.toLocaleString('es-ES')} operaciones</span>
                  <div className={styles.barraBig} style={{ width: '100%' }}></div>
                </div>
                <div className={styles.ratioFila}>
                  <span>O(n log n) = {nlogn.toLocaleString('es-ES')} operaciones</span>
                  <div className={styles.barraBig} style={{ width: `${Math.min(100, (nlogn / n2) * 100)}%` }}></div>
                </div>
                <div className={styles.ratioBadge}>
                  Quicksort/Mergesort son <strong>{ratio.toLocaleString('es-ES')}×</strong> más rápidos que Burbuja para {n.toLocaleString('es-ES')} elementos
                </div>
              </div>
            </div>

            {/* Qué es estabilidad */}
            <div className={styles.warningBox}>
              <strong>¿Qué significa "estable"?</strong>
              <p>Un algoritmo estable preserva el orden relativo de elementos iguales. Ejemplo: si ordenas una lista de personas por apellido, y dos personas tienen el mismo apellido, un algoritmo estable mantiene su orden original (p. ej. por nombre). Esto importa cuando ordenas objetos por múltiples campos encadenados.</p>
            </div>
          </section>
        )}

        {/* ── Tab 4: Cuándo usar ── */}
        {tabActiva === 'cuando-usar' && (
          <section className={styles.seccion}>
            <h2>Cuándo usar cada algoritmo</h2>

            <div className={styles.arbolDecision}>
              <h3>Árbol de decisión</h3>
              <ol className={styles.decisionList}>
                <li>
                  <span className={styles.decisionCondicion}>¿Son menos de 50 elementos?</span>
                  <span className={styles.decisionResultado}>→ <strong>Inserción</strong> — overhead mínimo, muy rápido si casi ordenado</span>
                </li>
                <li>
                  <span className={styles.decisionCondicion}>¿Necesitas estabilidad garantizada?</span>
                  <span className={styles.decisionResultado}>→ <strong>Mergesort</strong> o <strong>Inserción</strong></span>
                </li>
                <li>
                  <span className={styles.decisionCondicion}>¿Memoria extra es crítica (embedded, IoT)?</span>
                  <span className={styles.decisionResultado}>→ <strong>Quicksort</strong> (in-place, O(log n) pila)</span>
                </li>
                <li>
                  <span className={styles.decisionCondicion}>¿Los datos están casi ordenados?</span>
                  <span className={styles.decisionResultado}>→ <strong>Inserción</strong> (O(n) en ese caso específico)</span>
                </li>
                <li>
                  <span className={styles.decisionCondicion}>¿Caso general con n mayor de 1.000?</span>
                  <span className={styles.decisionResultado}>→ <strong>Quicksort</strong> con pivote aleatorio o median-of-three</span>
                </li>
                <li>
                  <span className={styles.decisionCondicion}>¿Datos en disco que no caben en RAM?</span>
                  <span className={styles.decisionResultado}>→ <strong>Merge externo</strong> (variante de Mergesort)</span>
                </li>
              </ol>
            </div>

            <div className={styles.lenguajesSection}>
              <h3>Lo que usan los lenguajes reales</h3>
              <div className={styles.lenguajesGrid}>
                {[
                  { lang: 'Python', sort: 'Timsort', detalle: 'Híbrido Inserción + Mergesort, adaptativo y estable. Inventado por Tim Peters en 2002.', color: '#3776AB' },
                  { lang: 'Java', sort: 'Timsort + Dual-Pivot Quicksort', detalle: 'Timsort para objetos (estabilidad), Dual-Pivot Quicksort para primitivos (velocidad).', color: '#ED8B00' },
                  { lang: 'C++', sort: 'Introsort', detalle: 'Quicksort + Heapsort cuando detecta degradación al peor caso. Garantía O(n log n).', color: '#00599C' },
                  { lang: 'JavaScript V8', sort: 'Timsort', detalle: 'Desde V8 7.0. Antes usaba Quicksort para arrays grandes, Insertion Sort para pequeños.', color: '#F7DF1E' },
                ].map(({ lang, sort, detalle, color }) => (
                  <div key={lang} className={styles.lenguajeCard} style={{ borderLeftColor: color }}>
                    <div className={styles.lenguajeName}>{lang}</div>
                    <div className={styles.lenguajeSort}>{sort}</div>
                    <div className={styles.lenguajeDetalle}>{detalle}</div>
                  </div>
                ))}
              </div>
              <div className={styles.notaLenguajes}>
                <strong>Conclusión:</strong> En producción siempre usas el <code>sort()</code> nativo, que es mucho más sofisticado que cualquiera de los 5 algoritmos clásicos. Estudiarlos sirve para entender los fundamentos, optimizar casos especiales y responder preguntas de entrevistas técnicas.
              </div>
            </div>
          </section>
        )}

        {/* ── Sección educativa ── */}
        <EducationalSection title="Fundamentos teóricos" subtitle="Por qué O(n log n) es el límite, qué es Timsort y cómo funciona Radix Sort">
          <div className={styles.educacional}>
            <h3>¿Por qué O(n log n) es el límite teórico?</h3>
            <p>Para algoritmos basados en comparaciones, el límite inferior teórico es Ω(n log n). La razón: cualquier algoritmo de ordenación basado en comparaciones puede representarse como un árbol de decisión donde cada hoja es una permutación posible. Con n elementos hay n! permutaciones, y un árbol binario de altura h tiene como máximo 2ʰ hojas. Por lo tanto h ≥ log₂(n!) ≈ n log n (por la aproximación de Stirling).</p>

            <h3>¿Qué es Timsort?</h3>
            <p>Timsort (Tim Peters, 2002) detecta "runs" — subsecuencias ya ordenadas de forma natural en los datos — y las fusiona con una variante optimizada de Mergesort. Para runs muy cortos usa Insertion Sort. El resultado es que en datos del mundo real (que casi siempre tienen algún orden parcial) Timsort supera en práctica a Quicksort puro.</p>

            <h3>Radix Sort: más rápido que O(n log n)</h3>
            <p>Radix Sort no usa comparaciones: ordena por dígitos de menor a mayor significatividad usando Counting Sort en cada paso. Su complejidad es O(n·k) donde k es el número de dígitos. Para enteros de 32 bits con n elementos grandes, puede superar a Quicksort. No aplica a datos genéricos (solo enteros o strings fijos).</p>

            <h3>Estabilidad encadenada</h3>
            <p>Si necesitas ordenar por múltiples campos (p. ej., primero por apellido, luego por nombre), la técnica correcta es aplicar sorts estables en orden inverso: primero ordena por nombre (campo secundario), luego por apellido (campo primario). Al ser estable, el orden relativo del primer sort se preserva en el segundo.</p>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-algoritmos-ordenacion" />
      <Footer appName="visualizador-algoritmos-ordenacion" />
    </div>
  );
}
