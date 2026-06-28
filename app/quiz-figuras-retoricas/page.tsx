'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './QuizFigurasRetorica.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard } from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import { figurasRetorica, FiguraRetorica } from '@/data/figuras-retoricas';

type Nivel = 'basico' | 'intermedio' | 'avanzado' | 'todos';
type Pantalla = 'config' | 'quiz' | 'resultado';

interface PreguntaQuiz {
  figura: FiguraRetorica;
  ejemploPregunta: string;
  ejemploFeedback: string;
  opciones: string[];
  respuestaCorrecta: string;
}

const NIVEL_CONFIG: Record<Nivel, { label: string; desc: string }> = {
  basico:      { label: '🟢 Básico',       desc: '10 figuras esenciales — ESO'       },
  intermedio:  { label: '🟡 Intermedio',   desc: '10 figuras habituales — Bachillerato' },
  avanzado:    { label: '🔴 Avanzado',     desc: '6 figuras complejas — Selectividad' },
  todos:       { label: '⭐ Todas',        desc: '27 figuras completas'               },
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
  const incorrectos = mezclar(pool.filter(n => n !== correcto)).slice(0, 3);
  return mezclar([correcto, ...incorrectos]);
}

function generarPreguntas(nivel: Nivel, numPreguntas: number): PreguntaQuiz[] {
  const pool = nivel === 'todos'
    ? figurasRetorica
    : figurasRetorica.filter(f => f.nivel === nivel);

  const seleccionadas = mezclar(pool).slice(0, Math.min(numPreguntas, pool.length));
  const poolNombres = pool.map(f => f.nombre);

  return seleccionadas.map(figura => {
    const ejemplosMezclados = mezclar([...figura.ejemplos]);
    const ejemploPregunta = ejemplosMezclados[0];
    const ejemploFeedback = ejemplosMezclados[1] ?? figura.ejemplos[0];
    const opciones = generarOpciones(figura.nombre, poolNombres);

    return {
      figura,
      ejemploPregunta,
      ejemploFeedback,
      opciones,
      respuestaCorrecta: figura.nombre,
    };
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
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Dominas la retórica!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy buena puntuación!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue practicando' };
}

const GRUPO_ETIQUETA: Record<string, string> = {
  imagen:        '🖼️ Imagen',
  repeticion:    '🔁 Repetición',
  contraste:     '⚡ Contraste',
  enfasis:       '📢 Énfasis',
  sintaxis:      '🔧 Sintaxis',
  'contigüidad': '🔗 Contigüidad',
};

export default function QuizFigurasRetoricaPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [nivel, setNivel] = useState<Nivel>('basico');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [preguntas, setPreguntas] = useState<PreguntaQuiz[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [correctas, setCorrectas] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState<number>(0);
  const [tiempoTotal, setTiempoTotal] = useState<number>(0);

  const pregunta = preguntas[preguntaActual];
  const totalPreguntas = preguntas.length;
  const esUltima = preguntaActual === totalPreguntas - 1;

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
        <h1 className={styles.title}>Quiz Figuras Retóricas ✍️</h1>
        <p className={styles.subtitle}>
          Identifica metáforas, hipérboles, anáforas y mucho más · ESO, Bachillerato y Selectividad
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
                key={key}
                className={`${styles.nivelBtn} ${nivel === key ? styles.active : ''}`}
                onClick={() => setNivel(key)}
                aria-pressed={nivel === key}
              >
                <span className={styles.nivelLabel}>{cfg.label}</span>
                <span className={styles.nivelDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.configSubtitle}>Número de preguntas</h3>
          <div className={styles.preguntasRow} role="group" aria-label="Número de preguntas">
            {OPCIONES_PREGUNTAS.map(n => (
              <button
                key={n}
                className={`${styles.pregBtn} ${numPreguntas === n ? styles.active : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {n} preguntas
              </button>
            ))}
          </div>

          <button className={styles.btnIniciar} onClick={iniciarQuiz}>
            Empezar Quiz — {numPreguntas} preguntas · {NIVEL_CONFIG[nivel].label}
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
                {preguntaActual > 0 ? Math.round((correctas / preguntaActual) * 100) : 0}%
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
            <p className={styles.preguntaEtiqueta}>¿Qué figura retórica identifica este ejemplo?</p>
            <blockquote className={styles.ejemploTexto}>
              "{pregunta.ejemploPregunta}"
            </blockquote>
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

          {/* Feedback educativo rico */}
          {seleccionada !== null && (
            <>
              <div
                className={`${styles.feedbackPanel} ${seleccionada === pregunta.respuestaCorrecta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                role="alert"
              >
                <div className={styles.feedbackCabecera}>
                  <span className={styles.feedbackIcono}>
                    {seleccionada === pregunta.respuestaCorrecta ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className={styles.feedbackResultado}>
                      {seleccionada === pregunta.respuestaCorrecta ? '¡Correcto!' : 'Incorrecto'}
                    </p>
                    <p className={styles.feedbackNombre}>{pregunta.figura.nombre}</p>
                    <span className={styles.feedbackGrupo}>
                      {GRUPO_ETIQUETA[pregunta.figura.grupo]}
                    </span>
                  </div>
                </div>

                <div className={styles.feedbackBloque}>
                  <span className={styles.feedbackBloqueIcono} aria-hidden="true">📖</span>
                  <p>{pregunta.figura.definicion}</p>
                </div>

                <div className={styles.feedbackBloque}>
                  <span className={styles.feedbackBloqueIcono} aria-hidden="true">⚡</span>
                  <p>{pregunta.figura.distincion}</p>
                </div>

                <div className={styles.feedbackBloque}>
                  <span className={styles.feedbackBloqueIcono} aria-hidden="true">💡</span>
                  <p className={styles.feedbackEjemplo}>"{pregunta.ejemploFeedback}"</p>
                </div>
              </div>

              <button className={styles.btnSiguiente} onClick={siguiente}>
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
            <button className={styles.btnRejugar} onClick={reiniciar}>
              🔄 Jugar de nuevo
            </button>
            <button className={styles.btnConfig} onClick={volverConfig}>
              ⚙️ Cambiar nivel
            </button>
          </div>
        </div>
      )}

      <EducationalSection
        title="¿Quieres dominar las figuras retóricas?"
        subtitle="Guía completa con tabla comparativa, casos de uso, FAQ y método para exámenes de selectividad"
      >

        {/* SECCIÓN 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa de Figuras Retóricas</h2>
          <p className={styles.introParagraph}>
            Las figuras retóricas se clasifican en cuatro grandes grupos según su mecanismo de funcionamiento.
            Esta tabla recoge las más importantes para ESO, Bachillerato y Selectividad, con definición,
            ejemplo literario canónico y su frecuencia en los exámenes de acceso a la universidad.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Figura</th>
                  <th>Grupo</th>
                  <th>Definición</th>
                  <th>Ejemplo literario</th>
                  <th>Frecuencia selectividad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Metáfora</strong></td>
                  <td>Semántica</td>
                  <td>Identificación de dos realidades por semejanza, sin nexo comparativo</td>
                  <td><em>"Nuestras vidas son los ríos / que van a dar en la mar"</em> — Jorge Manrique</td>
                  <td><span className={styles.frecuenciaMuyAlta}>Muy alta</span></td>
                </tr>
                <tr>
                  <td><strong>Metonimia</strong></td>
                  <td>Semántica</td>
                  <td>Sustitución de un término por otro con el que guarda relación de contigüidad (causa/efecto, continente/contenido)</td>
                  <td><em>"Beber una copa de Rioja"</em> (la región por el vino)</td>
                  <td><span className={styles.frecuenciaAlta}>Alta</span></td>
                </tr>
                <tr>
                  <td><strong>Sinécdoque</strong></td>
                  <td>Semántica</td>
                  <td>Designar el todo por la parte o la parte por el todo</td>
                  <td><em>"Cien velas surcaban el mar"</em> (las velas por los barcos) — uso clásico</td>
                  <td><span className={styles.frecuenciaMedia}>Media</span></td>
                </tr>
                <tr>
                  <td><strong>Aliteración</strong></td>
                  <td>Fónica</td>
                  <td>Repetición de sonidos iguales o similares en versos contiguos</td>
                  <td><em>"En el silencio solo se escuchaba / un susurro de abejas que sonaba"</em> — Garcilaso de la Vega</td>
                  <td><span className={styles.frecuenciaAlta}>Alta</span></td>
                </tr>
                <tr>
                  <td><strong>Onomatopeya</strong></td>
                  <td>Fónica</td>
                  <td>Imitación del sonido real de aquello que se nombra</td>
                  <td><em>"El borbotón del río"</em>; <em>"el chasquido del látigo"</em></td>
                  <td><span className={styles.frecuenciaMedia}>Media</span></td>
                </tr>
                <tr>
                  <td><strong>Anáfora</strong></td>
                  <td>Sintáctica</td>
                  <td>Repetición de una o varias palabras al inicio de versos o frases consecutivas</td>
                  <td><em>"Verde que te quiero verde. / Verde viento. Verdes ramas."</em> — Federico García Lorca</td>
                  <td><span className={styles.frecuenciaMuyAlta}>Muy alta</span></td>
                </tr>
                <tr>
                  <td><strong>Hipérbaton</strong></td>
                  <td>Sintáctica</td>
                  <td>Alteración del orden sintáctico habitual de la oración</td>
                  <td><em>"Del salón en el ángulo oscuro / de su dueño tal vez olvidada"</em> — Gustavo Adolfo Bécquer</td>
                  <td><span className={styles.frecuenciaAlta}>Alta</span></td>
                </tr>
                <tr>
                  <td><strong>Paralelismo</strong></td>
                  <td>Sintáctica</td>
                  <td>Repetición de la misma estructura sintáctica en varias oraciones o versos</td>
                  <td><em>"Temprano levantó la muerte el vuelo, / temprano madrugó la madrugada"</em> — Miguel Hernández</td>
                  <td><span className={styles.frecuenciaAlta}>Alta</span></td>
                </tr>
                <tr>
                  <td><strong>Hipérbole</strong></td>
                  <td>Pensamiento</td>
                  <td>Exageración desmedida con intención expresiva o estética</td>
                  <td><em>"Érase un hombre a una nariz pegado, / érase una nariz superlativa"</em> — Francisco de Quevedo</td>
                  <td><span className={styles.frecuenciaMuyAlta}>Muy alta</span></td>
                </tr>
                <tr>
                  <td><strong>Ironía</strong></td>
                  <td>Pensamiento</td>
                  <td>Expresión de algo opuesto a lo que se piensa, con intención crítica o humorística</td>
                  <td><em>"¡Qué descanso tan delicioso el de los cementerios!"</em> — Mariano José de Larra</td>
                  <td><span className={styles.frecuenciaAlta}>Alta</span></td>
                </tr>
                <tr>
                  <td><strong>Antítesis</strong></td>
                  <td>Pensamiento</td>
                  <td>Contraposición de dos ideas, palabras o frases de sentido contrario</td>
                  <td><em>"Ayer naciste, y morirás mañana"</em> — Luis de Góngora</td>
                  <td><span className={styles.frecuenciaMedia}>Media</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso: 4 Perfiles de Usuario</h2>
          <p className={styles.introParagraph}>
            Las figuras retóricas son necesarias en contextos muy distintos. Estos cuatro perfiles
            muestran cómo este quiz puede ayudarte según tu situación concreta.
          </p>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <div>
                  <strong>Estudiante de 4º ESO / Bachillerato</strong>
                  <div className={styles.escenarioSubtitle}>Preparando selectividad (EvAU / PAU)</div>
                </div>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> El comentario de texto de selectividad incluye siempre una
                pregunta sobre recursos estilísticos. Identificar y explicar correctamente metáforas,
                anáforas e hipérboles puede suponer hasta 2 puntos sobre 10 en la prueba.
              </p>
              <p className={styles.escenarioTip}>
                Empieza por el nivel Básico (10 figuras clave) y practica el nivel Intermedio una semana antes del examen.
                Recuerda: en selectividad no basta con nombrar la figura — debes explicar su efecto estético.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📖</span>
                <div>
                  <strong>Estudiante de Filología</strong>
                  <div className={styles.escenarioSubtitle}>Análisis literario y estilístico</div>
                </div>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> El análisis de textos literarios requiere identificar figuras
                retóricas con precisión terminológica. Distinguir metonimia de sinécdoque o antítesis de
                paradoja es fundamental para trabajos de curso y exámenes universitarios.
              </p>
              <p className={styles.escenarioTip}>
                Usa el nivel Avanzado para afinar la distinción entre figuras similares. El feedback educativo
                del quiz incluye la definición exacta y un segundo ejemplo para consolidar el aprendizaje.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📝</span>
                <div>
                  <strong>Opositor a Secundaria</strong>
                  <div className={styles.escenarioSubtitle}>Especialidad de Lengua Castellana y Literatura</div>
                </div>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Las oposiciones al cuerpo de profesores de secundaria incluyen
                pruebas de conocimientos de lengua y literatura. El dominio completo de las 27 figuras retóricas
                —con ejemplos canónicos y clasificación— es imprescindible.
              </p>
              <p className={styles.escenarioTip}>
                Practica el nivel "Todas" (27 figuras) y cronometra tus sesiones. Revisa especialmente las figuras
                del grupo de contraste (antítesis, paradoja, oxímoron) que suelen confundirse en los exámenes.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📚</span>
                <div>
                  <strong>Lector Curioso</strong>
                  <div className={styles.escenarioSubtitle}>Enriquecer la comprensión lectora</div>
                </div>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Situación:</strong> Al leer poesía o prosa literaria, las figuras retóricas crean los
                efectos que hacen que un texto «suene bien» o resulte especialmente evocador. Reconocerlas
                transforma la lectura en una experiencia más profunda y consciente.
              </p>
              <p className={styles.escenarioTip}>
                Empieza por el nivel Básico con 10 preguntas. Cuando encuentres una figura en tu próxima lectura
                (Lorca, Neruda, Machado), intenta identificarla antes de seguir leyendo.
              </p>
            </div>

          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Figuras Retóricas</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuántas figuras retóricas hay en total?</div>
              <div className={styles.faqRespuesta}>
                La retórica clásica cataloga más de 200 figuras, pero en la práctica escolar española
                se trabajan entre 20 y 30 figuras fundamentales. Este quiz incluye <strong>27 figuras</strong>
                organizadas en seis grupos: imagen, repetición, contraste, énfasis, sintaxis y contigüidad.
                Para selectividad bastan dominar unas 15-20 con ejemplos sólidos.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuáles caen más en selectividad?</div>
              <div className={styles.faqRespuesta}>
                Las figuras más frecuentes en los exámenes de EvAU/PAU son: <strong>metáfora</strong>,
                <strong> anáfora</strong>, <strong>hipérbole</strong>, <strong>hipérbaton</strong>,
                <strong> personificación</strong>, <strong>antítesis</strong>, <strong>paralelismo</strong>
                e <strong>ironía</strong>. La aliteración aparece con frecuencia en textos poéticos.
                Dominar estas 8 con al menos dos ejemplos canónicos cada una es suficiente para obtener
                la máxima puntuación en el apartado estilístico.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la diferencia entre metáfora y símil?</div>
              <div className={styles.faqRespuesta}>
                El <strong>símil</strong> (o comparación) usa nexos explícitos: <em>como</em>, <em>cual</em>,
                <em> semejante a</em>, <em>igual que</em>. Ejemplo: <em>"Sus ojos son como el mar"</em>.
                La <strong>metáfora</strong> identifica directamente dos realidades sin nexo: <em>"Sus ojos
                de mar profundo"</em>. La metáfora es más intensa porque suprime la distancia comparativa
                y funde ambas realidades en una sola expresión.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué diferencia hay entre metonimia y sinécdoque?</div>
              <div className={styles.faqRespuesta}>
                Ambas son figuras de contigüidad, pero el mecanismo difiere. La <strong>metonimia</strong>
                sustituye por relación lógica: causa/efecto (<em>"leer a Cervantes"</em> = leer su obra),
                continente/contenido (<em>"beber una copa"</em>), símbolo/simbolizado (<em>"la corona"</em>
                = la monarquía). La <strong>sinécdoque</strong> opera por relación cuantitativa: parte por
                el todo (<em>"cuatro bocas que alimentar"</em> = cuatro personas) o todo por la parte
                (<em>"España ganó el Mundial"</em> = el equipo español).
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo identificar figuras retóricas en un texto?</div>
              <div className={styles.faqRespuesta}>
                Sigue este orden: (1) Lee el fragmento completo sin interrumpirte. (2) Marca las palabras
                o frases que <em>llamen la atención</em> por su sonido, estructura o significado.
                (3) Pregúntate: ¿hay repetición de sonidos? (fónica), ¿de palabras o estructuras? (sintáctica),
                ¿hay comparación o identificación entre realidades distintas? (semántica), ¿hay exageración,
                contradicción o juego de opuestos? (pensamiento). (4) Nombra la figura, cita el fragmento
                textual exacto y explica el efecto que produce en el lector.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es exactamente el hipérbaton?</div>
              <div className={styles.faqRespuesta}>
                El <strong>hipérbaton</strong> altera el orden sintáctico normativo del español (sujeto +
                verbo + complementos). Es frecuente en poesía clásica por influencia del latín, donde el
                orden de palabras era más libre. Ejemplo de Bécquer: <em>"Del salón en el ángulo oscuro"</em>
                (orden normal: <em>"En el oscuro ángulo del salón"</em>). En selectividad, al identificarlo
                debes indicar cuál sería el orden canónico y qué efecto rítmico o enfático produce la inversión.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la diferencia entre ironía y sarcasmo?</div>
              <div className={styles.faqRespuesta}>
                La <strong>ironía</strong> dice lo contrario de lo que piensa con tono moderado, con intención
                crítica o humorística pero sin agresividad explícita. El <strong>sarcasmo</strong> es una ironía
                más mordaz, cruel o hiriente, dirigida normalmente a una persona concreta. En literatura, la
                ironía de Larra en sus artículos costumbristas es sarcasmo social; la ironía socrática es
                filosófica y más sutil. Para selectividad, usa el término <em>ironía</em> salvo que el contexto
                justifique claramente el tono hiriente del sarcasmo.
              </div>
            </li>
            <li className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo analizar una figura retórica en un examen?</div>
              <div className={styles.faqRespuesta}>
                La estructura correcta para un examen tiene cuatro elementos: (1) <strong>Nombre</strong> de
                la figura con seguridad (<em>"encontramos una metáfora"</em>). (2) <strong>Cita textual</strong>
                exacta entre comillas. (3) <strong>Explicación del mecanismo</strong>: qué se compara con qué,
                qué se repite, qué se exagera. (4) <strong>Efecto estético</strong>: qué sensación o significado
                añade al texto (<em>"intensifica la idea de…"</em>, <em>"crea una sensación de…"</em>,
                <em>"refuerza el tono melancólico de…"</em>). Omitir el punto 4 suele costar medio punto.
              </div>
            </li>
          </ul>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Método en 7 Pasos: Analizar Figuras en Selectividad</h2>
          <p className={styles.introParagraph}>
            Sigue este método sistemático en cualquier comentario de texto de acceso a la universidad
            para identificar y analizar figuras retóricas de forma completa y ordenada.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Primera lectura global</strong>
                <p>Lee el fragmento completo sin tomar notas. Identifica el tema, el género (lírico, narrativo,
                ensayístico) y el tono general (melancólico, irónico, exaltado). Esto te orienta sobre qué
                figuras son más probables.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Localizar marcas fónicas</strong>
                <p>Busca repetición de sonidos consonánticos (aliteración), imitación de ruidos (onomatopeya)
                y juegos de palabras con sonido similar (paronomasia). Léelo en voz alta si puedes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Detectar repeticiones sintácticas</strong>
                <p>Subraya palabras que se repiten al inicio de frases (anáfora), al final (epífora) o
                estructuras gramaticales paralelas. El paralelismo crea ritmo y equilibrio visual en el texto.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Identificar alteraciones del orden</strong>
                <p>Pregúntate si el orden de palabras es el habitual en español. Si una frase suena
                "rara" al leerla, posiblemente hay un hipérbaton. Reconstruye el orden normal y verifica
                si la inversión enfatiza algún elemento.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Analizar el plano semántico</strong>
                <p>Busca palabras usadas en sentido no literal. ¿Se identifican dos realidades diferentes
                (metáfora)? ¿Se usa una palabra por otra con la que guarda relación lógica (metonimia)?
                ¿Se comparan dos cosas con nexo explícito (símil)?</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>Explorar el plano del pensamiento</strong>
                <p>¿Hay exageración evidente (hipérbole)? ¿Se dice lo contrario de lo que se piensa
                (ironía)? ¿Se contraponen ideas opuestas (antítesis)? ¿Hay una contradicción lógica
                que encierra verdad (paradoja)? Estas figuras actúan sobre las ideas, no sobre las palabras.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <strong>Redactar el análisis con efecto estético</strong>
                <p>Para cada figura: nombre + cita textual + explicación del mecanismo + efecto en el lector.
                Usa verbos como <em>intensifica</em>, <em>crea</em>, <em>refuerza</em>, <em>subraya</em>,
                <em>evoca</em>. Nunca te limites a nombrar la figura sin explicar por qué el autor la usa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>6 Consejos para Memorizar Figuras Retóricas</h2>
          <p className={styles.introParagraph}>
            Estas estrategias de estudio han demostrado ser más eficaces que memorizar definiciones
            de forma aislada. El secreto está en trabajar con textos reales.
          </p>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📖</span>
              <strong>Aprende con textos reales</strong>
              <p>Estudia cada figura con un verso auténtico de Lorca, Machado, Neruda o Quevedo.
              Los ejemplos inventados son más difíciles de recordar que los versos que ya conoces.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <strong>Agrupa por categoría</strong>
              <p>Memoriza las figuras por grupos (fónica, sintáctica, semántica, pensamiento).
              Dentro de cada grupo, estudia las figuras de dos en dos comparando sus diferencias.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✍️</span>
              <strong>Practica con poemas cortos</strong>
              <p>Elige un soneto de Quevedo o Góngora y analiza todas sus figuras. La densidad
              estilística del Barroco ofrece varios ejemplos por estrofa para practicar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Memoriza 3 ejemplos canónicos por figura</strong>
              <p>Para cada figura, aprende de memoria al menos un verso de un autor reconocido.
              Citarlo en el examen demuestra cultura literaria y suma en la valoración.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <strong>Repasa en sesiones cortas y frecuentes</strong>
              <p>10 minutos de quiz diario durante dos semanas supera a una sesión de estudio
              intensivo de dos horas. La memoria a largo plazo se consolida con repetición espaciada.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗣️</span>
              <strong>Explícalas en voz alta</strong>
              <p>Practica explicar cada figura como si se la explicaras a un compañero que no la conoce.
              Verbalizar el mecanismo activa una vía de memorización diferente a la lectura silenciosa.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores frecuentes en exámenes de lengua</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir metáfora con símil:</strong> si hay <em>como</em>, <em>cual</em> o
                <em> semejante a</em>, es un símil, no una metáfora. La metáfora identifica directamente
                sin nexo comparativo.
              </li>
              <li>
                <strong>Confundir metonimia con sinécdoque:</strong> la metonimia opera por contigüidad
                lógica (causa/efecto, símbolo/simbolizado); la sinécdoque opera por relación cuantitativa
                (parte/todo, todo/parte).
              </li>
              <li>
                <strong>Llamar hipérbole a cualquier exageración coloquial:</strong> la hipérbole es una
                figura literaria con función estética deliberada. Decir "tengo un hambre de lobo" en
                una conversación informal no es necesariamente una hipérbole retórica estudiable.
              </li>
              <li>
                <strong>Confundir anáfora con simple repetición:</strong> la anáfora exige repetición
                <em> al inicio</em> de versos o frases consecutivas. La repetición en posición media o
                final tiene otros nombres (epífora, anadiplosis, concatenación).
              </li>
              <li>
                <strong>No explicar el efecto estético:</strong> nombrar la figura y citar el fragmento
                no basta. El examinador valora que el alumno explique <em>por qué</em> el autor usa esa
                figura y qué efecto produce en el lector o en el sentido del texto.
              </li>
              <li>
                <strong>Confundir ironía con antífrasis o sarcasmo:</strong> la antífrasis es el uso de
                una palabra en sentido contrario al propio (<em>"¡Valiente héroe!"</em> dicho con burla).
                La ironía es más amplia e incluye la antífrasis. El sarcasmo añade un componente hiriente
                que la ironía literaria no siempre tiene.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-figuras-retoricas')} />
      <ShareCard appName="quiz-figuras-retoricas" />
      <Footer appName="quiz-figuras-retoricas" />
    </div>
  );
}
