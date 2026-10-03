'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './AdaptadorDislexia.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  DisclaimerCard,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// Tipos de fuente disponibles
type TipoFuente = 'sistema' | 'lexend' | 'mono';

// Preferencias de lectura guardadas en localStorage
interface Preferencias {
  fuente: TipoFuente;
  tamano: number;           // px (14–36)
  espaciadoLetras: number;  // em (0–0.3)
  espaciadoPalabras: number; // em (0–0.5)
  interlineado: number;     // unitless (1.2–3.0)
  anchoColumna: number;     // % (40–100)
  colorFondo: string;       // hex
}

const PREFERENCIAS_DEFAULT: Preferencias = {
  fuente: 'lexend',
  tamano: 20,
  espaciadoLetras: 0.05,
  espaciadoPalabras: 0.15,
  interlineado: 1.9,
  anchoColumna: 68,
  colorFondo: '#FEFDF6',
};

const CLAVE_PREFS = 'adaptador-dislexia-prefs';

const COLORES_FONDO = [
  { id: 'blanco', color: '#FFFFFF', nombre: 'Blanco' },
  { id: 'crema', color: '#FEFDF6', nombre: 'Crema' },
  { id: 'azul', color: '#EEF4FF', nombre: 'Azul pálido' },
  { id: 'verde', color: '#F0F7F0', nombre: 'Verde pálido' },
  { id: 'gris', color: '#F5F5F5', nombre: 'Gris suave' },
];

/**
 * Convierte lo que haya en localStorage en unas Preferencias utilizables.
 *
 * Antes era `JSON.parse(guardadas) as Preferencias`, un cast sin comprobar: el try/catch
 * cubría el parseo pero no la FORMA de lo parseado, así que `{"tamano":22}` pasaba el filtro
 * y `prefs.interlineado.toFixed(1)` reventaba fuera del try — la app entera caía a la pantalla
 * de error de meskeIA y, al recargar, el usuario se encontraba TODOS sus ajustes de fábrica,
 * porque el primer render había alcanzado a sobrescribir la clave (hallazgo 877). El vector
 * realista no es un usuario trasteando: es cambiar la forma de `Preferencias` en una versión
 * futura y que todo el que vuelva se coma la pantalla de error una vez.
 *
 * Cada campo se valida por separado y lo que no encaje cae a su valor de fábrica, que es lo
 * que el try/catch ya prometía hacer.
 */
function sanearPreferencias(bruto: unknown): Preferencias {
  if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) {
    return PREFERENCIAS_DEFAULT;
  }
  const p = bruto as Record<string, unknown>;
  const numero = (valor: unknown, min: number, max: number, pordefecto: number): number =>
    typeof valor === 'number' && Number.isFinite(valor)
      ? Math.min(max, Math.max(min, valor))
      : pordefecto;

  const fuentes: TipoFuente[] = ['sistema', 'lexend', 'mono'];
  return {
    fuente: fuentes.includes(p.fuente as TipoFuente)
      ? (p.fuente as TipoFuente)
      : PREFERENCIAS_DEFAULT.fuente,
    tamano: numero(p.tamano, 14, 36, PREFERENCIAS_DEFAULT.tamano),
    espaciadoLetras: numero(p.espaciadoLetras, 0, 0.3, PREFERENCIAS_DEFAULT.espaciadoLetras),
    espaciadoPalabras: numero(p.espaciadoPalabras, 0, 0.5, PREFERENCIAS_DEFAULT.espaciadoPalabras),
    interlineado: numero(p.interlineado, 1.2, 3, PREFERENCIAS_DEFAULT.interlineado),
    anchoColumna: numero(p.anchoColumna, 40, 100, PREFERENCIAS_DEFAULT.anchoColumna),
    colorFondo:
      typeof p.colorFondo === 'string' && COLORES_FONDO.some(c => c.color === p.colorFondo)
        ? p.colorFondo
        : PREFERENCIAS_DEFAULT.colorFondo,
  };
}

/**
 * Caracteres que, como mínimo, caben en una línea del texto adaptado (hallazgo 2724).
 *
 * El «ancho de columna» es un porcentaje de la caja de vista previa, y en el ordenador eso
 * está bien: el 68 % de unos 900 px son líneas de unos 45 caracteres. En el móvil la caja
 * mide 210-262 px y el mismo 68 % dejaba la columna en 95-130 px, unas 7-10 letras por
 * línea. Hasta el 18/09 las palabras que no cabían desbordaban la caja; desde la reparación
 * del hallazgo 876 (`overflow-wrap: anywhere`) se partían por cualquier letra y sin guion
 * —«configur|ación», «aprendiz|aje»—, justo lo que una herramienta de lectura para
 * dislexia no puede hacer.
 *
 * Por eso la columna lleva un SUELO: nunca más estrecha que 20 caracteres de su propia
 * fuente, tamaño y espaciado (con el tope del 100 % de la caja). 20 porque es más que la
 * palabra común más larga del español («responsabilidades», 17) y porque por debajo de
 * eso una línea ya no sostiene ni una frase corta. En el ordenador el suelo no se nota
 * (20 caracteres son ~300 px frente a los ~600 del 68 %); en el móvil el suelo manda, y es
 * lo correcto: la pantalla ya es más estrecha que la columna más estrecha recomendable.
 * El suelo va en `min-width` y no dentro de `max-width` para que el porcentaje elegido
 * siga siendo exactamente el que dice la etiqueta allí donde cabe.
 */
