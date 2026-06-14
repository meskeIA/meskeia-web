'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
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
import styles from './SimuladorReemplazoPaginas.module.css';

// ============================================
// TIPOS
// ============================================
type Algoritmo = 'fifo' | 'lru' | 'optimal' | 'clock' | 'lfu';
type EventoPaso = 'hit' | 'fault' | 'evict';

interface PasoSimulacion {
  ref: number;
  marcos: (number | null)[];
  tipo: EventoPaso;
  evicted?: number | null;
}

interface ResultadoAlgoritmo {
  algoritmo: Algoritmo;
  pasos: PasoSimulacion[];
  faults: number;
  hits: number;
  hitRatio: number;
  faultRate: number;
}

interface EjemploPreconfigurado {
  id: string;
  nombre: string;
  descripcion: string;
  cadena: string;
  marcosSugeridos: number;
}

// ============================================
// METADATOS DE ALGORITMOS
// ============================================
const ALGORITMOS: Record<Algoritmo, { nombre: string; abrev: string; descripcion: string; color: string }> = {
  fifo: { nombre: 'FIFO', abrev: 'FIFO', descripcion: 'First In, First Out', color: '#2E86AB' },
  lru: { nombre: 'LRU', abrev: 'LRU', descripcion: 'Least Recently Used', color: '#48A9A6' },
  optimal: { nombre: 'Optimal', abrev: 'OPT', descripcion: 'Algoritmo óptimo (Belady)', color: '#16a34a' },
  clock: { nombre: 'Clock', abrev: 'CLK', descripcion: 'Second Chance', color: '#f59e0b' },
  lfu: { nombre: 'LFU', abrev: 'LFU', descripcion: 'Least Frequently Used', color: '#dc2626' },
};

const EJEMPLOS: EjemploPreconfigurado[] = [
  {
    id: 'belady',
    nombre: 'Cadena de Belady',
    descripcion: 'Anomalía: más marcos = más fallos en FIFO',
    cadena: '1,2,3,4,1,2,5,1,2,3,4,5',
    marcosSugeridos: 3,
  },
  {
    id: 'localidad-alta',
    nombre: 'Localidad alta',
    descripcion: 'Referencias agrupadas, LRU brilla',
    cadena: '1,2,3,1,2,3,4,1,2,3,4,5,1,2,3,4,5',
    marcosSugeridos: 3,
  },
  {
    id: 'localidad-baja',
    nombre: 'Localidad baja',
    descripcion: 'Referencias dispersas, todos fallan mucho',
    cadena: '1,5,2,7,3,8,4,9,6,10,11,12,5,1,2',
    marcosSugeridos: 3,
  },
  {
    id: 'tanenbaum',
    nombre: 'Cadena de Tanenbaum',
    descripcion: 'Ejemplo clásico de manuales',
    cadena: '7,0,1,2,0,3,0,4,2,3,0,3,0,3,2,1,2,0,1,7,0,1',
    marcosSugeridos: 3,
  },
];

