'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './QuizReinosNaturaleza.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { organismosNaturaleza, OrganismoNaturaleza } from '@/data/organismos-naturaleza';

type Nivel = 'basico' | 'intermedio' | 'avanzado' | 'todos';
type Pantalla = 'config' | 'quiz' | 'resultado';

interface PreguntaQuiz {
  organismo: OrganismoNaturaleza;
  opciones: string[];
  respuestaCorrecta: string;
}

const NIVEL_CONFIG: Record<Nivel, { label: string; desc: string }> = {
  basico:      { label: '🟢 Básico',       desc: '20 animales contraintuitivos'       },
  intermedio:  { label: '🟡 Intermedio',   desc: '13 hongos, plantas y algas'         },
  avanzado:    { label: '🔴 Avanzado',     desc: '10 microorganismos y casos límite'  },
  todos:       { label: '⭐ Todos',        desc: '43 organismos sorprendentes'        },
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

function generarPreguntas(nivel: Nivel, numPreguntas: number): PreguntaQuiz[] {
  const pool = nivel === 'todos'
    ? organismosNaturaleza
    : organismosNaturaleza.filter(o => o.nivel === nivel);

  const seleccionados = mezclar(pool).slice(0, Math.min(numPreguntas, pool.length));

  return seleccionados.map(organismo => {
    // opciones = respuesta correcta + 3 distractores específicos mezclados
    const opciones = mezclar([organismo.grupo, ...organismo.confundibleCon]);
    return { organismo, opciones, respuestaCorrecta: organismo.grupo };
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
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Eres un experto en biología!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy buena puntuación!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue practicando' };
}

const NIVEL_ETIQUETA: Record<string, string> = {
  basico:      '🟢 Básico',
  intermedio:  '🟡 Intermedio',
  avanzado:    '🔴 Avanzado',
};

export default function QuizReinosNaturalezaPage() {
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
        <h1 className={styles.title}>Quiz Reinos de la Naturaleza 🔬</h1>
        <p className={styles.subtitle}>
          ¿Animal, planta, hongo o bacteria? 43 organismos que sorprenden · Con curiosidades científicas
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
            <p className={styles.preguntaEtiqueta}>¿A qué grupo pertenece...?</p>
            <p className={styles.organismoNombre}>{pregunta.organismo.nombre}</p>
            <span className={styles.nivelBadge}>
              {NIVEL_ETIQUETA[pregunta.organismo.nivel]}
            </span>
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

          {/* Feedback educativo */}
          {seleccionada !== null && (
            <>
              <div
                className={`${styles.feedbackPanel} ${seleccionada === pregunta.respuestaCorrecta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                role="alert"
                aria-live="polite"
              >
                <div className={styles.feedbackCabecera}>
                  <span className={styles.feedbackIcono}>
                    {seleccionada === pregunta.respuestaCorrecta ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className={styles.feedbackResultado}>
                      {seleccionada === pregunta.respuestaCorrecta ? '¡Correcto!' : 'Incorrecto'}
                    </p>
                    <p className={styles.feedbackGrupo}>{pregunta.organismo.grupo}</p>
                    <p className={styles.feedbackNombreOrg}>{pregunta.organismo.nombre}</p>
                  </div>
                </div>

                <div className={styles.feedbackBloque}>
                  <span className={styles.feedbackBloqueIcono} aria-hidden="true">🔬</span>
                  <p>{pregunta.organismo.porQueConfunde}</p>
                </div>

                <div className={styles.feedbackBloque}>
                  <span className={styles.feedbackBloqueIcono} aria-hidden="true">💡</span>
                  <p>{pregunta.organismo.curiosidad}</p>
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

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Guía completa: Los Reinos de la Naturaleza"
        subtitle="Clasificación biológica, diferencias clave y cómo no confundirte en el examen"
        icon="🔬"
      >
        {/* 1. TABLA COMPARATIVA */}
        <section aria-labelledby="edu-tabla">
          <h4 id="edu-tabla">🗂️ Los 6 Reinos: Tabla Comparativa</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Reino</th>
                  <th>Tipo celular</th>
                  <th>Nutrición</th>
                  <th>Reproducción</th>
                  <th>Ejemplos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Animalia</strong></td>
                  <td>Eucariota</td>
                  <td>Heterótrofa (ingestión)</td>
                  <td>Sexual (mayoritariamente)</td>
                  <td>Perro, ballena, coral, esponja</td>
                </tr>
                <tr>
                  <td><strong>Plantae</strong></td>
                  <td>Eucariota</td>
                  <td>Autótrofa (fotosíntesis)</td>
                  <td>Sexual y asexual</td>
                  <td>Roble, helecho, musgo, trigo</td>
                </tr>
                <tr>
                  <td><strong>Fungi</strong></td>
                  <td>Eucariota</td>
                  <td>Heterótrofa (absorción)</td>
                  <td>Esporas (sexual/asexual)</td>
                  <td>Champiñón, moho, levadura, trufa</td>
                </tr>
                <tr>
                  <td><strong>Protista</strong></td>
                  <td>Eucariota</td>
                  <td>Autótrofa/Heterótrofa</td>
                  <td>Sexual y asexual</td>
                  <td>Algas, ameba, plasmodio, kelp</td>
                </tr>
                <tr>
                  <td><strong>Bacteria (Eubacteria)</strong></td>
                  <td>Procariota</td>
                  <td>Autótrofa/Heterótrofa</td>
                  <td>Fisión binaria (asexual)</td>
                  <td>E. coli, lactobacillus, cianobacteria</td>
                </tr>
                <tr>
                  <td><strong>Archaea</strong></td>
                  <td>Procariota</td>
                  <td>Autótrofa/Heterótrofa</td>
                  <td>Fisión binaria (asexual)</td>
                  <td>Metanógenos, halófilos, termófilos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CASOS DE USO */}
        <section aria-labelledby="edu-escenarios">
          <h4 id="edu-escenarios">👤 ¿Para quién es este quiz?</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <strong>Estudiante de ESO (3.º-4.º)</strong>
              </div>
              <p className={styles.escenarioExample}>Preparando el examen de Biología y Geología. Necesitas saber los reinos básicos y los organismos más comunes.</p>
              <p className={styles.escenarioTip}>Empieza con el nivel <strong>Básico</strong> y céntrate en los 20 organismos contraintuitivos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📖</span>
                <strong>Estudiante de Bachillerato / Selectividad</strong>
              </div>
              <p className={styles.escenarioExample}>La EvAU puede incluir preguntas sobre Archaea, Protista y diferencias pro/eucariota. Cada punto cuenta.</p>
              <p className={styles.escenarioTip}>Practica en modo <strong>Todos</strong> y revisa las curiosidades científicas de cada feedback.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌿</span>
                <strong>Aficionado a la naturaleza</strong>
              </div>
              <p className={styles.escenarioExample}>Quieres clasificar correctamente los organismos que encuentras en excursiones o en fotografía de naturaleza.</p>
              <p className={styles.escenarioTip}>Presta atención a las categorías <strong>Fungi</strong> y <strong>Protista</strong>, que más sorprenden en campo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏫</span>
                <strong>Docente de Biología</strong>
              </div>
              <p className={styles.escenarioExample}>Buscas material dinámico para explicar taxonomía en clase o como actividad de repaso gamificada.</p>
              <p className={styles.escenarioTip}>El nivel <strong>Avanzado</strong> con los microorganismos es ideal para alumnos de Biología de 2.º de Bach.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section aria-labelledby="edu-faq">
          <h4 id="edu-faq">❓ Preguntas Frecuentes sobre los Reinos</h4>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cuántos reinos hay actualmente en biología?</dt>
              <dd>Depende del sistema de clasificación. El sistema de <strong>6 reinos</strong> (Animalia, Plantae, Fungi, Protista, Eubacteria, Archaea) es el más usado en la educación secundaria española. En investigación moderna se usa el sistema de 3 dominios (Bacteria, Archaea, Eukarya), que agrupa los primeros cuatro reinos bajo Eukarya.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué los hongos no son plantas?</dt>
              <dd>Porque no realizan la fotosíntesis. Los hongos son <strong>heterótrofos por absorción</strong>: secretan enzimas digestivas al exterior y absorben los nutrientes del medio. Además, su pared celular está hecha de <strong>quitina</strong> (como el exoesqueleto de los insectos), no de celulosa como las plantas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuál es la diferencia entre bacteria y archaea?</dt>
              <dd>Ambas son organismos <strong>procariotas</strong> (sin núcleo definido), pero difieren en su bioquímica. Las Archaea tienen lípidos de membrana únicos (éteres en lugar de ésteres), una maquinaria genética más parecida a los eucariotas y suelen vivir en ambientes extremos (termófilos, halófilos, metanógenos). Las bacterias tienen peptidoglicano en la pared celular; las Archaea no.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Los virus pertenecen a algún reino?</dt>
              <dd><strong>No.</strong> Los virus no están incluidos en ningún reino de la clasificación biológica estándar porque no cumplen los criterios de ser seres vivos de forma autónoma: carecen de metabolismo propio, no tienen células y solo se reproducen dentro de un huésped. Son entidades biológicas al margen de la clasificación de los seres vivos.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es la taxonomía de Linneo?</dt>
              <dd>Carl von Linné (siglo XVIII) creó el sistema de <strong>nomenclatura binomial</strong>: cada especie recibe un nombre en dos palabras latinas (género + especie), por ejemplo <em>Homo sapiens</em>. También estableció la jerarquía taxonómica: Reino → Filo → Clase → Orden → Familia → Género → Especie. Es la base de la clasificación biológica moderna.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre procariontes y eucariontes?</dt>
              <dd>Los <strong>procariontes</strong> (Bacteria y Archaea) no tienen núcleo celular delimitado por membrana; su material genético flota en el citoplasma. Los <strong>eucariontes</strong> (Animalia, Plantae, Fungi y Protista) tienen núcleo verdadero rodeado de membrana nuclear, además de orgánulos membranosos como mitocondrias y (en plantas) cloroplastos.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿A qué reino pertenecen las algas?</dt>
              <dd>La mayoría de las algas (macroalgas y microalgas como la <em>Chlorella</em>) pertenecen al reino <strong>Protista</strong>, no a Plantae. Solo los briófitos y plantas vasculares forman el reino Plantae. Las algas verdes (<em>Chlorophyta</em>) son el grupo más relacionado filogenéticamente con las plantas terrestres, pero taxonómicamente siguen siendo Protistas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo ha evolucionado la clasificación de los reinos a lo largo de la historia?</dt>
              <dd>Aristóteles (siglo IV a.C.) dividió los seres vivos en solo 2 grupos: animales y plantas. En 1866, Haeckel añadió el reino Protista para los unicelulares. En 1969, Whittaker propuso el sistema de <strong>5 reinos</strong> (Monera, Protista, Fungi, Plantae, Animalia). En 1977, Carl Woese descubrió las Archaea mediante análisis del ARNr 16S, dando lugar al sistema de 6 reinos y más tarde a la clasificación en 3 dominios.</dd>
            </div>
          </dl>
        </section>

        {/* 4. GUÍA PASO A PASO */}
        <section aria-labelledby="edu-guia">
          <h4 id="edu-guia">🔍 Cómo Clasificar un Organismo Desconocido (7 pasos)</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>¿Tiene células?</strong>
                <p>Si no tiene estructura celular propia (por ejemplo, un virus), no pertenece a ningún reino. Si tiene células, continúa.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>¿Es procariota o eucariota?</strong>
                <p>Observa si tiene núcleo celular definido. Si carece de núcleo → <strong>Bacteria o Archaea</strong>. Si tiene núcleo → sigue al paso 3.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>¿Procariota: qué tipo?</strong>
                <p>Analiza su bioquímica: si tiene peptidoglicano en la pared celular → <strong>Bacteria (Eubacteria)</strong>. Si tiene lípidos de membrana tipo éter y vive en ambientes extremos → <strong>Archaea</strong>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Eucariota: ¿es unicelular o pluricelular?</strong>
                <p>Si es unicelular o forma colonias simples sin diferenciación de tejidos → muy probablemente <strong>Protista</strong>. Si es pluricelular con tejidos diferenciados → pasa al paso 5.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Eucariota pluricelular: ¿realiza fotosíntesis?</strong>
                <p>Si tiene cloroplastos y realiza fotosíntesis → <strong>Plantae</strong>. Si no realiza fotosíntesis → continúa.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Sin fotosíntesis: ¿cómo se nutre?</strong>
                <p>Si se nutre por <strong>absorción</strong> (secreta enzimas al exterior) → <strong>Fungi</strong>. Si se nutre por <strong>ingestión</strong> (ingiere alimento) → <strong>Animalia</strong>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Verifica con características adicionales</strong>
                <p>Confirma con otros rasgos: ¿tiene pared celular de celulosa (Plantae), quitina (Fungi) o carece de pared celular (Animalia)? ¿Se reproduce por esporas (Fungi), semillas (Plantae) o huevos/parto (Animalia)?</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section aria-labelledby="edu-tips">
          <h4 id="edu-tips">💡 Consejos para Memorizar los Reinos</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <p><strong>Aprende las características exclusivas</strong> de cada reino, no las compartidas. Lo que diferencia es lo que debes recordar: quitina (Fungi), celulosa (Plantae), ingestión (Animalia).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚠️</span>
              <p><strong>Estudia los organismos trampa:</strong> hongos que parecen plantas (setas), algas que parecen plantas (kelp), animales que no se mueven (esponjas, corales). Son los favoritos del examen.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌳</span>
              <p><strong>Usa árboles filogenéticos visuales.</strong> Ver la relación evolutiva entre reinos (Archaea → Eukarya) ayuda a recordar por qué los hongos están más relacionados con animales que con plantas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <p><strong>Estudia por contraste de reinos opuestos:</strong> compara Animalia vs. Plantae, Bacteria vs. Archaea, Fungi vs. Plantae. El método comparativo fija mejor que memorizar cada reino por separado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <p><strong>Crea una tabla de elaboración propia</strong> con los 6 reinos y 5 columnas (célula, nutrición, pared, reproducción, ejemplos). El proceso de crear la tabla ya es un repaso activo eficaz.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔬</span>
              <p><strong>Relaciona los reinos con la historia de la ciencia:</strong> recordar que Haeckel añadió Protista (1866) y Woese descubrió Archaea (1977) da contexto y hace la información más memorable.</p>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <section aria-labelledby="edu-errores">
          <h4 id="edu-errores">🚫 Errores Más Comunes en Biología</h4>
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Confusiones frecuentes que penalizan en el examen</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Clasificar los hongos como plantas:</strong> los hongos NO realizan fotosíntesis y su pared celular es de quitina, no de celulosa. Son más parecidos a los animales que a las plantas en términos evolutivos.</li>
              <li><strong>Pensar que los virus son un reino:</strong> los virus no están clasificados en ningún reino porque no son seres vivos según los criterios biológicos estándar (no tienen metabolismo ni estructura celular propia).</li>
              <li><strong>Confundir algas con plantas:</strong> la mayoría de las algas (kelp, alga verde unicelular, diatomeas) pertenecen al reino Protista, no a Plantae. Solo las plantas terrestres (briófitos, helechos, gimnospermas, angiospermas) son Plantae.</li>
              <li><strong>Creer que bacteria y archaea son lo mismo:</strong> ambas son procariotas, pero son grupos completamente distintos con bioquímica diferente. Las Archaea están más relacionadas con los eucariotas que con las bacterias.</li>
              <li><strong>Ignorar que Protista es un reino &quot;cajón de sastre&quot;:</strong> Protista agrupa organismos eucariotas que no encajan en Animalia, Plantae ni Fungi. Es un grupo artificial muy diverso que en la taxonomía moderna se divide en múltiples linajes.</li>
              <li><strong>Asumir que todos los unicelulares son bacterias:</strong> existen eucariotas unicelulares (Protistas como la ameba, el paramecio o la euglena) y procariotas unicelulares (bacterias y arqueas). El tamaño de la célula y la presencia de núcleo son claves para distinguirlos.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-reinos-naturaleza')} />
      <ShareCard appName="quiz-reinos-naturaleza" />
      <Footer appName="quiz-reinos-naturaleza" />
    </div>
  );
}
