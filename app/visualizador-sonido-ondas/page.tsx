'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect } from 'react';
import styles from './SonidoOndas.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'anatomia' | 'frecuencia' | 'decibelios' | 'timbre';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'anatomia', titulo: 'Anatomía de onda', icono: '🌊', subtitulo: 'Frecuencia, amplitud, longitud' },
  { id: 'frecuencia', titulo: 'Frecuencia y tono', icono: '🎵', subtitulo: 'Rango audible y notas' },
  { id: 'decibelios', titulo: 'Decibelios', icono: '📢', subtitulo: 'Escala y seguridad auditiva' },
  { id: 'timbre', titulo: 'Timbre y armónicos', icono: '🎸', subtitulo: 'Guitarra vs piano vs flauta' },
];

// ─── Datos sección 1 ───

interface PropiedadOnda {
  nombre: string;
  icono: string;
  descripcion: string;
  detalle: string;
}

const PROPIEDADES_ONDA: PropiedadOnda[] = [
  { nombre: 'Frecuencia', icono: '🔄', descripcion: 'Número de ciclos completos por segundo. Se mide en hercios (Hz).', detalle: 'Mayor frecuencia = tono más agudo' },
  { nombre: 'Amplitud', icono: '📏', descripcion: 'Desplazamiento máximo desde la posición de equilibrio.', detalle: 'Mayor amplitud = sonido más fuerte' },
  { nombre: 'Longitud de onda', icono: '📐', descripcion: 'Distancia entre dos puntos equivalentes consecutivos (cresta a cresta).', detalle: 'λ = v / f (velocidad / frecuencia)' },
  { nombre: 'Período', icono: '⏱️', descripcion: 'Tiempo que tarda en completarse un ciclo. Es la inversa de la frecuencia.', detalle: 'T = 1 / f' },
];

interface VelocidadSonido {
  medio: string;
  velocidad: number;
  unidad: string;
}

const VELOCIDADES: VelocidadSonido[] = [
  { medio: 'Aire (20 °C)', velocidad: 343, unidad: 'm/s' },
  { medio: 'Agua', velocidad: 1480, unidad: 'm/s' },
  { medio: 'Madera', velocidad: 3300, unidad: 'm/s' },
  { medio: 'Acero', velocidad: 5100, unidad: 'm/s' },
  { medio: 'Diamante', velocidad: 12000, unidad: 'm/s' },
];

// ─── Datos sección 2 ───

interface NotaMusical {
  nota: string;
  freq: number;
  color: string;
}

const NOTAS: NotaMusical[] = [
  { nota: 'Do3 (C3)', freq: 130.81, color: '#e74c3c' },
  { nota: 'Re3 (D3)', freq: 146.83, color: '#e67e22' },
  { nota: 'Mi3 (E3)', freq: 164.81, color: '#f1c40f' },
  { nota: 'Fa3 (F3)', freq: 174.61, color: '#2ecc71' },
  { nota: 'Sol3 (G3)', freq: 196.00, color: '#2E86AB' },
  { nota: 'La3 (A3)', freq: 220.00, color: '#3498db' },
  { nota: 'Si3 (B3)', freq: 246.94, color: '#9b59b6' },
  { nota: 'Do4 (C4)', freq: 261.63, color: '#e74c3c' },
  { nota: 'La4 (A4)', freq: 440.00, color: '#3498db' },
  { nota: 'Do5 (C5)', freq: 523.25, color: '#e74c3c' },
];

interface RangoVocal {
  tipo: string;
  min: number;
  max: number;
  genero: string;
}

const RANGOS_VOCALES: RangoVocal[] = [
  { tipo: 'Bajo', min: 80, max: 330, genero: '♂' },
  { tipo: 'Barítono', min: 100, max: 400, genero: '♂' },
  { tipo: 'Tenor', min: 130, max: 520, genero: '♂' },
  { tipo: 'Contralto', min: 170, max: 700, genero: '♀' },
  { tipo: 'Mezzosoprano', min: 200, max: 880, genero: '♀' },
  { tipo: 'Soprano', min: 250, max: 1050, genero: '♀' },
];

interface AnimalAuditivo {
  animal: string;
  icono: string;
  maxFreq: number;
  unidad: string;
}

