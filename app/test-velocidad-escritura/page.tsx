'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './TestVelocidadEscritura.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

const TEXTOS_ESPANOL = [
  'El sol brillaba sobre las montañas mientras el viento suave acariciaba las hojas de los árboles. Era un día perfecto para caminar por el bosque y disfrutar de la naturaleza.',
  'La tecnología ha transformado nuestra forma de vivir y trabajar. Los ordenadores y teléfonos móviles se han convertido en herramientas esenciales para la comunicación diaria.',
  'España es un país con una rica historia y cultura. Desde las playas del Mediterráneo hasta las cumbres de los Pirineos, ofrece paisajes diversos y espectaculares.',
  'Aprender a escribir rápido es una habilidad muy útil en el mundo actual. La práctica constante y la paciencia son las claves para mejorar tu velocidad de mecanografía.',
  'Los libros son ventanas a otros mundos y épocas. La lectura nos permite viajar sin movernos del sitio y conocer las ideas de grandes pensadores de la historia.',
  'El cambio climático es uno de los mayores desafíos de nuestra generación. Reducir las emisiones de carbono y proteger los ecosistemas son tareas urgentes para todos.',
  'La música tiene el poder de cambiar nuestro estado de ánimo en segundos. Una melodía puede traernos recuerdos del pasado o inspirarnos para el futuro.',
  'El deporte no solo mejora nuestra salud física sino también la mental. El ejercicio regular reduce el estrés y aumenta la sensación de bienestar general.',
];

type GameState = 'idle' | 'playing' | 'finished';

interface Stats {
  ppm: number;
  precision: number;
  correctas: number;
  incorrectas: number;
  tiempo: number;
}

