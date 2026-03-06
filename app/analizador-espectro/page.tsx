'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AnalizadorEspectro.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice lastUpdated="2026-02-02" />

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

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="technical"
        severity="medium"
        context="analizador-espectro"
        collapsible={true}
      />


      {/* Contenido educativo */}
      <EducationalSection
        title="¿Cómo funciona el análisis de espectro?"
        subtitle="Aprende sobre frecuencias, FFT y el mundo del audio"
        icon="📚"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Banda</th>
                <th>Rango Hz</th>
                <th>Características auditivas</th>
                <th>Instrumentos / Fuentes</th>
                <th>Uso en ecualización</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sub-graves</strong></td>
                <td>20 – 60 Hz</td>
                <td>Se siente más que se oye; vibración física</td>
                <td>Bajo eléctrico (fundamental), órgano, bombo</td>
                <td>Cortar si hay ruido, potenciar para impacto</td>
              </tr>
              <tr>
                <td><strong>Graves</strong></td>
                <td>60 – 250 Hz</td>
                <td>Calidez y cuerpo del sonido</td>
                <td>Bajo, guitarra rítmica, voz masculina</td>
                <td>Ajustar para evitar que &quot;enmudezca&quot; la mezcla</td>
              </tr>
              <tr>
                <td><strong>Medios-bajos</strong></td>
                <td>250 – 500 Hz</td>
                <td>Plenitud; exceso causa sonido &quot;embarrado&quot;</td>
                <td>Guitarra acústica, piano, voz</td>
                <td>Cortar ligeramente para mezclas más limpias</td>
              </tr>
              <tr>
                <td><strong>Medios</strong></td>
                <td>500 Hz – 2 kHz</td>
                <td>Zona de máxima sensibilidad del oído</td>
                <td>Voz, guitarra, snare, piano</td>
                <td>Zona crítica; cambios pequeños tienen gran impacto</td>
              </tr>
              <tr>
                <td><strong>Medios-altos</strong></td>
                <td>2 – 4 kHz</td>
                <td>Presencia y ataque; puede ser fatigante</td>
                <td>Voz (consonantes), guitarra eléctrica</td>
                <td>Potenciar para presencia; cortar para fatiga auditiva</td>
              </tr>
              <tr>
                <td><strong>Presencia</strong></td>
                <td>4 – 6 kHz</td>
                <td>Definición y claridad vocales</td>
                <td>Voz, platillos, hi-hat</td>
                <td>Clave para que la voz &quot;se escuche&quot; en la mezcla</td>
              </tr>
              <tr>
                <td><strong>Brillo</strong></td>
                <td>6 – 12 kHz</td>
                <td>Aire y transparencia; exceso da sibilancia</td>
                <td>Platillos, acústica de sala, respiraciones</td>
                <td>De-esser en voces; potenciar con cuidado</td>
              </tr>
              <tr>
                <td><strong>Aire</strong></td>
                <td>12 – 20 kHz</td>
                <td>Sensación de espacio y apertura</td>
                <td>Armónicos de violín, campanas, reverb</td>
                <td>Pequeño boost da &quot;aire&quot; a mezclas planas</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>🎤 Eliminar feedback en directo</h3>
            <p>Identifica visualmente qué frecuencia genera el pitido de retroalimentación (feedback) antes de que escale. Suele aparecer como un pico estrecho y muy alto en el espectro.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎛️ Ecualizar una mezcla</h3>
            <p>Analiza si graves y bajos están saturados (exceso de energía en 60-250 Hz) o si falta presencia (2-6 kHz). El espectro te da una referencia visual objetiva para tus decisiones de EQ.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🏛️ Analizar acústica de salas</h3>
            <p>Reproduce un tono de barrido o ruido rosa y analiza el espectro. Las resonancias de la sala aparecen como picos: revelan frecuencias problemáticas que necesitan tratamiento acústico.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎓 Física del sonido (educación)</h3>
            <p>Visualiza en tiempo real los armónicos de instrumentos: toca una nota en guitarra y observa la frecuencia fundamental más todos sus armónicos (múltiplos) apareciendo en el espectro.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🔍 Detectar ruidos no deseados</h3>
            <p>Identifica zumbidos eléctricos (50 Hz en Europa, 60 Hz en América), ruido de ventiladores, interferencias de WiFi o cualquier frecuencia parasita en una grabación o entorno.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎸 Comparar timbres de instrumentos</h3>
            <p>Toca la misma nota en guitarra acústica, eléctrica y piano. Observa cómo cada instrumento tiene una &quot;huella espectral&quot; diferente: diferente distribución de armónicos.</p>
          </div>
        </div>

        {/* FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <h3>¿Qué es exactamente la FFT y por qué se usa?</h3>
            <p>La FFT (Fast Fourier Transform) es un algoritmo que convierte una señal de audio (dominio del tiempo) en su representación de frecuencias (dominio de la frecuencia). Es el corazón de todos los analizadores de espectro. Permite saber &quot;cuánta energía hay en cada frecuencia&quot; en un instante dado.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Por qué las frecuencias se muestran en escala logarítmica?</h3>
            <p>Porque el oído humano percibe el sonido de forma logarítmica: duplicar la frecuencia sube exactamente una octava. En escala lineal, los 10.000-20.000 Hz ocuparían la mitad del gráfico aunque el oído los percibe como una sola octava, lo mismo que 20-40 Hz.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cuántas barras/bins de frecuencia tiene el análisis?</h3>
            <p>Depende del tamaño del buffer FFT. Con un buffer de 2048 muestras a 48.000 Hz, obtienes 1024 bins separados por ~23 Hz. Buffers mayores dan mejor resolución frecuencial pero mayor latencia. La Web Audio API usa típicamente 2048 o 4096 muestras.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué diferencia hay entre un analizador de espectro y un osciloscopio?</h3>
            <p>El osciloscopio muestra la amplitud en función del tiempo (forma de onda). El analizador de espectro muestra la amplitud en función de la frecuencia. Son complementarios: el osciloscopio dice &quot;cómo varía&quot; el sonido; el espectro dice &quot;de qué frecuencias está hecho&quot;.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué es el &quot;ruido rosa&quot; y para qué se usa?</h3>
            <p>El ruido rosa tiene igual energía por octava (a diferencia del ruido blanco, que tiene igual energía por Hz). En un analizador de espectro logarítmico, el ruido rosa aparece como una línea plana. Por eso se usa como señal de prueba estándar para calibrar sistemas de sonido y analizar acústica de salas.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Puedo usar esto para afinar mi instrumento?</h3>
            <p>El analizador muestra qué frecuencias están presentes, pero no tiene un indicador de &quot;cents&quot; de desviación como un afinador. Para afinar, usa el Afinador Cromático de meskeIA. El analizador de espectro es más útil para entender la composición frecuencial del sonido.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Por qué la zona 2-5 kHz es tan importante en la voz?</h3>
            <p>Es la zona de mayor sensibilidad del oído humano (curva de igual sonoridad ISO 226). Las consonantes del habla se forman principalmente en 2-4 kHz. Por eso un boost en esa zona hace que la voz &quot;se corte&quot; en la mezcla. Un exceso, sin embargo, genera fatiga auditiva rápidamente.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿El análisis funciona con audio de archivos o solo micrófono?</h3>
            <p>El analizador usa el micrófono del dispositivo en tiempo real. Para analizar archivos de audio, puedes reproducirlos cerca del micrófono, o conectar la salida de audio a la entrada del micrófono. Algunas interfaces de audio permiten el loopback directo sin pérdida de calidad.</p>
          </li>
        </ul>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Pulsa &quot;Iniciar análisis&quot;</h3>
              <p>El navegador pedirá permiso para usar el micrófono. Concédelo. El análisis de espectro comenzará en tiempo real.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Elige el modo de visualización</h3>
              <p>Barras: muestra energía instantánea por banda. Línea: muestra la curva espectral continua con más detalle en las transiciones.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Ajusta la sensibilidad</h3>
              <p>Si las barras están siempre al máximo, baja la sensibilidad. Si apenas se mueven con señal clara, súbela. El objetivo es usar el rango dinámico completo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Activa &quot;Mostrar picos&quot;</h3>
              <p>Los marcadores de pico se quedan en la posición máxima durante unos segundos. Útil para capturar frecuencias problemáticas que aparecen brevemente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Identifica la distribución de energía</h3>
              <p>Observa en qué zonas hay más energía. Demasiados graves acumulados indican posible &quot;embarrado&quot;. Poco contenido en 2-6 kHz puede hacer el sonido opaco.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Compara con el panel de bandas de frecuencia</h3>
              <p>Usa la tabla de bandas (Sub-graves, Graves, Medios...) para identificar qué banda corresponde a cada zona del espectro y qué instrumentos o fuentes la ocupan.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Toma decisiones de EQ o tratamiento</h3>
              <p>Con la información visual, ajusta tu ecualizador, cambia posición del micrófono, añade tratamiento acústico o modifica la mezcla para conseguir un espectro más equilibrado.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>🎯 Busca un espectro &quot;plano&quot;</h3>
            <p>Una mezcla bien balanceada tiene energía distribuida de forma relativamente uniforme, sin picos pronunciados ni valles profundos en ninguna banda.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>👂 Confía más en tu oído que en el gráfico</h3>
            <p>El espectro es una herramienta visual de apoyo, no el árbitro final. Si algo suena bien, está bien aunque el gráfico no sea &quot;perfecto&quot;.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔇 Analiza en silencio primero</h3>
            <p>Inicia el analizador con silencio para ver el ruido de fondo de tu entorno. Así puedes identificar qué frecuencias son ruido ambiental antes de analizar tu fuente.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📊 Usa ruido rosa para calibrar</h3>
            <p>Reproduce ruido rosa cerca del micrófono. En una sala ideal debe aparecer como línea descendente. Las desviaciones revelan resonancias y problemas acústicos del espacio.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🎚️ Compara antes y después del EQ</h3>
            <p>Analiza el espectro antes de ecualizar, anota mentalmente los picos problemáticos, aplica el EQ y compara de nuevo. El analizador confirma si tus ajustes tuvieron el efecto esperado.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔊 Pon el micrófono cerca de la fuente</h3>
            <p>Para analizar un instrumento específico, el micrófono del dispositivo debe estar cerca de la fuente. A mayor distancia, capta más ambiente y el espectro refleja la sala, no el instrumento.</p>
          </div>
        </div>

        {/* Aviso importante */}
        <div className={styles.warningBox}>
          <h3>⚠️ Uso orientativo, no profesional</h3>
          <ul className={styles.warningList}>
            <li>El analizador usa el micrófono del dispositivo, que tiene su propia respuesta en frecuencia no calibrada. Los resultados son orientativos, no mediciones de laboratorio.</li>
            <li>Para mediciones acústicas profesionales (homologación de salas, certificación de equipos, estudios de ruido laboral) se requieren micrófonos calibrados y software específico.</li>
            <li>La resolución frecuencial depende del tamaño del buffer FFT del navegador. Frecuencias muy cercanas pueden aparecer como un solo pico.</li>
            <li>El procesamiento de audio ocurre completamente en tu navegador: no se envía audio a ningún servidor.</li>
          </ul>
        </div>

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

      <ShareCard appName="analizador-espectro" />
      <Footer appName="analizador-espectro" />
    </div>
  );
}
