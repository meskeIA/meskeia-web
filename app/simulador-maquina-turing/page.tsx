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
import styles from './SimuladorMaquinaTuring.module.css';

type Movimiento = 'L' | 'R' | 'S';
type EstadoEjecucion =
  | 'detenida'
  | 'ejecutando'
  | 'pausada'
  | 'aceptada'
  | 'rechazada'
  | 'sin-regla';

interface Regla {
  estado: string;
  lee: string;
  escribe: string;
  mueve: Movimiento;
  nuevoEstado: string;
}

interface ProgramaPredefinido {
  id: string;
  titulo: string;
  descripcion: string;
  cintaInicial: string;
  estadoInicial: string;
  estadosFinales: string[];
  reglas: Regla[];
}

const SIMBOLO_BLANCO = '_';
const LIMITE_PASOS = 5000;
/** Pausa mínima entre pasos. A 10 ms el tope de 5.000 pasos se alcanza en menos de un minuto. */
const VELOCIDAD_MIN = 10;
const CELDAS_VISIBLES = 21; // celdas mostradas en el SVG (cabezal centrado)

// ============================================================
// Programas predefinidos
// ============================================================

const PROGRAMAS: ProgramaPredefinido[] = [
  {
    id: 'incrementador',
    titulo: 'Incrementador binario',
    descripcion: 'Suma 1 al número binario de la cinta',
    cintaInicial: '1011',
    estadoInicial: 'q0',
    estadosFinales: ['qf'],
    reglas: [
      // q0: avanzar a la derecha hasta encontrar blanco
      { estado: 'q0', lee: '0', escribe: '0', mueve: 'R', nuevoEstado: 'q0' },
      { estado: 'q0', lee: '1', escribe: '1', mueve: 'R', nuevoEstado: 'q0' },
      { estado: 'q0', lee: '_', escribe: '_', mueve: 'L', nuevoEstado: 'q1' },
      // q1: sumar 1 propagando acarreo desde la derecha
      { estado: 'q1', lee: '0', escribe: '1', mueve: 'L', nuevoEstado: 'q2' },
      { estado: 'q1', lee: '1', escribe: '0', mueve: 'L', nuevoEstado: 'q1' },
      { estado: 'q1', lee: '_', escribe: '1', mueve: 'S', nuevoEstado: 'qf' },
      // q2: volver al inicio
      { estado: 'q2', lee: '0', escribe: '0', mueve: 'L', nuevoEstado: 'q2' },
      { estado: 'q2', lee: '1', escribe: '1', mueve: 'L', nuevoEstado: 'q2' },
      { estado: 'q2', lee: '_', escribe: '_', mueve: 'R', nuevoEstado: 'qf' },
    ],
  },
  {
    id: 'anbn',
    titulo: 'Reconocer aⁿbⁿ',
    // «n ≥ 1» explícito: con el convenio habitual n ≥ 0 la cadena vacía pertenece al
    // lenguaje, y este programa la RECHAZA por falta de regla para (q0, blanco). La guía de
    // la propia app manda probar los casos límite —«cadena vacía» entre ellos—, así que el
    // alumno que la seguía obtenía un rechazo que la descripción no explicaba (hallazgo 339).
    descripcion: 'Acepta cadenas con n veces "a" seguidas de n veces "b" (n ≥ 1)',
    cintaInicial: 'aaabbb',
    estadoInicial: 'q0',
    estadosFinales: ['qf'],
    reglas: [
      // q0: marca la primera "a" como X y busca una "b" para marcar como Y
      { estado: 'q0', lee: 'a', escribe: 'X', mueve: 'R', nuevoEstado: 'q1' },
      { estado: 'q0', lee: 'Y', escribe: 'Y', mueve: 'R', nuevoEstado: 'q3' },
      // q1: avanza sobre a y Y hasta encontrar b
      { estado: 'q1', lee: 'a', escribe: 'a', mueve: 'R', nuevoEstado: 'q1' },
      { estado: 'q1', lee: 'Y', escribe: 'Y', mueve: 'R', nuevoEstado: 'q1' },
      { estado: 'q1', lee: 'b', escribe: 'Y', mueve: 'L', nuevoEstado: 'q2' },
      // q2: vuelve a la izquierda hasta la última X
      { estado: 'q2', lee: 'a', escribe: 'a', mueve: 'L', nuevoEstado: 'q2' },
      { estado: 'q2', lee: 'Y', escribe: 'Y', mueve: 'L', nuevoEstado: 'q2' },
      { estado: 'q2', lee: 'X', escribe: 'X', mueve: 'R', nuevoEstado: 'q0' },
      // q3: comprobar que solo quedan Y hasta el final
      { estado: 'q3', lee: 'Y', escribe: 'Y', mueve: 'R', nuevoEstado: 'q3' },
      { estado: 'q3', lee: '_', escribe: '_', mueve: 'S', nuevoEstado: 'qf' },
    ],
  },
  {
    id: 'duplicar',
    titulo: 'Duplicar cadena unaria',
    descripcion: 'Convierte 111 en 111111 (duplica el número de unos)',
    cintaInicial: '111',
    estadoInicial: 'q0',
    estadosFinales: ['qf'],
    reglas: [
      // q0: marca un 1 sin procesar como X y va a duplicarlo al final
      { estado: 'q0', lee: '1', escribe: 'X', mueve: 'R', nuevoEstado: 'q1' },
      // q0: ya no quedan 1 sin marcar (solo copias Z) → ir a limpieza final
      { estado: 'q0', lee: 'Z', escribe: 'Z', mueve: 'L', nuevoEstado: 'q5' },
      // q0: cinta vacía desde el inicio (0 copias de 0)
      { estado: 'q0', lee: '_', escribe: '_', mueve: 'S', nuevoEstado: 'qf' },
      // q1: avanzar hasta el final de la cinta (saltando 1 y Z)
      { estado: 'q1', lee: '1', escribe: '1', mueve: 'R', nuevoEstado: 'q1' },
      { estado: 'q1', lee: 'Z', escribe: 'Z', mueve: 'R', nuevoEstado: 'q1' },
      { estado: 'q1', lee: '_', escribe: 'Z', mueve: 'L', nuevoEstado: 'q2' },
      // q2: volver a la izquierda hasta la X marcada
      { estado: 'q2', lee: '1', escribe: '1', mueve: 'L', nuevoEstado: 'q2' },
      { estado: 'q2', lee: 'Z', escribe: 'Z', mueve: 'L', nuevoEstado: 'q2' },
      { estado: 'q2', lee: 'X', escribe: 'X', mueve: 'R', nuevoEstado: 'q0' },
      // q5: volver al principio de la cinta
      { estado: 'q5', lee: 'X', escribe: 'X', mueve: 'L', nuevoEstado: 'q5' },
      { estado: 'q5', lee: '_', escribe: '_', mueve: 'R', nuevoEstado: 'q4' },
      // q4: convertir todas las X y Z en 1 (resultado final duplicado)
      { estado: 'q4', lee: 'X', escribe: '1', mueve: 'R', nuevoEstado: 'q4' },
      { estado: 'q4', lee: 'Z', escribe: '1', mueve: 'R', nuevoEstado: 'q4' },
      { estado: 'q4', lee: '_', escribe: '_', mueve: 'S', nuevoEstado: 'qf' },
    ],
  },
  {
    id: 'palindromo',
    titulo: 'Palíndromos binarios',
    descripcion: 'Acepta cadenas binarias que se leen igual de izquierda a derecha',
    cintaInicial: '1001',
    estadoInicial: 'q0',
    estadosFinales: ['qf'],
    reglas: [
      // q0: leer primer símbolo y recordarlo
      { estado: 'q0', lee: '0', escribe: '_', mueve: 'R', nuevoEstado: 'q1' },
      { estado: 'q0', lee: '1', escribe: '_', mueve: 'R', nuevoEstado: 'q2' },
      { estado: 'q0', lee: '_', escribe: '_', mueve: 'S', nuevoEstado: 'qf' },
      // q1: avanzar hasta el final, recordando que esperamos 0
      { estado: 'q1', lee: '0', escribe: '0', mueve: 'R', nuevoEstado: 'q1' },
      { estado: 'q1', lee: '1', escribe: '1', mueve: 'R', nuevoEstado: 'q1' },
      { estado: 'q1', lee: '_', escribe: '_', mueve: 'L', nuevoEstado: 'q3' },
      // q2: avanzar hasta el final, recordando que esperamos 1
      { estado: 'q2', lee: '0', escribe: '0', mueve: 'R', nuevoEstado: 'q2' },
      { estado: 'q2', lee: '1', escribe: '1', mueve: 'R', nuevoEstado: 'q2' },
      { estado: 'q2', lee: '_', escribe: '_', mueve: 'L', nuevoEstado: 'q4' },
      // q3: comprobar último símbolo (debe ser 0)
      { estado: 'q3', lee: '0', escribe: '_', mueve: 'L', nuevoEstado: 'q5' },
      { estado: 'q3', lee: '_', escribe: '_', mueve: 'S', nuevoEstado: 'qf' },
      // q4: comprobar último símbolo (debe ser 1)
      { estado: 'q4', lee: '1', escribe: '_', mueve: 'L', nuevoEstado: 'q5' },
      { estado: 'q4', lee: '_', escribe: '_', mueve: 'S', nuevoEstado: 'qf' },
      // q5: volver al inicio
      { estado: 'q5', lee: '0', escribe: '0', mueve: 'L', nuevoEstado: 'q5' },
      { estado: 'q5', lee: '1', escribe: '1', mueve: 'L', nuevoEstado: 'q5' },
      { estado: 'q5', lee: '_', escribe: '_', mueve: 'R', nuevoEstado: 'q0' },
    ],
  },
];

