'use client';
// @disclaimer: exempt

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './VisualizadorMatematicasMusica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  VENTANA_ONDAS_S,
  ciclosEnVentana,
  cents,
  razonANumero,
  razonEsExacta,
  trazoSenoide,
} from './motor';

// ─────────────────────────────────────────────
// Web Audio API — generador de sonido
// ─────────────────────────────────────────────

type WaveType = 'sine' | 'triangle' | 'square' | 'sawtooth';

/**
 * Rampa de entrada y de salida de cada voz. Un cambio de ganancia en seco es un escalón en la
 * onda y se oye como un chasquido (hallazgo 1937): 20 ms bastan para que no se oiga y no se
 * perciben como retraso.
 */
const RAMPA_S = 0.02;
/** Antelación con que se programa lo que empieza «ya», para que el reloj de audio no lo pase. */
const ANTELACION_S = 0.01;

interface Voz {
  osc: OscillatorNode;
  gain: GainNode;
  /** Instante (reloj de audio) en que empieza a sonar. */
  inicio: number;
}

/** Programa una voz con rampa de entrada y caída exponencial hasta el silencio. */
function programarVoz(
  ctx: AudioContext,
  freq: number,
  wave: WaveType,
  volumen: number,
  inicio: number,
  duracion: number,
): Voz {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  const ataque = Math.min(RAMPA_S, duracion / 4);
  gain.gain.setValueAtTime(0, inicio);
  gain.gain.linearRampToValueAtTime(volumen, inicio + ataque);
  gain.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracion);
  return { osc, gain, inicio };
}

/**
 * Silencia las voces: la que ya suena baja en rampa desde su valor en curso y se para al final
 * de la rampa; la que estaba programada para más tarde no llega a empezar.
 */
function silenciarVoces(ctx: AudioContext, voces: Voz[]): void {
  const ahora = ctx.currentTime;
  voces.forEach(({ osc, gain, inicio }) => {
    try {
      if (inicio > ahora) {
        gain.gain.cancelScheduledValues(0);
        gain.gain.setValueAtTime(0, ahora);
        osc.stop(ahora);
        return;
      }
      const g = gain.gain;
      g.cancelScheduledValues(ahora);
      g.setValueAtTime(g.value, ahora);
      g.linearRampToValueAtTime(0, ahora + RAMPA_S);
      osc.stop(ahora + RAMPA_S);
    } catch {
      // La voz ya había terminado
    }
  });
}

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const activeRef = useRef<Voz[]>([]);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {
        // Sin gesto del usuario el navegador puede negarse; el siguiente clic lo reanuda
      });
    }
    return ctxRef.current;
  }, []);

  const stopAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== 'closed') silenciarVoces(ctx, activeRef.current);
    activeRef.current = [];
  }, []);

  /**
   * Limpieza al desmontar (hallazgos 1935 y 1936, la forma del 1757 de generador-ondas). Las
   * progresiones y los ritmos se programan enteros por adelantado en el reloj de audio: sin esta
   * limpieza, al salir con un <Link> seguían sonando en la app de destino (hasta 5,6 s el Canon
   * de Pachelbel) y cada visita dejaba su AudioContext abierto. Ahora se silencian todas las
   * voces con su rampa y el contexto se cierra al acabarla. El ref se suelta en el acto, para
   * que un remontaje (StrictMode en desarrollo) cree un contexto nuevo.
   */
  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      const voces = activeRef.current;
      ctxRef.current = null;
      activeRef.current = [];
      if (!ctx || ctx.state === 'closed') return;
      silenciarVoces(ctx, voces);
      window.setTimeout(() => {
        ctx.close().catch(() => {
          // El contexto ya estaba cerrado
        });
      }, RAMPA_S * 1000 + 50);
    };
  }, []);

  const playTone = useCallback((freq: number, duration = 0.6, wave: WaveType = 'sine', volume = 0.3) => {
    stopAll();
    const ctx = getCtx();
    const t0 = ctx.currentTime + ANTELACION_S;
    activeRef.current.push(programarVoz(ctx, freq, wave, volume, t0, duration));
  }, [getCtx, stopAll]);

  const playChord = useCallback((freqs: number[], duration = 1.2, wave: WaveType = 'sine') => {
    stopAll();
    const ctx = getCtx();
    const t0 = ctx.currentTime + ANTELACION_S;
    const vol = 0.2 / Math.max(freqs.length, 1);
    freqs.forEach(freq => {
      activeRef.current.push(programarVoz(ctx, freq, wave, vol, t0, duration));
    });
  }, [getCtx, stopAll]);

  const playInterval = useCallback((baseFreq: number, ratio: number, duration = 1.0) => {
    playChord([baseFreq, baseFreq * ratio], duration);
  }, [playChord]);

  const playProgression = useCallback((chords: number[][], tempo = 0.7) => {
    stopAll();
    const ctx = getCtx();
    // Un solo origen de tiempos: releer ctx.currentTime en cada vuelta hacía que los acordes
    // derivaran cuando el reloj echa a andar a mitad del bucle.
    const t0 = ctx.currentTime + ANTELACION_S;
    chords.forEach((freqs, idx) => {
      const vol = 0.15 / Math.max(freqs.length, 1);
      const t = t0 + idx * tempo;
      freqs.forEach(freq => {
        activeRef.current.push(programarVoz(ctx, freq, 'triangle', vol, t, tempo * 0.95));
      });
    });
  }, [getCtx, stopAll]);

  const playBeat = useCallback((bpm: number, beats = 8) => {
    stopAll();
    const ctx = getCtx();
    const interval = 60 / bpm;
    const t0 = ctx.currentTime + ANTELACION_S;
    for (let i = 0; i < beats; i++) {
      const isStrong = i % 4 === 0;
      const t = t0 + i * interval;
      activeRef.current.push(
        programarVoz(ctx, isStrong ? 880 : 660, 'sine', isStrong ? 0.4 : 0.2, t, 0.08),
      );
    }
  }, [getCtx, stopAll]);

  return { playTone, playChord, playInterval, playProgression, playBeat, stopAll };
}

