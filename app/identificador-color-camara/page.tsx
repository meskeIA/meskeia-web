'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './IdentificadorColor.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// Paleta de colores con nombre en español
// ============================================
interface ColorNombrado { nombre: string; hex: string; }

const PALETA: ColorNombrado[] = [
  { nombre: 'Negro', hex: '#000000' },
  { nombre: 'Gris oscuro', hex: '#404040' },
  { nombre: 'Gris', hex: '#808080' },
  { nombre: 'Gris claro', hex: '#C0C0C0' },
  { nombre: 'Blanco', hex: '#FFFFFF' },
  { nombre: 'Rojo', hex: '#E01B24' },
  { nombre: 'Rojo oscuro', hex: '#8B0000' },
  { nombre: 'Granate', hex: '#800020' },
  { nombre: 'Carmesí', hex: '#DC143C' },
  { nombre: 'Coral', hex: '#FF7F50' },
  { nombre: 'Salmón', hex: '#FA8072' },
  { nombre: 'Rosa', hex: '#FFC0CB' },
  { nombre: 'Rosa fuerte', hex: '#FF69B4' },
  { nombre: 'Fucsia', hex: '#FF00FF' },
  { nombre: 'Magenta', hex: '#C71585' },
  { nombre: 'Naranja', hex: '#FF7F00' },
  { nombre: 'Naranja tostado', hex: '#D2691E' },
  { nombre: 'Melocotón', hex: '#FFDAB9' },
  { nombre: 'Marrón', hex: '#8B4513' },
  { nombre: 'Marrón claro', hex: '#A0522D' },
  { nombre: 'Beige', hex: '#F5DEB3' },
  { nombre: 'Crema', hex: '#FFFDD0' },
  { nombre: 'Dorado', hex: '#FFD700' },
  { nombre: 'Amarillo', hex: '#FFFF00' },
  { nombre: 'Amarillo pálido', hex: '#FFFFE0' },
  { nombre: 'Mostaza', hex: '#E1AD01' },
  { nombre: 'Oliva', hex: '#808000' },
  { nombre: 'Verde lima', hex: '#BFFF00' },
  { nombre: 'Verde claro', hex: '#90EE90' },
  { nombre: 'Verde', hex: '#008000' },
  { nombre: 'Verde oscuro', hex: '#006400' },
  { nombre: 'Verde esmeralda', hex: '#2ECC71' },
  { nombre: 'Verde azulado', hex: '#008080' },
  { nombre: 'Turquesa', hex: '#40E0D0' },
  { nombre: 'Cian', hex: '#00FFFF' },
  { nombre: 'Celeste', hex: '#87CEEB' },
  { nombre: 'Azul claro', hex: '#ADD8E6' },
  { nombre: 'Azul', hex: '#0057E7' },
  { nombre: 'Azul marino', hex: '#000080' },
  { nombre: 'Azul oscuro', hex: '#00008B' },
  { nombre: 'Índigo', hex: '#4B0082' },
  { nombre: 'Violeta', hex: '#8F00FF' },
  { nombre: 'Morado', hex: '#800080' },
  { nombre: 'Lila', hex: '#C8A2C8' },
  { nombre: 'Lavanda', hex: '#E6E6FA' },
];

interface RGB { r: number; g: number; b: number; }

function hexARgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Paleta con RGB precalculado
const PALETA_RGB = PALETA.map(c => ({ ...c, ...hexARgb(c.hex) }));

// Distancia de color "redmean": aproximación perceptual barata pero mucho
// mejor que la distancia euclídea plana en RGB. Devuelve el cuadrado (basta
// para comparar). Referencia: https://www.compuphase.com/cmetric.htm
function distanciaColor(r: number, g: number, b: number, c: RGB): number {
  const rmedia = (r + c.r) / 2;
  const dr = r - c.r;
  const dg = g - c.g;
  const db = b - c.b;
  return (2 + rmedia / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rmedia) / 256) * db * db;
}

