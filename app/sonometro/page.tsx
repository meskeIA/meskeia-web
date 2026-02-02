'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Sonometro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LastUpdated } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// Niveles de referencia en dB
const NOISE_LEVELS = [
  { min: 0, max: 30, label: 'Muy silencioso', color: '#10b981', icon: '🤫', examples: 'Respiración, susurro' },
  { min: 30, max: 50, label: 'Silencioso', color: '#22c55e', icon: '🌙', examples: 'Biblioteca, habitación tranquila' },
  { min: 50, max: 60, label: 'Moderado', color: '#84cc16', icon: '🏠', examples: 'Conversación normal, oficina' },
  { min: 60, max: 70, label: 'Algo ruidoso', color: '#eab308', icon: '📢', examples: 'Restaurante, TV alta' },
  { min: 70, max: 85, label: 'Ruidoso', color: '#f97316', icon: '🚗', examples: 'Tráfico, aspiradora' },
  { min: 85, max: 100, label: 'Muy ruidoso', color: '#ef4444', icon: '⚠️', examples: 'Moto, concierto cercano' },
  { min: 100, max: 130, label: 'Peligroso', color: '#dc2626', icon: '🔴', examples: 'Sirena, taladro, avión' },
];

// Obtener nivel actual
function getNoiseLevel(db: number) {
  return NOISE_LEVELS.find(level => db >= level.min && db < level.max) || NOISE_LEVELS[NOISE_LEVELS.length - 1];
}

