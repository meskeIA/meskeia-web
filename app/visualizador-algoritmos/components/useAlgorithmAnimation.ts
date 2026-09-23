'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimationState, AlgorithmStep, AlgorithmMetrics, ArrayBar, SortingAlgorithm } from './types';
import { generateSteps } from './algorithms';
import { EstadoReproduccion, estadoInicial, aplicarPaso } from './replay';

interface UseAlgorithmAnimationOptions {
  initialArray: number[];
  algorithm: SortingAlgorithm;
  speed: number; // 1-100
}

interface UseAlgorithmAnimationReturn {
  // Estado
  animationState: AnimationState;
  currentStep: number;
  totalSteps: number;
  bars: ArrayBar[];
  currentLine: number;
  currentDescription: string;
  metrics: AlgorithmMetrics;

  // Acciones
  play: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

/** Accesos al array que cuesta cada tipo de paso (leer dos claves, intercambiar, escribir). */
function accesosDe(paso: AlgorithmStep): number {
  if (paso.type === 'compare') return 2;
  if (paso.type === 'swap') return 4;
  if (paso.type === 'set') return paso.indices.length;
  return 0;
}

/**
 * Animación del modo individual.
 *
 * El estado que avanza (barras, contadores e índice del paso) vive en refs que se actualizan
 * de forma SÍNCRONA dentro de `executeStep`, y cada paso se aplica con `aplicarPaso`, que no
 * muta: devuelve barras nuevas. Antes los refs se copiaban del estado de React en efectos, y a
 * 10 ms por paso el temporizador llegaba antes que el efecto: el mismo paso se ejecutaba dos
 * veces, y como mutaba los objetos barra compartidos, un intercambio duplicado se deshacía y
 * el array acababa desordenado pintado de verde (hallazgo 1291).
 *
 * Los contadores son los MISMOS que los de la comparativa (`replay.ts`): comparaciones y
 * movimientos (intercambios + escrituras). El panel publicaba solo los «swap», así que
 * Insertion, Merge y Counting salían siempre con 0 (hallazgo 1294).
 */
export function useAlgorithmAnimation({
  initialArray,
  algorithm,
  speed: initialSpeed,
}: UseAlgorithmAnimationOptions): UseAlgorithmAnimationReturn {
  // Estado de la animación
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [bars, setBars] = useState<ArrayBar[]>(() =>
    initialArray.map((value) => ({ value, state: 'normal' }))
  );
  const [currentLine, setCurrentLine] = useState(-1);
  const [currentDescription, setCurrentDescription] = useState('');
  const [speed, setSpeedState] = useState(initialSpeed);
  const [metrics, setMetrics] = useState<AlgorithmMetrics>({
    comparisons: 0,
    swaps: 0,
    arrayAccesses: 0,
    elapsedTime: 0,
  });

  // Estado vivo de la reproducción: se lee y se escribe en el mismo instante
  const stepsRef = useRef<AlgorithmStep[]>([]);
  const estadoRef = useRef<EstadoReproduccion>(estadoInicial(initialArray));
  const indiceRef = useRef(0);
  const accesosRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationStateRef = useRef<AnimationState>('idle');
  const speedRef = useRef(initialSpeed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const cambiarEstado = useCallback((nuevo: AnimationState) => {
    animationStateRef.current = nuevo;
    setAnimationState(nuevo);
  }, []);

  const detenerTemporizador = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Resetear
  const reset = useCallback(() => {
    detenerTemporizador();
    estadoRef.current = estadoInicial(initialArray);
    indiceRef.current = 0;
    accesosRef.current = 0;
    startTimeRef.current = 0;

    cambiarEstado('idle');
    setCurrentStepIndex(0);
    setBars(estadoRef.current.bars);
    setCurrentLine(-1);
    setCurrentDescription('');
    setMetrics({
      comparisons: 0,
      swaps: 0,
      arrayAccesses: 0,
      elapsedTime: 0,
    });
  }, [initialArray, detenerTemporizador, cambiarEstado]);

  // Generar pasos cuando cambia el array o algoritmo
  useEffect(() => {
    stepsRef.current = generateSteps(algorithm, initialArray);
    setTotalSteps(stepsRef.current.length);
    reset();
  }, [initialArray, algorithm, reset]);

  // Calcular delay basado en velocidad (1 = lento ~1000ms, 100 = rápido ~10ms)
  const getDelay = useCallback(() => {
    return Math.max(10, 1010 - speedRef.current * 10);
  }, []);

  // Ejecutar el paso siguiente. Devuelve true si quedan más.
  const executeStep = useCallback((): boolean => {
    const pasos = stepsRef.current;
    const i = indiceRef.current;
    if (i >= pasos.length) {
      cambiarEstado('finished');
      return false;
    }

    const paso = pasos[i];
    const nuevo = aplicarPaso(estadoRef.current, paso);
    estadoRef.current = nuevo;
    indiceRef.current = i + 1;
    accesosRef.current += accesosDe(paso);

    setBars(nuevo.bars);
    setMetrics({
      comparisons: nuevo.comparaciones,
      swaps: nuevo.movimientos,
      arrayAccesses: accesosRef.current,
      elapsedTime: Date.now() - startTimeRef.current,
    });
    setCurrentLine(paso.line);
    setCurrentDescription(paso.description);
    setCurrentStepIndex(i + 1);

    if (i + 1 >= pasos.length) {
      cambiarEstado('finished');
      return false;
    }
    return true;
  }, [cambiarEstado]);

  // Loop de animación
  const runAnimation = useCallback(() => {
    timeoutRef.current = null;
    if (animationStateRef.current !== 'running') return;

    const hasMore = executeStep();

    if (hasMore && animationStateRef.current === 'running') {
      timeoutRef.current = setTimeout(runAnimation, getDelay());
    }
  }, [executeStep, getDelay]);

  // Iniciar animación (al terminar, «Reiniciar» vuelve a empezar desde el principio)
  const play = useCallback(() => {
    if (animationStateRef.current === 'running') return;
    if (animationStateRef.current === 'finished') reset();
    if (animationStateRef.current === 'idle') startTimeRef.current = Date.now();
    cambiarEstado('running');
    detenerTemporizador();
    runAnimation();
  }, [reset, cambiarEstado, detenerTemporizador, runAnimation]);

  // Pausar animación
  const pause = useCallback(() => {
    detenerTemporizador();
    cambiarEstado('paused');
  }, [detenerTemporizador, cambiarEstado]);

  // Avanzar un paso
  const step = useCallback(() => {
    if (animationStateRef.current === 'finished') return;
    detenerTemporizador();
    if (animationStateRef.current === 'idle') startTimeRef.current = Date.now();
    cambiarEstado('paused');
    executeStep();
  }, [detenerTemporizador, cambiarEstado, executeStep]);

  // Cambiar velocidad
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(1, Math.min(100, newSpeed)));
  }, []);

  // Al desmontar no puede quedar un temporizador vivo
  useEffect(() => detenerTemporizador, [detenerTemporizador]);

  return {
    animationState,
    currentStep: currentStepIndex,
    totalSteps,
    bars,
    currentLine,
    currentDescription,
    metrics,
    play,
    pause,
    step,
    reset,
    setSpeed,
  };
}
