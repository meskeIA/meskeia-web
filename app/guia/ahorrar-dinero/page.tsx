'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaAhorrarDinero.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas disponibles para ahorrar dinero
const tools = [
  {
    id: 'control-gastos',
    name: 'Control de Gastos',
    icon: '📊',
    url: '/control-gastos/',
    question: '¿En qué me gasto realmente el dinero?',
    description: 'Registra y categoriza tus gastos para entender adónde va tu dinero cada mes.',
    step: 1,
  },
  {
    id: 'regla-50-30-20',
    name: 'Regla 50/30/20',
    icon: '🥧',
    url: '/calculadora-regla-50-30-20/',
    question: '¿Cómo distribuyo mis ingresos de forma equilibrada?',
    description: 'Divide automáticamente tu sueldo: 50% necesidades, 30% deseos, 20% ahorro e inversión.',
    step: 2,
  },
  {
    id: 'fondo-emergencia',
    name: 'Fondo de Emergencia',
    icon: '🛡️',
    url: '/calculadora-fondo-emergencia/',
    question: '¿Cuánto dinero necesito guardar para imprevistos?',
    description: 'Calcula el colchón mínimo según tus gastos fijos y situación laboral. La base de cualquier plan financiero.',
    step: 3,
  },
  {
    id: 'suscripciones',
    name: 'Control de Suscripciones',
    icon: '📱',
    url: '/calculadora-suscripciones/',
    question: '¿Cuánto me cuestan al año todas mis suscripciones?',
    description: 'Suma todas tus suscripciones recurrentes y descubre el coste real anual. Identifica cuáles cancelar.',
    step: 4,
  },
  {
    id: 'deuda',
    name: 'Eliminar Deudas',
    icon: '🧨',
    url: '/calculadora-deuda/',
    question: '¿Qué deuda pago primero para salir antes?',
    description: 'Compara el método bola de nieve vs avalancha. Descubre en qué fecha quedarás libre de deudas.',
    step: 5,
  },
  {
    id: 'inflacion',
    name: 'Calculadora de Inflación',
    icon: '📈',
    url: '/calculadora-inflacion/',
    question: '¿Cuánto vale hoy lo que ahorré hace 5 años?',
    description: 'Calcula el impacto de la inflación en tu ahorro. Descubre cuánto poder adquisitivo pierdes guardando en cuenta corriente.',
    step: 6,
  },
];

// Pasos del journey de ahorro
const journeySteps = [
  {
    number: 1,
    title: 'Conoce tus gastos reales',
    description: 'No puedes mejorar lo que no mides. El primer paso es saber exactamente en qué gastas cada euro.',
    tip: 'Muchas personas subestiman sus gastos un 20-30%. La realidad siempre sorprende.',
  },
  {
    number: 2,
    title: 'Crea tu presupuesto',
    description: 'Con la regla 50/30/20 distribuyes tu sueldo de forma estructurada y sostenible a largo plazo.',
    tip: 'Prioriza el 20% de ahorro como si fuera un gasto fijo más, no lo que sobra al final del mes.',
  },
  {
    number: 3,
    title: 'Construye tu colchón de seguridad',
    description: 'Un fondo de emergencia de 3-6 meses de gastos te protege de imprevistos sin endeudarte.',
    tip: 'Antes de invertir o pagar deudas extra, ten tu fondo de emergencia en cuenta de alta remuneración.',
  },
  {
    number: 4,
    title: 'Elimina gastos hormiga y deudas',
    description: 'Cancela las suscripciones que no usas y elige la estrategia más eficiente para liquidar tus deudas.',
    tip: 'El método avalancha ahorra más dinero en intereses, pero el bola de nieve da más motivación psicológica.',
  },
];

