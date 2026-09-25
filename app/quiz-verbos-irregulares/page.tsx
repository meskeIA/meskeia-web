'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './QuizVerbosIrregulares.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import EducationalSection from '@/components/EducationalSection';
import { formatPercentage } from '@/lib';
import { verbosIrregulares, VerboIrregular } from '@/data/verbos-irregulares';

type Nivel = 'A1' | 'A2' | 'B1' | 'B2' | 'todos';
type Pantalla = 'config' | 'quiz' | 'resultado';

interface PreguntaQuiz {
  verbo: VerboIrregular;
  opciones: string[];
  respuestaCorrecta: string;
}

/**
 * Verbos que el quiz PREGUNTA en cada nivel: `show` queda fuera del sorteo (hallazgo 316).
 * Todas las cifras de tamaño salen de aquí: la tarjeta de B1 decía «20 verbos» y el aviso de
 * debajo «tiene 19», y la guía y «Todos los niveles» prometían 75 cuando se preguntan 74
 * (hallazgo 1840).
 */
function preguntablesDe(nivel: Nivel): VerboIrregular[] {
  const pool = nivel === 'todos' ? verbosIrregulares : verbosIrregulares.filter(v => v.level === nivel);
  return pool.filter(v => !v.pastSimpleRegular);
}

const TOTAL_PREGUNTABLES = preguntablesDe('todos').length;

// Emoji y rótulo separados: dentro de la misma cadena el lector de pantalla lee «círculo
// verde A1 Básico» y el candado check:a11y-jsx no puede verlo, porque viene de una constante
// y no de texto JSX (hallazgo 317).
const NIVEL_CONFIG: Record<Nivel, { emoji: string; label: string; desc: string }> = {
  A1:    { emoji: '🟢', label: 'A1 Básico',          desc: `${preguntablesDe('A1').length} verbos esenciales` },
  A2:    { emoji: '🟡', label: 'A2 Elemental',       desc: `${preguntablesDe('A2').length} verbos frecuentes` },
  B1:    { emoji: '🟠', label: 'B1 Intermedio',      desc: `${preguntablesDe('B1').length} verbos habituales` },
  B2:    { emoji: '🔴', label: 'B2 Avanzado',        desc: `${preguntablesDe('B2').length} verbos complejos`  },
  todos: { emoji: '⭐', label: 'Todos los niveles',  desc: `${TOTAL_PREGUNTABLES} verbos`  },
};

const OPCIONES_PREGUNTAS = [10, 15, 20];
const LETRAS = ['A', 'B', 'C', 'D'];

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Cuatro opciones: la correcta, el INFINITIVO del verbo y distractores del nivel.
 *
 * El infinitivo va siempre. Antes solo aparecía cuando era la respuesta —en los A-A-A (put,
 * cut, hurt, read)—, así que la única opción idéntica a la palabra de la pregunta era la buena
 * y la forma la delataba. Ahora está en todas: en los A-A-A es la correcta y en el resto es
 * el distractor clásico de quien no sabe que el verbo cambia (sospecha anotada en la
 * re-inspección del 25/09/2026).
 */
function generarOpciones(correcto: string, infinitivo: string, pool: string[]): string[] {
  const fijos = infinitivo !== correcto ? [infinitivo] : [];
  const incorrectos = mezclar(pool.filter(o => o !== correcto && o !== infinitivo)).slice(0, 3 - fijos.length);
  return mezclar([correcto, ...fijos, ...incorrectos]);
}

/**
 * Past simple que se PREGUNTA de un verbo.
 *
 * Para `be` no es «was / were»: esa era la única respuesta con barra de los 75, así que se
 * acertaba —y se descartaba como distractor— sin saber nada del verbo, solo por la forma de
 * la cadena (hallazgo 316). Se pregunta la forma de singular, que además es unívoca, y el
 * enunciado lo dice.
 */
function respuestaDe(verbo: VerboIrregular): string {
  return verbo.infinitive === 'be' ? 'was' : verbo.pastSimple;
}

/** Matiz que el enunciado añade cuando el past simple depende de la persona. */
function matizDelEnunciado(verbo: VerboIrregular): string {
  return verbo.infinitive === 'be' ? ' (con I, he, she, it)' : '';
}

