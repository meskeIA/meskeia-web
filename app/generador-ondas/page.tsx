'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './GeneradorOndas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth';
type TabMode = 'generator' | 'visualizer';

// Notas musicales con frecuencias
const MUSICAL_NOTES = [
  { name: 'Do (C4)', freq: 261.63 },
  { name: 'Re (D4)', freq: 293.66 },
  { name: 'Mi (E4)', freq: 329.63 },
  { name: 'Fa (F4)', freq: 349.23 },
  { name: 'Sol (G4)', freq: 392.00 },
  { name: 'La (A4)', freq: 440.00 },
  { name: 'Si (B4)', freq: 493.88 },
  { name: 'Do (C5)', freq: 523.25 },
];

// Información sobre tipos de onda
const WAVE_INFO: Record<WaveType, { name: string; description: string; icon: string }> = {
  sine: {
    name: 'Senoidal',
    description: 'Onda pura y suave. Es el sonido más básico, sin armónicos. Se usa como referencia en física.',
    icon: '〜',
  },
  square: {
    name: 'Cuadrada',
    description: 'Sonido brillante y metálico. Contiene solo armónicos impares. Popular en música electrónica y videojuegos retro.',
    icon: '⊓',
  },
  triangle: {
    name: 'Triangular',
    description: 'Sonido suave similar a una flauta. Contiene armónicos impares que decaen rápidamente.',
    icon: '△',
  },
  sawtooth: {
    name: 'Diente de sierra',
    description: 'Sonido rico y brillante. Contiene todos los armónicos. Se usa mucho en sintetizadores para simular instrumentos de cuerda.',
    icon: '⩘',
  },
};

