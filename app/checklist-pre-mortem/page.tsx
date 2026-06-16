'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ChecklistPreMortem.module.css';
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
  dimension: 'anticipacion' | 'accion';
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
  // Intercaladas: anticipación (A) y acción (B) en patrón ABABABABAB
  { id: 1, texto: 'Antes de lanzar algo importante, dedicamos tiempo a pensar en qué podría salir mal', dimension: 'anticipacion' },
  { id: 2, texto: 'Para cada riesgo identificado, definimos una acción concreta de mitigación', dimension: 'accion' },
  { id: 3, texto: 'Identificamos los supuestos críticos del proyecto y verificamos si son realistas', dimension: 'anticipacion' },
  { id: 4, texto: 'Tenemos un "plan B" real (no teórico) para los puntos más críticos', dimension: 'accion' },
  { id: 5, texto: 'Consideramos escenarios negativos, no solo el escenario ideal', dimension: 'anticipacion' },
  { id: 6, texto: 'Ajustamos el plan original cuando el análisis de riesgos lo justifica', dimension: 'accion' },
  { id: 7, texto: 'Preguntamos a personas con experiencia: "¿qué puede fallar aquí que no estemos viendo?"', dimension: 'anticipacion' },
  { id: 8, texto: 'Asignamos responsables específicos para vigilar los riesgos principales', dimension: 'accion' },
  { id: 9, texto: 'Tenemos claro qué señales tempranas nos indicarían que algo va mal', dimension: 'anticipacion' },
  { id: 10, texto: 'Cuando detectamos una señal de alarma, actuamos rápido en lugar de esperar a que se resuelva sola', dimension: 'accion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(anticipacion: number, accion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (anticipacion >= umbralAlto && accion >= umbralAlto) {
    return {
      nombre: 'Prevención Activa',
      emoji: '🛡️',
      descripcion: 'Anticipas riesgos Y actúas sobre ellos. Dedicas tiempo a pensar qué puede fallar, verificas supuestos, defines planes B y asignas responsables. Gary Klein diría que practicas el pre-mortem de forma natural: imaginas el fracaso y trabajas hacia atrás para evitarlo. Es el perfil más resiliente.',
      fortalezas: [
        'Capacidad de anticipar problemas antes de que ocurran',
        'Planes de contingencia reales, no teóricos',
        'Equipo preparado para reaccionar ante señales de alarma',
      ],
      riesgos: [
        'Parálisis por análisis: tanto análisis de riesgos que se retrasa el lanzamiento',
        'Exceso de pesimismo que desmotive al equipo',
        'Inversión desproporcionada en prevenir riesgos poco probables',
      ],
      acciones: [
        'Establecer un límite de tiempo para el análisis pre-mortem (máximo 1 hora) — después, lanzar con lo que tengas',
        'Priorizar riesgos por impacto × probabilidad: no todos merecen un plan B, solo los que tienen alto impacto Y alta probabilidad',
        'Equilibrar el mensaje: al equipo, comunicar tanto los riesgos identificados como las razones por las que el proyecto puede funcionar',
        'Recuerda: el pre-mortem reduce errores evitables, pero no todos los fracasos lo son. Si algo sale mal pese a haber anticipado, no significa que el análisis fuera defectuoso — algunos factores son inevitables.',
      ],
    };
  }

  if (anticipacion >= umbralAlto && accion < umbralBajo) {
    return {
      nombre: 'Visionario Pasivo',
      emoji: '🔮',
      descripcion: 'Ves los riesgos con claridad — identificas qué puede fallar, cuestionas supuestos, consideras escenarios negativos — pero no conviertes ese análisis en acción. Los riesgos se documentan pero no se mitigan. Se habla de planes B que nunca se concretan. Es como tener un radar potente pero no tener misiles.',
      fortalezas: [
        'Excelente capacidad de diagnóstico y análisis',
        'Visión realista de lo que puede salir mal',
        'Cultura de cuestionamiento constructivo',
      ],
      riesgos: [
        'Riesgos identificados que se materializan igualmente por falta de acción',
        'Frustración del equipo: "sabíamos que iba a pasar y no hicimos nada"',
        'El análisis se convierte en un ritual vacío que no cambia las decisiones',
      ],
      acciones: [
        'Implantar la regla: "No se cierra un análisis de riesgos sin al menos UNA acción concreta para cada riesgo alto" — responsable, fecha y entregable',
        'Para cada riesgo identificado, preguntar: "¿Qué haríamos diferente si esto ocurriera mañana?" — y hacer ESO ahora',
        'Nombrar un "abogado de la acción" en cada sesión de análisis: alguien cuyo único rol es convertir diagnósticos en tareas',
      ],
    };
  }

  if (anticipacion < umbralBajo && accion >= umbralAlto) {
    return {
      nombre: 'Acción sin Mapa',
      emoji: '🏃',
      descripcion: 'Reaccionas bien cuando algo va mal — actúas rápido, ajustas el plan, asignas responsables — pero no dedicas suficiente tiempo a anticipar qué podría fallar. Eres bueno gestionando crisis, pero podrías evitar muchas de ellas si invirtieras más en la prevención.',
      fortalezas: [
        'Capacidad de reacción rápida y efectiva',
        'Cultura de acción: las cosas se hacen, no se quedan en el análisis',
        'Resiliencia ante imprevistos',
      ],
      riesgos: [
        'Crisis evitables que consumen tiempo y recursos',
        'Dependencia del heroísmo individual para salvar situaciones',
        'Apagar fuegos constantes que erosionan la moral del equipo',
      ],
      acciones: [
        'Antes del próximo lanzamiento, dedicar 30 minutos a un pre-mortem express: "Es enero del año que viene. El proyecto ha fracasado. ¿Qué pasó?" — escribir las respuestas',
        'Para los 3 riesgos más mencionados en el pre-mortem, definir una acción preventiva ANTES de lanzar (no después)',
        'Después de cada crisis resuelta, preguntarse: "¿Podríamos haber visto esto venir?" — y si la respuesta es sí, mejorar el proceso de anticipación',
      ],
    };
  }

  if (anticipacion < umbralBajo && accion < umbralBajo) {
    return {
      nombre: 'Lanzamiento sin Red',
      emoji: '⚠️',
      descripcion: 'Ni anticipas riesgos ni preparas planes de contingencia. Los proyectos se lanzan confiando en que todo saldrá bien, y cuando algo falla, se improvisa sobre la marcha. No es necesariamente mala intención — a menudo es presión de tiempo, cultura de "hacedores" o simplemente no haber aprendido a hacer pre-mortems.',
      fortalezas: [
        'Margen de mejora enorme: un solo pre-mortem cambiará la dinámica',
        'Velocidad de ejecución (lanzar rápido tiene valor, si se complementa con prevención)',
        'El equipo probablemente ya intuye los riesgos (solo necesita espacio para verbalizarlos)',
      ],
      riesgos: [
        'Fracasos evitables que dañan la reputación y la moral',
        'Repetición de errores: sin análisis, se tropieza con la misma piedra',
        'Dependencia de la suerte en lugar de la preparación',
      ],
      acciones: [
        'Esta semana: elegir el proyecto más importante en marcha y dedicar 20 minutos a escribir "3 formas en que esto podría fallar" — solo escribirlas, sin filtrar',
        'Para cada riesgo escrito, añadir UNA cosa que podrías hacer esta semana para reducir la probabilidad — no hace falta un plan completo, una acción basta',
        'Después del próximo proyecto (salga bien o mal), hacer una retrospectiva de 15 minutos: "¿Qué no anticipamos? ¿Qué haríamos diferente?"',
      ],
    };
  }

  // Perfiles intermedios
  if (anticipacion >= accion) {
    return {
      nombre: 'Tendencia al Análisis',
      emoji: '🔍',
      descripcion: 'Anticipas más de lo que actúas. Ves riesgos, los discutes, los documentas — pero la conversión a acciones concretas no siempre ocurre. El análisis está, pero la ejecución preventiva se queda a medias. Es el perfil más habitual en organizaciones con buena cultura de reflexión pero poca disciplina de seguimiento.',
      fortalezas: [
        'Capacidad de identificar riesgos que otros pasan por alto',
        'Cultura de reflexión antes de actuar',
        'Base sólida para construir un proceso de prevención completo',
      ],
      riesgos: [
        'Análisis que no se traduce en decisiones diferentes',
        'Sensación de seguridad falsa: "ya lo hemos analizado" (pero no actuado)',
        'Reuniones de riesgos que se convierten en rituales sin impacto',
      ],
      acciones: [
        'Al final de cada análisis de riesgos, obligarse a responder: "¿Qué vamos a hacer DIFERENTE como resultado de esta conversación?" — si la respuesta es "nada", el análisis no ha servido',
        'Limitar el análisis a los 3 riesgos principales y definir una acción para cada uno — mejor 3 acciones ejecutadas que 10 identificadas y olvidadas',
        'Crear una checklist breve de pre-mortem (5 preguntas) que se use siempre antes de lanzar, con espacio obligatorio para "acción asociada"',
      ],
    };
  }

  return {
    nombre: 'Tendencia a la Acción',
    emoji: '⚡',
    descripcion: 'Actúas más de lo que anticipas. Cuando algo va mal, reaccionas bien. Pero no siempre dedicas tiempo suficiente a pensar qué podría ir mal antes de que ocurra. La velocidad de ejecución es una fortaleza, pero un poco más de reflexión previa te ahorraría muchas crisis.',
    fortalezas: [
      'Velocidad de respuesta ante problemas',
      'Cultura de hacer en lugar de solo planificar',
      'Capacidad de adaptación sobre la marcha',
    ],
    riesgos: [
      'Problemas recurrentes que se resuelven pero no se previenen',
      'Agotamiento del equipo por gestión reactiva continua',
      'Oportunidades perdidas de hacer las cosas bien a la primera',
    ],
    acciones: [
      'Antes del próximo lanzamiento importante, invertir solo 15 minutos en un pre-mortem rápido: "Si esto falla, ¿cuáles serían las 3 causas más probables?"',
      'Para cada causa identificada, decidir antes de lanzar: ¿aceptamos el riesgo o hacemos algo para reducirlo?',
      'Crear el hábito de "pausa de 5 minutos" antes de ejecutar: ¿hay algo obvio que no hemos considerado?',
    ],
  };
}