const CARACTERES_MINIMOS_LINEA = 20;

/** Lo que cabe de muestra en la ventana fija del móvil (hallazgo 2725). */
const LARGO_MUESTRA = 160;

/** Borde de arriba de la muestra fija: justo bajo la barra fija del logo (≈ 64 px en móvil). */
const TOPE_MUESTRA = 68;

/** El primer párrafo con texto, recortado por una palabra entera. */
function textoDeMuestra(texto: string): string {
  const primero = texto.split('\n').find(l => l.trim() !== '')?.trim() ?? '';
  if (primero.length <= LARGO_MUESTRA) return primero;
  const corte = primero.lastIndexOf(' ', LARGO_MUESTRA);
  return `${primero.slice(0, corte > 0 ? corte : LARGO_MUESTRA)}…`;
}

/** Escapa lo que el usuario pegó antes de meterlo en el HTML que va al portapapeles. */
function escaparHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** De píxeles CSS a puntos tipográficos, que es lo que entienden los procesadores de textos. */
const aPuntos = (px: number): string => `${Math.round(px * 0.75 * 100) / 100}pt`;

/** Resultado del último «Copiar texto», para el botón y para el aviso hablado. */
type EstadoCopia = 'nada' | 'formato' | 'plano' | 'error';

const TEXTO_EJEMPLO = `La dislexia es una dificultad específica del aprendizaje que afecta a la lectura y la escritura. Las personas con dislexia pueden tener dificultades para reconocer palabras, deletrear correctamente y leer con fluidez.

Cambia los ajustes de lectura para encontrar la configuración que te resulte más cómoda. Cada persona es diferente, así que experimenta hasta dar con tu combinación perfecta.

Puedes sustituir este texto de ejemplo pegando aquí el contenido que necesitas leer: un artículo, apuntes del colegio, un correo de trabajo... lo que necesites.`;

