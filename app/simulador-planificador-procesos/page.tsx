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
import styles from './SimuladorPlanificadorProcesos.module.css';

type Algoritmo = 'fcfs' | 'sjf' | 'srtf' | 'rr' | 'priority';

interface Proceso {
  id: string;
  llegada: number;
  rafaga: number;
  prioridad: number;
}

interface BloqueGantt {
  pid: string;
  inicio: number;
  fin: number;
  color: string;
}

interface MetricasProceso {
  pid: string;
  llegada: number;
  rafaga: number;
  inicio: number;
  fin: number;
  espera: number;
  turnaround: number;
  respuesta: number;
}

interface ResultadoSimulacion {
  bloques: BloqueGantt[];
  metricas: MetricasProceso[];
  tiempoMedioEspera: number;
  tiempoMedioTurnaround: number;
  throughput: number;
  utilizacionCpu: number;
  tiempoTotal: number;
  inanicion: string[];
}

const COLOR_IDLE = '#cbd5e1';

const PALETA_COLORES: string[] = [
  '#2E86AB', // azul meskeIA
  '#48A9A6', // teal meskeIA
  '#F18F01', // naranja
  '#C73E1D', // rojo
  '#6A4C93', // púrpura
  '#1B998B', // verde esmeralda
  '#E63946', // coral
  '#7209B7', // violeta
  '#FFB400', // amarillo dorado
  '#3A86FF', // azul brillante
];

const EJEMPLOS: Record<string, { titulo: string; descripcion: string; procesos: Proceso[]; algoritmo: Algoritmo; quantum?: number }> = {
  clasico: {
    titulo: 'Ejemplo clásico',
    descripcion: '4 procesos típicos para comparar',
    algoritmo: 'fcfs',
    procesos: [
      { id: 'P1', llegada: 0, rafaga: 8, prioridad: 3 },
      { id: 'P2', llegada: 1, rafaga: 4, prioridad: 1 },
      { id: 'P3', llegada: 2, rafaga: 9, prioridad: 4 },
      { id: 'P4', llegada: 3, rafaga: 5, prioridad: 2 },
    ],
  },
  convoy: {
    titulo: 'Convoy effect',
    descripcion: '1 largo + 3 cortos (FCFS vs SJF)',
    algoritmo: 'fcfs',
    procesos: [
      { id: 'P1', llegada: 0, rafaga: 24, prioridad: 1 },
      { id: 'P2', llegada: 1, rafaga: 3, prioridad: 1 },
      { id: 'P3', llegada: 2, rafaga: 3, prioridad: 1 },
      { id: 'P4', llegada: 3, rafaga: 3, prioridad: 1 },
    ],
  },
  rr: {
    titulo: 'Round Robin equilibrado',
    descripcion: '5 procesos con quantum=2',
    algoritmo: 'rr',
    quantum: 2,
    procesos: [
      { id: 'P1', llegada: 0, rafaga: 5, prioridad: 1 },
      { id: 'P2', llegada: 1, rafaga: 4, prioridad: 1 },
      { id: 'P3', llegada: 2, rafaga: 6, prioridad: 1 },
      { id: 'P4', llegada: 3, rafaga: 3, prioridad: 1 },
      { id: 'P5', llegada: 4, rafaga: 5, prioridad: 1 },
    ],
  },
  inanicion: {
    titulo: 'Inanición priority',
    descripcion: 'Proceso baja prioridad sin envejecimiento',
    algoritmo: 'priority',
    procesos: [
      { id: 'P1', llegada: 0, rafaga: 6, prioridad: 10 },
      { id: 'P2', llegada: 1, rafaga: 5, prioridad: 1 },
      { id: 'P3', llegada: 2, rafaga: 4, prioridad: 2 },
      { id: 'P4', llegada: 3, rafaga: 5, prioridad: 1 },
      { id: 'P5', llegada: 4, rafaga: 3, prioridad: 2 },
    ],
  },
};

const PROCESOS_INICIALES: Proceso[] = [
  { id: 'P1', llegada: 0, rafaga: 6, prioridad: 2 },
  { id: 'P2', llegada: 1, rafaga: 4, prioridad: 1 },
  { id: 'P3', llegada: 2, rafaga: 8, prioridad: 3 },
];

function colorParaProceso(pid: string, lista: Proceso[]): string {
  const idx = lista.findIndex((p) => p.id === pid);
  if (idx === -1) return COLOR_IDLE;
  return PALETA_COLORES[idx % PALETA_COLORES.length];
}

// FCFS: ordenar por llegada, ejecutar en orden
function simularFCFS(procesos: Proceso[]): { bloques: BloqueGantt[]; ordenInicio: Record<string, number> } {
  const orden = [...procesos].sort((a, b) => a.llegada - b.llegada);
  const bloques: BloqueGantt[] = [];
  const ordenInicio: Record<string, number> = {};
  let t = 0;
  for (const p of orden) {
    if (t < p.llegada) {
      bloques.push({ pid: 'idle', inicio: t, fin: p.llegada, color: COLOR_IDLE });
      t = p.llegada;
    }
    ordenInicio[p.id] = t;
    bloques.push({
      pid: p.id,
      inicio: t,
      fin: t + p.rafaga,
      color: colorParaProceso(p.id, procesos),
    });
    t += p.rafaga;
  }
  return { bloques, ordenInicio };
}