export default function SonometroPage() {
  const [isActive, setIsActive] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [minDb, setMinDb] = useState(Infinity);
  const [maxDb, setMaxDb] = useState(0);
  const [avgDb, setAvgDb] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const readingsRef = useRef<number[]>([]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      stopMeasuring();
    };
  }, []);

  // Calcular dB desde los datos del analizador
  const calculateDb = useCallback((dataArray: Uint8Array): number => {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Convertir RMS a dB (ajustado para micrófonos típicos)
    // El factor 90 es una aproximación para calibrar con micrófonos de móvil/PC
    const db = 20 * Math.log10(Math.max(rms, 0.00001)) + 90;

    return Math.max(0, Math.min(130, db));
  }, []);

  // Bucle de medición
  const measureLoop = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);

    const db = calculateDb(dataArray);

    setCurrentDb(db);
    setMinDb(prev => Math.min(prev, db));
    setMaxDb(prev => Math.max(prev, db));

    // Guardar lecturas para promedio (últimos 100 valores)
    readingsRef.current.push(db);
    if (readingsRef.current.length > 100) {
      readingsRef.current.shift();
    }
    const avg = readingsRef.current.reduce((a, b) => a + b, 0) / readingsRef.current.length;
    setAvgDb(avg);

    animationRef.current = requestAnimationFrame(measureLoop);
  }, [calculateDb]);

  // Iniciar medición
  const startMeasuring = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      streamRef.current = stream;
      setPermissionState('granted');

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(analyser);
      analyserRef.current = analyser;

      // Resetear estadísticas
      setMinDb(Infinity);
      setMaxDb(0);
      setAvgDb(0);
      readingsRef.current = [];

      setIsActive(true);
      measureLoop();

    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      setPermissionState('denied');
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Permiso de micrófono denegado. Permite el acceso en la configuración del navegador.');
        } else if (err.name === 'NotFoundError') {
          setError('No se encontró ningún micrófono. Conecta uno e intenta de nuevo.');
        } else {
          setError(`Error: ${err.message}`);
        }
      }
    }
  };

  // Detener medición
  const stopMeasuring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsActive(false);
  };

  // Resetear estadísticas
  const resetStats = () => {
    setMinDb(Infinity);
    setMaxDb(0);
    setAvgDb(0);
    readingsRef.current = [];
  };

  const currentLevel = getNoiseLevel(currentDb);

  // Calcular rotación de la aguja (de -90° a 90° para 0-130 dB)
  const needleRotation = (currentDb / 130) * 180 - 90;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🔊</span>
        <h1 className={styles.title}>Sonómetro</h1>
        <p className={styles.subtitle}>
          Mide el nivel de ruido en decibelios (dB) con tu micrófono.
          Ideal para documentar ruido, verificar ambientes de trabajo o medir contaminación acústica.
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Panel principal del medidor */}
        <div className={styles.meterPanel}>
          {/* Medidor visual */}
          <div className={styles.meterContainer}>
            <div className={styles.meterBackground}>
              {/* Escala de colores */}
              <div className={styles.meterScale}>
                {NOISE_LEVELS.map((level, index) => (
                  <div
                    key={index}
                    className={styles.scaleSegment}
                    style={{
                      background: level.color,
                      width: `${((level.max - level.min) / 130) * 100}%`
                    }}
                  />
                ))}
              </div>

              {/* Marcas de escala */}
              <div className={styles.scaleMarks}>
                {[0, 30, 50, 70, 85, 100, 130].map(mark => (
                  <span key={mark} className={styles.scaleMark}>{mark}</span>
                ))}
              </div>

              {/* Aguja */}
              <div
                className={styles.needle}
                style={{ transform: `rotate(${needleRotation}deg)` }}
              />

              {/* Centro del medidor */}
              <div className={styles.meterCenter} />
            </div>
          </div>

          {/* Lectura digital */}
          <div className={styles.digitalDisplay}>
            <span className={styles.dbValue} style={{ color: currentLevel.color }}>
              {isActive ? formatNumber(currentDb, 1) : '--'}
            </span>
            <span className={styles.dbUnit}>dB</span>
          </div>

          {/* Nivel actual */}
          <div
            className={styles.levelIndicator}
            style={{ background: isActive ? currentLevel.color : 'var(--text-muted)' }}
          >
            <span className={styles.levelIcon}>{isActive ? currentLevel.icon : '🎤'}</span>
            <span className={styles.levelLabel}>
              {isActive ? currentLevel.label : 'Esperando...'}
            </span>
          </div>

          {/* Botones de control */}
          <div className={styles.controls}>
            {!isActive ? (
              <button onClick={startMeasuring} className={styles.btnStart}>
                🎤 Iniciar medición
              </button>
            ) : (
              <>
                <button onClick={stopMeasuring} className={styles.btnStop}>
                  ⏹️ Detener
                </button>
                <button onClick={resetStats} className={styles.btnReset}>
                  🔄 Resetear
                </button>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          {/* Mensaje de permiso */}
          {permissionState === 'prompt' && !isActive && !error && (
            <div className={styles.infoMessage}>
              💡 Se solicitará permiso para acceder al micrófono
            </div>
          )}
        </div>

        {/* Estadísticas */}
        {isActive && (
          <div className={styles.statsPanel}>
            <h2 className={styles.sectionTitle}>
              <span>📊</span> Estadísticas de sesión
            </h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>⬇️</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>
                    {minDb === Infinity ? '--' : formatNumber(minDb, 1)}
                  </span>
                  <span className={styles.statLabel}>Mínimo (dB)</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>⬆️</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{formatNumber(maxDb, 1)}</span>
                  <span className={styles.statLabel}>Máximo (dB)</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>📈</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{formatNumber(avgDb, 1)}</span>
                  <span className={styles.statLabel}>Promedio (dB)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de referencia */}
        <div className={styles.referencePanel}>
          <h2 className={styles.sectionTitle}>
            <span>📋</span> Niveles de referencia
          </h2>
          <div className={styles.referenceTable}>
            {NOISE_LEVELS.map((level, index) => (
              <div
                key={index}
                className={`${styles.referenceRow} ${isActive && currentDb >= level.min && currentDb < level.max ? styles.activeRow : ''}`}
              >
                <div className={styles.refLevel}>
                  <span
                    className={styles.refIndicator}
                    style={{ background: level.color }}
                  />
                  <span className={styles.refIcon}>{level.icon}</span>
                  <span className={styles.refLabel}>{level.label}</span>
                </div>
                <div className={styles.refRange}>
                  {level.min}-{level.max} dB
                </div>
                <div className={styles.refExamples}>
                  {level.examples}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="technical"
        severity="high"
        context="sonometro"
        collapsible={true}
      />

      <LastUpdated
        date="2026-02-02"
        changelog={[
          "Migrado disclaimer antiguo a DisclaimerCard para consistencia visual",
          "Añadido componente LastUpdated con historial de cambios",
          "Mejorada accesibilidad con ARIA labels en componentes interactivos"
        ]}
      />

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Cómo funciona un sonómetro?"
        subtitle="Aprende sobre el ruido, los decibelios y la salud auditiva"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué son los decibelios (dB)?</h2>
          <p className={styles.introParagraph}>
            El <strong>decibelio (dB)</strong> es la unidad de medida del nivel de presión sonora.
            Es una escala logarítmica, lo que significa que un aumento de 10 dB representa
            aproximadamente el doble de volumen percibido. Por ejemplo, 70 dB suena el doble
            de fuerte que 60 dB.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔢 Escala logarítmica</h4>
              <ul>
                <li>0 dB: Umbral de audición</li>
                <li>+10 dB: 10x más intensidad</li>
                <li>+20 dB: 100x más intensidad</li>
                <li>+30 dB: 1.000x más intensidad</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>👂 Salud auditiva</h4>
              <ul>
                <li>&lt;70 dB: Seguro indefinidamente</li>
                <li>85 dB: Máx. 8 horas/día</li>
                <li>100 dB: Máx. 15 minutos/día</li>
                <li>&gt;120 dB: Daño inmediato</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Normativa sobre ruido en España</h2>
          <p className={styles.introParagraph}>
            La <strong>Ley 37/2003 del Ruido</strong> establece límites de contaminación acústica.
            Los ayuntamientos tienen ordenanzas específicas, pero los límites habituales son:
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🏠 Viviendas (interior)</h4>
              <ul>
                <li>Día (8:00-22:00): 35-40 dB</li>
                <li>Noche (22:00-8:00): 30-35 dB</li>
                <li>Zonas residenciales: 55-65 dB ext.</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🏢 Ambientes laborales</h4>
              <ul>
                <li>Oficinas: 50-55 dB</li>
                <li>Industria: máx. 85 dB (con protección)</li>
                <li>Obligación de EPIs &gt;80 dB</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos para medir correctamente</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>✅ Buenas prácticas</h4>
              <ul>
                <li>Mantén el móvil a 1-1,5 m de la fuente</li>
                <li>Evita cubrir el micrófono</li>
                <li>Mide durante al menos 30 segundos</li>
                <li>Usa el promedio, no picos aislados</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>❌ Evitar</h4>
              <ul>
                <li>Viento directo sobre el micrófono</li>
                <li>Tocar el móvil durante la medición</li>
                <li>Otras fuentes de ruido cercanas</li>
                <li>Mediciones muy cortas (&lt;10s)</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('sonometro')} />

      <Footer appName="sonometro" />
    </div>
  );
}
