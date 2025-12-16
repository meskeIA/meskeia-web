'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AnalizadorEspectro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// Bandas de frecuencia para mostrar
const FREQUENCY_BANDS = [
  { label: 'Sub-graves', range: '20-60 Hz', color: '#dc2626' },
  { label: 'Graves', range: '60-250 Hz', color: '#f97316' },
  { label: 'Medios-bajos', range: '250-500 Hz', color: '#eab308' },
  { label: 'Medios', range: '500-2k Hz', color: '#84cc16' },
  { label: 'Medios-altos', range: '2-4 kHz', color: '#22c55e' },
  { label: 'Presencia', range: '4-6 kHz', color: '#14b8a6' },
  { label: 'Brillo', range: '6-12 kHz', color: '#3b82f6' },
  { label: 'Aire', range: '12-20 kHz', color: '#8b5cf6' },
];

// Notas musicales para referencia
const MUSICAL_NOTES = [
  { note: 'A0', freq: 27.5 },
  { note: 'C1', freq: 32.7 },
  { note: 'A1', freq: 55 },
  { note: 'C2', freq: 65.4 },
  { note: 'A2', freq: 110 },
  { note: 'C3', freq: 130.8 },
  { note: 'A3', freq: 220 },
  { note: 'C4', freq: 261.6 }, // Do central
  { note: 'A4', freq: 440 }, // La de referencia
  { note: 'C5', freq: 523.3 },
  { note: 'A5', freq: 880 },
  { note: 'C6', freq: 1046.5 },
  { note: 'A6', freq: 1760 },
  { note: 'C7', freq: 2093 },
  { note: 'A7', freq: 3520 },
  { note: 'C8', freq: 4186 },
];