function nombreDeColor(r: number, g: number, b: number): string {
  let mejor = PALETA_RGB[0];
  let mejorDist = Infinity;
  for (const c of PALETA_RGB) {
    const d = distanciaColor(r, g, b, c);
    if (d < mejorDist) { mejorDist = d; mejor = c; }
  }
  return mejor.nombre;
}

function rgbAHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbAHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
      case gn: h = ((bn - rn) / d + 2); break;
      default: h = ((rn - gn) / d + 4); break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Texto de contraste (blanco o negro) sobre un fondo dado, por luminancia
function textoSobre(r: number, g: number, b: number): string {
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#1A1A1A' : '#FFFFFF';
}

type Modo = 'camara' | 'imagen';

const MAX_ANCHO_IMAGEN = 900;

export default function IdentificadorColorPage() {
  const [modo, setModo] = useState<Modo>('camara');
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [color, setColor] = useState<RGB | null>(null);
  const [congelado, setCongelado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [historial, setHistorial] = useState<string[]>([]);
  const [hayImagen, setHayImagen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const muestraCanvasRef = useRef<HTMLCanvasElement>(null);
  const imagenCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const congeladoRef = useRef(false);
  const frameRef = useRef(0);

  useEffect(() => { congeladoRef.current = congelado; }, [congelado]);

  const anadirHistorial = useCallback((hex: string) => {
    setHistorial(prev => {
      if (prev[0] === hex) return prev;
      return [hex, ...prev.filter(h => h !== hex)].slice(0, 8);
    });
  }, []);

  // Bucle de muestreo del centro del vídeo
  const muestrearCentro = useCallback(() => {
    rafRef.current = requestAnimationFrame(muestrearCentro);
    if (congeladoRef.current) return;
    // Muestrear ~8 veces por segundo, no en cada frame
    frameRef.current = (frameRef.current + 1) % 7;
    if (frameRef.current !== 0) return;

    const video = videoRef.current;
    const canvas = muestraCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const caja = Math.max(8, Math.floor(Math.min(vw, vh) * 0.06));
    const sx = Math.floor(vw / 2 - caja / 2);
    const sy = Math.floor(vh / 2 - caja / 2);
    canvas.width = caja;
    canvas.height = caja;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, sx, sy, caja, caja, 0, 0, caja, caja);
    const datos = ctx.getImageData(0, 0, caja, caja).data;
    let sr = 0, sg = 0, sb = 0, n = 0;
    for (let i = 0; i < datos.length; i += 4) {
      sr += datos[i]; sg += datos[i + 1]; sb += datos[i + 2]; n++;
    }
    setColor({ r: Math.round(sr / n), g: Math.round(sg / n), b: Math.round(sb / n) });
  }, []);

  const iniciarCamara = useCallback(async () => {
    setErrorCamara(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      // El <video> aún no está montado (aparece al pasar camaraActiva a true).
      // El stream se adjunta en un efecto cuando el elemento ya existe en el DOM.
      setCamaraActiva(true);
      setCongelado(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(muestrearCentro);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setErrorCamara('Permiso de cámara denegado. Actívalo en la configuración del navegador, o usa el modo imagen para analizar una foto.');
      } else if (msg.includes('NotFound')) {
        setErrorCamara('No se encontró ninguna cámara. Puedes usar el modo imagen para analizar una foto.');
      } else {
        setErrorCamara(`No se pudo acceder a la cámara: ${msg}. Prueba con el modo imagen.`);
      }
    }
  }, [muestrearCentro]);

  // Adjuntar el stream al <video> una vez montado. Se ejecuta cuando camaraActiva
  // pasa a true (el elemento ya existe), evitando el ref null al pulsar "Activar".
  useEffect(() => {
    const video = videoRef.current;
    if (camaraActiva && video && streamRef.current) {
      video.srcObject = streamRef.current;
      video.muted = true;
      video.play().catch(() => { /* si el navegador lo bloquea, se reintenta al tocar */ });
    }
  }, [camaraActiva]);

  const detenerCamara = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamaraActiva(false);
    setCongelado(false);
  }, []);

  // Al fijar (congelar) una lectura, se guarda en el historial
  useEffect(() => {
    if (congelado && color) anadirHistorial(rgbAHex(color.r, color.g, color.b));
  }, [congelado, color, anadirHistorial]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Cambiar de modo detiene la cámara
  const cambiarModo = useCallback((nuevo: Modo) => {
    if (nuevo === modo) return;
    if (nuevo === 'imagen') detenerCamara();
    setModo(nuevo);
    setColor(null);
  }, [modo, detenerCamara]);

  // Modo imagen: cargar archivo
  const onArchivo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = imagenCanvasRef.current;
      if (!canvas) { URL.revokeObjectURL(img.src); return; }
      const escala = Math.min(1, MAX_ANCHO_IMAGEN / img.width);
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHayImagen(true);
      setColor(null);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  // Modo imagen: leer píxel al tocar/clicar
  const onSeleccionImagen = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = imagenCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const d = ctx.getImageData(x, y, 1, 1).data;
    const nuevo = { r: d[0], g: d[1], b: d[2] };
    setColor(nuevo);
    anadirHistorial(rgbAHex(nuevo.r, nuevo.g, nuevo.b));
  }, [anadirHistorial]);

  const copiar = useCallback((texto: string) => {
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1400);
    }).catch(() => { /* portapapeles no disponible */ });
  }, []);

  // Datos derivados del color actual
  const hex = color ? rgbAHex(color.r, color.g, color.b) : null;
  const hsl = color ? rgbAHsl(color.r, color.g, color.b) : null;
  const nombre = color ? nombreDeColor(color.r, color.g, color.b) : null;
  const textoContraste = color ? textoSobre(color.r, color.g, color.b) : '#FFFFFF';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎨</span> Identificador de Color</h1>
        <p className={styles.subtitle}>
          Apunta con la cámara o sube una foto y descubre el <strong>nombre del color</strong> y
          sus códigos HEX, RGB y HSL en tiempo real. Pensado para daltonismo, baja visión y diseño.
        </p>
      </header>

      <LegalNotice />

      {/* NAVEGACIÓN DE MODOS */}
      <div className={styles.modosNav} role="tablist" aria-label="Fuente del color">
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'camara' ? styles.modoBtnActivo : ''}`}
          onClick={() => cambiarModo('camara')}
          role="tab"
          aria-selected={modo === 'camara'}
        >
          <span aria-hidden="true">📷</span> Cámara en vivo
        </button>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'imagen' ? styles.modoBtnActivo : ''}`}
          onClick={() => cambiarModo('imagen')}
          role="tab"
          aria-selected={modo === 'imagen'}
        >
          <span aria-hidden="true">🖼️</span> Desde una foto
        </button>
      </div>

      {/* CANVAS OCULTO PARA MUESTREO DE CÁMARA */}
      <canvas ref={muestraCanvasRef} className={styles.canvasOculto} aria-hidden="true" />

      {/* MODO CÁMARA */}
      {modo === 'camara' && (
        <section className={styles.visorSeccion} aria-label="Cámara en vivo">
          {!camaraActiva ? (
            <div className={styles.visorInactivo}>
              <div className={styles.visorIcono} aria-hidden="true">📷</div>
              <p className={styles.visorTexto}>
                Activa la cámara y apunta al objeto cuyo color quieres conocer.
                El vídeo se procesa <strong>solo en tu dispositivo</strong> y nunca se envía a ningún servidor.
              </p>
              {errorCamara && (
                <div className={styles.errorVisor} role="alert">⚠️ {errorCamara}</div>
              )}
              <button type="button" className={styles.btnPrimario} onClick={iniciarCamara} aria-label="Activar cámara">
                <span aria-hidden="true">📷</span> Activar cámara
              </button>
            </div>
          ) : (
            <>
              <div className={styles.visorWrapper}>
                <video ref={videoRef} className={styles.video} autoPlay playsInline muted aria-label="Imagen de la cámara" />
                <div className={styles.mira} aria-hidden="true">
                  <div className={styles.miraCentro} style={{ backgroundColor: hex ?? 'transparent' }} />
                </div>
              </div>
              <div className={styles.visorControles}>
                <button
                  type="button"
                  className={styles.btnControl}
                  onClick={() => setCongelado(c => !c)}
                  aria-pressed={congelado}
                >
                  {congelado
                    ? <><span aria-hidden="true">▶️</span> Reanudar lectura</>
                    : <><span aria-hidden="true">⏸️</span> Congelar lectura</>}
                </button>
                <button type="button" className={styles.btnControlSec} onClick={detenerCamara} aria-label="Apagar cámara">
                  <span aria-hidden="true">⏹️</span> Apagar cámara
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* MODO IMAGEN */}
      {modo === 'imagen' && (
        <section className={styles.visorSeccion} aria-label="Analizar una foto">
          <div className={styles.imagenCarga}>
            <label className={styles.btnPrimario}>
              <span aria-hidden="true">🖼️</span> Elegir una foto
              <input type="file" accept="image/*" onChange={onArchivo} className={styles.inputArchivo} />
            </label>
            <p className={styles.imagenAyuda}>
              {hayImagen
                ? 'Toca cualquier punto de la imagen para leer su color.'
                : 'Sube una foto o una captura de pantalla. Se analiza en tu dispositivo, no se sube a ningún servidor.'}
            </p>
          </div>
          <canvas
            ref={imagenCanvasRef}
            className={`${styles.imagenCanvas} ${hayImagen ? '' : styles.oculto}`}
            onClick={onSeleccionImagen}
            role="button"
            tabIndex={hayImagen ? 0 : -1}
            aria-label="Imagen cargada. Toca un punto para leer su color."
          />
        </section>
      )}

      {/* RESULTADO */}
      {color && hex && hsl && nombre && (
        <section className={styles.resultado} aria-live="polite" aria-label="Color identificado">
          <div className={styles.muestraGrande} style={{ backgroundColor: hex, color: textoContraste }}>
            <span className={styles.muestraNombre}>{nombre}</span>
            <span className={styles.muestraHex}>{hex}</span>
          </div>
          <div className={styles.codigos}>
            <button type="button" className={styles.codigoFila} onClick={() => copiar(hex)} aria-label={`Copiar código HEX ${hex}`}>
              <span className={styles.codigoEtiqueta}>HEX</span>
              <span className={styles.codigoValor}>{hex}</span>
              <span className={styles.codigoCopiar} aria-hidden="true">📋</span>
            </button>
            <button type="button" className={styles.codigoFila} onClick={() => copiar(`rgb(${color.r}, ${color.g}, ${color.b})`)} aria-label={`Copiar código RGB ${color.r}, ${color.g}, ${color.b}`}>
              <span className={styles.codigoEtiqueta}>RGB</span>
              <span className={styles.codigoValor}>{color.r}, {color.g}, {color.b}</span>
              <span className={styles.codigoCopiar} aria-hidden="true">📋</span>
            </button>
            <button type="button" className={styles.codigoFila} onClick={() => copiar(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} aria-label={`Copiar código HSL ${hsl.h}, ${hsl.s}%, ${hsl.l}%`}>
              <span className={styles.codigoEtiqueta}>HSL</span>
              <span className={styles.codigoValor}>{hsl.h}°, {hsl.s}%, {hsl.l}%</span>
              <span className={styles.codigoCopiar} aria-hidden="true">📋</span>
            </button>
          </div>
          <div className={styles.copiadoAviso} role="status" aria-live="polite">
            {copiado ? '✓ Copiado al portapapeles' : ' '}
          </div>
        </section>
      )}

      {/* HISTORIAL */}
      {historial.length > 0 && (
        <section className={styles.historialSeccion} aria-label="Colores recientes">
          <h2 className={styles.historialTitulo}>Colores recientes</h2>
          <div className={styles.historialLista}>
            {historial.map(h => (
              <button
                key={h}
                type="button"
                className={styles.historialSwatch}
                style={{ backgroundColor: h, color: (() => { const c = hexARgb(h); return textoSobre(c.r, c.g, c.b); })() }}
                onClick={() => copiar(h)}
                aria-label={`Copiar ${nombreDeColor(hexARgb(h).r, hexARgb(h).g, hexARgb(h).b)}, ${h}`}
                title={`${nombreDeColor(hexARgb(h).r, hexARgb(h).g, hexARgb(h).b)} · ${h}`}
              >
                {h}
              </button>
            ))}
          </div>
        </section>
      )}

      <EducationalSection
        title="Cómo funciona la identificación de color y cómo sacarle partido"
        subtitle="Del píxel al nombre: qué mide, para quién es útil y sus límites"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Cómo pasa la app de una imagen a un nombre de color?</h2>
          <p>
            En el modo cámara, la herramienta toma la pequeña región del centro del encuadre (la que
            marca la mira), promedia todos sus píxeles y obtiene un valor <strong>RGB</strong> medio.
            Ese promedio es importante: un objeto real nunca es de un color perfectamente uniforme, y
            promediar una zona da un resultado mucho más estable que leer un único píxel.
          </p>
          <p>
            Con ese RGB medio, la app busca en una paleta de colores con nombre en español cuál es el
            más parecido. La comparación no usa una simple resta de valores RGB, sino una fórmula de
            <strong> distancia perceptual (redmean)</strong> que pesa más el verde y ajusta el rojo y
            el azul según el tono, acercándose a cómo el ojo humano percibe las diferencias. Por eso el
            nombre resultante suele coincidir con el que diría una persona.
          </p>

          <h2>HEX, RGB y HSL: qué es cada código</h2>
          <ul>
            <li><strong>HEX</strong> (p. ej. <code>#2E86AB</code>): la notación más usada en diseño web y CSS. Son tres pares hexadecimales para rojo, verde y azul.</li>
            <li><strong>RGB</strong> (p. ej. <code>46, 134, 171</code>): los mismos tres canales en base decimal, de 0 a 255. Es el formato que entienden cámaras y pantallas.</li>
            <li><strong>HSL</strong> (tono, saturación, luminosidad): más intuitivo para personas, porque separa &quot;qué color es&quot; (tono) de &quot;cuán intenso&quot; y &quot;cuán claro&quot;. Útil para crear variaciones de un mismo color.</li>
          </ul>
        </section>

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Formas de identificar un color y cuándo usar cada una</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Necesita</th>
                  <th>Da el nombre</th>
                  <th>Da el código</th>
                  <th>Mejor para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.celdaDestacada}>Cámara en vivo (esta app)</td>
                  <td>Móvil con cámara</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td>Objetos físicos: ropa, pintura, materiales</td>
                </tr>
                <tr>
                  <td>Modo foto / cuentagotas (esta app)</td>
                  <td>Una imagen</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Capturas, webs, logotipos, fotos</td>
                </tr>
                <tr>
                  <td>Cuentagotas del navegador o editor</td>
                  <td>Software de diseño</td>
                  <td>No</td>
                  <td>Sí</td>
                  <td>Copiar un HEX exacto en la pantalla</td>
                </tr>
                <tr>
                  <td>Preguntar a otra persona</td>
                  <td>Alguien cerca</td>
                  <td>Sí (subjetivo)</td>
                  <td>No</td>
                  <td>Consulta rápida, sin precisión</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>¿Para quién es útil?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">👁️</span>
              <h3>Personas con daltonismo</h3>
              <p>Poner nombre objetivo a un color ayuda a decidir qué ropa combina, leer indicadores de colores o distinguir cables y piezas. El código exacto elimina cualquier duda sobre el tono.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🔎</span>
              <h3>Baja visión</h3>
              <p>El nombre se muestra en letra grande y con alto contraste sobre el propio color, más fácil de leer que un catálogo o una etiqueta pequeña.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🎨</span>
              <h3>Diseño y decoración</h3>
              <p>Capturar el HEX de una pared, un mueble o una imagen de referencia para reproducir el tono en una paleta, una web o una compra de pintura.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🧵</span>
              <h3>Manualidades y aula</h3>
              <p>Aprender los nombres de los colores, clasificar materiales por tono o preparar actividades educativas sobre color con una herramienta objetiva.</p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo obtener la lectura más fiable</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Ilumina bien el objeto</strong>
                <p>La luz natural difusa es la más neutra. Evita sombras fuertes y reflejos directos, que falsean el color que capta la cámara.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Acerca la cámara</strong>
                <p>Sitúa el objeto a unos 10-20 cm y llena la mira central con el color, sin que salgan sombras o bordes de otro tono dentro de la zona de medición.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Espera a que se estabilice</strong>
                <p>La cámara ajusta el balance de blancos durante uno o dos segundos. Deja que la lectura deje de cambiar antes de darla por buena.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Congela la lectura</strong>
                <p>Pulsa &quot;Congelar lectura&quot; para fijar el valor. Así puedes leer el nombre y el código con calma sin que el temblor de la mano lo altere.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Copia el código si lo necesitas</strong>
                <p>Toca HEX, RGB o HSL para copiarlo al portapapeles y pegarlo en tu editor, tu paleta o una nota.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Consejos y límites a tener en cuenta</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">💡</span>
              <p><strong>La luz manda.</strong> El mismo objeto se ve más cálido con luz de bombilla y más frío con luz de día. Para comparar colores, hazlo siempre con la misma iluminación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">📱</span>
              <p><strong>Cada cámara interpreta distinto.</strong> Dos móviles pueden dar códigos ligeramente diferentes del mismo objeto. Úsalo como guía fiable, no como medición de laboratorio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🏷️</span>
              <p><strong>El nombre es el más cercano.</strong> Un tono intermedio entre dos colores se etiquetará con el más próximo de la paleta. El código HEX es siempre el dato exacto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🖼️</span>
              <p><strong>El modo foto lee un solo píxel.</strong> Si la imagen tiene ruido o compresión, toca varias veces la misma zona para confirmar el color dominante.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Necesito instalar algo?</dt>
              <dd>No. Funciona directamente en el navegador del móvil o del ordenador. Solo tienes que dar permiso de cámara la primera vez (o subir una foto en el modo imagen).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puede sustituir a una prueba de daltonismo?</dt>
              <dd>No. Es una herramienta de apoyo cotidiano para identificar colores, no un test diagnóstico. El tipo y grado de daltonismo lo determina un profesional de la visión con pruebas específicas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué la cámara trasera y no la frontal?</dt>
              <dd>La herramienta abre por defecto la cámara trasera porque suele tener mejor sensor y es la que apunta al objeto que quieres medir mientras miras la pantalla.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Funciona sin conexión?</dt>
              <dd>Una vez cargada la página, la identificación de color funciona en local sin enviar nada a internet. La cámara y las imágenes se procesan íntegramente en tu dispositivo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué colores reconoce?</dt>
              <dd>Reconoce una paleta amplia de nombres comunes en español (rojos, verdes, azules, naranjas, marrones, grises, rosas, morados y sus variantes). Para tonos muy específicos, el código HEX te da la referencia exacta aunque el nombre sea aproximado.</dd>
            </div>
          </dl>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('identificador-color-camara')} />
      <ShareCard appName="identificador-color-camara" />
      <Footer appName="identificador-color-camara" />
    </div>
  );
}