const ANIMALES: AnimalAuditivo[] = [
  { animal: 'Humano', icono: '🧑', maxFreq: 20, unidad: 'kHz' },
  { animal: 'Perro', icono: '🐕', maxFreq: 67, unidad: 'kHz' },
  { animal: 'Gato', icono: '🐈', maxFreq: 79, unidad: 'kHz' },
  { animal: 'Murciélago', icono: '🦇', maxFreq: 110, unidad: 'kHz' },
  { animal: 'Delfín', icono: '🐬', maxFreq: 150, unidad: 'kHz' },
  { animal: 'Polilla', icono: '🦋', maxFreq: 300, unidad: 'kHz' },
];

// ─── Datos sección 3 ───

interface NivelDb {
  db: number;
  nombre: string;
  icono: string;
  desc: string;
  zona: 'seguro' | 'precaucion' | 'peligro' | 'dolor';
}

const NIVELES_DB: NivelDb[] = [
  { db: 10, nombre: 'Respiración', icono: '🫁', desc: 'Apenas perceptible', zona: 'seguro' },
  { db: 30, nombre: 'Susurro', icono: '🤫', desc: 'Biblioteca silenciosa', zona: 'seguro' },
  { db: 50, nombre: 'Lluvia suave', icono: '🌧️', desc: 'Ambiente tranquilo', zona: 'seguro' },
  { db: 60, nombre: 'Conversación', icono: '🗣️', desc: 'Diálogo normal', zona: 'seguro' },
  { db: 70, nombre: 'Aspiradora', icono: '🧹', desc: 'Ruido molesto', zona: 'precaucion' },
  { db: 80, nombre: 'Tráfico denso', icono: '🚗', desc: 'Daño con exposición prolongada', zona: 'precaucion' },
  { db: 90, nombre: 'Cortacésped', icono: '🌿', desc: 'Protección recomendada', zona: 'precaucion' },
  { db: 100, nombre: 'Moto sin silenciador', icono: '🏍️', desc: 'Daño en 15 min', zona: 'peligro' },
  { db: 110, nombre: 'Concierto rock', icono: '🎸', desc: 'Daño en 2 min', zona: 'peligro' },
  { db: 120, nombre: 'Sirena ambulancia', icono: '🚑', desc: 'Dolor inmediato', zona: 'dolor' },
  { db: 130, nombre: 'Umbral del dolor', icono: '⚠️', desc: 'Daño instantáneo', zona: 'dolor' },
  { db: 180, nombre: 'Despegue de cohete', icono: '🚀', desc: 'Destrucción auditiva', zona: 'dolor' },
];

interface ExposicionSegura {
  db: number;
  tiempo: string;
  pctBarra: number;
  color: string;
}

const EXPOSICION: ExposicionSegura[] = [
  { db: 85, tiempo: '8 horas', pctBarra: 100, color: '#27ae60' },
  { db: 88, tiempo: '4 horas', pctBarra: 80, color: '#2ecc71' },
  { db: 91, tiempo: '2 horas', pctBarra: 60, color: '#f1c40f' },
  { db: 94, tiempo: '1 hora', pctBarra: 45, color: '#e67e22' },
  { db: 97, tiempo: '30 min', pctBarra: 30, color: '#e74c3c' },
  { db: 100, tiempo: '15 min', pctBarra: 18, color: '#c0392b' },
  { db: 110, tiempo: '< 2 min', pctBarra: 8, color: '#8e44ad' },
  { db: 120, tiempo: '0 seg', pctBarra: 2, color: '#6c3483' },
];

// ─── Datos sección 4 ───

interface InstrumentoArmonicos {
  nombre: string;
  armonicos: number[]; // % de amplitud relativa de cada armónico
}

const INSTRUMENTOS: InstrumentoArmonicos[] = [
  { nombre: 'Sinusoidal pura', armonicos: [100, 0, 0, 0, 0, 0] },
  { nombre: 'Flauta', armonicos: [100, 30, 10, 5, 2, 1] },
  { nombre: 'Piano', armonicos: [100, 80, 60, 40, 25, 15] },
  { nombre: 'Guitarra', armonicos: [100, 70, 50, 35, 20, 10] },
  { nombre: 'Violín', armonicos: [100, 85, 70, 55, 40, 30] },
  { nombre: 'Clarinete', armonicos: [100, 10, 80, 8, 60, 5] },
];

