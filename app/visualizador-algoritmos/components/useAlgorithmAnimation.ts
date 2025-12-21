'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimationState, AlgorithmStep, AlgorithmMetrics, ArrayBar, SortingAlgorithm } from './types';
import { generateSteps } from './algorithms';

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

export function useAlgorithmAnimation({
  initialArray,
  algorithm,
  speed: initialSpeed,
}: UseAlgorithmAnimationOptions): UseAlgorithmAnimationReturn {
  // Estado de la animación
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
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

  // Refs para valores que necesitan ser actuales en callbacks
  const stepsRef = useRef<AlgorithmStep[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationStateRef = useRef<AnimationState>('idle');
  const currentStepRef = useRef(0);
  const speedRef = useRef(initialSpeed);
  const barsRef = useRef<ArrayBar[]>([]);

  // Sincronizar refs
  useEffect(() => {
    animationStateRef.current = animationState;
  }, [animationState]);

  useEffect(() => {
    currentStepRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    barsRef.current = bars;
  }, [bars]);

  // Generar pasos cuando cambia el array o algoritmo
  useEffect(() => {
    stepsRef.current = generateSteps(algorithm, initialArray);
    reset();
  }, [initialArray, algorithm]);

  // Calcular delay basado en velocidad (1 = lento ~1000ms, 100 = rápido ~10ms)
  const getDelay = useCallback(() => {
    return Math.max(10, 1010 - speedRef.current * 10);
  }, []);

  // Ejecutar un paso
  const executeStep = useCallback((stepIndex: number): boolean => {
    if (stepIndex >= stepsRef.current.length) {
      setAnimationState('finished');
      return false;
    }

    const step = stepsRef.current[stepIndex];
    const newBars = [...barsRef.current];

    // Resetear estados visuales (excepto sorted)
    newBars.forEach((bar) => {
      if (bar.state !== 'sorted') {
        bar.state = 'normal';
      }
    });

    // Actualizar métricas
    setMetrics((prev) => {
      const newMetrics = { ...prev };
      if (step.type === 'compare') {
        newMetrics.comparisons++;
        newMetrics.arrayAccesses += 2;
      } else if (step.type === 'swap') {
        newMetrics.swaps++;
        newMetrics.arrayAccesses += 4;
      } else if (step.type === 'set') {
        newMetrics.arrayAccesses += 1;
      }
      newMetrics.elapsedTime = Date.now() - startTimeRef.current;
      return newMetrics;
    });

    // Aplicar el paso
    switch (step.type) {
      case 'compare':
        step.indices.forEach((idx) => {
          if (newBars[idx]) newBars[idx].state = 'comparing';
        });
        break;

      case 'swap':
        step.indices.forEach((idx) => {
          if (newBars[idx]) newBars[idx].state = 'swapping';
        });
        // Intercambiar valores
        if (step.indices.length === 2) {
          const [i, j] = step.indices;
          const temp = newBars[i].value;
          newBars[i].value = newBars[j].value;
          newBars[j].value = temp;
        }
        break;

      case 'set':
        if (step.values && step.indices.length > 0) {
          step.indices.forEach((idx, i) => {
            if (newBars[idx] && step.values && step.values[i] !== undefined) {
              newBars[idx].value = step.values[i];
              newBars[idx].state = 'swapping';
            }
          });
        }
        break;

      case 'pivot':
        step.indices.forEach((idx) => {
          if (newBars[idx]) newBars[idx].state = 'pivot';
        });
        break;

      case 'sorted':
        step.indices.forEach((idx) => {
          if (newBars[idx]) newBars[idx].state = 'sorted';
        });
        break;

      case 'merge-split':
      case 'merge-combine':
        // Marcar rango para visualización
        step.indices.forEach((idx) => {
          if (newBars[idx]) newBars[idx].state = 'comparing';
        });
        break;
    }

    setBars(newBars);
    setCurrentLine(step.line);
    setCurrentDescription(step.description);
    setCurrentStepIndex(stepIndex + 1);

    return true;
  }, []);

  // Loop de animación
  const runAnimation = useCallback(() => {
    if (animationStateRef.current !== 'running') return;

    const hasMore = executeStep(currentStepRef.current);

    if (hasMore && animationStateRef.current === 'running') {
      timeoutRef.current = setTimeout(runAnimation, getDelay());
    }
  }, [executeStep, getDelay]);

  // Iniciar animación
  const play = useCallback(() => {
    if (animationState === 'finished') {
      reset();
      setTimeout(() => {
        startTimeRef.current = Date.now();
        setAnimationState('running');
      }, 50);
    } else {
      if (animationState === 'idle') {
        startTimeRef.current = Date.now();
      }
      setAnimationState('running');
    }
  }, [animationState]);

  // Pausar animación
  const pause = useCallback(() => {
    setAnimationState('paused');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Avanzar un paso
  const step = useCallback(() => {
    if (animationState === 'running') {
      pause();
    }
    if (animationState === 'finished') return;

    if (animationState === 'idle') {
      startTimeRef.current = Date.now();
      setAnimationState('paused');
    }

    executeStep(currentStepRef.current);
  }, [animationState, pause, executeStep]);

  // Resetear
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setAnimationState('idle');
    setCurrentStepIndex(0);
    setBars(initialArray.map((value) => ({ value, state: 'normal' })));
    setCurrentLine(-1);
    setCurrentDescription('');
    setMetrics({
      comparisons: 0,
      swaps: 0,
      arrayAccesses: 0,
      elapsedTime: 0,
    });
    startTimeRef.current = 0;
  }, [initialArray]);

  // Cambiar velocidad
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(1, Math.min(100, newSpeed)));
  }, []);

  // Efecto para iniciar/detener animación cuando cambia el estado
  useEffect(() => {
    if (animationState === 'running') {
      runAnimation();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [animationState, runAnimation]);

  return {
    animationState,
    currentStep: currentStepIndex,
    totalSteps: stepsRef.current.length,
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
