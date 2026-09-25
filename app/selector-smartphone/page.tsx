'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorSmartphone.module.css';
import {
  calcularResultado,
  ORDEN_GAMAS,
  type GamaKey,
  type Resultado,
  type SistemaOS,
} from './motor';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RegionBadge,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────


interface Opcion {
  valor: string;
  etiqueta: string;
  desc: string;
}

interface Pregunta {
  id: number;
  categoria: string;
  pregunta: string;
  icon: string;
  opciones: Opcion[];
}

interface GamaInfo {
  nombre: string;
  icon: string;
  precioOrientativo: string;
  descripcion: string;
}


// ─────────────────────────────────────────────
// Datos de gamas
// ─────────────────────────────────────────────

const GAMAS: Record<GamaKey, GamaInfo> = {
  basica: {
    nombre: 'Gama básica',
    icon: '📱',
    precioOrientativo: '100 – 250 €',
    descripcion:
      'Cubre las necesidades del día a día: llamadas, WhatsApp, redes sociales y navegación. Sin grandes alardes de cámara ni rendimiento, pero fiable para un uso sencillo.',
  },
  media: {
    nombre: 'Gama media',
    icon: '📲',
    precioOrientativo: '250 – 500 €',
    descripcion:
      'El punto dulce del mercado. Buena cámara, autonomía sólida y rendimiento fluido para la mayoría de usuarios. La mejor relación calidad-precio del catálogo actual.',
  },
  alta: {
    nombre: 'Gama alta',
    icon: '🌟',
    precioOrientativo: '500 – 900 €',
    descripcion:
      'Procesadores rápidos, cámaras versátiles con teleobjetivo y pantallas AMOLED de alta calidad. Ideal si usas el móvil intensamente o valoras la fotografía.',
  },
  pro: {
    nombre: 'Gama pro / flagship',
    icon: '🏆',
    precioOrientativo: '900 – 1.500+ €',
    descripcion:
      'Lo mejor de la tecnología actual: zoom óptico avanzado, pantallas de 120 Hz, procesadores de última generación y actualizaciones garantizadas durante años.',
  },
};

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    categoria: 'Tu uso',
    pregunta: '¿Para qué usas principalmente el móvil?',
    icon: '📱',
    opciones: [
      { valor: 'basico', etiqueta: 'Uso básico', desc: 'Llamadas, WhatsApp y poco más' },
      { valor: 'redes', etiqueta: 'Redes sociales y contenido', desc: 'Instagram, TikTok, YouTube…' },
      { valor: 'trabajo', etiqueta: 'Trabajo y productividad', desc: 'Email, documentos, videoconferencias' },
      { valor: 'foto', etiqueta: 'Fotografía y vídeo', desc: 'Fotos de calidad, grabación de vídeos' },
    ],
  },
  {
    id: 2,
    categoria: 'Tu uso',
    pregunta: '¿Juegas habitualmente a videojuegos en el móvil?',
    icon: '🎮',
    opciones: [
      { valor: 'no', etiqueta: 'No juego o muy poco', desc: 'El gaming no es algo que valoro' },
      { valor: 'casual', etiqueta: 'Casual (Wordle, Solitario…)', desc: 'Juegos ligeros de vez en cuando' },
      { valor: 'medio', etiqueta: 'Con frecuencia', desc: 'Juego a menudo, varios títulos' },
      { valor: 'intenso', etiqueta: 'Gaming intenso', desc: 'Juegos exigentes, máximo rendimiento' },
    ],
  },
  {
    id: 3,
    categoria: 'Tu uso',
    pregunta: '¿Cuántas horas usas el móvil al día, aproximadamente?',
    icon: '⏱️',
    opciones: [
      { valor: 'poco', etiqueta: 'Menos de 2 horas', desc: 'Uso muy moderado' },
      { valor: 'medio', etiqueta: '2 – 4 horas', desc: 'Uso normal' },
      { valor: 'mucho', etiqueta: '4 – 7 horas', desc: 'Uso intenso' },
      { valor: 'extremo', etiqueta: 'Más de 7 horas', desc: 'El móvil es mi herramienta principal' },
    ],
  },
  {
    id: 4,
    categoria: 'Tu situación',
    pregunta: '¿Tienes ya dispositivos Apple (Mac, iPad, AirPods…)?',
    icon: '🍎',
    opciones: [
      { valor: 'si_muchos', etiqueta: 'Sí, varios', desc: 'Uso el ecosistema Apple a diario' },
      { valor: 'si_alguno', etiqueta: 'Alguno', desc: 'Tengo algún dispositivo Apple' },
      { valor: 'no', etiqueta: 'No, ninguno', desc: 'No uso ningún producto Apple' },
      { valor: 'otro', etiqueta: 'Soy independiente', desc: 'Mezclo marcas según conviene' },
    ],
  },
  {
    id: 5,
    categoria: 'Tu situación',
    pregunta: '¿Qué sistema operativo usas en tu ordenador?',
    icon: '💻',
    opciones: [
      { valor: 'mac', etiqueta: 'macOS', desc: 'Tengo un Mac' },
      { valor: 'windows', etiqueta: 'Windows', desc: 'Tengo un PC con Windows' },
      { valor: 'linux', etiqueta: 'Linux', desc: 'Uso Linux o similar' },
      { valor: 'nopc', etiqueta: 'No tengo ordenador', desc: 'El móvil o tablet es mi principal dispositivo' },
    ],
  },
  {
    id: 6,
    categoria: 'Tus prioridades',
    pregunta: '¿Qué es lo más importante para ti en un smartphone?',
    icon: '⭐',
    opciones: [
      { valor: 'bateria', etiqueta: 'Batería larga', desc: 'Quiero pasar el día sin cargar' },
      { valor: 'camara', etiqueta: 'Cámara de calidad', desc: 'Las fotos son mi prioridad' },
      { valor: 'rendimiento', etiqueta: 'Rendimiento fluido', desc: 'Que no se cuelgue ni vaya lento' },
      { valor: 'precio', etiqueta: 'Precio ajustado', desc: 'Lo básico al mejor precio' },
    ],
  },
  {
    id: 7,
    categoria: 'Tus prioridades',
    pregunta: '¿Cuánto tiempo esperas quedarte con el móvil?',
    icon: '📅',
    opciones: [
      { valor: 'corto', etiqueta: '1 – 2 años', desc: 'Me gusta renovar con frecuencia' },
      { valor: 'medio', etiqueta: '2 – 3 años', desc: 'Lo normal' },
      { valor: 'largo', etiqueta: '4 años o más', desc: 'Busco durabilidad máxima' },
    ],
  },
  {
    id: 8,
    categoria: 'Tus prioridades',
    pregunta: '¿Qué valoras más del diseño?',
    icon: '🎨',
    opciones: [
      { valor: 'pequeno', etiqueta: 'Compacto y ligero', desc: 'Cabe bien en el bolsillo' },
      { valor: 'grande', etiqueta: 'Pantalla grande', desc: 'Más cómodo para ver contenido' },
      { valor: 'resistente', etiqueta: 'Resistente (IP68)', desc: 'Que aguante agua y golpes' },
      { valor: 'indiferente', etiqueta: 'Me da igual', desc: 'El diseño no es prioritario' },
    ],
  },
  {
    id: 9,
    categoria: 'Tu presupuesto',
    pregunta: '¿Cuál es tu presupuesto aproximado?',
    icon: '💶',
    opciones: [
      { valor: 'bajo', etiqueta: 'Hasta 250 €', desc: 'Precio mínimo, sin renuncias clave' },
      { valor: 'medio', etiqueta: '250 – 500 €', desc: 'Relación calidad-precio óptima' },
      { valor: 'alto', etiqueta: '500 – 900 €', desc: 'Dispuesto a pagar por calidad' },
      { valor: 'premium', etiqueta: 'Más de 900 €', desc: 'Quiero lo mejor disponible' },
    ],
  },
  {
    id: 10,
    categoria: 'Tu presupuesto',
    pregunta: '¿Considerarías comprar un móvil de segunda mano certificado?',
    icon: '♻️',
    opciones: [
      { valor: 'si', etiqueta: 'Sí, con garantía', desc: 'Si tiene garantía y buen estado, adelante' },
      { valor: 'quizas', etiqueta: 'Tal vez', desc: 'Dependería de la oferta' },
      { valor: 'no', etiqueta: 'No, prefiero nuevo', desc: 'Quiero comprar nuevo siempre' },
    ],
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorSmartphone() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const enunciado = useRef<HTMLHeadingElement>(null);

  // Al cambiar de pantalla o de pregunta se desmonta o se desactiva el botón que tenía el foco
  // («Empezar», «Siguiente» sin respuesta aún, «Ver resultado»), y el foco caía a <body>: el
  // siguiente Tab salía después del cuestionario y, en móvil, el resultado quedaba dos pantallas
  // por encima (hallazgos 1679 y 1680). Se lleva al enunciado de la pregunta nueva o al
  // encabezado del resultado, que además lo desplaza a la vista.
  useEffect(() => {
    if (pantalla === 'resultado') tituloResultado.current?.focus();
    else if (pantalla === 'test') enunciado.current?.focus();
  }, [pantalla, paso]);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = ((paso) / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  /**
   * Teclado del patrón de radios (WAI-ARIA APG): las flechas mueven el foco a la opción vecina y
   * la marcan, con vuelta al principio, e Inicio/Fin van a los extremos. El grupo es UNA parada de
   * Tab (tabindex itinerante). Antes cada opción era una parada y las flechas no hacían nada
   * (hallazgo 1681).
   */
  function teclaEnOpcion(e: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    const total = preguntaActual.opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % total;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + total) % total;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = total - 1;
    else return;
    e.preventDefault();
    seleccionarOpcion(preguntaActual.opciones[destino].valor);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[destino]?.focus();
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      const res = calcularResultado(respuestas);
      setResultado(res);
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('intro');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  const osInfo = resultado ? (resultado.os === 'ios'
    ? { nombre: 'iPhone (iOS)', icon: '🍎', desc: 'El ecosistema Apple integrado, actualizaciones garantizadas 6-7 años y experiencia fluida desde el primer día.' }
    : { nombre: 'Android', icon: '🤖', desc: 'Mayor variedad de modelos y precios, personalización avanzada y compatibilidad con los servicios de Google.' })
    : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── HERO ── */}
      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">📱</span> Asesor de Smartphone</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro'
              ? '10 preguntas para saber qué móvil te conviene de verdad'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm} ref={tituloResultado} tabIndex={-1}>Tu smartphone ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu perfil</p>
        </header>
      )}

      {/* Las cuatro horquillas de precio y la pregunta de presupuesto están en euros, y el
          bloque educativo cita normativa y campañas de compra de la UE: la metodología es
          universal pero los datos de referencia no (hallazgo 949). */}
      <RegionBadge variant="es-data" />

      <LegalNotice />
      <DisclaimerCard variant="general" severity="medium" />

      {/* ── PANTALLA INTRO ── */}
      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>📱</span>
              <span className={styles.introIcon}>🍎</span>
              <span className={styles.introIcon}>🤖</span>
              <span className={styles.introIcon}>📷</span>
            </div>
            <h2 className={styles.introTitulo}>¿Qué móvil te conviene?</h2>
            <p className={styles.introDesc}>
              El mercado de smartphones cambia cada año y elegir puede ser abrumador. Este test analiza tu uso real,
              tus prioridades y tu presupuesto para orientarte hacia el sistema operativo y la gama que mejor se adaptan a ti.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> iOS o Android según tu ecosistema</li>
              <li><span aria-hidden="true">✅</span> Gama recomendada con precio orientativo</li>
              <li><span aria-hidden="true">✅</span> Características técnicas a buscar según tu perfil</li>
              <li><span aria-hidden="true">✅</span> Consejos de compra personalizados</li>
              <li><span aria-hidden="true">✅</span> Sin marcas patrocinadas, solo tu perfil real</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── PANTALLA TEST ── */}
      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          {/* Barra de progreso */}
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              // Lo anunciado y lo pintado van sobre la misma escala: preguntas RESPONDIDAS.
              // aria-valuenow era el número de pregunta (paso + 1) mientras el relleno es
              // paso / total, así que iban desfasados un paso entero (hallazgo 951).
              aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${paso + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto} ref={enunciado} tabIndex={-1}>{preguntaActual.pregunta}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.pregunta}>
              {preguntaActual.opciones.map((op, indice) => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  // role="radio" + aria-checked, no aria-pressed: la semántica real es la
                  // elección ÚNICA entre cuatro, no un conmutador. El contenedor declaraba
                  // radiogroup y no había un solo radio dentro (hallazgo 950).
                  role="radio"
                  aria-checked={respuestas[preguntaActual.id] === op.valor}
                  // Tabindex itinerante: la marcada, o la primera si no hay ninguna (1681).
                  tabIndex={
                    respuestas[preguntaActual.id]
                      ? respuestas[preguntaActual.id] === op.valor ? 0 : -1
                      : indice === 0 ? 0 : -1
                  }
                  onKeyDown={e => teclaEnOpcion(e, indice)}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={retroceder}
              disabled={paso === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={avanzar}
              disabled={!respuestas[preguntaActual.id]}
              aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}
            >
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {/* ── PANTALLA RESULTADO ── */}
      {pantalla === 'resultado' && resultado && osInfo && (
        <div className={styles.resultadosContainer}>

          {/* Recomendaciones principales */}
          <div className={styles.recomendacionGrid}>
            <div className={styles.recomendacionCard}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{osInfo.icon}</span>
              <p className={styles.recomendacionLabel}>Sistema operativo</p>
              <p className={styles.recomendacionValor}>{osInfo.nombre}</p>
              <p className={styles.recomendacionDesc}>{osInfo.desc}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardGama}`}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{GAMAS[resultado.gama].icon}</span>
              <p className={styles.recomendacionLabel}>Gama recomendada</p>
              <p className={styles.recomendacionValor}>{GAMAS[resultado.gama].nombre}</p>
              <p className={styles.recomendacionDesc}>
                {GAMAS[resultado.gama].descripcion}
                <br /><strong>Precio orientativo: {GAMAS[resultado.gama].precioOrientativo}</strong>
              </p>
            </div>
          </div>

          {/* El presupuesto declarado, dicho a la cara. La pantalla de resultado no lo
              mencionaba ni una vez, y podía proponer una gama entre dos y seis veces más
              cara que la elegida (hallazgo 943). */}
          {resultado.recortadaPorPresupuesto && (
            <p className={styles.avisoPresupuesto} role="note">
              <span aria-hidden="true">💶</span> Tu uso apuntaba a la{' '}
              <strong>{GAMAS[resultado.gamaPorPerfil].nombre.toLowerCase()}</strong>{' '}
              ({GAMAS[resultado.gamaPorPerfil].precioOrientativo}), pero la recomendación se
              ajusta al presupuesto que has declarado. Lo que sigue es lo mejor que cabe en tu
              tramo.
            </p>
          )}
          {resultado.ampliadaPorPresupuesto && (
            <p className={styles.avisoPresupuesto} role="note">
              <span aria-hidden="true">💶</span> Con tu uso declarado bastaría la{' '}
              <strong>{GAMAS[resultado.gamaPorPerfil].nombre.toLowerCase()}</strong>{' '}
              ({GAMAS[resultado.gamaPorPerfil].precioOrientativo}): el salto responde a tu
              presupuesto, no a una necesidad técnica.
            </p>
          )}

          {/* El sistema recomendado no tiene modelos nuevos en la gama que cabe: la app proponía
              «iPhone» con «Gama básica · 100 – 250 €» sin una palabra sobre el precio real
              (hallazgo 1678). */}
          {resultado.avisoSistema && (
            <p className={styles.avisoSistema} role="note">
              <span aria-hidden="true">🍎</span> {resultado.avisoSistema}
            </p>
          )}

          {/* Por qué esta recomendación */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta recomendación</p>
            {resultado.razones.map((r, i) => (
              <p key={i} className={styles.razonItem}>{r}</p>
            ))}
          </div>

          {/* Características a buscar */}
          <div className={styles.caracteristicasSection}>
            <p className={styles.caracteristicasTitulo}>
              Qué buscar en tu próximo smartphone
            </p>
            <div className={styles.caracteristicasGrid}>
              {resultado.caracteristicas.map((c, i) => (
                <div key={i} className={styles.caracteristicaItem}>{c}</div>
              ))}
            </div>
          </div>

          {/* Consejos */}
          {resultado.consejos.length > 0 && (
            <div className={styles.consejosSection}>
              <p className={styles.consejosTitulo}>Consejos antes de comprar</p>
              {resultado.consejos.map((c, i) => (
                <p key={i} className={styles.consejoItem}>{c}</p>
              ))}
            </div>
          )}

          {/* Repetir */}
          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          {/* Sección educativa */}
          <EducationalSection
            title="Guía completa: cómo elegir smartphone"
            subtitle="iOS vs Android, gamas, qué mirar y cuándo comprar"
            defaultOpen={false}
          >
            <h3>iOS vs Android: diferencias clave</h3>
            <p>
              <strong>iOS</strong> es el sistema operativo de Apple, exclusivo de los iPhone. Su mayor ventaja es la
              integración perfecta con el resto de dispositivos Apple (Mac, iPad, AirPods, Apple Watch) y la garantía de
              recibir actualizaciones durante 6-7 años. Es más restrictivo en personalización, pero muy estable.
            </p>
            <p>
              <strong>Android</strong> (desarrollado por Google) lo usan Samsung, Xiaomi, Google, OnePlus y la mayoría
              de fabricantes. Ofrece mayor variedad de modelos y precios, más opciones de personalización y mejor
              integración con servicios de Google (Gmail, Drive, Meet). La duración de las actualizaciones varía
              según fabricante y modelo: los más generosos declaran hasta 7 años, e incluso en la gama de entrada
              ya hay modelos con 5 años o más. Mira siempre la cifra que el fabricante declara para el modelo concreto.
            </p>
            <p>
              En la Unión Europea, desde el 20/06/2025 el Reglamento (UE) 2023/1670 obliga a que, si el fabricante
              publica actualizaciones del sistema para un modelo, las ofrezca gratis a todas sus unidades hasta al
              menos 5 años después de que ese modelo deje de venderse. Regula cómo se reparten las actualizaciones,
              no promete versiones nuevas: la cifra declarada sigue siendo la referencia.
            </p>

            <h3>Las gamas explicadas</h3>
            <p>
              <strong>Gama básica (hasta 250 €):</strong> ideal para llamadas, mensajería y redes sociales. Las cámaras
              son modestas, el rendimiento suficiente para el uso cotidiano y la batería suele ser generosa en capacidad.
              En este tramo y en la gama media no hay iPhone nuevo: quien quiera iOS con este presupuesto tiene la vía
              del reacondicionado certificado.
            </p>
            <p>
              <strong>Gama media (250-500 €):</strong> el segmento con mejor relación calidad-precio del mercado. Pantallas
              AMOLED de calidad, cámaras con modo noche y teleobjetivo básico, autonomía de todo el día. La mayoría de
              usuarios encuentra aquí su móvil ideal.
            </p>
            <p>
              <strong>Gama alta (500-900 €):</strong> procesadores de primer nivel, cámaras con zoom óptico real,
              pantallas de 120 Hz con brillo máximo elevado y materiales premium. Para quienes usan el móvil de forma
              intensiva o valoran mucho la fotografía.
            </p>
            <p>
              <strong>Flagship / Pro (más de 900 €):</strong> lo más avanzado disponible. Zoom periscópico, sensores
              de cámara grandes, el procesador más potente, funciones de IA avanzadas y soporte garantizado durante
              muchos años. Se justifica para usuarios profesionales o quienes planean conservarlo 5+ años.
            </p>

            <h3>Qué mirar antes de comprar</h3>
            <ul>
              <li><strong>Actualizaciones garantizadas:</strong> cuántos años de soporte ofrece el fabricante. Importante si planeas usar el móvil 3+ años.</li>
              <li><strong>Batería (mAh) y carga rápida:</strong> más mAh no siempre significa más autonomía — el software de optimización importa mucho.</li>
              <li><strong>Cámara:</strong> los megapíxeles no lo dicen todo. El tamaño del sensor, la apertura y el procesado de imagen son más importantes.</li>
              <li><strong>Pantalla:</strong> resolución, tecnología (AMOLED vs LCD), tasa de refresco (60 Hz vs 120 Hz) y brillo máximo para exteriores.</li>
              <li><strong>Conectividad:</strong> 5G ya es estándar en gama media-alta. Comprueba también NFC si usas pagos móviles.</li>
              <li><strong>IP68 o IP67:</strong> resistencia al agua. Cada vez más habitual incluso en gama media.</li>
            </ul>

            <h3>Cuándo y dónde comprar</h3>
            <div className={styles.warningBox}>
              <strong>Mejores momentos para comprar:</strong> el precio de los smartphones baja considerablemente en las
              campañas de descuentos de cada país (el Black Friday de noviembre y el Prime Day de julio están
              extendidos en buena parte del mundo hispanohablante, y en México se suma el Buen Fin) y, sobre todo,
              cuando se lanza la generación siguiente del modelo que te interesa. Comprar el modelo del año anterior
              tras el lanzamiento del nuevo puede suponer un ahorro del 20-30%.
            </div>
            <p>
              Los canales más habituales son las tiendas oficiales de cada marca, las grandes superficies de
              electrónica y los mercados en línea; en España se añaden El Corte Inglés y MediaMarkt, y en Latinoamérica
              cadenas como Falabella, Liverpool o Mercado Libre. Para segunda mano certificada, plataformas como Back
              Market o Amazon Renewed dan garantía propia: comprueba cuántos meses cubre en tu país, porque el mínimo
              legal cambia de uno a otro.
            </p>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-smartphone')} />
      <ShareCard appName="selector-smartphone" />
      <Footer appName="selector-smartphone" />
    </div>
  );
}
