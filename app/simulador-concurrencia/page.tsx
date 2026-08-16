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
import styles from './SimuladorConcurrencia.module.css';

// ============================================================
//  TIPOS
// ============================================================

type EfectoAccion =
  | 'entra-sc'
  | 'sale-sc'
  | 'produce'
  | 'consume'
  | 'buffer-add'
  | 'buffer-remove'
  | 'come'
  | 'piensa'
  | 'trabaja';

type Instr =
  | { t: 'wait'; sem: string; etiqueta: string }
  | { t: 'signal'; sem: string; etiqueta: string }
  | { t: 'accion'; etiqueta: string; efecto: EfectoAccion };

type EstadoHilo = 'listo' | 'bloqueado' | 'terminado';

interface HiloEstado {
  id: string;
  nombre: string;
  color: string;
  pc: number;
  iterRestantes: number;
  estado: EstadoHilo;
  enSC: boolean;
  programa: Instr[];
}

interface SemaforoEstado {
  id: string;
  nombre: string;
  valor: number;
  cola: string[];
  owner: string | null;
  binario: boolean;
}

interface SimEstado {
  hilos: HiloEstado[];
  semaforos: Record<string, SemaforoEstado>;
  orden: string[]; // orden de semáforos para mostrar
  buffer: number[];
  bufferCap: number;
  usaBuffer: boolean;
  contadorProd: number;
  log: string[];
  deadlock: boolean;
  carrera: boolean;
  pasos: number;
  ultimoHilo: string | null;
}

type Escenario = 'seccion-critica' | 'productor-consumidor' | 'filosofos';

// ============================================================
//  CONSTRUCCIÓN DE ESCENARIOS
// ============================================================

const COLORES = ['#2E86AB', '#48A9A6', '#C0653A', '#7B5EA7', '#B0488A'];

function nuevoSemaforo(
  id: string,
  nombre: string,
  valor: number,
  binario: boolean
): SemaforoEstado {
  return { id, nombre, valor, cola: [], owner: null, binario };
}