// SJF no apropiativo
function simularSJF(procesos: Proceso[]): { bloques: BloqueGantt[]; ordenInicio: Record<string, number> } {
  const restantes = procesos.map((p) => ({ ...p }));
  const completados = new Set<string>();
  const bloques: BloqueGantt[] = [];
  const ordenInicio: Record<string, number> = {};
  let t = 0;
  while (completados.size < procesos.length) {
    const disponibles = restantes.filter((p) => !completados.has(p.id) && p.llegada <= t);
    if (disponibles.length === 0) {
      const proximo = restantes
        .filter((p) => !completados.has(p.id))
        .reduce((min, p) => (p.llegada < min.llegada ? p : min));
      bloques.push({ pid: 'idle', inicio: t, fin: proximo.llegada, color: COLOR_IDLE });
      t = proximo.llegada;
      continue;
    }
    const elegido = disponibles.reduce((min, p) => (p.rafaga < min.rafaga ? p : min));
    ordenInicio[elegido.id] = t;
    bloques.push({
      pid: elegido.id,
      inicio: t,
      fin: t + elegido.rafaga,
      color: colorParaProceso(elegido.id, procesos),
    });
    t += elegido.rafaga;
    completados.add(elegido.id);
  }
  return { bloques, ordenInicio };
}

// SRTF (apropiativo): tick por tick
function simularSRTF(procesos: Proceso[]): { bloques: BloqueGantt[]; ordenInicio: Record<string, number> } {
  const restantes: Record<string, number> = {};
  procesos.forEach((p) => {
    restantes[p.id] = p.rafaga;
  });
  const ordenInicio: Record<string, number> = {};
  const bloques: BloqueGantt[] = [];
  let t = 0;
  const totalTrabajo = procesos.reduce((s, p) => s + p.rafaga, 0);
  const tiempoMaxEspera = procesos.reduce((max, p) => Math.max(max, p.llegada), 0) + totalTrabajo + 100;
  let ultimoPid: string | null = null;
  while (Object.values(restantes).some((r) => r > 0)) {
    if (t > tiempoMaxEspera) break;
    const disponibles = procesos.filter((p) => p.llegada <= t && restantes[p.id] > 0);
    if (disponibles.length === 0) {
      if (ultimoPid !== 'idle') {
        bloques.push({ pid: 'idle', inicio: t, fin: t + 1, color: COLOR_IDLE });
        ultimoPid = 'idle';
      } else {
        const last = bloques[bloques.length - 1];
        if (last) last.fin = t + 1;
      }
      t += 1;
      continue;
    }
    const elegido = disponibles.reduce((min, p) => (restantes[p.id] < restantes[min.id] ? p : min));
    if (ordenInicio[elegido.id] === undefined) {
      ordenInicio[elegido.id] = t;
    }
    if (ultimoPid !== elegido.id) {
      bloques.push({
        pid: elegido.id,
        inicio: t,
        fin: t + 1,
        color: colorParaProceso(elegido.id, procesos),
      });
      ultimoPid = elegido.id;
    } else {
      const last = bloques[bloques.length - 1];
      if (last) last.fin = t + 1;
    }
    restantes[elegido.id] -= 1;
    t += 1;
  }
  return { bloques, ordenInicio };
}

