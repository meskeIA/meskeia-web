'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PruebaMicrofono.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface MicrophoneInfo {
  deviceId: string;
  label: string;
}

interface RecordingData {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
}

export default function PruebaMicrofonoPage() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [microphones, setMicrophones] = useState<MicrophoneInfo[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [volume, setVolume] = useState(0);
  const [peakVolume, setPeakVolume] = useState(0);
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showWaveform, setShowWaveform] = useState(true);
  const [sensitivity, setSensitivity] = useState(1);

  // Obtener lista de micrófonos
  const getMicrophones = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Micrófono ${devices.indexOf(device) + 1}`
        }));
      setMicrophones(audioDevices);
      if (audioDevices.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(audioDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error al enumerar dispositivos:', err);
    }
  }, [selectedMicrophone]);

  // Dibujar visualización
  const drawVisualization = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Calcular volumen promedio
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = (sum / bufferLength) * sensitivity;
      const normalizedVolume = Math.min(100, Math.round((avg / 255) * 100));
      setVolume(normalizedVolume);

      // Actualizar pico
      if (normalizedVolume > peakVolume) {
        setPeakVolume(normalizedVolume);
      }

      // Limpiar canvas
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (showWaveform) {
        // Dibujar barras de frecuencia
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * sensitivity;

          // Gradiente de color según altura
          const hue = 180 - (barHeight / canvas.height) * 60; // De azul a verde
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;

          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      } else {
        // Dibujar onda de tiempo
        analyser.getByteTimeDomainData(dataArray);

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
      }
    };

    draw();
  }, [showWaveform, sensitivity, peakVolume]);

  // Iniciar micrófono
  const startMicrophone = useCallback(async () => {
    try {
      setError(null);

      // Detener stream anterior si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Crear contexto de audio
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Configurar canvas
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth * window.devicePixelRatio;
        canvasRef.current.height = canvasRef.current.offsetHeight * window.devicePixelRatio;
      }

      setIsActive(true);
      setPeakVolume(0);
      await getMicrophones();
      drawVisualization();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Permiso denegado. Permite el acceso al micrófono en tu navegador.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No se encontró ningún micrófono. Conecta uno e intenta de nuevo.');
      } else {
        setError(`Error al acceder al micrófono: ${errorMessage}`);
      }
      setIsActive(false);
    }
  }, [selectedMicrophone, getMicrophones, drawVisualization]);

  // Detener micrófono
  const stopMicrophone = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setVolume(0);
    setIsRecording(false);
  }, []);

  // Iniciar grabación
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    audioChunksRef.current = [];
    recordingStartRef.current = Date.now();

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const duration = Math.round((Date.now() - recordingStartRef.current) / 1000);

      const newRecording: RecordingData = {
        id: Date.now().toString(),
        blob,
        url,
        duration,
        timestamp: new Date()
      };

      setRecordings(prev => [newRecording, ...prev].slice(0, 10));
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
  }, []);

  // Detener grabación
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  // Contador de tiempo de grabación
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Descargar grabación
  const downloadRecording = useCallback((recording: RecordingData) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `audio-meskeia-${recording.timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    link.click();
  }, []);

  // Eliminar grabación
  const deleteRecording = useCallback((id: string) => {
    setRecordings(prev => {
      const recording = prev.find(r => r.id === id);
      if (recording) {
        URL.revokeObjectURL(recording.url);
      }
      return prev.filter(r => r.id !== id);
    });
  }, []);

  // Reset pico
  const resetPeak = useCallback(() => {
    setPeakVolume(0);
  }, []);

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cambiar micrófono
  useEffect(() => {
    if (isActive && selectedMicrophone) {
      stopMicrophone();
      setTimeout(() => startMicrophone(), 100);
    }
  }, [selectedMicrophone]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      recordings.forEach(r => URL.revokeObjectURL(r.url));
    };
  }, []);

  // Verificar soporte
  const isSupported = typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia;

  // Determinar estado del volumen
  const getVolumeStatus = () => {
    if (volume < 5) return { text: 'Sin señal', color: '#999', icon: '🔇' };
    if (volume < 20) return { text: 'Muy bajo', color: '#ffc107', icon: '🔈' };
    if (volume < 50) return { text: 'Óptimo', color: '#28a745', icon: '🔊' };
    if (volume < 80) return { text: 'Bueno', color: '#17a2b8', icon: '🔊' };
    return { text: 'Alto', color: '#dc3545', icon: '📢' };
  };

  const volumeStatus = getVolumeStatus();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🎙️</span>
        <h1 className={styles.title}>Prueba de Micrófono</h1>
        <p className={styles.subtitle}>
          Verifica tu micrófono antes de videollamadas. Visualiza niveles, graba y reproduce. Sin registro, 100% privado.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {!isSupported ? (
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>⚠️</span>
            <h2>Navegador no compatible</h2>
            <p>Tu navegador no soporta acceso al micrófono. Prueba con Chrome, Firefox, Edge o Safari actualizados.</p>
          </div>
        ) : (
          <>
            {/* Panel de audio */}
            <div className={styles.audioPanel}>
              {/* Visualización */}
              <div className={styles.visualizerContainer}>
                {!isActive && !error && (
                  <div className={styles.placeholder}>
                    <span className={styles.placeholderIcon}>🎙️</span>
                    <p>Pulsa &quot;Iniciar Micrófono&quot; para comenzar</p>
                  </div>
                )}
                {error && (
                  <div className={styles.errorOverlay}>
                    <span className={styles.errorIcon}>❌</span>
                    <p>{error}</p>
                  </div>
                )}
                <canvas ref={canvasRef} className={styles.canvas} />

                {/* Indicador de grabación */}
                {isRecording && (
                  <div className={styles.recordingIndicator}>
                    <span className={styles.recordingDot}></span>
                    <span>REC {formatTime(recordingTime)}</span>
                  </div>
                )}
              </div>

              {/* Medidor de volumen */}
              {isActive && (
                <div className={styles.volumeMeter}>
                  <div className={styles.volumeBarContainer}>
                    <div
                      className={styles.volumeBar}
                      style={{
                        width: `${volume}%`,
                        backgroundColor: volumeStatus.color
                      }}
                    />
                    <div
                      className={styles.peakMarker}
                      style={{ left: `${peakVolume}%` }}
                    />
                  </div>
                  <div className={styles.volumeInfo}>
                    <span className={styles.volumeIcon}>{volumeStatus.icon}</span>
                    <span className={styles.volumeText}>{volumeStatus.text}</span>
                    <span className={styles.volumeValue}>{volume}%</span>
                    <button onClick={resetPeak} className={styles.btnTiny}>
                      Reset pico
                    </button>
                  </div>
                </div>
              )}

              {/* Controles principales */}
              <div className={styles.controls}>
                {!isActive ? (
                  <button onClick={startMicrophone} className={styles.btnPrimary}>
                    <span>▶️</span> Iniciar Micrófono
                  </button>
                ) : (
                  <>
                    <button onClick={stopMicrophone} className={styles.btnSecondary}>
                      <span>⏹️</span> Detener
                    </button>
                    {!isRecording ? (
                      <button onClick={startRecording} className={styles.btnRecord}>
                        <span>🔴</span> Grabar
                      </button>
                    ) : (
                      <button onClick={stopRecording} className={styles.btnStopRecord}>
                        <span>⏹️</span> Parar ({formatTime(recordingTime)})
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Opciones */}
              {isActive && (
                <div className={styles.optionsPanel}>
                  {/* Selector de micrófono */}
                  {microphones.length > 1 && (
                    <div className={styles.optionRow}>
                      <label>Micrófono:</label>
                      <select
                        value={selectedMicrophone}
                        onChange={(e) => setSelectedMicrophone(e.target.value)}
                        className={styles.select}
                      >
                        {microphones.map(mic => (
                          <option key={mic.deviceId} value={mic.deviceId}>
                            {mic.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Tipo de visualización */}
                  <div className={styles.optionRow}>
                    <label>Visualización:</label>
                    <div className={styles.toggleGroup}>
                      <button
                        onClick={() => setShowWaveform(true)}
                        className={`${styles.toggleBtn} ${showWaveform ? styles.active : ''}`}
                      >
                        📊 Barras
                      </button>
                      <button
                        onClick={() => setShowWaveform(false)}
                        className={`${styles.toggleBtn} ${!showWaveform ? styles.active : ''}`}
                      >
                        〰️ Onda
                      </button>
                    </div>
                  </div>

                  {/* Sensibilidad */}
                  <div className={styles.optionRow}>
                    <label>Sensibilidad: {Math.round(sensitivity * 100)}%</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={sensitivity}
                      onChange={(e) => setSensitivity(Number(e.target.value))}
                      className={styles.slider}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Grabaciones */}
            {recordings.length > 0 && (
              <div className={styles.recordingsSection}>
                <h2 className={styles.sectionTitle}>
                  🎵 Grabaciones ({recordings.length})
                </h2>
                <div className={styles.recordingsList}>
                  {recordings.map(recording => (
                    <div key={recording.id} className={styles.recordingCard}>
                      <div className={styles.recordingInfo}>
                        <span className={styles.recordingDuration}>
                          ⏱️ {formatTime(recording.duration)}
                        </span>
                        <span className={styles.recordingTime}>
                          {recording.timestamp.toLocaleTimeString('es-ES')}
                        </span>
                      </div>
                      <audio src={recording.url} controls className={styles.audioPlayer} />
                      <div className={styles.recordingActions}>
                        <button
                          onClick={() => downloadRecording(recording)}
                          className={styles.btnSmall}
                        >
                          ⬇️ Descargar
                        </button>
                        <button
                          onClick={() => deleteRecording(recording.id)}
                          className={styles.btnSmallDanger}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Info de privacidad */}
      <div className={styles.privacyInfo}>
        <h3>🔒 Tu privacidad es importante</h3>
        <ul>
          <li>✓ El audio NO se envía a ningún servidor</li>
          <li>✓ Las grabaciones se guardan SOLO en tu navegador</li>
          <li>✓ No almacenamos ningún dato</li>
          <li>✓ Funciona 100% offline una vez cargado</li>
        </ul>
      </div>

      {/* Tips */}
      <div className={styles.tipsSection}>
        <h3>💡 Consejos para un buen audio</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <h4>Distancia</h4>
            <p>Mantén una distancia de 15-30 cm del micrófono para evitar distorsión.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔇</span>
            <h4>Ruido ambiente</h4>
            <p>Busca un lugar tranquilo. Cierra ventanas y apaga ventiladores.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📊</span>
            <h4>Nivel óptimo</h4>
            <p>El medidor debe estar entre 30-70% cuando hablas normalmente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎧</span>
            <h4>Auriculares</h4>
            <p>Usa auriculares para evitar eco y feedback durante llamadas.</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('prueba-microfono')} />

      <Footer appName="prueba-microfono" />
    </div>
  );
}
