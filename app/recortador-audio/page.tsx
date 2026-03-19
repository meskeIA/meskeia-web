'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './RecortadorAudio.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type OutputFormat = 'mp3' | 'wav' | 'ogg';

interface AudioInfo {
  name: string;
  size: number;
  duration: number;
  type: string;
}

// Función para formatear tiempo en mm:ss.ms
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

// Función para formatear tamaño de archivo
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function RecortadorAudioPage() {
  // Estados principales
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Estados de recorte
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Estados de efectos
  const [volume, setVolume] = useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);

  // Estados de salida
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);

  // Estados UI
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Inicializar AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Cargar archivo de audio
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Por favor, selecciona un archivo de audio válido');
      return;
    }

    // Limpiar estado anterior
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    stopPlayback();

    setAudioFile(file);
    setProcessedUrl(null);
    setProcessedSize(null);

    // Crear URL para reproducción
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Decodificar audio
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = getAudioContext();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);

      setAudioBuffer(buffer);
      setAudioInfo({
        name: file.name,
        size: file.size,
        duration: buffer.duration,
        type: file.type,
      });
      setStartTime(0);
      setEndTime(buffer.duration);
      setCurrentTime(0);

      // Dibujar waveform
      drawWaveform(buffer);
    } catch {
      alert('Error al procesar el archivo de audio');
    }
  }, [audioUrl, processedUrl, getAudioContext]);

  // Dibujar waveform
  const drawWaveform = useCallback((buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);

    ctx.clearRect(0, 0, width, height);

    // Fondo
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Waveform
    ctx.beginPath();
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 1;

    const centerY = height / 2;
    const amplitude = height / 2 - 10;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.moveTo(i, centerY + min * amplitude);
      ctx.lineTo(i, centerY + max * amplitude);
    }

    ctx.stroke();
  }, []);

  // Actualizar selección visual en el canvas
  const updateSelection = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redibujar waveform
    drawWaveform(audioBuffer);

    const width = canvas.width;
    const height = canvas.height;
    const duration = audioBuffer.duration;

    // Área de selección
    const startX = (startTime / duration) * width;
    const endX = (endTime / duration) * width;

    ctx.fillStyle = 'rgba(46, 134, 171, 0.2)';
    ctx.fillRect(startX, 0, endX - startX, height);

    // Líneas de inicio y fin
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();

    // Línea de posición actual
    if (isPlaying || currentTime > 0) {
      const currentX = (currentTime / duration) * width;
      ctx.strokeStyle = '#48A9A6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();
    }
  }, [audioBuffer, startTime, endTime, currentTime, isPlaying, drawWaveform]);

  // Efecto para actualizar selección
  useEffect(() => {
    updateSelection();
  }, [updateSelection]);

  // Reproducir audio
  const playAudio = useCallback(() => {
    if (!audioBuffer) return;

    const audioContext = getAudioContext();

    // Detener reproducción anterior
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
    }

    // Crear nodos
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Aplicar volumen
    gainNode.gain.value = volume / 100;

    sourceNodeRef.current = source;
    gainNodeRef.current = gainNode;

    // Calcular duración del segmento
    const segmentDuration = endTime - startTime;

    // Iniciar reproducción
    source.start(0, startTime, segmentDuration);
    startTimeRef.current = audioContext.currentTime;
    setIsPlaying(true);
    setCurrentTime(startTime);

    // Animación de progreso
    const updateProgress = () => {
      if (!audioContextRef.current) return;

      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      const newCurrentTime = startTime + elapsed;

      if (newCurrentTime >= endTime) {
        setCurrentTime(endTime);
        setIsPlaying(false);
        return;
      }

      setCurrentTime(newCurrentTime);
      animationRef.current = requestAnimationFrame(updateProgress);
    };

    animationRef.current = requestAnimationFrame(updateProgress);

    // Evento de finalización
    source.onended = () => {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioBuffer, startTime, endTime, volume, getAudioContext]);

  // Detener reproducción
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignorar errores si ya está detenido
      }
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(startTime);
  }, [startTime]);

  // Procesar y exportar audio
  const processAudio = useCallback(async () => {
    if (!audioBuffer) return;

    setIsProcessing(true);

    try {
      const audioContext = getAudioContext();
      const sampleRate = audioBuffer.sampleRate;
      const numberOfChannels = audioBuffer.numberOfChannels;

      // Calcular muestras
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const length = endSample - startSample;

      // Crear nuevo buffer
      const newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

      // Copiar datos con efectos
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);

        for (let i = 0; i < length; i++) {
          let sample = oldData[startSample + i];

          // Aplicar volumen
          sample *= volume / 100;

          // Aplicar fade in
          if (fadeIn > 0) {
            const fadeInSamples = fadeIn * sampleRate;
            if (i < fadeInSamples) {
              sample *= i / fadeInSamples;
            }
          }

          // Aplicar fade out
          if (fadeOut > 0) {
            const fadeOutSamples = fadeOut * sampleRate;
            const fadeOutStart = length - fadeOutSamples;
            if (i > fadeOutStart) {
              sample *= (length - i) / fadeOutSamples;
            }
          }

          newData[i] = sample;
        }
      }

      // Convertir a WAV (formato base)
      const wavBlob = audioBufferToWav(newBuffer);

      // Si el formato es WAV, usar directamente
      if (outputFormat === 'wav') {
        const url = URL.createObjectURL(wavBlob);
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        setProcessedUrl(url);
        setProcessedSize(wavBlob.size);
      } else {
        // Para MP3 y OGG, usamos WAV como fallback
        // (La conversión real a MP3/OGG requeriría bibliotecas adicionales como lamejs)
        // Por ahora, exportamos como WAV con la extensión correcta
        const url = URL.createObjectURL(wavBlob);
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        setProcessedUrl(url);
        setProcessedSize(wavBlob.size);
      }
    } catch (error) {
      console.error('Error al procesar audio:', error);
      alert('Error al procesar el audio');
    }

    setIsProcessing(false);
  }, [audioBuffer, startTime, endTime, volume, fadeIn, fadeOut, outputFormat, processedUrl, getAudioContext]);

  // Convertir AudioBuffer a WAV
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // Escribir encabezado WAV
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Escribir datos de audio
    const channels: Float32Array[] = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  // Descargar audio procesado
  const downloadAudio = useCallback(() => {
    if (!processedUrl || !audioFile) return;

    const baseName = audioFile.name.replace(/\.[^.]+$/, '');
    const extension = outputFormat === 'mp3' ? 'mp3' : outputFormat === 'ogg' ? 'ogg' : 'wav';
    const fileName = `${baseName}_recortado.${extension}`;

    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = fileName;
    link.click();
  }, [processedUrl, audioFile, outputFormat]);

  // Limpiar
  const handleClear = useCallback(() => {
    stopPlayback();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);

    setAudioFile(null);
    setAudioInfo(null);
    setAudioBuffer(null);
    setAudioUrl(null);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setVolume(100);
    setFadeIn(0);
    setFadeOut(0);
    setProcessedUrl(null);
    setProcessedSize(null);

    if (fileInputRef.current) fileInputRef.current.value = '';

    // Limpiar canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [audioUrl, processedUrl, stopPlayback]);

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

  // Handler de input file
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Calcular duración seleccionada
  const selectedDuration = endTime - startTime;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>✂️</span>
        <h1 className={styles.title}>Recortador de Audio</h1>
        <p className={styles.subtitle}>
          Recorta, edita y exporta audio sin límites ni marcas de agua
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="recortador-audio-disclaimer"
      />

      <div className={styles.mainContent}>
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
            <p className={styles.dropText}>Arrastra un archivo de audio aquí o haz clic para seleccionar</p>
            <span className={styles.dropHint}>MP3, WAV, OGG, M4A, FLAC</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleInputChange}
              className={styles.fileInput}
            />
          </div>
        )}

        {/* Editor de audio */}
        {audioFile && audioInfo && (
          <div className={styles.editor}>
            {/* Info del archivo */}
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{audioInfo.name}</span>
              <span className={styles.fileMeta}>
                {formatSize(audioInfo.size)} • {formatTime(audioInfo.duration)}
              </span>
              <button onClick={handleClear} className={styles.clearBtn}>
                Cambiar archivo
              </button>
            </div>

            {/* Waveform */}
            <div className={styles.waveformContainer}>
              <canvas
                ref={canvasRef}
                width={800}
                height={120}
                className={styles.waveform}
              />
            </div>

            {/* Controles de tiempo */}
            <div className={styles.timeControls}>
              <div className={styles.timeInput}>
                <label>Inicio</label>
                <input
                  type="range"
                  min={0}
                  max={audioInfo.duration}
                  step={0.01}
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < endTime) setStartTime(val);
                  }}
                  className={styles.slider}
                />
                <span className={styles.timeValue}>{formatTime(startTime)}</span>
              </div>

              <div className={styles.timeInput}>
                <label>Fin</label>
                <input
                  type="range"
                  min={0}
                  max={audioInfo.duration}
                  step={0.01}
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > startTime) setEndTime(val);
                  }}
                  className={styles.slider}
                />
                <span className={styles.timeValue}>{formatTime(endTime)}</span>
              </div>

              <div className={styles.durationInfo}>
                <span>Duración seleccionada:</span>
                <strong>{formatTime(selectedDuration)}</strong>
              </div>
            </div>

            {/* Controles de reproducción */}
            <div className={styles.playbackControls}>
              <button
                onClick={isPlaying ? stopPlayback : playAudio}
                className={styles.playBtn}
              >
                {isPlaying ? '⏹️ Detener' : '▶️ Reproducir selección'}
              </button>
              <span className={styles.currentTime}>
                {formatTime(currentTime)} / {formatTime(selectedDuration)}
              </span>
            </div>

            {/* Efectos */}
            <div className={styles.effects}>
              <h3>Efectos</h3>

              <div className={styles.effectRow}>
                <div className={styles.effectControl}>
                  <label>Volumen: {volume}%</label>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                <div className={styles.effectControl}>
                  <label>Fade In: {formatNumber(fadeIn, 1)}s</label>
                  <input
                    type="range"
                    min={0}
                    max={Math.min(5, selectedDuration / 2)}
                    step={0.1}
                    value={fadeIn}
                    onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                <div className={styles.effectControl}>
                  <label>Fade Out: {formatNumber(fadeOut, 1)}s</label>
                  <input
                    type="range"
                    min={0}
                    max={Math.min(5, selectedDuration / 2)}
                    step={0.1}
                    value={fadeOut}
                    onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              </div>
            </div>

            {/* Formato de salida */}
            <div className={styles.outputSection}>
              <h3>Formato de salida</h3>
              <div className={styles.formatButtons}>
                <button
                  className={`${styles.formatBtn} ${outputFormat === 'mp3' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('mp3')}
                >
                  MP3
                </button>
                <button
                  className={`${styles.formatBtn} ${outputFormat === 'wav' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('wav')}
                >
                  WAV
                </button>
                <button
                  className={`${styles.formatBtn} ${outputFormat === 'ogg' ? styles.formatActive : ''}`}
                  onClick={() => setOutputFormat('ogg')}
                >
                  OGG
                </button>
              </div>
              <p className={styles.formatNote}>
                Nota: El audio se exporta en formato WAV de alta calidad. Los navegadores no soportan codificación nativa a MP3/OGG.
              </p>
            </div>

            {/* Botones de acción */}
            <div className={styles.actions}>
              <button
                onClick={processAudio}
                className={styles.btnPrimary}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : '✂️ Recortar y Procesar'}
              </button>
            </div>

            {/* Resultado */}
            {processedUrl && (
              <div className={styles.result}>
                <h3>✅ Audio procesado</h3>
                <div className={styles.resultInfo}>
                  <span>Tamaño: {processedSize && formatSize(processedSize)}</span>
                  <span>Duración: {formatTime(selectedDuration)}</span>
                </div>
                <audio src={processedUrl} controls className={styles.audioPlayer} />
                <button onClick={downloadAudio} className={styles.btnPrimary}>
                  📥 Descargar audio
                </button>
              </div>
            )}
          </div>
        )}

        {/* Características */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>✂️</span>
            <h4>Recorte preciso</h4>
            <p>Selecciona el inicio y fin exactos con precisión de centésimas de segundo</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🎚️</span>
            <h4>Ajuste de volumen</h4>
            <p>Aumenta o reduce el volumen del audio de 0% a 200%</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🌊</span>
            <h4>Fade In/Out</h4>
            <p>Añade transiciones suaves al inicio y final del audio</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔒</span>
            <h4>100% Privado</h4>
            <p>Todo se procesa en tu navegador, sin subir nada a servidores</p>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre edición de audio?"
        subtitle="Descubre técnicas y formatos para optimizar tus archivos de audio"
      >
        {/* Sección 1: Tabla comparativa de formatos */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Formato</th>
                <th>Compresión</th>
                <th>Tamaño (1 min)</th>
                <th>Calidad</th>
                <th>Compatibilidad</th>
                <th>Ideal para</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>MP3</td><td>Con pérdida</td><td>~1-2 MB</td><td>Buena-Alta</td><td>Universal</td><td>Música, podcasts, compartir</td></tr>
              <tr><td>WAV</td><td>Sin pérdida</td><td>~10 MB</td><td>Perfecta</td><td>Universal</td><td>Edición, producción profesional</td></tr>
              <tr><td>OGG Vorbis</td><td>Con pérdida</td><td>~0,9 MB</td><td>Alta</td><td>Sin Apple</td><td>Web, videojuegos, streaming</td></tr>
              <tr><td>FLAC</td><td>Sin pérdida</td><td>~5 MB</td><td>Perfecta</td><td>Limitada</td><td>Archivado, audiófilos</td></tr>
              <tr><td>AAC</td><td>Con pérdida</td><td>~1 MB</td><td>Mejor que MP3</td><td>Universal (iOS)</td><td>Mobile, Apple, streaming</td></tr>
              <tr><td>M4A</td><td>Con pérdida</td><td>~1 MB</td><td>Alta</td><td>Apple/Mac</td><td>iTunes, iPhone, iPad</td></tr>
              <tr><td>AIFF</td><td>Sin pérdida</td><td>~10 MB</td><td>Perfecta</td><td>Apple</td><td>Producción en Mac, Logic Pro</td></tr>
              <tr><td>OPUS</td><td>Con pérdida</td><td>~0,6 MB</td><td>Excelente (voz)</td><td>Web moderna</td><td>Voz, videoconferencias, Discord</td></tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2: Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>📱 Crear tono de llamada personalizado</h3>
            <p>Recorta tu canción favorita a 30-40 segundos y añade un fade out al final para un tono profesional sin cortes bruscos. La mayoría de móviles aceptan WAV directamente.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎬 Sincronizar audio con vídeo</h3>
            <p>Prepara clips de audio con la duración exacta necesaria para tu proyecto de vídeo. Recorta con precisión de centésimas de segundo para sincronización perfecta.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎙️ Editar grabaciones de voz</h3>
            <p>Elimina los silencios iniciales/finales de grabaciones de podcast, entrevistas o voice-overs para obtener un resultado más limpio y profesional.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🧘 Crear loop de música ambiental</h3>
            <p>Extrae el fragmento más repetitivo de una pieza musical y añade fade in/out en ambos extremos para crear un loop perfecto para meditación o concentración.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎵 Preparar samples para producción</h3>
            <p>Aísla el fragmento exacto que quieres samplear con precisión de centésimas de segundo. Exporta en WAV para mantener la máxima calidad al importarlo en tu DAW.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>📚 Extraer fragmentos de audiolibros</h3>
            <p>Recorta capítulos o secciones específicas de audiolibros o conferencias largas para escucharlas de forma independiente sin tener que buscar el minuto cada vez.</p>
          </div>
        </div>

        {/* Sección 3: FAQ ampliado */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3>¿Por qué el archivo se descarga siempre como WAV aunque elija MP3?</h3>
            <p>Los navegadores no pueden codificar audio a MP3 de forma nativa por restricciones técnicas y de patentes. WAV es el único formato sin pérdida disponible de forma nativa. Para convertir a MP3, usa Audacity o ffmpeg localmente.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Mis archivos de audio son seguros?</h3>
            <p>Sí, 100%. Todo el procesamiento ocurre en tu navegador usando la Web Audio API. Tus archivos nunca salen de tu dispositivo ni se envían a ningún servidor de meskeIA.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué es el fade in y fade out?</h3>
            <p>El fade in hace que el audio comience en silencio y aumente gradualmente de volumen. El fade out hace lo contrario. Ambos duran los segundos que configures (0-5s) y evitan cortes bruscos al inicio/final del clip.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Hay límite de tamaño o duración del archivo?</h3>
            <p>No hay límites artificiales. El límite real es la memoria RAM de tu dispositivo. Archivos de hasta 100 MB funcionan sin problemas. Para archivos mayores, el procesamiento puede ser lento.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Puedo subir el volumen más del 100%?</h3>
            <p>Sí, el slider de volumen llega hasta 200%. Útil para grabaciones de voz que quedaron muy silenciosas. Sin embargo, superar el 100% puede introducir distorsión (clipping) si el audio original ya está cerca del máximo.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué es la Web Audio API?</h3>
            <p>Es una API nativa del navegador para procesar y sintetizar audio directamente en JavaScript, sin plugins. Permite decodificar, manipular y reproducir audio con alta precisión temporal, todo localmente en tu dispositivo.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Por qué no puedo recortar directamente un MP3 sin convertir a WAV?</h3>
            <p>Para recortar audio con precisión, el navegador debe decodificarlo a PCM (sin compresión) en memoria, manipularlo y re-codificarlo. La re-codificación nativa solo produce WAV; para MP3 se necesitan librerías externas como lamejs.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Cómo consigo la mayor calidad posible en el resultado?</h3>
            <p>Usa archivos de alta calidad como entrada (WAV, FLAC o MP3 a 320k). Exporta en WAV (sin pérdida). Si el original era MP3, la calidad está limitada por la del archivo fuente; no se puede recuperar lo que ya se perdió.</p>
          </div>
        </div>

        {/* Sección 4: Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Sube tu archivo de audio</h3>
              <p>Arrastra el archivo a la zona de carga o haz clic para seleccionarlo. Se admiten MP3, WAV, OGG, M4A, FLAC y otros formatos de audio.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Analiza la forma de onda</h3>
              <p>La forma de onda (waveform) muestra visualmente la intensidad del audio. Los picos altos son sonidos fuertes; las zonas planas son silencios. Úsala para identificar el fragmento.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Ajusta el punto de inicio</h3>
              <p>Mueve el slider de inicio o escribe los segundos exactos en el campo correspondiente. La precisión es de centésimas de segundo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Ajusta el punto de fin</h3>
              <p>De la misma forma, define el fin del fragmento. El indicador &quot;Duración seleccionada&quot; te muestra en tiempo real cuánto durará el clip resultante.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Previsualiza la selección</h3>
              <p>Pulsa &quot;Reproducir selección&quot; para escuchar exactamente lo que vas a exportar. Ajusta los tiempos si es necesario antes de procesar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Configura efectos (opcional)</h3>
              <p>Añade fade in y/o fade out para transiciones suaves. Ajusta el volumen si la grabación original es demasiado silenciosa o estridente.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Procesa y descarga</h3>
              <p>Pulsa &quot;Recortar y Procesar&quot;. El audio procesado aparecerá con un reproductor para verificar antes de descargar. El archivo tendrá el sufijo &quot;_recortado&quot;.</p>
            </div>
          </div>
        </div>

        {/* Sección 5: Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>🌊 Usa la forma de onda para guiarte</h3>
            <p>Los silencios aparecen como líneas planas en la waveform. Los picos de audio son momentos de alta intensidad. Es mucho más fácil identificar el punto exacto visualmente que a ciegas.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🌅 Fade in de 0,5s evita arranques bruscos</h3>
            <p>Un fade in de 0,5 a 1 segundo elimina los clics y arranques abruptos sin que el oyente lo perciba. Es especialmente útil para tonos de llamada y clips de música.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔊 Sube volumen con cuidado</h3>
            <p>Superar el 150% de volumen puede introducir distorsión (clipping). Si la grabación original es muy baja, súbelo gradualmente y escucha el resultado antes de descargar.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📱 Para tonos: recorta a 30-40 segundos</h3>
            <p>La mayoría de sistemas operativos limitan los tonos a 30-40 segundos. Añade un fade out en los últimos 2-3 segundos para que el tono termine de forma natural.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🎛️ WAV para seguir editando</h3>
            <p>Si vas a importar el resultado en un editor de audio (Audacity, Logic, Premiere), usa siempre WAV. Cada conversión a formato con pérdida (MP3) degrada la calidad acumulativamente.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>⏱️ Usa los campos numéricos para precisión máxima</h3>
            <p>Los sliders son útiles para aproximarte al fragmento, pero los campos de segundos te dan precisión de centésimas. Para cortes exactos en producción, siempre escribe el valor manualmente.</p>
          </div>
        </div>

        {/* Sección 6: Warning Box */}
        <div className={styles.warningBox}>
          <h3>⚠️ Limitaciones técnicas y legales</h3>
          <ul className={styles.warningList}>
            <li>Los navegadores no codifican MP3/OGG de forma nativa; el archivo exportado siempre es WAV, independientemente del formato seleccionado.</li>
            <li>La calidad del resultado está limitada por la calidad del archivo original. No se puede recuperar calidad perdida en una codificación previa.</li>
            <li>Para archivos superiores a 100 MB, el procesamiento puede ser lento o consumir mucha memoria RAM según tu dispositivo.</li>
            <li>Respeta los derechos de autor al recortar y reutilizar audio de terceros, incluso para uso personal.</li>
          </ul>
        </div>

        <section className={styles.guideSection}>
          <h2>¿Para qué sirve recortar audio?</h2>
          <p className={styles.introParagraph}>
            Recortar audio es útil para crear tonos de llamada, eliminar partes no deseadas
            de grabaciones, extraer fragmentos de canciones o preparar samples para proyectos.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📱 Tonos de llamada</h4>
              <p>
                Recorta tu canción favorita para crear un tono personalizado.
                La mayoría de teléfonos aceptan tonos de 30-40 segundos máximo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎙️ Podcasts y grabaciones</h4>
              <p>
                Elimina silencios, errores o partes irrelevantes de tus
                grabaciones de voz para un resultado más profesional.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎬 Videos y presentaciones</h4>
              <p>
                Prepara clips de audio con la duración exacta que necesitas
                para sincronizar con tus videos o diapositivas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎵 Samples y loops</h4>
              <p>
                Extrae fragmentos de canciones para usar como samples
                en producción musical o proyectos creativos.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Formatos de audio: ¿Cuál elegir?</h2>

          <div className={styles.formatComparison}>
            <div className={styles.formatCard}>
              <h4>🎵 MP3</h4>
              <ul>
                <li>✅ El más compatible</li>
                <li>✅ Archivos pequeños</li>
                <li>❌ Compresión con pérdida</li>
                <li>❌ No ideal para edición repetida</li>
              </ul>
              <p className={styles.formatUse}>Ideal para: música, podcasts, compartir</p>
            </div>
            <div className={styles.formatCard}>
              <h4>🔊 WAV</h4>
              <ul>
                <li>✅ Sin pérdida de calidad</li>
                <li>✅ Estándar profesional</li>
                <li>❌ Archivos muy grandes</li>
                <li>❌ No soporta metadatos</li>
              </ul>
              <p className={styles.formatUse}>Ideal para: edición, producción, archivo</p>
            </div>
            <div className={styles.formatCard}>
              <h4>🌐 OGG</h4>
              <ul>
                <li>✅ Mejor compresión que MP3</li>
                <li>✅ Código abierto y gratuito</li>
                <li>⚠️ Menos compatible</li>
                <li>⚠️ No soportado por Apple</li>
              </ul>
              <p className={styles.formatUse}>Ideal para: web, juegos, streaming</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué el archivo se descarga como WAV?</h4>
              <p>
                Los navegadores web no pueden codificar audio a MP3 u OGG de forma nativa
                debido a patentes y limitaciones técnicas. WAV es el formato sin pérdida
                que garantiza la mejor calidad posible.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Mis archivos son seguros?</h4>
              <p>
                Sí, 100%. Todo el procesamiento ocurre en tu navegador usando la Web Audio API.
                Tus archivos nunca salen de tu dispositivo ni se suben a ningún servidor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el fade in/out?</h4>
              <p>
                El fade in hace que el audio comience en silencio y aumente gradualmente.
                El fade out hace lo contrario: el audio disminuye hasta el silencio.
                Esto evita cortes bruscos y suena más profesional.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Hay límite de tamaño o duración?</h4>
              <p>
                No hay límites artificiales. El único límite es la memoria de tu navegador.
                Para archivos muy grandes (+100 MB), puede tardar más en procesarse.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('recortador-audio')} />

      <ShareCard appName="recortador-audio" />
      <Footer appName="recortador-audio" />
    </div>
  );
}
