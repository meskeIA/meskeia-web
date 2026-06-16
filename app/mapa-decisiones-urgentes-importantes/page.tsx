'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './MapaDecisionesUrgentesImportantes.module.css';
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
  dimension: 'vision' | 'filtro';
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
  // Intercaladas: visión estratégica (A) y filtro de urgencia (B) en patrón ABABABABAB
  { id: 1, texto: 'Dedico tiempo cada semana a tareas importantes que no son urgentes', dimension: 'vision' },
  { id: 2, texto: 'Cuando algo "urgente" aparece, evalúo si realmente lo es antes de reaccionar', dimension: 'filtro' },
  { id: 3, texto: 'Tengo claras mis 3-5 prioridades principales para este trimestre', dimension: 'vision' },
  { id: 4, texto: 'Delego o redirijo tareas urgentes que no requieren mi participación directa', dimension: 'filtro' },
  { id: 5, texto: 'Reservo bloques de tiempo para trabajo estratégico sin interrupciones', dimension: 'vision' },
  { id: 6, texto: 'Distingo claramente entre lo que es urgente para otros y lo que es urgente para mí', dimension: 'filtro' },
  { id: 7, texto: 'Antes de empezar el día, decido qué es lo más importante (no solo lo más urgente)', dimension: 'vision' },
  { id: 8, texto: 'Tengo criterios definidos para decidir qué interrupciones atender y cuáles posponer', dimension: 'filtro' },
  { id: 9, texto: 'Digo "no" a tareas que no están alineadas con mis prioridades, aunque parezcan urgentes', dimension: 'vision' },
  { id: 10, texto: 'Al final del día, siento que he avanzado en lo importante, no solo en lo urgente', dimension: 'filtro' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(vision: number, filtro: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (vision >= umbralAlto && filtro >= umbralAlto) {
    return {
      nombre: 'Estratega con Control',
      emoji: '⚡',
      descripcion: 'Inviertes tiempo en lo que realmente importa y además filtras bien las urgencias. Este es el perfil que Covey describía como "vivir en el Cuadrante 2": construyes futuro sin que las crisis te devoren. Mantenerlo requiere disciplina activa, porque la urgencia siempre presiona.',
      fortalezas: [
        'Claridad de prioridades a corto y largo plazo',
        'Capacidad de filtrar urgencias sin ignorarlas',
        'Equilibrio entre reacción y planificación',
      ],
      riesgos: [
        'Sobrecarga si asumes que puedes con todo (urgente e importante)',
        'Complacencia: dejar de revisar si tus prioridades siguen vigentes',
        'El entorno puede generarte más urgencias al ver que las gestionas bien',
      ],
      acciones: [
        'Revisar trimestralmente si tus prioridades estratégicas siguen alineadas con tus objetivos reales',
        'Proteger activamente tus bloques de tiempo importante — son los primeros que se sacrifican bajo presión',
        'Enseñar a tu equipo o entorno a filtrar urgencias por sí mismos, para no ser el único filtro',
      ],
    };
  }

  if (vision < umbralBajo && filtro >= umbralAlto) {
    return {
      nombre: 'Apagafuegos Eficiente',
      emoji: '🔥',
      descripcion: 'Gestionas bien las urgencias — filtras, delegas, priorizas sobre la marcha — pero inviertes poco en lo que importa a largo plazo. Eres eficaz en el día a día, pero el futuro se construye en el tiempo que nunca encuentras. Eisenhower advertía: "Lo que es importante rara vez es urgente."',
      fortalezas: [
        'Capacidad de reacción rápida y efectiva',
        'Buen criterio para distinguir urgencias reales de falsas',
        'Equipo o entorno que confía en tu capacidad resolutiva',
      ],
      riesgos: [
        'Recompensa inmediata de resolver: el alivio del "lo resuelvo ya" refuerza el hábito reactivo, aunque lo resuelto no fuera lo más importante',
        'Proyectos estratégicos que se posponen indefinidamente',
        'Sensación de estar siempre ocupado pero sin avanzar en lo que importa',
      ],
      acciones: [
        'Bloquear 2 horas a la semana como "tiempo sagrado" para trabajo estratégico — tratarlo como una reunión inamovible',
        'Elegir UN proyecto importante no urgente y ponerle fecha límite artificial para forzar su avance',
        'Cada viernes, preguntarte: "¿Qué hice esta semana que importará dentro de 6 meses?" — si la respuesta es "nada", actuar',
      ],
    };
  }

  if (vision >= umbralAlto && filtro < umbralBajo) {
    return {
      nombre: 'Visionario sin Escudo',
      emoji: '🎯',
      descripcion: 'Tienes claridad sobre lo que importa y dedicas tiempo a ello, pero las urgencias te invaden constantemente. Sabes dónde quieres ir, pero el camino se llena de interrupciones que no consigues filtrar. El resultado: avanzas, pero con mucho más desgaste del necesario.',
      fortalezas: [
        'Claridad de visión y prioridades a largo plazo',
        'Disciplina para invertir en trabajo estratégico',
        'Motivación orientada a resultados importantes',
      ],
      riesgos: [
        'Agotamiento por intentar hacer lo importante mientras todo "arde"',
        'Frustración creciente por interrupciones constantes',
        'Trabajo estratégico de peor calidad por hacerlo en modo multitarea',
      ],
      acciones: [
        'Crear un "protocolo de urgencia": definir por escrito qué constituye una urgencia real y quién puede interrumpirte',
        'Negociar con tu equipo o entorno ventanas de "no disponible" (mínimo 2 horas/día) — y cumplirlas',
        'Para cada urgencia que llega, preguntar: "¿Qué pasa si esto espera 2 horas?" — la mayoría puede esperar',
      ],
    };
  }

  if (vision < umbralBajo && filtro < umbralBajo) {
    return {
      nombre: 'Modo Supervivencia',
      emoji: '🌀',
      descripcion: 'Ni filtras bien las urgencias ni inviertes en lo importante. Vives reaccionando a lo que llega, sin tiempo para pensar en lo que realmente quieres construir. Es un patrón habitual en momentos de alta carga, cambio organizacional o cuando nadie ha definido prioridades claras. No es un fracaso personal — es un problema de sistema.',
      fortalezas: [
        'Margen de mejora enorme: cualquier cambio se notará',
        'Probablemente ya sabes qué sobra (solo necesitas espacio para actuar)',
        'Oportunidad de rediseñar desde cero cómo gestionas tu tiempo',
      ],
      riesgos: [
        'Desgaste físico y mental acumulado',
        'Decisiones importantes que se toman por inercia, no por reflexión',
        'Sensación de estar corriendo sin llegar a ningún sitio',
      ],
      acciones: [
        'Parar 30 minutos esta semana y escribir: "Las 3 cosas más importantes de mi trabajo" — solo 3, no 10',
        'Identificar la urgencia recurrente más frecuente y diseñar un sistema para que no dependa de ti (delegar, automatizar, eliminar)',
        'Mañana, antes de abrir el email, dedicar 15 minutos a la tarea más importante del día — solo 15 minutos, pero antes de todo lo demás',
      ],
    };
  }

  // Perfiles intermedios
  if (filtro >= vision) {
    return {
      nombre: 'Tendencia Reactiva',
      emoji: '🛡️',
      descripcion: 'Gestionas razonablemente las urgencias, pero la visión estratégica queda algo relegada. No estás en modo crisis, pero tampoco inviertes todo lo que deberías en lo que importa a largo plazo. La urgencia domina por defecto cuando no hay un plan activo que la contrarreste.',
      fortalezas: [
        'Capacidad de respuesta ante imprevistos',
        'Cierto criterio para filtrar lo que es realmente urgente',
        'Base operativa suficiente para incorporar más planificación',
      ],
      riesgos: [
        'Lo urgente se come progresivamente al tiempo de lo importante',
        'Planificación que existe pero se incumple sistemáticamente',
        'Falsa sensación de productividad (mucha actividad, poco impacto)',
      ],
      acciones: [
        'Empezar cada semana con 10 minutos de "planificación de impacto": elegir 3 tareas que muevan la aguja a largo plazo',
        'Al final de cada día, registrar cuánto tiempo fue reactivo (urgencias) vs proactivo (planificado) — solo medir, sin juzgar',
        'Proteger una mañana a la semana sin reuniones ni email para trabajo estratégico concentrado',
      ],
    };
  }

  return {
    nombre: 'Tendencia Estratégica',
    emoji: '🧭',
    descripcion: 'Inviertes más en lo importante que en gestionar urgencias, lo cual es positivo pero te deja expuesto a interrupciones. Tienes buena dirección, pero el ruido del día a día puede desviarte más de lo deseable. Necesitas un mejor escudo contra las urgencias ajenas.',
    fortalezas: [
      'Orientación a resultados importantes',
      'Capacidad de pensar a medio y largo plazo',
      'Disciplina para dedicar tiempo a lo que importa',
    ],
    riesgos: [
      'Urgencias que interrumpen y fragmentan el trabajo estratégico',
      'Percepción de "no estar disponible" por parte del equipo',
      'Acumulación de urgencias no atendidas que explotan eventualmente',
    ],
    acciones: [
      'Establecer un "horario de atención a urgencias" — momento del día en que procesas todo lo urgente acumulado (ej. 11:00 y 16:00)',
      'Para cada interrupción, usar la regla de los 2 minutos: si se resuelve en 2 minutos, hazlo ahora; si no, anótalo para el horario de urgencias',
      'Comunicar al equipo cuándo estás disponible y cuándo no — la transparencia reduce las interrupciones mal timed',
    ],
  };
}

/* ─── Componente ─── */

export default function MapaDecisionesUrgentesImportantesPage() {
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
  const puntuacionVision = PREGUNTAS
    .filter((p) => p.dimension === 'vision')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionFiltro = PREGUNTAS
    .filter((p) => p.dimension === 'filtro')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionVision, puntuacionFiltro);

  // Posición en el mapa (0-100%) — X: filtro, Y: visión
  const posX = ((puntuacionFiltro - 5) / 20) * 100;
  const posY = 100 - ((puntuacionVision - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🎯</span> Mapa de Decisiones: Urgente vs Importante</h1>
          <p className={styles.subtitle}>
            ¿Vives apagando fuegos o construyendo futuro?
            <br />
            Basado en la Matriz Eisenhower adaptada
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
            Dwight D. Eisenhower —presidente de EE.UU. y comandante supremo aliado en la Segunda Guerra
            Mundial— dijo: <strong>&quot;Lo que es importante rara vez es urgente, y lo que es urgente
            rara vez es importante.&quot;</strong>
          </p>
          <p>
            La trampa es que lo urgente siempre <em>parece</em> más importante de lo que es, porque
            viene con fecha límite y presión social. Mientras tanto, lo verdaderamente importante
            —planificar, aprender, construir relaciones, pensar a largo plazo— puede esperar.
            Y por eso, casi siempre espera.
            <strong> Este diagnóstico mide las dos dimensiones que determinan cómo gestionas tu tiempo.</strong>
          </p>
          <p>
            Este marco está pensado para personas con cierto grado de control sobre su agenda. Si tu trabajo
            o tu situación vital implica responder constantemente a urgencias impuestas por otros (cuidados,
            atención al cliente, urgencias sanitarias, jerarquías rígidas), el diagnóstico te servirá más como
            mapa de a qué aspirar cuando ganes margen que como autodiagnóstico de productividad personal.
          </p>
        </section>

        {/* Preguntas */}
        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo gestionas tu tiempo en el trabajo (o en tu proyecto)
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
                <span className={styles.mapLabelTop}><span aria-hidden="true">🎯</span> Alta visión estratégica</span>
                <span className={styles.mapLabelBottom}>Baja visión estratégica</span>
                <span className={styles.mapLabelLeft}>Bajo filtro de urgencia</span>
                <span className={styles.mapLabelRight}><span aria-hidden="true">🛡️</span> Alto filtro de urgencia</span>
              </div>
              <div className={styles.map}>
                {/* Cuadrantes */}
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span><span aria-hidden="true">🎯</span> Visionario sin Escudo</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span><span aria-hidden="true">⚡</span> Estratega con Control</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span><span aria-hidden="true">🌀</span> Modo Supervivencia</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span><span aria-hidden="true">🔥</span> Apagafuegos Eficiente</span>
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
                  aria-label={`Tu posición: Visión estratégica ${puntuacionVision}/25, Filtro de urgencia ${puntuacionFiltro}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            {/* Barras de puntuación */}
            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🎯</span> Visión estratégica</span>
                  <span className={styles.scoreValue}>{puntuacionVision}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barVision}`}
                    style={{ width: `${(puntuacionVision / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🛡️</span> Filtro de urgencia</span>
                  <span className={styles.scoreValue}>{puntuacionFiltro}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barFiltro}`}
                    style={{ width: `${(puntuacionFiltro / 25) * 100}%` }}
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
          title="📚 Eisenhower, Covey y la trampa de la urgencia"
          subtitle="Por qué lo urgente siempre gana (y cómo evitarlo)"
        >
          <section className={styles.guideSection}>
            <h2>La Matriz Eisenhower</h2>
            <p>
              Atribuida a Dwight D. Eisenhower y popularizada por Stephen Covey en
              <em> Los 7 hábitos de la gente altamente efectiva</em> (1989), la matriz clasifica
              todas las tareas en cuatro cuadrantes según dos ejes: urgencia e importancia.
            </p>
            <p>
              <strong>Cuadrante 1</strong> (urgente + importante): crisis, fechas límite reales, emergencias.
              Hay que atenderlo, pero el objetivo es minimizar cuánto tiempo vives aquí.
            </p>
            <p>
              <strong>Cuadrante 2</strong> (importante + no urgente): planificación, formación, relaciones,
              prevención. Este es el cuadrante transformador — donde se construye el futuro. Covey
              argumentaba que la calidad de vida profesional se mide por cuánto tiempo pasas aquí.
            </p>
            <p>
              <strong>Cuadrante 3</strong> (urgente + no importante): interrupciones, reuniones innecesarias,
              peticiones ajenas disfrazadas de urgencia. El gran impostor — parece Q1 pero no lo es.
            </p>
            <p>
              <strong>Cuadrante 4</strong> (ni urgente + ni importante): distracciones puras, actividad
              sin propósito. El refugio cuando estamos agotados de los Q1 y Q3.
            </p>

            <h2>La adicción a la urgencia</h2>
            <p>
              Resolver algo urgente produce satisfacción inmediata, mientras que el trabajo estratégico
              tarda en dar frutos visibles. Eso explica que, sin esfuerzo consciente, lo urgente
              acabe ganando casi siempre.
            </p>

            <h2>Las dos dimensiones de este diagnóstico</h2>
            <p>
              Este test no mide directamente en qué cuadrante estás, sino las dos capacidades
              que determinan dónde acabas:
            </p>
            <p>
              La <strong>visión estratégica</strong> mide cuánto inviertes en lo importante aunque
              no sea urgente. Es la capacidad de construir futuro, no solo gestionar presente.
            </p>
            <p>
              El <strong>filtro de urgencia</strong> mide cuánto controlas las urgencias en lugar de
              que ellas te controlen a ti. Es la capacidad de distinguir lo realmente urgente de lo
              que solo lo parece.
            </p>
            <p>
              Puedes tener mucha visión pero poco filtro (sabes lo que importa pero no consigues
              proteger tu tiempo), o mucho filtro pero poca visión (gestionas bien el día a día
              pero sin rumbo). El ideal es desarrollar ambas.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Covey, S.R. (1989). <em>Los 7 hábitos de la gente altamente efectiva</em>. Paidós.</li>
              <li>Newport, C. (2016). <em>Deep Work: Rules for Focused Success in a Distracted World</em>. Grand Central Publishing.</li>
              <li>Levitin, D. (2014). <em>The Organized Mind: Thinking Straight in the Age of Information Overload</em>. Dutton.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('mapa-decisiones-urgentes-importantes')} />
        <ShareCard appName="mapa-decisiones-urgentes-importantes" />
        <Footer appName="mapa-decisiones-urgentes-importantes" />
    </div>
  );
}
