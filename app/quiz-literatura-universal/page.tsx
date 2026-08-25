'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QuizLiteraturaUniversal.module.css';
import { POOL, preguntasDeNivel, type Nivel, type Categoria, type Pregunta } from './preguntas';

// ── Tipos ──────────────────────────────────────────────────────────────────

type Fase = 'seleccion' | 'quiz' | 'resultado';

/** Una pregunta con sus opciones ya barajadas para esta partida. */
interface PreguntaEnJuego extends Pregunta {
  /** Índice de la respuesta correcta DENTRO de `opciones` una vez barajadas. */
  correcta: number;
}

const PREGUNTAS_POR_PARTIDA = 15;

const NIVEL_CONFIG: Record<Nivel, { label: string; emoji: string; color: string; desc: string }> = {
  basico: { label: 'Básico', emoji: '📗', color: '#27AE60', desc: 'Autores y obras conocidas' },
  medio: { label: 'Medio', emoji: '📘', color: '#2E86AB', desc: 'Contexto y técnicas literarias' },
  avanzado: { label: 'Avanzado', emoji: '📕', color: '#8B2635', desc: 'Teoría, movimientos y detalles' },
};

// Emoji y rótulo separados: dentro de una misma cadena, el lector de pantalla verbaliza
// «pluma estilográfica Autores» y no hay forma de marcarlo aria-hidden (hallazgo 305).
const CATEGORIA_LABEL: Record<Categoria, { emoji: string; label: string }> = {
  autores: { emoji: '✒️', label: 'Autores' },
  obras: { emoji: '📖', label: 'Obras' },
  movimientos: { emoji: '🎭', label: 'Movimientos' },
  citas: { emoji: '💬', label: 'Citas' },
};

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Baraja las opciones de una pregunta y recoloca el índice de la correcta.
 *
 * Sin esto, el banco decidía la partida: la respuesta correcta estaba 0 veces en A, 3 en B,
 * 19 en C y 24 en D, así que responder siempre «D» sacaba 24/46 sin saber nada de literatura
 * y responder siempre «A» sacaba cero garantizado (hallazgo 300). Se baraja UNA vez, al
 * componer la partida, y no en cada render: si se rebarajara al pintar, las opciones
 * saltarían de sitio bajo el cursor entre responder y pulsar «Siguiente».
 */
function barajarOpciones(p: Pregunta): PreguntaEnJuego {
  const indices = mezclar(p.opciones.map((_, i) => i));
  return {
    ...p,
    opciones: indices.map(i => p.opciones[i]),
    correcta: indices.indexOf(p.correcta),
  };
}

/** Cuántas preguntas va a tener de verdad una partida de este nivel. */
function tamanoPartida(nivel: Nivel | 'todos'): number {
  return Math.min(PREGUNTAS_POR_PARTIDA, preguntasDeNivel(nivel).length);
}

function seleccionarPreguntas(nivel: Nivel | 'todos'): PreguntaEnJuego[] {
  return mezclar(preguntasDeNivel(nivel))
    .slice(0, PREGUNTAS_POR_PARTIDA)
    .map(barajarOpciones);
}

function evaluacion(aciertos: number, total: number): { label: string; emoji: string; color: string } {
  const pct = aciertos / total;
  if (pct >= 0.9) return { label: '¡Excelente! Dominas la literatura.', emoji: '🏆', color: '#F39C12' };
  if (pct >= 0.7) return { label: 'Muy bien. Buen nivel literario.', emoji: '🌟', color: '#27AE60' };
  if (pct >= 0.5) return { label: 'Bien. Hay terreno por explorar.', emoji: '📚', color: '#2E86AB' };
  return { label: 'Sigue leyendo. El conocimiento llega con tiempo.', emoji: '🌱', color: '#7F8C8D' };
}

