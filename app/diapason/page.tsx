'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Diapason.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface FrecuenciaPreset {
  nombre: string;
  frecuencia: number;
  descripcion: string;
}

const FRECUENCIAS_PRESET: FrecuenciaPreset[] = [
  { nombre: 'La 440Hz', frecuencia: 440, descripcion: 'Estándar internacional (ISO 16)' },
  { nombre: 'La 432Hz', frecuencia: 432, descripcion: 'Afinación alternativa "natural"' },
  { nombre: 'La 442Hz', frecuencia: 442, descripcion: 'Orquestas europeas' },
  { nombre: 'La 443Hz', frecuencia: 443, descripcion: 'Algunas orquestas (Berlín)' },
  { nombre: 'La 415Hz', frecuencia: 415, descripcion: 'Música barroca' },
  { nombre: 'La 466Hz', frecuencia: 466, descripcion: 'Renacimiento (medio tono arriba)' },
];

export default function DiapasonPage() {
  const [frecuencia, setFrecuencia] = useState(440);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.5);
  const [tipoOnda, setTipoOnda] = useState<OscillatorType>('sine');

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Inicializar AudioContext
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const iniciarAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    // Crear oscilador
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = tipoOnda;
    oscillator.frequency.setValueAtTime(frecuencia, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volumen, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setReproduciendo(true);
  }, [frecuencia, volumen, tipoOnda]);

  const detenerAudio = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1);
    }

    setTimeout(() => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      setReproduciendo(false);
    }, 100);
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

  // Actualizar tipo de onda (requiere reiniciar)
  useEffect(() => {
    if (reproduciendo) {
      detenerAudio();
      setTimeout(() => iniciarAudio(), 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoOnda]);

  const seleccionarPreset = (preset: FrecuenciaPreset) => {
    setFrecuencia(preset.frecuencia);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Diapasón Digital</h1>
        <p className={styles.subtitle}>
          Tono de referencia para afinar instrumentos
        </p>
      </header>

      {/* Diapasón principal */}
      <div className={styles.diapasonCard}>
        <div className={styles.frecuenciaDisplay}>
          <span className={styles.frecuenciaNumero}>{frecuencia}</span>
          <span className={styles.frecuenciaUnidad}>Hz</span>
        </div>

        <div className={styles.notaDisplay}>
          <span className={styles.notaNombre}>La</span>
          <span className={styles.notaOctava}>A4</span>
        </div>

        {/* Botón principal */}
        <button
          className={`${styles.btnDiapason} ${reproduciendo ? styles.activo : ''}`}
          onClick={toggleAudio}
        >
          <span className={styles.diapasonIcon}>
            {reproduciendo ? '🔊' : '🔇'}
          </span>
          <span className={styles.diapasonTexto}>
            {reproduciendo ? 'Detener' : 'Reproducir'}
          </span>
        </button>

        {/* Visualización de onda */}
        {reproduciendo && (
          <div className={styles.ondaVisual}>
            <div className={styles.ondaBarra}></div>
            <div className={styles.ondaBarra}></div>
            <div className={styles.ondaBarra}></div>
            <div className={styles.ondaBarra}></div>
            <div className={styles.ondaBarra}></div>
          </div>
        )}

        {/* Control de volumen */}
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

      {/* Presets de frecuencia */}
      <div className={styles.presetsSection}>
        <h2 className={styles.presetsTitle}>Frecuencias de referencia</h2>
        <div className={styles.presetsGrid}>
          {FRECUENCIAS_PRESET.map((preset) => (
            <button
              key={preset.frecuencia}
              className={`${styles.presetBtn} ${frecuencia === preset.frecuencia ? styles.presetActivo : ''}`}
              onClick={() => seleccionarPreset(preset)}
            >
              <span className={styles.presetNombre}>{preset.nombre}</span>
              <span className={styles.presetDesc}>{preset.descripcion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frecuencia personalizada */}
      <div className={styles.customSection}>
        <h3 className={styles.customTitle}>Frecuencia personalizada</h3>
        <div className={styles.customControl}>
          <input
            type="range"
            min="400"
            max="480"
            step="1"
            value={frecuencia}
            onChange={(e) => setFrecuencia(parseInt(e.target.value))}
            className={styles.customSlider}
          />
          <input
            type="number"
            min="20"
            max="2000"
            value={frecuencia}
            onChange={(e) => setFrecuencia(Math.max(20, Math.min(2000, parseInt(e.target.value) || 440)))}
            className={styles.customInput}
          />
        </div>
      </div>

      {/* Tipo de onda */}
      <div className={styles.ondaSection}>
        <h3 className={styles.ondaTitle}>Tipo de onda</h3>
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

      {/* Información */}
      <div className={styles.infoSection}>
        <h2 className={styles.infoTitle}>Sobre el diapasón</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎵</span>
            <h4>La 440Hz</h4>
            <p>Es el estándar internacional de afinación desde 1939 (ISO 16). La mayoría de instrumentos y orquestas lo usan como referencia.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎻</span>
            <h4>Orquestas</h4>
            <p>Algunas orquestas europeas afinan a 442-443Hz para conseguir un sonido más brillante.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎼</span>
            <h4>Música barroca</h4>
            <p>Los instrumentos de época se afinan a 415Hz, aproximadamente un semitono por debajo del estándar.</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('diapason')} />
      <Footer appName="diapason" />
    </div>
  );
}
