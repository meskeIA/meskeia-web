'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Sonometro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
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

// Calibración: desplazamiento en dB que se suma al nivel medido por el micrófono.
// 90 es la referencia por defecto (el valor con el que la app nació) y funciona
// razonablemente en portátiles y móviles de gama media, pero NINGÚN micrófono
// integrado viene calibrado de fábrica: por eso es ajustable y se recuerda.
const CALIBRACION_DEFECTO = 90;
const CALIBRACION_MIN = 60;
const CALIBRACION_MAX = 120;
const CLAVE_CALIBRACION = 'sonometro-calibracion';

// Formatea una duración en segundos como "M min S s" (o "S s" si no llega al minuto)
function formatDuracion(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return min > 0 ? `${min} min ${seg} s` : `${seg} s`;
}

export default function SonometroPage() {
  const [isActive, setIsActive] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [minDb, setMinDb] = useState(Infinity);
  const [maxDb, setMaxDb] = useState(0);
  const [laeq, setLaeq] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [calibracion, setCalibracion] = useState(CALIBRACION_DEFECTO);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  // Media incremental de la ENERGÍA acústica (no de los dB) y nº de muestras: es lo
  // que define el LAeq. Van en refs porque el bucle de medición corre a ~60 fps y no
  // debe provocar re-render por muestra.
  const energiaMediaRef = useRef(0);
  const muestrasRef = useRef(0);
  const inicioRef = useRef(0);
  // La calibración se lee dentro del bucle sin recrearlo: si viviera en las
  // dependencias de calculateDb, cada ajuste del slider reiniciaría measureLoop.
  const calibracionRef = useRef(CALIBRACION_DEFECTO);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      stopMeasuring();
    };
  }, []);

  // Recuperar la calibración guardada. Se hace en efecto (no en el estado inicial)
  // para no romper la hidratación: el servidor no tiene localStorage.
  useEffect(() => {
    const guardada = Number(window.localStorage.getItem(CLAVE_CALIBRACION));
    if (Number.isFinite(guardada) && guardada >= CALIBRACION_MIN && guardada <= CALIBRACION_MAX) {
      setCalibracion(guardada);
    }
  }, []);

  // Espejo de la calibración para el bucle + persistencia
  useEffect(() => {
    calibracionRef.current = calibracion;
    window.localStorage.setItem(CLAVE_CALIBRACION, String(calibracion));
  }, [calibracion]);

  // Calcular dB desde los datos del analizador
  const calculateDb = useCallback((dataArray: Uint8Array): number => {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Convertir RMS a dB. El desplazamiento de calibración lo pone el usuario: los
    // micrófonos integrados no tienen sensibilidad conocida, así que sin un punto de
    // referencia externo el valor absoluto es una estimación.
    const db = 20 * Math.log10(Math.max(rms, 0.00001)) + calibracionRef.current;

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

    // LAeq — nivel continuo equivalente. Es un promedio ENERGÉTICO, no aritmético:
    // hay que pasar cada lectura a energía (10^(dB/10)), promediar esas energías y
    // volver a dB. La media aritmética de decibelios subestima la exposición real
    // porque la escala es logarítmica: 80 dB y 100 dB no son "90 dB de media" sino
    // 97,03 — el pico domina la energía total, y es justo lo que mide la normativa.
    // El caso que lo deja claro: 99 muestras de 50 dB con un solo pico de 110 dan
    // LAeq 90,00 y media aritmética 50,60 — 39 dB de diferencia sobre los mismos
    // datos. Media incremental para no acumular una suma enorme ni guardar el
    // histórico completo en memoria; verificado idéntica al cálculo directo y
    // estable en 216.000 muestras (1 h a 60 fps).
    const energia = Math.pow(10, db / 10);
    muestrasRef.current += 1;
    energiaMediaRef.current += (energia - energiaMediaRef.current) / muestrasRef.current;
    setLaeq(10 * Math.log10(Math.max(energiaMediaRef.current, 1e-10)));
    setDuracion((performance.now() - inicioRef.current) / 1000);

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
      setLaeq(0);
      setDuracion(0);
      energiaMediaRef.current = 0;
      muestrasRef.current = 0;
      inicioRef.current = performance.now();

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

  // Resetear estadísticas (reinicia también la integración del LAeq)
  const resetStats = () => {
    setMinDb(Infinity);
    setMaxDb(0);
    setLaeq(0);
    setDuracion(0);
    energiaMediaRef.current = 0;
    muestrasRef.current = 0;
    inicioRef.current = performance.now();
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

      <LegalNotice lastUpdated="2026-02-02" />

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
            <span className={styles.levelIcon} aria-hidden="true">{isActive ? currentLevel.icon : '🎤'}</span>
            <span className={styles.levelLabel}>
              {isActive ? currentLevel.label : 'Esperando...'}
            </span>
          </div>

          {/* Botones de control */}
          <div className={styles.controls}>
            {!isActive ? (
              <button type="button" onClick={startMeasuring} className={styles.btnStart}>
                <span aria-hidden="true">🎤</span> Iniciar medición
              </button>
            ) : (
              <>
                <button type="button" onClick={stopMeasuring} className={styles.btnStop}>
                  <span aria-hidden="true">⏹️</span> Detener
                </button>
                <button type="button" onClick={resetStats} className={styles.btnReset}>
                  <span aria-hidden="true">🔄</span> Resetear
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
              <span aria-hidden="true">📊</span> Estadísticas de sesión
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
              <div className={`${styles.statCard} ${styles.statCardLaeq}`}>
                <span className={styles.statIcon} aria-hidden="true">📈</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{formatNumber(laeq, 1)}</span>
                  <span className={styles.statLabel}>LAeq (dB)</span>
                </div>
              </div>
            </div>
            <p className={styles.laeqNota}>
              <strong>LAeq</strong> = nivel continuo equivalente de los últimos{' '}
              <strong>{formatDuracion(duracion)}</strong>. Es el promedio <em>energético</em>,
              el valor que utilizan las normativas de ruido: pondera los picos como
              realmente pesan, a diferencia de una media aritmética de decibelios.
              Para documentar una molestia, mide al menos 5 minutos seguidos.
            </p>
          </div>
        )}

        {/* Calibración */}
        <div className={styles.calibracionPanel}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">🎚️</span> Calibración del micrófono
          </h2>
          <p className={styles.calibracionIntro}>
            Los micrófonos de móviles y portátiles no traen una sensibilidad conocida de
            fábrica, así que el valor absoluto depende de tu equipo. Si tienes una
            referencia fiable (un sonómetro, otro dispositivo ya calibrado o una fuente
            de nivel conocido), ajusta aquí el desplazamiento hasta que las lecturas
            coincidan. Se recuerda en este navegador.
          </p>
          <div className={styles.calibracionControles}>
            <button
              type="button"
              className={styles.btnCalib}
              onClick={() => setCalibracion(v => Math.max(CALIBRACION_MIN, v - 1))}
              disabled={calibracion <= CALIBRACION_MIN}
              aria-label="Reducir la calibración un decibelio"
            >
              −
            </button>
            <input
              type="range"
              className={styles.calibracionSlider}
              min={CALIBRACION_MIN}
              max={CALIBRACION_MAX}
              step={1}
              value={calibracion}
              onChange={(e) => setCalibracion(Number(e.target.value))}
              id="calibracion"
              aria-describedby="calibracion-valor"
            />
            <button
              type="button"
              className={styles.btnCalib}
              onClick={() => setCalibracion(v => Math.min(CALIBRACION_MAX, v + 1))}
              disabled={calibracion >= CALIBRACION_MAX}
              aria-label="Aumentar la calibración un decibelio"
            >
              +
            </button>
          </div>
          <div className={styles.calibracionEstado}>
            <label htmlFor="calibracion" id="calibracion-valor" className={styles.calibracionValor}>
              Desplazamiento: <strong>{formatNumber(calibracion, 0)} dB</strong>
            </label>
            {calibracion !== CALIBRACION_DEFECTO && (
              <button
                type="button"
                className={styles.btnCalibReset}
                onClick={() => setCalibracion(CALIBRACION_DEFECTO)}
              >
                <span aria-hidden="true">↩️</span> Volver al valor por defecto ({CALIBRACION_DEFECTO} dB)
              </button>
            )}
          </div>
          <p className={styles.calibracionAviso}>
            <span aria-hidden="true">💡</span> Truco sin equipo de referencia: una
            habitación en silencio nocturno suele estar entre 25 y 35 dB, y una
            conversación normal a un metro, entre 55 y 65 dB. Si tus lecturas se salen
            mucho de esos rangos, mueve el desplazamiento hasta encajarlas. Sigue siendo
            una estimación, no una medición certificada.
          </p>
        </div>

        {/* Tabla de referencia */}
        <div className={styles.referencePanel}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">📋</span> Niveles de referencia
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
                  <span className={styles.refIcon} aria-hidden="true">{level.icon}</span>
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
        severity="low"
        context="sonometro"
        collapsible={true}
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

        {/* SECCIÓN 1: Tabla Comparativa de niveles de ruido */}
        <section className={styles.guideSection}>
          <h2>Tabla comparativa: niveles de ruido y sus efectos</h2>
          <p className={styles.introParagraph}>
            La exposición al ruido afecta la salud de forma acumulativa. Conocer los rangos de decibelios
            y el tiempo de exposición seguro es clave para proteger la audición y actuar ante contaminación acústica.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Rango (dB)</th>
                  <th>Fuente típica</th>
                  <th>Exposición segura</th>
                  <th>Efectos en salud</th>
                  <th>Normativa española</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>0–30 dB</strong></td>
                  <td>Silencio, respiración, estudio nocturno</td>
                  <td>Ilimitada</td>
                  <td>Sin riesgo; favorece el descanso y la concentración</td>
                  <td>Límite interior nocturno recomendado: 30–35 dB</td>
                </tr>
                <tr>
                  <td><strong>30–60 dB</strong></td>
                  <td>Conversación normal, biblioteca, oficina tranquila</td>
                  <td>Ilimitada</td>
                  <td>Sin riesgo auditivo; puede dificultar el sueño cerca del límite superior</td>
                  <td>Límite interior diurno viviendas: 35–40 dB</td>
                </tr>
                <tr>
                  <td><strong>60–85 dB</strong></td>
                  <td>Tráfico urbano, restaurante animado, TV alta</td>
                  <td>Ilimitada (sin daño auditivo), aunque el estrés aumenta</td>
                  <td>Estrés, dificultad de concentración, posible aumento de tensión arterial</td>
                  <td>Zonas residenciales exteriores: 55–65 dB (Ley 37/2003)</td>
                </tr>
                <tr>
                  <td><strong>85–100 dB</strong></td>
                  <td>Maquinaria industrial, concierto, moto</td>
                  <td>Máx. 2 h/día a 100 dB; máx. 8 h/día a 85 dB</td>
                  <td>Daño auditivo progresivo; fatiga, irritabilidad, acúfenos</td>
                  <td>RD 286/2006: obligación de EPIs a partir de 85 dB(A)</td>
                </tr>
                <tr>
                  <td><strong>100–120 dB</strong></td>
                  <td>Taladro, sirena de ambulancia, avión despegando</td>
                  <td>Máx. 15 min/día a 100 dB; ninguna a 120 dB sin protección</td>
                  <td>Umbral del dolor; daño auditivo rápido; riesgo cardiovascular</td>
                  <td>Nivel de acción superior en el trabajo: 85 dB(A); límite exposición: 87 dB(A)</td>
                </tr>
                <tr>
                  <td><strong>&gt;120 dB</strong></td>
                  <td>Petardo, motor de avión a reacción</td>
                  <td>Daño inmediato incluso con exposición brevísima</td>
                  <td>Perforación del tímpano, pérdida auditiva permanente, barotrauma</td>
                  <td>Prohibido sin protección auditiva de alto rendimiento</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso — 4 perfiles */}
        <section className={styles.guideSection}>
          <h2>¿Para qué sirve un sonómetro? Casos de uso reales</h2>
          <p className={styles.introParagraph}>
            Medir el ruido no es solo cosa de ingenieros. Cualquier persona puede necesitar documentar
            niveles sonoros para reclamar, proteger su salud o simplemente tomar mejores decisiones.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏘️</span>
                <strong>Vecino afectado por local nocturno</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres reclamar al ayuntamiento que el bar de abajo supera los límites de ruido nocturno.
                Usas el sonómetro para registrar el nivel en el interior de tu vivienda entre las 22:00 y las 2:00.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: documenta varias noches con capturas de pantalla con fecha y hora.
                El límite interior nocturno en zonas residenciales suele ser 30–35 dB según la ordenanza municipal.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👷</span>
                <strong>Trabajador que evalúa riesgo auditivo</strong>
              </div>
              <p className={styles.escenarioExample}>
                Trabajas en un taller o almacén y quieres saber si necesitas usar protección auditiva.
                Mides el nivel medio durante tu jornada para comprobarlo antes de hablar con tu empresa.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: si el nivel promedio supera los 80 dB(A), el RD 286/2006 obliga al empresario
                a informarte y evaluar el riesgo. Por encima de 85 dB(A), los tapones son obligatorios.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👶</span>
                <strong>Padre o madre que mide el cuarto del bebé</strong>
              </div>
              <p className={styles.escenarioExample}>
                Quieres asegurarte de que la habitación del bebé está por debajo de los 35 dB durante
                las horas de sueño, y verificar si el ruido exterior o el monitor de bebé interfieren.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: la OMS recomienda menos de 30 dB para un sueño saludable infantil.
                Coloca el móvil a 1 metro de la cuna y mide durante 5 minutos sin moverte por la habitación.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎸</span>
                <strong>Músico que controla el volumen en los ensayos</strong>
              </div>
              <p className={styles.escenarioExample}>
                Ensayas con tu banda en un local y quieres mantener el volumen por debajo de 95 dB
                para proteger tu audición a largo plazo sin usar tapones que te impidan escuchar bien.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: a 95 dB el tiempo de exposición seguro es de unos 50 minutos según la NIOSH.
                Toma descansos de 15 minutos cada hora y considera tapones de músico con atenuación plana.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ — 8 preguntas */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre ruido y decibelios</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿A partir de cuántos dB es peligroso para el oído?</strong>
              <p>
                La exposición continuada a partir de 85 dB(A) puede provocar daño auditivo progresivo.
                A 100 dB el límite seguro es de unos 15 minutos al día, y por encima de 120 dB el daño
                puede ser inmediato incluso con exposiciones muy breves.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuál es el límite legal de ruido nocturno en España?</strong>
              <p>
                Depende del municipio, pero la Ley 37/2003 del Ruido fija como referencia 45 dB(A) en
                el exterior de zonas residenciales durante la noche (22:00–7:00) y 30–35 dB en el interior
                de viviendas. Las ordenanzas municipales pueden ser más restrictivas.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo medir el ruido de un vecino para reclamar?</strong>
              <p>
                Mide desde el interior de tu vivienda con puertas y ventanas cerradas.
                Registra el nivel durante varias sesiones en distintos días y horarios.
                Documenta con capturas de pantalla con fecha y hora. Para una reclamación formal
                ante el ayuntamiento se recomienda un informe pericial de un técnico acreditado.
              </p>
              <p className={styles.faqTip}>
                Importante: las mediciones de un sonómetro de móvil no tienen validez legal por sí solas,
                pero sirven para orientar la denuncia y solicitar una inspección oficial.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Es fiable un sonómetro de móvil comparado con uno profesional?</strong>
              <p>
                Un sonómetro de móvil tiene un margen de error de ±3 a ±6 dB respecto a un aparato
                de clase 1 o 2 homologado. Es útil para tener una orientación, detectar problemas evidentes
                y documentar tendencias, pero no tiene validez legal ni metrológica para procedimientos oficiales.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es la escala dB(A)?</strong>
              <p>
                El dB(A) es una medida ponderada que aproxima la sensibilidad del oído humano,
                atenuando las frecuencias muy bajas y muy altas. Es el estándar para medir el ruido
                ambiental, laboral y de tráfico. La mayoría de límites legales en España se expresan en dB(A).
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuánto tiempo se puede estar expuesto a 85 dB sin sufrir daño?</strong>
              <p>
                Según el RD 286/2006 y los criterios de la NIOSH, el límite es de 8 horas/día a 85 dB(A).
                Por cada 3 dB adicionales, el tiempo máximo se reduce a la mitad: 4 horas a 88 dB,
                2 horas a 91 dB, 1 hora a 94 dB, y así sucesivamente.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué nivel de ruido obliga a usar tapones en el trabajo?</strong>
              <p>
                El Real Decreto 286/2006 establece que a partir de 85 dB(A) de nivel de exposición
                diario o 137 dB(C) de pico, el uso de protección auditiva es obligatorio.
                Entre 80 y 85 dB(A) el empresario debe poner los EPIs a disposición del trabajador,
                que puede usarlos voluntariamente.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo afecta el ruido crónico a la salud?</strong>
              <p>
                La exposición crónica al ruido (aunque sea de baja intensidad) se asocia con estrés,
                insomnio, hipertensión, mayor riesgo cardiovascular, deterioro cognitivo y pérdida auditiva
                gradual. La OMS estima que el ruido ambiental es la segunda causa medioambiental de
                problemas de salud en Europa, después de la contaminación del aire.
              </p>
            </li>
          </ul>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo medir correctamente el ruido: guía paso a paso</h2>
          <p className={styles.introParagraph}>
            Tanto si quieres documentar una queja vecinal como evaluar el riesgo acústico en tu puesto
            de trabajo, seguir estos pasos te dará mediciones más fiables y útiles.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Prepara el entorno</strong>
                <p>
                  Cierra puertas y ventanas si mides el interior. Asegúrate de que no hay otras fuentes
                  de ruido que no sean las que quieres medir (televisión encendida, extractor de cocina, etc.).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Coloca el dispositivo correctamente</strong>
                <p>
                  Pon el móvil a 1 metro de altura respecto al suelo y a 1–1,5 metros de la fuente de ruido.
                  No lo cubras con la mano ni lo apoyes en superficies que puedan transmitir vibraciones.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Inicia la medición y espera</strong>
                <p>
                  Pulsa el botón de inicio y espera al menos 30–60 segundos antes de leer el resultado.
                  El promedio (LAeq) es más representativo que el valor pico. Para una queja formal,
                  realiza mediciones de al menos 5–10 minutos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Toma mediciones en distintos momentos</strong>
                <p>
                  El ruido varía a lo largo del día. Para documentar correctamente, mide en el momento
                  en que el problema es más intenso (noche, hora punta de tráfico, funcionamiento de la maquinaria)
                  y también en horas tranquilas para poder comparar.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Registra el ruido de fondo</strong>
                <p>
                  Mide el nivel de ruido en ausencia de la fuente problemática (ruido de fondo o residual).
                  Esto permite calcular la diferencia real que genera la fuente de molestia, que es lo que
                  valoran las inspecciones municipales.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Documenta con capturas de pantalla</strong>
                <p>
                  Haz capturas de pantalla del sonómetro mientras está midiendo, asegurándote de que
                  se vea la fecha y la hora del dispositivo. Guarda también el nombre del lugar y la
                  distancia a la fuente de ruido en un documento o nota de voz.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Interpreta el resultado y actúa</strong>
                <p>
                  Compara el valor promedio obtenido con los límites de tu ordenanza municipal
                  o con los valores de referencia laborales. Si supera los límites, considera presentar
                  una denuncia en el ayuntamiento o solicitar una medición oficial a un técnico acreditado.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para obtener mediciones fiables</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <div>
                <strong>Mide siempre a 1 metro de la fuente</strong>
                <p>La distancia estándar internacional para comparar niveles sonoros es 1 metro. Cada vez que doblas la distancia, el nivel cae aproximadamente 6 dB.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🕐</span>
              <div>
                <strong>Toma mediciones en distintos momentos del día</strong>
                <p>El ruido del tráfico es muy diferente a las 8:00 que a las 14:00 o las 23:00. Para documentar un problema acústico real, necesitas al menos 3 franjas horarias distintas.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <div>
                <strong>Usa el LAeq, no el valor pico</strong>
                <p>El nivel equivalente continuo (LAeq) es el promedio energético de la exposición sonora en el tiempo. Es el valor que utilizan las normativas y el que mejor refleja el impacto real en la salud. El panel de estadísticas de esta página lo calcula así —energéticamente, sobre toda la sesión— y muestra junto a él cuánto tiempo llevas midiendo, porque un LAeq sin su intervalo no significa nada.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎙️</span>
              <div>
                <strong>Calibra o verifica el micrófono del móvil</strong>
                <p>Los micrófonos de móvil no están calibrados de fábrica para mediciones acústicas. Si necesitas precisión, compara los resultados con una fuente sonora conocida y corrige la diferencia en el panel «Calibración del micrófono» de esta misma página: el desplazamiento que ajustes se recuerda en tu navegador para las siguientes mediciones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📸</span>
              <div>
                <strong>Documenta con capturas de pantalla con fecha y hora</strong>
                <p>Las capturas de pantalla son tu única prueba documental. Asegúrate de que el reloj del dispositivo es visible y correcto. Anota la ubicación, distancia y condiciones de la medición.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌬️</span>
              <div>
                <strong>Protege el micrófono del viento</strong>
                <p>El viento genera turbulencias en el micrófono que elevan artificialmente las lecturas. Si mides en exterior, usa una pantalla antiviento o realiza las mediciones en días calmados sin brisa directa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box — errores comunes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>Errores frecuentes al medir ruido con el móvil</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Tapar el micrófono con el dedo.</strong> El micrófono de los smartphones
                suele estar en el borde inferior o trasero. Comprueba su ubicación exacta antes de medir
                y sujeta el dispositivo por los laterales.
              </li>
              <li>
                <strong>Medir demasiado cerca de la fuente.</strong> A menos de 30 cm de la fuente las
                lecturas se disparan por reflexiones y efectos de campo cercano. La distancia mínima
                recomendada es 1 metro.
              </li>
              <li>
                <strong>Confundir dB con dB(A).</strong> Los decibelios sin ponderar (dB) y los ponderados
                en frecuencia dB(A) pueden diferir varios puntos. La normativa española usa siempre dB(A)
                para ruido ambiental y laboral.
              </li>
              <li>
                <strong>No tener en cuenta el ruido de fondo.</strong> Si el ruido de fondo ya es de 50 dB,
                una fuente que genera 52 dB apenas suma 2 dB al total medido. Sin restar el residual,
                la medición sobreestima el impacto de la fuente molesta.
              </li>
              <li>
                <strong>Usar el resultado del móvil como prueba legal directa.</strong> Las mediciones de apps
                de sonómetro no tienen validez metrológica ni legal por sí solas. Para reclamaciones
                formales se necesita un informe de un técnico acreditado con un equipo homologado (clase 1 o 2).
              </li>
              <li>
                <strong>Leer solo el valor pico y no el promedio.</strong> Un golpe puntual puede disparar
                la lectura a 90 dB un instante, pero si el nivel medio es de 55 dB, el problema es mucho menor
                de lo que parece. Siempre evalúa el promedio (LAeq) para comparar con normativa.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('sonometro')} />

      <ShareCard appName="sonometro" />
      <Footer appName="sonometro" />
    </div>
  );
}