// Round Robin
function simularRR(procesos: Proceso[], quantum: number): { bloques: BloqueGantt[]; ordenInicio: Record<string, number> } {
  const restantes: Record<string, number> = {};
  procesos.forEach((p) => {
    restantes[p.id] = p.rafaga;
  });
  const ordenInicio: Record<string, number> = {};
  const bloques: BloqueGantt[] = [];
  let t = 0;
  const ordenadosPorLlegada = [...procesos].sort((a, b) => a.llegada - b.llegada);
  const cola: string[] = [];
  const yaEnCola = new Set<string>();
  let idxLlegadas = 0;

  // Avanzar al primer proceso disponible
  if (ordenadosPorLlegada[0].llegada > 0) {
    bloques.push({ pid: 'idle', inicio: 0, fin: ordenadosPorLlegada[0].llegada, color: COLOR_IDLE });
    t = ordenadosPorLlegada[0].llegada;
  }

  // Añadir procesos llegados antes de t
  while (idxLlegadas < ordenadosPorLlegada.length && ordenadosPorLlegada[idxLlegadas].llegada <= t) {
    const pid = ordenadosPorLlegada[idxLlegadas].id;
    cola.push(pid);
    yaEnCola.add(pid);
    idxLlegadas += 1;
  }

  while (cola.length > 0 || idxLlegadas < ordenadosPorLlegada.length) {
    if (cola.length === 0) {
      // CPU idle hasta el siguiente
      const siguiente = ordenadosPorLlegada[idxLlegadas];
      bloques.push({ pid: 'idle', inicio: t, fin: siguiente.llegada, color: COLOR_IDLE });
      t = siguiente.llegada;
      while (idxLlegadas < ordenadosPorLlegada.length && ordenadosPorLlegada[idxLlegadas].llegada <= t) {
        cola.push(ordenadosPorLlegada[idxLlegadas].id);
        yaEnCola.add(ordenadosPorLlegada[idxLlegadas].id);
        idxLlegadas += 1;
      }
      continue;
    }
    const pid = cola.shift() as string;
    yaEnCola.delete(pid);
    if (ordenInicio[pid] === undefined) {
      ordenInicio[pid] = t;
    }
    const ejecutar = Math.min(quantum, restantes[pid]);
    bloques.push({
      pid,
      inicio: t,
      fin: t + ejecutar,
      color: colorParaProceso(pid, procesos),
    });
    const tFin = t + ejecutar;
    restantes[pid] -= ejecutar;

    // Añadir procesos que llegaron durante este quantum
    while (idxLlegadas < ordenadosPorLlegada.length && ordenadosPorLlegada[idxLlegadas].llegada <= tFin) {
      const llegadoId = ordenadosPorLlegada[idxLlegadas].id;
      if (!yaEnCola.has(llegadoId) && restantes[llegadoId] > 0) {
        cola.push(llegadoId);
        yaEnCola.add(llegadoId);
      }
      idxLlegadas += 1;
    }

    // Si el proceso no terminó, vuelve al final
    if (restantes[pid] > 0 && !yaEnCola.has(pid)) {
      cola.push(pid);
      yaEnCola.add(pid);
    }
    t = tFin;
  }
  return { bloques, ordenInicio };
}

// Priority (apropiativo o no)
function simularPriority(procesos: Proceso[], apropiativo: boolean): { bloques: BloqueGantt[]; ordenInicio: Record<string, number> } {
  if (!apropiativo) {
    // Como SJF pero usando prioridad
    const restantes = procesos.map((p) => ({ ...p }));
    const completados = new Set<string>();
    const bloques: BloqueGantt[] = [];
    const ordenInicio: Record<string, number> = {};
    let t = 0;
    while (completados.size < procesos.length) {
      const disponibles = restantes.filter((p) => !completados.has(p.id) && p.llegada <= t);
      if (disponibles.length === 0) {
        const proximo = restantes
          .filter((p) => !completados.has(p.id))
          .reduce((min, p) => (p.llegada < min.llegada ? p : min));
        bloques.push({ pid: 'idle', inicio: t, fin: proximo.llegada, color: COLOR_IDLE });
        t = proximo.llegada;
        continue;
      }
      const elegido = disponibles.reduce((min, p) => (p.prioridad < min.prioridad ? p : min));
      ordenInicio[elegido.id] = t;
      bloques.push({
        pid: elegido.id,
        inicio: t,
        fin: t + elegido.rafaga,
        color: colorParaProceso(elegido.id, procesos),
      });
      t += elegido.rafaga;
      completados.add(elegido.id);
    }
    return { bloques, ordenInicio };
  }

  // Apropiativo: tick por tick
  const restantes: Record<string, number> = {};
  procesos.forEach((p) => {
    restantes[p.id] = p.rafaga;
  });
  const ordenInicio: Record<string, number> = {};
  const bloques: BloqueGantt[] = [];
  let t = 0;
  const totalTrabajo = procesos.reduce((s, p) => s + p.rafaga, 0);
  const tiempoMaxEspera = procesos.reduce((max, p) => Math.max(max, p.llegada), 0) + totalTrabajo + 100;
  let ultimoPid: string | null = null;
  while (Object.values(restantes).some((r) => r > 0)) {
    if (t > tiempoMaxEspera) break;
    const disponibles = procesos.filter((p) => p.llegada <= t && restantes[p.id] > 0);
    if (disponibles.length === 0) {
      if (ultimoPid !== 'idle') {
        bloques.push({ pid: 'idle', inicio: t, fin: t + 1, color: COLOR_IDLE });
        ultimoPid = 'idle';
      } else {
        const last = bloques[bloques.length - 1];
        if (last) last.fin = t + 1;
      }
      t += 1;
      continue;
    }
    const elegido = disponibles.reduce((min, p) => (p.prioridad < min.prioridad ? p : min));
    if (ordenInicio[elegido.id] === undefined) {
      ordenInicio[elegido.id] = t;
    }
    if (ultimoPid !== elegido.id) {
      bloques.push({
        pid: elegido.id,
        inicio: t,
        fin: t + 1,
        color: colorParaProceso(elegido.id, procesos),
      });
      ultimoPid = elegido.id;
    } else {
      const last = bloques[bloques.length - 1];
      if (last) last.fin = t + 1;
    }
    restantes[elegido.id] -= 1;
    t += 1;
  }
  return { bloques, ordenInicio };
}