export default function AnalizadorEspectroPage() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [dominantFreq, setDominantFreq] = useState<number>(0);
  const [dominantNote, setDominantNote] = useState<string>('--');
  const [viewMode, setViewMode] = useState<'bars' | 'line'>('bars');
  const [sensitivity, setSensitivity] = useState<number>(1);
  const [showPeaks, setShowPeaks] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const peaksRef = useRef<number[]>([]);
  const peakDecayRef = useRef<number[]>([]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      stopAnalyzing();
    };
  }, []);

  // Encontrar la nota musical más cercana
  const findClosestNote = useCallback((freq: number): string => {
    if (freq < 20 || freq > 20000) return '--';

    let closestNote = MUSICAL_NOTES[0];
    let minDiff = Math.abs(freq - closestNote.freq);

    for (const note of MUSICAL_NOTES) {
      const diff = Math.abs(freq - note.freq);
      if (diff < minDiff) {
        minDiff = diff;
        closestNote = note;
      }
    }

    // Solo mostrar si está razonablemente cerca
    const percentDiff = minDiff / closestNote.freq;
    if (percentDiff > 0.1) return '--';

    return closestNote.note;
  }, []);

  // Obtener color basado en frecuencia
  const getFrequencyColor = useCallback((freq: number): string => {
    if (freq < 60) return '#dc2626';
    if (freq < 250) return '#f97316';
    if (freq < 500) return '#eab308';
    if (freq < 2000) return '#84cc16';
    if (freq < 4000) return '#22c55e';
    if (freq < 6000) return '#14b8a6';
    if (freq < 12000) return '#3b82f6';
    return '#8b5cf6';
  }, []);

  // Bucle de análisis y visualización
  const analyzeLoop = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Limpiar canvas
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-card').trim() || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barCount = 64; // Número de barras a mostrar
    const barWidth = canvas.width / barCount;
    const heightScale = canvas.height / 256;

    // Inicializar peaks si es necesario
    if (peaksRef.current.length !== barCount) {
      peaksRef.current = new Array(barCount).fill(0);
      peakDecayRef.current = new Array(barCount).fill(0);
    }

    // Encontrar frecuencia dominante
    let maxValue = 0;
    let maxIndex = 0;

    // Calcular valores para cada barra (agrupando frecuencias)
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const freqPerBin = sampleRate / (analyser.fftSize);

    for (let i = 0; i < barCount; i++) {
      // Mapear logarítmicamente para mejor visualización
      const lowFreq = 20 * Math.pow(1000, i / barCount);
      const highFreq = 20 * Math.pow(1000, (i + 1) / barCount);

      const lowBin = Math.floor(lowFreq / freqPerBin);
      const highBin = Math.min(Math.ceil(highFreq / freqPerBin), bufferLength - 1);

      // Promediar los valores en este rango
      let sum = 0;
      let count = 0;
      for (let j = lowBin; j <= highBin; j++) {
        sum += dataArray[j];
        count++;
      }
      const avgValue = count > 0 ? (sum / count) * sensitivity : 0;
      const barHeight = Math.min(avgValue * heightScale, canvas.height);

      // Actualizar frecuencia dominante
      if (avgValue > maxValue) {
        maxValue = avgValue;
        maxIndex = i;
      }

      // Actualizar peaks
      if (barHeight > peaksRef.current[i]) {
        peaksRef.current[i] = barHeight;
        peakDecayRef.current[i] = 0;
      } else {
        peakDecayRef.current[i]++;
        if (peakDecayRef.current[i] > 30) {
          peaksRef.current[i] = Math.max(peaksRef.current[i] - 2, barHeight);
        }
      }

      const centerFreq = (lowFreq + highFreq) / 2;
      const color = getFrequencyColor(centerFreq);

      if (viewMode === 'bars') {
        // Dibujar barra con gradiente
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '80');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          i * barWidth + 1,
          canvas.height - barHeight,
          barWidth - 2,
          barHeight
        );

        // Dibujar peak
        if (showPeaks && peaksRef.current[i] > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(
            i * barWidth + 1,
            canvas.height - peaksRef.current[i] - 2,
            barWidth - 2,
            2
          );
        }
      }
    }

    // Modo línea
    if (viewMode === 'line') {
      ctx.beginPath();
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 2;

      for (let i = 0; i < barCount; i++) {
        const lowFreq = 20 * Math.pow(1000, i / barCount);
        const highFreq = 20 * Math.pow(1000, (i + 1) / barCount);

        const lowBin = Math.floor(lowFreq / freqPerBin);
        const highBin = Math.min(Math.ceil(highFreq / freqPerBin), bufferLength - 1);

        let sum = 0;
        let count = 0;
        for (let j = lowBin; j <= highBin; j++) {
          sum += dataArray[j];
          count++;
        }
        const avgValue = count > 0 ? (sum / count) * sensitivity : 0;
        const barHeight = Math.min(avgValue * heightScale, canvas.height);

        const x = i * barWidth + barWidth / 2;
        const y = canvas.height - barHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Área rellena debajo de la línea
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(46, 134, 171, 0.2)';
      ctx.fill();
    }

    // Dibujar líneas de frecuencia de referencia
    ctx.strokeStyle = 'var(--border)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    [100, 1000, 10000].forEach(freq => {
      const logPos = Math.log10(freq / 20) / Math.log10(1000);
      const x = logPos * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();

      // Etiqueta
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '10px sans-serif';
      ctx.fillText(freq >= 1000 ? `${freq/1000}kHz` : `${freq}Hz`, x + 2, 12);
    });
    ctx.setLineDash([]);

    // Actualizar frecuencia dominante
    const dominantLowFreq = 20 * Math.pow(1000, maxIndex / barCount);
    const dominantHighFreq = 20 * Math.pow(1000, (maxIndex + 1) / barCount);
    const freqCenter = (dominantLowFreq + dominantHighFreq) / 2;

    if (maxValue > 20) { // Solo si hay señal significativa
      setDominantFreq(freqCenter);
      setDominantNote(findClosestNote(freqCenter));
    } else {
      setDominantFreq(0);
      setDominantNote('--');
    }

    animationRef.current = requestAnimationFrame(analyzeLoop);
  }, [viewMode, sensitivity, showPeaks, getFrequencyColor, findClosestNote]);

  // Iniciar análisis
  const startAnalyzing = async () => {
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
      analyser.fftSize = 8192; // Alta resolución para mejor detalle de frecuencias
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      analyserRef.current = analyser;

      // Reset peaks
      peaksRef.current = [];
      peakDecayRef.current = [];

      setIsActive(true);
      analyzeLoop();

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

  // Detener análisis
  const stopAnalyzing = () => {
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
    setDominantFreq(0);
    setDominantNote('--');
  };

  // Ajustar canvas al tamaño del contenedor
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = 300;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📊</span>
        <h1 className={styles.title}>Analizador de Espectro</h1>
        <p className={styles.subtitle}>
          Visualiza las frecuencias de audio en tiempo real.
          Ideal para músicos, técnicos de sonido y curiosos del audio.
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Panel del analizador */}
        <div className={styles.analyzerPanel}>
          {/* Canvas de visualización */}
          <div className={styles.canvasContainer}>
            <canvas ref={canvasRef} className={styles.spectrumCanvas} />

            {!isActive && (
              <div className={styles.canvasOverlay}>
                <span className={styles.overlayIcon}>🎤</span>
                <span className={styles.overlayText}>
                  Pulsa &quot;Iniciar análisis&quot; para comenzar
                </span>
              </div>
            )}
          </div>

          {/* Escala de frecuencias */}
          <div className={styles.freqScale}>
            <span>20 Hz</span>
            <span>100 Hz</span>
            <span>1 kHz</span>
            <span>10 kHz</span>
            <span>20 kHz</span>
          </div>

          {/* Información de frecuencia dominante */}
          {isActive && (
            <div className={styles.dominantFreq}>
              <div className={styles.freqInfo}>
                <span className={styles.freqLabel}>Frecuencia dominante</span>
                <span className={styles.freqValue} style={{ color: getFrequencyColor(dominantFreq) }}>
                  {dominantFreq > 0 ? formatNumber(dominantFreq, 0) : '--'} Hz
                </span>
              </div>
              <div className={styles.noteInfo}>
                <span className={styles.noteLabel}>Nota más cercana</span>
                <span className={styles.noteValue}>
                  {dominantNote}
                </span>
              </div>
            </div>
          )}

          {/* Controles */}
          <div className={styles.controls}>
            {!isActive ? (
              <button onClick={startAnalyzing} className={styles.btnStart}>
                🎤 Iniciar análisis
              </button>
            ) : (
              <button onClick={stopAnalyzing} className={styles.btnStop}>
                ⏹️ Detener
              </button>
            )}
          </div>

          {/* Opciones de visualización */}
          <div className={styles.options}>
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Vista:</label>
              <div className={styles.toggleButtons}>
                <button
                  className={`${styles.toggleBtn} ${viewMode === 'bars' ? styles.active : ''}`}
                  onClick={() => setViewMode('bars')}
                >
                  📊 Barras
                </button>
                <button
                  className={`${styles.toggleBtn} ${viewMode === 'line' ? styles.active : ''}`}
                  onClick={() => setViewMode('line')}
                >
                  📈 Línea
                </button>
              </div>
            </div>

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Sensibilidad:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{formatNumber(sensitivity, 1)}x</span>
            </div>

            <div className={styles.optionGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showPeaks}
                  onChange={(e) => setShowPeaks(e.target.checked)}
                  className={styles.checkbox}
                />
                Mostrar picos
              </label>
            </div>
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

        {/* Leyenda de frecuencias */}
        <div className={styles.legendPanel}>
          <h2 className={styles.sectionTitle}>
            <span>🎵</span> Bandas de frecuencia
          </h2>
          <div className={styles.legendGrid}>
            {FREQUENCY_BANDS.map((band, index) => (
              <div key={index} className={styles.legendItem}>
                <span
                  className={styles.legendColor}
                  style={{ background: band.color }}
                />
                <div className={styles.legendInfo}>
                  <span className={styles.legendLabel}>{band.label}</span>
                  <span className={styles.legendRange}>{band.range}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notas musicales de referencia */}
        <div className={styles.notesPanel}>
          <h2 className={styles.sectionTitle}>
            <span>🎹</span> Frecuencias de notas musicales
          </h2>
          <div className={styles.notesGrid}>
            {MUSICAL_NOTES.filter((_, i) => i % 2 === 0).map((note, index) => (
              <div key={index} className={styles.noteItem}>
                <span className={styles.noteName}>{note.note}</span>
                <span className={styles.noteFreq}>{formatNumber(note.freq, 1)} Hz</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este analizador proporciona <strong>visualizaciones aproximadas</strong> con fines educativos y orientativos.
          Los micrófonos de dispositivos de consumo tienen limitaciones de frecuencia y sensibilidad.
          Para análisis profesional, utiliza equipos y software especializados.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Cómo funciona el análisis de espectro?"
        subtitle="Aprende sobre frecuencias, FFT y el mundo del audio"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el espectro de frecuencias?</h2>
          <p className={styles.introParagraph}>
            El <strong>espectro de frecuencias</strong> muestra cómo se distribuye la energía de una señal de audio
            en diferentes frecuencias. El oído humano puede percibir frecuencias entre 20 Hz y 20.000 Hz (20 kHz).
            Las frecuencias bajas (graves) están a la izquierda y las altas (agudos) a la derecha.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔬 Transformada de Fourier (FFT)</h4>
              <p>
                La FFT (Fast Fourier Transform) es el algoritmo matemático que descompone
                una señal de audio en sus frecuencias componentes. Es la base de todos
                los analizadores de espectro digitales.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📏 Escala logarítmica</h4>
              <p>
                Las frecuencias se muestran en escala logarítmica porque así percibe
                el oído humano. Cada octava (doble de frecuencia) ocupa el mismo espacio
                visual: 100-200 Hz = 1000-2000 Hz.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Aplicaciones del análisis de espectro</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🎸 Para músicos</h4>
              <ul>
                <li>Identificar frecuencias de notas</li>
                <li>Detectar armónicos de instrumentos</li>
                <li>Analizar la afinación</li>
                <li>Comparar timbres de instrumentos</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🎛️ Para técnicos de sonido</h4>
              <ul>
                <li>Detectar retroalimentación (feedback)</li>
                <li>Ecualizar mezclas</li>
                <li>Identificar ruidos no deseados</li>
                <li>Calibrar sistemas de PA</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🔊 Para acústica</h4>
              <ul>
                <li>Analizar respuesta de salas</li>
                <li>Medir reverberación</li>
                <li>Detectar resonancias</li>
                <li>Evaluar aislamiento acústico</li>
              </ul>
            </div>
            <div className={styles.contentCard}>
              <h4>🎓 Para educación</h4>
              <ul>
                <li>Visualizar ondas sonoras</li>
                <li>Entender armónicos</li>
                <li>Comparar voces e instrumentos</li>
                <li>Experimentos de física</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Características del sonido</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🎵 Frecuencia fundamental</h4>
              <p>
                Es la frecuencia más baja y prominente de un sonido, determina la &quot;nota&quot; que percibimos.
                Por ejemplo, el La de referencia es 440 Hz.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>✨ Armónicos</h4>
              <p>
                Son frecuencias múltiplos de la fundamental. Dan el &quot;timbre&quot; característico
                a cada instrumento o voz. Por eso un piano y una guitarra tocando la misma nota suenan diferente.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('analizador-espectro')} />

      <Footer appName="analizador-espectro" />
    </div>
  );
}
