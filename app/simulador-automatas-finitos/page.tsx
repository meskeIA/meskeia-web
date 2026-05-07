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
import styles from './SimuladorAutomatasFinitos.module.css';

type TipoAuto = 'dfa' | 'nfa';
type ModoEditor =
  | 'add-state'
  | 'add-transition'
  | 'move'
  | 'delete'
  | 'set-initial'
  | 'toggle-final';

interface Estado {
  id: string;
  etiqueta: string;
  x: number;
  y: number;
  esInicial: boolean;
  esFinal: boolean;
}

interface Transicion {
  id: string;
  from: string;
  to: string;
  simbolo: string;
}

interface PasoValidacion {
  posicion: number;
  simbolo: string;
  estadosActivos: string[];
  descripcion: string;
}

type ResultadoValidacion = 'aceptada' | 'rechazada' | 'sin-transicion' | 'pendiente';

interface EjemploAutomata {
  titulo: string;
  descripcion: string;
  tipo: TipoAuto;
  alfabeto: string;
  estados: Estado[];
  transiciones: Transicion[];
}

const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;
const RADIO_ESTADO = 28;
const RADIO_FINAL = 34;

const EJEMPLOS: Record<string, EjemploAutomata> = {
  par_ceros: {
    titulo: 'DFA — Pares de 0',
    descripcion: 'Cadenas con número par de 0s sobre {0, 1}',
    tipo: 'dfa',
    alfabeto: '0,1',
    estados: [
      { id: 'q0', etiqueta: 'q0', x: 220, y: 250, esInicial: true, esFinal: true },
      { id: 'q1', etiqueta: 'q1', x: 520, y: 250, esInicial: false, esFinal: false },
    ],
    transiciones: [
      { id: 't1', from: 'q0', to: 'q1', simbolo: '0' },
      { id: 't2', from: 'q1', to: 'q0', simbolo: '0' },
      { id: 't3', from: 'q0', to: 'q0', simbolo: '1' },
      { id: 't4', from: 'q1', to: 'q1', simbolo: '1' },
    ],
  },
  termina_ab: {
    titulo: 'DFA — Termina en "ab"',
    descripcion: 'Cadenas que terminan en "ab" sobre {a, b}',
    tipo: 'dfa',
    alfabeto: 'a,b',
    estados: [
      { id: 'q0', etiqueta: 'q0', x: 160, y: 250, esInicial: true, esFinal: false },
      { id: 'q1', etiqueta: 'q1', x: 380, y: 250, esInicial: false, esFinal: false },
      { id: 'q2', etiqueta: 'q2', x: 600, y: 250, esInicial: false, esFinal: true },
    ],
    transiciones: [
      { id: 't1', from: 'q0', to: 'q1', simbolo: 'a' },
      { id: 't2', from: 'q0', to: 'q0', simbolo: 'b' },
      { id: 't3', from: 'q1', to: 'q1', simbolo: 'a' },
      { id: 't4', from: 'q1', to: 'q2', simbolo: 'b' },
      { id: 't5', from: 'q2', to: 'q1', simbolo: 'a' },
      { id: 't6', from: 'q2', to: 'q0', simbolo: 'b' },
    ],
  },
  contiene_01: {
    titulo: 'NFA — Contiene "01"',
    descripcion: 'Cadenas que contienen "01" como subcadena',
    tipo: 'nfa',
    alfabeto: '0,1',
    estados: [
      { id: 'q0', etiqueta: 'q0', x: 160, y: 250, esInicial: true, esFinal: false },
      { id: 'q1', etiqueta: 'q1', x: 380, y: 250, esInicial: false, esFinal: false },
      { id: 'q2', etiqueta: 'q2', x: 600, y: 250, esInicial: false, esFinal: true },
    ],
    transiciones: [
      { id: 't1', from: 'q0', to: 'q0', simbolo: '0' },
      { id: 't2', from: 'q0', to: 'q0', simbolo: '1' },
      { id: 't3', from: 'q0', to: 'q1', simbolo: '0' },
      { id: 't4', from: 'q1', to: 'q2', simbolo: '1' },
      { id: 't5', from: 'q2', to: 'q2', simbolo: '0' },
      { id: 't6', from: 'q2', to: 'q2', simbolo: '1' },
    ],
  },
  abc: {
    titulo: 'NFA-ε — a*b*c*',
    descripcion: 'Cero o más a, luego b, luego c (con ε-transiciones)',
    tipo: 'nfa',
    alfabeto: 'a,b,c,ε',
    estados: [
      { id: 'q0', etiqueta: 'q0', x: 160, y: 250, esInicial: true, esFinal: false },
      { id: 'q1', etiqueta: 'q1', x: 360, y: 250, esInicial: false, esFinal: false },
      { id: 'q2', etiqueta: 'q2', x: 560, y: 250, esInicial: false, esFinal: true },
    ],
    transiciones: [
      { id: 't1', from: 'q0', to: 'q0', simbolo: 'a' },
      { id: 't2', from: 'q0', to: 'q1', simbolo: 'ε' },
      { id: 't3', from: 'q1', to: 'q1', simbolo: 'b' },
      { id: 't4', from: 'q1', to: 'q2', simbolo: 'ε' },
      { id: 't5', from: 'q2', to: 'q2', simbolo: 'c' },
    ],
  },
};

