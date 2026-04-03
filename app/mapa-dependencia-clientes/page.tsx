'use client';

import { useState } from 'react';
import styles from './MapaDependenciaClientes.module.css';
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
  dimension: 'concentracion' | 'diversificacion';
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
  { id: 1, texto: 'Un solo cliente representa más del 30% de mis ingresos', dimension: 'concentracion' },
  { id: 6, texto: 'Dedico tiempo regularmente a buscar nuevos clientes o proyectos', dimension: 'diversificacion' },
  { id: 2, texto: 'Si perdiera a mi cliente principal mañana, tendría un problema financiero serio', dimension: 'concentracion' },
  { id: 7, texto: 'Tengo un proceso definido para captar nuevos clientes (networking, contenido, referencias)', dimension: 'diversificacion' },
  { id: 3, texto: 'Mi agenda depende en gran medida de las decisiones de uno o dos clientes', dimension: 'concentracion' },
  { id: 8, texto: 'Mis clientes pertenecen a sectores o industrias diferentes entre sí', dimension: 'diversificacion' },
  { id: 4, texto: 'He ajustado mis tarifas, horarios o forma de trabajar para no perder a un cliente concreto', dimension: 'concentracion' },
  { id: 9, texto: 'En el último año he incorporado al menos un cliente nuevo relevante', dimension: 'diversificacion' },
  { id: 5, texto: 'Me resulta difícil decir "no" a peticiones de mi cliente principal, aunque me perjudiquen', dimension: 'concentracion' },
  { id: 10, texto: 'Si un cliente se va, tengo otros que podrían absorber parte de esa carga de trabajo', dimension: 'diversificacion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(concentracion: number, diversificacion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (concentracion >= umbralAlto && diversificacion >= umbralAlto) {
    return {
      nombre: 'Crecimiento bajo Presión',
      emoji: '🔥',
      descripcion: 'Tienes alta dependencia de pocos clientes, pero al mismo tiempo estás diversificando activamente. Estás en una fase de transición: reconoces el riesgo y estás actuando. El peligro es que la urgencia del cliente principal absorba el tiempo que necesitas para diversificar.',
      fortalezas: [
        'Conciencia clara del riesgo de concentración',
        'Esfuerzo activo de diversificación en marcha',
        'Capacidad de gestionar presión y crecimiento simultáneamente',
      ],
      riesgos: [
        'El cliente principal puede absorber todo tu tiempo si no pones límites',
        'Nuevos clientes pueden recibir un servicio inferior por falta de tiempo',
        'Burnout por intentar mantener todo a la vez',
      ],
      acciones: [
        'Fija un porcentaje máximo de dedicación al cliente principal (ej. 40%) y cúmplelo — el resto es para crecer',
        'Automatiza o delega tareas operativas del cliente grande para liberar horas de captación',
        'Pon una fecha límite: "en 6 meses, ningún cliente será más del 25% de mis ingresos"',
      ],
    };
  }

  if (concentracion >= umbralAlto && diversificacion < umbralBajo) {
    return {
      nombre: 'Dependencia Crítica',
      emoji: '🚨',
      descripcion: 'Tu negocio depende fuertemente de uno o pocos clientes y no estás diversificando activamente. Esta es la posición más vulnerable: si ese cliente se va (o cambia de proveedor, o recorta presupuesto), tu negocio sufre un impacto severo. No es alarmismo — es un riesgo real que debes gestionar.',
      fortalezas: [
        'Probablemente tienes una relación sólida con tu cliente principal',
        'Conoces a fondo las necesidades de ese cliente',
        'Identificar el problema es el primer paso para solucionarlo',
      ],
      riesgos: [
        'Vulnerabilidad extrema ante decisiones que no controlas',
        'Pérdida de poder de negociación (no puedes decir "no")',
        'Riesgo de que te consideren "empleado encubierto" en lugar de proveedor',
      ],
      acciones: [
        'ESTA SEMANA: dedica 2 horas a listar 5 potenciales clientes y contactar al menos a 2',
        'Revisa si tu cliente principal te está tratando como un empleado — si es así, negocia condiciones o busca alternativas',
        'Crea un "fondo de emergencia profesional": ahorra 3 meses de gastos por si pierdes al cliente de golpe',
      ],
    };
  }

  if (concentracion < umbralBajo && diversificacion >= umbralAlto) {
    return {
      nombre: 'Cartera Saludable',
      emoji: '💚',
      descripcion: 'Tu cartera de clientes está bien diversificada y no dependes excesivamente de ninguno. Esta es la posición más resiliente: puedes negociar con libertad, elegir proyectos que te interesan y absorber la pérdida de un cliente sin que tu negocio tiemble.',
      fortalezas: [
        'Resiliencia ante cambios del mercado o pérdida de clientes',
        'Libertad para negociar tarifas y condiciones',
        'Capacidad de elegir con quién trabajas',
      ],
      riesgos: [
        'Dispersión excesiva: demasiados clientes pequeños pueden ser menos rentables',
        'Menor profundidad en cada relación (no llegas a ser "el experto de confianza")',
        'Riesgo de complacencia — mantener la diversificación requiere esfuerzo continuo',
      ],
      acciones: [
        'Revisa la rentabilidad de cada cliente — a veces menos clientes pero mejores es más eficiente',
        'Identifica 2-3 clientes "ideales" y dedica más energía a profundizar esas relaciones',
        'Crea un sistema de referidos: tus clientes actuales son tu mejor canal de captación',
      ],
    };
  }

  if (concentracion < umbralBajo && diversificacion < umbralBajo) {
    return {
      nombre: 'Fase Inicial',
      emoji: '🌱',
      descripcion: 'No tienes una dependencia fuerte de clientes, pero tampoco estás diversificando activamente. Puede que estés empezando, que tengas pocos clientes en general, o que no hayas necesitado captar activamente. El riesgo es que cuando necesites crecer, no tengas un canal de captación establecido.',
      fortalezas: [
        'Sin dependencia que te ate — libertad total de decisión',
        'Momento ideal para diseñar tu estrategia de captación desde cero',
        'Puedes elegir tu nicho y tu tipo de cliente ideal antes de comprometerte',
      ],
      riesgos: [
        'Falta de ingresos estables si no captas clientes pronto',
        'Sin proceso de captación, el crecimiento depende del azar',
        'Riesgo de aceptar el primer cliente que llegue sin valorar si es el adecuado',
      ],
      acciones: [
        'Define tu "cliente ideal": sector, tamaño, tipo de proyecto, presupuesto. Sé específico.',
        'Crea UN canal de captación y trabájalo durante 3 meses antes de juzgar si funciona (LinkedIn, blog, networking, etc.)',
        'Cuando llegue tu primer gran cliente, pon un límite desde el principio: nunca más del 30% de tu tiempo',
      ],
    };
  }

  // Perfiles intermedios
  if (concentracion >= diversificacion) {
    return {
      nombre: 'Tendencia a la Dependencia',
      emoji: '⚠️',
      descripcion: 'Tu cartera muestra más concentración que diversificación. No es una situación crítica todavía, pero la tendencia es preocupante: si no actúas, la dependencia probablemente aumentará con el tiempo porque los clientes grandes tienden a pedir cada vez más.',
      fortalezas: [
        'Relaciones sólidas con clientes existentes',
        'Base de ingresos estable a corto plazo',
        'Todavía tienes margen para diversificar antes de que sea urgente',
      ],
      riesgos: [
        'La concentración tiende a crecer sola si no la gestionas',
        'Cada mes sin diversificar aumenta tu vulnerabilidad',
        'Riesgo de perder poder de negociación progresivamente',
      ],
      acciones: [
        'Bloquea un 20% de tu tiempo semanal para actividades de captación — no es negociable',
        'Calcula qué porcentaje de ingresos representa cada cliente y escríbelo. Ver los números cambia la percepción.',
        'Habla con otros profesionales de tu sector sobre cómo diversifican — las mejores estrategias suelen venir de pares',
      ],
    };
  }

  return {
    nombre: 'Tendencia a la Diversificación',
    emoji: '📈',
    descripcion: 'Tu esfuerzo de diversificación supera ligeramente tu nivel de concentración. Vas en la dirección correcta, pero vigila que la captación de nuevos clientes no te lleve a dispersarte demasiado o a descuidar relaciones existentes valiosas.',
    fortalezas: [
      'Cartera en proceso de crecimiento saludable',
      'Mentalidad proactiva de captación',
      'Buena dirección estratégica',
    ],
    riesgos: [
      'Riesgo de aceptar clientes por cantidad en lugar de calidad',
      'Descuidar a clientes existentes por perseguir nuevos',
      'Dispersión de energía si no priorizas',
    ],
    acciones: [
      'Define criterios claros de "qué clientes acepto y cuáles no" — la diversificación sin filtro es ineficiente',
      'Mide la rentabilidad por hora de cada cliente, no solo los ingresos totales',
      'Dedica tiempo a fidelizar los clientes actuales buenos — retener es más barato que captar',
    ],
  };
}

