'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ChecklistSegundaOpinion.module.css';
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
  dimension: 'certeza' | 'cuestionamiento';
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
  { id: 1, texto: 'Cuando estoy convencido de algo, me cuesta mucho cambiar de opinión', dimension: 'certeza' },
  { id: 6, texto: 'Antes de una decisión importante, busco activamente información que contradiga mi posición', dimension: 'cuestionamiento' },
  { id: 2, texto: 'Si mis datos y mi intuición coinciden, asumo que estoy en lo correcto sin buscar más', dimension: 'certeza' },
  { id: 7, texto: 'Pido opinión a personas que sé que pensarán diferente a mí', dimension: 'cuestionamiento' },
  { id: 3, texto: 'Me incomoda que alguien cuestione una decisión que ya he tomado', dimension: 'certeza' },
  { id: 8, texto: 'Puedo defender la posición contraria a la mía como ejercicio mental', dimension: 'cuestionamiento' },
  { id: 4, texto: 'En discusiones, mi objetivo principal es convencer al otro, no entender su perspectiva', dimension: 'certeza' },
  { id: 9, texto: 'Antes de actuar, me pregunto: "¿Qué haría que cambiara de opinión sobre esto?"', dimension: 'cuestionamiento' },
  { id: 5, texto: 'Recuerdo más fácilmente las veces que acerté que las que me equivoqué', dimension: 'certeza' },
  { id: 10, texto: 'Cuando algo sale mal, analizo honestamente qué falló en mi razonamiento, no solo en la ejecución', dimension: 'cuestionamiento' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(certeza: number, cuestionamiento: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (certeza >= umbralAlto && cuestionamiento >= umbralAlto) {
    return {
      nombre: 'Convicciones Testadas',
      emoji: '🛡️',
      descripcion: 'Tienes convicciones fuertes Y las cuestionas activamente. Es la combinación más madura: no eres indeciso (tienes posiciones claras) ni dogmático (las sometes a escrutinio). El pensador Charlie Munger lo resumía: "Nunca tengas una opinión fuerte que no hayas intentado destruir primero".',
      fortalezas: [
        'Convicciones sólidas respaldadas por escrutinio propio',
        'Capacidad de mantener una posición y cambiarla si hay evidencia',
        'Credibilidad alta: los demás confían en tus juicios porque saben que los has cuestionado',
      ],
      riesgos: [
        'Puedes sobreestimar cuánto cuestionas realmente (sesgo de ilusión de objetividad)',
        'El esfuerzo de cuestionar constantemente puede ser agotador',
        'En momentos de presión, el cuestionamiento puede ceder ante la certeza',
      ],
      acciones: [
        'Mantén el hábito pero vigila que sea genuino: ¿buscas contraargumentos de verdad o solo los que sabes que no te convencerán?',
        'Lleva un registro de las veces que cambiaste de opinión en el último año — si son pocas, tu cuestionamiento puede ser más ritual que real',
        'Busca a alguien que piense radicalmente diferente a ti y tengan una conversación honesta — no para convencer, para entender',
      ],
    };
  }

  if (certeza >= umbralAlto && cuestionamiento < umbralBajo) {
    return {
      nombre: 'Certeza Ciega',
      emoji: '🔒',
      descripcion: 'Alta certeza sin cuestionamiento: estás muy seguro de tus decisiones y no buscas activamente razones para estar equivocado. Es el perfil más vulnerable a errores graves: cuando estás seguro de todo y no cuestionas nada, los errores son invisibles hasta que es tarde.',
      fortalezas: [
        'Velocidad de decisión y claridad de posición',
        'Capacidad de liderar con convicción',
        'Los demás saben dónde estás parado',
      ],
      riesgos: [
        'Los errores se descubren tarde y cuestan caro',
        'Sesgo de confirmación en su forma más pura',
        'Los demás pueden dejar de cuestionarte si perciben que no escuchas',
      ],
      acciones: [
        'La próxima vez que estés 100% seguro de algo, escribe 3 razones por las que podrías estar equivocado. Si no se te ocurren, preocúpate más.',
        'Pide a alguien de confianza que sea tu "red team personal": su trabajo es encontrar fallos en tu razonamiento, y tú tienes que escuchar sin defenderte',
        'Lee sobre errores famosos causados por exceso de certeza (Kodak ignorando la fotografía digital, Nokia descartando los smartphones) — la certeza no protege del error',
      ],
    };
  }

  if (certeza < umbralBajo && cuestionamiento >= umbralAlto) {
    return {
      nombre: 'Escéptico Constructivo',
      emoji: '🔍',
      descripcion: 'Baja certeza y alto cuestionamiento: cuestionas mucho y te comprometes poco. Es el perfil del pensador crítico por excelencia — pero llevado al extremo puede impedir la acción. Cuestionar es valioso solo si lleva a mejores decisiones, no si lleva a no decidir.',
      fortalezas: [
        'Alta resistencia a errores por sesgo',
        'Capacidad de ver ángulos que otros no ven',
        'Pensamiento riguroso y matizado',
      ],
      riesgos: [
        'Parálisis por cuestionamiento infinito',
        'Los demás pueden percibir tu escepticismo como negatividad',
        'Riesgo de que cuestionar se convierta en un fin en sí mismo',
      ],
      acciones: [
        'Pon un límite a tu cuestionamiento: "Cuestiono durante 30 minutos, y luego decido con lo que tengo"',
        'Cuando cuestiones algo, termina siempre con una propuesta: "Esto podría fallar por X, y sugiero Y para mitigarlo"',
        'Practica tomar decisiones rápidas en temas de bajo riesgo — entrena la acción, no solo el análisis',
      ],
    };
  }

  if (certeza < umbralBajo && cuestionamiento < umbralBajo) {
    return {
      nombre: 'Sin Posición Clara',
      emoji: '🌫️',
      descripcion: 'Ni tienes convicciones fuertes ni cuestionas activamente. Puede indicar desinterés, sobrecarga de información, o un momento en el que nada te genera suficiente convicción para tomar posición. No es un problema de inteligencia — es un problema de engagement.',
      fortalezas: [
        'No tienes sesgos dogmáticos',
        'Apertura potencial a cualquier perspectiva',
        'Espacio para construir un sistema de decisión desde cero',
      ],
      riesgos: [
        'Sin convicciones ni cuestionamiento, las decisiones se toman por inercia o por influencia de otros',
        'Los demás pueden decidir por ti',
        'Falta de agencia personal en temas importantes',
      ],
      acciones: [
        'Elige UN tema que te importe y fórmate una opinión informada sobre él — la convicción se entrena',
        'Cuando alguien te presente una propuesta, practica hacerte UNA pregunta: "¿Qué asume esta propuesta que podría no ser cierto?"',
        'Busca un debate o una discusión sobre un tema que te interese — escuchar posiciones diferentes ayuda a formar la tuya',
      ],
    };
  }

  if (certeza >= cuestionamiento) {
    return {
      nombre: 'Tendencia a la Certeza',
      emoji: '📌',
      descripcion: 'Tu certeza supera ligeramente a tu cuestionamiento. No es dogmatismo, pero indica que confías más en tus conclusiones de lo que las verificas. Probablemente aciertas a menudo (la certeza suele venir de experiencia), pero cuando fallas, el error puede ser significativo.',
      fortalezas: [
        'Capacidad de decisión clara',
        'Algo de cuestionamiento presente',
        'Experiencia que respalda la intuición',
      ],
      riesgos: [
        'Los aciertos refuerzan la certeza y reducen el cuestionamiento — efecto circular',
        'Un error importante puede pillarte sin plan B',
        'Los demás pueden dejar de ofrecer perspectivas alternativas si perciben que no las valoras',
      ],
      acciones: [
        'Para cada decisión importante, dedica 5 minutos a argumentar la posición contraria antes de confirmar la tuya',
        'Pide feedback específico: "¿Qué crees que no estoy viendo?" es más útil que "¿Qué opinas?"',
        'Cuando aciertes, analiza por qué acertaste — si fue "suerte" o "entorno favorable", tu certeza no está tan justificada como crees',
      ],
    };
  }

  return {
    nombre: 'Tendencia al Cuestionamiento',
    emoji: '❓',
    descripcion: 'Tu cuestionamiento supera ligeramente a tu certeza. Buena dirección: cuestionas antes de decidir, pero no te quedas paralizado. El reto es mantener este hábito bajo presión, cuando la urgencia empuja hacia la certeza rápida.',
    fortalezas: [
      'Buen hábito de cuestionamiento',
      'Menor vulnerabilidad a sesgos que la media',
      'Decisiones probablemente más fundamentadas',
    ],
    riesgos: [
      'Bajo presión, el cuestionamiento puede desaparecer',
      'Riesgo de que otros interpreten tu cuestionamiento como indecisión',
      'El hábito necesita mantenimiento activo',
    ],
    acciones: [
      'Cuando notes que decides rápido sin cuestionar, no te juzgues — simplemente pregúntate después: "¿Habría decidido diferente si hubiera cuestionado?"',
      'Crea una "pregunta de seguridad" que te hagas siempre antes de decisiones importantes: la mía es "¿Qué diría alguien que piense lo contrario?"',
      'Comparte tu proceso de cuestionamiento con otros — verbalizar tus dudas ayuda a refinarlas y a que otros te ayuden a verlas',
    ],
  };
}

/* ─── Componente ─── */

export default function ChecklistSegundaOpinionPage() {
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

  const puntuacionCerteza = PREGUNTAS
    .filter((p) => p.dimension === 'certeza')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionCuestionamiento = PREGUNTAS
    .filter((p) => p.dimension === 'cuestionamiento')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionCerteza, puntuacionCuestionamiento);

  const posX = ((puntuacionCerteza - 5) / 20) * 100;
  const posY = 100 - ((puntuacionCuestionamiento - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🔍 Checklist de Segunda Opinión</h1>
          <p className={styles.subtitle}>
            Antes de decidir: ¿has buscado razones para NO hacerlo?
            <br />
            Principio de adversario (red team)
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
            En el ejército, antes de una operación importante, se forma un <strong>red team</strong>:
            un grupo cuya única misión es <em>encontrar fallos en el plan</em>. No porque sean pesimistas,
            sino porque <strong>la mejor forma de fortalecer una idea es intentar destruirla primero</strong>.
          </p>
          <p>
            Este principio se aplica a cualquier decisión importante: si no has buscado activamente
            razones para estar equivocado, tu decisión es más frágil de lo que crees.
            <strong> La certeza sin cuestionamiento es el mayor riesgo.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo tomas decisiones importantes
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según tu comportamiento real
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
                <span className={styles.mapLabelTop}>🔍 Alto Cuestionamiento</span>
                <span className={styles.mapLabelBottom}>Bajo Cuestionamiento</span>
                <span className={styles.mapLabelLeft}>Baja Certeza</span>
                <span className={styles.mapLabelRight}>🔒 Alta Certeza</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>🔍 Escéptico Constructivo</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🛡️ Convicciones Testadas</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>🌫️ Sin Posición Clara</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🔒 Certeza Ciega</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Certeza ${puntuacionCerteza}/25, Cuestionamiento ${puntuacionCuestionamiento}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🔒 Certeza</span>
                  <span className={styles.scoreValue}>{puntuacionCerteza}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barCerteza}`}
                    style={{ width: `${(puntuacionCerteza / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🔍 Cuestionamiento</span>
                  <span className={styles.scoreValue}>{puntuacionCuestionamiento}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barCuestionamiento}`}
                    style={{ width: `${(puntuacionCuestionamiento / 25) * 100}%` }}
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
          title="📚 El principio de red team y por qué funciona"
          subtitle="Buscar fallos antes de que te encuentren"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es un red team?</h2>
            <p>
              El concepto de <em>red team</em> viene del ámbito militar: un equipo cuya misión es
              adoptar la perspectiva del adversario y encontrar vulnerabilidades en el plan propio.
              No porque sean &quot;negativos&quot;, sino porque los fallos que no encuentras tú los encontrará
              la realidad — y la realidad no da segundas oportunidades.
            </p>

            <h2>Charlie Munger y la inversión del problema</h2>
            <p>
              Charlie Munger, socio de Warren Buffett, popularizó la técnica de <strong>inversión</strong>:
              en lugar de preguntarte &quot;¿Cómo puedo tener éxito?&quot;, pregúntate &quot;¿Cómo puedo fracasar?&quot;
              y evita esas cosas. Es contraintuitivo, pero funciona: prevenir errores es más predecible
              que buscar aciertos.
            </p>

            <h2>La pre-mortem de Gary Klein</h2>
            <p>
              El psicólogo Gary Klein propuso una técnica llamada <strong>pre-mortem</strong>: antes
              de lanzar un proyecto, imagina que ha fracasado estrepitosamente y pregunta: &quot;¿Por
              qué falló?&quot;. Este ejercicio activa el pensamiento crítico de una forma que preguntar
              &quot;¿Qué podría salir mal?&quot; no consigue — porque cambia la perspectiva temporal.
            </p>

            <h2>Por qué nos cuesta cuestionar</h2>
            <p>
              El cerebro humano está diseñado para <strong>buscar confirmación, no refutación</strong>.
              Es más cómodo encontrar evidencia de que tenemos razón que buscar evidencia de que no.
              Por eso, el cuestionamiento activo necesita ser deliberado — no ocurre de forma natural.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Munger, C. (2005). <em>Poor Charlie&apos;s Almanack</em>. Donning Company Publishers.</li>
              <li>Klein, G. (2007). &quot;Performing a Project Premortem&quot;. <em>Harvard Business Review</em>.</li>
              <li>Tetlock, P. y Gardner, D. (2015). <em>Superforecasting: The Art and Science of Prediction</em>. Crown.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('checklist-segunda-opinion')} />
        <ShareCard appName="checklist-segunda-opinion" />
        <Footer appName="checklist-segunda-opinion" />
      </div>
    </>
  );
}