// ─────────────────────────────────────────────
// Generador de path SVG para onda
// ─────────────────────────────────────────────

function generarPathOnda(
  freq: number,
  amplitud: number,
  width: number,
  height: number,
  armonicos?: number[]
): string {
  const centerY = height / 2;
  const puntos: string[] = [];
  const pasos = 400;

  for (let i = 0; i <= pasos; i++) {
    const x = (i / pasos) * width;
    const t = (i / pasos) * Math.PI * 2 * (freq / 100);
    let y = 0;

    if (armonicos && armonicos.length > 0) {
      for (let n = 0; n < armonicos.length; n++) {
        y += (armonicos[n] / 100) * Math.sin((n + 1) * t);
      }
      // Normalizar
      const maxSum = armonicos.reduce((s, v) => s + v / 100, 0);
      if (maxSum > 0) y /= maxSum;
    } else {
      y = Math.sin(t);
    }

    const py = centerY - y * amplitud * (height * 0.4) / 100;
    puntos.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${py.toFixed(1)}`);
  }

  return puntos.join(' ');
}

// ─────────────────────────────────────────────
// Web Audio API — reproducción de tonos
// ─────────────────────────────────────────────

let audioCtx: AudioContext | null = null;
let currentOscillator: OscillatorNode | null = null;
let currentGain: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number = 1.5, type: OscillatorType = 'sine', volume: number = 0.3) {
  const ctx = getAudioContext();
  stopTone();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  // Fade out suave para evitar click
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);

  currentOscillator = osc;
  currentGain = gain;
}

function playToneWithHarmonics(frequency: number, harmonics: number[], duration: number = 1.5, volume: number = 0.3) {
  const ctx = getAudioContext();
  stopTone();

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  masterGain.connect(ctx.destination);

  const maxAmp = harmonics.reduce((s, v) => s + v / 100, 0);

  harmonics.forEach((amp, i) => {
    if (amp === 0) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency * (i + 1), ctx.currentTime);
    gain.gain.setValueAtTime((amp / 100) / maxAmp, ctx.currentTime);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  });

  currentGain = masterGain;
}

function stopTone() {
  try {
    currentOscillator?.stop();
  } catch { /* already stopped */ }
  currentOscillator = null;
  currentGain = null;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SonidoOndasPage() {
  const [seccion, setSeccion] = useState<Seccion>('anatomia');
  const [frecuencia, setFrecuencia] = useState(200);
  const [amplitud, setAmplitud] = useState(70);
  const [instrumentoIdx, setInstrumentoIdx] = useState(0);

  // Cleanup audio al desmontar o cambiar de sección
  useEffect(() => {
    return () => { stopTone(); };
  }, [seccion]);

  // Cálculos derivados
  const longitudOnda = 343 / frecuencia;
  const periodo = 1 / frecuencia;

  // SVG onda principal
  const SVG_W = 800;
  const SVG_H = 200;

  const pathOnda = useMemo(
    () => generarPathOnda(frecuencia, amplitud, SVG_W, SVG_H),
    [frecuencia, amplitud]
  );

  // Paths para formas de onda de instrumentos
  const pathsInstrumentos = useMemo(
    () => INSTRUMENTOS.map(inst => generarPathOnda(200, 80, 200, 60, inst.armonicos)),
    []
  );

  // ─── Renderizado por sección ───

  function renderAnatomia() {
    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Anatomía de una onda sonora</h2>
          <p className={styles.seccionSubtitulo}>Mueve los sliders para ver cómo cambia la onda</p>
        </div>

        {/* SVG onda interactiva */}
        <div className={styles.svgContainer}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} aria-label={`Onda sinusoidal a ${frecuencia} Hz con amplitud ${amplitud}%`}>
            {/* Línea central */}
            <line x1="0" y1={SVG_H / 2} x2={SVG_W} y2={SVG_H / 2} stroke="#ccc" strokeWidth="1" strokeDasharray="4 4" />
            {/* Onda */}
            <path d={pathOnda} fill="none" stroke="#2E86AB" strokeWidth="3" strokeLinecap="round" />
            {/* Etiquetas */}
            <text x="20" y="20" fill="#48A9A6" fontSize="12" fontWeight="700">
              λ = {formatNumber(longitudOnda, 2)} m
            </text>
            <text x="20" y="38" fill="#2E86AB" fontSize="12" fontWeight="700">
              T = {periodo >= 0.001 ? `${formatNumber(periodo * 1000, 2)} ms` : `${formatNumber(periodo * 1000000, 1)} μs`}
            </text>
            {/* Flecha amplitud */}
            <line x1={SVG_W - 60} y1={SVG_H / 2} x2={SVG_W - 60} y2={SVG_H / 2 - amplitud * (SVG_H * 0.4) / 100} stroke="#e74c3c" strokeWidth="2" markerEnd="url(#arrowRed)" />
            <text x={SVG_W - 50} y={SVG_H / 2 - 10} fill="#e74c3c" fontSize="11" fontWeight="600">A</text>
            <defs>
              <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#e74c3c" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Sliders */}
        <div className={styles.slidersGrid}>
          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel}>
              <span>Frecuencia</span>
              <span className={styles.sliderValue}>{formatNumber(frecuencia, 0)} Hz</span>
            </label>
            <input
              type="range"
              min="20"
              max="2000"
              value={frecuencia}
              onChange={e => setFrecuencia(Number(e.target.value))}
              className={styles.sliderInput}
              aria-label="Frecuencia en hercios"
            />
            <div className={styles.sliderRange}>
              <span>20 Hz</span>
              <span>2.000 Hz</span>
            </div>
          </div>
          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel}>
              <span>Amplitud</span>
              <span className={styles.sliderValue}>{amplitud}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={amplitud}
              onChange={e => setAmplitud(Number(e.target.value))}
              className={styles.sliderInput}
              aria-label="Amplitud en porcentaje"
            />
            <div className={styles.sliderRange}>
              <span>5%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={styles.btnEscuchar}
          onClick={() => playTone(frecuencia, 1.5, 'sine', amplitud / 100 * 0.5)}
          aria-label={`Escuchar tono a ${frecuencia} hercios`}
        >
          <span aria-hidden="true">🔊</span> Escuchar {formatNumber(frecuencia, 0)} Hz
        </button>

        {/* Propiedades */}
        <div className={styles.etiquetasGrid}>
          {PROPIEDADES_ONDA.map(prop => (
            <div key={prop.nombre} className={styles.etiquetaCard}>
              <div className={styles.etiquetaHeader}>
                <span className={styles.etiquetaIcono} aria-hidden="true">{prop.icono}</span>
                <h3 className={styles.etiquetaNombre}>{prop.nombre}</h3>
              </div>
              <p className={styles.etiquetaDesc}>{prop.descripcion} <em>{prop.detalle}</em></p>
            </div>
          ))}
        </div>

        {/* Tipos de onda */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Ondas longitudinales vs transversales</h3>
          <p className={styles.cardSubtitulo}>El sonido es una onda longitudinal</p>
          <div className={styles.insight}>
            <p>
              <strong>Onda longitudinal (sonido):</strong> las partículas vibran en la misma dirección que avanza la onda, creando compresiones y rarefacciones en el aire.
            </p>
          </div>
          <div className={styles.insight}>
            <p>
              <strong>Onda transversal (luz, cuerdas):</strong> las partículas vibran perpendicularmente a la dirección de propagación.
            </p>
          </div>
        </div>

        {/* Velocidad del sonido */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Velocidad del sonido en diferentes medios</h3>
          <p className={styles.cardSubtitulo}>Cuanto más denso el medio, más rápido viaja</p>
          <div className={styles.velocidadGrid}>
            {VELOCIDADES.map(v => (
              <div key={v.medio} className={styles.velocidadRow}>
                <span className={styles.velocidadMedio}>{v.medio}</span>
                <div className={styles.velocidadBarContainer}>
                  <div
                    className={styles.velocidadBar}
                    style={{ width: `${(v.velocidad / 12000) * 100}%` }}
                  />
                </div>
                <span className={styles.velocidadValor}>{formatNumber(v.velocidad, 0)} {v.unidad}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>343</span>
            <span className={styles.datoUnidad}> m/s</span>
          </div>
          <p className={styles.datoTexto}>
            Velocidad del sonido en el aire a 20 °C. Por eso ves el relámpago antes de oír el trueno: la luz viaja a 300.000 km/s.
          </p>
        </div>
      </>
    );
  }

  function renderFrecuencia() {
    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Frecuencia y tono</h2>
          <p className={styles.seccionSubtitulo}>Qué frecuencias podemos oír y cómo se relacionan con las notas</p>
        </div>

        {/* Rango audible */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Espectro de frecuencias</h3>
          <div className={styles.rangoBar}>
            <div className={styles.rangoInfra}>
              <span className={styles.rangoLabel}>Infrasonido</span>
              <span className={styles.rangoFreq}>&lt; 20 Hz</span>
            </div>
            <div className={styles.rangoAudible}>
              <span className={styles.rangoLabel}>Rango audible humano</span>
              <span className={styles.rangoFreq}>20 Hz - 20.000 Hz</span>
            </div>
            <div className={styles.rangoUltra}>
              <span className={styles.rangoLabel}>Ultrasonido</span>
              <span className={styles.rangoFreq}>&gt; 20 kHz</span>
            </div>
          </div>
          <div className={styles.rangoNotas}>
            <span>Terremotos, elefantes</span>
            <span>Habla, música</span>
            <span>Ecografía, murciélagos</span>
          </div>
        </div>

        {/* Octavas */}
        <div className={styles.insight}>
          <p>
            <strong>Octavas:</strong> cada octava duplica la frecuencia. La4 = 440 Hz → La5 = 880 Hz → La6 = 1.760 Hz.
            Por eso La3 (220 Hz) y La4 (440 Hz) suenan &quot;igual&quot; pero uno más agudo.
          </p>
        </div>

        {/* Notas musicales */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Notas musicales y sus frecuencias</h3>
          <p className={styles.cardSubtitulo}>El estándar: La4 = 440 Hz</p>
          <div className={styles.notasGrid}>
            {NOTAS.map(n => (
              <div
                key={n.nota}
                className={styles.notaRow}
                onClick={() => playTone(n.freq, 1.0)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && playTone(n.freq, 1.0)}
                aria-label={`Escuchar ${n.nota} a ${formatNumber(n.freq, 2)} hercios`}
              >
                <span className={styles.notaNombre}>{n.nota}</span>
                <div className={styles.notaBarContainer}>
                  <div
                    className={styles.notaBar}
                    style={{
                      width: `${(n.freq / 600) * 100}%`,
                      background: n.color,
                    }}
                  />
                </div>
                <span className={styles.notaFreq}>{formatNumber(n.freq, 2)} Hz</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rangos vocales */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Rangos vocales</h3>
          <p className={styles.cardSubtitulo}>Frecuencia fundamental de cada tipo de voz</p>
          <div className={styles.vocalesGrid}>
            {RANGOS_VOCALES.map(v => (
              <div key={v.tipo} className={styles.vocalRow}>
                <span className={styles.vocalNombre}>{v.genero} {v.tipo}</span>
                <div className={styles.vocalBarContainer}>
                  <div
                    className={styles.vocalBar}
                    style={{
                      left: `${(v.min / 1200) * 100}%`,
                      width: `${((v.max - v.min) / 1200) * 100}%`,
                    }}
                  />
                </div>
                <span className={styles.vocalRango}>{formatNumber(v.min, 0)}-{formatNumber(v.max, 0)} Hz</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animales */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Audición en el reino animal</h3>
          <p className={styles.cardSubtitulo}>Frecuencia máxima que puede oír cada especie</p>
          <div className={styles.animalesGrid}>
            {ANIMALES.map(a => (
              <div key={a.animal} className={styles.animalRow}>
                <span className={styles.animalIcono} aria-hidden="true">{a.icono}</span>
                <span className={styles.animalNombre}>{a.animal}</span>
                <span className={styles.animalFreq}>{formatNumber(a.maxFreq, 0)} {a.unidad}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>440</span>
            <span className={styles.datoUnidad}> Hz</span>
          </div>
          <p className={styles.datoTexto}>
            Frecuencia de referencia universal. En 1939, la conferencia internacional fijó La4 = 440 Hz como estándar de afinación para todas las orquestas del mundo.
          </p>
        </div>
      </>
    );
  }

  function renderDecibelios() {
    const zonaStyles: Record<string, string> = {
      seguro: styles.dbSeguro,
      precaucion: styles.dbPrecaucion,
      peligro: styles.dbPeligro,
      dolor: styles.dbDolor,
    };
    const zonaLabels: Record<string, string> = {
      seguro: 'Seguro',
      precaucion: 'Precaución',
      peligro: 'Peligro',
      dolor: 'Dolor',
    };
    const zonaColores: Record<string, string> = {
      seguro: '#27ae60',
      precaucion: '#b7950b',
      peligro: '#e74c3c',
      dolor: '#8e44ad',
    };

    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Escala de decibelios</h2>
          <p className={styles.seccionSubtitulo}>Intensidad del sonido y seguridad auditiva</p>
        </div>

        <div className={styles.insight}>
          <p>
            <strong>Escala logarítmica:</strong> cada aumento de 10 dB multiplica por 10 la intensidad.
            Un sonido de 80 dB es 10 veces más intenso que uno de 70 dB, y 100 veces más que uno de 60 dB.
          </p>
        </div>

        {/* Barra gradient */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Niveles sonoros comunes</h3>
          <div className={styles.dbBarVertical} role="img" aria-label="Gradiente de intensidad sonora: verde (seguro) a violeta (dolor)" />
          <div className={styles.dbBarLabels}>
            <span>0 dB</span>
            <span>Seguro</span>
            <span>Precaución</span>
            <span>Peligro</span>
            <span>180 dB</span>
          </div>

          <div className={styles.dbScale}>
            {NIVELES_DB.map(nivel => (
              <div key={nivel.db} className={styles.dbRow}>
                <span className={styles.dbValor} style={{ color: zonaColores[nivel.zona] }}>
                  {nivel.db}
                </span>
                <span className={styles.dbIcono} aria-hidden="true">{nivel.icono}</span>
                <div className={styles.dbInfo}>
                  <span className={styles.dbNombre}>{nivel.nombre}</span>
                  <span className={styles.dbDesc}>{nivel.desc}</span>
                </div>
                <span className={`${styles.dbTag} ${zonaStyles[nivel.zona]}`}>
                  {zonaLabels[nivel.zona]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tiempo de exposición */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Tiempo de exposición segura</h3>
          <p className={styles.cardSubtitulo}>Cada +3 dB reduce el tiempo a la mitad (NIOSH)</p>
          <div className={styles.exposicionGrid}>
            {EXPOSICION.map(e => (
              <div key={e.db} className={styles.exposicionRow}>
                <span className={styles.exposicionDb}>{e.db} dB</span>
                <div className={styles.exposicionBarContainer}>
                  <div
                    className={styles.exposicionBar}
                    style={{ width: `${e.pctBarra}%`, background: e.color }}
                  />
                </div>
                <span className={styles.exposicionTiempo}>{e.tiempo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pérdida auditiva */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Pérdida auditiva inducida por ruido</h3>
          <div className={styles.insight}>
            <p>
              La pérdida auditiva por ruido es <strong>acumulativa e irreversible</strong>. Las células ciliadas del oído interno no se regeneran.
              Se pierden primero las frecuencias altas (4.000-6.000 Hz), dificultando entender consonantes como &quot;s&quot;, &quot;f&quot;, &quot;t&quot;.
            </p>
          </div>
          <div className={styles.warningBox}>
            <span aria-hidden="true">⚠️</span> La OMS estima que 1.100 millones de jóvenes están en riesgo de pérdida auditiva por exposición a música alta.
            Usar auriculares al 60% del volumen máximo durante no más de 60 minutos seguidos (regla 60/60).
          </div>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>85</span>
            <span className={styles.datoUnidad}> dB</span>
          </div>
          <p className={styles.datoTexto}>
            Umbral de riesgo auditivo. Por encima de 85 dB, la exposición prolongada causa daño permanente. Es el volumen de un tráfico denso o un restaurante ruidoso.
          </p>
        </div>
      </>
    );
  }

  function renderTimbre() {
    const instrActual = INSTRUMENTOS[instrumentoIdx];

    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Timbre y armónicos</h2>
          <p className={styles.seccionSubtitulo}>Por qué cada instrumento tiene su &quot;voz&quot; única</p>
        </div>

        <div className={styles.contexto}>
          Cuando una guitarra y un piano tocan la misma nota (ej. La4 = 440 Hz), la frecuencia fundamental es idéntica.
          Lo que cambia es la <strong>mezcla de armónicos</strong>: las frecuencias múltiplas (880, 1.320, 1.760 Hz...) que acompañan a la fundamental.
        </div>

        {/* Selector de instrumento */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Armónicos por instrumento</h3>
          <p className={styles.cardSubtitulo}>Selecciona un instrumento para ver su mezcla de armónicos</p>
          <div className={styles.slidersGrid}>
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel}>
                <span>Instrumento</span>
                <span className={styles.sliderValue}>{instrActual.nombre}</span>
              </label>
              <input
                type="range"
                min="0"
                max={INSTRUMENTOS.length - 1}
                value={instrumentoIdx}
                onChange={e => setInstrumentoIdx(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Seleccionar instrumento"
              />
            </div>
          </div>
          <button
            type="button"
            className={styles.btnEscuchar}
            onClick={() => playToneWithHarmonics(440, instrActual.armonicos, 2.0, 0.3)}
            aria-label={`Escuchar La4 con timbre de ${instrActual.nombre}`}
          >
            <span aria-hidden="true">🎵</span> Escuchar {instrActual.nombre}
          </button>
          <div className={styles.armonicosVisual}>
            {instrActual.armonicos.map((pct, idx) => (
              <div key={idx} className={styles.armonicoRow}>
                <span className={styles.armonicoNombre}>{idx === 0 ? 'Fund.' : `${idx + 1}° arm.`}</span>
                <div className={styles.armonicoBarContainer}>
                  <div className={styles.armonicoBar} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.armonicoPct}>{pct}%</span>
              </div>
            ))}
          </div>
          <div className={styles.insight}>
            <p>
              <strong>Fundamental (f):</strong> 440 Hz →{' '}
              <strong>2° armónico (2f):</strong> 880 Hz →{' '}
              <strong>3° armónico (3f):</strong> {formatNumber(1320, 0)} Hz →{' '}
              <strong>4° (4f):</strong> {formatNumber(1760, 0)} Hz...
            </p>
          </div>
        </div>

        {/* Formas de onda */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Formas de onda</h3>
          <p className={styles.cardSubtitulo}>La forma visual refleja la mezcla de armónicos</p>
          <div className={styles.formasGrid}>
            {INSTRUMENTOS.slice(0, 4).map((inst, idx) => (
              <div key={inst.nombre} className={styles.formaCard}>
                <svg viewBox="0 0 200 60" className={styles.formaSvg} aria-label={`Forma de onda: ${inst.nombre}`}>
                  <line x1="0" y1="30" x2="200" y2="30" stroke="#ccc" strokeWidth="0.5" strokeDasharray="3 3" />
                  <path d={pathsInstrumentos[idx]} fill="none" stroke="#2E86AB" strokeWidth="2" />
                </svg>
                <p className={styles.formaNombre}>{inst.nombre}</p>
                <p className={styles.formaDesc}>
                  {idx === 0 && 'Solo la frecuencia fundamental, sin armónicos'}
                  {idx === 1 && 'Armónicos débiles, sonido suave y limpio'}
                  {idx === 2 && 'Armónicos fuertes, sonido rico y complejo'}
                  {idx === 3 && 'Mezcla equilibrada, sonido cálido'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Resonancia */}
        <div className={styles.fenomenoCard}>
          <h3 className={styles.fenomenoTitulo}>
            <span aria-hidden="true">🌉</span> Resonancia
          </h3>
          <p className={styles.fenomenoDesc}>
            Cuando una fuerza externa vibra a la frecuencia natural de un objeto, la amplitud se amplifica enormemente.
            El puente de Tacoma Narrows (1940) colapsó porque el viento generó vibraciones que coincidieron con su frecuencia natural.
            Una copa de cristal se rompe cuando una voz alcanza exactamente su frecuencia de resonancia (~550 Hz).
          </p>
        </div>

        {/* Efecto Doppler */}
        <div className={styles.fenomenoCard}>
          <h3 className={styles.fenomenoTitulo}>
            <span aria-hidden="true">🚑</span> Efecto Doppler
          </h3>
          <p className={styles.fenomenoDesc}>
            Cuando una fuente de sonido se acerca, las ondas se comprimen (mayor frecuencia → tono más agudo).
            Al alejarse, las ondas se estiran (menor frecuencia → tono más grave).
            Es el cambio de tono que oyes cuando pasa una ambulancia: primero agudo (se acerca), luego grave (se aleja).
            La fórmula: f&apos; = f × (v ± v_receptor) / (v ∓ v_fuente), donde v = velocidad del sonido.
          </p>
        </div>

        {/* Batimientos */}
        <div className={styles.fenomenoCard}>
          <h3 className={styles.fenomenoTitulo}>
            <span aria-hidden="true">🎻</span> Batimientos
          </h3>
          <p className={styles.fenomenoDesc}>
            Cuando dos frecuencias muy cercanas suenan juntas (ej. 440 Hz y 442 Hz), se oye una pulsación rítmica de 2 Hz.
            Los afinadores usan este fenómeno: si hay batimientos, las cuerdas no están perfectamente afinadas.
          </p>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>6+</span>
            <span className={styles.datoUnidad}> armónicos</span>
          </div>
          <p className={styles.datoTexto}>
            Un instrumento real produce docenas de armónicos simultáneos. Es la proporción relativa de cada armónico lo que crea el timbre único de cada instrumento.
          </p>
        </div>
      </>
    );
  }

  // ─── Render principal ───

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🔊</span> Sonido y Ondas</h1>
          <p className={styles.subtitle}>Frecuencia, amplitud, decibelios y armónicos — la física del sonido</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Contenido de sección activa */}
        {seccion === 'anatomia' && renderAnatomia()}
        {seccion === 'frecuencia' && renderFrecuencia()}
        {seccion === 'decibelios' && renderDecibelios()}
        {seccion === 'timbre' && renderTimbre()}

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 ¿Quieres profundizar?"
          subtitle="Conceptos avanzados sobre acústica"
        >
          <section>
            <h2>¿Cómo percibimos el sonido?</h2>
            <p>
              Las ondas sonoras entran por el canal auditivo y hacen vibrar el tímpano. Esta vibración se transmite
              a través de tres huesecillos (martillo, yunque y estribo) hasta la cóclea, donde las células ciliadas
              convierten las vibraciones mecánicas en impulsos eléctricos que el cerebro interpreta como sonido.
            </p>
            <p>
              La cóclea tiene unas 15.000 células ciliadas distribuidas a lo largo de su espiral. Las de la base
              detectan frecuencias altas y las del ápice detectan frecuencias bajas. Es un analizador de frecuencias natural.
            </p>

            <h2>¿Por qué se eligió 440 Hz?</h2>
            <p>
              Antes de 1939, cada orquesta usaba su propia referencia: algunas a 415 Hz (barroco), otras a 435 Hz o incluso 450 Hz.
              La conferencia internacional de Londres (1939) estableció La4 = 440 Hz como estándar, confirmado por la ISO en 1955.
              Sin embargo, algunos músicos modernos defienden afinaciones alternativas (432 Hz, 444 Hz) por razones estéticas.
            </p>

            <h2>La serie armónica y las matemáticas del sonido</h2>
            <p>
              Los armónicos siguen una serie matemática exacta: si la fundamental es f, los armónicos son 2f, 3f, 4f, 5f...
              Esta serie genera los intervalos musicales naturales: la octava (2:1), la quinta (3:2), la cuarta (4:3),
              la tercera mayor (5:4). Pitágoras descubrió esta relación hace 2.500 años.
            </p>

            <h2>Acústica arquitectónica</h2>
            <p>
              El tiempo de reverberación ideal depende del uso: una sala de conciertos necesita 1,5-2,5 segundos
              (para que la música envuelva), mientras que un estudio de grabación necesita menos de 0,3 segundos
              (para captar sonido directo). Las salas de ópera como el Teatro alla Scala de Milán están diseñadas
              para que cada espectador reciba sonido directo y reflejado en proporciones óptimas.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sonido-ondas')} />
        <ShareCard appName="visualizador-sonido-ondas" />
        <Footer appName="visualizador-sonido-ondas" />
      </div>
    </>
  );
}
