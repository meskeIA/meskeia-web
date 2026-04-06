'use client';

import { useState, useRef, useCallback } from 'react';
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
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Web Audio API — generador de sonido
// ─────────────────────────────────────────────

type WaveType = 'sine' | 'triangle' | 'square' | 'sawtooth';

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const activeRef = useRef<OscillatorNode[]>([]);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const stopAll = useCallback(() => {
    activeRef.current.forEach(osc => {
      try { osc.stop(); } catch { /* ya parado */ }
    });
    activeRef.current = [];
  }, []);

  const playTone = useCallback((freq: number, duration = 0.6, wave: WaveType = 'sine', volume = 0.3) => {
    stopAll();
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    activeRef.current.push(osc);
  }, [getCtx, stopAll]);

  const playChord = useCallback((freqs: number[], duration = 1.2, wave: WaveType = 'sine') => {
    stopAll();
    const ctx = getCtx();
    const vol = 0.2 / Math.max(freqs.length, 1);
    freqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      activeRef.current.push(osc);
    });
  }, [getCtx, stopAll]);

  const playInterval = useCallback((baseFreq: number, ratio: number, duration = 1.0) => {
    playChord([baseFreq, baseFreq * ratio], duration);
  }, [playChord]);

  const playProgression = useCallback((chords: number[][], tempo = 0.7) => {
    stopAll();
    const ctx = getCtx();
    chords.forEach((freqs, idx) => {
      const vol = 0.15 / Math.max(freqs.length, 1);
      const t = ctx.currentTime + idx * tempo;
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + tempo * 0.95);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + tempo);
        activeRef.current.push(osc);
      });
    });
  }, [getCtx, stopAll]);

  const playBeat = useCallback((bpm: number, beats = 8) => {
    stopAll();
    const ctx = getCtx();
    const interval = 60 / bpm;
    for (let i = 0; i < beats; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const isStrong = i % 4 === 0;
      osc.type = 'sine';
      osc.frequency.value = isStrong ? 880 : 660;
      const t = ctx.currentTime + i * interval;
      gain.gain.setValueAtTime(isStrong ? 0.4 : 0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
      activeRef.current.push(osc);
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
  { nombre: 'Cuarta justa', ratio: '4:3', ratioDecimal: 1.333, consonancia: 'perfecta', ejemplo: 'Do-Fa' },
  { nombre: 'Tercera mayor', ratio: '5:4', ratioDecimal: 1.25, consonancia: 'alta', ejemplo: 'Do-Mi' },
  { nombre: 'Tercera menor', ratio: '6:5', ratioDecimal: 1.2, consonancia: 'alta', ejemplo: 'Do-Mi♭' },
  { nombre: 'Sexta mayor', ratio: '5:3', ratioDecimal: 1.667, consonancia: 'media', ejemplo: 'Do-La' },
  { nombre: 'Segunda mayor', ratio: '9:8', ratioDecimal: 1.125, consonancia: 'media', ejemplo: 'Do-Re' },
  { nombre: 'Tritono', ratio: '45:32', ratioDecimal: 1.406, consonancia: 'baja', ejemplo: 'Do-Fa♯' },
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
  { nombre: 'Mi menor', tipo: 'menor', notas: 'Mi - Sol - Si', ratios: '10:12:15', emocion: 'Oscuro, emotivo, profundo', ejemplos: ['Nothing Else Matters (Metallica)', 'The House of the Rising Sun'], frecuencias: [329.63, 392.00, 493.88] },
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
  { compas: '5/4', nombre: 'Irregular', patron: [1, 0, 1, 0, 0], genero: 'Jazz, progresivo', ejemplo: 'Take Five (Dave Brubeck)' },
  { compas: '7/8', nombre: 'Asimétrico', patron: [1, 0, 1, 0, 1, 0, 0], genero: 'Progresivo, balcánico', ejemplo: 'Money (Pink Floyd)' },
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

interface FibonacciMusica {
  compositor: string;
  obra: string;
  detalle: string;
  dato: string;
}

const FIBONACCI_MUSICA: FibonacciMusica[] = [
  { compositor: 'Béla Bartók', obra: 'Música para cuerdas, percusión y celesta', detalle: 'El primer movimiento tiene 89 compases (F11). El clímax está en el compás 55 (F10). La proporción áurea divide la pieza exactamente.', dato: '89 = F₁₁, clímax en 55 = F₁₀' },
  { compositor: 'Claude Debussy', obra: 'La Mer', detalle: 'La estructura de los tres movimientos sigue proporciones áureas. Las secciones principales caen en puntos de proporción dorada.', dato: 'Estructuras en ratio φ ≈ 1,618' },
  { compositor: 'Tool', obra: 'Lateralus', detalle: 'Las sílabas del verso siguen la secuencia de Fibonacci: 1, 1, 2, 3, 5, 8, 5, 3, 2, 1, 1. El compás alterna entre 9/8, 8/8 y 7/8.', dato: 'Sílabas: 1,1,2,3,5,8,5,3,2,1,1' },
  { compositor: 'Mozart', obra: 'Sonatas para piano', detalle: 'Múltiples sonatas dividen la exposición y el desarrollo en proporciones que se acercan notablemente a φ (proporción áurea).', dato: 'Exposición/desarrollo ≈ φ' },
];

// ─────────────────────────────────────────────
// Sección 1: Qué es el sonido
// ─────────────────────────────────────────────

function SeccionSonido({ audio }: { audio: ReturnType<typeof useAudio> }) {
  const propiedades = [
    { icono: '〰️', titulo: 'Frecuencia (Hz)', desc: 'Cuántas veces vibra por segundo. Más frecuencia = sonido más agudo.', ejemplo: 'La4 = 440 Hz (440 vibraciones/segundo)', color: '#2E86AB' },
    { icono: '📶', titulo: 'Amplitud', desc: 'Cuánto se desplaza la onda. Mayor amplitud = más volumen.', ejemplo: 'Un susurro ≈ 30 dB, un concierto ≈ 110 dB', color: '#48A9A6' },
    { icono: '🎻', titulo: 'Forma de onda (timbre)', desc: 'La "forma" de la vibración. Es lo que distingue un piano de una guitarra tocando la misma nota.', ejemplo: 'Misma nota, diferente instrumento = diferente timbre', color: '#e67e22' },
  ];

  const ondas = [
    { nombre: 'Grave (110 Hz)', freq: 110, periodos: 2 },
    { nombre: 'Media (440 Hz)', freq: 440, periodos: 4 },
    { nombre: 'Aguda (880 Hz)', freq: 880, periodos: 8 },
  ];

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
        <p className={styles.ondasSubtitulo}>Más ciclos por segundo = sonido más agudo</p>
        <div className={styles.ondasGrid}>
          {ondas.map((o, i) => (
            <div key={i} className={styles.ondaRow}>
              <span className={styles.ondaLabel}>{o.nombre}</span>
              <div className={styles.ondaVisual}>
                {Array.from({ length: o.periodos * 2 }, (_, j) => (
                  <div
                    key={j}
                    className={styles.ondaBarra}
                    style={{
                      height: j % 2 === 0 ? '100%' : '20%',
                      opacity: 0.5 + (j % 2 === 0 ? 0.5 : 0),
                      background: `hsl(${200 - i * 30}, 70%, ${45 + (j % 2) * 20}%)`,
                    }}
                  />
                ))}
              </div>
              <span className={styles.ondaFreq}>{formatNumber(o.freq, 0)} Hz</span>
              <PlayButton onClick={() => audio.playTone(o.freq, 0.8)} label={`Escuchar ${o.nombre}`} small />
            </div>
          ))}
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
          <span>Piano: 27,5 Hz (La0) → 4.186 Hz (Do8)</span>
          <span>Voz humana: 80 - 1.100 Hz</span>
        </div>
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoNumero}>440</span>
        <span className={styles.datoUnidad}>Hz</span>
        <span className={styles.datoTexto}>La nota La4 (A4) — el estándar de afinación universal desde 1955. Todos los instrumentos del mundo se afinan a partir de esta frecuencia.</span>
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
        <p>Hace 2.500 años, <strong>Pitágoras</strong> descubrió que las notas que suenan bien juntas tienen relaciones matemáticas simples. Ese descubrimiento sigue siendo la base de toda la música occidental.</p>
      </div>

      {/* Ratios pitagóricos */}
      <div className={styles.ratiosCard}>
        <h3 className={styles.ratiosTitulo}>Los intervalos de Pitágoras</h3>
        <p className={styles.ratiosSubtitulo}>Cuanto más simple es la relación entre frecuencias, más &ldquo;agradable&rdquo; suena al oído</p>
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
                 intv.consonancia === 'alta' ? 'Consonante' :
                 intv.consonancia === 'media' ? 'Medio' : 'Disonante'}
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
              <p>Si apilamos quintas perfectas (3:2) desde Do, al dar 12 pasos volvemos &ldquo;casi&rdquo; a Do — pero no exactamente. La diferencia se llama <em>coma pitagórica</em>.</p>
            </div>
          </div>
          <div className={styles.doceNotasPaso}>
            <span className={styles.pasoNumero}>2</span>
            <div>
              <strong>La solución: temperamento igual</strong>
              <p>En el siglo XVIII se decidió dividir la octava en 12 partes iguales. Cada semitono es exactamente ¹²√2 ≈ 1,0595. Los intervalos ya no son &ldquo;puros&rdquo;, pero permiten tocar en cualquier tonalidad.</p>
            </div>
          </div>
          <div className={styles.doceNotasPaso}>
            <span className={styles.pasoNumero}>3</span>
            <div>
              <strong>12 es el &ldquo;mejor compromiso&rdquo;</strong>
              <p>12 divisiones logran que las quintas (1,4983 vs 1,5 puro) y las terceras (1,2599 vs 1,25 puro) estén muy cerca de los ratios naturales. Otros números (19, 31, 53) también funcionan, pero 12 es el más práctico.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notas y frecuencias */}
      <div className={styles.notasFreqCard}>
        <h3 className={styles.notasFreqTitulo}>La octava central: frecuencias de cada nota</h3>
        <div className={styles.notasBarras}>
          {NOTAS_FRECUENCIAS.map((n, i) => (
            <div key={i} className={styles.notaBarra}>
              <div
                className={styles.notaBarraFill}
                style={{
                  height: `${(n.freq / 540) * 100}%`,
                  background: n.color,
                }}
              />
              <span className={styles.notaBarraNombre}>{n.nota}</span>
              <span className={styles.notaBarraFreq}>{formatNumber(n.freq, 0)} Hz</span>
              <span className={styles.notaBarraRatio}>{n.ratio}</span>
              <PlayButton onClick={() => audio.playTone(n.freq, 0.6)} label={`Escuchar ${n.nota}`} small />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La escala de 12 notas no es arbitraria — es la <strong>mejor aproximación práctica</strong> a las proporciones matemáticas que el oído humano percibe como consonantes. Pitágoras lo intuyó con una cuerda; hoy lo confirmamos con Fourier.
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
                {ac.tipo === 'mayor' ? '😊 Mayor' : '😢 Menor'}
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
                <span key={j} className={styles.acordeEjemplo}>♪ {ej}</span>
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
            <strong>Ratios más simples = más consonante</strong>
            <p>El acorde mayor (4:5:6) tiene ratios más simples que el menor (10:12:15). Las ondas se alinean mejor, creando un sonido más &ldquo;limpio&rdquo;.</p>
          </div>
          <div className={styles.explicacionItem}>
            <span className={styles.explicacionIcono} aria-hidden="true">🧠</span>
            <strong>El cerebro lo procesa más fácil</strong>
            <p>Ratios simples generan patrones de vibración más predecibles. El cerebro los interpreta como estables y &ldquo;alegres&rdquo;. Los complejos generan tensión emocional.</p>
          </div>
          <div className={styles.explicacionItem}>
            <span className={styles.explicacionIcono} aria-hidden="true">🌍</span>
            <strong>¿Universal o cultural?</strong>
            <p>Estudios con tribus aisladas muestran preferencia natural por consonancias simples, pero la asociación &ldquo;alegre/triste&rdquo; tiene un fuerte componente cultural occidental.</p>
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
                <span key={j} className={styles.progresionCancion}>♪ {c}</span>
              ))}
            </div>
            <PlayButton onClick={() => audio.playProgression(getProgFreqs(prog.acordes))} label={`Escuchar ${prog.nombre}`} />
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La progresión <strong>I-V-vi-IV</strong> aparece en cientos de éxitos porque combina la estabilidad de los acordes mayores con la tensión emocional del menor. Es la &ldquo;fórmula&rdquo; matemática del pop.
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
        <p className={styles.compasesSubtitulo}>El numerador indica cuántos pulsos hay; el denominador, qué figura vale un pulso</p>
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
        <p className={styles.bpmSubtitulo}>Pulsaciones por minuto: la velocidad de cada estilo</p>
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
          <div className={styles.bpmEscala}>
            <span>60</span>
            <span>90</span>
            <span>120</span>
            <span>150</span>
            <span>180</span>
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
        <p className={styles.fibonacciSubtitulo}>Fibonacci y φ (1,618...) aparecen en la estructura de obras maestras</p>
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
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
            Las ondas sonoras activan directamente el sistema límbico (emocional) del cerebro.
            Cuando un acorde &ldquo;resuelve&rdquo; una tensión armónica, el cerebro libera <strong>dopamina</strong> —
            el mismo neurotransmisor que se activa con la comida o el amor. Las matemáticas de la consonancia
            son literalmente la base de la emoción musical.
          </p>

          <h3>¿Todas las culturas usan 12 notas?</h3>
          <p>
            No. La música árabe divide la octava en 24 cuartos de tono. La música india usa 22 <em>shrutis</em>.
            La música indonesia (gamelan) utiliza escalas de 5 y 7 notas con afinaciones únicas. Sin embargo,
            la octava (2:1) y la quinta (3:2) aparecen en prácticamente todas las tradiciones musicales del mundo,
            lo que sugiere una base matemática universal.
          </p>

          <h3>¿Es cierto que Mozart te hace más inteligente?</h3>
          <p>
            El &ldquo;efecto Mozart&rdquo; fue un estudio de 1993 muy exagerado por los medios.
            Lo que la ciencia ha confirmado es que <strong>estudiar música</strong> mejora habilidades
            matemáticas, espaciales y de lenguaje, gracias a que el cerebro procesa simultáneamente
            múltiples dimensiones (ritmo, melodía, armonía, lectura de partitura).
          </p>

          <h3>¿Qué es el temperamento igual?</h3>
          <p>
            Es el sistema de afinación que usamos hoy: la octava se divide en 12 semitonos exactamente iguales,
            cada uno multiplicando la frecuencia por ¹²√2 ≈ 1,0595. Bach fue uno de sus mayores defensores,
            componiendo <em>El clave bien temperado</em> para demostrar que se podía tocar en las 24 tonalidades.
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
    </>
  );
}
