'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './SimuladorLogicaSecuencial.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type CircuitoId = 'ff-d' | 'ff-jk' | 'ff-t' | 'ff-sr' | 'contador' | 'registro' | 'detector';
type Familia = 'Biestable' | 'Contador' | 'Registro' | 'Máquina de estados';
type EstadoFsm = 'S0' | 'S1' | 'S2' | 'S3';

interface EntradaDef {
  id: string;
  etiqueta: string;
  descripcion: string;
}

interface CircuitoDef {
  id: CircuitoId;
  nombre: string;
  familia: Familia;
  icono: string;
  ecuacion: string;
  descripcion: string;
  entradas: EntradaDef[];
}

interface EstadoInterno {
  q: number;          // biestables: salida Q
  bits: number[];     // contador y registro: [Q3, Q2, Q1, Q0]
  fsm: EstadoFsm;     // máquina de estados
}

interface Muestra {
  ciclo: number;
  entradas: Record<string, number>;
  salidas: Record<string, number>;
  prohibido: boolean;
}

interface SimState {
  interno: EstadoInterno;
  historial: Muestra[];
  ciclo: number;
  aviso: string | null;
}

interface Config {
  modulo: number;
  ascendente: boolean;
  haciaDerecha: boolean;
}

// ============================================
// DATOS
// ============================================
const CIRCUITOS: CircuitoDef[] = [
  {
    id: 'ff-d',
    nombre: 'Biestable D',
    familia: 'Biestable',
    icono: '🔒',
    ecuacion: 'Q(t+1) = D',
    descripcion: 'Copia en la salida el valor que tenga la entrada D en el flanco activo del reloj. Es la celda de memoria elemental: mientras no llegue un flanco, la salida no cambia.',
    entradas: [{ id: 'D', etiqueta: 'D', descripcion: 'Dato que se almacenará en el próximo flanco' }],
  },
  {
    id: 'ff-jk',
    nombre: 'Biestable JK',
    familia: 'Biestable',
    icono: '🔁',
    ecuacion: 'Q(t+1) = J·Q̄ + K̄·Q',
    descripcion: 'El biestable más completo: con J y K cubre los cuatro comportamientos posibles (mantener, poner a 0, poner a 1 y conmutar). No tiene combinaciones prohibidas.',
    entradas: [
      { id: 'J', etiqueta: 'J', descripcion: 'Entrada de puesta a 1' },
      { id: 'K', etiqueta: 'K', descripcion: 'Entrada de puesta a 0' },
    ],
  },
  {
    id: 'ff-t',
    nombre: 'Biestable T',
    familia: 'Biestable',
    icono: '↔️',
    ecuacion: 'Q(t+1) = T ⊕ Q',
    descripcion: 'Conmuta la salida cuando T = 1 y la mantiene cuando T = 0. Es la base de los contadores: encadenando biestables T se divide la frecuencia entre dos en cada etapa.',
    entradas: [{ id: 'T', etiqueta: 'T', descripcion: 'Orden de conmutación (toggle)' }],
  },
  {
    id: 'ff-sr',
    nombre: 'Biestable SR',
    familia: 'Biestable',
    icono: '⚠️',
    ecuacion: 'Q(t+1) = S + R̄·Q   (con S·R = 0)',
    descripcion: 'El biestable histórico: S pone a 1 y R pone a 0. La combinación S = 1 con R = 1 es un estado prohibido, porque son dos órdenes contradictorias a la vez.',
    entradas: [
      { id: 'S', etiqueta: 'S', descripcion: 'Set: pone la salida a 1' },
      { id: 'R', etiqueta: 'R', descripcion: 'Reset: pone la salida a 0' },
    ],
  },
  {
    id: 'contador',
    nombre: 'Contador binario 4 bits',
    familia: 'Contador',
    icono: '🔢',
    ecuacion: 'valor(t+1) = (valor ± 1) mod M',
    descripcion: 'Cuenta pulsos de reloj en binario natural. Con 4 biestables llega hasta el módulo 16; con un módulo menor, el contador se fuerza a cero al alcanzarlo.',
    entradas: [],
  },
  {
    id: 'registro',
    nombre: 'Registro de desplazamiento',
    familia: 'Registro',
    icono: '➡️',
    ecuacion: 'Qᵢ(t+1) = Qᵢ₋₁(t)',
    descripcion: 'Cada biestable copia en el flanco el valor de su vecino, de modo que el dato recorre el registro una posición por ciclo. Convierte datos serie en paralelo y al revés.',
    entradas: [{ id: 'SER', etiqueta: 'Entrada serie', descripcion: 'Bit que entra por el extremo del registro' }],
  },
  {
    id: 'detector',
    nombre: 'Máquina de estados: detector 101',
    familia: 'Máquina de estados',
    icono: '🎯',
    ecuacion: 'Z = 1 en el estado S3 (Moore)',
    descripcion: 'Lee un bit por ciclo y activa la salida Z cuando reconoce la secuencia 1-0-1. Admite solapamiento: la última pareja "01" puede reutilizarse para la siguiente detección.',
    entradas: [{ id: 'X', etiqueta: 'X', descripcion: 'Bit de entrada de la secuencia' }],
  },
];

const NOMBRE_ESTADOS: Record<EstadoFsm, string> = {
  S0: 'Sin coincidencia',
  S1: 'Visto 1',
  S2: 'Visto 10',
  S3: 'Detectado 101',
};