// ============================================================
// Lógica de ejecución
// ============================================================

interface ResultadoPaso {
  nuevoEstado: string;
  nuevaCinta: string[];
  nuevoCabezal: number;
  reglaUsada: number;
  simboloLeido: string;
  simboloEscrito: string;
  movimiento: Movimiento;
  /** 1 si el paso ha insertado una celda por el extremo izquierdo, desplazando los indices. */
  insertadaIzquierda: number;
}

function ejecutarPaso(
  estado: string,
  cinta: string[],
  cabezal: number,
  reglas: Regla[]
): ResultadoPaso | null {
  const simbolo = cinta[cabezal] || SIMBOLO_BLANCO;
  const reglaIdx = reglas.findIndex(
    (r) => r.estado === estado && r.lee === simbolo
  );
  if (reglaIdx === -1) return null;
  const regla = reglas[reglaIdx];
  const nuevaCinta = [...cinta];
  nuevaCinta[cabezal] = regla.escribe;
  let nuevoCabezal = cabezal;
  // Cuando el cabezal sale por el extremo izquierdo se inserta una celda —correcto, la cinta
  // es infinita en los dos sentidos— pero eso desplaza TODOS los índices del array. Se cuenta
  // para poder restarlo al pintar: si no, los «índices reales» que la app dibuja bajo cada
  // celda saltan +1 para todo lo ya escrito y el cabezal nunca llega a mostrar un índice
  // negativo, aunque el mismo SVG sí pinte negativos a la izquierda (hallazgo 341).
  let insertadaIzquierda = 0;
  if (regla.mueve === 'L') {
    nuevoCabezal -= 1;
    if (nuevoCabezal < 0) {
      nuevaCinta.unshift(SIMBOLO_BLANCO);
      nuevoCabezal = 0;
      insertadaIzquierda = 1;
    }
  } else if (regla.mueve === 'R') {
    nuevoCabezal += 1;
    if (nuevoCabezal >= nuevaCinta.length) {
      nuevaCinta.push(SIMBOLO_BLANCO);
    }
  }
  return {
    nuevoEstado: regla.nuevoEstado,
    nuevaCinta,
    nuevoCabezal,
    reglaUsada: reglaIdx,
    simboloLeido: simbolo,
    simboloEscrito: regla.escribe,
    movimiento: regla.mueve,
    insertadaIzquierda,
  };
}

