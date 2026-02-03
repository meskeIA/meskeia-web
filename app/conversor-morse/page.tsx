'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './ConversorMorse.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Diccionario Morse internacional
const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/',
};

// Diccionario inverso
const MORSE_TO_TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

type ModoType = 'texto-morse' | 'morse-texto';

export default function ConversorMorsePage() {
  const [modo, setModo] = useState<ModoType>('texto-morse');
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [reproduciendo, setReproduciendo] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopRef = useRef(false);

  const textoAMorse = (texto: string): string => {
    return texto
      .toUpperCase()
      .split('')
      .map(char => MORSE_CODE[char] || char)
      .join(' ');
  };

  const morseATexto = (morse: string): string => {
    return morse
      .split(' ')
      .map(code => {
        if (code === '/') return ' ';
        if (code === '') return '';
        return MORSE_TO_TEXT[code] || code;
      })
      .join('');
  };

  const convertir = () => {
    if (modo === 'texto-morse') {
      setSalida(textoAMorse(entrada));
    } else {
      setSalida(morseATexto(entrada));
    }
  };

  const intercambiar = () => {
    setModo(modo === 'texto-morse' ? 'morse-texto' : 'texto-morse');
    setEntrada(salida);
    setSalida(entrada);
  };

  const limpiar = () => {
    setEntrada('');
    setSalida('');
  };

  const copiarResultado = async () => {
    if (salida) {
      await navigator.clipboard.writeText(salida);
    }
  };

  // Reproducir sonido Morse
  const reproducirMorse = useCallback(async () => {
    const morseCode = modo === 'texto-morse' ? salida : textoAMorse(entrada);
    if (!morseCode || reproduciendo) return;

    setReproduciendo(true);
    stopRef.current = false;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    const DOT_DURATION = 0.1; // 100ms para punto
    const DASH_DURATION = DOT_DURATION * 3;
    const SYMBOL_GAP = DOT_DURATION;
    const LETTER_GAP = DOT_DURATION * 3;
    const WORD_GAP = DOT_DURATION * 7;

    const playTone = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopRef.current) {
          resolve();
          return;
        }
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
        setTimeout(resolve, duration * 1000);
      });
    };

    const wait = (duration: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopRef.current) {
          resolve();
          return;
        }
        setTimeout(resolve, duration * 1000);
      });
    };

    for (const char of morseCode) {
      if (stopRef.current) break;
      if (char === '.') {
        await playTone(DOT_DURATION);
        await wait(SYMBOL_GAP);
      } else if (char === '-') {
        await playTone(DASH_DURATION);
        await wait(SYMBOL_GAP);
      } else if (char === ' ') {
        await wait(LETTER_GAP);
      } else if (char === '/') {
        await wait(WORD_GAP);
      }
    }

    setReproduciendo(false);
  }, [modo, salida, entrada, reproduciendo]);

  const detenerReproduccion = () => {
    stopRef.current = true;
    setReproduciendo(false);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Código Morse</h1>
        <p className={styles.subtitle}>
          Traduce texto a código Morse y viceversa con reproducción de sonido
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${modo === 'texto-morse' ? styles.active : ''}`}
            onClick={() => setModo('texto-morse')}
          >
            Texto → Morse
          </button>
          <button
            className={`${styles.modeBtn} ${modo === 'morse-texto' ? styles.active : ''}`}
            onClick={() => setModo('morse-texto')}
          >
            Morse → Texto
          </button>
        </div>

        <div className={styles.converterBox}>
          <div className={styles.inputSection}>
            <label className={styles.label}>
              {modo === 'texto-morse' ? 'Texto' : 'Código Morse'}
            </label>
            <textarea
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder={modo === 'texto-morse'
                ? 'Escribe tu mensaje aquí...'
                : 'Introduce código Morse (usa . y -, espacio entre letras, / entre palabras)'}
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.buttonRow}>
            <button onClick={convertir} className={styles.btnPrimary}>
              Convertir
            </button>
            <button onClick={intercambiar} className={styles.btnSwap} title="Intercambiar">
              ⇄
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>

          <div className={styles.outputSection}>
            <label className={styles.label}>
              {modo === 'texto-morse' ? 'Código Morse' : 'Texto'}
            </label>
            <div className={styles.outputBox}>
              {salida || 'El resultado aparecerá aquí...'}
            </div>
            <div className={styles.outputActions}>
              <button onClick={copiarResultado} className={styles.btnAction} disabled={!salida}>
                📋 Copiar
              </button>
              {!reproduciendo ? (
                <button onClick={reproducirMorse} className={styles.btnAction} disabled={!salida && !entrada}>
                  🔊 Reproducir sonido
                </button>
              ) : (
                <button onClick={detenerReproduccion} className={styles.btnStop}>
                  ⏹ Detener
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className={styles.alphabetSection}>
        <h2>Alfabeto Morse Internacional</h2>
        <div className={styles.alphabetGrid}>
          {Object.entries(MORSE_CODE).slice(0, 36).map(([char, code]) => (
            <div key={char} className={styles.alphabetItem}>
              <span className={styles.char}>{char === ' ' ? '␣' : char}</span>
              <span className={styles.code}>{code}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.infoSection}>
        <h2>¿Qué es el Código Morse?</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>📡 Historia</h3>
            <p>
              Inventado por Samuel Morse en 1837, fue el primer sistema de comunicación
              eléctrica de larga distancia. Revolucionó las telecomunicaciones.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>🆘 SOS</h3>
            <p>
              La señal de socorro internacional SOS (... --- ...) se eligió por ser
              fácil de recordar y transmitir, no como acrónimo.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3>⏱️ Tiempos</h3>
            <p>
              Un punto dura 1 unidad, una raya 3 unidades. Entre símbolos 1 unidad,
              entre letras 3 unidades, entre palabras 7 unidades.
            </p>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('conversor-morse')} />

      <Footer appName="conversor-morse" />
    </div>
  );
}
