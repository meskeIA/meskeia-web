'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
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
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Verificar soporte de TTS y cargar voces al montar
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setTtsSupported(false);
      return;
    }

    setTtsSupported(true);

    // Detectar si es móvil (pause/resume no funciona bien en Android)
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    // Función para cargar voces (necesario porque en móviles cargan async)
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
        setVoicesLoaded(true);
      }
    };

    // Intentar cargar voces inmediatamente
    loadVoices();

    // En móviles, las voces se cargan después - escuchar el evento
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Fallback: reintentar después de un delay (algunos Android lo necesitan)
    const fallbackTimer = setTimeout(loadVoices, 500);

    return () => {
      clearTimeout(fallbackTimer);
      window.speechSynthesis.onvoiceschanged = null;
    };
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

    // En móviles: solo play/stop (pause/resume no funciona bien en Android)
    if (isMobile && isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      return;
    }

    // En PC: funcionalidad completa con pause/resume
    if (isReading && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    } else if (isReading && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    } else {
      // Iniciar lectura
      window.speechSynthesis.cancel();

      const content = contentRef.current?.textContent || '';

      // DEBUG: Mostrar información en móviles (TEMPORAL - quitar después)
      const debugInfo = `Chars: ${content.length}, Voces: ${voicesRef.current.length}`;
      console.log('TTS Debug:', debugInfo);
      // alert(debugInfo); // Descomentar para debug en móvil

      // Si no hay contenido, probar con texto de prueba
      if (!content.trim()) {
        console.warn('TTS: No hay contenido en contentRef');
        // Intentar con texto de prueba para verificar que TTS funciona
        const testUtterance = new SpeechSynthesisUtterance('Prueba de audio');
        testUtterance.lang = lang;
        window.speechSynthesis.speak(testUtterance);
        return;
      }

      // MÓVILES: Límite de ~4000 chars por utterance en Android
      // Dividir en chunks si es necesario
      const MAX_CHARS = 3000; // Dejamos margen de seguridad
      const textToSpeak = content.length > MAX_CHARS
        ? content.substring(0, MAX_CHARS) + '...'
        : content;

      // MÓVILES: Crear utterance SINCRÓNICAMENTE en el handler del click
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = 1;

      // Usar voces pre-cargadas (voicesRef) o intentar obtenerlas de nuevo
      const voices = voicesRef.current.length > 0
        ? voicesRef.current
        : window.speechSynthesis.getVoices();

      const langPrefix = lang.split('-')[0];
      const matchingVoice = voices.find(v => v.lang.startsWith(langPrefix)) || voices[0];
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        // Confirmar que la lectura ha comenzado
        console.log('TTS: Lectura iniciada');
        setIsReading(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        console.log('TTS: Lectura finalizada');
        setIsReading(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        // En móviles, algunos errores son recuperables
        if (event.error === 'interrupted' || event.error === 'canceled') {
          return;
        }
        console.error('TTS Error:', event.error);
        // alert('Error TTS: ' + event.error); // Descomentar para debug
        setIsReading(false);
        setIsPaused(false);
      };

      // CRÍTICO PARA MÓVILES: speak() debe ejecutarse síncronamente en el click
      setIsReading(true);
      setIsPaused(false);

      // Pequeño delay puede ayudar en algunos Android
      window.speechSynthesis.speak(utterance);
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

  // Mostrar indicador de carga mientras las voces no están listas (móviles)
  const getButtonLabel = () => {
    if (!voicesLoaded) return 'Cargando...';
    if (!isReading) return 'Escuchar';
    // En móvil: solo Detener. En PC: Pausar/Reanudar
    if (isMobile) return 'Detener';
    return isPaused ? 'Reanudar' : 'Pausar';
  };

  const getButtonIcon = () => {
    if (!voicesLoaded) return '⏳';
    if (!isReading) return '🔊';
    // En móvil: icono de stop. En PC: pause/play
    if (isMobile) return '⏹️';
    return isPaused ? '▶️' : '⏸️';
  };

  const buttonLabel = getButtonLabel();
  const buttonIcon = getButtonIcon();

  return (
    <div className={styles.ttsControls}>
      <button
        type="button"
        onClick={handleReadAloud}
        className={`${styles.ttsButton} ${isReading ? styles.ttsActive : ''}`}
        title={isReading ? (isPaused ? 'Reanudar lectura' : 'Pausar lectura') : 'Leer en voz alta'}
        aria-label={isReading ? (isPaused ? 'Reanudar lectura' : 'Pausar lectura') : 'Leer en voz alta'}
        disabled={!voicesLoaded && !isReading}
      >
        {buttonIcon}
        <span className={styles.ttsLabel}>
          {buttonLabel}
        </span>
      </button>
      {/* Botón de stop separado solo en PC (en móvil el botón principal ya hace stop) */}
      {isReading && !isMobile && (
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
