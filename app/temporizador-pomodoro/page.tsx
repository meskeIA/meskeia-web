'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './TemporizadorPomodoro.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroStats {
  pomodorosToday: number;
  pomodorosWeek: number;
  totalMinutesToday: number;
  lastResetDate: string;
  lastResetWeek: string;
}

interface PomodoroConfig {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  soundVolume: number;
}

const DEFAULT_CONFIG: PomodoroConfig = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  soundVolume: 0.5,
};

const PRESETS = [
  { name: 'Clásico', work: 25, short: 5, long: 15 },
  { name: 'Corto', work: 15, short: 3, long: 10 },
  { name: 'Largo', work: 50, short: 10, long: 30 },
  { name: 'Ultra', work: 90, short: 15, long: 30 },
];

export default function TemporizadorPomodoroPage() {
  const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_CONFIG.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [stats, setStats] = useState<PomodoroStats>({
    pomodorosToday: 0,
    pomodorosWeek: 0,
    totalMinutesToday: 0,
    lastResetDate: '',
    lastResetWeek: '',
  });
  const [showConfig, setShowConfig] = useState(false);
  const [currentTask, setCurrentTask] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar configuración y estadísticas del localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('pomodoroConfig');
    const savedStats = localStorage.getItem('pomodoroStats');
    const savedTask = localStorage.getItem('pomodoroCurrentTask');

    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      setTimeLeft(parsed.workMinutes * 60);
    }

    if (savedStats) {
      const parsed: PomodoroStats = JSON.parse(savedStats);
      const today = new Date().toDateString();
      const currentWeek = getWeekNumber(new Date());

      // Reset diario
      if (parsed.lastResetDate !== today) {
        parsed.pomodorosToday = 0;
        parsed.totalMinutesToday = 0;
        parsed.lastResetDate = today;
      }

      // Reset semanal
      if (parsed.lastResetWeek !== currentWeek) {
        parsed.pomodorosWeek = 0;
        parsed.lastResetWeek = currentWeek;
      }

      setStats(parsed);
    }

    if (savedTask) {
      setCurrentTask(savedTask);
    }

    // Crear elemento de audio
    audioRef.current = new Audio();
  }, []);

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem('pomodoroConfig', JSON.stringify(config));
  }, [config]);

  // Guardar estadísticas
  useEffect(() => {
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
  }, [stats]);

  // Guardar tarea actual
  useEffect(() => {
    localStorage.setItem('pomodoroCurrentTask', currentTask);
  }, [currentTask]);

  // Obtener número de semana
  const getWeekNumber = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
  };

  // Reproducir sonido
  const playSound = useCallback(() => {
    if (config.soundEnabled && audioRef.current) {
      // Crear sonido de campana usando Web Audio API
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 830;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(config.soundVolume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);

      // Segunda campana
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 830;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(config.soundVolume, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 1);
      }, 300);
    }
  }, [config.soundEnabled, config.soundVolume]);

  // Completar sesión
  const completeSession = useCallback(() => {
    playSound();
    setIsRunning(false);

    if (sessionType === 'work') {
      const newPomodorosCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newPomodorosCompleted);

      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        pomodorosToday: prev.pomodorosToday + 1,
        pomodorosWeek: prev.pomodorosWeek + 1,
        totalMinutesToday: prev.totalMinutesToday + config.workMinutes,
        lastResetDate: new Date().toDateString(),
        lastResetWeek: getWeekNumber(new Date()),
      }));

      // Determinar siguiente descanso
      if (newPomodorosCompleted % config.pomodorosUntilLongBreak === 0) {
        setSessionType('longBreak');
        setTimeLeft(config.longBreakMinutes * 60);
        if (config.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 500);
        }
      } else {
        setSessionType('shortBreak');
        setTimeLeft(config.shortBreakMinutes * 60);
        if (config.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 500);
        }
      }
    } else {
      // Fin de descanso
      setSessionType('work');
      setTimeLeft(config.workMinutes * 60);
      if (config.autoStartWork) {
        setTimeout(() => setIsRunning(true), 500);
      }
    }
  }, [sessionType, pomodorosCompleted, config, playSound]);

  // Timer principal
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      completeSession();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, completeSession]);

  // Actualizar título de la página
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const sessionEmoji = sessionType === 'work' ? '🍅' : '☕';
    document.title = `${timeString} ${sessionEmoji} Pomodoro - meskeIA`;

    return () => {
      document.title = 'Temporizador Pomodoro - meskeIA';
    };
  }, [timeLeft, sessionType]);

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Controles
  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    if (sessionType === 'work') {
      setTimeLeft(config.workMinutes * 60);
    } else if (sessionType === 'shortBreak') {
      setTimeLeft(config.shortBreakMinutes * 60);
    } else {
      setTimeLeft(config.longBreakMinutes * 60);
    }
  };

  const skipSession = () => {
    setIsRunning(false);
    if (sessionType === 'work') {
      setSessionType('shortBreak');
      setTimeLeft(config.shortBreakMinutes * 60);
    } else {
      setSessionType('work');
      setTimeLeft(config.workMinutes * 60);
    }
  };

  const changeSessionType = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    if (type === 'work') {
      setTimeLeft(config.workMinutes * 60);
    } else if (type === 'shortBreak') {
      setTimeLeft(config.shortBreakMinutes * 60);
    } else {
      setTimeLeft(config.longBreakMinutes * 60);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setConfig(prev => ({
      ...prev,
      workMinutes: preset.work,
      shortBreakMinutes: preset.short,
      longBreakMinutes: preset.long,
    }));
    if (sessionType === 'work') {
      setTimeLeft(preset.work * 60);
    } else if (sessionType === 'shortBreak') {
      setTimeLeft(preset.short * 60);
    } else {
      setTimeLeft(preset.long * 60);
    }
  };

  const resetStats = () => {
    if (confirm('¿Resetear todas las estadísticas?')) {
      setStats({
        pomodorosToday: 0,
        pomodorosWeek: 0,
        totalMinutesToday: 0,
        lastResetDate: new Date().toDateString(),
        lastResetWeek: getWeekNumber(new Date()),
      });
      setPomodorosCompleted(0);
    }
  };

  // Calcular progreso
  const totalTime = sessionType === 'work'
    ? config.workMinutes * 60
    : sessionType === 'shortBreak'
      ? config.shortBreakMinutes * 60
      : config.longBreakMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Obtener etiqueta de sesión
  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work': return 'Concentración';
      case 'shortBreak': return 'Descanso corto';
      case 'longBreak': return 'Descanso largo';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Temporizador Pomodoro</h1>
        <p className={styles.subtitle}>
          Mejora tu productividad con sesiones de concentración y descansos programados
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel del Timer */}
        <div className={styles.timerPanel}>
          {/* Selector de tipo de sesión */}
          <div className={styles.sessionSelector}>
            <button
              type="button"
              className={`${styles.sessionBtn} ${sessionType === 'work' ? styles.active : ''}`}
              onClick={() => changeSessionType('work')}
              aria-pressed={sessionType === 'work'}
            >
              Concentración
            </button>
            <button
              type="button"
              className={`${styles.sessionBtn} ${sessionType === 'shortBreak' ? styles.active : ''}`}
              onClick={() => changeSessionType('shortBreak')}
              aria-pressed={sessionType === 'shortBreak'}
            >
              Descanso corto
            </button>
            <button
              type="button"
              className={`${styles.sessionBtn} ${sessionType === 'longBreak' ? styles.active : ''}`}
              onClick={() => changeSessionType('longBreak')}
              aria-pressed={sessionType === 'longBreak'}
            >
              Descanso largo
            </button>
          </div>

          {/* Timer circular */}
          <div className={styles.timerContainer}>
            <svg className={styles.timerSvg} viewBox="0 0 200 200">
              {/* Círculo de fondo */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--border)"
                strokeWidth="8"
              />
              {/* Círculo de progreso */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={sessionType === 'work' ? 'var(--primary)' : 'var(--secondary)'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                transform="rotate(-90 100 100)"
                className={styles.progressCircle}
              />
            </svg>
            <div className={styles.timerDisplay}>
              <span className={styles.sessionLabel}>{getSessionLabel()}</span>
              <span className={styles.timeDisplay}>{formatTime(timeLeft)}</span>
              <span className={styles.pomodoroCount}>
                {Array.from({ length: config.pomodorosUntilLongBreak }).map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.pomodoroIndicator} ${i < (pomodorosCompleted % config.pomodorosUntilLongBreak) ? styles.completed : ''}`}
                  >
                    {i < (pomodorosCompleted % config.pomodorosUntilLongBreak) ? '🍅' : '○'}
                  </span>
                ))}
              </span>
            </div>
          </div>

          {/* Campo de tarea actual */}
          <div className={styles.taskInput}>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="¿En qué estás trabajando?"
              className={styles.taskField}
            />
          </div>

          {/* Controles */}
          <div className={styles.controls}>
            <button type="button" onClick={resetTimer} className={styles.controlBtn} title="Reiniciar" aria-label="Reiniciar temporizador">
              ↺
            </button>
            <button
              type="button"
              onClick={toggleTimer}
              className={`${styles.mainBtn} ${isRunning ? styles.pause : styles.play}`}
            >
              {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button type="button" onClick={skipSession} className={styles.controlBtn} title="Saltar" aria-label="Saltar sesión">
              ⏭
            </button>
          </div>

          {/* Botón de configuración */}
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={styles.configToggle}
            aria-pressed={showConfig}
          >
            <span aria-hidden="true">⚙️</span> {showConfig ? 'Ocultar' : 'Configuración'}
          </button>
        </div>

        {/* Panel lateral */}
        <div className={styles.sidePanel}>
          {/* Estadísticas */}
          <div className={styles.statsCard}>
            <h3>Estadísticas</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{stats.pomodorosToday}</span>
                <span className={styles.statLabel}>Hoy</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{stats.pomodorosWeek}</span>
                <span className={styles.statLabel}>Esta semana</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{Math.round(stats.totalMinutesToday / 60 * 10) / 10}h</span>
                <span className={styles.statLabel}>Tiempo hoy</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{pomodorosCompleted}</span>
                <span className={styles.statLabel}>Sesión actual</span>
              </div>
            </div>
            <button type="button" onClick={resetStats} className={styles.resetStatsBtn}>
              Resetear estadísticas
            </button>
          </div>

          {/* Configuración (condicional) */}
          {showConfig && (
            <div className={styles.configCard}>
              <h3>Configuración</h3>

              {/* Presets */}
              <div className={styles.presets}>
                <label>Presets:</label>
                <div className={styles.presetButtons}>
                  {PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={styles.presetBtn}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiempos personalizados */}
              <div className={styles.configGroup}>
                <label>
                  Concentración: {config.workMinutes} min
                  <input
                    type="range"
                    min="1"
                    max="120"
                    value={config.workMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setConfig(prev => ({ ...prev, workMinutes: val }));
                      if (sessionType === 'work' && !isRunning) {
                        setTimeLeft(val * 60);
                      }
                    }}
                  />
                </label>
              </div>

              <div className={styles.configGroup}>
                <label>
                  Descanso corto: {config.shortBreakMinutes} min
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={config.shortBreakMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setConfig(prev => ({ ...prev, shortBreakMinutes: val }));
                      if (sessionType === 'shortBreak' && !isRunning) {
                        setTimeLeft(val * 60);
                      }
                    }}
                  />
                </label>
              </div>

              <div className={styles.configGroup}>
                <label>
                  Descanso largo: {config.longBreakMinutes} min
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={config.longBreakMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setConfig(prev => ({ ...prev, longBreakMinutes: val }));
                      if (sessionType === 'longBreak' && !isRunning) {
                        setTimeLeft(val * 60);
                      }
                    }}
                  />
                </label>
              </div>

              <div className={styles.configGroup}>
                <label>
                  Pomodoros hasta descanso largo: {config.pomodorosUntilLongBreak}
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={config.pomodorosUntilLongBreak}
                    onChange={(e) => setConfig(prev => ({ ...prev, pomodorosUntilLongBreak: parseInt(e.target.value) }))}
                  />
                </label>
              </div>

              {/* Opciones */}
              <div className={styles.configOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.autoStartBreaks}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                  />
                  Auto-iniciar descansos
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.autoStartWork}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoStartWork: e.target.checked }))}
                  />
                  Auto-iniciar trabajo
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.soundEnabled}
                    onChange={(e) => setConfig(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  />
                  Sonido activado
                </label>
              </div>

              {config.soundEnabled && (
                <div className={styles.configGroup}>
                  <label>
                    Volumen: {Math.round(config.soundVolume * 100)}%
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.soundVolume}
                      onChange={(e) => setConfig(prev => ({ ...prev, soundVolume: parseFloat(e.target.value) }))}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={playSound}
                    className={styles.testSoundBtn}
                  >
                    <span aria-hidden="true">🔔</span> Probar sonido
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres dominar la Técnica Pomodoro?"
        subtitle="Descubre cómo maximizar tu productividad con sesiones de concentración efectivas"
        icon="🍅"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es la Técnica Pomodoro?</h2>
          <p className={styles.introParagraph}>
            La Técnica Pomodoro fue desarrollada por Francesco Cirillo a finales de los años 80.
            El nombre viene del temporizador de cocina con forma de tomate (pomodoro en italiano)
            que usaba durante sus estudios universitarios.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>1. Elige una tarea</h4>
              <p>Selecciona algo en lo que quieras trabajar. Puede ser grande o pequeña, lo importante es dedicarle atención completa.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>2. Pon el temporizador</h4>
              <p>Configura 25 minutos (un "pomodoro"). Este tiempo es lo suficientemente corto para mantener el enfoque pero largo para avanzar significativamente.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>3. Trabaja sin interrupciones</h4>
              <p>Concentra toda tu atención en la tarea. Si surge algo urgente, anótalo y vuelve al trabajo.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>4. Toma un descanso corto</h4>
              <p>Al terminar el pomodoro, descansa 5 minutos. Levántate, estira, bebe agua. Tu cerebro necesita procesar.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>5. Cada 4 pomodoros, descanso largo</h4>
              <p>Después de 4 sesiones de trabajo, toma un descanso de 15-30 minutos para recargar energías.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>6. Repite y mejora</h4>
              <p>Con el tiempo, aprenderás cuántos pomodoros necesitas para cada tipo de tarea.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Beneficios comprobados</h2>
          <div className={styles.benefitsList}>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>🎯</span>
              <div>
                <h4>Mayor enfoque</h4>
                <p>Al trabajar en intervalos cortos, es más fácil mantener la concentración total.</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>⚡</span>
              <div>
                <h4>Menos fatiga mental</h4>
                <p>Los descansos regulares previenen el agotamiento y mantienen la mente fresca.</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>📊</span>
              <div>
                <h4>Mejor estimación</h4>
                <p>Aprendes cuánto tiempo real necesitan tus tareas, mejorando tu planificación.</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>🏆</span>
              <div>
                <h4>Sensación de logro</h4>
                <p>Completar pomodoros da satisfacción inmediata y motiva a seguir adelante.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos avanzados</h2>
          <ul className={styles.tipsList}>
            <li><strong>Protege el pomodoro:</strong> Si alguien te interrumpe, di "estoy en un pomodoro, te contacto en X minutos".</li>
            <li><strong>Anota las distracciones:</strong> Ten un papel para apuntar pensamientos que surjan y así no perder el hilo.</li>
            <li><strong>Ajusta los tiempos:</strong> El 25/5 es un punto de partida. Algunos prefieren 50/10 o 15/3.</li>
            <li><strong>No rompas la cadena:</strong> Intenta mantener rachas de días usando la técnica.</li>
            <li><strong>Revisa al final del día:</strong> ¿Cuántos pomodoros completaste? ¿Qué funcionó mejor?</li>
          </ul>
        </section>

        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de técnicas de gestión del tiempo</h2>
          <p className={styles.introParagraph}>
            El Pomodoro no es la única técnica. Conocer las alternativas te ayuda a elegir la que mejor encaja con tu trabajo y personalidad.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Técnica</th>
                  <th>Duración de bloque</th>
                  <th>Descansos incluidos</th>
                  <th>Ideal para</th>
                  <th>Curva de aprendizaje</th>
                  <th>Compatible en equipo</th>
                  <th>Herramientas recomendadas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pomodoro</strong></td>
                  <td>25 min (ajustable)</td>
                  <td>Sí, cada bloque</td>
                  <td>Tareas fragmentadas, estudiantes, escritores</td>
                  <td>Baja — listo en 1 día</td>
                  <td>Moderada</td>
                  <td>Este temporizador, Forest, Be Focused</td>
                </tr>
                <tr>
                  <td><strong>Timeboxing</strong></td>
                  <td>Variable (15–90 min)</td>
                  <td>No obligatorios</td>
                  <td>Proyectos con múltiples entregables</td>
                  <td>Baja — fácil de adoptar</td>
                  <td>Alta — ideal con calendarios</td>
                  <td>Google Calendar, Notion, Reclaim.ai</td>
                </tr>
                <tr>
                  <td><strong>GTD</strong></td>
                  <td>Sin bloques fijos</td>
                  <td>No contemplados</td>
                  <td>Gestores de proyectos, equipos grandes</td>
                  <td>Alta — requiere semanas</td>
                  <td>Alta con herramienta correcta</td>
                  <td>Things 3, OmniFocus, Todoist</td>
                </tr>
                <tr>
                  <td><strong>Deep Work</strong></td>
                  <td>90–180 min</td>
                  <td>No durante el bloque</td>
                  <td>Trabajo cognitivo intenso, investigadores</td>
                  <td>Media — requiere práctica</td>
                  <td>Baja — requiere aislamiento</td>
                  <td>Freedom, Cold Turkey, RescueTime</td>
                </tr>
                <tr>
                  <td><strong>Time Blocking</strong></td>
                  <td>Bloques de calendario</td>
                  <td>Planificados manualmente</td>
                  <td>Profesionales con agenda densa</td>
                  <td>Media — exige planificación</td>
                  <td>Alta — visible para el equipo</td>
                  <td>Google Calendar, Fantastical, Motion</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso según tu perfil</h2>
          <p className={styles.introParagraph}>
            La técnica Pomodoro se adapta de forma diferente según el tipo de trabajo. Aquí cuatro perfiles reales con sus particularidades.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h3>Estudiante universitario preparando exámenes</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Examen de Estadística en 5 días. Material: 8 temas, 200 páginas.
              </p>
              <p>
                Divide el temario en bloques concretos (1 tema = 2–3 pomodoros). Alterna entre lectura activa (25 min) y repaso sin notas (5 min de descanso activo). Estudios de la Universidad de Michigan muestran que el repaso espaciado cada 25 min mejora la retención hasta un 40% frente a sesiones maratonianas. Usa el preset <strong>Clásico (25/5)</strong>.
              </p>
              <p className={styles.escenarioTip}>
                Tip: Apaga el móvil completamente durante cada pomodoro. Las interrupciones fragmentan la memoria de trabajo y obligan al cerebro a recargar el contexto (coste cognitivo de switching: ~23 min para recuperar concentración plena).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h3>Programador en tareas de concentración profunda</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Implementar un módulo complejo con mucha lógica de negocio.
              </p>
              <p>
                El flujo de programación requiere bloques más largos que 25 min. Prueba el preset <strong>Largo (50/10)</strong> o el <strong>Ultra (90/15)</strong>. Reserva los primeros 5 minutos de cada bloque para leer el código anterior y planificar el siguiente paso. Los 10–15 min de descanso son ideales para revisar pull requests o responder mensajes de equipo.
              </p>
              <p className={styles.escenarioTip}>
                Tip: Escribe una nota al final de cada pomodoro con "próximo paso concreto". Evita quedar sin hilo al retomar el trabajo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
                <h3>Escritor o creador de contenido con entregas diarias</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> 3 artículos semanales, guiones de vídeo y gestión de RRSS.
              </p>
              <p>
                Separa la escritura (modo creativo, bloques de 25 min sin editar) de la edición (modo crítico, bloques separados). Este enfoque reduce el bloqueo del escritor. Asigna pomodoros distintos para investigación, borrador y revisión. Un escritor profesional promedio completa entre 500 y 800 palabras por pomodoro de escritura pura.
              </p>
              <p className={styles.escenarioTip}>
                Tip: Durante el descanso, aleja la vista de la pantalla 20 segundos mirando a 6 metros de distancia (regla 20-20-20). Previene la fatiga ocular en jornadas largas.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h3>Trabajador con muchas interrupciones en oficina</h3>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Open space, Slack activo, reuniones frecuentes e imprevistas.
              </p>
              <p>
                Reserva bloques de 25 min en el calendario como "tiempo de concentración". Comunica a tu equipo que respondes mensajes en los descansos. Si una interrupción es inevitable, anota dónde quedaste y reinicia el pomodoro. No lo cuentes como completado: un pomodoro roto no cuenta. Considera usar auriculares con cancelación de ruido como señal visual de "no molestar".
              </p>
              <p className={styles.escenarioTip}>
                Tip: El método "Inform, negotiate, call back" de Cirillo: informar que estás en un pomodoro, negociar cuándo responderás, y cumplirlo. Reduce interrupciones un 60% según el propio Cirillo.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el Pomodoro</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Quién inventó la Técnica Pomodoro y cómo funciona exactamente?</dt>
              <dd>
                Francesco Cirillo la desarrolló en 1987 siendo estudiante universitario en Roma. Usaba un temporizador de cocina con forma de tomate para dividir el estudio en bloques de 25 minutos separados por descansos cortos. La clave del método es la <strong>indivisibilidad del pomodoro</strong>: una vez iniciado, no se puede pausar ni interrumpir. Si algo externo lo interrumpe, se descarta y empieza de nuevo. Cirillo publicó el método completo en su libro de 2006 y lo distribuye gratuitamente en PDF.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Por qué 25 minutos y no otro tiempo?</dt>
              <dd>
                Los 25 minutos son el punto de partida de Cirillo, no un valor científico absoluto. La investigadora de DeskTime (2014) encontró que el patrón más productivo en su análisis de 5,5 millones de usuarios era <strong>52 minutos de trabajo seguidos de 17 minutos de descanso</strong>. Estudios de la Técnica de Aprendizaje de Florida State muestran que los atletas de élite trabajan en bloques de 90 minutos con un máximo de 4 bloques diarios. Los 25 min son una convención práctica: suficientemente cortos para no intimidar y largos para generar progreso real.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué hago si me interrumpen durante un pomodoro?</dt>
              <dd>
                Cirillo distingue entre interrupciones internas (distracciones propias) y externas (otras personas). Para las internas: anota el pensamiento en un papel y vuelve inmediatamente al trabajo. Para las externas: aplica el método <em>inform-negotiate-call back</em> — informa que estás ocupado, negocia cuándo podrás atender y cumple la promesa. Si la interrupción es inevitable y el pomodoro se rompe, <strong>no lo cuentes como completado</strong>. Reinícialo desde cero. Esta regla refuerza la integridad del sistema.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Puedo adaptar la duración del pomodoro a mi ritmo?</dt>
              <dd>
                Sí, y se recomienda hacerlo una vez dominada la técnica básica. Este temporizador incluye presets de 15/3, 25/5, 50/10 y 90/15. Para adaptarte: empieza con 25/5 durante 1–2 semanas, observa en qué momento tu concentración empieza a decaer naturalmente y usa ese tiempo como tu bloque personal. Algunas personas funcionan mejor con 20/4, otras con 40/8. Lo importante es que el bloque sea <strong>fijo e indivisible</strong> una vez iniciado.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre el descanso corto y el descanso largo?</dt>
              <dd>
                El <strong>descanso corto (5 min)</strong> es una pausa de recuperación activa: levantarse, estirarse, beber agua, mirar por la ventana. No revisar correo ni redes sociales, ya que activan el mismo modo de atención que el trabajo. El <strong>descanso largo (15–30 min)</strong> llega cada 4 pomodoros y permite una recuperación neurológica más profunda: dar un paseo, comer algo, hacer una llamada personal o simplemente no hacer nada. El cerebro consolida información durante estos períodos de descanso mayor.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo gestiono tareas que duran más de un pomodoro?</dt>
              <dd>
                Divide la tarea en subtareas concretas y asigna pomodoros estimados a cada una. Por ejemplo: "Escribir informe trimestral" → "Esquema del informe" (1 pomodoro) + "Introducción y datos" (2 pomodoros) + "Análisis y conclusiones" (2 pomodoros) + "Revisión y formato" (1 pomodoro). Si una tarea consume más de 5–7 pomodoros sin descomposición natural, es señal de que está mal definida. Hacerla más concreta mejora tanto la estimación como la motivación.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿El Pomodoro funciona con trabajo creativo?</dt>
              <dd>
                Sí, con una adaptación importante: separa las fases creativas (generación de ideas, escritura libre, bocetos) de las fases críticas (edición, revisión, refinamiento) en pomodoros distintos. Mezclarlas genera bloqueo creativo. Durante la fase generativa, usa el pomodoro para proteger el tiempo de flujo sin autocrítica. Durante la fase crítica, úsalo para mantener el ritmo y evitar perfeccionismo paralizante. Escritores como Nicholas Sparks y periodistas de medios como el NYT reportan usar variantes de esta técnica.
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuántos pomodoros al día son sostenibles?</dt>
              <dd>
                Cirillo recomienda un máximo de <strong>4 pomodoros seguidos</strong> antes del descanso largo. En una jornada laboral de 8 horas, son razonables entre 8 y 12 pomodoros (3,3 a 5 horas de trabajo concentrado real). El estudio de DeskTime citado anteriormente muestra que los trabajadores más productivos solo trabajan concentrados unas <strong>4 horas al día</strong>. Empezar con 4–6 pomodoros diarios y aumentar gradualmente es más sostenible que intentar 16 desde el primer día.
              </dd>
            </div>
          </dl>
          <p className={styles.faqTip}>
            ¿No encuentras respuesta a tu pregunta? La mayoría de dudas sobre la técnica tienen respuesta en el libro original de Cirillo, disponible gratuitamente en <em>francescocirillo.com</em>.
          </p>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo implementar el Pomodoro efectivamente: guía paso a paso</h2>
          <p className={styles.introParagraph}>
            Seguir estos 7 pasos desde el primer día marca la diferencia entre una práctica esporádica y un sistema de productividad real.
          </p>
          <ol className={styles.stepGuide} aria-label="Pasos para implementar la técnica Pomodoro">
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <h4>Prepara la lista de tareas del día</h4>
                <p>Antes de encender el temporizador, escribe en papel o en tu gestor de tareas todo lo que necesitas hacer hoy. Asigna una estimación en pomodoros a cada ítem (1, 2 o 3 pomodoros). Si una tarea supera 3 pomodoros, divídela. Este paso tarda 5–10 minutos y evita el "¿qué hago ahora?" entre pomodoros.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <h4>Elimina las fuentes de distracción antes de empezar</h4>
                <p>Silencia notificaciones del móvil, cierra las pestañas del navegador que no necesitas y activa el modo "No molestar". Si trabajas en oficina, coloca auriculares o un cartel visual. Este ritual de preparación activa mentalmente el modo concentración antes de iniciar el temporizador.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <h4>Escribe la tarea en el campo de tarea actual</h4>
                <p>Usa el campo "¿En qué estás trabajando?" del temporizador para escribir la tarea específica del pomodoro actual. Ser concreto ("Escribir el apartado de metodología" en lugar de "Escribir el informe") activa mejor el foco y hace más satisfactoria la finalización.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <h4>Inicia el temporizador y trabaja sin interrumpirte</h4>
                <p>Pulsa "Iniciar" y dedica toda tu atención a la tarea definida. Si surge un pensamiento o tarea nueva, anótalo en un papel (lista de "pendientes imprevistos") y vuelve de inmediato al trabajo. El pomodoro es sagrado: no se pausa, no se interrumpe. Si lo rompes, reinícialo desde cero.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <h4>Al sonar la alarma, toma el descanso completo</h4>
                <p>Cuando suena la campana, para <em>inmediatamente</em>, aunque estés "en el mejor momento". Levántate de la silla, estira brazos y cuello, bebe agua. Evita revisar el móvil o el correo durante estos 5 minutos: el descanso debe ser de verdad. El cerebro necesita este tiempo para consolidar lo aprendido.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <h4>Cada 4 pomodoros, toma un descanso largo de 15–30 minutos</h4>
                <p>Después de completar 4 pomodoros, el cerebro necesita una recuperación más profunda. Sal a caminar, come algo, escucha música o simplemente cierra los ojos. No fuerces otro bloque de trabajo hasta haber completado este descanso. El temporizador te avisará automáticamente si tienes configurado el descanso largo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <h4>Revisa tu rendimiento al final del día</h4>
                <p>Consulta las estadísticas del temporizador: ¿cuántos pomodoros completaste? ¿En qué momento del día fuiste más productivo? Anota qué funcionó y qué no. Esta revisión de 5 minutos al día —llamada "retrospectiva diaria" por Cirillo— es lo que transforma la técnica en un sistema de mejora continua.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para sacar el máximo al Pomodoro</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <h4>Prepara la lista antes de empezar</h4>
              <p>Dedica 10 minutos cada mañana a planificar tus pomodoros del día. Tener claro "qué harás en el siguiente bloque" elimina el tiempo muerto entre sesiones y reduce la fricción para retomar el trabajo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔕</span>
              <h4>Silencia todas las notificaciones durante el bloque</h4>
              <p>Un estudio de Gloria Mark (UCI, 2008) demostró que cada notificación interrumpe la concentración una media de 23 minutos. En un pomodoro de 25 min, una sola notificación puede anular el efecto completo de la sesión. Modo avión o No Molestar es imprescindible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍅</span>
              <h4>No rompas un pomodoro a mitad bajo ningún concepto</h4>
              <p>La regla de oro de Cirillo. Un pomodoro interrumpido no cuenta y debe reiniciarse desde cero. Esta regla parece rígida, pero es precisamente la que entrena tu capacidad de concentración sostenida con el tiempo. Trátalo como un contrato de 25 minutos contigo mismo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚶</span>
              <h4>Usa los descansos para moverte, no para las redes sociales</h4>
              <p>Las redes sociales activan el mismo sistema de recompensa dopaminérgico que el trabajo intenso, impidiendo la recuperación real. Reserva los descansos para actividades físicas o de baja estimulación: caminar, estirarte, respirar profundo o simplemente mirar por la ventana.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <h4>Registra las interrupciones en un papel</h4>
              <p>Ten una hoja en blanco junto al teclado para anotar cualquier pensamiento, tarea o idea que surja durante el pomodoro. Esto libera la mente de la presión de "recordar" y permite volver al trabajo sin ansiedad. Revisar esa lista al final del día suele revelar patrones de distracción útiles para mejorar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🕐</span>
              <h4>Adapta el tamaño del bloque a tu cronotipo</h4>
              <p>Las personas vespertinas (nocturnos) alcanzan su pico de concentración entre las 18:00 y las 21:00. Las matutinas, entre las 9:00 y las 12:00. Programa tus pomodoros de mayor exigencia cognitiva en tu ventana de máximo rendimiento, y reserva los bloques de menor concentración para tareas administrativas o rutinarias.</p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores comunes que sabotean la técnica</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Interrumpir el pomodoro constantemente.</strong> Cada vez que pausas y reanudas, el cerebro necesita entre 5 y 23 minutos para recuperar la concentración plena. Un pomodoro interrumpido es peor que no haber empezado: genera la falsa sensación de haber trabajado sin los beneficios reales.
              </li>
              <li>
                <strong>Ignorar los descansos porque "estás en racha".</strong> Saltarse los descansos acumula fatiga cognitiva que se manifiesta horas después como errores, irritabilidad o bloqueo. La racha percibida no es concentración sostenida: es una señal de que el cerebro empieza a funcionar en piloto automático.
              </li>
              <li>
                <strong>Hacer demasiados pomodoros seguidos sin descanso largo.</strong> Superar 4 pomodoros consecutivos sin pausa larga reduce el rendimiento en los siguientes bloques. Los estudios de Anders Ericsson sobre práctica deliberada en músicos y deportistas de élite confirman que 4 bloques de 90 min (o equivalente) es el máximo diario sostenible para trabajo cognitivo de alta exigencia.
              </li>
              <li>
                <strong>No planificar las tareas previamente.</strong> Empezar un pomodoro sin saber exactamente qué hacer lleva a los primeros minutos de improvisación y búsqueda, que son los más valiosos para entrar en estado de flujo. La lista de tareas previa no es opcional: es parte del método.
              </li>
              <li>
                <strong>Usar Pomodoro en tareas que requieren flujo continuo.</strong> Hay trabajos donde las interrupciones cada 25 minutos son contraproducentes: cirugía, sesiones de terapia, negociaciones largas o performances en directo. Para estas situaciones, métodos como Deep Work o Time Blocking son más adecuados.
              </li>
              <li>
                <strong>No registrar ni revisar el progreso.</strong> Sin datos de cuántos pomodoros completas al día, es imposible mejorar la estimación de tareas ni identificar cuándo eres más productivo. Las estadísticas del temporizador son tu sistema de feedback. Revisarlas 5 minutos al final del día es la diferencia entre una herramienta y un sistema.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('temporizador-pomodoro')}
        title="Herramientas de productividad"
        icon="⏱️"
      />

      <ShareCard appName="temporizador-pomodoro" />
      <Footer appName="temporizador-pomodoro" />
    </div>
  );
}