function cintaToString(cinta: string[]): string {
  // Quitar blancos en los extremos para presentar resultado limpio
  let inicio = 0;
  let fin = cinta.length - 1;
  while (inicio < cinta.length && cinta[inicio] === SIMBOLO_BLANCO) inicio++;
  while (fin >= 0 && cinta[fin] === SIMBOLO_BLANCO) fin--;
  if (inicio > fin) return '(cinta vacía)';
  return cinta.slice(inicio, fin + 1).join('');
}

// ============================================================
// Componente principal
// ============================================================

export default function SimuladorMaquinaTuring() {
  const [programaActivo, setProgramaActivo] = useState<string>('incrementador');
  const [cintaInicialInput, setCintaInicialInput] = useState<string>(
    PROGRAMAS[0].cintaInicial
  );
  const [estadoInicial, setEstadoInicial] = useState<string>(
    PROGRAMAS[0].estadoInicial
  );
  const [estadosFinales, setEstadosFinales] = useState<string[]>(
    PROGRAMAS[0].estadosFinales
  );
  const [reglas, setReglas] = useState<Regla[]>(PROGRAMAS[0].reglas);

  // Estado de ejecución
  const [cinta, setCinta] = useState<string[]>(
    PROGRAMAS[0].cintaInicial.split('')
  );
  const [cabezal, setCabezal] = useState<number>(0);
  const [estadoActual, setEstadoActual] = useState<string>(
    PROGRAMAS[0].estadoInicial
  );
  const [pasos, setPasos] = useState<number>(0);
  const [simbolosEscritos, setSimbolosEscritos] = useState<number>(0);
  /**
   * Cuántas celdas se han insertado por el extremo IZQUIERDO desde el arranque.
   *
   * Es lo que hay que restar al índice del array para obtener el índice real de la cinta.
   * Sin esto, salir por la izquierda renumeraba todo lo ya escrito y el cabezal volvía a 0
   * en vez de pasar a −1, aunque el mismo SVG sí pintaba índices negativos a su izquierda.
   */
  const [origenCinta, setOrigenCinta] = useState<number>(0);
  const [movimientosCabezal, setMovimientosCabezal] = useState<number>(0);
  const [reglaActiva, setReglaActiva] = useState<number | null>(null);
  const [celdaEscrita, setCeldaEscrita] = useState<number | null>(null);
  const [estadoEjecucion, setEstadoEjecucion] =
    useState<EstadoEjecucion>('detenida');

  const [velocidad, setVelocidad] = useState<number>(600);
  const [estadoFinalInputDraft, setEstadoFinalInputDraft] = useState<string>('');

  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detenidoRef = useRef<boolean>(false);

  // Cargar un programa predefinido
  const cargarPrograma = useCallback((idPrograma: string) => {
    const prog = PROGRAMAS.find((p) => p.id === idPrograma);
    if (!prog) return;
    setProgramaActivo(idPrograma);
    setCintaInicialInput(prog.cintaInicial);
    setEstadoInicial(prog.estadoInicial);
    setEstadosFinales(prog.estadosFinales);
    setReglas(prog.reglas);
    setCinta(prog.cintaInicial.split(''));
    setCabezal(0);
    setEstadoActual(prog.estadoInicial);
    setPasos(0);
    setSimbolosEscritos(0);
    setOrigenCinta(0);
    setMovimientosCabezal(0);
    setReglaActiva(null);
    setCeldaEscrita(null);
    setEstadoEjecucion('detenida');
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  // Reiniciar (sin cambiar reglas)
  const reiniciar = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
    detenidoRef.current = true;
    const cintaArr = cintaInicialInput.split('').filter((c) => c !== ' ');
    setCinta(cintaArr.length > 0 ? cintaArr : [SIMBOLO_BLANCO]);
    setCabezal(0);
    setEstadoActual(estadoInicial);
    setPasos(0);
    setSimbolosEscritos(0);
    setOrigenCinta(0);
    setMovimientosCabezal(0);
    setReglaActiva(null);
    setCeldaEscrita(null);
    setEstadoEjecucion('detenida');
  }, [cintaInicialInput, estadoInicial]);

  // Ejecutar un solo paso
  const paso = useCallback((): boolean => {
    if (estadosFinales.includes(estadoActual)) {
      setEstadoEjecucion('aceptada');
      return false;
    }
    if (pasos >= LIMITE_PASOS) {
      setEstadoEjecucion('rechazada');
      return false;
    }
    const resultado = ejecutarPaso(estadoActual, cinta, cabezal, reglas);
    if (!resultado) {
      // Sin regla aplicable
      if (estadosFinales.includes(estadoActual)) {
        setEstadoEjecucion('aceptada');
      } else {
        setEstadoEjecucion('sin-regla');
      }
      return false;
    }
    setCinta(resultado.nuevaCinta);
    setCabezal(resultado.nuevoCabezal);
    setEstadoActual(resultado.nuevoEstado);
    setReglaActiva(resultado.reglaUsada);
    // En índice REAL, porque es lo que compara el render. Con el índice del array, el
    // destello señalaría otra celda en cuanto la cinta creciera por la izquierda.
    setCeldaEscrita(cabezal - origenCinta);
    setPasos((p) => p + 1);
    // Si el paso ha insertado celda por la izquierda, el origen se corre para que el índice
    // que se dibuja bajo cada celda siga siendo el mismo de antes (y el cabezal pase a −1).
    if (resultado.insertadaIzquierda) setOrigenCinta((o) => o + resultado.insertadaIzquierda);
    if (resultado.simboloEscrito !== resultado.simboloLeido) {
      setSimbolosEscritos((s) => s + 1);
    }
    if (resultado.movimiento !== 'S') {
      setMovimientosCabezal((m) => m + 1);
    }
    if (estadosFinales.includes(resultado.nuevoEstado)) {
      setEstadoEjecucion('aceptada');
      return false;
    }
    return true;
  }, [cabezal, cinta, estadoActual, estadosFinales, pasos, reglas, origenCinta]);

  // Iniciar / pausar
  const toggleEjecucion = useCallback(() => {
    if (estadoEjecucion === 'ejecutando') {
      // pausar
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      setEstadoEjecucion('pausada');
    } else if (
      estadoEjecucion === 'aceptada' ||
      estadoEjecucion === 'rechazada' ||
      estadoEjecucion === 'sin-regla'
    ) {
      // reiniciar y arrancar
      reiniciar();
      setTimeout(() => setEstadoEjecucion('ejecutando'), 50);
    } else {
      setEstadoEjecucion('ejecutando');
    }
  }, [estadoEjecucion, reiniciar]);

  // Loop de ejecución (controlado por velocidad)
  useEffect(() => {
    if (estadoEjecucion !== 'ejecutando') {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      return;
    }
    detenidoRef.current = false;
    intervaloRef.current = setInterval(() => {
      const continuar = paso();
      if (!continuar && intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    }, velocidad);
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    };
  }, [estadoEjecucion, velocidad, paso]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, []);

  /**
   * Recargar la cinta cuando cambia el input.
   *
   * Los CONTADORES se reinician con ella. Hasta el 25/08/2026 no lo hacían, así que editar la
   * cinta a mitad de una ejecución paso a paso devolvía cabezal y estado al principio pero
   * dejaba «Pasos ejecutados 5» de la ejecución anterior: la app informaba de un número de
   * pasos que no correspondía a nada de lo que había en pantalla, y el clic siguiente marcaba
   * 6 habiéndose ejecutado 1 (hallazgo 334).
   *
   * Y se aplica SIEMPRE, no solo con `estadoEjecucion === 'detenida'`: el modo paso a paso
   * nunca sale de ese valor, así que la guarda no protegía del caso que decía proteger, y en
   * cambio sí impedía el simétrico — con la máquina ya en «aceptada», teclear una cinta nueva
   * no cambiaba nada en pantalla hasta pulsar Reiniciar. Lo que hay que respetar es la
   * ejecución CONTINUA, que sí tiene su propio estado.
   */
  useEffect(() => {
    if (estadoEjecucion === 'ejecutando') return;
    const cintaArr = cintaInicialInput.split('').filter((c) => c !== ' ');
    setCinta(cintaArr.length > 0 ? cintaArr : [SIMBOLO_BLANCO]);
    setCabezal(0);
    setEstadoActual(estadoInicial);
    setEstadoEjecucion('detenida');
    setPasos(0);
    setMovimientosCabezal(0);
    setSimbolosEscritos(0);
    setOrigenCinta(0);
    setReglaActiva(null);
    setCeldaEscrita(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cintaInicialInput, estadoInicial]);

  // Edición de reglas
  const actualizarRegla = (idx: number, campo: keyof Regla, valor: string) => {
    setReglas((prev) => {
      const nuevas = [...prev];
      const r = { ...nuevas[idx] };
      if (campo === 'mueve') {
        if (valor === 'L' || valor === 'R' || valor === 'S') {
          r.mueve = valor;
        }
      } else {
        r[campo] = valor;
      }
      nuevas[idx] = r;
      return nuevas;
    });
  };

  const eliminarRegla = (idx: number) => {
    setReglas((prev) => prev.filter((_, i) => i !== idx));
  };

  const anadirRegla = () => {
    setReglas((prev) => [
      ...prev,
      { estado: 'q0', lee: '0', escribe: '0', mueve: 'R', nuevoEstado: 'q0' },
    ]);
  };

  // Estados finales (chips)
  const anadirEstadoFinal = () => {
    const nuevo = estadoFinalInputDraft.trim();
    if (!nuevo) return;
    if (estadosFinales.includes(nuevo)) {
      setEstadoFinalInputDraft('');
      return;
    }
    setEstadosFinales((prev) => [...prev, nuevo]);
    setEstadoFinalInputDraft('');
  };

  const eliminarEstadoFinal = (estado: string) => {
    setEstadosFinales((prev) => prev.filter((e) => e !== estado));
  };

  // ============================================================
  // Render
  // ============================================================

  // Cinta visual: ventana centrada en el cabezal
  const ventanaCinta = useMemo(() => {
    const mitad = Math.floor(CELDAS_VISIBLES / 2);
    const inicio = cabezal - mitad;
    const celdas: { simbolo: string; indiceReal: number }[] = [];
    for (let i = 0; i < CELDAS_VISIBLES; i++) {
      const idx = inicio + i;
      const sim = idx >= 0 && idx < cinta.length ? cinta[idx] : SIMBOLO_BLANCO;
      // El índice REAL de la cinta, no el del array: se resta lo insertado por la izquierda.
      celdas.push({ simbolo: sim, indiceReal: idx - origenCinta });
    }
    return celdas;
  }, [cinta, cabezal, origenCinta]);

  const cintaFinalLimpia = useMemo(() => cintaToString(cinta), [cinta]);

  const resultadoTexto = useMemo(() => {
    switch (estadoEjecucion) {
      case 'aceptada':
        return { texto: 'ACEPTADO', clase: styles.resultadoAceptado };
      case 'rechazada':
        return {
          texto: 'RECHAZADO (límite de pasos alcanzado)',
          clase: styles.resultadoRechazado,
        };
      case 'sin-regla':
        return {
          texto: 'RECHAZADO (sin regla aplicable)',
          clase: styles.resultadoRechazado,
        };
      case 'ejecutando':
        return { texto: 'EN EJECUCIÓN…', clase: styles.resultadoNeutro };
      case 'pausada':
        return { texto: 'EN PAUSA', clase: styles.resultadoNeutro };
      default:
        return { texto: 'LISTA', clase: styles.resultadoNeutro };
    }
  }, [estadoEjecucion]);

  const estadoBadgeClase = useMemo(() => {
    if (estadoEjecucion === 'aceptada') return styles.estadoBadgeFinal;
    if (
      estadoEjecucion === 'rechazada' ||
      estadoEjecucion === 'sin-regla'
    )
      return styles.estadoBadgeRechazo;
    return '';
  }, [estadoEjecucion]);

  const ejecutando = estadoEjecucion === 'ejecutando';

  // Dimensiones SVG cinta
  const CELDA_W = 40;
  const CELDA_H = 50;
  const CABEZAL_OFFSET = 14;
  const svgWidth = CELDAS_VISIBLES * CELDA_W + 20;
  const svgHeight = CELDA_H + 50;
  const cabezalIdxVisual = Math.floor(CELDAS_VISIBLES / 2);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Máquina de Turing</h1>
        <p className={styles.subtitle}>
          Cinta, reglas y programas clásicos animados paso a paso. Aprende
          computabilidad de forma visual.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Programas predefinidos */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Programas predefinidos</h2>
          <div className={styles.programasGrid}>
            {PROGRAMAS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.programaBtn} ${
                  programaActivo === p.id ? styles.programaBtnActive : ''
                }`}
                onClick={() => cargarPrograma(p.id)}
                // Marcaban la selección solo con la clase CSS: un lector de pantalla no podía
                // saber qué programa estaba cargado (hallazgo 336).
                aria-pressed={programaActivo === p.id}
              >
                <span className={styles.programaTitle}>{p.titulo}</span>
                <span className={styles.programaDesc}>{p.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Configuración */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuración</h2>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="cinta-inicial">Cinta inicial</label>
              <textarea
                id="cinta-inicial"
                className={styles.textArea}
                value={cintaInicialInput}
                onChange={(e) => setCintaInicialInput(e.target.value)}
                placeholder="Ej: 1011 (símbolo blanco: _)"
                spellCheck={false}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="estado-inicial">Estado inicial</label>
              <input
                id="estado-inicial"
                className={styles.textInput}
                value={estadoInicial}
                onChange={(e) => setEstadoInicial(e.target.value.trim())}
                spellCheck={false}
              />
            </div>
            <div className={styles.inputGroup}>
              {/* La etiqueta no tenía `htmlFor` y el campo de abajo solo se apoyaba en su
                  placeholder, que desaparece al escribir y no es un nombre accesible. */}
              <label htmlFor="estado-final-nuevo">Estados finales</label>
              <div className={styles.chipsRow}>
                {estadosFinales.map((ef) => (
                  <span key={ef} className={styles.chip}>
                    {ef}
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => eliminarEstadoFinal(ef)}
                      aria-label={`Eliminar estado final ${ef}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="estado-final-nuevo"
                  className={styles.chipAddInput}
                  value={estadoFinalInputDraft}
                  onChange={(e) => setEstadoFinalInputDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      anadirEstadoFinal();
                    }
                  }}
                  placeholder="+ qf"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tabla de reglas */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            Tabla de reglas (transiciones)
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.reglasTable}>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Lee</th>
                  <th>Escribe</th>
                  <th>Mueve</th>
                  <th>Nuevo estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reglas.map((r, idx) => (
                  <tr
                    key={idx}
                    className={reglaActiva === idx ? styles.reglaActiva : ''}
                  >
                    <td>
                      <input
                        className={styles.reglaInput}
                        value={r.estado}
                        onChange={(e) =>
                          actualizarRegla(idx, 'estado', e.target.value.trim())
                        }
                        spellCheck={false}
                        aria-label={`Regla ${idx + 1}: estado actual`}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.reglaInput}
                        value={r.lee}
                        onChange={(e) =>
                          actualizarRegla(
                            idx,
                            'lee',
                            e.target.value.slice(0, 1) || SIMBOLO_BLANCO
                          )
                        }
                        spellCheck={false}
                        aria-label={`Regla ${idx + 1}: símbolo que lee`}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.reglaInput}
                        value={r.escribe}
                        onChange={(e) =>
                          actualizarRegla(
                            idx,
                            'escribe',
                            e.target.value.slice(0, 1) || SIMBOLO_BLANCO
                          )
                        }
                        spellCheck={false}
                        aria-label={`Regla ${idx + 1}: símbolo que escribe`}
                      />
                    </td>
                    <td>
                      <select
                        className={styles.reglaSelect}
                        value={r.mueve}
                        onChange={(e) =>
                          actualizarRegla(idx, 'mueve', e.target.value)
                        }
                        aria-label={`Regla ${idx + 1}: hacia dónde mueve el cabezal`}
                      >
                        <option value="L">L (izquierda)</option>
                        <option value="R">R (derecha)</option>
                        <option value="S">S (estática)</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className={styles.reglaInput}
                        value={r.nuevoEstado}
                        onChange={(e) =>
                          actualizarRegla(
                            idx,
                            'nuevoEstado',
                            e.target.value.trim()
                          )
                        }
                        spellCheck={false}
                        aria-label={`Regla ${idx + 1}: estado al que pasa`}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => eliminarRegla(idx)}
                        aria-label={`Eliminar regla: si el estado es ${r.estado} y se lee ${r.lee}, escribir ${r.escribe}, mover ${r.mueve} e ir al estado ${r.nuevoEstado}`}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.tableActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={anadirRegla}
            >
              + Añadir regla
            </button>
          </div>
        </section>

        {/* Velocidad */}
        <div className={styles.velocidadControl}>
          <label htmlFor="velocidad-slider">Velocidad</label>
          <input
            id="velocidad-slider"
            type="range"
            min={VELOCIDAD_MIN}
            max={2000}
            step={10}
            value={velocidad}
            onChange={(e) => setVelocidad(Number(e.target.value))}
          />
          <span className={styles.velocidadValue}>
            {velocidad <= VELOCIDAD_MIN ? 'Sin pausa' : `${formatNumber(velocidad, 0)} ms`}
          </span>
        </div>
        {/* El tope de velocidad era 100 ms/paso, o sea unos 9 pasos por segundo reales: llegar
            a los 5.000 pasos que el bloque educativo invita a usar como señal de bucle
            infinito tardaba unos NUEVE MINUTOS, y cualquier máquina de unos cientos de pasos
            obligaba a esperar (hallazgo 342). El cortafuegos ya existía y la ejecución es
            asíncrona, así que no cuelga el navegador; lo que faltaba era poder llegar hasta
            él. Con 10 ms el aviso aparece en menos de un minuto. */}
        {velocidad <= VELOCIDAD_MIN && (
          <p className={styles.velocidadNota}>
            A esta velocidad la cinta va demasiado rápido para seguirla con la vista: sirve para
            llegar al final —o al aviso de los {formatNumber(LIMITE_PASOS, 0)} pasos— sin esperar.
          </p>
        )}

        {/* Controles */}
        <div className={styles.controlBar}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={toggleEjecucion}
          >
            {ejecutando ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => paso()}
            disabled={
              ejecutando ||
              estadoEjecucion === 'aceptada' ||
              estadoEjecucion === 'rechazada' ||
              estadoEjecucion === 'sin-regla'
            }
          >
            Paso siguiente
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={reiniciar}
          >
            Reiniciar
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => setVelocidad((v) => Math.min(2000, v + 200))}
          >
            Ralentizar
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => setVelocidad((v) => Math.max(100, v - 200))}
          >
            Acelerar
          </button>
        </div>

        {/* Cinta SVG */}
        <div className={styles.cintaContainer}>
          <h3 className={styles.panelTitle}>Cinta</h3>
          <svg
            className={styles.cintaSvg}
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            role="img"
            aria-label="Cinta de la máquina de Turing"
          >
            {/* Cabezal arriba */}
            <polygon
              className={styles.cabezal}
              points={`${10 + cabezalIdxVisual * CELDA_W + CELDA_W / 2},${CABEZAL_OFFSET} ${
                10 + cabezalIdxVisual * CELDA_W + CELDA_W / 2 - 8
              },${CABEZAL_OFFSET - 12} ${
                10 + cabezalIdxVisual * CELDA_W + CELDA_W / 2 + 8
              },${CABEZAL_OFFSET - 12}`}
            />
            <text
              className={styles.cabezalLabel}
              x={10 + cabezalIdxVisual * CELDA_W + CELDA_W / 2}
              y={CABEZAL_OFFSET - 16}
            >
              ▼
            </text>

            {/* Celdas */}
            {ventanaCinta.map((c, i) => {
              const x = 10 + i * CELDA_W;
              const esActual = i === cabezalIdxVisual;
              const esEscrita =
                celdaEscrita !== null && c.indiceReal === celdaEscrita;
              const claseCelda = esActual
                ? styles.celdaActual
                : esEscrita
                ? styles.celdaEscrita
                : styles.celda;
              return (
                <g key={i}>
                  <rect
                    className={claseCelda}
                    x={x}
                    y={CABEZAL_OFFSET + 6}
                    width={CELDA_W}
                    height={CELDA_H}
                    rx={4}
                  />
                  <text
                    className={styles.celdaText}
                    x={x + CELDA_W / 2}
                    y={CABEZAL_OFFSET + 6 + CELDA_H / 2 + 6}
                  >
                    {c.simbolo}
                  </text>
                  <text
                    className={styles.celdaIndice}
                    x={x + CELDA_W / 2}
                    y={CABEZAL_OFFSET + 6 + CELDA_H + 14}
                  >
                    {c.indiceReal}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Estado actual */}
        <div className={styles.centerRow}>
          <div className={`${styles.estadoBadge} ${estadoBadgeClase}`}>
            <span className={styles.estadoLabel}>Estado:</span>
            {estadoActual}
          </div>
        </div>

        {/* Métricas */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Pasos ejecutados</span>
            <span className={styles.metricValue}>{formatNumber(pasos, 0)}</span>
          </div>
          <div className={styles.metricCard}>
            {/* El contador solo sube cuando la escritura CAMBIA la celda, y en el formalismo
                toda transición escribe un símbolo aunque sea el mismo: con el bucle
                q0 1→1,S,q0 la app marcaba «Símbolos escritos 0» tras 36 transiciones. Se
                renombra la etiqueta a lo que de verdad mide, que además es lo interesante de
                ver en una app didáctica (hallazgo 340). */}
            <span className={styles.metricLabel}>Celdas modificadas</span>
            <span className={styles.metricValue}>
              {formatNumber(simbolosEscritos, 0)}
            </span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Movimientos del cabezal</span>
            <span className={styles.metricValue}>
              {formatNumber(movimientosCabezal, 0)}
            </span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Cinta final (limpia)</span>
            <span className={styles.metricValue}>
              <span className={styles.cintaFinalDisplay}>
                {cintaFinalLimpia}
              </span>
            </span>
          </div>
        </div>

        {/* Resultado */}
        <div
          className={`${styles.resultadoBox} ${resultadoTexto.clase}`}
          role="status"
          aria-live="polite"
        >
          <strong>Resultado:</strong> {resultadoTexto.texto}
        </div>
      </main>

      <EducationalSection
        title="Guía de Máquina de Turing"
        subtitle="Cómo funciona el modelo computacional universal"
      >
        <h3>Componentes de una Máquina de Turing</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Componente</th>
                <th>Qué es</th>
                <th>Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cinta</td>
                <td>
                  Memoria infinita en ambos sentidos, dividida en celdas que
                  contienen un símbolo cada una
                </td>
                <td>… _ _ 1 0 1 1 _ _ …</td>
              </tr>
              <tr>
                <td>Cabezal</td>
                <td>
                  Apunta a una sola celda. Lee, escribe y se mueve una posición
                  a la izquierda, derecha o se queda quieto
                </td>
                <td>Triángulo naranja sobre la celda activa</td>
              </tr>
              <tr>
                <td>Estados</td>
                <td>
                  Conjunto finito de configuraciones internas (q0, q1…). Hay un
                  estado inicial y uno o varios estados finales
                </td>
                <td>{`Q = { q0, q1, q2, qf }`}</td>
              </tr>
              <tr>
                <td>Alfabeto</td>
                <td>
                  Conjunto finito de símbolos válidos en la cinta, incluido el
                  símbolo blanco
                </td>
                <td>{'{ 0, 1, _ }'}</td>
              </tr>
              <tr>
                <td>Función de transición δ</td>
                <td>
                  Para cada (estado, símbolo leído) define qué escribir, hacia
                  dónde mover el cabezal y qué estado pasar
                </td>
                <td>δ(q0, 1) = (1, R, q0)</td>
              </tr>
              <tr>
                <td>Estados finales</td>
                <td>
                  Si la máquina llega a uno de ellos, la cadena se acepta. Si
                  no hay regla aplicable y no es final, se rechaza
                </td>
                <td>F = {'{ qf }'}</td>
              </tr>
              <tr>
                <td>Símbolo blanco</td>
                <td>
                  Marca celdas vacías. Por convención se representa como _ o
                  con el símbolo ⊔
                </td>
                <td>_</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <strong>Estudiante de Teoría de la Computación</strong>
            </div>
            <p className={styles.escenarioExample}>
              Cursas Autómatas y Lenguajes Formales en grado de Informática y
              necesitas diseñar máquinas que reconozcan lenguajes como aⁿbⁿ o
              palíndromos para el examen.
            </p>
            <div className={styles.escenarioTip}>
              Empieza con el programa &quot;Reconocer aⁿbⁿ&quot;, ejecútalo paso
              a paso y modifica una regla para ver cómo cambia el resultado.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📘</span>
              <strong>Opositor TIC</strong>
            </div>
            <p className={styles.escenarioExample}>
              Preparas oposiciones de informática (auxiliar, técnico, profesor
              de secundaria) donde aparecen preguntas teóricas sobre
              computabilidad y la tesis Church-Turing.
            </p>
            <div className={styles.escenarioTip}>
              Ver una máquina ejecutarse fija conceptos abstractos mucho mejor
              que memorizar tablas de transición sin contexto.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎙️</span>
              <strong>Divulgador o curioso</strong>
            </div>
            <p className={styles.escenarioExample}>
              Quieres entender por qué Alan Turing es considerado el padre de
              la informática moderna y qué significa que un lenguaje sea
              &quot;Turing-completo&quot;.
            </p>
            <div className={styles.escenarioTip}>
              Carga el incrementador binario y observa cómo un mecanismo tan
              simple puede sumar números arbitrariamente grandes.
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👨‍🏫</span>
              <strong>Profesor de Informática</strong>
            </div>
            <p className={styles.escenarioExample}>
              Enseñas la asignatura y necesitas un recurso visual para que el
              alumnado entienda transiciones, estados y la diferencia entre
              aceptar y rechazar una entrada.
            </p>
            {/* Decía «el aprendizaje activo cuadruplica la retención»: un multiplicador
                redondo, sin fuente ni año, del mismo género que la «pirámide del aprendizaje»
                o el cono de Dale, cuyos porcentajes de retención están desacreditados y nunca
                tuvieron base experimental. Antipatrón editorial nº 1 del CLAUDE.md, y
                hallazgo 337 del Inspector. La recomendación se sostiene sola sin la cifra. */}
            <div className={styles.escenarioTip}>
              Proyecta el simulador en el aula y deja que la clase modifique
              reglas en directo: ver cómo una regla mal puesta cuelga la máquina
              enseña más que leer la definición.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>
              ¿Por qué se sigue estudiando si nadie construye máquinas de
              Turing reales?
            </h4>
            <p>
              Porque es el modelo teórico más simple capaz de capturar todo lo
              que es computable mecánicamente. Define los límites de la
              computación: si algo no puede hacerse en una máquina de Turing,
              no puede hacerse en ningún ordenador físico. Es la base de la
              teoría de la complejidad (clases P, NP, etc.).
            </p>
            <p className={styles.faqTip}>
              Idea clave: una máquina de Turing es una abstracción matemática,
              no un dispositivo a fabricar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es la tesis de Church-Turing?</h4>
            <p>
              Sostiene que todo problema que pueda resolverse mediante un
              algoritmo (en el sentido intuitivo) puede resolverse en una
              máquina de Turing. Es una tesis, no un teorema: no se puede
              demostrar formalmente porque requiere definir &quot;algoritmo
              intuitivo&quot;, pero un siglo de evidencia la respalda.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>
              ¿Diferencia entre máquina de Turing determinista y no
              determinista?
            </h4>
            <p>
              En la determinista (la que simula esta app) cada par (estado,
              símbolo) tiene una sola transición posible. En la no determinista
              puede haber varias, y la máquina &quot;adivina&quot; el camino
              correcto. Ambas reconocen los mismos lenguajes (los recursivamente
              enumerables), pero la no determinista puede ser exponencialmente
              más rápida en algunos casos. De ahí la pregunta abierta P vs NP.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el problema de la parada?</h4>
            <p>
              Es la pregunta: dada una máquina de Turing M y una entrada x,
              ¿M se detendrá alguna vez con esa entrada? Turing demostró en
              1936 que no existe ningún algoritmo general que responda esta
              pregunta para cualquier (M, x). Es el primer ejemplo histórico de
              problema indecidible.
            </p>
            <p className={styles.faqTip}>
              Por eso ningún antivirus puede detectar todo el malware ni ningún
              IDE puede detectar todos los bucles infinitos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Una computadora real es Turing-completa?</h4>
            {/* Decía que «un PC es un autómata linealmente acotado». Un LBA usa una cinta
                acotada por una función lineal DE LA ENTRADA, así que crece con ella; un
                ordenador real tiene memoria fija, que no crece con nada. El modelo formal
                estricto es un autómata finito — enorme, pero finito (hallazgo 338). El resto
                de la respuesta ya era correcto. */}
            <p>
              En la práctica, sí. En sentido estricto, no: las máquinas reales
              tienen memoria finita, mientras que la máquina de Turing tiene
              cinta infinita. Con memoria fija, el modelo formal que le
              corresponde a un ordenador es un autómata finito —enorme, pero
              finito—, y a efectos prácticos lo tratamos como Turing-completo
              porque esa memoria es tan grande que el límite no se nota.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué lenguajes reconoce una máquina de Turing?</h4>
            <p>
              Los lenguajes recursivamente enumerables (la clase más amplia de
              la jerarquía de Chomsky). Cuando además siempre se detiene, el
              lenguaje es recursivo (decidible). Un autómata finito reconoce
              regulares; un autómata a pila reconoce libres de contexto; una MT
              los engloba a todos.
            </p>
          </div>
        </div>

        <h3>Cómo Diseñar una Máquina — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Define el alfabeto</strong>
              <p>
                Decide qué símbolos pueden aparecer en la cinta de entrada y
                qué símbolos auxiliares usarás (marcas como X, Y o $). Incluye
                siempre el símbolo blanco _.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Identifica los estados</strong>
              <p>
                Cada estado representa una &quot;fase&quot; del algoritmo:
                buscar, marcar, comparar, retroceder, aceptar. Pon nombres
                descriptivos en tu diseño y luego renombra a q0, q1…
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Diseña las transiciones</strong>
              <p>
                Para cada (estado, símbolo) decide la terna (escribir, mover,
                nuevo estado). Una buena heurística: imagínate como el cabezal
                y decide qué harías al leer ese símbolo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Elige los estados finales</strong>
              <p>
                Define qué estados representan la aceptación. Si quieres que
                rechace explícitamente, deja entradas sin transición definida y
                que no sean finales: la máquina parará y rechazará.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Prueba con casos límite</strong>
              <p>
                Cadena vacía, un solo símbolo, cadena máxima, cadena que debe
                rechazarse. Ejecuta paso a paso en el simulador y verifica que
                el resultado coincide con tu diseño en papel.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <strong>Diseña primero en papel</strong>
            <p>
              Dibuja el diagrama de estados antes de teclear reglas. Te
              ahorrará horas de depuración.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
            <strong>Usa marcadores auxiliares</strong>
            <p>
              Reescribir &quot;a&quot; como &quot;X&quot; al consumirla evita
              perder el conteo en problemas como aⁿbⁿ.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🐢</span>
            <strong>Empieza con velocidad lenta</strong>
            <p>
              A 1500-2000 ms verás cada transición claramente. Acelera solo
              cuando ya entiendas el flujo.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <strong>Modo paso a paso para depurar</strong>
            <p>
              Cuando el resultado no es el esperado, avanza con &quot;Paso
              siguiente&quot; y observa qué regla se aplica.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Una fase, un estado</strong>
            <p>
              Si un estado intenta hacer dos cosas a la vez, divídelo en dos.
              La claridad supera a la concisión.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧪</span>
            <strong>Verifica con casos extremos</strong>
            <p>
              Cadena vacía, un solo carácter, casos que deben rechazarse:
              probarlos detecta errores que los casos normales esconden.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al diseñar máquinas</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              Olvidar el caso de cinta vacía o entrada vacía: muchos diseños
              fallan en el primer paso.
            </li>
            <li>
              No definir transición para el símbolo blanco al llegar al final
              de la cinta: la máquina queda bloqueada sin razón clara.
            </li>
            <li>
              Confundir &quot;rechazo por falta de regla&quot; con
              &quot;aceptación por estado final&quot;: ambos detienen la
              máquina, pero significan lo opuesto.
            </li>
            <li>
              Crear bucles infinitos al moverse en la misma dirección sin
              cambiar nada en la cinta. Si tras 5000 pasos no acaba, revisa
              transiciones que no avancen.
            </li>
            <li>
              Usar el mismo símbolo auxiliar para fases distintas: produce
              colisiones donde el cabezal vuelve y &quot;cree&quot; estar en
              otra fase.
            </li>
            <li>
              Asumir que la cinta empieza limpia más allá de la entrada: en la
              definición teórica sí, pero al programar conviene comprobar
              siempre los blancos.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-maquina-turing')} />
      <ShareCard appName="simulador-maquina-turing" />
      <Footer appName="simulador-maquina-turing" />
    </div>
  );
}
