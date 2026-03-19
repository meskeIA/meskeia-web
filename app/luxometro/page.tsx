'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Luxometro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// Escalas de referencia de lux
const LUX_REFERENCES = [
  { min: 0, max: 1, label: 'Noche sin luna', icon: '🌑', color: '#1a1a2e' },
  { min: 1, max: 10, label: 'Noche con luna', icon: '🌙', color: '#2d2d44' },
  { min: 10, max: 50, label: 'Crepúsculo', icon: '🌅', color: '#4a3f55' },
  { min: 50, max: 200, label: 'Interior oscuro', icon: '🏠', color: '#5c5470' },
  { min: 200, max: 500, label: 'Interior normal', icon: '💡', color: '#7d6b91' },
  { min: 500, max: 1000, label: 'Oficina bien iluminada', icon: '🏢', color: '#9e89ab' },
  { min: 1000, max: 5000, label: 'Día muy nublado', icon: '☁️', color: '#b8a9c9' },
  { min: 5000, max: 10000, label: 'Día nublado', icon: '🌥️', color: '#d4c5e2' },
  { min: 10000, max: 25000, label: 'Sombra exterior', icon: '🌤️', color: '#e8dff5' },
  { min: 25000, max: 50000, label: 'Luz solar indirecta', icon: '⛅', color: '#fff3cd' },
  { min: 50000, max: 100000, label: 'Luz solar directa', icon: '☀️', color: '#ffc107' },
  { min: 100000, max: 150000, label: 'Sol intenso', icon: '🔆', color: '#ff9800' },
];

// Recomendaciones fotográficas según lux
const getPhotoRecommendations = (lux: number): { iso: string; aperture: string; speed: string; tips: string } => {
  if (lux < 10) {
    return {
      iso: '3200-6400',
      aperture: 'f/1.4 - f/2.8',
      speed: '1/15 - 1/60',
      tips: 'Usa trípode. Considera fotografía de larga exposición.'
    };
  } else if (lux < 50) {
    return {
      iso: '1600-3200',
      aperture: 'f/1.8 - f/2.8',
      speed: '1/30 - 1/125',
      tips: 'Luz muy baja. Abre el diafragma al máximo o usa flash.'
    };
  } else if (lux < 200) {
    return {
      iso: '800-1600',
      aperture: 'f/2.8 - f/4',
      speed: '1/60 - 1/250',
      tips: 'Interior con poca luz. Considera usar reflector o luz artificial.'
    };
  } else if (lux < 500) {
    return {
      iso: '400-800',
      aperture: 'f/4 - f/5.6',
      speed: '1/125 - 1/500',
      tips: 'Iluminación interior típica. Buena para retratos con luz suave.'
    };
  } else if (lux < 1000) {
    return {
      iso: '200-400',
      aperture: 'f/5.6 - f/8',
      speed: '1/250 - 1/1000',
      tips: 'Buena iluminación interior. Ideal para fotografía de producto.'
    };
  } else if (lux < 10000) {
    return {
      iso: '100-200',
      aperture: 'f/8 - f/11',
      speed: '1/500 - 1/2000',
      tips: 'Luz exterior nublada. Excelente para retratos sin sombras duras.'
    };
  } else if (lux < 50000) {
    return {
      iso: '100',
      aperture: 'f/8 - f/16',
      speed: '1/1000 - 1/4000',
      tips: 'Luz exterior brillante. Usa la regla sunny 16.'
    };
  } else {
    return {
      iso: '100',
      aperture: 'f/11 - f/22',
      speed: '1/2000 - 1/8000',
      tips: 'Sol directo intenso. Considera usar filtro ND para más flexibilidad.'
    };
  }
};

// Obtener nivel de referencia actual
const getCurrentReference = (lux: number) => {
  return LUX_REFERENCES.find(ref => lux >= ref.min && lux < ref.max) || LUX_REFERENCES[LUX_REFERENCES.length - 1];
};