function PlayButton({ onClick, label, small }: { onClick: () => void; label?: string; small?: boolean }) {
  return (
    <button
      type="button"
      className={`${styles.playBtn} ${small ? styles.playBtnSmall : ''}`}
      onClick={onClick}
      aria-label={label || 'Escuchar'}
      title={label || 'Escuchar'}
    >
      <span aria-hidden="true">▶</span>{!small && <span className={styles.playBtnText}> Escuchar</span>}
    </button>
  );
}

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'sonido' | 'escala' | 'acordes' | 'ritmo';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'sonido', titulo: 'Qué es el sonido', icono: '🔊', subtitulo: 'Ondas, frecuencia y amplitud' },
  { id: 'escala', titulo: 'La escala musical', icono: '🎹', subtitulo: '¿Por qué 12 notas?' },
  { id: 'acordes', titulo: 'Acordes y armonía', icono: '🎶', subtitulo: 'Mayor = alegre, menor = triste' },
  { id: 'ritmo', titulo: 'Ritmo y matemáticas', icono: '🥁', subtitulo: 'Compases, BPM y Fibonacci' },
];

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const NOTAS_FRECUENCIAS = [
  { nota: 'Do (C4)', freq: 261.63, ratio: '1:1', color: '#e74c3c' },
  { nota: 'Re (D4)', freq: 293.66, ratio: '9:8', color: '#e67e22' },
  { nota: 'Mi (E4)', freq: 329.63, ratio: '5:4', color: '#f1c40f' },
  { nota: 'Fa (F4)', freq: 349.23, ratio: '4:3', color: '#2ecc71' },
  { nota: 'Sol (G4)', freq: 392.00, ratio: '3:2', color: '#2E86AB' },
  { nota: 'La (A4)', freq: 440.00, ratio: '5:3', color: '#3498db' },
  { nota: 'Si (B4)', freq: 493.88, ratio: '15:8', color: '#9b59b6' },
  { nota: 'Do (C5)', freq: 523.25, ratio: '2:1', color: '#e74c3c' },
];

interface Intervalo {
  nombre: string;
  ratio: string;
  ratioDecimal: number;
  consonancia: 'perfecta' | 'alta' | 'media' | 'baja';
  ejemplo: string;
}

const INTERVALOS: Intervalo[] = [
  { nombre: 'Unísono', ratio: '1:1', ratioDecimal: 1, consonancia: 'perfecta', ejemplo: 'Misma nota' },
  { nombre: 'Octava', ratio: '2:1', ratioDecimal: 2, consonancia: 'perfecta', ejemplo: 'Do-Do alto' },
  { nombre: 'Quinta justa', ratio: '3:2', ratioDecimal: 1.5, consonancia: 'perfecta', ejemplo: 'Do-Sol' },
  { nombre: 'Cuarta justa', ratio: '4:3', ratioDecimal: 4 / 3, consonancia: 'perfecta', ejemplo: 'Do-Fa' },
  { nombre: 'Tercera mayor', ratio: '5:4', ratioDecimal: 1.25, consonancia: 'alta', ejemplo: 'Do-Mi' },
  { nombre: 'Tercera menor', ratio: '6:5', ratioDecimal: 1.2, consonancia: 'alta', ejemplo: 'Do-Mi♭' },
  { nombre: 'Sexta mayor', ratio: '5:3', ratioDecimal: 5 / 3, consonancia: 'alta', ejemplo: 'Do-La' },
  { nombre: 'Segunda mayor', ratio: '9:8', ratioDecimal: 1.125, consonancia: 'media', ejemplo: 'Do-Re' },
  { nombre: 'Tritono', ratio: '45:32', ratioDecimal: 45 / 32, consonancia: 'baja', ejemplo: 'Do-Fa♯' },
];

interface AcordeInfo {
  nombre: string;
  tipo: 'mayor' | 'menor';
  notas: string;
  ratios: string;
  emocion: string;
  ejemplos: string[];
  frecuencias: number[];
}

const ACORDES: AcordeInfo[] = [
  { nombre: 'Do Mayor', tipo: 'mayor', notas: 'Do - Mi - Sol', ratios: '4:5:6', emocion: 'Alegre, brillante, estable', ejemplos: ['Let It Be (Beatles)', 'Imagine (Lennon)'], frecuencias: [261.63, 329.63, 392.00] },
  { nombre: 'La menor', tipo: 'menor', notas: 'La - Do - Mi', ratios: '10:12:15', emocion: 'Triste, melancólico, introspectivo', ejemplos: ['Stairway to Heaven (Led Zeppelin)', 'Losing My Religion (R.E.M.)'], frecuencias: [220.00, 261.63, 329.63] },
  { nombre: 'Sol Mayor', tipo: 'mayor', notas: 'Sol - Si - Re', ratios: '4:5:6', emocion: 'Optimista, enérgico', ejemplos: ['Sweet Home Alabama', 'Knockin\' on Heaven\'s Door'], frecuencias: [392.00, 493.88, 587.33] },
  { nombre: 'Mi menor', tipo: 'menor', notas: 'Mi - Sol - Si', ratios: '10:12:15', emocion: 'Oscuro, emotivo, profundo', ejemplos: ['Nothing Else Matters (Metallica)', 'Zombie (The Cranberries)'], frecuencias: [329.63, 392.00, 493.88] },
];

