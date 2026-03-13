'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './TemporizadorVisual.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Presets de tiempo en minutos
const PRESETS = [1, 2, 5, 10, 15, 20, 30];

// Radio y circunferencia del SVG
const RADIO = 120;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

// Estado del temporizador
type EstadoTimer = 'parado' | 'corriendo' | 'pausado' | 'terminado';

// Colores según porcentaje restante
function getColorTiempo(porcentaje: number): string {
  if (porcentaje > 60) return '#22C55E';   // Verde
  if (porcentaje > 40) return '#EAB308';   // Amarillo
  if (porcentaje > 20) return '#F97316';   // Naranja
  return '#EF4444';                        // Rojo
}

// Tono de aviso con Web Audio API
function reproducirAlerta() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    // Tres tonos ascendentes
    [0, 0.35, 0.7].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440 + i * 110;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.55);
    });
  } catch { /* ignorar si Web Audio no está disponible */ }
}

// Formatear segundos como MM:SS
function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TemporizadorVisualPage() {
  const [duracionMin, setDuracionMin] = useState(5);
  const [inputPersonalizado, setInputPersonalizado] = useState('');
  const [segundosRestantes, setSegundosRestantes] = useState(5 * 60);
  const [estado, setEstado] = useState<EstadoTimer>('parado');
  const [sonidoActivo, setSonidoActivo] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const segundosTotales = duracionMin * 60;
  const porcentajeRestante = segundosTotales > 0 ? (segundosRestantes / segundosTotales) * 100 : 0;
  const strokeOffset = CIRCUNFERENCIA * (1 - porcentajeRestante / 100);
  const colorActual = getColorTiempo(porcentajeRestante);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Tick del temporizador
  useEffect(() => {
    if (estado === 'corriendo') {
      intervalRef.current = setInterval(() => {
        setSegundosRestantes(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setEstado('terminado');
            if (sonidoActivo) reproducirAlerta();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [estado, sonidoActivo]);

  const seleccionarPreset = useCallback((min: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDuracionMin(min);
    setSegundosRestantes(min * 60);
    setEstado('parado');
    setInputPersonalizado('');
  }, []);

  const aplicarPersonalizado = () => {
    const min = parseInt(inputPersonalizado, 10);
    if (!isNaN(min) && min >= 1 && min <= 180) {
      seleccionarPreset(min);
    }
  };

  const iniciarPausar = () => {
    if (estado === 'terminado') return;
    if (estado === 'corriendo') {
      setEstado('pausado');
    } else {
      setEstado('corriendo');
    }
  };

  const resetear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSegundosRestantes(duracionMin * 60);
    setEstado('parado');
  };

  // Etiqueta del botón principal
  const etiquetaBotonPrincipal = (): string => {
    if (estado === 'corriendo') return '⏸ Pausar';
    if (estado === 'pausado') return '▶ Continuar';
    if (estado === 'terminado') return '✅ Terminado';
    return '▶ Iniciar';
  };

  // Mensaje de estado
  const mensajeEstado = (): string => {
    if (estado === 'terminado') return '¡Tiempo terminado!';
    if (estado === 'corriendo') return 'Tiempo en marcha...';
    if (estado === 'pausado') return 'En pausa';
    return 'Listo para empezar';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⏱️ Temporizador Visual</h1>
        <p className={styles.subtitle}>
          Elige cuánto tiempo quieres y pulsa Iniciar.
          El círculo te muestra cuánto queda.
        </p>
      </header>

      <LegalNotice />

      {/* Presets de tiempo */}
      <section className={styles.presets} aria-label="Tiempos predefinidos">
        <h2 className={styles.seccionTitulo}>¿Cuánto tiempo?</h2>
        <div className={styles.presetBtns} role="group" aria-label="Seleccionar duración">
          {PRESETS.map(min => (
            <button
              key={min}
              className={`${styles.presetBtn} ${duracionMin === min && inputPersonalizado === '' ? styles.presetActivo : ''}`}
              onClick={() => seleccionarPreset(min)}
              aria-pressed={duracionMin === min && inputPersonalizado === ''}
              aria-label={`${min} ${min === 1 ? 'minuto' : 'minutos'}`}
            >
              <span className={styles.presetNum}>{min}</span>
              <span className={styles.presetLabel}>min</span>
            </button>
          ))}
        </div>

        {/* Tiempo personalizado */}
        <div className={styles.personalizado}>
          <input
            type="number"
            className={styles.inputPersonalizado}
            value={inputPersonalizado}
            onChange={e => setInputPersonalizado(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && aplicarPersonalizado()}
            placeholder="Otro tiempo..."
            min={1}
            max={180}
            aria-label="Tiempo personalizado en minutos"
          />
          <button
            className={styles.btnPersonalizado}
            onClick={aplicarPersonalizado}
            aria-label="Aplicar tiempo personalizado"
          >
            Aplicar
          </button>
        </div>
      </section>

      {/* Círculo temporizador */}
      <section className={styles.timerSection} aria-label="Temporizador">
        <div
          className={`${styles.timerContainer} ${estado === 'terminado' ? styles.terminado : ''}`}
          role="timer"
          aria-live="polite"
          aria-label={`Tiempo restante: ${formatearTiempo(segundosRestantes)}`}
        >
          <svg
            className={styles.timerSvg}
            viewBox="0 0 300 300"
            aria-hidden="true"
          >
            {/* Pista de fondo */}
            <circle
              cx="150"
              cy="150"
              r={RADIO}
              fill="none"
              strokeWidth="18"
              className={styles.svgPista}
            />
            {/* Arco de progreso */}
            <circle
              cx="150"
              cy="150"
              r={RADIO}
              fill="none"
              strokeWidth="18"
              stroke={colorActual}
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              transform="rotate(-90 150 150)"
              style={{ transition: estado === 'corriendo' ? 'stroke-dashoffset 1s linear, stroke 0.5s ease' : 'none' }}
            />
            {/* Tiempo restante */}
            <text
              x="150"
              y="145"
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.svgTiempo}
              fill={colorActual}
            >
              {formatearTiempo(segundosRestantes)}
            </text>
            {/* Etiqueta de estado */}
            <text
              x="150"
              y="188"
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.svgEstado}
            >
              {mensajeEstado()}
            </text>
          </svg>
        </div>

        {/* Botones de control */}
        <div className={styles.controles}>
          <button
            className={`${styles.btnControl} ${styles.btnPrincipal} ${estado === 'terminado' ? styles.btnTerminado : ''}`}
            onClick={iniciarPausar}
            disabled={estado === 'terminado'}
            aria-label={etiquetaBotonPrincipal()}
          >
            {etiquetaBotonPrincipal()}
          </button>

          <button
            className={`${styles.btnControl} ${styles.btnReset}`}
            onClick={resetear}
            aria-label="Reiniciar temporizador"
          >
            🔄 Reiniciar
          </button>
        </div>

        {/* Toggle sonido */}
        <div className={styles.sonidoToggle}>
          <button
            className={`${styles.btnSonido} ${sonidoActivo ? styles.sonidoOn : styles.sonidoOff}`}
            onClick={() => setSonidoActivo(prev => !prev)}
            aria-pressed={sonidoActivo}
            aria-label={sonidoActivo ? 'Sonido activado, pulsar para desactivar' : 'Sonido desactivado, pulsar para activar'}
          >
            {sonidoActivo ? '🔔 Sonido activado' : '🔕 Sonido desactivado'}
          </button>
        </div>
      </section>

      <EducationalSection
        title="📚 ¿Para qué sirve el temporizador visual?"
        subtitle="Información sobre el uso de temporizadores en personas con necesidades especiales"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Por qué un temporizador visual?</h2>
          <p>
            Muchas personas con autismo, TDAH u otras condiciones cognitivas tienen dificultades
            para percibir el paso del tiempo. El tiempo abstracto es difícil de comprender,
            pero un círculo que se vacía y cambia de color es concreto y fácil de entender.
          </p>

          <h2>Usos habituales</h2>
          <ul>
            <li><strong>Transiciones</strong>: Avisar cuánto falta para cambiar de actividad</li>
            <li><strong>Tareas</strong>: Limitar el tiempo dedicado a una actividad</li>
            <li><strong>Descansos</strong>: Marcar el tiempo de pausa entre actividades</li>
            <li><strong>Rutinas</strong>: Dar estructura temporal a la jornada</li>
            <li><strong>Deberes</strong>: Trabajar en bloques cortos con descanso entre ellos</li>
          </ul>

          <h2>El significado de los colores</h2>
          <ul>
            <li><strong style={{ color: '#22C55E' }}>Verde</strong>: Queda mucho tiempo, estás bien</li>
            <li><strong style={{ color: '#EAB308' }}>Amarillo</strong>: Ya has pasado la mitad</li>
            <li><strong style={{ color: '#F97316' }}>Naranja</strong>: Queda poco tiempo, prepárate</li>
            <li><strong style={{ color: '#EF4444' }}>Rojo</strong>: Quedan muy pocos minutos</li>
          </ul>

          <h2>Consejos de uso</h2>
          <ul>
            <li>Empieza con tiempos cortos (1-5 min) hasta que la persona se familiarice</li>
            <li>Usa el sonido si ayuda a la persona, desactívalo si le resulta molesto</li>
            <li>El botón Reiniciar siempre vuelve al tiempo seleccionado</li>
            <li>Combínalo con el Planificador de Rutinas para una jornada estructurada</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('temporizador-visual')} />
      <Footer appName="temporizador-visual" />
    </div>
  );
}