// ============================================
// PARSER DE CADENA DE REFERENCIAS
// ============================================
function parsearCadena(input: string): { ok: boolean; refs: number[]; error?: string } {
  if (!input.trim()) {
    return { ok: false, refs: [], error: 'La cadena está vacía' };
  }
  const tokens = input
    .split(/[\s,;\n\r\t]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const refs: number[] = [];
  for (const token of tokens) {
    const n = Number(token);
    if (!Number.isInteger(n) || n < 0 || n > 99) {
      return { ok: false, refs: [], error: `Valor no válido: "${token}". Usa enteros entre 0 y 99.` };
    }
    refs.push(n);
  }
  if (refs.length === 0) {
    return { ok: false, refs: [], error: 'No se encontraron referencias válidas' };
  }
  if (refs.length > 60) {
    return { ok: false, refs: [], error: 'Máximo 60 referencias' };
  }
  return { ok: true, refs };
}

// ============================================
// SIMULACIÓN DE ALGORITMOS
// ============================================
function simularFIFO(refs: number[], numMarcos: number): PasoSimulacion[] {
  const pasos: PasoSimulacion[] = [];
  const marcos: (number | null)[] = Array(numMarcos).fill(null);
  const cola: number[] = []; // orden de carga (índice en marcos)
  let punteroLibre = 0;

  for (const ref of refs) {
    const idxExistente = marcos.indexOf(ref);
    if (idxExistente !== -1) {
      pasos.push({ ref, marcos: [...marcos], tipo: 'hit' });
    } else if (punteroLibre < numMarcos) {
      // Hay marco vacío
      marcos[punteroLibre] = ref;
      cola.push(punteroLibre);
      punteroLibre++;
      pasos.push({ ref, marcos: [...marcos], tipo: 'fault' });
    } else {
      // Reemplazar el más antiguo
      const idxAntiguo = cola.shift();
      if (idxAntiguo === undefined) {
        pasos.push({ ref, marcos: [...marcos], tipo: 'fault' });
        continue;
      }
      const evicted = marcos[idxAntiguo];
      marcos[idxAntiguo] = ref;
      cola.push(idxAntiguo);
      pasos.push({ ref, marcos: [...marcos], tipo: 'evict', evicted });
    }
  }
  return pasos;
}

function simularLRU(refs: number[], numMarcos: number): PasoSimulacion[] {
  const pasos: PasoSimulacion[] = [];
  const marcos: (number | null)[] = Array(numMarcos).fill(null);
  const ordenUso: number[] = []; // índices en orden de uso (LRU al frente)
  let punteroLibre = 0;

  for (const ref of refs) {
    const idxExistente = marcos.indexOf(ref);
    if (idxExistente !== -1) {
      // HIT: actualizar orden de uso
      const pos = ordenUso.indexOf(idxExistente);
      if (pos !== -1) ordenUso.splice(pos, 1);
      ordenUso.push(idxExistente);
      pasos.push({ ref, marcos: [...marcos], tipo: 'hit' });
    } else if (punteroLibre < numMarcos) {
      marcos[punteroLibre] = ref;
      ordenUso.push(punteroLibre);
      punteroLibre++;
      pasos.push({ ref, marcos: [...marcos], tipo: 'fault' });
    } else {
      const idxLRU = ordenUso.shift();
      if (idxLRU === undefined) {
        pasos.push({ ref, marcos: [...marcos], tipo: 'fault' });
        continue;
      }
      const evicted = marcos[idxLRU];
      marcos[idxLRU] = ref;
      ordenUso.push(idxLRU);
      pasos.push({ ref, marcos: [...marcos], tipo: 'evict', evicted });
    }
  }
  return pasos;
}

function simularOptimal(refs: number[], numMarcos: number): PasoSimulacion[] {
  const pasos: PasoSimulacion[] = [];
  const marcos: (number | null)[] = Array(numMarcos).fill(null);
  let punteroLibre = 0;

  for (let t = 0; t < refs.length; t++) {
    const ref = refs[t];
    const idxExistente = marcos.indexOf(ref);
    if (idxExistente !== -1) {
      pasos.push({ ref, marcos: [...marcos], tipo: 'hit' });
    } else if (punteroLibre < numMarcos) {
      marcos[punteroLibre] = ref;
      punteroLibre++;
      pasos.push({ ref, marcos: [...marcos], tipo: 'fault' });
    } else {
      // Buscar la página que más tarde se usará en el futuro
      let idxVictima = 0;
      let mayorDistancia = -1;
      for (let i = 0; i < numMarcos; i++) {
        const pagina = marcos[i];
        if (pagina === null) {
          idxVictima = i;
          break;
        }
        // Buscar próxima aparición
        let prox = -1;
        for (let f = t + 1; f < refs.length; f++) {
          if (refs[f] === pagina) {
            prox = f;
            break;
          }
        }
        if (prox === -1) {
          // No se vuelve a usar — víctima ideal
          idxVictima = i;
          mayorDistancia = Infinity;
          break;
        }
        if (prox > mayorDistancia) {
          mayorDistancia = prox;
          idxVictima = i;
        }
      }
      const evicted = marcos[idxVictima];
      marcos[idxVictima] = ref;
      pasos.push({ ref, marcos: [...marcos], tipo: 'evict', evicted });
    }
  }
  return pasos;
}

function simularClock(refs: number[], numMarcos: number): PasoSimulacion[] {
  const pasos: PasoSimulacion[] = [];
  const marcos: (number | null)[] = Array(numMarcos).fill(null);
  const bitUso: number[] = Array(numMarcos).fill(0);
  let puntero = 0;
  let punteroLibre = 0;

  for (const ref of refs) {
    const idxExistente = marcos.indexOf(ref);
    if (idxExistente !== -1) {
      // HIT: poner bit de uso a 1
      bitUso[idxExistente] = 1;
      pasos.push({ ref, marcos: [...marcos], tipo: 'hit' });
    } else if (punteroLibre < numMarcos) {
      marcos[punteroLibre] = ref;
      bitUso[punteroLibre] = 1;
      punteroLibre++;
      puntero = punteroLibre % numMarcos;
      pasos.push({ ref, marcos: [...marcos], tipo: 'fault' });
    } else {
      // Recorrido circular hasta encontrar bit=0
      // Salvaguarda: máximo 2 vueltas
      let intentos = 0;
      while (intentos < numMarcos * 2) {
        if (bitUso[puntero] === 0) {
          break;
        }
        bitUso[puntero] = 0;
        puntero = (puntero + 1) % numMarcos;
        intentos++;
      }
      const idxVictima = puntero;
      const evicted = marcos[idxVictima];
      marcos[idxVictima] = ref;
      bitUso[idxVictima] = 1;
      puntero = (puntero + 1) % numMarcos;
      pasos.push({ ref, marcos: [...marcos], tipo: 'evict', evicted });
    }
  }
  return pasos;
}

function simularLFU(refs: number[], numMarcos: number): PasoSimulacion[] {
  const pasos: PasoSimulacion[] = [];
  const marcos: (number | null)[] = Array(numMarcos).fill(null);
  const contador: number[] = Array(numMarcos).fill(0);
  const tiempoCarga: number[] = Array(numMarcos).fill(0); // para desempate (más antiguo primero)
  let punteroLibre = 0;

  for (let t = 0; t < refs.length; t++) {
    const ref = refs[t];
    const idxExistente = marcos.indexOf(ref);
    if (idxExistente !== -1) {
      contador[idxExistente]++;
      pasos.push({ ref, marcos: [...marcos], tipo: 'hit' });
    } else if (punteroLibre < numMarcos) {
      marcos[punteroLibre] = ref;
      contador[punteroLibre] = 1;
      tiempoCarga[punteroLibre] = t;
      punteroLibre++;
      pasos.push({ ref, marcos: [...marcos], tipo: 'fault' });
    } else {
      // Encontrar el de menor contador; desempate: el cargado antes
      let idxVictima = 0;
      let menorCount = contador[0];
      let antiguedadVictima = tiempoCarga[0];
      for (let i = 1; i < numMarcos; i++) {
        if (
          contador[i] < menorCount ||
          (contador[i] === menorCount && tiempoCarga[i] < antiguedadVictima)
        ) {
          menorCount = contador[i];
          antiguedadVictima = tiempoCarga[i];
          idxVictima = i;
        }
      }
      const evicted = marcos[idxVictima];
      marcos[idxVictima] = ref;
      contador[idxVictima] = 1;
      tiempoCarga[idxVictima] = t;
      pasos.push({ ref, marcos: [...marcos], tipo: 'evict', evicted });
    }
  }
  return pasos;
}

function simular(algoritmo: Algoritmo, refs: number[], numMarcos: number): ResultadoAlgoritmo {
  let pasos: PasoSimulacion[];
  switch (algoritmo) {
    case 'fifo':
      pasos = simularFIFO(refs, numMarcos);
      break;
    case 'lru':
      pasos = simularLRU(refs, numMarcos);
      break;
    case 'optimal':
      pasos = simularOptimal(refs, numMarcos);
      break;
    case 'clock':
      pasos = simularClock(refs, numMarcos);
      break;
    case 'lfu':
      pasos = simularLFU(refs, numMarcos);
      break;
  }
  const faults = pasos.filter((p) => p.tipo !== 'hit').length;
  const hits = pasos.length - faults;
  const hitRatio = pasos.length === 0 ? 0 : (hits / pasos.length) * 100;
  const faultRate = pasos.length === 0 ? 0 : (faults / pasos.length) * 100;
  return { algoritmo, pasos, faults, hits, hitRatio, faultRate };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorReemplazoPaginas() {
  const [cadenaInput, setCadenaInput] = useState<string>('7,0,1,2,0,3,0,4,2,3,0,3,0,3,2,1,2,0,1,7,0,1');
  const [numMarcos, setNumMarcos] = useState<number>(3);
  const [algoritmoActivo, setAlgoritmoActivo] = useState<Algoritmo>('fifo');
  const [modoComparativa, setModoComparativa] = useState<boolean>(false);

  const parseado = useMemo(() => parsearCadena(cadenaInput), [cadenaInput]);
  const refs = parseado.ok ? parseado.refs : [];

  const resultados = useMemo<Record<Algoritmo, ResultadoAlgoritmo> | null>(() => {
    if (!parseado.ok || refs.length === 0) return null;
    return {
      fifo: simular('fifo', refs, numMarcos),
      lru: simular('lru', refs, numMarcos),
      optimal: simular('optimal', refs, numMarcos),
      clock: simular('clock', refs, numMarcos),
      lfu: simular('lfu', refs, numMarcos),
    };
  }, [parseado.ok, refs, numMarcos]);

  // Detectar anomalía de Belady en FIFO: comparar con N+1 marcos
  const anomaliaBelady = useMemo<boolean>(() => {
    if (!parseado.ok || refs.length === 0 || numMarcos >= 10) return false;
    const fifoActual = simular('fifo', refs, numMarcos);
    const fifoMasMarcos = simular('fifo', refs, numMarcos + 1);
    return fifoMasMarcos.faults > fifoActual.faults;
  }, [parseado.ok, refs, numMarcos]);

  const cargarEjemplo = useCallback((ejemplo: EjemploPreconfigurado) => {
    setCadenaInput(ejemplo.cadena);
    setNumMarcos(ejemplo.marcosSugeridos);
  }, []);

  const algoritmosMostrar: Algoritmo[] = modoComparativa
    ? ['fifo', 'lru', 'optimal', 'clock', 'lfu']
    : [algoritmoActivo];

  const relatedApps = getRelatedApps('simulador-reemplazo-paginas');

  // Calcular eficiencia relativa al óptimo
  const calcularEficiencia = (faults: number, faultsOptimal: number): number => {
    if (faults === 0) return 100;
    if (faultsOptimal === 0) return faults === 0 ? 100 : 0;
    return (faultsOptimal / faults) * 100;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Reemplazo de Páginas</h1>
        <p className={styles.subtitle}>FIFO, LRU, Optimal, Clock y LFU — visualiza fallos de página y la anomalía de Belady</p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Ejemplos preconfigurados */}
        <div className={styles.examplesSection}>
          <h4>Ejemplos preconfigurados</h4>
          <div className={styles.examplesGrid}>
            {EJEMPLOS.map((ej) => (
              <button
                key={ej.id}
                className={styles.exampleBtn}
                onClick={() => cargarEjemplo(ej)}
                title={ej.descripcion}
                type="button"
              >
                {ej.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Input cadena de referencias */}
        <div className={styles.expressionInput}>
          <label htmlFor="cadena">Cadena de referencias (enteros 0-99 separados por coma o espacio)</label>
          <textarea
            id="cadena"
            className={styles.refsTextarea}
            value={cadenaInput}
            onChange={(e) => setCadenaInput(e.target.value)}
            rows={2}
            spellCheck={false}
          />
          {!parseado.ok && parseado.error && (
            <p role="alert" className={styles.expressionError}>{parseado.error}</p>
          )}
          {parseado.ok && (
            <p className={styles.refsInfo}>
              {refs.length} referencias · {new Set(refs).size} páginas distintas
            </p>
          )}
        </div>

        {/* Slider marcos */}
        <div className={styles.expressionInput}>
          <label htmlFor="marcos">
            Número de marcos: <strong>{numMarcos}</strong>
          </label>
          <input
            id="marcos"
            type="range"
            min={1}
            max={10}
            step={1}
            value={numMarcos}
            onChange={(e) => setNumMarcos(Number(e.target.value))}
            className={styles.marcosSlider}
          />
        </div>

        {/* Toggle comparativa */}
        <div className={styles.toggleRow}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={modoComparativa}
              onChange={(e) => setModoComparativa(e.target.checked)}
            />
            <span>Comparar todos los algoritmos a la vez</span>
          </label>
        </div>

        {/* Selector de algoritmo (oculto en modo comparativa) */}
        {!modoComparativa && (
          <div className={styles.algoritmoSelector}>
            {(Object.keys(ALGORITMOS) as Algoritmo[]).map((alg) => (
              <button
                key={alg}
                type="button"
                className={`${styles.algoritmoBtn} ${algoritmoActivo === alg ? styles.algoritmoActive : ''}`}
                onClick={() => setAlgoritmoActivo(alg)}
                aria-pressed={algoritmoActivo === alg}
                title={ALGORITMOS[alg].descripcion}
              >
                <span className={styles.algoritmoNombre}>{ALGORITMOS[alg].nombre}</span>
                <span className={styles.algoritmoDesc}>{ALGORITMOS[alg].descripcion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Anomalía de Belady */}
        {parseado.ok && anomaliaBelady && (
          <div className={styles.beladyAlert} role="alert">
            <strong>⚠ Anomalía de Belady detectada en FIFO</strong>
            <p>
              Con {numMarcos} marcos hay menos fallos que con {numMarcos + 1} marcos. Es un caso clásico
              en el que añadir memoria empeora el rendimiento de FIFO. Ningún algoritmo de pila (LRU, Optimal) sufre esta anomalía.
            </p>
          </div>
        )}

        {/* Resultados */}
        {resultados && (
          <>
            {algoritmosMostrar.map((alg) => {
              const r = resultados[alg];
              const eficiencia = calcularEficiencia(r.faults, resultados.optimal.faults);
              return (
                <section key={alg} className={styles.resultBlock}>
                  <h3 className={styles.algoritmoTitle}>
                    <span style={{ color: ALGORITMOS[alg].color }}>●</span> {ALGORITMOS[alg].nombre}
                    <span className={styles.algoritmoSubtitle}> — {ALGORITMOS[alg].descripcion}</span>
                  </h3>

                  {/* Métricas */}
                  <div className={styles.metricsGrid} role="status" aria-live="polite" aria-atomic="true">
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>Fallos de página</div>
                      <div className={styles.metricValue}>{formatNumber(r.faults, 0)}</div>
                    </div>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>Aciertos (hits)</div>
                      <div className={styles.metricValue}>{formatNumber(r.hits, 0)}</div>
                    </div>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>Tasa de fallos</div>
                      <div className={styles.metricValue}>{formatNumber(r.faultRate, 1)}%</div>
                    </div>
                    <div className={styles.metricCard}>
                      <div className={styles.metricLabel}>Hit ratio</div>
                      <div className={styles.metricValue}>{formatNumber(r.hitRatio, 1)}%</div>
                    </div>
                    {alg !== 'optimal' && (
                      <div className={styles.metricCard}>
                        <div className={styles.metricLabel}>Eficiencia vs Optimal</div>
                        <div className={styles.metricValue}>{formatNumber(eficiencia, 1)}%</div>
                      </div>
                    )}
                  </div>

                  {/* Tabla matricial */}
                  <div className={styles.tableWrapper}>
                    <table className={styles.matrizTable}>
                      <thead>
                        <tr>
                          <th>t</th>
                          {r.pasos.map((_, i) => (
                            <th key={i}>{i + 1}</th>
                          ))}
                        </tr>
                        <tr>
                          <th>Ref</th>
                          {r.pasos.map((p, i) => (
                            <th key={i} className={styles.refLabel}>
                              {p.ref}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: numMarcos }, (_, fila) => (
                          <tr key={fila}>
                            <th>M{fila + 1}</th>
                            {r.pasos.map((p, t) => {
                              const valor = p.marcos[fila];
                              const esRef = valor === p.ref;
                              let cellClass = styles.celdaVacia;
                              if (valor !== null) {
                                if (p.tipo === 'hit' && esRef) cellClass = styles.celdaHit;
                                else if (p.tipo === 'evict' && esRef) cellClass = styles.celdaEvict;
                                else if (p.tipo === 'fault' && esRef) cellClass = styles.celdaFault;
                                else cellClass = styles.celdaOcupada;
                              }
                              return (
                                <td key={t} className={cellClass}>
                                  {valor !== null ? valor : '·'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr>
                          <th>Estado</th>
                          {r.pasos.map((p, i) => (
                            <td
                              key={i}
                              className={
                                p.tipo === 'hit'
                                  ? styles.statusHit
                                  : p.tipo === 'fault'
                                  ? styles.statusFault
                                  : styles.statusEvict
                              }
                            >
                              {p.tipo === 'hit' ? 'H' : p.tipo === 'fault' ? 'F' : 'F*'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.legendRow}>
                    <span className={`${styles.legendItem} ${styles.legendHit}`}>H = Hit</span>
                    <span className={`${styles.legendItem} ${styles.legendFault}`}>F = Fallo (carga)</span>
                    <span className={`${styles.legendItem} ${styles.legendEvict}`}>F* = Fallo con reemplazo</span>
                  </div>
                </section>
              );
            })}

            {/* Gráfica de fallos acumulados (modo comparativa) */}
            {modoComparativa && (
              <section className={styles.resultBlock}>
                <h3>Fallos acumulados en el tiempo</h3>
                <FaultsChart resultados={resultados} numRefs={refs.length} />

                {/* Tabla resumen */}
                <div className={styles.tableWrapper}>
                  <table className={styles.comparativaTable}>
                    <thead>
                      <tr>
                        <th>Algoritmo</th>
                        <th>Fallos</th>
                        <th>Tasa fallos</th>
                        <th>Hit ratio</th>
                        <th>Eficiencia vs Optimal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(['optimal', 'lru', 'clock', 'fifo', 'lfu'] as Algoritmo[]).map((alg) => {
                        const r = resultados[alg];
                        const ef = calcularEficiencia(r.faults, resultados.optimal.faults);
                        return (
                          <tr key={alg}>
                            <td>
                              <span style={{ color: ALGORITMOS[alg].color }}>●</span> {ALGORITMOS[alg].nombre}
                            </td>
                            <td>{formatNumber(r.faults, 0)}</td>
                            <td>{formatNumber(r.faultRate, 1)}%</td>
                            <td>{formatNumber(r.hitRatio, 1)}%</td>
                            <td>{formatNumber(ef, 1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* CONTENIDO EDUCATIVO v2.0 */}
      <EducationalSection
        title="Guía de Reemplazo de Páginas"
        subtitle="Algoritmos de gestión de memoria virtual"
      >
        <p className={styles.introParagraph}>
          Cuando un proceso necesita una página de memoria que no está cargada en RAM, ocurre un{' '}
          <strong>fallo de página</strong>. Si todos los marcos están ocupados, el sistema operativo
          debe elegir qué página retirar. Esta decisión determina el rendimiento global del sistema.
          Los algoritmos de reemplazo intentan minimizar los fallos futuros, pero ninguno (salvo el
          óptimo, irrealizable) es perfecto: cada uno tiene compromisos entre coste hardware,
          complejidad y comportamiento.
        </p>

        <h3>Comparativa de Algoritmos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Algoritmo</th>
                <th>Criterio de víctima</th>
                <th>Coste hardware</th>
                <th>Rendimiento</th>
                <th>Anomalía Belady</th>
                <th>Cuándo usar</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>FIFO</strong></td>
                <td>La cargada hace más tiempo</td>
                <td>Muy bajo (cola)</td>
                <td>Mediocre</td>
                <td>Sí, posible</td>
                <td>Sistemas con poca memoria, simplicidad extrema</td>
              </tr>
              <tr>
                <td><strong>LRU</strong></td>
                <td>La menos usada recientemente</td>
                <td>Alto (timestamp por acceso)</td>
                <td>Muy bueno</td>
                <td>No (algoritmo de pila)</td>
                <td>Cuando hay buena localidad temporal</td>
              </tr>
              <tr>
                <td><strong>Optimal</strong></td>
                <td>La que más tarde se referenciará</td>
                <td>Imposible (necesita futuro)</td>
                <td>Cota mínima teórica</td>
                <td>No</td>
                <td>Solo como referencia académica</td>
              </tr>
              <tr>
                <td><strong>Clock</strong></td>
                <td>Bit de uso = 0 en recorrido circular</td>
                <td>Bajo (1 bit por marco)</td>
                <td>Cercano a LRU</td>
                <td>No en la práctica</td>
                <td>Implementación real (Linux, BSD)</td>
              </tr>
              <tr>
                <td><strong>LFU</strong></td>
                <td>La menos referenciada en total</td>
                <td>Medio (contador por página)</td>
                <td>Bueno si patrón estable</td>
                <td>No</td>
                <td>Trabajos con conjuntos de páginas estables</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🐧</span>
              <strong>Linux: variante de Clock</strong>
            </div>
            <p className={styles.escenarioExample}>
              El kernel de Linux usa un Clock con dos listas (active/inactive) y bits de uso múltiples.
              Aproxima LRU sin pagar el coste de actualizar timestamps en cada acceso.
            </p>
            <div className={styles.escenarioTip}>
              💡 Usar LRU puro en hardware moderno costaría más que ahorra en fallos.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📊</span>
              <strong>Bases de datos: LRU + LFU</strong>
            </div>
            <p className={styles.escenarioExample}>
              PostgreSQL y MySQL combinan ideas de LRU y LFU en sus buffer pools (ej. ARC, 2Q,
              LRU-K) para distinguir páginas calientes de fríos sin penalizar accesos esporádicos.
            </p>
            <div className={styles.escenarioTip}>
              💡 LRU puro sufre con escaneos secuenciales largos (cache pollution).
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🌐</span>
              <strong>Caches CDN: LRU adaptativo</strong>
            </div>
            <p className={styles.escenarioExample}>
              Cloudflare, Akamai y Fastly usan LRU con segmentación o variantes (S3-FIFO, TinyLFU)
              para servir contenido a millones de usuarios manteniendo objetos virales en memoria.
            </p>
            <div className={styles.escenarioTip}>
              💡 El reemplazo eficiente es el corazón del rendimiento de un CDN.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📚</span>
              <strong>Aulas y exámenes</strong>
            </div>
            <p className={styles.escenarioExample}>
              En FP de Informática y Sistemas Operativos universitarios se piden ejercicios manuales
              con FIFO, LRU y Optimal. Saber dibujar la tabla y contar fallos es competencia básica.
            </p>
            <div className={styles.escenarioTip}>
              💡 La cadena de Belady (1,2,3,4,1,2,5,1,2,3,4,5) es ejemplo clásico.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué es la anomalía de Belady?</h4>
            <p>
              Es el fenómeno por el que aumentar el número de marcos asignados a un proceso provoca
              <em> más</em> fallos de página, no menos. Lo descubrió László Bélády en 1969 estudiando
              FIFO. Sucede porque FIFO no respeta la propiedad de pila: la página retirada con N
              marcos puede ser distinta de la que se retiraría con N+1.
            </p>
            <p className={styles.faqTip}>
              💡 Algoritmos como LRU u Optimal cumplen la propiedad de pila y nunca empeoran al añadir marcos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué Optimal no se implementa en la práctica?</h4>
            <p>
              Porque requiere conocer el futuro: para decidir qué página retirar mira las
              referencias que vendrán. Un sistema operativo no puede predecir accesos a memoria de
              programas arbitrarios. Solo es útil como cota inferior para evaluar otros algoritmos.
            </p>
            <p className={styles.faqTip}>
              💡 Si tu algoritmo da el doble de fallos que Optimal, sabes que tienes margen.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿LRU vs Clock: cuál es mejor?</h4>
            <p>
              LRU produce menos fallos en teoría, pero requiere actualizar metadatos en cada acceso
              a memoria (carísimo). Clock aproxima LRU con un solo bit por página y un puntero
              circular: casi tan bueno y muchísimo más barato. Por eso los sistemas reales (Linux,
              FreeBSD) usan variantes de Clock, no LRU puro.
            </p>
            <p className={styles.faqTip}>
              💡 La diferencia es de 5-10% de fallos pero 100x menos sobrecarga.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se aproxima LRU eficientemente?</h4>
            <p>
              Con bits de referencia que el hardware MMU pone a 1 cuando se accede a una página. El
              SO los lee y resetea periódicamente. Con varios bits (NFU/aging) se puede simular un
              orden temporal aproximado sin actualizar nada en cada acceso.
            </p>
            <p className={styles.faqTip}>
              💡 La MMU de x86 ofrece un bit Accessed por entrada de tabla de páginas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Diferencia entre fallo de página y trap?</h4>
            <p>
              Un fallo de página es un tipo concreto de trap (excepción de hardware). El procesador
              detecta que una página no está mapeada o no está en RAM y transfiere control al
              kernel, que decide si traerla del disco, mapearla, o terminar el proceso (segfault).
            </p>
            <p className={styles.faqTip}>
              💡 No todo trap es fallo de página: hay traps por división por cero, instrucciones inválidas, etc.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué algoritmos usan los SO modernos?</h4>
            <p>
              Linux: dos listas LRU aproximadas (active/inactive) con bit de acceso. Windows:
              working set por proceso con FIFO local en cada uno. macOS: LRU aproximada con cola
              activa/inactiva. Casi nadie usa FIFO ni Optimal: el primero rinde mal y el segundo es
              imposible.
            </p>
            <p className={styles.faqTip}>
              💡 Las decisiones reales mezclan reemplazo + working set + paginación bajo demanda.
            </p>
          </div>
        </div>

        <h3>Cómo Resolver un Ejercicio Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Lee la cadena y el número de marcos</strong>
              <p>Anota cada referencia y cuántos marcos hay. Dibuja una tabla con tantas filas como marcos y una columna por referencia.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Recorre cada referencia en orden</strong>
              <p>Para cada referencia: ¿está la página en algún marco? Si sí, es HIT. Si no, FAULT (y si todos los marcos están llenos, hay reemplazo).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Aplica el criterio del algoritmo</strong>
              <p>FIFO: la cargada antes. LRU: la usada hace más tiempo. Optimal: la que tarda más en volver a aparecer. Clock: recorre el puntero buscando bit=0. LFU: la menos referenciada.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Marca cada paso H o F</strong>
              <p>Debajo de cada columna escribe H (hit) o F (fallo). Distingue F* si hubo reemplazo. Esto te da el conteo final.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Calcula métricas finales</strong>
              <p>Tasa de fallos = fallos / total. Hit ratio = hits / total. Compara con Optimal para evaluar la eficiencia del algoritmo elegido.</p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📋</span>
            <strong>Dibuja siempre la tabla completa</strong>
            <p>Aunque pienses que sabes el resultado, escribir cada paso reduce errores y te hace ver qué páginas conviven en memoria.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <strong>Para Optimal, mira hacia delante</strong>
            <p>No es un algoritmo causal: para decidir hoy hay que ver mañana. Anota junto a cada página su próxima aparición.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔄</span>
            <strong>En LRU usa una pila auxiliar</strong>
            <p>Lista ordenada por uso. Al hit, mueve la página al final (más reciente). Al evict, sale la del principio (menos reciente).</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⏱️</span>
            <strong>En FIFO basta una cola</strong>
            <p>No importa si una página se usa mucho: lo único relevante es cuándo se cargó por primera vez. Mantén la cola estricta.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🧭</span>
            <strong>En Clock, mueve el puntero</strong>
            <p>Después de cada reemplazo, el puntero avanza una posición. Si todos los bits son 1, dará una vuelta entera poniéndolos a 0.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📈</span>
            <strong>Compara siempre con Optimal</strong>
            <p>El cociente fallos_optimal / fallos_algoritmo te dice qué tan lejos estás del techo. Por debajo de 70% indica algoritmo mediocre o cadena hostil.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠</span>
            <strong>Errores frecuentes en exámenes</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Confundir LRU (último uso) con LFU (frecuencia total) — son criterios distintos.</li>
            <li>En FIFO, mover la página de posición al hacer HIT — los hits no afectan a la cola FIFO.</li>
            <li>En Optimal, contar la referencia actual como "futura" — solo cuentan las posteriores al instante actual.</li>
            <li>Olvidar resetear el bit de uso en Clock al pasar el puntero por una página con bit=1.</li>
            <li>Cargar 2 páginas en el primer instante — solo se carga una por referencia, aunque haya marcos vacíos.</li>
            <li>Suponer que más marcos siempre da menos fallos — la anomalía de Belady demuestra que en FIFO no es así.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="simulador-reemplazo-paginas" />
      <Footer appName="simulador-reemplazo-paginas" />
    </div>
  );
}

// ============================================
// SUBCOMPONENTE: Gráfica de fallos acumulados
// ============================================
interface FaultsChartProps {
  resultados: Record<Algoritmo, ResultadoAlgoritmo>;
  numRefs: number;
}

function FaultsChart({ resultados, numRefs }: FaultsChartProps): React.ReactElement {
  const width = 720;
  const height = 280;
  const padX = 50;
  const padY = 30;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  // Calcular máximo
  const maxFaults = Math.max(
    resultados.fifo.faults,
    resultados.lru.faults,
    resultados.optimal.faults,
    resultados.clock.faults,
    resultados.lfu.faults,
    1
  );

  const xScale = (i: number): number => padX + (i / Math.max(numRefs - 1, 1)) * innerW;
  const yScale = (f: number): number => height - padY - (f / maxFaults) * innerH;

  const buildPath = (alg: Algoritmo): string => {
    const pasos = resultados[alg].pasos;
    let cumulado = 0;
    const points: string[] = [];
    points.push(`M ${xScale(0)} ${yScale(0)}`);
    for (let i = 0; i < pasos.length; i++) {
      if (pasos[i].tipo !== 'hit') cumulado++;
      points.push(`L ${xScale(i)} ${yScale(cumulado)}`);
    }
    return points.join(' ');
  };

  // Líneas de cuadrícula horizontales
  const ySteps = 5;
  const yLines: number[] = [];
  for (let i = 0; i <= ySteps; i++) {
    yLines.push((maxFaults * i) / ySteps);
  }

  return (
    <div className={styles.faultsChart}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gráfica de fallos acumulados">
        {/* Cuadrícula */}
        {yLines.map((v, i) => (
          <g key={i}>
            <line
              x1={padX}
              y1={yScale(v)}
              x2={width - padX}
              y2={yScale(v)}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={1}
            />
            <text x={padX - 8} y={yScale(v) + 4} textAnchor="end" fontSize={11} fill="currentColor">
              {Math.round(v)}
            </text>
          </g>
        ))}
        {/* Eje X labels */}
        <text x={padX} y={height - 8} fontSize={11} fill="currentColor">
          1
        </text>
        <text x={width - padX} y={height - 8} fontSize={11} fill="currentColor" textAnchor="end">
          {numRefs}
        </text>
        <text x={width / 2} y={height - 8} fontSize={11} fill="currentColor" textAnchor="middle">
          referencias
        </text>
        <text
          x={padX - 35}
          y={padY + innerH / 2}
          fontSize={11}
          fill="currentColor"
          textAnchor="middle"
          transform={`rotate(-90, ${padX - 35}, ${padY + innerH / 2})`}
        >
          fallos acumulados
        </text>

        {/* Líneas de cada algoritmo */}
        {(['optimal', 'lru', 'clock', 'fifo', 'lfu'] as Algoritmo[]).map((alg) => (
          <path
            key={alg}
            d={buildPath(alg)}
            fill="none"
            stroke={ALGORITMOS[alg].color}
            strokeWidth={alg === 'optimal' ? 2.5 : 2}
            strokeDasharray={alg === 'optimal' ? '6,3' : 'none'}
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* Leyenda */}
      <div className={styles.chartLegend}>
        {(['optimal', 'lru', 'clock', 'fifo', 'lfu'] as Algoritmo[]).map((alg) => (
          <span key={alg} className={styles.chartLegendItem}>
            <span className={styles.chartLegendSwatch} style={{ background: ALGORITMOS[alg].color }} />
            {ALGORITMOS[alg].nombre} ({resultados[alg].faults})
          </span>
        ))}
      </div>
    </div>
  );
}
