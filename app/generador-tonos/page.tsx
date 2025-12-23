'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GeneradorTonos.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface FrecuenciaPreset {
  nombre: string;
  frecuencia: number;
  categoria: string;
}

const PRESETS: FrecuenciaPreset[] = [
  // Notas musicales
  { nombre: 'Do (C4)', frecuencia: 261.63, categoria: 'Notas' },
  { nombre: 'Re (D4)', frecuencia: 293.66, categoria: 'Notas' },
  { nombre: 'Mi (E4)', frecuencia: 329.63, categoria: 'Notas' },
  { nombre: 'Fa (F4)', frecuencia: 349.23, categoria: 'Notas' },
  { nombre: 'Sol (G4)', frecuencia: 392.00, categoria: 'Notas' },
  { nombre: 'La (A4)', frecuencia: 440.00, categoria: 'Notas' },
  { nombre: 'Si (B4)', frecuencia: 493.88, categoria: 'Notas' },
  // Tests de audio
  { nombre: 'Subgraves', frecuencia: 30, categoria: 'Tests' },
  { nombre: 'Graves', frecuencia: 100, categoria: 'Tests' },
  { nombre: 'Medios-bajos', frecuencia: 500, categoria: 'Tests' },
  { nombre: 'Medios', frecuencia: 1000, categoria: 'Tests' },
  { nombre: 'Medios-altos', frecuencia: 2000, categoria: 'Tests' },
  { nombre: 'Agudos', frecuencia: 5000, categoria: 'Tests' },
  { nombre: 'Muy agudos', frecuencia: 10000, categoria: 'Tests' },
  { nombre: 'Ultrasonido', frecuencia: 15000, categoria: 'Tests' },
];

