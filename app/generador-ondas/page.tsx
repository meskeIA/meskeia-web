'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './GeneradorOndas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { envolventePorColumna, formatearTamano } from './motor';

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

/**
 * Rampa de ganancia para arrancar, parar, cambiar el volumen y salir de la página, en segundos
 * (hallazgos 1757-1760; el mismo arreglo que los 1637/1638 de generador-tonos). Un escalón de
 * ganancia es un transitorio de banda ancha: se oye como un chasquido.
 */
const RAMPA_GANANCIA_S = 0.05;

/** Nodos de un tono: se sueltan juntos cuando el oscilador termina de sonar. */
interface NodosTono {
  oscilador: OscillatorNode;
  ganancia: GainNode;
  analizador: AnalyserNode;
}

/**
 * Lleva la ganancia a 0 con una rampa ANCLADA en el valor en curso y programa el stop() del
 * oscilador al final de la rampa, en el reloj de audio. Sin el setValueAtTime, una rampa de Web
 * Audio arranca en el evento anterior (la rampa de entrada) y la bajada sería un escalón. Los
 * nodos se desconectan cuando el oscilador acaba de verdad (onended): desconectarlos en el acto
 * cortaría la rampa. `alTerminar` se llama en ese mismo momento (p. ej. para cerrar el contexto).
 * Devuelve el instante de audio en que termina.
 */
