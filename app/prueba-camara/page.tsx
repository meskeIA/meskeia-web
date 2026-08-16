'use client';
// @disclaimer: exempt

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PruebaCamara.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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

  // Verificar soporte. Se arranca en `true` y se corrige al montar, en vez de calcularlo
  // durante el render: en el servidor no hay `navigator`, así que el HTML estático salía
  // con el cartel de "Navegador no compatible" —que es lo que Google indexaba de una app
  // de prueba de cámara— y luego React lo descartaba al hidratar (error #418). Optimista
  // a propósito: si el navegador de verdad no soporta la cámara, el aviso aparece en
  // cuanto monta; al revés no había arreglo posible desde el servidor.
  const [isSupported, setIsSupported] = useState(true);
  useEffect(() => {
    setIsSupported(Boolean(navigator.mediaDevices?.getUserMedia));
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📷</span>
        <h1 className={styles.title}>Prueba de Cámara Web</h1>
        <p className={styles.subtitle}>
          Verifica tu webcam antes de videollamadas, en el ordenador (computadora) o en el móvil (celular). Toma fotos, ajusta configuración. Sin registro, 100% privado.
        </p>
      </header>

      <LegalNotice />

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
                  <button type="button" onClick={startCamera} className={styles.btnPrimary}>
                    <span aria-hidden="true">▶️</span> Iniciar Cámara
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={stopCamera} className={styles.btnSecondary}>
                      <span aria-hidden="true">⏹️</span> Detener
                    </button>
                    <button type="button" onClick={() => takePhoto(false)} className={styles.btnPrimary}>
                      <span aria-hidden="true">📸</span> Foto
                    </button>
                    <button type="button" onClick={() => takePhoto(true)} className={styles.btnAccent}>
                      <span aria-hidden="true">⏱️</span> Foto 3s
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettings(!showSettings)}
                      aria-pressed={showSettings}
                      aria-expanded={showSettings}
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
                      type="button"
                      onClick={() => setIsMirrored(!isMirrored)}
                      aria-pressed={isMirrored}
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
                    type="button"
                    onClick={() => { setBrightness(100); setContrast(100); }}
                    className={styles.btnSmall}
                  >
                    <span aria-hidden="true">🔄</span> Restablecer
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
                        <button type="button" onClick={() => downloadPhoto(photo)} className={styles.btnSmall}>
                          <span aria-hidden="true">⬇️</span> Descargar
                        </button>
                        <button type="button" onClick={() => deletePhoto(photo.id)} className={styles.btnSmallDanger} aria-label="Eliminar foto">
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

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres saber más sobre webcams y videollamadas?"
        subtitle="Resoluciones, permisos, diagnóstico y mejores prácticas para sacarle partido a tu cámara"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Resoluciones de webcam: comparativa</h2>
          <p>
            La resolución determina la calidad de imagen que verán tus interlocutores. Conocer
            las diferencias te ayuda a elegir el equipo adecuado y a entender las limitaciones
            de tu conexión, ya uses la webcam de un ordenador (computadora) o la cámara de un
            móvil (celular).
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Resolución</th>
                  <th>Calidad imagen</th>
                  <th>Ancho de banda necesario</th>
                  <th>Uso recomendado</th>
                  <th>Compatibilidad videollamadas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>480p (SD)</td>
                  <td>Básica</td>
                  <td>~0,5 Mbps</td>
                  <td>Conexiones lentas, chats informales</td>
                  <td>Universal (Zoom, Teams, Meet)</td>
                </tr>
                <tr>
                  <td>720p (HD)</td>
                  <td>Buena</td>
                  <td>~1,5 Mbps</td>
                  <td>Reuniones de trabajo, clases online</td>
                  <td>Excelente en todas las plataformas</td>
                </tr>
                <tr>
                  <td>1080p (FHD)</td>
                  <td>Alta definición</td>
                  <td>~3 Mbps</td>
                  <td>Presentaciones, entrevistas, streaming</td>
                  <td>Requiere plan de pago en Zoom/Teams</td>
                </tr>
                <tr>
                  <td>4K (UHD)</td>
                  <td>Ultra nítida</td>
                  <td>~15 Mbps</td>
                  <td>Producción de contenido, podcasts pro</td>
                  <td>Limitada — pocas apps lo soportan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Cuándo usar esta herramienta?</h2>
          <p>
            La prueba de cámara web es útil en múltiples situaciones del día a día digital.
            Aquí tienes los tres casos más habituales.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📹</span>
                <h4>Verificar antes de una videollamada importante</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una entrevista de trabajo, reunión con un cliente o defensa de proyecto.
                Comprobar la cámara 10 minutos antes evita sorpresas desagradables.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: verifica también la iluminación y el encuadre, no solo que la imagen
                aparezca.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
                <h4>Diagnosticar problemas de imagen en reuniones online</h4>
              </div>
              <p className={styles.escenarioExample}>
                Si en Zoom o Teams la cámara no aparece o la imagen sale oscura, usar este
                test aísla si el problema es el hardware o la propia app.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: si aquí funciona pero no en la app, el problema es de permisos o
                configuración dentro de esa plataforma.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔐</span>
                <h4>Comprobar permisos de cámara en el navegador</h4>
              </div>
              <p className={styles.escenarioExample}>
                Al intentar iniciar la cámara, el navegador solicitará permiso. Si no lo hace
                o lo deniega automáticamente, indica que los permisos están bloqueados.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: revisa el icono de candado en la barra de dirección del navegador para
                gestionar los permisos de cámara del sitio.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Por qué no se ve mi cámara en el test?</summary>
                <p>
                  Las causas más habituales son: permiso denegado en el navegador, otra
                  aplicación usando la cámara simultáneamente (Zoom, Teams, Skype en
                  segundo plano), o drivers desactualizados. Cierra todas las apps que
                  puedan usar la cámara y recarga la página.
                </p>
                <p className={styles.faqTip}>
                  En Windows, comprueba en el Administrador de tareas si algún proceso de
                  videollamada sigue activo en segundo plano.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo doy permisos a la cámara en el navegador?</summary>
                <p>
                  En Chrome: haz clic en el icono de candado de la barra de dirección →
                  Permisos del sitio → Cámara → Permitir. En Firefox: mismo icono de
                  candado → Más información → Permisos → Usar la cámara. En Safari: menú
                  Safari → Ajustes para este sitio web → Cámara → Permitir.
                </p>
                <p className={styles.faqTip}>
                  Si el navegador no te pregunta al pulsar &quot;Iniciar Cámara&quot;, es probable que
                  el permiso esté bloqueado a nivel de sistema operativo. Revisa la
                  configuración de privacidad de Windows o macOS.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿La cámara funciona en el test pero no en Zoom/Teams, por qué?</summary>
                <p>
                  Cada aplicación gestiona los permisos de cámara de forma independiente.
                  Verifica que Zoom o Teams tengan acceso a la cámara en la configuración
                  de privacidad del sistema operativo. En Windows: Configuración → Privacidad
                  y seguridad → Cámara. En macOS: Preferencias del Sistema → Privacidad →
                  Cámara.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cómo sé si mi webcam graba en HD?</summary>
                <p>
                  Al iniciar la cámara en esta herramienta, verás la resolución detectada
                  junto al área de video (por ejemplo, &quot;1280 × 720px&quot; con la etiqueta HD).
                  Si la resolución es inferior a 1280 × 720, tu webcam graba en definición
                  estándar. Para confirmar las especificaciones exactas, consulta el modelo
                  de tu cámara en el sitio del fabricante.
                </p>
                <p className={styles.faqTip}>
                  Dato: la mayoría de portátiles fabricados a partir de 2020 incluyen webcam
                  HD (720p) de serie. Los modelos más recientes suelen ofrecer 1080p.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo usar esta prueba de cámara: 4 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Permitir acceso a la cámara cuando el navegador lo solicite</strong>
                <p>
                  Al pulsar &quot;Iniciar Cámara&quot;, el navegador mostrará una ventana emergente
                  pidiendo permiso. Haz clic en &quot;Permitir&quot;. Sin este paso la herramienta
                  no puede acceder al hardware de la cámara.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Verificar que se ve la imagen en tiempo real</strong>
                <p>
                  Deberías ver tu imagen en directo en el área de video, tanto en el ordenador
                  (computadora) como en el móvil (celular). La resolución detectada aparece justo
                  debajo. Si la imagen no aparece, revisa los permisos o si otra app está usando
                  la cámara.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Comprobar iluminación y encuadre</strong>
                <p>
                  Asegúrate de que tu cara esté bien iluminada (sin contraluces) y que
                  la cámara esté a la altura de los ojos. Usa los controles de brillo y
                  contraste para ajustar si es necesario. Toma una foto de prueba para
                  revisar el resultado.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Si no funciona, revisar permisos en la configuración del navegador</strong>
                <p>
                  Haz clic en el icono de candado en la barra de direcciones y comprueba
                  que la cámara está en &quot;Permitido&quot;. Si está bloqueada, cámbialo a
                  &quot;Permitir&quot; y recarga la página. En caso de persistir, revisa los permisos
                  de privacidad del sistema operativo.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 buenas prácticas para videollamadas con buena imagen</h2>
          <div className={styles.tipsGridEdu}>
            <div className={styles.tipCardEdu}>
              <span className={styles.tipIconEdu} aria-hidden="true">💡</span>
              <h4>Iluminación frontal, sin contraluces</h4>
              <p>
                Sitúa una fuente de luz (ventana o lámpara) frente a ti, nunca detrás.
                Un contraluz oscurece tu cara y dificulta que te vean correctamente.
              </p>
            </div>
            <div className={styles.tipCardEdu}>
              <span className={styles.tipIconEdu} aria-hidden="true">🖼️</span>
              <h4>Fondo neutro y ordenado para videollamadas</h4>
              <p>
                Un fondo limpio y ordenado transmite profesionalidad. Evita zonas con
                mucho movimiento o elementos distractores. Una pared lisa o estantería
                ordenada son opciones habituales.
              </p>
            </div>
            <div className={styles.tipCardEdu}>
              <span className={styles.tipIconEdu} aria-hidden="true">🧹</span>
              <h4>Limpiar la lente periódicamente</h4>
              <p>
                El polvo y las huellas en la lente reducen la nitidez de la imagen.
                Limpia la webcam con un paño de microfibra suave cada pocas semanas para
                mantener la máxima calidad de imagen.
              </p>
            </div>
            <div className={styles.tipCardEdu}>
              <span className={styles.tipIconEdu} aria-hidden="true">🔇</span>
              <h4>Cerrar otras apps que usen la cámara antes del test</h4>
              <p>
                Zoom, Teams, Skype o cualquier app de videollamada puede mantener la
                cámara ocupada en segundo plano. Ciérralas completamente antes de
                iniciar esta prueba para garantizar el acceso.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores habituales con la webcam</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Tener otra app usando la cámara simultáneamente.</strong> Solo una
                aplicación puede acceder a la cámara a la vez en la mayoría de sistemas.
                Si Zoom o Teams están activos en segundo plano, este test no podrá iniciar
                la cámara y recibirás un error de acceso denegado.
              </li>
              <li>
                <strong>No comprobar la cámara antes de reuniones importantes.</strong> Esperar
                a que empiece la videollamada para descubrir que la cámara no funciona genera
                estrés y mala impresión. Dedica 2 minutos antes de cualquier reunión relevante
                a verificarla con esta herramienta.
              </li>
              <li>
                <strong>Ignorar los permisos bloqueados en el navegador.</strong> Si el
                navegador tiene bloqueado el acceso a la cámara para este sitio, el test
                siempre fallará independientemente del hardware. Revisa los permisos del sitio
                antes de asumir que la cámara está rota.
              </li>
              <li>
                <strong>Usar la cámara con contraluz (imagen oscura).</strong> Sentarse con
                una ventana o fuente de luz detrás provoca que la cámara exponga para el
                fondo y tu cara quede en sombra. Reposiciona la fuente de luz o cambia de
                sitio para que la luz te ilumine de frente.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('prueba-camara')} />

      <ShareCard appName="prueba-camara" />
      <Footer appName="prueba-camara" />
    </div>
  );
}