function construirEscenario(
  escenario: Escenario,
  opciones: { usarMutex: boolean; romperSimetria: boolean }
): SimEstado {
  const base: Omit<SimEstado, 'hilos' | 'semaforos' | 'orden'> = {
    buffer: [],
    bufferCap: 0,
    usaBuffer: false,
    contadorProd: 0,
    log: [],
    deadlock: false,
    carrera: false,
    pasos: 0,
    ultimoHilo: null,
  };

  if (escenario === 'seccion-critica') {
    const usarMutex = opciones.usarMutex;
    const semaforos: Record<string, SemaforoEstado> = {};
    const orden: string[] = [];
    if (usarMutex) {
      semaforos.mutex = nuevoSemaforo('mutex', 'mutex', 1, true);
      orden.push('mutex');
    }
    const programa = (): Instr[] => {
      const p: Instr[] = [];
      if (usarMutex) p.push({ t: 'wait', sem: 'mutex', etiqueta: 'wait(mutex)' });
      p.push({ t: 'accion', etiqueta: 'entra a la sección crítica', efecto: 'entra-sc' });
      p.push({ t: 'accion', etiqueta: 'modifica el dato compartido', efecto: 'trabaja' });
      p.push({ t: 'accion', etiqueta: 'sale de la sección crítica', efecto: 'sale-sc' });
      if (usarMutex) p.push({ t: 'signal', sem: 'mutex', etiqueta: 'signal(mutex)' });
      return p;
    };
    const hilos: HiloEstado[] = [0, 1, 2].map((i) => ({
      id: `H${i + 1}`,
      nombre: `Hilo ${i + 1}`,
      color: COLORES[i],
      pc: 0,
      iterRestantes: 2,
      estado: 'listo',
      enSC: false,
      programa: programa(),
    }));
    return { ...base, hilos, semaforos, orden };
  }

  if (escenario === 'productor-consumidor') {
    const cap = 4;
    const semaforos: Record<string, SemaforoEstado> = {
      vacias: nuevoSemaforo('vacias', 'vacías', cap, false),
      llenas: nuevoSemaforo('llenas', 'llenas', 0, false),
      mutex: nuevoSemaforo('mutex', 'mutex', 1, true),
    };
    const productor = (): Instr[] => [
      { t: 'accion', etiqueta: 'produce un dato', efecto: 'produce' },
      { t: 'wait', sem: 'vacias', etiqueta: 'wait(vacías)' },
      { t: 'wait', sem: 'mutex', etiqueta: 'wait(mutex)' },
      { t: 'accion', etiqueta: 'añade el dato al buffer', efecto: 'buffer-add' },
      { t: 'signal', sem: 'mutex', etiqueta: 'signal(mutex)' },
      { t: 'signal', sem: 'llenas', etiqueta: 'signal(llenas)' },
    ];
    const consumidor = (): Instr[] => [
      { t: 'wait', sem: 'llenas', etiqueta: 'wait(llenas)' },
      { t: 'wait', sem: 'mutex', etiqueta: 'wait(mutex)' },
      { t: 'accion', etiqueta: 'saca un dato del buffer', efecto: 'buffer-remove' },
      { t: 'signal', sem: 'mutex', etiqueta: 'signal(mutex)' },
      { t: 'signal', sem: 'vacias', etiqueta: 'signal(vacías)' },
      { t: 'accion', etiqueta: 'consume el dato', efecto: 'consume' },
    ];
    const hilos: HiloEstado[] = [
      { id: 'P1', nombre: 'Productor 1', color: COLORES[0], pc: 0, iterRestantes: 3, estado: 'listo', enSC: false, programa: productor() },
      { id: 'P2', nombre: 'Productor 2', color: COLORES[1], pc: 0, iterRestantes: 3, estado: 'listo', enSC: false, programa: productor() },
      { id: 'C1', nombre: 'Consumidor 1', color: COLORES[2], pc: 0, iterRestantes: 3, estado: 'listo', enSC: false, programa: consumidor() },
      { id: 'C2', nombre: 'Consumidor 2', color: COLORES[3], pc: 0, iterRestantes: 3, estado: 'listo', enSC: false, programa: consumidor() },
    ];
    return { ...base, hilos, semaforos, orden: ['vacias', 'llenas', 'mutex'], buffer: [], bufferCap: cap, usaBuffer: true };
  }

  // filosofos
  const n = 5;
  const semaforos: Record<string, SemaforoEstado> = {};
  const orden: string[] = [];
  for (let i = 0; i < n; i += 1) {
    semaforos[`t${i}`] = nuevoSemaforo(`t${i}`, `tenedor ${i}`, 1, true);
    orden.push(`t${i}`);
  }
  const hilos: HiloEstado[] = [];
  for (let i = 0; i < n; i += 1) {
    const izq = `t${i}`;
    const der = `t${(i + 1) % n}`;
    // Romper simetría: el último filósofo coge primero el de mayor índice
    const invertir = opciones.romperSimetria && i === n - 1;
    const primero = invertir ? der : izq;
    const segundo = invertir ? izq : der;
    const numPrimero = invertir ? (i + 1) % n : i;
    const numSegundo = invertir ? i : (i + 1) % n;
    hilos.push({
      id: `F${i}`,
      nombre: `Filósofo ${i}`,
      color: COLORES[i % COLORES.length],
      pc: 0,
      iterRestantes: 2,
      estado: 'listo',
      enSC: false,
      programa: [
        { t: 'accion', etiqueta: 'piensa', efecto: 'piensa' },
        { t: 'wait', sem: primero, etiqueta: `wait(tenedor ${numPrimero})` },
        { t: 'wait', sem: segundo, etiqueta: `wait(tenedor ${numSegundo})` },
        { t: 'accion', etiqueta: 'come', efecto: 'come' },
        { t: 'signal', sem: primero, etiqueta: `signal(tenedor ${numPrimero})` },
        { t: 'signal', sem: segundo, etiqueta: `signal(tenedor ${numSegundo})` },
      ],
    });
  }
  return { ...base, hilos, semaforos, orden };
}

// ============================================================
//  MOTOR (funciones puras sobre el estado)
// ============================================================