export default function GeneradorTonosPage() {
  const [frecuencia, setFrecuencia] = useState(440);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.3);
  const [tipoOnda, setTipoOnda] = useState<OscillatorType>('sine');
  const [sweep, setSweep] = useState(false);
  const [sweepMin, setSweepMin] = useState(20);
  const [sweepMax, setSweepMax] = useState(2000);
  const [sweepDuracion, setSweepDuracion] = useState(5);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sweepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (sweepIntervalRef.current) {
        clearInterval(sweepIntervalRef.current);
      }
    };
  }, []);

  const iniciarAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = tipoOnda;
    oscillator.frequency.setValueAtTime(frecuencia, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volumen, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setReproduciendo(true);
  }, [frecuencia, volumen, tipoOnda]);

  const detenerAudio = useCallback(() => {
    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }
    setSweep(false);

    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.05);
    }

    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      setReproduciendo(false);
    }, 50);
  }, []);

  const toggleAudio = () => {
    if (reproduciendo) {
      detenerAudio();
    } else {
      iniciarAudio();
    }
  };

  // Actualizar frecuencia en tiempo real
  useEffect(() => {
    if (oscillatorRef.current && audioContextRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(frecuencia, audioContextRef.current.currentTime);
    }
  }, [frecuencia]);

  // Actualizar volumen en tiempo real
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current && reproduciendo) {
      gainNodeRef.current.gain.setValueAtTime(volumen, audioContextRef.current.currentTime);
    }
  }, [volumen, reproduciendo]);

  // Actualizar tipo de onda
  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.type = tipoOnda;
    }
  }, [tipoOnda]);

  // Función de barrido (sweep)
  const iniciarSweep = () => {
    if (!reproduciendo) {
      iniciarAudio();
    }

    setSweep(true);
    let frecActual = sweepMin;
    const incremento = (sweepMax - sweepMin) / (sweepDuracion * 20);

    sweepIntervalRef.current = setInterval(() => {
      frecActual += incremento;
      if (frecActual >= sweepMax) {
        frecActual = sweepMin;
      }
      setFrecuencia(Math.round(frecActual));
    }, 50);
  };

  const detenerSweep = () => {
    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }
    setSweep(false);
  };

  const getDescripcionFrecuencia = (freq: number): string => {
    if (freq < 60) return 'Subgraves - Sentir más que oír';
    if (freq < 250) return 'Graves - Bajos profundos';
    if (freq < 500) return 'Medios-bajos - Calidez';
    if (freq < 2000) return 'Medios - Voz humana';
    if (freq < 4000) return 'Medios-altos - Presencia';
    if (freq < 8000) return 'Agudos - Brillo';
    if (freq < 16000) return 'Muy agudos - Aire';
    return 'Ultrasonido - Límite audible';
  };

  const categoriasPresets = ['Notas', 'Tests'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Tonos</h1>
        <p className={styles.subtitle}>
          Frecuencias de audio de 20Hz a 20kHz
        </p>
      </header>

      {/* Panel principal */}
      <div className={styles.mainPanel}>
        <div className={styles.frecuenciaDisplay}>
          <input
            type="number"
            min="20"
            max="20000"
            value={frecuencia}
            onChange={(e) => setFrecuencia(Math.max(20, Math.min(20000, parseInt(e.target.value) || 20)))}
            className={styles.frecuenciaInput}
          />
          <span className={styles.frecuenciaUnidad}>Hz</span>
        </div>

        <p className={styles.descripcionFrecuencia}>
          {getDescripcionFrecuencia(frecuencia)}
        </p>

        {/* Slider principal */}
        <div className={styles.sliderContainer}>
          <span className={styles.sliderLabel}>20 Hz</span>
          <input
            type="range"
            min="20"
            max="20000"
            value={frecuencia}
            onChange={(e) => setFrecuencia(parseInt(e.target.value))}
            className={styles.frecuenciaSlider}
          />
          <span className={styles.sliderLabel}>20 kHz</span>
        </div>

        {/* Slider logarítmico visual */}
        <div className={styles.escalaVisual}>
          <span onClick={() => setFrecuencia(20)}>20</span>
          <span onClick={() => setFrecuencia(100)}>100</span>
          <span onClick={() => setFrecuencia(500)}>500</span>
          <span onClick={() => setFrecuencia(1000)}>1k</span>
          <span onClick={() => setFrecuencia(5000)}>5k</span>
          <span onClick={() => setFrecuencia(10000)}>10k</span>
          <span onClick={() => setFrecuencia(20000)}>20k</span>
        </div>

        {/* Botones de control */}
        <div className={styles.controles}>
          <button
            className={`${styles.btnPlay} ${reproduciendo ? styles.activo : ''}`}
            onClick={toggleAudio}
          >
            {reproduciendo ? '⏹️ Detener' : '▶️ Reproducir'}
          </button>
        </div>

        {/* Volumen */}
        <div className={styles.volumenControl}>
          <span className={styles.volumenIcon}>🔉</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumen}
            onChange={(e) => setVolumen(parseFloat(e.target.value))}
            className={styles.volumenSlider}
          />
          <span className={styles.volumenIcon}>🔊</span>
          <span className={styles.volumenValor}>{Math.round(volumen * 100)}%</span>
        </div>
      </div>

      {/* Tipo de onda */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Tipo de onda</h3>
        <div className={styles.ondaGrid}>
          {(['sine', 'triangle', 'square', 'sawtooth'] as OscillatorType[]).map((tipo) => (
            <button
              key={tipo}
              className={`${styles.ondaBtn} ${tipoOnda === tipo ? styles.ondaActiva : ''}`}
              onClick={() => setTipoOnda(tipo)}
            >
              <span className={styles.ondaIcono}>
                {tipo === 'sine' && '〰️'}
                {tipo === 'triangle' && '📐'}
                {tipo === 'square' && '⬜'}
                {tipo === 'sawtooth' && '📈'}
              </span>
              <span className={styles.ondaNombre}>
                {tipo === 'sine' && 'Senoidal'}
                {tipo === 'triangle' && 'Triangular'}
                {tipo === 'square' && 'Cuadrada'}
                {tipo === 'sawtooth' && 'Sierra'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Barrido de frecuencias */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Barrido de frecuencias (Sweep)</h3>
        <div className={styles.sweepControles}>
          <div className={styles.sweepInputs}>
            <div className={styles.sweepInput}>
              <label>Desde</label>
              <input
                type="number"
                value={sweepMin}
                onChange={(e) => setSweepMin(parseInt(e.target.value) || 20)}
                min="20"
                max="20000"
              />
              <span>Hz</span>
            </div>
            <div className={styles.sweepInput}>
              <label>Hasta</label>
              <input
                type="number"
                value={sweepMax}
                onChange={(e) => setSweepMax(parseInt(e.target.value) || 20000)}
                min="20"
                max="20000"
              />
              <span>Hz</span>
            </div>
            <div className={styles.sweepInput}>
              <label>Duración</label>
              <input
                type="number"
                value={sweepDuracion}
                onChange={(e) => setSweepDuracion(parseInt(e.target.value) || 5)}
                min="1"
                max="60"
              />
              <span>seg</span>
            </div>
          </div>
          <button
            className={`${styles.btnSweep} ${sweep ? styles.sweepActivo : ''}`}
            onClick={sweep ? detenerSweep : iniciarSweep}
          >
            {sweep ? '⏹️ Detener barrido' : '🔄 Iniciar barrido'}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Frecuencias predefinidas</h3>
        {categoriasPresets.map((categoria) => (
          <div key={categoria} className={styles.categoriaPresets}>
            <h4 className={styles.categoriaTitulo}>{categoria}</h4>
            <div className={styles.presetsGrid}>
              {PRESETS.filter(p => p.categoria === categoria).map((preset) => (
                <button
                  key={preset.nombre}
                  className={`${styles.presetBtn} ${Math.round(frecuencia) === Math.round(preset.frecuencia) ? styles.presetActivo : ''}`}
                  onClick={() => setFrecuencia(preset.frecuencia)}
                >
                  <span className={styles.presetNombre}>{preset.nombre}</span>
                  <span className={styles.presetFrec}>{preset.frecuencia} Hz</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3 className={styles.infoTitle}>Usos comunes</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔊</span>
            <h4>Test de altavoces</h4>
            <p>Comprueba la respuesta de frecuencia de tus altavoces o auriculares.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>👂</span>
            <h4>Test de audición</h4>
            <p>Descubre hasta qué frecuencia puedes oír (normalmente hasta 15-20kHz).</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎵</span>
            <h4>Afinación</h4>
            <p>Usa las notas musicales para afinar instrumentos.</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('generador-tonos')} />
      <Footer appName="generador-tonos" />
    </div>
  );
}
