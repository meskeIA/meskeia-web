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
import styles from './SimuladorRecursion.module.css';

type Funcion =
  | 'factorial'
  | 'fibonacci'
  | 'hanoi'
  | 'mcd'
  | 'suma-digitos'
  | 'busqueda-binaria';

type EventoPaso = 'llamar' | 'retornar' | 'caso-base' | 'memo-hit';

interface Frame {
  id: string;
  parentId: string | null;
  funcion: string;
  args: string;
  variablesLocales: Record<string, string | number>;
  retorno?: string | number;
  fromMemo?: boolean;
  hijos: string[];
  // Para Hanoi
  movimiento?: string;
  estadoTorres?: number[][];
}

interface PasoRecursion {
  evento: EventoPaso;
  frameId: string;
  pilaIds: string[]; // ids actualmente en pila (top = último)
  descripcion: string;
  // Snapshot para Hanoi
  estadoTorres?: number[][];
}

interface FuncionInfo {
  id: Funcion;
  nombre: string;
  desc: string;
}

const FUNCIONES: FuncionInfo[] = [
  { id: 'factorial', nombre: 'Factorial', desc: 'n!' },
  { id: 'fibonacci', nombre: 'Fibonacci', desc: 'fib(n)' },
  { id: 'hanoi', nombre: 'Torres Hanoi', desc: 'n discos' },
  { id: 'mcd', nombre: 'MCD (Euclides)', desc: 'gcd(a, b)' },
  { id: 'suma-digitos', nombre: 'Suma dígitos', desc: 's(n)' },
  { id: 'busqueda-binaria', nombre: 'Búsqueda binaria', desc: 'array' },
];

const PALETA_DISCOS = ['#2E86AB', '#48A9A6', '#F18F01', '#C73E1D', '#6A4C93', '#1B998B', '#E63946'];

interface SimulacionResultado {
  pasos: PasoRecursion[];
  frames: Map<string, Frame>;
  resultado: string | number;
  llamadasTotales: number;
  llamadasFromMemo: number;
  profundidadMaxima: number;
  numFramesUnicos: number;
}

// ============================================
// SIMULADORES
// ============================================

function simularFactorial(n: number): SimulacionResultado {
  const pasos: PasoRecursion[] = [];
  const frames = new Map<string, Frame>();
  let counter = 0;
  const pilaIds: string[] = [];
  let profundidadMaxima = 0;

  function helper(arg: number, parentId: string | null): { valor: number; frameId: string } {
    const frameId = `f${counter++}`;
    const frame: Frame = {
      id: frameId,
      parentId,
      funcion: 'factorial',
      args: `${arg}`,
      variablesLocales: { n: arg },
      hijos: [],
    };
    frames.set(frameId, frame);
    if (parentId) {
      const parent = frames.get(parentId);
      if (parent) parent.hijos.push(frameId);
    }
    pilaIds.push(frameId);
    profundidadMaxima = Math.max(profundidadMaxima, pilaIds.length);

    pasos.push({
      evento: 'llamar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `→ factorial(${arg}) entra en la pila`,
    });

    if (arg <= 1) {
      frame.retorno = 1;
      pasos.push({
        evento: 'caso-base',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `Caso base: factorial(${arg}) = 1`,
      });
      pilaIds.pop();
      pasos.push({
        evento: 'retornar',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `← factorial(${arg}) retorna 1`,
      });
      return { valor: 1, frameId };
    }

    const sub = helper(arg - 1, frameId);
    const resultado = arg * sub.valor;
    frame.retorno = resultado;
    pilaIds.pop();
    pasos.push({
      evento: 'retornar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `← factorial(${arg}) = ${arg} × ${sub.valor} = ${resultado}`,
    });
    return { valor: resultado, frameId };
  }

  const r = helper(n, null);
  return {
    pasos,
    frames,
    resultado: r.valor,
    llamadasTotales: counter,
    llamadasFromMemo: 0,
    profundidadMaxima,
    numFramesUnicos: counter,
  };
}

function simularFibonacci(n: number, useMemo: boolean): SimulacionResultado {
  const pasos: PasoRecursion[] = [];
  const frames = new Map<string, Frame>();
  let counter = 0;
  const pilaIds: string[] = [];
  let profundidadMaxima = 0;
  let llamadasFromMemo = 0;
  const memo = new Map<number, number>();

  function helper(arg: number, parentId: string | null): { valor: number; frameId: string } {
    const frameId = `f${counter++}`;
    const frame: Frame = {
      id: frameId,
      parentId,
      funcion: 'fib',
      args: `${arg}`,
      variablesLocales: { n: arg },
      hijos: [],
    };
    frames.set(frameId, frame);
    if (parentId) {
      const parent = frames.get(parentId);
      if (parent) parent.hijos.push(frameId);
    }
    pilaIds.push(frameId);
    profundidadMaxima = Math.max(profundidadMaxima, pilaIds.length);

    pasos.push({
      evento: 'llamar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `→ fib(${arg}) entra en la pila`,
    });

    // Memo hit
    if (useMemo && memo.has(arg)) {
      const cached = memo.get(arg)!;
      frame.retorno = cached;
      frame.fromMemo = true;
      llamadasFromMemo++;
      pasos.push({
        evento: 'memo-hit',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `Memo: fib(${arg}) ya cacheado = ${cached}`,
      });
      pilaIds.pop();
      pasos.push({
        evento: 'retornar',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `← fib(${arg}) retorna ${cached} (memo)`,
      });
      return { valor: cached, frameId };
    }

    if (arg <= 1) {
      frame.retorno = arg;
      pasos.push({
        evento: 'caso-base',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `Caso base: fib(${arg}) = ${arg}`,
      });
      if (useMemo) memo.set(arg, arg);
      pilaIds.pop();
      pasos.push({
        evento: 'retornar',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `← fib(${arg}) retorna ${arg}`,
      });
      return { valor: arg, frameId };
    }

    const sub1 = helper(arg - 1, frameId);
    const sub2 = helper(arg - 2, frameId);
    const resultado = sub1.valor + sub2.valor;
    frame.retorno = resultado;
    if (useMemo) memo.set(arg, resultado);
    pilaIds.pop();
    pasos.push({
      evento: 'retornar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `← fib(${arg}) = fib(${arg - 1}) + fib(${arg - 2}) = ${sub1.valor} + ${sub2.valor} = ${resultado}`,
    });
    return { valor: resultado, frameId };
  }

  const r = helper(n, null);
  return {
    pasos,
    frames,
    resultado: r.valor,
    llamadasTotales: counter,
    llamadasFromMemo,
    profundidadMaxima,
    numFramesUnicos: counter,
  };
}