// Estado inicial vacío
const ESTADOS_INICIALES: Estado[] = [
  { id: 'q0', etiqueta: 'q0', x: 220, y: 250, esInicial: true, esFinal: false },
  { id: 'q1', etiqueta: 'q1', x: 520, y: 250, esInicial: false, esFinal: true },
];
const TRANSICIONES_INICIALES: Transicion[] = [
  { id: 't1', from: 'q0', to: 'q1', simbolo: 'a' },
];

// Calcula la épsilon-clausura de un conjunto de estados
function epsilonClausura(
  estadosIds: string[],
  transiciones: Transicion[],
): string[] {
  const visitados = new Set<string>(estadosIds);
  const cola: string[] = [...estadosIds];
  while (cola.length > 0) {
    const actual = cola.shift() as string;
    for (const t of transiciones) {
      if (t.from === actual && t.simbolo === 'ε' && !visitados.has(t.to)) {
        visitados.add(t.to);
        cola.push(t.to);
      }
    }
  }
  return [...visitados];
}

// Genera los pasos de validación para una cadena
function generarPasosValidacion(
  cadena: string,
  tipo: TipoAuto,
  estados: Estado[],
  transiciones: Transicion[],
): { pasos: PasoValidacion[]; resultado: ResultadoValidacion } {
  const inicial = estados.find((e) => e.esInicial);
  if (!inicial) {
    return {
      pasos: [
        {
          posicion: -1,
          simbolo: '',
          estadosActivos: [],
          descripcion: 'No hay estado inicial definido',
        },
      ],
      resultado: 'rechazada',
    };
  }

  const pasos: PasoValidacion[] = [];
  let activos: string[];

  if (tipo === 'nfa') {
    activos = epsilonClausura([inicial.id], transiciones);
  } else {
    activos = [inicial.id];
  }

  pasos.push({
    posicion: 0,
    simbolo: '',
    estadosActivos: [...activos],
    descripcion: `Estado(s) inicial(es): ${activos.join(', ')}`,
  });

  for (let i = 0; i < cadena.length; i++) {
    const simbolo = cadena[i];
    let siguientes: string[] = [];

    if (tipo === 'dfa') {
      const t = transiciones.find(
        (tr) => tr.from === activos[0] && tr.simbolo === simbolo,
      );
      if (!t) {
        pasos.push({
          posicion: i + 1,
          simbolo,
          estadosActivos: [],
          descripcion: `Sin transición desde ${activos[0]} con "${simbolo}"`,
        });
        return { pasos, resultado: 'sin-transicion' };
      }
      siguientes = [t.to];
    } else {
      const conjunto = new Set<string>();
      for (const id of activos) {
        for (const t of transiciones) {
          if (t.from === id && t.simbolo === simbolo) {
            conjunto.add(t.to);
          }
        }
      }
      siguientes = epsilonClausura([...conjunto], transiciones);
    }

    if (siguientes.length === 0) {
      pasos.push({
        posicion: i + 1,
        simbolo,
        estadosActivos: [],
        descripcion: `Sin transición disponible con "${simbolo}"`,
      });
      return { pasos, resultado: 'sin-transicion' };
    }

    activos = siguientes;
    pasos.push({
      posicion: i + 1,
      simbolo,
      estadosActivos: [...activos],
      descripcion: `Lee "${simbolo}" → ${activos.join(', ')}`,
    });
  }

  // ¿Algún estado activo es final?
  const finales = new Set(estados.filter((e) => e.esFinal).map((e) => e.id));
  const aceptada = activos.some((id) => finales.has(id));

  return { pasos, resultado: aceptada ? 'aceptada' : 'rechazada' };
}

// Validación rápida (solo resultado)
function validarRapido(
  cadena: string,
  tipo: TipoAuto,
  estados: Estado[],
  transiciones: Transicion[],
): ResultadoValidacion {
  const { resultado } = generarPasosValidacion(cadena, tipo, estados, transiciones);
  return resultado;
}

// Calcula el path SVG para una transición (incluye autobucles)
function calcularPathTransicion(
  from: Estado,
  to: Estado,
): { path: string; labelX: number; labelY: number } {
  if (from.id === to.id) {
    // Auto-bucle: arco encima del estado
    const cx = from.x;
    const cy = from.y - RADIO_ESTADO;
    const r = 22;
    const path = `M ${cx - 12} ${cy} A ${r} ${r} 0 1 1 ${cx + 12} ${cy}`;
    return { path, labelX: cx, labelY: cy - r - 5 };
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) {
    return { path: '', labelX: from.x, labelY: from.y };
  }
  const ux = dx / dist;
  const uy = dy / dist;
  const startX = from.x + ux * RADIO_ESTADO;
  const startY = from.y + uy * RADIO_ESTADO;
  const endX = to.x - ux * RADIO_ESTADO;
  const endY = to.y - uy * RADIO_ESTADO;
  // Curva ligera para distinguir bidireccionales
  const midX = (startX + endX) / 2 - uy * 18;
  const midY = (startY + endY) / 2 + ux * 18;
  const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
  return { path, labelX: midX, labelY: midY - 6 };
}

// Agrupa transiciones entre el mismo par origen-destino
interface TransicionAgrupada {
  from: string;
  to: string;
  simbolos: string[];
  ids: string[];
}