/* ─── Componente ─── */

export default function ChecklistPreMortemPage() {
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

  const puntuacionAnticipacion = PREGUNTAS
    .filter((p) => p.dimension === 'anticipacion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionAccion = PREGUNTAS
    .filter((p) => p.dimension === 'accion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionAnticipacion, puntuacionAccion);

  // Posición en el mapa (0-100%) — X: acción, Y: anticipación
  const posX = ((puntuacionAccion - 5) / 20) * 100;
  const posY = 100 - ((puntuacionAnticipacion - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🔍</span> Checklist Pre-Mortem</h1>
          <p className={styles.subtitle}>
            Antes de lanzar algo: ¿por qué podría fallar?
            <br />
            Basado en el análisis pre-mortem de Gary Klein
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
            En un <em>post-mortem</em> analizas por qué algo falló. En un <strong>pre-mortem</strong>,
            imaginas que ya ha fallado y trabajas hacia atrás para descubrir por qué. Estudios sobre
            esta técnica sugieren que <strong>aumenta la capacidad del equipo de identificar riesgos</strong>
            respecto al análisis convencional —Klein cita un incremento aproximado del 30% en un
            estudio original sobre prospective hindsight—.
          </p>
          <p>
            Pero identificar riesgos no basta — hay que actuar sobre ellos. Este test mide las
            dos dimensiones: <strong>¿anticipas lo que puede fallar?</strong> y <strong>¿haces algo
            al respecto antes de que ocurra?</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo tu equipo o tú gestionáis los riesgos antes de lanzar algo
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
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}><span aria-hidden="true">🔮</span> Alta anticipación</span>
                <span className={styles.mapLabelBottom}>Baja anticipación</span>
                <span className={styles.mapLabelLeft}>Baja acción</span>
                <span className={styles.mapLabelRight}><span aria-hidden="true">🛡️</span> Alta acción</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span><span aria-hidden="true">🔮</span> Visionario Pasivo</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span><span aria-hidden="true">🛡️</span> Prevención Activa</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span><span aria-hidden="true">⚠️</span> Lanzamiento sin Red</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span><span aria-hidden="true">🏃</span> Acción sin Mapa</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Anticipación ${puntuacionAnticipacion}/25, Acción ${puntuacionAccion}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🔮</span> Anticipación</span>
                  <span className={styles.scoreValue}>{puntuacionAnticipacion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAnticipacion}`}
                    style={{ width: `${(puntuacionAnticipacion / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🛡️</span> Acción preventiva</span>
                  <span className={styles.scoreValue}>{puntuacionAccion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAccion}`}
                    style={{ width: `${(puntuacionAccion / 25) * 100}%` }}
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
          title="📚 El pre-mortem: pensar hacia atrás para avanzar mejor"
          subtitle="Gary Klein y la psicología de la anticipación"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es un pre-mortem?</h2>
            <p>
              Gary Klein, psicólogo cognitivo especializado en toma de decisiones en entornos de alta
              presión, propuso el pre-mortem en 1998. La idea es simple pero poderosa: en lugar de
              preguntar &quot;¿qué podría salir mal?&quot; (que genera respuestas genéricas), el pre-mortem
              pide al equipo que <strong>imagine que el proyecto ya ha fracasado</strong> y que explique
              por qué.
            </p>
            <p>
              Este cambio de perspectiva — del futuro condicional (&quot;podría fallar&quot;) al pasado
              imaginado (&quot;ha fallado&quot;) — tiene un efecto psicológico documentado: las personas
              identifican un <strong>30% más de riesgos</strong> y son más específicas sobre las causas.
            </p>

            <h2>¿Por qué funciona?</h2>
            <p>
              El pre-mortem funciona porque neutraliza dos sesgos cognitivos muy potentes:
            </p>
            <p>
              El llamado <strong>sesgo de optimismo</strong>: cierta literatura en psicología sugiere
              que tendemos a sobrestimar las probabilidades de éxito y subestimar los riesgos
              —especialmente cuando estamos implicados emocionalmente en el proyecto—. Cuando el
              éxito se da por sentado, nadie quiere ser &quot;el pesimista&quot;. El pre-mortem
              invierte la premisa: el fracaso ya ha ocurrido, así que analizarlo no es pesimismo,
              es investigación.
            </p>
            <p>
              El <strong>pensamiento de grupo</strong> (<em>groupthink</em>): en equipos donde hay presión
              por consenso, las voces críticas se callan. El pre-mortem da permiso explícito para
              señalar problemas — es parte del ejercicio, no una disidencia.
            </p>

            <h2>Las dos dimensiones: anticipar y actuar</h2>
            <p>
              Klein observó que muchos equipos hacen buenos análisis de riesgos pero luego no
              cambian nada. El pre-mortem se queda en un ejercicio intelectual si no se traduce
              en decisiones diferentes.
            </p>
            <p>
              La <strong>anticipación</strong> es la capacidad de identificar qué puede fallar,
              cuestionar supuestos y considerar escenarios negativos. Es la parte &quot;diagnóstico&quot;.
            </p>
            <p>
              La <strong>acción preventiva</strong> es la capacidad de convertir ese diagnóstico en
              cambios reales: planes de contingencia, ajustes al plan, señales de alarma monitorizadas.
              Es la parte &quot;tratamiento&quot;.
            </p>
            <p>
              Un equipo que anticipa pero no actúa tiene un problema de ejecución. Un equipo que
              actúa sin anticipar tiene un problema de dirección. El pre-mortem eficaz necesita ambas.
            </p>

            <h3>Cómo hacer un pre-mortem en 15 minutos</h3>
            <ol>
              <li><strong>Paso 1</strong>: &quot;Imaginad que estamos en [fecha futura]. El proyecto ha fracasado. ¿Por qué?&quot;</li>
              <li><strong>Paso 2</strong>: Cada persona escribe 2-3 razones de fracaso (5 min, en silencio).</li>
              <li><strong>Paso 3</strong>: Se comparten y se agrupan por temas (5 min).</li>
              <li><strong>Paso 4</strong>: Para los 3 riesgos principales: ¿qué acción concreta hacemos ANTES de lanzar? (5 min).</li>
            </ol>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Klein, G. (2007). <em>Performing a Project Premortem</em>. Harvard Business Review.</li>
              <li>Kahneman, D. (2011). <em>Pensar rápido, pensar despacio</em>. Debate. (Cap. sobre sesgo de optimismo).</li>
              <li>Janis, I. (1972). <em>Victims of Groupthink</em>. Houghton Mifflin.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('checklist-pre-mortem')} />
        <ShareCard appName="checklist-pre-mortem" />
        <Footer appName="checklist-pre-mortem" />
    </div>
  );
}