function simularHanoi(n: number): SimulacionResultado {
  const pasos: PasoRecursion[] = [];
  const frames = new Map<string, Frame>();
  let counter = 0;
  const pilaIds: string[] = [];
  let profundidadMaxima = 0;

  // 3 torres: 0=A, 1=B, 2=C
  const torres: number[][] = [[], [], []];
  // Inicializar torre A con discos del más grande al más pequeño
  for (let i = n; i >= 1; i--) torres[0].push(i);

  function snapshot(): number[][] {
    return torres.map((t) => [...t]);
  }

  function helper(disco: number, origen: number, destino: number, aux: number, parentId: string | null) {
    const frameId = `f${counter++}`;
    const nombresOrigen = ['A', 'B', 'C'];
    const frame: Frame = {
      id: frameId,
      parentId,
      funcion: 'hanoi',
      args: `${disco}, ${nombresOrigen[origen]}→${nombresOrigen[destino]}`,
      variablesLocales: {
        n: disco,
        origen: nombresOrigen[origen],
        destino: nombresOrigen[destino],
        aux: nombresOrigen[aux],
      },
      hijos: [],
    };
    frames.set(frameId, frame);
    if (parentId) {
      const parent = frames.get(parentId);
      if (parent) parent.hijos.push(frameId);
    }
    pilaIds.push(frameId);
    profundidadMaxima = Math.max(profundidadMaxima, pilaIds.length);

    pasos.push({
      evento: 'llamar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `→ hanoi(${disco}, ${nombresOrigen[origen]}, ${nombresOrigen[destino]}, ${nombresOrigen[aux]})`,
      estadoTorres: snapshot(),
    });

    if (disco === 1) {
      // Mover disco directamente
      const top = torres[origen].pop();
      if (top !== undefined) torres[destino].push(top);
      frame.movimiento = `${nombresOrigen[origen]} → ${nombresOrigen[destino]}`;
      frame.retorno = 'mover disco 1';
      pasos.push({
        evento: 'caso-base',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `Mover disco 1: ${nombresOrigen[origen]} → ${nombresOrigen[destino]}`,
        estadoTorres: snapshot(),
      });
      pilaIds.pop();
      pasos.push({
        evento: 'retornar',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `← hanoi(1) retorna`,
        estadoTorres: snapshot(),
      });
      return;
    }

    helper(disco - 1, origen, aux, destino, frameId);

    const top = torres[origen].pop();
    if (top !== undefined) torres[destino].push(top);
    frame.movimiento = `${nombresOrigen[origen]} → ${nombresOrigen[destino]}`;
    pasos.push({
      evento: 'caso-base',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `Mover disco ${disco}: ${nombresOrigen[origen]} → ${nombresOrigen[destino]}`,
      estadoTorres: snapshot(),
    });

    helper(disco - 1, aux, destino, origen, frameId);

    frame.retorno = `mov`;
    pilaIds.pop();
    pasos.push({
      evento: 'retornar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `← hanoi(${disco}) completado`,
      estadoTorres: snapshot(),
    });
  }

  helper(n, 0, 2, 1, null);
  const totalMovimientos = (1 << n) - 1;
  return {
    pasos,
    frames,
    resultado: `${formatNumber(totalMovimientos, 0)} movimientos`,
    llamadasTotales: counter,
    llamadasFromMemo: 0,
    profundidadMaxima,
    numFramesUnicos: counter,
  };
}

function simularMcd(a: number, b: number): SimulacionResultado {
  const pasos: PasoRecursion[] = [];
  const frames = new Map<string, Frame>();
  let counter = 0;
  const pilaIds: string[] = [];
  let profundidadMaxima = 0;

  function helper(x: number, y: number, parentId: string | null): { valor: number; frameId: string } {
    const frameId = `f${counter++}`;
    const frame: Frame = {
      id: frameId,
      parentId,
      funcion: 'mcd',
      args: `${x}, ${y}`,
      variablesLocales: { a: x, b: y },
      hijos: [],
    };
    frames.set(frameId, frame);
    if (parentId) {
      const parent = frames.get(parentId);
      if (parent) parent.hijos.push(frameId);
    }
    pilaIds.push(frameId);
    profundidadMaxima = Math.max(profundidadMaxima, pilaIds.length);

    pasos.push({
      evento: 'llamar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `→ mcd(${x}, ${y})`,
    });

    if (y === 0) {
      frame.retorno = x;
      pasos.push({
        evento: 'caso-base',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `Caso base: mcd(${x}, 0) = ${x}`,
      });
      pilaIds.pop();
      pasos.push({
        evento: 'retornar',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `← mcd(${x}, 0) retorna ${x}`,
      });
      return { valor: x, frameId };
    }

    const resto = x % y;
    const sub = helper(y, resto, frameId);
    frame.retorno = sub.valor;
    pilaIds.pop();
    pasos.push({
      evento: 'retornar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `← mcd(${x}, ${y}) = mcd(${y}, ${resto}) = ${sub.valor}`,
    });
    return { valor: sub.valor, frameId };
  }

  const r = helper(a, b, null);
  return {
    pasos,
    frames,
    resultado: r.valor,
    llamadasTotales: counter,
    llamadasFromMemo: 0,
    profundidadMaxima,
    numFramesUnicos: counter,
  };
}