function apagarTono(ctx: AudioContext, nodos: NodosTono, alTerminar?: () => void): number {
  const ahora = ctx.currentTime;
  const fin = ahora + RAMPA_GANANCIA_S;
  const g = nodos.ganancia.gain;
  g.cancelScheduledValues(ahora);
  g.setValueAtTime(g.value, ahora);
  g.linearRampToValueAtTime(0, fin);
  nodos.oscilador.onended = () => {
    nodos.oscilador.disconnect();
    nodos.ganancia.disconnect();
    nodos.analizador.disconnect();
    alTerminar?.();
  };
  try {
    nodos.oscilador.stop(fin);
  } catch {
    // El oscilador ya estaba detenido
  }
  return fin;
}

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
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    // Crear nodos
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const analyser = audioContext.createAnalyser();

    const t0 = audioContext.currentTime;
    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, t0);
    // Rampa de entrada 0 → volumen (hallazgo 1758). El efecto de volumen ya no la pisa: solo
    // reacciona a cambios del VOLUMEN, no al paso de isPlaying a true.
    gainNode.gain.setValueAtTime(0, t0);
    gainNode.gain.linearRampToValueAtTime(volume / 100, t0 + RAMPA_GANANCIA_S);

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

  // Detener oscilador: rampa de salida y stop() al final de la rampa (hallazgo 1760). Los refs
  // se sueltan ya, para que el efecto de volumen no toque la ganancia que se está apagando y un
  // Reproducir inmediato cree un tono nuevo e independiente.
  const stopOscillator = useCallback(() => {
    const ctx = audioContextRef.current;
    const oscilador = oscillatorRef.current;
    const ganancia = gainNodeRef.current;
    const analizador = analyserRef.current;
    oscillatorRef.current = null;
    gainNodeRef.current = null;
    analyserRef.current = null;
    if (ctx && oscilador && ganancia && analizador) {
      apagarTono(ctx, { oscilador, ganancia, analizador });
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

  /**
   * Volumen en tiempo real, con rampa anclada en el valor en curso (hallazgos 1758 y 1759).
   * Dependía de [volume, isPlaying] y hacía setValueAtTime(volumen): al pasar isPlaying a true
   * pisaba la rampa de entrada, y mover el deslizador era un escalón. Ahora solo reacciona al
   * volumen; gainNodeRef solo existe mientras el tono suena (stopOscillator lo suelta).
   */
  useEffect(() => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !gain) return;
    const ahora = ctx.currentTime;
    gain.gain.cancelScheduledValues(ahora);
    gain.gain.setValueAtTime(gain.gain.value, ahora);
    gain.gain.linearRampToValueAtTime(volume / 100, ahora + RAMPA_GANANCIA_S);
  }, [volume]);

  /**
   * Limpieza al desmontar (hallazgo 1757). Sin ella, una navegación de cliente con el tono
   * sonando dejaba vivos oscilador, ganancia y AudioContext: el tono seguía en la app de destino
   * y ningún Detener lo alcanzaba. Ahora: rampa de salida, stop() al final de la rampa y close()
   * del contexto cuando el oscilador termina (con un temporizador de respaldo por si el
   * contexto no llega a avanzar). El ref del contexto se suelta en el acto, para que un
   * remontaje (StrictMode en desarrollo) cree uno nuevo en vez de reutilizar uno cerrado.
   */
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      const ctx = audioContextRef.current;
      const oscilador = oscillatorRef.current;
      const ganancia = gainNodeRef.current;
      const analizador = analyserRef.current;
      audioContextRef.current = null;
      oscillatorRef.current = null;
      gainNodeRef.current = null;
      analyserRef.current = null;
      if (!ctx) return;
      let cerrado = false;
      const cerrar = () => {
        if (cerrado) return;
        cerrado = true;
        ctx.close().catch(() => {
          // El contexto ya estaba cerrado
        });
      };
      if (oscilador && ganancia && analizador && ctx.state === 'running') {
        apagarTono(ctx, { oscilador, ganancia, analizador }, cerrar);
        window.setTimeout(cerrar, RAMPA_GANANCIA_S * 1000 + 500);
      } else {
        cerrar();
      }
    };
  }, []);

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

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = getAudioContext();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);

      // El archivo se da por cargado solo cuando se ha podido decodificar (hallazgo 1762): antes
      // se fijaba antes del try y un error dejaba la vista de «archivo cargado» con el lienzo
      // vacío. El dibujo lo hace el efecto de redibujado, cuando el lienzo ya está montado.
      setAudioFile(file);
      setAudioBuffer(buffer);
      setAudioDuration(buffer.duration);
    } catch {
      setAudioFile(null);
      setAudioBuffer(null);
      setAudioDuration(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      // Estilo línea: el CONTORNO de la onda, una línea por los máximos y otra por los mínimos
      // de cada columna (hallazgo 1761). Antes pintaba (min + max)/2, que en cualquier audio
      // simétrico vale ≈ 0: una recta en el eje fuera cual fuera el volumen.
      const columnas = envolventePorColumna(data, width);
      ctx.strokeStyle = waveformColor;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      for (const clave of ['max', 'min'] as const) {
        ctx.beginPath();
        columnas.forEach((col, i) => {
          // En el lienzo la y crece hacia abajo: el máximo va por encima del eje.
          const y = centerY - col[clave] * amplitude;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        });
        ctx.stroke();
      }
    } else if (waveformStyle === 'mirror') {
      // Estilo espejo: la banda entre el mínimo y el máximo de cada columna, rellena.
      ctx.fillStyle = waveformColor;
      envolventePorColumna(data, width).forEach((col, i) => {
        const minY = centerY + col.min * amplitude;
        const maxY = centerY + col.max * amplitude;
        ctx.fillRect(i, minY, 1, Math.max(1, maxY - minY));
      });
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
        <span className={styles.heroIcon} aria-hidden="true">〜</span>
        <h1 className={styles.title}>Generador de Ondas y Visualizador</h1>
        <p className={styles.subtitle}>
          Explora las ondas sonoras: genera tonos, visualiza audio y aprende física del sonido
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Pestañas */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'generator' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('generator')}
            aria-pressed={activeTab === 'generator'}
          >
            <span aria-hidden="true">🎛️</span> Generador de Tonos
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'visualizer' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('visualizer')}
            aria-pressed={activeTab === 'visualizer'}
          >
            <span aria-hidden="true">📊</span> Visualizador de Audio
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
                    type="button"
                    className={`${styles.waveTypeBtn} ${waveType === type ? styles.waveTypeActive : ''}`}
                    onClick={() => setWaveType(type)}
                    aria-pressed={waveType === type}
                  >
                    <span className={styles.waveIcon} aria-hidden="true">{WAVE_INFO[type].icon}</span>
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
                aria-label="Frecuencia"
                aria-valuetext={`${formatNumber(frequency, Number.isInteger(frequency) ? 0 : 2)} Hz`}
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
                      type="button"
                      className={`${styles.noteBtn} ${Math.abs(frequency - note.freq) < 1 ? styles.noteBtnActive : ''}`}
                      onClick={() => setFrequency(note.freq)}
                      aria-pressed={Math.abs(frequency - note.freq) < 1}
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
                aria-label="Volumen"
                aria-valuetext={`${volume} %`}
              />
            </div>

            {/* Botón reproducir. Sin aria-pressed a propósito (hallazgo 1766): el estado ya lo dice
                el nombre, que cambia de «Reproducir» a «Detener»; con los dos se anunciaba
                «Detener, conmutador, presionado». */}
            <div className={styles.playSection}>
              {/* a11y-ok: el nombre cambia con el estado; aria-pressed lo duplicaría (hallazgo 1766) */}
              <button
                type="button"
                onClick={togglePlay}
                className={`${styles.playBtn} ${isPlaying ? styles.playBtnActive : ''}`}
              >
                {isPlaying ? <><span aria-hidden="true">⏹️</span> Detener</> : <><span aria-hidden="true">▶️</span> Reproducir</>}
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
                <span className={styles.dropIcon} aria-hidden="true">🎵</span>
                <p className={styles.dropText}>Arrastra un archivo de audio o haz clic para seleccionar</p>
                {/* Control real para teclado y lectores de pantalla (hallazgo 1764): la zona es
                    un <div> y el <input type="file"> va oculto, así que sin este botón no había
                    forma de cargar un audio sin ratón. */}
                <button
                  type="button"
                  className={styles.chooseBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Elegir archivo de audio
                </button>
                <span className={styles.dropHint}>MP3, WAV, OGG, M4A</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  tabIndex={-1}
                  aria-hidden="true"
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
                    {formatearTamano(audioFile.size)} • {formatTime(audioDuration)}
                  </span>
                  <button type="button" onClick={clearVisualizer} className={styles.clearBtn}>
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
                        type="button"
                        className={`${styles.styleBtn} ${waveformStyle === 'bars' ? styles.styleBtnActive : ''}`}
                        onClick={() => setWaveformStyle('bars')}
                        aria-pressed={waveformStyle === 'bars'}
                      >
                        <span aria-hidden="true">▮▮▮</span> Barras
                      </button>
                      <button
                        type="button"
                        className={`${styles.styleBtn} ${waveformStyle === 'line' ? styles.styleBtnActive : ''}`}
                        onClick={() => setWaveformStyle('line')}
                        aria-pressed={waveformStyle === 'line'}
                      >
                        <span aria-hidden="true">〜</span> Línea
                      </button>
                      <button
                        type="button"
                        className={`${styles.styleBtn} ${waveformStyle === 'mirror' ? styles.styleBtnActive : ''}`}
                        onClick={() => setWaveformStyle('mirror')}
                        aria-pressed={waveformStyle === 'mirror'}
                      >
                        <span aria-hidden="true">⫼</span> Espejo
                      </button>
                    </div>
                  </div>

                  <div className={styles.colorSection}>
                    <div className={styles.colorPicker}>
                      <label htmlFor="generador-ondas-color-onda">Color onda</label>
                      <input
                        id="generador-ondas-color-onda"
                        type="color"
                        value={waveformColor}
                        onChange={(e) => setWaveformColor(e.target.value)}
                      />
                    </div>
                    <div className={styles.colorPicker}>
                      <label htmlFor="generador-ondas-color-fondo">Color fondo</label>
                      <input
                        id="generador-ondas-color-fondo"
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Botón exportar */}
                <div className={styles.exportSection}>
                  <button type="button" onClick={exportWaveform} className={styles.exportBtn}>
                    <span aria-hidden="true">📥</span> Exportar como PNG
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Características */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">🎛️</span>
            <h4>Generador de tonos</h4>
            <p>Genera ondas senoidales, cuadradas, triangulares y diente de sierra</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">🎵</span>
            <h4>Notas musicales</h4>
            <p>Presets con las frecuencias exactas de las notas Do a Si</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">📊</span>
            <h4>Visualizador</h4>
            <p>Convierte cualquier audio en waveform visual con 3 estilos</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon} aria-hidden="true">🎨</span>
            <h4>Personalizable</h4>
            <p>Elige colores y estilo, exporta como imagen PNG</p>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre ondas sonoras?"
        subtitle="Descubre la física del sonido y cómo funcionan las ondas"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo de onda</th>
                <th>Armónicos</th>
                <th>Sonido característico</th>
                <th>Uso musical</th>
                <th>Uso técnico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Senoidal</strong></td>
                <td>Ninguno (pura)</td>
                <td>Suave, fluido, limpio</td>
                <td>Referencia afinación, sintetizadores</td>
                <td>Pruebas de audio, calibración</td>
              </tr>
              <tr>
                <td><strong>Cuadrada</strong></td>
                <td>Solo impares (3ª, 5ª, 7ª...)</td>
                <td>Metálico, brillante, 8-bit</td>
                <td>Música electrónica, chiptune</td>
                <td>Señales digitales, reloj</td>
              </tr>
              <tr>
                <td><strong>Triangular</strong></td>
                <td>Impares (decaen rápido)</td>
                <td>Suave, similar a flauta</td>
                <td>Síntesis substractiva, pad</td>
                <td>Generadores de rampa</td>
              </tr>
              <tr>
                <td><strong>Diente de sierra</strong></td>
                <td>Todos (pares e impares)</td>
                <td>Brillante, rico, complejo</td>
                <td>Simular cuerdas y vientos</td>
                <td>Osciladores, LFO</td>
              </tr>
              <tr>
                <td><strong>20 Hz (límite grave)</strong></td>
                <td>Variable</td>
                <td>Límite inferior de lo audible: se nota más como vibración que como tono</td>
                <td>Efectos sub-graves (cine)</td>
                <td>Medición de resonancias</td>
              </tr>
              <tr>
                <td><strong>440 Hz (La4)</strong></td>
                <td>Según tipo</td>
                <td>Nota de referencia</td>
                <td>Afinación estándar ISO 16</td>
                <td>Calibración de afinadores</td>
              </tr>
              <tr>
                <td><strong>1.000–4.000 Hz</strong></td>
                <td>Variable</td>
                <td>Zona más sensible del oído</td>
                <td>Voz, guitarra, piano</td>
                <td>Test de agudeza auditiva</td>
              </tr>
              <tr>
                <td><strong>20.000 Hz (límite agudo)</strong></td>
                <td>Variable</td>
                <td>Límite superior del oído joven; baja con la edad</td>
                <td>No aplicable</td>
                <td>Por encima empiezan los ultrasonidos (limpieza por ultrasonidos, de unos 20 a 40 kHz)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🎸</span> Afinar instrumentos</h3>
            <p>Genera un La4 a 440 Hz con onda senoidal pura como referencia para afinar guitarra, violín o cualquier instrumento acústico sin necesidad de afinador físico.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🔬</span> Experimentos de física</h3>
            <p>Visualiza en tiempo real las diferencias entre ondas senoidal, cuadrada, triangular y diente de sierra. Ideal para clases de acústica o proyectos de laboratorio.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🎮</span> Efectos 8-bit</h3>
            <p>La onda cuadrada es la base de los sonidos de videojuegos retro (NES, Game Boy). Experimenta con frecuencias para recrear efectos clásicos de chiptune.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🔊</span> Probar altavoces en graves y medios</h3>
            <p>Recorre el deslizador de 20 a 2.000 Hz, despacio y a volumen bajo, para detectar vibraciones, zumbidos o resonancias en graves y medios. Esta app no hace barridos automáticos ni llega a los agudos: para eso, el Generador de Tonos de meskeIA cubre hasta 20.000 Hz.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🧘</span> Meditación y relajación</h3>
            <p>Un tono puro y suave, a volumen bajo, puede servir de fondo para meditar. Las listas de frecuencias «curativas» que circulan en internet (las llamadas «solfeggio») no tienen estudios sólidos que respalden sus supuestos efectos. Y esta app emite un solo tono mono: no sirve para pulsos binaurales, que necesitan una frecuencia distinta en cada oído.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🎛️</span> Producción musical</h3>
            <p>Usa el visualizador para ver la envolvente de una grabación: silencios, picos de volumen y tramos que tocan el techo y pueden estar saturados (clipping).</p>
          </div>
        </div>

        {/* FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <h3>¿Por qué uso Web Audio API y no un archivo de audio?</h3>
            <p>La Web Audio API genera las ondas matemáticamente en tiempo real, directamente en tu navegador. Esto permite frecuencias exactas, sin artefactos de compresión MP3 y con latencia mínima, sin necesidad de descargar ningún archivo.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Puedo usar esto para afinar una guitarra?</h3>
            <p>Sí. Selecciona onda senoidal y ajusta la frecuencia a la nota que necesitas (Mi4=329,6 Hz, Si3=246,9 Hz, Sol3=196 Hz, Re3=146,8 Hz, La2=110 Hz, Mi2=82,4 Hz). Compara el tono que escuchas con tu instrumento.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Por qué la onda cuadrada suena &quot;más fuerte&quot; que la senoidal al mismo volumen?</h3>
            <p>Porque la onda cuadrada tiene mayor valor eficaz (RMS). A la misma amplitud de pico, la cuadrada tiene 1,41 veces (√2) el valor eficaz de la senoidal y, como la potencia va con su cuadrado, el doble de potencia (unos 3 dB más). Además, sus armónicos caen en frecuencias a las que el oído es más sensible.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué es la Serie de Fourier que menciona la app?</h3>
            <p>Es el principio matemático que demuestra que cualquier sonido complejo puede descomponerse en suma de ondas senoidales simples. La onda cuadrada, por ejemplo, es la suma de infinitas senoidales con frecuencias 1f, 3f, 5f, 7f... con amplitudes decrecientes.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿El visualizador de audio funciona con cualquier archivo?</h3>
            <p>Con cualquier audio que tu navegador sepa decodificar: MP3, WAV, OGG o AAC, según el navegador. La app lee las muestras del archivo y dibuja su forma de onda completa, la amplitud a lo largo del tiempo, como una imagen fija. No es un analizador de espectro: no reproduce el audio ni calcula su FFT.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Puedo exportar la visualización como imagen?</h3>
            <p>Sí. La app permite exportar el waveform como PNG. Útil para compartir en redes sociales, incluir en presentaciones o crear carátulas de podcast con forma de onda visual.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿A qué volumen es seguro usar esta herramienta?</h3>
            <p>La OMS recomienda no superar 85 dB durante más de 8 horas. Con auriculares a máximo volumen puedes superar los 100 dB fácilmente. Usa el generador a un volumen cómodo, nunca al máximo.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Qué diferencia hay entre frecuencia y tono?</h3>
            <p>La frecuencia es la medida física (Hz). El tono es la percepción subjetiva que tenemos de ella. El oído humano no es lineal: percibimos el doble de &quot;altura&quot; al doblar la frecuencia (una octava), pero no todos los Hz son igual de perceptibles.</p>
          </li>
        </ul>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Selecciona el tipo de onda</h3>
              <p>Elige entre senoidal (pura), cuadrada (brillante), triangular (suave) o diente de sierra (rica en armónicos) según tu objetivo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Ajusta la frecuencia</h3>
              <p>Usa el slider (20-2000 Hz) o los botones de notas musicales (Do a Si). Para afinar a La4 estándar, selecciona &quot;La (A4)&quot; = 440 Hz.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Controla el volumen</h3>
              <p>Ajusta el volumen antes de reproducir. Empieza siempre bajo y súbelo gradualmente para proteger tu oído, especialmente con auriculares.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Pulsa Reproducir</h3>
              <p>El tono se genera en tiempo real. La onda aparece visualizada en el canvas. Puedes cambiar los parámetros mientras el sonido está activo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Usa el Visualizador de Audio</h3>
              <p>Cambia a la pestaña &quot;Visualizador&quot;, carga un archivo de audio y observa su forma de onda. Elige entre los estilos de visualización disponibles.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Personaliza colores y estilo</h3>
              <p>Cambia el color de la onda, el fondo y el estilo de visualización para conseguir el aspecto que necesitas antes de exportar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Exporta como imagen PNG</h3>
              <p>Pulsa el botón de exportar para guardar la visualización como PNG. Ideal para carátulas de podcast, presentaciones o publicaciones en redes.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🎯</span> Usa senoidal para afinación</h3>
            <p>Para afinar instrumentos, la onda senoidal es la más precisa: no tiene armónicos que confundan el oído al comparar tonos.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🔉</span> Empieza con volumen bajo</h3>
            <p>Especialmente al generar frecuencias agudas (&gt;1000 Hz), empieza al 20-30% de volumen. Las frecuencias altas pueden ser más molestas de lo esperado.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🎵</span> Aprende las frecuencias de las notas</h3>
            <p>La4=440Hz, Sol4=392Hz, Mi4=329,6Hz, Do4=261,6Hz, Si3=246,9Hz. Memorizarlas te ayuda a afinar de oído más rápido.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">📊</span> Compara las formas de onda en el osciloscopio</h3>
            <p>Con el tono sonando, cambia de senoidal a cuadrada, triangular o diente de sierra: el osciloscopio muestra la forma nueva al instante y el oído nota el cambio de timbre a la misma frecuencia.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🎬</span> Ajusta los colores antes de exportar</h3>
            <p>El PNG sale siempre a 800 × 200 píxeles. Para vídeos o presentaciones, elige un color de onda y de fondo que contrasten con tu diseño antes de exportar.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">⚡</span> Recorre los extremos del deslizador</h3>
            <p>Prueba 20 Hz (lo notarás más como vibración que como tono) y sube hasta 2.000 Hz: a igual volumen, los graves parecen mucho más flojos, porque el oído es menos sensible a ellos.</p>
          </div>
        </div>

        {/* Aviso importante */}
        <div className={styles.warningBox}>
          <h3><span aria-hidden="true">⚠️</span> Protege tu audición</h3>
          <ul className={styles.warningList}>
            <li>La exposición prolongada a sonidos por encima de 85 dB puede causar daño auditivo permanente.</li>
            <li>Con auriculares a máximo volumen puedes superar los 100-110 dB fácilmente.</li>
            <li>Las frecuencias muy agudas (&gt;8000 Hz) son especialmente fatigantes para el oído.</li>
            <li>Si experimentas pitidos en los oídos después de usar la app, descansa y baja el volumen.</li>
          </ul>
        </div>

        <section className={styles.guideSection}>
          <h2>¿Qué es una onda sonora?</h2>
          <p className={styles.introParagraph}>
            El sonido es una vibración que se propaga como una onda a través del aire (u otro medio).
            Las características de esta onda determinan cómo percibimos el sonido: su tono, volumen y timbre.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🔊</span> Frecuencia (Hz)</h4>
              <p>
                La frecuencia mide cuántas vibraciones ocurren por segundo. Se mide en Hercios (Hz).
                A mayor frecuencia, el sonido es más agudo. El oído humano percibe de 20 Hz a 20.000 Hz.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📏</span> Amplitud</h4>
              <p>
                La amplitud determina el volumen del sonido. Mayor amplitud = sonido más fuerte.
                En la visualización, se ve como ondas más altas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🎸</span> Timbre</h4>
              <p>
                El timbre es lo que hace que un piano suene diferente a una guitarra aunque
                toquen la misma nota. Depende de los armónicos (ondas adicionales).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🌊</span> Longitud de onda</h4>
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
              <h4><span aria-hidden="true">〜</span> Onda Senoidal</h4>
              <p>
                La onda más pura y simple. No tiene armónicos, solo la frecuencia fundamental.
                Es el &quot;ladrillo&quot; básico del sonido. Todos los sonidos complejos pueden
                descomponerse en sumas de ondas senoidales (serie de Fourier).
              </p>
              <span className={styles.waveUse}>Uso: Referencia en física, pruebas de audio, tonos puros</span>
            </div>
            <div className={styles.waveCard}>
              <h4><span aria-hidden="true">⊓</span> Onda Cuadrada</h4>
              <p>
                Alterna bruscamente entre dos valores. Contiene solo armónicos impares
                (3ª, 5ª, 7ª...). Suena metálico y brillante.
              </p>
              <span className={styles.waveUse}>Uso: Música electrónica, videojuegos 8-bit, sintetizadores</span>
            </div>
            <div className={styles.waveCard}>
              <h4><span aria-hidden="true">△</span> Onda Triangular</h4>
              <p>
                Sube y baja linealmente formando triángulos. También tiene solo armónicos impares,
                pero decaen más rápido que en la cuadrada. Sonido más suave.
              </p>
              <span className={styles.waveUse}>Uso: Simular flautas, sonidos suaves, síntesis substractiva</span>
            </div>
            <div className={styles.waveCard}>
              <h4><span aria-hidden="true">⩘</span> Onda Diente de Sierra</h4>
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

      <ShareCard appName="generador-ondas" />
      <Footer appName="generador-ondas" />
    </div>
  );
}
