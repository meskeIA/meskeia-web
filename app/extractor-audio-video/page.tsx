'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import styles from './ExtractorAudioVideo.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type FormatoSalida = 'mp3' | 'wav';
type CalidadMp3 = '128k' | '192k' | '320k';
type Estado = 'idle' | 'cargando-ffmpeg' | 'procesando' | 'completado' | 'error';

interface InfoVideo {
  nombre: string;
  tamanio: number;
  tipo: string;
}

const formatearTiempo = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const formatearTamanio = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

export default function ExtractorAudioVideoPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [infoVideo, setInfoVideo] = useState<InfoVideo | null>(null);
  const [duracion, setDuracion] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [fin, setFin] = useState(0);
  const [formato, setFormato] = useState<FormatoSalida>('mp3');
  const [calidadMp3, setCalidadMp3] = useState<CalidadMp3>('192k');
  const [estado, setEstado] = useState<Estado>('idle');
  const [progreso, setProgreso] = useState(0);
  const [mensajeError, setMensajeError] = useState('');
  const [urlDescarga, setUrlDescarga] = useState<string | null>(null);
  const [nombreDescarga, setNombreDescarga] = useState('');
  const [arrastrando, setArrastrando] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegCargadoRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urlDescargaRef = useRef<string | null>(null);
  const videoUrlRef = useRef<string | null>(null);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      if (urlDescargaRef.current) URL.revokeObjectURL(urlDescargaRef.current);
    };
  }, []);

  const manejarArchivo = useCallback((file: File) => {
    // Limpiar URLs anteriores
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    if (urlDescargaRef.current) URL.revokeObjectURL(urlDescargaRef.current);

    setUrlDescarga(null);
    setNombreDescarga('');
    setEstado('idle');
    setProgreso(0);
    setMensajeError('');
    setDuracion(0);
    setInicio(0);
    setFin(0);

    const url = URL.createObjectURL(file);
    videoUrlRef.current = url;

    setVideoFile(file);
    setVideoUrl(url);
    setInfoVideo({ nombre: file.name, tamanio: file.size, tipo: file.type });
  }, []);

  const alCargarMetadatos = useCallback(() => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (isNaN(dur) || !isFinite(dur) || dur <= 0) return;
    setDuracion(dur);
    setInicio(0);
    setFin(dur);
  }, []);

  const alSoltarArchivo = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files[0];
    if (file) manejarArchivo(file);
  }, [manejarArchivo]);

  const extraerAudio = useCallback(async () => {
    if (!videoFile) return;

    setEstado('cargando-ffmpeg');
    setProgreso(0);
    setMensajeError('');

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      if (!ffmpegRef.current) {
        ffmpegRef.current = new FFmpeg();
      }
      const ffmpeg = ffmpegRef.current;

      if (!ffmpegCargadoRef.current) {
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        ffmpegCargadoRef.current = true;
      }

      setEstado('procesando');

      ffmpeg.on('progress', ({ progress }: { progress: number }) => {
        setProgreso(Math.min(Math.round(progress * 100), 99));
      });

      const ext = videoFile.name.split('.').pop()?.toLowerCase() || 'mp4';
      const inputName = `input.${ext}`;
      const outputName = `output.${formato}`;

      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      const tiempoInicio = duracion > 0 ? inicio : 0;
      const tiempoFin = duracion > 0 ? fin : 3600;
      // Duración del fragmento (siempre inequívoca, evita ambigüedad de -to)
      const duracionExtraccion = (tiempoFin - tiempoInicio).toFixed(3);

      const args: string[] = [
        // -ss ANTES de -i = input seeking (rápido, por keyframe)
        // -t = duración del output (no timestamp de fin), evita confusión con -to
        '-ss', tiempoInicio.toFixed(3),
        '-i', inputName,
        '-t', duracionExtraccion,
        '-vn',
      ];

      if (formato === 'mp3') {
        args.push('-acodec', 'libmp3lame', '-ab', calidadMp3, '-ar', '44100');
      } else {
        args.push('-acodec', 'pcm_s16le', '-ar', '44100');
      }

      args.push('-y', outputName);

      const codigo = await ffmpeg.exec(args);

      if (codigo !== 0) {
        throw new Error('El motor de procesamiento devolvió un error. Verifica que el vídeo tenga pista de audio.');
      }

      const datos = await ffmpeg.readFile(outputName) as Uint8Array<ArrayBuffer>;
      const blob = new Blob([datos], {
        type: formato === 'mp3' ? 'audio/mpeg' : 'audio/wav',
      });

      if (urlDescargaRef.current) URL.revokeObjectURL(urlDescargaRef.current);
      const url = URL.createObjectURL(blob);
      urlDescargaRef.current = url;

      const nombreBase = videoFile.name.replace(/\.[^.]+$/, '');
      const sufijo = duracion > 0
        ? `_${formatearTiempo(inicio).replace(':', 'm')}s-${formatearTiempo(fin).replace(':', 'm')}s`
        : '_audio';
      const nombre = `${nombreBase}${sufijo}.${formato}`;

      setUrlDescarga(url);
      setNombreDescarga(nombre);
      setEstado('completado');
      setProgreso(100);

      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch { /* archivos temporales, ignorar error */ }

    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido durante el procesamiento';
      setMensajeError(mensaje);
      setEstado('error');
    }
  }, [videoFile, inicio, fin, formato, calidadMp3, duracion]);

  const duracionFragmento = duracion > 0 ? fin - inicio : 0;
  const puedeProcesar = !!videoFile && (duracion === 0 || duracionFragmento > 0);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.titulo}>🎬 Extractor de Audio de Vídeo</h1>
        <p className={styles.subtitulo}>
          Extrae fragmentos de audio de tus vídeos directamente en el navegador.<br />
          Sin subir nada a internet — todo ocurre en tu dispositivo.
        </p>
      </header>

      <LegalNotice />

      {/* Badge privacidad — SIEMPRE VISIBLE */}
      <div className={styles.privacyBadge}>
        <span className={styles.privacyIcon}>🔒</span>
        <div>
          <strong>Privacidad garantizada</strong>
          <p>
            Tu vídeo nunca sale de tu dispositivo. El procesamiento ocurre íntegramente en tu
            navegador usando WebAssembly. No se envían datos a ningún servidor.
          </p>
        </div>
      </div>

      {/* PASO 1: Subir vídeo */}
      <section className={styles.seccion}>
        <h2 className={styles.tituloSeccion}>
          <span className={styles.paso}>1</span>
          Sube tu vídeo
        </h2>

        <div
          className={`${styles.dropZone} ${arrastrando ? styles.dropZoneActiva : ''} ${videoFile ? styles.dropZoneConArchivo : ''}`}
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={alSoltarArchivo}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de vídeo"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*,.avi,.mp4,.mov,.mkv,.webm,.mpeg,.wmv,.m4v"
            onChange={(e) => e.target.files?.[0] && manejarArchivo(e.target.files[0])}
            className={styles.inputOculto}
            aria-label="Seleccionar archivo de vídeo"
          />
          {videoFile && infoVideo ? (
            <div className={styles.archivoSeleccionado}>
              <span className={styles.iconoArchivo}>🎬</span>
              <div>
                <p className={styles.nombreArchivo}>{infoVideo.nombre}</p>
                <p className={styles.infoArchivo}>
                  {formatearTamanio(infoVideo.tamanio)}
                  {duracion > 0 ? ` · ${formatearTiempo(duracion)}` : ''}
                  {' · Haz clic para cambiar'}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.placeholderUpload}>
              <span className={styles.iconoUpload}>📁</span>
              <p className={styles.textoUpload}>Arrastra tu vídeo aquí o haz clic para seleccionar</p>
              <p className={styles.formatosAceptados}>AVI · MP4 · MOV · MKV · WebM · WMV · MPEG</p>
            </div>
          )}
        </div>
      </section>

      {videoFile && videoUrl && (
        <>
          {/* PASO 2: Vista previa */}
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              <span className={styles.paso}>2</span>
              Vista previa
            </h2>
            <div className={styles.videoWrapper}>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onLoadedMetadata={alCargarMetadatos}
                className={styles.videoPlayer}
                preload="metadata"
              >
                Tu navegador no soporta la reproducción de este formato de vídeo.
              </video>
            </div>
            {duracion === 0 && (
              <p className={styles.avisoFormato}>
                ⚠️ El navegador no puede previsualizar este formato, pero puedes extraer el audio igualmente.
                Introduce los tiempos manualmente en segundos.
              </p>
            )}
          </section>

          {/* PASO 3: Selección de fragmento */}
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              <span className={styles.paso}>3</span>
              Selecciona el fragmento
            </h2>

            <div className={styles.selectorTiempo}>
              <div className={styles.campoTiempo}>
                <label className={styles.etiqueta}>
                  Inicio
                  <span className={styles.displayTiempo}>{formatearTiempo(inicio)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={duracion || 3600}
                  step={0.5}
                  value={inicio}
                  onChange={(e) => setInicio(Math.min(Number(e.target.value), fin - 0.5))}
                  className={styles.slider}
                  disabled={duracion === 0}
                  aria-label="Tiempo de inicio"
                />
              </div>

              <div className={styles.campoTiempo}>
                <label className={styles.etiqueta}>
                  Fin
                  <span className={styles.displayTiempo}>{formatearTiempo(fin)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={duracion || 3600}
                  step={0.5}
                  value={fin}
                  onChange={(e) => setFin(Math.max(Number(e.target.value), inicio + 0.5))}
                  className={styles.slider}
                  disabled={duracion === 0}
                  aria-label="Tiempo de fin"
                />
              </div>

              {duracion > 0 && (
                <div className={styles.duracionFragmento}>
                  <span aria-hidden="true">⏱️</span>
                  <span>Fragmento seleccionado: <strong>{formatearTiempo(duracionFragmento)}</strong></span>
                </div>
              )}
            </div>

            {/* Entradas manuales de precisión */}
            <div className={styles.inputsManuales}>
              <div className={styles.inputManualGrupo}>
                <label className={styles.etiqueta} htmlFor="inicio-seg">Inicio (segundos)</label>
                <input
                  id="inicio-seg"
                  type="number"
                  min={0}
                  max={duracion || 86400}
                  step={0.1}
                  value={Number(inicio.toFixed(1))}
                  onChange={(e) => {
                    const v = Math.max(0, Number(e.target.value));
                    setInicio(duracion > 0 ? Math.min(v, fin - 0.1) : v);
                  }}
                  className={styles.inputNumero}
                />
              </div>
              <div className={styles.inputManualGrupo}>
                <label className={styles.etiqueta} htmlFor="fin-seg">Fin (segundos)</label>
                <input
                  id="fin-seg"
                  type="number"
                  min={0}
                  max={duracion || 86400}
                  step={0.1}
                  value={Number(fin.toFixed(1))}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFin(duracion > 0 ? Math.min(Math.max(v, inicio + 0.1), duracion) : Math.max(v, inicio + 0.1));
                  }}
                  className={styles.inputNumero}
                />
              </div>
            </div>
          </section>

          {/* PASO 4: Formato de salida */}
          <section className={styles.seccion}>
            <h2 className={styles.tituloSeccion}>
              <span className={styles.paso}>4</span>
              Formato de salida
            </h2>

            <div className={styles.opcionesFormato}>
              <label className={`${styles.opcionFormato} ${formato === 'mp3' ? styles.opcionSeleccionada : ''}`}>
                <input
                  type="radio"
                  name="formato"
                  value="mp3"
                  checked={formato === 'mp3'}
                  onChange={() => setFormato('mp3')}
                  className={styles.radioOculto}
                />
                <span className={styles.iconoFormato} aria-hidden="true">🎵</span>
                <div>
                  <strong>MP3</strong>
                  <span className={styles.descFormato}>Comprimido · Tamaño reducido · Compatible universal</span>
                </div>
              </label>

              <label className={`${styles.opcionFormato} ${formato === 'wav' ? styles.opcionSeleccionada : ''}`}>
                <input
                  type="radio"
                  name="formato"
                  value="wav"
                  checked={formato === 'wav'}
                  onChange={() => setFormato('wav')}
                  className={styles.radioOculto}
                />
                <span className={styles.iconoFormato} aria-hidden="true">🎼</span>
                <div>
                  <strong>WAV</strong>
                  <span className={styles.descFormato}>Sin pérdida · Máxima calidad · Mayor tamaño</span>
                </div>
              </label>
            </div>

            {formato === 'mp3' && (
              <div className={styles.calidadMp3}>
                <p className={styles.etiqueta}>Calidad MP3</p>
                <div className={styles.opcionesCalidad}>
                  {(['128k', '192k', '320k'] as CalidadMp3[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCalidadMp3(c)}
                      className={`${styles.btnCalidad} ${calidadMp3 === c ? styles.btnCalidadActivo : ''}`}
                    >
                      {c === '128k' ? '128 kbps — Estándar' : c === '192k' ? '192 kbps — Alta ✓' : '320 kbps — Máxima'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Acción principal */}
          <div className={styles.accionPrincipal}>
            {(estado === 'idle' || estado === 'error' || estado === 'completado') && (
              <button
                type="button"
                onClick={extraerAudio}
                disabled={!puedeProcesar}
                className={styles.btnExtraer}
                aria-label={estado === 'completado' ? 'Extraer audio de nuevo' : 'Extraer audio del vídeo'}
              >
                {estado === 'completado' ? '🔄 Extraer de nuevo' : '🎵 Extraer Audio'}
              </button>
            )}

            {(estado === 'cargando-ffmpeg' || estado === 'procesando') && (
              <div className={styles.progresoContainer}>
                <p className={styles.mensajeProcesando}>
                  {estado === 'cargando-ffmpeg'
                    ? '⬇️ Cargando motor de procesamiento (~30 MB, solo la primera vez)...'
                    : '⚙️ Procesando audio...'}
                </p>
                <div
                  className={styles.barraProgreso}
                  role="progressbar"
                  aria-valuenow={progreso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progreso: ${progreso}%`}
                >
                  <div className={styles.barraRelleno} style={{ width: `${progreso}%` }} />
                </div>
                <span className={styles.porcentaje}>{progreso}%</span>
              </div>
            )}

            {estado === 'error' && (
              <div className={styles.mensajeError} role="alert">
                <span aria-hidden="true">❌</span>
                <div>
                  <strong>Error durante el procesamiento</strong>
                  <p>{mensajeError}</p>
                </div>
              </div>
            )}

            {estado === 'completado' && urlDescarga && (
              <div className={styles.resultadoContainer}>
                <div className={styles.mensajeExito} role="status" aria-live="polite">
                  <span aria-hidden="true">✅</span>
                  <strong>¡Audio extraído correctamente!</strong>
                </div>
                <a
                  href={urlDescarga}
                  download={nombreDescarga}
                  className={styles.btnDescargar}
                >
                  ⬇️ Descargar {formato.toUpperCase()} — {nombreDescarga}
                </a>
              </div>
            )}
          </div>
        </>
      )}

      {/* Aviso de privacidad — SIEMPRE VISIBLE, fuera del toggle */}
      <div className={styles.avisoPrivacidad}>
        <h3>🔐 Compromiso de privacidad</h3>
        <p>
          Esta herramienta procesa tus archivos íntegramente en tu navegador usando WebAssembly (ffmpeg.wasm).{' '}
          <strong>Ningún archivo, fragmento ni dato sale de tu dispositivo.</strong> No se realizan peticiones
          a servidores con el contenido del vídeo. meskeIA no guarda, analiza ni accede a tus archivos en ningún caso.
        </p>
      </div>

      <EducationalSection
        title="📚 Cómo funciona el extractor de audio"
        subtitle="Tecnología WebAssembly, formatos de audio y privacidad"
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
                <th>Uso ideal</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>MP3 128k</td><td>Con pérdida</td><td>~1 MB</td><td>Estándar</td><td>Universal</td><td>Podcasts, voz</td></tr>
              <tr><td>MP3 192k</td><td>Con pérdida</td><td>~1,4 MB</td><td>Alta</td><td>Universal</td><td>Música casual</td></tr>
              <tr><td>MP3 320k</td><td>Con pérdida</td><td>~2,4 MB</td><td>Máxima (perceptual)</td><td>Universal</td><td>Archivos finales</td></tr>
              <tr><td>WAV 16-bit</td><td>Sin pérdida</td><td>~10 MB</td><td>Perfecta</td><td>Universal</td><td>Edición, producción</td></tr>
              <tr><td>WAV 24-bit</td><td>Sin pérdida</td><td>~15 MB</td><td>Studio</td><td>Universal</td><td>Mastering, cine</td></tr>
              <tr><td>OGG Vorbis</td><td>Con pérdida</td><td>~0,9 MB</td><td>Alta</td><td>Sin Apple</td><td>Web, videojuegos</td></tr>
              <tr><td>AAC</td><td>Con pérdida</td><td>~1,1 MB</td><td>Superior a MP3</td><td>Universal</td><td>Mobile, streaming</td></tr>
              <tr><td>FLAC</td><td>Sin pérdida</td><td>~5 MB</td><td>Perfecta</td><td>Limitada</td><td>Archivado, audiófilos</td></tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2: Casos de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>🎵 Extraer banda sonora de vídeo</h3>
            <p>Obtén el audio de grabaciones de conciertos, películas descargadas o vídeos de YouTube (previamente descargados) en formato MP3 o WAV de alta calidad.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎙️ Preparar fragmentos para podcast</h3>
            <p>Extrae exactamente los segundos que necesitas de una entrevista o grabación para usar como clip en tu episodio de podcast sin herramientas adicionales.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🌍 Aprendizaje de idiomas</h3>
            <p>Aísla diálogos de películas o series para practicar pronunciación. Extrae fragmentos específicos y escúchalos fuera de contexto para mayor retención.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎬 Audio para presentaciones y vídeos</h3>
            <p>Extrae efectos de sonido o músicas de tus grabaciones de vídeo para reutilizarlos en proyectos de edición, sin necesidad de software especializado.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🎛️ Samples para producción musical</h3>
            <p>Obtén fragmentos precisos de grabaciones para usarlos como samples o loops en tu DAW. Usa WAV para mantener la máxima calidad en la edición posterior.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>📁 Convertir colección de vídeos a audio</h3>
            <p>Procesa grabaciones de eventos, clases o conferencias y conviértelas a audio para escucharlas después como si fueran podcasts, sin consumir espacio con el vídeo.</p>
          </div>
        </div>

        {/* Sección 3: FAQ */}
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3>¿Funciona con vídeos de YouTube u otras plataformas?</h3>
            <p>No directamente. Esta herramienta procesa archivos de tu dispositivo. Primero debes descargar el vídeo con un programa específico, luego puedes extraer el audio aquí. Respeta siempre los derechos de autor del contenido.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Por qué la primera extracción tarda ~30 segundos?</h3>
            <p>La primera vez se descarga ffmpeg-core.wasm (~30 MB desde CDN), el motor de procesamiento. Este archivo se guarda en caché del navegador y las siguientes veces es instantáneo. Solo ocurre una vez por dispositivo.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué calidad de MP3 debo elegir?</h3>
            <p>192k es el punto dulce: excelente calidad con tamaño razonable. Usa 128k para voz/podcasts donde el tamaño importa, y 320k solo si el vídeo original es de alta calidad y necesitas la máxima fidelidad.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Puedo extraer solo una parte del vídeo?</h3>
            <p>Sí. Usa los sliders de inicio y fin (o los campos numéricos de precisión) para seleccionar exactamente el fragmento que quieres extraer. La herramienta procesará solo ese segmento.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué pasa si el vídeo no tiene pista de audio?</h3>
            <p>FFmpeg detectará que no hay audio y devolverá un error. Algunos formatos como GIF o vídeos de cámara de seguridad pueden no incluir audio. Verifica que el vídeo tiene sonido antes de procesarlo.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Funciona en dispositivos móviles?</h3>
            <p>Funciona en Chrome/Edge para Android. En iOS (Safari) puede haber limitaciones con WebAssembly para archivos grandes. Para mejores resultados, usa un ordenador de escritorio con Chrome o Firefox.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Cuánto puede pesar el vídeo?</h3>
            <p>No hay límite artificial, pero el vídeo debe caber en la memoria RAM disponible. En ordenadores modernos con 8 GB de RAM puedes procesar vídeos de varios GB sin problemas. Vídeos de más de 10 GB pueden fallar.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿MP3 o WAV para producción musical?</h3>
            <p>Siempre WAV si vas a editar el audio después. El MP3 pierde calidad en cada re-codificación. Si el audio extraído es el producto final (para escuchar), MP3 a 192k o 320k es perfectamente válido.</p>
          </div>
        </div>

        {/* Sección 4: Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Sube tu archivo de vídeo</h3>
              <p>Arrastra el archivo a la zona de carga o haz clic para buscarlo. Se aceptan AVI, MP4, MOV, MKV, WebM, WMV y MPEG.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Previsualiza el vídeo</h3>
              <p>El reproductor incorporado te permite ver el vídeo para identificar el fragmento exacto que quieres extraer antes de procesar.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Selecciona el fragmento</h3>
              <p>Ajusta los sliders de inicio y fin, o escribe los segundos exactos en los campos numéricos para mayor precisión (hasta décimas de segundo).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Elige el formato de salida</h3>
              <p>Selecciona MP3 para uso general o WAV sin pérdida para edición posterior. Para MP3, elige también la calidad (128k, 192k o 320k).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Extrae el audio</h3>
              <p>Pulsa &quot;Extraer Audio&quot;. La primera vez cargará el motor (~30 segundos). Las siguientes extracciones son inmediatas gracias a la caché del navegador.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Descarga el resultado</h3>
              <p>El archivo se descargará automáticamente con un nombre que incluye el fragmento temporal seleccionado (ej: video_0m30s-1m45s.mp3).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Repite para otros fragmentos</h3>
              <p>Pulsa &quot;Extraer de nuevo&quot; para cambiar los tiempos y extraer otro fragmento del mismo vídeo sin necesidad de volver a cargarlo.</p>
            </div>
          </div>
        </div>

        {/* Sección 5: Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>🎯 192k es el punto dulce del MP3</h3>
            <p>Para música, 192k ofrece calidad casi indistinguible del original a un tamaño razonable. Usa 320k solo si el vídeo tiene audio de estudio o necesitas la máxima fidelidad posible.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🎛️ WAV para edición posterior</h3>
            <p>Si vas a importar el audio a un editor (Audacity, Adobe Premiere, DaVinci), usa siempre WAV. Cada re-codificación a MP3 reduce la calidad irreversiblemente.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📻 128k suficiente para voz</h3>
            <p>Para podcasts, entrevistas o grabaciones de voz, 128k es perfectamente válido. El oído humano no aprecia la diferencia en contenido hablado por encima de 96k.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔢 Usa los campos numéricos para precisión</h3>
            <p>Los sliders son cómodos para aproximaciones, pero los campos de &quot;Inicio (segundos)&quot; y &quot;Fin (segundos)&quot; te dan precisión de décimas de segundo para cortes exactos.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>⚡ La caché hace las extracciones rápidas</h3>
            <p>El motor ffmpeg.wasm (~30 MB) se descarga solo la primera vez. En sesiones siguientes ya está en caché del navegador y el procesamiento comienza inmediatamente.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🔄 Extrae múltiples fragmentos sin recargar</h3>
            <p>Usa el botón &quot;Extraer de nuevo&quot; para cambiar los tiempos y sacar otro fragmento del mismo vídeo. No necesitas volver a seleccionar el archivo cada vez.</p>
          </div>
        </div>

        {/* Sección 6: Warning Box */}
        <div className={styles.warningBox}>
          <h3>⚠️ Importante antes de usar</h3>
          <ul className={styles.warningList}>
            <li>Esta herramienta solo procesa archivos que ya están en tu dispositivo. No descarga vídeos de internet.</li>
            <li>Respeta los derechos de autor: extrae audio solo de contenido del que seas titular o tengas licencia para usar.</li>
            <li>El tiempo de procesamiento depende del tamaño del vídeo y la potencia de tu dispositivo — no hay límite de tiempo, solo paciencia.</li>
            <li>Algunos formatos de vídeo poco comunes pueden no ser compatibles con todos los navegadores aunque FFmpeg los soporte.</li>
          </ul>
        </div>

        {/* Contenido original — preservado */}
        <section className={styles.seccionEdu}>
          <h2>¿Por qué tu vídeo no sale del navegador?</h2>
          <p>
            Esta herramienta usa <strong>ffmpeg.wasm</strong>, una versión del procesador multimedia FFmpeg
            compilada en WebAssembly (WASM). WebAssembly permite ejecutar código nativo de alto rendimiento
            directamente en el navegador, sin necesidad de plugins ni instalaciones.
          </p>
          <p>
            El resultado es que toda la operación (leer el vídeo, extraer el audio, convertir el formato)
            ocurre dentro de tu navegador, en la memoria RAM de tu ordenador. El vídeo nunca abandona tu
            dispositivo, igual que si usases un programa instalado localmente.
          </p>
        </section>

        <section className={styles.seccionEdu}>
          <h2>MP3 vs WAV: ¿cuándo usar cada uno?</h2>
          <ul>
            <li>
              <strong>MP3 (MPEG Layer 3):</strong> Compresión con pérdida. Reduce el tamaño eliminando
              frecuencias que el oído humano difícilmente percibe. Ideal para música, podcasts y uso
              general. 1 minuto a 192 kbps ocupa ~1,4 MB.
            </li>
            <li>
              <strong>WAV (Waveform Audio):</strong> Sin compresión. Guarda el audio con total fidelidad.
              Ideal para edición profesional y producción musical. 1 minuto a 44.100 Hz 16-bit estéreo
              ocupa ~10 MB.
            </li>
          </ul>
        </section>

        <section className={styles.seccionEdu}>
          <h2>Formatos de vídeo compatibles</h2>
          <p>FFmpeg soporta prácticamente todos los formatos de vídeo existentes:</p>
          <ul>
            <li><strong>AVI</strong> — Formato clásico de Microsoft, ampliamente compatible</li>
            <li><strong>MP4 / M4V</strong> — El formato más común actualmente</li>
            <li><strong>MOV</strong> — Formato nativo de Apple QuickTime</li>
            <li><strong>MKV</strong> — Contenedor abierto de alta calidad</li>
            <li><strong>WebM</strong> — Formato abierto para web (VP8/VP9)</li>
            <li><strong>WMV</strong> — Windows Media Video</li>
            <li><strong>MPEG</strong> — Formato estándar de vídeo digital</li>
          </ul>
        </section>

        <section className={styles.seccionEdu}>
          <h2>¿Qué son los ~30 MB de carga inicial?</h2>
          <p>
            La primera vez que extraes audio, tu navegador descarga el motor de procesamiento
            (ffmpeg-core.wasm, ~30 MB desde CDN). Este archivo queda en caché del navegador, por lo que
            las siguientes visitas son instantáneas. En una conexión de 30 Mbps tarda unos 8 segundos.
            El tamaño es comparable al de muchas páginas web modernas.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('extractor-audio-video')} />
      <ShareCard appName="extractor-audio-video" />
      <Footer appName="extractor-audio-video" />
    </div>
  );
}
