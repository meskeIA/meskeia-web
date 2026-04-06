'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './AuditoriaReuniones.module.css';
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
  dimension: 'eficiencia' | 'cultura';
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
  // Intercaladas: eficiencia (A) y cultura (B) en patrón ABABABABAB
  { id: 1, texto: 'La mayoría de nuestras reuniones tiene un objetivo claro definido de antemano', dimension: 'eficiencia' },
  { id: 6, texto: 'Se puede declinar una reunión sin que sea mal visto', dimension: 'cultura' },
  { id: 2, texto: 'Salimos de las reuniones con decisiones concretas y próximos pasos asignados', dimension: 'eficiencia' },
  { id: 7, texto: 'Tenemos bloques de tiempo protegidos sin reuniones para trabajo profundo', dimension: 'cultura' },
  { id: 3, texto: 'Las reuniones empiezan y terminan puntualmente', dimension: 'eficiencia' },
  { id: 8, texto: 'Se revisan periódicamente las reuniones recurrentes para eliminar las innecesarias', dimension: 'cultura' },
  { id: 4, texto: 'Solo asisten las personas imprescindibles para el tema tratado', dimension: 'eficiencia' },
  { id: 9, texto: 'La información importante se comparte por escrito, no solo en reuniones', dimension: 'cultura' },
  { id: 5, texto: 'Antes de convocar una reunión, nos preguntamos si podría resolverse por email o chat', dimension: 'eficiencia' },
  { id: 10, texto: 'Los participantes preparan los temas antes de la reunión (no se improvisa)', dimension: 'cultura' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(eficiencia: number, cultura: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (eficiencia >= umbralAlto && cultura >= umbralAlto) {
    return {
      nombre: 'Reuniones Optimizadas',
      emoji: '⚡',
      descripcion: 'Tus reuniones son eficientes y la cultura organizacional las protege de convertirse en una carga. Este es el perfil ideal: reuniones con propósito, bien ejecutadas, y un entorno que respeta el tiempo de todos. Mantener este equilibrio requiere disciplina activa.',
      fortalezas: [
        'Reuniones con objetivos claros y resultados tangibles',
        'Cultura que respeta el tiempo individual y el trabajo profundo',
        'Equilibrio entre comunicación sincrónica y asincrónica',
      ],
      riesgos: [
        'Complacencia: dejar de revisar si las reuniones siguen siendo necesarias',
        'Nuevos miembros del equipo que no conocen las normas no escritas',
        'Presión externa (clientes, dirección) que reintroduzca reuniones innecesarias',
      ],
      acciones: [
        'Hacer una auditoría trimestral de reuniones recurrentes: ¿siguen aportando valor?',
        'Documentar las normas de reunión del equipo y compartirlas con incorporaciones nuevas',
        'Celebrarlo: reconocer al equipo que proteger el tiempo es un logro, no algo que se da por hecho',
      ],
    };
  }

  if (eficiencia >= umbralAlto && cultura < umbralBajo) {
    return {
      nombre: 'Eficientes pero Obligatorias',
      emoji: '⏰',
      descripcion: 'Tus reuniones están bien organizadas — tienen agenda, objetivos y actas — pero la cultura no permite cuestionarlas. Las personas asisten por obligación, no porque puedan elegir. El resultado: reuniones técnicamente correctas pero emocionalmente agotadoras.',
      fortalezas: [
        'Estructura y disciplina en la ejecución de reuniones',
        'Buenos hábitos de preparación y seguimiento',
        'Capacidad de producir resultados medibles en cada reunión',
      ],
      riesgos: [
        'Fatiga de reuniones: la gente cumple pero está agotada',
        'Creatividad reducida: no hay espacio para "no reunirse"',
        'Talentos que se marchan por falta de autonomía sobre su tiempo',
      ],
      acciones: [
        'Implantar una política explícita de "reunión opcional": si tu contribución no es imprescindible, no vengas',
        'Crear bloques de "no-meeting time" en el calendario compartido (mínimo 2 horas seguidas al día)',
        'Preguntar al equipo: "¿Qué reunión eliminarías si pudieras?" — y eliminar al menos una',
      ],
    };
  }

  if (eficiencia < umbralBajo && cultura >= umbralAlto) {
    return {
      nombre: 'Cultura Sana, Ejecución Floja',
      emoji: '🌿',
      descripcion: 'Tu equipo tiene una relación saludable con las reuniones — se pueden declinar, hay tiempo protegido, la información fluye — pero cuando os reunís, la ejecución falla. Reuniones sin objetivo, que se alargan, sin conclusiones claras. La actitud es correcta; la mecánica, no.',
      fortalezas: [
        'Respeto genuino por el tiempo de las personas',
        'Apertura a la comunicación asincrónica',
        'Flexibilidad para adaptar formatos según la necesidad',
      ],
      riesgos: [
        'Reuniones que no producen decisiones (sensación de pérdida de tiempo)',
        'Información importante que se diluye sin estructura',
        'Frustración de los más orientados a resultados',
      ],
      acciones: [
        'Implantar la regla de los 3 elementos: toda reunión necesita objetivo, agenda escrita y responsable de cierre con próximos pasos',
        'Limitar reuniones a 25 o 50 minutos (no 30 o 60) para forzar concreción y dejar margen de transición',
        'Asignar un "guardián del tiempo" rotativo que avise cuando la reunión se desvía del tema',
      ],
    };
  }

  if (eficiencia < umbralBajo && cultura < umbralBajo) {
    return {
      nombre: 'Reunionitis Aguda',
      emoji: '🔴',
      descripcion: 'Tus reuniones no son eficientes y la cultura organizacional no ayuda a mejorarlas. Reuniones sin objetivo, imposibles de declinar, que se multiplican sin control. Es un patrón habitual en muchas organizaciones — no es culpa de nadie, pero requiere una intervención decidida.',
      fortalezas: [
        'Margen de mejora enorme: cualquier cambio se notará',
        'El equipo probablemente ya sabe qué sobra (solo necesita permiso para decirlo)',
        'Oportunidad de liderar un cambio visible y popular',
      ],
      riesgos: [
        'Pérdida masiva de tiempo productivo',
        'Desmotivación del equipo ("otra reunión más...")',
        'Decisiones que se retrasan porque dependen de reuniones que no funcionan',
      ],
      acciones: [
        'Declarar una "semana sin reuniones" como experimento: cancelar todas las recurrentes y ver qué se echa de menos realmente',
        'Para cada reunión que se restaure después del experimento, definir por escrito: propósito, frecuencia, asistentes imprescindibles y criterio de éxito',
        'Nombrar un "abogado del tiempo": alguien con autoridad para cuestionar cualquier reunión nueva o existente',
      ],
    };
  }

  // Perfiles intermedios
  if (eficiencia >= cultura) {
    return {
      nombre: 'Tendencia a la Eficiencia',
      emoji: '📊',
      descripcion: 'Tus reuniones son razonablemente productivas, pero la cultura organizacional no acompaña del todo. Las reuniones funcionan, pero hay poca libertad para cuestionarlas o proponer alternativas. La mecánica está, pero falta el empoderamiento.',
      fortalezas: [
        'Base operativa sólida para las reuniones',
        'Hábitos de estructura y seguimiento',
        'Cierto margen para experimentar con nuevos formatos',
      ],
      riesgos: [
        'Las reuniones se vuelven rutina sin que nadie las cuestione',
        'El "así lo hacemos siempre" se convierte en norma invisible',
        'La eficiencia se mantiene a costa de la autonomía del equipo',
      ],
      acciones: [
        'Abrir un canal donde el equipo pueda proponer eliminar, fusionar o acortar reuniones sin represalias',
        'Probar un "día sin reuniones" a la semana y medir el impacto en productividad y satisfacción',
        'En cada reunión recurrente, preguntar cada mes: "¿Seguimos necesitando esto? ¿Con esta frecuencia? ¿Con estas personas?"',
      ],
    };
  }

  return {
    nombre: 'Tendencia al Bienestar',
    emoji: '🧘',
    descripcion: 'Tu equipo tiene buena actitud hacia el tiempo y las reuniones, pero la ejecución podría mejorar. Hay libertad para declinar y proteger el calendario, pero cuando os reunís, las reuniones no siempre aprovechan bien ese tiempo. La intención es buena; la ejecución necesita estructura.',
    fortalezas: [
      'Cultura de respeto por el tiempo ajeno',
      'Apertura a formatos alternativos de comunicación',
      'Equipo que valora la autonomía',
    ],
    riesgos: [
      'Reuniones que se alargan por falta de estructura',
      'Información que se pierde por no documentar decisiones',
      'Percepción externa de desorganización',
    ],
    acciones: [
      'Introducir plantillas de agenda para las reuniones más frecuentes (stand-up, retrospectiva, 1-on-1)',
      'Establecer la regla de "no reunión sin acta": al terminar, 2 minutos para escribir decisiones y próximos pasos',
      'Medir el ratio reuniones/resultados: de las últimas 10 reuniones, ¿cuántas produjeron una decisión o acción concreta?',
    ],
  };
}

/* ─── Componente ─── */

export default function AuditoriaReunionesPage() {
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
  const puntuacionEficiencia = PREGUNTAS
    .filter((p) => p.dimension === 'eficiencia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionCultura = PREGUNTAS
    .filter((p) => p.dimension === 'cultura')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionEficiencia, puntuacionCultura);

  // Posición en el mapa (0-100%)
  const posX = ((puntuacionEficiencia - 5) / 20) * 100;
  const posY = 100 - ((puntuacionCultura - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>📋 Auditoría de Reuniones</h1>
          <p className={styles.subtitle}>
            ¿Cuántas de tus reuniones podrían ser un email?
            <br />
            Analiza la eficiencia y la cultura de reuniones de tu equipo
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
            Según varios estudios, los profesionales pasan entre un <strong>35% y un 50% de su jornada laboral</strong> en
            reuniones. Sin embargo, el <strong>71% de los managers</strong> considera que la mayoría de esas reuniones
            son improductivas o innecesarias.
          </p>
          <p>
            El problema no es solo la eficiencia de cada reunión individual, sino la <strong>cultura
            organizacional</strong> que las rodea: ¿se pueden declinar? ¿hay tiempo protegido para
            trabajar sin interrupciones? ¿se revisan las recurrentes?
            <strong> Las mejores organizaciones cuidan ambas dimensiones.</strong>
          </p>
        </section>

        {/* Preguntas */}
        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en las reuniones de tu equipo o empresa actual
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

        {/* Resultado */}
        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            {/* Mapa 2D */}
            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}>🌱 Cultura sana</span>
                <span className={styles.mapLabelBottom}>Cultura débil</span>
                <span className={styles.mapLabelLeft}>Baja eficiencia</span>
                <span className={styles.mapLabelRight}>⚙️ Alta eficiencia</span>
              </div>
              <div className={styles.map}>
                {/* Cuadrantes */}
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>🌿 Cultura Sana, Ejecución Floja</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>⚡ Reuniones Optimizadas</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>🔴 Reunionitis Aguda</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>⏰ Eficientes pero Obligatorias</span>
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
                  aria-label={`Tu posición: Eficiencia ${puntuacionEficiencia}/25, Cultura ${puntuacionCultura}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            {/* Barras de puntuación */}
            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>⚙️ Eficiencia</span>
                  <span className={styles.scoreValue}>{puntuacionEficiencia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barEficiencia}`}
                    style={{ width: `${(puntuacionEficiencia / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🌱 Cultura</span>
                  <span className={styles.scoreValue}>{puntuacionCultura}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barCultura}`}
                    style={{ width: `${(puntuacionCultura / 25) * 100}%` }}
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
          title="📚 La ciencia detrás de las reuniones ineficientes"
          subtitle="Por qué nos reunimos tanto y cómo cambiarlo"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué proliferan las reuniones?</h2>
            <p>
              Las reuniones cumplen funciones legítimas: alinear equipos, tomar decisiones complejas,
              resolver conflictos. Pero también cumplen funciones ocultas menos productivas: demostrar
              ocupación, evitar responsabilidad individual (&quot;lo decidimos en grupo&quot;), o simplemente
              llenar el calendario porque &quot;así se hacen las cosas aquí&quot;.
            </p>
            <p>
              Steven Rogelberg, autor de <em>The Surprising Science of Meetings</em>, estima que el
              coste de las reuniones improductivas supera los <strong>37.000 millones de dólares anuales</strong> solo
              en Estados Unidos. No es solo tiempo perdido: es energía cognitiva, motivación y
              oportunidades de trabajo profundo que se evaporan.
            </p>

            <h2>Las dos dimensiones: eficiencia y cultura</h2>
            <p>
              Mejorar las reuniones no es solo cuestión de poner agendas y cronómetros. Hay dos
              dimensiones independientes que deben funcionar:
            </p>
            <p>
              La <strong>eficiencia</strong> se refiere a la mecánica: ¿hay objetivo? ¿se cumplen los tiempos?
              ¿salen decisiones? Es lo más visible y lo más fácil de mejorar con herramientas y reglas.
            </p>
            <p>
              La <strong>cultura</strong> es más profunda: ¿se puede decir &quot;no&quot; a una reunión? ¿hay espacio
              para trabajar sin interrupciones? ¿se cuestiona lo establecido? Cambiar la cultura es
              más lento, pero más transformador.
            </p>

            <h2>El concepto de &quot;reunionitis&quot;</h2>
            <p>
              Acuñado de forma coloquial, la reunionitis describe una patología organizacional real:
              la tendencia a resolver todo con reuniones, independientemente de si son el formato
              adecuado. Sus síntomas incluyen: calendarios bloqueados al 80%, reuniones que generan
              nuevas reuniones, y la sensación colectiva de que &quot;no tengo tiempo para trabajar&quot;.
            </p>
            <p>
              El antídoto no es eliminar todas las reuniones — algunas son insustituibles — sino
              crear el hábito de preguntarse antes de cada convocatoria: <strong>&quot;¿Es una reunión
              la mejor forma de conseguir esto?&quot;</strong>
            </p>

            <h2>Aplicación práctica</h2>
            <p>
              Este diagnóstico te ayuda a identificar si el problema está en la mecánica
              (cómo se ejecutan tus reuniones), en la cultura (cómo se perciben y gestionan),
              o en ambas. Cada perfil tiene acciones diferentes porque los remedios para cada
              dimensión son distintos.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Rogelberg, S.G. (2019). <em>The Surprising Science of Meetings</em>. Oxford University Press.</li>
              <li>Perlow, L., Hadley, C. y Eun, E. (2017). <em>Stop the Meeting Madness</em>. Harvard Business Review.</li>
              <li>Newport, C. (2016). <em>Deep Work: Rules for Focused Success in a Distracted World</em>. Grand Central Publishing.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('auditoria-reuniones')} />
        <ShareCard appName="auditoria-reuniones" />
        <Footer appName="auditoria-reuniones" />
      </div>
    </>
  );
}
