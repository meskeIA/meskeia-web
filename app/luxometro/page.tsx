'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Luxometro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';
import DataReference from '@/components/DataReference';
import {
  ILUMINACION_RD486_META,
  ILUMINACION_EN12464_META,
  NIVELES_MINIMOS_RD486,
  NIVELES_RECOMENDADOS_EN12464,
} from '@/data/iluminacion-normativa';

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

  /**
   * ── Por qué aquí ya no hay un estado `lux` (reparado el 18/09/2026) ──
   *
   * El bucle de la cámara mide la luminancia media del fotograma y la elevaba a 2,2 × 100.000
   * para publicar una cifra en lux. Esa cifra NO era una medida de iluminancia: con la
   * exposición y la ganancia automáticas, el sensor lleva cualquier escena al gris medio, así
   * que un gris 128/255 daba «21.952 lux · Sombra exterior» tanto en una habitación en
   * penumbra como en la calle. Toda la cautela de la página hablaba además del sensor de luz
   * ambiente, que no llega a usarse nunca.
   *
   * Ahora se guarda la SEÑAL cruda (adimensional) y la unidad la pone la calibración:
   *   · sin calibrar → se publica un nivel relativo 0-100 y ninguna cifra en lux;
   *   · calibrado    → lux = señal × factor, anclado a la referencia que dio el usuario.
   *
   * De paso desaparece el fallo de la calibración (hallazgo 909): el bucle ya no lee el
   * factor, así que el cierre viejo que requestAnimationFrame seguía llamando no puede
   * quedarse con un valor obsoleto. El factor se aplica al pintar, no al medir.
   */
  const [senal, setSenal] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [lecturaCaducada, setLecturaCaducada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'sensor' | 'camera' | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  /** Lux por unidad de señal. `null` = sin calibrar, y entonces no se publica ningún lux. */
  const [calibracion, setCalibracion] = useState<number | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);
  const [knownLux, setKnownLux] = useState('');

  // Intentar usar Ambient Light Sensor API
  const tryAmbientLightSensor = useCallback(() => {
    if ('AmbientLightSensor' in window) {
      try {
        // @ts-expect-error - AmbientLightSensor no está en tipos estándar
        const sensor = new AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          // Este sensor SÍ entrega lux de verdad, así que su señal es directamente el lux
          // y su factor de calibración es 1 mientras nadie lo cambie.
          const luxValue = Math.round(sensor.illuminance);
          setSenal(luxValue);
          setLecturaCaducada(false);
          setHistory(prev => [...prev.slice(-59), luxValue]);
        });
        sensor.addEventListener('error', () => {
          // Sensor no disponible, usar cámara
          startCameraMethod();
        });
        sensor.start();
        setMethod('sensor');
        setCalibracion(prev => prev ?? 1);
        setIsActive(true);
        setError(null);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

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

    // Señal cruda: la luminancia media del fotograma linealizada (gamma 2,2) y llevada a una
    // escala manejable. NO es iluminancia y no lleva unidad — la unidad la pone la
    // calibración. Sin factor, este número solo sirve para comparar dos escenas medidas
    // seguidas y sin mover el encuadre, porque la exposición automática se reajusta sola.
    const senalCruda = Math.round(Math.pow(avgLuminance, 2.2) * 100000);

    setSenal(Math.max(0, senalCruda));
    setLecturaCaducada(false);
    setHistory(prev => [...prev.slice(-59), senalCruda]);

    animationRef.current = requestAnimationFrame(calculateLuxFromCamera);
  }, []);

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
      // El navegador pone el tipo de fallo en `name` («NotAllowedError», «NotFoundError») y en
      // `message` un texto suyo en inglés («Requested device not found»). Buscar «NotFound» en
      // el MENSAJE dejaba esa rama muerta y el usuario recibía el inglés crudo del navegador
      // dentro de una app en castellano (hallazgo 914).
      const nombre = err instanceof Error ? err.name : '';
      const detalle = err instanceof Error ? err.message : 'Error desconocido';
      if (nombre === 'NotAllowedError' || nombre === 'SecurityError' || detalle.includes('Permission denied')) {
        setError('Permiso denegado. Permite el acceso a la cámara para medir la luz.');
      } else if (nombre === 'NotFoundError' || nombre === 'OverconstrainedError') {
        setError('No se encontró ninguna cámara en este dispositivo.');
      } else if (nombre === 'NotReadableError') {
        setError('La cámara está ocupada por otra aplicación. Ciérrala y vuelve a intentarlo.');
      } else {
        setError(`Error al acceder a la cámara: ${detalle}`);
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
    // La cámara ya está apagada: lo que queda en pantalla es de otro momento y de otro sitio,
    // y sin esto se quedaba ahí con aspecto de lectura viva (hallazgo 910).
    setLecturaCaducada(true);
  }, []);

  /**
   * Calibra: el usuario dice cuántos lux hay de verdad y eso fija la escala.
   *
   * Se guarda «lux por unidad de señal», no un multiplicador sobre la cifra anterior, así que
   * calibrar dos veces seguidas no acumula error. Antes tampoco llegaba a aplicarse: el bucle
   * de medición seguía usando el factor viejo hasta que se paraba y se arrancaba de nuevo,
   * mientras la insignia ya decía «Calibrado».
   */
  const calibrate = useCallback(() => {
    const known = parseSpanishNumber(knownLux);
    if (Number.isFinite(known) && known > 0 && senal !== null && senal > 0) {
      setCalibracion(known / senal);
      setShowCalibration(false);
      setKnownLux('');
    }
  }, [knownLux, senal]);

  // Volver a «sin calibrar»: se retira la cifra en lux, no se pone el factor a 1
  const resetCalibration = () => {
    setCalibracion(null);
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

  /**
   * Lux SOLO si hay calibración. Sin ella no hay unidad que publicar, y todo lo que se
   * deriva de los lux —el rótulo de escena, la escala de referencia y las recomendaciones
   * de exposición— se apaga con la misma condición: nacían de una cifra que no medía nada.
   */
  const lux = calibracion !== null && senal !== null ? Math.round(senal * calibracion) : null;
  /** Nivel relativo 0-100 de lo que ve la cámara. No es iluminancia y no se rotula como tal. */
  const nivelRelativo = senal !== null ? Math.min(100, Math.round(Math.pow(senal / 100000, 1 / 2.2) * 100)) : null;
  /** El historial guarda señales crudas: se publican en la misma unidad que el medidor. */
  const enUnidad = (valorSenal: number): number =>
    calibracion !== null
      ? Math.round(valorSenal * calibracion)
      : Math.min(100, Math.round(Math.pow(Math.max(0, valorSenal) / 100000, 1 / 2.2) * 100));
  const unidadHistorial = calibracion !== null ? 'lux' : 'nivel relativo';
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
        <span className={styles.heroIcon} aria-hidden="true">💡</span>
        <h1 className={styles.title}>Luxómetro / Fotómetro</h1>
        <p className={styles.subtitle}>
          Estima la luz de una escena con la cámara trasera de tu móvil (celular). Da un nivel relativo, y lux si lo calibras con un luxómetro de referencia. Para fotografía, orienta la exposición; no sustituye a un aparato calibrado.
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
              {senal !== null && (
                <div
                  className={styles.meterFill}
                  style={{
                    width: `${lux !== null ? getMeterPercentage(lux) : (nivelRelativo ?? 0)}%`,
                    background: currentRef?.color || 'var(--primary)'
                  }}
                />
              )}
            </div>

            {/* Valor principal: lux solo si el usuario ha calibrado; si no, nivel relativo */}
            <div className={styles.luxDisplay} role="status" aria-live="polite" aria-atomic="true">
              <span className={styles.luxValue}>
                {lux !== null
                  ? formatNumber(lux, 0)
                  : nivelRelativo !== null
                    ? formatNumber(nivelRelativo, 0)
                    : '---'}
              </span>
              <span className={styles.luxUnit}>
                {lux !== null ? 'lux' : nivelRelativo !== null ? '/ 100 (nivel relativo)' : 'lux'}
              </span>
            </div>

            {/* Referencia actual */}
            {currentRef && lux !== null && (
              <div className={styles.referenceDisplay}>
                <span className={styles.refIcon} aria-hidden="true">{currentRef.icon}</span>
                <span className={styles.refLabel}>{currentRef.label}</span>
              </div>
            )}

            {lecturaCaducada && senal !== null && (
              <p className={styles.avisoMedidor} role="status">
                Medición detenida: esta lectura es de hace un momento y la cámara ya está apagada.
              </p>
            )}
          </div>

          {/*
            El aviso que faltaba, y va AQUÍ y no colapsado en el bloque educativo: la cifra no
            se sostiene sola. Lo que la anula es justo que sea función del brillo del píxel —la
            exposición automática lleva cualquier escena al gris medio, esté la habitación a
            50 lux o la calle a 80.000—, y eso no se arregla con un margen de error.
          */}
          {senal !== null && lux === null && (
            <div className={styles.avisoEscala} role="note">
              <strong><span aria-hidden="true">📐</span> Esto es un nivel relativo, no una medida en lux.</strong>{' '}
              La cámara ajusta sola la exposición y la ganancia, así que el brillo del fotograma
              no dice cuánta luz hay: dice cuánta luz ve la cámara <em>después</em> de
              compensarla. Para obtener lux hay que anclar la escala con el botón{' '}
              <span aria-hidden="true">⚙️</span> <strong>Calibrar</strong>, dando el valor de un
              luxómetro de referencia en esta misma escena.
            </div>
          )}

          {lux !== null && method === 'camera' && (
            <div className={styles.avisoEscala} role="note">
              <strong><span aria-hidden="true">⚠️</span> Calibrado para esta escena.</strong>{' '}
              La calibración ancla la escala en las condiciones en que se hizo. Si cambias de
              habitación, de encuadre o de distancia, la cámara vuelve a reajustar su exposición
              y hay que calibrar otra vez. No sustituye a un luxómetro: para acreditar el
              cumplimiento de una norma hace falta un aparato con certificado de trazabilidad.
            </div>
          )}

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
          {/* role=alert: quien no ve la pantalla pulsa «Iniciar» y sin esto no se entera de
              que la cámara falló — no hay cifra, no hay sonido y el mensaje no se lee. */}
          {error && (
            <div className={styles.errorMessage} role="alert" aria-live="polite">
              <span aria-hidden="true">⚠️</span> {error}
            </div>
          )}

          {/* Controles principales */}
          <div className={styles.controls}>
            {!isActive ? (
              <button type="button" onClick={startMeasurement} className={styles.btnPrimary}>
                <span aria-hidden="true">▶️</span> Iniciar Medición
              </button>
            ) : (
              <>
                <button type="button" onClick={stopMeasurement} className={styles.btnSecondary}>
                  <span aria-hidden="true">⏹️</span> Detener
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`${styles.btnIcon} ${showHistory ? styles.active : ''}`}
                  title="Ver historial"
                  aria-label="Ver el historial de lecturas"
                  aria-pressed={showHistory}
                >
                  📊
                </button>
                <button
                  type="button"
                  onClick={() => setShowCalibration(!showCalibration)}
                  className={`${styles.btnIcon} ${showCalibration ? styles.active : ''}`}
                  title="Calibrar"
                  aria-label="Abrir la calibración"
                  aria-pressed={showCalibration}
                >
                  ⚙️
                </button>
              </>
            )}
          </div>

          {/* Método activo */}
          {isActive && method && (
            <div className={styles.methodBadge}>
              {method === 'sensor' ? (
                <><span aria-hidden="true">📱</span> Sensor de luz</>
              ) : (
                <><span aria-hidden="true">📷</span> Cámara trasera</>
              )}
              {calibracion !== null && method === 'camera' && (
                <span className={styles.calibratedBadge}>Calibrado</span>
              )}
            </div>
          )}

          {/* Panel de calibración */}
          {showCalibration && isActive && (
            <div className={styles.calibrationPanel}>
              <h3>Calibración</h3>
              <p>
                Es lo que convierte el nivel relativo en lux. Apunta la cámara a donde tengas un
                luxómetro de referencia midiendo, escribe su valor y pulsa Calibrar:
              </p>
              <label className={styles.calibrationLabel} htmlFor="lux-referencia">
                Valor real en lux, medido con un luxómetro
              </label>
              <div className={styles.calibrationRow}>
                {/* type="text" + inputMode, no type="number": en un campo numérico el navegador
                    normaliza «1,5» a «1.5» y parseSpanishNumber lee el punto como millar. */}
                <input
                  id="lux-referencia"
                  type="text"
                  inputMode="decimal"
                  value={knownLux}
                  onChange={(e) => setKnownLux(e.target.value)}
                  placeholder="Por ejemplo, 500"
                  className={styles.calibrationInput}
                />
                <button type="button" onClick={calibrate} className={styles.btnSmall}>
                  Calibrar
                </button>
              </div>
              {calibracion !== null && (
                <button type="button" onClick={resetCalibration} className={styles.btnSmallDanger}>
                  Quitar la calibración (vuelve al nivel relativo)
                </button>
              )}
            </div>
          )}

          {/* Historial mini */}
          {showHistory && history.length > 0 && (
            <div className={styles.historyPanel}>
              <h3>Historial (últimos 60 segundos) · {unidadHistorial}</h3>
              <div className={styles.historyChart}>
                {history.map((val, idx) => (
                  <div
                    key={idx}
                    className={styles.historyBar}
                    style={{ height: `${getMeterPercentage(enUnidad(val))}%` }}
                    title={`${formatNumber(enUnidad(val), 0)} ${unidadHistorial}`}
                  />
                ))}
              </div>
              <div className={styles.historyStats}>
                <span>Mín: {formatNumber(enUnidad(Math.min(...history)), 0)}</span>
                <span>Máx: {formatNumber(enUnidad(Math.max(...history)), 0)}</span>
                <span>Media: {formatNumber(enUnidad(history.reduce((a, b) => a + b, 0) / history.length), 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Panel de recomendaciones fotográficas */}
        {lux !== null && photoRec && (
          <div className={styles.photoPanel}>
            <h2 className={styles.sectionTitle}>
              <span aria-hidden="true">📸</span> Recomendaciones Fotográficas
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
                <span className={styles.recIcon} aria-hidden="true">⏱️</span>
                <span className={styles.recValue}>{photoRec.speed}</span>
              </div>
            </div>
            <p className={styles.recTip}>
              <span aria-hidden="true">💡</span> {photoRec.tips}
            </p>
          </div>
        )}

        {/* Escala de referencia */}
        <div className={styles.referencePanel}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">📊</span> Escala de Referencia
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
        <h3><span aria-hidden="true">🔒</span> Tu privacidad es importante</h3>
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

      <DataReference
        normativa="Niveles de iluminación en lugares de trabajo"
        fuente={`${ILUMINACION_RD486_META.fuente} · ${ILUMINACION_EN12464_META.fuente}`}
        verificado={ILUMINACION_RD486_META.verificado}
        urlOficial={ILUMINACION_RD486_META.urlOficial}
        nota={ILUMINACION_RD486_META.nota}
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

        {/* Niveles normativos — salen de data/iluminacion-normativa.ts, no del JSX */}
        <h3>Cuánta luz exige la norma en un lugar de trabajo</h3>
        <p>
          El <strong>RD 486/1997</strong> es el mínimo legal en España y la{' '}
          <strong>UNE-EN 12464-1</strong> una recomendación técnica bastante más alta. Estar por
          debajo de la segunda no significa incumplir la primera.
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption className={styles.tableCaption}>
              Mínimos legales del RD 486/1997 (Anexo IV) — se duplican si hay riesgo de caídas o
              choques, si un error visual puede ser peligroso o si el contraste con el fondo es muy débil
            </caption>
            <thead>
              <tr>
                <th>Zona o tarea</th>
                <th>Mínimo (lx)</th>
              </tr>
            </thead>
            <tbody>
              {NIVELES_MINIMOS_RD486.map(nivel => (
                <tr key={nivel.zona}>
                  <td>
                    <strong>{nivel.zona}</strong>
                    {nivel.nota && <><br /><small>{nivel.nota}</small></>}
                  </td>
                  <td>{formatNumber(nivel.lux, 0)} lx</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption className={styles.tableCaption}>
              Iluminancia mantenida recomendada por la UNE-EN 12464-1 ({ILUMINACION_EN12464_META.vigencia})
              para los puestos de oficina más habituales
            </caption>
            <thead>
              <tr>
                <th>Puesto o actividad</th>
                <th>Recomendado (lx)</th>
              </tr>
            </thead>
            <tbody>
              {NIVELES_RECOMENDADOS_EN12464.map(nivel => (
                <tr key={nivel.zona}>
                  <td>
                    <strong>{nivel.zona}</strong>
                    {nivel.nota && <><br /><small>{nivel.nota}</small></>}
                  </td>
                  <td>{formatNumber(nivel.lux, 0)} lx</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Escenarios de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">📸</span> Fotografía en exteriores</h3>
            <p>Mide la luz antes de configurar tu cámara. El luxómetro te da el EV (Exposure Value) que necesitas, ahorrando disparos de prueba. Especialmente útil al cambiar de sombra a sol directo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🏠</span> Diseño de interiores</h3>
            <p>Compara el reparto de luz entre zonas de una misma estancia. La norma técnica EN 12464-1 recomienda por actividad: {formatNumber(NIVELES_RECOMENDADOS_EN12464[3].lux, 0)} lx para escritura y pantalla, los mismos {formatNumber(NIVELES_RECOMENDADOS_EN12464[4].lux, 0)} lx en salas de reuniones, {formatNumber(NIVELES_RECOMENDADOS_EN12464[2].lux, 0)} lx en un mostrador de recepción y {formatNumber(NIVELES_RECOMENDADOS_EN12464[0].lux, 0)} lx en archivo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">💻</span> Ergonomía en el trabajo</h3>
            <p>Un puesto mal iluminado cansa la vista. El mínimo <em>legal</em> del RD 486/1997 para una tarea con exigencias visuales altas son {formatNumber(NIVELES_MINIMOS_RD486[2].lux, 0)} lx, y la recomendación técnica para escritura y pantalla coincide en {formatNumber(NIVELES_RECOMENDADOS_EN12464[3].lux, 0)} lx. Para afirmar si tu mesa llega hace falta una medida en lux, o sea, calibrar esta app contra un luxómetro o usar directamente el luxómetro.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🌱</span> Cultivo de plantas de interior</h3>
            <p>Las plantas necesitan distintos niveles de luz: suculentas (10.000+ lx), plantas de sombra (500-2.000 lx), hierbas aromáticas (5.000-10.000 lx). Verifica si tu ventana da suficiente luz natural.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🎬</span> Producción audiovisual</h3>
            <p>Antes de iluminar un set, mide la luz ambiente. Conocer el nivel base te ayuda a decidir cuánta iluminación artificial añadir y dónde colocar los focos para conseguir la exposición objetivo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🔬</span> Experimento educativo</h3>
            <p>Compara cómo varía la iluminancia a distintas distancias de una bombilla (ley del cuadrado inverso: duplicar la distancia divide la iluminación por 4). Ideal para clases de física óptica.</p>
          </div>
        </div>

        {/* FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <h3>¿Es preciso el luxómetro del navegador comparado con uno profesional?</h3>
            <p>Depende del dispositivo. Los sensores de luz ambiente integrados en móviles (celulares) y portátiles tienen una respuesta espectral y rango limitados. Son útiles para estimaciones orientativas pero no para mediciones certificadas. Un luxómetro profesional calibrado (como los de Konica Minolta o Testo) tiene precisión de ±3-5%.</p>
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
            <p>Hay que separar dos cosas que se citan juntas y no son lo mismo. El <strong>RD 486/1997</strong> fija los <strong>mínimos legales</strong>, y son bajos: {formatNumber(NIVELES_MINIMOS_RD486[6].lux, 0)} lx para vías de circulación de uso ocasional, {formatNumber(NIVELES_MINIMOS_RD486[7].lux, 0)} lx si el paso es habitual, {formatNumber(NIVELES_MINIMOS_RD486[5].lux, 0)} lx en locales de uso habitual y {formatNumber(NIVELES_MINIMOS_RD486[2].lux, 0)} lx en tareas con exigencias visuales altas. Y el propio anexo obliga a <strong>duplicarlos</strong> cuando hay riesgo de caídas o choques, cuando un error visual puede ser peligroso, o cuando el contraste con el fondo es muy débil. La <strong>UNE-EN 12464-1</strong> es norma técnica de buena práctica, no obligación en sí misma, y ahí sí aparecen los {formatNumber(NIVELES_RECOMENDADOS_EN12464[3].lux, 0)} lx de escritura, lectura y pantalla o los {formatNumber(NIVELES_RECOMENDADOS_EN12464[5].lux, 0)} lx del dibujo técnico. El INSST recomienda medir a la altura del plano de trabajo, con un luxómetro.</p>
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
              <h3>Abre el luxómetro en tu móvil o celular</h3>
              <p>El navegador pedirá permiso para usar la <strong>cámara</strong>. La app intenta primero el sensor de luz ambiente, pero hoy ningún navegador de uso común lo expone —en Chrome está tras un flag y en Safari y Firefox no existe—, así que en la práctica siempre mide con la cámara. La insignia bajo el medidor dice cuál está usando.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Apunta la cámara trasera a la superficie que quieres evaluar</h3>
              <p>Mide la cámara de atrás, no la pantalla: si orientas la pantalla hacia la luz, la cámara que mide queda mirando justo al lado contrario. Para un puesto de trabajo, encuadra la mesa desde donde estaría la cabeza; llena el encuadre con la superficie, sin ventanas ni lámparas dentro del cuadro.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Espera a que la exposición se estabilice y lee</h3>
              <p>Dale 2-3 segundos: la cámara ajusta sola la exposición y la ganancia al cambiar de encuadre, y ese reajuste es justo lo que hace que el número se mueva. Sin calibrar verás un nivel relativo de 0 a 100, útil para comparar dos puntos de la misma habitación seguidos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Calibra si necesitas lux</h3>
              <p>Con el botón <span aria-hidden="true">⚙️</span> introduce lo que marque un luxómetro de referencia en esa misma escena. A partir de ahí la app publica lux y aparecen la escala de entornos y las recomendaciones de exposición, que salen de esa cifra. Sin calibrar no se muestran, porque serían un número sin unidad disfrazado de medida.</p>
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
              <h3>Para juzgar un puesto de trabajo, hace falta un luxómetro de verdad</h3>
              <p>Los mínimos legales son del RD 486/1997 y las recomendaciones técnicas de la UNE-EN 12464-1 (las tienes más abajo). Comparar con ellos exige una medida en lux, y esta app solo la da calibrada contra otro aparato. Sin esa referencia sirve para detectar que un rincón está claramente peor que otro, no para afirmar que se cumple o se incumple la norma: eso pide un luxómetro con certificado de trazabilidad.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">📍</span> Mide en el plano de trabajo</h3>
            <p>Para evaluar iluminación de oficina, mide a la altura de la superficie de trabajo (70-75 cm del suelo), no en el suelo ni en el techo.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">⏱️</span> Espera la estabilización</h3>
            <p>Los sensores de luz ambiente tienen un tiempo de respuesta. Espera 2-3 segundos tras cambiar de posición para que el valor se estabilice antes de leerlo.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🌡️</span> Nota la temperatura de color</h3>
            <p>Lux mide cantidad, no calidad. Dos fuentes con los mismos lux pueden dar sensaciones muy diferentes si una es cálida (2.700K) y otra fría (6.500K).</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">📷</span> Usa el EV como punto de partida</h3>
            <p>El EV calculado da la exposición &quot;técnicamente correcta&quot;. En fotografía creativa, sobreexponer o subexponer 1-2 EV es una decisión artística válida.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🔄</span> Mide en varios puntos</h3>
            <p>La iluminación varía dentro de una misma habitación. Toma mediciones en varios puntos para obtener un mapa de la distribución lumínica del espacio.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🌿</span> Cuida las plantas con datos</h3>
            <p>Si tus plantas no florecen o tienen hojas amarillas, puede ser falta de luz. Mide en el punto donde están y compara con sus necesidades específicas.</p>
          </div>
        </div>

        {/* Aviso importante */}
        <div className={styles.warningBox}>
          <h3><span aria-hidden="true">⚠️</span> Qué mide de verdad esta página, y qué no</h3>
          <ul className={styles.warningList}>
            <li><strong>Mide con la cámara, no con el sensor de luz ambiente.</strong> La API <code>AmbientLightSensor</code> está tras un flag en Chrome y no existe en Safari ni en Firefox, así que el camino que se ejecuta es siempre el de la cámara trasera. La insignia bajo el medidor lo dice en cada arranque.</li>
            <li><strong>La cámara compensa sola la luz.</strong> Exposición y ganancia automáticas llevan cualquier escena al gris medio: un brillo de fotograma parecido puede corresponder a una habitación en penumbra o a la calle. Por eso, sin calibrar, esta página publica un nivel relativo de 0 a 100 y ninguna cifra en lux.</li>
            <li><strong>Calibrar ancla la escala, y solo para esa escena.</strong> Si cambias de sitio, de encuadre o de distancia, la cámara vuelve a reajustarse y la calibración deja de valer.</li>
            <li><strong>No sirve para acreditar el cumplimiento de una norma.</strong> Certificar un puesto de trabajo exige un luxómetro con certificado de trazabilidad, y eso no lo sustituye ninguna app.</li>
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
              <h4><span aria-hidden="true">🌙</span> Luz muy baja (&lt;50 lux)</h4>
              <p>
                Noches, interiores muy oscuros. Requiere ISO alto, aperturas grandes
                y velocidades lentas. Considera usar trípode.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">💡</span> Luz interior (50-500 lux)</h4>
              <p>
                Hogares, oficinas con luz artificial. Configuración intermedia.
                Ideal para retratos con luz suave y difusa.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">☁️</span> Exterior nublado (1.000-10.000 lux)</h4>
              <p>
                Luz natural difusa, excelente para fotografía. Sombras suaves,
                colores naturales. ISO 100-400 funciona bien.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">☀️</span> Sol directo (50.000+ lux)</h4>
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
              <span><span aria-hidden="true">☀️</span> Sol directo</span>
              <span>f/16</span>
            </div>
            <div className={styles.sunny16Row}>
              <span><span aria-hidden="true">⛅</span> Sol con nubes ligeras</span>
              <span>f/11</span>
            </div>
            <div className={styles.sunny16Row}>
              <span><span aria-hidden="true">🌥️</span> Nublado brillante</span>
              <span>f/8</span>
            </div>
            <div className={styles.sunny16Row}>
              <span><span aria-hidden="true">☁️</span> Nublado</span>
              <span>f/5.6</span>
            </div>
            <div className={styles.sunny16Row}>
              <span><span aria-hidden="true">🌧️</span> Muy nublado / sombra</span>
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