function simularSumaDigitos(n: number): SimulacionResultado {
  const pasos: PasoRecursion[] = [];
  const frames = new Map<string, Frame>();
  let counter = 0;
  const pilaIds: string[] = [];
  let profundidadMaxima = 0;

  function helper(x: number, parentId: string | null): { valor: number; frameId: string } {
    const frameId = `f${counter++}`;
    const frame: Frame = {
      id: frameId,
      parentId,
      funcion: 'suma',
      args: `${x}`,
      variablesLocales: { n: x },
      hijos: [],
    };
    frames.set(frameId, frame);
    if (parentId) {
      const parent = frames.get(parentId);
      if (parent) parent.hijos.push(frameId);
    }
    pilaIds.push(frameId);
    profundidadMaxima = Math.max(profundidadMaxima, pilaIds.length);

    pasos.push({
      evento: 'llamar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `→ suma(${x})`,
    });

    if (x < 10) {
      frame.retorno = x;
      pasos.push({
        evento: 'caso-base',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `Caso base: suma(${x}) = ${x}`,
      });
      pilaIds.pop();
      pasos.push({
        evento: 'retornar',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `← suma(${x}) retorna ${x}`,
      });
      return { valor: x, frameId };
    }

    const ultimoDigito = x % 10;
    const resto = Math.floor(x / 10);
    const sub = helper(resto, frameId);
    const resultado = ultimoDigito + sub.valor;
    frame.retorno = resultado;
    pilaIds.pop();
    pasos.push({
      evento: 'retornar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `← suma(${x}) = ${ultimoDigito} + ${sub.valor} = ${resultado}`,
    });
    return { valor: resultado, frameId };
  }

  const r = helper(n, null);
  return {
    pasos,
    frames,
    resultado: r.valor,
    llamadasTotales: counter,
    llamadasFromMemo: 0,
    profundidadMaxima,
    numFramesUnicos: counter,
  };
}

function simularBusquedaBinaria(arr: number[], objetivo: number): SimulacionResultado {
  const pasos: PasoRecursion[] = [];
  const frames = new Map<string, Frame>();
  let counter = 0;
  const pilaIds: string[] = [];
  let profundidadMaxima = 0;

  function helper(
    inicio: number,
    fin: number,
    parentId: string | null
  ): { valor: number; frameId: string } {
    const frameId = `f${counter++}`;
    const frame: Frame = {
      id: frameId,
      parentId,
      funcion: 'busq',
      args: `[${inicio}..${fin}]`,
      variablesLocales: { inicio, fin },
      hijos: [],
    };
    frames.set(frameId, frame);
    if (parentId) {
      const parent = frames.get(parentId);
      if (parent) parent.hijos.push(frameId);
    }
    pilaIds.push(frameId);
    profundidadMaxima = Math.max(profundidadMaxima, pilaIds.length);

    pasos.push({
      evento: 'llamar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `→ buscar en arr[${inicio}..${fin}]`,
    });

    if (inicio > fin) {
      frame.retorno = -1;
      pasos.push({
        evento: 'caso-base',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `Caso base: rango vacío, no encontrado`,
      });
      pilaIds.pop();
      pasos.push({
        evento: 'retornar',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `← retorna -1 (no encontrado)`,
      });
      return { valor: -1, frameId };
    }

    const medio = Math.floor((inicio + fin) / 2);
    frame.variablesLocales.medio = medio;
    frame.variablesLocales['arr[medio]'] = arr[medio];

    if (arr[medio] === objetivo) {
      frame.retorno = medio;
      pasos.push({
        evento: 'caso-base',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `Caso base: arr[${medio}] = ${arr[medio]} = objetivo`,
      });
      pilaIds.pop();
      pasos.push({
        evento: 'retornar',
        frameId,
        pilaIds: [...pilaIds],
        descripcion: `← retorna índice ${medio}`,
      });
      return { valor: medio, frameId };
    }

    let sub: { valor: number; frameId: string };
    if (arr[medio] < objetivo) {
      sub = helper(medio + 1, fin, frameId);
    } else {
      sub = helper(inicio, medio - 1, frameId);
    }
    frame.retorno = sub.valor;
    pilaIds.pop();
    pasos.push({
      evento: 'retornar',
      frameId,
      pilaIds: [...pilaIds],
      descripcion: `← arr[${inicio}..${fin}] retorna ${sub.valor}`,
    });
    return { valor: sub.valor, frameId };
  }

  const r = helper(0, arr.length - 1, null);
  const resultadoTexto =
    r.valor === -1 ? `no encontrado` : `índice ${r.valor} (valor ${arr[r.valor]})`;
  return {
    pasos,
    frames,
    resultado: resultadoTexto,
    llamadasTotales: counter,
    llamadasFromMemo: 0,
    profundidadMaxima,
    numFramesUnicos: counter,
  };
}

// ============================================
// LAYOUT DEL ÁRBOL
// ============================================

interface NodoPos {
  frameId: string;
  x: number;
  y: number;
  depth: number;
}

