'use client';

import React, { useEffect, useRef, useState, type MouseEvent } from 'react';
import styles from './SelectorMascota.module.css';
import {
  calcularResultado,
  MASCOTAS,
  ETIQUETA_MENSUAL,
  TIEMPO_ESCASO,
  AUSENCIA_LARGA,
  type Resultado,
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
  /** En una pregunta de varias respuestas, la que excluye a las demás («Sin restricciones»). */
  exclusiva?: boolean;
}
interface Pregunta {
  id: number;
  categoria: string;
  pregunta: string;
  icon: string;
  opciones: Opcion[];
  /**
   * Varias respuestas a la vez: casillas (role="checkbox") en vez de radios. La respuesta se
   * guarda como la lista de valores marcados separada por comas (motor.ts, punto 7).
   */
  multiple?: boolean;
}

// Los datos de cada mascota y la lógica de recomendación viven en ./motor.ts.

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1, categoria: 'Tu vida diaria', pregunta: '¿Cuánto tiempo libre tienes para dedicar a una mascota?', icon: '⏰',
    opciones: [
      { valor: 'mucho', etiqueta: 'Mucho — más de 2 h al día', desc: 'Trabajo desde casa o tengo horario flexible' },
      { valor: 'medio', etiqueta: 'Bastante — 1-2 h al día', desc: 'Jornada laboral estándar pero organizada' },
      { valor: 'poco', etiqueta: 'Poco — menos de 1 h al día', desc: 'Muy ocupado, viajes frecuentes' },
      { valor: 'minimo', etiqueta: 'Mínimo — solo fines de semana', desc: 'Apenas tengo tiempo entre semana' },
    ],
  },
  {
    id: 2, categoria: 'Tu vida diaria', pregunta: '¿Cuántas horas al día está la casa vacía habitualmente?', icon: '🏠',
    opciones: [
      { valor: 'siempre', etiqueta: 'Casi nunca está vacía', desc: 'Siempre hay alguien en casa' },
      { valor: 'pocas', etiqueta: '3 – 5 horas', desc: 'Salgo a trabajar y vuelvo pronto' },
      { valor: 'muchas', etiqueta: '6 – 10 horas', desc: 'Jornada laboral completa fuera' },
      { valor: 'viajes', etiqueta: 'Varios días seguidos', desc: 'Viajes de trabajo frecuentes' },
    ],
  },
  {
    id: 3, categoria: 'Tu vivienda', pregunta: '¿Qué espacio tienes en casa?', icon: '🏡',
    opciones: [
      { valor: 'jardin', etiqueta: 'Casa con jardín o patio', desc: 'Espacio exterior propio' },
      { valor: 'piso_grande', etiqueta: 'Piso amplio (más de 80 m²)', desc: 'Espacio interior generoso' },
      { valor: 'piso_normal', etiqueta: 'Piso normal (50-80 m²)', desc: 'Espacio suficiente pero limitado' },
      { valor: 'piso_pequeno', etiqueta: 'Piso pequeño (menos de 50 m²)', desc: 'Estudio o piso muy compacto' },
    ],
  },
  {
    id: 4, categoria: 'Tu vida diaria', pregunta: '¿Cuánto ejercicio y actividad al aire libre haces tú?', icon: '🏃',
    opciones: [
      { valor: 'mucho', etiqueta: 'Muy activo — salgo a correr o al campo', desc: 'Me encanta el exterior y el deporte' },
      { valor: 'medio', etiqueta: 'Moderado — paseos habituales', desc: 'Camino bastante pero sin deportes intensos' },
      { valor: 'poco', etiqueta: 'Sedentario — prefiero estar en casa', desc: 'No me apetece salir más de lo necesario' },
    ],
  },
  {
    id: 5, categoria: 'Tu situación', pregunta: '¿Hay niños menores de 12 años en casa?', icon: '👶',
    opciones: [
      { valor: 'si_pequenos', etiqueta: 'Sí, menores de 5 años', desc: 'Bebés o niños muy pequeños' },
      { valor: 'si_mayores', etiqueta: 'Sí, de 5 a 12 años', desc: 'Niños que pueden participar en el cuidado' },
      { valor: 'no', etiqueta: 'No, solo adultos', desc: 'Sin niños en el hogar' },
      { valor: 'adolescentes', etiqueta: 'Sí, adolescentes', desc: 'Mayores de 12 años' },
    ],
  },
  {
    // Varias a la vez (hallazgo 2666): alergia, comunidad y silencio no se excluyen, y como
    // elección única un hogar alérgico con normas de comunidad perdía el filtro de la alergia.
    id: 6, categoria: 'Tu situación', pregunta: '¿Hay alguna alergia o restricción en casa?', icon: '🤧',
    multiple: true,
    opciones: [
      { valor: 'alergia_pelo', etiqueta: 'Alergia al pelo animal', desc: 'Alguien en casa tiene alergia confirmada' },
      { valor: 'comunidad', etiqueta: 'La comunidad restringe ciertas mascotas', desc: 'Normas del edificio o alquiler con límites' },
      { valor: 'sin_ruido', etiqueta: 'Necesidad de silencio (trabajo en casa, bebé…)', desc: 'El ruido es un problema importante' },
      { valor: 'ninguna', etiqueta: 'Sin restricciones', desc: 'Total libertad para elegir', exclusiva: true },
    ],
  },
  {
    id: 7, categoria: 'Tus expectativas', pregunta: '¿Qué tipo de vínculo buscas con tu mascota?', icon: '❤️',
    opciones: [
      { valor: 'compania', etiqueta: 'Compañía constante y afecto', desc: 'Quiero que siempre esté cerca de mí' },
      { valor: 'juego', etiqueta: 'Juego e interacción activa', desc: 'Me gusta jugar y entrenar a mi mascota' },
      { valor: 'tranquilidad', etiqueta: 'Presencia tranquila y relajante', desc: 'Quiero una mascota sin mucha demanda' },
      { valor: 'novedad', etiqueta: 'Algo diferente y fascinante', desc: 'Me interesan las mascotas poco convencionales' },
    ],
  },
  {
    id: 8, categoria: 'Tus expectativas', pregunta: '¿Cuánto tiempo planeas tener esta mascota?', icon: '📅',
    opciones: [
      { valor: 'largo', etiqueta: 'Para toda la vida', desc: 'Quiero un compromiso a largo plazo (10-20 años)' },
      { valor: 'medio', etiqueta: 'Varios años con posibilidad de cambio', desc: 'Situación vital puede cambiar' },
      { valor: 'corto', etiqueta: 'Quiero algo de ciclo de vida más corto', desc: 'Prefiero no compromisos muy largos' },
    ],
  },
  {
    id: 9, categoria: 'Tu presupuesto', pregunta: '¿Cuánto puedes invertir en la adquisición inicial?', icon: '💶',
    opciones: [
      { valor: 'minimo', etiqueta: 'Lo mínimo (adopción gratuita o muy barata)', desc: 'Prefiero adoptar sin coste' },
      { valor: 'bajo', etiqueta: 'Hasta 300 €', desc: 'Presupuesto ajustado' },
      { valor: 'medio', etiqueta: '300 – 1.000 €', desc: 'Inversión moderada' },
      { valor: 'alto', etiqueta: 'Sin límite especial', desc: 'El coste inicial no es un freno' },
    ],
  },
  {
    id: 10, categoria: 'Tu presupuesto', pregunta: '¿Cuánto puedes gastar mensualmente en el mantenimiento?', icon: '📊',
    opciones: [
      { valor: 'muy_bajo', etiqueta: 'Menos de 30 €/mes', desc: 'Presupuesto muy ajustado' },
      { valor: 'bajo', etiqueta: '30 – 80 €/mes', desc: 'Gasto moderado' },
      { valor: 'medio', etiqueta: '80 – 180 €/mes', desc: 'Dispuesto a invertir en su bienestar' },
      { valor: 'alto', etiqueta: 'Más de 180 €/mes', desc: 'El bienestar es la prioridad' },
    ],
  },
];

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

