'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { SortingAlgorithm, AlgorithmStep } from './types';
import { generateSteps } from './algorithms';
import { EstadoReproduccion, estadoInicial, aplicarPaso } from './replay';

/**
 * Anima varios algoritmos EN PARALELO sobre el mismo array, para responder de un
 * vistazo a "¿cuál llega antes y a costa de cuántas comparaciones?". Avanza un
 * índice común: cada algoritmo aplica su paso número i, y el que ya terminó se
 * queda quieto con su array ordenado.
 *
 * El estado de cada algoritmo se mantiene incremental (no se reproduce desde el
 * principio en cada tick): con arrays de 50 elementos, Bubble Sort pasa de los
 * 2.500 pasos y rehacerlos en cada frame para cada algoritmo se notaría.
 */
export interface ResultadoComparativa {
  estados: Record<string, EstadoReproduccion>;
  totales: Record<string, number>;
  progreso: number;
  maxPasos: number;
  enMarcha: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

export function useComparativa(
  array: number[],
  algoritmos: SortingAlgorithm[],
  velocidad: number,
  activa: boolean
): ResultadoComparativa {
  const [estados, setEstados] = useState<Record<string, EstadoReproduccion>>({});
  const [totales, setTotales] = useState<Record<string, number>>({});
  const [progreso, setProgreso] = useState(0);
  const [enMarcha, setEnMarcha] = useState(false);

  const pasosRef = useRef<Record<string, AlgorithmStep[]>>({});
  const estadosRef = useRef<Record<string, EstadoReproduccion>>({});
  const progresoRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enMarchaRef = useRef(false);
  const velocidadRef = useRef(velocidad);

  useEffect(() => { velocidadRef.current = velocidad; }, [velocidad]);
  useEffect(() => { enMarchaRef.current = enMarcha; }, [enMarcha]);

  const detener = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Precalcular los pasos de cada algoritmo cuando cambia el array o la selección
  useEffect(() => {
    if (!activa) return;
    detener();
    setEnMarcha(false);

    const pasos: Record<string, AlgorithmStep[]> = {};
    const inicial: Record<string, EstadoReproduccion> = {};
    const tot: Record<string, number> = {};
    for (const alg of algoritmos) {
      pasos[alg] = generateSteps(alg, array);
      inicial[alg] = estadoInicial(array);
      tot[alg] = pasos[alg].length;
    }
    pasosRef.current = pasos;
    estadosRef.current = inicial;
    progresoRef.current = 0;
    setEstados(inicial);
    setTotales(tot);
    setProgreso(0);
  }, [array, algoritmos, activa, detener]);

  const maxPasos = Math.max(0, ...Object.values(totales));

  const tick = useCallback(() => {
    if (!enMarchaRef.current) return;

    const i = progresoRef.current;
    const siguientes: Record<string, EstadoReproduccion> = {};
    let quedanPasos = false;

    for (const [alg, pasos] of Object.entries(pasosRef.current)) {
      const actual = estadosRef.current[alg];
      if (i < pasos.length) {
        siguientes[alg] = aplicarPaso(actual, pasos[i]);
        if (i + 1 < pasos.length) quedanPasos = true;
      } else {
        siguientes[alg] = actual;
      }
    }

    estadosRef.current = siguientes;
    progresoRef.current = i + 1;
    setEstados(siguientes);
    setProgreso(i + 1);

    if (quedanPasos) {
      timeoutRef.current = setTimeout(tick, Math.max(8, 1010 - velocidadRef.current * 10));
    } else {
      setEnMarcha(false);
    }
  }, []);

  useEffect(() => {
    if (enMarcha) tick();
    return detener;
  }, [enMarcha, tick, detener]);

  const play = useCallback(() => setEnMarcha(true), []);
  const pause = useCallback(() => { setEnMarcha(false); detener(); }, [detener]);

  const reset = useCallback(() => {
    detener();
    setEnMarcha(false);
    const inicial: Record<string, EstadoReproduccion> = {};
    for (const alg of Object.keys(pasosRef.current)) inicial[alg] = estadoInicial(array);
    estadosRef.current = inicial;
    progresoRef.current = 0;
    setEstados(inicial);
    setProgreso(0);
  }, [array, detener]);

  return { estados, totales, progreso, maxPasos, enMarcha, play, pause, reset };
}
