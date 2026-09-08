'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styles from './TransportadorAngulos.module.css';
import impresion from '@/styles/impresion.module.css';
import {
  MeskeiaLogo,
  Footer,
  RelatedApps,
  LegalNotice,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib/formatters';
import {
  anguloEntre,
  anguloReflejo,
  complementario,
  suplementario,
  clasificarAngulo,
  aGradosMinutosSegundos,
  NOMBRE_TIPO,
  type Punto,
} from '@/lib/calculadoras/angulos';

// -------------------------------------------------------------------------------------------------
// Geometría de la medida
//
// Los tres puntos se guardan en FRACCIÓN del contenedor (0..1) para que sobrevivan
// a un cambio de tamaño de la ventana, pero el ángulo NO se calcula sobre esas
// fracciones: se convierte antes a píxeles reales. Medir sobre fracciones daría
// el ángulo de una imagen estirada, y en un contenedor de 800×400 un ángulo recto
// saldría como 63°.
// -------------------------------------------------------------------------------------------------

/** Posición de los tres puntos, en fracción del ancho y del alto del contenedor. */
interface Marcadores {
  vertice: Punto;
  brazoA: Punto;
  brazoB: Punto;
}

type NombreMarcador = keyof Marcadores;

/** Colocación inicial: un ángulo cómodo de agarrar, no pegado a los bordes. */
const MARCADORES_INICIALES: Marcadores = {
  vertice: { x: 0.5, y: 0.68 },
  brazoA: { x: 0.82, y: 0.68 },
  brazoB: { x: 0.5, y: 0.2 },
};

const ETIQUETA_MARCADOR: Readonly<Record<NombreMarcador, string>> = {
  vertice: 'Vértice',
  brazoA: 'Primer brazo',
  brazoB: 'Segundo brazo',
};

/** Cuánto mueve una flecha del teclado, en fracción del contenedor. */
const PASO_TECLADO = 0.005;
const PASO_TECLADO_FINO = 0.001;

/** Tamaño del contenedor en píxeles: sin él no hay conversión posible. */
interface Medidas {
  ancho: number;
  alto: number;
}

/** Deja un valor dentro de [0, 1]: los puntos no pueden salirse de la imagen. */
function acotar(valor: number): number {
  return Math.min(1, Math.max(0, valor));
}

// -------------------------------------------------------------------------------------------------
// Transportador imprimible a escala real
//
// Mismo principio que la hoja del conversor de Braille: el SVG se dibuja con
// unidades en MILÍMETROS, nunca en px, porque una plantilla que se imprime a
// otro tamaño no sirve para nada. Y como el navegador escala al imprimir mucho
// más a menudo de lo que la gente supone, la hoja lleva su propia barra de
// calibración de 100 mm para comprobarlo antes de usarla.
// -------------------------------------------------------------------------------------------------

/** Radio del semicírculo graduado, en mm. El de un transportador escolar. */
const RADIO_MM = 60;
/** Centro del transportador dentro del lienzo, en mm. */
const CENTRO_MM = { x: 64, y: 64 };
const LIENZO_MM = { ancho: 128, alto: 72 };

interface MarcaGrado {
  grado: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Las de 10 en 10 llevan número y trazo más largo */
  principal: boolean;
  media: boolean;
}

/**
 * Las marcas del limbo, calculadas una sola vez.
 *
 * El 0 está a la DERECHA y crece en sentido antihorario, como en un
 * transportador de verdad; los números se pintan por duplicado (escala interior
 * y exterior) porque así se lee tanto si el ángulo abre a un lado como al otro,
 * que es justo la ayuda que se le pide al instrumento.
 */
/**
 * Redondeo a micras antes de escribir una coordenada en el SVG.
 *
 * NO es cosmética: `Math.sin` y `Math.cos` no están obligadas a devolver el
 * mismo bit en dos implementaciones, y no lo hacen — el servidor escribía
 * y2="45.60539927317063" donde el navegador ponía 45.605399273170626, y React
 * lo cantaba como error de hidratación en cada carga. A la milésima de
 * milímetro las dos coinciden, y ninguna impresora distingue una micra.
 */
function mm(valor: number): number {
  return Math.round(valor * 1000) / 1000;
}

function construirMarcas(): MarcaGrado[] {
  const marcas: MarcaGrado[] = [];
  for (let grado = 0; grado <= 180; grado++) {
    const principal = grado % 10 === 0;
    const media = !principal && grado % 5 === 0;
    const largo = principal ? 9 : media ? 6 : 3.5;
    const radianes = (grado * Math.PI) / 180;
    const cos = Math.cos(radianes);
    const sen = Math.sin(radianes);
    marcas.push({
      grado,
      x1: mm(CENTRO_MM.x + RADIO_MM * cos),
      y1: mm(CENTRO_MM.y - RADIO_MM * sen),
      x2: mm(CENTRO_MM.x + (RADIO_MM - largo) * cos),
      y2: mm(CENTRO_MM.y - (RADIO_MM - largo) * sen),
      principal,
      media,
    });
  }
  return marcas;
}

const MARCAS = construirMarcas();

export default function TransportadorAngulosPage() {
  const [marcadores, setMarcadores] = useState<Marcadores>(MARCADORES_INICIALES);
  const [medidas, setMedidas] = useState<Medidas>({ ancho: 0, alto: 0 });
  const [imagen, setImagen] = useState<string | null>(null);
  const [nombreImagen, setNombreImagen] = useState<string>('');
  const [errorImagen, setErrorImagen] = useState<string>('');
  const [proporcion, setProporcion] = useState<number>(4 / 3);
  const [arrastrando, setArrastrando] = useState<NombreMarcador | null>(null);

  const lienzoRef = useRef<HTMLDivElement>(null);
  const entradaArchivoRef = useRef<HTMLInputElement>(null);

  // El tamaño real del contenedor se vigila con ResizeObserver: entra en el
  // cálculo del ángulo, así que quedarse con una medida vieja tras rotar el
  // móvil daría un ángulo equivocado sin avisar de nada.
  useEffect(() => {
    const nodo = lienzoRef.current;
    if (!nodo) return;

    const medir = () => {
      const caja = nodo.getBoundingClientRect();
      setMedidas({ ancho: caja.width, alto: caja.height });
    };
    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  // La URL del objeto se revoca al cambiar de imagen o al salir: sin esto, cada
  // imagen cargada se queda retenida en memoria hasta recargar la página.
  useEffect(() => {
    return () => {
      if (imagen) URL.revokeObjectURL(imagen);
    };
  }, [imagen]);

  /** Los tres puntos en píxeles reales, que es donde el ángulo significa algo. */
  const enPixeles = useMemo(() => {
    const aPixel = (p: Punto): Punto => ({ x: p.x * medidas.ancho, y: p.y * medidas.alto });
    return {
      vertice: aPixel(marcadores.vertice),
      brazoA: aPixel(marcadores.brazoA),
      brazoB: aPixel(marcadores.brazoB),
    };
  }, [marcadores, medidas]);

  const grados = useMemo(() => {
    if (medidas.ancho === 0 || medidas.alto === 0) return null;
    return anguloEntre(enPixeles.vertice, enPixeles.brazoA, enPixeles.brazoB);
  }, [enPixeles, medidas]);

  const gms = useMemo(() => (grados === null ? null : aGradosMinutosSegundos(grados)), [grados]);
  const tipo = useMemo(() => (grados === null ? null : clasificarAngulo(grados)), [grados]);

  /**
   * Traduce un evento de puntero a fracción del contenedor.
   *
   * Se acota a [0, 1] a propósito: arrastrar fuera del lienzo deja el punto
   * pegado al borde en vez de perderlo, que es lo que pasaba al soltar el dedo
   * fuera de la imagen en el móvil.
   */
  const posicionDesdeEvento = useCallback((evento: { clientX: number; clientY: number }): Punto | null => {
    const nodo = lienzoRef.current;
    if (!nodo) return null;
    const caja = nodo.getBoundingClientRect();
    if (caja.width === 0 || caja.height === 0) return null;
    return {
      x: acotar((evento.clientX - caja.left) / caja.width),
      y: acotar((evento.clientY - caja.top) / caja.height),
    };
  }, []);

  const iniciarArrastre = (marcador: NombreMarcador) => (evento: React.PointerEvent) => {
    evento.preventDefault();
    (evento.target as Element).setPointerCapture?.(evento.pointerId);
    setArrastrando(marcador);
  };

  const moverPuntero = (evento: React.PointerEvent) => {
    if (!arrastrando) return;
    const posicion = posicionDesdeEvento(evento);
    if (!posicion) return;
    setMarcadores((previos) => ({ ...previos, [arrastrando]: posicion }));
  };

  const soltarPuntero = () => setArrastrando(null);

  /**
   * Teclado: las flechas mueven el punto enfocado.
   *
   * No es un extra de accesibilidad, es la única forma de afinar: arrastrando
   * con el dedo, el propio dedo tapa el punto que se quiere colocar, y el último
   * medio grado se ajusta mucho mejor a golpe de flecha. Shift mueve más fino.
   */
  const moverConTeclado = (marcador: NombreMarcador) => (evento: React.KeyboardEvent) => {
    const paso = evento.shiftKey ? PASO_TECLADO_FINO : PASO_TECLADO;
    const desplazamientos: Record<string, Punto> = {
      ArrowLeft: { x: -paso, y: 0 },
      ArrowRight: { x: paso, y: 0 },
      ArrowUp: { x: 0, y: -paso },
      ArrowDown: { x: 0, y: paso },
    };
    const delta = desplazamientos[evento.key];
    if (!delta) return;
    evento.preventDefault();
    setMarcadores((previos) => ({
      ...previos,
      [marcador]: {
        x: acotar(previos[marcador].x + delta.x),
        y: acotar(previos[marcador].y + delta.y),
      },
    }));
  };

  const cargarImagen = (archivo: File | null | undefined) => {
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      setErrorImagen('Ese archivo no es una imagen. Formatos válidos: PNG, JPG, WEBP, GIF o SVG.');
      return;
    }
    const url = URL.createObjectURL(archivo);
    // La proporción se lee de la imagen para que el lienzo la calque: si el
    // contenedor tuviera otra forma, la imagen se vería con bandas y los puntos
    // no caerían donde el usuario cree.
    const medidor = new window.Image();
    medidor.onload = () => {
      if (medidor.naturalWidth > 0 && medidor.naturalHeight > 0) {
        setProporcion(medidor.naturalWidth / medidor.naturalHeight);
      }
      setImagen(url);
      setNombreImagen(archivo.name);
      setErrorImagen('');
    };
    medidor.onerror = () => {
      URL.revokeObjectURL(url);
      setErrorImagen('No se ha podido leer esa imagen. Prueba con otro archivo.');
    };
    medidor.src = url;
  };

  const quitarImagen = () => {
    setImagen(null);
    setNombreImagen('');
    setProporcion(4 / 3);
    setErrorImagen('');
    if (entradaArchivoRef.current) entradaArchivoRef.current.value = '';
  };

  const reiniciarPuntos = () => setMarcadores(MARCADORES_INICIALES);

  // Pegar con Ctrl+V: es como llega la mayoría de las capturas de pantalla, y
  // obligar a guardarlas antes en un archivo sería un paso de más.
  useEffect(() => {
    const alPegar = (evento: ClipboardEvent) => {
      const archivo = Array.from(evento.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith('image/'))
        ?.getAsFile();
      if (archivo) cargarImagen(archivo);
    };
    window.addEventListener('paste', alPegar);
    return () => window.removeEventListener('paste', alPegar);
  }, []);

  const relatedApps = getRelatedApps('transportador-angulos');

  /** El texto de la medida, ya formateado, o el aviso de que no hay ángulo. */
  const medidaTexto = grados === null ? null : formatNumber(grados, 1);

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1>
            <span aria-hidden="true">📐</span> Transportador de Ángulos
          </h1>
          <p className={styles.heroSubtitulo}>
            Mide un ángulo sobre tu propia imagen colocando tres puntos, y llévate un
            transportador impreso a tamaño real para lo que haya que medir en papel.
          </p>
        </header>

        <LegalNotice />

        {/* ── El límite de validez va ARRIBA y visible, no escondido en el bloque
            educativo: determina si la medida sirve o no sirve, y quien no lo lea
            se llevará un número exacto de un ángulo equivocado. ───────────── */}
        <section className={styles.avisoValidez} role="note">
          <h2 className={styles.avisoTitulo}>
            <span aria-hidden="true">⚠️</span> Sobre qué imágenes vale esta medida
          </h2>
          <p>
            La medida es <strong>exacta sobre imágenes planas</strong>: capturas de pantalla,
            planos, PDF, esquemas, dibujos y fotos tomadas de frente.
          </p>
          <p>
            <strong>No vale sobre una foto en perspectiva.</strong> Si la cámara no estaba
            paralela al plano del ángulo, la proyección lo deforma: la esquina de una mesa
            rectangular mide 90°, pero fotografiada de lado puede salir 70° o 110°. La
            herramienta mide con precisión lo que hay en la imagen, y en una foto oblicua lo
            que hay en la imagen ya no es el ángulo real.
          </p>
        </section>

        {/* ── Herramienta ───────────────────────────────────────────────────── */}
        <section className={styles.herramienta} aria-labelledby="titulo-medidor">
          <h2 id="titulo-medidor" className={styles.seccionTitulo}>
            <span aria-hidden="true">🎯</span> Medir sobre una imagen
          </h2>

          <div className={styles.controlesImagen}>
            <label className={styles.botonArchivo} htmlFor="archivo-imagen">
              <span aria-hidden="true">🖼️</span> Cargar una imagen
            </label>
            <input
              ref={entradaArchivoRef}
              id="archivo-imagen"
              className={styles.entradaArchivo}
              type="file"
              accept="image/*"
              onChange={(e) => cargarImagen(e.target.files?.[0])}
            />
            {imagen && (
              <button type="button" className={styles.btnSecundario} onClick={quitarImagen}>
                Quitar la imagen
              </button>
            )}
            <button type="button" className={styles.btnSecundario} onClick={reiniciarPuntos}>
              Recolocar los puntos
            </button>
            <span className={styles.pistaPegar}>
              También puedes pegar una captura con <kbd>Ctrl</kbd> + <kbd>V</kbd>
            </span>
          </div>

          {nombreImagen && (
            <p className={styles.nombreImagen}>
              Midiendo sobre <strong>{nombreImagen}</strong>. La imagen no sale de tu navegador.
            </p>
          )}

          {errorImagen && (
            <p className={styles.errorImagen} role="alert">
              {errorImagen}
            </p>
          )}

          <div
            ref={lienzoRef}
            className={styles.lienzo}
            style={{ aspectRatio: String(proporcion) }}
            onPointerMove={moverPuntero}
            onPointerUp={soltarPuntero}
            onPointerCancel={soltarPuntero}
          >
            {imagen ? (
              // Imagen local del usuario en un blob: URL. `next/image` no aporta
              // nada aquí (no hay que optimizar un archivo que ya está en el
              // navegador) y exigiría dimensiones que no se conocen de antemano.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagen} alt="" className={styles.imagenFondo} />
            ) : (
              <div className={styles.rejilla} aria-hidden="true" />
            )}

            <svg
              className={styles.capa}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-label={
                medidaTexto
                  ? `Ángulo de ${medidaTexto} grados marcado sobre la imagen`
                  : 'Tres puntos para marcar un ángulo sobre la imagen'
              }
            >
              {/* Los brazos y el arco se dibujan en el sistema estirado del
                  viewBox (preserveAspectRatio="none"): visualmente caen donde
                  deben, y el ÁNGULO no se lee de aquí sino de los píxeles. */}
              <line
                className={styles.brazo}
                x1={marcadores.vertice.x * 100}
                y1={marcadores.vertice.y * 100}
                x2={marcadores.brazoA.x * 100}
                y2={marcadores.brazoA.y * 100}
                vectorEffect="non-scaling-stroke"
              />
              <line
                className={styles.brazo}
                x1={marcadores.vertice.x * 100}
                y1={marcadores.vertice.y * 100}
                x2={marcadores.brazoB.x * 100}
                y2={marcadores.brazoB.y * 100}
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Los puntos van en HTML y no en el SVG: así conservan su forma
                redonda pese al viewBox estirado, y son focusables sin trucos. */}
            {(Object.keys(ETIQUETA_MARCADOR) as NombreMarcador[]).map((nombre) => (
              <button
                key={nombre}
                type="button"
                className={`${styles.punto} ${nombre === 'vertice' ? styles.puntoVertice : ''} ${
                  arrastrando === nombre ? styles.puntoActivo : ''
                }`}
                style={{
                  left: `${marcadores[nombre].x * 100}%`,
                  top: `${marcadores[nombre].y * 100}%`,
                }}
                onPointerDown={iniciarArrastre(nombre)}
                onKeyDown={moverConTeclado(nombre)}
                aria-label={`${ETIQUETA_MARCADOR[nombre]}. Arrástralo o muévelo con las flechas del teclado; con Mayúsculas, más despacio.`}
              >
                <span aria-hidden="true">{nombre === 'vertice' ? 'V' : nombre === 'brazoA' ? 'A' : 'B'}</span>
              </button>
            ))}
          </div>

          <p className={styles.instrucciones}>
            Coloca <strong>V</strong> en el vértice del ángulo y los puntos <strong>A</strong> y{' '}
            <strong>B</strong> sobre cada uno de sus lados. Cuanto más lejos del vértice los
            pongas, más precisa será la medida.
          </p>

          {/* ── Resultado ─────────────────────────────────────────────────── */}
          <div className={styles.resultado} role="status" aria-live="polite">
            {grados === null || medidaTexto === null || gms === null || tipo === null ? (
              <p className={styles.resultadoVacio}>
                Separa los puntos para medir: un brazo de longitud cero no define ningún ángulo.
              </p>
            ) : (
              <>
                <div className={styles.medidaPrincipal}>
                  <span className={styles.medidaValor}>{medidaTexto}°</span>
                  <span className={styles.medidaTipo}>{NOMBRE_TIPO[tipo]}</span>
                </div>

                <dl className={styles.derivados}>
                  <div className={styles.derivado}>
                    <dt>Grados, minutos y segundos</dt>
                    <dd>
                      {gms.grados}° {gms.minutos}&prime; {gms.segundos}&Prime;
                    </dd>
                  </div>
                  <div className={styles.derivado}>
                    <dt>Ángulo reflejo</dt>
                    <dd>{formatNumber(anguloReflejo(grados), 1)}°</dd>
                  </div>
                  <div className={styles.derivado}>
                    <dt>Complementario</dt>
                    <dd>
                      {complementario(grados) === null
                        ? '— (pasa de 90°)'
                        : `${formatNumber(complementario(grados) as number, 1)}°`}
                    </dd>
                  </div>
                  <div className={styles.derivado}>
                    <dt>Suplementario</dt>
                    <dd>
                      {suplementario(grados) === null
                        ? '— (pasa de 180°)'
                        : `${formatNumber(suplementario(grados) as number, 1)}°`}
                    </dd>
                  </div>
                </dl>
              </>
            )}
          </div>
        </section>

        <DisclaimerCard
          variant="educational"
          severity="low"
          collapsible={true}
          context="transportador-angulos"
        />
      </div>

      {/* ── Hoja imprimible a escala real ─────────────────────────────────── */}
      <section className={styles.hojaSection} aria-labelledby="titulo-hoja">
        <div className={impresion.noImprimir}>
          <h2 id="titulo-hoja" className={styles.seccionTitulo}>
            <span aria-hidden="true">🖨️</span> Transportador imprimible a escala real
          </h2>
          <p className={styles.hojaIntro}>
            Un transportador de 180° dibujado en milímetros, para medir sobre papel: un ejercicio
            de geometría, un patrón de costura, un corte en madera. Recórtalo por el semicírculo y
            marca el centro con un punzón o la punta del compás.
          </p>
          <div className={styles.hojaControles}>
            <button type="button" className={styles.btnPrimario} onClick={() => window.print()}>
              <span aria-hidden="true">🖨️</span> Imprimir el transportador
            </button>
            <p className={styles.hojaAviso}>
              <strong>Comprueba la escala antes de recortarlo.</strong> Los navegadores imprimen a
              menudo al 90 % sin decirlo. En el cuadro de impresión, elige escala{' '}
              <strong>100 %</strong> y desmarca «ajustar a la página»; después mide la barra de
              calibración con una regla: debe dar exactamente 100 mm.
            </p>
          </div>
        </div>

        {/* Única parte que sale por la impresora */}
        <div className={`${styles.hojaPapel} ${impresion.hoja} ${impresion.bloque}`}>
          <h3 className={styles.hojaPapelTitulo}>Transportador de 180° · escala real</h3>

          <svg
            className={styles.hojaSvg}
            width={`${LIENZO_MM.ancho}mm`}
            height={`${LIENZO_MM.alto}mm`}
            viewBox={`0 0 ${LIENZO_MM.ancho} ${LIENZO_MM.alto}`}
            role="img"
            aria-label="Transportador de 180 grados dibujado a tamaño real, graduado de grado en grado"
          >
            {/* Contorno del semicírculo */}
            <path
              d={`M ${CENTRO_MM.x - RADIO_MM} ${CENTRO_MM.y} A ${RADIO_MM} ${RADIO_MM} 0 0 1 ${
                CENTRO_MM.x + RADIO_MM
              } ${CENTRO_MM.y} Z`}
              fill="none"
              stroke="#000000"
              strokeWidth={0.35}
            />

            {MARCAS.map((marca) => (
              <line
                key={marca.grado}
                x1={marca.x1}
                y1={marca.y1}
                x2={marca.x2}
                y2={marca.y2}
                stroke="#000000"
                strokeWidth={marca.principal ? 0.4 : marca.media ? 0.3 : 0.18}
              />
            ))}

            {/* Doble numeración, como en un transportador de verdad: la escala
                exterior lee el ángulo que abre a la izquierda y la interior el
                que abre a la derecha. */}
            {MARCAS.filter((m) => m.principal).map((marca) => {
              const radianes = (marca.grado * Math.PI) / 180;
              const rExterior = RADIO_MM - 13;
              const rInterior = RADIO_MM - 20;
              return (
                <g key={`n-${marca.grado}`}>
                  <text
                    x={mm(CENTRO_MM.x + rExterior * Math.cos(radianes))}
                    y={mm(CENTRO_MM.y - rExterior * Math.sin(radianes) + 1.2)}
                    textAnchor="middle"
                    fontSize={3.2}
                    fill="#000000"
                  >
                    {marca.grado}
                  </text>
                  <text
                    x={mm(CENTRO_MM.x + rInterior * Math.cos(radianes))}
                    y={mm(CENTRO_MM.y - rInterior * Math.sin(radianes) + 1.2)}
                    textAnchor="middle"
                    fontSize={2.6}
                    fill="#000000"
                  >
                    {180 - marca.grado}
                  </text>
                </g>
              );
            })}

            {/* Línea de fe y centro: sin ellos el instrumento no se puede alinear */}
            <line
              x1={CENTRO_MM.x - RADIO_MM}
              y1={CENTRO_MM.y}
              x2={CENTRO_MM.x + RADIO_MM}
              y2={CENTRO_MM.y}
              stroke="#000000"
              strokeWidth={0.35}
            />
            <line
              x1={CENTRO_MM.x}
              y1={CENTRO_MM.y}
              x2={CENTRO_MM.x}
              y2={CENTRO_MM.y - RADIO_MM + 12}
              stroke="#000000"
              strokeWidth={0.25}
              strokeDasharray="2 1.5"
            />
            <circle cx={CENTRO_MM.x} cy={CENTRO_MM.y} r={0.7} fill="#000000" />
            <circle
              cx={CENTRO_MM.x}
              cy={CENTRO_MM.y}
              r={3}
              fill="none"
              stroke="#000000"
              strokeWidth={0.25}
            />
          </svg>

          {/* Barra de calibración: la prueba de que la hoja salió a escala */}
          <div className={styles.hojaRegla}>
            <svg
              width="100mm"
              height="9mm"
              viewBox="0 0 100 9"
              role="img"
              aria-label="Barra de calibración que debe medir exactamente 100 milímetros"
            >
              <line x1={0} y1={5} x2={100} y2={5} stroke="#000000" strokeWidth={0.35} />
              {Array.from({ length: 11 }, (_, i) => i * 10).map((mm) => (
                <g key={mm}>
                  <line x1={mm} y1={2} x2={mm} y2={8} stroke="#000000" strokeWidth={0.35} />
                  <text x={mm} y={1.6} textAnchor="middle" fontSize={2.4} fill="#000000">
                    {mm}
                  </text>
                </g>
              ))}
            </svg>
            <p className={styles.hojaReglaTexto}>
              Esta barra debe medir exactamente 100 mm. Si no, vuelve a imprimir al 100 % de
              escala.
            </p>
          </div>
        </div>
      </section>

      <div className={impresion.noImprimir}>
        <EducationalSection
          title="Todo sobre la medida de ángulos"
          subtitle="Tipos de ángulo, cómo medir con precisión sobre una imagen y qué mira un transportador impreso"
          icon="📐"
        >
          {/* ── 1. Tabla comparativa ─────────────────────────────────────── */}
          <h3 className={styles.eduSubtitulo}>Los tipos de ángulo y dónde aparecen</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <caption className={styles.tablaCaption}>
                Clasificación por amplitud, con ejemplos reales de cada uno
              </caption>
              <thead>
                <tr>
                  <th scope="col">Tipo</th>
                  <th scope="col">Amplitud</th>
                  <th scope="col">Dónde se encuentra</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Nulo</th>
                  <td>0°</td>
                  <td>Las dos agujas del reloj superpuestas a las 12:00</td>
                </tr>
                <tr>
                  <th scope="row">Agudo</th>
                  <td>Entre 0° y 90°</td>
                  <td>La punta de un lápiz afilado, el tejado a dos aguas, una porción de tarta</td>
                </tr>
                <tr>
                  <th scope="row">Recto</th>
                  <td>Exactamente 90°</td>
                  <td>La esquina de una hoja, el encuentro de dos paredes, una escuadra</td>
                </tr>
                <tr>
                  <th scope="row">Obtuso</th>
                  <td>Entre 90° y 180°</td>
                  <td>Una silla reclinada, la apertura de un abanico, un codo casi estirado</td>
                </tr>
                <tr>
                  <th scope="row">Llano</th>
                  <td>Exactamente 180°</td>
                  <td>Una línea recta: los dos lados apuntan en sentidos opuestos</td>
                </tr>
                <tr>
                  <th scope="row">Reflejo o cóncavo</th>
                  <td>Entre 180° y 360°</td>
                  <td>La esquina entrante de una habitación en L, vista desde dentro</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── 2. Casos de uso ──────────────────────────────────────────── */}
          <h3 className={styles.eduSubtitulo}>Para quién resuelve algo</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>
                <span aria-hidden="true">🎓</span> Estudiante sin transportador
              </h4>
              <p>
                El ejercicio está en un PDF o en una foto del libro y hay que medir un ángulo.
                Sobre la captura, la medida es exacta; y si el ejercicio hay que entregarlo en
                papel, la hoja imprimible da el instrumento que falta.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>
                <span aria-hidden="true">📐</span> Dibujo técnico y planos
              </h4>
              <p>
                Comprobar la inclinación de una cubierta, el ángulo de un chaflán o la apertura de
                una esquina sobre un plano en PDF. Como el plano ya es una proyección plana, no hay
                deformación y el número es el bueno.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>
                <span aria-hidden="true">🪚</span> Bricolaje y taller
              </h4>
              <p>
                Trasladar el ángulo de un corte a la ingletadora, o comprobar el de una pieza
                escaneada. Se imprime el transportador, se recorta y se apoya sobre la madera.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>
                <span aria-hidden="true">🧵</span> Patronaje y manualidades
              </h4>
              <p>
                Los patrones de costura se distribuyen en PDF a escala real y muchos piden ángulos
                concretos en pinzas y sisas. La misma advertencia de escala vale aquí: imprimir al
                100 %, y comprobarlo con la barra de calibración.
              </p>
            </div>
          </div>

          {/* ── 3. Guía paso a paso ──────────────────────────────────────── */}
          <h3 className={styles.eduSubtitulo}>Cómo medir bien un ángulo</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Carga una imagen plana.</strong> Una captura de pantalla, un plano o un
                esquema. Si es una foto, que esté hecha de frente al plano del ángulo.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Coloca el vértice.</strong> Arrastra el punto <strong>V</strong> justo al
                punto donde se cortan los dos lados. Este es el que más precisión pide: un vértice
                mal puesto estropea la medida por mucho que los brazos estén bien.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Estira los brazos.</strong> Lleva <strong>A</strong> y <strong>B</strong>{' '}
                sobre cada lado, lo más lejos del vértice que puedas. Con brazos largos, un error de
                dos píxeles apenas mueve el resultado; con brazos cortos, lo mueve varios grados.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Afina con el teclado.</strong> Con un punto seleccionado, las flechas lo
                mueven paso a paso, y con la tecla Mayúsculas se mueve aún más despacio. Es la forma
                de ajustar el último medio grado sin que el dedo tape lo que estás colocando.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Lee el ángulo que necesitas.</strong> El número grande es el ángulo menor,
                que es el que da un transportador. Si el que buscas es el que abre por fuera, está
                justo al lado como <em>ángulo reflejo</em>.
              </div>
            </li>
          </ol>

          {/* ── 4. Mejores prácticas ─────────────────────────────────────── */}
          <h3 className={styles.eduSubtitulo}>Consejos que mejoran la medida</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔍
              </span>
              <p>
                <strong>Amplía antes de capturar.</strong> Si el ángulo es pequeño en el documento
                original, haz zoom y captura después: más píxeles entre los lados es más precisión,
                y el ángulo no cambia al ampliar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📏
              </span>
              <p>
                <strong>Brazos largos, siempre.</strong> Es la única regla que de verdad mueve la
                precisión. Duplicar la longitud de los brazos reduce a la mitad el error de
                colocación.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🖨️
              </span>
              <p>
                <strong>Verifica la escala al imprimir.</strong> Mide la barra de calibración con
                una regla antes de recortar. Un transportador impreso al 92 % sigue midiendo bien
                los ángulos —no dependen del tamaño—, pero deja de encajar con las medidas en
                milímetros del resto del trabajo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔒
              </span>
              <p>
                <strong>Puedes usar documentos reservados.</strong> La imagen se procesa en tu
                navegador y no se envía a ningún servidor, así que un plano de trabajo o un
                documento interno no salen de tu equipo.
              </p>
            </div>
          </div>

          {/* ── 5. FAQ ───────────────────────────────────────────────────── */}
          <h3 className={styles.eduSubtitulo}>Preguntas frecuentes</h3>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Por qué mi ángulo de 90° me sale 87°?</dt>
              <dd>
                Casi siempre por una de dos razones: el vértice no está exactamente en la esquina,
                o la imagen tiene perspectiva. Prueba a alargar los brazos: si el número se acerca
                a 90, era colocación; si se queda donde estaba, la imagen está en escorzo y esa
                medida no es la del ángulo real.
                <span className={styles.faqTip}>
                  Con brazos que ocupen la mitad de la imagen, el error de colocación baja del
                  grado.
                </span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Mide ángulos de más de 180°?</dt>
              <dd>
                Sí, pero por el otro lado: dos semirrectas siempre definen dos ángulos que suman
                360°, y esta herramienta muestra los dos a la vez. El número grande es el menor —el
                que daría un transportador— y el <em>ángulo reflejo</em> es su pareja. Para un
                ángulo entrante de 210°, marca el de 150° y lee el reflejo.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo usarlo desde el móvil?</dt>
              <dd>
                Sí: los tres puntos se arrastran con el dedo. Para afinar, conviene ampliar la
                imagen antes de cargarla, porque en una pantalla pequeña el dedo tapa justo el punto
                que estás colocando.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué precisión tiene?</dt>
              <dd>
                La del propio arrastre: el cálculo es exacto, y el error lo pone dónde caen los
                tres puntos. Con brazos largos sobre una imagen nítida se queda por debajo de medio
                grado, que es aproximadamente lo que resuelve un transportador de plástico.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Y si no tengo ninguna imagen?</dt>
              <dd>
                Sin imagen aparece una rejilla milimetrada de apoyo, útil para comprobar un ángulo
                de memoria o para enseñar a leerlo: se mueven los puntos y se ve cómo cambian a la
                vez la amplitud y el nombre del ángulo.
              </dd>
            </div>
          </dl>

          {/* ── 6. Errores frecuentes ────────────────────────────────────── */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores que estropean la medida</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Medir sobre una foto oblicua.</strong> Es el error grande, y no avisa: da
                un número perfectamente creíble de un ángulo que no es el que se quería medir.
              </li>
              <li>
                <strong>Brazos cortos.</strong> Con los puntos A y B pegados al vértice, mover un
                píxel puede cambiar el resultado en varios grados.
              </li>
              <li>
                <strong>Confundir el ángulo con su suplementario.</strong> Al medir la inclinación
                de una recta respecto de otra, hay dos ángulos posibles según a qué lado se pongan
                los brazos: 30° y 150° describen la misma pareja de rectas.
              </li>
              <li>
                <strong>Imprimir con «ajustar a la página».</strong> Reduce la hoja sin decirlo. El
                transportador seguirá midiendo ángulos correctos, pero sus milímetros ya no serán
                milímetros.
              </li>
              <li>
                <strong>Dar por hecho que una imagen escaneada está recta.</strong> Un escaneo
                torcido gira todo por igual, así que los ángulos <em>entre</em> líneas se conservan;
                pero si lo que mides es la inclinación respecto de la horizontal de la hoja, ahí sí
                arrastra el error del escaneo.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={relatedApps} />
        <ShareCard appName="transportador-angulos" />
        <Footer appName="transportador-angulos" />
      </div>
    </div>
  );
}
