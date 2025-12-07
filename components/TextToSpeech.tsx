'use client';

import { useState, useEffect, RefObject } from 'react';
import styles from './TextToSpeech.module.css';

interface TextToSpeechProps {
  /** Referencia al elemento HTML cuyo contenido de texto se leerá */
  contentRef: RefObject<HTMLDivElement | null>;
  /** Identificador único para limpiar la síntesis al cambiar (ej: chapterId) */
  resetKey?: string;
  /** Velocidad de lectura (0.5 - 2, default: 0.95) */
  rate?: number;
  /** Idioma de la voz (default: 'es-ES') */
  lang?: string;
}

/**
 * Componente TextToSpeech - Lectura en voz alta del contenido
 *
 * Usa la Web Speech API nativa del navegador para leer el contenido
 * del elemento referenciado por contentRef.
 *
 * @example
 * ```tsx
 * import { TextToSpeech } from '@/components';
 *
 * const contentRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={contentRef}>
 *   {contenido a leer}
 * </div>
 * <TextToSpeech contentRef={contentRef} resetKey={chapterId} />
 * ```
 */
export default function TextToSpeech({
  contentRef,
  resetKey,
  rate = 0.95,
  lang = 'es-ES'
}: TextToSpeechProps) {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  // Verificar soporte de TTS al montar
  useEffect(() => {
    setTtsSupported('speechSynthesis' in window);
  }, []);

  // Limpiar síntesis al desmontar o cambiar de página/capítulo
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [resetKey]);

  const handleReadAloud = () => {
    if (!ttsSupported) return;

    if (isReading && !isPaused) {
      // Pausar
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isReading && isPaused) {
      // Reanudar
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Iniciar lectura
      window.speechSynthesis.cancel();

      const content = contentRef.current?.textContent || '';
      if (!content.trim()) return;

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = 1;

      // Buscar voz en el idioma especificado
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = lang.split('-')[0];
      const matchingVoice = voices.find(v => v.lang.startsWith(langPrefix)) || voices[0];
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsReading(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsReading(true);
      setIsPaused(false);
    }
  };

  const handleStopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
    }
  };

  // No renderizar si TTS no está soportado
  if (!ttsSupported) {
    return null;
  }

  return (
    <div className={styles.ttsControls}>
      <button
        type="button"
        onClick={handleReadAloud}
        className={`${styles.ttsButton} ${isReading ? styles.ttsActive : ''}`}
        title={isReading ? (isPaused ? 'Reanudar lectura' : 'Pausar lectura') : 'Leer en voz alta'}
        aria-label={isReading ? (isPaused ? 'Reanudar lectura' : 'Pausar lectura') : 'Leer en voz alta'}
      >
        {isReading ? (isPaused ? '▶️' : '⏸️') : '🔊'}
        <span className={styles.ttsLabel}>
          {isReading ? (isPaused ? 'Reanudar' : 'Pausar') : 'Escuchar'}
        </span>
      </button>
      {isReading && (
        <button
          type="button"
          onClick={handleStopReading}
          className={styles.ttsStopButton}
          title="Detener lectura"
          aria-label="Detener lectura"
        >
          ⏹️
        </button>
      )}
    </div>
  );
}
