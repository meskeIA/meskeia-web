'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './DetectorSesgosCognitivos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

/* ─── Tipos ─── */

interface Pregunta {
  id: number;
  texto: string;
  dimension: 'automatismo' | 'deliberacion';
}

interface Perfil {
  nombre: string;
  emoji: string;
  descripcion: string;
  fortalezas: string[];
  riesgos: string[];
  acciones: string[];
}

/* ─── Datos ─── */

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: 'Cuando tengo que tomar una decisión, suelo ir con la primera opción que me viene a la cabeza', dimension: 'automatismo' },
  { id: 6, texto: 'Antes de decidir algo importante, busco activamente razones por las que podría estar equivocado', dimension: 'deliberacion' },
  { id: 2, texto: 'Confío mucho en mi intuición, incluso en temas que no domino del todo', dimension: 'automatismo' },
  { id: 7, texto: 'Cuando alguien me presenta datos que contradicen mi opinión, estoy dispuesto a cambiarla', dimension: 'deliberacion' },
  { id: 3, texto: 'Tiendo a buscar información que confirme lo que ya creo, más que información que lo cuestione', dimension: 'automatismo' },
  { id: 8, texto: 'Intento considerar al menos dos perspectivas diferentes antes de formarme una opinión', dimension: 'deliberacion' },
  { id: 4, texto: 'Me dejo influir por cómo me presentan la información (si suena positivo o negativo)', dimension: 'automatismo' },
  { id: 9, texto: 'Cuando algo "suena bien" o "suena mal", me detengo a pensar por qué antes de reaccionar', dimension: 'deliberacion' },
  { id: 5, texto: 'Si una persona que admiro opina algo, tiendo a asumir que tiene razón sin verificarlo', dimension: 'automatismo' },
  { id: 10, texto: 'Soy capaz de separar la calidad de un argumento de quién lo dice', dimension: 'deliberacion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(automatismo: number, deliberacion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (automatismo >= umbralAlto && deliberacion >= umbralAlto) {
    return {
      nombre: 'Pensador Híbrido',
      emoji: '🧩',
      descripcion: 'Reconoces que operas mucho en piloto automático PERO también tienes capacidad de deliberar cuando importa. En términos del modelo de Kahneman, este perfil sugiere conciencia del Sistema 1 y capacidad de activar el Sistema 2 cuando lo reconoces necesario. Esta combinación es valiosa — la clave es no confiar en que siempre sabrás cuándo cambiar de modo.',
      fortalezas: [
        'Conciencia de tus propios automatismos',
        'Capacidad de deliberar cuando lo reconoces necesario',
        'Velocidad en decisiones rutinarias + profundidad en las importantes',
      ],
      riesgos: [
        'Puedes creer que deliberas más de lo que realmente lo haces',
        'En situaciones de estrés, el automatismo gana casi siempre',
        'El exceso de confianza en tu capacidad de "cambiar de modo" es, en sí, un sesgo',
      ],
      acciones: [
        'Crea una "checklist de decisión" para decisiones importantes: ¿he considerado alternativas? ¿he buscado datos contra mi posición? ¿alguien piensa diferente?',
        'Pide a alguien de confianza que te señale cuando tu decisión parece "demasiado rápida" para la importancia del tema',
        'Lleva un diario de decisiones durante un mes: qué decidiste, cómo, y cómo salió — los patrones te sorprenderán',
      ],
    };
  }

  if (automatismo >= umbralAlto && deliberacion < umbralBajo) {
    return {
      nombre: 'Piloto Automático',
      emoji: '🤖',
      descripcion: 'Operas mayoritariamente con el Sistema 1: decisiones rápidas, intuitivas, basadas en la primera impresión. Esto no es "malo" — la mayoría de las decisiones diarias funcionan bien así. Pero para decisiones importantes (dinero, carrera, relaciones, salud), el piloto automático puede ser peligroso: es donde los sesgos cognitivos hacen más daño.',
      fortalezas: [
        'Rapidez en la toma de decisiones cotidianas',
        'Eficiencia energética (pensar menos gasta menos)',
        'Buena intuición para situaciones familiares',
      ],
      riesgos: [
        'Vulnerabilidad a sesgos de confirmación, anclaje, disponibilidad y framing',
        'Decisiones importantes tomadas con la misma rapidez que las triviales',
        'Dificultad para cambiar de opinión una vez formada la primera impresión',
      ],
      acciones: [
        'Para la próxima decisión importante, ESPERA 24 horas antes de actuar — el mero paso del tiempo reduce muchos sesgos',
        'Antes de decidir, escribe en un papel 3 razones POR las que podrías estar equivocado — si no se te ocurren, estás en sesgo',
        'Lee "Pensar rápido, pensar despacio" de Kahneman — entender los sesgos no garantiza evitarlos, pero te da vocabulario para identificarlos cuando aparecen',
      ],
    };
  }

  if (automatismo < umbralBajo && deliberacion >= umbralAlto) {
    return {
      nombre: 'Pensador Deliberado',
      emoji: '🔬',
      descripcion: 'Tu Sistema 2 domina: analizas, cuestionas, buscas perspectivas alternativas. Este es el perfil más resistente a los sesgos cognitivos. El riesgo no está en la calidad de tus decisiones sino en la velocidad: en un mundo que exige respuestas rápidas, pensar demasiado puede ser un problema.',
      fortalezas: [
        'Alta resistencia a sesgos cognitivos comunes',
        'Decisiones de mayor calidad en temas importantes',
        'Capacidad de evaluar argumentos independientemente de quién los hace',
      ],
      riesgos: [
        'Parálisis por análisis en decisiones que requieren velocidad',
        'Agotamiento mental: el Sistema 2 consume mucha energía',
        'Otros pueden percibirte como indeciso o excesivamente cauto',
      ],
      acciones: [
        'Clasifica tus decisiones: las reversibles (tipo 2) pueden ser rápidas; las irreversibles (tipo 1) merecen análisis profundo',
        'Pon límites de tiempo a tu deliberación — si en 30 minutos no tienes una respuesta clara, probablemente necesitas más datos, no más tiempo',
        'Confía más en tu intuición para decisiones pequeñas — reserva el análisis profundo para lo que realmente importa',
      ],
    };
  }

  if (automatismo < umbralBajo && deliberacion < umbralBajo) {
    return {
      nombre: 'Indecisión',
      emoji: '😶',
      descripcion: 'Ni decides rápido ni analizas en profundidad. Puede indicar que evitas tomar decisiones, que estás en un momento de confusión, o que las decisiones que enfrentas no te generan suficiente interés. No es un problema de inteligencia — es un problema de activación.',
      fortalezas: [
        'No tienes sesgos fuertes que te arrastren (ni rápido ni lento)',
        'Espacio para construir un sistema de decisión desde cero',
        'Potencial de mejora grande con pequeños hábitos',
      ],
      riesgos: [
        'Las decisiones no tomadas también tienen consecuencias (coste de la inacción)',
        'Otros pueden decidir por ti si tú no decides',
        'La falta de práctica en decidir debilita la capacidad con el tiempo',
      ],
      acciones: [
        'Empieza con decisiones pequeñas: elige rápido qué comer, qué ruta tomar, qué leer — entrena el músculo de decidir',
        'Para decisiones más grandes, usa una estructura simple: 3 opciones, 2 criterios, 1 decisión en máximo 48h',
        'Si la indecisión se extiende a todo tu vida, considera si hay ansiedad o agotamiento detrás — a veces no decidir es una señal de algo más profundo',
      ],
    };
  }

  if (automatismo >= deliberacion) {
    return {
      nombre: 'Tendencia al Automatismo',
      emoji: '⚡',
      descripcion: 'Tu Sistema 1 domina ligeramente sobre el Sistema 2. No es extremo, pero indica que tiendes a decidir más por intuición que por análisis. Para decisiones cotidianas esto es eficiente; para las importantes, conviene introducir más deliberación.',
      fortalezas: [
        'Velocidad de decisión razonable',
        'Algo de capacidad deliberativa presente',
        'Eficiente en decisiones rutinarias',
      ],
      riesgos: [
        'Los sesgos de confirmación y disponibilidad pueden influirte más de lo que crees',
        'En decisiones bajo presión, el automatismo se amplifica',
        'Riesgo de arrepentimiento en decisiones importantes tomadas demasiado rápido',
      ],
      acciones: [
        'Crea una regla simple: "Si la decisión cuesta más de X euros o afecta a más de Y meses, espero 24h antes de decidir"',
        'Cuando formes una opinión rápida, pregúntate: "¿Qué haría que cambiara de opinión?" — si no se te ocurre nada, estás en piloto automático',
        'Practica el "abogado del diablo" contigo mismo: defiende la posición contraria durante 2 minutos antes de decidir',
      ],
    };
  }

  return {
    nombre: 'Tendencia a la Reflexión',
    emoji: '🤔',
    descripcion: 'Tu capacidad deliberativa supera ligeramente a tu automatismo. Buena dirección: analizas más que la media, pero sin llegar a la parálisis. El reto es mantener este equilibrio bajo presión, cuando el Sistema 1 siempre intenta tomar el control.',
    fortalezas: [
      'Buena base de pensamiento crítico',
      'Menor vulnerabilidad a sesgos que la media',
      'Equilibrio razonable entre velocidad y calidad',
    ],
    riesgos: [
      'Bajo estrés, el automatismo puede ganar terreno rápidamente',
      'Riesgo de sobreanalizar en momentos que requieren acción',
      'El entorno (RRSS, noticias, publicidad) está diseñado para activar tu Sistema 1',
    ],
    acciones: [
      'Fortalece tu Sistema 2 con prácticas regulares: lectura profunda, debates, escritura reflexiva',
      'Cuando notes que estás decidiendo "con la tripa", no lo reprimas — pero compruébalo después con datos',
      'Reduce la exposición a estímulos diseñados para activar reacciones rápidas (scroll continuo, titulares alarmantes) cuando estás tomando decisiones importantes',
    ],
  };
}

