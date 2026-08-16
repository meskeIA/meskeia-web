'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaPrimerEmpleo.module.css';
import { MeskeiaLogo, Footer, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import RelatedApps from '@/components/RelatedApps';

// ─── Herramientas del journey ───

const tools = [
  {
    id: 'test-competencias-digitales',
    name: 'Test de Competencias Digitales',
    icon: '📊',
    url: '/test-competencias-digitales/',
    question: '¿Qué competencias digitales tengo y cuáles me faltan?',
    description: 'Autoevalúate con el marco europeo DigComp y descubre qué reforzar y qué destacar.',
    step: 1,
    recomendacion: 'Empieza aquí: sabrás qué poner en el CV y qué mejorar',
  },
  {
    id: 'generador-curriculum',
    name: 'Crear Currículum (CV)',
    icon: '📄',
    url: '/generador-curriculum/',
    question: '¿Cómo preparo mi currículum?',
    description: 'Un CV limpio y ATS-friendly con vista previa en vivo y exportación a PDF.',
    step: 2,
    recomendacion: 'Vuelca aquí tus competencias y tus logros con cifras',
  },
  {
    id: 'preparar-entrevista-competencias',
    name: 'Entrevista por Competencias (STAR)',
    icon: '🌟',
    url: '/preparar-entrevista-competencias/',
    question: '¿Cómo respondo bien en la entrevista?',
    description: 'Prepara tu banco de respuestas con ejemplos reales usando el método STAR.',
    step: 3,
    recomendacion: 'Ten 8-10 historias listas antes de la entrevista',
  },
  {
    id: 'visualizador-sueldo-neto',
    name: 'Tu Sueldo al Desnudo',
    icon: '💶',
    url: '/visualizador-sueldo-neto/',
    question: '¿Cuánto cobraré neto de mi primer sueldo?',
    description: 'De bruto a neto: cotizaciones, IRPF y deducciones explicadas paso a paso.',
    step: 4,
    recomendacion: 'Revísalo antes de aceptar una oferta',
  },
  {
    id: 'visualizador-anatomia-nomina',
    name: 'Anatomía de una Nómina',
    icon: '🧾',
    url: '/visualizador-anatomia-nomina/',
    question: '¿Qué significan los conceptos de mi nómina?',
    description: 'Explora cada concepto de la nómina y entiende qué te descuentan y por qué.',
    step: 5,
    recomendacion: 'Consúltalo con tu primera nómina en la mano',
  },
];

// ─── Pasos del journey ───

const journeySteps = [
  {
    number: 1,
    title: 'Haz balance de lo que sabes hacer',
    description:
      'Antes de escribir nada, ordena tus cartas: estudios, prácticas, proyectos, voluntariado, idiomas y competencias digitales. Aunque sea tu primer empleo, tienes más de lo que crees. Medir tu nivel digital te da argumentos concretos que muchos candidatos no saben expresar.',
    tip: 'Si no sabes cómo describir tu nivel digital, mídelo con el marco DigComp. Pasarás de "manejo bien el ordenador" a "nivel avanzado en creación de contenidos digitales".',
  },
  {
    number: 2,
    title: 'Monta un CV que supere los filtros',
    description:
      'Muchas empresas usan software (ATS) que lee tu CV antes que una persona. Usa una sola columna, encabezados estándar y palabras clave de la oferta. Da protagonismo a formación, proyectos y logros con cifras, aunque sean académicos o de voluntariado.',
    tip: 'Adapta el CV a cada oferta: reordena y reescribe con sus palabras clave. Un CV genérico para 50 ofertas rinde mucho menos que 5 CV a medida.',
  },
  {
    number: 3,
    title: 'Prepara tus respuestas de entrevista con ejemplos',
    description:
      'En la entrevista por competencias no basta con decir que trabajas bien en equipo: te piden un ejemplo real. El método STAR (Situación, Tarea, Acción, Resultado) te ayuda a contarlos de forma ordenada y creíble. Con 8-10 historias variadas cubres casi cualquier pregunta.',
    tip: 'Ensaya en voz alta y cronométrate: cada respuesta debería durar entre minuto y medio y dos minutos. Interioriza la estructura, no la memorices palabra por palabra.',
  },
  {
    number: 4,
    title: 'Entiende tu primer sueldo antes de firmar',
    description:
      'Una oferta de "24.000 € brutos" no es lo que ingresas. Aprende cómo se transforma el bruto en neto (cotizaciones, IRPF) y qué significa cada línea de la nómina. Saberlo te evita sorpresas y te da criterio para negociar o comparar ofertas.',
    tip: 'Pregunta siempre por el salario en bruto anual y el número de pagas. Con eso puedes estimar tu neto mensual y comparar ofertas de forma justa.',
  },
  {
    number: 5,
    title: 'Envía candidaturas y haz seguimiento',
    description:
      'Buscar empleo es un trabajo en sí mismo. Organiza tus candidaturas, personaliza cada una, y haz seguimiento con constancia. El rechazo es parte del proceso: cada entrevista, aunque no salga, es práctica para la siguiente.',
    tip: 'Lleva una lista de dónde te has postulado, la fecha y el estado. Te evita duplicar candidaturas y te ayuda a saber cuándo hacer seguimiento.',
  },
];

// ─── FAQs ───

const faqData = [
  {
    question: '¿Puedo conseguir empleo sin experiencia laboral?',
    answer:
      'Sí, y es lo normal en un primer empleo. Lo que se valora es tu potencial y tu forma de comportarte, no solo la antigüedad. Da protagonismo a tu formación, proyectos de estudios, prácticas, voluntariado y competencias. Un logro académico o de voluntariado bien contado (con qué hiciste y qué conseguiste) pesa más que una lista de tareas.',
  },
  {
    question: '¿Necesito una carta de presentación?',
    answer:
      'Depende. Su relevancia ha bajado mucho y muchas ofertas ni la piden, sobre todo en tecnología. Pero sigue teniendo sentido en el sector público, el ámbito académico, empresas tradicionales y en candidaturas espontáneas (cuando escribes sin que haya una oferta). Si la piden, hazla breve y personalizada: por qué ese puesto, por qué esa empresa y qué aportas tú. No repitas el CV.',
  },
  {
    question: '¿Qué competencias valoran más las empresas en un primer empleo?',
    answer:
      'Junto a las técnicas del puesto, se valoran mucho las transversales: comunicación, trabajo en equipo, capacidad de aprender, adaptación y actitud. Las competencias digitales (ofimática, gestión de información, seguridad) son casi un requisito básico hoy. Poder demostrar cualquiera de ellas con un ejemplo concreto marca la diferencia.',
  },
  {
    question: '¿Cuánto se tarda en encontrar el primer empleo?',
    answer:
      'Varía mucho según el sector, la zona y el momento, así que desconfía de las cifras redondas. Lo que sí puedes controlar es el proceso: cuantas más candidaturas bien preparadas envíes y más entrevistas practiques, antes llegará. Trátalo como un maratón, no como un esprint, y cuida tu ánimo por el camino.',
  },
  {
    question: '¿Empiezo por prácticas, contrato o beca?',
    answer:
      'Todas son puertas de entrada válidas. Las prácticas y becas te dan experiencia y contactos cuando aún no tienes recorrido; un contrato te da estabilidad. Al principio, prioriza aprender y construir experiencia demostrable sobre el nombre del tipo de vínculo. Lo importante es que sumes algo que contar en la siguiente candidatura.',
  },
  {
    question: '¿Cómo destaco entre muchos candidatos?',
    answer:
      'Personalizando. Un CV y una entrevista adaptados a la oferta concreta, con ejemplos reales y logros medibles, destacan sobre los genéricos. Demostrar que entiendes el puesto y la empresa, y que has hecho los deberes, transmite interés real. La preparación es tu ventaja: casi nadie llega tan preparado como quien ha ensayado sus respuestas.',
  },
];

// ─── Caso de estudio ───

const caseStudy = {
  title: 'Carlos acaba de terminar y busca su primer empleo',
  situation:
    'Graduado en Marketing, 23 años, sin experiencia laboral más allá de un voluntariado y un trabajo de fin de grado. Ha terminado los exámenes y no sabe por dónde empezar a buscar trabajo.',
  steps: [
    { tool: 'Test de Competencias Digitales', result: 'Descubre que su nivel en analítica y creación de contenidos es "Avanzado". Ahora tiene argumentos concretos que antes no sabía nombrar.' },
    { tool: 'Crear Currículum', result: 'Monta un CV ATS-friendly poniendo arriba su formación y su TFG (calificado con 9,2), y traduce el voluntariado en logros: "coordiné a 8 voluntarios".' },
    { tool: 'Entrevista por Competencias', result: 'Prepara 8 historias STAR a partir de sus proyectos de estudios y el voluntariado. Ensaya en voz alta hasta que suenan naturales.' },
    { tool: 'Tu Sueldo al Desnudo', result: 'Le ofrecen 20.000 € brutos en 14 pagas. Calcula su neto mensual real y acepta sabiendo exactamente qué ingresará.' },
  ],
  conclusion:
    'En unas semanas pasa de "no sé por dónde empezar" a tener un CV sólido, respuestas preparadas y criterio para valorar la oferta. La preparación le da seguridad justo cuando más la necesita.',
};

// ─── Componente ───

export default function GuiaPrimerEmpleoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🎓</span>
        <h1 className={styles.title}>Del Estudio al Primer Empleo</h1>
        <p className={styles.subtitle}>
          Terminaste los exámenes y ahora toca lo siguiente: encontrar trabajo. ¿Por dónde empiezo?
          Este es el mapa paso a paso, con herramientas gratuitas.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{tools.length}</span>
            <span className={styles.heroStatLabel}>Herramientas</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{journeySteps.length}</span>
            <span className={styles.heroStatLabel}>Pasos clave</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>Gratis</span>
            <span className={styles.heroStatLabel}>Sin registro</span>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Aviso */}
      <div className={styles.avisoBox} role="note">
        <span aria-hidden="true">💡</span>
        <div>
          <strong>Esta guía es para ti si:</strong> acabas de terminar de estudiar (o estás a punto)
          y afrontas la búsqueda de tu primer empleo. No es una bolsa de trabajo — es el camino más
          claro para llegar preparado a las candidaturas y a las entrevistas.
        </div>
      </div>

      {/* Journey Steps */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">🗺️</span>
          El camino paso a paso
        </h2>
        <div className={styles.journeyGrid}>
          {journeySteps.map((step) => (
            <div key={step.number} className={styles.journeyCard}>
              <div className={styles.journeyNumber}>{step.number}</div>
              <h3 className={styles.journeyTitle}>{step.title}</h3>
              <p className={styles.journeyDescription}>{step.description}</p>
              <div className={styles.journeyTip}>
                <span className={styles.tipIcon} aria-hidden="true">💡</span>
                <span>{step.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">🔧</span>
          Las herramientas del journey
        </h2>
        <p className={styles.toolsIntro}>
          Cada herramienta responde a una pregunta concreta del proceso. Úsalas en orden o salta
          directamente a la que necesites.
        </p>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.url} className={styles.toolCard}>
              <div className={styles.toolHeader}>
                <span className={styles.toolStep}>{tool.step}</span>
                <span className={styles.toolIcon} aria-hidden="true">{tool.icon}</span>
              </div>
              <h3 className={styles.toolQuestion}>{tool.question}</h3>
              <p className={styles.toolName}>{tool.name}</p>
              <p className={styles.toolDescription}>{tool.description}</p>
              <div className={styles.toolRecomendacion}>
                <span aria-hidden="true">→</span> {tool.recomendacion}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* La carta de presentación (sección integrada, no app) */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">✉️</span>
          ¿Necesitas una carta de presentación?
        </h2>
        <div className={styles.caseStudyCard}>
          <p className={styles.caseStudySituation}>
            La carta de presentación ya no es imprescindible: su uso ha bajado mucho y muchas
            candidaturas se resuelven solo con el CV. Pero en algunos casos todavía suma. Esta es la
            regla práctica:
          </p>
          <div className={styles.caseStudySteps}>
            <div className={styles.caseStudyStep}>
              <span className={styles.caseStudyStepNumber} aria-hidden="true">✓</span>
              <div>
                <strong>Sí conviene:</strong> cuando la oferta la pide expresamente, en el sector
                público y académico, en empresas tradicionales, y en candidaturas espontáneas (cuando
                escribes sin que haya una oferta publicada).
              </div>
            </div>
            <div className={styles.caseStudyStep}>
              <span className={styles.caseStudyStepNumber} aria-hidden="true">✕</span>
              <div>
                <strong>No suele hacer falta:</strong> en la mayoría de ofertas online, en tecnología
                y startups, o cuando el formulario ni la contempla. En esos casos, invierte ese tiempo
                en adaptar mejor el CV.
              </div>
            </div>
            <div className={styles.caseStudyStep}>
              <span className={styles.caseStudyStepNumber} aria-hidden="true">✍️</span>
              <div>
                <strong>Si la escribes:</strong> que sea breve (media página), personalizada y que
                complemente el CV en vez de repetirlo. Responde a tres cosas: por qué ese puesto, por
                qué esa empresa y qué aportas tú en concreto.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Caso de estudio */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">📖</span>
          Ejemplo real
        </h2>
        <div className={styles.caseStudyCard}>
          <h3 className={styles.caseStudyTitle}>{caseStudy.title}</h3>
          <p className={styles.caseStudySituation}>
            <strong>Situación:</strong> {caseStudy.situation}
          </p>
          <div className={styles.caseStudySteps}>
            {caseStudy.steps.map((s, i) => (
              <div key={i} className={styles.caseStudyStep}>
                <span className={styles.caseStudyStepNumber}>{i + 1}</span>
                <div>
                  <strong>{s.tool}:</strong> {s.result}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.caseStudyConclusion}>
            <span aria-hidden="true">✅</span>
            <span><strong>Resultado:</strong> {caseStudy.conclusion}</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">❓</span>
          Preguntas frecuentes
        </h2>
        <div className={styles.faqList}>
          {faqData.map((faq, i) => (
            <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{faq.question}</span>
                <span className={styles.faqArrow} aria-hidden="true">{openFaq === i ? '▲' : '▼'}</span>
              </button>
              {openFaq === i && <div className={styles.faqAnswer}>{faq.answer}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitulo}>¿Por dónde empiezas?</h2>
        <p className={styles.ctaDesc}>Elige el primer paso según dónde estés ahora mismo:</p>
        <div className={styles.ctaBotones}>
          <Link href="/test-competencias-digitales/" className={styles.ctaBtn}>
            <span aria-hidden="true">📊</span> Mide tus competencias
          </Link>
          <Link href="/generador-curriculum/" className={styles.ctaBtnSecundario}>
            <span aria-hidden="true">📄</span> Crea tu CV
          </Link>
          <Link href="/preparar-entrevista-competencias/" className={styles.ctaBtnSecundario}>
            <span aria-hidden="true">🌟</span> Prepara la entrevista
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-primer-empleo')} />
      <ShareCard appName="guia-primer-empleo" />
      <Footer appName="guia-primer-empleo" />
    </div>
  );
}
