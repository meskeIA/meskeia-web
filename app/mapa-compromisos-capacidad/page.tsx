'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './MapaCompromisosCapacidad.module.css';
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
  dimension: 'carga' | 'capacidad';
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
  { id: 1, texto: 'Tengo más tareas pendientes de las que puedo completar esta semana', dimension: 'carga' },
  { id: 6, texto: 'Cuando rechazo peticiones que no puedo asumir, soy capaz de hacerlo con claridad (aunque sienta algo de incomodidad)', dimension: 'capacidad' },
  { id: 2, texto: 'He aceptado compromisos recientes que en el fondo sé que no debería haber aceptado', dimension: 'carga' },
  { id: 7, texto: 'Tengo claridad sobre cuáles son mis 3 prioridades principales en este momento', dimension: 'capacidad' },
  { id: 3, texto: 'Mi calendario tiene tan poco margen que un imprevisto me genera estrés', dimension: 'carga' },
  { id: 8, texto: 'Cuando acepto algo nuevo, pienso en qué voy a dejar de hacer para que quepa', dimension: 'capacidad' },
  { id: 4, texto: 'Hay personas esperando cosas de mí que no he podido entregar a tiempo', dimension: 'carga' },
  { id: 9, texto: 'Reviso mis compromisos periódicamente y elimino los que ya no tienen sentido', dimension: 'capacidad' },
  { id: 5, texto: 'Siento que si añado una cosa más, todo se va a derrumbar', dimension: 'carga' },
  { id: 10, texto: 'Mis estimaciones de cuánto tardo en hacer algo suelen ser bastante acertadas', dimension: 'capacidad' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(carga: number, capacidad: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (carga >= umbralAlto && capacidad >= umbralAlto) {
    return {
      nombre: 'Alta Carga Gestionada',
      emoji: '🏋️',
      descripcion: 'Tienes muchos compromisos pero también buenas herramientas para gestionarlos. Eres como un malabarista experto: puedes mantener muchas bolas en el aire, pero añadir una más puede hacer que se caigan todas. El riesgo no es tu capacidad de gestión — es que la carga siga subiendo.',
      fortalezas: [
        'Capacidad de operar bajo alta demanda',
        'Buenas habilidades de priorización y gestión',
        'Resiliencia ante la presión',
      ],
      riesgos: [
        'La alta carga sostenida erosiona cualquier sistema de gestión',
        'Riesgo de creer que "como puedo con todo, puedo con más"',
        'Un imprevisto (enfermedad, crisis) puede romper el equilibrio de golpe',
      ],
      acciones: [
        'Antes de aceptar algo nuevo, haz la prueba del "¿qué dejo?": si no puedes nombrar qué dejarás de hacer, no lo aceptes',
        'Crea un "presupuesto de compromisos" semanal con un máximo de horas comprometidas — y respétalo',
        'Programa una revisión quincenal de compromisos: ¿alguno ya no tiene sentido? Elimínalo activamente, no lo dejes morir solo',
      ],
    };
  }

  if (carga >= umbralAlto && capacidad < umbralBajo) {
    return {
      nombre: 'Sobrecarga',
      emoji: '🫠',
      descripcion: 'Tienes más compromisos de los que puedes gestionar. A veces esto viene de aceptar demasiado — pero a menudo la sobrecarga es estructural: cuidado de familia, necesidad económica, jerarquía laboral que no admite negarse. El test no distingue entre estas situaciones, pero las soluciones sí son diferentes según el origen.',
      fortalezas: [
        'Probablemente eres una persona generosa y comprometida',
        'La gente confía en ti (por eso te piden cosas)',
        'Reconocer la sobrecarga es el primer paso para resolverla',
      ],
      riesgos: [
        'Calidad de trabajo deteriorada: hacer muchas cosas mal en lugar de pocas bien',
        'Incumplimiento de plazos que daña tu reputación profesional',
        'Burnout: la sobrecarga sostenida tiene consecuencias físicas y emocionales',
      ],
      acciones: [
        'ESTA SEMANA: lista TODOS tus compromisos actuales. Todos. El acto de verlos en papel suele ser revelador.',
        'Identifica qué compromisos sí puedes cancelar, posponer o renegociar (no todos lo son — el cuidado de familia o las obligaciones económicas suelen ser intocables). De los que sí dependen de ti, elige 1-3 y actúa esta semana.',
        'La próxima vez que te pidan algo, prueba a decir: "Déjame comprobarlo y te contesto mañana" — comprar tiempo reduce las decisiones impulsivas',
      ],
    };
  }

  if (carga < umbralBajo && capacidad >= umbralAlto) {
    return {
      nombre: 'Capacidad Disponible',
      emoji: '💚',
      descripcion: 'Baja carga y buena capacidad de gestión: tienes margen. Esto te pone en una posición envidiable: puedes elegir qué hacer con tu tiempo, asumir proyectos interesantes sin estrés, y decir "sí" a oportunidades desde la fortaleza, no desde la obligación.',
      fortalezas: [
        'Margen para asumir nuevos retos sin estrés',
        'Capacidad de elegir con criterio qué aceptar',
        'Bienestar probablemente alto por ausencia de presión crónica',
      ],
      riesgos: [
        'La capacidad disponible puede atraer demandas de otros ("como tú puedes...")',
        'Riesgo de infrautilizar tu potencial si no buscas retos',
        'Otros pueden percibir tu disponibilidad como falta de demanda',
      ],
      acciones: [
        'Aprovecha el margen para asumir un proyecto que te entusiasme pero que no sea urgente — es el mejor momento para hacer cosas importantes',
        'Cuando te ofrezcan algo, evalúa si lo aceptas porque QUIERES o porque PUEDES — la segunda razón no es suficiente',
        'Protege tu margen: es un activo, no un hueco que llenar. Tener espacio es lo que te permite responder bien cuando llegue algo inesperado',
      ],
    };
  }

  if (carga < umbralBajo && capacidad < umbralBajo) {
    return {
      nombre: 'Baja Activación',
      emoji: '😶',
      descripcion: 'Poca carga y poca capacidad de gestión. Puede indicar un momento de transición (entre proyectos, entre trabajos) o una falta de dirección. No es necesariamente negativo — pero conviene preguntarse si es una pausa elegida o un estancamiento inadvertido.',
      fortalezas: [
        'Sin presión inmediata — espacio para reflexionar',
        'Oportunidad de diseñar tu sistema de gestión desde cero',
        'Momento ideal para definir prioridades antes de comprometerte',
      ],
      riesgos: [
        'La inactividad prolongada puede convertirse en inercia',
        'Sin práctica de gestión, cuando llegue la carga te pillará sin herramientas',
        'Riesgo de aceptar lo primero que llegue sin evaluar si te conviene',
      ],
      acciones: [
        'Define tus 3 prioridades para los próximos 3 meses — antes de comprometerte con nada',
        'Crea un sistema simple de seguimiento de compromisos (puede ser una lista en papel) y empieza a usarlo',
        'Busca UN compromiso alineado con tus prioridades y asúmelo — el movimiento genera claridad',
      ],
    };
  }

  if (carga >= capacidad) {
    return {
      nombre: 'Tendencia a la Sobrecarga',
      emoji: '⚠️',
      descripcion: 'Tu carga supera ligeramente a tu capacidad de gestión. No es crítico, pero es una señal de alerta: si la tendencia continúa, en unas semanas estarás en sobrecarga real. Corregir ahora es mucho más fácil que cuando estés ahogado.',
      fortalezas: [
        'Algo de capacidad de gestión presente',
        'Carga no extrema todavía',
        'Margen para corregir antes de que sea urgente',
      ],
      riesgos: [
        'La carga tiende a crecer si no la gestionas activamente',
        'Cada nuevo "sí" amplía la brecha',
        'Riesgo de normalizar la sobrecarga como "lo normal"',
      ],
      acciones: [
        'Haz una lista de todo lo que has dicho "sí" en las últimas 2 semanas — ¿todo era necesario?',
        'Practica el "no constructivo": en lugar de "no puedo", prueba "podría hacerlo si quitamos X" — da control sin cerrar puertas',
        'Reserva 15 minutos cada viernes para revisar compromisos de la semana siguiente — prevenir es más barato que apagar fuegos',
      ],
    };
  }

  return {
    nombre: 'Tendencia al Equilibrio',
    emoji: '⚖️',
    descripcion: 'Tu capacidad de gestión supera ligeramente a tu carga. Buen equilibrio: tienes herramientas para manejar lo que tienes sin estar al límite. El reto es mantener esta posición cuando la presión aumente.',
    fortalezas: [
      'Buena relación carga/capacidad',
      'Herramientas de gestión funcionales',
      'Margen para absorber picos',
    ],
    riesgos: [
      'Picos de demanda pueden desplazar el equilibrio',
      'La buena gestión puede atraer más demanda ("como tú gestionas bien...")',
      'El equilibrio requiere mantenimiento activo',
    ],
    acciones: [
      'Identifica qué hábitos de gestión te funcionan y conviértelos en rutina — cuando llegue la presión no es momento de improvisar',
      'Cuando sientas que la carga empieza a subir, actúa inmediatamente (no esperes a estar desbordado)',
      'Ayuda a otros a gestionar mejor — enseñar refuerza tus propios hábitos',
    ],
  };
}

/* ─── Componente ─── */

export default function MapaCompromisosCapacidadPage() {
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

  const puntuacionCarga = PREGUNTAS
    .filter((p) => p.dimension === 'carga')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionCapacidad = PREGUNTAS
    .filter((p) => p.dimension === 'capacidad')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionCarga, puntuacionCapacidad);

  const posX = ((puntuacionCarga - 5) / 20) * 100;
  const posY = 100 - ((puntuacionCapacidad - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>📋 Mapa de Compromisos vs Capacidad</h1>
          <p className={styles.subtitle}>
            ¿Has dicho sí a más de lo que puedes hacer bien?
            <br />
            Análisis de carga realista
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
            Existe un sesgo cognitivo llamado <strong>falacia de la planificación</strong>:
            tendemos a subestimar cuánto tiempo y energía nos costará hacer algo, y a sobrestimar
            nuestra capacidad. El resultado: decimos sí a más cosas de las que podemos hacer bien.
          </p>
          <p>
            Este test evalúa dos dimensiones: cuánta carga de compromisos tienes encima, y cuánta
            capacidad real tienes para gestionarla. <strong>El objetivo no es hacer más — es hacer
            lo correcto.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en tu situación actual de compromisos
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación con honestidad, no con optimismo
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
                <span className={styles.mapLabelTop}>💪 Alta Capacidad</span>
                <span className={styles.mapLabelBottom}>Baja Capacidad</span>
                <span className={styles.mapLabelLeft}>Baja Carga</span>
                <span className={styles.mapLabelRight}>🫠 Alta Carga</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>💚 Capacidad Disponible</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🏋️ Alta Carga Gestionada</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>😶 Baja Activación</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🫠 Sobrecarga</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Carga ${puntuacionCarga}/25, Capacidad ${puntuacionCapacidad}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🫠 Carga</span>
                  <span className={styles.scoreValue}>{puntuacionCarga}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barCarga}`}
                    style={{ width: `${(puntuacionCarga / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>💪 Capacidad</span>
                  <span className={styles.scoreValue}>{puntuacionCapacidad}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barCapacidad}`}
                    style={{ width: `${(puntuacionCapacidad / 25) * 100}%` }}
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
          title="📚 El arte de decir no (y de decir sí mejor)"
          subtitle="Por qué tus compromisos definen tu vida"
        >
          <section className={styles.guideSection}>
            <h2>La falacia de la planificación</h2>
            <p>
              Daniel Kahneman y Amos Tversky identificaron en 1979 la <strong>falacia de la
              planificación</strong>: nuestra tendencia sistemática a subestimar el tiempo, los costes
              y los riesgos de nuestros planes, y a sobrestimar sus beneficios. Esto explica por qué
              decimos &quot;sí&quot; con tanta facilidad: en el momento de comprometernos, todo parece posible.
            </p>

            <h2>El coste oculto de cada &quot;sí&quot;</h2>
            <p>
              Cada compromiso tiene un coste que va más allá del tiempo directo:
            </p>
            <ul>
              <li><strong>Coste de preparación</strong>: Pensar en ello, planificarlo, recordarlo.</li>
              <li><strong>Coste de contexto</strong>: Cambiar mentalmente de una cosa a otra.</li>
              <li><strong>Coste de oportunidad</strong>: Lo que no puedes hacer porque estás haciendo esto.</li>
              <li><strong>Coste emocional</strong>: La culpa si no lo cumples o el estrés si lo cumples a medias.</li>
            </ul>

            <h2>Estrategias para gestionar compromisos</h2>
            <p>
              Greg McKeown, en <em>Essentialism</em>, propone un filtro: si algo no es un
              &quot;sí rotundo&quot;, es un &quot;no&quot;. Puede ser útil para quienes tienen
              margen real de decisión sobre sus compromisos (autónomos, perfiles senior, gestión de
              proyectos propios). Para quien tiene obligaciones no negociables, el marco se aplica
              solo a la parte de la agenda donde sí hay elección.
            </p>
            <p>
              Otra estrategia es el <strong>presupuesto de compromisos</strong>: igual que no
              gastas más dinero del que tienes, no deberías comprometer más tiempo del que
              tienes disponible. Asigna un máximo de horas semanales a compromisos y respétalo.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>McKeown, G. (2014). <em>Essentialism: The Disciplined Pursuit of Less</em>. Crown Business.</li>
              <li>Burkeman, O. (2021). <em>Four Thousand Weeks: Time Management for Mortals</em>. Farrar, Straus and Giroux.</li>
              <li>Kahneman, D. (2011). <em>Thinking, Fast and Slow</em>. Farrar, Straus and Giroux.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('mapa-compromisos-capacidad')} />
        <ShareCard appName="mapa-compromisos-capacidad" />
        <Footer appName="mapa-compromisos-capacidad" />
      </div>
    </>
  );
}
