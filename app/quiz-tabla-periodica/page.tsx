'use client';
// @disclaimer: exempt

import { useEffect, useRef, useState } from 'react';
import { BANCO_PREGUNTAS, TOTAL_BANCO, type Categoria, type Fase, type Pregunta } from './preguntas';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QuizTablaPeriodica.module.css';


/**
 * Etiqueta de cada categoría, con el emoji SEPARADO del texto.
 *
 * Iban juntos en la misma cadena, así que el emoji viajaba dentro del rótulo y un lector de
 * pantalla lo leía en voz alta en cada una de las diez preguntas. El candado
 * `check:a11y-jsx` no podía verlo: solo sabe leer emojis literales en el JSX, y estos
 * llegaban por variable. Separarlos en el dato es lo que permite ocultarlos al pintarlos.
 */
const ETIQUETAS_CATEGORIA: Record<Categoria, { emoji: string; texto: string }> = {
  'numero-atomico': { emoji: '⚛️', texto: 'Número atómico' },
  'grupo-periodo': { emoji: '📊', texto: 'Grupo y período' },
  'propiedades': { emoji: '🔬', texto: 'Propiedades' },
  'familia': { emoji: '🧩', texto: 'Familias' },
  'curiosidad': { emoji: '💡', texto: 'Curiosidades' },
};


const TOTAL_PREGUNTAS = 10;