export default function LuxometroPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const [lux, setLux] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'sensor' | 'camera' | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [calibrationFactor, setCalibrationFactor] = useState(1);
  const [showCalibration, setShowCalibration] = useState(false);
  const [knownLux, setKnownLux] = useState('');

  // Intentar usar Ambient Light Sensor API
  const tryAmbientLightSensor = useCallback(() => {
    if ('AmbientLightSensor' in window) {
      try {
        // @ts-expect-error - AmbientLightSensor no está en tipos estándar
        const sensor = new AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          const luxValue = Math.round(sensor.illuminance * calibrationFactor);
          setLux(luxValue);
          setHistory(prev => [...prev.slice(-59), luxValue]);
        });
        sensor.addEventListener('error', () => {
          // Sensor no disponible, usar cámara
          startCameraMethod();
        });
        sensor.start();
        setMethod('sensor');
        setIsActive(true);
        setError(null);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [calibrationFactor]);

  // Calcular luminosidad desde imagen de cámara
  const calculateLuxFromCamera = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) return;

    canvas.width = 64; // Resolución baja para rendimiento
    canvas.height = 48;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Calcular luminancia media (fórmula ITU-R BT.709)
    let totalLuminance = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Luminancia relativa
      totalLuminance += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }
    const avgLuminance = totalLuminance / (data.length / 4);

    // Convertir luminancia (0-1) a lux aproximado
    // Esta es una aproximación - los valores reales dependen de la cámara
    // Rango aproximado: 0.001 lux (muy oscuro) a 100000 lux (sol directo)
    const estimatedLux = Math.round(
      Math.pow(avgLuminance, 2.2) * 100000 * calibrationFactor
    );

    setLux(Math.max(0, estimatedLux));
    setHistory(prev => [...prev.slice(-59), estimatedLux]);

    animationRef.current = requestAnimationFrame(calculateLuxFromCamera);
  }, [calibrationFactor]);

  // Iniciar método de cámara
  const startCameraMethod = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Cámara trasera preferida
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setMethod('camera');
          setIsActive(true);
          calculateLuxFromCamera();
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowed')) {
        setError('Permiso denegado. Permite el acceso a la cámara para medir la luz.');
      } else if (errorMessage.includes('NotFound')) {
        setError('No se encontró ninguna cámara.');
      } else {
        setError(`Error al acceder a la cámara: ${errorMessage}`);
      }
    }
  }, [calculateLuxFromCamera]);

  // Iniciar medición
  const startMeasurement = useCallback(() => {
    // Primero intentar sensor de luz ambiental
    const sensorWorked = tryAmbientLightSensor();
    if (!sensorWorked) {
      // Fallback a cámara
      startCameraMethod();
    }
  }, [tryAmbientLightSensor, startCameraMethod]);

  // Detener medición
  const stopMeasurement = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setMethod(null);
  }, []);

  // Calibrar con valor conocido
  const calibrate = useCallback(() => {
    const known = parseFloat(knownLux);
    if (known > 0 && lux && lux > 0) {
      const newFactor = known / (lux / calibrationFactor);
      setCalibrationFactor(newFactor);
      setShowCalibration(false);
      setKnownLux('');
    }
  }, [knownLux, lux, calibrationFactor]);

  // Resetear calibración
  const resetCalibration = () => {
    setCalibrationFactor(1);
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const currentRef = lux !== null ? getCurrentReference(lux) : null;
  const photoRec = lux !== null ? getPhotoRecommendations(lux) : null;

  // Calcular porcentaje para el medidor visual
  const getMeterPercentage = (luxValue: number): number => {
    if (luxValue <= 0) return 0;
    // Escala logarítmica para mejor visualización
    const logLux = Math.log10(luxValue + 1);
    const maxLog = Math.log10(150001); // ~5.18
    return Math.min(100, (logLux / maxLog) * 100);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>💡</span>
        <h1 className={styles.title}>Luxómetro / Fotómetro</h1>
        <p className={styles.subtitle}>
          Mide la intensidad de luz en lux. Ideal para fotógrafos: obtén recomendaciones de exposición según la iluminación.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <main className={styles.mainContent}>
        {/* Panel principal de medición */}
        <div className={styles.meterPanel}>
          {/* Medidor visual */}
          <div className={styles.meterContainer}>
            <div
              className={styles.meterBackground}
              style={{
                background: currentRef ? `linear-gradient(135deg, ${currentRef.color}22, ${currentRef.color}44)` : undefined
              }}
            >
              {lux !== null && (
                <div
                  className={styles.meterFill}
                  style={{
                    width: `${getMeterPercentage(lux)}%`,
                    background: currentRef?.color || 'var(--primary)'
                  }}
                />
              )}
            </div>

            {/* Valor principal */}
            <div className={styles.luxDisplay}>
              <span className={styles.luxValue}>
                {lux !== null ? formatNumber(lux, 0) : '---'}
              </span>
              <span className={styles.luxUnit}>lux</span>
            </div>

            {/* Referencia actual */}
            {currentRef && lux !== null && (
              <div className={styles.referenceDisplay}>
                <span className={styles.refIcon}>{currentRef.icon}</span>
                <span className={styles.refLabel}>{currentRef.label}</span>
              </div>
            )}
          </div>

          {/* Video oculto para cámara */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.hiddenVideo}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Error */}
          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Controles principales */}
          <div className={styles.controls}>
            {!isActive ? (
              <button onClick={startMeasurement} className={styles.btnPrimary}>
                <span>▶️</span> Iniciar Medición
              </button>
            ) : (
              <>
                <button onClick={stopMeasurement} className={styles.btnSecondary}>
                  <span>⏹️</span> Detener
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`${styles.btnIcon} ${showHistory ? styles.active : ''}`}
                  title="Ver historial"
                >
                  📊
                </button>
                <button
                  onClick={() => setShowCalibration(!showCalibration)}
                  className={`${styles.btnIcon} ${showCalibration ? styles.active : ''}`}
                  title="Calibrar"
                >
                  ⚙️
                </button>
              </>
            )}
          </div>

          {/* Método activo */}
          {isActive && method && (
            <div className={styles.methodBadge}>
              {method === 'sensor' ? '📱 Sensor de luz' : '📷 Cámara'}
              {calibrationFactor !== 1 && (
                <span className={styles.calibratedBadge}>Calibrado</span>
              )}
            </div>
          )}

          {/* Panel de calibración */}
          {showCalibration && isActive && (
            <div className={styles.calibrationPanel}>
              <h3>Calibración</h3>
              <p>Si tienes un luxómetro de referencia, introduce el valor real para calibrar:</p>
              <div className={styles.calibrationRow}>
                <input
                  type="number"
                  value={knownLux}
                  onChange={(e) => setKnownLux(e.target.value)}
                  placeholder="Valor real en lux"
                  className={styles.calibrationInput}
                />
                <button onClick={calibrate} className={styles.btnSmall}>
                  Calibrar
                </button>
              </div>
              {calibrationFactor !== 1 && (
                <button onClick={resetCalibration} className={styles.btnSmallDanger}>
                  Resetear calibración
                </button>
              )}
            </div>
          )}

          {/* Historial mini */}
          {showHistory && history.length > 0 && (
            <div className={styles.historyPanel}>
              <h3>Historial (últimos 60 segundos)</h3>
              <div className={styles.historyChart}>
                {history.map((val, idx) => (
                  <div
                    key={idx}
                    className={styles.historyBar}
                    style={{ height: `${getMeterPercentage(val)}%` }}
                    title={`${formatNumber(val, 0)} lux`}
                  />
                ))}
              </div>
              <div className={styles.historyStats}>
                <span>Mín: {formatNumber(Math.min(...history), 0)}</span>
                <span>Máx: {formatNumber(Math.max(...history), 0)}</span>
                <span>Media: {formatNumber(history.reduce((a, b) => a + b, 0) / history.length, 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Panel de recomendaciones fotográficas */}
        {lux !== null && photoRec && (
          <div className={styles.photoPanel}>
            <h2 className={styles.sectionTitle}>
              <span>📸</span> Recomendaciones Fotográficas
            </h2>
            <div className={styles.recGrid}>
              <div className={styles.recCard}>
                <span className={styles.recIcon}>ISO</span>
                <span className={styles.recValue}>{photoRec.iso}</span>
              </div>
              <div className={styles.recCard}>
                <span className={styles.recIcon}>f/</span>
                <span className={styles.recValue}>{photoRec.aperture}</span>
              </div>
              <div className={styles.recCard}>
                <span className={styles.recIcon}>⏱️</span>
                <span className={styles.recValue}>{photoRec.speed}</span>
              </div>
            </div>
            <p className={styles.recTip}>
              💡 {photoRec.tips}
            </p>
          </div>
        )}

        {/* Escala de referencia */}
        <div className={styles.referencePanel}>
          <h2 className={styles.sectionTitle}>
            <span>📊</span> Escala de Referencia
          </h2>
          <div className={styles.referenceGrid}>
            {LUX_REFERENCES.map((ref, idx) => (
              <div
                key={idx}
                className={`${styles.refCard} ${currentRef === ref ? styles.refCardActive : ''}`}
                style={{ borderColor: ref.color }}
              >
                <span className={styles.refCardIcon}>{ref.icon}</span>
                <span className={styles.refCardLabel}>{ref.label}</span>
                <span className={styles.refCardRange}>
                  {ref.min === 0 ? '<' : ''}{formatNumber(ref.min === 0 ? ref.max : ref.min, 0)}
                  {ref.min > 0 && ` - ${formatNumber(ref.max, 0)}`} lux
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Aviso de privacidad */}
      <div className={styles.privacyInfo}>
        <h3>🔒 Tu privacidad es importante</h3>
        <ul>
          <li>✓ El video de la cámara NO se envía a ningún servidor</li>
          <li>✓ Todo el procesamiento ocurre en tu dispositivo</li>
          <li>✓ No almacenamos ningún dato</li>
        </ul>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="technical"
        severity="low"
        context="luxometro"
        collapsible={true}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre medición de luz?"
        subtitle="Descubre conceptos de iluminación y fotografía"
        icon="📚"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Entorno</th>
                <th>Lux (lx)</th>
                <th>Valor EV</th>
                <th>Configuración foto recomendada</th>
                <th>Bienestar visual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Noche sin luna</strong></td>
                <td>0,001 lx</td>
                <td>EV -6</td>
                <td>Larga exposición, trípode, ISO máximo</td>
                <td>Inadecuado para trabajo visual</td>
              </tr>
              <tr>
                <td><strong>Luna llena</strong></td>
                <td>0,1 – 1 lx</td>
                <td>EV -2 / 0</td>
                <td>ISO 3200+, f/1.8, 30s</td>
                <td>Solo orientación básica</td>
              </tr>
              <tr>
                <td><strong>Interior muy oscuro</strong></td>
                <td>5 – 50 lx</td>
                <td>EV 2 – 5</td>
                <td>ISO 800-3200, f/1.4-2, velocidad lenta</td>
                <td>Mínimo para lectura (50 lx)</td>
              </tr>
              <tr>
                <td><strong>Oficina / hogar</strong></td>
                <td>100 – 500 lx</td>
                <td>EV 6 – 9</td>
                <td>ISO 400-800, f/2.8-4, 1/60s</td>
                <td>Normativa UE: 500 lx escritorio</td>
              </tr>
              <tr>
                <td><strong>Exterior nublado</strong></td>
                <td>1.000 – 10.000 lx</td>
                <td>EV 10 – 13</td>
                <td>ISO 100-400, f/4-8, 1/125s</td>
                <td>Óptimo para trabajo prolongado</td>
              </tr>
              <tr>
                <td><strong>Exterior sol difuso</strong></td>
                <td>10.000 – 30.000 lx</td>
                <td>EV 13 – 15</td>
                <td>ISO 100, f/8-11, 1/250s</td>
                <td>Usar gafas de sol recomendable</td>
              </tr>
              <tr>
                <td><strong>Sol directo (mediodía)</strong></td>
                <td>50.000 – 100.000 lx</td>
                <td>EV 15 – 17</td>
                <td>ISO 100, f/16, 1/1000s (Sunny 16)</td>
                <td>Dañino sin protección UV</td>
              </tr>
              <tr>
                <td><strong>Cirugía / estudio TV</strong></td>
                <td>10.000 – 100.000 lx</td>
                <td>EV 13 – 17</td>
                <td>Iluminación artificial controlada</td>
                <td>Diseñado para trabajo de precisión</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>📸 Fotografía en exteriores</h3>
            <p>Mide la luz antes de configurar tu cámara. El luxómetro te da el EV (Exposure Value) que necesitas, ahorrando disparos de prueba. Especialmente útil al cambiar de sombra a sol directo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🏠 Diseño de interiores</h3>
            <p>Verifica que el nivel de iluminación cumple los estándares de bienestar visual. La normativa europea (EN 12464-1) establece mínimos por actividad: 500 lx para oficinas, 300 lx para salas de reunión.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>💻 Ergonomía en el trabajo</h3>
            <p>Niveles de luz inadecuados causan fatiga visual, dolores de cabeza y reducen la productividad. Mide tu puesto de trabajo y compara con los 500 lx recomendados por el INSST (España).</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🌱 Cultivo de plantas de interior</h3>
            <p>Las plantas necesitan distintos niveles de luz: suculentas (10.000+ lx), plantas de sombra (500-2.000 lx), hierbas aromáticas (5.000-10.000 lx). Verifica si tu ventana da suficiente luz natural.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎬 Producción audiovisual</h3>
            <p>Antes de iluminar un set, mide la luz ambiente. Conocer el nivel base te ayuda a decidir cuánta iluminación artificial añadir y dónde colocar los focos para conseguir la exposición objetivo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🔬 Experimento educativo</h3>
            <p>Compara cómo varía la iluminancia a distintas distancias de una bombilla (ley del cuadrado inverso: duplicar la distancia divide la iluminación por 4). Ideal para clases de física óptica.</p>
          </div>
        </div>

        {/* FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <h3>¿Es preciso el luxómetro del navegador comparado con uno profesional?</h3>
            <p>Depende del dispositivo. Los sensores de luz ambiente integrados en móviles y portátiles tienen una respuesta espectral y rango limitados. Son útiles para estimaciones orientativas pero no para mediciones certificadas. Un luxómetro profesional calibrado (como los de Konica Minolta o Testo) tiene precisión de ±3-5%.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué diferencia hay entre lux, lumen y candela?</h3>
            <p>Lumen (lm) = flujo luminoso total emitido por una fuente. Candela (cd) = intensidad luminosa en una dirección. Lux (lx) = iluminancia, es decir, cuántos lúmenes caen por metro cuadrado de superficie. Una vela emite ~1 candela; una bombilla LED de 10W emite ~1.000 lúmenes; a 1 metro de distancia produce ~80 lux en esa superficie.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué es el EV (Exposure Value) y cómo se relaciona con los lux?</h3>
            <p>El EV es una escala logarítmica usada en fotografía que combina apertura y velocidad de obturación. La relación aproximada con lux (a ISO 100) es: EV = log₂(lux / 2,5). Por ejemplo, 2.500 lx ≈ EV 10, que corresponde a f/8 a 1/125s a ISO 100. Esta fórmula es la base del fotómetro.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Por qué mi sensor no funciona en mi dispositivo?</h3>
            <p>La API de sensor de luz ambiente (AmbientLightSensor) no está disponible en todos los navegadores ni dispositivos. Firefox la soporta con configuración especial; Chrome la soporta en Android con sensor hardware presente. En muchos portátiles y tablets el sensor está pero el navegador no lo expone por defecto.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cuántos lux necesito en mi oficina según la normativa española?</h3>
            <p>El Real Decreto 486/1997 y la norma UNE-EN 12464-1 establecen: zonas de paso 100 lx, trabajos de oficina general 500 lx, trabajo con pantallas 500 lx (con control de deslumbramiento), planos de dibujo técnico 750 lx. El INSST recomienda medir con el luxómetro a la altura del plano de trabajo.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿La luz artificial afecta igual que la natural al bienestar?</h3>
            <p>No completamente. La luz natural tiene un espectro completo y varía a lo largo del día (temperatura de color de 2.000K al amanecer a 6.500K al mediodía), lo que regula el ritmo circadiano. La luz artificial LED fría (&gt;5.000K) puede suprimir la melatonina por la noche. Los luxes son iguales en cantidad, pero el espectro y la dinámica importan para la salud.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cómo afecta la distancia a la iluminancia?</h3>
            <p>Sigue la ley del inverso del cuadrado: si duplicas la distancia a la fuente de luz, la iluminancia se divide por 4. A 1 metro de una bombilla de 1.000 lúmenes obtienes ~80 lx; a 2 metros, ~20 lx; a 4 metros, ~5 lx. Por eso la posición de los focos es crítica en fotografía y diseño de interiores.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué es la regla &quot;Sunny 16&quot; y cuándo la uso?</h3>
            <p>Es una regla empírica de fotografía: en un día soleado con luz directa, usa apertura f/16 y velocidad de obturación = 1/ISO. A ISO 100, usa 1/100s; a ISO 200, 1/200s. Con el luxómetro confirmando &gt;50.000 lx, sabes cuándo aplicar esta regla sin necesidad de fotómetro.</p>
          </li>
        </ul>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Abre el luxómetro en tu dispositivo</h3>
              <p>El sensor de luz ambiente debe estar disponible en tu dispositivo. El navegador puede pedir permiso para acceder al sensor. Concédelo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Coloca el dispositivo en el punto de medición</h3>
              <p>El sensor suele estar en el frontal del dispositivo (junto a la cámara frontal). Orienta la pantalla hacia la fuente de luz que quieres medir.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Lee el valor en lux</h3>
              <p>Espera 2-3 segundos a que el sensor se estabilice. Anota el valor. Para mayor precisión, toma varias lecturas y calcula la media.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Consulta la tabla de referencia</h3>
              <p>Compara el valor medido con la tabla de entornos (oficina, exterior nublado, sol directo...) para interpretar qué tipo de iluminación tienes.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Obtén la configuración fotográfica</h3>
              <p>La app calcula el EV y sugiere una combinación ISO/apertura/velocidad. Úsala como punto de partida y ajusta según tu preferencia creativa.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Aplica la Regla Sunny 16 si aplica</h3>
              <p>Si el luxómetro marca &gt;50.000 lx (sol directo), aplica directamente f/16 a 1/ISO s. Es la configuración base desde la que ajustar creativamente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Verifica el bienestar visual en interiores</h3>
              <p>Si mides tu puesto de trabajo o aula, compara con los mínimos normativos (500 lx para oficina). Si hay menos luz, considera añadir iluminación suplementaria.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>📍 Mide en el plano de trabajo</h3>
            <p>Para evaluar iluminación de oficina, mide a la altura de la superficie de trabajo (70-75 cm del suelo), no en el suelo ni en el techo.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>⏱️ Espera la estabilización</h3>
            <p>Los sensores de luz ambiente tienen un tiempo de respuesta. Espera 2-3 segundos tras cambiar de posición para que el valor se estabilice antes de leerlo.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🌡️ Nota la temperatura de color</h3>
            <p>Lux mide cantidad, no calidad. Dos fuentes con los mismos lux pueden dar sensaciones muy diferentes si una es cálida (2.700K) y otra fría (6.500K).</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📷 Usa el EV como punto de partida</h3>
            <p>El EV calculado da la exposición &quot;técnicamente correcta&quot;. En fotografía creativa, sobreexponer o subexponer 1-2 EV es una decisión artística válida.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔄 Mide en varios puntos</h3>
            <p>La iluminación varía dentro de una misma habitación. Toma mediciones en varios puntos para obtener un mapa de la distribución lumínica del espacio.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🌿 Cuida las plantas con datos</h3>
            <p>Si tus plantas no florecen o tienen hojas amarillas, puede ser falta de luz. Mide en el punto donde están y compara con sus necesidades específicas.</p>
          </div>
        </div>

        {/* Aviso importante */}
        <div className={styles.warningBox}>
          <h3>⚠️ Limitaciones del sensor del navegador</h3>
          <ul className={styles.warningList}>
            <li>El sensor de luz ambiente del dispositivo no está calibrado para uso profesional. Los valores son orientativos.</li>
            <li>Para mediciones con validez legal (certificación de puestos de trabajo, cumplimiento normativo UNE-EN 12464) se requiere un luxómetro calibrado con certificado de trazabilidad.</li>
            <li>La disponibilidad del sensor varía según dispositivo y navegador. No todos los dispositivos exponen este sensor al navegador.</li>
            <li>Las configuraciones fotográficas sugeridas son puntos de partida basados en la ley de exposición; las condiciones reales pueden requerir ajustes.</li>
          </ul>
        </div>

        <section className={styles.guideSection}>
          <h2>¿Qué es un Lux?</h2>
          <p className={styles.introParagraph}>
            El <strong>lux</strong> (lx) es la unidad del Sistema Internacional para medir la
            <strong> iluminancia</strong>, es decir, la cantidad de luz que incide sobre una superficie.
            Un lux equivale a un lumen por metro cuadrado.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🌙 Luz muy baja (&lt;50 lux)</h4>
              <p>
                Noches, interiores muy oscuros. Requiere ISO alto, aperturas grandes
                y velocidades lentas. Considera usar trípode.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💡 Luz interior (50-500 lux)</h4>
              <p>
                Hogares, oficinas con luz artificial. Configuración intermedia.
                Ideal para retratos con luz suave y difusa.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>☁️ Exterior nublado (1.000-10.000 lux)</h4>
              <p>
                Luz natural difusa, excelente para fotografía. Sombras suaves,
                colores naturales. ISO 100-400 funciona bien.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>☀️ Sol directo (50.000+ lux)</h4>
              <p>
                Máxima intensidad. Usa la regla Sunny 16: a ISO 100, f/16 y
                velocidad 1/100s. Considera filtros ND.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>El Triángulo de Exposición</h2>
          <p>
            La exposición correcta en fotografía depende de tres factores que deben equilibrarse:
          </p>
          <div className={styles.triangleGrid}>
            <div className={styles.triangleCard}>
              <h4>ISO</h4>
              <p>
                Sensibilidad del sensor. Valores bajos (100-400) = menos ruido.
                Valores altos (1600+) = más ruido pero útil en poca luz.
              </p>
            </div>
            <div className={styles.triangleCard}>
              <h4>Apertura (f/)</h4>
              <p>
                Tamaño del diafragma. f/1.4-2.8 = más luz, fondo desenfocado.
                f/8-16 = menos luz, todo enfocado.
              </p>
            </div>
            <div className={styles.triangleCard}>
              <h4>Velocidad</h4>
              <p>
                Tiempo de exposición. 1/1000s = congela movimiento.
                1/30s = permite más luz pero puede salir movido.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Regla Sunny 16</h2>
          <p>
            En un día soleado con luz directa, usa <strong>f/16</strong> como apertura.
            La velocidad de obturación debe ser el inverso del ISO: a ISO 100, usa 1/100s;
            a ISO 200, usa 1/200s.
          </p>
          <div className={styles.sunny16Table}>
            <div className={styles.sunny16Row}>
              <span>☀️ Sol directo</span>
              <span>f/16</span>
            </div>
            <div className={styles.sunny16Row}>
              <span>⛅ Sol con nubes ligeras</span>
              <span>f/11</span>
            </div>
            <div className={styles.sunny16Row}>
              <span>🌥️ Nublado brillante</span>
              <span>f/8</span>
            </div>
            <div className={styles.sunny16Row}>
              <span>☁️ Nublado</span>
              <span>f/5.6</span>
            </div>
            <div className={styles.sunny16Row}>
              <span>🌧️ Muy nublado / sombra</span>
              <span>f/4</span>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('luxometro')} />

      <ShareCard appName="luxometro" />
      <Footer appName="luxometro" />
    </div>
  );
}
