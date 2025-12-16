'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Metronomo.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tempos preestablecidos con nombres musicales
const TEMPO_PRESETS = [
  { name: 'Largo', bpm: 50 },
  { name: 'Adagio', bpm: 70 },
  { name: 'Andante', bpm: 90 },
  { name: 'Moderato', bpm: 110 },
  { name: 'Allegro', bpm: 130 },
  { name: 'Vivace', bpm: 160 },
  { name: 'Presto', bpm: 180 },
];

// Compases disponibles
const TIME_SIGNATURES = [
  { beats: 4, noteValue: 4, label: '4/4' },
  { beats: 3, noteValue: 4, label: '3/4' },
  { beats: 2, noteValue: 4, label: '2/4' },
  { beats: 6, noteValue: 8, label: '6/8' },
  { beats: 5, noteValue: 4, label: '5/4' },
  { beats: 7, noteValue: 8, label: '7/8' },
];

export default function MetronomoPage() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timeSignature, setTimeSignature] = useState(TIME_SIGNATURES[0]);
  const [accentFirst, setAccentFirst] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  const currentBeatRef = useRef(0);

  // Inicializar AudioContext
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Generar sonido de click
  const playClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Frecuencia más alta para el acento
    osc.frequency.value = isAccent ? 1000 : 800;
    osc.type = 'sine';

    // Volumen
    const vol = isAccent ? volume : volume * 0.7;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.start(time);
    osc.stop(time + 0.1);
  }, [volume]);

  // Scheduler del metrónomo
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const scheduleAheadTime = 0.1; // 100ms de anticipación
    const lookahead = 25; // ms entre checks

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const isAccent = accentFirst && currentBeatRef.current === 0;
      playClick(nextNoteTimeRef.current, isAccent);

      // Actualizar beat actual
      setCurrentBeat(currentBeatRef.current);

      // Avanzar al siguiente beat
      currentBeatRef.current = (currentBeatRef.current + 1) % timeSignature.beats;

      // Calcular tiempo del siguiente beat
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTimeRef.current += secondsPerBeat;
    }

    timerIdRef.current = window.setTimeout(scheduler, lookahead);
  }, [bpm, timeSignature.beats, accentFirst, playClick]);

  // Iniciar metrónomo
  const start = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime;
    setIsPlaying(true);
    scheduler();
  }, [initAudio, scheduler]);

  // Detener metrónomo
  const stop = useCallback(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    currentBeatRef.current = 0;
  }, []);

  // Toggle play/stop
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Tap Tempo
  const handleTap = useCallback(() => {
    const now = Date.now();
    const newTaps = [...tapTimes, now].filter(t => now - t < 3000); // Solo últimos 3 segundos

    if (newTaps.length >= 2) {
      // Calcular intervalos
      const intervals: number[] = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }

      // Promedio de intervalos
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Limitar entre 40 y 220
      setBpm(Math.max(40, Math.min(220, calculatedBpm)));
    }

    setTapTimes(newTaps);
  }, [tapTimes]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Reiniciar scheduler cuando cambian parámetros
  useEffect(() => {
    if (isPlaying) {
      stop();
      start();
    }
  }, [bpm, timeSignature, accentFirst]);

  // Obtener nombre del tempo
  const getTempoName = (bpm: number): string => {
    if (bpm < 60) return 'Largo';
    if (bpm < 80) return 'Adagio';
    if (bpm < 100) return 'Andante';
    if (bpm < 120) return 'Moderato';
    if (bpm < 140) return 'Allegro';
    if (bpm < 170) return 'Vivace';
    return 'Presto';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🎵</span>
        <h1 className={styles.title}>Metrónomo</h1>
        <p className={styles.subtitle}>
          Metrónomo online preciso para práctica musical.
          Ajusta el tempo, compás y usa tap tempo para detectar BPM.
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Panel principal */}
        <div className={styles.metronomePanel}>
          {/* Visualización del pulso */}
          <div className={styles.beatDisplay}>
            {Array.from({ length: timeSignature.beats }).map((_, i) => (
              <div
                key={i}
                className={`${styles.beatDot} ${i === currentBeat && isPlaying ? styles.active : ''} ${i === 0 ? styles.accent : ''}`}
              />
            ))}
          </div>

          {/* BPM Display */}
          <div className={styles.bpmDisplay}>
            <span className={styles.bpmValue}>{bpm}</span>
            <span className={styles.bpmLabel}>BPM</span>
            <span className={styles.tempoName}>{getTempoName(bpm)}</span>
          </div>

          {/* Slider de BPM */}
          <div className={styles.sliderContainer}>
            <button
              className={styles.bpmAdjust}
              onClick={() => setBpm(Math.max(40, bpm - 1))}
            >
              −
            </button>
            <input
              type="range"
              min="40"
              max="220"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className={styles.bpmSlider}
            />
            <button
              className={styles.bpmAdjust}
              onClick={() => setBpm(Math.min(220, bpm + 1))}
            >
              +
            </button>
          </div>

          {/* Botones de control */}
          <div className={styles.controls}>
            <button
              onClick={togglePlay}
              className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
            >
              {isPlaying ? '⏹️ Detener' : '▶️ Iniciar'}
            </button>
            <button onClick={handleTap} className={styles.tapButton}>
              👆 Tap Tempo
            </button>
          </div>
        </div>

        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>⚙️ Configuración</h2>

          {/* Compás */}
          <div className={styles.configRow}>
            <label className={styles.configLabel}>Compás</label>
            <div className={styles.timeSignatures}>
              {TIME_SIGNATURES.map((ts) => (
                <button
                  key={ts.label}
                  className={`${styles.tsButton} ${timeSignature.label === ts.label ? styles.selected : ''}`}
                  onClick={() => setTimeSignature(ts)}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acento */}
          <div className={styles.configRow}>
            <label className={styles.configLabel}>Acento en primer tiempo</label>
            <button
              className={`${styles.toggleButton} ${accentFirst ? styles.on : ''}`}
              onClick={() => setAccentFirst(!accentFirst)}
            >
              {accentFirst ? 'Sí' : 'No'}
            </button>
          </div>

          {/* Volumen */}
          <div className={styles.configRow}>
            <label className={styles.configLabel}>Volumen</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={styles.volumeSlider}
            />
          </div>

          {/* Presets de tempo */}
          <div className={styles.configRow}>
            <label className={styles.configLabel}>Tempos rápidos</label>
            <div className={styles.presets}>
              {TEMPO_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={styles.presetButton}
                  onClick={() => setBpm(preset.bpm)}
                  title={`${preset.bpm} BPM`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía del metrónomo"
        subtitle="Aprende a usar el metrónomo correctamente"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es un metrónomo?</h2>
          <p className={styles.introParagraph}>
            El metrónomo es una herramienta que produce pulsos regulares a un tempo específico,
            medido en BPM (beats per minute). Es esencial para desarrollar el sentido del ritmo
            y practicar con precisión.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🎼 Términos de tempo</h4>
              <ul>
                <li><strong>Largo</strong>: 40-60 BPM (muy lento)</li>
                <li><strong>Adagio</strong>: 66-76 BPM (lento)</li>
                <li><strong>Andante</strong>: 76-108 BPM (caminando)</li>
                <li><strong>Moderato</strong>: 108-120 BPM (moderado)</li>
                <li><strong>Allegro</strong>: 120-156 BPM (rápido)</li>
                <li><strong>Presto</strong>: 168-200 BPM (muy rápido)</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Compases comunes</h4>
              <ul>
                <li><strong>4/4</strong>: El más común (pop, rock)</li>
                <li><strong>3/4</strong>: Vals, baladas</li>
                <li><strong>2/4</strong>: Marchas, polkas</li>
                <li><strong>6/8</strong>: Baladas, jigs irlandeses</li>
                <li><strong>5/4</strong>: Jazz progresivo</li>
                <li><strong>7/8</strong>: Música balcánica</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos de práctica</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>✅ Buenas prácticas</h4>
              <ul>
                <li>Empieza lento y aumenta gradualmente</li>
                <li>Practica escalas con metrónomo</li>
                <li>Usa el acento para sentir el compás</li>
                <li>Mantén sesiones de 15-30 minutos</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🎯 Tap Tempo</h4>
              <ul>
                <li>Toca el botón al ritmo de una canción</li>
                <li>Necesitas al menos 2 toques</li>
                <li>Más toques = mayor precisión</li>
                <li>Útil para transcribir canciones</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('metronomo')} />
      <Footer appName="metronomo" />
    </div>
  );
}