interface Progresion {
  nombre: string;
  grados: string;
  acordes: string;
  canciones: string[];
}

// Frecuencias de acordes para reproducir progresiones
const ACORDE_FREQS: Record<string, number[]> = {
  'Do': [261.63, 329.63, 392.00],     // C major
  'Re': [293.66, 369.99, 440.00],     // D major
  'Mim': [329.63, 392.00, 493.88],    // E minor
  'Mi': [329.63, 415.30, 493.88],     // E major
  'Fa': [349.23, 440.00, 523.25],     // F major
  'Sol': [392.00, 493.88, 587.33],    // G major
  'Lam': [220.00, 261.63, 329.63],    // A minor
  'La': [220.00, 277.18, 329.63],     // A major (not used but available)
};

function getProgFreqs(acordesStr: string): number[][] {
  return acordesStr.split(' - ').map(name => ACORDE_FREQS[name.trim()] || [261.63, 329.63, 392.00]);
}

const PROGRESIONES: Progresion[] = [
  { nombre: 'La más popular del pop', grados: 'I - V - vi - IV', acordes: 'Do - Sol - Lam - Fa', canciones: ['No Woman No Cry', 'Let It Be', 'Someone Like You', 'Despacito'] },
  { nombre: 'Blues clásico', grados: 'I - IV - V', acordes: 'Do - Fa - Sol', canciones: ['Johnny B. Goode', 'Hound Dog', 'Rock Around the Clock'] },
  { nombre: 'Andaluza / Flamenca', grados: 'iv - III - II - I', acordes: 'Lam - Sol - Fa - Mi', canciones: ['Hit the Road Jack', 'Malagueña', 'Flamenco tradicional'] },
  { nombre: 'Canon de Pachelbel', grados: 'I - V - vi - iii - IV - I - IV - V', acordes: 'Do - Sol - Lam - Mim - Fa - Do - Fa - Sol', canciones: ['Canon en Re', 'Basket Case (Green Day)', 'Cryin\' (Aerosmith)'] },
];

interface CompasInfo {
  compas: string;
  nombre: string;
  patron: number[];
  genero: string;
  ejemplo: string;
}

const COMPASES: CompasInfo[] = [
  { compas: '4/4', nombre: 'Cuaternario', patron: [1, 0, 1, 0], genero: 'Pop, rock, electrónica', ejemplo: 'La inmensa mayoría de canciones' },
  { compas: '3/4', nombre: 'Ternario (vals)', patron: [1, 0, 0], genero: 'Vals, minueto', ejemplo: 'El Danubio Azul (Strauss)' },
  { compas: '6/8', nombre: 'Compuesto', patron: [1, 0, 0, 1, 0, 0], genero: 'Baladas, jigs', ejemplo: 'Nothing Else Matters (Metallica)' },
  { compas: '5/4', nombre: 'Irregular', patron: [1, 0, 0, 1, 0], genero: 'Jazz, progresivo', ejemplo: 'Take Five (Dave Brubeck Quartet), agrupado 3 + 2' },
  { compas: '7/8', nombre: 'Asimétrico', patron: [1, 0, 1, 0, 1, 0, 0], genero: 'Folclore balcánico, progresivo', ejemplo: 'Rachenitsa (danza búlgara), agrupado 2 + 2 + 3' },
];

interface BpmGenero {
  genero: string;
  min: number;
  max: number;
  color: string;
}

const BPM_GENEROS: BpmGenero[] = [
  { genero: 'Ambient', min: 60, max: 80, color: '#9b59b6' },
  { genero: 'Clásica', min: 60, max: 120, color: '#2E86AB' },
  { genero: 'Hip-hop', min: 80, max: 115, color: '#e67e22' },
  { genero: 'Reggaetón', min: 90, max: 100, color: '#e74c3c' },
  { genero: 'Pop', min: 100, max: 130, color: '#48A9A6' },
  { genero: 'Rock', min: 110, max: 140, color: '#2ecc71' },
  { genero: 'Techno', min: 120, max: 150, color: '#f1c40f' },
  { genero: 'Drum & Bass', min: 160, max: 180, color: '#e74c3c' },
];

/** Marcas de la escala de BPM. */
const MARCAS_BPM = [60, 90, 120, 150, 180];

interface FibonacciMusica {
  compositor: string;
  obra: string;
  detalle: string;
  dato: string;
}

const FIBONACCI_MUSICA: FibonacciMusica[] = [
  { compositor: 'Béla Bartók', obra: 'Música para cuerdas, percusión y celesta', detalle: 'Ernő Lendvai propuso que el clímax del primer movimiento, hacia el compás 55, lo divide en proporción áurea. La partitura tiene 88 compases; la cuenta de 89 (un número de Fibonacci) añade un compás de silencio final, y analistas como Roy Howat discuten el recuento. Es una interpretación analítica, no una intención documentada.', dato: 'Clímax ≈ compás 55 de 88 · 55/88 ≈ 0,625 (1/φ ≈ 0,618)' },
  { compositor: 'Claude Debussy', obra: 'La Mer', detalle: 'Roy Howat propuso (Debussy in Proportion, 1983) que las secciones principales caen cerca de puntos de proporción áurea. Es una lectura analítica: no hay constancia de que Debussy la buscara.', dato: 'Análisis de Howat (1983) · φ ≈ 1,618' },
  { compositor: 'Tool', obra: 'Lateralus', detalle: 'Las sílabas de los primeros versos siguen la secuencia de Fibonacci: 1, 1, 2, 3, 5, 8, 5, 3, 2, 1, 1. El estribillo encadena compases de 9/8, 8/8 y 7/8 (987 es un número de Fibonacci). La banda lo ha comentado: aquí sí es intencionado.', dato: 'Sílabas: 1,1,2,3,5,8,5,3,2,1,1' },
  { compositor: 'Mozart', obra: 'Sonatas para piano', detalle: 'Se ha propuesto que la división entre la exposición y el desarrollo con la reexposición se acerca a φ. John Putz midió las sonatas (Mathematics Magazine, 1995) y concluyó que no hay indicios de que Mozart buscara esa proporción.', dato: 'Hipótesis discutida (Putz, 1995)' },
];