/* ─── Componente ─── */

export default function DetectorSesgosCognitivosPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const todasRespondidas = PREGUNTAS.every((p) => respuestas[p.id] !== undefined);

  const handleRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    if (mostrarResultado) setMostrarResultado(false);
  };

  const calcularResultado = () => {
    setMostrarResultado(true);
    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reiniciar = () => {
    setRespuestas({});
    setMostrarResultado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const puntuacionAutomatismo = PREGUNTAS
    .filter((p) => p.dimension === 'automatismo')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionDeliberacion = PREGUNTAS
    .filter((p) => p.dimension === 'deliberacion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionAutomatismo, puntuacionDeliberacion);

  const posX = ((puntuacionAutomatismo - 5) / 20) * 100;
  const posY = 100 - ((puntuacionDeliberacion - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🧠 Detector de Sesgos Cognitivos</h1>
          <p className={styles.subtitle}>
            ¿Qué sesgos podrían estar afectando tus decisiones?
            <br />
            Basado en Kahneman: Sistema 1 y Sistema 2
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>🕐 3 minutos</span>
            <span className={styles.badge}>📊 10 preguntas</span>
            <span className={styles.badge}>🔒 Sin registro</span>
          </div>
        </header>

        <LegalNotice />

        <section className={styles.contextCard}>
          <p>
            Daniel Kahneman, Premio Nobel de Economía 2002, popularizó un modelo influyente para
            describir la toma de decisiones: el cerebro funciona —de forma simplificada— como si
            tuviera dos sistemas: el <strong>Sistema 1</strong> (rápido, intuitivo, automático) y el
            <strong> Sistema 2</strong> (lento, analítico, deliberado).
          </p>
          <p>
            El problema: el Sistema 1 decide la mayor parte del tiempo, incluso en temas importantes.
            Y el Sistema 1 es donde viven los sesgos cognitivos — atajos mentales que fueron
            útiles para sobrevivir pero que <strong>pueden llevarte a decisiones erróneas
            en el mundo moderno</strong>.
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo tomas decisiones habitualmente
          </h2>
          <p className={styles.sectionSubtitle}>
            Responde con lo que haces realmente, no con lo que deberías hacer
          </p>

          {PREGUNTAS.map((pregunta, index) => (
            <div key={pregunta.id} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>{index + 1}</span>
              </div>
              <p className={styles.questionText}>{pregunta.texto}</p>
              <div className={styles.scaleContainer} role="radiogroup" aria-label={`Pregunta ${index + 1}: ${pregunta.texto}`}>
                {ESCALA.map((opcion) => (
                  <button
                    key={opcion.valor}
                    className={`${styles.scaleButton} ${respuestas[pregunta.id] === opcion.valor ? styles.scaleButtonActive : ''}`}
                    onClick={() => handleRespuesta(pregunta.id, opcion.valor)}
                    role="radio"
                    aria-checked={respuestas[pregunta.id] === opcion.valor}
                    aria-label={`${opcion.etiqueta} (${opcion.valor} de 5)`}
                  >
                    <span className={styles.scaleValue}>{opcion.valor}</span>
                    <span className={styles.scaleLabel}>{opcion.etiqueta}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.progressInfo}>
            {Object.keys(respuestas).length} de {PREGUNTAS.length} respondidas
          </div>

          <button
            className={styles.btnPrimary}
            onClick={calcularResultado}
            disabled={!todasRespondidas}
            aria-label="Ver mi diagnóstico"
          >
            {todasRespondidas ? 'Ver mi diagnóstico' : `Responde las ${PREGUNTAS.length - Object.keys(respuestas).length} preguntas restantes`}
          </button>
        </section>

        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}>🔬 Alta Deliberación</span>
                <span className={styles.mapLabelBottom}>Baja Deliberación</span>
                <span className={styles.mapLabelLeft}>Bajo Automatismo</span>
                <span className={styles.mapLabelRight}>🤖 Alto Automatismo</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>🔬 Pensador Deliberado</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🧩 Pensador Híbrido</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>😶 Indecisión</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🤖 Piloto Automático</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Automatismo ${puntuacionAutomatismo}/25, Deliberación ${puntuacionDeliberacion}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🤖 Automatismo (Sistema 1)</span>
                  <span className={styles.scoreValue}>{puntuacionAutomatismo}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAutomatismo}`}
                    style={{ width: `${(puntuacionAutomatismo / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🔬 Deliberación (Sistema 2)</span>
                  <span className={styles.scoreValue}>{puntuacionDeliberacion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barDeliberacion}`}
                    style={{ width: `${(puntuacionDeliberacion / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <span className={styles.profileEmoji}>{perfil.emoji}</span>
                <h3 className={styles.profileName}>{perfil.nombre}</h3>
              </div>
              <p className={styles.profileDescription}>{perfil.descripcion}</p>

              <div className={styles.profileColumns}>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}>✅ Fortalezas</h4>
                  <ul className={styles.profileList}>
                    {perfil.fortalezas.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}>⚠️ Riesgos</h4>
                  <ul className={styles.profileList}>
                    {perfil.riesgos.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.actionsSection}>
                <h4 className={styles.actionsTitle}>🎯 Acciones sugeridas</h4>
                <ol className={styles.actionsList}>
                  {perfil.acciones.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </div>
            </div>

            <button className={styles.btnSecondary} onClick={reiniciar}>
              Repetir diagnóstico
            </button>
          </section>
        )}

        <EducationalSection
          title="📚 Kahneman y los dos sistemas del pensamiento"
          subtitle="Cómo funcionan los sesgos cognitivos"
        >
          <section className={styles.guideSection}>
            <h2>Sistema 1 y Sistema 2</h2>
            <p>
              Daniel Kahneman (1934-2024), psicólogo israelí-americano y Premio Nobel de Economía 2002,
              revolucionó nuestra comprensión de la toma de decisiones con su modelo de dos sistemas:
            </p>
            <ul>
              <li><strong>Sistema 1</strong>: Rápido, automático, intuitivo, emocional. Opera sin esfuerzo consciente. Es el que decide la mayor parte del tiempo.</li>
              <li><strong>Sistema 2</strong>: Lento, deliberado, analítico, lógico. Requiere esfuerzo consciente. Se activa cuando el Sistema 1 no tiene respuesta clara.</li>
            </ul>

            <h2>Los sesgos más comunes</h2>
            <ul>
              <li><strong>Sesgo de confirmación</strong>: Buscamos información que confirme lo que ya creemos e ignoramos la que lo contradice.</li>
              <li><strong>Efecto anclaje</strong>: La primera información que recibimos influye desproporcionadamente en nuestro juicio posterior.</li>
              <li><strong>Sesgo de disponibilidad</strong>: Juzgamos la probabilidad de algo por lo fácil que es recordar ejemplos (las noticias distorsionan nuestra percepción de riesgo).</li>
              <li><strong>Efecto framing</strong>: La misma información presentada de forma diferente produce decisiones diferentes (&quot;90% de supervivencia&quot; vs &quot;10% de mortalidad&quot;).</li>
              <li><strong>Sesgo de autoridad</strong>: Aceptamos afirmaciones de figuras de autoridad sin verificarlas.</li>
            </ul>

            <h2>¿Se pueden evitar los sesgos?</h2>
            <p>
              La respuesta corta es: <strong>no del todo</strong>. Conocer un sesgo reduce su impacto
              pero no lo elimina (Kahneman mismo admitió que seguía cayendo en los sesgos que
              había descubierto). Lo que sí funciona:
            </p>
            <ul>
              <li>Crear <strong>procedimientos</strong> que fuercen la deliberación (checklists, decisiones en frío).</li>
              <li>Buscar <strong>perspectivas contrarias</strong> activamente (no esperar a que lleguen).</li>
              <li>Usar <strong>datos</strong> como ancla en lugar de impresiones.</li>
              <li>Dar <strong>tiempo</strong> entre el estímulo y la decisión.</li>
            </ul>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Kahneman, D. (2011). <em>Thinking, Fast and Slow</em>. Farrar, Straus and Giroux.</li>
              <li>Ariely, D. (2008). <em>Predictably Irrational</em>. HarperCollins.</li>
              <li>Kahneman, D., Sibony, O. y Sunstein, C. (2021). <em>Noise: A Flaw in Human Judgment</em>. Little, Brown Spark.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('detector-sesgos-cognitivos')} />
        <ShareCard appName="detector-sesgos-cognitivos" />
        <Footer appName="detector-sesgos-cognitivos" />
      </div>
    </>
  );
}
