'use client';

import { useState } from 'react';
import styles from './AuditoriaHabilidadesMercado.module.css';
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
  dimension: 'relevancia' | 'actualizacion';
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
  { id: 1, texto: 'Las habilidades que uso a diario son las que las empresas de mi sector están buscando', dimension: 'relevancia' },
  { id: 6, texto: 'Dedico tiempo regularmente a aprender habilidades nuevas relacionadas con mi campo', dimension: 'actualizacion' },
  { id: 2, texto: 'Si buscara trabajo mañana, mi perfil encajaría bien con las ofertas actuales', dimension: 'relevancia' },
  { id: 7, texto: 'En el último año he completado al menos un curso, certificación o proyecto de aprendizaje relevante', dimension: 'actualizacion' },
  { id: 3, texto: 'Mis compañeros o clientes me buscan específicamente por una competencia que pocos tienen', dimension: 'relevancia' },
  { id: 8, texto: 'Sigo de cerca las tendencias y cambios en mi industria (blogs, conferencias, newsletters)', dimension: 'actualizacion' },
  { id: 4, texto: 'Lo que sé hacer tiene demanda creciente, no decreciente', dimension: 'relevancia' },
  { id: 9, texto: 'He probado herramientas o metodologías nuevas en los últimos 6 meses', dimension: 'actualizacion' },
  { id: 5, texto: 'Podría explicar en 30 segundos qué me diferencia profesionalmente de otros con mi mismo título', dimension: 'relevancia' },
  { id: 10, texto: 'Tengo un plan (aunque sea informal) de qué quiero aprender en los próximos 12 meses', dimension: 'actualizacion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(relevancia: number, actualizacion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (relevancia >= umbralAlto && actualizacion >= umbralAlto) {
    return {
      nombre: 'Profesional en Forma',
      emoji: '🏆',
      descripcion: 'Tus habilidades son relevantes para el mercado actual Y estás invirtiendo activamente en mantenerlas al día. Esta es la posición ideal: eres competitivo hoy y estás preparándote para serlo mañana. El reto es mantener este ritmo sin caer en el burnout formativo.',
      fortalezas: [
        'Alto valor de mercado actual',
        'Inversión continua en desarrollo profesional',
        'Capacidad de adaptación ante cambios del sector',
      ],
      riesgos: [
        'Fatiga por aprendizaje continuo si no priorizas bien',
        'Riesgo de dispersión: aprender de todo sin profundizar en nada',
        'Complacencia si asumes que "ya estás al día" y dejas de cuestionar',
      ],
      acciones: [
        'Elige UN área de especialización profunda para los próximos 6 meses en lugar de aprender superficialmente de todo',
        'Comparte lo que sabes (blog, mentoría, charlas) — enseñar consolida el conocimiento y aumenta tu visibilidad',
        'Revisa cada trimestre si lo que estás aprendiendo está alineado con hacia dónde va tu sector, no solo con dónde está hoy',
      ],
    };
  }

  if (relevancia >= umbralAlto && actualizacion < umbralBajo) {
    return {
      nombre: 'Viviendo de las Rentas',
      emoji: '⏳',
      descripcion: 'Tus habilidades actuales son relevantes, pero no estás invirtiendo en actualizarte. Esto funciona... hasta que deja de funcionar. En sectores que evolucionan rápido, la ventana puede ser de 2-3 años. En sectores más estables, quizá 5-7. Pero la erosión es inevitable si no actúas.',
      fortalezas: [
        'Competencias con demanda actual — tienes margen',
        'Experiencia acumulada que te da credibilidad',
        'Puedes elegir qué aprender desde una posición de fortaleza, no de urgencia',
      ],
      riesgos: [
        'Obsolescencia progresiva que no se nota hasta que es tarde',
        'Juniors que vienen con habilidades más frescas pueden adelantarte',
        'Pérdida de confianza cuando descubras que algo que sabías ya no se usa',
      ],
      acciones: [
        'Bloquea 2 horas semanales en tu agenda para aprendizaje — trátalo como una reunión con cliente que no puedes cancelar',
        'Pregunta a 3 personas de tu sector que admires: "¿Qué debería estar aprendiendo ahora mismo?"',
        'Mira 5 ofertas de trabajo de tu nivel y lista las habilidades que piden — compáralas con las que tienes',
      ],
    };
  }

  if (relevancia < umbralBajo && actualizacion >= umbralAlto) {
    return {
      nombre: 'En Transición',
      emoji: '🔄',
      descripcion: 'Estás invirtiendo activamente en aprender, pero tus habilidades actuales no están del todo alineadas con lo que el mercado demanda. Esto suele ocurrir cuando cambias de sector, te reciclas profesionalmente o tu industria ha girado y estás adaptándote. Vas en la dirección correcta.',
      fortalezas: [
        'Mentalidad de crecimiento activa — la actitud correcta',
        'Capacidad demostrada de aprender y adaptarte',
        'Estás invirtiendo antes de que sea urgente',
      ],
      riesgos: [
        'Frustración si la brecha tarda en cerrarse',
        'Riesgo de aprender lo que te gusta en lugar de lo que el mercado necesita',
        'Ingresos pueden estancarse hasta que las nuevas habilidades den fruto',
      ],
      acciones: [
        'Identifica las 2-3 habilidades específicas que más distancia tienen entre tu nivel actual y lo que pide el mercado — enfócate ahí',
        'Busca proyectos reales (aunque sean pequeños o pro-bono) donde practicar las nuevas habilidades — el CV con proyectos pesa más que con cursos',
        'Conecta con profesionales que ya están donde tú quieres llegar — pregunta qué fue lo que marcó la diferencia en su transición',
      ],
    };
  }

  if (relevancia < umbralBajo && actualizacion < umbralBajo) {
    return {
      nombre: 'Señal de Alerta',
      emoji: '🔴',
      descripcion: 'Tus habilidades actuales no están bien alineadas con el mercado y tampoco estás actualizándote activamente. No es un juicio — puede ser que estés en un momento vital complicado, que no hayas tenido claridad sobre qué aprender, o que tu sector haya cambiado sin que te dieras cuenta. Pero es una situación que requiere acción.',
      fortalezas: [
        'Reconocer la situación es el primer paso — la mayoría no hace ni este test',
        'Tienes experiencia profesional que no desaparece — se trata de reorientarla',
        'No hay inercia de aprendizaje equivocado: puedes elegir bien desde cero',
      ],
      riesgos: [
        'Cada mes sin actuar amplía la brecha',
        'Riesgo de crisis si cambias o pierdes el trabajo actual',
        'La falta de actualización puede afectar tu autoestima profesional',
      ],
      acciones: [
        'ESTA SEMANA: dedica 1 hora a mirar ofertas de tu sector y apuntar las 5 habilidades que más se repiten',
        'Elige UNA habilidad de esa lista y empieza un recurso gratuito (YouTube, Coursera, documentación oficial) — el primer paso importa más que el plan perfecto',
        'Habla con alguien de confianza de tu sector — a veces la brecha es menor de lo que parece y un par de ajustes cambian todo',
      ],
    };
  }

  if (relevancia >= actualizacion) {
    return {
      nombre: 'Tendencia a la Inercia',
      emoji: '📉',
      descripcion: 'Tus habilidades son razonablemente relevantes, pero tu inversión en actualización no está al mismo nivel. Estás aprovechando lo que ya sabes, pero sin reponer el depósito. A corto plazo funciona; a medio plazo, la relevancia se erosiona si no la alimentas.',
      fortalezas: [
        'Base de competencias con valor de mercado',
        'Experiencia que te permite ser productivo hoy',
        'Margen para empezar a actualizar sin urgencia',
      ],
      riesgos: [
        'La relevancia tiene fecha de caducidad si no la renuevas',
        'Riesgo de desconexión gradual de las tendencias del sector',
        'Puede ser difícil retomar el hábito de aprender si llevas mucho sin hacerlo',
      ],
      acciones: [
        'Empieza pequeño: 30 minutos a la semana de aprendizaje enfocado. Mejor poco y constante que un máster que abandonas al mes 2',
        'Identifica una tendencia de tu sector que no entiendas bien y dedica una semana a investigarla — el primer paso rompe la inercia',
        'Busca un compañero de aprendizaje — alguien con quien compartir lo que lees o aprendes cada semana multiplica la constancia',
      ],
    };
  }

  return {
    nombre: 'Tendencia al Crecimiento',
    emoji: '🌱',
    descripcion: 'Estás invirtiendo más en actualización de lo que refleja tu relevancia actual en el mercado. Esto indica que estás en proceso de crecimiento: las habilidades que estás adquiriendo aún no se han traducido completamente en valor visible, pero vas en buena dirección.',
    fortalezas: [
      'Mentalidad de aprendizaje continuo',
      'Inversión en el futuro profesional',
      'Capacidad de adaptación demostrada',
    ],
    riesgos: [
      'Frustración si los resultados tardan en llegar',
      'Riesgo de dispersión si aprendes sin foco',
      'Posible desconexión entre lo que aprendes y lo que el mercado paga',
    ],
    acciones: [
      'Asegúrate de que lo que estás aprendiendo tiene demanda real — mira ofertas, no solo lo que te gusta',
      'Busca maneras de demostrar las nuevas habilidades (portfolio, proyectos propios, contribuciones open source)',
      'Ponte un objetivo concreto: "en 3 meses quiero poder hacer X" — es más efectivo que "quiero aprender Y"',
    ],
  };
}