function generarPreguntas(nivel: Nivel, numPreguntas: number): PreguntaQuiz[] {
  // `show` sale del sorteo: su past simple «showed» es regular, es el único en -ed de los 75
  // y se reconocía sin saber el verbo (es irregular solo en el participio: shown).
  const preguntables = preguntablesDe(nivel);

  const seleccionados = mezclar(preguntables).slice(0, Math.min(numPreguntas, preguntables.length));
  // Los distractores salen del MISMO conjunto: si «showed» apareciera de distractor, se
  // descartaría igual de gratis que cuando era la respuesta.
  const poolRespuestas = preguntables.map(respuestaDe);

  return seleccionados.map(verbo => {
    const correcta = respuestaDe(verbo);
    const opciones = generarOpciones(correcta, verbo.infinitive, poolRespuestas);
    return { verbo, opciones, respuestaCorrecta: correcta };
  });
}

/** Hueco que deja arriba la barra del logo fijo; igual que el scroll-margin-top del CSS. */
const MARGEN_LOGO = 88;

/**
 * Lleva `bloque` al principio de la pantalla (respetando su scroll-margin-top) solo si `clave`
 * no se ve entera: tapada por el logo fijo, por encima del borde o por debajo del final.
 * Mismo patrón que quiz-literatura-universal y quiz-simbolos-quimicos.
 */
function traerALaVista(bloque: HTMLElement | null, clave: HTMLElement | null) {
  if (!bloque || !clave) return;
  const r = clave.getBoundingClientRect();
  if (r.top >= MARGEN_LOGO && r.bottom <= window.innerHeight) return;
  bloque.scrollIntoView({ block: 'start', behavior: 'auto' });
}

function calcularPuntuacion(correctas: number, total: number): number {
  const pct = correctas / total;
  if (pct >= 0.9) return 100;
  if (pct >= 0.7) return Math.round(60 + (pct - 0.7) / 0.2 * 40);
  if (pct >= 0.5) return Math.round(40 + (pct - 0.5) / 0.2 * 20);
  return Math.round(pct * 80);
}

function getResultadoTexto(pct: number): { emoji: string; titulo: string } {
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Dominas el inglés!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy buena puntuación!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue practicando' };
}

export default function QuizVerbosIrregularesPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [nivel, setNivel] = useState<Nivel>('A2');
  const [numPreguntas, setNumPreguntas] = useState(15);
  const [preguntas, setPreguntas] = useState<PreguntaQuiz[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [correctas, setCorrectas] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState<number>(0);
  const [tiempoTotal, setTiempoTotal] = useState<number>(0);

  const pregunta = preguntas[preguntaActual];
  const totalPreguntas = preguntas.length;
  const esUltima = preguntaActual === totalPreguntas - 1;
  /** Preguntas ya contestadas, contando la actual en cuanto se responde. */
  const respondidas = preguntaActual + (seleccionada !== null ? 1 : 0);
  /** Verbos PREGUNTABLES del nivel elegido: el techo real de la partida. */
  const verbosDelNivel = useMemo(() => preguntablesDe(nivel).length, [nivel]);

  /**
   * Foco y vista (hallazgos 1834 y 1835, la forma del 1812/1813 de quiz-simbolos-quimicos).
   * · Al responder, la opción pulsada queda `disabled` y el foco caía al <body>: se lleva a
   *   «Siguiente», la única acción que queda.
   * · Al pulsar «Siguiente» ese botón se desmonta con el feedback y el foco caía al <body>,
   *   por DETRÁS del quiz (el primer Tab iba a «Ver Guía Completa»). Ahora va a la tarjeta de
   *   la pregunta nueva, y el Tab siguiente cae en la opción A.
   * · En móvil, al avanzar o al empezar la pregunta quedaba bajo el logo fijo o por encima del
   *   borde: si la tarjeta no se ve entera, la vista sube al principio del quiz (HUD incluido).
   *   Igual con el resultado, que además recibe el foco para que el lector lo lea.
   * · Al volver a la configuración desde el resultado, el foco va a su título.
   */
  const quizPanelRef = useRef<HTMLDivElement>(null);
  const preguntaRef = useRef<HTMLDivElement>(null);
  const botonSiguienteRef = useRef<HTMLButtonElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null);
  const tituloConfigRef = useRef<HTMLHeadingElement>(null);
  const vieneDelResultado = useRef(false);

  useEffect(() => {
    if (pantalla === 'quiz') {
      if (seleccionada !== null) {
        botonSiguienteRef.current?.focus();
      } else {
        traerALaVista(quizPanelRef.current, preguntaRef.current);
        preguntaRef.current?.focus({ preventScroll: true });
      }
    } else if (pantalla === 'resultado') {
      traerALaVista(resultadoRef.current, resultadoRef.current);
      resultadoRef.current?.focus({ preventScroll: true });
    } else if (pantalla === 'config' && vieneDelResultado.current) {
      vieneDelResultado.current = false;
      tituloConfigRef.current?.focus();
    }
  }, [pantalla, preguntaActual, seleccionada]);

  const iniciarQuiz = useCallback(() => {
    const nuevasPreguntas = generarPreguntas(nivel, numPreguntas);
    setPreguntas(nuevasPreguntas);
    setPreguntaActual(0);
    setSeleccionada(null);
    setCorrectas(0);
    setTiempoInicio(Date.now());
    setPantalla('quiz');
  }, [nivel, numPreguntas]);

  const responder = useCallback((opcion: string) => {
    if (seleccionada !== null) return;
    setSeleccionada(opcion);
    if (opcion === pregunta.respuestaCorrecta) {
      setCorrectas(prev => prev + 1);
    }
  }, [seleccionada, pregunta]);

  const siguiente = useCallback(() => {
    if (esUltima) {
      setTiempoTotal(Math.round((Date.now() - tiempoInicio) / 1000));
      setPantalla('resultado');
    } else {
      setPreguntaActual(prev => prev + 1);
      setSeleccionada(null);
    }
  }, [esUltima, tiempoInicio]);

  const reiniciar = useCallback(() => { iniciarQuiz(); }, [iniciarQuiz]);
  const volverConfig = useCallback(() => {
    vieneDelResultado.current = true;
    setPantalla('config');
  }, []);

  const puntuacion = useMemo(
    () => calcularPuntuacion(correctas, totalPreguntas),
    [correctas, totalPreguntas]
  );

  const resultadoTexto = useMemo(
    () => getResultadoTexto(totalPreguntas > 0 ? correctas / totalPreguntas : 0),
    [correctas, totalPreguntas]
  );

  const formatTiempo = (seg: number): string => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Quiz Verbos Irregulares <span aria-hidden="true">📝</span></h1>
        <p className={styles.subtitle}>
          Aprende el Past Simple en inglés de forma interactiva · Niveles A1 a B2
        </p>
      </header>

      <LegalNotice />

      {/* ── PANTALLA CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <div className={styles.configPanel}>
          <h2 className={styles.configTitle} ref={tituloConfigRef} tabIndex={-1}>Elige tu nivel</h2>

          <div className={styles.nivelGrid}>
            {(Object.entries(NIVEL_CONFIG) as [Nivel, typeof NIVEL_CONFIG[Nivel]][]).map(([key, cfg]) => (
              <button
                type="button"
                key={key}
                className={`${styles.nivelBtn} ${nivel === key ? styles.active : ''}`}
                onClick={() => setNivel(key)}
                aria-pressed={nivel === key}
              >
                <span className={styles.nivelLabel}>
                  <span aria-hidden="true">{cfg.emoji}</span> {cfg.label}
                </span>
                <span className={styles.nivelDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.configSubtitle}>Número de preguntas</h3>
          <div className={styles.preguntasRow} role="group" aria-label="Número de preguntas">
            {OPCIONES_PREGUNTAS.map(n => (
              <button
                key={n}
                type="button"
                className={`${styles.pregBtn} ${numPreguntas === n ? styles.active : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {n} preguntas
              </button>
            ))}
          </div>

          {/* El nivel A1 solo tiene 15 verbos, así que pedir 20 servía 15 en silencio: el
              truncado era correcto, pero el botón seguía prometiendo 20 (hallazgo 312). */}
          {verbosDelNivel < numPreguntas && (
            <p className={styles.avisoNivel} role="status">
              El nivel {nivel === 'todos' ? 'Completo' : nivel} tiene {verbosDelNivel} verbos, así que
              la partida será de {verbosDelNivel} preguntas. Para jugar {numPreguntas}, elige un nivel
              con más verbos o el nivel Completo.
            </p>
          )}

          <button type="button" className={styles.btnIniciar} onClick={iniciarQuiz}>
            Empezar Quiz — {Math.min(numPreguntas, verbosDelNivel)} preguntas · Nivel {nivel === 'todos' ? 'Completo' : nivel}
          </button>
        </div>
      )}

      {/* ── PANTALLA QUIZ ── */}
      {pantalla === 'quiz' && pregunta && (
        <div className={styles.quizPanel} ref={quizPanelRef}>
          {/* HUD */}
          <div className={styles.hudBar}>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{preguntaActual + 1}/{totalPreguntas}</span>
              <span className={styles.hudLabel}>Pregunta</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{correctas}</span>
              <span className={styles.hudLabel}>Correctas</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>
                {/* El denominador son las RESPONDIDAS, no el índice de la pregunta: al
                    contestar, `correctas` ya incluye esta respuesta y `preguntaActual`
                    todavía no, así que durante toda la fase de feedback —que es justo cuando
                    se mira la pantalla— la precisión salía al 200 % con 2/2, 150 % con 3/3 y
                    100 % con la primera fallada y la segunda acertada (hallazgo 311). */}
                {formatPercentage(respondidas > 0 ? correctas / respondidas : 0, 0)}
              </span>
              <span className={styles.hudLabel}>Precisión</span>
            </div>
          </div>

          <div className={styles.progresoBar}>
            <div
              className={styles.progresoFill}
              style={{ width: `${(preguntaActual / totalPreguntas) * 100}%` }}
              role="progressbar"
              aria-label="Preguntas respondidas"
              aria-valuetext={`${preguntaActual} de ${totalPreguntas}`}
              aria-valuenow={preguntaActual}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
            />
          </div>

          {/* Tarjeta de pregunta */}
          <div className={styles.preguntaCard} ref={preguntaRef} tabIndex={-1}>
            <p className={styles.preguntaNumero}>Pregunta {preguntaActual + 1} de {totalPreguntas}</p>
            <p className={styles.preguntaEtiqueta}>
              ¿Cuál es el Past Simple{matizDelEnunciado(pregunta.verbo)} de...?
            </p>
            <p className={styles.verboPrincipal}>{pregunta.verbo.infinitive}</p>
            <p className={styles.verboSignificado}>"{pregunta.verbo.spanish}"</p>
          </div>

          {/* Opciones */}
          <div className={styles.opcionesGrid}>
            {pregunta.opciones.map((opcion, i) => {
              let claseExtra = '';
              if (seleccionada !== null) {
                if (opcion === pregunta.respuestaCorrecta) claseExtra = styles.opcionCorrecta;
                else if (opcion === seleccionada) claseExtra = styles.opcionIncorrecta;
                else claseExtra = styles.opcionNeutral;
              }
              return (
                <button
                  type="button"
                  key={opcion}
                  className={`${styles.opcion} ${claseExtra}`}
                  onClick={() => responder(opcion)}
                  disabled={seleccionada !== null}
                  aria-label={`Opción ${LETRAS[i]}: ${opcion}`}
                >
                  <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                  {opcion}
                </button>
              );
            })}
          </div>

          {/* Feedback con conjugación completa */}
          {seleccionada !== null && (
            <>
              <div
                className={`${styles.feedbackBanner} ${seleccionada === pregunta.respuestaCorrecta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                role="alert"
                aria-live="polite"
              >
                <p className={styles.feedbackTitulo}>
                  {/* El emoji en su nodo y oculto: dentro de la cadena, el lector anunciaba
                      «marca de cruz, Incorrecto» en la alerta (hallazgo 1838, la forma del 317). */}
                  {seleccionada === pregunta.respuestaCorrecta
                    ? <><span aria-hidden="true">✅</span> ¡Correcto!</>
                    : <><span aria-hidden="true">❌</span> Incorrecto</>}
                </p>
                <div className={styles.conjugacion}>
                  <span className={styles.conjForma}>{pregunta.verbo.infinitive}</span>
                  <span className={styles.conjFlecha} aria-hidden="true">→</span>
                  <span className={styles.conjForma}>{pregunta.verbo.pastSimple}</span>
                  <span className={styles.conjFlecha} aria-hidden="true">→</span>
                  {/* La «conjugación completa» tiene que incluir el segundo participio donde
                      lo hay: enseñar «get → got → got» contradecía a la propia caja de avisos
                      de la app y a su tabla, que escribe «get/got/got(ten)» (hallazgo 315). */}
                  <span className={styles.conjForma}>
                    {pregunta.verbo.pastParticiple}
                    {pregunta.verbo.varianteParticipio && (
                      <span className={styles.conjVariante}>
                        {' / '}{pregunta.verbo.varianteParticipio.forma}
                        <small> ({pregunta.verbo.varianteParticipio.variedad})</small>
                      </span>
                    )}
                  </span>
                </div>
                <p className={styles.conjSignificado}>"{pregunta.verbo.spanish}"</p>
              </div>
              <button type="button" ref={botonSiguienteRef} className={styles.btnSiguiente} onClick={siguiente}>
                {esUltima ? 'Ver resultados' : 'Siguiente pregunta →'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── PANTALLA RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={styles.resultadoPanel} ref={resultadoRef} tabIndex={-1}>
          <span className={styles.resultadoEmoji} aria-hidden="true">{resultadoTexto.emoji}</span>
          <h2 className={styles.resultadoTitulo}>{resultadoTexto.titulo}</h2>
          <p className={styles.resultadoPuntos}>{puntuacion} pts</p>
          <p className={styles.resultadoSubtitulo}>
            {correctas} de {totalPreguntas} respuestas correctas
          </p>

          <div className={styles.statsResultado}>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{correctas}/{totalPreguntas}</span>
              <p className={styles.statRLabel}>Correctas</p>
            </div>
            <div className={styles.statR}>
              <span className={styles.statRValor}>
                {formatPercentage(correctas / totalPreguntas, 0)}
              </span>
              <p className={styles.statRLabel}>Acierto</p>
            </div>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{formatTiempo(tiempoTotal)}</span>
              <p className={styles.statRLabel}>Tiempo</p>
            </div>
          </div>

          <div className={styles.botonesResultado}>
            <button type="button" className={styles.btnRejugar} onClick={reiniciar}>
              <span aria-hidden="true">🔄</span> Jugar de nuevo
            </button>
            <button type="button" className={styles.btnConfig} onClick={volverConfig}>
              <span aria-hidden="true">⚙️</span> Cambiar nivel
            </button>
          </div>
        </div>
      )}

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Guía completa de verbos irregulares en inglés"
        subtitle={`Todo lo que necesitas saber para dominar los ${TOTAL_PREGUNTABLES} verbos irregulares del quiz`}
        icon="📖"
      >

        {/* 1. Tabla Comparativa */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Grupos de verbos irregulares por patrón</h4>
          <p className={styles.eduIntro}>
            Aprender verbos irregulares es mucho más fácil cuando los agrupas por su patrón de cambio.
            Hay cuatro patrones principales:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Patrón</th>
                  <th>Descripción</th>
                  <th>Infinitive</th>
                  <th>Past Simple</th>
                  <th>Past Participle</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>A-A-A</strong></td>
                  <td>Las tres formas son iguales</td>
                  <td><em>put, cut, hit, let</em></td>
                  <td><em>put, cut, hit, let</em></td>
                  <td><em>put, cut, hit, let</em></td>
                </tr>
                <tr>
                  <td><strong>A-B-B</strong></td>
                  <td>Past Simple = Past Participle</td>
                  <td><em>buy, teach, think, sell</em></td>
                  <td><em>bought, taught, thought, sold</em></td>
                  <td><em>bought, taught, thought, sold</em></td>
                </tr>
                <tr>
                  <td><strong>A-B-A</strong></td>
                  <td>Infinitive = Past Participle</td>
                  <td><em>come, run, become, overcome</em></td>
                  <td><em>came, ran, became, overcame</em></td>
                  <td><em>come, run, become, overcome</em></td>
                </tr>
                <tr>
                  <td><strong>A-B-C</strong></td>
                  <td>Las tres formas son distintas</td>
                  <td><em>go, be, write, drive</em></td>
                  <td><em>went, was/were, wrote, drove</em></td>
                  <td><em>gone, been, written, driven</em></td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Hallazgo 1843: la página y el JSON-LD daban dos «10 más usados» distintos y la
              página dejaba fuera «know». La lista es la de los 10 verbos más frecuentes del
              Oxford English Corpus (todos irregulares), en su orden; en el COCA el 10.º es
              «think» y no «see», por eso se nombra la fuente y no se habla del inglés en general. */}
          <p className={styles.eduNota}>
            <strong>Los 10 verbos más frecuentes (Oxford English Corpus):</strong> be/was-were/been · have/had/had · do/did/done · say/said/said · get/got/got(ten) · make/made/made · go/went/gone · know/knew/known · take/took/taken · see/saw/seen
          </p>
        </section>

        {/* 2. Casos de Uso */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>¿Para quién es útil este quiz?</h4>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <strong>Estudiante de secundaria/preparatoria (ESO/Bachillerato en España)</strong>
              </div>
              <p className={styles.escenarioExample}>
                Preparas el examen de inglés del trimestre y el profesor va a poner Past Simple y Past Participle.
              </p>
              <p className={styles.escenarioTip}>
                Empieza por el nivel A1–A2 y pasa al B1 cuando encadenes 10 correctas seguidas. El quiz
                pregunta el <strong>Past Simple</strong>; el participio lo repasas en la conjugación
                completa que sale al responder y en la tabla de patrones de más abajo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <strong>Adulto preparando el B2 o C1</strong>
              </div>
              <p className={styles.escenarioExample}>
                Necesitas dominar los verbos irregulares para un examen oficial: Cambridge, APTIS, TOEFL
                o el certificado de idiomas de tu país.
              </p>
              <p className={styles.escenarioTip}>
                Practica el nivel B2 diariamente, donde están <em>lay</em>, <em>rise</em>, <em>lead</em> y
                <em> feed</em>. Las parejas con las que se confunden no entran en el quiz: <em>raise</em>,
                que es regular, y <em>lie</em> (tumbarse), que es irregular (<em>lie/lay/lain</em>) pero
                no está en el banco. Son justo las que hay que tener presentes al responder.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📋</span>
                <strong>Proceso de selección con prueba de idioma</strong>
              </div>
              <p className={styles.escenarioExample}>
                Tu convocatoria (empleo público, beca o empresa) incluye inglés y hay una prueba de
                gramática con tiempos verbales.
              </p>
              <p className={styles.escenarioTip}>
                Céntrate en los verbos A-B-C (patrón más evaluado) y practica el modo "Todos los niveles".
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <strong>Profesional que mejora inglés escrito</strong>
              </div>
              <p className={styles.escenarioExample}>
                Redactas emails y reportes en inglés y quieres evitar errores de Past Simple/Past Participle.
              </p>
              <p className={styles.escenarioTip}>
                Practica los grupos A-B-B y A-B-C, son los que más aparecen en textos profesionales formales.
                Ojo: aquí se pregunta el Past Simple, así que para el participio conviene fijarse en la
                tercera columna de la conjugación que aparece tras cada respuesta.
              </p>
            </div>

          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Preguntas frecuentes</h4>
          <ul className={styles.faqList}>

            <li className={styles.faqItem}>
              <strong>¿Cuántos verbos irregulares hay en inglés?</strong>
              <p>
                Se estima que existen unos 200 verbos irregulares en inglés, aunque la mayoría de uso
                cotidiano se concentra en unos 75-100. Los {TOTAL_PREGUNTABLES} verbos que pregunta este
                quiz incluyen los más frecuentes de todos.
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Cuáles son los más usados en la práctica?</strong>
              <p>
                En el Oxford English Corpus, los 10 verbos más frecuentes del inglés son todos
                irregulares: <em>be, have, do, say, get, make, go, know, take</em> y <em>see</em>. Otros
                corpus cambian algún puesto (en el estadounidense COCA, <em>think</em> adelanta a
                <em> see</em>), pero el núcleo es el mismo, y los diez están en el nivel A1 de este quiz.
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Hay algún patrón para aprenderlos más fácil?</strong>
              <p>
                Sí. La clave está en agruparlos por patrón de cambio: A-A-A (sin cambio), A-B-B (past = participle),
                A-B-A (infinitive = participle) y A-B-C (tres formas distintas). Agruparlos por patrones
                similares (ablaut, mismo sufijo, etc.) puede facilitar su memorización.
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre Simple Past y Past Participle?</strong>
              <p>
                El Simple Past describe una acción completada en un momento concreto del pasado
                ("She <em>wrote</em> the email yesterday"). El Past Participle se usa con los auxiliares
                <em>have/has/had</em> para los tiempos perfectos ("She <em>has written</em> three emails today")
                y con <em>be</em> para la voz pasiva ("The email <em>was written</em> by her").
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Cuándo se usa cada forma en una frase real?</strong>
              <p>
                El Simple Past aparece con marcadores temporales: <em>yesterday, last week, in 2010, ago</em>.
                El Past Participle aparece con <em>have, has, had, been</em>. Si puedes sustituir la forma
                verbal por "written/done/gone" y encaja, es Past Participle; si encaja "wrote/did/went", es Simple Past.
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Qué verbos son irregulares en inglés pero no en español?</strong>
              <p>
                Algunos ejemplos: <em>buy/bought/bought</em> (comprar), <em>speak/spoke/spoken</em> (hablar),
                <em>drink/drank/drunk</em> (beber) y <em>read/read/read</em> (leer; misma escritura,
                distinta pronunciación). Los cuatro verbos españoles son regulares, así que la intuición
                del español no avisa de que en inglés cambian.
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Cómo memorizarlos de forma efectiva?</strong>
              <p>
                Tres técnicas que ayudan: (1) aprender por grupos de patrón, no en orden alfabético;
                (2) usar flashcards con la frase completa, no solo el verbo suelto; (3) repasar a intervalos
                crecientes (por ejemplo, 1, 3, 7 y 21 días después), que es la idea de la repetición
                espaciada. Puedes usar una partida de este quiz en cada repaso.
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Cuáles son los más confundidos en el B2?</strong>
              <p>
                Los más problemáticos en el B2 son: <em>lay/laid/laid</em> vs. <em>lie/lay/lain</em>,
                <em>rise/rose/risen</em> vs. <em>raise/raised/raised</em>, <em>fall/fell/fallen</em> vs.
                <em>feel/felt/felt</em>, y <em>find/found/found</em> vs. <em>found/founded/founded</em>.
              </p>
              <p className={styles.faqTip}>
                Consejo: de esos pares, el quiz tiene <em>lay</em> y <em>rise</em> en el nivel B2,
                <em>fall</em> en B1, <em>feel</em> en A2 y <em>find</em> en A1. Sus parejas no entran:
                <em>raise</em> y <em>found</em> (fundar), porque no son irregulares, y <em>lie</em>
                (tumbarse), que sí lo es (<em>lie/lay/lain</em>) pero no está en el banco. Ojo: solo es
                regular <em>lie</em> «mentir» (<em>lied/lied</em>), que no es la pareja de <em>lay</em>.
                Para practicar los que sí están, juega en el nivel <strong>Completo</strong>.
              </p>
            </li>

          </ul>
        </section>

        {/* 4. Guía Paso a Paso */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Plan de 30 días para dominar los {TOTAL_PREGUNTABLES} verbos irregulares del quiz</h4>
          <p className={styles.eduIntro}>
            Un método estructurado con repetición espaciada para interiorizar los verbos de forma duradera:
          </p>
          <ol className={styles.stepGuide}>

            {/* Cada semana nombra verbos que ESTÁN en el banco y el nivel donde de verdad
                están. Hasta el 25/08/2026, de los 21 verbos que el plan mandaba practicar,
                10 no existían aquí y 6 estaban en otro nivel: quien seguía el plan al pie de
                la letra practicaba donde esos verbos no salen nunca (hallazgo 314). */}
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Semana 1 — Patrón A-A-A (días 1–7)</strong>
                <p>Los verbos que no cambian son los que menos cuesta fijar. En este quiz están
                <em> put</em> (A2), <em>cut</em> y <em>hurt</em> (B1), y <em>read</em> (A2), que cambia
                la pronunciación pero no la grafía. Como están repartidos, practica en el nivel
                <strong> Completo</strong> con 10 preguntas diarias.</p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Semana 2 — Patrón A-B-B (días 8–14)</strong>
                <p>Es el grupo más numeroso. Empieza por los de A1 y A2, que es donde el quiz los tiene:
                <em> think/thought, buy/bought, bring/brought, keep/kept, feel/felt, leave/left,
                meet/met, sleep/slept</em>. Practica en <strong>A2</strong> con 15 preguntas diarias, y
                pasa a B1 para <em>sell/sold, teach/taught, send/sent, pay/paid, build/built</em>.</p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Días 15–17 — Patrón A-B-A</strong>
                <p>Aquí hay dos: <em>come/came/come</em> (A1) y <em>run/ran/run</em> (A2). Son pocos, pero
                se confunden con el grupo A-B-C precisamente porque el participio vuelve al infinitivo:
                practícalos hasta no dudar.</p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Días 18–24 — Patrón A-B-C</strong>
                <p>El grupo más exigente: tres formas distintas. Empieza por los de A1, que son los más
                usados (<em>be/was-were/been, go/went/gone, do/did/done, see/saw/seen, take/took/taken,
                give/gave/given, know/knew/known</em>). Luego el A2 (<em>write/wrote/written,
                eat/ate/eaten, drink/drank/drunk, speak/spoke/spoken, drive/drove/driven</em>) y de ahí
                al B1–B2.</p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Días 25–27 — Repaso de errores</strong>
                <p>Identifica qué verbos has fallado más durante el mes y crea un mini-quiz personalizado
                con esos 10–15 verbos. Repite hasta 95 % de acierto.</p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Días 28–29 — Modo "Todos los niveles"</strong>
                <p>Activa el nivel Completo ({TOTAL_PREGUNTABLES} verbos) con 20 preguntas. El objetivo es
                superar el 85 % de acierto. Si no lo consigues, vuelve al paso 5 con los errores de esta sesión.</p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Día 30 — Test final y mantenimiento</strong>
                <p>Realiza el quiz completo de 20 preguntas en modo "Todos". A partir de aquí, un repaso
                semanal de 10 minutos ayuda a mantener el nivel.</p>
              </div>
            </li>

          </ol>
        </section>

        {/* 5. Mejores Prácticas */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>6 técnicas para aprender verbos irregulares más rápido</h4>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <strong>Agrupa por patrón, no alfabéticamente</strong>
              <p>Estudiar <em>buy-bought</em>, <em>think-thought</em> y <em>teach-taught</em> juntos activa
              la memoria asociativa. La lista A-Z dispersa el contexto y dificulta la retención.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <strong>Practica en frases reales, no listas</strong>
              <p>"I <em>went</em> to the market" es más fácil de recordar que "go-went-gone" en una tabla.
              Escribe 2–3 frases propias con cada verbo nuevo que aprendas.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🕐</span>
              <strong>Repaso espaciado</strong>
              <p>Repasa un verbo nuevo al día siguiente, a los 3 días, a la semana y a las 3 semanas.
              Esos intervalos son una pauta habitual, no una cifra exacta: lo que la investigación sobre
              la memoria respalda es espaciar los repasos en vez de concentrarlos.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎵</span>
              <strong>Escucha canciones con Past Simple</strong>
              <p>Canciones en inglés con letras en pasado narrativo (<em>"Yesterday", "Someone Like You"</em>)
              exponen tu oído a los verbos irregulares en contexto emocional, lo que potencia la retención.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🃏</span>
              <strong>Flashcards con ejemplo de frase</strong>
              <p>En el anverso: "go - infinitive". En el reverso: "went / gone — I <em>went</em> home early /
              I have <em>gone</em> there before." El ejemplo de frase reduce la confusión entre las dos formas.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Sesiones cortas y frecuentes</strong>
              <p>Repartir la práctica en sesiones cortas suele retener mejor que concentrarla en una
              sola sesión larga (el llamado efecto de espaciado). Una partida de 5–10 minutos al día
              encaja en cualquier rutina.</p>
            </div>

          </div>
        </section>

        {/* 6. Warning Box */}
        <section className={styles.eduBloque}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores típicos que debes evitar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir Past Simple con Past Participle:</strong> decir "I have <em>went</em>" en lugar
                de "I have <em>gone</em>" es el error número uno en el B2. Recuerda: con <em>have/has/had</em>,
                siempre Past Participle.
              </li>
              <li>
                <strong>Regularizar verbos irregulares (<em>goed, buyed, thinked</em>):</strong> el sistema
                de verbos regulares en -ed es tan predominante que el cerebro lo aplica automáticamente.
                Los más regularizados erróneamente: <em>go, buy, think, bring, teach</em>.
              </li>
              <li>
                <strong>Confundir <em>lie/lay/lain</em> con <em>lay/laid/laid</em>:</strong> <em>lie</em>
                (yacer) es intransitivo; <em>lay</em> (poner) necesita objeto. "She <em>lay</em> on the sofa"
                (pasado de <em>lie</em>) vs. "She <em>laid</em> the book on the table" (pasado de <em>lay</em>).
              </li>
              <li>
                <strong>Usar <em>been</em> como pasado de <em>go</em>:</strong> "I've <em>been</em> to Paris"
                significa que has visitado París y has vuelto. "I've <em>gone</em> to Paris" implica que todavía
                estás allí. Son intercambiables en español pero no en inglés.
              </li>
              <li>
                <strong>Olvidar verbos con dos formas válidas:</strong> algunos verbos irregulares admiten
                dos Past Participles correctos: <em>got/gotten</em> (en AmE), <em>learned/learnt</em>,
                <em>burned/burnt</em>. Ninguna es incorrecta; depende de la variedad de inglés.
              </li>
              <li>
                <strong>Descuidar <em>read/read/read</em> y <em>lead/led/led</em>:</strong> <em>read</em>
                se escribe igual en las tres formas pero se pronuncia diferente (presente: /riːd/,
                pasado: /rɛd/). <em>lead</em> (guiar) en pasado es <em>led</em>, no <em>lead</em>
                (que es el metal plomo).
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-verbos-irregulares')} />
      <ShareCard appName="quiz-verbos-irregulares" />
      <Footer appName="quiz-verbos-irregulares" />
    </div>
  );
}