// FAQs comunes
const faqData = [
  {
    question: '¿Cuánto debería ahorrar al mes?',
    answer: 'La regla general es ahorrar al menos el 20% de tus ingresos netos. Si ahora mismo es imposible, empieza por el 5% e increméntalo cada 3 meses. Lo importante es crear el hábito. Un 10% es suficiente para empezar a generar un colchón significativo en 1-2 años.',
  },
  {
    question: '¿Qué es el fondo de emergencia y por qué es prioritario?',
    answer: 'El fondo de emergencia es un ahorro líquido (en cuenta corriente o de alta remuneración) equivalente a 3-6 meses de tus gastos fijos. Es prioritario porque evita que ante cualquier imprevisto (paro, avería del coche, enfermedad) tengas que endeudarte. Sin él, cualquier plan financiero se derrumba ante el primer problema.',
  },
  {
    question: '¿Conviene pagar deudas antes que ahorrar?',
    answer: 'Depende del tipo de interés de la deuda. Si la deuda tiene un interés superior al 6-8% (tarjetas, préstamos personales), conviene pagarla primero porque es "ahorro garantizado". Si el interés es bajo (hipoteca al 2-3%), puede ser más rentable invertir ese dinero. En cualquier caso, mantén siempre un fondo de emergencia mínimo.',
  },
  {
    question: '¿Cuál es el impacto real de las pequeñas suscripciones?',
    answer: 'Las suscripciones son el "gasto hormiga" del siglo XXI. Netflix + Spotify + Amazon Prime + gimnasio + apps varias pueden sumar fácilmente 150-200€/mes, es decir, 1.800-2.400€ al año. Haz el ejercicio de listar todas las tuyas: el resultado suele ser sorprendente y motiva a cancelar las que no usas.',
  },
  {
    question: '¿Cómo me protejo de la inflación si tengo el dinero en el banco?',
    answer: 'El dinero parado en una cuenta corriente sin remuneración pierde poder adquisitivo con la inflación. Las opciones más accesibles son: cuenta de alta remuneración (1-3% TAE), depósitos a plazo fijo, letras del Tesoro o fondos monetarios. Para el largo plazo, fondos indexados con exposición a renta variable han batido históricamente a la inflación.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Ana quiere salir de deudas y empezar a ahorrar de verdad',
  situation: 'Diseñadora gráfica de 29 años, sueldo neto 1.800€/mes. Tiene 4.500€ en deudas (tarjeta y préstamo personal) y llega "justa" a fin de mes. Nunca ha tenido ahorros.',
  steps: [
    { tool: 'Control de Gastos', result: 'Descubre que gasta 320€/mes en ocio y 90€/mes en suscripciones que apenas usa. Total gasto real: 1.850€ (más de lo que ingresa). El problema es el gasto, no el sueldo.' },
    { tool: 'Control de Suscripciones', result: 'Cancela 5 suscripciones innecesarias: ahorra 65€/mes. Renegocia el gimnasio a modalidad online: ahorra otros 25€/mes. Total liberado: 90€/mes.' },
    { tool: 'Eliminar Deudas', result: 'Con método bola de nieve y 200€/mes extra, queda libre de deudas en 22 meses ahorrando 480€ en intereses.' },
  ],
  conclusion: 'En 2 años: 0 deudas, fondo de emergencia de 3.600€ y 200€/mes disponibles para invertir. Todo con el mismo sueldo.',
};

export default function GuiaAhorrarDineroPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>💰</span>
        <h1 className={styles.title}>Guía para Ahorrar Dinero</h1>
        <p className={styles.subtitle}>
          Controla tus gastos, elimina deudas y construye tu colchón de seguridad.
          Paso a paso, con herramientas gratuitas.
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
            <span className={styles.heroStatNumber}>100%</span>
            <span className={styles.heroStatLabel}>Gratuito</span>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="high"
      />

      {/* Journey Steps */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🗺️</span>
          Tu camino hacia el ahorro
        </h2>
        <div className={styles.journeyGrid}>
          {journeySteps.map((step) => (
            <div key={step.number} className={styles.journeyCard}>
              <div className={styles.journeyNumber}>{step.number}</div>
              <h3 className={styles.journeyTitle}>{step.title}</h3>
              <p className={styles.journeyDescription}>{step.description}</p>
              <div className={styles.journeyTip}>
                <span className={styles.tipIcon}>💡</span>
                <span>{step.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Caso de Estudio */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📖</span>
          Ejemplo real
        </h2>
        <div className={styles.caseStudyCard}>
          <h3 className={styles.caseStudyTitle}>{caseStudy.title}</h3>
          <p className={styles.caseStudySituation}>
            <strong>Situación:</strong> {caseStudy.situation}
          </p>
          <div className={styles.caseStudySteps}>
            {caseStudy.steps.map((step, index) => (
              <div key={index} className={styles.caseStudyStep}>
                <span className={styles.caseStudyStepNumber}>{index + 1}</span>
                <div>
                  <strong>{step.tool}:</strong> {step.result}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.caseStudyConclusion}>
            <span className={styles.conclusionIcon}>✅</span>
            <span><strong>Conclusión:</strong> {caseStudy.conclusion}</span>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🧰</span>
          Herramientas disponibles
        </h2>
        <p className={styles.toolsSubtitle}>
          Úsalas en el orden que necesites. No tienes que seguirlas todas de golpe.
        </p>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.url} className={styles.toolCard}>
              <div className={styles.toolHeader}>
                <span className={styles.toolIcon}>{tool.icon}</span>
                <span className={styles.toolStep}>Paso {tool.step}</span>
              </div>
              <h3 className={styles.toolName}>{tool.name}</h3>
              <p className={styles.toolQuestion}>{tool.question}</p>
              <p className={styles.toolDescription}>{tool.description}</p>
              <span className={styles.toolCta}>Usar herramienta →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>❓</span>
          Preguntas frecuentes
        </h2>
        <div className={styles.faqList}>
          {faqData.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={`${styles.faqQuestion} ${openFaq === index ? styles.faqQuestionOpen : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                aria-expanded={openFaq === index}
              >
                <span>{faq.question}</span>
                <span className={styles.faqToggle}>{openFaq === index ? '−' : '+'}</span>
              </button>
              {openFaq === index && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Listo para tomar el control?</h2>
        <p className={styles.ctaText}>
          Empieza registrando tus gastos del último mes.
          En 10 minutos sabrás exactamente por qué no llega el dinero a fin de mes.
        </p>
        <Link href="/control-gastos/" className={styles.ctaButton}>
          Controlar mis gastos
        </Link>
      </section>

      {/* Cross-linking */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📚</span>
          Otras guías que te pueden interesar
        </h2>
        <div className={styles.otherGuidesGrid}>
          <Link href="/guia/invertir/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>📈</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía para Invertir</h3>
              <p className={styles.otherGuideDescription}>Haz crecer lo que ahorras</p>
            </div>
          </Link>
          <Link href="/guia/comprar-casa/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>🏠</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Comprar Casa</h3>
              <p className={styles.otherGuideDescription}>Tu mayor decisión financiera</p>
            </div>
          </Link>
          <Link href="/guia/montar-negocio/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>🚀</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Montar un Negocio</h3>
              <p className={styles.otherGuideDescription}>Valida antes de invertir</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-ahorrar-dinero')} />
      <Footer appName="guia-ahorrar-dinero" />
    </div>
  );
}