function clonarSim(sim: SimEstado): SimEstado {
  const semaforos: Record<string, SemaforoEstado> = {};
  for (const k of Object.keys(sim.semaforos)) {
    const s = sim.semaforos[k];
    semaforos[k] = { ...s, cola: [...s.cola] };
  }
  return {
    ...sim,
    hilos: sim.hilos.map((h) => ({ ...h, programa: h.programa })),
    semaforos,
    orden: [...sim.orden],
    buffer: [...sim.buffer],
    log: [...sim.log],
  };
}

function avanzarPC(hilo: HiloEstado): void {
  hilo.pc += 1;
  if (hilo.pc >= hilo.programa.length) {
    hilo.iterRestantes -= 1;
    if (hilo.iterRestantes > 0) {
      hilo.pc = 0;
      hilo.estado = 'listo';
    } else {
      hilo.estado = 'terminado';
    }
  } else {
    hilo.estado = 'listo';
  }
}

function comprobarEstadoGlobal(sim: SimEstado): void {
  const enSC = sim.hilos.filter((h) => h.enSC).length;
  if (enSC > 1) sim.carrera = true;
  const vivos = sim.hilos.filter((h) => h.estado !== 'terminado');
  if (vivos.length > 0 && vivos.every((h) => h.estado === 'bloqueado')) {
    sim.deadlock = true;
  }
}

// Ejecuta una instrucción del hilo indicado. Devuelve un nuevo estado.
function ejecutarPaso(simPrev: SimEstado, hiloId: string): SimEstado {
  const sim = clonarSim(simPrev);
  if (sim.deadlock) return simPrev;
  const hilo = sim.hilos.find((h) => h.id === hiloId);
  if (!hilo || hilo.estado !== 'listo') return simPrev;

  const instr = hilo.programa[hilo.pc];
  sim.ultimoHilo = hilo.id;

  if (instr.t === 'wait') {
    const sem = sim.semaforos[instr.sem];
    if (sem.valor > 0) {
      sem.valor -= 1;
      if (sem.binario) sem.owner = hilo.id;
      sim.log.push(`${hilo.nombre}: ${instr.etiqueta} → pasa (sem = ${sem.valor})`);
      avanzarPC(hilo);
    } else {
      hilo.estado = 'bloqueado';
      if (!sem.cola.includes(hilo.id)) sem.cola.push(hilo.id);
      sim.log.push(`${hilo.nombre}: ${instr.etiqueta} → BLOQUEADO (espera "${sem.nombre}")`);
    }
  } else if (instr.t === 'signal') {
    const sem = sim.semaforos[instr.sem];
    if (sem.cola.length > 0) {
      const despiertaId = sem.cola.shift() as string;
      const despierta = sim.hilos.find((h) => h.id === despiertaId);
      if (despierta) {
        if (sem.binario) sem.owner = despierta.id;
        avanzarPC(despierta); // su wait queda satisfecho
        sim.log.push(`${hilo.nombre}: ${instr.etiqueta} → despierta a ${despierta.nombre}`);
      }
    } else {
      sem.valor += 1;
      if (sem.binario) sem.owner = null;
      sim.log.push(`${hilo.nombre}: ${instr.etiqueta} → sem = ${sem.valor}`);
    }
    avanzarPC(hilo);
  } else {
    // acción
    switch (instr.efecto) {
      case 'entra-sc':
        hilo.enSC = true;
        break;
      case 'sale-sc':
        hilo.enSC = false;
        break;
      case 'buffer-add':
        if (sim.buffer.length < sim.bufferCap) {
          sim.contadorProd += 1;
          sim.buffer.push(sim.contadorProd);
        }
        break;
      case 'buffer-remove':
        sim.buffer.shift();
        break;
      default:
        break;
    }
    sim.log.push(`${hilo.nombre}: ${instr.etiqueta}`);
    avanzarPC(hilo);
  }

  sim.pasos += 1;
  comprobarEstadoGlobal(sim);
  return sim;
}

