'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './NivelBurbuja.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// Tipo para orientación del dispositivo
interface DeviceOrientation {
  alpha: number | null; // Rotación Z (brújula)
  beta: number | null;  // Inclinación frontal (-180 a 180)
  gamma: number | null; // Inclinación lateral (-90 a 90)
}

export default function NivelBurbujaPage() {
  const [isActive, setIsActive] = useState(false);
  const [orientation, setOrientation] = useState<DeviceOrientation>({ alpha: null, beta: null, gamma: null });
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState({ beta: 0, gamma: 0 });
  const [viewMode, setViewMode] = useState<'bubble' | 'inclinometer'>('bubble');
  const [lockAxis, setLockAxis] = useState<'none' | 'x' | 'y'>('none');

  const lastOrientationRef = useRef<DeviceOrientation>({ alpha: null, beta: null, gamma: null });

  // Verificar soporte del navegador
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.DeviceOrientationEvent) {
        setIsSupported(false);
        setError('Tu navegador no soporta sensores de orientación.');
      } else if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
        // iOS 13+ requiere permiso explícito
        setNeedsPermission(true);
      }
    }
  }, []);

  // Manejador de orientación
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const newOrientation: DeviceOrientation = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma
    };

    // Aplicar suavizado
    const smoothing = 0.3;
    const smoothedOrientation: DeviceOrientation = {
      alpha: newOrientation.alpha,
      beta: lastOrientationRef.current.beta !== null && newOrientation.beta !== null
        ? lastOrientationRef.current.beta + (newOrientation.beta - lastOrientationRef.current.beta) * smoothing
        : newOrientation.beta,
      gamma: lastOrientationRef.current.gamma !== null && newOrientation.gamma !== null
        ? lastOrientationRef.current.gamma + (newOrientation.gamma - lastOrientationRef.current.gamma) * smoothing
        : newOrientation.gamma
    };

    lastOrientationRef.current = smoothedOrientation;
    setOrientation(smoothedOrientation);
  }, []);

  // Iniciar medición
  const startMeasuring = async () => {
    try {
      setError(null);

      // Solicitar permiso en iOS
      if (needsPermission) {
        const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (permission !== 'granted') {
          setError('Permiso de sensores denegado. Permite el acceso para usar el nivel.');
          return;
        }
      }

      window.addEventListener('deviceorientation', handleOrientation);
      setIsActive(true);

    } catch (err) {
      console.error('Error al acceder a los sensores:', err);
      setError('Error al acceder a los sensores de orientación.');
    }
  };

  // Detener medición
  const stopMeasuring = () => {
    window.removeEventListener('deviceorientation', handleOrientation);
    setIsActive(false);
  };

  // Calibrar (establecer posición actual como 0)
  const calibrate = () => {
    if (orientation.beta !== null && orientation.gamma !== null) {
      setIsCalibrating(true);
      setCalibrationOffset({
        beta: orientation.beta,
        gamma: orientation.gamma
      });
      setTimeout(() => setIsCalibrating(false), 500);
    }
  };

  // Resetear calibración
  const resetCalibration = () => {
    setCalibrationOffset({ beta: 0, gamma: 0 });
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  // Calcular ángulos calibrados
  const calibratedBeta = orientation.beta !== null ? orientation.beta - calibrationOffset.beta : 0;
  const calibratedGamma = orientation.gamma !== null ? orientation.gamma - calibrationOffset.gamma : 0;

  // Aplicar bloqueo de eje
  const displayBeta = lockAxis === 'x' ? 0 : calibratedBeta;
  const displayGamma = lockAxis === 'y' ? 0 : calibratedGamma;

  // Determinar si está nivelado (tolerancia de 0.5 grados)
  const isLevelX = Math.abs(displayGamma) < 0.5;
  const isLevelY = Math.abs(displayBeta) < 0.5;
  const isPerfectlyLevel = isLevelX && isLevelY;

  // Calcular posición de la burbuja (limitada al círculo)
  const maxOffset = 40; // Porcentaje máximo de desplazamiento
  const bubbleX = Math.max(-maxOffset, Math.min(maxOffset, displayGamma * 2));
  const bubbleY = Math.max(-maxOffset, Math.min(maxOffset, displayBeta * 2));

  // Calcular color basado en nivelación
  const getLevelColor = (angle: number): string => {
    const absAngle = Math.abs(angle);
    if (absAngle < 0.5) return '#22c55e'; // Verde - nivelado
    if (absAngle < 2) return '#84cc16'; // Verde claro
    if (absAngle < 5) return '#eab308'; // Amarillo
    if (absAngle < 10) return '#f97316'; // Naranja
    return '#ef4444'; // Rojo
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📐</span>
        <h1 className={styles.title}>Nivel de Burbuja</h1>
        <p className={styles.subtitle}>
          Mide inclinaciones y ángulos con el sensor de tu dispositivo.
          Ideal para bricolaje, colgar cuadros o medir pendientes.
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Panel principal del nivel */}
        <div className={styles.levelPanel}>
          {/* Selector de modo */}
          <div className={styles.modeSelector}>
            <button
              className={`${styles.modeBtn} ${viewMode === 'bubble' ? styles.active : ''}`}
              onClick={() => setViewMode('bubble')}
            >
              🫧 Burbuja
            </button>
            <button
              className={`${styles.modeBtn} ${viewMode === 'inclinometer' ? styles.active : ''}`}
              onClick={() => setViewMode('inclinometer')}
            >
              📏 Inclinómetro
            </button>
          </div>

          {/* Vista de burbuja */}
          {viewMode === 'bubble' && (
            <div className={styles.bubbleContainer}>
              {/* Nivel circular (2D) */}
              <div className={`${styles.circularLevel} ${isPerfectlyLevel ? styles.levelOk : ''}`}>
                {/* Círculos de referencia */}
                <div className={styles.referenceCircle} style={{ width: '25%', height: '25%' }} />
                <div className={styles.referenceCircle} style={{ width: '50%', height: '50%' }} />
                <div className={styles.referenceCircle} style={{ width: '75%', height: '75%' }} />

                {/* Cruz central */}
                <div className={styles.centerCross}>
                  <div className={styles.crossHorizontal} />
                  <div className={styles.crossVertical} />
                </div>

                {/* Burbuja */}
                <div
                  className={`${styles.bubble} ${isPerfectlyLevel ? styles.centered : ''}`}
                  style={{
                    transform: `translate(calc(-50% + ${bubbleX}%), calc(-50% + ${bubbleY}%))`,
                    background: isPerfectlyLevel ? '#22c55e' : 'var(--primary)'
                  }}
                />
              </div>

              {/* Niveles lineales */}
              <div className={styles.linearLevels}>
                {/* Nivel horizontal */}
                <div className={styles.linearLevel}>
                  <span className={styles.linearLabel}>Horizontal (X)</span>
                  <div className={styles.linearTrack}>
                    <div className={styles.linearCenter} />
                    <div
                      className={styles.linearBubble}
                      style={{
                        left: `${50 + displayGamma * 2}%`,
                        background: getLevelColor(displayGamma)
                      }}
                    />
                  </div>
                  <span
                    className={styles.linearValue}
                    style={{ color: getLevelColor(displayGamma) }}
                  >
                    {isActive ? `${formatNumber(displayGamma, 1)}°` : '--'}
                  </span>
                </div>

                {/* Nivel vertical */}
                <div className={styles.linearLevel}>
                  <span className={styles.linearLabel}>Frontal (Y)</span>
                  <div className={styles.linearTrack}>
                    <div className={styles.linearCenter} />
                    <div
                      className={styles.linearBubble}
                      style={{
                        left: `${50 + displayBeta * 2}%`,
                        background: getLevelColor(displayBeta)
                      }}
                    />
                  </div>
                  <span
                    className={styles.linearValue}
                    style={{ color: getLevelColor(displayBeta) }}
                  >
                    {isActive ? `${formatNumber(displayBeta, 1)}°` : '--'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Vista de inclinómetro */}
          {viewMode === 'inclinometer' && (
            <div className={styles.inclinometerContainer}>
              {/* Indicador semicircular */}
              <div className={styles.inclinometerGauge}>
                <div className={styles.gaugeBackground}>
                  {/* Marcas de escala */}
                  {[-90, -60, -45, -30, -15, 0, 15, 30, 45, 60, 90].map(angle => {
                    const rotation = angle;
                    return (
                      <div
                        key={angle}
                        className={styles.gaugeMark}
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                        <span className={styles.gaugeMarkLabel}>{Math.abs(angle)}°</span>
                      </div>
                    );
                  })}

                  {/* Aguja */}
                  <div
                    className={styles.gaugeNeedle}
                    style={{ transform: `rotate(${isActive ? calibratedBeta : 0}deg)` }}
                  />

                  {/* Centro */}
                  <div className={styles.gaugeCenter} />
                </div>

                {/* Lectura digital */}
                <div className={styles.inclinometerReading}>
                  <span
                    className={styles.readingValue}
                    style={{ color: getLevelColor(calibratedBeta) }}
                  >
                    {isActive ? formatNumber(Math.abs(calibratedBeta), 1) : '--'}
                  </span>
                  <span className={styles.readingUnit}>grados</span>
                  <span className={styles.readingDirection}>
                    {isActive && calibratedBeta !== 0
                      ? calibratedBeta > 0 ? '↗ Inclinado adelante' : '↙ Inclinado atrás'
                      : 'Horizontal'
                    }
                  </span>
                </div>
              </div>

              {/* Información de pendiente */}
              <div className={styles.slopeInfo}>
                <div className={styles.slopeCard}>
                  <span className={styles.slopeLabel}>Pendiente</span>
                  <span className={styles.slopeValue}>
                    {isActive ? formatNumber(Math.tan(calibratedBeta * Math.PI / 180) * 100, 1) : '--'}%
                  </span>
                </div>
                <div className={styles.slopeCard}>
                  <span className={styles.slopeLabel}>Ratio</span>
                  <span className={styles.slopeValue}>
                    {isActive && calibratedBeta !== 0
                      ? `1:${formatNumber(1 / Math.tan(Math.abs(calibratedBeta) * Math.PI / 180), 1)}`
                      : '--'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Estado */}
          <div className={`${styles.statusIndicator} ${isPerfectlyLevel && isActive ? styles.levelOk : ''}`}>
            {!isActive ? (
              <span>🎯 Pulsa &quot;Iniciar&quot; para comenzar</span>
            ) : isPerfectlyLevel ? (
              <span>✅ ¡Nivelado!</span>
            ) : (
              <span>📐 Ajustando...</span>
            )}
          </div>

          {/* Controles */}
          <div className={styles.controls}>
            {!isActive ? (
              <button
                onClick={startMeasuring}
                className={styles.btnStart}
                disabled={!isSupported}
              >
                📐 Iniciar nivel
              </button>
            ) : (
              <>
                <button onClick={stopMeasuring} className={styles.btnStop}>
                  ⏹️ Detener
                </button>
                <button
                  onClick={calibrate}
                  className={`${styles.btnCalibrate} ${isCalibrating ? styles.calibrating : ''}`}
                >
                  🎯 Calibrar
                </button>
                {(calibrationOffset.beta !== 0 || calibrationOffset.gamma !== 0) && (
                  <button onClick={resetCalibration} className={styles.btnReset}>
                    🔄 Reset
                  </button>
                )}
              </>
            )}
          </div>

          {/* Opciones */}
          {isActive && viewMode === 'bubble' && (
            <div className={styles.options}>
              <span className={styles.optionLabel}>Bloquear eje:</span>
              <div className={styles.toggleButtons}>
                <button
                  className={`${styles.toggleBtn} ${lockAxis === 'none' ? styles.active : ''}`}
                  onClick={() => setLockAxis('none')}
                >
                  Ninguno
                </button>
                <button
                  className={`${styles.toggleBtn} ${lockAxis === 'x' ? styles.active : ''}`}
                  onClick={() => setLockAxis('x')}
                >
                  Eje X
                </button>
                <button
                  className={`${styles.toggleBtn} ${lockAxis === 'y' ? styles.active : ''}`}
                  onClick={() => setLockAxis('y')}
                >
                  Eje Y
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          {/* Aviso de PC */}
          {!isSupported && (
            <div className={styles.warningMessage}>
              💻 Esta herramienta requiere un dispositivo con sensores de orientación (móvil o tablet).
              En ordenadores de escritorio los sensores no están disponibles.
            </div>
          )}

          {/* Mensaje para iOS */}
          {needsPermission && !isActive && !error && (
            <div className={styles.infoMessage}>
              📱 En iOS, se solicitará permiso para acceder a los sensores de movimiento
            </div>
          )}
        </div>

        {/* Panel de información */}
        <div className={styles.infoPanel}>
          <h2 className={styles.sectionTitle}>
            <span>💡</span> Consejos de uso
          </h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <div className={styles.tipContent}>
                <h4>Calibración</h4>
                <p>Usa el botón &quot;Calibrar&quot; para establecer la posición actual como referencia 0°.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📱</span>
              <div className={styles.tipContent}>
                <h4>Posición del móvil</h4>
                <p>Para mejores resultados, coloca el móvil sobre una superficie plana y estable.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🖼️</span>
              <div className={styles.tipContent}>
                <h4>Colgar cuadros</h4>
                <p>Usa el modo burbuja y bloquea el eje Y para nivelar horizontalmente.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <div className={styles.tipContent}>
                <h4>Medir pendientes</h4>
                <p>Usa el modo inclinómetro para medir rampas, tejados o pendientes del terreno.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este nivel digital proporciona <strong>mediciones aproximadas</strong> con fines orientativos.
          Los sensores de los dispositivos móviles no están calibrados profesionalmente.
          Para trabajos de precisión (construcción, ingeniería), utiliza herramientas profesionales calibradas.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Cómo funciona un nivel de burbuja?"
        subtitle="Aprende sobre inclinación, pendientes y medición de ángulos"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>El nivel de burbuja tradicional</h2>
          <p className={styles.introParagraph}>
            El <strong>nivel de burbuja</strong> (o nivel de aire) es una herramienta que contiene un tubo de vidrio
            parcialmente lleno de líquido. La burbuja de aire siempre busca el punto más alto, por lo que cuando
            está centrada entre las marcas, la superficie está nivelada. Fue inventado por Melchisédech Thévenot
            alrededor de 1661.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔬 Principio físico</h4>
              <p>
                La burbuja de aire, al ser menos densa que el líquido, siempre flota hacia arriba
                por efecto de la gravedad. Esto permite detectar inclinaciones mínimas con gran precisión.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📱 Versión digital</h4>
              <p>
                Los dispositivos móviles usan acelerómetros MEMS (Sistemas Microelectromecánicos)
                que detectan la aceleración gravitatoria en 3 ejes para calcular la orientación.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Aplicaciones prácticas</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🏠 Bricolaje en casa</h4>
              <ul>
                <li>Colgar cuadros y estanterías</li>
                <li>Instalar electrodomésticos</li>
                <li>Montar muebles</li>
                <li>Verificar suelos y paredes</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🏗️ Construcción</h4>
              <ul>
                <li>Nivelar cimientos</li>
                <li>Instalar ventanas y puertas</li>
                <li>Colocar azulejos</li>
                <li>Verificar estructuras</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>📐 Medir pendientes</h4>
              <ul>
                <li>Pendiente de tejados</li>
                <li>Rampas de accesibilidad</li>
                <li>Drenaje de terrenos</li>
                <li>Rutas de senderismo</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🚗 Automoción</h4>
              <ul>
                <li>Nivelar caravanas</li>
                <li>Ajustar suspensiones</li>
                <li>Verificar garajes</li>
                <li>Calibrar equipos</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Entender las pendientes</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 Formas de expresar pendiente</h4>
              <ul>
                <li><strong>Grados (°)</strong>: Ángulo respecto a la horizontal (0-90°)</li>
                <li><strong>Porcentaje (%)</strong>: Subida por cada 100 de avance horizontal</li>
                <li><strong>Ratio (1:X)</strong>: Una unidad de subida por X de avance</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>📏 Pendientes comunes</h4>
              <ul>
                <li>Rampa accesible: 6-8% (3-5°)</li>
                <li>Carretera de montaña: 8-12% (5-7°)</li>
                <li>Tejado estándar: 20-45% (11-24°)</li>
                <li>Escalera normal: 60-100% (31-45°)</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('nivel-burbuja')} />

      <Footer appName="nivel-burbuja" />
    </div>
  );
}