function calcularResultado(
  procesos: Proceso[],
  algoritmo: Algoritmo,
  quantum: number,
  apropiativo: boolean,
): ResultadoSimulacion {
  if (procesos.length === 0) {
    return {
      bloques: [],
      metricas: [],
      tiempoMedioEspera: 0,
      tiempoMedioTurnaround: 0,
      throughput: 0,
      utilizacionCpu: 0,
      tiempoTotal: 0,
      inanicion: [],
    };
  }

  let resultado: { bloques: BloqueGantt[]; ordenInicio: Record<string, number> };
  if (algoritmo === 'fcfs') resultado = simularFCFS(procesos);
  else if (algoritmo === 'sjf') resultado = simularSJF(procesos);
  else if (algoritmo === 'srtf') resultado = simularSRTF(procesos);
  else if (algoritmo === 'rr') resultado = simularRR(procesos, quantum);
  else resultado = simularPriority(procesos, apropiativo);

  const { bloques, ordenInicio } = resultado;

  // Tiempo de fin de cada proceso = último bloque de su pid
  const finPorPid: Record<string, number> = {};
  for (const b of bloques) {
    if (b.pid !== 'idle') {
      finPorPid[b.pid] = b.fin;
    }
  }

  const metricas: MetricasProceso[] = procesos.map((p) => {
    const fin = finPorPid[p.id] ?? 0;
    const inicio = ordenInicio[p.id] ?? 0;
    const turnaround = fin - p.llegada;
    const espera = turnaround - p.rafaga;
    const respuesta = inicio - p.llegada;
    return {
      pid: p.id,
      llegada: p.llegada,
      rafaga: p.rafaga,
      inicio,
      fin,
      espera: Math.max(0, espera),
      turnaround,
      respuesta: Math.max(0, respuesta),
    };
  });

  const completados = metricas.filter((m) => m.fin > 0);
  const tiempoMedioEspera =
    completados.length > 0 ? completados.reduce((s, m) => s + m.espera, 0) / completados.length : 0;
  const tiempoMedioTurnaround =
    completados.length > 0 ? completados.reduce((s, m) => s + m.turnaround, 0) / completados.length : 0;
  const tiempoTotal = bloques.length > 0 ? bloques[bloques.length - 1].fin : 0;
  const tiempoOcupado = bloques.filter((b) => b.pid !== 'idle').reduce((s, b) => s + (b.fin - b.inicio), 0);
  const utilizacionCpu = tiempoTotal > 0 ? (tiempoOcupado / tiempoTotal) * 100 : 0;
  const throughput = tiempoTotal > 0 ? completados.length / tiempoTotal : 0;
  const inanicion = procesos.filter((p) => !finPorPid[p.id]).map((p) => p.id);

  return {
    bloques,
    metricas,
    tiempoMedioEspera,
    tiempoMedioTurnaround,
    throughput,
    utilizacionCpu,
    tiempoTotal,
    inanicion,
  };
}