// Ejecuta un paso de cada hilo listo, en orden (round-robin).
function avanzarTodos(simPrev: SimEstado): SimEstado {
  let sim = simPrev;
  const ids = simPrev.hilos.map((h) => h.id);
  for (const id of ids) {
    const h = sim.hilos.find((x) => x.id === id);
    if (h && h.estado === 'listo') {
      sim = ejecutarPaso(sim, id);
    }
  }
  return sim;
}

function instrActual(hilo: HiloEstado): string {
  if (hilo.estado === 'terminado') return '— terminado —';
  const instr = hilo.programa[hilo.pc];
  return instr ? instr.etiqueta : '—';
}

// ============================================================
//  COMPONENTE
// ============================================================

const ESCENARIOS: { id: Escenario; nombre: string; desc: string }[] = [
  {
    id: 'seccion-critica',
    nombre: 'Sección crítica',
    desc: 'Tres hilos compiten por un recurso. Activa o desactiva el mutex y provoca una condición de carrera.',
  },
  {
    id: 'productor-consumidor',
    nombre: 'Productor-Consumidor',
    desc: 'Buffer acotado con tres semáforos (vacías, llenas, mutex). Los productores y consumidores se sincronizan.',
  },
  {
    id: 'filosofos',
    nombre: 'Filósofos comensales',
    desc: 'Cinco filósofos y cinco tenedores. Avanza a todos a la vez para provocar el interbloqueo clásico.',
  },
];

