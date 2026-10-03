'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { frecuenciaMidi, gradoDeNota, secuenciaEscala, segundosPorNota, type Recorrido } from './sonido';

/**
 * Hace sonar la escala con Web Audio (S0177). Las notas y su orden los decide `sonido.ts`;
 * aquí solo se programan osciladores en el reloj de audio y se avisa a la vista de qué
 * grado suena en cada momento para resaltar su ficha.
 *
 * El contexto de audio se crea en el primer clic, no al montar: los navegadores lo dejan
 * suspendido si nace sin gesto del usuario (y Safari en iOS no suena en absoluto).
 */

const VOLUMEN = 0.22;
const ATAQUE_S = 0.012;
const SOLTAR_S = 0.06;
/** Fracción de la nota que suena: el resto es silencio, para que se oiga cada una por separado. */
const LEGATO = 0.88;
/** Un pequeño margen antes de la primera nota, para que no se coma el ataque. */
const MARGEN_INICIO_S = 0.06;
/** Una nota suelta (al pulsar su ficha) dura lo mismo que a tempo lento. */
const DURACION_NOTA_SUELTA_S = 0.9;

type ConstructorAudio = typeof AudioContext;

interface Voz {
  osc: OscillatorNode;
  gain: GainNode;
}

export function useSonidoEscala() {
  const ctxRef = useRef<AudioContext | null>(null);
  const vocesRef = useRef<Voz[]>([]);
  const temporizadoresRef = useRef<number[]>([]);
  const [gradoSonando, setGradoSonando] = useState<number | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [sinAudio, setSinAudio] = useState(false);

  const obtenerContexto = useCallback(async (): Promise<AudioContext | null> => {
    if (!ctxRef.current) {
      const Constructor: ConstructorAudio | undefined =
        window.AudioContext ?? (window as typeof window & { webkitAudioContext?: ConstructorAudio }).webkitAudioContext;
      if (!Constructor) {
        setSinAudio(true);
        return null;
      }
      ctxRef.current = new Constructor();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Sin permiso para reanudar: se programa igual y sonará cuando el navegador lo deje
      }
    }
    return ctx;
  }, []);

  /** Calla lo que suene con una rampa corta (sin chasquido) y anula lo programado. */
  const detener = useCallback(() => {
    temporizadoresRef.current.forEach(t => window.clearTimeout(t));
    temporizadoresRef.current = [];
    const ctx = ctxRef.current;
    if (ctx) {
      const ahora = ctx.currentTime;
      for (const { osc, gain } of vocesRef.current) {
        gain.gain.cancelScheduledValues(ahora);
        gain.gain.setValueAtTime(gain.gain.value, ahora);
        gain.gain.linearRampToValueAtTime(0, ahora + 0.02);
        try {
          osc.stop(ahora + 0.03);
        } catch {
          // Ya estaba detenido
        }
      }
    }
    vocesRef.current = [];
    setGradoSonando(null);
    setReproduciendo(false);
  }, []);

  /** Programa una nota con envolvente de ataque y soltado, en el reloj de audio. */
  const programarNota = useCallback((ctx: AudioContext, midi: number, inicio: number, duracion: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frecuenciaMidi(midi), inicio);

    const fin = inicio + duracion * LEGATO;
    gain.gain.setValueAtTime(0, inicio);
    gain.gain.linearRampToValueAtTime(VOLUMEN, inicio + ATAQUE_S);
    gain.gain.setValueAtTime(VOLUMEN, Math.max(inicio + ATAQUE_S, fin - SOLTAR_S));
    gain.gain.linearRampToValueAtTime(0, fin);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(inicio);
    osc.stop(fin + 0.01);

    const voz = { osc, gain };
    vocesRef.current.push(voz);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      vocesRef.current = vocesRef.current.filter(v => v !== voz);
    };
  }, []);

  const tocarEscala = useCallback(async (
    notaRaiz: number,
    intervalos: readonly number[],
    recorrido: Recorrido,
    notasPorMinuto: number,
  ) => {
    detener();
    const ctx = await obtenerContexto();
    if (!ctx) return;

    const secuencia = secuenciaEscala(notaRaiz, intervalos, recorrido);
    const duracion = segundosPorNota(notasPorMinuto);
    const t0 = ctx.currentTime + MARGEN_INICIO_S;

    secuencia.forEach((midi, i) => {
      programarNota(ctx, midi, t0 + i * duracion, duracion);
      const grado = gradoDeNota(midi, notaRaiz, intervalos);
      temporizadoresRef.current.push(
        window.setTimeout(() => setGradoSonando(grado), (MARGEN_INICIO_S + i * duracion) * 1000),
      );
    });
    temporizadoresRef.current.push(
      window.setTimeout(() => {
        setGradoSonando(null);
        setReproduciendo(false);
      }, (MARGEN_INICIO_S + secuencia.length * duracion) * 1000),
    );
    setReproduciendo(true);
  }, [detener, obtenerContexto, programarNota]);

  /** Una sola nota, al pulsar su ficha. Corta la escala si estaba sonando. */
  const tocarNota = useCallback(async (midi: number, grado: number) => {
    detener();
    const ctx = await obtenerContexto();
    if (!ctx) return;
    programarNota(ctx, midi, ctx.currentTime + 0.01, DURACION_NOTA_SUELTA_S);
    setGradoSonando(grado);
    temporizadoresRef.current.push(
      window.setTimeout(() => setGradoSonando(null), DURACION_NOTA_SUELTA_S * 1000),
    );
  }, [detener, obtenerContexto, programarNota]);

  // Al salir de la página: silencio y contexto cerrado
  useEffect(() => () => {
    temporizadoresRef.current.forEach(t => window.clearTimeout(t));
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, []);

  return { tocarEscala, tocarNota, detener, gradoSonando, reproduciendo, sinAudio };
}
