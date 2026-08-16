'use client';
// @disclaimer: exempt

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PruebaMicrofono.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
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

  // Verificar soporte. Se arranca en `true` y se corrige al montar, en vez de calcularlo
  // durante el render: en el servidor no hay `navigator`, así que el HTML estático salía
  // con el cartel de "Navegador no compatible" —que es lo que Google indexaba de una app
  // de prueba de micrófono— y luego React lo descartaba al hidratar (error #418). Optimista
  // a propósito: si el navegador de verdad no soporta el micrófono, el aviso aparece en
  // cuanto monta; al revés no había arreglo posible desde el servidor.
  const [isSupported, setIsSupported] = useState(true);
  useEffect(() => {
    setIsSupported(Boolean(navigator.mediaDevices?.getUserMedia));
  }, []);

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
          Verifica tu micrófono antes de videollamadas, en el ordenador (computadora) o en el móvil (celular). Visualiza niveles, graba y reproduce. Sin registro, 100% privado.
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
                    <button type="button" onClick={resetPeak} className={styles.btnTiny}>
                      Reset pico
                    </button>
                  </div>
                </div>
              )}

              {/* Controles principales */}
              <div className={styles.controls}>
                {!isActive ? (
                  <button type="button" onClick={startMicrophone} className={styles.btnPrimary}>
                    <span aria-hidden="true">▶️</span> Iniciar Micrófono
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={stopMicrophone} className={styles.btnSecondary}>
                      <span aria-hidden="true">⏹️</span> Detener
                    </button>
                    {!isRecording ? (
                      <button type="button" onClick={startRecording} className={styles.btnRecord}>
                        <span aria-hidden="true">🔴</span> Grabar
                      </button>
                    ) : (
                      <button type="button" onClick={stopRecording} className={styles.btnStopRecord}>
                        <span aria-hidden="true">⏹️</span> Parar ({formatTime(recordingTime)})
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
                        type="button"
                        onClick={() => setShowWaveform(true)}
                        className={`${styles.toggleBtn} ${showWaveform ? styles.active : ''}`}
                        aria-pressed={showWaveform}
                      >
                        <span aria-hidden="true">📊</span> Barras
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWaveform(false)}
                        className={`${styles.toggleBtn} ${!showWaveform ? styles.active : ''}`}
                        aria-pressed={!showWaveform}
                      >
                        <span aria-hidden="true">〰️</span> Onda
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
                          type="button"
                          onClick={() => downloadRecording(recording)}
                          className={styles.btnSmall}
                        >
                          <span aria-hidden="true">⬇️</span> Descargar
                        </button>
                        <button
                          type="button"
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

      <EducationalSection
        title="¿Quieres saber más sobre micrófonos y audio?"
        subtitle="Tipos de micrófono, casos de uso habituales, preguntas frecuentes y guía paso a paso para una prueba exitosa"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Tipos de micrófono: comparativa rápida</h2>
          <p>
            No todos los micrófonos ofrecen la misma calidad ni se adaptan igual a cada situación,
            ya pruebes el micrófono del ordenador (computadora) o el del móvil (celular).
            Elige el que mejor encaje con tu uso habitual.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Calidad de audio</th>
                  <th>Ruido ambiente</th>
                  <th>Uso recomendado</th>
                  <th>Precio aproximado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>💻 Micrófono integrado portátil</td>
                  <td>Básica</td>
                  <td>Capta mucho ruido</td>
                  <td>Uso ocasional, emergencias</td>
                  <td>Incluido</td>
                </tr>
                <tr>
                  <td>🎧 Auriculares con micro</td>
                  <td>Media-buena</td>
                  <td>Moderado (micro cerca)</td>
                  <td>Videollamadas diarias, gaming</td>
                  <td>10 – 80 €</td>
                </tr>
                <tr>
                  <td>🎙️ Micro USB externo</td>
                  <td>Buena</td>
                  <td>Bajo (cardioide)</td>
                  <td>Podcasts, streaming, teletrabajo</td>
                  <td>40 – 150 €</td>
                </tr>
                <tr>
                  <td>🏆 Micro XLR profesional</td>
                  <td>Excelente</td>
                  <td>Muy bajo</td>
                  <td>Grabación profesional, radio</td>
                  <td>100 – 500 €+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Cuándo usar esta herramienta</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📹</span>
                <h4>Antes de una videollamada o reunión online</h4>
              </div>
              <p className={styles.escenarioExample}>
                Comprueba que tu micrófono funciona correctamente y que el nivel de audio
                es adecuado antes de entrar a una reunión importante.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: haz la prueba con al menos 5 minutos de antelación para tener
                tiempo de solucionar cualquier problema.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔊</span>
                <h4>Diagnosticar eco o ruido de fondo</h4>
              </div>
              <p className={styles.escenarioExample}>
                Si los demás te dicen que escuchan eco o ruido en tus llamadas, usa el
                visualizador para identificar si el problema es el micrófono o el entorno.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: activa la grabación, reproduce y escucha. Si suena bien aquí
                pero mal en Teams o Zoom, el problema es la configuración de esa app.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔒</span>
                <h4>Comprobar permisos de micrófono en el navegador</h4>
              </div>
              <p className={styles.escenarioExample}>
                Si el navegador no detecta el micrófono, es probable que los permisos
                estén bloqueados. Esta herramienta te ayuda a confirmarlo y solucionarlo.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: busca el icono de candado o cámara en la barra de direcciones
                para gestionar los permisos de este sitio.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el micrófono</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Por qué no detecta mi micrófono?</summary>
                <p>
                  Las causas más habituales son: permisos bloqueados en el navegador,
                  otra aplicación usando el micrófono en exclusiva (Teams, Zoom, Discord),
                  o un driver desactualizado. Revisa primero los permisos del navegador
                  en la barra de direcciones y cierra otras apps de comunicación.
                </p>
                <p className={styles.faqTip}>
                  En Windows: Configuración → Privacidad → Micrófono → activa el acceso
                  para el navegador que uses.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo elimino el eco en videollamadas?</summary>
                <p>
                  El eco aparece cuando el micro capta el audio de los altavoces y lo
                  reenvía al resto de participantes. La solución más sencilla es usar
                  auriculares: el audio va directo a tu oído y no llega al micrófono.
                  Si no puedes usar auriculares, baja el volumen de los altavoces o
                  activa la cancelación de eco de tu aplicación de videollamada.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo doy permisos al micrófono en el navegador?</summary>
                <p>
                  En Chrome y Edge: haz clic en el icono de candado a la izquierda de
                  la URL → Micrófono → Permitir. En Firefox: haz clic en el icono de
                  escudo o candado → más información → permisos → micrófono. En Safari:
                  Preferencias → Sitios web → Micrófono → Permitir para este sitio.
                  Después recarga la página.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Por qué el micro funciona aquí pero no en Teams/Zoom?</summary>
                <p>
                  Cada aplicación gestiona el micrófono de forma independiente, tanto en
                  el ordenador (computadora) como en el móvil (celular). Puede
                  que Teams o Zoom tengan seleccionado un dispositivo diferente, o que
                  sus propios permisos estén bloqueados. Ve a Configuración dentro de
                  la app de videollamada → Audio → y selecciona el mismo micrófono que
                  funciona en esta prueba. También verifica que el sistema operativo
                  les da acceso al micrófono.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo hacer una prueba de micrófono correcta</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Permite el acceso al micrófono cuando el navegador lo solicite</strong>
                <p>
                  Al pulsar &quot;Iniciar Micrófono&quot;, el navegador pedirá permiso. Acepta
                  para que la herramienta pueda acceder al dispositivo de audio.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Habla y verifica que se mueve el indicador de nivel</strong>
                <p>
                  Habla a una distancia normal (20-30 cm) y comprueba que la barra de
                  volumen sube. El nivel óptimo está entre el 30 % y el 70 %.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Comprueba que no hay ruido de fondo excesivo</strong>
                <p>
                  Quédate en silencio unos segundos y observa el medidor. Si sube por
                  encima del 10-15 % sin que hables, hay ruido de fondo que conviene
                  reducir antes de tu reunión.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Si no funciona, revisa permisos y que ninguna app lo bloquea</strong>
                <p>
                  Cierra Teams, Zoom, Discord u otras apps de comunicación. Revisa los
                  permisos del navegador y vuelve a intentarlo. Si persiste, reinicia
                  el navegador.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para un audio de calidad</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💨</span>
              <h4>Aléjate del ventilador o aire acondicionado</h4>
              <p>
                El ruido del ventilador es constante y se cuela fácilmente en el
                micrófono. Mueve el equipo o apaga el climatizador durante la llamada.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎧</span>
              <h4>Usa auriculares con micro para evitar el eco</h4>
              <p>
                Es la medida más eficaz contra el eco. Los auriculares impiden que el
                audio de los altavoces llegue al micrófono y se retroalimente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📵</span>
              <h4>Cierra otras apps que usen el micrófono</h4>
              <p>
                Teams, Zoom, Discord o Skype pueden bloquear el acceso al micrófono
                en exclusiva. Ciérralas antes de la prueba para evitar conflictos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗓️</span>
              <h4>Prueba siempre antes de reuniones importantes</h4>
              <p>
                Hacer esta prueba 5 minutos antes de una entrevista o reunión clave
                te da margen para resolver cualquier problema sin prisas ni estrés.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores habituales con el micrófono</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Otra app usando el micrófono simultáneamente.</strong> Teams,
                Zoom o Discord pueden ocupar el micrófono en exclusiva e impedir que
                esta herramienta (u otras apps) accedan a él. Ciérralas primero.
              </li>
              <li>
                <strong>No comprobar antes de reuniones o entrevistas online.</strong>{' '}
                Un micrófono que no funciona justo al empezar una reunión importante
                genera una impresión muy negativa. Dedica 2 minutos a probarlo antes.
              </li>
              <li>
                <strong>Ignorar el eco (molesta mucho a los demás participantes).</strong>{' '}
                El eco dificulta la comunicación y distrae a todos. Si te lo dicen,
                actúa: usa auriculares o baja el volumen de los altavoces.
              </li>
              <li>
                <strong>Hablar muy lejos del micrófono (audio inaudible).</strong>{' '}
                A más de 50 cm el audio pierde calidad notablemente. Mantén una
                distancia de 15-30 cm para un nivel de voz claro y natural.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('prueba-microfono')} />

      <ShareCard appName="prueba-microfono" />
      <Footer appName="prueba-microfono" />
    </div>
  );
}