function agruparTransiciones(transiciones: Transicion[]): TransicionAgrupada[] {
  const mapa = new Map<string, TransicionAgrupada>();
  for (const t of transiciones) {
    const clave = `${t.from}->${t.to}`;
    const existente = mapa.get(clave);
    if (existente) {
      existente.simbolos.push(t.simbolo);
      existente.ids.push(t.id);
    } else {
      mapa.set(clave, { from: t.from, to: t.to, simbolos: [t.simbolo], ids: [t.id] });
    }
  }
  return [...mapa.values()];
}

export default function SimuladorAutomatasFinitos() {
  const [tipo, setTipo] = useState<TipoAuto>('dfa');
  const [estados, setEstados] = useState<Estado[]>(ESTADOS_INICIALES);
  const [transiciones, setTransiciones] = useState<Transicion[]>(TRANSICIONES_INICIALES);
  const [alfabeto, setAlfabeto] = useState<string>('a,b');
  const [modo, setModo] = useState<ModoEditor>('move');
  const [cadena, setCadena] = useState<string>('ab');
  const [pasoActual, setPasoActual] = useState<number>(-1);
  const [reproduciendo, setReproduciendo] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(800);
  const [batchInput, setBatchInput] = useState<string>('a\nab\nba\naab\nabab');

  // Estados auxiliares para el editor
  const [origenTransicion, setOrigenTransicion] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Resultado de validación de la cadena actual
  const validacion = useMemo(
    () => generarPasosValidacion(cadena, tipo, estados, transiciones),
    [cadena, tipo, estados, transiciones],
  );

  // Estados activos según paso actual de la animación
  const estadosActivos = useMemo<string[]>(() => {
    if (pasoActual < 0) return [];
    const paso = validacion.pasos[pasoActual];
    return paso ? paso.estadosActivos : [];
  }, [validacion.pasos, pasoActual]);

  // Animación de validación
  useEffect(() => {
    if (!reproduciendo) return;
    if (pasoActual >= validacion.pasos.length - 1) {
      setReproduciendo(false);
      return;
    }
    const timer = setTimeout(() => {
      setPasoActual((p) => p + 1);
    }, velocidad);
    return () => clearTimeout(timer);
  }, [reproduciendo, pasoActual, validacion.pasos.length, velocidad]);

  const transicionesAgrupadas = useMemo(
    () => agruparTransiciones(transiciones),
    [transiciones],
  );

  const siguienteIdEstado = useCallback((): string => {
    let n = 0;
    const usados = new Set(estados.map((e) => e.id));
    while (usados.has(`q${n}`)) n += 1;
    return `q${n}`;
  }, [estados]);

  const siguienteIdTransicion = useCallback((): string => {
    let n = 1;
    const usados = new Set(transiciones.map((t) => t.id));
    while (usados.has(`t${n}`)) n += 1;
    return `t${n}`;
  }, [transiciones]);

  // Convertir coordenadas de evento a coordenadas SVG
  const obtenerCoordenadasSvg = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      let clientX: number;
      let clientY: number;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return { x: 0, y: 0 };
      }
      const x = ((clientX - rect.left) / rect.width) * SVG_WIDTH;
      const y = ((clientY - rect.top) / rect.height) * SVG_HEIGHT;
      return { x, y };
    },
    [],
  );

  // Click en el lienzo (zona vacía)
  const handleClickLienzo = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = e.target as SVGElement;
      if (target.tagName !== 'svg' && target.tagName !== 'rect') return;
      if (modo !== 'add-state') return;
      const { x, y } = obtenerCoordenadasSvg(e);
      const nuevoId = siguienteIdEstado();
      setEstados((prev) => [
        ...prev,
        {
          id: nuevoId,
          etiqueta: nuevoId,
          x: Math.max(40, Math.min(SVG_WIDTH - 40, x)),
          y: Math.max(40, Math.min(SVG_HEIGHT - 40, y)),
          esInicial: prev.length === 0,
          esFinal: false,
        },
      ]);
    },
    [modo, obtenerCoordenadasSvg, siguienteIdEstado],
  );

  // Click en un estado
  const handleClickEstado = useCallback(
    (estadoId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (modo === 'delete') {
        setEstados((prev) => prev.filter((est) => est.id !== estadoId));
        setTransiciones((prev) =>
          prev.filter((tr) => tr.from !== estadoId && tr.to !== estadoId),
        );
        return;
      }
      if (modo === 'set-initial') {
        setEstados((prev) =>
          prev.map((est) => ({ ...est, esInicial: est.id === estadoId })),
        );
        return;
      }
      if (modo === 'toggle-final') {
        setEstados((prev) =>
          prev.map((est) =>
            est.id === estadoId ? { ...est, esFinal: !est.esFinal } : est,
          ),
        );
        return;
      }
      if (modo === 'add-transition') {
        if (origenTransicion === null) {
          setOrigenTransicion(estadoId);
        } else {
          const simboloRaw = window.prompt(
            tipo === 'nfa'
              ? 'Símbolo de la transición (usa "ε" para épsilon):'
              : 'Símbolo de la transición:',
            'a',
          );
          if (simboloRaw !== null && simboloRaw.trim() !== '') {
            const simbolo = simboloRaw.trim();
            const nuevoId = siguienteIdTransicion();
            setTransiciones((prev) => [
              ...prev,
              { id: nuevoId, from: origenTransicion, to: estadoId, simbolo },
            ]);
          }
          setOrigenTransicion(null);
        }
        return;
      }
    },
    [modo, origenTransicion, siguienteIdTransicion, tipo],
  );

  // Drag de estado
  const handleMouseDownEstado = useCallback(
    (estadoId: string, e: React.MouseEvent) => {
      if (modo !== 'move') return;
      e.stopPropagation();
      setArrastrando(estadoId);
    },
    [modo],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!arrastrando) return;
      const { x, y } = obtenerCoordenadasSvg(e);
      const xClamp = Math.max(40, Math.min(SVG_WIDTH - 40, x));
      const yClamp = Math.max(40, Math.min(SVG_HEIGHT - 40, y));
      setEstados((prev) =>
        prev.map((est) =>
          est.id === arrastrando ? { ...est, x: xClamp, y: yClamp } : est,
        ),
      );
    },
    [arrastrando, obtenerCoordenadasSvg],
  );

  const handleMouseUp = useCallback(() => {
    setArrastrando(null);
  }, []);

  // Click en transición
  const handleClickTransicion = useCallback(
    (ids: string[]) => {
      if (modo === 'delete') {
        setTransiciones((prev) => prev.filter((tr) => !ids.includes(tr.id)));
      }
    },
    [modo],
  );

  const cargarEjemplo = useCallback((clave: keyof typeof EJEMPLOS) => {
    const ej = EJEMPLOS[clave];
    setTipo(ej.tipo);
    setAlfabeto(ej.alfabeto);
    setEstados(ej.estados.map((e) => ({ ...e })));
    setTransiciones(ej.transiciones.map((t) => ({ ...t })));
    setPasoActual(-1);
    setReproduciendo(false);
    setOrigenTransicion(null);
  }, []);

  const limpiarLienzo = useCallback(() => {
    setEstados([]);
    setTransiciones([]);
    setPasoActual(-1);
    setReproduciendo(false);
    setOrigenTransicion(null);
  }, []);

  const iniciarValidacion = useCallback(() => {
    setPasoActual(0);
    setReproduciendo(true);
  }, []);

  const pausarValidacion = useCallback(() => {
    setReproduciendo(false);
  }, []);

  const reiniciarValidacion = useCallback(() => {
    setPasoActual(-1);
    setReproduciendo(false);
  }, []);

  const pasoSiguiente = useCallback(() => {
    setReproduciendo(false);
    setPasoActual((p) => Math.min(p + 1, validacion.pasos.length - 1));
  }, [validacion.pasos.length]);

  const pasoAnterior = useCallback(() => {
    setReproduciendo(false);
    setPasoActual((p) => Math.max(p - 1, 0));
  }, []);

  // Resultados batch
  const resultadosBatch = useMemo(() => {
    const lineas = batchInput.split('\n').map((l) => l.trim());
    return lineas.map((linea) => ({
      cadena: linea,
      resultado: validarRapido(linea, tipo, estados, transiciones),
    }));
  }, [batchInput, tipo, estados, transiciones]);

  // Cambio de tipo: si pasamos a DFA y hay ε, advertir
  const cambiarTipo = useCallback(
    (nuevoTipo: TipoAuto) => {
      setTipo(nuevoTipo);
      setPasoActual(-1);
      setReproduciendo(false);
    },
    [],
  );

  const finales = useMemo(
    () => new Set(estados.filter((e) => e.esFinal).map((e) => e.id)),
    [estados],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Autómatas Finitos</h1>
        <p className={styles.subtitle}>DFA y NFA con editor visual</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de tipo DFA/NFA */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Tipo de autómata</h2>
          <div className={styles.tipoSelector}>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipo === 'dfa' ? styles.tipoActive : ''}`}
              onClick={() => cambiarTipo('dfa')}
            >
              <span className={styles.tipoNombre}>DFA</span>
              <span className={styles.tipoDesc}>Determinista</span>
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipo === 'nfa' ? styles.tipoActive : ''}`}
              onClick={() => cambiarTipo('nfa')}
            >
              <span className={styles.tipoNombre}>NFA</span>
              <span className={styles.tipoDesc}>No determinista (con ε)</span>
            </button>
          </div>

          <div className={styles.alfabetoControl}>
            <label htmlFor="alfabeto">Alfabeto (símbolos separados por coma):</label>
            <input
              id="alfabeto"
              type="text"
              value={alfabeto}
              onChange={(e) => setAlfabeto(e.target.value)}
              className={styles.alfabetoInput}
              placeholder="a,b"
            />
          </div>
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

        {/* Toolbar de modos */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Editor visual</h2>
          <div className={styles.toolbar} role="toolbar" aria-label="Herramientas del editor">
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'move' ? styles.toolActive : ''}`}
              onClick={() => {
                setModo('move');
                setOrigenTransicion(null);
              }}
              aria-label="Mover estados"
            >
              <span aria-hidden="true">✋</span>
              <span>Mover</span>
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'add-state' ? styles.toolActive : ''}`}
              onClick={() => {
                setModo('add-state');
                setOrigenTransicion(null);
              }}
              aria-label="Añadir estado"
            >
              <span aria-hidden="true">⊕</span>
              <span>Añadir estado</span>
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'add-transition' ? styles.toolActive : ''}`}
              onClick={() => {
                setModo('add-transition');
                setOrigenTransicion(null);
              }}
              aria-label="Añadir transición"
            >
              <span aria-hidden="true">→</span>
              <span>Transición</span>
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'set-initial' ? styles.toolActive : ''}`}
              onClick={() => {
                setModo('set-initial');
                setOrigenTransicion(null);
              }}
              aria-label="Marcar estado inicial"
            >
              <span aria-hidden="true">▶</span>
              <span>Marcar inicial</span>
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'toggle-final' ? styles.toolActive : ''}`}
              onClick={() => {
                setModo('toggle-final');
                setOrigenTransicion(null);
              }}
              aria-label="Alternar estado final"
            >
              <span aria-hidden="true">◎</span>
              <span>Toggle final</span>
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${modo === 'delete' ? styles.toolActive : ''}`}
              onClick={() => {
                setModo('delete');
                setOrigenTransicion(null);
              }}
              aria-label="Eliminar"
            >
              <span aria-hidden="true">✕</span>
              <span>Eliminar</span>
            </button>
            <button
              type="button"
              className={styles.toolBtnSecondary}
              onClick={limpiarLienzo}
              aria-label="Limpiar lienzo"
            >
              Limpiar todo
            </button>
          </div>

          <div className={styles.modoHint}>
            {modo === 'move' && 'Arrastra los estados para reorganizarlos.'}
            {modo === 'add-state' && 'Haz clic en el lienzo para añadir un estado.'}
            {modo === 'add-transition' &&
              (origenTransicion === null
                ? 'Selecciona el estado de origen.'
                : `Origen: ${origenTransicion}. Selecciona el destino.`)}
            {modo === 'set-initial' && 'Haz clic en el estado que será el inicial.'}
            {modo === 'toggle-final' && 'Haz clic en un estado para alternar si es final.'}
            {modo === 'delete' && 'Haz clic en un estado o transición para eliminar.'}
          </div>

          {/* SVG Editor */}
          <div className={styles.editorContainer}>
            <svg
              ref={svgRef}
              className={styles.editorSvg}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              width="100%"
              height={SVG_HEIGHT}
              onClick={handleClickLienzo}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              role="img"
              aria-label="Editor visual del autómata"
            >
              {/* Fondo */}
              <rect
                x={0}
                y={0}
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                fill="transparent"
              />

              {/* Marcador de flecha */}
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2E86AB" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#F18F01" />
                </marker>
              </defs>

              {/* Transiciones */}
              {transicionesAgrupadas.map((grupo) => {
                const from = estados.find((e) => e.id === grupo.from);
                const to = estados.find((e) => e.id === grupo.to);
                if (!from || !to) return null;
                const { path, labelX, labelY } = calcularPathTransicion(from, to);
                const activa =
                  estadosActivos.includes(from.id) && estadosActivos.includes(to.id);
                return (
                  <g
                    key={`${grupo.from}-${grupo.to}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickTransicion(grupo.ids);
                    }}
                    style={{ cursor: modo === 'delete' ? 'pointer' : 'default' }}
                  >
                    <path
                      d={path}
                      className={
                        activa ? styles.transicionLineActiva : styles.transicionLine
                      }
                      fill="none"
                      markerEnd={activa ? 'url(#arrow-active)' : 'url(#arrow)'}
                    />
                    <rect
                      x={labelX - 18}
                      y={labelY - 12}
                      width={Math.max(36, grupo.simbolos.join(', ').length * 8 + 12)}
                      height={20}
                      rx={4}
                      className={styles.transicionLabelBg}
                    />
                    <text
                      x={labelX}
                      y={labelY + 3}
                      className={styles.transicionLabel}
                      textAnchor="middle"
                    >
                      {grupo.simbolos.join(', ')}
                    </text>
                  </g>
                );
              })}

              {/* Estados */}
              {estados.map((est) => {
                const activo = estadosActivos.includes(est.id);
                const finalSel = est.esFinal;
                return (
                  <g
                    key={est.id}
                    onClick={(e) => handleClickEstado(est.id, e)}
                    onMouseDown={(e) => handleMouseDownEstado(est.id, e)}
                    style={{
                      cursor:
                        modo === 'move'
                          ? 'grab'
                          : modo === 'add-state'
                            ? 'default'
                            : 'pointer',
                    }}
                  >
                    {/* Flecha de inicial */}
                    {est.esInicial && (
                      <g>
                        <path
                          d={`M ${est.x - RADIO_ESTADO - 30} ${est.y} L ${est.x - RADIO_ESTADO - 4} ${est.y}`}
                          stroke="#48A9A6"
                          strokeWidth={3}
                          markerEnd="url(#arrow)"
                        />
                      </g>
                    )}
                    {/* Círculo exterior si es final */}
                    {finalSel && (
                      <circle
                        cx={est.x}
                        cy={est.y}
                        r={RADIO_FINAL}
                        className={styles.estadoFinalOuter}
                        fill="none"
                      />
                    )}
                    {/* Círculo principal */}
                    <circle
                      cx={est.x}
                      cy={est.y}
                      r={RADIO_ESTADO}
                      className={
                        activo
                          ? styles.estadoActivo
                          : origenTransicion === est.id
                            ? styles.estadoOrigen
                            : styles.estadoCircle
                      }
                    />
                    <text
                      x={est.x}
                      y={est.y + 5}
                      className={styles.estadoLabel}
                      textAnchor="middle"
                    >
                      {est.etiqueta}
                    </text>
                  </g>
                );
              })}

              {/* Mensaje vacío */}
              {estados.length === 0 && (
                <text
                  x={SVG_WIDTH / 2}
                  y={SVG_HEIGHT / 2}
                  textAnchor="middle"
                  className={styles.emptyMessage}
                >
                  Activa &laquo;Añadir estado&raquo; y haz clic en el lienzo
                </text>
              )}
            </svg>
          </div>

          <div className={styles.estadoResumen}>
            <span>
              <strong>{estados.length}</strong> estados
            </span>
            <span>
              <strong>{transiciones.length}</strong> transiciones
            </span>
            <span>
              Iniciales: <strong>{estados.filter((e) => e.esInicial).length}</strong>
            </span>
            <span>
              Finales: <strong>{finales.size}</strong>
            </span>
          </div>
        </div>

        {/* Validación de cadena */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Validar cadena</h2>
          <div className={styles.cadenaControl}>
            <label htmlFor="cadena">Cadena de entrada:</label>
            <input
              id="cadena"
              type="text"
              value={cadena}
              onChange={(e) => {
                setCadena(e.target.value);
                setPasoActual(-1);
                setReproduciendo(false);
              }}
              className={styles.cadenaInput}
              placeholder="ab"
            />
          </div>

          <div className={styles.velocidadControl}>
            <label htmlFor="velocidad">Velocidad:</label>
            <input
              id="velocidad"
              type="range"
              min={200}
              max={2000}
              step={100}
              value={2200 - velocidad}
              onChange={(e) => setVelocidad(2200 - Number(e.target.value))}
            />
            <span className={styles.velocidadValor}>{velocidad} ms</span>
          </div>

          <div className={styles.controlesAnimacion}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={iniciarValidacion}
              disabled={reproduciendo || cadena.length === 0}
            >
              ▶ Validar
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={pausarValidacion}
              disabled={!reproduciendo}
            >
              ⏸ Pausar
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={pasoAnterior}
              disabled={pasoActual <= 0}
            >
              ◀ Paso anterior
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={pasoSiguiente}
              disabled={pasoActual >= validacion.pasos.length - 1}
            >
              Paso siguiente ▶
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={reiniciarValidacion}
            >
              ⟲ Reiniciar
            </button>
          </div>

          {/* Cinta de la cadena */}
          {cadena.length > 0 && (
            <div className={styles.cintaValidacion}>
              {Array.from(cadena).map((c, i) => {
                const pasoLeido = pasoActual >= 0 ? validacion.pasos[pasoActual].posicion : -1;
                const yaLeido = i < pasoLeido;
                const actual = i === pasoLeido - 1 && pasoActual > 0;
                return (
                  <span
                    key={`celda-${i}`}
                    className={
                      actual
                        ? styles.celdaActual
                        : yaLeido
                          ? styles.celdaLeida
                          : styles.celdaCadena
                    }
                  >
                    {c}
                  </span>
                );
              })}
            </div>
          )}

          {/* Resultado */}
          {pasoActual >= 0 && (
            <div className={styles.resultadoBox}>
              <div className={styles.pasoDescripcion}>
                Paso {pasoActual + 1} / {validacion.pasos.length}:{' '}
                {validacion.pasos[pasoActual]?.descripcion}
              </div>
              {pasoActual >= validacion.pasos.length - 1 && (
                <div
                  className={
                    validacion.resultado === 'aceptada'
                      ? styles.resultadoAceptada
                      : validacion.resultado === 'sin-transicion'
                        ? styles.resultadoSinTransicion
                        : styles.resultadoRechazada
                  }
                >
                  {validacion.resultado === 'aceptada' && '✓ ACEPTADA'}
                  {validacion.resultado === 'rechazada' && '✗ RECHAZADA'}
                  {validacion.resultado === 'sin-transicion' && '⚠ SIN TRANSICIÓN'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modo batch */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Validación en lote</h2>
          <p className={styles.batchHint}>
            Una cadena por línea. Cada cadena se valida con el autómata actual.
          </p>
          <div className={styles.batchPanel}>
            <textarea
              className={styles.batchTextarea}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              rows={6}
              aria-label="Cadenas a validar (una por línea)"
            />
            <div className={styles.batchTableWrapper}>
              <table className={styles.batchTable}>
                <thead>
                  <tr>
                    <th>Cadena</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosBatch.map((r, i) => (
                    <tr key={`batch-${i}`}>
                      <td className={styles.batchCadena}>
                        {r.cadena.length === 0 ? (
                          <em>(vacía)</em>
                        ) : (
                          r.cadena
                        )}
                      </td>
                      <td>
                        {r.resultado === 'aceptada' && (
                          <span className={styles.badgeAceptada}>✓ Aceptada</span>
                        )}
                        {r.resultado === 'rechazada' && (
                          <span className={styles.badgeRechazada}>✗ Rechazada</span>
                        )}
                        {r.resultado === 'sin-transicion' && (
                          <span className={styles.badgeSinTransicion}>
                            ⚠ Sin transición
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía de Autómatas Finitos"
        subtitle="DFA, NFA y lenguajes regulares"
      >
        <h3>DFA vs NFA — Comparativa</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>DFA (Determinista)</th>
                <th>NFA (No determinista)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Transiciones por símbolo</strong>
                </td>
                <td>Exactamente una desde cada estado</td>
                <td>Cero, una o varias desde cada estado</td>
              </tr>
              <tr>
                <td>
                  <strong>ε-transiciones</strong>
                </td>
                <td>No permitidas</td>
                <td>Permitidas (saltar sin leer entrada)</td>
              </tr>
              <tr>
                <td>
                  <strong>Estado activo en cada paso</strong>
                </td>
                <td>Uno solo</td>
                <td>Conjunto de estados</td>
              </tr>
              <tr>
                <td>
                  <strong>Potencia (lenguajes que reconocen)</strong>
                </td>
                <td>Lenguajes regulares</td>
                <td>Lenguajes regulares (la misma)</td>
              </tr>
              <tr>
                <td>
                  <strong>Tamaño típico (estados)</strong>
                </td>
                <td>Más estados (puede explotar)</td>
                <td>Menos estados, más compacto</td>
              </tr>
              <tr>
                <td>
                  <strong>Implementación</strong>
                </td>
                <td>Tabla de transiciones directa</td>
                <td>Conversión a DFA o simulación con conjuntos</td>
              </tr>
              <tr>
                <td>
                  <strong>Velocidad de ejecución</strong>
                </td>
                <td>Rápida (un acceso por símbolo)</td>
                <td>Más lenta (gestionar conjuntos)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🎓
              </span>
              <strong>Estudiante de Teoría de la Computación</strong>
            </div>
            <p className={styles.escenarioExample}>
              Tienes que demostrar en el examen que un lenguaje es regular construyendo un
              autómata, y comparar DFA con NFA para los mismos lenguajes.
            </p>
            <div className={styles.escenarioTip}>
              Carga el ejemplo &laquo;Contiene 01&raquo; (NFA) y verifica que también puede
              construirse como DFA con más estados.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                📚
              </span>
              <strong>Opositor TIC / Concurso público</strong>
            </div>
            <p className={styles.escenarioExample}>
              Las pruebas tipo test preguntan diferencias entre DFA y NFA, qué es la
              ε-clausura, y cómo se relacionan los autómatas con las expresiones regulares.
            </p>
            <div className={styles.escenarioTip}>
              Usa el ejemplo a*b*c* y observa cómo las ε-transiciones simplifican el diseño
              de patrones.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                💻
              </span>
              <strong>Programador de parsers y lexers</strong>
            </div>
            <p className={styles.escenarioExample}>
              Implementas un analizador léxico (lexer) o un motor de expresiones regulares.
              Necesitas convertir patrones a DFAs eficientes.
            </p>
            <div className={styles.escenarioTip}>
              Las herramientas como flex/lex generan DFAs automáticamente desde expresiones
              regulares (algoritmo de Thompson + subconjuntos).
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                👨‍🏫
              </span>
              <strong>Profesor / docente de informática</strong>
            </div>
            <p className={styles.escenarioExample}>
              Quieres mostrar visualmente a tu clase cómo evolucionan los estados activos en
              un NFA durante la lectura de una cadena.
            </p>
            <div className={styles.escenarioTip}>
              Usa el ejemplo a*b*c* y reproduce paso a paso una cadena como &laquo;aabbcc&raquo;
              para ver la épsilon-clausura en acción.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cuál es la diferencia real entre DFA y NFA en potencia?</h4>
            <p>
              Reconocen exactamente la misma clase de lenguajes:{' '}
              <strong>los lenguajes regulares</strong>. Todo NFA puede convertirse en un DFA
              equivalente (algoritmo de subconjuntos), aunque el DFA puede tener
              exponencialmente más estados en el peor caso.
            </p>
            <p className={styles.faqTip}>
              La diferencia es de <em>conveniencia</em>, no de potencia: el NFA es más
              compacto y fácil de diseñar; el DFA es más rápido al ejecutarse.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es una ε-transición y para qué sirve?</h4>
            <p>
              Es una transición que se puede &laquo;tomar gratis&raquo;, sin leer ningún
              símbolo de la entrada. Solo existe en NFAs. Sirve para combinar fácilmente
              autómatas (concatenación, unión, estrella de Kleene) sin tener que reorganizar
              estados.
            </p>
            <p className={styles.faqTip}>
              En el ejemplo a*b*c*, las ε-transiciones permiten saltar de la &laquo;zona
              de a&raquo; a la &laquo;zona de b&raquo; sin leer nada.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se convierte un NFA a un DFA?</h4>
            <p>
              Mediante el <strong>algoritmo de subconjuntos</strong>: cada estado del DFA
              equivalente representa un conjunto de estados del NFA (los que estarían
              activos a la vez). Si el NFA tiene n estados, el DFA puede tener hasta 2^n
              estados, aunque normalmente muchos menos.
            </p>
            <p className={styles.faqTip}>
              Calcula primero la ε-clausura del estado inicial; luego, para cada conjunto y
              cada símbolo, determina el siguiente conjunto.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué son los lenguajes regulares?</h4>
            <p>
              Son los lenguajes que pueden ser reconocidos por un autómata finito (DFA o
              NFA). Equivalentemente, son los lenguajes que pueden describirse con una
              expresión regular. Cierran bajo unión, concatenación, intersección,
              complemento y estrella de Kleene.
            </p>
            <p className={styles.faqTip}>
              Ejemplos: cadenas con número par de 0s, cadenas que terminan en &laquo;ab&raquo;,
              identificadores válidos en un lenguaje de programación.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué relación hay con las expresiones regulares?</h4>
            <p>
              Son <strong>equivalentes</strong>: para cada expresión regular existe un
              autómata finito que reconoce el mismo lenguaje, y viceversa (teorema de Kleene).
              Los motores de regex modernos (PCRE, RE2…) usan internamente NFAs o DFAs según
              la implementación.
            </p>
            <p className={styles.faqTip}>
              RE2 (Google) y los motores POSIX usan DFAs lazy para garantizar tiempo lineal,
              evitando el catastrophic backtracking de los regex tradicionales.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué algunos lenguajes no son regulares?</h4>
            <p>
              Porque un autómata finito tiene <em>memoria limitada</em> (solo el estado
              actual). Lenguajes que requieren contar arbitrariamente (como{' '}
              <code>aⁿbⁿ</code>) o emparejar paréntesis no son regulares: necesitan
              autómatas con pila (lenguajes libres de contexto).
            </p>
            <p className={styles.faqTip}>
              Se demuestra con el <em>lema del bombeo</em>: si un lenguaje fuera regular,
              cualquier cadena suficientemente larga tendría una porción que se puede repetir
              indefinidamente y seguir en el lenguaje.
            </p>
          </div>
        </div>

        <h3>Cómo Diseñar un Autómata — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Describe el lenguaje en palabras</strong>
              <p>
                Antes de dibujar nada, escribe con claridad qué cadenas se aceptan y cuáles
                no. Ejemplo: &laquo;cadenas sobre {`{0,1}`} con un número par de 0s&raquo;.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Identifica la &laquo;memoria&raquo; necesaria</strong>
              <p>
                Cada estado representa una propiedad acumulada de lo leído hasta ahora. En
                el ejemplo: ¿cuántos 0s llevo? Solo importa la paridad → 2 estados.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Define estado inicial y estados finales</strong>
              <p>
                El inicial representa &laquo;aún no he leído nada&raquo;. Los finales son
                aquellos en los que la cadena leída es válida. Marca uno o varios como
                finales según el lenguaje.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Dibuja todas las transiciones</strong>
              <p>
                Para cada estado y cada símbolo del alfabeto, indica a qué estado se va. En
                un DFA debe haber siempre exactamente una transición. En NFA pueden faltar
                o haber varias.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Verifica con cadenas de prueba</strong>
              <p>
                Prueba al menos una cadena que debe aceptar y otra que debe rechazar. Usa el
                modo batch del simulador con varias cadenas representativas.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🎯
            </span>
            <strong>Diseña primero el NFA, luego conviértelo</strong>
            <p>
              Es más fácil pensar en NFAs (sin la restricción de transición única). Una vez
              funciona, conviértelo a DFA si necesitas eficiencia.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🔍
            </span>
            <strong>Usa nombres descriptivos para los estados</strong>
            <p>
              En lugar de q0, q1, q2, considera &laquo;par&raquo;, &laquo;impar&raquo; o
              &laquo;leí_a&raquo;, &laquo;leí_ab&raquo; para que el diseño sea autoexplicativo.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✂️
            </span>
            <strong>Minimiza estados</strong>
            <p>
              Si dos estados son equivalentes (mismas transiciones, mismo carácter de
              final), fusiónalos. El algoritmo de Hopcroft minimiza un DFA en O(n log n).
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🪤
            </span>
            <strong>Define el estado &laquo;trampa&raquo; (dead state)</strong>
            <p>
              En DFA, todas las transiciones deben estar definidas. Si una cadena no debe
              aceptarse, redirige las transiciones inválidas a un estado trampa no final del
              que no se puede salir.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🧪
            </span>
            <strong>Prueba con casos límite</strong>
            <p>
              Cadena vacía, un solo símbolo, todos los símbolos del alfabeto, cadena muy
              larga. Si tu autómata acepta el lenguaje vacío, el estado inicial debe ser
              también final.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🔁
            </span>
            <strong>Aprovecha las ε-transiciones</strong>
            <p>
              Para combinar autómatas (unión, concatenación, estrella) las ε-transiciones
              son tu mejor amiga. Es la base del algoritmo de Thompson para regex.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">
              ⚠️
            </span>
            <strong>Errores frecuentes a evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              Olvidar que en un DFA todas las transiciones deben estar definidas: si falta
              alguna, formalmente no es un DFA (aunque algunos textos permiten DFAs
              parciales).
            </li>
            <li>
              Confundir &laquo;estado inicial&raquo; con &laquo;estado final&raquo;: el
              inicial es el de partida; los finales son donde la cadena se acepta. Pueden
              coincidir.
            </li>
            <li>
              Usar ε-transiciones en un DFA: están prohibidas. Si las necesitas, es que
              estás diseñando un NFA.
            </li>
            <li>
              No considerar la cadena vacía: si la cadena vacía pertenece al lenguaje, el
              estado inicial debe ser final.
            </li>
            <li>
              Pensar que un NFA es &laquo;más potente&raquo; que un DFA: NO. Reconocen los
              mismos lenguajes (regulares). La diferencia es solo la conveniencia de diseño.
            </li>
            <li>
              Olvidar la épsilon-clausura al simular un NFA: tras cada transición de
              símbolo, hay que cerrar bajo ε para no perder estados accesibles.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-automatas-finitos')} />
      <ShareCard appName="simulador-automatas-finitos" />
      <Footer appName="simulador-automatas-finitos" />
    </div>
  );
}