/* ─── Componente ─── */

export default function AuditoriaHabilidadesMercadoPage() {
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

  const puntuacionRelevancia = PREGUNTAS
    .filter((p) => p.dimension === 'relevancia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionActualizacion = PREGUNTAS
    .filter((p) => p.dimension === 'actualizacion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionRelevancia, puntuacionActualizacion);

  const posX = ((puntuacionRelevancia - 5) / 20) * 100;
  const posY = 100 - ((puntuacionActualizacion - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🎯 Auditoría de Habilidades vs Mercado</h1>
          <p className={styles.subtitle}>
            ¿Lo que sabes hacer es lo que el mercado necesita?
            <br />
            Gap analysis de tus competencias profesionales
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
            El mercado laboral cambia más rápido de lo que la mayoría de profesionales actualiza
            sus habilidades. Según estudios del World Economic Forum, <strong>el 44% de las habilidades
            de los trabajadores necesitarán actualizarse en los próximos 5 años</strong>.
          </p>
          <p>
            Este test evalúa dos cosas: si lo que sabes hacer hoy tiene demanda real en el mercado,
            y si estás invirtiendo activamente en mantener tus competencias al día.
            <strong> No se trata de aprender por aprender, sino de aprender lo correcto.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en tus habilidades profesionales actuales
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación con honestidad, no con aspiración
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
                <span className={styles.mapLabelTop}>📚 Alta Actualización</span>
                <span className={styles.mapLabelBottom}>Baja Actualización</span>
                <span className={styles.mapLabelLeft}>Baja Relevancia</span>
                <span className={styles.mapLabelRight}>🎯 Alta Relevancia</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>🔄 En Transición</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🏆 Profesional en Forma</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>🔴 Señal de Alerta</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>⏳ Viviendo de las Rentas</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Relevancia ${puntuacionRelevancia}/25, Actualización ${puntuacionActualizacion}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🎯 Relevancia</span>
                  <span className={styles.scoreValue}>{puntuacionRelevancia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barRelevancia}`}
                    style={{ width: `${(puntuacionRelevancia / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>📚 Actualización</span>
                  <span className={styles.scoreValue}>{puntuacionActualizacion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barActualizacion}`}
                    style={{ width: `${(puntuacionActualizacion / 25) * 100}%` }}
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
          title="📚 Gap analysis profesional: cerrar la brecha"
          subtitle="Cómo mantener tus competencias relevantes"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es un gap analysis profesional?</h2>
            <p>
              Un gap analysis (análisis de brecha) profesional compara dos cosas: <strong>las habilidades
              que tienes</strong> y <strong>las habilidades que el mercado necesita</strong>. La diferencia
              entre ambas es tu "brecha" — y cerrarla es una de las inversiones más rentables que puedes
              hacer en tu carrera.
            </p>
            <p>
              El concepto viene del mundo empresarial (análisis de gaps en estrategia corporativa),
              pero aplicado al desarrollo profesional individual es igual de poderoso. La clave es
              ser honesto sobre dónde estás y específico sobre dónde necesitas llegar.
            </p>

            <h2>El modelo 70-20-10</h2>
            <p>
              La investigación sobre aprendizaje profesional (McCall, Lombardo y Eichinger) sugiere
              que el desarrollo de habilidades sigue un patrón:
            </p>
            <ul>
              <li><strong>70% experiencia</strong>: Aprendes haciendo — proyectos reales, retos, errores.</li>
              <li><strong>20% social</strong>: Aprendes de otros — mentores, feedback, observación.</li>
              <li><strong>10% formal</strong>: Aprendes en cursos — formación estructurada, certificaciones.</li>
            </ul>
            <p>
              Esto significa que acumular cursos sin aplicarlos es ineficiente. La forma más rápida
              de cerrar una brecha es <strong>encontrar un proyecto real donde necesites esa habilidad</strong>.
            </p>

            <h2>Habilidades T-shaped</h2>
            <p>
              El concepto de profesional "en forma de T" (<em>T-shaped</em>) sugiere que la
              estrategia óptima es combinar <strong>profundidad en una especialización</strong>
              (la barra vertical de la T) con <strong>amplitud de conocimientos generales</strong>
              (la barra horizontal).
            </p>
            <p>
              Ser "experto en todo" no es viable. Pero ser "experto en algo + capaz de entender
              muchas cosas" te convierte en alguien valioso que puede conectar ideas de diferentes
              campos — exactamente lo que las organizaciones más complejas necesitan.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Newport, C. (2012). <em>So Good They Can&apos;t Ignore You</em>. Grand Central Publishing.</li>
              <li>World Economic Forum (2023). <em>Future of Jobs Report</em>.</li>
              <li>Ericsson, K.A. (2016). <em>Peak: Secrets from the New Science of Expertise</em>. Houghton Mifflin.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('auditoria-habilidades-mercado')} />
        <ShareCard appName="auditoria-habilidades-mercado" />
        <Footer appName="auditoria-habilidades-mercado" />
      </div>
    </>
  );
}