// Función para formatear tamaño de archivo
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Función para formatear tiempo
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function GeneradorOndasPage() {
  // Estado de modo/pestaña
  const [activeTab, setActiveTab] = useState<TabMode>('generator');

  // ========== MODO GENERADOR ==========
  const [waveType, setWaveType] = useState<WaveType>('sine');
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  // ========== MODO VISUALIZADOR ==========
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [waveformStyle, setWaveformStyle] = useState<'bars' | 'line' | 'mirror'>('bars');
  const [waveformColor, setWaveformColor] = useState('#2E86AB');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializar AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // ========== FUNCIONES MODO GENERADOR ==========

  // Iniciar oscilador
  const startOscillator = useCallback(() => {
    const audioContext = getAudioContext();

    // Crear nodos
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const analyser = audioContext.createAnalyser();

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume / 100, audioContext.currentTime);

    analyser.fftSize = 2048;

    // Conectar: oscillator -> gain -> analyser -> destination
    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    analyserRef.current = analyser;
    setIsPlaying(true);

    // Iniciar visualización
    drawGeneratorWaveform();
  }, [waveType, frequency, volume, getAudioContext]);

  // Detener oscilador
  const stopOscillator = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);

    // Limpiar canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Actualizar frecuencia en tiempo real
  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current!.currentTime);
    }
  }, [frequency, isPlaying]);

  // Actualizar volumen en tiempo real
  useEffect(() => {
    if (gainNodeRef.current && isPlaying) {
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current!.currentTime);
    }
  }, [volume, isPlaying]);

  // Actualizar tipo de onda en tiempo real
  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.type = waveType;
    }
  }, [waveType, isPlaying]);

  // Dibujar waveform del generador
  const drawGeneratorWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;

      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteTimeDomainData(dataArray);

      // Limpiar
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar onda
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2E86AB';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, []);

  // Toggle play/stop
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopOscillator();
    } else {
      startOscillator();
    }
  }, [isPlaying, startOscillator, stopOscillator]);

  // Limpiar al cambiar de pestaña
  useEffect(() => {
    if (activeTab !== 'generator' && isPlaying) {
      stopOscillator();
    }
  }, [activeTab, isPlaying, stopOscillator]);

  // ========== FUNCIONES MODO VISUALIZADOR ==========

  // Cargar archivo de audio
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Por favor, selecciona un archivo de audio válido');
      return;
    }

    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = getAudioContext();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);

      setAudioBuffer(buffer);
      setAudioDuration(buffer.duration);

      // Dibujar waveform
      drawVisualizerWaveform(buffer);
    } catch {
      alert('Error al procesar el archivo de audio');
    }
  }, [getAudioContext]);

  // Dibujar waveform del visualizador
  const drawVisualizerWaveform = useCallback((buffer: AudioBuffer) => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);

    // Fondo
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const centerY = height / 2;
    const amplitude = height / 2 - 20;

    if (waveformStyle === 'bars') {
      // Estilo barras
      const barWidth = Math.max(1, Math.floor(width / 200));
      const barStep = Math.ceil(data.length / (width / barWidth));

      ctx.fillStyle = waveformColor;

      for (let i = 0; i < width; i += barWidth + 1) {
        const dataIndex = Math.floor((i / width) * data.length);
        let sum = 0;
        let count = 0;

        for (let j = 0; j < barStep && dataIndex + j < data.length; j++) {
          sum += Math.abs(data[dataIndex + j]);
          count++;
        }

        const avg = sum / count;
        const barHeight = avg * amplitude * 2;

        ctx.fillRect(i, centerY - barHeight / 2, barWidth, barHeight);
      }
    } else if (waveformStyle === 'line') {
      // Estilo línea
      ctx.beginPath();
      ctx.strokeStyle = waveformColor;
      ctx.lineWidth = 2;

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < step; j++) {
          const datum = data[i * step + j];
          if (datum !== undefined) {
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
        }

        const y = centerY + ((min + max) / 2) * amplitude;

        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }

      ctx.stroke();
    } else if (waveformStyle === 'mirror') {
      // Estilo espejo
      ctx.fillStyle = waveformColor;

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < step; j++) {
          const datum = data[i * step + j];
          if (datum !== undefined) {
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
        }

        const minY = centerY + min * amplitude;
        const maxY = centerY + max * amplitude;

        ctx.fillRect(i, minY, 1, maxY - minY);
      }
    }
  }, [waveformStyle, waveformColor, bgColor]);

  // Redibujar cuando cambian los estilos
  useEffect(() => {
    if (audioBuffer) {
      drawVisualizerWaveform(audioBuffer);
    }
  }, [audioBuffer, waveformStyle, waveformColor, bgColor, drawVisualizerWaveform]);

  // Exportar waveform como imagen
  const exportWaveform = useCallback(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `waveform_${audioFile?.name.replace(/\.[^.]+$/, '') || 'audio'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [audioFile]);

  // Handlers de drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Limpiar visualizador
  const clearVisualizer = useCallback(() => {
    setAudioFile(null);
    setAudioBuffer(null);
    setAudioDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const canvas = visualizerCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [bgColor]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>〜</span>
        <h1 className={styles.title}>Generador de Ondas y Visualizador</h1>
        <p className={styles.subtitle}>
          Explora las ondas sonoras: genera tonos, visualiza audio y aprende física del sonido
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Pestañas */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'generator' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            🎛️ Generador de Tonos
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'visualizer' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('visualizer')}
          >
            📊 Visualizador de Audio
          </button>
        </div>

        {/* ========== MODO GENERADOR ========== */}
        {activeTab === 'generator' && (
          <div className={styles.generatorPanel}>
            {/* Canvas de visualización */}
            <div className={styles.canvasContainer}>
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className={styles.canvas}
              />
              {!isPlaying && (
                <div className={styles.canvasPlaceholder}>
                  <span>Pulsa reproducir para ver la onda</span>
                </div>
              )}
            </div>

            {/* Tipo de onda */}
            <div className={styles.section}>
              <h3>Tipo de onda</h3>
              <div className={styles.waveTypes}>
                {(Object.keys(WAVE_INFO) as WaveType[]).map((type) => (
                  <button
                    key={type}
                    className={`${styles.waveTypeBtn} ${waveType === type ? styles.waveTypeActive : ''}`}
                    onClick={() => setWaveType(type)}
                  >
                    <span className={styles.waveIcon}>{WAVE_INFO[type].icon}</span>
                    <span className={styles.waveName}>{WAVE_INFO[type].name}</span>
                  </button>
                ))}
              </div>
              <p className={styles.waveDescription}>{WAVE_INFO[waveType].description}</p>
            </div>

            {/* Frecuencia */}
            <div className={styles.section}>
              <h3>Frecuencia: {formatNumber(frequency, 1)} Hz</h3>
              <input
                type="range"
                min={20}
                max={2000}
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>20 Hz (grave)</span>
                <span>2000 Hz (agudo)</span>
              </div>

              {/* Notas musicales */}
              <div className={styles.musicalNotes}>
                <span className={styles.notesLabel}>Notas musicales:</span>
                <div className={styles.notesGrid}>
                  {MUSICAL_NOTES.map((note) => (
                    <button
                      key={note.name}
                      className={`${styles.noteBtn} ${Math.abs(frequency - note.freq) < 1 ? styles.noteBtnActive : ''}`}
                      onClick={() => setFrequency(note.freq)}
                    >
                      {note.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Volumen */}
            <div className={styles.section}>
              <h3>Volumen: {volume}%</h3>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className={styles.slider}
              />
            </div>

            {/* Botón reproducir */}
            <div className={styles.playSection}>
              <button
                onClick={togglePlay}
                className={`${styles.playBtn} ${isPlaying ? styles.playBtnActive : ''}`}
              >
                {isPlaying ? '⏹️ Detener' : '▶️ Reproducir'}
              </button>
            </div>
          </div>
        )}

        {/* ========== MODO VISUALIZADOR ========== */}
        {activeTab === 'visualizer' && (
          <div className={styles.visualizerPanel}>
            {/* Zona de carga */}
            {!audioFile && (
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className={styles.dropIcon}>🎵</span>
                <p className={styles.dropText}>Arrastra un archivo de audio o haz clic para seleccionar</p>
                <span className={styles.dropHint}>MP3, WAV, OGG, M4A</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className={styles.fileInput}
                />
              </div>
            )}

            {/* Visualizador */}
            {audioFile && (
              <>
                {/* Info del archivo */}
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{audioFile.name}</span>
                  <span className={styles.fileMeta}>
                    {formatSize(audioFile.size)} • {formatTime(audioDuration)}
                  </span>
                  <button onClick={clearVisualizer} className={styles.clearBtn}>
                    Cambiar archivo
                  </button>
                </div>

                {/* Canvas */}
                <div className={styles.canvasContainer}>
                  <canvas
                    ref={visualizerCanvasRef}
                    width={800}
                    height={200}
                    className={styles.canvas}
                  />
                </div>

                {/* Opciones de estilo */}
                <div className={styles.styleOptions}>
                  <div className={styles.styleSection}>
                    <h4>Estilo</h4>
                    <div className={styles.styleButtons}>
                      <button
                        className={`${styles.styleBtn} ${waveformStyle === 'bars' ? styles.styleBtnActive : ''}`}
                        onClick={() => setWaveformStyle('bars')}
                      >
                        ▮▮▮ Barras
                      </button>
                      <button
                        className={`${styles.styleBtn} ${waveformStyle === 'line' ? styles.styleBtnActive : ''}`}
                        onClick={() => setWaveformStyle('line')}
                      >
                        〜 Línea
                      </button>
                      <button
                        className={`${styles.styleBtn} ${waveformStyle === 'mirror' ? styles.styleBtnActive : ''}`}
                        onClick={() => setWaveformStyle('mirror')}
                      >
                        ⫼ Espejo
                      </button>
                    </div>
                  </div>

                  <div className={styles.colorSection}>
                    <div className={styles.colorPicker}>
                      <label>Color onda</label>
                      <input
                        type="color"
                        value={waveformColor}
                        onChange={(e) => setWaveformColor(e.target.value)}
                      />
                    </div>
                    <div className={styles.colorPicker}>
                      <label>Color fondo</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Botón exportar */}
                <div className={styles.exportSection}>
                  <button onClick={exportWaveform} className={styles.exportBtn}>
                    📥 Exportar como PNG
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Características */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🎛️</span>
            <h4>Generador de tonos</h4>
            <p>Genera ondas senoidales, cuadradas, triangulares y diente de sierra</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🎵</span>
            <h4>Notas musicales</h4>
            <p>Presets con las frecuencias exactas de las notas Do a Si</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📊</span>
            <h4>Visualizador</h4>
            <p>Convierte cualquier audio en waveform visual con 3 estilos</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🎨</span>
            <h4>Personalizable</h4>
            <p>Elige colores y estilo, exporta como imagen PNG</p>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre ondas sonoras?"
        subtitle="Descubre la física del sonido y cómo funcionan las ondas"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es una onda sonora?</h2>
          <p className={styles.introParagraph}>
            El sonido es una vibración que se propaga como una onda a través del aire (u otro medio).
            Las características de esta onda determinan cómo percibimos el sonido: su tono, volumen y timbre.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔊 Frecuencia (Hz)</h4>
              <p>
                La frecuencia mide cuántas vibraciones ocurren por segundo. Se mide en Hercios (Hz).
                A mayor frecuencia, el sonido es más agudo. El oído humano percibe de 20 Hz a 20.000 Hz.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📏 Amplitud</h4>
              <p>
                La amplitud determina el volumen del sonido. Mayor amplitud = sonido más fuerte.
                En la visualización, se ve como ondas más altas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎸 Timbre</h4>
              <p>
                El timbre es lo que hace que un piano suene diferente a una guitarra aunque
                toquen la misma nota. Depende de los armónicos (ondas adicionales).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🌊 Longitud de onda</h4>
              <p>
                Es la distancia entre dos picos consecutivos de la onda.
                A mayor frecuencia, menor longitud de onda.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Tipos de ondas</h2>

          <div className={styles.waveExplanation}>
            <div className={styles.waveCard}>
              <h4>〜 Onda Senoidal</h4>
              <p>
                La onda más pura y simple. No tiene armónicos, solo la frecuencia fundamental.
                Es el &quot;ladrillo&quot; básico del sonido. Todos los sonidos complejos pueden
                descomponerse en sumas de ondas senoidales (serie de Fourier).
              </p>
              <span className={styles.waveUse}>Uso: Referencia en física, pruebas de audio, tonos puros</span>
            </div>
            <div className={styles.waveCard}>
              <h4>⊓ Onda Cuadrada</h4>
              <p>
                Alterna bruscamente entre dos valores. Contiene solo armónicos impares
                (3ª, 5ª, 7ª...). Suena metálico y brillante.
              </p>
              <span className={styles.waveUse}>Uso: Música electrónica, videojuegos 8-bit, sintetizadores</span>
            </div>
            <div className={styles.waveCard}>
              <h4>△ Onda Triangular</h4>
              <p>
                Sube y baja linealmente formando triángulos. También tiene solo armónicos impares,
                pero decaen más rápido que en la cuadrada. Sonido más suave.
              </p>
              <span className={styles.waveUse}>Uso: Simular flautas, sonidos suaves, síntesis substractiva</span>
            </div>
            <div className={styles.waveCard}>
              <h4>⩘ Onda Diente de Sierra</h4>
              <p>
                Sube gradualmente y cae bruscamente (o viceversa). Contiene TODOS los armónicos,
                tanto pares como impares. Es la más rica en contenido armónico.
              </p>
              <span className={styles.waveUse}>Uso: Sintetizadores, simular cuerdas y vientos, bases para filtros</span>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué el La4 tiene frecuencia 440 Hz?</h4>
              <p>
                Es un estándar internacional adoptado en 1955. Antes de eso, cada orquesta
                afinaba de forma diferente. 440 Hz se eligió como referencia universal
                para que todos los instrumentos suenen en armonía.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué son los armónicos?</h4>
              <p>
                Son frecuencias múltiplos de la fundamental. Si tocas un La (440 Hz), también
                suenan 880 Hz, 1320 Hz, etc., pero más débiles. La combinación de estos
                armónicos es lo que da el timbre característico a cada instrumento.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué no puedo escuchar frecuencias muy altas o bajas?</h4>
              <p>
                El oído humano solo detecta vibraciones entre ~20 Hz y ~20.000 Hz.
                Por debajo de 20 Hz (infrasonidos) sentimos presión pero no &quot;oímos&quot;.
                Por encima de 20 kHz (ultrasonidos) simplemente no los percibimos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Para qué sirve visualizar audio como waveform?</h4>
              <p>
                Permite ver la &quot;forma&quot; del sonido: identificar silencios, picos de volumen,
                patrones rítmicos. Es útil para edición de audio, producción musical y
                compartir fragmentos de podcast/música en redes sociales.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-ondas')} />

      <Footer appName="generador-ondas" />
    </div>
  );
}