export default function AdaptadorDislexiaPage() {
  const [texto, setTexto] = useState(TEXTO_EJEMPLO);
  const [prefs, setPrefs] = useState<Preferencias>(PREFERENCIAS_DEFAULT);
  const [copia, setCopia] = useState<EstadoCopia>('nada');
  const [fonteCargada, setFonteCargada] = useState(false);
  /** ¿Se ha leído ya lo guardado? Hasta entonces no se escribe nada (hallazgo 932). */
  const [cargadas, setCargadas] = useState(false);

  /**
   * Muestra fija del móvil (hallazgo 2725). No es `position: sticky` porque en este sitio
   * no pega: globals.css pone `overflow-x: hidden` a `html` Y a `body`, y eso convierte a
   * `body` en un contenedor de desplazamiento que nunca se desplaza, así que todo lo
   * «sticky» queda atado a él y no se mueve (medido: con el deslizador de letras en el
   * centro, la muestra sticky ya había salido por arriba). Se hace a mano: cuando la muestra
   * en línea empieza a meterse bajo la barra del logo y aún queda panel de ajustes por
   * debajo, se pinta una copia con `position: fixed`.
   */
  const refMuestra = useRef<HTMLDivElement>(null);
  const refPanel = useRef<HTMLElement>(null);
  const [muestraFija, setMuestraFija] = useState(false);

  useEffect(() => {
    const movil = window.matchMedia('(max-width: 768px)');
    let pendiente = 0;
    const medir = () => {
      pendiente = 0;
      const muestra = refMuestra.current?.getBoundingClientRect();
      const panel = refPanel.current?.getBoundingClientRect();
      if (!muestra || !panel || !movil.matches) {
        setMuestraFija(false);
        return;
      }
      setMuestraFija(muestra.top < TOPE_MUESTRA && panel.bottom > TOPE_MUESTRA + muestra.height + 48);
    };
    const pedir = () => {
      if (!pendiente) pendiente = requestAnimationFrame(medir);
    };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    movil.addEventListener('change', pedir);
    pedir();
    return () => {
      if (pendiente) cancelAnimationFrame(pendiente);
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
      movil.removeEventListener('change', pedir);
    };
  }, []);

  /**
   * ── Por qué el guardado espera a la carga (hallazgo 932) ──
   *
   * Los dos efectos van sobre la misma clave y el de guardado no sabía si el de carga había
   * terminado. Secuencia instrumentada con el tamaño sembrado a 32: LEE 32 —el setPrefs queda
   * ENCOLADO— → ESCRIBE 20, porque el de guardado corre con el estado todavía de fábrica y
   * PISA la clave → al volver a montar, LEE 20, que es lo que se acaba de pisar. No es solo
   * que la preferencia no se aplique: se BORRA del almacenamiento, justo lo contrario de lo
   * que promete el subtítulo de la app.
   *
   * En producción, con un solo montaje, se salvaba por los pelos: el re-render con lo leído
   * dispara un segundo guardado que repara el primero. Bastaba con que el componente se
   * montara dos veces para perderlo todo.
   *
   * `cargadas` es un ESTADO y no un ref a propósito: se actualiza en el mismo lote que
   * `setPrefs`, así que cuando el efecto de guardado se desbloquea ya tiene delante las
   * preferencias leídas. Con un ref, el desbloqueo llegaría un ciclo antes que el valor.
   */
  useEffect(() => {
    try {
      const guardadas = localStorage.getItem(CLAVE_PREFS);
      if (guardadas) setPrefs(sanearPreferencias(JSON.parse(guardadas)));
    } catch { /* ignorar errores de localStorage */ }
    setCargadas(true);
  }, []);

  // Guardar preferencias automáticamente
  useEffect(() => {
    if (!cargadas) return;
    try {
      localStorage.setItem(CLAVE_PREFS, JSON.stringify(prefs));
    } catch { /* ignorar errores de localStorage */ }
  }, [prefs, cargadas]);

  // Cargar Lexend desde Google Fonts
  useEffect(() => {
    if (!document.querySelector('link[data-font="lexend"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@400;500;600&display=swap';
      link.setAttribute('data-font', 'lexend');
      document.head.appendChild(link);
      link.onload = () => setFonteCargada(true);
    } else {
      setFonteCargada(true);
    }
  }, []);

  const actualizarPref = useCallback(
    <K extends keyof Preferencias>(clave: K, valor: Preferencias[K]) => {
      setPrefs(prev => ({ ...prev, [clave]: valor }));
    },
    []
  );

  /**
   * «Copiar texto» copia el texto CON la adaptación (hallazgo 2731).
   *
   * Antes hacía `navigator.clipboard.writeText(texto)`: al portapapeles llegaba solo lo que
   * el usuario había pegado, idéntico a la entrada, y al pegarlo en un procesador de textos
   * se perdían fuente, tamaño, espaciado, interlineado y fondo. El botón no aportaba nada
   * sobre copiar del propio área de texto.
   *
   * Ahora va un ClipboardItem con dos tipos: text/html con los estilos EN LÍNEA (los
   * procesadores de textos no leen hojas de estilo) y text/plain de reserva, que es el que
   * usa quien pega en un sitio sin formato. Si el navegador no tiene ClipboardItem o rechaza
   * el HTML, cae a texto plano y lo DICE: copiar sin formato en silencio era el defecto.
   */
  const copiarTexto = async () => {
    const terminar = (estado: EstadoCopia) => {
      setCopia(estado);
      setTimeout(() => setCopia('nada'), 4000);
    };
    try {
      if (typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard?.write === 'function') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([htmlParaCopiar()], { type: 'text/html' }),
            'text/plain': new Blob([texto], { type: 'text/plain' }),
          }),
        ]);
        terminar('formato');
        return;
      }
    } catch { /* el navegador no admite text/html en el portapapeles: se intenta en plano */ }
    try {
      await navigator.clipboard.writeText(texto);
      terminar('plano');
    } catch {
      terminar('error');
    }
  };

  const resetear = () => setPrefs(PREFERENCIAS_DEFAULT);

  // Familia tipográfica según selección
  const getFuenteFamily = (): string => {
    switch (prefs.fuente) {
      case 'lexend':
        return fonteCargada ? "'Lexend Deca', Arial, sans-serif" : 'Arial, sans-serif';
      case 'mono':
        return "'Courier New', Courier, monospace";
      default:
        return 'Arial, Helvetica, sans-serif';
    }
  };

  const nombreFuente =
    prefs.fuente === 'lexend' ? 'Lexend Deca' : prefs.fuente === 'mono' ? 'Courier New' : 'Arial';
  const nombreColorFondo =
    COLORES_FONDO.find(c => c.color === prefs.colorFondo)?.nombre ?? 'personalizado';

  const estilosVista: React.CSSProperties = {
    fontFamily: getFuenteFamily(),
    fontSize: `${prefs.tamano}px`,
    letterSpacing: `${prefs.espaciadoLetras}em`,
    wordSpacing: `${prefs.espaciadoPalabras}em`,
    lineHeight: prefs.interlineado,
    maxWidth: `${prefs.anchoColumna}%`,
    // Suelo de la columna (hallazgo 2724): ver CARACTERES_MINIMOS_LINEA. `ch` y `em` se
    // resuelven contra la fuente y el tamaño del propio bloque, así que el suelo crece con
    // ellos; el espaciado entre letras se suma aparte porque `ch` no lo incluye.
    minWidth: `min(100%, calc(${CARACTERES_MINIMOS_LINEA}ch + ${
      Math.round(CARACTERES_MINIMOS_LINEA * prefs.espaciadoLetras * 100) / 100
    }em + 2 * var(--relleno-x)))`,
    backgroundColor: prefs.colorFondo,
  };

  /** Lo que llevan las dos muestras del móvil, la en línea y la fija (hallazgo 2725). */
  const contenidoMuestra = (
    <>
      <span className={styles.muestraEtiqueta}>Muestra con tus ajustes</span>
      <div className={`${styles.textoAdaptado} ${styles.muestraTexto}`} style={estilosVista} lang="es">
        {texto.trim()
          ? <p>{textoDeMuestra(texto)}</p>
          : <em className={styles.placeholder}>Escribe o pega un texto para verlo aquí</em>}
      </div>
    </>
  );

  /** El texto adaptado como HTML con estilos en línea, para el portapapeles (hallazgo 2731). */
  const htmlParaCopiar = (): string => {
    const tam = prefs.tamano;
    const estiloParrafo = [
      `font-family: ${getFuenteFamily().replace(/"/g, "'")}`,
      `font-size: ${aPuntos(tam)}`,
      `letter-spacing: ${aPuntos(tam * prefs.espaciadoLetras)}`,
      `word-spacing: ${aPuntos(tam * prefs.espaciadoPalabras)}`,
      `line-height: ${aPuntos(tam * prefs.interlineado)}`,
      'color: #1A1A1A',
      'margin: 0 0 1em 0',
    ].join('; ');
    const parrafos = texto
      .split('\n')
      .filter(l => l.trim() !== '')
      .map(l => `<p style="${estiloParrafo}">${escaparHtml(l)}</p>`)
      .join('');
    return `<div style="background-color: ${prefs.colorFondo}; padding: 12pt;">${parrafos}</div>`;
  };

  const textoBotonCopia: Record<EstadoCopia, string> = {
    nada: 'Copiar texto',
    formato: 'Copiado con formato',
    plano: 'Copiado sin formato',
    error: 'No se ha podido copiar',
  };
  const avisoCopia: Record<EstadoCopia, string> = {
    nada: '',
    formato: 'Copiado con el formato de la vista previa: al pegarlo en un procesador de textos conserva la fuente, el tamaño y el espaciado (el color de fondo depende del programa).',
    plano: 'Este navegador no permite copiar con formato: se ha copiado solo el texto, sin los ajustes.',
    error: 'El navegador no ha dejado copiar. Selecciona el texto de la vista previa y cópialo a mano.',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📖</span> Adaptador de Lectura para Dislexia</h1>
        <p className={styles.subtitle}>
          Personaliza cualquier texto para que te resulte más fácil de leer.
          Ajusta la fuente, el tamaño, el espaciado y el color de fondo.
          Tus preferencias se guardan automáticamente.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        title="Herramienta de apoyo a la lectura"
      >
        Esta herramienta adapta visualmente los textos para facilitar la lectura.
        No sustituye la evaluación ni el tratamiento de un especialista.
        Si tienes dudas sobre dificultades de lectura, consulta con un logopeda o psicopedagogo.
      </DisclaimerCard>

      <div className={styles.layout}>
        {/* Panel de controles */}
        <aside ref={refPanel} className={styles.controlesPanel} aria-label="Ajustes de lectura">
          <h2 className={styles.panelTitle}><span aria-hidden="true">⚙️</span> Ajustes</h2>

          {/*
            Muestra, SOLO en móvil (hallazgo 2725). Con una sola columna el orden es
            ajustes → área de texto → vista previa, y la vista previa quedaba 1.263 px por
            debajo del deslizador de tamaño en un Pixel 7 de 839 px de alto: mover un pomo
            solo cambiaba el número de su etiqueta y parecía que la app no hacía nada. Esta
            muestra aplica los mismos estilos que la vista previa al primer párrafo y, al
            bajar por los ajustes, una copia se queda fija arriba (ver `muestraFija`).
            aria-hidden porque es un duplicado visual: a un lector de pantalla los cambios se
            los cuenta el resumen hablado de la vista previa, y oír el texto dos veces sobra.
          */}
          <div ref={refMuestra} className={styles.muestraMovil} aria-hidden="true" data-muestra="en-linea">
            {contenidoMuestra}
          </div>
          {muestraFija && (
            <div className={`${styles.muestraMovil} ${styles.muestraFija}`} aria-hidden="true" data-muestra="fija">
              {contenidoMuestra}
            </div>
          )}

          {/* Selector de fuente */}
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Tipo de letra</span>
            <div className={styles.fuenteBtns} role="group" aria-label="Selección de fuente">
              {([
                { id: 'sistema' as TipoFuente, nombre: 'Arial', familia: 'Arial, sans-serif' },
                { id: 'lexend' as TipoFuente, nombre: 'Lexend', familia: "'Lexend Deca', sans-serif" },
                { id: 'mono' as TipoFuente, nombre: 'Mono', familia: "'Courier New', monospace" },
              ] as const).map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.fuenteBtn} ${prefs.fuente === f.id ? styles.activo : ''}`}
                  onClick={() => actualizarPref('fuente', f.id)}
                  aria-pressed={prefs.fuente === f.id}
                  style={{ fontFamily: f.familia }}
                >
                  <span className={styles.fuenteEjemplo}>Aa</span>
                  <span className={styles.fuenteNombre}>{f.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño de letra */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-tamano">
              Tamaño: <strong>{`${prefs.tamano}\u00A0px`}</strong>
            </label>
            <input
              id="slider-tamano"
              type="range"
              min={14}
              max={36}
              step={1}
              value={prefs.tamano}
              onChange={e => actualizarPref('tamano', Number(e.target.value))}
              className={styles.slider}
              aria-valuetext={`${prefs.tamano} píxeles`}
            />
            <div className={styles.sliderLabels}>
              <span>Pequeño</span>
              <span>Grande</span>
            </div>
          </div>

          {/* Espaciado entre letras */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-letras">
              Espacio letras: <strong>{`${Math.round(prefs.espaciadoLetras * 100)}\u00A0%`}</strong>
            </label>
            <input
              id="slider-letras"
              type="range"
              min={0}
              max={0.3}
              step={0.01}
              value={prefs.espaciadoLetras}
              onChange={e => actualizarPref('espaciadoLetras', Number(e.target.value))}
              className={styles.slider}
              aria-valuetext={`${Math.round(prefs.espaciadoLetras * 100)}\u00A0%`}
            />
            <div className={styles.sliderLabels}>
              <span>Normal</span>
              <span>Amplio</span>
            </div>
          </div>

          {/* Espaciado entre palabras */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-palabras">
              Espacio palabras: <strong>{`${Math.round(prefs.espaciadoPalabras * 100)}\u00A0%`}</strong>
            </label>
            <input
              id="slider-palabras"
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={prefs.espaciadoPalabras}
              onChange={e => actualizarPref('espaciadoPalabras', Number(e.target.value))}
              className={styles.slider}
              aria-valuetext={`${Math.round(prefs.espaciadoPalabras * 100)}\u00A0%`}
            />
            <div className={styles.sliderLabels}>
              <span>Normal</span>
              <span>Amplio</span>
            </div>
          </div>

          {/* Interlineado */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-lineas">
              Interlineado: <strong>{formatNumber(prefs.interlineado, 1)}</strong>
            </label>
            <input
              id="slider-lineas"
              type="range"
              min={1.2}
              max={3.0}
              step={0.1}
              value={prefs.interlineado}
              onChange={e => actualizarPref('interlineado', Number(e.target.value))}
              className={styles.slider}
              aria-valuetext={`interlineado ${formatNumber(prefs.interlineado, 1)}`}
            />
            <div className={styles.sliderLabels}>
              <span>Normal</span>
              <span>Muy abierto</span>
            </div>
          </div>

          {/* Ancho de columna */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-ancho">
              Ancho columna: <strong>{`${prefs.anchoColumna}\u00A0%`}</strong>
            </label>
            {/*
              step 1 y no 5: con step=5 desde min=40, el 68 por defecto NO caía en la rejilla
              del control y el navegador subía el pomo a 70, mientras la etiqueta decía 68 % y
              el texto se maquetaba al 68 %. Un lector de pantalla anunciaba 70 (hallazgo 881).
            */}
            <input
              id="slider-ancho"
              type="range"
              min={40}
              max={100}
              step={1}
              value={prefs.anchoColumna}
              onChange={e => actualizarPref('anchoColumna', Number(e.target.value))}
              className={styles.slider}
              aria-valuetext={`${prefs.anchoColumna}\u00A0% del ancho`}
            />
            <div className={styles.sliderLabels}>
              <span>Estrecho</span>
              <span>Completo</span>
            </div>
          </div>

          {/* Color de fondo */}
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Color de fondo</span>
            <div className={styles.colorBtns} role="group" aria-label="Color de fondo del texto">
              {COLORES_FONDO.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.colorBtn} ${prefs.colorFondo === c.color ? styles.activo : ''}`}
                  onClick={() => actualizarPref('colorFondo', c.color)}
                  aria-label={c.nombre}
                  aria-pressed={prefs.colorFondo === c.color}
                  title={c.nombre}
                  style={{ backgroundColor: c.color }}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className={styles.acciones}>
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={resetear}
              aria-label="Restablecer ajustes por defecto"
            >
              <span aria-hidden="true">🔄</span> Restablecer
            </button>
          </div>

          <p className={styles.guardadoMsg} aria-live="polite">
            <span aria-hidden="true">✅</span> Ajustes guardados automáticamente
          </p>
        </aside>

        {/* Panel principal */}
        <main className={styles.mainPanel}>
          {/* Entrada de texto */}
          <section className={styles.seccionTexto}>
            <h2 className={styles.seccionTitulo}>Tu texto</h2>
            <p className={styles.hint}>
              Pega o escribe el texto que quieres adaptar
            </p>
            <textarea
              className={styles.textarea}
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Pega aquí el texto que quieres adaptar..."
              rows={6}
              aria-label="Texto a adaptar para lectura"
            />
          </section>

          {/* Vista previa */}
          <section className={styles.seccionVista} aria-label="Vista previa del texto adaptado">
            <div className={styles.vistaHeader}>
              <h2 className={styles.seccionTitulo}><span aria-hidden="true">👁️</span> Vista previa</h2>
              {/* Sin aria-label: el texto visible ya es el nombre (WCAG 2.5.3) */}
              <button
                type="button"
                className={styles.btnPrimario}
                onClick={copiarTexto}
              >
                <span aria-hidden="true">{copia === 'nada' ? '📋' : copia === 'error' ? '⚠️' : '✅'}</span>{' '}
                {textoBotonCopia[copia]}
              </button>
            </div>
            <p className={styles.avisoCopia} role="status" aria-live="polite">
              {avisoCopia[copia]}
            </p>
            {/*
              Un resumen de los ajustes SÍ es una región viva razonable: cambia poco, dice lo
              que acaba de pasar y se lee en dos segundos. La vista previa, no.
            */}
            <p className={styles.resumenAjustes} role="status" aria-live="polite" aria-atomic="true">
              {/* Cifra y unidad con espacio duro (U+00A0), que no deja saltar el «%» solo (hallazgo 2730) */}
              {[
                nombreFuente,
                `${prefs.tamano} px`,
                `interlineado ${formatNumber(prefs.interlineado, 1)}`,
                `letras ${Math.round(prefs.espaciadoLetras * 100)} %`,
                `palabras ${Math.round(prefs.espaciadoPalabras * 100)} %`,
                `ancho ${prefs.anchoColumna} %`,
                `fondo ${nombreColorFondo}`,
              ].join(' · ')}
            </p>
            <div className={styles.vistaContenedor}>
              {/*
                SIN aria-live ni aria-atomic (hallazgo 879). Los llevaba sobre el bloque que
                contiene TODO el texto adaptado, y marcado además como atómico: cada letra
                tecleada, y cada paso de cualquier deslizador, reanunciaba el documento entero
                —567 caracteres con el ejemplo de fábrica, 29.699 con un texto pegado—, lo que
                deja el área de texto inservible con lector de pantalla. Lo que cambia y merece
                anunciarse son los AJUSTES, y para eso está el resumen de aquí arriba.
              */}
              <div
                className={styles.textoAdaptado}
                style={estilosVista}
                lang="es"
                role="region"
                aria-label="Texto con formato aplicado"
              >
                {texto
                  ? texto.split('\n').map((linea, i) =>
                      linea === '' ? <br key={i} /> : <p key={i}>{linea}</p>
                    )
                  : <em className={styles.placeholder}>El texto aparecerá aquí con tus ajustes aplicados...</em>
                }
              </div>
            </div>
          </section>
        </main>
      </div>

      <EducationalSection
        title="¿Qué es la dislexia y cómo ayuda este adaptador?"
        subtitle="Información sobre dislexia y accesibilidad lectora"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Qué es la dislexia?</h2>
          <p>
            La dislexia es una dificultad específica del aprendizaje de base neurobiológica. Las
            personas con dislexia tienen dificultades con la decodificación de palabras escritas, la
            fluidez lectora y la ortografía, a pesar de tener una inteligencia normal. Sobre cuántas
            personas la tienen, la cifra más citada es la del DSM-5 (Asociación Estadounidense de
            Psiquiatría, 2013): entre el 5&nbsp;% y el 15&nbsp;% de los niños en edad escolar tienen un
            trastorno específico del aprendizaje, que agrupa las dificultades en lectura —la
            dislexia—, en escritura y en matemáticas. Es decir, el rango es de los tres juntos y en
            la escuela, no de la dislexia en toda la población; en adultos el mismo manual lo sitúa
            en torno al 4&nbsp;%, y las cifras varían mucho según el idioma y el criterio diagnóstico.
          </p>

          <h2>¿Por qué ayudan los ajustes visuales?</h2>
          <ul>
            <li>
              <strong>Fuente Lexend</strong>: diseñada para la velocidad lectora, sobre todo por su
              espaciado holgado y sus formas abiertas. Conviene saber qué NO hace: sus letras
              especulares siguen siendo casi simétricas —la «d» de Lexend Deca es el espejo de la
              «b» en un 89&nbsp;%, medido superponiendo los glifos reales—, así que no es la fuente que
              busca quien confunde b/d o p/q. Para eso están las que rompen esa simetría a
              propósito, como OpenDyslexic o Dyslexie, que engrosan la base de las letras. Y la
              evidencia sobre si las fuentes «para dislexia» mejoran la lectura es <em>mixta</em>:
              lo que sí tiene respaldo constante es el espaciado, que puedes ajustar aquí abajo.
            </li>
            <li>
              <strong>Tamaño grande</strong>: Los textos más grandes son más fáciles de seguir
              con la vista, sobre todo en pantalla.
            </li>
            <li>
              <strong>Espaciado amplio</strong>: Más espacio entre letras y palabras reduce
              el efecto de &quot;emborronamiento&quot; o agrupación visual. Es el ajuste con más
              respaldo: en el estudio de Zorzi y colaboradores (PNAS, 2012), con niños italianos y
              franceses con dislexia, ampliar el espacio entre letras mejoró la velocidad y la
              precisión lectora.
            </li>
            <li>
              <strong>Interlineado abierto</strong>: Separa las líneas para que los ojos
              puedan seguir el texto sin perderse de fila.
            </li>
            <li>
              <strong>Columna estrecha</strong>: Líneas más cortas facilitan el salto
              de una línea a la siguiente sin perder el punto de lectura.
            </li>
            <li>
              <strong>Fondo crema</strong>: Un fondo crema o pastel en lugar del blanco puro lo
              recomienda la guía de estilo de la British Dyslexia Association como opción más
              cómoda para muchas personas. Es una cuestión de comodidad y preferencia personal: no
              hay evidencia sólida de que un color de fondo concreto mejore la lectura, así que
              conviene probar varios.
            </li>
          </ul>

          <h2>Consejos de uso</h2>
          <ul>
            <li>Empieza por el fondo <strong>Crema</strong> y la fuente <strong>Lexend</strong>: suelen funcionar bien para la mayoría</li>
            <li>Aumenta el interlineado hasta 2,0–2,5 si el texto parece comprimido</li>
            <li>Reduce el ancho de columna al 50–60&nbsp;% para párrafos largos (en el ordenador; en el móvil la pantalla ya es más estrecha que eso)</li>
            <li>Tus ajustes se guardan automáticamente para la próxima visita</li>
            <li>Complementa con la función de lectura en voz alta de tu dispositivo o navegador</li>
          </ul>
        </section>

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa de fuentes para dislexia</h2>
          <p>No todas las fuentes funcionan igual según el perfil lector. Solo la fila «Distinción b/d/p/q» es una medida; las demás son impresiones de uso, no resultados de estudios que comparen estas tres fuentes, y sirven como punto de partida para probar:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Arial / Sistema</th>
                  <th>Lexend</th>
                  <th>Monoespaciada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Legibilidad general
                    <br /><small>Impresión subjetiva, no una medida: la evidencia comparativa entre fuentes es mixta</small>
                  </td>
                  <td>Buena</td>
                  <td className={styles.celdaDestacada}>Buena, con espaciado más holgado</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>
                    Distinción b/d/p/q
                    <br /><small>
                      Coincidencia de la «d» con la «b» reflejada, superponiendo los glifos
                      reales: cuanto más alta, más se parecen y más fácil es confundirlas
                    </small>
                  </td>
                  <td>98&nbsp;% · muy simétricas</td>
                  <td className={styles.celdaDestacada}>89&nbsp;% · muy simétricas</td>
                  <td>97&nbsp;% · muy simétricas</td>
                </tr>
                <tr>
                  <td>
                    Fatiga visual
                    <br /><small>Impresión subjetiva: no hay estudios que comparen estas tres fuentes en fatiga</small>
                  </td>
                  <td>Media</td>
                  <td className={styles.celdaDestacada}>Baja</td>
                  <td>Mayor en textos largos</td>
                </tr>
                <tr>
                  <td>
                    Apta para imprimir
                    <br /><small>Impresión subjetiva</small>
                  </td>
                  <td>Sí</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td>Regular</td>
                </tr>
                <tr>
                  <td>
                    Uso habitual
                    <br /><small>Impresión subjetiva</small>
                  </td>
                  <td>Uso general</td>
                  <td className={styles.celdaDestacada}>Lectura prolongada</td>
                  <td>Código, listas cortas</td>
                </tr>
                <tr>
                  <td colSpan={4}>
                    <small>
                      Ninguna fuente es «la fuente para la dislexia»: lo que funciona se prueba
                      persona a persona, y por eso esta página deja cambiarlas y medir con tu
                      propio texto. Lo que sí sostiene la investigación es el efecto del
                      espaciado entre letras y palabras, que es independiente de la fuente.
                    </small>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>¿Para quién es este adaptador?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🧒</span>
              <h3>Niño escolar con dislexia</h3>
              <p>Facilita la lectura de apuntes y enunciados de examen. El educador puede pegar el texto y configurarlo juntos, guardando los ajustes para futuras visitas desde el mismo dispositivo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
              <h3>Adulto universitario</h3>
              <p>Adapta artículos académicos y apuntes extensos. El fondo crema y la columna estrecha reducen la sobrecarga visual en sesiones de estudio largas.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">💼</span>
              <h3>Profesional con fatiga visual</h3>
              <p>Útil para leer correos largos, informes o normativas. Sin necesidad de instalar fuentes en el ordenador corporativo: funciona directamente en el navegador.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">👩‍🏫</span>
              <h3>Educador o logopeda</h3>
              <p>Prepara materiales de lectura adaptados para cada alumno. Permite demostrar en tiempo real el impacto de los diferentes ajustes tipográficos en una sesión.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre Lexend y otras fuentes &quot;para dislexia&quot;?</dt>
              <dd>Lexend la diseñó Bonnie Shaver-Troup a partir de su investigación sobre velocidad lectora, y lo que la distingue es el espaciado y las formas abiertas. A diferencia de OpenDyslexic o Dyslexie, no engruesa la base de las letras ni rompe la simetría entre b/d o p/q; hay quien la encuentra más natural por eso, y quien confunde esas letras puede preferir las otras. La evidencia comparativa entre fuentes es mixta: lo que conviene es probar con el propio texto.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿El adaptador funciona sin conexión a internet?</dt>
              <dd>Casi completamente. La fuente Lexend se carga desde Google Fonts la primera vez; si ya la cargaste antes y tu navegador la tiene en caché, sí funciona sin conexión. Arial y Mono están disponibles siempre.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Los ajustes se guardan para la próxima visita?</dt>
              <dd>Sí. Los parámetros se guardan en el almacenamiento local del navegador. La próxima vez que abras la app en el mismo dispositivo y navegador, encontrarás la configuración tal como la dejaste.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué fondo funciona mejor para cada persona?</dt>
              <dd>No hay una respuesta única. El fondo Crema suele ser el más cómodo para la mayoría, pero algunas personas prefieren el Azul pálido o el Verde. Lo ideal es probarlo con el propio usuario presente y dejar que decida.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Se puede imprimir el texto con los ajustes aplicados?</dt>
              <dd>Sí. Puedes usar la función de imprimir del navegador (Ctrl+P). El texto de la vista previa se imprimirá con la fuente y el tamaño que hayas configurado, aunque el color de fondo depende de la configuración de tu impresora.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Hay diferencia entre dislexia y baja visión?</dt>
              <dd>Sí. La dislexia es una dificultad de procesamiento lingüístico neurológico, no visual. La baja visión implica una agudeza visual reducida. Este adaptador puede ayudar en los dos casos, por caminos distintos: en la dislexia, sobre todo por el espaciado entre letras y palabras, que es el ajuste con más respaldo (la evidencia sobre las fuentes es mixta y el efecto varía de una persona a otra); en la baja visión, por el tamaño y el contraste.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Funciona en móvil y tablet?</dt>
              <dd>Sí. En el móvil, mientras recorres los ajustes, una muestra del texto con tus ajustes se queda fija en la parte de arriba, para que veas el efecto de cada cambio sin desplazarte; la vista previa completa está debajo. En tablet en horizontal, el panel de ajustes queda a la izquierda y el texto adaptado a la derecha.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puede sustituir a una evaluación profesional?</dt>
              <dd>No. Esta herramienta es un apoyo visual para la lectura, no un diagnóstico ni un tratamiento. Si sospechas dislexia en un niño o adulto, consulta con un psicopedagogo o logopeda para una evaluación adecuada.</dd>
            </div>
          </dl>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo configurar el adaptador con un alumno</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Pega el texto a adaptar</strong>
                <p>Copia el texto que necesita leer el alumno (apuntes, enunciado, artículo) y pégalo en el área «Tu texto».</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Empieza con Lexend y fondo Crema</strong>
                <p>Son los ajustes recomendados por defecto. En la mayoría de casos, ya habrá una mejora visible sin cambiar nada más.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Ajusta el tamaño de letra</strong>
                <p>Pregunta al alumno si el texto le parece grande o pequeño. Mueve el slider hasta que responda &quot;está bien&quot;. Un rango habitual: 20–26&nbsp;px.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Amplía el espaciado entre letras</strong>
                <p>Sube el slider de &quot;Espacio letras&quot; hasta el 10–15&nbsp;%. Observa si el alumno nota que las letras &quot;respiran mejor&quot;.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Abre el interlineado</strong>
                <p>Sube hasta 2,0 o 2,2. Esto separa las líneas y evita que el ojo se &quot;pierda&quot; al saltar de una línea a la siguiente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Reduce el ancho de columna</strong>
                <p>Baja al 55–65&nbsp;% (en el móvil la columna ya ocupa casi todo el ancho y apenas cambia). Las líneas más cortas reducen el desplazamiento ocular y facilitan encontrar el inicio de la siguiente línea.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Prueba los fondos de color</strong>
                <p>Deja que el alumno elija el que le resulte más cómodo. Los ajustes se guardan automáticamente para la próxima sesión.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Buenas prácticas para educadores y familias</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🎯</span>
              <p><strong>Configura con el usuario presente.</strong> La configuración óptima varía mucho entre personas. Siempre ajusta con el alumno o familiar delante, no de antemano.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔄</span>
              <p><strong>Cambia un parámetro cada vez.</strong> Si cambias fuente, tamaño y espaciado a la vez, no sabrás qué fue lo que ayudó. Modifica de uno en uno.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🗣️</span>
              <p><strong>Combina con lectura en voz alta.</strong> El adaptador visual y el lector de pantalla del navegador son complementarios. Usa ambos para reforzar la comprensión.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">📸</span>
              <p><strong>Guarda la configuración óptima.</strong> Una vez encontrada, haz una captura de pantalla de los ajustes. Si alguien borra las cookies, tendrás la configuración de referencia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">📅</span>
              <p><strong>Revisa la configuración periódicamente.</strong> Las necesidades cambian con el tiempo. Una configuración perfecta a los 8 años puede necesitar ajustarse a los 12.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🤝</span>
              <p><strong>Comparte el enlace de la app.</strong> Envía la URL al alumno para que pueda usarla en casa con sus mismos ajustes guardados (si usa el mismo navegador y dispositivo).</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3><span aria-hidden="true">⚠️</span> Errores comunes que reducen la efectividad</h3>
            <ul>
              <li><strong>Tamaño muy grande sin reducir el ancho de columna:</strong> con letras de 28&nbsp;px o más y columna al 100&nbsp;%, las líneas quedan demasiado largas y el efecto positivo desaparece.</li>
              <li><strong>Usar fondo blanco puro si hay fotosensibilidad:</strong> el blanco puro (#FFFFFF) genera más contraste del necesario. El fondo crema o azul pálido suelen ser más cómodos.</li>
              <li><strong>Asumir que lo que funciona para uno funciona para todos:</strong> la dislexia se manifiesta de formas muy distintas. No copies la configuración de otro alumno sin comprobarla.</li>
              <li><strong>Confundir dificultad de lectura con falta de interés:</strong> si un alumno rechaza la herramienta, puede ser que los ajustes no sean los adecuados aún. Prueba diferentes combinaciones antes de concluir que no le ayuda.</li>
              <li><strong>Usar el adaptador como único apoyo:</strong> la herramienta es un complemento, no un sustituto de intervención logopédica, ajustes pedagógicos y apoyo emocional.</li>
              <li><strong>No guardar la configuración:</strong> si el usuario borra los datos del navegador (cookies/localStorage), los ajustes se pierden. Tomar nota o captura de la configuración ideal es una buena práctica de seguridad.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('adaptador-dislexia')} />
      <ShareCard appName="adaptador-dislexia" />
      <Footer appName="adaptador-dislexia" />
    </div>
  );
}