/**
 * Lo que ocupa la barra fija de MeskeiaLogo (~52 px en móvil, ~77 px desde 769 px) más un
 * respiro: el mismo hueco de 80 px que los lotes 586a4d61 y a1d72a9c dieron al hero. Va también
 * como `scroll-margin-top` del enunciado y del título del resultado, en el CSS.
 */
const HUECO_BARRA_LOGO = 80;

export default function SelectorMascota() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const enunciado = useRef<HTMLHeadingElement>(null);

  // Al cambiar de pantalla o de pregunta se desmonta o se desactiva el botón que tenía el foco
  // («Empezar», «Siguiente» sin respuesta aún, «Ver resultado»), y el foco caía a <body>: el
  // siguiente Tab salía del cuestionario (hallazgo 2667, forma del 1680 de selector-smartphone).
  // Se lleva al enunciado de la pregunta nueva o al título del resultado. Y en móvil la página no
  // se movía al avanzar: el enunciado nuevo quedaba bajo la barra fija del logo o por encima de
  // la pantalla (hallazgo 2670). Si no está entero a la vista y por debajo de la barra, se sube a
  // su sitio; el hueco lo da su `scroll-margin-top` (80 px, el del hero).
  useEffect(() => {
    const destino = pantalla === 'resultado' ? tituloResultado.current
      : pantalla === 'test' ? enunciado.current
        : null;
    if (!destino) return;
    const caja = destino.getBoundingClientRect();
    if (caja.top < HUECO_BARRA_LOGO || caja.bottom > window.innerHeight) {
      destino.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    destino.focus({ preventScroll: true });
  }, [pantalla, paso]);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;
  const respuestaActual = respuestas[preguntaActual.id] ?? '';
  const marcadas = respuestaActual.split(',').filter(Boolean);

  /**
   * Doble clic y dos toques seguidos (hallazgo 2671, receta de quiz-literatura-universal,
   * ce0ad0bc). «Empezar», «Siguiente», «Anterior», «Ver resultado» y «Repetir» cambian la
   * pantalla en el primer clic, y el segundo caía en el mismo punto sobre lo que hubiera debajo
   * en la pantalla nueva: a 412 px, el «Siguiente» de la pregunta 8 contestaba la 9, que tiene
   * una opción más y crece hacia abajo. Un clic se ignora cuando cumple las dos cosas:
   *   · es el 2.º (o 3.º…) de una ráfaga: `detail` > 1. Lo cuenta el navegador, no un
   *     temporizador; con teclado o lector de pantalla es 0;
   *   · y el clic ANTERIOR de la app cambió de pantalla. Sin esto, elegir y pulsar «Siguiente»
   *     deprisa en un móvil —dos toques cercanos, que Chrome también cuenta como ráfaga— se
   *     comería el «Siguiente», que sí era una intención nueva.
   */
  const ultimoCambioPantallaRef = useRef(false);
  const clicDeMas = (e: MouseEvent<HTMLButtonElement>): boolean =>
    e.detail > 1 && ultimoCambioPantallaRef.current;
  const registrarClic = (cambiaPantalla: boolean) => {
    ultimoCambioPantallaRef.current = cambiaPantalla;
  };

  function seleccionarOpcion(valor: string) { setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor })); }

  /** Casilla de una pregunta de varias respuestas: «Sin restricciones» excluye a las demás. */
  function alternarCasilla(op: Opcion) {
    const marcada = marcadas.includes(op.valor);
    const exclusivas = preguntaActual.opciones.filter(o => o.exclusiva).map(o => o.valor);
    const nuevas = marcada
      ? marcadas.filter(v => v !== op.valor)
      : op.exclusiva ? [op.valor] : [...marcadas.filter(v => !exclusivas.includes(v)), op.valor];
    // En el orden de las opciones, para que la misma elección dé siempre la misma respuesta
    const valor = preguntaActual.opciones.map(o => o.valor).filter(v => nuevas.includes(v)).join(',');
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function pulsarOpcion(e: MouseEvent<HTMLButtonElement>, op: Opcion) {
    if (clicDeMas(e)) return;
    registrarClic(false);
    if (preguntaActual.multiple) alternarCasilla(op);
    else seleccionarOpcion(op.valor);
  }

  /**
   * Teclado del patrón de radios (WAI-ARIA APG): las flechas mueven el foco a la opción vecina y
   * la marcan, con vuelta al principio, e Inicio/Fin van a los extremos. El grupo es UNA parada de
   * Tab (tabindex itinerante). Antes cada opción era una parada y las flechas no hacían nada
   * (hallazgo 2668, forma del 1681 de selector-smartphone). Las casillas no lo llevan: en el
   * patrón de casillas cada una es su propia parada y se marca con Espacio.
   */
  function teclaEnOpcion(e: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    if (preguntaActual.multiple) return;
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

  // Avanza desde la pregunta DEL RENDER (`paso + 1`, no `p => p + 1`) y solo si está respondida:
  // dos clics antes de repintar no saltan una pregunta (hallazgo 2671).
  function avanzar(e: MouseEvent<HTMLButtonElement>) {
    if (clicDeMas(e) || !respuestaActual) return;
    registrarClic(true);
    if (paso < totalPreguntas - 1) { setPaso(paso + 1); }
    else { setResultado(calcularResultado(respuestas)); setPantalla('resultado'); }
  }
  function retroceder(e: MouseEvent<HTMLButtonElement>) {
    if (clicDeMas(e) || paso === 0) return;
    registrarClic(true);
    setPaso(paso - 1);
  }
  function empezar(e: MouseEvent<HTMLButtonElement>) {
    if (clicDeMas(e)) return;
    registrarClic(true);
    setPantalla('test');
  }
  function reiniciar(e: MouseEvent<HTMLButtonElement>) {
    if (clicDeMas(e)) return;
    registrarClic(true);
    setPantalla('intro'); setPaso(0); setRespuestas({}); setResultado(null);
  }

  const ficha = resultado ? MASCOTAS[resultado.mascota] : null;
  const porPerfil = resultado ? MASCOTAS[resultado.mascotaPorPerfil] : null;
  const motivoRecorte = resultado && resultado.mascotaPorPerfil !== resultado.mascota
    ? resultado.descartes[resultado.mascotaPorPerfil]
    : undefined;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">🐾</span> Asesor de Mascota</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro' ? '10 preguntas para saber qué mascota se adapta a tu vida real'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm} ref={tituloResultado} tabIndex={-1}>Tu mascota ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu estilo de vida</p>
        </header>
      )}

      {/* Costes en euros, licencia PPP y normativa española en la guía: la metodología es
          universal pero los datos de referencia no (hallazgo 1340). */}
      <RegionBadge variant="es-data" />

      <LegalNotice />
      <DisclaimerCard variant="general" severity="high" />

      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🐕</span>
              <span className={styles.introIcon}>🐱</span>
              <span className={styles.introIcon}>🐹</span>
              <span className={styles.introIcon}>🐠</span>
            </div>
            <h2 className={styles.introTitulo}>¿Perro, gato, o algo diferente?</h2>
            <p className={styles.introDesc}>
              Elegir una mascota es un compromiso de años que afecta a tu día a día, tu economía y tu espacio.
              Este test analiza tu estilo de vida real — no el que te gustaría tener — para orientarte hacia
              la mascota que mejor encaja contigo sin romanticismos.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Tipo de mascota recomendada con perfil concreto</li>
              <li><span aria-hidden="true">✅</span> Coste inicial y mensual orientativo</li>
              <li><span aria-hidden="true">✅</span> Pros y contras adaptados a tu situación</li>
              <li><span aria-hidden="true">✅</span> Consejos antes de adoptar o comprar</li>
              <li><span aria-hidden="true">✅</span> Sin juicios, solo tu realidad</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={empezar}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {pantalla === 'test' && (
        <div className={styles.testContainer}>
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
              // paso / total, así que iban desfasados un paso entero (hallazgo 1342, mismo
              // defecto y misma reparación que selector-smartphone, hallazgo 951).
              aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${paso + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>
          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto} ref={enunciado} tabIndex={-1}>{preguntaActual.pregunta}</h2>
            {preguntaActual.multiple && (
              <p className={styles.preguntaAyuda} id={`ayuda-pregunta-${preguntaActual.id}`}>
                Marca todas las que se den en tu casa.
              </p>
            )}
            {/* Una pregunta de varias respuestas es un grupo de casillas (role="checkbox"), no
                de radios: «alergia» y «comunidad» se pueden declarar a la vez (hallazgo 2666). */}
            <div
              className={styles.opcionesGrid}
              role={preguntaActual.multiple ? 'group' : 'radiogroup'}
              aria-label={preguntaActual.pregunta}
              aria-describedby={preguntaActual.multiple ? `ayuda-pregunta-${preguntaActual.id}` : undefined}
            >
              {preguntaActual.opciones.map((op, indice) => {
                const marcada = marcadas.includes(op.valor);
                return (
                  <button key={op.valor} type="button"
                    className={`${styles.opcionBtn} ${marcada ? styles.opcionSeleccionada : ''}`}
                    onClick={e => pulsarOpcion(e, op)}
                    // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                    // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                    // radio dentro (hallazgo 1341; selector-smartphone, hallazgo 950).
                    role={preguntaActual.multiple ? 'checkbox' : 'radio'}
                    aria-checked={marcada}
                    // Radios: tabindex itinerante, la marcada o la primera si no hay (2668).
                    // Casillas: cada una es su propia parada de Tab.
                    tabIndex={preguntaActual.multiple ? 0
                      : marcadas.length > 0 ? (marcada ? 0 : -1)
                        : indice === 0 ? 0 : -1}
                    onKeyDown={e => teclaEnOpcion(e, indice)}
                  >
                    <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                    <span className={styles.opcionDesc}>{op.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={retroceder} disabled={paso === 0} aria-label="Pregunta anterior">← Anterior</button>
            <button type="button" className={styles.btnSiguiente} onClick={avanzar} disabled={!respuestaActual} aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}>
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {pantalla === 'resultado' && resultado && ficha && porPerfil && (
        <div className={styles.resultadosContainer}>
          <div className={styles.recomendacionCard}>
            <span className={styles.recomendacionIcon} aria-hidden="true">{ficha.icon}</span>
            <p className={styles.recomendacionLabel}>Tu mascota ideal</p>
            <p className={styles.recomendacionValor}>{ficha.nombre}</p>
            <p className={styles.recomendacionPerfil}>{ficha.perfil}</p>
            <p className={styles.recomendacionDesc}>{ficha.descripcion}</p>
          </div>

          {/* Lo declarado como límite, dicho a la cara: la alergia, la edad de los niños o el
              presupuesto han apartado a la que ganaba por estilo de vida (hallazgos 1332, 1333). */}
          {motivoRecorte && (
            <p className={styles.avisoRecorte} role="note">
              <span aria-hidden="true">⚠️</span> Por estilo de vida encajaría{' '}
              <strong>{porPerfil.conArticulo}</strong>, pero{' '}
              {motivoRecorte === 'alergia' && 'has declarado alergia al pelo: la recomendación se limita a animales sin pelo.'}
              {motivoRecorte === 'salud' && resultado.mascotaPorPerfil === 'reptil' &&
                'con niños menores de 5 años los CDC de Estados Unidos no recomiendan reptiles en casa (riesgo de salmonela).'}
              {/* Los CDC incluyen a los roedores en la misma recomendación (hallazgo 1441) */}
              {motivoRecorte === 'salud' && resultado.mascotaPorPerfil === 'roedor' &&
                'con niños menores de 5 años los CDC de Estados Unidos recomiendan evitar el contacto con roedores, y a esa edad el riesgo de infección con cualquier pequeño mamífero es mayor.'}
              {/* Poco tiempo y la casa vacía muchas horas descartan al perro (hallazgo 2665) */}
              {motivoRecorte === 'atencion' && (
                <>has dicho que tienes {TIEMPO_ESCASO[respuestas[1]]} y que la casa se queda vacía{' '}
                  {AUSENCIA_LARGA[respuestas[2]]}: un perro necesita salir varias veces al día, y las guías
                  de bienestar animal (RSPCA, PDSA) aconsejan no dejarlo solo más de cuatro horas seguidas.
                  La recomendación se limita a animales que llevan bien esas ausencias.</>
              )}
              {motivoRecorte === 'presupuesto' && (
                <>su coste mensual ({porPerfil.costeMensual}) no cabe en tu presupuesto de{' '}
                  {ETIQUETA_MENSUAL[respuestas[10]]}: la recomendación se ajusta a lo que cabe en ese tramo.</>
              )}
            </p>
          )}

          {/* Un empate no se resuelve en silencio por el orden del código (hallazgo 1334). */}
          {resultado.empatadas.length > 0 && (
            <p className={styles.avisoEmpate} role="note">
              <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
              {enumerar([resultado.mascota, ...resultado.empatadas].map(k => MASCOTAS[k].conArticulo))}{' '}
              encajan exactamente igual; {resultado.criterioDesempate}.
            </p>
          )}

          <div className={styles.costesGrid}>
            <div className={styles.costeCard}>
              <p className={styles.costeLabel}>Coste inicial</p>
              <p className={styles.costeValor}>{resultado.costeInicial.valor}</p>
              {resultado.costeInicial.nota && <p className={styles.costeNota}>{resultado.costeInicial.nota}</p>}
            </div>
            <div className={styles.costeCard}>
              <p className={styles.costeLabel}>Coste mensual</p>
              <p className={styles.costeValor}>{ficha.costeMensual}</p>
            </div>
            <div className={styles.costeCard}>
              <p className={styles.costeLabel}>Esperanza de vida</p>
              <p className={styles.costeValor}>{ficha.esperanzaVida}</p>
            </div>
          </div>
          {/* Las horquillas no salen de una encuesta: se dice, y se contrastan con la
              media que midió la OCU (sospecha del Inspector, 24/09/2026, §1.quinquies) */}
          <p className={styles.notaCostes}>
            Horquillas orientativas para España (estimación de meskeIA, 2026): cambian mucho con la
            ciudad, la raza y la clínica. Como contraste, la encuesta de la OCU de 2022 midió un gasto
            medio de 1.131 € al año por perro (unos 94 € al mes) y de 986 € por gato (unos 82 €). Fuera
            de España, tómalas solo como proporción entre especies.
          </p>

          <div className={styles.prosContrasGrid}>
            <div className={styles.prosCard}>
              <p className={styles.prosTitulo}>Puntos a favor</p>
              {ficha.pros.map((p, i) => <p key={i} className={styles.prosItem}>{p}</p>)}
            </div>
            <div className={styles.contrasCard}>
              <p className={styles.contrasTitulo}>A tener en cuenta</p>
              {ficha.contras.map((c, i) => <p key={i} className={styles.contrasItem}>{c}</p>)}
            </div>
          </div>

          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Por qué esta recomendación</p>
            {resultado.razones.map((r, i) => <p key={i} className={styles.consejoItem}>{r}</p>)}
          </div>

          {resultado.aTenerEnCuenta.length > 0 && (
            <div className={styles.consejosSection}>
              <p className={styles.consejosTitulo}>Lo que juega en contra, según tus respuestas</p>
              {resultado.aTenerEnCuenta.map((t, i) => <p key={i} className={styles.consejoItem}>{t}</p>)}
            </div>
          )}

          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de decidirte</p>
            {/* El emoji, aparte y oculto al lector: dentro de la cadena lo leía (hallazgo 2672) */}
            {resultado.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}><span aria-hidden="true">{c.icono}</span> {c.texto}</p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">← Repetir el test</button>

          <EducationalSection title="Guía completa: elegir mascota" subtitle="Costes reales, derechos, obligaciones y consejos prácticos" defaultOpen={false}>
            <h3>El coste real de tener una mascota</h3>
            <p>Muchas personas subestiman el coste de mantener una mascota. Además del coste mensual visible (comida, arena, accesorios), hay gastos ocultos importantes: veterinario de urgencias, vacunas anuales, peluquería, guardería en vacaciones y posibles operaciones.</p>
            <div className={styles.warningBox}>
              <strong>Coste veterinario de urgencia:</strong> una operación de urgencia puede costar tanto como varios meses de manutención, y no es un caso raro: en la encuesta de la OCU de 2022, el 45&nbsp;% de los dueños de perro y el 24&nbsp;% de los de gato tuvieron que llevarlo a urgencias en el último año. Un seguro de salud para mascotas (su precio depende de la especie, la edad y la cobertura) u otra forma de prever ese gasto puede evitar una situación económica difícil.
            </div>

            <h3>Adopción vs compra</h3>
            <p>Las protectoras y refugios tienen perros y gatos de todas las edades esperando familia. Adoptar suele ser gratuito o tener una tasa reducida, los animales llegan normalmente vacunados, desparasitados y a menudo esterilizados, y el proceso incluye un filtro de idoneidad.</p>
            <p>Comprar a un criador registrado tiene sentido si buscas una raza específica por razones concretas (tamaño muy específico, perro de trabajo). Ninguna raza de perro o gato está libre de alérgenos: si en casa hay alergia, consulta con el alergólogo antes de elegir. Evita siempre los anuncios de particulares sin garantías.</p>

            <h3>Obligaciones legales: el ejemplo de España</h3>
            <p>En España, la Ley 7/2023, de 28 de marzo, de protección de los derechos y el bienestar de los animales (BOE-A-2023-7936), obliga a identificar a los gatos con microchip y a esterilizarlos antes de los seis meses, salvo los inscritos como reproductores (art. 26.i); para los perros no impone la esterilización, pero sí evitar su reproducción incontrolada (art. 26.d). Los perros potencialmente peligrosos necesitan licencia municipal (Ley 50/1999). El abandono en condiciones que pongan en peligro la vida o la integridad del animal es delito (art. 340 ter del Código Penal, reformado por la LO 3/2023), castigado con multa de uno a seis meses o trabajos en beneficio de la comunidad; la prisión de hasta 18 meses corresponde al maltrato (art. 340 bis). En otros países, las obligaciones las fija su propia legislación de bienestar animal.</p>

            <h3>Mascotas y alquiler</h3>
            <p>En España, la Ley de Arrendamientos Urbanos (Ley 29/1994) no regula las mascotas y la Ley 7/2023 no la modificó: una cláusula del contrato que prohíba tener animales es válida, y no respetarla puede ser motivo para resolver el contrato. Si el contrato no dice nada, en general no se puede impedir tener un animal de compañía, aunque respondes de los daños que cause en la vivienda. En otros países la regla cambia, así que lee tu contrato y la ley de arrendamientos de tu país, y habla con el propietario antes de adoptar.</p>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-mascota')} />
      <ShareCard appName="selector-mascota" />
      <Footer appName="selector-mascota" />
    </div>
  );
}
