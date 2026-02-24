'use client';

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
              className={`${styles.sessionBtn} ${sessionType === 'work' ? styles.active : ''}`}
              onClick={() => changeSessionType('work')}
            >
              Concentración
            </button>
            <button
              className={`${styles.sessionBtn} ${sessionType === 'shortBreak' ? styles.active : ''}`}
              onClick={() => changeSessionType('shortBreak')}
            >
              Descanso corto
            </button>
            <button
              className={`${styles.sessionBtn} ${sessionType === 'longBreak' ? styles.active : ''}`}
              onClick={() => changeSessionType('longBreak')}
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
            <button onClick={resetTimer} className={styles.controlBtn} title="Reiniciar">
              ↺
            </button>
            <button
              onClick={toggleTimer}
              className={`${styles.mainBtn} ${isRunning ? styles.pause : styles.play}`}
            >
              {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button onClick={skipSession} className={styles.controlBtn} title="Saltar">
              ⏭
            </button>
          </div>

          {/* Botón de configuración */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={styles.configToggle}
          >
            ⚙️ {showConfig ? 'Ocultar' : 'Configuración'}
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
            <button onClick={resetStats} className={styles.resetStatsBtn}>
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
                    onClick={playSound}
                    className={styles.testSoundBtn}
                  >
                    🔔 Probar sonido
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
