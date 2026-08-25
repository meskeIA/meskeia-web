'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './QuizVerbosIrregulares.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import EducationalSection from '@/components/EducationalSection';
import { verbosIrregulares, VerboIrregular } from '@/data/verbos-irregulares';

type Nivel = 'A1' | 'A2' | 'B1' | 'B2' | 'todos';
type Pantalla = 'config' | 'quiz' | 'resultado';

interface PreguntaQuiz {
  verbo: VerboIrregular;
  opciones: string[];
  respuestaCorrecta: string;
}

// Emoji y rótulo separados: dentro de la misma cadena el lector de pantalla lee «círculo
// verde A1 Básico» y el candado check:a11y-jsx no puede verlo, porque viene de una constante
// y no de texto JSX (hallazgo 317).
const NIVEL_CONFIG: Record<Nivel, { emoji: string; label: string; desc: string }> = {
  A1:    { emoji: '🟢', label: 'A1 Básico',          desc: '15 verbos esenciales' },
  A2:    { emoji: '🟡', label: 'A2 Elemental',       desc: '20 verbos frecuentes' },
  B1:    { emoji: '🟠', label: 'B1 Intermedio',      desc: '20 verbos habituales' },
  B2:    { emoji: '🔴', label: 'B2 Avanzado',        desc: '20 verbos complejos'  },
  todos: { emoji: '⭐', label: 'Todos los niveles',  desc: '75 verbos completos'  },
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

function generarOpciones(correcto: string, pool: string[]): string[] {
  const incorrectos = mezclar(pool.filter(o => o !== correcto)).slice(0, 3);
  return mezclar([correcto, ...incorrectos]);
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
  const pool = nivel === 'todos'
    ? verbosIrregulares
    : verbosIrregulares.filter(v => v.level === nivel);

  // `show` sale del sorteo: su past simple «showed» es regular, es el único en -ed de los 75
  // y se reconocía sin saber el verbo. Sigue en las tablas del bloque educativo, que es
  // donde de verdad enseña algo (es irregular en el participio: shown).
  const preguntables = pool.filter(v => !v.pastSimpleRegular);

  const seleccionados = mezclar(preguntables).slice(0, Math.min(numPreguntas, preguntables.length));
  // Los distractores salen del MISMO conjunto: si «showed» apareciera de distractor, se
  // descartaría igual de gratis que cuando era la respuesta.
  const poolRespuestas = preguntables.map(respuestaDe);

  return seleccionados.map(verbo => {
    const correcta = respuestaDe(verbo);
    const opciones = generarOpciones(correcta, poolRespuestas);
    return { verbo, opciones, respuestaCorrecta: correcta };
  });
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
  const verbosDelNivel = useMemo(
    () => (nivel === 'todos' ? verbosIrregulares : verbosIrregulares.filter(v => v.level === nivel))
      .filter(v => !v.pastSimpleRegular).length,
    [nivel]
  );

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
  const volverConfig = useCallback(() => { setPantalla('config'); }, []);

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
          <h2 className={styles.configTitle}>Elige tu nivel</h2>

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
        <>
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
                {respondidas > 0 ? Math.round((correctas / respondidas) * 100) : 0}%
              </span>
              <span className={styles.hudLabel}>Precisión</span>
            </div>
          </div>

          <div className={styles.progresoBar}>
            <div
              className={styles.progresoFill}
              style={{ width: `${(preguntaActual / totalPreguntas) * 100}%` }}
              role="progressbar"
              aria-valuenow={preguntaActual}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
            />
          </div>

          {/* Tarjeta de pregunta */}
          <div className={styles.preguntaCard}>
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
                  {seleccionada === pregunta.respuestaCorrecta ? '✅ ¡Correcto!' : '❌ Incorrecto'}
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
              <button type="button" className={styles.btnSiguiente} onClick={siguiente}>
                {esUltima ? 'Ver resultados' : 'Siguiente pregunta →'}
              </button>
            </>
          )}
        </>
      )}

      {/* ── PANTALLA RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={styles.resultadoPanel}>
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
                {Math.round((correctas / totalPreguntas) * 100)}%
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
        subtitle="Todo lo que necesitas saber para dominar los 75 verbos irregulares más usados"
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
          <p className={styles.eduNota}>
            <strong>Los 10 más usados:</strong> be/was-were/been · have/had/had · do/did/done · go/went/gone · get/got/got(ten) · make/made/made · say/said/said · see/saw/seen · come/came/come · take/took/taken
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
                Necesitas dominar los verbos irregulares para el examen oficial: Cambridge, EOI o APTIS.
              </p>
              <p className={styles.escenarioTip}>
                Practica el nivel B2 diariamente, donde están <em>lay</em>, <em>rise</em>, <em>lead</em> y
                <em> feed</em>: sus parejas regulares (<em>lie</em>, <em>raise</em>) no entran en el quiz,
                pero son justo las que hay que tener presentes al responder.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📋</span>
                <strong>Opositor con prueba de idioma</strong>
              </div>
              <p className={styles.escenarioExample}>
                Tu convocatoria incluye inglés y hay una prueba de gramática con tiempos verbales.
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
                cotidiano se concentra en unos 75-100. Los 75 verbos de este quiz cubren la gran mayoría
                de los casos que aparecerán en textos y conversaciones habituales.
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Cuáles son los más usados en la práctica?</strong>
              <p>
                Los 10 verbos irregulares más frecuentes en inglés escrito y oral son: <em>be, have, do, go,
                get, make, say, see, come</em> y <em>take</em>. Si los dominas perfectamente, ya tienes una
                base sólida para cualquier nivel B1 o superior.
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
                Algunos ejemplos llamativos: <em>read/read/read</em> (misma escritura, distinta pronunciación),
                <em>hear/heard/heard</em> (en español "oír" es regular en muchos tiempos), <em>sleep/slept/slept</em>
                y <em>feel/felt/felt</em>. Son trampas habituales para hispanohablantes.
              </p>
            </li>

            <li className={styles.faqItem}>
              <strong>¿Cómo memorizarlos de forma efectiva?</strong>
              <p>
                El método más eficaz combina tres técnicas: (1) aprender por grupos de patrón, no en orden alfabético;
                (2) usar flashcards con la frase completa, no solo el verbo suelto; (3) repaso espaciado en los
                intervalos 1-3-7-21 días. Este quiz está diseñado para integrarse con esa cadencia.
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
                Consejo: de esos pares, el quiz tiene <em>lay</em>, <em>rise</em>, <em>lead</em> y
                <em> feed</em> en el nivel B2, <em>fall</em> en B1, <em>feel</em> en A2 y <em>find</em> en
                A1 — sus parejas regulares (<em>lie</em>, <em>raise</em>, <em>found</em>) no entran, porque
                no son irregulares. Para practicarlos juntos, juega en el nivel <strong>Completo</strong>.
              </p>
            </li>

          </ul>
        </section>

        {/* 4. Guía Paso a Paso */}
        <section className={styles.eduBloque}>
          <h4 className={styles.eduTitulo}>Plan de 30 días para dominar los 75 verbos irregulares</h4>
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
                con esos 10–15 verbos. Repite hasta 95 % de acierto.</p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Días 28–29 — Modo "Todos los niveles"</strong>
                <p>Activa el quiz con los 75 verbos completos y 20 preguntas. El objetivo es superar el 85 %
                de acierto. Si no lo consigues, vuelve al paso 5 con los errores de esta sesión.</p>
              </div>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Día 30 — Test final y mantenimiento</strong>
                <p>Realiza el quiz completo de 20 preguntas en modo "Todos". A partir de aquí, un repaso
                semanal de 10 minutos es suficiente para mantener el nivel. La curva del olvido se aplana
                drásticamente después del primer mes.</p>
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
              <strong>Repaso espaciado 1-3-7-21 días</strong>
              <p>Repasa un verbo nuevo al día siguiente, a los 3 días, a la semana y a los 21 días.
              Este intervalo combate la curva del olvido de Ebbinghaus y fija el recuerdo a largo plazo.</p>
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
              <p>10 minutos diarios superan a 70 minutos semanales en una sola sesión. La memoria trabaja
              mejor con repetición distribuida. Usa este quiz 5–10 minutos cada mañana antes del trabajo o el estudio.</p>
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
                <strong>Confundir <em>lay/lie/lain</em> vs. <em>lay/laid/laid</em>:</strong> <em>lie</em>
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