export default function TestVelocidadEscrituraPage() {
  const [texto, setTexto] = useState('');
  const [input, setInput] = useState('');
  const [estado, setEstado] = useState<GameState>('idle');
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [duracion, setDuracion] = useState(60);
  const [stats, setStats] = useState<Stats | null>(null);
  const [charIndex, setCharIndex] = useState(0);
  const [erroresActuales, setErroresActuales] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const seleccionarTexto = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * TEXTOS_ESPANOL.length);
    setTexto(TEXTOS_ESPANOL[randomIndex]);
  }, []);

  const iniciar = () => {
    seleccionarTexto();
    setInput('');
    setCharIndex(0);
    setErroresActuales(new Set());
    setEstado('playing');
    setTiempoRestante(duracion);
    setStats(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const calcularEstadisticas = useCallback(() => {
    const tiempoTranscurrido = duracion - tiempoRestante;
    const palabrasEscritas = input.trim().split(/\s+/).filter(Boolean).length;
    const minutosTranscurridos = tiempoTranscurrido / 60;
    const ppm = minutosTranscurridos > 0 ? Math.round(palabrasEscritas / minutosTranscurridos) : 0;

    let correctas = 0;
    let incorrectas = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === texto[i]) {
        correctas++;
      } else {
        incorrectas++;
      }
    }

    const precision = correctas + incorrectas > 0
      ? Math.round((correctas / (correctas + incorrectas)) * 100)
      : 100;

    return {
      ppm,
      precision,
      correctas,
      incorrectas,
      tiempo: tiempoTranscurrido,
    };
  }, [duracion, tiempoRestante, input, texto]);

  const finalizar = useCallback(() => {
    setEstado('finished');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStats(calcularEstadisticas());
  }, [calcularEstadisticas]);

  useEffect(() => {
    if (estado === 'playing' && tiempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            finalizar();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [estado, tiempoRestante, finalizar]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (estado !== 'playing') return;

    const value = e.target.value;
    setInput(value);
    setCharIndex(value.length);

    // Detectar errores
    const nuevosErrores = new Set<number>();
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== texto[i]) {
        nuevosErrores.add(i);
      }
    }
    setErroresActuales(nuevosErrores);

    // Si completó el texto
    if (value.length >= texto.length) {
      finalizar();
    }
  };

  const renderTexto = () => {
    return texto.split('').map((char, index) => {
      let className = styles.char;

      if (index < charIndex) {
        if (erroresActuales.has(index)) {
          className += ` ${styles.error}`;
        } else {
          className += ` ${styles.correct}`;
        }
      } else if (index === charIndex) {
        className += ` ${styles.current}`;
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const getPPMLevel = (ppm: number): { label: string; color: string } => {
    if (ppm < 20) return { label: 'Principiante', color: '#EF4444' };
    if (ppm < 40) return { label: 'Básico', color: '#F59E0B' };
    if (ppm < 60) return { label: 'Intermedio', color: '#10B981' };
    if (ppm < 80) return { label: 'Avanzado', color: '#3B82F6' };
    return { label: 'Experto', color: '#8B5CF6' };
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Test de Velocidad de Escritura</h1>
        <p className={styles.subtitle}>
          Mide tu velocidad en palabras por minuto (PPM) y mejora tu mecanografía
        </p>
      </header>

      <LegalNotice />

      {estado === 'idle' && (
        <div className={styles.setupPanel}>
          <h2>Configuración</h2>
          <div className={styles.durationSelector}>
            <span className={styles.label}>Duración del test:</span>
            <div className={styles.durationButtons}>
              {[30, 60, 120].map((d) => (
                <button
                  key={d}
                  className={`${styles.durationBtn} ${duracion === d ? styles.active : ''}`}
                  onClick={() => setDuracion(d)}
                >
                  {d} seg
                </button>
              ))}
            </div>
          </div>
          <button onClick={iniciar} className={styles.btnStart}>
            Comenzar Test
          </button>
        </div>
      )}

      {estado === 'playing' && (
        <div className={styles.gamePanel}>
          <div className={styles.timerBar}>
            <div className={styles.timer}>
              <span className={styles.timerIcon}>⏱️</span>
              <span className={styles.timerValue}>{tiempoRestante}s</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(charIndex / texto.length) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.textDisplay}>{renderTexto()}</div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            className={styles.inputField}
            placeholder="Empieza a escribir aquí..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          <button onClick={finalizar} className={styles.btnStop}>
            Terminar
          </button>
        </div>
      )}

      {estado === 'finished' && stats && (
        <div className={styles.resultsPanel}>
          <h2>Resultados</h2>

          <div className={styles.mainStat}>
            <span className={styles.ppmValue}>{stats.ppm}</span>
            <span className={styles.ppmLabel}>PPM</span>
            <span
              className={styles.ppmLevel}
              style={{ color: getPPMLevel(stats.ppm).color }}
            >
              {getPPMLevel(stats.ppm).label}
            </span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🎯</span>
              <span className={styles.statValue}>{stats.precision}%</span>
              <span className={styles.statLabel}>Precisión</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>✅</span>
              <span className={styles.statValue}>{stats.correctas}</span>
              <span className={styles.statLabel}>Correctas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>❌</span>
              <span className={styles.statValue}>{stats.incorrectas}</span>
              <span className={styles.statLabel}>Errores</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statValue}>{stats.tiempo}s</span>
              <span className={styles.statLabel}>Tiempo</span>
            </div>
          </div>

          <div className={styles.ppmScale}>
            <h4>Escala de velocidad (PPM)</h4>
            <div className={styles.scaleBar}>
              <div className={styles.scaleSegment} style={{ background: '#EF4444' }}>
                <span>0-20</span>
                <small>Principiante</small>
              </div>
              <div className={styles.scaleSegment} style={{ background: '#F59E0B' }}>
                <span>20-40</span>
                <small>Básico</small>
              </div>
              <div className={styles.scaleSegment} style={{ background: '#10B981' }}>
                <span>40-60</span>
                <small>Intermedio</small>
              </div>
              <div className={styles.scaleSegment} style={{ background: '#3B82F6' }}>
                <span>60-80</span>
                <small>Avanzado</small>
              </div>
              <div className={styles.scaleSegment} style={{ background: '#8B5CF6' }}>
                <span>80+</span>
                <small>Experto</small>
              </div>
            </div>
          </div>

          <button onClick={iniciar} className={styles.btnStart}>
            Intentar de nuevo
          </button>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('test-velocidad-escritura')} />

      <ShareCard appName="test-velocidad-escritura" />
      <Footer appName="test-velocidad-escritura" />
    </div>
  );
}