/** Do4 temperado: la nota de referencia de la octava y de los intervalos. */
const FRECUENCIA_DO4 = NOTAS_FRECUENCIAS[0].freq;
/** La barra más alta de la octava (Do5) ocupa toda la pista. */
const FRECUENCIA_MAXIMA_OCTAVA = Math.max(...NOTAS_FRECUENCIAS.map((n) => n.freq));
/** Lienzo de las ondas (unidades del viewBox; el SVG se estira al ancho disponible). */
const ANCHO_ONDA = 240;
const ALTO_ONDA = 40;

// ─────────────────────────────────────────────
// Sección 1: Qué es el sonido
// ─────────────────────────────────────────────

function SeccionSonido({ audio }: { audio: ReturnType<typeof useAudio> }) {
  const propiedades = [
    { icono: '〰️', titulo: 'Frecuencia (Hz)', desc: 'Cuántas veces vibra por segundo. Más frecuencia = sonido más agudo.', ejemplo: 'La4 = 440 Hz (440 vibraciones/segundo)', color: '#2E86AB' },
    { icono: '📶', titulo: 'Amplitud', desc: 'Cuánto se desplaza la onda. Mayor amplitud = más volumen.', ejemplo: 'Un susurro ≈ 30 dB, un concierto ≈ 110 dB', color: '#48A9A6' },
    { icono: '🎻', titulo: 'Forma de onda (timbre)', desc: 'La "forma" de la vibración. Es lo que distingue un piano de una guitarra tocando la misma nota.', ejemplo: 'Misma nota, diferente instrumento = diferente timbre', color: '#e67e22' },
  ];

  // Las tres ondas se dibujan en la MISMA ventana de tiempo (hallazgo 1940): los ciclos que
  // caben son f·T, así que guardan la proporción de las frecuencias, 110 : 440 : 880 = 1 : 4 : 8.
  const ondas = [
    { nombre: 'Grave (110 Hz)', freq: 110 },
    { nombre: 'Media (440 Hz)', freq: 440 },
    { nombre: 'Aguda (880 Hz)', freq: 880 },
  ];
  const ventanaMs = VENTANA_ONDAS_S * 1000;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sonido es una <strong>vibración del aire</strong>. Cuando pulsas una cuerda de guitarra, vibra y empuja las moléculas de aire como una ola. Tu oído detecta esas ondas y tu cerebro las interpreta como sonido.</p>
      </div>

      {/* Propiedades del sonido */}
      <div className={styles.propiedadesGrid}>
        {propiedades.map((p, i) => (
          <div key={i} className={styles.propiedadCard} style={{ borderLeftColor: p.color }}>
            <div className={styles.propiedadHeader}>
              <span className={styles.propiedadIcono} aria-hidden="true">{p.icono}</span>
              <h3 className={styles.propiedadTitulo}>{p.titulo}</h3>
            </div>
            <p className={styles.propiedadDesc}>{p.desc}</p>
            <span className={styles.propiedadEjemplo}>{p.ejemplo}</span>
          </div>
        ))}
      </div>

      {/* Visualización de ondas */}
      <div className={styles.ondasCard}>
        <h3 className={styles.ondasTitulo}>Ondas sonoras: la frecuencia cambia el tono</h3>
        <p className={styles.ondasSubtitulo}>
          Más ciclos por segundo = sonido más agudo. Las tres ondas ocupan el mismo tiempo:{' '}
          {formatNumber(ventanaMs, 1)} milisegundos.
        </p>
        <div className={styles.ondasGrid}>
          {ondas.map((o, i) => {
            const ciclos = ciclosEnVentana(o.freq);
            return (
              <div key={i} className={styles.ondaRow}>
                <span className={styles.ondaLabel}>{o.nombre}</span>
                <svg
                  className={styles.ondaVisual}
                  viewBox={`0 0 ${ANCHO_ONDA} ${ALTO_ONDA}`}
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`${formatNumber(ciclos, 0)} ciclos en ${formatNumber(ventanaMs, 1)} milisegundos`}
                  data-ciclos={Math.round(ciclos * 1e6) / 1e6}
                >
                  <line x1="0" y1={ALTO_ONDA / 2} x2={ANCHO_ONDA} y2={ALTO_ONDA / 2} className={styles.ondaEje} />
                  <path
                    d={trazoSenoide(ciclos, ANCHO_ONDA, ALTO_ONDA)}
                    className={styles.ondaTrazo}
                    style={{ stroke: `hsl(${200 - i * 30}, 70%, 45%)` }}
                  />
                </svg>
                <span className={styles.ondaFreq}>{formatNumber(o.freq, 0)} Hz</span>
                <PlayButton onClick={() => audio.playTone(o.freq, 0.8)} label={`Escuchar ${o.nombre}`} small />
              </div>
            );
          })}
        </div>
      </div>

      {/* Rango auditivo humano */}
      <div className={styles.rangoCard}>
        <h3 className={styles.rangoTitulo}>Rango auditivo humano</h3>
        <div className={styles.rangoBar}>
          <div className={styles.rangoInfra}>
            <span className={styles.rangoLabel}>Infrasonido</span>
            <span className={styles.rangoFreq}>&lt; 20 Hz</span>
          </div>
          <div className={styles.rangoAudible}>
            <span className={styles.rangoLabel}>Audible</span>
            <span className={styles.rangoFreq}>20 - 20.000 Hz</span>
          </div>
          <div className={styles.rangoUltra}>
            <span className={styles.rangoLabel}>Ultrasonido</span>
            <span className={styles.rangoFreq}>&gt; 20.000 Hz</span>
          </div>
        </div>
        <div className={styles.rangoNotas}>
          <span>Piano: 27,5 Hz (La0) → 4186 Hz (Do8)</span>
          <span>Voz humana (fundamental): 80 - 1100 Hz</span>
        </div>
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoNumero}>440</span>
        <span className={styles.datoUnidad}>Hz</span>
        <span className={styles.datoTexto}>La nota La4 (A4): la referencia de afinación más extendida. Se acordó en una conferencia internacional en Londres en 1939 y la ISO la adoptó en 1955 (hoy, norma ISO 16:1975). No es universal: muchas orquestas afinan a 442-443 Hz y la música barroca se interpreta a menudo a 415 Hz.</span>
        <PlayButton onClick={() => audio.playTone(440, 1.0)} label="Escuchar La4 a 440 Hz" />
      </div>

      <div className={styles.insight}>
        <p>
          La música es, en esencia, <strong>matemáticas que puedes oír</strong>. Cada nota es una frecuencia, cada acorde es una relación entre frecuencias, y cada ritmo es una división del tiempo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: La escala musical