export default function SimuladorConcurrencia() {
  const [escenario, setEscenario] = useState<Escenario>('seccion-critica');
  const [usarMutex, setUsarMutex] = useState<boolean>(true);
  const [romperSimetria, setRomperSimetria] = useState<boolean>(false);
  const [sim, setSim] = useState<SimEstado>(() =>
    construirEscenario('seccion-critica', { usarMutex: true, romperSimetria: false })
  );
  const [auto, setAuto] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(700);
  const simRef = useRef(sim);
  simRef.current = sim;

  const reiniciar = useCallback(
    (e: Escenario, opts: { usarMutex: boolean; romperSimetria: boolean }) => {
      setAuto(false);
      setSim(construirEscenario(e, opts));
    },
    []
  );

  const handleEscenario = useCallback(
    (e: Escenario) => {
      setEscenario(e);
      reiniciar(e, { usarMutex, romperSimetria });
    },
    [reiniciar, usarMutex, romperSimetria]
  );

  const handleToggleMutex = useCallback(() => {
    const nuevo = !usarMutex;
    setUsarMutex(nuevo);
    reiniciar('seccion-critica', { usarMutex: nuevo, romperSimetria });
  }, [usarMutex, romperSimetria, reiniciar]);

  const handleToggleSimetria = useCallback(() => {
    const nuevo = !romperSimetria;
    setRomperSimetria(nuevo);
    reiniciar('filosofos', { usarMutex, romperSimetria: nuevo });
  }, [romperSimetria, usarMutex, reiniciar]);

  const handlePasoHilo = useCallback((id: string) => {
    setSim((prev) => ejecutarPaso(prev, id));
  }, []);

  const handleAvanzarTodos = useCallback(() => {
    setSim((prev) => avanzarTodos(prev));
  }, []);

  const handlePasoAleatorio = useCallback(() => {
    setSim((prev) => {
      const listos = prev.hilos.filter((h) => h.estado === 'listo');
      if (listos.length === 0) return prev;
      const idx = Math.floor(Math.random() * listos.length);
      return ejecutarPaso(prev, listos[idx].id);
    });
  }, []);

  const handleReiniciar = useCallback(() => {
    reiniciar(escenario, { usarMutex, romperSimetria });
  }, [reiniciar, escenario, usarMutex, romperSimetria]);

  // Modo automático: paso aleatorio en intervalos
  useEffect(() => {
    if (!auto) return undefined;
    const intervalo = setInterval(() => {
      const actual = simRef.current;
      const listos = actual.hilos.filter((h) => h.estado === 'listo');
      if (listos.length === 0 || actual.deadlock) {
        setAuto(false);
        return;
      }
      const idx = Math.floor(Math.random() * listos.length);
      setSim((prev) => ejecutarPaso(prev, listos[idx].id));
    }, velocidad);
    return () => clearInterval(intervalo);
  }, [auto, velocidad]);

  const todosTerminados = useMemo(
    () => sim.hilos.every((h) => h.estado === 'terminado'),
    [sim.hilos]
  );

  const semaforosVisibles = sim.orden.map((id) => sim.semaforos[id]).filter(Boolean);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Concurrencia</h1>
        <p className={styles.subtitle}>
          Ejecuta los hilos paso a paso y controla el interleaving: observa los semáforos, provoca
          una condición de carrera en la sección crítica y reproduce el interbloqueo de los
          filósofos comensales.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de escenario */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Escenario</h2>
          <div className={styles.escenarioSelector}>
            {ESCENARIOS.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => handleEscenario(e.id)}
                className={`${styles.escenarioBtn} ${escenario === e.id ? styles.escenarioActive : ''}`}
                aria-pressed={escenario === e.id}
              >
                <span className={styles.escenarioNombre}>{e.nombre}</span>
                <span className={styles.escenarioDesc}>{e.desc}</span>
              </button>
            ))}
          </div>

          {escenario === 'seccion-critica' && (
            <label className={styles.toggleLinea}>
              <input type="checkbox" checked={usarMutex} onChange={handleToggleMutex} />
              <span>
                Usar mutex (exclusión mutua). Desactívalo y avanza dos hilos a la vez para provocar
                una condición de carrera.
              </span>
            </label>
          )}
          {escenario === 'filosofos' && (
            <label className={styles.toggleLinea}>
              <input type="checkbox" checked={romperSimetria} onChange={handleToggleSimetria} />
              <span>
                Romper la simetría (el último filósofo coge los tenedores en orden inverso). Con esto
                el interbloqueo ya no puede producirse.
              </span>
            </label>
          )}
        </section>

        {/* Controles globales */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Control de la ejecución</h2>
          <div className={styles.controlesGlobales}>
            <button type="button" className={styles.ctrlBtn} onClick={handleAvanzarTodos}>
              Avanzar todos (una vez)
            </button>
            <button type="button" className={`${styles.ctrlBtn} ${styles.ctrlBtnSecondary}`} onClick={handlePasoAleatorio}>
              Paso aleatorio
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${auto ? styles.ctrlBtnDanger : styles.ctrlBtnSecondary}`}
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
            >
              {auto ? 'Pausar' : 'Auto'}
            </button>
            <button type="button" className={`${styles.ctrlBtn} ${styles.ctrlBtnDanger}`} onClick={handleReiniciar}>
              Reiniciar
            </button>
          </div>
          <div className={styles.speedControl}>
            <label htmlFor="vel-input">Velocidad del modo automático:</label>
            <input
              id="vel-input"
              type="range"
              min="200"
              max="1500"
              step="100"
              value={velocidad}
              onChange={(e) => setVelocidad(Number(e.target.value))}
            />
            <span className={styles.speedValue}>{velocidad} ms</span>
          </div>
        </section>

        {/* Avisos */}
        {sim.deadlock && (
          <div className={`${styles.banner} ${styles.bannerDanger}`} role="alert">
            <strong><span aria-hidden="true">🔒</span> Interbloqueo (deadlock) detectado.</strong> Todos los hilos vivos están
            bloqueados esperando un recurso que retiene otro. Nadie puede avanzar: se ha formado una
            espera circular.
          </div>
        )}
        {sim.carrera && (
          <div className={`${styles.banner} ${styles.bannerWarning}`} role="alert">
            <strong><span aria-hidden="true">⚠️</span> Condición de carrera.</strong> Dos hilos han estado en la sección crítica a la
            vez. Sin exclusión mutua, el resultado depende del orden de ejecución y los datos pueden
            corromperse.
          </div>
        )}
        {todosTerminados && !sim.deadlock && (
          <div className={`${styles.banner} ${styles.bannerOk}`} role="status">
            <strong><span aria-hidden="true">✅</span> Todos los hilos han terminado</strong> tras {sim.pasos} paso(s) sin
            interbloqueo.
          </div>
        )}

        {/* Hilos */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Hilos</h2>
          <div className={styles.hilosGrid}>
            {sim.hilos.map((h) => {
              let claseEstado = styles.estadoListo;
              if (h.estado === 'bloqueado') claseEstado = styles.estadoBloqueado;
              else if (h.estado === 'terminado') claseEstado = styles.estadoTerminado;
              return (
                <div
                  key={h.id}
                  className={`${styles.hiloCard} ${sim.ultimoHilo === h.id ? styles.hiloUltimo : ''}`}
                  style={{ borderTopColor: h.color }}
                >
                  <div className={styles.hiloHeader}>
                    <span className={styles.hiloNombre} style={{ color: h.color }}>
                      {h.nombre}
                    </span>
                    <span className={`${styles.hiloEstado} ${claseEstado}`}>
                      {h.estado === 'listo' && 'listo'}
                      {h.estado === 'bloqueado' && 'bloqueado'}
                      {h.estado === 'terminado' && 'terminado'}
                    </span>
                  </div>
                  <div className={styles.hiloInstr}>
                    <span className={styles.hiloInstrLabel}>Siguiente:</span> {instrActual(h)}
                  </div>
                  {h.enSC && <div className={styles.hiloSC}>● en la sección crítica</div>}
                  <button
                    type="button"
                    className={styles.hiloBtn}
                    onClick={() => handlePasoHilo(h.id)}
                    disabled={h.estado !== 'listo' || sim.deadlock}
                  >
                    <span aria-hidden="true">▶</span> Ejecutar paso
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Semáforos */}
        {semaforosVisibles.length > 0 && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Semáforos</h2>
            <div className={styles.semGrid}>
              {semaforosVisibles.map((s) => (
                <div key={s.id} className={styles.semCard}>
                  <div className={styles.semNombre}>{s.nombre}</div>
                  <div className={styles.semValor}>{s.valor}</div>
                  <div className={styles.semMeta}>
                    {s.binario && s.owner
                      ? `en manos de ${sim.hilos.find((h) => h.id === s.owner)?.nombre ?? s.owner}`
                      : s.binario
                        ? 'libre'
                        : 'contador'}
                  </div>
                  <div className={styles.semCola}>
                    Cola: {s.cola.length === 0 ? '—' : s.cola.map((id) => sim.hilos.find((h) => h.id === id)?.nombre ?? id).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Buffer */}
        {sim.usaBuffer && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Buffer compartido ({sim.buffer.length}/{sim.bufferCap})</h2>
            <div className={styles.bufferFila}>
              {Array.from({ length: sim.bufferCap }).map((_, i) => (
                <div
                  key={`celda-${i}`}
                  className={`${styles.bufferCelda} ${i < sim.buffer.length ? styles.bufferLleno : ''}`}
                >
                  {i < sim.buffer.length ? sim.buffer[i] : ''}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Log */}
        <div className={styles.opLog}>
          <div className={styles.opLogTitle}>Historial de pasos ({sim.pasos})</div>
          {sim.log.length === 0 ? (
            <div className={styles.opLogEmpty}>
              Aún no hay pasos. Pulsa &ldquo;Avanzar todos&rdquo; o ejecuta un hilo concreto.
            </div>
          ) : (
            <ul className={styles.opLogList}>
              {sim.log.slice(-20).map((l, idx) => (
                <li key={`log-${idx}-${l}`}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <EducationalSection
        title="Guía de Concurrencia y Sincronización"
        subtitle="Semáforos, exclusión mutua, condiciones de carrera e interbloqueo"
      >
        <h3>Conceptos clave comparados</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Qué es</th>
                <th>Problema que resuelve / causa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sección crítica</td>
                <td>Trozo de código que accede a un recurso compartido</td>
                <td>Debe ejecutarse en exclusión mutua para evitar carreras</td>
              </tr>
              <tr>
                <td>Mutex</td>
                <td>Semáforo binario (valor 0 o 1)</td>
                <td>Garantiza que solo un hilo entre a la sección crítica</td>
              </tr>
              <tr>
                <td>Semáforo contador</td>
                <td>Entero ≥ 0 con cola de espera</td>
                <td>Controla acceso a N recursos (buffers, conexiones…)</td>
              </tr>
              <tr>
                <td>Condición de carrera</td>
                <td>Resultado dependiente del interleaving</td>
                <td>Aparece sin sincronización; datos corruptos</td>
              </tr>
              <tr>
                <td>Interbloqueo (deadlock)</td>
                <td>Espera circular permanente</td>
                <td>Nadie avanza; requiere romper una condición de Coffman</td>
              </tr>
              <tr>
                <td>Inanición (starvation)</td>
                <td>Un hilo nunca obtiene el recurso</td>
                <td>Distinto del deadlock: el sistema avanza, pero ese hilo no</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗄️</span>
              <strong>Bases de datos y transacciones</strong>
            </div>
            <div className={styles.escenarioExample}>
              Los gestores de bases de datos usan bloqueos para que dos transacciones no modifiquen
              la misma fila a la vez. Si dos transacciones se bloquean mutuamente, el motor detecta el
              deadlock y aborta una de ellas.
            </div>
            <div className={styles.escenarioTip}>
              Tip: por eso a veces ves el error &ldquo;deadlock detected, transaction rolled back&rdquo;.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌐</span>
              <strong>Servidores web</strong>
            </div>
            <div className={styles.escenarioExample}>
              Un servidor atiende miles de peticiones con un pool de hilos. Un semáforo contador
              limita cuántas conexiones simultáneas acceden a la base de datos para no saturarla.
            </div>
            <div className={styles.escenarioTip}>
              Tip: el patrón productor-consumidor modela la cola de peticiones entrantes.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>Videojuegos y render</strong>
            </div>
            <div className={styles.escenarioExample}>
              El hilo de lógica produce fotogramas que el hilo de render consume. Un buffer acotado
              evita que el render dibuje un fotograma a medio escribir (tearing).
            </div>
            <div className={styles.escenarioTip}>
              Tip: el doble/triple buffering es un productor-consumidor con 2-3 huecos.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">💳</span>
              <strong>Sistemas bancarios</strong>
            </div>
            <div className={styles.escenarioExample}>
              Una transferencia bloquea dos cuentas. Si dos transferencias cruzadas bloquean las
              mismas cuentas en orden distinto, se produce un deadlock; el orden total de bloqueo lo evita.
            </div>
            <div className={styles.escenarioTip}>
              Tip: bloquear siempre las cuentas por número ascendente rompe la espera circular.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre un mutex y un semáforo?</h4>
            <p>
              Un mutex es un semáforo binario pensado para exclusión mutua: lo bloquea y lo libera el
              mismo hilo. Un semáforo contador puede tener un valor mayor que 1 y lo manipulan hilos
              distintos (un hilo hace wait y otro hace signal), como en el productor-consumidor.
            </p>
            <p className={styles.faqTip}>
              En el simulador, los semáforos binarios muestran &ldquo;en manos de&rdquo; y los contadores muestran &ldquo;contador&rdquo;.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué una condición de carrera es tan difícil de depurar?</h4>
            <p>
              Porque solo aparece con ciertos interleavings, que dependen del planificador del sistema
              operativo y de la carga de la máquina. El mismo programa puede funcionar mil veces y
              fallar la siguiente, lo que hace que el error sea casi imposible de reproducir a voluntad.
            </p>
            <p className={styles.faqTip}>
              Por eso aquí ejecutas los hilos a mano: puedes forzar justo el interleaving que rompe todo.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuáles son las condiciones de Coffman para un deadlock?</h4>
            <p>
              Son cuatro y deben darse a la vez: exclusión mutua (un recurso no se comparte),
              retención y espera (un hilo retiene recursos mientras pide otros), no apropiación (no se
              le pueden quitar a la fuerza) y espera circular (una cadena cerrada de esperas).
            </p>
            <p className={styles.faqTip}>
              Romper cualquiera de las cuatro evita el deadlock. Lo más práctico suele ser romper la espera circular.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Deadlock e inanición son lo mismo?</h4>
            <p>
              No. En un deadlock ningún hilo del grupo avanza nunca. En la inanición (starvation) el
              sistema sí progresa, pero un hilo concreto nunca consigue el recurso porque otros se le
              adelantan siempre. La inanición se combate con políticas justas (colas FIFO, prioridades).
            </p>
            <p className={styles.faqTip}>
              Un semáforo con cola FIFO, como el de este simulador, evita la inanición en la espera.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué los filósofos comensales se interbloquean?</h4>
            <p>
              Cada filósofo necesita dos tenedores. Si todos cogen primero el de su izquierda, los
              cinco tenedores quedan ocupados y ninguno puede coger el de la derecha: espera circular
              perfecta. Avanza a todos los filósofos a la vez en el simulador para verlo.
            </p>
            <p className={styles.faqTip}>
              Activa &ldquo;romper la simetría&rdquo; y comprueba que ya no ocurre.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa si el productor es más rápido que el consumidor?</h4>
            <p>
              El buffer se llena y el semáforo de huecos vacíos llega a cero. Entonces el productor se
              bloquea en su wait hasta que un consumidor saque un dato y haga signal. Así nunca se
              escribe fuera del buffer ni se pierden datos, por mucha diferencia de velocidad que haya.
            </p>
            <p className={styles.faqTip}>
              Ejecuta solo los productores y verás cómo se bloquean al llenar el buffer.
            </p>
          </div>
        </div>

        <h3>Cómo Resolver la Sección Crítica — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Identifica el recurso compartido</strong>
              <p>
                Busca qué dato leen y escriben varios hilos: una variable global, una estructura, un
                fichero. Ese acceso es tu sección crítica.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Protege la entrada con wait(mutex)</strong>
              <p>
                Antes de tocar el recurso, el hilo hace wait sobre un mutex inicializado a 1. Si otro
                hilo ya está dentro, el mutex vale 0 y este se bloquea.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Haz el trabajo dentro de la sección</strong>
              <p>
                Mantén la sección crítica lo más corta posible: cuanto más tiempo retengas el mutex,
                más esperan los demás y peor escala el sistema.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Libera con signal(mutex)</strong>
              <p>
                Al salir, haz signal. Si había hilos esperando, uno de ellos se despierta y entra; si
                no, el mutex vuelve a 1.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Comprueba que no introduces deadlock</strong>
              <p>
                Si un hilo necesita varios mutex, adquiérelos siempre en el mismo orden en todos los
                hilos. Así evitas la espera circular.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
            <strong>Secciones críticas cortas</strong>
            <p>Retén el mutex el menor tiempo posible. No hagas dentro operaciones lentas como E/S.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <strong>Orden total de bloqueo</strong>
            <p>Si tomas varios cerrojos, hazlo siempre en el mismo orden global. Rompe la espera circular.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Prefiere abstracciones de alto nivel</strong>
            <p>Colas concurrentes, monitores o canales suelen ser más seguros que semáforos a mano.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏳</span>
            <strong>Usa timeouts</strong>
            <p>Esperar un cerrojo con tiempo límite convierte un deadlock en un error tratable.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧪</span>
            <strong>Prueba interleavings adversos</strong>
            <p>No confíes en que &ldquo;casi siempre va bien&rdquo;. Fuerza el peor orden posible, como aquí.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📉</span>
            <strong>Menos estado compartido</strong>
            <p>El código sin datos compartidos no tiene carreras. Inmutabilidad y mensajes ayudan mucho.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes en programación concurrente</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Olvidar el signal (o el unlock): el recurso queda bloqueado para siempre.</li>
            <li>Adquirir varios cerrojos en distinto orden según el hilo: provoca deadlock.</li>
            <li>Suponer que una operación &ldquo;simple&rdquo; (i++) es atómica: casi nunca lo es.</li>
            <li>Hacer la sección crítica enorme y matar el rendimiento (serializa todo).</li>
            <li>Usar variables compartidas sin marcarlas como volátiles/atómicas cuando toca.</li>
            <li>Confundir deadlock con inanición y aplicar la solución equivocada.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-concurrencia')} />
      <ShareCard appName="simulador-concurrencia" />
      <Footer appName="simulador-concurrencia" />
    </div>
  );
}
