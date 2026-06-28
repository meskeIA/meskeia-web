'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './AuditoriaEnergiaSemanal.module.css';
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
  dimension: 'desgaste' | 'recarga';
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
  { id: 1, texto: 'Hay actividades en mi semana que me agotan de forma desproporcionada al valor que aportan', dimension: 'desgaste' },
  { id: 6, texto: 'Tengo actividades semanales que me recargan energía de forma fiable (ejercicio, hobby, naturaleza)', dimension: 'recarga' },
  { id: 2, texto: 'Al final de la jornada laboral, me siento vaciado la mayoría de los días', dimension: 'desgaste' },
  { id: 7, texto: 'Duermo lo suficiente y me levanto con energía la mayoría de los días', dimension: 'recarga' },
  { id: 3, texto: 'Dedico tiempo significativo a tareas que podría delegar, automatizar o eliminar', dimension: 'desgaste' },
  { id: 8, texto: 'Mantengo relaciones personales que me aportan energía, no que me la quitan', dimension: 'recarga' },
  { id: 4, texto: 'Hay personas o situaciones recurrentes que me drenan sin que yo pueda evitarlo', dimension: 'desgaste' },
  { id: 9, texto: 'Tengo momentos de desconexión real en mi semana (sin pantallas, sin obligaciones)', dimension: 'recarga' },
  { id: 5, texto: 'Paso horas en reuniones, emails o tareas administrativas que no contribuyen a mis objetivos principales', dimension: 'desgaste' },
  { id: 10, texto: 'Cuando llega el fin de semana, tengo energía para hacer cosas que disfruto (no solo recuperarme)', dimension: 'recarga' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(desgaste: number, recarga: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (desgaste >= umbralAlto && recarga >= umbralAlto) {
    return {
      nombre: 'Alta Intensidad Compensada',
      emoji: '🔥',
      descripcion: 'Tu semana tiene un alto nivel de desgaste, pero también inviertes mucho en recuperarte. Es como un deportista de alto rendimiento: entrenas duro y descansas bien. Funciona... mientras mantengas ambos lados. El riesgo es que un imprevisto rompa el equilibrio y el desgaste se imponga.',
      fortalezas: [
        'Capacidad de operar a alta intensidad',
        'Buenos hábitos de recuperación establecidos',
        'Conciencia de que necesitas recargar',
      ],
      riesgos: [
        'Equilibrio frágil: si falla la recarga, el desgaste se acumula rápido',
        'Posible adicción a la intensidad (necesitar siempre más estímulo)',
        'El cuerpo envejece — lo que funciona hoy puede no funcionar en 5 años',
      ],
      acciones: [
        'Busca reducir el desgaste además de compensarlo — ¿hay fugas de energía que podrías eliminar?',
        'Crea un "plan B de recarga": ¿qué haces si tu rutina habitual se rompe (viaje, enfermedad, cambio)?',
        'Revisa si tu alta intensidad es elegida o es inercia — a veces el ritmo se mantiene por costumbre, no por necesidad',
      ],
    };
  }

  if (desgaste >= umbralAlto && recarga < umbralBajo) {
    return {
      nombre: 'Déficit Energético',
      emoji: '🪫',
      descripcion: 'Gastas mucha energía y recuperas poca. Es el equivalente a un móvil que se usa todo el día sin cargarlo: funciona cada vez peor hasta que se apaga. Este perfil es el camino directo al burnout si no se corrige. No es cuestión de fuerza de voluntad — tu cuerpo tiene límites biológicos.',
      fortalezas: [
        'Probablemente eres una persona comprometida y responsable',
        'Reconocer el déficit es el primer paso para corregirlo',
        'Tienes margen de mejora grande: pequeños cambios pueden tener un impacto enorme',
      ],
      riesgos: [
        'Burnout: agotamiento físico, emocional y mental que puede tardar meses en recuperarse',
        'Deterioro de la salud física (insomnio, dolores, sistema inmune debilitado)',
        'Impacto en relaciones personales por falta de energía emocional',
      ],
      acciones: [
        'ESTA SEMANA: identifica la actividad que más energía te quita y plantéate eliminarla, delegarla o reducirla',
        'Prioriza el sueño por encima de todo — es la recarga más efectiva que existe y la primera que se sacrifica',
        'Introduce UNA actividad de recarga no negociable en tu semana (30 min de lo que sea que te recargue) — trátala como una cita médica',
      ],
    };
  }

  if (desgaste < umbralBajo && recarga >= umbralAlto) {
    return {
      nombre: 'Energía Sostenible',
      emoji: '🔋',
      descripcion: 'Bajo desgaste y alta recarga: tu semana está bien diseñada energéticamente. Tienes tiempo y espacio para las cosas que te importan, y no estás quemando energía en actividades vacías. Este es el perfil más sostenible a largo plazo.',
      fortalezas: [
        'Gestión energética excelente — modelo a seguir',
        'Capacidad de rendir bien a largo plazo sin quemarse',
        'Probablemente mejores relaciones y salud que la media',
      ],
      riesgos: [
        'En entornos de alta demanda, otros pueden percibir tu ritmo como "poco comprometido"',
        'Riesgo de complacencia si no te desafías periódicamente',
        'El equilibrio puede romperse con cambios vitales (hijos, cambio de trabajo, crisis)',
      ],
      acciones: [
        'Documenta qué haces para mantener este equilibrio — si cambia tu contexto, tener un "manual" te ayudará a recuperarlo',
        'Comparte tu enfoque con personas que estén en déficit — a veces un ejemplo vale más que un consejo',
        'Busca un reto profesional que te estire sin romper el equilibrio — la energía sostenible es una base excelente para crecer',
      ],
    };
  }

  if (desgaste < umbralBajo && recarga < umbralBajo) {
    return {
      nombre: 'Modo Bajo Consumo',
      emoji: '😶',
      descripcion: 'Ni te desgastas mucho ni te recargas activamente. Para algunas personas y momentos vitales esto es exactamente lo apropiado: calma, ritmo bajo, sin necesidad de gran intensidad. Para otras puede ser señal de desconexión o de una etapa de transición. La diferencia está en cómo te sientes con ello, no en el patrón en sí.',
      fortalezas: [
        'No estás quemado — no hay déficit urgente',
        'Espacio disponible para diseñar tu semana como quieras',
        'Buen momento para introducir cambios sin presión',
      ],
      riesgos: [
        'Si lo vives como apatía o desconexión, conviene atenderlo',
        'Si no hay actividades que te recarguen y eso te pesa, la motivación tiende a caer',
        'Si te genera malestar prolongado, valora si necesitas un cambio más profundo',
      ],
      acciones: [
        'Pregúntate: ¿estoy en calma o estoy desconectado? — la diferencia importa',
        'Introduce UNA actividad nueva esta semana que te genere algo (curiosidad, movimiento, conexión social)',
        'Si llevas meses en este modo, considera si necesitas un cambio más profundo (trabajo, rutinas, entorno)',
      ],
    };
  }

  if (desgaste >= recarga) {
    return {
      nombre: 'Tendencia al Desgaste',
      emoji: '📉',
      descripcion: 'Tu desgaste supera ligeramente a tu recarga. No es una situación crítica, pero indica que estás consumiendo más energía de la que recuperas. A corto plazo funciona; a medio plazo, la factura llega.',
      fortalezas: [
        'Algo de recarga presente — la base existe',
        'Desgaste no extremo todavía',
        'Margen para corregir sin cambios drásticos',
      ],
      riesgos: [
        'El desgaste acumulativo es silencioso — no se nota hasta que estallas',
        'Cada semana sin corregir amplía el déficit',
        'Normalizar el cansancio como "parte del trabajo"',
      ],
      acciones: [
        'Haz una "auditoría de fugas": lista 3 actividades semanales que te agotan sin aportar valor real',
        'Protege tu hora de despertar y tu hora de acostarte — el sueño es el primer indicador de desequilibrio',
        'Cada domingo, planifica un momento de recarga para la semana que viene — si no lo planificas, no ocurre',
      ],
    };
  }

  return {
    nombre: 'Tendencia a la Recarga',
    emoji: '🌱',
    descripcion: 'Tu recarga supera ligeramente a tu desgaste. Vas en buena dirección: tienes hábitos de recuperación que compensan el esfuerzo. Sigue así, pero vigila que no lleguen picos de carga que desplacen el equilibrio.',
    fortalezas: [
      'Buenos hábitos de recarga en proceso',
      'Desgaste contenido',
      'Tendencia positiva sostenible',
    ],
    riesgos: [
      'Picos de trabajo pueden desplazar la recarga fácilmente',
      'La recarga puede ser pasiva (descanso) sin ser activa (energizante)',
      'Necesidad de mantener conscientemente el equilibrio',
    ],
    acciones: [
      'Identifica qué tipo de recarga te funciona mejor (física, social, creativa, soledad) y asegúrate de incluir la más efectiva',
      'Cuando llegue un periodo de más carga, decide de antemano qué actividad de recarga NO sacrificarás',
      'Identifica qué tipo de descanso te funciona mejor. A veces "no hacer nada" recupera tanto o más que una actividad de recarga estructurada — depende de la persona y del tipo de cansancio.',
    ],
  };
}

/* ─── Componente ─── */

export default function AuditoriaEnergiaSemanalPage() {
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

  const puntuacionDesgaste = PREGUNTAS
    .filter((p) => p.dimension === 'desgaste')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionRecarga = PREGUNTAS
    .filter((p) => p.dimension === 'recarga')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionDesgaste, puntuacionRecarga);

  const posX = ((puntuacionDesgaste - 5) / 20) * 100;
  const posY = 100 - ((puntuacionRecarga - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🔋</span> Auditoría de Energía Semanal</h1>
          <p className={styles.subtitle}>
            ¿Dónde gastas energía sin retorno?
            <br />
            Basado en el modelo de gestión de energía de Loehr y Schwartz
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
            Jim Loehr y Tony Schwartz, en su libro <em>The Power of Full Engagement</em>, propusieron
            un marco distinto al de la gestión del tiempo: <strong>gestionar la energía</strong>. Su idea:
            puedes tener 8 horas libres pero, si tu energía está agotada, esas horas rinden menos.
            Es un enfoque útil para algunas situaciones, no una verdad universal.
          </p>
          <p>
            Este test evalúa las dos caras de la ecuación: cuánto desgaste hay en tu semana
            y cuánta recarga real consigues.
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en una semana típica reciente
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según lo que ocurre habitualmente
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
                    type="button"
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
                <span className={styles.mapLabelTop}><span aria-hidden="true">🔋</span> Alta Recarga</span>
                <span className={styles.mapLabelBottom}>Baja Recarga</span>
                <span className={styles.mapLabelLeft}>Bajo Desgaste</span>
                <span className={styles.mapLabelRight}><span aria-hidden="true">🪫</span> Alto Desgaste</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span><span aria-hidden="true">🔋</span> Energía Sostenible</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span><span aria-hidden="true">🔥</span> Alta Intensidad</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span><span aria-hidden="true">😶</span> Modo Bajo Consumo</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span><span aria-hidden="true">🪫</span> Déficit Energético</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Desgaste ${puntuacionDesgaste}/25, Recarga ${puntuacionRecarga}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🪫</span> Desgaste</span>
                  <span className={styles.scoreValue}>{puntuacionDesgaste}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barDesgaste}`}
                    style={{ width: `${(puntuacionDesgaste / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🔋</span> Recarga</span>
                  <span className={styles.scoreValue}>{puntuacionRecarga}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barRecarga}`}
                    style={{ width: `${(puntuacionRecarga / 25) * 100}%` }}
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
          title="Gestionar energía, no tiempo"
          subtitle="El modelo de Loehr y Schwartz"
        >
          <section className={styles.guideSection}>
            <h2>El error de la gestión del tiempo</h2>
            <p>
              Jim Loehr (psicólogo del rendimiento deportivo) y Tony Schwartz (periodista y consultor)
              publicaron en 2003 <em>The Power of Full Engagement</em>, donde argumentaban que el recurso
              más valioso no es el tiempo sino la <strong>energía</strong>.
            </p>
            <p>
              Su argumento: todos tenemos las mismas 24 horas, pero no todos tenemos la misma energía.
              Una hora con energía alta vale más que tres horas con energía baja. Por tanto, la clave
              no es gestionar horas sino gestionar los niveles de energía a lo largo del día y la semana.
            </p>

            <h2>Las 4 dimensiones de la energía</h2>
            <p>
              Loehr y Schwartz identificaron cuatro tipos de energía que necesitan gestionarse:
            </p>
            <ul>
              <li><strong>Física</strong>: Sueño, alimentación, ejercicio, descanso.</li>
              <li><strong>Emocional</strong>: Relaciones, emociones positivas, control del estrés.</li>
              <li><strong>Mental</strong>: Concentración, creatividad, capacidad de aprendizaje.</li>
              <li><strong>Espiritual</strong>: Propósito, valores, sentido del trabajo.</li>
            </ul>
            <p>
              El desgaste en cualquiera de estas dimensiones afecta a las demás. Y la recarga
              más efectiva es la que atiende la dimensión más debilitada — no siempre la misma.
            </p>

            <h2>El principio de oscilación</h2>
            <p>
              Los deportistas de élite no entrenan todo el día: alternan esfuerzo intenso con
              recuperación total. Loehr y Schwartz llaman a esto <strong>oscilación</strong>:
              la capacidad de moverse entre gasto de energía y recuperación de forma deliberada.
            </p>
            <p>
              Loehr y Schwartz argumentan que una causa frecuente de fatiga moderna es operar siempre
              en intensidad media, sin picos claros ni descansos profundos. No todo el mundo necesita
              esta alternancia — para algunas personas la intensidad estable es preferible. Pero si te
              identificas con el patrón, restaurar la oscilación puede ayudar.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Loehr, J. y Schwartz, T. (2003). <em>The Power of Full Engagement</em>. Free Press.</li>
              <li>Schwartz, T. (2010). <em>The Way We&apos;re Working Isn&apos;t Working</em>. Free Press.</li>
              <li>Nagoski, E. y Nagoski, A. (2019). <em>Burnout: The Secret to Unlocking the Stress Cycle</em>. Ballantine Books.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('auditoria-energia-semanal')} />
        <ShareCard appName="auditoria-energia-semanal" />
        <Footer appName="auditoria-energia-semanal" />
    </div>
  );
}