export default function QuizLiteraturaUniversal() {
  const [fase, setFase] = useState<Fase>('seleccion');
  const [nivelElegido, setNivelElegido] = useState<Nivel | 'todos'>('todos');
  const [preguntas, setPreguntas] = useState<PreguntaEnJuego[]>([]);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [aciertos, setAciertos] = useState(0);

  const preguntaActual = preguntas[indice] ?? null;

  const evalFinal = useMemo(
    () => (fase === 'resultado' ? evaluacion(aciertos, preguntas.length) : null),
    [fase, aciertos, preguntas.length]
  );

  const handleIniciar = useCallback(() => {
    setPreguntas(seleccionarPreguntas(nivelElegido));
    setIndice(0);
    setSeleccionada(null);
    setRespondida(false);
    setAciertos(0);
    setFase('quiz');
  }, [nivelElegido]);

  function handleRespuesta(idx: number) {
    if (respondida) return;
    setSeleccionada(idx);
    setRespondida(true);
    if (preguntaActual && idx === preguntaActual.correcta) {
      setAciertos(a => a + 1);
    }
  }

  function handleSiguiente() {
    if (indice + 1 >= preguntas.length) {
      setFase('resultado');
    } else {
      setIndice(i => i + 1);
      setSeleccionada(null);
      setRespondida(false);
    }
  }

  function handleReiniciar() {
    setFase('seleccion');
    setIndice(0);
    setSeleccionada(null);
    setRespondida(false);
    setAciertos(0);
  }

  const progreso = preguntas.length > 0 ? Math.round(((indice + (respondida ? 1 : 0)) / preguntas.length) * 100) : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Quiz de Literatura Universal</h1>
        <p className={styles.heroSubtitle}>
          Pon a prueba tus conocimientos literarios: autores, obras, movimientos y citas célebres.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── Pantalla de selección ── */}
        {fase === 'seleccion' && (
          <section className={styles.seleccionBox}>
            <h2 className={styles.seleccionTitle}>Elige el nivel de dificultad</h2>
            <div className={styles.nivelesGrid}>
              {(['basico', 'medio', 'avanzado'] as Nivel[]).map(n => (
                <button
                  type="button"
                  key={n}
                  className={`${styles.nivelBtn} ${nivelElegido === n ? styles.nivelBtnActivo : ''}`}
                  style={nivelElegido === n ? { borderColor: NIVEL_CONFIG[n].color, background: NIVEL_CONFIG[n].color + '18' } : {}}
                  onClick={() => setNivelElegido(n)}
                  aria-pressed={nivelElegido === n}
                >
                  <span className={styles.nivelEmoji} aria-hidden="true">{NIVEL_CONFIG[n].emoji}</span>
                  <span className={styles.nivelLabel}>{NIVEL_CONFIG[n].label}</span>
                  <span className={styles.nivelDesc}>{NIVEL_CONFIG[n].desc}</span>
                </button>
              ))}
              <button
                type="button"
                className={`${styles.nivelBtn} ${nivelElegido === 'todos' ? styles.nivelBtnActivo : ''}`}
                style={nivelElegido === 'todos' ? { borderColor: '#7B5EA7', background: '#7B5EA714' } : {}}
                onClick={() => setNivelElegido('todos')}
                aria-pressed={nivelElegido === 'todos'}
              >
                <span className={styles.nivelEmoji} aria-hidden="true">🎲</span>
                <span className={styles.nivelLabel}>Mezcla</span>
                <span className={styles.nivelDesc}>Preguntas de todos los niveles</span>
              </button>
            </div>
            {/* La cifra sale del banco, no de una constante: el nivel Avanzado prometía 15
                preguntas y entregaba 13, porque no tenía más (hallazgo 298). Escrita así,
                la promesa no puede volver a ser mayor que el banco. */}
            <p className={styles.seleccionInfo}>
              {tamanoPartida(nivelElegido)} preguntas aleatorias · Explicación tras cada respuesta
            </p>
            <button type="button" className={styles.btnIniciar} onClick={handleIniciar}>
              Empezar el quiz →
            </button>
          </section>
        )}

        {/* ── Quiz ── */}
        {fase === 'quiz' && preguntaActual && (
          <section className={styles.quizBox}>
            {/* Cabecera */}
            <div className={styles.quizCabecera}>
              <div className={styles.quizProgreso}>
                <span className={styles.quizNumero}>{indice + 1}/{preguntas.length}</span>
                <div className={styles.progresoBar}>
                  <div className={styles.progresoFill} style={{ width: `${progreso}%` }} />
                </div>
              </div>
              <div className={styles.quizMeta}>
                <span className={styles.quizNivel} style={{ color: NIVEL_CONFIG[preguntaActual.nivel].color }}>
                  <span aria-hidden="true">{NIVEL_CONFIG[preguntaActual.nivel].emoji}</span>{' '}
                  {NIVEL_CONFIG[preguntaActual.nivel].label}
                </span>
                <span className={styles.quizCategoria}>
                  <span aria-hidden="true">{CATEGORIA_LABEL[preguntaActual.categoria].emoji}</span>{' '}
                  {CATEGORIA_LABEL[preguntaActual.categoria].label}
                </span>
              </div>
            </div>

            {/* Pregunta */}
            <h2 className={styles.pregunta}>{preguntaActual.pregunta}</h2>

            {/* Opciones */}
            <div className={styles.opciones}>
              {preguntaActual.opciones.map((opcion, i) => {
                let estadoClass = '';
                if (respondida) {
                  if (i === preguntaActual.correcta) estadoClass = styles.opcionCorrecta;
                  else if (i === seleccionada) estadoClass = styles.opcionIncorrecta;
                } else if (seleccionada === i) {
                  estadoClass = styles.opcionSeleccionada;
                }
                // Corregido/fallado NO puede ir solo en el color ni en unas marcas que son
                // aria-hidden (WCAG 1.4.1, hallazgo 303): va en el nombre accesible del
                // botón. Y SIN aria-pressed: son botones de acción que se deshabilitan al
                // pulsarlos, así que nunca pueden despulsarse y un lector de pantalla
                // anunciaba cuatro «botones de alternar, no pulsados» (hallazgo 304).
                const marca = !respondida
                  ? ''
                  : i === preguntaActual.correcta
                    ? ' (respuesta correcta)'
                    : i === seleccionada
                      ? ' (tu respuesta, incorrecta)'
                      : '';
                return (
                  <button
                    type="button"
                    key={i}
                    className={`${styles.opcion} ${estadoClass}`}
                    onClick={() => handleRespuesta(i)}
                    disabled={respondida}
                    aria-label={`${String.fromCharCode(65 + i)}. ${opcion}${marca}`}
                  >
                    <span className={styles.opcionLetra}>{String.fromCharCode(65 + i)}</span>
                    <span className={styles.opcionTexto}>{opcion}</span>
                    {respondida && i === preguntaActual.correcta && <span className={styles.opcionMarca} aria-hidden="true">✓</span>}
                    {respondida && i === seleccionada && i !== preguntaActual.correcta && <span className={styles.opcionMarca} aria-hidden="true">✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Explicación — region live: sin ella, quien no distinga el color no sabe si ha
                acertado hasta el marcador final. */}
            <div role="status" aria-live="polite" aria-atomic="true">
              {respondida && (
                <div className={`${styles.explicacion} ${seleccionada === preguntaActual.correcta ? styles.explicacionBien : styles.explicacionMal}`}>
                  <p className={styles.explicacionVeredicto}>
                    {seleccionada === preguntaActual.correcta
                      ? '¡Correcto!'
                      : `Incorrecto. La respuesta era: ${preguntaActual.opciones[preguntaActual.correcta]}`}
                  </p>
                  <p className={styles.explicacionTexto}>{preguntaActual.explicacion}</p>
                </div>
              )}
            </div>

            {respondida && (
              <button type="button" className={styles.btnSiguiente} onClick={handleSiguiente}>
                {indice + 1 < preguntas.length ? 'Siguiente →' : 'Ver resultado'}
              </button>
            )}

            {/* Empezada una partida no había forma de salir de ella: cambiar de nivel o
                rendirse obligaba a recargar la página (hallazgo 310). */}
            <button type="button" className={styles.btnAbandonar} onClick={handleReiniciar}>
              ← Cambiar de nivel
            </button>
          </section>
        )}

        {/* ── Resultado ── */}
        {fase === 'resultado' && evalFinal && (
          <section className={styles.resultadoBox}>
            <div className={styles.resultadoCard}>
              <div className={styles.resultadoHeader} style={{ borderColor: evalFinal.color }}>
                <span className={styles.resultadoEmoji} aria-hidden="true">{evalFinal.emoji}</span>
                <div>
                  <p className={styles.resultadoPuntuacion}>
                    <strong>{aciertos}</strong> / {preguntas.length} correctas
                  </p>
                  <p className={styles.resultadoLabel}>{evalFinal.label}</p>
                </div>
              </div>

              <div className={styles.resultadoBarra}>
                <div
                  className={styles.resultadoBarraFill}
                  style={{
                    width: `${Math.round((aciertos / preguntas.length) * 100)}%`,
                    background: evalFinal.color,
                  }}
                />
              </div>

              <div className={styles.resultadoBotones}>
                <button type="button" className={styles.btnReiniciar} onClick={handleReiniciar}>
                  <span aria-hidden="true">🔄</span> Jugar de nuevo
                </button>
              </div>
            </div>
          </section>
        )}

        <EducationalSection title="Literatura universal — guía de referencia" subtitle="Movimientos, autores y obras clave de la historia literaria">
          <div className={styles.guideSection}>
            <p>La literatura universal abarca miles de años de escritura en todas las lenguas. Este quiz cubre un muestreo representativo de las obras y autores que han definido la tradición literaria occidental y latinoamericana.</p>

            <h3>Niveles del quiz</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr><th>Nivel</th><th>Qué evalúa</th><th>Ejemplos de preguntas</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span aria-hidden="true">📗</span> Básico</td>
                    <td>Autores y obras conocidos, primeras frases famosas</td>
                    <td>¿Quién escribió Cien años de soledad? ¿De qué obra es «Llamadme Ismael»?</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">📘</span> Medio</td>
                    <td>Contexto histórico, técnicas literarias, premios y generaciones</td>
                    <td>¿A qué generación pertenece Lorca? ¿Qué es el flujo de conciencia?</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">📕</span> Avanzado</td>
                    <td>Teoría literaria, crítica, movimientos menores, autores internacionales</td>
                    <td>¿Quién acuñó «defamiliarización»? ¿Qué es el Nouveau Roman?</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>¿Quién usa este quiz?</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
                  <h4>Estudiante de bachillerato</h4>
                </div>
                <p>Repasa literatura española y universal para el examen. El nivel básico cubre los autores y obras más frecuentes en los temarios.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">📚</span>
                  <h4>Lector curioso</h4>
                </div>
                <p>Quiere saber si sus lecturas le dan una base cultural sólida. El nivel medio mide contexto y técnica, no solo títulos.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">✍️</span>
                  <h4>Escritor en formación</h4>
                </div>
                <p>Usa el quiz para identificar sus lagunas: qué movimientos conoce poco, qué autores debería leer antes de encontrar su voz.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcono} aria-hidden="true">🏫</span>
                  <h4>Docente de Lengua</h4>
                </div>
                <p>Usa las preguntas como base para actividades de clase: «¿qué movimiento viene después del Romanticismo?».</p>
              </div>
            </div>

            <h3>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Puedo repetir el quiz con preguntas distintas?</h4>
                <p>Sí. Cada partida selecciona 15 preguntas aleatorias del pool. Con varios intentos verás preguntas diferentes, especialmente si juegas en modo «Mezcla».</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Las explicaciones son fuente suficiente para estudiar?</h4>
                <p>Son orientativas y correctas, pero breves. Para un examen, úsalas como recordatorio, no como material de estudio primario. Complementa con manuales de historia literaria.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Por qué hay más preguntas sobre literatura occidental?</h4>
                <p>El grueso del banco es literatura europea, estadounidense e hispanoamericana, que es la que más peso tiene en los programas educativos del ámbito hispanohablante. También hay preguntas de literatura japonesa, china, árabe, persa, india, coreana y africana —de Murasaki Shikibu a Han Kang—, aunque en menor número: la proporción responde a la presencia curricular, no al valor literario.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Qué nivel debo elegir si soy principiante?</h4>
                <p>Empieza por «Básico» para calibrar. Si aciertas más del 80%, sube a «Medio». Si en Medio superas el 70%, prueba «Avanzado». La «Mezcla» es el modo más desafiante.</p>
              </div>
            </div>

            <h3>Estrategia para mejorar</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Haz el nivel básico hasta superar el 85%</h4>
                  <p>Los autores y obras básicos son la base. Sin ellos, el contexto de las preguntas de nivel medio no se entiende.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Lee las explicaciones de los errores</h4>
                  <p>Cada pregunta fallada tiene una explicación concisa. Es el momento de aprendizaje más eficiente del quiz.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Conecta los autores con su movimiento</h4>
                  <p>Muchas preguntas de nivel medio te piden contexto. Memorizar qué autor pertenece a qué movimiento multiplica las respuestas correctas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Complementa con el Visualizador de Estilos Literarios</h4>
                  <p>Cada movimiento literario del visualizador corresponde a un bloque de preguntas del quiz. Úsalos en paralelo.</p>
                </div>
              </div>
            </div>

            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🗓️</span>
                <h4>Ordena por épocas</h4>
                <p>Neoclasicismo → Romanticismo → Realismo → Naturalismo → Modernismo → Vanguardias → Literatura actual.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🌍</span>
                <h4>Agrupa por países</h4>
                <p>Francia (Zola, Proust, Camus), Rusia (Tolstói, Dostoievski), España (Cervantes, Lorca), Latinoamérica (García Márquez, Borges, Rulfo).</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🏆</span>
                <h4>Nobel como referencia</h4>
                <p>Los premios Nobel son un buen mapa: Mistral (1945), Camus (1957), García Márquez (1982), Vargas Llosa (2010).</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">📝</span>
                <h4>Lleva cuenta de los errores</h4>
                <p>Anota qué categoría fallas más (autores, obras, movimientos, citas) y céntrate en esa en la siguiente partida.</p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
                <h4>Errores frecuentes en preguntas de literatura</h4>
              </div>
              <ul className={styles.warningList}>
                <li>Confundir el autor de una obra con el narrador o protagonista de la misma.</li>
                <li>Asumir que el autor y su obra pertenecen al mismo país (Kafka era checo pero escribía en alemán).</li>
                <li>Confundir el Modernismo hispánico (Darío, Martí) con el High Modernism anglosajón (Woolf, Joyce).</li>
                <li>Creer que "Boom Latinoamericano" y "Realismo mágico" son sinónimos: el Boom es una generación, el realismo mágico es una técnica.</li>
                <li>Mezclar los libros de la misma saga o del mismo autor sin distinguir cuál es cuál.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('quiz-literatura-universal')} />
      <ShareCard appName="quiz-literatura-universal" />
      <Footer appName="quiz-literatura-universal" />
    </div>
  );
}
