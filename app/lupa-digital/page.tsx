'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './LupaDigital.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type FiltroTipo = 'ninguno' | 'alto-contraste' | 'invertir' | 'escala-grises' | 'sepia';

/**
 * Por qué no basta con «concedido / denegado»: un equipo sin webcam recibe un
 * NotFoundError, y contestarle «activa el permiso en el navegador» le manda a un
 * ajuste que no arregla nada. Cada motivo lleva su consejo.
 */
type EstadoCamara = 'prompt' | 'granted' | 'denied' | 'sin-camara' | 'error';

const AVISOS_CAMARA: Record<'denied' | 'sin-camara' | 'error', { icono: string; titulo: string; consejo: string }> = {
  denied: {
    icono: '🚫',
    titulo: 'Permiso de cámara denegado',
    consejo: 'Activa la cámara en la configuración del navegador',
  },
  'sin-camara': {
    icono: '📷',
    titulo: 'No se ha encontrado ninguna cámara',
    consejo: 'Este equipo no tiene cámara disponible. Prueba desde el móvil o conecta una webcam.',
  },
  error: {
    icono: '⚠️',
    titulo: 'No se ha podido abrir la cámara',
    consejo: 'Puede que otra aplicación la esté usando. Ciérrala e inténtalo de nuevo.',
  },
};

