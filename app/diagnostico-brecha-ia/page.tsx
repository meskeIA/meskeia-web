'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './DiagnosticoBrechaIA.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/* ─── Tipos ─── */

interface Pregunta {
  id: number;
  texto: string;
  dimension: 'criterio' | 'aprovechamiento';
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
  // Intercaladas: criterio propio (A) y aprovechamiento de IA (B) en patrón ABABABABAB
  { id: 1, texto: 'Cuando la IA me da una respuesta, la evalúo con mi propio criterio antes de usarla', dimension: 'criterio' },
  { id: 2, texto: 'Uso la IA para explorar ideas que no se me habrían ocurrido por mi cuenta', dimension: 'aprovechamiento' },
  { id: 3, texto: 'Sé distinguir cuándo una respuesta de IA es fiable y cuándo necesita verificación', dimension: 'criterio' },
  { id: 4, texto: 'La IA me ahorra tiempo en tareas rutinarias, lo que me permite dedicar más tiempo a pensar', dimension: 'aprovechamiento' },
  { id: 5, texto: 'Mantengo habilidades que podría delegar a la IA porque considero importante saber hacerlas', dimension: 'criterio' },
  { id: 6, texto: 'Adapto mis instrucciones a la IA según el resultado que necesito (no siempre pido lo mismo de la misma forma)', dimension: 'aprovechamiento' },
  { id: 7, texto: 'Puedo explicar el razonamiento detrás de mi trabajo aunque haya usado IA para producirlo', dimension: 'criterio' },
  { id: 8, texto: 'He descubierto usos de la IA que mis compañeros o competidores aún no aprovechan', dimension: 'aprovechamiento' },
  { id: 9, texto: 'Si mañana no tuviera acceso a IA, podría seguir haciendo mi trabajo (quizá más lento, pero con calidad)', dimension: 'criterio' },
  { id: 10, texto: 'Uso la IA como segunda opinión o para cuestionar mis propias ideas, no solo para confirmarlas', dimension: 'aprovechamiento' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(criterio: number, aprovechamiento: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (criterio >= umbralAlto && aprovechamiento >= umbralAlto) {
    return {
      nombre: 'Amplificador Consciente',
      emoji: '🧠',
      descripcion: 'Usas la IA para pensar mejor, no para dejar de pensar. Mantienes tu criterio, verificas lo que la IA produce, y al mismo tiempo aprovechas su potencial para ir más lejos de lo que irías solo. Es el perfil ideal: la IA amplifica tus capacidades sin erosionar tu juicio.',
      fortalezas: [
        'Criterio propio intacto: sabes cuándo confiar y cuándo cuestionar a la IA',
        'Aprovechamiento estratégico: usas la IA donde más valor aporta',
        'Capacidad de explicar y defender tu trabajo independientemente de la herramienta',
      ],
      riesgos: [
        'Sobreconfianza: creer que siempre detectarás los errores de la IA (los más sutiles son los más peligrosos)',
        'Brecha con quienes no usan IA: tus estándares de productividad pueden volverse inalcanzables sin ella',
        'Evolución constante: lo que hoy es uso avanzado, mañana es básico — hay que seguir aprendiendo',
      ],
      acciones: [
        'Reservar una tarea a la semana para hacerla SIN IA: mantener el músculo activo y calibrar cuánto dependes realmente de ella',
        'Compartir tus mejores prácticas con el equipo: el amplificador consciente crea más amplificadores, no más dependientes',
        'Probar una herramienta o técnica de IA nueva cada mes — la frontera se mueve rápido y la ventaja se erosiona',
      ],
    };
  }

  if (criterio >= umbralAlto && aprovechamiento < umbralBajo) {
    return {
      nombre: 'Escéptico Autosuficiente',
      emoji: '🛡️',
      descripcion: 'Tu criterio es fuerte — evalúas, cuestionas, verificas — pero apenas usas la IA o la usas de forma básica. No eres dependiente, lo cual es una fortaleza, pero estás dejando potencial sobre la mesa. Es como tener un buen motor pero conducir siempre en primera marcha.',
      fortalezas: [
        'Independencia total: tu trabajo no depende de ninguna herramienta',
        'Pensamiento crítico sólido y entrenado',
        'Capacidad de profundizar sin atajos',
      ],
      riesgos: [
        'Brecha de productividad con quienes sí usan IA — si tu sector valora esa velocidad. En sectores donde el criterio humano es el producto (terapia, artesanía, oficios), esta "brecha" puede no existir o incluso ser una ventaja reputacional.',
        'Oportunidades perdidas: ideas, perspectivas y eficiencias que la IA podría aportar',
        'Conviene revisar de vez en cuando si tu no-uso es una decisión informada o una rutina heredada — ambas son válidas, pero distintas',
      ],
      acciones: [
        'Elegir UNA tarea repetitiva de tu semana y probar a hacerla con IA — no para sustituirte, sino para comparar el resultado',
        'Usar la IA como "abogado del diablo": pedirle que critique una idea tuya. No para obedecerla, sino para ver ángulos que no habías considerado',
        'Preguntar a alguien que use IA intensivamente: "¿Qué haces con IA que yo debería probar?" — una sola cosa, y experimentar con ella',
      ],
    };
  }

  if (criterio < umbralBajo && aprovechamiento >= umbralAlto) {
    return {
      nombre: 'Dependiente Productivo',
      emoji: '🔌',
      descripcion: 'Aprovechas la IA al máximo — la usas para todo, conoces trucos avanzados, eres rápido — pero tu criterio propio se ha erosionado. Aceptas lo que la IA produce sin cuestionar suficiente, y si mañana no tuvieras acceso, te costaría hacer tu trabajo. La herramienta te hace productivo, pero frágil.',
      fortalezas: [
        'Alta productividad y velocidad de ejecución',
        'Conocimiento avanzado de las capacidades de la IA',
        'Capacidad de explorar muchas ideas rápidamente',
      ],
      riesgos: [
        'Fragilidad: si la IA falla, se cae o cambia, tu productividad se desploma',
        'Errores no detectados: la IA produce respuestas plausibles pero incorrectas, y sin criterio propio no los filtras',
        'Pérdida progresiva de habilidades fundamentales ("lo busco con IA" en lugar de "lo sé")',
      ],
      acciones: [
        'Esta semana, hacer UNA tarea importante completamente sin IA: escribir un email clave, analizar un problema, tomar una decisión. Evaluar la diferencia',
        'Para cada output de IA que uses en algo importante, preguntarte: "¿Podría defender esto en una reunión sin mencionar que lo hizo la IA?" — si no, revisarlo más',
        'Crear una lista de "habilidades que no quiero perder" y practicarlas deliberadamente, como un músico que hace escalas aunque tenga un sintetizador',
      ],
    };
  }

  if (criterio < umbralBajo && aprovechamiento < umbralBajo) {
    return {
      nombre: 'En Tierra de Nadie',
      emoji: '🌫️',
      descripcion: 'Ni aprovechas la IA ni mantienes activamente tu criterio frente a ella. Puede ser porque apenas la usas, porque la usas sin reflexión, o porque el entorno no ha hecho necesario posicionarse. No es un problema hoy, pero la brecha con quienes sí se han posicionado crece cada mes.',
      fortalezas: [
        'Punto de partida limpio: no has adquirido malos hábitos con la IA',
        'Oportunidad de construir una relación sana con la IA desde cero',
        'Margen de mejora enorme en ambas dimensiones',
      ],
      riesgos: [
        'Brecha creciente: el mercado se mueve y quedarse quieto es retroceder',
        'Riesgo de adoptar la IA sin criterio cuando la presión obligue (el peor escenario)',
        'Pérdida de competitividad profesional a medio plazo',
      ],
      acciones: [
        'Empezar con algo pequeño: usar la IA para UNA cosa esta semana (resumir un texto, generar ideas para un proyecto, resolver una duda técnica) y evaluar el resultado críticamente',
        'Antes de usar la IA, intentar responder tú primero. Después, comparar. Así entrenas criterio Y aprovechamiento al mismo tiempo',
        'Hablar con alguien que use IA a diario y preguntarle: "¿Qué cambió en tu forma de trabajar?" — no para copiar, sino para entender',
      ],
    };
  }

  // Perfiles intermedios
  if (criterio >= aprovechamiento) {
    return {
      nombre: 'Cauteloso con Potencial',
      emoji: '🔒',
      descripcion: 'Tu criterio es más fuerte que tu aprovechamiento de la IA. Cuestionas, verificas, no te fías ciegamente — todo bien. Pero podrías sacarle más partido a la herramienta sin perder esa cautela. La pregunta no es si deberías usar más IA, sino dónde te aportaría más valor sin comprometer tu juicio.',
      fortalezas: [
        'Base sólida de pensamiento crítico',
        'No eres vulnerable a los errores sutiles de la IA',
        'Margen para aumentar productividad sin riesgo de dependencia',
      ],
      riesgos: [
        'Infrautilización de una herramienta que podría multiplicar tu impacto',
        'La cautela se puede convertir en inercia si no se revisa',
        'Compañeros menos cautelosos pero más productivos pueden adelantarte en velocidad',
      ],
      acciones: [
        'Identificar las 3 tareas que más tiempo te consumen a la semana y probar si la IA puede acelerar alguna — con tu supervisión, no a ciegas',
        'Experimentar con la IA como "compañero de brainstorming": pedirle 10 ideas sobre un tema y usar tu criterio para filtrar las 2-3 valiosas',
        'Fijar un objetivo concreto: "Este mes, quiero usar la IA para [una cosa específica] y evaluar si el resultado compensa"',
      ],
    };
  }

  return {
    nombre: 'Entusiasta sin Red',
    emoji: '🚀',
    descripcion: 'Aprovechas la IA más de lo que la cuestionas. Eres productivo y exploras sus posibilidades, pero no siempre verificas lo que produce ni mantienes la capacidad de trabajar sin ella. El entusiasmo es bueno — solo necesita un contrapeso de criterio para ser sostenible.',
    fortalezas: [
      'Adopción rápida y sin miedo de nuevas herramientas',
      'Productividad por encima de la media',
      'Disposición a experimentar y aprender',
    ],
    riesgos: [
      'Errores que pasan desapercibidos por falta de verificación',
      'Dependencia creciente que se nota cuando la IA no está disponible',
      'Riesgo reputacional: si alguien detecta un error de IA en tu trabajo, la confianza se resiente',
    ],
    acciones: [
      'Implantar una rutina de "verificación mínima": para todo output de IA que vaya a ser visible, dedicar 2 minutos a revisar los datos clave y la lógica',
      'Una vez por semana, hacer una tarea que normalmente haces con IA completamente sin ella — es un seguro contra la fragilidad',
      'Cuando la IA te dé una respuesta que te sorprenda positivamente, preguntarte: "¿Es correcta o solo es convincente?" — la diferencia importa',
    ],
  };
}

/* ─── Componente ─── */

export default function DiagnosticoBrechaIAPage() {
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

  const puntuacionCriterio = PREGUNTAS
    .filter((p) => p.dimension === 'criterio')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionAprovechamiento = PREGUNTAS
    .filter((p) => p.dimension === 'aprovechamiento')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionCriterio, puntuacionAprovechamiento);

  // Posición en el mapa (0-100%) — X: aprovechamiento, Y: criterio
  const posX = ((puntuacionAprovechamiento - 5) / 20) * 100;
  const posY = 100 - ((puntuacionCriterio - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🧠</span> Diagnóstico de Brecha IA</h1>
          <p className={styles.subtitle}>
            ¿Usas la IA para pensar mejor o para dejar de pensar?
            <br />
            Criterio propio y aprovechamiento: las dos dimensiones que importan
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}><span aria-hidden="true">🕐</span> 3 minutos</span>
            <span className={styles.badge}><span aria-hidden="true">📊</span> 10 preguntas</span>
            <span className={styles.badge}><span aria-hidden="true">🔒</span> Sin registro</span>
          </div>
        </header>

        <LegalNotice />

        <section className={styles.contextCard}>
          <p>
            La IA generativa ha cambiado cómo trabajamos en meses, no en años. Pero hay una
            pregunta que pocos se hacen: <strong>¿la IA te está haciendo mejor profesional o
            solo más rápido?</strong> La velocidad sin criterio es fragilidad disfrazada de productividad.
          </p>
          <p>
            El verdadero riesgo no es que la IA te quite el trabajo — es que erosione tu capacidad
            de pensar por ti mismo sin que te des cuenta. <strong>Este test mide dos cosas: cuánto
            criterio propio mantienes y cuánto partido le sacas a la IA.</strong> El ideal es alto
            en ambas.
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo usas la IA en tu trabajo o actividad principal
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según lo que ocurre realmente, no lo que debería ocurrir
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
                    type="button"
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
            type="button"
            className={styles.btnPrimary}
            onClick={calcularResultado}
            disabled={!todasRespondidas}
            aria-label="Ver mi diagnóstico"
          >
            {todasRespondidas ? 'Ver mi diagnóstico' : `Responde las ${PREGUNTAS.length - Object.keys(respuestas).length} preguntas restantes`}
          </button>
        </section>

        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} role="status" aria-live="polite" aria-atomic="true">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}><span aria-hidden="true">🛡️</span> Alto criterio propio</span>
                <span className={styles.mapLabelBottom}>Bajo criterio propio</span>
                <span className={styles.mapLabelLeft}>Bajo aprovechamiento IA</span>
                <span className={styles.mapLabelRight}><span aria-hidden="true">🚀</span> Alto aprovechamiento IA</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span><span aria-hidden="true">🛡️</span> Escéptico Autosuficiente</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span><span aria-hidden="true">🧠</span> Amplificador Consciente</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span><span aria-hidden="true">🌫️</span> En Tierra de Nadie</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span><span aria-hidden="true">🔌</span> Dependiente Productivo</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Criterio propio ${puntuacionCriterio}/25, Aprovechamiento IA ${puntuacionAprovechamiento}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🛡️</span> Criterio propio</span>
                  <span className={styles.scoreValue}>{puntuacionCriterio}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barCriterio}`}
                    style={{ width: `${(puntuacionCriterio / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🚀</span> Aprovechamiento IA</span>
                  <span className={styles.scoreValue}>{puntuacionAprovechamiento}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAprovechamiento}`}
                    style={{ width: `${(puntuacionAprovechamiento / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <span className={styles.profileEmoji} aria-hidden="true">{perfil.emoji}</span>
                <h3 className={styles.profileName}>{perfil.nombre}</h3>
              </div>
              <p className={styles.profileDescription}>{perfil.descripcion}</p>

              <div className={styles.profileColumns}>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}><span aria-hidden="true">✅</span> Fortalezas</h4>
                  <ul className={styles.profileList}>
                    {perfil.fortalezas.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}><span aria-hidden="true">⚠️</span> Riesgos</h4>
                  <ul className={styles.profileList}>
                    {perfil.riesgos.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.actionsSection}>
                <h4 className={styles.actionsTitle}><span aria-hidden="true">🎯</span> Acciones sugeridas</h4>
                <ol className={styles.actionsList}>
                  {perfil.acciones.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </div>
            </div>

            <button type="button" className={styles.btnSecondary} onClick={reiniciar}>
              Repetir diagnóstico
            </button>
          </section>
        )}

        <EducationalSection
          title="📚 La IA amplifica lo que ya eres"
          subtitle="Por qué el criterio propio es más importante que nunca"
        >
          <section className={styles.guideSection}>
            <h2>El problema no es la IA — es la relación que estableces con ella</h2>
            <p>
              La IA generativa es la herramienta más potente que ha llegado al trabajo del conocimiento
              en décadas. Pero como toda herramienta potente, puede usarse de formas muy diferentes:
              un bisturí puede salvar una vida o causar un daño irreversible. La diferencia está en
              quién lo sostiene y con qué criterio.
            </p>
            <p>
              El riesgo más sutil de la IA no es que te quite el trabajo — es que <strong>erosione
              tu capacidad de pensar sin que te des cuenta</strong>. Cuando delegas el pensamiento
              repetidamente, el músculo se atrofia. Y cuando el músculo se atrofia, pierdes la
              capacidad de evaluar si lo que la IA produce es correcto.
            </p>

            <h2>Dos dimensiones independientes</h2>
            <p>
              El <strong>criterio propio</strong> es tu capacidad de evaluar, cuestionar y verificar
              lo que la IA produce. Es saber cuándo confiar y cuándo dudar. Es poder explicar por
              qué tu trabajo es correcto, independientemente de cómo lo hayas producido.
            </p>
            <p>
              El <strong>aprovechamiento</strong> es cuánto partido le sacas a la IA como herramienta.
              No es solo usarla — es usarla bien: para explorar ideas, automatizar lo rutinario,
              obtener perspectivas diferentes, acelerar sin comprometer calidad.
            </p>
            <p>
              Estas dos dimensiones son independientes. Puedes tener mucho criterio pero no usar IA
              (estás seguro pero infrautilizas una herramienta). Puedes usar mucha IA sin criterio
              (eres productivo pero frágil). <strong>El objetivo es ser alto en ambas: amplificar
              tus capacidades sin perder tu juicio.</strong>
            </p>

            <h2>La trampa de la productividad aparente</h2>
            <p>
              Uno de los efectos más documentados del uso intensivo de IA es lo que algunos
              investigadores llaman <em>deskilling</em>: la pérdida gradual de habilidades que
              dejas de practicar. Escribir sin corrector, calcular sin calculadora, razonar sin IA
              — cada habilidad que delegas permanentemente es una habilidad que se deteriora.
            </p>
            <p>
              Esto no significa no delegar — significa <strong>delegar conscientemente</strong>:
              saber qué has delegado, por qué, y mantener la capacidad de recuperarlo si lo necesitas.
              Un piloto de avión usa el piloto automático, pero sabe volar manualmente. La pregunta
              es: ¿tú también?
            </p>

            <h2>El principio de meskeIA</h2>
            <p>
              Este test nace del principio fundacional de meskeIA: <em>&quot;La IA amplifica lo que
              ya eres. Si piensas bien, te hace mejor. Si no, te vuelve dependiente.&quot;</em>
              La herramienta no es el problema ni la solución — lo que importa es la relación que
              estableces con ella.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Mollick, E. (2024). <em>Co-Intelligence: Living and Working with AI</em>. Portfolio/Penguin.</li>
              <li>Newport, C. (2024). <em>Slow Productivity: The Lost Art of Accomplishment Without Burnout</em>. Portfolio/Penguin.</li>
              <li>Kahneman, D. (2011). <em>Pensar rápido, pensar despacio</em>. Debate. (Sobre los límites del juicio humano que la IA no resuelve).</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('diagnostico-brecha-ia')} />
        <ShareCard appName="diagnostico-brecha-ia" />
        <Footer appName="diagnostico-brecha-ia" />
    </div>
  );
}