const MAX_CICLOS = 12;
const N_BITS = 4;

// ============================================
// LÓGICA DEL SIMULADOR
// ============================================
function estadoInicial(): SimState {
  return {
    interno: { q: 0, bits: [0, 0, 0, 0], fsm: 'S0' },
    historial: [],
    ciclo: 0,
    aviso: null,
  };
}

function bitsAValor(bits: number[]): number {
  return bits.reduce((acc, b) => acc * 2 + b, 0);
}

function valorABits(valor: number): number[] {
  const salida: number[] = [];
  for (let i = N_BITS - 1; i >= 0; i--) {
    salida.push((valor >> i) & 1);
  }
  return salida;
}

/** Transición de la máquina de estados detectora de 101 (Moore, con solapamiento). */
function transicionFsm(estado: EstadoFsm, x: number): EstadoFsm {
  switch (estado) {
    case 'S0': return x === 1 ? 'S1' : 'S0';
    case 'S1': return x === 1 ? 'S1' : 'S2';
    case 'S2': return x === 1 ? 'S3' : 'S0';
    case 'S3': return x === 1 ? 'S1' : 'S2';
  }
}

/** Salidas visibles del circuito en su estado actual. */
function salidasDe(circuito: CircuitoId, interno: EstadoInterno): Record<string, number> {
  switch (circuito) {
    case 'ff-d':
    case 'ff-jk':
    case 'ff-t':
    case 'ff-sr':
      return { Q: interno.q, 'Q̄': interno.q === 1 ? 0 : 1 };
    case 'contador':
    case 'registro':
      return { Q3: interno.bits[0], Q2: interno.bits[1], Q1: interno.bits[2], Q0: interno.bits[3] };
    case 'detector':
      return { Z: interno.fsm === 'S3' ? 1 : 0 };
  }
}

/** Aplica un flanco activo de reloj y devuelve el nuevo estado de la simulación. */
function avanzarCiclo(
  prev: SimState,
  circuito: CircuitoId,
  entradas: Record<string, number>,
  cfg: Config
): SimState {
  const { q, bits, fsm } = prev.interno;
  let nuevoInterno: EstadoInterno = { q, bits, fsm };
  let aviso: string | null = null;
  let prohibido = false;

  switch (circuito) {
    case 'ff-d':
      nuevoInterno = { ...prev.interno, q: entradas.D };
      break;

    case 'ff-jk': {
      // Q(t+1) = J·Q̄ + K̄·Q
      const siguiente = (entradas.J & (q === 1 ? 0 : 1)) | ((entradas.K === 1 ? 0 : 1) & q);
      nuevoInterno = { ...prev.interno, q: siguiente };
      break;
    }

    case 'ff-t':
      nuevoInterno = { ...prev.interno, q: q ^ entradas.T };
      break;

    case 'ff-sr': {
      if (entradas.S === 1 && entradas.R === 1) {
        // Estado prohibido: el circuito real quedaría indeterminado
        prohibido = true;
        aviso = 'S = 1 y R = 1 simultáneamente es un estado prohibido: son dos órdenes contradictorias. En un circuito real la salida quedaría indeterminada. La simulación mantiene el valor anterior y marca el ciclo en rojo.';
        nuevoInterno = { ...prev.interno };
      } else if (entradas.S === 1) {
        nuevoInterno = { ...prev.interno, q: 1 };
      } else if (entradas.R === 1) {
        nuevoInterno = { ...prev.interno, q: 0 };
      } else {
        nuevoInterno = { ...prev.interno };
      }
      break;
    }

    case 'contador': {
      const valorActual = bitsAValor(bits);
      let siguiente: number;
      if (cfg.ascendente) {
        siguiente = valorActual + 1 >= cfg.modulo ? 0 : valorActual + 1;
      } else {
        siguiente = valorActual - 1 < 0 || valorActual - 1 >= cfg.modulo ? cfg.modulo - 1 : valorActual - 1;
      }
      nuevoInterno = { ...prev.interno, bits: valorABits(siguiente) };
      break;
    }

    case 'registro': {
      const nuevosBits = cfg.haciaDerecha
        ? [entradas.SER, bits[0], bits[1], bits[2]]
        : [bits[1], bits[2], bits[3], entradas.SER];
      nuevoInterno = { ...prev.interno, bits: nuevosBits };
      break;
    }

    case 'detector':
      nuevoInterno = { ...prev.interno, fsm: transicionFsm(fsm, entradas.X) };
      break;
  }

  const def = CIRCUITOS.find(c => c.id === circuito);
  const entradasCiclo: Record<string, number> = {};
  def?.entradas.forEach(e => { entradasCiclo[e.etiqueta] = entradas[e.id]; });

  const muestra: Muestra = {
    ciclo: prev.ciclo + 1,
    entradas: entradasCiclo,
    salidas: salidasDe(circuito, nuevoInterno),
    prohibido,
  };

  const historial = [...prev.historial, muestra].slice(-MAX_CICLOS);

  return { interno: nuevoInterno, historial, ciclo: prev.ciclo + 1, aviso };
}

// ============================================
// TABLAS CARACTERÍSTICAS
// ============================================
interface FilaTabla {
  clave: string;
  entradas: string[];
  resultado: string;
  comentario: string;
}

