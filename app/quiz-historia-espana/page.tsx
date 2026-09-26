'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './QuizHistoriaEspana.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { formatPercentage } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  PREGUNTAS_HISTORIA,
  PREGUNTAS_FACIL,
  PREGUNTAS_MEDIO,
  PREGUNTAS_DIFICIL,
  CONFIG_DIFICULTAD,
  type DificultadHistoria,
  type EpocaHistoria,
  type PreguntaHistoria,
} from '@/data/preguntas-historia-espana';

type Fase = 'inicio' | 'jugando' | 'respondida' | 'fin';

const DISPLAY_DIFICULTAD: Record<DificultadHistoria, { emoji: string; nombre: string; descripcion: string }> = {
  facil:   { emoji: '🌱', nombre: 'Fácil', descripcion: 'Hechos clave y fechas principales' },
  medio:   { emoji: '📚', nombre: 'Medio', descripcion: 'Personajes, causas y consecuencias' },
  dificil: { emoji: '🏆', nombre: 'Difícil', descripcion: 'Detalles, política y cultura' },
};

// Record<EpocaHistoria, …>: una época nueva en el banco sin etiqueta aquí no compila.
// «Llegada a América» en vez de «Descubrimiento» a secas (hallazgo 2121, antipatrón 8 de
// neutralidad): la explicación del 12 de octubre da el contexto de conquista y colonización.
const ETIQUETA_EPOCA: Record<EpocaHistoria, string> = {
  'prerromana-romana': 'Épocas Prerromana y Romana',
  'visigoda': 'Época Visigoda',
  'al-andalus-reconquista': 'Al-Ándalus y Reconquista',
  'reyes-catolicos-descubrimiento': 'Reyes Católicos y llegada a América',
  'habsburgos': 'Siglo XVI-XVII (Habsburgos)',
  'borbones-siglo-xviii': 'Siglo XVIII (Borbones)',
  'siglo-xix': 'Siglo XIX',
  'alfonso-xiii': 'Reinado de Alfonso XIII',
  'republica-guerra-civil': 'República y Guerra Civil',
  'franquismo-transicion': 'Franquismo y Transición',
  'democracia': 'Democracia (desde 1978)',
};

const TOTAL_EPOCAS = new Set(PREGUNTAS_HISTORIA.map(p => p.epoca)).size;

const BANCO_POR_NIVEL: Record<DificultadHistoria, PreguntaHistoria[]> = {
  facil: PREGUNTAS_FACIL,
  medio: PREGUNTAS_MEDIO,
  dificil: PREGUNTAS_DIFICIL,
};

/** Hueco que deja arriba la barra fija del logo; igual que el scroll-margin-top del CSS. */
const MARGEN_LOGO = 88;

/**
 * Lleva `bloque` al principio de la pantalla (respetando su scroll-margin-top) solo si su
 * cabecera queda tapada por la barra del logo o por encima del borde, o si `clave` no cabe
 * por abajo. Patrón de quiz-literatura-universal (hallazgo 1716).
 */
