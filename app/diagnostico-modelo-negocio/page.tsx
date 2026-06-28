'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './DiagnosticoModeloNegocio.module.css';
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
  dimension: 'propuesta' | 'sostenibilidad';
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
  { id: 1, texto: 'Puedo explicar en una frase qué problema resuelvo y para quién', dimension: 'propuesta' },
  { id: 6, texto: 'Mis ingresos son predecibles y consistentes de mes a mes', dimension: 'sostenibilidad' },
  { id: 2, texto: 'Mi oferta se diferencia claramente de las alternativas que tiene mi cliente', dimension: 'propuesta' },
  { id: 7, texto: 'Mis costes están controlados y sé exactamente cuánto necesito facturar para ser rentable', dimension: 'sostenibilidad' },
  { id: 3, texto: 'Sé exactamente quién es mi cliente ideal y cómo llegar a él', dimension: 'propuesta' },
  { id: 8, texto: 'Tengo más de una fuente de ingresos o más de un tipo de cliente', dimension: 'sostenibilidad' },
  { id: 4, texto: 'Mis clientes entienden rápidamente el valor de lo que ofrezco sin necesitar mucha explicación', dimension: 'propuesta' },
  { id: 9, texto: 'Si yo no pudiera trabajar durante un mes (enfermedad, viaje), el negocio seguiría generando algo de ingreso', dimension: 'sostenibilidad' },
  { id: 5, texto: 'Si un cliente me compara con la competencia, sé por qué debería elegirme a mí', dimension: 'propuesta' },
  { id: 10, texto: 'He revisado y ajustado mi modelo de ingresos en el último año', dimension: 'sostenibilidad' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(propuesta: number, sostenibilidad: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (propuesta >= umbralAlto && sostenibilidad >= umbralAlto) {
    return {
      nombre: 'Negocio Sólido',
      emoji: '🏛️',
      descripcion: 'Tu propuesta de valor es clara y tu modelo genera ingresos de forma consistente. Es la posición ideal: sabes qué ofreces, a quién, y cómo ganar dinero con ello. El reto es no dormirte — los modelos de negocio que funcionan hoy pueden quedar obsoletos si el mercado cambia.',
      fortalezas: [
        'Propuesta de valor clara y diferenciada',
        'Modelo de ingresos probado y estable',
        'Base sólida para crecer o escalar',
      ],
      riesgos: [
        'Complacencia: "funciona" no significa "funcionará siempre"',
        'Competidores pueden copiar tu propuesta si no evolucionas',
        'Dependencia de un modelo que puede necesitar actualización',
      ],
      acciones: [
        'Revisa tu modelo de negocio cada 6 meses preguntándote: "¿Si empezara hoy desde cero, haría lo mismo?"',
        'Habla con 5 clientes y pregunta: "¿Qué mejorarías?" — las respuestas suelen revelar la próxima evolución',
        'Explora UN canal de ingresos nuevo este trimestre — no para reemplazar lo que funciona, sino para diversificar',
      ],
    };
  }

  if (propuesta >= umbralAlto && sostenibilidad < umbralBajo) {
    return {
      nombre: 'Gran Idea, Modelo Débil',
      emoji: '💡',
      descripcion: 'Tu propuesta es fuerte pero tu modelo de ingresos no la sostiene. Es un patrón frecuente en emprendedores creativos y profesionales con talento: saben lo que ofrecen y el mercado lo valora, pero no han encontrado (o no han trabajado) la forma de monetizarlo de manera consistente.',
      fortalezas: [
        'Propuesta de valor clara — el mercado reconoce lo que haces',
        'Diferenciación establecida',
        'La parte más difícil (tener algo valioso) ya está hecha',
      ],
      riesgos: [
        'Sin sostenibilidad, la mejor propuesta del mundo no dura',
        'Riesgo de burnout por trabajar mucho y facturar poco',
        'La falta de modelo puede obligarte a abandonar algo que funciona',
      ],
      acciones: [
        'Haz la prueba de la servilleta: escribe en una hoja cuánto facturas, cuánto gastas y cuánto necesitas. Si los números no cuadran, el resto no importa.',
        'Busca formas de empaquetar lo que ya haces en ofertas con precio fijo (servicios productizados, packs, suscripciones)',
        'Habla con alguien que tenga un negocio rentable en tu sector — pregunta específicamente cómo estructuran sus ingresos',
      ],
    };
  }

  if (propuesta < umbralBajo && sostenibilidad >= umbralAlto) {
    return {
      nombre: 'Negocio Funcional sin Alma',
      emoji: '⚙️',
      descripcion: 'Tu modelo genera ingresos, pero tu propuesta de valor no está clara o diferenciada. Es un negocio que "funciona" pero podría funcionar mejor: los clientes te eligen por precio, disponibilidad o costumbre, no por lo que te hace único. Eso te hace vulnerable a la competencia.',
      fortalezas: [
        'Modelo de ingresos que funciona — eso es mucho',
        'Base de clientes existente',
        'Oportunidad de mejorar los márgenes con una propuesta más clara',
      ],
      riesgos: [
        'Competencia por precio: si no te diferencias, compites en costes',
        'Clientes poco fieles: si no saben por qué te eligen, pueden irse fácilmente',
        'Techo de crecimiento bajo sin una propuesta clara',
      ],
      acciones: [
        'Pregunta a tus 5 mejores clientes: "¿Por qué trabajas conmigo en lugar de con otro?" — sus respuestas son tu propuesta real',
        'Identifica qué haces diferente (aunque sea sutil) y hazlo explícito en tu comunicación',
        'Elimina servicios genéricos que no te diferencian y enfócate en los que sí — "hacer menos cosas pero mejor" suele aumentar los márgenes',
      ],
    };
  }

  if (propuesta < umbralBajo && sostenibilidad < umbralBajo) {
    return {
      nombre: 'Fase Exploratoria',
      emoji: '🧭',
      descripcion: 'Ni la propuesta ni el modelo están claros. Esto es normal si estás empezando o si estás reinventándote. No es un fracaso — es una fase. Pero conviene salir de ella con intención, no dejando que las cosas pasen. El mayor riesgo en esta fase es la inacción disfrazada de "estoy pensando".',
      fortalezas: [
        'Sin inercia de un modelo que no funciona — libertad total',
        'Oportunidad de diseñar desde cero',
        'El momento ideal para validar antes de construir',
      ],
      riesgos: [
        'Parálisis por exceso de opciones',
        'Gastar tiempo y dinero sin validar si hay mercado',
        'Aislamiento: construir en silencio sin feedback real',
      ],
      acciones: [
        'ESTA SEMANA: habla con 3 personas que podrían ser tu cliente y pregunta: "¿Tienes este problema? ¿Cómo lo resuelves hoy? ¿Pagarías por una solución?"',
        'Define una versión mínima de tu oferta que puedas lanzar en 2 semanas — no tiene que ser perfecta, tiene que existir',
        'Lee "The Mom Test" de Rob Fitzpatrick — te enseña a validar ideas sin que la gente te diga lo que quieres oír',
      ],
    };
  }

  if (propuesta >= sostenibilidad) {
    return {
      nombre: 'Tendencia a la Idea',
      emoji: '💭',
      descripcion: 'Tu propuesta es más fuerte que tu modelo de ingresos. Tienes algo valioso pero aún no lo has convertido en un negocio sostenible. La buena noticia: monetizar algo que la gente ya valora es más fácil que crear valor desde cero.',
      fortalezas: [
        'Propuesta con tracción o diferenciación',
        'Base para construir un modelo rentable',
        'El mercado ya reconoce tu valor',
      ],
      riesgos: [
        'Sin modelo, el valor se regala o se infravalora',
        'Riesgo de quemar recursos antes de encontrar la fórmula',
        'La propuesta puede debilitarse si no se sostiene económicamente',
      ],
      acciones: [
        'Experimenta con 2-3 formas de cobrar por lo que ya haces: ¿pago por proyecto? ¿suscripción? ¿retainer mensual?',
        'Sube precios un 20% al próximo cliente — si no rechaza, estabas cobrando poco',
        'Automatiza o elimina todo lo que no contribuye directamente a la propuesta de valor — cada hora invertida debe tener retorno',
      ],
    };
  }

  return {
    nombre: 'Tendencia al Modelo',
    emoji: '📊',
    descripcion: 'Tu sostenibilidad financiera supera ligeramente a tu claridad de propuesta. Generas ingresos pero sin una narrativa clara de por qué. Funciona, pero es frágil: si alguien ofrece lo mismo más barato o mejor comunicado, tus clientes pueden irse.',
    fortalezas: [
      'Ingresos presentes — la máquina funciona',
      'Experiencia operativa real',
      'Base desde la que definir una propuesta más clara',
    ],
    riesgos: [
      'Competencia por precio si no hay diferenciación',
      'Dificultad para subir precios sin propuesta clara',
      'Crecimiento limitado por falta de narrativa',
    ],
    acciones: [
      'Dedica una mañana a responder: "¿Qué problema específico resuelvo que nadie más resuelve igual?" — la respuesta es tu propuesta',
      'Mira cómo comunica su propuesta tu competidor más exitoso — no para copiarle, sino para entender qué te falta',
      'Haz una "propuesta de ascensor": explica tu negocio en 30 segundos a alguien que no te conoce y observa su reacción',
    ],
  };
}

/* ─── Componente ─── */

export default function DiagnosticoModeloNegocioPage() {
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

  const puntuacionPropuesta = PREGUNTAS
    .filter((p) => p.dimension === 'propuesta')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionSostenibilidad = PREGUNTAS
    .filter((p) => p.dimension === 'sostenibilidad')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionPropuesta, puntuacionSostenibilidad);

  const posX = ((puntuacionPropuesta - 5) / 20) * 100;
  const posY = 100 - ((puntuacionSostenibilidad - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🏛️</span> Diagnóstico de Modelo de Negocio</h1>
          <p className={styles.subtitle}>
            ¿Los pilares de tu negocio están equilibrados?
            <br />
            Basado en el Business Model Canvas simplificado
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
            Alexander Osterwalder creó el <strong>Business Model Canvas</strong> para que cualquier
            emprendedor pudiera visualizar su modelo de negocio en una sola página. De los 9 bloques
            originales, dos son fundamentales: <strong>la propuesta de valor</strong> (qué problema
            resuelves y para quién) y <strong>la sostenibilidad</strong> (cómo generas ingresos de forma consistente).
          </p>
          <p>
            Un negocio que no genera ingresos sostenibles no se sostiene como negocio — aunque pueda seguir teniendo valor como proyecto, vocación o actividad complementaria.
            Un negocio con modelo pero sin propuesta clara es frágil.
            <strong> Necesitas ambos.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>Piensa en tu negocio o proyecto actual</h2>
          <p className={styles.sectionSubtitle}>Valora cada afirmación con honestidad</p>

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

          <div className={styles.progressInfo}>{Object.keys(respuestas).length} de {PREGUNTAS.length} respondidas</div>

          <button type="button" className={styles.btnPrimary} onClick={calcularResultado} disabled={!todasRespondidas} aria-label="Ver mi diagnóstico">
            {todasRespondidas ? 'Ver mi diagnóstico' : `Responde las ${PREGUNTAS.length - Object.keys(respuestas).length} preguntas restantes`}
          </button>
        </section>

        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}><span aria-hidden="true">💰</span> Alta Sostenibilidad</span>
                <span className={styles.mapLabelBottom}>Baja Sostenibilidad</span>
                <span className={styles.mapLabelLeft}>Baja Propuesta</span>
                <span className={styles.mapLabelRight}><span aria-hidden="true">💡</span> Alta Propuesta</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}><span><span aria-hidden="true">⚙️</span> Funcional sin Alma</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}><span><span aria-hidden="true">🏛️</span> Negocio Sólido</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}><span><span aria-hidden="true">🧭</span> Fase Exploratoria</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}><span><span aria-hidden="true">💡</span> Gran Idea, Modelo Débil</span></div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div className={styles.mapDot} style={{ left: `${posX}%`, top: `${posY}%` }} aria-label={`Tu posición: Propuesta ${puntuacionPropuesta}/25, Sostenibilidad ${puntuacionSostenibilidad}/25`}>
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}><span><span aria-hidden="true">💡</span> Propuesta</span><span className={styles.scoreValue}>{puntuacionPropuesta}/25</span></div>
                <div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barPropuesta}`} style={{ width: `${(puntuacionPropuesta / 25) * 100}%` }} /></div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}><span><span aria-hidden="true">💰</span> Sostenibilidad</span><span className={styles.scoreValue}>{puntuacionSostenibilidad}/25</span></div>
                <div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barSostenibilidad}`} style={{ width: `${(puntuacionSostenibilidad / 25) * 100}%` }} /></div>
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileHeader}><span className={styles.profileEmoji}>{perfil.emoji}</span><h3 className={styles.profileName}>{perfil.nombre}</h3></div>
              <p className={styles.profileDescription}>{perfil.descripcion}</p>
              <div className={styles.profileColumns}>
                <div className={styles.profileColumn}><h4 className={styles.columnTitle}><span aria-hidden="true">✅</span> Fortalezas</h4><ul className={styles.profileList}>{perfil.fortalezas.map((f, i) => (<li key={i}>{f}</li>))}</ul></div>
                <div className={styles.profileColumn}><h4 className={styles.columnTitle}><span aria-hidden="true">⚠️</span> Riesgos</h4><ul className={styles.profileList}>{perfil.riesgos.map((r, i) => (<li key={i}>{r}</li>))}</ul></div>
              </div>
              <div className={styles.actionsSection}><h4 className={styles.actionsTitle}><span aria-hidden="true">🎯</span> Acciones sugeridas</h4><ol className={styles.actionsList}>{perfil.acciones.map((a, i) => (<li key={i}>{a}</li>))}</ol></div>
            </div>

            <button type="button" className={styles.btnSecondary} onClick={reiniciar}>Repetir diagnóstico</button>
          </section>
        )}

        <EducationalSection title="El Business Model Canvas simplificado" subtitle="Cómo pensar en tu negocio como un sistema">
          <section className={styles.guideSection}>
            <h2>¿Qué es el Business Model Canvas?</h2>
            <p>Alexander Osterwalder e Yves Pigneur publicaron en 2010 <em>Business Model Generation</em>, donde presentaron una herramienta visual para describir, analizar y diseñar modelos de negocio en un solo lienzo con 9 bloques.</p>
            <p>Los 9 bloques originales son: segmentos de clientes, propuesta de valor, canales, relación con clientes, fuentes de ingresos, recursos clave, actividades clave, alianzas clave y estructura de costes.</p>
            <h2>Los dos pilares fundamentales</h2>
            <p>De los 9 bloques, dos son los más críticos:</p>
            <ul>
              <li><strong>Propuesta de valor</strong>: ¿Qué problema resuelves? ¿Para quién? ¿Por qué tú y no otro?</li>
              <li><strong>Modelo de ingresos</strong>: ¿Cómo generas dinero? ¿Es predecible? ¿Es escalable?</li>
            </ul>
            <p>Sin una propuesta clara, no tienes clientes. Sin un modelo sostenible, no tienes negocio. Todo lo demás (canales, alianzas, recursos) son medios para servir a estos dos pilares.</p>
            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Osterwalder, A. y Pigneur, Y. (2010). <em>Business Model Generation</em>. John Wiley &amp; Sons.</li>
              <li>Osterwalder, A. et al. (2014). <em>Value Proposition Design</em>. John Wiley &amp; Sons.</li>
              <li>Fitzpatrick, R. (2013). <em>The Mom Test</em>. Robfitz Ltd.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('diagnostico-modelo-negocio')} />
        <ShareCard appName="diagnostico-modelo-negocio" />
        <Footer appName="diagnostico-modelo-negocio" />
    </div>
  );
}