function mezclarArray<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function QuizTablaPeriodicaPage() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState<boolean[]>([]);

  const pregunta = preguntas[indice];
  const haRespondido = seleccionada !== null;
  const totalAciertos = aciertos.filter(Boolean).length;

  /**
   * Al responder, el botón pulsado queda `disabled` y el navegador suelta el foco al
   * <body>: quien juega con teclado tenía que tabular el documento entero para llegar a
   * «Siguiente pregunta», diez veces por partida. Aquí el foco se lleva a ese botón, que es
   * la única acción que queda por hacer.
   */
  const botonSiguienteRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (haRespondido) botonSiguienteRef.current?.focus();
  }, [haRespondido, indice]);

  function iniciarQuiz() {
    setPreguntas(mezclarArray(BANCO_PREGUNTAS).slice(0, TOTAL_PREGUNTAS));
    setIndice(0);
    setSeleccionada(null);
    setAciertos([]);
    setFase('jugando');
  }

  function responder(i: number) {
    if (haRespondido) return;
    setSeleccionada(i);
    setAciertos(prev => [...prev, i === pregunta.correcta]);
  }

  function siguiente() {
    if (indice + 1 >= TOTAL_PREGUNTAS) {
      setFase('resultado');
    } else {
      setIndice(p => p + 1);
      setSeleccionada(null);
    }
  }

  function getMensaje() {
    const pct = (totalAciertos / TOTAL_PREGUNTAS) * 100;
    if (pct >= 90) return { texto: '¡Experto en química!', emoji: '🏆' };
    if (pct >= 70) return { texto: '¡Muy buen nivel!', emoji: '🎯' };
    if (pct >= 50) return { texto: 'Buen intento, sigue practicando', emoji: '📚' };
    return { texto: 'La tabla periódica guarda muchos secretos', emoji: '🔬' };
  }

  const educativo = {
    intro: 'La tabla periódica organiza los 118 elementos conocidos según su número atómico, configuración electrónica y propiedades químicas recurrentes. Fue propuesta por Dmitri Mendeléiev en 1869 y hoy es la herramienta fundamental de toda la química.',
    tablaComparativa: [
      { aspecto: 'Grupos', descripcion: 'Columnas verticales (1-18). Elementos con propiedades similares y misma configuración de valencia.' },
      { aspecto: 'Períodos', descripcion: 'Filas horizontales (1-7). Elementos con el mismo número de capas electrónicas.' },
      { aspecto: 'Metales', descripcion: 'Conductores, brillantes, maleables. Ocupan la parte izquierda y central de la tabla.' },
      { aspecto: 'No metales', descripcion: 'Malos conductores, forman aniones. Parte superior derecha de la tabla.' },
      { aspecto: 'Metaloides', descripcion: 'Propiedades intermedias: B, Si, Ge, As, Sb, Te. Clave para semiconductores.' },
      { aspecto: 'Gases nobles', descripcion: 'Grupo 18. Capa de valencia completa, mínima reactividad.' },
    ],
    faq: [
      { pregunta: '¿Por qué algunos símbolos no coinciden con el nombre?', respuesta: 'Porque provienen del latín o del alemán, que eran las lenguas científicas cuando se descubrieron. Fe viene de "ferrum" (hierro en latín), Au de "aurum" (oro), Na de "Natrium" (sodio).' },
      { pregunta: '¿Cuántos elementos existen?', respuesta: 'Hay 118 elementos confirmados. Los 94 primeros se encuentran en la naturaleza (aunque algunos en cantidades ínfimas). Del 95 al 118 son sintéticos, creados en laboratorio.' },
      { pregunta: '¿Qué significa el número atómico?', respuesta: 'El número de protones en el núcleo del átomo. Es el identificador único de cada elemento: dos átomos con el mismo número atómico son siempre el mismo elemento.' },
      { pregunta: '¿Por qué los gases nobles son tan poco reactivos?', respuesta: 'Porque tienen la capa de valencia completa (8 electrones, o 2 en el caso del helio). No necesitan ganar ni perder electrones, así que no tienden a reaccionar.' },
      { pregunta: '¿Cuál es la diferencia entre un grupo y una familia?', respuesta: 'Son lo mismo: los elementos de un mismo grupo (columna) forman una familia química. Las familias más conocidas tienen nombre propio: alcalinos, alcalinotérreos, halógenos, gases nobles.' },
    ],
    pasos: [
      { titulo: 'Empieza por los grupos', descripcion: 'Aprende los 4 grupos con nombre propio: alcalinos (G1), alcalinotérreos (G2), halógenos (G17) y gases nobles (G18).' },
      { titulo: 'Aprende los símbolos irregulares', descripcion: 'Memoriza los que no coinciden con el nombre español: Fe, Au, Ag, Cu, Pb, Na, K, Hg, Sn, W.' },
      { titulo: 'Relaciona propiedades con posición', descripcion: 'Los metales están a la izquierda, los no metales a la derecha, los metaloides en la frontera. La reactividad aumenta hacia los extremos de cada período.' },
      { titulo: 'Usa la mnemotecnia', descripcion: 'Para los alcalinos (Li Na K Rb Cs Fr): "LiNa Conoce Rubios Con Frecuencia". Para los halógenos (F Cl Br I At): "Flor Clemente Brilla Intensamente".' },
      { titulo: 'Practica con contexto', descripcion: 'Asocia cada elemento con algo cotidiano: el Na de la sal, el Fe de las sartenes, el Si del móvil, el C de la vida, el O que respiras.' },
    ],
    tips: [
      { titulo: 'El número atómico es clave', descripcion: 'Si sabes el número atómico, sabes el elemento. Del 1 al 20, merece la pena memorizarlos todos.' },
      { titulo: 'Los períodos marcan las capas', descripcion: 'El período indica cuántas capas electrónicas tiene el átomo. Período 3 = 3 capas. Útil para entender el tamaño del átomo.' },
      { titulo: 'Tendencias periódicas', descripcion: 'La electronegatividad aumenta hacia arriba y hacia la derecha. El tamaño atómico aumenta hacia abajo y hacia la izquierda.' },
      { titulo: 'Los metales de transición son predecibles', descripcion: 'Son todos metales, buenos conductores, con propiedades similares entre sí. No hay que memorizar cada uno: el contexto ayuda.' },
    ],
    errores: [
      { error: 'Confundir grupo con período', consecuencia: 'Los grupos son las columnas (verticales), los períodos son las filas (horizontales).' },
      { error: 'Pensar que todos los sólidos son metales', consecuencia: 'El Azufre, el Yodo, el Carbono y el Fósforo son sólidos no metálicos a temperatura ambiente.' },
      { error: 'Confundir número atómico con masa atómica', consecuencia: 'El número atómico (Z) cuenta protones. La masa atómica también incluye neutrones y por eso siempre es mayor.' },
      { error: 'Asumir que los gases nobles nunca reaccionan', consecuencia: 'El Xenón y el Kriptón sí forman compuestos en condiciones extremas. Solo el Helio y el Neón son verdaderamente inertes.' },
    ],
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}><span aria-hidden="true">⚗️</span> Quiz Tabla Periódica</h1>
        <p className={styles.heroSubtitle}>
          {TOTAL_BANCO} preguntas sobre elementos, grupos, propiedades y curiosidades
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {fase === 'inicio' && (
          <div className={styles.inicio}>
            <div className={styles.inicioCard}>
              <div className={styles.inicioEmoji} aria-hidden="true">🧪</div>
              <h2 className={styles.inicioTitulo}>¿Cuánto sabes de química?</h2>
              <p className={styles.inicioDesc}>
                {TOTAL_PREGUNTAS} preguntas aleatorias de un banco de {BANCO_PREGUNTAS.length}.
                Categorías: números atómicos, grupos, períodos, familias y curiosidades.
              </p>
              <div className={styles.categoriasBadges}>
                {(Object.entries(ETIQUETAS_CATEGORIA) as [Categoria, { emoji: string; texto: string }][]).map(([cat, etiqueta]) => (
                  <span key={cat} className={styles.badge}>
                    <span aria-hidden="true">{etiqueta.emoji}</span> {etiqueta.texto}
                  </span>
                ))}
              </div>
              <button type="button" className={styles.btnPrimario} onClick={iniciarQuiz}>
                Empezar quiz →
              </button>
            </div>
          </div>
        )}

        {fase === 'jugando' && pregunta && (
          <div className={styles.quizArea}>
            <div className={styles.progreso}>
              <div className={styles.progresoInfo}>
                <span>Pregunta {indice + 1} de {TOTAL_PREGUNTAS}</span>
                <span className={styles.aciertosProgreso}><span aria-hidden="true">✓</span> {totalAciertos} {totalAciertos === 1 ? 'acierto' : 'aciertos'}</span>
              </div>
              <div className={styles.barraProgreso}>
                <div
                  className={styles.barraRelleno}
                  style={{ width: `${(indice / TOTAL_PREGUNTAS) * 100}%` }}
                />
              </div>
            </div>

            <div className={styles.preguntaCard}>
              <span className={styles.categoriaBadge}>
                <span aria-hidden="true">{ETIQUETAS_CATEGORIA[pregunta.categoria].emoji}</span>{' '}
                {ETIQUETAS_CATEGORIA[pregunta.categoria].texto}
              </span>
              <p className={styles.preguntaTexto}>{pregunta.pregunta}</p>

              <div className={styles.opcionesGrid}>
                {pregunta.opciones.map((opcion, i) => {
                  let clase = styles.opcion;
                  if (haRespondido) {
                    if (i === pregunta.correcta) clase = `${styles.opcion} ${styles.opcionCorrecta}`;
                    else if (i === seleccionada) clase = `${styles.opcion} ${styles.opcionIncorrecta}`;
                    else clase = `${styles.opcion} ${styles.opcionApagada}`;
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      className={clase}
                      onClick={() => responder(i)}
                      disabled={haRespondido}
                    >
                      <span className={styles.opcionLetra}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      {opcion}
                    </button>
                  );
                })}
              </div>

              {/* role="status" para que el veredicto y la explicación se anuncien solos: es
                  el momento en que la app enseña algo, y sin región viva no llegaba. Solo se
                  actualiza al responder, no en bucle, así que no atropella al lector. */}
              <div role="status" aria-live="polite">
                {haRespondido && (
                  <div className={`${styles.feedback} ${seleccionada === pregunta.correcta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}>
                    <p className={styles.feedbackResultado}>
                      {seleccionada === pregunta.correcta ? <><span aria-hidden="true">✓</span> ¡Correcto!</> : <><span aria-hidden="true">✗</span> Incorrecto</>}
                    </p>
                    <p className={styles.explicacion}>{pregunta.explicacion}</p>
                    {/* El foco salta aquí al responder: el botón que se acaba de pulsar queda
                        `disabled` y el navegador lo suelta al <body>, así que sin esto había
                        que tabular el documento entero para llegar a la pregunta siguiente. */}
                    <button
                      type="button"
                      className={styles.btnSiguiente}
                      onClick={siguiente}
                      ref={botonSiguienteRef}
                    >
                      {indice + 1 >= TOTAL_PREGUNTAS ? 'Ver resultados →' : 'Siguiente pregunta →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {fase === 'resultado' && (
          <div className={styles.resultado}>
            <div className={styles.resultadoCard}>
              <div className={styles.puntuacionCirculo}>
                <span className={styles.puntuacionNumero}>{totalAciertos}</span>
                <span className={styles.puntuacionTotal}>/{TOTAL_PREGUNTAS}</span>
              </div>
              <div className={styles.mensajeFinal}>
                <span className={styles.mensajeEmoji} aria-hidden="true">{getMensaje().emoji}</span>
                <p className={styles.mensajeTexto}>{getMensaje().texto}</p>
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{totalAciertos}</span>
                  <span className={styles.statLabel}>Aciertos</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{TOTAL_PREGUNTAS - totalAciertos}</span>
                  <span className={styles.statLabel}>Errores</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumero}>{Math.round((totalAciertos / TOTAL_PREGUNTAS) * 100)}%</span>
                  <span className={styles.statLabel}>Puntuación</span>
                </div>
              </div>
              <button type="button" className={styles.btnPrimario} onClick={iniciarQuiz}>
                Jugar otra vez
              </button>
            </div>
          </div>
        )}
      </main>

      <EducationalSection title="Todo sobre la Tabla Periódica" subtitle="Grupos, familias, propiedades y curiosidades de los 118 elementos">
        <p>{educativo.intro}</p>

        <h3>Estructura de la tabla periódica</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {educativo.tablaComparativa.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.aspecto}</strong></td>
                  <td>{item.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>¿A quién le viene bien este quiz?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
            <h4>Estudiante de secundaria</h4>
            <p>Repasa grupos, períodos y propiedades antes del examen. Identifica las familias más importantes y sus características.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏆</span>
            <h4>Aficionado a la ciencia</h4>
            <p>Descubre curiosidades sorprendentes sobre los elementos: cuáles son líquidos, cuáles tienen símbolos irregulares y por qué.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
            <h4>Preparación oposiciones</h4>
            <p>Cultura científica general para temarios de oposiciones de primaria, secundaria o acceso a ciclos formativos de química.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          {educativo.faq.slice(0, 4).map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <p className={styles.faqTip}><strong>{item.pregunta}</strong></p>
              <p>{item.respuesta}</p>
            </div>
          ))}
        </div>

        <h3>Cómo mejorar tu nivel en química</h3>
        <div className={styles.stepGuide}>
          {educativo.pasos.slice(0, 4).map((paso, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <div className={styles.stepContent}>
                <strong>{paso.titulo}</strong>
                <p>{paso.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        <h3>Trucos para memorizar</h3>
        <div className={styles.tipsGrid}>
          {educativo.tips.map((tip, i) => (
            <div key={i} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <strong>{tip.titulo}</strong>
              <p>{tip.descripcion}</p>
            </div>
          ))}
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al estudiar la tabla periódica</strong>
          </div>
          <ul className={styles.warningList}>
            {educativo.errores.map((e, i) => (
              <li key={i}><strong>{e.error}:</strong> {e.consecuencia}</li>
            ))}
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-tabla-periodica')} />
      <ShareCard appName="quiz-tabla-periodica" />
      <Footer appName="quiz-tabla-periodica" />
    </div>
  );
}