function traerALaVista(bloque: HTMLElement | null, clave: HTMLElement | null) {
  if (!bloque || !clave) return;
  const arriba = bloque.getBoundingClientRect().top;
  const abajo = clave.getBoundingClientRect().bottom;
  if (arriba >= MARGEN_LOGO && abajo <= window.innerHeight) return;
  bloque.scrollIntoView({ block: 'start', behavior: 'auto' });
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Cada nivel saca sus preguntas de SU banco (CONFIG_DIFICULTAD[n].pool). Antes «Difícil»
 * barajaba el banco entero y de media solo 5 de sus 20 preguntas eran difíciles (hallazgo 2103).
 */
function seleccionarPreguntas(dificultad: DificultadHistoria): PreguntaHistoria[] {
  const cfg = CONFIG_DIFICULTAD[dificultad];
  return mezclar(BANCO_POR_NIVEL[cfg.pool]).slice(0, cfg.preguntas);
}

function calcularMedalla(porcentaje: number): string {
  if (porcentaje >= 90) return '🥇';
  if (porcentaje >= 70) return '🥈';
  if (porcentaje >= 50) return '🥉';
  return '📚';
}

function calcularTextoMedalla(porcentaje: number): string {
  if (porcentaje >= 90) return '¡Experto en Historia de España!';
  if (porcentaje >= 70) return 'Gran conocedor de la historia';
  if (porcentaje >= 50) return 'Nivel intermedio';
  return 'Sigue aprendiendo';
}

const LETRAS = ['A', 'B', 'C', 'D'];

export default function QuizHistoriaEspanaPage() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [dificultad, setDificultad] = useState<DificultadHistoria>('medio');
  const [preguntas, setPreguntas] = useState<PreguntaHistoria[]>([]);
  const [indice, setIndice] = useState(0);
  const [opcionesOrdenadas, setOpcionesOrdenadas] = useState<string[]>([]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState<Array<{ pregunta: string; correcta: string }>>([]);

  const preguntaActual = preguntas[indice];

  /**
   * Foco y vista (hallazgos 2104 y 2105). En los tres pasos de la partida el control pulsado
   * desaparece o queda disabled y el navegador soltaba el foco al <body>:
   * · al empezar y al pasar de pregunta → al enunciado nuevo (lo lee el lector de pantalla) y,
   *   si la cabecera de la pregunta queda bajo la barra fija del logo o fuera, la vista sube;
   * · al responder → a «Siguiente pregunta», la única acción que queda;
   * · al ver el resultado → al título; al volver a elegir dificultad → a «Comenzar quiz».
   */
  const quizPanelRef = useRef<HTMLDivElement>(null);
  const enunciadoRef = useRef<HTMLHeadingElement>(null);
  const botonSiguienteRef = useRef<HTMLButtonElement>(null);
  const finPanelRef = useRef<HTMLDivElement>(null);
  const finTituloRef = useRef<HTMLHeadingElement>(null);
  const botonComenzarRef = useRef<HTMLButtonElement>(null);
  const huboPartida = useRef(false);
  useEffect(() => {
    if (fase === 'jugando') {
      huboPartida.current = true;
      traerALaVista(quizPanelRef.current, enunciadoRef.current);
      enunciadoRef.current?.focus({ preventScroll: true });
    } else if (fase === 'respondida') {
      botonSiguienteRef.current?.focus({ preventScroll: true });
    } else if (fase === 'fin') {
      traerALaVista(finPanelRef.current, finTituloRef.current);
      finTituloRef.current?.focus({ preventScroll: true });
    } else if (fase === 'inicio' && huboPartida.current) {
      botonComenzarRef.current?.focus();
    }
  }, [fase, indice]);

  const iniciarQuiz = useCallback(() => {
    const seleccionadas = seleccionarPreguntas(dificultad);
    setPreguntas(seleccionadas);
    setIndice(0);
    setOpcionesOrdenadas(mezclar(seleccionadas[0]?.opciones ?? []));
    setSeleccionada(null);
    setAciertos(0);
    setErrores([]);
    setFase('jugando');
  }, [dificultad]);

  const responder = useCallback((opcion: string) => {
    if (fase !== 'jugando' || !preguntaActual) return;
    setSeleccionada(opcion);
    const esCorrecta = opcion === preguntaActual.correcta;
    if (esCorrecta) {
      setAciertos(prev => prev + 1);
    } else {
      setErrores(prev => [...prev, { pregunta: preguntaActual.pregunta, correcta: preguntaActual.correcta }]);
    }
    setFase('respondida');
  }, [fase, preguntaActual]);

  const siguiente = useCallback(() => {
    const siguienteIndice = indice + 1;
    if (siguienteIndice >= preguntas.length) {
      setFase('fin');
    } else {
      setIndice(siguienteIndice);
      setOpcionesOrdenadas(mezclar(preguntas[siguienteIndice].opciones));
      setSeleccionada(null);
      setFase('jugando');
    }
  }, [indice, preguntas]);

  const reiniciar = useCallback(() => {
    setFase('inicio');
    setPreguntas([]);
    setIndice(0);
    setSeleccionada(null);
    setAciertos(0);
    setErrores([]);
  }, []);

  const porcentaje = useMemo(() => {
    if (preguntas.length === 0) return 0;
    return Math.round((aciertos / preguntas.length) * 100);
  }, [aciertos, preguntas.length]);
  /** «70 %» con espacio duro (regla del 25/09/2026, hallazgo 2123). */
  const porcentajeTexto = formatPercentage(porcentaje / 100, 0);
  const acierto = fase === 'respondida' && seleccionada === preguntaActual?.correcta;

  const claseOpcion = (opcion: string) => {
    if (fase !== 'respondida') return '';
    if (opcion === preguntaActual?.correcta) return styles['opcion-correcta'];
    if (opcion === seleccionada && opcion !== preguntaActual?.correcta) return styles['opcion-seleccionada-mal'];
    return styles['opcion-neutral'];
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏛️</div>
        <h1 className={styles.title}>Quiz Historia de España</h1>
        <p className={styles.subtitle}>Desde los íberos hasta la Constitución de 1978 y la democracia</p>
        <div className={styles.heroBadges}>
          <span>{PREGUNTAS_HISTORIA.length} preguntas</span>
          <span>3 niveles de dificultad</span>
          <span>{TOTAL_EPOCAS} épocas históricas</span>
        </div>
      </header>

      <LegalNotice />

      {/* FASE INICIO */}
      {fase === 'inicio' && (
        <div className={styles.inicioPanel}>
          <section>
            <div className={styles.configSection}>
              <p className={styles.configTitulo}>Selecciona la dificultad</p>
              <div className={styles.difGrid}>
                {(['facil', 'medio', 'dificil'] as DificultadHistoria[]).map(d => {
                  const cfg = CONFIG_DIFICULTAD[d];
                  const display = DISPLAY_DIFICULTAD[d];
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={dificultad === d}
                      className={`${styles.difCard} ${dificultad === d ? styles.difActivo : ''}`}
                      onClick={() => setDificultad(d)}
                    >
                      <span className={styles.difEmoji} aria-hidden="true">{display.emoji}</span>
                      <strong>{display.nombre}</strong>
                      <span>{cfg.preguntas} preguntas</span>
                      <span>{display.descripcion}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.configSection}>
              <p className={styles.configTitulo}>Elige el modo de juego</p>
              <div className={styles.modoGrid}>
                <div className={`${styles.modoCard} ${styles.modoActivo}`}>
                  <span className={styles.modoIcono} aria-hidden="true">📖</span>
                  <strong>Modo Aprendizaje</strong>
                  <span>Ves la explicación tras cada respuesta</span>
                </div>
              </div>
            </div>

            <button type="button" className={styles.btnIniciar} onClick={iniciarQuiz} ref={botonComenzarRef}>
              Comenzar quiz <span aria-hidden="true">▶</span>
            </button>
          </section>
        </div>
      )}

      {/* FASE JUGANDO / RESPONDIDA */}
      {(fase === 'jugando' || fase === 'respondida') && preguntaActual && (
        <div className={styles.quizPanel} ref={quizPanelRef}>
          {/* Progreso */}
          <div className={styles.progresoBarra}>
            <div className={styles.progresoInfo}>
              <span>Pregunta {indice + 1} de {preguntas.length}</span>
              <span>{aciertos} {aciertos === 1 ? 'correcta' : 'correctas'}</span>
            </div>
            <div
              className={styles.progresoTrack}
              role="progressbar"
              aria-label={`Progreso: pregunta ${indice + 1} de ${preguntas.length}`}
              aria-valuenow={(indice + 1)}
              aria-valuemin={1}
              aria-valuemax={preguntas.length}
            >
              <div
                className={styles.progresoFill}
                style={{ width: `${((indice + 1) / preguntas.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.preguntaCard}>
            <span className={styles.epocaBadge}>{ETIQUETA_EPOCA[preguntaActual.epoca] ?? preguntaActual.epoca}</span>
            {/* Recibe el foco por programa al empezar y al pasar de pregunta (tabIndex=-1). */}
            <h2 className={styles.preguntaTexto} ref={enunciadoRef} tabIndex={-1}>{preguntaActual.pregunta}</h2>
          </div>

          {/* Opciones */}
          <div className={styles.opcionesGrid} role="group" aria-label="Opciones de respuesta">
            {opcionesOrdenadas.map((opcion, i) => (
              <button
                key={opcion}
                type="button"
                className={`${styles.opcionBtn} ${claseOpcion(opcion)}`}
                onClick={() => responder(opcion)}
                disabled={fase === 'respondida'}
              >
                <span className={styles.opcionLetra} aria-hidden="true">{LETRAS[i]}</span>
                <span className={styles.opcionTexto}>{opcion}</span>
              </button>
            ))}
          </div>

          {/* Feedback — la región viva existe desde el principio (una región que nace ya con
              contenido no siempre se anuncia) y abarca solo el veredicto y la explicación: el
              botón queda fuera y los emojis van aria-hidden (hallazgo 2108). */}
          <div className={styles.feedbackPanel} role="status" aria-live="polite" aria-atomic="true">
            {fase === 'respondida' && (
              <>
                <div className={`${styles.feedbackMensaje} ${acierto ? styles.feedbackOk : styles.feedbackFail}`}>
                  {acierto ? (
                    <><span aria-hidden="true">✅</span> ¡Correcto!</>
                  ) : (
                    <><span aria-hidden="true">❌</span> Incorrecto. La respuesta correcta es: «{preguntaActual.correcta}»</>
                  )}
                </div>
                {preguntaActual.explicacion && (
                  <p className={styles.explicacionTexto}>{preguntaActual.explicacion}</p>
                )}
              </>
            )}
          </div>
          {fase === 'respondida' && (
            <button type="button" className={styles.btnSiguiente} onClick={siguiente} ref={botonSiguienteRef}>
              {indice + 1 < preguntas.length ? 'Siguiente pregunta →' : 'Ver resultado'}
            </button>
          )}
        </div>
      )}

      {/* FASE FIN */}
      {fase === 'fin' && (
        <div className={styles.finPanel} ref={finPanelRef}>
          <div className={styles.medallaIcon} aria-hidden="true">{calcularMedalla(porcentaje)}</div>
          <h2 className={styles.finTitulo} ref={finTituloRef} tabIndex={-1}>{calcularTextoMedalla(porcentaje)}</h2>
          <p className={styles.finSubtitulo}>{aciertos} de {preguntas.length} preguntas correctas ({porcentajeTexto})</p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{aciertos}</span>
              <span className={styles.statLabel}>Correctas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{preguntas.length - aciertos}</span>
              <span className={styles.statLabel}>Errores</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{porcentajeTexto}</span>
              <span className={styles.statLabel}>Puntuación</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{preguntas.length}</span>
              <span className={styles.statLabel}>Jugadas</span>
            </div>
          </div>

          {errores.length > 0 && (
            <div className={styles.erroresSection}>
              <h3 className={styles.erroresTitulo}>Preguntas que has fallado</h3>
              <div className={styles.erroresGrid}>
                {errores.map((e, i) => (
                  <div key={i} className={styles.errorItem}>
                    <span className={styles.errorPregunta}>{e.pregunta}</span>
                    <span className={styles.errorCorrecta}>✓ {e.correcta}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.finBotones}>
            <button type="button" className={styles.btnIniciar} onClick={iniciarQuiz}>
              Jugar de nuevo
            </button>
            <button type="button" className={styles.btnSecundario} onClick={reiniciar}>
              Cambiar dificultad
            </button>
          </div>
        </div>
      )}

      <EducationalSection
        title="Historia de España: guía de estudio"
        subtitle="Repasa las épocas clave de la historia española"
      >
        {/* Tabla cronológica */}
        <section className={styles.guideSection}>
          <h2>Línea cronológica: épocas de la Historia de España</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Época</th>
                  <th>Período</th>
                  <th>Hechos clave</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Prerromana y Romana</td>
                  <td>218 a.C. – 476 d.C.</td>
                  <td>Íberos, celtas, cartagineses. Romanización: Hispania como provincia romana.</td>
                </tr>
                <tr>
                  <td>Época Visigoda</td>
                  <td>418 – 711</td>
                  <td>Reinos visigodos. Conversión al catolicismo (Recaredo, 587). Concilios de Toledo.</td>
                </tr>
                <tr>
                  <td>Al-Ándalus y Reconquista</td>
                  <td>711 – 1492</td>
                  <td>Invasión árabe. Califato de Córdoba. Reconquista cristiana. Batalla de las Navas (1212).</td>
                </tr>
                <tr>
                  <td>Reyes Católicos y llegada a América</td>
                  <td>1469 – 1516</td>
                  <td>Unión dinástica de Castilla y Aragón. Toma de Granada y expulsión de los judíos (1492). Llegada de Colón a América (1492) e inicio de la conquista y colonización.</td>
                </tr>
                <tr>
                  <td>Habsburgos (siglos XVI-XVII)</td>
                  <td>1516 – 1700</td>
                  <td>Carlos I y Felipe II. Conquista de los imperios azteca e inca. Primera vuelta al mundo (1519-1522). Gran Armada, la «Invencible» (1588). Siglo de Oro.</td>
                </tr>
                <tr>
                  <td>Borbones (siglo XVIII)</td>
                  <td>1700 – 1808</td>
                  <td>Guerra de Sucesión. Reformas borbónicas. Ilustración española.</td>
                </tr>
                <tr>
                  <td>Siglo XIX</td>
                  <td>1808 – 1902</td>
                  <td>Guerra de la Independencia. Constitución de 1812. Carlismo. Restauración (1874). Pérdida de Cuba, Puerto Rico y Filipinas (1898).</td>
                </tr>
                <tr>
                  <td>Reinado de Alfonso XIII</td>
                  <td>1902 – 1931</td>
                  <td>Semana Trágica (1909). Mancomunitat de Catalunya (1914). Desastre de Annual (1921). Dictadura de Primo de Rivera (1923-1930).</td>
                </tr>
                <tr>
                  <td>República y Guerra Civil</td>
                  <td>1931 – 1939</td>
                  <td>II República (1931). Frente Popular. Guerra Civil (1936-1939). Victoria franquista.</td>
                </tr>
                <tr>
                  <td>Franquismo y Transición</td>
                  <td>1939 – 1978</td>
                  <td>Dictadura de Franco. Tecnocracia y desarrollo económico. Transición democrática. Constitución (1978).</td>
                </tr>
                <tr>
                  <td>Democracia</td>
                  <td>desde 1978</td>
                  <td>Intento de golpe del 23-F (1981). Ingreso en la CEE (1986). Juegos de Barcelona y Expo de Sevilla (1992). El euro (1999; billetes y monedas en 2002).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios / perfiles */}
        <section className={styles.guideSection}>
          <h2>¿Para qué sirve dominar la Historia de España?</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📝</span>
              <h3>Oposiciones</h3>
              <p>Muchas oposiciones incluyen temario de historia. Dominar cronología, personajes y eventos es imprescindible para Administración, Educación o Fuerzas Armadas.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎓</span>
              <h3>Selectividad y exámenes de admisión</h3>
              <p>Historia de España es materia troncal en 2º de Bachillerato y en la EvAU/ABAU. También es útil para estudiantes de preparatoria o secundaria en Hispanoamérica que repasan historia de España de cara a un examen de admisión universitaria. Los temas de este quiz son los más habituales en los exámenes.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🌍</span>
              <h3>Ciudadanía y cultura general</h3>
              <p>Entender la historia permite interpretar el presente: las autonomías, los partidos políticos, las tensiones territoriales tienen raíces históricas concretas.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎮</span>
              <h3>Concursos y trivial</h3>
              <p>La historia española es fuente habitual de preguntas en programas como Saber y Ganar, trivials y concursos de cultura general.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre la Historia de España</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Cuándo se puede considerar que "nace" España como nación?</h3>
              <p>Es un debate historiográfico. La unión dinástica de los Reyes Católicos (1479) suele citarse como hito clave, aunque la unidad administrativa real no se consolidó hasta los Borbones en el siglo XVIII con los Decretos de Nueva Planta.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué fue el Siglo de Oro español?</h3>
              <p>Período de máximo esplendor cultural y literario de España, aproximadamente entre 1492 y 1681. Abarca desde los Reyes Católicos hasta la muerte de Calderón de la Barca. Cervantes, Lope de Vega, Velázquez y Quevedo son sus máximos representantes.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué perdió España en 1898?</h3>
              <p>Tras la guerra de independencia cubana (desde 1895) y la intervención de Estados Unidos, el Tratado de París (10/12/1898) obligó a España a renunciar a la soberanía sobre Cuba y a ceder a Estados Unidos Puerto Rico, Guam y Filipinas. Al año siguiente vendió a Alemania las Carolinas, las Marianas y Palaos, y conservó territorios en África hasta el siglo XX. El «Desastre del 98» abrió una profunda crisis política e intelectual.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué fue la Transición española?</h3>
              <p>Período (1975-1978) tras la muerte de Franco en que España pasó de la dictadura a la democracia. Destacan la Ley para la Reforma Política (1976), las primeras elecciones democráticas (1977) y la Constitución de 1978, aprobada en referéndum.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto duró la dominación árabe en España?</h3>
              <p>Desde la invasión árabe-bereber en 711 hasta la toma de Granada en 1492, la presencia islámica en la Península duró casi 800 años. Sin embargo, la Reconquista cristiana fue progresiva y el dominio árabe nunca fue total ni uniforme.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué establece la Constitución de 1978?</h3>
              <p>La Constitución española de 1978 establece un Estado social y democrático de derecho, con monarquía parlamentaria. Reconoce la soberanía popular, los derechos fundamentales y la organización territorial en Comunidades Autónomas.</p>
            </div>
          </div>
        </section>

        {/* Guía para estudiar */}
        <section className={styles.guideSection}>
          <h2>Cómo estudiar Historia de España eficazmente: 6 pasos</h2>
          <div className={styles.stepsGrid}>
            {[
              { n: '1', titulo: 'Domina la cronología básica', desc: 'Aprende primero las fechas clave: 711, 1492, 1808, 1898, 1931, 1936, 1975, 1978. Estas son el esqueleto de todo lo demás.' },
              { n: '2', titulo: 'Estudia causa-efecto, no solo fechas', desc: 'Entender por qué ocurrió algo (causas) y qué consecuencias tuvo es más útil que memorizar años. El examinador valora el análisis.' },
              { n: '3', titulo: 'Usa mapas históricos', desc: 'Los mapas de la Reconquista, el Imperio español o la Guerra Civil ayudan a visualizar procesos que son difíciles de entender solo con texto.' },
              { n: '4', titulo: 'Repasa con preguntas tipo test', desc: 'El test es la forma más eficiente de detectar lagunas. Haz tests como este después de estudiar cada época para afianzar lo aprendido.' },
              { n: '5', titulo: 'Lee comentarios de textos históricos', desc: 'Para Selectividad y oposiciones, practica el comentario de fuentes primarias (discursos, leyes, proclamas). Es una habilidad diferente a memorizar.' },
              { n: '6', titulo: 'Relaciona épocas entre sí', desc: 'La historia no son compartimentos estancos. Ver cómo la crisis del 98 alimenta el regeneracionismo, o cómo la crisis de la Restauración desemboca en la dictadura de Primo de Rivera y la II República, te da una visión global.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
                <h3>{s.titulo}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>6 datos curiosos de la Historia de España</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '🏺', titulo: 'Los íberos no eran un pueblo único', desc: 'Los "íberos" era el nombre que los griegos y romanos daban a los pueblos de la costa mediterránea. En realidad eran grupos distintos con lenguas y culturas propias.' },
              { icon: '🕌', titulo: 'Córdoba, una de las grandes ciudades de Europa', desc: 'En el siglo X, Córdoba, capital del Califato, fue una de las ciudades más populosas del mundo. Las crónicas de la época le atribuyen calles iluminadas y numerosas bibliotecas, aunque sus cifras exactas se discuten.' },
              { icon: '⛵', titulo: 'La Armada «Invencible» no se llamaba así', desc: 'Su nombre oficial era "Grande y Felicísima Armada" y los historiadores suelen llamarla Gran Armada. El sobrenombre de "Invencible" se popularizó después, con ironía, tras su fracaso en 1588.' },
              { icon: '📜', titulo: 'La Constitución de Cádiz (1812)', desc: 'Conocida como "La Pepa" (promulgada el 19 de marzo, día de San José), fue una de las más liberales de su tiempo. Sin embargo, Fernando VII la abolió en 1814.' },
              { icon: '🎭', titulo: 'Picasso pintó el Guernica pensando en España', desc: 'Picasso pintó el Guernica en 1937 como respuesta al bombardeo de la ciudad vasca durante la Guerra Civil. La obra permaneció fuera de España hasta 1981.' },
              { icon: '🗳️', titulo: 'El referéndum de 1978', desc: `La Constitución de 1978 fue aprobada en referéndum el 6 de diciembre con el ${formatPercentage(0.879, 1)} de votos afirmativos y una participación del ${formatPercentage(0.671, 1)}. Es la norma fundamental de la democracia española actual.` },
            ].map(t => (
              <div key={t.icon} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{t.icon}</span>
                <h3>{t.titulo}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <section className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Sobre el contenido de este quiz</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'Las preguntas cubren hechos históricos verificables', desc: 'Todas las preguntas están basadas en hechos históricos contrastados y fuentes académicas. Se han evitado preguntas de interpretación o valoración ideológica.' },
              { titulo: 'La historia es compleja y tiene matices', desc: 'Por razones de formato (test de 4 opciones), las respuestas son simplificaciones. La historia real tiene más matices, causas múltiples y debates historiográficos.' },
              { titulo: 'El grueso del quiz llega hasta 1978', desc: 'La mayoría de las preguntas cubren desde la época prerromana hasta la Constitución de 1978. Un bloque breve, «Democracia (desde 1978)», repasa algunos hitos posteriores (23-F, ingreso en la CEE, 1992, el euro), pero no es un repaso completo de la historia reciente.' },
              { titulo: 'Para estudio oficial, consulta fuentes académicas', desc: 'Para oposiciones o Selectividad, complementa este quiz con los temarios oficiales y libros de texto aprobados por las autoridades educativas.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-historia-espana')} />
      <ShareCard appName="quiz-historia-espana" />
      <Footer appName="quiz-historia-espana" />
    </div>
  );
}