const TABLAS: Partial<Record<CircuitoId, { cabeceras: string[]; filas: FilaTabla[] }>> = {
  'ff-d': {
    cabeceras: ['D', 'Q(t+1)', 'Comportamiento'],
    filas: [
      { clave: '0', entradas: ['0'], resultado: '0', comentario: 'Almacena un 0' },
      { clave: '1', entradas: ['1'], resultado: '1', comentario: 'Almacena un 1' },
    ],
  },
  'ff-jk': {
    cabeceras: ['J', 'K', 'Q(t+1)', 'Comportamiento'],
    filas: [
      { clave: '00', entradas: ['0', '0'], resultado: 'Q', comentario: 'Mantiene el valor' },
      { clave: '01', entradas: ['0', '1'], resultado: '0', comentario: 'Puesta a 0 (reset)' },
      { clave: '10', entradas: ['1', '0'], resultado: '1', comentario: 'Puesta a 1 (set)' },
      { clave: '11', entradas: ['1', '1'], resultado: 'Q̄', comentario: 'Conmuta (toggle)' },
    ],
  },
  'ff-t': {
    cabeceras: ['T', 'Q(t+1)', 'Comportamiento'],
    filas: [
      { clave: '0', entradas: ['0'], resultado: 'Q', comentario: 'Mantiene el valor' },
      { clave: '1', entradas: ['1'], resultado: 'Q̄', comentario: 'Conmuta: divide la frecuencia entre 2' },
    ],
  },
  'ff-sr': {
    cabeceras: ['S', 'R', 'Q(t+1)', 'Comportamiento'],
    filas: [
      { clave: '00', entradas: ['0', '0'], resultado: 'Q', comentario: 'Mantiene el valor' },
      { clave: '01', entradas: ['0', '1'], resultado: '0', comentario: 'Puesta a 0 (reset)' },
      { clave: '10', entradas: ['1', '0'], resultado: '1', comentario: 'Puesta a 1 (set)' },
      { clave: '11', entradas: ['1', '1'], resultado: '—', comentario: 'Estado prohibido' },
    ],
  },
  detector: {
    cabeceras: ['Estado', 'X = 0', 'X = 1', 'Salida Z'],
    filas: [
      { clave: 'S0', entradas: ['S0 · sin coincidencia'], resultado: 'S0 | S1', comentario: '0' },
      { clave: 'S1', entradas: ['S1 · visto 1'], resultado: 'S2 | S1', comentario: '0' },
      { clave: 'S2', entradas: ['S2 · visto 10'], resultado: 'S0 | S3', comentario: '0' },
      { clave: 'S3', entradas: ['S3 · detectado 101'], resultado: 'S2 | S1', comentario: '1' },
    ],
  },
};

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorLogicaSecuencial() {
  const [circuitoId, setCircuitoId] = useState<CircuitoId>('ff-d');
  const [entradas, setEntradas] = useState<Record<string, number>>({
    D: 0, J: 0, K: 0, T: 0, S: 0, R: 0, X: 0, SER: 1,
  });
  const [sim, setSim] = useState<SimState>(estadoInicial);
  const [auto, setAuto] = useState(false);
  const [velocidad, setVelocidad] = useState(700);
  const [modulo, setModulo] = useState(16);
  const [ascendente, setAscendente] = useState(true);
  const [haciaDerecha, setHaciaDerecha] = useState(true);

  const circuito = useMemo(
    () => CIRCUITOS.find(c => c.id === circuitoId) ?? CIRCUITOS[0],
    [circuitoId]
  );

  const cfg: Config = useMemo(
    () => ({ modulo, ascendente, haciaDerecha }),
    [modulo, ascendente, haciaDerecha]
  );

  const pulso = useCallback(() => {
    setSim(prev => avanzarCiclo(prev, circuitoId, entradas, cfg));
  }, [circuitoId, entradas, cfg]);

  // Reloj automático
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(pulso, velocidad);
    return () => window.clearInterval(id);
  }, [auto, velocidad, pulso]);

  const seleccionarCircuito = (id: CircuitoId) => {
    setCircuitoId(id);
    setSim(estadoInicial());
    setAuto(false);
  };

  const reiniciar = () => {
    setSim(estadoInicial());
    setAuto(false);
  };

  const alternarEntrada = (id: string) => {
    setEntradas(prev => ({ ...prev, [id]: prev[id] === 1 ? 0 : 1 }));
  };

  const salidas = salidasDe(circuitoId, sim.interno);
  const valorContador = bitsAValor(sim.interno.bits);
  const tabla = TABLAS[circuitoId];

  // Fila activa de la tabla característica según las entradas actuales
  const filaActiva = useMemo(() => {
    if (circuitoId === 'ff-d') return String(entradas.D);
    if (circuitoId === 'ff-t') return String(entradas.T);
    if (circuitoId === 'ff-jk') return `${entradas.J}${entradas.K}`;
    if (circuitoId === 'ff-sr') return `${entradas.S}${entradas.R}`;
    if (circuitoId === 'detector') return sim.interno.fsm;
    return '';
  }, [circuitoId, entradas, sim.interno.fsm]);

  // ============================================
  // CRONOGRAMA
  // ============================================
  const senalesCronograma = useMemo(() => {
    const filas: { nombre: string; valores: number[]; destacada: boolean }[] = [];
    const ciclos = sim.historial.length;
    if (ciclos === 0) return filas;

    circuito.entradas.forEach(e => {
      filas.push({
        nombre: e.etiqueta === 'Entrada serie' ? 'SER' : e.etiqueta,
        valores: sim.historial.map(m => m.entradas[e.etiqueta] ?? 0),
        destacada: false,
      });
    });

    const nombresSalida = Object.keys(sim.historial[ciclos - 1].salidas);
    nombresSalida.forEach(nombre => {
      filas.push({
        nombre,
        valores: sim.historial.map(m => m.salidas[nombre] ?? 0),
        destacada: true,
      });
    });

    return filas;
  }, [sim.historial, circuito]);

  const anchoCiclo = 52;
  const altoFila = 40;
  const margenIzq = 74;
  const nCiclos = sim.historial.length;
  const anchoSvg = margenIzq + Math.max(nCiclos, 1) * anchoCiclo + 12;
  const altoSvg = (senalesCronograma.length + 1) * altoFila + 24;

  const ondaPuntos = (valores: number[], yFila: number): string => {
    const alto = yFila + 6;
    const bajo = yFila + 26;
    const puntos: string[] = [];
    valores.forEach((v, i) => {
      const x0 = margenIzq + i * anchoCiclo;
      const x1 = x0 + anchoCiclo;
      const y = v === 1 ? alto : bajo;
      puntos.push(`${x0},${y}`, `${x1},${y}`);
    });
    return puntos.join(' ');
  };

  const ondaReloj = (n: number, yFila: number): string => {
    const alto = yFila + 6;
    const bajo = yFila + 26;
    const puntos: string[] = [];
    for (let i = 0; i < n; i++) {
      const x0 = margenIzq + i * anchoCiclo;
      const medio = x0 + anchoCiclo / 2;
      const x1 = x0 + anchoCiclo;
      puntos.push(`${x0},${alto}`, `${medio},${alto}`, `${medio},${bajo}`, `${x1},${bajo}`);
    }
    return puntos.join(' ');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">⏱️</span> Simulador de Lógica Secuencial</h1>
        <p className={styles.subtitle}>
          Biestables (<em>flip-flops</em>), contadores y registros que <strong>recuerdan</strong>: dale al reloj
          pulso a pulso y observa cómo evoluciona el circuito, con su cronograma dibujado en vivo.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR DE CIRCUITO */}
      <div className={styles.circuitoSelector} role="group" aria-label="Seleccionar circuito secuencial">
        {CIRCUITOS.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.circuitoBtn} ${circuitoId === c.id ? styles.circuitoBtnActive : ''}`}
            onClick={() => seleccionarCircuito(c.id)}
            aria-pressed={circuitoId === c.id}
          >
            <span className={styles.familiaBadge}>{c.familia}</span>
            <span className={styles.circuitoNombre}>
              <span aria-hidden="true">{c.icono}</span> {c.nombre}
            </span>
          </button>
        ))}
      </div>

      {/* FICHA DEL CIRCUITO */}
      <div className={styles.fichaPanel}>
        <p className={styles.ecuacionLabel}>Ecuación característica</p>
        <p className={styles.ecuacionText}>{circuito.ecuacion}</p>
        <p className={styles.descripcionCircuito}>{circuito.descripcion}</p>
      </div>

      {/* PANEL DE CONTROL */}
      <div className={styles.controlPanel}>
        <div className={styles.controlBloque}>
          <p className={styles.controlTitulo}>Entradas</p>
          {circuito.entradas.length === 0 ? (
            <p className={styles.sinEntradas}>
              Este circuito no tiene entradas de datos: solo cuenta los flancos del reloj.
            </p>
          ) : (
            <div className={styles.entradasRow}>
              {circuito.entradas.map(e => (
                <button
                  key={e.id}
                  type="button"
                  className={`${styles.entradaToggle} ${entradas[e.id] === 1 ? styles.entradaAlta : ''}`}
                  onClick={() => alternarEntrada(e.id)}
                  aria-pressed={entradas[e.id] === 1}
                  title={e.descripcion}
                >
                  <span className={styles.entradaEtiqueta}>{e.etiqueta}</span>
                  <span className={styles.entradaValor}>{entradas[e.id]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Configuración específica del contador */}
          {circuitoId === 'contador' && (
            <div className={styles.configRow}>
              <label className={styles.configLabel} htmlFor="modulo">
                Módulo de cuenta
                <input
                  id="modulo"
                  type="number"
                  min={2}
                  max={16}
                  value={modulo}
                  onChange={e => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) setModulo(Math.min(16, Math.max(2, Math.trunc(v))));
                  }}
                  className={styles.inputNumero}
                />
              </label>
              <div className={styles.sentidoGroup} role="group" aria-label="Sentido de la cuenta">
                <button
                  type="button"
                  className={`${styles.sentidoBtn} ${ascendente ? styles.sentidoActivo : ''}`}
                  onClick={() => setAscendente(true)}
                  aria-pressed={ascendente}
                >Ascendente</button>
                <button
                  type="button"
                  className={`${styles.sentidoBtn} ${!ascendente ? styles.sentidoActivo : ''}`}
                  onClick={() => setAscendente(false)}
                  aria-pressed={!ascendente}
                >Descendente</button>
              </div>
            </div>
          )}

          {/* Configuración específica del registro */}
          {circuitoId === 'registro' && (
            <div className={styles.configRow}>
              <div className={styles.sentidoGroup} role="group" aria-label="Dirección del desplazamiento">
                <button
                  type="button"
                  className={`${styles.sentidoBtn} ${haciaDerecha ? styles.sentidoActivo : ''}`}
                  onClick={() => setHaciaDerecha(true)}
                  aria-pressed={haciaDerecha}
                >Desplazar a la derecha</button>
                <button
                  type="button"
                  className={`${styles.sentidoBtn} ${!haciaDerecha ? styles.sentidoActivo : ''}`}
                  onClick={() => setHaciaDerecha(false)}
                  aria-pressed={!haciaDerecha}
                >Desplazar a la izquierda</button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.controlBloque}>
          <p className={styles.controlTitulo}>Reloj</p>
          <div className={styles.relojRow}>
            <button type="button" className={styles.btnPulso} onClick={pulso}>
              <span aria-hidden="true">⚡</span> Pulso de reloj
            </button>
            <button
              type="button"
              className={`${styles.btnAuto} ${auto ? styles.btnAutoActivo : ''}`}
              onClick={() => setAuto(a => !a)}
              aria-pressed={auto}
            >
              <span aria-hidden="true">{auto ? '⏸️' : '▶️'}</span> {auto ? 'Pausar' : 'Automático'}
            </button>
            <button type="button" className={styles.btnReset} onClick={reiniciar}>
              <span aria-hidden="true">🔄</span> Reiniciar
            </button>
          </div>
          <label className={styles.configLabel} htmlFor="velocidad">
            Periodo del reloj: {velocidad} ms
            <input
              id="velocidad"
              type="range"
              min={200}
              max={1500}
              step={100}
              value={velocidad}
              onChange={e => setVelocidad(Number(e.target.value))}
              className={styles.slider}
            />
          </label>
          <p className={styles.cicloContador}>
            Ciclos ejecutados: <strong>{sim.ciclo}</strong>
          </p>
        </div>
      </div>

      {/* AVISO DE ESTADO PROHIBIDO */}
      {sim.aviso && (
        <div className={styles.avisoProhibido} role="alert" aria-live="polite">
          <span aria-hidden="true">⚠️</span> {sim.aviso}
        </div>
      )}

      {/* ESTADO ACTUAL */}
      <section className={styles.estadoPanel} aria-label="Estado actual del circuito">
        <h2 className={styles.panelTitulo}>Estado actual</h2>

        {circuito.familia === 'Biestable' && (
          <div className={styles.salidasRow}>
            {Object.entries(salidas).map(([nombre, valor]) => (
              <div key={nombre} className={`${styles.salidaChip} ${valor === 1 ? styles.salidaAlta : ''}`}>
                <span className={styles.salidaNombre}>{nombre}</span>
                <span className={styles.salidaValor}>{valor}</span>
              </div>
            ))}
          </div>
        )}

        {(circuitoId === 'contador' || circuitoId === 'registro') && (
          <>
            <div className={styles.celdasRow}>
              {sim.interno.bits.map((bit, i) => (
                <div key={i} className={`${styles.celda} ${bit === 1 ? styles.celdaAlta : ''}`}>
                  <span className={styles.celdaNombre}>Q{N_BITS - 1 - i}</span>
                  <span className={styles.celdaValor}>{bit}</span>
                </div>
              ))}
            </div>
            {circuitoId === 'contador' ? (
              <p className={styles.lecturaValor}>
                Valor de la cuenta: <strong>{valorContador}</strong> en decimal ·{' '}
                <code>{sim.interno.bits.join('')}</code> en binario · módulo {modulo} ·{' '}
                cuenta {ascendente ? 'ascendente' : 'descendente'}
              </p>
            ) : (
              <p className={styles.lecturaValor}>
                Contenido del registro: <code>{sim.interno.bits.join('')}</code> ·{' '}
                el dato entra por {haciaDerecha ? 'Q3' : 'Q0'} y se pierde por {haciaDerecha ? 'Q0' : 'Q3'}
              </p>
            )}
          </>
        )}

        {circuitoId === 'detector' && (
          <>
            <div className={styles.estadosRow}>
              {(['S0', 'S1', 'S2', 'S3'] as EstadoFsm[]).map(e => (
                <div
                  key={e}
                  className={`${styles.estadoNodo} ${sim.interno.fsm === e ? styles.estadoActivo : ''}`}
                >
                  <span className={styles.estadoNombre}>{e}</span>
                  <span className={styles.estadoDesc}>{NOMBRE_ESTADOS[e]}</span>
                </div>
              ))}
            </div>
            <div className={styles.salidasRow}>
              <div className={`${styles.salidaChip} ${salidas.Z === 1 ? styles.salidaAlta : ''}`}>
                <span className={styles.salidaNombre}>Z</span>
                <span className={styles.salidaValor}>{salidas.Z}</span>
              </div>
            </div>
            <p className={styles.lecturaValor}>
              {salidas.Z === 1
                ? 'Secuencia 101 detectada en este ciclo.'
                : 'Aún no se ha completado la secuencia 101.'}
            </p>
          </>
        )}
      </section>

      {/* CRONOGRAMA */}
      <section className={styles.cronogramaPanel} aria-label="Cronograma de señales">
        <h2 className={styles.panelTitulo}>Cronograma (diagrama de tiempos)</h2>
        {nCiclos === 0 ? (
          <p className={styles.mensajeEspera}>
            Pulsa <strong>Pulso de reloj</strong> o activa el modo automático para empezar a dibujar las señales.
          </p>
        ) : (
          <>
            <div className={styles.cronogramaWrapper}>
              <svg
                width={anchoSvg}
                height={altoSvg}
                viewBox={`0 0 ${anchoSvg} ${altoSvg}`}
                className={styles.cronogramaSvg}
                role="img"
                aria-label={`Cronograma de ${nCiclos} ciclos de reloj con ${senalesCronograma.length} señales`}
              >
                {/* Líneas de flanco */}
                {Array.from({ length: nCiclos }, (_, i) => (
                  <line
                    key={`flanco-${i}`}
                    x1={margenIzq + i * anchoCiclo}
                    y1={8}
                    x2={margenIzq + i * anchoCiclo}
                    y2={altoSvg - 16}
                    className={styles.lineaFlanco}
                  />
                ))}

                {/* Reloj */}
                <text x={8} y={altoFila * 0 + 24} className={styles.etiquetaSenal}>CLK</text>
                <polyline points={ondaReloj(nCiclos, altoFila * 0)} className={styles.ondaReloj} />

                {/* Señales */}
                {senalesCronograma.map((s, idx) => {
                  const y = altoFila * (idx + 1);
                  return (
                    <g key={s.nombre}>
                      <text x={8} y={y + 24} className={styles.etiquetaSenal}>{s.nombre}</text>
                      <polyline
                        points={ondaPuntos(s.valores, y)}
                        className={s.destacada ? styles.ondaSalida : styles.ondaEntrada}
                      />
                    </g>
                  );
                })}

                {/* Números de ciclo */}
                {sim.historial.map((m, i) => (
                  <text
                    key={`ciclo-${m.ciclo}`}
                    x={margenIzq + i * anchoCiclo + anchoCiclo / 2}
                    y={altoSvg - 4}
                    textAnchor="middle"
                    className={`${styles.numeroCiclo} ${m.prohibido ? styles.cicloProhibido : ''}`}
                  >
                    {m.ciclo}
                  </text>
                ))}
              </svg>
            </div>
            <p className={styles.leyendaCronograma}>
              Cada línea vertical marca un <strong>flanco activo de subida</strong>: es el instante en que el
              circuito lee sus entradas y actualiza el estado. Se muestran los últimos {MAX_CICLOS} ciclos.
            </p>
          </>
        )}
      </section>

      {/* TABLA CARACTERÍSTICA */}
      {tabla && (
        <section className={styles.tablaPanel} aria-label="Tabla característica del circuito">
          <h2 className={styles.panelTitulo}>
            {circuitoId === 'detector' ? 'Tabla de transición de estados' : 'Tabla característica'}
          </h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  {tabla.cabeceras.map(c => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {tabla.filas.map(f => (
                  <tr key={f.clave} className={filaActiva === f.clave ? styles.filaActiva : ''}>
                    {f.entradas.map((v, i) => <td key={i}>{v}</td>)}
                    <td>{f.resultado}</td>
                    <td>{f.comentario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.leyendaTabla}>
            {circuitoId === 'detector'
              ? 'La fila resaltada es el estado actual de la máquina. La columna de destino se lee «X = 0 | X = 1».'
              : 'La fila resaltada corresponde a las entradas que aplicarás en el próximo flanco de reloj.'}
          </p>
        </section>
      )}

      {/* BLOQUE EDUCATIVO */}
      <EducationalSection
        title="Aprende Lógica Secuencial"
        subtitle="Por qué un circuito necesita memoria y cómo se diseñan biestables, contadores y registros"
      >
        <section>
          <h3>¿Qué es la lógica secuencial?</h3>
          <p>
            Un circuito <strong>combinacional</strong> (puertas AND, OR, NOT, un sumador, un multiplexor) es una
            función pura: las mismas entradas producen siempre la misma salida. En cuanto un sistema necesita
            recordar algo —cuántos pulsos han llegado, qué botón se pulsó antes, en qué punto de una secuencia
            está—, la lógica combinacional se queda corta. Ahí entra la <strong>lógica secuencial</strong>: la
            salida depende de las entradas <em>y</em> del estado interno almacenado.
          </p>
          <p>
            Ese estado lo guardan los <strong>biestables</strong> o <em>flip-flops</em>, celdas capaces de mantener
            un bit indefinidamente. En un sistema <strong>síncrono</strong>, todos los biestables actualizan su
            valor a la vez, en el <strong>flanco activo</strong> de una señal común llamada reloj. Entre flancos,
            las entradas pueden cambiar libremente: lo que cuenta es el valor que tienen justo en el flanco.
          </p>
          <div className={styles.formulaBox}>
            Estado siguiente = f(entradas, estado actual) &nbsp;·&nbsp; Salida = g(estado actual) en Moore, o
            g(entradas, estado) en Mealy
          </div>
          <p>
            El nombre de cada biestable viene de sus entradas de control: <strong>D</strong> de <em>data</em>,
            <strong> T</strong> de <em>toggle</em>, <strong>SR</strong> de <em>set/reset</em> y{' '}
            <strong>JK</strong>, que amplía el SR eliminando su combinación prohibida. Con biestables encadenados
            se construyen los dos bloques presentes en cualquier sistema digital: <strong>contadores</strong>
            (cuentan eventos, dividen frecuencias, generan direcciones) y <strong>registros</strong> (almacenan y
            desplazan datos).
          </p>
        </section>

        <section>
          <h3>Los siete circuitos del simulador: comparativa</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Circuito</th>
                  <th>Entradas</th>
                  <th>Ecuación o regla</th>
                  <th>Bits de estado</th>
                  <th>Punto delicado</th>
                  <th>Uso habitual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Biestable D</td>
                  <td>D</td>
                  <td>Q(t+1) = D</td>
                  <td>1</td>
                  <td>Requiere respetar los tiempos de <em>setup</em> y <em>hold</em></td>
                  <td>Registros, sincronizadores, memoria de un bit</td>
                </tr>
                <tr>
                  <td>Biestable JK</td>
                  <td>J, K</td>
                  <td>Q(t+1) = J·Q̄ + K̄·Q</td>
                  <td>1</td>
                  <td>Ninguna combinación prohibida, pero más lógica interna</td>
                  <td>Contadores síncronos, control</td>
                </tr>
                <tr>
                  <td>Biestable T</td>
                  <td>T</td>
                  <td>Q(t+1) = T ⊕ Q</td>
                  <td>1</td>
                  <td>Al conmutar cada ciclo divide la frecuencia entre 2</td>
                  <td>Contadores, divisores de frecuencia</td>
                </tr>
                <tr>
                  <td>Biestable SR</td>
                  <td>S, R</td>
                  <td>Q(t+1) = S + R̄·Q</td>
                  <td>1</td>
                  <td>S = R = 1 es un estado prohibido</td>
                  <td>Antirrebotes, enclavamientos sencillos</td>
                </tr>
                <tr>
                  <td>Contador binario</td>
                  <td>Ninguna (solo reloj)</td>
                  <td>valor(t+1) = (valor ± 1) mod M</td>
                  <td>4</td>
                  <td>Con módulo no potencia de 2 hay estados no usados</td>
                  <td>Temporizadores, direcciones de memoria</td>
                </tr>
                <tr>
                  <td>Registro de desplazamiento</td>
                  <td>Entrada serie</td>
                  <td>Qᵢ(t+1) = Qᵢ₋₁(t)</td>
                  <td>4</td>
                  <td>Un dato tarda n ciclos en recorrer n etapas</td>
                  <td>Conversión serie-paralelo, retardos, UART</td>
                </tr>
                <tr>
                  <td>Detector de secuencia 101</td>
                  <td>X</td>
                  <td>Máquina de Moore de 4 estados</td>
                  <td>2 (4 estados)</td>
                  <td>Decidir si se admite solapamiento cambia el diagrama</td>
                  <td>Protocolos, detección de patrones, control</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>4 situaciones donde la lógica secuencial es la respuesta</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚦</span>
              <strong>Semáforo con secuencia fija</strong>
              <p>
                Un semáforo no puede resolverse con lógica combinacional: la luz siguiente depende de la actual,
                no solo del sensor. Es una máquina de estados con un contador que marca la duración de cada fase.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎛️</span>
              <strong>Antirrebote de un pulsador</strong>
              <p>
                Un contacto mecánico rebota y genera decenas de flancos falsos en pocos milisegundos. Un biestable
                SR o un registro de desplazamiento que exija varios ciclos con el mismo nivel filtra esos rebotes
                antes de que lleguen al resto del sistema.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📡</span>
              <strong>Recepción de datos en serie</strong>
              <p>
                Un puerto serie recibe los bits uno a uno. Un registro de desplazamiento los va acumulando y, tras
                n ciclos, entrega el byte completo en paralelo. Es exactamente lo que hace la etapa de entrada de
                una UART.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🔐</span>
              <strong>Detección de un patrón de bits</strong>
              <p>
                Reconocer una cabecera o una clave dentro de un flujo continuo de bits es el trabajo de una máquina
                de estados como el detector 101. Cada estado resume «cuánto llevo acertado del patrón», sin
                necesidad de almacenar toda la secuencia recibida.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre biestables y circuitos secuenciales</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre un latch y un biestable disparado por flanco?</h4>
              <p>
                Un <strong>latch</strong> (cerrojo) es sensible al <em>nivel</em>: mientras la señal de habilitación
                está activa, la salida sigue a la entrada de forma transparente. Un biestable disparado por{' '}
                <strong>flanco</strong> solo mira la entrada en el instante de la transición del reloj y permanece
                insensible el resto del ciclo.
              </p>
              <p className={styles.faqTip}>
                Por eso los diseños síncronos usan biestables por flanco: si la salida pudiera cambiar durante todo
                el ciclo, podría realimentarse y provocar carreras dentro del mismo periodo de reloj.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué son los tiempos de setup y de hold?</h4>
              <p>
                El tiempo de <strong>setup</strong> es el margen durante el cual la entrada debe estar estable{' '}
                <em>antes</em> del flanco; el de <strong>hold</strong>, el que debe mantenerse estable{' '}
                <em>después</em>. Si se violan, el biestable puede entrar en metaestabilidad: la salida queda un
                tiempo indefinido en una zona intermedia antes de resolverse a 0 o a 1.
              </p>
              <p>
                Estos tiempos, junto con el retardo de propagación de la lógica combinacional entre biestables,
                fijan la frecuencia máxima de reloj del circuito.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuál es la diferencia entre una máquina de Moore y una de Mealy?</h4>
              <p>
                En una máquina de <strong>Moore</strong> la salida depende solo del estado, por lo que cambia de
                forma sincronizada con el reloj y es más fácil de analizar. En una de <strong>Mealy</strong> la
                salida depende del estado y de las entradas, lo que suele permitir resolver el mismo problema con
                menos estados, pero la salida puede cambiar en mitad de un ciclo.
              </p>
              <p className={styles.faqTip}>
                El detector del simulador es de Moore: la salida Z vale 1 exactamente mientras la máquina está en
                el estado S3.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre un contador síncrono y uno asíncrono?</h4>
              <p>
                En un contador <strong>síncrono</strong> todos los biestables comparten la misma señal de reloj y
                conmutan a la vez; la lógica adicional decide cuáles cambian. En uno <strong>asíncrono</strong> (o
                de rizado) la salida de cada etapa hace de reloj de la siguiente, así que los cambios se propagan
                en cascada.
              </p>
              <p>
                El asíncrono usa menos lógica, pero acumula retardos: durante un breve instante pueden aparecer
                valores intermedios inválidos, lo que limita su velocidad y complica decodificar la cuenta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo se pasa de un biestable JK a uno T o a uno D?</h4>
              <p>
                Un biestable JK se comporta como un <strong>T</strong> uniendo J y K en una sola entrada: con J = K = 0
                mantiene y con J = K = 1 conmuta. Y se comporta como un <strong>D</strong> conectando J = D y
                K = D̄, de forma que la salida siempre acaba tomando el valor de D.
              </p>
              <p className={styles.faqTip}>
                Puedes comprobarlo en el simulador: elige el biestable JK y pulsa el reloj manteniendo J = K = 1;
                verás la misma onda que produce el biestable T con T = 1.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Para qué sirve el solapamiento en un detector de secuencias?</h4>
              <p>
                Con <strong>solapamiento</strong>, los últimos bits de una detección pueden formar parte de la
                siguiente: en la entrada 10101 el patrón 101 se detecta dos veces. Sin solapamiento, tras cada
                acierto la máquina vuelve al estado inicial y solo detectaría una.
              </p>
              <p>
                La decisión no es un detalle menor: cambia las transiciones del diagrama de estados y, con ello,
                la lógica del circuito final.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3>Cómo analizar un circuito secuencial paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica los elementos de memoria</strong>
                <p>
                  Cuenta los biestables: n biestables dan hasta 2ⁿ estados posibles. Ese número es el tamaño real
                  del problema, más allá de la lógica combinacional que los rodee.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Escribe las ecuaciones de excitación</strong>
                <p>
                  Expresa cada entrada de los biestables (D, J, K o T) en función de las entradas externas y de las
                  salidas actuales. Son las ecuaciones que describen la lógica combinacional del circuito.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplica la ecuación característica</strong>
                <p>
                  Sustituye esas excitaciones en la ecuación del biestable (Q(t+1) = D, Q(t+1) = T ⊕ Q, etc.) para
                  obtener el estado siguiente en función del actual.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Construye la tabla de estados</strong>
                <p>
                  Recorre todas las combinaciones de estado actual y entradas, y anota el estado siguiente y la
                  salida. De esa tabla sale directamente el diagrama de estados.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Dibuja el cronograma y verifica</strong>
                <p>
                  Elige una secuencia concreta de entradas y sigue el circuito ciclo a ciclo. Si el cronograma
                  coincide con lo que predice la tabla, el análisis es correcto; si no, el error suele estar en el
                  paso 2.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3>Consejos para trabajar con circuitos secuenciales</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Fija primero el estado inicial</strong>
              <p>
                Un circuito secuencial sin una señal de puesta a cero arranca en un estado impredecible. En el
                simulador, el botón Reiniciar cumple ese papel de reset asíncrono.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <strong>Codifica los estados con criterio</strong>
              <p>
                Asignar códigos binarios a los estados de forma que los cambios frecuentes difieran en un solo bit
                (código Gray) simplifica la lógica y reduce transiciones simultáneas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏳</span>
              <strong>Piensa en ciclos, no en segundos</strong>
              <p>
                Al analizar un diseño, la unidad natural es el ciclo de reloj. Cuenta cuántos ciclos tarda una
                operación y solo al final tradúcelo a tiempo según la frecuencia.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧩</span>
              <strong>Comprueba los estados no usados</strong>
              <p>
                En un contador de módulo 10 con 4 biestables sobran 6 combinaciones. Un diseño robusto define qué
                ocurre si el circuito cae en una de ellas por una interferencia.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al estudiar lógica secuencial</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir el valor de la entrada con el de la salida en el mismo ciclo.</strong> En un
              biestable D, si cambias D a mitad de ciclo la salida no se entera hasta el siguiente flanco.
            </li>
            <li>
              <strong>Usar S = 1 y R = 1 «porque el circuito no explota».</strong> En simulación puede parecer
              inofensivo, pero en un circuito real ese estado deja las dos salidas incoherentes y el valor final
              depende de retardos físicos.
            </li>
            <li>
              <strong>Olvidar que el módulo de un contador no es el número de biestables.</strong> Con 4
              biestables el módulo máximo es 16, pero puede ser cualquier valor menor si se fuerza el retorno a
              cero.
            </li>
            <li>
              <strong>Dar por hecho que el detector reinicia tras cada acierto.</strong> Con solapamiento, parte
              de la secuencia detectada sigue siendo válida para la siguiente detección.
            </li>
            <li>
              <strong>Analizar un circuito secuencial con una tabla de verdad combinacional.</strong> Sin la
              columna del estado actual, la tabla es incompleta y aparecen «contradicciones» que en realidad son
              estados distintos.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-logica-secuencial')} />
      <ShareCard appName="simulador-logica-secuencial" />
      <Footer appName="simulador-logica-secuencial" />
    </div>
  );
}
