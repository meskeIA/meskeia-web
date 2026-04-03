'use client';

import { useState } from 'react';
import styles from './DiagnosticoEstancamientoProfesional.module.css';
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
  dimension: 'desafio' | 'habilidad';
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
  // Intercaladas: desafío (A) y habilidad (B) en patrón ABABABABAB
  { id: 1, texto: 'Mi trabajo actual me plantea retos que me obligan a crecer', dimension: 'desafio' },
  { id: 6, texto: 'Siento que mis habilidades están bien aprovechadas en lo que hago', dimension: 'habilidad' },
  { id: 2, texto: 'Con frecuencia me enfrento a problemas que no sé resolver de entrada', dimension: 'desafio' },
  { id: 7, texto: 'Domino las herramientas y técnicas necesarias para mi trabajo diario', dimension: 'habilidad' },
  { id: 3, texto: 'Mi puesto me exige aprender cosas nuevas regularmente', dimension: 'desafio' },
  { id: 8, texto: 'Si alguien me pide consejo profesional, me siento seguro dándolo', dimension: 'habilidad' },
  { id: 4, texto: 'Hay aspectos de mi trabajo que me generan cierta incomodidad por su dificultad', dimension: 'desafio' },
  { id: 9, texto: 'Mis compañeros o clientes reconocen mi competencia en lo que hago', dimension: 'habilidad' },
  { id: 5, texto: 'Siento que lo que se espera de mí va más allá de lo que hacía hace un año', dimension: 'desafio' },
  { id: 10, texto: 'Podría explicar con claridad el valor que aporto a mi organización o clientes', dimension: 'habilidad' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(desafio: number, habilidad: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (desafio >= umbralAlto && habilidad >= umbralAlto) {
    return {
      nombre: 'Estado de Flujo',
      emoji: '🌊',
      descripcion: 'Estás en la zona óptima que Csikszentmihalyi describió como "flow": tus desafíos están a la altura de tus habilidades. Sientes que creces, que tu trabajo tiene sentido y que el tiempo pasa rápido cuando estás concentrado. Este es el estado más productivo y satisfactorio, pero también el más difícil de mantener.',
      fortalezas: [
        'Equilibrio entre lo que te exigen y lo que puedes dar',
        'Alta motivación intrínseca y sensación de propósito',
        'Crecimiento profesional constante y visible',
      ],
      riesgos: [
        'Riesgo de burnout si el desafío sigue subiendo sin descanso',
        'Dependencia de este estado para sentirte bien (adicción al reto)',
        'Si el entorno cambia, puedes pasar rápidamente a estrés o aburrimiento',
      ],
      acciones: [
        'Documenta qué condiciones te mantienen en flujo — así podrás recrearlas si cambia tu contexto',
        'Protege activamente tu tiempo de concentración profunda (bloquea agenda, silencia notificaciones)',
        'Revisa cada 3 meses si el equilibrio se mantiene o si estás empezando a inclinarte hacia el estrés',
      ],
    };
  }

  if (desafio >= umbralAlto && habilidad < umbralBajo) {
    return {
      nombre: 'Zona de Ansiedad',
      emoji: '😰',
      descripcion: 'Los desafíos a los que te enfrentas superan significativamente tus habilidades actuales. Csikszentmihalyi identificó esta zona como generadora de ansiedad: sabes que se te exige más de lo que puedes dar, y eso produce estrés, inseguridad y sensación de no estar a la altura.',
      fortalezas: [
        'Estás expuesto a retos que pueden acelerarte profesionalmente si los superas',
        'Tienes claro qué necesitas aprender (la brecha es visible)',
        'La presión puede ser un motor si la gestionas bien',
      ],
      riesgos: [
        'Estrés crónico y deterioro de la confianza profesional',
        'Síndrome del impostor alimentado por la brecha real entre exigencia y capacidad',
        'Riesgo de abandonar o cambiar de trabajo sin haber intentado cerrar la brecha',
      ],
      acciones: [
        'Identifica las 2-3 habilidades concretas que te faltan y busca formación específica (no genérica)',
        'Habla con tu responsable: pide un plan de transición con apoyo, no solo más exigencia',
        'Busca un mentor o referente que haya pasado por una situación similar — la perspectiva reduce la ansiedad',
      ],
    };
  }

  if (desafio < umbralBajo && habilidad >= umbralAlto) {
    return {
      nombre: 'Zona de Confort',
      emoji: '😴',
      descripcion: 'Tus habilidades superan ampliamente los desafíos que enfrentas. Csikszentmihalyi llamó a esto la zona de aburrimiento o confort: dominas lo que haces, pero ya no aprendes. Puede sentirse cómodo a corto plazo, pero erosiona la motivación y el crecimiento a largo plazo.',
      fortalezas: [
        'Dominio sólido de tu área — eres competente y fiable',
        'Baja presión, lo que te da margen para planificar un cambio',
        'Puedes elegir hacia dónde crecer, no lo decides bajo presión',
      ],
      riesgos: [
        'Pérdida progresiva de motivación y sentido del trabajo',
        'Tus habilidades pueden quedar obsoletas si no las actualizas',
        'Riesgo de que otros te perciban como "acomodado" aunque seas competente',
      ],
      acciones: [
        'Busca un proyecto paralelo o un reto voluntario que te saque de la rutina (un 15-20% de tu tiempo)',
        'Pregúntate: "¿Qué haría si supiera que no puedo fallar?" — la respuesta suele ser lo que deberías estar intentando',
        'Plantea a tu responsable asumir una responsabilidad nueva, no más de lo mismo',
      ],
    };
  }

  if (desafio < umbralBajo && habilidad < umbralBajo) {
    return {
      nombre: 'Zona de Apatía',
      emoji: '😶',
      descripcion: 'Ni los desafíos son estimulantes ni sientes que estés aprovechando tus capacidades. Csikszentmihalyi identificó esta como la zona más problemática: la combinación de bajo reto y baja percepción de habilidad genera apatía, desconexión y sensación de estar "perdido" profesionalmente.',
      fortalezas: [
        'Reconocer esta situación es el primer paso — muchos no lo hacen',
        'No hay inercia fuerte que te frene: puedes cambiar de dirección',
        'Es un momento ideal para una reflexión profunda sobre qué quieres realmente',
      ],
      riesgos: [
        'Cronificación: cuanto más tiempo en apatía, más cuesta salir',
        'Impacto en la salud mental: la falta de propósito afecta al bienestar',
        'Riesgo de tomar decisiones impulsivas por querer salir rápido',
      ],
      acciones: [
        'Haz una lista honesta de qué sabías hacer bien hace 2 años y qué has dejado de practicar',
        'Busca ayuda profesional (coach, mentor, terapeuta) — la apatía no se resuelve solo con "esfuerzo"',
        'Elige UNA cosa pequeña que te gustaba hacer profesionalmente y dedícale 1 hora esta semana',
      ],
    };
  }

  // Perfiles intermedios
  if (desafio >= habilidad) {
    return {
      nombre: 'Tendencia al Estrés',
      emoji: '⚡',
      descripcion: 'Tus desafíos están ligeramente por encima de tus habilidades. No es una brecha crítica, pero conviene vigilarla: si los retos siguen subiendo sin que tus competencias crezcan al mismo ritmo, puedes pasar de una tensión productiva a estrés real.',
      fortalezas: [
        'Estás en una zona de crecimiento activo',
        'La tensión moderada puede ser motivadora',
        'Tienes margen para cerrar la brecha antes de que sea problemática',
      ],
      riesgos: [
        'La brecha puede ampliarse si no actúas',
        'Riesgo de normalizar el estrés como "parte del trabajo"',
        'Si llegan más retos, puedes entrar en ansiedad sin darte cuenta',
      ],
      acciones: [
        'Identifica la habilidad concreta que más te falta y dedica 30 minutos diarios a mejorarla',
        'Pide feedback específico: "¿En qué crees que debería mejorar?" — no genérico, sino accionable',
        'Reserva un espacio semanal para revisar si la tensión es productiva o está empezando a ser tóxica',
      ],
    };
  }

  return {
    nombre: 'Tendencia al Confort',
    emoji: '🛋️',
    descripcion: 'Tus habilidades están ligeramente por encima de los desafíos que enfrentas. No es preocupante todavía, pero indica que podrías estar infrautilizando tu potencial. Si no buscas activamente nuevos retos, la comodidad puede convertirse en estancamiento.',
    fortalezas: [
      'Base sólida de competencias',
      'Capacidad de asumir más sin riesgo excesivo',
      'Momento ideal para crecer de forma planificada',
    ],
    riesgos: [
      'El confort se normaliza y se convierte en zona permanente',
      'Tus habilidades se oxidan si no las usas al máximo',
      'Otros que se retan más pueden adelantarte profesionalmente',
    ],
    acciones: [
      'Busca un proyecto que te obligue a usar una habilidad que tienes pero no aplicas en tu día a día',
      'Pregunta a colegas de otros departamentos si necesitan ayuda — exponerte a problemas diferentes es la forma más rápida de crecer',
      'Fija un objetivo profesional a 6 meses que hoy te parezca "un poco ambicioso" — ese es el punto justo',
    ],
  };
}

/* ─── Componente ─── */

export default function DiagnosticoEstancamientoProfesionalPage() {
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
  const puntuacionDesafio = PREGUNTAS
    .filter((p) => p.dimension === 'desafio')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionHabilidad = PREGUNTAS
    .filter((p) => p.dimension === 'habilidad')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionDesafio, puntuacionHabilidad);

  // Posición en el mapa (0-100%)
  const posX = ((puntuacionDesafio - 5) / 20) * 100;
  const posY = 100 - ((puntuacionHabilidad - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🌊 Diagnóstico de Estancamiento Profesional</h1>
          <p className={styles.subtitle}>
            ¿Estás en zona de confort, estrés o flujo?
            <br />
            Basado en el modelo de flujo de Csikszentmihalyi
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>🕐 3 minutos</span>
            <span className={styles.badge}>📊 10 preguntas</span>
            <span className={styles.badge}>🔒 Sin registro</span>
          </div>
        </header>

        <LegalNotice />

        {/* Contexto breve */}
        <section className={styles.contextCard}>
          <p>
            El psicólogo <strong>Mihaly Csikszentmihalyi</strong> descubrió que la satisfacción profesional
            no depende de trabajar menos o ganar más, sino de encontrar el <strong>equilibrio entre
            lo que te desafía y lo que sabes hacer</strong>.
          </p>
          <p>
            Cuando los desafíos están a la altura de tus habilidades, entras en <strong>estado de flujo</strong>:
            máxima concentración, motivación intrínseca y sensación de propósito.
            Cuando no, aparecen el aburrimiento, la ansiedad o la apatía.
          </p>
        </section>

        {/* Preguntas */}
        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en tu situación profesional actual
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según lo que sientes realmente, no lo que debería ser
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

        {/* Resultado */}
        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            {/* Mapa 2D */}
            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}>🎯 Alta Habilidad</span>
                <span className={styles.mapLabelBottom}>Baja Habilidad</span>
                <span className={styles.mapLabelLeft}>Bajo Desafío</span>
                <span className={styles.mapLabelRight}>⚡ Alto Desafío</span>
              </div>
              <div className={styles.map}>
                {/* Cuadrantes */}
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>😴 Zona de Confort</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🌊 Estado de Flujo</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>😶 Zona de Apatía</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>😰 Zona de Ansiedad</span>
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
                  aria-label={`Tu posición: Desafío ${puntuacionDesafio}/25, Habilidad ${puntuacionHabilidad}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            {/* Barras de puntuación */}
            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>⚡ Desafío</span>
                  <span className={styles.scoreValue}>{puntuacionDesafio}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barDesafio}`}
                    style={{ width: `${(puntuacionDesafio / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🎯 Habilidad</span>
                  <span className={styles.scoreValue}>{puntuacionHabilidad}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barHabilidad}`}
                    style={{ width: `${(puntuacionHabilidad / 25) * 100}%` }}
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

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 El modelo de flujo de Csikszentmihalyi"
          subtitle="El marco teórico detrás de este diagnóstico"
        >
          <section className={styles.guideSection}>
            <h2>¿Quién fue Mihaly Csikszentmihalyi?</h2>
            <p>
              Mihaly Csikszentmihalyi (1934-2021) fue un psicólogo húngaro-americano considerado
              el padre de la psicología positiva junto con Martin Seligman. Su trabajo más conocido
              es el concepto de <em>flow</em> (flujo), descrito en su libro <em>&quot;Flow: The Psychology
              of Optimal Experience&quot;</em> (1990).
            </p>
            <p>
              Csikszentmihalyi descubrió que las personas más satisfechas no son las que evitan
              los retos, sino las que encuentran actividades donde sus habilidades coinciden con
              el nivel de desafío. En ese punto, el tiempo parece detenerse, la concentración
              es total y la motivación surge de la propia actividad.
            </p>

            <h2>El modelo desafío-habilidad</h2>
            <p>
              El modelo original de Csikszentmihalyi mapea la experiencia humana en función de
              dos variables: el nivel de desafío percibido y el nivel de habilidad percibida.
              La combinación de ambas produce diferentes estados emocionales:
            </p>
            <ul>
              <li><strong>Alto desafío + Alta habilidad = Flujo</strong>: La zona óptima. Concentración, disfrute, rendimiento máximo.</li>
              <li><strong>Alto desafío + Baja habilidad = Ansiedad</strong>: Sensación de no estar a la altura.</li>
              <li><strong>Bajo desafío + Alta habilidad = Aburrimiento</strong>: Dominas lo que haces pero no creces.</li>
              <li><strong>Bajo desafío + Baja habilidad = Apatía</strong>: Ni te reta ni te satisface.</li>
            </ul>

            <h2>¿Por qué importa en el trabajo?</h2>
            <p>
              La mayoría de las personas pasan entre el 30-50% de sus horas de vigilia trabajando.
              Estar en la zona equivocada del modelo de Csikszentmihalyi durante tanto tiempo
              tiene consecuencias reales: burnout (ansiedad crónica), boreout (aburrimiento crónico),
              o desconexión total (apatía).
            </p>
            <p>
              Lo interesante es que el flujo no requiere cambiar de trabajo necesariamente.
              A menudo basta con <strong>ajustar el nivel de desafío</strong> (buscar proyectos nuevos,
              asumir más responsabilidad) o <strong>desarrollar habilidades</strong> (formación,
              mentoría, práctica deliberada) para moverse hacia la zona óptima.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Csikszentmihalyi, M. (1990). <em>Flow: The Psychology of Optimal Experience</em>. Harper & Row.</li>
              <li>Csikszentmihalyi, M. (2003). <em>Good Business: Leadership, Flow, and the Making of Meaning</em>. Viking.</li>
              <li>Newport, C. (2016). <em>Deep Work: Rules for Focused Success in a Distracted World</em>. Grand Central Publishing.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('diagnostico-estancamiento-profesional')} />
        <ShareCard appName="diagnostico-estancamiento-profesional" />
        <Footer appName="diagnostico-estancamiento-profesional" />
      </div>
    </>
  );
}
