'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './DiagnosticoComunicacionInterna.module.css';
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
  dimension: 'velocidad' | 'profundidad';
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
  // Intercaladas: velocidad (A) y profundidad (B) en patrón ABABABABAB
  { id: 1, texto: 'La información urgente llega rápido a quien la necesita', dimension: 'velocidad' },
  { id: 2, texto: 'Las decisiones importantes se explican con contexto y razonamiento, no solo con el resultado', dimension: 'profundidad' },
  { id: 3, texto: 'Las decisiones del equipo se comunican el mismo día en que se toman', dimension: 'velocidad' },
  { id: 4, texto: 'Documentamos los acuerdos y decisiones por escrito para que queden accesibles', dimension: 'profundidad' },
  { id: 5, texto: 'Si alguien tiene una duda operativa, obtiene respuesta en poco tiempo', dimension: 'velocidad' },
  { id: 6, texto: 'Dedicamos tiempo a comunicar el "por qué" detrás de los cambios, no solo el "qué"', dimension: 'profundidad' },
  { id: 7, texto: 'Usamos canales de comunicación rápidos (chat, mensajería) para coordinar el día a día', dimension: 'velocidad' },
  { id: 8, texto: 'Los temas complejos se discuten en un formato que permite reflexión, no solo mensajes rápidos', dimension: 'profundidad' },
  { id: 9, texto: 'Cuando hay un cambio de planes, todo el equipo se entera inmediatamente', dimension: 'velocidad' },
  { id: 10, texto: 'La información clave del equipo está documentada en un sitio accesible, no solo en la cabeza de alguien', dimension: 'profundidad' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(velocidad: number, profundidad: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (velocidad >= umbralAlto && profundidad >= umbralAlto) {
    return {
      nombre: 'Comunicación Completa',
      emoji: '💎',
      descripcion: 'Tu equipo comunica rápido Y con profundidad. La información urgente llega a tiempo, y las decisiones importantes se explican con contexto y quedan documentadas. Es el perfil más difícil de mantener porque la presión del día a día siempre empuja hacia la velocidad a costa de la profundidad.',
      fortalezas: [
        'Información que fluye rápido sin perder contexto',
        'Decisiones documentadas y accesibles para todos',
        'Equilibrio entre comunicación sincrónica y asincrónica',
      ],
      riesgos: [
        'Sobrecarga informativa: demasiados canales, demasiados mensajes',
        'El esfuerzo de documentar puede volverse burocrático si no se gestiona',
        'Personas nuevas que no saben dónde buscar tanta información',
      ],
      acciones: [
        'Revisar trimestralmente los canales de comunicación: ¿siguen todos siendo necesarios? Eliminar redundancias',
        'Crear un "mapa de información" para nuevas incorporaciones: dónde se encuentra cada tipo de contenido',
        'Proteger este equilibrio activamente — cuando llegue presión, la profundidad será lo primero que se sacrifique',
      ],
    };
  }

  if (velocidad >= umbralAlto && profundidad < umbralBajo) {
    return {
      nombre: 'Velocidad sin Sustancia',
      emoji: '⚡',
      descripcion: 'Tu equipo comunica rápido — la información llega, los canales funcionan, las respuestas son inmediatas — pero falta profundidad. Las decisiones se anuncian sin explicar el porqué, los acuerdos no se documentan, y los temas complejos se resuelven en hilos de chat que nadie volverá a leer.',
      fortalezas: [
        'Velocidad de reacción y coordinación operativa',
        'Canales activos y equipo que responde',
        'Capacidad de adaptarse rápido a cambios',
      ],
      riesgos: [
        'Decisiones que nadie recuerda por qué se tomaron',
        'Información importante enterrada en conversaciones efímeras',
        'Malentendidos recurrentes por falta de contexto',
      ],
      acciones: [
        'Implantar la regla del "por qué": toda decisión comunicada incluye una frase explicando la razón detrás, no solo el resultado',
        'Elegir UN lugar (wiki, doc compartido, canal específico) donde se documentan acuerdos y decisiones — y usarlo de verdad',
        'Para temas complejos, cambiar de formato: en lugar de hilos de chat, usar un documento breve que todos leen antes de opinar',
      ],
    };
  }

  if (velocidad < umbralBajo && profundidad >= umbralAlto) {
    return {
      nombre: 'Profunda pero Lenta',
      emoji: '📖',
      descripcion: 'Tu equipo documenta bien, explica el contexto de las decisiones y los temas complejos se tratan con la profundidad que merecen. Pero la información tarda en llegar. Los cambios se comunican tarde, las dudas tardan en resolverse, y la coordinación del día a día se resiente.',
      fortalezas: [
        'Decisiones bien documentadas y con contexto',
        'Conocimiento compartido y accesible',
        'Cultura de reflexión antes de actuar',
      ],
      riesgos: [
        'En entornos donde la calidad pesa más que la velocidad operativa (legal, sanitario, investigación), este perfil puede ser deseable. En entornos comerciales o de operaciones con cambios rápidos, la lentitud puede generar fricción',
      ],
      acciones: [
        'Separar la comunicación en dos carriles: un canal rápido para urgencias operativas y otro para discusiones profundas — y respetar ambos',
        'Establecer un acuerdo de tiempo de respuesta para mensajes operativos (ej. máximo 2 horas en horario laboral)',
        'Para decisiones ya tomadas, comunicar inmediatamente el resultado y después (máximo 24h) el razonamiento completo',
      ],
    };
  }

  if (velocidad < umbralBajo && profundidad < umbralBajo) {
    return {
      nombre: 'Comunicación Rota',
      emoji: '🔇',
      descripcion: 'La información no llega rápido ni con profundidad. Las personas trabajan con suposiciones, las decisiones se pierden, y cada uno reconstruye la información como puede. No es necesariamente culpa de nadie — a menudo es el resultado de crecer sin definir cómo se comunica el equipo.',
      fortalezas: [
        'Margen de mejora enorme: cualquier mejora se notará inmediatamente',
        'El equipo probablemente ya sabe qué falla (solo necesita que alguien lo organice)',
        'Oportunidad de diseñar la comunicación desde cero, adaptada al equipo real',
      ],
      riesgos: [
        'Errores evitables por falta de información',
        'Trabajo duplicado porque la gente no sabe qué hacen los demás',
        'Desmotivación por sentirse desconectado del equipo',
      ],
      acciones: [
        'Esta semana: elegir UNA herramienta para comunicación rápida (chat) y UNA para documentación (wiki/doc compartido) — solo una de cada',
        'Establecer una reunión semanal breve (15 min) donde cada persona comparte: qué hizo, qué hará, qué necesita — nada más',
        'Para cada decisión importante esta semana, escribir una frase con el "qué" y otra con el "por qué", y compartirla. Solo eso',
      ],
    };
  }

  // Perfiles intermedios
  if (velocidad >= profundidad) {
    return {
      nombre: 'Tendencia a la Velocidad',
      emoji: '💬',
      descripcion: 'Tu equipo se comunica con razonable agilidad, pero la profundidad queda algo rezagada. Las cosas se saben rápido, pero a veces sin el contexto necesario. Es el patrón más habitual en equipos que usan mucho chat y mensajería instantánea: el medio favorece la brevedad.',
      fortalezas: [
        'Equipo conectado y que responde',
        'Información operativa que fluye',
        'Capacidad de reacción ante cambios',
      ],
      riesgos: [
        'Contexto que se pierde en la velocidad del chat',
        'Temas complejos tratados superficialmente por presión de responder rápido',
        'Fatiga de notificaciones que reduce la calidad de atención',
      ],
      acciones: [
        'Identificar los 3 temas que más malentendidos generan y crear un documento breve para cada uno (contexto, criterios, decisiones tomadas)',
        'Para mensajes importantes, usar la estructura: DECISIÓN + POR QUÉ + QUÉ CAMBIA — todo en el mismo mensaje, no en 5 mensajes separados',
        'Experimentar con "horas de enfoque": periodos sin notificaciones donde la comunicación asincrónica funciona mejor que la instantánea',
      ],
    };
  }

  return {
    nombre: 'Tendencia a la Profundidad',
    emoji: '📝',
    descripcion: 'Tu equipo cuida la calidad de lo que comunica, pero a veces a costa de la velocidad. Los documentos están, el contexto se da, pero la información tarda más de lo deseable en llegar a quien la necesita. La intención es buena; el timing puede mejorar.',
    fortalezas: [
      'Cultura de documentación y transparencia',
      'Decisiones que se entienden, no solo se acatan',
      'Base de conocimiento que se construye con el tiempo',
    ],
    riesgos: [
      'Información que llega correcta pero tarde',
      'Personas que no leen los documentos largos (y se pierden el contexto que costó preparar)',
      'Perfeccionismo en la comunicación que retrasa lo urgente',
    ],
    acciones: [
      'Adoptar el formato "TL;DR" (resumen arriba, detalle debajo): 2 líneas con la decisión, y luego el contexto completo para quien quiera profundizar',
      'Para información operativa urgente, priorizar velocidad sobre perfección: mejor un mensaje rápido imperfecto que uno perfecto que llega tarde',
      'Crear alertas o notificaciones automáticas para cambios críticos — no depender de que alguien recuerde comunicar',
    ],
  };
}

/* ─── Componente ─── */

export default function DiagnosticoComunicacionInternaPage() {
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

  const puntuacionVelocidad = PREGUNTAS
    .filter((p) => p.dimension === 'velocidad')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionProfundidad = PREGUNTAS
    .filter((p) => p.dimension === 'profundidad')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionVelocidad, puntuacionProfundidad);

  // Posición en el mapa (0-100%) — X: profundidad, Y: velocidad
  const posX = ((puntuacionProfundidad - 5) / 20) * 100;
  const posY = 100 - ((puntuacionVelocidad - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>📡 Diagnóstico de Comunicación Interna</h1>
          <p className={styles.subtitle}>
            ¿Tu equipo comunica rápido pero sin profundidad?
            <br />
            Velocidad y profundidad: las dos dimensiones que importan
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
            Las herramientas de comunicación modernas —Slack, Teams, WhatsApp— han resuelto
            el problema de la <strong>velocidad</strong>: la información llega al instante. Pero han
            creado uno nuevo: la <strong>profundidad</strong> se pierde. Las decisiones se anuncian en
            hilos que nadie relee, el contexto se fragmenta en 40 mensajes de 2 líneas, y lo
            importante se entierra bajo lo urgente.
          </p>
          <p>
            Un equipo que comunica bien necesita ambas cosas: que la información llegue
            rápido <strong>y</strong> que llegue con el contexto suficiente para que se entienda y
            se recuerde.
            <strong> Este test mide cómo funciona tu equipo en cada dimensión.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo se comunica tu equipo en el día a día
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
                <span className={styles.mapLabelTop}>⚡ Alta velocidad</span>
                <span className={styles.mapLabelBottom}>Baja velocidad</span>
                <span className={styles.mapLabelLeft}>Baja profundidad</span>
                <span className={styles.mapLabelRight}>📖 Alta profundidad</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>⚡ Velocidad sin Sustancia</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>💎 Comunicación Completa</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>🔇 Comunicación Rota</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>📖 Profunda pero Lenta</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Velocidad ${puntuacionVelocidad}/25, Profundidad ${puntuacionProfundidad}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>⚡ Velocidad</span>
                  <span className={styles.scoreValue}>{puntuacionVelocidad}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barVelocidad}`}
                    style={{ width: `${(puntuacionVelocidad / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>📖 Profundidad</span>
                  <span className={styles.scoreValue}>{puntuacionProfundidad}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barProfundidad}`}
                    style={{ width: `${(puntuacionProfundidad / 25) * 100}%` }}
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
          title="📚 La dictadura de lo urgente en la comunicación"
          subtitle="Por qué comunicamos más pero nos entendemos menos"
        >
          <section className={styles.guideSection}>
            <h2>El problema no es comunicar poco — es comunicar mal</h2>
            <p>
              En los años 90, el problema de comunicación en las empresas era la falta de información:
              los equipos no sabían qué hacían los demás. Las herramientas digitales resolvieron eso.
              Hoy, el problema es el opuesto: <strong>hay tanta comunicación que lo importante se
              ahoga en lo inmediato</strong>.
            </p>
            <p>
              Cal Newport, en <em>A World Without Email</em> (2021), documentó que el trabajador medio
              revisa su email o chat cada 6 minutos. No es un problema de disciplina personal — es un
              problema de diseño: las herramientas están optimizadas para la velocidad, no para la
              comprensión.
            </p>

            <h2>Velocidad vs profundidad: una tensión inevitable</h2>
            <p>
              La <strong>velocidad</strong> de comunicación es la capacidad de que la información llegue
              rápido a quien la necesita. Es fundamental para la coordinación operativa: cambios de plan,
              urgencias, preguntas del día a día.
            </p>
            <p>
              La <strong>profundidad</strong> es la capacidad de que la información llegue con el contexto
              suficiente para entenderse, recordarse y reutilizarse. Es fundamental para las decisiones
              complejas, el aprendizaje organizacional y la alineación del equipo.
            </p>
            <p>
              La tensión es real: un mensaje rápido de chat es veloz pero superficial. Un documento
              detallado es profundo pero lento. <strong>Los mejores equipos no eligen una u otra — diseñan
              sistemas que permiten ambas según el tipo de información.</strong>
            </p>

            <h2>El concepto de comunicación asincrónica</h2>
            <p>
              Empresas como Basecamp, GitLab o Doist han popularizado la comunicación asincrónica: en
              lugar de esperar que todos estén disponibles al mismo tiempo, la información se escribe
              de forma que pueda leerse cuando convenga.
            </p>
            <p>
              La clave no es eliminar la comunicación sincrónica (reuniones, chat en tiempo real), sino
              usarla solo cuando es necesaria: temas emocionales, decisiones urgentes, brainstorming.
              Todo lo demás —actualizaciones, decisiones documentadas, contexto— funciona mejor de
              forma asincrónica.
            </p>
            <p>
              Los modelos asincrónicos populares (Basecamp, GitLab, Doist) son culturalmente anglosajones
              y muy adaptados a equipos remotos distribuidos. En equipos pequeños con contexto compartido
              y proximidad física, la comunicación oral puede sustituir parte de la documentación sin
              pérdida real. El óptimo depende del tamaño, la dispersión y la cultura del equipo.
            </p>

            <h2>Las dos dimensiones de este test</h2>
            <p>
              Este diagnóstico mide la velocidad y la profundidad como dimensiones independientes.
              Un equipo puede ser rápido y profundo (ideal), rápido pero superficial (el patrón más
              común), profundo pero lento, o deficiente en ambas.
            </p>
            <p>
              Tu perfil revela el patrón actual de tu equipo y sugiere acciones concretas para
              mejorar la dimensión más débil sin sacrificar la fuerte.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Newport, C. (2021). <em>A World Without Email</em>. Portfolio/Penguin.</li>
              <li>Fried, J. y Heinemeier Hansson, D. (2013). <em>Remote: Office Not Required</em>. Crown Business.</li>
              <li>Artículo &quot;La dictadura de lo urgente&quot; — La Vanguardia, 02/04/2026.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('diagnostico-comunicacion-interna')} />
        <ShareCard appName="diagnostico-comunicacion-interna" />
        <Footer appName="diagnostico-comunicacion-interna" />
      </div>
    </>
  );
}
