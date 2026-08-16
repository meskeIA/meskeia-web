'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './RecortadorVideo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  cargarVideo,
  recortar,
  modoExactoDisponible,
  type VideoCargado,
  type ModoRecorte,
} from './videoTrimmer';

// Formatea segundos como mm:ss.d (décimas)
const formatTiempo = (segundos: number): string => {
  if (!isFinite(segundos) || segundos < 0) segundos = 0;
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  const dec = Math.floor((segundos % 1) * 10);
  return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}.${dec}`;
};

const formatTamano = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const AVISO_TAMANO = 700 * 1024 * 1024; // 700 MB

export default function RecortadorVideoPage() {
  // Archivo y datos del vídeo
  const [nombreArchivo, setNombreArchivo] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cargado, setCargado] = useState<VideoCargado | null>(null);
  const [duracion, setDuracion] = useState(0);

  // Recorte
  const [inicio, setInicio] = useState(0);
  const [fin, setFin] = useState(0);
  const [tiempoActual, setTiempoActual] = useState(0);

  // Opciones
  const [modo, setModo] = useState<ModoRecorte>('rapido');
  const [exactoDisponible, setExactoDisponible] = useState(true);
  const [conservarAudio, setConservarAudio] = useState(true);
  const [tieneAudio, setTieneAudio] = useState(true);

  // Proceso y resultado
  const [analizando, setAnalizando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultadoUrl, setResultadoUrl] = useState<string | null>(null);
  const [resultadoTamano, setResultadoTamano] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avisoTamano, setAvisoTamano] = useState(false);

  // UI
  const [arrastrando, setArrastrando] = useState(false);
  const [soportado, setSoportado] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previsualizandoRef = useRef(false);

  // Referencias con el object URL vigente: la revocación del anterior se hace al
  // reemplazarlo (en los manejadores) y la del vigente solo al desmontar la página.
  // Así evitamos revocar por error un URL aún en uso durante los re-renders.
  const videoUrlRef = useRef<string | null>(null);
  const resultadoUrlRef = useRef<string | null>(null);
  videoUrlRef.current = videoUrl;
  resultadoUrlRef.current = resultadoUrl;

  // Comprobar soporte de WebCodecs al montar
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.EncodedVideoChunk === 'undefined') {
      setSoportado(false);
    }
  }, []);

  // Revocar los object URLs vigentes solo al desmontar
  useEffect(() => {
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      if (resultadoUrlRef.current) URL.revokeObjectURL(resultadoUrlRef.current);
    };
  }, []);

  const cargarArchivo = useCallback(async (file: File) => {
    setError(null);
    setResultadoUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setResultadoTamano(null);
    setVideoUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setCargado(null);

    const esMp4 = /\.(mp4|m4v|mov)$/i.test(file.name) || file.type === 'video/mp4' || file.type === 'video/quicktime';
    if (!esMp4) {
      setError('Formato no admitido. Este recortador acepta vídeos MP4 y MOV (H.264/H.265), como los de la Game Bar de Windows, móviles y la mayoría de grabadores de pantalla.');
      return;
    }

    setAvisoTamano(file.size > AVISO_TAMANO);
    setNombreArchivo(file.name);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setAnalizando(true);

    try {
      const datos = await cargarVideo(file);
      setCargado(datos);
      setDuracion(datos.duracion);
      setInicio(0);
      setFin(datos.duracion);
      setTiempoActual(0);
      setTieneAudio(datos.audioTrack !== null);
      setConservarAudio(datos.audioTrack !== null);

      const exacto = await modoExactoDisponible(datos);
      setExactoDisponible(exacto);
      if (!exacto) setModo('rapido');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar el vídeo.');
      setVideoUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    } finally {
      setAnalizando(false);
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) cargarArchivo(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) cargarArchivo(file);
  };

  // Reproductor
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setTiempoActual(v.currentTime);
    if (previsualizandoRef.current && v.currentTime >= fin) {
      v.pause();
      previsualizandoRef.current = false;
    }
  };

  const alternarReproduccion = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    previsualizandoRef.current = false;
    if (v.paused) v.play(); else v.pause();
  }, []);

  const saltar = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(duracion, v.currentTime + delta));
    previsualizandoRef.current = false;
  };

  const marcarInicio = () => {
    const t = videoRef.current?.currentTime ?? 0;
    setInicio(t);
    if (fin <= t) setFin(duracion);
  };

  const marcarFin = () => {
    const t = videoRef.current?.currentTime ?? 0;
    setFin(t);
    if (inicio >= t) setInicio(0);
  };

  const previsualizarSeleccion = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = inicio;
    previsualizandoRef.current = true;
    v.play();
  };

  const clicLineaTiempo = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || duracion === 0) return;
    const caja = e.currentTarget.getBoundingClientRect();
    const fraccion = (e.clientX - caja.left) / caja.width;
    v.currentTime = Math.max(0, Math.min(duracion, fraccion * duracion));
    previsualizandoRef.current = false;
  };

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!cargado) return;
      const paso = e.shiftKey ? 0.1 : 1;
      switch (e.key) {
        case ' ': e.preventDefault(); alternarReproduccion(); break;
        case 'i': case 'I': marcarInicio(); break;
        case 'o': case 'O': marcarFin(); break;
        case 'ArrowLeft': e.preventDefault(); saltar(-paso); break;
        case 'ArrowRight': e.preventDefault(); saltar(paso); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargado, duracion, inicio, fin, alternarReproduccion]);

  // Exportar
  const exportar = async () => {
    if (!cargado) return;
    if (fin - inicio < 0.2) { setError('La selección es demasiado corta (mínimo 0,2 s).'); return; }
    setError(null);
    setProcesando(true);
    setProgreso(0);
    setResultadoUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setResultadoTamano(null);

    try {
      const blob = await recortar(cargado, {
        inicio,
        fin,
        modo,
        conservarAudio: conservarAudio && tieneAudio,
        onProgress: (f) => setProgreso(f),
      });
      const url = URL.createObjectURL(blob);
      setResultadoUrl(url);
      setResultadoTamano(blob.size);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al recortar el vídeo.');
    } finally {
      setProcesando(false);
    }
  };

  const nombreSalida = (): string => {
    const base = nombreArchivo.replace(/\.[^.]+$/, '') || 'video';
    const etiqueta = modo === 'exacto' ? 'recorte-exacto' : 'recorte';
    return `${base}_${etiqueta}.mp4`;
  };

  const duracionSeleccion = Math.max(0, fin - inicio);
  const pct = (t: number) => (duracion > 0 ? (t / duracion) * 100 : 0);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Recortador de Vídeo Online</h1>
        <p>Corta tus vídeos MP4 sin subirlos a ningún servidor. Sin registro, sin marca de agua y sin límites. Todo ocurre dentro de tu navegador.</p>
      </header>

      <LegalNotice />

      {!soportado && (
        <div className={styles.warningBox} role="alert">
          <strong><span aria-hidden="true">⚠️</span> Navegador no compatible.</strong> Este recortador necesita la tecnología WebCodecs, disponible en Chrome y Edge (94+), y en versiones recientes de Safari y Firefox. Actualiza tu navegador o prueba con Chrome/Edge de escritorio.
        </div>
      )}

      {/* 1 · Cargar vídeo */}
      <section className={styles.card}>
        <h2 className={styles.stepTitle}><span aria-hidden="true">1</span> Elige tu vídeo</h2>
        <div
          className={`${styles.dropZone} ${arrastrando ? styles.dropActivo : ''}`}
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          aria-label="Zona para soltar o seleccionar un vídeo"
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,.mp4,.m4v,.mov"
            onChange={onInputChange}
            className={styles.inputOculto}
          />
          <span className={styles.dropIcono} aria-hidden="true">🎬</span>
          <p className={styles.dropTexto}>
            {analizando ? 'Analizando vídeo…' : 'Arrastra aquí tu vídeo MP4 o haz clic para seleccionarlo'}
          </p>
          <p className={styles.dropNota}>Los clips grabados con la Game Bar de Windows (Win+Alt+G) funcionan directamente</p>
        </div>

        {avisoTamano && (
          <p className={styles.notaAviso}><span aria-hidden="true">⚠️</span> El archivo es grande. Al procesarse en memoria, el navegador podría ir lento o quedarse sin memoria. Para clips largos, considera recortar por partes.</p>
        )}
      </section>

      {error && <div className={styles.errorBox} role="alert">{error}</div>}

      {/* 2 · Editor */}
      {cargado && videoUrl && (
        <>
          <section className={styles.card}>
            <h2 className={styles.stepTitle}><span aria-hidden="true">2</span> Marca el fragmento</h2>

            <div className={styles.videoWrap}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                src={videoUrl}
                className={styles.video}
                onTimeUpdate={onTimeUpdate}
                onClick={alternarReproduccion}
                playsInline
              />
            </div>

            {/* Línea de tiempo */}
            <div className={styles.lineaTiempo} onClick={clicLineaTiempo} role="presentation">
              <div
                className={styles.seleccion}
                style={{ left: `${pct(inicio)}%`, width: `${pct(duracionSeleccion)}%` }}
              />
              <div className={styles.cabezal} style={{ left: `${pct(tiempoActual)}%` }} />
            </div>

            {/* Controles de reproducción */}
            <div className={styles.controles}>
              <button type="button" className={styles.btnControl} onClick={alternarReproduccion} aria-label="Reproducir o pausar">⏯</button>
              <button type="button" className={styles.btnControlMini} onClick={() => saltar(-1)}>−1s</button>
              <button type="button" className={styles.btnControlMini} onClick={() => saltar(-0.1)}>−0,1s</button>
              <button type="button" className={styles.btnControlMini} onClick={() => saltar(0.1)}>+0,1s</button>
              <button type="button" className={styles.btnControlMini} onClick={() => saltar(1)}>+1s</button>
              <span className={styles.tiempo}>{formatTiempo(tiempoActual)} <span className={styles.tiempoTotal}>/ {formatTiempo(duracion)}</span></span>
              <button type="button" className={styles.btnSecundario} onClick={previsualizarSeleccion}><span aria-hidden="true">▶</span> Ver selección</button>
            </div>

            {/* Marcado */}
            <div className={styles.marcado}>
              <div className={styles.marca}>
                <button type="button" className={styles.btnMarca} onClick={marcarInicio}><span aria-hidden="true">⬇</span> Marcar inicio</button>
                <span className={styles.valorMarca}>{formatTiempo(inicio)}</span>
              </div>
              <div className={styles.marca}>
                <button type="button" className={styles.btnMarca} onClick={marcarFin}><span aria-hidden="true">⬇</span> Marcar fin</button>
                <span className={styles.valorMarca}>{formatTiempo(fin)}</span>
              </div>
              <span className={styles.duracionSel}>Selección: {formatTiempo(duracionSeleccion)}</span>
            </div>

            <p className={styles.atajos}>
              Atajos: <kbd>Espacio</kbd> reproducir · <kbd>I</kbd> marcar inicio · <kbd>O</kbd> marcar fin · <kbd>←</kbd>/<kbd>→</kbd> ±1s · <kbd>Mayús</kbd>+<kbd>←</kbd>/<kbd>→</kbd> ±0,1s
            </p>
          </section>

          {/* 3 · Modo y opciones */}
          <section className={styles.card}>
            <h2 className={styles.stepTitle}><span aria-hidden="true">3</span> Modo de recorte</h2>
            <div className={styles.modos}>
              <button
                type="button"
                className={`${styles.modoBtn} ${modo === 'rapido' ? styles.modoActivo : ''}`}
                aria-pressed={modo === 'rapido'}
                onClick={() => setModo('rapido')}
              >
                <span className={styles.modoTitulo}><span aria-hidden="true">⚡</span> Rápido</span>
                <span className={styles.modoDesc}>Sin recodificar · instantáneo · sin pérdida. El inicio se ajusta al fotograma clave cercano.</span>
              </button>
              <button
                type="button"
                className={`${styles.modoBtn} ${modo === 'exacto' ? styles.modoActivo : ''} ${!exactoDisponible ? styles.modoDeshabilitado : ''}`}
                aria-pressed={modo === 'exacto'}
                disabled={!exactoDisponible}
                onClick={() => setModo('exacto')}
              >
                <span className={styles.modoTitulo}><span aria-hidden="true">🎯</span> Exacto</span>
                <span className={styles.modoDesc}>
                  {exactoDisponible
                    ? 'Recodifica con aceleración por hardware · preciso al fotograma que marcas.'
                    : 'No disponible en este navegador. Usa Chrome/Edge de escritorio.'}
                </span>
              </button>
            </div>

            {tieneAudio ? (
              <label className={styles.opcionAudio}>
                <input type="checkbox" checked={conservarAudio} onChange={(e) => setConservarAudio(e.target.checked)} />
                <span>Conservar el audio</span>
              </label>
            ) : (
              <p className={styles.notaAviso}>Este vídeo no tiene pista de audio.</p>
            )}
          </section>

          {/* 4 · Exportar */}
          <section className={styles.card}>
            <h2 className={styles.stepTitle}><span aria-hidden="true">4</span> Exportar</h2>
            <button type="button" className={styles.btnExportar} onClick={exportar} disabled={procesando || !soportado}>
              {procesando ? 'Procesando…' : '✂ Recortar y descargar'}
            </button>

            {procesando && (
              <div className={styles.barraProgreso} aria-hidden="true">
                <div className={styles.rellenoProgreso} style={{ width: `${Math.round(progreso * 100)}%` }} />
              </div>
            )}
            {procesando && (
              <p className={styles.notaProgreso} role="status" aria-live="polite">
                {modo === 'exacto' ? 'Recodificando el fragmento…' : 'Copiando el fragmento…'} {Math.round(progreso * 100)}%
              </p>
            )}

            {resultadoUrl && resultadoTamano !== null && (
              <div className={styles.resultado} role="status" aria-live="polite">
                <p className={styles.resultadoOk}><span aria-hidden="true">✅</span> Recorte listo · {formatTiempo(duracionSeleccion)} · {formatTamano(resultadoTamano)}</p>
                <video src={resultadoUrl} className={styles.videoResultado} controls playsInline />
                <a href={resultadoUrl} download={nombreSalida()} className={styles.btnDescargar}><span aria-hidden="true">⬇</span> Descargar {nombreSalida()}</a>
              </div>
            )}
          </section>
        </>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="Todo sobre el recorte de vídeo en el navegador"
        subtitle="Cómo funciona, cuándo usar cada modo y consejos para redes sociales"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Modo rápido</th>
                <th>Modo exacto</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Recodifica</td><td>No (copia directa)</td><td>Sí (con WebCodecs)</td></tr>
              <tr><td>Velocidad</td><td>Casi instantáneo</td><td>Rápido (acelerado por hardware)</td></tr>
              <tr><td>Precisión del inicio</td><td>Fotograma clave cercano (±1-2 s)</td><td>Exacto al fotograma marcado</td></tr>
              <tr><td>Calidad</td><td>Idéntica al original</td><td>Muy alta (leve recompresión)</td></tr>
              <tr><td>Ideal para</td><td>Cortes donde el segundo exacto no importa</td><td>Empezar justo en la jugada o el momento clave</td></tr>
              <tr><td>Tamaño resultante</td><td>Proporcional al original</td><td>Según bitrate recalculado</td></tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🎮</span> Clips de partidas (Game Bar)</h3>
            <p>Graba con Win+Alt+G en Windows y recorta los segundos buenos de la jugada. El MP4 de la Game Bar se abre aquí directamente, sin conversiones previas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">𝕏</span> Publicar en X</h3>
            <p>X acepta MP4 en 16:9 tal cual. Recorta el fragmento y súbelo directamente: no necesitas cambiar el formato ni la proporción para que se vea correctamente.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">📱</span> TikTok, Reels y Shorts</h3>
            <p>Recorta la parte que quieres y súbela; las apps de TikTok e Instagram permiten reencuadrar a vertical al publicar. El recorte conserva la resolución original.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🔒</span> Vídeos privados o sensibles</h3>
            <p>Como nada se sube a Internet, puedes recortar grabaciones personales, médicas o de trabajo sin exponerlas a servidores de terceros ni políticas de privacidad dudosas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">📹</span> Grabaciones de reuniones</h3>
            <p>Extrae solo el fragmento relevante de una videollamada o webinar grabado para compartirlo con quien no pudo asistir, sin enviar la reunión entera.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🎓</span> Tutoriales y demostraciones</h3>
            <p>Corta el paso concreto de un tutorial de pantalla para incrustarlo en documentación o enviarlo por mensajería, dejando fuera lo que sobra al principio y al final.</p>
          </div>
        </div>

        {/* FAQ ampliada */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3>¿Mis vídeos se suben a algún servidor?</h3>
            <p>No. Todo el procesamiento ocurre en tu navegador mediante la API WebCodecs y librerías que corren localmente. El vídeo nunca sale de tu dispositivo ni pasa por servidores de meskeIA. Puedes comprobarlo: la herramienta funciona incluso sin conexión una vez cargada la página.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Por qué el modo rápido no empieza exactamente donde marco?</h3>
            <p>Los vídeos comprimidos solo pueden cortarse «limpiamente» en los fotogramas clave (keyframes), que aparecen cada uno o dos segundos. El modo rápido respeta esos puntos para no recodificar. Si necesitas empezar en un instante concreto, usa el modo exacto, que recodifica el fragmento.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Hace falta convertir el vídeo a vertical para subirlo a redes?</h3>
            <p>No. Todas las plataformas aceptan MP4 en cualquier proporción. Un clip horizontal se sube a X tal cual, y TikTok o Instagram te dejan reencuadrarlo a vertical en el momento de publicar. La conversión de formato es una optimización de presentación, no un requisito para poder publicar.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué formatos de vídeo admite?</h3>
            <p>Admite MP4 y MOV con vídeo H.264 (el más común) y H.265/HEVC. Es exactamente lo que producen la Game Bar de Windows, los móviles y la mayoría de grabadores de pantalla. Los formatos menos habituales (MKV, AVI, WMV) no se admiten en esta versión.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Se pierde calidad al recortar?</h3>
            <p>En el modo rápido no se pierde nada: se copian los datos originales sin tocarlos. En el modo exacto hay una recompresión del fragmento, con una pérdida mínima e imperceptible en la práctica gracias a un bitrate alto calculado según la resolución.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Hay marca de agua o límite de exportaciones?</h3>
            <p>No. No hay marca de agua, ni límite de duración, ni número máximo de recortes, ni necesidad de crear una cuenta. Es una diferencia clave frente a muchos editores online que reservan estas funciones para planes de pago.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Funciona en el móvil?</h3>
            <p>El modo rápido funciona en navegadores móviles modernos. El modo exacto depende de que el navegador del móvil admita codificación de vídeo por WebCodecs, algo aún desigual en dispositivos móviles. Para máxima compatibilidad, usa Chrome o Edge en un ordenador.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Por qué tarda más el modo exacto?</h3>
            <p>Porque decodifica cada fotograma del fragmento y lo vuelve a codificar para poder empezar en el punto exacto. Usa la aceleración por hardware del navegador, por lo que sigue siendo rápido, pero no instantáneo como la copia directa del modo rápido.</p>
          </div>
        </div>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Abre tu vídeo</h3>
              <p>Arrastra el MP4 a la zona de carga o haz clic para seleccionarlo. Se analiza en tu dispositivo, sin subirse a ningún sitio.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Sitúa el inicio y el fin</h3>
              <p>Reproduce o desplázate con las flechas (±1 s, o ±0,1 s con Mayús) y pulsa «Marcar inicio» y «Marcar fin» en los puntos deseados.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Elige el modo</h3>
              <p>Rápido para un corte instantáneo sin pérdida; exacto cuando necesitas empezar justo en un fotograma concreto.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Exporta y descarga</h3>
              <p>Pulsa «Recortar y descargar». El resultado es un MP4 listo para subir a cualquier red social, guardado en tu carpeta de descargas.</p>
            </div>
          </div>
        </div>

        {/* Consejos */}
        <div className={styles.tipsBox}>
          <h3><span aria-hidden="true">💡</span> Consejos</h3>
          <ul>
            <li>Para clips de redes sociales, apunta a duraciones cortas: los primeros segundos son los que retienen la atención.</li>
            <li>Si el modo rápido corta un poco antes de lo que querías, cambia al modo exacto solo para ese recorte.</li>
            <li>Trabaja con clips ya recortados por la Game Bar en vez de grabaciones de horas: irá más fluido en memoria.</li>
            <li>Si vas a recortar el mismo vídeo varias veces, no cierres la pestaña: se mantiene analizado y listo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('recortador-video')} />
      <ShareCard appName="recortador-video" />
      <Footer appName="recortador-video" />
    </div>
  );
}
