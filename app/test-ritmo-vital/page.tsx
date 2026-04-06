'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TestRitmoVital.module.css';
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
  dimension: 'urgencia' | 'presencia';
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
  { id: 1, texto: 'Siento que siempre estoy corriendo de una cosa a la siguiente', dimension: 'urgencia' },
  { id: 6, texto: 'Soy capaz de sentarme a comer sin mirar el móvil ni pensar en lo siguiente que tengo que hacer', dimension: 'presencia' },
  { id: 2, texto: 'Me resulta difícil estar sin hacer nada durante 10 minutos sin sentir ansiedad', dimension: 'urgencia' },
  { id: 7, texto: 'Dedico tiempo a actividades que no tienen "utilidad" práctica pero me hacen sentir bien', dimension: 'presencia' },
  { id: 3, texto: 'Reviso el correo o las notificaciones fuera de horario laboral con frecuencia', dimension: 'urgencia' },
  { id: 8, texto: 'Tengo momentos en la semana donde no tengo nada planificado y me siento cómodo así', dimension: 'presencia' },
  { id: 4, texto: 'Cuando estoy en una cola o esperando, me impaciento rápidamente', dimension: 'urgencia' },
  { id: 9, texto: 'Puedo mantener una conversación sin mirar el reloj ni pensar en otra cosa', dimension: 'presencia' },
  { id: 5, texto: 'Mi agenda está tan llena que un imprevisto de 30 minutos me descoloca el día', dimension: 'urgencia' },
  { id: 10, texto: 'Al final del día, siento que he vivido el día y no solo que lo he "sobrevivido"', dimension: 'presencia' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(urgencia: number, presencia: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (urgencia >= umbralAlto && presencia >= umbralAlto) {
    return {
      nombre: 'Intensidad Consciente',
      emoji: '⚡',
      descripcion: 'Vives a un ritmo alto pero mantienes la capacidad de estar presente. Es un equilibrio poco común y difícil de sostener: sabes que vas rápido, pero también sabes parar. El riesgo es que confundas esta capacidad con invulnerabilidad — incluso la gente con buena gestión del ritmo necesita descansar.',
      fortalezas: [
        'Productividad alta con consciencia del momento',
        'Capacidad de alternar entre acción y pausa',
        'Resiliencia ante el ritmo intenso',
      ],
      riesgos: [
        'Creer que puedes mantener este ritmo indefinidamente',
        'Los demás pueden normalizar tu velocidad y esperar siempre lo mismo',
        'Erosión silenciosa si no proteges los momentos de pausa',
      ],
      acciones: [
        'Protege activamente tus momentos de presencia — son los que te permiten ir rápido sin romperte',
        'Una vez al mes, pasa un día entero sin agenda ni obligaciones — observa cómo te sientes',
        'Pregunta a las personas cercanas si notan que estás "demasiado acelerado" — a veces ellos lo ven antes que tú',
      ],
    };
  }

  if (urgencia >= umbralAlto && presencia < umbralBajo) {
    return {
      nombre: 'Modo Urgencia Permanente',
      emoji: '🏃',
      descripcion: 'Vives en un estado de urgencia continua sin momentos reales de pausa. Todo parece importante, todo parece urgente, y el freno no funciona. Es el perfil más común en la sociedad actual — y también el que más desgasta. No es cuestión de fuerza de voluntad: tu sistema nervioso está en modo "lucha o huida" crónico.',
      fortalezas: [
        'Capacidad de respuesta rápida ante problemas',
        'Alta productividad aparente a corto plazo',
        'Reconocer este patrón es el primer paso para cambiarlo',
      ],
      riesgos: [
        'Burnout progresivo: el cuerpo y la mente no están diseñados para urgencia constante',
        'Deterioro de relaciones personales por falta de presencia',
        'Paradoja de la productividad: ir más rápido no siempre produce mejores resultados',
      ],
      acciones: [
        'MAÑANA: pon una alarma a las 14:00 y párate 5 minutos. Literalmente. Sin móvil, sin hacer nada. Observa qué sientes.',
        'Desactiva todas las notificaciones no esenciales del móvil esta semana — cada notificación es una micro-urgencia artificial',
        'Lee sobre el concepto "kletskassa" (cajas lentas en supermercados holandeses) — a veces ir más lento es una decisión, no una debilidad',
      ],
    };
  }

  if (urgencia < umbralBajo && presencia >= umbralAlto) {
    return {
      nombre: 'Ritmo Sostenible',
      emoji: '🌿',
      descripcion: 'Has encontrado un ritmo de vida que combina baja urgencia con alta capacidad de estar presente. Este es el perfil más saludable según la investigación sobre bienestar y cronobiología. No significa que seas lento o improductivo — significa que tu velocidad es elegida, no impuesta.',
      fortalezas: [
        'Ritmo de vida sostenible a largo plazo',
        'Capacidad de disfrutar el proceso, no solo el resultado',
        'Relaciones personales probablemente más profundas',
      ],
      riesgos: [
        'En entornos muy competitivos, otros pueden percibir tu ritmo como falta de ambición',
        'Riesgo de evitar desafíos que requieran temporalmente más velocidad',
        'Complacencia si el confort se convierte en zona de no crecimiento',
      ],
      acciones: [
        'Comparte tu forma de gestionar el tiempo con otros — muchos no saben que se puede vivir así',
        'Busca un reto puntual que te saque del ritmo habitual — la presencia se fortalece cuando la pones a prueba',
        'Revisa si tu ritmo incluye suficiente desafío profesional — estar presente no significa conformarse',
      ],
    };
  }

  if (urgencia < umbralBajo && presencia < umbralBajo) {
    return {
      nombre: 'Desconexión',
      emoji: '😶',
      descripcion: 'Ni vives acelerado ni te sientes especialmente presente. Puede indicar cansancio, apatía o un momento vital de transición donde nada te engancha. No es necesariamente malo — a veces el cuerpo y la mente se desconectan como mecanismo de protección — pero requiere atención.',
      fortalezas: [
        'Ausencia de urgencia puede ser una oportunidad para rediseñar tu ritmo',
        'No hay inercia tóxica que romper',
        'Espacio mental disponible si decides llenarlo conscientemente',
      ],
      riesgos: [
        'La desconexión prolongada puede cronificarse',
        'Riesgo de que otros interpreten la falta de energía como desinterés',
        'Posible señal de agotamiento emocional que merece atención profesional',
      ],
      acciones: [
        'Elige UNA actividad que solía hacerte sentir vivo y hazla esta semana — no importa cuán pequeña sea',
        'Si la desconexión lleva más de un mes, habla con alguien de confianza o con un profesional',
        'Empieza un diario mínimo: cada noche escribe UNA cosa del día que hayas sentido (buena o mala). El primer paso es reconectar con lo que sientes.',
      ],
    };
  }

  if (urgencia >= presencia) {
    return {
      nombre: 'Tendencia a la Aceleración',
      emoji: '⏩',
      descripcion: 'Tu nivel de urgencia supera ligeramente a tu capacidad de estar presente. No es una situación extrema, pero indica que estás empezando a perder el equilibrio: el ritmo va ganando terreno a la pausa. Si no lo corriges, la tendencia se amplifica con el tiempo.',
      fortalezas: [
        'Algo de capacidad de presencia todavía intacta',
        'Productividad razonable',
        'Margen para corregir antes de que sea un problema serio',
      ],
      riesgos: [
        'La urgencia tiende a crecer sola — cada día lleno justifica el siguiente',
        'Los momentos de pausa son los primeros que se sacrifican bajo presión',
        'Puedes estar normalizando un ritmo que no es sano',
      ],
      acciones: [
        'Bloquea 3 huecos de 15 minutos esta semana en tu agenda para no hacer nada — y respétalos como si fueran reuniones importantes',
        'Cuando te descubras corriendo, pregúntate: "¿Esto es realmente urgente o solo me lo parece?"',
        'Mide cuántas horas al día estás en "modo reactivo" (respondiendo) vs "modo activo" (decidiendo) — la proporción te sorprenderá',
      ],
    };
  }

  return {
    nombre: 'Tendencia a la Calma',
    emoji: '🍃',
    descripcion: 'Tu capacidad de estar presente supera ligeramente a tu nivel de urgencia. Vas en buena dirección: mantienes un ritmo razonable con algo de presión pero sin que domine tu vida. El reto es sostener este equilibrio cuando lleguen picos de carga.',
    fortalezas: [
      'Buen equilibrio entre acción y pausa',
      'Capacidad de mantener la perspectiva',
      'Ritmo probablemente sostenible',
    ],
    riesgos: [
      'Picos de carga pueden desplazar rápidamente el equilibrio',
      'Riesgo de no ver venir la aceleración hasta que es tarde',
      'Necesidad de mantener activamente el equilibrio',
    ],
    acciones: [
      'Identifica qué hábitos específicos te mantienen en este ritmo y protégelos conscientemente',
      'Cuando llegue un periodo de alta carga, decide de antemano qué NO vas a sacrificar (sueño, ejercicio, comidas tranquilas)',
      'Comparte tu estrategia con otros — a menudo la gente no sabe que existe una alternativa al modo urgencia',
    ],
  };
}

/* ─── Componente ─── */

export default function TestRitmoVitalPage() {
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

  const puntuacionUrgencia = PREGUNTAS
    .filter((p) => p.dimension === 'urgencia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionPresencia = PREGUNTAS
    .filter((p) => p.dimension === 'presencia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionUrgencia, puntuacionPresencia);

  const posX = ((puntuacionUrgencia - 5) / 20) * 100;
  const posY = 100 - ((puntuacionPresencia - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🌿 Test de Ritmo Vital</h1>
          <p className={styles.subtitle}>
            ¿Vives en modo urgencia permanente?
            <br />
            Reflexión sobre tu relación con la velocidad
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
            En los Países Bajos existe un concepto llamado <strong>kletskassa</strong>: cajas de supermercado
            donde la gente va <em>a propósito</em> para ir más lento y charlar con el cajero. En una cultura
            que premia la velocidad, elegir ir despacio es un acto de resistencia.
          </p>
          <p>
            La cronobiología demuestra que nuestro cuerpo tiene ritmos naturales que no coinciden
            con la agenda. <strong>Vivir en urgencia permanente no es productividad — es una forma
            de estrés crónico disfrazado de eficiencia.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en tu ritmo de vida habitual
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según lo que ocurre en una semana normal
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
                <span className={styles.mapLabelTop}>🌿 Alta Presencia</span>
                <span className={styles.mapLabelBottom}>Baja Presencia</span>
                <span className={styles.mapLabelLeft}>Baja Urgencia</span>
                <span className={styles.mapLabelRight}>🏃 Alta Urgencia</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>🌿 Ritmo Sostenible</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>⚡ Intensidad Consciente</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>😶 Desconexión</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🏃 Urgencia Permanente</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Urgencia ${puntuacionUrgencia}/25, Presencia ${puntuacionPresencia}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🏃 Urgencia</span>
                  <span className={styles.scoreValue}>{puntuacionUrgencia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barUrgencia}`}
                    style={{ width: `${(puntuacionUrgencia / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🌿 Presencia</span>
                  <span className={styles.scoreValue}>{puntuacionPresencia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barPresencia}`}
                    style={{ width: `${(puntuacionPresencia / 25) * 100}%` }}
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
          title="📚 Kletskassa y la ciencia de ir despacio"
          subtitle="Por qué la velocidad no siempre es productividad"
        >
          <section className={styles.guideSection}>
            <h2>El concepto kletskassa</h2>
            <p>
              En los Países Bajos, los supermercados Jumbo introdujeron las <em>kletskassa</em>
              (&quot;cajas de charla&quot;): líneas de caja donde no hay prisa y se anima a los clientes
              a conversar con el personal. Surgieron como respuesta a la soledad de personas mayores,
              pero se convirtieron en un símbolo de algo más profundo: <strong>la posibilidad de elegir
              ir despacio en un mundo diseñado para ir rápido</strong>.
            </p>

            <h2>La cronobiología y los ritmos naturales</h2>
            <p>
              La cronobiología estudia los ritmos biológicos del cuerpo humano. El más conocido es
              el ritmo circadiano (24 horas), pero hay otros: el ritmo ultradiano (~90 minutos de
              concentración máxima seguidos de un bajón natural) y ritmos estacionales.
            </p>
            <p>
              La investigación muestra que <strong>forzar un ritmo constante de alta intensidad
              va contra la biología</strong>. El rendimiento óptimo viene de alternar periodos de
              concentración intensa con periodos de recuperación real — no de mantener la aceleración
              todo el día.
            </p>

            <h2>La paradoja de la productividad</h2>
            <p>
              Múltiples estudios (incluyendo investigación de Stanford sobre horas de trabajo)
              demuestran que la productividad <strong>cae en picado después de 50 horas semanales</strong>
              y es prácticamente nula después de 55. Trabajar 70 horas produce casi los mismos
              resultados que trabajar 55, pero con un coste enorme en salud y bienestar.
            </p>
            <p>
              La sensación de urgencia permanente no es un indicador de productividad — es un
              indicador de que tu sistema nervioso está en modo simpático (lucha o huida) más
              tiempo del que debería.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Honoré, C. (2004). <em>In Praise of Slow</em>. Orion Books.</li>
              <li>Walker, M. (2017). <em>Why We Sleep</em>. Scribner.</li>
              <li>Burkeman, O. (2021). <em>Four Thousand Weeks: Time Management for Mortals</em>. Farrar, Straus and Giroux.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-ritmo-vital')} />
        <ShareCard appName="test-ritmo-vital" />
        <Footer appName="test-ritmo-vital" />
      </div>
    </>
  );
}
