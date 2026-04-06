'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './NivelBurbuja.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice />

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

        {/* Tabla comparativa de usos */}
        <section className={styles.guideSection}>
          <h2>Comparativa de usos del nivel de burbuja</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Uso</th>
                  <th>Precisión necesaria</th>
                  <th>Herramienta recomendada</th>
                  <th>Tolerancia de error</th>
                  <th>Consecuencia si está torcido</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Colgar cuadros</td>
                  <td>Baja</td>
                  <td>Nivel de móvil</td>
                  <td>±2°</td>
                  <td>Cuadro visiblemente inclinado</td>
                </tr>
                <tr>
                  <td>Instalar muebles/estanterías</td>
                  <td>Media</td>
                  <td>Nivel de burbuja o móvil</td>
                  <td>±0,5°</td>
                  <td>Objetos que resbalan o puertas que no cierran</td>
                </tr>
                <tr>
                  <td>Colocar electrodomésticos</td>
                  <td>Media-Alta</td>
                  <td>Nivel profesional o móvil calibrado</td>
                  <td>±0,3°</td>
                  <td>Vibraciones, mal funcionamiento o averías</td>
                </tr>
                <tr>
                  <td>Obra y construcción</td>
                  <td>Alta</td>
                  <td>Nivel láser o de burbuja profesional</td>
                  <td>±0,1°</td>
                  <td>Problemas estructurales graves y costosos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>¿Cuándo usar el nivel de burbuja del móvil?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🖼️</span>
                <h4>Bricolaje doméstico</h4>
              </div>
              <p className={styles.escenarioExample}>Colgar estantes y cuadros perfectamente rectos sin necesidad de herramientas adicionales.</p>
              <p className={styles.escenarioTip}>Usa el modo burbuja y bloquea el eje Y para nivelar solo en horizontal.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🪑</span>
                <h4>Instalación de muebles</h4>
              </div>
              <p className={styles.escenarioExample}>Asegurarte de que los muebles de cocina o baño quedan nivelados antes de fijarlos definitivamente.</p>
              <p className={styles.escenarioTip}>Apoya el móvil sobre la superficie del mueble y ajusta las patas regulables hasta centrar la burbuja.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏃</span>
                <h4>Verificación rápida</h4>
              </div>
              <p className={styles.escenarioExample}>Comprobar si algo está nivelado cuando no tienes a mano un nivel físico.</p>
              <p className={styles.escenarioTip}>Ideal como solución de urgencia; para trabajos importantes, confirma siempre con un nivel profesional.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <h4>¿Es tan preciso como un nivel físico?</h4>
              <p>No exactamente. Los acelerómetros de los móviles tienen una precisión de ±0,5° a ±1°, similar a un nivel de burbuja básico. Un nivel de burbuja profesional puede alcanzar ±0,1°. Para bricolaje doméstico la diferencia es imperceptible, pero en obra se nota.</p>
              <p className={styles.faqTip}>Para colgar cuadros y montar muebles, la precisión del móvil es más que suficiente.</p>
            </li>
            <li className={styles.faqItem}>
              <h4>¿Cómo calibro el nivel del móvil?</h4>
              <p>Coloca el teléfono sobre una superficie que sepas que es perfectamente plana (como un azulejo recién colocado o el cristal de una mesa de nivel). Pulsa el botón &quot;Calibrar&quot; para establecer esa posición como referencia 0°. Repite la calibración cada vez que cambies de superficie.</p>
            </li>
            <li className={styles.faqItem}>
              <h4>¿Funciona en todas las posiciones del teléfono?</h4>
              <p>Sí. El sensor detecta la orientación independientemente de si el teléfono está en posición horizontal (apoyado en una superficie) o vertical (apoyado de canto). El modo burbuja es ideal para posición horizontal y el inclinómetro para mediciones verticales.</p>
            </li>
            <li className={styles.faqItem}>
              <h4>¿Para qué trabajos NO es suficiente el nivel del móvil?</h4>
              <p>No es adecuado para: instalación de ventanas y puertas (requieren ±0,1°), solado de terrazo o parqué (necesita nivel láser), nivelación de maquinaria industrial, trabajos de construcción donde la tolerancia sea inferior a 1 mm por metro.</p>
              <p className={styles.faqTip}>En caso de duda, usa siempre un nivel profesional calibrado.</p>
            </li>
          </ul>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo usar el nivel paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Calibrar el teléfono en superficie plana</h4>
                <p>Antes de empezar, apoya el teléfono en una superficie que sepas que está nivelada. Pulsa &quot;Iniciar&quot; y después &quot;Calibrar&quot; para fijar el punto de referencia 0°.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Apoyar el teléfono sobre el objeto a nivelar</h4>
                <p>Coloca el teléfono directamente sobre la superficie o objeto que quieres nivelar. Asegúrate de que descansa de forma estable y sin vibrar.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Ajustar hasta que la burbuja quede centrada</h4>
                <p>Mueve o ajusta el objeto (por ejemplo, girando las patas regulables de un mueble) hasta que la burbuja quede en el centro y el indicador muestre ✅ Nivelado.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Fijar el objeto antes de retirar el teléfono</h4>
                <p>Una vez nivelado, fija o atornilla el objeto sin moverlo. Comprueba de nuevo con el nivel después de fijar para verificar que no se ha desplazado durante el proceso.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para mayor precisión</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <div>
                <h4>Calibrar siempre antes de usar</h4>
                <p>Un sensor sin calibrar puede acumular desviaciones de hasta 2°. Calibra sobre una superficie de referencia fiable cada vez que vayas a usar la herramienta.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📱</span>
              <div>
                <h4>Usa funda plana para mayor precisión</h4>
                <p>Las fundas con relieve, textura o bordes curvos elevan el teléfono de forma irregular y desplazan el sensor. Una funda fina y plana minimiza el error.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <div>
                <h4>Verifica en dos ejes</h4>
                <p>No basta con nivelar solo en horizontal. Gira el teléfono 90° y comprueba también el eje perpendicular para garantizar una nivelación completa.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔧</span>
              <div>
                <h4>Confirma con nivel profesional en obras</h4>
                <p>Para reformas, alicatados o cualquier trabajo donde el error acumulado pueda ser costoso, usa el móvil solo como guía y confirma con un nivel de burbuja o láser profesional.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes que debes evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>No calibrar antes de usar:</strong> el sensor puede estar desviado y darte lecturas incorrectas desde el primer momento.</li>
            <li><strong>Usar en superficies con vibración:</strong> la lavadora en marcha, el tráfico en la calle o el aire acondicionado pueden hacer oscilar la burbuja y dar resultados inestables.</li>
            <li><strong>Confiar en el nivel del móvil para trabajos de construcción precisos:</strong> la tolerancia del sensor no es suficiente para obra; usa siempre herramientas profesionales calibradas.</li>
            <li><strong>Usar con funda gruesa o curva:</strong> desplaza físicamente el sensor respecto a la superficie y añade un error sistemático que la calibración no puede corregir.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('nivel-burbuja')} />

      <ShareCard appName="nivel-burbuja" />
      <Footer appName="nivel-burbuja" />
    </div>
  );
}
