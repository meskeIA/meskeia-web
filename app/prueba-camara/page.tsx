'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PruebaCamara.module.css';
import { MeskeiaLogo, Footer } from '@/components';

interface CameraInfo {
  deviceId: string;
  label: string;
}

interface PhotoData {
  id: string;
  dataUrl: string;
  timestamp: Date;
}

export default function PruebaCamaraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [resolution, setResolution] = useState<{ width: number; height: number } | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isMirrored, setIsMirrored] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Obtener lista de cámaras
  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Cámara ${devices.indexOf(device) + 1}`
        }));
      setCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error al enumerar dispositivos:', err);
    }
  }, [selectedCamera]);

  // Iniciar cámara
  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Detener stream anterior si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Obtener resolución real
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        setResolution({
          width: settings.width || 0,
          height: settings.height || 0
        });
      }

      setIsActive(true);
      await getCameras(); // Actualizar lista con nombres
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Permiso denegado. Permite el acceso a la cámara en tu navegador.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No se encontró ninguna cámara. Conecta una webcam e intenta de nuevo.');
      } else {
        setError(`Error al acceder a la cámara: ${errorMessage}`);
      }
      setIsActive(false);
    }
  }, [selectedCamera, getCameras]);

  // Detener cámara
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setResolution(null);
  }, []);

  // Tomar foto con cuenta atrás opcional
  const takePhoto = useCallback((withCountdown = false) => {
    if (withCountdown) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Tomar foto cuando llega a 0
            setTimeout(() => {
              capturePhoto();
              setCountdown(null);
            }, 100);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      capturePhoto();
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Aplicar espejo si está activado
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Aplicar filtros
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(video, 0, 0);
    ctx.filter = 'none';

    const dataUrl = canvas.toDataURL('image/png');
    const newPhoto: PhotoData = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: new Date()
    };

    setPhotos(prev => [newPhoto, ...prev].slice(0, 10)); // Máximo 10 fotos
  }, [isMirrored, brightness, contrast]);

  // Descargar foto
  const downloadPhoto = useCallback((photo: PhotoData) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `foto-meskeia-${photo.timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    link.click();
  }, []);

  // Eliminar foto
  const deletePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  // Cambiar cámara
  useEffect(() => {
    if (isActive && selectedCamera) {
      startCamera();
    }
  }, [selectedCamera]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Verificar soporte
  const isSupported = typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📷</span>
        <h1 className={styles.title}>Prueba de Cámara Web</h1>
        <p className={styles.subtitle}>
          Verifica tu webcam antes de videollamadas. Toma fotos, ajusta configuración. Sin registro, 100% privado.
        </p>
      </header>

      <main className={styles.mainContent}>
        {!isSupported ? (
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>⚠️</span>
            <h2>Navegador no compatible</h2>
            <p>Tu navegador no soporta acceso a la cámara. Prueba con Chrome, Firefox, Edge o Safari actualizados.</p>
          </div>
        ) : (
          <>
            {/* Panel de video */}
            <div className={styles.videoPanel}>
              <div
                className={`${styles.videoContainer} ${isMirrored ? styles.mirrored : ''}`}
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              >
                {!isActive && !error && (
                  <div className={styles.placeholder}>
                    <span className={styles.placeholderIcon}>📷</span>
                    <p>Pulsa &quot;Iniciar Cámara&quot; para comenzar</p>
                  </div>
                )}
                {error && (
                  <div className={styles.errorOverlay}>
                    <span className={styles.errorIcon}>❌</span>
                    <p>{error}</p>
                  </div>
                )}
                {countdown !== null && (
                  <div className={styles.countdownOverlay}>
                    <span className={styles.countdownNumber}>{countdown}</span>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={styles.video}
                />
              </div>

              {/* Info de resolución */}
              {isActive && resolution && (
                <div className={styles.resolutionInfo}>
                  <span>📐 {resolution.width} × {resolution.height}px</span>
                  {resolution.width >= 1920 && <span className={styles.badge}>Full HD</span>}
                  {resolution.width >= 1280 && resolution.width < 1920 && <span className={styles.badge}>HD</span>}
                </div>
              )}

              {/* Controles principales */}
              <div className={styles.controls}>
                {!isActive ? (
                  <button onClick={startCamera} className={styles.btnPrimary}>
                    <span>▶️</span> Iniciar Cámara
                  </button>
                ) : (
                  <>
                    <button onClick={stopCamera} className={styles.btnSecondary}>
                      <span>⏹️</span> Detener
                    </button>
                    <button onClick={() => takePhoto(false)} className={styles.btnPrimary}>
                      <span>📸</span> Foto
                    </button>
                    <button onClick={() => takePhoto(true)} className={styles.btnAccent}>
                      <span>⏱️</span> Foto 3s
                    </button>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`${styles.btnIcon} ${showSettings ? styles.active : ''}`}
                    >
                      ⚙️
                    </button>
                  </>
                )}
              </div>

              {/* Panel de ajustes */}
              {showSettings && isActive && (
                <div className={styles.settingsPanel}>
                  <h3>Ajustes</h3>

                  {/* Selector de cámara */}
                  {cameras.length > 1 && (
                    <div className={styles.settingRow}>
                      <label>Cámara:</label>
                      <select
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        className={styles.select}
                      >
                        {cameras.map(cam => (
                          <option key={cam.deviceId} value={cam.deviceId}>
                            {cam.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Espejo */}
                  <div className={styles.settingRow}>
                    <label>Espejo:</label>
                    <button
                      onClick={() => setIsMirrored(!isMirrored)}
                      className={`${styles.toggleBtn} ${isMirrored ? styles.active : ''}`}
                    >
                      {isMirrored ? '✓ Activado' : 'Desactivado'}
                    </button>
                  </div>

                  {/* Brillo */}
                  <div className={styles.settingRow}>
                    <label>Brillo: {brightness}%</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className={styles.slider}
                    />
                  </div>

                  {/* Contraste */}
                  <div className={styles.settingRow}>
                    <label>Contraste: {contrast}%</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className={styles.slider}
                    />
                  </div>

                  {/* Reset */}
                  <button
                    onClick={() => { setBrightness(100); setContrast(100); }}
                    className={styles.btnSmall}
                  >
                    🔄 Restablecer
                  </button>
                </div>
              )}
            </div>

            {/* Galería de fotos */}
            {photos.length > 0 && (
              <div className={styles.gallerySection}>
                <h2 className={styles.sectionTitle}>
                  📸 Fotos capturadas ({photos.length})
                </h2>
                <div className={styles.gallery}>
                  {photos.map(photo => (
                    <div key={photo.id} className={styles.photoCard}>
                      <img src={photo.dataUrl} alt="Foto capturada" className={styles.photoImg} />
                      <div className={styles.photoActions}>
                        <button onClick={() => downloadPhoto(photo)} className={styles.btnSmall}>
                          ⬇️ Descargar
                        </button>
                        <button onClick={() => deletePhoto(photo.id)} className={styles.btnSmallDanger}>
                          🗑️
                        </button>
                      </div>
                      <span className={styles.photoTime}>
                        {photo.timestamp.toLocaleTimeString('es-ES')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </main>

      {/* Info de privacidad */}
      <div className={styles.privacyInfo}>
        <h3>🔒 Tu privacidad es importante</h3>
        <ul>
          <li>✓ El video NO se envía a ningún servidor</li>
          <li>✓ Las fotos se guardan SOLO en tu navegador</li>
          <li>✓ No almacenamos ningún dato</li>
          <li>✓ Funciona 100% offline una vez cargado</li>
        </ul>
      </div>

      {/* Tips */}
      <div className={styles.tipsSection}>
        <h3>💡 Consejos para una buena imagen</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💡</span>
            <h4>Iluminación</h4>
            <p>Sitúate frente a una fuente de luz natural o lámpara. Evita contraluz.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>👁️</span>
            <h4>Altura</h4>
            <p>La cámara debe estar a la altura de tus ojos para un ángulo favorecedor.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🖼️</span>
            <h4>Fondo</h4>
            <p>Elige un fondo limpio y ordenado para transmitir profesionalidad.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔇</span>
            <h4>Antes de llamar</h4>
            <p>Verifica también tu micrófono con nuestra herramienta de audio.</p>
          </div>
        </div>
      </div>

      <Footer appName="prueba-camara" />
    </div>
  );
}