// ─────────────────────────────────────────────

function SeccionEscala({ audio }: { audio: ReturnType<typeof useAudio> }) {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Hace unos 2500 años, según la tradición griega, <strong>Pitágoras</strong> y su escuela observaron que las notas que suenan bien juntas guardan razones de números enteros pequeños. Esa idea sigue en la base de la teoría musical occidental.</p>
      </div>

      {/* Ratios pitagóricos */}
      <div className={styles.ratiosCard}>
        <h3 className={styles.ratiosTitulo}>Los intervalos y sus razones</h3>
        <p className={styles.ratiosSubtitulo}>
          En la tradición occidental, cuanto más simple es la razón entre frecuencias, más consonante se considera el
          intervalo. Pitágoras trabajó con razones de 2 y 3 (octava, quinta, cuarta, 9:8); las terceras y sextas de 5:4, 6:5
          y 5:3 son de la afinación justa posterior (Ptolomeo, Zarlino). Suenan sobre Do4 con la razón exacta.
        </p>
        <div className={styles.ratiosGrid}>
          {INTERVALOS.map((intv, i) => (
            <div key={i} className={styles.intervaloRow}>
              <div className={styles.intervaloInfo}>
                <span className={styles.intervaloNombre}>{intv.nombre}</span>
                <span className={styles.intervaloEjemplo}>{intv.ejemplo}</span>
              </div>
              <span className={styles.intervaloRatio}>{intv.ratio}</span>
              <div className={styles.intervaloBarContainer}>
                <div
                  className={styles.intervaloBar}
                  style={{
                    width: `${Math.min(100, (intv.ratioDecimal / 2) * 100)}%`,
                    background: intv.consonancia === 'perfecta' ? '#2E86AB'
                      : intv.consonancia === 'alta' ? '#48A9A6'
                      : intv.consonancia === 'media' ? '#e67e22'
                      : '#e74c3c',
                  }}
                />
              </div>
              <span className={`${styles.consonanciaTag} ${styles[`consonancia_${intv.consonancia}`]}`}>
                {intv.consonancia === 'perfecta' ? 'Consonancia perfecta' :
                 intv.consonancia === 'alta' ? 'Consonancia imperfecta' :
                 intv.consonancia === 'media' ? 'Disonancia suave' : 'Disonancia'}
              </span>
              <PlayButton onClick={() => audio.playInterval(261.63, intv.ratioDecimal)} label={`Escuchar ${intv.nombre}`} small />
            </div>
          ))}
        </div>
      </div>

      {/* Por qué 12 notas */}
      <div className={styles.doceNotasCard}>
        <h3 className={styles.doceNotasTitulo}>¿Por qué exactamente 12 notas?</h3>
        <div className={styles.doceNotasExplicacion}>
          <div className={styles.doceNotasPaso}>
            <span className={styles.pasoNumero}>1</span>
            <div>
              <strong>El problema de Pitágoras</strong>
              <p>Si apilamos quintas justas (3:2) desde Do, al dar 12 pasos volvemos &ldquo;casi&rdquo; a Do, siete octavas más arriba, pero no exactamente: (3/2)¹² ÷ 2⁷ ≈ 1,0136. Esa diferencia, unos 23,5 cents (casi un cuarto de semitono), se llama <em>coma pitagórica</em>.</p>
            </div>
          </div>
          <div className={styles.doceNotasPaso}>
            <span className={styles.pasoNumero}>2</span>
            <div>
              <strong>La solución: temperamento igual</strong>
              <p>La solución que acabó imponiéndose, sobre todo a partir del siglo XIX, fue dividir la octava en 12 partes iguales. Cada semitono es exactamente ¹²√2 ≈ 1,0595. Los intervalos ya no son &ldquo;puros&rdquo;, pero todas las tonalidades suenan igual de afinadas.</p>
            </div>
          </div>
          <div className={styles.doceNotasPaso}>
            <span className={styles.pasoNumero}>3</span>
            <div>
              <strong>12 es el &ldquo;mejor compromiso&rdquo;</strong>
              <p>12 divisiones logran que las quintas (1,4983 vs 1,5 puro) y las terceras (1,2599 vs 1,25 puro) estén cerca de las razones justas: la quinta, casi exacta; la tercera, más alejada. Otros números (19, 31, 53) aproximan mejor algunos intervalos, pero 12 es el más práctico.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notas y frecuencias */}
      <div className={styles.notasFreqCard}>
        <h3 className={styles.notasFreqTitulo}>La octava central: frecuencias de cada nota</h3>
        <p className={styles.notasFreqSubtitulo}>
          Alto de cada barra proporcional a su frecuencia. Debajo, la razón justa con Do4: el
          temperamento igual solo la da exacta en la octava; en las demás notas es una aproximación (≈).
        </p>
        <div className={styles.notasBarras}>
          {NOTAS_FRECUENCIAS.map((n, i) => {
            const exacta = razonEsExacta(n.ratio, n.freq, FRECUENCIA_DO4);
            const desvio = cents(n.freq, FRECUENCIA_DO4) - cents(razonANumero(n.ratio));
            return (
              <div key={i} className={styles.notaBarra}>
                <div className={styles.notaBarraPista}>
                  <div
                    className={styles.notaBarraFill}
                    style={{
                      height: `${(n.freq / FRECUENCIA_MAXIMA_OCTAVA) * 100}%`,
                      background: n.color,
                    }}
                  />
                </div>
                <span className={styles.notaBarraNombre}>{n.nota}</span>
                <span className={styles.notaBarraFreq}>{formatNumber(n.freq, 0)} Hz</span>
                <span
                  className={styles.notaBarraRatio}
                  title={exacta ? 'Razón exacta' : `La nota temperada se aparta ${formatNumber(Math.abs(desvio), 1)} cents de la razón justa`}
                >
                  {exacta ? n.ratio : `≈ ${n.ratio}`}
                </span>
                <PlayButton onClick={() => audio.playTone(n.freq, 0.6)} label={`Escuchar ${n.nota}`} small />
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La escala de 12 notas no es arbitraria: es un <strong>compromiso práctico</strong> para acercarse a las razones simples que la tradición occidental considera consonantes. Pitágoras las midió con una cuerda; el análisis de Fourier ayuda a explicarlas, porque en esas razones coinciden muchos armónicos de las dos notas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Acordes y armonía
// ─────────────────────────────────────────────

function SeccionAcordes({ audio }: { audio: ReturnType<typeof useAudio> }) {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un acorde es varias notas sonando a la vez. ¿Por qué un acorde <strong>mayor</strong> suena alegre y uno <strong>menor</strong> suena triste? La respuesta está en los ratios entre sus frecuencias.</p>
      </div>

      {/* Acordes mayor vs menor */}
      <div className={styles.acordesGrid}>
        {ACORDES.map((ac, i) => (
          <div key={i} className={`${styles.acordeCard} ${ac.tipo === 'mayor' ? styles.acordeMayor : styles.acordeMenor}`}>
            <div className={styles.acordeHeader}>
              <h3 className={styles.acordeNombre}>{ac.nombre}</h3>
              <span className={`${styles.acordeTipo} ${ac.tipo === 'mayor' ? styles.tipoMayor : styles.tipoMenor}`}>
                <span aria-hidden="true">{ac.tipo === 'mayor' ? '😊' : '😢'}</span>{' '}
                {ac.tipo === 'mayor' ? 'Mayor' : 'Menor'}
              </span>
            </div>
            <div className={styles.acordeNotas}>{ac.notas}</div>
            <div className={styles.acordeRatioVisual}>
              <span className={styles.acordeRatioLabel}>Ratio: {ac.ratios}</span>
              <div className={styles.acordeBarras}>
                {ac.frecuencias.map((f, j) => (
                  <div
                    key={j}
                    className={styles.acordeBarraItem}
                    style={{
                      height: `${(f / 600) * 100}%`,
                      background: ac.tipo === 'mayor' ? '#2E86AB' : '#9b59b6',
                      opacity: 0.6 + j * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
            <PlayButton onClick={() => audio.playChord(ac.frecuencias, 1.5)} label={`Escuchar ${ac.nombre}`} />
            <p className={styles.acordeEmocion}>{ac.emocion}</p>
            <div className={styles.acordeEjemplos}>
              {ac.ejemplos.map((ej, j) => (
                <span key={j} className={styles.acordeEjemplo}><span aria-hidden="true">♪</span> {ej}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Por qué mayor = alegre */}
      <div className={styles.explicacionCard}>
        <h3 className={styles.explicacionTitulo}>¿Por qué mayor = alegre y menor = triste?</h3>
        <div className={styles.explicacionGrid}>
          <div className={styles.explicacionItem}>
            <span className={styles.explicacionIcono} aria-hidden="true">📐</span>
            <strong>Razones más simples = más consonante</strong>
            <p>En afinación justa, el acorde mayor (4:5:6) tiene razones más simples que el menor (10:12:15): las ondas coinciden antes y el sonido resulta más &ldquo;limpio&rdquo;.</p>
          </div>
          <div className={styles.explicacionItem}>
            <span className={styles.explicacionIcono} aria-hidden="true">🧠</span>
            <strong>Una hipótesis: patrones más regulares</strong>
            <p>Algunas teorías proponen que las razones simples dan patrones de vibración más regulares, que se oyen como estables, y que las complejas se oyen como tensión. Es una propuesta, no una explicación cerrada.</p>
          </div>
          <div className={styles.explicacionItem}>
            <span className={styles.explicacionIcono} aria-hidden="true">🌍</span>
            <strong>¿Universal o cultural?</strong>
            <p>Un estudio con los tsimane&apos;, de la Amazonía boliviana y con poco contacto con la música occidental, no halló preferencia por los acordes consonantes frente a los disonantes (McDermott y otros, <em>Nature</em>, 2016). La preferencia por la consonancia, y la asociación mayor-alegre, menor-triste, dependen en buena parte de la cultura musical de cada oyente.</p>
          </div>
        </div>
      </div>

      {/* Progresiones de acordes */}
      <div className={styles.progresionesCard}>
        <h3 className={styles.progresionesTitulo}>Las progresiones que dominan la música pop</h3>
        <p className={styles.progresionesSubtitulo}>Con solo 4 acordes puedes tocar cientos de canciones</p>
        {PROGRESIONES.map((prog, i) => (
          <div key={i} className={styles.progresionItem}>
            <div className={styles.progresionHeader}>
              <span className={styles.progresionNombre}>{prog.nombre}</span>
              <span className={styles.progresionGrados}>{prog.grados}</span>
            </div>
            <div className={styles.progresionAcordes}>{prog.acordes}</div>
            <div className={styles.progresionCanciones}>
              {prog.canciones.map((c, j) => (
                <span key={j} className={styles.progresionCancion}><span aria-hidden="true">♪</span> {c}</span>
              ))}
            </div>
            <PlayButton onClick={() => audio.playProgression(getProgFreqs(prog.acordes))} label={`Escuchar ${prog.nombre}`} />
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La progresión <strong>I-V-vi-IV</strong> aparece en cientos de éxitos: combina tres acordes mayores con uno menor, y sus grados son números que valen en cualquier tonalidad. En Do es Do - Sol - Lam - Fa; en Sol, Sol - Re - Mim - Do.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Ritmo y matemáticas
// ─────────────────────────────────────────────

function SeccionRitmo({ audio }: { audio: ReturnType<typeof useAudio> }) {
  const maxBpm = 190;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El ritmo es la <strong>matemática del tiempo</strong>: cómo dividimos los segundos en pulsos, acentos y silencios. Cada género musical tiene su &ldquo;velocidad&rdquo; y su forma de dividir el compás.</p>
      </div>

      {/* Compases */}
      <div className={styles.compasesCard}>
        <h3 className={styles.compasesTitulo}>Compases: cómo se divide el tiempo</h3>
        <p className={styles.compasesSubtitulo}>El numerador indica cuántas figuras caben en cada compás; el denominador, qué figura es (4 = negra, 8 = corchea)</p>
        <div className={styles.compasesGrid}>
          {COMPASES.map((c, i) => (
            <div key={i} className={styles.compasItem}>
              <span className={styles.compasNumero}>{c.compas}</span>
              <span className={styles.compasNombre}>{c.nombre}</span>
              <div className={styles.compasPatron}>
                {c.patron.map((p, j) => (
                  <div
                    key={j}
                    className={`${styles.compassPulso} ${p === 1 ? styles.pulsoFuerte : styles.pulsoDebil}`}
                  />
                ))}
              </div>
              <span className={styles.compasGenero}>{c.genero}</span>
              <span className={styles.compasEjemplo}>{c.ejemplo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BPM por género */}
      <div className={styles.bpmCard}>
        <h3 className={styles.bpmTitulo}>BPM por género musical</h3>
        <p className={styles.bpmSubtitulo}>Pulsaciones por minuto: rangos orientativos de la velocidad de cada estilo</p>
        <div className={styles.bpmGrid}>
          {BPM_GENEROS.map((g, i) => (
            <div key={i} className={styles.bpmRow}>
              <span className={styles.bpmGenero}>{g.genero}</span>
              <div className={styles.bpmBarContainer}>
                <div
                  className={styles.bpmBar}
                  style={{
                    left: `${(g.min / maxBpm) * 100}%`,
                    width: `${((g.max - g.min) / maxBpm) * 100}%`,
                    background: g.color,
                  }}
                />
              </div>
              <span className={styles.bpmRango}>{g.min}-{g.max}</span>
              <PlayButton onClick={() => audio.playBeat(Math.round((g.min + g.max) / 2))} label={`Escuchar ritmo ${g.genero}`} small />
            </div>
          ))}
          {/* La escala vive en la MISMA columna que las pistas y cada marca se coloca a bpm/190,
              igual que las barras (hallazgo 1941). */}
          <div className={`${styles.bpmRow} ${styles.bpmReglaFila}`} aria-hidden="true">
            <div />
            <div className={styles.bpmEscala}>
              {MARCAS_BPM.map((bpm) => (
                <span key={bpm} style={{ left: `${(bpm / maxBpm) * 100}%` }}>{bpm}</span>
              ))}
            </div>
            <div />
            <div />
          </div>
        </div>
      </div>

      {/* Polirritmias */}
      <div className={styles.polirritmiaCard}>
        <h3 className={styles.polirritmiaTitulo}>Polirritmias: cuando los ritmos se superponen</h3>
        <p className={styles.polirritmiaSubtitulo}>Dos patrones rítmicos diferentes sonando a la vez</p>
        <div className={styles.polirritmiaVisual}>
          <div className={styles.polirritmiaRow}>
            <span className={styles.polirritmiaLabel}>3 pulsos</span>
            <div className={styles.polirritmiaGrid12}>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className={`${styles.polirritmiaCelda} ${i % 4 === 0 ? styles.pulsoPoli3 : ''}`} />
              ))}
            </div>
          </div>
          <div className={styles.polirritmiaRow}>
            <span className={styles.polirritmiaLabel}>4 pulsos</span>
            <div className={styles.polirritmiaGrid12}>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className={`${styles.polirritmiaCelda} ${i % 3 === 0 ? styles.pulsoPoli4 : ''}`} />
              ))}
            </div>
          </div>
          <span className={styles.polirritmiaEjemplo}>3 contra 4 — usada en jazz, afrocubano y música de África Occidental</span>
        </div>
      </div>

      {/* Fibonacci en la música */}
      <div className={styles.fibonacciCard}>
        <h3 className={styles.fibonacciTitulo}>La proporción áurea en la música</h3>
        <p className={styles.fibonacciSubtitulo}>Análisis que buscan Fibonacci y φ (≈ 1,618) en la estructura de algunas obras: unas veces es intención del autor; otras, una lectura discutida</p>
        <div className={styles.fibonacciGrid}>
          {FIBONACCI_MUSICA.map((f, i) => (
            <div key={i} className={styles.fibonacciItem}>
              <div className={styles.fibonacciHeader}>
                <strong className={styles.fibonacciCompositor}>{f.compositor}</strong>
                <em className={styles.fibonacciObra}>{f.obra}</em>
              </div>
              <p className={styles.fibonacciDetalle}>{f.detalle}</p>
              <span className={styles.fibonacciDato}>{f.dato}</span>
            </div>
          ))}
        </div>
        <div className={styles.fibonacciSecuencia}>
          <span className={styles.fibonacciSecLabel}>Secuencia de Fibonacci:</span>
          <div className={styles.fibonacciNumeros}>
            {[1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89].map((n, i) => (
              <span key={i} className={styles.fibonacciNum}>{n}</span>
            ))}
            <span className={styles.fibonacciEllipsis}>...</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El ritmo es la dimensión temporal de las matemáticas musicales. Desde el compás 4/4 más sencillo hasta las polirritmias africanas, todo se reduce a <strong>dividir el tiempo en fracciones</strong> — y nuestro cerebro adora los patrones.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMatematicasMusicaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('sonido');
  const audio = useAudio();

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'sonido': return <SeccionSonido audio={audio} />;
      case 'escala': return <SeccionEscala audio={audio} />;
      case 'acordes': return <SeccionAcordes audio={audio} />;
      case 'ritmo': return <SeccionRitmo audio={audio} />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Los Números de la Música</h1>
          <p className={styles.subtitle}>Frecuencias, ratios, acordes y ritmo — toda la música es matemáticas</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        {/* Al cambiar de sección se anuncia solo el título (hallazgo 1944): antes la región viva
            envolvía la sección entera y el lector la leía de un tirón. */}
        <div className={styles.seccionHeader} aria-live="polite" aria-atomic="true">
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre matemáticas y música"
          subtitle="Curiosidades y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿Por qué la música nos emociona?</h3>
          <p>
            La música activa regiones del cerebro ligadas a la emoción y la recompensa. Estudios de neuroimagen
            (Salimpoor y otros, 2011) midieron liberación de <strong>dopamina</strong> en los momentos de más
            emoción de piezas elegidas por los propios oyentes. La consonancia es solo una parte: cuentan
            también las expectativas, el recuerdo y la cultura musical de quien escucha.
          </p>

          <h3>¿Todas las culturas usan 12 notas?</h3>
          <p>
            No. La música árabe divide la octava en 24 cuartos de tono. La música india usa 22 <em>shrutis</em>.
            La música indonesia (gamelan) utiliza escalas de 5 y 7 notas con afinaciones únicas. Sin embargo,
            la octava (2:1) y la quinta (3:2) aparecen en muchas tradiciones musicales del mundo, aunque no en
            todas se perciben igual: se discute cuánto hay de base acústica y cuánto de aprendizaje.
          </p>

          <h3>¿Es cierto que Mozart te hace más inteligente?</h3>
          <p>
            El &ldquo;efecto Mozart&rdquo; (Rauscher y otros, 1993) midió una mejora pequeña y pasajera en una
            tarea espacial tras escuchar una sonata, y los medios lo exageraron. Si <strong>estudiar música</strong>
            mejora las matemáticas o el lenguaje sigue discutido: los metaanálisis de Sala y Gobet (2017 y 2020)
            hallan una transferencia pequeña que desaparece en los estudios mejor diseñados. Aprender música
            tiene valor por sí mismo, sin necesidad de ese argumento.
          </p>

          <h3>¿Qué es el temperamento igual?</h3>
          <p>
            Es el sistema de afinación que usamos hoy: la octava se divide en 12 semitonos exactamente iguales,
            cada uno multiplicando la frecuencia por ¹²√2 ≈ 1,0595. Suele relacionarse con <em>El clave bien
            temperado</em> de Bach (1722), pero &ldquo;bien temperado&rdquo; no es lo mismo que &ldquo;igual&rdquo;:
            la obra pide un temperamento que permita tocar en las 24 tonalidades, y cuál usaba Bach sigue
            discutido. El temperamento igual no se generalizó en los instrumentos de teclado hasta el siglo XIX.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de acústica, teoría musical y psicoacústica
            con fines divulgativos. La percepción musical depende de muchos factores adicionales: contexto cultural,
            experiencia del oyente, timbre instrumental, reverberación del espacio, y las complejas interacciones
            entre armónicos parciales.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-matematicas-musica')} />
        <ShareCard appName="visualizador-matematicas-musica" />
        <Footer appName="visualizador-matematicas-musica" />
    </div>
  );
}