export default function SimuladorPlanificadorProcesos() {
  const [procesos, setProcesos] = useState<Proceso[]>(PROCESOS_INICIALES);
  const [algoritmo, setAlgoritmo] = useState<Algoritmo>('fcfs');
  const [quantum, setQuantum] = useState<number>(2);
  const [apropiativo, setApropiativo] = useState<boolean>(true);

  const resultado = useMemo(
    () => calcularResultado(procesos, algoritmo, quantum, apropiativo),
    [procesos, algoritmo, quantum, apropiativo],
  );

  const actualizarProceso = useCallback(
    (idx: number, campo: 'llegada' | 'rafaga' | 'prioridad', valor: number) => {
      setProcesos((prev) => {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], [campo]: valor };
        return copia;
      });
    },
    [],
  );

  const anadirProceso = useCallback(() => {
    setProcesos((prev) => {
      if (prev.length >= 10) return prev;
      const siguiente = `P${prev.length + 1}`;
      return [...prev, { id: siguiente, llegada: 0, rafaga: 1, prioridad: 5 }];
    });
  }, []);

  const eliminarUltimo = useCallback(() => {
    setProcesos((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const limpiar = useCallback(() => {
    setProcesos([{ id: 'P1', llegada: 0, rafaga: 1, prioridad: 5 }]);
  }, []);

  const cargarEjemplo = useCallback((clave: keyof typeof EJEMPLOS) => {
    const ej = EJEMPLOS[clave];
    setProcesos(ej.procesos.map((p) => ({ ...p })));
    setAlgoritmo(ej.algoritmo);
    if (ej.quantum !== undefined) setQuantum(ej.quantum);
  }, []);

  const cargarEjemploClasico = useCallback(() => {
    setProcesos(EJEMPLOS.clasico.procesos.map((p) => ({ ...p })));
  }, []);

  // Gantt SVG dimensions
  const ganttHeight = 90;
  const ganttPaddingTop = 10;
  const ganttBlockHeight = 50;
  const tiempoTotal = resultado.tiempoTotal;
  const escalaPx = tiempoTotal > 0 ? Math.max(40, Math.min(80, 800 / tiempoTotal)) : 50;
  const ganttWidth = Math.max(600, tiempoTotal * escalaPx + 40);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Planificación de Procesos</h1>
        <p className={styles.subtitle}>FCFS, SJF, SRTF, Round Robin, Priority</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de algoritmo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Algoritmo de planificación</h2>
          <div className={styles.algoritmoSelector}>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'fcfs' ? styles.algoritmoActive : ''}`}
              onClick={() => setAlgoritmo('fcfs')}
              aria-pressed={algoritmo === 'fcfs'}
            >
              <span className={styles.algoritmoNombre}>FCFS</span>
              <span className={styles.algoritmoDesc}>Por orden de llegada</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'sjf' ? styles.algoritmoActive : ''}`}
              onClick={() => setAlgoritmo('sjf')}
              aria-pressed={algoritmo === 'sjf'}
            >
              <span className={styles.algoritmoNombre}>SJF</span>
              <span className={styles.algoritmoDesc}>Más corto, no apropiativo</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'srtf' ? styles.algoritmoActive : ''}`}
              onClick={() => setAlgoritmo('srtf')}
              aria-pressed={algoritmo === 'srtf'}
            >
              <span className={styles.algoritmoNombre}>SRTF</span>
              <span className={styles.algoritmoDesc}>Más corto, apropiativo</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'rr' ? styles.algoritmoActive : ''}`}
              onClick={() => setAlgoritmo('rr')}
              aria-pressed={algoritmo === 'rr'}
            >
              <span className={styles.algoritmoNombre}>Round Robin</span>
              <span className={styles.algoritmoDesc}>Turnos con quantum</span>
            </button>
            <button
              type="button"
              className={`${styles.algoritmoBtn} ${algoritmo === 'priority' ? styles.algoritmoActive : ''}`}
              onClick={() => setAlgoritmo('priority')}
              aria-pressed={algoritmo === 'priority'}
            >
              <span className={styles.algoritmoNombre}>Priority</span>
              <span className={styles.algoritmoDesc}>Por prioridad</span>
            </button>
          </div>

          {algoritmo === 'rr' && (
            <div className={styles.quantumControl}>
              <label htmlFor="quantum">Quantum:</label>
              <input
                id="quantum"
                type="range"
                min={1}
                max={10}
                value={quantum}
                onChange={(e) => setQuantum(Number(e.target.value))}
              />
              <span className={styles.quantumValue}>{quantum}</span>
            </div>
          )}

          {algoritmo === 'priority' && (
            <div className={styles.toggleControl}>
              <label htmlFor="apropiativo">
                <input
                  id="apropiativo"
                  type="checkbox"
                  checked={apropiativo}
                  onChange={(e) => setApropiativo(e.target.checked)}
                />
                Apropiativo (preempt)
              </label>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Si está activo, un proceso de mayor prioridad que llega interrumpe al actual.
              </span>
            </div>
          )}
        </div>

        {/* Ejemplos */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Ejemplos preconfigurados</h2>
          <div className={styles.ejemplosGrid}>
            {(Object.keys(EJEMPLOS) as (keyof typeof EJEMPLOS)[]).map((clave) => {
              const ej = EJEMPLOS[clave];
              return (
                <button
                  key={clave}
                  type="button"
                  className={styles.ejemploBtn}
                  onClick={() => cargarEjemplo(clave)}
                >
                  <span className={styles.ejemploTitle}>{ej.titulo}</span>
                  <span className={styles.ejemploDesc}>{ej.descripcion}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla editable de procesos */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Procesos ({procesos.length}/10)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.procesosTable}>
              <thead>
                <tr>
                  <th>PID</th>
                  <th>Llegada</th>
                  <th>Ráfaga</th>
                  <th>Prioridad</th>
                  <th>Color</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {procesos.map((p, idx) => (
                  <tr key={p.id} className={styles.procesoRow}>
                    <td>{p.id}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={p.llegada}
                        onChange={(e) => actualizarProceso(idx, 'llegada', Math.max(0, Number(e.target.value) || 0))}
                        className={styles.procesoInput}
                        aria-label={`Tiempo de llegada del proceso ${p.id}`}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={p.rafaga}
                        onChange={(e) => actualizarProceso(idx, 'rafaga', Math.max(1, Number(e.target.value) || 1))}
                        className={styles.procesoInput}
                        aria-label={`Ráfaga de CPU del proceso ${p.id}`}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={p.prioridad}
                        onChange={(e) =>
                          actualizarProceso(idx, 'prioridad', Math.min(10, Math.max(1, Number(e.target.value) || 1)))
                        }
                        className={styles.procesoInput}
                        disabled={algoritmo !== 'priority'}
                        aria-label={`Prioridad del proceso ${p.id}`}
                      />
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          background: PALETA_COLORES[idx % PALETA_COLORES.length],
                        }}
                        aria-hidden="true"
                      />
                    </td>
                    <td>
                      {procesos.length > 1 && idx === procesos.length - 1 && (
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={eliminarUltimo}
                          aria-label="Eliminar último proceso"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.tableActions}>
            <button type="button" className={styles.actionBtn} onClick={anadirProceso} disabled={procesos.length >= 10}>
              + Añadir proceso
            </button>
            <button type="button" className={styles.actionBtn} onClick={eliminarUltimo} disabled={procesos.length <= 1}>
              Eliminar última fila
            </button>
            <button type="button" className={styles.actionBtn} onClick={cargarEjemploClasico}>
              Cargar ejemplo
            </button>
            <button type="button" className={styles.actionBtn} onClick={limpiar}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Diagrama de Gantt */}
        <div className={styles.ganttContainer}>
          <h2 className={styles.ganttTitle}>Diagrama de Gantt</h2>
          {resultado.bloques.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Añade procesos para ver el resultado.</p>
          ) : (
            <svg
              className={styles.ganttSvg}
              width={ganttWidth}
              height={ganttHeight}
              viewBox={`0 0 ${ganttWidth} ${ganttHeight}`}
              role="img"
              aria-label="Diagrama de Gantt de la planificación"
            >
              {resultado.bloques.map((b, i) => {
                const x = b.inicio * escalaPx + 20;
                const w = (b.fin - b.inicio) * escalaPx;
                if (w <= 0) return null;
                return (
                  <g key={`${b.pid}-${i}`}>
                    <rect
                      x={x}
                      y={ganttPaddingTop}
                      width={w}
                      height={ganttBlockHeight}
                      fill={b.color}
                      className={b.pid === 'idle' ? styles.ganttIdle : styles.ganttBlock}
                    />
                    {w >= 25 && (
                      <text
                        x={x + w / 2}
                        y={ganttPaddingTop + ganttBlockHeight / 2 + 5}
                        className={styles.ganttLabel}
                        fill={b.pid === 'idle' ? 'var(--text-secondary)' : 'white'}
                      >
                        {b.pid === 'idle' ? '—' : b.pid}
                      </text>
                    )}
                    <text
                      x={x}
                      y={ganttPaddingTop + ganttBlockHeight + 18}
                      className={styles.ganttTimestamp}
                    >
                      {b.inicio}
                    </text>
                    {i === resultado.bloques.length - 1 && (
                      <text
                        x={x + w}
                        y={ganttPaddingTop + ganttBlockHeight + 18}
                        className={styles.ganttTimestamp}
                      >
                        {b.fin}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Métricas globales */}
        {resultado.metricas.length > 0 && (
          <>
            <div className={styles.metricasGrid} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Tiempo medio de espera</span>
                <div className={styles.metricValue}>
                  {formatNumber(resultado.tiempoMedioEspera, 2)}
                  <span className={styles.metricUnit}>ut</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Tiempo medio turnaround</span>
                <div className={styles.metricValue}>
                  {formatNumber(resultado.tiempoMedioTurnaround, 2)}
                  <span className={styles.metricUnit}>ut</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Throughput</span>
                <div className={styles.metricValue}>
                  {formatNumber(resultado.throughput, 3)}
                  <span className={styles.metricUnit}>p/ut</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Utilización CPU</span>
                <div className={styles.metricValue}>
                  {formatNumber(resultado.utilizacionCpu, 1)}
                  <span className={styles.metricUnit}>%</span>
                </div>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricLabel}>Tiempo total</span>
                <div className={styles.metricValue}>
                  {resultado.tiempoTotal}
                  <span className={styles.metricUnit}>ut</span>
                </div>
              </div>
            </div>

            {algoritmo === 'priority' && resultado.inanicion.length > 0 ? (
              <div className={styles.inanicionAlert} role="alert">
                <span aria-hidden="true">⚠️</span>
                <span>
                  <strong>Inanición detectada:</strong> los procesos {resultado.inanicion.join(', ')} no llegaron a ejecutarse por completo. Considera añadir envejecimiento (aging) para evitar starvation.
                </span>
              </div>
            ) : algoritmo === 'priority' ? (
              <div className={styles.inanicionOk}>
                <span aria-hidden="true">✓</span>
                <span>
                  <strong>Sin inanición:</strong> todos los procesos terminan dentro del horizonte simulado.
                </span>
              </div>
            ) : null}

            {/* Tabla de métricas por proceso */}
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Métricas por proceso</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.metricasTable}>
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>Llegada</th>
                      <th>Ráfaga</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>Espera</th>
                      <th>Turnaround</th>
                      <th>Respuesta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.metricas.map((m) => (
                      <tr key={m.pid}>
                        <td>{m.pid}</td>
                        <td>{m.llegada}</td>
                        <td>{m.rafaga}</td>
                        <td>{m.fin > 0 ? m.inicio : '—'}</td>
                        <td>{m.fin > 0 ? m.fin : '—'}</td>
                        <td>{m.fin > 0 ? m.espera : '—'}</td>
                        <td>{m.fin > 0 ? m.turnaround : '—'}</td>
                        <td>{m.fin > 0 ? m.respuesta : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <EducationalSection
        title="Guía de Planificación de Procesos"
        subtitle="Algoritmos de scheduler de CPU"
      >
        <h3>Comparativa de Algoritmos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Algoritmo</th>
                <th>Apropiativo</th>
                <th>Criterio de selección</th>
                <th>Ventaja</th>
                <th>Desventaja</th>
                <th>Cuándo usarlo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>FCFS</strong></td>
                <td>No</td>
                <td>Orden de llegada</td>
                <td>Sencillo, sin starvation</td>
                <td>Convoy effect: un proceso largo bloquea a los cortos</td>
                <td>Sistemas batch sencillos, colas FIFO</td>
              </tr>
              <tr>
                <td><strong>SJF</strong></td>
                <td>No</td>
                <td>Ráfaga más corta primero</td>
                <td>Tiempo medio de espera mínimo (óptimo teórico)</td>
                <td>Necesita conocer la ráfaga, posible inanición</td>
                <td>Cargas predecibles, batch con estimación</td>
              </tr>
              <tr>
                <td><strong>SRTF</strong></td>
                <td>Sí</td>
                <td>Tiempo restante más corto</td>
                <td>Mejor que SJF para procesos que llegan en distintos momentos</td>
                <td>Muchos cambios de contexto, requiere estimar ráfaga</td>
                <td>Sistemas interactivos con mezcla de cargas</td>
              </tr>
              <tr>
                <td><strong>Round Robin</strong></td>
                <td>Sí</td>
                <td>Turnos cíclicos de quantum</td>
                <td>Justo, buen tiempo de respuesta</td>
                <td>Cambios de contexto si quantum es bajo</td>
                <td>Sistemas time-sharing y multiusuario</td>
              </tr>
              <tr>
                <td><strong>Priority</strong></td>
                <td>Opcional</td>
                <td>Prioridad estática o dinámica</td>
                <td>Atiende primero lo crítico</td>
                <td>Inanición sin envejecimiento</td>
                <td>Sistemas en tiempo real, kernel</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <strong>Estudiante de Sistemas Operativos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Necesitas resolver problemas de Gantt para el examen: 4 procesos con tiempos distintos, calcular tiempo medio de espera con FCFS y SJF y comparar.
            </p>
            <div className={styles.escenarioTip}>
              Carga el ejemplo &laquo;Convoy effect&raquo; y cambia entre FCFS y SJF para ver cómo cambia el tiempo medio.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
              <strong>Opositor TIC / Concurso público</strong>
            </div>
            <p className={styles.escenarioExample}>
              Pruebas tipo test de oposición preguntan diferencias entre apropiativo y no apropiativo, qué es el quantum y cuándo causa inanición Priority.
            </p>
            <div className={styles.escenarioTip}>
              Practica el ejemplo &laquo;Inanición priority&raquo; y observa qué procesos quedan fuera.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">⚙️</span>
              <strong>Programador de sistemas embebidos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Diseñas un firmware con tareas de tiempo real y de fondo. Decides aplicar Priority apropiativo para garantizar respuesta a interrupciones críticas.
            </p>
            <div className={styles.escenarioTip}>
              En Priority apropiativo, una tarea crítica que llega siempre interrumpe a las menos prioritarias.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👨‍🏫</span>
              <strong>Profesor / docente de informática</strong>
            </div>
            <p className={styles.escenarioExample}>
              Quieres mostrar visualmente a tu clase por qué Round Robin con quantum=1 degenera en cambios de contexto excesivos.
            </p>
            <div className={styles.escenarioTip}>
              Usa el ejemplo de Round Robin y baja el quantum a 1 para mostrar el coste del context switching.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuál es la diferencia entre apropiativo y no apropiativo?</h4>
            <p>
              <strong>No apropiativo:</strong> cuando un proceso entra en CPU, ejecuta hasta terminar (o bloquearse). Nadie lo interrumpe.
            </p>
            <p>
              <strong>Apropiativo (preemptive):</strong> el planificador puede arrebatarle la CPU si llega un proceso más prioritario o más corto. Permite mejor reparto pero exige más cambios de contexto.
            </p>
            <p className={styles.faqTip}>FCFS y SJF clásico son no apropiativos. SRTF, Round Robin y Priority preemptive son apropiativos.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el convoy effect?</h4>
            <p>
              Es un fenómeno típico de FCFS: si un proceso de ráfaga muy larga llega primero, todos los demás esperan detrás aunque sean cortísimos. El tiempo medio de espera se dispara.
            </p>
            <p className={styles.faqTip}>Carga el ejemplo &laquo;Convoy effect&raquo; (FCFS) y compara con SJF para verlo numéricamente.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué quantum elegir en Round Robin?</h4>
            <p>
              Si el quantum es muy pequeño hay demasiados cambios de contexto (overhead). Si es muy grande, RR degenera en FCFS. La regla práctica es que el quantum sea algo mayor que la mayoría de ráfagas cortas (~10-100 ms en sistemas reales).
            </p>
            <p className={styles.faqTip}>Prueba el mismo conjunto de procesos con quantum 1, 2, 4 y 8 para ver el impacto.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se evita la inanición en Priority?</h4>
            <p>
              Con <strong>envejecimiento (aging)</strong>: la prioridad de un proceso aumenta con el tiempo que lleva esperando. Así, tarde o temprano, hasta el de menor prioridad acaba siendo el más prioritario y entra en CPU.
            </p>
            <p className={styles.faqTip}>Este simulador NO implementa aging — por eso ves procesos sin ejecutar en el ejemplo de inanición.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué SJF da el menor tiempo medio de espera?</h4>
            <p>
              Matemáticamente, ordenar los procesos por ráfaga creciente minimiza la suma de tiempos de espera (es un teorema clásico de scheduling). El precio es que necesitas conocer la ráfaga de antemano, lo cual no siempre es posible.
            </p>
            <p className={styles.faqTip}>Los SO reales estiman la ráfaga futura con medias móviles exponenciales basadas en ráfagas pasadas.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo usan estos algoritmos los sistemas operativos reales?</h4>
            <p>
              Linux usa el <em>Completely Fair Scheduler (CFS)</em>, basado en árboles rojo-negro y noción de &laquo;tiempo virtual&raquo;. Windows usa colas multinivel con Priority + envejecimiento. macOS combina prioridades con quantum dinámico. Casi nadie usa FCFS o SJF puros, pero son la base teórica imprescindible.
            </p>
            <p className={styles.faqTip}>Round Robin sigue vivo en sistemas time-sharing y como base de muchos planificadores reales.</p>
          </div>
        </div>

        <h3>Cómo Calcular Tiempos a Mano — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Construye el diagrama de Gantt</strong>
              <p>
                Aplica el algoritmo paso a paso. Para FCFS, ordena por llegada. Para SJF, en cada decisión elige el de menor ráfaga entre los disponibles. Anota inicio y fin de cada bloque.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Anota el momento de fin de cada proceso</strong>
              <p>
                Es el último momento en el que el proceso aparece en el Gantt. Para procesos apropiados (RR, SRTF), su última aparición.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Calcula el turnaround</strong>
              <p>
                Turnaround = fin − llegada. Es el tiempo total que el proceso ha vivido en el sistema desde que llegó hasta que terminó.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Calcula el tiempo de espera</strong>
              <p>
                Espera = turnaround − ráfaga. Es el tiempo que el proceso ha estado en la cola de listos sin ejecutar.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Calcula los promedios</strong>
              <p>
                Tiempo medio de espera = suma de esperas / número de procesos. Tiempo medio de turnaround = suma de turnarounds / número de procesos. Estos dos números son los que se piden en la mayoría de exámenes.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Empieza siempre por el Gantt</strong>
            <p>Antes de calcular nada, dibuja el diagrama. Los errores casi siempre vienen de un Gantt mal construido, no de la aritmética.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
            <strong>Cuidado con los tiempos de llegada</strong>
            <p>Si la CPU está ociosa porque ningún proceso ha llegado, marca un bloque idle. No olvides ese tiempo al calcular utilización.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>En RR, define bien el orden de llegada a la cola</strong>
            <p>Si un proceso termina su quantum justo cuando otro llega, normalmente el recién llegado entra antes en la cola que el reincorporado.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <strong>Compara dos algoritmos con los mismos datos</strong>
            <p>La mejor forma de entender es coger el mismo conjunto de procesos y ejecutarlo con FCFS, SJF y RR. Anota tiempo medio de espera en cada uno.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚠️</span>
            <strong>SJF y SRTF requieren predicción</strong>
            <p>En la realidad no conoces la ráfaga futura. En problemas teóricos sí te la dan; en sistemas reales se estima con medias exponenciales.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧠</span>
            <strong>Memoriza las fórmulas</strong>
            <p>Espera = Turnaround − Ráfaga. Turnaround = Fin − Llegada. Respuesta = Inicio − Llegada. Con estas tres se resuelve cualquier ejercicio.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes a evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              Olvidar el tiempo idle cuando ningún proceso ha llegado todavía: si el primer proceso llega en t=2, los primeros dos ut son idle.
            </li>
            <li>
              Confundir tiempo de espera con tiempo de respuesta: la espera es total en cola; la respuesta es solo hasta entrar por primera vez en CPU.
            </li>
            <li>
              En Round Robin, mandar el proceso recién terminado al final de la cola en vez de al recién llegado primero (depende de la convención del libro).
            </li>
            <li>
              En Priority, usar &laquo;mayor número = mayor prioridad&raquo; cuando el enunciado dice lo contrario. Lee siempre la convención del problema.
            </li>
            <li>
              Calcular el tiempo medio dividiendo entre el número de unidades de tiempo en lugar del número de procesos.
            </li>
            <li>
              No considerar la inanición en Priority: un examen casi seguro pregunta &laquo;¿hay inanición?&raquo; si hay procesos baja prioridad y otros que llegan continuamente.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-planificador-procesos')} />
      <ShareCard appName="simulador-planificador-procesos" />
      <Footer appName="simulador-planificador-procesos" />
    </div>
  );
}