function calcularLayoutArbol(
  frames: Map<string, Frame>
): { nodos: NodoPos[]; ancho: number; alto: number } {
  const nodos: NodoPos[] = [];
  if (frames.size === 0) return { nodos, ancho: 600, alto: 320 };

  // Encontrar raíz (el primero sin parent)
  let rootId: string | null = null;
  for (const [id, frame] of frames) {
    if (frame.parentId === null) {
      rootId = id;
      break;
    }
  }
  if (!rootId) return { nodos, ancho: 600, alto: 320 };

  // Layout tipo "compact tree": asignar x según orden in-order
  let xCounter = 0;
  const xMap = new Map<string, number>();
  const depthMap = new Map<string, number>();

  function asignar(id: string, depth: number) {
    const frame = frames.get(id);
    if (!frame) return;
    depthMap.set(id, depth);
    if (frame.hijos.length === 0) {
      xMap.set(id, xCounter++);
      return;
    }
    for (const hijoId of frame.hijos) {
      asignar(hijoId, depth + 1);
    }
    // x del padre = promedio de los x de los hijos
    const xs = frame.hijos.map((h) => xMap.get(h) ?? 0);
    const promedio = xs.reduce((a, b) => a + b, 0) / xs.length;
    xMap.set(id, promedio);
  }

  asignar(rootId, 0);

  const espacioX = 70;
  const espacioY = 70;
  const margenX = 50;
  const margenY = 40;
  let maxDepth = 0;
  let maxX = 0;

  for (const [id, x] of xMap) {
    const depth = depthMap.get(id) ?? 0;
    nodos.push({
      frameId: id,
      x: margenX + x * espacioX,
      y: margenY + depth * espacioY,
      depth,
    });
    maxDepth = Math.max(maxDepth, depth);
    maxX = Math.max(maxX, x);
  }

  const ancho = margenX * 2 + maxX * espacioX + 60;
  const alto = margenY * 2 + maxDepth * espacioY + 60;

  return { nodos, ancho, alto };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Page() {
  const [funcion, setFuncion] = useState<Funcion>('factorial');
  const [nFactorial, setNFactorial] = useState(5);
  const [nFib, setNFib] = useState(5);
  const [useMemo_, setUseMemo] = useState(false);
  const [nHanoi, setNHanoi] = useState(3);
  const [aMcd, setAMcd] = useState(48);
  const [bMcd, setBMcd] = useState(18);
  const [nSuma, setNSuma] = useState(1234);
  const [arrayBusqueda, setArrayBusqueda] = useState('1, 3, 5, 7, 9, 11, 13, 15');
  const [objetivoBusqueda, setObjetivoBusqueda] = useState(7);

  const [simulacion, setSimulacion] = useState<SimulacionResultado | null>(null);
  const [simulacionAlt, setSimulacionAlt] = useState<SimulacionResultado | null>(null); // para comparativa
  const [pasoActual, setPasoActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [velocidad, setVelocidad] = useState(700);

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generarSimulacion = useCallback((): SimulacionResultado | null => {
    try {
      switch (funcion) {
        case 'factorial':
          if (nFactorial < 0 || nFactorial > 12) return null;
          return simularFactorial(nFactorial);
        case 'fibonacci':
          if (nFib < 0 || nFib > (useMemo_ ? 20 : 10)) return null;
          return simularFibonacci(nFib, useMemo_);
        case 'hanoi':
          if (nHanoi < 1 || nHanoi > 7) return null;
          return simularHanoi(nHanoi);
        case 'mcd':
          if (aMcd < 1 || bMcd < 0) return null;
          return simularMcd(aMcd, bMcd);
        case 'suma-digitos':
          if (nSuma < 0) return null;
          return simularSumaDigitos(nSuma);
        case 'busqueda-binaria': {
          const arr = arrayBusqueda
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n))
            .sort((a, b) => a - b);
          if (arr.length === 0) return null;
          return simularBusquedaBinaria(arr, objetivoBusqueda);
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }, [funcion, nFactorial, nFib, useMemo_, nHanoi, aMcd, bMcd, nSuma, arrayBusqueda, objetivoBusqueda]);

  const handleGenerar = useCallback(() => {
    const sim = generarSimulacion();
    setSimulacion(sim);
    setPasoActual(0);
    setReproduciendo(false);

    // Comparativa con/sin memo para Fibonacci
    if (funcion === 'fibonacci' && sim) {
      const alt = simularFibonacci(nFib, !useMemo_);
      setSimulacionAlt(alt);
    } else {
      setSimulacionAlt(null);
    }
  }, [generarSimulacion, funcion, nFib, useMemo_]);

  // Auto-generar al cambiar la función
  useEffect(() => {
    handleGenerar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funcion]);

  // Reproducción automática
  useEffect(() => {
    if (!reproduciendo || !simulacion) return;
    if (pasoActual >= simulacion.pasos.length - 1) {
      setReproduciendo(false);
      return;
    }
    intervalRef.current = setTimeout(() => {
      setPasoActual((p) => p + 1);
    }, velocidad);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [reproduciendo, pasoActual, simulacion, velocidad]);

  const handleIniciar = () => {
    if (!simulacion) return;
    if (pasoActual >= simulacion.pasos.length - 1) setPasoActual(0);
    setReproduciendo(true);
  };
  const handlePausar = () => setReproduciendo(false);
  const handlePaso = () => {
    if (!simulacion) return;
    setReproduciendo(false);
    if (pasoActual < simulacion.pasos.length - 1) setPasoActual((p) => p + 1);
  };
  const handleReiniciar = () => {
    setReproduciendo(false);
    setPasoActual(0);
  };

  const pasoActualObj = simulacion?.pasos[pasoActual] ?? null;
  const layout = useMemo(() => {
    if (!simulacion) return { nodos: [], ancho: 600, alto: 320 };
    return calcularLayoutArbol(simulacion.frames);
  }, [simulacion]);

  // Calcular estado de cada frame en el paso actual
  const estadoFrames = useMemo(() => {
    const estado = new Map<string, 'no-vista' | 'activa' | 'actual' | 'retornada' | 'caso-base'>();
    if (!simulacion || !pasoActualObj) return estado;

    // Recorrer todos los pasos hasta el actual para reconstruir estado
    const pilaActual = new Set(pasoActualObj.pilaIds);
    const frameActualId = pasoActualObj.frameId;

    // ¿qué frames han sido vistos en algún paso hasta ahora? (han entrado a la pila)
    const vistosHastaAhora = new Set<string>();
    const retornados = new Set<string>();
    const casoBase = new Set<string>();

    for (let i = 0; i <= pasoActual; i++) {
      const p = simulacion.pasos[i];
      if (p.evento === 'llamar' || p.evento === 'memo-hit') {
        vistosHastaAhora.add(p.frameId);
      }
      if (p.evento === 'retornar') {
        retornados.add(p.frameId);
      }
      if (p.evento === 'caso-base') {
        casoBase.add(p.frameId);
      }
    }

    for (const id of vistosHastaAhora) {
      if (id === frameActualId) {
        estado.set(id, 'actual');
      } else if (pilaActual.has(id)) {
        estado.set(id, 'activa');
      } else if (retornados.has(id)) {
        if (casoBase.has(id)) {
          estado.set(id, 'retornada');
        } else {
          estado.set(id, 'retornada');
        }
      } else {
        estado.set(id, 'no-vista');
      }
    }

    return estado;
  }, [simulacion, pasoActual, pasoActualObj]);

  const trazadoVisible = useMemo(() => {
    if (!simulacion) return [];
    return simulacion.pasos.slice(0, pasoActual + 1);
  }, [simulacion, pasoActual]);

  // Estado actual de torres Hanoi
  const torresActuales = useMemo(() => {
    if (funcion !== 'hanoi' || !simulacion || !pasoActualObj) return null;
    // buscar el último estadoTorres conocido hasta el paso actual
    for (let i = pasoActual; i >= 0; i--) {
      const e = simulacion.pasos[i].estadoTorres;
      if (e) return e;
    }
    return null;
  }, [funcion, simulacion, pasoActual, pasoActualObj]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Recursión</h1>
        <p className={styles.subtitle}>
          Pila de llamadas, árbol recursivo y memoization paso a paso
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de función */}
        <div className={styles.funcionSelector}>
          {FUNCIONES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.funcionBtn} ${
                funcion === f.id ? styles.funcionActive : ''
              }`}
              onClick={() => setFuncion(f.id)}
              aria-pressed={funcion === f.id}
            >
              <span className={styles.funcionNombre}>{f.nombre}</span>
              <span className={styles.funcionDesc}>{f.desc}</span>
            </button>
          ))}
        </div>

        {/* Inputs específicos por función */}
        <div className={styles.inputArea}>
          {funcion === 'factorial' && (
            <div className={styles.inputGroup}>
              <label htmlFor="n-fact">n (1-12)</label>
              <input
                id="n-fact"
                type="number"
                min={1}
                max={12}
                value={nFactorial}
                onChange={(e) => setNFactorial(Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1)))}
              />
            </div>
          )}

          {funcion === 'fibonacci' && (
            <div className={styles.inputGroup}>
              <label htmlFor="n-fib">n (1-{useMemo_ ? '20' : '10'})</label>
              <input
                id="n-fib"
                type="number"
                min={1}
                max={useMemo_ ? 20 : 10}
                value={nFib}
                onChange={(e) =>
                  setNFib(Math.max(1, Math.min(useMemo_ ? 20 : 10, parseInt(e.target.value, 10) || 1)))
                }
              />
            </div>
          )}

          {funcion === 'hanoi' && (
            <div className={styles.inputGroup}>
              <label htmlFor="n-hanoi">Discos (1-7)</label>
              <input
                id="n-hanoi"
                type="number"
                min={1}
                max={7}
                value={nHanoi}
                onChange={(e) => setNHanoi(Math.max(1, Math.min(7, parseInt(e.target.value, 10) || 1)))}
              />
            </div>
          )}

          {funcion === 'mcd' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="a-mcd">a</label>
                <input
                  id="a-mcd"
                  type="number"
                  min={1}
                  value={aMcd}
                  onChange={(e) => setAMcd(Math.max(1, parseInt(e.target.value, 10) || 1))}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="b-mcd">b</label>
                <input
                  id="b-mcd"
                  type="number"
                  min={0}
                  value={bMcd}
                  onChange={(e) => setBMcd(Math.max(0, parseInt(e.target.value, 10) || 0))}
                />
              </div>
            </>
          )}

          {funcion === 'suma-digitos' && (
            <div className={styles.inputGroup}>
              <label htmlFor="n-suma">Número entero positivo</label>
              <input
                id="n-suma"
                type="number"
                min={0}
                value={nSuma}
                onChange={(e) => setNSuma(Math.max(0, parseInt(e.target.value, 10) || 0))}
              />
            </div>
          )}

          {funcion === 'busqueda-binaria' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="arr-bin">Array (se ordenará)</label>
                <input
                  id="arr-bin"
                  type="text"
                  value={arrayBusqueda}
                  onChange={(e) => setArrayBusqueda(e.target.value)}
                  placeholder="1, 3, 5, 7, 9"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="obj-bin">Buscar</label>
                <input
                  id="obj-bin"
                  type="number"
                  value={objetivoBusqueda}
                  onChange={(e) => setObjetivoBusqueda(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </>
          )}
        </div>

        {/* Toggle memoization (solo Fibonacci) */}
        {funcion === 'fibonacci' && (
          <div className={styles.toggleControl}>
            <label htmlFor="memo">
              <input
                id="memo"
                type="checkbox"
                checked={useMemo_}
                onChange={(e) => setUseMemo(e.target.checked)}
              />
              Memoization activada (compara con vs sin)
            </label>
          </div>
        )}

        {/* Velocidad */}
        <div className={styles.velocidadControl}>
          <label htmlFor="vel">Velocidad:</label>
          <input
            id="vel"
            type="range"
            min={100}
            max={2000}
            step={50}
            value={velocidad}
            onChange={(e) => setVelocidad(parseInt(e.target.value, 10))}
          />
          <span className={styles.velocidadValue}>{formatNumber(velocidad, 0)} ms</span>
        </div>

        {/* Controles */}
        <div className={styles.controlBar}>
          <button type="button" className={styles.btnPrimary} onClick={handleGenerar}>
            Generar pasos
          </button>
          {!reproduciendo ? (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleIniciar}
              disabled={!simulacion}
            >
              ▶ Iniciar
            </button>
          ) : (
            <button type="button" className={styles.btnPrimary} onClick={handlePausar}>
              ⏸ Pausar
            </button>
          )}
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handlePaso}
            disabled={!simulacion || pasoActual >= (simulacion?.pasos.length ?? 0) - 1}
          >
            Paso siguiente →
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleReiniciar}
            disabled={!simulacion}
          >
            ⟲ Reiniciar
          </button>
        </div>

        {/* Aviso para Fibonacci sin memo con n alto */}
        {funcion === 'fibonacci' && !useMemo_ && nFib >= 8 && (
          <div className={styles.aviso}>
            <strong>⚠ Atención:</strong> Fibonacci sin memoization es exponencial. fib({nFib}) genera
            muchas llamadas redundantes. Activa memoization para ver la diferencia.
          </div>
        )}

        {/* Visualización Hanoi */}
        {funcion === 'hanoi' && torresActuales && (
          <div className={styles.hanoiContainer}>
            {torresActuales.map((torre, i) => (
              <div key={i} className={styles.hanoiTorre}>
                {torre.map((disco) => (
                  <div
                    key={`${i}-${disco}`}
                    className={styles.hanoiDisco}
                    style={{
                      width: `${30 + disco * 14}px`,
                      backgroundColor: PALETA_DISCOS[(disco - 1) % PALETA_DISCOS.length],
                    }}
                  >
                    {disco}
                  </div>
                ))}
                <div className={styles.hanoiTorreLabel}>{['A', 'B', 'C'][i]}</div>
              </div>
            ))}
          </div>
        )}

        {/* Layout dual: árbol + pila */}
        {simulacion && (
          <div className={styles.layoutDual}>
            <div className={styles.arbolPanel}>
              <h3 className={styles.panelTitle}>Árbol de llamadas</h3>
              <svg
                className={styles.arbolSvg}
                viewBox={`0 0 ${layout.ancho} ${layout.alto}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ minWidth: layout.ancho > 600 ? layout.ancho : 'auto' }}
              >
                {/* Aristas */}
                {Array.from(simulacion.frames.values()).map((frame) => {
                  if (!frame.parentId) return null;
                  const nodo = layout.nodos.find((n) => n.frameId === frame.id);
                  const padre = layout.nodos.find((n) => n.frameId === frame.parentId);
                  if (!nodo || !padre) return null;
                  return (
                    <line
                      key={`edge-${frame.id}`}
                      className={styles.arbolEdge}
                      x1={padre.x}
                      y1={padre.y + 15}
                      x2={nodo.x}
                      y2={nodo.y - 15}
                    />
                  );
                })}
                {/* Nodos */}
                {layout.nodos.map((nodo) => {
                  const frame = simulacion.frames.get(nodo.frameId);
                  if (!frame) return null;
                  const estado = estadoFrames.get(nodo.frameId) ?? 'no-vista';
                  if (estado === 'no-vista') return null;
                  let claseEstado = styles.nodoActiva;
                  if (estado === 'actual') claseEstado = styles.nodoActual;
                  else if (estado === 'retornada') claseEstado = styles.nodoRetornada;
                  return (
                    <g key={`nodo-${nodo.frameId}`}>
                      <rect
                        x={nodo.x - 32}
                        y={nodo.y - 14}
                        width={64}
                        height={28}
                        rx={6}
                        className={`${styles.nodoLlamada} ${claseEstado}`}
                      />
                      <text x={nodo.x} y={nodo.y + 1} className={styles.nodoLabel}>
                        {frame.funcion}({frame.args})
                      </text>
                      {estado === 'retornada' && frame.retorno !== undefined && (
                        <text
                          x={nodo.x}
                          y={nodo.y + 24}
                          className={styles.nodoLabelRetorno}
                        >
                          → {String(frame.retorno)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className={styles.pilaPanel}>
              <h3 className={styles.pilaTitle}>Pila de llamadas</h3>
              <p className={styles.pilaSubtitle}>El TOP es la llamada activa</p>
              <div className={styles.pilaContainer}>
                {pasoActualObj && pasoActualObj.pilaIds.length === 0 ? (
                  <div className={styles.pilaVacia}>(pila vacía)</div>
                ) : (
                  pasoActualObj?.pilaIds.map((id, idx) => {
                    const frame = simulacion.frames.get(id);
                    if (!frame) return null;
                    const esTop = idx === pasoActualObj.pilaIds.length - 1;
                    return (
                      <div
                        key={id}
                        className={`${styles.pilaFrame} ${esTop ? styles.pilaTop : ''}`}
                      >
                        <span className={styles.pilaArg}>
                          {frame.funcion}({frame.args})
                        </span>
                        <div className={styles.pilaVars}>
                          {Object.entries(frame.variablesLocales)
                            .map(([k, v]) => `${k}=${v}`)
                            .join(', ')}
                        </div>
                        {esTop && pasoActualObj.evento === 'caso-base' && (
                          <div className={styles.pilaRetorno}>caso base alcanzado</div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trazado paso a paso */}
        {simulacion && (
          <div>
            <h3 className={styles.panelTitle}>Trazado de ejecución</h3>
            <div className={styles.trazado}>
              {trazadoVisible.map((p, i) => {
                let claseEvento = '';
                if (p.evento === 'llamar') claseEvento = styles.trazadoLlamar;
                else if (p.evento === 'retornar') claseEvento = styles.trazadoRetornar;
                else if (p.evento === 'caso-base' || p.evento === 'memo-hit')
                  claseEvento = styles.trazadoCasoBase;
                const esActual = i === pasoActual;
                return (
                  <div
                    key={i}
                    className={`${styles.trazadoEntry} ${claseEvento} ${
                      esActual ? styles.trazadoActual : ''
                    }`}
                  >
                    {p.descripcion}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resultado */}
        {simulacion && pasoActual >= simulacion.pasos.length - 1 && (
          <div className={styles.resultadoBox}>
            <strong>Resultado final</strong>
            <div className={styles.resultadoValor}>{simulacion.resultado}</div>
          </div>
        )}

        {/* Métricas */}
        {simulacion && (
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Llamadas totales</span>
              <span className={styles.metricValue}>
                {formatNumber(simulacion.llamadasTotales, 0)}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Profundidad máx. de pila</span>
              <span className={styles.metricValue}>
                {formatNumber(simulacion.profundidadMaxima, 0)}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Pasos de animación</span>
              <span className={styles.metricValue}>
                {formatNumber(pasoActual + 1, 0)}
                <span className={styles.metricUnit}>
                  /{formatNumber(simulacion.pasos.length, 0)}
                </span>
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Memoria estimada</span>
              <span className={styles.metricValue}>
                {formatNumber(simulacion.profundidadMaxima * 64, 0)}
                <span className={styles.metricUnit}>bytes</span>
              </span>
            </div>
          </div>
        )}

        {/* Comparativa con/sin memoization */}
        {funcion === 'fibonacci' && simulacion && simulacionAlt && (
          <div className={styles.comparativaMemo}>
            <div className={styles.comparativaCol}>
              <h4>{useMemo_ ? 'Con memoization (actual)' : 'Sin memoization (actual)'}</h4>
              <p>
                Llamadas: <strong>{formatNumber(simulacion.llamadasTotales, 0)}</strong>
              </p>
              <p>
                Profundidad máx.: <strong>{formatNumber(simulacion.profundidadMaxima, 0)}</strong>
              </p>
              {useMemo_ && (
                <p>
                  Aciertos memo: <strong>{formatNumber(simulacion.llamadasFromMemo, 0)}</strong>
                </p>
              )}
            </div>
            <div className={styles.comparativaCol}>
              <h4>{useMemo_ ? 'Sin memoization' : 'Con memoization'}</h4>
              <p>
                Llamadas: <strong>{formatNumber(simulacionAlt.llamadasTotales, 0)}</strong>
              </p>
              <p>
                Profundidad máx.:{' '}
                <strong>{formatNumber(simulacionAlt.profundidadMaxima, 0)}</strong>
              </p>
              {!useMemo_ && (
                <p>
                  Aciertos memo: <strong>{formatNumber(simulacionAlt.llamadasFromMemo, 0)}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <EducationalSection
        title="Guía de Recursión"
        subtitle="Pila de llamadas, casos base y memoization"
      >
        <h3>Comparativa de Funciones Recursivas</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Función</th>
                <th>Caso base</th>
                <th>Paso recursivo</th>
                <th>Complejidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Factorial(n)</strong>
                </td>
                <td>n ≤ 1 → retorna 1</td>
                <td>n × factorial(n − 1)</td>
                <td>O(n) tiempo, O(n) pila</td>
              </tr>
              <tr>
                <td>
                  <strong>Fibonacci(n)</strong>
                </td>
                <td>n ≤ 1 → retorna n</td>
                <td>fib(n − 1) + fib(n − 2)</td>
                <td>O(2ⁿ) sin memo, O(n) con memo</td>
              </tr>
              <tr>
                <td>
                  <strong>Torres de Hanoi(n)</strong>
                </td>
                <td>n = 1 → mover 1 disco</td>
                <td>2 × hanoi(n − 1) + 1 mov.</td>
                <td>O(2ⁿ) movimientos, O(n) pila</td>
              </tr>
              <tr>
                <td>
                  <strong>MCD(a, b)</strong>
                </td>
                <td>b = 0 → retorna a</td>
                <td>mcd(b, a mod b)</td>
                <td>O(log min(a, b))</td>
              </tr>
              <tr>
                <td>
                  <strong>Suma de dígitos(n)</strong>
                </td>
                <td>n &lt; 10 → retorna n</td>
                <td>(n mod 10) + suma(n div 10)</td>
                <td>O(log₁₀ n)</td>
              </tr>
              <tr>
                <td>
                  <strong>Búsqueda binaria(arr, x)</strong>
                </td>
                <td>rango vacío → −1; medio = x → índice</td>
                <td>buscar en mitad correspondiente</td>
                <td>O(log n) tiempo y pila</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌳</span>
              <strong>Recorrer estructuras de árbol</strong>
            </div>
            <p className={styles.escenarioExample}>
              Sistemas de archivos, árboles DOM, JSON anidados o árboles de decisión: la recursión
              es natural porque la propia estructura es recursiva.
            </p>
            <div className={styles.escenarioTip}>
              Cada nodo tiene hijos del mismo tipo → función que se llama a sí misma por hijo.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
              <strong>Algoritmos divide y vencerás</strong>
            </div>
            <p className={styles.escenarioExample}>
              Mergesort, quicksort, búsqueda binaria, FFT: dividen el problema en mitades y
              combinan los resultados. Modelo recursivo limpio y eficiente.
            </p>
            <div className={styles.escenarioTip}>
              T(n) = 2·T(n/2) + O(n) → O(n log n) por el teorema maestro.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧩</span>
              <strong>Backtracking y combinatoria</strong>
            </div>
            <p className={styles.escenarioExample}>
              Sudoku, N reinas, generación de permutaciones, laberintos: prueba una opción,
              recurre, y si no funciona deshaz y prueba la siguiente.
            </p>
            <div className={styles.escenarioTip}>
              Patrón: probar → recurrir → deshacer (undo) si fracasa.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">💡</span>
              <strong>Programación dinámica</strong>
            </div>
            <p className={styles.escenarioExample}>
              Mochila, cambio de monedas, distancia de edición: empieza con recursión + memo (top
              down) y luego optimiza a iterativa (bottom up).
            </p>
            <div className={styles.escenarioTip}>
              Si la recursión repite subproblemas → memoization es la clave.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué es el caso base y por qué es obligatorio?</h4>
            <p>
              El caso base es la condición que detiene la recursión: cuando se cumple, la función
              retorna sin volver a llamarse. Sin caso base la función se llama infinitamente y
              acaba con un error de pila.
            </p>
            <p className={styles.faqTip}>
              Regla de oro: el caso base debe alcanzarse desde cualquier entrada válida.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Por qué Fibonacci recursivo &quot;ingenuo&quot; es exponencial?</h4>
            <p>
              Cada llamada hace 2 llamadas más (fib(n − 1) y fib(n − 2)), y muchas se repiten.
              fib(40) realiza más de 200 millones de llamadas. Con memoization caché esos resultados
              y bajas a O(n).
            </p>
            <p className={styles.faqTip}>
              Activa el toggle &quot;Memoization&quot; en el simulador y compara las cifras: la
              diferencia es brutal.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre recursión e iteración?</h4>
            <p>
              La iteración usa bucles (while/for) y no consume pila adicional. La recursión es más
              expresiva en problemas que se definen sobre sí mismos (árboles, divide y vencerás)
              pero gasta memoria de pila. Cualquier recursión se puede transformar a iteración con
              una pila explícita.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Cuándo conviene aplicar memoization?</h4>
            <p>
              Cuando hay <strong>subproblemas que se repiten</strong> con los mismos argumentos.
              Si cada llamada usa argumentos distintos (caso del factorial), la memoization no
              aporta nada. En Fibonacci, mochila, distancia de edición → muy útil.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Qué es un &quot;stack overflow&quot; en recursión?</h4>
            <p>
              Cada llamada ocupa un frame en la pila de ejecución. Si la profundidad supera el
              límite del runtime (~10 000-20 000 frames en JavaScript), el motor lanza
              &quot;Maximum call stack size exceeded&quot;. Causa típica: recursión sin caso base
              o entrada muy grande.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4>¿Existe optimización de tail calls en JavaScript?</h4>
            <p>
              La especificación ES2015 incluye Tail Call Optimization (TCO), pero en la práctica
              solo Safari la implementa. V8 (Chrome, Node) y Firefox no la activan. Por eso, en
              JavaScript es prudente convertir recursiones profundas a iteración.
            </p>
            <p className={styles.faqTip}>
              En Python pasa igual: no hay TCO. En Scheme o Haskell sí, y son recursivos por
              diseño.
            </p>
          </div>
        </div>

        <h3>Cómo Diseñar una Función Recursiva — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Identifica el caso base</strong>
              <p>
                ¿Cuál es la entrada más simple posible? ¿Qué resultado retorna sin necesidad de
                recurrir? Sin esto, la función no termina.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Define el paso recursivo</strong>
              <p>
                Asume que la función ya funciona para una entrada más pequeña. ¿Cómo combinas ese
                resultado con la entrada actual? Ese es el paso recursivo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Garantiza el avance hacia el caso base</strong>
              <p>
                Cada llamada debe acercarse al caso base (n disminuye, rango se reduce…). Si no,
                stack overflow garantizado.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Traza la ejecución mentalmente</strong>
              <p>
                Pinta el árbol de llamadas para una entrada pequeña. ¿Coincide con lo esperado? Si
                no, revisa caso base y paso recursivo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Optimiza si hay subproblemas repetidos</strong>
              <p>
                Si el árbol contiene nodos con los mismos argumentos, aplica memoization (cache).
                Mejora drásticamente la complejidad.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🛑</span>
            <strong>Define el caso base PRIMERO</strong>
            <p>
              Antes de pensar en el paso recursivo, escribe la condición de parada y su retorno.
              Evita stack overflow desde el primer día.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📉</span>
            <strong>Asegura el avance</strong>
            <p>
              Cada llamada debe trabajar con un argumento estrictamente más simple. Si pasas el
              mismo argumento, recursión infinita.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧠</span>
            <strong>Confía en la inducción</strong>
            <p>
              No intentes desarrollar mentalmente toda la pila. Asume que la llamada recursiva
              funciona correctamente para entradas más pequeñas y usa ese resultado.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💾</span>
            <strong>Memoiza cuando hay solapamiento</strong>
            <p>
              Si dibujas el árbol y ves los mismos argumentos en distintos nodos, cachea
              resultados. Pasas de exponencial a polinómico.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔁</span>
            <strong>Convierte a iterativo si la pila es profunda</strong>
            <p>
              Recursiones con miles de frames son arriesgadas en JavaScript. Una pila explícita
              + bucle while elimina el riesgo.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <strong>Calcula la complejidad</strong>
            <p>
              Antes de ejecutar, plantea la ecuación de recurrencia: T(n) = ... Aplica el teorema
              maestro o expansión de árbol para estimar el coste.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al programar recursión</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Olvidar el caso base:</strong> recursión infinita y &quot;Maximum call stack
              size exceeded&quot;.
            </li>
            <li>
              <strong>Caso base inalcanzable:</strong> existe en el código pero la entrada nunca lo
              activa (por ejemplo, restar mal el argumento).
            </li>
            <li>
              <strong>Modificar variables compartidas:</strong> usar variables globales mutables
              dentro de la recursión rompe la inducción y produce bugs difíciles de detectar.
            </li>
            <li>
              <strong>No memoizar Fibonacci o problemas similares:</strong> aceptas un coste
              exponencial cuando podrías tener O(n).
            </li>
            <li>
              <strong>Recursión sobre estructuras enormes:</strong> recorrer JSON profundamente
              anidado o árboles desbalanceados puede saturar la pila. Plantéate iterativo.
            </li>
            <li>
              <strong>Confundir el orden de retorno:</strong> en algunas funciones (ej. construir
              cadenas) el orden en que combinas el resultado del subproblema cambia el resultado
              final.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-recursion')} />
      <ShareCard appName="simulador-recursion" />
      <Footer appName="simulador-recursion" />
    </div>
  );
}
