'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TestDelegacionEfectiva.module.css';
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
  dimension: 'acompanamiento' | 'autonomia';
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
  // Intercaladas: acompañamiento (A) y autonomía (B) en patrón ABABABABAB
  { id: 1, texto: 'Cuando delego una tarea, explico el contexto y el "por qué", no solo el "qué"', dimension: 'acompanamiento' },
  { id: 2, texto: 'Permito que la persona elija cómo hacer la tarea, no solo que la ejecute', dimension: 'autonomia' },
  { id: 3, texto: 'Establezco puntos de seguimiento intermedios, no solo espero al resultado final', dimension: 'acompanamiento' },
  { id: 4, texto: 'Acepto que el resultado puede ser diferente a cómo lo habría hecho yo', dimension: 'autonomia' },
  { id: 5, texto: 'Adapto mi nivel de supervisión según la experiencia de la persona', dimension: 'acompanamiento' },
  { id: 6, texto: 'La persona delegada puede tomar decisiones sin consultarme para cada detalle', dimension: 'autonomia' },
  { id: 7, texto: 'Doy feedback específico después de cada tarea delegada (qué salió bien y qué mejorar)', dimension: 'acompanamiento' },
  { id: 8, texto: 'Delego tareas con impacto real, no solo las rutinarias o las que no quiero hacer', dimension: 'autonomia' },
  { id: 9, texto: 'Me aseguro de que la persona tiene los recursos y la información necesarios antes de empezar', dimension: 'acompanamiento' },
  { id: 10, texto: 'Cuando alguien comete un error en una tarea delegada, lo trato como aprendizaje, no como motivo para dejar de delegar', dimension: 'autonomia' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(acompanamiento: number, autonomia: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (acompanamiento >= umbralAlto && autonomia >= umbralAlto) {
    return {
      nombre: 'Delegación Efectiva',
      emoji: '🎯',
      descripcion: 'Combinas acompañamiento con autonomía real. Das contexto, haces seguimiento y ofreces feedback, pero al mismo tiempo dejas espacio para que la persona decida, se equivoque y aprenda. Hersey y Blanchard lo llamarían un estilo adaptativo maduro: sabes cuándo estar cerca y cuándo soltar.',
      fortalezas: [
        'Equilibrio entre supervisión y confianza',
        'Desarrollo activo de las capacidades del equipo',
        'Delegación que genera crecimiento, no solo reparto de carga',
      ],
      riesgos: [
        'Invertir demasiado tiempo en acompañar cuando la persona ya es autónoma',
        'No escalar: si delegas siempre con este nivel de detalle, hay un techo de cuántas personas puedes gestionar',
        'Asumir que todos necesitan el mismo nivel de acompañamiento',
      ],
      acciones: [
        'Clasificar a tu equipo en 3 niveles de madurez y ajustar tu estilo: más dirección para juniors, más autonomía para seniors',
        'Para personas con experiencia, reducir conscientemente el seguimiento: confía en el sistema que has creado',
        'Dedicar tiempo a documentar procesos para que la delegación no dependa siempre de tu explicación personal',
      ],
    };
  }

  if (acompanamiento >= umbralAlto && autonomia < umbralBajo) {
    return {
      nombre: 'Microgestión con Cariño',
      emoji: '🔍',
      descripcion: 'Acompañas bien — das contexto, haces seguimiento, ofreces feedback — pero no sueltas el control. La persona recibe mucho soporte pero poco espacio para decidir. Hersey y Blanchard lo describirían como un estilo "directivo" que puede ser apropiado para personas muy junior, pero limitante si se aplica siempre. En algunos contextos (formación inicial, trabajos críticos en seguridad, equipos muy nuevos) este estilo no solo es válido sino necesario. El problema surge cuando se aplica por defecto a todo el mundo y a toda tarea.',
      fortalezas: [
        'Alto nivel de soporte y estructura para el equipo',
        'Errores detectados pronto gracias al seguimiento cercano',
        'Personas que se sienten acompañadas y guiadas',
      ],
      riesgos: [
        'Dependencia: el equipo no desarrolla criterio propio',
        'Cuello de botella: todo pasa por ti, lo que limita la velocidad del equipo',
        'Frustración de personas experimentadas que se sienten tratadas como juniors',
      ],
      acciones: [
        'Elegir UNA tarea esta semana y delegarla con resultado esperado pero SIN definir el cómo — solo el qué y el para cuándo',
        'Preguntar a tu equipo: "¿En qué áreas te gustaría tener más autonomía?" — y escuchar sin defender tu método',
        'Cuando sientas la urgencia de intervenir, esperar 24 horas antes de hacerlo. Si no es urgente, probablemente no necesitan tu intervención',
      ],
    };
  }

  if (acompanamiento < umbralBajo && autonomia >= umbralAlto) {
    return {
      nombre: 'Soltar y Rezar',
      emoji: '🪂',
      descripcion: 'Das autonomía — la persona decide y actúa — pero sin el acompañamiento necesario. Puede funcionar con personas muy senior, pero para la mayoría se traduce en tareas sin contexto suficiente, sin seguimiento y sin feedback. No es delegar: es soltar tareas y esperar que salgan bien.',
      fortalezas: [
        'Confianza genuina en las capacidades del equipo',
        'No generas cuellos de botella: las cosas se mueven rápido',
        'Personas autónomas prosperan con este estilo',
      ],
      riesgos: [
        'Errores evitables que se descubren demasiado tarde',
        'Personas que se sienten abandonadas o sin dirección',
        'Desalineación: cada uno interpreta la tarea a su manera sin contexto común',
      ],
      acciones: [
        'Para cada tarea delegada, invertir 10 minutos en explicar el "por qué" además del "qué" — ese contexto cambia la calidad del resultado',
        'Establecer UN punto de seguimiento intermedio (no al final, no diario): un check rápido a mitad de camino',
        'Después de cada entrega, dedicar 5 minutos a feedback concreto: qué estuvo bien, qué cambiarías. Cada vez. Sin excepción',
      ],
    };
  }

  if (acompanamiento < umbralBajo && autonomia < umbralBajo) {
    return {
      nombre: 'Retención Total',
      emoji: '🔒',
      descripcion: 'Ni acompañas ni das autonomía. Las tareas se reparten pero sin contexto, sin seguimiento y sin espacio real para decidir. Puede ocurrir por falta de tiempo, desconfianza acumulada o simplemente porque nunca te enseñaron a delegar. No es un juicio — es un punto de partida.',
      fortalezas: [
        'Margen de mejora enorme: cualquier cambio se notará en el equipo',
        'Probablemente haces muchas cosas tú mismo, lo que significa que conoces los procesos en detalle',
        'La decisión de mejorar la delegación es el primer paso más importante',
      ],
      riesgos: [
        'Sobrecarga personal: haces más de lo que deberías',
        'Equipo infrautilizado y potencialmente desmotivado',
        'Escalabilidad imposible: tu capacidad individual es el techo del equipo',
      ],
      acciones: [
        'Esta semana, elegir UNA tarea que haces tú pero que alguien más podría hacer. Dedicar 15 minutos a explicar el contexto y delegarla con seguimiento a mitad y al final',
        'Hacer una lista de "tareas que solo yo puedo hacer" vs "tareas que hago yo pero alguien podría aprender". La segunda lista es tu plan de delegación',
        'Aceptar que las primeras delegaciones serán más lentas y menos perfectas — es una inversión, no una pérdida',
      ],
    };
  }

  // Perfiles intermedios
  if (acompanamiento >= autonomia) {
    return {
      nombre: 'Tendencia al Control',
      emoji: '📋',
      descripcion: 'Acompañas más de lo que sueltas. No es microgestión extrema, pero hay una inclinación a supervisar de cerca y dar poco margen de decisión. Para personas junior puede funcionar bien; para el resto del equipo, puede frenar su desarrollo.',
      fortalezas: [
        'Buen nivel de seguimiento y estructura',
        'Errores controlados gracias a la supervisión',
        'Equipo que recibe dirección clara',
      ],
      riesgos: [
        'Personas con experiencia que se sienten limitadas',
        'Delegación que no escala porque requiere mucha presencia tuya',
        'Riesgo de que el equipo no desarrolle iniciativa propia',
      ],
      acciones: [
        'Identificar a las 2-3 personas más experimentadas del equipo y aumentar conscientemente su autonomía: menos checkpoints, más decisiones propias',
        'En cada tarea delegada, definir explícitamente qué decisiones puede tomar la persona sin consultarte',
        'Medir tu éxito no por la calidad de lo que supervisas, sino por la calidad de lo que no necesitas supervisar',
      ],
    };
  }

  return {
    nombre: 'Tendencia a Soltar',
    emoji: '🌊',
    descripcion: 'Das más autonomía de la que acompañas. La intención es buena — confías en tu equipo — pero sin el contexto y el feedback suficientes, esa confianza puede traducirse en desorientación. La autonomía funciona cuando viene con información, no cuando es sinónimo de "arréglate".',
    fortalezas: [
      'Confianza en el equipo y en sus capacidades',
      'No generas dependencia: las personas se mueven',
      'Cultura de autonomía que atrae talento independiente',
    ],
    riesgos: [
      'Desalineación silenciosa: cada uno entiende la tarea a su manera',
      'Feedback ausente que impide el crecimiento',
      'Personas nuevas o junior que se sienten perdidas',
    ],
    acciones: [
      'Antes de cada delegación, preguntarte: "¿Esta persona tiene todo el contexto que yo tengo?" — si no, invertir 10 minutos en compartirlo',
      'Establecer una rutina de feedback breve: 5 minutos después de cada entrega para decir qué estuvo bien y qué ajustar',
      'Para personas nuevas o en tareas nuevas, aumentar temporalmente el acompañamiento hasta que demuestren que el sistema funciona',
    ],
  };
}

/* ─── Componente ─── */

export default function TestDelegacionEfectivaPage() {
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

  // Cálculos
  const puntuacionAcompanamiento = PREGUNTAS
    .filter((p) => p.dimension === 'acompanamiento')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionAutonomia = PREGUNTAS
    .filter((p) => p.dimension === 'autonomia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionAcompanamiento, puntuacionAutonomia);

  // Posición en el mapa (0-100%) — X: autonomía, Y: acompañamiento
  const posX = ((puntuacionAutonomia - 5) / 20) * 100;
  const posY = 100 - ((puntuacionAcompanamiento - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🤝</span> Test de Delegación Efectiva</h1>
          <p className={styles.subtitle}>
            ¿Delegas bien o solo sueltas tareas?
            <br />
            Basado en el Modelo Situacional de Hersey-Blanchard
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}><span aria-hidden="true">🕐</span> 3 minutos</span>
            <span className={styles.badge}><span aria-hidden="true">📊</span> 10 preguntas</span>
            <span className={styles.badge}><span aria-hidden="true">🔒</span> Sin registro</span>
          </div>
        </header>

        <LegalNotice />

        {/* Contexto breve */}
        <section className={styles.contextCard}>
          <p>
            Este test está pensado para personas que coordinan a otras: mandos, responsables de equipo,
            autónomos que subcontratan, o cualquiera que reparta tareas en un grupo (incluso familiar o
            de voluntariado). Si no es tu caso, te puede servir para reflexionar sobre cómo te gustaría
            que delegaran contigo.
          </p>
          <p>
            Delegar no es repartir tareas. <strong>Delegar bien requiere dos cosas que casi nunca
            van juntas</strong>: dar soporte suficiente (contexto, seguimiento, feedback) y al mismo
            tiempo dar autonomía real (espacio para decidir, equivocarse y aprender).
          </p>
          <p>
            Hersey y Blanchard demostraron que no existe un estilo de delegación &quot;correcto&quot;
            universal — el mejor estilo depende de la madurez de la persona. Pero lo que sí existe
            es un <strong>patrón de delegación</strong> personal que tendemos a repetir con todos.
            <strong> Este test mide el tuyo.</strong>
          </p>
        </section>

        {/* Preguntas */}
        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo delegas habitualmente en tu equipo o entorno de trabajo
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

        {/* Resultado */}
        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            {/* Mapa 2D */}
            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}><span aria-hidden="true">🤝</span> Alto acompañamiento</span>
                <span className={styles.mapLabelBottom}>Bajo acompañamiento</span>
                <span className={styles.mapLabelLeft}>Baja autonomía</span>
                <span className={styles.mapLabelRight}><span aria-hidden="true">🚀</span> Alta autonomía</span>
              </div>
              <div className={styles.map}>
                {/* Cuadrantes */}
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span><span aria-hidden="true">🔍</span> Microgestión con Cariño</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span><span aria-hidden="true">🎯</span> Delegación Efectiva</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span><span aria-hidden="true">🔒</span> Retención Total</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span><span aria-hidden="true">🪂</span> Soltar y Rezar</span>
                </div>
                {/* Líneas de umbral */}
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                {/* Punto de posición */}
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Acompañamiento ${puntuacionAcompanamiento}/25, Autonomía ${puntuacionAutonomia}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            {/* Barras de puntuación */}
            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🤝</span> Acompañamiento</span>
                  <span className={styles.scoreValue}>{puntuacionAcompanamiento}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAcompanamiento}`}
                    style={{ width: `${(puntuacionAcompanamiento / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🚀</span> Autonomía</span>
                  <span className={styles.scoreValue}>{puntuacionAutonomia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAutonomia}`}
                    style={{ width: `${(puntuacionAutonomia / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Perfil */}
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <span className={styles.profileEmoji}>{perfil.emoji}</span>
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

        {/* Contenido educativo */}
        <EducationalSection
          title="El Modelo Situacional: no existe un solo modo de delegar"
          subtitle="Hersey, Blanchard y la madurez del equipo"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es el Liderazgo Situacional?</h2>
            <p>
              Paul Hersey y Ken Blanchard desarrollaron en los años 70 un modelo que rompió con
              la idea de que existe un estilo de liderazgo &quot;mejor&quot;. Su propuesta: el mejor
              estilo depende de la <strong>madurez</strong> de la persona a la que diriges — su
              combinación de competencia (sabe hacerlo) y compromiso (quiere hacerlo).
            </p>
            <p>
              El modelo es influyente pero discutido — su validez empírica se ha cuestionado y existen
              versiones rivales. Útil como vocabulario y mapa heurístico, no como descripción literal
              del liderazgo.
            </p>
            <p>
              El modelo define cuatro estilos, cada uno apropiado para un nivel de madurez diferente:
            </p>
            <p>
              <strong>S1 — Dirigir</strong>: mucha instrucción, poco espacio. Para personas nuevas en
              la tarea que necesitan estructura clara. <em>&quot;Haz esto, así, para entonces.&quot;</em>
            </p>
            <p>
              <strong>S2 — Guiar</strong>: mucha instrucción Y mucho apoyo emocional. Para personas que
              están aprendiendo y pueden frustrarse. <em>&quot;Hazlo así, y estoy aquí si necesitas ayuda.&quot;</em>
            </p>
            <p>
              <strong>S3 — Apoyar</strong>: poco en instrucción, mucho en apoyo. Para personas competentes
              que aún no confían del todo en sí mismas. <em>&quot;Tú sabes cómo, yo estoy por si me necesitas.&quot;</em>
            </p>
            <p>
              <strong>S4 — Delegar</strong>: poca instrucción, poco seguimiento. Para personas
              competentes y comprometidas. <em>&quot;Es tuyo, avísame cuando esté.&quot;</em>
            </p>

            <h2>El error más común: usar siempre el mismo estilo</h2>
            <p>
              La mayoría de managers tiene un estilo &quot;por defecto&quot; que aplica a todos. Algunos
              microges­tionan siempre (S1 permanente). Otros sueltan todo (S4 con todos). Ambos extremos
              son problemáticos cuando no se ajustan a la persona.
            </p>
            <p>
              El error no está en el estilo, sino en su <strong>rigidez</strong>. Un S1 es perfecto para
              un becario en su primera semana. Aplicar S1 a un senior con 10 años de experiencia es
              insultante. Y aplicar S4 a alguien que acaba de cambiar de área es abandono.
            </p>

            <h2>Las dos dimensiones de este test</h2>
            <p>
              Este diagnóstico mide tu patrón habitual a través de dos ejes:
            </p>
            <p>
              El <strong>acompañamiento</strong> mide cuánto contexto, seguimiento y feedback proporcionas.
              Es la &quot;presencia&quot; en la delegación: ¿la persona sabe por qué hace lo que hace?
              ¿recibe información sobre cómo lo está haciendo?
            </p>
            <p>
              La <strong>autonomía</strong> mide cuánto espacio real de decisión concedes. No es solo
              &quot;delegar tareas&quot; — es delegar <em>criterio</em>: la persona puede elegir el cómo,
              cometer errores y aprender de ellos.
            </p>
            <p>
              El ideal no es siempre &quot;alto en todo&quot; — es saber cuándo cada combinación es
              apropiada. Pero tu patrón por defecto te dice hacia dónde tiendes cuando no piensas
              conscientemente en ello.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Hersey, P. y Blanchard, K. (1969). <em>Management of Organizational Behavior</em>. Prentice Hall.</li>
              <li>Blanchard, K. (2007). <em>El líder ejecutivo al minuto</em>. Grijalbo.</li>
              <li>Lencioni, P. (2002). <em>Las cinco disfunciones de un equipo</em>. Empresa Activa.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-delegacion-efectiva')} />
        <ShareCard appName="test-delegacion-efectiva" />
        <Footer appName="test-delegacion-efectiva" />
    </div>
  );
}