export default function LupaDigitalPage() {
  const [activo, setActivo] = useState(false);
  const [zoom, setZoom] = useState(2);
  const [filtro, setFiltro] = useState<FiltroTipo>('ninguno');
  const [brillo, setBrillo] = useState(100);
  const [contraste, setContraste] = useState(100);
  const [linterna, setLinterna] = useState(false);
  const [permisoCamara, setPermisoCamara] = useState<EstadoCamara>('prompt');
  const [avisoLinterna, setAvisoLinterna] = useState('');
  const [camaraActual, setCamaraActual] = useState<'user' | 'environment'>('environment');
  const [congelado, setCongelado] = useState(false);
  const [desplazamiento, setDesplazamiento] = useState({ x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visorRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const arrastreRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * El facingMode entra por parámetro (con la cámara actual por defecto) porque
   * «Cambiar cámara» reinicia justo después de un setState: leerlo del closure
   * devolvía la cámara ANTERIOR y el primer toque no cambiaba nada.
   */
  const iniciarCamara = async (facingMode: 'user' | 'environment' = camaraActual) => {
    try {
      // Detener stream anterior si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setPermisoCamara('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Un pause() previo (al congelar) deja el elemento marcado como pausado y el
        // atributo autoPlay ya no vuelve a arrancarlo: hay que pedirlo explícitamente.
        videoRef.current.play().catch(() => { /* sin permiso o pestaña oculta */ });
      }

      setActivo(true);

      // Intentar activar linterna si está solicitada
      if (linterna) {
        toggleLinterna(true);
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      const nombre = error instanceof Error ? error.name : '';
      if (nombre === 'NotFoundError' || nombre === 'DevicesNotFoundError') {
        setPermisoCamara('sin-camara');
      } else if (nombre === 'NotAllowedError' || nombre === 'PermissionDeniedError' || nombre === 'SecurityError') {
        setPermisoCamara('denied');
      } else {
        setPermisoCamara('error');
      }
    }
  };

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActivo(false);
    setLinterna(false);
    setAvisoLinterna('');
    setCongelado(false);
    setDesplazamiento({ x: 0, y: 0 });
  };

  const toggleLinterna = async (estado: boolean) => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track && 'getCapabilities' in track
      ? track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean }
      : undefined;

    // Salir en silencio dejaba al usuario pulsando un botón que no responde: las
    // webcams y las cámaras frontales casi nunca exponen la capacidad torch.
    if (!capabilities?.torch) {
      setAvisoLinterna('Esta cámara no tiene linterna. Suele estar disponible solo en la cámara trasera del móvil.');
      return;
    }

    try {
      await track.applyConstraints({
        advanced: [{ torch: estado } as MediaTrackConstraintSet]
      });
      setLinterna(estado);
      setAvisoLinterna('');
    } catch {
      setAvisoLinterna('No se ha podido encender la linterna en este dispositivo.');
    }
  };

  const cambiarCamara = async () => {
    const nuevaCamara = camaraActual === 'user' ? 'environment' : 'user';
    setCamaraActual(nuevaCamara);
    if (activo) {
      // Reiniciar con nueva cámara
      detenerCamara();
      setTimeout(() => iniciarCamara(nuevaCamara), 100);
    }
  };

  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, []);

  // Reiniciar cámara al cambiar
  useEffect(() => {
    if (activo) {
      iniciarCamara();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camaraActual]);

  /**
   * Al ampliar z veces, la imagen sobresale del visor (z - 1) / 2 por cada lado:
   * ese es el margen que se puede recorrer. Más allá solo habría fondo negro.
   */
  const acotarDesplazamiento = (x: number, y: number) => {
    const visor = visorRef.current;
    if (!visor) return { x: 0, y: 0 };
    const maxX = (visor.clientWidth * (zoom - 1)) / 2;
    const maxY = (visor.clientHeight * (zoom - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const congelar = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    // Se copia a la resolución nativa del sensor, no a la del visor: así el zoom
    // sobre la imagen quieta conserva todo el detalle que la cámara llegó a captar.
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // El vídeo se pausa (deja de consumir batería) pero el stream sigue abierto,
    // de modo que reanudar es inmediato y no vuelve a pedir permiso de cámara.
    video.pause();
    setDesplazamiento({ x: 0, y: 0 });
    setCongelado(true);
  };

  const descongelar = () => {
    setCongelado(false);
    setDesplazamiento({ x: 0, y: 0 });
    videoRef.current?.play().catch(() => {
      // Algunos navegadores rechazan play() si la pestaña quedó oculta; al volver
      // a ella el propio elemento se reanuda por su atributo autoPlay.
    });
  };

  const iniciarArrastre = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!congelado) return;
    arrastreRef.current = { x: e.clientX - desplazamiento.x, y: e.clientY - desplazamiento.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const moverArrastre = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const inicio = arrastreRef.current;
    if (!inicio) return;
    setDesplazamiento(acotarDesplazamiento(e.clientX - inicio.x, e.clientY - inicio.y));
  };

  const terminarArrastre = (e: React.PointerEvent<HTMLCanvasElement>) => {
    arrastreRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  /** El arrastre con el dedo o el ratón no sirve con teclado: mismas flechas, mismo recorrido. */
  const moverConTeclado = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!congelado) return;
    const paso = e.shiftKey ? 60 : 20;
    const pasos: Record<string, [number, number]> = {
      ArrowLeft: [paso, 0],
      ArrowRight: [-paso, 0],
      ArrowUp: [0, paso],
      ArrowDown: [0, -paso],
    };
    const delta = pasos[e.key];
    if (!delta) return;
    e.preventDefault();
    setDesplazamiento(acotarDesplazamiento(desplazamiento.x + delta[0], desplazamiento.y + delta[1]));
  };

  // Al bajar el zoom encoge el margen recorrible: sin reacotar, la imagen quieta
  // se quedaría descuadrada enseñando fondo negro por un lado.
  useEffect(() => {
    if (!congelado) return;
    setDesplazamiento(d => acotarDesplazamiento(d.x, d.y));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, congelado]);

  const getFiltroStyle = (): string => {
    const filtros: string[] = [];

    filtros.push(`brightness(${brillo}%)`);
    filtros.push(`contrast(${contraste}%)`);

    switch (filtro) {
      case 'alto-contraste':
        filtros.push('contrast(200%)');
        break;
      case 'invertir':
        filtros.push('invert(100%)');
        break;
      case 'escala-grises':
        filtros.push('grayscale(100%)');
        break;
      case 'sepia':
        filtros.push('sepia(100%)');
        break;
    }

    return filtros.join(' ');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Lupa Digital Online</h1>
        <p className={styles.subtitle}>
          Convierte tu móvil o celular en una lupa: amplía texto y objetos con la cámara
        </p>
      </header>

      <LegalNotice />

      {/* Visor de la lupa */}
      <div className={styles.lupaContainer} ref={visorRef}>
        {!activo ? (
          <div className={styles.lupaPlaceholder} role="status" aria-live="polite">
            {permisoCamara !== 'prompt' && permisoCamara !== 'granted' ? (
              <div role="alert">
                <span aria-hidden="true" className={styles.placeholderIcon}>{AVISOS_CAMARA[permisoCamara].icono}</span>
                <p>{AVISOS_CAMARA[permisoCamara].titulo}</p>
                <p className={styles.placeholderSubtexto}>
                  {AVISOS_CAMARA[permisoCamara].consejo}
                </p>
              </div>
            ) : (
              // Era un <div role="status"> sin onClick, sin botón dentro y con
              // cursor:auto: ocupaba el ancho entero de la pantalla, invitaba a pulsar
              // y no pasaba nada (Inspector, 20/08/2026).
              <button
                type="button"
                className={styles.placeholderBoton}
                onClick={() => iniciarCamara()}
              >
                <span aria-hidden="true" className={styles.placeholderIcon}>🔍</span>
                <span>Pulsa para activar la lupa</span>
              </button>
            )}
          </div>
        ) : null}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.lupaVideo}
          style={{
            display: activo && !congelado ? 'block' : 'none',
            transform: `scale(${zoom})`,
            filter: getFiltroStyle(),
          }}
        />

        {/* Imagen congelada: se amplía, se filtra y se recorre igual que el vídeo */}
        <canvas
          ref={canvasRef}
          className={`${styles.lupaVideo} ${styles.lupaCanvas}`}
          role="img"
          tabIndex={congelado ? 0 : -1}
          aria-label="Imagen congelada: arrástrala o usa las flechas del teclado para recorrerla"
          style={{
            display: congelado ? 'block' : 'none',
            transform: `translate(${desplazamiento.x}px, ${desplazamiento.y}px) scale(${zoom})`,
            filter: getFiltroStyle(),
          }}
          onPointerDown={iniciarArrastre}
          onPointerMove={moverArrastre}
          onPointerUp={terminarArrastre}
          onPointerCancel={terminarArrastre}
          onKeyDown={moverConTeclado}
        />

        {/* Controles sobre el video */}
        {activo && (
          <div className={styles.controlesOverlay}>
            {congelado && (
              <span className={styles.congeladoIndicador}>
                <span aria-hidden="true">❄️</span> Congelada
              </span>
            )}
            <span className={styles.zoomIndicador}>{formatNumber(zoom, zoom % 1 === 0 ? 0 : 1)}x</span>
          </div>
        )}
      </div>

      {/* Botón principal */}
      <div className={styles.controlPrincipal}>
        <button
          type="button"
          className={`${styles.btnPrincipal} ${activo ? styles.activo : ''}`}
          onClick={activo ? detenerCamara : () => iniciarCamara()}
          aria-pressed={activo}
        >
          {activo ? <><span aria-hidden="true">⏹️</span> Detener</> : <><span aria-hidden="true">🔍</span> Activar lupa</>}
        </button>

        {activo && (
          <button
            type="button"
            className={`${styles.btnCongelar} ${congelado ? styles.congelarActivo : ''}`}
            onClick={congelado ? descongelar : congelar}
            aria-pressed={congelado}
          >
            {congelado
              ? <><span aria-hidden="true">▶️</span> Reanudar</>
              : <><span aria-hidden="true">❄️</span> Congelar</>}
          </button>
        )}

        {activo && !congelado && (
          <button type="button" className={styles.btnCambiarCamara} onClick={cambiarCamara}>
            <span aria-hidden="true">🔄</span> Cambiar cámara
          </button>
        )}
      </div>

      {congelado && (
        <p className={styles.congeladoPista} role="status">
          Imagen fija: ya puedes soltar el móvil. Arrástrala con el dedo —o con las flechas
          del teclado— para recorrerla, y sigue ajustando el zoom, los filtros y el brillo.
        </p>
      )}

      {/* Control de zoom */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle} id="titulo-zoom">
          Zoom: {formatNumber(zoom, zoom % 1 === 0 ? 0 : 1)}x
        </h3>
        <div className={styles.zoomControl}>
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={() => setZoom(Math.max(1, zoom - 0.5))}
            disabled={zoom <= 1}
          >
            −
          </button>
          <input
            id="control-zoom"
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className={styles.zoomSlider}
            aria-labelledby="titulo-zoom"
          />
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={() => setZoom(Math.min(5, zoom + 0.5))}
            disabled={zoom >= 5}
          >
            +
          </button>
        </div>
        <div className={styles.zoomPresets}>
          {[1, 1.5, 2, 3, 4, 5].map(z => (
            <button
              type="button"
              key={z}
              className={`${styles.zoomPresetBtn} ${zoom === z ? styles.zoomPresetActivo : ''}`}
              onClick={() => setZoom(z)}
              aria-pressed={zoom === z}
            >
              {formatNumber(z, z % 1 === 0 ? 0 : 1)}x
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Filtros de accesibilidad</h3>
        <div className={styles.filtrosGrid}>
          {[
            { id: 'ninguno' as FiltroTipo, nombre: 'Normal', icono: '🔍' },
            { id: 'alto-contraste' as FiltroTipo, nombre: 'Alto contraste', icono: '◐' },
            { id: 'invertir' as FiltroTipo, nombre: 'Invertir', icono: '🔄' },
            { id: 'escala-grises' as FiltroTipo, nombre: 'Grises', icono: '⬛' },
            { id: 'sepia' as FiltroTipo, nombre: 'Sepia', icono: '📜' },
          ].map(f => (
            <button
              type="button"
              key={f.id}
              className={`${styles.filtroBtn} ${filtro === f.id ? styles.filtroActivo : ''}`}
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
            >
              <span aria-hidden="true" className={styles.filtroIcono}>{f.icono}</span>
              <span className={styles.filtroNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ajustes de imagen */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Ajustes de imagen</h3>

        <div className={styles.ajuste}>
          <label htmlFor="control-brillo">
            <span aria-hidden="true">☀️</span> Brillo: {formatNumber(brillo, 0)}%
          </label>
          <input
            id="control-brillo"
            type="range"
            min="50"
            max="200"
            value={brillo}
            onChange={(e) => setBrillo(parseInt(e.target.value))}
            className={styles.ajusteSlider}
          />
        </div>

        <div className={styles.ajuste}>
          <label htmlFor="control-contraste">
            <span aria-hidden="true">◐</span> Contraste: {formatNumber(contraste, 0)}%
          </label>
          <input
            id="control-contraste"
            type="range"
            min="50"
            max="200"
            value={contraste}
            onChange={(e) => setContraste(parseInt(e.target.value))}
            className={styles.ajusteSlider}
          />
        </div>

        {activo && (
          <button
            type="button"
            className={`${styles.btnLinterna} ${linterna ? styles.linternaActiva : ''}`}
            onClick={() => toggleLinterna(!linterna)}
            aria-pressed={linterna}
          >
            {linterna ? <><span aria-hidden="true">🔦</span> Linterna ON</> : <><span aria-hidden="true">💡</span> Activar linterna</>}
          </button>
        )}

        {activo && avisoLinterna && (
          <p className={styles.avisoLinterna} role="status" aria-live="polite">
            {avisoLinterna}
          </p>
        )}

        <button
          type="button"
          className={styles.btnReset}
          onClick={() => {
            setBrillo(100);
            setContraste(100);
            setFiltro('ninguno');
          }}
        >
          <span aria-hidden="true">↺</span> Restablecer ajustes
        </button>
      </div>

      {/* Usos */}
      <div className={styles.usosSection}>
        <h3>Usos comunes</h3>
        <div className={styles.usosGrid}>
          <div className={styles.usoItem}>📖 Leer letra pequeña</div>
          <div className={styles.usoItem}>💊 Ver prospectos</div>
          <div className={styles.usoItem}>🏷️ Leer etiquetas</div>
          <div className={styles.usoItem}>🔧 Trabajos de precisión</div>
          <div className={styles.usoItem}>📱 Ver componentes</div>
          <div className={styles.usoItem}>♿ Accesibilidad</div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre la Lupa Digital?"
        subtitle="Niveles de zoom, casos de uso, preguntas frecuentes y consejos prácticos"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section>
          <h2>Niveles de zoom: ¿cuál usar en cada situación?</h2>
          <p>
            La calidad de imagen varía según el zoom aplicado. Elige el nivel adecuado
            para cada tarea para obtener el mejor resultado posible.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Nivel de zoom</th>
                  <th>Campo visual</th>
                  <th>Uso recomendado</th>
                  <th>Detalle visible</th>
                  <th>Limitación principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🔍 1,5x</td>
                  <td>Muy amplio</td>
                  <td>Ver mejor sin perder de vista el conjunto</td>
                  <td>Texto de 8–10 pt</td>
                  <td>Amplía poco: solo ayuda con letra ya casi legible</td>
                </tr>
                <tr>
                  <td>🔍 2x</td>
                  <td>Amplio</td>
                  <td>Leer etiquetas y texto normal</td>
                  <td>Letras de 6–8 pt</td>
                  <td>Poco útil para detalles muy finos</td>
                </tr>
                <tr>
                  <td>🔍 3x</td>
                  <td>Medio</td>
                  <td>Manuales, mapas, prospectos</td>
                  <td>Letras de 4–5 pt, líneas finas</td>
                  <td>El pulso leve ya causa desenfoque</td>
                </tr>
                <tr>
                  <td>🔍 4x–5x <span className={styles.notaMaximo}>(máximo)</span></td>
                  <td>Reducido</td>
                  <td>Ingredientes, números de serie, marcas pequeñas</td>
                  <td>Detalles de 1–2 mm</td>
                  <td>Pixelado del zoom digital: apoya el móvil o congela la imagen</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section>
          <h2>¿Para quién es útil la lupa digital?</h2>
          <p>
            Cualquier persona con un móvil (celular) o un ordenador (computadora) con
            cámara puede beneficiarse, pero estos son los tres perfiles que la usan más
            en el día a día.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
                <h4>Persona mayor con letra pequeña</h4>
              </div>
              <p className={styles.escenarioExample}>
                Necesita leer las instrucciones de un medicamento, la fecha de caducidad
                de un producto o el texto de un contrato impreso en cuerpo 8.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usa el zoom 3x–4x con brillo al 130 % para leer etiquetas
                de supermercado sin esfuerzo visual.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🗺️</span>
                <h4>Leer texto fino en mapas o manuales</h4>
              </div>
              <p className={styles.escenarioExample}>
                Mapas de papel, planos de montaje, instrucciones de electrodomésticos
                o la letra pequeña de un contrato impreso a doble cara.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: activa el filtro de alto contraste para que el texto negro
                sobre fondo claro sea más legible con zoom alto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🖼️</span>
                <h4>Ver detalles en fotos o documentos</h4>
              </div>
              <p className={styles.escenarioExample}>
                Ampliar una fotografía impresa, revisar la firma en un documento, o
                examinar el detalle de una pintura sin necesidad de escáner.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: congela la imagen y ya podrás dejar el teléfono en la mesa,
                arrastrando el detalle que quieras mirar sin tener que sostener nada.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿La lupa digital tiene la misma calidad que una lupa física?</summary>
                <p>
                  No exactamente. Una lupa óptica de calidad ofrece imagen nítida sin
                  degradación. La lupa digital amplía mediante software, por lo que a
                  partir de cierto zoom la imagen puede pixelarse: en esta lupa se nota
                  al acercarse a su máximo de 5x.
                  Para usos cotidianos (leer etiquetas, manuales) la calidad es más que
                  suficiente y tiene la ventaja de añadir filtros de contraste y
                  ajustar el brillo.
                </p>
                <p className={styles.faqTip}>
                  Dato: los smartphones modernos con zoom óptico integrado obtienen
                  resultados significativamente mejores que el zoom digital puro.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puedo dejar la imagen fija para leerla con calma?</summary>
                <p>
                  Sí: el botón «Congelar» detiene la imagen en el fotograma que estés
                  viendo, y a partir de ahí puedes soltar el teléfono. Sobre la imagen
                  quieta siguen funcionando el zoom, los filtros y el brillo, y se
                  recorre arrastrándola con el dedo o con las flechas del teclado.
                </p>
                <p className={styles.faqTip}>
                  Se congela a la resolución de la cámara, no a la de la pantalla: por eso
                  puedes ampliar después de congelar sin perder el detalle que ya estaba
                  captado. Si además quieres guardarla, haz una captura de pantalla.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Funciona sin conexión a internet?</summary>
                <p>
                  Sí. La lupa digital utiliza únicamente la cámara de tu dispositivo y
                  procesa todo localmente en el navegador. No envía imágenes a ningún
                  servidor. Solo necesitas conexión para cargar la página por primera vez.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Consume mucha batería usar la cámara como lupa?</summary>
                <p>
                  El uso continuado de la cámara consume batería de forma moderada,
                  similar a grabar un vídeo. Para sesiones cortas (leer una etiqueta o
                  un documento) el consumo es mínimo. Si vas a usarla durante varios
                  minutos seguidos, conecta el cargador o pulsa «Detener», que apaga la
                  cámara y reduce el consumo.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section>
          <h2>Cómo usar la lupa digital: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Apuntar la cámara al texto u objeto</strong>
                <p>
                  Coloca el móvil (celular) a unos 15–20 cm del objeto. La cámara trasera
                  ofrece mejor resolución. Activa la lupa y enfoca el área que quieres
                  leer o examinar.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Ajustar el zoom hasta ver claramente</strong>
                <p>
                  Usa el deslizador o los botones de preajuste para encontrar el nivel
                  de zoom adecuado. Empieza siempre por el zoom más bajo y sube
                  gradualmente para no perder el contexto.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Congelar la imagen para leer sin pulso</strong>
                <p>
                  Sostener el móvil quieto a 4x o 5x es lo que más cansa. Pulsa
                  «Congelar» y la imagen se queda fija: puedes apoyar el brazo, seguir
                  ampliando y recorrerla arrastrándola. «Reanudar» vuelve al directo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Ajustar el contraste si el texto cuesta de leer</strong>
                <p>
                  Los filtros de alto contraste, invertido y escala de grises cambian
                  mucho la legibilidad según el papel y la luz. Prueba «Invertir» con
                  texto oscuro sobre fondo brillante: suele ser el que más descansa.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Aumentar brillo si la iluminación es baja</strong>
                <p>
                  En entornos con poca luz, sube el brillo al 140–160 % y activa la
                  linterna integrada si tu dispositivo la soporta. El filtro de alto
                  contraste también ayuda a distinguir texto en superficies oscuras.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section>
          <h2>4 consejos para obtener la mejor imagen</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <h4>Buena iluminación mejora mucho la claridad</h4>
              <p>
                La calidad de imagen a zoom alto depende casi por completo de la luz
                disponible. Acércate a una ventana o usa la linterna integrada para
                iluminar el objeto directamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔎</span>
              <h4>Sube el zoom por pasos, no de golpe</h4>
              <p>
                El movimiento involuntario de la mano se amplifica con el zoom, así que
                a 5x cuesta encuadrar. Sube de nivel en nivel y quédate en el menor que
                te deje leer con comodidad: la imagen se mueve mucho menos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Apoya el teléfono para mayor estabilidad</h4>
              <p>
                Apoya el codo en la mesa o coloca el teléfono sobre un libro para
                mantenerlo firme. A partir de 4x, cualquier movimiento reduce
                notablemente la nitidez de la imagen. Si aun así te cuesta, congela
                la imagen: deja de depender del pulso por completo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔦</span>
              <h4>Limpia la lente de la cámara antes de usar</h4>
              <p>
                Una lente sucia con huellas o polvo deteriora la imagen incluso a
                zoom bajo. Limpia suavemente con un paño de microfibra antes de
                usar la lupa para obtener la máxima nitidez.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores habituales al usar la lupa digital</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Usar en entornos muy oscuros sin linterna.</strong> Con poca
                luz el sensor eleva el ISO automáticamente, lo que produce imagen
                granulada e ilegible. Activa la linterna o busca mejor iluminación
                antes de aumentar el zoom.
              </li>
              <li>
                <strong>Aplicar zoom excesivo para la cámara del dispositivo.</strong>{' '}
                Por encima del zoom óptico disponible, la imagen pierde calidad y
                nitidez rápidamente. Busca el nivel donde el texto es legible sin
                forzar más el zoom.
              </li>
              <li>
                <strong>No limpiar la lente antes de usar.</strong> Las huellas
                dactilares crean halos y borrosidad que ningún ajuste de software
                puede corregir. Un paño limpio tarda cinco segundos y marca una
                diferencia notable.
              </li>
              <li>
                <strong>Depender exclusivamente de la lupa para tareas de seguridad.</strong>{' '}
                La lupa digital es una ayuda de accesibilidad, no un instrumento de
                precisión certificado. Para conductores, trabajadores de seguridad
                o tareas críticas, utiliza la óptica adecuada certificada para ese uso.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('lupa-digital')} />
      <ShareCard appName="lupa-digital" />
      <Footer appName="lupa-digital" />
    </div>
  );
}