/* ─── Componente ─── */

export default function MapaDependenciaClientesPage() {
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

  const puntuacionConcentracion = PREGUNTAS
    .filter((p) => p.dimension === 'concentracion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionDiversificacion = PREGUNTAS
    .filter((p) => p.dimension === 'diversificacion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionConcentracion, puntuacionDiversificacion);

  const posX = ((puntuacionConcentracion - 5) / 20) * 100;
  const posY = 100 - ((puntuacionDiversificacion - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>📊 Mapa de Dependencia de Clientes</h1>
          <p className={styles.subtitle}>
            ¿Tu negocio depende demasiado de pocos clientes?
            <br />
            Análisis de concentración de riesgo en tu cartera
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
            En el mundo del freelance y los negocios, hay una regla no escrita: <strong>si un solo cliente
            representa más del 30% de tus ingresos, no eres un proveedor — eres un empleado sin contrato</strong>.
          </p>
          <p>
            La concentración de clientes es uno de los riesgos más comunes y menos visibles para profesionales
            independientes y pequeñas empresas. Este test evalúa dos dimensiones: cuánto dependen tus ingresos
            de pocos clientes, y qué estás haciendo activamente para diversificar.
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en tu cartera de clientes actual
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según tu situación real, no la ideal
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
                <span className={styles.mapLabelTop}>📈 Alta Diversificación</span>
                <span className={styles.mapLabelBottom}>Baja Diversificación</span>
                <span className={styles.mapLabelLeft}>Baja Concentración</span>
                <span className={styles.mapLabelRight}>🚨 Alta Concentración</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>💚 Cartera Saludable</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🔥 Crecimiento bajo Presión</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>🌱 Fase Inicial</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🚨 Dependencia Crítica</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Concentración ${puntuacionConcentracion}/25, Diversificación ${puntuacionDiversificacion}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🚨 Concentración</span>
                  <span className={styles.scoreValue}>{puntuacionConcentracion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barConcentracion}`}
                    style={{ width: `${(puntuacionConcentracion / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>📈 Diversificación</span>
                  <span className={styles.scoreValue}>{puntuacionDiversificacion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barDiversificacion}`}
                    style={{ width: `${(puntuacionDiversificacion / 25) * 100}%` }}
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
          title="📚 La concentración de clientes como riesgo empresarial"
          subtitle="Por qué importa y cómo gestionarlo"
        >
          <section className={styles.guideSection}>
            <h2>La regla del 30%</h2>
            <p>
              En gestión de riesgos empresariales existe un principio ampliamente aceptado: <strong>ningún
              cliente debería representar más del 30% de tus ingresos</strong>. Más allá de ese umbral,
              la relación deja de ser comercial y se convierte en dependencia.
            </p>
            <p>
              El problema no es solo financiero. Cuando dependes de un solo cliente, pierdes capacidad
              de negociación, ajustas tus prioridades a sus necesidades (no a las tuyas), y tu crecimiento
              profesional queda limitado a lo que ese cliente necesita.
            </p>

            <h2>El índice Herfindahl-Hirschman (HHI)</h2>
            <p>
              En economía, la concentración de mercado se mide con el índice HHI: se eleva al cuadrado
              el porcentaje de cada participante y se suman. Un HHI por debajo de 1.500 indica baja
              concentración; por encima de 2.500, alta concentración.
            </p>
            <p>
              Puedes aplicar la misma lógica a tu cartera: si tienes un cliente al 60% y dos al 20%,
              tu HHI es 60² + 20² + 20² = 4.400 — concentración muy alta. Si tuvieras 5 clientes
              al 20% cada uno, sería 5 × 20² = 2.000 — mucho más sano.
            </p>

            <h2>Estrategias de diversificación</h2>
            <p>
              Diversificar no significa simplemente "tener más clientes". Las mejores estrategias incluyen:
            </p>
            <ul>
              <li><strong>Diversificación sectorial</strong>: clientes de industrias diferentes reducen el riesgo de que una crisis sectorial te afecte.</li>
              <li><strong>Diversificación geográfica</strong>: trabajar con clientes de diferentes zonas reduce dependencia local.</li>
              <li><strong>Diversificación de servicios</strong>: ofrecer servicios complementarios a nuevos segmentos.</li>
              <li><strong>Ingresos recurrentes</strong>: contratos de mantenimiento o retainers que dan estabilidad.</li>
            </ul>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Taleb, N.N. (2012). <em>Antifragile: Things That Gain from Disorder</em>. Random House.</li>
              <li>Fried, J. y Hansson, D.H. (2010). <em>Rework</em>. Crown Business.</li>
              <li>Gerber, M. (1995). <em>The E-Myth Revisited</em>. HarperBusiness.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('mapa-dependencia-clientes')} />
        <ShareCard appName="mapa-dependencia-clientes" />
        <Footer appName="mapa-dependencia-clientes" />
      </div>
    </>
  );
}
