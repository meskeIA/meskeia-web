'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaComprarCasa.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas disponibles para compra de vivienda
const tools = [
  {
    id: 'simulador-hipoteca',
    name: 'Simulador de Hipoteca',
    icon: '🏦',
    url: '/simulador-hipoteca/',
    question: '¿Cuánto pagaré de cuota mensual?',
    description: 'Calcula tu cuota según capital, plazo e interés. Compara escenarios con diferentes tipos de interés.',
    step: 1,
  },
  {
    id: 'simulador-compraventa',
    name: 'Gastos de Compraventa',
    icon: '📋',
    url: '/simulador-compraventa-inmueble/',
    question: '¿Cuánto me costará la compra además del precio?',
    description: 'ITP o IVA, notaría, registro, gestoría, plusvalía... Todos los gastos que debes prever.',
    step: 2,
  },
  {
    id: 'alquiler-vs-compra',
    name: 'Alquiler vs Compra',
    icon: '⚖️',
    url: '/calculadora-alquiler-vs-compra/',
    question: '¿Me conviene más comprar o seguir alquilando?',
    description: 'Análisis financiero a largo plazo. Compara el coste real de cada opción en tu situación.',
    step: 3,
  },
  {
    id: 'amortizacion-hipoteca',
    name: 'Amortización Anticipada',
    icon: '💰',
    url: '/amortizacion-hipoteca/',
    question: '¿Reduzco cuota o reduzco plazo?',
    description: 'Simula el impacto de amortizar anticipadamente. Descubre cuánto ahorras en intereses.',
    step: 4,
  },
  {
    id: 'coste-vivienda',
    name: 'Coste Real de Vivienda',
    icon: '🏠',
    url: '/calculadora-coste-vivienda/',
    question: '¿Cuánto me cuesta realmente mantener mi casa?',
    description: 'Hipoteca, comunidad, IBI, seguros, suministros... El coste mensual real de ser propietario.',
    step: 5,
  },
];

// Pasos del journey de compra
const journeySteps = [
  {
    number: 1,
    title: 'Evalúa tu capacidad',
    description: 'Antes de buscar piso, calcula cuánto puedes pagar de hipoteca sin ahogarte.',
    tip: 'La regla general: la cuota no debe superar el 30-35% de tus ingresos netos.',
  },
  {
    number: 2,
    title: 'Calcula los gastos',
    description: 'El precio del piso no es todo. Suma un 10-12% extra en gastos de compraventa.',
    tip: 'No olvides tener ahorrado el 20% de entrada + gastos. Los bancos no suelen financiar más del 80%.',
  },
  {
    number: 3,
    title: 'Compara opciones',
    description: 'Comprar no siempre es mejor que alquilar. Depende de tu situación y planes.',
    tip: 'Si vas a mudarte en menos de 5 años, probablemente alquilar sea mejor opción.',
  },
  {
    number: 4,
    title: 'Optimiza tu hipoteca',
    description: 'Una vez compres, puedes amortizar anticipadamente para ahorrar intereses.',
    tip: 'Reducir plazo ahorra más intereses, pero reducir cuota da más flexibilidad mensual.',
  },
];

// FAQs comunes
const faqData = [
  {
    question: '¿Cuánto dinero necesito ahorrado para comprar?',
    answer: 'Necesitas aproximadamente el 30% del precio de la vivienda: 20% para la entrada (los bancos suelen financiar máximo 80%) y un 10% adicional para los gastos de compraventa (ITP/IVA, notaría, registro, gestoría).',
  },
  {
    question: '¿Qué es mejor, tipo fijo o variable?',
    answer: 'Depende de tu perfil de riesgo. El tipo fijo te da estabilidad y previsibilidad en la cuota. El variable puede ser más barato inicialmente pero fluctúa con el Euríbor. Si prefieres seguridad, fijo. Si crees que los tipos bajarán o necesitas cuota inicial baja, variable.',
  },
  {
    question: '¿Qué impuestos pago al comprar vivienda?',
    answer: 'Si es vivienda nueva: IVA (10%) + AJD (0.5-1.5% según comunidad). Si es de segunda mano: ITP (4-10% según comunidad). Además, siempre pagas notaría, registro y gestoría.',
  },
  {
    question: '¿Puedo deducirme la hipoteca en la declaración?',
    answer: 'Solo si compraste tu vivienda habitual antes del 1 de enero de 2013 y ya te la estabas deduciendo. Para compras posteriores, no hay deducción estatal por vivienda habitual (aunque algunas comunidades tienen deducciones autonómicas por alquiler).',
  },
  {
    question: '¿Cuándo conviene amortizar anticipadamente?',
    answer: 'Generalmente conviene cuando tienes ahorros extra y tu hipoteca tiene un tipo de interés alto. Pero antes de amortizar, asegúrate de tener un fondo de emergencia y de que no te cobran comisión por amortización anticipada excesiva.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'María y Carlos quieren comprar su primera vivienda',
  situation: 'Pareja de 32 años, ingresos netos conjuntos de 3.500€/mes, ahorrados 45.000€. Buscan piso de unos 200.000€ en Madrid.',
  steps: [
    { tool: 'Simulador de Hipoteca', result: 'Con 160.000€ de hipoteca a 25 años al 3%, cuota de 758€/mes (21% de ingresos). Viable.' },
    { tool: 'Gastos de Compraventa', result: 'En Madrid, ITP 6% + gastos ≈ 18.000€. Total necesario: 40.000€ entrada + 18.000€ gastos = 58.000€.' },
    { tool: 'Alquiler vs Compra', result: 'Pagando 1.100€ de alquiler actual, comprar sale mejor a partir del año 7. Planean quedarse 10+ años.' },
  ],
  conclusion: 'Necesitan ahorrar 13.000€ más antes de poder comprar. Decisión: esperar 8-10 meses ahorrando 1.500€/mes.',
};

export default function GuiaComprarCasaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🏠</span>
        <h1 className={styles.title}>Guía para Comprar Casa</h1>
        <p className={styles.subtitle}>
          Todo lo que necesitas calcular antes de comprar vivienda en España.
          Desde la hipoteca hasta los gastos ocultos.
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

      {/* Journey Steps */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🗺️</span>
          Tu camino hacia la compra
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
          Usa las que necesites, en el orden que prefieras. No es un proceso lineal.
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
        <h2 className={styles.ctaTitle}>¿Listo para dar el paso?</h2>
        <p className={styles.ctaText}>
          Empieza calculando cuánto puedes permitirte de hipoteca.
          Es el primer paso para saber qué vivienda buscar.
        </p>
        <Link href="/simulador-hipoteca/" className={styles.ctaButton}>
          Simular mi hipoteca
        </Link>
      </section>

      {/* Cross-linking */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📚</span>
          Otras guías que te pueden interesar
        </h2>
        <div className={styles.otherGuidesGrid}>
          <Link href="/guia/emprendedor/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>🚀</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía para Emprender</h3>
              <p className={styles.otherGuideDescription}>Si vas a montar tu negocio</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-comprar-casa')} />
      <Footer appName="guia-comprar-casa" />
    </div>
  );
}
